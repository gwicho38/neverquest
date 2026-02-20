/**
 * @fileoverview Lore journal and collectible discovery tracker
 *
 * This scene displays collected lore entries:
 * - 5 categories (world, characters, items, creatures, locations)
 * - 21 discoverable lore entries
 * - Story flag-based unlocking
 * - Category tabs for navigation
 *
 * Encourages exploration and story engagement.
 *
 * @see NeverquestStoryFlags - Lore unlock tracking
 * @see HUDScene - Quick access button
 *
 * @module scenes/JournalScene
 */

import Phaser from 'phaser';
import { PanelComponent } from '../components/PanelComponent';
import { NeverquestStoryFlags, StoryFlag } from '../plugins/NeverquestStoryFlags';
import { FontFamilies } from '../consts/Numbers';
import { Colors } from '../consts/Colors';

export const JournalSceneName = 'JournalScene';

/**
 * Lore entry category
 */
export enum LoreCategory {
	WORLD = 'world',
	CHARACTERS = 'characters',
	ITEMS = 'items',
	CREATURES = 'creatures',
	LOCATIONS = 'locations',
}

/**
 * Interface for a lore entry
 */
export interface ILoreEntry {
	id: string;
	title: string;
	content: string;
	category: LoreCategory;
	discovered: boolean;
	unlockFlag?: StoryFlag;
}

/**
 * Interface for initialization data
 */
interface IJournalSceneInitData {
	storyFlags?: NeverquestStoryFlags;
	category?: LoreCategory;
}

/**
 * All lore entries organized by category
 */
export const LORE_ENTRIES: ILoreEntry[] = [
	// World Lore
	{
		id: 'world_ancient_kingdoms',
		title: 'The Ancient Kingdoms',
		content:
			'Long ago, five kingdoms ruled the land in harmony. Each kingdom was blessed by an elemental spirit, granting their people unique powers. The Sunstone was created to bind these powers together, maintaining balance.',
		category: LoreCategory.WORLD,
		discovered: false,
		unlockFlag: StoryFlag.MET_ELDER,
	},
	{
		id: 'world_void_war',
		title: 'The Void War',
		content:
			'When the Void King emerged from the darkness between worlds, the five kingdoms united against him. The final battle shattered the Sunstone into three fragments, sealing the Void King behind the Dark Gate.',
		category: LoreCategory.WORLD,
		discovered: false,
		unlockFlag: StoryFlag.RECEIVED_PROPHECY,
	},
	{
		id: 'world_crossroads',
		title: 'The Crossroads',
		content:
			'Built on neutral ground where all five kingdoms once met in council, the Crossroads became a haven for travelers and traders. Its position makes it the last bastion before the Dark Lands to the north.',
		category: LoreCategory.WORLD,
		discovered: false,
		unlockFlag: StoryFlag.ENTERED_CROSSROADS,
	},
	{
		id: 'world_dark_gate',
		title: 'The Dark Gate',
		content:
			'Constructed by the combined magic of the five kingdoms, the Dark Gate stands as the only barrier between our world and the Void. Only the restored Sunstone can open it safely.',
		category: LoreCategory.WORLD,
		discovered: false,
		unlockFlag: StoryFlag.DARK_GATE_OPENED,
	},

	// Character Lore
	{
		id: 'char_village_elder',
		title: 'The Village Elder',
		content:
			'One of the last survivors of the Void War. He guards the village with ancient knowledge passed down through generations. His staff was crafted from wood of the World Tree.',
		category: LoreCategory.CHARACTERS,
		discovered: false,
		unlockFlag: StoryFlag.MET_ELDER,
	},
	{
		id: 'char_fallen_knight',
		title: 'Sir Marcus - The Fallen Knight',
		content:
			"Once a champion of the Northern Kingdom, Sir Marcus fell defending the Dark Gate during the last great assault. His spirit now wanders the Crossroads, seeking redemption or revenge depending on one's choices.",
		category: LoreCategory.CHARACTERS,
		discovered: false,
		unlockFlag: StoryFlag.MET_FALLEN_KNIGHT,
	},
	{
		id: 'char_oracle',
		title: 'The Oracle of the Depths',
		content:
			'A mysterious seer who dwells in the caverns beneath the Crossroads. She claims to see all possible futures and speaks in riddles. Some say she was once a princess of the lost Eastern Kingdom.',
		category: LoreCategory.CHARACTERS,
		discovered: false,
		unlockFlag: StoryFlag.MET_ORACLE,
	},
	{
		id: 'char_merchant',
		title: 'The Wandering Merchant',
		content:
			'A traveler who has visited every corner of the known world. His wagon contains artifacts from all five kingdoms. He trades in rare goods and even rarer information.',
		category: LoreCategory.CHARACTERS,
		discovered: false,
		unlockFlag: StoryFlag.MET_MERCHANT,
	},
	{
		id: 'char_void_king',
		title: 'The Void King',
		content:
			'An entity from beyond reality itself. He seeks to unmake the world and consume all existence. His power grows with every soul that falls to despair. Only hope can truly wound him.',
		category: LoreCategory.CHARACTERS,
		discovered: false,
		unlockFlag: StoryFlag.VOID_KING_CONFRONTED,
	},

	// Item Lore
	{
		id: 'item_sunstone',
		title: 'The Sunstone',
		content:
			'A crystal that channels the combined power of the five elemental spirits. When whole, it can either seal or open the Dark Gate. Its three fragments pulse with dormant energy.',
		category: LoreCategory.ITEMS,
		discovered: false,
		unlockFlag: StoryFlag.SUNSTONE_RESTORED,
	},
	{
		id: 'item_fragment_ruins',
		title: 'Fragment of the Ruins',
		content:
			'This fragment contains the essence of Earth. It was hidden in the Ancient Ruins by the Western Kingdom. It glows with a steady brown light.',
		category: LoreCategory.ITEMS,
		discovered: false,
		unlockFlag: StoryFlag.FRAGMENT_RUINS_OBTAINED,
	},
	{
		id: 'item_fragment_temple',
		title: 'Fragment of the Temple',
		content:
			'This fragment contains the essence of Water. It was sealed in the Forgotten Temple by the Southern Kingdom. It shimmers with a cool blue radiance.',
		category: LoreCategory.ITEMS,
		discovered: false,
		unlockFlag: StoryFlag.FRAGMENT_TEMPLE_OBTAINED,
	},
	{
		id: 'item_fragment_gate',
		title: 'Fragment of the Gate',
		content:
			'This fragment contains the essence of Fire. It was left near the Dark Gate by the Northern Kingdom as a last defense. It burns with an eternal flame.',
		category: LoreCategory.ITEMS,
		discovered: false,
		unlockFlag: StoryFlag.FRAGMENT_GATE_OBTAINED,
	},

	// Creature Lore
	{
		id: 'creature_shadow_scout',
		title: 'Shadow Scouts',
		content:
			"Fragments of the Void King's consciousness given form. They roam the lands, searching for the Sunstone fragments. They cannot be truly killed - only dispersed temporarily.",
		category: LoreCategory.CREATURES,
		discovered: false,
		unlockFlag: StoryFlag.ENTERED_CROSSROADS,
	},
	{
		id: 'creature_shadow_guardian',
		title: 'The Shadow Guardian',
		content:
			'A massive construct of pure void energy that guards the entrance to the Dark Citadel. It was created from the souls of fallen warriors and can only be defeated by the light of the Sunstone.',
		category: LoreCategory.CREATURES,
		discovered: false,
		unlockFlag: StoryFlag.SHADOW_GUARDIAN_DEFEATED,
	},
	{
		id: 'creature_cave_guardian',
		title: 'The Cave Guardian',
		content:
			'An ancient golem created by the Eastern Kingdom to protect their treasures. It has slumbered for centuries but awakens when intruders approach the artifact chamber.',
		category: LoreCategory.CREATURES,
		discovered: false,
		unlockFlag: StoryFlag.CAVE_BOSS_DEFEATED,
	},

	// Location Lore
	{
		id: 'loc_village',
		title: 'The Forest Village',
		content:
			"A small settlement at the edge of the Great Forest. Once part of the Eastern Kingdom, it now stands alone as a refuge for those seeking peace. The villagers are descendants of the kingdom's refugees.",
		category: LoreCategory.LOCATIONS,
		discovered: false,
		unlockFlag: StoryFlag.INTRO_COMPLETE,
	},
	{
		id: 'loc_cave',
		title: 'The Sealed Cave',
		content:
			'A network of tunnels beneath the forest. The Eastern Kingdom used it to store their most valuable artifacts. Its deepest chambers hold secrets from before the Void War.',
		category: LoreCategory.LOCATIONS,
		discovered: false,
		unlockFlag: StoryFlag.CAVE_ARTIFACT_RETRIEVED,
	},
	{
		id: 'loc_ruins',
		title: 'The Ancient Ruins',
		content:
			'All that remains of the Western Kingdom capital. Its crumbling walls still echo with the power of Earth magic. Strange plants grow among the rubble.',
		category: LoreCategory.LOCATIONS,
		discovered: false,
		unlockFlag: StoryFlag.FRAGMENT_RUINS_OBTAINED,
	},
	{
		id: 'loc_temple',
		title: 'The Forgotten Temple',
		content:
			'A sacred site of the Southern Kingdom, now flooded and abandoned. Its underwater chambers are protected by ancient water spirits who still remember their duty.',
		category: LoreCategory.LOCATIONS,
		discovered: false,
		unlockFlag: StoryFlag.FRAGMENT_TEMPLE_OBTAINED,
	},
	{
		id: 'loc_citadel',
		title: 'The Dark Citadel',
		content:
			"The Void King's fortress, built from crystallized despair. Its very walls drain hope from those who enter. Only those with strong resolve can survive its halls.",
		category: LoreCategory.LOCATIONS,
		discovered: false,
		unlockFlag: StoryFlag.ENTERED_CITADEL,
	},
];

/**
 * Category display names and icons
 */
const CATEGORY_INFO: Record<LoreCategory, { name: string; icon: string }> = {
	[LoreCategory.WORLD]: { name: 'World History', icon: '*' },
	[LoreCategory.CHARACTERS]: { name: 'Characters', icon: '@' },
	[LoreCategory.ITEMS]: { name: 'Artifacts', icon: '!' },
	[LoreCategory.CREATURES]: { name: 'Bestiary', icon: '&' },
	[LoreCategory.LOCATIONS]: { name: 'Locations', icon: '#' },
};

/**
 * JournalScene - Displays collected lore and world information
 *
 * Features:
 * - Category tabs for organization
 * - Discovered/undiscovered entry tracking
 * - Detailed lore text display
 * - Story flag integration for unlocks
 * - Scrollable content
 */
export class JournalScene extends Phaser.Scene {
	private panelComponent: PanelComponent | null = null;
	private storyFlags: NeverquestStoryFlags | null = null;
	private currentCategory: LoreCategory = LoreCategory.WORLD;
	private selectedEntry: ILoreEntry | null = null;
	private categoryTabs: Phaser.GameObjects.Text[] = [];
	private entryList: Phaser.GameObjects.Text[] = [];
	private contentTexts: Phaser.GameObjects.Text[] = [];
	private scrollContainer: Phaser.GameObjects.Container | null = null;
	private scrollMask: Phaser.GameObjects.Graphics | null = null;
	private contentHeight = 0;
	private scrollY = 0;
	private maxScroll = 0;

	// Layout constants
	private readonly CONTENT_PADDING_TOP = 100;
	private readonly CONTENT_PADDING_LEFT = 30;
	private readonly TAB_HEIGHT = 30;
	private readonly ENTRY_LIST_WIDTH = 150;
	private readonly LINE_HEIGHT = 24;
	private readonly TAB_SIZE = 10;
	private readonly ENTRY_SIZE = 10;
	private readonly CONTENT_SIZE = 11;

	constructor() {
		super({ key: JournalSceneName });
	}

	init(data: IJournalSceneInitData): void {
		this.storyFlags = data?.storyFlags || null;
		this.currentCategory = data?.category || LoreCategory.WORLD;
	}

	create(): void {
		// Create panel background
		this.panelComponent = new PanelComponent(this);
		this.panelComponent.setTitleText('Journal');

		// Set up close button
		if (this.panelComponent.closeButton) {
			this.panelComponent.closeButton.on('pointerdown', () => {
				this.cleanup();
				this.scene.stop();
			});
		}

		// If no story flags provided, create a temporary one
		if (!this.storyFlags) {
			this.storyFlags = new NeverquestStoryFlags(this);
			this.storyFlags.load();
		}

		// Build the UI
		this.buildCategoryTabs();
		this.buildEntryList();
		this.buildContentArea();

		// Set up scroll handling
		this.setupScrolling();

		// Handle resize
		this.scale.on('resize', this.handleResize, this);
	}

	/**
	 * Build category tab buttons
	 */
	private buildCategoryTabs(): void {
		const panel = this.panelComponent!.panelBackground;
		const startX = panel.x + this.CONTENT_PADDING_LEFT;
		const startY = panel.y + 70;
		let xOffset = 0;

		Object.values(LoreCategory).forEach((category) => {
			const info = CATEGORY_INFO[category];
			const isActive = category === this.currentCategory;
			const discovered = this.getDiscoveredCount(category);
			const total = this.getTotalCount(category);

			const tabText = this.add.text(startX + xOffset, startY, `${info.icon} ${discovered}/${total}`, {
				fontSize: `${this.TAB_SIZE}px`,
				fontFamily: FontFamilies.PRESS_START_2P,
				color: isActive ? Colors.GOLD : discovered > 0 ? Colors.WHITE : Colors.GRAY,
				backgroundColor: isActive ? '#333333' : undefined,
				padding: { x: 4, y: 4 },
			});

			tabText.setInteractive({ useHandCursor: true });
			tabText.on('pointerdown', () => this.selectCategory(category));
			tabText.on('pointerover', () => {
				if (category !== this.currentCategory) {
					tabText.setColor(Colors.YELLOW);
				}
			});
			tabText.on('pointerout', () => {
				if (category !== this.currentCategory) {
					tabText.setColor(discovered > 0 ? Colors.WHITE : Colors.GRAY);
				}
			});

			this.categoryTabs.push(tabText);
			xOffset += tabText.width + 10;
		});
	}

	/**
	 * Build the entry list for current category
	 */
	private buildEntryList(): void {
		const panel = this.panelComponent!.panelBackground;
		const startX = panel.x + this.CONTENT_PADDING_LEFT;
		const startY = panel.y + this.CONTENT_PADDING_TOP + this.TAB_HEIGHT;
		let yOffset = 0;

		const entries = this.getEntriesForCategory(this.currentCategory);

		entries.forEach((entry) => {
			const isDiscovered = this.isEntryDiscovered(entry);
			const isSelected = this.selectedEntry?.id === entry.id;
			const displayTitle = isDiscovered ? entry.title : '???';
			const color = isSelected ? Colors.GOLD : isDiscovered ? Colors.WHITE : Colors.DARK_GRAY;

			const entryText = this.add.text(startX, startY + yOffset, `> ${displayTitle}`, {
				fontSize: `${this.ENTRY_SIZE}px`,
				fontFamily: FontFamilies.PRESS_START_2P,
				color: color,
				wordWrap: { width: this.ENTRY_LIST_WIDTH },
			});

			if (isDiscovered) {
				entryText.setInteractive({ useHandCursor: true });
				entryText.on('pointerdown', () => this.selectEntry(entry));
				entryText.on('pointerover', () => {
					if (entry.id !== this.selectedEntry?.id) {
						entryText.setColor(Colors.YELLOW);
					}
				});
				entryText.on('pointerout', () => {
					if (entry.id !== this.selectedEntry?.id) {
						entryText.setColor(Colors.WHITE);
					}
				});
			}

			this.entryList.push(entryText);
			yOffset += Math.max(this.LINE_HEIGHT, entryText.height + 4);
		});

		// Auto-select first discovered entry if none selected
		if (!this.selectedEntry) {
			const firstDiscovered = entries.find((e) => this.isEntryDiscovered(e));
			if (firstDiscovered) {
				this.selectEntry(firstDiscovered);
			}
		}
	}

	/**
	 * Build the content display area
	 */
	private buildContentArea(): void {
		const panel = this.panelComponent!.panelBackground;
		const contentX = panel.x + this.CONTENT_PADDING_LEFT + this.ENTRY_LIST_WIDTH + 20;
		const contentY = panel.y + this.CONTENT_PADDING_TOP + this.TAB_HEIGHT;
		const contentWidth = panel.width - this.ENTRY_LIST_WIDTH - this.CONTENT_PADDING_LEFT * 2 - 20;
		const contentHeight = panel.height - this.CONTENT_PADDING_TOP - this.TAB_HEIGHT - 40;

		// Create container for scrollable content
		this.scrollContainer = this.add.container(contentX, contentY);

		// Create mask for scrolling
		this.scrollMask = this.add.graphics();
		this.scrollMask.fillStyle(0xffffff);
		this.scrollMask.fillRect(contentX, contentY, contentWidth, contentHeight);

		const mask = this.scrollMask.createGeometryMask();
		this.scrollContainer.setMask(mask);

		// Display selected entry content
		this.displayEntryContent(contentWidth);
	}

	/**
	 * Display the content of the selected entry
	 */
	private displayEntryContent(maxWidth: number): void {
		if (!this.scrollContainer) return;

		// Clear existing content
		this.contentTexts.forEach((t) => t.destroy());
		this.contentTexts = [];

		let yOffset = 0;

		if (this.selectedEntry) {
			// Entry title
			const titleText = this.add.text(0, yOffset, this.selectedEntry.title, {
				fontSize: '14px',
				fontFamily: FontFamilies.PRESS_START_2P,
				color: Colors.GOLD,
			});
			this.scrollContainer.add(titleText);
			this.contentTexts.push(titleText);
			yOffset += this.LINE_HEIGHT * 1.5;

			// Category label
			const categoryInfo = CATEGORY_INFO[this.selectedEntry.category];
			const categoryText = this.add.text(0, yOffset, `[${categoryInfo.name}]`, {
				fontSize: `${this.ENTRY_SIZE}px`,
				fontFamily: FontFamilies.PRESS_START_2P,
				color: Colors.CYAN,
			});
			this.scrollContainer.add(categoryText);
			this.contentTexts.push(categoryText);
			yOffset += this.LINE_HEIGHT * 1.5;

			// Separator
			const separator = this.add.text(0, yOffset, '─'.repeat(20), {
				fontSize: `${this.ENTRY_SIZE}px`,
				fontFamily: FontFamilies.PRESS_START_2P,
				color: Colors.GRAY,
			});
			this.scrollContainer.add(separator);
			this.contentTexts.push(separator);
			yOffset += this.LINE_HEIGHT;

			// Entry content
			const contentText = this.add.text(0, yOffset, this.selectedEntry.content, {
				fontSize: `${this.CONTENT_SIZE}px`,
				fontFamily: FontFamilies.PRESS_START_2P,
				color: Colors.WHITE,
				wordWrap: { width: maxWidth - 20 },
				lineSpacing: 6,
			});
			this.scrollContainer.add(contentText);
			this.contentTexts.push(contentText);
			yOffset += contentText.height + this.LINE_HEIGHT;
		} else {
			// No entry selected message
			const noEntryText = this.add.text(0, yOffset, 'Select an entry\nto view details.', {
				fontSize: `${this.CONTENT_SIZE}px`,
				fontFamily: FontFamilies.PRESS_START_2P,
				color: Colors.GRAY,
				align: 'center',
			});
			this.scrollContainer.add(noEntryText);
			this.contentTexts.push(noEntryText);
			yOffset += noEntryText.height;
		}

		// Calculate content height for scrolling
		this.contentHeight = yOffset;
		const panel = this.panelComponent!.panelBackground;
		const visibleHeight = panel.height - this.CONTENT_PADDING_TOP - this.TAB_HEIGHT - 40;
		this.maxScroll = Math.max(0, this.contentHeight - visibleHeight);
	}

	/**
	 * Select a category tab
	 */
	private selectCategory(category: LoreCategory): void {
		if (category === this.currentCategory) return;

		this.currentCategory = category;
		this.selectedEntry = null;
		this.scrollY = 0;

		// Rebuild UI
		this.clearEntryList();
		this.clearCategoryTabs();
		this.buildCategoryTabs();
		this.buildEntryList();

		// Rebuild content area
		const panel = this.panelComponent!.panelBackground;
		const contentWidth = panel.width - this.ENTRY_LIST_WIDTH - this.CONTENT_PADDING_LEFT * 2 - 20;
		this.displayEntryContent(contentWidth);
	}

	/**
	 * Select a lore entry
	 */
	private selectEntry(entry: ILoreEntry): void {
		if (entry.id === this.selectedEntry?.id) return;

		this.selectedEntry = entry;
		this.scrollY = 0;

		// Update entry list highlighting
		const entries = this.getEntriesForCategory(this.currentCategory);
		this.entryList.forEach((text, index) => {
			const e = entries[index];
			if (e && this.isEntryDiscovered(e)) {
				text.setColor(e.id === entry.id ? Colors.GOLD : Colors.WHITE);
			}
		});

		// Rebuild content
		const panel = this.panelComponent!.panelBackground;
		const contentWidth = panel.width - this.ENTRY_LIST_WIDTH - this.CONTENT_PADDING_LEFT * 2 - 20;
		this.displayEntryContent(contentWidth);
	}

	/**
	 * Get entries for a specific category
	 */
	private getEntriesForCategory(category: LoreCategory): ILoreEntry[] {
		return LORE_ENTRIES.filter((e) => e.category === category);
	}

	/**
	 * Check if an entry is discovered based on story flags
	 */
	private isEntryDiscovered(entry: ILoreEntry): boolean {
		if (!entry.unlockFlag) return true;
		if (!this.storyFlags) return false;
		return this.storyFlags.hasFlag(entry.unlockFlag);
	}

	/**
	 * Get count of discovered entries in a category
	 */
	private getDiscoveredCount(category: LoreCategory): number {
		return this.getEntriesForCategory(category).filter((e) => this.isEntryDiscovered(e)).length;
	}

	/**
	 * Get total count of entries in a category
	 */
	private getTotalCount(category: LoreCategory): number {
		return this.getEntriesForCategory(category).length;
	}

	/**
	 * Clear category tabs
	 */
	private clearCategoryTabs(): void {
		this.categoryTabs.forEach((t) => t.destroy());
		this.categoryTabs = [];
	}

	/**
	 * Clear entry list
	 */
	private clearEntryList(): void {
		this.entryList.forEach((t) => t.destroy());
		this.entryList = [];
	}

	/**
	 * Set up scrolling for content area
	 */
	private setupScrolling(): void {
		// Mouse wheel scrolling
		this.input.on(
			'wheel',
			(_pointer: Phaser.Input.Pointer, _gameObjects: unknown[], _deltaX: number, deltaY: number) => {
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
			if (this.isPointerInContentArea(pointer)) {
				dragStartY = pointer.y;
				startScrollY = this.scrollY;
			}
		});

		this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
			if (pointer.isDown && this.isPointerInContentArea(pointer)) {
				const delta = dragStartY - pointer.y;
				this.scrollY = Phaser.Math.Clamp(startScrollY + delta, 0, this.maxScroll);
				this.updateScrollPosition();
			}
		});
	}

	/**
	 * Check if pointer is in content area
	 */
	private isPointerInContentArea(pointer: Phaser.Input.Pointer): boolean {
		const panel = this.panelComponent!.panelBackground;
		const contentX = panel.x + this.CONTENT_PADDING_LEFT + this.ENTRY_LIST_WIDTH + 20;
		const contentY = panel.y + this.CONTENT_PADDING_TOP + this.TAB_HEIGHT;
		const contentWidth = panel.width - this.ENTRY_LIST_WIDTH - this.CONTENT_PADDING_LEFT * 2 - 20;
		const contentHeight = panel.height - this.CONTENT_PADDING_TOP - this.TAB_HEIGHT - 40;

		return (
			pointer.x >= contentX &&
			pointer.x <= contentX + contentWidth &&
			pointer.y >= contentY &&
			pointer.y <= contentY + contentHeight
		);
	}

	/**
	 * Update scroll container position
	 */
	private updateScrollPosition(): void {
		if (this.scrollContainer) {
			const panel = this.panelComponent!.panelBackground;
			const contentY = panel.y + this.CONTENT_PADDING_TOP + this.TAB_HEIGHT;
			this.scrollContainer.y = contentY - this.scrollY;
		}
	}

	/**
	 * Handle window resize
	 */
	private handleResize(): void {
		this.cleanup();
		this.create();
	}

	/**
	 * Clean up resources
	 */
	private cleanup(): void {
		this.clearCategoryTabs();
		this.clearEntryList();
		this.contentTexts.forEach((t) => t.destroy());
		this.contentTexts = [];

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
	 * Refresh the journal display
	 */
	public refresh(): void {
		this.cleanup();
		this.create();
	}

	/**
	 * Get all discovered lore entries
	 */
	public getDiscoveredEntries(): ILoreEntry[] {
		return LORE_ENTRIES.filter((e) => this.isEntryDiscovered(e));
	}

	/**
	 * Get total discovery progress percentage
	 */
	public getDiscoveryProgress(): number {
		const total = LORE_ENTRIES.length;
		if (total === 0) return 0;
		const discovered = this.getDiscoveredEntries().length;
		return Math.round((discovered / total) * 100);
	}
}
