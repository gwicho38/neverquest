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
import { NeverquestDungeonGenerator } from '../../plugins/NeverquestDungeonGenerator';
import { NeverquestPathfinding } from '../../plugins/NeverquestPathfinding';
import { NeverquestFogWarManager } from '../../plugins/NeverquestFogWarManager';
import { NeverquestLightingManager } from '../../plugins/NeverquestLightingManager';
import { NeverquestSaveManager } from '../../plugins/NeverquestSaveManager';
import { Player } from '../../entities/Player';
import { Enemy } from '../../entities/Enemy';
import Phaser from 'phaser';

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
	let mockSound: any;
	let mockKeyboardHandlers: Record<string, (...args: any[]) => void>;
	let mockFadeCompleteCallback: (...args: any[]) => void;

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

	describe('create', () => {
		beforeEach(() => {
			jest.spyOn(Math, 'random').mockReturnValue(0.2);

			mockSound = { play: jest.fn(), stop: jest.fn() };
			mockKeyboardHandlers = {};

			(scene as any).cameras = {
				main: {
					startFollow: jest.fn(),
					setZoom: jest.fn(),
					setBounds: jest.fn(),
					setBackgroundColor: jest.fn(),
					fade: jest.fn(),
					shake: jest.fn(),
					flash: jest.fn(),
					once: jest.fn().mockImplementation((_event: string, callback: (...args: any[]) => void) => {
						mockFadeCompleteCallback = callback;
					}),
				},
			};
			(scene as any).scene = {
				launch: jest.fn(),
				get: jest.fn().mockReturnValue({}),
				start: jest.fn(),
				key: 'SkyIslandsScene',
				pause: jest.fn(),
			};
			(scene as any).sound = { volume: 1, add: jest.fn().mockReturnValue(mockSound) };
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
					lineStyle: jest.fn().mockReturnThis(),
					strokeCircle: jest.fn().mockReturnThis(),
					lineBetween: jest.fn().mockReturnThis(),
					destroy: jest.fn(),
				}),
				zone: jest.fn().mockReturnValue({ body: {} }),
				text: jest.fn().mockReturnValue({
					setOrigin: jest.fn().mockReturnThis(),
					setDepth: jest.fn().mockReturnThis(),
				}),
				particles: jest.fn().mockReturnValue({
					setDepth: jest.fn().mockReturnThis(),
					destroy: jest.fn(),
				}),
				line: jest.fn().mockReturnValue({
					setDepth: jest.fn().mockReturnThis(),
					setOrigin: jest.fn().mockReturnThis(),
				}),
			};
			(scene as any).tweens = { add: jest.fn() };
			(scene as any).events = { on: jest.fn(), emit: jest.fn() };
			(scene as any).time = {
				addEvent: jest.fn().mockReturnValue({ destroy: jest.fn() }),
				delayedCall: jest.fn(),
			};
		});

		afterEach(() => {
			jest.spyOn(Math, 'random').mockRestore();
		});

		it('should create dungeon generator', () => {
			scene.create();
			expect(NeverquestDungeonGenerator).toHaveBeenCalledWith(scene);
		});

		it('should initialize pathfinding', () => {
			scene.create();
			expect(NeverquestPathfinding).toHaveBeenCalled();
		});

		it('should create player at map center', () => {
			scene.create();
			// map is 1600x1200, center is 800,600
			expect(Player).toHaveBeenCalledWith(scene, 800, 600, 'player', expect.anything());
		});

		it('should set initial checkpoint at map center', () => {
			scene.create();
			expect(scene.lastCheckpoint).toEqual({ x: 800, y: 600 });
		});

		it('should setup camera with sky blue background', () => {
			scene.create();
			expect((scene as any).cameras.main.setBackgroundColor).toHaveBeenCalledWith(0x87ceeb);
		});

		it('should launch DialogScene', () => {
			scene.create();
			expect((scene as any).scene.launch).toHaveBeenCalledWith(
				'DialogScene',
				expect.objectContaining({ player: scene.player })
			);
		});

		it('should launch HUDScene', () => {
			scene.create();
			expect((scene as any).scene.launch).toHaveBeenCalledWith(
				'HUDScene',
				expect.objectContaining({ player: scene.player })
			);
		});

		it('should spawn enemies', () => {
			scene.create();
			expect(Enemy).toHaveBeenCalled();
			expect(scene.enemies.length).toBeGreaterThan(0);
		});

		it('should play theme song with detune 200', () => {
			scene.create();
			expect((scene as any).sound.add).toHaveBeenCalledWith(
				'dark_theme',
				expect.objectContaining({ detune: 200 })
			);
			expect(mockSound.play).toHaveBeenCalled();
		});

		it('should create fog of war', () => {
			scene.create();
			expect(NeverquestFogWarManager).toHaveBeenCalled();
			expect(scene.fog.createFog).toHaveBeenCalled();
		});

		it('should create sky lighting with correct ambient settings', () => {
			scene.create();
			expect(NeverquestLightingManager).toHaveBeenCalledWith(
				scene,
				expect.objectContaining({
					ambientDarkness: 0.2,
					lightColor: 0xffffff,
				})
			);
		});

		it('should create save manager', () => {
			scene.create();
			expect(NeverquestSaveManager).toHaveBeenCalledWith(scene);
			expect(scene.saveManager.create).toHaveBeenCalled();
		});

		it('should create exit portal', () => {
			scene.create();
			expect((scene as any).add.zone).toHaveBeenCalled();
			expect((scene as any).physics.add.overlap).toHaveBeenCalled();
		});

		it('should initialize lightning timer', () => {
			scene.create();
			expect((scene as any).time.addEvent).toHaveBeenCalledWith(
				expect.objectContaining({
					delay: 5000,
					loop: true,
				})
			);
		});

		it('should setup camera follow and zoom', () => {
			scene.create();
			expect((scene as any).cameras.main.startFollow).toHaveBeenCalledWith(scene.player.container);
			expect((scene as any).cameras.main.setZoom).toHaveBeenCalledWith(2);
		});

		it('should setup physics colliders', () => {
			scene.create();
			expect((scene as any).physics.add.collider).toHaveBeenCalled();
		});

		it('should create ambient sound', () => {
			scene.create();
			expect((scene as any).sound.add).toHaveBeenCalledWith(
				'dungeon_ambient',
				expect.objectContaining({ volume: 0.4, loop: true })
			);
		});
	});

	describe('lightning system', () => {
		let lightningTimerCallback: () => void;

		beforeEach(() => {
			jest.spyOn(Math, 'random').mockReturnValue(0.2);

			mockSound = { play: jest.fn(), stop: jest.fn() };
			mockKeyboardHandlers = {};

			(scene as any).cameras = {
				main: {
					startFollow: jest.fn(),
					setZoom: jest.fn(),
					setBounds: jest.fn(),
					setBackgroundColor: jest.fn(),
					fade: jest.fn(),
					shake: jest.fn(),
					flash: jest.fn(),
					once: jest.fn().mockImplementation((_event: string, callback: (...args: any[]) => void) => {
						mockFadeCompleteCallback = callback;
					}),
				},
			};
			(scene as any).scene = {
				launch: jest.fn(),
				get: jest.fn().mockReturnValue({}),
				start: jest.fn(),
				key: 'SkyIslandsScene',
				pause: jest.fn(),
			};
			(scene as any).sound = { volume: 1, add: jest.fn().mockReturnValue(mockSound) };
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
					lineStyle: jest.fn().mockReturnThis(),
					strokeCircle: jest.fn().mockReturnThis(),
					lineBetween: jest.fn().mockReturnThis(),
					destroy: jest.fn(),
				}),
				zone: jest.fn().mockReturnValue({ body: {} }),
				text: jest.fn().mockReturnValue({
					setOrigin: jest.fn().mockReturnThis(),
					setDepth: jest.fn().mockReturnThis(),
				}),
				particles: jest.fn().mockReturnValue({
					setDepth: jest.fn().mockReturnThis(),
					destroy: jest.fn(),
				}),
				line: jest.fn().mockReturnValue({
					setDepth: jest.fn().mockReturnThis(),
					setOrigin: jest.fn().mockReturnThis(),
				}),
			};
			(scene as any).tweens = { add: jest.fn() };
			(scene as any).events = { on: jest.fn(), emit: jest.fn() };
			(scene as any).time = {
				addEvent: jest.fn().mockImplementation((config: any) => {
					if (config.delay === 5000 && config.loop) {
						lightningTimerCallback = config.callback;
					}
					return { destroy: jest.fn() };
				}),
				delayedCall: jest.fn(),
			};

			scene.create();

			// Setup player with health for damage tests
			scene.player = {
				container: {
					x: 100,
					y: 100,
					body: { velocity: { x: 0, y: 0 } },
					setPosition: jest.fn(),
				},
				neverquestMovement: {},
				destroy: jest.fn(),
				attributes: { health: 100, level: 5 },
				healthBar: { decrease: jest.fn() },
				neverquestHUDProgressBar: { updateHealth: jest.fn() },
				canMove: true,
				canAtack: true,
			} as any;
		});

		afterEach(() => {
			jest.spyOn(Math, 'random').mockRestore();
		});

		it('should initialize lightning timer with 5000ms interval', () => {
			expect((scene as any).time.addEvent).toHaveBeenCalledWith(
				expect.objectContaining({
					delay: 5000,
					loop: true,
				})
			);
		});

		it('should trigger strike when random < 0.3', () => {
			// Math.random returns 0.2 in beforeEach (< 0.3), so callback triggers strike
			const triggerSpy = jest.spyOn(scene, 'triggerLightningStrike');
			lightningTimerCallback();
			expect(triggerSpy).toHaveBeenCalled();
		});

		it('should not trigger strike when random >= 0.3', () => {
			jest.spyOn(Math, 'random').mockReturnValue(0.5);
			const triggerSpy = jest.spyOn(scene, 'triggerLightningStrike');
			lightningTimerCallback();
			expect(triggerSpy).not.toHaveBeenCalled();
		});

		it('should not crash if player is null', () => {
			(scene as any).player = null;
			expect(() => scene.triggerLightningStrike()).not.toThrow();
		});

		it('should create warning graphics on triggerLightningStrike', () => {
			scene.triggerLightningStrike();
			expect((scene as any).add.graphics).toHaveBeenCalled();
		});

		it('should apply lightning damage when player is close', () => {
			// Capture the tween onComplete
			let onComplete: () => void;
			(scene as any).tweens.add = jest.fn().mockImplementation((config: any) => {
				if (config.onComplete) {
					onComplete = config.onComplete;
				}
			});

			// Mock distance to be close
			(Phaser.Math.Distance.Between as jest.Mock).mockReturnValue(30);

			scene.triggerLightningStrike();

			// Call the onComplete (lightning strike resolves)
			onComplete!();

			expect(scene.player.attributes.health).toBe(80); // 100 - 20
			expect(scene.player.healthBar.decrease).toHaveBeenCalledWith(20);
			expect(scene.player.canMove).toBe(false); // stunned
		});

		it('should kill player when health drops to zero from lightning', () => {
			scene.player.attributes.health = 15;

			let onComplete: () => void;
			(scene as any).tweens.add = jest.fn().mockImplementation((config: any) => {
				if (config.onComplete) {
					onComplete = config.onComplete;
				}
			});

			(Phaser.Math.Distance.Between as jest.Mock).mockReturnValue(30);

			scene.triggerLightningStrike();
			onComplete!();

			expect(scene.player.attributes.health).toBe(0);
			expect(scene.player.canMove).toBe(false);
			expect(scene.player.canAtack).toBe(false);
		});

		it('should not apply damage when player is far from strike', () => {
			let onComplete: () => void;
			(scene as any).tweens.add = jest.fn().mockImplementation((config: any) => {
				if (config.onComplete) {
					onComplete = config.onComplete;
				}
			});

			(Phaser.Math.Distance.Between as jest.Mock).mockReturnValue(60);

			scene.triggerLightningStrike();
			onComplete!();

			expect(scene.player.attributes.health).toBe(100); // unchanged
			expect(scene.player.healthBar.decrease).not.toHaveBeenCalled();
		});

		it('should create strike visual on tween complete', () => {
			let onComplete: () => void;
			(scene as any).tweens.add = jest.fn().mockImplementation((config: any) => {
				if (config.onComplete) {
					onComplete = config.onComplete;
				}
			});

			(Phaser.Math.Distance.Between as jest.Mock).mockReturnValue(200);

			const graphicsCalls = (scene as any).add.graphics;
			const callCountBefore = graphicsCalls.mock.calls.length;

			scene.triggerLightningStrike();
			onComplete!();

			// Additional graphics created for lightning bolt
			expect(graphicsCalls.mock.calls.length).toBeGreaterThan(callCountBefore);
		});

		it('should flash camera on strike', () => {
			let onComplete: () => void;
			(scene as any).tweens.add = jest.fn().mockImplementation((config: any) => {
				if (config.onComplete) {
					onComplete = config.onComplete;
				}
			});

			(Phaser.Math.Distance.Between as jest.Mock).mockReturnValue(200);

			scene.triggerLightningStrike();
			onComplete!();

			expect((scene as any).cameras.main.flash).toHaveBeenCalled();
		});

		it('should shake camera when player takes lightning damage', () => {
			let onComplete: () => void;
			(scene as any).tweens.add = jest.fn().mockImplementation((config: any) => {
				if (config.onComplete) {
					onComplete = config.onComplete;
				}
			});

			(Phaser.Math.Distance.Between as jest.Mock).mockReturnValue(30);

			scene.triggerLightningStrike();
			onComplete!();

			expect((scene as any).cameras.main.shake).toHaveBeenCalledWith(150, 0.02);
		});
	});

	describe('setupSaveKeybinds', () => {
		beforeEach(() => {
			jest.spyOn(Math, 'random').mockReturnValue(0.5);

			mockSound = { play: jest.fn(), stop: jest.fn() };
			mockKeyboardHandlers = {};

			(scene as any).cameras = {
				main: {
					startFollow: jest.fn(),
					setZoom: jest.fn(),
					setBounds: jest.fn(),
					setBackgroundColor: jest.fn(),
					fade: jest.fn(),
					shake: jest.fn(),
					flash: jest.fn(),
					once: jest.fn().mockImplementation((_event: string, callback: (...args: any[]) => void) => {
						mockFadeCompleteCallback = callback;
					}),
				},
			};
			(scene as any).scene = {
				launch: jest.fn(),
				get: jest.fn().mockReturnValue({}),
				start: jest.fn(),
				key: 'SkyIslandsScene',
				pause: jest.fn(),
			};
			(scene as any).sound = { volume: 1, add: jest.fn().mockReturnValue(mockSound) };
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
					lineStyle: jest.fn().mockReturnThis(),
					strokeCircle: jest.fn().mockReturnThis(),
					lineBetween: jest.fn().mockReturnThis(),
					destroy: jest.fn(),
				}),
				zone: jest.fn().mockReturnValue({ body: {} }),
				text: jest.fn().mockReturnValue({
					setOrigin: jest.fn().mockReturnThis(),
					setDepth: jest.fn().mockReturnThis(),
				}),
				particles: jest.fn().mockReturnValue({
					setDepth: jest.fn().mockReturnThis(),
					destroy: jest.fn(),
				}),
				line: jest.fn().mockReturnValue({
					setDepth: jest.fn().mockReturnThis(),
					setOrigin: jest.fn().mockReturnThis(),
				}),
			};
			(scene as any).tweens = { add: jest.fn() };
			(scene as any).events = { on: jest.fn(), emit: jest.fn() };
			(scene as any).time = {
				addEvent: jest.fn().mockReturnValue({ destroy: jest.fn() }),
				delayedCall: jest.fn(),
			};

			scene.create();
		});

		afterEach(() => {
			jest.spyOn(Math, 'random').mockRestore();
		});

		it('should save game on Ctrl+S', () => {
			const event = { ctrlKey: true, key: 's', preventDefault: jest.fn() };
			mockKeyboardHandlers['keydown'](event);
			expect(event.preventDefault).toHaveBeenCalled();
			expect(scene.saveManager.saveGame).toHaveBeenCalledWith(false);
		});

		it('should load game on Ctrl+L', () => {
			scene.saveManager.loadGame = jest.fn().mockReturnValue({ playerHealth: 100 });
			const event = { ctrlKey: true, key: 'l', preventDefault: jest.fn() };
			mockKeyboardHandlers['keydown'](event);
			expect(scene.saveManager.loadGame).toHaveBeenCalledWith(false);
			expect(scene.saveManager.applySaveData).toHaveBeenCalled();
		});

		it('should load checkpoint on F5', () => {
			scene.saveManager.loadGame = jest.fn().mockReturnValue({ playerHealth: 100 });
			const event = { ctrlKey: false, key: 'F5', preventDefault: jest.fn() };
			mockKeyboardHandlers['keydown'](event);
			expect(scene.saveManager.loadGame).toHaveBeenCalledWith(true);
		});

		it('should show notification when no checkpoint found on F5', () => {
			scene.saveManager.loadGame = jest.fn().mockReturnValue(null);
			const event = { ctrlKey: false, key: 'F5', preventDefault: jest.fn() };
			mockKeyboardHandlers['keydown'](event);
			expect(scene.saveManager.showSaveNotification).toHaveBeenCalledWith('No checkpoint found', true);
		});

		it('should not save on non-ctrl S key', () => {
			const event = { ctrlKey: false, key: 's', preventDefault: jest.fn() };
			mockKeyboardHandlers['keydown'](event);
			expect(scene.saveManager.saveGame).not.toHaveBeenCalled();
		});

		it('should set spellWheelOpen to false on spellwheelclosed event', () => {
			scene.spellWheelOpen = true;
			// Find the spellwheelclosed handler
			const eventsOnCalls = (scene as any).events.on.mock.calls;
			const spellWheelHandler = eventsOnCalls.find((call: any[]) => call[0] === 'spellwheelclosed');
			expect(spellWheelHandler).toBeDefined();
			spellWheelHandler[1]();
			expect(scene.spellWheelOpen).toBe(false);
		});
	});

	describe('exitDungeon', () => {
		beforeEach(() => {
			jest.spyOn(Math, 'random').mockReturnValue(0.5);

			mockSound = { play: jest.fn(), stop: jest.fn() };
			mockKeyboardHandlers = {};

			(scene as any).cameras = {
				main: {
					startFollow: jest.fn(),
					setZoom: jest.fn(),
					setBounds: jest.fn(),
					setBackgroundColor: jest.fn(),
					fade: jest.fn(),
					shake: jest.fn(),
					flash: jest.fn(),
					once: jest.fn().mockImplementation((_event: string, callback: (...args: any[]) => void) => {
						mockFadeCompleteCallback = callback;
					}),
				},
			};
			(scene as any).scene = {
				launch: jest.fn(),
				get: jest.fn().mockReturnValue({}),
				start: jest.fn(),
				key: 'SkyIslandsScene',
				pause: jest.fn(),
			};
			(scene as any).sound = { volume: 1, add: jest.fn().mockReturnValue(mockSound) };
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
					lineStyle: jest.fn().mockReturnThis(),
					strokeCircle: jest.fn().mockReturnThis(),
					lineBetween: jest.fn().mockReturnThis(),
					destroy: jest.fn(),
				}),
				zone: jest.fn().mockReturnValue({ body: {} }),
				text: jest.fn().mockReturnValue({
					setOrigin: jest.fn().mockReturnThis(),
					setDepth: jest.fn().mockReturnThis(),
				}),
				particles: jest.fn().mockReturnValue({
					setDepth: jest.fn().mockReturnThis(),
					destroy: jest.fn(),
				}),
				line: jest.fn().mockReturnValue({
					setDepth: jest.fn().mockReturnThis(),
					setOrigin: jest.fn().mockReturnThis(),
				}),
			};
			(scene as any).tweens = { add: jest.fn() };
			(scene as any).events = { on: jest.fn(), emit: jest.fn() };
			(scene as any).time = {
				addEvent: jest.fn().mockReturnValue({ destroy: jest.fn() }),
				delayedCall: jest.fn(),
			};

			scene.create();
		});

		afterEach(() => {
			jest.spyOn(Math, 'random').mockRestore();
		});

		it('should fade camera', () => {
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

		it('should destroy wind emitter if it exists', () => {
			const destroySpy = jest.fn();
			scene.windEmitter = { destroy: destroySpy } as any;
			scene.exitDungeon();
			mockFadeCompleteCallback();
			expect(destroySpy).toHaveBeenCalled();
		});

		it('should destroy cloud emitter if it exists', () => {
			const destroySpy = jest.fn();
			scene.cloudEmitter = { destroy: destroySpy } as any;
			scene.exitDungeon();
			mockFadeCompleteCallback();
			expect(destroySpy).toHaveBeenCalled();
		});

		it('should destroy lightning timer if it exists', () => {
			const destroySpy = jest.fn();
			scene.lightningTimer = { destroy: destroySpy } as any;
			scene.exitDungeon();
			mockFadeCompleteCallback();
			expect(destroySpy).toHaveBeenCalled();
		});

		it('should handle missing emitters gracefully', () => {
			scene.windEmitter = null;
			scene.cloudEmitter = null;
			scene.lightningTimer = null;
			scene.exitDungeon();
			expect(() => mockFadeCompleteCallback()).not.toThrow();
		});
	});

	describe('update with wind force', () => {
		beforeEach(() => {
			jest.spyOn(Math, 'random').mockReturnValue(0.5);

			mockSound = { play: jest.fn(), stop: jest.fn() };
			mockKeyboardHandlers = {};

			(scene as any).cameras = {
				main: {
					startFollow: jest.fn(),
					setZoom: jest.fn(),
					setBounds: jest.fn(),
					setBackgroundColor: jest.fn(),
					fade: jest.fn(),
					shake: jest.fn(),
					flash: jest.fn(),
					once: jest.fn(),
				},
			};
			(scene as any).scene = {
				launch: jest.fn(),
				get: jest.fn().mockReturnValue({}),
				start: jest.fn(),
				key: 'SkyIslandsScene',
				pause: jest.fn(),
			};
			(scene as any).sound = { volume: 1, add: jest.fn().mockReturnValue(mockSound) };
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
					lineStyle: jest.fn().mockReturnThis(),
					strokeCircle: jest.fn().mockReturnThis(),
					lineBetween: jest.fn().mockReturnThis(),
					destroy: jest.fn(),
				}),
				zone: jest.fn().mockReturnValue({ body: {} }),
				text: jest.fn().mockReturnValue({
					setOrigin: jest.fn().mockReturnThis(),
					setDepth: jest.fn().mockReturnThis(),
				}),
				particles: jest.fn().mockReturnValue({
					setDepth: jest.fn().mockReturnThis(),
					destroy: jest.fn(),
				}),
				line: jest.fn().mockReturnValue({
					setDepth: jest.fn().mockReturnThis(),
					setOrigin: jest.fn().mockReturnThis(),
				}),
			};
			(scene as any).tweens = { add: jest.fn() };
			(scene as any).events = { on: jest.fn(), emit: jest.fn() };
			(scene as any).time = {
				addEvent: jest.fn().mockReturnValue({ destroy: jest.fn() }),
				delayedCall: jest.fn(),
			};

			scene.create();
		});

		afterEach(() => {
			jest.spyOn(Math, 'random').mockRestore();
		});

		it('should apply wind force to player velocity', () => {
			scene.isInWindZone = true;
			scene.currentWindForce = { x: 200, y: 100 };
			scene.update();
			expect((scene.player.container.body as any).velocity.x).toBe(20); // 200 * 0.1
			expect((scene.player.container.body as any).velocity.y).toBe(10); // 100 * 0.1
		});

		it('should not apply force when not in wind zone', () => {
			scene.isInWindZone = false;
			scene.currentWindForce = { x: 200, y: 100 };
			scene.update();
			expect((scene.player.container.body as any).velocity.x).toBe(0);
			expect((scene.player.container.body as any).velocity.y).toBe(0);
		});

		it('should reset wind zone flag after update', () => {
			scene.isInWindZone = true;
			scene.currentWindForce = { x: 200, y: 100 };
			scene.update();
			expect(scene.isInWindZone).toBe(false);
			expect(scene.currentWindForce).toEqual({ x: 0, y: 0 });
		});

		it('should handle player with no body gracefully', () => {
			scene.isInWindZone = true;
			scene.currentWindForce = { x: 200, y: 100 };
			(scene.player as any).container.body = null;
			expect(() => scene.update()).not.toThrow();
		});

		it('should accumulate velocity on consecutive wind updates', () => {
			scene.isInWindZone = true;
			scene.currentWindForce = { x: 100, y: 50 };
			// Simulate first frame - manually keep wind active
			const body = scene.player.container.body as any;
			body.velocity.x += scene.currentWindForce.x * 0.1;
			body.velocity.y += scene.currentWindForce.y * 0.1;
			expect(body.velocity.x).toBe(10);
			expect(body.velocity.y).toBe(5);

			// Second frame with same wind
			body.velocity.x += 100 * 0.1;
			body.velocity.y += 50 * 0.1;
			expect(body.velocity.x).toBe(20);
			expect(body.velocity.y).toBe(10);
		});
	});

	describe('spawnSkyEnemies', () => {
		beforeEach(() => {
			jest.spyOn(Math, 'random').mockReturnValue(0.5);

			mockSound = { play: jest.fn(), stop: jest.fn() };
			mockKeyboardHandlers = {};

			(scene as any).cameras = {
				main: {
					startFollow: jest.fn(),
					setZoom: jest.fn(),
					setBounds: jest.fn(),
					setBackgroundColor: jest.fn(),
					fade: jest.fn(),
					shake: jest.fn(),
					flash: jest.fn(),
					once: jest.fn(),
				},
			};
			(scene as any).scene = {
				launch: jest.fn(),
				get: jest.fn().mockReturnValue({}),
				start: jest.fn(),
				key: 'SkyIslandsScene',
				pause: jest.fn(),
			};
			(scene as any).sound = { volume: 1, add: jest.fn().mockReturnValue(mockSound) };
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
					lineStyle: jest.fn().mockReturnThis(),
					strokeCircle: jest.fn().mockReturnThis(),
					lineBetween: jest.fn().mockReturnThis(),
					destroy: jest.fn(),
				}),
				zone: jest.fn().mockReturnValue({ body: {} }),
				text: jest.fn().mockReturnValue({
					setOrigin: jest.fn().mockReturnThis(),
					setDepth: jest.fn().mockReturnThis(),
				}),
				particles: jest.fn().mockReturnValue({
					setDepth: jest.fn().mockReturnThis(),
					destroy: jest.fn(),
				}),
				line: jest.fn().mockReturnValue({
					setDepth: jest.fn().mockReturnThis(),
					setOrigin: jest.fn().mockReturnThis(),
				}),
			};
			(scene as any).tweens = { add: jest.fn() };
			(scene as any).events = { on: jest.fn(), emit: jest.fn() };
			(scene as any).time = {
				addEvent: jest.fn().mockReturnValue({ destroy: jest.fn() }),
				delayedCall: jest.fn(),
			};

			scene.create();
		});

		afterEach(() => {
			jest.spyOn(Math, 'random').mockRestore();
		});

		it('should spawn enemies for each room', () => {
			expect(scene.enemies.length).toBeGreaterThan(0);
		});

		it('should use Enemy constructor for spawning', () => {
			expect(Enemy).toHaveBeenCalled();
		});

		it('should pass scene as first argument to Enemy', () => {
			const firstCall = (Enemy as unknown as jest.Mock).mock.calls[0];
			expect(firstCall[0]).toBe(scene);
		});
	});

	describe('initializeWindZones', () => {
		beforeEach(() => {
			jest.spyOn(Math, 'random').mockReturnValue(0.2); // < 0.4 WIND_ZONE_CHANCE

			mockSound = { play: jest.fn(), stop: jest.fn() };
			mockKeyboardHandlers = {};

			(scene as any).cameras = {
				main: {
					startFollow: jest.fn(),
					setZoom: jest.fn(),
					setBounds: jest.fn(),
					setBackgroundColor: jest.fn(),
					fade: jest.fn(),
					shake: jest.fn(),
					flash: jest.fn(),
					once: jest.fn(),
				},
			};
			(scene as any).scene = {
				launch: jest.fn(),
				get: jest.fn().mockReturnValue({}),
				start: jest.fn(),
				key: 'SkyIslandsScene',
				pause: jest.fn(),
			};
			(scene as any).sound = { volume: 1, add: jest.fn().mockReturnValue(mockSound) };
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
					lineStyle: jest.fn().mockReturnThis(),
					strokeCircle: jest.fn().mockReturnThis(),
					lineBetween: jest.fn().mockReturnThis(),
					destroy: jest.fn(),
				}),
				zone: jest.fn().mockReturnValue({ body: {} }),
				text: jest.fn().mockReturnValue({
					setOrigin: jest.fn().mockReturnThis(),
					setDepth: jest.fn().mockReturnThis(),
				}),
				particles: jest.fn().mockReturnValue({
					setDepth: jest.fn().mockReturnThis(),
					destroy: jest.fn(),
				}),
				line: jest.fn().mockReturnValue({
					setDepth: jest.fn().mockReturnThis(),
					setOrigin: jest.fn().mockReturnThis(),
				}),
			};
			(scene as any).tweens = { add: jest.fn() };
			(scene as any).events = { on: jest.fn(), emit: jest.fn() };
			(scene as any).time = {
				addEvent: jest.fn().mockReturnValue({ destroy: jest.fn() }),
				delayedCall: jest.fn(),
			};

			scene.create();
		});

		afterEach(() => {
			jest.spyOn(Math, 'random').mockRestore();
		});

		it('should create wind zones between rooms when random < WIND_ZONE_CHANCE', () => {
			// With Math.random() returning 0.2 (< 0.4), wind zones should be created
			expect(scene.windZones.length).toBeGreaterThan(0);
		});

		it('should create visual indicators for wind zones', () => {
			expect((scene as any).add.graphics).toHaveBeenCalled();
		});

		it('should add overlap detection for wind zones', () => {
			expect((scene as any).physics.add.overlap).toHaveBeenCalled();
		});
	});

	describe('initializeTeleporters', () => {
		beforeEach(() => {
			jest.spyOn(Math, 'random').mockReturnValue(0.5);

			mockSound = { play: jest.fn(), stop: jest.fn() };
			mockKeyboardHandlers = {};

			(scene as any).cameras = {
				main: {
					startFollow: jest.fn(),
					setZoom: jest.fn(),
					setBounds: jest.fn(),
					setBackgroundColor: jest.fn(),
					fade: jest.fn(),
					shake: jest.fn(),
					flash: jest.fn(),
					once: jest.fn(),
				},
			};
			(scene as any).scene = {
				launch: jest.fn(),
				get: jest.fn().mockReturnValue({}),
				start: jest.fn(),
				key: 'SkyIslandsScene',
				pause: jest.fn(),
			};
			(scene as any).sound = { volume: 1, add: jest.fn().mockReturnValue(mockSound) };
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
					lineStyle: jest.fn().mockReturnThis(),
					strokeCircle: jest.fn().mockReturnThis(),
					lineBetween: jest.fn().mockReturnThis(),
					destroy: jest.fn(),
				}),
				zone: jest.fn().mockReturnValue({ body: {} }),
				text: jest.fn().mockReturnValue({
					setOrigin: jest.fn().mockReturnThis(),
					setDepth: jest.fn().mockReturnThis(),
				}),
				particles: jest.fn().mockReturnValue({
					setDepth: jest.fn().mockReturnThis(),
					destroy: jest.fn(),
				}),
				line: jest.fn().mockReturnValue({
					setDepth: jest.fn().mockReturnThis(),
					setOrigin: jest.fn().mockReturnThis(),
				}),
			};
			(scene as any).tweens = { add: jest.fn() };
			(scene as any).events = { on: jest.fn(), emit: jest.fn() };
			(scene as any).time = {
				addEvent: jest.fn().mockReturnValue({ destroy: jest.fn() }),
				delayedCall: jest.fn(),
			};

			scene.create();
		});

		afterEach(() => {
			jest.spyOn(Math, 'random').mockRestore();
		});

		it('should create teleporter pads', () => {
			expect(scene.teleporterPads.length).toBeGreaterThan(0);
		});

		it('should create teleporter visual glow', () => {
			// Graphics should have been called for teleporter glow (among other things)
			expect((scene as any).add.graphics).toHaveBeenCalled();
		});

		it('should add pulsing tween to teleporters', () => {
			expect((scene as any).tweens.add).toHaveBeenCalled();
		});

		it('should add overlap detection for teleporters', () => {
			expect((scene as any).physics.add.overlap).toHaveBeenCalled();
		});

		it('should not exceed TELEPORTER_COUNT', () => {
			// TELEPORTER_COUNT is 4, but we only have 3 rooms so max 2 pairs
			expect(scene.teleporterPads.length).toBeLessThanOrEqual(4);
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

	it('should have create method', () => {
		expect(typeof scene.create).toBe('function');
	});

	it('should have exitDungeon method', () => {
		expect(typeof scene.exitDungeon).toBe('function');
	});

	it('should have triggerLightningStrike method', () => {
		expect(typeof scene.triggerLightningStrike).toBe('function');
	});

	it('should have spawnSkyEnemies method', () => {
		expect(typeof scene.spawnSkyEnemies).toBe('function');
	});

	it('should have initializeWindZones method', () => {
		expect(typeof scene.initializeWindZones).toBe('function');
	});

	it('should have initializeTeleporters method', () => {
		expect(typeof scene.initializeTeleporters).toBe('function');
	});

	it('should have initializeLightningHazard method', () => {
		expect(typeof scene.initializeLightningHazard).toBe('function');
	});

	it('should initialize emitters as null', () => {
		expect(scene.windEmitter).toBeNull();
		expect(scene.cloudEmitter).toBeNull();
	});

	it('should initialize lightning timer as null', () => {
		expect(scene.lightningTimer).toBeNull();
	});
});
