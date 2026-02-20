/**
 * @fileoverview Tutorial area scene for new player onboarding
 *
 * This scene teaches core game mechanics:
 * - Movement controls
 * - Attack and block mechanics
 * - Item interaction
 * - Dialog system usage
 *
 * Guided experience for first-time players.
 *
 * @see OverworldScene - Destination after tutorial
 * @see NeverquestDialogBox - Tutorial prompts
 *
 * @module scenes/TutorialScene
 */

import Phaser from 'phaser';
import { TilesetImageConfig } from '../models/TilesetImageConfig';
import AnimatedTiles from '../plugins/AnimatedTiles';
import { NeverquestEnvironmentParticles } from '../plugins/NeverquestEnvironmentParticles';
import { NeverquestMapCreator } from '../plugins/NeverquestMapCreator';
import { NeverquestObjectMarker } from '../plugins/NeverquestObjectMarker';
import { NeverquestWarp } from '../plugins/NeverquestWarp';
import { Player } from '../entities/Player';
import { CameraValues } from '../consts/Numbers';

export class TutorialScene extends Phaser.Scene {
	public player!: Player;
	public particles!: NeverquestEnvironmentParticles;

	constructor() {
		super({
			key: 'TutorialScene',
		});
	}

	preload(): void {
		this.load.scenePlugin('animatedTiles', AnimatedTiles, 'animatedTiles', 'animatedTiles');
	}

	create(): void {
		const map = new NeverquestMapCreator(this);
		map.mapName = 'tutorial';
		map.tilesetImages = [
			new TilesetImageConfig('tutorial_tileset_extruded', 'tutorial_tileset'),
			new TilesetImageConfig('collision', 'collision_tile'), // Add these lines to use the Collision tiles.
			new TilesetImageConfig('overworld', 'tiles_overworld'), // Add these lines to use the Overworld Tileset.
			new TilesetImageConfig('inner', 'inner'), // Add this for inner
		];
		map.create();
		this.cameras.main.startFollow(this.player.container);
		this.cameras.main.setZoom(CameraValues.ZOOM_CLOSE);

		// Note: Do not set camera bounds for infinite maps (tutorial uses infinite: true)
		// Infinite maps have negative coordinate chunks and setting bounds would break movement

		// Created Particles
		this.particles = new NeverquestEnvironmentParticles(this, map.map);
		this.particles.create();

		// Dialogs
		this.scene.launch('DialogScene', {
			player: this.player,
			map: map.map,
			scene: this,
		});

		// Markers.
		const interactiveMarkers = new NeverquestObjectMarker(this, map.map);
		interactiveMarkers.create();

		const neverquestWarp = new NeverquestWarp(this, this.player, map.map);
		neverquestWarp.createWarps();
	}

	update(): void {}
}
