import Phaser from 'phaser';
import { MainMenuScene } from '../../scenes/MainMenuScene';
import { NeverquestInterfaceController } from '../../plugins/NeverquestInterfaceController';
import { NeverquestSaveManager } from '../../plugins/NeverquestSaveManager';
import { PanelComponent } from '../../components/PanelComponent';

// Mock the dependencies
jest.mock('../../plugins/NeverquestInterfaceController');
jest.mock('../../plugins/NeverquestSaveManager');
jest.mock('../../components/PanelComponent');

// Mock Phaser events
if (!Phaser.Cameras) {
	(Phaser as any).Cameras = {};
}
if (!Phaser.Cameras.Scene2D) {
	(Phaser.Cameras as any).Scene2D = {};
}
if (!Phaser.Cameras.Scene2D.Events) {
	(Phaser.Cameras.Scene2D as any).Events = {};
}
if (!Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE) {
	(Phaser.Cameras.Scene2D.Events as any).FADE_OUT_COMPLETE = 'fadeoutcomplete';
}

describe('MainMenuScene', () => {
	let scene: MainMenuScene;
	let mockAdd: any;
	let mockLoad: any;
	let mockSound: any;
	let mockScale: any;
	let mockScene: any;
	let mockCameras: any;
	let mockTextures: any;

	beforeEach(() => {
		// Mock text objects
		const mockText = {
			x: 400,
			y: 300,
			setOrigin: jest.fn().mockReturnThis(),
			setInteractive: jest.fn().mockReturnThis(),
			setPosition: jest.fn().mockReturnThis(),
			on: jest.fn(),
			destroy: jest.fn(),
		};

		// Mock video object
		const mockVideo = {
			width: 800,
			height: 600,
			scaleX: 1,
			scaleY: 1,
			setScale: jest.fn().mockReturnThis(),
			setOrigin: jest.fn().mockReturnThis(),
			setLoop: jest.fn().mockReturnThis(),
			play: jest.fn().mockReturnThis(),
			setPaused: jest.fn().mockReturnThis(),
			setPosition: jest.fn().mockReturnThis(),
		};

		// Mock sound objects
		const mockBaseSound = {
			play: jest.fn(),
			stop: jest.fn(),
		};

		// Mock add (GameObjectFactory)
		mockAdd = {
			text: jest.fn(() => ({ ...mockText })),
			video: jest.fn(() => mockVideo),
		};

		// Mock load manager
		mockLoad = {
			video: jest.fn(),
		};

		// Mock sound manager
		mockSound = {
			volume: 1,
			add: jest.fn(() => ({ ...mockBaseSound })),
		};

		// Mock scale manager
		mockScale = {
			orientation: 'landscape-primary',
			aspectRatio: 1.5,
			on: jest.fn(),
		};

		// Mock scene manager
		mockScene = {
			start: jest.fn(),
			stop: jest.fn(),
			get: jest.fn(),
		};

		// Mock cameras
		const mockMainCamera = {
			x: 0,
			y: 0,
			width: 800,
			height: 600,
			midPoint: { x: 400, y: 300 },
			fadeOut: jest.fn(),
			once: jest.fn(),
		};

		mockCameras = {
			main: mockMainCamera,
		};

		// Mock textures
		mockTextures = {
			exists: jest.fn(() => true),
		};

		// Mock NeverquestInterfaceController
		const mockInterfaceController = {
			interfaceElements: [[]] as any[][],
			closeAction: null as any,
			currentElementAction: null as any,
			updateHighlightedElement: jest.fn(),
			menuHistoryAdd: jest.fn(),
			menuHistoryRetrieve: jest.fn(),
			removeCurrentSelectionHighlight: jest.fn(),
			clearItems: jest.fn(),
		};

		(NeverquestInterfaceController as jest.Mock).mockImplementation(() => mockInterfaceController);

		// Mock NeverquestSaveManager
		const mockSaveManagerInstance = {
			hasSaveData: jest.fn(() => false),
			loadGame: jest.fn(),
		};

		(NeverquestSaveManager as jest.Mock).mockImplementation(() => mockSaveManagerInstance);

		// Mock PanelComponent
		const mockPanelInstance = {
			panelBackground: { x: 200, y: 150, destroy: jest.fn() },
			panelTitle: { destroy: jest.fn() },
			panelTitleText: { destroy: jest.fn() },
			closeButton: { on: jest.fn(), destroy: jest.fn() },
			backgroundMainContentPaddingTop: 50,
			setTitleText: jest.fn(),
			destroy: jest.fn(),
		};

		(PanelComponent as jest.Mock).mockImplementation(() => mockPanelInstance);

		// Create scene instance with mocked Phaser scene
		scene = new MainMenuScene();
		(scene as any).add = mockAdd;
		(scene as any).load = mockLoad;
		(scene as any).sound = mockSound;
		(scene as any).scale = mockScale;
		(scene as any).scene = mockScene;
		(scene as any).cameras = mockCameras;
		(scene as any).textures = mockTextures;
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('Constructor', () => {
		it('should create scene with correct key', () => {
			expect(scene.constructor.name).toBe('MainMenuScene');
		});

		it('should initialize with null values', () => {
			expect(scene.neverquestInterfaceControler).toBeNull();
			expect(scene.gameStartText).toBeNull();
			expect(scene.video).toBeNull();
			expect(scene.themeSound).toBeNull();
			expect(scene.saveManager).toBeNull();
			expect(scene.loadGameText).toBeNull();
			expect(scene.creditsText).toBeNull();
			expect(scene.panelComponent).toBeNull();
			expect(scene.creditsBackground).toBeNull();
			expect(scene.creditsTitle).toBeNull();
			expect(scene.creditsTitleText).toBeNull();
			expect(scene.closeButton).toBeNull();
			expect(scene.creditsTextContent).toBeNull();
		});

		it('should initialize with correct default values', () => {
			expect(scene.nineSliceOffset).toBe(10);
			expect(scene.textWidth).toBe(452);
			expect(scene.fontFamily).toBe('"Press Start 2P"');
			expect(scene.lastMenuAction).toBeNull();
		});
	});

	describe('preload()', () => {
		it('should load intro video if video asset exists', () => {
			scene.preload();
			expect(mockLoad.video).toHaveBeenCalledWith('intro_video', expect.any(String), 'loadeddata', false, true);
		});
	});

	describe('create()', () => {
		beforeEach(() => {
			scene.create();
		});

		describe('Video Setup', () => {
			it('should create video if texture exists', () => {
				expect(mockAdd.video).toHaveBeenCalledWith(0, 0, 'intro_video');
				expect(scene.video).not.toBeNull();
			});

			it('should scale video for portrait mode', () => {
				mockScale.orientation = 'portrait-primary';
				scene.create();
				expect(scene.video?.setScale).toHaveBeenCalledWith(2);
				expect(scene.video?.setOrigin).toHaveBeenCalledWith(0.4, 0);
			});

			it('should fit video for landscape mode', () => {
				mockScale.orientation = 'landscape-primary';
				scene.create();
				expect(scene.video?.scaleX).toBe(1);
				expect(scene.video?.scaleY).toBe(1);
				expect(scene.video?.setOrigin).toHaveBeenCalledWith(0, 0);
			});

			it('should set video to loop', () => {
				expect(scene.video?.setLoop).toHaveBeenCalledWith(true);
			});

			it('should play video', () => {
				expect(scene.video?.play).toHaveBeenCalled();
			});

			it('should unpause video', () => {
				expect(scene.video?.setPaused).toHaveBeenCalledWith(false);
			});

			it('should not create video if texture does not exist', () => {
				mockTextures.exists.mockReturnValue(false);
				jest.clearAllMocks();
				scene.create();
				expect(mockAdd.video).not.toHaveBeenCalled();
			});
		});

		describe('Audio Setup', () => {
			it('should set sound volume', () => {
				expect(mockSound.volume).toBe(0.35);
			});

			it('should add theme sound', () => {
				expect(mockSound.add).toHaveBeenCalledWith('forest', { loop: true });
				expect(scene.themeSound).not.toBeNull();
			});

			it('should play theme sound', () => {
				expect(scene.themeSound?.play).toHaveBeenCalled();
			});
		});

		describe('Interface Controller', () => {
			it('should create NeverquestInterfaceController', () => {
				expect(NeverquestInterfaceController).toHaveBeenCalledWith(scene);
				expect(scene.neverquestInterfaceControler).not.toBeNull();
			});
		});

		describe('Menu Buttons', () => {
			it('should create Start Game text', () => {
				expect(mockAdd.text).toHaveBeenCalledWith(400, 300, 'Start Game', {
					fontSize: 34,
					fontFamily: '"Press Start 2P"',
				});
				expect(scene.gameStartText).not.toBeNull();
			});

			it('should set Start Game text origin', () => {
				expect(scene.gameStartText?.setOrigin).toHaveBeenCalledWith(0.5, 0.5);
			});

			it('should make Start Game text interactive', () => {
				expect(scene.gameStartText?.setInteractive).toHaveBeenCalled();
			});

			it('should register pointerdown event for Start Game', () => {
				expect(scene.gameStartText?.on).toHaveBeenCalledWith('pointerdown', expect.any(Function));
			});

			it('should create Save Manager', () => {
				expect(NeverquestSaveManager).toHaveBeenCalledWith(scene);
				expect(scene.saveManager).not.toBeNull();
			});

			it('should create Load Game text', () => {
				expect(mockAdd.text).toHaveBeenCalledWith(
					scene.gameStartText!.x,
					scene.gameStartText!.y + 60,
					'Load Game',
					expect.objectContaining({
						fontSize: 34,
						fontFamily: scene.fontFamily,
					})
				);
				expect(scene.loadGameText).not.toBeNull();
			});

			it('should set Load Game text color to gray when no save data', () => {
				const loadGameCall = mockAdd.text.mock.calls.find((call: any) => call[2] === 'Load Game');
				expect(loadGameCall[3].color).toBe('#666666');
			});

			it('should set Load Game text color to white when save data exists', () => {
				const mockSaveManager = scene.saveManager as any;
				mockSaveManager.hasSaveData.mockReturnValue(true);
				jest.clearAllMocks();
				scene.create();

				const loadGameCall = mockAdd.text.mock.calls.find((call: any) => call[2] === 'Load Game');
				expect(loadGameCall[3].color).toBe('#ffffff');
			});

			it('should create Credits text', () => {
				expect(mockAdd.text).toHaveBeenCalledWith(
					scene.gameStartText!.x,
					scene.gameStartText!.y + 120,
					'Credits',
					expect.objectContaining({
						fontSize: 34,
						fontFamily: scene.fontFamily,
					})
				);
				expect(scene.creditsText).not.toBeNull();
			});

			it('should register pointerdown events for all menu buttons', () => {
				expect(scene.gameStartText?.on).toHaveBeenCalled();
				expect(scene.loadGameText?.on).toHaveBeenCalled();
				expect(scene.creditsText?.on).toHaveBeenCalled();
			});
		});

		describe('Resize Handler', () => {
			it('should register resize event listener', () => {
				expect(mockScale.on).toHaveBeenCalledWith('resize', expect.any(Function));
			});

			it('should call resizeAll on resize event', () => {
				const resizeCall = mockScale.on.mock.calls.find((call: any) => call[0] === 'resize');
				const resizeCallback = resizeCall[1];
				const spyResize = jest.spyOn(scene, 'resizeAll');

				resizeCallback({ width: 1024, height: 768 });
				expect(spyResize).toHaveBeenCalledWith({ width: 1024, height: 768 });
			});
		});
	});

	describe('resizeAll()', () => {
		beforeEach(() => {
			scene.create();
		});

		it('should reposition Start Game text', () => {
			const size = { width: 1024, height: 768, aspectRatio: 1.5 };
			scene.resizeAll(size);
			expect(scene.gameStartText?.setPosition).toHaveBeenCalledWith(512, 384);
		});

		it('should reposition Load Game text relative to Start Game', () => {
			const size = { width: 1024, height: 768, aspectRatio: 1.5 };
			scene.resizeAll(size);
			expect(scene.loadGameText?.setPosition).toHaveBeenCalled();
		});

		it('should reposition Credits text relative to Start Game', () => {
			const size = { width: 1024, height: 768, aspectRatio: 1.5 };
			scene.resizeAll(size);
			expect(scene.creditsText?.setPosition).toHaveBeenCalled();
		});

		it('should reposition video', () => {
			const size = { width: 1024, height: 768, aspectRatio: 1.5 };
			scene.resizeAll(size);
			expect(scene.video?.setPosition).toHaveBeenCalled();
		});

		it('should scale video for portrait aspect ratio', () => {
			const size = { width: 600, height: 800, aspectRatio: 0.75 };
			scene.resizeAll(size);
			expect(scene.video?.setScale).toHaveBeenCalledWith(2);
			expect(scene.video?.setOrigin).toHaveBeenCalledWith(0.4, 0);
		});

		it('should fit video for landscape aspect ratio', () => {
			const size = { width: 1024, height: 768, aspectRatio: 1.33 };
			scene.resizeAll(size);
			expect(scene.video?.setOrigin).toHaveBeenCalledWith(0, 0);
		});

		it('should handle null size gracefully', () => {
			expect(() => scene.resizeAll(null)).not.toThrow();
		});

		it('should handle missing cameras gracefully', () => {
			(scene as any).cameras = null;
			expect(() => scene.resizeAll({ width: 800, height: 600 })).not.toThrow();
		});
	});

	describe('setMainMenuActions()', () => {
		beforeEach(() => {
			scene.create();
		});

		it('should initialize interface elements array', () => {
			expect(scene.neverquestInterfaceControler?.interfaceElements[0]).toBeDefined();
			expect(scene.neverquestInterfaceControler?.interfaceElements[0][0]).toBeDefined();
		});

		it('should create Start Game action', () => {
			const firstAction = scene.neverquestInterfaceControler?.interfaceElements[0][0][0];
			expect(firstAction).toEqual({
				element: scene.gameStartText,
				action: 'startGame',
				context: scene,
				args: 'MainScene',
			});
		});

		it('should create Load Game action', () => {
			const loadGameAction = scene.neverquestInterfaceControler?.interfaceElements[0][1][0];
			expect(loadGameAction).toEqual({
				element: scene.loadGameText,
				action: 'loadGame',
				context: scene,
				args: null,
			});
		});

		it('should create Credits action', () => {
			const creditsAction = scene.neverquestInterfaceControler?.interfaceElements[0][2][0];
			expect(creditsAction).toEqual({
				element: scene.creditsText,
				action: 'showCredits',
				context: scene,
				args: 'Credits',
			});
		});

		it('should set first action as current', () => {
			expect(scene.neverquestInterfaceControler?.currentElementAction).toBeDefined();
			expect(scene.neverquestInterfaceControler?.currentElementAction?.action).toBe('startGame');
		});

		it('should clear close action', () => {
			expect(scene.neverquestInterfaceControler?.closeAction).toBeNull();
		});

		it('should update highlighted element', () => {
			expect(scene.neverquestInterfaceControler?.updateHighlightedElement).toHaveBeenCalled();
		});
	});

	describe('showCredits()', () => {
		beforeEach(() => {
			scene.create();
			scene.showCredits();
		});

		it('should add to menu history', () => {
			expect(scene.neverquestInterfaceControler?.menuHistoryAdd).toHaveBeenCalled();
		});

		it('should create PanelComponent', () => {
			expect(PanelComponent).toHaveBeenCalledWith(scene);
			expect(scene.panelComponent).not.toBeNull();
		});

		it('should set panel references', () => {
			expect(scene.creditsBackground).toBeDefined();
			expect(scene.creditsTitle).toBeDefined();
			expect(scene.creditsTitleText).toBeDefined();
			expect(scene.closeButton).toBeDefined();
		});

		it('should set panel title to Credits', () => {
			expect(scene.panelComponent?.setTitleText).toHaveBeenCalledWith('Credits');
		});

		it('should create credits text content', () => {
			expect(mockAdd.text).toHaveBeenCalledWith(
				expect.any(Number),
				expect.any(Number),
				expect.stringContaining('Matthew Pablo'),
				expect.objectContaining({
					wordWrap: { width: 452 },
					fontSize: 11,
					fontFamily: scene.fontFamily,
				})
			);
			expect(scene.creditsTextContent).not.toBeNull();
		});

		it('should create close action', () => {
			expect(scene.neverquestInterfaceControler?.closeAction).toBeDefined();
			expect(scene.neverquestInterfaceControler?.closeAction?.action).toBe('closeCredits');
		});

		it('should remove current selection highlight', () => {
			expect(scene.neverquestInterfaceControler?.removeCurrentSelectionHighlight).toHaveBeenCalled();
		});

		it('should clear interface items', () => {
			expect(scene.neverquestInterfaceControler?.clearItems).toHaveBeenCalled();
		});

		it('should register close button pointerup event', () => {
			expect(scene.closeButton?.on).toHaveBeenCalledWith('pointerup', expect.any(Function));
		});
	});

	describe('closeCredits()', () => {
		beforeEach(() => {
			scene.create();
			scene.showCredits();
			jest.clearAllMocks();
			scene.closeCredits();
		});

		it('should destroy panel component', () => {
			expect(scene.panelComponent?.destroy).toHaveBeenCalled();
		});

		it('should destroy credits text content', () => {
			expect(scene.creditsTextContent?.destroy).toHaveBeenCalled();
		});

		it('should clear close action', () => {
			expect(scene.neverquestInterfaceControler?.closeAction).toBeNull();
		});

		it('should reset current element action to main menu', () => {
			// closeCredits calls setMainMenuActions() which sets currentElementAction to first menu item
			expect(scene.neverquestInterfaceControler?.currentElementAction).toBeDefined();
			expect(scene.neverquestInterfaceControler?.currentElementAction?.action).toBe('startGame');
		});

		it('should clear interface items', () => {
			expect(scene.neverquestInterfaceControler?.clearItems).toHaveBeenCalled();
		});

		it('should restore menu history', () => {
			expect(scene.neverquestInterfaceControler?.menuHistoryRetrieve).toHaveBeenCalled();
		});
	});

	describe('startGame()', () => {
		beforeEach(() => {
			scene.create();
		});

		it('should stop theme sound', () => {
			scene.startGame();
			expect(scene.themeSound?.stop).toHaveBeenCalled();
		});

		it('should fade out camera', () => {
			scene.startGame();
			expect(mockCameras.main.fadeOut).toHaveBeenCalledWith(300, 0, 0, 0);
		});

		it('should play start sound', () => {
			scene.startGame();
			expect(mockSound.add).toHaveBeenCalledWith('start_game');
		});

		it('should start MainScene on fade complete', () => {
			scene.startGame();
			const onceCall = mockCameras.main.once.mock.calls[0];
			const fadeCompleteCallback = onceCall[1];

			fadeCompleteCallback();

			expect(mockScene.start).toHaveBeenCalledWith('MainScene');
		});

		it('should stop current scene on fade complete', () => {
			scene.startGame();
			const onceCall = mockCameras.main.once.mock.calls[0];
			const fadeCompleteCallback = onceCall[1];

			fadeCompleteCallback();

			expect(mockScene.stop).toHaveBeenCalled();
		});
	});

	describe('loadGame()', () => {
		beforeEach(() => {
			scene.create();
		});

		it('should return early if no save data', () => {
			const mockSaveManager = scene.saveManager as any;
			mockSaveManager.hasSaveData.mockReturnValue(false);

			scene.loadGame();

			expect(mockSaveManager.loadGame).not.toHaveBeenCalled();
		});

		it('should load game data if save exists', () => {
			const mockSaveManager = scene.saveManager as any;
			mockSaveManager.hasSaveData.mockReturnValue(true);
			mockSaveManager.loadGame.mockReturnValue({ scene: 'MainScene', playerData: {} });

			scene.loadGame();

			expect(mockSaveManager.loadGame).toHaveBeenCalledWith(false);
		});

		it('should stop theme sound when loading', () => {
			const mockSaveManager = scene.saveManager as any;
			mockSaveManager.hasSaveData.mockReturnValue(true);
			mockSaveManager.loadGame.mockReturnValue({ scene: 'MainScene' });

			scene.loadGame();

			expect(scene.themeSound?.stop).toHaveBeenCalled();
		});

		it('should fade out camera when loading', () => {
			const mockSaveManager = scene.saveManager as any;
			mockSaveManager.hasSaveData.mockReturnValue(true);
			mockSaveManager.loadGame.mockReturnValue({ scene: 'MainScene' });

			scene.loadGame();

			expect(mockCameras.main.fadeOut).toHaveBeenCalledWith(300, 0, 0, 0);
		});

		it('should play start sound when loading', () => {
			const mockSaveManager = scene.saveManager as any;
			mockSaveManager.hasSaveData.mockReturnValue(true);
			mockSaveManager.loadGame.mockReturnValue({ scene: 'MainScene' });

			scene.loadGame();

			expect(mockSound.add).toHaveBeenCalledWith('start_game');
		});

		it('should start saved scene on fade complete', () => {
			const mockSaveManager = scene.saveManager as any;
			mockSaveManager.hasSaveData.mockReturnValue(true);
			mockSaveManager.loadGame.mockReturnValue({ scene: 'TownScene' });

			scene.loadGame();

			const onceCall = mockCameras.main.once.mock.calls[0];
			const fadeCompleteCallback = onceCall[1];
			fadeCompleteCallback();

			expect(mockScene.start).toHaveBeenCalledWith('TownScene');
		});

		it('should stop current scene on fade complete', () => {
			const mockSaveManager = scene.saveManager as any;
			mockSaveManager.hasSaveData.mockReturnValue(true);
			mockSaveManager.loadGame.mockReturnValue({ scene: 'MainScene' });

			scene.loadGame();

			const onceCall = mockCameras.main.once.mock.calls[0];
			const fadeCompleteCallback = onceCall[1];
			fadeCompleteCallback();

			expect(mockScene.stop).toHaveBeenCalled();
		});

		it('should apply save data to target scene after timeout', (done) => {
			const mockSaveManager = scene.saveManager as any;
			const mockTargetScene = {
				saveManager: {
					applySaveData: jest.fn(),
				},
			};

			mockSaveManager.hasSaveData.mockReturnValue(true);
			mockSaveManager.loadGame.mockReturnValue({ scene: 'MainScene', playerData: {} });
			mockScene.get.mockReturnValue(mockTargetScene);

			scene.loadGame();

			const onceCall = mockCameras.main.once.mock.calls[0];
			const fadeCompleteCallback = onceCall[1];
			fadeCompleteCallback();

			setTimeout(() => {
				expect(mockScene.get).toHaveBeenCalledWith('MainScene');
				expect(mockTargetScene.saveManager.applySaveData).toHaveBeenCalled();
				done();
			}, 150);
		});

		it('should handle missing save manager on target scene', (done) => {
			const mockSaveManager = scene.saveManager as any;
			const mockTargetScene = {};

			mockSaveManager.hasSaveData.mockReturnValue(true);
			mockSaveManager.loadGame.mockReturnValue({ scene: 'MainScene' });
			mockScene.get.mockReturnValue(mockTargetScene);

			scene.loadGame();

			const onceCall = mockCameras.main.once.mock.calls[0];
			const fadeCompleteCallback = onceCall[1];
			fadeCompleteCallback();

			setTimeout(() => {
				expect(() => fadeCompleteCallback()).not.toThrow();
				done();
			}, 150);
		});
	});

	describe('Integration', () => {
		it('should handle full menu flow', () => {
			scene.create();

			// Verify all menu elements created
			expect(scene.gameStartText).not.toBeNull();
			expect(scene.loadGameText).not.toBeNull();
			expect(scene.creditsText).not.toBeNull();
			expect(scene.video).not.toBeNull();
			expect(scene.themeSound).not.toBeNull();

			// Verify menu actions configured
			expect(scene.neverquestInterfaceControler?.interfaceElements[0][0]).toBeDefined();
			expect(scene.neverquestInterfaceControler?.interfaceElements[0][1]).toBeDefined();
			expect(scene.neverquestInterfaceControler?.interfaceElements[0][2]).toBeDefined();
		});

		it('should handle credits open and close cycle', () => {
			scene.create();
			scene.showCredits();

			expect(scene.panelComponent).not.toBeNull();
			expect(scene.creditsTextContent).not.toBeNull();

			scene.closeCredits();

			expect(scene.panelComponent?.destroy).toHaveBeenCalled();
			expect(scene.creditsTextContent?.destroy).toHaveBeenCalled();
		});

		it('should have all buttons properly connected', () => {
			scene.create();

			// Verify all button event listeners are registered
			expect(scene.gameStartText?.on).toHaveBeenCalledWith('pointerdown', expect.any(Function));
			expect(scene.loadGameText?.on).toHaveBeenCalledWith('pointerdown', expect.any(Function));
			expect(scene.creditsText?.on).toHaveBeenCalledWith('pointerdown', expect.any(Function));
		});
	});
});
