/**
 * @fileoverview Entity drop configuration model
 *
 * This file defines the EntityDrops model class:
 * - Configures item drops from defeated enemies
 * - Specifies item ID and drop chance percentage
 * - Used by NeverquestDropSystem for loot generation
 *
 * @see NeverquestDropSystem - Drop spawning system
 * @see EnemiesSeedConfig - Enemy drop configurations
 *
 * @module models/EntityDrops
 */

/**
 * The entity drops configuration object.
 * @class
 */
export class EntityDrops {
	/**
	 * The ID of the Item on the DB or Seed.
	 */
	public id: number;

	/**
	 * The chance of an item to be dropped in percentage.
	 */
	public chance: number;

	/**
	 * @param id The ID of the Item on the DB or Seed.
	 * @param chance The chance of dropping the item.
	 */
	constructor(id: number, chance: number) {
		this.id = id;
		this.chance = chance;
	}
}
