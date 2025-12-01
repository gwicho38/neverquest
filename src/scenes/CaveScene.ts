import Phaser from 'phaser';
import { NeverquestWarp } from '../plugins/NeverquestWarp';
import { NeverquestObjectMarker } from '../plugins/NeverquestObjectMarker';
import AnimatedTiles from '../plugins/AnimatedTiles';
import { NeverquestEnvironmentParticles } from '../plugins/NeverquestEnvironmentParticles';
import { NeverquestEnemyZones } from '../plugins/NeverquestEnemyZones';
import { NeverquestMapCreator } from '../plugins/NeverquestMapCreator';
import { NeverquestSaveManager } from '../plugins/NeverquestSaveManager';
import { Player } from '../entities/Player';
import { IGameScene } from '../types/SceneTypes';
import { CameraValues, Alpha } from '../consts/Numbers';
import { SaveMessages } from '../consts/Messages';

export class CaveScene extends Phaser.Scene implements IGameScene {
	public player: Player | null = null;
	public map?: Phaser.Tilemaps.Tilemap;
	public mapCreator?: NeverquestMapCreator;
	public joystickScene: any;
	public particles!: NeverquestEnvironmentParticles;
	public themeSound!: Phaser.Sound.BaseSound;
	public enemies: any[] = [];
	public neverquestEnemyZones!: NeverquestEnemyZones;
	public saveManager!: NeverquestSaveManager;

	constructor() {
		super({
			key: 'CaveScene',
		});
	}

	preload(): void {
		this.load.scenePlugin('animatedTiles', AnimatedTiles, 'animatedTiles', 'animatedTiles');
	}

	create(): void {
		this.cameras.main.setZoom(CameraValues.ZOOM_CLOSE);

		this.mapCreator = new NeverquestMapCreator(this, 'cave_dungeon');
		this.mapCreator.create();

		// Store map reference for other systems
		this.map = this.mapCreator.map;

		const camera = this.cameras.main;
		camera.startFollow(this.player!.container);

		// Set camera bounds to match the map size so camera doesn't go beyond the map edges
		camera.setBounds(0, 0, this.map!.widthInPixels, this.map!.heightInPixels);

		const neverquestWarp = new NeverquestWarp(this as any, this.player! as any, this.mapCreator.map);
		neverquestWarp.createWarps();
		const interactiveMarkers = new NeverquestObjectMarker(this, this.mapCreator.map);
		interactiveMarkers.create();

		this.scene.launch('DialogScene', {
			player: this.player,
			map: this.mapCreator.map,
			scene: this,
		});

		this.joystickScene = this.scene.get('JoystickScene');

		this.scene.launch('HUDScene', { player: this.player, map: this.mapCreator!.map });

		(this.sys as any).animatedTiles.init(this.mapCreator.map);
		this.particles = new NeverquestEnvironmentParticles(this, this.mapCreator.map);
		this.particles.create();

		this.sound.volume = Alpha.MEDIUM_LIGHT;
		this.themeSound = this.sound.add('dungeon_ambient', {
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
					this.saveManager.showSaveNotification(SaveMessages.NO_CHECKPOINT_FOUND, true);
				}
			}
		});
	}

	stopSceneMusic(): void {
		this.themeSound.stop();
	}

	update(): void {
		// Cave-specific update logic can be added here
	}
}
