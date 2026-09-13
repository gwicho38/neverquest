/**
 * @fileoverview "Chapter 1 Complete" victory overlay
 *
 * Launched when all Act 1 quests are complete (the CHAPTER_COMPLETE event):
 * - Congratulatory title + chapter name
 * - Continue (keep exploring the hub)
 * - Main menu
 *
 * This is the chapter-end beat that gives the first chapter a real ending
 * rather than an endless loop.
 *
 * @see NeverquestQuestManager - Emits CHAPTER_COMPLETE
 * @see MainScene / DungeonScene - Launch this overlay on that event
 *
 * @module scenes/ChapterCompleteScene
 */

import Phaser from 'phaser';
import { HexColors, NumericColors } from '../consts/Colors';
import { Depth, Dimensions, Scale } from '../consts/Numbers';
import { ChapterOne } from '../consts/ChapterOne';

export const ChapterCompleteSceneName = 'ChapterCompleteScene';

export class ChapterCompleteScene extends Phaser.Scene {
	private titleText: Phaser.GameObjects.Text | null = null;
	private continueButton: Phaser.GameObjects.Text | null = null;
	private mainMenuButton: Phaser.GameObjects.Text | null = null;
	private returnScene: string = 'MainScene';
	private encounterScene: string | null = null;

	constructor() {
		super({ key: ChapterCompleteSceneName });
	}

	init(data: { returnScene?: string; encounterScene?: string }): void {
		this.returnScene = data?.returnScene || 'MainScene';
		this.encounterScene = data?.encounterScene || null;
	}

	create(): void {
		const width = this.cameras.main.width;
		const height = this.cameras.main.height;

		// Dim the gameplay behind the overlay
		const overlay = this.add.rectangle(width / 2, height / 2, width, height, NumericColors.BLACK, 0.85);
		overlay.setScrollFactor(0);
		overlay.setDepth(Depth.UI);

		// Title
		this.titleText = this.add
			.text(width / 2, height / 3, 'CHAPTER 1 COMPLETE', {
				fontSize: '52px',
				color: HexColors.YELLOW_LIGHT,
				fontFamily: 'Arial',
				stroke: HexColors.BLACK,
				strokeThickness: 6,
			})
			.setOrigin(0.5)
			.setScrollFactor(0)
			.setDepth(Depth.UI_OVERLAY);

		// Chapter subtitle
		this.add
			.text(width / 2, height / 3 + 60, 'The Awakening', {
				fontSize: '26px',
				color: HexColors.GREEN_LIGHT,
				fontFamily: 'Arial',
			})
			.setOrigin(0.5)
			.setScrollFactor(0)
			.setDepth(Depth.UI_OVERLAY);

		// Flavor text
		this.add
			.text(
				width / 2,
				height / 2,
				`The cave guardian is slain and the stolen artifact is yours.\n${ChapterOne.REWARD}`,
				{
					fontSize: '20px',
					color: HexColors.WHITE,
					fontFamily: 'Arial',
					align: 'center',
				}
			)
			.setOrigin(0.5)
			.setScrollFactor(0)
			.setDepth(Depth.UI_OVERLAY);

		// Continue button
		this.continueButton = this.createButton(width / 2, height / 2 + 80, '[C] CONTINUE');
		this.continueButton.on('pointerdown', () => this.continueGame());

		// Main menu button
		this.mainMenuButton = this.createButton(
			width / 2,
			height / 2 + Dimensions.BUTTON_SPACING_LARGE,
			'[ESC] MAIN MENU'
		);
		this.mainMenuButton.on('pointerdown', () => this.returnToMainMenu());

		// Keyboard controls
		this.input.keyboard?.on('keydown-C', () => this.continueGame());
		this.input.keyboard?.on('keydown-ESC', () => this.returnToMainMenu());

		// Celebratory title animation
		this.tweens.add({
			targets: this.titleText,
			alpha: { from: 0, to: 1 },
			scale: { from: 0.5, to: 1 },
			duration: 1000,
			ease: 'Back.easeOut',
		});
		this.tweens.add({
			targets: this.titleText,
			scale: { from: 1, to: Scale.SLIGHTLY_LARGE_PULSE },
			duration: 1200,
			yoyo: true,
			repeat: -1,
			ease: 'Sine.easeInOut',
		});
	}

	/**
	 * Creates a styled, interactive menu button with hover feedback.
	 */
	private createButton(x: number, y: number, label: string): Phaser.GameObjects.Text {
		const button = this.add
			.text(x, y, label, {
				fontSize: '28px',
				color: HexColors.WHITE,
				fontFamily: 'Arial',
				backgroundColor: HexColors.GRAY_DARK,
				padding: { x: 20, y: 10 },
			})
			.setOrigin(0.5)
			.setScrollFactor(0)
			.setDepth(Depth.UI_OVERLAY)
			.setInteractive({ useHandCursor: true });

		button.on('pointerover', () => button.setStyle({ backgroundColor: HexColors.GRAY_MEDIUM }));
		button.on('pointerout', () => button.setStyle({ backgroundColor: HexColors.GRAY_DARK }));

		return button;
	}

	/**
	 * Closes the overlay and resumes free exploration of the hub.
	 */
	continueGame(): void {
		if (this.encounterScene) this.scene.stop(this.encounterScene);
		this.scene.stop(ChapterCompleteSceneName);
		if (!this.scene.isActive(this.returnScene)) {
			this.scene.start(this.returnScene);
		}
	}

	/**
	 * Returns to the main menu, stopping gameplay scenes.
	 */
	returnToMainMenu(): void {
		if (this.encounterScene) this.scene.stop(this.encounterScene);
		this.scene.stop(ChapterCompleteSceneName);
		this.scene.stop(this.returnScene);
		this.scene.stop('DialogScene');
		this.scene.stop('HUDScene');
		this.time.delayedCall(100, () => {
			this.scene.start('MainMenuScene');
		});
	}
}
