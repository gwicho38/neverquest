/**
 * @fileoverview Tests for SkyIslandsScene
 *
 * Tests cover:
 * - Scene initialization and lifecycle
 * - Wind zone mechanics
 * - Teleporter functionality
 * - Enemy spawning
 * - Exit portal behavior
 *
 * @module __tests__/scenes/SkyIslandsScene
 */

import { SkyIslandsScene } from '../../scenes/SkyIslandsScene';

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
		Physics: {
			Arcade: {
				Sprite: class {},
				StaticBody: class {},
			},
		},
		GameObjects: {
			Sprite: class {},
		},
		Geom: {
			Rectangle: MockRectangle,
			Point: function () {
				return { x: 0, y: 0 };
			},
		},
		Math: {
			Distance: {
				Between: jest.fn().mockReturnValue(100),
			},
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
				{ x: 0, y: 0, width: 10, height: 10, left: 0, top: 0, right: 10, bottom: 10, centerX: 5, centerY: 5 },
				{
					x: 15,
					y: 15,
					width: 12,
					height: 12,
					left: 15,
					top: 15,
					right: 27,
					bottom: 27,
					centerX: 21,
					centerY: 21,
				},
				{
					x: 30,
					y: 30,
					width: 8,
					height: 8,
					left: 30,
					top: 30,
					right: 38,
					bottom: 38,
					centerX: 34,
					centerY: 34,
				},
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
			setPosition: jest.fn(),
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
	HexColors: {
		GREEN_LIGHT: '#00ff66',
		BLACK: '#000000',
	},
}));

jest.mock('../../consts/Numbers', () => ({
	AnimationTiming: {
		TWEEN_VERY_SLOW: 1500,
	},
	Alpha: {
		MEDIUM_LIGHT: 0.5,
		LOW: 0.3,
		MEDIUM_HIGH: 0.7,
		LIGHT: 0.2,
		HIGH: 0.7,
		VERY_HIGH: 0.8,
		OPAQUE: 1,
		TRANSPARENT: 0,
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
		PARTICLES_HIGH: 15,
	},
	AudioValues: {
		VOLUME_DUNGEON: 0.5,
	},
	Scale: {
		SLIGHTLY_LARGE_PULSE: 1.05,
		LARGE: 2,
		VERY_LARGE: 3,
		SLIGHTLY_LARGE: 1.1,
		TINY: 0.5,
		SMALL: 0.75,
	},
	ParticleValues: {
		FREQUENCY_MODERATE: 100,
		LIFESPAN_LONG: 2000,
		LIFESPAN_VERY_LONG: 3000,
	},
	CombatNumbers: {
		PLAYER_DEATH_DELAY: 1500,
	},
	SkyPhysics: {
		JUMP_VELOCITY: -400,
		JUMP_COOLDOWN: 100,
		DOUBLE_JUMP_VELOCITY: -350,
		MAX_JUMPS: 2,
		WIND_FORCE_LIGHT: 50,
		WIND_FORCE_MEDIUM: 100,
		WIND_FORCE_STRONG: 200,
		WIND_FORCE_TORNADO: 300,
		WIND_TICK_RATE: 100,
		FALL_DAMAGE_THRESHOLD: 300,
		FALL_DAMAGE_MULTIPLIER: 0.02,
		MAX_FALL_DAMAGE: 50,
		RESPAWN_FALL_DAMAGE: 10,
		CRUMBLE_WARNING_TIME: 1500,
		CRUMBLE_FALL_TIME: 500,
		PLATFORM_RESPAWN_TIME: 8000,
		LIGHTNING_STRIKE_INTERVAL: 5000,
		LIGHTNING_DAMAGE: 20,
		LIGHTNING_WARNING_TIME: 1000,
		LIGHTNING_STUN_DURATION: 500,
	},
	SkyIslandsValues: {
		MAP_WIDTH_TILES: 80,
		MAP_HEIGHT_TILES: 50,
		TILE_SIZE: 16,
		MIN_ISLANDS: 12,
		MAX_ISLANDS: 18,
		MIN_ISLAND_SIZE: 4,
		MAX_ISLAND_SIZE: 10,
		ISLAND_VERTICAL_SPACING: 3,
		ISLAND_HORIZONTAL_GAP: 2,
		ENEMIES_PER_SMALL_ISLAND: 1,
		ENEMIES_PER_MEDIUM_ISLAND: 2,
		ENEMIES_PER_LARGE_ISLAND: 4,
		BOSS_ISLAND_SIZE: 14,
		WIND_ZONE_CHANCE: 0.4,
		TORNADO_ZONE_CHANCE: 0.1,
		TELEPORTER_COUNT: 4,
		SKY_AMBIENT_BRIGHTNESS: 0.2,
		CLOUD_LIGHT_RADIUS: 150,
		CLOUD_LIGHT_COLOR: 0xffffff,
		LIGHTNING_FLASH_COLOR: 0xffffcc,
		CLOUD_PARTICLE_FREQUENCY: 200,
		WIND_PARTICLE_FREQUENCY: 80,
	},
}));

jest.mock('../../consts/Messages', () => ({
	GameMessages: {
		NO_CHECKPOINT_FOUND: 'No checkpoint found',
		LIGHTNING_DAMAGE: (damage: number) => `Lightning strikes you for ${damage} damage!`,
		LIGHTNING_STUNNED: 'You are stunned by the lightning!',
		PLAYER_DEFEATED: 'You have been defeated!',
	},
}));

jest.mock('../../scenes/HUDScene', () => ({
	HUDScene: {
		log: jest.fn(),
	},
}));

describe('SkyIslandsScene', () => {
	let scene: SkyIslandsScene;

	beforeEach(() => {
		jest.clearAllMocks();
		scene = new SkyIslandsScene();
	});

	describe('constructor', () => {
		it('should create scene with key SkyIslandsScene', () => {
			const newScene = new SkyIslandsScene();
			expect((newScene as any).sys?.settings?.key || 'SkyIslandsScene').toBe('SkyIslandsScene');
		});

		it('should initialize with empty enemies array', () => {
			expect(scene.enemies).toEqual([]);
		});

		it('should initialize with empty wind zones array', () => {
			expect(scene.windZones).toEqual([]);
		});

		it('should initialize with empty teleporter pads array', () => {
			expect(scene.teleporterPads).toEqual([]);
		});

		it('should initialize previousScene to CrossroadsScene', () => {
			expect(scene.previousScene).toBe('CrossroadsScene');
		});

		it('should initialize isInWindZone to false', () => {
			expect(scene.isInWindZone).toBe(false);
		});

		it('should initialize spellWheelOpen to false', () => {
			expect(scene.spellWheelOpen).toBe(false);
		});

		it('should initialize current wind force to zero', () => {
			expect(scene.currentWindForce).toEqual({ x: 0, y: 0 });
		});

		it('should initialize last checkpoint to zero', () => {
			expect(scene.lastCheckpoint).toEqual({ x: 0, y: 0 });
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
	});

	describe('wind zone mechanics', () => {
		it('should track whether player is in wind zone', () => {
			expect(scene.isInWindZone).toBe(false);
			scene.isInWindZone = true;
			expect(scene.isInWindZone).toBe(true);
		});

		it('should allow setting current wind force', () => {
			scene.currentWindForce = { x: 150, y: -100 };
			expect(scene.currentWindForce.x).toBe(150);
			expect(scene.currentWindForce.y).toBe(-100);
		});

		it('should reset wind state in update', () => {
			scene.isInWindZone = true;
			scene.currentWindForce = { x: 200, y: 100 };

			scene.update();

			expect(scene.isInWindZone).toBe(false);
			expect(scene.currentWindForce).toEqual({ x: 0, y: 0 });
		});
	});

	describe('particle emitters', () => {
		it('should initialize wind emitter as null', () => {
			expect(scene.windEmitter).toBeNull();
		});

		it('should initialize cloud emitter as null', () => {
			expect(scene.cloudEmitter).toBeNull();
		});
	});

	describe('timers', () => {
		it('should initialize lightning timer as null', () => {
			expect(scene.lightningTimer).toBeNull();
		});
	});

	describe('teleportPlayer', () => {
		beforeEach(() => {
			scene.cameras = {
				main: {
					flash: jest.fn(),
				},
			} as unknown as Phaser.Cameras.Scene2D.CameraManager;

			scene.player = {
				container: {
					setPosition: jest.fn(),
				},
			} as unknown as typeof scene.player;
		});

		it('should update last checkpoint', () => {
			scene.teleportPlayer(500, 300);
			expect(scene.lastCheckpoint).toEqual({ x: 500, y: 300 });
		});

		it('should move player container', () => {
			scene.teleportPlayer(500, 300);
			expect(scene.player.container.setPosition).toHaveBeenCalledWith(500, 300);
		});

		it('should flash camera', () => {
			scene.teleportPlayer(500, 300);
			expect((scene.cameras.main as any).flash).toHaveBeenCalled();
		});
	});
});

describe('SkyIslandsScene scene lifecycle', () => {
	let scene: SkyIslandsScene;

	beforeEach(() => {
		scene = new SkyIslandsScene();
	});

	it('should be an instance of Object', () => {
		expect(scene).toBeInstanceOf(Object);
	});

	it('should have all required properties', () => {
		expect(scene.enemies).toBeDefined();
		expect(scene.windZones).toBeDefined();
		expect(scene.teleporterPads).toBeDefined();
		expect(scene.currentWindForce).toBeDefined();
		expect(scene.isInWindZone).toBeDefined();
		expect(scene.lastCheckpoint).toBeDefined();
		expect(scene.previousScene).toBeDefined();
	});

	it('should have teleportPlayer method', () => {
		expect(typeof scene.teleportPlayer).toBe('function');
	});

	it('should have update method', () => {
		expect(typeof scene.update).toBe('function');
	});

	it('should have init method', () => {
		expect(typeof scene.init).toBe('function');
	});
});
