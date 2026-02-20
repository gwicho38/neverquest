/**
 * @fileoverview Central type exports for Neverquest
 *
 * This barrel file provides a single import point for all game types:
 * - Item, Enemy, Scene, and Combat type interfaces
 * - Common utility types (Position, Size, Direction)
 * - Player capability and state flags
 * - Animation and input type definitions
 *
 * Import types from here rather than individual files for consistency.
 *
 * @example
 * import { IItemConfig, IEnemyConfig, IGameScene, ICombatEntity } from '../types';
 *
 * @module types
 */

// =============================================================================
// ITEM TYPES
// =============================================================================

export type { IItemConfig, IInventoryItem } from './ItemTypes';

// =============================================================================
// ENEMY TYPES
// =============================================================================

export type { IEnemyConfig } from './EnemyTypes';

// =============================================================================
// SCENE TYPES
// =============================================================================

export type { IGameScene, IPreloadScene, IMainScene, IDialogScene, IHUDScene, IWarpableScene } from './SceneTypes';

// =============================================================================
// COMBAT TYPES
// =============================================================================

export type {
	ICombatEntity,
	IDamageResult,
	IHitboxConfig,
	IAttackDirection,
	ICombatEvent,
	IBlockState,
} from './CombatTypes';

// =============================================================================
// ENTITY TYPES (re-exported from entity files)
// =============================================================================

// Note: These are exported from their source files but documented here for reference
// import { IBaseEntity } from '../entities/BaseEntity';
// import { IEntityAttributes } from '../entities/EntityAttributes';

// =============================================================================
// DIALOG TYPES (re-exported from plugin files)
// =============================================================================

// Note: Dialog types are defined in NeverquestDialogBox.ts
// import { IDialogChat, IDialogTextMessage, IDialog } from '../plugins/NeverquestDialogBox';

// =============================================================================
// COMMON UTILITY TYPES
// =============================================================================

/**
 * Position in 2D space
 */
export interface IPosition {
	x: number;
	y: number;
}

/**
 * Size dimensions
 */
export interface ISize {
	width: number;
	height: number;
}

/**
 * Rectangular bounds
 */
export interface IBounds extends IPosition, ISize {}

/**
 * Direction enum for movement and animations
 */
export type Direction = 'up' | 'down' | 'left' | 'right';

/**
 * Animation state for entities
 */
export type AnimationState = 'idle' | 'walk' | 'run' | 'attack' | 'block' | 'hurt' | 'death';

/**
 * Player capability flags
 * @see CLAUDE.md for state management patterns
 */
export interface IPlayerCapabilities {
	canMove: boolean;
	canAtack: boolean;
	canBlock: boolean;
	canTakeDamage: boolean;
	canSwim: boolean;
	canJump: boolean;
	canRoll: boolean;
}

/**
 * Player state flags
 */
export interface IPlayerState {
	isAtacking: boolean;
	isBlocking: boolean;
	isSwimming: boolean;
	isRunning: boolean;
	isJumping: boolean;
	isRolling: boolean;
}

/**
 * Generic callback type for event handlers
 */
export type EventCallback<T = void> = (data: T) => void;

/**
 * Nullable type helper
 */
export type Nullable<T> = T | null;

/**
 * Optional type helper
 */
export type Optional<T> = T | undefined;

/**
 * Deep partial type helper for configuration objects
 */
export type DeepPartial<T> = {
	[P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// =============================================================================
// INPUT TYPES
// =============================================================================

/**
 * Interface for virtual joystick stick properties used by movement controllers
 * This represents the minimal properties needed from VirtualJoystick BaseStick
 */
export interface IVirtualJoystickStick {
	/** Whether the stick is currently being pressed/held */
	isDown: boolean;
	/** The current force being applied (0-1) */
	force: number;
	/** The current angle in radians */
	angle: number;
}

// =============================================================================
// ANIMATION TYPES
// =============================================================================

/**
 * Interface for animation configuration used by PreloadScene
 */
export interface IAnimationConfig {
	/** The texture atlas containing the animation frames */
	atlas: string;
	/** Unique key to identify this animation */
	key: string;
	/** Frames per second for playback */
	frameRate: number;
	/** Prefix for frame names in the atlas */
	prefix: string;
	/** Starting frame number */
	start: number;
	/** Ending frame number */
	end: number;
	/** Number of digits for zero-padding frame numbers */
	zeroPad: number;
	/** Number of times to repeat (-1 for infinite) */
	repeat: number;
}

// =============================================================================
// SCALE/RESIZE TYPES
// =============================================================================

/**
 * Interface for resize event data from Phaser ScaleManager
 */
export interface IResizeSize {
	width: number;
	height: number;
	aspectRatio?: number;
}
