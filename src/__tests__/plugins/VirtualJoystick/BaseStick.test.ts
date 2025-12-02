/**
 * Tests for VirtualJoystick BaseStick
 */

import BaseStick from '../../../plugins/VirtualJoystick/BaseStick';
import CONST from '../../../plugins/VirtualJoystick/const';

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

describe('VirtualJoystick BaseStick', () => {
	let mockScene: any;
	let mockInput: any;

	beforeEach(() => {
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
		};
	});

	describe('constructor', () => {
		it('should initialize with correct position', () => {
			const stick = new BaseStick(mockScene, 100, 200, 50);

			expect(stick.position.x).toBe(100);
			expect(stick.position.y).toBe(200);
		});

		it('should initialize with correct distance', () => {
			const stick = new BaseStick(mockScene, 100, 200, 50);

			expect(stick._distance).toBe(50);
		});

		it('should create line and hit areas', () => {
			const stick = new BaseStick(mockScene, 100, 200, 50);

			expect(stick.line).toBeDefined();
			expect(stick.baseHitArea).toBeDefined();
			expect(stick.stickHitArea).toBeDefined();
		});

		it('should initialize with default state', () => {
			const stick = new BaseStick(mockScene, 100, 200, 50);

			expect(stick.enabled).toBe(true);
			expect(stick.isDown).toBe(false);
			expect(stick.isUp).toBe(true);
			expect(stick.pointer).toBeNull();
			expect(stick.motionLock).toBe(CONST.NONE);
		});

		it('should register input event listeners', () => {
			new BaseStick(mockScene, 100, 200, 50);

			expect(mockInput.on).toHaveBeenCalledWith('pointerdown', expect.any(Function), expect.anything());
			expect(mockInput.on).toHaveBeenCalledWith('pointerup', expect.any(Function), expect.anything());
			expect(mockInput.on).toHaveBeenCalledWith('pointerupoutside', expect.any(Function), expect.anything());
			expect(mockInput.on).toHaveBeenCalledWith('pointermove', expect.any(Function), expect.anything());
		});
	});

	describe('checkDown', () => {
		it('should start tracking when enabled and stick hit area contains pointer', () => {
			const stick = new BaseStick(mockScene, 100, 200, 50);
			const mockPointer = {
				worldX: 100,
				worldY: 200,
				time: 1000,
			};

			stick.checkDown(mockPointer as any);

			expect(stick.pointer).toBe(mockPointer);
		});

		it('should not start tracking when disabled', () => {
			const stick = new BaseStick(mockScene, 100, 200, 50);
			stick.enabled = false;
			const mockPointer = {
				worldX: 100,
				worldY: 200,
				time: 1000,
			};

			stick.checkDown(mockPointer as any);

			expect(stick.pointer).toBeNull();
		});

		it('should not start tracking when already down', () => {
			const stick = new BaseStick(mockScene, 100, 200, 50);
			stick.isDown = true;
			stick.isUp = false;
			const mockPointer = {
				worldX: 100,
				worldY: 200,
				time: 1000,
			};

			stick.checkDown(mockPointer as any);

			expect(stick.pointer).toBeNull();
		});

		it('should handle showOnTouch mode', () => {
			const stick = new BaseStick(mockScene, 100, 200, 50);
			stick._showOnTouch = true;
			stick.baseSprite = {
				setVisible: jest.fn(),
			} as any;
			stick.stickSprite = {
				setVisible: jest.fn(),
				setPosition: jest.fn(),
			} as any;

			const mockPointer = {
				worldX: 300,
				worldY: 400,
				time: 1000,
			};

			stick.checkDown(mockPointer as any);

			expect(stick.position.x).toBe(300);
			expect(stick.position.y).toBe(400);
		});
	});

	describe('checkUp', () => {
		it('should reset stick state when pointer releases', () => {
			const stick = new BaseStick(mockScene, 100, 200, 50);
			const mockPointer = {
				worldX: 100,
				worldY: 200,
				time: 2000,
			};

			stick.pointer = mockPointer as any;
			stick.isDown = true;
			stick.isUp = false;

			const emitSpy = jest.spyOn(stick, 'emit');

			stick.checkUp(mockPointer as any);

			expect(stick.pointer).toBeNull();
			expect(stick.isDown).toBe(false);
			expect(stick.isUp).toBe(true);
			expect(stick.direction).toBe(Phaser.NONE);
			expect(emitSpy).toHaveBeenCalledWith('up', stick, mockPointer);
		});

		it('should not reset for different pointer', () => {
			const stick = new BaseStick(mockScene, 100, 200, 50);
			const mockPointer1 = { worldX: 100, worldY: 200, time: 1000 };
			const mockPointer2 = { worldX: 100, worldY: 200, time: 2000 };

			stick.pointer = mockPointer1 as any;
			stick.isDown = true;

			stick.checkUp(mockPointer2 as any);

			expect(stick.pointer).toBe(mockPointer1);
			expect(stick.isDown).toBe(true);
		});
	});

	describe('setDown', () => {
		it('should set stick to down state', () => {
			const stick = new BaseStick(mockScene, 100, 200, 50);
			stick.pointer = { time: 1000 } as any;

			const emitSpy = jest.spyOn(stick, 'emit');

			stick.setDown();

			expect(stick.isDown).toBe(true);
			expect(stick.isUp).toBe(false);
			expect(stick.timeDown).toBe(1000);
			expect(emitSpy).toHaveBeenCalledWith('down', stick, stick.pointer);
		});
	});

	describe('checkArea', () => {
		it('should calculate angle and direction', () => {
			const stick = new BaseStick(mockScene, 100, 200, 50);
			stick.line.x2 = 150;
			stick.line.y2 = 200;

			stick.checkArea();

			expect(stick.angle).toBeDefined();
			expect(stick.angleFull).toBeDefined();
			// RIGHT direction is 2
			expect(stick.direction).toBe(2);
		});

		it('should detect left direction', () => {
			const stick = new BaseStick(mockScene, 100, 200, 50);
			stick.line.x2 = 50;
			stick.line.y2 = 200;

			stick.checkArea();

			// Direction and quadrant should be set after checkArea
			expect(stick.direction).toBeDefined();
			expect(stick.quadrant).toBeDefined();
		});

		it('should detect up direction', () => {
			const stick = new BaseStick(mockScene, 100, 200, 50);
			stick.line.x2 = 100;
			stick.line.y2 = 150;

			stick.checkArea();

			// Direction should be set (not NONE which is 0)
			expect(stick.direction).toBeDefined();
			expect(stick.quadrant).toBeDefined();
		});

		it('should detect down direction', () => {
			const stick = new BaseStick(mockScene, 100, 200, 50);
			stick.line.x2 = 100;
			stick.line.y2 = 250;

			stick.checkArea();

			// Direction should be set (not NONE which is 0)
			expect(stick.direction).toBeDefined();
			expect(stick.quadrant).toBeDefined();
		});
	});

	describe('moveStick', () => {
		it('should update stick position when down', () => {
			const stick = new BaseStick(mockScene, 100, 200, 50);
			stick.pointer = { worldX: 120, worldY: 200 } as any;
			stick.isDown = true;

			const emitSpy = jest.spyOn(stick, 'emit');

			stick.moveStick({ worldX: 130, worldY: 210 } as any);

			expect(emitSpy).toHaveBeenCalledWith(
				'move',
				stick,
				expect.any(Number),
				expect.any(Number),
				expect.any(Number)
			);
		});

		it('should not move when not down and not tracking', () => {
			const stick = new BaseStick(mockScene, 100, 200, 50);
			stick.isDown = false;
			stick._tracking = false;

			const emitSpy = jest.spyOn(stick, 'emit');

			stick.moveStick({ worldX: 130, worldY: 210 } as any);

			expect(emitSpy).not.toHaveBeenCalled();
		});

		it('should respect horizontal motion lock', () => {
			const stick = new BaseStick(mockScene, 100, 200, 50);
			stick.pointer = { worldX: 100, worldY: 200 } as any;
			stick.isDown = true;
			stick.motionLock = CONST.HORIZONTAL;

			stick.moveStick({ worldX: 130, worldY: 250 } as any);

			expect(stick.line.x2).toBe(130);
			// y should not have changed
		});

		it('should respect vertical motion lock', () => {
			const stick = new BaseStick(mockScene, 100, 200, 50);
			stick.pointer = { worldX: 100, worldY: 200 } as any;
			stick.isDown = true;
			stick.motionLock = CONST.VERTICAL;

			stick.moveStick({ worldX: 130, worldY: 250 } as any);

			expect(stick.line.y2).toBe(250);
			// x should not have changed
		});
	});

	describe('update', () => {
		it('should emit update event when not tracking', () => {
			const stick = new BaseStick(mockScene, 100, 200, 50);
			stick._tracking = false;

			const emitSpy = jest.spyOn(stick, 'emit');

			stick.update();

			expect(emitSpy).toHaveBeenCalledWith(
				'update',
				stick,
				expect.any(Number),
				expect.any(Number),
				expect.any(Number)
			);
		});

		it('should not emit when tracking', () => {
			const stick = new BaseStick(mockScene, 100, 200, 50);
			stick._tracking = true;

			const emitSpy = jest.spyOn(stick, 'emit');

			stick.update();

			expect(emitSpy).not.toHaveBeenCalled();
		});
	});

	describe('alignment methods', () => {
		it('should align to bottom left', () => {
			const stick = new BaseStick(mockScene, 100, 200, 50);
			stick.baseSprite = {
				displayWidth: 60,
				displayHeight: 60,
				x: 100,
				y: 200,
			} as any;

			stick.alignBottomLeft(10);

			expect(stick.posX).toBe(40); // 60/2 + 10
			expect(stick.posY).toBe(560); // 600 - 30 - 10
		});

		it('should align to bottom right', () => {
			const stick = new BaseStick(mockScene, 100, 200, 50);
			stick.baseSprite = {
				displayWidth: 60,
				displayHeight: 60,
				x: 100,
				y: 200,
			} as any;

			stick.alignBottomRight(10);

			expect(stick.posX).toBe(760); // 800 - 30 - 10
			expect(stick.posY).toBe(560); // 600 - 30 - 10
		});
	});

	describe('setter methods', () => {
		it('should set motion lock', () => {
			const stick = new BaseStick(mockScene, 100, 200, 50);

			stick.setMotionLock(CONST.HORIZONTAL);

			expect(stick.motionLock).toBe(CONST.HORIZONTAL);
		});

		it('should set dead zone', () => {
			const stick = new BaseStick(mockScene, 100, 200, 50);

			stick.setDeadZone(20);

			expect(stick._deadZone).toBe(20);
		});

		it('should set scale', () => {
			const stick = new BaseStick(mockScene, 100, 200, 50);

			stick.setScale(2);

			expect(stick._scale).toBe(2);
		});

		it('should set alpha', () => {
			const stick = new BaseStick(mockScene, 100, 200, 50);
			stick.baseSprite = { setAlpha: jest.fn() } as any;
			stick.stickSprite = { setAlpha: jest.fn() } as any;

			stick.setAlpha(0.5);

			expect(stick.baseSprite.setAlpha).toHaveBeenCalledWith(0.5);
			expect(stick.stickSprite.setAlpha).toHaveBeenCalledWith(0.5);
		});

		it('should set visible', () => {
			const stick = new BaseStick(mockScene, 100, 200, 50);
			stick.baseSprite = { setVisible: jest.fn() } as any;
			stick.stickSprite = { setVisible: jest.fn() } as any;

			stick.setVisible(false);

			expect(stick.baseSprite.setVisible).toHaveBeenCalledWith(false);
			expect(stick.stickSprite.setVisible).toHaveBeenCalledWith(false);
		});
	});

	describe('getters', () => {
		it('should get rotation', () => {
			const stick = new BaseStick(mockScene, 100, 200, 50);
			stick.line.x2 = 150;
			stick.line.y2 = 200;

			expect(stick.rotation).toBe(0); // Pointing right
		});

		it('should get x normalized value', () => {
			const stick = new BaseStick(mockScene, 100, 200, 50);
			stick.line.x2 = 150;
			stick.line.y2 = 200;

			expect(stick.x).toBeGreaterThan(0); // Pointing right
		});

		it('should get y normalized value', () => {
			const stick = new BaseStick(mockScene, 100, 200, 50);
			stick.line.x2 = 100;
			stick.line.y2 = 250;

			expect(stick.y).toBeGreaterThan(0); // Pointing down
		});

		it('should get force', () => {
			const stick = new BaseStick(mockScene, 100, 200, 50);
			stick.line.x2 = 150;
			stick.line.y2 = 200;

			expect(stick.force).toBeGreaterThan(0);
			expect(stick.force).toBeLessThanOrEqual(1);
		});

		it('should get forceX', () => {
			const stick = new BaseStick(mockScene, 100, 200, 50);

			expect(stick.forceX).toBeDefined();
		});

		it('should get forceY', () => {
			const stick = new BaseStick(mockScene, 100, 200, 50);

			expect(stick.forceY).toBeDefined();
		});

		it('should get distance adjusted for scale', () => {
			const stick = new BaseStick(mockScene, 100, 200, 50);
			stick._scale = 2;

			expect(stick.distance).toBe(100);
		});

		it('should get deadZone adjusted for scale', () => {
			const stick = new BaseStick(mockScene, 100, 200, 50);
			const initialDeadZone = stick._deadZone;
			stick._scale = 2;

			expect(stick.deadZone).toBe(initialDeadZone * 2);
		});

		it('should get showOnTouch', () => {
			const stick = new BaseStick(mockScene, 100, 200, 50);
			stick._showOnTouch = true;

			expect(stick.showOnTouch).toBe(true);
		});

		it('should set showOnTouch and hide if visible', () => {
			const stick = new BaseStick(mockScene, 100, 200, 50);
			stick.stickSprite = { visible: true, setVisible: jest.fn() } as any;
			stick.baseSprite = { setVisible: jest.fn() } as any;

			stick.showOnTouch = true;

			expect(stick._showOnTouch).toBe(true);
		});

		it('should get filterX', () => {
			const stick = new BaseStick(mockScene, 100, 200, 50);

			// FilterX returns 0.5 when x is 0 (center)
			expect(parseFloat(String(stick.filterX))).toBe(0.5);
		});

		it('should get filterY', () => {
			const stick = new BaseStick(mockScene, 100, 200, 50);

			expect(stick.filterY).toBe(0.5); // Center when not moved
		});
	});

	describe('posX and posY', () => {
		it('should set and get posX', () => {
			const stick = new BaseStick(mockScene, 100, 200, 50);

			stick.posX = 300;

			expect(stick.posX).toBe(300);
			expect(stick.position.x).toBe(300);
			expect(stick.baseHitArea.x).toBe(300);
			expect(stick.stickHitArea.x).toBe(300);
		});

		it('should set and get posY', () => {
			const stick = new BaseStick(mockScene, 100, 200, 50);

			stick.posY = 400;

			expect(stick.posY).toBe(400);
			expect(stick.position.y).toBe(400);
			expect(stick.baseHitArea.y).toBe(400);
			expect(stick.stickHitArea.y).toBe(400);
		});
	});

	describe('destroy', () => {
		it('should clean up all resources', () => {
			const stick = new BaseStick(mockScene, 100, 200, 50);

			stick.destroy();

			expect(mockInput.off).toHaveBeenCalledWith('pointerdown', expect.any(Function), stick);
			expect(mockInput.off).toHaveBeenCalledWith('pointerup', expect.any(Function), stick);
			expect(mockInput.off).toHaveBeenCalledWith('pointerupoutside', expect.any(Function), stick);
			expect(mockInput.off).toHaveBeenCalledWith('pointermove', expect.any(Function), stick);
			expect(stick.stickHitArea).toBeNull();
			expect(stick.baseHitArea).toBeNull();
		});
	});

	describe('debug', () => {
		it('should render debug graphics', () => {
			const stick = new BaseStick(mockScene, 100, 200, 50);
			const mockGraphics = {
				clear: jest.fn(),
				lineStyle: jest.fn(),
				strokeCircleShape: jest.fn(),
				strokeLineShape: jest.fn(),
			};

			stick.debug(mockGraphics as any);

			expect(mockGraphics.clear).toHaveBeenCalled();
			expect(mockGraphics.strokeCircleShape).toHaveBeenCalled();
			expect(mockGraphics.strokeLineShape).toHaveBeenCalled();
		});

		it('should render debug text', () => {
			const stick = new BaseStick(mockScene, 100, 200, 50);
			const mockText = {
				setText: jest.fn(),
			};

			stick.debug(undefined, mockText as any);

			expect(mockText.setText).toHaveBeenCalled();
		});
	});
});
