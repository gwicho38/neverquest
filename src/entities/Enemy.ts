/**
 * @fileoverview Enemy entity class for hostile creatures
 *
 * This class represents all hostile NPCs in the game:
 * - Configuration-driven enemy types (rat, bat, ogre, etc.)
 * - AI behavior (patrol, chase, attack)
 * - Pathfinding integration for navigation
 * - Line-of-sight detection for player awareness
 * - Health bar display
 * - Drop system for loot
 * - Experience rewards on death
 *
 * Extends BaseEntity for common entity functionality.
 *
 * @see EnemiesSeedConfig - Enemy type definitions
 * @see NeverquestPathfinding - AI navigation
 * @see NeverquestLineOfSight - Player detection
 * @see NeverquestBattleManager - Combat handling
 *
 * @module entities/Enemy
 */

import Phaser from 'phaser';
import { AnimationNames } from '../consts/AnimationNames';
import { NeverquestAnimationManager } from '../plugins/NeverquestAnimationManager';
import { NeverquestHealthBar } from '../plugins/NeverquestHealthBar';
import { BaseEntity, IBaseEntity } from './BaseEntity';
import { EntityAttributes, IEntityAttributes } from './EntityAttributes';
import uniqid from 'uniqid';
import { NeverquestBattleManager } from '../plugins/NeverquestBattleManager';
import { ENTITIES } from '../consts/Entities';
import { NeverquestDropSystem } from '../plugins/NeverquestDropSystem';
import { EnemiesSeedConfig } from '../consts/enemies/EnemiesSeedConfig';
import { IEnemyConfig } from '../types/EnemyTypes';
import { EntitySpeed, AnimationTiming, CombatNumbers } from '../consts/Numbers';
import { ErrorMessages } from '../consts/Messages';
import { EntityDrops } from '../models/EntityDrops';

/**
 * Interface for player-like game objects with required properties for combat
 */
interface ITargetEntity {
	entityName: string;
	container: Phaser.GameObjects.Container;
	hitZone: Phaser.GameObjects.Zone;
}

/**
 * Interface for scene with line-of-sight system
 */
interface ISceneWithLineOfSight extends Phaser.Scene {
	lineOfSight?: {
		isVisible: (x1: number, y1: number, x2: number, y2: number) => boolean;
	};
}

/**
 * Interface for scene with pathfinding system
 */
interface ISceneWithPathfinding extends Phaser.Scene {
	pathfinding?: {
		findPath: (
			startX: number,
			startY: number,
			endX: number,
			endY: number,
			callback: (path: Phaser.Math.Vector2[] | null) => void
		) => void;
	};
}

export class Enemy extends Phaser.Physics.Arcade.Sprite implements IBaseEntity {
	// BaseEntity properties
	public id: string | null = null;
	public isAtacking: boolean = false;
	public canAtack: boolean = true;
	public canMove: boolean = true;
	public canTakeDamage: boolean = true;
	public isBlocking: boolean = false;
	public canBlock: boolean = true;
	public showHitBox: boolean = false;
	public perceptionRange: number = CombatNumbers.PERCEPTION_RANGE;
	public isSwimming: boolean = false;
	public canSwim: boolean = true;
	public isRunning: boolean = false;
	public baseSpeed: number = EntitySpeed.BASE;
	public swimSpeed: number = EntitySpeed.SWIM;
	public runSpeed: number = EntitySpeed.RUN;

	// Enemy-specific properties
	public attributes: IEntityAttributes;
	public entityName: string;
	public commonId: number;
	public baseHealth: number;
	public atack: number;
	public defense: number;
	public speed: number;
	public drops: EntityDrops[];
	public exp: number;
	public neverquestAnimationManager: NeverquestAnimationManager;
	public neverquestBattleManager: NeverquestBattleManager;
	public hitZone: Phaser.GameObjects.Zone;
	public healthBar: NeverquestHealthBar;
	public container: Phaser.GameObjects.Container;

	// Pathfinding properties
	public currentPath: Phaser.Math.Vector2[] | null = null;
	public currentWaypointIndex: number = 0;
	public pathUpdateInterval: number = AnimationTiming.PATH_UPDATE_INTERVAL; // Update path every 1 second
	public lastPathUpdate: number = 0;
	public waypointReachedDistance: number = CombatNumbers.WAYPOINT_REACHED_DISTANCE; // Distance to consider waypoint reached

	// Performance optimization - throttle perception checks
	public perceptionCheckInterval: number = AnimationTiming.PERCEPTION_CHECK_INTERVAL; // Check every 200ms instead of every frame
	public lastPerceptionCheck: number = 0;

	// Animation properties from AnimationNames
	public idlePrefixAnimation: string = 'idle-';
	public walkPrefixAnimation: string = 'walk-';
	public atackPrefixAnimation: string = 'atk-';
	public downAnimationSufix: string = 'down';
	public upAnimationSufix: string = 'up';
	public leftAnimationSufix: string = 'left';
	public rightAnimationSufix: string = 'right';

	constructor(scene: Phaser.Scene, x: number, y: number, texture: string, id: number) {
		super(scene, 0, 0, texture);

		const enemyConfig: IEnemyConfig | undefined = EnemiesSeedConfig.find((c) => c.id === id);
		if (!enemyConfig) {
			throw new Error(ErrorMessages.ENEMY_CONFIG_NOT_FOUND(id));
		}

		Object.assign(this, BaseEntity);

		this.attributes = {} as IEntityAttributes;
		Object.assign(this.attributes, EntityAttributes);
		Object.assign(this, new AnimationNames());

		this.setAttributes(enemyConfig);

		this.entityName = ENTITIES.Enemy;
		this.scene = scene;
		this.id = uniqid();
		this.commonId = enemyConfig.id;
		this.baseHealth = enemyConfig.baseHealth;
		this.atack = enemyConfig.atack;
		this.defense = enemyConfig.defense;
		this.speed = enemyConfig.speed;
		this.drops = enemyConfig.drops;
		this.exp = enemyConfig.exp;

		this.neverquestAnimationManager = new NeverquestAnimationManager(this);
		this.neverquestBattleManager = new NeverquestBattleManager();

		this.hitZone = this.scene.add.zone(0, 0, this.width, this.height);
		this.scene.physics.add.existing(this.hitZone);

		this.healthBar = new NeverquestHealthBar(this.scene, 0, 0, this.attributes.health, this.attributes.maxHealth);

		this.x = 0;
		this.y = 0;

		this.scene.add.existing(this);
		this.scene.physics.add.existing(this);
		this.body!.setSize(this.body!.width, this.body!.height);
		(this.body as Phaser.Physics.Arcade.Body).immovable = true;

		this.container = new Phaser.GameObjects.Container(this.scene, x, y, [this, this.healthBar, this.hitZone]);

		this.scene.add.existing(this.container);
		this.scene.physics.add.existing(this.container);

		const idleDown = `${this.idlePrefixAnimation}-${this.downAnimationSufix}`;
		const idleAnimation = texture ? `${texture}-${idleDown}` : `bat-${idleDown}`;

		this.anims.play(idleAnimation);
		this.scene.events.on('update', this.onUpdate, this);
		// Mix in drop system functionality
		Object.assign(this, new NeverquestDropSystem(scene, this));
	}

	public setAttributes(attributes: IEnemyConfig): void {
		if (this.attributes.atack !== undefined) {
			this.attributes.atack = attributes.atack;
			this.attributes.hit = attributes.hit;
			this.attributes.flee = attributes.flee;
			this.attributes.defense = attributes.defense;
			this.attributes.health = attributes.baseHealth;
		}
	}

	public onUpdate(): void {
		if (this && this.body) {
			// Throttle perception checks for performance
			const now = this.scene.time.now;
			if (now - this.lastPerceptionCheck > this.perceptionCheckInterval) {
				this.lastPerceptionCheck = now;
				this.checkPlayerInRange();
			} else if (this.currentPath && !this.isAtacking) {
				// If we have a path, continue following it even between perception checks
				// Don't follow path while attacking to prevent animation override
				this.followCurrentPath();
			}
		}
	}

	public checkPlayerInRange(): void {
		let inRange = false;
		let enemiesInRange = this.scene.physics.overlapCirc(this.container.x, this.container.y, this.perceptionRange);

		for (let target of enemiesInRange) {
			const targetEntity = target.gameObject as unknown as ITargetEntity;
			if (target && target.gameObject && targetEntity.entityName === ENTITIES.Player) {
				// Check line-of-sight if available
				const sceneWithLOS = this.scene as ISceneWithLineOfSight;
				let hasLineOfSight = true; // Default to true for backward compatibility

				if (sceneWithLOS.lineOfSight) {
					// Check if player is visible (not behind walls)
					hasLineOfSight = sceneWithLOS.lineOfSight.isVisible(
						this.container.x,
						this.container.y,
						targetEntity.container.x,
						targetEntity.container.y
					);
				}

				// Only pursue if we can see the player
				if (hasLineOfSight) {
					let overlaps = false;
					this.scene.physics.overlap(targetEntity.hitZone, this, () => {
						overlaps = true;
						this.stopMovement();
						if (this.canAtack) this.neverquestBattleManager.atack(this);
					});

					inRange = true;
					if (!overlaps && !this.isAtacking) {
						// Try to use pathfinding if available
						const sceneWithPathfinding = this.scene as ISceneWithPathfinding;
						if (sceneWithPathfinding.pathfinding) {
							this.followPathToTarget(targetEntity.container);
						} else {
							// Fallback to direct movement (old behavior)
							this.moveDirectlyToTarget(targetEntity.container);
						}
					}
				}
			}
		}

		if (!inRange) {
			this.stopMovement();
			this.currentPath = null;
		}
	}

	/**
	 * Continue following the current path (called between perception checks)
	 */
	private followCurrentPath(): void {
		// Don't move or play animations while attacking
		if (this.isAtacking) return;

		if (this.currentPath && this.currentWaypointIndex < this.currentPath.length) {
			const waypoint = this.currentPath[this.currentWaypointIndex];
			const distance = Phaser.Math.Distance.Between(this.container.x, this.container.y, waypoint.x, waypoint.y);

			if (distance < this.waypointReachedDistance) {
				// Reached waypoint, move to next one
				this.currentWaypointIndex++;
			} else {
				// Move towards current waypoint
				const angle = Phaser.Math.Angle.Between(this.container.x, this.container.y, waypoint.x, waypoint.y);
				const velocity = this.scene.physics.velocityFromAngle(Phaser.Math.RadToDeg(angle), this.speed);
				const body = this.container.body as Phaser.Physics.Arcade.Body;
				body.setVelocity(velocity.x, velocity.y);
				this.neverquestAnimationManager.animateWithAngle(
					`${this.texture.key}-${this.walkPrefixAnimation}`,
					angle
				);
				this.changeBodySize(this.width, this.height);
			}
		}
	}

	/**
	 * Move directly to target (original behavior, fallback)
	 */
	private moveDirectlyToTarget(target: Phaser.GameObjects.Container): void {
		// Don't move or play animations while attacking
		if (this.isAtacking) return;

		this.scene.physics.moveToObject(this.container, target, this.speed);

		const body = this.container.body as Phaser.Physics.Arcade.Body;
		const angle = Math.atan2(body.velocity.y, body.velocity.x);

		this.neverquestAnimationManager.animateWithAngle(`${this.texture.key}-${this.walkPrefixAnimation}`, angle);
		this.changeBodySize(this.width, this.height);
	}

	/**
	 * Follow a path to the target using pathfinding
	 */
	private followPathToTarget(target: Phaser.GameObjects.Container): void {
		const now = this.scene.time.now;
		const sceneWithPathfinding = this.scene as ISceneWithPathfinding;

		// Update path periodically or if we don't have one
		if (!this.currentPath || now - this.lastPathUpdate > this.pathUpdateInterval) {
			this.lastPathUpdate = now;

			sceneWithPathfinding.pathfinding.findPath(
				this.container.x,
				this.container.y,
				target.x,
				target.y,
				(path: Phaser.Math.Vector2[] | null) => {
					if (path && path.length > 1) {
						this.currentPath = path;
						this.currentWaypointIndex = 1; // Start at 1 (0 is current position)
					} else {
						// No path found, try direct movement
						this.moveDirectlyToTarget(target);
					}
				}
			);
		}

		// Follow the current path
		if (this.currentPath && this.currentWaypointIndex < this.currentPath.length) {
			const waypoint = this.currentPath[this.currentWaypointIndex];
			const distance = Phaser.Math.Distance.Between(this.container.x, this.container.y, waypoint.x, waypoint.y);

			if (distance < this.waypointReachedDistance) {
				// Reached waypoint, move to next one
				this.currentWaypointIndex++;
			} else {
				// Move towards current waypoint
				const angle = Phaser.Math.Angle.Between(this.container.x, this.container.y, waypoint.x, waypoint.y);
				const velocity = this.scene.physics.velocityFromAngle(Phaser.Math.RadToDeg(angle), this.speed);
				const body = this.container.body as Phaser.Physics.Arcade.Body;
				body.setVelocity(velocity.x, velocity.y);

				this.neverquestAnimationManager.animateWithAngle(
					`${this.texture.key}-${this.walkPrefixAnimation}`,
					angle
				);
				this.changeBodySize(this.width, this.height);
			}
		}
	}

	public stopMovement(): void {
		const body = this.container.body as Phaser.Physics.Arcade.Body;
		body.setAcceleration(0, 0);
		body.setVelocity(0, 0);
		this.neverquestAnimationManager.setIdleAnimation();
		this.changeBodySize(this.width, this.height);
	}

	public changeBodySize(width: number, height: number): void {
		(this.body as Phaser.Physics.Arcade.Body).setSize(width, height);
		(this.hitZone.body as Phaser.Physics.Arcade.Body).setSize(width, height);
		(this.container.body as Phaser.Physics.Arcade.Body).setSize(width, height);
		(this.container.body as Phaser.Physics.Arcade.Body).setOffset(-(width / 2), -(height / 2));
	}

	public destroyAll(): void {
		this.healthBar.destroy();
		this.container.destroy();
		this.destroy();
	}
}
