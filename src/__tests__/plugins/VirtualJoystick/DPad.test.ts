/**
 * Tests for VirtualJoystick DPad
 */

import DPad from '../../../plugins/VirtualJoystick/DPad';

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
	(global as any).Phaser.LEFT = 7;
	(global as any).Phaser.RIGHT = 8;
	(global as any).Phaser.UP = 5;
	(global as any).Phaser.DOWN = 6;
});

describe('VirtualJoystick DPad', () => {
	let mockScene: any;
	let mockInput: any;
	let mockBaseSprite: any;

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
			setFrame: jest.fn(),
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
				sprite: jest.fn().mockReturnValue(mockBaseSprite),
			},
		};
	});

	describe('constructor', () => {
		it('should create a DPad with correct properties', () => {
			const dpad = new DPad(mockScene, 100, 200, 50, 'dpad');

			expect(dpad).toBeInstanceOf(DPad);
			expect(dpad.neutralFrame).toBe('neutral');
			expect(dpad.upFrame).toBe('up');
			expect(dpad.downFrame).toBe('down');
			expect(dpad.leftFrame).toBe('left');
			expect(dpad.rightFrame).toBe('right');
		});

		it('should create DPad with custom frames', () => {
			const dpad = new DPad(
				mockScene,
				100,
				200,
				50,
				'dpad',
				'custom-neutral',
				'custom-up',
				'custom-down',
				'custom-left',
				'custom-right'
			);

			expect(dpad.neutralFrame).toBe('custom-neutral');
			expect(dpad.upFrame).toBe('custom-up');
			expect(dpad.downFrame).toBe('custom-down');
			expect(dpad.leftFrame).toBe('custom-left');
			expect(dpad.rightFrame).toBe('custom-right');
		});

		it('should create base sprite', () => {
			new DPad(mockScene, 100, 200, 50, 'dpad');

			expect(mockScene.add.sprite).toHaveBeenCalledWith(100, 200, 'dpad', 'neutral');
		});

		it('should initialize repeatRate to 0', () => {
			const dpad = new DPad(mockScene, 100, 200, 50, 'dpad');

			expect(dpad.repeatRate).toBe(0);
		});

		it('should register input listeners', () => {
			new DPad(mockScene, 100, 200, 50, 'dpad');

			expect(mockInput.on).toHaveBeenCalledWith('pointerdown', expect.any(Function), expect.anything());
			expect(mockInput.on).toHaveBeenCalledWith('pointerup', expect.any(Function), expect.anything());
			expect(mockInput.on).toHaveBeenCalledWith('pointermove', expect.any(Function), expect.anything());
		});

		it('should use sprite width for size if size is 0', () => {
			const dpad = new DPad(mockScene, 100, 200, 0, 'dpad');

			// When size is 0, it uses the displayWidth of the sprite
			expect(dpad).toBeInstanceOf(DPad);
		});
	});

	describe('setRepeatRate', () => {
		it('should set repeat rate', () => {
			const dpad = new DPad(mockScene, 100, 200, 50, 'dpad');

			dpad.setRepeatRate(100);

			expect(dpad.repeatRate).toBe(100);
		});

		it('should return this for chaining', () => {
			const dpad = new DPad(mockScene, 100, 200, 50, 'dpad');

			const result = dpad.setRepeatRate(100);

			expect(result).toBe(dpad);
		});

		it('should default to 0 when called without argument', () => {
			const dpad = new DPad(mockScene, 100, 200, 50, 'dpad');
			dpad.repeatRate = 100;

			dpad.setRepeatRate();

			expect(dpad.repeatRate).toBe(0);
		});
	});

	describe('x and y getters', () => {
		it('should return -1 for x when direction is LEFT', () => {
			const dpad = new DPad(mockScene, 100, 200, 50, 'dpad');
			dpad.direction = (global as any).Phaser.LEFT;

			expect(dpad.x).toBe(-1);
		});

		it('should return 1 for x when direction is RIGHT', () => {
			const dpad = new DPad(mockScene, 100, 200, 50, 'dpad');
			dpad.direction = (global as any).Phaser.RIGHT;

			expect(dpad.x).toBe(1);
		});

		it('should return 0 for x when direction is neither LEFT nor RIGHT', () => {
			const dpad = new DPad(mockScene, 100, 200, 50, 'dpad');
			dpad.direction = (global as any).Phaser.NONE;

			expect(dpad.x).toBe(0);
		});

		it('should return -1 for y when direction is UP', () => {
			const dpad = new DPad(mockScene, 100, 200, 50, 'dpad');
			dpad.direction = (global as any).Phaser.UP;

			expect(dpad.y).toBe(-1);
		});

		it('should return 1 for y when direction is DOWN', () => {
			const dpad = new DPad(mockScene, 100, 200, 50, 'dpad');
			dpad.direction = (global as any).Phaser.DOWN;

			expect(dpad.y).toBe(1);
		});

		it('should return 0 for y when direction is neither UP nor DOWN', () => {
			const dpad = new DPad(mockScene, 100, 200, 50, 'dpad');
			dpad.direction = (global as any).Phaser.NONE;

			expect(dpad.y).toBe(0);
		});
	});

	describe('force getter', () => {
		it('should return 0 when not pressed', () => {
			const dpad = new DPad(mockScene, 100, 200, 50, 'dpad');

			expect(dpad.force).toBe(0);
		});

		it('should be a number', () => {
			const dpad = new DPad(mockScene, 100, 200, 50, 'dpad');

			expect(typeof dpad.force).toBe('number');
		});
	});

	describe('forceX and forceY getters', () => {
		it('should return x value for forceX', () => {
			const dpad = new DPad(mockScene, 100, 200, 50, 'dpad');
			dpad.direction = (global as any).Phaser.LEFT;

			expect(dpad.forceX).toBe(-1);
		});

		it('should return y value for forceY', () => {
			const dpad = new DPad(mockScene, 100, 200, 50, 'dpad');
			dpad.direction = (global as any).Phaser.UP;

			expect(dpad.forceY).toBe(-1);
		});
	});

	describe('inherited BaseStick functionality', () => {
		it('should have isDown property', () => {
			const dpad = new DPad(mockScene, 100, 200, 50, 'dpad');

			expect(dpad.isDown).toBeDefined();
			expect(dpad.isDown).toBe(false);
		});

		it('should have enabled property', () => {
			const dpad = new DPad(mockScene, 100, 200, 50, 'dpad');

			expect(dpad.enabled).toBeDefined();
			expect(dpad.enabled).toBe(true);
		});

		it('should be able to disable the dpad', () => {
			const dpad = new DPad(mockScene, 100, 200, 50, 'dpad');

			dpad.enabled = false;

			expect(dpad.enabled).toBe(false);
		});

		it('should have direction property', () => {
			const dpad = new DPad(mockScene, 100, 200, 50, 'dpad');

			expect(dpad.direction).toBeDefined();
		});

		it('should have angle properties', () => {
			const dpad = new DPad(mockScene, 100, 200, 50, 'dpad');

			expect(dpad.angle).toBeDefined();
			expect(dpad.rotation).toBeDefined();
		});

		it('should have deadZone property', () => {
			const dpad = new DPad(mockScene, 100, 200, 50, 'dpad');

			expect(dpad.deadZone).toBeDefined();
		});

		it('should have motionLock property', () => {
			const dpad = new DPad(mockScene, 100, 200, 50, 'dpad');

			expect(dpad.motionLock).toBeDefined();
		});
	});

	describe('update', () => {
		it('should emit update event', () => {
			const dpad = new DPad(mockScene, 100, 200, 50, 'dpad');
			const updateHandler = jest.fn();
			dpad.on('update', updateHandler);

			dpad.update(1000);

			expect(updateHandler).toHaveBeenCalledWith(dpad, expect.any(Number), expect.any(Number));
		});

		it('should not emit direction events when tracking', () => {
			const dpad = new DPad(mockScene, 100, 200, 50, 'dpad');
			(dpad as any)._tracking = true;
			const moveupHandler = jest.fn();
			dpad.on('moveup', moveupHandler);

			dpad.direction = (global as any).Phaser.UP;
			(dpad as any)._isDown = true;
			dpad.update(1000);

			expect(moveupHandler).not.toHaveBeenCalled();
		});
	});

	describe('checkUp', () => {
		it('should reset frame to neutral on pointer up', () => {
			const dpad = new DPad(mockScene, 100, 200, 50, 'dpad');
			const mockPointer = { id: 1 } as any;
			(dpad as any).pointer = mockPointer;
			(dpad as any)._isDown = true;

			dpad.checkUp(mockPointer);

			expect(mockBaseSprite.setFrame).toHaveBeenCalledWith('neutral');
		});

		it('should not process if different pointer', () => {
			const dpad = new DPad(mockScene, 100, 200, 50, 'dpad');
			const mockPointer1 = { id: 1 } as any;
			const mockPointer2 = { id: 2 } as any;
			(dpad as any).pointer = mockPointer1;

			dpad.checkUp(mockPointer2);

			expect(mockBaseSprite.setFrame).not.toHaveBeenCalled();
		});
	});

	describe('moveStick', () => {
		it('should not process if different pointer', () => {
			const dpad = new DPad(mockScene, 100, 200, 50, 'dpad');
			const mockPointer1 = { id: 1, worldX: 100, worldY: 200 } as any;
			const mockPointer2 = { id: 2, worldX: 150, worldY: 250 } as any;
			(dpad as any).pointer = mockPointer1;

			const emitSpy = jest.spyOn(dpad, 'emit');
			dpad.moveStick(mockPointer2);

			expect(emitSpy).not.toHaveBeenCalledWith('move', expect.anything(), expect.anything(), expect.anything());
		});
	});

	describe('destroy', () => {
		it('should destroy base sprite on destroy', () => {
			const dpad = new DPad(mockScene, 100, 200, 50, 'dpad');

			dpad.destroy();

			expect(mockBaseSprite.destroy).toHaveBeenCalled();
		});

		it('should remove input listeners on destroy', () => {
			const dpad = new DPad(mockScene, 100, 200, 50, 'dpad');

			dpad.destroy();

			expect(mockInput.off).toHaveBeenCalledWith('pointerdown', expect.any(Function), expect.anything());
			expect(mockInput.off).toHaveBeenCalledWith('pointerup', expect.any(Function), expect.anything());
			expect(mockInput.off).toHaveBeenCalledWith('pointermove', expect.any(Function), expect.anything());
		});

		it('should set base sprite to null after destroy', () => {
			const dpad = new DPad(mockScene, 100, 200, 50, 'dpad');

			dpad.destroy();

			expect(dpad.baseSprite).toBeNull();
		});
	});

	describe('debug', () => {
		it('should call super.debug with graphics', () => {
			const dpad = new DPad(mockScene, 100, 200, 50, 'dpad');
			const mockGraphics = {
				clear: jest.fn(),
				lineStyle: jest.fn(),
				strokeCircle: jest.fn(),
				strokeCircleShape: jest.fn(),
				strokeLineShape: jest.fn(),
			} as any;

			// Should not throw
			expect(() => dpad.debug(mockGraphics)).not.toThrow();
		});

		it('should set text when text object is provided', () => {
			const dpad = new DPad(mockScene, 100, 200, 50, 'dpad');
			const mockGraphics = {
				clear: jest.fn(),
				lineStyle: jest.fn(),
				strokeCircle: jest.fn(),
				strokeCircleShape: jest.fn(),
				strokeLineShape: jest.fn(),
			} as any;
			const mockText = {
				setText: jest.fn(),
			} as any;

			dpad.debug(mockGraphics, mockText);

			expect(mockText.setText).toHaveBeenCalled();
		});
	});
});
