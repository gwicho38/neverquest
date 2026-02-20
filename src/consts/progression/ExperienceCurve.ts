/**
 * @fileoverview Experience and leveling curve system
 *
 * Experience Curve System for Neverquest
 *
 * This module defines the XP requirements for leveling up, designed to align
 * with the 3-act story structure and milestone ability unlocks.
 *
 * Story Pacing Design:
 * - Act 1 (Levels 1-5): Tutorial + Forest/Cave - Quick progression to hook players
 * - Act 2 (Levels 6-12): Crossroads + Dungeons - Moderate progression for exploration
 * - Act 3 (Levels 13-20): Dark Citadel - Challenging progression for endgame
 *
 * Milestone Abilities:
 * - Level 5: Double Jump
 * - Level 10: Sprint Boost
 * - Level 15: Magic Shield
 * - Level 20: Shadow Step
 */

/**
 * Story act definitions
 */
export enum StoryAct {
	ACT_1 = 1, // The Awakening (Levels 1-5)
	ACT_2 = 2, // The Journey (Levels 6-12)
	ACT_3 = 3, // The Reckoning (Levels 13-20)
}

/**
 * Level range for each story act
 */
export const ACT_LEVEL_RANGES: Record<StoryAct, { min: number; max: number }> = {
	[StoryAct.ACT_1]: { min: 1, max: 5 },
	[StoryAct.ACT_2]: { min: 6, max: 12 },
	[StoryAct.ACT_3]: { min: 13, max: 20 },
};

/**
 * Recommended levels for major story milestones
 */
export const STORY_MILESTONES = {
	// Act 1 Milestones
	TUTORIAL_COMPLETE: 2,
	CAVE_EXPLORATION: 3,
	CAVE_BOSS: 5,

	// Act 2 Milestones
	CROSSROADS_ARRIVAL: 6,
	FIRST_FRAGMENT: 8,
	SECOND_FRAGMENT: 10,
	THIRD_FRAGMENT: 12,

	// Act 3 Milestones
	DARK_CITADEL_ENTRY: 13,
	SHADOW_GUARDIAN: 16,
	VOID_KING: 18,
	MAX_LEVEL: 20,
};

/**
 * Ability unlock levels
 */
export const ABILITY_UNLOCK_LEVELS = {
	DOUBLE_JUMP: 5,
	SPRINT_BOOST: 10,
	MAGIC_SHIELD: 15,
	SHADOW_STEP: 20,
};

/**
 * XP required to reach each level (cumulative from level 1)
 * Uses a balanced curve formula optimized for story pacing
 */
export const LEVEL_XP_REQUIREMENTS: number[] = [
	0, // Level 1 (starting level, no XP needed)
	50, // Level 2 - Quick first level up
	125, // Level 3
	225, // Level 4
	350, // Level 5 - End of Act 1 / Double Jump unlock
	500, // Level 6 - Start of Act 2
	700, // Level 7
	950, // Level 8 - First fragment target
	1250, // Level 9
	1600, // Level 10 - Sprint Boost unlock
	2050, // Level 11
	2600, // Level 12 - End of Act 2 / Third fragment
	3250, // Level 13 - Start of Act 3
	4000, // Level 14
	4850, // Level 15 - Magic Shield unlock
	5800, // Level 16 - Shadow Guardian
	6900, // Level 17
	8150, // Level 18 - Void King target
	9550, // Level 19
	11100, // Level 20 - Shadow Step unlock / Max level
];

/**
 * Get XP required to reach a specific level
 * @param level - Target level (1-20)
 * @returns Total cumulative XP needed, or -1 if level is out of range
 */
export function getXpForLevel(level: number): number {
	if (level < 1 || level > 20) {
		return -1;
	}
	return LEVEL_XP_REQUIREMENTS[level - 1];
}

/**
 * Get XP needed for the next level up from current level
 * @param currentLevel - Current level (1-19)
 * @returns XP needed for next level, or 0 if at max level
 */
export function getXpForNextLevel(currentLevel: number): number {
	if (currentLevel < 1 || currentLevel >= 20) {
		return 0;
	}
	return LEVEL_XP_REQUIREMENTS[currentLevel] - LEVEL_XP_REQUIREMENTS[currentLevel - 1];
}

/**
 * Get the story act for a given level
 * @param level - Current level
 * @returns Story act enum value
 */
export function getActForLevel(level: number): StoryAct {
	if (level <= 5) return StoryAct.ACT_1;
	if (level <= 12) return StoryAct.ACT_2;
	return StoryAct.ACT_3;
}

/**
 * Check if a level unlocks an ability
 * @param level - Level to check
 * @returns Ability name or null if no ability unlocked
 */
export function getAbilityUnlockedAtLevel(level: number): string | null {
	switch (level) {
		case ABILITY_UNLOCK_LEVELS.DOUBLE_JUMP:
			return 'Double Jump';
		case ABILITY_UNLOCK_LEVELS.SPRINT_BOOST:
			return 'Sprint Boost';
		case ABILITY_UNLOCK_LEVELS.MAGIC_SHIELD:
			return 'Magic Shield';
		case ABILITY_UNLOCK_LEVELS.SHADOW_STEP:
			return 'Shadow Step';
		default:
			return null;
	}
}

/**
 * Calculate enemies needed to level up based on average XP
 * Useful for balancing enemy encounter rates
 * @param currentLevel - Current player level
 * @param averageEnemyXp - Average XP from enemies in current area
 * @returns Approximate number of enemies needed
 */
export function getEnemiesNeededForLevel(currentLevel: number, averageEnemyXp: number): number {
	if (averageEnemyXp <= 0) return Infinity;
	const xpNeeded = getXpForNextLevel(currentLevel);
	return Math.ceil(xpNeeded / averageEnemyXp);
}

/**
 * Get recommended XP value for enemies by story act
 * @param act - Story act
 * @returns Object with min/max/average XP values
 */
export function getEnemyXpRangeForAct(act: StoryAct): { min: number; max: number; average: number } {
	switch (act) {
		case StoryAct.ACT_1:
			return { min: 20, max: 100, average: 45 }; // Rats, Bats, Ogres
		case StoryAct.ACT_2:
			return { min: 35, max: 175, average: 80 }; // Wolves, Bandits, Shadow Scouts
		case StoryAct.ACT_3:
			return { min: 100, max: 500, average: 200 }; // Elite enemies, bosses
	}
}

/**
 * Calculate level from total XP earned
 * @param totalXp - Total cumulative XP
 * @returns Current level based on XP
 */
export function getLevelFromXp(totalXp: number): number {
	for (let level = 19; level >= 0; level--) {
		if (totalXp >= LEVEL_XP_REQUIREMENTS[level]) {
			return level + 1;
		}
	}
	return 1;
}

/**
 * XP curve analysis for debugging/balancing
 * Returns information about XP requirements across levels
 */
export function analyzeXpCurve(): {
	levelData: Array<{
		level: number;
		cumulativeXp: number;
		xpForLevel: number;
		act: StoryAct;
		abilityUnlock: string | null;
	}>;
	actTotals: Record<StoryAct, number>;
} {
	const levelData = [];
	const actTotals: Record<StoryAct, number> = {
		[StoryAct.ACT_1]: 0,
		[StoryAct.ACT_2]: 0,
		[StoryAct.ACT_3]: 0,
	};

	for (let level = 1; level <= 20; level++) {
		const xpForLevel = getXpForNextLevel(level - 1);
		const act = getActForLevel(level);

		if (level > 1) {
			actTotals[act] += xpForLevel;
		}

		levelData.push({
			level,
			cumulativeXp: LEVEL_XP_REQUIREMENTS[level - 1],
			xpForLevel,
			act,
			abilityUnlock: getAbilityUnlockedAtLevel(level),
		});
	}

	return { levelData, actTotals };
}

/**
 * Boss XP rewards by story milestone
 */
export const BOSS_XP_REWARDS = {
	CAVE_BOSS: 200, // End of Act 1 - guarantees level 5
	ANCIENT_RUINS_BOSS: 350, // Fragment 1
	FORGOTTEN_TEMPLE_BOSS: 400, // Fragment 2
	DARK_GATE_GUARDIAN: 450, // Fragment 3
	SHADOW_GUARDIAN: 750, // Mid-Act 3 boss
	VOID_KING: 1500, // Final boss
};
