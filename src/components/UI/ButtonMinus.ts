/**
 * @fileoverview Interactive minus button for attribute allocation
 *
 * This file provides a clickable minus button sprite:
 * - Animated button press feedback
 * - Executes named action via NeverquestUtils.executeFunctionByName
 * - Used in AttributeScene for stat point deallocation
 *
 * @see ButtonPlus - Corresponding plus button
 * @see AttributeScene - Primary usage context
 *
 * @module components/UI/ButtonMinus
 */

import { NeverquestUtils } from '../../utils/NeverquestUtils';

/**
 * Interface for button action arguments
 * The args are passed through to executeFunctionByName
 */
export type ButtonActionArgs = unknown;

export class ButtonMinus extends Phaser.GameObjects.Sprite {
	scene: Phaser.Scene;

	constructor(scene: Phaser.Scene, x: number, y: number, action: string, args: ButtonActionArgs) {
		super(scene, x, y, 'minus_small_button');

		/**
		 * @type { Phaser.Scene }
		 */
		this.scene = scene;

		this.scene.add.existing(this);
		this.setInteractive();
		this.on('pointerdown', (_pointer: Phaser.Input.Pointer) => {
			NeverquestUtils.executeFunctionByName(action, scene, args);
			this.play({ key: 'touch_button_minus' }).once(
				Phaser.Animations.Events.ANIMATION_COMPLETE,
				(_animationState: Phaser.Animations.AnimationState, _frame: Phaser.Animations.AnimationFrame) => {
					if (this.anims.currentAnim?.key === `touch_button_minus`) {
						this.play('init_button_minus');
					}
				}
			);
		});
	}
}
