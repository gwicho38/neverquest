import Phaser from 'phaser';
import { NeverquestWarp } from '../plugins/NeverquestWarp';
import { NeverquestObjectMarker } from '../plugins/NeverquestObjectMarker';
import AnimatedTiles from '../plugins/AnimatedTiles';
import { NeverquestEnvironmentParticles } from '../plugins/NeverquestEnvironmentParticles';
import { NeverquestEnemyZones } from '../plugins/NeverquestEnemyZones';
import { NeverquestMapCreator } from '../plugins/NeverquestMapCreator';
import { NeverquestSaveManager } from '../plugins/NeverquestSaveManager';
import { CameraValues, Alpha } from '../consts/Numbers';
import { SaveMessages } from '../consts/Messages';

export class TownScene extends Phaser.Scene {
	player: any;
	mapCreator: NeverquestMapCreator | null;
	map: Phaser.Tilemaps.Tilemap | null;
	joystickScene: Phaser.Scene | null;
	particles: NeverquestEnvironmentParticles | null;
	themeSound: Phaser.Sound.BaseSound | null;
	enemies: any[];
	neverquestEnemyZones: NeverquestEnemyZones | null;
	saveManager: NeverquestSaveManager | null;

	constructor() {
		super({
			key: 'TownScene',
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
	}

	preload(): void {
		this.load.scenePlugin('animatedTiles', AnimatedTiles, 'animatedTiles', 'animatedTiles');
	}

	create(): void {
		this.cameras.main.setZoom(CameraValues.ZOOM_CLOSE);

		this.mapCreator = new NeverquestMapCreator(this, 'town');
		this.mapCreator.create();

		// Store map reference for other systems
		this.map = this.mapCreator.map;

		const camera = this.cameras.main;
		camera.startFollow(this.player.container);

		// Set camera bounds to match the map size so camera doesn't go beyond the map edges
		camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

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

		this.sound.volume = Alpha.MEDIUM_LIGHT;
		this.themeSound = this.sound.add('path_to_lake_land', {
			loop: true,
		});
		this.themeSound.play();

		this.enemies = [];

		this.neverquestEnemyZones = new NeverquestEnemyZones(this, this.mapCreator.map);
		this.neverquestEnemyZones.create();

		this.saveManager = new NeverquestSaveManager(this);
		this.saveManager.create();
		this.setupSaveKeybinds();
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
		// Town-specific update logic can be added here
	}
}
