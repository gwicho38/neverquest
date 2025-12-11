import { EntityDrops } from '../../../models/EntityDrops';

/**
 * Fire Elemental Boss
 * Elemental boss found in the volcano
 */
export const FireElementalBoss = {
	id: 102,
	name: 'Fire Elemental Lord',
	texture: 'bat', // Placeholder - would use fire effect sprite
	baseHealth: 90,
	atack: 25, // High magic damage
	defense: 3,
	speed: 25,
	flee: 2,
	hit: 12,
	exp: 1000,
	healthBarOffsetX: -5,
	healthBarOffsetY: 30,
	isBoss: true,
	bossPhases: [
		{ healthThreshold: 100, attackMultiplier: 1.0 },
		{ healthThreshold: 66, attackMultiplier: 1.4 }, // Burns hotter
		{ healthThreshold: 33, attackMultiplier: 2.0 }, // Supernova phase
	],
	drops: [
		new EntityDrops(26, 100), // Flame Seal Fragment - guaranteed
		new EntityDrops(30, 100), // Fire resistance armor - guaranteed
		new EntityDrops(3, 100), // Treasure
		new EntityDrops(85, 80), // Ancient Artifact
	],
	abilities: ['fireball', 'fire_wave', 'meteor_strike', 'flame_shield'],
	bossMusic: 'boss_battle_fire',
	resistances: {
		fire: 0.5, // Takes 50% less fire damage
		ice: 1.5, // Takes 50% more ice damage
	},
};
