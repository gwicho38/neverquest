/**
 * Tests for TilesetGuide - Tileset documentation and constants
 */

import {
	TILESET_FILES,
	OVERWORLD_TILES,
	INNER_TILES,
	MAP_LAYERS,
	OBJECT_PROPERTIES,
	MAP_SIZE_GUIDELINES,
	EXISTING_MAPS,
	TILESET_GUIDE_VERSION,
} from '../../consts/TilesetGuide';

describe('TilesetGuide', () => {
	describe('TILESET_FILES', () => {
		it('should have OVERWORLD tileset configuration', () => {
			expect(TILESET_FILES.OVERWORLD).toBeDefined();
			expect(TILESET_FILES.OVERWORLD.path).toContain('Overworld.png');
			expect(TILESET_FILES.OVERWORLD.tileSize).toBe(16);
			expect(TILESET_FILES.OVERWORLD.gameAssetName).toBe('tiles_overworld');
		});

		it('should have INNER tileset configuration', () => {
			expect(TILESET_FILES.INNER).toBeDefined();
			expect(TILESET_FILES.INNER.path).toContain('Inner.png');
			expect(TILESET_FILES.INNER.tileSize).toBe(16);
		});

		it('should have TUTORIAL tileset configuration', () => {
			expect(TILESET_FILES.TUTORIAL).toBeDefined();
			expect(TILESET_FILES.TUTORIAL.path).toContain('tutorial_tileset.png');
		});

		it('should have DUNGEON tileset configuration', () => {
			expect(TILESET_FILES.DUNGEON).toBeDefined();
			expect(TILESET_FILES.DUNGEON.path).toContain('dungeon_tileset.png');
		});

		it('should have COLLISION tileset configuration', () => {
			expect(TILESET_FILES.COLLISION).toBeDefined();
			expect(TILESET_FILES.COLLISION.path).toContain('collision.png');
		});

		it('all tilesets should have 16x16 tile size', () => {
			Object.values(TILESET_FILES).forEach((tileset) => {
				expect(tileset.tileSize).toBe(16);
			});
		});

		it('all tilesets should have descriptions', () => {
			Object.values(TILESET_FILES).forEach((tileset) => {
				expect(tileset.description).toBeDefined();
				expect(tileset.description.length).toBeGreaterThan(10);
			});
		});
	});

	describe('OVERWORLD_TILES', () => {
		describe('GRASS tiles', () => {
			it('should have base grass tile', () => {
				expect(OVERWORLD_TILES.GRASS.BASE).toBe(161);
			});

			it('should have grass variants', () => {
				expect(OVERWORLD_TILES.GRASS.VARIANT_1).toBe(162);
				expect(OVERWORLD_TILES.GRASS.VARIANT_2).toBe(163);
			});
		});

		describe('WATER tiles', () => {
			it('should have deep water tile', () => {
				expect(OVERWORLD_TILES.WATER.DEEP).toBe(202);
			});

			it('should have shallow water tile', () => {
				expect(OVERWORLD_TILES.WATER.SHALLOW).toBe(283);
			});
		});

		describe('SAND tiles', () => {
			it('should have sand base tile', () => {
				expect(OVERWORLD_TILES.SAND.BASE).toBe(653);
			});

			it('should have path tile', () => {
				expect(OVERWORLD_TILES.SAND.PATH).toBe(734);
			});
		});

		describe('BUILDING tiles', () => {
			it('should have 3x3 building grid', () => {
				// Top row
				expect(OVERWORLD_TILES.BUILDING.TOP_LEFT).toBe(693);
				expect(OVERWORLD_TILES.BUILDING.TOP_CENTER).toBe(694);
				expect(OVERWORLD_TILES.BUILDING.TOP_RIGHT).toBe(695);
				// Middle row
				expect(OVERWORLD_TILES.BUILDING.MID_LEFT).toBe(733);
				expect(OVERWORLD_TILES.BUILDING.MID_CENTER).toBe(734);
				expect(OVERWORLD_TILES.BUILDING.MID_RIGHT).toBe(735);
				// Bottom row
				expect(OVERWORLD_TILES.BUILDING.BOT_LEFT).toBe(773);
				expect(OVERWORLD_TILES.BUILDING.BOT_CENTER).toBe(774);
				expect(OVERWORLD_TILES.BUILDING.BOT_RIGHT).toBe(775);
			});
		});

		describe('DECORATION tiles', () => {
			it('should have tree tiles (3x3)', () => {
				expect(OVERWORLD_TILES.DECORATION.TREE_TOP_LEFT).toBe(168);
				expect(OVERWORLD_TILES.DECORATION.TREE_TOP_CENTER).toBe(169);
				expect(OVERWORLD_TILES.DECORATION.TREE_TOP_RIGHT).toBe(170);
				expect(OVERWORLD_TILES.DECORATION.TREE_MID_LEFT).toBe(208);
				expect(OVERWORLD_TILES.DECORATION.TREE_BOT_CENTER).toBe(249);
			});

			it('should have well tiles (2x2)', () => {
				expect(OVERWORLD_TILES.DECORATION.WELL_TOP_LEFT).toBe(536);
				expect(OVERWORLD_TILES.DECORATION.WELL_TOP_RIGHT).toBe(537);
				expect(OVERWORLD_TILES.DECORATION.WELL_BOT_LEFT).toBe(576);
				expect(OVERWORLD_TILES.DECORATION.WELL_BOT_RIGHT).toBe(577);
			});

			it('should have bush and rock tiles', () => {
				expect(OVERWORLD_TILES.DECORATION.BUSH).toBe(522);
				expect(OVERWORLD_TILES.DECORATION.ROCK).toBe(482);
			});
		});

		describe('TOWN tiles', () => {
			it('should have house rows as arrays', () => {
				expect(OVERWORLD_TILES.TOWN.HOUSE_ROW_1).toHaveLength(8);
				expect(OVERWORLD_TILES.TOWN.HOUSE_ROW_2).toHaveLength(8);
			});

			it('should have roof tiles', () => {
				expect(OVERWORLD_TILES.TOWN.ROOF_PEAK).toBe(616);
				expect(OVERWORLD_TILES.TOWN.ROOF_FLAT).toBe(617);
				expect(OVERWORLD_TILES.TOWN.ROOF_END).toBe(618);
			});
		});
	});

	describe('INNER_TILES', () => {
		describe('FLOOR tiles', () => {
			it('should have stone floor tile', () => {
				expect(INNER_TILES.FLOOR.STONE).toBe(482);
			});

			it('should have cracked stone tile', () => {
				expect(INNER_TILES.FLOOR.STONE_CRACKED).toBe(522);
			});
		});

		describe('WALL tiles', () => {
			it('should have solid wall tile', () => {
				expect(INNER_TILES.WALL.SOLID).toBe(522);
			});
		});

		describe('DECORATION tiles', () => {
			it('should have torch tiles (2x2)', () => {
				expect(INNER_TILES.DECORATION.TORCH_TOP_LEFT).toBe(523);
				expect(INNER_TILES.DECORATION.TORCH_TOP_RIGHT).toBe(524);
				expect(INNER_TILES.DECORATION.TORCH_BOT_LEFT).toBe(563);
				expect(INNER_TILES.DECORATION.TORCH_BOT_RIGHT).toBe(564);
			});

			it('should have statue tiles (2x2)', () => {
				expect(INNER_TILES.DECORATION.STATUE_TOP_LEFT).toBe(1282);
				expect(INNER_TILES.DECORATION.STATUE_TOP_RIGHT).toBe(1283);
				expect(INNER_TILES.DECORATION.STATUE_BOT_LEFT).toBe(1322);
				expect(INNER_TILES.DECORATION.STATUE_BOT_RIGHT).toBe(1323);
			});
		});
	});

	describe('MAP_LAYERS', () => {
		it('should have GROUND layer', () => {
			expect(MAP_LAYERS.GROUND.name).toBe('Ground');
			expect(MAP_LAYERS.GROUND.type).toBe('tilelayer');
			expect(MAP_LAYERS.GROUND.zIndex).toBe(0);
		});

		it('should have DECORATION layer', () => {
			expect(MAP_LAYERS.DECORATION.name).toBe('Decoration');
			expect(MAP_LAYERS.DECORATION.type).toBe('tilelayer');
			expect(MAP_LAYERS.DECORATION.zIndex).toBe(1);
		});

		it('should have INFO layer', () => {
			expect(MAP_LAYERS.INFO.name).toBe('info');
			expect(MAP_LAYERS.INFO.type).toBe('objectgroup');
			expect(MAP_LAYERS.INFO.zIndex).toBe(2);
		});

		it('should have COLLISION layer', () => {
			expect(MAP_LAYERS.COLLISION.name).toBe('Collision');
			expect(MAP_LAYERS.COLLISION.type).toBe('tilelayer');
		});

		it('should have ENEMY_ZONES layer', () => {
			expect(MAP_LAYERS.ENEMY_ZONES.name).toBe('enemy_zones');
			expect(MAP_LAYERS.ENEMY_ZONES.type).toBe('objectgroup');
		});

		it('should have layers in correct z-order', () => {
			expect(MAP_LAYERS.GROUND.zIndex).toBeLessThan(MAP_LAYERS.DECORATION.zIndex);
			expect(MAP_LAYERS.DECORATION.zIndex).toBeLessThan(MAP_LAYERS.INFO.zIndex);
		});
	});

	describe('OBJECT_PROPERTIES', () => {
		describe('DIALOG', () => {
			it('should require messageID property', () => {
				expect(OBJECT_PROPERTIES.DIALOG.requiredProps.messageID).toBe('int');
			});

			it('should have example configuration', () => {
				expect(OBJECT_PROPERTIES.DIALOG.example.name).toBeDefined();
				expect(OBJECT_PROPERTIES.DIALOG.example.width).toBe(64);
				expect(OBJECT_PROPERTIES.DIALOG.example.height).toBe(32);
				expect(OBJECT_PROPERTIES.DIALOG.example.properties).toHaveLength(1);
			});
		});

		describe('WARP', () => {
			it('should require targetScene property', () => {
				expect(OBJECT_PROPERTIES.WARP.requiredProps.targetScene).toBe('string');
			});

			it('should require target coordinates', () => {
				expect(OBJECT_PROPERTIES.WARP.requiredProps.targetX).toBe('int');
				expect(OBJECT_PROPERTIES.WARP.requiredProps.targetY).toBe('int');
			});

			it('should have example with all required props', () => {
				const props = OBJECT_PROPERTIES.WARP.example.properties;
				expect(props).toHaveLength(3);
				expect(props.find((p) => p.name === 'targetScene')).toBeDefined();
				expect(props.find((p) => p.name === 'targetX')).toBeDefined();
				expect(props.find((p) => p.name === 'targetY')).toBeDefined();
			});
		});

		describe('ENEMY_ZONE', () => {
			it('should require enemyType property', () => {
				expect(OBJECT_PROPERTIES.ENEMY_ZONE.requiredProps.enemyType).toBe('string');
			});

			it('should require maxEnemies property', () => {
				expect(OBJECT_PROPERTIES.ENEMY_ZONE.requiredProps.maxEnemies).toBe('int');
			});

			it('should require respawnTime property', () => {
				expect(OBJECT_PROPERTIES.ENEMY_ZONE.requiredProps.respawnTime).toBe('int');
			});
		});

		describe('SPAWN', () => {
			it('should require spawnId property', () => {
				expect(OBJECT_PROPERTIES.SPAWN.requiredProps.spawnId).toBe('string');
			});
		});
	});

	describe('MAP_SIZE_GUIDELINES', () => {
		it('should have SMALL size guidelines', () => {
			expect(MAP_SIZE_GUIDELINES.SMALL.width).toBe(20);
			expect(MAP_SIZE_GUIDELINES.SMALL.height).toBe(20);
			expect(MAP_SIZE_GUIDELINES.SMALL.tiles).toBe(400);
		});

		it('should have MEDIUM size guidelines', () => {
			expect(MAP_SIZE_GUIDELINES.MEDIUM.width).toBe(40);
			expect(MAP_SIZE_GUIDELINES.MEDIUM.height).toBe(40);
			expect(MAP_SIZE_GUIDELINES.MEDIUM.tiles).toBe(1600);
		});

		it('should have STANDARD size guidelines', () => {
			expect(MAP_SIZE_GUIDELINES.STANDARD.width).toBe(50);
			expect(MAP_SIZE_GUIDELINES.STANDARD.height).toBe(50);
			expect(MAP_SIZE_GUIDELINES.STANDARD.tiles).toBe(2500);
		});

		it('should have LARGE size guidelines', () => {
			expect(MAP_SIZE_GUIDELINES.LARGE.width).toBe(80);
			expect(MAP_SIZE_GUIDELINES.LARGE.height).toBe(80);
			expect(MAP_SIZE_GUIDELINES.LARGE.tiles).toBe(6400);
		});

		it('should have MAX size guidelines', () => {
			expect(MAP_SIZE_GUIDELINES.MAX.width).toBe(100);
			expect(MAP_SIZE_GUIDELINES.MAX.height).toBe(100);
			expect(MAP_SIZE_GUIDELINES.MAX.tiles).toBe(10000);
		});

		it('all sizes should have use case descriptions', () => {
			Object.values(MAP_SIZE_GUIDELINES).forEach((size) => {
				expect(size.useCase).toBeDefined();
				expect(size.useCase.length).toBeGreaterThan(5);
			});
		});

		it('tile counts should be width * height', () => {
			Object.values(MAP_SIZE_GUIDELINES).forEach((size) => {
				expect(size.tiles).toBe(size.width * size.height);
			});
		});
	});

	describe('EXISTING_MAPS', () => {
		it('should have OVERWORLD map', () => {
			expect(EXISTING_MAPS.OVERWORLD.file).toContain('overworld.json');
			expect(EXISTING_MAPS.OVERWORLD.size.width).toBe(50);
			expect(EXISTING_MAPS.OVERWORLD.size.height).toBe(50);
			expect(EXISTING_MAPS.OVERWORLD.scene).toBe('OverworldScene');
		});

		it('should have TOWN map', () => {
			expect(EXISTING_MAPS.TOWN.file).toContain('town.json');
			expect(EXISTING_MAPS.TOWN.size.width).toBe(30);
			expect(EXISTING_MAPS.TOWN.size.height).toBe(30);
			expect(EXISTING_MAPS.TOWN.scene).toBe('TownScene');
		});

		it('should have CAVE map', () => {
			expect(EXISTING_MAPS.CAVE.file).toContain('cave_dungeon.json');
			expect(EXISTING_MAPS.CAVE.size.width).toBe(40);
			expect(EXISTING_MAPS.CAVE.size.height).toBe(40);
			expect(EXISTING_MAPS.CAVE.scene).toBe('CaveScene');
		});

		it('should have TUTORIAL map', () => {
			expect(EXISTING_MAPS.TUTORIAL.file).toContain('tutorial.json');
			expect(EXISTING_MAPS.TUTORIAL.scene).toBe('TutorialScene');
		});

		it('should have LARUS map', () => {
			expect(EXISTING_MAPS.LARUS.file).toContain('larus.json');
			expect(EXISTING_MAPS.LARUS.scene).toBe('MainScene');
		});

		it('all maps should have descriptions', () => {
			Object.values(EXISTING_MAPS).forEach((map) => {
				expect(map.description).toBeDefined();
				expect(map.description.length).toBeGreaterThan(10);
			});
		});
	});

	describe('Module exports', () => {
		it('should export version string', () => {
			expect(TILESET_GUIDE_VERSION).toBe('1.0.0');
		});
	});
});
