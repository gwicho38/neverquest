/**
 * @fileoverview Ice Caverns biome scene for Neverquest
 *
 * This scene provides the frozen underground dungeon experience:
 * - Procedurally generated ice cavern layout
 * - Slippery ice tile physics (reduced friction)
 * - Frost enemies: Frost Spider, Ice Elemental, Yeti
 * - Boss encounter: Frost Giant
 * - Environmental hazards: Falling icicles, freezing water, blizzards
 * - Ice crystal lighting effects
 * - Fog of war exploration
 *
 * Level range: 15-20
 * Access: From CrossroadsScene (eastern mountain pass)
 *
 * @see NeverquestDungeonGenerator - Procedural layout
 * @see NeverquestFogWarManager - Fog of war
 * @see NeverquestLightingManager - Ice crystal lighting
 * @see CrossroadsScene - Entry point
 *
 * @module scenes/IceCavernsScene
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
	IcePhysics,
	IceCavernsValues,
} from '../consts/Numbers';
import { GameMessages } from '../consts/Messages';

/**
 * Ice tile type for physics handling
 */
interface IceTile {
	x: number;
	y: number;
	friction: number;
}

/**
 * IceCavernsScene - Frozen underground dungeon
 *
 * A challenging biome featuring:
 * - Slippery ice floor mechanics
 * - Frost-themed enemies with ice damage
 * - Environmental hazards (icicles, blizzards)
 * - Frost Giant boss encounter
 * - Unique ice crystal lighting
 */
export class IceCavernsScene extends Phaser.Scene {
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

	/** Tracks ice tiles for physics */
	iceTiles: IceTile[] = [];

	/** Current player slide velocity */
	slideVelocity: Phaser.Math.Vector2;

	/** Whether player is currently on ice */
	isOnIce: boolean = false;

	/** Icicle hazard timer */
	icicleTimer: Phaser.Time.TimerEvent | null = null;

	/** Blizzard effect timer */
	blizzardTimer: Phaser.Time.TimerEvent | null = null;

	/** Blizzard particle emitter */
	blizzardEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;

	/** Snow particle emitter for ambient effect */
	snowEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;

	constructor() {
		super({
			key: 'IceCavernsScene',
		});
		this.enemies = [];
		this.spellWheelOpen = false;
		this.slideVelocity = new Phaser.Math.Vector2(0, 0);
		this.iceTiles = [];
		this.isOnIce = false;
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
	 * Creates the Ice Caverns Scene
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

		// Initialize ice tiles for physics
		this.initializeIceTiles();

		// Spawn frost enemies
		this.spawnFrostEnemies();

		// Physics collision with enemies
		this.physics.add.collider(this.player.container, this.enemies);

		// Audio setup - icy atmosphere
		this.sound.volume = AudioValues.VOLUME_DUNGEON;
		this.themeSong = this.sound.add('dark_theme', {
			loop: true,
			detune: AudioValues.DETUNE_CREEPY, // Eerie detuned sound for ice caves
		});
		this.themeSong.play();

		this.ambientSound = this.sound.add('dungeon_ambient', {
			volume: 0.5,
			loop: true,
		});
		this.ambientSound.play();

		// Fog of war
		this.fog = new NeverquestFogWarManager(this, this.dungeon.map, this.player);
		this.fog.createFog();

		// Ice crystal lighting
		this.lighting = new NeverquestLightingManager(this, {
			ambientDarkness: IceCavernsValues.CAVERN_AMBIENT_DARKNESS,
			defaultLightRadius: IceCavernsValues.ICE_CRYSTAL_LIGHT_RADIUS,
			enableFlicker: true,
			lightColor: IceCavernsValues.ICE_CRYSTAL_LIGHT_COLOR,
		});
		this.lighting.create();

		// Add ice crystal lights
		this.addIceCrystalLights();

		// Create ambient snow particles
		this.createSnowParticles();

		// Initialize hazard timers
		this.initializeHazards();

		// Save system
		this.saveManager = new NeverquestSaveManager(this);
		this.saveManager.create();
		this.setupSaveKeybinds();

		// Create exit portal
		this.createExitPortal();

		// Apply blue tint to camera for icy atmosphere
		this.cameras.main.setBackgroundColor(0x1a3a4a);
	}

	/**
	 * Initialize ice tile tracking for physics
	 */
	initializeIceTiles(): void {
		// Mark all floor tiles as ice tiles with reduced friction
		const rooms = this.dungeon.dungeon.rooms;

		rooms.forEach((room) => {
			for (let x = room.left + 1; x < room.right; x++) {
				for (let y = room.top + 1; y < room.bottom; y++) {
					this.iceTiles.push({
						x: x * this.dungeon.tileWidth,
						y: y * this.dungeon.tileHeight,
						friction: IcePhysics.ICE_FRICTION,
					});
				}
			}
		});

		console.log(`[IceCavernsScene] Initialized ${this.iceTiles.length} ice tiles`);
	}

	/**
	 * Spawn frost-themed enemies throughout the dungeon
	 */
	spawnFrostEnemies(): void {
		this.enemies = [];
		const rooms = this.dungeon.dungeon.rooms;

		rooms.forEach((room, index) => {
			const roomArea = room.width * room.height;
			const isLargeRoom = roomArea > 80;
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
				// Boss room: Spawn Frost Giant
				const pos = Phaser.Geom.Rectangle.Random(spriteBounds, new Phaser.Geom.Point());
				const boss = new Enemy(this, pos.x, pos.y, 'ogre', 13); // Frost Giant ID
				this.enemies.push(boss);

				// Add some minions to boss room
				for (let i = 0; i < 3; i++) {
					const minionPos = Phaser.Geom.Rectangle.Random(spriteBounds, new Phaser.Geom.Point());
					const minion = new Enemy(this, minionPos.x, minionPos.y, 'bat', 10); // Frost Spider
					this.enemies.push(minion);
				}
			} else if (isLargeRoom) {
				// Large room: Mix of enemies
				for (let i = 0; i < IceCavernsValues.ENEMIES_PER_LARGE_ROOM; i++) {
					const pos = Phaser.Geom.Rectangle.Random(spriteBounds, new Phaser.Geom.Point());
					const enemyType = Math.random();
					let enemyId: number;
					let texture: string;

					if (enemyType < 0.5) {
						enemyId = 10; // Frost Spider
						texture = 'bat';
					} else if (enemyType < 0.8) {
						enemyId = 11; // Ice Elemental
						texture = 'ogre';
					} else {
						enemyId = 12; // Yeti (rare)
						texture = 'ogre';
					}

					const enemy = new Enemy(this, pos.x, pos.y, texture, enemyId);
					this.enemies.push(enemy);
				}
			} else {
				// Small/medium room: Frost Spiders
				const enemyCount =
					roomArea < 50 ? IceCavernsValues.ENEMIES_PER_SMALL_ROOM : IceCavernsValues.ENEMIES_PER_MEDIUM_ROOM;

				for (let i = 0; i < enemyCount; i++) {
					const pos = Phaser.Geom.Rectangle.Random(spriteBounds, new Phaser.Geom.Point());
					const enemy = new Enemy(this, pos.x, pos.y, 'bat', 10); // Frost Spider
					this.enemies.push(enemy);
				}
			}
		});

		console.log(`[IceCavernsScene] Spawned ${this.enemies.length} frost enemies`);
	}

	/**
	 * Add ice crystal light sources throughout the dungeon
	 */
	addIceCrystalLights(): void {
		const rooms = this.dungeon.dungeon.rooms;

		rooms.forEach((room) => {
			// Add 1-3 ice crystal lights per room
			const numLights = Math.floor(Math.random() * 3) + 1;

			for (let i = 0; i < numLights; i++) {
				// Place lights on walls
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

				// Randomize light color slightly (blue to cyan range)
				const colorVariation = Math.random() * 0.2;
				const lightColor = Phaser.Display.Color.GetColor(
					135 + Math.floor(colorVariation * 50),
					206 + Math.floor(colorVariation * 30),
					235
				);

				this.lighting.addStaticLight(worldX, worldY, IceCavernsValues.ICE_CRYSTAL_LIGHT_RADIUS, {
					color: lightColor,
					intensity: Alpha.ALMOST_OPAQUE,
					flicker: true,
					flickerAmount: 2, // Subtle flicker for ice crystals
				});
			}
		});

		console.log('[IceCavernsScene] Added ice crystal lighting');
	}

	/**
	 * Create ambient snow/ice particle effects
	 */
	createSnowParticles(): void {
		const mapWidth = this.dungeon.map.widthInPixels;
		const mapHeight = this.dungeon.map.heightInPixels;

		// Create gentle falling snow/ice particles
		this.snowEmitter = this.add.particles(mapWidth / 2, 0, 'dust', {
			angle: { min: 85, max: 95 },
			frequency: 80,
			speedY: { min: 20, max: 50 },
			speedX: { min: -10, max: 10 },
			x: { min: -mapWidth / 2, max: mapWidth / 2 },
			y: { min: 0, max: mapHeight },
			lifespan: 6000,
			scale: { start: Scale.TINY, end: Scale.SMALL },
			alpha: { start: Alpha.HIGH, end: Alpha.TRANSPARENT },
			tint: 0xffffff, // White snow
		});

		this.snowEmitter.setDepth(Depth.PARTICLES_LOW);
	}

	/**
	 * Initialize environmental hazards
	 */
	initializeHazards(): void {
		// Icicle drop timer (disabled for initial implementation)
		// this.icicleTimer = this.time.addEvent({
		//     delay: IceCavernsValues.ICICLE_SPAWN_INTERVAL,
		//     callback: this.dropIcicle,
		//     callbackScope: this,
		//     loop: true,
		// });
		// Blizzard event timer (disabled for initial implementation)
		// this.blizzardTimer = this.time.addEvent({
		//     delay: IceCavernsValues.BLIZZARD_INTERVAL,
		//     callback: this.triggerBlizzard,
		//     callbackScope: this,
		//     loop: true,
		// });
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

		// Glowing exit effect (blue for ice theme)
		const exitGlow = this.add.graphics();
		exitGlow.fillStyle(0x87ceeb, Alpha.MEDIUM_LIGHT);
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

		// Ice-themed particles
		const particlesConfig: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig = {
			angle: { min: -100, max: -80 },
			frequency: ParticleValues.FREQUENCY_MODERATE,
			speed: { min: 30, max: 60 },
			x: { min: -12, max: 12 },
			y: { min: -12, max: 12 },
			lifespan: { min: ParticleValues.LIFESPAN_LONG, max: ParticleValues.LIFESPAN_VERY_LONG },
			scale: { start: Scale.LARGE, end: Alpha.LIGHT },
			alpha: { start: Alpha.OPAQUE, end: Alpha.TRANSPARENT },
			tint: 0x87ceeb, // Ice blue
		};

		this.add.particles(exitX, exitY, 'particle_warp', particlesConfig);

		// Exit label
		const exitLabel = this.add
			.text(exitX, exitY - 45, 'EXIT', {
				fontSize: '24px',
				color: HexColors.BLUE_LIGHT,
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
	 * Exit the ice caverns and return to previous scene
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
			if (this.snowEmitter) {
				this.snowEmitter.destroy();
			}
			if (this.blizzardEmitter) {
				this.blizzardEmitter.destroy();
			}

			// Clean up timers
			if (this.icicleTimer) {
				this.icicleTimer.destroy();
			}
			if (this.blizzardTimer) {
				this.blizzardTimer.destroy();
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
	 * Check if player is on an ice tile and apply sliding physics
	 */
	checkIcePhysics(): void {
		if (!this.player || !this.player.container) return;

		const playerX = this.player.container.x;
		const playerY = this.player.container.y;
		const tileX = Math.floor(playerX / this.dungeon.tileWidth);
		const tileY = Math.floor(playerY / this.dungeon.tileHeight);

		// Check if current tile is ice
		const onIceTile = this.iceTiles.some((tile) => {
			const tileTileX = Math.floor(tile.x / this.dungeon.tileWidth);
			const tileTileY = Math.floor(tile.y / this.dungeon.tileHeight);
			return tileTileX === tileX && tileTileY === tileY;
		});

		if (onIceTile && !this.isOnIce) {
			this.isOnIce = true;
			// Capture current velocity when stepping on ice
			const body = this.player.container.body as Phaser.Physics.Arcade.Body;
			if (body) {
				this.slideVelocity.set(body.velocity.x, body.velocity.y);
			}
		} else if (!onIceTile && this.isOnIce) {
			this.isOnIce = false;
			this.slideVelocity.set(0, 0);
		}

		// Apply sliding physics when on ice
		if (this.isOnIce) {
			const body = this.player.container.body as Phaser.Physics.Arcade.Body;
			if (body) {
				// Blend current input with slide momentum
				const inputVelocity = new Phaser.Math.Vector2(body.velocity.x, body.velocity.y);

				// Gradually apply slide velocity
				this.slideVelocity.x =
					this.slideVelocity.x * IcePhysics.SLIDE_DECELERATION + inputVelocity.x * IcePhysics.ICE_FRICTION;
				this.slideVelocity.y =
					this.slideVelocity.y * IcePhysics.SLIDE_DECELERATION + inputVelocity.y * IcePhysics.ICE_FRICTION;

				// Clamp velocity
				const speed = this.slideVelocity.length();
				if (speed > IcePhysics.MAX_SLIDE_VELOCITY) {
					this.slideVelocity.normalize().scale(IcePhysics.MAX_SLIDE_VELOCITY);
				} else if (speed < IcePhysics.MIN_SLIDE_VELOCITY) {
					this.slideVelocity.set(0, 0);
				}

				// Apply slide velocity
				body.setVelocity(this.slideVelocity.x, this.slideVelocity.y);
			}
		}
	}

	/**
	 * Update loop - handles ice physics
	 */
	update(): void {
		this.checkIcePhysics();
	}
}
