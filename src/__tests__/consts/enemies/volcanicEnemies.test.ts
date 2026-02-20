/**
 * Tests for Volcanic Dungeons fire enemy configurations
 *
 * Tests the Fire Imp, Lava Golem, Fire Drake, Magma Worm, and Fire Dragon
 * enemy configurations for the Volcanic Dungeons biome.
 */

import { FireImp, FireImpConfig } from '../../../consts/enemies/fireImp';
import { LavaGolem, LavaGolemConfig } from '../../../consts/enemies/lavaGolem';
import { FireDrake, FireDrakeConfig } from '../../../consts/enemies/fireDrake';
import { MagmaWorm, MagmaWormConfig } from '../../../consts/enemies/magmaWorm';
import { FireDragon, FireDragonConfig } from '../../../consts/enemies/fireDragon';

describe('Fire Imp', () => {
	describe('FireImp animations', () => {
		it('should have animations for all directions', () => {
			const directions = ['down', 'right', 'up'];
			const actions = ['idle', 'walk', 'atk'];

			directions.forEach((direction) => {
				actions.forEach((action) => {
					const animKey = `fireImp-${action}-${direction}`;
					const hasAnimation = FireImp.some((anim) => anim.key === animKey);
					expect(hasAnimation).toBe(true);
				});
			});
		});

		it('should have fast frame rates', () => {
			const idleAnim = FireImp.find((anim) => anim.key === 'fireImp-idle-down');
			const walkAnim = FireImp.find((anim) => anim.key === 'fireImp-walk-down');
			const atkAnim = FireImp.find((anim) => anim.key === 'fireImp-atk-down');

			expect(idleAnim?.frameRate).toBe(4);
			expect(walkAnim?.frameRate).toBe(8);
			expect(atkAnim?.frameRate).toBe(7);
		});

		it('should use bat atlas as placeholder', () => {
			FireImp.forEach((anim) => {
				expect(anim.atlas).toBe('bat');
			});
		});
	});

	describe('FireImpConfig', () => {
		it('should have unique ID', () => {
			expect(FireImpConfig.id).toBe(14);
		});

		it('should have correct name', () => {
			expect(FireImpConfig.name).toBe('Fire Imp');
		});

		it('should have minion tier stats', () => {
			expect(FireImpConfig.baseHealth).toBe(20);
			expect(FireImpConfig.atack).toBe(12);
			expect(FireImpConfig.defense).toBe(2);
		});

		it('should be very fast', () => {
			expect(FireImpConfig.speed).toBe(45);
		});

		it('should have drops configured', () => {
			expect(FireImpConfig.drops.length).toBeGreaterThan(0);
		});
	});
});

describe('Lava Golem', () => {
	describe('LavaGolem animations', () => {
		it('should have animations for all directions', () => {
			const directions = ['down', 'right', 'up'];
			const actions = ['idle', 'walk', 'atk'];

			directions.forEach((direction) => {
				actions.forEach((action) => {
					const animKey = `lavaGolem-${action}-${direction}`;
					const hasAnimation = LavaGolem.some((anim) => anim.key === animKey);
					expect(hasAnimation).toBe(true);
				});
			});
		});

		it('should have very slow animations (lumbering)', () => {
			const idleAnim = LavaGolem.find((anim) => anim.key === 'lavaGolem-idle-down');
			const walkAnim = LavaGolem.find((anim) => anim.key === 'lavaGolem-walk-down');

			expect(idleAnim?.frameRate).toBe(1);
			expect(walkAnim?.frameRate).toBe(2);
		});

		it('should use ogre atlas as placeholder', () => {
			LavaGolem.forEach((anim) => {
				expect(anim.atlas).toBe('ogre');
			});
		});
	});

	describe('LavaGolemConfig', () => {
		it('should have unique ID', () => {
			expect(LavaGolemConfig.id).toBe(15);
		});

		it('should have correct name', () => {
			expect(LavaGolemConfig.name).toBe('Lava Golem');
		});

		it('should have elite tier with very high defense', () => {
			expect(LavaGolemConfig.baseHealth).toBe(80);
			expect(LavaGolemConfig.atack).toBe(16);
			expect(LavaGolemConfig.defense).toBe(15); // Highest defense
		});

		it('should be very slow', () => {
			expect(LavaGolemConfig.speed).toBe(12);
		});

		it('should rarely flee', () => {
			expect(LavaGolemConfig.flee).toBe(1);
		});
	});
});

describe('Fire Drake', () => {
	describe('FireDrake animations', () => {
		it('should have animations for all directions', () => {
			const directions = ['down', 'right', 'up'];
			const actions = ['idle', 'walk', 'atk'];

			directions.forEach((direction) => {
				actions.forEach((action) => {
					const animKey = `fireDrake-${action}-${direction}`;
					const hasAnimation = FireDrake.some((anim) => anim.key === animKey);
					expect(hasAnimation).toBe(true);
				});
			});
		});

		it('should have moderate frame rates', () => {
			const idleAnim = FireDrake.find((anim) => anim.key === 'fireDrake-idle-down');
			const walkAnim = FireDrake.find((anim) => anim.key === 'fireDrake-walk-down');

			expect(idleAnim?.frameRate).toBe(3);
			expect(walkAnim?.frameRate).toBe(6);
		});
	});

	describe('FireDrakeConfig', () => {
		it('should have unique ID', () => {
			expect(FireDrakeConfig.id).toBe(16);
		});

		it('should have correct name', () => {
			expect(FireDrakeConfig.name).toBe('Fire Drake');
		});

		it('should have balanced stats (flying hunter)', () => {
			expect(FireDrakeConfig.baseHealth).toBe(45);
			expect(FireDrakeConfig.atack).toBe(18); // High dive damage
			expect(FireDrakeConfig.defense).toBe(6);
		});

		it('should be fast (flying)', () => {
			expect(FireDrakeConfig.speed).toBe(38);
		});

		it('should have high hit chance', () => {
			expect(FireDrakeConfig.hit).toBe(10);
		});
	});
});

describe('Magma Worm', () => {
	describe('MagmaWorm animations', () => {
		it('should have animations for all directions', () => {
			const directions = ['down', 'right', 'up'];
			const actions = ['idle', 'walk', 'atk'];

			directions.forEach((direction) => {
				actions.forEach((action) => {
					const animKey = `magmaWorm-${action}-${direction}`;
					const hasAnimation = MagmaWorm.some((anim) => anim.key === animKey);
					expect(hasAnimation).toBe(true);
				});
			});
		});
	});

	describe('MagmaWormConfig', () => {
		it('should have unique ID', () => {
			expect(MagmaWormConfig.id).toBe(17);
		});

		it('should have correct name', () => {
			expect(MagmaWormConfig.name).toBe('Magma Worm');
		});

		it('should have miniboss tier stats', () => {
			expect(MagmaWormConfig.baseHealth).toBe(90);
			expect(MagmaWormConfig.atack).toBe(22);
			expect(MagmaWormConfig.defense).toBe(8);
		});

		it('should have moderate speed', () => {
			expect(MagmaWormConfig.speed).toBe(25);
		});

		it('should give high experience (miniboss)', () => {
			expect(MagmaWormConfig.exp).toBe(200);
		});

		it('should have guaranteed molten core drop', () => {
			const moltenCoreDrop = MagmaWormConfig.drops.find((drop) => drop.chance === 100);
			expect(moltenCoreDrop).toBeDefined();
		});
	});
});

describe('Fire Dragon', () => {
	describe('FireDragon animations', () => {
		it('should have animations for all directions', () => {
			const directions = ['down', 'right', 'up'];
			const actions = ['idle', 'walk', 'atk'];

			directions.forEach((direction) => {
				actions.forEach((action) => {
					const animKey = `fireDragon-${action}-${direction}`;
					const hasAnimation = FireDragon.some((anim) => anim.key === animKey);
					expect(hasAnimation).toBe(true);
				});
			});
		});

		it('should have slow animations (massive creature)', () => {
			const idleAnim = FireDragon.find((anim) => anim.key === 'fireDragon-idle-down');
			const walkAnim = FireDragon.find((anim) => anim.key === 'fireDragon-walk-down');
			const atkAnim = FireDragon.find((anim) => anim.key === 'fireDragon-atk-down');

			expect(idleAnim?.frameRate).toBe(1);
			expect(walkAnim?.frameRate).toBe(2);
			expect(atkAnim?.frameRate).toBe(4);
		});
	});

	describe('FireDragonConfig', () => {
		it('should have unique ID', () => {
			expect(FireDragonConfig.id).toBe(18);
		});

		it('should have correct name', () => {
			expect(FireDragonConfig.name).toBe('Fire Dragon');
		});

		it('should have boss tier stats', () => {
			expect(FireDragonConfig.baseHealth).toBe(250); // Highest HP
			expect(FireDragonConfig.atack).toBe(42); // Devastating damage
			expect(FireDragonConfig.defense).toBe(14); // High defense
		});

		it('should be moderately fast despite size', () => {
			expect(FireDragonConfig.speed).toBe(18);
		});

		it('should give boss-level experience', () => {
			expect(FireDragonConfig.exp).toBe(750);
		});

		it('should have multiple guaranteed drops', () => {
			const guaranteedDrops = FireDragonConfig.drops.filter((drop) => drop.chance === 100);
			expect(guaranteedDrops.length).toBeGreaterThanOrEqual(3);
		});
	});
});

describe('Enemy IDs', () => {
	it('should have unique IDs across all volcanic enemies', () => {
		const ids = [FireImpConfig.id, LavaGolemConfig.id, FireDrakeConfig.id, MagmaWormConfig.id, FireDragonConfig.id];

		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(ids.length);
	});

	it('should have sequential IDs starting from 14', () => {
		expect(FireImpConfig.id).toBe(14);
		expect(LavaGolemConfig.id).toBe(15);
		expect(FireDrakeConfig.id).toBe(16);
		expect(MagmaWormConfig.id).toBe(17);
		expect(FireDragonConfig.id).toBe(18);
	});
});

describe('Enemy difficulty progression', () => {
	it('should have increasing health toward boss', () => {
		expect(FireImpConfig.baseHealth).toBeLessThan(FireDrakeConfig.baseHealth);
		expect(FireDrakeConfig.baseHealth).toBeLessThan(LavaGolemConfig.baseHealth);
		expect(LavaGolemConfig.baseHealth).toBeLessThan(MagmaWormConfig.baseHealth);
		expect(MagmaWormConfig.baseHealth).toBeLessThan(FireDragonConfig.baseHealth);
	});

	it('should have increasing experience rewards', () => {
		expect(FireImpConfig.exp).toBeLessThan(FireDrakeConfig.exp);
		expect(FireDrakeConfig.exp).toBeLessThan(LavaGolemConfig.exp);
		expect(LavaGolemConfig.exp).toBeLessThan(MagmaWormConfig.exp);
		expect(MagmaWormConfig.exp).toBeLessThan(FireDragonConfig.exp);
	});

	it('should have Fire Dragon with highest attack', () => {
		const allAttacks = [
			FireImpConfig.atack,
			LavaGolemConfig.atack,
			FireDrakeConfig.atack,
			MagmaWormConfig.atack,
			FireDragonConfig.atack,
		];
		const maxAttack = Math.max(...allAttacks);
		expect(FireDragonConfig.atack).toBe(maxAttack);
	});
});

describe('Speed vs Defense tradeoff', () => {
	it('should have Fire Imp as fastest but weakest defense', () => {
		const allSpeeds = [
			FireImpConfig.speed,
			LavaGolemConfig.speed,
			FireDrakeConfig.speed,
			MagmaWormConfig.speed,
			FireDragonConfig.speed,
		];
		const maxSpeed = Math.max(...allSpeeds);
		expect(FireImpConfig.speed).toBe(maxSpeed);
		expect(FireImpConfig.defense).toBe(2); // Lowest
	});

	it('should have Lava Golem as slowest but highest defense', () => {
		const allSpeeds = [
			FireImpConfig.speed,
			LavaGolemConfig.speed,
			FireDrakeConfig.speed,
			MagmaWormConfig.speed,
			FireDragonConfig.speed,
		];
		const minSpeed = Math.min(...allSpeeds);
		expect(LavaGolemConfig.speed).toBe(minSpeed);
		expect(LavaGolemConfig.defense).toBe(15); // Highest non-boss
	});
});
