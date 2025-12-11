import { EntityDrops } from '../../models/EntityDrops';

/**
 * Bandit Enemy
 * Human enemy with balanced stats and good loot
 */
export const BanditConfig = {
	id: 13,
	name: 'Bandit',
	texture: 'rat', // Placeholder
	baseHealth: 18,
	atack: 9,
	defense: 3,
	speed: 25,
	flee: 3,
	hit: 7,
	exp: 65,
	healthBarOffsetX: -5,
	healthBarOffsetY: 16,
	drops: [
		new EntityDrops(1, 50), // Red Potion
		new EntityDrops(3, 40), // Treasure - High drop rate for gold
		new EntityDrops(4, 20), // Mighty Sword
		new EntityDrops(60, 25), // Hunter's Bow
	],
	abilities: ['ranged_attack'], // Can attack from distance
};
