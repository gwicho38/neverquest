/**
 * @fileoverview Harpy enemy configuration for Sky Islands biome
 *
 * Fast flying enemy with dive attacks and ranged wind blades.
 * Common enemy in the sky biome, hunts in groups.
 *
 * @module consts/enemies/harpy
 */

import { EntityDrops } from '../../models/EntityDrops';
import { createEnemyAnimations, createEnemyConfig, EnemyTier } from './EnemyTemplate';

/**
 * Harpy animation configurations
 * Uses ogre atlas as placeholder until custom sprites are created
 */
export const Harpy = createEnemyAnimations({
	name: 'harpy',
	atlas: 'ogre',
	atlasPrefix: 'ogre',
});

/**
 * Harpy enemy configuration
 *
 * Combat traits:
 * - Fast flying movement (speed 40)
 * - Dive attacks deal extra damage
 * - Can throw wind blade projectiles
 * - Often appears in groups of 2-3
 *
 * Level range: 25-28
 * Biome: Sky Islands
 */
export const HarpyConfig = createEnemyConfig({
	id: 19,
	name: 'Harpy',
	texture: 'ogre',
	tier: EnemyTier.COMMON,
	baseHealth: 25,
	atack: 9,
	defense: 3,
	speed: 40, // Fast flyer
	flee: 4,
	hit: 8,
	exp: 55,
	drops: [new EntityDrops(1, 55), new EntityDrops(2, 25)],
});
