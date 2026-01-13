import Phaser from 'phaser';
import { NeverquestQuestManager } from '../NeverquestQuestManager';
import { IActiveQuest } from '../../types/QuestTypes';

/**
 * Quest Tracker HUD Component
 * Displays active quest objectives on the screen
 */
export class NeverquestQuestTracker extends Phaser.GameObjects.Container {
	private questManager: NeverquestQuestManager;
	private background!: Phaser.GameObjects.Rectangle;
	private titleText!: Phaser.GameObjects.Text;
	private questTexts: Phaser.GameObjects.Text[] = [];
	private maxQuestsDisplay: number = 3; // Maximum quests to display at once
	private padding: number = 10;
	private trackerWidth: number = 300;
	private isMinimized: boolean = false;

	constructor(scene: Phaser.Scene, x: number, y: number, questManager: NeverquestQuestManager) {
		super(scene, x, y);
		scene.add.existing(this);

		this.questManager = questManager;
		this.setScrollFactor(0, 0);
		this.setDepth(100);

		this.createTracker();
		this.updateDisplay();

		// Listen for quest updates
		this.questManager.scene.events.on(NeverquestQuestManager.QUEST_UPDATED, this.updateDisplay, this);
		this.questManager.scene.events.on(NeverquestQuestManager.QUEST_COMPLETED, this.updateDisplay, this);
		this.questManager.scene.events.on(NeverquestQuestManager.QUEST_ACCEPTED, this.updateDisplay, this);
		this.questManager.scene.events.on(
			NeverquestQuestManager.QUEST_OBJECTIVE_COMPLETED,
			this.onObjectiveCompleted,
			this
		);
	}

	private createTracker(): void {
		// Background
		this.background = this.scene.add.rectangle(0, 0, this.trackerWidth, 100, 0x000000, 0.6);
		this.background.setOrigin(0, 0);
		this.background.setStrokeStyle(2, 0x8b7355);
		this.add(this.background);

		// Title
		this.titleText = this.scene.add.text(this.padding, this.padding, 'QUESTS', {
			fontFamily: 'Arial',
			fontSize: '16px',
			color: '#f4e4bc',
			fontStyle: 'bold',
		});
		this.add(this.titleText);

		// Make title interactive for minimize/maximize
		this.titleText.setInteractive({ useHandCursor: true });
		this.titleText.on('pointerdown', () => {
			this.toggleMinimize();
		});
	}

	private toggleMinimize(): void {
		this.isMinimized = !this.isMinimized;

		if (this.isMinimized) {
			this.titleText.setText('QUESTS [+]');
			this.questTexts.forEach((text) => text.setVisible(false));
			this.background.setSize(this.trackerWidth, 35);
		} else {
			this.titleText.setText('QUESTS [-]');
			this.questTexts.forEach((text) => text.setVisible(true));
			this.updateDisplay();
		}
	}

	private updateDisplay(): void {
		if (this.isMinimized) return;

		// Clear existing quest texts
		this.questTexts.forEach((text) => text.destroy());
		this.questTexts = [];

		const activeQuests = this.questManager.getActiveQuests();

		// Sort by main quests first, then by level
		const sortedQuests = activeQuests.sort((a, b) => {
			if (a.type === 'main' && b.type !== 'main') return -1;
			if (a.type !== 'main' && b.type === 'main') return 1;
			return a.level - b.level;
		});

		let yOffset = 35;

		// Display up to maxQuestsDisplay quests
		const questsToDisplay = sortedQuests.slice(0, this.maxQuestsDisplay);

		questsToDisplay.forEach((quest) => {
			// Quest name
			const questNameColor = quest.type === 'main' ? '#ffd700' : '#f4e4bc';
			const questName = this.scene.add.text(
				this.padding,
				yOffset,
				`${quest.type === 'main' ? '★ ' : ''}${quest.name}`,
				{
					fontFamily: 'Arial',
					fontSize: '14px',
					color: questNameColor,
					fontStyle: 'bold',
					wordWrap: { width: this.trackerWidth - this.padding * 2 },
				}
			);
			this.add(questName);
			this.questTexts.push(questName);
			yOffset += 20;

			// Display first incomplete objective
			const incompleteObjective = quest.objectives.find((obj) => !obj.completed);
			if (incompleteObjective) {
				let objectiveText = `○ ${incompleteObjective.description}`;

				// Add progress if applicable
				if (incompleteObjective.targetCount !== undefined && incompleteObjective.currentCount !== undefined) {
					objectiveText += ` (${incompleteObjective.currentCount}/${incompleteObjective.targetCount})`;
				}

				const objText = this.scene.add.text(this.padding + 10, yOffset, objectiveText, {
					fontFamily: 'Arial',
					fontSize: '12px',
					color: '#cccccc',
					wordWrap: { width: this.trackerWidth - this.padding * 2 - 10 },
				});
				this.add(objText);
				this.questTexts.push(objText);
				yOffset += objText.height + 5;
			} else if (quest.status === 'COMPLETED') {
				const completeText = this.scene.add.text(this.padding + 10, yOffset, '✓ Ready to turn in!', {
					fontFamily: 'Arial',
					fontSize: '12px',
					color: '#4ade80',
				});
				this.add(completeText);
				this.questTexts.push(completeText);
				yOffset += 20;
			}

			yOffset += 10; // Space between quests
		});

		// Update background height
		const totalHeight = Math.max(yOffset, 50);
		this.background.setSize(this.trackerWidth, totalHeight);

		// Show "and X more" if there are more quests
		if (activeQuests.length > this.maxQuestsDisplay) {
			const moreText = this.scene.add.text(
				this.padding,
				yOffset,
				`... and ${activeQuests.length - this.maxQuestsDisplay} more (Press Q)`,
				{
					fontFamily: 'Arial',
					fontSize: '11px',
					color: '#888888',
					fontStyle: 'italic',
				}
			);
			this.add(moreText);
			this.questTexts.push(moreText);
		}

		// If no active quests
		if (activeQuests.length === 0) {
			const noQuestsText = this.scene.add.text(this.padding, yOffset, 'No active quests', {
				fontFamily: 'Arial',
				fontSize: '12px',
				color: '#888888',
				fontStyle: 'italic',
			});
			this.add(noQuestsText);
			this.questTexts.push(noQuestsText);
			this.background.setSize(this.trackerWidth, 60);
		}
	}

	private onObjectiveCompleted(quest: IActiveQuest, objective: any): void {
		// Show a notification when an objective is completed
		const notificationText = this.scene.add.text(
			this.scene.scale.width / 2,
			100,
			`Quest Updated: ${quest.name}\n✓ ${objective.description}`,
			{
				fontFamily: 'Arial',
				fontSize: '16px',
				color: '#4ade80',
				backgroundColor: '#000000',
				padding: { x: 15, y: 10 },
				align: 'center',
			}
		);
		notificationText.setOrigin(0.5, 0);
		notificationText.setScrollFactor(0, 0);
		notificationText.setDepth(1000);
		notificationText.setAlpha(0);

		// Animate notification
		this.scene.tweens.add({
			targets: notificationText,
			alpha: 1,
			duration: 300,
			yoyo: true,
			hold: 2000,
			onComplete: () => {
				notificationText.destroy();
			},
		});
	}

	/**
	 * Set the maximum number of quests to display
	 */
	setMaxQuestsDisplay(max: number): void {
		this.maxQuestsDisplay = max;
		this.updateDisplay();
	}

	/**
	 * Show or hide the tracker
	 */
	setVisible(visible: boolean): this {
		super.setVisible(visible);
		return this;
	}

	/**
	 * Cleanup
	 */
	destroy(fromScene?: boolean): void {
		// Remove event listeners
		this.questManager.scene.events.off(NeverquestQuestManager.QUEST_UPDATED, this.updateDisplay, this);
		this.questManager.scene.events.off(NeverquestQuestManager.QUEST_COMPLETED, this.updateDisplay, this);
		this.questManager.scene.events.off(NeverquestQuestManager.QUEST_ACCEPTED, this.updateDisplay, this);
		this.questManager.scene.events.off(
			NeverquestQuestManager.QUEST_OBJECTIVE_COMPLETED,
			this.onObjectiveCompleted,
			this
		);

		super.destroy(fromScene);
	}
}
