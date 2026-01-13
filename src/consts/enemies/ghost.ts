import { EntityDrops } from '../../models/EntityDrops';

/**
 * Ghost Enemy
 * Ethereal enemy with high evasion
 */
export const GhostConfig = {
	id: 9,
	name: 'Ghost',
	texture: 'bat', // Reuse bat sprite as placeholder
	baseHealth: 8,
	atack: 10,
	defense: 0,
	speed: 25,
	flee: 8, // Very high evasion
	hit: 6,
	exp: 60,
	healthBarOffsetX: -5,
	healthBarOffsetY: 16,
	drops: [
		new EntityDrops(11, 70), // Dark Essence
		new EntityDrops(2, 30), // Dark Potion
		new EntityDrops(3, 10), // Treasure
	],
	abilities: ['phase'], // Can become intangible, dodging attacks
};
