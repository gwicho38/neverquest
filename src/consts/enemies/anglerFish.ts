/**
 * @fileoverview Angler Fish enemy configuration for Underwater Temple biome
 *
 * Ambush predator that lures players with its bioluminescent lure.
 * Mini-boss tier, appears in darker areas of the temple.
 *
 * @module consts/enemies/anglerFish
 */

import { EntityDrops } from '../../models/EntityDrops';
import { createEnemyAnimations, createEnemyConfig, EnemyTier } from './EnemyTemplate';

/**
 * Angler Fish animation configurations
 * Uses ogre atlas as placeholder until custom sprites are created
 */
export const AnglerFish = createEnemyAnimations({
	name: 'anglerFish',
	atlas: 'ogre',
	atlasPrefix: 'ogre',
});

/**
 * Angler Fish enemy configuration
 *
 * Combat traits:
 * - Bioluminescent lure attracts player
 * - Hidden ambush attack (massive first strike)
 * - Slow movement but devastating attack
 * - High HP for survival in deep waters
 *
 * Level range: 27-30
 * Biome: Underwater Temple (mini-boss)
 */
export const AnglerFishConfig = createEnemyConfig({
	id: 27,
	name: 'Angler Fish',
	texture: 'ogre',
	tier: EnemyTier.MINIBOSS,
	baseHealth: 90,
	atack: 22, // Devastating ambush attack
	defense: 8,
	speed: 20, // Slow, relies on ambush
	flee: 1, // Never flees
	hit: 12, // High accuracy on ambush
	exp: 220,
	drops: [new EntityDrops(1, 80), new EntityDrops(2, 55)],
});
