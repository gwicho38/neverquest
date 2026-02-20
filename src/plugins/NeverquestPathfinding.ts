/**
 * @fileoverview A* pathfinding system for Neverquest
 *
 * This plugin provides pathfinding capabilities using EasyStarJS:
 * - A* algorithm for optimal path calculation
 * - Tilemap-based walkability grid
 * - Diagonal movement support
 * - Path visualization for debugging
 * - Async path calculation
 *
 * Configuration options:
 * - walkableTiles: Array of walkable tile indices
 * - allowDiagonal: Enable 8-direction movement
 * - dontCrossCorners: Prevent corner cutting
 * - iterationsPerFrame: Performance tuning
 *
 * Used by Enemy AI for player chasing behavior.
 *
 * @see Enemy - Uses pathfinding for AI navigation
 * @see NeverquestLineOfSight - Combined with LOS for smart AI
 *
 * @module plugins/NeverquestPathfinding
 */

import EasyStar from 'easystarjs';
import Phaser from 'phaser';

/**
 * EasyStar path node position
 */
interface IPathNode {
	x: number;
	y: number;
}
import { NumericColors } from '../consts/Colors';
import { Alpha } from '../consts/Numbers';

export interface PathfindingOptions {
	/**
	 * Tiles that can be walked on (floor tiles)
	 * Default: [0] (tile index 0 is walkable)
	 */
	walkableTiles?: number[];

	/**
	 * Should diagonal movement be allowed?
	 * Default: true
	 */
	allowDiagonal?: boolean;

	/**
	 * If diagonal movement is allowed, should corners be cut?
	 * Default: false (don't cut corners)
	 */
	dontCrossCorners?: boolean;

	/**
	 * Maximum number of iterations per frame
	 * Higher = faster pathfinding but more CPU usage
	 * Default: 1000
	 */
	iterationsPerCalculation?: number;
}

export class NeverquestPathfinding {
	private scene: Phaser.Scene;
	private tilemap: Phaser.Tilemaps.Tilemap;
	private easystar: EasyStar.js;
	private grid: number[][];
	private tileWidth: number;
	private tileHeight: number;
	private options: Required<PathfindingOptions>;

	/**
	 * Creates a pathfinding system for the given tilemap
	 * @param scene The Phaser scene
	 * @param tilemap The tilemap to pathfind on
	 * @param collisionLayer The layer containing collision data
	 * @param options Pathfinding configuration options
	 */
	constructor(
		scene: Phaser.Scene,
		tilemap: Phaser.Tilemaps.Tilemap,
		collisionLayer: Phaser.Tilemaps.TilemapLayer,
		options: PathfindingOptions = {}
	) {
		this.scene = scene;
		this.tilemap = tilemap;
		this.tileWidth = tilemap.tileWidth;
		this.tileHeight = tilemap.tileHeight;

		// Set default options
		this.options = {
			walkableTiles: options.walkableTiles || [0],
			allowDiagonal: options.allowDiagonal !== undefined ? options.allowDiagonal : true,
			dontCrossCorners: options.dontCrossCorners !== undefined ? options.dontCrossCorners : true,
			iterationsPerCalculation: options.iterationsPerCalculation || 1000,
		};

		// Initialize EasyStar
		this.easystar = new EasyStar.js();

		// Create grid from collision layer
		this.grid = this.createGridFromLayer(collisionLayer);

		// Configure EasyStar
		this.easystar.setGrid(this.grid);
		this.easystar.setAcceptableTiles(this.options.walkableTiles);
		this.easystar.enableDiagonals();

		if (this.options.dontCrossCorners) {
			this.easystar.disableCornerCutting();
		}

		this.easystar.setIterationsPerCalculation(this.options.iterationsPerCalculation);

		console.log('[Pathfinding] Initialized with grid size:', {
			width: this.grid[0]?.length || 0,
			height: this.grid.length,
			tileSize: `${this.tileWidth}x${this.tileHeight}`,
		});
	}

	/**
	 * Creates a 2D grid from the tilemap layer
	 * 0 = walkable, 1 = blocked
	 */
	private createGridFromLayer(layer: Phaser.Tilemaps.TilemapLayer): number[][] {
		const grid: number[][] = [];

		for (let y = 0; y < this.tilemap.height; y++) {
			grid[y] = [];
			for (let x = 0; x < this.tilemap.width; x++) {
				const tile = layer.getTileAt(x, y);

				// If tile exists and has collision, mark as blocked (1), otherwise walkable (0)
				if (tile && tile.collides) {
					grid[y][x] = 1; // Blocked
				} else {
					grid[y][x] = 0; // Walkable
				}
			}
		}

		return grid;
	}

	/**
	 * Convert world coordinates to tile coordinates
	 */
	public worldToTile(x: number, y: number): { tileX: number; tileY: number } {
		return {
			tileX: Math.floor(x / this.tileWidth),
			tileY: Math.floor(y / this.tileHeight),
		};
	}

	/**
	 * Convert tile coordinates to world coordinates (center of tile)
	 */
	public tileToWorld(tileX: number, tileY: number): { x: number; y: number } {
		return {
			x: tileX * this.tileWidth + this.tileWidth / 2,
			y: tileY * this.tileHeight + this.tileHeight / 2,
		};
	}

	/**
	 * Find a path from start to end position (in world coordinates)
	 * @param startX Start X in world coordinates
	 * @param startY Start Y in world coordinates
	 * @param endX End X in world coordinates
	 * @param endY End Y in world coordinates
	 * @param callback Function called when path is found (or null if no path)
	 */
	public findPath(
		startX: number,
		startY: number,
		endX: number,
		endY: number,
		callback: (path: Phaser.Math.Vector2[] | null) => void
	): void {
		const start = this.worldToTile(startX, startY);
		const end = this.worldToTile(endX, endY);

		// Validate coordinates
		if (
			start.tileX < 0 ||
			start.tileX >= this.tilemap.width ||
			start.tileY < 0 ||
			start.tileY >= this.tilemap.height ||
			end.tileX < 0 ||
			end.tileX >= this.tilemap.width ||
			end.tileY < 0 ||
			end.tileY >= this.tilemap.height
		) {
			console.warn('[Pathfinding] Invalid coordinates:', { start, end });
			callback(null);
			return;
		}

		// Check if end tile is walkable
		if (this.grid[end.tileY][end.tileX] !== 0) {
			console.warn('[Pathfinding] End tile is not walkable:', end);
			callback(null);
			return;
		}

		this.easystar.findPath(start.tileX, start.tileY, end.tileX, end.tileY, (path: IPathNode[] | null) => {
			if (path === null) {
				callback(null);
				return;
			}

			// Convert path from tile coordinates to world coordinates
			const worldPath = path.map((point) => {
				const world = this.tileToWorld(point.x, point.y);
				return new Phaser.Math.Vector2(world.x, world.y);
			});

			callback(worldPath);
		});

		// Calculate the path
		this.easystar.calculate();
	}

	/**
	 * Find a path synchronously (for testing/debugging)
	 * WARNING: May block the main thread if the path is long
	 */
	public findPathSync(startX: number, startY: number, endX: number, endY: number): Phaser.Math.Vector2[] | null {
		let result: Phaser.Math.Vector2[] | null = null;

		this.findPath(startX, startY, endX, endY, (path) => {
			result = path;
		});

		return result;
	}

	/**
	 * Check if a tile is walkable
	 */
	public isTileWalkable(tileX: number, tileY: number): boolean {
		if (tileX < 0 || tileX >= this.tilemap.width || tileY < 0 || tileY >= this.tilemap.height) {
			return false;
		}

		return this.grid[tileY][tileX] === 0;
	}

	/**
	 * Check if a world position is walkable
	 */
	public isPositionWalkable(x: number, y: number): boolean {
		const tile = this.worldToTile(x, y);
		return this.isTileWalkable(tile.tileX, tile.tileY);
	}

	/**
	 * Get the grid for debugging purposes
	 */
	public getGrid(): number[][] {
		return this.grid;
	}

	/**
	 * Draw the pathfinding grid for debugging
	 * @param graphics Phaser graphics object to draw on
	 * @param alpha Alpha transparency (default: 0.3)
	 */
	public debugDraw(graphics: Phaser.GameObjects.Graphics, alpha: number = Alpha.LIGHT): void {
		graphics.clear();

		for (let y = 0; y < this.grid.length; y++) {
			for (let x = 0; x < this.grid[y].length; x++) {
				const world = this.tileToWorld(x, y);

				if (this.grid[y][x] === 0) {
					// Walkable - green
					graphics.fillStyle(NumericColors.GREEN, alpha);
				} else {
					// Blocked - red
					graphics.fillStyle(NumericColors.RED, alpha);
				}

				graphics.fillRect(
					world.x - this.tileWidth / 2,
					world.y - this.tileHeight / 2,
					this.tileWidth,
					this.tileHeight
				);
			}
		}
	}

	/**
	 * Draw a path for debugging
	 * @param graphics Phaser graphics object to draw on
	 * @param path The path to draw
	 * @param color Line color (default: NumericColors.YELLOW)
	 * @param lineWidth Line width (default: 2)
	 */
	public debugDrawPath(
		graphics: Phaser.GameObjects.Graphics,
		path: Phaser.Math.Vector2[],
		color: number = NumericColors.YELLOW,
		lineWidth: number = 2
	): void {
		if (!path || path.length < 2) return;

		graphics.lineStyle(lineWidth, color, 1);

		graphics.beginPath();
		graphics.moveTo(path[0].x, path[0].y);

		for (let i = 1; i < path.length; i++) {
			graphics.lineTo(path[i].x, path[i].y);
		}

		graphics.strokePath();

		// Draw waypoints as circles
		for (const point of path) {
			graphics.fillStyle(color, 0.5);
			graphics.fillCircle(point.x, point.y, 4);
		}
	}
}
