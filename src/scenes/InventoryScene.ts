import Phaser from 'phaser';
import { InfoBox } from '../components/InfoBox';
import { PanelComponent } from '../components/PanelComponent';
import { Item } from '../entities/Item';
import { NeverquestInterfaceController } from '../plugins/NeverquestInterfaceController';
import { NeverquestUtils } from '../utils/NeverquestUtils';
import { Player } from '../entities/Player';
import { AnimationTiming, Dimensions, FontFamilies, Scale } from '../consts/Numbers';
import { WarningMessages } from '../consts/Messages';

export const InventorySceneName = 'InventoryScene';

interface InventorySlot extends Phaser.GameObjects.Image {
	item?: Item;
	text?: Phaser.GameObjects.Text;
	playerItemIndex?: number;
}

/**
 * @class
 */
export class InventoryScene extends Phaser.Scene {
	/**
	 * The player that will have it's inventoro opened.
	 */
	player!: Player;

	/**
	 * The name of the sprite texture of the Inventory Slot.
	 * @default
	 */
	inventorySlotTexture: string;

	/**
	 * The inventory background sprite.
	 */
	inventoryBackground: any;

	/**
	 * The inventory title sprite.
	 */
	inventoryTitle: any;

	/**
	 * The inventory title sprite.
	 */
	inventoryTitleText: any;

	/**
	 * The inventory slots sprite.
	 */
	inventorySlots: any;

	/**
	 * The Close button image.
	 */
	closeButton: any;

	/**
	 * The slots and its content.
	 */
	slots: InventorySlot[];

	/**
	 * The screen padding of the inventory when it's Mobile.
	 * @default
	 */
	screenPaddingMobile: number;

	/**
	 * The padding between the Background edge and the Slots.
	 * @default
	 */
	backgroundSlotPadding: number;

	/**
	 * The Padding of the Slots to the Top of the Inventory Background.
	 * @default
	 */
	backgroundSlotPaddingTop: number;

	/**
	 * The Padding of the Slots to the Bottom of the Inventory Background.
	 * @default
	 */
	backgroundSlotPaddingBottom: number;

	/**
	 * The margin between inventory slots.
	 * @default
	 */
	slotMargin: number;

	/**
	 * The size of the Slot. Width and Height.
	 * @default
	 */
	slotSize: number;

	/**
	 * The space separate for legend height.
	 */
	legendHeight: number;

	/**
	 * The default font family of the Inventory Text.
	 * @default
	 */
	titleFontFamily: string;

	/**
	 * The close and open sound of the inventory.
	 * @default
	 */
	inventoryOpenClose: string;

	/**
	 * The name of the texture of the action button legend for desktop.
	 */
	actionButtonSpriteNameDesktop: string;
	/**
	 * The name of the texture of the action button legend for console.
	 */
	actionButtonSpriteNameConsole: string;

	/**
	 * The name of the texture of the back button legend for desktop.
	 */
	backButtonDesktopSpriteName: string;

	/**
	 * The name of the texture of the back button legend for console.
	 */
	backButtonLegendConsole: string;

	/**
	 * The name of the texture of the description button legend for desktop.
	 */
	descriptionButtonLegendDesktop: string;

	/**
	 * The name of the texture of the description button legend for console.
	 */
	descriptionButtonLegendConsole: string;

	/**
	 * The class that will control the interface.
	 */
	neverquestInterfaceController!: NeverquestInterfaceController;

	isReset: boolean;

	/**
	 * @type { NeverquestInterfaceController }
	 */
	cachedInterfaceControler: NeverquestInterfaceController | null;

	/**
	 * The information box for
	 */
	helpPanel: InfoBox | null;

	/**
	 * The back button sprite.
	 */
	backButtonLegend!: any;

	panelComponent!: PanelComponent;

	actionButtonLegend!: any;

	descriptionButtonLegend!: any;

	constructor() {
		super({
			key: InventorySceneName,
		});

		this.inventorySlotTexture = 'inventory_slot';
		this.inventoryBackground = null;
		this.inventoryTitle = null;
		this.inventoryTitleText = null;
		this.inventorySlots = null;
		this.closeButton = null;
		this.slots = [];
		this.screenPaddingMobile = 15;
		this.backgroundSlotPadding = 25;
		this.backgroundSlotPaddingTop = 100;
		this.backgroundSlotPaddingBottom = 20;
		this.slotMargin = 10;
		this.slotSize = 53;
		this.legendHeight = 50;
		this.titleFontFamily = FontFamilies.PRESS_START_2P;
		this.inventoryOpenClose = 'inventory_cloth';
		this.actionButtonSpriteNameDesktop = 'enter_keyboard_key';
		this.actionButtonSpriteNameConsole = 'buttonA';
		this.backButtonDesktopSpriteName = 'esc_keyboard_key';
		this.backButtonLegendConsole = 'buttonB';
		this.descriptionButtonLegendDesktop = 'h_keyboard_key';
		this.descriptionButtonLegendConsole = 'buttonY';
		this.isReset = false;
		this.cachedInterfaceControler = null;
		this.helpPanel = null;
	}

	create(): void {
		// Prevent that the panel is open.
		this.destroyHelpPanel();
		this.neverquestInterfaceController = new NeverquestInterfaceController(this);
		this.panelComponent = new PanelComponent(this);
		this.inventoryBackground = this.panelComponent.panelBackground;
		this.inventoryTitle = this.panelComponent.panelTitle;
		this.inventoryTitleText = this.panelComponent.panelTitleText;
		this.createSlots();
		this.createCloseButton();
		this.createItems();
		if (!NeverquestUtils.isMobile() || (NeverquestUtils.isMobile() && this.input.gamepad!.pad1))
			this.createLegendSection();
		if (this.input.gamepad!.pad1) {
			this.registerGamepad();
			this.setGamepadTextures();
		}

		this.input.gamepad!.on('connected', () => {
			this.registerGamepad();
			this.setGamepadTextures();
		});
		this.input.gamepad!.on('disconnected', () => {
			this.backButtonLegend.setTexture(this.backButtonDesktopSpriteName);
		});

		if (!this.isReset) this.sound.play(this.inventoryOpenClose);
		this.scale.on('resize', (resize: Phaser.Structs.Size) => {
			this.resizeAll(resize);
		});

		if (this.cachedInterfaceControler) {
			this.neverquestInterfaceController.recoverPositionFromPrevious(this.cachedInterfaceControler);
		}

		this.registerKeyboardShortcuts();

		// Position everything correctly on initial create
		this.resizeAll();
	}

	registerKeyboardShortcuts(): void {
		this.input.keyboard!.on('keydown', (key: KeyboardEvent) => {
			if (key.keyCode === 72) {
				this.toggleInfoBox();
			}
		});
	}
	/**
	 * Registers the gamepad inputs.
	 */
	registerGamepad(): void {
		this.input.gamepad!.pad1!.on('down', (pad: number) => {
			if (pad === 3) {
				this.toggleInfoBox();
			}
		});
	}

	/**
	 * Toggles info / description box of the item.
	 */
	toggleInfoBox(): void {
		if (!this.helpPanel) {
			const slot = this.neverquestInterfaceController.currentElementAction.element as InventorySlot;
			if (slot.item) {
				this.createInfoBox(slot);
			}
		} else {
			this.destroyHelpPanel();
		}
	}

	createInfoBox(slot: InventorySlot): void {
		this.helpPanel = new InfoBox(
			this,
			slot.x + slot.width / 2,
			slot.y + slot.height / 2,
			Dimensions.INFOBOX_WIDTH,
			Dimensions.INFOBOX_HEIGHT,
			{
				name: slot.item!.name,
				description: slot.item!.description,
			}
		);
	}

	/**
	 * Sets the GamePad Textures.
	 * If the gamepad is connected, it should use the gamepad textures.
	 */
	setGamepadTextures(): void {
		if (this && this.sys && this.backButtonLegend) this.backButtonLegend.setTexture(this.backButtonLegendConsole);
		if (this && this.sys && this.actionButtonLegend)
			this.actionButtonLegend.setTexture(this.actionButtonSpriteNameConsole);
		if (this && this.sys && this.descriptionButtonLegend)
			this.descriptionButtonLegend.setTexture(this.descriptionButtonLegendConsole);
	}

	/**
	 * Creates the close Button.
	 */
	createCloseButton(): void {
		this.closeButton = this.panelComponent.closeButton;

		this.closeButton.on('pointerup', () => {
			this.stopScene();
		});

		this.neverquestInterfaceController.interfaceElements[0] = [];
		this.neverquestInterfaceController.interfaceElements[0][0] = [];
		const firstAction = {
			element: this.closeButton,
			action: 'stopScene',
			context: this,
			args: 'InventoryScene',
		};
		this.neverquestInterfaceController.closeAction = firstAction;
		this.neverquestInterfaceController.interfaceElements[0][0].push(firstAction);
	}

	stopScene(): void {
		this.sound.play(this.inventoryOpenClose);
		this.player.canMove = true;
		this.player.canAtack = true;
		this.scene.stop();
	}

	/**
	 * Destroys all the Slots and its dependencies.
	 */
	destroySlots(): void {
		if (this.slots.length > 0) {
			this.slots.forEach((slot) => {
				if (slot.item) {
					slot.item.destroy();
					slot.text!.destroy();
				}
				slot.destroy();
			});
		}
		this.slots = [];
	}

	/**
	 * Creates the inventory Slots.
	 */
	createSlots(): void {
		// Checks if there is any already created slots. If there is, it should destroy them bofore creating new ones.
		this.destroySlots();
		// The available space for the slots to be drawn.
		const slotsWorkingWidth = Math.abs(
			this.backgroundSlotPadding * 2 - this.inventoryBackground.width * this.inventoryBackground.scaleX
		);

		// Max number of Slots taking in count the Available space, Slot Size and Margin.
		const slotsNumberHorizontal = Math.floor(slotsWorkingWidth / (this.slotSize + this.slotMargin));

		const padding = Math.ceil(
			(this.inventoryBackground.width * this.inventoryBackground.scaleX -
				slotsNumberHorizontal * (this.slotSize + this.slotMargin)) /
				2
		);

		let slotsWorkingHeight = Math.abs(
			this.inventoryBackground.height * this.inventoryBackground.scaleY -
				this.backgroundSlotPaddingTop -
				this.backgroundSlotPaddingBottom
		);

		if (!NeverquestUtils.isMobile() || (NeverquestUtils.isMobile() && this.input.gamepad!.pad1))
			slotsWorkingHeight = slotsWorkingHeight - this.legendHeight; // Pixels for Legends.

		// Max number of Slots taking in count the Available space, Slot Size and Margin.
		const slotsNumberVertical = Math.floor(slotsWorkingHeight / (this.slotSize + this.slotMargin));

		// Creates the seccond line
		this.neverquestInterfaceController.interfaceElements[1] = [];
		for (let row = 0; row < slotsNumberVertical; row++) {
			this.neverquestInterfaceController.interfaceElements[1][row] = [];
			for (let col = 0; col < slotsNumberHorizontal; col++) {
				const slot = this.add
					.image(
						this.inventoryBackground.x +
							(this.slotSize + this.slotMargin) * col +
							padding +
							this.slotMargin / 2,
						this.inventoryBackground.y +
							(this.slotSize + this.slotMargin) * row +
							this.backgroundSlotPaddingTop,
						this.inventorySlotTexture
					)
					.setScrollFactor(0, 0)
					.setOrigin(0, 0) as InventorySlot;
				this.slots.push(slot);

				const element = {
					element: slot,
					action: 'useItem',
					context: this,
					args: slot,
				};
				this.neverquestInterfaceController.interfaceElements[1][row].push(element);

				if (row === 0 && col === 0) {
					this.neverquestInterfaceController.currentElementAction = element;
					if (!NeverquestUtils.isMobile() || (NeverquestUtils.isMobile() && this.input.gamepad!.pad1))
						this.neverquestInterfaceController.updateHighlightedElement(element.element);
					this.neverquestInterfaceController.currentLinePosition = 1;
				}
			}
		}
	}

	/**
	 * When resizing, it should change the position of the slots acordingly.
	 */
	setPositionSlotsItems(): void {
		// The available space for the slots to be drawn.
		const slotsWorkingWidth = Math.abs(
			this.backgroundSlotPadding * 2 - this.inventoryBackground.width * this.inventoryBackground.scaleX
		);

		// Max number of Slots taking in count the Available space, Slot Size and Margin.
		const slotsNumberHorizontal = Math.floor(slotsWorkingWidth / (this.slotSize + this.slotMargin));

		const padding = Math.ceil(
			(this.inventoryBackground.width * this.inventoryBackground.scaleX -
				slotsNumberHorizontal * (this.slotSize + this.slotMargin)) /
				2
		);

		const slotsWorkingHeight = Math.abs(
			this.inventoryBackground.height * this.inventoryBackground.scaleY -
				this.backgroundSlotPaddingTop -
				this.backgroundSlotPaddingBottom
		);

		// Max number of Slots taking in count the Available space, Slot Size and Margin.
		const slotsNumberVertical = Math.floor(slotsWorkingHeight / (this.slotSize + this.slotMargin));

		let count = 0;
		for (let row = 0; row < slotsNumberVertical; row++) {
			for (let col = 0; col < slotsNumberHorizontal; col++) {
				const slot = this.slots[count];
				if (slot) {
					slot.setPosition(
						this.inventoryBackground.x +
							(this.slotSize + this.slotMargin) * col +
							padding +
							this.slotMargin / 2,
						this.inventoryBackground.y +
							(this.slotSize + this.slotMargin) * row +
							this.backgroundSlotPaddingTop
					);
					if (slot.item) {
						const item = slot.item;
						slot.item.setPosition(slot.x + slot.width / 2, slot.y + slot.height / 2 - 7);
						slot.text!.setPosition(item.x, item.y + 10 + (item.height * item.scaleY) / 2);
					}
					count++;
				}
			}
		}
	}

	/**
	 * Clears all slots items before creating them again.
	 */
	// clearSlots() {
	//     this.slots.forEach((slot) => {
	//         if (slot.item) slot.item.destroy();
	//         if (slot.text) slot.text.destroy();
	//     });
	// }

	/**
	 * Loops through the Player's items and Adds it to the inventory Slots
	 */
	createItems(): void {
		// this.clearSlots();
		let slotIndex = 0;
		let time = 0;
		for (let i = 0; i < this.player.items.length; i++) {
			// Check if we have enough slots
			if (slotIndex >= this.slots.length) {
				console.warn(WarningMessages.INVENTORY_SLOTS_FULL(this.slots.length, this.player.items.length));
				break;
			}
			const slot = this.slots[slotIndex];
			slotIndex++;
			if (this.player.items[i] && this.player.items[i].id && slot) {
				const item = new Item(
					this,
					slot.x + slot.width / 2,
					slot.y + slot.height / 2 - 7,
					this.player.items[i].id
				);
				const text = this.add
					.text(item.x, item.y + 15 + (item.height * item.scaleY) / 2, this.player.items[i].count.toString())
					.setOrigin(0.5, 0.5);
				// Sets the slot item;
				slot.item = item;
				// Sets the Text.
				slot.text = text;
				slot.playerItemIndex = i;
				if (item.stackable) {
					slot.setInteractive();
					slot.on('pointerover', () => {
						if (!this.helpPanel && !this.input.gamepad!.pad1) {
							this.createInfoBox(slot);
						}
					});
					slot.on('pointerout', () => {
						if (this.helpPanel && !this.input.gamepad!.pad1) {
							this.destroyHelpPanel();
						}
					});
					slot.on('pointerup', (pointer: Phaser.Input.Pointer) => {
						// IF it is mobile or controller is connected, Show the information box.
						const element = {
							element: slot,
							action: 'useItem',
							context: this,
							args: slot,
						};
						this.neverquestInterfaceController.currentElementAction = element;
						if (time === 0) {
							time = pointer.upTime;
							return;
						}
						const elapsed = Math.abs(time - pointer.upTime);
						if (elapsed < AnimationTiming.DOUBLE_CLICK_TIMEOUT) {
							this.useItem(slot);
							time = 0;
						} else {
							time = 0;
						}
					});
					item.setScale(item.inventoryScale);
				} else {
					for (let noStackCount = 0; noStackCount < this.player.items[i].count; noStackCount++) {
						// TODO - Create the logic for Equipments.
					}
				}
			}
		}
	}

	destroyHelpPanel(): void {
		if (this.helpPanel) {
			this.helpPanel.backgroundSprite.destroy();
			this.helpPanel.name.destroy();
			this.helpPanel.description.destroy();
			this.helpPanel = null;
		}
	}

	createLegendSection(): void {
		this.actionButtonLegend = this.add.sprite(
			this.inventoryBackground.x + this.backgroundSlotPadding + this.slotMargin,
			this.inventoryBackground.y + this.inventoryBackground.height - this.legendHeight,
			this.actionButtonSpriteNameDesktop
		);
		this.actionButtonLegend.setOrigin(0, 0.5);
		this.actionButtonLegend.setDisplaySize(35, 35);

		this.actionButtonLegend.text = this.add.text(
			this.actionButtonLegend.x +
				this.actionButtonLegend.width * this.actionButtonLegend.scaleX +
				this.slotMargin,
			this.actionButtonLegend.y,
			'Use/Action'
		);

		this.actionButtonLegend.text.setOrigin(0, 0.5);

		//////
		this.descriptionButtonLegend = this.add.sprite(
			this.actionButtonLegend.text.x +
				this.actionButtonLegend.text.width * this.actionButtonLegend.text.scaleX +
				this.slotMargin,
			this.actionButtonLegend.text.y,
			this.descriptionButtonLegendDesktop
		);
		this.descriptionButtonLegend.setOrigin(0, 0.5);
		this.descriptionButtonLegend.setDisplaySize(35, 35);

		this.descriptionButtonLegend.text = this.add.text(
			this.descriptionButtonLegend.x +
				this.descriptionButtonLegend.width * this.descriptionButtonLegend.scaleX +
				this.slotMargin,
			this.descriptionButtonLegend.y,
			'Show Info'
		);
		this.descriptionButtonLegend.text.setOrigin(0, 0.5);
		////

		this.backButtonLegend = this.add.sprite(
			this.descriptionButtonLegend.text.x +
				this.descriptionButtonLegend.text.width * this.descriptionButtonLegend.text.scaleX +
				this.slotMargin,
			this.descriptionButtonLegend.text.y,
			this.backButtonDesktopSpriteName
		);
		this.backButtonLegend.setOrigin(0, 0.5);
		this.backButtonLegend.setDisplaySize(35, 35);

		this.backButtonLegend.text = this.add.text(
			this.backButtonLegend.x + this.backButtonLegend.width * this.backButtonLegend.scaleX + this.slotMargin,
			this.backButtonLegend.y,
			'Back'
		);
		this.backButtonLegend.text.setOrigin(0, 0.5);

		if (this.input.gamepad!.pad1) this.setGamepadTextures();
	}

	useItem(slot: InventorySlot): void {
		if (slot && slot.item) {
			const text = slot.text!;
			const i = slot.playerItemIndex!;
			slot.item.consume(this.player);
			if (this.player.items[i]) {
				this.player.items[i].count--;
				if (this.player.items[i].count <= 0) {
					slot.item.destroy();
					// this.neverquestInterfaceController.currentElementAction.action = null;
					this.player.items.splice(i, 1);
					text.setText('');
					text.destroy();
					this.scene.restart({
						player: this.player,
						isReset: true,
						interfaceControler: this.neverquestInterfaceController,
					});
					// TODO - Rearange the items.
				} else {
					text.setText(this.player.items[i].count.toString());
				}
			}
		}
	}

	/**
	 *
	 * @param args The initial arguments.
	 */
	init(args: any): void {
		this.player = args.player;
		this.player.canMove = false;
		this.player.canAtack = false;
		if (args.isReset) {
			this.isReset = true;
			this.cachedInterfaceControler = args.interfaceControler;
		}
	}

	update(): void {}

	/**
	 * Resizes everything
	 * @param size the new size.
	 */
	resizeAll(_size?: Phaser.Structs.Size): void {
		if (this.cameras && this.cameras.main) {
			this.inventoryBackground.setPosition(
				this.cameras.main.midPoint.x - 512 / 2,
				this.cameras.main.midPoint.y - 512 / 2
			);

			this.inventoryTitle.setPosition(
				this.inventoryBackground.x + this.inventoryBackground.width / 2,
				this.inventoryBackground.y + 54
			);

			this.inventoryTitleText.setPosition(this.inventoryTitle.x + 11, this.inventoryTitle.y + 7);

			this.closeButton.setPosition(
				this.inventoryBackground.x +
					this.inventoryBackground.width * this.inventoryBackground.scaleX -
					this.backgroundSlotPadding * Scale.LARGE,
				this.inventoryBackground.y + this.backgroundSlotPadding * Scale.LARGE
			);
			if (this.actionButtonLegend)
				this.actionButtonLegend.setPosition(
					this.inventoryBackground.x + this.backgroundSlotPadding + this.slotMargin,
					this.inventoryBackground.y + this.inventoryBackground.height - this.legendHeight
				);

			if (this.actionButtonLegend.text)
				this.actionButtonLegend.text.setPosition(
					this.actionButtonLegend.x +
						this.actionButtonLegend.width * this.actionButtonLegend.scaleX +
						this.slotMargin,
					this.actionButtonLegend.y
				);
			if (this.descriptionButtonLegend)
				this.descriptionButtonLegend.setPosition(
					this.actionButtonLegend.text.x +
						this.actionButtonLegend.text.width * this.actionButtonLegend.text.scaleX +
						this.slotMargin,
					this.actionButtonLegend.text.y
				);
			if (this.descriptionButtonLegend.text)
				this.descriptionButtonLegend.text.setPosition(
					this.descriptionButtonLegend.x +
						this.descriptionButtonLegend.width * this.descriptionButtonLegend.scaleX +
						this.slotMargin,
					this.descriptionButtonLegend.y
				);

			if (this.backButtonLegend)
				this.backButtonLegend.setPosition(
					this.descriptionButtonLegend.text.x +
						this.descriptionButtonLegend.text.width * this.descriptionButtonLegend.text.scaleX +
						this.slotMargin,
					this.descriptionButtonLegend.text.y
				);
			if (this.backButtonLegend.text)
				this.backButtonLegend.text.setPosition(
					this.backButtonLegend.x +
						this.backButtonLegend.width * this.backButtonLegend.scaleX +
						this.slotMargin,
					this.backButtonLegend.y
				);

			this.setPositionSlotsItems();
		}
	}
}
