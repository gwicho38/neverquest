/**
 * @fileoverview Lava Golem enemy configuration
 *
 * This file defines the Lava Golem enemy type for Volcanic Dungeons:
 * - Animation definitions (idle, walk, attack per direction)
 * - Combat stats (slow, extremely high defense, fire trails)
 * - Tank archetype with area denial
 * - Drop table with valuable fire-themed items
 *
 * Lava Golem: Slow but nearly impervious tank that leaves fire trails.
 * Found in the Volcanic Dungeons biome (level 20-25 range).
 *
 * @see Enemy - Enemy entity class
 * @see NeverquestEnemyZones - Spawns enemies
 * @see EnemiesSeedConfig - Enemy registry
 * @see VolcanicDungeonsScene - Primary spawn location
 *
 * @module consts/enemies/lavaGolem
 */

import { createEnemyAnimations, createEnemyConfig, EnemyTier, COMMON_DROPS } from './EnemyTemplate';
import { EntityDrops } from '../../models/EntityDrops';

/**
 * Lava Golem animation configurations
 * Uses ogre atlas as placeholder until lava golem sprites are created
 */
export const LavaGolem = createEnemyAnimations({
	name: 'lavaGolem',
	atlas: 'ogre', // Placeholder - replace with 'lava_golem' when available
	atlasPrefix: 'ogre', // Placeholder prefix
	frameRates: {
		idle: 1,
		walk: 2,
		atk: 3,
	},
});

/**
 * Lava Golem enemy configuration
 *
 * Stats tuned for Volcanic Dungeons difficulty (level 20-25):
 * - Very slow movement (12) - lumbering rock creature
 * - Moderate attack (16) with burn effect
 * - Very high defense (15) - nearly impervious
 * - High HP (80) - requires sustained damage
 *
 * Special mechanics (to be implemented):
 * - Leaves fire trails when moving
 * - Immune to fire damage
 */
export const LavaGolemConfig = createEnemyConfig({
	id: 15, // Next available ID
	name: 'Lava Golem',
	texture: 'ogre', // Placeholder - replace with 'lava_golem' when available
	tier: EnemyTier.ELITE,
	baseHealth: 80,
	atack: 16,
	defense: 15,
	speed: 12,
	flee: 1,
	hit: 6,
	exp: 120,
	healthBarOffsetX: -10,
	healthBarOffsetY: 24,
	drops: [
		COMMON_DROPS.HEALTH_POTION(60),
		COMMON_DROPS.MANA_POTION(35),
		new EntityDrops(8, 60), // Molten core
		new EntityDrops(9, 15), // Heat resistance armor piece - TODO: add item ID
	],
});
