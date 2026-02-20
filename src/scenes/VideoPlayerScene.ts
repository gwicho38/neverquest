/**
 * @fileoverview Video playback scene for cutscenes
 *
 * This scene handles video playback for:
 * - Story cutscenes
 * - Tutorial videos
 * - YouTube embedded content (via RexUI)
 *
 * Pauses audio from other scenes during playback.
 * Supports skipping via input.
 *
 * @see NeverquestVideoOpener - Triggers video playback
 * @see NeverquestSoundManager - Audio muting during video
 *
 * @module scenes/VideoPlayerScene
 */

import Phaser from 'phaser';
import { NeverquestSoundManager } from '../plugins/NeverquestSoundManager';
import { NumericColors } from '../consts/Colors';
import { Alpha } from '../consts/Numbers';
import { IResizeSize } from '../types';

/**
 * Interface for RexUI YouTube player game object
 */
interface IRexYoutubePlayer extends Phaser.GameObjects.GameObject {
	x: number;
	y: number;
	play: () => void;
}

/**
 * Interface for game factory with RexUI YouTube player
 */
interface IGameFactoryWithYoutube extends Phaser.GameObjects.GameObjectFactory {
	rexYoutubePlayer: (
		x: number,
		y: number,
		width: number,
		height: number,
		config: { videoId: string; controls: boolean; autoPlay: boolean }
	) => IRexYoutubePlayer;
}

/**
 * Interface for player reference with container body
 * Uses minimal body interface for mock compatibility
 */
interface IVideoScenePlayer {
	container: {
		body: { maxSpeed: number } | null;
	};
	speed: number;
}

/**
 * Interface for scene init data
 */
interface IVideoPlayerSceneData {
	videoId: string;
	player?: IVideoScenePlayer;
}

export class VideoPlayerScene extends Phaser.Scene {
	background: Phaser.GameObjects.RenderTexture | null;
	backgroundColor: number;
	alpha: number;
	video: IRexYoutubePlayer | null;
	closeButton: Phaser.GameObjects.Image | null;
	videoId: string;
	closeButtonSpriteName: string;
	closeButtonScale: number;
	closeButtonMarginX: number;
	closeButtonMarginY: number;
	neverquestSoundManager: NeverquestSoundManager | null;
	player: IVideoScenePlayer | null;

	constructor() {
		super({
			key: 'VideoPlayerScene',
		});

		this.background = null;
		this.backgroundColor = NumericColors.BLACK;
		this.alpha = 0.5;
		this.video = null;
		this.closeButton = null;
		this.videoId = '';
		this.closeButtonSpriteName = 'close_button';
		this.closeButtonScale = Alpha.LIGHT;
		this.closeButtonMarginX = 50;
		this.closeButtonMarginY = 30;
		this.neverquestSoundManager = null;
		this.player = null;
	}

	preload(): void {
		this.neverquestSoundManager = new NeverquestSoundManager(this);
		this.neverquestSoundManager.create();
		this.neverquestSoundManager.stopAllAudio();
	}

	create(): void {
		this.background = this.add.renderTexture(0, 0, this.cameras.main.width, this.cameras.main.height);
		this.background.setScrollFactor(0, 0);
		this.background.fill(this.backgroundColor, this.alpha);
		this.video = (this.add as IGameFactoryWithYoutube).rexYoutubePlayer(
			this.cameras.main.midPoint.x,
			this.cameras.main.midPoint.y,
			this.cameras.main.width - this.closeButtonMarginX * 4,
			this.cameras.main.height - this.closeButtonMarginY * 4,
			{
				videoId: this.videoId,
				controls: true,
				autoPlay: true,
			}
		);
		// youtubePlayer.setOrigin(0, 0);
		this.video.play();
		this.createCloseButton();

		this.scale.on('resize', (size: IResizeSize) => {
			this.changeSize(size.width, size.height);
		});
	}

	init(data: IVideoPlayerSceneData): void {
		this.videoId = data.videoId;
		this.player = data.player ?? null;
		if (this.player && this.player.container.body) this.player.container.body.maxSpeed = 0;
	}

	createCloseButton(): void {
		if (this.cameras.main !== undefined) {
			this.closeButton = this.add
				.image(
					this.cameras.main.width - this.closeButtonMarginX,
					this.closeButtonMarginY,
					this.closeButtonSpriteName
				)
				.setInteractive()
				.setScale(this.closeButtonScale)
				.setScrollFactor(0, 0)
				.setDepth(50);

			// Closes the Video Scene when the player clicks the Close button.
			this.closeButton.on('pointerdown', () => {
				// Just to make sure everything works if thereis no player.
				if (this.player && this.player.container.body) this.player.container.body.maxSpeed = this.player.speed;
				this.neverquestSoundManager!.resumeAllAudio();
				this.scene.stop();
			});
		}
	}

	changeSize(_width?: number, _height?: number): void {
		if (this.cameras.main) {
			this.closeButton!.destroy();
			this.createCloseButton();
			this.video.x = this.cameras.main.midPoint.x;
			this.video.y = this.cameras.main.midPoint.y;
			this.background!.destroy();
			this.background = this.add.renderTexture(0, 0, this.cameras.main.width, this.cameras.main.height);
			this.background.setScrollFactor(0, 0);
			this.background.fill(this.backgroundColor, this.alpha);
		}
	}
}
