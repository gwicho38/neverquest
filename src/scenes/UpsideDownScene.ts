import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { PlayerConfig } from '../consts/player/Player';
import { NeverquestMapCreator } from '../plugins/NeverquestMapCreator';
import { NeverquestSaveManager } from '../plugins/NeverquestSaveManager';
import { NeverquestWarp } from '../plugins/NeverquestWarp';
import { NeverquestObjectMarker } from '../plugins/NeverquestObjectMarker';
import AnimatedTiles from '../plugins/AnimatedTiles';
import { NeverquestEnemyZones } from '../plugins/NeverquestEnemyZones';
import { HexColors, NumericColors } from '../consts/Colors';
import {
	Alpha,
	Scale,
	AnimationTiming,
	CameraValues,
	Depth,
	ParticleValues,
	AudioValues,
	FontSizes,
} from '../consts/Numbers';
import { UILabels, FontFamily } from '../consts/Messages';

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
		this.cameras.main.setZoom(CameraValues.ZOOM_CLOSE);

		// Create map using the same tilemap as MainScene but with different rendering
		this.mapCreator = new NeverquestMapCreator(this);
		this.mapCreator.create();
		this.map = this.mapCreator.map;

		// Apply dark tint to the entire tilemap
		if (this.map) {
			this.map.layers.forEach((layer) => {
				if (layer.tilemapLayer) {
					// Dark purple-blue tint for the Upside Down effect
					layer.tilemapLayer.setTint(NumericColors.PURPLE_FOG_MEDIUM);
					layer.tilemapLayer.setAlpha(Alpha.TILEMAP_DARK);
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
					child.setTint(NumericColors.PURPLE_MUTED);
				}
			});
		}

		// Set up camera to follow player with slight lag for disorienting effect
		this.cameras.main.startFollow(this.player.container, false, Alpha.VERY_LOW, Alpha.VERY_LOW);

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
		this.sound.volume = Alpha.MEDIUM;
		this.themeSound = this.sound.add('dungeon_ambience', {
			loop: true,
			volume: Alpha.HIGH,
		});

		// If dungeon_ambience doesn't exist, use any dark ambient sound
		if (!this.sound.get('dungeon_ambience')) {
			// Use a different sound or create ambient with existing sounds
			this.themeSound = this.sound.add('path_to_lake_land', {
				loop: true,
				volume: Alpha.LIGHT,
				rate: Alpha.HIGH, // Slow it down for creepy effect
				detune: AudioValues.DETUNE_DARK, // Lower pitch for darkness
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
		this.cameras.main.fadeIn(CameraValues.FADE_SLOW, 0, 0, 0);

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
		this.darkOverlay = this.add.rectangle(
			width / 2,
			height / 2,
			width * 2,
			height * 2,
			NumericColors.BLACK,
			Alpha.MEDIUM
		);
		this.darkOverlay.setScrollFactor(0);
		this.darkOverlay.setDepth(Depth.DARK_OVERLAY);

		// Add pulsing effect to the darkness
		this.tweens.add({
			targets: this.darkOverlay,
			alpha: { from: Alpha.LIGHT, to: Alpha.HALF },
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
			scale: { start: Scale.SMALL, end: Alpha.LIGHT },
			alpha: { start: Alpha.MEDIUM_HIGH, end: Alpha.TRANSPARENT },
			blendMode: 'ADD',
			frequency: 20,
			tint: NumericColors.PURPLE_FOG_LIGHT,
			emitZone: {
				type: 'random',
				source: new Phaser.Geom.Rectangle(-width, -height, width * 3, height * 3),
			},
		});
		this.ashParticles.setScrollFactor(1);
		this.ashParticles.setDepth(Depth.PARTICLES_HIGH);

		// Mysterious floating particles (like from the show)
		const floatingParticles = this.add.particles(0, 0, 'particle_warp', {
			x: { min: -width / 2, max: width * Scale.LARGE },
			y: { min: -height / 2, max: height * Scale.LARGE },
			lifespan: 12000,
			speed: { min: 5, max: 15 },
			scale: { start: Scale.SLIGHTLY_LARGE, end: Alpha.HALF },
			alpha: { start: Alpha.LIGHT, end: Alpha.TRANSPARENT },
			frequency: 50,
			tint: NumericColors.PURPLE_FOG_MEDIUM,
			gravityY: -10,
			emitZone: {
				type: 'random',
				source: new Phaser.Geom.Rectangle(-width / 2, -height / 2, width * 2, height * 2),
			},
		});
		floatingParticles.setScrollFactor(Alpha.ALMOST_OPAQUE);
		floatingParticles.setDepth(Depth.PARTICLES_MID);
		this.floatingParticles.push(floatingParticles);

		// Dense fog effect using leaves particle with modifications
		this.fogParticles = this.add.particles(0, 0, 'leaves', {
			x: { min: -width, max: width * 2 },
			y: { min: -height, max: height * 2 },
			lifespan: 15000,
			speed: { min: 15, max: 25 },
			scale: { start: 3, end: 5 },
			alpha: { start: Alpha.FOG_START, end: Alpha.TRANSPARENT },
			frequency: 100,
			tint: NumericColors.PURPLE_FOG_DARK,
			blendMode: 'MULTIPLY',
			angle: { min: 0, max: 360 },
			rotate: { min: -20, max: 20 },
			emitZone: {
				type: 'random',
				source: new Phaser.Geom.Rectangle(-width, -height, width * 3, height * 3),
			},
		});
		this.fogParticles.setScrollFactor(Alpha.NEARLY_FULL);
		this.fogParticles.setDepth(Depth.PARTICLES_LOW);
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

			this.vignette.lineStyle(thickness, NumericColors.BLACK, alpha);
			this.vignette.strokeRect(thickness / 2, thickness / 2, width - thickness, height - thickness);
		}

		this.vignette.setScrollFactor(0);
		this.vignette.setDepth(Depth.VIGNETTE);
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
			scale: { start: Scale.LARGE, end: Alpha.TRANSPARENT },
			alpha: { start: Alpha.VERY_HIGH, end: Alpha.TRANSPARENT },
			lifespan: ParticleValues.LIFESPAN_LONG,
			frequency: 10,
			tint: [NumericColors.PURPLE_EXPLORED, NumericColors.PURPLE_FOG_LIGHT, NumericColors.PURPLE_FOG_DARK],
			blendMode: 'ADD',
			radial: true,
			angle: { min: 0, max: 360 },
			emitZone: {
				type: 'edge',
				source: new Phaser.Geom.Ellipse(0, 0, 40, 60),
				quantity: 20,
			},
		});
		this.portalParticles.setDepth(Depth.PORTAL_SPRITE);

		// Add a glowing portal sprite or shape
		const portalGlow = this.add.ellipse(portalX, portalY, 50, 70, NumericColors.PURPLE_EXPLORED, Alpha.LIGHT);
		portalGlow.setDepth(Depth.PORTAL);

		// Pulsing effect for the portal
		this.tweens.add({
			targets: portalGlow,
			scaleX: Scale.SLIGHTLY_LARGE,
			scaleY: Scale.SLIGHTLY_LARGE,
			alpha: Alpha.HALF,
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
		const portalText = this.add.text(portalX, portalY - 60, UILabels.RETURN_PORTAL, {
			fontSize: FontSizes.PORTAL_TEXT,
			fontFamily: `"${FontFamily.PIXEL}"`,
			color: HexColors.PURPLE_DARK,
			stroke: HexColors.BLACK,
			strokeThickness: 2,
		});
		portalText.setOrigin(0.5, 0.5);
		portalText.setDepth(Depth.PORTAL_TEXT);

		// Floating animation for text
		this.tweens.add({
			targets: portalText,
			y: portalY - 65,
			duration: ParticleValues.LIFESPAN_VERY_LONG,
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
				this.cameras.main.shake(AnimationTiming.TWEEN_NORMAL, Alpha.CAMERA_SHAKE);

				// Flash effect
				this.cameras.main.flash(CameraValues.FADE_FAST, 50, 30, 70, false);

				// Temporary zoom distortion
				this.tweens.add({
					targets: this.cameras.main,
					zoom: CameraValues.ZOOM_DISTORTION,
					duration: AnimationTiming.HIT_FLASH_DURATION,
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
			NumericColors.WHITE,
			Alpha.LOW
		);
		glitchOverlay.setScrollFactor(0);
		glitchOverlay.setDepth(Depth.UI);

		// Rapid flashing
		this.tweens.add({
			targets: glitchOverlay,
			alpha: { from: Alpha.LIGHT, to: Alpha.TRANSPARENT },
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
		const portalSound = this.sound.add('start_game', { volume: Alpha.HALF });
		portalSound.play();

		// Swirl/fade effect
		this.cameras.main.fadeOut(CameraValues.FADE_SLOW, 60, 30, 80);

		// Zoom effect
		this.tweens.add({
			targets: this.cameras.main,
			zoom: CameraValues.ZOOM_PORTAL_EXIT,
			rotation: Alpha.LOW,
			duration: CameraValues.FADE_SLOW,
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
			this.fogParticles.setParticleSpeed(15 - velocityX * Alpha.VERY_LOW, 25 + velocityX * Alpha.VERY_LOW);
		}
	}
}
