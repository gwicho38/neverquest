/**
 * @fileoverview NeverquestSaveManager - Game save/load system
 *
 * This plugin provides comprehensive save/load functionality including:
 * - Manual saves and automatic checkpoints
 * - Player state persistence (position, attributes, inventory)
 * - Story flag persistence
 * - Spell and ability unlock persistence
 * - localStorage-based persistence
 *
 * @example
 * // Create save manager in scene
 * const saveManager = new NeverquestSaveManager(this);
 * saveManager.create();
 *
 * // Manual save
 * saveManager.saveGame();
 *
 * // Load and apply save
 * const saveData = saveManager.loadGame();
 * if (saveData) {
 *   saveManager.applySaveData(saveData);
 * }
 *
 * @module plugins/NeverquestSaveManager
 */

import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { HUDScene } from '../scenes/HUDScene';
import { HexColors } from '../consts/Colors';
import { SaveMessages, FontFamily } from '../consts/Messages';
import { SaveManagerValues, Depth } from '../consts/Numbers';
import { NeverquestStoryFlags, StoryFlag, StoryChoice } from './NeverquestStoryFlags';
import { NeverquestSpellManager } from './NeverquestSpellManager';
import { NeverquestAbilityManager } from './NeverquestAbilityManager';
import { IEntityAttributes } from '../entities/EntityAttributes';
import { IInventoryItem } from '../types/ItemTypes';

/**
 * Story data structure for save files
 */
export interface IStoryData {
	flags: StoryFlag[];
	choices: StoryChoice[];
}

/**
 * Spell unlock data structure for save files
 */
export interface ISpellData {
	unlockedSpells: string[];
}

/**
 * Ability unlock data structure for save files
 */
export interface IAbilityData {
	unlockedAbilities: string[];
}

/**
 * Complete save data structure
 * Contains all game state that needs to persist between sessions
 */
export interface ISaveData {
	player: {
		x: number;
		y: number;
		attributes: Partial<IEntityAttributes>;
		items: IInventoryItem[];
		level: number;
		experience: number;
		health: number;
	};
	scene: string;
	timestamp: number;
	playtime: number;
	version: string;
	story?: IStoryData;
	spells?: ISpellData;
	abilities?: IAbilityData;
}

/**
 * Scene interface extension for scenes with player references
 */
export interface ISceneWithPlayer extends Phaser.Scene {
	player?: Player;
}

/**
 * Manages save/load functionality and automatic checkpoints for the game
 */
export class NeverquestSaveManager {
	public scene: ISceneWithPlayer;
	public saveKey: string;
	public checkpointKey: string;
	public checkpointInterval: number;
	public checkpointTimer: Phaser.Time.TimerEvent | null;
	public autoSaveEnabled: boolean;
	public storyFlags: NeverquestStoryFlags | null;
	public spellManager: NeverquestSpellManager | null;
	public abilityManager: NeverquestAbilityManager | null;

	constructor(scene: ISceneWithPlayer) {
		/**
		 * Scene Context.
		 */
		this.scene = scene;

		/**
		 * The key used for localStorage
		 */
		this.saveKey = 'neverquest_rpg_save';

		/**
		 * The key used for checkpoint saves
		 */
		this.checkpointKey = 'neverquest_rpg_checkpoint';

		/**
		 * Interval in milliseconds for automatic checkpoints (30 seconds for testing, change to 3*60*1000 for production)
		 */
		this.checkpointInterval = 30 * 1000; // 30 seconds for easier testing

		/**
		 * Timer for automatic checkpoints
		 */
		this.checkpointTimer = null;

		/**
		 * Whether auto-save is enabled
		 */
		this.autoSaveEnabled = true;

		/**
		 * Story flags manager for tracking narrative progression
		 */
		this.storyFlags = null;

		/**
		 * Spell manager for tracking spell unlocks
		 */
		this.spellManager = null;

		/**
		 * Ability manager for tracking ability unlocks
		 */
		this.abilityManager = null;
	}

	/**
	 * Initializes the save manager and starts the checkpoint timer
	 */
	create(): void {
		console.log('NeverquestSaveManager initialized for scene:', this.scene.scene.key);
		console.log('Scene time system available:', !!this.scene.time);
		console.log('Auto-save enabled:', this.autoSaveEnabled);

		// Initialize story flags for tracking narrative progression
		this.storyFlags = new NeverquestStoryFlags(this.scene);
		this.storyFlags.load(); // Load any previously saved story progress
		console.log('Story flags initialized, current act:', this.storyFlags.getCurrentAct());

		// Initialize spell manager for tracking spell unlocks
		this.spellManager = new NeverquestSpellManager(this.scene);
		this.spellManager.create();

		// Sync spell unlocks with story flags
		if (this.storyFlags) {
			this.spellManager.syncWithStoryFlags(this.storyFlags.getAllFlags());
		}
		console.log('Spell manager initialized, unlocked spells:', this.spellManager.getUnlockedCount());

		// Initialize ability manager for tracking ability unlocks
		this.abilityManager = new NeverquestAbilityManager(this.scene, this.scene.player || null);
		this.abilityManager.create();

		// Sync ability unlocks with story flags
		if (this.storyFlags) {
			this.abilityManager.syncWithStoryFlags(this.storyFlags.getAllFlags());
		}
		console.log('Ability manager initialized, unlocked abilities:', this.abilityManager.getUnlockedCount());

		this.startCheckpointTimer();

		// Also create an immediate save to test functionality
		if (this.scene && this.scene.time) {
			this.scene.time.delayedCall(
				SaveManagerValues.INITIAL_SAVE_TEST_DELAY,
				() => {
					console.log('Testing auto-save after 5 seconds for scene:', this.scene.scene.key);
					this.createCheckpoint();
				},
				[],
				this
			);
		} else {
			console.error('Scene time system not available!');
		}
	}

	/**
	 * Starts the automatic checkpoint timer
	 */
	startCheckpointTimer(): void {
		if (this.checkpointTimer) {
			this.checkpointTimer.destroy();
		}

		if (!this.scene || !this.scene.time) {
			console.error('Cannot start timer - scene or time system not available');
			return;
		}

		console.log('Starting auto-save timer with interval:', this.checkpointInterval / 1000, 'seconds');

		try {
			this.checkpointTimer = this.scene.time.addEvent({
				delay: this.checkpointInterval,
				callback: this.createCheckpoint,
				callbackScope: this,
				loop: true,
			});

			console.log('Auto-save timer created successfully');
			console.log('Timer details:', this.checkpointTimer);
		} catch (error) {
			console.error('Failed to create auto-save timer:', error);
		}
	}

	/**
	 * Stops the automatic checkpoint timer
	 */
	stopCheckpointTimer(): void {
		if (this.checkpointTimer) {
			this.checkpointTimer.destroy();
			this.checkpointTimer = null;
			console.log('Auto-save timer stopped');
		}
	}

	/**
	 * Creates comprehensive save data from current game state
	 */
	createSaveData(): ISaveData | null {
		const player = this.getPlayer();
		if (!player) {
			console.warn('No player found for saving');
			return null;
		}

		const saveData: ISaveData = {
			player: {
				x: player.container.x,
				y: player.container.y,
				attributes: {
					level: player.attributes.level,
					experience: player.attributes.experience,
					health: player.attributes.health,
					baseHealth: player.attributes.baseHealth,
					atack: player.attributes.atack,
					defense: player.attributes.defense,
					availableStatPoints: player.attributes.availableStatPoints,
				},
				items: player.items,
				level: player.attributes.level,
				experience: player.attributes.experience,
				health: player.attributes.health,
			},
			scene: this.scene.scene.key,
			timestamp: Date.now(),
			playtime: this.getPlayTime(),
			version: '1.0.0',
			story: this.storyFlags ? this.storyFlags.toJSON() : undefined,
			spells: this.spellManager ? { unlockedSpells: this.spellManager.toJSON() } : undefined,
			abilities: this.abilityManager ? { unlockedAbilities: this.abilityManager.toJSON() } : undefined,
		};

		return saveData;
	}

	/**
	 * Gets the player instance from the scene
	 */
	getPlayer(): Player | null {
		return (
			this.scene.player ||
			this.scene.data?.get('player') ||
			(this.scene.children?.getByName('player') as Player) ||
			null
		);
	}

	/**
	 * Gets the current play time
	 */
	getPlayTime(): number {
		return this.scene.time.now;
	}

	/**
	 * Saves the game to localStorage
	 */
	saveGame(isCheckpoint: boolean = false): boolean {
		try {
			const saveData = this.createSaveData();
			if (!saveData) {
				return false;
			}

			const key = isCheckpoint ? this.checkpointKey : this.saveKey;
			localStorage.setItem(key, JSON.stringify(saveData));

			console.log(`Game ${isCheckpoint ? 'checkpoint' : 'save'} successful`);

			if (!isCheckpoint) {
				this.showSaveNotification(SaveMessages.GAME_SAVED_TITLE);
				HUDScene.log(this.scene, SaveMessages.GAME_SAVED_MESSAGE);
			} else {
				HUDScene.log(this.scene, SaveMessages.AUTO_SAVED_MESSAGE);
			}

			return true;
		} catch (error) {
			console.error('Failed to save game:', error);
			this.showSaveNotification(SaveMessages.SAVE_FAILED_TITLE, true);
			return false;
		}
	}

	/**
	 * Creates an automatic checkpoint save
	 */
	createCheckpoint(): void {
		console.log('createCheckpoint called, autoSaveEnabled:', this.autoSaveEnabled);

		if (this.autoSaveEnabled) {
			const player = this.getPlayer();
			if (!player) {
				console.warn('Cannot auto-save: No player found');
				return;
			}

			// Only save if player is not in combat or cutscene
			if (player.canMove && !player.isAtacking) {
				const success = this.saveGame(true);
				if (success) {
					console.log('Auto-save checkpoint created at', new Date().toLocaleTimeString());
					this.showSaveNotification('Auto-Saved', false);
				}
			} else {
				console.log('Auto-save skipped - player busy');
			}
		}
	}

	/**
	 * Loads game data from localStorage
	 */
	loadGame(loadCheckpoint: boolean = false): ISaveData | null {
		try {
			const key = loadCheckpoint ? this.checkpointKey : this.saveKey;
			const saveDataString = localStorage.getItem(key);

			if (!saveDataString) {
				console.log('No save data found');
				return null;
			}

			const saveData: ISaveData = JSON.parse(saveDataString);
			console.log(`${loadCheckpoint ? 'Checkpoint' : 'Save'} data loaded successfully`);

			return saveData;
		} catch (error) {
			console.error('Failed to load game:', error);
			this.showSaveNotification(SaveMessages.LOAD_FAILED_TITLE, true);
			return null;
		}
	}

	/**
	 * Applies loaded save data to the current game state
	 */
	applySaveData(saveData: ISaveData): boolean {
		if (!saveData || !saveData.player) {
			console.error('Invalid save data');
			return false;
		}

		try {
			const player = this.getPlayer();
			if (!player) {
				console.error('No player found to apply save data to');
				return false;
			}

			// Apply player position
			player.container.setPosition(saveData.player.x, saveData.player.y);

			// Apply player attributes
			Object.assign(player.attributes, saveData.player.attributes);

			// Apply items
			player.items = saveData.player.items || [];

			// Update health bar if it exists
			if (player.healthBar) {
				player.healthBar.update(player.attributes.health);
			}

			// Restore story flags if present in save data
			if (saveData.story && this.storyFlags) {
				this.storyFlags.fromJSON(saveData.story);
				console.log('Story flags restored, current act:', this.storyFlags.getCurrentAct());
				console.log('Fragments collected:', this.storyFlags.getFragmentCount());
			}

			// Restore spell unlocks if present in save data
			if (saveData.spells && this.spellManager) {
				this.spellManager.fromJSON(saveData.spells.unlockedSpells);
				console.log('Spell unlocks restored:', this.spellManager.getUnlockedCount(), 'spells');
			}

			// Restore ability unlocks if present in save data
			if (saveData.abilities && this.abilityManager) {
				this.abilityManager.fromJSON(saveData.abilities.unlockedAbilities);
				console.log('Ability unlocks restored:', this.abilityManager.getUnlockedCount(), 'abilities');
			}

			// Switch to saved scene if different
			if (saveData.scene !== this.scene.scene.key) {
				this.scene.scene.start(saveData.scene);
			}

			console.log('Save data applied successfully');
			this.showSaveNotification(SaveMessages.GAME_LOADED_TITLE);
			HUDScene.log(this.scene, SaveMessages.GAME_LOADED_MESSAGE);

			return true;
		} catch (error) {
			console.error('Failed to apply save data:', error);
			this.showSaveNotification(SaveMessages.APPLY_FAILED_TITLE, true);
			return false;
		}
	}

	/**
	 * Shows a save/load notification to the player
	 */
	showSaveNotification(message: string, isError: boolean = false): void {
		const color = isError ? HexColors.RED_LIGHT : HexColors.GREEN_LIGHT;

		const notification = this.scene.add.text(this.scene.cameras.main.width / 2, 80, message, {
			fontSize: '20px',
			fontFamily: `"${FontFamily.PIXEL}"`,
			color: color,
			backgroundColor: 'rgba(0, 0, 0, 0.9)',
			padding: { x: 15, y: 10 },
		});

		notification.setOrigin(0.5);
		notification.setScrollFactor(0);
		notification.setDepth(Depth.TOP);

		// Fade out after 2 seconds
		this.scene.tweens.add({
			targets: notification,
			alpha: 0,
			duration: 2000,
			delay: 300,
			onComplete: () => {
				notification.destroy();
			},
		});
	}

	/**
	 * Checks if save data exists
	 */
	hasSaveData(checkCheckpoint: boolean = false): boolean {
		const key = checkCheckpoint ? this.checkpointKey : this.saveKey;
		return localStorage.getItem(key) !== null;
	}

	/**
	 * Deletes save data from localStorage
	 */
	deleteSave(deleteCheckpoint: boolean = false): void {
		const key = deleteCheckpoint ? this.checkpointKey : this.saveKey;
		localStorage.removeItem(key);
		console.log(`${deleteCheckpoint ? 'Checkpoint' : 'Save'} data deleted`);
	}

	/**
	 * Enables or disables auto-save functionality
	 */
	setAutoSave(enabled: boolean): void {
		this.autoSaveEnabled = enabled;
		if (enabled) {
			this.startCheckpointTimer();
		} else {
			this.stopCheckpointTimer();
		}
		console.log('Auto-save', enabled ? 'enabled' : 'disabled');
	}

	/**
	 * Cleans up resources when the save manager is destroyed
	 */
	destroy(): void {
		this.stopCheckpointTimer();
	}
}
