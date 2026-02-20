/**
 * @fileoverview Programmatic NPC spawning system for Neverquest
 *
 * This plugin creates NPCs without requiring Tiled map objects:
 * - Spawns NPCs at specified coordinates
 * - Attaches dialog via CHATS registry
 * - Creates interaction zones automatically
 * - Supports sprite customization (texture, frame, tint, scale)
 * - Optional idle animations
 *
 * Useful for scenes without tilemap or dynamically placed NPCs.
 *
 * @see NeverquestDialogBox - Handles NPC dialogs
 * @see CHATS - Dialog content registry
 * @see NeverquestTiledInfoBox - Tiled-based alternative
 *
 * @module plugins/NeverquestNPCManager
 */

import Phaser from 'phaser';
import { CHATS } from '../consts/DB_SEED/Chats';
import { Player } from '../entities/Player';
import { IDialogChat, NeverquestDialogBox } from './NeverquestDialogBox';
import { DialogBox } from '../consts/Numbers';
import { HexColors } from '../consts/Colors';

/**
 * NPC configuration for programmatic spawning
 */
export interface INPCConfig {
	/** Unique identifier for the NPC */
	id: string;
	/** Display name shown above NPC */
	name: string;
	/** X position in pixels */
	x: number;
	/** Y position in pixels */
	y: number;
	/** Chat ID from CHATS registry */
	chatId: number;
	/** Sprite texture key (defaults to 'character') */
	texture?: string;
	/** Animation frame to display (for static NPCs) */
	frame?: number;
	/** Scale of the sprite */
	scale?: number;
	/** Tint color for the sprite (hex number) */
	tint?: number;
	/** Whether the NPC should have idle animation */
	animated?: boolean;
	/** Animation key to play if animated */
	animationKey?: string;
}

/**
 * Extended zone with chat data for NPC interaction
 */
interface INPCZone extends Phaser.GameObjects.Zone {
	chat?: IDialogChat[];
	npcId?: string;
}

/**
 * NPC sprite with associated data
 */
interface INPCSprite extends Phaser.GameObjects.Sprite {
	npcId: string;
	npcConfig: INPCConfig;
	nameText?: Phaser.GameObjects.Text;
}

/**
 * NeverquestNPCManager - Manages programmatic NPC spawning and interactions
 *
 * This plugin allows spawning NPCs in scenes without requiring Tiled map objects.
 * It integrates with the existing dialog system and provides:
 * - NPC spawning at specified coordinates
 * - Dialog triggers on player overlap
 * - Visual indicators (name labels, interaction prompts)
 * - Optional idle animations
 *
 * @example
 * ```typescript
 * const npcManager = new NeverquestNPCManager(scene, player);
 * npcManager.addNPC({
 *   id: 'merchant',
 *   name: 'Wandering Merchant',
 *   x: 640,
 *   y: 400,
 *   chatId: 11, // MerchantGreeting
 *   texture: 'character',
 *   tint: 0x8B4513
 * });
 * npcManager.create();
 * ```
 */
export class NeverquestNPCManager {
	scene: Phaser.Scene;
	player: Player;
	dialogBox: NeverquestDialogBox;
	npcs: INPCSprite[];
	npcConfigs: INPCConfig[];
	interactionZones: INPCZone[];
	/** Zone interaction radius in pixels */
	interactionRadius: number;
	/** Depth layer for NPC sprites */
	spriteDepth: number;
	/** Depth layer for NPC name labels */
	labelDepth: number;

	/**
	 * Creates a new NPC manager for the scene
	 * @param scene - The Phaser scene to add NPCs to
	 * @param player - The player entity for interaction detection
	 * @param uiScene - Optional UI scene for dialog (defaults to 'DialogScene')
	 */
	constructor(scene: Phaser.Scene, player: Player, uiScene?: Phaser.Scene) {
		this.scene = scene;
		this.player = player;
		this.npcs = [];
		this.npcConfigs = [];
		this.interactionZones = [];
		this.interactionRadius = 48;
		this.spriteDepth = 5;
		this.labelDepth = 10;

		// Get the dialog scene if not provided
		const dialogScene = uiScene || this.scene.scene.get('DialogScene');
		this.dialogBox = new NeverquestDialogBox(dialogScene, this.player);
	}

	/**
	 * Adds an NPC configuration to be spawned when create() is called
	 * @param config - The NPC configuration
	 */
	addNPC(config: INPCConfig): void {
		this.npcConfigs.push(config);
	}

	/**
	 * Adds multiple NPC configurations at once
	 * @param configs - Array of NPC configurations
	 */
	addNPCs(configs: INPCConfig[]): void {
		this.npcConfigs.push(...configs);
	}

	/**
	 * Creates all configured NPCs and sets up interaction zones
	 */
	create(): void {
		// Initialize dialog system
		this.dialogBox.create();

		// Create each NPC
		this.npcConfigs.forEach((config) => {
			this.spawnNPC(config);
		});

		// Set up overlap detection for all zones
		if (this.interactionZones.length > 0) {
			this.scene.physics.add.overlap(
				this.interactionZones,
				this.player.hitZone,
				(zoneObj) => {
					this.handleNPCOverlap(zoneObj as INPCZone);
				},
				() => this.dialogBox.canShowDialog
			);
		}
	}

	/**
	 * Spawns a single NPC based on configuration
	 */
	private spawnNPC(config: INPCConfig): void {
		// Look up the chat data
		const chatData = CHATS.find((c) => c.id === config.chatId);
		if (!chatData) {
			console.warn(`[NPCManager] Chat ID ${config.chatId} not found for NPC ${config.id}`);
			return;
		}

		// Create the NPC sprite
		const sprite = this.scene.add.sprite(
			config.x,
			config.y,
			config.texture || 'character',
			config.frame ?? 0
		) as INPCSprite;

		sprite.npcId = config.id;
		sprite.npcConfig = config;
		sprite.setDepth(this.spriteDepth);

		// Apply scale if specified
		if (config.scale !== undefined) {
			sprite.setScale(config.scale);
		}

		// Apply tint if specified
		if (config.tint !== undefined) {
			sprite.setTint(config.tint);
		}

		// Play animation if specified
		if (config.animated && config.animationKey) {
			sprite.play(config.animationKey);
		}

		// Create name label above NPC
		const nameText = this.scene.add
			.text(config.x, config.y - 24, config.name, {
				fontSize: '10px',
				fontFamily: 'Press Start 2P',
				color: HexColors.WHITE,
				stroke: HexColors.BLACK,
				strokeThickness: 2,
			})
			.setOrigin(0.5, 1)
			.setDepth(this.labelDepth);

		sprite.nameText = nameText;
		this.npcs.push(sprite);

		// Create interaction zone around NPC
		const zone = this.scene.add.zone(
			config.x,
			config.y,
			this.interactionRadius * 2,
			this.interactionRadius * 2
		) as INPCZone;

		this.scene.physics.add.existing(zone);
		zone.setOrigin(0.5, 0.5);
		(zone.body as Phaser.Physics.Arcade.Body).immovable = true;

		zone.chat = chatData.chat as IDialogChat[];
		zone.npcId = config.id;

		this.interactionZones.push(zone);
	}

	/**
	 * Handles player overlapping with an NPC zone
	 */
	private handleNPCOverlap(zone: INPCZone): void {
		const body = this.player.container.body as Phaser.Physics.Arcade.Body;

		this.dialogBox.isOverlapingChat = true;
		this.dialogBox.actionButton.visible = true;
		this.dialogBox.interactionIcon.visible = true;
		this.dialogBox.interactionIcon.setPosition(
			this.player.container.x,
			this.player.container.y - body.height * DialogBox.MARGIN_MULTIPLIER_TEXT_Y
		);
		this.dialogBox.chat = zone.chat;
	}

	/**
	 * Gets an NPC sprite by its ID
	 * @param id - The NPC ID
	 * @returns The NPC sprite or undefined if not found
	 */
	getNPC(id: string): INPCSprite | undefined {
		return this.npcs.find((npc) => npc.npcId === id);
	}

	/**
	 * Removes an NPC from the scene
	 * @param id - The NPC ID to remove
	 */
	removeNPC(id: string): void {
		const npcIndex = this.npcs.findIndex((npc) => npc.npcId === id);
		if (npcIndex !== -1) {
			const npc = this.npcs[npcIndex];
			npc.nameText?.destroy();
			npc.destroy();
			this.npcs.splice(npcIndex, 1);
		}

		const zoneIndex = this.interactionZones.findIndex((zone) => zone.npcId === id);
		if (zoneIndex !== -1) {
			this.interactionZones[zoneIndex].destroy();
			this.interactionZones.splice(zoneIndex, 1);
		}
	}

	/**
	 * Updates NPC positions (for moving NPCs)
	 * @param id - The NPC ID
	 * @param x - New X position
	 * @param y - New Y position
	 */
	moveNPC(id: string, x: number, y: number): void {
		const npc = this.getNPC(id);
		if (npc) {
			npc.setPosition(x, y);
			npc.nameText?.setPosition(x, y - 24);
		}

		const zone = this.interactionZones.find((z) => z.npcId === id);
		if (zone) {
			zone.setPosition(x, y);
		}
	}

	/**
	 * Destroys all NPCs and cleans up resources
	 */
	destroy(): void {
		this.npcs.forEach((npc) => {
			npc.nameText?.destroy();
			npc.destroy();
		});
		this.npcs = [];

		this.interactionZones.forEach((zone) => zone.destroy());
		this.interactionZones = [];

		this.npcConfigs = [];
	}
}

/**
 * Predefined NPC configurations for the Crossroads scene
 */
export const CROSSROADS_NPCS: INPCConfig[] = [
	{
		id: 'merchant',
		name: 'Wandering Merchant',
		x: 640, // Center of 80x80 tile map (tile 40)
		y: 560, // Center-ish (tile 35)
		chatId: 11, // MerchantGreeting
		texture: 'character',
		frame: 0,
		scale: 1,
		tint: 0x8b4513, // Brown tint for merchant
	},
	{
		id: 'fallenKnight',
		name: 'Sir Aldric',
		x: 480, // West side (tile 30)
		y: 640, // Middle (tile 40)
		chatId: 12, // FallenKnightEncounter
		texture: 'character',
		frame: 0,
		scale: 1.1,
		tint: 0x4169e1, // Royal blue for knight
	},
	{
		id: 'oracle',
		name: 'Oracle',
		x: 800, // East side (tile 50)
		y: 480, // Upper middle (tile 30)
		chatId: 13, // OracleVision
		texture: 'character',
		frame: 0,
		scale: 0.9,
		tint: 0x9932cc, // Purple for oracle
	},
	{
		id: 'gateGuardian',
		name: 'Gate Guardian',
		x: 640, // Center (tile 40)
		y: 320, // North (tile 20) - near the gate to Dark Lands
		chatId: 14, // GateGuardian
		texture: 'character',
		frame: 0,
		scale: 1.2,
		tint: 0x2f4f4f, // Dark slate gray for guardian
	},
];
