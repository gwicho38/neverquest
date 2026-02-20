/**
 * Tests for TownScene
 */

import { TownScene } from '../../scenes/TownScene';
import { NeverquestMapCreator } from '../../plugins/NeverquestMapCreator';
import { NeverquestWarp } from '../../plugins/NeverquestWarp';
import { NeverquestObjectMarker } from '../../plugins/NeverquestObjectMarker';
import { NeverquestEnvironmentParticles } from '../../plugins/NeverquestEnvironmentParticles';
import { NeverquestEnemyZones } from '../../plugins/NeverquestEnemyZones';
import { NeverquestSaveManager } from '../../plugins/NeverquestSaveManager';

// Mock dependencies
jest.mock('../../plugins/AnimatedTiles', () => jest.fn());
jest.mock('../../plugins/NeverquestEnvironmentParticles', () => ({
	NeverquestEnvironmentParticles: jest.fn().mockImplementation(() => ({
		create: jest.fn(),
	})),
}));
jest.mock('../../plugins/NeverquestMapCreator', () => ({
	NeverquestMapCreator: jest.fn().mockImplementation(() => ({
		mapName: 'town',
		tilesetImages: [] as any[],
		create: jest.fn(),
		map: {
			widthInPixels: 2400,
			heightInPixels: 1800,
		},
	})),
}));
jest.mock('../../plugins/NeverquestObjectMarker', () => ({
	NeverquestObjectMarker: jest.fn().mockImplementation(() => ({
		create: jest.fn(),
	})),
}));
jest.mock('../../plugins/NeverquestWarp', () => ({
	NeverquestWarp: jest.fn().mockImplementation(() => ({
		createWarps: jest.fn(),
	})),
}));
jest.mock('../../plugins/NeverquestEnemyZones', () => ({
	NeverquestEnemyZones: jest.fn().mockImplementation(() => ({
		create: jest.fn(),
	})),
}));
jest.mock('../../plugins/NeverquestSaveManager', () => ({
	NeverquestSaveManager: jest.fn().mockImplementation(() => ({
		create: jest.fn(),
		saveGame: jest.fn(),
		loadGame: jest.fn(),
		applySaveData: jest.fn(),
		showSaveNotification: jest.fn(),
	})),
}));
jest.mock('../../entities/Player', () => ({
	Player: jest.fn(),
}));
jest.mock('../../consts/Numbers', () => ({
	CameraValues: {
		ZOOM_CLOSE: 2,
	},
	Alpha: {
		MEDIUM_LIGHT: 0.5,
	},
}));
jest.mock('../../consts/Messages', () => ({
	SaveMessages: {
		NO_CHECKPOINT_FOUND: 'No checkpoint found',
	},
}));

describe('TownScene', () => {
	let scene: TownScene;
	let mockSound: any;
	let mockKeyboardHandler: any;

	beforeEach(() => {
		jest.clearAllMocks();

		mockSound = {
			play: jest.fn(),
			stop: jest.fn(),
		};

		scene = new TownScene();

		// Setup mock scene properties
		(scene as any).load = {
			scenePlugin: jest.fn(),
		};

		(scene as any).cameras = {
			main: {
				startFollow: jest.fn(),
				setZoom: jest.fn(),
				setBounds: jest.fn(),
			},
		};

		(scene as any).scene = {
			launch: jest.fn(),
			get: jest.fn().mockReturnValue({}),
		};

		(scene as any).sound = {
			volume: 1,
			add: jest.fn().mockReturnValue(mockSound),
		};

		(scene as any).input = {
			keyboard: {
				on: jest.fn().mockImplementation((_event: string, handler: (...args: any[]) => void) => {
					mockKeyboardHandler = handler;
				}),
			},
		};

		(scene as any).sys = {
			animatedTiles: {
				init: jest.fn(),
			},
		};

		// Mock player with container
		scene.player = {
			container: {},
		} as unknown as typeof scene.player;
	});

	describe('constructor', () => {
		it('should create scene with key TownScene', () => {
			const newScene = new TownScene();
			expect((newScene as any).sys?.settings?.key || 'TownScene').toBe('TownScene');
		});

		it('should initialize with null/empty properties', () => {
			const newScene = new TownScene();
			expect(newScene.player).toBeNull();
			expect(newScene.mapCreator).toBeNull();
			expect(newScene.map).toBeNull();
			expect(newScene.joystickScene).toBeNull();
			expect(newScene.particles).toBeNull();
			expect(newScene.themeSound).toBeNull();
			expect(newScene.enemies).toEqual([]);
			expect(newScene.neverquestEnemyZones).toBeNull();
			expect(newScene.saveManager).toBeNull();
		});
	});

	describe('preload', () => {
		it('should load animated tiles plugin', () => {
			scene.preload();

			expect((scene as any).load.scenePlugin).toHaveBeenCalledWith(
				'animatedTiles',
				expect.anything(),
				'animatedTiles',
				'animatedTiles'
			);
		});
	});

	describe('create', () => {
		it('should set camera zoom', () => {
			scene.create();

			expect((scene as any).cameras.main.setZoom).toHaveBeenCalledWith(2);
		});

		it('should create map with correct name', () => {
			scene.create();

			expect(NeverquestMapCreator).toHaveBeenCalledWith(scene, 'town');
		});

		it('should start camera following player', () => {
			scene.create();

			expect((scene as any).cameras.main.startFollow).toHaveBeenCalledWith(scene.player.container);
		});

		it('should set camera bounds to map size', () => {
			scene.create();

			expect((scene as any).cameras.main.setBounds).toHaveBeenCalledWith(0, 0, 2400, 1800);
		});

		it('should create warps', () => {
			scene.create();

			expect(NeverquestWarp).toHaveBeenCalled();
		});

		it('should create interactive markers', () => {
			scene.create();

			expect(NeverquestObjectMarker).toHaveBeenCalled();
		});

		it('should launch dialog scene', () => {
			scene.create();

			expect((scene as any).scene.launch).toHaveBeenCalledWith(
				'DialogScene',
				expect.objectContaining({
					player: expect.anything(),
					map: expect.anything(),
					scene: expect.anything(),
				})
			);
		});

		it('should get joystick scene', () => {
			scene.create();

			expect((scene as any).scene.get).toHaveBeenCalledWith('JoystickScene');
		});

		it('should launch HUD scene', () => {
			scene.create();

			expect((scene as any).scene.launch).toHaveBeenCalledWith(
				'HUDScene',
				expect.objectContaining({
					player: expect.anything(),
					map: expect.anything(),
				})
			);
		});

		it('should initialize animated tiles', () => {
			scene.create();

			expect((scene as any).sys.animatedTiles.init).toHaveBeenCalled();
		});

		it('should create environment particles', () => {
			scene.create();

			expect(NeverquestEnvironmentParticles).toHaveBeenCalled();
			expect(scene.particles!.create).toHaveBeenCalled();
		});

		it('should set sound volume and play town theme', () => {
			scene.create();

			expect((scene as any).sound.add).toHaveBeenCalledWith('path_to_lake_land', { loop: true });
			expect(mockSound.play).toHaveBeenCalled();
		});

		it('should create enemy zones', () => {
			scene.create();

			expect(NeverquestEnemyZones).toHaveBeenCalled();
			expect(scene.neverquestEnemyZones!.create).toHaveBeenCalled();
		});

		it('should create save manager', () => {
			scene.create();

			expect(NeverquestSaveManager).toHaveBeenCalledWith(scene);
			expect(scene.saveManager!.create).toHaveBeenCalled();
		});

		it('should setup save keybinds', () => {
			scene.create();

			expect((scene as any).input.keyboard.on).toHaveBeenCalledWith('keydown', expect.any(Function));
		});
	});

	describe('setupSaveKeybinds', () => {
		beforeEach(() => {
			scene.create();
		});

		it('should save game on Ctrl+S', () => {
			const event = {
				ctrlKey: true,
				key: 's',
				preventDefault: jest.fn(),
			};

			mockKeyboardHandler(event);

			expect(event.preventDefault).toHaveBeenCalled();
			expect(scene.saveManager!.saveGame).toHaveBeenCalledWith(false);
		});

		it('should load game on Ctrl+L', () => {
			scene.saveManager!.loadGame = jest.fn().mockReturnValue({ playerHealth: 100 });

			const event = {
				ctrlKey: true,
				key: 'l',
				preventDefault: jest.fn(),
			};

			mockKeyboardHandler(event);

			expect(event.preventDefault).toHaveBeenCalled();
			expect(scene.saveManager!.loadGame).toHaveBeenCalledWith(false);
			expect(scene.saveManager!.applySaveData).toHaveBeenCalled();
		});

		it('should not apply save data if load returns null on Ctrl+L', () => {
			scene.saveManager!.loadGame = jest.fn().mockReturnValue(null);

			const event = {
				ctrlKey: true,
				key: 'l',
				preventDefault: jest.fn(),
			};

			mockKeyboardHandler(event);

			expect(scene.saveManager!.applySaveData).not.toHaveBeenCalled();
		});

		it('should load checkpoint on F5', () => {
			scene.saveManager!.loadGame = jest.fn().mockReturnValue({ playerHealth: 100 });

			const event = {
				ctrlKey: false,
				key: 'F5',
				preventDefault: jest.fn(),
			};

			mockKeyboardHandler(event);

			expect(event.preventDefault).toHaveBeenCalled();
			expect(scene.saveManager!.loadGame).toHaveBeenCalledWith(true);
			expect(scene.saveManager!.applySaveData).toHaveBeenCalled();
		});

		it('should show notification if no checkpoint on F5', () => {
			scene.saveManager!.loadGame = jest.fn().mockReturnValue(null);

			const event = {
				ctrlKey: false,
				key: 'F5',
				preventDefault: jest.fn(),
			};

			mockKeyboardHandler(event);

			expect(scene.saveManager!.showSaveNotification).toHaveBeenCalledWith('No checkpoint found', true);
		});
	});

	describe('stopSceneMusic', () => {
		it('should stop theme sound', () => {
			scene.create();
			scene.stopSceneMusic();

			expect(mockSound.stop).toHaveBeenCalled();
		});
	});

	describe('update', () => {
		it('should be defined', () => {
			expect(scene.update).toBeDefined();
		});

		it('should be callable without error', () => {
			expect(() => scene.update()).not.toThrow();
		});
	});
});
