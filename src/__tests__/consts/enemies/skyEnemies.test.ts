/**
 * @fileoverview Tests for Sky Islands biome enemy configurations
 *
 * Tests cover:
 * - Harpy configuration and stats
 * - Wind Elemental configuration and stats
 * - Sky Serpent configuration and stats
 * - Thunder Bird configuration and stats
 * - Storm Phoenix boss configuration and stats
 *
 * @module __tests__/consts/enemies/skyEnemies
 */

import { HarpyConfig } from '../../../consts/enemies/harpy';
import { WindElementalConfig } from '../../../consts/enemies/windElemental';
import { SkySerpentConfig } from '../../../consts/enemies/skySerpent';
import { ThunderBirdConfig } from '../../../consts/enemies/thunderBird';
import { StormPhoenixConfig } from '../../../consts/enemies/stormPhoenix';

describe('Harpy Enemy', () => {
	it('should have correct ID', () => {
		expect(HarpyConfig.id).toBe(19);
	});

	it('should have correct name', () => {
		expect(HarpyConfig.name).toBe('Harpy');
	});

	it('should have fast flying speed', () => {
		expect(HarpyConfig.speed).toBe(40);
	});

	it('should have common tier stats', () => {
		expect(HarpyConfig.baseHealth).toBe(25);
		expect(HarpyConfig.atack).toBe(9);
		expect(HarpyConfig.defense).toBe(3);
	});

	it('should have reasonable exp reward', () => {
		expect(HarpyConfig.exp).toBe(55);
	});

	it('should have drops configured', () => {
		expect(HarpyConfig.drops.length).toBeGreaterThan(0);
	});
});

describe('Wind Elemental Enemy', () => {
	it('should have correct ID', () => {
		expect(WindElementalConfig.id).toBe(20);
	});

	it('should have correct name', () => {
		expect(WindElementalConfig.name).toBe('Wind Elemental');
	});

	it('should have high defense (elemental resistance)', () => {
		expect(WindElementalConfig.defense).toBeGreaterThanOrEqual(8);
	});

	it('should have elite tier health', () => {
		expect(WindElementalConfig.baseHealth).toBeGreaterThanOrEqual(40);
	});

	it('should have ranged attacker stats', () => {
		expect(WindElementalConfig.atack).toBe(14);
	});

	it('should have good exp reward for elite', () => {
		expect(WindElementalConfig.exp).toBe(100);
	});
});

describe('Sky Serpent Enemy', () => {
	it('should have correct ID', () => {
		expect(SkySerpentConfig.id).toBe(21);
	});

	it('should have correct name', () => {
		expect(SkySerpentConfig.name).toBe('Sky Serpent');
	});

	it('should have mini-boss tier health', () => {
		expect(SkySerpentConfig.baseHealth).toBeGreaterThanOrEqual(80);
	});

	it('should have strong attack for lightning breath', () => {
		expect(SkySerpentConfig.atack).toBeGreaterThanOrEqual(18);
	});

	it('should have high exp reward for mini-boss', () => {
		expect(SkySerpentConfig.exp).toBeGreaterThanOrEqual(200);
	});

	it('should have moderate speed for large creature', () => {
		expect(SkySerpentConfig.speed).toBe(28);
	});
});

describe('Thunder Bird Enemy', () => {
	it('should have correct ID', () => {
		expect(ThunderBirdConfig.id).toBe(22);
	});

	it('should have correct name', () => {
		expect(ThunderBirdConfig.name).toBe('Thunder Bird');
	});

	it('should be the fastest sky enemy', () => {
		expect(ThunderBirdConfig.speed).toBe(50);
		expect(ThunderBirdConfig.speed).toBeGreaterThan(HarpyConfig.speed);
		expect(ThunderBirdConfig.speed).toBeGreaterThan(WindElementalConfig.speed);
		expect(ThunderBirdConfig.speed).toBeGreaterThan(SkySerpentConfig.speed);
	});

	it('should have glass cannon stats (high attack, low defense)', () => {
		expect(ThunderBirdConfig.atack).toBeGreaterThanOrEqual(15);
		expect(ThunderBirdConfig.defense).toBeLessThanOrEqual(5);
	});

	it('should have moderate health for elite', () => {
		expect(ThunderBirdConfig.baseHealth).toBe(35);
	});
});

describe('Storm Phoenix Boss', () => {
	it('should have correct ID', () => {
		expect(StormPhoenixConfig.id).toBe(23);
	});

	it('should have correct name', () => {
		expect(StormPhoenixConfig.name).toBe('Storm Phoenix');
	});

	it('should have highest HP in Sky Islands', () => {
		expect(StormPhoenixConfig.baseHealth).toBe(300);
		expect(StormPhoenixConfig.baseHealth).toBeGreaterThan(SkySerpentConfig.baseHealth);
	});

	it('should have highest attack in Sky Islands', () => {
		expect(StormPhoenixConfig.atack).toBe(38);
		expect(StormPhoenixConfig.atack).toBeGreaterThan(SkySerpentConfig.atack);
		expect(StormPhoenixConfig.atack).toBeGreaterThan(ThunderBirdConfig.atack);
	});

	it('should have high defense for boss', () => {
		expect(StormPhoenixConfig.defense).toBeGreaterThanOrEqual(15);
	});

	it('should have massive exp reward', () => {
		expect(StormPhoenixConfig.exp).toBe(800);
	});

	it('should be fast for a boss', () => {
		expect(StormPhoenixConfig.speed).toBe(35);
	});

	it('should have guaranteed drops', () => {
		expect(StormPhoenixConfig.drops.length).toBeGreaterThanOrEqual(2);
		// Check for 100% drop chances
		const hasGuaranteedDrop = StormPhoenixConfig.drops.some((drop) => drop.chance === 100);
		expect(hasGuaranteedDrop).toBe(true);
	});
});

describe('Sky Islands enemy tier progression', () => {
	it('should have increasing health from common to boss', () => {
		expect(HarpyConfig.baseHealth).toBeLessThan(WindElementalConfig.baseHealth);
		expect(WindElementalConfig.baseHealth).toBeLessThan(SkySerpentConfig.baseHealth);
		expect(SkySerpentConfig.baseHealth).toBeLessThan(StormPhoenixConfig.baseHealth);
	});

	it('should have increasing attack from common to boss', () => {
		expect(HarpyConfig.atack).toBeLessThan(WindElementalConfig.atack);
		expect(WindElementalConfig.atack).toBeLessThan(SkySerpentConfig.atack);
		expect(SkySerpentConfig.atack).toBeLessThan(StormPhoenixConfig.atack);
	});

	it('should have increasing exp from common to boss', () => {
		expect(HarpyConfig.exp).toBeLessThan(WindElementalConfig.exp);
		expect(WindElementalConfig.exp).toBeLessThan(SkySerpentConfig.exp);
		expect(SkySerpentConfig.exp).toBeLessThan(StormPhoenixConfig.exp);
	});

	it('should all have unique IDs', () => {
		const ids = [
			HarpyConfig.id,
			WindElementalConfig.id,
			SkySerpentConfig.id,
			ThunderBirdConfig.id,
			StormPhoenixConfig.id,
		];
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(ids.length);
	});

	it('should all have valid textures', () => {
		const configs = [HarpyConfig, WindElementalConfig, SkySerpentConfig, ThunderBirdConfig, StormPhoenixConfig];
		configs.forEach((config) => {
			expect(config.texture).toBeDefined();
			expect(config.texture.length).toBeGreaterThan(0);
		});
	});
});

describe('Sky Islands enemy ID range', () => {
	it('should use IDs 19-23 for sky enemies', () => {
		expect(HarpyConfig.id).toBe(19);
		expect(WindElementalConfig.id).toBe(20);
		expect(SkySerpentConfig.id).toBe(21);
		expect(ThunderBirdConfig.id).toBe(22);
		expect(StormPhoenixConfig.id).toBe(23);
	});

	it('should not conflict with volcanic enemy IDs (14-18)', () => {
		const skyIds = [
			HarpyConfig.id,
			WindElementalConfig.id,
			SkySerpentConfig.id,
			ThunderBirdConfig.id,
			StormPhoenixConfig.id,
		];
		const volcanicIds = [14, 15, 16, 17, 18];

		skyIds.forEach((skyId) => {
			volcanicIds.forEach((volcanicId) => {
				expect(skyId).not.toBe(volcanicId);
			});
		});
	});
});
