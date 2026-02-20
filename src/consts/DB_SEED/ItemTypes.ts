/**
 * @fileoverview Item type category definitions
 *
 * This file defines the main item categories:
 * - EQUIP: Wearable equipment items
 * - USABLE: Consumable items (potions, scrolls)
 * - MISC: Miscellaneous items (keys, quest items)
 *
 * Used for inventory organization and item behavior.
 *
 * @see InventoryScene - Displays items by type
 * @see InventorySorter - Sorts by item type
 *
 * @module consts/DB_SEED/ItemTypes
 */

import { ItemType } from '../../models/ItemType';

export const ITEM_TYPE = {
	EQUIP: new ItemType(1, 'Equip'),
	USABLE: new ItemType(2, 'Usable'),
	MISC: new ItemType(3, 'Misc'),
};
