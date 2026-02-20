/**
 * @fileoverview Tooltip/info box UI component
 *
 * This file provides an information display box for tooltips:
 * - NineSlice background for responsive sizing
 * - Name and description text fields
 * - Configurable dimensions and positioning
 * - Used for item descriptions, ability info, etc.
 *
 * @see PanelComponent - Base panel implementation
 * @see NeverquestTiledInfoBox - Map-triggered info displays
 *
 * @module components/InfoBox
 */

import { HexColors } from '../consts/Colors';
import { FontFamilies, Alpha } from '../consts/Numbers';
import { InfoBoxMessages } from '../consts/Messages';

export class InfoBox {
	scene: Phaser.Scene;
	backgroundSprite: Phaser.GameObjects.NineSlice | null;
	name: Phaser.GameObjects.Text | null;
	description: Phaser.GameObjects.Text | null;
	x: number;
	y: number;
	panelMaxWidth: number;
	panelMaxHeight: number;
	backgroundTexture: string;
	config: { name: string; description: string };
	titleTextFontSize: number;
	titleFontFamily: string;
	nineSliceOffset: number;

	constructor(
		scene: Phaser.Scene,
		x: number,
		y: number,
		width: number,
		height: number,
		config: { name: string; description: string } = { name: '', description: InfoBoxMessages.DESCRIPTION_SEPARATOR }
	) {
		/**
		 * The phaser scene that this infobox belongs.
		 * @type { Phaser.Scene}
		 */
		this.scene = scene;

		/**
		 * @type { NineSlice }
		 */
		this.backgroundSprite = null;

		/**
		 * The name displayed on the info box.
		 * @type { Phaser.GameObjects.Text }
		 */
		this.name = null;
		/**
		 * The description displayed on the info box.
		 * @type { Phaser.GameObjects.Text }
		 */
		this.description = null;

		this.x = x;
		this.y = y;
		this.panelMaxWidth = width;
		this.panelMaxHeight = height;
		this.backgroundTexture = 'infobox_background';
		this.config = config;
		/**
		 * Default font size of the Title Text.
		 * @type { number }
		 * @default
		 */
		this.titleTextFontSize = 10;
		/**
		 * The default font family of the Inventory Text.
		 * @type { string }
		 * @default
		 */
		this.titleFontFamily = FontFamilies.PRESS_START_2P;

		/**
		 * The Offset of the Nine Slice background. It's used to protect the background from streching.
		 * It will make it responsive in any scale size without losing resolution.
		 * @type { number }
		 * @default
		 */
		this.nineSliceOffset = 10;

		this.createBackground();
		this.createInformation();
	}

	createBackground(): void {
		this.backgroundSprite = this.scene.add
			.nineslice(
				this.x,
				this.y,
				this.backgroundTexture, // texture key - must come before dimensions
				undefined, // frame - use undefined for single-frame textures
				this.panelMaxWidth, // width
				this.panelMaxHeight, // height
				this.nineSliceOffset, // leftWidth
				this.nineSliceOffset, // rightWidth
				this.nineSliceOffset, // topHeight
				this.nineSliceOffset // bottomHeight
			)
			.setScrollFactor(0, 0)
			.setOrigin(0, 0);
		this.backgroundSprite.alpha = Alpha.HIGH;
	}

	createInformation(): void {
		const baseX = this.backgroundSprite.x + 15;
		const baseY = this.backgroundSprite.y + 15;
		const wrap = this.backgroundSprite.width - 15;
		this.name = this.scene.add.text(baseX, baseY, this.config.name, {
			fontSize: this.titleTextFontSize,
			fontFamily: `${this.titleFontFamily}`,
			color: HexColors.WHITE,
			wordWrap: { width: wrap },
		});
		this.name.setOrigin(0, 0.5);
		this.name.setScrollFactor(0, 0);
		this.description = this.scene.add.text(baseX, this.name.y + this.name.height + 10, this.config.description, {
			fontSize: this.titleTextFontSize,
			fontFamily: `${this.titleFontFamily}`,
			color: HexColors.WHITE,
			wordWrap: { width: wrap },
		});
		this.description.setScrollFactor(0, 0);
	}
}
