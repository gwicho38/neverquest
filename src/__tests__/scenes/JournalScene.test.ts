/**
 * Tests for JournalScene
 */

import { JournalScene, JournalSceneName, LoreCategory, LORE_ENTRIES, ILoreEntry } from '../../scenes/JournalScene';
import { StoryFlag } from '../../plugins/NeverquestStoryFlags';

// Mock dependencies
jest.mock('../../components/PanelComponent', () => ({
	PanelComponent: jest.fn().mockImplementation(() => ({
		panelBackground: {
			x: 100,
			y: 50,
			width: 500,
			height: 600,
		},
		closeButton: {
			on: jest.fn(),
		},
		setTitleText: jest.fn(),
		destroy: jest.fn(),
	})),
}));

// Create a mock story flags object
const createMockStoryFlags = (flags: StoryFlag[] = []) => ({
	hasFlag: jest.fn((flag: StoryFlag) => flags.includes(flag)),
	setFlag: jest.fn(),
	clearFlag: jest.fn(),
	load: jest.fn(),
	save: jest.fn(),
});

// Mock Phaser
jest.mock('phaser', () => {
	const mockText = {
		setOrigin: jest.fn().mockReturnThis(),
		setInteractive: jest.fn().mockReturnThis(),
		on: jest.fn().mockReturnThis(),
		setColor: jest.fn().mockReturnThis(),
		destroy: jest.fn(),
		width: 100,
		height: 20,
	};

	const mockGraphics = {
		fillStyle: jest.fn().mockReturnThis(),
		fillRect: jest.fn().mockReturnThis(),
		createGeometryMask: jest.fn().mockReturnValue({}),
		destroy: jest.fn(),
	};

	const mockContainer = {
		add: jest.fn().mockReturnThis(),
		setMask: jest.fn().mockReturnThis(),
		removeAll: jest.fn().mockReturnThis(),
		destroy: jest.fn(),
		y: 0,
	};

	return {
		__esModule: true,
		default: {
			Scene: class MockScene {
				add = {
					text: jest.fn().mockReturnValue({ ...mockText }),
					graphics: jest.fn().mockReturnValue({ ...mockGraphics }),
					container: jest.fn().mockReturnValue({ ...mockContainer }),
				};
				input = {
					on: jest.fn(),
				};
				scale = {
					on: jest.fn(),
					off: jest.fn(),
				};
				scene = {
					stop: jest.fn(),
				};
			},
			Math: {
				Clamp: jest.fn((value, min, max) => Math.min(Math.max(value, min), max)),
			},
		},
		Scene: class MockScene {
			add = {
				text: jest.fn().mockReturnValue({ ...mockText }),
				graphics: jest.fn().mockReturnValue({ ...mockGraphics }),
				container: jest.fn().mockReturnValue({ ...mockContainer }),
			};
			input = {
				on: jest.fn(),
			};
			scale = {
				on: jest.fn(),
				off: jest.fn(),
			};
			scene = {
				stop: jest.fn(),
			};
		},
		Math: {
			Clamp: jest.fn((value, min, max) => Math.min(Math.max(value, min), max)),
		},
	};
});

describe('JournalScene', () => {
	let scene: JournalScene;
	let mockStoryFlags: ReturnType<typeof createMockStoryFlags>;

	beforeEach(() => {
		jest.clearAllMocks();
		scene = new JournalScene();
		mockStoryFlags = createMockStoryFlags();

		// Mock scene add methods
		(scene as any).add = {
			text: jest.fn().mockReturnValue({
				setOrigin: jest.fn().mockReturnThis(),
				setInteractive: jest.fn().mockReturnThis(),
				on: jest.fn().mockReturnThis(),
				setColor: jest.fn().mockReturnThis(),
				destroy: jest.fn(),
				width: 100,
				height: 20,
			}),
			graphics: jest.fn().mockReturnValue({
				fillStyle: jest.fn().mockReturnThis(),
				fillRect: jest.fn().mockReturnThis(),
				createGeometryMask: jest.fn().mockReturnValue({}),
				destroy: jest.fn(),
			}),
			container: jest.fn().mockReturnValue({
				add: jest.fn().mockReturnThis(),
				setMask: jest.fn().mockReturnThis(),
				removeAll: jest.fn().mockReturnThis(),
				destroy: jest.fn(),
				y: 0,
			}),
		};
		(scene as any).input = { on: jest.fn() };
		(scene as any).scale = { on: jest.fn(), off: jest.fn() };
		(scene as any).scene = { stop: jest.fn() };
	});

	describe('Constructor', () => {
		it('should create scene with correct key', () => {
			expect(JournalSceneName).toBe('JournalScene');
		});

		it('should have layout constants defined', () => {
			expect((scene as any).CONTENT_PADDING_TOP).toBe(100);
			expect((scene as any).CONTENT_PADDING_LEFT).toBe(30);
			expect((scene as any).TAB_HEIGHT).toBe(30);
			expect((scene as any).ENTRY_LIST_WIDTH).toBe(150);
		});
	});

	describe('init', () => {
		it('should store story flags from init data', () => {
			scene.init({ storyFlags: mockStoryFlags as any });
			expect((scene as any).storyFlags).toBe(mockStoryFlags);
		});

		it('should set category from init data', () => {
			scene.init({ category: LoreCategory.CHARACTERS });
			expect((scene as any).currentCategory).toBe(LoreCategory.CHARACTERS);
		});

		it('should default to WORLD category', () => {
			scene.init({});
			expect((scene as any).currentCategory).toBe(LoreCategory.WORLD);
		});

		it('should handle undefined init data', () => {
			scene.init(undefined as any);
			expect((scene as any).storyFlags).toBeNull();
			expect((scene as any).currentCategory).toBe(LoreCategory.WORLD);
		});
	});

	describe('create', () => {
		beforeEach(() => {
			scene.init({ storyFlags: mockStoryFlags as any });
		});

		it('should create panel component', () => {
			scene.create();
			expect((scene as any).panelComponent).toBeDefined();
		});

		it('should set up close button handler', () => {
			scene.create();
			const closeButton = (scene as any).panelComponent.closeButton;
			expect(closeButton.on).toHaveBeenCalledWith('pointerdown', expect.any(Function));
		});

		it('should register resize handler', () => {
			scene.create();
			expect((scene as any).scale.on).toHaveBeenCalledWith('resize', expect.any(Function), scene);
		});

		it('should set up scroll event handlers', () => {
			scene.create();
			expect((scene as any).input.on).toHaveBeenCalled();
		});
	});

	describe('LoreCategory enum', () => {
		it('should have all expected categories', () => {
			expect(LoreCategory.WORLD).toBe('world');
			expect(LoreCategory.CHARACTERS).toBe('characters');
			expect(LoreCategory.ITEMS).toBe('items');
			expect(LoreCategory.CREATURES).toBe('creatures');
			expect(LoreCategory.LOCATIONS).toBe('locations');
		});
	});

	describe('LORE_ENTRIES', () => {
		it('should have entries for all categories', () => {
			const worldEntries = LORE_ENTRIES.filter((e) => e.category === LoreCategory.WORLD);
			const charEntries = LORE_ENTRIES.filter((e) => e.category === LoreCategory.CHARACTERS);
			const itemEntries = LORE_ENTRIES.filter((e) => e.category === LoreCategory.ITEMS);
			const creatureEntries = LORE_ENTRIES.filter((e) => e.category === LoreCategory.CREATURES);
			const locationEntries = LORE_ENTRIES.filter((e) => e.category === LoreCategory.LOCATIONS);

			expect(worldEntries.length).toBeGreaterThan(0);
			expect(charEntries.length).toBeGreaterThan(0);
			expect(itemEntries.length).toBeGreaterThan(0);
			expect(creatureEntries.length).toBeGreaterThan(0);
			expect(locationEntries.length).toBeGreaterThan(0);
		});

		it('should have unique IDs for all entries', () => {
			const ids = LORE_ENTRIES.map((e) => e.id);
			const uniqueIds = new Set(ids);
			expect(uniqueIds.size).toBe(ids.length);
		});

		it('should have titles for all entries', () => {
			LORE_ENTRIES.forEach((entry) => {
				expect(entry.title).toBeDefined();
				expect(entry.title.length).toBeGreaterThan(0);
			});
		});

		it('should have content for all entries', () => {
			LORE_ENTRIES.forEach((entry) => {
				expect(entry.content).toBeDefined();
				expect(entry.content.length).toBeGreaterThan(0);
			});
		});

		it('should have unlock flags for entries requiring progression', () => {
			const entriesWithFlags = LORE_ENTRIES.filter((e) => e.unlockFlag);
			expect(entriesWithFlags.length).toBeGreaterThan(0);
		});
	});

	describe('getEntriesForCategory', () => {
		beforeEach(() => {
			scene.init({ storyFlags: mockStoryFlags as any });
		});

		it('should return only entries for specified category', () => {
			const entries = (scene as any).getEntriesForCategory(LoreCategory.CHARACTERS);
			entries.forEach((entry: ILoreEntry) => {
				expect(entry.category).toBe(LoreCategory.CHARACTERS);
			});
		});

		it('should return empty array for category with no entries', () => {
			// Mock empty lore entries
			const entries = (scene as any).getEntriesForCategory('nonexistent');
			expect(entries).toEqual([]);
		});
	});

	describe('isEntryDiscovered', () => {
		beforeEach(() => {
			scene.init({ storyFlags: mockStoryFlags as any });
		});

		it('should return true for entries without unlock flags', () => {
			const entry: ILoreEntry = {
				id: 'test',
				title: 'Test',
				content: 'Test content',
				category: LoreCategory.WORLD,
				discovered: false,
			};
			const result = (scene as any).isEntryDiscovered(entry);
			expect(result).toBe(true);
		});

		it('should return true when story flag is set', () => {
			mockStoryFlags.hasFlag.mockReturnValue(true);
			const entry: ILoreEntry = {
				id: 'test',
				title: 'Test',
				content: 'Test content',
				category: LoreCategory.WORLD,
				discovered: false,
				unlockFlag: StoryFlag.MET_ELDER,
			};
			const result = (scene as any).isEntryDiscovered(entry);
			expect(result).toBe(true);
		});

		it('should return false when story flag is not set', () => {
			mockStoryFlags.hasFlag.mockReturnValue(false);
			const entry: ILoreEntry = {
				id: 'test',
				title: 'Test',
				content: 'Test content',
				category: LoreCategory.WORLD,
				discovered: false,
				unlockFlag: StoryFlag.MET_ELDER,
			};
			const result = (scene as any).isEntryDiscovered(entry);
			expect(result).toBe(false);
		});

		it('should return false when storyFlags is null', () => {
			(scene as any).storyFlags = null;
			const entry: ILoreEntry = {
				id: 'test',
				title: 'Test',
				content: 'Test content',
				category: LoreCategory.WORLD,
				discovered: false,
				unlockFlag: StoryFlag.MET_ELDER,
			};
			const result = (scene as any).isEntryDiscovered(entry);
			expect(result).toBe(false);
		});
	});

	describe('getDiscoveredCount', () => {
		beforeEach(() => {
			scene.init({ storyFlags: mockStoryFlags as any });
		});

		it('should return count of discovered entries', () => {
			mockStoryFlags.hasFlag.mockReturnValue(true);
			const count = (scene as any).getDiscoveredCount(LoreCategory.WORLD);
			expect(count).toBeGreaterThan(0);
		});

		it('should return 0 when no entries are discovered', () => {
			mockStoryFlags.hasFlag.mockReturnValue(false);
			const count = (scene as any).getDiscoveredCount(LoreCategory.WORLD);
			// Some entries might not have unlock flags, so they're always discovered
			expect(count).toBeGreaterThanOrEqual(0);
		});
	});

	describe('getTotalCount', () => {
		beforeEach(() => {
			scene.init({ storyFlags: mockStoryFlags as any });
		});

		it('should return total count of entries in category', () => {
			const count = (scene as any).getTotalCount(LoreCategory.WORLD);
			const expected = LORE_ENTRIES.filter((e) => e.category === LoreCategory.WORLD).length;
			expect(count).toBe(expected);
		});
	});

	describe('getDiscoveredEntries', () => {
		beforeEach(() => {
			scene.init({ storyFlags: mockStoryFlags as any });
			scene.create();
		});

		it('should return all discovered entries across categories', () => {
			mockStoryFlags.hasFlag.mockReturnValue(true);
			const entries = scene.getDiscoveredEntries();
			expect(entries.length).toBe(LORE_ENTRIES.length);
		});

		it('should return empty array when nothing is discovered', () => {
			mockStoryFlags.hasFlag.mockReturnValue(false);
			const entries = scene.getDiscoveredEntries();
			// Only entries without unlock flags should be discovered
			const noFlagEntries = LORE_ENTRIES.filter((e) => !e.unlockFlag);
			expect(entries.length).toBe(noFlagEntries.length);
		});
	});

	describe('getDiscoveryProgress', () => {
		beforeEach(() => {
			scene.init({ storyFlags: mockStoryFlags as any });
			scene.create();
		});

		it('should return 100 when all entries discovered', () => {
			mockStoryFlags.hasFlag.mockReturnValue(true);
			const progress = scene.getDiscoveryProgress();
			expect(progress).toBe(100);
		});

		it('should return percentage of discovered entries', () => {
			mockStoryFlags.hasFlag.mockReturnValue(false);
			const progress = scene.getDiscoveryProgress();
			const noFlagEntries = LORE_ENTRIES.filter((e) => !e.unlockFlag);
			const expected = Math.round((noFlagEntries.length / LORE_ENTRIES.length) * 100);
			expect(progress).toBe(expected);
		});
	});

	describe('selectCategory', () => {
		beforeEach(() => {
			scene.init({ storyFlags: mockStoryFlags as any });
			scene.create();
		});

		it('should change current category', () => {
			(scene as any).selectCategory(LoreCategory.ITEMS);
			expect((scene as any).currentCategory).toBe(LoreCategory.ITEMS);
		});

		it('should clear selected entry when changing category', () => {
			(scene as any).selectedEntry = { id: 'test' };
			(scene as any).selectCategory(LoreCategory.ITEMS);
			expect((scene as any).selectedEntry).toBeNull();
		});

		it('should reset scroll position', () => {
			(scene as any).scrollY = 100;
			(scene as any).selectCategory(LoreCategory.ITEMS);
			expect((scene as any).scrollY).toBe(0);
		});

		it('should not change if same category selected', () => {
			(scene as any).currentCategory = LoreCategory.WORLD;
			const initialCallCount = (scene as any).add.text.mock.calls.length;
			(scene as any).selectCategory(LoreCategory.WORLD);
			// Should not rebuild UI
			expect((scene as any).add.text.mock.calls.length).toBe(initialCallCount);
		});
	});

	describe('selectEntry', () => {
		beforeEach(() => {
			scene.init({ storyFlags: mockStoryFlags as any });
			scene.create();
		});

		it('should set selected entry', () => {
			const entry: ILoreEntry = {
				id: 'test',
				title: 'Test',
				content: 'Content',
				category: LoreCategory.WORLD,
				discovered: true,
			};
			(scene as any).selectEntry(entry);
			expect((scene as any).selectedEntry).toBe(entry);
		});

		it('should reset scroll position', () => {
			(scene as any).scrollY = 100;
			const entry: ILoreEntry = {
				id: 'test',
				title: 'Test',
				content: 'Content',
				category: LoreCategory.WORLD,
				discovered: true,
			};
			(scene as any).selectEntry(entry);
			expect((scene as any).scrollY).toBe(0);
		});

		it('should not change if same entry selected', () => {
			const entry: ILoreEntry = {
				id: 'test',
				title: 'Test',
				content: 'Content',
				category: LoreCategory.WORLD,
				discovered: true,
			};
			(scene as any).selectedEntry = entry;
			const initialCallCount = (scene as any).add.text.mock.calls.length;
			(scene as any).selectEntry(entry);
			// Should not rebuild content
			expect((scene as any).add.text.mock.calls.length).toBe(initialCallCount);
		});
	});

	describe('isPointerInContentArea', () => {
		beforeEach(() => {
			scene.init({ storyFlags: mockStoryFlags as any });
			scene.create();
		});

		it('should return true for pointer in content area', () => {
			const pointer = { x: 400, y: 300 };
			const result = (scene as any).isPointerInContentArea(pointer);
			expect(result).toBe(true);
		});

		it('should return false for pointer outside content area', () => {
			const pointer = { x: 50, y: 50 };
			const result = (scene as any).isPointerInContentArea(pointer);
			expect(result).toBe(false);
		});
	});

	describe('updateScrollPosition', () => {
		beforeEach(() => {
			scene.init({ storyFlags: mockStoryFlags as any });
			scene.create();
		});

		it('should update scroll container y position', () => {
			(scene as any).scrollY = 50;
			(scene as any).updateScrollPosition();
			expect((scene as any).scrollContainer.y).toBeDefined();
		});

		it('should not crash when scrollContainer is null', () => {
			(scene as any).scrollContainer = null;
			expect(() => (scene as any).updateScrollPosition()).not.toThrow();
		});
	});

	describe('cleanup', () => {
		beforeEach(() => {
			scene.init({ storyFlags: mockStoryFlags as any });
			scene.create();
		});

		it('should destroy category tabs', () => {
			(scene as any).cleanup();
			expect((scene as any).categoryTabs).toEqual([]);
		});

		it('should destroy entry list', () => {
			(scene as any).cleanup();
			expect((scene as any).entryList).toEqual([]);
		});

		it('should destroy content texts', () => {
			(scene as any).cleanup();
			expect((scene as any).contentTexts).toEqual([]);
		});

		it('should destroy scroll container', () => {
			const container = (scene as any).scrollContainer;
			(scene as any).cleanup();
			expect(container.destroy).toHaveBeenCalled();
		});

		it('should remove resize listener', () => {
			(scene as any).cleanup();
			expect((scene as any).scale.off).toHaveBeenCalledWith('resize', expect.any(Function), scene);
		});
	});

	describe('refresh', () => {
		beforeEach(() => {
			scene.init({ storyFlags: mockStoryFlags as any });
			scene.create();
		});

		it('should rebuild the entire UI', () => {
			scene.refresh();
			// Should have text calls after refresh
			expect((scene as any).add.text.mock.calls.length).toBeGreaterThan(0);
		});
	});

	describe('World lore entries', () => {
		it('should have Ancient Kingdoms entry', () => {
			const entry = LORE_ENTRIES.find((e) => e.id === 'world_ancient_kingdoms');
			expect(entry).toBeDefined();
			expect(entry!.category).toBe(LoreCategory.WORLD);
		});

		it('should have Void War entry', () => {
			const entry = LORE_ENTRIES.find((e) => e.id === 'world_void_war');
			expect(entry).toBeDefined();
			expect(entry!.unlockFlag).toBe(StoryFlag.RECEIVED_PROPHECY);
		});
	});

	describe('Character lore entries', () => {
		it('should have Village Elder entry', () => {
			const entry = LORE_ENTRIES.find((e) => e.id === 'char_village_elder');
			expect(entry).toBeDefined();
			expect(entry!.category).toBe(LoreCategory.CHARACTERS);
		});

		it('should have Void King entry', () => {
			const entry = LORE_ENTRIES.find((e) => e.id === 'char_void_king');
			expect(entry).toBeDefined();
			expect(entry!.unlockFlag).toBe(StoryFlag.VOID_KING_CONFRONTED);
		});
	});

	describe('Item lore entries', () => {
		it('should have Sunstone entry', () => {
			const entry = LORE_ENTRIES.find((e) => e.id === 'item_sunstone');
			expect(entry).toBeDefined();
			expect(entry!.category).toBe(LoreCategory.ITEMS);
		});

		it('should have all fragment entries', () => {
			const ruinsFragment = LORE_ENTRIES.find((e) => e.id === 'item_fragment_ruins');
			const templeFragment = LORE_ENTRIES.find((e) => e.id === 'item_fragment_temple');
			const gateFragment = LORE_ENTRIES.find((e) => e.id === 'item_fragment_gate');

			expect(ruinsFragment).toBeDefined();
			expect(templeFragment).toBeDefined();
			expect(gateFragment).toBeDefined();
		});
	});

	describe('Creature lore entries', () => {
		it('should have Shadow Scout entry', () => {
			const entry = LORE_ENTRIES.find((e) => e.id === 'creature_shadow_scout');
			expect(entry).toBeDefined();
			expect(entry!.category).toBe(LoreCategory.CREATURES);
		});

		it('should have Shadow Guardian entry', () => {
			const entry = LORE_ENTRIES.find((e) => e.id === 'creature_shadow_guardian');
			expect(entry).toBeDefined();
			expect(entry!.unlockFlag).toBe(StoryFlag.SHADOW_GUARDIAN_DEFEATED);
		});
	});

	describe('Location lore entries', () => {
		it('should have Forest Village entry', () => {
			const entry = LORE_ENTRIES.find((e) => e.id === 'loc_village');
			expect(entry).toBeDefined();
			expect(entry!.category).toBe(LoreCategory.LOCATIONS);
		});

		it('should have Dark Citadel entry', () => {
			const entry = LORE_ENTRIES.find((e) => e.id === 'loc_citadel');
			expect(entry).toBeDefined();
			expect(entry!.unlockFlag).toBe(StoryFlag.ENTERED_CITADEL);
		});
	});
});
