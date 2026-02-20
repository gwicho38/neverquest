import { NeverquestBattleManager } from '../../plugins/NeverquestBattleManager';
import { NumericColors } from '../../consts/Colors';

describe('NeverquestBattleManager', () => {
	let battleManager: NeverquestBattleManager;
	let mockEntity: any;

	beforeEach(() => {
		battleManager = new NeverquestBattleManager();

		// Create a mock entity with all required properties
		mockEntity = {
			id: 'test-entity-1',
			canAtack: true,
			isAtacking: false,
			canMove: true,
			isBlocking: false,
			canBlock: true,
			showHitBox: false,
			isSwimming: false,
			speed: 200,
			baseSpeed: 200,
			container: {
				body: {
					setVelocity: jest.fn(),
				},
			},
			anims: {
				play: jest.fn(),
				stop: jest.fn(),
				currentAnim: { key: 'player-walk_down' },
				exists: jest.fn(() => true),
			},
			texture: { key: 'player' },
			scene: {
				plugins: {},
				scene: { key: 'TestScene' },
				events: {
					on: jest.fn(),
				},
			},
			attributes: {
				atack: 10,
				defense: 5,
				critical: 10,
				hit: 100,
				flee: 0,
				health: 100,
			},
			setTint: jest.fn(),
			clearTint: jest.fn(),
			takeDamage: jest.fn(),
			once: jest.fn(),
			on: jest.fn(),
		};
	});

	describe('atack', () => {
		it('should initiate attack when entity can attack', () => {
			battleManager.atack(mockEntity);
			expect(mockEntity.isAtacking).toBe(true);
			// Note: attack method sets canAtack to false, not canMove
			expect(mockEntity.canAtack).toBe(false);
		});

		it('should not attack if entity cannot attack', () => {
			mockEntity.canAtack = false;
			battleManager.atack(mockEntity);
			expect(mockEntity.isAtacking).toBe(false);
			expect(mockEntity.canMove).toBe(true);
		});

		it('should not attack if already attacking', () => {
			mockEntity.isAtacking = true;
			mockEntity.canMove = false;
			battleManager.atack(mockEntity);
			// Should remain in attacking state
			expect(mockEntity.isAtacking).toBe(true);
			expect(mockEntity.canMove).toBe(false);
		});

		it('should not attack while blocking', () => {
			// When blocking, canMove is set to false by the block() method
			mockEntity.isBlocking = true;
			mockEntity.canMove = false;
			battleManager.atack(mockEntity);
			expect(mockEntity.isAtacking).toBe(false);
		});

		it('should not attack while swimming', () => {
			// Note: isSwimming is checked by the keyboard controller, not the battle manager
			// The battle manager only checks canAtack && canMove
			// For this test, we simulate swimming by disabling canMove
			mockEntity.isSwimming = true;
			mockEntity.canMove = false;
			battleManager.atack(mockEntity);
			expect(mockEntity.isAtacking).toBe(false);
		});
	});

	describe('block', () => {
		it('should initiate blocking when entity can block', () => {
			battleManager.block(mockEntity);
			expect(mockEntity.isBlocking).toBe(true);
			expect(mockEntity.canMove).toBe(false);
			expect(mockEntity.canAtack).toBe(false);
			expect(mockEntity.setTint).toHaveBeenCalledWith(NumericColors.GRAY_LIGHT);
		});

		it('should not block if entity cannot block', () => {
			mockEntity.canBlock = false;
			battleManager.block(mockEntity);
			expect(mockEntity.isBlocking).toBe(false);
			expect(mockEntity.canMove).toBe(true);
			expect(mockEntity.setTint).not.toHaveBeenCalled();
		});

		it('should not block if already blocking', () => {
			// When already blocking, canMove should be false (which is set by block())
			mockEntity.isBlocking = true;
			mockEntity.canMove = false;
			const setTintCalls = mockEntity.setTint.mock.calls.length;
			battleManager.block(mockEntity);
			// Should not call setTint again since canMove is false
			expect(mockEntity.setTint.mock.calls.length).toBe(setTintCalls);
		});

		it('should not block while attacking', () => {
			mockEntity.isAtacking = true;
			battleManager.block(mockEntity);
			expect(mockEntity.isBlocking).toBe(false);
		});
	});

	describe('stopBlock', () => {
		it('should stop blocking and restore entity state', () => {
			// First start blocking
			battleManager.block(mockEntity);
			expect(mockEntity.isBlocking).toBe(true);

			// Then stop
			battleManager.stopBlock(mockEntity);
			expect(mockEntity.isBlocking).toBe(false);
			expect(mockEntity.canMove).toBe(true);
			expect(mockEntity.canAtack).toBe(true);
			expect(mockEntity.clearTint).toHaveBeenCalled();
		});

		it('should handle stopping when not blocking', () => {
			mockEntity.isBlocking = false;
			battleManager.stopBlock(mockEntity);
			expect(mockEntity.isBlocking).toBe(false);
			expect(mockEntity.clearTint).not.toHaveBeenCalled();
		});
	});

	describe('takeDamage', () => {
		let mockTarget: any;
		let mockAttacker: any;

		beforeEach(() => {
			// Mock phaserJuice
			(battleManager as any).phaserJuice = {
				add: jest.fn().mockReturnValue({
					flash: jest.fn(),
				}),
			};

			mockAttacker = {
				attributes: {
					atack: 10,
					critical: 10,
					hit: 100,
				},
				scene: {
					sound: {
						add: jest.fn().mockReturnValue({
							play: jest.fn(),
						}),
					},
					scene: {
						get: jest.fn().mockReturnValue(null),
						isActive: jest.fn().mockReturnValue(true),
						key: 'TestScene',
					},
					add: {
						text: jest.fn().mockReturnValue({
							setOrigin: jest.fn().mockReturnThis(),
							setScrollFactor: jest.fn().mockReturnThis(),
							setDepth: jest.fn().mockReturnThis(),
							setScale: jest.fn().mockReturnThis(),
							destroy: jest.fn(),
						}),
						sprite: jest.fn().mockReturnValue({
							setOrigin: jest.fn().mockReturnThis(),
							setDepth: jest.fn().mockReturnThis(),
							setScale: jest.fn().mockReturnThis(),
							destroy: jest.fn(),
							x: 0,
							y: 0,
						}),
						tween: jest.fn(),
					},
					tweens: {
						add: jest.fn(),
					},
				},
				entityName: 'Player',
			};

			mockTarget = {
				attributes: {
					defense: 3,
					flee: 5,
					health: 50,
				},
				healthBar: {
					decrease: jest.fn(),
				},
				neverquestHUDProgressBar: null,
				entityName: 'Enemy',
				container: {
					x: 100,
					y: 100,
				},
				anims: {
					stop: jest.fn(),
				},
				destroyAll: jest.fn(),
				scene: mockAttacker.scene,
			};
		});

		it('should apply damage to entity', () => {
			battleManager.takeDamage(mockAttacker, mockTarget);
			// Should calculate and apply damage based on attack vs defense
			expect(mockTarget.healthBar.decrease).toHaveBeenCalled();
		});

		it('should reduce damage while blocking', () => {
			mockTarget.isBlocking = true;
			const initialHealth = mockTarget.attributes.health;
			battleManager.takeDamage(mockAttacker, mockTarget);
			// Should apply reduced damage while blocking
			expect(mockTarget.attributes.health).toBeLessThan(initialHealth);
		});

		it('should clamp health to minimum of 0 and prevent negative health', () => {
			// Create entities with full attribute structure for integration test
			const attacker = {
				attributes: {
					atack: 100,
					critical: 10,
					hit: 100,
				},
				scene: {
					sound: {
						add: jest.fn().mockReturnValue({
							play: jest.fn(),
						}),
					},
					scene: {
						get: jest.fn().mockReturnValue(null),
						isActive: jest.fn().mockReturnValue(true),
						key: 'TestScene',
					},
					add: {
						text: jest.fn().mockReturnValue({
							setOrigin: jest.fn().mockReturnThis(),
							setScrollFactor: jest.fn().mockReturnThis(),
							setDepth: jest.fn().mockReturnThis(),
							setScale: jest.fn().mockReturnThis(),
							destroy: jest.fn(),
						}),
						sprite: jest.fn().mockReturnValue({
							setOrigin: jest.fn().mockReturnThis(),
							setDepth: jest.fn().mockReturnThis(),
							setScale: jest.fn().mockReturnThis(),
							destroy: jest.fn(),
							x: 0,
							y: 0,
						}),
						tween: jest.fn(),
					},
					tweens: {
						add: jest.fn(),
					},
				},
				entityName: 'Player',
			};

			const target = {
				attributes: {
					health: 5, // Low health that will go negative without clamping
					defense: 0,
					flee: 0,
				},
				healthBar: {
					decrease: jest.fn(),
				},
				neverquestHUDProgressBar: null as any,
				entityName: 'Enemy',
				anims: {
					stop: jest.fn(),
				},
				destroyAll: jest.fn(),
				scene: attacker.scene,
				container: {
					x: 100,
					y: 100,
				},
			};

			// Mock PhaserJuice to prevent errors
			(battleManager as any).phaserJuice = {
				add: jest.fn().mockReturnValue({
					flash: jest.fn(),
				}),
			};

			// Call takeDamage with damage that would make health negative
			// Cast mocks through unknown to satisfy ICombatEntity interface
			battleManager.takeDamage(
				attacker as unknown as Parameters<typeof battleManager.takeDamage>[0],
				target as unknown as Parameters<typeof battleManager.takeDamage>[1]
			);

			// Verify health is clamped to 0, not negative
			expect(target.attributes.health).toBeGreaterThanOrEqual(0);
			expect(target.attributes.health).toBe(0);
		});
	});

	describe('randomDamage', () => {
		it('should return a number', () => {
			const damage = battleManager.randomDamage(10);
			expect(typeof damage).toBe('number');
		});

		it('should return damage within variation range (±10%)', () => {
			const baseDamage = 100;
			const variation = battleManager.variation; // 10%

			// Run multiple times to test randomness
			for (let i = 0; i < 100; i++) {
				const damage = battleManager.randomDamage(baseDamage);
				const minDamage = Math.floor(baseDamage - baseDamage * (variation / 100));
				const maxDamage = Math.floor(baseDamage + baseDamage * (variation / 100));

				expect(damage).toBeGreaterThanOrEqual(minDamage);
				expect(damage).toBeLessThanOrEqual(maxDamage);
			}
		});

		it('should floor the result to an integer', () => {
			const damage = battleManager.randomDamage(15);
			expect(Number.isInteger(damage)).toBe(true);
		});

		it('should handle zero damage', () => {
			const damage = battleManager.randomDamage(0);
			expect(damage).toBe(0);
		});

		it('should handle negative base damage', () => {
			const damage = battleManager.randomDamage(-10);
			// Negative damage can occur when defense > attack
			// The variation should still be applied
			expect(typeof damage).toBe('number');
		});

		it('should produce different values (not always the same)', () => {
			const damages = new Set<number>();
			for (let i = 0; i < 50; i++) {
				damages.add(battleManager.randomDamage(100));
			}
			// With 10% variation on 100, we expect some variety
			expect(damages.size).toBeGreaterThan(1);
		});
	});

	describe('checkAtackHit', () => {
		it('should return true when hit is much higher than flee', () => {
			// With 100 hit and 0 flee, should always hit
			let hitCount = 0;
			for (let i = 0; i < 100; i++) {
				if (battleManager.checkAtackHit(100, 0)) {
					hitCount++;
				}
			}
			expect(hitCount).toBe(100);
		});

		it('should return true when flee is 0 (division by zero protection)', () => {
			const result = battleManager.checkAtackHit(50, 0);
			// When flee is 0, (hit * 100) / flee is Infinity, which is not finite
			// So it should return true
			expect(result).toBe(true);
		});

		it('should return boolean', () => {
			const result = battleManager.checkAtackHit(50, 25);
			expect(typeof result).toBe('boolean');
		});

		it('should have lower hit chance with higher flee', () => {
			// Compare hit rates at different flee values
			// Formula: (hit * 100) / flee >= random
			// With hit=50, flee=100: (50*100)/100 = 50, so ~50% hit rate
			// With hit=50, flee=200: (50*100)/200 = 25, so ~25% hit rate
			let hitCountLowFlee = 0;
			let hitCountHighFlee = 0;

			for (let i = 0; i < 1000; i++) {
				if (battleManager.checkAtackHit(50, 100)) hitCountLowFlee++;
				if (battleManager.checkAtackHit(50, 200)) hitCountHighFlee++;
			}

			// Higher flee should result in fewer hits
			expect(hitCountLowFlee).toBeGreaterThan(hitCountHighFlee);
		});

		it('should handle equal hit and flee', () => {
			// With equal values, hit rate should be around 100%
			let hitCount = 0;
			for (let i = 0; i < 100; i++) {
				if (battleManager.checkAtackHit(50, 50)) hitCount++;
			}
			// (50 * 100) / 50 = 100, so should hit most of the time
			expect(hitCount).toBeGreaterThan(80);
		});

		it('should miss sometimes when flee is higher than hit', () => {
			// With flee higher than hit, should miss more often
			let missCount = 0;
			for (let i = 0; i < 100; i++) {
				if (!battleManager.checkAtackHit(20, 80)) missCount++;
			}
			// (20 * 100) / 80 = 25, so should miss often
			expect(missCount).toBeGreaterThan(50);
		});
	});

	describe('checkAtackIsCritial', () => {
		it('should return boolean', () => {
			const result = battleManager.checkAtackIsCritial(10);
			expect(typeof result).toBe('boolean');
		});

		it('should always crit with 100% crit chance', () => {
			let critCount = 0;
			for (let i = 0; i < 100; i++) {
				if (battleManager.checkAtackIsCritial(100)) critCount++;
			}
			expect(critCount).toBe(100);
		});

		it('should never crit with 0% crit chance', () => {
			let critCount = 0;
			for (let i = 0; i < 100; i++) {
				if (battleManager.checkAtackIsCritial(0)) critCount++;
			}
			expect(critCount).toBe(0);
		});

		it('should crit approximately 10% of the time with 10% chance', () => {
			let critCount = 0;
			const trials = 1000;
			for (let i = 0; i < trials; i++) {
				if (battleManager.checkAtackIsCritial(10)) critCount++;
			}
			// Allow for some variance: expect between 5% and 15%
			const critRate = critCount / trials;
			expect(critRate).toBeGreaterThan(0.05);
			expect(critRate).toBeLessThan(0.15);
		});

		it('should crit approximately 50% of the time with 50% chance', () => {
			let critCount = 0;
			const trials = 1000;
			for (let i = 0; i < trials; i++) {
				if (battleManager.checkAtackIsCritial(50)) critCount++;
			}
			// Allow for some variance: expect between 40% and 60%
			const critRate = critCount / trials;
			expect(critRate).toBeGreaterThan(0.4);
			expect(critRate).toBeLessThan(0.6);
		});
	});

	describe('constructor defaults', () => {
		it('should initialize with correct default values', () => {
			const manager = new NeverquestBattleManager();

			expect(manager.enemiesVariableName).toBe('enemies');
			expect(manager.playerVariableName).toBe('player');
			expect(manager.hitboxVelocity).toBe(10);
			expect(manager.variation).toBe(10);
			expect(manager.hitboxSpriteName).toBe('slash');
		});

		it('should have attack direction frame names', () => {
			const manager = new NeverquestBattleManager();

			expect(manager.atackDirectionFrameName).toEqual({
				up: 'up',
				right: 'right',
				down: 'down',
				left: 'left',
			});
		});

		it('should have attack sound animation names', () => {
			const manager = new NeverquestBattleManager();

			expect(manager.atackSoundAnimationNames).toEqual(['atack01', 'atack02', 'atack03']);
		});

		it('should have damage sound names', () => {
			const manager = new NeverquestBattleManager();

			expect(manager.damageSoundNames).toEqual(['damage01', 'damage02', 'damage03']);
		});

		it('should initialize neverquestEntityTextDisplay as null', () => {
			const manager = new NeverquestBattleManager();

			expect(manager.neverquestEntityTextDisplay).toBeNull();
		});

		it('should initialize phaserJuice as null', () => {
			const manager = new NeverquestBattleManager();

			expect(manager.phaserJuice).toBeNull();
		});
	});

	describe('damage calculation edge cases', () => {
		it('should handle very high attack values', () => {
			const damage = battleManager.randomDamage(10000);
			expect(damage).toBeGreaterThan(0);
			expect(damage).toBeLessThanOrEqual(11000); // max with +10% variation
		});

		it('should handle decimal damage values', () => {
			const damage = battleManager.randomDamage(15.7);
			// Should floor the result
			expect(Number.isInteger(damage)).toBe(true);
		});

		it('should handle very small positive damage', () => {
			const damage = battleManager.randomDamage(1);
			expect(damage).toBeGreaterThanOrEqual(0);
			expect(damage).toBeLessThanOrEqual(2);
		});
	});
});
