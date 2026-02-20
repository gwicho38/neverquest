import { AttributeScene, AttributeSceneName } from '../../scenes/AttributeScene';
import { NeverquestInterfaceController } from '../../plugins/NeverquestInterfaceController';
import { PanelComponent } from '../../components/PanelComponent';
import { ButtonMinus } from '../../components/UI/ButtonMinus';
import { ButtonPlus } from '../../components/UI/ButtonPlus';
import { SceneToggleWatcher } from '../../scenes/watchers/SceneToggleWatcher';

// Mock dependencies
jest.mock('../../plugins/NeverquestInterfaceController');
jest.mock('../../components/PanelComponent');
jest.mock('../../components/UI/ButtonMinus');
jest.mock('../../components/UI/ButtonPlus');
jest.mock('../../scenes/watchers/SceneToggleWatcher');
jest.mock('lodash', () => ({
	cloneDeep: jest.fn((obj) => JSON.parse(JSON.stringify(obj))),
}));

describe('AttributeScene', () => {
	let scene: AttributeScene;
	let mockAdd: any;
	let mockScene: any;
	let mockScale: any;
	let mockSound: any;
	let mockCameras: any;
	let mockPlayer: any;

	beforeEach(() => {
		// Mock player with attributes
		mockPlayer = {
			canMove: true,
			attributes: {
				rawAttributes: {
					str: 10,
					agi: 10,
					vit: 10,
					dex: 10,
					int: 10,
				},
				availableStatPoints: 5,
				atack: 15,
				defense: 8,
				baseHealth: 100,
				critical: 5,
				flee: 10,
				hit: 95,
			},
			attributesManager: {
				addAttribute: jest.fn(),
				removeAttribute: jest.fn(),
			},
		};

		// Mock text objects
		const mockText = {
			x: 100,
			y: 100,
			height: 20,
			setPosition: jest.fn().mockReturnThis(),
			setOrigin: jest.fn().mockReturnThis(),
			setText: jest.fn().mockReturnThis(),
		};

		// Mock sprite objects
		const mockSprite = {
			x: 256,
			y: 256,
			width: 512,
			height: 512,
			scaleX: 1,
			scaleY: 1,
			setPosition: jest.fn().mockReturnThis(),
		};

		// Mock add (GameObjectFactory)
		mockAdd = {
			text: jest.fn(() => ({ ...mockText })),
		};

		// Mock scene manager
		mockScene = {
			isActive: jest.fn(() => true),
		};

		// Mock scale manager
		mockScale = {
			on: jest.fn(),
		};

		// Mock sound manager
		mockSound = {
			play: jest.fn(),
		};

		// Mock cameras
		mockCameras = {
			main: {
				width: 800,
				height: 600,
			},
		};

		// Mock PanelComponent
		const mockCloseButton = {
			on: jest.fn().mockReturnThis(),
		};

		const mockPanelInstance = {
			panelBackground: { ...mockSprite },
			panelTitle: { ...mockSprite },
			panelTitleText: { ...mockText },
			closeButton: mockCloseButton,
			setTitleText: jest.fn(),
		};
		(PanelComponent as jest.Mock).mockImplementation(() => mockPanelInstance);

		// Mock NeverquestInterfaceController
		const mockInterfaceController = {
			interfaceElements: [[[]]] as any[][][],
			closeAction: null as any,
			currentElementAction: null as any,
			createFirstRow: jest.fn(),
			updateHighlightedElement: jest.fn(),
		};
		(NeverquestInterfaceController as jest.Mock).mockImplementation(() => mockInterfaceController);

		// Mock ButtonMinus
		const mockButtonMinus = {
			play: jest.fn(),
			anims: {
				isPlaying: false,
			},
		};
		(ButtonMinus as unknown as jest.Mock).mockImplementation(() => mockButtonMinus);

		// Mock ButtonPlus
		const mockButtonPlus = {
			x: 150,
			play: jest.fn(),
			anims: {
				isPlaying: false,
			},
		};
		(ButtonPlus as unknown as jest.Mock).mockImplementation(() => mockButtonPlus);

		// Create scene instance
		scene = new AttributeScene();
		(scene as any).add = mockAdd;
		(scene as any).scene = mockScene;
		(scene as any).scale = mockScale;
		(scene as any).sound = mockSound;
		(scene as any).cameras = mockCameras;
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('Constructor', () => {
		it('should create scene with correct key', () => {
			expect(scene.constructor.name).toBe('AttributeScene');
		});

		it('should initialize with null values', () => {
			expect(scene.player).toBeNull();
			expect(scene.attributesBackground).toBeNull();
			expect(scene.panelComponent).toBeNull();
		});

		it('should initialize attributes configuration', () => {
			expect(scene.attributesConfiguration).toHaveLength(5);
			expect(scene.attributesConfiguration[0]).toEqual({
				attribute: 'str',
				text: 'STR',
			});
			expect(scene.attributesConfiguration[4]).toEqual({
				attribute: 'int',
				text: 'INT',
			});
		});

		it('should initialize empty attributesUiArray', () => {
			expect(scene.attributesUiArray).toEqual([]);
		});

		it('should set attributes background sprite name', () => {
			expect(scene.atributesBackgroundSpriteName).toBe('attributes_background');
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
		});

		it('should play turn page sound', () => {
			scene.init({ player: mockPlayer });
			expect(mockSound.play).toHaveBeenCalledWith('turn_page');
		});
	});

	describe('create()', () => {
		beforeEach(() => {
			scene.init({ player: mockPlayer });
			scene.create();
		});

		it('should create NeverquestInterfaceController', () => {
			expect(NeverquestInterfaceController).toHaveBeenCalledWith(scene);
			expect(scene.interfaceController).toBeDefined();
		});

		it('should clone player raw attributes', () => {
			expect(scene.lastRawAttributes).toEqual(mockPlayer.attributes.rawAttributes);
			expect(scene.lastRawAttributes).not.toBe(mockPlayer.attributes.rawAttributes);
		});

		it('should populate attributesUiArray with 5 attributes', () => {
			expect(scene.attributesUiArray).toHaveLength(5);
		});

		it('should create PanelComponent', () => {
			expect(PanelComponent).toHaveBeenCalledWith(scene);
			expect(scene.panelComponent).toBeDefined();
		});

		it('should set panel title to Attributes', () => {
			expect(scene.panelComponent?.setTitleText).toHaveBeenCalledWith('Attributes');
		});

		it('should assign attributesBackground from panel', () => {
			expect(scene.attributesBackground).toBe(scene.panelComponent?.panelBackground);
		});

		it('should position attributesBackground', () => {
			expect(scene.attributesBackground?.setPosition).toHaveBeenCalled();
		});

		it('should register resize event listener', () => {
			expect(mockScale.on).toHaveBeenCalledWith('resize', scene.resizeAll, scene);
		});
	});

	describe('createCloseButton()', () => {
		beforeEach(() => {
			scene.init({ player: mockPlayer });
			scene.create();
		});

		it('should assign close button from panel component', () => {
			expect(scene.closeButton).toBe(scene.panelComponent?.closeButton);
		});

		it('should register pointerdown event handler', () => {
			expect(scene.closeButton.on).toHaveBeenCalledWith('pointerdown', expect.any(Function));
		});

		it('should setup interface controller close action', () => {
			expect(scene.interfaceController.closeAction).toBeDefined();
			expect(scene.interfaceController.closeAction.action).toBe('closeScene');
			expect(scene.interfaceController.closeAction.element).toBe(scene.closeButton);
		});

		it('should set current element action to close action', () => {
			expect(scene.interfaceController.currentElementAction).toBe(scene.interfaceController.closeAction);
		});

		it('should create first row in interface controller', () => {
			expect(scene.interfaceController.createFirstRow).toHaveBeenCalled();
		});

		it('should add close action to interface elements', () => {
			expect(scene.interfaceController.interfaceElements[0][0]).toContainEqual(
				expect.objectContaining({ action: 'closeScene' })
			);
		});

		it('should update highlighted element', () => {
			expect(scene.interfaceController.updateHighlightedElement).toHaveBeenCalledWith(scene.closeButton);
		});
	});

	describe('closeScene()', () => {
		beforeEach(() => {
			scene.init({ player: mockPlayer });
			scene.create();
		});

		it('should toggle scene using SceneToggleWatcher', () => {
			scene.closeScene();
			expect(SceneToggleWatcher.toggleScene).toHaveBeenCalledWith(scene, AttributeSceneName, mockPlayer);
		});

		it('should play turn page sound', () => {
			mockSound.play.mockClear();
			scene.closeScene();
			expect(mockSound.play).toHaveBeenCalledWith('turn_page');
		});
	});

	describe('createAttributesButtons()', () => {
		beforeEach(() => {
			scene.init({ player: mockPlayer });
			scene.create();
		});

		it('should create buttons for each attribute', () => {
			expect(ButtonMinus).toHaveBeenCalledTimes(5);
			expect(ButtonPlus).toHaveBeenCalledTimes(5);
		});

		it('should create minus button with correct action', () => {
			expect(ButtonMinus).toHaveBeenCalledWith(
				scene,
				expect.any(Number),
				expect.any(Number),
				'removeAttribute',
				expect.objectContaining({ attribute: 'str' })
			);
		});

		it('should create plus button with correct action', () => {
			expect(ButtonPlus).toHaveBeenCalledWith(
				scene,
				expect.any(Number),
				expect.any(Number),
				'addAttribute',
				expect.objectContaining({ attribute: 'str' })
			);
		});

		it('should create attribute text for each attribute', () => {
			expect(mockAdd.text).toHaveBeenCalledWith(
				expect.any(Number),
				expect.any(Number),
				expect.stringContaining('STR')
			);
		});

		it('should populate attributesUiArray', () => {
			expect(scene.attributesUiArray).toHaveLength(5);
			expect(scene.attributesUiArray[0]).toHaveProperty('minus_button');
			expect(scene.attributesUiArray[0]).toHaveProperty('plus_button');
			expect(scene.attributesUiArray[0]).toHaveProperty('attributeText');
		});

		it('should setup interface controller elements for row 1', () => {
			expect(scene.interfaceController.interfaceElements[1]).toHaveLength(5);
			expect(scene.interfaceController.interfaceElements[1][0]).toHaveLength(2); // minus and plus
		});

		it('should create available stat points text', () => {
			expect(scene.availableAttributesText).toBeDefined();
		});

		it('should display correct available stat points', () => {
			const textCall = mockAdd.text.mock.calls.find((call: any) => call[2].includes('Available:'));
			expect(textCall).toBeDefined();
			expect(textCall[2]).toBe('Available: 5');
		});
	});

	describe('createAttributesInfo()', () => {
		beforeEach(() => {
			scene.init({ player: mockPlayer });
			scene.create();
		});

		it('should create atack text', () => {
			expect(scene.atackText).toBeDefined();
		});

		it('should create defense text', () => {
			expect(scene.defenseText).toBeDefined();
		});

		it('should create max health text', () => {
			expect(scene.maxHealthText).toBeDefined();
		});

		it('should create critical text', () => {
			expect(scene.criticalText).toBeDefined();
		});

		it('should create flee text', () => {
			expect(scene.fleeText).toBeDefined();
		});

		it('should create hit text', () => {
			expect(scene.hitText).toBeDefined();
		});

		it('should display correct attribute values', () => {
			const textCalls = mockAdd.text.mock.calls;

			// Find specific text calls
			const atackCall = textCalls.find((call: any) => call[2] === 'Atack: 15');
			const defenseCall = textCalls.find((call: any) => call[2] === 'Defense: 8');
			const maxHealthCall = textCalls.find((call: any) => call[2] === 'Max Health: 100');

			expect(atackCall).toBeDefined();
			expect(defenseCall).toBeDefined();
			expect(maxHealthCall).toBeDefined();
		});
	});

	describe('checkButtonEnabled()', () => {
		beforeEach(() => {
			scene.init({ player: mockPlayer });
			scene.create();
		});

		it('should disable minus button when attribute not changed', () => {
			scene.checkButtonEnabled();

			scene.attributesUiArray.forEach((ui) => {
				expect(ui.minus_button.play).toHaveBeenCalledWith('disabled_button_minus', true);
			});
		});

		it('should enable minus button when attribute changed', () => {
			scene.player!.attributes.rawAttributes.str = 11;
			scene.attributesUiArray[0].minus_button.anims.isPlaying = false;

			scene.checkButtonEnabled();

			expect(scene.attributesUiArray[0].minus_button.play).toHaveBeenCalledWith('init_button_minus', true);
		});

		it('should disable plus button when no available stat points', () => {
			scene.player!.attributes.availableStatPoints = 0;

			scene.checkButtonEnabled();

			scene.attributesUiArray.forEach((ui) => {
				expect(ui.plus_button.play).toHaveBeenCalledWith('disabled_button_plus', true);
			});
		});

		it('should enable plus button when stat points available', () => {
			scene.player!.attributes.availableStatPoints = 5;
			scene.attributesUiArray[0].plus_button.anims.isPlaying = false;

			scene.checkButtonEnabled();

			expect(scene.attributesUiArray[0].plus_button.play).toHaveBeenCalledWith('init_button_plus', true);
		});

		it('should not play animation if already playing', () => {
			scene.player!.attributes.rawAttributes.str = 11;
			scene.attributesUiArray[0].minus_button.anims.isPlaying = true;
			(scene.attributesUiArray[0].minus_button.play as jest.Mock).mockClear();

			scene.checkButtonEnabled();

			expect(scene.attributesUiArray[0].minus_button.play).not.toHaveBeenCalledWith('init_button_minus', true);
		});
	});

	describe('addAttribute()', () => {
		beforeEach(() => {
			scene.init({ player: mockPlayer });
			scene.create();
		});

		it('should call attributesManager.addAttribute', () => {
			const payload = { attribute: 'str', text: 'STR' } as const;
			scene.addAttribute(payload);

			expect(mockPlayer.attributesManager.addAttribute).toHaveBeenCalledWith('str', 1, scene.lastRawAttributes);
		});

		it('should work with different attributes', () => {
			const payload = { attribute: 'int', text: 'INT' } as const;
			scene.addAttribute(payload);

			expect(mockPlayer.attributesManager.addAttribute).toHaveBeenCalledWith('int', 1, scene.lastRawAttributes);
		});
	});

	describe('removeAttribute()', () => {
		beforeEach(() => {
			scene.init({ player: mockPlayer });
			scene.create();
		});

		it('should call attributesManager.removeAttribute', () => {
			const payload = { attribute: 'str', text: 'STR' } as const;
			scene.removeAttribute(payload);

			expect(mockPlayer.attributesManager.removeAttribute).toHaveBeenCalledWith(
				'str',
				1,
				scene.lastRawAttributes
			);
		});

		it('should work with different attributes', () => {
			const payload = { attribute: 'dex', text: 'DEX' } as const;
			scene.removeAttribute(payload);

			expect(mockPlayer.attributesManager.removeAttribute).toHaveBeenCalledWith(
				'dex',
				1,
				scene.lastRawAttributes
			);
		});
	});

	describe('resizeAll()', () => {
		beforeEach(() => {
			scene.init({ player: mockPlayer });
			scene.create();
		});

		it('should reposition atack text', () => {
			scene.resizeAll();
			expect(scene.atackText.setPosition).toHaveBeenCalled();
		});

		it('should reposition defense text', () => {
			scene.resizeAll();
			expect(scene.defenseText.setPosition).toHaveBeenCalled();
		});

		it('should reposition max health text', () => {
			scene.resizeAll();
			expect(scene.maxHealthText.setPosition).toHaveBeenCalled();
		});

		it('should reposition critical text', () => {
			scene.resizeAll();
			expect(scene.criticalText.setPosition).toHaveBeenCalled();
		});

		it('should reposition flee text', () => {
			scene.resizeAll();
			expect(scene.fleeText.setPosition).toHaveBeenCalled();
		});

		it('should reposition hit text', () => {
			scene.resizeAll();
			expect(scene.hitText.setPosition).toHaveBeenCalled();
		});

		it('should handle null text elements gracefully', () => {
			// Set all text elements to null
			scene.atackText = null as any;
			scene.defenseText = null as any;
			scene.maxHealthText = null as any;
			scene.criticalText = null as any;
			scene.fleeText = null as any;
			scene.hitText = null as any;
			expect(() => scene.resizeAll()).not.toThrow();
		});
	});

	describe('setAttributesText()', () => {
		beforeEach(() => {
			scene.init({ player: mockPlayer });
			scene.create();
		});

		it('should update atack text', () => {
			scene.player!.attributes.atack = 20;
			scene.setAttributesText();
			expect(scene.atackText.setText).toHaveBeenCalledWith('Atack: 20');
		});

		it('should update defense text', () => {
			scene.player!.attributes.defense = 12;
			scene.setAttributesText();
			expect(scene.defenseText.setText).toHaveBeenCalledWith('Defense: 12');
		});

		it('should update max health text', () => {
			scene.player!.attributes.baseHealth = 150;
			scene.setAttributesText();
			expect(scene.maxHealthText.setText).toHaveBeenCalledWith('Max Health: 150');
		});

		it('should update critical text', () => {
			scene.player!.attributes.critical = 10;
			scene.setAttributesText();
			expect(scene.criticalText.setText).toHaveBeenCalledWith('Critical: 10 %');
		});

		it('should update flee text', () => {
			scene.player!.attributes.flee = 15;
			scene.setAttributesText();
			expect(scene.fleeText.setText).toHaveBeenCalledWith('Flee: 15');
		});

		it('should update hit text', () => {
			scene.player!.attributes.hit = 98;
			scene.setAttributesText();
			expect(scene.hitText.setText).toHaveBeenCalledWith('Hit: 98');
		});

		it('should not update when scene is inactive', () => {
			mockScene.isActive.mockReturnValue(false);
			(scene.atackText.setText as jest.Mock).mockClear();
			scene.setAttributesText();
			expect(scene.atackText.setText).not.toHaveBeenCalled();
		});
	});

	describe('update()', () => {
		beforeEach(() => {
			scene.init({ player: mockPlayer });
			scene.create();
		});

		it('should call checkButtonEnabled', () => {
			const spy = jest.spyOn(scene, 'checkButtonEnabled');
			scene.update();
			expect(spy).toHaveBeenCalled();
		});

		it('should call setAttributesText', () => {
			const spy = jest.spyOn(scene, 'setAttributesText');
			scene.update();
			expect(spy).toHaveBeenCalled();
		});

		it('should update available stat points text', () => {
			scene.player!.attributes.availableStatPoints = 3;
			scene.update();
			expect(scene.availableAttributesText.setText).toHaveBeenCalledWith('Available: 3');
		});

		it('should skip updates when player is null', () => {
			// Mock checkButtonEnabled and setAttributesText to avoid calling them
			const checkButtonEnabledSpy = jest.spyOn(scene, 'checkButtonEnabled').mockImplementation(() => {});
			const setAttributesTextSpy = jest.spyOn(scene, 'setAttributesText').mockImplementation(() => {});

			scene.player = null;
			scene.update();

			// Verify methods were called but update logic handled null player
			expect(checkButtonEnabledSpy).toHaveBeenCalled();
			expect(setAttributesTextSpy).toHaveBeenCalled();
			// availableAttributesText.setText should not be called due to null player check
			expect(scene.availableAttributesText.setText).not.toHaveBeenCalledWith(
				expect.stringContaining('Available')
			);
		});

		it('should handle null availableAttributesText gracefully', () => {
			scene.availableAttributesText = null as any;
			expect(() => scene.update()).not.toThrow();
		});
	});

	describe('Integration', () => {
		it('should initialize all components in correct order', () => {
			scene.init({ player: mockPlayer });
			scene.create();

			expect(scene.player).toBe(mockPlayer);
			expect(scene.interfaceController).toBeDefined();
			expect(scene.panelComponent).toBeDefined();
			expect(scene.lastRawAttributes).toBeDefined();
			expect(scene.attributesUiArray).toHaveLength(5);
			expect(scene.closeButton).toBeDefined();
		});

		it('should handle full attribute modification cycle', () => {
			scene.init({ player: mockPlayer });
			scene.create();

			// Add attribute
			scene.addAttribute({ attribute: 'str', text: 'STR' } as const);
			expect(mockPlayer.attributesManager.addAttribute).toHaveBeenCalledWith('str', 1, scene.lastRawAttributes);

			// Remove attribute
			scene.removeAttribute({ attribute: 'str', text: 'STR' } as const);
			expect(mockPlayer.attributesManager.removeAttribute).toHaveBeenCalledWith(
				'str',
				1,
				scene.lastRawAttributes
			);
		});

		it('should handle scene open/close cycle', () => {
			scene.init({ player: mockPlayer });
			expect(mockPlayer.canMove).toBe(false);
			expect(mockSound.play).toHaveBeenCalledWith('turn_page');

			scene.create();
			scene.closeScene();

			expect(SceneToggleWatcher.toggleScene).toHaveBeenCalledWith(scene, AttributeSceneName, mockPlayer);
			expect(mockSound.play).toHaveBeenCalledWith('turn_page');
		});

		it('should update all UI elements continuously', () => {
			scene.init({ player: mockPlayer });
			scene.create();

			// Simulate multiple update frames
			scene.update();
			scene.update();
			scene.update();

			expect(scene.availableAttributesText.setText).toHaveBeenCalled();
			expect(scene.atackText.setText).toHaveBeenCalled();
		});
	});
});
