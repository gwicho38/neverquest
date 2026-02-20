/**
 * @fileoverview Programmatic enemy zone spawning for Neverquest
 *
 * This plugin creates enemy spawn zones without Tiled map objects:
 * - Defines zones with position, size, and enemy type
 * - Spawns enemies within zone boundaries
 * - Optional respawn timers for zone repopulation
 * - Useful for prototyping and dynamic zone creation
 *
 * Zone configuration:
 * - id: Unique zone identifier
 * - x, y: Center position
 * - width, height: Zone dimensions
 * - enemyId: Enemy type from EnemiesSeedConfig
 * - count: Number of enemies to spawn
 * - respawnDelay: Optional respawn timer in ms
 *
 * @see NeverquestEnemyZones - Tiled-based alternative
 * @see EnemiesSeedConfig - Enemy type definitions
 * @see Enemy - Enemy entity class
 *
 * @module plugins/NeverquestProgrammaticEnemyZones
 */

import Phaser from 'phaser';
import { AnimationNames } from '../consts/AnimationNames';
import { EnemiesSeedConfig } from '../consts/enemies/EnemiesSeedConfig';
import { Enemy } from '../entities/Enemy';

/**
 * Configuration for a programmatic enemy zone
 */
export interface IProgrammaticEnemyZone {
	/** Unique identifier for the zone */
	id: string;
	/** X position of the zone center */
	x: number;
	/** Y position of the zone center */
	y: number;
	/** Width of the spawn zone */
	width: number;
	/** Height of the spawn zone */
	height: number;
	/** Enemy type ID (from EnemiesSeedConfig) */
	enemyId: number;
	/** Number of enemies to spawn in this zone */
	count: number;
	/** Optional respawn delay in ms (0 = no respawn) */
	respawnDelay?: number;
}

/**
 * Interface for scenes that contain enemies
 */
interface IEnemyScene extends Phaser.Scene {
	enemies: Enemy[];
}

/**
 * NeverquestProgrammaticEnemyZones - Creates enemy spawn zones programmatically
 *
 * This plugin allows defining enemy spawn zones without requiring a Tiled map.
 * It's useful for prototyping scenes or creating dynamic enemy zones at runtime.
 *
 * @example
 * ```typescript
 * const enemyZones = new NeverquestProgrammaticEnemyZones(scene);
 * enemyZones.addZones([
 *   { id: 'west_bandits', x: 200, y: 640, width: 200, height: 200, enemyId: 4, count: 3 },
 *   { id: 'east_wolves', x: 1000, y: 400, width: 300, height: 200, enemyId: 5, count: 2 },
 * ]);
 * enemyZones.create();
 * ```
 */
export class NeverquestProgrammaticEnemyZones {
	scene: Phaser.Scene;
	zones: Phaser.GameObjects.Zone[];
	zoneConfigs: IProgrammaticEnemyZone[];
	/** Animation prefix for idle animations */
	idlePrefixAnimation: string;
	/** Animation suffix for down direction */
	downAnimationSufix: string;
	/** Whether enemies have been spawned */
	hasSpawned: boolean;

	/**
	 * Creates a new programmatic enemy zones manager
	 * @param scene - The Phaser scene to add enemies to
	 */
	constructor(scene: Phaser.Scene) {
		this.scene = scene;
		this.zones = [];
		this.zoneConfigs = [];
		this.hasSpawned = false;

		// Copy animation name constants
		const animNames = new AnimationNames();
		this.idlePrefixAnimation = animNames.idlePrefixAnimation;
		this.downAnimationSufix = animNames.downAnimationSufix;
	}

	/**
	 * Adds zone configurations to be spawned when create() is called
	 * @param configs - Array of enemy zone configurations
	 */
	addZones(configs: IProgrammaticEnemyZone[]): void {
		this.zoneConfigs.push(...configs);
	}

	/**
	 * Adds a single zone configuration
	 * @param config - Enemy zone configuration
	 */
	addZone(config: IProgrammaticEnemyZone): void {
		this.zoneConfigs.push(config);
	}

	/**
	 * Creates all configured enemy zones and spawns enemies
	 */
	create(): void {
		if (this.hasSpawned) return;

		const enemyScene = this.scene as IEnemyScene;

		this.zoneConfigs.forEach((config) => {
			this.spawnZoneEnemies(config, enemyScene);
		});

		// Add collider for all enemies
		if (enemyScene.enemies && enemyScene.enemies.length > 0) {
			this.scene.physics.add.collider(enemyScene.enemies, undefined);
		}

		this.hasSpawned = true;
	}

	/**
	 * Spawns enemies for a specific zone configuration
	 */
	private spawnZoneEnemies(config: IProgrammaticEnemyZone, enemyScene: IEnemyScene): void {
		// Create the zone rectangle for random spawning
		const spawnBounds = new Phaser.Geom.Rectangle(
			config.x - config.width / 2,
			config.y - config.height / 2,
			config.width,
			config.height
		);

		// Create a visual zone (invisible, but useful for debugging)
		const zone = this.scene.add.zone(config.x, config.y, config.width, config.height);
		zone.setData('zoneId', config.id);
		this.zones.push(zone);

		// Look up enemy configuration
		const enemyConfig = EnemiesSeedConfig.find((e) => e.id === config.enemyId);
		if (!enemyConfig) {
			console.warn(`[ProgrammaticEnemyZones] Enemy ID ${config.enemyId} not found in EnemiesSeedConfig`);
			return;
		}

		const textureValue = enemyConfig.texture;

		// Spawn enemies at random positions within the zone
		for (let i = 0; i < config.count; i++) {
			const pos = Phaser.Geom.Rectangle.Random(spawnBounds, new Phaser.Geom.Point());

			const enemy = new Enemy(this.scene, pos.x, pos.y, textureValue, config.enemyId);

			// Play idle animation facing down
			const idleDown = `${this.idlePrefixAnimation}-${this.downAnimationSufix}`;
			const idleAnimation = `${textureValue}-${idleDown}`;

			if (enemy.anims) {
				try {
					enemy.anims.play(idleAnimation);
				} catch {
					// Animation may not exist yet
				}
			}

			if (enemy.body) {
				enemy.body.setSize(enemy.width, enemy.height);
			}

			enemyScene.enemies.push(enemy);
		}
	}

	/**
	 * Gets enemies in a specific zone by zone ID
	 * @param zoneId - The zone ID to filter by
	 * @returns Array of enemies in that zone
	 */
	getEnemiesInZone(zoneId: string): Enemy[] {
		const enemyScene = this.scene as IEnemyScene;
		const zone = this.zones.find((z) => z.getData('zoneId') === zoneId);

		if (!zone || !enemyScene.enemies) return [];

		const zoneBounds = new Phaser.Geom.Rectangle(
			zone.x - zone.width / 2,
			zone.y - zone.height / 2,
			zone.width,
			zone.height
		);

		return enemyScene.enemies.filter((enemy) => zoneBounds.contains(enemy.x, enemy.y));
	}

	/**
	 * Destroys all zones (enemies persist in the scene's enemies array)
	 */
	destroy(): void {
		this.zones.forEach((zone) => zone.destroy());
		this.zones = [];
		this.zoneConfigs = [];
		this.hasSpawned = false;
	}
}

/**
 * Predefined enemy zone configurations for the Crossroads scene
 *
 * Zone layout (80x80 tile map, 16px tiles = 1280x1280 pixels):
 * - West path: Bandits guard the path to Ancient Ruins
 * - East area: Wolves roam near the mountain pass
 * - Roaming: Shadow Scout patrols the entire area
 */
export const CROSSROADS_ENEMY_ZONES: IProgrammaticEnemyZone[] = [
	{
		id: 'west_bandits_1',
		x: 256, // West side (tile 16)
		y: 640, // Middle (tile 40)
		width: 192,
		height: 192,
		enemyId: 4, // Bandit from EnemiesSeedConfig
		count: 2,
	},
	{
		id: 'west_bandits_2',
		x: 192, // Further west (tile 12)
		y: 800, // Lower middle (tile 50)
		width: 160,
		height: 160,
		enemyId: 4, // Bandit
		count: 2,
	},
	{
		id: 'east_wolves_1',
		x: 1024, // East side (tile 64)
		y: 480, // Upper middle (tile 30)
		width: 200,
		height: 200,
		enemyId: 5, // Wolf from EnemiesSeedConfig
		count: 2,
	},
	{
		id: 'east_wolves_2',
		x: 1100, // Further east (tile 69)
		y: 640, // Middle (tile 40)
		width: 160,
		height: 160,
		enemyId: 5, // Wolf
		count: 2,
	},
	{
		id: 'shadow_scout_patrol',
		x: 640, // Center (tile 40)
		y: 640, // Center (tile 40)
		width: 640, // Covers large area
		height: 480,
		enemyId: 6, // Shadow Scout (elite)
		count: 1,
	},
];
