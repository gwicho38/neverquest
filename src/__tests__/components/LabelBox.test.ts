/**
 * Tests for LabelBox component
 */

import { LabelBox } from '../../components/LabelBox';
import { PanelComponent } from '../../components/PanelComponent';

// Mock PanelComponent
jest.mock('../../components/PanelComponent', () => ({
	PanelComponent: jest.fn().mockImplementation(() => ({
		scene: null,
		panelBackground: null,
		panelTitle: null,
		panelTitleText: null,
		closeButton: null,
		setTitleText: jest.fn(),
		destroy: jest.fn(),
	})),
}));

describe('LabelBox', () => {
	let mockScene: any;

	beforeEach(() => {
		jest.clearAllMocks();

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
				nineslice: jest.fn().mockReturnValue({
					setScrollFactor: jest.fn().mockReturnThis(),
					setOrigin: jest.fn().mockReturnThis(),
					destroy: jest.fn(),
				}),
				image: jest.fn().mockReturnValue({
					setScrollFactor: jest.fn().mockReturnThis(),
					setOrigin: jest.fn().mockReturnThis(),
					setInteractive: jest.fn().mockReturnThis(),
					setScale: jest.fn().mockReturnThis(),
					destroy: jest.fn(),
				}),
				text: jest.fn().mockReturnValue({
					setScrollFactor: jest.fn().mockReturnThis(),
					setOrigin: jest.fn().mockReturnThis(),
					setText: jest.fn().mockReturnThis(),
					destroy: jest.fn(),
				}),
			},
		};
	});

	describe('constructor', () => {
		it('should create a LabelBox with scene reference', () => {
			const labelBox = new LabelBox(mockScene);

			expect(labelBox.scene).toBe(mockScene);
		});

		it('should create a PanelComponent internally', () => {
			const labelBox = new LabelBox(mockScene);

			expect(labelBox.panel).toBeDefined();
			expect(PanelComponent).toHaveBeenCalledWith(mockScene);
		});
	});

	describe('properties', () => {
		it('should expose scene property', () => {
			const labelBox = new LabelBox(mockScene);

			expect(labelBox.scene).toBe(mockScene);
		});

		it('should expose panel property', () => {
			const labelBox = new LabelBox(mockScene);

			expect(labelBox.panel).toBeDefined();
		});
	});

	describe('integration with PanelComponent', () => {
		it('should pass scene to PanelComponent constructor', () => {
			new LabelBox(mockScene);

			expect(PanelComponent).toHaveBeenCalledTimes(1);
			expect(PanelComponent).toHaveBeenCalledWith(mockScene);
		});

		it('should allow access to panel methods', () => {
			const labelBox = new LabelBox(mockScene);

			// Panel methods should be accessible
			expect(typeof labelBox.panel.setTitleText).toBe('function');
			expect(typeof labelBox.panel.destroy).toBe('function');
		});
	});
});
