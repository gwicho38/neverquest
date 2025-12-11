import { EntityDrops } from '../../../models/EntityDrops';

/**
 * Shadow Lord Boss
 * Final boss - ancient evil threatening the world
 */
export const ShadowLordBoss = {
	id: 104,
	name: 'Shadow Lord',
	texture: 'rat', // Placeholder - would use dark lord sprite
	baseHealth: 250,
	atack: 30,
	defense: 15,
	speed: 20,
	flee: 0,
	hit: 15,
	exp: 5000,
	healthBarOffsetX: -5,
	healthBarOffsetY: 40,
	isBoss: true,
	isFinalBoss: true,
	bossPhases: [
		{
			healthThreshold: 100,
			attackMultiplier: 1.0,
			description: 'Shadow Lord awakens',
		},
		{
			healthThreshold: 75,
			attackMultiplier: 1.3,
			description: 'Dark energy intensifies',
		},
		{
			healthThreshold: 50,
			attackMultiplier: 1.7,
			description: 'Shadow realm opens',
		},
		{
			healthThreshold: 25,
			attackMultiplier: 2.5,
			description: 'Final desperate assault',
		},
	],
	drops: [
		new EntityDrops(99, 100), // Legendary final weapon - guaranteed
		new EntityDrops(3, 100), // Treasure
		new EntityDrops(85, 100), // Ancient Artifact
		new EntityDrops(20, 100), // Epic armor
	],
	abilities: [
		'dark_wave',
		'shadow_bolt',
		'summon_shadows',
		'void_zone',
		'life_drain',
		'dimension_shift',
		'apocalypse',
	],
	bossMusic: 'boss_battle_final',
	immunities: ['poison', 'stun', 'freeze'],
};
