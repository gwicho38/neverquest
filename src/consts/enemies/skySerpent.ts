/**
 * @fileoverview Sky Serpent enemy configuration for Sky Islands biome
 *
 * Flying boss-type mob with lightning breath attack.
 * Large serpent that patrols between islands.
 *
 * @module consts/enemies/skySerpent
 */

import { EntityDrops } from '../../models/EntityDrops';
import { createEnemyAnimations, createEnemyConfig, EnemyTier } from './EnemyTemplate';

/**
 * Sky Serpent animation configurations
 * Uses ogre atlas as placeholder until custom sprites are created
 */
export const SkySerpent = createEnemyAnimations({
	name: 'skySerpent',
	atlas: 'ogre',
	atlasPrefix: 'ogre',
});

/**
 * Sky Serpent enemy configuration
 *
 * Combat traits:
 * - Large flying creature
 * - Lightning breath attack (cone AoE)
 * - Coils around platforms
 * - High HP, moderate speed
 *
 * Level range: 27-30
 * Biome: Sky Islands (mini-boss tier)
 */
export const SkySerpentConfig = createEnemyConfig({
	id: 21,
	name: 'Sky Serpent',
	texture: 'ogre',
	tier: EnemyTier.MINIBOSS,
	baseHealth: 100,
	atack: 20,
	defense: 10,
	speed: 28,
	flee: 4,
	hit: 11,
	exp: 250,
	drops: [new EntityDrops(1, 85), new EntityDrops(2, 60)],
});
