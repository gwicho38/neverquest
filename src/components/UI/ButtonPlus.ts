/**
 * @fileoverview Interactive plus button for attribute allocation
 *
 * This file provides a clickable plus button sprite:
 * - Animated button press feedback
 * - Executes named action via NeverquestUtils.executeFunctionByName
 * - Used in AttributeScene for stat point allocation
 *
 * @see ButtonMinus - Corresponding minus button
 * @see AttributeScene - Primary usage context
 *
 * @module components/UI/ButtonPlus
 */

import { NeverquestUtils } from '../../utils/NeverquestUtils';

/**
 * Interface for button action arguments
 * The args are passed through to executeFunctionByName
 */
export type ButtonActionArgs = unknown;

export class ButtonPlus extends Phaser.GameObjects.Sprite {
	scene: Phaser.Scene;

	constructor(scene: Phaser.Scene, x: number, y: number, action: string, args: ButtonActionArgs) {
		super(scene, x, y, 'plus_small_button');

		/**
		 * @type { Phaser.Scene }
		 */
		this.scene = scene;

		this.scene.add.existing(this);
		this.setInteractive();
		this.on('pointerdown', (_pointer: Phaser.Input.Pointer) => {
			NeverquestUtils.executeFunctionByName(action, scene, args);
			this.play({ key: 'touch_button_plus' }).once(
				Phaser.Animations.Events.ANIMATION_COMPLETE,
				(_animationState: Phaser.Animations.AnimationState, _frame: Phaser.Animations.AnimationFrame) => {
					if (this.anims.currentAnim?.key === `touch_button_plus`) {
						this.play('init_button_plus');
					}
				}
			);
		});
	}
}
