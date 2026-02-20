/**
 * @fileoverview Volcanic Dungeons biome scene for Neverquest
 *
 * This scene provides the fire-filled underground dungeon experience:
 * - Procedurally generated volcanic cavern layout
 * - Lava hazards (instant death on contact)
 * - Heat zones (gradual damage over time)
 * - Fire enemies: Fire Imp, Lava Golem, Fire Drake, Magma Worm
 * - Boss encounter: Fire Dragon
 * - Dynamic lava lighting and ember particles
 * - Fog of war exploration
 *
 * Level range: 20-25
 * Access: From CrossroadsScene (requires Ice Caverns completion)
 *
 * @see NeverquestDungeonGenerator - Procedural layout
 * @see NeverquestFogWarManager - Fog of war
 * @see NeverquestLightingManager - Lava glow lighting
 * @see IceCavernsScene - Prerequisite biome
 *
 * @module scenes/VolcanicDungeonsScene
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
	CombatNumbers,
	VolcanicPhysics,
	VolcanicDungeonsValues,
} from '../consts/Numbers';
import { GameMessages } from '../consts/Messages';
import { HUDScene } from './HUDScene';

/**
 * Heat zone configuration for damage areas
 */
interface HeatZone {
	x: number;
	y: number;
	width: number;
	height: number;
	zone: Phaser.GameObjects.Zone;
}

/**
 * VolcanicDungeonsScene - Fire-filled underground dungeon
 *
 * A challenging biome featuring:
 * - Lava pools (instant death)
 * - Heat damage zones
 * - Fire-themed enemies with burn effects
 * - Fire Dragon boss encounter
 * - Dynamic lava glow lighting
 */
export class VolcanicDungeonsScene extends Phaser.Scene {
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

	/** Heat damage zones for environmental damage */
	heatZones: HeatZone[] = [];

	/** Heat damage timer */
	heatDamageTimer: Phaser.Time.TimerEvent | null = null;

	/** Whether player is in heat zone */
	isInHeatZone: boolean = false;

	/** Ember particle emitter for ambient effect */
	emberEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;

	/** Smoke particle emitter */
	smokeEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;

	constructor() {
		super({
			key: 'VolcanicDungeonsScene',
		});
		this.enemies = [];
		this.spellWheelOpen = false;
		this.heatZones = [];
		this.isInHeatZone = false;
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
	 * Creates the Volcanic Dungeons Scene
	 */
	create(): void {
		// Generate the dungeon layout
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

		// Initialize heat zones
		this.initializeHeatZones();

		// Spawn fire enemies
		this.spawnFireEnemies();

		// Physics collision with enemies
		this.physics.add.collider(this.player.container, this.enemies);

		// Audio setup - fiery atmosphere
		this.sound.volume = AudioValues.VOLUME_DUNGEON;
		this.themeSong = this.sound.add('dark_theme', {
			loop: true,
			detune: AudioValues.DETUNE_DARK, // Deep, ominous sound for volcano
		});
		this.themeSong.play();

		this.ambientSound = this.sound.add('dungeon_ambient', {
			volume: 0.6,
			loop: true,
		});
		this.ambientSound.play();

		// Fog of war
		this.fog = new NeverquestFogWarManager(this, this.dungeon.map, this.player);
		this.fog.createFog();

		// Lava glow lighting
		this.lighting = new NeverquestLightingManager(this, {
			ambientDarkness: VolcanicDungeonsValues.VOLCANIC_AMBIENT_DARKNESS,
			defaultLightRadius: VolcanicDungeonsValues.LAVA_LIGHT_RADIUS,
			enableFlicker: true,
			lightColor: VolcanicDungeonsValues.LAVA_LIGHT_COLOR,
		});
		this.lighting.create();

		// Add lava light sources
		this.addLavaLights();

		// Create ambient ember and smoke particles
		this.createAmbientParticles();

		// Initialize heat damage timer
		this.initializeHeatDamage();

		// Save system
		this.saveManager = new NeverquestSaveManager(this);
		this.saveManager.create();
		this.setupSaveKeybinds();

		// Create exit portal
		this.createExitPortal();

		// Apply warm/red tint to camera for volcanic atmosphere
		this.cameras.main.setBackgroundColor(0x2a1a0a);
	}

	/**
	 * Initialize heat damage zones in random rooms
	 */
	initializeHeatZones(): void {
		const rooms = this.dungeon.dungeon.rooms;

		rooms.forEach((room, index) => {
			// Skip first room (spawn) and last room (boss)
			if (index === 0 || index === rooms.length - 1) return;

			// Random chance for heat zone
			if (Math.random() < VolcanicDungeonsValues.HEAT_ZONE_CHANCE) {
				const zoneX = (room.left + 2) * this.dungeon.tileWidth;
				const zoneY = (room.top + 2) * this.dungeon.tileHeight;
				const zoneWidth = (room.width - 4) * this.dungeon.tileWidth;
				const zoneHeight = (room.height - 4) * this.dungeon.tileHeight;

				const zone = this.add.zone(zoneX + zoneWidth / 2, zoneY + zoneHeight / 2, zoneWidth, zoneHeight);
				this.physics.add.existing(zone);
				(zone.body as Phaser.Physics.Arcade.Body).immovable = true;

				this.heatZones.push({
					x: zoneX,
					y: zoneY,
					width: zoneWidth,
					height: zoneHeight,
					zone: zone,
				});

				// Add visual indicator for heat zone
				const heatVisual = this.add.graphics();
				heatVisual.fillStyle(0xff4500, 0.15);
				heatVisual.fillRect(zoneX, zoneY, zoneWidth, zoneHeight);
				heatVisual.setDepth(Depth.GROUND);

				// Pulse effect
				this.tweens.add({
					targets: heatVisual,
					alpha: 0.25,
					duration: 1000,
					yoyo: true,
					repeat: -1,
					ease: 'Sine.easeInOut',
				});

				// Add heat shimmer particles
				this.add.particles(zoneX + zoneWidth / 2, zoneY + zoneHeight / 2, 'dust', {
					angle: { min: -100, max: -80 },
					frequency: 200,
					speed: { min: 10, max: 30 },
					x: { min: -zoneWidth / 2, max: zoneWidth / 2 },
					y: { min: -zoneHeight / 2, max: zoneHeight / 2 },
					lifespan: 2000,
					scale: { start: Scale.TINY, end: Scale.SMALL },
					alpha: { start: Alpha.MEDIUM, end: Alpha.TRANSPARENT },
					tint: 0xff6600,
				});

				// Add overlap detection
				this.physics.add.overlap(this.player.container, zone, () => {
					this.isInHeatZone = true;
				});
			}
		});

		console.log(`[VolcanicDungeonsScene] Initialized ${this.heatZones.length} heat zones`);
	}

	/**
	 * Initialize heat damage timer
	 */
	initializeHeatDamage(): void {
		this.heatDamageTimer = this.time.addEvent({
			delay: VolcanicPhysics.HEAT_ZONE_TICK_RATE,
			callback: () => {
				if (this.isInHeatZone && this.player && this.player.attributes.health > 0) {
					const damage = VolcanicPhysics.HEAT_ZONE_DAMAGE;
					this.player.attributes.health = Math.max(0, this.player.attributes.health - damage);
					if (this.player.healthBar) {
						this.player.healthBar.decrease(damage);
					}
					if (this.player.neverquestHUDProgressBar) {
						this.player.neverquestHUDProgressBar.updateHealth();
					}
					HUDScene.log(this, GameMessages.HEAT_DAMAGE(damage));
					this.cameras.main.shake(80, 0.005);

					if (this.player.attributes.health <= 0) {
						this.player.canMove = false;
						this.player.canAtack = false;
						HUDScene.log(this, GameMessages.PLAYER_DEFEATED);
						this.time.delayedCall(CombatNumbers.PLAYER_DEATH_DELAY, () => {
							this.scene.launch('GameOverScene', {
								playerLevel: this.player.attributes.level,
								lastScene: this.scene.key,
							});
							this.scene.pause();
						});
					}
				}
				// Reset for next frame
				this.isInHeatZone = false;
			},
			loop: true,
		});
	}

	/**
	 * Spawn fire-themed enemies throughout the dungeon
	 */
	spawnFireEnemies(): void {
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
				// Boss room: Spawn Fire Dragon
				const pos = Phaser.Geom.Rectangle.Random(spriteBounds, new Phaser.Geom.Point());
				const boss = new Enemy(this, pos.x, pos.y, 'ogre', 18); // Fire Dragon ID
				this.enemies.push(boss);

				// Add some minions to boss room
				for (let i = 0; i < 4; i++) {
					const minionPos = Phaser.Geom.Rectangle.Random(spriteBounds, new Phaser.Geom.Point());
					const minion = new Enemy(this, minionPos.x, minionPos.y, 'bat', 14); // Fire Imp
					this.enemies.push(minion);
				}
			} else if (isLargeRoom) {
				// Large room: Mix of enemies
				for (let i = 0; i < VolcanicDungeonsValues.ENEMIES_PER_LARGE_ROOM; i++) {
					const pos = Phaser.Geom.Rectangle.Random(spriteBounds, new Phaser.Geom.Point());
					const enemyType = Math.random();
					let enemyId: number;
					let texture: string;

					if (enemyType < 0.4) {
						enemyId = 14; // Fire Imp
						texture = 'bat';
					} else if (enemyType < 0.6) {
						enemyId = 15; // Lava Golem
						texture = 'ogre';
					} else if (enemyType < 0.85) {
						enemyId = 16; // Fire Drake
						texture = 'bat';
					} else {
						enemyId = 17; // Magma Worm (rare)
						texture = 'ogre';
					}

					const enemy = new Enemy(this, pos.x, pos.y, texture, enemyId);
					this.enemies.push(enemy);
				}
			} else {
				// Small/medium room: Fire Imps and occasional Drake
				const enemyCount =
					roomArea < 60
						? VolcanicDungeonsValues.ENEMIES_PER_SMALL_ROOM
						: VolcanicDungeonsValues.ENEMIES_PER_MEDIUM_ROOM;

				for (let i = 0; i < enemyCount; i++) {
					const pos = Phaser.Geom.Rectangle.Random(spriteBounds, new Phaser.Geom.Point());
					const useImp = Math.random() < 0.7;
					const enemyId = useImp ? 14 : 16; // Fire Imp or Fire Drake
					const texture = useImp ? 'bat' : 'bat';
					const enemy = new Enemy(this, pos.x, pos.y, texture, enemyId);
					this.enemies.push(enemy);
				}
			}
		});

		console.log(`[VolcanicDungeonsScene] Spawned ${this.enemies.length} fire enemies`);
	}

	/**
	 * Add lava light sources throughout the dungeon
	 */
	addLavaLights(): void {
		const rooms = this.dungeon.dungeon.rooms;

		rooms.forEach((room) => {
			// Add 2-4 lava lights per room
			const numLights = Math.floor(Math.random() * 3) + 2;

			for (let i = 0; i < numLights; i++) {
				// Place lights around edges (simulating lava pools)
				const side = Math.floor(Math.random() * 4);
				let tileX: number, tileY: number;

				switch (side) {
					case 0: // Top
						tileX = room.left + 2 + Math.floor(Math.random() * (room.width - 4));
						tileY = room.top + 1;
						break;
					case 1: // Right
						tileX = room.right - 1;
						tileY = room.top + 2 + Math.floor(Math.random() * (room.height - 4));
						break;
					case 2: // Bottom
						tileX = room.left + 2 + Math.floor(Math.random() * (room.width - 4));
						tileY = room.bottom - 1;
						break;
					default: // Left
						tileX = room.left + 1;
						tileY = room.top + 2 + Math.floor(Math.random() * (room.height - 4));
						break;
				}

				const worldX = tileX * this.dungeon.tileWidth + this.dungeon.tileWidth / 2;
				const worldY = tileY * this.dungeon.tileHeight + this.dungeon.tileHeight / 2;

				// Randomize light color (orange to red range)
				const colorVariation = Math.random();
				const lightColor = colorVariation < 0.5 ? 0xff4500 : 0xff6600;

				this.lighting.addStaticLight(worldX, worldY, VolcanicDungeonsValues.LAVA_LIGHT_RADIUS, {
					color: lightColor,
					intensity: Alpha.ALMOST_OPAQUE,
					flicker: true,
					flickerAmount: 8, // More aggressive flicker for lava
				});
			}
		});

		console.log('[VolcanicDungeonsScene] Added lava lighting');
	}

	/**
	 * Create ambient ember and smoke particle effects
	 */
	createAmbientParticles(): void {
		const mapWidth = this.dungeon.map.widthInPixels;
		const mapHeight = this.dungeon.map.heightInPixels;

		// Create rising ember particles
		this.emberEmitter = this.add.particles(mapWidth / 2, mapHeight, 'dust', {
			angle: { min: -100, max: -80 },
			frequency: VolcanicDungeonsValues.EMBER_PARTICLE_FREQUENCY,
			speedY: { min: -50, max: -100 },
			speedX: { min: -15, max: 15 },
			x: { min: -mapWidth / 2, max: mapWidth / 2 },
			y: { min: 0, max: mapHeight },
			lifespan: 4000,
			scale: { start: Scale.TINY, end: Scale.SMALL },
			alpha: { start: Alpha.HIGH, end: Alpha.TRANSPARENT },
			tint: [0xff4500, 0xff6600, 0xffaa00], // Orange-yellow embers
		});

		this.emberEmitter.setDepth(Depth.PARTICLES_LOW);

		// Create smoke particles
		this.smokeEmitter = this.add.particles(mapWidth / 2, mapHeight, 'dust', {
			angle: { min: -95, max: -85 },
			frequency: VolcanicDungeonsValues.SMOKE_PARTICLE_FREQUENCY,
			speedY: { min: -20, max: -40 },
			speedX: { min: -10, max: 10 },
			x: { min: -mapWidth / 2, max: mapWidth / 2 },
			y: { min: 0, max: mapHeight },
			lifespan: 6000,
			scale: { start: Scale.SMALL, end: Scale.LARGE },
			alpha: { start: Alpha.MEDIUM, end: Alpha.TRANSPARENT },
			tint: 0x333333, // Dark smoke
		});

		this.smokeEmitter.setDepth(Depth.PARTICLES_LOW);
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

		// Glowing exit effect (orange for fire theme)
		const exitGlow = this.add.graphics();
		exitGlow.fillStyle(0xff6600, Alpha.MEDIUM_LIGHT);
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

		// Fire-themed particles
		const particlesConfig: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig = {
			angle: { min: -100, max: -80 },
			frequency: ParticleValues.FREQUENCY_MODERATE,
			speed: { min: 30, max: 60 },
			x: { min: -12, max: 12 },
			y: { min: -12, max: 12 },
			lifespan: { min: ParticleValues.LIFESPAN_LONG, max: ParticleValues.LIFESPAN_VERY_LONG },
			scale: { start: Scale.LARGE, end: Alpha.LIGHT },
			alpha: { start: Alpha.OPAQUE, end: Alpha.TRANSPARENT },
			tint: 0xff6600, // Orange fire
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
	 * Exit the volcanic dungeons and return to previous scene
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
			if (this.emberEmitter) {
				this.emberEmitter.destroy();
			}
			if (this.smokeEmitter) {
				this.smokeEmitter.destroy();
			}

			// Clean up timers
			if (this.heatDamageTimer) {
				this.heatDamageTimer.destroy();
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
	 * Update loop - handles heat zone detection
	 */
	update(): void {
		// Heat zone detection is handled by physics overlap
		// Additional update logic can be added here
	}
}
