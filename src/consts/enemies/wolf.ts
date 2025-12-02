import { EntityDrops } from '../../models/EntityDrops';

/**
 * Wolf Enemy
 * Pack hunter with high speed and attack
 */
export const WolfConfig = {
	id: 6,
	name: 'Wolf',
	texture: 'rat', // Placeholder
	baseHealth: 12,
	atack: 8,
	defense: 1,
	speed: 30,
	flee: 4,
	hit: 7,
	exp: 45,
	healthBarOffsetX: -5,
	healthBarOffsetY: 16,
	drops: [
		new EntityDrops(1, 60), // Red Potion
		new EntityDrops(92, 40), // Fresh Meat
		new EntityDrops(2, 15), // Dark Potion
	],
	abilities: ['pack_hunter'], // Deals more damage when multiple wolves nearby
};
