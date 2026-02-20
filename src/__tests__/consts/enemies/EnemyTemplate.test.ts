/**
 * Tests for EnemyTemplate - Enemy creation utilities
 */

import {
	EnemyTier,
	TIER_BASE_STATS,
	createEnemyAnimations,
	createEnemyConfig,
	validateEnemyConfig,
	getNextEnemyId,
	COMMON_DROPS,
	IEnemyConfig,
} from '../../../consts/enemies/EnemyTemplate';
import { EntityDrops } from '../../../models/EntityDrops';

describe('EnemyTemplate', () => {
	describe('EnemyTier enum', () => {
		it('should have MINION tier', () => {
			expect(EnemyTier.MINION).toBe('minion');
		});

		it('should have COMMON tier', () => {
			expect(EnemyTier.COMMON).toBe('common');
		});

		it('should have ELITE tier', () => {
			expect(EnemyTier.ELITE).toBe('elite');
		});

		it('should have MINIBOSS tier', () => {
			expect(EnemyTier.MINIBOSS).toBe('miniboss');
		});

		it('should have BOSS tier', () => {
			expect(EnemyTier.BOSS).toBe('boss');
		});
	});

	describe('TIER_BASE_STATS', () => {
		it('should have stats for all tiers', () => {
			expect(TIER_BASE_STATS[EnemyTier.MINION]).toBeDefined();
			expect(TIER_BASE_STATS[EnemyTier.COMMON]).toBeDefined();
			expect(TIER_BASE_STATS[EnemyTier.ELITE]).toBeDefined();
			expect(TIER_BASE_STATS[EnemyTier.MINIBOSS]).toBeDefined();
			expect(TIER_BASE_STATS[EnemyTier.BOSS]).toBeDefined();
		});

		it('should have all required stat fields for each tier', () => {
			const requiredFields = ['baseHealth', 'atack', 'defense', 'speed', 'flee', 'hit', 'exp'];

			Object.values(EnemyTier).forEach((tier) => {
				const stats = TIER_BASE_STATS[tier];
				requiredFields.forEach((field) => {
					expect(stats).toHaveProperty(field);
				});
			});
		});

		it('should have increasing health by tier', () => {
			expect(TIER_BASE_STATS[EnemyTier.MINION].baseHealth).toBeLessThan(
				TIER_BASE_STATS[EnemyTier.COMMON].baseHealth
			);
			expect(TIER_BASE_STATS[EnemyTier.COMMON].baseHealth).toBeLessThan(
				TIER_BASE_STATS[EnemyTier.ELITE].baseHealth
			);
			expect(TIER_BASE_STATS[EnemyTier.ELITE].baseHealth).toBeLessThan(
				TIER_BASE_STATS[EnemyTier.MINIBOSS].baseHealth
			);
			expect(TIER_BASE_STATS[EnemyTier.MINIBOSS].baseHealth).toBeLessThan(
				TIER_BASE_STATS[EnemyTier.BOSS].baseHealth
			);
		});

		it('should have increasing attack by tier', () => {
			expect(TIER_BASE_STATS[EnemyTier.MINION].atack).toBeLessThan(TIER_BASE_STATS[EnemyTier.COMMON].atack);
			expect(TIER_BASE_STATS[EnemyTier.COMMON].atack).toBeLessThan(TIER_BASE_STATS[EnemyTier.ELITE].atack);
			expect(TIER_BASE_STATS[EnemyTier.ELITE].atack).toBeLessThan(TIER_BASE_STATS[EnemyTier.MINIBOSS].atack);
			expect(TIER_BASE_STATS[EnemyTier.MINIBOSS].atack).toBeLessThan(TIER_BASE_STATS[EnemyTier.BOSS].atack);
		});

		it('should have increasing exp by tier', () => {
			expect(TIER_BASE_STATS[EnemyTier.MINION].exp).toBeLessThan(TIER_BASE_STATS[EnemyTier.COMMON].exp);
			expect(TIER_BASE_STATS[EnemyTier.COMMON].exp).toBeLessThan(TIER_BASE_STATS[EnemyTier.ELITE].exp);
			expect(TIER_BASE_STATS[EnemyTier.ELITE].exp).toBeLessThan(TIER_BASE_STATS[EnemyTier.MINIBOSS].exp);
			expect(TIER_BASE_STATS[EnemyTier.MINIBOSS].exp).toBeLessThan(TIER_BASE_STATS[EnemyTier.BOSS].exp);
		});

		it('MINION tier should have weakest stats', () => {
			const minion = TIER_BASE_STATS[EnemyTier.MINION];
			expect(minion.baseHealth).toBe(10);
			expect(minion.atack).toBe(4);
			expect(minion.defense).toBe(1);
			expect(minion.exp).toBe(20);
		});

		it('BOSS tier should have strongest stats', () => {
			const boss = TIER_BASE_STATS[EnemyTier.BOSS];
			expect(boss.baseHealth).toBe(200);
			expect(boss.atack).toBe(30);
			expect(boss.defense).toBe(15);
			expect(boss.exp).toBe(500);
		});
	});

	describe('createEnemyAnimations', () => {
		it('should create 9 animations (3 directions x 3 actions)', () => {
			const animations = createEnemyAnimations({
				name: 'test',
				atlas: 'test',
			});

			expect(animations).toHaveLength(9);
		});

		it('should create animations for all directions', () => {
			const animations = createEnemyAnimations({
				name: 'test',
				atlas: 'test',
			});

			const directions = animations.map((a) => {
				const parts = a.key.split('-');
				return parts[parts.length - 1];
			});

			expect(directions.filter((d) => d === 'down')).toHaveLength(3);
			expect(directions.filter((d) => d === 'right')).toHaveLength(3);
			expect(directions.filter((d) => d === 'up')).toHaveLength(3);
		});

		it('should create animations for all actions', () => {
			const animations = createEnemyAnimations({
				name: 'test',
				atlas: 'test',
			});

			const actions = animations.map((a) => {
				const parts = a.key.split('-');
				return parts[1];
			});

			expect(actions.filter((a) => a === 'idle')).toHaveLength(3);
			expect(actions.filter((a) => a === 'walk')).toHaveLength(3);
			expect(actions.filter((a) => a === 'atk')).toHaveLength(3);
		});

		it('should use enemy name in animation keys', () => {
			const animations = createEnemyAnimations({
				name: 'skeleton',
				atlas: 'skeleton',
			});

			animations.forEach((anim) => {
				expect(anim.key).toMatch(/^skeleton-/);
			});
		});

		it('should use correct atlas value', () => {
			const animations = createEnemyAnimations({
				name: 'test',
				atlas: 'myatlas',
			});

			animations.forEach((anim) => {
				expect(anim.atlas).toBe('myatlas');
			});
		});

		it('should use atlasPrefix in prefix paths', () => {
			const animations = createEnemyAnimations({
				name: 'test',
				atlas: 'atlas',
				atlasPrefix: 'customprefix',
			});

			animations.forEach((anim) => {
				expect(anim.prefix).toMatch(/^customprefix\//);
			});
		});

		it('should default atlasPrefix to name', () => {
			const animations = createEnemyAnimations({
				name: 'myenemy',
				atlas: 'atlas',
			});

			animations.forEach((anim) => {
				expect(anim.prefix).toMatch(/^myenemy\//);
			});
		});

		it('should allow custom frame rates', () => {
			const animations = createEnemyAnimations({
				name: 'test',
				atlas: 'test',
				frameRates: { idle: 5, walk: 10, atk: 8 },
			});

			const idleAnim = animations.find((a) => a.key.includes('idle'));
			const walkAnim = animations.find((a) => a.key.includes('walk'));
			const atkAnim = animations.find((a) => a.key.includes('atk'));

			expect(idleAnim?.frameRate).toBe(5);
			expect(walkAnim?.frameRate).toBe(10);
			expect(atkAnim?.frameRate).toBe(8);
		});

		it('should use default frame rates when not specified', () => {
			const animations = createEnemyAnimations({
				name: 'test',
				atlas: 'test',
			});

			const idleAnim = animations.find((a) => a.key.includes('idle'));
			const walkAnim = animations.find((a) => a.key.includes('walk'));
			const atkAnim = animations.find((a) => a.key.includes('atk'));

			expect(idleAnim?.frameRate).toBe(2); // Default idle
			expect(walkAnim?.frameRate).toBe(6); // Default walk
			expect(atkAnim?.frameRate).toBe(4); // Default attack
		});

		it('should set attack animations to play once (repeat: 0)', () => {
			const animations = createEnemyAnimations({
				name: 'test',
				atlas: 'test',
			});

			const atkAnims = animations.filter((a) => a.key.includes('atk'));

			atkAnims.forEach((anim) => {
				expect(anim.repeat).toBe(0);
			});
		});

		it('should set idle and walk animations to loop (repeat: -1)', () => {
			const animations = createEnemyAnimations({
				name: 'test',
				atlas: 'test',
			});

			const loopAnims = animations.filter((a) => !a.key.includes('atk'));

			loopAnims.forEach((anim) => {
				expect(anim.repeat).toBe(-1);
			});
		});

		it('should use default zeroPad of 2', () => {
			const animations = createEnemyAnimations({
				name: 'test',
				atlas: 'test',
			});

			animations.forEach((anim) => {
				expect(anim.zeroPad).toBe(2);
			});
		});

		it('should allow custom zeroPad', () => {
			const animations = createEnemyAnimations({
				name: 'test',
				atlas: 'test',
				zeroPad: 4,
			});

			animations.forEach((anim) => {
				expect(anim.zeroPad).toBe(4);
			});
		});

		it('should have correct prefix format', () => {
			const animations = createEnemyAnimations({
				name: 'skeleton',
				atlas: 'skeleton',
			});

			const idleDown = animations.find((a) => a.key === 'skeleton-idle-down');
			expect(idleDown?.prefix).toBe('skeleton/idle-down/skeleton');

			const walkRight = animations.find((a) => a.key === 'skeleton-walk-right');
			expect(walkRight?.prefix).toBe('skeleton/walk-right/skeleton');
		});
	});

	describe('createEnemyConfig', () => {
		it('should create config with tier-based defaults', () => {
			const config = createEnemyConfig({
				id: 10,
				name: 'Test Enemy',
				texture: 'test',
				tier: EnemyTier.COMMON,
			});

			const commonStats = TIER_BASE_STATS[EnemyTier.COMMON];
			expect(config.baseHealth).toBe(commonStats.baseHealth);
			expect(config.atack).toBe(commonStats.atack);
			expect(config.defense).toBe(commonStats.defense);
			expect(config.speed).toBe(commonStats.speed);
			expect(config.exp).toBe(commonStats.exp);
		});

		it('should use provided id and name', () => {
			const config = createEnemyConfig({
				id: 42,
				name: 'My Enemy',
				texture: 'myenemy',
				tier: EnemyTier.MINION,
			});

			expect(config.id).toBe(42);
			expect(config.name).toBe('My Enemy');
			expect(config.texture).toBe('myenemy');
		});

		it('should allow stat overrides', () => {
			const config = createEnemyConfig({
				id: 1,
				name: 'Custom',
				texture: 'custom',
				tier: EnemyTier.MINION,
				baseHealth: 100,
				atack: 50,
				defense: 25,
				speed: 40,
				exp: 500,
			});

			expect(config.baseHealth).toBe(100);
			expect(config.atack).toBe(50);
			expect(config.defense).toBe(25);
			expect(config.speed).toBe(40);
			expect(config.exp).toBe(500);
		});

		it('should use default health bar offsets', () => {
			const config = createEnemyConfig({
				id: 1,
				name: 'Test',
				texture: 'test',
				tier: EnemyTier.MINION,
			});

			expect(config.healthBarOffsetX).toBe(-8);
			expect(config.healthBarOffsetY).toBe(18);
		});

		it('should allow custom health bar offsets', () => {
			const config = createEnemyConfig({
				id: 1,
				name: 'Test',
				texture: 'test',
				tier: EnemyTier.MINION,
				healthBarOffsetX: -12,
				healthBarOffsetY: 24,
			});

			expect(config.healthBarOffsetX).toBe(-12);
			expect(config.healthBarOffsetY).toBe(24);
		});

		it('should default to empty drops array', () => {
			const config = createEnemyConfig({
				id: 1,
				name: 'Test',
				texture: 'test',
				tier: EnemyTier.MINION,
			});

			expect(config.drops).toEqual([]);
		});

		it('should use provided drops', () => {
			const drops = [new EntityDrops(1, 50), new EntityDrops(2, 25)];

			const config = createEnemyConfig({
				id: 1,
				name: 'Test',
				texture: 'test',
				tier: EnemyTier.MINION,
				drops,
			});

			expect(config.drops).toEqual(drops);
		});

		it('should create BOSS tier enemy with high stats', () => {
			const config = createEnemyConfig({
				id: 99,
				name: 'Final Boss',
				texture: 'boss',
				tier: EnemyTier.BOSS,
			});

			expect(config.baseHealth).toBe(200);
			expect(config.atack).toBe(30);
			expect(config.defense).toBe(15);
			expect(config.exp).toBe(500);
		});
	});

	describe('validateEnemyConfig', () => {
		const validConfig: IEnemyConfig = {
			id: 1,
			name: 'Test',
			texture: 'test',
			baseHealth: 10,
			atack: 5,
			defense: 2,
			speed: 25,
			flee: 2,
			hit: 5,
			exp: 20,
			healthBarOffsetX: -8,
			healthBarOffsetY: 18,
			drops: [],
		};

		it('should return empty array for valid config', () => {
			const errors = validateEnemyConfig(validConfig);
			expect(errors).toEqual([]);
		});

		it('should detect non-positive ID', () => {
			const errors = validateEnemyConfig({ ...validConfig, id: 0 });
			expect(errors).toContain('Enemy ID must be positive');

			const errors2 = validateEnemyConfig({ ...validConfig, id: -1 });
			expect(errors2).toContain('Enemy ID must be positive');
		});

		it('should detect duplicate ID', () => {
			const existingIds = [1, 2, 3];
			const errors = validateEnemyConfig(validConfig, existingIds);
			expect(errors).toContain('Enemy ID 1 is already in use');
		});

		it('should detect empty name', () => {
			const errors = validateEnemyConfig({ ...validConfig, name: '' });
			expect(errors).toContain('Enemy name is required');

			const errors2 = validateEnemyConfig({ ...validConfig, name: '   ' });
			expect(errors2).toContain('Enemy name is required');
		});

		it('should detect empty texture', () => {
			const errors = validateEnemyConfig({ ...validConfig, texture: '' });
			expect(errors).toContain('Enemy texture is required');
		});

		it('should detect non-positive base health', () => {
			const errors = validateEnemyConfig({ ...validConfig, baseHealth: 0 });
			expect(errors).toContain('Base health must be positive');
		});

		it('should detect negative attack', () => {
			const errors = validateEnemyConfig({ ...validConfig, atack: -1 });
			expect(errors).toContain('Attack cannot be negative');
		});

		it('should detect negative defense', () => {
			const errors = validateEnemyConfig({ ...validConfig, defense: -1 });
			expect(errors).toContain('Defense cannot be negative');
		});

		it('should detect non-positive speed', () => {
			const errors = validateEnemyConfig({ ...validConfig, speed: 0 });
			expect(errors).toContain('Speed must be positive');
		});

		it('should detect negative exp', () => {
			const errors = validateEnemyConfig({ ...validConfig, exp: -5 });
			expect(errors).toContain('Experience cannot be negative');
		});

		it('should return multiple errors for multiple issues', () => {
			const badConfig: IEnemyConfig = {
				...validConfig,
				id: -1,
				name: '',
				baseHealth: 0,
			};

			const errors = validateEnemyConfig(badConfig);
			expect(errors.length).toBeGreaterThanOrEqual(3);
		});
	});

	describe('getNextEnemyId', () => {
		it('should return 1 for empty configs array', () => {
			expect(getNextEnemyId([])).toBe(1);
		});

		it('should return max id + 1', () => {
			const configs = [{ id: 1 } as IEnemyConfig, { id: 3 } as IEnemyConfig, { id: 2 } as IEnemyConfig];

			expect(getNextEnemyId(configs)).toBe(4);
		});

		it('should handle non-sequential ids', () => {
			const configs = [{ id: 5 } as IEnemyConfig, { id: 10 } as IEnemyConfig, { id: 7 } as IEnemyConfig];

			expect(getNextEnemyId(configs)).toBe(11);
		});

		it('should handle single enemy', () => {
			const configs = [{ id: 42 } as IEnemyConfig];
			expect(getNextEnemyId(configs)).toBe(43);
		});
	});

	describe('COMMON_DROPS', () => {
		it('should create health potion drop', () => {
			const drop = COMMON_DROPS.HEALTH_POTION(75);
			expect(drop.id).toBe(1);
			expect(drop.chance).toBe(75);
		});

		it('should create mana potion drop', () => {
			const drop = COMMON_DROPS.MANA_POTION(50);
			expect(drop.id).toBe(2);
			expect(drop.chance).toBe(50);
		});

		it('should have MINION_LOOT preset', () => {
			expect(COMMON_DROPS.MINION_LOOT).toHaveLength(1);
			expect(COMMON_DROPS.MINION_LOOT[0].id).toBe(1);
			expect(COMMON_DROPS.MINION_LOOT[0].chance).toBe(50);
		});

		it('should have COMMON_LOOT preset', () => {
			expect(COMMON_DROPS.COMMON_LOOT).toHaveLength(2);
		});

		it('should have ELITE_LOOT preset', () => {
			expect(COMMON_DROPS.ELITE_LOOT).toHaveLength(2);
			expect(COMMON_DROPS.ELITE_LOOT[0].chance).toBe(80);
		});

		it('should have BOSS_LOOT preset with 100% chances', () => {
			expect(COMMON_DROPS.BOSS_LOOT).toHaveLength(2);
			COMMON_DROPS.BOSS_LOOT.forEach((drop) => {
				expect(drop.chance).toBe(100);
			});
		});
	});

	describe('Integration: Creating a complete enemy', () => {
		it('should create a fully configured enemy using template functions', () => {
			// Step 1: Create animations
			const animations = createEnemyAnimations({
				name: 'goblin',
				atlas: 'goblin',
			});

			expect(animations).toHaveLength(9);

			// Step 2: Create config
			const config = createEnemyConfig({
				id: 100,
				name: 'Goblin',
				texture: 'goblin',
				tier: EnemyTier.COMMON,
				speed: 35,
				drops: COMMON_DROPS.COMMON_LOOT,
			});

			expect(config.name).toBe('Goblin');
			expect(config.speed).toBe(35); // Custom
			expect(config.baseHealth).toBe(20); // From tier
			expect(config.drops).toHaveLength(2);

			// Step 3: Validate
			const errors = validateEnemyConfig(config);
			expect(errors).toEqual([]);
		});

		it('should support placeholder sprites', () => {
			// Using existing sprite as placeholder
			const animations = createEnemyAnimations({
				name: 'demon',
				atlas: 'ogre', // Using ogre as placeholder
				atlasPrefix: 'ogre',
			});

			expect(animations[0].atlas).toBe('ogre');
			expect(animations[0].key).toMatch(/^demon-/);
			expect(animations[0].prefix).toMatch(/^ogre\//);

			const config = createEnemyConfig({
				id: 101,
				name: 'Demon',
				texture: 'ogre', // Placeholder
				tier: EnemyTier.ELITE,
			});

			expect(config.texture).toBe('ogre');
			expect(config.name).toBe('Demon');
		});
	});
});
