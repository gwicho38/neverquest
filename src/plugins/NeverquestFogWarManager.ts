/**
 * @fileoverview Fog of war system for Neverquest
 *
 * This plugin creates a fog of war effect that reveals map areas:
 * - Renders dark overlay covering unexplored areas
 * - Reveals circular area around player position
 * - Persists revealed areas (permanent reveal)
 * - Smooth transition at fog edges
 *
 * Uses RenderTexture for efficient per-pixel fog rendering.
 * Player position is tracked each frame to update revealed areas.
 *
 * Best used in dungeon/cave scenes for exploration feel.
 * Can be disabled for open-world scenes.
 *
 * @see CaveScene - Uses fog of war
 * @see DungeonScene - Uses fog of war
 *
 * @module plugins/NeverquestFogWarManager
 */

import { NumericColors } from '../consts/Colors';
import { Alpha, Depth, Scale } from '../consts/Numbers';

/**
 * Interface for entities trackable by the fog of war system.
 * Only requires container position for fog reveal calculations.
 */
interface IFogTrackable {
	container: {
		x: number;
		y: number;
	};
}

/**
 * @class
 */
export class NeverquestFogWarManager {
	/**
	 * The Phaser Scene
	 */
	private scene: Phaser.Scene;

	/**
	 * The map where the class will get the zone to emit the particles.
	 */
	private map: Phaser.Tilemaps.Tilemap;

	/**
	 * The player that will reveal the fog of war of the map.
	 */
	private player: IFogTrackable;

	/**
	 * This is the fog of war itself. This will be the texture to be used to make the cool
	 * effect of fog of war.
	 */
	private renderTexture: Phaser.GameObjects.RenderTexture | null;

	/**
	 * This is the black layer where it's not explored. This will be the texture to be used to make the cool
	 * effect of fog of war.
	 */
	private noVisionRT: Phaser.GameObjects.RenderTexture | null;

	/**
	 * The mask image to update the fog.
	 */
	private imageMask: Phaser.GameObjects.Image | null;

	/**
	 * The BitMap Mask to follow the player.
	 */
	private mask: Phaser.Display.Masks.BitmapMask | null;

	/**
	 * The name of the mask texture.
	 */
	private maskTextureName: string;

	/**
	 * Last player position for fog update optimization
	 */
	private lastPlayerX: number = 0;
	private lastPlayerY: number = 0;

	/**
	 * Minimum distance player must move before fog updates (in pixels)
	 */
	private fogUpdateThreshold: number = 10;

	/**
	 * Creates a new Fog of War Manager
	 * @param scene The scene in which this fog will be put upon.
	 * @param map The map to cover with the fog of war.
	 * @param player The player that will reveal the map with the mask.
	 */
	constructor(scene: Phaser.Scene, map: Phaser.Tilemaps.Tilemap, player: IFogTrackable) {
		this.scene = scene;
		this.map = map;
		this.player = player;
		this.renderTexture = null;
		this.noVisionRT = null;
		this.imageMask = null;
		this.mask = null;
		this.maskTextureName = 'fog_mask';
	}

	/**
	 * Creates the fog of War for a given map.
	 */
	createFog(): void {
		const width = this.map.widthInPixels;
		const height = this.map.heightInPixels;

		// make a RenderTexture that is the size of the screen
		this.renderTexture = this.scene.make.renderTexture(
			{
				x: 0,
				y: 0,
				width: width,
				height: height,
			},
			true
		);
		// make a RenderTexture that is the size of the screen
		// This RT is the One that Blocks the User Vision.
		this.noVisionRT = this.scene.make.renderTexture(
			{
				x: 0,
				y: 0,
				width: width,
				height: height,
			},
			true
		);

		// fill it with black
		this.renderTexture.fill(NumericColors.BLACK, Alpha.HIGH);
		this.noVisionRT.fill(NumericColors.BLACK, Alpha.OPAQUE);

		// draw the floorLayer into it
		// this.rt.draw(this.shadow);

		// set a dark blue tint
		this.renderTexture.setTint(NumericColors.BLUE_DARK);
		this.noVisionRT.setTint(NumericColors.BLUE_DARK);

		this.renderTexture.depth = Depth.TOP;
		this.noVisionRT.depth = Depth.TOP;

		this.imageMask = this.scene.add.image(this.player.container.x, this.player.container.y, this.maskTextureName);
		this.imageMask.scale = Scale.LARGE;
		this.imageMask.visible = false;

		// this.renderTexture.mask.invertAlpha = true;
	}

	/**
	 * Updates the fog of war.
	 * Only updates if player has moved significantly to avoid expensive operations every frame.
	 */
	updateFog(): void {
		if (!this.player || !this.imageMask) return;

		// Calculate distance player has moved since last fog update
		const dx = this.player.container.x - this.lastPlayerX;
		const dy = this.player.container.y - this.lastPlayerY;
		const distanceMoved = Math.sqrt(dx * dx + dy * dy);

		// Only update fog if player moved beyond threshold
		if (distanceMoved < this.fogUpdateThreshold) {
			return;
		}

		// Update last position
		this.lastPlayerX = this.player.container.x;
		this.lastPlayerY = this.player.container.y;

		// Perform expensive fog update operations
		this.renderTexture!.clear();
		this.renderTexture!.fill(NumericColors.BLACK, Alpha.HIGH);
		this.renderTexture!.setTint(NumericColors.BLUE_DARK);

		this.imageMask.x = this.player.container.x;
		this.imageMask.y = this.player.container.y;
		this.noVisionRT!.erase(this.imageMask);
		// Only erase once - erasing multiple times is wasteful
		this.renderTexture!.erase(this.imageMask);
	}
}
