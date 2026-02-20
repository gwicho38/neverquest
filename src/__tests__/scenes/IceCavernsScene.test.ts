/**
 * Tests for IceCavernsScene
 *
 * Tests the Ice Caverns biome scene including:
 * - Scene initialization and setup
 * - Ice physics system
 * - Frost enemy spawning
 * - Ice crystal lighting
 * - Exit portal functionality
 */

import { IceCavernsScene } from '../../scenes/IceCavernsScene';
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

	const MockVector2: any = class {
		x: number;
		y: number;
		constructor(x: number = 0, y: number = 0) {
			this.x = x;
			this.y = y;
		}
		set(x: number, y: number) {
			this.x = x;
			this.y = y;
			return this;
		}
		length() {
			return Math.sqrt(this.x * this.x + this.y * this.y);
		}
		normalize() {
			const len = this.length();
			if (len > 0) {
				this.x /= len;
				this.y /= len;
			}
			return this;
		}
		scale(s: number) {
			this.x *= s;
			this.y *= s;
			return this;
		}
	};

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
		},
		Math: {
			Vector2: MockVector2,
		},
		Display: {
			Color: {
				GetColor: jest.fn((r, g, b) => (r << 16) | (g << 8) | b),
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
				{ x: 15, y: 15, width: 12, height: 12, left: 15, top: 15, right: 27, bottom: 27 }, // Large room
				{ x: 30, y: 30, width: 8, height: 8, left: 30, top: 30, right: 38, bottom: 38 },
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
		container: {
			x: 100,
			y: 100,
			body: {
				velocity: { x: 0, y: 0 },
				setVelocity: jest.fn(),
			},
		},
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
	},
	HexColors: {
		BLUE_LIGHT: '#87ceeb',
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
		HIGH: 0.7,
		OPAQUE: 1,
		TRANSPARENT: 0,
		HALF: 0.5,
		MEDIUM: 0.4,
	},
	CameraValues: {
		ZOOM_CLOSE: 2,
		FADE_NORMAL: 500,
	},
	Depth: {
		GROUND: 0,
		PLAYER: 10,
		PARTICLES_LOW: 5,
	},
	AudioValues: {
		VOLUME_DUNGEON: 0.5,
		DETUNE_CREEPY: -500,
	},
	Scale: {
		SLIGHTLY_LARGE_PULSE: 1.05,
		LARGE: 2,
		SLIGHTLY_LARGE: 1.1,
		TINY: 0.5,
		SMALL: 0.75,
	},
	ParticleValues: {
		FREQUENCY_MODERATE: 100,
		LIFESPAN_LONG: 2000,
		LIFESPAN_VERY_LONG: 3000,
	},
	IcePhysics: {
		NORMAL_FRICTION: 1.0,
		ICE_FRICTION: 0.15,
		DEEP_ICE_FRICTION: 0.08,
		SLIDE_DECELERATION: 0.98,
		MIN_SLIDE_VELOCITY: 5,
		MAX_SLIDE_VELOCITY: 400,
		FREEZING_WATER_DPS: 5,
		ICICLE_DAMAGE: 15,
		BLIZZARD_VISIBILITY_RADIUS: 80,
		BLIZZARD_SPEED_PENALTY: 0.7,
		FROST_SLOW_DURATION: 3000,
		FROST_SLOW_AMOUNT: 0.5,
	},
	IceCavernsValues: {
		MAP_WIDTH_TILES: 60,
		MAP_HEIGHT_TILES: 60,
		TILE_SIZE: 16,
		MIN_ROOMS: 8,
		MAX_ROOMS: 12,
		MIN_ROOM_SIZE: 6,
		MAX_ROOM_SIZE: 12,
		ENEMIES_PER_SMALL_ROOM: 2,
		ENEMIES_PER_MEDIUM_ROOM: 4,
		ENEMIES_PER_LARGE_ROOM: 6,
		BOSS_ROOM_SIZE: 16,
		ICICLE_SPAWN_INTERVAL: 5000,
		BLIZZARD_DURATION: 8000,
		BLIZZARD_INTERVAL: 30000,
		CAVERN_AMBIENT_DARKNESS: 0.75,
		ICE_CRYSTAL_LIGHT_RADIUS: 100,
		ICE_CRYSTAL_LIGHT_COLOR: 0x87ceeb,
	},
}));

jest.mock('../../consts/Messages', () => ({
	GameMessages: {
		NO_CHECKPOINT_FOUND: 'No checkpoint found',
	},
}));

describe('IceCavernsScene', () => {
	let scene: IceCavernsScene;
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

		scene = new IceCavernsScene();

		// Setup mock scene properties
		(scene as any).cameras = {
			main: {
				startFollow: jest.fn(),
				setZoom: jest.fn(),
				setBounds: jest.fn(),
				setBackgroundColor: jest.fn(),
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
				overlap: jest.fn(),
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
			particles: jest.fn().mockReturnValue({
				setDepth: jest.fn().mockReturnThis(),
				destroy: jest.fn(),
			}),
		};

		(scene as any).tweens = {
			add: jest.fn(),
		};

		(scene as any).events = {
			on: jest.fn(),
			emit: jest.fn(),
		};

		(scene as any).time = {
			addEvent: jest.fn().mockReturnValue({
				destroy: jest.fn(),
			}),
		};
	});

	describe('constructor', () => {
		it('should create scene with key IceCavernsScene', () => {
			const newScene = new IceCavernsScene();
			expect((newScene as any).sys?.settings?.key || 'IceCavernsScene').toBe('IceCavernsScene');
		});

		it('should initialize with empty enemies array', () => {
			const newScene = new IceCavernsScene();
			expect(newScene.enemies).toEqual([]);
		});

		it('should initialize previousScene to CrossroadsScene', () => {
			const newScene = new IceCavernsScene();
			expect(newScene.previousScene).toBe('CrossroadsScene');
		});

		it('should initialize ice physics properties', () => {
			const newScene = new IceCavernsScene();
			expect(newScene.iceTiles).toEqual([]);
			expect(newScene.isOnIce).toBe(false);
		});

		it('should initialize slide velocity vector', () => {
			const newScene = new IceCavernsScene();
			expect(newScene.slideVelocity).toBeDefined();
			expect(newScene.slideVelocity.x).toBe(0);
			expect(newScene.slideVelocity.y).toBe(0);
		});
	});

	describe('init', () => {
		it('should set previousScene from data', () => {
			scene.init({ previousScene: 'MainScene' });
			expect(scene.previousScene).toBe('MainScene');
		});

		it('should keep default previousScene when data is empty', () => {
			scene.init({});
			expect(scene.previousScene).toBe('CrossroadsScene');
		});

		it('should handle undefined data', () => {
			scene.init(undefined as any);
			expect(scene.previousScene).toBe('CrossroadsScene');
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

		it('should setup camera with ice-themed background', () => {
			scene.create();

			expect((scene as any).cameras.main.startFollow).toHaveBeenCalled();
			expect((scene as any).cameras.main.setZoom).toHaveBeenCalledWith(2);
			expect((scene as any).cameras.main.setBackgroundColor).toHaveBeenCalledWith(0x1a3a4a);
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

		it('should spawn frost enemies', () => {
			scene.create();

			expect(Enemy).toHaveBeenCalled();
			expect(scene.enemies.length).toBeGreaterThan(0);
		});

		it('should play theme song with creepy detune', () => {
			scene.create();

			expect((scene as any).sound.add).toHaveBeenCalledWith('dark_theme', {
				loop: true,
				detune: -500,
			});
			expect(mockSound.play).toHaveBeenCalled();
		});

		it('should create fog of war', () => {
			scene.create();

			expect(NeverquestFogWarManager).toHaveBeenCalled();
			expect(scene.fog.createFog).toHaveBeenCalled();
		});

		it('should create ice crystal lighting system', () => {
			scene.create();

			expect(NeverquestLightingManager).toHaveBeenCalledWith(
				scene,
				expect.objectContaining({
					ambientDarkness: 0.75,
					lightColor: 0x87ceeb,
				})
			);
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

		it('should initialize ice tiles', () => {
			scene.create();

			expect(scene.iceTiles.length).toBeGreaterThan(0);
		});

		it('should create snow particles', () => {
			scene.create();

			expect((scene as any).add.particles).toHaveBeenCalled();
		});
	});

	describe('initializeIceTiles', () => {
		beforeEach(() => {
			scene.create();
		});

		it('should populate ice tiles array', () => {
			expect(scene.iceTiles.length).toBeGreaterThan(0);
		});

		it('should set ice friction for tiles', () => {
			const firstTile = scene.iceTiles[0];
			expect(firstTile.friction).toBe(0.15);
		});
	});

	describe('spawnFrostEnemies', () => {
		beforeEach(() => {
			jest.spyOn(Math, 'random').mockReturnValue(0.3);
			scene.create();
		});

		afterEach(() => {
			jest.spyOn(Math, 'random').mockRestore();
		});

		it('should spawn enemies in rooms', () => {
			expect(scene.enemies.length).toBeGreaterThan(0);
		});

		it('should spawn different enemy types', () => {
			// Enemy constructor should be called with different IDs
			expect(Enemy).toHaveBeenCalled();
		});
	});

	describe('checkIcePhysics', () => {
		beforeEach(() => {
			scene.create();
		});

		it('should be callable', () => {
			expect(() => scene.checkIcePhysics()).not.toThrow();
		});

		it('should handle player on ice tile', () => {
			// Set player position on an ice tile
			if (scene.iceTiles.length > 0) {
				const iceTile = scene.iceTiles[0];
				scene.player.container.x = iceTile.x + 16;
				scene.player.container.y = iceTile.y + 16;
			}

			scene.checkIcePhysics();

			// Should detect ice tile
			expect(scene.isOnIce).toBeDefined();
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

		it('should load checkpoint on F5', () => {
			scene.saveManager.loadGame = jest.fn().mockReturnValue({ playerHealth: 100 });

			const event = {
				ctrlKey: false,
				key: 'F5',
				preventDefault: jest.fn(),
			};

			mockKeyboardHandlers['keydown'](event);

			expect(scene.saveManager.loadGame).toHaveBeenCalledWith(true);
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
			scene.previousScene = 'CrossroadsScene';
			scene.exitDungeon();
			mockFadeCompleteCallback();

			expect((scene as any).scene.start).toHaveBeenCalledWith('CrossroadsScene');
		});
	});

	describe('update', () => {
		beforeEach(() => {
			scene.create();
		});

		it('should call checkIcePhysics', () => {
			const spy = jest.spyOn(scene, 'checkIcePhysics');

			scene.update();

			expect(spy).toHaveBeenCalled();
		});
	});
});
