import { EntityDrops } from '../../models/EntityDrops';

/**
 * Golem Enemy
 * Massive stone construct with extreme defense
 */
export const GolemConfig = {
	id: 14,
	name: 'Stone Golem',
	texture: 'ogre', // Placeholder
	baseHealth: 50,
	atack: 15,
	defense: 10, // Very high defense
	speed: 10, // Extremely slow
	flee: 0,
	hit: 6,
	exp: 150,
	healthBarOffsetX: -5,
	healthBarOffsetY: 16,
	drops: [
		new EntityDrops(3, 60), // Treasure
		new EntityDrops(10, 50), // Ancient Fragment
		new EntityDrops(85, 30), // Ancient Artifact
		new EntityDrops(20, 40), // Epic armor
	],
	abilities: ['stone_skin'], // Takes reduced damage from physical attacks
};
