/**
 * @fileoverview Zombie enemy configuration for Undead Crypts biome
 *
 * Slow but tanky undead melee enemy. Relentless pursuit of players,
 * high HP compensates for slow movement speed.
 *
 * @module consts/enemies/zombie
 */

import { EntityDrops } from '../../models/EntityDrops';
import { createEnemyAnimations, createEnemyConfig, EnemyTier } from './EnemyTemplate';

/**
 * Zombie animation configurations
 * Uses ogre atlas as placeholder until custom sprites are created
 */
export const Zombie = createEnemyAnimations({
	name: 'zombie',
	atlas: 'ogre',
	atlasPrefix: 'ogre',
});

/**
 * Zombie enemy configuration
 *
 * Combat traits:
 * - Very slow movement (speed 18)
 * - High HP pool (tank)
 * - Strong melee attacks
 * - Never flees (relentless)
 *
 * Level range: 30-33
 * Biome: Undead Crypts
 */
export const ZombieConfig = createEnemyConfig({
	id: 29,
	name: 'Zombie',
	texture: 'ogre',
	tier: EnemyTier.COMMON,
	baseHealth: 40,
	atack: 10,
	defense: 5,
	speed: 18, // Very slow shambler
	flee: 0, // Never flees
	hit: 7,
	exp: 65,
	drops: [new EntityDrops(1, 60), new EntityDrops(2, 30)],
});
