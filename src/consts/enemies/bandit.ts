/**
 * @fileoverview Bandit enemy configuration
 *
 * This file defines the Bandit enemy type:
 * - Animation definitions using ogre sprite (placeholder)
 * - Combat stats (moderate health, high agility)
 * - Drop table with potions
 *
 * Story: Bandits roam paths near the Crossroads, worshipping
 * the Sunstone fragment in the Ancient Ruins.
 *
 * @see Enemy - Enemy entity class
 * @see NeverquestEnemyZones - Spawns enemies
 * @see EnemiesSeedConfig - Enemy registry
 *
 * @module consts/enemies/bandit
 */

import { EntityDrops } from '../../models/EntityDrops';

/**
 * Bandit enemy configuration
 *
 * Story Context:
 * Bandits roam the paths near the Crossroads, particularly along the
 * western route to the Ancient Ruins. They worship the Sunstone fragment
 * hidden there, believing it grants them power.
 *
 * Uses ogre sprite as placeholder until dedicated bandit sprites are created.
 * Bandits are human-sized but more agile than ogres.
 */
export const Bandit = [
	// Down
	{
		atlas: 'ogre',
		key: 'bandit-idle-down',
		frameRate: 2,
		prefix: 'ogre/idle-down/ogre',
		start: 0,
		end: 3,
		zeroPad: 2,
		repeat: -1,
	},
	{
		atlas: 'ogre',
		key: 'bandit-atk-down',
		frameRate: 4,
		prefix: 'ogre/atk-down/ogre',
		start: 0,
		end: 4,
		zeroPad: 2,
		repeat: 0,
	},
	{
		atlas: 'ogre',
		key: 'bandit-walk-down',
		frameRate: 6,
		prefix: 'ogre/walk-down/ogre',
		start: 0,
		end: 3,
		zeroPad: 2,
		repeat: -1,
	},

	// Right
	{
		atlas: 'ogre',
		key: 'bandit-idle-right',
		frameRate: 2,
		prefix: 'ogre/idle-right/ogre',
		start: 0,
		end: 3,
		zeroPad: 2,
		repeat: -1,
	},
	{
		atlas: 'ogre',
		key: 'bandit-walk-right',
		frameRate: 6,
		prefix: 'ogre/walk-right/ogre',
		start: 0,
		end: 3,
		zeroPad: 2,
		repeat: -1,
	},
	{
		atlas: 'ogre',
		key: 'bandit-atk-right',
		frameRate: 4,
		prefix: 'ogre/atk-right/ogre',
		start: 0,
		end: 4,
		zeroPad: 2,
		repeat: 0,
	},

	// Up
	{
		atlas: 'ogre',
		key: 'bandit-idle-up',
		frameRate: 2,
		prefix: 'ogre/idle-up/ogre',
		start: 0,
		end: 3,
		zeroPad: 2,
		repeat: -1,
	},
	{
		atlas: 'ogre',
		key: 'bandit-walk-up',
		frameRate: 6,
		prefix: 'ogre/walk-up/ogre',
		start: 0,
		end: 3,
		zeroPad: 2,
		repeat: -1,
	},
	{
		atlas: 'ogre',
		key: 'bandit-atk-up',
		frameRate: 4,
		prefix: 'ogre/atk-up/ogre',
		start: 0,
		end: 4,
		zeroPad: 2,
		repeat: 0,
	},
];

export const BanditConfig = {
	id: 4,
	name: 'Bandit',
	texture: 'ogre', // Placeholder - use ogre sprite until bandit sprite is created
	baseHealth: 15,
	atack: 6,
	defense: 2,
	speed: 35, // Faster than ogre
	flee: 3,
	hit: 6,
	exp: 40,
	healthBarOffsetX: -8,
	healthBarOffsetY: 20,
	drops: [
		new EntityDrops(
			1, // Red Potion
			50 // 50% chance
		),
		new EntityDrops(
			2, // Dark Potion
			20 // 20% chance
		),
	],
};
