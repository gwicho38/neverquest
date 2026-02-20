/**
 * @fileoverview Boss encounter template and multi-phase fight utilities
 *
 * Boss Encounter Template - Patterns for creating multi-phase boss fights
 *
 * This file provides:
 * 1. Type definitions for boss encounters
 * 2. Phase configuration with behavior patterns
 * 3. Attack pattern definitions
 * 4. Mechanics (telegraphs, enrage, adds)
 * 5. Factory functions for common boss patterns
 *
 * @example Creating a boss encounter:
 * ```typescript
 * import { createBossEncounter, BossPhaseType, AttackPattern } from './BossEncounterTemplate';
 *
 * const voidKingEncounter = createBossEncounter({
 *   id: 'void_king',
 *   name: 'The Void King',
 *   phases: [
 *     {
 *       type: BossPhaseType.STANDARD,
 *       healthThreshold: 100,
 *       attacks: [AttackPattern.MELEE_COMBO, AttackPattern.PROJECTILE_SINGLE],
 *       mechanics: [BossMechanic.TELEGRAPH],
 *     },
 *     {
 *       type: BossPhaseType.ENRAGED,
 *       healthThreshold: 30,
 *       attacks: [AttackPattern.AOE_CIRCLE, AttackPattern.DASH_ATTACK],
 *       mechanics: [BossMechanic.SUMMON_ADDS],
 *     },
 *   ],
 * });
 * ```
 */

import { EntityDrops } from '../../models/EntityDrops';
import { EnemyTier, TIER_BASE_STATS, IEnemyConfig } from './EnemyTemplate';

/**
 * Boss encounter difficulty level
 */
export enum BossDifficulty {
	/** Story boss - beatable at recommended level with basic gear */
	STORY = 'story',
	/** Challenge boss - requires good gear and mechanics knowledge */
	CHALLENGE = 'challenge',
	/** Raid boss - requires multiple players or significant overleveling */
	RAID = 'raid',
}

/**
 * Boss phase types - determines behavior pattern
 */
export enum BossPhaseType {
	/** Normal combat phase */
	STANDARD = 'standard',
	/** Increased aggression, faster attacks */
	ENRAGED = 'enraged',
	/** Boss becomes invulnerable, special mechanic required */
	INVULNERABLE = 'invulnerable',
	/** Boss is stunned/vulnerable, bonus damage window */
	VULNERABLE = 'vulnerable',
	/** Boss flees or repositions */
	RETREAT = 'retreat',
	/** Final desperate phase */
	DESPERATE = 'desperate',
}

/**
 * Attack patterns available to bosses
 */
export enum AttackPattern {
	/** Basic melee attack */
	MELEE_SINGLE = 'melee_single',
	/** Multi-hit melee combo */
	MELEE_COMBO = 'melee_combo',
	/** Ground slam with AOE */
	GROUND_SLAM = 'ground_slam',
	/** Single projectile */
	PROJECTILE_SINGLE = 'projectile_single',
	/** Multiple projectiles in spread */
	PROJECTILE_SPREAD = 'projectile_spread',
	/** Projectiles in all directions */
	PROJECTILE_RADIAL = 'projectile_radial',
	/** Homing projectile */
	PROJECTILE_HOMING = 'projectile_homing',
	/** Circular AOE around boss */
	AOE_CIRCLE = 'aoe_circle',
	/** Cone-shaped AOE in front */
	AOE_CONE = 'aoe_cone',
	/** Line/beam attack */
	AOE_LINE = 'aoe_line',
	/** Room-wide attack (must dodge to safe zone) */
	AOE_ROOM = 'aoe_room',
	/** Quick dash attack */
	DASH_ATTACK = 'dash_attack',
	/** Charge attack with wind-up */
	CHARGE_ATTACK = 'charge_attack',
	/** Teleport behind player and attack */
	TELEPORT_STRIKE = 'teleport_strike',
	/** Grab attack requiring button mashing to escape */
	GRAB = 'grab',
	/** Channel attack that must be interrupted */
	CHANNEL = 'channel',
}

/**
 * Boss mechanics - special behaviors
 */
export enum BossMechanic {
	/** Visual warning before attack */
	TELEGRAPH = 'telegraph',
	/** Summons additional enemies */
	SUMMON_ADDS = 'summon_adds',
	/** Temporary shield that blocks damage */
	SHIELD = 'shield',
	/** Heals self */
	HEAL = 'heal',
	/** Buffs self (damage, speed, etc.) */
	BUFF_SELF = 'buff_self',
	/** Debuffs player (slow, poison, etc.) */
	DEBUFF_PLAYER = 'debuff_player',
	/** Phase-specific arena hazards */
	ARENA_HAZARD = 'arena_hazard',
	/** Requires breaking specific part */
	BREAKABLE_PART = 'breakable_part',
	/** Requires using environment/item */
	ENVIRONMENT_INTERACTION = 'environment_interaction',
	/** Time limit before wipe/enrage */
	TIMER = 'timer',
}

/**
 * Add (summoned enemy) configuration
 */
export interface IBossAddConfig {
	/** Enemy ID from EnemiesSeedConfig */
	enemyId: number;
	/** Number to spawn */
	count: number;
	/** Spawn delay in ms */
	spawnDelay: number;
	/** Spawn pattern */
	spawnPattern: 'random' | 'circle' | 'sides' | 'corners';
	/** Whether adds must be killed before boss is vulnerable */
	mustKillFirst: boolean;
}

/**
 * Telegraph configuration for attack warning
 */
export interface ITelegraphConfig {
	/** Duration of telegraph in ms */
	duration: number;
	/** Visual type */
	type: 'ground_marker' | 'charge_glow' | 'cast_bar' | 'animation';
	/** Color of the telegraph (hex) */
	color: string;
}

/**
 * Attack configuration
 */
export interface IBossAttackConfig {
	/** Attack pattern type */
	pattern: AttackPattern;
	/** Base damage */
	damage: number;
	/** Damage multiplier for this phase */
	damageMultiplier: number;
	/** Cooldown between uses (ms) */
	cooldown: number;
	/** Attack range (pixels) */
	range: number;
	/** Optional telegraph before attack */
	telegraph?: ITelegraphConfig;
	/** Weight for random selection (higher = more likely) */
	weight: number;
}

/**
 * Phase configuration
 */
export interface IBossPhaseConfig {
	/** Phase type */
	type: BossPhaseType;
	/** Health threshold to enter this phase (percentage) */
	healthThreshold: number;
	/** Duration of phase in ms (0 = until threshold) */
	duration: number;
	/** Attack patterns available in this phase */
	attacks: IBossAttackConfig[];
	/** Special mechanics active in this phase */
	mechanics: BossMechanic[];
	/** Speed multiplier for this phase */
	speedMultiplier: number;
	/** Defense multiplier for this phase */
	defenseMultiplier: number;
	/** Adds to summon in this phase */
	adds?: IBossAddConfig[];
	/** Dialog/taunt to display when entering phase */
	phaseStartDialog?: string;
	/** Whether boss takes reduced damage in this phase */
	damageReduction: number;
}

/**
 * Complete boss encounter configuration
 */
export interface IBossEncounterConfig {
	/** Unique boss identifier */
	id: string;
	/** Display name */
	name: string;
	/** Difficulty level */
	difficulty: BossDifficulty;
	/** Base enemy configuration */
	baseConfig: IEnemyConfig;
	/** Ordered list of phases (executed by health threshold) */
	phases: IBossPhaseConfig[];
	/** XP reward on defeat */
	xpReward: number;
	/** Guaranteed drops */
	guaranteedDrops: EntityDrops[];
	/** Bonus drops (chance-based) */
	bonusDrops: EntityDrops[];
	/** Story flag to set on defeat */
	defeatFlag?: string;
	/** Music track key */
	musicTrack?: string;
	/** Arena size requirements */
	arenaSize: { width: number; height: number };
}

/**
 * Default telegraph configurations
 */
export const DEFAULT_TELEGRAPHS: Record<AttackPattern, ITelegraphConfig | undefined> = {
	[AttackPattern.MELEE_SINGLE]: undefined,
	[AttackPattern.MELEE_COMBO]: undefined,
	[AttackPattern.GROUND_SLAM]: { duration: 800, type: 'ground_marker', color: '#ff4444' },
	[AttackPattern.PROJECTILE_SINGLE]: undefined,
	[AttackPattern.PROJECTILE_SPREAD]: { duration: 400, type: 'charge_glow', color: '#ff8800' },
	[AttackPattern.PROJECTILE_RADIAL]: { duration: 600, type: 'charge_glow', color: '#ff8800' },
	[AttackPattern.PROJECTILE_HOMING]: { duration: 500, type: 'charge_glow', color: '#ff00ff' },
	[AttackPattern.AOE_CIRCLE]: { duration: 1000, type: 'ground_marker', color: '#ff0000' },
	[AttackPattern.AOE_CONE]: { duration: 800, type: 'ground_marker', color: '#ff4400' },
	[AttackPattern.AOE_LINE]: { duration: 600, type: 'ground_marker', color: '#ff6600' },
	[AttackPattern.AOE_ROOM]: { duration: 2000, type: 'cast_bar', color: '#ff0000' },
	[AttackPattern.DASH_ATTACK]: { duration: 300, type: 'animation', color: '#ffffff' },
	[AttackPattern.CHARGE_ATTACK]: { duration: 1200, type: 'charge_glow', color: '#ffff00' },
	[AttackPattern.TELEPORT_STRIKE]: { duration: 200, type: 'animation', color: '#8800ff' },
	[AttackPattern.GRAB]: { duration: 500, type: 'animation', color: '#00ff00' },
	[AttackPattern.CHANNEL]: { duration: 3000, type: 'cast_bar', color: '#0088ff' },
};

/**
 * Default damage values by attack pattern
 */
export const DEFAULT_ATTACK_DAMAGE: Record<AttackPattern, number> = {
	[AttackPattern.MELEE_SINGLE]: 10,
	[AttackPattern.MELEE_COMBO]: 8, // Per hit, multiple hits
	[AttackPattern.GROUND_SLAM]: 20,
	[AttackPattern.PROJECTILE_SINGLE]: 12,
	[AttackPattern.PROJECTILE_SPREAD]: 8, // Per projectile
	[AttackPattern.PROJECTILE_RADIAL]: 10, // Per projectile
	[AttackPattern.PROJECTILE_HOMING]: 15,
	[AttackPattern.AOE_CIRCLE]: 25,
	[AttackPattern.AOE_CONE]: 18,
	[AttackPattern.AOE_LINE]: 15,
	[AttackPattern.AOE_ROOM]: 40,
	[AttackPattern.DASH_ATTACK]: 12,
	[AttackPattern.CHARGE_ATTACK]: 30,
	[AttackPattern.TELEPORT_STRIKE]: 18,
	[AttackPattern.GRAB]: 5, // Per tick while grabbed
	[AttackPattern.CHANNEL]: 3, // Per tick
};

/**
 * Default cooldowns by attack pattern (ms)
 */
export const DEFAULT_ATTACK_COOLDOWNS: Record<AttackPattern, number> = {
	[AttackPattern.MELEE_SINGLE]: 1000,
	[AttackPattern.MELEE_COMBO]: 2500,
	[AttackPattern.GROUND_SLAM]: 5000,
	[AttackPattern.PROJECTILE_SINGLE]: 1500,
	[AttackPattern.PROJECTILE_SPREAD]: 3000,
	[AttackPattern.PROJECTILE_RADIAL]: 6000,
	[AttackPattern.PROJECTILE_HOMING]: 4000,
	[AttackPattern.AOE_CIRCLE]: 8000,
	[AttackPattern.AOE_CONE]: 4000,
	[AttackPattern.AOE_LINE]: 3000,
	[AttackPattern.AOE_ROOM]: 15000,
	[AttackPattern.DASH_ATTACK]: 3000,
	[AttackPattern.CHARGE_ATTACK]: 6000,
	[AttackPattern.TELEPORT_STRIKE]: 5000,
	[AttackPattern.GRAB]: 8000,
	[AttackPattern.CHANNEL]: 12000,
};

/**
 * Creates a boss attack configuration with defaults
 */
export function createBossAttack(pattern: AttackPattern, overrides?: Partial<IBossAttackConfig>): IBossAttackConfig {
	return {
		pattern,
		damage: overrides?.damage ?? DEFAULT_ATTACK_DAMAGE[pattern],
		damageMultiplier: overrides?.damageMultiplier ?? 1.0,
		cooldown: overrides?.cooldown ?? DEFAULT_ATTACK_COOLDOWNS[pattern],
		range: overrides?.range ?? 100,
		telegraph: overrides?.telegraph ?? DEFAULT_TELEGRAPHS[pattern],
		weight: overrides?.weight ?? 1,
	};
}

/**
 * Creates a boss phase configuration with defaults
 */
export function createBossPhase(config: {
	type: BossPhaseType;
	healthThreshold: number;
	attacks: AttackPattern[];
	mechanics?: BossMechanic[];
	speedMultiplier?: number;
	defenseMultiplier?: number;
	damageReduction?: number;
	adds?: IBossAddConfig[];
	phaseStartDialog?: string;
	duration?: number;
}): IBossPhaseConfig {
	// Set damage reduction based on phase type if not explicitly provided
	let damageReduction = config.damageReduction ?? 0;
	if (config.type === BossPhaseType.INVULNERABLE && config.damageReduction === undefined) {
		damageReduction = 1.0; // Full damage reduction for invulnerable phases
	}

	return {
		type: config.type,
		healthThreshold: config.healthThreshold,
		duration: config.duration ?? 0,
		attacks: config.attacks.map((pattern) => createBossAttack(pattern)),
		mechanics: config.mechanics ?? [BossMechanic.TELEGRAPH],
		speedMultiplier: config.speedMultiplier ?? 1.0,
		defenseMultiplier: config.defenseMultiplier ?? 1.0,
		damageReduction,
		adds: config.adds,
		phaseStartDialog: config.phaseStartDialog,
	};
}

/**
 * Options for creating a boss encounter
 */
export interface ICreateBossOptions {
	/** Unique identifier */
	id: string;
	/** Display name */
	name: string;
	/** Texture key */
	texture: string;
	/** Difficulty level */
	difficulty?: BossDifficulty;
	/** Base health (will be scaled by difficulty) */
	baseHealth?: number;
	/** Base attack damage */
	baseAttack?: number;
	/** Defense value */
	defense?: number;
	/** Movement speed */
	speed?: number;
	/** Phase configurations */
	phases: Array<{
		type: BossPhaseType;
		healthThreshold: number;
		attacks: AttackPattern[];
		mechanics?: BossMechanic[];
		speedMultiplier?: number;
		damageMultiplier?: number;
		adds?: IBossAddConfig[];
		phaseStartDialog?: string;
	}>;
	/** XP reward */
	xpReward?: number;
	/** Guaranteed drops */
	drops?: EntityDrops[];
	/** Story flag on defeat */
	defeatFlag?: string;
	/** Music track key */
	musicTrack?: string;
	/** Arena dimensions */
	arenaSize?: { width: number; height: number };
}

/**
 * Health multiplier by difficulty
 */
const DIFFICULTY_HEALTH_MULTIPLIER: Record<BossDifficulty, number> = {
	[BossDifficulty.STORY]: 1.0,
	[BossDifficulty.CHALLENGE]: 1.5,
	[BossDifficulty.RAID]: 3.0,
};

/**
 * XP multiplier by difficulty
 */
const DIFFICULTY_XP_MULTIPLIER: Record<BossDifficulty, number> = {
	[BossDifficulty.STORY]: 1.0,
	[BossDifficulty.CHALLENGE]: 1.75,
	[BossDifficulty.RAID]: 3.0,
};

/**
 * Creates a complete boss encounter configuration
 */
export function createBossEncounter(options: ICreateBossOptions): IBossEncounterConfig {
	const difficulty = options.difficulty ?? BossDifficulty.STORY;
	const bossStats = TIER_BASE_STATS[EnemyTier.BOSS];

	const baseHealth = Math.floor(
		(options.baseHealth ?? bossStats.baseHealth) * DIFFICULTY_HEALTH_MULTIPLIER[difficulty]
	);

	const baseConfig: IEnemyConfig = {
		id: 100 + options.id.length, // Boss IDs start at 100+
		name: options.name,
		texture: options.texture,
		baseHealth,
		atack: options.baseAttack ?? bossStats.atack,
		defense: options.defense ?? bossStats.defense,
		speed: options.speed ?? bossStats.speed,
		flee: 0, // Bosses never flee
		hit: bossStats.hit,
		exp: 0, // XP handled separately
		healthBarOffsetX: -16,
		healthBarOffsetY: 24,
		drops: [], // Drops handled separately
	};

	const phases = options.phases.map((phaseOpts) =>
		createBossPhase({
			type: phaseOpts.type,
			healthThreshold: phaseOpts.healthThreshold,
			attacks: phaseOpts.attacks,
			mechanics: phaseOpts.mechanics,
			speedMultiplier: phaseOpts.speedMultiplier,
			damageReduction: phaseOpts.type === BossPhaseType.INVULNERABLE ? 1.0 : 0,
			adds: phaseOpts.adds,
			phaseStartDialog: phaseOpts.phaseStartDialog,
		})
	);

	return {
		id: options.id,
		name: options.name,
		difficulty,
		baseConfig,
		phases,
		xpReward: Math.floor((options.xpReward ?? 500) * DIFFICULTY_XP_MULTIPLIER[difficulty]),
		guaranteedDrops: options.drops ?? [],
		bonusDrops: [],
		defeatFlag: options.defeatFlag,
		musicTrack: options.musicTrack,
		arenaSize: options.arenaSize ?? { width: 800, height: 600 },
	};
}

/**
 * Validates a boss encounter configuration
 */
export function validateBossEncounter(encounter: IBossEncounterConfig): string[] {
	const errors: string[] = [];

	if (!encounter.id || encounter.id.trim() === '') {
		errors.push('Boss ID is required');
	}

	if (!encounter.name || encounter.name.trim() === '') {
		errors.push('Boss name is required');
	}

	if (encounter.phases.length === 0) {
		errors.push('Boss must have at least one phase');
	}

	// Check phase health thresholds are valid
	const thresholds = encounter.phases.map((p) => p.healthThreshold);
	const sortedThresholds = [...thresholds].sort((a, b) => b - a);
	if (JSON.stringify(thresholds) !== JSON.stringify(sortedThresholds)) {
		errors.push('Phase health thresholds should be in descending order');
	}

	if (!thresholds.includes(100)) {
		errors.push('First phase should have healthThreshold of 100');
	}

	// Check each phase has attacks
	encounter.phases.forEach((phase, index) => {
		if (phase.attacks.length === 0) {
			errors.push(`Phase ${index + 1} has no attacks defined`);
		}
	});

	if (encounter.baseConfig.baseHealth <= 0) {
		errors.push('Boss must have positive health');
	}

	if (encounter.xpReward < 0) {
		errors.push('XP reward cannot be negative');
	}

	return errors;
}

/**
 * Pre-built boss encounter templates
 */
export const BOSS_TEMPLATES = {
	/**
	 * Simple two-phase boss - good for early game
	 */
	SIMPLE_TWO_PHASE: (id: string, name: string, texture: string) =>
		createBossEncounter({
			id,
			name,
			texture,
			difficulty: BossDifficulty.STORY,
			baseHealth: 150,
			phases: [
				{
					type: BossPhaseType.STANDARD,
					healthThreshold: 100,
					attacks: [AttackPattern.MELEE_SINGLE, AttackPattern.MELEE_COMBO],
					mechanics: [BossMechanic.TELEGRAPH],
				},
				{
					type: BossPhaseType.ENRAGED,
					healthThreshold: 30,
					attacks: [AttackPattern.MELEE_COMBO, AttackPattern.CHARGE_ATTACK],
					mechanics: [BossMechanic.TELEGRAPH],
					speedMultiplier: 1.3,
					phaseStartDialog: `${name} becomes enraged!`,
				},
			],
			xpReward: 300,
		}),

	/**
	 * Three-phase boss with adds - good for mid game
	 */
	THREE_PHASE_WITH_ADDS: (id: string, name: string, texture: string, addEnemyId: number) =>
		createBossEncounter({
			id,
			name,
			texture,
			difficulty: BossDifficulty.STORY,
			baseHealth: 300,
			phases: [
				{
					type: BossPhaseType.STANDARD,
					healthThreshold: 100,
					attacks: [AttackPattern.MELEE_COMBO, AttackPattern.PROJECTILE_SINGLE],
					mechanics: [BossMechanic.TELEGRAPH],
				},
				{
					type: BossPhaseType.INVULNERABLE,
					healthThreshold: 60,
					attacks: [AttackPattern.AOE_CIRCLE],
					mechanics: [BossMechanic.SUMMON_ADDS, BossMechanic.SHIELD],
					adds: [
						{
							enemyId: addEnemyId,
							count: 3,
							spawnDelay: 500,
							spawnPattern: 'circle',
							mustKillFirst: true,
						},
					],
					phaseStartDialog: `${name} summons minions!`,
				},
				{
					type: BossPhaseType.DESPERATE,
					healthThreshold: 20,
					attacks: [AttackPattern.MELEE_COMBO, AttackPattern.DASH_ATTACK, AttackPattern.AOE_CIRCLE],
					mechanics: [BossMechanic.TELEGRAPH],
					speedMultiplier: 1.5,
					phaseStartDialog: `${name} fights desperately!`,
				},
			],
			xpReward: 500,
		}),

	/**
	 * Complex multi-phase boss - good for end game
	 */
	COMPLEX_MULTI_PHASE: (id: string, name: string, texture: string) =>
		createBossEncounter({
			id,
			name,
			texture,
			difficulty: BossDifficulty.CHALLENGE,
			baseHealth: 500,
			phases: [
				{
					type: BossPhaseType.STANDARD,
					healthThreshold: 100,
					attacks: [AttackPattern.MELEE_COMBO, AttackPattern.PROJECTILE_SPREAD, AttackPattern.GROUND_SLAM],
					mechanics: [BossMechanic.TELEGRAPH],
				},
				{
					type: BossPhaseType.RETREAT,
					healthThreshold: 75,
					attacks: [AttackPattern.PROJECTILE_RADIAL, AttackPattern.AOE_LINE],
					mechanics: [BossMechanic.TELEGRAPH, BossMechanic.ARENA_HAZARD],
					speedMultiplier: 0.5,
					phaseStartDialog: `${name} retreats and unleashes ranged attacks!`,
				},
				{
					type: BossPhaseType.STANDARD,
					healthThreshold: 50,
					attacks: [AttackPattern.MELEE_COMBO, AttackPattern.TELEPORT_STRIKE, AttackPattern.AOE_CONE],
					mechanics: [BossMechanic.TELEGRAPH, BossMechanic.BUFF_SELF],
					speedMultiplier: 1.2,
					phaseStartDialog: `${name} returns with renewed fury!`,
				},
				{
					type: BossPhaseType.ENRAGED,
					healthThreshold: 25,
					attacks: [AttackPattern.DASH_ATTACK, AttackPattern.AOE_CIRCLE, AttackPattern.CHARGE_ATTACK],
					mechanics: [BossMechanic.TELEGRAPH],
					speedMultiplier: 1.5,
					phaseStartDialog: `${name} enters a berserker rage!`,
				},
				{
					type: BossPhaseType.DESPERATE,
					healthThreshold: 10,
					attacks: [AttackPattern.AOE_ROOM, AttackPattern.CHANNEL],
					mechanics: [BossMechanic.TELEGRAPH, BossMechanic.TIMER],
					speedMultiplier: 2.0,
					phaseStartDialog: `${name}: "If I fall, you fall with me!"`,
				},
			],
			xpReward: 1000,
		}),
};

/**
 * Gets phase for current health percentage
 * Phases are ordered by healthThreshold in descending order (100, 50, 20, etc.)
 * Returns the phase whose threshold is >= current health
 */
export function getPhaseForHealth(encounter: IBossEncounterConfig, healthPercent: number): IBossPhaseConfig | null {
	if (encounter.phases.length === 0) return null;

	// Find the phase with the lowest threshold that is still >= health
	// Phases are ordered descending by threshold (100, 50, 20...)
	// We want the last phase whose threshold is >= current health
	let activePhase = encounter.phases[0];

	for (const phase of encounter.phases) {
		if (healthPercent <= phase.healthThreshold) {
			activePhase = phase;
		}
	}

	return activePhase;
}

/**
 * Checks if boss should transition to new phase
 */
export function shouldTransitionPhase(
	encounter: IBossEncounterConfig,
	currentPhaseIndex: number,
	healthPercent: number
): boolean {
	const nextPhaseIndex = currentPhaseIndex + 1;
	if (nextPhaseIndex >= encounter.phases.length) {
		return false;
	}

	const nextPhase = encounter.phases[nextPhaseIndex];
	return healthPercent <= nextPhase.healthThreshold;
}

/**
 * Selects a random attack from phase based on weights
 */
export function selectRandomAttack(phase: IBossPhaseConfig): IBossAttackConfig | null {
	if (phase.attacks.length === 0) return null;

	const totalWeight = phase.attacks.reduce((sum, atk) => sum + atk.weight, 0);
	let random = Math.random() * totalWeight;

	for (const attack of phase.attacks) {
		random -= attack.weight;
		if (random <= 0) {
			return attack;
		}
	}

	return phase.attacks[0];
}
