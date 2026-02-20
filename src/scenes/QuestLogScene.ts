/**
 * @fileoverview Quest log and story progress tracker
 *
 * This scene displays active and completed quests:
 * - 16 quests across 3 acts
 * - Completion status from story flags
 * - Scrollable quest list
 * - Act-based organization
 *
 * Tracks player narrative progress through the game.
 *
 * @see NeverquestStoryFlags - Quest completion tracking
 * @see HUDScene - Quick access button
 *
 * @module scenes/QuestLogScene
 */

import Phaser from 'phaser';
import { PanelComponent } from '../components/PanelComponent';
import { NeverquestStoryFlags, StoryFlag } from '../plugins/NeverquestStoryFlags';
import { FontFamilies } from '../consts/Numbers';
import { Colors } from '../consts/Colors';

export const QuestLogSceneName = 'QuestLogScene';

/**
 * Interface for quest entry display
 */
interface IQuestEntry {
	id: string;
	title: string;
	description: string;
	completed: boolean;
	act: 1 | 2 | 3;
}

/**
 * Interface for initialization data
 */
interface IQuestLogSceneInitData {
	storyFlags?: NeverquestStoryFlags;
}

/**
 * Quest definitions organized by act
 */
const QUEST_DEFINITIONS: IQuestEntry[] = [
	// Act 1 - The Awakening
	{
		id: 'intro',
		title: 'Awakening',
		description: 'Regain your memories and speak with the village elder.',
		completed: false,
		act: 1,
	},
	{
		id: 'meet_elder',
		title: "The Elder's Request",
		description: 'Meet with the village elder to learn about the threat.',
		completed: false,
		act: 1,
	},
	{
		id: 'cave_artifact',
		title: 'The Stolen Artifact',
		description: 'Retrieve the artifact from the nearby cave.',
		completed: false,
		act: 1,
	},
	{
		id: 'cave_boss',
		title: 'Cave Guardian',
		description: 'Defeat the guardian protecting the artifact.',
		completed: false,
		act: 1,
	},

	// Act 2 - The Journey
	{
		id: 'crossroads',
		title: 'The Crossroads',
		description: 'Travel to the Crossroads, the central hub of the realm.',
		completed: false,
		act: 2,
	},
	{
		id: 'merchant',
		title: 'Meet the Merchant',
		description: 'Speak with the wandering merchant at the trading post.',
		completed: false,
		act: 2,
	},
	{
		id: 'fallen_knight',
		title: 'The Fallen Knight',
		description: 'Encounter the mysterious fallen knight.',
		completed: false,
		act: 2,
	},
	{
		id: 'oracle',
		title: 'Seek the Oracle',
		description: 'Find the Oracle of the Depths and receive the prophecy.',
		completed: false,
		act: 2,
	},
	{
		id: 'fragment_ruins',
		title: 'Fragment of Ruins',
		description: 'Obtain the first Sunstone fragment from the Ancient Ruins.',
		completed: false,
		act: 2,
	},
	{
		id: 'fragment_temple',
		title: 'Fragment of Temple',
		description: 'Obtain the second Sunstone fragment from the Forgotten Temple.',
		completed: false,
		act: 2,
	},
	{
		id: 'fragment_gate',
		title: 'Fragment of Gate',
		description: 'Obtain the third Sunstone fragment near the Dark Gate.',
		completed: false,
		act: 2,
	},
	{
		id: 'sunstone',
		title: 'Restore the Sunstone',
		description: 'Combine all three fragments to restore the Sunstone.',
		completed: false,
		act: 2,
	},

	// Act 3 - The Reckoning
	{
		id: 'dark_gate',
		title: 'Open the Dark Gate',
		description: 'Use the restored Sunstone to open the Dark Gate.',
		completed: false,
		act: 3,
	},
	{
		id: 'citadel',
		title: 'Enter the Citadel',
		description: 'Brave the Dark Citadel to confront the Void King.',
		completed: false,
		act: 3,
	},
	{
		id: 'shadow_guardian',
		title: 'Shadow Guardian',
		description: 'Defeat the Shadow Guardian blocking the way.',
		completed: false,
		act: 3,
	},
	{
		id: 'void_king',
		title: 'The Void King',
		description: 'Confront the Void King and decide the fate of the realm.',
		completed: false,
		act: 3,
	},
];

/**
 * Mapping from quest IDs to story flags
 */
const QUEST_FLAG_MAP: Record<string, StoryFlag> = {
	intro: StoryFlag.INTRO_COMPLETE,
	meet_elder: StoryFlag.MET_ELDER,
	cave_artifact: StoryFlag.CAVE_ARTIFACT_RETRIEVED,
	cave_boss: StoryFlag.CAVE_BOSS_DEFEATED,
	crossroads: StoryFlag.ENTERED_CROSSROADS,
	merchant: StoryFlag.MET_MERCHANT,
	fallen_knight: StoryFlag.MET_FALLEN_KNIGHT,
	oracle: StoryFlag.MET_ORACLE,
	fragment_ruins: StoryFlag.FRAGMENT_RUINS_OBTAINED,
	fragment_temple: StoryFlag.FRAGMENT_TEMPLE_OBTAINED,
	fragment_gate: StoryFlag.FRAGMENT_GATE_OBTAINED,
	sunstone: StoryFlag.SUNSTONE_RESTORED,
	dark_gate: StoryFlag.DARK_GATE_OPENED,
	citadel: StoryFlag.ENTERED_CITADEL,
	shadow_guardian: StoryFlag.SHADOW_GUARDIAN_DEFEATED,
	void_king: StoryFlag.VOID_KING_CONFRONTED,
};

/**
 * QuestLogScene - Displays player's quest progress and story tracking
 *
 * Features:
 * - Shows current act and progress
 * - Lists active and completed quests
 * - Displays Sunstone fragment collection status
 * - Scrollable quest list for mobile/small screens
 */
export class QuestLogScene extends Phaser.Scene {
	private panelComponent: PanelComponent | null = null;
	private storyFlags: NeverquestStoryFlags | null = null;
	private questTexts: Phaser.GameObjects.Text[] = [];
	private actHeader: Phaser.GameObjects.Text | null = null;
	private fragmentDisplay: Phaser.GameObjects.Text | null = null;
	private scrollContainer: Phaser.GameObjects.Container | null = null;
	private scrollMask: Phaser.GameObjects.Graphics | null = null;
	private contentHeight = 0;
	private scrollY = 0;
	private maxScroll = 0;

	// Layout constants
	private readonly CONTENT_PADDING_TOP = 100;
	private readonly CONTENT_PADDING_LEFT = 30;
	private readonly LINE_HEIGHT = 28;
	private readonly ACT_HEADER_SIZE = 16;
	private readonly QUEST_TITLE_SIZE = 12;
	private readonly QUEST_DESC_SIZE = 10;

	constructor() {
		super({ key: QuestLogSceneName });
	}

	init(data: IQuestLogSceneInitData): void {
		this.storyFlags = data.storyFlags || null;
	}

	create(): void {
		// Create panel background
		this.panelComponent = new PanelComponent(this);
		this.panelComponent.setTitleText('Quest Log');

		// Set up close button
		if (this.panelComponent.closeButton) {
			this.panelComponent.closeButton.on('pointerdown', () => {
				this.cleanup();
				this.scene.stop();
			});
		}

		// If no story flags provided, create a temporary one for display
		if (!this.storyFlags) {
			this.storyFlags = new NeverquestStoryFlags(this);
			this.storyFlags.load();
		}

		// Create scrollable content area
		this.createScrollableContent();

		// Build the quest display
		this.buildQuestDisplay();

		// Set up scroll handling
		this.setupScrolling();

		// Handle resize
		this.scale.on('resize', this.handleResize, this);
	}

	/**
	 * Create the scrollable content container
	 */
	private createScrollableContent(): void {
		const panel = this.panelComponent!.panelBackground;
		const contentX = panel.x + this.CONTENT_PADDING_LEFT;
		const contentY = panel.y + this.CONTENT_PADDING_TOP;
		const contentWidth = panel.width - this.CONTENT_PADDING_LEFT * 2;
		const contentHeight = panel.height - this.CONTENT_PADDING_TOP - 40;

		// Create container for scrollable content
		this.scrollContainer = this.add.container(contentX, contentY);

		// Create mask for scrolling
		this.scrollMask = this.add.graphics();
		this.scrollMask.fillStyle(0xffffff);
		this.scrollMask.fillRect(contentX, contentY, contentWidth, contentHeight);

		const mask = this.scrollMask.createGeometryMask();
		this.scrollContainer.setMask(mask);
	}

	/**
	 * Build the quest display content
	 */
	private buildQuestDisplay(): void {
		if (!this.scrollContainer || !this.storyFlags) return;

		let yOffset = 0;
		const currentAct = this.storyFlags.getCurrentAct();

		// Act header
		this.actHeader = this.add.text(0, yOffset, `Act ${currentAct}: ${this.getActName(currentAct)}`, {
			fontSize: `${this.ACT_HEADER_SIZE}px`,
			fontFamily: FontFamilies.PRESS_START_2P,
			color: Colors.GOLD,
		});
		this.scrollContainer.add(this.actHeader);
		yOffset += this.LINE_HEIGHT * 1.5;

		// Fragment progress (only show in Act 2+)
		if (currentAct >= 2) {
			const fragmentCount = this.storyFlags.getFragmentCount();
			this.fragmentDisplay = this.add.text(
				0,
				yOffset,
				`Sunstone Fragments: ${fragmentCount}/3 ${this.getFragmentIcons(fragmentCount)}`,
				{
					fontSize: `${this.QUEST_TITLE_SIZE}px`,
					fontFamily: FontFamilies.PRESS_START_2P,
					color: fragmentCount === 3 ? Colors.GREEN : Colors.WHITE,
				}
			);
			this.scrollContainer.add(this.fragmentDisplay);
			yOffset += this.LINE_HEIGHT * 1.5;
		}

		// Separator
		const separator = this.add.text(0, yOffset, '────────────────────', {
			fontSize: `${this.QUEST_DESC_SIZE}px`,
			fontFamily: FontFamilies.PRESS_START_2P,
			color: Colors.GRAY,
		});
		this.scrollContainer.add(separator);
		yOffset += this.LINE_HEIGHT;

		// Get quests with completion status
		const quests = this.getQuestsWithStatus();

		// Active quests section
		const activeQuests = quests.filter((q) => !q.completed && q.act <= currentAct);
		if (activeQuests.length > 0) {
			const activeHeader = this.add.text(0, yOffset, 'Active Quests:', {
				fontSize: `${this.QUEST_TITLE_SIZE}px`,
				fontFamily: FontFamilies.PRESS_START_2P,
				color: Colors.YELLOW,
			});
			this.scrollContainer.add(activeHeader);
			this.questTexts.push(activeHeader);
			yOffset += this.LINE_HEIGHT;

			for (const quest of activeQuests) {
				yOffset = this.addQuestEntry(quest, yOffset, false);
			}

			yOffset += this.LINE_HEIGHT * 0.5;
		}

		// Completed quests section
		const completedQuests = quests.filter((q) => q.completed);
		if (completedQuests.length > 0) {
			const completedHeader = this.add.text(0, yOffset, 'Completed:', {
				fontSize: `${this.QUEST_TITLE_SIZE}px`,
				fontFamily: FontFamilies.PRESS_START_2P,
				color: Colors.GREEN,
			});
			this.scrollContainer.add(completedHeader);
			this.questTexts.push(completedHeader);
			yOffset += this.LINE_HEIGHT;

			for (const quest of completedQuests) {
				yOffset = this.addQuestEntry(quest, yOffset, true);
			}
		}

		// Calculate content height for scrolling
		this.contentHeight = yOffset;
		const panel = this.panelComponent!.panelBackground;
		const visibleHeight = panel.height - this.CONTENT_PADDING_TOP - 40;
		this.maxScroll = Math.max(0, this.contentHeight - visibleHeight);
	}

	/**
	 * Add a quest entry to the display
	 */
	private addQuestEntry(quest: IQuestEntry, yOffset: number, completed: boolean): number {
		const checkmark = completed ? '[x]' : '[ ]';
		const titleColor = completed ? Colors.GRAY : Colors.WHITE;
		const descColor = completed ? Colors.DARK_GRAY : Colors.LIGHT_GRAY;

		// Quest title with checkbox
		const titleText = this.add.text(0, yOffset, `${checkmark} ${quest.title}`, {
			fontSize: `${this.QUEST_TITLE_SIZE}px`,
			fontFamily: FontFamilies.PRESS_START_2P,
			color: titleColor,
		});
		this.scrollContainer!.add(titleText);
		this.questTexts.push(titleText);
		yOffset += this.LINE_HEIGHT * 0.8;

		// Quest description (indented)
		const descText = this.add.text(24, yOffset, quest.description, {
			fontSize: `${this.QUEST_DESC_SIZE}px`,
			fontFamily: FontFamilies.PRESS_START_2P,
			color: descColor,
			wordWrap: { width: this.panelComponent!.panelBackground.width - 80 },
		});
		this.scrollContainer!.add(descText);
		this.questTexts.push(descText);

		// Calculate height based on wrapped text
		const textHeight = descText.height;
		yOffset += Math.max(this.LINE_HEIGHT, textHeight + 8);

		return yOffset;
	}

	/**
	 * Get quests with completion status from story flags
	 */
	private getQuestsWithStatus(): IQuestEntry[] {
		return QUEST_DEFINITIONS.map((quest) => {
			const flag = QUEST_FLAG_MAP[quest.id];
			const completed = flag ? this.storyFlags!.hasFlag(flag) : false;
			return { ...quest, completed };
		});
	}

	/**
	 * Get the name of an act
	 */
	private getActName(act: 1 | 2 | 3): string {
		switch (act) {
			case 1:
				return 'The Awakening';
			case 2:
				return 'The Journey';
			case 3:
				return 'The Reckoning';
		}
	}

	/**
	 * Get fragment icons for display
	 */
	private getFragmentIcons(count: number): string {
		const filled = '*'.repeat(count);
		const empty = 'o'.repeat(3 - count);
		return `[${filled}${empty}]`;
	}

	/**
	 * Set up mouse/touch scrolling
	 */
	private setupScrolling(): void {
		// Mouse wheel scrolling
		this.input.on(
			'wheel',
			(pointer: Phaser.Input.Pointer, gameObjects: unknown[], deltaX: number, deltaY: number) => {
				if (this.maxScroll > 0) {
					this.scrollY = Phaser.Math.Clamp(this.scrollY + deltaY * 0.5, 0, this.maxScroll);
					this.updateScrollPosition();
				}
			}
		);

		// Touch/drag scrolling
		let dragStartY = 0;
		let startScrollY = 0;

		this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
			if (this.isPointerInPanel(pointer)) {
				dragStartY = pointer.y;
				startScrollY = this.scrollY;
			}
		});

		this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
			if (pointer.isDown && this.isPointerInPanel(pointer)) {
				const delta = dragStartY - pointer.y;
				this.scrollY = Phaser.Math.Clamp(startScrollY + delta, 0, this.maxScroll);
				this.updateScrollPosition();
			}
		});
	}

	/**
	 * Check if pointer is within panel bounds
	 */
	private isPointerInPanel(pointer: Phaser.Input.Pointer): boolean {
		const panel = this.panelComponent!.panelBackground;
		return (
			pointer.x >= panel.x &&
			pointer.x <= panel.x + panel.width &&
			pointer.y >= panel.y + this.CONTENT_PADDING_TOP &&
			pointer.y <= panel.y + panel.height - 20
		);
	}

	/**
	 * Update scroll container position
	 */
	private updateScrollPosition(): void {
		if (this.scrollContainer) {
			const panel = this.panelComponent!.panelBackground;
			this.scrollContainer.y = panel.y + this.CONTENT_PADDING_TOP - this.scrollY;
		}
	}

	/**
	 * Handle window resize
	 */
	private handleResize(): void {
		// Rebuild display on resize
		this.cleanup();
		this.create();
	}

	/**
	 * Clean up resources
	 */
	private cleanup(): void {
		this.questTexts.forEach((text) => text.destroy());
		this.questTexts = [];

		if (this.actHeader) {
			this.actHeader.destroy();
			this.actHeader = null;
		}

		if (this.fragmentDisplay) {
			this.fragmentDisplay.destroy();
			this.fragmentDisplay = null;
		}

		if (this.scrollContainer) {
			this.scrollContainer.destroy();
			this.scrollContainer = null;
		}

		if (this.scrollMask) {
			this.scrollMask.destroy();
			this.scrollMask = null;
		}

		if (this.panelComponent) {
			this.panelComponent.destroy();
			this.panelComponent = null;
		}

		this.scale.off('resize', this.handleResize, this);
	}

	/**
	 * Refresh the quest display (call when story flags change)
	 */
	public refresh(): void {
		if (this.scrollContainer) {
			this.scrollContainer.removeAll(true);
		}
		this.questTexts = [];
		this.scrollY = 0;
		this.buildQuestDisplay();
	}
}
