/**
 * Skill Tree Types
 * Defines the skill system for character progression
 */

export interface ISkill {
	id: number;
	name: string;
	description: string;
	tree: 'warrior' | 'mage' | 'rogue'; // Skill tree path
	tier: number; // 1-5, higher tiers require more skill points
	icon: string;
	maxRank: number; // Maximum number of times this skill can be learned
	prerequisites?: number[]; // Skill IDs that must be learned first
	cost: number; // Skill points required to learn
	effects: ISkillEffect[];
}

export interface ISkillEffect {
	type: 'stat' | 'passive' | 'active' | 'unlock';
	stat?: 'hp' | 'atk' | 'def' | 'spd' | 'hit' | 'flee';
	value?: number; // Amount to increase stat
	passive?: string; // Passive ability identifier
	active?: string; // Active ability identifier
	unlock?: string; // Feature to unlock
}

export interface IPlayerSkills {
	warrior: Map<number, number>; // Skill ID -> Rank
	mage: Map<number, number>;
	rogue: Map<number, number>;
	availablePoints: number;
	totalPoints: number;
}

export interface ISkillNode {
	skill: ISkill;
	currentRank: number;
	unlocked: boolean;
	available: boolean; // Can be learned (prerequisites met)
}
