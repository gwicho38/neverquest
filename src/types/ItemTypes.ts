/**
 * @fileoverview Item type definitions for inventory system
 *
 * This file defines TypeScript interfaces for items:
 * - IItemConfig: Complete item definition with textures, scripts, buffs
 * - IInventoryItem: Inventory entry with count for stacking
 *
 * @see DB_SEED/Items - Item seed data
 * @see InventoryScene - Item display and usage
 *
 * @module types/ItemTypes
 */

import { ItemType } from '../models/ItemType';
import { BuffType } from '../models/BuffType';

export interface IItemConfig {
	id: number;
	name: string;
	type: ItemType;
	buffType: BuffType | number;
	description: string;
	script: string;
	texture: string;
	sfx: string;
	stackable: boolean;
	inventoryScale: number;
}

export interface IInventoryItem {
	id: number;
	count: number;
}
