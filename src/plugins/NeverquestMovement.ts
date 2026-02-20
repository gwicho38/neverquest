/**
 * @fileoverview Player movement controller for Neverquest
 *
 * This plugin handles all player movement including:
 * - Keyboard input (WASD, arrow keys)
 * - Gamepad input
 * - Virtual joystick (mobile)
 * - Swimming detection and speed adjustment
 * - Running toggle (Shift key)
 *
 * State management:
 * - Owns: isSwimming, isRunning, player speed
 * - Reads: canMove, isAtacking (blocks movement when false)
 * - Does NOT modify: canMove, canAtack (those belong to dialog/battle)
 *
 * @see NeverquestAnimationManager - Handles animation changes
 * @see NeverquestGamePadController - Handles gamepad input
 * @see Player - The entity being controlled
 *
 * @module plugins/NeverquestMovement
 */

import Phaser from 'phaser';
import { AnimationNames } from '../consts/AnimationNames';
import { Alpha, EntitySpeed, MapLayerNames } from '../consts/Numbers';
import { NeverquestAnimationManager } from './NeverquestAnimationManager';
import { NeverquestGamePadController } from './NeverquestGamePadController';
import { Player } from '../entities/Player';
import type { IVirtualJoystickStick } from '../types';

/**
 * Movement controller for the player character.
 *
 * Supports multiple input methods:
 * - Keyboard (WASD + arrow keys)
 * - Gamepad (analog sticks)
 * - Virtual joystick (mobile touch)
 *
 * Handles movement states:
 * - Normal walking
 * - Running (Shift toggle)
 * - Swimming (auto-detected from water tiles)
 *
 * @example
 * const movement = new NeverquestMovement(scene, player, joystickScene);
 * // In update loop:
 * movement.move();
 *
 * @extends AnimationNames
 */
export class NeverquestMovement extends AnimationNames {
	public scene: Phaser.Scene;
	public player: Player;
	public cursors: Phaser.Types.Input.Keyboard.CursorKeys;
	public wasd: { [key: string]: Phaser.Input.Keyboard.Key };
	public shiftKey: Phaser.Input.Keyboard.Key;
	public stick: IVirtualJoystickStick | null;
	public joystickScene: Phaser.Scene | null;
	public neverquestAnimationManager: NeverquestAnimationManager;
	public neverquestGamePadController: NeverquestGamePadController;

	/**
	 * Creates cursors to move the player in the given direction.
	 * @param scene Phaser Scene.
	 * @param player the player that the cursors will move.
	 * @param joystickScene Virtual joystick scene
	 */
	constructor(scene: Phaser.Scene, player: Player, joystickScene?: Phaser.Scene) {
		super();

		/**
		 * Scene Context.
		 */
		this.scene = scene;

		/**
		 * player Player Game Object.
		 */
		this.player = player;

		/**
		 * Keyboard cursors that will control the character.
		 */
		this.cursors = this.scene.input.keyboard!.createCursorKeys();

		/**
		 * WASD keys for alternative movement controls.
		 */
		this.wasd = this.scene.input.keyboard!.addKeys('W,S,A,D') as { [key: string]: Phaser.Input.Keyboard.Key };

		/**
		 * Shift key for running mode.
		 */
		this.shiftKey = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

		// Initialize running state
		if (this.player.isRunning === undefined) {
			this.player.isRunning = false;
		}
		this.player.wasShiftDown = false;

		console.log('[NeverquestMovement] Constructor completed - Shift toggle initialized');

		/**
		 * Virtual joystick plugin
		 */
		this.stick = null;

		/**
		 * Joystick scene for mobile controls
		 */
		this.joystickScene = joystickScene || null;

		/**
		 * Animation manager for the player
		 */
		this.neverquestAnimationManager = new NeverquestAnimationManager(this.player);

		/**
		 * GamePad controller
		 */
		this.neverquestGamePadController = new NeverquestGamePadController(this.scene, this.player);

		// Set up joystick events if available
		if (this.joystickScene) {
			this.joystickScene.events.on('setStick', (payload: IVirtualJoystickStick) => {
				this.stick = payload; // Sets the Stick pad for movement.
			});
		}

		// Add keyboard event listener for WASD logging
		this.scene.input.keyboard!.on('keydown', (event: KeyboardEvent) => {
			if (['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(event.code)) {
				console.log(`WASD Control: ${event.code} pressed`);
			}
		});
	}

	/**
	 * Check if the player is currently moving
	 */
	isMoving(): boolean {
		return this.player.container.body!.velocity.x !== 0 || this.player.container.body!.velocity.y !== 0;
	}

	/**
	 * Check if any movement key is currently pressed
	 */
	isAnyKeyDown(): boolean {
		return (
			this.cursors.left!.isDown ||
			this.cursors.right!.isDown ||
			this.cursors.up!.isDown ||
			this.cursors.down!.isDown ||
			this.wasd.W?.isDown ||
			this.wasd.A?.isDown ||
			this.wasd.S?.isDown ||
			this.wasd.D?.isDown
		);
	}

	/**
	 * Check if the player is currently on water tiles
	 */
	isOnWater(): boolean {
		if (!this.scene.data || !this.player || !this.player.container) return false;

		const map = this.scene.data.get('map');
		if (!map) return false;

		const playerX = this.player.container.x;
		const playerY = this.player.container.y;
		const tileSize = map.tileWidth;

		// Convert world coordinates to tile coordinates
		const tileX = Math.floor(playerX / tileSize);
		const tileY = Math.floor(playerY / tileSize);

		// Check if the tile at player position is water
		const waterLayer = map.getLayer(MapLayerNames.WATER_LOWERCASE) || map.getLayer(MapLayerNames.WATER_CAPITALIZED);
		if (waterLayer) {
			const tile = map.getTileAt(tileX, tileY, false, waterLayer);
			return tile !== null;
		}

		return false;
	}

	/**
	 * Update the player's swimming state based on current position
	 */
	updateSwimmingState(): void {
		if (!this.player || !this.player.canSwim) return;

		const wasSwimming = this.player.isSwimming;
		const shouldBeSwimming = this.isOnWater();

		if (shouldBeSwimming && !wasSwimming) {
			// Enter swimming mode
			this.player.isSwimming = true;
			this.player.isRunning = false; // Can't run while swimming
			this.player.speed = this.player.swimSpeed || 100;
			this.updateBodyMaxSpeed(this.player.speed);
			console.log('Player entered water - swimming mode activated');
		} else if (!shouldBeSwimming && wasSwimming) {
			// Exit swimming mode
			this.player.isSwimming = false;
			this.player.speed = this.player.baseSpeed || EntitySpeed.BASE;
			this.updateBodyMaxSpeed(this.player.speed);
			console.log('Player left water - swimming mode deactivated');
		}
	}

	/**
	 * Update the player's running state based on shift key
	 * Note: Shift now acts as a toggle (press once to enable, press again to disable)
	 */
	updateRunningState(): void {
		if (!this.player || this.player.isSwimming) {
			// Disable running when swimming
			if (this.player && this.player.isRunning) {
				this.player.isRunning = false;
				this.player.speed = this.player.baseSpeed || EntitySpeed.BASE;
				this.updateBodyMaxSpeed(this.player.speed);
				console.log('[NeverquestMovement] Running disabled (swimming)');
			}
			return;
		}

		// Detect shift key press (toggle on press, not hold)
		const isShiftDown = this.shiftKey.isDown;
		const wasShiftDown = this.player.wasShiftDown || false;

		// Debug: Log shift key state changes
		if (isShiftDown !== wasShiftDown) {
			console.log('[NeverquestMovement] Shift key state changed:', {
				isShiftDown,
				wasShiftDown,
				currentRunning: this.player.isRunning,
				currentSpeed: this.player.speed,
			});
		}

		// Toggle running when shift is pressed (transition from up to down)
		if (isShiftDown && !wasShiftDown) {
			const previousRunning = this.player.isRunning;
			const previousCanAtack = this.player.canAtack;
			this.player.isRunning = !this.player.isRunning;
			this.player.speed = this.player.isRunning
				? this.player.runSpeed || EntitySpeed.RUN
				: this.player.baseSpeed || EntitySpeed.BASE;
			this.updateBodyMaxSpeed(this.player.speed);
			console.log(
				`[NeverquestMovement] Running toggled: ${previousRunning} -> ${this.player.isRunning} - Speed: ${this.player.speed}, MaxSpeed: ${(this.player.container.body as Phaser.Physics.Arcade.Body).maxSpeed}, canAtack: ${previousCanAtack} -> ${this.player.canAtack}`
			);
		}

		// Store shift state for next frame
		this.player.wasShiftDown = isShiftDown;
	}

	/**
	 * Update the physics body maxSpeed to match the current speed
	 */
	updateBodyMaxSpeed(speed: number): void {
		if (this.player.container?.body) {
			(this.player.container.body as Phaser.Physics.Arcade.Body).maxSpeed = speed;
		}
	}

	/**
	 * Update running speed based on shift key state
	 * @deprecated This method is no longer needed as running is now a toggle
	 */
	updateRunningSpeed(): void {
		// Running speed is now managed by shift key toggle in constructor
		// Keeping this method for backward compatibility but it does nothing
	}

	/**
	 * Main movement method - handles all player movement logic
	 */
	move(): void {
		if (this.player && this.player.container && this.player.container.body && this.player.canMove) {
			const body = this.player.container.body as Phaser.Physics.Arcade.Body;
			body.setVelocity(0);

			// Update swimming and running states
			this.updateSwimmingState();
			this.updateRunningState();

			if (!this.player.isAtacking) {
				if (this.scene.input.isActive) {
					// Stop any previous movement from the last frame

					// Horizontal movement
					if ((this.cursors.left!.isDown || this.wasd.A?.isDown) && body.maxSpeed > 0) {
						body.setVelocityX(-this.player.speed);
						if (
							!this.cursors.up!.isDown &&
							!this.cursors.down!.isDown &&
							!this.wasd.W?.isDown &&
							!this.wasd.S?.isDown
						) {
							this.neverquestAnimationManager.setLeftAnimation();
						}
					}
					if ((this.cursors.right!.isDown || this.wasd.D?.isDown) && body.maxSpeed > 0) {
						body.setVelocityX(this.player.speed);
						if (
							!this.cursors.up!.isDown &&
							!this.cursors.down!.isDown &&
							!this.wasd.W?.isDown &&
							!this.wasd.S?.isDown
						) {
							this.neverquestAnimationManager.setRightAnimation();
						}
					}

					// Vertical movement
					if ((this.cursors.up!.isDown || this.wasd.W?.isDown) && body.maxSpeed > 0) {
						body.setVelocityY(-this.player.speed);
						if (
							!this.cursors.left!.isDown &&
							!this.cursors.right!.isDown &&
							!this.wasd.A?.isDown &&
							!this.wasd.D?.isDown
						) {
							this.neverquestAnimationManager.setUpAnimation();
						}
					}
					if ((this.cursors.down!.isDown || this.wasd.S?.isDown) && body.maxSpeed > 0) {
						if (
							!this.cursors.left!.isDown &&
							!this.cursors.right!.isDown &&
							!this.wasd.A?.isDown &&
							!this.wasd.D?.isDown
						) {
							this.neverquestAnimationManager.setDownAnimation();
						}
						body.setVelocityY(this.player.speed);
					}

					// Virtual joystick movement
					if (this.stick && this.stick.isDown) {
						const force = this.stick.force;
						const angle = this.stick.angle;

						if (force > Alpha.LOW) {
							const velocityX = Math.cos(angle) * this.player.speed * force;
							const velocityY = Math.sin(angle) * this.player.speed * force;

							body.setVelocity(velocityX, velocityY);

							// Set appropriate animation based on primary direction
							if (Math.abs(velocityX) > Math.abs(velocityY)) {
								if (velocityX > 0) {
									this.neverquestAnimationManager.setRightAnimation();
								} else {
									this.neverquestAnimationManager.setLeftAnimation();
								}
							} else {
								if (velocityY > 0) {
									this.neverquestAnimationManager.setDownAnimation();
								} else {
									this.neverquestAnimationManager.setUpAnimation();
								}
							}
						}
					}

					// GamePad movement
					this.neverquestGamePadController.sendInputs();
				}

				// Handle idle animation and particle effects
				if (!this.isMoving()) {
					this.neverquestAnimationManager.setIdleAnimation();
					if (this.player.walkDust) this.player.walkDust.on = false;
				} else {
					if (this.player.walkDust) this.player.walkDust.on = true;
				}
			}
		} else {
			// Player cannot move - stop all movement
			if (this.player && this.player.container && this.player.container.body) {
				const body = this.player.container.body as Phaser.Physics.Arcade.Body;
				body.setVelocity(0);
				this.neverquestAnimationManager.setIdleAnimation();
			}
		}
	}
}
