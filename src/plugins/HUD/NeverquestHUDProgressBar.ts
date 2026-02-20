/**
 * @fileoverview HUD progress bars for health and experience display
 *
 * This plugin renders HP and XP bars in the heads-up display:
 * - Health bar with color gradient (green → yellow → red)
 * - Experience bar showing progress to next level
 * - Smooth transition animations
 * - Positioned in viewport corner
 *
 * Updates automatically when player takes damage or gains XP.
 *
 * @see HUDScene - Parent scene for HUD elements
 * @see Player - Data source for health/XP values
 *
 * @module plugins/HUD/NeverquestHUDProgressBar
 */

import Phaser from 'phaser';

/**
 * Interface for entities that can be tracked by the HUD progress bar.
 * Requires access to health and experience attributes.
 */
interface IProgressBarPlayer {
	attributes: {
		health: number;
		baseHealth: number;
		experience: number;
		nextLevelExperience: number;
	};
	neverquestHUDProgressBar: NeverquestHUDProgressBar | null;
}

/**
 * This class is responsible for Creating the HP and SP Bars on the HUD system.
 * @class
 */
export class NeverquestHUDProgressBar {
	/**
	 * Scene Context.
	 */
	scene: Phaser.Scene;

	/**
	 * The player that this progressbar will represent.
	 */
	player: IProgressBarPlayer;

	/**
	 * The asset name of the green health bar.
	 * @default
	 */
	greenBarSpriteName: string = 'green_bar';

	/**
	 * The asset name of the yellow health bar.
	 * @default
	 */
	yellowBarSpriteName: string = 'yellow_bar';

	/**
	 * The asset name of the red health bar.
	 * @default
	 */
	redBarSpriteName: string = 'red_bar';

	/**
	 * The asset name of the blue sp bar.
	 * @default
	 */
	blueBarSpriteName: string = 'blue_bar';

	/**
	 * The asset name of the blue exp bar.
	 * @default
	 */
	expBlueBarSpriteName: string = 'exp_blue_bar';

	/**
	 * The asset name of the background of Health and SP Bars.
	 * @default
	 */
	progressBarBackgroundSpriteName: string = 'progressbar_background';

	healthbar_background: Phaser.GameObjects.Image;
	healthbar_sprite: Phaser.GameObjects.Image;
	spbar_background: Phaser.GameObjects.Image;
	spbar_sprite: Phaser.GameObjects.Image;
	expbar_background: Phaser.GameObjects.Image;
	expbar_sprite: Phaser.GameObjects.Image & { widthExtended?: number };

	/**
	 * The current health points.
	 */
	health: number | null = null;

	/**
	 * Creates HP and SP Bars on the HUD system.
	 * @param scene Scene context
	 * @param x X Position on the Screen that will be the reference for HP and SP to be created. All following positions will come from references from this ones.
	 * @param y y Position on the Screen that will be the reference for HP and SP to be created. All following positions will come from references from this ones.
	 * @param width The width of the Bars.
	 * @param player The player that will have it's statuses shown.
	 */
	constructor(scene: Phaser.Scene, x: number, y: number, width: number, player: IProgressBarPlayer) {
		this.scene = scene;
		this.player = player;

		this.healthbar_background = this.scene.add
			.image(x + width / 2 + 15, y, this.progressBarBackgroundSpriteName)
			.setOrigin(0, 0.5);

		this.healthbar_sprite = this.scene.add.image(x + width / 2 + 20, y, this.greenBarSpriteName).setOrigin(0, 0.5);

		this.spbar_background = this.scene.add
			.image(x + width / 2 + 15, y + 20, this.progressBarBackgroundSpriteName)
			.setOrigin(0, 0.5);

		this.spbar_sprite = this.scene.add.image(x + width / 2 + 20, y + 20, this.blueBarSpriteName).setOrigin(0, 0.5);

		this.expbar_background = this.scene.add
			.image(x - 10, y + 40, this.progressBarBackgroundSpriteName)
			.setOrigin(0, 0.5);
		this.expbar_background.setDisplaySize(
			this.expbar_background.width + width / 2 + 25,
			this.expbar_background.height
		);
		this.expbar_sprite = this.scene.add.image(x - 5, y + 40, this.expBlueBarSpriteName).setOrigin(0, 0.5);
		this.expbar_sprite.widthExtended = (this.expbar_background.width - 8) * this.expbar_background.scaleX;
		this.expbar_sprite.setDisplaySize(
			(this.expbar_background.width - 8) * this.expbar_background.scaleX,
			this.expbar_sprite.height
		);

		// Sets the progressbar to the player, on creation.
		this.player.neverquestHUDProgressBar = this;

		// Use the scene passed to constructor, not player.scene
		this.scene.events.on('update', this.updateHud, this);
	}

	/**
	 * Updates the HUD Health bar based on the current player's Health.
	 */
	updateHealth(): void {
		const HP_percentage = (this.player.attributes.health / this.player.attributes.baseHealth) * 100;
		if (HP_percentage > 40) {
			this.healthbar_sprite.setTexture(this.greenBarSpriteName);
		} else if (HP_percentage >= 20 && HP_percentage <= 40) {
			this.healthbar_sprite.setTexture(this.yellowBarSpriteName);
		} else if (HP_percentage < 20) {
			this.healthbar_sprite.setTexture(this.redBarSpriteName);
		} else {
			this.healthbar_sprite.visible = false;
			this.healthbar_sprite.active = false;
		}

		this.healthbar_sprite.scaleX = HP_percentage / 100;
	}

	updateHud(): void {
		this.updateExp();
	}

	/**
	 * Updates the current Exp of the player.
	 */
	updateExp(): void {
		const exp_percentage = (this.player.attributes.experience / this.player.attributes.nextLevelExperience) * 100;
		this.expbar_sprite.setDisplaySize(
			this.expbar_sprite.widthExtended! * (exp_percentage / 100),
			this.expbar_sprite.height
		);
	}
}
