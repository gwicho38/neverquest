/**
 * @fileoverview Fire Drake enemy configuration
 *
 * This file defines the Fire Drake enemy type for Volcanic Dungeons:
 * - Animation definitions (idle, walk, attack per direction)
 * - Combat stats (flying, dive bomb attacks)
 * - High mobility and burst damage
 * - Drop table with fire-themed items
 *
 * Fire Drake: Flying predator with devastating dive attacks.
 * Found in the Volcanic Dungeons biome (level 20-25 range).
 *
 * @see Enemy - Enemy entity class
 * @see NeverquestEnemyZones - Spawns enemies
 * @see EnemiesSeedConfig - Enemy registry
 * @see VolcanicDungeonsScene - Primary spawn location
 *
 * @module consts/enemies/fireDrake
 */

import { createEnemyAnimations, createEnemyConfig, EnemyTier, COMMON_DROPS } from './EnemyTemplate';
import { EntityDrops } from '../../models/EntityDrops';

/**
 * Fire Drake animation configurations
 * Uses bat atlas as placeholder until fire drake sprites are created
 */
export const FireDrake = createEnemyAnimations({
	name: 'fireDrake',
	atlas: 'bat', // Placeholder - replace with 'fire_drake' when available
	atlasPrefix: 'bat', // Placeholder prefix
	frameRates: {
		idle: 3,
		walk: 6,
		atk: 5,
	},
});

/**
 * Fire Drake enemy configuration
 *
 * Stats tuned for Volcanic Dungeons difficulty (level 20-25):
 * - Fast movement (38) - flying creature
 * - High attack (18) - dive bomb damage
 * - Moderate defense (6) - scales protect
 * - Moderate HP (45) - balanced for mobility
 *
 * Special mechanics (to be implemented):
 * - Flying (ignores ground hazards)
 * - Dive bomb attack (charges at player)
 */
export const FireDrakeConfig = createEnemyConfig({
	id: 16, // Next available ID
	name: 'Fire Drake',
	texture: 'bat', // Placeholder - replace with 'fire_drake' when available
	tier: EnemyTier.COMMON,
	baseHealth: 45,
	atack: 18,
	defense: 6,
	speed: 38,
	flee: 2,
	hit: 10,
	exp: 100,
	healthBarOffsetX: -8,
	healthBarOffsetY: 18,
	drops: [
		COMMON_DROPS.HEALTH_POTION(50),
		COMMON_DROPS.MANA_POTION(25),
		new EntityDrops(8, 45), // Molten core
		new EntityDrops(10, 8), // Drake scale - TODO: add item ID
	],
});
