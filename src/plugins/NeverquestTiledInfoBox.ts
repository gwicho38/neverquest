import { isNumber } from 'lodash';
import { CHATS } from '../consts/DB_SEED/Chats';
import { NeverquestDialogBox } from './NeverquestDialogBox';

interface Zone extends Phaser.GameObjects.Zone {
	chat?: any[];
	properties?: any[];
}

/**
 * @class
 */
export class NeverquestTiledInfoBox {
	map: Phaser.Tilemaps.Tilemap;
	scene: Phaser.Scene;
	uiScene: Phaser.Scene;
	player: any;
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
	constructor(scene: Phaser.Scene, player: any, map: Phaser.Tilemaps.Tilemap, uiScene: Phaser.Scene) {
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
				const obj = infoObj.properties?.find((f: any) => f.name === this.messageAttribute);
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
				zones.push({
					...zone,
					chat: chat.chat,
					properties: infoObj.properties,
				} as any); // Extended zone with chat data
			});
		}

		/**
		 * Checks if the player is overlapping the Tiled map Zone.
		 */
		this.scene.physics.add.overlap(
			zones,
			this.player.hitZone,
			(zone: any) => {
				(this.neverquestDialogBox as any).allProperties = zone.properties;
				this.neverquestDialogBox.isOverlapingChat = true;
				this.neverquestDialogBox.actionButton.visible = true;
				this.neverquestDialogBox.interactionIcon.visible = true;
				this.neverquestDialogBox.interactionIcon.setPosition(
					this.player.container.x,
					this.player.container.y - this.player.container.body.height * 2.5
				);
				this.neverquestDialogBox.chat = zone.chat;
				// Note: We do NOT disable canAtack here. The dialog system (showDialog/hideDialog)
				// is responsible for managing player attack state when dialogs open/close.
				// The overlap callback only manages UI visibility (interaction prompt).
				console.log('[TiledInfoBox] Overlap: Player in NPC zone', {
					dialogVisible: this.neverquestDialogBox.dialog.visible,
					canShowDialog: this.neverquestDialogBox.canShowDialog,
					canAtack: this.player.canAtack,
				});
			},
			(_d: any) => {
				return this.neverquestDialogBox.canShowDialog;
			}
		);
	}
}
