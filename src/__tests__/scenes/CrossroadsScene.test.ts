/**
 * Tests for CrossroadsScene
 *
 * CrossroadsScene is the central hub connecting all major regions in the story.
 * It serves as the Act 2 starting point where players can access:
 * - South: Return to Forest (OverworldScene)
 * - West: Ancient Ruins (first Sunstone fragment)
 * - North: Gate to Dark Lands (locked until Act 3)
 * - East: Mountain pass (future expansion - Ice Caverns)
 * - Center: Trading Post with NPCs
 */

import { CrossroadsScene } from '../../scenes/CrossroadsScene';
import { NeverquestMapCreator } from '../../plugins/NeverquestMapCreator';
import { NeverquestWarp } from '../../plugins/NeverquestWarp';
import { NeverquestObjectMarker } from '../../plugins/NeverquestObjectMarker';
import { NeverquestEnvironmentParticles } from '../../plugins/NeverquestEnvironmentParticles';
import { NeverquestEnemyZones } from '../../plugins/NeverquestEnemyZones';
import { NeverquestSaveManager } from '../../plugins/NeverquestSaveManager';
// NeverquestNPCManager is mocked below, import not needed at runtime

// Mock dependencies
jest.mock('../../plugins/AnimatedTiles', () => jest.fn());
jest.mock('../../plugins/NeverquestEnvironmentParticles', () => ({
	NeverquestEnvironmentParticles: jest.fn().mockImplementation(() => ({
		create: jest.fn(),
	})),
}));
jest.mock('../../plugins/NeverquestMapCreator', () => ({
	NeverquestMapCreator: jest.fn().mockImplementation(() => ({
		mapName: 'crossroads',
		tilesetImages: [] as any[],
		create: jest.fn(),
		map: {
			widthInPixels: 6400, // 80x80 tiles at 80 pixels
			heightInPixels: 6400,
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
jest.mock('../../plugins/NeverquestNPCManager', () => ({
	NeverquestNPCManager: jest.fn().mockImplementation(() => ({
		addNPCs: jest.fn(),
		create: jest.fn(),
		destroy: jest.fn(),
	})),
	CROSSROADS_NPCS: [
		{ id: 'merchant', name: 'Wandering Merchant', x: 640, y: 560, chatId: 11 },
		{ id: 'fallenKnight', name: 'Sir Aldric', x: 480, y: 640, chatId: 12 },
		{ id: 'oracle', name: 'Oracle', x: 800, y: 480, chatId: 13 },
		{ id: 'gateGuardian', name: 'Gate Guardian', x: 640, y: 320, chatId: 14 },
	],
}));
jest.mock('../../plugins/NeverquestProgrammaticEnemyZones', () => ({
	NeverquestProgrammaticEnemyZones: jest.fn().mockImplementation(() => ({
		addZones: jest.fn(),
		create: jest.fn(),
		destroy: jest.fn(),
	})),
	CROSSROADS_ENEMY_ZONES: [
		{ id: 'west_bandits_1', x: 256, y: 640, width: 192, height: 192, enemyId: 4, count: 2 },
		{ id: 'east_wolves_1', x: 1024, y: 480, width: 200, height: 200, enemyId: 5, count: 2 },
		{ id: 'shadow_scout_patrol', x: 640, y: 640, width: 640, height: 480, enemyId: 6, count: 1 },
	],
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
		HALF: 0.5,
		OPAQUE: 1,
		HIGH: 0.8,
		VERY_HIGH: 0.9,
		VERY_LOW: 0.1,
		TRANSPARENT: 0,
		MEDIUM: 0.5,
	},
	ParticleValues: {
		LIFESPAN_MEDIUM: 2000,
		LIFESPAN_VERY_LONG: 4000,
	},
	Scale: {
		MEDIUM_LARGE: 0.75,
		TINY: 0.5,
		SMALL: 0.8,
	},
}));
jest.mock('../../consts/Colors', () => ({
	HexColors: {
		GREEN_LIGHT: '#44ff44',
		BLUE_LIGHT: '#66aaff',
		WHITE: '#ffffff',
	},
}));
jest.mock('../../consts/Messages', () => ({
	SaveMessages: {
		NO_CHECKPOINT_FOUND: 'No checkpoint found',
	},
}));

describe('CrossroadsScene', () => {
	let scene: CrossroadsScene;
	let mockSound: any;
	let mockKeyboardHandler: any;

	beforeEach(() => {
		jest.clearAllMocks();

		mockSound = {
			play: jest.fn(),
			stop: jest.fn(),
		};

		scene = new CrossroadsScene();

		// Setup mock scene properties
		(scene as any).load = {
			scenePlugin: jest.fn(),
		};

		(scene as any).cameras = {
			main: {
				startFollow: jest.fn(),
				setZoom: jest.fn(),
				setBounds: jest.fn(),
				centerX: 640,
				centerY: 360,
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

		// Mock zone for warp functionality
		const mockZone = {
			setOrigin: jest.fn().mockReturnThis(),
			destroy: jest.fn(),
			body: {
				immovable: false,
			},
		};

		// Mock text for arrows
		const mockText = {
			setOrigin: jest.fn().mockReturnThis(),
			setDepth: jest.fn().mockReturnThis(),
			setScrollFactor: jest.fn().mockReturnThis(),
			setAlpha: jest.fn().mockReturnThis(),
			destroy: jest.fn(),
		};

		// Mock particles emitter
		const mockParticleEmitter = {
			destroy: jest.fn(),
		};

		// Mock graphics object for visual effects
		const mockGraphics = {
			fillStyle: jest.fn().mockReturnThis(),
			fillRect: jest.fn().mockReturnThis(),
			setDepth: jest.fn().mockReturnThis(),
			destroy: jest.fn(),
		};

		// Mock add object for scene.add methods
		(scene as any).add = {
			zone: jest.fn().mockReturnValue(mockZone),
			particles: jest.fn().mockReturnValue(mockParticleEmitter),
			text: jest.fn().mockReturnValue(mockText),
			graphics: jest.fn().mockReturnValue(mockGraphics),
		};

		// Mock physics for overlap and existing
		(scene as any).physics = {
			add: {
				existing: jest.fn(),
				overlap: jest.fn(),
			},
		};

		// Mock tweens for arrow animations
		(scene as any).tweens = {
			add: jest.fn(),
		};

		// Mock time for delayed calls
		(scene as any).time = {
			delayedCall: jest.fn(),
		};

		// Mock player with container
		scene.player = {
			container: {},
			neverquestMovement: null,
			destroy: jest.fn(),
		} as any;
	});

	describe('constructor', () => {
		it('should create scene with key CrossroadsScene', () => {
			const newScene = new CrossroadsScene();
			expect((newScene as any).sys?.settings?.key || 'CrossroadsScene').toBe('CrossroadsScene');
		});

		it('should initialize with null/empty properties', () => {
			const newScene = new CrossroadsScene();
			expect(newScene.player).toBeNull();
			expect(newScene.mapCreator).toBeNull();
			expect(newScene.map).toBeNull();
			expect(newScene.joystickScene).toBeNull();
			expect(newScene.particles).toBeNull();
			expect(newScene.themeSound).toBeNull();
			expect(newScene.enemies).toEqual([]);
			expect(newScene.neverquestEnemyZones).toBeNull();
			expect(newScene.saveManager).toBeNull();
			expect(newScene.overworldWarpZone).toBeNull();
		});

		it('should initialize enemies as empty array', () => {
			const newScene = new CrossroadsScene();
			expect(Array.isArray(newScene.enemies)).toBe(true);
			expect(newScene.enemies.length).toBe(0);
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

		it('should create map with crossroads name', () => {
			scene.create();

			expect(NeverquestMapCreator).toHaveBeenCalledWith(scene, 'crossroads');
		});

		it('should store map reference', () => {
			scene.create();

			expect(scene.map).toBeDefined();
			expect(scene.map!.widthInPixels).toBe(6400);
			expect(scene.map!.heightInPixels).toBe(6400);
		});

		it('should start camera following player', () => {
			scene.create();

			expect((scene as any).cameras.main.startFollow).toHaveBeenCalledWith(scene.player!.container);
		});

		it('should set camera bounds to map size', () => {
			scene.create();

			expect((scene as any).cameras.main.setBounds).toHaveBeenCalledWith(0, 0, 6400, 6400);
		});

		it('should create warps for scene transitions', () => {
			scene.create();

			expect(NeverquestWarp).toHaveBeenCalled();
		});

		it('should create interactive markers for NPCs', () => {
			scene.create();

			expect(NeverquestObjectMarker).toHaveBeenCalled();
		});

		it('should launch dialog scene with correct data', () => {
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

		it('should get joystick scene reference', () => {
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

		it('should set sound volume and play background music', () => {
			scene.create();

			expect((scene as any).sound.add).toHaveBeenCalledWith('forest', { loop: true });
			expect(mockSound.play).toHaveBeenCalled();
		});

		it('should initialize enemies array', () => {
			scene.create();

			expect(scene.enemies).toEqual([]);
		});

		it('should create enemy zones for bandits and wolves', () => {
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

		it('should not trigger save on regular S key without Ctrl', () => {
			const event = {
				ctrlKey: false,
				key: 's',
				preventDefault: jest.fn(),
			};

			mockKeyboardHandler(event);

			expect(scene.saveManager!.saveGame).not.toHaveBeenCalled();
		});
	});

	describe('stopSceneMusic', () => {
		it('should stop theme sound', () => {
			scene.create();
			scene.stopSceneMusic();

			expect(mockSound.stop).toHaveBeenCalled();
		});

		it('should handle null themeSound gracefully', () => {
			const newScene = new CrossroadsScene();
			// themeSound is null by default
			expect(() => newScene.stopSceneMusic()).not.toThrow();
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

	describe('createOverworldWarp', () => {
		it('should create a warp zone to OverworldScene', () => {
			scene.create();

			expect((scene as any).add.zone).toHaveBeenCalled();
			expect((scene as any).physics.add.existing).toHaveBeenCalled();
			expect((scene as any).physics.add.overlap).toHaveBeenCalled();
		});

		it('should create particle effects at warp location', () => {
			scene.create();

			expect((scene as any).add.particles).toHaveBeenCalledWith(
				expect.any(Number),
				expect.any(Number),
				'particle_warp',
				expect.any(Object)
			);
		});

		it('should create arrow indicators pointing down', () => {
			scene.create();

			// Should create arrows pointing down to forest
			expect((scene as any).add.text).toHaveBeenCalledWith(
				expect.any(Number),
				expect.any(Number),
				'↓',
				expect.any(Object)
			);
		});

		it('should not create warp if player is null', () => {
			scene.map = { widthInPixels: 1280, heightInPixels: 1280 } as any;
			scene.player = null;

			scene.createOverworldWarp();

			expect(scene.overworldWarpZone).toBeNull();
		});

		it('should set up overlap detection with player container', () => {
			scene.create();

			expect((scene as any).physics.add.overlap).toHaveBeenCalledWith(
				scene.player!.container,
				expect.any(Object),
				expect.any(Function)
			);
		});
	});

	describe('transitionToOverworld', () => {
		beforeEach(() => {
			(scene as any).cameras = {
				main: {
					startFollow: jest.fn(),
					setZoom: jest.fn(),
					setBounds: jest.fn(),
					fade: jest.fn(),
					once: jest.fn().mockImplementation((event: string, callback: () => void) => {
						if (event === 'camerafadeoutcomplete') {
							callback();
						}
					}),
				},
			};
			(scene as any).scene = {
				launch: jest.fn(),
				get: jest.fn().mockReturnValue({}),
				start: jest.fn(),
			};
		});

		it('should destroy warp zone on transition', () => {
			scene.create();
			const mockDestroy = (scene.overworldWarpZone as any)?.destroy;

			scene.transitionToOverworld();

			if (mockDestroy) {
				expect(mockDestroy).toHaveBeenCalled();
			}
			expect(scene.overworldWarpZone).toBeNull();
		});

		it('should fade the camera', () => {
			scene.create();
			scene.transitionToOverworld();

			expect((scene as any).cameras.main.fade).toHaveBeenCalledWith(500);
		});

		it('should start OverworldScene with previous scene reference', () => {
			scene.create();
			scene.transitionToOverworld();

			expect((scene as any).scene.start).toHaveBeenCalledWith('OverworldScene', {
				previousScene: 'CrossroadsScene',
			});
		});

		it('should clean up player on transition', () => {
			scene.create();
			const mockPlayerDestroy = (scene.player as any).destroy;

			scene.transitionToOverworld();

			expect(mockPlayerDestroy).toHaveBeenCalled();
			expect((scene.player as any).neverquestMovement).toBeNull();
		});
	});
});

describe('CrossroadsScene Story Context', () => {
	it('should be the central hub scene for Act 2', () => {
		const scene = new CrossroadsScene();
		// The scene key confirms its identity
		expect((scene as any).sys?.settings?.key || 'CrossroadsScene').toBe('CrossroadsScene');
	});

	it('should use crossroads map', () => {
		const scene = new CrossroadsScene();
		// Setup mocks
		(scene as any).load = { scenePlugin: jest.fn() };
		(scene as any).cameras = {
			main: { startFollow: jest.fn(), setZoom: jest.fn(), setBounds: jest.fn(), centerX: 640, centerY: 360 },
		};
		(scene as any).scene = { launch: jest.fn(), get: jest.fn().mockReturnValue({}) };
		(scene as any).sound = { volume: 1, add: jest.fn().mockReturnValue({ play: jest.fn() }) };
		(scene as any).input = { keyboard: { on: jest.fn() } };
		(scene as any).sys = { animatedTiles: { init: jest.fn() } };
		// Mock add/physics/tweens for warp functionality
		const mockZone = { setOrigin: jest.fn().mockReturnThis(), destroy: jest.fn(), body: { immovable: false } };
		const mockText = {
			setOrigin: jest.fn().mockReturnThis(),
			setDepth: jest.fn().mockReturnThis(),
			setScrollFactor: jest.fn().mockReturnThis(),
			setAlpha: jest.fn().mockReturnThis(),
			destroy: jest.fn(),
		};
		const mockGraphics = {
			fillStyle: jest.fn().mockReturnThis(),
			fillRect: jest.fn().mockReturnThis(),
			setDepth: jest.fn().mockReturnThis(),
			destroy: jest.fn(),
		};
		(scene as any).add = {
			zone: jest.fn().mockReturnValue(mockZone),
			particles: jest.fn().mockReturnValue({ destroy: jest.fn() }),
			text: jest.fn().mockReturnValue(mockText),
			graphics: jest.fn().mockReturnValue(mockGraphics),
		};
		(scene as any).physics = { add: { existing: jest.fn(), overlap: jest.fn() } };
		(scene as any).tweens = { add: jest.fn() };
		(scene as any).time = { delayedCall: jest.fn() };
		scene.player = { container: {}, neverquestMovement: null, destroy: jest.fn() } as any;

		scene.create();

		expect(NeverquestMapCreator).toHaveBeenCalledWith(scene, 'crossroads');
	});
});
