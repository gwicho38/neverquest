/**
 * @fileoverview Shark enemy configuration for Underwater Temple biome
 *
 * Fast aquatic predator with charge attack behavior.
 * Patrols in predictable patterns, then charges when player is spotted.
 *
 * @module consts/enemies/shark
 */

import { EntityDrops } from '../../models/EntityDrops';
import { createEnemyAnimations, createEnemyConfig, EnemyTier } from './EnemyTemplate';

/**
 * Shark animation configurations
 * Uses bat atlas as placeholder until custom sprites are created
 */
export const Shark = createEnemyAnimations({
	name: 'shark',
	atlas: 'bat',
	atlasPrefix: 'bat',
});

/**
 * Shark enemy configuration
 *
 * Combat traits:
 * - Fast swimming predator (speed 42)
 * - Charge attack when player detected
 * - High attack damage on contact
 * - Circles back for repeat attacks
 *
 * Level range: 25-28
 * Biome: Underwater Temple
 */
export const SharkConfig = createEnemyConfig({
	id: 24,
	name: 'Shark',
	texture: 'bat',
	tier: EnemyTier.COMMON,
	baseHealth: 30,
	atack: 11,
	defense: 4,
	speed: 42, // Fast swimmer
	flee: 2,
	hit: 9,
	exp: 60,
	drops: [new EntityDrops(1, 55), new EntityDrops(2, 30)],
});
