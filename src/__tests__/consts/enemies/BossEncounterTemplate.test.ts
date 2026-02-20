/**
 * Tests for BossEncounterTemplate - Boss fight patterns and configurations
 */

import {
	BossDifficulty,
	BossPhaseType,
	AttackPattern,
	BossMechanic,
	DEFAULT_TELEGRAPHS,
	DEFAULT_ATTACK_DAMAGE,
	DEFAULT_ATTACK_COOLDOWNS,
	createBossAttack,
	createBossPhase,
	createBossEncounter,
	validateBossEncounter,
	getPhaseForHealth,
	shouldTransitionPhase,
	selectRandomAttack,
	BOSS_TEMPLATES,
	IBossEncounterConfig,
	IBossPhaseConfig,
	IBossAttackConfig,
} from '../../../consts/enemies/BossEncounterTemplate';
import { EntityDrops } from '../../../models/EntityDrops';

describe('BossEncounterTemplate', () => {
	describe('BossDifficulty enum', () => {
		it('should have STORY difficulty', () => {
			expect(BossDifficulty.STORY).toBe('story');
		});

		it('should have CHALLENGE difficulty', () => {
			expect(BossDifficulty.CHALLENGE).toBe('challenge');
		});

		it('should have RAID difficulty', () => {
			expect(BossDifficulty.RAID).toBe('raid');
		});
	});

	describe('BossPhaseType enum', () => {
		it('should have STANDARD phase', () => {
			expect(BossPhaseType.STANDARD).toBe('standard');
		});

		it('should have ENRAGED phase', () => {
			expect(BossPhaseType.ENRAGED).toBe('enraged');
		});

		it('should have INVULNERABLE phase', () => {
			expect(BossPhaseType.INVULNERABLE).toBe('invulnerable');
		});

		it('should have VULNERABLE phase', () => {
			expect(BossPhaseType.VULNERABLE).toBe('vulnerable');
		});

		it('should have RETREAT phase', () => {
			expect(BossPhaseType.RETREAT).toBe('retreat');
		});

		it('should have DESPERATE phase', () => {
			expect(BossPhaseType.DESPERATE).toBe('desperate');
		});
	});

	describe('AttackPattern enum', () => {
		it('should have melee attack patterns', () => {
			expect(AttackPattern.MELEE_SINGLE).toBe('melee_single');
			expect(AttackPattern.MELEE_COMBO).toBe('melee_combo');
		});

		it('should have projectile attack patterns', () => {
			expect(AttackPattern.PROJECTILE_SINGLE).toBe('projectile_single');
			expect(AttackPattern.PROJECTILE_SPREAD).toBe('projectile_spread');
			expect(AttackPattern.PROJECTILE_RADIAL).toBe('projectile_radial');
			expect(AttackPattern.PROJECTILE_HOMING).toBe('projectile_homing');
		});

		it('should have AOE attack patterns', () => {
			expect(AttackPattern.AOE_CIRCLE).toBe('aoe_circle');
			expect(AttackPattern.AOE_CONE).toBe('aoe_cone');
			expect(AttackPattern.AOE_LINE).toBe('aoe_line');
			expect(AttackPattern.AOE_ROOM).toBe('aoe_room');
		});

		it('should have special attack patterns', () => {
			expect(AttackPattern.DASH_ATTACK).toBe('dash_attack');
			expect(AttackPattern.CHARGE_ATTACK).toBe('charge_attack');
			expect(AttackPattern.TELEPORT_STRIKE).toBe('teleport_strike');
			expect(AttackPattern.GRAB).toBe('grab');
			expect(AttackPattern.CHANNEL).toBe('channel');
		});
	});

	describe('BossMechanic enum', () => {
		it('should have TELEGRAPH mechanic', () => {
			expect(BossMechanic.TELEGRAPH).toBe('telegraph');
		});

		it('should have SUMMON_ADDS mechanic', () => {
			expect(BossMechanic.SUMMON_ADDS).toBe('summon_adds');
		});

		it('should have SHIELD mechanic', () => {
			expect(BossMechanic.SHIELD).toBe('shield');
		});

		it('should have buff/debuff mechanics', () => {
			expect(BossMechanic.BUFF_SELF).toBe('buff_self');
			expect(BossMechanic.DEBUFF_PLAYER).toBe('debuff_player');
		});

		it('should have environmental mechanics', () => {
			expect(BossMechanic.ARENA_HAZARD).toBe('arena_hazard');
			expect(BossMechanic.ENVIRONMENT_INTERACTION).toBe('environment_interaction');
		});
	});

	describe('DEFAULT_TELEGRAPHS', () => {
		it('should have no telegraph for basic melee attacks', () => {
			expect(DEFAULT_TELEGRAPHS[AttackPattern.MELEE_SINGLE]).toBeUndefined();
			expect(DEFAULT_TELEGRAPHS[AttackPattern.MELEE_COMBO]).toBeUndefined();
		});

		it('should have telegraphs for heavy attacks', () => {
			expect(DEFAULT_TELEGRAPHS[AttackPattern.GROUND_SLAM]).toBeDefined();
			expect(DEFAULT_TELEGRAPHS[AttackPattern.AOE_CIRCLE]).toBeDefined();
			expect(DEFAULT_TELEGRAPHS[AttackPattern.CHARGE_ATTACK]).toBeDefined();
		});

		it('should have longest telegraph for room-wide attacks', () => {
			const roomTelegraph = DEFAULT_TELEGRAPHS[AttackPattern.AOE_ROOM];
			expect(roomTelegraph?.duration).toBe(2000);
		});

		it('should use ground_marker type for ground-based attacks', () => {
			expect(DEFAULT_TELEGRAPHS[AttackPattern.GROUND_SLAM]?.type).toBe('ground_marker');
			expect(DEFAULT_TELEGRAPHS[AttackPattern.AOE_CIRCLE]?.type).toBe('ground_marker');
		});

		it('should use cast_bar type for channel attacks', () => {
			expect(DEFAULT_TELEGRAPHS[AttackPattern.CHANNEL]?.type).toBe('cast_bar');
		});
	});

	describe('DEFAULT_ATTACK_DAMAGE', () => {
		it('should have damage values for all attack patterns', () => {
			Object.values(AttackPattern).forEach((pattern) => {
				expect(DEFAULT_ATTACK_DAMAGE[pattern]).toBeDefined();
				expect(DEFAULT_ATTACK_DAMAGE[pattern]).toBeGreaterThan(0);
			});
		});

		it('should have higher damage for heavy attacks', () => {
			expect(DEFAULT_ATTACK_DAMAGE[AttackPattern.AOE_ROOM]).toBeGreaterThan(
				DEFAULT_ATTACK_DAMAGE[AttackPattern.MELEE_SINGLE]
			);
			expect(DEFAULT_ATTACK_DAMAGE[AttackPattern.CHARGE_ATTACK]).toBeGreaterThan(
				DEFAULT_ATTACK_DAMAGE[AttackPattern.MELEE_SINGLE]
			);
		});

		it('should have lower per-hit damage for multi-hit attacks', () => {
			expect(DEFAULT_ATTACK_DAMAGE[AttackPattern.MELEE_COMBO]).toBeLessThan(
				DEFAULT_ATTACK_DAMAGE[AttackPattern.MELEE_SINGLE]
			);
		});
	});

	describe('DEFAULT_ATTACK_COOLDOWNS', () => {
		it('should have cooldown values for all attack patterns', () => {
			Object.values(AttackPattern).forEach((pattern) => {
				expect(DEFAULT_ATTACK_COOLDOWNS[pattern]).toBeDefined();
				expect(DEFAULT_ATTACK_COOLDOWNS[pattern]).toBeGreaterThan(0);
			});
		});

		it('should have longer cooldowns for powerful attacks', () => {
			expect(DEFAULT_ATTACK_COOLDOWNS[AttackPattern.AOE_ROOM]).toBeGreaterThan(
				DEFAULT_ATTACK_COOLDOWNS[AttackPattern.MELEE_SINGLE]
			);
		});

		it('should have very long cooldown for channel attacks', () => {
			expect(DEFAULT_ATTACK_COOLDOWNS[AttackPattern.CHANNEL]).toBeGreaterThanOrEqual(10000);
		});
	});

	describe('createBossAttack', () => {
		it('should create attack with default values', () => {
			const attack = createBossAttack(AttackPattern.MELEE_SINGLE);

			expect(attack.pattern).toBe(AttackPattern.MELEE_SINGLE);
			expect(attack.damage).toBe(DEFAULT_ATTACK_DAMAGE[AttackPattern.MELEE_SINGLE]);
			expect(attack.cooldown).toBe(DEFAULT_ATTACK_COOLDOWNS[AttackPattern.MELEE_SINGLE]);
			expect(attack.damageMultiplier).toBe(1.0);
			expect(attack.weight).toBe(1);
		});

		it('should allow overriding damage', () => {
			const attack = createBossAttack(AttackPattern.MELEE_SINGLE, { damage: 50 });
			expect(attack.damage).toBe(50);
		});

		it('should allow overriding cooldown', () => {
			const attack = createBossAttack(AttackPattern.MELEE_SINGLE, { cooldown: 500 });
			expect(attack.cooldown).toBe(500);
		});

		it('should allow overriding damage multiplier', () => {
			const attack = createBossAttack(AttackPattern.MELEE_SINGLE, { damageMultiplier: 2.0 });
			expect(attack.damageMultiplier).toBe(2.0);
		});

		it('should include default telegraph when applicable', () => {
			const attack = createBossAttack(AttackPattern.AOE_CIRCLE);
			expect(attack.telegraph).toBeDefined();
			expect(attack.telegraph?.type).toBe('ground_marker');
		});

		it('should allow custom telegraph', () => {
			const customTelegraph = { duration: 1500, type: 'cast_bar' as const, color: '#00ff00' };
			const attack = createBossAttack(AttackPattern.MELEE_SINGLE, { telegraph: customTelegraph });
			expect(attack.telegraph).toEqual(customTelegraph);
		});

		it('should allow custom weight', () => {
			const attack = createBossAttack(AttackPattern.MELEE_SINGLE, { weight: 5 });
			expect(attack.weight).toBe(5);
		});
	});

	describe('createBossPhase', () => {
		it('should create phase with required config', () => {
			const phase = createBossPhase({
				type: BossPhaseType.STANDARD,
				healthThreshold: 100,
				attacks: [AttackPattern.MELEE_SINGLE],
			});

			expect(phase.type).toBe(BossPhaseType.STANDARD);
			expect(phase.healthThreshold).toBe(100);
			expect(phase.attacks).toHaveLength(1);
		});

		it('should create attacks from patterns', () => {
			const phase = createBossPhase({
				type: BossPhaseType.STANDARD,
				healthThreshold: 100,
				attacks: [AttackPattern.MELEE_SINGLE, AttackPattern.PROJECTILE_SINGLE],
			});

			expect(phase.attacks[0].pattern).toBe(AttackPattern.MELEE_SINGLE);
			expect(phase.attacks[1].pattern).toBe(AttackPattern.PROJECTILE_SINGLE);
		});

		it('should default mechanics to TELEGRAPH', () => {
			const phase = createBossPhase({
				type: BossPhaseType.STANDARD,
				healthThreshold: 100,
				attacks: [AttackPattern.MELEE_SINGLE],
			});

			expect(phase.mechanics).toContain(BossMechanic.TELEGRAPH);
		});

		it('should use provided mechanics', () => {
			const phase = createBossPhase({
				type: BossPhaseType.INVULNERABLE,
				healthThreshold: 50,
				attacks: [AttackPattern.AOE_CIRCLE],
				mechanics: [BossMechanic.SUMMON_ADDS, BossMechanic.SHIELD],
			});

			expect(phase.mechanics).toContain(BossMechanic.SUMMON_ADDS);
			expect(phase.mechanics).toContain(BossMechanic.SHIELD);
		});

		it('should default multipliers to 1.0', () => {
			const phase = createBossPhase({
				type: BossPhaseType.STANDARD,
				healthThreshold: 100,
				attacks: [AttackPattern.MELEE_SINGLE],
			});

			expect(phase.speedMultiplier).toBe(1.0);
			expect(phase.defenseMultiplier).toBe(1.0);
		});

		it('should allow speed multiplier override', () => {
			const phase = createBossPhase({
				type: BossPhaseType.ENRAGED,
				healthThreshold: 30,
				attacks: [AttackPattern.MELEE_COMBO],
				speedMultiplier: 1.5,
			});

			expect(phase.speedMultiplier).toBe(1.5);
		});

		it('should set full damage reduction for INVULNERABLE phase', () => {
			const phase = createBossPhase({
				type: BossPhaseType.INVULNERABLE,
				healthThreshold: 50,
				attacks: [AttackPattern.AOE_CIRCLE],
			});

			expect(phase.damageReduction).toBe(1.0);
		});

		it('should include adds configuration', () => {
			const phase = createBossPhase({
				type: BossPhaseType.INVULNERABLE,
				healthThreshold: 50,
				attacks: [AttackPattern.AOE_CIRCLE],
				adds: [
					{
						enemyId: 1,
						count: 3,
						spawnDelay: 500,
						spawnPattern: 'circle',
						mustKillFirst: true,
					},
				],
			});

			expect(phase.adds).toHaveLength(1);
			expect(phase.adds?.[0].count).toBe(3);
		});

		it('should include phase start dialog', () => {
			const phase = createBossPhase({
				type: BossPhaseType.ENRAGED,
				healthThreshold: 30,
				attacks: [AttackPattern.MELEE_COMBO],
				phaseStartDialog: 'The boss becomes enraged!',
			});

			expect(phase.phaseStartDialog).toBe('The boss becomes enraged!');
		});
	});

	describe('createBossEncounter', () => {
		const basicBossOptions = {
			id: 'test_boss',
			name: 'Test Boss',
			texture: 'ogre',
			phases: [
				{
					type: BossPhaseType.STANDARD,
					healthThreshold: 100,
					attacks: [AttackPattern.MELEE_SINGLE],
				},
			],
		};

		it('should create encounter with required config', () => {
			const encounter = createBossEncounter(basicBossOptions);

			expect(encounter.id).toBe('test_boss');
			expect(encounter.name).toBe('Test Boss');
			expect(encounter.phases).toHaveLength(1);
		});

		it('should default to STORY difficulty', () => {
			const encounter = createBossEncounter(basicBossOptions);
			expect(encounter.difficulty).toBe(BossDifficulty.STORY);
		});

		it('should apply difficulty health multiplier', () => {
			const storyBoss = createBossEncounter({ ...basicBossOptions, baseHealth: 100 });
			const challengeBoss = createBossEncounter({
				...basicBossOptions,
				baseHealth: 100,
				difficulty: BossDifficulty.CHALLENGE,
			});

			expect(challengeBoss.baseConfig.baseHealth).toBeGreaterThan(storyBoss.baseConfig.baseHealth);
		});

		it('should apply difficulty XP multiplier', () => {
			const storyBoss = createBossEncounter({ ...basicBossOptions, xpReward: 500 });
			const challengeBoss = createBossEncounter({
				...basicBossOptions,
				xpReward: 500,
				difficulty: BossDifficulty.CHALLENGE,
			});

			expect(challengeBoss.xpReward).toBeGreaterThan(storyBoss.xpReward);
		});

		it('should set flee to 0 (bosses never flee)', () => {
			const encounter = createBossEncounter(basicBossOptions);
			expect(encounter.baseConfig.flee).toBe(0);
		});

		it('should use provided drops', () => {
			const drops = [new EntityDrops(1, 100), new EntityDrops(2, 50)];
			const encounter = createBossEncounter({ ...basicBossOptions, drops });

			expect(encounter.guaranteedDrops).toEqual(drops);
		});

		it('should set defeat flag', () => {
			const encounter = createBossEncounter({
				...basicBossOptions,
				defeatFlag: 'CAVE_BOSS_DEFEATED',
			});

			expect(encounter.defeatFlag).toBe('CAVE_BOSS_DEFEATED');
		});

		it('should set music track', () => {
			const encounter = createBossEncounter({
				...basicBossOptions,
				musicTrack: 'boss_battle_1',
			});

			expect(encounter.musicTrack).toBe('boss_battle_1');
		});

		it('should use default arena size', () => {
			const encounter = createBossEncounter(basicBossOptions);
			expect(encounter.arenaSize).toEqual({ width: 800, height: 600 });
		});

		it('should allow custom arena size', () => {
			const encounter = createBossEncounter({
				...basicBossOptions,
				arenaSize: { width: 1200, height: 900 },
			});

			expect(encounter.arenaSize).toEqual({ width: 1200, height: 900 });
		});
	});

	describe('validateBossEncounter', () => {
		const validEncounter: IBossEncounterConfig = {
			id: 'valid_boss',
			name: 'Valid Boss',
			difficulty: BossDifficulty.STORY,
			baseConfig: {
				id: 100,
				name: 'Valid Boss',
				texture: 'ogre',
				baseHealth: 200,
				atack: 30,
				defense: 15,
				speed: 20,
				flee: 0,
				hit: 12,
				exp: 0,
				healthBarOffsetX: -16,
				healthBarOffsetY: 24,
				drops: [],
			},
			phases: [
				{
					type: BossPhaseType.STANDARD,
					healthThreshold: 100,
					duration: 0,
					attacks: [createBossAttack(AttackPattern.MELEE_SINGLE)],
					mechanics: [BossMechanic.TELEGRAPH],
					speedMultiplier: 1.0,
					defenseMultiplier: 1.0,
					damageReduction: 0,
				},
			],
			xpReward: 500,
			guaranteedDrops: [],
			bonusDrops: [],
			arenaSize: { width: 800, height: 600 },
		};

		it('should return empty array for valid encounter', () => {
			const errors = validateBossEncounter(validEncounter);
			expect(errors).toEqual([]);
		});

		it('should detect empty ID', () => {
			const errors = validateBossEncounter({ ...validEncounter, id: '' });
			expect(errors).toContain('Boss ID is required');
		});

		it('should detect empty name', () => {
			const errors = validateBossEncounter({ ...validEncounter, name: '' });
			expect(errors).toContain('Boss name is required');
		});

		it('should detect no phases', () => {
			const errors = validateBossEncounter({ ...validEncounter, phases: [] });
			expect(errors).toContain('Boss must have at least one phase');
		});

		it('should detect missing first phase at 100%', () => {
			const badPhases = [{ ...validEncounter.phases[0], healthThreshold: 50 }];
			const errors = validateBossEncounter({ ...validEncounter, phases: badPhases });
			expect(errors).toContain('First phase should have healthThreshold of 100');
		});

		it('should detect out-of-order thresholds', () => {
			const badPhases = [
				{ ...validEncounter.phases[0], healthThreshold: 100 },
				{ ...validEncounter.phases[0], healthThreshold: 60 },
				{ ...validEncounter.phases[0], healthThreshold: 80 }, // Out of order
			];
			const errors = validateBossEncounter({ ...validEncounter, phases: badPhases });
			expect(errors).toContain('Phase health thresholds should be in descending order');
		});

		it('should detect phase with no attacks', () => {
			const badPhases = [{ ...validEncounter.phases[0], attacks: [] as IBossAttackConfig[] }];
			const errors = validateBossEncounter({ ...validEncounter, phases: badPhases });
			expect(errors).toContain('Phase 1 has no attacks defined');
		});

		it('should detect non-positive health', () => {
			const badConfig = { ...validEncounter.baseConfig, baseHealth: 0 };
			const errors = validateBossEncounter({ ...validEncounter, baseConfig: badConfig });
			expect(errors).toContain('Boss must have positive health');
		});

		it('should detect negative XP', () => {
			const errors = validateBossEncounter({ ...validEncounter, xpReward: -100 });
			expect(errors).toContain('XP reward cannot be negative');
		});
	});

	describe('getPhaseForHealth', () => {
		const encounter = createBossEncounter({
			id: 'test',
			name: 'Test',
			texture: 'ogre',
			phases: [
				{ type: BossPhaseType.STANDARD, healthThreshold: 100, attacks: [AttackPattern.MELEE_SINGLE] },
				{ type: BossPhaseType.ENRAGED, healthThreshold: 50, attacks: [AttackPattern.MELEE_COMBO] },
				{ type: BossPhaseType.DESPERATE, healthThreshold: 20, attacks: [AttackPattern.AOE_CIRCLE] },
			],
		});

		it('should return first phase at 100% health', () => {
			const phase = getPhaseForHealth(encounter, 100);
			expect(phase?.type).toBe(BossPhaseType.STANDARD);
		});

		it('should return first phase at 75% health', () => {
			const phase = getPhaseForHealth(encounter, 75);
			expect(phase?.type).toBe(BossPhaseType.STANDARD);
		});

		it('should return second phase at 50% health', () => {
			const phase = getPhaseForHealth(encounter, 50);
			expect(phase?.type).toBe(BossPhaseType.ENRAGED);
		});

		it('should return second phase at 35% health', () => {
			const phase = getPhaseForHealth(encounter, 35);
			expect(phase?.type).toBe(BossPhaseType.ENRAGED);
		});

		it('should return third phase at 20% health', () => {
			const phase = getPhaseForHealth(encounter, 20);
			expect(phase?.type).toBe(BossPhaseType.DESPERATE);
		});

		it('should return last phase at 1% health', () => {
			const phase = getPhaseForHealth(encounter, 1);
			expect(phase?.type).toBe(BossPhaseType.DESPERATE);
		});
	});

	describe('shouldTransitionPhase', () => {
		const encounter = createBossEncounter({
			id: 'test',
			name: 'Test',
			texture: 'ogre',
			phases: [
				{ type: BossPhaseType.STANDARD, healthThreshold: 100, attacks: [AttackPattern.MELEE_SINGLE] },
				{ type: BossPhaseType.ENRAGED, healthThreshold: 50, attacks: [AttackPattern.MELEE_COMBO] },
			],
		});

		it('should not transition at high health', () => {
			expect(shouldTransitionPhase(encounter, 0, 80)).toBe(false);
		});

		it('should transition when health crosses threshold', () => {
			expect(shouldTransitionPhase(encounter, 0, 50)).toBe(true);
		});

		it('should not transition if already in last phase', () => {
			expect(shouldTransitionPhase(encounter, 1, 25)).toBe(false);
		});

		it('should transition at exactly the threshold', () => {
			expect(shouldTransitionPhase(encounter, 0, 50)).toBe(true);
		});

		it('should transition below threshold', () => {
			expect(shouldTransitionPhase(encounter, 0, 40)).toBe(true);
		});
	});

	describe('selectRandomAttack', () => {
		it('should return null for phase with no attacks', () => {
			const phase: IBossPhaseConfig = {
				type: BossPhaseType.STANDARD,
				healthThreshold: 100,
				duration: 0,
				attacks: [],
				mechanics: [],
				speedMultiplier: 1,
				defenseMultiplier: 1,
				damageReduction: 0,
			};

			expect(selectRandomAttack(phase)).toBeNull();
		});

		it('should return an attack from the phase', () => {
			const attacks = [
				createBossAttack(AttackPattern.MELEE_SINGLE),
				createBossAttack(AttackPattern.PROJECTILE_SINGLE),
			];
			const phase: IBossPhaseConfig = {
				type: BossPhaseType.STANDARD,
				healthThreshold: 100,
				duration: 0,
				attacks,
				mechanics: [],
				speedMultiplier: 1,
				defenseMultiplier: 1,
				damageReduction: 0,
			};

			const selected = selectRandomAttack(phase);
			expect(attacks).toContain(selected);
		});

		it('should respect attack weights', () => {
			const heavyWeight = createBossAttack(AttackPattern.MELEE_SINGLE, { weight: 100 });
			const lightWeight = createBossAttack(AttackPattern.PROJECTILE_SINGLE, { weight: 1 });

			const phase: IBossPhaseConfig = {
				type: BossPhaseType.STANDARD,
				healthThreshold: 100,
				duration: 0,
				attacks: [heavyWeight, lightWeight],
				mechanics: [],
				speedMultiplier: 1,
				defenseMultiplier: 1,
				damageReduction: 0,
			};

			// Run multiple times and check distribution
			let heavyCount = 0;
			for (let i = 0; i < 100; i++) {
				const selected = selectRandomAttack(phase);
				if (selected?.pattern === AttackPattern.MELEE_SINGLE) {
					heavyCount++;
				}
			}

			// Heavy weight should be selected most of the time (expect 95%+)
			expect(heavyCount).toBeGreaterThan(90);
		});
	});

	describe('BOSS_TEMPLATES', () => {
		describe('SIMPLE_TWO_PHASE', () => {
			it('should create a valid two-phase boss', () => {
				const boss = BOSS_TEMPLATES.SIMPLE_TWO_PHASE('cave_boss', 'Cave Troll', 'ogre');

				expect(boss.phases).toHaveLength(2);
				expect(boss.phases[0].type).toBe(BossPhaseType.STANDARD);
				expect(boss.phases[1].type).toBe(BossPhaseType.ENRAGED);
			});

			it('should have enrage at 30% health', () => {
				const boss = BOSS_TEMPLATES.SIMPLE_TWO_PHASE('test', 'Test', 'ogre');
				expect(boss.phases[1].healthThreshold).toBe(30);
			});

			it('should validate successfully', () => {
				const boss = BOSS_TEMPLATES.SIMPLE_TWO_PHASE('test', 'Test', 'ogre');
				expect(validateBossEncounter(boss)).toEqual([]);
			});
		});

		describe('THREE_PHASE_WITH_ADDS', () => {
			it('should create a valid three-phase boss', () => {
				const boss = BOSS_TEMPLATES.THREE_PHASE_WITH_ADDS('ruins_boss', 'Ruins Guardian', 'ogre', 1);

				expect(boss.phases).toHaveLength(3);
				expect(boss.phases[0].type).toBe(BossPhaseType.STANDARD);
				expect(boss.phases[1].type).toBe(BossPhaseType.INVULNERABLE);
				expect(boss.phases[2].type).toBe(BossPhaseType.DESPERATE);
			});

			it('should have adds in invulnerable phase', () => {
				const boss = BOSS_TEMPLATES.THREE_PHASE_WITH_ADDS('test', 'Test', 'ogre', 1);
				expect(boss.phases[1].adds).toBeDefined();
				expect(boss.phases[1].adds?.[0].mustKillFirst).toBe(true);
			});

			it('should validate successfully', () => {
				const boss = BOSS_TEMPLATES.THREE_PHASE_WITH_ADDS('test', 'Test', 'ogre', 1);
				expect(validateBossEncounter(boss)).toEqual([]);
			});
		});

		describe('COMPLEX_MULTI_PHASE', () => {
			it('should create a valid five-phase boss', () => {
				const boss = BOSS_TEMPLATES.COMPLEX_MULTI_PHASE('void_king', 'The Void King', 'ogre');

				expect(boss.phases).toHaveLength(5);
			});

			it('should be CHALLENGE difficulty', () => {
				const boss = BOSS_TEMPLATES.COMPLEX_MULTI_PHASE('test', 'Test', 'ogre');
				expect(boss.difficulty).toBe(BossDifficulty.CHALLENGE);
			});

			it('should have retreat phase', () => {
				const boss = BOSS_TEMPLATES.COMPLEX_MULTI_PHASE('test', 'Test', 'ogre');
				const retreatPhase = boss.phases.find((p) => p.type === BossPhaseType.RETREAT);
				expect(retreatPhase).toBeDefined();
			});

			it('should have increasing speed multipliers in later phases', () => {
				const boss = BOSS_TEMPLATES.COMPLEX_MULTI_PHASE('test', 'Test', 'ogre');
				const enragedPhase = boss.phases.find((p) => p.type === BossPhaseType.ENRAGED);
				const desperatePhase = boss.phases.find((p) => p.type === BossPhaseType.DESPERATE);

				expect(enragedPhase?.speedMultiplier).toBe(1.5);
				expect(desperatePhase?.speedMultiplier).toBe(2.0);
			});

			it('should validate successfully', () => {
				const boss = BOSS_TEMPLATES.COMPLEX_MULTI_PHASE('test', 'Test', 'ogre');
				expect(validateBossEncounter(boss)).toEqual([]);
			});
		});
	});

	describe('Integration: Creating story bosses', () => {
		it('should create Cave Boss (end of Act 1)', () => {
			const caveBoss = createBossEncounter({
				id: 'cave_boss',
				name: 'The Cave Dweller',
				texture: 'ogre',
				difficulty: BossDifficulty.STORY,
				baseHealth: 150,
				phases: [
					{
						type: BossPhaseType.STANDARD,
						healthThreshold: 100,
						attacks: [AttackPattern.MELEE_SINGLE, AttackPattern.GROUND_SLAM],
					},
					{
						type: BossPhaseType.ENRAGED,
						healthThreshold: 25,
						attacks: [AttackPattern.MELEE_COMBO, AttackPattern.CHARGE_ATTACK],
						phaseStartDialog: 'The Cave Dweller roars in fury!',
					},
				],
				xpReward: 200,
				defeatFlag: 'CAVE_BOSS_DEFEATED',
				drops: [new EntityDrops(1, 100)],
			});

			expect(validateBossEncounter(caveBoss)).toEqual([]);
			expect(caveBoss.defeatFlag).toBe('CAVE_BOSS_DEFEATED');
		});

		it('should create Void King (final boss)', () => {
			const voidKing = createBossEncounter({
				id: 'void_king',
				name: 'The Void King',
				texture: 'ogre',
				difficulty: BossDifficulty.CHALLENGE,
				baseHealth: 500,
				phases: [
					{
						type: BossPhaseType.STANDARD,
						healthThreshold: 100,
						attacks: [AttackPattern.MELEE_COMBO, AttackPattern.PROJECTILE_SPREAD],
					},
					{
						type: BossPhaseType.RETREAT,
						healthThreshold: 75,
						attacks: [AttackPattern.PROJECTILE_RADIAL, AttackPattern.AOE_LINE],
						phaseStartDialog: 'The Void King retreats to the shadows!',
					},
					{
						type: BossPhaseType.INVULNERABLE,
						healthThreshold: 50,
						attacks: [AttackPattern.AOE_ROOM],
						mechanics: [BossMechanic.SUMMON_ADDS],
						adds: [
							{
								enemyId: 6, // Shadow Scout
								count: 4,
								spawnDelay: 1000,
								spawnPattern: 'corners',
								mustKillFirst: true,
							},
						],
						phaseStartDialog: 'The Void King calls forth his shadow army!',
					},
					{
						type: BossPhaseType.ENRAGED,
						healthThreshold: 30,
						attacks: [AttackPattern.TELEPORT_STRIKE, AttackPattern.AOE_CIRCLE, AttackPattern.DASH_ATTACK],
						speedMultiplier: 1.5,
						phaseStartDialog: 'The Void King: "You will not deny me my victory!"',
					},
					{
						type: BossPhaseType.DESPERATE,
						healthThreshold: 10,
						attacks: [AttackPattern.CHANNEL, AttackPattern.AOE_ROOM],
						mechanics: [BossMechanic.TIMER],
						speedMultiplier: 2.0,
						phaseStartDialog: 'The Void King: "If I fall, this realm falls with me!"',
					},
				],
				xpReward: 1500,
				defeatFlag: 'VOID_KING_DEFEATED',
				musicTrack: 'final_boss',
				arenaSize: { width: 1000, height: 800 },
			});

			expect(validateBossEncounter(voidKing)).toEqual([]);
			expect(voidKing.phases).toHaveLength(5);
			expect(voidKing.xpReward).toBeGreaterThan(1500); // Challenge difficulty multiplier
		});
	});
});
