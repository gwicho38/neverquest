import { ISkill } from '../../../types/SkillTypes';

/**
 * WARRIOR SKILL TREE
 * Tank/DPS focused on physical combat
 * High defense, high damage, berserker abilities
 */
export const WARRIOR_SKILLS: ISkill[] = [
	// Tier 1
	{
		id: 1,
		name: 'Strength Training',
		description: 'Basic combat training. +2 ATTACK.',
		tree: 'warrior',
		tier: 1,
		icon: 'skill_str',
		maxRank: 5,
		cost: 1,
		effects: [{ type: 'stat', stat: 'atk', value: 2 }],
	},
	{
		id: 2,
		name: 'Toughness',
		description: 'Harden your body. +3 DEFENSE.',
		tree: 'warrior',
		tier: 1,
		icon: 'skill_def',
		maxRank: 5,
		cost: 1,
		effects: [{ type: 'stat', stat: 'def', value: 3 }],
	},
	{
		id: 3,
		name: 'Vitality',
		description: 'Increase your life force. +10 MAX HP.',
		tree: 'warrior',
		tier: 1,
		icon: 'skill_hp',
		maxRank: 5,
		cost: 1,
		effects: [{ type: 'stat', stat: 'hp', value: 10 }],
	},

	// Tier 2
	{
		id: 4,
		name: 'Power Strike',
		description: 'Devastating attack that deals 150% damage.',
		tree: 'warrior',
		tier: 2,
		icon: 'skill_power',
		maxRank: 3,
		prerequisites: [1],
		cost: 2,
		effects: [{ type: 'active', active: 'power_strike' }],
	},
	{
		id: 5,
		name: 'Iron Skin',
		description: 'Passive: Reduce all damage taken by 10%.',
		tree: 'warrior',
		tier: 2,
		icon: 'skill_iron',
		maxRank: 3,
		prerequisites: [2],
		cost: 2,
		effects: [{ type: 'passive', passive: 'iron_skin' }],
	},
	{
		id: 6,
		name: 'Battle Fury',
		description: '+5 ATTACK, -2 DEFENSE. High risk, high reward.',
		tree: 'warrior',
		tier: 2,
		icon: 'skill_fury',
		maxRank: 1,
		prerequisites: [1],
		cost: 2,
		effects: [
			{ type: 'stat', stat: 'atk', value: 5 },
			{ type: 'stat', stat: 'def', value: -2 },
		],
	},

	// Tier 3
	{
		id: 7,
		name: 'Whirlwind',
		description: 'Spin attack hitting all nearby enemies.',
		tree: 'warrior',
		tier: 3,
		icon: 'skill_whirl',
		maxRank: 2,
		prerequisites: [4],
		cost: 3,
		effects: [{ type: 'active', active: 'whirlwind' }],
	},
	{
		id: 8,
		name: 'Last Stand',
		description: 'Passive: Cannot be reduced below 1 HP once per battle.',
		tree: 'warrior',
		tier: 3,
		icon: 'skill_last',
		maxRank: 1,
		prerequisites: [3, 5],
		cost: 3,
		effects: [{ type: 'passive', passive: 'last_stand' }],
	},

	// Tier 4
	{
		id: 9,
		name: 'Titan Slam',
		description: 'Massive attack that stuns enemies. 200% damage.',
		tree: 'warrior',
		tier: 4,
		icon: 'skill_slam',
		maxRank: 2,
		prerequisites: [7],
		cost: 4,
		effects: [{ type: 'active', active: 'titan_slam' }],
	},
	{
		id: 10,
		name: 'Unstoppable',
		description: 'Passive: Immune to stun, freeze, and knockback.',
		tree: 'warrior',
		tier: 4,
		icon: 'skill_unstop',
		maxRank: 1,
		prerequisites: [8],
		cost: 4,
		effects: [{ type: 'passive', passive: 'unstoppable' }],
	},

	// Tier 5 - Ultimate
	{
		id: 11,
		name: 'Berserker Rage',
		description: 'Ultimate: Enter berserk mode. +100% ATTACK for 20 seconds.',
		tree: 'warrior',
		tier: 5,
		icon: 'skill_berserk',
		maxRank: 1,
		prerequisites: [9, 10],
		cost: 5,
		effects: [{ type: 'active', active: 'berserker_rage' }],
	},
];
