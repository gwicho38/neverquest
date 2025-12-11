import { BUFF_TYPES } from '../BuffTypes';
import { ITEM_TYPE } from '../ItemTypes';

/**
 * Food Items
 * Cooked meals and food consumables with buffs
 */
export const FOOD_ITEMS = [
	{
		id: 52,
		name: 'Alchemist Potion',
		type: ITEM_TYPE.USABLE,
		buffType: BUFF_TYPES.ATK01,
		description: 'A special potion brewed by the alchemist. Increases ATTACK by 8 for 90 seconds.',
		script: 'buff atk 8 90;',
		texture: 'atk_potion',
		sfx: 'heal',
		stackable: true,
		inventoryScale: 1.7,
	},
	{
		id: 93,
		name: 'Cooked Meal',
		type: ITEM_TYPE.USABLE,
		buffType: 0,
		description: 'A hearty cooked meal. Recovers 5 HP and grants temporary buffs.',
		script: 'rec hp 5; buff atk 3 60;',
		texture: 'red_potion',
		sfx: 'heal',
		stackable: true,
		inventoryScale: 1.7,
	},
	{
		id: 94,
		name: 'Hero Feast',
		type: ITEM_TYPE.USABLE,
		buffType: 0,
		description: 'A feast fit for heroes. Recovers 15 HP and grants major buffs.',
		script: 'rec hp 15; buff atk 7 120; buff def 5 120;',
		texture: 'treasure_chest',
		sfx: 'heal',
		stackable: true,
		inventoryScale: 1.7,
	},
];
