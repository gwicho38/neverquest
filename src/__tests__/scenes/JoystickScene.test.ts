import { JoystickScene } from '../../scenes/JoystickScene';
import { NeverquestBattleManager } from '../../plugins/NeverquestBattleManager';

// Mock dependencies
jest.mock('../../plugins/NeverquestBattleManager');
jest.mock('../../plugins/VirtualJoystick/VirtualJoystickPlugin', () => ({}), { virtual: true });

describe('JoystickScene', () => {
	let scene: JoystickScene;
	let mockLoad: any;
	let mockInput: any;
	let mockScale: any;
	let mockCameras: any;
	let mockEvents: any;
	let mockSys: any;
	let mockPad: any;

	beforeEach(() => {
		// Mock stick and button objects
		const mockStick = {
			alignBottomLeft: jest.fn().mockReturnThis(),
			isDown: false,
			rotation: 0,
			force: 1,
		};

		const mockPhantomStick = {
			alignBottomLeft: jest.fn().mockReturnThis(),
			posX: 0,
			posY: 0,
			isDown: false,
		};

		const mockButton = {
			setName: jest.fn().mockReturnThis(),
			alignBottomRight: jest.fn().mockReturnThis(),
			on: jest.fn().mockReturnThis(),
			posX: 0,
			posY: 0,
		};

		// Mock pad (VirtualJoystick plugin)
		mockPad = {
			addHiddenStick: jest.fn(() => mockStick),
			addStick: jest.fn(() => mockPhantomStick),
			addButton: jest.fn(() => ({ ...mockButton })),
		};

		// Mock load
		mockLoad = {
			scenePlugin: jest.fn(),
			atlas: jest.fn(),
		};

		// Mock pointers
		const mockPointer = {
			x: 100,
			y: 100,
			isDown: false,
		};

		// Mock input
		mockInput = {
			addPointer: jest.fn(),
			on: jest.fn(),
			pointer1: { ...mockPointer },
			pointer2: { ...mockPointer },
		};

		// Mock scale manager
		mockScale = {
			on: jest.fn(),
		};

		// Mock cameras
		mockCameras = {
			main: {
				width: 800,
				height: 600,
			},
		};

		// Mock events
		mockEvents = {
			emit: jest.fn(),
		};

		// Mock sys with device info
		mockSys = {
			game: {
				device: {
					os: {
						desktop: false, // Mobile by default
					},
				},
			},
		};

		// Mock NeverquestBattleManager
		const mockBattleManager = {
			atack: jest.fn(),
		};
		(NeverquestBattleManager as jest.Mock).mockImplementation(() => mockBattleManager);

		// Create scene instance
		scene = new JoystickScene();
		(scene as any).load = mockLoad;
		(scene as any).input = mockInput;
		(scene as any).scale = mockScale;
		(scene as any).cameras = mockCameras;
		(scene as any).events = mockEvents;
		(scene as any).sys = mockSys;
		(scene as any).pad = mockPad;
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('Constructor', () => {
		it('should create scene with correct key', () => {
			expect(scene.constructor.name).toBe('JoystickScene');
		});

		it('should initialize with default values', () => {
			expect(scene.useOnScreenControls).toBe(true);
			expect(scene.player).toBeNull();
			expect(scene.stick).toBeNull();
			expect(scene.buttonA).toBeNull();
			expect(scene.buttonB).toBeNull();
			expect(scene.neverquestBattleManager).toBeNull();
			expect(scene.phantomStick).toBeNull();
		});

		it('should initialize button names', () => {
			expect(scene.buttonAName).toBe('mobile_ButtonA');
			expect(scene.buttonBName).toBe('mobile_ButtonB');
		});

		it('should initialize atlas name', () => {
			expect(scene.atlasName).toBe('joystick');
		});

		it('should initialize mobile flag to false', () => {
			expect(scene.isMobile).toBe(false);
		});

		it('should initialize position multipliers', () => {
			expect(scene.stickPositionMultiplier).toBe(0.1);
			expect(scene.buttonAMultiplierXposition).toBe(0.18);
			expect(scene.buttonAMultiplierYposition).toBe(0.25);
		});
	});

	describe('preload()', () => {
		it('should load VirtualJoystickPlugin', () => {
			scene.preload();
			expect(mockLoad.scenePlugin).toHaveBeenCalledWith(
				'VirtualJoystickPlugin',
				expect.anything(),
				'VirtualJoystickPlugin',
				'pad'
			);
		});

		it('should load joystick atlas', () => {
			scene.preload();
			expect(mockLoad.atlas).toHaveBeenCalledWith('joystick', expect.anything(), expect.anything());
		});
	});

	describe('init()', () => {
		it('should set player from args', () => {
			const mockPlayer = { name: 'TestPlayer' };
			scene.init({ player: mockPlayer });
			expect(scene.player).toBe(mockPlayer);
		});
	});

	describe('create() - Mobile', () => {
		beforeEach(() => {
			(scene as any).sys.game.device.os.desktop = false;
			scene.create();
		});

		it('should add 6 additional pointers for multitouch', () => {
			expect(mockInput.addPointer).toHaveBeenCalledWith(6);
		});

		it('should detect mobile device', () => {
			expect(scene.isMobile).toBe(true);
		});

		it('should create hidden stick', () => {
			expect(mockPad.addHiddenStick).toHaveBeenCalledWith(120);
			expect(scene.stick).toBeDefined();
		});

		it('should create phantom stick with correct alignment', () => {
			expect(mockPad.addStick).toHaveBeenCalledWith(0, 0, 120, 'joystick', 'base', 'stick');
			expect(scene.phantomStick).toBeDefined();
			expect(scene.phantomStick.alignBottomLeft).toHaveBeenCalled();
		});

		it('should create button A', () => {
			expect(mockPad.addButton).toHaveBeenCalledWith(0, 120, 'joystick', 'button0-up', 'button0-down');
			expect(scene.buttonA).toBeDefined();
		});

		it('should set button A name', () => {
			expect(scene.buttonA.setName).toHaveBeenCalledWith('mobile_ButtonA');
		});

		it('should position button A in bottom right', () => {
			expect(scene.buttonA.posX).toBeGreaterThan(0);
			expect(scene.buttonA.posY).toBeGreaterThan(0);
		});

		it('should emit setStick event', () => {
			expect(mockEvents.emit).toHaveBeenCalledWith('setStick', scene.stick);
		});

		it('should emit JoystickReady event', () => {
			expect(mockEvents.emit).toHaveBeenCalledWith('JoystickReady');
		});

		it('should create battle manager', () => {
			expect(NeverquestBattleManager).toHaveBeenCalled();
			expect(scene.neverquestBattleManager).toBeDefined();
		});

		it('should register pointerdown event handler', () => {
			expect(mockInput.on).toHaveBeenCalledWith('pointerdown', expect.any(Function));
		});

		it('should register pointerup event handler', () => {
			expect(mockInput.on).toHaveBeenCalledWith('pointerup', expect.any(Function));
		});

		it('should register resize event handler', () => {
			expect(mockScale.on).toHaveBeenCalledWith('resize', expect.any(Function));
		});
	});

	describe('create() - Desktop', () => {
		beforeEach(() => {
			(scene as any).sys.game.device.os.desktop = true;
			scene.create();
		});

		it('should detect desktop device', () => {
			expect(scene.isMobile).toBe(false);
		});

		it('should not create sticks on desktop', () => {
			expect(scene.stick).toBeNull();
			expect(scene.phantomStick).toBeNull();
		});

		it('should not create buttons on desktop', () => {
			expect(scene.buttonA).toBeNull();
		});

		it('should still create battle manager', () => {
			expect(scene.neverquestBattleManager).toBeDefined();
		});

		it('should still emit JoystickReady event', () => {
			expect(mockEvents.emit).toHaveBeenCalledWith('JoystickReady');
		});
	});

	describe('pointerdown event handler - Mobile', () => {
		beforeEach(() => {
			(scene as any).sys.game.device.os.desktop = false;
			scene.create();
		});

		it('should move phantom stick when touching left half', () => {
			const pointerdownCall = mockInput.on.mock.calls.find((call: any) => call[0] === 'pointerdown');
			const handler = pointerdownCall[1];

			const pointer = { x: 200, y: 300 };
			handler(pointer);

			expect(scene.phantomStick.posX).toBe(200);
			expect(scene.phantomStick.posY).toBe(300);
			expect(scene.phantomStick.isDown).toBe(true);
		});

		it('should disable stick when touching right half', () => {
			const pointerdownCall = mockInput.on.mock.calls.find((call: any) => call[0] === 'pointerdown');
			const handler = pointerdownCall[1];

			const pointer = { x: 600, y: 300 };
			handler(pointer);

			expect(scene.stick.isDown).toBe(false);
		});
	});

	describe('pointerup event handler - Mobile', () => {
		beforeEach(() => {
			(scene as any).sys.game.device.os.desktop = false;
			scene.create();
		});

		it('should realign phantom stick when released', () => {
			scene.phantomStick!.isDown = false;

			const pointerupCall = mockInput.on.mock.calls.find((call: any) => call[0] === 'pointerup');
			const handler = pointerupCall[1];

			(scene.phantomStick!.alignBottomLeft as jest.Mock).mockClear();
			handler();

			expect(scene.phantomStick!.alignBottomLeft).toHaveBeenCalled();
		});

		it('should not realign if stick is still down', () => {
			scene.phantomStick!.isDown = true;

			const pointerupCall = mockInput.on.mock.calls.find((call: any) => call[0] === 'pointerup');
			const handler = pointerupCall[1];

			(scene.phantomStick!.alignBottomLeft as jest.Mock).mockClear();
			handler();

			expect(scene.phantomStick!.alignBottomLeft).not.toHaveBeenCalled();
		});
	});

	describe('resize event handler - Mobile', () => {
		beforeEach(() => {
			(scene as any).sys.game.device.os.desktop = false;
			scene.create();
		});

		it('should realign stick on resize', () => {
			const resizeCall = mockScale.on.mock.calls.find((call: any) => call[0] === 'resize');
			const handler = resizeCall[1];

			(scene.stick!.alignBottomLeft as jest.Mock).mockClear();
			handler({ width: 1024, height: 768 });

			expect(scene.stick!.alignBottomLeft).toHaveBeenCalled();
		});

		it('should reposition button A on resize', () => {
			const resizeCall = mockScale.on.mock.calls.find((call: any) => call[0] === 'resize');
			const handler = resizeCall[1];

			handler({ width: 1024, height: 768 });

			// Position should be recalculated
			expect(typeof scene.buttonA.posX).toBe('number');
			expect(typeof scene.buttonA.posY).toBe('number');
		});

		it('should handle null stick gracefully', () => {
			scene.stick = null;

			const resizeCall = mockScale.on.mock.calls.find((call: any) => call[0] === 'resize');
			const handler = resizeCall[1];

			expect(() => handler({ width: 1024, height: 768 })).not.toThrow();
		});
	});

	describe('createButtonActions()', () => {
		beforeEach(() => {
			(scene as any).sys.game.device.os.desktop = false;
			const mockPlayer = {
				active: true,
				canAtack: true,
				isAtacking: false,
			};
			scene.init({ player: mockPlayer });
			scene.create();
		});

		it('should register button A down event', () => {
			expect(scene.buttonA.on).toHaveBeenCalledWith('down', expect.any(Function));
		});

		it('should trigger attack when button A pressed', () => {
			const downCall = (scene.buttonA!.on as jest.Mock).mock.calls.find((call: unknown[]) => call[0] === 'down');
			const handler = downCall[1];

			handler();

			expect(scene.neverquestBattleManager!.atack).toHaveBeenCalledWith(scene.player);
		});

		it('should not attack if player not active', () => {
			scene.player!.active = false;

			const downCall = (scene.buttonA!.on as jest.Mock).mock.calls.find((call: unknown[]) => call[0] === 'down');
			const handler = downCall[1];

			(scene.neverquestBattleManager!.atack as jest.Mock).mockClear();
			handler();

			expect(scene.neverquestBattleManager!.atack).not.toHaveBeenCalled();
		});

		it('should not attack if player cannot attack', () => {
			scene.player!.canAtack = false;

			const downCall = (scene.buttonA!.on as jest.Mock).mock.calls.find((call: unknown[]) => call[0] === 'down');
			const handler = downCall[1];

			(scene.neverquestBattleManager!.atack as jest.Mock).mockClear();
			handler();

			expect(scene.neverquestBattleManager!.atack).not.toHaveBeenCalled();
		});

		it('should not attack if player is already attacking', () => {
			scene.player!.isAtacking = true;

			const downCall = (scene.buttonA!.on as jest.Mock).mock.calls.find((call: unknown[]) => call[0] === 'down');
			const handler = downCall[1];

			(scene.neverquestBattleManager!.atack as jest.Mock).mockClear();
			handler();

			expect(scene.neverquestBattleManager!.atack).not.toHaveBeenCalled();
		});

		it('should handle null player gracefully', () => {
			scene.player = null;

			const downCall = (scene.buttonA!.on as jest.Mock).mock.calls.find((call: unknown[]) => call[0] === 'down');
			const handler = downCall[1];

			expect(() => handler()).not.toThrow();
		});

		it('should handle null button A gracefully', () => {
			const mockPlayer = {
				active: true,
				canAtack: true,
				isAtacking: false,
			};
			scene.init({ player: mockPlayer });
			scene.buttonA = null;

			expect(() => scene.createButtonActions()).not.toThrow();
		});
	});

	describe('update()', () => {
		it('should not throw errors', () => {
			expect(() => scene.update()).not.toThrow();
		});
	});

	describe('Integration - Mobile', () => {
		it('should initialize all mobile components in correct order', () => {
			(scene as any).sys.game.device.os.desktop = false;
			const mockPlayer = { name: 'TestPlayer' };
			scene.init({ player: mockPlayer });
			scene.create();

			expect(scene.player).toBe(mockPlayer);
			expect(scene.isMobile).toBe(true);
			expect(scene.stick).toBeDefined();
			expect(scene.phantomStick).toBeDefined();
			expect(scene.buttonA).toBeDefined();
			expect(scene.neverquestBattleManager).toBeDefined();
		});

		it('should handle full touch interaction cycle', () => {
			(scene as any).sys.game.device.os.desktop = false;
			scene.create();

			// Touch left side
			const pointerdownCall = mockInput.on.mock.calls.find((call: any) => call[0] === 'pointerdown');
			pointerdownCall[1]({ x: 200, y: 300 });
			expect(scene.phantomStick.isDown).toBe(true);

			// Release
			scene.phantomStick.isDown = false;
			const pointerupCall = mockInput.on.mock.calls.find((call: any) => call[0] === 'pointerup');
			pointerupCall[1]();
			expect(scene.phantomStick.alignBottomLeft).toHaveBeenCalled();
		});

		it('should handle resize with all components', () => {
			(scene as any).sys.game.device.os.desktop = false;
			scene.create();

			const resizeCall = mockScale.on.mock.calls.find((call: any) => call[0] === 'resize');
			resizeCall[1]({ width: 1024, height: 768 });

			expect(scene.stick.alignBottomLeft).toHaveBeenCalled();
			expect(scene.buttonA.posX).toBeGreaterThan(0);
		});
	});

	describe('Integration - Desktop', () => {
		it('should initialize minimal components on desktop', () => {
			(scene as any).sys.game.device.os.desktop = true;
			const mockPlayer = { name: 'TestPlayer' };
			scene.init({ player: mockPlayer });
			scene.create();

			expect(scene.player).toBe(mockPlayer);
			expect(scene.isMobile).toBe(false);
			expect(scene.stick).toBeNull();
			expect(scene.phantomStick).toBeNull();
			expect(scene.buttonA).toBeNull();
			expect(scene.neverquestBattleManager).toBeDefined();
		});
	});
});
