/**
 * Tests for PanelComponent
 */

import { PanelComponent } from '../../components/PanelComponent';
import { NeverquestUtils } from '../../utils/NeverquestUtils';

// Mock NeverquestUtils
jest.mock('../../utils/NeverquestUtils', () => ({
	NeverquestUtils: {
		isMobile: jest.fn().mockReturnValue(false),
	},
}));

describe('PanelComponent', () => {
	let mockScene: any;
	let mockNineSlice: any;
	let mockImage: any;
	let mockText: any;

	beforeEach(() => {
		jest.clearAllMocks();

		mockNineSlice = {
			x: 100,
			y: 100,
			width: 512,
			height: 512,
			scaleX: 1,
			scaleY: 1,
			setScrollFactor: jest.fn().mockReturnThis(),
			setOrigin: jest.fn().mockReturnThis(),
			destroy: jest.fn(),
		};

		mockImage = {
			x: 200,
			y: 200,
			width: 100,
			height: 50,
			setScrollFactor: jest.fn().mockReturnThis(),
			setOrigin: jest.fn().mockReturnThis(),
			setInteractive: jest.fn().mockReturnThis(),
			setScale: jest.fn().mockReturnThis(),
			destroy: jest.fn(),
		};

		mockText = {
			x: 200,
			y: 200,
			setScrollFactor: jest.fn().mockReturnThis(),
			setOrigin: jest.fn().mockReturnThis(),
			setText: jest.fn().mockReturnThis(),
			destroy: jest.fn(),
		};

		mockScene = {
			scene: { key: 'TestScene' },
			cameras: {
				main: {
					width: 800,
					height: 600,
				},
			},
			scale: {
				width: 800,
				height: 600,
			},
			textures: {
				exists: jest.fn().mockReturnValue(true),
			},
			add: {
				nineslice: jest.fn().mockReturnValue(mockNineSlice),
				image: jest.fn().mockReturnValue(mockImage),
				text: jest.fn().mockReturnValue(mockText),
			},
		};
	});

	describe('constructor', () => {
		it('should create a PanelComponent with default values', () => {
			const panel = new PanelComponent(mockScene);

			expect(panel.scene).toBe(mockScene);
			expect(panel.nineSliceOffset).toBe(10);
			expect(panel.verticalBackgroundPadding).toBe(25);
			expect(panel.backgroundMainContentPaddingTop).toBe(100);
			expect(panel.titleTextFontSize).toBe(13);
			expect(panel.panelMaxWidth).toBe(512);
			expect(panel.panelMaxHeight).toBe(512);
			expect(panel.panelScreenMargin).toBe(30);
		});

		it('should have default texture names', () => {
			const panel = new PanelComponent(mockScene);

			expect(panel.inventoryBackgroundTexture).toBe('panel_background');
			expect(panel.panelTitleTexture).toBe('panel_title');
			expect(panel.panelCloseTexture).toBe('close_button');
		});

		it('should call createBackground, createTitle, and createCloseButton', () => {
			new PanelComponent(mockScene);

			expect(mockScene.add.nineslice).toHaveBeenCalled();
			expect(mockScene.add.image).toHaveBeenCalled();
			expect(mockScene.add.text).toHaveBeenCalled();
		});
	});

	describe('createBackground', () => {
		it('should create a nineslice background', () => {
			new PanelComponent(mockScene);

			expect(mockScene.add.nineslice).toHaveBeenCalled();
			expect(mockNineSlice.setScrollFactor).toHaveBeenCalledWith(0, 0);
			expect(mockNineSlice.setOrigin).toHaveBeenCalledWith(0, 0);
		});

		it('should adjust size for mobile devices', () => {
			(NeverquestUtils.isMobile as jest.Mock).mockReturnValue(true);

			const panel = new PanelComponent(mockScene);

			// On mobile, the panel size should be adjusted based on screen size
			expect(panel.panelMaxWidth).toBe(mockScene.cameras.main.width - panel.panelScreenMargin * 4);
			expect(panel.panelMaxHeight).toBe(mockScene.cameras.main.height - panel.panelScreenMargin * 4);
		});

		it('should check if texture exists', () => {
			new PanelComponent(mockScene);

			expect(mockScene.textures.exists).toHaveBeenCalledWith('panel_background');
		});
	});

	describe('createTitle', () => {
		it('should create title image', () => {
			const panel = new PanelComponent(mockScene);

			expect(mockScene.add.image).toHaveBeenCalled();
			expect(panel.panelTitle).toBe(mockImage);
		});

		it('should create title text', () => {
			const panel = new PanelComponent(mockScene);

			expect(mockScene.add.text).toHaveBeenCalled();
			expect(panel.panelTitleText).toBe(mockText);
		});

		it('should set scroll factor on title elements', () => {
			new PanelComponent(mockScene);

			expect(mockImage.setScrollFactor).toHaveBeenCalledWith(0, 0);
			expect(mockText.setScrollFactor).toHaveBeenCalledWith(0, 0);
		});

		it('should set origin on title elements', () => {
			new PanelComponent(mockScene);

			expect(mockImage.setOrigin).toHaveBeenCalledWith(0.5, 0.5);
			expect(mockText.setOrigin).toHaveBeenCalledWith(0.5, 0.5);
		});
	});

	describe('createCloseButton', () => {
		it('should create close button image', () => {
			const panel = new PanelComponent(mockScene);

			expect(panel.closeButton).toBe(mockImage);
		});

		it('should make close button interactive', () => {
			new PanelComponent(mockScene);

			expect(mockImage.setInteractive).toHaveBeenCalled();
		});

		it('should set origin and scale on close button', () => {
			new PanelComponent(mockScene);

			expect(mockImage.setOrigin).toHaveBeenCalledWith(0.5, 0.5);
			expect(mockImage.setScale).toHaveBeenCalled();
		});
	});

	describe('setTitleText', () => {
		it('should update the title text', () => {
			const panel = new PanelComponent(mockScene);

			panel.setTitleText('New Title');

			expect(mockText.setText).toHaveBeenCalledWith('New Title');
		});
	});

	describe('destroy', () => {
		it('should destroy all panel components', () => {
			const panel = new PanelComponent(mockScene);

			panel.destroy();

			expect(mockNineSlice.destroy).toHaveBeenCalled();
			expect(mockImage.destroy).toHaveBeenCalled();
			expect(mockText.destroy).toHaveBeenCalled();
		});
	});

	describe('properties', () => {
		it('should store panel background reference', () => {
			const panel = new PanelComponent(mockScene);

			expect(panel.panelBackground).toBe(mockNineSlice);
		});

		it('should have Press Start 2P font family', () => {
			const panel = new PanelComponent(mockScene);

			expect(panel.titleFontFamily).toBe('"Press Start 2P"');
		});

		it('should have default panel name as Inventory', () => {
			const panel = new PanelComponent(mockScene);

			expect(panel.panelName).toBe('Inventory');
		});
	});
});
