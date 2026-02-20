/**
 * @fileoverview Procedural dungeon generation for Neverquest
 *
 * This plugin generates random dungeon layouts:
 * - Uses @mikewesthad/dungeon for room generation
 * - Creates tilemap layers from dungeon data
 * - Places walls, floors, and decoration tiles
 * - Supports room-based and corridor-based layouts
 *
 * Generation parameters:
 * - Room count and size ranges
 * - Corridor width and length
 * - Door placement rules
 *
 * Used for roguelike dungeon experiences.
 *
 * @see DungeonScene - Uses generated dungeons
 * @see TILES - Tile ID constants for dungeon
 * @see @mikewesthad/dungeon - Core generation library
 *
 * @module plugins/NeverquestDungeonGenerator
 */

import Dungeon from '@mikewesthad/dungeon';
import TILES from '../consts/DungeonTiles';

/**
 * @class
 */
export class NeverquestDungeonGenerator {
	/**
	 * The parent Scene.
	 */
	scene: Phaser.Scene;

	/**
	 * The proceduraly generation Dungeon.
	 */
	dungeon: Dungeon | null = null;

	/**
	 * The tilemap that the dungeon will be created on.
	 */
	map: Phaser.Tilemaps.Tilemap | null = null;

	/**
	 * The ground layer of the dungeon.
	 */
	groundLayer: Phaser.Tilemaps.TilemapLayer | null = null;

	/**
	 * The stuff layer of the dungeon.
	 */
	stuffLayer: Phaser.Tilemaps.TilemapLayer | null = null;

	/**
	 * The tile height of the tileset
	 */
	tileHeight: number = 48;

	/**
	 * The tile width of the tileset
	 */
	tileWidth: number = 48;

	/**
	 * The tilemap width in Tiles.
	 */
	mapWidth: number = 50;

	/**
	 * The tilemap height in Tiles.
	 */
	mapHeight: number = 50;

	/**
	 * The name of the image that the tileset will be created of.
	 */
	tilesetName: string = 'dungeon_tiles';

	/**
	 * The minimum size of the room
	 */
	minSizeRoom: number = 7;

	/**
	 * The maximum size of the room
	 */
	maxSizeRoom: number = 14;

	/**
	 * The maximum number of rooms of the dungeon
	 */
	maxRooms: number = 12;

	/**
	 * This class is responsible for handling the proceduraly generated dungeons.
	 * @param scene Parent scene of which the Dungeon will be created.
	 */
	constructor(scene: Phaser.Scene) {
		this.scene = scene;
	}

	/**
	 * Creates the dungeon.
	 */
	create(): void {
		this.dungeon = new Dungeon({
			width: this.mapWidth,
			height: this.mapHeight,
			doorPadding: 2,
			rooms: {
				width: {
					min: this.minSizeRoom,
					max: this.maxSizeRoom,
					onlyOdd: true,
				},
				height: {
					min: this.minSizeRoom,
					max: this.maxSizeRoom,
					onlyOdd: true,
				},
				maxRooms: this.maxRooms,
			},
		});

		// Just for Loggin purposes
		// this.dungeon.drawToConsole({
		//     empty: ' ',
		//     emptyColor: 'rgb(0, 0, 0)',
		//     wall: '#',
		//     wallColor: 'rgb(255, 0, 0)',
		//     floor: '0',
		//     floorColor: 'rgb(210, 210, 210)',
		//     door: 'x',
		//     doorColor: 'rgb(0, 0, 255)',
		//     fontSize: '8px',
		// });

		// Create a blank map
		this.map = this.scene.make.tilemap({
			tileWidth: 48,
			tileHeight: 48,
			width: this.dungeon.width,
			height: this.dungeon.height,
		});

		// Load up a tileset, in this case, the tileset has 1px margin & 2px padding (last two arguments)
		const tileset = this.map.addTilesetImage(this.tilesetName, null, 48, 48, 1, 2);

		this.groundLayer = this.map.createBlankLayer('Ground', tileset);
		this.stuffLayer = this.map.createBlankLayer('Stuff', tileset);

		this.groundLayer.fill(TILES.BLANK);

		// Use the array of rooms generated to place tiles in the map
		this.dungeon.rooms.forEach((room) => {
			const { x, y, width, height, left, right, top, bottom } = room;

			//weightedIndexes, tileX, tileY, width, height

			// Fill the floor with mostly clean tiles
			this.groundLayer!.weightedRandomize(TILES.FLOOR, x + 1, y + 1, width - 2, height - 2);

			// Place the room corners tiles
			this.groundLayer!.putTileAt(TILES.WALL.TOP_LEFT, left, top);
			this.groundLayer!.putTileAt(TILES.WALL.TOP_RIGHT, right, top);
			this.groundLayer!.putTileAt(TILES.WALL.BOTTOM_RIGHT, right, bottom);
			this.groundLayer!.putTileAt(TILES.WALL.BOTTOM_LEFT, left, bottom);

			// Fill the walls with mostly clean tiles
			this.groundLayer!.weightedRandomize(TILES.WALL.TOP, left + 1, top, width - 2, 1);
			this.groundLayer!.weightedRandomize(TILES.WALL.BOTTOM, left + 1, bottom, width - 2, 1);
			this.groundLayer!.weightedRandomize(TILES.WALL.LEFT, left, top + 1, 1, height - 2);
			this.groundLayer!.weightedRandomize(TILES.WALL.RIGHT, right, top + 1, 1, height - 2);

			// Dungeons have rooms that are connected with doors. Each door has an x & y relative to the
			// room's location. Each direction has a different door to tile mapping.
			const doors = room.getDoorLocations(); // → Returns an array of {x, y} objects
			for (let i = 0; i < doors.length; i++) {
				if (doors[i].y === 0) {
					this.groundLayer!.putTilesAt(TILES.DOOR.TOP, x + doors[i].x - 1, y + doors[i].y);
				} else if (doors[i].y === room.height - 1) {
					this.groundLayer!.putTilesAt(TILES.DOOR.BOTTOM, x + doors[i].x - 1, y + doors[i].y);
				} else if (doors[i].x === 0) {
					this.groundLayer!.putTilesAt(TILES.DOOR.LEFT, x + doors[i].x, y + doors[i].y - 1);
				} else if (doors[i].x === room.width - 1) {
					this.groundLayer!.putTilesAt(TILES.DOOR.RIGHT, x + doors[i].x, y + doors[i].y - 1);
				}
			}
		});

		// Not exactly correct for the tileset since there are more possible floor tiles,
		// don`t forget to change it as it pleases your game.
		this.groundLayer.setCollisionByExclusion([-1, 6, 7, 8, 26]);
	}
}
