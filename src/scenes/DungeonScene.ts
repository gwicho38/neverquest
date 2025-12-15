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
import { NumericColors, HexColors } from '../consts/Colors';
import {
	Dimensions,
	AnimationTiming,
	Alpha,
	CameraValues,
	Depth,
	AudioValues,
	Scale,
	ParticleValues,
} from '../consts/Numbers';
import { GameMessages } from '../consts/Messages';

export class DungeonScene extends Phaser.Scene {
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
	previousScene: string = 'MainScene'; // Track which scene to return to
	spellWheelOpen: boolean = false;

	constructor() {
		super({
			key: 'DungeonScene',
		});
		this.enemies = [];
		this.spellWheelOpen = false;
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
	 * Creates the Dungeon Scene
	 */
	create(): void {
		this.dungeon = new NeverquestDungeonGenerator(this);
		this.dungeon.create();

		// Initialize pathfinding system
		this.pathfinding = new NeverquestPathfinding(this, this.dungeon.map, this.dungeon.groundLayer, {
			walkableTiles: [0], // Tile index 0 is walkable (floor)
			allowDiagonal: true,
			dontCrossCorners: true,
		});

		// Initialize line-of-sight system
		this.lineOfSight = new NeverquestLineOfSight(this, this.dungeon.map, this.dungeon.groundLayer);

		this.player = new Player(
			this,
			this.dungeon.map.widthInPixels / 2,
			this.dungeon.map.heightInPixels / 2,
			PlayerConfig.texture,
			this.dungeon.map
		);

		this.cameras.main.startFollow(this.player.container);
		this.cameras.main.setZoom(CameraValues.ZOOM_CLOSE);

		// Set camera bounds to match the map size so camera doesn't go beyond the map edges
		this.cameras.main.setBounds(0, 0, this.dungeon.map.widthInPixels, this.dungeon.map.heightInPixels);

		this.physics.add.collider(this.player.container, this.dungeon.groundLayer);
		// if (!this.scene.isActive('JoystickScene')) {
		//     this.scene.launch('JoystickScene', {
		//         player: this.player,
		//         map: this.dungeon.map,
		//     });
		// }
		this.scene.launch('DialogScene', {
			player: this.player,
			map: this.dungeon.map,
			scene: this,
		});

		this.scene.launch('HUDScene', { player: this.player, map: this.dungeon.map });
		this.enemies = [];
		this.dungeon.dungeon.rooms.forEach((room) => {
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
			for (let i = 0; i < 5; i++) {
				const pos = Phaser.Geom.Rectangle.Random(spriteBounds, new Phaser.Geom.Point());
				const enemy = new Enemy(this, pos.x, pos.y, 'bat', 2);
				this.enemies.push(enemy);
			}
		});

		this.physics.add.collider(this.player.container, this.enemies);

		this.sound.volume = AudioValues.VOLUME_DUNGEON;

		this.themeSong = this.sound.add('dark_theme', {
			loop: true,
		});
		this.themeSong.play();

		this.ambientSound = this.sound.add('dungeon_ambient', {
			volume: 1,
			loop: true,
		});
		this.ambientSound.play();

		this.fog = new NeverquestFogWarManager(this, this.dungeon.map, this.player);
		this.fog.createFog();

		// Initialize dynamic lighting system for atmospheric dungeons
		this.lighting = new NeverquestLightingManager(this, {
			ambientDarkness: Alpha.ALMOST_OPAQUE, // Reduced from default for better visibility
			defaultLightRadius: Dimensions.LIGHT_RADIUS_SMALL, // Base light radius
			enableFlicker: true,
			lightColor: NumericColors.ORANGE_LIGHT, // Warm orange torch light
		});
		this.lighting.create();

		// Add some static lights to the dungeon (torches on walls)
		this.addDungeonTorches();

		this.saveManager = new NeverquestSaveManager(this);
		this.saveManager.create();
		this.setupSaveKeybinds();

		// Create exit portal in the last room
		this.createExitPortal();
	}

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

		// Spell wheel is now handled by NeverquestKeyboardMouseController (L key hold)
		// Listen for spell wheel close event (needed for controller state management)
		this.events.on('spellwheelclosed', () => {
			this.spellWheelOpen = false;
		});
	}

	createExitPortal(): void {
		// Place exit portal in the first room (starting room) for easy access
		// Players spawn in center, so offset the exit to the side
		const firstRoom = this.dungeon.dungeon.rooms[0];
		const exitTileX = firstRoom.left + 2; // Near the left wall
		const exitTileY = firstRoom.top + 2; // Near the top wall
		const exitX = (exitTileX + 0.5) * this.dungeon.tileWidth;
		const exitY = (exitTileY + 0.5) * this.dungeon.tileWidth;

		// Place stairs tile (tile index 81 from DungeonTiles STAIRS)
		this.dungeon.stuffLayer!.putTileAt(81, exitTileX, exitTileY);

		// Add glowing circle background for better visibility
		const exitGlow = this.add.graphics();
		exitGlow.fillStyle(NumericColors.GREEN_EXIT, Alpha.MEDIUM_LIGHT);
		exitGlow.fillCircle(exitX, exitY, 40);
		exitGlow.setDepth(Depth.GROUND);

		// Pulse the glow
		this.tweens.add({
			targets: exitGlow,
			alpha: Alpha.LOW,
			scale: Scale.SLIGHTLY_LARGE_PULSE,
			duration: 1200,
			yoyo: true,
			repeat: -1,
			ease: 'Sine.easeInOut',
		});

		// Add animated particles around the stairs (green upward particles)
		const particlesConfig: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig = {
			angle: { min: -100, max: -80 }, // Upward angle
			frequency: ParticleValues.FREQUENCY_MODERATE, // More frequent particles
			speed: { min: 30, max: 60 },
			x: { min: -12, max: 12 },
			y: { min: -12, max: 12 },
			lifespan: { min: ParticleValues.LIFESPAN_LONG, max: ParticleValues.LIFESPAN_VERY_LONG },
			scale: { start: Scale.LARGE, end: Alpha.LIGHT }, // Larger starting scale
			alpha: { start: Alpha.OPAQUE, end: Alpha.TRANSPARENT },
			tint: NumericColors.GREEN_EXIT, // Bright green-cyan for exit
		};

		this.add.particles(exitX, exitY, 'particle_warp', particlesConfig);

		// Add arrow indicators pointing up around the stairs
		this.createExitArrows(exitX, exitY);

		// Add audio cue for portal (humming sound)
		const portalSound = this.sound.add('dungeon_ambient', {
			volume: Alpha.LIGHT,
			loop: true,
		});
		portalSound.play();

		// Create a larger interactive zone for easier access
		this.exitPortal = this.add.zone(exitX, exitY, 80, 80); // Increased from 64 to 80
		this.physics.add.existing(this.exitPortal);
		(this.exitPortal.body as Phaser.Physics.Arcade.Body).immovable = true;

		// Add collision with player to exit dungeon
		this.physics.add.overlap(this.player.container, this.exitPortal, () => {
			this.exitDungeon();
		});
	}

	createExitArrows(x: number, y: number): void {
		// Add "EXIT" text label above the stairs (larger and brighter)
		const exitLabel = this.add
			.text(x, y - 45, 'EXIT', {
				fontSize: '24px', // Increased from 16px
				color: HexColors.GREEN_CYAN, // Brighter green
				fontStyle: 'bold',
				stroke: HexColors.BLACK,
				strokeThickness: 4,
			})
			.setOrigin(0.5)
			.setDepth(Depth.PLAYER);

		// Pulse the label more dramatically
		this.tweens.add({
			targets: exitLabel,
			alpha: Alpha.MEDIUM_HIGH,
			scale: Scale.SLIGHTLY_LARGE,
			duration: AnimationTiming.TWEEN_VERY_SLOW,
			yoyo: true,
			repeat: -1,
			ease: 'Sine.easeInOut',
		});

		// Create large arrow indicators using text (↑) positioned around the exit
		const arrowPositions = [
			{ x: x - 40, y: y - 40 }, // Increased spacing
			{ x: x + 40, y: y - 40 },
			{ x: x - 40, y: y + 40 },
			{ x: x + 40, y: y + 40 },
		];

		arrowPositions.forEach((pos, index) => {
			const arrow = this.add
				.text(pos.x, pos.y, '↑', {
					fontSize: '40px', // Increased from 32px
					color: HexColors.GREEN_CYAN, // Brighter green
					fontStyle: 'bold',
					stroke: HexColors.BLACK,
					strokeThickness: 3,
				})
				.setOrigin(0.5)
				.setDepth(Depth.PLAYER);

			// Animate arrows bobbing up and down with staggered timing
			this.tweens.add({
				targets: arrow,
				y: pos.y - 15,
				duration: 800,
				yoyo: true,
				repeat: -1,
				ease: 'Sine.easeInOut',
				delay: index * AnimationTiming.TWEEN_FAST, // Stagger animations
			});

			// Pulse alpha with staggered timing
			this.tweens.add({
				targets: arrow,
				alpha: Alpha.LIGHT,
				duration: 1000,
				yoyo: true,
				repeat: -1,
				ease: 'Sine.easeInOut',
				delay: index * AnimationTiming.TWEEN_FAST,
			});
		});
	}

	exitDungeon(): void {
		// Fade out
		this.cameras.main.fade(CameraValues.FADE_NORMAL);
		this.cameras.main.once('camerafadeoutcomplete', () => {
			// Stop sounds
			if (this.themeSong) {
				this.themeSong.stop();
			}
			if (this.ambientSound) {
				this.ambientSound.stop();
			}

			// Clean up player
			if (this.player) {
				this.player.neverquestMovement = null;
				this.player.destroy();
			}

			// Switch back to previous scene
			this.scene.start(this.previousScene);
		});
	}

	/**
	 * Add static torch lights throughout the dungeon
	 */
	addDungeonTorches(): void {
		// Add torches to random rooms
		const rooms = this.dungeon.dungeon.rooms;

		// Add 1-2 torches to each room
		rooms.forEach((room) => {
			const numTorches = Math.random() > 0.5 ? 2 : 1;

			for (let i = 0; i < numTorches; i++) {
				// Place torch on a wall (not in center)
				const side = Math.floor(Math.random() * 4); // 0=top, 1=right, 2=bottom, 3=left
				let tileX, tileY;

				switch (side) {
					case 0: // Top wall
						tileX = room.left + 2 + Math.floor(Math.random() * (room.width - 4));
						tileY = room.top + 1;
						break;
					case 1: // Right wall
						tileX = room.right - 1;
						tileY = room.top + 2 + Math.floor(Math.random() * (room.height - 4));
						break;
					case 2: // Bottom wall
						tileX = room.left + 2 + Math.floor(Math.random() * (room.width - 4));
						tileY = room.bottom - 1;
						break;
					default: // Left wall
						tileX = room.left + 1;
						tileY = room.top + 2 + Math.floor(Math.random() * (room.height - 4));
						break;
				}

				const worldX = tileX * this.dungeon.tileWidth + this.dungeon.tileWidth / 2;
				const worldY = tileY * this.dungeon.tileHeight + this.dungeon.tileHeight / 2;

				// Add a wall torch light
				this.lighting.addStaticLight(worldX, worldY, Dimensions.LIGHT_RADIUS_MEDIUM, {
					color: NumericColors.ORANGE_TORCH, // Warm orange
					intensity: Alpha.ALMOST_OPAQUE,
					flicker: true,
					flickerAmount: 4,
				});
			}
		});

		console.log('[DungeonScene] Added torches to dungeon rooms');
	}

	update(): void {
		return;
	}
}
