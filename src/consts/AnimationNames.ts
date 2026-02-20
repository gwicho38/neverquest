/**
 * @fileoverview Animation key name constants
 *
 * This class provides standardized animation key names:
 * - Walk animations (up, down, left, right)
 * - Attack animations per direction
 * - Idle animations per direction
 * - Jump and roll animations
 *
 * Extended by NeverquestAnimationManager and controllers.
 *
 * @see NeverquestAnimationManager - Uses animation names
 * @see NeverquestGamePadController - Extends this class
 *
 * @module consts/AnimationNames
 */

/**
 * @class
 */
export class AnimationNames {
	/**
	 * Name of the walk up animation.
	 * @default 'walk-up'
	 */
	public walkUpAnimationName: string;

	/**
	 * Name of the walk right animation.
	 * @default 'walk-right'
	 */
	public walkRightAnimationName: string;

	/**
	 * Name of the walk down animation.
	 * @default 'walk-down'
	 */
	public walkDownAnimationName: string;

	/**
	 * Name of the walk left animation.
	 * @default 'walk-left'
	 */
	public walkLeftAnimationName: string;

	/**
	 * This is specific for those who are using the joystick.
	 *
	 * The Neverquest animation manager expects the animations to have a prefix. The sufix is automatically added by the NeverquestAnimationManager class, like this:
	 * prefix: 'walk'
	 * sufix: '-right'
	 * By default the prefix is just 'walk' and the sufix is the direction that the player animation should play.
	 *
	 * The neverquest animation manager will play the default animation directions
	 * 'up', 'right', 'down', 'left'
	 *
	 * @example
	 * 'walk-right'
	 *
	 * @default 'walk'
	 */
	public walkPrefixAnimation: string;

	/**
	 * This is specific for those who are using the joystick.
	 *
	 * The Neverquest animation manager expects the animations to have a prefix. The sufix is automatically added by the NeverquestAnimationManager class, like this:
	 * prefix: 'atk'
	 * sufix: '-right'
	 * By default the prefix is just 'atk' and the sufix is the direction that the player animation should play.
	 *
	 * The neverquest animation manager will play the default animation directions
	 * 'up', 'right', 'down', 'left'
	 *
	 * @example
	 * 'atk-right'
	 *
	 * @default 'atk'
	 */
	public atkPrefixAnimation: string;

	/**
	 * This is specific for those who are using the joystick.
	 *
	 * The Neverquest animation manager expects the animations to have a prefix. The sufix is automatically added by the NeverquestAnimationManager class, like this:
	 * prefix: 'walk'
	 * sufix: '-right'
	 * By default the prefix is just 'walk' and the sufix is the direction that the player animation should play.
	 *
	 * The neverquest animation manager will play the default animation directions
	 * 'up', 'right', 'down', 'left'
	 *
	 * @example
	 * 'walk-right'
	 *
	 * @default 'idle'
	 */
	public idlePrefixAnimation: string;

	/**
	 * This is specific for those who are using the joystick.
	 *
	 * The Neverquest animation manager expects the animations to have a prefix.
	 * The sufix is can be changed in this variable:
	 * prefix: 'walk'
	 * sufix: '-up'
	 * By default the prefix is just 'walk' and the sufix is the direction that the player animation should play.
	 *
	 * The neverquest animation manager will play the default animation directions
	 * 'up', 'right', 'down', 'left'
	 *
	 * @example
	 * 'walk-up'
	 *
	 * @default '-up'
	 */
	public upAnimationSufix: string;

	/**
	 * This is specific for those who are using the joystick.
	 *
	 * The Neverquest animation manager expects the animations to have a prefix.
	 * The sufix is can be changed in this variable:
	 * prefix: 'walk'
	 * sufix: '-down'
	 * By default the prefix is just 'walk' and the sufix is the direction that the player animation should play.
	 *
	 * The neverquest animation manager will play the default animation directions
	 * 'up', 'right', 'down', 'left'
	 *
	 * @example
	 * 'walk-down'
	 *
	 * @default '-down'
	 */
	public downAnimationSufix: string;

	/**
	 * This is specific for those who are using the joystick.
	 *
	 * The Neverquest animation manager expects the animations to have a prefix.
	 * The sufix is can be changed in this variable:
	 * prefix: 'walk'
	 * sufix: '-right'
	 * By default the prefix is just 'walk' and the sufix is the direction that the player animation should play.
	 *
	 * The neverquest animation manager will play the default animation directions
	 * 'up', 'right', 'down', 'left'
	 *
	 * @example
	 * 'walk-right'
	 *
	 * @default '-right'
	 */
	public rightAnimationSufix: string;

	/**
	 * This is specific for those who are using the joystick.
	 *
	 * The Neverquest animation manager expects the animations to have a prefix.
	 * The sufix is can be changed in this variable:
	 * prefix: 'walk'
	 * sufix: '-left'
	 * By default the prefix is just 'walk' and the sufix is the direction that the player animation should play.
	 *
	 * The neverquest animation manager will play the default animation directions
	 * 'up', 'right', 'down', 'left'
	 *
	 * @example
	 * 'walk-left'
	 *
	 * @default '-left'
	 */
	public leftAnimationSufix: string;

	/**
	 * The class with the animation names. The names should have a prefix and a sufix, separated by a hifen or minus sign -
	 * the separator is used to change between animations idle/atk/walk.
	 * @example
	 * // Prefix = walk
	 * // Separator = -
	 * // Sufix = up.
	 * const walkUpAnimationName = 'walk-up';
	 */
	constructor() {
		this.walkUpAnimationName = 'walk-up';
		this.walkRightAnimationName = 'walk-right';
		this.walkDownAnimationName = 'walk-down';
		this.walkLeftAnimationName = 'walk-left';
		this.walkPrefixAnimation = 'walk';
		this.atkPrefixAnimation = 'atk';
		this.idlePrefixAnimation = 'idle';
		this.upAnimationSufix = 'up';
		this.downAnimationSufix = 'down';
		this.rightAnimationSufix = 'right';
		this.leftAnimationSufix = 'left';
	}
}
