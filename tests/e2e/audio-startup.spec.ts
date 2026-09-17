import { test, expect } from '@playwright/test';
import type { MainMenuScene } from '../../src/scenes/MainMenuScene';
import type { CityScene } from '../../src/scenes/CityScene';

for (const audio of ['valid', 'undecodable', 'missing']) {
	test(`normal URL boots and city plays with ${audio} audio`, async ({ page, browserName }) => {
		const errors: string[] = [];
		page.on('pageerror', (error) => errors.push(error.message));
		if (audio === 'missing') await page.route('**/*.mp3', (route) => route.abort());
		if (audio === 'undecodable') {
			await page.route('**/*.mp3', (route) =>
				route.fulfill({
					status: 200,
					contentType: 'audio/mpeg',
					body: 'unsupported audio content',
				})
			);
		}
		await page.goto('/');
		await page.waitForFunction(
			() => {
				const menu = window.game?.scene.getScene('MainMenuScene') as MainMenuScene | undefined;
				return window.game?.scene.isActive('MainMenuScene') && !!menu?.cityText;
			},
			undefined,
			{ timeout: 30000 }
		);
		const menu = await page.evaluate(() => {
			const scene = window.game.scene.getScene('MainMenuScene') as MainMenuScene;
			return {
				x: scene.cityText!.x,
				y: scene.cityText!.y,
				audio: scene.cache.audio.exists('forest'),
				duration: (scene.cache.audio.get('forest') as AudioBuffer)?.duration,
			};
		});
		expect(menu.audio).toBe(true);
		if (audio === 'valid' && browserName === 'chromium') expect(menu.duration).toBeGreaterThan(1);
		await page.mouse.click(menu.x, menu.y);
		await page.waitForFunction(() => window.game.scene.isActive('CityScene'));
		await page.keyboard.press('e');
		await expect
			.poll(() => page.evaluate(() => (window.game.scene.getScene('CityScene') as CityScene).simulation.job))
			.toBe('carrying');
		await page.keyboard.press('f');
		await expect
			.poll(() => page.evaluate(() => (window.game.scene.getScene('CityScene') as CityScene).simulation.driving))
			.toBe(true);
		await page.keyboard.press('Escape');
		await page.waitForFunction(() => window.game.scene.isActive('MainMenuScene'));
		const start = await page.evaluate(() => {
			const scene = window.game.scene.getScene('MainMenuScene') as MainMenuScene;
			return { x: scene.gameStartText!.x, y: scene.gameStartText!.y };
		});
		await page.mouse.click(start.x, start.y);
		await page.waitForFunction(() => window.game.scene.isActive('MainScene'));
		await page.waitForFunction(() => !!window.nq?.player());
		await expect
			.poll(() => page.evaluate(() => (window.game.sound as Phaser.Sound.WebAudioSoundManager).context.state))
			.toBe('running');
		expect(errors).toEqual([]);
	});
}
