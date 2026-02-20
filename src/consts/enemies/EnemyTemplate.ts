/**
 * @fileoverview Enemy creation template and factory utilities
 *
 * Enemy Template - A comprehensive guide and utility for creating new enemy types
 *
 * This file provides:
 * 1. Type definitions for enemy configurations
 * 2. Factory functions to generate animation configs
 * 3. Builder pattern for creating enemies quickly
 * 4. Default values and documentation
 *
 * @example Creating a new enemy type:
 * ```typescript
 * // 1. Create the enemy file (e.g., src/consts/enemies/skeleton.ts)
 * import { createEnemyAnimations, createEnemyConfig, EnemyTier } from './EnemyTemplate';
 *
 * export const Skeleton = createEnemyAnimations({
 *   name: 'skeleton',
 *   atlas: 'skeleton', // Or use existing atlas like 'ogre' as placeholder
 *   atlasPrefix: 'skeleton', // Prefix in atlas paths
 * });
 *
 * export const SkeletonConfig = createEnemyConfig({
 *   id: 7, // Next available ID
 *   name: 'Skeleton',
 *   texture: 'skeleton',
 *   tier: EnemyTier.COMMON,
 *   // Override specific stats if needed
 *   baseHealth: 20,
 *   speed: 30,
 * });
 *
 * // 2. Add to EnemiesSeedConfig.ts:
 * import { SkeletonConfig } from './skeleton';
 * export const EnemiesSeedConfig = [..., SkeletonConfig];
 * ```
 */

import { EntityDrops } from '../../models/EntityDrops';

/**
 * Direction suffixes used in animation keys
 */
export type AnimationDirection = 'up' | 'down' | 'right';

/**
 * Animation action types
 */
export type AnimationAction = 'idle' | 'walk' | 'atk';

/**
 * Enemy tier for stat scaling
 */
export enum EnemyTier {
	/** Weak enemies - tutorial/early game (rats, bats) */
	MINION = 'minion',
	/** Standard enemies - common encounters (bandits, wolves) */
	COMMON = 'common',
	/** Stronger enemies - challenge encounters (ogres) */
	ELITE = 'elite',
	/** Mini-boss enemies - rare/special (shadow scout) */
	MINIBOSS = 'miniboss',
	/** Boss enemies - major encounters */
	BOSS = 'boss',
}

/**
 * Default stats by enemy tier
 */
export const TIER_BASE_STATS: Record<
	EnemyTier,
	{
		baseHealth: number;
		atack: number;
		defense: number;
		speed: number;
		flee: number;
		hit: number;
		exp: number;
	}
> = {
	[EnemyTier.MINION]: {
		baseHealth: 10,
		atack: 4,
		defense: 1,
		speed: 25,
		flee: 2,
		hit: 4,
		exp: 20,
	},
	[EnemyTier.COMMON]: {
		baseHealth: 20,
		atack: 7,
		defense: 3,
		speed: 30,
		flee: 3,
		hit: 6,
		exp: 40,
	},
	[EnemyTier.ELITE]: {
		baseHealth: 40,
		atack: 12,
		defense: 6,
		speed: 25,
		flee: 4,
		hit: 8,
		exp: 80,
	},
	[EnemyTier.MINIBOSS]: {
		baseHealth: 80,
		atack: 18,
		defense: 10,
		speed: 35,
		flee: 5,
		hit: 10,
		exp: 200,
	},
	[EnemyTier.BOSS]: {
		baseHealth: 200,
		atack: 30,
		defense: 15,
		speed: 20,
		flee: 6,
		hit: 12,
		exp: 500,
	},
};

/**
 * Animation frame configuration
 */
export interface IAnimationFrameConfig {
	/** Atlas key (sprite sheet name) */
	atlas: string;
	/** Animation key (used to play the animation) */
	key: string;
	/** Frames per second */
	frameRate: number;
	/** Prefix path in the atlas */
	prefix: string;
	/** Starting frame index */
	start: number;
	/** Ending frame index */
	end: number;
	/** Zero padding for frame numbers */
	zeroPad: number;
	/** Repeat count (-1 for infinite loop, 0 for play once) */
	repeat: number;
}

/**
 * Animation generation options
 */
export interface IAnimationGeneratorOptions {
	/** Enemy name (used in animation keys, e.g., 'skeleton') */
	name: string;
	/** Atlas key for the sprite sheet */
	atlas: string;
	/** Prefix used in atlas paths (defaults to name) */
	atlasPrefix?: string;
	/** Frame rate overrides by action type */
	frameRates?: Partial<Record<AnimationAction, number>>;
	/** Frame counts by direction and action (defaults provided) */
	frameCounts?: Partial<Record<AnimationDirection, Partial<Record<AnimationAction, { start: number; end: number }>>>>;
	/** Zero padding for frame numbers (default: 2) */
	zeroPad?: number;
}

/**
 * Default frame rates by action
 */
const DEFAULT_FRAME_RATES: Record<AnimationAction, number> = {
	idle: 2,
	walk: 6,
	atk: 4,
};

/**
 * Default frame counts by direction and action
 */
const DEFAULT_FRAME_COUNTS: Record<AnimationDirection, Record<AnimationAction, { start: number; end: number }>> = {
	down: {
		idle: { start: 0, end: 3 },
		walk: { start: 0, end: 3 },
		atk: { start: 0, end: 4 },
	},
	right: {
		idle: { start: 0, end: 3 },
		walk: { start: 0, end: 3 },
		atk: { start: 0, end: 4 },
	},
	up: {
		idle: { start: 0, end: 3 },
		walk: { start: 0, end: 3 },
		atk: { start: 0, end: 4 },
	},
};

/**
 * Creates animation configurations for an enemy type
 *
 * @param options - Configuration options for animation generation
 * @returns Array of animation frame configurations
 *
 * @example
 * ```typescript
 * const SkeletonAnimations = createEnemyAnimations({
 *   name: 'skeleton',
 *   atlas: 'skeleton',
 *   frameRates: { idle: 1, walk: 4 }, // Override defaults
 * });
 * ```
 */
export function createEnemyAnimations(options: IAnimationGeneratorOptions): IAnimationFrameConfig[] {
	const { name, atlas, atlasPrefix = name, frameRates = {}, frameCounts = {}, zeroPad = 2 } = options;

	const animations: IAnimationFrameConfig[] = [];
	const directions: AnimationDirection[] = ['down', 'right', 'up'];
	const actions: AnimationAction[] = ['idle', 'walk', 'atk'];

	for (const direction of directions) {
		for (const action of actions) {
			const frameRate = frameRates[action] ?? DEFAULT_FRAME_RATES[action];
			const frames = frameCounts[direction]?.[action] ?? DEFAULT_FRAME_COUNTS[direction][action];
			const repeat = action === 'atk' ? 0 : -1; // Attack plays once, others loop

			animations.push({
				atlas,
				key: `${name}-${action}-${direction}`,
				frameRate,
				prefix: `${atlasPrefix}/${action}-${direction}/${atlasPrefix}`,
				start: frames.start,
				end: frames.end,
				zeroPad,
				repeat,
			});
		}
	}

	return animations;
}

/**
 * Enemy configuration options
 */
export interface IEnemyConfigOptions {
	/** Unique enemy ID (must be unique across all enemies) */
	id: number;
	/** Display name for the enemy */
	name: string;
	/** Texture key (atlas name) */
	texture: string;
	/** Enemy tier for base stat scaling */
	tier: EnemyTier;
	/** Override base health (optional) */
	baseHealth?: number;
	/** Override attack stat (optional) */
	atack?: number;
	/** Override defense stat (optional) */
	defense?: number;
	/** Override speed stat (optional) */
	speed?: number;
	/** Override flee chance (optional) */
	flee?: number;
	/** Override hit chance (optional) */
	hit?: number;
	/** Override experience reward (optional) */
	exp?: number;
	/** Health bar X offset (default: -8) */
	healthBarOffsetX?: number;
	/** Health bar Y offset (default: 18) */
	healthBarOffsetY?: number;
	/** Item drops configuration */
	drops?: EntityDrops[];
}

/**
 * Full enemy configuration type
 */
export interface IEnemyConfig {
	id: number;
	name: string;
	texture: string;
	baseHealth: number;
	atack: number;
	defense: number;
	speed: number;
	flee: number;
	hit: number;
	exp: number;
	healthBarOffsetX: number;
	healthBarOffsetY: number;
	drops: EntityDrops[];
}

/**
 * Creates an enemy configuration with tier-based defaults
 *
 * @param options - Enemy configuration options
 * @returns Complete enemy configuration object
 *
 * @example
 * ```typescript
 * const SkeletonConfig = createEnemyConfig({
 *   id: 7,
 *   name: 'Skeleton',
 *   texture: 'skeleton',
 *   tier: EnemyTier.COMMON,
 *   speed: 35, // Override just the speed
 *   drops: [new EntityDrops(1, 50)],
 * });
 * ```
 */
export function createEnemyConfig(options: IEnemyConfigOptions): IEnemyConfig {
	const tierStats = TIER_BASE_STATS[options.tier];

	return {
		id: options.id,
		name: options.name,
		texture: options.texture,
		baseHealth: options.baseHealth ?? tierStats.baseHealth,
		atack: options.atack ?? tierStats.atack,
		defense: options.defense ?? tierStats.defense,
		speed: options.speed ?? tierStats.speed,
		flee: options.flee ?? tierStats.flee,
		hit: options.hit ?? tierStats.hit,
		exp: options.exp ?? tierStats.exp,
		healthBarOffsetX: options.healthBarOffsetX ?? -8,
		healthBarOffsetY: options.healthBarOffsetY ?? 18,
		drops: options.drops ?? [],
	};
}

/**
 * Common drop configurations for quick enemy setup
 */
export const COMMON_DROPS = {
	/** Red potion - healing */
	HEALTH_POTION: (chance: number) => new EntityDrops(1, chance),
	/** Dark potion - mana/special */
	MANA_POTION: (chance: number) => new EntityDrops(2, chance),
	/** Basic loot configuration for minions */
	MINION_LOOT: [new EntityDrops(1, 50)],
	/** Standard loot for common enemies */
	COMMON_LOOT: [new EntityDrops(1, 60), new EntityDrops(2, 20)],
	/** Good loot for elite enemies */
	ELITE_LOOT: [new EntityDrops(1, 80), new EntityDrops(2, 40)],
	/** Guaranteed loot for bosses */
	BOSS_LOOT: [new EntityDrops(1, 100), new EntityDrops(2, 100)],
};

/**
 * Validates an enemy configuration
 *
 * @param config - Enemy configuration to validate
 * @param existingIds - Array of existing enemy IDs to check for duplicates
 * @returns Array of validation errors (empty if valid)
 */
export function validateEnemyConfig(config: IEnemyConfig, existingIds: number[] = []): string[] {
	const errors: string[] = [];

	if (config.id <= 0) {
		errors.push('Enemy ID must be positive');
	}

	if (existingIds.includes(config.id)) {
		errors.push(`Enemy ID ${config.id} is already in use`);
	}

	if (!config.name || config.name.trim() === '') {
		errors.push('Enemy name is required');
	}

	if (!config.texture || config.texture.trim() === '') {
		errors.push('Enemy texture is required');
	}

	if (config.baseHealth <= 0) {
		errors.push('Base health must be positive');
	}

	if (config.atack < 0) {
		errors.push('Attack cannot be negative');
	}

	if (config.defense < 0) {
		errors.push('Defense cannot be negative');
	}

	if (config.speed <= 0) {
		errors.push('Speed must be positive');
	}

	if (config.exp < 0) {
		errors.push('Experience cannot be negative');
	}

	return errors;
}

/**
 * Gets the next available enemy ID
 *
 * @param existingConfigs - Array of existing enemy configs
 * @returns Next available ID
 */
export function getNextEnemyId(existingConfigs: IEnemyConfig[]): number {
	if (existingConfigs.length === 0) return 1;
	const maxId = Math.max(...existingConfigs.map((c) => c.id));
	return maxId + 1;
}

/**
 * Enemy creation checklist (for documentation purposes)
 *
 * 1. [ ] Choose unique ID (use getNextEnemyId helper)
 * 2. [ ] Create sprite atlas or identify placeholder
 * 3. [ ] Create enemy file in src/consts/enemies/
 * 4. [ ] Generate animations using createEnemyAnimations
 * 5. [ ] Create config using createEnemyConfig with appropriate tier
 * 6. [ ] Add to EnemiesSeedConfig.ts imports and array
 * 7. [ ] Add tests for new enemy configuration
 * 8. [ ] Test in-game spawning and behavior
 */
