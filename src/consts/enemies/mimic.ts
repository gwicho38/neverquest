import { EntityDrops } from '../../models/EntityDrops';

/**
 * Mimic Enemy
 * Disguised as treasure chest, ambushes players
 */
export const MimicConfig = {
	id: 16,
	name: 'Mimic',
	texture: 'rat', // Placeholder
	baseHealth: 30,
	atack: 12,
	defense: 4,
	speed: 18,
	flee: 2,
	hit: 8,
	exp: 100,
	healthBarOffsetX: -5,
	healthBarOffsetY: 16,
	drops: [
		new EntityDrops(3, 100), // Treasure - Always drops
		new EntityDrops(3, 80), // Treasure - Multiple drops
		new EntityDrops(4, 40), // Mighty Sword
		new EntityDrops(85, 50), // Ancient Artifact
		new EntityDrops(20, 35), // Epic armor
	],
	abilities: ['ambush'], // Deals extra damage on first attack
};
