/**
 * @fileoverview Fire Dragon boss enemy configuration
 *
 * This file defines the Fire Dragon boss for Volcanic Dungeons:
 * - Animation definitions (idle, walk, attack per direction)
 * - Boss-tier combat stats (devastating breath weapon)
 * - Special abilities: Fire breath, imp summoning, wing buffet
 * - Guaranteed legendary drops including Dragon Scale
 *
 * Fire Dragon: The final boss of Volcanic Dungeons biome.
 * Ancient dragon that commands fire itself.
 * Recommended level: 23-25 with heat resistance gear.
 *
 * @see Enemy - Enemy entity class
 * @see NeverquestEnemyZones - Spawns enemies
 * @see EnemiesSeedConfig - Enemy registry
 * @see VolcanicDungeonsScene - Boss encounter location
 *
 * @module consts/enemies/fireDragon
 */

import { createEnemyAnimations, createEnemyConfig, EnemyTier, COMMON_DROPS } from './EnemyTemplate';
import { EntityDrops } from '../../models/EntityDrops';

/**
 * Fire Dragon animation configurations
 * Uses ogre atlas as placeholder until fire dragon sprites are created
 */
export const FireDragon = createEnemyAnimations({
	name: 'fireDragon',
	atlas: 'ogre', // Placeholder - replace with 'fire_dragon' when available
	atlasPrefix: 'ogre', // Placeholder prefix
	frameRates: {
		idle: 1,
		walk: 2,
		atk: 4,
	},
});

/**
 * Fire Dragon boss configuration
 *
 * Stats tuned for Volcanic Dungeons boss (level 23-25):
 * - Moderate speed (18) - large but agile
 * - Devastating attack (42) - fire breath damage
 * - Very high defense (14) - dragon scales
 * - Boss-tier HP (250) - extended encounter
 *
 * Special mechanics (to be implemented in battle manager):
 * - Fire Breath: Cone AoE damage, leaves burning ground
 * - Summon Imps: Calls 2-3 Fire Imps as adds
 * - Wing Buffet: Knockback attack when surrounded
 * - Enrage: Below 25% HP, attack speed increases
 *
 * Drops guaranteed loot including the legendary Dragon Scale
 */
export const FireDragonConfig = createEnemyConfig({
	id: 18, // Next available ID
	name: 'Fire Dragon',
	texture: 'ogre', // Placeholder - replace with 'fire_dragon' when available
	tier: EnemyTier.BOSS,
	baseHealth: 250,
	atack: 42,
	defense: 14,
	speed: 18,
	flee: 6,
	hit: 12,
	exp: 750,
	healthBarOffsetX: -14,
	healthBarOffsetY: 32,
	drops: [
		...COMMON_DROPS.BOSS_LOOT, // Guaranteed potions
		new EntityDrops(8, 100), // Molten cores (guaranteed, multiple)
		new EntityDrops(9, 100), // Heat resistance armor (guaranteed)
		new EntityDrops(10, 100), // Drake scales
		new EntityDrops(12, 30), // Dragon Scale (legendary boss drop) - TODO: add item ID
	],
});
