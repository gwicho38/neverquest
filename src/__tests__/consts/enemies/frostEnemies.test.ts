/**
 * Tests for Ice Caverns frost enemy configurations
 *
 * Tests the Frost Spider, Ice Elemental, Yeti, and Frost Giant
 * enemy configurations for the Ice Caverns biome.
 */

import { FrostSpider, FrostSpiderConfig } from '../../../consts/enemies/frostSpider';
import { IceElemental, IceElementalConfig } from '../../../consts/enemies/iceElemental';
import { Yeti, YetiConfig } from '../../../consts/enemies/yeti';
import { FrostGiant, FrostGiantConfig } from '../../../consts/enemies/frostGiant';

describe('Frost Spider', () => {
	describe('FrostSpider animations', () => {
		it('should have animations for all directions', () => {
			const directions = ['down', 'right', 'up'];
			const actions = ['idle', 'walk', 'atk'];

			directions.forEach((direction) => {
				actions.forEach((action) => {
					const animKey = `frostSpider-${action}-${direction}`;
					const hasAnimation = FrostSpider.some((anim) => anim.key === animKey);
					expect(hasAnimation).toBe(true);
				});
			});
		});

		it('should have correct frame rates', () => {
			const idleAnim = FrostSpider.find((anim) => anim.key === 'frostSpider-idle-down');
			const walkAnim = FrostSpider.find((anim) => anim.key === 'frostSpider-walk-down');
			const atkAnim = FrostSpider.find((anim) => anim.key === 'frostSpider-atk-down');

			expect(idleAnim?.frameRate).toBe(3);
			expect(walkAnim?.frameRate).toBe(8);
			expect(atkAnim?.frameRate).toBe(6);
		});

		it('should use bat atlas as placeholder', () => {
			FrostSpider.forEach((anim) => {
				expect(anim.atlas).toBe('bat');
			});
		});
	});

	describe('FrostSpiderConfig', () => {
		it('should have unique ID', () => {
			expect(FrostSpiderConfig.id).toBe(10);
		});

		it('should have correct name', () => {
			expect(FrostSpiderConfig.name).toBe('Frost Spider');
		});

		it('should have common tier stats', () => {
			expect(FrostSpiderConfig.baseHealth).toBe(25);
			expect(FrostSpiderConfig.atack).toBe(10);
			expect(FrostSpiderConfig.defense).toBe(3);
		});

		it('should be fast (high speed)', () => {
			expect(FrostSpiderConfig.speed).toBe(40);
		});

		it('should have drops configured', () => {
			expect(FrostSpiderConfig.drops.length).toBeGreaterThan(0);
		});
	});
});

describe('Ice Elemental', () => {
	describe('IceElemental animations', () => {
		it('should have animations for all directions', () => {
			const directions = ['down', 'right', 'up'];
			const actions = ['idle', 'walk', 'atk'];

			directions.forEach((direction) => {
				actions.forEach((action) => {
					const animKey = `iceElemental-${action}-${direction}`;
					const hasAnimation = IceElemental.some((anim) => anim.key === animKey);
					expect(hasAnimation).toBe(true);
				});
			});
		});

		it('should have slow animations (ranged caster)', () => {
			const idleAnim = IceElemental.find((anim) => anim.key === 'iceElemental-idle-down');
			const walkAnim = IceElemental.find((anim) => anim.key === 'iceElemental-walk-down');

			expect(idleAnim?.frameRate).toBe(2);
			expect(walkAnim?.frameRate).toBe(4);
		});

		it('should use ogre atlas as placeholder', () => {
			IceElemental.forEach((anim) => {
				expect(anim.atlas).toBe('ogre');
			});
		});
	});

	describe('IceElementalConfig', () => {
		it('should have unique ID', () => {
			expect(IceElementalConfig.id).toBe(11);
		});

		it('should have correct name', () => {
			expect(IceElementalConfig.name).toBe('Ice Elemental');
		});

		it('should have elite tier stats', () => {
			expect(IceElementalConfig.baseHealth).toBe(35);
			expect(IceElementalConfig.atack).toBe(14); // High magic damage
			expect(IceElementalConfig.defense).toBe(2); // Low physical defense
		});

		it('should be slow (ranged preference)', () => {
			expect(IceElementalConfig.speed).toBe(20);
		});

		it('should give good experience', () => {
			expect(IceElementalConfig.exp).toBe(90);
		});
	});
});

describe('Yeti', () => {
	describe('Yeti animations', () => {
		it('should have animations for all directions', () => {
			const directions = ['down', 'right', 'up'];
			const actions = ['idle', 'walk', 'atk'];

			directions.forEach((direction) => {
				actions.forEach((action) => {
					const animKey = `yeti-${action}-${direction}`;
					const hasAnimation = Yeti.some((anim) => anim.key === animKey);
					expect(hasAnimation).toBe(true);
				});
			});
		});

		it('should have very slow animations (lumbering)', () => {
			const idleAnim = Yeti.find((anim) => anim.key === 'yeti-idle-down');
			const walkAnim = Yeti.find((anim) => anim.key === 'yeti-walk-down');

			expect(idleAnim?.frameRate).toBe(1);
			expect(walkAnim?.frameRate).toBe(3);
		});
	});

	describe('YetiConfig', () => {
		it('should have unique ID', () => {
			expect(YetiConfig.id).toBe(12);
		});

		it('should have correct name', () => {
			expect(YetiConfig.name).toBe('Yeti');
		});

		it('should have miniboss tier stats', () => {
			expect(YetiConfig.baseHealth).toBe(70); // High HP tank
			expect(YetiConfig.atack).toBe(20); // Devastating melee
			expect(YetiConfig.defense).toBe(8); // Tough hide
		});

		it('should be very slow', () => {
			expect(YetiConfig.speed).toBe(15);
		});

		it('should give high experience (miniboss)', () => {
			expect(YetiConfig.exp).toBe(180);
		});

		it('should drop valuable items', () => {
			expect(YetiConfig.drops.length).toBeGreaterThanOrEqual(4);
		});
	});
});

describe('Frost Giant', () => {
	describe('FrostGiant animations', () => {
		it('should have animations for all directions', () => {
			const directions = ['down', 'right', 'up'];
			const actions = ['idle', 'walk', 'atk'];

			directions.forEach((direction) => {
				actions.forEach((action) => {
					const animKey = `frostGiant-${action}-${direction}`;
					const hasAnimation = FrostGiant.some((anim) => anim.key === animKey);
					expect(hasAnimation).toBe(true);
				});
			});
		});

		it('should have very slow animations (massive creature)', () => {
			const idleAnim = FrostGiant.find((anim) => anim.key === 'frostGiant-idle-down');
			const walkAnim = FrostGiant.find((anim) => anim.key === 'frostGiant-walk-down');
			const atkAnim = FrostGiant.find((anim) => anim.key === 'frostGiant-atk-down');

			expect(idleAnim?.frameRate).toBe(1);
			expect(walkAnim?.frameRate).toBe(2);
			expect(atkAnim?.frameRate).toBe(3);
		});
	});

	describe('FrostGiantConfig', () => {
		it('should have unique ID', () => {
			expect(FrostGiantConfig.id).toBe(13);
		});

		it('should have correct name', () => {
			expect(FrostGiantConfig.name).toBe('Frost Giant');
		});

		it('should have boss tier stats', () => {
			expect(FrostGiantConfig.baseHealth).toBe(180); // Boss HP
			expect(FrostGiantConfig.atack).toBe(35); // Devastating damage
			expect(FrostGiantConfig.defense).toBe(12); // High defense
		});

		it('should be very slow (massive)', () => {
			expect(FrostGiantConfig.speed).toBe(12);
		});

		it('should give boss-level experience', () => {
			expect(FrostGiantConfig.exp).toBe(500);
		});

		it('should have guaranteed drops', () => {
			// Boss should have multiple drops
			expect(FrostGiantConfig.drops.length).toBeGreaterThanOrEqual(5);

			// Should have 100% drop chance items
			const guaranteedDrops = FrostGiantConfig.drops.filter((drop) => drop.chance === 100);
			expect(guaranteedDrops.length).toBeGreaterThan(0);
		});
	});
});

describe('Enemy IDs', () => {
	it('should have unique IDs across all frost enemies', () => {
		const ids = [FrostSpiderConfig.id, IceElementalConfig.id, YetiConfig.id, FrostGiantConfig.id];

		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(ids.length);
	});

	it('should have sequential IDs starting from 10', () => {
		expect(FrostSpiderConfig.id).toBe(10);
		expect(IceElementalConfig.id).toBe(11);
		expect(YetiConfig.id).toBe(12);
		expect(FrostGiantConfig.id).toBe(13);
	});
});

describe('Enemy difficulty progression', () => {
	it('should have increasing health from spider to giant', () => {
		expect(FrostSpiderConfig.baseHealth).toBeLessThan(IceElementalConfig.baseHealth);
		expect(IceElementalConfig.baseHealth).toBeLessThan(YetiConfig.baseHealth);
		expect(YetiConfig.baseHealth).toBeLessThan(FrostGiantConfig.baseHealth);
	});

	it('should have increasing attack from spider to giant', () => {
		expect(FrostSpiderConfig.atack).toBeLessThan(YetiConfig.atack);
		expect(YetiConfig.atack).toBeLessThan(FrostGiantConfig.atack);
	});

	it('should have increasing experience rewards', () => {
		expect(FrostSpiderConfig.exp).toBeLessThan(IceElementalConfig.exp);
		expect(IceElementalConfig.exp).toBeLessThan(YetiConfig.exp);
		expect(YetiConfig.exp).toBeLessThan(FrostGiantConfig.exp);
	});
});
