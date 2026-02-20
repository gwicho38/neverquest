/**
 * @fileoverview Tileset and map creation guide
 *
 * TilesetGuide.ts - Tileset Usage Documentation for New Maps
 *
 * This file documents all available tilesets, their tile IDs, and usage guidelines
 * for creating new maps in Tiled editor.
 *
 * @module TilesetGuide
 */

// ============================================================================
// TILESET INVENTORY
// ============================================================================

/**
 * Available tileset files and their locations
 */
export const TILESET_FILES = {
	/** Main overworld tileset - forests, grass, water */
	OVERWORLD: {
		path: 'src/assets/maps/tilesets/Overworld.png',
		extruded: 'src/assets/maps/tilesets/Overworld-extruded.png',
		tileSize: 16,
		gameAssetName: 'tiles_overworld',
		description: 'Primary tileset for outdoor environments. Contains grass, water, paths, trees, buildings.',
	},

	/** Inner/dungeon tileset - stone floors, walls */
	INNER: {
		path: 'src/assets/maps/tilesets/Inner.png',
		extruded: 'src/assets/maps/tilesets/Inner-extruded.png',
		tileSize: 16,
		gameAssetName: 'inner',
		description: 'Indoor/dungeon environments. Stone floors, walls, doors, torches.',
	},

	/** Tutorial tileset - simplified tiles for learning */
	TUTORIAL: {
		path: 'src/assets/maps/tilesets/tutorial_tileset.png',
		extruded: 'src/assets/maps/tilesets/tutorial_tileset_extruded.png',
		tileSize: 16,
		gameAssetName: 'tutorial_tileset',
		description: 'Simplified tileset for tutorial levels.',
	},

	/** Dungeon tileset - dark cave environments */
	DUNGEON: {
		path: 'src/assets/maps/dungeon/dungeon_tileset.png',
		tileSize: 16,
		gameAssetName: 'dungeon_tiles',
		description: 'Dark dungeon/cave interiors.',
	},

	/** Collision tileset - invisible collision markers */
	COLLISION: {
		path: 'src/assets/maps/tilesets/collision.png',
		tileSize: 16,
		gameAssetName: 'collision_tiles',
		description: 'Invisible tiles used only for collision detection.',
	},
} as const;

// ============================================================================
// OVERWORLD TILESET - TILE ID REFERENCE
// ============================================================================

/**
 * Common tile IDs from the Overworld tileset
 * Note: Tile IDs start at 1 in Tiled (0 = empty)
 */
export const OVERWORLD_TILES = {
	// Ground Types
	GRASS: {
		BASE: 161, // Plain grass
		VARIANT_1: 162, // Slight grass variation
		VARIANT_2: 163, // Another grass variation
	},

	WATER: {
		DEEP: 202, // Deep water (impassable)
		SHALLOW: 283, // Beach/shallow water
	},

	SAND: {
		BASE: 653, // Sandy/dirt ground
		PATH: 734, // Dirt path
	},

	// Structure Tiles (Building corners/walls - 3x3 grid pattern)
	BUILDING: {
		// Top row
		TOP_LEFT: 693,
		TOP_CENTER: 694,
		TOP_RIGHT: 695,
		// Middle row
		MID_LEFT: 733,
		MID_CENTER: 734,
		MID_RIGHT: 735,
		// Bottom row
		BOT_LEFT: 773,
		BOT_CENTER: 774,
		BOT_RIGHT: 775,
	},

	// Decoration Objects
	DECORATION: {
		// Trees (3x3 arrangement)
		TREE_TOP_LEFT: 168,
		TREE_TOP_CENTER: 169,
		TREE_TOP_RIGHT: 170,
		TREE_MID_LEFT: 208,
		TREE_MID_CENTER: 209,
		TREE_MID_RIGHT: 210,
		TREE_BOT_LEFT: 248,
		TREE_BOT_CENTER: 249,
		TREE_BOT_RIGHT: 250,

		// Small objects
		BUSH: 522,
		ROCK: 482,

		// Larger structures
		WELL_TOP_LEFT: 536,
		WELL_TOP_RIGHT: 537,
		WELL_BOT_LEFT: 576,
		WELL_BOT_RIGHT: 577,

		// Signs and markers
		SIGN_POST: 538,
		CHEST: 539,
	},

	// Town/Village specific
	TOWN: {
		// House components (8-tile wide buildings)
		HOUSE_ROW_1: [331, 332, 333, 334, 335, 336, 337, 338],
		HOUSE_ROW_2: [371, 372, 373, 374, 375, 376, 377, 378],
		HOUSE_ROW_3: [411, 451, 491, 531], // Partial rows

		// Roof tiles
		ROOF_PEAK: 616,
		ROOF_FLAT: 617,
		ROOF_END: 618,
		ROOF_BOTTOM: [656, 657, 658],
	},
} as const;

// ============================================================================
// INNER/DUNGEON TILESET - TILE ID REFERENCE
// ============================================================================

/**
 * Common tile IDs from the Inner tileset (caves/dungeons)
 */
export const INNER_TILES = {
	// Floor Types
	FLOOR: {
		STONE: 482, // Basic stone floor (walkable)
		STONE_CRACKED: 522, // Wall/impassable stone
	},

	// Wall patterns
	WALL: {
		SOLID: 522, // Solid wall (impassable)
	},

	// Decorations
	DECORATION: {
		// Torch/light sources
		TORCH_TOP_LEFT: 523,
		TORCH_TOP_RIGHT: 524,
		TORCH_BOT_LEFT: 563,
		TORCH_BOT_RIGHT: 564,

		// Additional torch pair
		TORCH2_TOP_LEFT: 525,
		TORCH2_TOP_RIGHT: 526,
		TORCH2_BOT_LEFT: 565,
		TORCH2_BOT_RIGHT: 566,

		// Statue/monument
		STATUE_TOP_LEFT: 1282,
		STATUE_TOP_RIGHT: 1283,
		STATUE_BOT_LEFT: 1322,
		STATUE_BOT_RIGHT: 1323,
	},
} as const;

// ============================================================================
// MAP LAYER STRUCTURE
// ============================================================================

/**
 * Standard layer structure for Neverquest maps
 */
export const MAP_LAYERS = {
	/** Base terrain - always rendered first */
	GROUND: {
		name: 'Ground',
		type: 'tilelayer',
		description: 'Base terrain tiles (grass, water, stone floors)',
		zIndex: 0,
	},

	/** Decorative elements on top of ground */
	DECORATION: {
		name: 'Decoration',
		type: 'tilelayer',
		description: 'Trees, rocks, furniture, non-collidable decorations',
		zIndex: 1,
	},

	/** Object layer for game logic */
	INFO: {
		name: 'info',
		type: 'objectgroup',
		description: 'Dialog triggers, spawn points, warp zones',
		zIndex: 2,
	},

	/** Collision layer (optional - if using tilemap collision) */
	COLLISION: {
		name: 'Collision',
		type: 'tilelayer',
		description: 'Invisible collision tiles',
		zIndex: 3,
	},

	/** Enemy spawn zones */
	ENEMY_ZONES: {
		name: 'enemy_zones',
		type: 'objectgroup',
		description: 'Enemy spawn areas with type properties',
		zIndex: 4,
	},
} as const;

// ============================================================================
// OBJECT PROPERTIES
// ============================================================================

/**
 * Standard object properties for the info layer
 */
export const OBJECT_PROPERTIES = {
	/** Dialog trigger object */
	DIALOG: {
		requiredProps: {
			messageID: 'int', // References Chats.ts dialog ID
		},
		example: {
			name: 'npc_greeting',
			width: 64,
			height: 32,
			properties: [{ name: 'messageID', type: 'int', value: 1 }],
		},
	},

	/** Warp/portal object */
	WARP: {
		requiredProps: {
			targetScene: 'string', // Scene key to warp to
			targetX: 'int', // Spawn X coordinate
			targetY: 'int', // Spawn Y coordinate
		},
		example: {
			name: 'portal_to_town',
			width: 32,
			height: 32,
			properties: [
				{ name: 'targetScene', type: 'string', value: 'TownScene' },
				{ name: 'targetX', type: 'int', value: 200 },
				{ name: 'targetY', type: 'int', value: 300 },
			],
		},
	},

	/** Enemy zone object */
	ENEMY_ZONE: {
		requiredProps: {
			enemyType: 'string', // Enemy key from EnemiesSeedConfig
			maxEnemies: 'int', // Maximum enemies in zone
			respawnTime: 'int', // Respawn delay in ms
		},
		example: {
			name: 'bandit_zone_1',
			width: 200,
			height: 200,
			properties: [
				{ name: 'enemyType', type: 'string', value: 'bandit' },
				{ name: 'maxEnemies', type: 'int', value: 3 },
				{ name: 'respawnTime', type: 'int', value: 30000 },
			],
		},
	},

	/** Player spawn point */
	SPAWN: {
		requiredProps: {
			spawnId: 'string', // Unique spawn point ID
		},
		example: {
			name: 'player_spawn',
			width: 16,
			height: 16,
			properties: [{ name: 'spawnId', type: 'string', value: 'default' }],
		},
	},
} as const;

// ============================================================================
// MAP SIZE GUIDELINES
// ============================================================================

/**
 * Recommended map sizes for different area types
 */
export const MAP_SIZE_GUIDELINES = {
	/** Small indoor room */
	SMALL: {
		width: 20,
		height: 20,
		tiles: 400,
		useCase: 'Single room, small cave chamber',
	},

	/** Medium area */
	MEDIUM: {
		width: 40,
		height: 40,
		tiles: 1600,
		useCase: 'Dungeon level, small outdoor area',
	},

	/** Standard outdoor map */
	STANDARD: {
		width: 50,
		height: 50,
		tiles: 2500,
		useCase: 'Standard overworld zone, town',
	},

	/** Large exploration area */
	LARGE: {
		width: 80,
		height: 80,
		tiles: 6400,
		useCase: 'Major region, The Crossroads hub',
	},

	/** Maximum recommended */
	MAX: {
		width: 100,
		height: 100,
		tiles: 10000,
		useCase: 'Open world areas (use sparingly)',
	},
} as const;

// ============================================================================
// EXISTING MAPS REFERENCE
// ============================================================================

/**
 * Reference to existing maps and their configurations
 */
export const EXISTING_MAPS = {
	OVERWORLD: {
		file: 'src/assets/maps/overworld/overworld.json',
		size: { width: 50, height: 50 },
		tileset: 'Overworld',
		scene: 'OverworldScene',
		description: 'Main starting area with forest and paths',
	},

	TOWN: {
		file: 'src/assets/maps/town/town.json',
		size: { width: 30, height: 30 },
		tileset: 'Overworld',
		scene: 'TownScene',
		description: 'Village with buildings and NPCs',
	},

	CAVE: {
		file: 'src/assets/maps/cave/cave_dungeon.json',
		size: { width: 40, height: 40 },
		tileset: 'Overworld', // Uses same tileset IDs
		scene: 'CaveScene',
		description: 'Underground cave dungeon',
	},

	TUTORIAL: {
		file: 'src/assets/maps/tutorial/tutorial.json',
		size: { width: 30, height: 30 },
		tileset: 'tutorial_tileset',
		scene: 'TutorialScene',
		description: 'Tutorial level for new players',
	},

	LARUS: {
		file: 'src/assets/maps/larus/larus.json',
		tileset: 'Overworld',
		scene: 'MainScene',
		description: 'Alternative overworld map',
	},
} as const;

// ============================================================================
// CREATING A NEW MAP - STEP BY STEP
// ============================================================================

/**
 * Step-by-step guide for creating a new map
 *
 * 1. OPEN TILED EDITOR
 *    - Create new map (File > New > New Map)
 *    - Set tile size: 16x16
 *    - Set map size (see MAP_SIZE_GUIDELINES)
 *    - Orientation: Orthogonal
 *    - Tile layer format: CSV
 *
 * 2. ADD TILESET
 *    - Map > Add External Tileset
 *    - Browse to src/assets/maps/tilesets/
 *    - Use the -extruded.png version for proper rendering
 *    - Set tile size to 16x16
 *
 * 3. CREATE LAYERS (in this order)
 *    - Ground (tilelayer) - base terrain
 *    - Decoration (tilelayer) - objects on top
 *    - info (objectgroup) - triggers and zones
 *    - enemy_zones (objectgroup) - optional, for spawn areas
 *
 * 4. PAINT TERRAIN
 *    - Use Ground layer for base tiles
 *    - Avoid tile ID 0 (empty) for ground
 *    - Ensure walkable paths are clear
 *
 * 5. ADD DECORATIONS
 *    - Trees, rocks, buildings go on Decoration layer
 *    - Use tile ID 0 for empty spaces
 *
 * 6. ADD OBJECTS
 *    - Dialog triggers: Rectangle with messageID property
 *    - Warps: Rectangle with targetScene, targetX, targetY
 *    - Enemy zones: Large rectangles with enemyType, maxEnemies
 *
 * 7. EXPORT
 *    - File > Export As
 *    - Save as JSON format
 *    - Place in src/assets/maps/[mapname]/[mapname].json
 *
 * 8. REGISTER IN GAME
 *    - Add import to GameAssets.ts
 *    - Add to TilemapConfig array
 *    - Create scene file extending appropriate base
 *    - Register scene in index.ts
 */

// Export for documentation purposes
export const TILESET_GUIDE_VERSION = '1.0.0';
