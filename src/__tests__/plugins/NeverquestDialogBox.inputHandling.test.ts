/**
 * Test for dialog box input handling fix
 * Ensures that player input flags are properly managed during dialog interactions
 */

import { NeverquestDialogBox } from '../../plugins/NeverquestDialogBox';

// Mock Phaser objects
const mockScene: any = {
	add: {
		nineslice: jest.fn(() => ({
			setScrollFactor: jest.fn().mockReturnThis(),
			setOrigin: jest.fn().mockReturnThis(),
			setDepth: jest.fn().mockReturnThis(),
			setTint: jest.fn().mockReturnThis(),
			scaleX: 1,
			scaleY: 1,
			width: 800,
			height: 150,
			x: 10,
			y: 600,
			visible: false,
			textMessage: null as any,
		})),
		image: jest.fn(() => ({
			setScrollFactor: jest.fn().mockReturnThis(),
			setOrigin: jest.fn().mockReturnThis(),
			setDepth: jest.fn().mockReturnThis(),
			visible: false,
			x: 0,
			y: 0,
			height: 50,
		})),
		text: jest.fn(() => ({
			setScrollFactor: jest.fn().mockReturnThis(),
			setOrigin: jest.fn().mockReturnThis(),
			setDepth: jest.fn().mockReturnThis(),
			visible: false,
			alpha: 0.5,
			setText: jest.fn().mockReturnThis(),
			text: '',
			setPosition: jest.fn().mockReturnThis(),
			setStyle: jest.fn().mockReturnThis(),
		})),
		sprite: jest.fn(() => ({
			setScrollFactor: jest.fn().mockReturnThis(),
			setOrigin: jest.fn().mockReturnThis(),
			setDepth: jest.fn().mockReturnThis(),
			visible: false,
			anims: { play: jest.fn() },
		})),
		rectangle: jest.fn(() => ({
			setScrollFactor: jest.fn().mockReturnThis(),
			setOrigin: jest.fn().mockReturnThis(),
			setDepth: jest.fn().mockReturnThis(),
			setFillStyle: jest.fn().mockReturnThis(),
			setStrokeStyle: jest.fn().mockReturnThis(),
			setTint: jest.fn().mockReturnThis(),
			visible: false,
			x: 0,
			y: 0,
			width: 800,
			height: 150,
		})),
	},
	cameras: {
		main: { width: 800, height: 600 },
	},
	input: {
		keyboard: {
			addKey: jest.fn(() => ({
				isDown: false,
				on: jest.fn(),
				off: jest.fn(),
			})),
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
		addEvent: jest.fn(),
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

describe('NeverquestDialogBox Input Handling', () => {
	let dialogBox: any;

	beforeEach(() => {
		// Reset player state
		mockPlayer.canMove = true;
		mockPlayer.canAtack = true;
		mockPlayer.canBlock = true;
		mockPlayer.container.body.maxSpeed = 200;

		// Reset mock calls
		jest.clearAllMocks();

		dialogBox = new NeverquestDialogBox(mockScene, mockPlayer);
		dialogBox.create();
	});

	test('should disable player input flags when dialog opens', () => {
		// Set up dialog opening scenario
		dialogBox.chat = [{ message: 'Test message', index: 0 }];
		dialogBox.isOverlapingChat = true;
		dialogBox.showRandomChat = true;

		// Mock button press
		dialogBox.keyObj = { isDown: true };

		// Simulate button press to open dialog
		dialogBox.checkButtonDown();

		// Verify player input flags are disabled
		expect(mockPlayer.canMove).toBe(false);
		expect(mockPlayer.canAtack).toBe(false);
		expect(mockPlayer.canBlock).toBe(false);
		expect(mockPlayer.container.body.maxSpeed).toBe(0);
	});

	test('should re-enable player input flags when dialog closes', () => {
		// Set up dialog closing scenario
		dialogBox.chat = [{ message: 'Test message', index: 0 }];
		dialogBox.currentChat = dialogBox.chat[0];
		dialogBox.dialog.visible = true;
		dialogBox.dialog.textMessage = { active: true };
		dialogBox.isAnimatingText = false;
		dialogBox.currentPage = 0;
		dialogBox.pagesNumber = 1;

		// Disable player flags (simulate dialog open state)
		mockPlayer.canMove = false;
		mockPlayer.canAtack = false;
		mockPlayer.canBlock = false;
		mockPlayer.container.body.maxSpeed = 0;

		// Mock button press
		dialogBox.keyObj = { isDown: true };

		// Simulate button press to close dialog
		dialogBox.checkButtonDown();

		// Verify player input flags are re-enabled
		expect(mockPlayer.canMove).toBe(true);
		expect(mockPlayer.canAtack).toBe(true);
		expect(mockPlayer.canBlock).toBe(true);
		expect(mockPlayer.container.body.maxSpeed).toBe(mockPlayer.speed);
	});

	test('should return correct dialog active state', () => {
		// Test when dialog is not active
		expect(dialogBox.isDialogActive()).toBe(false);

		// Test when dialog is visible
		dialogBox.dialog.visible = true;
		expect(dialogBox.isDialogActive()).toBe(true);

		// Reset and test overlapping chat
		dialogBox.dialog.visible = false;
		dialogBox.isOverlapingChat = true;
		expect(dialogBox.isDialogActive()).toBe(true);

		// Reset and test random chat
		dialogBox.isOverlapingChat = false;
		dialogBox.showRandomChat = true;
		expect(dialogBox.isDialogActive()).toBe(true);
	});

	test('should maintain disabled state during dialog progression', () => {
		// Set up multi-message dialog
		dialogBox.chat = [
			{ message: 'First message', index: 0 },
			{ message: 'Second message', index: 1 },
		];
		dialogBox.currentChat = dialogBox.chat[0];
		dialogBox.dialog.visible = true;
		dialogBox.dialog.textMessage = { active: true, text: '', setText: jest.fn() };
		dialogBox.isAnimatingText = false;

		// Disable player flags (dialog open state)
		mockPlayer.canMove = false;
		mockPlayer.canAtack = false;
		mockPlayer.canBlock = false;

		// Mock progression to next message
		dialogBox.keyObj = { isDown: true };
		dialogBox.checkButtonDown();

		// Verify flags remain disabled during progression
		expect(mockPlayer.canMove).toBe(false);
		expect(mockPlayer.canAtack).toBe(false);
		expect(mockPlayer.canBlock).toBe(false);
	});
});
