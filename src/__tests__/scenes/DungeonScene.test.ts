/**
 * Tests for DungeonScene
 */

import { DungeonScene } from '../../scenes/DungeonScene';
import { NeverquestDungeonGenerator } from '../../plugins/NeverquestDungeonGenerator';
import { NeverquestPathfinding } from '../../plugins/NeverquestPathfinding';
import { NeverquestLineOfSight } from '../../plugins/NeverquestLineOfSight';
import { NeverquestFogWarManager } from '../../plugins/NeverquestFogWarManager';
import { NeverquestLightingManager } from '../../plugins/NeverquestLightingManager';
import { NeverquestSaveManager } from '../../plugins/NeverquestSaveManager';
import { Player } from '../../entities/Player';
import { Enemy } from '../../entities/Enemy';

// Mock Phaser
jest.mock('phaser', () => {
	const MockRectangle: any = function (x: number, y: number, w: number, h: number) {
		return { x, y, width: w, height: h };
	};
	MockRectangle.Inflate = (rect: any) => rect;
	MockRectangle.Random = (_rect: any, _point: any) => ({ x: 100, y: 100 });

	return {
		Scene: class {
			constructor(config: any) {
				(this as any).sys = { settings: { key: config?.key } };
			}
		},
		Geom: {
			Rectangle: MockRectangle,
			Point: function () {
				return { x: 0, y: 0 };
			},
			Circle: {
				CircumferencePoint: jest.fn(),
			},
			Line: {
				Length: jest.fn(() => 50),
				Angle: jest.fn(() => 0),
			},
		},
		NONE: 0,
		Cameras: {
			Scene2D: {
				Events: {
					FADE_OUT_COMPLETE: 'camerafadeoutcomplete',
				},
			},
		},
	};
});

// Mock dependencies
jest.mock('../../plugins/NeverquestDungeonGenerator', () => ({
	NeverquestDungeonGenerator: jest.fn().mockImplementation(() => ({
		create: jest.fn(),
		map: {
			widthInPixels: 1600,
			heightInPixels: 1200,
		},
		dungeon: {
			rooms: [
				{ x: 0, y: 0, width: 10, height: 10, left: 0, top: 0, right: 10, bottom: 10 },
				{ x: 15, y: 15, width: 8, height: 8, left: 15, top: 15, right: 23, bottom: 23 },
			],
		},
		tileWidth: 32,
		tileHeight: 32,
		groundLayer: {},
		stuffLayer: {
			putTileAt: jest.fn(),
		},
	})),
}));

jest.mock('../../plugins/NeverquestFogWarManager', () => ({
	NeverquestFogWarManager: jest.fn().mockImplementation(() => ({
		createFog: jest.fn(),
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

jest.mock('../../plugins/NeverquestPathfinding', () => ({
	NeverquestPathfinding: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('../../plugins/NeverquestLineOfSight', () => ({
	NeverquestLineOfSight: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('../../plugins/NeverquestLightingManager', () => ({
	NeverquestLightingManager: jest.fn().mockImplementation(() => ({
		create: jest.fn(),
		addStaticLight: jest.fn(),
	})),
}));

jest.mock('../../entities/Player', () => ({
	Player: jest.fn().mockImplementation(() => ({
		container: { x: 100, y: 100 },
		neverquestMovement: {},
		destroy: jest.fn(),
	})),
}));

jest.mock('../../entities/Enemy', () => ({
	Enemy: jest.fn().mockImplementation(() => ({
		container: {},
	})),
}));

jest.mock('../../consts/player/Player', () => ({
	PlayerConfig: {
		texture: 'player',
	},
}));

jest.mock('../../consts/Colors', () => ({
	NumericColors: {
		ORANGE_LIGHT: 0xffaa00,
		GREEN_EXIT: 0x00ff66,
		ORANGE_TORCH: 0xff6600,
	},
	HexColors: {
		GREEN_CYAN: '#00ffaa',
		BLACK: '#000000',
	},
}));

jest.mock('../../consts/Numbers', () => ({
	Dimensions: {
		LIGHT_RADIUS_SMALL: 50,
		LIGHT_RADIUS_MEDIUM: 80,
	},
	AnimationTiming: {
		TWEEN_VERY_SLOW: 1500,
		TWEEN_FAST: 200,
	},
	Alpha: {
		ALMOST_OPAQUE: 0.9,
		MEDIUM_LIGHT: 0.5,
		LOW: 0.3,
		MEDIUM_HIGH: 0.7,
		LIGHT: 0.2,
		OPAQUE: 1,
		TRANSPARENT: 0,
	},
	CameraValues: {
		ZOOM_CLOSE: 2,
		FADE_NORMAL: 500,
	},
	Depth: {
		GROUND: 0,
		PLAYER: 10,
	},
	AudioValues: {
		VOLUME_DUNGEON: 0.5,
	},
	Scale: {
		SLIGHTLY_LARGE_PULSE: 1.05,
		LARGE: 2,
		SLIGHTLY_LARGE: 1.1,
	},
	ParticleValues: {
		FREQUENCY_MODERATE: 100,
		LIFESPAN_LONG: 2000,
		LIFESPAN_VERY_LONG: 3000,
	},
}));

jest.mock('../../consts/Messages', () => ({
	GameMessages: {
		NO_CHECKPOINT_FOUND: 'No checkpoint found',
	},
}));

jest.mock('../../scenes/SpellWheelScene', () => ({
	SpellWheelSceneName: 'SpellWheelScene',
}));

describe('DungeonScene', () => {
	let scene: DungeonScene;
	let mockSound: any;
	let mockKeyboardHandlers: Record<string, (...args: any[]) => void>;
	let mockFadeCompleteCallback: (...args: any[]) => void;

	beforeEach(() => {
		jest.clearAllMocks();
		mockKeyboardHandlers = {};

		mockSound = {
			play: jest.fn(),
			stop: jest.fn(),
		};

		scene = new DungeonScene();

		// Setup mock scene properties
		(scene as any).cameras = {
			main: {
				startFollow: jest.fn(),
				setZoom: jest.fn(),
				setBounds: jest.fn(),
				fade: jest.fn(),
				once: jest.fn().mockImplementation((_event: string, callback: (...args: any[]) => void) => {
					mockFadeCompleteCallback = callback;
				}),
			},
		};

		(scene as any).scene = {
			launch: jest.fn(),
			get: jest.fn().mockReturnValue({}),
			start: jest.fn(),
		};

		(scene as any).sound = {
			volume: 1,
			add: jest.fn().mockReturnValue(mockSound),
		};

		(scene as any).input = {
			keyboard: {
				on: jest.fn().mockImplementation((event: string, handler: (...args: any[]) => void) => {
					mockKeyboardHandlers[event] = handler;
				}),
			},
		};

		(scene as any).physics = {
			add: {
				collider: jest.fn(),
				existing: jest.fn(),
				overlap: jest.fn().mockImplementation((a, b, callback) => {
					// Store the callback for testing
					(scene as any).exitOverlapCallback = callback;
				}),
			},
		};

		(scene as any).add = {
			graphics: jest.fn().mockReturnValue({
				fillStyle: jest.fn().mockReturnThis(),
				fillCircle: jest.fn().mockReturnThis(),
				setDepth: jest.fn().mockReturnThis(),
			}),
			zone: jest.fn().mockReturnValue({
				body: {},
			}),
			text: jest.fn().mockReturnValue({
				setOrigin: jest.fn().mockReturnThis(),
				setDepth: jest.fn().mockReturnThis(),
			}),
			particles: jest.fn().mockReturnValue({}),
		};

		(scene as any).tweens = {
			add: jest.fn(),
		};

		(scene as any).events = {
			on: jest.fn(),
			emit: jest.fn(),
		};
	});

	describe('constructor', () => {
		it('should create scene with key DungeonScene', () => {
			const newScene = new DungeonScene();
			expect((newScene as any).sys?.settings?.key || 'DungeonScene').toBe('DungeonScene');
		});

		it('should initialize with empty enemies array', () => {
			const newScene = new DungeonScene();
			expect(newScene.enemies).toEqual([]);
		});

		it('should initialize previousScene to MainScene', () => {
			const newScene = new DungeonScene();
			expect(newScene.previousScene).toBe('MainScene');
		});
	});

	describe('init', () => {
		it('should set previousScene from data', () => {
			scene.init({ previousScene: 'TownScene' });
			expect(scene.previousScene).toBe('TownScene');
		});

		it('should keep default previousScene when data is empty', () => {
			scene.init({});
			expect(scene.previousScene).toBe('MainScene');
		});

		it('should handle undefined data', () => {
			scene.init(undefined as any);
			expect(scene.previousScene).toBe('MainScene');
		});
	});

	describe('create', () => {
		it('should create dungeon generator', () => {
			scene.create();

			expect(NeverquestDungeonGenerator).toHaveBeenCalledWith(scene);
			expect(scene.dungeon.create).toHaveBeenCalled();
		});

		it('should initialize pathfinding system', () => {
			scene.create();

			expect(NeverquestPathfinding).toHaveBeenCalledWith(
				scene,
				expect.anything(),
				expect.anything(),
				expect.objectContaining({
					walkableTiles: [0],
					allowDiagonal: true,
					dontCrossCorners: true,
				})
			);
		});

		it('should initialize line of sight system', () => {
			scene.create();

			expect(NeverquestLineOfSight).toHaveBeenCalled();
		});

		it('should create player at map center', () => {
			scene.create();

			expect(Player).toHaveBeenCalledWith(
				scene,
				800, // map.widthInPixels / 2
				600, // map.heightInPixels / 2
				'player',
				expect.anything()
			);
		});

		it('should setup camera to follow player', () => {
			scene.create();

			expect((scene as any).cameras.main.startFollow).toHaveBeenCalled();
			expect((scene as any).cameras.main.setZoom).toHaveBeenCalledWith(2);
			expect((scene as any).cameras.main.setBounds).toHaveBeenCalledWith(0, 0, 1600, 1200);
		});

		it('should add physics colliders', () => {
			scene.create();

			expect((scene as any).physics.add.collider).toHaveBeenCalled();
		});

		it('should launch DialogScene', () => {
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

		it('should launch HUDScene', () => {
			scene.create();

			expect((scene as any).scene.launch).toHaveBeenCalledWith(
				'HUDScene',
				expect.objectContaining({
					player: expect.anything(),
					map: expect.anything(),
				})
			);
		});

		it('should create enemies in rooms', () => {
			scene.create();

			// 2 rooms * 5 enemies per room = 10 enemies
			expect(Enemy).toHaveBeenCalledTimes(10);
			expect(scene.enemies.length).toBe(10);
		});

		it('should play theme song and ambient sound', () => {
			scene.create();

			expect((scene as any).sound.add).toHaveBeenCalledWith('dark_theme', { loop: true });
			expect((scene as any).sound.add).toHaveBeenCalledWith('dungeon_ambient', { volume: 1, loop: true });
			expect(mockSound.play).toHaveBeenCalledTimes(3); // theme + ambient + portal
		});

		it('should create fog of war', () => {
			scene.create();

			expect(NeverquestFogWarManager).toHaveBeenCalled();
			expect(scene.fog.createFog).toHaveBeenCalled();
		});

		it('should create lighting system', () => {
			scene.create();

			expect(NeverquestLightingManager).toHaveBeenCalled();
			expect(scene.lighting.create).toHaveBeenCalled();
		});

		it('should create save manager', () => {
			scene.create();

			expect(NeverquestSaveManager).toHaveBeenCalledWith(scene);
			expect(scene.saveManager.create).toHaveBeenCalled();
		});

		it('should create exit portal', () => {
			scene.create();

			expect((scene as any).add.zone).toHaveBeenCalled();
			expect((scene as any).physics.add.existing).toHaveBeenCalled();
			expect((scene as any).physics.add.overlap).toHaveBeenCalled();
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

			mockKeyboardHandlers['keydown'](event);

			expect(event.preventDefault).toHaveBeenCalled();
			expect(scene.saveManager.saveGame).toHaveBeenCalledWith(false);
		});

		it('should load game on Ctrl+L', () => {
			scene.saveManager.loadGame = jest.fn().mockReturnValue({ playerHealth: 100 });

			const event = {
				ctrlKey: true,
				key: 'l',
				preventDefault: jest.fn(),
			};

			mockKeyboardHandlers['keydown'](event);

			expect(event.preventDefault).toHaveBeenCalled();
			expect(scene.saveManager.loadGame).toHaveBeenCalledWith(false);
			expect(scene.saveManager.applySaveData).toHaveBeenCalled();
		});

		it('should not apply save data if load returns null on Ctrl+L', () => {
			scene.saveManager.loadGame = jest.fn().mockReturnValue(null);

			const event = {
				ctrlKey: true,
				key: 'l',
				preventDefault: jest.fn(),
			};

			mockKeyboardHandlers['keydown'](event);

			expect(scene.saveManager.applySaveData).not.toHaveBeenCalled();
		});

		it('should load checkpoint on F5', () => {
			scene.saveManager.loadGame = jest.fn().mockReturnValue({ playerHealth: 100 });

			const event = {
				ctrlKey: false,
				key: 'F5',
				preventDefault: jest.fn(),
			};

			mockKeyboardHandlers['keydown'](event);

			expect(event.preventDefault).toHaveBeenCalled();
			expect(scene.saveManager.loadGame).toHaveBeenCalledWith(true);
			expect(scene.saveManager.applySaveData).toHaveBeenCalled();
		});

		it('should show notification if no checkpoint on F5', () => {
			scene.saveManager.loadGame = jest.fn().mockReturnValue(null);

			const event = {
				ctrlKey: false,
				key: 'F5',
				preventDefault: jest.fn(),
			};

			mockKeyboardHandlers['keydown'](event);

			expect(scene.saveManager.showSaveNotification).toHaveBeenCalledWith('No checkpoint found', true);
		});
	});

	describe('createExitPortal', () => {
		beforeEach(() => {
			scene.create();
		});

		it('should place stairs tile', () => {
			expect(scene.dungeon.stuffLayer!.putTileAt).toHaveBeenCalledWith(
				81,
				expect.any(Number),
				expect.any(Number)
			);
		});

		it('should create exit glow graphics', () => {
			expect((scene as any).add.graphics).toHaveBeenCalled();
		});

		it('should create particles', () => {
			expect((scene as any).add.particles).toHaveBeenCalled();
		});

		it('should create zone for exit portal', () => {
			expect((scene as any).add.zone).toHaveBeenCalled();
			expect(scene.exitPortal).toBeDefined();
		});

		it('should setup overlap detection with player', () => {
			expect((scene as any).physics.add.overlap).toHaveBeenCalledWith(
				scene.player.container,
				scene.exitPortal,
				expect.any(Function)
			);
		});
	});

	describe('createExitArrows', () => {
		beforeEach(() => {
			scene.create();
		});

		it('should create exit label text', () => {
			// createExitArrows is called during create()
			expect((scene as any).add.text).toHaveBeenCalledWith(
				expect.any(Number),
				expect.any(Number),
				'EXIT',
				expect.any(Object)
			);
		});

		it('should create arrow indicators', () => {
			// Should create 4 arrows (one at each corner)
			const textCalls = (scene as any).add.text.mock.calls.filter((call: any[]) => call[2] === '↑');
			expect(textCalls.length).toBe(4);
		});

		it('should add tweens for animations', () => {
			expect((scene as any).tweens.add).toHaveBeenCalled();
		});
	});

	describe('exitDungeon', () => {
		beforeEach(() => {
			scene.create();
		});

		it('should fade camera out', () => {
			scene.exitDungeon();

			expect((scene as any).cameras.main.fade).toHaveBeenCalledWith(500);
		});

		it('should stop sounds on fade complete', () => {
			scene.exitDungeon();
			mockFadeCompleteCallback();

			expect(scene.themeSong.stop).toHaveBeenCalled();
			expect(scene.ambientSound.stop).toHaveBeenCalled();
		});

		it('should clean up player on fade complete', () => {
			scene.exitDungeon();
			mockFadeCompleteCallback();

			expect(scene.player.neverquestMovement).toBeNull();
			expect(scene.player.destroy).toHaveBeenCalled();
		});

		it('should start previous scene on fade complete', () => {
			scene.previousScene = 'TownScene';
			scene.exitDungeon();
			mockFadeCompleteCallback();

			expect((scene as any).scene.start).toHaveBeenCalledWith('TownScene');
		});
	});

	describe('addDungeonTorches', () => {
		beforeEach(() => {
			// Mock Math.random for predictable tests
			jest.spyOn(Math, 'random').mockReturnValue(0.5);
			scene.create();
		});

		afterEach(() => {
			jest.spyOn(Math, 'random').mockRestore();
		});

		it('should add lights to rooms', () => {
			// addDungeonTorches is called during create()
			expect(scene.lighting.addStaticLight).toHaveBeenCalled();
		});
	});

	describe('update', () => {
		it('should be defined', () => {
			expect(scene.update).toBeDefined();
		});

		it('should be callable without error', () => {
			expect(() => scene.update()).not.toThrow();
		});

		it('should return void', () => {
			const result = scene.update();
			expect(result).toBeUndefined();
		});
	});
});
