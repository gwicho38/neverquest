/**
 * @fileoverview Frost Giant boss enemy configuration
 *
 * This file defines the Frost Giant boss for Ice Caverns:
 * - Animation definitions (idle, walk, attack per direction)
 * - Boss-tier combat stats (very high HP, devastating attacks)
 * - Special abilities: Area freeze, ice pillar summon
 * - Guaranteed valuable drops including Frozen Heart
 *
 * Frost Giant: The boss of Ice Caverns biome.
 * Massive ice-wielding giant with area control abilities.
 * Recommended level: 18-20 with frost resistance gear.
 *
 * @see Enemy - Enemy entity class
 * @see NeverquestEnemyZones - Spawns enemies
 * @see EnemiesSeedConfig - Enemy registry
 * @see IceCavernsScene - Boss encounter location
 *
 * @module consts/enemies/frostGiant
 */

import { createEnemyAnimations, createEnemyConfig, EnemyTier, COMMON_DROPS } from './EnemyTemplate';
import { EntityDrops } from '../../models/EntityDrops';

/**
 * Frost Giant animation configurations
 * Uses ogre atlas as placeholder until frost giant sprites are created
 */
export const FrostGiant = createEnemyAnimations({
	name: 'frostGiant',
	atlas: 'ogre', // Placeholder - replace with 'frost_giant' when available
	atlasPrefix: 'ogre', // Placeholder prefix
	frameRates: {
		idle: 1,
		walk: 2,
		atk: 3,
	},
});

/**
 * Frost Giant boss configuration
 *
 * Stats tuned for Ice Caverns boss (level 18-20):
 * - Very slow movement (12) - massive creature
 * - Devastating attack (35) - one-shot potential
 * - Very high defense (12) - requires sustained damage
 * - Boss-tier HP (180) - extended encounter
 *
 * Special mechanics (to be implemented in battle manager):
 * - Area freeze: Slows all nearby players
 * - Ice pillar: Summons blocking obstacles
 * - Frost armor: Regenerates defense when not taking damage
 *
 * Drops guaranteed loot including the rare Frozen Heart
 */
export const FrostGiantConfig = createEnemyConfig({
	id: 13, // Next available ID
	name: 'Frost Giant',
	texture: 'ogre', // Placeholder - replace with 'frost_giant' when available
	tier: EnemyTier.BOSS,
	baseHealth: 180,
	atack: 35,
	defense: 12,
	speed: 12,
	flee: 5,
	hit: 10,
	exp: 500,
	healthBarOffsetX: -12,
	healthBarOffsetY: 28,
	drops: [
		...COMMON_DROPS.BOSS_LOOT, // Guaranteed potions
		new EntityDrops(13, 100), // Ice shards (guaranteed, multiple)
		new EntityDrops(5, 100), // Cold resistance potion (guaranteed)
		new EntityDrops(6, 50), // Yeti fur
		new EntityDrops(7, 25), // Frozen Heart (rare boss drop)
	],
});
