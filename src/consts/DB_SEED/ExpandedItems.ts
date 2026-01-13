/**
 * Expanded Item Database
 * Comprehensive collection of items for the game expansion
 * Includes weapons, armor, consumables, and quest items
 */

// Re-export the original 4 items
export { DB_SEED_ITEMS } from './Items';

// Import and re-export all item categories
export { CONSUMABLE_ITEMS } from './items/consumables';
export { QUEST_ITEMS } from './items/quest-items';
export { WEAPON_ITEMS } from './items/weapons';
export { ARMOR_ITEMS } from './items/armor';
export { ACCESSORY_ITEMS } from './items/accessories';
export { FOOD_ITEMS } from './items/food';

// Import for combining
import { CONSUMABLE_ITEMS } from './items/consumables';
import { QUEST_ITEMS } from './items/quest-items';
import { WEAPON_ITEMS } from './items/weapons';
import { ARMOR_ITEMS } from './items/armor';
import { ACCESSORY_ITEMS } from './items/accessories';
import { FOOD_ITEMS } from './items/food';

// Combine all expanded items
export const ALL_EXPANDED_ITEMS = [
	...CONSUMABLE_ITEMS,
	...QUEST_ITEMS,
	...WEAPON_ITEMS,
	...ARMOR_ITEMS,
	...ACCESSORY_ITEMS,
	...FOOD_ITEMS,
];

// Total: 5 consumables + 13 quest items + 7 weapons + 6 armor + 6 accessories + 3 food = 40 new items
