import { EntityDrops } from '../../models/EntityDrops';

/**
 * Imp Enemy
 * Magic-using demon that casts fire spells
 */
export const ImpConfig = {
	id: 11,
	name: 'Imp',
	texture: 'bat', // Placeholder
	baseHealth: 10,
	atack: 12, // High magic damage
	defense: 1,
	speed: 22,
	flee: 4,
	hit: 8,
	exp: 70,
	healthBarOffsetX: -5,
	healthBarOffsetY: 16,
	drops: [
		new EntityDrops(2, 40), // Dark Potion
		new EntityDrops(11, 50), // Dark Essence
		new EntityDrops(26, 10), // Flame Seal Fragment
	],
	abilities: ['fire_magic'], // Casts fireball dealing AoE damage
};
