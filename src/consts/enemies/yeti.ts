/**
 * @fileoverview Yeti enemy configuration
 *
 * This file defines the Yeti enemy type for Ice Caverns:
 * - Animation definitions (idle, walk, attack per direction)
 * - Combat stats (slow, high HP, powerful melee)
 * - Frost roar area attack capability
 * - Drop table with valuable frost-themed items
 *
 * Yeti: Slow but powerful beast with devastating melee attacks.
 * Found in the Ice Caverns biome (level 15-20 range).
 * Acts as a mini-boss encounter.
 *
 * @see Enemy - Enemy entity class
 * @see NeverquestEnemyZones - Spawns enemies
 * @see EnemiesSeedConfig - Enemy registry
 * @see IceCavernsScene - Primary spawn location
 *
 * @module consts/enemies/yeti
 */

import { createEnemyAnimations, createEnemyConfig, EnemyTier, COMMON_DROPS } from './EnemyTemplate';
import { EntityDrops } from '../../models/EntityDrops';

/**
 * Yeti animation configurations
 * Uses ogre atlas as placeholder until yeti sprites are created
 */
export const Yeti = createEnemyAnimations({
	name: 'yeti',
	atlas: 'ogre', // Placeholder - replace with 'yeti' when available
	atlasPrefix: 'ogre', // Placeholder prefix
	frameRates: {
		idle: 1,
		walk: 3,
		atk: 4,
	},
});

/**
 * Yeti enemy configuration
 *
 * Stats tuned for Ice Caverns mini-boss (level 15-20):
 * - Very slow movement (15) - lumbering beast
 * - Very high attack (20) - devastating melee
 * - High defense (8) - tough hide
 * - Very high HP (70) - tank archetype
 *
 * Rare spawn, drops valuable crafting materials
 */
export const YetiConfig = createEnemyConfig({
	id: 12, // Next available ID
	name: 'Yeti',
	texture: 'ogre', // Placeholder - replace with 'yeti' when available
	tier: EnemyTier.MINIBOSS,
	baseHealth: 70,
	atack: 20,
	defense: 8,
	speed: 15,
	flee: 4,
	hit: 7,
	exp: 180,
	healthBarOffsetX: -10,
	healthBarOffsetY: 24,
	drops: [
		COMMON_DROPS.HEALTH_POTION(80),
		COMMON_DROPS.MANA_POTION(50),
		new EntityDrops(13, 100), // Ice shard (guaranteed)
		new EntityDrops(5, 30), // Cold resistance potion
		new EntityDrops(6, 15), // Yeti fur (rare crafting material)
	],
});
