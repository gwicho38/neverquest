/**
 * @fileoverview Leviathan boss configuration for Underwater Temple biome
 *
 * The ancient guardian of the Underwater Temple. A massive sea creature
 * that creates whirlpools, summons sharks, and uses devastating tail sweeps.
 *
 * @module consts/enemies/leviathan
 */

import { EntityDrops } from '../../models/EntityDrops';
import { createEnemyAnimations, createEnemyConfig, EnemyTier } from './EnemyTemplate';

/**
 * Leviathan animation configurations
 * Uses ogre atlas as placeholder until custom sprites are created
 */
export const Leviathan = createEnemyAnimations({
	name: 'leviathan',
	atlas: 'ogre',
	atlasPrefix: 'ogre',
});

/**
 * Leviathan boss configuration
 *
 * Combat traits:
 * - Multi-phase boss fight (3 phases)
 * - Phase 1: Tail sweep attacks, water jets
 * - Phase 2: Creates whirlpool, increased aggression
 * - Phase 3: Summons shark minions, rage mode
 * - Creates currents that limit player movement
 * - Highest HP boss in Underwater Temple
 *
 * Special drops:
 * - Leviathan Scale (legendary armor material)
 * - Trident weapons (water damage)
 *
 * Level: 30
 * Biome: Underwater Temple (Final Boss)
 */
export const LeviathanConfig = createEnemyConfig({
	id: 28,
	name: 'Leviathan',
	texture: 'ogre',
	tier: EnemyTier.BOSS,
	baseHealth: 350, // Highest HP underwater boss
	atack: 40,
	defense: 20, // Very high defense (thick hide)
	speed: 30, // Fast for size
	flee: 0, // Never flees
	hit: 15,
	exp: 900, // Massive exp reward
	drops: [new EntityDrops(1, 100), new EntityDrops(2, 100)],
});
