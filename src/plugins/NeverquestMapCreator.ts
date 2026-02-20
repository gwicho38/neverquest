/**
 * @fileoverview Tiled map creation and management for Neverquest
 *
 * This plugin handles loading and configuring Tiled maps including:
 * - Map and tileset loading from JSON files
 * - Collision layer setup and detection
 * - Layer depth ordering
 * - Player spawn point extraction
 * - Warp zone configuration
 *
 * Works with Tiled Map Editor exports (JSON format) and supports:
 * - Multiple tileset images per map
 * - Object layers for spawn points and triggers
 * - Custom properties for layer configuration
 *
 * @see NeverquestWarp - Uses warp objects from map
 * @see NeverquestEnemyZones - Uses enemy zone objects from map
 * @see docs/TILED_MAP_GUIDE.md - Map creation documentation
 *
 * @module plugins/NeverquestMapCreator
 */

import { PlayerConfig } from '../consts/player/Player';
import { Player } from '../entities/Player';
import { TilesetImageConfig } from '../models/TilesetImageConfig';
import { MapObjectNames } from '../consts/Messages';
import { IGameScene } from '../types/SceneTypes';

/**
 * Interface for Tiled layer properties
 */
interface TiledProperty {
	name: string;
	value: string | number | boolean;
}

/**
 * Extended tilemap interface for infinite maps from Tiled
 */
interface ITiledMap extends Phaser.Tilemaps.Tilemap {
	infinite?: boolean;
}

/**
 * @class
 */
export class NeverquestMapCreator {
	/**
	 * The Parent Phaser Scene.
	 */
	scene: IGameScene;

	/**
	 * The name of the map to load.
	 */
	mapName: string = 'larus';

	/**
	 * The name of the LAYER Property that will make it change the Depth of the layer.
	 */
	depthProperty: string = 'depth';

	/**
	 * The name of the LAYER Property that will make the layer collide.
	 */
	collisionPropperty: string = 'collides';

	/**
	 * The Object Layer Name defined to create the Spawn point of the player.
	 */
	spawnObjectLayer: string = 'spawn';

	/**
	 * The name of the Point Object in the Spawn layer that will define the Spawn point of the player.
	 */
	spawnObjectPoint: string = MapObjectNames.SPAWN_POINT;

	/**
	 * The player texture that will be used to create the Player Sprite in case the Spawn point is defined.
	 */
	playerTexture: string;

	/**
	 * The Collision Layer Opacity. Set it to more than zero if you want to see it.
	 */
	collisionLayerAlpha: number = 0;

	/**
	 * The Tilemap itself
	 */
	map: Phaser.Tilemaps.Tilemap | null = null;

	/**
	 * The Tilemap Layer that has the collision Propperty.
	 */
	collisionLayer: Phaser.Tilemaps.TilemapLayer | null = null;

	/**
	 * An array with the Tileset Images configuration.
	 */
	tilesetImages: TilesetImageConfig[] = [
		new TilesetImageConfig('base', 'tiles_overworld'),
		new TilesetImageConfig('inner', 'inner'),
		new TilesetImageConfig('collision', 'collision_tiles'),
	];

	/**
	 * This class is responsible for creating the map with all it's Layers
	 * @param scene The Parent Phaser Scene.
	 * @param mapName The name of the map to load (defaults to 'larus' for backward compatibility)
	 */
	constructor(scene: IGameScene, mapName: string = 'larus') {
		this.scene = scene;
		this.mapName = mapName;
		this.playerTexture = PlayerConfig.texture;
	}

	create(): void {
		this.map = this.scene.make.tilemap({ key: this.mapName });
		this.tilesetImages.forEach((tilesetImage) => {
			this.map!.addTilesetImage(
				tilesetImage.tilesetName,
				tilesetImage.assetName,
				tilesetImage.width,
				tilesetImage.height,
				tilesetImage.margin,
				tilesetImage.spacing
			);
		});

		this.map.layers.forEach((layer) => {
			const currentLayer = this.map!.createLayer(layer.name, this.map!.tilesets);

			// For infinite maps with negative coordinates, increase cull padding to ensure tiles render properly
			if ((this.map as ITiledMap).infinite) {
				currentLayer!.setCullPadding(4, 4); // Render 4 extra tiles in each direction
			}

			const depth = (layer.properties as TiledProperty[]).find((f) => f.name === this.depthProperty);
			if (depth) {
				currentLayer!.depth = depth.value as number;
			}
			const collides = (layer.properties as TiledProperty[]).find((f) => f.name === this.collisionPropperty);

			// If you want to see the Collision layer the alpha should be higher than zero.
			if (collides && collides.value) {
				currentLayer!.alpha = this.collisionLayerAlpha;

				currentLayer!.setCollisionByProperty({ collides: true });
				this.collisionLayer = currentLayer;
			}
		});

		const spawnPoint = this.map.findObject(this.spawnObjectLayer, (obj) => obj.name === this.spawnObjectPoint);
		if (spawnPoint) {
			this.scene.player = new Player(this.scene, spawnPoint.x, spawnPoint.y, PlayerConfig.texture, this.map);
		}

		if (this.collisionLayer && this.scene.player) {
			this.scene.physics.add.collider(this.scene.player.container, this.collisionLayer);
		}
	}
}
