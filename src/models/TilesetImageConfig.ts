/**
 * @fileoverview Tileset image configuration model
 *
 * This file defines the TilesetImageConfig model class:
 * - Maps Tiled tileset names to Phaser asset names
 * - Configures tile dimensions, margins, and spacing
 * - Used by NeverquestMapCreator for tilemap loading
 *
 * @see NeverquestMapCreator - Tilemap loading system
 * @see GameAssets - Asset key definitions
 * @see TilesetGuide - Tileset usage documentation
 *
 * @module models/TilesetImageConfig
 */

/**
 * @class
 */
export class TilesetImageConfig {
	/**
	 * This is the name of the Tileset that you gave inside the Tiled Software.
	 */
	public tilesetName: string;

	/**
	 * This is the name of the asset that you gave on the GameAssets file. <a href="https://i.ibb.co/gVYw09v/Screen-Shot-2021-04-08-at-11-54-56.png">Game Asset</a>
	 * Another Example of the name <a href="https://i.ibb.co/PczxRMt/Screen-Shot-2021-04-08-at-11-59-38.png">Phaser's Example of Adding Image to Game</a>,
	 * Thats the String that you want.
	 */
	public assetName: string;

	/**
	 * The Single Tile Width.
	 * @default 16
	 */
	public width: number;

	/**
	 * The Single Tile Height.
	 * @default 16
	 */
	public height: number;

	/**
	 * The margin between tiles.
	 * @default 1
	 */
	public margin: number;

	/**
	 * The spacing between tiles.
	 * @default 2
	 */
	public spacing: number;

	/**
	 * @param tilesetName This is the name of the Tileset that you gave inside the Tiled Software.
	 * @param assetName This is the name of the asset that you gave on the GameAssets file.
	 */
	constructor(
		tilesetName: string,
		assetName: string,
		width?: number,
		height?: number,
		margin?: number,
		spacing?: number
	) {
		this.tilesetName = tilesetName;
		this.assetName = assetName;
		this.width = width ? width : 16;
		this.height = height ? height : 16;
		this.margin = margin ? margin : 1;
		this.spacing = spacing ? spacing : 2;
	}
}
