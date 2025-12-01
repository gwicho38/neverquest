import { NeverquestBattleManager } from '../../plugins/NeverquestBattleManager';
import { ENTITIES } from '../../consts/Entities';

describe('NeverquestBattleManager - Player Death', () => {
	let battleManager: NeverquestBattleManager;
	let mockPlayer: any;
	let mockScene: any;
	let mockPhaserJuice: any;

	beforeEach(() => {
		jest.clearAllMocks();
		jest.useFakeTimers();

		mockPhaserJuice = {
			add: jest.fn().mockReturnValue({
				flash: jest.fn(),
			}),
		};

		mockScene = {
			scene: {
				launch: jest.fn(),
				pause: jest.fn(),
				isActive: jest.fn().mockReturnValue(true),
				key: 'MainScene',
				get: jest.fn().mockReturnValue(null),
			},
			themeSound: {
				isPlaying: true,
				volume: 1,
			},
			tweens: {
				add: jest.fn(),
			},
		};

		mockPlayer = {
			entityName: ENTITIES.Player,
			canMove: true,
			canAtack: true,
			canBlock: true,
			anims: {
				stop: jest.fn(),
			},
			attributes: {
				level: 5,
				health: 0,
			},
			scene: mockScene,
		};

		battleManager = new NeverquestBattleManager();
		battleManager.phaserJuice = mockPhaserJuice;
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	describe('handlePlayerDeath', () => {
		it('should log player death', () => {
			const consoleSpy = jest.spyOn(console, 'log');

			battleManager.handlePlayerDeath(mockPlayer);

			expect(consoleSpy).toHaveBeenCalledWith('[BattleManager] Player died - triggering game over');
			consoleSpy.mockRestore();
		});

		it('should disable player controls', () => {
			battleManager.handlePlayerDeath(mockPlayer);

			expect(mockPlayer.canMove).toBe(false);
			expect(mockPlayer.canAtack).toBe(false);
			expect(mockPlayer.canBlock).toBe(false);
		});

		it('should stop player animations', () => {
			battleManager.handlePlayerDeath(mockPlayer);

			expect(mockPlayer.anims.stop).toHaveBeenCalled();
		});

		it('should fade out theme music', () => {
			battleManager.handlePlayerDeath(mockPlayer);

			expect(mockScene.tweens.add).toHaveBeenCalledWith(
				expect.objectContaining({
					targets: mockScene.themeSound,
					volume: 0,
					duration: 1000,
					ease: 'Power2',
				})
			);
		});

		it('should not fade music if not playing', () => {
			mockScene.themeSound.isPlaying = false;

			battleManager.handlePlayerDeath(mockPlayer);

			expect(mockScene.tweens.add).not.toHaveBeenCalled();
		});

		it('should handle missing theme sound gracefully', () => {
			mockScene.themeSound = null;

			expect(() => {
				battleManager.handlePlayerDeath(mockPlayer);
			}).not.toThrow();
		});

		it('should flash player with death animation', () => {
			battleManager.handlePlayerDeath(mockPlayer);

			expect(mockPhaserJuice.add).toHaveBeenCalledWith(mockPlayer);
			// flash() is called without arguments for compatibility with all sprite types
			expect(mockPhaserJuice.add(mockPlayer).flash).toHaveBeenCalled();
		});

		it('should launch GameOver scene after delay', () => {
			battleManager.handlePlayerDeath(mockPlayer);

			// Initially should not be called
			expect(mockScene.scene.launch).not.toHaveBeenCalled();

			// Fast-forward time by 1500ms
			jest.advanceTimersByTime(1500);

			expect(mockScene.scene.launch).toHaveBeenCalledWith('GameOverScene', {
				playerLevel: 5,
				lastScene: 'MainScene',
			});
		});

		it('should pause current scene after launching GameOver', () => {
			battleManager.handlePlayerDeath(mockPlayer);

			jest.advanceTimersByTime(1500);

			expect(mockScene.scene.pause).toHaveBeenCalled();
		});

		it('should pass correct player level to GameOver scene', () => {
			mockPlayer.attributes.level = 10;

			battleManager.handlePlayerDeath(mockPlayer);
			jest.advanceTimersByTime(1500);

			expect(mockScene.scene.launch).toHaveBeenCalledWith(
				'GameOverScene',
				expect.objectContaining({
					playerLevel: 10,
				})
			);
		});

		it('should pass current scene key to GameOver scene', () => {
			mockScene.scene.key = 'DungeonScene';

			battleManager.handlePlayerDeath(mockPlayer);
			jest.advanceTimersByTime(1500);

			expect(mockScene.scene.launch).toHaveBeenCalledWith(
				'GameOverScene',
				expect.objectContaining({
					lastScene: 'DungeonScene',
				})
			);
		});

		it('should not trigger GameOver before delay', () => {
			battleManager.handlePlayerDeath(mockPlayer);

			jest.advanceTimersByTime(1499);

			expect(mockScene.scene.launch).not.toHaveBeenCalled();
			expect(mockScene.scene.pause).not.toHaveBeenCalled();
		});
	});

	describe('takeDamage - Player Death Integration', () => {
		let mockAttacker: any;

		beforeEach(() => {
			mockAttacker = {
				entityName: ENTITIES.Enemy,
				attributes: {
					atack: 50,
					critical: 0,
					hit: 100,
				},
				scene: mockScene,
				container: {
					x: 100,
					y: 100,
				},
			};

			mockPlayer.attributes.health = 10;
			mockPlayer.attributes.defense = 0;
			mockPlayer.attributes.flee = 10;
			mockPlayer.healthBar = {
				decrease: jest.fn(),
			};
			mockPlayer.container = {
				x: 50,
				y: 50,
			};

			mockScene.sound = {
				add: jest.fn().mockReturnValue({
					play: jest.fn(),
				}),
			};
			mockScene.add = {
				text: jest.fn().mockReturnValue({
					setDepth: jest.fn().mockReturnThis(),
					setOrigin: jest.fn().mockReturnThis(),
					setScale: jest.fn().mockReturnThis(),
				}),
				tween: jest.fn(),
			};
		});

		it('should call handlePlayerDeath when player health reaches 0', () => {
			const handlePlayerDeathSpy = jest.spyOn(battleManager, 'handlePlayerDeath');

			// Deal enough damage to kill player
			battleManager.takeDamage(mockAttacker, mockPlayer);

			expect(handlePlayerDeathSpy).toHaveBeenCalledWith(mockPlayer);
		});

		it('should not call handlePlayerDeath for enemy death', () => {
			const mockEnemy = {
				...mockPlayer,
				entityName: ENTITIES.Enemy,
				dropItems: jest.fn(),
				destroyAll: jest.fn(),
			};

			const handlePlayerDeathSpy = jest.spyOn(battleManager, 'handlePlayerDeath');

			battleManager.takeDamage(mockPlayer, mockEnemy);

			expect(handlePlayerDeathSpy).not.toHaveBeenCalled();
		});

		it('should prioritize player death over exp gain', () => {
			const handlePlayerDeathSpy = jest.spyOn(battleManager, 'handlePlayerDeath');

			battleManager.takeDamage(mockAttacker, mockPlayer);

			expect(handlePlayerDeathSpy).toHaveBeenCalled();
			// Verify it's the ONLY death handler that was called
			expect(mockPlayer.dropItems).toBeUndefined();
		});
	});
});
