/**
 * @fileoverview Wind Elemental enemy configuration for Sky Islands biome
 *
 * Ranged elemental enemy that attacks with cyclone bursts and knockback effects.
 * Elite enemy, appears near wind current zones.
 *
 * @module consts/enemies/windElemental
 */

import { EntityDrops } from '../../models/EntityDrops';
import { createEnemyAnimations, createEnemyConfig, EnemyTier } from './EnemyTemplate';

/**
 * Wind Elemental animation configurations
 * Uses ogre atlas as placeholder until custom sprites are created
 */
export const WindElemental = createEnemyAnimations({
	name: 'windElemental',
	atlas: 'ogre',
	atlasPrefix: 'ogre',
});

/**
 * Wind Elemental enemy configuration
 *
 * Combat traits:
 * - Cyclone attacks with knockback
 * - Can push player off platforms
 * - Ranged attacker, maintains distance
 * - High defense (elemental resistance)
 *
 * Level range: 26-29
 * Biome: Sky Islands
 */
export const WindElementalConfig = createEnemyConfig({
	id: 20,
	name: 'Wind Elemental',
	texture: 'ogre',
	tier: EnemyTier.ELITE,
	baseHealth: 45,
	atack: 14,
	defense: 8, // High elemental defense
	speed: 30,
	flee: 3,
	hit: 9,
	exp: 100,
	drops: [new EntityDrops(1, 70), new EntityDrops(2, 45)],
});
