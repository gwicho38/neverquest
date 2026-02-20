/**
 * @fileoverview Magma Worm enemy configuration
 *
 * This file defines the Magma Worm enemy type for Volcanic Dungeons:
 * - Animation definitions (idle, walk, attack per direction)
 * - Combat stats (burrowing, emerges from lava)
 * - Surprise attack specialist
 * - Drop table with fire-themed items
 *
 * Magma Worm: Burrowing predator that emerges from lava pools.
 * Found in the Volcanic Dungeons biome (level 20-25 range).
 * Mini-boss tier enemy that guards lava crossings.
 *
 * @see Enemy - Enemy entity class
 * @see NeverquestEnemyZones - Spawns enemies
 * @see EnemiesSeedConfig - Enemy registry
 * @see VolcanicDungeonsScene - Primary spawn location
 *
 * @module consts/enemies/magmaWorm
 */

import { createEnemyAnimations, createEnemyConfig, EnemyTier, COMMON_DROPS } from './EnemyTemplate';
import { EntityDrops } from '../../models/EntityDrops';

/**
 * Magma Worm animation configurations
 * Uses ogre atlas as placeholder until magma worm sprites are created
 */
export const MagmaWorm = createEnemyAnimations({
	name: 'magmaWorm',
	atlas: 'ogre', // Placeholder - replace with 'magma_worm' when available
	atlasPrefix: 'ogre', // Placeholder prefix
	frameRates: {
		idle: 2,
		walk: 4,
		atk: 5,
	},
});

/**
 * Magma Worm enemy configuration
 *
 * Stats tuned for Volcanic Dungeons mini-boss (level 20-25):
 * - Moderate speed (25) - surface movement
 * - High attack (22) - surprise bite damage
 * - Moderate defense (8) - armored segments
 * - High HP (90) - mini-boss tier
 *
 * Special mechanics (to be implemented):
 * - Can burrow underground (invulnerable while burrowed)
 * - Emerges from lava pools (not damaged by lava)
 * - Surprise attack bonus damage
 */
export const MagmaWormConfig = createEnemyConfig({
	id: 17, // Next available ID
	name: 'Magma Worm',
	texture: 'ogre', // Placeholder - replace with 'magma_worm' when available
	tier: EnemyTier.MINIBOSS,
	baseHealth: 90,
	atack: 22,
	defense: 8,
	speed: 25,
	flee: 2,
	hit: 11,
	exp: 200,
	healthBarOffsetX: -10,
	healthBarOffsetY: 22,
	drops: [
		COMMON_DROPS.HEALTH_POTION(75),
		COMMON_DROPS.MANA_POTION(50),
		new EntityDrops(8, 100), // Molten core (guaranteed)
		new EntityDrops(9, 25), // Heat resistance armor piece
		new EntityDrops(11, 20), // Worm carapace (rare crafting) - TODO: add item ID
	],
});
