/**
 * @fileoverview Milestone ability unlock system for Neverquest
 *
 * This plugin manages level-based ability unlocks:
 * - Double Jump (Level 5): Mid-air second jump
 * - Sprint Boost (Level 10): Faster running
 * - Magic Shield (Level 15): Auto-block spell damage
 * - Shadow Step (Level 20): Short-range teleport
 *
 * Tracks unlocks via story flags and persists through save system.
 * Emits events when new abilities are unlocked.
 *
 * @see NeverquestStoryFlags - Tracks ability unlock flags
 * @see Player - Receives ability state changes
 * @see ExpManager - Triggers level-up checks
 *
 * @module plugins/NeverquestAbilityManager
 */

import Phaser from 'phaser';
import { StoryFlag } from './NeverquestStoryFlags';
import { Player } from '../entities/Player';

/**
 * Ability definition interface
 */
export interface AbilityDefinition {
	id: string;
	name: string;
	description: string;
	unlockLevel: number;
	storyFlag: StoryFlag;
	icon?: string;
}

/**
 * Milestone abilities that unlock at specific player levels
 * Per fix_plan.md:
 * - Level 5: Double Jump
 * - Level 10: Sprint Boost
 * - Level 15: Magic Shield
 * - Level 20: Shadow Step
 */
export const MILESTONE_ABILITIES: AbilityDefinition[] = [
	{
		id: 'doubleJump',
		name: 'Double Jump',
		description: 'Jump again while in mid-air for extra height and mobility',
		unlockLevel: 5,
		storyFlag: StoryFlag.ABILITY_DOUBLE_JUMP,
	},
	{
		id: 'sprintBoost',
		name: 'Sprint Boost',
		description: 'Run faster for a short burst when holding shift',
		unlockLevel: 10,
		storyFlag: StoryFlag.ABILITY_SPRINT_BOOST,
	},
	{
		id: 'magicShield',
		name: 'Magic Shield',
		description: 'Automatically block incoming spell damage when triggered',
		unlockLevel: 15,
		storyFlag: StoryFlag.ABILITY_MAGIC_SHIELD,
	},
	{
		id: 'shadowStep',
		name: 'Shadow Step',
		description: 'Short-range teleport in the direction you are facing',
		unlockLevel: 20,
		storyFlag: StoryFlag.ABILITY_SHADOW_STEP,
	},
];

/**
 * NeverquestAbilityManager - Manages player ability unlocks based on level milestones
 *
 * This plugin tracks player level and automatically unlocks abilities
 * when the player reaches milestone levels. It also allows manual
 * unlocking via story flags for special cases.
 *
 * Usage:
 * ```typescript
 * const abilityManager = new NeverquestAbilityManager(scene, player);
 * abilityManager.create();
 *
 * // Check if ability is unlocked
 * if (abilityManager.isAbilityUnlocked('doubleJump')) {
 *   // Allow double jump
 * }
 *
 * // Update when player levels up
 * abilityManager.onLevelUp(newLevel);
 * ```
 */
export class NeverquestAbilityManager {
	private scene: Phaser.Scene;
	private player: Player | null;
	private unlockedAbilities: Set<string>;
	private storageKey: string;

	constructor(scene: Phaser.Scene, player: Player | null = null) {
		this.scene = scene;
		this.player = player;
		this.unlockedAbilities = new Set();
		this.storageKey = 'neverquest_ability_unlocks';
	}

	/**
	 * Initialize the ability manager and check current player level
	 */
	create(): void {
		// Load any previously saved ability unlocks
		this.load();

		// Check current player level for any abilities that should be unlocked
		if (this.player) {
			this.checkLevelUnlocks(this.player.attributes.level);
		}

		// Listen for ability unlock events from story flags
		this.scene.events.on('abilityUnlocked', this.handleAbilityUnlock, this);

		// Listen for level up events
		this.scene.events.on('playerLevelUp', this.onLevelUp, this);

		// Clean up on scene shutdown
		this.scene.events.once('shutdown', this.destroy, this);
	}

	/**
	 * Set the player reference (useful when player is created after manager)
	 */
	setPlayer(player: Player): void {
		this.player = player;
		this.checkLevelUnlocks(player.attributes.level);
	}

	/**
	 * Handle player level up and unlock any new abilities
	 */
	onLevelUp(newLevel: number): void {
		this.checkLevelUnlocks(newLevel);
	}

	/**
	 * Check if any abilities should be unlocked at the given level
	 */
	private checkLevelUnlocks(level: number): void {
		MILESTONE_ABILITIES.forEach((ability) => {
			if (level >= ability.unlockLevel && !this.unlockedAbilities.has(ability.id)) {
				this.unlockAbility(ability.id);
			}
		});
	}

	/**
	 * Handle ability unlock event from story flags
	 */
	private handleAbilityUnlock(abilityId: string): void {
		if (!this.unlockedAbilities.has(abilityId)) {
			this.unlockedAbilities.add(abilityId);
			this.save();

			const ability = this.getAbilityById(abilityId);
			if (ability) {
				// Emit UI notification event
				this.scene.events.emit('abilityUnlockedUI', {
					abilityId,
					ability,
				});
				console.log(`[NeverquestAbilityManager] Ability unlocked: ${ability.name}`);
			}
		}
	}

	/**
	 * Unlock an ability by ID
	 */
	unlockAbility(abilityId: string): void {
		if (!this.unlockedAbilities.has(abilityId)) {
			this.unlockedAbilities.add(abilityId);
			this.save();

			const ability = this.getAbilityById(abilityId);
			if (ability) {
				// Emit event for story flag tracking
				this.scene.events.emit('setStoryFlag', ability.storyFlag);

				// Emit UI notification event
				this.scene.events.emit('abilityUnlockedUI', {
					abilityId,
					ability,
				});

				console.log(`[NeverquestAbilityManager] Ability unlocked: ${ability.name}`);
			}
		}
	}

	/**
	 * Check if an ability is unlocked
	 */
	isAbilityUnlocked(abilityId: string): boolean {
		return this.unlockedAbilities.has(abilityId);
	}

	/**
	 * Get all unlocked abilities with full definitions
	 */
	getUnlockedAbilities(): AbilityDefinition[] {
		return MILESTONE_ABILITIES.filter((ability) => this.unlockedAbilities.has(ability.id));
	}

	/**
	 * Get all locked abilities that can still be unlocked
	 */
	getLockedAbilities(): AbilityDefinition[] {
		return MILESTONE_ABILITIES.filter((ability) => !this.unlockedAbilities.has(ability.id));
	}

	/**
	 * Get the next ability to unlock (lowest level requirement not yet unlocked)
	 */
	getNextAbilityToUnlock(): AbilityDefinition | undefined {
		const locked = this.getLockedAbilities();
		if (locked.length === 0) return undefined;
		return locked.sort((a, b) => a.unlockLevel - b.unlockLevel)[0];
	}

	/**
	 * Get ability by ID
	 */
	getAbilityById(id: string): AbilityDefinition | undefined {
		return MILESTONE_ABILITIES.find((ability) => ability.id === id);
	}

	/**
	 * Get the number of unlocked abilities
	 */
	getUnlockedCount(): number {
		return this.unlockedAbilities.size;
	}

	/**
	 * Get the total number of milestone abilities
	 */
	getTotalCount(): number {
		return MILESTONE_ABILITIES.length;
	}

	/**
	 * Get the level required to unlock a specific ability
	 */
	getUnlockLevel(abilityId: string): number | undefined {
		const ability = this.getAbilityById(abilityId);
		return ability?.unlockLevel;
	}

	/**
	 * Sync unlocked abilities with story flags
	 */
	syncWithStoryFlags(flags: StoryFlag[]): void {
		const flagSet = new Set(flags);

		MILESTONE_ABILITIES.forEach((ability) => {
			if (flagSet.has(ability.storyFlag)) {
				this.unlockedAbilities.add(ability.id);
			}
		});

		this.save();
	}

	/**
	 * Save unlocked abilities to localStorage
	 */
	save(): void {
		try {
			const data = Array.from(this.unlockedAbilities);
			localStorage.setItem(this.storageKey, JSON.stringify(data));
		} catch (error) {
			console.warn('[NeverquestAbilityManager] Failed to save:', error);
		}
	}

	/**
	 * Load unlocked abilities from localStorage
	 */
	load(): void {
		try {
			const stored = localStorage.getItem(this.storageKey);
			if (stored) {
				const data = JSON.parse(stored) as string[];
				data.forEach((abilityId) => this.unlockedAbilities.add(abilityId));
			}
		} catch (error) {
			console.warn('[NeverquestAbilityManager] Failed to load:', error);
		}
	}

	/**
	 * Reset all ability unlocks (for new game)
	 */
	reset(): void {
		this.unlockedAbilities.clear();
		localStorage.removeItem(this.storageKey);
	}

	/**
	 * Get ability unlocks as serializable data (for save system)
	 */
	toJSON(): string[] {
		return Array.from(this.unlockedAbilities);
	}

	/**
	 * Load ability unlocks from serialized data
	 */
	fromJSON(data: string[]): void {
		this.unlockedAbilities = new Set(data || []);
	}

	/**
	 * Clean up event listeners
	 */
	destroy(): void {
		this.scene.events.off('abilityUnlocked', this.handleAbilityUnlock, this);
		this.scene.events.off('playerLevelUp', this.onLevelUp, this);
	}
}
