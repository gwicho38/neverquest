/**
 * @fileoverview Tiled-based dialog trigger system for Neverquest
 *
 * This plugin creates dialog zones from Tiled map objects:
 * - Reads dialog zone objects from tilemap layers
 * - Maps messageId properties to dialog content
 * - Creates overlap zones for player interaction
 * - Triggers NeverquestDialogBox on player entry
 *
 * Tiled object configuration:
 * - messageId: Reference to CHATS registry entry
 * - Additional properties passed to dialog
 *
 * Workflow:
 * 1. Create object layer "dialogs" in Tiled
 * 2. Add rectangle objects with messageId property
 * 3. Plugin creates zones and handles triggers
 *
 * @see NeverquestDialogBox - Displays triggered dialogs
 * @see CHATS - Dialog content registry
 * @see Tiled Map Editor - https://www.mapeditor.org/
 *
 * @module plugins/NeverquestTiledInfoBox
 */

import { isNumber } from 'lodash';
import { CHATS } from '../consts/DB_SEED/Chats';
import { Player } from '../entities/Player';
import { IDialogChat, NeverquestDialogBox } from './NeverquestDialogBox';
import { DialogBox } from '../consts/Numbers';

/**
 * Tiled map object property
 */
interface ITiledProperty {
	name: string;
	type: string;
	value: string | number | boolean;
}

/**
 * Extended zone with chat and properties data from Tiled map objects
 */
interface Zone extends Phaser.GameObjects.Zone {
	chat?: IDialogChat[];
	properties?: ITiledProperty[];
}

/**
 * @class
 */
export class NeverquestTiledInfoBox {
	map: Phaser.Tilemaps.Tilemap;
	scene: Phaser.Scene;
	uiScene: Phaser.Scene;
	player: Player;
	neverquestDialogBox: NeverquestDialogBox;
	tiledObjectLayer: string;
	messageAttribute: string;

	/**
	 * This class allows one to create Dialogs with "Tiled" map editor <a href="https://www.mapeditor.org/">Tiled</a>
	 * Using the Objects layer https://doc.mapeditor.org/en/stable/manual/objects/ and open them seamlessly with phaser.
	 *
	 * You should add a game object to check if it overlaps your dialog information.
	 *
	 * Simply put, It Creates a Dialog to show messages from static objects created with "Tiled".
	 * @param {Phaser.Scene} scene Scene Context.
	 * @param {Phaser.GameObjects} player Player Game Object.
	 * @param {Phaser.Tilemaps.Tilemap} map Tile Map to get the object from.
	 * @param {Phaser.Scene} uiScene the User interface Scene. Usually this is an overlay Scene, so the game objects don be affected by the game zoom and don't lose quality on Scale.
	 */
	constructor(scene: Phaser.Scene, player: Player, map: Phaser.Tilemaps.Tilemap, uiScene: Phaser.Scene) {
		/**
		 * Tile Map to get the object from.
		 * @type {Phaser.Tilemaps.Tilemap} */
		this.map = map;
		/**
		 * Scene Context.
		 * @type { Phaser.Scene }  */
		this.scene = scene;

		/**
		 * Dialog Scene to create the dialog.
		 * @type { Phaser.Scene }  */
		this.uiScene = uiScene;
		/**
		 * player Player Game Object.
		 * @type { Player }  */
		this.player = player;
		/**
		 * The Dialog box that will show de text from Tiled.
		 * @type { NeverquestDialogBox }
		 */
		this.neverquestDialogBox = new NeverquestDialogBox(this.uiScene, this.player);
		/**
		 * Name of the object Layer in the "Tiled" software. <a href="https://www.mapeditor.org/">Tiled</a>
		 * Check Tiled Docs to learn more <a href="https://doc.mapeditor.org/en/stable/manual/objects/">Tiled</a>
		 * @type {string}
		 * @default
		 * */
		this.tiledObjectLayer = 'info';

		/**
		 * Object Attribute that the you created in the Tiled Software to define your messages.
		 * @type {string}
		 * @default
		 * */
		this.messageAttribute = 'messageID';
	}

	/**
	 * Creates the zones to make it possible to show the message.
	 */
	create(): void {
		// Creates the dialog information.
		this.neverquestDialogBox.create();
		// Rules to show informations!
		const infoObjects = this.map.getObjectLayer(this.tiledObjectLayer);
		const zones: Zone[] = [];
		if (infoObjects && infoObjects.objects) {
			infoObjects.objects.forEach((infoObj) => {
				const zone = this.scene.add.zone(infoObj.x!, infoObj.y!, infoObj.width, infoObj.height) as Zone;
				const obj = infoObj.properties?.find((f: ITiledProperty) => f.name === this.messageAttribute);
				if (!obj) {
					return;
				}
				const messageID = obj.value;
				if (!isNumber(messageID)) {
					return;
				}
				const chat = CHATS.find((c) => c.id == messageID);
				if (!chat) {
					console.warn(`Chat with ID ${messageID} not found`);
					return;
				}
				this.scene.physics.add.existing(zone);
				zone.setOrigin(0, 0);
				(zone.body as Phaser.Physics.Arcade.Body).immovable = true;
				zone.chat = chat.chat as IDialogChat[];
				zone.properties = infoObj.properties as ITiledProperty[];
				zones.push(zone);
			});
		}

		/**
		 * Checks if the player is overlapping the Tiled map Zone.
		 */
		this.scene.physics.add.overlap(
			zones,
			this.player.hitZone,
			(zoneObj) => {
				const zone = zoneObj as Zone;
				const body = this.player.container.body as Phaser.Physics.Arcade.Body;
				this.neverquestDialogBox.isOverlapingChat = true;
				this.neverquestDialogBox.actionButton.visible = true;
				this.neverquestDialogBox.interactionIcon.visible = true;
				this.neverquestDialogBox.interactionIcon.setPosition(
					this.player.container.x,
					this.player.container.y - body.height * DialogBox.MARGIN_MULTIPLIER_TEXT_Y
				);
				this.neverquestDialogBox.chat = zone.chat;
				// Note: We do NOT disable canAtack here. The dialog system (showDialog/hideDialog)
				// is responsible for managing player attack state when dialogs open/close.
				// The overlap callback only manages UI visibility (interaction prompt).
			},
			() => {
				return this.neverquestDialogBox.canShowDialog;
			}
		);
	}
}
