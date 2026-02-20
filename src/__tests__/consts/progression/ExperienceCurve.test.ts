import {
	StoryAct,
	ACT_LEVEL_RANGES,
	STORY_MILESTONES,
	ABILITY_UNLOCK_LEVELS,
	LEVEL_XP_REQUIREMENTS,
	getXpForLevel,
	getXpForNextLevel,
	getActForLevel,
	getAbilityUnlockedAtLevel,
	getEnemiesNeededForLevel,
	getEnemyXpRangeForAct,
	getLevelFromXp,
	analyzeXpCurve,
	BOSS_XP_REWARDS,
} from '../../../consts/progression/ExperienceCurve';

describe('ExperienceCurve', () => {
	describe('StoryAct enum', () => {
		it('should define three story acts', () => {
			expect(StoryAct.ACT_1).toBe(1);
			expect(StoryAct.ACT_2).toBe(2);
			expect(StoryAct.ACT_3).toBe(3);
		});
	});

	describe('ACT_LEVEL_RANGES', () => {
		it('should define Act 1 as levels 1-5', () => {
			expect(ACT_LEVEL_RANGES[StoryAct.ACT_1]).toEqual({ min: 1, max: 5 });
		});

		it('should define Act 2 as levels 6-12', () => {
			expect(ACT_LEVEL_RANGES[StoryAct.ACT_2]).toEqual({ min: 6, max: 12 });
		});

		it('should define Act 3 as levels 13-20', () => {
			expect(ACT_LEVEL_RANGES[StoryAct.ACT_3]).toEqual({ min: 13, max: 20 });
		});

		it('should have no gaps between acts', () => {
			expect(ACT_LEVEL_RANGES[StoryAct.ACT_1].max + 1).toBe(ACT_LEVEL_RANGES[StoryAct.ACT_2].min);
			expect(ACT_LEVEL_RANGES[StoryAct.ACT_2].max + 1).toBe(ACT_LEVEL_RANGES[StoryAct.ACT_3].min);
		});
	});

	describe('STORY_MILESTONES', () => {
		it('should have tutorial complete early', () => {
			expect(STORY_MILESTONES.TUTORIAL_COMPLETE).toBe(2);
		});

		it('should have cave boss at end of Act 1', () => {
			expect(STORY_MILESTONES.CAVE_BOSS).toBe(5);
		});

		it('should have max level at 20', () => {
			expect(STORY_MILESTONES.MAX_LEVEL).toBe(20);
		});

		it('should have progressive fragment levels', () => {
			expect(STORY_MILESTONES.FIRST_FRAGMENT).toBeLessThan(STORY_MILESTONES.SECOND_FRAGMENT);
			expect(STORY_MILESTONES.SECOND_FRAGMENT).toBeLessThan(STORY_MILESTONES.THIRD_FRAGMENT);
		});
	});

	describe('ABILITY_UNLOCK_LEVELS', () => {
		it('should unlock Double Jump at level 5', () => {
			expect(ABILITY_UNLOCK_LEVELS.DOUBLE_JUMP).toBe(5);
		});

		it('should unlock Sprint Boost at level 10', () => {
			expect(ABILITY_UNLOCK_LEVELS.SPRINT_BOOST).toBe(10);
		});

		it('should unlock Magic Shield at level 15', () => {
			expect(ABILITY_UNLOCK_LEVELS.MAGIC_SHIELD).toBe(15);
		});

		it('should unlock Shadow Step at level 20', () => {
			expect(ABILITY_UNLOCK_LEVELS.SHADOW_STEP).toBe(20);
		});

		it('should have abilities every 5 levels', () => {
			expect(ABILITY_UNLOCK_LEVELS.SPRINT_BOOST - ABILITY_UNLOCK_LEVELS.DOUBLE_JUMP).toBe(5);
			expect(ABILITY_UNLOCK_LEVELS.MAGIC_SHIELD - ABILITY_UNLOCK_LEVELS.SPRINT_BOOST).toBe(5);
			expect(ABILITY_UNLOCK_LEVELS.SHADOW_STEP - ABILITY_UNLOCK_LEVELS.MAGIC_SHIELD).toBe(5);
		});
	});

	describe('LEVEL_XP_REQUIREMENTS', () => {
		it('should have 20 level entries', () => {
			expect(LEVEL_XP_REQUIREMENTS).toHaveLength(20);
		});

		it('should start at 0 XP for level 1', () => {
			expect(LEVEL_XP_REQUIREMENTS[0]).toBe(0);
		});

		it('should require 50 XP for level 2', () => {
			expect(LEVEL_XP_REQUIREMENTS[1]).toBe(50);
		});

		it('should be monotonically increasing', () => {
			for (let i = 1; i < LEVEL_XP_REQUIREMENTS.length; i++) {
				expect(LEVEL_XP_REQUIREMENTS[i]).toBeGreaterThan(LEVEL_XP_REQUIREMENTS[i - 1]);
			}
		});

		it('should have all positive values', () => {
			LEVEL_XP_REQUIREMENTS.forEach((xp, index) => {
				if (index > 0) {
					expect(xp).toBeGreaterThan(0);
				}
			});
		});
	});

	describe('getXpForLevel', () => {
		it('should return 0 for level 1', () => {
			expect(getXpForLevel(1)).toBe(0);
		});

		it('should return 50 for level 2', () => {
			expect(getXpForLevel(2)).toBe(50);
		});

		it('should return correct XP for level 5', () => {
			expect(getXpForLevel(5)).toBe(350);
		});

		it('should return -1 for level 0', () => {
			expect(getXpForLevel(0)).toBe(-1);
		});

		it('should return -1 for level 21', () => {
			expect(getXpForLevel(21)).toBe(-1);
		});

		it('should return correct XP for max level', () => {
			expect(getXpForLevel(20)).toBe(11100);
		});
	});

	describe('getXpForNextLevel', () => {
		it('should return 50 for level 1 to reach level 2', () => {
			expect(getXpForNextLevel(1)).toBe(50);
		});

		it('should return 75 for level 2 to reach level 3', () => {
			expect(getXpForNextLevel(2)).toBe(75);
		});

		it('should return 0 at max level', () => {
			expect(getXpForNextLevel(20)).toBe(0);
		});

		it('should return 0 for invalid levels', () => {
			expect(getXpForNextLevel(0)).toBe(0);
			expect(getXpForNextLevel(-1)).toBe(0);
		});

		it('should require more XP as levels increase', () => {
			const level5Xp = getXpForNextLevel(5);
			const level10Xp = getXpForNextLevel(10);
			const level15Xp = getXpForNextLevel(15);
			expect(level10Xp).toBeGreaterThan(level5Xp);
			expect(level15Xp).toBeGreaterThan(level10Xp);
		});
	});

	describe('getActForLevel', () => {
		it('should return Act 1 for levels 1-5', () => {
			for (let level = 1; level <= 5; level++) {
				expect(getActForLevel(level)).toBe(StoryAct.ACT_1);
			}
		});

		it('should return Act 2 for levels 6-12', () => {
			for (let level = 6; level <= 12; level++) {
				expect(getActForLevel(level)).toBe(StoryAct.ACT_2);
			}
		});

		it('should return Act 3 for levels 13-20', () => {
			for (let level = 13; level <= 20; level++) {
				expect(getActForLevel(level)).toBe(StoryAct.ACT_3);
			}
		});

		it('should return Act 3 for levels beyond 20', () => {
			expect(getActForLevel(25)).toBe(StoryAct.ACT_3);
		});
	});

	describe('getAbilityUnlockedAtLevel', () => {
		it('should return Double Jump at level 5', () => {
			expect(getAbilityUnlockedAtLevel(5)).toBe('Double Jump');
		});

		it('should return Sprint Boost at level 10', () => {
			expect(getAbilityUnlockedAtLevel(10)).toBe('Sprint Boost');
		});

		it('should return Magic Shield at level 15', () => {
			expect(getAbilityUnlockedAtLevel(15)).toBe('Magic Shield');
		});

		it('should return Shadow Step at level 20', () => {
			expect(getAbilityUnlockedAtLevel(20)).toBe('Shadow Step');
		});

		it('should return null for non-ability levels', () => {
			expect(getAbilityUnlockedAtLevel(1)).toBeNull();
			expect(getAbilityUnlockedAtLevel(7)).toBeNull();
			expect(getAbilityUnlockedAtLevel(12)).toBeNull();
		});
	});

	describe('getEnemiesNeededForLevel', () => {
		it('should calculate enemies needed for level 2', () => {
			const xpNeeded = getXpForNextLevel(1); // 50
			const enemiesNeeded = getEnemiesNeededForLevel(1, 25); // Rat XP
			expect(enemiesNeeded).toBe(Math.ceil(xpNeeded / 25));
		});

		it('should return Infinity for zero average XP', () => {
			expect(getEnemiesNeededForLevel(1, 0)).toBe(Infinity);
		});

		it('should return Infinity for negative XP', () => {
			expect(getEnemiesNeededForLevel(1, -10)).toBe(Infinity);
		});

		it('should require fewer enemies with higher XP enemies', () => {
			const withRats = getEnemiesNeededForLevel(5, 25);
			const withOgres = getEnemiesNeededForLevel(5, 100);
			expect(withOgres).toBeLessThan(withRats);
		});
	});

	describe('getEnemyXpRangeForAct', () => {
		it('should return Act 1 range', () => {
			const range = getEnemyXpRangeForAct(StoryAct.ACT_1);
			expect(range.min).toBe(20);
			expect(range.max).toBe(100);
			expect(range.average).toBe(45);
		});

		it('should return Act 2 range', () => {
			const range = getEnemyXpRangeForAct(StoryAct.ACT_2);
			expect(range.min).toBe(35);
			expect(range.max).toBe(175);
			expect(range.average).toBe(80);
		});

		it('should return Act 3 range', () => {
			const range = getEnemyXpRangeForAct(StoryAct.ACT_3);
			expect(range.min).toBe(100);
			expect(range.max).toBe(500);
			expect(range.average).toBe(200);
		});

		it('should have increasing ranges across acts', () => {
			const act1 = getEnemyXpRangeForAct(StoryAct.ACT_1);
			const act2 = getEnemyXpRangeForAct(StoryAct.ACT_2);
			const act3 = getEnemyXpRangeForAct(StoryAct.ACT_3);

			expect(act2.average).toBeGreaterThan(act1.average);
			expect(act3.average).toBeGreaterThan(act2.average);
		});
	});

	describe('getLevelFromXp', () => {
		it('should return level 1 for 0 XP', () => {
			expect(getLevelFromXp(0)).toBe(1);
		});

		it('should return level 1 for 49 XP', () => {
			expect(getLevelFromXp(49)).toBe(1);
		});

		it('should return level 2 for exactly 50 XP', () => {
			expect(getLevelFromXp(50)).toBe(2);
		});

		it('should return level 5 for 350 XP', () => {
			expect(getLevelFromXp(350)).toBe(5);
		});

		it('should return level 20 for max XP', () => {
			expect(getLevelFromXp(11100)).toBe(20);
		});

		it('should return level 20 for XP beyond max', () => {
			expect(getLevelFromXp(99999)).toBe(20);
		});

		it('should return level 1 for negative XP', () => {
			expect(getLevelFromXp(-100)).toBe(1);
		});
	});

	describe('analyzeXpCurve', () => {
		it('should return level data for all 20 levels', () => {
			const analysis = analyzeXpCurve();
			expect(analysis.levelData).toHaveLength(20);
		});

		it('should include correct level information', () => {
			const analysis = analyzeXpCurve();
			const level5 = analysis.levelData[4];

			expect(level5.level).toBe(5);
			expect(level5.cumulativeXp).toBe(350);
			expect(level5.act).toBe(StoryAct.ACT_1);
			expect(level5.abilityUnlock).toBe('Double Jump');
		});

		it('should calculate act totals', () => {
			const analysis = analyzeXpCurve();

			expect(analysis.actTotals[StoryAct.ACT_1]).toBeGreaterThan(0);
			expect(analysis.actTotals[StoryAct.ACT_2]).toBeGreaterThan(0);
			expect(analysis.actTotals[StoryAct.ACT_3]).toBeGreaterThan(0);
		});

		it('should have increasing XP requirements per act', () => {
			const analysis = analyzeXpCurve();

			expect(analysis.actTotals[StoryAct.ACT_2]).toBeGreaterThan(analysis.actTotals[StoryAct.ACT_1]);
			expect(analysis.actTotals[StoryAct.ACT_3]).toBeGreaterThan(analysis.actTotals[StoryAct.ACT_2]);
		});
	});

	describe('BOSS_XP_REWARDS', () => {
		it('should have Cave Boss at 200 XP', () => {
			expect(BOSS_XP_REWARDS.CAVE_BOSS).toBe(200);
		});

		it('should have Void King as highest reward', () => {
			const rewards = Object.values(BOSS_XP_REWARDS);
			const maxReward = Math.max(...rewards);
			expect(BOSS_XP_REWARDS.VOID_KING).toBe(maxReward);
		});

		it('should have progressive boss rewards', () => {
			expect(BOSS_XP_REWARDS.ANCIENT_RUINS_BOSS).toBeGreaterThan(BOSS_XP_REWARDS.CAVE_BOSS);
			expect(BOSS_XP_REWARDS.SHADOW_GUARDIAN).toBeGreaterThan(BOSS_XP_REWARDS.DARK_GATE_GUARDIAN);
			expect(BOSS_XP_REWARDS.VOID_KING).toBeGreaterThan(BOSS_XP_REWARDS.SHADOW_GUARDIAN);
		});
	});

	describe('Balance Verification', () => {
		it('should allow level 5 after Cave Boss at recommended pace', () => {
			// Player should be around level 4-5 before Cave Boss
			// Killing 8 rats (25 XP each) = 200 XP
			// Killing 2 ogres (100 XP each) = 200 XP
			// Total: 400 XP (slightly over level 5 requirement of 350)
			const expectedXp = 8 * 25 + 2 * 100;
			expect(expectedXp).toBeGreaterThanOrEqual(getXpForLevel(5));
		});

		it('should require reasonable kills per level in Act 1', () => {
			// Act 1 should be quick - less than 20 average kills per level
			for (let level = 2; level <= 5; level++) {
				const xpNeeded = getXpForNextLevel(level - 1);
				const avgAct1Xp = 45;
				const killsNeeded = Math.ceil(xpNeeded / avgAct1Xp);
				expect(killsNeeded).toBeLessThanOrEqual(20);
			}
		});

		it('should require reasonable kills per level in Act 2', () => {
			// Act 2 can be longer - less than 30 average kills per level
			for (let level = 6; level <= 12; level++) {
				const xpNeeded = getXpForNextLevel(level - 1);
				const avgAct2Xp = 80;
				const killsNeeded = Math.ceil(xpNeeded / avgAct2Xp);
				expect(killsNeeded).toBeLessThanOrEqual(30);
			}
		});

		it('should require more effort in Act 3', () => {
			// Act 3 should feel like endgame
			const act1Kills = getEnemiesNeededForLevel(3, 45);
			const act3Kills = getEnemiesNeededForLevel(16, 200);
			expect(act3Kills).toBeGreaterThan(act1Kills);
		});
	});
});
