import { EntityDrops } from '../../models/EntityDrops';

/**
 * Goblin Enemy
 * Sneaky enemy that can steal items
 */
export const GoblinConfig = {
	id: 7,
	name: 'Goblin',
	texture: 'rat', // Placeholder
	baseHealth: 10,
	atack: 6,
	defense: 2,
	speed: 28,
	flee: 5,
	hit: 5,
	exp: 35,
	healthBarOffsetX: -5,
	healthBarOffsetY: 16,
	drops: [
		new EntityDrops(1, 50), // Red Potion
		new EntityDrops(3, 10), // Treasure
		new EntityDrops(10, 25), // Ancient Fragment
	],
	abilities: ['steal'], // Can steal gold from player
};
