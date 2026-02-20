/**
 * @fileoverview Crossroads hub scene for Neverquest (Act 2)
 *
 * This scene is the central hub connecting all major regions:
 * - South: Return to Forest (OverworldScene)
 * - West: Ancient Ruins (first Sunstone fragment)
 * - North: Gate to Dark Lands (locked until fragments collected)
 * - East: Mountain pass (Ice Caverns - future expansion)
 * - Center: Trading Post with NPCs
 *
 * Features programmatic NPC spawning and enemy zones.
 * Key story progression point between Act 1 and Act 3.
 *
 * @see NeverquestNPCManager - Spawns Merchant, Knight, Oracle, Guardian
 * @see NeverquestProgrammaticEnemyZones - Spawns bandits, wolves, shadow scout
 * @see NeverquestStoryFlags - Gates Dark Lands access
 *
 * @module scenes/CrossroadsScene
 */

import Phaser from 'phaser';
import { NeverquestWarp } from '../plugins/NeverquestWarp';
import { NeverquestObjectMarker } from '../plugins/NeverquestObjectMarker';
import AnimatedTiles from '../plugins/AnimatedTiles';
import { NeverquestEnvironmentParticles } from '../plugins/NeverquestEnvironmentParticles';
import { NeverquestEnemyZones } from '../plugins/NeverquestEnemyZones';
import { NeverquestMapCreator } from '../plugins/NeverquestMapCreator';
import { NeverquestSaveManager } from '../plugins/NeverquestSaveManager';
import { NeverquestNPCManager, CROSSROADS_NPCS } from '../plugins/NeverquestNPCManager';
import { NeverquestProgrammaticEnemyZones, CROSSROADS_ENEMY_ZONES } from '../plugins/NeverquestProgrammaticEnemyZones';
import { CameraValues, Alpha, ParticleValues, Scale } from '../consts/Numbers';
import { HexColors } from '../consts/Colors';
import { SaveMessages } from '../consts/Messages';
import { Player } from '../entities/Player';

/**
 * CrossroadsScene - Central hub connecting all major regions
 *
 * Story Context:
 * The Crossroads is where all paths converge. From here, players can access:
 * - South: Return to Forest (OverworldScene)
 * - West: Ancient Ruins (first Sunstone fragment)
 * - North: Gate to Dark Lands (locked until all fragments collected)
 * - East: Mountain pass (future expansion - Ice Caverns)
 * - Center: Trading Post with NPCs
 *
 * Key NPCs:
 * - Wandering Merchant (shop functionality)
 * - Fallen Knight Aldric (story progression)
 * - Oracle of the Depths (prophecy/lore)
 * - Gate Guardian (blocks Dark Lands access)
 *
 * Enemies:
 * - Bandits (west path)
 * - Wolves (east/mountain areas)
 * - Shadow Scout (roaming elite, foreshadows Act 3)
 */
export class CrossroadsScene extends Phaser.Scene {
	player: Player | null;
	mapCreator: NeverquestMapCreator | null;
	map: Phaser.Tilemaps.Tilemap | null;
	joystickScene: Phaser.Scene | null;
	particles: NeverquestEnvironmentParticles | null;
	themeSound: Phaser.Sound.BaseSound | null;
	enemies: Phaser.Physics.Arcade.Sprite[];
	neverquestEnemyZones: NeverquestEnemyZones | null;
	programmaticEnemyZones: NeverquestProgrammaticEnemyZones | null;
	saveManager: NeverquestSaveManager | null;
	overworldWarpZone: Phaser.GameObjects.Zone | null;
	iceRegionZone: Phaser.GameObjects.Zone | null;
	npcManager: NeverquestNPCManager | null;
	ambientParticles: Phaser.GameObjects.Particles.ParticleEmitter[];

	constructor() {
		super({
			key: 'CrossroadsScene',
		});
		this.player = null;
		this.mapCreator = null;
		this.map = null;
		this.joystickScene = null;
		this.particles = null;
		this.themeSound = null;
		this.enemies = [];
		this.neverquestEnemyZones = null;
		this.programmaticEnemyZones = null;
		this.saveManager = null;
		this.overworldWarpZone = null;
		this.iceRegionZone = null;
		this.npcManager = null;
		this.ambientParticles = [];
	}

	preload(): void {
		this.load.scenePlugin('animatedTiles', AnimatedTiles, 'animatedTiles', 'animatedTiles');
	}

	create(): void {
		this.cameras.main.setZoom(CameraValues.ZOOM_CLOSE);

		// Load the crossroads map (requires crossroads.json in maps folder)
		this.mapCreator = new NeverquestMapCreator(this, 'crossroads');
		this.mapCreator.create();

		// Store map reference for other systems
		this.map = this.mapCreator.map;

		const camera = this.cameras.main;
		camera.startFollow(this.player!.container);

		// Set camera bounds to match the map size
		camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

		// Set up warp points to other scenes
		const neverquestWarp = new NeverquestWarp(this, this.player!, this.mapCreator.map);
		neverquestWarp.createWarps();

		// Set up interactive object markers (NPCs, signs, etc.)
		const interactiveMarkers = new NeverquestObjectMarker(this, this.mapCreator.map);
		interactiveMarkers.create();

		// Launch dialog system
		this.scene.launch('DialogScene', {
			player: this.player,
			map: this.mapCreator.map,
			scene: this,
		});

		this.joystickScene = this.scene.get('JoystickScene');

		// Launch HUD
		this.scene.launch('HUDScene', { player: this.player, map: this.mapCreator.map });

		// Initialize animated tiles
		(this.sys as { animatedTiles?: { init: (map: Phaser.Tilemaps.Tilemap) => void } }).animatedTiles?.init(
			this.mapCreator.map
		);

		// Environment particles (dust, leaves, etc.)
		this.particles = new NeverquestEnvironmentParticles(this, this.mapCreator.map);
		this.particles.create();

		// Add programmatic ambient particles for the Crossroads atmosphere
		this.createAmbientParticles();

		// Background music - use a different track for the crossroads atmosphere
		this.sound.volume = Alpha.MEDIUM_LIGHT;
		this.themeSound = this.sound.add('forest', {
			loop: true,
		});
		this.themeSound.play();

		// Initialize enemy array
		this.enemies = [];

		// Set up enemy spawn zones (from Tiled map if available)
		this.neverquestEnemyZones = new NeverquestEnemyZones(this, this.mapCreator.map);
		this.neverquestEnemyZones.create();

		// Set up programmatic enemy zones (for areas without Tiled map data)
		this.createProgrammaticEnemyZones();

		// Initialize save system
		this.saveManager = new NeverquestSaveManager(this);
		this.saveManager.create();
		this.setupSaveKeybinds();

		// Spawn NPCs for this scene
		this.createNPCs();

		// Create programmatic warp back to OverworldScene
		this.createOverworldWarp();

		// Create Ice Region placeholder (future expansion)
		this.createIceRegionPlaceholder();
	}

	/**
	 * Spawns all NPCs for the Crossroads scene.
	 * NPCs include: Merchant, Fallen Knight, Oracle, Gate Guardian
	 */
	createNPCs(): void {
		if (!this.player) return;

		this.npcManager = new NeverquestNPCManager(this, this.player);
		this.npcManager.addNPCs(CROSSROADS_NPCS);
		this.npcManager.create();
	}

	/**
	 * Creates programmatic enemy zones for the Crossroads scene.
	 * Spawns bandits (west), wolves (east), and a roaming shadow scout.
	 * These zones work alongside or instead of Tiled map enemy zones.
	 */
	createProgrammaticEnemyZones(): void {
		this.programmaticEnemyZones = new NeverquestProgrammaticEnemyZones(this);
		this.programmaticEnemyZones.addZones(CROSSROADS_ENEMY_ZONES);
		this.programmaticEnemyZones.create();
	}

	/**
	 * Creates ambient particle effects for the Crossroads atmosphere.
	 * Includes floating leaves/dust across the map to give life to the scene.
	 * This is called since the Tiled map may not have particle zone definitions yet.
	 */
	createAmbientParticles(): void {
		if (!this.map) return;

		const mapWidth = this.map.widthInPixels;
		const mapHeight = this.map.heightInPixels;

		// Create floating leaves/dust particles across the entire map
		const leavesParticles = this.add.particles(mapWidth / 2, mapHeight / 2, 'leaves', {
			angle: { min: 0, max: 360 },
			frequency: 50,
			speedX: { min: -20, max: 20 },
			speedY: { min: -10, max: 30 },
			x: { min: -mapWidth / 2, max: mapWidth / 2 },
			y: { min: -mapHeight / 2, max: mapHeight / 2 },
			lifespan: 8000,
			scale: { start: Scale.MEDIUM_LARGE, end: Alpha.MEDIUM },
			alpha: { start: Alpha.HIGH, end: Alpha.VERY_LOW },
			radial: true,
		});
		this.ambientParticles.push(leavesParticles);

		// Create subtle dust particles
		const dustParticles = this.add.particles(mapWidth / 2, mapHeight / 2, 'dust', {
			angle: { min: 0, max: 360 },
			frequency: 100,
			speedX: { min: -15, max: 15 },
			speedY: { min: -5, max: 25 },
			x: { min: -mapWidth / 2, max: mapWidth / 2 },
			y: { min: -mapHeight / 2, max: mapHeight / 2 },
			lifespan: 6000,
			scale: { start: Scale.TINY, end: Alpha.VERY_LOW },
			alpha: { start: Alpha.MEDIUM, end: Alpha.TRANSPARENT },
			radial: true,
		});
		this.ambientParticles.push(dustParticles);

		// Add mysterious particles near the northern gate (Dark Lands entrance)
		// These foreshadow the ominous nature of what lies beyond
		const darkGateX = mapWidth / 2;
		const darkGateY = 320; // Near the Gate Guardian
		const darkParticles = this.add.particles(darkGateX, darkGateY, 'dust', {
			angle: { min: 260, max: 280 },
			frequency: 200,
			speedX: { min: -5, max: 5 },
			speedY: { min: -30, max: -10 },
			x: { min: -100, max: 100 },
			y: { min: -50, max: 50 },
			lifespan: 4000,
			scale: { start: Scale.SMALL, end: Alpha.VERY_LOW },
			alpha: { start: Alpha.HALF, end: Alpha.TRANSPARENT },
			tint: 0x6b3fa0, // Purple tint for mysterious effect
			radial: false,
		});
		this.ambientParticles.push(darkParticles);
	}

	/**
	 * Creates a warp zone at the south edge leading back to OverworldScene.
	 * This is a programmatic alternative to Tiled-based warps for scene transitions.
	 */
	createOverworldWarp(): void {
		if (!this.player || !this.map) return;

		// Position the warp at the southern part of the map (path leading back to forest)
		// Using center-bottom position for 80x80 tile map (16px tiles = 1280x1280 pixels)
		const warpX = 640; // Center X (tile 40 * 16)
		const warpY = 1248; // Near bottom (tile 78 * 16)
		const warpWidth = 64;
		const warpHeight = 32;

		// Create the warp zone
		this.overworldWarpZone = this.add.zone(warpX, warpY, warpWidth, warpHeight);
		this.physics.add.existing(this.overworldWarpZone);
		(this.overworldWarpZone.body as Phaser.Physics.Arcade.Body).immovable = true;
		this.overworldWarpZone.setOrigin(0.5, 0.5);

		// Add particle effect at warp location
		const particleConfig: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig = {
			angle: 90, // Pointing down (towards forest)
			frequency: 300,
			speed: 1,
			x: { min: -warpWidth / 2, max: warpWidth / 2 },
			y: { min: -warpHeight / 2, max: warpHeight / 2 },
			lifespan: { min: ParticleValues.LIFESPAN_MEDIUM, max: ParticleValues.LIFESPAN_VERY_LONG },
			scale: { start: Scale.MEDIUM_LARGE, end: Alpha.VERY_HIGH },
			alpha: { start: Alpha.OPAQUE, end: Alpha.HIGH },
		};
		this.add.particles(warpX, warpY, 'particle_warp', particleConfig);

		// Add directional arrows pointing down (to indicate exit south to forest)
		this.createWarpArrows(warpX, warpY);

		// Add overlap detection for scene transition
		this.physics.add.overlap(this.player.container, this.overworldWarpZone, () => {
			this.transitionToOverworld();
		});
	}

	/**
	 * Creates animated arrow indicators around the warp zone
	 */
	createWarpArrows(x: number, y: number): void {
		const arrowPositions = [
			{ x: x - 24, y: y },
			{ x: x + 24, y: y },
		];

		arrowPositions.forEach((pos) => {
			const arrow = this.add
				.text(pos.x, pos.y, '↓', {
					fontSize: '20px',
					color: HexColors.GREEN_LIGHT,
					fontStyle: 'bold',
				})
				.setOrigin(0.5)
				.setDepth(100);

			// Animate arrows bobbing down
			this.tweens.add({
				targets: arrow,
				y: pos.y + 6,
				duration: 800,
				yoyo: true,
				repeat: -1,
				ease: 'Sine.easeInOut',
			});

			// Pulse alpha
			this.tweens.add({
				targets: arrow,
				alpha: Alpha.HALF,
				duration: 1000,
				yoyo: true,
				repeat: -1,
				ease: 'Sine.easeInOut',
			});
		});
	}

	/**
	 * Creates the entrance to the Ice Caverns region on the east side.
	 * Players can enter the Ice Caverns biome from here.
	 * Features icy particle effects and visual indicators.
	 */
	createIceRegionPlaceholder(): void {
		if (!this.player || !this.map) return;

		// Position at the eastern edge of the map (mountain pass to Ice Caverns)
		const entranceX = 1200; // Near right side (tile 75 * 16)
		const entranceY = 640; // Center height (tile 40 * 16)
		const entranceWidth = 48;
		const entranceHeight = 96;

		// Create the warp zone
		this.iceRegionZone = this.add.zone(entranceX, entranceY, entranceWidth, entranceHeight);
		this.physics.add.existing(this.iceRegionZone);
		(this.iceRegionZone.body as Phaser.Physics.Arcade.Body).immovable = true;
		this.iceRegionZone.setOrigin(0.5, 0.5);

		// Add entrance sign
		const entranceSign = this.add
			.text(entranceX, entranceY - 60, '❄ Ice Caverns ❄', {
				fontSize: '14px',
				color: HexColors.BLUE_LIGHT,
				fontStyle: 'bold',
				stroke: '#000000',
				strokeThickness: 2,
			})
			.setOrigin(0.5)
			.setDepth(100);

		// Add level indicator
		const levelText = this.add
			.text(entranceX, entranceY - 40, '[ Level 15-20 ]', {
				fontSize: '10px',
				color: HexColors.WHITE,
				fontStyle: 'italic',
			})
			.setOrigin(0.5)
			.setDepth(100);

		// Pulse effect on the signs
		this.tweens.add({
			targets: [entranceSign, levelText],
			alpha: Alpha.HALF,
			duration: 2000,
			yoyo: true,
			repeat: -1,
			ease: 'Sine.easeInOut',
		});

		// Create icy particle effects at the entrance
		const iceParticles = this.add.particles(entranceX, entranceY, 'dust', {
			angle: { min: 170, max: 190 }, // Blowing left (from the cold)
			frequency: 150,
			speed: { min: 20, max: 50 },
			x: { min: -entranceWidth / 2, max: entranceWidth / 2 },
			y: { min: -entranceHeight / 2, max: entranceHeight / 2 },
			lifespan: 3000,
			scale: { start: Scale.SMALL, end: Alpha.VERY_LOW },
			alpha: { start: Alpha.HIGH, end: Alpha.TRANSPARENT },
			tint: 0x87ceeb, // Light blue/ice tint
			radial: false,
		});
		this.ambientParticles.push(iceParticles);

		// Add snowflake-like particles drifting down
		const snowParticles = this.add.particles(entranceX, entranceY - 50, 'dust', {
			angle: { min: 85, max: 95 },
			frequency: 300,
			speed: { min: 10, max: 30 },
			x: { min: -80, max: 80 },
			y: { min: -20, max: 20 },
			lifespan: 4000,
			scale: { start: Scale.TINY, end: Scale.SMALL },
			alpha: { start: Alpha.OPAQUE, end: Alpha.MEDIUM },
			tint: 0xffffff,
			radial: false,
		});
		this.ambientParticles.push(snowParticles);

		// Add warp arrow indicators
		this.createIceRegionArrows(entranceX, entranceY);

		// Add overlap detection for scene transition
		this.physics.add.overlap(this.player.container, this.iceRegionZone, () => {
			this.transitionToIceCaverns();
		});

		// Add visual portal effect
		const portalGlow = this.add.graphics();
		portalGlow.fillStyle(0x87ceeb, 0.3);
		portalGlow.fillRect(
			entranceX - entranceWidth / 2,
			entranceY - entranceHeight / 2,
			entranceWidth,
			entranceHeight
		);
		portalGlow.setDepth(50);

		// Pulse the portal glow
		this.tweens.add({
			targets: portalGlow,
			alpha: 0.5,
			duration: 1500,
			yoyo: true,
			repeat: -1,
			ease: 'Sine.easeInOut',
		});
	}

	/**
	 * Creates animated arrow indicators for the Ice Caverns entrance
	 */
	createIceRegionArrows(x: number, y: number): void {
		const arrowPositions = [
			{ x: x + 30, y: y - 20 },
			{ x: x + 30, y: y + 20 },
		];

		arrowPositions.forEach((pos) => {
			const arrow = this.add
				.text(pos.x, pos.y, '→', {
					fontSize: '20px',
					color: HexColors.BLUE_LIGHT,
					fontStyle: 'bold',
				})
				.setOrigin(0.5)
				.setDepth(100);

			// Animate arrows moving right
			this.tweens.add({
				targets: arrow,
				x: pos.x + 6,
				duration: 800,
				yoyo: true,
				repeat: -1,
				ease: 'Sine.easeInOut',
			});

			// Pulse alpha
			this.tweens.add({
				targets: arrow,
				alpha: Alpha.HALF,
				duration: 1000,
				yoyo: true,
				repeat: -1,
				ease: 'Sine.easeInOut',
			});
		});
	}

	/**
	 * Handles the transition to the Ice Caverns scene
	 */
	transitionToIceCaverns(): void {
		// Prevent multiple transitions
		if (this.iceRegionZone) {
			this.iceRegionZone.destroy();
			this.iceRegionZone = null;
		}

		// Camera fade effect
		this.cameras.main.fade(500);

		this.cameras.main.once('camerafadeoutcomplete', () => {
			// Clean up current scene
			this.stopSceneMusic();

			// Clean up NPC manager
			if (this.npcManager) {
				this.npcManager.destroy();
				this.npcManager = null;
			}

			// Clean up programmatic enemy zones
			if (this.programmaticEnemyZones) {
				this.programmaticEnemyZones.destroy();
				this.programmaticEnemyZones = null;
			}

			// Clean up ambient particles
			this.ambientParticles.forEach((emitter) => emitter.destroy());
			this.ambientParticles = [];

			if (this.player) {
				this.player.neverquestMovement = null;
				this.player.destroy();
			}

			// Start Ice Caverns scene
			this.scene.start('IceCavernsScene', { previousScene: 'CrossroadsScene' });
		});
	}

	/**
	 * Handles the transition back to OverworldScene with proper cleanup
	 */
	transitionToOverworld(): void {
		// Prevent multiple transitions
		if (this.overworldWarpZone) {
			this.overworldWarpZone.destroy();
			this.overworldWarpZone = null;
		}

		// Camera fade effect
		this.cameras.main.fade(500);

		this.cameras.main.once('camerafadeoutcomplete', () => {
			// Clean up current scene
			this.stopSceneMusic();

			// Clean up NPC manager
			if (this.npcManager) {
				this.npcManager.destroy();
				this.npcManager = null;
			}

			// Clean up programmatic enemy zones
			if (this.programmaticEnemyZones) {
				this.programmaticEnemyZones.destroy();
				this.programmaticEnemyZones = null;
			}

			// Clean up ambient particles
			this.ambientParticles.forEach((emitter) => emitter.destroy());
			this.ambientParticles = [];

			if (this.player) {
				this.player.neverquestMovement = null;
				this.player.destroy();
			}

			// Start OverworldScene with reference to return scene
			this.scene.start('OverworldScene', { previousScene: 'CrossroadsScene' });
		});
	}

	setupSaveKeybinds(): void {
		this.input.keyboard!.on('keydown', (event: KeyboardEvent) => {
			if (event.ctrlKey && event.key === 's') {
				event.preventDefault();
				this.saveManager!.saveGame(false);
			}
			if (event.ctrlKey && event.key === 'l') {
				event.preventDefault();
				const saveData = this.saveManager!.loadGame(false);
				if (saveData) {
					this.saveManager!.applySaveData(saveData);
				}
			}
			if (event.key === 'F5') {
				event.preventDefault();
				const saveData = this.saveManager!.loadGame(true);
				if (saveData) {
					this.saveManager!.applySaveData(saveData);
				} else {
					this.saveManager!.showSaveNotification(SaveMessages.NO_CHECKPOINT_FOUND, true);
				}
			}
		});
	}

	stopSceneMusic(): void {
		this.themeSound?.stop();
	}

	update(): void {
		// Crossroads-specific update logic
		// Could include ambient effects, NPC idle animations, etc.
	}
}
