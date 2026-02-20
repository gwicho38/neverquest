/**
 * @fileoverview Buff type model class
 *
 * This file defines the BuffType model for categorizing buffs:
 * - Simple id/name structure for buff categorization
 * - Used with BuffTypes seed data for buff definitions
 *
 * @see DB_SEED/BuffTypes - Buff type definitions
 * @see NeverquestConsumableManager - Buff application system
 *
 * @module models/BuffType
 */

export class BuffType {
	public id: number;
	public name: string;

	constructor(id: number, name: string) {
		this.id = id;
		this.name = name;
	}
}
