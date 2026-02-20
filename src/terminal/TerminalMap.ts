/**
 * @fileoverview Terminal map generation and rendering
 *
 * This file provides the map system for terminal gameplay:
 * - Tile-based map with multiple terrain types
 * - Overworld generation (grass, water, houses, trees)
 * - Dungeon generation (rooms, corridors)
 * - Entity management and collision detection
 * - Camera-relative viewport rendering
 *
 * @see TerminalGame - Uses map for gameplay
 * @see TerminalAnimator - Visual effect overlay
 *
 * @module terminal/TerminalMap
 */

import { TerminalEntity } from './entities/TerminalEntity';
import { TerminalAnimator } from './TerminalAnimator';

export enum TileType {
	WALL = 0,
	FLOOR = 1,
	DOOR = 2,
	WATER = 3,
	TREASURE = 4,
	TORCH = 5,
	GRASS = 6,
	TREE = 7,
	FLOWER = 8,
	PATH = 9,
	HOUSE_WALL = 10,
	HOUSE_ROOF = 11,
	FENCE = 12,
	BUSH = 13,
}

/**
 * Terminal map renderer
 */
export class TerminalMap {
	public width: number;
	public height: number;
	public tiles: TileType[][];
	public entities: TerminalEntity[] = [];
	public animator: TerminalAnimator;

	// Tile symbols
	private readonly TILE_SYMBOLS: Record<TileType, string> = {
		[TileType.WALL]: '█',
		[TileType.FLOOR]: '.',
		[TileType.DOOR]: '🚪',
		[TileType.WATER]: '~',
		[TileType.TREASURE]: '💎',
		[TileType.TORCH]: '🔥',
		[TileType.GRASS]: '░',
		[TileType.TREE]: '🌳',
		[TileType.FLOWER]: '🌸',
		[TileType.PATH]: '·',
		[TileType.HOUSE_WALL]: '▓',
		[TileType.HOUSE_ROOF]: '▀',
		[TileType.FENCE]: '‖',
		[TileType.BUSH]: '≈',
	};

	// Tile colors (using valid blessed color names)
	private readonly TILE_COLORS: Record<TileType, string> = {
		[TileType.WALL]: 'white',
		[TileType.FLOOR]: 'yellow',
		[TileType.DOOR]: 'yellow',
		[TileType.WATER]: 'cyan',
		[TileType.TREASURE]: 'yellow',
		[TileType.TORCH]: 'red',
		[TileType.GRASS]: 'green',
		[TileType.TREE]: 'green',
		[TileType.FLOWER]: 'magenta',
		[TileType.PATH]: 'yellow',
		[TileType.HOUSE_WALL]: 'red',
		[TileType.HOUSE_ROOF]: 'red',
		[TileType.FENCE]: 'yellow',
		[TileType.BUSH]: 'green',
	};

	constructor(width: number, height: number) {
		this.width = width;
		this.height = height;
		this.tiles = this.generateEmptyMap();
		this.animator = new TerminalAnimator();
	}

	/**
	 * Generate an empty map
	 */
	private generateEmptyMap(): TileType[][] {
		const map: TileType[][] = [];
		for (let y = 0; y < this.height; y++) {
			const row: TileType[] = [];
			for (let x = 0; x < this.width; x++) {
				// Create walls around edges, floor in the middle
				if (x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1) {
					row.push(TileType.WALL);
				} else {
					row.push(TileType.FLOOR);
				}
			}
			map.push(row);
		}
		return map;
	}

	/**
	 * Generate a colorful overworld
	 */
	public generateOverworld(): void {
		// Fill entire map with grass
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				this.tiles[y][x] = TileType.GRASS;
			}
		}

		// Add water bodies (river/lake)
		this.createWaterBody(60, 10, 15, 25);
		this.createWaterBody(5, 25, 20, 10);

		// Build houses
		this.createHouse(15, 8, 8, 6); // House 1
		this.createHouse(40, 8, 10, 7); // House 2
		this.createHouse(15, 20, 7, 6); // House 3
		this.createHouse(42, 22, 9, 6); // House 4

		// Add decorative elements
		this.addTrees();
		this.addFlowers();
		this.addBushes();

		// Add some treasure chests
		this.tiles[12][25] = TileType.TREASURE;
		this.tiles[28][50] = TileType.TREASURE;
	}

	/**
	 * Generate a simple dungeon (old method)
	 */
	public generateDungeon(): void {
		// Fill with walls first
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				this.tiles[y][x] = TileType.WALL;
			}
		}

		// Create some rooms
		this.createRoom(5, 5, 10, 8);
		this.createRoom(20, 5, 10, 8);
		this.createRoom(5, 15, 10, 8);
		this.createRoom(20, 15, 10, 8);

		// Create corridors
		this.createHorizontalCorridor(10, 15, 9);
		this.createHorizontalCorridor(10, 15, 19);
		this.createVerticalCorridor(9, 8, 19);
		this.createVerticalCorridor(25, 8, 19);
	}

	/**
	 * Create a rectangular room
	 */
	private createRoom(x: number, y: number, width: number, height: number): void {
		for (let dy = 0; dy < height; dy++) {
			for (let dx = 0; dx < width; dx++) {
				const mapX = x + dx;
				const mapY = y + dy;
				if (mapX > 0 && mapX < this.width - 1 && mapY > 0 && mapY < this.height - 1) {
					this.tiles[mapY][mapX] = TileType.FLOOR;
				}
			}
		}
	}

	/**
	 * Create a horizontal corridor (3 tiles wide)
	 */
	private createHorizontalCorridor(x1: number, x2: number, y: number): void {
		const minX = Math.min(x1, x2);
		const maxX = Math.max(x1, x2);
		for (let x = minX; x <= maxX; x++) {
			// Create 3-tile wide corridor
			for (let dy = -1; dy <= 1; dy++) {
				const corridorY = y + dy;
				if (x > 0 && x < this.width - 1 && corridorY > 0 && corridorY < this.height - 1) {
					this.tiles[corridorY][x] = TileType.FLOOR;
				}
			}
		}
	}

	/**
	 * Create a vertical corridor (3 tiles wide)
	 */
	private createVerticalCorridor(x: number, y1: number, y2: number): void {
		const minY = Math.min(y1, y2);
		const maxY = Math.max(y1, y2);
		for (let y = minY; y <= maxY; y++) {
			// Create 3-tile wide corridor
			for (let dx = -1; dx <= 1; dx++) {
				const corridorX = x + dx;
				if (corridorX > 0 && corridorX < this.width - 1 && y > 0 && y < this.height - 1) {
					this.tiles[y][corridorX] = TileType.FLOOR;
				}
			}
		}
	}

	/**
	 * Create a house structure
	 */
	private createHouse(x: number, y: number, width: number, height: number): void {
		// Roof
		for (let dx = 0; dx < width; dx++) {
			if (x + dx < this.width && y >= 0) {
				this.tiles[y][x + dx] = TileType.HOUSE_ROOF;
			}
		}

		// Walls and interior
		for (let dy = 1; dy < height; dy++) {
			for (let dx = 0; dx < width; dx++) {
				if (x + dx < this.width && y + dy < this.height) {
					if (dx === 0 || dx === width - 1 || dy === height - 1) {
						this.tiles[y + dy][x + dx] = TileType.HOUSE_WALL;
					} else {
						this.tiles[y + dy][x + dx] = TileType.FLOOR;
					}
				}
			}
		}

		// Add door
		if (x + Math.floor(width / 2) < this.width && y + height - 1 < this.height) {
			this.tiles[y + height - 1][x + Math.floor(width / 2)] = TileType.DOOR;
		}
	}

	/**
	 * Create a water body
	 */
	private createWaterBody(x: number, y: number, width: number, height: number): void {
		for (let dy = 0; dy < height; dy++) {
			for (let dx = 0; dx < width; dx++) {
				if (x + dx < this.width && y + dy < this.height && x + dx >= 0 && y + dy >= 0) {
					this.tiles[y + dy][x + dx] = TileType.WATER;
				}
			}
		}
	}

	/**
	 * Create a path
	 */
	private createPath(x1: number, y1: number, x2: number, y2: number): void {
		// Horizontal path
		if (y1 === y2) {
			const minX = Math.min(x1, x2);
			const maxX = Math.max(x1, x2);
			for (let x = minX; x <= maxX; x++) {
				if (x >= 0 && x < this.width && y1 >= 0 && y1 < this.height) {
					this.tiles[y1][x] = TileType.PATH;
				}
			}
		}
		// Vertical path
		else if (x1 === x2) {
			const minY = Math.min(y1, y2);
			const maxY = Math.max(y1, y2);
			for (let y = minY; y <= maxY; y++) {
				if (x1 >= 0 && x1 < this.width && y >= 0 && y < this.height) {
					this.tiles[y][x1] = TileType.PATH;
				}
			}
		}
	}

	/**
	 * Add trees randomly
	 */
	private addTrees(): void {
		for (let i = 0; i < 30; i++) {
			const x = Math.floor(Math.random() * this.width);
			const y = Math.floor(Math.random() * this.height);
			if (this.tiles[y][x] === TileType.GRASS) {
				this.tiles[y][x] = TileType.TREE;
			}
		}
	}

	/**
	 * Add flowers randomly
	 */
	private addFlowers(): void {
		for (let i = 0; i < 20; i++) {
			const x = Math.floor(Math.random() * this.width);
			const y = Math.floor(Math.random() * this.height);
			if (this.tiles[y][x] === TileType.GRASS) {
				this.tiles[y][x] = TileType.FLOWER;
			}
		}
	}

	/**
	 * Add bushes randomly
	 */
	private addBushes(): void {
		for (let i = 0; i < 15; i++) {
			const x = Math.floor(Math.random() * this.width);
			const y = Math.floor(Math.random() * this.height);
			if (this.tiles[y][x] === TileType.GRASS) {
				this.tiles[y][x] = TileType.BUSH;
			}
		}
	}

	/**
	 * Check if a position is walkable
	 */
	public isWalkable(x: number, y: number): boolean {
		if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
			return false;
		}
		const tile = this.tiles[y][x];
		return (
			tile !== TileType.WALL &&
			tile !== TileType.WATER &&
			tile !== TileType.TREE &&
			tile !== TileType.HOUSE_WALL &&
			tile !== TileType.HOUSE_ROOF &&
			tile !== TileType.FENCE
		);
	}

	/**
	 * Add an entity to the map
	 */
	public addEntity(entity: TerminalEntity): void {
		this.entities.push(entity);
	}

	/**
	 * Remove an entity from the map
	 */
	public removeEntity(entity: TerminalEntity): void {
		const index = this.entities.indexOf(entity);
		if (index > -1) {
			this.entities.splice(index, 1);
		}
	}

	/**
	 * Get entity at position
	 */
	public getEntityAt(x: number, y: number): TerminalEntity | null {
		return this.entities.find((e) => e.x === x && e.y === y) || null;
	}

	/**
	 * Render the map around a center point (camera)
	 */
	public render(centerX: number, centerY: number, viewWidth: number, viewHeight: number): string {
		const lines: string[] = [];
		const halfWidth = Math.floor(viewWidth / 2);
		const halfHeight = Math.floor(viewHeight / 2);

		for (let dy = -halfHeight; dy <= halfHeight; dy++) {
			let line = '';
			for (let dx = -halfWidth; dx <= halfWidth; dx++) {
				const x = centerX + dx;
				const y = centerY + dy;

				// Check for animation effect first (highest priority)
				const effect = this.animator.getEffectAt(x, y);
				if (effect) {
					line += `{${effect.color}-fg}${effect.symbol}{/${effect.color}-fg}`;
				} else {
					// Check for entity at this position
					const entity = this.getEntityAt(x, y);
					if (entity) {
						line += entity.toString();
					} else if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
						const tile = this.tiles[y][x];
						const symbol = this.TILE_SYMBOLS[tile];
						const color = this.TILE_COLORS[tile];
						line += `{${color}-bg}{white-fg}${symbol}{/white-fg}{/${color}-bg}`;
					} else {
						line += ' ';
					}
				}
			}
			lines.push(line);
		}

		return lines.join('\n');
	}

	/**
	 * Find a walkable spawn position
	 */
	public findSpawnPosition(): { x: number; y: number } {
		for (let y = 1; y < this.height - 1; y++) {
			for (let x = 1; x < this.width - 1; x++) {
				if (this.isWalkable(x, y)) {
					return { x, y };
				}
			}
		}
		return { x: 1, y: 1 };
	}
}
