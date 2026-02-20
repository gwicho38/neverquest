/**
 * @fileoverview Line-of-sight and vision cone system for Neverquest
 *
 * This plugin implements ray casting for visibility detection:
 * - Ray casting against tilemap collision layers
 * - Vision cone calculation for directional sight
 * - Wall/obstacle intersection detection
 * - Debug visualization for ray paths
 *
 * Configuration options:
 * - angle: Vision cone angle in degrees
 * - range: Maximum sight distance in pixels
 * - rayCount: Number of rays (accuracy vs performance)
 *
 * Used by Enemy AI to detect player visibility for:
 * - Aggro triggering when player is seen
 * - Breaking chase when line of sight is lost
 *
 * @see Enemy - Uses LOS for player detection
 * @see NeverquestPathfinding - Combined for smart AI
 *
 * @module plugins/NeverquestLineOfSight
 */

import Phaser from 'phaser';
import { NumericColors } from '../consts/Colors';
import { Alpha, SpecialNumbers } from '../consts/Numbers';

export interface LineSegment {
	x1: number;
	y1: number;
	x2: number;
	y2: number;
}

export interface VisionConeOptions {
	/**
	 * Vision angle in degrees (default: 180)
	 */
	angle?: number;

	/**
	 * Vision range in pixels (default: 200)
	 */
	range?: number;

	/**
	 * Number of rays to cast (more = more accurate but slower)
	 * Default: 32
	 */
	rayCount?: number;
}

export class NeverquestLineOfSight {
	private scene: Phaser.Scene;
	private tilemap: Phaser.Tilemaps.Tilemap;
	private collisionLayer: Phaser.Tilemaps.TilemapLayer;
	private obstacles: LineSegment[] = [];

	/**
	 * Creates a line-of-sight system for the given tilemap
	 * @param scene The Phaser scene
	 * @param tilemap The tilemap containing obstacles
	 * @param collisionLayer The layer containing collision data
	 */
	constructor(scene: Phaser.Scene, tilemap: Phaser.Tilemaps.Tilemap, collisionLayer: Phaser.Tilemaps.TilemapLayer) {
		this.scene = scene;
		this.tilemap = tilemap;
		this.collisionLayer = collisionLayer;

		// Build obstacle line segments from collision tiles
		this.buildObstacles();

		console.log('[LineOfSight] Initialized with', this.obstacles.length, 'obstacle segments');
	}

	/**
	 * Build obstacle line segments from collision tiles
	 */
	private buildObstacles(): void {
		this.obstacles = [];

		const tileWidth = this.tilemap.tileWidth;
		const tileHeight = this.tilemap.tileHeight;

		for (let y = 0; y < this.tilemap.height; y++) {
			for (let x = 0; x < this.tilemap.width; x++) {
				const tile = this.collisionLayer.getTileAt(x, y);

				// If tile has collision, add its edges as obstacles
				if (tile && tile.collides) {
					const worldX = x * tileWidth;
					const worldY = y * tileHeight;

					// Top edge
					this.obstacles.push({
						x1: worldX,
						y1: worldY,
						x2: worldX + tileWidth,
						y2: worldY,
					});

					// Bottom edge
					this.obstacles.push({
						x1: worldX,
						y1: worldY + tileHeight,
						x2: worldX + tileWidth,
						y2: worldY + tileHeight,
					});

					// Left edge
					this.obstacles.push({
						x1: worldX,
						y1: worldY,
						x2: worldX,
						y2: worldY + tileHeight,
					});

					// Right edge
					this.obstacles.push({
						x1: worldX + tileWidth,
						y1: worldY,
						x2: worldX + tileWidth,
						y2: worldY + tileHeight,
					});
				}
			}
		}
	}

	/**
	 * Check if target point is visible from source point (no obstacles blocking)
	 * @param sourceX Source X position
	 * @param sourceY Source Y position
	 * @param targetX Target X position
	 * @param targetY Target Y position
	 * @returns true if target is visible from source
	 */
	public isVisible(sourceX: number, sourceY: number, targetX: number, targetY: number): boolean {
		// Cast a ray from source to target
		const ray: LineSegment = {
			x1: sourceX,
			y1: sourceY,
			x2: targetX,
			y2: targetY,
		};

		// Check if ray intersects any obstacles
		for (const obstacle of this.obstacles) {
			if (this.lineSegmentsIntersect(ray, obstacle)) {
				return false; // Blocked by obstacle
			}
		}

		return true; // No obstacles blocking
	}

	/**
	 * Check if target is within a vision cone
	 * @param sourceX Vision source X
	 * @param sourceY Vision source Y
	 * @param sourceAngle Direction the source is facing (in radians)
	 * @param targetX Target X position
	 * @param targetY Target Y position
	 * @param options Vision cone options
	 * @returns true if target is visible within the cone
	 */
	public isInVisionCone(
		sourceX: number,
		sourceY: number,
		sourceAngle: number,
		targetX: number,
		targetY: number,
		options: VisionConeOptions = {}
	): boolean {
		const range = options.range || 200;
		const halfAngle = ((options.angle || 180) / 2) * (Math.PI / 180);

		// Check if target is within range
		const dx = targetX - sourceX;
		const dy = targetY - sourceY;
		const distance = Math.sqrt(dx * dx + dy * dy);
		if (distance > range) {
			return false;
		}

		// Check if target is within vision angle
		const angleToTarget = Math.atan2(targetY - sourceY, targetX - sourceX);
		let angleDiff = Math.abs(sourceAngle - angleToTarget);

		// Normalize angle difference to [-PI, PI]
		if (angleDiff > Math.PI) {
			angleDiff = 2 * Math.PI - angleDiff;
		}

		if (angleDiff > halfAngle) {
			return false; // Outside vision cone
		}

		// Check line-of-sight (no obstacles blocking)
		return this.isVisible(sourceX, sourceY, targetX, targetY);
	}

	/**
	 * Calculate visibility polygon (vision cone with occlusion)
	 * This is computationally expensive, use sparingly
	 */
	public calculateVisionPolygon(
		sourceX: number,
		sourceY: number,
		sourceAngle: number,
		options: VisionConeOptions = {}
	): Phaser.Math.Vector2[] {
		const range = options.range || 200;
		const angle = options.angle || 180;
		const rayCount = options.rayCount || 32;
		const halfAngle = (angle / 2) * (Math.PI / 180);

		const points: Phaser.Math.Vector2[] = [];
		points.push(new Phaser.Math.Vector2(sourceX, sourceY)); // Add center point

		// Cast rays in arc
		for (let i = 0; i <= rayCount; i++) {
			const rayAngle = sourceAngle - halfAngle + (angle * (Math.PI / 180) * i) / rayCount;

			// Calculate ray endpoint
			const endX = sourceX + Math.cos(rayAngle) * range;
			const endY = sourceY + Math.sin(rayAngle) * range;

			// Find closest intersection with obstacles
			let closestPoint = { x: endX, y: endY };
			let closestDist = range;

			for (const obstacle of this.obstacles) {
				const intersection = this.rayIntersectsSegment(
					sourceX,
					sourceY,
					Math.cos(rayAngle),
					Math.sin(rayAngle),
					range,
					obstacle
				);

				if (intersection) {
					const dx = intersection.x - sourceX;
					const dy = intersection.y - sourceY;
					const dist = Math.sqrt(dx * dx + dy * dy);
					if (dist < closestDist) {
						closestDist = dist;
						closestPoint = intersection;
					}
				}
			}

			points.push(new Phaser.Math.Vector2(closestPoint.x, closestPoint.y));
		}

		return points;
	}

	/**
	 * Check if two line segments intersect
	 */
	private lineSegmentsIntersect(line1: LineSegment, line2: LineSegment): boolean {
		const det = (line1.x2 - line1.x1) * (line2.y2 - line2.y1) - (line2.x2 - line2.x1) * (line1.y2 - line1.y1);

		if (det === 0) {
			return false; // Lines are parallel
		}

		const lambda =
			((line2.y2 - line2.y1) * (line2.x2 - line1.x1) + (line2.x1 - line2.x2) * (line2.y2 - line1.y1)) / det;
		const gamma =
			((line1.y1 - line1.y2) * (line2.x2 - line1.x1) + (line1.x2 - line1.x1) * (line2.y2 - line1.y1)) / det;

		return lambda > 0 && lambda < 1 && gamma > 0 && gamma < 1;
	}

	/**
	 * Find intersection point of ray with line segment
	 */
	private rayIntersectsSegment(
		rayX: number,
		rayY: number,
		rayDirX: number,
		rayDirY: number,
		rayLength: number,
		segment: LineSegment
	): { x: number; y: number } | null {
		const x1 = segment.x1 - rayX;
		const y1 = segment.y1 - rayY;
		const x2 = segment.x2 - rayX;
		const y2 = segment.y2 - rayY;

		const dx = x2 - x1;
		const dy = y2 - y1;

		const det = dx * rayDirY - dy * rayDirX;
		if (Math.abs(det) < SpecialNumbers.LINE_OF_SIGHT_PARALLEL_THRESHOLD) {
			return null; // Parallel
		}

		const u = (x1 * rayDirY - y1 * rayDirX) / det;
		const v = (x1 * dy - y1 * dx) / det;

		if (v < 0 || v > rayLength || u < 0 || u > 1) {
			return null; // No intersection
		}

		return {
			x: rayX + rayDirX * v,
			y: rayY + rayDirY * v,
		};
	}

	/**
	 * Draw vision cone for debugging
	 * @param graphics Graphics object to draw on
	 * @param sourceX Vision source X
	 * @param sourceY Vision source Y
	 * @param sourceAngle Direction facing (radians)
	 * @param options Vision cone options
	 * @param color Fill color (default: NumericColors.YELLOW)
	 * @param alpha Alpha transparency (default: 0.3)
	 */
	public debugDrawVisionCone(
		graphics: Phaser.GameObjects.Graphics,
		sourceX: number,
		sourceY: number,
		sourceAngle: number,
		options: VisionConeOptions = {},
		color: number = NumericColors.YELLOW,
		alpha: number = Alpha.LIGHT
	): void {
		const polygon = this.calculateVisionPolygon(sourceX, sourceY, sourceAngle, options);

		if (polygon.length < 3) return;

		graphics.fillStyle(color, alpha);
		graphics.beginPath();
		graphics.moveTo(polygon[0].x, polygon[0].y);

		for (let i = 1; i < polygon.length; i++) {
			graphics.lineTo(polygon[i].x, polygon[i].y);
		}

		graphics.closePath();
		graphics.fillPath();

		// Draw direction indicator
		const indicatorLength = 20;
		const endX = sourceX + Math.cos(sourceAngle) * indicatorLength;
		const endY = sourceY + Math.sin(sourceAngle) * indicatorLength;

		graphics.lineStyle(2, NumericColors.RED, 1);
		graphics.lineBetween(sourceX, sourceY, endX, endY);
	}

	/**
	 * Draw all obstacles for debugging
	 * @param graphics Graphics object to draw on
	 * @param color Line color (default: NumericColors.RED)
	 * @param alpha Alpha transparency (default: 0.5)
	 */
	public debugDrawObstacles(
		graphics: Phaser.GameObjects.Graphics,
		color: number = NumericColors.RED,
		alpha: number = 0.5
	): void {
		graphics.lineStyle(1, color, alpha);

		for (const obstacle of this.obstacles) {
			graphics.lineBetween(obstacle.x1, obstacle.y1, obstacle.x2, obstacle.y2);
		}
	}

	/**
	 * Get all obstacles (for advanced usage)
	 */
	public getObstacles(): LineSegment[] {
		return this.obstacles;
	}
}
