/**
 * @fileoverview Wolf enemy configuration
 *
 * This file defines the Wolf enemy type:
 * - Animation definitions using bat sprite (placeholder)
 * - Combat stats (fast, low health, high attack)
 * - Drop table with health potions
 *
 * Story: Wolves roam mountain passes near the Crossroads,
 * corrupted by dark magic near the Forgotten Temple.
 *
 * @see Enemy - Enemy entity class
 * @see NeverquestEnemyZones - Spawns enemies
 * @see EnemiesSeedConfig - Enemy registry
 *
 * @module consts/enemies/wolf
 */

import { EntityDrops } from '../../models/EntityDrops';

/**
 * Wolf enemy configuration
 *
 * Story Context:
 * Wolves roam the mountain passes and eastern regions near the Crossroads.
 * The Merchant warns of wolves that "aren't quite natural anymore" near
 * the Forgotten Temple - corrupted by dark magic.
 *
 * Uses bat sprite as placeholder until dedicated wolf sprites are created.
 * Wolves are fast pack hunters that can overwhelm unprepared adventurers.
 */
export const Wolf = [
	// Down
	{
		atlas: 'bat',
		key: 'wolf-idle-down',
		frameRate: 3,
		prefix: 'bat/idle-down/bat',
		start: 0,
		end: 3,
		zeroPad: 2,
		repeat: -1,
	},
	{
		atlas: 'bat',
		key: 'wolf-atk-down',
		frameRate: 5,
		prefix: 'bat/atk-down/bat',
		start: 0,
		end: 4,
		zeroPad: 2,
		repeat: 0,
	},
	{
		atlas: 'bat',
		key: 'wolf-walk-down',
		frameRate: 8,
		prefix: 'bat/walk-down/bat',
		start: 0,
		end: 3,
		zeroPad: 2,
		repeat: -1,
	},

	// Right
	{
		atlas: 'bat',
		key: 'wolf-idle-right',
		frameRate: 3,
		prefix: 'bat/idle-right/bat',
		start: 0,
		end: 3,
		zeroPad: 2,
		repeat: -1,
	},
	{
		atlas: 'bat',
		key: 'wolf-walk-right',
		frameRate: 8,
		prefix: 'bat/walk-right/bat',
		start: 0,
		end: 3,
		zeroPad: 2,
		repeat: -1,
	},
	{
		atlas: 'bat',
		key: 'wolf-atk-right',
		frameRate: 5,
		prefix: 'bat/atk-right/bat',
		start: 0,
		end: 4,
		zeroPad: 2,
		repeat: 0,
	},

	// Up
	{
		atlas: 'bat',
		key: 'wolf-idle-up',
		frameRate: 3,
		prefix: 'bat/idle-up/bat',
		start: 0,
		end: 3,
		zeroPad: 2,
		repeat: -1,
	},
	{
		atlas: 'bat',
		key: 'wolf-walk-up',
		frameRate: 8,
		prefix: 'bat/walk-up/bat',
		start: 0,
		end: 3,
		zeroPad: 2,
		repeat: -1,
	},
	{
		atlas: 'bat',
		key: 'wolf-atk-up',
		frameRate: 5,
		prefix: 'bat/atk-up/bat',
		start: 0,
		end: 4,
		zeroPad: 2,
		repeat: 0,
	},
];

export const WolfConfig = {
	id: 5,
	name: 'Wolf',
	texture: 'bat', // Placeholder - use bat sprite until wolf sprite is created
	baseHealth: 12,
	atack: 7,
	defense: 1,
	speed: 45, // Very fast - pack hunters
	flee: 1, // Rarely flees
	hit: 7,
	exp: 35,
	healthBarOffsetX: -5,
	healthBarOffsetY: 16,
	drops: [
		new EntityDrops(
			1, // Red Potion
			40 // 40% chance
		),
	],
};
