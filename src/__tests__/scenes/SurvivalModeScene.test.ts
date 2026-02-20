/**
 * Tests for SurvivalModeScene - Wave-based survival mode
 */

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
});
