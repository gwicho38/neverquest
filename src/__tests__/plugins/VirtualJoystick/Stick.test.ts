/**
 * Tests for VirtualJoystick Stick
 */

import Stick from '../../../plugins/VirtualJoystick/Stick';

// Add missing Phaser Geom classes to the global mock
beforeAll(() => {
	// Ensure Phaser and Phaser.Geom exist
	(global as any).Phaser = (global as any).Phaser || {};
	(global as any).Phaser.Geom = (global as any).Phaser.Geom || {};
	(global as any).Phaser.Math = (global as any).Phaser.Math || {};

	// The jest setup already provides Phaser mocks but we need Line and additional methods
	(global as any).Phaser.Geom.Line = class {
		x1: number;
		y1: number;
		x2: number;
		y2: number;
		constructor(x1: number, y1: number, x2: number, y2: number) {
			this.x1 = x1;
			this.y1 = y1;
			this.x2 = x2;
			this.y2 = y2;
		}
		static Length = jest.fn().mockImplementation((line) => {
			const dx = line.x2 - line.x1;
			const dy = line.y2 - line.y1;
			return Math.sqrt(dx * dx + dy * dy);
		});
		static Angle = jest.fn().mockImplementation((line) => {
			return Math.atan2(line.y2 - line.y1, line.x2 - line.x1);
		});
	};

	// Create Circle class with static methods
	class MockCircle {
		x: number;
		y: number;
		radius: number;
		constructor(x: number, y: number, radius: number) {
			this.x = x;
			this.y = y;
			this.radius = radius;
		}
		contains = jest.fn().mockReturnValue(true);
		setPosition = jest.fn().mockImplementation((x, y) => {
			this.x = x;
			this.y = y;
		});
		setTo = jest.fn().mockImplementation((x, y, radius) => {
			this.x = x;
			this.y = y;
			this.radius = radius;
		});
		static CircumferencePoint = jest.fn().mockImplementation((circle, angle, point) => {
			point.x = circle.x + Math.cos(angle) * circle.radius;
			point.y = circle.y + Math.sin(angle) * circle.radius;
			return point;
		});
	}
	(global as any).Phaser.Geom.Circle = MockCircle;

	// Add RadToDeg if missing
	(global as any).Phaser.Math.RadToDeg = jest.fn().mockImplementation((rad) => rad * (180 / Math.PI));

	// Add TAU if missing
	(global as any).Phaser.Math.TAU = Math.PI / 2;

	// Add direction constants
	(global as any).Phaser.NONE = 0;
	(global as any).Phaser.LEFT = 1;
	(global as any).Phaser.RIGHT = 2;
	(global as any).Phaser.UP = 3;
	(global as any).Phaser.DOWN = 4;
});

describe('VirtualJoystick Stick', () => {
	let mockScene: any;
	let mockInput: any;
	let mockBaseSprite: any;
	let mockStickSprite: any;

	beforeEach(() => {
		mockBaseSprite = {
			x: 0,
			y: 0,
			width: 100,
			height: 100,
			displayWidth: 100,
			displayHeight: 100,
			setVisible: jest.fn(),
			setAlpha: jest.fn(),
			setScale: jest.fn(),
			setPosition: jest.fn(),
			setDepth: jest.fn(),
			destroy: jest.fn(),
		};

		mockStickSprite = {
			x: 0,
			y: 0,
			width: 50,
			height: 50,
			displayWidth: 50,
			displayHeight: 50,
			setVisible: jest.fn(),
			setAlpha: jest.fn(),
			setScale: jest.fn(),
			setPosition: jest.fn(),
			setDepth: jest.fn(),
			destroy: jest.fn(),
		};

		mockInput = {
			on: jest.fn(),
			off: jest.fn(),
		};

		mockScene = {
			sys: {
				input: mockInput,
			},
			scale: {
				width: 800,
				height: 600,
			},
			add: {
				sprite: jest.fn().mockImplementation((x, y, texture, frame) => {
					if (frame === 'base') {
						return mockBaseSprite;
					}
					return mockStickSprite;
				}),
			},
		};
	});

	describe('constructor', () => {
		it('should create a Stick with correct properties', () => {
			const stick = new Stick(mockScene, 100, 200, 50, 'joystick');

			expect(stick).toBeInstanceOf(Stick);
			expect(stick.distance).toBe(50);
			expect(stick.baseFrame).toBe('base');
			expect(stick.stickFrame).toBe('stick');
		});

		it('should create sprites with custom frames', () => {
			const stick = new Stick(mockScene, 100, 200, 50, 'joystick', 'custom-base', 'custom-stick');

			expect(stick.baseFrame).toBe('custom-base');
			expect(stick.stickFrame).toBe('custom-stick');
		});

		it('should create base and stick sprites', () => {
			new Stick(mockScene, 100, 200, 50, 'joystick');

			expect(mockScene.add.sprite).toHaveBeenCalledTimes(2);
			expect(mockScene.add.sprite).toHaveBeenCalledWith(100, 200, 'joystick', 'base');
			expect(mockScene.add.sprite).toHaveBeenCalledWith(100, 200, 'joystick', 'stick');
		});

		it('should register input listeners', () => {
			new Stick(mockScene, 100, 200, 50, 'joystick');

			expect(mockInput.on).toHaveBeenCalledWith('pointerdown', expect.any(Function), expect.anything());
			expect(mockInput.on).toHaveBeenCalledWith('pointerup', expect.any(Function), expect.anything());
			expect(mockInput.on).toHaveBeenCalledWith('pointermove', expect.any(Function), expect.anything());
		});
	});

	describe('inherited BaseStick functionality', () => {
		it('should have isDown property', () => {
			const stick = new Stick(mockScene, 100, 200, 50, 'joystick');

			expect(stick.isDown).toBeDefined();
			expect(stick.isDown).toBe(false);
		});

		it('should have force property', () => {
			const stick = new Stick(mockScene, 100, 200, 50, 'joystick');

			expect(stick.force).toBeDefined();
			expect(stick.force).toBe(0);
		});

		it('should have forceX and forceY properties', () => {
			const stick = new Stick(mockScene, 100, 200, 50, 'joystick');

			expect(stick.forceX).toBeDefined();
			expect(stick.forceY).toBeDefined();
		});

		it('should have enabled property', () => {
			const stick = new Stick(mockScene, 100, 200, 50, 'joystick');

			expect(stick.enabled).toBeDefined();
			expect(stick.enabled).toBe(true);
		});

		it('should be able to disable the stick', () => {
			const stick = new Stick(mockScene, 100, 200, 50, 'joystick');

			stick.enabled = false;

			expect(stick.enabled).toBe(false);
		});

		it('should have direction property', () => {
			const stick = new Stick(mockScene, 100, 200, 50, 'joystick');

			expect(stick.direction).toBeDefined();
		});

		it('should have angle properties', () => {
			const stick = new Stick(mockScene, 100, 200, 50, 'joystick');

			expect(stick.angle).toBeDefined();
			expect(stick.rotation).toBeDefined();
		});

		it('should have deadZone property', () => {
			const stick = new Stick(mockScene, 100, 200, 50, 'joystick');

			expect(stick.deadZone).toBeDefined();
		});

		it('should have motionLock property', () => {
			const stick = new Stick(mockScene, 100, 200, 50, 'joystick');

			expect(stick.motionLock).toBeDefined();
		});
	});

	describe('destroy', () => {
		it('should destroy sprites on destroy', () => {
			const stick = new Stick(mockScene, 100, 200, 50, 'joystick');

			stick.destroy();

			expect(mockBaseSprite.destroy).toHaveBeenCalled();
			expect(mockStickSprite.destroy).toHaveBeenCalled();
		});

		it('should remove input listeners on destroy', () => {
			const stick = new Stick(mockScene, 100, 200, 50, 'joystick');

			stick.destroy();

			expect(mockInput.off).toHaveBeenCalledWith('pointerdown', expect.any(Function), expect.anything());
			expect(mockInput.off).toHaveBeenCalledWith('pointerup', expect.any(Function), expect.anything());
			expect(mockInput.off).toHaveBeenCalledWith('pointermove', expect.any(Function), expect.anything());
		});

		it('should set sprites to null after destroy', () => {
			const stick = new Stick(mockScene, 100, 200, 50, 'joystick');

			stick.destroy();

			expect(stick.baseSprite).toBeNull();
			expect(stick.stickSprite).toBeNull();
		});
	});
});
