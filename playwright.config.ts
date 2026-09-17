import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for E2E testing
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
	testDir: './tests/e2e',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: 'html',

	use: {
		baseURL: 'http://[::1]:8080',
		trace: 'on-first-retry',
		screenshot: 'only-on-failure',
	},

	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
		},
		{
			name: 'firefox-audio',
			testMatch: 'audio-startup.spec.ts',
			use: { ...devices['Desktop Firefox'] },
		},
	],

	/* Run dev server before starting tests */
	webServer: {
		command: 'npm run start',
		url: 'http://[::1]:8080',
		reuseExistingServer: !process.env.CI,
		timeout: 120000,
	},
});
