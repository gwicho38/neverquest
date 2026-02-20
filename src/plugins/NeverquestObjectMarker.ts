/**
 * @fileoverview Interactive object marker display for Neverquest
 *
 * This plugin places visual markers above interactive objects:
 * - Reads marker positions from Tiled object layer
 * - Displays question mark or custom sprites
 * - Indicates interactable NPCs, items, or triggers
 *
 * Helps players identify interactive elements in the world.
 *
 * @see NeverquestTiledInfoBox - Dialog interaction system
 * @see Tiled Map Editor - Object layer configuration
 *
 * @module plugins/NeverquestObjectMarker
 */

/**
 * @class
 */
export class NeverquestObjectMarker {
	/**
	 * Scene Context where it will create the markers.
	 */
	scene: Phaser.Scene;

	/**
	 * Tile Map to get the object from.
	 */
	map: Phaser.Tilemaps.Tilemap;

	/**
	 * Marker name.
	 * @default
	 */
	tiledObjectLayer: string = 'markers';

	/**
	 * Interaction indicator Sprite name.
	 * @default
	 */
	markerSpriteName: string = 'question_mark';

	/**
	 * Displays a marker on interactive objects.
	 * @param scene Parent Scene.
	 * @param map Tile Map to get the markers from.
	 */
	constructor(scene: Phaser.Scene, map: Phaser.Tilemaps.Tilemap) {
		this.scene = scene;
		this.map = map;
	}

	create(): void {
		const infoObjects = this.map.getObjectLayer(this.tiledObjectLayer);
		if (infoObjects && infoObjects.objects) {
			infoObjects.objects.forEach((infoObj) => {
				if (infoObj.x !== undefined && infoObj.y !== undefined) {
					this.scene.add.image(infoObj.x, infoObj.y, this.markerSpriteName).setDepth(2);
				}
			});
		}
	}
}
