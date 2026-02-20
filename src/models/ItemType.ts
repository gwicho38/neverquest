/**
 * @fileoverview Item type model class
 *
 * This file defines the ItemType model for categorizing items:
 * - Simple id/name structure for item categorization
 * - Used with ItemTypes seed data for item type definitions
 *
 * @see DB_SEED/ItemTypes - Item type definitions
 * @see InventoryScene - Item display and management
 *
 * @module models/ItemType
 */

export class ItemType {
	public id: number;
	public name: string;

	constructor(id: number, name: string) {
		this.id = id;
		this.name = name;
	}
}
