import { BUFF_TYPES } from '../BuffTypes';
import { ITEM_TYPE } from '../ItemTypes';

/**
 * Consumable Items
 * Healing potions, buff potions, and other single-use items
 */
export const CONSUMABLE_ITEMS = [
	{
		id: 5,
		name: 'Greater Health Potion',
		type: ITEM_TYPE.USABLE,
		buffType: 0,
		description: 'A potent healing potion that recovers 10 Health Points.',
		script: 'rec hp 10;',
		texture: 'red_potion',
		sfx: 'heal',
		stackable: true,
		inventoryScale: 1.7,
	},
	{
		id: 6,
		name: 'Super Health Potion',
		type: ITEM_TYPE.USABLE,
		buffType: 0,
		description: 'An extremely powerful potion that recovers 25 Health Points.',
		script: 'rec hp 25;',
		texture: 'red_potion',
		sfx: 'heal',
		stackable: true,
		inventoryScale: 1.7,
	},
	{
		id: 7,
		name: 'Defense Potion',
		type: ITEM_TYPE.USABLE,
		buffType: BUFF_TYPES.DEF01,
		description: 'Hardens your skin like stone. Increases DEFENSE by 5 for 60 seconds.',
		script: 'buff def 5 60;',
		texture: 'atk_potion',
		sfx: 'heal',
		stackable: true,
		inventoryScale: 1.7,
	},
	{
		id: 8,
		name: 'Speed Potion',
		type: ITEM_TYPE.USABLE,
		buffType: BUFF_TYPES.SPD01,
		description: 'Makes you light as a feather. Increases SPEED by 10 for 60 seconds.',
		script: 'buff spd 10 60;',
		texture: 'atk_potion',
		sfx: 'heal',
		stackable: true,
		inventoryScale: 1.7,
	},
	{
		id: 9,
		name: 'Elixir of Power',
		type: ITEM_TYPE.USABLE,
		buffType: BUFF_TYPES.ATK01,
		description: 'Ultimate power in a bottle. Increases ATTACK by 15 for 120 seconds.',
		script: 'buff atk 15 120;',
		texture: 'treasure_chest',
		sfx: 'equip_item',
		stackable: true,
		inventoryScale: 1.7,
	},
];
