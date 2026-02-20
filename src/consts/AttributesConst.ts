/**
 * @fileoverview Attack calculation constants
 *
 * This file defines constants for attack damage calculations:
 * - Attack bonus dividers for damage scaling
 * - Attack bonus multipliers
 * - Level-based attack bonuses
 *
 * @see NeverquestBattleManager - Uses these for combat
 * @see EntityAttributes - Applies attack bonuses
 *
 * @module consts/AttributesConst
 */

/**
 * These are the attributes constants.
 * @constant
 */
export const ATTRIBUTES_CONST = {
	ATK: {
		/**
		 * The atack bonus divider.
		 */
		DIVIDER01: 10,
		/**
		 * The atack bonus divider.
		 */
		DIVIDER02: 3,
		/**
		 * The atack bonus multiplier.
		 */
		BONUS_MULTIPLIER: 2,

		/**
		 * Atack bonus, for every 10 levels.
		 */
		BONUS_LEVEL_MULTIPLIER: 1,
	},
};
