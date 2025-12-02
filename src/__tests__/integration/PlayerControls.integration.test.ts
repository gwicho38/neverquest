/**
 * Integration tests for player controls
 * Tests interactions between dialog system, battle system, and player movement
 */

import { NeverquestDialogBox } from '../../plugins/NeverquestDialogBox';
import { NeverquestBattleManager } from '../../plugins/NeverquestBattleManager';

describe('Player Controls Integration Tests', () => {
	let mockScene: any;
	let mockPlayer: any;
	let dialogBox: NeverquestDialogBox;
	let battleManager: NeverquestBattleManager;

	beforeEach(() => {
		// Create comprehensive mock scene
		mockScene = {
			scene: {
				get: jest.fn().mockReturnValue(null),
			},
			add: {
				text: jest.fn().mockReturnValue({
					setText: jest.fn().mockReturnThis(),
					setOrigin: jest.fn().mockReturnThis(),
					setWordWrapWidth: jest.fn().mockReturnThis(),
					setDepth: jest.fn().mockReturnThis(),
					setPosition: jest.fn().mockReturnThis(),
					setScrollFactor: jest.fn().mockReturnThis(),
					destroy: jest.fn(),
				}),
				image: jest.fn().mockReturnValue({
					setOrigin: jest.fn().mockReturnThis(),
					setDepth: jest.fn().mockReturnThis(),
					setPosition: jest.fn().mockReturnThis(),
					setScale: jest.fn().mockReturnThis(),
					setScrollFactor: jest.fn().mockReturnThis(),
					destroy: jest.fn(),
				}),
				sprite: jest.fn().mockReturnValue({
					setOrigin: jest.fn().mockReturnThis(),
					setDepth: jest.fn().mockReturnThis(),
					setPosition: jest.fn().mockReturnThis(),
					setScrollFactor: jest.fn().mockReturnThis(),
					setVisible: jest.fn().mockReturnThis(),
					destroy: jest.fn(),
					visible: false,
					x: 0,
					y: 0,
					anims: {
						play: jest.fn().mockReturnThis(),
						stop: jest.fn().mockReturnThis(),
					},
				}),
				nineslice: jest.fn().mockReturnValue({
					setOrigin: jest.fn().mockReturnThis(),
					setDepth: jest.fn().mockReturnThis(),
					setPosition: jest.fn().mockReturnThis(),
					setScrollFactor: jest.fn().mockReturnThis(),
					setSize: jest.fn().mockReturnThis(),
					setTint: jest.fn().mockReturnThis(),
					destroy: jest.fn(),
					visible: false,
					x: 0,
					y: 0,
					scaleX: 1,
				}),
				rectangle: jest.fn().mockReturnValue({
					setOrigin: jest.fn().mockReturnThis(),
					setDepth: jest.fn().mockReturnThis(),
					setPosition: jest.fn().mockReturnThis(),
					setScrollFactor: jest.fn().mockReturnThis(),
					setFillStyle: jest.fn().mockReturnThis(),
					setStrokeStyle: jest.fn().mockReturnThis(),
					setTint: jest.fn().mockReturnThis(),
					destroy: jest.fn(),
					visible: false,
					x: 0,
					y: 0,
					width: 800,
					height: 150,
				}),
			},
			input: {
				keyboard: {
					on: jest.fn(),
					off: jest.fn(),
					removeListener: jest.fn(),
					addKey: jest.fn().mockReturnValue({
						isDown: false,
						on: jest.fn(),
						off: jest.fn(),
					}),
				},
			},
			cameras: {
				main: {
					midPoint: { x: 400, y: 300 },
					height: 600,
					width: 800,
				},
			},
			tweens: {
				add: jest.fn(),
			},
			time: {
				addEvent: jest.fn().mockReturnValue({
					remove: jest.fn(),
				}),
			},
			events: {
				on: jest.fn(),
				off: jest.fn(),
				once: jest.fn(),
				emit: jest.fn(),
			},
			scale: {
				on: jest.fn(),
				off: jest.fn(),
			},
			sound: {
				add: jest.fn().mockReturnValue({
					volume: 1,
					play: jest.fn(),
				}),
			},
		};

		// Create mock player with all necessary properties
		mockPlayer = {
			container: {
				body: {
					maxSpeed: 200,
					velocity: { x: 0, y: 0 },
				},
			},
			body: {
				velocity: { x: 0, y: 0 },
			},
			speed: 200,
			canMove: true,
			canAtack: true,
			canBlock: true,
			isBlocking: false,
			isAtacking: false,
			isSwimming: false,
			active: true,
			texture: { key: 'character' },
			anims: {
				play: jest.fn(),
				exists: jest.fn().mockReturnValue(true),
			},
			setTint: jest.fn(),
			clearTint: jest.fn(),
		};

		dialogBox = new NeverquestDialogBox(mockScene, mockPlayer);
		dialogBox.create();

		battleManager = new NeverquestBattleManager();
	});

	// Helper to simulate opening dialog (button press + checkButtonDown)
	const openDialogWithButtonPress = () => {
		const original = dialogBox.checkButtonsJustPressed;
		dialogBox.checkButtonsJustPressed = jest.fn().mockReturnValue(true);
		dialogBox.checkButtonDown();
		dialogBox.checkButtonsJustPressed = original;
	};

	describe('Dialog and Block Interaction', () => {
		it('should not allow blocking during dialog', () => {
			// Queue dialog and simulate button press to open it
			dialogBox.openDialogModal('Test message', jest.fn());
			openDialogWithButtonPress();

			// Verify player abilities are disabled
			expect(mockPlayer.canMove).toBe(false);
			expect(mockPlayer.canAtack).toBe(false);
			expect(mockPlayer.canBlock).toBe(false);

			// Try to block
			battleManager.block(mockPlayer);

			// Should not start blocking because canBlock is false
			expect(mockPlayer.isBlocking).toBe(false);
		});

		it('should not re-enable movement when releasing block during dialog', () => {
			// Start blocking
			battleManager.block(mockPlayer);
			expect(mockPlayer.isBlocking).toBe(true);
			expect(mockPlayer.canMove).toBe(false);

			// Queue dialog and simulate button press to open it while blocking
			dialogBox.openDialogModal('Test message', jest.fn());
			openDialogWithButtonPress();

			// Stop blocking
			battleManager.stopBlock(mockPlayer);

			// Movement should STILL be disabled because dialog is open
			// This is the bug - stopBlock() re-enables movement unconditionally
			expect(mockPlayer.canMove).toBe(false); // This will fail with current code
			expect(mockPlayer.canAtack).toBe(false); // This will fail with current code
		});

		it('should properly restore abilities after dialog closes', () => {
			// Queue dialog and open it
			dialogBox.openDialogModal('Test message', jest.fn());
			openDialogWithButtonPress();
			expect(mockPlayer.canMove).toBe(false);

			// Close dialog (simulate pressing space on final page)
			dialogBox.dialog.textMessage = { active: true, text: 'Test' } as any;
			openDialogWithButtonPress(); // Press button to close

			// Abilities should be restored
			expect(mockPlayer.canMove).toBe(true);
			expect(mockPlayer.canAtack).toBe(true);
			expect(mockPlayer.canBlock).toBe(true);
		});
	});

	describe('Dialog State Management', () => {
		it('should not reopen dialog after closing', () => {
			// Queue and open dialog
			dialogBox.openDialogModal('Test message', jest.fn());
			openDialogWithButtonPress();
			expect(dialogBox.dialog.visible).toBe(true);

			// Close dialog by pressing button on final page
			dialogBox.dialog.textMessage = { active: true, text: 'Test' } as any;
			openDialogWithButtonPress();

			// Dialog should be closed and state cleaned up
			expect(dialogBox.dialog.visible).toBe(false);
			expect(dialogBox.chat.length).toBe(0);
			expect(dialogBox.currentChat).toBe(null);
			expect(dialogBox.isOverlapingChat).toBe(false);
			expect(dialogBox.showRandomChat).toBe(false);
		});

		it('should not advance to next chat without button press', () => {
			// Set up multi-message chat
			dialogBox.chat = [
				{ message: 'Message 1', index: 0 },
				{ message: 'Message 2', index: 1 },
			];
			dialogBox.currentChat = dialogBox.chat[0];
			dialogBox.dialog.visible = true;

			// Call checkButtonDown without simulating button press
			const originalCheckButtons = dialogBox.checkButtonsPressed;
			dialogBox.checkButtonsPressed = jest.fn().mockReturnValue(false);

			dialogBox.checkButtonDown();

			// Should not advance to next message
			expect(dialogBox.currentChat.index).toBe(0);

			dialogBox.checkButtonsPressed = originalCheckButtons;
		});
	});

	describe('Block Toggle Bug', () => {
		it('should allow normal block and unblock cycle', () => {
			// Block
			battleManager.block(mockPlayer);
			expect(mockPlayer.isBlocking).toBe(true);
			expect(mockPlayer.canMove).toBe(false);
			expect(mockPlayer.canAtack).toBe(false);

			// Unblock
			battleManager.stopBlock(mockPlayer);
			expect(mockPlayer.isBlocking).toBe(false);
			expect(mockPlayer.canMove).toBe(true);
			expect(mockPlayer.canAtack).toBe(true);
		});

		it('should not toggle abilities if already not blocking', () => {
			mockPlayer.isBlocking = false;
			mockPlayer.canMove = true;
			mockPlayer.canAtack = true;

			// Call stopBlock when not blocking
			battleManager.stopBlock(mockPlayer);

			// Should not change anything
			expect(mockPlayer.canMove).toBe(true);
			expect(mockPlayer.canAtack).toBe(true);
		});
	});
});
