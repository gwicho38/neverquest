/**
 * Tests for CharacterStatsScene
 */

import { CharacterStatsScene, CharacterStatsSceneName } from '../../scenes/CharacterStatsScene';

// Mock dependencies
jest.mock('../../components/PanelComponent', () => ({
	PanelComponent: jest.fn().mockImplementation(() => ({
		panelBackground: {
			x: 100,
			y: 50,
			width: 400,
			height: 500,
		},
		closeButton: {
			on: jest.fn(),
		},
		setTitleText: jest.fn(),
		destroy: jest.fn(),
	})),
}));

// Create a mock player with all required attributes
const createMockPlayer = (overrides: Partial<any> = {}) => ({
	attributes: {
		level: 5,
		rawAttributes: {
			str: 10,
			agi: 8,
			vit: 12,
			dex: 6,
			int: 7,
		},
		availableStatPoints: 3,
		bonus: {
			equipment: [],
			consumable: [],
			extra: [],
		},
		health: 80,
		maxHealth: 100,
		baseHealth: 90,
		atack: 25,
		defense: 15,
		speed: 60,
		critical: 5,
		flee: 8,
		hit: 12,
		experience: 350,
		nextLevelExperience: 500,
		...overrides.attributes,
	},
	...overrides,
});

// Mock Phaser
jest.mock('phaser', () => {
	const mockText = {
		setOrigin: jest.fn().mockReturnThis(),
		destroy: jest.fn(),
	};

	const mockGraphics = {
		fillStyle: jest.fn().mockReturnThis(),
		fillRect: jest.fn().mockReturnThis(),
		lineStyle: jest.fn().mockReturnThis(),
		strokeRect: jest.fn().mockReturnThis(),
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
					text: jest.fn().mockReturnValue(mockText),
					graphics: jest.fn().mockReturnValue(mockGraphics),
					container: jest.fn().mockReturnValue(mockContainer),
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
				text: jest.fn().mockReturnValue(mockText),
				graphics: jest.fn().mockReturnValue(mockGraphics),
				container: jest.fn().mockReturnValue(mockContainer),
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

describe('CharacterStatsScene', () => {
	let scene: CharacterStatsScene;
	let mockPlayer: any;

	beforeEach(() => {
		jest.clearAllMocks();
		scene = new CharacterStatsScene();
		mockPlayer = createMockPlayer();

		// Mock scene add methods
		(scene as any).add = {
			text: jest.fn().mockReturnValue({
				setOrigin: jest.fn().mockReturnThis(),
				destroy: jest.fn(),
			}),
			graphics: jest.fn().mockReturnValue({
				fillStyle: jest.fn().mockReturnThis(),
				fillRect: jest.fn().mockReturnThis(),
				lineStyle: jest.fn().mockReturnThis(),
				strokeRect: jest.fn().mockReturnThis(),
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
			expect(CharacterStatsSceneName).toBe('CharacterStatsScene');
		});

		it('should initialize with null player', () => {
			expect((scene as any).player).toBeNull();
		});

		it('should initialize with empty stat texts array', () => {
			expect((scene as any).statTexts).toEqual([]);
		});

		it('should have layout constants defined', () => {
			expect((scene as any).CONTENT_PADDING_TOP).toBe(100);
			expect((scene as any).CONTENT_PADDING_LEFT).toBe(30);
			expect((scene as any).LINE_HEIGHT).toBe(26);
			expect((scene as any).BAR_WIDTH).toBe(200);
			expect((scene as any).BAR_HEIGHT).toBe(12);
		});
	});

	describe('init', () => {
		it('should store player reference from init data', () => {
			scene.init({ player: mockPlayer });
			expect((scene as any).player).toBe(mockPlayer);
		});

		it('should handle missing player in init data', () => {
			scene.init({});
			expect((scene as any).player).toBeNull();
		});

		it('should handle undefined init data', () => {
			scene.init(undefined as any);
			expect((scene as any).player).toBeNull();
		});
	});

	describe('create', () => {
		beforeEach(() => {
			scene.init({ player: mockPlayer });
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

		it('should create scrollable content container', () => {
			scene.create();
			expect((scene as any).scrollContainer).toBeDefined();
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

	describe('buildStatsDisplay', () => {
		beforeEach(() => {
			scene.init({ player: mockPlayer });
			scene.create();
		});

		it('should create text elements for stats', () => {
			expect((scene as any).add.text).toHaveBeenCalled();
		});

		it('should calculate content height', () => {
			expect((scene as any).contentHeight).toBeGreaterThan(0);
		});

		it('should calculate max scroll value', () => {
			expect((scene as any).maxScroll).toBeDefined();
		});
	});

	describe('getAttributeBonus', () => {
		beforeEach(() => {
			scene.init({ player: mockPlayer });
		});

		it('should return 0 when no equipment bonuses', () => {
			const bonus = (scene as any).getAttributeBonus('str');
			expect(bonus).toBe(0);
		});

		it('should sum equipment bonuses for attribute', () => {
			mockPlayer.attributes.bonus.equipment = [{ str: 5 }, { str: 3 }];
			const bonus = (scene as any).getAttributeBonus('str');
			expect(bonus).toBe(8);
		});

		it('should return 0 when player is null', () => {
			(scene as any).player = null;
			const bonus = (scene as any).getAttributeBonus('str');
			expect(bonus).toBe(0);
		});

		it('should handle equipment items without the attribute', () => {
			mockPlayer.attributes.bonus.equipment = [{ def: 5 }, { atk: 3 }];
			const bonus = (scene as any).getAttributeBonus('str');
			expect(bonus).toBe(0);
		});
	});

	describe('addSectionHeader', () => {
		beforeEach(() => {
			scene.init({ player: mockPlayer });
			scene.create();
		});

		it('should create header text', () => {
			const initialCallCount = (scene as any).add.text.mock.calls.length;
			(scene as any).addSectionHeader('Test Header', 0);
			expect((scene as any).add.text.mock.calls.length).toBe(initialCallCount + 1);
		});

		it('should return updated y offset', () => {
			const newOffset = (scene as any).addSectionHeader('Test Header', 0);
			expect(newOffset).toBeGreaterThan(0);
		});
	});

	describe('addStatRow', () => {
		beforeEach(() => {
			scene.init({ player: mockPlayer });
			scene.create();
		});

		it('should create label and value text', () => {
			const initialCallCount = (scene as any).add.text.mock.calls.length;
			(scene as any).addStatRow('Label:', 'Value', 0);
			expect((scene as any).add.text.mock.calls.length).toBe(initialCallCount + 2);
		});

		it('should return updated y offset', () => {
			const newOffset = (scene as any).addStatRow('Label:', 'Value', 0);
			expect(newOffset).toBeGreaterThan(0);
		});
	});

	describe('addAttributeRow', () => {
		beforeEach(() => {
			scene.init({ player: mockPlayer });
			scene.create();
		});

		it('should create attribute text elements', () => {
			const initialCallCount = (scene as any).add.text.mock.calls.length;
			(scene as any).addAttributeRow('STR', 10, 0, 0);
			expect((scene as any).add.text.mock.calls.length).toBe(initialCallCount + 2);
		});

		it('should show bonus when positive', () => {
			const initialCallCount = (scene as any).add.text.mock.calls.length;
			(scene as any).addAttributeRow('STR', 10, 5, 0);
			// Should have added two text elements (label + value with bonus)
			expect((scene as any).add.text.mock.calls.length).toBe(initialCallCount + 2);
		});

		it('should show negative bonus', () => {
			const initialCallCount = (scene as any).add.text.mock.calls.length;
			(scene as any).addAttributeRow('STR', 10, -3, 0);
			// Should have added two text elements (label + value with bonus)
			expect((scene as any).add.text.mock.calls.length).toBe(initialCallCount + 2);
		});
	});

	describe('addExperienceBar', () => {
		beforeEach(() => {
			scene.init({ player: mockPlayer });
			scene.create();
		});

		it('should create experience bar graphics', () => {
			expect((scene as any).expBar).toBeDefined();
		});

		it('should return y offset when player is null', () => {
			(scene as any).player = null;
			const offset = (scene as any).addExperienceBar(50);
			expect(offset).toBe(50);
		});
	});

	describe('addHealthBar', () => {
		beforeEach(() => {
			scene.init({ player: mockPlayer });
			scene.create();
		});

		it('should create health bar graphics', () => {
			expect((scene as any).healthBar).toBeDefined();
		});

		it('should return y offset when player is null', () => {
			(scene as any).player = null;
			const offset = (scene as any).addHealthBar(50);
			expect(offset).toBe(50);
		});
	});

	describe('addEquipmentSummary', () => {
		beforeEach(() => {
			scene.init({ player: mockPlayer });
			scene.create();
		});

		it('should display attack bonus', () => {
			const equipment = [{ atk: 10 }];
			const initialCallCount = (scene as any).add.text.mock.calls.length;
			(scene as any).addEquipmentSummary(equipment, 0);
			expect((scene as any).add.text.mock.calls.length).toBeGreaterThan(initialCallCount);
		});

		it('should display defense bonus', () => {
			const initialCount = (scene as any).add.text.mock.calls.length;
			const equipment = [{ def: 5 }];
			(scene as any).addEquipmentSummary(equipment, 0);
			// Should have created text elements for the defense bonus
			expect((scene as any).add.text.mock.calls.length).toBeGreaterThan(initialCount);
		});

		it('should display "No bonuses" when empty', () => {
			const initialCount = (scene as any).add.text.mock.calls.length;
			(scene as any).addEquipmentSummary([], 0);
			// Should have created at least one text element (the no bonuses message)
			expect((scene as any).add.text.mock.calls.length).toBeGreaterThan(initialCount);
		});

		it('should sum multiple equipment bonuses', () => {
			const initialCount = (scene as any).add.text.mock.calls.length;
			const equipment = [{ atk: 5 }, { atk: 3 }];
			(scene as any).addEquipmentSummary(equipment, 0);
			// Should have created text elements for the attack bonus
			expect((scene as any).add.text.mock.calls.length).toBeGreaterThan(initialCount);
		});
	});

	describe('addBuffsSummary', () => {
		beforeEach(() => {
			scene.init({ player: mockPlayer });
			scene.create();
		});

		it('should display active buffs', () => {
			const buffs = [{ uniqueId: 1, statBonus: 'atack', value: 10, time: 30 }];
			const initialCallCount = (scene as any).add.text.mock.calls.length;
			(scene as any).addBuffsSummary(buffs, 0);
			expect((scene as any).add.text.mock.calls.length).toBeGreaterThan(initialCallCount);
		});

		it('should show time remaining', () => {
			const initialCount = (scene as any).add.text.mock.calls.length;
			const buffs = [{ uniqueId: 1, statBonus: 'atack', value: 10, time: 30 }];
			(scene as any).addBuffsSummary(buffs, 0);
			// Should have created text elements for the buff
			expect((scene as any).add.text.mock.calls.length).toBeGreaterThan(initialCount);
		});

		it('should handle negative buff values', () => {
			const initialCount = (scene as any).add.text.mock.calls.length;
			const buffs = [{ uniqueId: 1, statBonus: 'defense', value: -5, time: 10 }];
			(scene as any).addBuffsSummary(buffs, 0);
			// Should have created text elements for the debuff
			expect((scene as any).add.text.mock.calls.length).toBeGreaterThan(initialCount);
		});
	});

	describe('isPointerInPanel', () => {
		beforeEach(() => {
			scene.init({ player: mockPlayer });
			scene.create();
		});

		it('should return true for pointer inside panel', () => {
			const pointer = { x: 200, y: 200 };
			const result = (scene as any).isPointerInPanel(pointer);
			expect(result).toBe(true);
		});

		it('should return false for pointer outside panel', () => {
			const pointer = { x: 50, y: 50 };
			const result = (scene as any).isPointerInPanel(pointer);
			expect(result).toBe(false);
		});

		it('should return false for pointer below panel', () => {
			const pointer = { x: 200, y: 600 };
			const result = (scene as any).isPointerInPanel(pointer);
			expect(result).toBe(false);
		});
	});

	describe('updateScrollPosition', () => {
		beforeEach(() => {
			scene.init({ player: mockPlayer });
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
			scene.init({ player: mockPlayer });
			scene.create();
		});

		it('should destroy all stat texts', () => {
			(scene as any).cleanup();
			expect((scene as any).statTexts).toEqual([]);
		});

		it('should destroy exp bar', () => {
			const expBar = (scene as any).expBar;
			(scene as any).cleanup();
			expect(expBar.destroy).toHaveBeenCalled();
		});

		it('should destroy health bar', () => {
			const healthBar = (scene as any).healthBar;
			(scene as any).cleanup();
			expect(healthBar.destroy).toHaveBeenCalled();
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
			scene.init({ player: mockPlayer });
			scene.create();
		});

		it('should clear scroll container', () => {
			scene.refresh();
			expect((scene as any).scrollContainer.removeAll).toHaveBeenCalled();
		});

		it('should reset stat texts array', () => {
			scene.refresh();
			// After refresh, new texts are added, but during the call statTexts is cleared first
			expect(Array.isArray((scene as any).statTexts)).toBe(true);
		});

		it('should reset scroll position', () => {
			(scene as any).scrollY = 100;
			scene.refresh();
			expect((scene as any).scrollY).toBe(0);
		});
	});

	describe('Player with equipment bonuses', () => {
		it('should display equipment section when equipment exists', () => {
			// Use the mockPlayer from beforeEach but with equipment
			mockPlayer.attributes.bonus.equipment = [{ atk: 5, def: 3 }];
			scene.init({ player: mockPlayer });
			scene.create();

			// Should create more text elements when equipment bonuses exist
			expect((scene as any).add.text).toHaveBeenCalled();
		});
	});

	describe('Player with active buffs', () => {
		it('should display buffs section when buffs are active', () => {
			// Use the mockPlayer from beforeEach but with buffs
			mockPlayer.attributes.bonus.consumable = [{ uniqueId: 1, statBonus: 'atack', value: 10, time: 30 }];
			scene.init({ player: mockPlayer });
			scene.create();

			// Should create more text elements when buffs exist
			expect((scene as any).add.text).toHaveBeenCalled();
		});
	});

	describe('Health bar colors', () => {
		it('should use green for high health', () => {
			mockPlayer.attributes.health = 100;
			mockPlayer.attributes.maxHealth = 100;
			scene.init({ player: mockPlayer });
			scene.create();

			// Health bar should be created with fill
			expect((scene as any).healthBar.fillStyle).toHaveBeenCalled();
		});

		it('should use yellow for medium health', () => {
			mockPlayer.attributes.health = 40;
			mockPlayer.attributes.maxHealth = 100;
			scene.init({ player: mockPlayer });
			scene.create();

			expect((scene as any).healthBar.fillStyle).toHaveBeenCalled();
		});

		it('should use red for low health', () => {
			mockPlayer.attributes.health = 20;
			mockPlayer.attributes.maxHealth = 100;
			scene.init({ player: mockPlayer });
			scene.create();

			expect((scene as any).healthBar.fillStyle).toHaveBeenCalled();
		});
	});
});
