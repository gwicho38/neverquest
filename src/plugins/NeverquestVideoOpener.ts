/**
 * @fileoverview Video playback trigger for Neverquest
 *
 * This plugin handles video playback from Tiled map triggers:
 * - Reads videoId properties from Tiled objects
 * - Opens VideoPlayerScene with specified video
 * - Supports YouTube video embedding via rex plugins
 *
 * Video trigger configuration (in Tiled):
 * - videoId: YouTube video ID or local video key
 *
 * Used for cutscenes, story moments, and tutorials.
 *
 * @see VideoPlayerScene - Renders the video
 * @see NeverquestTiledInfoBox - Similar trigger pattern
 *
 * @module plugins/NeverquestVideoOpener
 */

import { IGameScene } from '../types/SceneTypes';

/**
 * Property interface for Tiled object properties
 */
interface TiledProperty {
	name: string;
	value: string | number | boolean;
}

/**
 * Class responsible to open a video.
 * @class
 */
export class NeverquestVideoOpener {
	/**
	 * The Phaser Scene that this class will be a child.
	 */
	private scene: IGameScene;

	/**
	 * Video id property to search for in the Tiled properties.
	 */
	private videoIdProperty: string;

	/**
	 * Gets the video link from the Tile object properties.
	 * @param scene Scene that this Instance will be a child.
	 */
	constructor(scene: IGameScene) {
		this.scene = scene;
		this.videoIdProperty = 'videoId';
	}

	/**
	 * Searches for a specific property on an array of properties from the Tiled Software.
	 * @param properties the properties array to check if there is a video link.
	 */
	checkHasVideo(properties: TiledProperty[]): void {
		const video = properties.find((p) => p.name === this.videoIdProperty);
		if (video && video.name) {
			this.scene.scene.launch('VideoPlayerScene', {
				player: this.scene.player,
				videoId: video.value,
			});
		}
	}
}
