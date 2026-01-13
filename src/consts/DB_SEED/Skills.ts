import { ISkill } from '../../types/SkillTypes';
import { WARRIOR_SKILLS } from './skills/warrior-skills';
import { MAGE_SKILLS } from './skills/mage-skills';
import { ROGUE_SKILLS } from './skills/rogue-skills';

/**
 * SKILL TREES
 * Three distinct paths for character specialization:
 * - Warrior: Tank/DPS focused on physical combat
 * - Mage: Magic user with elemental spells
 * - Rogue: Fast, evasive, critical hit specialist
 */

// Re-export skill arrays
export { WARRIOR_SKILLS, MAGE_SKILLS, ROGUE_SKILLS };

// Combine all skills
export const ALL_SKILLS: ISkill[] = [...WARRIOR_SKILLS, ...MAGE_SKILLS, ...ROGUE_SKILLS];

// Helper function to get skills by tree
export function getSkillsByTree(tree: 'warrior' | 'mage' | 'rogue'): ISkill[] {
	return ALL_SKILLS.filter((skill) => skill.tree === tree);
}
