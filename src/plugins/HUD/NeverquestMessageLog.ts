/**
 * @fileoverview In-game message log for events and combat feedback
 *
 * This plugin displays scrolling messages for:
 * - Combat events (damage dealt/received)
 * - Item pickups and usage
 * - Quest updates
 * - System notifications
 *
 * Features:
 * - Color-coded message types
 * - Message history with scrolling
 * - Configurable max visible messages
 * - Semi-transparent background
 *
 * @see HUDScene - Parent scene for HUD elements
 * @see NeverquestBattleManager - Combat message source
 *
 * @module plugins/HUD/NeverquestMessageLog
 */

import Phaser from 'phaser';
import { HexColors, NumericColors } from '../../consts/Colors';
import { UILabels, MessageKeywords } from '../../consts/Messages';
import { Alpha } from '../../consts/Numbers';

/**
 * Message log for displaying game events, combat results, and notifications
 * Similar to the terminal version's log system
 */
export class NeverquestMessageLog {
	private scene: Phaser.Scene;
	private container: Phaser.GameObjects.Container;
	private background: Phaser.GameObjects.Graphics;
	private messages: Phaser.GameObjects.Text[] = [];
	private maxMessages: number = 5; // Show last 5 messages
	private messageHistory: string[] = []; // Store all messages for scrolling
	private x: number;
	private y: number;
	private width: number;
	private height: number;
	private padding: number = 10;
	private lineHeight: number = 20;

	constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
		this.scene = scene;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;

		// Create container for all log elements
		this.container = this.scene.add.container(x, y);
		this.container.setScrollFactor(0);
		this.container.setDepth(100);

		// Create semi-transparent background
		this.background = this.scene.add.graphics();
		this.background.fillStyle(NumericColors.BLACK, Alpha.HIGH);
		this.background.fillRoundedRect(0, 0, width, height, 8);
		this.background.lineStyle(2, NumericColors.GRAY_DARK, 1);
		this.background.strokeRoundedRect(0, 0, width, height, 8);
		this.container.add(this.background);

		// Create title text
		const titleText = this.scene.add.text(this.padding, this.padding, UILabels.GAME_LOG_TITLE_WITH_ICON, {
			fontSize: '14px',
			color: HexColors.YELLOW,
			fontStyle: 'bold',
		});
		this.container.add(titleText);

		// Initialize message text objects
		for (let i = 0; i < this.maxMessages; i++) {
			const messageText = this.scene.add.text(this.padding, this.padding + 25 + i * this.lineHeight, '', {
				fontSize: '12px',
				color: HexColors.WHITE,
				wordWrap: { width: width - this.padding * 2 },
			});
			this.messages.push(messageText);
			this.container.add(messageText);
		}
	}

	/**
	 * Add a message to the log
	 */
	public log(message: string, _color: string = HexColors.WHITE): void {
		// Add to history
		this.messageHistory.push(message);

		// Keep only last 100 messages in history
		if (this.messageHistory.length > 100) {
			this.messageHistory.shift();
		}

		// Update displayed messages (show last N messages)
		const visibleMessages = this.messageHistory.slice(-this.maxMessages);
		for (let i = 0; i < this.maxMessages; i++) {
			if (i < visibleMessages.length) {
				this.messages[i].setText(visibleMessages[i]);
				this.messages[i].setColor(this.getMessageColor(visibleMessages[i]));
			} else {
				this.messages[i].setText('');
			}
		}
	}

	/**
	 * Get color based on message content
	 */
	private getMessageColor(message: string): string {
		if (message.includes(MessageKeywords.DEFEATED) || message.includes(MessageKeywords.VICTORY)) {
			return HexColors.GREEN; // Green for success
		}
		if (message.includes(MessageKeywords.DAMAGE) || message.includes(MessageKeywords.ATTACK)) {
			return HexColors.RED_LIGHT; // Red for combat
		}
		if (message.includes(MessageKeywords.HEAL) || message.includes(MessageKeywords.RESTORED)) {
			return HexColors.GREEN_LIGHT; // Light green for healing
		}
		if (message.includes(MessageKeywords.LEVEL_UP) || message.includes(MessageKeywords.XP)) {
			return HexColors.YELLOW; // Yellow for progression
		}
		return HexColors.WHITE; // White for general messages
	}

	/**
	 * Clear all messages
	 */
	public clear(): void {
		this.messageHistory = [];
		for (const message of this.messages) {
			message.setText('');
		}
	}

	/**
	 * Set position of the log
	 */
	public setPosition(x: number, y: number): void {
		this.container.setPosition(x, y);
	}

	/**
	 * Set visibility
	 */
	public setVisible(visible: boolean): void {
		this.container.setVisible(visible);
	}

	/**
	 * Destroy the log
	 */
	public destroy(): void {
		this.container.destroy();
	}
}
