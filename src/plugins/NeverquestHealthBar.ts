/**
 * @fileoverview Dynamic health bar component for Neverquest
 *
 * This plugin renders health bars above entities:
 * - Real-time health percentage visualization
 * - Smooth health transition animations
 * - Color gradients based on health level (green → yellow → red)
 * - Configurable size and offset positioning
 * - Visibility toggling
 *
 * Used by both Player and Enemy entities to display health status.
 * Renders using Graphics API for crisp pixel-perfect display.
 *
 * @see Player - Player health bar attachment
 * @see Enemy - Enemy health bar display
 * @see NeverquestBattleManager - Updates health on damage
 *
 * @module plugins/NeverquestHealthBar
 */

import Phaser from 'phaser';
import { Alpha, Dimensions } from '../consts/Numbers';

/**
 * @class
 */
export class NeverquestHealthBar extends Phaser.GameObjects.Sprite {
	/**
	 * The height of the health bar.
	 * @default
	 */
	height: number = 3;

	/**
	 * Current Health of the entity.
	 */
	health: number;

	/**
	 * The Maximum Health of the entity.
	 */
	full: number;

	/**
	 * X-Axis Offset.
	 */
	offX: number;

	/**
	 * Y-Axis offset.
	 */
	offY: number;

	/**
	 * The size / width of the health bar.
	 */
	size: number;

	/**
	 * Created a Dynamic health bar.
	 * @param scene The Phaser Scene that the health bar will be displayed.
	 * @param x X-Axis Positon.
	 * @param y Y-Axis Position.
	 * @param width Width of the sprite.
	 * @param health Max Health of the entity.
	 * @param offX X-Axis Offset.
	 * @param offY Y-Axis offset.
	 */
	constructor(
		scene: Phaser.Scene,
		x: number,
		y: number,
		width: number,
		health: number,
		offX: number = 0,
		offY: number = 0
	) {
		super(scene, x, y, 'health');

		this.health = health;
		this.full = health;
		this.offX = offX;
		this.offY = offY;
		this.size = width * Dimensions.HEALTH_BAR_WIDTH_MULTIPLIER;
		this.x = x + offX;
		this.y = y + offY;
		this.alpha = Alpha.VERY_HIGH;
		this.setOrigin(0, 0);
		this.setDepth(2);

		scene.add.existing(this);
		this.draw();
	}

	/**
	 * Decreases the health bar.
	 * @param dano Damage to deal in the entity.
	 * @returns returns true if the health is zero or less.
	 */
	decrease(dano: number): boolean {
		this.health -= dano;

		if (this.health <= 0) {
			this.health = 0;
		}
		this.draw();
		return this.health <= 0;
	}

	/**
	 * Updated the Health Points of the entity.
	 * @param hp The new HP
	 */
	update(hp: number): void {
		this.health = hp;
		this.draw();
	}

	/**
	 * Changes the color of the Health bar based on the current entity's health.
	 */
	draw(): void {
		const d = (this.health * 100) / this.full / 100;
		const x = (this.health / this.full) * 100;

		const color = this.rgbToHex(
			(x > 50 ? 1 - (2 * (x - 50)) / 100.0 : 1.0) * 255,
			(x > 50 ? 1.0 : (2 * x) / 100.0) * 255,
			0
		);

		this.tint = color;
		this.scaleX = (d * this.size) / this.width;
	}

	/**
	 * Gets the correct color, based on the red and green values, so the bar goes from Green (Full health) to RED (Low Health).
	 * @param r red value.
	 * @param g green value.
	 * @param b blue value.
	 * @returns The new RGB Value
	 */
	rgbToHex(r: number, g: number, b: number): number {
		const hex = '0x' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
		return parseInt(hex, 16);
	}
}
