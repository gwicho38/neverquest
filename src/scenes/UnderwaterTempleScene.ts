/**
 * @fileoverview Underwater Temple biome scene for Neverquest
 *
 * This scene provides a submerged ruins exploration experience:
 * - Swimming mechanics with reduced movement speed
 * - Air meter system (drowning hazard)
 * - Water current zones pushing player
 * - Aquatic enemies: Shark, Water Elemental, Electric Eel, Angler Fish
 * - Boss encounter: Leviathan
 * - Limited underwater visibility with bioluminescence
 * - Air bubble checkpoints for refilling air
 *
 * Level range: 25-30
 * Access: Hidden entrance in Town (requires special item)
 *
 * @see NeverquestDungeonGenerator - Procedural layout
 * @see NeverquestFogWarManager - Fog of war
 * @see NeverquestLightingManager - Underwater lighting
 * @see SkyIslandsScene - Prerequisite biome
 *
 * @module scenes/UnderwaterTempleScene
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
	UnderwaterPhysics,
	UnderwaterTempleValues,
} from '../consts/Numbers';
import { GameMessages } from '../consts/Messages';
import { HUDScene } from './HUDScene';

/**
 * Water current zone configuration
 */
interface CurrentZone {
	x: number;
	y: number;
	width: number;
	height: number;
	forceX: number;
	forceY: number;
	zone: Phaser.GameObjects.Zone;
}

/**
 * Air bubble checkpoint configuration
 */
interface AirBubble {
	x: number;
	y: number;
	zone: Phaser.GameObjects.Zone;
	visual: Phaser.GameObjects.Graphics;
}

/**
 * UnderwaterTempleScene - Submerged ruins exploration biome
 *
 * A challenging biome featuring:
 * - Swimming movement mechanics
 * - Air meter and drowning danger
 * - Water current zones
 * - Aquatic enemy encounters
 * - Leviathan boss fight
 * - Dark underwater lighting with bioluminescence
 */
export class UnderwaterTempleScene extends Phaser.Scene {
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
	previousScene: string = 'TownScene';
	spellWheelOpen: boolean = false;

	/** Current water zones for pushing effects */
	currentZones: CurrentZone[] = [];

	/** Air bubble checkpoints */
	airBubbles: AirBubble[] = [];

	/** Current air level (0-100) */
	airMeter: number = 100;

	/** Whether player is in a current zone */
	isInCurrentZone: boolean = false;

	/** Current force applied to player */
	currentForce: { x: number; y: number } = { x: 0, y: 0 };

	/** Whether player is at an air bubble */
	isAtAirBubble: boolean = false;

	/** Bubble particle emitter for ambient effect */
	bubbleEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;

	/** Drowning damage timer */
	drowningTimer: Phaser.Time.TimerEvent | null = null;

	/** Air drain timer */
	airDrainTimer: Phaser.Time.TimerEvent | null = null;

	constructor() {
		super({
			key: 'UnderwaterTempleScene',
		});
		this.enemies = [];
		this.spellWheelOpen = false;
		this.currentZones = [];
		this.airBubbles = [];
		this.isInCurrentZone = false;
		this.isAtAirBubble = false;
		this.airMeter = 100;
	}

	/**
	 * Initialize scene with data from previous scene
	 */
	init(data: { previousScene?: string }): void {
		if (data && data.previousScene) {
			this.previousScene = data.previousScene;
		}
		// Reset air meter on scene start
		this.airMeter = 100;
	}

	/**
	 * Creates the Underwater Temple Scene
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

		// Initialize water current zones
		this.initializeCurrentZones();

		// Initialize air bubble checkpoints
		this.initializeAirBubbles();

		// Spawn aquatic enemies
		this.spawnAquaticEnemies();

		// Physics collision with enemies
		this.physics.add.collider(this.player.container, this.enemies);

		// Audio setup - underwater ambience
		this.sound.volume = AudioValues.VOLUME_DUNGEON;
		this.themeSong = this.sound.add('dark_theme', {
			loop: true,
			detune: -300, // Muffled underwater sound
		});
		this.themeSong.play();

		this.ambientSound = this.sound.add('dungeon_ambient', {
			volume: 0.3, // Quieter underwater
			loop: true,
		});
		this.ambientSound.play();

		// Fog of war (darker for underwater)
		this.fog = new NeverquestFogWarManager(this, this.dungeon.map, this.player);
		this.fog.createFog();

		// Underwater lighting
		this.lighting = new NeverquestLightingManager(this, {
			ambientDarkness: UnderwaterTempleValues.UNDERWATER_AMBIENT_DARKNESS,
			defaultLightRadius: UnderwaterTempleValues.UNDERWATER_LIGHT_RADIUS,
			enableFlicker: true,
			lightColor: UnderwaterTempleValues.UNDERWATER_LIGHT_COLOR,
		});
		this.lighting.create();

		// Add bioluminescent light sources
		this.addUnderwaterLights();

		// Create ambient bubble particles
		this.createAmbientParticles();

		// Initialize air drain timer
		this.initializeAirSystem();

		// Save system
		this.saveManager = new NeverquestSaveManager(this);
		this.saveManager.create();
		this.setupSaveKeybinds();

		// Create exit portal
		this.createExitPortal();

		// Apply deep blue underwater background color
		this.cameras.main.setBackgroundColor(0x0a2a4a);
	}

	/**
	 * Initialize water current zones in corridors
	 */
	initializeCurrentZones(): void {
		const rooms = this.dungeon.dungeon.rooms;

		for (let i = 0; i < rooms.length - 1; i++) {
			if (Math.random() >= UnderwaterTempleValues.CURRENT_ZONE_CHANCE) continue;

			const room1 = rooms[i];
			const room2 = rooms[i + 1];

			// Calculate midpoint between rooms (corridor)
			const midX = ((room1.centerX + room2.centerX) / 2) * this.dungeon.tileWidth;
			const midY = ((room1.centerY + room2.centerY) / 2) * this.dungeon.tileHeight;

			const zoneWidth = 4 * this.dungeon.tileWidth;
			const zoneHeight = 4 * this.dungeon.tileHeight;

			const zone = this.add.zone(midX, midY, zoneWidth, zoneHeight);
			this.physics.add.existing(zone);
			(zone.body as Phaser.Physics.Arcade.Body).immovable = true;

			// Determine current direction (generally pushing towards deeper areas)
			const isWhirlpool = Math.random() < UnderwaterTempleValues.WHIRLPOOL_CHANCE;
			let forceX: number, forceY: number;

			if (isWhirlpool) {
				// Whirlpool pulls towards center
				forceX = 0;
				forceY = UnderwaterPhysics.CURRENT_FORCE_WHIRLPOOL;
			} else {
				// Regular current in random direction
				const angle = Math.random() * Math.PI * 2;
				const strength = UnderwaterPhysics.CURRENT_FORCE_MEDIUM;
				forceX = Math.cos(angle) * strength;
				forceY = Math.sin(angle) * strength;
			}

			this.currentZones.push({
				x: midX - zoneWidth / 2,
				y: midY - zoneHeight / 2,
				width: zoneWidth,
				height: zoneHeight,
				forceX,
				forceY,
				zone,
			});

			// Add visual indicator for current
			const currentVisual = this.add.graphics();
			currentVisual.fillStyle(isWhirlpool ? 0x0066aa : 0x0099cc, 0.15);
			currentVisual.fillRect(midX - zoneWidth / 2, midY - zoneHeight / 2, zoneWidth, zoneHeight);
			currentVisual.setDepth(Depth.GROUND);

			// Add current particles
			this.add.particles(midX, midY, 'dust', {
				angle: {
					min: (Math.atan2(forceY, forceX) * 180) / Math.PI - 20,
					max: (Math.atan2(forceY, forceX) * 180) / Math.PI + 20,
				},
				frequency: 80,
				speed: { min: 30, max: 60 },
				x: { min: -zoneWidth / 2, max: zoneWidth / 2 },
				y: { min: -zoneHeight / 2, max: zoneHeight / 2 },
				lifespan: 2000,
				scale: { start: Scale.TINY, end: Scale.SMALL },
				alpha: { start: Alpha.MEDIUM, end: Alpha.TRANSPARENT },
				tint: 0x66ccff,
			});

			// Add overlap detection
			this.physics.add.overlap(this.player.container, zone, () => {
				this.isInCurrentZone = true;
				this.currentForce = { x: forceX, y: forceY };
			});
		}

		console.log(`[UnderwaterTempleScene] Initialized ${this.currentZones.length} current zones`);
	}

	/**
	 * Initialize air bubble checkpoints throughout the temple
	 */
	initializeAirBubbles(): void {
		const rooms = this.dungeon.dungeon.rooms;

		rooms.forEach((room, index) => {
			// Place air bubbles based on spawn chance
			if (Math.random() >= UnderwaterTempleValues.AIR_BUBBLE_SPAWN_CHANCE) return;

			// Don't place in first room (spawn) - that's the exit
			if (index === 0) return;

			const bubbleX = (room.left + room.width / 2) * this.dungeon.tileWidth;
			const bubbleY = (room.top + room.height / 2) * this.dungeon.tileHeight;

			const zone = this.add.zone(
				bubbleX,
				bubbleY,
				UnderwaterPhysics.AIR_BUBBLE_RADIUS * 2,
				UnderwaterPhysics.AIR_BUBBLE_RADIUS * 2
			);
			this.physics.add.existing(zone);
			(zone.body as Phaser.Physics.Arcade.Body).immovable = true;

			// Visual for air bubble
			const visual = this.add.graphics();
			visual.fillStyle(UnderwaterTempleValues.BIOLUMINESCENCE_COLOR, 0.3);
			visual.fillCircle(bubbleX, bubbleY, UnderwaterPhysics.AIR_BUBBLE_RADIUS);
			visual.setDepth(Depth.GROUND);

			// Pulse effect
			this.tweens.add({
				targets: visual,
				alpha: 0.15,
				scale: 1.2,
				duration: 1500,
				yoyo: true,
				repeat: -1,
				ease: 'Sine.easeInOut',
			});

			// Rising bubble particles
			this.add.particles(bubbleX, bubbleY, 'dust', {
				angle: { min: -100, max: -80 },
				frequency: 300,
				speed: { min: 20, max: 40 },
				x: { min: -20, max: 20 },
				y: { min: 0, max: 10 },
				lifespan: 3000,
				scale: { start: Scale.TINY, end: Scale.SMALL },
				alpha: { start: Alpha.HIGH, end: Alpha.TRANSPARENT },
				tint: 0xffffff,
			});

			this.airBubbles.push({
				x: bubbleX,
				y: bubbleY,
				zone,
				visual,
			});

			// Add overlap detection
			this.physics.add.overlap(this.player.container, zone, () => {
				this.isAtAirBubble = true;
			});

			// Add bioluminescent light
			this.lighting.addStaticLight(bubbleX, bubbleY, UnderwaterTempleValues.UNDERWATER_LIGHT_RADIUS * 1.5, {
				color: UnderwaterTempleValues.BIOLUMINESCENCE_COLOR,
				intensity: Alpha.VERY_HIGH,
				flicker: true,
				flickerAmount: 3,
			});
		});

		console.log(`[UnderwaterTempleScene] Initialized ${this.airBubbles.length} air bubbles`);
	}

	/**
	 * Initialize air meter and drowning systems
	 */
	initializeAirSystem(): void {
		// Air drain timer (runs constantly)
		this.airDrainTimer = this.time.addEvent({
			delay: 1000, // Every second
			callback: () => {
				if (!this.isAtAirBubble && this.airMeter > 0) {
					this.airMeter -= UnderwaterPhysics.AIR_DRAIN_RATE;
					if (this.airMeter < 0) this.airMeter = 0;

					// Warning effect when low on air
					if (this.airMeter <= UnderwaterPhysics.AIR_DANGER_THRESHOLD && this.airMeter > 0) {
						this.cameras.main.flash(100, 200, 200, 255, false);
					}
				} else if (this.isAtAirBubble && this.airMeter < UnderwaterPhysics.MAX_AIR) {
					// Refill air at bubble
					this.airMeter += UnderwaterPhysics.AIR_BUBBLE_REFILL_RATE;
					if (this.airMeter > UnderwaterPhysics.MAX_AIR) {
						this.airMeter = UnderwaterPhysics.MAX_AIR;
					}
				}

				console.log(`[UnderwaterTempleScene] Air: ${this.airMeter.toFixed(0)}%`);
			},
			loop: true,
		});

		// Drowning damage timer
		this.drowningTimer = this.time.addEvent({
			delay: UnderwaterPhysics.DROWNING_TICK_RATE,
			callback: () => {
				if (this.airMeter <= 0 && this.player && this.player.attributes.health > 0) {
					const damage = UnderwaterPhysics.DROWNING_DAMAGE;
					this.player.attributes.health = Math.max(0, this.player.attributes.health - damage);
					if (this.player.healthBar) {
						this.player.healthBar.decrease(damage);
					}
					if (this.player.neverquestHUDProgressBar) {
						this.player.neverquestHUDProgressBar.updateHealth();
					}
					HUDScene.log(this, GameMessages.DROWNING_DAMAGE(damage));
					this.cameras.main.shake(100, 0.01);

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
			},
			loop: true,
		});
	}

	/**
	 * Spawn aquatic enemies throughout the temple
	 */
	spawnAquaticEnemies(): void {
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
				// Boss room: Spawn Leviathan
				const pos = Phaser.Geom.Rectangle.Random(spriteBounds, new Phaser.Geom.Point());
				const boss = new Enemy(this, pos.x, pos.y, 'ogre', 28); // Leviathan ID
				this.enemies.push(boss);

				// Add shark minions to boss room
				for (let i = 0; i < 3; i++) {
					const minionPos = Phaser.Geom.Rectangle.Random(spriteBounds, new Phaser.Geom.Point());
					const minion = new Enemy(this, minionPos.x, minionPos.y, 'bat', 24); // Shark
					this.enemies.push(minion);
				}
			} else if (isLargeRoom) {
				// Large room: Mix of aquatic enemies
				for (let i = 0; i < UnderwaterTempleValues.ENEMIES_PER_LARGE_ROOM; i++) {
					const pos = Phaser.Geom.Rectangle.Random(spriteBounds, new Phaser.Geom.Point());
					const enemyType = Math.random();
					let enemyId: number;
					let texture: string;

					if (enemyType < 0.35) {
						enemyId = 24; // Shark
						texture = 'bat';
					} else if (enemyType < 0.55) {
						enemyId = 25; // Water Elemental
						texture = 'ogre';
					} else if (enemyType < 0.8) {
						enemyId = 26; // Electric Eel
						texture = 'bat';
					} else {
						enemyId = 27; // Angler Fish (rare)
						texture = 'ogre';
					}

					const enemy = new Enemy(this, pos.x, pos.y, texture, enemyId);
					this.enemies.push(enemy);
				}
			} else {
				// Small/medium room: Sharks and Electric Eels
				const enemyCount =
					roomArea < 60
						? UnderwaterTempleValues.ENEMIES_PER_SMALL_ROOM
						: UnderwaterTempleValues.ENEMIES_PER_MEDIUM_ROOM;

				for (let i = 0; i < enemyCount; i++) {
					const pos = Phaser.Geom.Rectangle.Random(spriteBounds, new Phaser.Geom.Point());
					const useShark = Math.random() < 0.6;
					const enemyId = useShark ? 24 : 26; // Shark or Electric Eel
					const texture = 'bat';
					const enemy = new Enemy(this, pos.x, pos.y, texture, enemyId);
					this.enemies.push(enemy);
				}
			}
		});

		console.log(`[UnderwaterTempleScene] Spawned ${this.enemies.length} aquatic enemies`);
	}

	/**
	 * Add bioluminescent light sources throughout the temple
	 */
	addUnderwaterLights(): void {
		const rooms = this.dungeon.dungeon.rooms;

		rooms.forEach((room) => {
			// Add 2-3 bioluminescent lights per room
			const numLights = Math.floor(Math.random() * 2) + 2;

			for (let i = 0; i < numLights; i++) {
				const tileX = room.left + 1 + Math.floor(Math.random() * (room.width - 2));
				const tileY = room.top + 1 + Math.floor(Math.random() * (room.height - 2));

				const worldX = tileX * this.dungeon.tileWidth + this.dungeon.tileWidth / 2;
				const worldY = tileY * this.dungeon.tileHeight + this.dungeon.tileHeight / 2;

				// Vary the color between blue and green-blue
				const colorVariation = Math.random();
				const lightColor =
					colorVariation < 0.6
						? UnderwaterTempleValues.UNDERWATER_LIGHT_COLOR
						: UnderwaterTempleValues.BIOLUMINESCENCE_COLOR;

				this.lighting.addStaticLight(worldX, worldY, UnderwaterTempleValues.UNDERWATER_LIGHT_RADIUS, {
					color: lightColor,
					intensity: Alpha.HIGH,
					flicker: true,
					flickerAmount: 2, // Subtle underwater flicker
				});
			}
		});

		console.log('[UnderwaterTempleScene] Added underwater lighting');
	}

	/**
	 * Create ambient bubble particle effects
	 */
	createAmbientParticles(): void {
		const mapWidth = this.dungeon.map.widthInPixels;
		const mapHeight = this.dungeon.map.heightInPixels;

		// Create rising bubble particles throughout the temple
		this.bubbleEmitter = this.add.particles(mapWidth / 2, mapHeight, 'dust', {
			angle: { min: -100, max: -80 },
			frequency: UnderwaterTempleValues.BUBBLE_PARTICLE_FREQUENCY,
			speedY: { min: -40, max: -80 },
			speedX: { min: -10, max: 10 },
			x: { min: -mapWidth / 2, max: mapWidth / 2 },
			y: { min: 0, max: mapHeight },
			lifespan: 5000,
			scale: { start: Scale.TINY, end: Scale.SMALL },
			alpha: { start: Alpha.MEDIUM, end: Alpha.TRANSPARENT },
			tint: 0xaaddff,
		});

		this.bubbleEmitter.setDepth(Depth.PARTICLES_LOW);
	}

	/**
	 * Create exit portal back to Town
	 */
	createExitPortal(): void {
		const firstRoom = this.dungeon.dungeon.rooms[0];
		const exitTileX = firstRoom.left + 2;
		const exitTileY = firstRoom.top + 2;
		const exitX = (exitTileX + 0.5) * this.dungeon.tileWidth;
		const exitY = (exitTileY + 0.5) * this.dungeon.tileWidth;

		// Place exit indicator
		this.dungeon.stuffLayer!.putTileAt(81, exitTileX, exitTileY);

		// Glowing exit effect (cyan for underwater theme)
		const exitGlow = this.add.graphics();
		exitGlow.fillStyle(0x00aacc, Alpha.MEDIUM_LIGHT);
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

		// Underwater-themed particles
		const particlesConfig: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig = {
			angle: { min: -100, max: -80 },
			frequency: ParticleValues.FREQUENCY_MODERATE,
			speed: { min: 20, max: 40 },
			x: { min: -12, max: 12 },
			y: { min: -12, max: 12 },
			lifespan: { min: ParticleValues.LIFESPAN_LONG, max: ParticleValues.LIFESPAN_VERY_LONG },
			scale: { start: Scale.LARGE, end: Alpha.LIGHT },
			alpha: { start: Alpha.OPAQUE, end: Alpha.TRANSPARENT },
			tint: 0x00ccff,
		};

		this.add.particles(exitX, exitY, 'particle_warp', particlesConfig);

		// Exit label
		const exitLabel = this.add
			.text(exitX, exitY - 45, 'SURFACE', {
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
	 * Exit the underwater temple and return to previous scene
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
			if (this.bubbleEmitter) {
				this.bubbleEmitter.destroy();
			}

			// Clean up timers
			if (this.airDrainTimer) {
				this.airDrainTimer.destroy();
			}
			if (this.drowningTimer) {
				this.drowningTimer.destroy();
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
	 * Update loop - handles current zone effects and air bubble detection
	 */
	update(): void {
		// Apply current force if in current zone
		if (this.isInCurrentZone && this.player && this.player.container.body) {
			const body = this.player.container.body as Phaser.Physics.Arcade.Body;
			body.velocity.x += this.currentForce.x * 0.1;
			body.velocity.y += this.currentForce.y * 0.1;
		}

		// Reset flags for next frame
		this.isInCurrentZone = false;
		this.currentForce = { x: 0, y: 0 };
		this.isAtAirBubble = false;
	}
}
