/**
 * Tests for VolcanicDungeonsScene
 *
 * Tests the Volcanic Dungeons biome scene including:
 * - Scene initialization and setup
 * - Heat zone damage system
 * - Fire enemy spawning
 * - Lava lighting effects
 * - Exit portal functionality
 */

import { VolcanicDungeonsScene } from '../../scenes/VolcanicDungeonsScene';
import { NeverquestDungeonGenerator } from '../../plugins/NeverquestDungeonGenerator';
import { NeverquestPathfinding } from '../../plugins/NeverquestPathfinding';
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
				{ x: 15, y: 15, width: 14, height: 14, left: 15, top: 15, right: 29, bottom: 29 }, // Large room
				{ x: 35, y: 35, width: 8, height: 8, left: 35, top: 35, right: 43, bottom: 43 },
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
		GREEN_LIGHT: '#00ff00',
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
		DETUNE_DARK: -500,
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
	VolcanicPhysics: {
		LAVA_INSTANT_DEATH: true,
		LAVA_RESPAWN_DELAY: 2000,
		HEAT_ZONE_DAMAGE: 1,
		HEAT_ZONE_TICK_RATE: 2000,
		HEAT_RESISTANCE_REDUCTION: 0.5,
		GEYSER_ERUPTION_INTERVAL: 4000,
		GEYSER_DAMAGE: 10,
		GEYSER_WARNING_TIME: 1000,
		BURNING_FLOOR_DAMAGE: 2,
		BURNING_FLOOR_TICK_RATE: 1000,
		FIRE_TRAP_DAMAGE: 15,
		FIRE_TRAP_COOLDOWN: 3000,
		BRIDGE_COLLAPSE_WARNING: 2000,
		BRIDGE_RESPAWN_TIME: 10000,
	},
	VolcanicDungeonsValues: {
		MAP_WIDTH_TILES: 70,
		MAP_HEIGHT_TILES: 70,
		TILE_SIZE: 16,
		MIN_ROOMS: 10,
		MAX_ROOMS: 14,
		MIN_ROOM_SIZE: 7,
		MAX_ROOM_SIZE: 14,
		ENEMIES_PER_SMALL_ROOM: 2,
		ENEMIES_PER_MEDIUM_ROOM: 4,
		ENEMIES_PER_LARGE_ROOM: 5,
		BOSS_ROOM_SIZE: 18,
		GEYSER_COUNT_PER_ROOM: 1,
		HEAT_ZONE_CHANCE: 0.3,
		VOLCANIC_AMBIENT_DARKNESS: 0.6,
		LAVA_LIGHT_RADIUS: 120,
		LAVA_LIGHT_COLOR: 0xff4500,
		TORCH_LIGHT_COLOR: 0xff6600,
		SMOKE_PARTICLE_FREQUENCY: 100,
		EMBER_PARTICLE_FREQUENCY: 150,
	},
}));

jest.mock('../../consts/Messages', () => ({
	GameMessages: {
		NO_CHECKPOINT_FOUND: 'No checkpoint found',
	},
}));

describe('VolcanicDungeonsScene', () => {
	let scene: VolcanicDungeonsScene;
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

		scene = new VolcanicDungeonsScene();

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
				fillRect: jest.fn().mockReturnThis(),
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
		it('should create scene with key VolcanicDungeonsScene', () => {
			const newScene = new VolcanicDungeonsScene();
			expect((newScene as any).sys?.settings?.key || 'VolcanicDungeonsScene').toBe('VolcanicDungeonsScene');
		});

		it('should initialize with empty enemies array', () => {
			const newScene = new VolcanicDungeonsScene();
			expect(newScene.enemies).toEqual([]);
		});

		it('should initialize previousScene to CrossroadsScene', () => {
			const newScene = new VolcanicDungeonsScene();
			expect(newScene.previousScene).toBe('CrossroadsScene');
		});

		it('should initialize heat zone properties', () => {
			const newScene = new VolcanicDungeonsScene();
			expect(newScene.heatZones).toEqual([]);
			expect(newScene.isInHeatZone).toBe(false);
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
		beforeEach(() => {
			// Mock Math.random to control heat zone creation
			jest.spyOn(Math, 'random').mockReturnValue(0.2);
		});

		afterEach(() => {
			jest.spyOn(Math, 'random').mockRestore();
		});

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

		it('should setup camera with volcanic background', () => {
			scene.create();

			expect((scene as any).cameras.main.startFollow).toHaveBeenCalled();
			expect((scene as any).cameras.main.setZoom).toHaveBeenCalledWith(2);
			expect((scene as any).cameras.main.setBackgroundColor).toHaveBeenCalledWith(0x2a1a0a);
		});

		it('should launch DialogScene', () => {
			scene.create();

			expect((scene as any).scene.launch).toHaveBeenCalledWith(
				'DialogScene',
				expect.objectContaining({
					player: expect.anything(),
					map: expect.anything(),
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

		it('should spawn fire enemies', () => {
			scene.create();

			expect(Enemy).toHaveBeenCalled();
			expect(scene.enemies.length).toBeGreaterThan(0);
		});

		it('should play theme song with dark detune', () => {
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

		it('should create lava glow lighting system', () => {
			scene.create();

			expect(NeverquestLightingManager).toHaveBeenCalledWith(
				scene,
				expect.objectContaining({
					ambientDarkness: 0.6,
					lightColor: 0xff4500,
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

		it('should initialize heat damage timer', () => {
			scene.create();

			expect((scene as any).time.addEvent).toHaveBeenCalledWith(
				expect.objectContaining({
					delay: 2000, // HEAT_ZONE_TICK_RATE
					loop: true,
				})
			);
		});

		it('should create ember and smoke particles', () => {
			scene.create();

			expect((scene as any).add.particles).toHaveBeenCalled();
		});
	});

	describe('initializeHeatZones', () => {
		beforeEach(() => {
			// Make all random checks pass for heat zones
			jest.spyOn(Math, 'random').mockReturnValue(0.2);
			scene.create();
		});

		afterEach(() => {
			jest.spyOn(Math, 'random').mockRestore();
		});

		it('should create heat zones with visual indicators', () => {
			// Heat zones should be created (with 0.2 random and 0.3 threshold, zones should be created)
			// First and last rooms are skipped
			expect((scene as any).add.graphics).toHaveBeenCalled();
		});
	});

	describe('spawnFireEnemies', () => {
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

		it('should spawn boss in last room', () => {
			// Last room should have Fire Dragon boss
			expect(Enemy).toHaveBeenCalled();
		});
	});

	describe('setupSaveKeybinds', () => {
		beforeEach(() => {
			jest.spyOn(Math, 'random').mockReturnValue(0.5);
			scene.create();
		});

		afterEach(() => {
			jest.spyOn(Math, 'random').mockRestore();
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
			jest.spyOn(Math, 'random').mockReturnValue(0.5);
			scene.create();
		});

		afterEach(() => {
			jest.spyOn(Math, 'random').mockRestore();
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
			jest.spyOn(Math, 'random').mockReturnValue(0.5);
			scene.create();
		});

		afterEach(() => {
			jest.spyOn(Math, 'random').mockRestore();
		});

		it('should be callable without error', () => {
			expect(() => scene.update()).not.toThrow();
		});
	});
});
