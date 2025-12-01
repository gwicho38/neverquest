import { NeverquestDialogBox } from '../../plugins/NeverquestDialogBox';

describe('NeverquestDialogBox', () => {
	let dialogBox: any;
	let mockScene: any;
	let mockPlayer: any;

	beforeEach(() => {
		// Mock Phaser scene
		mockScene = {
			add: {
				text: jest.fn().mockReturnValue({
					setText: jest.fn().mockReturnThis(),
					setOrigin: jest.fn().mockReturnThis(),
					setDepth: jest.fn().mockReturnThis(),
					setPosition: jest.fn().mockReturnThis(),
					setScrollFactor: jest.fn().mockReturnThis(),
					destroy: jest.fn(),
					text: '',
					visible: true,
					active: true,
				}),
				image: jest.fn().mockReturnValue({
					setOrigin: jest.fn().mockReturnThis(),
					setDepth: jest.fn().mockReturnThis(),
					setPosition: jest.fn().mockReturnThis(),
					setScale: jest.fn().mockReturnThis(),
					destroy: jest.fn(),
					visible: false,
				}),
				sprite: jest.fn().mockReturnValue({
					setOrigin: jest.fn().mockReturnThis(),
					setDepth: jest.fn().mockReturnThis(),
					setPosition: jest.fn().mockReturnThis(),
					setScale: jest.fn().mockReturnThis(),
					destroy: jest.fn(),
					visible: false,
					play: jest.fn(),
				}),
			},
			input: {
				keyboard: {
					addKey: jest.fn().mockReturnValue({
						isDown: false,
					}),
				},
				gamepad: {
					pad1: null,
				},
			},
			events: {
				on: jest.fn(),
				once: jest.fn(),
				off: jest.fn(),
				emit: jest.fn(),
			},
			cameras: {
				main: {
					width: 800,
					height: 600,
				},
			},
			tweens: {
				add: jest.fn(),
			},
			time: {
				addEvent: jest.fn().mockReturnValue({
					destroy: jest.fn(),
					remove: jest.fn(),
				}),
			},
			sound: {
				add: jest.fn().mockReturnValue({
					play: jest.fn(),
				}),
			},
		};

		// Mock player
		mockPlayer = {
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

		dialogBox = new NeverquestDialogBox(mockScene, mockPlayer);
	});

	describe('constructor', () => {
		it('should initialize with default values', () => {
			expect(dialogBox.scene).toBe(mockScene);
			expect(dialogBox.player).toBe(mockPlayer);
			expect(dialogBox.fontFamily).toBe('"Press Start 2P"');
			expect(dialogBox.canShowDialog).toBe(true);
			expect(dialogBox.isAnimatingText).toBe(false);
			expect(dialogBox.chat).toEqual([]);
			expect(dialogBox.pagesMessage).toEqual([]);
			expect(dialogBox.currentPage).toBe(0);
		});

		it('should set up dialog properties', () => {
			expect(dialogBox.dialogHeight).toBe(150);
			expect(dialogBox.margin).toBe(15);
			expect(dialogBox.typewriterDelay).toBe(50);
		});
	});

	describe('openDialogModal', () => {
		it('should set up chat data when canShowDialog is true', () => {
			dialogBox.canShowDialog = true;
			const callback = jest.fn();

			dialogBox.openDialogModal('Test message', callback);

			expect(dialogBox.chat).toEqual([{ message: 'Test message', index: 0 }]);
			expect(dialogBox.isOverlapingChat).toBe(true);
			expect(dialogBox.showRandomChat).toBe(true);
			expect(mockScene.events.once).toHaveBeenCalledWith('dialogComplete', callback);
		});

		it('should not set up chat when canShowDialog is false', () => {
			dialogBox.canShowDialog = false;
			dialogBox.openDialogModal('Test message');

			expect(dialogBox.chat).toEqual([]);
		});

		it('should work without callback', () => {
			dialogBox.canShowDialog = true;
			dialogBox.openDialogModal('Test message');

			expect(dialogBox.chat).toEqual([{ message: 'Test message', index: 0 }]);
			expect(mockScene.events.once).not.toHaveBeenCalled();
		});
	});

	describe('setText', () => {
		beforeEach(() => {
			// Mock the dialog object
			dialogBox.dialog = {
				textMessage: {
					setText: jest.fn().mockReturnThis(),
					setVisible: jest.fn().mockReturnThis(),
					text: '',
					visible: false,
				},
				visible: true,
			};
		});

		it('should set text without animation', () => {
			dialogBox.setText('Hello World', false);

			expect(dialogBox.isAnimatingText).toBe(false);
			expect(dialogBox.dialog.textMessage.setText).toHaveBeenCalledWith('Hello World');
			expect(dialogBox.dialog.textMessage.visible).toBe(true);
		});

		it('should set text with animation', () => {
			dialogBox.setText('Hello', true);

			expect(dialogBox.isAnimatingText).toBe(true);
			expect(dialogBox.animationText).toEqual(['H', 'e', 'l', 'l', 'o']);
			expect(mockScene.time.addEvent).toHaveBeenCalledWith(
				expect.objectContaining({
					delay: dialogBox.typewriterDelay,
					repeat: 4, // length - 1
				})
			);
		});

		it('should handle undefined text gracefully', () => {
			expect(() => dialogBox.setText(undefined, false)).not.toThrow();
			expect(dialogBox.animationText).toEqual([]);
		});

		it('should handle null text gracefully', () => {
			expect(() => dialogBox.setText(null, false)).not.toThrow();
			expect(dialogBox.animationText).toEqual([]);
		});

		it('should stop existing timer when called during animation', () => {
			const mockTimer = { destroy: jest.fn(), remove: jest.fn() };
			dialogBox.timedEvent = mockTimer;

			dialogBox.setText('New text', false);

			expect(mockTimer.destroy).toHaveBeenCalled();
			expect(dialogBox.timedEvent).toBe(null);
		});
	});

	describe('animateText', () => {
		beforeEach(() => {
			dialogBox.dialog = {
				textMessage: {
					setText: jest.fn().mockReturnThis(),
					text: '',
					visible: true,
				},
			};
			dialogBox.neverquestTypingSoundManager = {
				type: jest.fn(),
			};
		});

		it('should animate text character by character', () => {
			dialogBox.animationText = ['H', 'e', 'l', 'l', 'o'];
			dialogBox.eventCounter = 0;

			dialogBox.animateText();
			expect(dialogBox.eventCounter).toBe(1);
			expect(dialogBox.dialog.textMessage.setText).toHaveBeenCalledWith('H');

			// Update text to simulate setText behavior
			dialogBox.dialog.textMessage.text = 'H';
			dialogBox.animateText();
			expect(dialogBox.eventCounter).toBe(2);
			expect(dialogBox.dialog.textMessage.setText).toHaveBeenCalledWith('He');
		});

		it('should stop animation when complete', () => {
			dialogBox.animationText = ['H', 'i'];
			dialogBox.eventCounter = 1;
			dialogBox.timedEvent = { remove: jest.fn() };

			dialogBox.animateText();

			expect(dialogBox.eventCounter).toBe(2);
			expect(dialogBox.isAnimatingText).toBe(false);
			expect(dialogBox.timedEvent.remove).toHaveBeenCalled();
		});

		it('should handle missing dialog gracefully', () => {
			dialogBox.dialog = null;
			dialogBox.animationText = ['H'];

			expect(() => dialogBox.animateText()).not.toThrow();
		});
	});

	describe('showDialog', () => {
		beforeEach(() => {
			dialogBox.dialog = {
				textMessage: null,
				visible: false,
				y: 100,
			};
			dialogBox.dialogMessage = 'Test message';
			dialogBox.setText = jest.fn();
		});

		it('should show dialog and create text', () => {
			dialogBox.showDialog(true);

			expect(dialogBox.dialog.visible).toBe(true);
			expect(dialogBox.canShowDialog).toBe(false);
			expect(dialogBox.currentPage).toBe(0);
			expect(mockScene.add.text).toHaveBeenCalled();
		});

		it('should populate pagesMessage from dialogMessage if empty', () => {
			dialogBox.pagesMessage = [];
			dialogBox.dialogMessage = 'Test message';

			dialogBox.showDialog(false);

			expect(dialogBox.pagesMessage).toEqual(['Test message']);
			expect(dialogBox.pagesNumber).toBe(1);
		});

		it('should animate first page', () => {
			dialogBox.pagesMessage = ['Page 1', 'Page 2'];
			dialogBox.showDialog(false);

			expect(dialogBox.setText).toHaveBeenCalledWith('Page 1', true);
		});
	});

	describe('checkButtonDown', () => {
		beforeEach(() => {
			dialogBox.dialog = {
				textMessage: {
					text: '',
					active: true,
					visible: true,
				},
				visible: false,
			};
			dialogBox.checkButtonsPressed = jest.fn().mockReturnValue(false);
			dialogBox.checkButtonsJustPressed = jest.fn().mockReturnValue(false);
			dialogBox.keyObj = { isDown: false };
		});

		it('should fast-forward animation when button pressed during typing', () => {
			dialogBox.isAnimatingText = true;
			dialogBox.pagesMessage = ['Test message'];
			dialogBox.currentPage = 0;
			dialogBox.checkButtonsPressed.mockReturnValue(true);
			dialogBox.setText = jest.fn();

			dialogBox.checkButtonDown();

			expect(dialogBox.setText).toHaveBeenCalledWith('Test message', false);
			expect(dialogBox.justFastForwarded).toBe(true);
		});

		it('should show dialog on first button press', () => {
			dialogBox.isOverlapingChat = true;
			dialogBox.chat = [{ message: 'Hello', index: 0 }];
			dialogBox.checkButtonsJustPressed.mockReturnValue(true);
			dialogBox.checkSpeaker = jest.fn();
			dialogBox.showDialog = jest.fn();

			dialogBox.checkButtonDown();

			expect(dialogBox.currentChat).toEqual({ message: 'Hello', index: 0 });
			expect(dialogBox.dialogMessage).toBe('Hello');
			expect(dialogBox.showDialog).toHaveBeenCalled();
			expect(mockPlayer.canMove).toBe(false);
		});

		it('should advance to next page when available', () => {
			dialogBox.isAnimatingText = false;
			dialogBox.dialog.visible = true;
			dialogBox.currentPage = 0;
			dialogBox.pagesNumber = 2;
			dialogBox.pagesMessage = ['Page 1', 'Page 2'];
			dialogBox.checkButtonsJustPressed.mockReturnValue(true);
			dialogBox.setText = jest.fn();

			dialogBox.checkButtonDown();

			expect(dialogBox.currentPage).toBe(1);
			expect(dialogBox.setText).toHaveBeenCalledWith('Page 2', true);
		});

		it('should close dialog on final page', () => {
			dialogBox.isAnimatingText = false;
			dialogBox.dialog.visible = true;
			dialogBox.dialog.textMessage.visible = true;
			dialogBox.actionButton = { visible: true };
			dialogBox.currentPage = 1;
			dialogBox.pagesNumber = 2;
			dialogBox.chat = [{ message: 'Test', index: 0 }];
			dialogBox.currentChat = { message: 'Test', index: 0 };
			dialogBox.checkButtonsJustPressed.mockReturnValue(true);

			dialogBox.checkButtonDown();

			expect(dialogBox.dialog.visible).toBe(false);
			expect(dialogBox.isOverlapingChat).toBe(false);
			expect(mockPlayer.canMove).toBe(true);
			expect(mockScene.events.emit).toHaveBeenCalledWith('dialogComplete');
		});

		it('should advance to next chat message', () => {
			dialogBox.isAnimatingText = false;
			dialogBox.dialog.visible = true;
			dialogBox.currentPage = 0;
			dialogBox.pagesNumber = 1;
			dialogBox.chat = [
				{ message: 'First', index: 0 },
				{ message: 'Second', index: 1 },
			];
			dialogBox.currentChat = { message: 'First', index: 0 };
			dialogBox.checkButtonsJustPressed.mockReturnValue(true);
			dialogBox.setText = jest.fn();
			dialogBox.showDialog = jest.fn();

			dialogBox.checkButtonDown();

			expect(dialogBox.currentChat).toEqual({ message: 'Second', index: 1 });
			expect(dialogBox.dialogMessage).toBe('Second');
			expect(dialogBox.showDialog).toHaveBeenCalledWith(false);
		});
	});

	describe('checkButtonsPressed', () => {
		beforeEach(() => {
			dialogBox.keyObj = { isDown: false };
		});

		it('should return true when keyboard key is down', () => {
			dialogBox.keyObj.isDown = true;
			expect(dialogBox.checkButtonsPressed()).toBe(true);
		});

		it('should return false when no buttons pressed', () => {
			expect(dialogBox.checkButtonsPressed()).toBe(false);
		});
	});

	describe('isDialogActive', () => {
		beforeEach(() => {
			dialogBox.dialog = { visible: false };
		});

		it('should return true when dialog is visible', () => {
			dialogBox.dialog.visible = true;
			expect(dialogBox.isDialogActive()).toBe(true);
		});

		it('should return false when dialog is not visible', () => {
			expect(dialogBox.isDialogActive()).toBe(false);
		});
	});
});
