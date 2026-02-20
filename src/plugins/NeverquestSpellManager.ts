/**
 * @fileoverview Spell unlock and management system for Neverquest
 *
 * This plugin manages spell availability based on story progression:
 * - Tracks unlocked spells via story flags
 * - Provides API for checking spell availability
 * - Emits events when spells are unlocked
 * - Integrates with save system for persistence
 *
 * Story-gated spell unlocks:
 * - Flame Wave: Cave boss defeated (Act 1)
 * - Frost Nova: Ancient Ruins cleared (Act 2)
 * - Chain Lightning: Forgotten Temple cleared (Act 2)
 * - Divine Shield: Oracle quest completed (Act 2)
 * - Poison Cloud: Dark Citadel discovered (Act 3)
 *
 * @see NeverquestStoryFlags - Provides unlock triggers
 * @see SPELLS - Spell definitions
 * @see SpellWheelScene - Displays available spells
 *
 * @module plugins/NeverquestSpellManager
 */

import Phaser from 'phaser';
import { SPELLS, SpellDefinition } from '../consts/Spells';
import { StoryFlag } from './NeverquestStoryFlags';

/**
 * Mapping of spell IDs to the story flags that unlock them
 */
const SPELL_UNLOCK_MAP: Record<string, StoryFlag> = {
	flameWave: StoryFlag.SPELL_FLAME_WAVE_UNLOCKED,
	frostNova: StoryFlag.SPELL_FROST_NOVA_UNLOCKED,
	chainLightning: StoryFlag.SPELL_CHAIN_LIGHTNING_UNLOCKED,
	divineShield: StoryFlag.SPELL_DIVINE_SHIELD_UNLOCKED,
	poisonCloud: StoryFlag.SPELL_POISON_CLOUD_UNLOCKED,
};

/**
 * NeverquestSpellManager - Manages spell unlocks and state
 *
 * This plugin connects the story flag system to spell availability.
 * It listens for 'spellUnlocked' events and maintains runtime spell state.
 *
 * Usage:
 * ```typescript
 * const spellManager = new NeverquestSpellManager(scene);
 * spellManager.create();
 *
 * // Get all unlocked spells (includes default + story unlocked)
 * const spells = spellManager.getUnlockedSpells();
 *
 * // Check if a specific spell is unlocked
 * if (spellManager.isSpellUnlocked('flameWave')) {
 *   // Cast flame wave
 * }
 * ```
 */
export class NeverquestSpellManager {
	private scene: Phaser.Scene;
	private unlockedSpells: Set<string>;
	private storageKey: string;

	constructor(scene: Phaser.Scene) {
		this.scene = scene;
		this.unlockedSpells = new Set();
		this.storageKey = 'neverquest_spell_unlocks';
	}

	/**
	 * Initialize the spell manager and set up event listeners
	 */
	create(): void {
		// Initialize with default unlocked spells
		this.initializeDefaultSpells();

		// Load any previously saved unlocks
		this.load();

		// Listen for spell unlock events from NeverquestStoryFlags
		this.scene.events.on('spellUnlocked', this.handleSpellUnlock, this);

		// Clean up on scene shutdown
		this.scene.events.once('shutdown', this.destroy, this);
	}

	/**
	 * Initialize with spells marked as unlocked by default in SPELLS
	 */
	private initializeDefaultSpells(): void {
		SPELLS.forEach((spell) => {
			if (spell.unlocked) {
				this.unlockedSpells.add(spell.id);
			}
		});
	}

	/**
	 * Handle spell unlock event
	 * @param spellId - The ID of the spell being unlocked (snake_case from event)
	 */
	private handleSpellUnlock(spellId: string): void {
		// Convert snake_case event name to camelCase spell ID
		const spellIdCamel = this.snakeToCamel(spellId);

		if (!this.unlockedSpells.has(spellIdCamel)) {
			this.unlockedSpells.add(spellIdCamel);
			this.save();

			// Emit a game-level event for UI updates
			this.scene.events.emit('spellUnlockedUI', {
				spellId: spellIdCamel,
				spell: this.getSpellById(spellIdCamel),
			});

			console.log(`[NeverquestSpellManager] Spell unlocked: ${spellIdCamel}`);
		}
	}

	/**
	 * Convert snake_case to camelCase
	 */
	private snakeToCamel(str: string): string {
		return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
	}

	/**
	 * Unlock a spell by ID
	 */
	unlockSpell(spellId: string): void {
		if (!this.unlockedSpells.has(spellId)) {
			this.unlockedSpells.add(spellId);
			this.save();
		}
	}

	/**
	 * Check if a spell is unlocked
	 */
	isSpellUnlocked(spellId: string): boolean {
		return this.unlockedSpells.has(spellId);
	}

	/**
	 * Get all unlocked spells with full definitions
	 */
	getUnlockedSpells(): SpellDefinition[] {
		return SPELLS.filter((spell) => this.unlockedSpells.has(spell.id));
	}

	/**
	 * Get all locked spells that can still be unlocked
	 */
	getLockedSpells(): SpellDefinition[] {
		return SPELLS.filter((spell) => !this.unlockedSpells.has(spell.id));
	}

	/**
	 * Get spell by ID
	 */
	getSpellById(id: string): SpellDefinition | undefined {
		return SPELLS.find((spell) => spell.id === id);
	}

	/**
	 * Get the number of unlocked spells
	 */
	getUnlockedCount(): number {
		return this.unlockedSpells.size;
	}

	/**
	 * Get the total number of spells
	 */
	getTotalCount(): number {
		return SPELLS.length;
	}

	/**
	 * Get the story flag required to unlock a spell
	 */
	getUnlockRequirement(spellId: string): StoryFlag | undefined {
		return SPELL_UNLOCK_MAP[spellId];
	}

	/**
	 * Sync unlocked spells with story flags
	 * Call this when loading a save to ensure spells match story progress
	 */
	syncWithStoryFlags(flags: StoryFlag[]): void {
		const flagSet = new Set(flags);

		Object.entries(SPELL_UNLOCK_MAP).forEach(([spellId, requiredFlag]) => {
			if (flagSet.has(requiredFlag)) {
				this.unlockedSpells.add(spellId);
			}
		});

		this.save();
	}

	/**
	 * Save unlocked spells to localStorage
	 */
	save(): void {
		try {
			const data = Array.from(this.unlockedSpells);
			localStorage.setItem(this.storageKey, JSON.stringify(data));
		} catch (error) {
			console.warn('[NeverquestSpellManager] Failed to save:', error);
		}
	}

	/**
	 * Load unlocked spells from localStorage
	 */
	load(): void {
		try {
			const stored = localStorage.getItem(this.storageKey);
			if (stored) {
				const data = JSON.parse(stored) as string[];
				data.forEach((spellId) => this.unlockedSpells.add(spellId));
			}
		} catch (error) {
			console.warn('[NeverquestSpellManager] Failed to load:', error);
		}
	}

	/**
	 * Reset all spell unlocks (for new game)
	 */
	reset(): void {
		this.unlockedSpells.clear();
		this.initializeDefaultSpells();
		localStorage.removeItem(this.storageKey);
	}

	/**
	 * Get spell unlocks as serializable data (for save system)
	 */
	toJSON(): string[] {
		return Array.from(this.unlockedSpells);
	}

	/**
	 * Load spell unlocks from serialized data
	 */
	fromJSON(data: string[]): void {
		this.unlockedSpells = new Set(data || []);
		// Ensure default spells are always included
		this.initializeDefaultSpells();
	}

	/**
	 * Clean up event listeners
	 */
	destroy(): void {
		this.scene.events.off('spellUnlocked', this.handleSpellUnlock, this);
	}
}
