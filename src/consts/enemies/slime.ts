import { EntityDrops } from '../../models/EntityDrops';

/**
 * Slime Enemy
 * Weak enemy that splits into smaller slimes when defeated
 */
export const SlimeConfig = {
	id: 8,
	name: 'Slime',
	texture: 'rat', // Placeholder
	baseHealth: 15,
	atack: 4,
	defense: 0,
	speed: 15, // Very slow
	flee: 1,
	hit: 4,
	exp: 20,
	healthBarOffsetX: -5,
	healthBarOffsetY: 16,
	drops: [
		new EntityDrops(1, 80), // Red Potion - High drop rate
		new EntityDrops(51, 50), // Glowing Mushroom
	],
	abilities: ['split'], // Splits into 2 smaller slimes on death
};
