/**
 * @fileoverview Storm Phoenix boss configuration for Sky Islands biome
 *
 * The legendary boss of the Sky Islands. A massive phoenix that commands
 * storms and lightning. Multi-phase fight with resurrection mechanic.
 *
 * @module consts/enemies/stormPhoenix
 */

import { EntityDrops } from '../../models/EntityDrops';
import { createEnemyAnimations, createEnemyConfig, EnemyTier } from './EnemyTemplate';

/**
 * Storm Phoenix animation configurations
 * Uses ogre atlas as placeholder until custom sprites are created
 */
export const StormPhoenix = createEnemyAnimations({
	name: 'stormPhoenix',
	atlas: 'ogre',
	atlasPrefix: 'ogre',
});

/**
 * Storm Phoenix boss configuration
 *
 * Combat traits:
 * - Multi-phase boss fight (3 phases)
 * - Phase 1: Lightning strikes and wing buffets
 * - Phase 2: Tornado summon, increased speed
 * - Phase 3: Storm rage mode, enraged attacks
 * - Resurrection: Revives once with 30% HP (phoenix rebirth)
 * - Highest HP boss in Sky Islands
 *
 * Special drops:
 * - Phoenix Feather (resurrection item)
 * - Storm weapons (lightning damage)
 *
 * Level: 30
 * Biome: Sky Islands (Final Boss)
 */
export const StormPhoenixConfig = createEnemyConfig({
	id: 23,
	name: 'Storm Phoenix',
	texture: 'ogre',
	tier: EnemyTier.BOSS,
	baseHealth: 300, // Highest HP boss so far
	atack: 38,
	defense: 18,
	speed: 35, // Fast for a boss
	flee: 6,
	hit: 14,
	exp: 800, // Massive exp reward
	drops: [new EntityDrops(1, 100), new EntityDrops(2, 100)],
});
