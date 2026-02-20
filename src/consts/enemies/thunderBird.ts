/**
 * @fileoverview Thunder Bird enemy configuration for Sky Islands biome
 *
 * Fast flying predator with lightning strike abilities.
 * Elite enemy, calls down lightning on player position.
 *
 * @module consts/enemies/thunderBird
 */

import { EntityDrops } from '../../models/EntityDrops';
import { createEnemyAnimations, createEnemyConfig, EnemyTier } from './EnemyTemplate';

/**
 * Thunder Bird animation configurations
 * Uses ogre atlas as placeholder until custom sprites are created
 */
export const ThunderBird = createEnemyAnimations({
	name: 'thunderBird',
	atlas: 'ogre',
	atlasPrefix: 'ogre',
});

/**
 * Thunder Bird enemy configuration
 *
 * Combat traits:
 * - Fastest flying enemy in Sky Islands
 * - Calls down lightning strikes at player position
 * - Dive bomb attacks
 * - Glass cannon (high damage, moderate HP)
 *
 * Level range: 27-30
 * Biome: Sky Islands
 */
export const ThunderBirdConfig = createEnemyConfig({
	id: 22,
	name: 'Thunder Bird',
	texture: 'ogre',
	tier: EnemyTier.ELITE,
	baseHealth: 35,
	atack: 16,
	defense: 4, // Low defense, relies on speed
	speed: 50, // Fastest sky enemy
	flee: 5,
	hit: 10,
	exp: 120,
	drops: [new EntityDrops(1, 75), new EntityDrops(2, 50)],
});
