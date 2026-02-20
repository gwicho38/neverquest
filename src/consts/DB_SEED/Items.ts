/**
 * @fileoverview Game item database seed data
 *
 * This file defines all in-game items with their properties:
 * - Consumable potions (health, attack buffs)
 * - Equipment items (weapons)
 * - Item scripts for effect execution
 *
 * Script format: ACTION STAT AMOUNT [DURATION]
 * - rec hp 2 = Recover 2 HP
 * - buff atk 5 60 = Buff attack by 5 for 60 seconds
 *
 * @see NeverquestConsumableManager - Executes item scripts
 * @see InventoryScene - Displays items
 * @see Item - Item entity class
 *
 * @module consts/DB_SEED/Items
 */

import { BUFF_TYPES } from './BuffTypes';
import { ITEM_TYPE } from './ItemTypes';

/**
 * @example
 * The 'script' works like this:
 * ACTION, WHAT, AMOUNT
 * ACTION: rec -> recover
 * WHAT: hp -> health
 * AMOUNT: 50
 * Will translate to -> Recover 50 HP.
 * Then the transpiles will take care to recover the HP.
 */
export const DB_SEED_ITEMS = [
	{
		id: 1,
		name: 'Red Potion',
		type: ITEM_TYPE.USABLE,
		buffType: 0, // Means you can use as many as you want. No restrictions.
		description: 'A small potion that recovers 2 Health Points [HP].',
		script: 'rec hp 2;',
		texture: 'red_potion',
		sfx: 'heal',
		stackable: true,
		inventoryScale: 1.7, // How much should the item scale when the inventory is opened.
	},
	{
		id: 2,
		name: 'Dark Potion',
		type: ITEM_TYPE.USABLE,
		buffType: BUFF_TYPES.ATK01,
		description: `They say this potion is only for those who have a strong heart, for those who drunk it became elves. (Increases the ATACK by 5 points for 60 seconds.)`,
		script: 'buff atk 5 60;',
		texture: 'atk_potion',
		sfx: 'heal',
		stackable: true,
		inventoryScale: 1.7, // How much should the item scale when the inventory is opened.
	},
	{
		id: 3,
		name: 'Treasure',
		type: ITEM_TYPE.USABLE,
		buffType: BUFF_TYPES.ATK01,
		description: `The treasure of the mighty, legend says that those who opened this box, became the most powerfull warriors of all time. (Increases the ATACK by 50 points for 120 seconds.)`,
		script: 'buff atk 50 120;',
		texture: 'treasure_chest',
		sfx: 'equip_item',
		stackable: true,
		inventoryScale: 1.7, // How much should the item scale when the inventory is opened.
	},
	{
		id: 4,
		name: 'Mighty Sword',
		type: ITEM_TYPE.USABLE,
		buffType: BUFF_TYPES.ATK02,
		description: `A powerfull sword created by merlin The Wizzard of Wizzards. Used to break stones, it's durability is out of the blue. (Increases the ATACK by 5 points for 120 seconds. Carrier can only have one of these)`,
		script: 'buff atk 5 120;',
		texture: 'mighty_sword',
		sfx: 'equip_item',
		stackable: true,
		inventoryScale: 1.7,
	},
	{
		id: 5,
		name: 'Cold Resistance Potion',
		type: ITEM_TYPE.USABLE,
		buffType: 0,
		description: 'A frost-blue potion brewed from glacial herbs. Warms the body and restores 3 Health Points [HP].',
		script: 'rec hp 3;',
		texture: 'atk_potion',
		sfx: 'heal',
		stackable: true,
		inventoryScale: 1.7,
	},
	{
		id: 6,
		name: 'Yeti Fur',
		type: ITEM_TYPE.MISC,
		buffType: 0,
		description: 'Thick white fur torn from a mighty Yeti. Prized by armorers for its natural frost resistance.',
		script: '',
		texture: 'treasure_chest',
		sfx: 'get_items',
		stackable: true,
		inventoryScale: 1.7,
	},
	{
		id: 7,
		name: 'Frozen Heart',
		type: ITEM_TYPE.MISC,
		buffType: 0,
		description: 'A crystallized heart of pure ice, taken from the Frost Giant. Pulses with ancient cold magic.',
		script: '',
		texture: 'treasure_chest',
		sfx: 'get_items',
		stackable: false,
		inventoryScale: 1.7,
	},
	{
		id: 8,
		name: 'Molten Core',
		type: ITEM_TYPE.MISC,
		buffType: 0,
		description: 'A searing sphere of condensed magma. Essential for forging fire-enchanted weapons and armor.',
		script: '',
		texture: 'treasure_chest',
		sfx: 'get_items',
		stackable: true,
		inventoryScale: 1.7,
	},
	{
		id: 9,
		name: 'Heat Resistance Armor Piece',
		type: ITEM_TYPE.MISC,
		buffType: 0,
		description: 'A fragment of volcanic obsidian armor. When combined, provides protection against extreme heat.',
		script: '',
		texture: 'mighty_sword',
		sfx: 'equip_item',
		stackable: true,
		inventoryScale: 1.7,
	},
	{
		id: 10,
		name: 'Drake Scale',
		type: ITEM_TYPE.MISC,
		buffType: 0,
		description: 'A shimmering scale shed by a Fire Drake. Used in crafting heat-resistant shields.',
		script: '',
		texture: 'treasure_chest',
		sfx: 'get_items',
		stackable: true,
		inventoryScale: 1.7,
	},
	{
		id: 11,
		name: 'Worm Carapace',
		type: ITEM_TYPE.MISC,
		buffType: 0,
		description: 'The hardened shell of a Magma Worm. Extremely durable and highly sought after by craftsmen.',
		script: '',
		texture: 'treasure_chest',
		sfx: 'get_items',
		stackable: true,
		inventoryScale: 1.7,
	},
	{
		id: 12,
		name: 'Dragon Scale',
		type: ITEM_TYPE.MISC,
		buffType: 0,
		description: 'A legendary scale from the Fire Dragon. Said to contain the essence of dragonfire itself.',
		script: '',
		texture: 'treasure_chest',
		sfx: 'get_items',
		stackable: false,
		inventoryScale: 1.7,
	},
	{
		id: 13,
		name: 'Ice Shard',
		type: ITEM_TYPE.MISC,
		buffType: 0,
		description: 'A razor-sharp fragment of enchanted ice that never melts. Used in crafting frost weapons.',
		script: '',
		texture: 'treasure_chest',
		sfx: 'get_items',
		stackable: true,
		inventoryScale: 1.7,
	},
];
