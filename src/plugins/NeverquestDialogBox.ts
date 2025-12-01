import Phaser from 'phaser';
import { NineSlice } from 'phaser3-nineslice';
import { Player } from '../entities/Player';
import { NeverquestTypingSoundManager } from './NeverquestTypingSoundManager';
import { NeverquestVideoOpener } from './NeverquestVideoOpener';
import { NumericColors } from '../consts/Colors';
import { Alpha, Scale, AnimationTiming, Depth, FontFamilies, DialogBox } from '../consts/Numbers';
import { DialogBoxMessages } from '../consts/Messages';

// Interface for dialog chat data
export interface IDialogChat {
	message: string;
	index: number;
	left?: boolean;
	right?: boolean;
	leftName?: string;
	rightName?: string;
	leftPortraitName?: string;
	rightPortraitName?: string;
	leftExit?: boolean;
	rightExit?: boolean;
}

// Interface for dialog text message object
export interface IDialogTextMessage extends Phaser.GameObjects.Text {
	setPosition(x: number, y: number): this;
	setStyle(style: Phaser.Types.GameObjects.Text.TextStyle): this;
}

// Interface for dialog object
export interface IDialog extends NineSlice {
	textMessage?: IDialogTextMessage;
	visible: boolean;
	x: number;
	y: number;
	scaleX: number;
}

/**
 * Dialog box system for displaying conversations with typewriter effect and character portraits
 */
export class NeverquestDialogBox {
	public scene: Phaser.Scene;
	public player: Player;
	public dialogSpriteName: string;
	public actionButtonSpriteName: string;
	public interactionSpriteName: string;
	public animationIteractionIconName: string;
	public mobileActionButtonSpriteName: string;
	public actionButtonKeyCode: number;
	public dialogHeight: number;
	public margin: number;
	public dialogMaxLines: number;
	public fontWidth: number;
	public fontFamily: string;
	public fontSize: string;
	public fontColor: Phaser.Display.Color;
	public letterSpacing: number;
	public lineSpacing: number;
	public textWidth: number;
	public canShowDialog: boolean;
	public gamepad: Phaser.Input.Gamepad.Gamepad | null;
	public cameraWidth: number;
	public cameraHeight: number;
	public dialog: IDialog;
	public actionButton: Phaser.GameObjects.Image;
	public interactionIcon: Phaser.GameObjects.Sprite;
	public leftPortraitImage: Phaser.GameObjects.Image;
	public rightPortraitImage: Phaser.GameObjects.Image;
	public leftNameText: Phaser.GameObjects.Text;
	public rightNameText: Phaser.GameObjects.Text;
	public keyObj: Phaser.Input.Keyboard.Key;
	public buttonA: any;
	public buttonB: any;
	public neverquestTypingSoundManager: NeverquestTypingSoundManager;
	public neverquestVideoOpener: NeverquestVideoOpener;
	public isOverlapingChat: boolean;
	public showRandomChat: boolean;
	public chat: IDialogChat[];
	public currentChat: IDialogChat | null;
	public dialogMessage: string;
	public pagesMessage: string[];
	public pagesNumber: number;
	public currentPage: number;
	public isAnimatingText: boolean;
	public animationText: string[];
	public eventCounter: number;
	public timedEvent: Phaser.Time.TimerEvent | null;
	public typewriterDelay: number;
	public justFastForwarded: boolean;

	/**
	 * This class allows one to create Dialogs.
	 * It's possible to set the Action Hotkey, Action button Sprite, Dialog Sprite image,
	 * Interaction icon above player.
	 */
	constructor(scene: Phaser.Scene, player: Player) {
		/**
		 * Scene Context.
		 */
		this.scene = scene;

		/**
		 * Player Game Object.
		 */
		this.player = player;

		/**
		 * Name of the sprite image that will be the dialog.
		 */
		this.dialogSpriteName = 'dialog';

		/**
		 * Name of the Sprite of the button action.
		 */
		this.actionButtonSpriteName = 'enter_keyboard_key';

		/**
		 * Interaction sprite name.
		 */
		this.interactionSpriteName = 'chat_bubble_animation';

		/**
		 * The name of the animation that the iteraction icon will play.
		 */
		this.animationIteractionIconName = 'chat_bubble_animation';

		/**
		 * Name of the Sprite of the Mobile button action.
		 */
		this.mobileActionButtonSpriteName = 'buttonA';

		/**
		 * Current action button key code.
		 */
		this.actionButtonKeyCode = Phaser.Input.Keyboard.KeyCodes.E;

		/**
		 * Dialog height.
		 */
		this.dialogHeight = DialogBox.HEIGHT;

		/**
		 * Margin of the dialog. Used to make spaces in the dialog.
		 */
		this.margin = 15;

		/**
		 * Number of maximum lines that fit on the dialog.
		 */
		this.dialogMaxLines = 4;

		/**
		 * Width of one font character.
		 */
		this.fontWidth = 6;

		/**
		 * Default family of the font.
		 */
		this.fontFamily = FontFamilies.PRESS_START_2P;

		/**
		 * Default font size.
		 */
		this.fontSize = '11px';

		/**
		 * Color of the font.
		 */
		this.fontColor = new Phaser.Display.Color(255, 255, 255, 255);

		/**
		 * Letter spacing.
		 */
		this.letterSpacing = 1;

		/**
		 * Space between lines of the dialog text.
		 */
		this.lineSpacing = 6;

		/**
		 * Max width of the text inside the dialog.
		 */
		this.textWidth = 0;

		/**
		 * Rather it can show de dialog of not.
		 */
		this.canShowDialog = true;

		/**
		 * GamePad Support.
		 */
		this.gamepad = null;

		// Initialize camera dimensions
		this.cameraWidth = 0;
		this.cameraHeight = 0;

		// Initialize dialog state
		this.isOverlapingChat = false;
		this.showRandomChat = false;
		this.chat = [];
		this.currentChat = null;
		this.dialogMessage = '';
		this.pagesMessage = [];
		this.pagesNumber = 0;
		this.currentPage = 0;
		this.isAnimatingText = false;
		this.animationText = [];
		this.eventCounter = 0;
		this.timedEvent = null;

		/**
		 * Delay between each character in the typewriter effect (in milliseconds)
		 * Set to 50ms for comfortable reading speed
		 */
		this.typewriterDelay = 50;

		/**
		 * Flag to track if we just fast-forwarded text
		 */
		this.justFastForwarded = false;

		// Initialize dialog objects (will be created in create method)
		this.dialog = null as any;
		this.actionButton = null as any;
		this.interactionIcon = null as any;
		this.leftPortraitImage = null as any;
		this.rightPortraitImage = null as any;
		this.leftNameText = null as any;
		this.rightNameText = null as any;
		this.keyObj = null as any;
		this.buttonA = null;
		this.buttonB = null;
		this.neverquestTypingSoundManager = null as any;
		this.neverquestVideoOpener = null as any;
	}

	/**
	 * Initialize the dialog system
	 */
	create(): void {
		this.neverquestTypingSoundManager = new NeverquestTypingSoundManager(this.scene);
		this.neverquestTypingSoundManager.create();

		this.neverquestVideoOpener = new NeverquestVideoOpener(this.scene);

		this.createDialogueBox();
		this.createDialogueElements();
		this.createInteractionButtons();

		this.keyObj = this.scene.input.keyboard!.addKey(this.actionButtonKeyCode);

		// Add ESC key to close dialog
		const escKey = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
		escKey.on('down', () => {
			if (this.chat && this.chat.length > 0 && this.dialog.visible) {
				console.log('[NeverquestDialogBox] ESC pressed - closing dialog');
				this.hideDialog();
			}
		});

		// GamePad Support
		if (this.scene.input.gamepad && this.scene.input.gamepad.total > 0) {
			this.gamepad = this.scene.input.gamepad.getPad(0);
		}

		if (this.gamepad) {
			this.setGamepadTextures();
		}

		this.scene.events.on('update', this.checkUpdate, this);
		this.scene.scale.on('resize', this.resizeComponents, this);
	}

	/**
	 * Create dialog box background
	 */
	createDialogueBox(): void {
		this.cameraWidth = this.scene.cameras.main.width;
		this.cameraHeight = this.scene.cameras.main.height;
		this.textWidth = this.cameraWidth - this.margin * 3;

		// Create a black background rectangle for the dialog
		// Position 30% down from the top of the viewport
		const dialogY = this.cameraHeight * 0.3;
		const dialogBg = this.scene.add.rectangle(
			this.margin,
			dialogY,
			this.cameraWidth - this.margin * 2,
			this.dialogHeight,
			NumericColors.BLACK,
			Alpha.ALMOST_OPAQUE
		);
		dialogBg
			.setOrigin(0, 0)
			.setScrollFactor(0, 0)
			.setDepth(Depth.TOP - 1);
		dialogBg.visible = false;

		this.dialog = this.scene.add.nineslice(
			this.margin,
			dialogY, // Positioned at top of screen now
			this.dialogSpriteName, // texture key - must come before dimensions
			undefined, // frame - use undefined for single-frame textures
			this.cameraWidth - this.margin * 2, // width
			this.dialogHeight, // height
			60, // leftWidth
			60, // rightWidth
			32, // topHeight
			32 // bottomHeight
		) as unknown as IDialog;

		// Store reference to background rect AFTER dialog is created
		(this.dialog as any).backgroundRect = dialogBg;

		// Tint the dialog box black to make the paper texture dark
		this.dialog.setTint(NumericColors.BLACK);
		this.dialog.setScrollFactor(0, 0).setOrigin(0, 0).setDepth(Depth.TOP);
		this.dialog.visible = false;
	}

	/**
	 * Create character portraits and name text elements
	 */
	createDialogueElements(): void {
		this.leftPortraitImage = this.scene.add.image(
			this.dialog.x + this.dialog.scaleX * 100,
			this.dialog.y + this.dialog.scaleY * 20,
			''
		);
		this.leftPortraitImage.setScrollFactor(0, 0);
		this.leftPortraitImage.setOrigin(0, 0);
		this.leftPortraitImage.setDepth(Depth.TOP);
		this.leftPortraitImage.visible = false;

		this.rightPortraitImage = this.scene.add.image(
			this.dialog.x + this.dialog.width - this.dialog.scaleX * 100,
			this.dialog.y + this.dialog.scaleY * 20,
			''
		);
		this.rightPortraitImage.setScrollFactor(0, 0);
		this.rightPortraitImage.setOrigin(1, 0);
		this.rightPortraitImage.setDepth(Depth.TOP);
		this.rightPortraitImage.visible = false;

		this.leftNameText = this.scene.add.text(
			this.leftPortraitImage.x,
			this.leftPortraitImage.y + this.leftPortraitImage.height + 5,
			'',
			{
				fontFamily: this.fontFamily,
				fontSize: this.fontSize,
				color: this.fontColor.rgba,
			}
		);
		this.leftNameText.setScrollFactor(0, 0);
		this.leftNameText.setOrigin(0, 0);
		this.leftNameText.setDepth(Depth.TOP);
		this.leftNameText.visible = false;

		this.rightNameText = this.scene.add.text(
			this.rightPortraitImage.x,
			this.rightPortraitImage.y + this.rightPortraitImage.height + 5,
			'',
			{
				fontFamily: this.fontFamily,
				fontSize: this.fontSize,
				color: this.fontColor.rgba,
			}
		);
		this.rightNameText.setScrollFactor(0, 0);
		this.rightNameText.setOrigin(1, 0);
		this.rightNameText.setDepth(Depth.TOP);
		this.rightNameText.visible = false;
	}

	/**
	 * Create interaction buttons and icons
	 */
	createInteractionButtons(): void {
		this.actionButton = this.scene.add
			.image(this.cameraWidth - this.margin * 4, this.cameraHeight - this.margin * 4, this.actionButtonSpriteName)
			.setScrollFactor(0, 0)
			.setOrigin(0.5, 0.5)
			.setDepth(Depth.TOP);

		this.actionButton.visible = false;

		this.interactionIcon = this.scene.add
			.sprite(this.cameraWidth / 2, this.cameraHeight / 2, this.interactionSpriteName)
			.setScrollFactor(0, 0)
			.setOrigin(0.5, 0.5)
			.setDepth(Depth.TOP);

		this.interactionIcon.visible = false;
		this.interactionIcon.anims.play(this.animationIteractionIconName);

		// Get mobile buttons from joystick scene
		const joystickScene = this.scene.scene.get('JoystickScene');
		if (joystickScene) {
			if ((joystickScene as any).buttonA || (joystickScene as any).buttonB) {
				this.buttonA = (joystickScene as any).buttonA;
				this.buttonB = (joystickScene as any).buttonB;
			}
		}
	}

	/**
	 * Set gamepad-specific textures
	 */
	setGamepadTextures(): void {
		this.actionButton.setTexture(this.mobileActionButtonSpriteName);
	}

	/**
	 * Check if any input buttons are currently pressed
	 */
	checkButtonsPressed(): boolean {
		return !!(this.keyObj.isDown || this.isMobileButtonPressed() || (this.gamepad && this.gamepad.A));
	}

	/**
	 * Check if any input buttons were just pressed (new press, not held)
	 */
	checkButtonsJustPressed(): boolean {
		return !!(
			Phaser.Input.Keyboard.JustDown(this.keyObj) ||
			this.isMobileButtonJustPressed() ||
			(this.gamepad && this.gamepad.A)
		);
	}

	/**
	 * Check if mobile buttons are pressed
	 */
	isMobileButtonPressed(): boolean {
		return (
			(this.buttonA && this.buttonA.isDown) ||
			(this.buttonB && this.buttonB.isDown) ||
			(this.gamepad && this.gamepad.A)
		);
	}

	/**
	 * Check if mobile buttons were just pressed
	 */
	isMobileButtonJustPressed(): boolean {
		// For mobile buttons, we'll use the same logic for now
		// TODO: Implement proper "just pressed" detection for mobile buttons
		return (
			(this.buttonA && this.buttonA.isDown) ||
			(this.buttonB && this.buttonB.isDown) ||
			(this.gamepad && this.gamepad.A)
		);
	}

	/**
	 * Open dialog modal with specified text and callback
	 */
	openDialogModal(text: string, callback?: () => void): void {
		if (!this.canShowDialog) return;

		this.chat = [{ message: text, index: 0 }];
		this.isOverlapingChat = true;
		this.showRandomChat = true;

		if (callback) {
			this.scene.events.once('dialogComplete', callback);
		}
	}

	/**
	 * Set text content with optional typewriter animation
	 */
	setText(text: string, animate: boolean = false): void {
		// Safety check: ensure text is defined
		if (text === undefined || text === null) {
			console.warn('[NeverquestDialogBox] setText called with undefined/null text - using empty string', {
				text,
				animate,
			});
			text = '';
		}

		console.log('[NeverquestDialogBox] setText called', {
			textLength: text.length,
			animate,
			dialogExists: !!this.dialog,
			textMessageExists: !!this.dialog?.textMessage,
			textMessageActive: this.dialog?.textMessage?.active,
			wasAnimating: this.isAnimatingText,
		});

		// IMPORTANT: Stop any existing animation first
		if (this.timedEvent) {
			this.timedEvent.destroy();
			this.timedEvent = null;
			console.log('[NeverquestDialogBox] Stopped existing timer');
		}

		// Reset the dialog
		this.eventCounter = 0;
		this.animationText = text.split('');

		if (animate) {
			this.isAnimatingText = true;
			if (this.dialog && this.dialog.textMessage) {
				this.dialog.textMessage.visible = true;
				this.dialog.textMessage.setText(''); // Clear text before animation starts
			}
			this.timedEvent = this.scene.time.addEvent({
				delay: this.typewriterDelay,
				callback: this.animateText,
				callbackScope: this,
				repeat: this.animationText.length - 1,
			});
			console.log('[NeverquestDialogBox] Started text animation with delay:', this.typewriterDelay);
		} else {
			this.isAnimatingText = false;
			if (this.dialog && this.dialog.textMessage) {
				this.dialog.textMessage.visible = true;
				this.dialog.textMessage.setText(text);
				console.log('[NeverquestDialogBox] Text set directly (no animation):', text.substring(0, 50));
			} else {
				console.warn('[NeverquestDialogBox] Cannot set text - dialog or textMessage is null', {
					dialogExists: !!this.dialog,
					textMessageExists: !!this.dialog?.textMessage,
				});
			}
		}
	}

	/**
	 * Animate text character by character (typewriter effect)
	 */
	animateText(): void {
		if (!this.dialog || !this.dialog.textMessage) {
			console.warn('[NeverquestDialogBox] animateText called but dialog or textMessage is null - skipping', {
				dialogExists: !!this.dialog,
				textMessageExists: !!this.dialog?.textMessage,
			});
			return;
		}

		this.eventCounter++;
		this.dialog.textMessage.setText(this.dialog.textMessage.text + this.animationText[this.eventCounter - 1]);
		this.neverquestTypingSoundManager.type(this.animationText[this.eventCounter - 1]);

		// Stops the text animation.
		if (this.eventCounter === this.animationText.length) {
			console.log('[NeverquestDialogBox] Text animation completed');
			this.isAnimatingText = false;
			this.timedEvent?.remove();
		}
	}

	/**
	 * Main update loop for dialog system
	 */
	checkUpdate(): void {
		if (this.actionButton && this.player) {
			// Always check for dialog button interactions when dialog system is active
			// This allows fast-forwarding and dialog advancement even when canShowDialog is false
			this.checkButtonDown();
		}
	}

	/**
	 * Check for button presses to advance dialog
	 */
	checkButtonDown(): void {
		// Fast-forward: Skip animation if space is pressed during typing
		if (this.isAnimatingText) {
			console.log('[NeverquestDialogBox] Currently animating, checking for fast-forward...', {
				buttonPressed: this.checkButtonsPressed(),
				keyDown: this.keyObj.isDown,
				currentPage: this.currentPage,
				hasPages: this.pagesMessage.length > 0,
			});

			if (this.checkButtonsPressed()) {
				console.log('[NeverquestDialogBox] ⚡ Fast-forwarding text animation!');
				this.setText(this.pagesMessage[this.currentPage], false);
				this.justFastForwarded = true;
				return; // Exit early to prevent other actions
			}
		}

		// Clear fast-forward flag if button is released
		if (this.justFastForwarded && !this.checkButtonsPressed()) {
			this.justFastForwarded = false;
			console.log('[NeverquestDialogBox] Button released after fast-forward');
			return; // Don't advance yet, wait for next press
		}

		// If we just fast-forwarded and button is still held, don't advance
		if (this.justFastForwarded) {
			return;
		}

		// Only advance on new button press (JustPressed)
		const shouldAdvance = this.checkButtonsJustPressed();

		if (!shouldAdvance) {
			return; // No new button press, exit early
		}

		if ((this.isOverlapingChat || this.showRandomChat) && !this.dialog.visible) {
			// First time, show the Dialog.
			console.log('[NeverquestDialogBox] Opening dialog (first time)');
			this.currentChat = this.chat[0];
			this.dialogMessage = this.currentChat.message;
			this.checkSpeaker();
			this.showDialog();
			if (this.player.container.body && 'maxSpeed' in this.player.container.body) {
				(this.player.container.body as Phaser.Physics.Arcade.Body).maxSpeed = 0;
			}
			// Disable player input capabilities during dialog
			this.player.canMove = false;
			console.log('[DialogBox] Setting canAtack = false (starting dialog)');
			this.player.canAtack = false;
			this.player.canBlock = false;
		} else if (
			!this.isAnimatingText &&
			this.currentPage !== this.pagesNumber - 1 &&
			this.dialog.visible &&
			this.dialog.textMessage &&
			this.dialog.textMessage.active
		) {
			// Has more pages.
			console.log(`[NeverquestDialogBox] Advancing to next page (${this.currentPage + 1}/${this.pagesNumber})`);
			this.currentPage++;
			this.dialog.textMessage.text = '';
			this.setText(this.pagesMessage[this.currentPage], true);
		} else if (this.currentChat && this.currentChat.index < this.chat.length - 1) {
			// Advance to next chat message
			const index = this.currentChat.index;
			console.log(`[NeverquestDialogBox] Advancing to next chat message (${index + 1}/${this.chat.length})`);
			this.currentChat = this.chat[index + 1];
			this.dialogMessage = this.currentChat.message;
			this.pagesMessage = [];
			this.setText('', false);
			this.showDialog(false);
		} else if (this.dialog.visible && this.dialog.textMessage && this.dialog.textMessage.active) {
			// Close dialog
			console.log('[NeverquestDialogBox] Closing dialog (final page)');
			this.hideDialog();
		}
	}

	/**
	 * Show dialog with optional text creation
	 */
	showDialog(createText: boolean = true): void {
		console.log('[NeverquestDialogBox] showDialog called', {
			createText,
			textMessageExists: !!this.dialog?.textMessage,
			pagesCount: this.pagesMessage.length,
			firstPage: this.pagesMessage[0],
			dialogMessage: this.dialogMessage,
		});
		this.currentPage = 0;
		this.dialog.visible = true;
		// Show the black background rectangle
		if ((this.dialog as any).backgroundRect) {
			(this.dialog as any).backgroundRect.visible = true;
		}
		this.canShowDialog = false;

		// Create pages if necessary
		if (createText) this.createText();

		// Populate pagesMessage from dialogMessage if it's empty
		// (For now, we treat the entire message as a single page)
		if (this.pagesMessage.length === 0 && this.dialogMessage) {
			console.log('[NeverquestDialogBox] pagesMessage empty, populating from dialogMessage');
			this.pagesMessage = [this.dialogMessage];
			this.pagesNumber = 1;
		}

		// Animate the text - but only if we have pages to show
		if (this.pagesMessage.length > 0) {
			this.setText(this.pagesMessage[0], true);
		} else {
			console.warn(
				'[NeverquestDialogBox] showDialog called but pagesMessage is empty and no dialogMessage - cannot set text'
			);
		}
	}

	/**
	 * Hide dialog and reset state to allow re-triggering
	 */
	hideDialog(): void {
		console.log('[NeverquestDialogBox] Hiding dialog');

		// Hide UI elements
		this.dialog.visible = false;
		// Hide the black background rectangle
		if ((this.dialog as any).backgroundRect) {
			(this.dialog as any).backgroundRect.visible = false;
		}
		if (this.dialog.textMessage) {
			this.dialog.textMessage.visible = false;
		}
		this.actionButton.visible = false;
		this.interactionIcon.visible = false;

		// Hide portrait images and name texts
		if (this.leftPortraitImage) {
			this.leftPortraitImage.visible = false;
		}
		if (this.rightPortraitImage) {
			this.rightPortraitImage.visible = false;
		}
		if (this.leftNameText) {
			this.leftNameText.visible = false;
		}
		if (this.rightNameText) {
			this.rightNameText.visible = false;
		}

		this.isOverlapingChat = false;
		this.showRandomChat = false;

		// Clean up chat state
		this.chat = [];
		this.currentChat = null;
		this.dialogMessage = '';
		this.pagesMessage = [];
		this.pagesNumber = 0;
		this.currentPage = 0;

		// CRITICAL: Reset canShowDialog to allow dialog to be triggered again
		this.canShowDialog = true;

		// Re-enable player controls
		if (this.player.container.body && 'maxSpeed' in this.player.container.body) {
			(this.player.container.body as Phaser.Physics.Arcade.Body).maxSpeed = this.player.speed;
		}
		console.log('[DialogBox] Re-enabling player controls after dialog close', {
			beforeCanAtack: this.player.canAtack,
			beforeCanMove: this.player.canMove,
			beforeCanBlock: this.player.canBlock,
		});
		this.player.canMove = true;
		this.player.canAtack = true;
		this.player.canBlock = true;
		console.log('[DialogBox] Player controls re-enabled', {
			afterCanAtack: this.player.canAtack,
			afterCanMove: this.player.canMove,
			afterCanBlock: this.player.canBlock,
			dialogVisible: this.dialog.visible,
		});

		// Emit event
		this.scene.events.emit('dialogComplete');
	}

	/**
	 * Create text element for dialog
	 */
	createText(): void {
		console.log('[NeverquestDialogBox] createText called - creating new textMessage element');
		this.dialog.textMessage = this.scene.add.text(
			this.margin * 2,
			this.dialog.y + this.margin * DialogBox.MARGIN_MULTIPLIER_TEXT_Y,
			'',
			{
				wordWrap: {
					width: this.textWidth,
				},
				fontSize: this.fontSize,
				fontFamily: this.fontFamily,
				color: this.fontColor.rgba,
			}
		) as IDialogTextMessage;

		this.dialog.textMessage.setScrollFactor(0, 0).setDepth(Depth.TOP).setOrigin(0, 0);
		console.log('[NeverquestDialogBox] textMessage created successfully', {
			exists: !!this.dialog.textMessage,
			active: this.dialog.textMessage?.active,
		});
	}

	/**
	 * Handle speaker configuration (left/right character portraits)
	 */
	checkSpeaker(): void {
		this.resetSpeakersAlpha();

		if (this.currentChat?.left) {
			if (this.currentChat.leftName) {
				this.leftNameText.visible = true;
				this.leftNameText.setText(DialogBoxMessages.LEFT_NAME_PREFIX(this.currentChat.leftName));
			} else {
				this.leftNameText.visible = false;
			}
			if (this.currentChat.leftPortraitName) {
				this.leftPortraitImage.visible = true;
				this.leftPortraitImage.setTexture(this.currentChat.leftPortraitName);
			} else {
				this.leftPortraitImage.visible = false;
			}
			this.leftNameText.alpha = 1;
			this.leftPortraitImage.alpha = 1;
		}

		if (this.currentChat?.right) {
			this.rightNameText.setText(DialogBoxMessages.RIGHT_NAME_PREFIX(this.currentChat.rightName!));
			this.rightPortraitImage.setTexture(this.currentChat.rightPortraitName!);
			this.rightNameText.visible = true;
			this.rightPortraitImage.visible = true;
			this.rightNameText.alpha = 1;
			this.rightPortraitImage.alpha = 1;
		}
	}

	/**
	 * Reset speaker opacity
	 */
	resetSpeakersAlpha(): void {
		this.leftNameText.alpha = Alpha.HALF;
		this.leftPortraitImage.alpha = Alpha.HALF;
		this.rightNameText.alpha = Alpha.HALF;
		this.rightPortraitImage.alpha = Alpha.HALF;
	}

	/**
	 * Check if dialog is currently active and should block other inputs
	 */
	isDialogActive(): boolean {
		return this.dialog?.visible === true || this.isOverlapingChat || this.showRandomChat;
	}

	/**
	 * Handle component resizing
	 */
	resizeComponents(width: number, height: number): void {
		if (width !== 0 && height !== 0 && this.player && this.player.active) {
			this.cameraWidth = width;
			this.cameraHeight = height;
			this.textWidth = this.cameraWidth - this.margin * 3;
			// Position 30% down from the top of the viewport
			const dialogY = this.cameraHeight * 0.3;
			this.dialog.x = this.margin;
			this.dialog.y = dialogY;
			this.dialog.setSize(this.cameraWidth - this.margin * 2, this.dialogHeight);

			// Update background rectangle position and size
			if ((this.dialog as any).backgroundRect) {
				const bgRect = (this.dialog as any).backgroundRect;
				bgRect.x = this.margin;
				bgRect.y = dialogY;
				bgRect.width = this.cameraWidth - this.margin * 2;
				bgRect.height = this.dialogHeight;
			}

			if (this.dialog.textMessage && this.dialog.textMessage.visible) {
				this.dialog.textMessage.setPosition(this.dialog.textMessage.x, this.leftNameText.y + 30);
				this.dialog.textMessage.setStyle({
					wordWrap: {
						width: this.textWidth,
					},
				});
			}
		}
	}
}
