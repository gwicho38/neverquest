/**
 * @fileoverview Device-based icon texture switching utility
 *
 * This file provides device-responsive texture management:
 * - Changes game object textures based on device type
 * - Used for mobile vs desktop icon differences
 *
 * @see SceneToggleWatcher - Scene visibility management
 *
 * @module scenes/watchers/IconDeviceChange
 */

import Phaser from 'phaser';

/**
 * This class is responsible for changing the icon, based on the current Device
 * @class
 */
export class IconDeviceChange {
	/**
	 * Changes the texture of a game object based on the current device
	 * @param { Phaser.GameObjects.Image } gameObject - The game object whose texture will be changed
	 */
	static changeTexture(gameObject: Phaser.GameObjects.Image): void {
		gameObject.setTexture(gameObject.texture.key);
	}
}
