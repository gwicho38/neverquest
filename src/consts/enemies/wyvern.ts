import { EntityDrops } from '../../models/EntityDrops';

/**
 * Wyvern Enemy
 * Dangerous dragon-like creature with breath weapon
 */
export const WyvernConfig = {
	id: 17,
	name: 'Wyvern',
	texture: 'bat', // Placeholder
	baseHealth: 35,
	atack: 14,
	defense: 5,
	speed: 28,
	flee: 3,
	hit: 8,
	exp: 140,
	healthBarOffsetX: -5,
	healthBarOffsetY: 16,
	drops: [
		new EntityDrops(2, 70), // Dark Potion
		new EntityDrops(3, 80), // Treasure
		new EntityDrops(26, 30), // Flame Seal Fragment
		new EntityDrops(30, 40), // Fire resistance armor
		new EntityDrops(85, 25), // Ancient Artifact
	],
	abilities: ['breath_weapon'], // Fire breath attack hitting multiple tiles
};
