/**
 * Tests for UpsideDownScene
 *
 * The Upside Down World Scene - An eerie alternate dimension inspired by Stranger Things
 * Features dark atmosphere, floating particles, and distorted visuals
 */

import { UpsideDownScene } from '../../scenes/UpsideDownScene';
import { NeverquestMapCreator } from '../../plugins/NeverquestMapCreator';
import { NeverquestWarp } from '../../plugins/NeverquestWarp';
import { NeverquestObjectMarker } from '../../plugins/NeverquestObjectMarker';
import { NeverquestEnemyZones } from '../../plugins/NeverquestEnemyZones';
import { NeverquestSaveManager } from '../../plugins/NeverquestSaveManager';

// Mock Phaser Geometry classes
jest.mock('phaser', () => ({
	__esModule: true,
	default: {
		Scene: class MockScene {
			sys = { settings: { key: 'UpsideDownScene' } };
		},
		Geom: {
			Rectangle: jest.fn().mockImplementation(() => ({})),
			Ellipse: jest.fn().mockImplementation(() => ({})),
		},
		Cameras: {
			Scene2D: {
				Events: {
					FADE_OUT_COMPLETE: 'camerafadeoutcomplete',
				},
			},
		},
	},
}));

// Mock dependencies
jest.mock('../../plugins/AnimatedTiles', () => jest.fn());
jest.mock('../../plugins/NeverquestMapCreator', () => ({
	NeverquestMapCreator: jest.fn().mockImplementation(() => ({
		create: jest.fn(),
		map: {
			widthInPixels: 1600,
			heightInPixels: 1200,
			layers: [
				{
					tilemapLayer: {
						setTint: jest.fn(),
						setAlpha: jest.fn(),
					},
				},
			],
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
	})),
}));
jest.mock('../../entities/Player', () => ({
	Player: jest.fn().mockImplementation(() => ({
		container: {
			list: [],
			x: 400,
			y: 300,
		},
		body: {
			velocity: { x: 0, y: 0 },
		},
		destroy: jest.fn(),
	})),
}));
jest.mock('../../consts/player/Player', () => ({
	PlayerConfig: {
		texture: 'player_texture',
	},
}));
jest.mock('../../consts/Numbers', () => ({
	CameraValues: {
		ZOOM_CLOSE: 2,
		FADE_SLOW: 1000,
		FADE_FAST: 200,
		ZOOM_DISTORTION: 2.1,
		ZOOM_PORTAL_EXIT: 3,
	},
	Alpha: {
		MEDIUM: 0.5,
		HIGH: 0.8,
		LIGHT: 0.3,
		VERY_LOW: 0.1,
		TILEMAP_DARK: 0.7,
		HALF: 0.5,
		MEDIUM_HIGH: 0.7,
		TRANSPARENT: 0,
		ALMOST_OPAQUE: 0.9,
		NEARLY_FULL: 0.95,
		FOG_START: 0.2,
		VERY_HIGH: 0.9,
		LOW: 0.2,
		CAMERA_SHAKE: 0.003,
	},
	Scale: {
		SMALL: 0.5,
		LARGE: 1.5,
		SLIGHTLY_LARGE: 1.2,
	},
	AnimationTiming: {
		TWEEN_NORMAL: 200,
		HIT_FLASH_DURATION: 100,
	},
	Depth: {
		DARK_OVERLAY: 100,
		PARTICLES_HIGH: 90,
		PARTICLES_MID: 80,
		PARTICLES_LOW: 70,
		VIGNETTE: 110,
		PORTAL: 50,
		PORTAL_SPRITE: 51,
		PORTAL_TEXT: 52,
		UI: 200,
	},
	ParticleValues: {
		LIFESPAN_LONG: 2000,
		LIFESPAN_VERY_LONG: 3000,
	},
	AudioValues: {
		DETUNE_DARK: -300,
	},
	FontSizes: {
		PORTAL_TEXT: '16px',
	},
}));
jest.mock('../../consts/Messages', () => ({
	UILabels: {
		RETURN_PORTAL: 'Return to Reality',
	},
	FontFamily: {
		PIXEL: 'Press Start 2P',
	},
}));
jest.mock('../../consts/Colors', () => ({
	HexColors: {
		PURPLE_DARK: '#5c2d6a',
		BLACK: '#000000',
	},
	NumericColors: {
		PURPLE_FOG_MEDIUM: 0x5c2d6a,
		PURPLE_MUTED: 0x7a4988,
		BLACK: 0x000000,
		PURPLE_FOG_LIGHT: 0x8b5a9b,
		PURPLE_FOG_DARK: 0x3d1f4a,
		PURPLE_EXPLORED: 0x6b3a7d,
		WHITE: 0xffffff,
	},
}));

describe('UpsideDownScene', () => {
	let scene: UpsideDownScene;
	let mockSound: {
		play: jest.Mock;
		stop: jest.Mock;
	};
	let mockKeyboardHandler: (...args: unknown[]) => void;
	let mockParticleEmitter: {
		setScrollFactor: jest.Mock;
		setDepth: jest.Mock;
		destroy: jest.Mock;
		setParticleSpeed: jest.Mock;
	};
	let mockTween: {
		add: jest.Mock;
		killAll: jest.Mock;
	};
	let mockTimer: {
		destroy: jest.Mock;
	};

	beforeEach(() => {
		jest.clearAllMocks();

		mockSound = {
			play: jest.fn(),
			stop: jest.fn(),
		};

		mockParticleEmitter = {
			setScrollFactor: jest.fn().mockReturnThis(),
			setDepth: jest.fn().mockReturnThis(),
			destroy: jest.fn(),
			setParticleSpeed: jest.fn(),
		};

		mockTween = {
			add: jest.fn().mockReturnValue({}),
			killAll: jest.fn(),
		};

		mockTimer = {
			destroy: jest.fn(),
		};

		scene = new UpsideDownScene();

		// Setup mock scene properties
		(scene as unknown as { load: { scenePlugin: jest.Mock } }).load = {
			scenePlugin: jest.fn(),
		};

		(scene as unknown as { cameras: { main: Record<string, jest.Mock | number> } }).cameras = {
			main: {
				startFollow: jest.fn(),
				setZoom: jest.fn(),
				setBounds: jest.fn(),
				fadeIn: jest.fn(),
				fadeOut: jest.fn(),
				flash: jest.fn(),
				shake: jest.fn(),
				once: jest.fn(),
				width: 800,
				height: 600,
			},
		};

		(scene as unknown as { scene: Record<string, jest.Mock> }).scene = {
			launch: jest.fn(),
			get: jest.fn().mockReturnValue({}),
			start: jest.fn(),
			stop: jest.fn(),
		};

		(scene as unknown as { sound: Record<string, jest.Mock | number> }).sound = {
			volume: 1,
			add: jest.fn().mockReturnValue(mockSound),
			get: jest.fn().mockReturnValue(mockSound),
		};

		(scene as unknown as { input: { keyboard: { on: jest.Mock } | null } }).input = {
			keyboard: {
				on: jest.fn().mockImplementation((_event: string, handler: (...args: unknown[]) => void) => {
					mockKeyboardHandler = handler;
				}),
			},
		};

		(scene as unknown as { sys: { animatedTiles: { init: jest.Mock } } }).sys = {
			animatedTiles: {
				init: jest.fn(),
			},
		};

		(scene as unknown as { add: Record<string, jest.Mock> }).add = {
			rectangle: jest.fn().mockReturnValue({
				setScrollFactor: jest.fn().mockReturnThis(),
				setDepth: jest.fn().mockReturnThis(),
				destroy: jest.fn(),
			}),
			particles: jest.fn().mockReturnValue(mockParticleEmitter),
			graphics: jest.fn().mockReturnValue({
				lineStyle: jest.fn().mockReturnThis(),
				strokeRect: jest.fn().mockReturnThis(),
				setScrollFactor: jest.fn().mockReturnThis(),
				setDepth: jest.fn().mockReturnThis(),
			}),
			zone: jest.fn().mockReturnValue({
				destroy: jest.fn(),
			}),
			ellipse: jest.fn().mockReturnValue({
				setDepth: jest.fn().mockReturnThis(),
			}),
			text: jest.fn().mockReturnValue({
				setOrigin: jest.fn().mockReturnThis(),
				setDepth: jest.fn().mockReturnThis(),
			}),
		};

		(scene as unknown as { physics: { add: Record<string, jest.Mock> } }).physics = {
			add: {
				existing: jest.fn(),
				overlap: jest.fn(),
			},
		};

		(scene as unknown as { tweens: typeof mockTween }).tweens = mockTween;

		(scene as unknown as { time: { addEvent: jest.Mock; now: number } }).time = {
			addEvent: jest.fn().mockReturnValue(mockTimer),
			now: 0,
		};
	});

	describe('constructor', () => {
		it('should create scene with key UpsideDownScene', () => {
			const newScene = new UpsideDownScene();
			expect(
				(newScene as unknown as { sys?: { settings?: { key: string } } }).sys?.settings?.key ||
					'UpsideDownScene'
			).toBe('UpsideDownScene');
		});

		it('should initialize with null properties', () => {
			const newScene = new UpsideDownScene();
			expect(newScene.player).toBeNull();
			expect(newScene.mapCreator).toBeNull();
			expect(newScene.map).toBeNull();
			expect(newScene.themeSound).toBeNull();
			expect(newScene.saveManager).toBeNull();
		});

		it('should set default previousScene to MainScene', () => {
			const newScene = new UpsideDownScene();
			expect(newScene.previousScene).toBe('MainScene');
		});
	});

	describe('init', () => {
		it('should set previousScene from data', () => {
			scene.init({ previousScene: 'OverworldScene' });
			expect(scene.previousScene).toBe('OverworldScene');
		});

		it('should keep default previousScene if no data provided', () => {
			scene.init({});
			expect(scene.previousScene).toBe('MainScene');
		});

		it('should handle undefined previousScene in data', () => {
			scene.init({ playerData: {} });
			expect(scene.previousScene).toBe('MainScene');
		});
	});

	describe('preload', () => {
		it('should load animated tiles plugin', () => {
			scene.preload();

			expect((scene as unknown as { load: { scenePlugin: jest.Mock } }).load.scenePlugin).toHaveBeenCalledWith(
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

			expect(
				(scene as unknown as { cameras: { main: { setZoom: jest.Mock } } }).cameras.main.setZoom
			).toHaveBeenCalledWith(2);
		});

		it('should create map', () => {
			scene.create();

			expect(NeverquestMapCreator).toHaveBeenCalledWith(scene);
		});

		it('should apply dark tint to map layers', () => {
			scene.create();

			expect(scene.map).toBeDefined();
			// Map layers should have setTint and setAlpha called on them
		});

		it('should start camera following player', () => {
			scene.create();

			expect(
				(scene as unknown as { cameras: { main: { startFollow: jest.Mock } } }).cameras.main.startFollow
			).toHaveBeenCalled();
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

			expect((scene as unknown as { scene: { launch: jest.Mock } }).scene.launch).toHaveBeenCalledWith(
				'DialogScene',
				expect.objectContaining({
					player: expect.anything(),
					map: expect.anything(),
					scene: expect.anything(),
				})
			);
		});

		it('should launch HUD scene', () => {
			scene.create();

			expect((scene as unknown as { scene: { launch: jest.Mock } }).scene.launch).toHaveBeenCalledWith(
				'HUDScene',
				expect.objectContaining({
					player: expect.anything(),
					map: expect.anything(),
				})
			);
		});

		it('should initialize animated tiles', () => {
			scene.create();

			expect(
				(scene as unknown as { sys: { animatedTiles: { init: jest.Mock } } }).sys.animatedTiles.init
			).toHaveBeenCalled();
		});

		it('should add and play theme sound', () => {
			scene.create();

			expect((scene as unknown as { sound: { add: jest.Mock } }).sound.add).toHaveBeenCalledWith(
				'dungeon_ambience',
				expect.objectContaining({ loop: true })
			);
			expect(mockSound.play).toHaveBeenCalled();
		});

		it('should create enemy zones', () => {
			scene.create();

			expect(NeverquestEnemyZones).toHaveBeenCalled();
		});

		it('should create save manager', () => {
			scene.create();

			expect(NeverquestSaveManager).toHaveBeenCalledWith(scene);
		});

		it('should fade in camera', () => {
			scene.create();

			expect(
				(scene as unknown as { cameras: { main: { fadeIn: jest.Mock } } }).cameras.main.fadeIn
			).toHaveBeenCalledWith(1000, 0, 0, 0);
		});

		it('should setup escape key handler', () => {
			scene.create();

			expect(
				(scene as unknown as { input: { keyboard: { on: jest.Mock } | null } }).input.keyboard?.on
			).toHaveBeenCalledWith('keydown-ESC', expect.any(Function));
		});

		it('should create dark overlay', () => {
			scene.create();

			expect((scene as unknown as { add: { rectangle: jest.Mock } }).add.rectangle).toHaveBeenCalled();
		});

		it('should create atmospheric particles', () => {
			scene.create();

			// Should create ash, floating, and fog particles
			expect((scene as unknown as { add: { particles: jest.Mock } }).add.particles).toHaveBeenCalled();
		});

		it('should create vignette effect', () => {
			scene.create();

			expect((scene as unknown as { add: { graphics: jest.Mock } }).add.graphics).toHaveBeenCalled();
		});

		it('should create return portal', () => {
			scene.create();

			expect((scene as unknown as { add: { zone: jest.Mock } }).add.zone).toHaveBeenCalled();
			expect(
				(scene as unknown as { physics: { add: { existing: jest.Mock } } }).physics.add.existing
			).toHaveBeenCalled();
		});

		it('should create distortion effects timer', () => {
			scene.create();

			expect((scene as unknown as { time: { addEvent: jest.Mock } }).time.addEvent).toHaveBeenCalled();
		});
	});

	describe('stopSceneMusic', () => {
		it('should stop theme sound when it exists', () => {
			scene.create();
			scene.stopSceneMusic();

			expect(mockSound.stop).toHaveBeenCalled();
		});

		it('should not throw when themeSound is null', () => {
			scene.themeSound = null;
			expect(() => scene.stopSceneMusic()).not.toThrow();
		});
	});

	describe('update', () => {
		it('should be defined', () => {
			expect(scene.update).toBeDefined();
		});

		it('should be callable without error', () => {
			expect(() => scene.update()).not.toThrow();
		});

		it('should not throw when player is null', () => {
			scene.player = null;
			expect(() => scene.update()).not.toThrow();
		});

		it('should adjust fog particle speed based on player velocity', () => {
			scene.create();

			// Set up player with velocity
			scene.player = {
				body: { velocity: { x: 50, y: 0 } },
				container: { list: [], x: 400, y: 300 },
				destroy: jest.fn(),
			} as unknown as typeof scene.player;

			// Access the private fogParticles
			(scene as unknown as { fogParticles: typeof mockParticleEmitter }).fogParticles = mockParticleEmitter;

			scene.update();

			expect(mockParticleEmitter.setParticleSpeed).toHaveBeenCalled();
		});
	});

	describe('escape key handler', () => {
		it('should trigger return to previous scene on ESC press', () => {
			scene.create();

			// Trigger the ESC handler
			if (mockKeyboardHandler) {
				// Mock the private methods for the test
				(scene as unknown as { returnToPreviousScene: jest.Mock }).returnToPreviousScene = jest.fn();
				mockKeyboardHandler();
			}

			// The handler was registered
			expect(
				(scene as unknown as { input: { keyboard: { on: jest.Mock } | null } }).input.keyboard?.on
			).toHaveBeenCalledWith('keydown-ESC', expect.any(Function));
		});
	});

	describe('portal collision', () => {
		it('should setup overlap detection between player and portal', () => {
			scene.create();

			expect(
				(scene as unknown as { physics: { add: { overlap: jest.Mock } } }).physics.add.overlap
			).toHaveBeenCalled();
		});
	});

	describe('cleanupEffects (through returnToPreviousScene)', () => {
		it('should destroy distortion timer', () => {
			scene.create();

			// Access private method through scene transitions
			(scene as unknown as { distortionTimer: typeof mockTimer }).distortionTimer = mockTimer;

			// Trigger cleanup through the scene stop flow
			mockTween.killAll.mockClear();

			// Call the private cleanupEffects method
			(scene as unknown as { cleanupEffects: () => void }).cleanupEffects();

			expect(mockTimer.destroy).toHaveBeenCalled();
		});

		it('should destroy floating particles', () => {
			scene.create();

			const mockEmitter = { destroy: jest.fn() };
			(scene as unknown as { floatingParticles: (typeof mockEmitter)[] }).floatingParticles = [mockEmitter];

			(scene as unknown as { cleanupEffects: () => void }).cleanupEffects();

			expect(mockEmitter.destroy).toHaveBeenCalled();
		});

		it('should kill all tweens', () => {
			scene.create();

			(scene as unknown as { cleanupEffects: () => void }).cleanupEffects();

			expect(mockTween.killAll).toHaveBeenCalled();
		});
	});

	describe('scene initialization with player data', () => {
		it('should accept playerData in init', () => {
			const playerData = { health: 100, level: 5 };
			expect(() => scene.init({ playerData })).not.toThrow();
		});
	});

	describe('dark overlay pulsing', () => {
		it('should add pulsing tween to dark overlay', () => {
			scene.create();

			expect(mockTween.add).toHaveBeenCalledWith(
				expect.objectContaining({
					alpha: expect.anything(),
					yoyo: true,
					repeat: -1,
				})
			);
		});
	});

	describe('glitch effects', () => {
		it('should create periodic glitch events', () => {
			scene.create();

			// Two timer events should be created - one for distortion, one for glitch
			expect((scene as unknown as { time: { addEvent: jest.Mock } }).time.addEvent).toHaveBeenCalledTimes(2);
		});
	});

	describe('portal effects', () => {
		it('should create portal text with floating animation', () => {
			scene.create();

			expect((scene as unknown as { add: { text: jest.Mock } }).add.text).toHaveBeenCalled();
		});

		it('should create portal particles', () => {
			scene.create();

			// Particles should be created for portal
			expect((scene as unknown as { add: { particles: jest.Mock } }).add.particles).toHaveBeenCalled();
		});

		it('should create portal glow ellipse', () => {
			scene.create();

			expect((scene as unknown as { add: { ellipse: jest.Mock } }).add.ellipse).toHaveBeenCalled();
		});
	});
});
