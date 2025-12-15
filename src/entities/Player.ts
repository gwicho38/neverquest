/**
 * @fileoverview Player entity - the main controllable character in Neverquest
 *
 * This file contains the Player class which represents the player character.
 * It extends Phaser's Arcade Sprite and implements the IBaseEntity interface.
 *
 * Key responsibilities:
 * - Movement (walking, running, swimming, jumping, rolling)
 * - Combat state management (attacking, blocking)
 * - Inventory management
 * - Health and attribute tracking
 *
 * State management:
 * - Movement states are managed by NeverquestMovement
 * - Combat states are managed by NeverquestBattleManager
 * - Dialog disables controls via NeverquestDialogBox
 *
 * @see NeverquestMovement - Handles player movement
 * @see NeverquestBattleManager - Handles combat
 * @see NeverquestKeyboardMouseController - Handles input
 * @see docs/PLAYER_STATE_MANAGEMENT.md - State management patterns
 *
 * @module entities/Player
 */

import Phaser from 'phaser';
import { NumericColors } from '../consts/Colors';
import { ENTITIES } from '../consts/Entities';
import { EntitySpeed, Alpha, Scale, AnimationTiming } from '../consts/Numbers';
import { AttributesManager } from '../plugins/attributes/AttributesManager';
import { NeverquestHUDProgressBar } from '../plugins/HUD/NeverquestHUDProgressBar';
import { NeverquestHealthBar } from '../plugins/NeverquestHealthBar';
import { NeverquestKeyboardMouseController } from '../plugins/NeverquestKeyboardMouseController';
import { NeverquestMovement } from '../plugins/NeverquestMovement';
import { IInventoryItem } from '../types/ItemTypes';
import { BaseEntity, IBaseEntity } from './BaseEntity';
import { EntityAttributes, IEntityAttributes } from './EntityAttributes';

/**
 * Player class extending Phaser's Arcade Sprite with game-specific functionality.
 *
 * The Player is the main controllable character. It manages:
 * - Physics body and container for collision
 * - Health bar display
 * - Movement via NeverquestMovement
 * - Input via NeverquestKeyboardMouseController
 * - Attributes via AttributesManager
 *
 * @example
 * const player = new Player(scene, 100, 100, 'character', map);
 * // Player is automatically added to scene and physics
 *
 * @implements {IBaseEntity}
 */
export class Player extends Phaser.Physics.Arcade.Sprite implements IBaseEntity {
	// BaseEntity properties
	public id: string | null = null;
	public isAtacking: boolean = false;
	public canAtack: boolean = true;
	public canMove: boolean = true;
	public canTakeDamage: boolean = true;
	public isBlocking: boolean = false;
	public canBlock: boolean = true;
	public showHitBox: boolean = false;
	public perceptionRange: number = 75;
	public isSwimming: boolean = false;
	public canSwim: boolean = true;
	public isRunning: boolean = false;
	public wasShiftDown: boolean = false;
	public baseSpeed: number = EntitySpeed.BASE;
	public swimSpeed: number = EntitySpeed.SWIM;
	public runSpeed: number = EntitySpeed.RUN;
	public isJumping: boolean = false;
	public canJump: boolean = true;
	public jumpHeight: number = 16; // Reduced by 20% from 20
	public jumpDuration: number = EntitySpeed.SPRINT;
	public isRolling: boolean = false;
	public canRoll: boolean = true;
	public rollDistance: number = 40; // Distance the player rolls
	public rollDuration: number = AnimationTiming.TWEEN_NORMAL; // Roll is faster than jump

	// Player-specific properties
	public attributes: IEntityAttributes;
	public attributesManager: AttributesManager;
	public entityName: string;
	public container: Phaser.GameObjects.Container;
	public speed: number;
	public items: IInventoryItem[];
	public healthBar: NeverquestHealthBar;
	public walkDust: any;
	public hitZone: Phaser.GameObjects.Zone;
	public neverquestKeyboardMouseController: NeverquestKeyboardMouseController;
	public neverquestMovement: NeverquestMovement;
	public neverquestHUDProgressBar: NeverquestHUDProgressBar | null = null;
	public joystickScene: any;

	// Original properties from JS version
	public hitZoneWidth: number = 12;
	public hitZoneHeigth: number = 21;
	public bodyWidth: number = 12;
	public bodyHeight: number = 8;
	public bodyOffsetY: number = 2;
	public dustParticleName: string = 'walk_dust';

	constructor(scene: Phaser.Scene, x: number, y: number, texture: string, map?: any) {
		super(scene, 0, 0, texture);

		// Has to call this method, so the animations work properly.
		this.addToUpdateList();

		console.log('[Player] Constructor - before BaseEntity assign:', { canAtack: this.canAtack });
		// Here are all classes that this Player Extends.
		Object.assign(this, BaseEntity);
		console.log('[Player] Constructor - after BaseEntity assign:', { canAtack: this.canAtack });

		/**
		 * The entity attributes.
		 */
		this.attributes = {} as IEntityAttributes;
		Object.assign(this.attributes, EntityAttributes);

		/**
		 * The Attributes Manager.
		 */
		this.attributesManager = new AttributesManager(this.scene, this);

		/**
		 * The name of the Entity. It's used for differenciation of the entityes.
		 */
		this.entityName = ENTITIES.Player;

		/**
		 * Maximum speed to be used for the player.
		 */
		this.speed = this.baseSpeed;

		// TODO - Should get the player's items when he starts the game.
		/**
		 * An Array with the Item ID's and the number of that specific Item that the player has.
		 */
		this.items = [];

		/**
		 * The zone that will interact as a hitzone.
		 */
		this.hitZone = this.scene.add.zone(0, 0, this.width, this.height);

		// TODO - Change the offsets to a JSON file or DataBase so it's not HardCoded.
		/**
		 * The Health Bar.
		 */
		this.healthBar = new NeverquestHealthBar(
			this.scene,
			0,
			0,
			this.width * 2,
			this.attributes.baseHealth,
			-this.width / Scale.EXTRA_LARGE,
			this.height / 2
		);

		this.setDepth(1);

		/**
		 * The class responsible for managing Keyboard and Mouse inputs.
		 */
		this.neverquestKeyboardMouseController = new NeverquestKeyboardMouseController(this.scene, this);
		this.neverquestKeyboardMouseController.create();

		// JoystickScene is currently disabled - using keyboard/mouse controls only
		// this.scene.scene.launch('JoystickScene', {
		// 	player: this,
		// 	map: map,
		// });

		/**
		 * The Joystick Scene.
		 */
		this.joystickScene = null; // this.scene.scene.get('JoystickScene');

		/**
		 * This object is responsible for moving the entity.
		 */
		this.neverquestMovement = new NeverquestMovement(this.scene, this, this.joystickScene);
		console.log('[Player] Constructor - after neverquestMovement created:', { canAtack: this.canAtack });

		this.play('character-idle-down');

		/**
		 * The container that holds the player game objects.
		 */
		this.container = new Phaser.GameObjects.Container(this.scene, x, y, [this, this.healthBar, this.hitZone]);
		this.container.setDepth(1);

		// Initializes the physics.
		this.setPhysics();
		/**
		 * The dust particles that the entity will emit when it moves.
		 */
		this.walkDust = this.scene.add
			.particles(this.container.x, this.container.y, this.dustParticleName, {
				follow: this.container,
				speed: 2,
				scale: { start: Alpha.LOW, end: 0.25 },
				frequency: 1000,
				quantity: 20,
				lifespan: 1000,
				rotate: { min: 0, max: 360 },
				alpha: { start: 1, end: 0 },
				followOffset: {
					x: 0,
					y: 10,
				},
			})
			.setDepth(0);

		this.walkDust.on = false;
		// All the dependencies that need to be inside the update game loop.
		this.scene.events.on('update', this.onUpdate, this);
	}

	/**
	 * The default pre update method from the Sprite Game Object.
	 */
	preUpdate(time: number, delta: number): void {
		super.preUpdate(time, delta);
	}

	/**
	 * This method is called every game loop. Anything that depends on it (update game loop method) should be put in here.
	 */
	onUpdate(): void {
		this.updateMovementDependencies();
		if (this.neverquestMovement) this.neverquestMovement.move();
	}

	/**
	 * Initializes the physics
	 */
	setPhysics(): void {
		// this.scene.add.existing(this);
		this.scene.physics.add.existing(this);
		this.body!.setSize(this.bodyWidth, this.bodyHeight);
		(this.body as Phaser.Physics.Arcade.Body).offset.y = this.height / Scale.VERY_LARGE;
		(this.body as Phaser.Physics.Arcade.Body).maxSpeed = this.speed;

		this.scene.add.existing(this.container);
		this.scene.physics.add.existing(this.container);
		(this.container.body as Phaser.Physics.Arcade.Body).setSize(this.bodyWidth, this.bodyHeight);
		(this.container.body as Phaser.Physics.Arcade.Body).offset.y = this.bodyOffsetY;
		(this.container.body as Phaser.Physics.Arcade.Body).offset.x = -(this.bodyWidth / 2);
		(this.container.body as Phaser.Physics.Arcade.Body).maxSpeed = this.speed;

		this.scene.physics.add.existing(this.hitZone);
		(this.hitZone.body as Phaser.Physics.Arcade.Body).setSize(this.hitZoneWidth, this.hitZoneHeigth);

		// Debug color lines.
		(this.container.body as Phaser.Physics.Arcade.Body).debugBodyColor = NumericColors.WHITE;
		(this.body as Phaser.Physics.Arcade.Body).debugBodyColor = NumericColors.YELLOW;
	}

	/**
	 * Makes the player jump with a visual effect and directional movement
	 */
	jump(): void {
		if (!this.canJump || this.isJumping || this.isSwimming) {
			return;
		}

		console.log('[Player] Jump started');
		this.isJumping = true;
		this.canJump = false;

		const startY = this.container.y;
		const jumpPeakY = startY - this.jumpHeight;

		// Calculate directional movement based on current velocity (set by movement system)
		const body = this.container.body as Phaser.Physics.Arcade.Body;
		const currentVelocityX = body.velocity.x;
		const currentVelocityY = body.velocity.y;

		// Calculate jump distance based on current velocity and jump duration
		// Reduced by 60% total (50% + additional 20%) to make jumps feel more controlled
		const jumpDistanceX = ((currentVelocityX * this.jumpDuration) / 1000) * 0.4;
		const jumpDistanceY = ((currentVelocityY * this.jumpDuration) / 1000) * 0.4;

		const startX = this.container.x;
		const endX = startX + jumpDistanceX;
		const endY = startY + jumpDistanceY;

		console.log('[Player] Jump direction:', {
			velocityX: currentVelocityX,
			velocityY: currentVelocityY,
			distanceX: jumpDistanceX,
			distanceY: jumpDistanceY,
		});

		// Vertical jump animation (up then down)
		this.scene.tweens.add({
			targets: this.container,
			y: jumpPeakY,
			duration: this.jumpDuration / 2,
			ease: 'Quad.easeOut',
			onComplete: () => {
				// Jump down animation
				this.scene.tweens.add({
					targets: this.container,
					y: endY,
					duration: this.jumpDuration / 2,
					ease: 'Quad.easeIn',
					onComplete: () => {
						this.isJumping = false;
						this.canJump = true;
						console.log('[Player] Jump completed');
					},
				});
			},
		});

		// Horizontal directional movement during jump
		if (jumpDistanceX !== 0 || jumpDistanceY !== 0) {
			this.scene.tweens.add({
				targets: this.container,
				x: endX,
				duration: this.jumpDuration,
				ease: 'Linear',
			});
		}

		// Add a subtle scale effect for visual feedback (reduced to minimize screen shake)
		this.scene.tweens.add({
			targets: this.container,
			scaleX: Alpha.NEARLY_FULL,
			scaleY: Alpha.NEARLY_FULL,
			duration: this.jumpDuration / 2,
			yoyo: true,
			ease: 'Sine.easeInOut',
		});
	}

	/**
	 * Makes the player roll in the current movement direction
	 */
	roll(): void {
		if (!this.canRoll || this.isRolling || this.isSwimming || this.isJumping) {
			return;
		}

		console.log('[Player] Roll started');
		this.isRolling = true;
		this.canRoll = false;

		// Get current velocity to determine roll direction
		const body = this.container.body as Phaser.Physics.Arcade.Body;
		const currentVelocityX = body.velocity.x;
		const currentVelocityY = body.velocity.y;

		// Calculate roll direction based on velocity, or default to facing direction
		let rollDirectionX = 0;
		let rollDirectionY = 0;

		if (currentVelocityX !== 0 || currentVelocityY !== 0) {
			// Normalize the velocity vector to get direction
			const magnitude = Math.sqrt(currentVelocityX * currentVelocityX + currentVelocityY * currentVelocityY);
			rollDirectionX = (currentVelocityX / magnitude) * this.rollDistance;
			rollDirectionY = (currentVelocityY / magnitude) * this.rollDistance;
		} else {
			// If not moving, roll in the direction the player is facing (default to down)
			rollDirectionY = this.rollDistance;
		}

		const startX = this.container.x;
		const startY = this.container.y;
		const endX = startX + rollDirectionX;
		const endY = startY + rollDirectionY;

		console.log('[Player] Roll direction:', {
			velocityX: currentVelocityX,
			velocityY: currentVelocityY,
			directionX: rollDirectionX,
			directionY: rollDirectionY,
			startX,
			startY,
			endX,
			endY,
		});

		// Roll movement animation - handle X and Y separately for better control
		if (rollDirectionX !== 0) {
			this.scene.tweens.add({
				targets: this.container,
				x: endX,
				duration: this.rollDuration,
				ease: 'Quad.easeOut',
			});
		}

		if (rollDirectionY !== 0) {
			this.scene.tweens.add({
				targets: this.container,
				y: endY,
				duration: this.rollDuration,
				ease: 'Quad.easeOut',
			});
		}

		// Set up completion callback on a separate tween or timeout
		this.scene.time.delayedCall(this.rollDuration, () => {
			this.isRolling = false;
			this.canRoll = true;
			console.log('[Player] Roll completed');
		});

		// Add rotation effect during roll
		this.scene.tweens.add({
			targets: this,
			angle: 360,
			duration: this.rollDuration,
			ease: 'Linear',
			onComplete: () => {
				this.angle = 0; // Reset rotation
			},
		});

		// Add slight scale effect for visual feedback
		this.scene.tweens.add({
			targets: this.container,
			scaleX: Alpha.ALMOST_OPAQUE,
			scaleY: Alpha.ALMOST_OPAQUE,
			duration: this.rollDuration / 2,
			yoyo: true,
			ease: 'Sine.easeInOut',
		});
	}

	/**
	 * Destroys all the sprite dependencies.
	 */
	destroyAll(): void {
		this.container.destroy();
		this.destroy();
	}

	/**
	 * Updates all dependencies that are required by the game.
	 * You should put any updates that require movement iteraction here.
	 */
	updateMovementDependencies(): void {
		// if (this.hitZone) {
		//     this.hitZone.x = this.x;
		//     this.hitZone.y = this.y;
		// }
	}
}
