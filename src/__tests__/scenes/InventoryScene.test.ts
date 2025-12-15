import { InventoryScene } from '../../scenes/InventoryScene';
import { NeverquestInterfaceController } from '../../plugins/NeverquestInterfaceController';
import { PanelComponent } from '../../components/PanelComponent';
import { InfoBox } from '../../components/InfoBox';
import { Item } from '../../entities/Item';
import { NeverquestUtils } from '../../utils/NeverquestUtils';

// Mock dependencies
jest.mock('../../plugins/NeverquestInterfaceController');
jest.mock('../../components/PanelComponent');
jest.mock('../../components/InfoBox');
jest.mock('../../entities/Item');
jest.mock('../../utils/NeverquestUtils');

describe('InventoryScene', () => {
	let scene: InventoryScene;
	let mockAdd: any;
	let mockScene: any;
	let mockScale: any;
	let mockInput: any;
	let mockSound: any;
	let mockCameras: any;
	let mockPlayer: any;

	beforeEach(() => {
		// Mock player
		mockPlayer = {
			items: [
				{ id: 'potion', count: 3 },
				{ id: 'sword', count: 1 },
			],
			canMove: true,
			canAtack: true,
			attributes: {
				level: 5,
			},
		};

		// Mock image objects
		const mockImage = {
			x: 256,
			y: 256,
			width: 512,
			height: 512,
			scaleX: 1,
			scaleY: 1,
			setPosition: jest.fn().mockReturnThis(),
			setScrollFactor: jest.fn().mockReturnThis(),
			setOrigin: jest.fn().mockReturnThis(),
			setInteractive: jest.fn().mockReturnThis(),
			setDisplaySize: jest.fn().mockReturnThis(),
			on: jest.fn().mockReturnThis(),
			destroy: jest.fn(),
		};

		// Mock text objects
		const mockText = {
			x: 300,
			y: 300,
			width: 100,
			scaleX: 1,
			scaleY: 1,
			setPosition: jest.fn().mockReturnThis(),
			setOrigin: jest.fn().mockReturnThis(),
			setText: jest.fn().mockReturnThis(),
			destroy: jest.fn(),
		};

		// Mock sprite objects
		const mockSprite = {
			x: 100,
			y: 100,
			width: 35,
			height: 35,
			scaleX: 1,
			scaleY: 1,
			setPosition: jest.fn().mockReturnThis(),
			setOrigin: jest.fn().mockReturnThis(),
			setDisplaySize: jest.fn().mockReturnThis(),
			setTexture: jest.fn().mockReturnThis(),
			text: null as any,
		};

		// Mock add (GameObjectFactory)
		mockAdd = {
			image: jest.fn(() => ({ ...mockImage })),
			text: jest.fn(() => ({ ...mockText })),
			sprite: jest.fn(() => {
				const sprite = { ...mockSprite };
				sprite.text = { ...mockText };
				return sprite;
			}),
		};

		// Mock scene manager
		mockScene = {
			stop: jest.fn(),
			restart: jest.fn(),
		};

		// Mock scale manager
		mockScale = {
			on: jest.fn(),
		};

		// Mock gamepad
		const mockGamepad = {
			pad1: null as any,
			on: jest.fn(),
		};

		// Mock keyboard
		const mockKeyboard = {
			on: jest.fn(),
		};

		mockInput = {
			gamepad: mockGamepad,
			keyboard: mockKeyboard,
		};

		// Mock sound manager
		mockSound = {
			play: jest.fn(),
		};

		// Mock cameras
		mockCameras = {
			main: {
				midPoint: {
					x: 400,
					y: 300,
				},
			},
		};

		// Mock PanelComponent
		const mockPanelInstance = {
			panelBackground: { ...mockImage },
			panelTitle: { ...mockImage },
			panelTitleText: { ...mockText },
			closeButton: { ...mockImage },
		};
		(PanelComponent as jest.Mock).mockImplementation(() => mockPanelInstance);

		// Mock NeverquestInterfaceController
		const mockInterfaceController = {
			interfaceElements: [[]] as any[][],
			closeAction: null as any,
			currentElementAction: null as any,
			currentLinePosition: 0,
			updateHighlightedElement: jest.fn(),
			recoverPositionFromPrevious: jest.fn(),
		};
		(NeverquestInterfaceController as jest.Mock).mockImplementation(() => mockInterfaceController);

		// Mock Item
		(Item as unknown as jest.Mock).mockImplementation(() => ({
			x: 100,
			y: 100,
			width: 50,
			height: 50,
			scaleX: 1,
			scaleY: 1,
			stackable: true,
			inventoryScale: 1.5,
			setScale: jest.fn(),
			setPosition: jest.fn(),
			destroy: jest.fn(),
			consume: jest.fn(),
		}));

		// Mock NeverquestUtils
		(NeverquestUtils.isMobile as jest.Mock) = jest.fn(() => false);

		// Create scene instance
		scene = new InventoryScene();
		(scene as any).add = mockAdd;
		(scene as any).scene = mockScene;
		(scene as any).scale = mockScale;
		(scene as any).input = mockInput;
		(scene as any).sound = mockSound;
		(scene as any).cameras = mockCameras;
		(scene as any).sys = { game: {} };
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('Constructor', () => {
		it('should create scene with correct key', () => {
			expect(scene.constructor.name).toBe('InventoryScene');
		});

		it('should initialize sprite names', () => {
			expect(scene.inventorySlotTexture).toBe('inventory_slot');
			expect(scene.actionButtonSpriteNameDesktop).toBe('enter_keyboard_key');
			expect(scene.backButtonDesktopSpriteName).toBe('esc_keyboard_key');
		});

		it('should initialize dimensions and padding', () => {
			expect(scene.screenPaddingMobile).toBe(15);
			expect(scene.backgroundSlotPadding).toBe(25);
			expect(scene.backgroundSlotPaddingTop).toBe(100);
			expect(scene.slotMargin).toBe(10);
			expect(scene.slotSize).toBe(53);
		});

		it('should initialize empty slots array', () => {
			expect(scene.slots).toEqual([]);
		});

		it('should initialize null values', () => {
			expect(scene.inventoryBackground).toBeNull();
			expect(scene.closeButton).toBeNull();
			expect(scene.helpPanel).toBeNull();
		});

		it('should initialize flags', () => {
			expect(scene.isReset).toBe(false);
			expect(scene.cachedInterfaceControler).toBeNull();
		});
	});

	describe('init()', () => {
		it('should set player from args', () => {
			scene.init({ player: mockPlayer });
			expect(scene.player).toBe(mockPlayer);
		});

		it('should disable player movement', () => {
			scene.init({ player: mockPlayer });
			expect(mockPlayer.canMove).toBe(false);
			expect(mockPlayer.canAtack).toBe(false);
		});

		it('should handle isReset flag', () => {
			const mockCachedController = {};
			scene.init({ player: mockPlayer, isReset: true, interfaceControler: mockCachedController });
			expect(scene.isReset).toBe(true);
			expect(scene.cachedInterfaceControler).toBe(mockCachedController);
		});
	});

	describe('create()', () => {
		beforeEach(() => {
			scene.init({ player: mockPlayer });
			scene.create();
		});

		it('should create NeverquestInterfaceController', () => {
			expect(NeverquestInterfaceController).toHaveBeenCalledWith(scene);
			expect(scene.neverquestInterfaceController).toBeDefined();
		});

		it('should create PanelComponent', () => {
			expect(PanelComponent).toHaveBeenCalledWith(scene);
			expect(scene.panelComponent).toBeDefined();
		});

		it('should assign panel references', () => {
			expect(scene.inventoryBackground).toBe(scene.panelComponent.panelBackground);
			expect(scene.inventoryTitle).toBe(scene.panelComponent.panelTitle);
			expect(scene.inventoryTitleText).toBe(scene.panelComponent.panelTitleText);
		});

		it('should create inventory slots', () => {
			expect(scene.slots.length).toBeGreaterThan(0);
		});

		it('should play inventory open sound', () => {
			expect(mockSound.play).toHaveBeenCalledWith('inventory_cloth');
		});

		it('should not play sound when isReset is true', () => {
			mockSound.play.mockClear();
			scene.isReset = true;
			scene.create();
			expect(mockSound.play).not.toHaveBeenCalled();
		});

		it('should register resize event listener', () => {
			expect(mockScale.on).toHaveBeenCalledWith('resize', expect.any(Function));
		});

		it('should register gamepad event listeners', () => {
			expect(mockInput.gamepad.on).toHaveBeenCalledWith('connected', expect.any(Function));
			expect(mockInput.gamepad.on).toHaveBeenCalledWith('disconnected', expect.any(Function));
		});
	});

	describe('createSlots()', () => {
		beforeEach(() => {
			scene.init({ player: mockPlayer });
			scene.create();
		});

		it('should create multiple inventory slots', () => {
			expect(scene.slots.length).toBeGreaterThan(0);
		});

		it('should setup interface controller elements for slots', () => {
			expect(scene.neverquestInterfaceController.interfaceElements[1]).toBeDefined();
			expect(scene.neverquestInterfaceController.interfaceElements[1].length).toBeGreaterThan(0);
		});

		it('should set current element action for first slot', () => {
			expect(scene.neverquestInterfaceController.currentElementAction).toBeDefined();
			expect(scene.neverquestInterfaceController.currentLinePosition).toBe(1);
		});
	});

	describe('destroySlots()', () => {
		beforeEach(() => {
			scene.init({ player: mockPlayer });
			scene.create();
		});

		it('should destroy all slots', () => {
			const initialSlots = [...scene.slots];
			scene.destroySlots();

			expect(scene.slots).toEqual([]);
			initialSlots.forEach((slot) => {
				expect(slot.destroy).toHaveBeenCalled();
			});
		});

		it('should handle empty slots array', () => {
			scene.slots = [];
			expect(() => scene.destroySlots()).not.toThrow();
		});
	});

	describe('createCloseButton()', () => {
		beforeEach(() => {
			scene.init({ player: mockPlayer });
			scene.create();
		});

		it('should assign close button from panel component', () => {
			expect(scene.closeButton).toBe(scene.panelComponent.closeButton);
		});

		it('should register pointerup event handler', () => {
			expect(scene.closeButton.on).toHaveBeenCalledWith('pointerup', expect.any(Function));
		});

		it('should setup interface controller close action', () => {
			expect(scene.neverquestInterfaceController.closeAction).toBeDefined();
			expect(scene.neverquestInterfaceController.closeAction.action).toBe('stopScene');
		});
	});

	describe('stopScene()', () => {
		beforeEach(() => {
			scene.init({ player: mockPlayer });
			scene.create();
		});

		it('should play inventory close sound', () => {
			mockSound.play.mockClear();
			scene.stopScene();
			expect(mockSound.play).toHaveBeenCalledWith('inventory_cloth');
		});

		it('should enable player movement', () => {
			mockPlayer.canMove = false;
			mockPlayer.canAtack = false;
			scene.stopScene();
			expect(mockPlayer.canMove).toBe(true);
			expect(mockPlayer.canAtack).toBe(true);
		});

		it('should stop scene', () => {
			scene.stopScene();
			expect(mockScene.stop).toHaveBeenCalled();
		});
	});

	describe('registerKeyboardShortcuts()', () => {
		beforeEach(() => {
			scene.init({ player: mockPlayer });
		});

		it('should register keydown event listener', () => {
			scene.registerKeyboardShortcuts();
			expect(mockInput.keyboard.on).toHaveBeenCalledWith('keydown', expect.any(Function));
		});
	});

	describe('registerGamepad()', () => {
		beforeEach(() => {
			scene.init({ player: mockPlayer });
			mockInput.gamepad.pad1 = { on: jest.fn() };
		});

		it('should register gamepad down event', () => {
			scene.registerGamepad();
			expect(mockInput.gamepad.pad1.on).toHaveBeenCalledWith('down', expect.any(Function));
		});
	});

	describe('toggleInfoBox()', () => {
		beforeEach(() => {
			scene.init({ player: mockPlayer });
			scene.create();
		});

		it('should create info box when none exists', () => {
			const mockSlot = {
				item: {
					name: 'Potion',
					description: 'Heals 50 HP',
				},
				x: 100,
				y: 100,
				width: 50,
				height: 50,
			};
			scene.neverquestInterfaceController.currentElementAction = { element: mockSlot } as any;
			scene.helpPanel = null;

			scene.toggleInfoBox();

			expect(InfoBox).toHaveBeenCalled();
		});

		it('should destroy help panel when it exists', () => {
			scene.helpPanel = {
				backgroundSprite: { destroy: jest.fn() },
				name: { destroy: jest.fn() },
				description: { destroy: jest.fn() },
			} as any;

			scene.toggleInfoBox();

			expect(scene.helpPanel).toBeNull();
		});
	});

	describe('createInfoBox()', () => {
		beforeEach(() => {
			scene.init({ player: mockPlayer });
			scene.create();
		});

		it('should create InfoBox with correct parameters', () => {
			const mockSlot = {
				item: {
					name: 'Potion',
					description: 'Heals 50 HP',
				},
				x: 100,
				y: 100,
				width: 50,
				height: 50,
			};

			scene.createInfoBox(mockSlot as any);

			expect(InfoBox).toHaveBeenCalledWith(scene, 125, 125, 200, 200, {
				name: 'Potion',
				description: 'Heals 50 HP',
			});
		});
	});

	describe('destroyHelpPanel()', () => {
		it('should destroy all help panel components', () => {
			const mockHelpPanel = {
				backgroundSprite: { destroy: jest.fn() },
				name: { destroy: jest.fn() },
				description: { destroy: jest.fn() },
			};
			scene.helpPanel = mockHelpPanel as any;

			scene.destroyHelpPanel();

			expect(mockHelpPanel.backgroundSprite.destroy).toHaveBeenCalled();
			expect(mockHelpPanel.name.destroy).toHaveBeenCalled();
			expect(mockHelpPanel.description.destroy).toHaveBeenCalled();
			expect(scene.helpPanel).toBeNull();
		});

		it('should handle null help panel gracefully', () => {
			scene.helpPanel = null;
			expect(() => scene.destroyHelpPanel()).not.toThrow();
		});
	});

	describe('setGamepadTextures()', () => {
		beforeEach(() => {
			scene.init({ player: mockPlayer });
			scene.create();
			scene.createLegendSection();
		});

		it('should set console textures for back button', () => {
			scene.setGamepadTextures();
			expect(scene.backButtonLegend.setTexture).toHaveBeenCalledWith('buttonB');
		});

		it('should set console textures for action button', () => {
			scene.setGamepadTextures();
			expect(scene.actionButtonLegend.setTexture).toHaveBeenCalledWith('buttonA');
		});

		it('should set console textures for description button', () => {
			scene.setGamepadTextures();
			expect(scene.descriptionButtonLegend.setTexture).toHaveBeenCalledWith('buttonY');
		});
	});

	describe('createLegendSection()', () => {
		beforeEach(() => {
			scene.init({ player: mockPlayer });
			scene.create();
		});

		it('should create action button legend', () => {
			expect(scene.actionButtonLegend).toBeDefined();
			expect(scene.actionButtonLegend.setDisplaySize).toHaveBeenCalledWith(35, 35);
		});

		it('should create description button legend', () => {
			expect(scene.descriptionButtonLegend).toBeDefined();
			expect(scene.descriptionButtonLegend.setDisplaySize).toHaveBeenCalledWith(35, 35);
		});

		it('should create back button legend', () => {
			expect(scene.backButtonLegend).toBeDefined();
			expect(scene.backButtonLegend.setDisplaySize).toHaveBeenCalledWith(35, 35);
		});
	});

	describe('useItem()', () => {
		beforeEach(() => {
			scene.init({ player: mockPlayer });
		});

		it('should consume item', () => {
			const mockSlot = {
				item: { consume: jest.fn(), destroy: jest.fn() },
				text: { setText: jest.fn(), destroy: jest.fn() },
				playerItemIndex: 0,
			};

			scene.useItem(mockSlot as any);

			expect(mockSlot.item.consume).toHaveBeenCalledWith(mockPlayer);
		});

		it('should decrease item count', () => {
			const mockSlot = {
				item: { consume: jest.fn(), destroy: jest.fn() },
				text: { setText: jest.fn(), destroy: jest.fn() },
				playerItemIndex: 0,
			};

			scene.useItem(mockSlot as any);

			expect(mockPlayer.items[0].count).toBe(2);
		});

		it('should handle empty slot gracefully', () => {
			const mockSlot = { item: null as any };
			expect(() => scene.useItem(mockSlot as any)).not.toThrow();
		});
	});

	describe('resizeAll()', () => {
		beforeEach(() => {
			scene.init({ player: mockPlayer });
			scene.create();
		});

		it('should reposition inventory background', () => {
			scene.resizeAll();
			expect(scene.inventoryBackground.setPosition).toHaveBeenCalled();
		});

		it('should reposition inventory title', () => {
			scene.resizeAll();
			expect(scene.inventoryTitle.setPosition).toHaveBeenCalled();
		});

		it('should reposition close button', () => {
			scene.resizeAll();
			expect(scene.closeButton.setPosition).toHaveBeenCalled();
		});

		it('should handle missing cameras gracefully', () => {
			scene.cameras = null as any;
			expect(() => scene.resizeAll()).not.toThrow();
		});
	});

	describe('update()', () => {
		it('should exist as empty method', () => {
			expect(scene.update).toBeDefined();
			expect(() => scene.update()).not.toThrow();
		});
	});

	describe('Integration', () => {
		it('should initialize all components in correct order', () => {
			scene.init({ player: mockPlayer });
			scene.create();

			expect(scene.player).toBe(mockPlayer);
			expect(scene.neverquestInterfaceController).toBeDefined();
			expect(scene.panelComponent).toBeDefined();
			expect(scene.slots.length).toBeGreaterThan(0);
			expect(scene.closeButton).toBeDefined();
		});

		it('should handle full inventory open/close cycle', () => {
			scene.init({ player: mockPlayer });
			scene.create();

			expect(mockSound.play).toHaveBeenCalledWith('inventory_cloth');

			scene.stopScene();

			expect(mockPlayer.canMove).toBe(true);
			expect(mockPlayer.canAtack).toBe(true);
			expect(mockScene.stop).toHaveBeenCalled();
		});

		it('should recover interface controller position from cache', () => {
			const mockCachedController = {};
			scene.init({ player: mockPlayer, isReset: true, interfaceControler: mockCachedController });
			scene.create();

			expect(scene.neverquestInterfaceController.recoverPositionFromPrevious).toHaveBeenCalledWith(
				mockCachedController
			);
		});
	});
});
