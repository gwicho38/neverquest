/**
 * Integration tests for player attack state management
 * These tests verify that canAtack is properly initialized and maintained
 * throughout the player lifecycle and various game interactions.
 */

import Phaser from 'phaser';
import { Player } from '../../entities/Player';
import { NeverquestBattleManager } from '../../plugins/NeverquestBattleManager';

describe('Player Attack State Integration Tests', () => {
	let scene: Phaser.Scene;
	let player: Player;

	beforeEach(() => {
		// Create a minimal Phaser scene for testing
		const config = {
			type: Phaser.HEADLESS,
			scene: {
				create(this: Phaser.Scene) {
					// Store reference to scene
					// eslint-disable-next-line @typescript-eslint/no-this-alias
					const currentScene = this;
					scene = currentScene;
				},
			},
			physics: {
				default: 'arcade',
			},
		};

		const game = new Phaser.Game(config);
		scene = game.scene.scenes[0];

		// Wait for scene to be ready
		return new Promise<void>((resolve) => {
			scene.events.once('create', () => {
				player = new Player(scene, 100, 100, 'character');
				scene.add.existing(player);
				scene.physics.add.existing(player);
				resolve();
			});
		});
	});

	afterEach(() => {
		if (scene?.game) {
			scene.game.destroy(true);
		}
	});

	describe('Player Initialization', () => {
		test('canAtack should be true after player creation', () => {
			expect(player.canAtack).toBe(true);
		});

		test('canMove should be true after player creation', () => {
			expect(player.canMove).toBe(true);
		});

		test('canBlock should be true after player creation', () => {
			expect(player.canBlock).toBe(true);
		});

		test('isAtacking should be false after player creation', () => {
			expect(player.isAtacking).toBe(false);
		});
	});

	describe('Attack State Transitions', () => {
		test('canAtack should be set to false when attack starts', () => {
			const battleManager = new NeverquestBattleManager();
			player.canAtack = true;
			player.canMove = true;

			// Simulate attack
			battleManager.atack(player);

			expect(player.canAtack).toBe(false);
			expect(player.isAtacking).toBe(true);
		});

		test('canAtack should be restored after attack animation completes', (done) => {
			const battleManager = new NeverquestBattleManager();
			player.canAtack = true;
			player.canMove = true;

			// Start attack
			battleManager.atack(player);
			expect(player.canAtack).toBe(false);

			// Wait for timeout fallback (2600ms) + buffer
			setTimeout(() => {
				expect(player.canAtack).toBe(true);
				expect(player.isAtacking).toBe(false);
				done();
			}, 2800);
		}, 10000);

		test('canAtack should remain true during movement', () => {
			player.canAtack = true;

			// Simulate movement
			if (player.container?.body) {
				(player.container.body as Phaser.Physics.Arcade.Body).setVelocity(100, 0);
			}

			// canAtack should not be affected by movement
			expect(player.canAtack).toBe(true);
		});
	});

	describe('Block State Interactions', () => {
		test('blocking should disable canAtack', () => {
			const battleManager = new NeverquestBattleManager();
			player.canBlock = true;
			player.canMove = true;
			player.canAtack = true;

			battleManager.block(player);

			expect(player.canAtack).toBe(false);
			expect(player.isBlocking).toBe(true);
		});

		test('stopping block should restore canAtack', () => {
			const battleManager = new NeverquestBattleManager();
			player.isBlocking = true;
			player.canBlock = true;
			player.canAtack = false;

			battleManager.stopBlock(player);

			expect(player.canAtack).toBe(true);
			expect(player.isBlocking).toBe(false);
		});
	});

	describe('State Persistence', () => {
		test('canAtack should not be affected by running toggle', () => {
			player.canAtack = true;
			player.isRunning = false;

			// Toggle running
			player.isRunning = true;
			player.speed = player.runSpeed;

			expect(player.canAtack).toBe(true);

			// Toggle back
			player.isRunning = false;
			player.speed = player.baseSpeed;

			expect(player.canAtack).toBe(true);
		});

		test('canAtack should not be affected by swimming', () => {
			player.canAtack = true;
			player.isSwimming = false;

			// Enter swimming
			player.isSwimming = true;
			player.speed = player.swimSpeed;

			expect(player.canAtack).toBe(true);

			// Exit swimming
			player.isSwimming = false;
			player.speed = player.baseSpeed;

			expect(player.canAtack).toBe(true);
		});
	});

	describe('Race Condition Prevention', () => {
		test('multiple rapid attacks should not leave canAtack stuck false', (done) => {
			const battleManager = new NeverquestBattleManager();
			player.canAtack = true;
			player.canMove = true;

			// First attack
			battleManager.atack(player);
			expect(player.canAtack).toBe(false);

			// Wait for completion (2600ms fallback + buffer)
			setTimeout(() => {
				expect(player.canAtack).toBe(true);

				// Second attack
				battleManager.atack(player);
				expect(player.canAtack).toBe(false);

				// Wait for completion (2600ms fallback + buffer)
				setTimeout(() => {
					expect(player.canAtack).toBe(true);
					done();
				}, 2800);
			}, 2800);
		}, 10000);
	});
});
