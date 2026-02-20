/**
 * @fileoverview Frost Spider enemy configuration
 *
 * This file defines the Frost Spider enemy type for Ice Caverns:
 * - Animation definitions (idle, walk, attack per direction)
 * - Combat stats (fast, moderate attack, low defense)
 * - Ice damage bonus and web attack capability
 * - Drop table with frost-themed items
 *
 * Frost Spider: Fast predator with freezing bite attacks.
 * Found in the Ice Caverns biome (level 15-20 range).
 *
 * @see Enemy - Enemy entity class
 * @see NeverquestEnemyZones - Spawns enemies
 * @see EnemiesSeedConfig - Enemy registry
 * @see IceCavernsScene - Primary spawn location
 *
 * @module consts/enemies/frostSpider
 */

import { createEnemyAnimations, createEnemyConfig, EnemyTier, COMMON_DROPS } from './EnemyTemplate';
import { EntityDrops } from '../../models/EntityDrops';

/**
 * Frost Spider animation configurations
 * Uses bat atlas as placeholder until frost spider sprites are created
 */
export const FrostSpider = createEnemyAnimations({
	name: 'frostSpider',
	atlas: 'bat', // Placeholder - replace with 'frost_spider' when available
	atlasPrefix: 'bat', // Placeholder prefix
	frameRates: {
		idle: 3,
		walk: 8,
		atk: 6,
	},
});

/**
 * Frost Spider enemy configuration
 *
 * Stats tuned for Ice Caverns difficulty (level 15-20):
 * - Fast movement speed (40) for aggressive pursuit
 * - Moderate attack (10) with implied frost damage
 * - Low defense (3) - glass cannon archetype
 * - Good hit chance (8) for reliable attacks
 *
 * Drops frost-themed items including ice shards for crafting
 */
export const FrostSpiderConfig = createEnemyConfig({
	id: 10, // Next available ID after existing enemies
	name: 'Frost Spider',
	texture: 'bat', // Placeholder - replace with 'frost_spider' when available
	tier: EnemyTier.COMMON,
	baseHealth: 25,
	atack: 10,
	defense: 3,
	speed: 40,
	flee: 3,
	hit: 8,
	exp: 60,
	healthBarOffsetX: -6,
	healthBarOffsetY: 16,
	drops: [
		COMMON_DROPS.HEALTH_POTION(40),
		COMMON_DROPS.MANA_POTION(15),
		new EntityDrops(4, 25), // Ice shard (crafting material) - TODO: add item ID
	],
});
