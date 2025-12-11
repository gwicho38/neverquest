import { EntityDrops } from '../../models/EntityDrops';

/**
 * Skeleton Enemy
 * Undead warrior with balanced stats
 */
export const SkeletonConfig = {
	id: 5,
	name: 'Skeleton',
	texture: 'rat', // Placeholder
	baseHealth: 15,
	atack: 7,
	defense: 2,
	speed: 20,
	flee: 1,
	hit: 6,
	exp: 40,
	healthBarOffsetX: -5,
	healthBarOffsetY: 16,
	drops: [
		new EntityDrops(1, 40), // Red Potion
		new EntityDrops(53, 20), // Baker's Ring
		new EntityDrops(3, 5), // Treasure
	],
};
