/**
 * @fileoverview Asset preloading scene for Neverquest
 *
 * This scene handles loading all game assets:
 * - Images and sprites
 * - Tilemaps and tilesets
 * - Audio files (music and SFX)
 * - Sprite atlases and animations
 * - Custom fonts (WebFont loader)
 *
 * Displays loading progress bar and percentage.
 * Transitions to MainMenuScene when complete.
 *
 * Asset configuration comes from GameAssets.ts.
 *
 * @see GameAssets - Asset configuration constants
 * @see MainMenuScene - Next scene after load
 * @see Animations - Animation definitions
 *
 * @module scenes/PreloadScene
 */

import Phaser from 'phaser';
import { Animations } from '../consts/Animations';
import {
	ASEPRITE_CONFIG,
	AtlasConfig,
	Images,
	NeverquestAudios,
	TilemapConfig,
	IImageAsset,
	ITilemapAsset,
	IAudioAsset,
	IAtlasAsset,
	IAsepriteAsset,
} from '../consts/GameAssets';
import { IPreloadScene } from '../types/SceneTypes';
import { IAnimationConfig, IResizeSize } from '../types';
import { HexColors, NumericColors } from '../consts/Colors';
import { Alpha, FontStyles } from '../consts/Numbers';
import { FontFamily, UILabels } from '../consts/Messages';

/**
 * Interface for WebFont loader library
 */
interface IWebFontLoader {
	load: (config: { google: { families: string[] }; active: () => void }) => void;
}

export class PreloadScene extends Phaser.Scene implements IPreloadScene {
	public progressBar: Phaser.GameObjects.Graphics | null = null;
	public progressBox: Phaser.GameObjects.Graphics | null = null;
	public cameraWidth: number = 0;
	public cameraHeight: number = 0;
	public loadingText: Phaser.GameObjects.Text | null = null;
	public percentText: Phaser.GameObjects.Text | null = null;
	public currentValue: number = 0;
	public boxStartingX: number = 10;
	public boxHeight: number = 50;
	public boxPadding: number = 30;
	public boxMargin: number = 30;
	public barHeight: number = 30;
	public barStartingX: number = 20;
	public barMargin: number = 40;

	constructor() {
		super({
			key: 'PreloadScene',
		});
	}

	public preload(): void {
		// Images
		Images.forEach((values: IImageAsset) => {
			this.load.image(values.name, values.image);
		});

		// Tilemap
		TilemapConfig.forEach((value: ITilemapAsset) => {
			this.load.tilemapTiledJSON(value.name, value.json);
		});

		// Scripts
		this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');

		// Sound
		NeverquestAudios.forEach((value: IAudioAsset) => {
			this.load.audio(value.name, value.audio);
		});

		// Atlas
		AtlasConfig.forEach((value: IAtlasAsset) => {
			this.load.atlas(value.name, value.image, value.json);
		});

		ASEPRITE_CONFIG.forEach((aseprite: IAsepriteAsset) => {
			this.load.aseprite(aseprite.name, aseprite.image, aseprite.json);
		});

		this.progressBar = this.add.graphics();
		this.progressBox = this.add.graphics();
		this.cameraWidth = this.cameras.main.width;
		this.cameraHeight = this.cameras.main.height;

		this.progressBox.fillStyle(NumericColors.GRAY_VERY_DARK, Alpha.VERY_HIGH);
		this.progressBox.fillRect(
			this.boxStartingX,
			this.cameraHeight / 2 + this.boxMargin,
			this.cameraWidth - this.boxPadding,
			this.boxHeight
		);

		this.loadingText = this.make.text({
			x: this.cameraWidth / 2,
			y: this.cameraHeight / 2 - this.boxHeight,
			text: UILabels.LOADING_TEXT,
			style: {
				font: FontStyles.PRELOAD_LOADING,
				color: HexColors.WHITE,
			},
		});
		this.loadingText.setOrigin(0.5, 0.5);

		this.percentText = this.make.text({
			x: this.cameraWidth / 2,
			y: this.cameraHeight / 2 - 5,
			text: '0%',
			style: {
				font: FontStyles.PRELOAD_PERCENT,
				color: HexColors.WHITE,
			},
		});
		this.percentText.setOrigin(0.5, 0.5);

		this.load.on('progress', (value: number) => {
			this.currentValue = value;
			this.percentText!.setText(parseInt((value * 100).toString()) + '%');
			this.progressBar!.clear();
			this.progressBar!.fillStyle(NumericColors.WHITE, 1);
			this.progressBar!.fillRect(
				this.barStartingX,
				this.cameraHeight / 2 + this.barMargin,
				(this.cameraWidth - this.boxHeight) * value,
				this.barHeight
			);
		});

		this.load.on('complete', () => {
			this.progressBar!.destroy();
			this.progressBox!.destroy();
			this.loadingText!.destroy();
			this.percentText!.destroy();
		});

		this.scale.on('resize', (size: IResizeSize) => {
			this.resize(size);
		});
	}

	public resize(size: IResizeSize): void {
		if (size) {
			this.cameraWidth = size.width;
			this.cameraHeight = size.height;

			this.loadingText!.setPosition(this.cameraWidth / 2, this.cameraHeight / 2 - this.boxHeight);
			this.percentText!.setPosition(this.cameraWidth / 2, this.cameraHeight / 2 - 5);

			this.progressBox!.clear();
			this.progressBox!.fillStyle(NumericColors.GRAY_VERY_DARK, Alpha.VERY_HIGH);
			this.progressBox!.fillRect(
				this.boxStartingX,
				this.cameraHeight / 2 + this.boxMargin,
				this.cameraWidth - this.boxPadding,
				this.boxHeight
			);
			this.progressBar!.clear();
			this.progressBar!.fillStyle(NumericColors.WHITE, 1);
			this.progressBar!.fillRect(
				this.barStartingX,
				this.cameraHeight / 2 + this.barMargin,
				(this.cameraWidth - this.boxHeight) * this.currentValue,
				this.barHeight
			);
		}
	}

	public create(): void {
		Animations.forEach((animation: IAnimationConfig) => {
			this.anims.create({
				key: animation.key,
				frameRate: animation.frameRate,
				frames: this.anims.generateFrameNames(animation.atlas, {
					prefix: animation.prefix,
					start: animation.start,
					end: animation.end,
					zeroPad: animation.zeroPad,
				}),
				repeat: animation.repeat,
			});
		});

		ASEPRITE_CONFIG.forEach((aseprite: IAsepriteAsset) => {
			this.anims.createFromAseprite(aseprite.name);
		});

		// Web Fonts
		(window as unknown as { WebFont: IWebFontLoader }).WebFont.load({
			google: {
				families: [FontFamily.PIXEL],
			},
			active: () => {
				this.scene.start('IntroScene');
			},
		});
	}
}
