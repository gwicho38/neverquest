/**
 * @fileoverview Label box UI component
 *
 * This file provides a simple labeled panel container:
 * - Wraps a PanelComponent for basic panel display
 * - Used for labeled information display
 *
 * @see PanelComponent - Base panel implementation
 *
 * @module components/LabelBox
 */

import Phaser from 'phaser';
import { PanelComponent } from './PanelComponent';

export class LabelBox {
	/**
	 * The Phaser Scene that the Panel will be created on.
	 */
	public scene: Phaser.Scene;

	/**
	 * The Panel that will show the information.
	 */
	public panel: PanelComponent;

	constructor(scene: Phaser.Scene) {
		this.scene = scene;
		this.panel = new PanelComponent(scene);
	}
}
