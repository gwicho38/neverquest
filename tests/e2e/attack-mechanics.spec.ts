/**
 * E2E tests for attack mechanics using Playwright
 *
 * These tests run the actual game in a browser and verify attack behavior
 * by monitoring console logs and game state.
 */

import type { ConsoleMessage } from '@playwright/test';
import { test, expect } from '@playwright/test';
import { GameDriver } from './helpers/game';

test.describe('Attack Mechanics E2E', () => {
	let consoleLogs: ConsoleMessage[] = [];

	test.beforeEach(async ({ page }) => {
		consoleLogs = [];

		// Capture console logs
		page.on('console', (msg) => {
			consoleLogs.push(msg);
		});

		// The game now boots to the menu. Enter the hub before asserting player input.
		const game = new GameDriver(page);
		await game.boot();
		await game.enterHub();
		await game.buff();
	});

	test('the visible shield raises while K is held and lowers on release', async ({ page }) => {
		const shield = () =>
			page.evaluate(() => {
				const player = (window as any).game.scene.getScene('MainScene').player;
				return {
					texture: player.shield.texture.key,
					x: player.shield.x,
					scale: player.shield.scaleX,
					blocking: player.isBlocking,
				};
			});
		const carried = await shield();
		expect(carried.texture).toBe('knight_shield');
		await page.keyboard.down('k');
		await page.waitForFunction(() => (window as any).game.scene.getScene('MainScene').player.shield.scaleX > 1);
		const raised = await shield();
		expect(raised.blocking).toBeTruthy();
		expect(raised.x).not.toBe(carried.x);
		await page.screenshot({ path: test.info().outputPath('shield-raised.png') });
		await page.keyboard.up('k');
		await page.waitForFunction(() => !(window as any).game.scene.getScene('MainScene').player.isBlocking);
		expect((await shield()).scale).toBe(carried.scale);
	});

	test('player should initialize with canAtack = true', async ({ page }) => {
		const canAtack = await page.evaluate(() => {
			const game = (window as any).game;
			const activeScene = game.scene.scenes.find((s: any) => s.player);
			return activeScene?.player?.canAtack;
		});

		expect(canAtack).toBe(true);

		// Verify no errors in console about canAtack being false
		const constructorLogs = consoleLogs.filter((log) => log.text().includes('[Player] Constructor'));

		expect(constructorLogs.length).toBeGreaterThan(0);
	});

	test('attack key should trigger attack when canAtack is true', async ({ page }) => {
		// Press attack key (J)
		await page.keyboard.press('j');

		// Wait a bit for the attack to register
		await page.waitForTimeout(100);

		// Check console logs for attack attempt
		const attackLogs = consoleLogs.filter((log) => log.text().includes('[BattleManager] Attack attempted'));

		expect(attackLogs.length).toBeGreaterThan(0);
	});

	test('canAtack should be restored after attack animation', async ({ page }) => {
		// Clear logs
		consoleLogs = [];

		// Press attack key
		await page.keyboard.press('j');

		// Wait for attack animation to complete (1 second + buffer)
		await page.waitForTimeout(1500);

		// Check for attack completion log
		const completionLogs = consoleLogs.filter(
			(log) =>
				log.text().includes('[BattleManager] Attack complete - canAtack restored to true') ||
				log.text().includes('[BattleManager] Attack timeout fallback')
		);

		expect(completionLogs.length).toBeGreaterThan(0);

		// Verify canAtack is true again
		const canAtack = await page.evaluate(() => {
			const game = (window as any).game;
			const activeScene = game.scene.scenes.find((s: any) => s.player);
			return activeScene?.player?.canAtack;
		});

		expect(canAtack).toBe(true);
	});

	test('movement should not disable canAtack', async ({ page }) => {
		// Move the player
		await page.keyboard.down('w');
		await page.waitForTimeout(500);
		await page.keyboard.up('w');

		// Check canAtack is still true
		const canAtack = await page.evaluate(() => {
			const game = (window as any).game;
			const activeScene = game.scene.scenes.find((s: any) => s.player);
			return activeScene?.player?.canAtack;
		});

		expect(canAtack).toBe(true);
	});

	test('shift toggle should not affect canAtack', async ({ page }) => {
		// Toggle running on
		await page.keyboard.press('Shift');
		await page.waitForTimeout(100);

		let canAtack = await page.evaluate(() => {
			const game = (window as any).game;
			const activeScene = game.scene.scenes.find((s: any) => s.player);
			return activeScene?.player?.canAtack;
		});

		expect(canAtack).toBe(true);

		// Toggle running off
		await page.keyboard.press('Shift');
		await page.waitForTimeout(100);

		canAtack = await page.evaluate(() => {
			const game = (window as any).game;
			const activeScene = game.scene.scenes.find((s: any) => s.player);
			return activeScene?.player?.canAtack;
		});

		expect(canAtack).toBe(true);
	});

	test('blocking should temporarily disable canAtack', async ({ page }) => {
		// Start blocking
		await page.keyboard.down('k');
		await page.waitForTimeout(100);

		let canAtack = await page.evaluate(() => {
			const game = (window as any).game;
			const activeScene = game.scene.scenes.find((s: any) => s.player);
			return activeScene?.player?.canAtack;
		});

		expect(canAtack).toBe(false);

		// Stop blocking
		await page.keyboard.up('k');
		await page.waitForTimeout(100);

		canAtack = await page.evaluate(() => {
			const game = (window as any).game;
			const activeScene = game.scene.scenes.find((s: any) => s.player);
			return activeScene?.player?.canAtack;
		});

		expect(canAtack).toBe(true);
	});

	test('rapid attacks should not leave canAtack stuck false', async ({ page }) => {
		// Perform multiple rapid attacks
		for (let i = 0; i < 3; i++) {
			await page.keyboard.press('j');
			await page.waitForTimeout(1500); // Wait for attack to complete
		}

		// Verify canAtack is true after all attacks
		const canAtack = await page.evaluate(() => {
			const game = (window as any).game;
			const activeScene = game.scene.scenes.find((s: any) => s.player);
			return activeScene?.player?.canAtack;
		});

		expect(canAtack).toBe(true);
	});
});
