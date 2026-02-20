/**
 * @fileoverview Water Elemental enemy configuration for Underwater Temple biome
 *
 * Ranged magical enemy that creates water current attacks and pushback effects.
 * Elite enemy, more dangerous than standard aquatic creatures.
 *
 * @module consts/enemies/waterElemental
 */

import { EntityDrops } from '../../models/EntityDrops';
import { createEnemyAnimations, createEnemyConfig, EnemyTier } from './EnemyTemplate';

/**
 * Water Elemental animation configurations
 * Uses ogre atlas as placeholder until custom sprites are created
 */
export const WaterElemental = createEnemyAnimations({
	name: 'waterElemental',
	atlas: 'ogre',
	atlasPrefix: 'ogre',
});

/**
 * Water Elemental enemy configuration
 *
 * Combat traits:
 * - Ranged water blast attacks
 * - Creates current zones that push player
 * - High magic-based defense
 * - Slow but powerful
 *
 * Level range: 26-29
 * Biome: Underwater Temple
 */
export const WaterElementalConfig = createEnemyConfig({
	id: 25,
	name: 'Water Elemental',
	texture: 'ogre',
	tier: EnemyTier.ELITE,
	baseHealth: 50,
	atack: 15,
	defense: 9, // High elemental defense
	speed: 25, // Slow, but ranged
	flee: 2,
	hit: 10,
	exp: 110,
	drops: [new EntityDrops(1, 70), new EntityDrops(2, 50)],
});
