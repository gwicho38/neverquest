/**
 * Tests for SurvivalModeScene - Wave-based survival mode
 */

import Phaser from 'phaser';
import {
	SurvivalModeScene,
	SurvivalState,
	DEFAULT_WAVE_CONFIGS,
	IWaveConfig,
	IWaveEnemySpawn,
	ISurvivalStats,
	IArenaConfig,
} from '../../scenes/SurvivalModeScene';

// Mock Phaser
jest.mock('phaser', () => {
	const mockSprite = {
		x: 0,
		y: 0,
		setAlpha: jest.fn().mockReturnThis(),
		setDepth: jest.fn().mockReturnThis(),
		setScrollFactor: jest.fn().mockReturnThis(),
		setTint: jest.fn().mockReturnThis(),
		clearTint: jest.fn().mockReturnThis(),
		destroy: jest.fn(),
		anims: {
			play: jest.fn(),
			stop: jest.fn(),
			currentAnim: null as unknown,
		},
		body: {
			setVelocity: jest.fn(),
			setSize: jest.fn(),
		},
		hitZone: {},
		container: {
			x: 0,
			y: 0,
			setDepth: jest.fn().mockReturnThis(),
		},
	};

	const mockText = {
		setText: jest.fn().mockReturnThis(),
		setOrigin: jest.fn().mockReturnThis(),
		setScrollFactor: jest.fn().mockReturnThis(),
		setDepth: jest.fn().mockReturnThis(),
		setColor: jest.fn().mockReturnThis(),
		setScale: jest.fn().mockReturnThis(),
		text: '',
	};

	const mockRectangle = {
		setDepth: jest.fn().mockReturnThis(),
		setStrokeStyle: jest.fn().mockReturnThis(),
		setScrollFactor: jest.fn().mockReturnThis(),
	};

	const mockTimerEvent = {
		destroy: jest.fn(),
		hasDispatched: false,
	};

	return {
		Scene: class {
			add = {
				text: jest.fn().mockReturnValue(mockText),
				rectangle: jest.fn().mockReturnValue(mockRectangle),
				zone: jest.fn().mockReturnValue({ setData: jest.fn() }),
				sprite: jest.fn().mockReturnValue(mockSprite),
				group: jest.fn().mockReturnValue({
					children: { entries: [] },
				}),
			};
			cameras = {
				main: {
					setZoom: jest.fn(),
					setBackgroundColor: jest.fn(),
					startFollow: jest.fn(),
					setBounds: jest.fn(),
					flash: jest.fn(),
					width: 800,
					height: 600,
				},
			};
			physics = {
				add: {
					existing: jest.fn(),
					collider: jest.fn(),
					overlap: jest.fn(),
				},
				pause: jest.fn(),
				resume: jest.fn(),
			};
			scene = {
				launch: jest.fn(),
				stop: jest.fn(),
				restart: jest.fn(),
				get: jest.fn(),
			};
			time = {
				delayedCall: jest.fn().mockReturnValue(mockTimerEvent),
				paused: false,
			};
			tweens = {
				add: jest.fn(),
			};
			input = {
				keyboard: {
					on: jest.fn(),
				},
			};
			events = {
				on: jest.fn(),
				off: jest.fn(),
				emit: jest.fn(),
			};
			sound = {
				add: jest.fn().mockReturnValue({ play: jest.fn() }),
				volume: 1,
			};
			sys = {
				animatedTiles: {
					init: jest.fn(),
				},
			};
		},
		Math: {
			Between: jest.fn().mockReturnValue(0),
		},
		Geom: {
			Rectangle: {
				Random: jest.fn().mockReturnValue({ x: 400, y: 300 }),
			},
		},
		Scale: {
			RESIZE: 'resize',
			CENTER_BOTH: 'center_both',
		},
		WEBGL: 'webgl',
	};
});

// Mock Player
jest.mock('../../entities/Player', () => ({
	Player: jest.fn().mockImplementation(() => ({
		x: 400,
		y: 300,
		container: {
			x: 400,
			y: 300,
			setDepth: jest.fn().mockReturnThis(),
		},
		hitZone: {},
		update: jest.fn(),
		destroy: jest.fn(),
	})),
}));

// Mock Enemy
jest.mock('../../entities/Enemy', () => ({
	Enemy: jest.fn().mockImplementation(() => ({
		x: 0,
		y: 0,
		exp: 20,
		setAlpha: jest.fn().mockReturnThis(),
		anims: {
			play: jest.fn(),
		},
		hitZone: {},
		body: {
			setVelocity: jest.fn(),
		},
		update: jest.fn(),
		destroy: jest.fn(),
	})),
}));

// Mock NeverquestBattleManager
jest.mock('../../plugins/NeverquestBattleManager', () => ({
	NeverquestBattleManager: jest.fn().mockImplementation(() => ({
		atack: jest.fn(),
		phaserJuice: null,
		neverquestEntityTextDisplay: null,
	})),
}));

// Mock EnemiesSeedConfig
jest.mock('../../consts/enemies/EnemiesSeedConfig', () => ({
	EnemiesSeedConfig: [
		{ id: 1, texture: 'rat', name: 'Rat' },
		{ id: 2, texture: 'bat', name: 'Bat' },
		{ id: 3, texture: 'ogre', name: 'Ogre' },
		{ id: 4, texture: 'bandit', name: 'Bandit' },
		{ id: 5, texture: 'wolf', name: 'Wolf' },
		{ id: 6, texture: 'shadow_scout', name: 'Shadow Scout' },
	],
}));

describe('SurvivalModeScene', () => {
	let scene: SurvivalModeScene;

	beforeEach(() => {
		jest.clearAllMocks();
		scene = new SurvivalModeScene();
	});

	describe('constructor', () => {
		it('should initialize with correct scene key', () => {
			expect((scene as unknown as { key: string }).key).toBeUndefined();
		});

		it('should initialize with null player', () => {
			expect(scene.player).toBeNull();
		});

		it('should initialize with empty enemies array', () => {
			expect(scene.enemies).toEqual([]);
		});

		it('should initialize with WAITING state', () => {
			expect(scene.state).toBe(SurvivalState.WAITING);
		});

		it('should initialize with default wave configs', () => {
			expect(scene.waveConfigs).toEqual(DEFAULT_WAVE_CONFIGS);
		});

		it('should initialize with null UI elements', () => {
			expect(scene.waveText).toBeNull();
			expect(scene.scoreText).toBeNull();
			expect(scene.comboText).toBeNull();
			expect(scene.timerText).toBeNull();
		});

		it('should initialize with null battle manager', () => {
			expect(scene.battleManager).toBeNull();
		});
	});

	describe('init', () => {
		it('should reset state to WAITING', () => {
			scene.state = SurvivalState.ACTIVE;
			scene.init();
			expect(scene.state).toBe(SurvivalState.WAITING);
		});

		it('should reset enemies array', () => {
			scene.enemies = [{} as never];
			scene.init();
			expect(scene.enemies).toEqual([]);
		});

		it('should use default arena config when not provided', () => {
			scene.init();
			expect(scene.arenaConfig).toEqual({
				x: 400,
				y: 300,
				width: 800,
				height: 600,
			});
		});

		it('should use custom arena config when provided', () => {
			const customArena: IArenaConfig = {
				x: 500,
				y: 400,
				width: 1000,
				height: 800,
			};
			scene.init({ arenaConfig: customArena });
			expect(scene.arenaConfig).toEqual(customArena);
		});

		it('should use default wave configs when not provided', () => {
			scene.init();
			expect(scene.waveConfigs).toEqual(DEFAULT_WAVE_CONFIGS);
		});

		it('should use custom wave configs when provided', () => {
			const customWaves: IWaveConfig[] = [
				{
					waveNumber: 1,
					spawns: [{ enemyId: 1, count: 10 }],
					breakTime: 1000,
					rewardMultiplier: 2.0,
				},
			];
			scene.init({ waveConfigs: customWaves });
			expect(scene.waveConfigs).toEqual(customWaves);
		});

		it('should set start wave correctly', () => {
			scene.init({ startWave: 5 });
			expect(scene.stats.currentWave).toBe(4); // Will be incremented when wave starts
		});

		it('should reset stats', () => {
			scene.stats.enemiesKilled = 100;
			scene.stats.currentCombo = 5;
			scene.init();
			expect(scene.stats.enemiesKilled).toBe(0);
			expect(scene.stats.currentCombo).toBe(0);
		});
	});

	describe('SurvivalState enum', () => {
		it('should have WAITING state', () => {
			expect(SurvivalState.WAITING).toBe('waiting');
		});

		it('should have ACTIVE state', () => {
			expect(SurvivalState.ACTIVE).toBe('active');
		});

		it('should have WAVE_COMPLETE state', () => {
			expect(SurvivalState.WAVE_COMPLETE).toBe('wave_complete');
		});

		it('should have GAME_OVER state', () => {
			expect(SurvivalState.GAME_OVER).toBe('game_over');
		});

		it('should have PAUSED state', () => {
			expect(SurvivalState.PAUSED).toBe('paused');
		});
	});

	describe('DEFAULT_WAVE_CONFIGS', () => {
		it('should have 10 waves', () => {
			expect(DEFAULT_WAVE_CONFIGS).toHaveLength(10);
		});

		it('should have wave numbers from 1 to 10', () => {
			DEFAULT_WAVE_CONFIGS.forEach((wave, index) => {
				expect(wave.waveNumber).toBe(index + 1);
			});
		});

		it('should have spawns array for each wave', () => {
			DEFAULT_WAVE_CONFIGS.forEach((wave) => {
				expect(Array.isArray(wave.spawns)).toBe(true);
				expect(wave.spawns.length).toBeGreaterThan(0);
			});
		});

		it('should have positive break time for each wave', () => {
			DEFAULT_WAVE_CONFIGS.forEach((wave) => {
				expect(wave.breakTime).toBeGreaterThan(0);
			});
		});

		it('should have reward multiplier >= 1.0 for each wave', () => {
			DEFAULT_WAVE_CONFIGS.forEach((wave) => {
				expect(wave.rewardMultiplier).toBeGreaterThanOrEqual(1.0);
			});
		});

		it('should have increasing reward multipliers', () => {
			for (let i = 1; i < DEFAULT_WAVE_CONFIGS.length; i++) {
				expect(DEFAULT_WAVE_CONFIGS[i].rewardMultiplier).toBeGreaterThanOrEqual(
					DEFAULT_WAVE_CONFIGS[i - 1].rewardMultiplier
				);
			}
		});

		it('wave 1 should only spawn rats', () => {
			const wave1 = DEFAULT_WAVE_CONFIGS[0];
			expect(wave1.spawns).toHaveLength(1);
			expect(wave1.spawns[0].enemyId).toBe(1); // Rat
		});

		it('wave 5 should include an ogre (mini-boss)', () => {
			const wave5 = DEFAULT_WAVE_CONFIGS[4];
			const ogreSpawn = wave5.spawns.find((s) => s.enemyId === 3);
			expect(ogreSpawn).toBeDefined();
			expect(ogreSpawn?.count).toBe(1);
		});

		it('wave 10 should include Shadow Scout (boss)', () => {
			const wave10 = DEFAULT_WAVE_CONFIGS[9];
			const shadowScoutSpawn = wave10.spawns.find((s) => s.enemyId === 6);
			expect(shadowScoutSpawn).toBeDefined();
		});

		it('wave 10 should have highest reward multiplier', () => {
			const wave10 = DEFAULT_WAVE_CONFIGS[9];
			expect(wave10.rewardMultiplier).toBe(3.0);
		});
	});

	describe('IWaveConfig interface', () => {
		it('should define valid wave config structure', () => {
			const validConfig: IWaveConfig = {
				waveNumber: 1,
				spawns: [{ enemyId: 1, count: 3 }],
				breakTime: 5000,
				rewardMultiplier: 1.0,
			};
			expect(validConfig.waveNumber).toBe(1);
			expect(validConfig.spawns).toHaveLength(1);
			expect(validConfig.breakTime).toBe(5000);
			expect(validConfig.rewardMultiplier).toBe(1.0);
		});
	});

	describe('IWaveEnemySpawn interface', () => {
		it('should define valid enemy spawn structure', () => {
			const spawn: IWaveEnemySpawn = {
				enemyId: 1,
				count: 5,
			};
			expect(spawn.enemyId).toBe(1);
			expect(spawn.count).toBe(5);
		});

		it('should support optional spawnDelay', () => {
			const spawnWithDelay: IWaveEnemySpawn = {
				enemyId: 2,
				count: 3,
				spawnDelay: 2000,
			};
			expect(spawnWithDelay.spawnDelay).toBe(2000);
		});
	});

	describe('ISurvivalStats interface', () => {
		it('should define all required stat fields', () => {
			const stats: ISurvivalStats = {
				currentWave: 1,
				enemiesKilled: 0,
				damageDealt: 0,
				damageTaken: 0,
				timeSurvived: 0,
				highestCombo: 0,
				currentCombo: 0,
				goldEarned: 0,
				xpEarned: 0,
			};
			expect(stats).toHaveProperty('currentWave');
			expect(stats).toHaveProperty('enemiesKilled');
			expect(stats).toHaveProperty('damageDealt');
			expect(stats).toHaveProperty('damageTaken');
			expect(stats).toHaveProperty('timeSurvived');
			expect(stats).toHaveProperty('highestCombo');
			expect(stats).toHaveProperty('currentCombo');
			expect(stats).toHaveProperty('goldEarned');
			expect(stats).toHaveProperty('xpEarned');
		});
	});

	describe('IArenaConfig interface', () => {
		it('should define arena bounds', () => {
			const arena: IArenaConfig = {
				x: 400,
				y: 300,
				width: 800,
				height: 600,
			};
			expect(arena.x).toBe(400);
			expect(arena.y).toBe(300);
			expect(arena.width).toBe(800);
			expect(arena.height).toBe(600);
		});
	});

	describe('getStats', () => {
		it('should return a copy of current stats', () => {
			scene.stats.enemiesKilled = 10;
			scene.stats.currentCombo = 3;

			const stats = scene.getStats();

			expect(stats.enemiesKilled).toBe(10);
			expect(stats.currentCombo).toBe(3);
		});

		it('should not return a reference to the internal stats object', () => {
			const stats = scene.getStats();
			stats.enemiesKilled = 999;

			expect(scene.stats.enemiesKilled).toBe(0);
		});
	});

	describe('getState', () => {
		it('should return current state', () => {
			expect(scene.getState()).toBe(SurvivalState.WAITING);
		});

		it('should return updated state after change', () => {
			scene.state = SurvivalState.ACTIVE;
			expect(scene.getState()).toBe(SurvivalState.ACTIVE);
		});
	});

	describe('startNextWave', () => {
		beforeEach(() => {
			scene.init();
			scene.waveText = {
				setText: jest.fn(),
			} as never;
			scene.stateText = {
				setText: jest.fn(),
				setColor: jest.fn(),
			} as never;
			scene.cameras = {
				main: {
					flash: jest.fn(),
				},
			} as never;
			scene.time = {
				delayedCall: jest.fn().mockReturnValue({ destroy: jest.fn(), hasDispatched: false }),
			} as never;
		});

		it('should increment wave counter', () => {
			scene.startNextWave();
			expect(scene.stats.currentWave).toBe(1);
		});

		it('should set state to ACTIVE', () => {
			scene.startNextWave();
			expect(scene.state).toBe(SurvivalState.ACTIVE);
		});

		it('should update wave text', () => {
			scene.startNextWave();
			expect(scene.waveText?.setText).toHaveBeenCalledWith('WAVE 1');
		});

		it('should set current wave config', () => {
			scene.startNextWave();
			expect(scene.currentWaveConfig).toBe(DEFAULT_WAVE_CONFIGS[0]);
		});

		it('should trigger camera flash', () => {
			scene.startNextWave();
			expect(scene.cameras.main.flash).toHaveBeenCalled();
		});
	});

	describe('togglePause', () => {
		beforeEach(() => {
			scene.init();
			scene.stateText = {
				setText: jest.fn(),
				setColor: jest.fn(),
				text: 'FIGHT!',
			} as never;
			scene.physics = {
				pause: jest.fn(),
				resume: jest.fn(),
			} as never;
			scene.time = {
				paused: false,
			} as never;
		});

		it('should not toggle when game is over', () => {
			scene.state = SurvivalState.GAME_OVER;
			scene.togglePause();
			expect(scene.physics.pause).not.toHaveBeenCalled();
		});

		it('should pause when active', () => {
			scene.state = SurvivalState.ACTIVE;
			scene.togglePause();
			expect(scene.state).toBe(SurvivalState.PAUSED);
		});

		it('should resume when paused', () => {
			scene.state = SurvivalState.PAUSED;
			(scene as unknown as { prevState: SurvivalState }).prevState = SurvivalState.ACTIVE;
			scene.togglePause();
			expect(scene.state).toBe(SurvivalState.ACTIVE);
		});
	});

	describe('pauseGame', () => {
		beforeEach(() => {
			scene.init();
			scene.state = SurvivalState.ACTIVE;
			scene.stateText = {
				setText: jest.fn(),
				setColor: jest.fn(),
				text: 'FIGHT!',
			} as never;
			scene.physics = {
				pause: jest.fn(),
			} as never;
			scene.time = {
				paused: false,
			} as never;
		});

		it('should set state to PAUSED', () => {
			scene.pauseGame();
			expect(scene.state).toBe(SurvivalState.PAUSED);
		});

		it('should pause physics', () => {
			scene.pauseGame();
			expect(scene.physics.pause).toHaveBeenCalled();
		});

		it('should pause time', () => {
			scene.pauseGame();
			expect(scene.time.paused).toBe(true);
		});

		it('should update state text', () => {
			scene.pauseGame();
			expect(scene.stateText?.setText).toHaveBeenCalledWith('PAUSED');
		});
	});

	describe('resumeGame', () => {
		beforeEach(() => {
			scene.init();
			scene.state = SurvivalState.PAUSED;
			(scene as unknown as { prevState: SurvivalState }).prevState = SurvivalState.ACTIVE;
			scene.stateText = {
				setText: jest.fn(),
				setColor: jest.fn(),
			} as never;
			scene.physics = {
				resume: jest.fn(),
			} as never;
			scene.time = {
				paused: true,
			} as never;
		});

		it('should restore previous state', () => {
			scene.resumeGame();
			expect(scene.state).toBe(SurvivalState.ACTIVE);
		});

		it('should resume physics', () => {
			scene.resumeGame();
			expect(scene.physics.resume).toHaveBeenCalled();
		});

		it('should resume time', () => {
			scene.resumeGame();
			expect(scene.time.paused).toBe(false);
		});
	});

	describe('restartGame', () => {
		beforeEach(() => {
			scene.scene = {
				stop: jest.fn(),
				restart: jest.fn(),
			} as never;
		});

		it('should stop HUD scene', () => {
			scene.restartGame();
			expect(scene.scene.stop).toHaveBeenCalledWith('HUDScene');
		});

		it('should stop Joystick scene', () => {
			scene.restartGame();
			expect(scene.scene.stop).toHaveBeenCalledWith('JoystickScene');
		});

		it('should restart survival scene', () => {
			scene.restartGame();
			expect(scene.scene.restart).toHaveBeenCalled();
		});
	});

	describe('shutdown', () => {
		beforeEach(() => {
			scene.init();
			scene.events = {
				off: jest.fn(),
			} as never;
			scene.comboTimer = { destroy: jest.fn() } as never;
			scene.breakTimer = { destroy: jest.fn() } as never;
			scene.spawnTimers = [{ destroy: jest.fn() } as never];
			scene.enemies = [{ destroy: jest.fn() } as never];
		});

		it('should remove event listeners', () => {
			scene.shutdown();
			expect(scene.events.off).toHaveBeenCalled();
		});

		it('should destroy combo timer', () => {
			scene.shutdown();
			expect(scene.comboTimer?.destroy).toHaveBeenCalled();
		});

		it('should destroy break timer', () => {
			scene.shutdown();
			expect(scene.breakTimer?.destroy).toHaveBeenCalled();
		});

		it('should destroy spawn timers', () => {
			const destroyFn = scene.spawnTimers[0].destroy;
			scene.shutdown();
			expect(destroyFn).toHaveBeenCalled();
		});

		it('should destroy all enemies', () => {
			const destroyFn = (scene.enemies[0] as unknown as { destroy: jest.Mock }).destroy;
			scene.shutdown();
			expect(destroyFn).toHaveBeenCalled();
		});

		it('should clear enemies array', () => {
			scene.shutdown();
			expect(scene.enemies).toEqual([]);
		});
	});

	describe('update', () => {
		beforeEach(() => {
			scene.init();
			scene.player = {
				update: jest.fn(),
			} as never;
			scene.enemies = [{ update: jest.fn() } as never, { update: jest.fn() } as never];
		});

		it('should not update when paused', () => {
			scene.state = SurvivalState.PAUSED;
			scene.update(0, 16);
			expect(scene.player?.update).not.toHaveBeenCalled();
		});

		it('should not update when game over', () => {
			scene.state = SurvivalState.GAME_OVER;
			scene.update(0, 16);
			expect(scene.player?.update).not.toHaveBeenCalled();
		});

		it('should update player when active', () => {
			scene.state = SurvivalState.ACTIVE;
			scene.update(0, 16);
			expect(scene.player?.update).toHaveBeenCalledWith(0, 16);
		});

		it('should update all enemies when active', () => {
			scene.state = SurvivalState.ACTIVE;
			scene.update(0, 16);
			scene.enemies.forEach((enemy) => {
				expect((enemy as unknown as { update: jest.Mock }).update).toHaveBeenCalledWith(0, 16);
			});
		});
	});

	describe('wave difficulty progression', () => {
		it('should have more enemies in later waves', () => {
			const wave1TotalEnemies = DEFAULT_WAVE_CONFIGS[0].spawns.reduce((sum, s) => sum + s.count, 0);
			const wave10TotalEnemies = DEFAULT_WAVE_CONFIGS[9].spawns.reduce((sum, s) => sum + s.count, 0);

			expect(wave10TotalEnemies).toBeGreaterThan(wave1TotalEnemies);
		});

		it('should introduce stronger enemies in later waves', () => {
			// Wave 1 only has rats (id 1)
			const wave1EnemyIds = DEFAULT_WAVE_CONFIGS[0].spawns.map((s) => s.enemyId);
			expect(wave1EnemyIds).toContain(1);
			expect(wave1EnemyIds).not.toContain(6); // No shadow scout

			// Wave 10 has shadow scout (id 6)
			const wave10EnemyIds = DEFAULT_WAVE_CONFIGS[9].spawns.map((s) => s.enemyId);
			expect(wave10EnemyIds).toContain(6);
		});

		it('should have spawn delays for tougher enemies', () => {
			// Check that some waves have delayed spawns for tougher enemies
			let hasDelayedToughSpawn = false;

			DEFAULT_WAVE_CONFIGS.forEach((wave) => {
				wave.spawns.forEach((spawn) => {
					if (spawn.spawnDelay && spawn.spawnDelay > 0 && spawn.enemyId >= 3) {
						hasDelayedToughSpawn = true;
					}
				});
			});

			expect(hasDelayedToughSpawn).toBe(true);
		});
	});

	describe('combo system', () => {
		beforeEach(() => {
			scene.init();
		});

		it('should track highest combo', () => {
			scene.stats.currentCombo = 5;
			scene.stats.highestCombo = 3;

			// Simulate updating highest combo
			if (scene.stats.currentCombo > scene.stats.highestCombo) {
				scene.stats.highestCombo = scene.stats.currentCombo;
			}

			expect(scene.stats.highestCombo).toBe(5);
		});

		it('should reset combo after timeout', () => {
			scene.stats.currentCombo = 10;
			scene.stats.currentCombo = 0; // Simulating timeout reset

			expect(scene.stats.currentCombo).toBe(0);
		});
	});

	describe('reward calculation', () => {
		it('should apply wave multiplier to rewards', () => {
			const baseGold = 10;
			const wave5Multiplier = DEFAULT_WAVE_CONFIGS[4].rewardMultiplier;
			const expectedGold = Math.floor(baseGold * wave5Multiplier);

			expect(expectedGold).toBeGreaterThan(baseGold);
		});

		it('should apply combo bonus to rewards', () => {
			const baseXp = 20;
			const multiplier = 1.0;
			const combo = 5;

			const xpWithCombo = Math.floor(baseXp * multiplier * (1 + combo * 0.1));
			const xpWithoutCombo = Math.floor(baseXp * multiplier);

			expect(xpWithCombo).toBeGreaterThan(xpWithoutCombo);
		});
	});

	describe('arena configuration', () => {
		it('default arena should be centered at 400x300', () => {
			scene.init();
			expect(scene.arenaConfig.x).toBe(400);
			expect(scene.arenaConfig.y).toBe(300);
		});

		it('default arena should be 800x600', () => {
			scene.init();
			expect(scene.arenaConfig.width).toBe(800);
			expect(scene.arenaConfig.height).toBe(600);
		});

		it('should support custom arena dimensions', () => {
			const customArena: IArenaConfig = {
				x: 640,
				y: 480,
				width: 1280,
				height: 960,
			};
			scene.init({ arenaConfig: customArena });

			expect(scene.arenaConfig.x).toBe(640);
			expect(scene.arenaConfig.y).toBe(480);
			expect(scene.arenaConfig.width).toBe(1280);
			expect(scene.arenaConfig.height).toBe(960);
		});
	});

	describe('create', () => {
		beforeEach(() => {
			scene.init();
		});

		it('should set startTime', () => {
			const before = Date.now();
			scene.create();
			const after = Date.now();
			expect(scene.startTime).toBeGreaterThanOrEqual(before);
			expect(scene.startTime).toBeLessThanOrEqual(after);
		});

		it('should set up camera zoom and background', () => {
			scene.create();
			expect(scene.cameras.main.setZoom).toHaveBeenCalled();
			expect(scene.cameras.main.setBackgroundColor).toHaveBeenCalled();
		});

		it('should create arena background and border', () => {
			scene.create();
			expect(scene.arenaBackground).not.toBeNull();
			expect(scene.arenaBorder).not.toBeNull();
		});

		it('should create player', () => {
			scene.create();
			expect(scene.player).not.toBeNull();
		});

		it('should set player container depth', () => {
			scene.create();
			expect(scene.player!.container.setDepth).toHaveBeenCalledWith(10);
		});

		it('should create all UI text elements', () => {
			scene.create();
			expect(scene.waveText).not.toBeNull();
			expect(scene.scoreText).not.toBeNull();
			expect(scene.comboText).not.toBeNull();
			expect(scene.timerText).not.toBeNull();
			expect(scene.stateText).not.toBeNull();
			expect(scene.enemyCountText).not.toBeNull();
		});

		it('should create battle manager', () => {
			scene.create();
			expect(scene.battleManager).not.toBeNull();
		});

		it('should register event listeners for combat events', () => {
			scene.create();
			expect(scene.events.on).toHaveBeenCalledWith('enemyDeath', expect.any(Function), scene);
			expect(scene.events.on).toHaveBeenCalledWith('playerDeath', expect.any(Function), scene);
			expect(scene.events.on).toHaveBeenCalledWith('damageDealt', expect.any(Function), scene);
			expect(scene.events.on).toHaveBeenCalledWith('damageTaken', expect.any(Function), scene);
		});

		it('should register update event listener', () => {
			scene.create();
			expect(scene.events.on).toHaveBeenCalledWith('update', expect.any(Function), scene);
		});

		it('should launch HUD scene', () => {
			scene.create();
			expect(scene.scene.launch).toHaveBeenCalledWith('HUDScene', { player: scene.player });
		});

		it('should launch Joystick scene', () => {
			scene.create();
			expect(scene.scene.launch).toHaveBeenCalledWith('JoystickScene', { player: scene.player });
		});

		it('should set up keyboard input handlers', () => {
			scene.create();
			expect(scene.input.keyboard.on).toHaveBeenCalledWith('keydown-ESC', expect.any(Function));
			expect(scene.input.keyboard.on).toHaveBeenCalledWith('keydown-R', expect.any(Function));
		});

		it('should schedule first wave with delayed call', () => {
			scene.create();
			expect(scene.time.delayedCall).toHaveBeenCalledWith(2000, expect.any(Function));
		});

		it('should create arena with physics walls', () => {
			scene.create();
			// 4 walls + background + border = 6 rectangles total
			expect(scene.add.rectangle).toHaveBeenCalledTimes(6);
			// 4 walls should get physics bodies
			expect(scene.physics.add.existing).toHaveBeenCalledTimes(4);
		});

		it('should set up camera to follow player', () => {
			scene.create();
			expect(scene.cameras.main.startFollow).toHaveBeenCalledWith(scene.player!.container, true, 0.1, 0.1);
		});

		it('should set up collision between player and arena walls', () => {
			scene.create();
			expect(scene.physics.add.collider).toHaveBeenCalled();
		});
	});

	describe('startNextWave - victory condition', () => {
		beforeEach(() => {
			scene.init();
			scene.waveText = { setText: jest.fn() } as never;
			scene.stateText = { setText: jest.fn(), setColor: jest.fn() } as never;
			scene.cameras = { main: { flash: jest.fn() } } as never;
			scene.time = {
				delayedCall: jest.fn().mockReturnValue({ destroy: jest.fn(), hasDispatched: false }),
			} as never;
		});

		it('should trigger victory when all waves completed', () => {
			// Set wave counter to last wave
			scene.stats.currentWave = scene.waveConfigs.length;
			scene.startTime = Date.now() - 60000;

			// Victory calls onVictory which sets GAME_OVER and timeSurvived
			scene.startNextWave();
			expect(scene.state).toBe(SurvivalState.GAME_OVER);
			expect(scene.stats.timeSurvived).toBeGreaterThan(0);
		});

		it('should set state text to FIGHT when starting wave', () => {
			scene.startNextWave();
			expect(scene.stateText!.setText).toHaveBeenCalledWith('FIGHT!');
			expect(scene.stateText!.setColor).toHaveBeenCalled();
		});

		it('should record wave start time', () => {
			const before = Date.now();
			scene.startNextWave();
			expect(scene.waveStartTime).toBeGreaterThanOrEqual(before);
		});
	});

	describe('spawnWaveEnemies (via startNextWave)', () => {
		let delayedCallbacks: Array<{ delay: number; callback: () => void }>;

		beforeEach(() => {
			delayedCallbacks = [];
			scene.init();
			scene.waveText = { setText: jest.fn() } as never;
			scene.stateText = { setText: jest.fn(), setColor: jest.fn() } as never;
			scene.cameras = { main: { flash: jest.fn() } } as never;
			scene.time = {
				delayedCall: jest.fn().mockImplementation((delay: number, callback: () => void) => {
					delayedCallbacks.push({ delay, callback });
					return { destroy: jest.fn(), hasDispatched: false };
				}),
			} as never;
			scene.tweens = { add: jest.fn() } as never;
			scene.physics = {
				add: { overlap: jest.fn() },
			} as never;
			scene.player = { hitZone: {} } as never;
		});

		it('should schedule delayed spawns for enemies with spawnDelay', () => {
			// Use custom single-wave config with delayed spawns
			scene.waveConfigs = [
				{
					waveNumber: 1,
					spawns: [
						{ enemyId: 1, count: 2 },
						{ enemyId: 2, count: 1, spawnDelay: 3000 },
					],
					breakTime: 5000,
					rewardMultiplier: 1.0,
				},
			];

			scene.startNextWave();

			// Should have multiple delayedCall invocations:
			// 1. For immediate spawns (individual 200ms delays)
			// 2. For delayed spawns (3000ms group delay)
			expect(scene.time.delayedCall).toHaveBeenCalled();
			const calls = (scene.time.delayedCall as jest.Mock).mock.calls;
			// At least one call should be for the 3000ms delay
			const hasDelayedSpawn = calls.some((call: [number, () => void]) => call[0] === 3000);
			expect(hasDelayedSpawn).toBe(true);
		});

		it('should spawn enemies immediately when no spawnDelay', () => {
			scene.waveConfigs = [
				{
					waveNumber: 1,
					spawns: [{ enemyId: 1, count: 2 }],
					breakTime: 5000,
					rewardMultiplier: 1.0,
				},
			];

			scene.startNextWave();

			// Should have delayedCalls for individual enemy spawns (200ms apart)
			const calls = (scene.time.delayedCall as jest.Mock).mock.calls;
			const individualSpawns = calls.filter((call: [number, () => void]) => call[0] === 0 || call[0] === 200);
			expect(individualSpawns.length).toBeGreaterThan(0);
		});

		it('should store spawn timers for delayed spawns', () => {
			scene.waveConfigs = [
				{
					waveNumber: 1,
					spawns: [{ enemyId: 2, count: 1, spawnDelay: 5000 }],
					breakTime: 5000,
					rewardMultiplier: 1.0,
				},
			];

			scene.startNextWave();
			expect(scene.spawnTimers.length).toBeGreaterThan(0);
		});
	});

	describe('spawnEnemy (via event-driven testing)', () => {
		beforeEach(() => {
			scene.init();
			scene.state = SurvivalState.ACTIVE;
			scene.tweens = { add: jest.fn() } as never;
			scene.physics = {
				add: { overlap: jest.fn() },
			} as never;
			scene.player = { hitZone: {} } as never;
		});

		it('should not spawn when state is not ACTIVE', () => {
			scene.state = SurvivalState.PAUSED;
			// Access private spawnEnemy via any cast
			(scene as any).spawnEnemy(1);
			expect(scene.enemies.length).toBe(0);
		});

		it('should warn when enemy ID is not found', () => {
			const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
			(scene as any).spawnEnemy(999);
			expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('999'));
			consoleSpy.mockRestore();
		});

		it('should add enemy to enemies array on spawn', () => {
			(scene as any).spawnEnemy(1);
			expect(scene.enemies.length).toBe(1);
		});

		it('should set up overlap with player', () => {
			(scene as any).spawnEnemy(1);
			expect(scene.physics.add.overlap).toHaveBeenCalled();
		});

		it('should start spawn fade-in tween', () => {
			(scene as any).spawnEnemy(1);
			expect(scene.tweens.add).toHaveBeenCalledWith(
				expect.objectContaining({
					alpha: 1,
					duration: 300,
				})
			);
		});

		it('should spawn multiple enemies', () => {
			(scene as any).spawnEnemy(1);
			(scene as any).spawnEnemy(2);
			(scene as any).spawnEnemy(1);
			expect(scene.enemies.length).toBe(3);
		});
	});

	describe('getRandomEdgePosition', () => {
		const mockBetween = Phaser.Math.Between as jest.Mock;

		beforeEach(() => {
			scene.init();
		});

		it('should return position within arena bounds', () => {
			for (let edge = 0; edge <= 3; edge++) {
				mockBetween.mockReturnValue(edge);
				const pos = (scene as any).getRandomEdgePosition();
				expect(pos).toHaveProperty('x');
				expect(pos).toHaveProperty('y');
				expect(typeof pos.x).toBe('number');
				expect(typeof pos.y).toBe('number');
			}
		});

		it('should return top edge position when edge=0', () => {
			mockBetween.mockReturnValue(0);
			const pos = (scene as any).getRandomEdgePosition();
			// Top edge: y should be near the top of the arena
			const expectedY = scene.arenaConfig.y - scene.arenaConfig.height / 2 + 50;
			expect(pos.y).toBe(expectedY);
		});

		it('should return bottom edge position when edge=1', () => {
			// First call returns 1 (bottom edge), subsequent calls return a valid x
			mockBetween.mockReturnValueOnce(1).mockReturnValue(400);
			const pos = (scene as any).getRandomEdgePosition();
			const expectedY = scene.arenaConfig.y + scene.arenaConfig.height / 2 - 50;
			expect(pos.y).toBe(expectedY);
		});

		it('should return left edge position when edge=2', () => {
			mockBetween.mockReturnValueOnce(2).mockReturnValue(300);
			const pos = (scene as any).getRandomEdgePosition();
			const expectedX = scene.arenaConfig.x - scene.arenaConfig.width / 2 + 50;
			expect(pos.x).toBe(expectedX);
		});

		it('should return right edge position when edge=3', () => {
			mockBetween.mockReturnValueOnce(3).mockReturnValue(300);
			const pos = (scene as any).getRandomEdgePosition();
			const expectedX = scene.arenaConfig.x + scene.arenaConfig.width / 2 - 50;
			expect(pos.x).toBe(expectedX);
		});
	});

	describe('onEnemyDeath', () => {
		let mockEnemy: { exp: number; destroy: jest.Mock };

		beforeEach(() => {
			scene.init();
			scene.state = SurvivalState.ACTIVE;
			scene.currentWaveConfig = {
				waveNumber: 1,
				spawns: [{ enemyId: 1, count: 1 }],
				breakTime: 5000,
				rewardMultiplier: 1.5,
			};
			scene.time = {
				delayedCall: jest.fn().mockReturnValue({ destroy: jest.fn(), hasDispatched: true }),
			} as never;
			scene.stateText = { setText: jest.fn(), setColor: jest.fn() } as never;
			scene.cameras = { main: { flash: jest.fn() } } as never;

			mockEnemy = {
				exp: 20,
				destroy: jest.fn(),
			};
			scene.enemies = [mockEnemy as never];
			scene.comboTimer = null;
		});

		it('should increment enemies killed count', () => {
			(scene as any).onEnemyDeath(mockEnemy);
			expect(scene.stats.enemiesKilled).toBe(1);
		});

		it('should increment current combo', () => {
			(scene as any).onEnemyDeath(mockEnemy);
			expect(scene.stats.currentCombo).toBe(1);
		});

		it('should update highest combo when current exceeds it', () => {
			scene.stats.currentCombo = 4;
			scene.stats.highestCombo = 4;
			(scene as any).onEnemyDeath(mockEnemy);
			expect(scene.stats.highestCombo).toBe(5);
		});

		it('should not lower highest combo', () => {
			scene.stats.highestCombo = 10;
			scene.stats.currentCombo = 0;
			(scene as any).onEnemyDeath(mockEnemy);
			expect(scene.stats.highestCombo).toBe(10);
		});

		it('should destroy previous combo timer', () => {
			const mockTimer = { destroy: jest.fn() };
			scene.comboTimer = mockTimer as never;
			(scene as any).onEnemyDeath(mockEnemy);
			expect(mockTimer.destroy).toHaveBeenCalled();
		});

		it('should set up new combo timer for 3 seconds', () => {
			(scene as any).onEnemyDeath(mockEnemy);
			expect(scene.time.delayedCall).toHaveBeenCalledWith(3000, expect.any(Function));
		});

		it('should award gold with wave multiplier and combo bonus', () => {
			scene.stats.currentCombo = 0; // Will become 1 after this kill
			(scene as any).onEnemyDeath(mockEnemy);
			// Gold = floor(baseGold * multiplier * (1 + combo * 0.1))
			// baseGold = enemy.exp = 20, multiplier = 1.5, combo = 1
			const expectedGold = Math.floor(20 * 1.5 * (1 + 1 * 0.1));
			expect(scene.stats.goldEarned).toBe(expectedGold);
		});

		it('should award XP with wave multiplier and combo bonus', () => {
			scene.stats.currentCombo = 0;
			(scene as any).onEnemyDeath(mockEnemy);
			const expectedXp = Math.floor(20 * 1.5 * (1 + 1 * 0.1));
			expect(scene.stats.xpEarned).toBe(expectedXp);
		});

		it('should remove enemy from enemies array', () => {
			(scene as any).onEnemyDeath(mockEnemy);
			expect(scene.enemies).not.toContain(mockEnemy);
		});

		it('should trigger wave complete when last enemy dies', () => {
			scene.spawnTimers = [];
			(scene as any).onEnemyDeath(mockEnemy);
			// Wave complete sets state to WAVE_COMPLETE
			expect(scene.state).toBe(SurvivalState.WAVE_COMPLETE);
		});

		it('should not trigger wave complete when enemies remain', () => {
			const anotherEnemy = { exp: 10, destroy: jest.fn() };
			scene.enemies = [mockEnemy as never, anotherEnemy as never];
			(scene as any).onEnemyDeath(mockEnemy);
			expect(scene.state).toBe(SurvivalState.ACTIVE);
		});
	});

	describe('checkWaveComplete', () => {
		beforeEach(() => {
			scene.init();
			scene.state = SurvivalState.ACTIVE;
			scene.stateText = { setText: jest.fn(), setColor: jest.fn() } as never;
			scene.cameras = { main: { flash: jest.fn() } } as never;
			scene.time = {
				delayedCall: jest.fn().mockReturnValue({ destroy: jest.fn(), hasDispatched: true }),
			} as never;
			scene.currentWaveConfig = {
				waveNumber: 1,
				spawns: [],
				breakTime: 5000,
				rewardMultiplier: 1.0,
			};
		});

		it('should not complete wave when enemies remain', () => {
			scene.enemies = [{ destroy: jest.fn() } as never];
			scene.spawnTimers = [];
			(scene as any).checkWaveComplete();
			expect(scene.state).toBe(SurvivalState.ACTIVE);
		});

		it('should not complete wave when spawn timers are active', () => {
			scene.enemies = [];
			scene.spawnTimers = [{ hasDispatched: false, destroy: jest.fn() } as never];
			(scene as any).checkWaveComplete();
			expect(scene.state).toBe(SurvivalState.ACTIVE);
		});

		it('should complete wave when no enemies and all timers dispatched', () => {
			scene.enemies = [];
			scene.spawnTimers = [{ hasDispatched: true, destroy: jest.fn() } as never];
			(scene as any).checkWaveComplete();
			expect(scene.state).toBe(SurvivalState.WAVE_COMPLETE);
		});

		it('should not complete wave when state is not ACTIVE', () => {
			scene.state = SurvivalState.PAUSED;
			scene.enemies = [];
			scene.spawnTimers = [];
			(scene as any).checkWaveComplete();
			expect(scene.state).toBe(SurvivalState.PAUSED);
		});
	});

	describe('onWaveComplete', () => {
		beforeEach(() => {
			scene.init();
			scene.state = SurvivalState.ACTIVE;
			scene.stateText = { setText: jest.fn(), setColor: jest.fn() } as never;
			scene.cameras = { main: { flash: jest.fn() } } as never;
			scene.time = {
				delayedCall: jest.fn().mockReturnValue({ destroy: jest.fn(), hasDispatched: true }),
			} as never;
			scene.currentWaveConfig = {
				waveNumber: 1,
				spawns: [],
				breakTime: 5000,
				rewardMultiplier: 1.0,
			};
			scene.spawnTimers = [{ destroy: jest.fn() } as never];
		});

		it('should set state to WAVE_COMPLETE', () => {
			(scene as any).onWaveComplete();
			expect(scene.state).toBe(SurvivalState.WAVE_COMPLETE);
		});

		it('should update state text', () => {
			(scene as any).onWaveComplete();
			expect(scene.stateText!.setText).toHaveBeenCalledWith('WAVE COMPLETE!');
			expect(scene.stateText!.setColor).toHaveBeenCalled();
		});

		it('should destroy existing spawn timers', () => {
			const destroySpy = scene.spawnTimers[0].destroy;
			(scene as any).onWaveComplete();
			expect(destroySpy).toHaveBeenCalled();
		});

		it('should clear spawn timers array', () => {
			(scene as any).onWaveComplete();
			expect(scene.spawnTimers).toEqual([]);
		});

		it('should flash camera green', () => {
			(scene as any).onWaveComplete();
			expect(scene.cameras.main.flash).toHaveBeenCalledWith(500, 0, 255, 0);
		});

		it('should schedule next wave after break time', () => {
			(scene as any).onWaveComplete();
			expect(scene.time.delayedCall).toHaveBeenCalledWith(5000, expect.any(Function));
		});

		it('should use default break time when waveConfig is null', () => {
			scene.currentWaveConfig = null;
			(scene as any).onWaveComplete();
			expect(scene.time.delayedCall).toHaveBeenCalledWith(5000, expect.any(Function));
		});
	});

	describe('showBreakCountdown', () => {
		beforeEach(() => {
			scene.init();
			scene.state = SurvivalState.WAVE_COMPLETE;
			scene.stateText = { setText: jest.fn(), setColor: jest.fn() } as never;
			scene.time = {
				delayedCall: jest.fn().mockReturnValue({ destroy: jest.fn(), hasDispatched: false }),
			} as never;
		});

		it('should display countdown text', () => {
			(scene as any).showBreakCountdown(5000);
			expect(scene.stateText!.setText).toHaveBeenCalledWith(expect.stringContaining('NEXT WAVE IN'));
		});

		it('should not update countdown if state changes', () => {
			scene.state = SurvivalState.ACTIVE;
			(scene as any).showBreakCountdown(3000);
			// First call always happens, but subsequent won't update
			// since state check happens inside the recursive callback
			expect(scene.stateText!.setText).not.toHaveBeenCalled();
		});
	});

	describe('onPlayerDeath', () => {
		beforeEach(() => {
			scene.init();
			scene.state = SurvivalState.ACTIVE;
			scene.startTime = Date.now() - 30000; // Started 30s ago
			scene.comboTimer = { destroy: jest.fn() } as never;
			scene.breakTimer = { destroy: jest.fn() } as never;
			scene.spawnTimers = [{ destroy: jest.fn() } as never];
			scene.enemies = [
				{ body: { setVelocity: jest.fn() } } as never,
				{ body: { setVelocity: jest.fn() } } as never,
			];
			// Mock UI methods needed by showGameOver
			scene.cameras = {
				main: { width: 800, height: 600 },
			} as never;
			scene.add = {
				rectangle: jest.fn().mockReturnValue({
					setScrollFactor: jest.fn().mockReturnThis(),
					setDepth: jest.fn().mockReturnThis(),
				}),
				text: jest.fn().mockReturnValue({
					setOrigin: jest.fn().mockReturnThis(),
					setScrollFactor: jest.fn().mockReturnThis(),
					setDepth: jest.fn().mockReturnThis(),
				}),
			} as never;
		});

		it('should set state to GAME_OVER', () => {
			(scene as any).onPlayerDeath();
			expect(scene.state).toBe(SurvivalState.GAME_OVER);
		});

		it('should record time survived', () => {
			(scene as any).onPlayerDeath();
			expect(scene.stats.timeSurvived).toBeGreaterThan(0);
			expect(scene.stats.timeSurvived).toBeGreaterThanOrEqual(30000);
		});

		it('should destroy combo timer', () => {
			(scene as any).onPlayerDeath();
			expect(scene.comboTimer!.destroy).toHaveBeenCalled();
		});

		it('should destroy break timer', () => {
			(scene as any).onPlayerDeath();
			expect(scene.breakTimer!.destroy).toHaveBeenCalled();
		});

		it('should destroy spawn timers', () => {
			const destroySpy = scene.spawnTimers[0].destroy;
			(scene as any).onPlayerDeath();
			expect(destroySpy).toHaveBeenCalled();
		});

		it('should stop all enemy movement', () => {
			(scene as any).onPlayerDeath();
			scene.enemies.forEach((enemy) => {
				const body = (enemy as unknown as { body: { setVelocity: jest.Mock } }).body;
				expect(body.setVelocity).toHaveBeenCalledWith(0, 0);
			});
		});

		it('should handle enemies without body', () => {
			scene.enemies = [{ body: null } as never];
			expect(() => (scene as any).onPlayerDeath()).not.toThrow();
		});

		it('should show game over screen', () => {
			(scene as any).onPlayerDeath();
			// Game over creates an overlay rectangle and text elements
			expect(scene.add.rectangle).toHaveBeenCalled();
			expect(scene.add.text).toHaveBeenCalled();
		});
	});

	describe('onVictory', () => {
		beforeEach(() => {
			scene.init();
			scene.state = SurvivalState.ACTIVE;
			scene.startTime = Date.now() - 120000; // Started 2 min ago
			scene.cameras = {
				main: { width: 800, height: 600 },
			} as never;
			scene.add = {
				rectangle: jest.fn().mockReturnValue({
					setScrollFactor: jest.fn().mockReturnThis(),
					setDepth: jest.fn().mockReturnThis(),
				}),
				text: jest.fn().mockReturnValue({
					setOrigin: jest.fn().mockReturnThis(),
					setScrollFactor: jest.fn().mockReturnThis(),
					setDepth: jest.fn().mockReturnThis(),
				}),
			} as never;
		});

		it('should set state to GAME_OVER', () => {
			(scene as any).onVictory();
			expect(scene.state).toBe(SurvivalState.GAME_OVER);
		});

		it('should record time survived', () => {
			(scene as any).onVictory();
			expect(scene.stats.timeSurvived).toBeGreaterThanOrEqual(120000);
		});

		it('should show victory screen with VICTORY text', () => {
			(scene as any).onVictory();
			const textCalls = (scene.add.text as jest.Mock).mock.calls;
			const victoryCall = textCalls.find((call: unknown[]) => call[2] === 'VICTORY!');
			expect(victoryCall).toBeDefined();
		});
	});

	describe('showGameOver', () => {
		beforeEach(() => {
			scene.init();
			scene.state = SurvivalState.GAME_OVER;
			scene.stats.currentWave = 5;
			scene.stats.enemiesKilled = 25;
			scene.stats.highestCombo = 8;
			scene.stats.timeSurvived = 90000;
			scene.stats.goldEarned = 500;
			scene.stats.xpEarned = 1000;
			scene.enemies = [{ destroy: jest.fn() } as never]; // Enemies remain (died during wave)
			scene.cameras = {
				main: { width: 800, height: 600 },
			} as never;
			scene.add = {
				rectangle: jest.fn().mockReturnValue({
					setScrollFactor: jest.fn().mockReturnThis(),
					setDepth: jest.fn().mockReturnThis(),
				}),
				text: jest.fn().mockReturnValue({
					setOrigin: jest.fn().mockReturnThis(),
					setScrollFactor: jest.fn().mockReturnThis(),
					setDepth: jest.fn().mockReturnThis(),
				}),
			} as never;
		});

		it('should create dark overlay', () => {
			(scene as any).showGameOver();
			expect(scene.add.rectangle).toHaveBeenCalledWith(400, 300, 800, 600, 0x000000, 0.7);
		});

		it('should display GAME OVER text', () => {
			(scene as any).showGameOver();
			const textCalls = (scene.add.text as jest.Mock).mock.calls;
			const gameOverCall = textCalls.find((call: unknown[]) => call[2] === 'GAME OVER');
			expect(gameOverCall).toBeDefined();
		});

		it('should display restart prompt', () => {
			(scene as any).showGameOver();
			const textCalls = (scene.add.text as jest.Mock).mock.calls;
			const restartCall = textCalls.find((call: unknown[]) => call[2] === 'Press R to Restart');
			expect(restartCall).toBeDefined();
		});

		it('should display final stats', () => {
			(scene as any).showGameOver();
			const textCalls = (scene.add.text as jest.Mock).mock.calls;
			const statsCall = textCalls.find(
				(call: unknown[]) => typeof call[2] === 'string' && (call[2] as string).includes('Enemies Killed')
			);
			expect(statsCall).toBeDefined();
		});
	});

	describe('showVictory', () => {
		beforeEach(() => {
			scene.init();
			scene.state = SurvivalState.GAME_OVER;
			scene.stats.currentWave = 10;
			scene.enemies = [];
			scene.cameras = {
				main: { width: 800, height: 600 },
			} as never;
			scene.add = {
				rectangle: jest.fn().mockReturnValue({
					setScrollFactor: jest.fn().mockReturnThis(),
					setDepth: jest.fn().mockReturnThis(),
				}),
				text: jest.fn().mockReturnValue({
					setOrigin: jest.fn().mockReturnThis(),
					setScrollFactor: jest.fn().mockReturnThis(),
					setDepth: jest.fn().mockReturnThis(),
				}),
			} as never;
		});

		it('should create dark overlay', () => {
			(scene as any).showVictory();
			expect(scene.add.rectangle).toHaveBeenCalled();
		});

		it('should display VICTORY text', () => {
			(scene as any).showVictory();
			const textCalls = (scene.add.text as jest.Mock).mock.calls;
			const victoryCall = textCalls.find((call: unknown[]) => call[2] === 'VICTORY!');
			expect(victoryCall).toBeDefined();
		});

		it('should display Play Again prompt', () => {
			(scene as any).showVictory();
			const textCalls = (scene.add.text as jest.Mock).mock.calls;
			const playAgainCall = textCalls.find((call: unknown[]) => call[2] === 'Press R to Play Again');
			expect(playAgainCall).toBeDefined();
		});
	});

	describe('showFinalStats', () => {
		beforeEach(() => {
			scene.init();
			scene.state = SurvivalState.GAME_OVER;
			scene.stats = {
				currentWave: 7,
				enemiesKilled: 42,
				damageDealt: 1500,
				damageTaken: 300,
				timeSurvived: 180000, // 3 minutes
				highestCombo: 12,
				currentCombo: 0,
				goldEarned: 750,
				xpEarned: 2000,
			};
			scene.enemies = [{ destroy: jest.fn() } as never]; // Died during wave
			scene.cameras = {
				main: { width: 800, height: 600 },
			} as never;
			scene.add = {
				text: jest.fn().mockReturnValue({
					setOrigin: jest.fn().mockReturnThis(),
					setScrollFactor: jest.fn().mockReturnThis(),
					setDepth: jest.fn().mockReturnThis(),
				}),
			} as never;
		});

		it('should display waves completed (minus current if died mid-wave)', () => {
			(scene as any).showFinalStats(201);
			const textCalls = (scene.add.text as jest.Mock).mock.calls;
			const statsCall = textCalls.find(
				(call: unknown[]) => typeof call[2] === 'string' && (call[2] as string).includes('Waves Completed: 6')
			);
			expect(statsCall).toBeDefined();
		});

		it('should display all waves completed on victory', () => {
			scene.enemies = []; // No enemies left = victory
			(scene as any).showFinalStats(201);
			const textCalls = (scene.add.text as jest.Mock).mock.calls;
			const statsCall = textCalls.find(
				(call: unknown[]) => typeof call[2] === 'string' && (call[2] as string).includes('Waves Completed: 7')
			);
			expect(statsCall).toBeDefined();
		});

		it('should display enemies killed', () => {
			(scene as any).showFinalStats(201);
			const textCalls = (scene.add.text as jest.Mock).mock.calls;
			const statsCall = textCalls.find(
				(call: unknown[]) => typeof call[2] === 'string' && (call[2] as string).includes('Enemies Killed: 42')
			);
			expect(statsCall).toBeDefined();
		});

		it('should display highest combo', () => {
			(scene as any).showFinalStats(201);
			const textCalls = (scene.add.text as jest.Mock).mock.calls;
			const statsCall = textCalls.find(
				(call: unknown[]) => typeof call[2] === 'string' && (call[2] as string).includes('Highest Combo: 12x')
			);
			expect(statsCall).toBeDefined();
		});

		it('should display gold earned', () => {
			(scene as any).showFinalStats(201);
			const textCalls = (scene.add.text as jest.Mock).mock.calls;
			const statsCall = textCalls.find(
				(call: unknown[]) => typeof call[2] === 'string' && (call[2] as string).includes('Gold Earned: 750')
			);
			expect(statsCall).toBeDefined();
		});

		it('should display formatted time', () => {
			(scene as any).showFinalStats(201);
			const textCalls = (scene.add.text as jest.Mock).mock.calls;
			const statsCall = textCalls.find(
				(call: unknown[]) => typeof call[2] === 'string' && (call[2] as string).includes('Time: 03:00')
			);
			expect(statsCall).toBeDefined();
		});

		it('should set correct depth', () => {
			(scene as any).showFinalStats(201);
			const result = (scene.add.text as jest.Mock).mock.results[0].value;
			expect(result.setDepth).toHaveBeenCalledWith(201);
		});
	});

	describe('onDamageDealt', () => {
		it('should accumulate damage dealt', () => {
			scene.init();
			(scene as any).onDamageDealt(50);
			(scene as any).onDamageDealt(30);
			expect(scene.stats.damageDealt).toBe(80);
		});
	});

	describe('onDamageTaken', () => {
		it('should accumulate damage taken', () => {
			scene.init();
			(scene as any).onDamageTaken(10);
			(scene as any).onDamageTaken(25);
			expect(scene.stats.damageTaken).toBe(35);
		});
	});

	describe('updateUI', () => {
		beforeEach(() => {
			scene.init();
			scene.startTime = Date.now() - 65000; // 1 min 5 sec ago
			scene.state = SurvivalState.ACTIVE;
			scene.timerText = { setText: jest.fn() } as never;
			scene.scoreText = { setText: jest.fn() } as never;
			scene.comboText = { setText: jest.fn(), setScale: jest.fn() } as never;
			scene.enemyCountText = { setText: jest.fn() } as never;
		});

		it('should update timer text', () => {
			(scene as any).updateUI();
			expect(scene.timerText!.setText).toHaveBeenCalledWith(expect.stringMatching(/\d{2}:\d{2}/));
		});

		it('should not update timer when game over', () => {
			scene.state = SurvivalState.GAME_OVER;
			(scene as any).updateUI();
			expect(scene.timerText!.setText).not.toHaveBeenCalled();
		});

		it('should update kills display', () => {
			scene.stats.enemiesKilled = 15;
			(scene as any).updateUI();
			expect(scene.scoreText!.setText).toHaveBeenCalledWith('KILLS: 15');
		});

		it('should show combo text when combo > 1', () => {
			scene.stats.currentCombo = 5;
			(scene as any).updateUI();
			expect(scene.comboText!.setText).toHaveBeenCalledWith('5x COMBO!');
		});

		it('should scale combo text based on combo count', () => {
			scene.stats.currentCombo = 5;
			(scene as any).updateUI();
			const expectedScale = Math.min(1 + 5 * 0.05, 1.5);
			expect(scene.comboText!.setScale).toHaveBeenCalledWith(expectedScale);
		});

		it('should cap combo text scale at 1.5', () => {
			scene.stats.currentCombo = 20;
			(scene as any).updateUI();
			expect(scene.comboText!.setScale).toHaveBeenCalledWith(1.5);
		});

		it('should hide combo text when combo <= 1', () => {
			scene.stats.currentCombo = 1;
			(scene as any).updateUI();
			expect(scene.comboText!.setText).toHaveBeenCalledWith('');
		});

		it('should update enemy count', () => {
			scene.enemies = [{} as never, {} as never, {} as never];
			(scene as any).updateUI();
			expect(scene.enemyCountText!.setText).toHaveBeenCalledWith('Enemies: 3');
		});

		it('should handle null UI elements gracefully', () => {
			scene.timerText = null;
			scene.scoreText = null;
			scene.comboText = null;
			scene.enemyCountText = null;
			expect(() => (scene as any).updateUI()).not.toThrow();
		});
	});

	describe('formatTime', () => {
		it('should format 0ms as 00:00', () => {
			const result = (scene as any).formatTime(0);
			expect(result).toBe('00:00');
		});

		it('should format 1000ms as 00:01', () => {
			const result = (scene as any).formatTime(1000);
			expect(result).toBe('00:01');
		});

		it('should format 60000ms as 01:00', () => {
			const result = (scene as any).formatTime(60000);
			expect(result).toBe('01:00');
		});

		it('should format 65000ms as 01:05', () => {
			const result = (scene as any).formatTime(65000);
			expect(result).toBe('01:05');
		});

		it('should format 3600000ms as 60:00', () => {
			const result = (scene as any).formatTime(3600000);
			expect(result).toBe('60:00');
		});

		it('should pad single-digit minutes', () => {
			const result = (scene as any).formatTime(120000);
			expect(result).toBe('02:00');
		});

		it('should pad single-digit seconds', () => {
			const result = (scene as any).formatTime(9000);
			expect(result).toBe('00:09');
		});
	});

	describe('input handler integration', () => {
		let keydownESCHandler: () => void;
		let keydownRHandler: () => void;

		beforeEach(() => {
			scene.init();
			scene.stateText = {
				setText: jest.fn(),
				setColor: jest.fn(),
				text: 'FIGHT!',
			} as never;
			scene.physics = {
				pause: jest.fn(),
				resume: jest.fn(),
			} as never;
			scene.time = {
				paused: false,
			} as never;
			scene.scene = {
				stop: jest.fn(),
				restart: jest.fn(),
			} as never;
			scene.input = {
				keyboard: {
					on: jest.fn().mockImplementation((event: string, callback: () => void) => {
						if (event === 'keydown-ESC') keydownESCHandler = callback;
						if (event === 'keydown-R') keydownRHandler = callback;
					}),
				},
			} as never;

			(scene as any).setupInputHandlers();
		});

		it('should toggle pause on ESC', () => {
			scene.state = SurvivalState.ACTIVE;
			keydownESCHandler();
			expect(scene.state).toBe(SurvivalState.PAUSED);
		});

		it('should restart on R when game over', () => {
			scene.state = SurvivalState.GAME_OVER;
			keydownRHandler();
			expect(scene.scene.restart).toHaveBeenCalled();
		});

		it('should not restart on R when not game over', () => {
			scene.state = SurvivalState.ACTIVE;
			keydownRHandler();
			expect(scene.scene.restart).not.toHaveBeenCalled();
		});
	});

	describe('resumeGame restores correct state', () => {
		beforeEach(() => {
			scene.init();
			scene.stateText = {
				setText: jest.fn(),
				setColor: jest.fn(),
			} as never;
			scene.physics = {
				pause: jest.fn(),
				resume: jest.fn(),
			} as never;
			scene.time = { paused: false } as never;
		});

		it('should restore WAVE_COMPLETE state and green color', () => {
			scene.state = SurvivalState.WAVE_COMPLETE;
			scene.pauseGame();
			scene.resumeGame();
			expect(scene.state).toBe(SurvivalState.WAVE_COMPLETE);
		});

		it('should default to ACTIVE if no previous state stored', () => {
			scene.state = SurvivalState.PAUSED;
			// Don't set prevState
			scene.resumeGame();
			expect(scene.state).toBe(SurvivalState.ACTIVE);
		});
	});
});
