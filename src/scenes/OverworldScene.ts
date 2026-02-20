/**
 * @fileoverview Overworld forest scene for Neverquest
 *
 * This scene represents the open-world forest area featuring:
 * - Forest tilemap with paths and trees
 * - Ambient leaf particle effects
 * - Enemy encounters (rats, etc.)
 * - Warp to Town, Cave, and Crossroads
 * - Tutorial area for Act 1
 *
 * Entry point for new game starts and hub for Act 1 content.
 *
 * @see TownScene - Connected village area
 * @see CaveScene - Connected dungeon area
 * @see CrossroadsScene - Connected Act 2 hub
 * @see NeverquestMapCreator - Loads forest tilemap
 *
 * @module scenes/OverworldScene
 */

import Phaser from 'phaser';
import { NeverquestWarp } from '../plugins/NeverquestWarp';
import { NeverquestObjectMarker } from '../plugins/NeverquestObjectMarker';
import AnimatedTiles from '../plugins/AnimatedTiles';
import { NeverquestEnvironmentParticles } from '../plugins/NeverquestEnvironmentParticles';
import { NeverquestEnemyZones } from '../plugins/NeverquestEnemyZones';
import { NeverquestMapCreator } from '../plugins/NeverquestMapCreator';
import { NeverquestSaveManager } from '../plugins/NeverquestSaveManager';
import { CameraValues, Alpha, ParticleValues, Scale } from '../consts/Numbers';
import { HexColors } from '../consts/Colors';
import { SaveMessages } from '../consts/Messages';
import { Player } from '../entities/Player';

export class OverworldScene extends Phaser.Scene {
	player: Player | null;
	mapCreator: NeverquestMapCreator | null;
	map: Phaser.Tilemaps.Tilemap | null;
	joystickScene: Phaser.Scene | null;
	particles: NeverquestEnvironmentParticles | null;
	themeSound: Phaser.Sound.BaseSound | null;
	enemies: Phaser.Physics.Arcade.Sprite[];
	neverquestEnemyZones: NeverquestEnemyZones | null;
	saveManager: NeverquestSaveManager | null;
	crossroadsWarpZone: Phaser.GameObjects.Zone | null;

	constructor() {
		super({
			key: 'OverworldScene',
		});
		this.player = null;
		this.mapCreator = null;
		this.map = null;
		this.joystickScene = null;
		this.particles = null;
		this.themeSound = null;
		this.enemies = [];
		this.neverquestEnemyZones = null;
		this.saveManager = null;
		this.crossroadsWarpZone = null;
	}

	preload(): void {
		this.load.scenePlugin('animatedTiles', AnimatedTiles, 'animatedTiles', 'animatedTiles');
	}

	create(): void {
		this.cameras.main.setZoom(CameraValues.ZOOM_CLOSE);

		this.mapCreator = new NeverquestMapCreator(this, 'overworld');
		this.mapCreator.create();

		// Store map reference for other systems
		this.map = this.mapCreator.map;

		const camera = this.cameras.main;
		camera.startFollow(this.player!.container);

		// Set camera bounds to match the map size so camera doesn't go beyond the map edges
		camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

		const neverquestWarp = new NeverquestWarp(this, this.player!, this.mapCreator.map);
		neverquestWarp.createWarps();
		const interactiveMarkers = new NeverquestObjectMarker(this, this.mapCreator.map);
		interactiveMarkers.create();

		this.scene.launch('DialogScene', {
			player: this.player,
			map: this.mapCreator.map,
			scene: this,
		});

		this.joystickScene = this.scene.get('JoystickScene');

		this.scene.launch('HUDScene', { player: this.player, map: this.mapCreator.map });

		(this.sys as { animatedTiles?: { init: (map: Phaser.Tilemaps.Tilemap) => void } }).animatedTiles?.init(
			this.mapCreator.map
		);
		this.particles = new NeverquestEnvironmentParticles(this, this.mapCreator.map);
		this.particles.create();

		this.sound.volume = Alpha.MEDIUM_LIGHT;
		this.themeSound = this.sound.add('forest', {
			loop: true,
		});
		this.themeSound.play();

		this.enemies = [];

		this.neverquestEnemyZones = new NeverquestEnemyZones(this, this.mapCreator.map);
		this.neverquestEnemyZones.create();

		this.saveManager = new NeverquestSaveManager(this);
		this.saveManager.create();
		this.setupSaveKeybinds();

		// Create programmatic warp to CrossroadsScene
		this.createCrossroadsWarp();
	}

	/**
	 * Creates a warp zone at the north edge of the overworld map leading to CrossroadsScene.
	 * This is a programmatic alternative to Tiled-based warps for scene transitions.
	 */
	createCrossroadsWarp(): void {
		if (!this.player || !this.map) return;

		// Position the warp at the northern part of the map (forest path leading to crossroads)
		// Using tile coordinates based on the 50x50 tile map (16px tiles = 800x800 pixels)
		const warpX = 400; // Center X (tile 25 * 16)
		const warpY = 32; // Near top (tile 2 * 16)
		const warpWidth = 64;
		const warpHeight = 32;

		// Create the warp zone
		this.crossroadsWarpZone = this.add.zone(warpX, warpY, warpWidth, warpHeight);
		this.physics.add.existing(this.crossroadsWarpZone);
		(this.crossroadsWarpZone.body as Phaser.Physics.Arcade.Body).immovable = true;
		this.crossroadsWarpZone.setOrigin(0.5, 0.5);

		// Add particle effect at warp location
		const particleConfig: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig = {
			angle: -90,
			frequency: 300,
			speed: 1,
			x: { min: -warpWidth / 2, max: warpWidth / 2 },
			y: { min: -warpHeight / 2, max: warpHeight / 2 },
			lifespan: { min: ParticleValues.LIFESPAN_MEDIUM, max: ParticleValues.LIFESPAN_VERY_LONG },
			scale: { start: Scale.MEDIUM_LARGE, end: Alpha.VERY_HIGH },
			alpha: { start: Alpha.OPAQUE, end: Alpha.HIGH },
		};
		this.add.particles(warpX, warpY, 'particle_warp', particleConfig);

		// Add directional arrows pointing up (to indicate exit)
		this.createWarpArrows(warpX, warpY);

		// Add overlap detection for scene transition
		this.physics.add.overlap(this.player.container, this.crossroadsWarpZone, () => {
			this.transitionToCrossroads();
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
				.text(pos.x, pos.y, '↑', {
					fontSize: '20px',
					color: HexColors.ORANGE_LIGHT,
					fontStyle: 'bold',
				})
				.setOrigin(0.5)
				.setDepth(100);

			// Animate arrows bobbing up
			this.tweens.add({
				targets: arrow,
				y: pos.y - 6,
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
	 * Handles the transition to CrossroadsScene with proper cleanup
	 */
	transitionToCrossroads(): void {
		// Prevent multiple transitions
		if (this.crossroadsWarpZone) {
			this.crossroadsWarpZone.destroy();
			this.crossroadsWarpZone = null;
		}

		// Camera fade effect
		this.cameras.main.fade(500);

		this.cameras.main.once('camerafadeoutcomplete', () => {
			// Clean up current scene
			this.stopSceneMusic();

			if (this.player) {
				this.player.neverquestMovement = null;
				this.player.destroy();
			}

			// Start CrossroadsScene with reference to return scene
			this.scene.start('CrossroadsScene', { previousScene: 'OverworldScene' });
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
		this.themeSound!.stop();
	}

	update(): void {
		// Overworld-specific update logic can be added here
	}
}
