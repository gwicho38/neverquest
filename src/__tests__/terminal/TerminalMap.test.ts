/**
 * Tests for TerminalMap
 */

import { TerminalMap, TileType } from '../../terminal/TerminalMap';
import { TerminalEntity } from '../../terminal/entities/TerminalEntity';

// Mock TerminalAnimator
jest.mock('../../terminal/TerminalAnimator', () => ({
	TerminalAnimator: jest.fn().mockImplementation(() => ({
		addEffect: jest.fn(),
		getEffectAt: jest.fn().mockReturnValue(null),
		clearEffects: jest.fn(),
	})),
}));

// Mock TerminalEntity
jest.mock('../../terminal/entities/TerminalEntity', () => ({
	TerminalEntity: jest.fn().mockImplementation((x, y, symbol, color, attrs, name) => ({
		x,
		y,
		symbol,
		color,
		entityName: name,
		id: `${name}_${Date.now()}`,
		toString: jest.fn().mockReturnValue(`{${color}-fg}${symbol}{/${color}-fg}`),
	})),
}));

describe('TerminalMap', () => {
	describe('constructor', () => {
		it('should create a map with correct dimensions', () => {
			const map = new TerminalMap(80, 40);

			expect(map.width).toBe(80);
			expect(map.height).toBe(40);
		});

		it('should initialize tiles array', () => {
			const map = new TerminalMap(80, 40);

			expect(map.tiles).toBeDefined();
			expect(map.tiles.length).toBe(40);
			expect(map.tiles[0].length).toBe(80);
		});

		it('should create walls around edges', () => {
			const map = new TerminalMap(10, 10);

			// Top row
			expect(map.tiles[0][0]).toBe(TileType.WALL);
			expect(map.tiles[0][5]).toBe(TileType.WALL);
			expect(map.tiles[0][9]).toBe(TileType.WALL);

			// Bottom row
			expect(map.tiles[9][0]).toBe(TileType.WALL);
			expect(map.tiles[9][5]).toBe(TileType.WALL);
			expect(map.tiles[9][9]).toBe(TileType.WALL);

			// Left and right edges
			expect(map.tiles[5][0]).toBe(TileType.WALL);
			expect(map.tiles[5][9]).toBe(TileType.WALL);
		});

		it('should create floor in the interior', () => {
			const map = new TerminalMap(10, 10);

			expect(map.tiles[1][1]).toBe(TileType.FLOOR);
			expect(map.tiles[5][5]).toBe(TileType.FLOOR);
		});

		it('should initialize entities array', () => {
			const map = new TerminalMap(80, 40);

			expect(map.entities).toBeDefined();
			expect(map.entities.length).toBe(0);
		});

		it('should create animator instance', () => {
			const map = new TerminalMap(80, 40);

			expect(map.animator).toBeDefined();
		});
	});

	describe('generateDungeon', () => {
		it('should fill map with walls initially', () => {
			const map = new TerminalMap(80, 40);
			map.generateDungeon();

			// Most tiles should be walls
			let wallCount = 0;
			let floorCount = 0;
			for (let y = 0; y < map.height; y++) {
				for (let x = 0; x < map.width; x++) {
					if (map.tiles[y][x] === TileType.WALL) {
						wallCount++;
					} else if (map.tiles[y][x] === TileType.FLOOR) {
						floorCount++;
					}
				}
			}

			expect(wallCount).toBeGreaterThan(0);
			expect(floorCount).toBeGreaterThan(0);
		});

		it('should create rooms with floor tiles', () => {
			const map = new TerminalMap(80, 40);
			map.generateDungeon();

			// Check that there are some floor tiles (rooms)
			let hasFloor = false;
			for (let y = 0; y < map.height; y++) {
				for (let x = 0; x < map.width; x++) {
					if (map.tiles[y][x] === TileType.FLOOR) {
						hasFloor = true;
						break;
					}
				}
				if (hasFloor) break;
			}

			expect(hasFloor).toBe(true);
		});
	});

	describe('generateOverworld', () => {
		it('should create grass tiles', () => {
			const map = new TerminalMap(80, 40);
			map.generateOverworld();

			let hasGrass = false;
			for (let y = 0; y < map.height; y++) {
				for (let x = 0; x < map.width; x++) {
					if (map.tiles[y][x] === TileType.GRASS) {
						hasGrass = true;
						break;
					}
				}
				if (hasGrass) break;
			}

			expect(hasGrass).toBe(true);
		});

		it('should create water bodies', () => {
			const map = new TerminalMap(80, 40);
			map.generateOverworld();

			let hasWater = false;
			for (let y = 0; y < map.height; y++) {
				for (let x = 0; x < map.width; x++) {
					if (map.tiles[y][x] === TileType.WATER) {
						hasWater = true;
						break;
					}
				}
				if (hasWater) break;
			}

			expect(hasWater).toBe(true);
		});

		it('should create houses', () => {
			const map = new TerminalMap(80, 40);
			map.generateOverworld();

			let hasHouseWall = false;
			let hasHouseRoof = false;
			for (let y = 0; y < map.height; y++) {
				for (let x = 0; x < map.width; x++) {
					if (map.tiles[y][x] === TileType.HOUSE_WALL) {
						hasHouseWall = true;
					}
					if (map.tiles[y][x] === TileType.HOUSE_ROOF) {
						hasHouseRoof = true;
					}
				}
			}

			expect(hasHouseWall).toBe(true);
			expect(hasHouseRoof).toBe(true);
		});

		it('should add doors to houses', () => {
			const map = new TerminalMap(80, 40);
			map.generateOverworld();

			let hasDoor = false;
			for (let y = 0; y < map.height; y++) {
				for (let x = 0; x < map.width; x++) {
					if (map.tiles[y][x] === TileType.DOOR) {
						hasDoor = true;
						break;
					}
				}
				if (hasDoor) break;
			}

			expect(hasDoor).toBe(true);
		});
	});

	describe('isWalkable', () => {
		it('should return false for out of bounds', () => {
			const map = new TerminalMap(10, 10);

			expect(map.isWalkable(-1, 0)).toBe(false);
			expect(map.isWalkable(0, -1)).toBe(false);
			expect(map.isWalkable(10, 0)).toBe(false);
			expect(map.isWalkable(0, 10)).toBe(false);
		});

		it('should return false for walls', () => {
			const map = new TerminalMap(10, 10);

			expect(map.isWalkable(0, 0)).toBe(false);
			expect(map.isWalkable(9, 9)).toBe(false);
		});

		it('should return true for floor tiles', () => {
			const map = new TerminalMap(10, 10);

			expect(map.isWalkable(1, 1)).toBe(true);
			expect(map.isWalkable(5, 5)).toBe(true);
		});

		it('should return false for water', () => {
			const map = new TerminalMap(10, 10);
			map.tiles[5][5] = TileType.WATER;

			expect(map.isWalkable(5, 5)).toBe(false);
		});

		it('should return false for trees', () => {
			const map = new TerminalMap(10, 10);
			map.tiles[5][5] = TileType.TREE;

			expect(map.isWalkable(5, 5)).toBe(false);
		});

		it('should return true for grass', () => {
			const map = new TerminalMap(10, 10);
			map.tiles[5][5] = TileType.GRASS;

			expect(map.isWalkable(5, 5)).toBe(true);
		});

		it('should return true for doors', () => {
			const map = new TerminalMap(10, 10);
			map.tiles[5][5] = TileType.DOOR;

			expect(map.isWalkable(5, 5)).toBe(true);
		});

		it('should return true for paths', () => {
			const map = new TerminalMap(10, 10);
			map.tiles[5][5] = TileType.PATH;

			expect(map.isWalkable(5, 5)).toBe(true);
		});
	});

	describe('entity management', () => {
		const mockAttrs: any = {
			health: 100,
			maxHealth: 100,
			atack: 10,
			defense: 5,
		};

		it('should add entity', () => {
			const map = new TerminalMap(10, 10);
			const entity = new TerminalEntity(5, 5, '@', 'green', mockAttrs, 'Player');

			map.addEntity(entity);

			expect(map.entities.length).toBe(1);
			expect(map.entities[0]).toBe(entity);
		});

		it('should remove entity', () => {
			const map = new TerminalMap(10, 10);
			const entity = new TerminalEntity(5, 5, '@', 'green', mockAttrs, 'Player');

			map.addEntity(entity);
			expect(map.entities.length).toBe(1);

			map.removeEntity(entity);
			expect(map.entities.length).toBe(0);
		});

		it('should not fail when removing non-existent entity', () => {
			const map = new TerminalMap(10, 10);
			const entity = new TerminalEntity(5, 5, '@', 'green', mockAttrs, 'Player');

			expect(() => map.removeEntity(entity)).not.toThrow();
		});

		it('should get entity at position', () => {
			const map = new TerminalMap(10, 10);
			const entity = new TerminalEntity(5, 5, '@', 'green', mockAttrs, 'Player');

			map.addEntity(entity);

			const found = map.getEntityAt(5, 5);
			expect(found).toBe(entity);
		});

		it('should return null when no entity at position', () => {
			const map = new TerminalMap(10, 10);

			const found = map.getEntityAt(5, 5);
			expect(found).toBeNull();
		});
	});

	describe('render', () => {
		it('should return a string', () => {
			const map = new TerminalMap(20, 20);

			const result = map.render(10, 10, 10, 10);

			expect(typeof result).toBe('string');
		});

		it('should contain multiple lines', () => {
			const map = new TerminalMap(20, 20);

			const result = map.render(10, 10, 10, 10);
			const lines = result.split('\n');

			expect(lines.length).toBeGreaterThan(1);
		});

		it('should render entities', () => {
			const map = new TerminalMap(20, 20);
			const mockAttrs: any = {
				health: 100,
				maxHealth: 100,
				atack: 10,
				defense: 5,
			};
			const entity = new TerminalEntity(10, 10, '@', 'green', mockAttrs, 'Player');
			map.addEntity(entity);

			map.render(10, 10, 10, 10);

			// Entity's toString should have been called during render
			expect(entity.toString).toHaveBeenCalled();
		});

		it('should handle out of bounds gracefully', () => {
			const map = new TerminalMap(20, 20);

			// Center near edge of map
			const result = map.render(0, 0, 10, 10);

			expect(typeof result).toBe('string');
		});
	});

	describe('findSpawnPosition', () => {
		it('should return a walkable position', () => {
			const map = new TerminalMap(10, 10);

			const pos = map.findSpawnPosition();

			expect(map.isWalkable(pos.x, pos.y)).toBe(true);
		});

		it('should return coordinates within map bounds', () => {
			const map = new TerminalMap(10, 10);

			const pos = map.findSpawnPosition();

			expect(pos.x).toBeGreaterThanOrEqual(0);
			expect(pos.x).toBeLessThan(10);
			expect(pos.y).toBeGreaterThanOrEqual(0);
			expect(pos.y).toBeLessThan(10);
		});

		it('should return fallback position if no walkable found', () => {
			const map = new TerminalMap(3, 3);
			// Fill entire map with walls
			for (let y = 0; y < 3; y++) {
				for (let x = 0; x < 3; x++) {
					map.tiles[y][x] = TileType.WALL;
				}
			}

			const pos = map.findSpawnPosition();

			expect(pos).toEqual({ x: 1, y: 1 });
		});
	});

	describe('TileType enum', () => {
		it('should have correct tile types', () => {
			expect(TileType.WALL).toBe(0);
			expect(TileType.FLOOR).toBe(1);
			expect(TileType.DOOR).toBe(2);
			expect(TileType.WATER).toBe(3);
			expect(TileType.TREASURE).toBe(4);
			expect(TileType.TORCH).toBe(5);
			expect(TileType.GRASS).toBe(6);
			expect(TileType.TREE).toBe(7);
			expect(TileType.FLOWER).toBe(8);
			expect(TileType.PATH).toBe(9);
			expect(TileType.HOUSE_WALL).toBe(10);
			expect(TileType.HOUSE_ROOF).toBe(11);
			expect(TileType.FENCE).toBe(12);
			expect(TileType.BUSH).toBe(13);
		});
	});
});
