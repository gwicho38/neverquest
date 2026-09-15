import { test, expect, Page } from '@playwright/test';
import type { CityScene } from '../../src/scenes/CityScene';
import type { MainMenuScene } from '../../src/scenes/MainMenuScene';
import { CITY, CITY_JOB } from '../../src/consts/City';

async function openCity(page: Page, seedSave = false): Promise<void> {
	await page.goto('/?noaudio=1');
	await page.waitForFunction(() => window.game?.scene.isActive('MainMenuScene'), undefined, { timeout: 30000 });
	if (seedSave) {
		await page.evaluate(() => {
			const saves = (window.game.scene.getScene('MainMenuScene') as MainMenuScene).saveManager!;
			localStorage.setItem(saves.saveKey, JSON.stringify({ scene: 'MainScene', gold: 123 }));
			localStorage.setItem(saves.checkpointKey, JSON.stringify({ scene: 'DungeonScene', gold: 75 }));
		});
	}
	await clickCity(page);
}

async function clickCity(page: Page): Promise<void> {
	const point = await page.evaluate(() => {
		const menu = window.game.scene.getScene('MainMenuScene') as MainMenuScene;
		return { x: menu.cityText!.x, y: menu.cityText!.y };
	});
	await page.mouse.click(point.x, point.y);
	await page.waitForFunction(() => window.game.scene.isActive('CityScene'));
}

async function state(page: Page) {
	return page.evaluate(() => {
		const city = (window.game.scene.getScene('CityScene') as CityScene).simulation;
		return {
			position: city.position,
			driving: city.driving,
			job: city.job,
			cash: city.cash,
			speed: city.car.speed,
		};
	});
}

test('city menu, walking, driving, delivery and reward work through real input', async ({ page }, testInfo) => {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await openCity(page);
	expect((await state(page)).position).toEqual(CITY.spawn);
	await page.keyboard.down('d');
	await expect.poll(async () => (await state(page)).position.x).toBeGreaterThan(CITY.spawn.x + 15);
	await page.keyboard.up('d');
	await page.keyboard.press('e');
	await expect.poll(async () => (await state(page)).job).toBe('carrying');
	await page.screenshot({ path: testInfo.outputPath('city-prototype.png') });
	await page.keyboard.press('f');
	await expect.poll(async () => (await state(page)).driving).toBe(true);
	const start = await state(page);
	await page.keyboard.down('w');
	await expect.poll(async () => (await state(page)).position.y).toBeLessThan(start.position.y - 60);
	await page.keyboard.up('w');
	await page.keyboard.down('Space');
	await expect.poll(async () => (await state(page)).speed).toBe(0);
	await page.keyboard.up('Space');

	// Set up arrival; the long drive is covered by the simulation's collision tests.
	// Pickup, occupancy, acceleration, braking, exit and reward use real keyboard events.
	await page.evaluate((point) => {
		const city = (window.game.scene.getScene('CityScene') as CityScene).simulation;
		city.car.x = point.x;
		city.car.y = point.y;
	}, CITY_JOB.dropoff);
	await page.keyboard.press('e');
	expect((await state(page)).cash).toBe(0);
	await page.keyboard.press('f');
	await expect.poll(async () => (await state(page)).driving).toBe(false);
	await page.keyboard.press('e');
	await expect.poll(async () => (await state(page)).cash).toBe(CITY_JOB.reward);
	await page.keyboard.press('e');
	expect((await state(page)).cash).toBe(CITY_JOB.reward);
	expect(errors).toEqual([]);
});

test('city resizes and restarts cleanly without changing RPG progress', async ({ page }) => {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await openCity(page, true);
	const saves = await page.evaluate(() => JSON.stringify(localStorage));
	expect(saves).toContain('123');
	expect(saves).toContain('75');
	await page.setViewportSize({ width: 800, height: 600 });
	await page.keyboard.press('e');
	await expect.poll(async () => (await state(page)).job).toBe('carrying');
	await page.keyboard.press('Escape');
	await page.waitForFunction(() => window.game.scene.isActive('MainMenuScene'));
	await clickCity(page);
	expect((await state(page)).job).toBe('available');
	await page.keyboard.press('f');
	await expect.poll(async () => (await state(page)).driving).toBe(true);
	await page.keyboard.press('f');
	await expect.poll(async () => (await state(page)).driving).toBe(false);
	expect(await page.evaluate(() => JSON.stringify(localStorage))).toBe(saves);
	expect(errors).toEqual([]);
});
