import { AnglerFishConfig } from '../../../consts/enemies/anglerFish';
import { EnemiesSeedConfig } from '../../../consts/enemies/EnemiesSeedConfig';
import { RatConfig } from '../../../consts/enemies/rat';
import { BatConfig } from '../../../consts/enemies/bat';
import { OgreConfig } from '../../../consts/enemies/ogre';
import { BanditConfig } from '../../../consts/enemies/bandit';
import { WolfConfig } from '../../../consts/enemies/wolf';
import { ShadowScoutConfig } from '../../../consts/enemies/shadowScout';
import { FrostSpiderConfig } from '../../../consts/enemies/frostSpider';
import { IceElementalConfig } from '../../../consts/enemies/iceElemental';
import { YetiConfig } from '../../../consts/enemies/yeti';
import { FrostGiantConfig } from '../../../consts/enemies/frostGiant';
import { FireImpConfig } from '../../../consts/enemies/fireImp';
import { LavaGolemConfig } from '../../../consts/enemies/lavaGolem';
import { FireDrakeConfig } from '../../../consts/enemies/fireDrake';
import { MagmaWormConfig } from '../../../consts/enemies/magmaWorm';
import { FireDragonConfig } from '../../../consts/enemies/fireDragon';
import { HarpyConfig } from '../../../consts/enemies/harpy';
import { WindElementalConfig } from '../../../consts/enemies/windElemental';
import { SkySerpentConfig } from '../../../consts/enemies/skySerpent';
import { ThunderBirdConfig } from '../../../consts/enemies/thunderBird';
import { StormPhoenixConfig } from '../../../consts/enemies/stormPhoenix';
import { SharkConfig } from '../../../consts/enemies/shark';
import { WaterElementalConfig } from '../../../consts/enemies/waterElemental';
import { ElectricEelConfig } from '../../../consts/enemies/electricEel';
import { LeviathanConfig } from '../../../consts/enemies/leviathan';

describe('EnemiesSeedConfig', () => {
	it('should export an array of enemy configurations', () => {
		expect(Array.isArray(EnemiesSeedConfig)).toBe(true);
		expect(EnemiesSeedConfig.length).toBe(25); // 6 original + 4 Ice Caverns + 5 Volcanic + 5 Sky Islands + 5 Underwater Temple
	});

	it('should include all enemy types', () => {
		// Original enemies
		expect(EnemiesSeedConfig).toContain(RatConfig);
		expect(EnemiesSeedConfig).toContain(BatConfig);
		expect(EnemiesSeedConfig).toContain(OgreConfig);
		expect(EnemiesSeedConfig).toContain(BanditConfig);
		expect(EnemiesSeedConfig).toContain(WolfConfig);
		expect(EnemiesSeedConfig).toContain(ShadowScoutConfig);
		// Ice Caverns enemies
		expect(EnemiesSeedConfig).toContain(FrostSpiderConfig);
		expect(EnemiesSeedConfig).toContain(IceElementalConfig);
		expect(EnemiesSeedConfig).toContain(YetiConfig);
		expect(EnemiesSeedConfig).toContain(FrostGiantConfig);
		// Volcanic Dungeons enemies
		expect(EnemiesSeedConfig).toContain(FireImpConfig);
		expect(EnemiesSeedConfig).toContain(LavaGolemConfig);
		expect(EnemiesSeedConfig).toContain(FireDrakeConfig);
		expect(EnemiesSeedConfig).toContain(MagmaWormConfig);
		expect(EnemiesSeedConfig).toContain(FireDragonConfig);
		// Sky Islands enemies
		expect(EnemiesSeedConfig).toContain(HarpyConfig);
		expect(EnemiesSeedConfig).toContain(WindElementalConfig);
		expect(EnemiesSeedConfig).toContain(SkySerpentConfig);
		expect(EnemiesSeedConfig).toContain(ThunderBirdConfig);
		expect(EnemiesSeedConfig).toContain(StormPhoenixConfig);
		// Underwater Temple enemies
		expect(EnemiesSeedConfig).toContain(SharkConfig);
		expect(EnemiesSeedConfig).toContain(WaterElementalConfig);
		expect(EnemiesSeedConfig).toContain(ElectricEelConfig);
		expect(EnemiesSeedConfig).toContain(AnglerFishConfig);
		expect(EnemiesSeedConfig).toContain(LeviathanConfig);
	});

	it('should have unique enemy IDs', () => {
		const ids = EnemiesSeedConfig.map((enemy) => enemy.id);
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(ids.length);
	});

	it('should have unique enemy names', () => {
		const names = EnemiesSeedConfig.map((enemy) => enemy.name);
		const uniqueNames = new Set(names);
		expect(uniqueNames.size).toBe(names.length);
	});
});

describe('Enemy Configuration Structure', () => {
	const requiredProperties = [
		'id',
		'name',
		'texture',
		'baseHealth',
		'atack',
		'defense',
		'speed',
		'flee',
		'hit',
		'exp',
		'healthBarOffsetX',
		'healthBarOffsetY',
		'drops',
	];

	it.each(EnemiesSeedConfig)('$name should have all required properties', (enemy) => {
		requiredProperties.forEach((prop) => {
			expect(enemy).toHaveProperty(prop);
		});
	});

	it.each(EnemiesSeedConfig)('$name should have valid stat values', (enemy) => {
		expect(enemy.baseHealth).toBeGreaterThan(0);
		expect(enemy.atack).toBeGreaterThan(0);
		expect(enemy.defense).toBeGreaterThanOrEqual(0);
		expect(enemy.speed).toBeGreaterThan(0);
		expect(enemy.exp).toBeGreaterThan(0);
	});

	it.each(EnemiesSeedConfig)('$name should have valid drops array', (enemy) => {
		expect(Array.isArray(enemy.drops)).toBe(true);
	});
});

describe('Individual Enemy Configs', () => {
	describe('RatConfig', () => {
		it('should have correct id and name', () => {
			expect(RatConfig.id).toBe(1);
			expect(RatConfig.name).toBe('Rat');
		});

		it('should use rat texture', () => {
			expect(RatConfig.texture).toBe('rat');
		});

		it('should have low-tier stats', () => {
			expect(RatConfig.baseHealth).toBe(10);
			expect(RatConfig.exp).toBe(25);
		});
	});

	describe('BatConfig', () => {
		it('should have correct id and name', () => {
			expect(BatConfig.id).toBe(2);
			expect(BatConfig.name).toBe('Bat');
		});

		it('should be faster than rat', () => {
			expect(BatConfig.speed).toBeGreaterThan(RatConfig.speed);
		});
	});

	describe('OgreConfig', () => {
		it('should have correct id and name', () => {
			expect(OgreConfig.id).toBe(3);
			expect(OgreConfig.name).toBe('Ogre');
		});

		it('should have higher health than rat', () => {
			expect(OgreConfig.baseHealth).toBeGreaterThan(RatConfig.baseHealth);
		});

		it('should give more exp than rat', () => {
			expect(OgreConfig.exp).toBeGreaterThan(RatConfig.exp);
		});
	});

	describe('BanditConfig', () => {
		it('should have correct id and name', () => {
			expect(BanditConfig.id).toBe(4);
			expect(BanditConfig.name).toBe('Bandit');
		});

		it('should use ogre texture as placeholder', () => {
			expect(BanditConfig.texture).toBe('ogre');
		});

		it('should be faster than ogre', () => {
			expect(BanditConfig.speed).toBeGreaterThan(OgreConfig.speed);
		});

		it('should have mid-tier stats', () => {
			expect(BanditConfig.baseHealth).toBe(15);
			expect(BanditConfig.exp).toBe(40);
		});
	});

	describe('WolfConfig', () => {
		it('should have correct id and name', () => {
			expect(WolfConfig.id).toBe(5);
			expect(WolfConfig.name).toBe('Wolf');
		});

		it('should use bat texture as placeholder', () => {
			expect(WolfConfig.texture).toBe('bat');
		});

		it('should be one of the fastest enemies', () => {
			// Note: Fire Imp from Volcanic Dungeons is now the fastest (45)
			// Wolf (50) is the fastest among original enemies
			const originalEnemies = [RatConfig, BatConfig, OgreConfig, BanditConfig, WolfConfig, ShadowScoutConfig];
			const originalSpeeds = originalEnemies.map((e) => e.speed);
			const maxOriginalSpeed = Math.max(...originalSpeeds);
			expect(WolfConfig.speed).toBe(maxOriginalSpeed);
		});

		it('should rarely flee', () => {
			expect(WolfConfig.flee).toBe(1);
		});
	});

	describe('ShadowScoutConfig', () => {
		it('should have correct id and name', () => {
			expect(ShadowScoutConfig.id).toBe(6);
			expect(ShadowScoutConfig.name).toBe('Shadow Scout');
		});

		it('should be an elite enemy with high stats', () => {
			expect(ShadowScoutConfig.baseHealth).toBe(50);
			expect(ShadowScoutConfig.atack).toBe(12);
			expect(ShadowScoutConfig.defense).toBe(5);
		});

		it('should never flee', () => {
			expect(ShadowScoutConfig.flee).toBe(0);
		});

		it('should give high exp reward (highest for original enemies)', () => {
			// Note: Frost Giant (boss) now gives the highest exp overall
			// Shadow Scout gives highest exp among original (non-Ice Caverns) enemies
			const originalEnemies = [RatConfig, BatConfig, OgreConfig, BanditConfig, WolfConfig, ShadowScoutConfig];
			const originalExp = originalEnemies.map((e) => e.exp);
			const maxOriginalExp = Math.max(...originalExp);
			expect(ShadowScoutConfig.exp).toBe(maxOriginalExp);
		});

		it('should have valuable drops', () => {
			expect(ShadowScoutConfig.drops.length).toBeGreaterThan(0);
		});
	});
});
