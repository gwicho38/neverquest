/**
 * @fileoverview Entity attribute calculation and management
 *
 * This class handles derived stat calculations from base attributes:
 * - Converts raw attributes (STR, VIT, AGI, DEX, INT) to combat stats
 * - Applies equipment bonuses
 * - Applies consumable/buff effects
 * - Tracks stat point allocation
 *
 * Stat derivation formulas:
 * - Attack: STR * 2 + equipment bonus
 * - Defense: VIT * 1.5 + equipment bonus
 * - Speed: AGI * 1.2 + base speed
 * - Critical: DEX * 0.5%
 * - Magic: INT * 2
 *
 * @see EntityAttributes - Stores calculated values
 * @see Player - Primary user of attribute calculations
 * @see ATTRIBUTES_CONST - Base stat modifiers
 *
 * @module plugins/attributes/AttributesManager
 */

import { ATTRIBUTES_CONST } from '../../consts/AttributesConst';
import lodash from 'lodash';
import { BUFF_TYPES } from '../../consts/DB_SEED/BuffTypes';
import { IConsumableBonus } from '../../entities/EntityAttributes';

/**
 * Valid attribute keys for raw attributes
 */
export type RawAttributeKey = 'str' | 'vit' | 'agi' | 'dex' | 'int';

/**
 * Raw attributes record type
 */
export interface IRawAttributes {
	str: number;
	vit: number;
	agi: number;
	dex: number;
	[key: string]: number;
}

interface EntityStats {
	level: number;
	baseHealth: number;
	health: number;
	maxHealth: number;
	defense: number;
	atack: number;
	speed: number;
	critical: number;
	flee: number;
	hit: number;
	rawAttributes: IRawAttributes;
	availableStatPoints: number;
	bonus: {
		consumable: IConsumableBonus[];
	};
}

interface Entity {
	attributes: EntityStats;
	healthBar?: {
		full: number;
		health?: number;
		update: (health: number) => void;
		draw?: () => void;
	};
	neverquestHUDProgressBar?: {
		updateExp?: (exp: number, nextExp: number) => void;
		updateHp?: (hp: number, maxHp: number) => void;
		updateHealth?: () => void;
	};
}

/**
 * The Class responsible for managing the status of and entity.
 * @class
 */
export class AttributesManager {
	scene: Phaser.Scene;
	entity: Entity;
	statsCopy: EntityStats;
	firstTime: boolean;
	leveledUp: boolean;
	changedAttribute: boolean;

	/**
	 * The Class responsible for managing the status of and entity.
	 * @param { Phaser.Scene } scene The Phaser Scene.
	 * @param { Player | Enemy } entity The Entity that will have it's statuses calculated.
	 */
	constructor(scene: Phaser.Scene, entity: Entity) {
		/**
		 * The Phaser Scene of the Status Manager.
		 * @type { Phaser.Scene }
		 */
		this.scene = scene;

		/**
		 * The entity that will have it's statusses changed by this manager..
		 * @type { Player | Enemy}
		 */
		this.entity = entity;

		/**
		 * A copy of the entity
		 * @type { EntityStats }
		 */
		this.statsCopy = lodash.cloneDeep(this.entity.attributes);

		/**
		 * Is this the first time the loop is called?
		 * @type { boolean }
		 */
		this.firstTime = true;

		/**
		 * Controls if the player has leveled up.
		 * @type { boolean }
		 */
		this.leveledUp = false;

		/**
		 * Controls if the player changed its attributes.
		 * @type { boolean }
		 */
		this.changedAttribute = false;

		this.calculateStats();

		this.scene.events.on('update', this.calculateStats, this);
	}

	/**
	 * Calculates all attributes of the entity.
	 */
	calculateStats(): void {
		this.checkLevelChange();
		this.calculateHealth();
		this.calculateDefense();
		this.calculateAtack();
		this.calculateSpeed();
		this.calculateCritical();
		this.calculateFlee();
		this.calculateHit();

		this.firstTime = false;
		this.leveledUp = false;
		this.changedAttribute = false;
	}

	/**
	 * If the level changed, it means that the player has leveled up.
	 * Then it should update the core attributes.
	 */
	checkLevelChange(): void {
		if (this.statsCopy.level != this.entity.attributes.level) {
			this.statsCopy.level = this.entity.attributes.level;
			this.leveledUp = true;
		}
	}

	/**
	 * Calculates the Health every tick.
	 */
	calculateHealth(): void {
		this.entity.attributes.baseHealth =
			this.statsCopy.baseHealth +
			this.entity.attributes.level * 10 +
			this.entity.attributes.rawAttributes.vit * 3;
		// Update maxHealth to match baseHealth (+ any bonuses from equipment)
		this.entity.attributes.maxHealth = this.entity.attributes.baseHealth;
		if (this.entity.healthBar) this.entity.healthBar.draw();
		if (this.firstTime || this.leveledUp) {
			if (this.entity.healthBar && this.leveledUp) {
				this.entity.healthBar.full = this.entity.attributes.baseHealth;
				this.entity.healthBar.health = this.entity.attributes.baseHealth;
				this.entity.healthBar.draw();
			} else if (this.entity.healthBar) {
				this.entity.healthBar.full = this.entity.attributes.baseHealth;
			}
			this.entity.attributes.health = this.entity.attributes.baseHealth;
			if (this.entity.neverquestHUDProgressBar) this.entity.neverquestHUDProgressBar.updateHealth();
		}
	}
	/**
	 * Calculates defense every tick.
	 */
	calculateDefense(): void {
		if (this.firstTime || this.leveledUp || this.changedAttribute) {
			this.entity.attributes.defense = this.statsCopy.defense + this.entity.attributes.rawAttributes.vit;
		}
	}
	/**
	 * Calculates Atack every Tick.
	 */
	calculateAtack(): void {
		if (this.firstTime || this.leveledUp || this.changedAttribute) {
			const multiplicator = Math.floor(this.entity.attributes.rawAttributes.str / ATTRIBUTES_CONST.ATK.DIVIDER01);
			const atackBonus = multiplicator * ATTRIBUTES_CONST.ATK.BONUS_MULTIPLIER;
			const level_multiplier = Math.floor(this.entity.attributes.level / ATTRIBUTES_CONST.ATK.DIVIDER02);
			const level_atack_bonus = level_multiplier * ATTRIBUTES_CONST.ATK.BONUS_LEVEL_MULTIPLIER;
			let consumable_atack = 0;
			this.entity.attributes.bonus.consumable.forEach((item) => {
				Object.values(BUFF_TYPES).forEach((buffType) => {
					if (item.uniqueId === buffType.id) {
						consumable_atack += item.value;
					}
				});
			});
			this.entity.attributes.atack =
				this.statsCopy.atack +
				this.entity.attributes.rawAttributes.str +
				atackBonus +
				level_atack_bonus +
				consumable_atack;
		}
	}
	/**
	 * Calculates Speed every tick.
	 */
	calculateSpeed(): void {
		// TODO - This should be updated with items and consumables.
		// if (this.firstTime) {
		//     this.entity.attributes.speed = this.statsCopy.speed + this.entity.attributes.rawAttributes.agi;
		//     console.log('Speed:', this.entity.attributes.speed);
		// }
	}
	/**
	 * Calculates Critical every Tick.
	 */
	calculateCritical(): void {
		if (this.firstTime || this.leveledUp || this.changedAttribute) {
			this.entity.attributes.critical = this.statsCopy.critical + this.entity.attributes.rawAttributes.agi;
		}
	}
	/**
	 * Calculates Flee every tick.
	 */
	calculateFlee(): void {
		if (this.firstTime || this.leveledUp || this.changedAttribute) {
			this.entity.attributes.flee = this.statsCopy.flee + this.entity.attributes.rawAttributes.agi;
		}
	}

	/**
	 * Calculates Hit every tick.
	 */
	calculateHit(): void {
		if (this.firstTime || this.leveledUp || this.changedAttribute) {
			this.entity.attributes.hit = this.statsCopy.hit + this.entity.attributes.rawAttributes.dex;
		}
	}

	addAttribute(attribute: RawAttributeKey, amount: number, _lastRawAttributes: IRawAttributes): void {
		if (this.entity.attributes.availableStatPoints >= amount) {
			this.entity.attributes.rawAttributes[attribute] += amount;
			this.entity.attributes.availableStatPoints -= amount;
			this.changedAttribute = true;
		}
	}

	removeAttribute(attribute: RawAttributeKey, amount: number, lastRawAttributes: IRawAttributes): void {
		if (this.entity.attributes.rawAttributes[attribute] > lastRawAttributes[attribute]) {
			this.entity.attributes.rawAttributes[attribute] -= amount;
			this.entity.attributes.availableStatPoints += amount;
			this.changedAttribute = true;
		}
	}
}
