/**
 * @fileoverview Item drop system for defeated enemies
 *
 * This file provides loot generation from entities:
 * - Chance-based item drop calculations
 * - Animated item spawning with float effect
 * - Configurable drop pools per entity
 *
 * @see EntityDrops - Drop configuration model
 * @see Item - Dropped item entity
 * @see NeverquestBattleManager - Triggers drops on enemy death
 *
 * @module plugins/NeverquestDropSystem
 */

import { Item } from '../entities/Item';

/**
 * Item drop configuration
 */
export interface IDropConfig {
	id: number;
	chance: number;
}

/**
 * Interface for entities that can drop items
 */
export interface IEntityWithDrops extends Phaser.GameObjects.Sprite {
	id: string | number | null;
	drops: IDropConfig[];
	container: Phaser.GameObjects.Container;
}

/**
 * This class is responsible for dropping items from a given entity.
 * @class
 */
export class NeverquestDropSystem {
	/**
	 * The game scene that the player is playing.
	 */
	scene: Phaser.Scene;

	/**
	 * The id of the entity that will drop something.
	 */
	entityId: string | number | null;

	/**
	 * The Entity that will drop the items.
	 */
	entity: IEntityWithDrops;

	/**
	 * The items that the entity will drop.
	 */
	drops: IDropConfig[];

	/**
	 * Drops the items from an entity.
	 */
	dropItems: () => void;

	constructor(scene: Phaser.Scene, entity: IEntityWithDrops) {
		this.scene = scene;
		this.entityId = entity.id;
		this.entity = entity;
		this.drops = entity.drops;

		/**
		 * Drops the items from an entity.
		 */
		this.dropItems = (): void => {
			const rect = new Phaser.Geom.Rectangle(this.entity.container.x - 8, this.entity.container.y - 8, 16, 16);
			const spriteBounds = Phaser.Geom.Rectangle.Inflate(Phaser.Geom.Rectangle.Clone(rect), 0, 0);

			this.drops.forEach((drop) => {
				const chance = Math.random() * 100;
				if (drop.chance - chance >= 0 || drop.chance === 100) {
					const pos = Phaser.Geom.Rectangle.Random(spriteBounds, new Phaser.Geom.Point());
					const item = new Item(this.scene, pos.x, pos.y - 20, drop.id);
					this.scene.tweens.add({
						targets: item,
						props: {
							y: {
								value: item.y - 4,
							},
						},
						duration: 2000,
						loop: -1,
						yoyo: true,
					});
				}
			});
		};
	}
}
