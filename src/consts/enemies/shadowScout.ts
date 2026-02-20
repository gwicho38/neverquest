/**
 * @fileoverview Shadow Scout enemy configuration
 *
 * This file defines the Shadow Scout enemy type:
 * - Animation definitions using bat sprite (placeholder)
 * - Elite combat stats (high health/attack/defense)
 * - Rare drop table with equipment
 *
 * Story: Shadow Scouts are advance agents of the Void King,
 * serving as optional mini-bosses in the Crossroads area.
 *
 * @see Enemy - Enemy entity class
 * @see NeverquestEnemyZones - Spawns enemies
 * @see EnemiesSeedConfig - Enemy registry
 *
 * @module consts/enemies/shadowScout
 */

import { EntityDrops } from '../../models/EntityDrops';

/**
 * Shadow Scout enemy configuration
 *
 * Story Context:
 * Shadow Scouts are advance agents of the Void King, sent to observe
 * and eliminate threats. They appear as roaming elite enemies in the
 * Crossroads area, foreshadowing the darkness that awaits in Act 3.
 *
 * These enemies are significantly more dangerous than standard foes
 * and serve as optional mini-bosses for players seeking a challenge.
 *
 * Uses bat sprite with faster animations as placeholder.
 * Shadow Scouts should eventually have unique dark/spectral visuals.
 */
export const ShadowScout = [
	// Down
	{
		atlas: 'bat',
		key: 'shadowscout-idle-down',
		frameRate: 4,
		prefix: 'bat/idle-down/bat',
		start: 0,
		end: 3,
		zeroPad: 2,
		repeat: -1,
	},
	{
		atlas: 'bat',
		key: 'shadowscout-atk-down',
		frameRate: 8,
		prefix: 'bat/atk-down/bat',
		start: 0,
		end: 4,
		zeroPad: 2,
		repeat: 0,
	},
	{
		atlas: 'bat',
		key: 'shadowscout-walk-down',
		frameRate: 10,
		prefix: 'bat/walk-down/bat',
		start: 0,
		end: 3,
		zeroPad: 2,
		repeat: -1,
	},

	// Right
	{
		atlas: 'bat',
		key: 'shadowscout-idle-right',
		frameRate: 4,
		prefix: 'bat/idle-right/bat',
		start: 0,
		end: 3,
		zeroPad: 2,
		repeat: -1,
	},
	{
		atlas: 'bat',
		key: 'shadowscout-walk-right',
		frameRate: 10,
		prefix: 'bat/walk-right/bat',
		start: 0,
		end: 3,
		zeroPad: 2,
		repeat: -1,
	},
	{
		atlas: 'bat',
		key: 'shadowscout-atk-right',
		frameRate: 8,
		prefix: 'bat/atk-right/bat',
		start: 0,
		end: 4,
		zeroPad: 2,
		repeat: 0,
	},

	// Up
	{
		atlas: 'bat',
		key: 'shadowscout-idle-up',
		frameRate: 4,
		prefix: 'bat/idle-up/bat',
		start: 0,
		end: 3,
		zeroPad: 2,
		repeat: -1,
	},
	{
		atlas: 'bat',
		key: 'shadowscout-walk-up',
		frameRate: 10,
		prefix: 'bat/walk-up/bat',
		start: 0,
		end: 3,
		zeroPad: 2,
		repeat: -1,
	},
	{
		atlas: 'bat',
		key: 'shadowscout-atk-up',
		frameRate: 8,
		prefix: 'bat/atk-up/bat',
		start: 0,
		end: 4,
		zeroPad: 2,
		repeat: 0,
	},
];

export const ShadowScoutConfig = {
	id: 6,
	name: 'Shadow Scout',
	texture: 'bat', // Placeholder - should have unique shadow/spectral sprite
	baseHealth: 50, // Elite enemy - much tougher
	atack: 12,
	defense: 5,
	speed: 40,
	flee: 0, // Never flees - relentless
	hit: 10,
	exp: 150, // High XP reward for defeating
	healthBarOffsetX: -5,
	healthBarOffsetY: 16,
	drops: [
		new EntityDrops(
			2, // Dark Potion
			80 // 80% chance
		),
		new EntityDrops(
			3, // Treasure
			25 // 25% chance
		),
		new EntityDrops(
			4, // Mighty Sword
			10 // 10% chance - rare drop
		),
	],
};
