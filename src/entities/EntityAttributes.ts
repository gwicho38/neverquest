/**
 * @fileoverview Entity Attributes - Core attribute system for all game entities
 *
 * This module defines the attribute structure used by players, enemies, and NPCs.
 * It includes raw stats (STR, AGI, VIT, DEX, INT), bonus modifiers from equipment
 * and consumables, and derived stats like health, attack, and defense.
 *
 * Key Types:
 * - {@link IEntityAttributes} - Complete attribute interface
 * - {@link IRawAttributes} - Base stat values
 * - {@link IBonusAttributes} - Equipment/consumable/extra bonuses
 * - {@link IEquipmentBonus} - Item-based stat modifiers
 * - {@link IConsumableBonus} - Temporary timed effects
 *
 * @example
 * // Create a new entity with default attributes
 * const attrs: IEntityAttributes = { ...EntityAttributes };
 * attrs.level = 5;
 * attrs.rawAttributes.str = 10;
 *
 * @module entities/EntityAttributes
 */

/**
 * Raw attributes interface for base stats
 */
export interface IRawAttributes {
	str: number; // Strength
	agi: number; // Agility
	vit: number; // Vitality
	dex: number; // Dexterity
	int: number; // Intelligence
	[key: string]: number; // Index signature for dynamic access
}

/**
 * Base interface for stat modifiers
 */
export interface IStatModifier {
	[key: string]: number | string | undefined;
}

/**
 * Equipment bonus interface for equipped items
 */
export interface IEquipmentBonus extends IStatModifier {
	/** Equipment item ID */
	item?: string;
	/** Attack bonus */
	atk?: number;
	/** Defense bonus */
	def?: number;
	/** Health bonus */
	hp?: number;
	/** Mana bonus */
	mp?: number;
	/** Critical chance bonus */
	crit?: number;
	/** Dodge chance bonus */
	dodge?: number;
}

/**
 * Consumable bonus interface for temporary effects
 * Matches ConsumableBonus model structure
 */
export interface IConsumableBonus {
	/** Unique identifier for the bonus */
	uniqueId: number;
	/** The stat being modified (e.g., 'atack', 'defense') */
	statBonus: string;
	/** The value of the bonus */
	value: number;
	/** Duration in seconds */
	time: number;
	/** Timer event reference (managed by Phaser) */
	timer?: Phaser.Time.TimerEvent | null;
}

/**
 * Extra bonus interface for miscellaneous modifiers
 */
export interface IExtraBonus extends IStatModifier {
	/** Attack bonus */
	atk?: number;
	/** Defense bonus */
	def?: number;
	/** Health bonus */
	hp?: number;
	/** Description or source */
	source?: string;
}

/**
 * Bonus attributes interface for equipment/consumable bonuses
 */
export interface IBonusAttributes {
	equipment: IEquipmentBonus[];
	consumable: IConsumableBonus[];
	extra: IExtraBonus[];
}

/**
 * Entity attributes interface for all entity stats
 */
export interface IEntityAttributes {
	/** The entity level */
	level: number;

	/** The raw base attributes of the entity */
	rawAttributes: IRawAttributes;

	/** Available stat points for attribute upgrades */
	availableStatPoints: number;

	/** Bonus attributes from equipment and consumables */
	bonus: IBonusAttributes;

	/** Current health points */
	health: number;

	/** Maximum health points */
	maxHealth: number;

	/** Base health without bonuses */
	baseHealth: number;

	/** Attack points */
	atack: number;

	/** Defense points */
	defense: number;

	/** Movement speed */
	speed: number;

	/** Critical chance percentage */
	critical: number;

	/** Flee/evasion stat */
	flee: number;

	/** Hit/accuracy stat */
	hit: number;

	/** Current experience points */
	experience: number;

	/** Experience needed for next level */
	nextLevelExperience: number;

	/** Index signature for dynamic stat access (used by consumable buffs) */
	[key: string]: number | IRawAttributes | IBonusAttributes;
}

/**
 * Default entity attributes object
 */
export const EntityAttributes: IEntityAttributes = {
	level: 1,
	rawAttributes: {
		str: 1, // Strength
		agi: 1, // Agility
		vit: 1, // Vitality
		dex: 1, // Dexterity
		int: 1, // Intelligence
	},
	availableStatPoints: 2,
	bonus: {
		equipment: [],
		consumable: [],
		extra: [],
	},
	health: 10,
	maxHealth: 10,
	baseHealth: 10,
	atack: 4,
	defense: 1,
	speed: 50,
	critical: 0,
	flee: 1,
	hit: 1,
	experience: 0,
	nextLevelExperience: 50,
};
