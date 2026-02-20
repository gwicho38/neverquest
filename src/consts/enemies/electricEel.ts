/**
 * @fileoverview Electric Eel enemy configuration for Underwater Temple biome
 *
 * Shock-based enemy that creates electric zones and stuns players.
 * Fast mover that weaves through the water.
 *
 * @module consts/enemies/electricEel
 */

import { EntityDrops } from '../../models/EntityDrops';
import { createEnemyAnimations, createEnemyConfig, EnemyTier } from './EnemyTemplate';

/**
 * Electric Eel animation configurations
 * Uses bat atlas as placeholder until custom sprites are created
 */
export const ElectricEel = createEnemyAnimations({
	name: 'electricEel',
	atlas: 'bat',
	atlasPrefix: 'bat',
});

/**
 * Electric Eel enemy configuration
 *
 * Combat traits:
 * - Electric shock attack (stuns player)
 * - Creates shock zones around itself
 * - Fast, erratic movement patterns
 * - Lower health but dangerous shock damage
 *
 * Level range: 26-29
 * Biome: Underwater Temple
 */
export const ElectricEelConfig = createEnemyConfig({
	id: 26,
	name: 'Electric Eel',
	texture: 'bat',
	tier: EnemyTier.COMMON,
	baseHealth: 22,
	atack: 8, // Lower base attack
	defense: 3,
	speed: 38, // Fast but not as fast as shark
	flee: 4, // Tends to retreat and shock from range
	hit: 7,
	exp: 55,
	drops: [new EntityDrops(1, 50), new EntityDrops(2, 35)],
});
