import { SettingScene } from '../../scenes/SettingScene';
import { NeverquestSoundManager } from '../../plugins/NeverquestSoundManager';
import { PanelComponent } from '../../components/PanelComponent';

// Mock dependencies
jest.mock('../../plugins/NeverquestSoundManager');
jest.mock('../../components/PanelComponent');

describe('SettingScene', () => {
	let scene: SettingScene;
	let mockAdd: any;
	let mockScene: any;
	let mockScale: any;
	let mockCameras: any;
	let mockRexUI: any;

	beforeEach(() => {
		// Mock text objects
		const mockText = {
			x: 100,
			y: 100,
			text: 'Audio:',
			setPosition: jest.fn().mockReturnThis(),
			setOrigin: jest.fn().mockReturnThis(),
		};

		// Mock sprite objects
		const mockSprite = {
			x: 256,
			y: 256,
			width: 512,
			height: 512,
			setPosition: jest.fn().mockReturnThis(),
			setSize: jest.fn().mockReturnThis(),
		};

		// Mock add (GameObjectFactory)
		mockAdd = {
			text: jest.fn(() => ({ ...mockText })),
		};

		// Mock scene manager
		mockScene = {
			stop: jest.fn(),
		};

		// Mock scale manager
		mockScale = {
			on: jest.fn(),
		};

		// Mock cameras
		mockCameras = {
			main: {
				width: 800,
				height: 600,
			},
		};

		// Mock RexUI slider
		const mockSlider = {
			setOrigin: jest.fn().mockReturnThis(),
			layout: jest.fn().mockReturnThis(),
			setScrollFactor: jest.fn().mockReturnThis(),
		};

		const mockRoundRectangle = jest.fn();

		mockRexUI = {
			add: {
				slider: jest.fn(() => mockSlider),
				roundRectangle: mockRoundRectangle,
			},
		};

		// Mock PanelComponent
		const mockCloseButton = {
			on: jest.fn().mockReturnThis(),
			setPosition: jest.fn().mockReturnThis(),
			y: 115,
		};

		const mockPanelInstance = {
			panelBackground: { ...mockSprite },
			panelTitle: { ...mockSprite },
			panelTitleText: { ...mockText },
			closeButton: mockCloseButton,
			setTitleText: jest.fn(),
		};
		(PanelComponent as jest.Mock).mockImplementation(() => mockPanelInstance);

		// Mock NeverquestSoundManager
		const mockSoundManager = {
			create: jest.fn(),
			getVolume: jest.fn(() => 0.5),
			setVolume: jest.fn(),
		};
		(NeverquestSoundManager as jest.Mock).mockImplementation(() => mockSoundManager);

		// Create scene instance
		scene = new SettingScene();
		(scene as any).add = mockAdd;
		(scene as any).scene = mockScene;
		(scene as any).scale = mockScale;
		(scene as any).cameras = mockCameras;
		(scene as any).rexUI = mockRexUI;
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('Constructor', () => {
		it('should create scene with correct key', () => {
			expect(scene.constructor.name).toBe('SettingScene');
		});

		it('should initialize with null values', () => {
			expect(scene.neverquestSoundManager).toBeNull();
			expect(scene.panelComponent).toBeNull();
			expect(scene.dialog).toBeNull();
			expect(scene.closeButton).toBeNull();
			expect(scene.settingHeader).toBeNull();
			expect(scene.textAudioSlider).toBeNull();
			expect(scene.slider).toBeNull();
		});

		it('should initialize margin properties', () => {
			expect(scene.margin).toBe(10);
			expect(scene.dialogXPosition).toBe(10);
			expect(scene.dialogYPosition).toBe(75);
			expect(scene.dialogBottomOffset).toBe(120);
		});

		it('should initialize nine-slice properties', () => {
			expect(scene.nineSliceOffsets).toBe(60);
			expect(scene.nineSliceSafeArea).toBe(32);
		});

		it('should initialize header properties', () => {
			expect(scene.settingHeaderMarginTop).toBe(115);
			expect(scene.settingHeaderText).toBe('Settings');
			expect(scene.settingHeaderFontSize).toBe('18px');
			expect(scene.settingHeaderFontFamily).toBe('"Press Start 2P"');
		});

		it('should initialize close button properties', () => {
			expect(scene.closeButtonOffsetX).toBe(60);
			expect(scene.closeButtonSpriteName).toBe('close_button');
			expect(scene.closeButtonScale).toBe(1);
		});

		it('should initialize slider properties', () => {
			expect(scene.sliderWidth).toBe(100);
			expect(scene.sliderHeight).toBe(20);
		});

		it('should initialize background sprite name', () => {
			expect(scene.settingBackgroundSpriteName).toBe('panel_background');
		});
	});

	describe('create()', () => {
		beforeEach(() => {
			scene.create();
		});

		it('should create NeverquestSoundManager', () => {
			expect(NeverquestSoundManager).toHaveBeenCalledWith(scene);
			expect(scene.neverquestSoundManager).toBeDefined();
		});

		it('should call neverquestSoundManager.create()', () => {
			expect(scene.neverquestSoundManager!.create).toHaveBeenCalled();
		});

		it('should create PanelComponent', () => {
			expect(PanelComponent).toHaveBeenCalledWith(scene);
			expect(scene.panelComponent).toBeDefined();
		});

		it('should set panel title to Settings', () => {
			expect(scene.panelComponent!.setTitleText).toHaveBeenCalledWith('Settings');
		});

		it('should assign dialog from panel background', () => {
			expect(scene.dialog).toBe(scene.panelComponent!.panelBackground);
		});

		it('should create audio slider', () => {
			expect(scene.textAudioSlider).toBeDefined();
			expect(scene.slider).toBeDefined();
		});

		it('should assign close button from panel', () => {
			expect(scene.closeButton).toBe(scene.panelComponent!.closeButton);
		});

		it('should register close button pointerdown event', () => {
			expect(scene.closeButton.on).toHaveBeenCalledWith('pointerdown', expect.any(Function));
		});

		it('should register resize event listener', () => {
			expect(mockScale.on).toHaveBeenCalledWith('resize', expect.any(Function));
		});
	});

	describe('closeButton event handler', () => {
		beforeEach(() => {
			scene.create();
		});

		it('should stop scene on close button click', () => {
			// Get the pointerdown callback
			const closeButtonMock = scene.closeButton as unknown as { on: jest.Mock };
			const pointerdownCall = closeButtonMock.on.mock.calls.find(
				(call: [string, () => void]) => call[0] === 'pointerdown'
			);
			const callback = pointerdownCall[1];

			// Execute callback
			callback();

			expect(mockScene.stop).toHaveBeenCalled();
		});
	});

	describe('resize event handler', () => {
		beforeEach(() => {
			scene.create();
			// Mock settingHeader for resize tests
			scene.settingHeader = {
				setPosition: jest.fn(),
				y: 115,
			};
		});

		it('should resize dialog on window resize', () => {
			// Get the resize callback
			const resizeCall = mockScale.on.mock.calls.find((call: any) => call[0] === 'resize');
			const callback = resizeCall[1];

			// Execute callback
			callback();

			expect(scene.dialog.setSize).toHaveBeenCalledWith(780, 525); // 800-20, 600-75
		});

		it('should reposition setting header on resize', () => {
			// Get the resize callback
			const resizeCall = mockScale.on.mock.calls.find((call: any) => call[0] === 'resize');
			const callback = resizeCall[1];

			// Execute callback
			callback();

			expect(scene.settingHeader.setPosition).toHaveBeenCalledWith(390, 115); // (800-20)/2, settingHeaderMarginTop
		});

		it('should reposition close button on resize', () => {
			// Get the resize callback
			const resizeCall = mockScale.on.mock.calls.find((call: any) => call[0] === 'resize');
			const callback = resizeCall[1];

			// Execute callback
			callback();

			expect(scene.closeButton.setPosition).toHaveBeenCalledWith(740, 115); // 800-60, settingHeader.y
		});

		it('should handle null cameras gracefully', () => {
			// Set cameras to null
			(scene as any).cameras = null;

			// Get the resize callback
			const resizeCall = mockScale.on.mock.calls.find((call: any) => call[0] === 'resize');
			const callback = resizeCall[1];

			// Should not throw
			expect(() => callback()).not.toThrow();
		});

		it('should handle null cameras.main gracefully', () => {
			// Set cameras.main to null
			(scene as any).cameras = { main: null };

			// Get the resize callback
			const resizeCall = mockScale.on.mock.calls.find((call: any) => call[0] === 'resize');
			const callback = resizeCall[1];

			// Should not throw
			expect(() => callback()).not.toThrow();
		});
	});

	describe('createAudioSlider()', () => {
		beforeEach(() => {
			scene.create();
		});

		it('should create text label for audio slider', () => {
			expect(mockAdd.text).toHaveBeenCalledWith(
				expect.any(Number),
				expect.any(Number),
				'Audio:',
				expect.objectContaining({
					fontSize: '11px',
					fontFamily: '"Press Start 2P"',
				})
			);
		});

		it('should create slider with correct configuration', () => {
			expect(mockRexUI.add.slider).toHaveBeenCalledWith(
				expect.objectContaining({
					x: expect.any(Number),
					y: expect.any(Number),
					width: 100,
					height: 20,
					orientation: 'x',
					value: 0.5,
					input: 'drag',
				})
			);
		});

		it('should set slider origin', () => {
			expect(scene.slider.setOrigin).toHaveBeenCalledWith(0, 0);
		});

		it('should call layout on slider', () => {
			expect(scene.slider.layout).toHaveBeenCalled();
		});

		it('should set scroll factor on slider', () => {
			expect(scene.slider.setScrollFactor).toHaveBeenCalledWith(0, 0);
		});

		it('should create slider track', () => {
			expect(mockRexUI.add.roundRectangle).toHaveBeenCalledWith(0, 0, 0, 0, 6, 0x260e04);
		});

		it('should create slider thumb', () => {
			expect(mockRexUI.add.roundRectangle).toHaveBeenCalledWith(0, 0, 0, 0, 10, 0x7b5e57);
		});

		it('should get initial volume from sound manager', () => {
			expect(scene.neverquestSoundManager!.getVolume).toHaveBeenCalled();
		});
	});

	describe('slider valuechangeCallback', () => {
		beforeEach(() => {
			scene.create();
		});

		it('should update text label when slider value changes', () => {
			// Get the slider configuration
			const sliderCall = mockRexUI.add.slider.mock.calls[0][0];
			const callback = sliderCall.valuechangeCallback;

			// Execute callback with test value
			// 0.75 -> toFixed(1) -> "0.8" -> parseFloat -> 0.8 -> * 100 -> 80
			callback(0.75);

			expect(scene.textAudioSlider!.text).toBe('Audio: 80');
		});

		it('should call setVolume on sound manager', () => {
			// Get the slider configuration
			const sliderCall = mockRexUI.add.slider.mock.calls[0][0];
			const callback = sliderCall.valuechangeCallback;

			// Execute callback with test value
			callback(0.75);

			expect(scene.neverquestSoundManager!.setVolume).toHaveBeenCalledWith(0.75);
		});

		it('should handle 0 volume', () => {
			// Get the slider configuration
			const sliderCall = mockRexUI.add.slider.mock.calls[0][0];
			const callback = sliderCall.valuechangeCallback;

			// Execute callback with 0
			callback(0);

			expect(scene.textAudioSlider!.text).toBe('Audio: 0');
			expect(scene.neverquestSoundManager!.setVolume).toHaveBeenCalledWith(0);
		});

		it('should handle max volume', () => {
			// Get the slider configuration
			const sliderCall = mockRexUI.add.slider.mock.calls[0][0];
			const callback = sliderCall.valuechangeCallback;

			// Execute callback with 1
			callback(1);

			expect(scene.textAudioSlider!.text).toBe('Audio: 100');
			expect(scene.neverquestSoundManager!.setVolume).toHaveBeenCalledWith(1);
		});

		it('should round decimal values correctly', () => {
			// Get the slider configuration
			const sliderCall = mockRexUI.add.slider.mock.calls[0][0];
			const callback = sliderCall.valuechangeCallback;

			// Execute callback with precise decimal
			// 0.567 -> toFixed(1) -> "0.6" -> parseFloat -> 0.6 -> * 100 -> 60
			callback(0.567);

			expect(scene.textAudioSlider!.text).toBe('Audio: 60');
		});
	});

	describe('Integration', () => {
		it('should initialize all components in correct order', () => {
			scene.create();

			expect(scene.neverquestSoundManager).toBeDefined();
			expect(scene.panelComponent).toBeDefined();
			expect(scene.dialog).toBeDefined();
			expect(scene.textAudioSlider).toBeDefined();
			expect(scene.slider).toBeDefined();
			expect(scene.closeButton).toBeDefined();
		});

		it('should handle full volume change cycle', () => {
			scene.create();

			// Get the slider configuration
			const sliderCall = mockRexUI.add.slider.mock.calls[0][0];
			const callback = sliderCall.valuechangeCallback;

			// Change volume multiple times
			// 0.25 -> toFixed(1) -> "0.3" -> * 100 -> 30
			callback(0.25);
			expect(scene.textAudioSlider!.text).toBe('Audio: 30');

			callback(0.5);
			expect(scene.textAudioSlider!.text).toBe('Audio: 50');

			// 0.75 -> toFixed(1) -> "0.8" -> * 100 -> 80
			callback(0.75);
			expect(scene.textAudioSlider!.text).toBe('Audio: 80');

			expect(scene.neverquestSoundManager!.setVolume).toHaveBeenCalledTimes(3);
		});

		it('should handle scene close and resize cycle', () => {
			scene.create();
			scene.settingHeader = { setPosition: jest.fn(), y: 115 };

			// Close scene
			const closeButtonMock = scene.closeButton as unknown as { on: jest.Mock };
			const pointerdownCall = closeButtonMock.on.mock.calls.find(
				(call: [string, () => void]) => call[0] === 'pointerdown'
			);
			pointerdownCall[1]();
			expect(mockScene.stop).toHaveBeenCalled();

			// Resize
			const resizeCall = mockScale.on.mock.calls.find((call: any) => call[0] === 'resize');
			resizeCall[1]();
			expect(scene.dialog.setSize).toHaveBeenCalled();
		});
	});
});
