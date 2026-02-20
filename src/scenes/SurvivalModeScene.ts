/**
 * @fileoverview Wave-based survival/horde mode gameplay
 *
 * This scene provides endless combat gameplay:
 * - 10 progressive enemy waves
 * - Combo system for chaining kills
 * - Stats tracking (kills, damage, time)
 * - Pause/resume functionality
 * - High score recording
 *
 * Separate from main story - arcade-style challenge mode.
 *
 * @see NeverquestBattleManager - Combat handling
 * @see Enemy - Spawned enemies
 * @see EnemiesSeedConfig - Enemy definitions
 *
 * @module scenes/SurvivalModeScene
 */

import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { NeverquestBattleManager } from '../plugins/NeverquestBattleManager';
import { AnimationNames } from '../consts/AnimationNames';
import { EnemiesSeedConfig } from '../consts/enemies/EnemiesSeedConfig';
import { NumericColors, Colors } from '../consts/Colors';
import { CameraValues } from '../consts/Numbers';

/**
 * Configuration for a wave of enemies
 */
export interface IWaveConfig {
	/** Wave number (1-indexed) */
	waveNumber: number;
	/** Array of enemy spawns for this wave */
	spawns: IWaveEnemySpawn[];
	/** Time before next wave starts (ms) */
	breakTime: number;
	/** Bonus gold/xp multiplier for this wave */
	rewardMultiplier: number;
}

/**
 * Configuration for an enemy spawn within a wave
 */
export interface IWaveEnemySpawn {
	/** Enemy type ID from EnemiesSeedConfig */
	enemyId: number;
	/** Number of this enemy type to spawn */
	count: number;
	/** Optional delay before spawning (ms) */
	spawnDelay?: number;
}

/**
 * Survival mode statistics
 */
export interface ISurvivalStats {
	/** Current wave number */
	currentWave: number;
	/** Total enemies killed */
	enemiesKilled: number;
	/** Total damage dealt */
	damageDealt: number;
	/** Total damage taken */
	damageTaken: number;
	/** Time survived in ms */
	timeSurvived: number;
	/** Highest combo achieved */
	highestCombo: number;
	/** Current combo count */
	currentCombo: number;
	/** Gold earned */
	goldEarned: number;
	/** XP earned */
	xpEarned: number;
}

/**
 * Survival mode state
 */
export enum SurvivalState {
	WAITING = 'waiting',
	ACTIVE = 'active',
	WAVE_COMPLETE = 'wave_complete',
	GAME_OVER = 'game_over',
	PAUSED = 'paused',
}

/**
 * Default wave configurations for survival mode
 * Each wave increases in difficulty with more/stronger enemies
 */
export const DEFAULT_WAVE_CONFIGS: IWaveConfig[] = [
	// Wave 1: Easy intro - just rats
	{
		waveNumber: 1,
		spawns: [{ enemyId: 1, count: 3 }], // 3 rats
		breakTime: 5000,
		rewardMultiplier: 1.0,
	},
	// Wave 2: More rats
	{
		waveNumber: 2,
		spawns: [{ enemyId: 1, count: 5 }], // 5 rats
		breakTime: 5000,
		rewardMultiplier: 1.1,
	},
	// Wave 3: Introduce bats
	{
		waveNumber: 3,
		spawns: [
			{ enemyId: 1, count: 4 }, // 4 rats
			{ enemyId: 2, count: 2, spawnDelay: 2000 }, // 2 bats after 2s
		],
		breakTime: 6000,
		rewardMultiplier: 1.2,
	},
	// Wave 4: Mixed enemies
	{
		waveNumber: 4,
		spawns: [
			{ enemyId: 1, count: 5 },
			{ enemyId: 2, count: 3 },
		],
		breakTime: 6000,
		rewardMultiplier: 1.3,
	},
	// Wave 5: Introduce ogre (mini-boss wave)
	{
		waveNumber: 5,
		spawns: [
			{ enemyId: 1, count: 4 },
			{ enemyId: 2, count: 2 },
			{ enemyId: 3, count: 1, spawnDelay: 3000 }, // Ogre after 3s
		],
		breakTime: 8000,
		rewardMultiplier: 1.5,
	},
	// Wave 6: Bandits join the fray
	{
		waveNumber: 6,
		spawns: [
			{ enemyId: 4, count: 4 }, // 4 bandits
			{ enemyId: 1, count: 3 },
		],
		breakTime: 6000,
		rewardMultiplier: 1.6,
	},
	// Wave 7: Wolves attack
	{
		waveNumber: 7,
		spawns: [
			{ enemyId: 5, count: 4 }, // 4 wolves
			{ enemyId: 4, count: 2 },
		],
		breakTime: 6000,
		rewardMultiplier: 1.7,
	},
	// Wave 8: Large mixed wave
	{
		waveNumber: 8,
		spawns: [
			{ enemyId: 1, count: 5 },
			{ enemyId: 2, count: 4 },
			{ enemyId: 4, count: 3, spawnDelay: 2000 },
			{ enemyId: 5, count: 2, spawnDelay: 4000 },
		],
		breakTime: 8000,
		rewardMultiplier: 1.8,
	},
	// Wave 9: Ogre assault
	{
		waveNumber: 9,
		spawns: [
			{ enemyId: 3, count: 2 }, // 2 ogres
			{ enemyId: 4, count: 4 },
			{ enemyId: 5, count: 3 },
		],
		breakTime: 10000,
		rewardMultiplier: 2.0,
	},
	// Wave 10: Boss wave - Shadow Scout
	{
		waveNumber: 10,
		spawns: [
			{ enemyId: 6, count: 1 }, // Shadow Scout elite
			{ enemyId: 5, count: 4, spawnDelay: 5000 }, // Wolf reinforcements
			{ enemyId: 4, count: 4, spawnDelay: 5000 }, // Bandit reinforcements
		],
		breakTime: 15000,
		rewardMultiplier: 3.0,
	},
];

/**
 * Arena bounds configuration
 */
export interface IArenaConfig {
	x: number;
	y: number;
	width: number;
	height: number;
}

const DEFAULT_ARENA: IArenaConfig = {
	x: 400,
	y: 300,
	width: 800,
	height: 600,
};

/**
 * SurvivalModeScene - Wave-based horde survival mode
 *
 * Features:
 * - Progressive wave difficulty
 * - Combo system for consecutive kills
 * - Statistics tracking
 * - Break time between waves for preparation
 * - Score multipliers based on performance
 *
 * @example
 * ```typescript
 * this.scene.start('SurvivalModeScene', {
 *   player: existingPlayer, // Optional - creates new if not provided
 *   startWave: 1,           // Optional - start from specific wave
 *   arenaConfig: {...},     // Optional - customize arena bounds
 * });
 * ```
 */
export class SurvivalModeScene extends Phaser.Scene {
	player: Player | null;
	enemies: Enemy[];
	battleManager: NeverquestBattleManager | null;
	state: SurvivalState;
	stats: ISurvivalStats;
	waveConfigs: IWaveConfig[];
	currentWaveConfig: IWaveConfig | null;
	arenaConfig: IArenaConfig;
	startTime: number;
	waveStartTime: number;
	comboTimer: Phaser.Time.TimerEvent | null;
	breakTimer: Phaser.Time.TimerEvent | null;
	spawnTimers: Phaser.Time.TimerEvent[];

	// UI Elements
	waveText: Phaser.GameObjects.Text | null;
	scoreText: Phaser.GameObjects.Text | null;
	comboText: Phaser.GameObjects.Text | null;
	timerText: Phaser.GameObjects.Text | null;
	stateText: Phaser.GameObjects.Text | null;
	enemyCountText: Phaser.GameObjects.Text | null;
	arenaBackground: Phaser.GameObjects.Rectangle | null;
	arenaBorder: Phaser.GameObjects.Rectangle | null;

	// Animation names helper
	animationNames: AnimationNames;

	constructor() {
		super({
			key: 'SurvivalModeScene',
		});

		this.player = null;
		this.enemies = [];
		this.battleManager = null;
		this.state = SurvivalState.WAITING;
		this.stats = this.createInitialStats();
		this.waveConfigs = DEFAULT_WAVE_CONFIGS;
		this.currentWaveConfig = null;
		this.arenaConfig = DEFAULT_ARENA;
		this.startTime = 0;
		this.waveStartTime = 0;
		this.comboTimer = null;
		this.breakTimer = null;
		this.spawnTimers = [];

		// UI
		this.waveText = null;
		this.scoreText = null;
		this.comboText = null;
		this.timerText = null;
		this.stateText = null;
		this.enemyCountText = null;
		this.arenaBackground = null;
		this.arenaBorder = null;

		this.animationNames = new AnimationNames();
	}

	/**
	 * Creates the initial stats object
	 */
	private createInitialStats(): ISurvivalStats {
		return {
			currentWave: 0,
			enemiesKilled: 0,
			damageDealt: 0,
			damageTaken: 0,
			timeSurvived: 0,
			highestCombo: 0,
			currentCombo: 0,
			goldEarned: 0,
			xpEarned: 0,
		};
	}

	/**
	 * Scene initialization
	 */
	init(data?: {
		player?: Player;
		startWave?: number;
		arenaConfig?: IArenaConfig;
		waveConfigs?: IWaveConfig[];
	}): void {
		// Reset state
		this.state = SurvivalState.WAITING;
		this.stats = this.createInitialStats();
		this.enemies = [];
		this.spawnTimers = [];

		// Apply configuration from data
		if (data?.arenaConfig) {
			this.arenaConfig = data.arenaConfig;
		} else {
			this.arenaConfig = DEFAULT_ARENA;
		}

		if (data?.waveConfigs) {
			this.waveConfigs = data.waveConfigs;
		} else {
			this.waveConfigs = DEFAULT_WAVE_CONFIGS;
		}

		// Handle start wave
		if (data?.startWave && data.startWave > 0) {
			this.stats.currentWave = data.startWave - 1; // Will be incremented when first wave starts
		}
	}

	/**
	 * Creates the scene
	 */
	create(): void {
		this.startTime = Date.now();

		// Set up camera
		this.cameras.main.setZoom(CameraValues.ZOOM_NORMAL);
		this.cameras.main.setBackgroundColor(NumericColors.GRAY_VERY_DARK);

		// Create arena
		this.createArena();

		// Create player in center of arena
		this.createPlayer();

		// Create UI
		this.createUI();

		// Set up battle manager
		this.setupBattleManager();

		// Set up input handlers
		this.setupInputHandlers();

		// Launch HUD
		this.scene.launch('HUDScene', { player: this.player });

		// Launch Joystick for mobile
		this.scene.launch('JoystickScene', { player: this.player });

		// Start the first wave after a short delay
		this.time.delayedCall(2000, () => {
			this.startNextWave();
		});

		// Update UI every frame
		this.events.on('update', this.updateUI, this);
	}

	/**
	 * Creates the arena background and borders
	 */
	private createArena(): void {
		const { x, y, width, height } = this.arenaConfig;

		// Background
		this.arenaBackground = this.add.rectangle(x, y, width, height, NumericColors.GRAY_DARK, 0.8);
		this.arenaBackground.setDepth(-10);

		// Border
		this.arenaBorder = this.add.rectangle(x, y, width, height);
		this.arenaBorder.setStrokeStyle(4, NumericColors.PURPLE_DARK);
		this.arenaBorder.setDepth(-9);

		// Create invisible physics walls at arena boundaries
		const wallThickness = 20;
		const halfWidth = width / 2;
		const halfHeight = height / 2;

		// Top wall
		const topWall = this.add.rectangle(
			x,
			y - halfHeight - wallThickness / 2,
			width + wallThickness * 2,
			wallThickness
		);
		this.physics.add.existing(topWall, true);

		// Bottom wall
		const bottomWall = this.add.rectangle(
			x,
			y + halfHeight + wallThickness / 2,
			width + wallThickness * 2,
			wallThickness
		);
		this.physics.add.existing(bottomWall, true);

		// Left wall
		const leftWall = this.add.rectangle(
			x - halfWidth - wallThickness / 2,
			y,
			wallThickness,
			height + wallThickness * 2
		);
		this.physics.add.existing(leftWall, true);

		// Right wall
		const rightWall = this.add.rectangle(
			x + halfWidth + wallThickness / 2,
			y,
			wallThickness,
			height + wallThickness * 2
		);
		this.physics.add.existing(rightWall, true);

		// Store walls for collision
		const walls = this.add.group([topWall, bottomWall, leftWall, rightWall]);
		(this as unknown as { arenaWalls: Phaser.GameObjects.Group }).arenaWalls = walls;
	}

	/**
	 * Creates the player in the arena center
	 */
	private createPlayer(): void {
		const { x, y } = this.arenaConfig;

		this.player = new Player(this, x, y, 'player');
		this.player.container.setDepth(10);

		// Set up player collision with arena walls
		const walls = (this as unknown as { arenaWalls: Phaser.GameObjects.Group }).arenaWalls;
		if (walls) {
			this.physics.add.collider(this.player.container, walls);
		}

		// Camera follows player
		this.cameras.main.startFollow(this.player.container, true, 0.1, 0.1);
	}

	/**
	 * Creates the survival mode UI
	 */
	private createUI(): void {
		const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
			fontFamily: 'Arial',
			fontSize: '20px',
			color: Colors.WHITE,
		};

		const headerStyle: Phaser.Types.GameObjects.Text.TextStyle = {
			fontFamily: 'Arial',
			fontSize: '28px',
			color: Colors.YELLOW,
			fontStyle: 'bold',
		};

		// Wave indicator (top center)
		this.waveText = this.add.text(this.cameras.main.width / 2, 30, 'WAVE 1', headerStyle);
		this.waveText.setOrigin(0.5, 0);
		this.waveText.setScrollFactor(0);
		this.waveText.setDepth(100);

		// State indicator (below wave)
		this.stateText = this.add.text(this.cameras.main.width / 2, 65, 'GET READY!', {
			...textStyle,
			color: Colors.GREEN,
		});
		this.stateText.setOrigin(0.5, 0);
		this.stateText.setScrollFactor(0);
		this.stateText.setDepth(100);

		// Timer (top right)
		this.timerText = this.add.text(this.cameras.main.width - 20, 30, '00:00', textStyle);
		this.timerText.setOrigin(1, 0);
		this.timerText.setScrollFactor(0);
		this.timerText.setDepth(100);

		// Enemy count (below timer)
		this.enemyCountText = this.add.text(this.cameras.main.width - 20, 55, 'Enemies: 0', textStyle);
		this.enemyCountText.setOrigin(1, 0);
		this.enemyCountText.setScrollFactor(0);
		this.enemyCountText.setDepth(100);

		// Score (top left)
		this.scoreText = this.add.text(20, 30, 'KILLS: 0', textStyle);
		this.scoreText.setScrollFactor(0);
		this.scoreText.setDepth(100);

		// Combo counter (top left, below score)
		this.comboText = this.add.text(20, 55, '', {
			...textStyle,
			color: Colors.ORANGE,
			fontSize: '24px',
		});
		this.comboText.setScrollFactor(0);
		this.comboText.setDepth(100);
	}

	/**
	 * Sets up the battle manager
	 */
	private setupBattleManager(): void {
		this.battleManager = new NeverquestBattleManager();

		// Listen for enemy deaths
		this.events.on('enemyDeath', this.onEnemyDeath, this);
		this.events.on('playerDeath', this.onPlayerDeath, this);
		this.events.on('damageDealt', this.onDamageDealt, this);
		this.events.on('damageTaken', this.onDamageTaken, this);
	}

	/**
	 * Sets up input handlers
	 */
	private setupInputHandlers(): void {
		// Pause on Escape
		this.input.keyboard?.on('keydown-ESC', () => {
			this.togglePause();
		});

		// Restart on R (when game over)
		this.input.keyboard?.on('keydown-R', () => {
			if (this.state === SurvivalState.GAME_OVER) {
				this.restartGame();
			}
		});
	}

	/**
	 * Starts the next wave
	 */
	startNextWave(): void {
		this.stats.currentWave++;

		// Check if we've completed all waves
		if (this.stats.currentWave > this.waveConfigs.length) {
			this.onVictory();
			return;
		}

		this.currentWaveConfig = this.waveConfigs[this.stats.currentWave - 1];
		this.state = SurvivalState.ACTIVE;
		this.waveStartTime = Date.now();

		// Update wave display
		if (this.waveText) {
			this.waveText.setText(`WAVE ${this.stats.currentWave}`);
		}
		if (this.stateText) {
			this.stateText.setText('FIGHT!');
			this.stateText.setColor(Colors.RED);
		}

		// Flash effect
		this.cameras.main.flash(500, 255, 255, 0);

		// Spawn enemies for this wave
		this.spawnWaveEnemies(this.currentWaveConfig);
	}

	/**
	 * Spawns enemies according to wave configuration
	 */
	private spawnWaveEnemies(waveConfig: IWaveConfig): void {
		waveConfig.spawns.forEach((spawn) => {
			const spawnEnemies = () => {
				for (let i = 0; i < spawn.count; i++) {
					// Slight delay between individual enemy spawns
					this.time.delayedCall(i * 200, () => {
						this.spawnEnemy(spawn.enemyId);
					});
				}
			};

			if (spawn.spawnDelay && spawn.spawnDelay > 0) {
				const timer = this.time.delayedCall(spawn.spawnDelay, spawnEnemies);
				this.spawnTimers.push(timer);
			} else {
				spawnEnemies();
			}
		});
	}

	/**
	 * Spawns a single enemy at a random edge position
	 */
	private spawnEnemy(enemyId: number): void {
		if (this.state !== SurvivalState.ACTIVE) return;

		const enemyConfig = EnemiesSeedConfig.find((e) => e.id === enemyId);
		if (!enemyConfig) {
			console.warn(`[SurvivalMode] Enemy ID ${enemyId} not found`);
			return;
		}

		// Get spawn position at arena edge
		const spawnPos = this.getRandomEdgePosition();

		// Create enemy
		const enemy = new Enemy(this, spawnPos.x, spawnPos.y, enemyConfig.texture, enemyId);

		// Play idle animation
		const idleAnim = `${enemyConfig.texture}-${this.animationNames.idlePrefixAnimation}-${this.animationNames.downAnimationSufix}`;
		try {
			enemy.anims.play(idleAnim);
		} catch {
			// Animation may not exist
		}

		// Add to enemies array
		this.enemies.push(enemy);

		// Set up collision with player
		if (this.player) {
			this.physics.add.overlap(enemy.hitZone, this.player.hitZone);
		}

		// Spawn effect
		enemy.setAlpha(0);
		this.tweens.add({
			targets: enemy,
			alpha: 1,
			duration: 300,
			ease: 'Power2',
		});
	}

	/**
	 * Gets a random position at the edge of the arena
	 */
	private getRandomEdgePosition(): { x: number; y: number } {
		const { x, y, width, height } = this.arenaConfig;
		const padding = 50;
		const edge = Phaser.Math.Between(0, 3);

		switch (edge) {
			case 0: // Top
				return {
					x: Phaser.Math.Between(x - width / 2 + padding, x + width / 2 - padding),
					y: y - height / 2 + padding,
				};
			case 1: // Bottom
				return {
					x: Phaser.Math.Between(x - width / 2 + padding, x + width / 2 - padding),
					y: y + height / 2 - padding,
				};
			case 2: // Left
				return {
					x: x - width / 2 + padding,
					y: Phaser.Math.Between(y - height / 2 + padding, y + height / 2 - padding),
				};
			default: // Right
				return {
					x: x + width / 2 - padding,
					y: Phaser.Math.Between(y - height / 2 + padding, y + height / 2 - padding),
				};
		}
	}

	/**
	 * Called when an enemy dies
	 */
	private onEnemyDeath(enemy: Enemy): void {
		this.stats.enemiesKilled++;

		// Increment combo
		this.stats.currentCombo++;
		if (this.stats.currentCombo > this.stats.highestCombo) {
			this.stats.highestCombo = this.stats.currentCombo;
		}

		// Reset combo timer
		if (this.comboTimer) {
			this.comboTimer.destroy();
		}
		this.comboTimer = this.time.delayedCall(3000, () => {
			this.stats.currentCombo = 0;
		});

		// Award gold and XP based on enemy and wave multiplier
		const multiplier = this.currentWaveConfig?.rewardMultiplier || 1.0;
		const baseGold = enemy.exp || 10;
		const baseXp = enemy.exp || 20;

		this.stats.goldEarned += Math.floor(baseGold * multiplier * (1 + this.stats.currentCombo * 0.1));
		this.stats.xpEarned += Math.floor(baseXp * multiplier * (1 + this.stats.currentCombo * 0.1));

		// Remove from enemies array
		const index = this.enemies.indexOf(enemy);
		if (index > -1) {
			this.enemies.splice(index, 1);
		}

		// Check if wave is complete
		this.checkWaveComplete();
	}

	/**
	 * Checks if current wave is complete
	 */
	private checkWaveComplete(): void {
		// Wave is complete when no enemies remain and all spawn timers have finished
		const activeSpawnTimers = this.spawnTimers.filter((t) => !t.hasDispatched);

		if (this.enemies.length === 0 && activeSpawnTimers.length === 0 && this.state === SurvivalState.ACTIVE) {
			this.onWaveComplete();
		}
	}

	/**
	 * Called when a wave is completed
	 */
	private onWaveComplete(): void {
		this.state = SurvivalState.WAVE_COMPLETE;

		if (this.stateText) {
			this.stateText.setText('WAVE COMPLETE!');
			this.stateText.setColor(Colors.GREEN);
		}

		// Clear spawn timers
		this.spawnTimers.forEach((t) => t.destroy());
		this.spawnTimers = [];

		// Flash effect
		this.cameras.main.flash(500, 0, 255, 0);

		// Start break timer
		const breakTime = this.currentWaveConfig?.breakTime || 5000;
		this.breakTimer = this.time.delayedCall(breakTime, () => {
			this.startNextWave();
		});

		// Show countdown during break
		this.showBreakCountdown(breakTime);
	}

	/**
	 * Shows countdown during wave break
	 */
	private showBreakCountdown(breakTime: number): void {
		const seconds = Math.ceil(breakTime / 1000);
		let remaining = seconds;

		const updateCountdown = () => {
			if (this.state !== SurvivalState.WAVE_COMPLETE) return;

			if (this.stateText) {
				this.stateText.setText(`NEXT WAVE IN ${remaining}...`);
			}

			remaining--;
			if (remaining > 0) {
				this.time.delayedCall(1000, updateCountdown);
			}
		};

		updateCountdown();
	}

	/**
	 * Called when the player dies
	 */
	private onPlayerDeath(): void {
		this.state = SurvivalState.GAME_OVER;
		this.stats.timeSurvived = Date.now() - this.startTime;

		// Clear all timers
		if (this.comboTimer) this.comboTimer.destroy();
		if (this.breakTimer) this.breakTimer.destroy();
		this.spawnTimers.forEach((t) => t.destroy());

		// Stop all enemies
		this.enemies.forEach((enemy) => {
			if (enemy.body) {
				(enemy.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
			}
		});

		// Show game over
		this.showGameOver();
	}

	/**
	 * Called when player completes all waves (victory)
	 */
	private onVictory(): void {
		this.state = SurvivalState.GAME_OVER;
		this.stats.timeSurvived = Date.now() - this.startTime;

		// Show victory screen
		this.showVictory();
	}

	/**
	 * Shows the game over screen
	 */
	private showGameOver(): void {
		const overlay = this.add.rectangle(
			this.cameras.main.width / 2,
			this.cameras.main.height / 2,
			this.cameras.main.width,
			this.cameras.main.height,
			0x000000,
			0.7
		);
		overlay.setScrollFactor(0);
		overlay.setDepth(200);

		const gameOverText = this.add.text(
			this.cameras.main.width / 2,
			this.cameras.main.height / 2 - 100,
			'GAME OVER',
			{
				fontFamily: 'Arial',
				fontSize: '48px',
				color: Colors.RED,
				fontStyle: 'bold',
			}
		);
		gameOverText.setOrigin(0.5);
		gameOverText.setScrollFactor(0);
		gameOverText.setDepth(201);

		this.showFinalStats(201);

		const restartText = this.add.text(
			this.cameras.main.width / 2,
			this.cameras.main.height / 2 + 150,
			'Press R to Restart',
			{
				fontFamily: 'Arial',
				fontSize: '24px',
				color: Colors.WHITE,
			}
		);
		restartText.setOrigin(0.5);
		restartText.setScrollFactor(0);
		restartText.setDepth(201);
	}

	/**
	 * Shows the victory screen
	 */
	private showVictory(): void {
		const overlay = this.add.rectangle(
			this.cameras.main.width / 2,
			this.cameras.main.height / 2,
			this.cameras.main.width,
			this.cameras.main.height,
			0x000000,
			0.7
		);
		overlay.setScrollFactor(0);
		overlay.setDepth(200);

		const victoryText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 - 100, 'VICTORY!', {
			fontFamily: 'Arial',
			fontSize: '48px',
			color: Colors.GOLD,
			fontStyle: 'bold',
		});
		victoryText.setOrigin(0.5);
		victoryText.setScrollFactor(0);
		victoryText.setDepth(201);

		this.showFinalStats(201);

		const restartText = this.add.text(
			this.cameras.main.width / 2,
			this.cameras.main.height / 2 + 150,
			'Press R to Play Again',
			{
				fontFamily: 'Arial',
				fontSize: '24px',
				color: Colors.WHITE,
			}
		);
		restartText.setOrigin(0.5);
		restartText.setScrollFactor(0);
		restartText.setDepth(201);
	}

	/**
	 * Shows final statistics
	 */
	private showFinalStats(depth: number): void {
		const stats = [
			`Waves Completed: ${this.stats.currentWave - (this.state === SurvivalState.GAME_OVER && this.enemies.length > 0 ? 1 : 0)}`,
			`Enemies Killed: ${this.stats.enemiesKilled}`,
			`Highest Combo: ${this.stats.highestCombo}x`,
			`Time: ${this.formatTime(this.stats.timeSurvived)}`,
			`Gold Earned: ${this.stats.goldEarned}`,
			`XP Earned: ${this.stats.xpEarned}`,
		];

		const statsText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, stats.join('\n'), {
			fontFamily: 'Arial',
			fontSize: '18px',
			color: Colors.WHITE,
			align: 'center',
			lineSpacing: 8,
		});
		statsText.setOrigin(0.5);
		statsText.setScrollFactor(0);
		statsText.setDepth(depth);
	}

	/**
	 * Toggles pause state
	 */
	togglePause(): void {
		if (this.state === SurvivalState.GAME_OVER) return;

		if (this.state === SurvivalState.PAUSED) {
			this.resumeGame();
		} else {
			this.pauseGame();
		}
	}

	/**
	 * Pauses the game
	 */
	pauseGame(): void {
		const prevState = this.state;
		this.state = SurvivalState.PAUSED;
		this.physics.pause();

		// Pause all timers
		this.time.paused = true;

		if (this.stateText) {
			(this.stateText as unknown as { prevText: string }).prevText = this.stateText.text;
			this.stateText.setText('PAUSED');
			this.stateText.setColor(Colors.CYAN);
		}

		// Store previous state for resume
		(this as unknown as { prevState: SurvivalState }).prevState = prevState;
	}

	/**
	 * Resumes the game
	 */
	resumeGame(): void {
		const prevState = (this as unknown as { prevState: SurvivalState }).prevState || SurvivalState.ACTIVE;
		this.state = prevState;
		this.physics.resume();
		this.time.paused = false;

		if (this.stateText) {
			const prevText = (this.stateText as unknown as { prevText: string }).prevText;
			this.stateText.setText(prevText || 'FIGHT!');
			this.stateText.setColor(prevState === SurvivalState.WAVE_COMPLETE ? Colors.GREEN : Colors.RED);
		}
	}

	/**
	 * Restarts the game
	 */
	restartGame(): void {
		// Stop all active scenes
		this.scene.stop('HUDScene');
		this.scene.stop('JoystickScene');

		// Restart this scene
		this.scene.restart();
	}

	/**
	 * Called when damage is dealt
	 */
	private onDamageDealt(amount: number): void {
		this.stats.damageDealt += amount;
	}

	/**
	 * Called when damage is taken
	 */
	private onDamageTaken(amount: number): void {
		this.stats.damageTaken += amount;
	}

	/**
	 * Updates UI elements
	 */
	private updateUI(): void {
		// Update timer
		if (this.timerText && this.state !== SurvivalState.GAME_OVER) {
			const elapsed = Date.now() - this.startTime;
			this.timerText.setText(this.formatTime(elapsed));
		}

		// Update score
		if (this.scoreText) {
			this.scoreText.setText(`KILLS: ${this.stats.enemiesKilled}`);
		}

		// Update combo
		if (this.comboText) {
			if (this.stats.currentCombo > 1) {
				this.comboText.setText(`${this.stats.currentCombo}x COMBO!`);
				// Scale effect based on combo
				const scale = Math.min(1 + this.stats.currentCombo * 0.05, 1.5);
				this.comboText.setScale(scale);
			} else {
				this.comboText.setText('');
			}
		}

		// Update enemy count
		if (this.enemyCountText) {
			this.enemyCountText.setText(`Enemies: ${this.enemies.length}`);
		}
	}

	/**
	 * Formats milliseconds as MM:SS
	 */
	private formatTime(ms: number): string {
		const totalSeconds = Math.floor(ms / 1000);
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;
		return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
	}

	/**
	 * Gets current survival stats
	 */
	getStats(): ISurvivalStats {
		return { ...this.stats };
	}

	/**
	 * Gets the current state
	 */
	getState(): SurvivalState {
		return this.state;
	}

	/**
	 * Scene update loop
	 */
	update(time: number, delta: number): void {
		if (this.state === SurvivalState.PAUSED || this.state === SurvivalState.GAME_OVER) {
			return;
		}

		// Update player
		this.player?.update(time, delta);

		// Update enemies
		this.enemies.forEach((enemy) => {
			enemy.update(time, delta);
		});
	}

	/**
	 * Cleanup when scene shuts down
	 */
	shutdown(): void {
		this.events.off('update', this.updateUI, this);
		this.events.off('enemyDeath', this.onEnemyDeath, this);
		this.events.off('playerDeath', this.onPlayerDeath, this);
		this.events.off('damageDealt', this.onDamageDealt, this);
		this.events.off('damageTaken', this.onDamageTaken, this);

		// Clear timers
		if (this.comboTimer) this.comboTimer.destroy();
		if (this.breakTimer) this.breakTimer.destroy();
		this.spawnTimers.forEach((t) => t.destroy());

		// Destroy enemies
		this.enemies.forEach((enemy) => enemy.destroy());
		this.enemies = [];
	}
}
