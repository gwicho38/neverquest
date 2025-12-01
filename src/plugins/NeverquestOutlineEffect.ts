import OutlinePostFx from 'phaser3-rex-plugins/plugins/outlinepipeline.js';
import { NumericColors } from '../consts/Colors';

/**
 * @class
 */
export class NeverquestOutlineEffect {
	/**
	 * The scene in which the outline will be applyed.
	 */
	scene: Phaser.Scene;

	/**
	 * The post processing layer that will present the outline effect.
	 */
	effectLayer: any | null = null;

	/**
	 * the color of the outline.
	 * @default
	 */
	outlineColor: number = NumericColors.RED;

	/**
	 * The outline Thickness. The bigger the number, the bigger the thickness.
	 */
	outlineThickness: number = 3;

	outlinePostFxPlugin: any;

	/**
	 * Creates an outline effect to a given object.
	 * @param scene Scene context
	 */
	constructor(scene: Phaser.Scene) {
		this.scene = scene;
		this.outlinePostFxPlugin = this.scene.plugins.get('rexOutlinePipeline');
	}

	/**
	 * Applies the effect to a Game Object.
	 * @param object Game object to apply outline to
	 */
	applyEffect(object: Phaser.GameObjects.GameObject): void {
		if (object && object.scene && object.scene.sys) {
			(object as any).setPostPipeline(OutlinePostFx);
			const pipelineInstance = this.outlinePostFxPlugin.get(object)[0];
			pipelineInstance.setOutlineColor(this.outlineColor);
			pipelineInstance.thickness = this.outlineThickness;
		}
	}

	/**
	 * Removes the effect to a given Game Object.
	 * @param object Game object to remove outline from
	 */
	removeEffect(object: Phaser.GameObjects.GameObject): void {
		if (object && object.scene && object.scene.sys) {
			(object as any).removePostPipeline(OutlinePostFx);
		}
	}
}
