import { EntityDrops } from '../../models/EntityDrops';

/**
 * Zombie Enemy
 * Slow but tough undead enemy that infects player
 */
export const ZombieConfig = {
	id: 12,
	name: 'Zombie',
	texture: 'ogre', // Placeholder
	baseHealth: 25,
	atack: 8,
	defense: 3,
	speed: 12, // Very slow
	flee: 0,
	hit: 5,
	exp: 50,
	healthBarOffsetX: -5,
	healthBarOffsetY: 16,
	drops: [
		new EntityDrops(1, 60), // Red Potion
		new EntityDrops(11, 40), // Dark Essence
	],
	abilities: ['infect'], // Reduces player max HP temporarily
};
