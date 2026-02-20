/**
 * @fileoverview Spell definitions and magic system configuration
 *
 * This file defines all spells available in the game:
 * - SpellType enum: Fire, Ice, Lightning, Holy, Dark
 * - SpellDefinition interface: Name, cost, damage, effects
 * - SPELLS constant: All available spells
 * - Unlock functions: Story-gated spell availability
 *
 * Spells are unlocked via story progression.
 *
 * @see SpellWheelScene - Spell selection UI
 * @see SpellEffects - Visual effects for spells
 * @see NeverquestSpellManager - Spell unlock tracking
 *
 * @module consts/Spells
 */

import { SpellColors } from './Colors';
import { SpellValues } from './Numbers';

// =============================================================================
// SPELL TYPES
// =============================================================================

export enum SpellType {
	FIRE = 'fire',
	ICE = 'ice',
	LIGHTNING = 'lightning',
	HOLY = 'holy',
	DARK = 'dark',
}

// =============================================================================
// SPELL DEFINITIONS
// =============================================================================

export interface SpellDefinition {
	id: string;
	name: string;
	type: SpellType;
	description: string;
	manaCost: number;
	cooldown: number;
	damageMultiplier: number;
	effectMethod: string; // Method name in SpellEffects class
	color: string;
	colorNumeric: number;
	unlocked: boolean;
}

export const SPELLS: SpellDefinition[] = [
	// Fire spells
	{
		id: 'fireball',
		name: 'Fireball',
		type: SpellType.FIRE,
		description: 'Launch a ball of fire at your target',
		manaCost: SpellValues.MANA_COST_MEDIUM,
		cooldown: SpellValues.COOLDOWN_SHORT,
		damageMultiplier: SpellValues.DAMAGE_NORMAL,
		effectMethod: 'fireball',
		color: SpellColors.FIRE,
		colorNumeric: SpellColors.FIRE_NUMERIC,
		unlocked: true,
	},
	{
		id: 'flameWave',
		name: 'Flame Wave',
		type: SpellType.FIRE,
		description: 'Send a wave of flames in a direction',
		manaCost: SpellValues.MANA_COST_HIGH,
		cooldown: SpellValues.COOLDOWN_MEDIUM,
		damageMultiplier: SpellValues.DAMAGE_STRONG,
		effectMethod: 'flameWave',
		color: SpellColors.FIRE,
		colorNumeric: SpellColors.FIRE_NUMERIC,
		unlocked: false,
	},

	// Ice spells
	{
		id: 'iceShard',
		name: 'Ice Shard',
		type: SpellType.ICE,
		description: 'Hurl a shard of ice at your enemy',
		manaCost: SpellValues.MANA_COST_LOW,
		cooldown: SpellValues.COOLDOWN_SHORT,
		damageMultiplier: SpellValues.DAMAGE_WEAK,
		effectMethod: 'iceShard',
		color: SpellColors.ICE,
		colorNumeric: SpellColors.ICE_NUMERIC,
		unlocked: true,
	},
	{
		id: 'frostNova',
		name: 'Frost Nova',
		type: SpellType.ICE,
		description: 'Create an explosion of ice around you',
		manaCost: SpellValues.MANA_COST_HIGH,
		cooldown: SpellValues.COOLDOWN_MEDIUM,
		damageMultiplier: SpellValues.DAMAGE_STRONG,
		effectMethod: 'frostNova',
		color: SpellColors.ICE,
		colorNumeric: SpellColors.ICE_NUMERIC,
		unlocked: false,
	},

	// Lightning spells
	{
		id: 'lightningBolt',
		name: 'Lightning Bolt',
		type: SpellType.LIGHTNING,
		description: 'Strike your target with lightning',
		manaCost: SpellValues.MANA_COST_MEDIUM,
		cooldown: SpellValues.COOLDOWN_SHORT,
		damageMultiplier: SpellValues.DAMAGE_NORMAL,
		effectMethod: 'lightningBolt',
		color: SpellColors.LIGHTNING,
		colorNumeric: SpellColors.LIGHTNING_NUMERIC,
		unlocked: true,
	},
	{
		id: 'chainLightning',
		name: 'Chain Lightning',
		type: SpellType.LIGHTNING,
		description: 'Lightning jumps between multiple enemies',
		manaCost: SpellValues.MANA_COST_VERY_HIGH,
		cooldown: SpellValues.COOLDOWN_LONG,
		damageMultiplier: SpellValues.DAMAGE_VERY_STRONG,
		effectMethod: 'chainLightning',
		color: SpellColors.LIGHTNING,
		colorNumeric: SpellColors.LIGHTNING_NUMERIC,
		unlocked: false,
	},

	// Holy spells
	{
		id: 'heal',
		name: 'Heal',
		type: SpellType.HOLY,
		description: 'Restore health to yourself',
		manaCost: SpellValues.MANA_COST_MEDIUM,
		cooldown: SpellValues.COOLDOWN_MEDIUM,
		damageMultiplier: SpellValues.DAMAGE_NORMAL,
		effectMethod: 'heal',
		color: SpellColors.HOLY,
		colorNumeric: SpellColors.HOLY_NUMERIC,
		unlocked: true,
	},
	{
		id: 'divineShield',
		name: 'Divine Shield',
		type: SpellType.HOLY,
		description: 'Create a protective shield around you',
		manaCost: SpellValues.MANA_COST_HIGH,
		cooldown: SpellValues.COOLDOWN_LONG,
		damageMultiplier: SpellValues.DAMAGE_NORMAL,
		effectMethod: 'divineShield',
		color: SpellColors.HOLY,
		colorNumeric: SpellColors.HOLY_NUMERIC,
		unlocked: false,
	},

	// Dark spells
	{
		id: 'shadowBolt',
		name: 'Shadow Bolt',
		type: SpellType.DARK,
		description: 'Fire a bolt of dark energy',
		manaCost: SpellValues.MANA_COST_MEDIUM,
		cooldown: SpellValues.COOLDOWN_SHORT,
		damageMultiplier: SpellValues.DAMAGE_NORMAL,
		effectMethod: 'shadowBolt',
		color: SpellColors.DARK,
		colorNumeric: SpellColors.DARK_NUMERIC,
		unlocked: true,
	},
	{
		id: 'poisonCloud',
		name: 'Poison Cloud',
		type: SpellType.DARK,
		description: 'Create a cloud of poison',
		manaCost: SpellValues.MANA_COST_HIGH,
		cooldown: SpellValues.COOLDOWN_MEDIUM,
		damageMultiplier: SpellValues.DAMAGE_STRONG,
		effectMethod: 'poisonCloud',
		color: SpellColors.DARK,
		colorNumeric: SpellColors.DARK_NUMERIC,
		unlocked: false,
	},
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get all unlocked spells
 */
export function getUnlockedSpells(): SpellDefinition[] {
	return SPELLS.filter((spell) => spell.unlocked);
}

/**
 * Get spells by type
 */
export function getSpellsByType(type: SpellType): SpellDefinition[] {
	return SPELLS.filter((spell) => spell.type === type);
}

/**
 * Get spell by ID
 */
export function getSpellById(id: string): SpellDefinition | undefined {
	return SPELLS.find((spell) => spell.id === id);
}

/**
 * Get color for spell type
 */
export function getSpellTypeColor(type: SpellType): string {
	switch (type) {
		case SpellType.FIRE:
			return SpellColors.FIRE;
		case SpellType.ICE:
			return SpellColors.ICE;
		case SpellType.LIGHTNING:
			return SpellColors.LIGHTNING;
		case SpellType.HOLY:
			return SpellColors.HOLY;
		case SpellType.DARK:
			return SpellColors.DARK;
		default:
			return '#ffffff';
	}
}

/**
 * Get numeric color for spell type
 */
export function getSpellTypeColorNumeric(type: SpellType): number {
	switch (type) {
		case SpellType.FIRE:
			return SpellColors.FIRE_NUMERIC;
		case SpellType.ICE:
			return SpellColors.ICE_NUMERIC;
		case SpellType.LIGHTNING:
			return SpellColors.LIGHTNING_NUMERIC;
		case SpellType.HOLY:
			return SpellColors.HOLY_NUMERIC;
		case SpellType.DARK:
			return SpellColors.DARK_NUMERIC;
		default:
			return 0xffffff;
	}
}
