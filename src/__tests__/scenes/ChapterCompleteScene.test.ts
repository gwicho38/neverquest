/**
 * Tests for ChapterCompleteScene
 */

import { ChapterCompleteScene, ChapterCompleteSceneName } from '../../scenes/ChapterCompleteScene';

jest.mock('../../consts/Colors', () => ({
	HexColors: {
		WHITE: '#ffffff',
		BLACK: '#000000',
		GRAY_DARK: '#333333',
		GRAY_MEDIUM: '#666666',
		YELLOW_LIGHT: '#ffee88',
		GREEN_LIGHT: '#44ff44',
	},
	NumericColors: {
		BLACK: 0x000000,
	},
}));

jest.mock('../../consts/Numbers', () => ({
	Depth: { UI: 100, UI_OVERLAY: 101 },
	Dimensions: { BUTTON_SPACING_LARGE: 140 },
	Scale: { SLIGHTLY_LARGE_PULSE: 1.1 },
}));

describe('ChapterCompleteScene', () => {
	let scene: ChapterCompleteScene;
	let mockText: any;
	let mockRectangle: any;
	let mockKeyboard: any;
	let mockSceneManager: any;

	beforeEach(() => {
		jest.clearAllMocks();

		mockRectangle = {
			setScrollFactor: jest.fn().mockReturnThis(),
			setDepth: jest.fn().mockReturnThis(),
		};

		mockText = {
			setOrigin: jest.fn().mockReturnThis(),
			setScrollFactor: jest.fn().mockReturnThis(),
			setDepth: jest.fn().mockReturnThis(),
			setInteractive: jest.fn().mockReturnThis(),
			setStyle: jest.fn().mockReturnThis(),
			on: jest.fn().mockReturnThis(),
			destroy: jest.fn(),
		};

		mockKeyboard = { on: jest.fn() };

		mockSceneManager = {
			stop: jest.fn(),
			start: jest.fn(),
			launch: jest.fn(),
			isActive: jest.fn().mockReturnValue(false),
			key: ChapterCompleteSceneName,
		};

		scene = new ChapterCompleteScene();
		(scene as any).cameras = { main: { width: 800, height: 600 } };
		(scene as any).add = {
			rectangle: jest.fn().mockReturnValue(mockRectangle),
			text: jest.fn().mockReturnValue(mockText),
		};
		(scene as any).tweens = { add: jest.fn().mockReturnValue({}) };
		(scene as any).input = { keyboard: mockKeyboard };
		(scene as any).scene = mockSceneManager;
		(scene as any).time = {
			delayedCall: jest.fn().mockImplementation((_delay: number, cb: () => void) => cb()),
		};
	});

	it('has the correct scene key', () => {
		expect(ChapterCompleteSceneName).toBe('ChapterCompleteScene');
	});

	it('defaults the return scene to MainScene', () => {
		scene.init({});
		expect((scene as any).returnScene).toBe('MainScene');
	});

	it('uses a provided return scene', () => {
		scene.init({ returnScene: 'DungeonScene' });
		expect((scene as any).returnScene).toBe('DungeonScene');
	});

	it('builds the overlay, title and buttons on create', () => {
		scene.init({});
		scene.create();

		expect((scene as any).add.rectangle).toHaveBeenCalled();
		// Title + subtitle + flavor + 2 buttons = at least 5 text objects
		expect((scene as any).add.text.mock.calls.length).toBeGreaterThanOrEqual(5);
	});

	it('registers Continue and Main Menu keyboard handlers', () => {
		scene.init({});
		scene.create();

		const keys = mockKeyboard.on.mock.calls.map((call: unknown[]) => call[0]);
		expect(keys).toContain('keydown-C');
		expect(keys).toContain('keydown-ESC');
	});

	it('continueGame stops the overlay and resumes the hub when inactive', () => {
		scene.init({ returnScene: 'MainScene' });
		mockSceneManager.isActive.mockReturnValue(false);

		scene.continueGame();

		expect(mockSceneManager.stop).toHaveBeenCalledWith(ChapterCompleteSceneName);
		expect(mockSceneManager.start).toHaveBeenCalledWith('MainScene');
	});

	it('continueGame does not restart the hub when it is already active', () => {
		scene.init({ returnScene: 'MainScene' });
		mockSceneManager.isActive.mockReturnValue(true);

		scene.continueGame();

		expect(mockSceneManager.start).not.toHaveBeenCalled();
	});

	it('returnToMainMenu stops gameplay and starts the main menu', () => {
		scene.init({ returnScene: 'DungeonScene' });

		scene.returnToMainMenu();

		expect(mockSceneManager.stop).toHaveBeenCalledWith(ChapterCompleteSceneName);
		expect(mockSceneManager.stop).toHaveBeenCalledWith('DungeonScene');
		expect(mockSceneManager.start).toHaveBeenCalledWith('MainMenuScene');
	});

	it('closes the paused guardian encounter when returning to the village', () => {
		scene.init({ returnScene: 'MainScene', encounterScene: 'DungeonScene' });
		scene.continueGame();
		expect(mockSceneManager.stop).toHaveBeenCalledWith('DungeonScene');
		expect(mockSceneManager.start).toHaveBeenCalledWith('MainScene');
	});
});
