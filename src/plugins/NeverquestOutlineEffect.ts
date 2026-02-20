/**
 * @fileoverview Outline post-processing effect for UI selection
 *
 * This plugin applies outline effects to game objects using rex plugins:
 * - Adds colored outline around sprites/images
 * - Configurable outline color and thickness
 * - Used for UI element selection highlighting
 * - Supports add/remove toggle behavior
 *
 * Uses phaser3-rex-plugins OutlinePostFx pipeline.
 * Applied to currently selected menu items for visual feedback.
 *
 * @see NeverquestInterfaceController - Uses outline for selection
 * @see InventoryScene - Outlines selected items
 * @see SettingScene - Outlines selected options
 *
 * @module plugins/NeverquestOutlineEffect
 */

import OutlinePostFx from 'phaser3-rex-plugins/plugins/outlinepipeline.js';
import { NumericColors } from '../consts/Colors';

/**
 * Interface for the outline post fx pipeline instance from rex plugins
 */
interface IOutlinePipelineInstance {
	setOutlineColor(color: number): this;
	thickness: number;
}

/**
 * Interface for the outline post fx plugin from rex plugins
 */
interface IOutlinePipelinePlugin {
	get(gameObject: Phaser.GameObjects.GameObject): IOutlinePipelineInstance[];
	destroy(): void;
}

/**
 * Interface for game objects that support post pipelines
 * This is a subset of the Phaser PostPipeline component
 */
interface IPostPipelineObject extends Phaser.GameObjects.GameObject {
	setPostPipeline(pipeline: unknown): this;
	removePostPipeline(pipeline: unknown): this;
}

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
	effectLayer: Phaser.GameObjects.Layer | null = null;

	/**
	 * the color of the outline.
	 * @default
	 */
	outlineColor: number = NumericColors.RED;

	/**
	 * The outline Thickness. The bigger the number, the bigger the thickness.
	 */
	outlineThickness: number = 3;

	outlinePostFxPlugin: IOutlinePipelinePlugin;

	/**
	 * Creates an outline effect to a given object.
	 * @param scene Scene context
	 */
	constructor(scene: Phaser.Scene) {
		this.scene = scene;
		this.outlinePostFxPlugin = this.scene.plugins.get('rexOutlinePipeline') as unknown as IOutlinePipelinePlugin;
	}

	/**
	 * Applies the effect to a Game Object.
	 * @param object Game object to apply outline to
	 */
	applyEffect(object: Phaser.GameObjects.GameObject): void {
		if (object && object.scene && object.scene.sys) {
			const postPipelineObject = object as IPostPipelineObject;
			postPipelineObject.setPostPipeline(OutlinePostFx);
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
			const postPipelineObject = object as IPostPipelineObject;
			postPipelineObject.removePostPipeline(OutlinePostFx);
		}
	}
}
