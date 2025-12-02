import Phaser from 'phaser';
import { ISkill, IPlayerSkills, ISkillNode } from '../types/SkillTypes';
import { ALL_SKILLS } from '../consts/DB_SEED/Skills';

/**
 * Skill Tree Manager
 * Manages player skill progression and active/passive skill effects
 */
export class NeverquestSkillTreeManager {
	public scene: Phaser.Scene;
	public allSkills: Map<number, ISkill>;
	public playerSkills: IPlayerSkills;

	// Events
	public static readonly SKILL_LEARNED = 'skill:learned';
	public static readonly SKILL_POINTS_GAINED = 'skill:points_gained';
	public static readonly SKILL_POINTS_SPENT = 'skill:points_spent';

	constructor(scene: Phaser.Scene) {
		this.scene = scene;
		this.allSkills = new Map();
		this.playerSkills = {
			warrior: new Map(),
			mage: new Map(),
			rogue: new Map(),
			availablePoints: 0,
			totalPoints: 0,
		};

		// Load all skills
		this.loadSkills();
	}

	/**
	 * Load all skills from database
	 */
	private loadSkills(): void {
		ALL_SKILLS.forEach((skill) => {
			this.allSkills.set(skill.id, skill);
		});
		console.log(`Loaded ${this.allSkills.size} skills`);
	}

	/**
	 * Initialize the skill manager
	 */
	create(): void {
		console.log('NeverquestSkillTreeManager initialized');
	}

	/**
	 * Grant skill points to the player (e.g., on level up)
	 */
	grantSkillPoints(points: number): void {
		this.playerSkills.availablePoints += points;
		this.playerSkills.totalPoints += points;
		console.log(`Granted ${points} skill points. Available: ${this.playerSkills.availablePoints}`);
		this.scene.events.emit(NeverquestSkillTreeManager.SKILL_POINTS_GAINED, points);
	}

	/**
	 * Check if a skill can be learned
	 */
	canLearnSkill(skillId: number): boolean {
		const skill = this.allSkills.get(skillId);
		if (!skill) return false;

		// Check if player has enough points
		if (this.playerSkills.availablePoints < skill.cost) {
			return false;
		}

		// Get current rank
		const currentRank = this.getSkillRank(skillId);

		// Check if already at max rank
		if (currentRank >= skill.maxRank) {
			return false;
		}

		// Check prerequisites
		if (skill.prerequisites) {
			for (const prereqId of skill.prerequisites) {
				if (this.getSkillRank(prereqId) === 0) {
					return false;
				}
			}
		}

		return true;
	}

	/**
	 * Learn a skill (increase its rank)
	 */
	learnSkill(skillId: number): boolean {
		if (!this.canLearnSkill(skillId)) {
			console.warn(`Cannot learn skill ${skillId}`);
			return false;
		}

		const skill = this.allSkills.get(skillId);
		if (!skill) return false;

		// Get the appropriate tree map
		const treeMap = this.playerSkills[skill.tree];

		// Increase rank
		const currentRank = treeMap.get(skillId) || 0;
		treeMap.set(skillId, currentRank + 1);

		// Deduct skill points
		this.playerSkills.availablePoints -= skill.cost;

		console.log(`Learned skill: ${skill.name} (Rank ${currentRank + 1}/${skill.maxRank})`);
		this.scene.events.emit(NeverquestSkillTreeManager.SKILL_LEARNED, skill, currentRank + 1);
		this.scene.events.emit(NeverquestSkillTreeManager.SKILL_POINTS_SPENT, skill.cost);

		return true;
	}

	/**
	 * Get the current rank of a skill
	 */
	getSkillRank(skillId: number): number {
		const skill = this.allSkills.get(skillId);
		if (!skill) return 0;

		const treeMap = this.playerSkills[skill.tree];
		return treeMap.get(skillId) || 0;
	}

	/**
	 * Get all learned skills
	 */
	getLearnedSkills(): ISkill[] {
		const learned: ISkill[] = [];

		this.allSkills.forEach((skill) => {
			if (this.getSkillRank(skill.id) > 0) {
				learned.push(skill);
			}
		});

		return learned;
	}

	/**
	 * Get skills for a specific tree
	 */
	getTreeSkills(tree: 'warrior' | 'mage' | 'rogue'): ISkillNode[] {
		const nodes: ISkillNode[] = [];

		this.allSkills.forEach((skill) => {
			if (skill.tree === tree) {
				const currentRank = this.getSkillRank(skill.id);
				const unlocked = currentRank > 0;
				const available = this.canLearnSkill(skill.id);

				nodes.push({
					skill,
					currentRank,
					unlocked,
					available,
				});
			}
		});

		// Sort by tier
		nodes.sort((a, b) => a.skill.tier - b.skill.tier);

		return nodes;
	}

	/**
	 * Calculate total stat bonuses from learned skills
	 */
	getSkillStatBonuses(): {
		hp: number;
		atk: number;
		def: number;
		spd: number;
		hit: number;
		flee: number;
	} {
		const bonuses = {
			hp: 0,
			atk: 0,
			def: 0,
			spd: 0,
			hit: 0,
			flee: 0,
		};

		this.getLearnedSkills().forEach((skill) => {
			const rank = this.getSkillRank(skill.id);

			skill.effects.forEach((effect) => {
				if (effect.type === 'stat' && effect.stat && effect.value) {
					bonuses[effect.stat] += effect.value * rank;
				}
			});
		});

		return bonuses;
	}

	/**
	 * Get all active abilities from learned skills
	 */
	getActiveAbilities(): string[] {
		const abilities: string[] = [];

		this.getLearnedSkills().forEach((skill) => {
			skill.effects.forEach((effect) => {
				if (effect.type === 'active' && effect.active) {
					abilities.push(effect.active);
				}
			});
		});

		return abilities;
	}

	/**
	 * Get all passive abilities from learned skills
	 */
	getPassiveAbilities(): string[] {
		const abilities: string[] = [];

		this.getLearnedSkills().forEach((skill) => {
			skill.effects.forEach((effect) => {
				if (effect.type === 'passive' && effect.passive) {
					abilities.push(effect.passive);
				}
			});
		});

		return abilities;
	}

	/**
	 * Reset all skills in a tree (refund points)
	 */
	resetTree(tree: 'warrior' | 'mage' | 'rogue'): void {
		const treeMap = this.playerSkills[tree];
		let refundedPoints = 0;

		// Calculate refund
		treeMap.forEach((rank, skillId) => {
			const skill = this.allSkills.get(skillId);
			if (skill) {
				refundedPoints += skill.cost * rank;
			}
		});

		// Clear the tree
		treeMap.clear();

		// Refund points
		this.playerSkills.availablePoints += refundedPoints;

		console.log(
			`Reset ${tree} tree. Refunded ${refundedPoints} points. Available: ${this.playerSkills.availablePoints}`
		);
	}

	/**
	 * Reset all skills (full refund)
	 */
	resetAllSkills(): void {
		this.resetTree('warrior');
		this.resetTree('mage');
		this.resetTree('rogue');
		console.log('All skills reset');
	}

	/**
	 * Save skill state
	 */
	saveSkillState(): object {
		return {
			warrior: Array.from(this.playerSkills.warrior.entries()),
			mage: Array.from(this.playerSkills.mage.entries()),
			rogue: Array.from(this.playerSkills.rogue.entries()),
			availablePoints: this.playerSkills.availablePoints,
			totalPoints: this.playerSkills.totalPoints,
		};
	}

	/**
	 * Load skill state
	 */
	loadSkillState(state: any): void {
		if (state.warrior) {
			this.playerSkills.warrior = new Map(state.warrior);
		}
		if (state.mage) {
			this.playerSkills.mage = new Map(state.mage);
		}
		if (state.rogue) {
			this.playerSkills.rogue = new Map(state.rogue);
		}
		if (state.availablePoints !== undefined) {
			this.playerSkills.availablePoints = state.availablePoints;
		}
		if (state.totalPoints !== undefined) {
			this.playerSkills.totalPoints = state.totalPoints;
		}

		console.log('Skill state loaded:', {
			available: this.playerSkills.availablePoints,
			total: this.playerSkills.totalPoints,
		});
	}

	/**
	 * Cleanup
	 */
	destroy(): void {
		console.log('NeverquestSkillTreeManager destroyed');
	}
}
