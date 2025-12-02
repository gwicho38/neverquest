import { EntityDrops } from '../../../models/EntityDrops';

/**
 * Dungeon Guardian Boss
 * First major boss - guards the entrance to deeper dungeons
 */
export const DungeonGuardianBoss = {
	id: 100,
	name: 'Dungeon Guardian',
	texture: 'ogre', // Placeholder - would use larger boss sprite
	baseHealth: 100,
	atack: 15,
	defense: 8,
	speed: 15,
	flee: 0,
	hit: 10,
	exp: 500,
	healthBarOffsetX: -5,
	healthBarOffsetY: 30,
	isBoss: true,
	bossPhases: [
		{ healthThreshold: 100, attackMultiplier: 1.0 },
		{ healthThreshold: 50, attackMultiplier: 1.5 }, // Enrages at 50% HP
		{ healthThreshold: 25, attackMultiplier: 2.0 }, // Goes berserk at 25% HP
	],
	drops: [
		new EntityDrops(15, 100), // Legendary equipment - guaranteed
		new EntityDrops(3, 100), // Treasure
		new EntityDrops(10, 80), // Ancient Fragment
		new EntityDrops(20, 60), // Epic armor
	],
	abilities: ['ground_slam', 'summon_minions', 'enrage'],
	bossMusic: 'boss_battle_1',
};
