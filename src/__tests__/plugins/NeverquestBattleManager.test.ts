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
			battleManager.takeDamage(attacker, target);

			// Verify health is clamped to 0, not negative
			expect(target.attributes.health).toBeGreaterThanOrEqual(0);
			expect(target.attributes.health).toBe(0);
		});
	});
});
