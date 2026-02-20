import { NeverquestOutlineEffect } from '../../plugins/NeverquestOutlineEffect';

// Mock the rex outline plugin
jest.mock('phaser3-rex-plugins/plugins/outlinepipeline.js', () => ({
	__esModule: true,
	default: 'OutlinePostFx',
}));

describe('NeverquestOutlineEffect', () => {
	let effect: NeverquestOutlineEffect;
	let mockScene: any;
	let mockObject: any;
	let mockPipelineInstance: any;

	beforeEach(() => {
		// Mock pipeline instance
		mockPipelineInstance = {
			setOutlineColor: jest.fn(),
			thickness: 0,
		};

		// Mock outline plugin
		const mockOutlinePlugin = {
			get: jest.fn(() => [mockPipelineInstance]),
		};

		// Mock scene
		mockScene = {
			plugins: {
				get: jest.fn(() => mockOutlinePlugin),
			},
			sys: {},
		};

		// Mock game object
		mockObject = {
			scene: mockScene,
			setPostPipeline: jest.fn(),
			removePostPipeline: jest.fn(),
		};

		effect = new NeverquestOutlineEffect(mockScene);
	});

	describe('Constructor', () => {
		it('should initialize with correct default properties', () => {
			expect(effect.scene).toBe(mockScene);
			expect(effect.effectLayer).toBeNull();
			expect(effect.outlineColor).toBe(0xff0000);
			expect(effect.outlineThickness).toBe(3);
		});

		it('should get rexOutlinePipeline plugin from scene', () => {
			expect(mockScene.plugins.get).toHaveBeenCalledWith('rexOutlinePipeline');
			expect(effect.outlinePostFxPlugin).toBeDefined();
		});

		it('should store the outline plugin reference', () => {
			const plugin = mockScene.plugins.get('rexOutlinePipeline');
			expect(effect.outlinePostFxPlugin).toBe(plugin);
		});
	});

	describe('applyEffect', () => {
		it('should apply outline effect to valid object', () => {
			effect.applyEffect(mockObject);

			expect(mockObject.setPostPipeline).toHaveBeenCalledWith('OutlinePostFx');
		});

		it('should set outline color on pipeline', () => {
			effect.applyEffect(mockObject);

			expect(mockPipelineInstance.setOutlineColor).toHaveBeenCalledWith(0xff0000);
		});

		it('should set thickness on pipeline', () => {
			effect.applyEffect(mockObject);

			expect(mockPipelineInstance.thickness).toBe(3);
		});

		it('should use custom outline color', () => {
			effect.outlineColor = 0x00ff00;
			effect.applyEffect(mockObject);

			expect(mockPipelineInstance.setOutlineColor).toHaveBeenCalledWith(0x00ff00);
		});

		it('should use custom thickness', () => {
			effect.outlineThickness = 5;
			effect.applyEffect(mockObject);

			expect(mockPipelineInstance.thickness).toBe(5);
		});

		it('should not apply effect if object is null', () => {
			effect.applyEffect(null as any);

			expect(mockObject.setPostPipeline).not.toHaveBeenCalled();
		});

		it('should not apply effect if object has no scene', () => {
			const invalidObject = { setPostPipeline: jest.fn() };
			effect.applyEffect(invalidObject as any);

			expect(invalidObject.setPostPipeline).not.toHaveBeenCalled();
		});

		it('should not apply effect if scene has no sys', () => {
			const invalidObject = {
				scene: {},
				setPostPipeline: jest.fn(),
			};
			effect.applyEffect(invalidObject as any);

			expect(invalidObject.setPostPipeline).not.toHaveBeenCalled();
		});

		it('should retrieve pipeline instance from plugin', () => {
			effect.applyEffect(mockObject);

			expect(effect.outlinePostFxPlugin.get).toHaveBeenCalledWith(mockObject);
		});

		it('should use first pipeline instance from array', () => {
			const secondInstance = { setOutlineColor: jest.fn(), thickness: 0 };
			(effect.outlinePostFxPlugin as unknown as { get: jest.Mock }).get.mockReturnValue([
				mockPipelineInstance,
				secondInstance,
			]);

			effect.applyEffect(mockObject);

			expect(mockPipelineInstance.setOutlineColor).toHaveBeenCalled();
			expect(secondInstance.setOutlineColor).not.toHaveBeenCalled();
		});
	});

	describe('removeEffect', () => {
		it('should remove outline effect from valid object', () => {
			effect.removeEffect(mockObject);

			expect(mockObject.removePostPipeline).toHaveBeenCalledWith('OutlinePostFx');
		});

		it('should not remove effect if object is null', () => {
			effect.removeEffect(null as any);

			expect(mockObject.removePostPipeline).not.toHaveBeenCalled();
		});

		it('should not remove effect if object has no scene', () => {
			const invalidObject = { removePostPipeline: jest.fn() };
			effect.removeEffect(invalidObject as any);

			expect(invalidObject.removePostPipeline).not.toHaveBeenCalled();
		});

		it('should not remove effect if scene has no sys', () => {
			const invalidObject = {
				scene: {},
				removePostPipeline: jest.fn(),
			};
			effect.removeEffect(invalidObject as any);

			expect(invalidObject.removePostPipeline).not.toHaveBeenCalled();
		});

		it('should work after applying effect', () => {
			effect.applyEffect(mockObject);
			effect.removeEffect(mockObject);

			expect(mockObject.setPostPipeline).toHaveBeenCalled();
			expect(mockObject.removePostPipeline).toHaveBeenCalled();
		});
	});

	describe('Custom Configuration', () => {
		it('should allow changing outline color before applying', () => {
			effect.outlineColor = 0x0000ff;
			effect.applyEffect(mockObject);

			expect(mockPipelineInstance.setOutlineColor).toHaveBeenCalledWith(0x0000ff);
		});

		it('should allow changing thickness before applying', () => {
			effect.outlineThickness = 10;
			effect.applyEffect(mockObject);

			expect(mockPipelineInstance.thickness).toBe(10);
		});

		it('should handle zero thickness', () => {
			effect.outlineThickness = 0;
			effect.applyEffect(mockObject);

			expect(mockPipelineInstance.thickness).toBe(0);
		});

		it('should handle large thickness values', () => {
			effect.outlineThickness = 100;
			effect.applyEffect(mockObject);

			expect(mockPipelineInstance.thickness).toBe(100);
		});

		it('should handle white color (0xffffff)', () => {
			effect.outlineColor = 0xffffff;
			effect.applyEffect(mockObject);

			expect(mockPipelineInstance.setOutlineColor).toHaveBeenCalledWith(0xffffff);
		});

		it('should handle black color (0x000000)', () => {
			effect.outlineColor = 0x000000;
			effect.applyEffect(mockObject);

			expect(mockPipelineInstance.setOutlineColor).toHaveBeenCalledWith(0x000000);
		});
	});

	describe('Multiple Objects', () => {
		let secondObject: any;

		beforeEach(() => {
			secondObject = {
				scene: mockScene,
				setPostPipeline: jest.fn(),
				removePostPipeline: jest.fn(),
			};
		});

		it('should apply effect to multiple objects', () => {
			effect.applyEffect(mockObject);
			effect.applyEffect(secondObject);

			expect(mockObject.setPostPipeline).toHaveBeenCalled();
			expect(secondObject.setPostPipeline).toHaveBeenCalled();
		});

		it('should remove effect from multiple objects', () => {
			effect.removeEffect(mockObject);
			effect.removeEffect(secondObject);

			expect(mockObject.removePostPipeline).toHaveBeenCalled();
			expect(secondObject.removePostPipeline).toHaveBeenCalled();
		});

		it('should apply different configurations to different objects', () => {
			effect.outlineColor = 0xff0000;
			effect.applyEffect(mockObject);

			effect.outlineColor = 0x00ff00;
			effect.applyEffect(secondObject);

			expect(mockPipelineInstance.setOutlineColor).toHaveBeenNthCalledWith(1, 0xff0000);
			expect(mockPipelineInstance.setOutlineColor).toHaveBeenNthCalledWith(2, 0x00ff00);
		});
	});

	describe('Edge Cases', () => {
		it('should handle undefined object gracefully', () => {
			expect(() => {
				effect.applyEffect(undefined as any);
			}).not.toThrow();
		});

		it('should handle object with undefined scene', () => {
			const objectWithoutScene: any = {
				scene: undefined,
				setPostPipeline: jest.fn(),
			};

			expect(() => {
				effect.applyEffect(objectWithoutScene as any);
			}).not.toThrow();
		});

		it('should handle negative thickness values', () => {
			effect.outlineThickness = -5;
			effect.applyEffect(mockObject);

			expect(mockPipelineInstance.thickness).toBe(-5);
		});

		it('should handle decimal thickness values', () => {
			effect.outlineThickness = 2.5;
			effect.applyEffect(mockObject);

			expect(mockPipelineInstance.thickness).toBe(2.5);
		});
	});

	describe('Integration', () => {
		it('should maintain state across apply and remove', () => {
			effect.outlineColor = 0x00ff00;
			effect.outlineThickness = 7;

			effect.applyEffect(mockObject);
			effect.removeEffect(mockObject);

			expect(effect.outlineColor).toBe(0x00ff00);
			expect(effect.outlineThickness).toBe(7);
		});

		it('should allow reapplying effect after removal', () => {
			effect.applyEffect(mockObject);
			effect.removeEffect(mockObject);
			effect.applyEffect(mockObject);

			expect(mockObject.setPostPipeline).toHaveBeenCalledTimes(2);
			expect(mockObject.removePostPipeline).toHaveBeenCalledTimes(1);
		});
	});
});
