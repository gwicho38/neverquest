/**
 * Tests for VirtualJoystickPlugin
 */

import VirtualJoystick from '../../../plugins/VirtualJoystick/VirtualJoystickPlugin';

// Mock the dependent classes
jest.mock('../../../plugins/VirtualJoystick/Stick', () => {
	return jest.fn().mockImplementation(() => ({
		update: jest.fn(),
		destroy: jest.fn(),
	}));
});

jest.mock('../../../plugins/VirtualJoystick/HiddenStick', () => {
	return jest.fn().mockImplementation(() => ({
		update: jest.fn(),
		destroy: jest.fn(),
	}));
});

jest.mock('../../../plugins/VirtualJoystick/DPad', () => {
	return jest.fn().mockImplementation(() => ({
		update: jest.fn(),
		destroy: jest.fn(),
	}));
});

jest.mock('../../../plugins/VirtualJoystick/Button', () => {
	return jest.fn().mockImplementation(() => ({
		update: jest.fn(),
		destroy: jest.fn(),
	}));
});

describe('VirtualJoystickPlugin', () => {
	let mockScene: any;
	let mockPluginManager: any;
	let mockSystems: any;
	let mockEventEmitter: any;

	beforeEach(() => {
		jest.clearAllMocks();

		mockEventEmitter = {
			on: jest.fn(),
			off: jest.fn(),
			once: jest.fn(),
		};

		mockSystems = {
			events: mockEventEmitter,
			settings: {
				active: true,
			},
			input: {
				addPointer: jest.fn(),
			},
		};

		mockScene = {
			sys: mockSystems,
		};

		mockPluginManager = {
			game: {},
		};
	});

	describe('constructor', () => {
		it('should initialize plugin with scene and plugin manager', () => {
			const plugin = new VirtualJoystick(mockScene, mockPluginManager);

			expect(plugin.scene).toBe(mockScene);
			expect(plugin.pluginManager).toBe(mockPluginManager);
			expect(plugin.game).toBe(mockPluginManager.game);
			expect(plugin.systems).toBe(mockSystems);
		});

		it('should initialize sticks and buttons as null', () => {
			const plugin = new VirtualJoystick(mockScene, mockPluginManager);

			expect(plugin.sticks).toBeNull();
			expect(plugin.buttons).toBeNull();
		});

		it('should register boot event listener', () => {
			new VirtualJoystick(mockScene, mockPluginManager);

			expect(mockEventEmitter.once).toHaveBeenCalledWith('boot', expect.any(Function), expect.anything());
		});
	});

	describe('boot', () => {
		it('should register destroy event and start if scene is active', () => {
			const plugin = new VirtualJoystick(mockScene, mockPluginManager);

			plugin.boot();

			expect(mockEventEmitter.once).toHaveBeenCalledWith('destroy', expect.any(Function), expect.anything());
		});

		it('should register start event if scene is not active', () => {
			mockSystems.settings.active = false;
			const plugin = new VirtualJoystick(mockScene, mockPluginManager);

			plugin.boot();

			expect(mockEventEmitter.on).toHaveBeenCalledWith('start', expect.any(Function), expect.anything());
		});
	});

	describe('start', () => {
		it('should initialize sticks and buttons sets', () => {
			const plugin = new VirtualJoystick(mockScene, mockPluginManager);

			plugin.start();

			expect(plugin.sticks).toBeInstanceOf(Set);
			expect(plugin.buttons).toBeInstanceOf(Set);
			expect(plugin.sticks!.size).toBe(0);
			expect(plugin.buttons!.size).toBe(0);
		});

		it('should register update and shutdown event listeners', () => {
			const plugin = new VirtualJoystick(mockScene, mockPluginManager);

			plugin.start();

			expect(mockEventEmitter.on).toHaveBeenCalledWith('update', expect.any(Function), expect.anything());
			expect(mockEventEmitter.once).toHaveBeenCalledWith('shutdown', expect.any(Function), expect.anything());
		});
	});

	describe('addStick', () => {
		it('should create and add a new Stick', () => {
			const plugin = new VirtualJoystick(mockScene, mockPluginManager);
			plugin.start();

			const stick = plugin.addStick(100, 200, 50, 'joystick', 'base', 'stick');

			expect(stick).toBeDefined();
			expect(plugin.sticks!.size).toBe(1);
			expect(plugin._pointerTotal).toBe(1);
		});

		it('should add pointer when more than 2 pointers needed', () => {
			const plugin = new VirtualJoystick(mockScene, mockPluginManager);
			plugin.start();
			plugin._pointerTotal = 2;

			plugin.addStick(100, 200, 50, 'joystick');

			expect(mockSystems.input.addPointer).toHaveBeenCalled();
		});
	});

	describe('addHiddenStick', () => {
		it('should create and add a new HiddenStick', () => {
			const plugin = new VirtualJoystick(mockScene, mockPluginManager);
			plugin.start();

			const stick = plugin.addHiddenStick(50);

			expect(stick).toBeDefined();
			expect(plugin.sticks!.size).toBe(1);
			expect(plugin._pointerTotal).toBe(1);
		});
	});

	describe('addDPad', () => {
		it('should create and add a new DPad', () => {
			const plugin = new VirtualJoystick(mockScene, mockPluginManager);
			plugin.start();

			const dpad = plugin.addDPad(100, 200, 50, 'dpad');

			expect(dpad).toBeDefined();
			expect(plugin.sticks!.size).toBe(1);
			expect(plugin._pointerTotal).toBe(1);
		});
	});

	describe('addButton', () => {
		it('should create and add a new Button', () => {
			const plugin = new VirtualJoystick(mockScene, mockPluginManager);
			plugin.start();

			const button = plugin.addButton(100, 200, 'button', 'up', 'down');

			expect(button).toBeDefined();
			expect(plugin.buttons!.size).toBe(1);
			expect(plugin._pointerTotal).toBe(1);
		});
	});

	describe('removeStick', () => {
		it('should remove and destroy a stick', () => {
			const plugin = new VirtualJoystick(mockScene, mockPluginManager);
			plugin.start();

			const stick = plugin.addStick(100, 200, 50, 'joystick');
			const initialCount = plugin._pointerTotal;

			plugin.removeStick(stick);

			expect(plugin.sticks!.size).toBe(0);
			expect(stick.destroy).toHaveBeenCalled();
			expect(plugin._pointerTotal).toBe(initialCount - 1);
		});
	});

	describe('removeButton', () => {
		it('should remove and destroy a single button', () => {
			const plugin = new VirtualJoystick(mockScene, mockPluginManager);
			plugin.start();

			const button = plugin.addButton(100, 200, 'button', 'up', 'down');
			const initialCount = plugin._pointerTotal;

			plugin.removeButton(button);

			expect(plugin.buttons!.size).toBe(0);
			expect(button.destroy).toHaveBeenCalled();
			expect(plugin._pointerTotal).toBe(initialCount - 1);
		});

		it('should remove and destroy an array of buttons', () => {
			const plugin = new VirtualJoystick(mockScene, mockPluginManager);
			plugin.start();

			const button1 = plugin.addButton(100, 200, 'button', 'up', 'down');
			const button2 = plugin.addButton(200, 200, 'button', 'up', 'down');
			const initialCount = plugin._pointerTotal;

			plugin.removeButton([button1, button2]);

			expect(plugin.buttons!.size).toBe(0);
			expect(button1.destroy).toHaveBeenCalled();
			expect(button2.destroy).toHaveBeenCalled();
			expect(plugin._pointerTotal).toBe(initialCount - 2);
		});
	});

	describe('update', () => {
		it('should update all sticks and buttons', () => {
			const plugin = new VirtualJoystick(mockScene, mockPluginManager);
			plugin.start();

			const stick = plugin.addStick(100, 200, 50, 'joystick');
			const button = plugin.addButton(100, 200, 'button', 'up', 'down');

			plugin.update(1000);

			expect(stick.update).toHaveBeenCalledWith(1000);
			expect(button.update).toHaveBeenCalledWith(1000);
		});
	});

	describe('shutdown', () => {
		it('should remove event listeners', () => {
			const plugin = new VirtualJoystick(mockScene, mockPluginManager);
			plugin.start();

			plugin.shutdown();

			expect(mockEventEmitter.off).toHaveBeenCalledWith('update', expect.any(Function), expect.anything());
			expect(mockEventEmitter.off).toHaveBeenCalledWith('shutdown', expect.any(Function), expect.anything());
		});
	});

	describe('destroy', () => {
		it('should destroy all sticks and buttons', () => {
			const plugin = new VirtualJoystick(mockScene, mockPluginManager);
			plugin.start();

			const stick = plugin.addStick(100, 200, 50, 'joystick');
			const button = plugin.addButton(100, 200, 'button', 'up', 'down');

			plugin.destroy();

			expect(stick.destroy).toHaveBeenCalled();
			expect(button.destroy).toHaveBeenCalled();
			expect(plugin.sticks!.size).toBe(0);
			expect(plugin.buttons!.size).toBe(0);
			expect(plugin._pointerTotal).toBe(0);
		});
	});

	describe('static constants', () => {
		it('should have NONE constant', () => {
			expect((VirtualJoystick as any).NONE).toBe(0);
		});

		it('should have HORIZONTAL constant', () => {
			expect((VirtualJoystick as any).HORIZONTAL).toBe(1);
		});

		it('should have VERTICAL constant', () => {
			expect((VirtualJoystick as any).VERTICAL).toBe(2);
		});

		it('should have CIRC_BUTTON constant', () => {
			expect((VirtualJoystick as any).CIRC_BUTTON).toBe(3);
		});

		it('should have RECT_BUTTON constant', () => {
			expect((VirtualJoystick as any).RECT_BUTTON).toBe(4);
		});
	});
});
