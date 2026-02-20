/**
 * @fileoverview Buff type definitions for consumable effects
 *
 * This file defines buff types that restrict consumable stacking:
 * - ATK01: Basic attack buff (can stack with others)
 * - ATK02: Strong attack buff (unique, cannot stack)
 *
 * Used by consumable items to prevent buff conflicts.
 *
 * @see NeverquestConsumableManager - Applies buffs
 * @see Items - Uses buff types
 *
 * @module consts/DB_SEED/BuffTypes
 */

import { BuffType } from '../../models/BuffType';

export const BUFF_TYPES = {
	ATK01: new BuffType(1, 'Atack 01'),
	ATK02: new BuffType(2, 'Atack 02'),
};
