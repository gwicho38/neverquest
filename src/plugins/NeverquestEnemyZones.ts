/**
 * @fileoverview Enemy zone spawning system for Neverquest
 *
 * This plugin handles enemy spawning from Tiled map object layers:
 * - Reads enemy zone objects from tilemap
 * - Creates spawn zones with configured enemy types
 * - Spawns enemies based on zone properties
 * - Manages enemy count limits per zone
 *
 * Zone configuration (set in Tiled object properties):
 * - enemyId: ID from EnemiesSeedConfig
 * - count: Number of enemies to spawn
 *
 * @see EnemiesSeedConfig - Enemy type definitions
 * @see Enemy - Enemy entity class
 * @see NeverquestProgrammaticEnemyZones - Programmatic alternative
 *
 * @module plugins/NeverquestEnemyZones
 */

import Phaser from 'phaser';
import { AnimationNames } from '../consts/AnimationNames';
import { EnemiesSeedConfig } from '../consts/enemies/EnemiesSeedConfig';
import { Enemy } from '../entities/Enemy';

/**
 * Interface for Tiled object properties
 */
interface ITiledProperty {
	name: string;
	type: string;
	value: string | number | boolean;
}

/**
 * Interface for scenes that contain enemies
 */
interface IEnemyScene extends Phaser.Scene {
	enemies: Enemy[];
}

/**
 * @class
 */
export class NeverquestEnemyZones {
	/**
	 * Scene Context where it will create the markers.
	 */
	scene: Phaser.Scene;

	/**
	 * Tile Map to get the object from.
	 */
	map: Phaser.Tilemaps.Tilemap;

	/**
	 * The name of the object layer defined on the Tiled Map Editor.
	 */
	tiledObjectLayer: string = 'enemies';

	/**
	 * Array of zones that will be created after it's
	 */
	zones: Phaser.GameObjects.Zone[] = [];

	/**
	 * Defines if the class should create the enemies in the creation method.
	 */
	createFromProperties: boolean = true;

	/**
	 * The propertie name that the game will look for the number of enemies. This is defined in the Tiled Software.
	 */
	numberPropertyName: string = 'number';

	/**
	 * The texture that will be applyed to the enemy.
	 */
	texturePropertyName: string = 'texture';

	/**
	 * The id that will be used to create the enemy.
	 */
	idPropertyName: string = 'id';

	/**
	 * Animation prefix for idle animations.
	 */
	idlePrefixAnimation: string;

	/**
	 * Animation suffix for down direction.
	 */
	downAnimationSufix: string;

	/**
	 * Sets a zone to create enemies within that Range.
	 * @param scene Parent Scene.
	 * @param map Tile Map to get the zones from.
	 */
	constructor(scene: Phaser.Scene, map: Phaser.Tilemaps.Tilemap) {
		Object.assign(this, new AnimationNames());
		this.scene = scene;
		this.map = map;
	}

	/**
	 * Creates all enemy zones.
	 */
	create(): void {
		const objectZones = this.map.getObjectLayer(this.tiledObjectLayer);
		if (objectZones && objectZones.objects && objectZones.objects.length > 0) {
			objectZones.objects.forEach((infoObj) => {
				const zone = this.scene.add.zone(infoObj.x, infoObj.y, infoObj.width, infoObj.height);
				// Create a proper Rectangle from the zone dimensions
				const spriteBounds = new Phaser.Geom.Rectangle(
					infoObj.x || 0,
					infoObj.y || 0,
					infoObj.width || 0,
					infoObj.height || 0
				);
				if (this.createFromProperties && infoObj.properties) {
					const properties = infoObj.properties as ITiledProperty[];
					const numberProp = properties.find((f) => f.name === this.numberPropertyName);
					const textureProp = properties.find((f) => f.name === this.texturePropertyName);
					const idProp = properties.find((f) => f.name === this.idPropertyName);

					const enemyCount = numberProp ? Number(numberProp.value) : 0;
					const idValue = idProp ? String(idProp.value) : '0';
					let textureValue = textureProp ? String(textureProp.value) : '';

					const enemyConfig = EnemiesSeedConfig.find((e) => e.id === parseInt(idValue));

					if (enemyConfig) {
						textureValue = enemyConfig.texture;
					}
					for (let i = 0; i < enemyCount; i++) {
						const pos = Phaser.Geom.Rectangle.Random(spriteBounds, new Phaser.Geom.Point());
						const enemy = new Enemy(
							this.scene,
							pos.x,
							pos.y,
							textureValue ? textureValue : 'bat',
							parseInt(idValue)
						);
						const idleDown = `${this.idlePrefixAnimation}-${this.downAnimationSufix}`;
						const idleAnimation = textureValue ? `${textureValue}-${idleDown}` : `bat-${idleDown}`;
						enemy.anims.play(idleAnimation);
						enemy.body.setSize(enemy.width, enemy.height);
						const enemyScene = this.scene as IEnemyScene;
						enemyScene.enemies.push(enemy);
					}
				}
				this.zones.push(zone);
			});
			const enemyScene = this.scene as IEnemyScene;
			this.scene.physics.add.collider(enemyScene.enemies, undefined);
		}
	}
}
