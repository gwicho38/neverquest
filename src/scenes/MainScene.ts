import Phaser from 'phaser';
import { NeverquestWarp } from '../plugins/NeverquestWarp';
import { NeverquestObjectMarker } from '../plugins/NeverquestObjectMarker';
import AnimatedTiles from '../plugins/AnimatedTiles';
import { NeverquestEnvironmentParticles } from '../plugins/NeverquestEnvironmentParticles';
import { NeverquestEnemyZones } from '../plugins/NeverquestEnemyZones';
import { NeverquestMapCreator } from '../plugins/NeverquestMapCreator';
import { NeverquestSaveManager } from '../plugins/NeverquestSaveManager';

export class MainScene extends Phaser.Scene {
	player: any;
	mapCreator: NeverquestMapCreator | null;
	map: Phaser.Tilemaps.Tilemap | null;
	joystickScene: Phaser.Scene | null;
	particles: NeverquestEnvironmentParticles | null;
	themeSound: Phaser.Sound.BaseSound | null;
	enemies: any[];
	neverquestEnemyZones: NeverquestEnemyZones | null;
	saveManager: NeverquestSaveManager | null;
	upsideDownPortal: Phaser.GameObjects.Zone | null;
	upsideDownPortalParticles: Phaser.GameObjects.Particles.ParticleEmitter | null;

	constructor() {
		super({
			key: 'MainScene',
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
		this.upsideDownPortal = null;
		this.upsideDownPortalParticles = null;
	}

	init(data: { fromUpsideDown?: boolean }): void {
		// Handle return from Upside Down with a flash effect
		if (data && data.fromUpsideDown) {
			this.cameras.main.once('camerafadeincomplete', () => {
				this.cameras.main.flash(500, 200, 200, 255, false);
			});
		}
	}

	preload(): void {
		this.load.scenePlugin('animatedTiles', AnimatedTiles, 'animatedTiles', 'animatedTiles');
	}

	create(): void {
		// if (
		//     !this.scale.isFullscreen && !this.sys.game.device.os.desktop
		//         ? true
		//         : false
		// ) {
		//     this.scale.startFullscreen();
		// }

		this.cameras.main.setZoom(2.5);

		this.mapCreator = new NeverquestMapCreator(this);
		this.mapCreator.create();

		// Store map reference for other systems
		this.map = this.mapCreator.map;

		const camera = this.cameras.main;
		camera.startFollow(this.player.container);

		// Note: Do not set camera bounds for infinite maps (larus uses infinite: true)
		// Infinite maps have negative coordinate chunks and setting bounds would break movement

		const neverquestWarp = new NeverquestWarp(this, this.player, this.mapCreator.map);
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

		(this.sys as any).animatedTiles.init(this.mapCreator.map);
		this.particles = new NeverquestEnvironmentParticles(this, this.mapCreator.map);
		this.particles.create();

		// this.outlineEffect = new NeverquestOutlineEffect(this);

		this.sound.volume = 0.35;
		this.themeSound = this.sound.add('path_to_lake_land', {
			loop: true,
		});
		this.themeSound.play();

		this.enemies = [];

		this.neverquestEnemyZones = new NeverquestEnemyZones(this, this.mapCreator.map);
		this.neverquestEnemyZones.create();

		this.saveManager = new NeverquestSaveManager(this);
		this.saveManager.create();

		// Create the Upside Down portal
		// this.createUpsideDownPortal();

		this.setupSaveKeybinds();

		// new Item(this, this.player.container.x, this.player.container.y - 40, 2);
		// new Item(this, this.player.container.x, this.player.container.y - 50, 2);
		// new Item(this, this.player.container.x, this.player.container.y - 60, 1);
	}

	stopSceneMusic(): void {
		this.themeSound!.stop();
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
					this.saveManager!.showSaveNotification('No checkpoint found', true);
				}
			}
			// Debug: Manual auto-save trigger with F6
			if (event.key === 'F6') {
				event.preventDefault();
				this.saveManager!.createCheckpoint();
			}
		});
	}

	update(): void {
		// this.outlineEffect.removeEffect(this.player.container);
		// this.physics.overlap(
		//     this.player,
		//     this.overplayer_layer,
		//     () => {
		//         this.outlineEffect.applyEffect(this.player.container);
		//     },
		//     (hitZone, tile) => tile.index > -1
		// );
	}

	/**
	 * Create the portal to the Upside Down World
	 */
	private createUpsideDownPortal(): void {
		// Position the portal in an interesting location
		const portalX = 250;
		const portalY = 200;

		// Create portal zone for collision detection
		this.upsideDownPortal = this.add.zone(portalX, portalY, 60, 80);
		this.physics.add.existing(this.upsideDownPortal);

		// Create mysterious portal particles
		this.upsideDownPortalParticles = this.add.particles(portalX, portalY, 'particle_warp', {
			speed: { min: 30, max: 70 },
			scale: { start: 1.2, end: 0 },
			alpha: { start: 0.7, end: 0 },
			lifespan: 1500,
			frequency: 15,
			tint: [0x4a0080, 0x0000ff, 0x8000ff],
			blendMode: 'ADD',
			radial: true,
			angle: { min: 0, max: 360 },
			emitZone: {
				type: 'edge',
				source: new Phaser.Geom.Ellipse(0, 0, 35, 55),
				quantity: 15,
			},
		});
		this.upsideDownPortalParticles.setDepth(500);

		// Add dark portal center
		const portalCore = this.add.ellipse(portalX, portalY, 40, 60, 0x000020, 0.5);
		portalCore.setDepth(499);

		// Pulsing effect for the portal
		this.tweens.add({
			targets: portalCore,
			scaleX: 1.3,
			scaleY: 1.3,
			alpha: 0.7,
			duration: 2000,
			yoyo: true,
			repeat: -1,
			ease: 'Sine.easeInOut',
		});

		// Add mysterious energy lines
		const energyLines = this.add.graphics();
		energyLines.lineStyle(2, 0x4a0080, 0.5);
		energyLines.setDepth(498);

		// Draw energy lines emanating from portal
		for (let i = 0; i < 8; i++) {
			const angle = (i / 8) * Math.PI * 2;
			const startX = portalX + Math.cos(angle) * 20;
			const startY = portalY + Math.sin(angle) * 30;
			const endX = portalX + Math.cos(angle) * 50;
			const endY = portalY + Math.sin(angle) * 70;

			energyLines.beginPath();
			energyLines.moveTo(startX, startY);
			energyLines.lineTo(endX, endY);
			energyLines.strokePath();
		}

		// Animate energy lines
		this.tweens.add({
			targets: energyLines,
			alpha: { from: 0.3, to: 0.8 },
			duration: 1500,
			yoyo: true,
			repeat: -1,
			ease: 'Power1',
		});

		// Add floating text hint
		const portalText = this.add.text(portalX, portalY - 70, 'Strange Portal', {
			fontSize: '10px',
			fontFamily: '"Press Start 2P"',
			color: '#b090ff',
			stroke: '#000000',
			strokeThickness: 2,
		});
		portalText.setOrigin(0.5, 0.5);
		portalText.setDepth(501);

		// Floating animation for text
		this.tweens.add({
			targets: portalText,
			y: portalY - 75,
			alpha: { from: 0.6, to: 1 },
			duration: 2500,
			yoyo: true,
			repeat: -1,
			ease: 'Sine.easeInOut',
		});

		// Setup collision detection
		if (this.player && this.upsideDownPortal) {
			this.physics.add.overlap(
				this.player.container,
				this.upsideDownPortal,
				() => this.handlePortalEntry(),
				undefined,
				this
			);
		}

		// Add occasional spark effect
		this.time.addEvent({
			delay: 3000,
			callback: () => {
				if (this.upsideDownPortalParticles) {
					// Burst of particles
					this.upsideDownPortalParticles.explode(10, portalX, portalY);
				}
			},
			loop: true,
		});
	}

	/**
	 * Handle entering the Upside Down portal
	 */
	private handlePortalEntry(): void {
		// Prevent multiple activations
		if (this.upsideDownPortal) {
			this.upsideDownPortal.destroy();
			this.upsideDownPortal = null;
		}

		// Portal activation sound
		const portalSound = this.sound.add('start_game', { volume: 0.6 });
		portalSound.play();

		// Add whoosh or electrical sound if available
		if (this.sound.get('electric_shock')) {
			const electricSound = this.sound.add('electric_shock', { volume: 0.3 });
			electricSound.play();
		}

		// Dark fade with purple tint
		this.cameras.main.fadeOut(300, 30, 0, 50);

		// Distortion effect
		this.tweens.add({
			targets: this.cameras.main,
			zoom: 3,
			rotation: -0.05,
			duration: 300,
			ease: 'Power2',
		});

		this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
			// Transition to Upside Down
			this.scene.start('UpsideDownScene', {
				previousScene: 'MainScene',
			});

			// Stop this scene
			this.stopSceneMusic();

			// Stop UI scenes (they will be restarted by UpsideDownScene)
			this.scene.stop('DialogScene');
			this.scene.stop('HUDScene');

			if (this.player) {
				this.player.destroy();
			}

			this.scene.stop();
		});
	}
}
