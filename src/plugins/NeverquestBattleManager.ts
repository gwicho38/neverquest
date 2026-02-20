/**
 * @fileoverview Combat system manager for Neverquest
 *
 * This plugin handles all combat-related functionality including:
 * - Attack execution and hitbox creation
 * - Damage calculation (with variation, criticals, hit/miss)
 * - Block/defend mechanics
 * - Death handling for players and enemies
 *
 * State management:
 * - Owns: isAtacking, isBlocking during combat flow
 * - Sets: canAtack = false during attack animation, restored on completion
 * - NOTE: Does not touch canMove - that's for dialog/menus
 *
 * @see NeverquestKeyboardMouseController - Triggers attacks
 * @see NeverquestEntityTextDisplay - Shows damage numbers
 * @see ExpManager - Awards experience on kills
 *
 * @module plugins/NeverquestBattleManager
 */

import { AnimationNames } from '../consts/AnimationNames';
import PhaserJuice from 'phaser3-juice-plugin';
import Phaser from 'phaser';
import { ENTITIES } from '../consts/Entities';
import { NeverquestEntityTextDisplay } from './NeverquestEntityTextDisplay';
import { CRITICAL_MULTIPLIER } from '../consts/Battle';
import { ExpManager } from './attributes/ExpManager';
import { HUDScene } from '../scenes/HUDScene';
import { NumericColors } from '../consts/Colors';
import { CombatNumbers, Alpha } from '../consts/Numbers';
import { GameMessages } from '../consts/Messages';
import { IEntityAttributes } from '../entities/EntityAttributes';
import { NeverquestHealthBar } from './NeverquestHealthBar';
import { NeverquestHUDProgressBar } from './HUD/NeverquestHUDProgressBar';

/**
 * Interface for scenes that support combat with player and enemies.
 */
interface ICombatScene extends Phaser.Scene {
	/** Reference to player entity */
	player?: ICombatEntity;
	/** Array of enemy entities */
	enemies?: ICombatEntity[];
	/** Index signature for dynamic property access */
	[key: string]: unknown;
}

/**
 * Interface for entities that can participate in combat.
 * Both Player and Enemy implement this interface.
 */
export interface ICombatEntity {
	/** The entity's scene reference */
	scene: Phaser.Scene;
	/** Entity type identifier (e.g., "Player", "Enemy") */
	entityName: string;
	/** Combat and stat attributes */
	attributes: IEntityAttributes;
	/** Health bar display component */
	healthBar: NeverquestHealthBar;
	/** Container for physics positioning */
	container: Phaser.GameObjects.Container;
	/** Zone for hit detection */
	hitZone: Phaser.GameObjects.Zone;
	/** Animation state machine */
	anims: Phaser.Animations.AnimationState;
	/** Texture reference */
	texture: Phaser.Textures.Texture;
	/** Current animation frame */
	frame: Phaser.Textures.Frame;
	/** Horizontal flip state */
	flipX: boolean;
	/** Entity active state */
	active: boolean;
	/** Movement speed */
	speed: number;

	// Combat state flags
	isAtacking: boolean;
	canAtack: boolean;
	canMove: boolean;
	canTakeDamage: boolean;
	isBlocking: boolean;
	canBlock: boolean;
	isSwimming: boolean;

	// HUD reference (Player only, optional)
	neverquestHUDProgressBar?: NeverquestHUDProgressBar | null;
	// XP value (Enemy only, optional)
	exp?: number;

	// Methods
	setTint(color: number): this;
	clearTint(): this;
	once(event: string | symbol, fn: (...args: unknown[]) => void, context?: unknown): this;
	on(event: string | symbol, fn: (...args: unknown[]) => void, context?: unknown): this;
	off(event: string | symbol, fn?: (...args: unknown[]) => void, context?: unknown): this;

	// Enemy-specific methods (optional)
	dropItems?(): void;
	destroyAll?(): void;
}

/**
 * Manages all combat interactions in the game.
 *
 * Handles attack execution, damage calculation, blocking, and death.
 * Uses Phaser's physics overlap detection for hit detection.
 *
 * @example
 * const battleManager = new NeverquestBattleManager();
 * battleManager.atack(player); // Initiates attack sequence
 *
 * @extends AnimationNames
 */
export class NeverquestBattleManager extends AnimationNames {
	/**
	 * The name of the variables that the battle scene will look for to do overlaps and deal damage to the Enemy.
	 */
	enemiesVariableName: string;

	/**
	 * The name of the variables that the battle scene will look for to do overlaps and deal damage to the Player.
	 */
	playerVariableName: string;

	/**
	 * The name of the SFX of the atack being performed.
	 */
	atackSoundAnimationNames: string[];

	/**
	 * The name of the SFX of a damage being done.
	 */
	damageSoundNames: string[];

	/**
	 * The name of the default attack direction frame name.
	 */
	atackDirectionFrameName: {
		up: string;
		right: string;
		down: string;
		left: string;
	};

	/**
	 * The velocity that the hitbox will assume as soon as it's created.
	 */
	hitboxVelocity: number;

	/**
	 * This is the amount that the hitbox will be farther from the player. The greater the closer, for it's dividing the body height of the atacker
	 */
	hitboxOffsetDividerY: number;

	/**
	 * This is how much the hitbox atack body should be offset from it's original position.
	 */
	hitboxOffsetBody: number;

	/**
	 * The name of the hitbox Sprite.
	 */
	hitboxSpriteName: string;

	/**
	 * The plugin that will make the hit effect to the player and enemy.
	 * Uses PhaserJuice library for visual effects (no TypeScript definitions available).
	 */
	phaserJuice: InstanceType<typeof PhaserJuice> | null;

	/**
	 * The atack variation. This number represents a percentage of variation of the damage.
	 * The damage can be higher than the base damage, or lower than the base damage.
	 */
	variation: number;

	/**
	 * The lifetime of the Enemy Hitbox.
	 * This defines how long the Hitbox will keep moving towards the enemy.
	 */
	enemyHitboxLifetime: number;

	/**
	 * The name of the Enemy Constructor Class.
	 */
	enemyConstructorName: string;

	/**
	 * The name of the Player Constructor Class.
	 */
	PlayerConstructorName: string;

	/**
	 * The NeverquestEntityTextDisplay class, responsible for showing the player the damage dealt to a given Entity / Enemy.
	 */
	neverquestEntityTextDisplay: NeverquestEntityTextDisplay | null;

	/**
	 * This class is responsible for managing all the battle in the game.
	 */
	constructor() {
		super();

		this.enemiesVariableName = 'enemies';
		this.playerVariableName = 'player';
		this.atackSoundAnimationNames = ['atack01', 'atack02', 'atack03'];
		this.damageSoundNames = ['damage01', 'damage02', 'damage03'];
		this.atackDirectionFrameName = {
			up: 'up',
			right: 'right',
			down: 'down',
			left: 'left',
		};
		this.hitboxVelocity = 10;
		this.hitboxOffsetDividerY = CombatNumbers.HITBOX_OFFSET_DIVIDER_Y;
		this.hitboxOffsetBody = CombatNumbers.HITBOX_OFFSET_BODY;
		this.hitboxSpriteName = 'slash';
		this.phaserJuice = null;
		this.variation = 10;
		this.enemyHitboxLifetime = CombatNumbers.ENEMY_HITBOX_LIFETIME;
		this.enemyConstructorName = ENTITIES.Enemy;
		this.PlayerConstructorName = ENTITIES.Player;
		this.neverquestEntityTextDisplay = null;
	}

	/**
	 * This function creates the hitbox. You should be aware that every hitbox will be different based on your game. This
	 * template uses a 16x16 hitbox sprite.
	 * @param atacker The atacker
	 */
	createHitBox(atacker: ICombatEntity): Phaser.Physics.Arcade.Sprite {
		const hitbox = atacker.scene.physics.add.sprite(
			atacker.container.x,
			atacker.container.y,
			this.hitboxSpriteName,
			0
		);

		hitbox.body.debugBodyColor = NumericColors.RED_MAGENTA;

		hitbox.alpha = Alpha.LIGHT;
		hitbox.depth = 50;
		const hitZoneBody = atacker.hitZone.body as Phaser.Physics.Arcade.Body;
		if (atacker.frame.name.includes(this.atackDirectionFrameName.up)) {
			hitbox.body.setOffset(0, 4);
			const rotation = -1.57;
			this.setHitboxRotation(
				hitbox,
				rotation,
				{
					x: atacker.container.x,
					y: atacker.container.y - hitZoneBody.height / this.hitboxOffsetDividerY,
				},
				atacker
			);
		} else if (atacker.frame.name.includes(this.atackDirectionFrameName.right) && !atacker.flipX) {
			hitbox.body.setOffset(-4, 0);
			const rotation = 0;
			this.setHitboxRotation(
				hitbox,
				rotation,
				{
					x: atacker.container.x + hitZoneBody.width,
					y: atacker.container.y,
				},
				atacker
			);
		} else if (atacker.frame.name.includes(this.atackDirectionFrameName.down)) {
			hitbox.body.setOffset(0, -4);
			const rotation = 1.57;
			this.setHitboxRotation(
				hitbox,
				rotation,
				{
					x: atacker.container.x,
					y: atacker.container.y + hitZoneBody.height / this.hitboxOffsetDividerY,
				},
				atacker
			);
		} else if (atacker.frame.name.includes(this.atackDirectionFrameName.left) || atacker.flipX) {
			hitbox.body.setOffset(4, 0);
			const rotation = -3.14;
			this.setHitboxRotation(
				hitbox,
				rotation,
				{
					x: atacker.container.x - hitZoneBody.width,
					y: atacker.container.y,
				},
				atacker
			);
		}
		return hitbox;
	}

	/**
	 * Sets position of the sprite for a given rotation. The rotation should match the atack direction that you want.
	 * @param hitbox The hitbox sprite that will be changed.
	 * @param rotation The rotation in radians.
	 * @param position The new position of the hitbox.
	 * @param _atacker The atacker to get the scene from.
	 */
	setHitboxRotation(
		hitbox: Phaser.Physics.Arcade.Sprite,
		rotation: number,
		position: { x: number; y: number },
		_atacker: ICombatEntity
	): void {
		hitbox.setRotation(rotation);
		hitbox.setPosition(position.x, position.y);
		// atacker.scene.physics.velocityFromRotation(rotation, this.hitboxVelocity, hitbox.body.velocity);
	}

	/**
	 * Damages the target and manages any dependencies like decreasing the health, killing the target and any other thing needed.
	 * @param atacker Usually the atacker is the player.
	 * @param target  Usually the target is the enemy.
	 */
	takeDamage(atacker: ICombatEntity, target: ICombatEntity): void {
		// Randomizes the name of the damage sound.
		let damageName = this.damageSoundNames[Math.floor(Math.random() * this.damageSoundNames.length)];
		let damage = this.randomDamage(atacker.attributes.atack - target.attributes.defense);
		const isCritical = this.checkAtackIsCritial(atacker.attributes.critical);
		const hit = this.checkAtackHit(atacker.attributes.hit, target.attributes.flee);
		if (isCritical) {
			damage = Math.ceil(atacker.attributes.atack * CRITICAL_MULTIPLIER);
			damageName = 'critical';
		}
		if (hit || isCritical) {
			if (damage > 0) {
				if (target.healthBar) target.healthBar.decrease(damage);
				target.attributes.health -= damage;
			} else {
				target.attributes.health -= 1;
				target.healthBar.decrease(1);
			}
			// Clamp health to minimum of 0
			target.attributes.health = Math.max(0, target.attributes.health);

			if (target.neverquestHUDProgressBar) {
				target.neverquestHUDProgressBar.updateHealth();
			}
			this.phaserJuice!.add(target).flash();
			atacker.scene.sound.add(damageName).play();

			// Log combat message
			const targetName = target.entityName || 'Enemy';
			const attackerName = atacker.entityName === ENTITIES.Player ? 'You' : atacker.entityName;
			if (isCritical) {
				HUDScene.log(atacker.scene, GameMessages.CRITICAL_HIT(attackerName, targetName, damage));
			} else {
				HUDScene.log(atacker.scene, GameMessages.NORMAL_HIT(attackerName, targetName, damage));
			}

			if (target.attributes.health <= 0) {
				if (target.entityName === ENTITIES.Player) {
					// Player died - trigger game over
					HUDScene.log(atacker.scene, GameMessages.PLAYER_DEFEATED);
					this.handlePlayerDeath(target);
				} else {
					// Enemy died
					const enemyExp = target.exp ?? 0;
					HUDScene.log(atacker.scene, GameMessages.ENEMY_DEFEATED_WITH_EXP(targetName, enemyExp));
					if (atacker.entityName === ENTITIES.Player) {
						// Cast through unknown to satisfy ExpManager.Entity interface which has additional Phaser sprite properties
						ExpManager.addExp(atacker as unknown as Parameters<typeof ExpManager.addExp>[0], enemyExp);
					}
					setTimeout(() => {
						if (target.entityName === this.enemyConstructorName && target.dropItems) target.dropItems();
						target.anims.stop();
						if (target.destroyAll) target.destroyAll();
					}, 100);
				}
			}
			// Not very Optimized.
			this.neverquestEntityTextDisplay = new NeverquestEntityTextDisplay(target.scene);
			this.neverquestEntityTextDisplay.displayDamage(damage, target, isCritical);
		} else {
			// Log miss message
			const targetName = target.entityName || 'Enemy';
			const attackerName = atacker.entityName === ENTITIES.Player ? 'You' : atacker.entityName;
			HUDScene.log(atacker.scene, GameMessages.ATTACK_MISS(attackerName, targetName));

			this.neverquestEntityTextDisplay = new NeverquestEntityTextDisplay(target.scene);
			// Display 0 damage for a miss
			this.neverquestEntityTextDisplay.displayDamage(0, target);
		}

		/**
		 * Makes random damage.
		 * Decreses the health based on the target defense.
		 * Updates the Health Bar.
		 * Kills the target if it reaches the 0 or less hit points.
		 */
	}

	/**
	 * Checks if the atacker hit the target.
	 * @param hit the atacker's hit.
	 * @param flee the target's flee rate.
	 * @returns Returns if the atacker hit the target.
	 */
	checkAtackHit(hit: number, flee: number): boolean {
		const random = Math.random() * 100;
		if (isFinite((hit * 100) / flee)) {
			return (hit * 100) / flee >= random;
		} else {
			return true;
		}
	}

	/**
	 * Checks if it is a critical hit.
	 * PS: Critical hits ignore flee. Therefore, a critical hit should not miss.
	 * @param critChance atacker critical chance.
	 * @returns If it's a critical hit or not.
	 */
	checkAtackIsCritial(critChance: number): boolean {
		const random = Math.random() * 100;
		return critChance >= random;
	}

	/**
	 * Generates a random damage to deal to the target.
	 * @param damage
	 */
	randomDamage(damage: number): number {
		let variationDamage = damage * (this.variation / 100);

		if (Math.random() > 0.5) {
			variationDamage = damage + variationDamage;
		} else {
			variationDamage = damage - variationDamage;
		}

		return Math.floor(variationDamage);
	}

	/**
	 * This method will perform the block routine, reducing incoming damage.
	 * @param blocker the entity that will block.
	 */
	block(blocker: ICombatEntity): void {
		console.log('[BattleManager] Block called:', {
			canBlock: blocker.canBlock,
			canMove: blocker.canMove,
			isAtacking: blocker.isAtacking,
			canAtack: blocker.canAtack,
		});
		if (blocker.canBlock && blocker.canMove && !blocker.isAtacking) {
			blocker.isBlocking = true;
			blocker.canMove = false;
			blocker.canAtack = false;
			console.log('[BattleManager] Blocking started - canAtack set to false');

			const texture = blocker.texture.key;

			// Play block animation if it exists, otherwise just set blocking state
			const blockAnimKey = `${texture}-block-down`;
			if (blocker.anims.exists(blockAnimKey)) {
				blocker.anims.play(blockAnimKey, true);
			}

			// Add visual feedback - darker tint while blocking
			blocker.setTint(NumericColors.GRAY_LIGHT);
		}
	}

	/**
	 * This method will stop the block routine.
	 * @param blocker the entity that will stop blocking.
	 */
	stopBlock(blocker: ICombatEntity): void {
		console.log('[BattleManager] StopBlock called:', {
			isBlocking: blocker.isBlocking,
			canBlock: blocker.canBlock,
			canAtack: blocker.canAtack,
		});
		if (blocker.isBlocking) {
			blocker.isBlocking = false;

			// Only re-enable abilities if no other system has disabled them
			// Check canBlock as a proxy: if it's false, dialog/menu has disabled all abilities
			if (blocker.canBlock !== false) {
				blocker.canMove = true;
				blocker.canAtack = true;
				console.log('[BattleManager] Blocking stopped - canAtack set to true');
			}
			// If canBlock is false, leave canMove/canAtack as they are (disabled by dialog/menu)

			// Remove visual feedback
			blocker.clearTint();

			// Return to idle animation
			const texture = blocker.texture.key;
			const idleAnimKey = `${texture}-idle-down`;
			if (blocker.anims.exists(idleAnimKey)) {
				blocker.anims.play(idleAnimKey, true);
			}
		}
	}

	/**
	 * This method will perform the atack routine, checking for enemies within range.
	 * The atacker should have a body in order to stop him from walking as the movement is expected to be done with Velocity.
	 * @param atacker the atacker.
	 */
	atack(atacker: ICombatEntity): void {
		console.log('[BattleManager] Attack attempted:', {
			canAtack: atacker.canAtack,
			canMove: atacker.canMove,
			canBlock: atacker.canBlock,
			isBlocking: atacker.isBlocking,
			isAtacking: atacker.isAtacking,
			isSwimming: atacker.isSwimming,
		});

		if (atacker.canAtack && atacker.canMove) {
			this.phaserJuice = new PhaserJuice(atacker.scene, atacker.scene.plugins);
			atacker.isAtacking = true;
			atacker.canAtack = false;
			// Keep walk dust on during attacks for visual feedback
			// if (atacker.walkDust) atacker.walkDust.on = false;

			// Allow attacking while running - don't restrict movement speed
			// if (atacker.container?.body) {
			// 	atacker.container.body.maxSpeed = 0;
			// }
			const texture = atacker.texture.key;
			const currrentAnimation = atacker.anims.currentAnim?.key || 'character-idle-down';
			const atackAnimation = currrentAnimation.split('-');
			const attackAnimKey = `${texture}-${this.atkPrefixAnimation}-${atackAnimation[2]}`;
			console.log('[BattleManager] Animation setup:', {
				texture,
				currentAnimKey: currrentAnimation,
				splitParts: atackAnimation,
				direction: atackAnimation[2],
				constructedKey: attackAnimKey,
				animExists: atacker.anims.exists(attackAnimKey),
			});
			// Randomizes the name of the atack sound.
			const animationName =
				this.atackSoundAnimationNames[Math.floor(Math.random() * this.atackSoundAnimationNames.length)];

			let hitBoxSprite: Phaser.Physics.Arcade.Sprite | undefined;
			if (atacker.entityName === this.PlayerConstructorName) {
				hitBoxSprite = this.createHitBox(atacker);
				hitBoxSprite.anims.play(this.hitboxSpriteName);
			}

			// Stores the enemies that where atacked on the current animation.
			const atackedEnemies: ICombatEntity[] = [];
			// Destroys the slash atack if the atacker dies.
			atacker.scene.events.on('update', () => {
				if (hitBoxSprite && hitBoxSprite.active && atacker && !atacker.active) {
					hitBoxSprite.destroy();
				}

				const combatScene = atacker.scene as ICombatScene;
				if (
					hitBoxSprite &&
					hitBoxSprite.active &&
					atacker &&
					atacker.active &&
					atacker.entityName === this.PlayerConstructorName
				) {
					atacker.scene.physics.overlap(
						hitBoxSprite,
						combatScene[this.enemiesVariableName] as Phaser.Physics.Arcade.Sprite[],

						(_h, enemy) => {
							const enemyEntity = enemy as unknown as ICombatEntity;
							this.takeDamage(atacker, enemyEntity);
							enemyEntity.canTakeDamage = false;
							// Note: canAtack is already false from line 396, don't set it again here
							// as it can override the animation completion handler that restores it
							atackedEnemies.push(enemyEntity);
						},
						(_h, enemy) => {
							return (enemy as unknown as ICombatEntity).canTakeDamage;
						}
					);
				} else if (
					hitBoxSprite &&
					hitBoxSprite.active &&
					atacker &&
					atacker.active &&
					atacker.entityName === this.enemyConstructorName
				) {
					const playerEntity = combatScene[this.playerVariableName] as ICombatEntity;
					atacker.scene.physics.overlap(
						hitBoxSprite,
						playerEntity.hitZone,
						() => {
							this.takeDamage(atacker, playerEntity);
							playerEntity.canTakeDamage = false;
							atackedEnemies.push(playerEntity);
							// Note: canAtack is already false from line 396, don't set it again here
							// if (atacker.anims.getProgress() === 1) {
							// as it can override the animation completion handler that restores it
							// }
						},
						() => {
							return playerEntity.canTakeDamage;
						}
					);
				}
			});
			// Animations events have to come before the animation is played, they are triggered propperly.
			atacker.once(Phaser.Animations.Events.ANIMATION_START, (...args: unknown[]) => {
				const start = args[0] as Phaser.Animations.Animation;
				if (
					start.key === `${texture}-${this.atkPrefixAnimation}-${atackAnimation[2]}` &&
					atacker.entityName === this.PlayerConstructorName
				) {
					atacker.scene.sound.add(animationName).play();
				}
			});

			// Create a handler we can reference for removal
			let attackCompleted = false;
			const completeAttackHandler = (...args: unknown[]) => {
				const animationState = args[0] as Phaser.Animations.Animation;
				console.log('[BattleManager] Animation complete event:', {
					animKey: animationState.key,
					expectedKey: `${texture}-${this.atkPrefixAnimation}-${atackAnimation[2]}`,
					matches: animationState.key === `${texture}-${this.atkPrefixAnimation}-${atackAnimation[2]}`,
					attackCompleted,
				});
				if (animationState.key === `${texture}-${this.atkPrefixAnimation}-${atackAnimation[2]}`) {
					if (attackCompleted) {
						console.log('[BattleManager] Attack already completed, skipping');
						return;
					}
					attackCompleted = true;

					// Remove the listener since we're done
					atacker.off(Phaser.Animations.Events.ANIMATION_COMPLETE, completeAttackHandler);

					atacker.isAtacking = false;
					// No need to restore maxSpeed since we're allowing attacking while running
					// if (atacker.container?.body) {
					// 	atacker.container.body.maxSpeed = atacker.speed;
					// }
					atacker.canAtack = true; // Enables the atack once the player finishes the animation
					console.log('[BattleManager] Attack complete - canAtack restored to true');
					if (atacker.entityName === this.enemyConstructorName) {
						hitBoxSprite = this.createHitBox(atacker);
						hitBoxSprite.anims.play(this.hitboxSpriteName);
						setTimeout((_time) => {
							this.resetEnemyState(atackedEnemies);
							hitBoxSprite!.destroy();
						}, this.enemyHitboxLifetime);
					}

					if (hitBoxSprite && hitBoxSprite.active && atacker.entityName !== this.enemyConstructorName)
						hitBoxSprite.destroy();

					this.resetEnemyState(atackedEnemies);
				}
			};

			atacker.on(Phaser.Animations.Events.ANIMATION_COMPLETE, completeAttackHandler, this);
			console.log('[BattleManager] Registered ANIMATION_COMPLETE event listener');

			// Fallback timeout to ensure canAtack is restored even if animation doesn't complete properly
			// Reduced to 400ms (typical attack animation duration) for faster recovery
			setTimeout(() => {
				if (!attackCompleted) {
					console.warn(
						'[BattleManager] ⚠️ Attack timeout fallback - forcing completion (animation may not have fired)'
					);
					if (atacker && atacker.anims) {
						console.warn('[BattleManager] Current animation state:', {
							isPlaying: atacker.anims.isPlaying,
							currentAnim: atacker.anims.currentAnim?.key,
							currentFrame: atacker.anims.currentFrame?.index,
							totalFrames: atacker.anims.currentAnim?.frames?.length,
						});
					} else {
						console.warn('[BattleManager] Attacker or anims is null/undefined');
					}
					attackCompleted = true;
					atacker.off(Phaser.Animations.Events.ANIMATION_COMPLETE, completeAttackHandler);
					atacker.isAtacking = false;
					// No need to restore maxSpeed since we're allowing attacking while running
					// if (atacker.container?.body) {
					// 	atacker.container.body.maxSpeed = atacker.speed;
					// }
					atacker.canAtack = true;

					if (hitBoxSprite && hitBoxSprite.active && atacker.entityName !== this.enemyConstructorName)
						hitBoxSprite.destroy();

					this.resetEnemyState(atackedEnemies);
				}
			}, CombatNumbers.ATTACK_TIMEOUT_FALLBACK); // Increased to handle slow enemy animations (rat: 2500ms max)

			console.log('[BattleManager] About to play attack animation:', attackAnimKey);
			const playResult = atacker.anims.play(attackAnimKey, true);
			console.log('[BattleManager] Animation play result:', {
				returned: !!playResult,
				isPlaying: atacker.anims.isPlaying,
				currentKey: atacker.anims.currentAnim?.key,
				frameRate: atacker.anims.currentAnim?.frameRate,
				duration: atacker.anims.currentAnim?.duration,
				totalFrames: atacker.anims.currentAnim?.frames?.length,
				repeat: atacker.anims.currentAnim?.repeat,
			});
		}
	}

	/**
	 * Resets the 'canTakeDamage' state to true.
	 * @param atackedEnemies
	 */
	resetEnemyState(atackedEnemies: ICombatEntity[]): void {
		if (atackedEnemies && atackedEnemies.length) {
			atackedEnemies.forEach((e) => {
				e.canTakeDamage = true;
			});
		}
	}

	/**
	 * Handles player death by launching the GameOver scene
	 * @param player The player entity that died
	 */
	handlePlayerDeath(player: ICombatEntity): void {
		console.log('[BattleManager] Player died - triggering game over');

		// Disable player controls
		player.canMove = false;
		player.canAtack = false;
		player.canBlock = false;

		// Stop player animations
		player.anims.stop();

		// Fade out music if it exists
		const scene = player.scene;
		const sceneWithSound = scene as Phaser.Scene & { themeSound?: Phaser.Sound.BaseSound };
		if (sceneWithSound.themeSound && sceneWithSound.themeSound.isPlaying) {
			scene.tweens.add({
				targets: sceneWithSound.themeSound,
				volume: 0,
				duration: 1000,
				ease: 'Power2',
			});
		}

		// Show death animation/effect
		if (!this.phaserJuice) {
			this.phaserJuice = new PhaserJuice(scene, scene.plugins);
		}
		// Use the player sprite, and call flash without options to avoid setTintFill errors
		// The flash effect will use default settings which work with all sprite types
		this.phaserJuice.add(player).flash();

		// Delay before showing game over screen
		setTimeout(() => {
			// Launch GameOver scene with current scene data
			scene.scene.launch('GameOverScene', {
				playerLevel: player.attributes.level,
				lastScene: scene.scene.key,
			});
			// Pause the current scene
			scene.scene.pause();
		}, CombatNumbers.PLAYER_DEATH_DELAY);
	}
}
