import { EntityDrops } from '../../models/EntityDrops';

/**
 * Spider Enemy
 * Fast but fragile enemy that can poison players
 */
export const SpiderConfig = {
	id: 4,
	name: 'Spider',
	texture: 'rat', // Reuse rat sprite as placeholder for now
	baseHealth: 8,
	atack: 6,
	defense: 0,
	speed: 35, // Faster than rats
	flee: 3,
	hit: 6,
	exp: 30,
	healthBarOffsetX: -5,
	healthBarOffsetY: 16,
	drops: [
		new EntityDrops(1, 50), // Red Potion - 50%
		new EntityDrops(51, 30), // Glowing Mushroom - 30%
	],
	abilities: ['poison'], // Special ability marker
};
