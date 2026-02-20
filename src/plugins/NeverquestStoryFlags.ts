/**
 * @fileoverview Story progression flag system for Neverquest
 *
 * This plugin tracks narrative progression through boolean flags:
 * - Act completion tracking (Act 1, 2, 3)
 * - NPC encounter flags (met_elder, met_merchant, etc.)
 * - Quest item collection (sunstone fragments)
 * - Multiple ending support (heroic, sacrifice, hidden)
 * - Spell unlock triggers
 *
 * Flags persist via save system and gate content:
 * - Dialog options based on flags
 * - Area access based on progress
 * - Spell/ability unlocks
 *
 * @see NeverquestSaveManager - Persists flags
 * @see NeverquestSpellManager - Reacts to unlock flags
 * @see CrossroadsScene - Uses flags for NPC dialogs
 *
 * @module plugins/NeverquestStoryFlags
 */

import Phaser from 'phaser';

/**
 * Story flag keys for tracking narrative progression
 */
export enum StoryFlag {
	// Act 1 - The Awakening
	INTRO_COMPLETE = 'intro_complete',
	MET_ELDER = 'met_elder',
	CAVE_ARTIFACT_RETRIEVED = 'cave_artifact_retrieved',
	CAVE_BOSS_DEFEATED = 'cave_boss_defeated',
	ACT_1_COMPLETE = 'act_1_complete',

	// Act 2 - The Journey (Crossroads)
	ENTERED_CROSSROADS = 'entered_crossroads',
	MET_MERCHANT = 'met_merchant',
	MET_FALLEN_KNIGHT = 'met_fallen_knight',
	ALLIED_WITH_KNIGHT = 'allied_with_knight',
	MET_ORACLE = 'met_oracle',
	RECEIVED_PROPHECY = 'received_prophecy',

	// Sunstone Fragments
	FRAGMENT_RUINS_OBTAINED = 'fragment_ruins_obtained',
	FRAGMENT_TEMPLE_OBTAINED = 'fragment_temple_obtained',
	FRAGMENT_GATE_OBTAINED = 'fragment_gate_obtained',
	SUNSTONE_RESTORED = 'sunstone_restored',

	// Act 3 - The Reckoning
	DARK_GATE_OPENED = 'dark_gate_opened',
	ENTERED_CITADEL = 'entered_citadel',
	SHADOW_GUARDIAN_DEFEATED = 'shadow_guardian_defeated',
	VOID_KING_CONFRONTED = 'void_king_confronted',

	// Endings
	ENDING_HEROIC = 'ending_heroic',
	ENDING_SACRIFICE = 'ending_sacrifice',
	ENDING_HIDDEN = 'ending_hidden',

	// Act Completion Flags
	COMPLETED_ACT_1 = 'completed_act_1',
	COMPLETED_ACT_2 = 'completed_act_2',
	COMPLETED_ACT_3 = 'completed_act_3',

	// Special NPC Interactions
	ORACLE_HELPED = 'oracle_helped',

	// Spell Unlocks (story-gated)
	SPELL_FLAME_WAVE_UNLOCKED = 'spell_flame_wave_unlocked',
	SPELL_FROST_NOVA_UNLOCKED = 'spell_frost_nova_unlocked',
	SPELL_CHAIN_LIGHTNING_UNLOCKED = 'spell_chain_lightning_unlocked',
	SPELL_DIVINE_SHIELD_UNLOCKED = 'spell_divine_shield_unlocked',
	SPELL_POISON_CLOUD_UNLOCKED = 'spell_poison_cloud_unlocked',

	// Milestone Abilities
	ABILITY_DOUBLE_JUMP = 'ability_double_jump',
	ABILITY_SPRINT_BOOST = 'ability_sprint_boost',
	ABILITY_MAGIC_SHIELD = 'ability_magic_shield',
	ABILITY_SHADOW_STEP = 'ability_shadow_step',
}

/**
 * Story choice tracking for branching narratives
 */
export interface StoryChoice {
	id: string;
	description: string;
	timestamp: number;
	consequences: string[];
}

/**
 * NeverquestStoryFlags - Manages story progression and player choices
 *
 * This plugin tracks:
 * - Major story milestones (boss defeats, area completions)
 * - Player choices that affect the narrative
 * - Unlockable content (spells, abilities)
 * - Multiple ending paths
 *
 * Usage:
 * ```typescript
 * const storyFlags = new NeverquestStoryFlags(scene);
 * storyFlags.setFlag(StoryFlag.MET_FALLEN_KNIGHT);
 * if (storyFlags.hasFlag(StoryFlag.ALLIED_WITH_KNIGHT)) {
 *   // Show different dialog options
 * }
 * ```
 */
export class NeverquestStoryFlags {
	private scene: Phaser.Scene;
	private flags: Set<StoryFlag>;
	private choices: StoryChoice[];
	private storageKey: string;

	constructor(scene: Phaser.Scene) {
		this.scene = scene;
		this.flags = new Set();
		this.choices = [];
		this.storageKey = 'neverquest_story_flags';
	}

	/**
	 * Set a story flag as completed/true
	 */
	setFlag(flag: StoryFlag): void {
		this.flags.add(flag);
		this.onFlagSet(flag);
		this.save();
	}

	/**
	 * Check if a story flag is set
	 */
	hasFlag(flag: StoryFlag): boolean {
		return this.flags.has(flag);
	}

	/**
	 * Remove a story flag (for testing/debug purposes)
	 */
	clearFlag(flag: StoryFlag): void {
		this.flags.delete(flag);
		this.save();
	}

	/**
	 * Get all set flags
	 */
	getAllFlags(): StoryFlag[] {
		return Array.from(this.flags);
	}

	/**
	 * Record a story choice for narrative tracking
	 */
	recordChoice(id: string, description: string, consequences: string[] = []): void {
		this.choices.push({
			id,
			description,
			timestamp: Date.now(),
			consequences,
		});
		this.save();
	}

	/**
	 * Get all recorded choices
	 */
	getChoices(): StoryChoice[] {
		return [...this.choices];
	}

	/**
	 * Check if a specific choice was made
	 */
	hasChoice(id: string): boolean {
		return this.choices.some((choice) => choice.id === id);
	}

	/**
	 * Calculate which ending the player is on track for
	 */
	getCurrentEndingPath(): 'heroic' | 'sacrifice' | 'hidden' | 'undetermined' {
		// Hidden ending requires discovering the truth about Lucius
		if (this.hasFlag(StoryFlag.RECEIVED_PROPHECY) && this.hasChoice('seek_true_origin')) {
			return 'hidden';
		}

		// Sacrifice ending if player showed willingness to sacrifice
		if (this.hasChoice('offer_self_to_seal_darkness')) {
			return 'sacrifice';
		}

		// Heroic is the default path
		if (this.hasFlag(StoryFlag.SUNSTONE_RESTORED)) {
			return 'heroic';
		}

		return 'undetermined';
	}

	/**
	 * Get the number of Sunstone fragments collected
	 */
	getFragmentCount(): number {
		let count = 0;
		if (this.hasFlag(StoryFlag.FRAGMENT_RUINS_OBTAINED)) count++;
		if (this.hasFlag(StoryFlag.FRAGMENT_TEMPLE_OBTAINED)) count++;
		if (this.hasFlag(StoryFlag.FRAGMENT_GATE_OBTAINED)) count++;
		return count;
	}

	/**
	 * Check if all fragments are collected
	 */
	hasAllFragments(): boolean {
		return this.getFragmentCount() === 3;
	}

	/**
	 * Check if the Dark Gate can be opened
	 */
	canOpenDarkGate(): boolean {
		return this.hasAllFragments() && this.hasFlag(StoryFlag.SUNSTONE_RESTORED);
	}

	/**
	 * Get current act based on flags
	 */
	getCurrentAct(): 1 | 2 | 3 {
		if (this.hasFlag(StoryFlag.DARK_GATE_OPENED)) {
			return 3;
		}
		if (this.hasFlag(StoryFlag.ENTERED_CROSSROADS)) {
			return 2;
		}
		return 1;
	}

	/**
	 * Handle side effects when certain flags are set
	 */
	private onFlagSet(flag: StoryFlag): void {
		switch (flag) {
			case StoryFlag.CAVE_BOSS_DEFEATED:
				// Unlock Flame Wave spell after Act 1 boss
				this.setFlag(StoryFlag.SPELL_FLAME_WAVE_UNLOCKED);
				this.scene.events.emit('spellUnlocked', 'flame_wave');
				break;

			case StoryFlag.FRAGMENT_RUINS_OBTAINED:
				// Unlock Frost Nova after first fragment
				this.setFlag(StoryFlag.SPELL_FROST_NOVA_UNLOCKED);
				this.scene.events.emit('spellUnlocked', 'frost_nova');
				break;

			case StoryFlag.FRAGMENT_TEMPLE_OBTAINED:
				// Unlock Chain Lightning after second fragment
				this.setFlag(StoryFlag.SPELL_CHAIN_LIGHTNING_UNLOCKED);
				this.scene.events.emit('spellUnlocked', 'chain_lightning');
				break;

			case StoryFlag.MET_ORACLE:
				// Oracle can unlock Divine Shield if player shows virtue
				if (this.hasChoice('helped_fallen_knight')) {
					this.setFlag(StoryFlag.SPELL_DIVINE_SHIELD_UNLOCKED);
					this.scene.events.emit('spellUnlocked', 'divine_shield');
				}
				break;

			case StoryFlag.ENTERED_CITADEL:
				// Dark magic becomes available in the citadel
				this.setFlag(StoryFlag.SPELL_POISON_CLOUD_UNLOCKED);
				this.scene.events.emit('spellUnlocked', 'poison_cloud');
				break;

			case StoryFlag.SUNSTONE_RESTORED:
				// Major story milestone - could trigger cutscene
				this.scene.events.emit('sunstoneRestored');
				break;

			default:
				break;
		}
	}

	/**
	 * Save flags to localStorage
	 */
	save(): void {
		try {
			const data = {
				flags: Array.from(this.flags),
				choices: this.choices,
			};
			localStorage.setItem(this.storageKey, JSON.stringify(data));
		} catch (error) {
			console.warn('[NeverquestStoryFlags] Failed to save:', error);
		}
	}

	/**
	 * Load flags from localStorage
	 */
	load(): void {
		try {
			const stored = localStorage.getItem(this.storageKey);
			if (stored) {
				const data = JSON.parse(stored);
				this.flags = new Set(data.flags || []);
				this.choices = data.choices || [];
			}
		} catch (error) {
			console.warn('[NeverquestStoryFlags] Failed to load:', error);
		}
	}

	/**
	 * Reset all story progress (new game)
	 */
	reset(): void {
		this.flags.clear();
		this.choices = [];
		localStorage.removeItem(this.storageKey);
	}

	/**
	 * Get story progress as a serializable object (for save system integration)
	 */
	toJSON(): { flags: StoryFlag[]; choices: StoryChoice[] } {
		return {
			flags: Array.from(this.flags),
			choices: this.choices,
		};
	}

	/**
	 * Load story progress from a serialized object
	 */
	fromJSON(data: { flags: StoryFlag[]; choices: StoryChoice[] }): void {
		this.flags = new Set(data.flags || []);
		this.choices = data.choices || [];
	}
}
