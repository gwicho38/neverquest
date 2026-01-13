import { EntityDrops } from '../../../models/EntityDrops';

/**
 * Ogre Chieftain Boss
 * Leader of the ogre tribes
 */
export const OgreChieftainBoss = {
	id: 101,
	name: 'Ogre Chieftain',
	texture: 'ogre', // Placeholder - would use larger boss sprite
	baseHealth: 120,
	atack: 18,
	defense: 10,
	speed: 12,
	flee: 0,
	hit: 11,
	exp: 600,
	healthBarOffsetX: -5,
	healthBarOffsetY: 30,
	isBoss: true,
	bossPhases: [
		{ healthThreshold: 100, attackMultiplier: 1.0 },
		{ healthThreshold: 60, attackMultiplier: 1.3 },
		{ healthThreshold: 30, attackMultiplier: 1.8 },
	],
	drops: [
		new EntityDrops(20, 100), // Epic armor - guaranteed
		new EntityDrops(3, 100), // Treasure
		new EntityDrops(4, 80), // Mighty Sword
		new EntityDrops(60, 70), // Hunter's Bow
		new EntityDrops(85, 50), // Ancient Artifact
	],
	abilities: ['war_cry', 'charge_attack', 'stone_throw'],
	bossMusic: 'boss_battle_2',
};
