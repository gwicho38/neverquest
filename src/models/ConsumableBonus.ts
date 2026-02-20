/**
 * @fileoverview Consumable bonus model for temporary stat effects
 *
 * This file defines the ConsumableBonus model class:
 * - Tracks temporary stat modifications from consumables
 * - Manages bonus duration via Phaser.Time.TimerEvent
 * - Stores stat name, value, and active time
 *
 * @see NeverquestConsumableManager - Applies consumable bonuses
 * @see DB_SEED/Items - Consumable item definitions
 *
 * @module models/ConsumableBonus
 */

/**
 * This is a Model Class of the Consumable Bonus.
 * @class
 */
export class ConsumableBonus {
	/**
	 * The Unique ID
	 */
	public uniqueId: number;

	/**
	 * The stat bonus string, this is the name of the Entity Status Variable.
	 */
	public statBonus: string;

	/**
	 * The value of bonus change.
	 */
	public value: number;

	/**
	 * The time that the bonus will remain active.
	 */
	public time: number;

	/**
	 * The time event that will remove the bonus.
	 */
	public timer: Phaser.Time.TimerEvent | null;

	constructor(id: number, statBonus: string, value: number, time: number) {
		this.uniqueId = id;
		this.statBonus = statBonus;
		this.value = value;
		this.time = time;
		this.timer = null;
	}
}
