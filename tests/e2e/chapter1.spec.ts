/**
 * E2E specs for Chapter 1 — "The Awakening".
 *
 * These drive the real game in a browser via the in-page `window.nq` driver
 * (GameDriver helper). They are the committed version of the manual playthrough
 * used to verify the chapter, and they regression-guard the bugs found that way
 * (continue-crash, attack-key collision, player speed, the Elder).
 *
 * Run: `npm run test:e2e` (uses the dev server; see playwright.config.ts).
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { test, expect } from '@playwright/test';
import { GameDriver } from './helpers/game';
import { EntitySpeed } from '../../src/consts/Numbers';

test.describe('Chapter 1 — The Awakening (e2e)', () => {
	test('boots with the nq driver and no crash errors', async ({ page }) => {
		const game = new GameDriver(page);
		await game.boot();
		expect(await page.evaluate(() => (window as any).nq.ready())).toBeTruthy();
		expect(game.crashErrors()).toEqual([]);
	});

	test('player uses the configured walk and run speeds', async ({ page }) => {
		const game = new GameDriver(page);
		await game.boot();
		await game.enterHub();
		const player = await game.player();
		expect(player?.baseSpeed).toBe(EntitySpeed.PLAYER_WALK);
		expect(player?.runSpeed).toBe(EntitySpeed.PLAYER_RUN);
	});

	test('intro completes on hub entry; the first quest is active', async ({ page }) => {
		const game = new GameDriver(page);
		await game.boot();
		await game.enterHub();
		await game.waitForFlag('intro_complete');
		expect(await game.quest('intro')).toBe('complete');
		expect(await game.quest('meet_elder')).toBe('active');
	});

	test('meeting the Elder advances the quest chain', async ({ page }) => {
		const game = new GameDriver(page);
		await game.boot();
		await game.enterHub();
		await game.buff();
		expect(await game.gotoElder()).toBeTruthy();
		await game.waitForFlag('met_elder');
		expect(await game.quest('meet_elder')).toBe('complete');
		expect(await game.quest('cave_artifact')).toBe('active');
	});

	test('clearing the cave completes Chapter 1 without crashing', async ({ page }) => {
		const game = new GameDriver(page);
		await game.boot();
		await game.enterHub();
		await game.waitForFlag('intro_complete');
		await game.setFlag('met_elder');
		await game.warpToDungeon();
		await game.waitForScene('DungeonScene');
		await game.clearDungeon();
		await game.waitForScene('ChapterCompleteScene');
		expect(await game.hasFlag('act_1_complete')).toBeTruthy();
		// The boss-kill cascade should have unlocked Flame Wave.
		expect(await game.hasFlag('spell_flame_wave_unlocked')).toBeTruthy();
		expect(game.crashErrors()).toEqual([]);
	});

	test('guardian warns, can be dodged, and completes the chapter only on defeat', async ({ page }) => {
		const game = new GameDriver(page);
		await game.boot();
		await game.enterHub();
		await game.setFlag('met_elder');
		await game.warpToDungeon();
		await game.waitForScene('DungeonScene');
		const startingHealth = await page.evaluate(() => {
			const dungeon = (window as any).game.scene.getScene('DungeonScene');
			const player = dungeon.player;
			const tile = dungeon.dungeon.groundLayer.getTileAtWorldXY(player.container.x, player.container.y);
			if (!tile || tile.collides) throw new Error('The entrance spawn is not walkable');
			const guardian = dungeon.guardian.enemy;
			player.container.body.reset(guardian.container.x + 80, guardian.container.y);
			return player.attributes.health;
		});
		await page.waitForFunction(
			() => (window as any).game.scene.getScene('DungeonScene').guardian.state === 'warning'
		);
		await page.waitForFunction(() => {
			const dungeon = (window as any).game.scene.getScene('DungeonScene');
			return dungeon.fog.lastPlayerX === dungeon.player.container.x;
		});
		expect(await game.isActive('MainScene')).toBeFalsy();
		expect(await game.hasFlag('cave_boss_defeated')).toBeFalsy();
		await page.screenshot({ path: test.info().outputPath('guardian-warning.png') });
		await page.evaluate(() => {
			const dungeon = (window as any).game.scene.getScene('DungeonScene');
			const guardian = dungeon.guardian.enemy;
			dungeon.player.container.body.reset(guardian.container.x - 80, guardian.container.y);
		});
		await page.waitForFunction(
			() => (window as any).game.scene.getScene('DungeonScene').guardian.state === 'recovering'
		);
		expect(
			await page.evaluate(() => (window as any).game.scene.getScene('DungeonScene').player.attributes.health)
		).toBe(startingHealth);
		await page.evaluate(() => {
			const dungeon = (window as any).game.scene.getScene('DungeonScene');
			// Exercise real damage, XP, defeat event, quest bridge and chapter overlay.
			dungeon.player.attributes.atack = 999;
			dungeon.player.attributes.critical = 100;
			dungeon.guardian.enemy.neverquestBattleManager.takeDamage(dungeon.player, dungeon.guardian.enemy);
		});
		await game.waitForScene('ChapterCompleteScene');
		expect(await game.hasFlag('spell_flame_wave_unlocked')).toBeTruthy();
		expect(await page.evaluate(() => (window as any).game.scene.isPaused('DungeonScene'))).toBeTruthy();
		await page.evaluate(() => (window as any).game.scene.getScene('ChapterCompleteScene').continueGame());
		await page.waitForFunction(() => !(window as any).game.scene.isPaused('DungeonScene'));
		expect(await game.isActive('MainScene')).toBeTruthy();
		expect(game.crashErrors()).toEqual([]);
	});

	// The Quest Log (Q) and Journal (H) overlays must be reachable and render
	// without crashing. (The key *mapping* — Journal on H, not the J attack key —
	// is covered by a unit test; headless browsers don't deliver keyboard input
	// to Phaser, so e2e drives the overlays directly.)
	test('quest log and journal overlays are reachable and render', async ({ page }) => {
		const game = new GameDriver(page);
		await game.boot();
		await game.enterHub();

		await page.evaluate(() => (window as any).nq.start('QuestLogScene'));
		await game.waitForScene('QuestLogScene');

		await page.evaluate(() => (window as any).nq.start('JournalScene'));
		await game.waitForScene('JournalScene');

		expect(game.crashErrors()).toEqual([]);
	});
});
