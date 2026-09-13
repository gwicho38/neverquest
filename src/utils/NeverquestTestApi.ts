/**
 * @fileoverview window.nq — a dev-only automation/test driver for the game.
 *
 * Phaser games run in a browser, so the cleanest way to drive and verify them
 * (from Playwright, the console, or an AI agent) is a small, stable scripting
 * surface on `window`. This is that surface.
 *
 * It complements `window.neverquestDebug` (interactive debugging) with the
 * primitives needed to *test* the game: read/advance story flags and quests,
 * start scenes, drive real keyboard input, and snapshot state for assertions —
 * plus a few high-level Chapter 1 helpers.
 *
 * Installed only outside production builds (see index.ts). The matching e2e
 * harness lives in `tests/e2e/helpers/game.ts`.
 *
 * @example
 *   // In the browser console or a Playwright page.evaluate:
 *   nq.ready();                       // game booted?
 *   nq.start('MainScene');            // jump into the hub
 *   nq.flags.set('met_elder');        // advance the story via the real event bus
 *   nq.quest('cave_artifact');        // 'active'
 *   await nq.hold('ArrowRight', 600); // walk east
 *   nq.completeChapter();             // fire all Act 1 beats
 *   nq.snapshot();                    // structured state for assertions
 *
 * @module utils/NeverquestTestApi
 */

import Phaser from 'phaser';
import { GameEvents, RegistryKeys } from '../consts/Events';
import { NeverquestStoryFlags } from '../plugins/NeverquestStoryFlags';
import { ACT_1_QUEST_CHAIN, QUEST_DEFINITIONS, QUEST_FLAG_MAP } from '../consts/progression/QuestFlagMap';

/** Keyboard descriptors for synthetic input (code + keyCode + key). */
const KEYS: Record<string, { code: string; keyCode: number; key: string }> = {
	ArrowUp: { code: 'ArrowUp', keyCode: 38, key: 'ArrowUp' },
	ArrowDown: { code: 'ArrowDown', keyCode: 40, key: 'ArrowDown' },
	ArrowLeft: { code: 'ArrowLeft', keyCode: 37, key: 'ArrowLeft' },
	ArrowRight: { code: 'ArrowRight', keyCode: 39, key: 'ArrowRight' },
	w: { code: 'KeyW', keyCode: 87, key: 'w' },
	a: { code: 'KeyA', keyCode: 65, key: 'a' },
	s: { code: 'KeyS', keyCode: 83, key: 's' },
	d: { code: 'KeyD', keyCode: 68, key: 'd' },
	j: { code: 'KeyJ', keyCode: 74, key: 'j' }, // attack
	k: { code: 'KeyK', keyCode: 75, key: 'k' }, // block
	h: { code: 'KeyH', keyCode: 72, key: 'h' }, // journal
	q: { code: 'KeyQ', keyCode: 81, key: 'q' }, // quest log
	e: { code: 'KeyE', keyCode: 69, key: 'e' }, // interact
	c: { code: 'KeyC', keyCode: 67, key: 'c' },
	Space: { code: 'Space', keyCode: 32, key: ' ' },
	Enter: { code: 'Enter', keyCode: 13, key: 'Enter' },
	Escape: { code: 'Escape', keyCode: 27, key: 'Escape' },
	Shift: { code: 'ShiftLeft', keyCode: 16, key: 'Shift' },
};

/** A minimal player snapshot for assertions. */
export interface ITestPlayerSnapshot {
	x: number;
	y: number;
	speed: number;
	baseSpeed: number;
	runSpeed: number;
	health: number;
	isRunning: boolean;
}

/** Structured game-state snapshot for assertions. */
export interface ITestSnapshot {
	ready: boolean;
	activeScenes: string[];
	player: ITestPlayerSnapshot | null;
	flags: string[];
	quests: Record<string, string>;
}

/** The public window.nq surface. */
export interface INeverquestTestApi {
	ready(): boolean;
	activeScenes(): string[];
	isActive(key: string): boolean;
	start(key: string, data?: object): void;
	player(): ITestPlayerSnapshot | null;
	teleport(x: number, y: number): void;
	buff(): void;
	flags: {
		has(flag: string): boolean;
		set(flag: string): void;
		all(): string[];
	};
	quest(id: string): string;
	gotoElder(): boolean;
	warpToDungeon(): void;
	clearDungeon(): void;
	completeChapter(): void;
	press(key: string): void;
	hold(key: string, ms: number): Promise<void>;
	snapshot(): ITestSnapshot;
	help(): void;
}

function getGame(): Phaser.Game | undefined {
	return (window as unknown as { game?: Phaser.Game }).game;
}

/** The active scene that owns the player (MainScene / DungeonScene / a biome). */
function gameplayScene(): (Phaser.Scene & { player?: unknown; events: Phaser.Events.EventEmitter }) | undefined {
	const game = getGame();
	if (!game) return undefined;
	const scenes = game.scene.getScenes(true) as Array<Phaser.Scene & { player?: unknown }>;
	return scenes.find((s) => !!s.player) as never;
}

function getStoryFlags(): NeverquestStoryFlags | undefined {
	return getGame()?.registry.get(RegistryKeys.STORY_FLAGS) as NeverquestStoryFlags | undefined;
}

function dispatchKey(type: 'keydown' | 'keyup', name: string): void {
	const desc = KEYS[name];
	if (!desc) {
		console.warn('[nq] unknown key:', name);
		return;
	}
	[window, document].forEach((target) => {
		const event = new KeyboardEvent(type, { code: desc.code, key: desc.key, bubbles: true });
		Object.defineProperty(event, 'keyCode', { get: () => desc.keyCode });
		Object.defineProperty(event, 'which', { get: () => desc.keyCode });
		target.dispatchEvent(event);
	});
}

/**
 * Installs the `window.nq` test/automation driver. Call once after the game is
 * created (dev builds only).
 */
export function installNeverquestTestApi(): void {
	if (typeof window === 'undefined') return;

	const api: INeverquestTestApi = {
		ready(): boolean {
			return !!gameplayScene()?.player || (getGame()?.scene.getScenes(true).length ?? 0) > 0;
		},
		activeScenes(): string[] {
			return (getGame()?.scene.getScenes(true) ?? []).map((s) => s.scene.key);
		},
		isActive(key: string): boolean {
			return !!getGame()?.scene.isActive(key);
		},
		start(key: string, data?: object): void {
			getGame()?.scene.start(key, data);
		},
		player(): ITestPlayerSnapshot | null {
			const p = gameplayScene()?.player as
				| {
						container?: { x: number; y: number };
						speed?: number;
						baseSpeed?: number;
						runSpeed?: number;
						isRunning?: boolean;
						attributes?: { health?: number };
				  }
				| undefined;
			if (!p || !p.container) return null;
			return {
				x: Math.round(p.container.x),
				y: Math.round(p.container.y),
				speed: p.speed ?? 0,
				baseSpeed: p.baseSpeed ?? 0,
				runSpeed: p.runSpeed ?? 0,
				health: p.attributes?.health ?? 0,
				isRunning: !!p.isRunning,
			};
		},
		teleport(x: number, y: number): void {
			const p = gameplayScene()?.player as
				| { container?: { x: number; y: number; body?: { reset?: (x: number, y: number) => void } } }
				| undefined;
			if (!p?.container) return;
			p.container.x = x;
			p.container.y = y;
			p.container.body?.reset?.(x, y);
		},
		buff(): void {
			const p = gameplayScene()?.player as { attributes?: Record<string, number> } | undefined;
			if (!p?.attributes) return;
			p.attributes.health = 99999;
			p.attributes.maxHealth = 99999;
			p.attributes.baseHealth = 99999;
		},
		flags: {
			has(flag: string): boolean {
				return !!getStoryFlags()?.hasFlag(flag as never);
			},
			set(flag: string): void {
				// Go through the real event bus so the bridge + quest FSM react.
				gameplayScene()?.events.emit(GameEvents.SET_STORY_FLAG, flag);
			},
			all(): string[] {
				return (getStoryFlags()?.getAllFlags() ?? []) as string[];
			},
		},
		quest(id: string): string {
			const qm = getGame()?.registry.get(RegistryKeys.QUEST_MANAGER) as
				| { getState(id: string): string }
				| undefined;
			return qm ? qm.getState(id) : 'unknown';
		},
		gotoElder(): boolean {
			const scene = gameplayScene() as
				| (Phaser.Scene & { npcManager?: { getNPC(id: string): { x: number; y: number } | undefined } })
				| undefined;
			const elder = scene?.npcManager?.getNPC('village_elder');
			if (!elder) return false;
			this.teleport(elder.x, elder.y);
			return true;
		},
		warpToDungeon(): void {
			const source = gameplayScene();
			if (source) {
				source.scene.start('DungeonScene', { previousScene: source.scene.key });
			} else {
				getGame()?.scene.start('DungeonScene', { previousScene: 'MainScene' });
			}
		},
		clearDungeon(): void {
			const dz = getGame()?.scene.getScene('DungeonScene') as
				| (Phaser.Scene & { enemies?: Array<{ attributes: { health: number } }> })
				| undefined;
			if (!dz) return;
			for (const enemy of dz.enemies ?? []) {
				enemy.attributes.health = 0;
				dz.events.emit(GameEvents.ENEMY_DEFEATED, 'Enemy');
			}
		},
		completeChapter(): void {
			const scene = gameplayScene();
			if (!scene) return;
			ACT_1_QUEST_CHAIN.map((questId) => QUEST_FLAG_MAP[questId]).forEach((flag) => {
				scene.events.emit(GameEvents.SET_STORY_FLAG, flag);
			});
		},
		press(key: string): void {
			dispatchKey('keydown', key);
			dispatchKey('keyup', key);
		},
		hold(key: string, ms: number): Promise<void> {
			dispatchKey('keydown', key);
			return new Promise((resolve) => {
				window.setTimeout(() => {
					dispatchKey('keyup', key);
					resolve();
				}, ms);
			});
		},
		snapshot(): ITestSnapshot {
			const quests: Record<string, string> = {};
			QUEST_DEFINITIONS.forEach((quest) => {
				quests[quest.id] = api.quest(quest.id);
			});
			return {
				ready: api.ready(),
				activeScenes: api.activeScenes(),
				player: api.player(),
				flags: api.flags.all(),
				quests,
			};
		},
		help(): void {
			console.log(
				[
					'🧪 window.nq — game test/automation driver',
					'  nq.ready() / nq.activeScenes() / nq.isActive(key)',
					"  nq.start('MainScene', data?)   — start a scene",
					'  nq.player() / nq.teleport(x,y) / nq.buff()',
					"  nq.flags.set('met_elder') / .has(flag) / .all()",
					"  nq.quest('cave_artifact')      — FSM state",
					'  nq.gotoElder() / nq.warpToDungeon() / nq.clearDungeon() / nq.completeChapter()',
					"  await nq.hold('ArrowRight', 600) / nq.press('h')",
					'  nq.snapshot()                  — structured state for assertions',
				].join('\n')
			);
		},
	};

	(window as unknown as { nq: INeverquestTestApi }).nq = api;
	console.log('🧪 window.nq test driver ready — nq.help()');
}
