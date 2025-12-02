/**
 * Tests for InfoBox component
 */

import { InfoBox } from '../../components/InfoBox';

describe('InfoBox', () => {
	let mockScene: any;
	let mockNineSlice: any;
	let mockText: any;

	beforeEach(() => {
		mockNineSlice = {
			setScrollFactor: jest.fn().mockReturnThis(),
			setOrigin: jest.fn().mockReturnThis(),
			alpha: 1,
			x: 100,
			y: 100,
			width: 200,
			height: 150,
		};

		mockText = {
			setOrigin: jest.fn().mockReturnThis(),
			setScrollFactor: jest.fn().mockReturnThis(),
			y: 115,
			height: 20,
		};

		mockScene = {
			add: {
				nineslice: jest.fn().mockReturnValue(mockNineSlice),
				text: jest.fn().mockReturnValue(mockText),
			},
		};
	});

	describe('constructor', () => {
		it('should create an InfoBox with default config', () => {
			const infoBox = new InfoBox(mockScene, 100, 100, 200, 150);

			expect(infoBox.scene).toBe(mockScene);
			expect(infoBox.x).toBe(100);
			expect(infoBox.y).toBe(100);
			expect(infoBox.panelMaxWidth).toBe(200);
			expect(infoBox.panelMaxHeight).toBe(150);
		});

		it('should create an InfoBox with custom config', () => {
			const config = { name: 'Test Name', description: 'Test Description' };
			const infoBox = new InfoBox(mockScene, 50, 50, 300, 200, config);

			expect(infoBox.config).toEqual(config);
		});

		it('should set default values', () => {
			const infoBox = new InfoBox(mockScene, 0, 0, 100, 100);

			expect(infoBox.backgroundTexture).toBe('infobox_background');
			expect(infoBox.titleTextFontSize).toBe(10);
			expect(infoBox.nineSliceOffset).toBe(10);
		});

		it('should call createBackground and createInformation', () => {
			const infoBox = new InfoBox(mockScene, 100, 100, 200, 150);

			expect(mockScene.add.nineslice).toHaveBeenCalled();
			expect(mockScene.add.text).toHaveBeenCalled();
		});
	});

	describe('createBackground', () => {
		it('should create a nine-slice background', () => {
			new InfoBox(mockScene, 100, 100, 200, 150);

			expect(mockScene.add.nineslice).toHaveBeenCalledWith(
				100, // x
				100, // y
				'infobox_background', // texture
				undefined, // frame
				200, // width
				150, // height
				10, // leftWidth
				10, // rightWidth
				10, // topHeight
				10 // bottomHeight
			);
		});

		it('should set scroll factor and origin', () => {
			new InfoBox(mockScene, 100, 100, 200, 150);

			expect(mockNineSlice.setScrollFactor).toHaveBeenCalledWith(0, 0);
			expect(mockNineSlice.setOrigin).toHaveBeenCalledWith(0, 0);
		});

		it('should set alpha value', () => {
			const infoBox = new InfoBox(mockScene, 100, 100, 200, 150);

			expect(infoBox.backgroundSprite.alpha).toBeDefined();
		});
	});

	describe('createInformation', () => {
		it('should create name text', () => {
			const config = { name: 'Test Item', description: 'A test item' };
			new InfoBox(mockScene, 100, 100, 200, 150, config);

			// Name text should be created
			expect(mockScene.add.text).toHaveBeenCalledWith(
				115, // baseX = backgroundSprite.x + 15
				115, // baseY = backgroundSprite.y + 15
				'Test Item',
				expect.objectContaining({
					fontSize: 10,
					wordWrap: expect.any(Object),
				})
			);
		});

		it('should create description text', () => {
			const config = { name: 'Test', description: 'Description text' };
			new InfoBox(mockScene, 100, 100, 200, 150, config);

			// Description text should be created (second text call)
			expect(mockScene.add.text).toHaveBeenCalledTimes(2);
		});

		it('should set scroll factor on texts', () => {
			new InfoBox(mockScene, 100, 100, 200, 150);

			expect(mockText.setScrollFactor).toHaveBeenCalledWith(0, 0);
		});

		it('should set origin on name text', () => {
			new InfoBox(mockScene, 100, 100, 200, 150);

			expect(mockText.setOrigin).toHaveBeenCalledWith(0, 0.5);
		});
	});

	describe('properties', () => {
		it('should store background sprite reference', () => {
			const infoBox = new InfoBox(mockScene, 100, 100, 200, 150);

			expect(infoBox.backgroundSprite).toBe(mockNineSlice);
		});

		it('should store name text reference', () => {
			const infoBox = new InfoBox(mockScene, 100, 100, 200, 150);

			expect(infoBox.name).toBe(mockText);
		});

		it('should store description text reference', () => {
			const infoBox = new InfoBox(mockScene, 100, 100, 200, 150);

			expect(infoBox.description).toBe(mockText);
		});

		it('should use Press Start 2P font family', () => {
			const infoBox = new InfoBox(mockScene, 100, 100, 200, 150);

			expect(infoBox.titleFontFamily).toBe('"Press Start 2P"');
		});
	});
});
