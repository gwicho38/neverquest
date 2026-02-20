/**
 * @fileoverview Equipment tier definitions for story progression
 *
 * This file defines all equippable items across three tiers:
 * - Starter (Act 1): Basic gear like Wooden Sword, Leather Armor
 * - Upgraded (Act 2): Dungeon drops like Steel Blade, Chain Mail
 * - Legendary (Act 3): Boss rewards like Void Slayer, Dragon Plate
 *
 * 22 equipment pieces total across 5 slots.
 *
 * @see InventoryScene - Displays equipment
 * @see CharacterStatsScene - Shows equipment stats
 *
 * @module consts/equipment/EquipmentTiers
 */

import { StoryFlag } from '../../plugins/NeverquestStoryFlags';

/**
 * Equipment slot types
 */
export enum EquipmentSlot {
	WEAPON = 'weapon',
	ARMOR = 'armor',
	HELMET = 'helmet',
	SHIELD = 'shield',
	ACCESSORY = 'accessory',
}

/**
 * Equipment tier levels matching story acts
 */
export enum EquipmentTier {
	STARTER = 1, // Act 1 - Basic gear
	UPGRADED = 2, // Act 2 - Dungeon drops
	LEGENDARY = 3, // Act 3 - Boss rewards
}

/**
 * Equipment stat bonuses
 */
export interface EquipmentStats {
	attack?: number;
	defense?: number;
	health?: number;
	mana?: number;
	critChance?: number;
	dodgeChance?: number;
}

/**
 * Equipment definition interface
 */
export interface EquipmentDefinition {
	id: string;
	name: string;
	description: string;
	slot: EquipmentSlot;
	tier: EquipmentTier;
	stats: EquipmentStats;
	texture: string;
	unlockRequirement?: StoryFlag;
	dropSource?: string;
}

/**
 * Starter equipment (Act 1)
 * Available from the beginning or early game vendors
 */
export const STARTER_EQUIPMENT: EquipmentDefinition[] = [
	{
		id: 'woodenSword',
		name: 'Wooden Sword',
		description: 'A simple training sword made of sturdy oak.',
		slot: EquipmentSlot.WEAPON,
		tier: EquipmentTier.STARTER,
		stats: { attack: 3 },
		texture: 'wooden_sword',
	},
	{
		id: 'leatherArmor',
		name: 'Leather Armor',
		description: 'Basic protection made from tanned hides.',
		slot: EquipmentSlot.ARMOR,
		tier: EquipmentTier.STARTER,
		stats: { defense: 2, health: 5 },
		texture: 'leather_armor',
	},
	{
		id: 'clothCap',
		name: 'Cloth Cap',
		description: 'A simple cap offering minimal protection.',
		slot: EquipmentSlot.HELMET,
		tier: EquipmentTier.STARTER,
		stats: { defense: 1 },
		texture: 'cloth_cap',
	},
	{
		id: 'woodenShield',
		name: 'Wooden Shield',
		description: 'A lightweight shield carved from oak planks.',
		slot: EquipmentSlot.SHIELD,
		tier: EquipmentTier.STARTER,
		stats: { defense: 2, dodgeChance: 5 },
		texture: 'wooden_shield',
	},
	{
		id: 'copperRing',
		name: 'Copper Ring',
		description: 'A simple ring that slightly boosts vitality.',
		slot: EquipmentSlot.ACCESSORY,
		tier: EquipmentTier.STARTER,
		stats: { health: 10 },
		texture: 'copper_ring',
	},
];

/**
 * Upgraded equipment (Act 2)
 * Found in dungeons: Ancient Ruins, Forgotten Temple
 */
export const UPGRADED_EQUIPMENT: EquipmentDefinition[] = [
	{
		id: 'steelBlade',
		name: 'Steel Blade',
		description: 'A well-forged blade that cuts through armor.',
		slot: EquipmentSlot.WEAPON,
		tier: EquipmentTier.UPGRADED,
		stats: { attack: 8, critChance: 5 },
		texture: 'steel_blade',
		dropSource: 'Ancient Ruins',
	},
	{
		id: 'frostAxe',
		name: 'Frost Axe',
		description: 'An axe infused with ice magic that chills foes.',
		slot: EquipmentSlot.WEAPON,
		tier: EquipmentTier.UPGRADED,
		stats: { attack: 10 },
		texture: 'frost_axe',
		dropSource: 'Forgotten Temple',
		unlockRequirement: StoryFlag.SPELL_FROST_NOVA_UNLOCKED,
	},
	{
		id: 'chainMail',
		name: 'Chain Mail',
		description: 'Interlocking metal rings provide solid protection.',
		slot: EquipmentSlot.ARMOR,
		tier: EquipmentTier.UPGRADED,
		stats: { defense: 6, health: 15 },
		texture: 'chain_mail',
		dropSource: 'Ancient Ruins',
	},
	{
		id: 'runeArmor',
		name: 'Rune Armor',
		description: 'Armor etched with protective runes.',
		slot: EquipmentSlot.ARMOR,
		tier: EquipmentTier.UPGRADED,
		stats: { defense: 5, health: 10, mana: 20 },
		texture: 'rune_armor',
		dropSource: 'Forgotten Temple',
	},
	{
		id: 'ironHelm',
		name: 'Iron Helm',
		description: 'A sturdy helmet forged from iron.',
		slot: EquipmentSlot.HELMET,
		tier: EquipmentTier.UPGRADED,
		stats: { defense: 3, health: 5 },
		texture: 'iron_helm',
		dropSource: 'Ancient Ruins',
	},
	{
		id: 'mysticHood',
		name: 'Mystic Hood',
		description: 'A hood enchanted to enhance magical abilities.',
		slot: EquipmentSlot.HELMET,
		tier: EquipmentTier.UPGRADED,
		stats: { defense: 2, mana: 25 },
		texture: 'mystic_hood',
		dropSource: 'Forgotten Temple',
	},
	{
		id: 'ironKiteShield',
		name: 'Iron Kite Shield',
		description: 'A large shield offering excellent coverage.',
		slot: EquipmentSlot.SHIELD,
		tier: EquipmentTier.UPGRADED,
		stats: { defense: 5, dodgeChance: 10 },
		texture: 'iron_kite_shield',
		dropSource: 'Ancient Ruins',
	},
	{
		id: 'silverAmulet',
		name: 'Silver Amulet',
		description: 'An amulet that bolsters both body and mind.',
		slot: EquipmentSlot.ACCESSORY,
		tier: EquipmentTier.UPGRADED,
		stats: { health: 20, mana: 15 },
		texture: 'silver_amulet',
		dropSource: 'Forgotten Temple',
	},
];

/**
 * Legendary equipment (Act 3)
 * Dropped by bosses: Shadow Guardian, Void King
 */
export const LEGENDARY_EQUIPMENT: EquipmentDefinition[] = [
	{
		id: 'voidSlayer',
		name: 'Void Slayer',
		description: 'A legendary blade forged to destroy the darkness itself.',
		slot: EquipmentSlot.WEAPON,
		tier: EquipmentTier.LEGENDARY,
		stats: { attack: 20, critChance: 15 },
		texture: 'void_slayer',
		dropSource: 'Void King',
		unlockRequirement: StoryFlag.COMPLETED_ACT_3,
	},
	{
		id: 'shadowReaper',
		name: 'Shadow Reaper',
		description: 'A scythe that harvests the souls of the fallen.',
		slot: EquipmentSlot.WEAPON,
		tier: EquipmentTier.LEGENDARY,
		stats: { attack: 18, critChance: 20, health: -10 },
		texture: 'shadow_reaper',
		dropSource: 'Shadow Guardian',
	},
	{
		id: 'dragonPlate',
		name: 'Dragon Plate',
		description: 'Armor crafted from the scales of an ancient dragon.',
		slot: EquipmentSlot.ARMOR,
		tier: EquipmentTier.LEGENDARY,
		stats: { defense: 15, health: 50 },
		texture: 'dragon_plate',
		dropSource: 'Void King',
		unlockRequirement: StoryFlag.COMPLETED_ACT_3,
	},
	{
		id: 'shadowCloak',
		name: 'Shadow Cloak',
		description: 'A cloak woven from living shadows.',
		slot: EquipmentSlot.ARMOR,
		tier: EquipmentTier.LEGENDARY,
		stats: { defense: 8, dodgeChance: 25, mana: 30 },
		texture: 'shadow_cloak',
		dropSource: 'Shadow Guardian',
	},
	{
		id: 'crownOfTheVoid',
		name: 'Crown of the Void',
		description: 'The crown worn by the Void King himself.',
		slot: EquipmentSlot.HELMET,
		tier: EquipmentTier.LEGENDARY,
		stats: { defense: 10, mana: 50, critChance: 10 },
		texture: 'crown_of_void',
		dropSource: 'Void King',
		unlockRequirement: StoryFlag.COMPLETED_ACT_3,
	},
	{
		id: 'guardiansVisor',
		name: "Guardian's Visor",
		description: 'A visor that grants sight beyond mortal vision.',
		slot: EquipmentSlot.HELMET,
		tier: EquipmentTier.LEGENDARY,
		stats: { defense: 6, critChance: 15, dodgeChance: 10 },
		texture: 'guardians_visor',
		dropSource: 'Shadow Guardian',
	},
	{
		id: 'aegisOfLight',
		name: 'Aegis of Light',
		description: 'A shield blessed by the Oracle, impervious to darkness.',
		slot: EquipmentSlot.SHIELD,
		tier: EquipmentTier.LEGENDARY,
		stats: { defense: 12, dodgeChance: 15, health: 25 },
		texture: 'aegis_of_light',
		dropSource: 'Void King',
		unlockRequirement: StoryFlag.ORACLE_HELPED,
	},
	{
		id: 'voidHeart',
		name: 'Void Heart',
		description: 'A crystallized fragment of pure void energy.',
		slot: EquipmentSlot.ACCESSORY,
		tier: EquipmentTier.LEGENDARY,
		stats: { attack: 10, mana: 40, critChance: 10 },
		texture: 'void_heart',
		dropSource: 'Void King',
		unlockRequirement: StoryFlag.COMPLETED_ACT_3,
	},
	{
		id: 'shadowEmbrace',
		name: 'Shadow Embrace',
		description: 'A ring that lets you merge with shadows.',
		slot: EquipmentSlot.ACCESSORY,
		tier: EquipmentTier.LEGENDARY,
		stats: { dodgeChance: 20, mana: 25 },
		texture: 'shadow_embrace',
		dropSource: 'Shadow Guardian',
	},
];

/**
 * All equipment definitions combined
 */
export const ALL_EQUIPMENT: EquipmentDefinition[] = [
	...STARTER_EQUIPMENT,
	...UPGRADED_EQUIPMENT,
	...LEGENDARY_EQUIPMENT,
];

/**
 * Get equipment by tier
 */
export function getEquipmentByTier(tier: EquipmentTier): EquipmentDefinition[] {
	return ALL_EQUIPMENT.filter((eq) => eq.tier === tier);
}

/**
 * Get equipment by slot
 */
export function getEquipmentBySlot(slot: EquipmentSlot): EquipmentDefinition[] {
	return ALL_EQUIPMENT.filter((eq) => eq.slot === slot);
}

/**
 * Get equipment by ID
 */
export function getEquipmentById(id: string): EquipmentDefinition | undefined {
	return ALL_EQUIPMENT.find((eq) => eq.id === id);
}

/**
 * Get equipment dropped from a specific source
 */
export function getEquipmentByDropSource(source: string): EquipmentDefinition[] {
	return ALL_EQUIPMENT.filter((eq) => eq.dropSource === source);
}

/**
 * Calculate total stats from equipped items
 */
export function calculateTotalStats(equipment: EquipmentDefinition[]): EquipmentStats {
	return equipment.reduce(
		(total, eq) => ({
			attack: (total.attack || 0) + (eq.stats.attack || 0),
			defense: (total.defense || 0) + (eq.stats.defense || 0),
			health: (total.health || 0) + (eq.stats.health || 0),
			mana: (total.mana || 0) + (eq.stats.mana || 0),
			critChance: (total.critChance || 0) + (eq.stats.critChance || 0),
			dodgeChance: (total.dodgeChance || 0) + (eq.stats.dodgeChance || 0),
		}),
		{} as EquipmentStats
	);
}

/**
 * Tier display names for UI
 */
export const TIER_NAMES: Record<EquipmentTier, string> = {
	[EquipmentTier.STARTER]: 'Common',
	[EquipmentTier.UPGRADED]: 'Rare',
	[EquipmentTier.LEGENDARY]: 'Legendary',
};

/**
 * Tier colors for UI (hex)
 */
export const TIER_COLORS: Record<EquipmentTier, string> = {
	[EquipmentTier.STARTER]: 'FFFFFF', // White
	[EquipmentTier.UPGRADED]: '4169E1', // Royal Blue
	[EquipmentTier.LEGENDARY]: 'FFD700', // Gold
};
