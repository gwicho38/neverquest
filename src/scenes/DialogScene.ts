/**
 * @fileoverview Dialog overlay scene for NPC conversations
 *
 * This scene manages the dialog system overlay:
 * - Receives player and map references from parent scene
 * - Creates NeverquestTiledInfoBox for dialog triggers
 * - Handles dialog zone overlap detection
 *
 * Works in conjunction with gameplay scenes to display dialogs.
 *
 * @see NeverquestTiledInfoBox - Dialog zone management
 * @see NeverquestDialogBox - Dialog rendering
 * @see CHATS - Dialog content
 *
 * @module scenes/DialogScene
 */

import Phaser from 'phaser';
import { NeverquestTiledInfoBox } from '../plugins/NeverquestTiledInfoBox';
import { Player } from '../entities/Player';
import { IDialogScene } from '../types/SceneTypes';

export class DialogScene extends Phaser.Scene implements IDialogScene {
	public player: Player | null = null;
	public map: Phaser.Tilemaps.Tilemap | null = null;
	public mainScene: Phaser.Scene | null = null;
	public neverquestTiledInfoBox!: NeverquestTiledInfoBox;

	constructor() {
		super({
			key: 'DialogScene',
		});
	}

	init(args: { player: Player; map: Phaser.Tilemaps.Tilemap; scene: Phaser.Scene }): void {
		this.player = args.player;
		this.map = args.map;
		this.mainScene = args.scene;
	}

	create(): void {
		this.neverquestTiledInfoBox = new NeverquestTiledInfoBox(this.mainScene!, this.player!, this.map!, this);
		this.neverquestTiledInfoBox.create();

		this.scale.on('resize', (resize: { width: number; height: number }) => {
			if (this.neverquestTiledInfoBox && this.neverquestTiledInfoBox.neverquestDialogBox) {
				this.neverquestTiledInfoBox.neverquestDialogBox.resizeComponents(resize.width, resize.height);
			}
		});

		this.input.on('pointerdown', () => {
			// console.log(this.cameras.main);
		});
	}

	update(): void {
		if (this.neverquestTiledInfoBox) this.neverquestTiledInfoBox.neverquestDialogBox.checkUpdate();
	}
}
