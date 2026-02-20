/**
 * @fileoverview Base entity interface and class for game objects
 *
 * This file defines the common interface for all game entities:
 * - State flags (attacking, blocking, moving, etc.)
 * - Physics body reference
 * - Direction and facing
 * - Hit zone for combat
 *
 * Extended by Player and Enemy classes.
 *
 * @see Player - Player entity implementation
 * @see Enemy - Enemy entity implementation
 *
 * @module entities/BaseEntity
 */

/**
 * Base entity interface for all game entities
 */
export interface IBaseEntity {
	/**
	 * A Unique ID to identify the Entity.
	 */
	id: string | null;

	/**
	 * Controls if the entity is attacking.
	 */
	isAtacking: boolean;

	/**
	 * Controls if the player can attack.
	 */
	canAtack: boolean;

	/**
	 * Controls if the player can move.
	 */
	canMove: boolean;

	/**
	 * Controls if the entity can take damage.
	 */
	canTakeDamage: boolean;

	/**
	 * Controls if the entity is currently blocking.
	 */
	isBlocking: boolean;

	/**
	 * Controls if the entity can block.
	 */
	canBlock: boolean;

	/**
	 * This variable controls when the attack hitbox will appear.
	 */
	showHitBox: boolean;

	/**
	 * The perception range of the entity. Usually the field of view.
	 */
	perceptionRange: number;

	/**
	 * Controls if the entity is currently swimming.
	 */
	isSwimming: boolean;

	/**
	 * Controls if the entity can swim.
	 */
	canSwim: boolean;

	/**
	 * Controls if the entity is currently running.
	 */
	isRunning: boolean;

	/**
	 * The base movement speed when not swimming or running.
	 */
	baseSpeed: number;

	/**
	 * The movement speed while swimming (slower than normal).
	 */
	swimSpeed: number;

	/**
	 * The movement speed while running (faster than normal).
	 */
	runSpeed: number;
}

/**
 * @namespace
 */
export const BaseEntity: IBaseEntity = {
	id: null,
	isAtacking: false,
	canAtack: true,
	canMove: true,
	canTakeDamage: true,
	isBlocking: false,
	canBlock: true,
	showHitBox: false,
	perceptionRange: 75,
	isSwimming: false,
	canSwim: true,
	isRunning: false,
	baseSpeed: 200,
	swimSpeed: 100,
	runSpeed: 300,
};
