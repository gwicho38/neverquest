/**
 * @fileoverview Combat system type definitions
 *
 * Provides types for the combat system to replace common `any` usages.
 * These types help with:
 * - Attack and damage calculations
 * - Hitbox management
 * - Combat state tracking
 *
 * @see NeverquestBattleManager - Uses these types
 * @see NeverquestEntityTextDisplay - Damage number display
 *
 * @module types/CombatTypes
 */

import Phaser from 'phaser';
import { IEntityAttributes } from '../entities/EntityAttributes';

/**
 * Entity that can participate in combat
 * Used to type attackers and targets in the battle system
 */
export interface ICombatEntity {
	/** The Phaser scene this entity belongs to */
	scene: Phaser.Scene;

	/** Entity's combat attributes */
	attributes: IEntityAttributes;

	/** Name identifier for the entity type */
	entityName: string;

	/** The physics container for this entity */
	container: Phaser.GameObjects.Container;

	/** Hit detection zone */
	hitZone: Phaser.GameObjects.Zone;

	/** Current animation frame */
	frame: Phaser.Textures.Frame;

	/** Whether sprite is horizontally flipped */
	flipX: boolean;

	/** Animation manager */
	anims: Phaser.Animations.AnimationState;

	/** Texture reference */
	texture: Phaser.Textures.Texture;

	/** Whether entity can currently take damage */
	canTakeDamage: boolean;

	/** Whether entity can currently attack */
	canAtack: boolean;

	/** Whether entity can currently move */
	canMove: boolean;

	/** Whether entity is currently attacking */
	isAtacking: boolean;

	/** Whether entity is currently blocking */
	isBlocking: boolean;

	/** Whether entity can block */
	canBlock: boolean;

	/** Entity's current speed */
	speed: number;

	/** Health bar component (optional) */
	healthBar?: {
		decrease: (amount: number) => void;
	};

	/** HUD progress bar (optional, player only) */
	neverquestHUDProgressBar?: {
		updateHealth: () => void;
	};

	/** Experience points awarded on death (enemies) */
	exp?: number;

	/** Item drop function (enemies) */
	dropItems?: () => void;

	/** Destroy all components */
	destroyAll?: () => void;

	/** Whether entity is active */
	active: boolean;
}

/**
 * Result of a damage calculation
 */
export interface IDamageResult {
	/** Final damage after calculations */
	damage: number;

	/** Whether this was a critical hit */
	isCritical: boolean;

	/** Whether the attack hit (not dodged) */
	didHit: boolean;

	/** Sound effect to play */
	soundName: string;
}

/**
 * Hitbox configuration for attacks
 */
export interface IHitboxConfig {
	/** X position offset from attacker */
	offsetX: number;

	/** Y position offset from attacker */
	offsetY: number;

	/** Rotation in radians */
	rotation: number;

	/** Sprite texture key */
	spriteKey: string;
}

/**
 * Attack direction configuration
 */
export interface IAttackDirection {
	up: string;
	right: string;
	down: string;
	left: string;
}

/**
 * Combat event data for logging
 */
export interface ICombatEvent {
	/** Type of combat event */
	type: 'hit' | 'miss' | 'critical' | 'block' | 'death';

	/** Attacker entity name */
	attacker: string;

	/** Target entity name */
	target: string;

	/** Damage dealt (if applicable) */
	damage?: number;

	/** Experience awarded (if kill) */
	experience?: number;
}

/**
 * Block state for an entity
 */
export interface IBlockState {
	/** Whether currently blocking */
	isBlocking: boolean;

	/** Defense bonus while blocking */
	defenseBonus: number;

	/** Time when block started */
	blockStartTime?: number;
}
