import { EntityDrops } from '../../models/EntityDrops';

/**
 * Harpy Enemy
 * Flying enemy that swoops down to attack
 */
export const HarpyConfig = {
	id: 15,
	name: 'Harpy',
	texture: 'bat', // Reuse bat sprite
	baseHealth: 12,
	atack: 9,
	defense: 1,
	speed: 35, // Very fast
	flee: 6,
	hit: 7,
	exp: 55,
	healthBarOffsetX: -5,
	healthBarOffsetY: 16,
	drops: [
		new EntityDrops(1, 50), // Red Potion
		new EntityDrops(2, 25), // Dark Potion
		new EntityDrops(91, 40), // Wild Berries
	],
	abilities: ['flying'], // Can fly over obstacles
};
