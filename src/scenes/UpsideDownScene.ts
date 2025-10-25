import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { PlayerConfig } from '../consts/player/Player';
import { NeverquestMapCreator } from '../plugins/NeverquestMapCreator';
import { NeverquestSaveManager } from '../plugins/NeverquestSaveManager';
import { NeverquestWarp } from '../plugins/NeverquestWarp';
import { NeverquestObjectMarker } from '../plugins/NeverquestObjectMarker';
import AnimatedTiles from '../plugins/AnimatedTiles';
import { NeverquestEnemyZones } from '../plugins/NeverquestEnemyZones';

/**
 * The Upside Down World Scene - An eerie alternate dimension inspired by Stranger Things
 * Features dark atmosphere, floating particles, and distorted visuals
 */
export class UpsideDownScene extends Phaser.Scene {
	player: Player | null;
	mapCreator: NeverquestMapCreator | null;
	map: Phaser.Tilemaps.Tilemap | null;
	previousScene: string = 'MainScene';
	themeSound: Phaser.Sound.BaseSound | null;
	saveManager: NeverquestSaveManager | null;

	// Upside Down specific effects
	private vignette: Phaser.GameObjects.Graphics | null = null;
	private darkOverlay: Phaser.GameObjects.Rectangle | null = null;
	private floatingParticles: Phaser.GameObjects.Particles.ParticleEmitter[] = [];
	private returnPortal: Phaser.GameObjects.Zone | null = null;
	private portalParticles: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
	private distortionTimer: Phaser.Time.TimerEvent | null = null;
	private fogParticles: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
	private ashParticles: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
	private enemies: any[] = [];
	private neverquestEnemyZones: NeverquestEnemyZones | null = null;
	private portalSprite: Phaser.GameObjects.Sprite | null = null;

	constructor() {
		super({
			key: 'UpsideDownScene',
		});

		this.player = null;
		this.mapCreator = null;
		this.map = null;
		this.themeSound = null;
		this.saveManager = null;
	}

	/**
	 * Initialize scene with data from previous scene
	 */
	init(data: { previousScene?: string; playerData?: any }): void {
		if (data && data.previousScene) {
			this.previousScene = data.previousScene;
		}
	}

	preload(): void {
		this.load.scenePlugin('animatedTiles', AnimatedTiles, 'animatedTiles', 'animatedTiles');
	}

	create(): void {
		// Set up the dark atmosphere
		this.cameras.main.setZoom(2.5);

		// Create map using the same tilemap as MainScene but with different rendering
		this.mapCreator = new NeverquestMapCreator(this);
		this.mapCreator.create();
		this.map = this.mapCreator.map;

		// Apply dark tint to the entire tilemap
		if (this.map) {
			this.map.layers.forEach((layer) => {
				if (layer.tilemapLayer) {
					// Dark purple-blue tint for the Upside Down effect
					layer.tilemapLayer.setTint(0x4a3a5a);
					layer.tilemapLayer.setAlpha(0.85);
				}
			});
		}

		// Create player with a dark tint
		const spawnX = 400;
		const spawnY = 300;
		this.player = new Player(this, spawnX, spawnY, PlayerConfig.texture, this.map);

		// Apply eerie effects to the player
		if (this.player && this.player.container) {
			this.player.container.list.forEach((child: any) => {
				if (child.setTint) {
					child.setTint(0x8a7a9a);
				}
			});
		}

		// Set up camera to follow player with slight lag for disorienting effect
		this.cameras.main.startFollow(this.player.container, false, 0.05, 0.05);

		// Add a dark overlay for atmosphere
		this.createDarkOverlay();

		// Create atmospheric particle effects
		this.createAtmosphericEffects();

		// Create the return portal
		this.createReturnPortal();

		// Add screen effects
		this.createVignetteEffect();

		// Set up warps and markers
		const neverquestWarp = new NeverquestWarp(this, this.player, this.map);
		neverquestWarp.createWarps();

		const interactiveMarkers = new NeverquestObjectMarker(this, this.map);
		interactiveMarkers.create();

		// Launch UI scenes
		this.scene.launch('DialogScene', {
			player: this.player,
			map: this.map,
			scene: this,
		});

		this.scene.launch('HUDScene', {
			player: this.player,
			map: this.map,
		});

		// Initialize animated tiles
		(this.sys as any).animatedTiles.init(this.map);

		// Add eerie background music/ambient sound
		this.sound.volume = 0.4;
		this.themeSound = this.sound.add('dungeon_ambience', {
			loop: true,
			volume: 0.7,
		});

		// If dungeon_ambience doesn't exist, use any dark ambient sound
		if (!this.sound.get('dungeon_ambience')) {
			// Use a different sound or create ambient with existing sounds
			this.themeSound = this.sound.add('path_to_lake_land', {
				loop: true,
				volume: 0.3,
				rate: 0.7, // Slow it down for creepy effect
				detune: -500, // Lower pitch for darkness
			});
		}

		this.themeSound.play();

		// Enemy zones with enhanced difficulty
		this.enemies = [];
		this.neverquestEnemyZones = new NeverquestEnemyZones(this, this.map);
		this.neverquestEnemyZones.create();

		// Initialize save manager
		this.saveManager = new NeverquestSaveManager(this);
		this.saveManager.create();

		// Add periodic screen distortion effects
		this.createDistortionEffects();

		// Fade in from black for dramatic entrance
		this.cameras.main.fadeIn(500, 0, 0, 0);

		// Add escape key handler
		this.input.keyboard?.on('keydown-ESC', () => {
			this.returnToPreviousScene();
		});
	}

	/**
	 * Create a dark overlay to reduce visibility
	 */
	private createDarkOverlay(): void {
		const { width, height } = this.cameras.main;
		this.darkOverlay = this.add.rectangle(width / 2, height / 2, width * 2, height * 2, 0x000000, 0.4);
		this.darkOverlay.setScrollFactor(0);
		this.darkOverlay.setDepth(900);

		// Add pulsing effect to the darkness
		this.tweens.add({
			targets: this.darkOverlay,
			alpha: { from: 0.3, to: 0.5 },
			duration: 3000,
			yoyo: true,
			repeat: -1,
			ease: 'Sine.easeInOut',
		});
	}

	/**
	 * Create floating particles and fog effects
	 */
	private createAtmosphericEffects(): void {
		const { width, height } = this.cameras.main;

		// Floating ash/spore particles
		this.ashParticles = this.add.particles(0, 0, 'dust', {
			x: { min: -width, max: width * 2 },
			y: { min: -height, max: height * 2 },
			lifespan: 8000,
			speed: { min: 10, max: 30 },
			scale: { start: 0.8, end: 0.3 },
			alpha: { start: 0.6, end: 0 },
			blendMode: 'ADD',
			frequency: 20,
			tint: 0x6a5a7a,
			emitZone: {
				type: 'random',
				source: new Phaser.Geom.Rectangle(-width, -height, width * 3, height * 3),
			},
		});
		this.ashParticles.setScrollFactor(1);
		this.ashParticles.setDepth(899);

		// Mysterious floating particles (like from the show)
		const floatingParticles = this.add.particles(0, 0, 'particle_warp', {
			x: { min: -width / 2, max: width * 1.5 },
			y: { min: -height / 2, max: height * 1.5 },
			lifespan: 12000,
			speed: { min: 5, max: 15 },
			scale: { start: 1.2, end: 0.5 },
			alpha: { start: 0.3, end: 0 },
			frequency: 50,
			tint: 0x4a3a8a,
			gravityY: -10,
			emitZone: {
				type: 'random',
				source: new Phaser.Geom.Rectangle(-width / 2, -height / 2, width * 2, height * 2),
			},
		});
		floatingParticles.setScrollFactor(0.9);
		floatingParticles.setDepth(898);
		this.floatingParticles.push(floatingParticles);

		// Dense fog effect using leaves particle with modifications
		this.fogParticles = this.add.particles(0, 0, 'leaves', {
			x: { min: -width, max: width * 2 },
			y: { min: -height, max: height * 2 },
			lifespan: 15000,
			speed: { min: 15, max: 25 },
			scale: { start: 3, end: 5 },
			alpha: { start: 0.15, end: 0 },
			frequency: 100,
			tint: 0x2a2a4a,
			blendMode: 'MULTIPLY',
			angle: { min: 0, max: 360 },
			rotate: { min: -20, max: 20 },
			emitZone: {
				type: 'random',
				source: new Phaser.Geom.Rectangle(-width, -height, width * 3, height * 3),
			},
		});
		this.fogParticles.setScrollFactor(0.95);
		this.fogParticles.setDepth(897);
	}

	/**
	 * Create vignette effect around screen edges
	 */
	private createVignetteEffect(): void {
		const { width, height } = this.cameras.main;
		this.vignette = this.add.graphics();

		// Create vignette using multiple concentric rectangles with decreasing alpha
		for (let i = 0; i < 10; i++) {
			const progress = i / 10;
			const alpha = progress * 0.08;
			const thickness = 20 + i * 10;

			this.vignette.lineStyle(thickness, 0x000000, alpha);
			this.vignette.strokeRect(thickness / 2, thickness / 2, width - thickness, height - thickness);
		}

		this.vignette.setScrollFactor(0);
		this.vignette.setDepth(950);
	}

	/**
	 * Create portal to return to the normal world
	 */
	private createReturnPortal(): void {
		const portalX = 600;
		const portalY = 400;

		// Create portal zone for collision
		this.returnPortal = this.add.zone(portalX, portalY, 60, 80);
		this.physics.add.existing(this.returnPortal);

		// Visual portal effect using particles
		this.portalParticles = this.add.particles(portalX, portalY, 'particle_warp', {
			speed: { min: 50, max: 100 },
			scale: { start: 1.5, end: 0 },
			alpha: { start: 0.8, end: 0 },
			lifespan: 1000,
			frequency: 10,
			tint: [0x8a4a9a, 0x6a3a7a, 0x4a2a5a],
			blendMode: 'ADD',
			radial: true,
			angle: { min: 0, max: 360 },
			emitZone: {
				type: 'edge',
				source: new Phaser.Geom.Ellipse(0, 0, 40, 60),
				quantity: 20,
			},
		});
		this.portalParticles.setDepth(800);

		// Add a glowing portal sprite or shape
		const portalGlow = this.add.ellipse(portalX, portalY, 50, 70, 0x8a4a9a, 0.3);
		portalGlow.setDepth(799);

		// Pulsing effect for the portal
		this.tweens.add({
			targets: portalGlow,
			scaleX: 1.2,
			scaleY: 1.2,
			alpha: 0.5,
			duration: 1500,
			yoyo: true,
			repeat: -1,
			ease: 'Sine.easeInOut',
		});

		// Add swirling effect to portal particles
		this.tweens.add({
			targets: this.portalParticles,
			particleRotate: 360,
			duration: 3000,
			repeat: -1,
			ease: 'Linear',
		});

		// Setup collision for return
		if (this.player && this.returnPortal) {
			this.physics.add.overlap(
				this.player.container,
				this.returnPortal,
				() => this.handlePortalExit(),
				undefined,
				this
			);
		}

		// Add floating text hint above portal
		const portalText = this.add.text(portalX, portalY - 60, 'Return Portal', {
			fontSize: '12px',
			fontFamily: '"Press Start 2P"',
			color: '#8a6a9a',
			stroke: '#000000',
			strokeThickness: 2,
		});
		portalText.setOrigin(0.5, 0.5);
		portalText.setDepth(801);

		// Floating animation for text
		this.tweens.add({
			targets: portalText,
			y: portalY - 65,
			duration: 2000,
			yoyo: true,
			repeat: -1,
			ease: 'Sine.easeInOut',
		});
	}

	/**
	 * Create periodic screen distortion effects
	 */
	private createDistortionEffects(): void {
		// Random camera shake for unsettling feeling
		this.distortionTimer = this.time.addEvent({
			delay: 8000,
			callback: () => {
				// Subtle camera shake
				this.cameras.main.shake(300, 0.003);

				// Flash effect
				this.cameras.main.flash(200, 50, 30, 70, false);

				// Temporary zoom distortion
				this.tweens.add({
					targets: this.cameras.main,
					zoom: 2.4,
					duration: 150,
					yoyo: true,
					ease: 'Sine.easeInOut',
				});
			},
			loop: true,
		});

		// Occasional "glitch" effect
		this.time.addEvent({
			delay: 15000,
			callback: () => {
				this.createGlitchEffect();
			},
			loop: true,
		});
	}

	/**
	 * Create a glitch/static effect
	 */
	private createGlitchEffect(): void {
		const glitchOverlay = this.add.rectangle(
			this.cameras.main.width / 2,
			this.cameras.main.height / 2,
			this.cameras.main.width * 2,
			this.cameras.main.height * 2,
			0xffffff,
			0.1
		);
		glitchOverlay.setScrollFactor(0);
		glitchOverlay.setDepth(1000);

		// Rapid flashing
		this.tweens.add({
			targets: glitchOverlay,
			alpha: { from: 0.3, to: 0 },
			duration: 50,
			repeat: 3,
			onComplete: () => glitchOverlay.destroy(),
		});

		// Brief static sound if available
		const staticSound = this.sound.add('electric_shock', { volume: 0.2 });
		if (this.sound.get('electric_shock')) {
			staticSound.play();
		}
	}

	/**
	 * Handle portal exit transition
	 */
	private handlePortalExit(): void {
		// Prevent multiple activations
		if (this.returnPortal) {
			this.returnPortal.destroy();
			this.returnPortal = null;
		}

		// Portal activation sound
		const portalSound = this.sound.add('start_game', { volume: 0.5 });
		portalSound.play();

		// Swirl/fade effect
		this.cameras.main.fadeOut(500, 60, 30, 80);

		// Zoom effect
		this.tweens.add({
			targets: this.cameras.main,
			zoom: 3.5,
			rotation: 0.1,
			duration: 500,
			ease: 'Power2',
		});

		this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
			this.returnToPreviousScene();
		});
	}

	/**
	 * Return to previous scene
	 */
	private returnToPreviousScene(): void {
		this.cleanupEffects();

		this.scene.start(this.previousScene, {
			fromUpsideDown: true,
		});

		this.stopSceneMusic();

		// Stop UI scenes
		this.scene.stop('DialogScene');
		this.scene.stop('HUDScene');

		if (this.player) {
			this.player.destroy();
		}

		this.scene.stop();
	}

	/**
	 * Clean up all effects and timers
	 */
	private cleanupEffects(): void {
		if (this.distortionTimer) {
			this.distortionTimer.destroy();
		}

		this.floatingParticles.forEach((emitter) => emitter.destroy());

		if (this.portalParticles) {
			this.portalParticles.destroy();
		}

		if (this.fogParticles) {
			this.fogParticles.destroy();
		}

		if (this.ashParticles) {
			this.ashParticles.destroy();
		}

		this.tweens.killAll();
	}

	/**
	 * Stop scene music
	 */
	stopSceneMusic(): void {
		if (this.themeSound) {
			this.themeSound.stop();
		}
	}

	update(): void {
		// Add any continuous update effects here if needed

		// Example: Subtle drift effect for particles based on player movement
		if (this.player && this.fogParticles) {
			const velocityX = this.player.body?.velocity.x || 0;
			const velocityY = this.player.body?.velocity.y || 0;

			// Make fog react slightly to player movement
			this.fogParticles.setParticleSpeed(15 - velocityX * 0.05, 25 + velocityX * 0.05);
		}
	}
}
