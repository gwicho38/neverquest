/**
 * @fileoverview Terminal-based game for CLI gameplay
 *
 * This file provides a text-mode roguelike game experience:
 * - ASCII/emoji-based rendering via blessed library
 * - Player movement, combat, and blocking mechanics
 * - Enemy AI with perception and pathfinding
 * - Overworld map generation with houses, water, trees
 *
 * Run with: npm run terminal
 *
 * @see TerminalRenderer - UI rendering system
 * @see TerminalMap - Map generation and tile management
 * @see TerminalEntity - Entity representation
 *
 * @module terminal/TerminalGame
 */

import { EntityAttributes, IEntityAttributes } from '../entities/EntityAttributes';
import { TerminalEntity } from './entities/TerminalEntity';
import { TerminalMap } from './TerminalMap';
import { TerminalRenderer } from './TerminalRenderer';
import { AnimationTiming, SpecialNumbers } from '../consts/Numbers';
import { TerminalMessages, GameMessages } from '../consts/Messages';
import { EnemyTypes, PlayerConfig } from '../consts/TerminalConfig';

/**
 * Main Terminal Game class
 */
export class TerminalGame {
	private renderer: TerminalRenderer;
	private map: TerminalMap;
	private player: TerminalEntity;
	private enemies: TerminalEntity[] = [];
	private running: boolean = false;
	private tickRate: number = AnimationTiming.TERMINAL_GAME_TICK_RATE;
	private lastTick: number = Date.now();
	private gameLoopInterval?: ReturnType<typeof setInterval>;

	// View settings
	private viewWidth: number = 60;
	private viewHeight: number = 30;

	constructor(debug: boolean = false) {
		this.renderer = new TerminalRenderer(debug);
		this.map = new TerminalMap(80, 40);
		this.map.generateOverworld();

		// Create player
		const spawnPos = this.map.findSpawnPosition();
		const playerAttrs: IEntityAttributes = { ...EntityAttributes };
		playerAttrs.health = 100;
		playerAttrs.maxHealth = 100;
		playerAttrs.atack = 10;
		playerAttrs.defense = 5;

		this.player = new TerminalEntity(
			spawnPos.x,
			spawnPos.y,
			PlayerConfig.SYMBOL,
			PlayerConfig.COLOR,
			playerAttrs,
			PlayerConfig.NAME
		);
		this.player.isPlayer = true;
		this.map.addEntity(this.player);

		// Spawn some enemies
		this.spawnEnemies(5);

		// Set up input handlers
		this.setupInput();

		// Initial render
		this.render();

		// Log welcome message
		this.renderer.log(TerminalMessages.WELCOME);
		this.renderer.log(TerminalMessages.CONTROLS_INFO);
		this.renderer.log(TerminalMessages.QUEST_BEGIN);
		this.renderer.log('');
		this.renderer.log(TerminalMessages.PLAYER_MARKER);
	}

	/**
	 * Set up input handling
	 */
	private setupInput(): void {
		// Movement keys
		const moveKeys: Record<string, { dx: number; dy: number }> = {
			up: { dx: 0, dy: -1 },
			down: { dx: 0, dy: 1 },
			left: { dx: -1, dy: 0 },
			right: { dx: 1, dy: 0 },
			w: { dx: 0, dy: -1 },
			s: { dx: 0, dy: 1 },
			a: { dx: -1, dy: 0 },
			d: { dx: 1, dy: 0 },
		};

		Object.entries(moveKeys).forEach(([key, delta]) => {
			this.renderer.screen.key([key], () => {
				this.movePlayer(delta.dx, delta.dy);
			});
		});

		// Attack keys (Space or J)
		this.renderer.screen.key(['space', 'j'], () => {
			this.attackNearby();
		});

		// Block/Defend keys (B or K)
		this.renderer.screen.key(['b', 'k'], () => {
			this.blockAction();
		});

		// Help key
		this.renderer.screen.key(['h'], () => {
			this.showHelp();
		});
	}

	/**
	 * Move player
	 */
	private movePlayer(dx: number, dy: number): void {
		const newX = this.player.x + dx;
		const newY = this.player.y + dy;

		if (this.map.isWalkable(newX, newY)) {
			const entityAt = this.map.getEntityAt(newX, newY);
			if (!entityAt) {
				this.player.move(dx, dy);
				this.render();

				// Additional renders to show walking animation
				setTimeout(() => this.render(), AnimationTiming.TERMINAL_WALK_ANIMATION_STEP_1);
				setTimeout(() => this.render(), AnimationTiming.TERMINAL_WALK_ANIMATION_STEP_2);
				setTimeout(() => this.render(), AnimationTiming.TERMINAL_WALK_ANIMATION_STEP_3);
			} else {
				this.renderer.log(GameMessages.ENTITY_IN_WAY(entityAt.entityName), 'yellow');
			}
		} else {
			this.renderer.log(GameMessages.BUMP_INTO_WALL, 'red');
		}
	}

	/**
	 * Attack nearby enemies
	 */
	private async attackNearby(): Promise<void> {
		const adjacentPositions = [
			{ dx: 0, dy: -1 },
			{ dx: 0, dy: 1 },
			{ dx: -1, dy: 0 },
			{ dx: 1, dy: 0 },
		];

		for (const pos of adjacentPositions) {
			const x = this.player.x + pos.dx;
			const y = this.player.y + pos.dy;
			const entity = this.map.getEntityAt(x, y);

			if (entity && entity !== this.player) {
				const damage = this.player.attributes.atack;

				// Play attack animation
				await this.map.animator.animateAttack(this.player.x, this.player.y, entity.x, entity.y, () =>
					this.render()
				);

				entity.takeDamage(damage);

				// Show damage number animation
				await this.map.animator.animateDamage(entity.x, entity.y, damage, () => this.render());

				this.renderer.log(TerminalMessages.ATTACK_MESSAGE(entity.symbol, entity.entityName, damage));

				if (!entity.isAlive()) {
					// Death animation
					await this.map.animator.animateDeath(entity.x, entity.y, () => this.render());

					this.renderer.log(TerminalMessages.ENEMY_DEFEATED_MESSAGE(entity.entityName));
					this.map.removeEntity(entity);
					const index = this.enemies.indexOf(entity);
					if (index > -1) {
						this.enemies.splice(index, 1);
					}
					this.player.attributes.experience += 10;

					// Victory particle burst
					await this.map.animator.animateParticleBurst(entity.x, entity.y, () => this.render());
				} else {
					const healthPercent = Math.floor((entity.attributes.health / entity.attributes.maxHealth) * 100);
					this.renderer.log(TerminalMessages.ENEMY_HP_REMAINING(entity.entityName, healthPercent));
				}

				this.render();
				return;
			}
		}

		this.renderer.log(GameMessages.NO_ENEMIES_NEARBY, 'yellow');
	}

	/**
	 * Block/Defend action
	 */
	private async blockAction(): Promise<void> {
		// Temporarily boost defense
		const defenseBoost = 5;
		this.player.attributes.defense += defenseBoost;

		// Show block animation
		await this.map.animator.animateBlock(this.player.x, this.player.y, () => this.render());

		this.renderer.log(TerminalMessages.SHIELD_RAISED_MESSAGE(defenseBoost));

		// Reset defense after a short time (simulated turn)
		setTimeout(() => {
			this.player.attributes.defense -= defenseBoost;
			this.renderer.log(TerminalMessages.SHIELD_LOWERED_MESSAGE);
			this.render();
		}, AnimationTiming.BLOCK_DURATION);

		this.render();
	}

	/**
	 * Spawn enemies
	 */
	private spawnEnemies(count: number): void {
		for (let i = 0; i < count; i++) {
			const type = EnemyTypes[Math.floor(Math.random() * EnemyTypes.length)];
			let x, y;
			let attempts = 0;

			// Find a valid spawn position
			do {
				x = Math.floor(Math.random() * this.map.width);
				y = Math.floor(Math.random() * this.map.height);
				attempts++;
			} while (attempts < 100 && (!this.map.isWalkable(x, y) || this.map.getEntityAt(x, y)));

			if (attempts < 100) {
				const enemyAttrs: IEntityAttributes = { ...EntityAttributes };
				enemyAttrs.health = type.health;
				enemyAttrs.maxHealth = type.health;
				enemyAttrs.atack = type.attack;

				const enemy = new TerminalEntity(x, y, type.symbol, type.color, enemyAttrs, type.name);
				this.map.addEntity(enemy);
				this.enemies.push(enemy);
			}
		}
	}

	/**
	 * Show help
	 */
	private showHelp(): void {
		this.renderer.log(TerminalMessages.HELP_HEADER);
		this.renderer.log(TerminalMessages.HELP_MOVE);
		this.renderer.log(TerminalMessages.HELP_ATTACK);
		this.renderer.log(TerminalMessages.HELP_BLOCK);
		this.renderer.log(TerminalMessages.HELP_HELP);
		this.renderer.log(TerminalMessages.HELP_QUIT);
		this.renderer.log('');
		this.renderer.log(TerminalMessages.HELP_ELEMENTS_HEADER);
		this.renderer.log(TerminalMessages.HELP_PLAYER);
		this.renderer.log(TerminalMessages.HELP_MONSTERS);
		this.renderer.log(TerminalMessages.HELP_TERRAIN);
		this.renderer.log(TerminalMessages.HELP_ITEMS);
		this.renderer.log('');
		this.renderer.log(TerminalMessages.HELP_NEW_FEATURES);
	}

	/**
	 * Update game status display
	 */
	private updateStatus(): void {
		const healthBar = this.createHealthBar(this.player.attributes.health, this.player.attributes.maxHealth);
		const xpBar = this.createXPBar(this.player.attributes.experience, this.player.attributes.nextLevelExperience);

		const status = [
			TerminalMessages.STATUS_PLAYER_HEADER,
			'',
			TerminalMessages.STATUS_HP_LABEL(healthBar),
			TerminalMessages.STATUS_HP_VALUES(this.player.attributes.health, this.player.attributes.maxHealth),
			'',
			TerminalMessages.STATUS_LEVEL(this.player.attributes.level),
			TerminalMessages.STATUS_XP(xpBar),
			TerminalMessages.STATUS_XP_VALUES(
				this.player.attributes.experience,
				this.player.attributes.nextLevelExperience
			),
			'',
			TerminalMessages.STATUS_STATS_HEADER,
			TerminalMessages.STATUS_STR(this.player.attributes.rawAttributes.str),
			TerminalMessages.STATUS_AGI(this.player.attributes.rawAttributes.agi),
			TerminalMessages.STATUS_VIT(this.player.attributes.rawAttributes.vit),
			TerminalMessages.STATUS_DEX(this.player.attributes.rawAttributes.dex),
			TerminalMessages.STATUS_INT(this.player.attributes.rawAttributes.int),
			'',
			TerminalMessages.STATUS_ATK(this.player.attributes.atack),
			TerminalMessages.STATUS_DEF(this.player.attributes.defense),
			'',
			TerminalMessages.STATUS_ENEMIES_HEADER,
			TerminalMessages.STATUS_ENEMIES_REMAINING(this.enemies.length),
			'',
			TerminalMessages.STATUS_POSITION(this.player.x, this.player.y),
		].join('\n');

		this.renderer.updateStatus(status);
	}

	/**
	 * Create a health bar visualization
	 */
	private createHealthBar(current: number, max: number): string {
		const barLength = 10;
		const filled = Math.floor((current / max) * barLength);
		const empty = barLength - filled;
		return `{red-fg}${'█'.repeat(filled)}{/red-fg}{grey-fg}${'░'.repeat(empty)}{/grey-fg}`;
	}

	/**
	 * Create an XP bar visualization
	 */
	private createXPBar(current: number, max: number): string {
		const barLength = 10;
		const filled = Math.floor((current / max) * barLength);
		const empty = barLength - filled;
		return `{green-fg}${'█'.repeat(filled)}{/green-fg}{grey-fg}${'░'.repeat(empty)}{/grey-fg}`;
	}

	/**
	 * Render the game
	 */
	private render(): void {
		const mapView = this.map.render(this.player.x, this.player.y, this.viewWidth, this.viewHeight);
		this.renderer.gameBox.setContent(mapView);
		this.updateStatus();
		this.renderer.render();
	}

	/**
	 * Update game state (enemy AI)
	 */
	private update(): void {
		if (!this.running) return;

		// Move each enemy
		for (const enemy of this.enemies) {
			this.moveEnemy(enemy);
		}

		this.render();
	}

	/**
	 * Move an enemy using simple AI
	 */
	private moveEnemy(enemy: TerminalEntity): void {
		// Calculate distance to player
		const dx = this.player.x - enemy.x;
		const dy = this.player.y - enemy.y;
		const distance = Math.sqrt(dx * dx + dy * dy);

		// If player is within perception range, move towards player
		if (distance < 10) {
			// Move towards player
			const moveX = dx !== 0 ? Math.sign(dx) : 0;
			const moveY = dy !== 0 ? Math.sign(dy) : 0;

			// Try to move in the direction of the player
			const newX = enemy.x + moveX;
			const newY = enemy.y + moveY;

			if (this.map.isWalkable(newX, newY) && !this.map.getEntityAt(newX, newY)) {
				enemy.move(moveX, moveY);
			}
			// If can't move diagonally, try horizontal or vertical
			else if (
				moveX !== 0 &&
				this.map.isWalkable(enemy.x + moveX, enemy.y) &&
				!this.map.getEntityAt(enemy.x + moveX, enemy.y)
			) {
				enemy.move(moveX, 0);
			} else if (
				moveY !== 0 &&
				this.map.isWalkable(enemy.x, enemy.y + moveY) &&
				!this.map.getEntityAt(enemy.x, enemy.y + moveY)
			) {
				enemy.move(0, moveY);
			}
		} else {
			// Random movement when player is far away
			const directions = [
				{ dx: 0, dy: -1 },
				{ dx: 0, dy: 1 },
				{ dx: -1, dy: 0 },
				{ dx: 1, dy: 0 },
			];

			// Random movement chance
			if (Math.random() < SpecialNumbers.ENEMY_RANDOM_MOVE_CHANCE) {
				const dir = directions[Math.floor(Math.random() * directions.length)];
				const newX = enemy.x + dir.dx;
				const newY = enemy.y + dir.dy;

				if (this.map.isWalkable(newX, newY) && !this.map.getEntityAt(newX, newY)) {
					enemy.move(dir.dx, dir.dy);
				}
			}
		}
	}

	/**
	 * Start the game loop
	 */
	public start(): void {
		this.running = true;
		this.renderer.log(TerminalMessages.GAME_STARTED);

		// Start the game loop for enemy movement
		this.gameLoopInterval = setInterval(() => {
			this.update();
		}, this.tickRate);
	}

	/**
	 * Stop the game
	 */
	public stop(): void {
		this.running = false;
		if (this.gameLoopInterval) {
			clearInterval(this.gameLoopInterval);
		}
		this.renderer.cleanup();
	}
}
