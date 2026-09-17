/**
 * @fileoverview GameDriver — a thin Playwright wrapper around the in-game
 * `window.nq` test driver (see src/utils/NeverquestTestApi.ts).
 *
 * It turns "boot the game, drive it, assert state" into a few typed calls, and
 * collects page errors so specs can assert the game didn't crash. This is the
 * persisted version of the ad-hoc browser scripting used to verify Chapter 1.
 *
 * @example
 *   const game = new GameDriver(page);
 *   await game.boot();
 *   await game.enterHub();
 *   expect((await game.player())?.baseSpeed).toBe(150);
 */

import type { Page } from '@playwright/test';

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface PlayerSnapshot {
	x: number;
	y: number;
	speed: number;
	baseSpeed: number;
	runSpeed: number;
	health: number;
	isRunning: boolean;
}

const WAIT = { timeout: 30000 } as const;

export class GameDriver {
	/** Page errors + console.error messages captured during the test. */
	readonly errors: string[] = [];

	constructor(private readonly page: Page) {
		page.on('pageerror', (err) => this.errors.push(String(err)));
		page.on('console', (msg) => {
			if (msg.type() === 'error') this.errors.push(msg.text());
		});
	}

	/** Hard crash signatures (TypeErrors etc.), ignoring benign UI warnings. */
	crashErrors(): string[] {
		return this.errors.filter((e) => /TypeError|Cannot read properties|is not a function|undefined is not/.test(e));
	}

	/** Navigate to the game and wait for the nq driver to be installed. */
	async boot(): Promise<void> {
		// Isolate gameplay here; audio-startup.spec.ts covers normal audio-enabled boot.
		await this.page.goto('/?noaudio=1');
		await this.page.waitForFunction(() => !!(window as any).nq, undefined, WAIT);
		await this.page.waitForFunction(() => (window as any).nq.ready(), undefined, WAIT);
	}

	/** Start the hub (MainScene) and wait for a live player. */
	async enterHub(): Promise<void> {
		await this.page.evaluate(() => (window as any).nq.start('MainScene'));
		await this.waitForScene('MainScene');
		await this.page.waitForFunction(() => !!(window as any).nq.player(), undefined, WAIT);
	}

	async waitForScene(key: string): Promise<void> {
		await this.page.waitForFunction((k) => (window as any).nq.isActive(k), key, WAIT);
	}

	async waitForFlag(flag: string): Promise<void> {
		await this.page.waitForFunction((f) => (window as any).nq.flags.has(f), flag, WAIT);
	}

	player(): Promise<PlayerSnapshot | null> {
		return this.page.evaluate(() => (window as any).nq.player());
	}

	snapshot(): Promise<unknown> {
		return this.page.evaluate(() => (window as any).nq.snapshot());
	}

	activeScenes(): Promise<string[]> {
		return this.page.evaluate(() => (window as any).nq.activeScenes());
	}

	isActive(key: string): Promise<boolean> {
		return this.page.evaluate((k) => (window as any).nq.isActive(k), key);
	}

	quest(id: string): Promise<string> {
		return this.page.evaluate((qid) => (window as any).nq.quest(qid), id);
	}

	hasFlag(flag: string): Promise<boolean> {
		return this.page.evaluate((f) => (window as any).nq.flags.has(f), flag);
	}

	setFlag(flag: string): Promise<void> {
		return this.page.evaluate((f) => (window as any).nq.flags.set(f), flag);
	}

	buff(): Promise<void> {
		return this.page.evaluate(() => (window as any).nq.buff());
	}

	gotoElder(): Promise<boolean> {
		return this.page.evaluate(() => (window as any).nq.gotoElder());
	}

	warpToDungeon(): Promise<void> {
		return this.page.evaluate(() => (window as any).nq.warpToDungeon());
	}

	clearDungeon(): Promise<void> {
		return this.page.evaluate(() => (window as any).nq.clearDungeon());
	}

	completeChapter(): Promise<void> {
		return this.page.evaluate(() => (window as any).nq.completeChapter());
	}

	/**
	 * Key tap via the in-page synthetic dispatcher (nq.press), dispatched on
	 * `window`. Useful in HEADED runs (Playwright headed, the MCP browser, the
	 * console). NOTE: headless Chromium does not deliver keyboard input to
	 * Phaser, so committed e2e specs drive via events/state, not keys.
	 */
	async press(key: string): Promise<void> {
		await this.page.evaluate((k) => (window as any).nq.press(k), key);
	}

	/** Hold a key for `ms` via the in-page synthetic dispatcher. */
	async hold(key: string, ms: number): Promise<void> {
		await this.page.evaluate(([k, m]) => (window as any).nq.hold(k as string, m as number), [key, ms]);
	}
}
