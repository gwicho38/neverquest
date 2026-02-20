/**
 * @fileoverview Skeleton enemy configuration for Undead Crypts biome
 *
 * Medium-speed ranged undead enemy with bow attacks.
 * More fragile than zombies but attacks from distance.
 *
 * @module consts/enemies/skeleton
 */

import { EntityDrops } from '../../models/EntityDrops';
import { createEnemyAnimations, createEnemyConfig, EnemyTier } from './EnemyTemplate';

/**
 * Skeleton animation configurations
 * Uses bat atlas as placeholder until custom sprites are created
 */
export const Skeleton = createEnemyAnimations({
	name: 'skeleton',
	atlas: 'bat',
	atlasPrefix: 'bat',
});

/**
 * Skeleton enemy configuration
 *
 * Combat traits:
 * - Medium speed (speed 28)
 * - Ranged bow attacks
 * - Lower HP (fragile bones)
 * - Maintains distance from player
 *
 * Level range: 30-33
 * Biome: Undead Crypts
 */
export const SkeletonConfig = createEnemyConfig({
	id: 30,
	name: 'Skeleton',
	texture: 'bat',
	tier: EnemyTier.COMMON,
	baseHealth: 25,
	atack: 9,
	defense: 3, // Low defense (bones shatter easily)
	speed: 28,
	flee: 3, // Will retreat to maintain range
	hit: 8,
	exp: 55,
	drops: [new EntityDrops(1, 55), new EntityDrops(2, 25)],
});
