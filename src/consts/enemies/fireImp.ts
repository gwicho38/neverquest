/**
 * @fileoverview Fire Imp enemy configuration
 *
 * This file defines the Fire Imp enemy type for Volcanic Dungeons:
 * - Animation definitions (idle, walk, attack per direction)
 * - Combat stats (fast, ranged fireball attacks)
 * - Fire damage bonus
 * - Drop table with fire-themed items
 *
 * Fire Imp: Fast ranged attacker that hurls fireballs.
 * Found in the Volcanic Dungeons biome (level 20-25 range).
 *
 * @see Enemy - Enemy entity class
 * @see NeverquestEnemyZones - Spawns enemies
 * @see EnemiesSeedConfig - Enemy registry
 * @see VolcanicDungeonsScene - Primary spawn location
 *
 * @module consts/enemies/fireImp
 */

import { createEnemyAnimations, createEnemyConfig, EnemyTier, COMMON_DROPS } from './EnemyTemplate';
import { EntityDrops } from '../../models/EntityDrops';

/**
 * Fire Imp animation configurations
 * Uses bat atlas as placeholder until fire imp sprites are created
 */
export const FireImp = createEnemyAnimations({
	name: 'fireImp',
	atlas: 'bat', // Placeholder - replace with 'fire_imp' when available
	atlasPrefix: 'bat', // Placeholder prefix
	frameRates: {
		idle: 4,
		walk: 8,
		atk: 7,
	},
});

/**
 * Fire Imp enemy configuration
 *
 * Stats tuned for Volcanic Dungeons difficulty (level 20-25):
 * - Fast movement speed (45) for aggressive hit-and-run
 * - Moderate attack (12) with fire damage
 * - Very low defense (2) - glass cannon
 * - Low HP (20) - meant to swarm
 *
 * Drops fire-themed items including molten cores for crafting
 */
export const FireImpConfig = createEnemyConfig({
	id: 14, // Next available ID after frost enemies
	name: 'Fire Imp',
	texture: 'bat', // Placeholder - replace with 'fire_imp' when available
	tier: EnemyTier.MINION,
	baseHealth: 20,
	atack: 12,
	defense: 2,
	speed: 45,
	flee: 4,
	hit: 9,
	exp: 70,
	healthBarOffsetX: -6,
	healthBarOffsetY: 14,
	drops: [
		COMMON_DROPS.HEALTH_POTION(35),
		COMMON_DROPS.MANA_POTION(20),
		new EntityDrops(8, 30), // Molten core (crafting material) - TODO: add item ID
	],
});
