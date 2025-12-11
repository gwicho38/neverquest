import Phaser from 'phaser';
import { NeverquestQuestManager } from '../plugins/NeverquestQuestManager';
import { IActiveQuest } from '../types/QuestTypes';
import { QuestStatus } from '../models/QuestStatus';

export const QuestLogSceneName = 'QuestLogScene';

/**
 * Quest Log Scene
 * Displays active and completed quests with their objectives and progress
 */
export class QuestLogScene extends Phaser.Scene {
	private questManager!: NeverquestQuestManager;
	private background!: Phaser.GameObjects.Rectangle;
	private panel!: Phaser.GameObjects.Container;
	private titleText!: Phaser.GameObjects.Text;
	private closeButton!: Phaser.GameObjects.Text;
	private questListContainer!: Phaser.GameObjects.Container;
	private questDetailsContainer!: Phaser.GameObjects.Container;
	private selectedQuest: IActiveQuest | null = null;

	// Tab buttons
	private activeQuestsTab!: Phaser.GameObjects.Text;
	private completedQuestsTab!: Phaser.GameObjects.Text;
	private currentTab: 'active' | 'completed' = 'active';

	// UI Constants
	private readonly PANEL_WIDTH = 900;
	private readonly PANEL_HEIGHT = 600;
	private readonly PADDING = 20;
	private readonly LIST_WIDTH = 300;
	private readonly DETAILS_WIDTH = 550;

	constructor() {
		super({ key: QuestLogSceneName });
	}

	create(): void {
		const { width, height } = this.scale;

		// Get quest manager from main scene or create new one
		const mainScene = this.scene.get('MainScene');
		if (mainScene && (mainScene as any).questManager) {
			this.questManager = (mainScene as any).questManager;
		} else {
			this.questManager = new NeverquestQuestManager(this);
			this.questManager.create();
		}

		// Semi-transparent background overlay
		this.background = this.add.rectangle(0, 0, width, height, 0x000000, 0.7);
		this.background.setOrigin(0, 0);
		this.background.setInteractive();
		this.background.on('pointerdown', () => {
			this.closeQuestLog();
		});

		// Main panel
		this.panel = this.add.container(width / 2, height / 2);

		// Panel background
		const panelBg = this.add.rectangle(0, 0, this.PANEL_WIDTH, this.PANEL_HEIGHT, 0x2a2a2a, 1);
		panelBg.setStrokeStyle(4, 0x8b7355);
		this.panel.add(panelBg);

		// Title
		this.titleText = this.add.text(0, -this.PANEL_HEIGHT / 2 + 30, 'QUEST LOG', {
			fontFamily: 'Arial',
			fontSize: '32px',
			color: '#f4e4bc',
			fontStyle: 'bold',
		});
		this.titleText.setOrigin(0.5, 0.5);
		this.panel.add(this.titleText);

		// Close button
		this.closeButton = this.add.text(this.PANEL_WIDTH / 2 - 40, -this.PANEL_HEIGHT / 2 + 30, '✕', {
			fontFamily: 'Arial',
			fontSize: '32px',
			color: '#ff6b6b',
		});
		this.closeButton.setOrigin(0.5, 0.5);
		this.closeButton.setInteractive({ useHandCursor: true });
		this.closeButton.on('pointerdown', () => {
			this.closeQuestLog();
		});
		this.closeButton.on('pointerover', () => {
			this.closeButton.setColor('#ff0000');
		});
		this.closeButton.on('pointerout', () => {
			this.closeButton.setColor('#ff6b6b');
		});
		this.panel.add(this.closeButton);

		// Tab buttons
		this.createTabs();

		// Quest list container (left side)
		this.questListContainer = this.add.container(
			-this.PANEL_WIDTH / 2 + this.PADDING,
			-this.PANEL_HEIGHT / 2 + 100
		);
		this.panel.add(this.questListContainer);

		// Quest details container (right side)
		this.questDetailsContainer = this.add.container(
			-this.PANEL_WIDTH / 2 + this.LIST_WIDTH + this.PADDING * 2,
			-this.PANEL_HEIGHT / 2 + 100
		);
		this.panel.add(this.questDetailsContainer);

		// Divider line
		const divider = this.add.rectangle(
			-this.PANEL_WIDTH / 2 + this.LIST_WIDTH + this.PADDING * 1.5,
			0,
			2,
			this.PANEL_HEIGHT - 120,
			0x8b7355
		);
		divider.setOrigin(0, 0.5);
		this.panel.add(divider);

		// Populate quest list
		this.refreshQuestList();

		// Keyboard controls
		this.input.keyboard?.on('keydown-Q', () => {
			this.closeQuestLog();
		});

		this.input.keyboard?.on('keydown-ESC', () => {
			this.closeQuestLog();
		});

		// Listen for quest updates
		this.questManager.scene.events.on(NeverquestQuestManager.QUEST_UPDATED, this.refreshQuestList, this);
		this.questManager.scene.events.on(NeverquestQuestManager.QUEST_COMPLETED, this.refreshQuestList, this);
		this.questManager.scene.events.on(NeverquestQuestManager.QUEST_ACCEPTED, this.refreshQuestList, this);
	}

	private createTabs(): void {
		const tabY = -this.PANEL_HEIGHT / 2 + 70;
		const tabX = -this.PANEL_WIDTH / 2 + this.PADDING;

		// Active quests tab
		this.activeQuestsTab = this.add.text(tabX, tabY, 'Active Quests', {
			fontFamily: 'Arial',
			fontSize: '18px',
			color: '#f4e4bc',
			backgroundColor: '#4a4a4a',
			padding: { x: 15, y: 8 },
		});
		this.activeQuestsTab.setInteractive({ useHandCursor: true });
		this.activeQuestsTab.on('pointerdown', () => {
			this.switchTab('active');
		});
		this.panel.add(this.activeQuestsTab);

		// Completed quests tab
		this.completedQuestsTab = this.add.text(tabX + 150, tabY, 'Completed', {
			fontFamily: 'Arial',
			fontSize: '18px',
			color: '#888888',
			backgroundColor: '#2a2a2a',
			padding: { x: 15, y: 8 },
		});
		this.completedQuestsTab.setInteractive({ useHandCursor: true });
		this.completedQuestsTab.on('pointerdown', () => {
			this.switchTab('completed');
		});
		this.panel.add(this.completedQuestsTab);
	}

	private switchTab(tab: 'active' | 'completed'): void {
		this.currentTab = tab;

		// Update tab appearance
		if (tab === 'active') {
			this.activeQuestsTab.setStyle({
				color: '#f4e4bc',
				backgroundColor: '#4a4a4a',
			});
			this.completedQuestsTab.setStyle({
				color: '#888888',
				backgroundColor: '#2a2a2a',
			});
		} else {
			this.activeQuestsTab.setStyle({
				color: '#888888',
				backgroundColor: '#2a2a2a',
			});
			this.completedQuestsTab.setStyle({
				color: '#f4e4bc',
				backgroundColor: '#4a4a4a',
			});
		}

		this.selectedQuest = null;
		this.refreshQuestList();
	}

	private refreshQuestList(): void {
		// Clear existing list
		this.questListContainer.removeAll(true);
		this.questDetailsContainer.removeAll(true);

		let quests: IActiveQuest[] = [];

		if (this.currentTab === 'active') {
			quests = this.questManager.getActiveQuests();
		} else {
			// Get completed quests
			const completedIds = this.questManager.getCompletedQuests();
			quests = completedIds
				.map((id) => this.questManager.getActiveQuest(id))
				.filter((q): q is IActiveQuest => q !== undefined);
		}

		// Sort by level
		quests.sort((a, b) => a.level - b.level);

		// Display quest list
		let yOffset = 0;
		quests.forEach((quest, _index) => {
			const questItem = this.createQuestListItem(quest, yOffset);
			this.questListContainer.add(questItem);
			yOffset += 70; // Space between quest items
		});

		// If no quests, show message
		if (quests.length === 0) {
			const emptyText = this.add.text(
				0,
				100,
				this.currentTab === 'active' ? 'No active quests' : 'No completed quests',
				{
					fontFamily: 'Arial',
					fontSize: '16px',
					color: '#888888',
					wordWrap: { width: this.LIST_WIDTH },
				}
			);
			this.questListContainer.add(emptyText);
		}

		// If a quest was selected, show its details
		if (this.selectedQuest) {
			this.displayQuestDetails(this.selectedQuest);
		} else if (quests.length > 0) {
			// Select first quest by default
			this.selectedQuest = quests[0];
			this.displayQuestDetails(quests[0]);
		}
	}

	private createQuestListItem(quest: IActiveQuest, yOffset: number): Phaser.GameObjects.Container {
		const container = this.add.container(0, yOffset);

		// Background
		const bg = this.add.rectangle(0, 0, this.LIST_WIDTH, 60, 0x3a3a3a);
		bg.setOrigin(0, 0);
		bg.setInteractive({ useHandCursor: true });
		bg.on('pointerdown', () => {
			this.selectedQuest = quest;
			this.displayQuestDetails(quest);
		});
		bg.on('pointerover', () => {
			bg.setFillStyle(0x4a4a4a);
		});
		bg.on('pointerout', () => {
			bg.setFillStyle(0x3a3a3a);
		});
		container.add(bg);

		// Quest name
		const nameText = this.add.text(10, 5, quest.name, {
			fontFamily: 'Arial',
			fontSize: '16px',
			color: quest.type === 'main' ? '#ffd700' : '#f4e4bc',
			fontStyle: 'bold',
			wordWrap: { width: this.LIST_WIDTH - 20 },
		});
		container.add(nameText);

		// Quest level
		const levelText = this.add.text(10, 30, `Level ${quest.level}`, {
			fontFamily: 'Arial',
			fontSize: '12px',
			color: '#888888',
		});
		container.add(levelText);

		// Progress indicator
		const totalObjectives = quest.objectives.length;
		const completedObjectives = quest.objectives.filter((obj) => obj.completed).length;
		const progressText = this.add.text(this.LIST_WIDTH - 10, 30, `${completedObjectives}/${totalObjectives}`, {
			fontFamily: 'Arial',
			fontSize: '12px',
			color: completedObjectives === totalObjectives ? '#4ade80' : '#888888',
		});
		progressText.setOrigin(1, 0);
		container.add(progressText);

		return container;
	}

	private displayQuestDetails(quest: IActiveQuest): void {
		// Clear existing details
		this.questDetailsContainer.removeAll(true);

		let yOffset = 0;

		// Quest name
		const nameText = this.add.text(0, yOffset, quest.name, {
			fontFamily: 'Arial',
			fontSize: '24px',
			color: quest.type === 'main' ? '#ffd700' : '#f4e4bc',
			fontStyle: 'bold',
			wordWrap: { width: this.DETAILS_WIDTH },
		});
		this.questDetailsContainer.add(nameText);
		yOffset += 40;

		// Quest type and level
		const typeText = this.add.text(
			0,
			yOffset,
			`${quest.type === 'main' ? 'MAIN QUEST' : 'SIDE QUEST'} • Level ${quest.level}`,
			{
				fontFamily: 'Arial',
				fontSize: '14px',
				color: '#888888',
			}
		);
		this.questDetailsContainer.add(typeText);
		yOffset += 30;

		// Description
		const descText = this.add.text(0, yOffset, quest.description, {
			fontFamily: 'Arial',
			fontSize: '14px',
			color: '#cccccc',
			wordWrap: { width: this.DETAILS_WIDTH },
		});
		this.questDetailsContainer.add(descText);
		yOffset += descText.height + 20;

		// Objectives header
		const objHeader = this.add.text(0, yOffset, 'OBJECTIVES:', {
			fontFamily: 'Arial',
			fontSize: '16px',
			color: '#f4e4bc',
			fontStyle: 'bold',
		});
		this.questDetailsContainer.add(objHeader);
		yOffset += 30;

		// Objectives list
		quest.objectives.forEach((objective, _index) => {
			const checkmark = objective.completed ? '✓' : '○';
			const color = objective.completed ? '#4ade80' : '#cccccc';

			let objectiveText = `${checkmark} ${objective.description}`;

			// Add progress if applicable
			if (objective.targetCount !== undefined && objective.currentCount !== undefined) {
				objectiveText += ` (${objective.currentCount}/${objective.targetCount})`;
			}

			const objText = this.add.text(10, yOffset, objectiveText, {
				fontFamily: 'Arial',
				fontSize: '14px',
				color: color,
				wordWrap: { width: this.DETAILS_WIDTH - 10 },
			});
			this.questDetailsContainer.add(objText);
			yOffset += objText.height + 10;
		});

		yOffset += 20;

		// Rewards section
		if (quest.rewards) {
			const rewardsHeader = this.add.text(0, yOffset, 'REWARDS:', {
				fontFamily: 'Arial',
				fontSize: '16px',
				color: '#f4e4bc',
				fontStyle: 'bold',
			});
			this.questDetailsContainer.add(rewardsHeader);
			yOffset += 30;

			const rewards: string[] = [];
			if (quest.rewards.xp) {
				rewards.push(`${quest.rewards.xp} XP`);
			}
			if (quest.rewards.gold) {
				rewards.push(`${quest.rewards.gold} Gold`);
			}
			if (quest.rewards.items && quest.rewards.items.length > 0) {
				rewards.push(`${quest.rewards.items.length} Item(s)`);
			}

			const rewardText = this.add.text(10, yOffset, rewards.join(' • '), {
				fontFamily: 'Arial',
				fontSize: '14px',
				color: '#ffd700',
			});
			this.questDetailsContainer.add(rewardText);
			yOffset += 30;
		}

		// Quest status
		if (quest.status === QuestStatus.COMPLETED) {
			const statusText = this.add.text(0, yOffset, '✓ READY TO TURN IN', {
				fontFamily: 'Arial',
				fontSize: '18px',
				color: '#4ade80',
				fontStyle: 'bold',
			});
			this.questDetailsContainer.add(statusText);
		}
	}

	private closeQuestLog(): void {
		// Play close sound
		this.sound.play('cloth', { volume: 0.3 });

		// Resume the scene that opened the quest log
		this.scene.resume('HUDScene');
		this.scene.stop();
	}

	/**
	 * Cleanup when scene shuts down
	 */
	shutdown(): void {
		// Remove event listeners
		this.questManager.scene.events.off(NeverquestQuestManager.QUEST_UPDATED, this.refreshQuestList, this);
		this.questManager.scene.events.off(NeverquestQuestManager.QUEST_COMPLETED, this.refreshQuestList, this);
		this.questManager.scene.events.off(NeverquestQuestManager.QUEST_ACCEPTED, this.refreshQuestList, this);
	}
}
