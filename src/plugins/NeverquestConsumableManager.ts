/**
 * @fileoverview Consumable item usage and buff management for Neverquest
 *
 * This plugin handles consumable item effects including:
 * - Health potion consumption and recovery
 * - Temporary stat buffs (strength, defense, etc.)
 * - Buff duration tracking and expiration
 * - Visual feedback via text displays
 * - Sound effect playback
 *
 * Consumable types supported:
 * - RECOVERY: Instant health restoration
 * - BUFF: Temporary attribute bonuses
 * - ATTACK: Damage boost effects
 * - DEFENSE: Protection boost effects
 *
 * @see InventoryScene - Triggers consumable usage
 * @see Player - Receives consumable effects
 * @see NeverquestEntityTextDisplay - Shows recovery text
 *
 * @module plugins/NeverquestConsumableManager
 */

import { ConsumableBonus } from '../models/ConsumableBonus';
import { BuffType } from '../models/BuffType';
import { Player } from '../entities/Player';
import { NeverquestEntityTextDisplay } from './NeverquestEntityTextDisplay';
import { HUDScene } from '../scenes/HUDScene';
import { ConsumableMessages } from '../consts/Messages';
import { ConsumableManagerValues } from '../consts/Numbers';

/**
 * Interface for consumable items that can be used by the ConsumableManager.
 * Supports both IItemConfig (sfx) and Item entity (useSfx) patterns.
 */
interface IConsumableItem {
	name: string;
	script: string;
	sfx?: string;
	useSfx?: string;
	buffType?: BuffType | number;
}

/**
 * This class is responsible for Manage all the consumable actions.
 * @class
 */
export class NeverquestConsumableManager {
	/**
	 * The NeverquestEntityTextDisplay instance for showing damage/recovery text.
	 */
	neverquestEntityTextDisplay: NeverquestEntityTextDisplay | null;

	constructor() {
		this.neverquestEntityTextDisplay = null;
	}

	/**
	 * Gets the sound effect key from an item, supporting both sfx and useSfx properties.
	 */
	private getItemSfx(item: IConsumableItem): string {
		return item.sfx || item.useSfx || '';
	}

	/**
	 * Checks what kind of item is being used.
	 * @param item the Item that is being used.
	 * @param player The player that will use the item.
	 */
	useItem(item: IConsumableItem, player: Player): void {
		const scriptList = item.script.split(';').filter((v: string) => v);
		if (scriptList.length > 0) {
			scriptList.forEach((script: string) => {
				const scriptActions = script.split(' ');
				switch (scriptActions[0]) {
					case 'rec':
						this.recover(item, scriptActions, player);
						break;
					case 'buff':
						this.buff(item, scriptActions, player);
						break;

					default:
						console.warn('This is not a usable item.');
						break;
				}
			});
		}
	}

	/**
	 * Recover something based on the given item script.
	 * @param item the item that will recover the status.
	 * @param action The script action that will be performed.
	 * @param player The player that will use the item.
	 */
	recover(item: IConsumableItem, action: string[], player: Player): void {
		// Not very Optimized.
		this.neverquestEntityTextDisplay = new NeverquestEntityTextDisplay(player.scene);

		// TODO - Create an animation to display the usage of a consumable.
		switch (action[1]) {
			case 'hp': {
				const healAmount = parseInt(action[2]);
				player.attributes.health = Math.min(
					player.attributes.baseHealth,
					(player.attributes.health += healAmount)
				);
				player.healthBar.update(player.attributes.health);
				if (player.neverquestHUDProgressBar) player.neverquestHUDProgressBar.updateHealth();
				this.neverquestEntityTextDisplay.displayDamage(healAmount, player, false, true);
				player.scene.sound.play(this.getItemSfx(item));
				// Log item usage
				HUDScene.log(player.scene, ConsumableMessages.USED_ITEM_HP_RESTORE(item.name, healAmount));
				break;
			}
			case 'sp':
				// SP recovery not yet implemented
				break;
			case 'atk':
				// ATK bonus not yet implemented in recovery
				break;

			default:
				break;
		}
	}

	/**
	 * Performs a Buff based on the incoming parameters.
	 * @param item the item that will give the buff.
	 * @param action The script action that will be performed.
	 * @param player The player that will use the item.
	 */
	buff(item: IConsumableItem, action: string[], player: Player): void {
		switch (action[1]) {
			case 'hp':
				// Sets the Health, but doesn't exceed the maximum base health.

				break;
			case 'sp':
				// SP buff not yet implemented
				break;
			case 'atk': {
				const buffId = typeof item.buffType === 'number' ? item.buffType : (item.buffType?.id ?? 0);
				const consumableBonus = player.attributes.bonus.consumable.find(
					(consumableItem) => consumableItem.uniqueId === buffId
				);
				if (consumableBonus) {
					player.scene.sound.play(this.getItemSfx(item));
					consumableBonus.timer.reset({
						callbackScope: this,
						delay: consumableBonus.time * ConsumableManagerValues.BUFF_DURATION_MULTIPLIER, // Time to restore the attributes to it's default value.
						callback: this.changeStats, // Callback
						args: [player, consumableBonus, -1], // Params
					});
				} else {
					// Add the item
					const bonusStatus = new ConsumableBonus(
						buffId,
						'atack',
						parseInt(action[2], 10),
						parseInt(action[3], 10)
					);
					this.changeStats(player, bonusStatus);

					player.scene.sound.play(this.getItemSfx(item));
					bonusStatus.timer = player.scene.time.addEvent({
						callbackScope: this,
						delay: bonusStatus.time * ConsumableManagerValues.BUFF_DURATION_MULTIPLIER, // Time to restore the attributes to it's default value.
						callback: this.changeStats, // Callback
						args: [player, bonusStatus, -1], // Params
					});
					player.attributes.bonus.consumable.push(bonusStatus);
				}

				break;
			}

			default:
				break;
		}
	}

	/**
	 * Changes the attributes of the player based on the configuration.
	 * @param player The player that will hat it's attributes changed.
	 * @param bonus The bonus that will be applied.
	 * @param sign positive or negative sign.
	 */
	changeStats(player: Player, bonus: ConsumableBonus, sign: number = 1): void {
		const currentValue = player.attributes[bonus.statBonus] as number;
		player.attributes[bonus.statBonus] = currentValue + bonus.value * sign;
		const index = player.attributes.bonus.consumable.indexOf(bonus);
		if (index != -1) player.attributes.bonus.consumable.splice(index, 1);
	}
}
