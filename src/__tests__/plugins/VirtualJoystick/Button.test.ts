/**
 * Tests for VirtualJoystick Button
 */

import Button from '../../../plugins/VirtualJoystick/Button';
import CONST from '../../../plugins/VirtualJoystick/const';

// Mock Phaser geometry classes
const mockCircle = {
	contains: jest.fn().mockReturnValue(true),
	x: 100,
	y: 100,
	setTo: jest.fn(),
};

const mockRectangle = {
	contains: jest.fn().mockReturnValue(true),
	x: 100,
	y: 100,
	setTo: jest.fn(),
};

// Ensure Phaser.Geom classes are available
(global as any).Phaser = (global as any).Phaser || {};
(global as any).Phaser.Geom = {
	Circle: jest.fn().mockImplementation(() => mockCircle),
	Rectangle: jest.fn().mockImplementation(() => mockRectangle),
};

describe('VirtualJoystick Button', () => {
	let mockScene: any;
	let mockSprite: any;
	let mockInput: any;

	beforeEach(() => {
		mockSprite = {
			x: 100,
			y: 100,
			width: 50,
			height: 50,
			alpha: 1,
			visible: true,
			setFrame: jest.fn(),
			setScale: jest.fn(),
			destroy: jest.fn(),
		};

		mockInput = {
			on: jest.fn(),
			off: jest.fn(),
			keyboard: {
				addKey: jest.fn().mockReturnValue({
					on: jest.fn(),
					off: jest.fn(),
					destroy: jest.fn(),
					timeDown: 1000,
					timeUp: 2000,
				}),
				removeKey: jest.fn(),
			},
		};

		mockScene = {
			add: {
				sprite: jest.fn().mockReturnValue(mockSprite),
			},
			sys: {
				input: mockInput,
				scale: {
					width: 800,
					height: 600,
				},
			},
		};
	});

	describe('constructor', () => {
		it('should create a button with circular hit area', () => {
			const button = new Button(mockScene, CONST.CIRC_BUTTON, 100, 100, 'texture', 'up', 'down');

			expect(button.scene).toBe(mockScene);
			expect(button.upFrame).toBe('up');
			expect(button.downFrame).toBe('down');
			expect(button.sprite).toBe(mockSprite);
			expect(button.hitArea).toBeDefined();
			expect(button._shape).toBe(CONST.CIRC_BUTTON);
		});

		it('should create a button with rectangular hit area', () => {
			const button = new Button(mockScene, CONST.RECT_BUTTON, 100, 100, 'texture', 'up', 'down');

			expect(button._shape).toBe(CONST.RECT_BUTTON);
		});

		it('should default to circular hit area for unknown shape', () => {
			const button = new Button(mockScene, 999, 100, 100, 'texture', 'up', 'down');

			// Unknown shape defaults to circle
			expect(button.hitArea).toBeDefined();
		});

		it('should initialize with default state', () => {
			const button = new Button(mockScene, CONST.CIRC_BUTTON, 100, 100, 'texture', 'up', 'down');

			expect(button.pointer).toBeNull();
			expect(button.enabled).toBe(true);
			expect(button.isDown).toBe(false);
			expect(button.isUp).toBe(true);
			expect(button.timeDown).toBe(0);
			expect(button.timeUp).toBe(0);
			expect(button.name).toBe('');
			expect(button.repeatRate).toBe(0);
			expect(button.key).toBeNull();
		});

		it('should register input event listeners', () => {
			new Button(mockScene, CONST.CIRC_BUTTON, 100, 100, 'texture', 'up', 'down');

			expect(mockInput.on).toHaveBeenCalledWith('pointerdown', expect.any(Function), expect.anything());
			expect(mockInput.on).toHaveBeenCalledWith('pointerup', expect.any(Function), expect.anything());
		});
	});

	describe('addKey', () => {
		it('should add a keyboard key binding', () => {
			const button = new Button(mockScene, CONST.CIRC_BUTTON, 100, 100, 'texture', 'up', 'down');
			const mockKey = {
				on: jest.fn(),
				off: jest.fn(),
				destroy: jest.fn(),
			};
			mockInput.keyboard.addKey.mockReturnValue(mockKey);

			const result = button.addKey('SPACE');

			expect(mockInput.keyboard.addKey).toHaveBeenCalledWith('SPACE');
			expect(button.key).toBe(mockKey);
			expect(result).toBe(mockKey);
		});

		it('should remove previous key binding when adding new one', () => {
			const button = new Button(mockScene, CONST.CIRC_BUTTON, 100, 100, 'texture', 'up', 'down');
			const mockKey1 = {
				on: jest.fn(),
				off: jest.fn(),
				destroy: jest.fn(),
			};
			const mockKey2 = {
				on: jest.fn(),
				off: jest.fn(),
				destroy: jest.fn(),
			};

			mockInput.keyboard.addKey.mockReturnValueOnce(mockKey1).mockReturnValueOnce(mockKey2);

			button.addKey('SPACE');
			button.addKey('ENTER');

			expect(mockKey1.off).toHaveBeenCalled();
			expect(mockInput.keyboard.removeKey).toHaveBeenCalledWith(mockKey1);
			expect(button.key).toBe(mockKey2);
		});

		it('should return null if keyboard is not available', () => {
			mockScene.sys.input.keyboard = null;
			const button = new Button(mockScene, CONST.CIRC_BUTTON, 100, 100, 'texture', 'up', 'down');

			const result = button.addKey('SPACE');

			expect(result).toBeNull();
		});
	});

	describe('keyDown', () => {
		it('should change button state on key down', () => {
			const button = new Button(mockScene, CONST.CIRC_BUTTON, 100, 100, 'texture', 'up', 'down');
			const mockKey = {
				on: jest.fn(),
				off: jest.fn(),
				destroy: jest.fn(),
				timeDown: 1000,
				timeUp: 0,
			};
			mockInput.keyboard.addKey.mockReturnValue(mockKey);

			button.addKey('SPACE');
			button.key = mockKey as any;

			const emitSpy = jest.spyOn(button, 'emit');

			button.keyDown();

			expect(button.isDown).toBe(true);
			expect(button.isUp).toBe(false);
			expect(button.timeDown).toBe(1000);
			expect(mockSprite.setFrame).toHaveBeenCalledWith('down');
			expect(emitSpy).toHaveBeenCalledWith('down', button, mockKey);
		});

		it('should not trigger if already down', () => {
			const button = new Button(mockScene, CONST.CIRC_BUTTON, 100, 100, 'texture', 'up', 'down');
			const mockKey = {
				on: jest.fn(),
				off: jest.fn(),
				destroy: jest.fn(),
				timeDown: 1000,
			};
			button.key = mockKey as any;
			button.isDown = true;

			const emitSpy = jest.spyOn(button, 'emit');

			button.keyDown();

			expect(emitSpy).not.toHaveBeenCalled();
		});
	});

	describe('keyUp', () => {
		it('should change button state on key up', () => {
			const button = new Button(mockScene, CONST.CIRC_BUTTON, 100, 100, 'texture', 'up', 'down');
			const mockKey = {
				on: jest.fn(),
				off: jest.fn(),
				destroy: jest.fn(),
				timeUp: 2000,
			};
			button.key = mockKey as any;
			button.isDown = true;

			const emitSpy = jest.spyOn(button, 'emit');

			button.keyUp();

			expect(button.isDown).toBe(false);
			expect(button.isUp).toBe(true);
			expect(button.timeUp).toBe(2000);
			expect(mockSprite.setFrame).toHaveBeenCalledWith('up');
			expect(emitSpy).toHaveBeenCalledWith('up', button, mockKey, expect.any(Number));
		});

		it('should not trigger if already up', () => {
			const button = new Button(mockScene, CONST.CIRC_BUTTON, 100, 100, 'texture', 'up', 'down');
			button.isDown = false;

			const emitSpy = jest.spyOn(button, 'emit');

			button.keyUp();

			expect(emitSpy).not.toHaveBeenCalled();
		});
	});

	describe('checkDown', () => {
		it('should activate button when pointer is within hit area', () => {
			const button = new Button(mockScene, CONST.CIRC_BUTTON, 100, 100, 'texture', 'up', 'down');
			const mockPointer = {
				worldX: 100,
				worldY: 100,
				time: 1000,
			};

			const emitSpy = jest.spyOn(button, 'emit');

			button.checkDown(mockPointer as any);

			expect(button.isDown).toBe(true);
			expect(button.pointer).toBe(mockPointer);
			expect(mockSprite.setFrame).toHaveBeenCalledWith('down');
			expect(emitSpy).toHaveBeenCalledWith('down', button, mockPointer);
		});

		it('should not activate when disabled', () => {
			const button = new Button(mockScene, CONST.CIRC_BUTTON, 100, 100, 'texture', 'up', 'down');
			button.enabled = false;
			const mockPointer = {
				worldX: 100,
				worldY: 100,
				time: 1000,
			};

			button.checkDown(mockPointer as any);

			expect(button.isDown).toBe(false);
		});

		it('should not activate when pointer is outside hit area', () => {
			// Reset the mock to return false for this test
			mockCircle.contains.mockReturnValueOnce(false);
			const button = new Button(mockScene, CONST.CIRC_BUTTON, 100, 100, 'texture', 'up', 'down');
			const mockPointer = {
				worldX: 500,
				worldY: 500,
				time: 1000,
			};

			button.checkDown(mockPointer as any);

			expect(button.isDown).toBe(false);
		});

		it('should not activate when already down', () => {
			const button = new Button(mockScene, CONST.CIRC_BUTTON, 100, 100, 'texture', 'up', 'down');
			button.isDown = true;
			button.isUp = false;
			const mockPointer = {
				worldX: 100,
				worldY: 100,
				time: 1000,
			};

			button.checkDown(mockPointer as any);

			expect(button.pointer).toBeNull();
		});
	});

	describe('checkUp', () => {
		it('should deactivate button when pointer releases', () => {
			const button = new Button(mockScene, CONST.CIRC_BUTTON, 100, 100, 'texture', 'up', 'down');
			const mockPointer = {
				worldX: 100,
				worldY: 100,
				time: 2000,
			};

			// First press down
			button.pointer = mockPointer as any;
			button.isDown = true;
			button.isUp = false;
			button.timeDown = 1000;

			const emitSpy = jest.spyOn(button, 'emit');

			button.checkUp(mockPointer as any);

			expect(button.isDown).toBe(false);
			expect(button.isUp).toBe(true);
			expect(button.pointer).toBeNull();
			expect(mockSprite.setFrame).toHaveBeenCalledWith('up');
			expect(emitSpy).toHaveBeenCalledWith('up', button, mockPointer, expect.any(Number));
		});

		it('should not deactivate for different pointer', () => {
			const button = new Button(mockScene, CONST.CIRC_BUTTON, 100, 100, 'texture', 'up', 'down');
			const mockPointer1 = { worldX: 100, worldY: 100, time: 1000 };
			const mockPointer2 = { worldX: 100, worldY: 100, time: 2000 };

			button.pointer = mockPointer1 as any;
			button.isDown = true;

			button.checkUp(mockPointer2 as any);

			expect(button.isDown).toBe(true);
			expect(button.pointer).toBe(mockPointer1);
		});
	});

	describe('update', () => {
		it('should emit repeat event when repeat rate is set and button is down', () => {
			const button = new Button(mockScene, CONST.CIRC_BUTTON, 100, 100, 'texture', 'up', 'down');
			button.repeatRate = 100;
			button.isDown = true;
			button._timeNext = 500;
			button.pointer = { worldX: 100, worldY: 100 } as any;

			const emitSpy = jest.spyOn(button, 'emit');

			button.update(600);

			expect(emitSpy).toHaveBeenCalledWith('down', button, button.pointer);
			expect(button._timeNext).toBe(700);
		});

		it('should not emit when time is before next repeat', () => {
			const button = new Button(mockScene, CONST.CIRC_BUTTON, 100, 100, 'texture', 'up', 'down');
			button.repeatRate = 100;
			button.isDown = true;
			button._timeNext = 500;

			const emitSpy = jest.spyOn(button, 'emit');

			button.update(400);

			expect(emitSpy).not.toHaveBeenCalled();
		});

		it('should not emit when repeat rate is 0', () => {
			const button = new Button(mockScene, CONST.CIRC_BUTTON, 100, 100, 'texture', 'up', 'down');
			button.repeatRate = 0;
			button.isDown = true;

			const emitSpy = jest.spyOn(button, 'emit');

			button.update(1000);

			expect(emitSpy).not.toHaveBeenCalled();
		});
	});

	describe('alignment methods', () => {
		it('should align to bottom left', () => {
			const button = new Button(mockScene, CONST.CIRC_BUTTON, 100, 100, 'texture', 'up', 'down');

			button.alignBottomLeft(10);

			expect(button.posX).toBe(35); // 50/2 + 10
			expect(button.posY).toBe(565); // 600 - 25 - 10
		});

		it('should align to bottom right', () => {
			const button = new Button(mockScene, CONST.CIRC_BUTTON, 100, 100, 'texture', 'up', 'down');

			button.alignBottomRight(10);

			expect(button.posX).toBe(765); // 800 - 25 - 10
			expect(button.posY).toBe(565); // 600 - 25 - 10
		});
	});

	describe('setters and getters', () => {
		it('should set and get repeat rate', () => {
			const button = new Button(mockScene, CONST.CIRC_BUTTON, 100, 100, 'texture', 'up', 'down');

			button.setRepeatRate(100);

			expect(button.repeatRate).toBe(100);
		});

		it('should set and get name', () => {
			const button = new Button(mockScene, CONST.CIRC_BUTTON, 100, 100, 'texture', 'up', 'down');

			button.setName('attack');

			expect(button.name).toBe('attack');
		});

		it('should set and get posX', () => {
			const button = new Button(mockScene, CONST.CIRC_BUTTON, 100, 100, 'texture', 'up', 'down');

			button.posX = 200;

			expect(button.posX).toBe(200);
			expect(mockSprite.x).toBe(200);
		});

		it('should set and get posY', () => {
			const button = new Button(mockScene, CONST.CIRC_BUTTON, 100, 100, 'texture', 'up', 'down');

			button.posY = 200;

			expect(button.posY).toBe(200);
			expect(mockSprite.y).toBe(200);
		});

		it('should set and get alpha', () => {
			const button = new Button(mockScene, CONST.CIRC_BUTTON, 100, 100, 'texture', 'up', 'down');

			button.alpha = 0.5;

			expect(button.alpha).toBe(0.5);
			expect(mockSprite.alpha).toBe(0.5);
		});

		it('should set and get visible', () => {
			const button = new Button(mockScene, CONST.CIRC_BUTTON, 100, 100, 'texture', 'up', 'down');

			button.visible = false;

			expect(button.visible).toBe(false);
			expect(mockSprite.visible).toBe(false);
		});

		it('should set and get scale', () => {
			const button = new Button(mockScene, CONST.CIRC_BUTTON, 100, 100, 'texture', 'up', 'down');

			button.scale = 2;

			expect(button.scale).toBe(2);
			expect(mockSprite.setScale).toHaveBeenCalledWith(2);
		});
	});

	describe('duration', () => {
		it('should return duration when button is up', () => {
			const button = new Button(mockScene, CONST.CIRC_BUTTON, 100, 100, 'texture', 'up', 'down');
			button.isUp = true;
			button.timeDown = 1000;
			button.timeUp = 1500;

			expect(button.duration).toBe(500);
		});

		it('should return current duration when button is down', () => {
			const button = new Button(mockScene, CONST.CIRC_BUTTON, 100, 100, 'texture', 'up', 'down');
			button.isUp = false;
			button.isDown = true;
			button.timeDown = 1000;
			button.currentTime = 1200;

			expect(button.duration).toBe(200);
		});
	});

	describe('destroy', () => {
		it('should clean up all resources', () => {
			const button = new Button(mockScene, CONST.CIRC_BUTTON, 100, 100, 'texture', 'up', 'down');

			button.destroy();

			expect(mockInput.off).toHaveBeenCalledWith('pointerdown', expect.any(Function), button);
			expect(mockInput.off).toHaveBeenCalledWith('pointerup', expect.any(Function), button);
			expect(mockSprite.destroy).toHaveBeenCalled();
		});

		it('should clean up keyboard key if set', () => {
			const button = new Button(mockScene, CONST.CIRC_BUTTON, 100, 100, 'texture', 'up', 'down');
			const mockKey = {
				on: jest.fn(),
				off: jest.fn(),
				destroy: jest.fn(),
			};
			mockInput.keyboard.addKey.mockReturnValue(mockKey);

			button.addKey('SPACE');
			button.destroy();

			expect(mockKey.off).toHaveBeenCalled();
			expect(mockKey.destroy).toHaveBeenCalled();
			expect(mockInput.keyboard.removeKey).toHaveBeenCalledWith(mockKey);
		});
	});
});
