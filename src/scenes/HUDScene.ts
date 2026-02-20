/**
 * @fileoverview Heads-up display (HUD) overlay scene for Neverquest
 *
 * This scene renders persistent UI elements over gameplay:
 * - Health and XP progress bars
 * - Minimap display
 * - Message log for combat feedback
 * - Quick access buttons (inventory, attributes)
 * - Touch controls reference
 *
 * Runs parallel to gameplay scenes and tracks player state.
 * Updates automatically when player health/XP changes.
 *
 * @see NeverquestHUDProgressBar - Health/XP bar rendering
 * @see NeverquestMinimap - Minimap display
 * @see NeverquestMessageLog - Combat message log
 * @see Player - State source for UI updates
 *
 * @module scenes/HUDScene
 */

import Phaser from 'phaser';
import { IconNamesConst } from '../consts/UI/IconNames';
import { NeverquestHUDProgressBar } from '../plugins/HUD/NeverquestHUDProgressBar';
import { NeverquestMessageLog } from '../plugins/HUD/NeverquestMessageLog';
import { NeverquestMinimap } from '../plugins/HUD/NeverquestMinimap';
import { NeverquestUtils } from '../utils/NeverquestUtils';
import { AttributeSceneName } from './AttributeScene';
import { InventorySceneName } from './InventoryScene';
import { SceneToggleWatcher } from './watchers/SceneToggleWatcher';
import { Player } from '../entities/Player';
import { HexColors } from '../consts/Colors';
import { Dimensions, Scale } from '../consts/Numbers';
import { UILabels } from '../consts/Messages';
import { NeverquestSaveManager } from '../plugins/NeverquestSaveManager';
import { NeverquestMapCreator } from '../plugins/NeverquestMapCreator';

/**
 * Interface for scenes that have a save manager
 */
interface SceneWithSaveManager extends Phaser.Scene {
	saveManager?: NeverquestSaveManager | null;
}

/**
 * Interface for scenes that have a map creator or dungeon
 */
interface SceneWithMap extends Phaser.Scene {
	mapCreator?: NeverquestMapCreator | null;
	dungeon?: { map?: Phaser.Tilemaps.Tilemap };
}

/**
 * Type for accessing private minimap properties for reset capability
 * This is used to reset debug logging when the map changes
 */
type MinimapWithPrivateAccess = {
	hasLoggedOnce?: boolean;
};

/**
 * Interface for HUD scene initialization arguments
 */
interface IHUDSceneArgs {
	player: Player;
	map?: Phaser.Tilemaps.Tilemap;
}

/**
 * Scene for HUD Creation. It contains all the HUD of the game.
 * @class
 */
export class HUDScene extends Phaser.Scene {
	/**
	 * The Player game Object.
	 */
	player!: Player;

	/**
	 * The tilemap for minimap rendering
	 */
	map?: Phaser.Tilemaps.Tilemap;

	/**
	 * The minimap component
	 */
	minimap?: NeverquestMinimap;

	/**
	 * Maximize image/sprite name.
	 * @default
	 */
	maximizeSpriteName: string;

	/**
	 * The offset of the x position. Take in account that the x position will be from right to left side.
	 */
	baseSpriteOffsetX: number;

	/**
	 * Maximize image/sprite offset X;
	 * @default
	 */
	maximizeSpriteOffsetX: number;

	/**
	 * Maximize image/sprite offset y;
	 * @default
	 */
	maximizeSpriteOffsetY: number;

	baseSpriteOffsetY: number;

	/**
	 * Settings image/sprite name.
	 * @default
	 */
	settingsSpriteName: string;

	/**
	 * Maximize image/sprite offset X;
	 * @default
	 */
	settingsSpriteOffsetX: number;

	/**
	 * Maximize image/sprite offset y;
	 * @default
	 */
	settingsSpriteOffsetY: number;

	/**
	 * Inventory image/sprite name.
	 * @default
	 */
	inventorySpriteName: string;

	/**
	 * Inventory image/sprite offset X;
	 * @default
	 */
	inventorySpriteOffsetX: number;

	/**
	 * Inventory image/sprite offset y;
	 * @default
	 */
	inventorySpriteOffsetY: number;

	/**
	 * The default Scale of the inventory icon.
	 * @default
	 */
	inventorySpriteScale: number;

	/**
	 * The maximixe Image that will change the resolution.
	 * @default
	 */
	maximize!: Phaser.GameObjects.Image;
	/**
	 * The Settings Image that will change the resolution.
	 * @default
	 */
	settingsIcon!: Phaser.GameObjects.Image;
	/**
	 * The Inventory Image that will open the inventory.
	 * @default
	 */
	inventoryIcon!: Phaser.GameObjects.Image;

	/**
	 * The name of the Settings Scene.
	 * @default
	 */
	settingSceneName: string;

	/**
	 * The name of the Inventory Scene.
	 * @default
	 */
	inventorySceneName: string;

	/**
	 * The Image that indicates the HP of the Player.
	 * @default
	 */
	hp_hud!: Phaser.GameObjects.Image;

	sp_hud!: Phaser.GameObjects.Image;

	/**
	 * The Health bar that will display the player's current HP
	 */
	health_bar!: NeverquestHUDProgressBar;

	/**
	 * The message log that displays game events
	 */
	messageLog!: NeverquestMessageLog;

	/**
	 * The inventory sprite shortcut name.
	 * @default
	 */
	inventoryShortcutSprite: string;

	/**
	 * The Console Inventory Sprite Name.
	 * @default
	 */
	inventoryShortcutIconXbox: string;

	/**
	 * The Icon for the attributes menu.
	 * @default
	 */
	attributesShortcutIconDesktop: string;
	/**
	 * The Icon for the attributes menu XBOX.
	 * @default
	 */
	attributesShortcutIconXbox: string;

	/**
	 * The icon that represents
	 * @default
	 */
	inventoryShortcutIcon: Phaser.GameObjects.Image | null;

	level_text!: Phaser.GameObjects.Text | null;

	/**
	 * The book attributes icon.
	 */
	attributesBook!: Phaser.GameObjects.Image;

	/**
	 * The name of the Attribute Management/Info Scene.
	 * @default
	 */
	attributeSceneName: string;

	/**
	 * The name of the Icon of the Attributes Scene Button.
	 * @default
	 */
	attributesBookSpriteName: string;

	attributesShortcutIcon: Phaser.GameObjects.Image | null;

	saveButton!: Phaser.GameObjects.Text;

	constructor() {
		super({
			key: 'HUDScene',
		});

		this.maximizeSpriteName = 'maximize';
		this.baseSpriteOffsetX = 50;
		this.maximizeSpriteOffsetX = 50;
		this.maximizeSpriteOffsetY = 50;
		this.baseSpriteOffsetY = 50;
		this.settingsSpriteName = 'cog_settings';
		this.settingsSpriteOffsetX = 100;
		this.settingsSpriteOffsetY = 50;
		this.inventorySpriteName = 'inventory_box';
		this.inventorySpriteOffsetX = Dimensions.HUD_INVENTORY_ICON_OFFSET_X;
		this.inventorySpriteOffsetY = 50;
		this.inventorySpriteScale = 1;
		this.settingSceneName = 'SettingScene';
		this.inventorySceneName = InventorySceneName;
		this.inventoryShortcutSprite = IconNamesConst.HUDScene.inventory.desktop;
		this.inventoryShortcutIconXbox = IconNamesConst.HUDScene.inventory.xbox;
		this.attributesShortcutIconDesktop = IconNamesConst.HUDScene.attributes.desktop;
		this.attributesShortcutIconXbox = IconNamesConst.HUDScene.attributes.xbox;
		this.inventoryShortcutIcon = null;
		this.level_text = null;
		this.attributeSceneName = AttributeSceneName;
		this.attributesBookSpriteName = 'book_ui';
		this.attributesShortcutIcon = null;
	}

	init(args: IHUDSceneArgs): void {
		this.player = args.player;
		this.map = args.map;

		// Update minimap with new map if it already exists
		if (this.minimap && this.map) {
			this.minimap.map = this.map;
		}
	}

	/**
	 * Phaser default create scene.
	 */
	create(): void {
		this.hp_hud = this.add.image(25, 25, 'hp_hud_2x');

		this.sp_hud = this.add.image(25, 45, 'sp_hud_2x');

		this.health_bar = new NeverquestHUDProgressBar(
			this,
			this.hp_hud.x,
			this.hp_hud.y,
			this.hp_hud.width,
			this.player
		);

		this.maximize = this.add
			.image(
				this.cameras.main.width - this.maximizeSpriteOffsetX,
				this.maximizeSpriteOffsetY,
				this.maximizeSpriteName
			)
			.setInteractive();

		this.settingsIcon = this.add
			.image(
				this.cameras.main.width - this.settingsSpriteOffsetX,
				this.settingsSpriteOffsetY,
				this.settingsSpriteName
			)
			.setInteractive();

		this.inventoryIcon = this.add
			.image(
				this.cameras.main.width - this.inventorySpriteOffsetX,
				this.inventorySpriteOffsetY,
				this.inventorySpriteName
			)
			.setInteractive()
			.setScale(this.inventorySpriteScale);

		this.attributesBook = this.add
			.image(
				this.cameras.main.width - this.baseSpriteOffsetX * Scale.HUD_ATTRIBUTES_BOOK_POSITION_MULTIPLIER,
				this.baseSpriteOffsetY,
				this.attributesBookSpriteName
			)
			.setInteractive();

		this.maximize.on('pointerup', () => {
			this.scale.toggleFullscreen();
		});

		// Launches Attribute Scene Scene.
		this.attributesBook.on('pointerup', () => {
			if (!this.scene.isVisible(this.attributeSceneName)) {
				this.scene.launch(this.attributeSceneName, {
					player: this.player,
				});
			} else {
				this.scene.get(this.attributeSceneName).scene.stop();
				// this.scene.stop(this.inventorySceneName);
			}
		});

		// Launches Inventory Scene.s
		this.inventoryIcon.on('pointerup', () => {
			SceneToggleWatcher.toggleScene(this, this.inventorySceneName, this.player);
		});

		if (!NeverquestUtils.isMobile() || (NeverquestUtils.isMobile() && this.input.gamepad!.pad1)) {
			this.createInventoryShortcutIcon();
			this.createAttributesShortcutIcon();
		}

		if (this.input.gamepad!.pad1) {
			this.createInventoryShortcutIcon();
			this.createAttributesShortcutIcon();
			this.setGamepadTextures();
		}

		this.input.gamepad!.on('connected', () => {
			this.createInventoryShortcutIcon();
			this.createAttributesShortcutIcon();
			this.setGamepadTextures();
		});
		this.input.gamepad!.on('disconnected', () => {
			this.inventoryShortcutIcon!.setTexture(this.inventoryShortcutSprite);
			this.attributesShortcutIcon!.setTexture(this.attributesShortcutIconDesktop);
		});

		// Launch the settings Scene.
		this.settingsIcon.on('pointerdown', () => {
			if (!this.scene.isVisible(this.settingSceneName)) {
				this.scene.launch(this.settingSceneName);
			} else {
				this.scene.stop(this.settingSceneName);
			}
		});

		this.scale.on('resize', (resize: Phaser.Structs.Size) => {
			this.resizeAll(resize);
		});
		// All Scenes have to be stopped before they are called to launch.
		this.scene.stop(this.inventorySceneName);
		this.scene.stop(this.settingSceneName);
		this.scene.stop(this.attributeSceneName);

		this.level_text = this.add.text(15, 75, 'LvL ' + this.player.attributes.level, {
			color: HexColors.WHITE,
		});

		this.createSaveButton();
		this.createMessageLog();
		this.createMinimap();
	}

	createMinimap(): void {
		// Only create minimap if we have a map reference
		if (this.map) {
			this.minimap = new NeverquestMinimap(this, this.player, this.map);
		}
	}

	createMessageLog(): void {
		const logWidth = 600;
		const logHeight = 140;
		const logX = this.cameras.main.width - logWidth - 10;
		const logY = this.cameras.main.height - logHeight - 10;

		this.messageLog = new NeverquestMessageLog(this, logX, logY, logWidth, logHeight);

		// Welcome message
		this.messageLog.log(UILabels.WELCOME_MESSAGE);
		this.messageLog.log(UILabels.WELCOME_CONTROLS);
		this.messageLog.log(UILabels.WELCOME_ATTACK);
	}

	createSaveButton(): void {
		this.saveButton = this.add.text(this.cameras.main.width - 80, 20, 'SAVE', {
			fontSize: '14px',
			color: HexColors.WHITE,
			backgroundColor: HexColors.GRAY_DARK,
			padding: { x: 8, y: 4 },
		});
		this.saveButton.setScrollFactor(0);
		this.saveButton.setInteractive();
		this.saveButton.on('pointerdown', () => {
			const mainScene = (this.scene.get('MainScene') ||
				this.scene.get('TownScene') ||
				this.scene.get('CaveScene') ||
				this.scene.get('OverworldScene') ||
				this.scene.get('DungeonScene')) as SceneWithSaveManager | null;
			if (mainScene?.saveManager) {
				mainScene.saveManager.saveGame(false);
			}
		});
		this.saveButton.on('pointerover', () => {
			this.saveButton.setStyle({ backgroundColor: HexColors.GRAY_MEDIUM });
		});
		this.saveButton.on('pointerout', () => {
			this.saveButton.setStyle({ backgroundColor: HexColors.GRAY_DARK });
		});
	}

	/**
	 * Creates the inventory shortcut image.
	 */
	createInventoryShortcutIcon(): void {
		if (!this.inventoryShortcutIcon) {
			this.inventoryShortcutIcon = this.add.image(
				this.settingsIcon.x - 70,
				this.settingsIcon.y + 15,
				this.inventoryShortcutSprite
			);
			this.inventoryShortcutIcon.setDisplaySize(30, 30);
		}
	}

	createAttributesShortcutIcon(): void {
		if (!this.attributesShortcutIcon) {
			this.attributesShortcutIcon = this.add
				.image(
					this.attributesBook.x - this.attributesBook.width / 2,
					this.attributesBook.y + 15,
					this.attributesShortcutIconDesktop
				)
				.setDisplaySize(30, 30);
		}
	}

	/**
	 * Sets the GamePad Textures.
	 * If the gamepad is connected, it should use the gamepad textures.
	 */
	setGamepadTextures(): void {
		if (this.inventoryShortcutIcon) this.inventoryShortcutIcon.setTexture(this.inventoryShortcutIconXbox);
		if (this.attributesShortcutIcon) this.attributesShortcutIcon.setTexture(this.attributesShortcutIconXbox);
		// this.attributesShortcutIconXbox
	}

	/**
	 * Resizes everything
	 * @param size the new size.
	 */
	resizeAll(size: Phaser.Structs.Size): void {
		if (this.maximize)
			this.maximize.setPosition(size.width - this.maximizeSpriteOffsetX, this.maximizeSpriteOffsetY);

		if (this.settingsIcon)
			this.settingsIcon.setPosition(size.width - this.settingsSpriteOffsetX, this.settingsSpriteOffsetY);

		this.inventoryIcon.setPosition(size.width - this.inventorySpriteOffsetX, this.inventorySpriteOffsetY);
		if (this.inventoryShortcutIcon)
			this.inventoryShortcutIcon.setPosition(this.settingsIcon.x - 70, this.settingsIcon.y + 15);

		if (this.attributesBook)
			this.attributesBook.setPosition(
				this.cameras.main.width - this.baseSpriteOffsetX * Scale.HUD_ATTRIBUTES_BOOK_POSITION_MULTIPLIER,
				this.baseSpriteOffsetY
			);
		if (this.attributesShortcutIcon)
			this.attributesShortcutIcon.setPosition(
				this.attributesBook.x - this.attributesBook.width / 2,
				this.attributesBook.y + 15
			);

		// Reposition message log
		if (this.messageLog) {
			const logWidth = 600;
			const logHeight = 140;
			const logX = size.width - logWidth - 10;
			const logY = size.height - logHeight - 10;
			this.messageLog.setPosition(logX, logY);
		}

		// Reposition save button
		if (this.saveButton) {
			this.saveButton.setPosition(size.width - 80, 20);
		}

		// Resize and reposition minimap
		if (this.minimap) {
			this.minimap.resize();
		}
	}

	/**
	 * Static helper to log messages from anywhere in the game
	 */
	public static log(scene: Phaser.Scene, message: string): void {
		const hudScene = scene.scene.get('HUDScene') as HUDScene;
		if (hudScene && hudScene.messageLog) {
			hudScene.messageLog.log(message);
		}
	}

	update(): void {
		if (this.level_text) this.level_text.setText('LvL ' + this.player.attributes.level);

		// Dynamically get the currently active game scene's map
		this.updateActiveSceneMap();

		// Update minimap
		if (this.minimap) {
			this.minimap.update();
		}
	}

	/**
	 * Updates the map reference to match the currently active game scene
	 */
	private updateActiveSceneMap(): void {
		// Safety check: ensure scene manager methods exist
		if (!this.scene || typeof this.scene.isActive !== 'function') {
			return;
		}

		const gameScenes = ['MainScene', 'DungeonScene', 'TownScene', 'CaveScene', 'OverworldScene', 'TutorialScene'];

		for (const sceneKey of gameScenes) {
			const scene = this.scene.get(sceneKey) as SceneWithMap | null;
			if (scene && this.scene.isActive(sceneKey)) {
				// Get map from the scene
				const sceneMap = scene.mapCreator?.map || scene.dungeon?.map;

				// Update map reference if it changed
				if (sceneMap && this.map !== sceneMap) {
					this.map = sceneMap;

					// Update minimap's map reference
					if (this.minimap) {
						this.minimap.map = sceneMap;
						// Reset logging flag to see debug info for new map
						(this.minimap as unknown as MinimapWithPrivateAccess).hasLoggedOnce = false;
					}
				}
				break; // Only use the first active game scene
			}
		}
	}
}
