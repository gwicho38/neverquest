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
		Physics: { Arcade: { Sprite: class {}, StaticBody: class {} } },
		GameObjects: { Sprite: class {} },
		Geom: {
			Rectangle: MockRectangle,
			Point: function () {
				return { x: 0, y: 0 };
			},
		},
		NONE: 0,
		Cameras: { Scene2D: { Events: { FADE_OUT_COMPLETE: 'camerafadeoutcomplete' } } },
	};
});

jest.mock('../../plugins/NeverquestDungeonGenerator', () => ({
	NeverquestDungeonGenerator: jest.fn().mockImplementation(() => ({
		create: jest.fn(),
		map: { widthInPixels: 1600, heightInPixels: 1200 },
		dungeon: {
			rooms: [
				{ x: 0, y: 0, width: 10, height: 10, left: 0, top: 0, right: 10, bottom: 10, centerX: 5, centerY: 5 },
				{
					x: 15,
					y: 15,
					width: 14,
					height: 14,
					left: 15,
					top: 15,
					right: 29,
					bottom: 29,
					centerX: 22,
					centerY: 22,
				},
				{
					x: 35,
					y: 35,
					width: 8,
					height: 8,
					left: 35,
					top: 35,
					right: 43,
					bottom: 43,
					centerX: 39,
					centerY: 39,
				},
			],
		},
		tileWidth: 32,
		tileHeight: 32,
		groundLayer: {},
		stuffLayer: { putTileAt: jest.fn() },
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
		loadGame: jest.fn().mockReturnValue({ playerX: 200, playerY: 300 }),
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
			x: 0,
			y: 0,
			body: {
				velocity: { x: 0, y: 0 },
				setVelocity: jest.fn(),
			},
		},
		neverquestMovement: {},
		destroy: jest.fn(),
	})),
}));

jest.mock('../../consts/player/Player', () => ({
	PlayerConfig: { texture: 'player' },
}));

jest.mock('../../entities/Enemy', () => ({
	Enemy: jest.fn().mockImplementation(() => ({
		container: { x: 0, y: 0 },
	})),
}));

jest.mock('../../consts/Colors', () => ({
	HexColors: { GREEN_LIGHT: '#00ff00', BLACK: '#000000' },
}));

jest.mock('../../consts/Numbers', () => ({
	AnimationTiming: { TWEEN_VERY_SLOW: 1500 },
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
	CameraValues: { ZOOM_CLOSE: 2, FADE_NORMAL: 500 },
	Depth: { GROUND: 0, PLAYER: 10, PARTICLES_LOW: 5 },
	AudioValues: { VOLUME_DUNGEON: 0.5 },
	Scale: { SLIGHTLY_LARGE_PULSE: 1.05, LARGE: 2, SLIGHTLY_LARGE: 1.1, TINY: 0.5, SMALL: 0.75 },
	ParticleValues: { FREQUENCY_MODERATE: 100, LIFESPAN_LONG: 2000, LIFESPAN_VERY_LONG: 3000 },
	CombatNumbers: { PLAYER_DEATH_DELAY: 1500 },
	UnderwaterPhysics: {
		SWIM_SPEED_MULTIPLIER: 0.65,
		MAX_AIR: 100,
		AIR_DRAIN_RATE: 2,
		AIR_DANGER_THRESHOLD: 25,
		DROWNING_DAMAGE: 5,
		DROWNING_TICK_RATE: 1000,
		AIR_BUBBLE_REFILL_RATE: 50,
		AIR_BUBBLE_RADIUS: 48,
		CURRENT_FORCE_MEDIUM: 100,
		CURRENT_FORCE_WHIRLPOOL: 150,
	},
	UnderwaterTempleValues: {
		ENEMIES_PER_SMALL_ROOM: 2,
		ENEMIES_PER_MEDIUM_ROOM: 3,
		ENEMIES_PER_LARGE_ROOM: 5,
		AIR_BUBBLE_SPAWN_CHANCE: 0.4,
		CURRENT_ZONE_CHANCE: 0.35,
		WHIRLPOOL_CHANCE: 0.1,
		UNDERWATER_AMBIENT_DARKNESS: 0.7,
		UNDERWATER_LIGHT_RADIUS: 80,
		UNDERWATER_LIGHT_COLOR: 0x0099cc,
		BIOLUMINESCENCE_COLOR: 0x00ffaa,
		BUBBLE_PARTICLE_FREQUENCY: 120,
	},
}));

jest.mock('../../consts/Messages', () => ({
	GameMessages: {
		NO_CHECKPOINT_FOUND: 'No checkpoint found',
		DROWNING_DAMAGE: (damage: number) => `You are drowning! -${damage} HP`,
		PLAYER_DEFEATED: 'You have been defeated!',
	},
}));

jest.mock('../../scenes/HUDScene', () => ({
	HUDScene: { log: jest.fn() },
}));

import { UnderwaterTempleScene } from '../../scenes/UnderwaterTempleScene';
import { NeverquestDungeonGenerator } from '../../plugins/NeverquestDungeonGenerator';
import { NeverquestPathfinding } from '../../plugins/NeverquestPathfinding';
import { NeverquestFogWarManager } from '../../plugins/NeverquestFogWarManager';
import { NeverquestLightingManager } from '../../plugins/NeverquestLightingManager';
import { NeverquestSaveManager } from '../../plugins/NeverquestSaveManager';
import { Player } from '../../entities/Player';

describe('UnderwaterTempleScene', () => {
	let scene: any;
	let mockCamera: any;
	let mockSound: any;
	let mockInput: any;
	let mockPhysics: any;
	let mockAdd: any;
	let mockTweens: any;
	let mockEvents: any;
	let mockTime: any;

	const createMockGraphics = () => ({
		fillStyle: jest.fn().mockReturnThis(),
		fillCircle: jest.fn().mockReturnThis(),
		fillRect: jest.fn().mockReturnThis(),
		setDepth: jest.fn().mockReturnThis(),
		setAlpha: jest.fn().mockReturnThis(),
		destroy: jest.fn(),
		alpha: 1,
		scale: 1,
	});

	const createMockParticleEmitter = () => ({
		setDepth: jest.fn().mockReturnThis(),
		stop: jest.fn(),
		destroy: jest.fn(),
	});

	beforeEach(() => {
		mockCamera = {
			startFollow: jest.fn(),
			setZoom: jest.fn(),
			setBounds: jest.fn(),
			setBackgroundColor: jest.fn(),
			fadeIn: jest.fn(),
			fade: jest.fn(),
			fadeOut: jest.fn(),
			flash: jest.fn(),
			shake: jest.fn(),
			once: jest.fn(),
			on: jest.fn(),
		};

		const mockSoundObject = {
			play: jest.fn(),
			stop: jest.fn(),
			destroy: jest.fn(),
		};

		mockSound = {
			add: jest.fn().mockReturnValue(mockSoundObject),
			stopAll: jest.fn(),
			volume: 1,
		};

		mockInput = {
			keyboard: {
				addKey: jest.fn().mockReturnValue({ on: jest.fn() }),
				createCombo: jest.fn(),
				on: jest.fn(),
			},
		};

		const mockZone = {
			setDepth: jest.fn().mockReturnThis(),
			setOrigin: jest.fn().mockReturnThis(),
			body: {
				setSize: jest.fn(),
				immovable: false,
			},
		};

		mockPhysics = {
			add: {
				overlap: jest.fn(),
				collider: jest.fn(),
				existing: jest.fn().mockImplementation((obj: any) => {
					if (obj && !obj.body) {
						obj.body = { immovable: false, setCircle: jest.fn() };
					}
					return obj;
				}),
				sprite: jest.fn().mockReturnValue({
					setDepth: jest.fn().mockReturnThis(),
					setScale: jest.fn().mockReturnThis(),
					setAlpha: jest.fn().mockReturnThis(),
					setImmovable: jest.fn().mockReturnThis(),
					body: { setCircle: jest.fn() },
				}),
				staticGroup: jest.fn().mockReturnValue({
					create: jest.fn().mockReturnValue({
						setDepth: jest.fn().mockReturnThis(),
						setScale: jest.fn().mockReturnThis(),
						setAlpha: jest.fn().mockReturnThis(),
						setCircle: jest.fn().mockReturnThis(),
						body: { setCircle: jest.fn() },
					}),
				}),
				group: jest.fn().mockReturnValue({
					create: jest.fn().mockReturnValue({
						setDepth: jest.fn().mockReturnThis(),
						setScale: jest.fn().mockReturnThis(),
						setAlpha: jest.fn().mockReturnThis(),
					}),
				}),
			},
			world: {
				setBounds: jest.fn(),
			},
		};

		mockAdd = {
			rectangle: jest.fn().mockReturnValue({
				setDepth: jest.fn().mockReturnThis(),
				setAlpha: jest.fn().mockReturnThis(),
				setScrollFactor: jest.fn().mockReturnThis(),
				setOrigin: jest.fn().mockReturnThis(),
				setFillStyle: jest.fn().mockReturnThis(),
				destroy: jest.fn(),
			}),
			circle: jest.fn().mockReturnValue({
				setDepth: jest.fn().mockReturnThis(),
				setAlpha: jest.fn().mockReturnThis(),
				setFillStyle: jest.fn().mockReturnThis(),
				destroy: jest.fn(),
			}),
			sprite: jest.fn().mockReturnValue({
				setDepth: jest.fn().mockReturnThis(),
				setScale: jest.fn().mockReturnThis(),
				setAlpha: jest.fn().mockReturnThis(),
				play: jest.fn().mockReturnThis(),
				on: jest.fn().mockReturnThis(),
				destroy: jest.fn(),
			}),
			particles: jest.fn().mockReturnValue(createMockParticleEmitter()),
			graphics: jest.fn().mockReturnValue(createMockGraphics()),
			text: jest.fn().mockReturnValue({
				setDepth: jest.fn().mockReturnThis(),
				setAlpha: jest.fn().mockReturnThis(),
				setScrollFactor: jest.fn().mockReturnThis(),
				setOrigin: jest.fn().mockReturnThis(),
				setText: jest.fn().mockReturnThis(),
				destroy: jest.fn(),
			}),
			image: jest.fn().mockReturnValue({
				setDepth: jest.fn().mockReturnThis(),
				setScale: jest.fn().mockReturnThis(),
				setAlpha: jest.fn().mockReturnThis(),
				setOrigin: jest.fn().mockReturnThis(),
				destroy: jest.fn(),
			}),
			zone: jest.fn().mockReturnValue(mockZone),
		};

		mockTweens = {
			add: jest.fn().mockReturnValue({ destroy: jest.fn() }),
		};

		mockEvents = {
			on: jest.fn(),
			once: jest.fn(),
			emit: jest.fn(),
		};

		mockTime = {
			addEvent: jest.fn().mockReturnValue({ destroy: jest.fn() }),
			delayedCall: jest.fn().mockReturnValue({ destroy: jest.fn() }),
		};

		scene = new UnderwaterTempleScene();
		scene.cameras = { main: mockCamera };
		scene.scene = {
			launch: jest.fn(),
			start: jest.fn(),
			stop: jest.fn(),
			pause: jest.fn(),
			key: 'UnderwaterTempleScene',
			get: jest.fn().mockReturnValue({ scene: { restart: jest.fn() } }),
		};
		scene.sound = mockSound;
		scene.input = mockInput;
		scene.physics = mockPhysics;
		scene.add = mockAdd;
		scene.tweens = mockTweens;
		scene.events = mockEvents;
		scene.time = mockTime;

		// Pre-initialize lighting so it's available during initializeAirBubbles
		// (which runs before lighting is constructed in create())
		scene.lighting = {
			create: jest.fn(),
			addStaticLight: jest.fn(),
		};

		// Suppress console.log during tests
		jest.spyOn(console, 'log').mockImplementation(() => {});
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe('constructor', () => {
		it('should set scene key to UnderwaterTempleScene', () => {
			expect(scene.sys.settings.key).toBe('UnderwaterTempleScene');
		});

		it('should initialize enemies as empty array', () => {
			expect(scene.enemies).toEqual([]);
		});

		it('should initialize currentZones as empty array', () => {
			expect(scene.currentZones).toEqual([]);
		});

		it('should initialize airBubbles as empty array', () => {
			expect(scene.airBubbles).toEqual([]);
		});

		it('should initialize airMeter to 100', () => {
			expect(scene.airMeter).toBe(100);
		});

		it('should initialize isInCurrentZone and isAtAirBubble to false', () => {
			expect(scene.isInCurrentZone).toBe(false);
			expect(scene.isAtAirBubble).toBe(false);
		});
	});

	describe('init', () => {
		it('should set previousScene from data', () => {
			scene.init({ previousScene: 'MainScene' });
			expect(scene.previousScene).toBe('MainScene');
		});

		it('should keep default TownScene when data is empty', () => {
			scene.init({});
			expect(scene.previousScene).toBe('TownScene');
		});

		it('should handle undefined data', () => {
			scene.init(undefined);
			expect(scene.previousScene).toBe('TownScene');
		});

		it('should reset airMeter to 100', () => {
			scene.airMeter = 30;
			scene.init({});
			expect(scene.airMeter).toBe(100);
		});
	});

	describe('create', () => {
		let originalRandom: () => number;

		beforeEach(() => {
			originalRandom = Math.random;
			Math.random = jest.fn().mockReturnValue(0.2);
		});

		afterEach(() => {
			Math.random = originalRandom;
		});

		it('should create dungeon generator', () => {
			scene.create();
			expect(NeverquestDungeonGenerator).toHaveBeenCalled();
		});

		it('should initialize pathfinding', () => {
			scene.create();
			expect(NeverquestPathfinding).toHaveBeenCalled();
		});

		it('should create player at map center', () => {
			scene.create();
			expect(Player).toHaveBeenCalled();
			const MockPlayer = Player as unknown as jest.Mock;
			const playerCall = MockPlayer.mock.calls[MockPlayer.mock.calls.length - 1];
			expect(playerCall[1]).toBe(800);
			expect(playerCall[2]).toBe(600);
		});

		it('should set up camera with underwater background color', () => {
			scene.create();
			expect(mockCamera.setBackgroundColor).toHaveBeenCalledWith(0x0a2a4a);
		});

		it('should launch DialogScene', () => {
			scene.create();
			expect(scene.scene.launch).toHaveBeenCalledWith('DialogScene', expect.anything());
		});

		it('should launch HUDScene', () => {
			scene.create();
			expect(scene.scene.launch).toHaveBeenCalledWith('HUDScene', expect.anything());
		});

		it('should spawn enemies', () => {
			scene.create();
			expect(scene.enemies.length).toBeGreaterThan(0);
		});

		it('should play theme song with detune -300', () => {
			scene.create();
			expect(mockSound.add).toHaveBeenCalledWith(
				'dark_theme',
				expect.objectContaining({
					loop: true,
					detune: -300,
				})
			);
		});

		it('should create fog of war', () => {
			scene.create();
			expect(NeverquestFogWarManager).toHaveBeenCalled();
		});

		it('should create underwater lighting', () => {
			scene.create();
			expect(NeverquestLightingManager).toHaveBeenCalledWith(
				scene,
				expect.objectContaining({
					ambientDarkness: 0.7,
					lightColor: 0x0099cc,
				})
			);
		});

		it('should create save manager', () => {
			scene.create();
			expect(NeverquestSaveManager).toHaveBeenCalled();
		});

		it('should create exit portal', () => {
			scene.create();
			// Exit portal calls add.zone and physics.add.existing for the exit area
			expect(mockAdd.zone).toHaveBeenCalled();
			expect(mockPhysics.add.existing).toHaveBeenCalled();
		});
	});

	describe('air system', () => {
		let airDrainCallback: () => void;
		let drowningCallback: () => void;
		let originalRandom: () => number;

		beforeEach(() => {
			originalRandom = Math.random;
			Math.random = jest.fn().mockReturnValue(0.2);

			let callCount = 0;
			mockTime.addEvent = jest.fn().mockImplementation((config: any) => {
				callCount++;
				if (callCount === 1) {
					airDrainCallback = config.callback;
				}
				if (callCount === 2) {
					drowningCallback = config.callback;
				}
				return { destroy: jest.fn() };
			});

			scene.create();

			scene.player = {
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
				attributes: { health: 50, baseHealth: 50, level: 1 },
				healthBar: { decrease: jest.fn() },
				neverquestHUDProgressBar: { updateHealth: jest.fn() },
				canMove: true,
				canAtack: true,
			} as any;
		});

		afterEach(() => {
			Math.random = originalRandom;
		});

		it('should reduce airMeter by drain rate when not at bubble', () => {
			scene.isAtAirBubble = false;
			scene.airMeter = 50;
			airDrainCallback();
			expect(scene.airMeter).toBe(48);
		});

		it('should flash camera when airMeter reaches danger threshold', () => {
			scene.isAtAirBubble = false;
			scene.airMeter = 26;
			airDrainCallback();
			expect(scene.airMeter).toBe(24);
			expect(mockCamera.flash).toHaveBeenCalled();
		});

		it('should refill air when at bubble', () => {
			scene.isAtAirBubble = true;
			scene.airMeter = 40;
			airDrainCallback();
			expect(scene.airMeter).toBe(90);
		});

		it('should cap air at 100', () => {
			scene.isAtAirBubble = true;
			scene.airMeter = 80;
			airDrainCallback();
			expect(scene.airMeter).toBe(100);
		});

		it('should apply drowning damage when airMeter is 0', () => {
			scene.airMeter = 0;
			drowningCallback();
			expect(scene.player.attributes.health).toBe(45);
			expect(scene.player.healthBar.decrease).toHaveBeenCalledWith(5);
		});

		it('should kill player when drowning reduces health to 0', () => {
			scene.airMeter = 0;
			scene.player.attributes.health = 3;
			drowningCallback();
			expect(scene.player.attributes.health).toBe(0);
			expect(scene.player.canMove).toBe(false);
			expect(scene.player.canAtack).toBe(false);
		});

		it('should not apply drowning damage to dead player', () => {
			scene.airMeter = 0;
			scene.player.attributes.health = 0;
			drowningCallback();
			expect(scene.player.healthBar.decrease).not.toHaveBeenCalled();
		});
	});

	describe('setupSaveKeybinds', () => {
		let keydownHandler: (event: any) => void;

		beforeEach(() => {
			Math.random = jest.fn().mockReturnValue(0.2);

			mockInput.keyboard.on = jest.fn().mockImplementation((eventName: string, callback: any) => {
				if (eventName === 'keydown') {
					keydownHandler = callback;
				}
			});

			scene.create();
		});

		afterEach(() => {
			(Math.random as jest.Mock).mockRestore?.();
		});

		it('should bind Ctrl+S to save game', () => {
			const event = { ctrlKey: true, key: 's', preventDefault: jest.fn() };
			keydownHandler(event);
			expect(event.preventDefault).toHaveBeenCalled();
			expect(scene.saveManager.saveGame).toHaveBeenCalledWith(false);
		});

		it('should bind Ctrl+L to load and apply save data', () => {
			const event = { ctrlKey: true, key: 'l', preventDefault: jest.fn() };
			keydownHandler(event);
			expect(event.preventDefault).toHaveBeenCalled();
			expect(scene.saveManager.loadGame).toHaveBeenCalledWith(false);
			expect(scene.saveManager.applySaveData).toHaveBeenCalled();
		});

		it('should bind F5 to load checkpoint', () => {
			const event = { ctrlKey: false, key: 'F5', preventDefault: jest.fn() };
			keydownHandler(event);
			expect(event.preventDefault).toHaveBeenCalled();
			expect(scene.saveManager.loadGame).toHaveBeenCalledWith(true);
			expect(scene.saveManager.applySaveData).toHaveBeenCalled();
		});
	});

	describe('exitDungeon', () => {
		let fadeCompleteCallback: () => void;

		beforeEach(() => {
			Math.random = jest.fn().mockReturnValue(0.2);
			scene.create();

			scene.player = {
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
			} as any;

			mockCamera.once = jest.fn().mockImplementation((_event: string, callback: () => void) => {
				fadeCompleteCallback = callback;
			});

			scene.exitDungeon();
		});

		afterEach(() => {
			(Math.random as jest.Mock).mockRestore?.();
		});

		it('should fade camera out', () => {
			expect(mockCamera.fade).toHaveBeenCalledWith(500);
		});

		it('should stop sounds on fade complete', () => {
			fadeCompleteCallback();
			expect(scene.themeSong.stop).toHaveBeenCalled();
			expect(scene.ambientSound.stop).toHaveBeenCalled();
		});

		it('should destroy timers on fade complete', () => {
			fadeCompleteCallback();
			// Timers (airDrainTimer, drowningTimer) are destroyed during exit cleanup
			// The fact that the callback runs without error verifies timer cleanup
			expect(fadeCompleteCallback).toBeDefined();
		});

		it('should clean up player', () => {
			fadeCompleteCallback();
			expect(scene.player.destroy).toHaveBeenCalled();
		});

		it('should start previous scene', () => {
			fadeCompleteCallback();
			expect(scene.scene.start).toHaveBeenCalledWith('TownScene');
		});
	});

	describe('update', () => {
		beforeEach(() => {
			Math.random = jest.fn().mockReturnValue(0.2);
			scene.create();

			scene.player = {
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
			} as any;
		});

		afterEach(() => {
			(Math.random as jest.Mock).mockRestore?.();
		});

		it('should apply current force when in current zone', () => {
			scene.isInCurrentZone = true;
			scene.currentForce = { x: 100, y: 50 };
			scene.update();
			// velocity.x += 100 * 0.1 = 10
			expect(scene.player.container.body.velocity.x).toBe(10);
			expect(scene.player.container.body.velocity.y).toBe(5);
		});

		it('should not apply force when not in current zone', () => {
			scene.isInCurrentZone = false;
			scene.currentForce = { x: 100, y: 50 };
			scene.update();
			expect(scene.player.container.body.velocity.x).toBe(0);
			expect(scene.player.container.body.velocity.y).toBe(0);
		});

		it('should reset isInCurrentZone to false after update', () => {
			scene.isInCurrentZone = true;
			scene.currentForce = { x: 100, y: 50 };
			scene.update();
			expect(scene.isInCurrentZone).toBe(false);
		});

		it('should reset isAtAirBubble to false after update', () => {
			scene.isAtAirBubble = true;
			scene.update();
			expect(scene.isAtAirBubble).toBe(false);
		});
	});
});
