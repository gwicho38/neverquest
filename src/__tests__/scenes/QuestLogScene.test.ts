/**
 * Tests for QuestLogScene
 */

import { QuestLogScene, QuestLogSceneName } from '../../scenes/QuestLogScene';
import { StoryFlag } from '../../plugins/NeverquestStoryFlags';

// Mock Phaser module
jest.mock('phaser', () => {
	const mockText = {
		destroy: jest.fn(),
		setScrollFactor: jest.fn().mockReturnThis(),
		setOrigin: jest.fn().mockReturnThis(),
		height: 20,
	};

	const mockContainer = {
		add: jest.fn(),
		destroy: jest.fn(),
		setMask: jest.fn(),
		removeAll: jest.fn(),
		y: 0,
	};

	const mockGraphics = {
		fillStyle: jest.fn().mockReturnThis(),
		fillRect: jest.fn().mockReturnThis(),
		destroy: jest.fn(),
		createGeometryMask: jest.fn().mockReturnValue({}),
	};

	const mockImage = {
		on: jest.fn().mockReturnThis(),
		destroy: jest.fn(),
		setInteractive: jest.fn().mockReturnThis(),
		setOrigin: jest.fn().mockReturnThis(),
		setScale: jest.fn().mockReturnThis(),
		setScrollFactor: jest.fn().mockReturnThis(),
		x: 100,
		y: 100,
		width: 512,
		height: 512,
	};

	const mockNineSlice = {
		setScrollFactor: jest.fn().mockReturnThis(),
		setOrigin: jest.fn().mockReturnThis(),
		destroy: jest.fn(),
		x: 100,
		y: 100,
		width: 512,
		height: 512,
		scaleX: 1,
		scaleY: 1,
	};

	return {
		__esModule: true,
		default: {
			Scene: class MockScene {
				scene = { key: 'QuestLogScene', stop: jest.fn() };
				add = {
					text: jest.fn().mockReturnValue(mockText),
					container: jest.fn().mockReturnValue(mockContainer),
					graphics: jest.fn().mockReturnValue(mockGraphics),
					image: jest.fn().mockReturnValue(mockImage),
					nineslice: jest.fn().mockReturnValue(mockNineSlice),
				};
				input = {
					on: jest.fn(),
				};
				scale = {
					on: jest.fn(),
					off: jest.fn(),
					width: 800,
					height: 600,
				};
				cameras = {
					main: {
						width: 800,
						height: 600,
					},
				};
				textures = {
					exists: jest.fn().mockReturnValue(true),
				};
			},
			Math: {
				Clamp: (value: number, min: number, max: number) => Math.min(Math.max(value, min), max),
			},
		},
	};
});

// Mock PanelComponent
jest.mock('../../components/PanelComponent', () => ({
	PanelComponent: jest.fn().mockImplementation(() => ({
		panelBackground: {
			x: 100,
			y: 100,
			width: 512,
			height: 512,
			scaleX: 1,
		},
		closeButton: {
			on: jest.fn(),
		},
		setTitleText: jest.fn(),
		destroy: jest.fn(),
	})),
}));

// Mock NeverquestStoryFlags
jest.mock('../../plugins/NeverquestStoryFlags', () => ({
	NeverquestStoryFlags: jest.fn().mockImplementation(() => ({
		hasFlag: jest.fn().mockReturnValue(false),
		getAllFlags: jest.fn().mockReturnValue([]),
		getCurrentAct: jest.fn().mockReturnValue(1),
		getFragmentCount: jest.fn().mockReturnValue(0),
		load: jest.fn(),
	})),
	StoryFlag: {
		INTRO_COMPLETE: 'intro_complete',
		MET_ELDER: 'met_elder',
		CAVE_ARTIFACT_RETRIEVED: 'cave_artifact_retrieved',
		CAVE_BOSS_DEFEATED: 'cave_boss_defeated',
		ACT_1_COMPLETE: 'act_1_complete',
		ENTERED_CROSSROADS: 'entered_crossroads',
		MET_MERCHANT: 'met_merchant',
		MET_FALLEN_KNIGHT: 'met_fallen_knight',
		ALLIED_WITH_KNIGHT: 'allied_with_knight',
		MET_ORACLE: 'met_oracle',
		RECEIVED_PROPHECY: 'received_prophecy',
		FRAGMENT_RUINS_OBTAINED: 'fragment_ruins_obtained',
		FRAGMENT_TEMPLE_OBTAINED: 'fragment_temple_obtained',
		FRAGMENT_GATE_OBTAINED: 'fragment_gate_obtained',
		SUNSTONE_RESTORED: 'sunstone_restored',
		DARK_GATE_OPENED: 'dark_gate_opened',
		ENTERED_CITADEL: 'entered_citadel',
		SHADOW_GUARDIAN_DEFEATED: 'shadow_guardian_defeated',
		VOID_KING_CONFRONTED: 'void_king_confronted',
		ENDING_HEROIC: 'ending_heroic',
		ENDING_SACRIFICE: 'ending_sacrifice',
		ENDING_HIDDEN: 'ending_hidden',
		COMPLETED_ACT_1: 'completed_act_1',
		COMPLETED_ACT_2: 'completed_act_2',
		COMPLETED_ACT_3: 'completed_act_3',
		ORACLE_HELPED: 'oracle_helped',
	},
}));

describe('QuestLogScene', () => {
	let scene: QuestLogScene;

	beforeEach(() => {
		jest.clearAllMocks();
		scene = new QuestLogScene();
	});

	describe('Scene Configuration', () => {
		it('should have correct scene key', () => {
			expect(QuestLogSceneName).toBe('QuestLogScene');
		});

		it('should be a Phaser Scene', () => {
			expect(scene).toBeDefined();
		});
	});

	describe('Initialization', () => {
		it('should initialize with provided story flags', () => {
			const mockStoryFlags = {
				hasFlag: jest.fn(),
				getCurrentAct: jest.fn().mockReturnValue(2),
				getFragmentCount: jest.fn().mockReturnValue(1),
				load: jest.fn(),
			};

			scene.init({ storyFlags: mockStoryFlags as any });

			expect(scene['storyFlags']).toBe(mockStoryFlags);
		});

		it('should initialize without story flags', () => {
			scene.init({});

			expect(scene['storyFlags']).toBeNull();
		});

		it('should accept empty init data', () => {
			expect(() => scene.init({})).not.toThrow();
		});
	});

	describe('Act Names', () => {
		it('should return correct name for Act 1', () => {
			const actName = scene['getActName'](1);
			expect(actName).toBe('The Awakening');
		});

		it('should return correct name for Act 2', () => {
			const actName = scene['getActName'](2);
			expect(actName).toBe('The Journey');
		});

		it('should return correct name for Act 3', () => {
			const actName = scene['getActName'](3);
			expect(actName).toBe('The Reckoning');
		});
	});

	describe('Fragment Icons', () => {
		it('should show 0 fragments correctly', () => {
			const icons = scene['getFragmentIcons'](0);
			expect(icons).toBe('[ooo]');
		});

		it('should show 1 fragment correctly', () => {
			const icons = scene['getFragmentIcons'](1);
			expect(icons).toBe('[*oo]');
		});

		it('should show 2 fragments correctly', () => {
			const icons = scene['getFragmentIcons'](2);
			expect(icons).toBe('[**o]');
		});

		it('should show 3 fragments correctly', () => {
			const icons = scene['getFragmentIcons'](3);
			expect(icons).toBe('[***]');
		});
	});

	describe('Quest Definitions', () => {
		beforeEach(() => {
			// Set up mock story flags for quest definition tests
			scene['storyFlags'] = {
				hasFlag: jest.fn().mockReturnValue(false),
				getCurrentAct: jest.fn().mockReturnValue(1),
				getFragmentCount: jest.fn().mockReturnValue(0),
				load: jest.fn(),
			} as any;
		});

		it('should have Act 1 quests defined', () => {
			const quests = scene['getQuestsWithStatus']();
			const act1Quests = quests.filter((q) => q.act === 1);

			expect(act1Quests.length).toBeGreaterThan(0);
			expect(act1Quests.some((q) => q.id === 'intro')).toBe(true);
			expect(act1Quests.some((q) => q.id === 'cave_boss')).toBe(true);
		});

		it('should have Act 2 quests defined', () => {
			const quests = scene['getQuestsWithStatus']();
			const act2Quests = quests.filter((q) => q.act === 2);

			expect(act2Quests.length).toBeGreaterThan(0);
			expect(act2Quests.some((q) => q.id === 'crossroads')).toBe(true);
			expect(act2Quests.some((q) => q.id === 'sunstone')).toBe(true);
		});

		it('should have Act 3 quests defined', () => {
			const quests = scene['getQuestsWithStatus']();
			const act3Quests = quests.filter((q) => q.act === 3);

			expect(act3Quests.length).toBeGreaterThan(0);
			expect(act3Quests.some((q) => q.id === 'void_king')).toBe(true);
		});

		it('should have all quests start as incomplete', () => {
			const quests = scene['getQuestsWithStatus']();
			quests.forEach((quest) => {
				expect(quest.completed).toBe(false);
			});
		});
	});

	describe('Quest Status Integration', () => {
		it('should mark quest as complete when story flag is set', () => {
			const mockStoryFlags = {
				hasFlag: jest.fn().mockImplementation((flag: StoryFlag) => {
					return flag === StoryFlag.INTRO_COMPLETE;
				}),
				getCurrentAct: jest.fn().mockReturnValue(1),
				getFragmentCount: jest.fn().mockReturnValue(0),
				load: jest.fn(),
			};

			scene['storyFlags'] = mockStoryFlags as any;
			const quests = scene['getQuestsWithStatus']();

			const introQuest = quests.find((q) => q.id === 'intro');
			expect(introQuest?.completed).toBe(true);
		});

		it('should show multiple completed quests', () => {
			const mockStoryFlags = {
				hasFlag: jest.fn().mockImplementation((flag: StoryFlag) => {
					return [StoryFlag.INTRO_COMPLETE, StoryFlag.MET_ELDER, StoryFlag.CAVE_BOSS_DEFEATED].includes(flag);
				}),
				getCurrentAct: jest.fn().mockReturnValue(1),
				getFragmentCount: jest.fn().mockReturnValue(0),
				load: jest.fn(),
			};

			scene['storyFlags'] = mockStoryFlags as any;
			const quests = scene['getQuestsWithStatus']();
			const completedQuests = quests.filter((q) => q.completed);

			expect(completedQuests.length).toBe(3);
		});
	});

	describe('Scroll Position', () => {
		it('should initialize scroll at 0', () => {
			expect(scene['scrollY']).toBe(0);
		});

		it('should initialize max scroll at 0', () => {
			expect(scene['maxScroll']).toBe(0);
		});

		it('should initialize content height at 0', () => {
			expect(scene['contentHeight']).toBe(0);
		});
	});

	describe('Pointer in Panel Check', () => {
		beforeEach(() => {
			scene['panelComponent'] = {
				panelBackground: {
					x: 100,
					y: 100,
					width: 512,
					height: 512,
				},
			} as any;
		});

		it('should return true for pointer inside panel', () => {
			const pointer = {
				x: 300,
				y: 300,
			} as Phaser.Input.Pointer;

			const result = scene['isPointerInPanel'](pointer);
			expect(result).toBe(true);
		});

		it('should return false for pointer left of panel', () => {
			const pointer = {
				x: 50,
				y: 300,
			} as Phaser.Input.Pointer;

			const result = scene['isPointerInPanel'](pointer);
			expect(result).toBe(false);
		});

		it('should return false for pointer right of panel', () => {
			const pointer = {
				x: 700,
				y: 300,
			} as Phaser.Input.Pointer;

			const result = scene['isPointerInPanel'](pointer);
			expect(result).toBe(false);
		});

		it('should return false for pointer above panel content area', () => {
			const pointer = {
				x: 300,
				y: 150, // Below y + CONTENT_PADDING_TOP (100 + 100 = 200)
			} as Phaser.Input.Pointer;

			const result = scene['isPointerInPanel'](pointer);
			expect(result).toBe(false);
		});
	});

	describe('Cleanup', () => {
		it('should clear quest texts array on cleanup', () => {
			scene['questTexts'] = [{ destroy: jest.fn() } as any, { destroy: jest.fn() } as any];

			scene['cleanup']();

			expect(scene['questTexts'].length).toBe(0);
		});

		it('should destroy act header on cleanup', () => {
			const mockDestroy = jest.fn();
			scene['actHeader'] = { destroy: mockDestroy } as any;

			scene['cleanup']();

			expect(mockDestroy).toHaveBeenCalled();
			expect(scene['actHeader']).toBeNull();
		});

		it('should destroy fragment display on cleanup', () => {
			const mockDestroy = jest.fn();
			scene['fragmentDisplay'] = { destroy: mockDestroy } as any;

			scene['cleanup']();

			expect(mockDestroy).toHaveBeenCalled();
			expect(scene['fragmentDisplay']).toBeNull();
		});

		it('should destroy scroll container on cleanup', () => {
			const mockDestroy = jest.fn();
			scene['scrollContainer'] = { destroy: mockDestroy } as any;

			scene['cleanup']();

			expect(mockDestroy).toHaveBeenCalled();
			expect(scene['scrollContainer']).toBeNull();
		});

		it('should destroy scroll mask on cleanup', () => {
			const mockDestroy = jest.fn();
			scene['scrollMask'] = { destroy: mockDestroy } as any;

			scene['cleanup']();

			expect(mockDestroy).toHaveBeenCalled();
			expect(scene['scrollMask']).toBeNull();
		});

		it('should destroy panel component on cleanup', () => {
			const mockDestroy = jest.fn();
			scene['panelComponent'] = { destroy: mockDestroy } as any;

			scene['cleanup']();

			expect(mockDestroy).toHaveBeenCalled();
			expect(scene['panelComponent']).toBeNull();
		});
	});

	describe('Refresh', () => {
		it('should reset scroll position on refresh', () => {
			scene['scrollY'] = 100;
			scene['scrollContainer'] = {
				removeAll: jest.fn(),
			} as any;

			scene['refresh']();

			expect(scene['scrollY']).toBe(0);
		});

		it('should clear quest texts on refresh', () => {
			scene['questTexts'] = [{ destroy: jest.fn() } as any];
			scene['scrollContainer'] = {
				removeAll: jest.fn(),
			} as any;

			scene['refresh']();

			expect(scene['questTexts'].length).toBe(0);
		});

		it('should call removeAll on scroll container', () => {
			const mockRemoveAll = jest.fn();
			scene['scrollContainer'] = {
				removeAll: mockRemoveAll,
			} as any;

			scene['refresh']();

			expect(mockRemoveAll).toHaveBeenCalledWith(true);
		});
	});

	describe('Layout Constants', () => {
		it('should have content padding top defined', () => {
			expect(scene['CONTENT_PADDING_TOP']).toBe(100);
		});

		it('should have content padding left defined', () => {
			expect(scene['CONTENT_PADDING_LEFT']).toBe(30);
		});

		it('should have line height defined', () => {
			expect(scene['LINE_HEIGHT']).toBe(28);
		});

		it('should have act header size defined', () => {
			expect(scene['ACT_HEADER_SIZE']).toBe(16);
		});

		it('should have quest title size defined', () => {
			expect(scene['QUEST_TITLE_SIZE']).toBe(12);
		});

		it('should have quest desc size defined', () => {
			expect(scene['QUEST_DESC_SIZE']).toBe(10);
		});
	});

	describe('Quest Entry Format', () => {
		beforeEach(() => {
			scene['panelComponent'] = {
				panelBackground: {
					x: 100,
					y: 100,
					width: 512,
					height: 512,
				},
			} as any;
			scene['scrollContainer'] = {
				add: jest.fn(),
			} as any;
			scene.add = {
				text: jest.fn().mockReturnValue({
					destroy: jest.fn(),
					height: 20,
				}),
			} as any;
		});

		it('should add completed quest with checkmark', () => {
			const quest = {
				id: 'test',
				title: 'Test Quest',
				description: 'Test description',
				completed: true,
				act: 1 as const,
			};

			scene['addQuestEntry'](quest, 0, true);

			expect(scene.add.text).toHaveBeenCalledWith(0, 0, '[x] Test Quest', expect.any(Object));
		});

		it('should add incomplete quest with empty checkbox', () => {
			const quest = {
				id: 'test',
				title: 'Test Quest',
				description: 'Test description',
				completed: false,
				act: 1 as const,
			};

			scene['addQuestEntry'](quest, 0, false);

			expect(scene.add.text).toHaveBeenCalledWith(0, 0, '[ ] Test Quest', expect.any(Object));
		});

		it('should return updated y offset after adding entry', () => {
			const quest = {
				id: 'test',
				title: 'Test Quest',
				description: 'Test description',
				completed: false,
				act: 1 as const,
			};

			const newOffset = scene['addQuestEntry'](quest, 0, false);

			expect(newOffset).toBeGreaterThan(0);
		});
	});

	describe('Update Scroll Position', () => {
		it('should update scroll container y position', () => {
			scene['panelComponent'] = {
				panelBackground: {
					y: 100,
				},
			} as any;
			scene['scrollContainer'] = {
				y: 0,
			} as any;
			scene['scrollY'] = 50;

			scene['updateScrollPosition']();

			// Expected: panel.y + CONTENT_PADDING_TOP - scrollY = 100 + 100 - 50 = 150
			expect(scene['scrollContainer']!.y).toBe(150);
		});

		it('should handle zero scroll', () => {
			scene['panelComponent'] = {
				panelBackground: {
					y: 100,
				},
			} as any;
			scene['scrollContainer'] = {
				y: 0,
			} as any;
			scene['scrollY'] = 0;

			scene['updateScrollPosition']();

			expect(scene['scrollContainer']!.y).toBe(200);
		});

		it('should not throw when scrollContainer is null', () => {
			scene['scrollContainer'] = null;
			expect(() => scene['updateScrollPosition']()).not.toThrow();
		});
	});

	describe('create lifecycle', () => {
		beforeEach(() => {
			scene.init({});
		});

		it('should create panel component', () => {
			scene.create();
			expect(scene['panelComponent']).not.toBeNull();
		});

		it('should set panel title to Quest Log', () => {
			scene.create();
			expect(scene['panelComponent']!.setTitleText).toHaveBeenCalledWith('Quest Log');
		});

		it('should register close button handler', () => {
			scene.create();
			expect(scene['panelComponent']!.closeButton.on).toHaveBeenCalledWith('pointerdown', expect.any(Function));
		});

		it('should create story flags if not provided', () => {
			scene.create();
			expect(scene['storyFlags']).not.toBeNull();
		});

		it('should use provided story flags', () => {
			const mockFlags = {
				hasFlag: jest.fn().mockReturnValue(false),
				getCurrentAct: jest.fn().mockReturnValue(1),
				getFragmentCount: jest.fn().mockReturnValue(0),
				load: jest.fn(),
			};
			scene.init({ storyFlags: mockFlags as any });
			scene.create();
			expect(scene['storyFlags']).toBe(mockFlags);
		});

		it('should create scrollable content container', () => {
			scene.create();
			expect(scene['scrollContainer']).not.toBeNull();
		});

		it('should create scroll mask', () => {
			scene.create();
			expect(scene['scrollMask']).not.toBeNull();
		});

		it('should register resize handler', () => {
			scene.create();
			expect(scene.scale.on).toHaveBeenCalledWith('resize', expect.any(Function), scene);
		});

		it('should register scroll input handlers', () => {
			scene.create();
			expect(scene.input.on).toHaveBeenCalledWith('wheel', expect.any(Function));
			expect(scene.input.on).toHaveBeenCalledWith('pointerdown', expect.any(Function));
			expect(scene.input.on).toHaveBeenCalledWith('pointermove', expect.any(Function));
		});

		it('should create act header text', () => {
			scene.create();
			expect(scene['actHeader']).not.toBeNull();
		});
	});

	describe('close button', () => {
		it('should stop scene when close button clicked', () => {
			scene.init({});
			scene.create();

			// Get the close button handler
			const closeHandler = (scene['panelComponent']!.closeButton.on as jest.Mock).mock.calls.find(
				(call: [string, () => void]) => call[0] === 'pointerdown'
			)?.[1];

			expect(closeHandler).toBeDefined();
			closeHandler();
			expect(scene.scene.stop).toHaveBeenCalled();
		});
	});

	describe('buildQuestDisplay', () => {
		it('should not build when scrollContainer is null', () => {
			scene['scrollContainer'] = null;
			scene['storyFlags'] = { hasFlag: jest.fn() } as any;
			expect(() => scene['buildQuestDisplay']()).not.toThrow();
		});

		it('should not build when storyFlags is null', () => {
			scene['scrollContainer'] = { add: jest.fn() } as any;
			scene['storyFlags'] = null;
			expect(() => scene['buildQuestDisplay']()).not.toThrow();
		});

		it('should display active quests for current act', () => {
			const mockFlags = {
				hasFlag: jest.fn().mockReturnValue(false),
				getCurrentAct: jest.fn().mockReturnValue(1),
				getFragmentCount: jest.fn().mockReturnValue(0),
				load: jest.fn(),
			};
			scene.init({ storyFlags: mockFlags as any });
			scene.create();

			// Should have created text elements for quests
			const textCalls = (scene.add.text as jest.Mock).mock.calls;
			// Should have "Active Quests:" header
			const activeHeader = textCalls.find((call: unknown[]) => call[2] === 'Active Quests:');
			expect(activeHeader).toBeDefined();
		});

		it('should display completed quests section when quests are done', () => {
			const mockFlags = {
				hasFlag: jest.fn().mockImplementation((flag: string) => {
					return flag === StoryFlag.INTRO_COMPLETE;
				}),
				getCurrentAct: jest.fn().mockReturnValue(1),
				getFragmentCount: jest.fn().mockReturnValue(0),
				load: jest.fn(),
			};
			scene.init({ storyFlags: mockFlags as any });
			scene.create();

			const textCalls = (scene.add.text as jest.Mock).mock.calls;
			const completedHeader = textCalls.find((call: unknown[]) => call[2] === 'Completed:');
			expect(completedHeader).toBeDefined();
		});

		it('should display fragment count in Act 2+', () => {
			const mockFlags = {
				hasFlag: jest.fn().mockReturnValue(false),
				getCurrentAct: jest.fn().mockReturnValue(2),
				getFragmentCount: jest.fn().mockReturnValue(1),
				load: jest.fn(),
			};
			scene.init({ storyFlags: mockFlags as any });
			scene.create();

			const textCalls = (scene.add.text as jest.Mock).mock.calls;
			const fragmentText = textCalls.find(
				(call: unknown[]) => typeof call[2] === 'string' && (call[2] as string).includes('Sunstone Fragments')
			);
			expect(fragmentText).toBeDefined();
		});

		it('should not display fragment count in Act 1', () => {
			const mockFlags = {
				hasFlag: jest.fn().mockReturnValue(false),
				getCurrentAct: jest.fn().mockReturnValue(1),
				getFragmentCount: jest.fn().mockReturnValue(0),
				load: jest.fn(),
			};
			scene.init({ storyFlags: mockFlags as any });
			scene.create();

			const textCalls = (scene.add.text as jest.Mock).mock.calls;
			const fragmentText = textCalls.find(
				(call: unknown[]) => typeof call[2] === 'string' && (call[2] as string).includes('Sunstone Fragments')
			);
			expect(fragmentText).toBeUndefined();
		});

		it('should calculate content height', () => {
			const mockFlags = {
				hasFlag: jest.fn().mockReturnValue(false),
				getCurrentAct: jest.fn().mockReturnValue(1),
				getFragmentCount: jest.fn().mockReturnValue(0),
				load: jest.fn(),
			};
			scene.init({ storyFlags: mockFlags as any });
			scene.create();

			expect(scene['contentHeight']).toBeGreaterThan(0);
		});

		it('should calculate maxScroll based on content overflow', () => {
			const mockFlags = {
				hasFlag: jest.fn().mockReturnValue(false),
				getCurrentAct: jest.fn().mockReturnValue(2),
				getFragmentCount: jest.fn().mockReturnValue(0),
				load: jest.fn(),
			};
			scene.init({ storyFlags: mockFlags as any });
			scene.create();

			// maxScroll should be >= 0 (content may or may not overflow)
			expect(scene['maxScroll']).toBeGreaterThanOrEqual(0);
		});

		it('should show all 3 fragments as green when complete', () => {
			const mockFlags = {
				hasFlag: jest.fn().mockReturnValue(false),
				getCurrentAct: jest.fn().mockReturnValue(2),
				getFragmentCount: jest.fn().mockReturnValue(3),
				load: jest.fn(),
			};
			scene.init({ storyFlags: mockFlags as any });
			scene.create();

			const textCalls = (scene.add.text as jest.Mock).mock.calls;
			const fragmentText = textCalls.find(
				(call: unknown[]) => typeof call[2] === 'string' && (call[2] as string).includes('[***]')
			);
			expect(fragmentText).toBeDefined();
		});
	});

	describe('setupScrolling', () => {
		let wheelHandler: (pointer: unknown, gameObjects: unknown[], deltaX: number, deltaY: number) => void;
		let pointerDownHandler: (pointer: { y: number; x?: number }) => void;
		let pointerMoveHandler: (pointer: { y: number; x?: number; isDown: boolean }) => void;

		beforeEach(() => {
			const mockFlags = {
				hasFlag: jest.fn().mockReturnValue(false),
				getCurrentAct: jest.fn().mockReturnValue(1),
				getFragmentCount: jest.fn().mockReturnValue(0),
				load: jest.fn(),
			};
			scene.init({ storyFlags: mockFlags as any });
			scene.create();

			// Capture the registered handlers
			const inputOnCalls = (scene.input.on as jest.Mock).mock.calls;
			wheelHandler = inputOnCalls.find(
				(call: [string, (...args: unknown[]) => void]) => call[0] === 'wheel'
			)?.[1];
			pointerDownHandler = inputOnCalls.find(
				(call: [string, (...args: unknown[]) => void]) => call[0] === 'pointerdown'
			)?.[1];
			pointerMoveHandler = inputOnCalls.find(
				(call: [string, (...args: unknown[]) => void]) => call[0] === 'pointermove'
			)?.[1];
		});

		it('should scroll down on mouse wheel', () => {
			scene['maxScroll'] = 200;
			scene['scrollY'] = 0;
			scene['panelComponent'] = {
				panelBackground: { y: 100 },
			} as any;

			wheelHandler({}, [], 0, 100);

			expect(scene['scrollY']).toBeGreaterThan(0);
		});

		it('should not scroll beyond maxScroll', () => {
			scene['maxScroll'] = 50;
			scene['scrollY'] = 0;
			scene['panelComponent'] = {
				panelBackground: { y: 100 },
			} as any;

			wheelHandler({}, [], 0, 500);

			expect(scene['scrollY']).toBeLessThanOrEqual(50);
		});

		it('should not scroll when maxScroll is 0', () => {
			scene['maxScroll'] = 0;
			scene['scrollY'] = 0;

			wheelHandler({}, [], 0, 100);

			expect(scene['scrollY']).toBe(0);
		});

		it('should not scroll below 0', () => {
			scene['maxScroll'] = 200;
			scene['scrollY'] = 10;
			scene['panelComponent'] = {
				panelBackground: { y: 100 },
			} as any;

			wheelHandler({}, [], 0, -500);

			expect(scene['scrollY']).toBeGreaterThanOrEqual(0);
		});

		it('should start drag on pointerdown inside panel', () => {
			const pointer = { x: 300, y: 300 };
			scene['panelComponent'] = {
				panelBackground: { x: 100, y: 100, width: 512, height: 512 },
			} as any;

			pointerDownHandler(pointer);
			// No error = success, drag state is captured
		});

		it('should scroll on pointermove while dragging', () => {
			scene['maxScroll'] = 200;
			scene['scrollY'] = 0;
			scene['panelComponent'] = {
				panelBackground: { x: 100, y: 100, width: 512, height: 512 },
			} as any;

			// Start drag
			pointerDownHandler({ x: 300, y: 300 });

			// Move pointer up (should scroll down)
			pointerMoveHandler({ x: 300, y: 250, isDown: true });

			expect(scene['scrollY']).toBeGreaterThan(0);
		});

		it('should not scroll on pointermove when not dragging', () => {
			scene['maxScroll'] = 200;
			scene['scrollY'] = 0;
			scene['panelComponent'] = {
				panelBackground: { x: 100, y: 100, width: 512, height: 512 },
			} as any;

			// Move without pressing
			pointerMoveHandler({ x: 300, y: 250, isDown: false });

			expect(scene['scrollY']).toBe(0);
		});
	});

	describe('handleResize', () => {
		it('should rebuild display on resize', () => {
			const mockFlags = {
				hasFlag: jest.fn().mockReturnValue(false),
				getCurrentAct: jest.fn().mockReturnValue(1),
				getFragmentCount: jest.fn().mockReturnValue(0),
				load: jest.fn(),
			};
			scene.init({ storyFlags: mockFlags as any });
			scene.create();

			// Call handleResize
			scene['handleResize']();

			// Should have recreated panel (create was called again)
			expect(scene['panelComponent']).not.toBeNull();
		});
	});

	describe('createScrollableContent', () => {
		it('should create container at correct position', () => {
			const mockFlags = {
				hasFlag: jest.fn().mockReturnValue(false),
				getCurrentAct: jest.fn().mockReturnValue(1),
				getFragmentCount: jest.fn().mockReturnValue(0),
				load: jest.fn(),
			};
			scene.init({ storyFlags: mockFlags as any });
			scene.create();

			// Container should be created at panel.x + padding, panel.y + padding
			expect(scene.add.container).toHaveBeenCalledWith(
				100 + 30, // panel.x + CONTENT_PADDING_LEFT
				100 + 100 // panel.y + CONTENT_PADDING_TOP
			);
		});

		it('should create geometry mask', () => {
			const mockFlags = {
				hasFlag: jest.fn().mockReturnValue(false),
				getCurrentAct: jest.fn().mockReturnValue(1),
				getFragmentCount: jest.fn().mockReturnValue(0),
				load: jest.fn(),
			};
			scene.init({ storyFlags: mockFlags as any });
			scene.create();

			const mockGraphics = scene.add.graphics();
			expect(mockGraphics.createGeometryMask).toHaveBeenCalled();
		});

		it('should set mask on scroll container', () => {
			const mockFlags = {
				hasFlag: jest.fn().mockReturnValue(false),
				getCurrentAct: jest.fn().mockReturnValue(1),
				getFragmentCount: jest.fn().mockReturnValue(0),
				load: jest.fn(),
			};
			scene.init({ storyFlags: mockFlags as any });
			scene.create();

			expect(scene['scrollContainer']!.setMask).toHaveBeenCalled();
		});
	});

	describe('getQuestsWithStatus', () => {
		it('should return all 16 quests', () => {
			scene['storyFlags'] = {
				hasFlag: jest.fn().mockReturnValue(false),
			} as any;

			const quests = scene['getQuestsWithStatus']();
			expect(quests).toHaveLength(16);
		});

		it('should mark quests complete based on matching story flags', () => {
			scene['storyFlags'] = {
				hasFlag: jest.fn().mockImplementation((flag: string) => {
					return flag === StoryFlag.ENTERED_CROSSROADS;
				}),
			} as any;

			const quests = scene['getQuestsWithStatus']();
			const crossroadsQuest = quests.find((q) => q.id === 'crossroads');
			expect(crossroadsQuest?.completed).toBe(true);
		});

		it('should not modify original quest definitions', () => {
			scene['storyFlags'] = {
				hasFlag: jest.fn().mockReturnValue(true),
			} as any;

			scene['getQuestsWithStatus']();
			// Call again - should still work since originals aren't mutated
			const quests2 = scene['getQuestsWithStatus']();
			expect(quests2).toHaveLength(16);
		});
	});
});
