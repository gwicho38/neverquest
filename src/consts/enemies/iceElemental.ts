/**
 * @fileoverview Ice Elemental enemy configuration
 *
 * This file defines the Ice Elemental enemy type for Ice Caverns:
 * - Animation definitions (idle, walk, attack per direction)
 * - Combat stats (ranged, high magic damage, low physical defense)
 * - Ice shard ranged attack capability
 * - Drop table with frost-themed items
 *
 * Ice Elemental: Ranged magic caster that hurls ice shards.
 * Found in the Ice Caverns biome (level 15-20 range).
 *
 * @see Enemy - Enemy entity class
 * @see NeverquestEnemyZones - Spawns enemies
 * @see EnemiesSeedConfig - Enemy registry
 * @see IceCavernsScene - Primary spawn location
 *
 * @module consts/enemies/iceElemental
 */

import { createEnemyAnimations, createEnemyConfig, EnemyTier, COMMON_DROPS } from './EnemyTemplate';
import { EntityDrops } from '../../models/EntityDrops';

/**
 * Ice Elemental animation configurations
 * Uses ogre atlas as placeholder until ice elemental sprites are created
 */
export const IceElemental = createEnemyAnimations({
	name: 'iceElemental',
	atlas: 'ogre', // Placeholder - replace with 'ice_elemental' when available
	atlasPrefix: 'ogre', // Placeholder prefix
	frameRates: {
		idle: 2,
		walk: 4,
		atk: 5,
	},
});

/**
 * Ice Elemental enemy configuration
 *
 * Stats tuned for Ice Caverns difficulty (level 15-20):
 * - Slow movement (20) - prefers to attack from range
 * - High attack (14) representing ice magic damage
 * - Low defense (2) - vulnerable when approached
 * - Moderate HP (35) for sustained ranged combat
 *
 * Drops valuable frost items including cold resistance potions
 */
export const IceElementalConfig = createEnemyConfig({
	id: 11, // Next available ID
	name: 'Ice Elemental',
	texture: 'ogre', // Placeholder - replace with 'ice_elemental' when available
	tier: EnemyTier.ELITE,
	baseHealth: 35,
	atack: 14,
	defense: 2,
	speed: 20,
	flee: 2,
	hit: 9,
	exp: 90,
	healthBarOffsetX: -8,
	healthBarOffsetY: 20,
	drops: [
		COMMON_DROPS.HEALTH_POTION(50),
		COMMON_DROPS.MANA_POTION(30),
		new EntityDrops(13, 40), // Ice shard (crafting material)
		new EntityDrops(5, 10), // Cold resistance potion
	],
});
