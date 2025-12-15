import { MainScene } from '../../scenes/MainScene';
import { NeverquestMapCreator } from '../../plugins/NeverquestMapCreator';
import { NeverquestWarp } from '../../plugins/NeverquestWarp';
import { NeverquestObjectMarker } from '../../plugins/NeverquestObjectMarker';
import { NeverquestEnvironmentParticles } from '../../plugins/NeverquestEnvironmentParticles';
import { NeverquestEnemyZones } from '../../plugins/NeverquestEnemyZones';
import { NeverquestSaveManager } from '../../plugins/NeverquestSaveManager';
import AnimatedTiles from '../../plugins/AnimatedTiles';

// Mock all plugin dependencies
jest.mock('../../plugins/NeverquestMapCreator');
jest.mock('../../plugins/NeverquestWarp');
jest.mock('../../plugins/NeverquestObjectMarker');
jest.mock('../../plugins/NeverquestEnvironmentParticles');
jest.mock('../../plugins/NeverquestEnemyZones');
jest.mock('../../plugins/NeverquestSaveManager');
jest.mock('../../plugins/AnimatedTiles');
jest.mock('../../scenes/SpellWheelScene', () => ({
	SpellWheelSceneName: 'SpellWheelScene',
}));

describe('MainScene', () => {
	let scene: MainScene;
	let mockLoad: any;
	let mockCameras: any;
	let mockScene: any;
	let mockSound: any;
	let mockInput: any;
	let mockSys: any;

	beforeEach(() => {
		// Mock player
		const mockPlayer = {
			container: {
				x: 100,
				y: 100,
			},
		};

		// Mock tilemap
		const mockMap = {
			layers: [] as any[],
			addTilesetImage: jest.fn(),
		};

		// Mock load manager
		mockLoad = {
			scenePlugin: jest.fn(),
		};

		// Mock main camera
		const mockMainCamera = {
			setZoom: jest.fn(),
			startFollow: jest.fn(),
		};

		mockCameras = {
			main: mockMainCamera,
		};

		// Mock scene manager
		mockScene = {
			launch: jest.fn(),
			get: jest.fn(() => ({})),
		};

		// Mock sound manager
		const mockBaseSound = {
			play: jest.fn(),
			stop: jest.fn(),
		};

		mockSound = {
			volume: 1,
			add: jest.fn(() => mockBaseSound),
		};

		// Mock keyboard
		const mockKeyboard = {
			on: jest.fn(),
		};

		mockInput = {
			keyboard: mockKeyboard,
		};

		// Mock sys with animatedTiles plugin
		mockSys = {
			animatedTiles: {
				init: jest.fn(),
			},
		};

		// Mock NeverquestMapCreator
		const mockMapCreatorInstance = {
			create: jest.fn(),
			map: mockMap,
			player: mockPlayer,
		};

		(NeverquestMapCreator as jest.Mock).mockImplementation(() => mockMapCreatorInstance);

		// Mock NeverquestWarp
		const mockWarpInstance = {
			createWarps: jest.fn(),
		};

		(NeverquestWarp as jest.Mock).mockImplementation(() => mockWarpInstance);

		// Mock NeverquestObjectMarker
		const mockObjectMarkerInstance = {
			create: jest.fn(),
		};

		(NeverquestObjectMarker as jest.Mock).mockImplementation(() => mockObjectMarkerInstance);

		// Mock NeverquestEnvironmentParticles
		const mockParticlesInstance = {
			create: jest.fn(),
		};

		(NeverquestEnvironmentParticles as jest.Mock).mockImplementation(() => mockParticlesInstance);

		// Mock NeverquestEnemyZones
		const mockEnemyZonesInstance = {
			create: jest.fn(),
		};

		(NeverquestEnemyZones as jest.Mock).mockImplementation(() => mockEnemyZonesInstance);

		// Mock NeverquestSaveManager
		const mockSaveManagerInstance = {
			create: jest.fn(),
			saveGame: jest.fn(),
			loadGame: jest.fn(),
			applySaveData: jest.fn(),
			createCheckpoint: jest.fn(),
			showSaveNotification: jest.fn(),
		};

		(NeverquestSaveManager as jest.Mock).mockImplementation(() => mockSaveManagerInstance);

		// Create scene instance
		scene = new MainScene();
		(scene as any).load = mockLoad;
		(scene as any).cameras = mockCameras;
		(scene as any).scene = mockScene;
		(scene as any).sound = mockSound;
		(scene as any).input = mockInput;
		(scene as any).sys = mockSys;
		(scene as any).player = mockPlayer;
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('Constructor', () => {
		it('should create scene with correct key', () => {
			expect(scene.constructor.name).toBe('MainScene');
		});

		it('should initialize with null/empty values', () => {
			// Create a fresh scene instance to test constructor initialization
			const freshScene = new MainScene();
			expect(freshScene.player).toBeNull();
			expect(freshScene.mapCreator).toBeNull();
			expect(freshScene.map).toBeNull();
			expect(freshScene.joystickScene).toBeNull();
			expect(freshScene.particles).toBeNull();
			expect(freshScene.themeSound).toBeNull();
			expect(freshScene.enemies).toEqual([]);
			expect(freshScene.neverquestEnemyZones).toBeNull();
			expect(freshScene.saveManager).toBeNull();
			expect(freshScene.upsideDownPortal).toBeNull();
			expect(freshScene.upsideDownPortalParticles).toBeNull();
		});
	});

	describe('init()', () => {
		let mockCameraFadeInCallback: (() => void) | null = null;

		beforeEach(() => {
			mockCameras.main.once = jest.fn().mockImplementation((event: string, callback: () => void) => {
				mockCameraFadeInCallback = callback;
			});
			mockCameras.main.flash = jest.fn();
		});

		it('should handle fromUpsideDown flag', () => {
			scene.init({ fromUpsideDown: true });

			expect(mockCameras.main.once).toHaveBeenCalledWith('camerafadeincomplete', expect.any(Function));
		});

		it('should trigger flash on fade in complete when coming from UpsideDown', () => {
			scene.init({ fromUpsideDown: true });
			if (mockCameraFadeInCallback) {
				mockCameraFadeInCallback();
			}

			expect(mockCameras.main.flash).toHaveBeenCalled();
		});

		it('should not setup flash when not coming from UpsideDown', () => {
			scene.init({});

			expect(mockCameras.main.once).not.toHaveBeenCalled();
		});

		it('should handle undefined data', () => {
			expect(() => scene.init(undefined as any)).not.toThrow();
		});

		it('should handle null data', () => {
			expect(() => scene.init(null as any)).not.toThrow();
		});

		it('should handle data without fromUpsideDown property', () => {
			scene.init({} as any);
			expect(mockCameras.main.once).not.toHaveBeenCalled();
		});
	});

	describe('preload()', () => {
		it('should load AnimatedTiles scene plugin', () => {
			scene.preload();
			expect(mockLoad.scenePlugin).toHaveBeenCalledWith(
				'animatedTiles',
				AnimatedTiles,
				'animatedTiles',
				'animatedTiles'
			);
		});
	});

	describe('create()', () => {
		beforeEach(() => {
			scene.create();
		});

		describe('Camera Setup', () => {
			it('should set camera zoom to 2.5', () => {
				expect(mockCameras.main.setZoom).toHaveBeenCalledWith(2.5);
			});

			it('should start camera following player container', () => {
				expect(mockCameras.main.startFollow).toHaveBeenCalledWith(scene.player.container);
			});
		});

		describe('Map Creation', () => {
			it('should create NeverquestMapCreator', () => {
				expect(NeverquestMapCreator).toHaveBeenCalledWith(scene);
				expect(scene.mapCreator).not.toBeNull();
			});

			it('should call mapCreator.create()', () => {
				expect(scene.mapCreator?.create).toHaveBeenCalled();
			});

			it('should store map reference', () => {
				expect(scene.map).toBe(scene.mapCreator?.map);
			});
		});

		describe('Warp System', () => {
			it('should create NeverquestWarp', () => {
				expect(NeverquestWarp).toHaveBeenCalledWith(scene, scene.player, scene.mapCreator?.map);
			});

			it('should call createWarps()', () => {
				const warpInstance = (NeverquestWarp as jest.Mock).mock.results[0].value;
				expect(warpInstance.createWarps).toHaveBeenCalled();
			});
		});

		describe('Interactive Markers', () => {
			it('should create NeverquestObjectMarker', () => {
				expect(NeverquestObjectMarker).toHaveBeenCalledWith(scene, scene.mapCreator?.map);
			});

			it('should call create() on object markers', () => {
				const markerInstance = (NeverquestObjectMarker as jest.Mock).mock.results[0].value;
				expect(markerInstance.create).toHaveBeenCalled();
			});
		});

		describe('Scene Launching', () => {
			it('should launch DialogScene with correct data', () => {
				expect(mockScene.launch).toHaveBeenCalledWith('DialogScene', {
					player: scene.player,
					map: scene.mapCreator?.map,
					scene: scene,
				});
			});

			it('should get JoystickScene reference', () => {
				expect(mockScene.get).toHaveBeenCalledWith('JoystickScene');
				expect(scene.joystickScene).toBeDefined();
			});

			it('should launch HUDScene with player and map', () => {
				expect(mockScene.launch).toHaveBeenCalledWith('HUDScene', {
					player: scene.player,
					map: scene.mapCreator?.map,
				});
			});
		});

		describe('Animated Tiles', () => {
			it('should initialize animated tiles with map', () => {
				expect(mockSys.animatedTiles.init).toHaveBeenCalledWith(scene.mapCreator?.map);
			});
		});

		describe('Environment Particles', () => {
			it('should create NeverquestEnvironmentParticles', () => {
				expect(NeverquestEnvironmentParticles).toHaveBeenCalledWith(scene, scene.mapCreator?.map);
				expect(scene.particles).not.toBeNull();
			});

			it('should call particles.create()', () => {
				expect(scene.particles?.create).toHaveBeenCalled();
			});
		});

		describe('Audio Setup', () => {
			it('should set sound volume to 0.35', () => {
				expect(mockSound.volume).toBe(0.35);
			});

			it('should add theme sound with loop', () => {
				expect(mockSound.add).toHaveBeenCalledWith('path_to_lake_land', { loop: true });
				expect(scene.themeSound).not.toBeNull();
			});

			it('should play theme sound', () => {
				expect(scene.themeSound?.play).toHaveBeenCalled();
			});
		});

		describe('Enemy System', () => {
			it('should initialize enemies array', () => {
				expect(scene.enemies).toEqual([]);
			});

			it('should create NeverquestEnemyZones', () => {
				expect(NeverquestEnemyZones).toHaveBeenCalledWith(scene, scene.mapCreator?.map);
				expect(scene.neverquestEnemyZones).not.toBeNull();
			});

			it('should call enemyZones.create()', () => {
				expect(scene.neverquestEnemyZones?.create).toHaveBeenCalled();
			});
		});

		describe('Save System', () => {
			it('should create NeverquestSaveManager', () => {
				expect(NeverquestSaveManager).toHaveBeenCalledWith(scene);
				expect(scene.saveManager).not.toBeNull();
			});

			it('should call saveManager.create()', () => {
				expect(scene.saveManager?.create).toHaveBeenCalled();
			});

			it('should setup save keybinds', () => {
				expect(mockInput.keyboard.on).toHaveBeenCalledWith('keydown', expect.any(Function));
			});
		});
	});

	describe('stopSceneMusic()', () => {
		it('should stop theme sound', () => {
			scene.create();
			scene.stopSceneMusic();
			expect(scene.themeSound?.stop).toHaveBeenCalled();
		});

		it('should handle null theme sound gracefully', () => {
			scene.themeSound = null;
			expect(() => scene.stopSceneMusic()).toThrow();
		});
	});

	describe('setupSaveKeybinds()', () => {
		let keydownCallback: (event: KeyboardEvent) => void;

		beforeEach(() => {
			scene.create();
			const keyboardOnCall = mockInput.keyboard.on.mock.calls.find((call: any) => call[0] === 'keydown');
			keydownCallback = keyboardOnCall[1];
		});

		describe('Ctrl+S - Manual Save', () => {
			it('should save game on Ctrl+S', () => {
				const event = {
					ctrlKey: true,
					key: 's',
					preventDefault: jest.fn(),
				} as unknown as KeyboardEvent;

				keydownCallback(event);

				expect(event.preventDefault).toHaveBeenCalled();
				expect(scene.saveManager?.saveGame).toHaveBeenCalledWith(false);
			});

			it('should not save without Ctrl key', () => {
				const event = {
					ctrlKey: false,
					key: 's',
					preventDefault: jest.fn(),
				} as unknown as KeyboardEvent;

				keydownCallback(event);

				expect(scene.saveManager?.saveGame).not.toHaveBeenCalled();
			});
		});

		describe('Ctrl+L - Load Save', () => {
			it('should load game on Ctrl+L', () => {
				const mockSaveData = { scene: 'MainScene', playerData: {} };
				(scene.saveManager?.loadGame as jest.Mock).mockReturnValue(mockSaveData);

				const event = {
					ctrlKey: true,
					key: 'l',
					preventDefault: jest.fn(),
				} as unknown as KeyboardEvent;

				keydownCallback(event);

				expect(event.preventDefault).toHaveBeenCalled();
				expect(scene.saveManager?.loadGame).toHaveBeenCalledWith(false);
				expect(scene.saveManager?.applySaveData).toHaveBeenCalledWith(mockSaveData);
			});

			it('should not apply save data if load returns null', () => {
				(scene.saveManager?.loadGame as jest.Mock).mockReturnValue(null);

				const event = {
					ctrlKey: true,
					key: 'l',
					preventDefault: jest.fn(),
				} as unknown as KeyboardEvent;

				keydownCallback(event);

				expect(scene.saveManager?.applySaveData).not.toHaveBeenCalled();
			});

			it('should not load without Ctrl key', () => {
				const event = {
					ctrlKey: false,
					key: 'l',
					preventDefault: jest.fn(),
				} as unknown as KeyboardEvent;

				keydownCallback(event);

				expect(scene.saveManager?.loadGame).not.toHaveBeenCalled();
			});
		});

		describe('F5 - Load Checkpoint', () => {
			it('should load checkpoint on F5', () => {
				const mockSaveData = { scene: 'MainScene', playerData: {} };
				(scene.saveManager?.loadGame as jest.Mock).mockReturnValue(mockSaveData);

				const event = {
					key: 'F5',
					preventDefault: jest.fn(),
				} as unknown as KeyboardEvent;

				keydownCallback(event);

				expect(event.preventDefault).toHaveBeenCalled();
				expect(scene.saveManager?.loadGame).toHaveBeenCalledWith(true);
				expect(scene.saveManager?.applySaveData).toHaveBeenCalledWith(mockSaveData);
			});

			it('should show notification if no checkpoint exists', () => {
				(scene.saveManager?.loadGame as jest.Mock).mockReturnValue(null);

				const event = {
					key: 'F5',
					preventDefault: jest.fn(),
				} as unknown as KeyboardEvent;

				keydownCallback(event);

				expect(scene.saveManager?.showSaveNotification).toHaveBeenCalledWith('No checkpoint found', true);
			});
		});

		describe('F6 - Manual Checkpoint', () => {
			it('should create checkpoint on F6', () => {
				const event = {
					key: 'F6',
					preventDefault: jest.fn(),
				} as unknown as KeyboardEvent;

				keydownCallback(event);

				expect(event.preventDefault).toHaveBeenCalled();
				expect(scene.saveManager?.createCheckpoint).toHaveBeenCalled();
			});
		});

		describe('Other Keys', () => {
			it('should not trigger save actions for other keys', () => {
				const event = {
					key: 'a',
					ctrlKey: false,
					preventDefault: jest.fn(),
				} as unknown as KeyboardEvent;

				keydownCallback(event);

				expect(scene.saveManager?.saveGame).not.toHaveBeenCalled();
				expect(scene.saveManager?.loadGame).not.toHaveBeenCalled();
			});

			it('should not prevent default for non-save keys', () => {
				const event = {
					key: 'w',
					ctrlKey: false,
					preventDefault: jest.fn(),
				} as unknown as KeyboardEvent;

				keydownCallback(event);

				expect(event.preventDefault).not.toHaveBeenCalled();
			});
		});
	});

	describe('update()', () => {
		it('should exist as empty method', () => {
			expect(scene.update).toBeDefined();
			expect(() => scene.update()).not.toThrow();
		});

		it('should be callable without errors', () => {
			scene.create();
			expect(() => {
				scene.update();
				scene.update();
				scene.update();
			}).not.toThrow();
		});
	});

	describe('Integration', () => {
		it('should initialize all core systems in correct order', () => {
			const callOrder: string[] = [];

			// Track creation order
			(NeverquestMapCreator as jest.Mock).mockImplementation((_s) => {
				callOrder.push('MapCreator');
				return {
					create: jest.fn(() => callOrder.push('MapCreator.create')),
					map: {},
				};
			});

			(NeverquestWarp as jest.Mock).mockImplementation(() => {
				callOrder.push('Warp');
				return { createWarps: jest.fn(() => callOrder.push('Warp.createWarps')) };
			});

			(NeverquestObjectMarker as jest.Mock).mockImplementation(() => {
				callOrder.push('ObjectMarker');
				return { create: jest.fn(() => callOrder.push('ObjectMarker.create')) };
			});

			(NeverquestEnvironmentParticles as jest.Mock).mockImplementation(() => {
				callOrder.push('Particles');
				return { create: jest.fn(() => callOrder.push('Particles.create')) };
			});

			(NeverquestEnemyZones as jest.Mock).mockImplementation(() => {
				callOrder.push('EnemyZones');
				return { create: jest.fn(() => callOrder.push('EnemyZones.create')) };
			});

			(NeverquestSaveManager as jest.Mock).mockImplementation(() => {
				callOrder.push('SaveManager');
				return { create: jest.fn(() => callOrder.push('SaveManager.create')) };
			});

			scene.create();

			// Verify order: Map -> Warp -> Markers -> Particles -> EnemyZones -> SaveManager
			expect(callOrder.indexOf('MapCreator')).toBeLessThan(callOrder.indexOf('Warp'));
			expect(callOrder.indexOf('Warp')).toBeLessThan(callOrder.indexOf('ObjectMarker'));
			expect(callOrder.indexOf('ObjectMarker')).toBeLessThan(callOrder.indexOf('Particles'));
			expect(callOrder.indexOf('Particles')).toBeLessThan(callOrder.indexOf('EnemyZones'));
			expect(callOrder.indexOf('EnemyZones')).toBeLessThan(callOrder.indexOf('SaveManager'));
		});

		it('should launch all required scenes', () => {
			scene.create();

			expect(mockScene.launch).toHaveBeenCalledTimes(2);
			expect(mockScene.launch).toHaveBeenCalledWith('DialogScene', expect.any(Object));
			expect(mockScene.launch).toHaveBeenCalledWith('HUDScene', expect.any(Object));
		});

		it('should handle full game initialization', () => {
			scene.create();

			// Verify all core systems initialized
			expect(scene.mapCreator).not.toBeNull();
			expect(scene.map).not.toBeNull();
			expect(scene.particles).not.toBeNull();
			expect(scene.neverquestEnemyZones).not.toBeNull();
			expect(scene.saveManager).not.toBeNull();
			expect(scene.themeSound).not.toBeNull();

			// Verify camera is set up
			expect(mockCameras.main.setZoom).toHaveBeenCalled();
			expect(mockCameras.main.startFollow).toHaveBeenCalled();

			// Verify save system is ready
			expect(mockInput.keyboard.on).toHaveBeenCalled();
		});

		it('should handle save/load cycle', () => {
			scene.create();

			const keydownCallback = mockInput.keyboard.on.mock.calls[0][1];

			// Save game
			const saveEvent = {
				ctrlKey: true,
				key: 's',
				preventDefault: jest.fn(),
			} as unknown as KeyboardEvent;
			keydownCallback(saveEvent);
			expect(scene.saveManager?.saveGame).toHaveBeenCalled();

			// Load game
			const mockSaveData = { scene: 'MainScene' };
			(scene.saveManager?.loadGame as jest.Mock).mockReturnValue(mockSaveData);

			const loadEvent = {
				ctrlKey: true,
				key: 'l',
				preventDefault: jest.fn(),
			} as unknown as KeyboardEvent;
			keydownCallback(loadEvent);
			expect(scene.saveManager?.loadGame).toHaveBeenCalled();
			expect(scene.saveManager?.applySaveData).toHaveBeenCalledWith(mockSaveData);
		});

		it('should pass map reference to all map-dependent systems', () => {
			scene.create();

			const mapRef = scene.mapCreator?.map;

			// Verify map is passed to all systems that need it
			expect(NeverquestWarp).toHaveBeenCalledWith(scene, scene.player, mapRef);
			expect(NeverquestObjectMarker).toHaveBeenCalledWith(scene, mapRef);
			expect(NeverquestEnvironmentParticles).toHaveBeenCalledWith(scene, mapRef);
			expect(NeverquestEnemyZones).toHaveBeenCalledWith(scene, mapRef);
			expect(mockScene.launch).toHaveBeenCalledWith('DialogScene', expect.objectContaining({ map: mapRef }));
			expect(mockScene.launch).toHaveBeenCalledWith('HUDScene', expect.objectContaining({ map: mapRef }));
		});
	});
});
