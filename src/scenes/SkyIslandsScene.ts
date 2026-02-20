/**
 * @fileoverview Sky Islands biome scene for Neverquest
 *
 * This scene provides floating platform aerial combat experience:
 * - Procedurally generated floating island layout
 * - Wind current mechanics (push player in directions)
 * - Fall damage and respawn system
 * - Flying enemies: Harpy, Wind Elemental, Thunder Bird, Sky Serpent
 * - Boss encounter: Storm Phoenix
 * - Dynamic cloud lighting and wind particles
 * - Teleportation pads between distant islands
 *
 * Level range: 25-30
 * Access: From CrossroadsScene (requires Volcanic Dungeons completion)
 *
 * @see NeverquestDungeonGenerator - Procedural layout
 * @see NeverquestFogWarManager - Fog of war
 * @see NeverquestLightingManager - Cloud lighting
 * @see VolcanicDungeonsScene - Prerequisite biome
 *
 * @module scenes/SkyIslandsScene
 */

import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { NeverquestDungeonGenerator } from '../plugins/NeverquestDungeonGenerator';
import { NeverquestFogWarManager } from '../plugins/NeverquestFogWarManager';
import { NeverquestSaveManager } from '../plugins/NeverquestSaveManager';
import { NeverquestPathfinding } from '../plugins/NeverquestPathfinding';
import { NeverquestLineOfSight } from '../plugins/NeverquestLineOfSight';
import { NeverquestLightingManager } from '../plugins/NeverquestLightingManager';
import { Enemy } from '../entities/Enemy';
import { PlayerConfig } from '../consts/player/Player';
import { HexColors } from '../consts/Colors';
import {
	AnimationTiming,
	Alpha,
	CameraValues,
	Depth,
	AudioValues,
	Scale,
	ParticleValues,
	SkyPhysics,
	SkyIslandsValues,
} from '../consts/Numbers';
import { GameMessages } from '../consts/Messages';

/**
 * Wind zone configuration for pushing effects
 */
interface WindZone {
	x: number;
	y: number;
	width: number;
	height: number;
	forceX: number;
	forceY: number;
	zone: Phaser.GameObjects.Zone;
}

/**
 * Teleporter pad configuration
 */
interface TeleporterPad {
	x: number;
	y: number;
	targetX: number;
	targetY: number;
	zone: Phaser.GameObjects.Zone;
}

/**
 * SkyIslandsScene - Floating platform aerial biome
 *
 * A challenging biome featuring:
 * - Floating island platforms
 * - Wind current zones
 * - Fall damage and checkpoints
 * - Flying enemy encounters
 * - Storm Phoenix boss fight
 * - Dynamic cloud lighting
 */
export class SkyIslandsScene extends Phaser.Scene {
	dungeon!: NeverquestDungeonGenerator;
	player!: Player;
	enemies: Enemy[];
	themeSong!: Phaser.Sound.BaseSound;
	ambientSound!: Phaser.Sound.BaseSound;
	fog!: NeverquestFogWarManager;
	lighting!: NeverquestLightingManager;
	saveManager!: NeverquestSaveManager;
	pathfinding!: NeverquestPathfinding;
	lineOfSight!: NeverquestLineOfSight;
	exitPortal!: Phaser.GameObjects.Zone;
	previousScene: string = 'CrossroadsScene';
	spellWheelOpen: boolean = false;

	/** Wind zones for directional push effects */
	windZones: WindZone[] = [];

	/** Teleporter pads for fast travel */
	teleporterPads: TeleporterPad[] = [];

	/** Wind force currently applied to player */
	currentWindForce: { x: number; y: number } = { x: 0, y: 0 };

	/** Whether player is in a wind zone */
	isInWindZone: boolean = false;

	/** Wind particle emitter for ambient effect */
	windEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;

	/** Cloud particle emitter */
	cloudEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;

	/** Last checkpoint position for respawn */
	lastCheckpoint: { x: number; y: number } = { x: 0, y: 0 };

	/** Lightning strike timer */
	lightningTimer: Phaser.Time.TimerEvent | null = null;

	constructor() {
		super({
			key: 'SkyIslandsScene',
		});
		this.enemies = [];
		this.spellWheelOpen = false;
		this.windZones = [];
		this.teleporterPads = [];
		this.isInWindZone = false;
	}

	/**
	 * Initialize scene with data from previous scene
	 */
	init(data: { previousScene?: string }): void {
		if (data && data.previousScene) {
			this.previousScene = data.previousScene;
		}
	}

	/**
	 * Creates the Sky Islands Scene
	 */
	create(): void {
		// Generate the dungeon layout (represents floating islands)
		this.dungeon = new NeverquestDungeonGenerator(this);
		this.dungeon.create();

		// Initialize pathfinding system
		this.pathfinding = new NeverquestPathfinding(this, this.dungeon.map, this.dungeon.groundLayer, {
			walkableTiles: [0],
			allowDiagonal: true,
			dontCrossCorners: true,
		});

		// Initialize line-of-sight system
		this.lineOfSight = new NeverquestLineOfSight(this, this.dungeon.map, this.dungeon.groundLayer);

		// Create player at dungeon center
		this.player = new Player(
			this,
			this.dungeon.map.widthInPixels / 2,
			this.dungeon.map.heightInPixels / 2,
			PlayerConfig.texture,
			this.dungeon.map
		);

		// Set initial checkpoint
		this.lastCheckpoint = {
			x: this.dungeon.map.widthInPixels / 2,
			y: this.dungeon.map.heightInPixels / 2,
		};

		// Camera setup
		this.cameras.main.startFollow(this.player.container);
		this.cameras.main.setZoom(CameraValues.ZOOM_CLOSE);
		this.cameras.main.setBounds(0, 0, this.dungeon.map.widthInPixels, this.dungeon.map.heightInPixels);

		// Physics collisions
		this.physics.add.collider(this.player.container, this.dungeon.groundLayer);

		// Launch UI scenes
		this.scene.launch('DialogScene', {
			player: this.player,
			map: this.dungeon.map,
			scene: this,
		});
		this.scene.launch('HUDScene', { player: this.player, map: this.dungeon.map });

		// Initialize wind zones
		this.initializeWindZones();

		// Initialize teleporter pads
		this.initializeTeleporters();

		// Spawn sky enemies
		this.spawnSkyEnemies();

		// Physics collision with enemies
		this.physics.add.collider(this.player.container, this.enemies);

		// Audio setup - airy atmosphere
		this.sound.volume = AudioValues.VOLUME_DUNGEON;
		this.themeSong = this.sound.add('dark_theme', {
			loop: true,
			detune: 200, // Higher pitch for airy feel
		});
		this.themeSong.play();

		this.ambientSound = this.sound.add('dungeon_ambient', {
			volume: 0.4,
			loop: true,
		});
		this.ambientSound.play();

		// Fog of war (lighter for sky theme)
		this.fog = new NeverquestFogWarManager(this, this.dungeon.map, this.player);
		this.fog.createFog();

		// Cloud/sky lighting
		this.lighting = new NeverquestLightingManager(this, {
			ambientDarkness: SkyIslandsValues.SKY_AMBIENT_BRIGHTNESS,
			defaultLightRadius: SkyIslandsValues.CLOUD_LIGHT_RADIUS,
			enableFlicker: false,
			lightColor: SkyIslandsValues.CLOUD_LIGHT_COLOR,
		});
		this.lighting.create();

		// Add cloud light sources
		this.addCloudLights();

		// Create ambient wind and cloud particles
		this.createAmbientParticles();

		// Initialize lightning hazard timer
		this.initializeLightningHazard();

		// Save system
		this.saveManager = new NeverquestSaveManager(this);
		this.saveManager.create();
		this.setupSaveKeybinds();

		// Create exit portal
		this.createExitPortal();

		// Apply bright sky background color
		this.cameras.main.setBackgroundColor(0x87ceeb); // Sky blue
	}

	/**
	 * Initialize wind zones in gaps between islands
	 */
	initializeWindZones(): void {
		const rooms = this.dungeon.dungeon.rooms;

		// Create wind zones between rooms (in corridors/gaps)
		for (let i = 0; i < rooms.length - 1; i++) {
			if (Math.random() >= SkyIslandsValues.WIND_ZONE_CHANCE) continue;

			const room1 = rooms[i];
			const room2 = rooms[i + 1];

			// Calculate midpoint between rooms
			const midX = ((room1.centerX + room2.centerX) / 2) * this.dungeon.tileWidth;
			const midY = ((room1.centerY + room2.centerY) / 2) * this.dungeon.tileHeight;

			const zoneWidth = 3 * this.dungeon.tileWidth;
			const zoneHeight = 3 * this.dungeon.tileHeight;

			const zone = this.add.zone(midX, midY, zoneWidth, zoneHeight);
			this.physics.add.existing(zone);
			(zone.body as Phaser.Physics.Arcade.Body).immovable = true;

			// Random wind direction
			const windAngle = Math.random() * Math.PI * 2;
			const windStrength =
				Math.random() < SkyIslandsValues.TORNADO_ZONE_CHANCE
					? SkyPhysics.WIND_FORCE_TORNADO
					: SkyPhysics.WIND_FORCE_MEDIUM;

			const forceX = Math.cos(windAngle) * windStrength;
			const forceY = Math.sin(windAngle) * windStrength;

			this.windZones.push({
				x: midX - zoneWidth / 2,
				y: midY - zoneHeight / 2,
				width: zoneWidth,
				height: zoneHeight,
				forceX,
				forceY,
				zone,
			});

			// Add visual indicator for wind zone
			const windVisual = this.add.graphics();
			windVisual.fillStyle(0xffffff, 0.1);
			windVisual.fillRect(midX - zoneWidth / 2, midY - zoneHeight / 2, zoneWidth, zoneHeight);
			windVisual.setDepth(Depth.GROUND);

			// Wind direction lines
			this.add
				.line(midX, midY, 0, 0, forceX / 5, forceY / 5, 0xffffff, 0.5)
				.setDepth(Depth.GROUND)
				.setOrigin(0, 0);

			// Add wind particles at zone
			this.add.particles(midX, midY, 'dust', {
				angle: { min: (windAngle * 180) / Math.PI - 15, max: (windAngle * 180) / Math.PI + 15 },
				frequency: 100,
				speed: { min: 50, max: 100 },
				x: { min: -zoneWidth / 2, max: zoneWidth / 2 },
				y: { min: -zoneHeight / 2, max: zoneHeight / 2 },
				lifespan: 1500,
				scale: { start: Scale.TINY, end: Scale.SMALL },
				alpha: { start: Alpha.MEDIUM, end: Alpha.TRANSPARENT },
				tint: 0xffffff,
			});

			// Add overlap detection
			this.physics.add.overlap(this.player.container, zone, () => {
				this.isInWindZone = true;
				this.currentWindForce = { x: forceX, y: forceY };
			});
		}

		console.log(`[SkyIslandsScene] Initialized ${this.windZones.length} wind zones`);
	}

	/**
	 * Initialize teleporter pads for fast travel between distant islands
	 */
	initializeTeleporters(): void {
		const rooms = this.dungeon.dungeon.rooms;

		// Create teleporter pairs
		for (let i = 0; i < SkyIslandsValues.TELEPORTER_COUNT && i < rooms.length - 1; i++) {
			const sourceRoom = rooms[i];
			const targetRoom = rooms[rooms.length - 1 - i];

			const sourceX = (sourceRoom.left + 2) * this.dungeon.tileWidth;
			const sourceY = (sourceRoom.top + 2) * this.dungeon.tileHeight;
			const targetX = (targetRoom.left + 2) * this.dungeon.tileWidth;
			const targetY = (targetRoom.top + 2) * this.dungeon.tileHeight;

			// Create source teleporter
			const sourceZone = this.add.zone(sourceX, sourceY, 32, 32);
			this.physics.add.existing(sourceZone);
			(sourceZone.body as Phaser.Physics.Arcade.Body).immovable = true;

			this.teleporterPads.push({
				x: sourceX,
				y: sourceY,
				targetX,
				targetY,
				zone: sourceZone,
			});

			// Create visual for teleporter
			const teleporterGlow = this.add.graphics();
			teleporterGlow.fillStyle(0x00ffff, 0.4);
			teleporterGlow.fillCircle(sourceX, sourceY, 20);
			teleporterGlow.setDepth(Depth.GROUND);

			this.tweens.add({
				targets: teleporterGlow,
				alpha: 0.2,
				scale: 1.2,
				duration: 1000,
				yoyo: true,
				repeat: -1,
				ease: 'Sine.easeInOut',
			});

			// Add teleporter particles
			this.add.particles(sourceX, sourceY, 'dust', {
				angle: { min: 0, max: 360 },
				frequency: 150,
				speed: { min: 20, max: 40 },
				lifespan: 2000,
				scale: { start: Scale.SMALL, end: Scale.TINY },
				alpha: { start: Alpha.HIGH, end: Alpha.TRANSPARENT },
				tint: 0x00ffff,
			});

			// Add overlap for teleportation
			this.physics.add.overlap(this.player.container, sourceZone, () => {
				this.teleportPlayer(targetX, targetY);
			});
		}

		console.log(`[SkyIslandsScene] Initialized ${this.teleporterPads.length} teleporter pads`);
	}

	/**
	 * Teleport player to target location
	 */
	teleportPlayer(targetX: number, targetY: number): void {
		// Flash effect
		this.cameras.main.flash(200, 0, 255, 255);

		// Move player
		this.player.container.setPosition(targetX, targetY);

		// Update checkpoint
		this.lastCheckpoint = { x: targetX, y: targetY };

		console.log(`[SkyIslandsScene] Player teleported to ${targetX}, ${targetY}`);
	}

	/**
	 * Initialize lightning hazard system
	 */
	initializeLightningHazard(): void {
		this.lightningTimer = this.time.addEvent({
			delay: SkyPhysics.LIGHTNING_STRIKE_INTERVAL,
			callback: () => {
				// Random chance for lightning strike near player
				if (Math.random() < 0.3) {
					this.triggerLightningStrike();
				}
			},
			loop: true,
		});
	}

	/**
	 * Trigger a lightning strike near the player
	 */
	triggerLightningStrike(): void {
		if (!this.player) return;

		// Random offset from player
		const offsetX = (Math.random() - 0.5) * 200;
		const offsetY = (Math.random() - 0.5) * 200;
		const strikeX = this.player.container.x + offsetX;
		const strikeY = this.player.container.y + offsetY;

		// Warning indicator
		const warningCircle = this.add.graphics();
		warningCircle.lineStyle(3, 0xffff00, 0.8);
		warningCircle.strokeCircle(strikeX, strikeY, 30);
		warningCircle.setDepth(Depth.PLAYER);

		// Pulse warning
		this.tweens.add({
			targets: warningCircle,
			alpha: 0.2,
			scale: 1.5,
			duration: SkyPhysics.LIGHTNING_WARNING_TIME / 3,
			repeat: 2,
			onComplete: () => {
				// Lightning strike
				warningCircle.destroy();

				// Flash effect
				this.cameras.main.flash(100, 255, 255, 200);

				// Strike visual
				const lightning = this.add.graphics();
				lightning.lineStyle(4, 0xffff00, 1);
				lightning.lineBetween(strikeX, strikeY - 500, strikeX, strikeY);
				lightning.setDepth(Depth.PARTICLES_HIGH);

				// Fade out lightning
				this.tweens.add({
					targets: lightning,
					alpha: 0,
					duration: 200,
					onComplete: () => lightning.destroy(),
				});

				// Damage check (if player is close)
				const distance = Phaser.Math.Distance.Between(
					this.player.container.x,
					this.player.container.y,
					strikeX,
					strikeY
				);

				if (distance < 40) {
					// TODO: Apply lightning damage when player health system is ready
					console.log('[SkyIslandsScene] Player hit by lightning!');
				}
			},
		});
	}

	/**
	 * Spawn sky-themed flying enemies throughout the islands
	 */
	spawnSkyEnemies(): void {
		this.enemies = [];
		const rooms = this.dungeon.dungeon.rooms;

		rooms.forEach((room, index) => {
			const roomArea = room.width * room.height;
			const isLargeRoom = roomArea > 100;
			const isBossRoom = index === rooms.length - 1 && isLargeRoom;

			const spriteBounds = Phaser.Geom.Rectangle.Inflate(
				new Phaser.Geom.Rectangle(
					(room.x + 1) * this.dungeon.tileWidth,
					(room.y + 1) * this.dungeon.tileWidth,
					(room.width - 3) * this.dungeon.tileWidth,
					(room.height - 3) * this.dungeon.tileWidth
				),
				0,
				0
			);

			if (isBossRoom) {
				// Boss room: Spawn Storm Phoenix
				const pos = Phaser.Geom.Rectangle.Random(spriteBounds, new Phaser.Geom.Point());
				const boss = new Enemy(this, pos.x, pos.y, 'ogre', 23); // Storm Phoenix ID
				this.enemies.push(boss);

				// Add some minions to boss room
				for (let i = 0; i < 3; i++) {
					const minionPos = Phaser.Geom.Rectangle.Random(spriteBounds, new Phaser.Geom.Point());
					const minion = new Enemy(this, minionPos.x, minionPos.y, 'bat', 22); // Thunder Bird
					this.enemies.push(minion);
				}
			} else if (isLargeRoom) {
				// Large room: Mix of sky enemies
				for (let i = 0; i < SkyIslandsValues.ENEMIES_PER_LARGE_ISLAND; i++) {
					const pos = Phaser.Geom.Rectangle.Random(spriteBounds, new Phaser.Geom.Point());
					const enemyType = Math.random();
					let enemyId: number;
					let texture: string;

					if (enemyType < 0.4) {
						enemyId = 19; // Harpy
						texture = 'bat';
					} else if (enemyType < 0.6) {
						enemyId = 20; // Wind Elemental
						texture = 'ogre';
					} else if (enemyType < 0.85) {
						enemyId = 22; // Thunder Bird
						texture = 'bat';
					} else {
						enemyId = 21; // Sky Serpent (rare)
						texture = 'ogre';
					}

					const enemy = new Enemy(this, pos.x, pos.y, texture, enemyId);
					this.enemies.push(enemy);
				}
			} else {
				// Small/medium room: Harpies and occasional Thunder Bird
				const enemyCount =
					roomArea < 60
						? SkyIslandsValues.ENEMIES_PER_SMALL_ISLAND
						: SkyIslandsValues.ENEMIES_PER_MEDIUM_ISLAND;

				for (let i = 0; i < enemyCount; i++) {
					const pos = Phaser.Geom.Rectangle.Random(spriteBounds, new Phaser.Geom.Point());
					const useHarpy = Math.random() < 0.7;
					const enemyId = useHarpy ? 19 : 22; // Harpy or Thunder Bird
					const texture = 'bat';
					const enemy = new Enemy(this, pos.x, pos.y, texture, enemyId);
					this.enemies.push(enemy);
				}
			}
		});

		console.log(`[SkyIslandsScene] Spawned ${this.enemies.length} sky enemies`);
	}

	/**
	 * Add cloud light sources throughout the sky
	 */
	addCloudLights(): void {
		const rooms = this.dungeon.dungeon.rooms;

		rooms.forEach((room) => {
			// Add 2-3 cloud lights per room
			const numLights = Math.floor(Math.random() * 2) + 2;

			for (let i = 0; i < numLights; i++) {
				const tileX = room.left + 1 + Math.floor(Math.random() * (room.width - 2));
				const tileY = room.top + 1 + Math.floor(Math.random() * (room.height - 2));

				const worldX = tileX * this.dungeon.tileWidth + this.dungeon.tileWidth / 2;
				const worldY = tileY * this.dungeon.tileHeight + this.dungeon.tileHeight / 2;

				this.lighting.addStaticLight(worldX, worldY, SkyIslandsValues.CLOUD_LIGHT_RADIUS, {
					color: SkyIslandsValues.CLOUD_LIGHT_COLOR,
					intensity: Alpha.VERY_HIGH,
					flicker: false,
				});
			}
		});

		console.log('[SkyIslandsScene] Added cloud lighting');
	}

	/**
	 * Create ambient wind and cloud particle effects
	 */
	createAmbientParticles(): void {
		const mapWidth = this.dungeon.map.widthInPixels;
		const mapHeight = this.dungeon.map.heightInPixels;

		// Create drifting cloud particles
		this.cloudEmitter = this.add.particles(mapWidth / 2, mapHeight / 2, 'dust', {
			angle: { min: 170, max: 190 }, // Moving left
			frequency: SkyIslandsValues.CLOUD_PARTICLE_FREQUENCY,
			speedX: { min: -30, max: -60 },
			speedY: { min: -5, max: 5 },
			x: { min: -mapWidth / 2, max: mapWidth / 2 },
			y: { min: -mapHeight / 2, max: mapHeight / 2 },
			lifespan: 8000,
			scale: { start: Scale.LARGE, end: Scale.VERY_LARGE },
			alpha: { start: Alpha.LIGHT, end: Alpha.TRANSPARENT },
			tint: 0xffffff,
		});

		this.cloudEmitter.setDepth(Depth.PARTICLES_LOW);

		// Create wind streak particles
		this.windEmitter = this.add.particles(mapWidth / 2, mapHeight / 2, 'dust', {
			angle: { min: 175, max: 185 },
			frequency: SkyIslandsValues.WIND_PARTICLE_FREQUENCY,
			speedX: { min: -100, max: -150 },
			speedY: { min: -10, max: 10 },
			x: { min: -mapWidth / 2, max: mapWidth / 2 },
			y: { min: -mapHeight / 2, max: mapHeight / 2 },
			lifespan: 1500,
			scale: { start: Scale.TINY, end: Scale.SMALL },
			alpha: { start: Alpha.MEDIUM, end: Alpha.TRANSPARENT },
			tint: 0xffffff,
		});

		this.windEmitter.setDepth(Depth.PARTICLES_LOW);
	}

	/**
	 * Create exit portal back to Crossroads
	 */
	createExitPortal(): void {
		const firstRoom = this.dungeon.dungeon.rooms[0];
		const exitTileX = firstRoom.left + 2;
		const exitTileY = firstRoom.top + 2;
		const exitX = (exitTileX + 0.5) * this.dungeon.tileWidth;
		const exitY = (exitTileY + 0.5) * this.dungeon.tileWidth;

		// Place exit indicator
		this.dungeon.stuffLayer!.putTileAt(81, exitTileX, exitTileY);

		// Glowing exit effect (cyan for sky theme)
		const exitGlow = this.add.graphics();
		exitGlow.fillStyle(0x00ffff, Alpha.MEDIUM_LIGHT);
		exitGlow.fillCircle(exitX, exitY, 40);
		exitGlow.setDepth(Depth.GROUND);

		this.tweens.add({
			targets: exitGlow,
			alpha: Alpha.LOW,
			scale: Scale.SLIGHTLY_LARGE_PULSE,
			duration: 1200,
			yoyo: true,
			repeat: -1,
			ease: 'Sine.easeInOut',
		});

		// Cloud-themed particles
		const particlesConfig: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig = {
			angle: { min: 0, max: 360 },
			frequency: ParticleValues.FREQUENCY_MODERATE,
			speed: { min: 20, max: 40 },
			x: { min: -12, max: 12 },
			y: { min: -12, max: 12 },
			lifespan: { min: ParticleValues.LIFESPAN_LONG, max: ParticleValues.LIFESPAN_VERY_LONG },
			scale: { start: Scale.LARGE, end: Alpha.LIGHT },
			alpha: { start: Alpha.OPAQUE, end: Alpha.TRANSPARENT },
			tint: 0x00ffff,
		};

		this.add.particles(exitX, exitY, 'particle_warp', particlesConfig);

		// Exit label
		const exitLabel = this.add
			.text(exitX, exitY - 45, 'EXIT', {
				fontSize: '24px',
				color: HexColors.GREEN_LIGHT,
				fontStyle: 'bold',
				stroke: HexColors.BLACK,
				strokeThickness: 4,
			})
			.setOrigin(0.5)
			.setDepth(Depth.PLAYER);

		this.tweens.add({
			targets: exitLabel,
			alpha: Alpha.MEDIUM_HIGH,
			scale: Scale.SLIGHTLY_LARGE,
			duration: AnimationTiming.TWEEN_VERY_SLOW,
			yoyo: true,
			repeat: -1,
			ease: 'Sine.easeInOut',
		});

		// Create exit zone
		this.exitPortal = this.add.zone(exitX, exitY, 80, 80);
		this.physics.add.existing(this.exitPortal);
		(this.exitPortal.body as Phaser.Physics.Arcade.Body).immovable = true;

		this.physics.add.overlap(this.player.container, this.exitPortal, () => {
			this.exitDungeon();
		});
	}

	/**
	 * Handle keyboard shortcuts for save/load
	 */
	setupSaveKeybinds(): void {
		this.input.keyboard!.on('keydown', (event: KeyboardEvent) => {
			if (event.ctrlKey && event.key === 's') {
				event.preventDefault();
				this.saveManager.saveGame(false);
			}
			if (event.ctrlKey && event.key === 'l') {
				event.preventDefault();
				const saveData = this.saveManager.loadGame(false);
				if (saveData) {
					this.saveManager.applySaveData(saveData);
				}
			}
			if (event.key === 'F5') {
				event.preventDefault();
				const saveData = this.saveManager.loadGame(true);
				if (saveData) {
					this.saveManager.applySaveData(saveData);
				} else {
					this.saveManager.showSaveNotification(GameMessages.NO_CHECKPOINT_FOUND, true);
				}
			}
		});

		this.events.on('spellwheelclosed', () => {
			this.spellWheelOpen = false;
		});
	}

	/**
	 * Exit the sky islands and return to previous scene
	 */
	exitDungeon(): void {
		this.cameras.main.fade(CameraValues.FADE_NORMAL);

		this.cameras.main.once('camerafadeoutcomplete', () => {
			// Stop sounds
			if (this.themeSong) {
				this.themeSong.stop();
			}
			if (this.ambientSound) {
				this.ambientSound.stop();
			}

			// Clean up particles
			if (this.windEmitter) {
				this.windEmitter.destroy();
			}
			if (this.cloudEmitter) {
				this.cloudEmitter.destroy();
			}

			// Clean up timers
			if (this.lightningTimer) {
				this.lightningTimer.destroy();
			}

			// Clean up player
			if (this.player) {
				this.player.neverquestMovement = null;
				this.player.destroy();
			}

			// Return to previous scene
			this.scene.start(this.previousScene);
		});
	}

	/**
	 * Update loop - handles wind zone effects
	 */
	update(): void {
		// Apply wind force if in wind zone
		if (this.isInWindZone && this.player && this.player.container.body) {
			const body = this.player.container.body as Phaser.Physics.Arcade.Body;
			body.velocity.x += this.currentWindForce.x * 0.1;
			body.velocity.y += this.currentWindForce.y * 0.1;
		}

		// Reset wind zone flag for next frame
		this.isInWindZone = false;
		this.currentWindForce = { x: 0, y: 0 };
	}
}
