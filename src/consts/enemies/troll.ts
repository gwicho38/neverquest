import { EntityDrops } from '../../models/EntityDrops';

/**
 * Troll Enemy
 * Tanky enemy with high health and defense, regenerates over time
 */
export const TrollConfig = {
	id: 10,
	name: 'Troll',
	texture: 'ogre', // Reuse ogre sprite
	baseHealth: 40,
	atack: 10,
	defense: 6,
	speed: 15, // Very slow
	flee: 0,
	hit: 7,
	exp: 120,
	healthBarOffsetX: -5,
	healthBarOffsetY: 16,
	drops: [
		new EntityDrops(1, 100), // Red Potion - Always drops
		new EntityDrops(4, 30), // Mighty Sword
		new EntityDrops(3, 20), // Treasure
		new EntityDrops(20, 15), // Epic armor
	],
	abilities: ['regenerate'], // Regenerates 1 HP per turn
};
