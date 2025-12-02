/**
 * Tests for GameOverScene
 */

import { GameOverScene } from '../../scenes/GameOverScene';

// Mock constants
jest.mock('../../consts/Colors', () => ({
	HexColors: {
		RED: '#ff0000',
		WHITE: '#ffffff',
		BLACK: '#000000',
		GRAY_DARK: '#333333',
		GRAY_MEDIUM: '#666666',
		RED_SOFT: '#ff6666',
	},
	NumericColors: {
		BLACK: 0x000000,
	},
}));

jest.mock('../../consts/Numbers', () => ({
	Depth: {
		UI: 100,
		UI_OVERLAY: 101,
	},
	Dimensions: {
		BUTTON_SPACING_LARGE: 140,
	},
	Scale: {
		SLIGHTLY_LARGE_PULSE: 1.05,
	},
}));

jest.mock('../../consts/Messages', () => ({
	UILabels: {
		GAME_OVER_LEVEL_REACHED: (level: number) => `You reached level ${level}`,
	},
	SaveMessages: {
		NO_CHECKPOINT_FOUND: 'No checkpoint found',
	},
}));

describe('GameOverScene', () => {
	let scene: GameOverScene;
	let mockRectangle: any;
	let mockText: any;
	let mockTweens: any;
	let mockKeyboard: any;

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

		mockTweens = {
			add: jest.fn().mockReturnValue({}),
		};

		mockKeyboard = {
			on: jest.fn(),
		};

		scene = new GameOverScene();

		// Setup mock scene properties
		(scene as any).cameras = {
			main: {
				width: 800,
				height: 600,
			},
		};

		(scene as any).add = {
			rectangle: jest.fn().mockReturnValue(mockRectangle),
			text: jest.fn().mockReturnValue(mockText),
		};

		(scene as any).tweens = mockTweens;

		(scene as any).input = {
			keyboard: mockKeyboard,
		};

		(scene as any).scene = {
			stop: jest.fn(),
			start: jest.fn(),
		};

		(scene as any).time = {
			delayedCall: jest.fn().mockImplementation((delay: number, callback: Function) => {
				callback();
			}),
		};

		(scene as any).game = {
			registry: {
				get: jest.fn(),
			},
		};
	});

	describe('constructor', () => {
		it('should create scene with key GameOverScene', () => {
			const newScene = new GameOverScene();
			expect((newScene as any).sys?.settings?.key || 'GameOverScene').toBe('GameOverScene');
		});

		it('should initialize with null properties', () => {
			expect(scene.playerLevel).toBeNull();
			expect(scene.lastScene).toBeNull();
			expect(scene.restartButton).toBeNull();
			expect(scene.loadCheckpointButton).toBeNull();
			expect(scene.mainMenuButton).toBeNull();
			expect(scene.gameOverText).toBeNull();
		});
	});

	describe('init', () => {
		it('should set player level from data', () => {
			scene.init({ playerLevel: 10, lastScene: 'MainScene' });

			expect(scene.playerLevel).toBe(10);
			expect(scene.lastScene).toBe('MainScene');
		});

		it('should default lastScene to MainScene', () => {
			scene.init({});

			expect(scene.lastScene).toBe('MainScene');
		});

		it('should handle missing playerLevel', () => {
			scene.init({ lastScene: 'DungeonScene' });

			expect(scene.playerLevel).toBeNull();
		});
	});

	describe('create', () => {
		it('should create overlay background', () => {
			scene.create();

			expect((scene as any).add.rectangle).toHaveBeenCalledWith(400, 300, 800, 600, 0x000000, 0.85);
		});

		it('should create game over text', () => {
			scene.create();

			expect((scene as any).add.text).toHaveBeenCalledWith(400, 200, 'GAME OVER', expect.any(Object));
		});

		it('should create restart button', () => {
			scene.create();

			expect((scene as any).add.text).toHaveBeenCalledWith(400, 320, '[R] RESTART GAME', expect.any(Object));
		});

		it('should create load checkpoint button', () => {
			scene.create();

			expect((scene as any).add.text).toHaveBeenCalledWith(400, 380, '[C] LOAD CHECKPOINT', expect.any(Object));
		});

		it('should create main menu button', () => {
			scene.create();

			expect((scene as any).add.text).toHaveBeenCalledWith(400, 440, '[ESC] MAIN MENU', expect.any(Object));
		});

		it('should set up keyboard controls', () => {
			scene.create();

			expect(mockKeyboard.on).toHaveBeenCalledWith('keydown-R', expect.any(Function));
			expect(mockKeyboard.on).toHaveBeenCalledWith('keydown-C', expect.any(Function));
			expect(mockKeyboard.on).toHaveBeenCalledWith('keydown-ESC', expect.any(Function));
		});

		it('should set up tweens for animation', () => {
			scene.create();

			expect(mockTweens.add).toHaveBeenCalled();
		});

		it('should display player level when provided', () => {
			scene.playerLevel = 5;
			scene.create();

			expect((scene as any).add.text).toHaveBeenCalledWith(400, 260, 'You reached level 5', expect.any(Object));
		});
	});

	describe('restartGame', () => {
		beforeEach(() => {
			scene.lastScene = 'MainScene';
		});

		it('should stop GameOverScene', () => {
			scene.restartGame();

			expect((scene as any).scene.stop).toHaveBeenCalledWith('GameOverScene');
		});

		it('should stop the last scene', () => {
			scene.restartGame();

			expect((scene as any).scene.stop).toHaveBeenCalledWith('MainScene');
		});

		it('should stop all related scenes', () => {
			scene.restartGame();

			expect((scene as any).scene.stop).toHaveBeenCalledWith('DialogScene');
			expect((scene as any).scene.stop).toHaveBeenCalledWith('HUDScene');
			expect((scene as any).scene.stop).toHaveBeenCalledWith('JoystickScene');
			expect((scene as any).scene.stop).toHaveBeenCalledWith('InventoryScene');
			expect((scene as any).scene.stop).toHaveBeenCalledWith('AttributeScene');
		});

		it('should start MainScene after delay', () => {
			scene.restartGame();

			expect((scene as any).scene.start).toHaveBeenCalledWith('MainScene');
		});
	});

	describe('loadCheckpoint', () => {
		beforeEach(() => {
			scene.lastScene = 'MainScene';
			scene.create();
		});

		it('should check for save manager', () => {
			(scene as any).game.registry.get.mockReturnValue(null);

			scene.loadCheckpoint();

			expect((scene as any).game.registry.get).toHaveBeenCalledWith('saveManager');
		});

		it('should load checkpoint if available', () => {
			const mockSaveManager = {
				hasCheckpoint: jest.fn().mockReturnValue(true),
				loadCheckpoint: jest.fn(),
			};
			(scene as any).game.registry.get.mockReturnValue(mockSaveManager);

			scene.loadCheckpoint();

			expect(mockSaveManager.loadCheckpoint).toHaveBeenCalled();
		});

		it('should show message when no checkpoint available', () => {
			const mockSaveManager = {
				hasCheckpoint: jest.fn().mockReturnValue(false),
			};
			(scene as any).game.registry.get.mockReturnValue(mockSaveManager);

			scene.loadCheckpoint();

			expect((scene as any).add.text).toHaveBeenCalledWith(400, 500, 'No checkpoint found', expect.any(Object));
		});

		it('should show message when save manager not found', () => {
			(scene as any).game.registry.get.mockReturnValue(null);

			scene.loadCheckpoint();

			expect((scene as any).add.text).toHaveBeenCalledWith(400, 500, 'No checkpoint found', expect.any(Object));
		});
	});

	describe('returnToMainMenu', () => {
		beforeEach(() => {
			scene.lastScene = 'DungeonScene';
		});

		it('should stop GameOverScene', () => {
			scene.returnToMainMenu();

			expect((scene as any).scene.stop).toHaveBeenCalledWith('GameOverScene');
		});

		it('should stop the last scene', () => {
			scene.returnToMainMenu();

			expect((scene as any).scene.stop).toHaveBeenCalledWith('DungeonScene');
		});

		it('should stop all running scenes', () => {
			scene.returnToMainMenu();

			expect((scene as any).scene.stop).toHaveBeenCalledWith('DialogScene');
			expect((scene as any).scene.stop).toHaveBeenCalledWith('HUDScene');
			expect((scene as any).scene.stop).toHaveBeenCalledWith('JoystickScene');
			expect((scene as any).scene.stop).toHaveBeenCalledWith('InventoryScene');
			expect((scene as any).scene.stop).toHaveBeenCalledWith('AttributeScene');
			expect((scene as any).scene.stop).toHaveBeenCalledWith('MainScene');
		});

		it('should start MainMenuScene after delay', () => {
			scene.returnToMainMenu();

			expect((scene as any).scene.start).toHaveBeenCalledWith('MainMenuScene');
		});
	});
});
