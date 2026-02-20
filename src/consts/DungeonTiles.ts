/**
 * @fileoverview Dungeon tile mapping configuration
 *
 * This file defines tile indices and weights for procedural dungeon generation:
 * - Wall tiles (corners, edges with variations)
 * - Floor tiles with weighted randomization
 * - Door configurations for all directions
 * - Special tiles (chest, stairs, tower, pot)
 *
 * Used by NeverquestDungeonGenerator for creating random dungeons.
 *
 * @see NeverquestDungeonGenerator - Procedural dungeon system
 * @see NeverquestMapCreator - Map loading and tile placement
 *
 * @module consts/DungeonTiles
 */

interface TileWeight {
	index: number | number[];
	weight: number;
}

interface WallConfig {
	TOP_LEFT: number;
	TOP_RIGHT: number;
	BOTTOM_RIGHT: number;
	BOTTOM_LEFT: number;
	TOP: TileWeight[];
	LEFT: TileWeight[];
	RIGHT: TileWeight[];
	BOTTOM: TileWeight[];
}

interface DoorConfig {
	TOP: number[];
	LEFT: number[][];
	BOTTOM: number[];
	RIGHT: number[][];
}

interface TileMapping {
	WALL: WallConfig;
	FLOOR: TileWeight[];
	POT: TileWeight[];
	DOOR: DoorConfig;
	CHEST: number;
	STAIRS: number;
	TOWER: number[][];
	BLANK: number;
}

// Mapping with:
// - Single index for putTileAt
// - Array of weights for weightedRandomize
// - Array or 2D array for putTilesAt
const TILE_MAPPING: TileMapping = {
	WALL: {
		TOP_LEFT: 3,
		TOP_RIGHT: 4,
		BOTTOM_RIGHT: 23,
		BOTTOM_LEFT: 22,
		// Let's add some randomization to the walls while we are refactoring:
		TOP: [
			{ index: 39, weight: 4 },
			{ index: [57, 58, 59], weight: 1 },
		],
		LEFT: [
			{ index: 21, weight: 4 },
			{ index: [76, 95, 114], weight: 1 },
		],
		RIGHT: [
			{ index: 19, weight: 4 },
			{ index: [77, 96, 115], weight: 1 },
		],
		BOTTOM: [
			{ index: 1, weight: 4 },
			{ index: [78, 79, 80], weight: 1 },
		],
	},
	FLOOR: [
		{ index: 6, weight: 9 },
		{ index: [7, 8, 26], weight: 1 },
	],
	POT: [
		{ index: 13, weight: 1 },
		{ index: 32, weight: 1 },
		{ index: 51, weight: 1 },
	],
	DOOR: {
		TOP: [40, 6, 38],
		LEFT: [[40], [6], [2]],
		BOTTOM: [2, 6, 0],
		RIGHT: [[38], [6], [0]],
	},
	CHEST: 166,
	STAIRS: 81,
	TOWER: [[186], [205]],
	BLANK: -1,
};

export default TILE_MAPPING;
