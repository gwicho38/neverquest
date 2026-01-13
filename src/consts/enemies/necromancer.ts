import { EntityDrops } from '../../models/EntityDrops';

/**
 * Necromancer Enemy
 * Dark mage that summons undead minions
 */
export const NecromancerConfig = {
	id: 18,
	name: 'Necromancer',
	texture: 'rat', // Placeholder
	baseHealth: 20,
	atack: 15,
	defense: 2,
	speed: 20,
	flee: 4,
	hit: 9,
	exp: 130,
	healthBarOffsetX: -5,
	healthBarOffsetY: 16,
	drops: [
		new EntityDrops(2, 80), // Dark Potion
		new EntityDrops(11, 90), // Dark Essence
		new EntityDrops(3, 70), // Treasure
		new EntityDrops(70, 50), // Shadow Cloak
		new EntityDrops(85, 40), // Ancient Artifact
	],
	abilities: ['summon_undead'], // Summons skeleton minions
};
