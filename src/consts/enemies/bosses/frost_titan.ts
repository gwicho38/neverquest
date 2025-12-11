import { EntityDrops } from '../../../models/EntityDrops';

/**
 * Frost Titan Boss
 * Massive ice giant guarding the Frozen Temple
 */
export const FrostTitanBoss = {
	id: 103,
	name: 'Frost Titan',
	texture: 'ogre', // Placeholder - would use ice giant sprite
	baseHealth: 150,
	atack: 20,
	defense: 12,
	speed: 10,
	flee: 0,
	hit: 10,
	exp: 1200,
	healthBarOffsetX: -5,
	healthBarOffsetY: 30,
	isBoss: true,
	bossPhases: [
		{ healthThreshold: 100, attackMultiplier: 1.0 },
		{ healthThreshold: 50, attackMultiplier: 1.5 },
		{ healthThreshold: 20, attackMultiplier: 2.5 }, // Desperate freeze
	],
	drops: [
		new EntityDrops(25, 100), // Frost Seal Fragment - guaranteed
		new EntityDrops(31, 100), // Ice resistance armor - guaranteed
		new EntityDrops(3, 100), // Treasure
		new EntityDrops(32, 80), // Frost Blade
		new EntityDrops(85, 70), // Ancient Artifact
	],
	abilities: ['ice_shard', 'frozen_ground', 'blizzard', 'ice_armor'],
	bossMusic: 'boss_battle_ice',
	resistances: {
		ice: 0.5, // Takes 50% less ice damage
		fire: 1.5, // Takes 50% more fire damage
	},
};
