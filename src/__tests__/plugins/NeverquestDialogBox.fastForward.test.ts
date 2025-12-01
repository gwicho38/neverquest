/**
 * Tests for dialog box fast-forward functionality
 * Ensures that holding space during text animation shows full text instantly,
 * and continuing to hold space after fast-forward closes the dialog
 */

import { NeverquestDialogBox } from '../../plugins/NeverquestDialogBox';
import Phaser from 'phaser';

// NOTE: Don't use jest.mock('phaser') - the mock is already set up via moduleNameMapper in jest.config.js!
// JustDown is available at Phaser.Input.Keyboard.JustDown

// Mock Phaser objects
const mockTimerEvent = {
	destroy: jest.fn(),
	remove: jest.fn(),
};

const mockScene: any = {
	add: {
		nineslice: jest.fn(() => {
			const mock = {
				setScrollFactor: jest.fn().mockReturnThis(),
				setOrigin: jest.fn().mockReturnThis(),
				setDepth: jest.fn().mockReturnThis(),
				scaleX: 1,
				scaleY: 1,
				width: 800,
				height: 150,
				x: 10,
				y: 600,
				visible: false,
				textMessage: null as any,
			};
			mock.setScrollFactor.mockReturnValue(mock);
			mock.setOrigin.mockReturnValue(mock);
			mock.setDepth.mockReturnValue(mock);
			return mock;
		}),
		image: jest.fn(() => {
			const mock = {
				setScrollFactor: jest.fn().mockReturnThis(),
				setOrigin: jest.fn().mockReturnThis(),
				setDepth: jest.fn().mockReturnThis(),
				visible: false,
				x: 0,
				y: 0,
				height: 50,
			};
			mock.setScrollFactor.mockReturnValue(mock);
			mock.setOrigin.mockReturnValue(mock);
			mock.setDepth.mockReturnValue(mock);
			return mock;
		}),
		text: jest.fn(() => {
			const mock = {
				setScrollFactor: jest.fn().mockReturnThis(),
				setOrigin: jest.fn().mockReturnThis(),
				setDepth: jest.fn().mockReturnThis(),
				setPosition: jest.fn().mockReturnThis(),
				setStyle: jest.fn().mockReturnThis(),
				setText: jest.fn(),
				visible: false,
				alpha: 0.5,
				text: '',
			};
			mock.setScrollFactor.mockReturnValue(mock);
			mock.setOrigin.mockReturnValue(mock);
			mock.setDepth.mockReturnValue(mock);
			mock.setPosition.mockReturnValue(mock);
			mock.setStyle.mockReturnValue(mock);
			return mock;
		}),
		sprite: jest.fn(() => {
			const mock = {
				setScrollFactor: jest.fn().mockReturnThis(),
				setOrigin: jest.fn().mockReturnThis(),
				setDepth: jest.fn().mockReturnThis(),
				visible: false,
				anims: { play: jest.fn() },
			};
			mock.setScrollFactor.mockReturnValue(mock);
			mock.setOrigin.mockReturnValue(mock);
			mock.setDepth.mockReturnValue(mock);
			return mock;
		}),
	},
	cameras: {
		main: { width: 800, height: 600 },
	},
	input: {
		keyboard: {
			addKey: jest.fn(() => ({ isDown: false })),
		},
		gamepad: null,
	},
	scene: {
		get: jest.fn((): any => null),
	},
	events: {
		on: jest.fn(),
		emit: jest.fn(),
		once: jest.fn(),
	},
	scale: {
		on: jest.fn(),
	},
	time: {
		addEvent: jest.fn(() => mockTimerEvent),
	},
	sound: {
		add: jest.fn(() => ({
			volume: 0.5,
			play: jest.fn(),
		})),
	},
};

const mockPlayer: any = {
	container: {
		body: {
			maxSpeed: 200,
		},
	},
	speed: 200,
	canMove: true,
	canAtack: true,
	canBlock: true,
	active: true,
};

describe('NeverquestDialogBox Fast-Forward', () => {
	let dialogBox: any;

	beforeEach(() => {
		// Reset player state
		mockPlayer.canMove = true;
		mockPlayer.canAtack = true;
		mockPlayer.canBlock = true;
		mockPlayer.container.body.maxSpeed = 200;

		// Reset mock calls
		jest.clearAllMocks();
		mockTimerEvent.destroy.mockClear();

		// Reset JustDown mock
		(Phaser.Input.Keyboard.JustDown as jest.Mock).mockReturnValue(false);

		dialogBox = new NeverquestDialogBox(mockScene, mockPlayer);
		dialogBox.create();
	});

	describe('justFastForwarded flag', () => {
		test('should initialize justFastForwarded to false', () => {
			expect(dialogBox.justFastForwarded).toBe(false);
		});

		test('should set justFastForwarded to true when fast-forwarding', () => {
			// Setup: dialog is animating
			dialogBox.isAnimatingText = true;
			dialogBox.pagesMessage = ['Test message'];
			dialogBox.currentPage = 0;
			dialogBox.keyObj = { isDown: true };

			// Simulate fast-forward
			dialogBox.checkButtonDown();

			expect(dialogBox.justFastForwarded).toBe(true);
		});

		test('should clear justFastForwarded flag after advancing dialog', () => {
			// Setup: dialog is ready to advance
			dialogBox.chat = [{ message: 'Test', index: 0 }];
			dialogBox.isOverlapingChat = true;
			dialogBox.showRandomChat = true;
			dialogBox.justFastForwarded = true;
			dialogBox.keyObj = { isDown: true };

			// Simulate advancing
			dialogBox.checkButtonDown();

			expect(dialogBox.justFastForwarded).toBe(false);
		});
	});

	describe('fast-forward during animation', () => {
		test('should instantly show full text when space pressed during animation', () => {
			// Setup: dialog is animating
			dialogBox.isAnimatingText = true;
			dialogBox.pagesMessage = ['Test message with multiple words'];
			dialogBox.currentPage = 0;
			dialogBox.keyObj = { isDown: true };
			dialogBox.dialog.textMessage = {
				setText: jest.fn(),
				text: '',
				active: true,
			};

			// Spy on setText to verify it's called with full text
			const setTextSpy = jest.spyOn(dialogBox, 'setText');

			// Simulate space press during animation
			dialogBox.checkButtonDown();

			// Verify setText was called with full text (animate=false)
			expect(setTextSpy).toHaveBeenCalledWith('Test message with multiple words', false);
			expect(dialogBox.justFastForwarded).toBe(true);
		});

		test('should stop timer when fast-forwarding', () => {
			// Setup: dialog is animating with active timer
			dialogBox.isAnimatingText = true;
			dialogBox.pagesMessage = ['Test'];
			dialogBox.currentPage = 0;
			dialogBox.keyObj = { isDown: true };
			dialogBox.timedEvent = mockTimerEvent;

			// Simulate fast-forward
			dialogBox.checkButtonDown();

			// Verify timer was destroyed when setText was called
			expect(mockTimerEvent.destroy).toHaveBeenCalled();
		});

		test('should not fast-forward if not animating', () => {
			// Setup: dialog is NOT animating
			dialogBox.isAnimatingText = false;
			dialogBox.keyObj = { isDown: true };

			const setTextSpy = jest.spyOn(dialogBox, 'setText');

			// Simulate space press when not animating
			dialogBox.checkButtonDown();

			// setText should not be called for fast-forward (only for normal advancement)
			// If called at all, it would be for page advancement, not fast-forward
			const fastForwardCalls = setTextSpy.mock.calls.filter(
				(call) => call[1] === false && dialogBox.pagesMessage.includes(call[0])
			);
			expect(fastForwardCalls.length).toBe(0);
		});
	});

	describe('held button after fast-forward', () => {
		test('should advance dialog when button held after fast-forward', () => {
			// Setup: just fast-forwarded, button still held
			dialogBox.justFastForwarded = true;
			dialogBox.isAnimatingText = false;
			dialogBox.chat = [{ message: 'Test', index: 0 }];
			dialogBox.isOverlapingChat = true;
			dialogBox.showRandomChat = true;
			dialogBox.keyObj = { isDown: true };

			// JustDown should be false (button is held, not newly pressed)
			(Phaser.Input.Keyboard.JustDown as jest.Mock).mockReturnValue(false);

			// Should still advance because justFastForwarded is true
			dialogBox.checkButtonDown();

			// Dialog should open
			expect(dialogBox.dialog.visible).toBe(true);
			expect(dialogBox.justFastForwarded).toBe(false);
		});

		test('should not advance without justFastForwarded flag when button held', () => {
			// Setup: button held but no fast-forward
			dialogBox.justFastForwarded = false;
			dialogBox.chat = [{ message: 'Test', index: 0 }];
			dialogBox.isOverlapingChat = true;
			dialogBox.showRandomChat = true;
			dialogBox.keyObj = { isDown: true };

			// JustDown should be false (button is held)
			(Phaser.Input.Keyboard.JustDown as jest.Mock).mockReturnValue(false);

			// Should NOT advance because button is just held (not newly pressed)
			dialogBox.checkButtonDown();

			// Dialog should not open
			expect(dialogBox.dialog.visible).toBe(false);
		});

		test('should advance with new button press regardless of justFastForwarded', () => {
			// Setup: new button press
			dialogBox.justFastForwarded = false;
			dialogBox.chat = [{ message: 'Test', index: 0 }];
			dialogBox.isOverlapingChat = true;
			dialogBox.showRandomChat = true;
			dialogBox.keyObj = { isDown: true };

			// JustDown should be true (new press)
			(Phaser.Input.Keyboard.JustDown as jest.Mock).mockReturnValue(true);

			// Should advance because of new press
			dialogBox.checkButtonDown();

			// Dialog should open
			expect(dialogBox.dialog.visible).toBe(true);
		});
	});

	describe('checkButtonsPressed and checkButtonsJustPressed', () => {
		test('checkButtonsPressed should return true when key is held', () => {
			dialogBox.keyObj = { isDown: true };
			expect(dialogBox.checkButtonsPressed()).toBe(true);
		});

		test('checkButtonsPressed should return false when key is not held', () => {
			dialogBox.keyObj = { isDown: false };
			expect(dialogBox.checkButtonsPressed()).toBe(false);
		});

		test('checkButtonsJustPressed should use Phaser.Input.Keyboard.JustDown', () => {
			dialogBox.keyObj = { isDown: true };

			(Phaser.Input.Keyboard.JustDown as jest.Mock).mockReturnValue(true);
			expect(dialogBox.checkButtonsJustPressed()).toBe(true);

			(Phaser.Input.Keyboard.JustDown as jest.Mock).mockReturnValue(false);
			expect(dialogBox.checkButtonsJustPressed()).toBe(false);
		});
	});

	describe('complete fast-forward workflow', () => {
		test('should support fast-forward then close with held button', () => {
			// Step 1: Setup dialog with single message
			dialogBox.chat = [{ message: 'Test message', index: 0 }];
			dialogBox.isOverlapingChat = true;
			dialogBox.showRandomChat = true;
			dialogBox.keyObj = { isDown: false };
			(Phaser.Input.Keyboard.JustDown as jest.Mock).mockReturnValue(true);

			// Step 2: Open dialog (first press)
			dialogBox.checkButtonDown();
			expect(dialogBox.dialog.visible).toBe(true);

			// Step 3: Start animation and press space (fast-forward)
			dialogBox.isAnimatingText = true;
			dialogBox.pagesMessage = ['Test message'];
			dialogBox.currentPage = 0;
			dialogBox.keyObj = { isDown: true };
			(Phaser.Input.Keyboard.JustDown as jest.Mock).mockReturnValue(false);

			dialogBox.checkButtonDown();
			expect(dialogBox.justFastForwarded).toBe(true);

			// Step 4: Animation complete, button still held - should close dialog
			dialogBox.isAnimatingText = false;
			dialogBox.dialog.textMessage = { active: true, setText: jest.fn() };

			dialogBox.checkButtonDown();
			expect(dialogBox.dialog.visible).toBe(false);
			expect(dialogBox.justFastForwarded).toBe(false);
		});

		test('should support fast-forward with multi-page dialog', () => {
			// Setup multi-page dialog
			dialogBox.chat = [{ message: 'Page 1', index: 0 }];
			dialogBox.pagesMessage = ['Page 1', 'Page 2'];
			dialogBox.pagesNumber = 2;
			dialogBox.currentPage = 0;
			dialogBox.dialog.visible = true;
			dialogBox.dialog.textMessage = { active: true, text: '', setText: jest.fn() };

			// Fast-forward page 1
			dialogBox.isAnimatingText = true;
			dialogBox.keyObj = { isDown: true };
			dialogBox.checkButtonDown();
			expect(dialogBox.justFastForwarded).toBe(true);

			// Advance to page 2 with held button
			dialogBox.isAnimatingText = false;
			(Phaser.Input.Keyboard.JustDown as jest.Mock).mockReturnValue(false);
			dialogBox.checkButtonDown();

			// Should advance to page 2
			expect(dialogBox.currentPage).toBe(1);
			expect(dialogBox.justFastForwarded).toBe(false);
		});
	});

	describe('typewriterDelay property', () => {
		test('should initialize typewriterDelay to 50ms', () => {
			expect(dialogBox.typewriterDelay).toBe(50);
		});

		test('should use typewriterDelay when creating timed event', () => {
			dialogBox.pagesMessage = ['Test'];
			dialogBox.currentPage = 0;
			dialogBox.dialog.textMessage = { setText: jest.fn() };

			dialogBox.setText('Test', true);

			expect(mockScene.time.addEvent).toHaveBeenCalledWith(
				expect.objectContaining({
					delay: 50,
				})
			);
		});

		test('should allow configurable typewriter speed', () => {
			// Change delay
			dialogBox.typewriterDelay = 100;

			dialogBox.pagesMessage = ['Test'];
			dialogBox.currentPage = 0;
			dialogBox.dialog.textMessage = { setText: jest.fn() };

			dialogBox.setText('Test', true);

			expect(mockScene.time.addEvent).toHaveBeenCalledWith(
				expect.objectContaining({
					delay: 100,
				})
			);
		});
	});
});
