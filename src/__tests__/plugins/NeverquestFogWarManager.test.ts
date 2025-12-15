/**
 * Tests for NeverquestFogWarManager plugin
 */

import { NeverquestFogWarManager } from '../../plugins/NeverquestFogWarManager';

describe('NeverquestFogWarManager', () => {
	let mockScene: any;
	let mockMap: any;
	let mockPlayer: any;
	let mockRenderTexture: any;
	let mockNoVisionRT: any;
	let mockImageMask: any;
	let fogWarManager: NeverquestFogWarManager;

	beforeEach(() => {
		jest.clearAllMocks();

		// Mock render texture
		mockRenderTexture = {
			fill: jest.fn(),
			setTint: jest.fn(),
			depth: 0,
			clear: jest.fn(),
			erase: jest.fn(),
		};

		mockNoVisionRT = {
			fill: jest.fn(),
			setTint: jest.fn(),
			depth: 0,
			clear: jest.fn(),
			erase: jest.fn(),
		};

		// Mock scene
		mockScene = {
			make: {
				renderTexture: jest.fn((_config) => {
					// Return different mocks based on call order
					const callCount = (mockScene.make.renderTexture as jest.Mock).mock.calls.length;
					return callCount === 1 ? mockRenderTexture : mockNoVisionRT;
				}),
			},
			add: {
				image: jest.fn((x, y, _texture) => {
					// Create a new mock image with the specified position
					mockImageMask = {
						x,
						y,
						scale: 1,
						visible: true,
					};
					return mockImageMask;
				}),
			},
		};

		// Mock map
		mockMap = {
			widthInPixels: 800,
			heightInPixels: 600,
		};

		// Mock player
		mockPlayer = {
			container: {
				x: 100,
				y: 150,
			},
		};
	});

	describe('Constructor', () => {
		it('should initialize with scene, map, and player', () => {
			fogWarManager = new NeverquestFogWarManager(mockScene, mockMap, mockPlayer);

			expect(fogWarManager['scene']).toBe(mockScene);
			expect(fogWarManager['map']).toBe(mockMap);
			expect(fogWarManager['player']).toBe(mockPlayer);
		});

		it('should initialize render textures as null', () => {
			fogWarManager = new NeverquestFogWarManager(mockScene, mockMap, mockPlayer);

			expect(fogWarManager['renderTexture']).toBeNull();
			expect(fogWarManager['noVisionRT']).toBeNull();
		});

		it('should initialize image mask as null', () => {
			fogWarManager = new NeverquestFogWarManager(mockScene, mockMap, mockPlayer);

			expect(fogWarManager['imageMask']).toBeNull();
		});

		it('should initialize bitmap mask as null', () => {
			fogWarManager = new NeverquestFogWarManager(mockScene, mockMap, mockPlayer);

			expect(fogWarManager['mask']).toBeNull();
		});

		it('should set default mask texture name', () => {
			fogWarManager = new NeverquestFogWarManager(mockScene, mockMap, mockPlayer);

			expect(fogWarManager['maskTextureName']).toBe('fog_mask');
		});
	});

	describe('createFog()', () => {
		beforeEach(() => {
			fogWarManager = new NeverquestFogWarManager(mockScene, mockMap, mockPlayer);
		});

		it('should create render texture with map dimensions', () => {
			fogWarManager.createFog();

			expect(mockScene.make.renderTexture).toHaveBeenCalledWith(
				{
					x: 0,
					y: 0,
					width: 800,
					height: 600,
				},
				true
			);
		});

		it('should create two render textures (fog and no vision)', () => {
			fogWarManager.createFog();

			expect(mockScene.make.renderTexture).toHaveBeenCalledTimes(2);
		});

		it('should fill fog render texture with black at 0.7 alpha', () => {
			fogWarManager.createFog();

			expect(mockRenderTexture.fill).toHaveBeenCalledWith(0x000000, 0.7);
		});

		it('should fill no vision render texture with black at full alpha', () => {
			fogWarManager.createFog();

			expect(mockNoVisionRT.fill).toHaveBeenCalledWith(0x000000, 1);
		});

		it('should apply dark blue tint to fog render texture', () => {
			fogWarManager.createFog();

			expect(mockRenderTexture.setTint).toHaveBeenCalledWith(0x0a2948);
		});

		it('should apply dark blue tint to no vision render texture', () => {
			fogWarManager.createFog();

			expect(mockNoVisionRT.setTint).toHaveBeenCalledWith(0x0a2948);
		});

		it('should set depth to 999999 for fog render texture', () => {
			fogWarManager.createFog();

			expect(mockRenderTexture.depth).toBe(999999);
		});

		it('should set depth to 999999 for no vision render texture', () => {
			fogWarManager.createFog();

			expect(mockNoVisionRT.depth).toBe(999999);
		});

		it('should create image mask at player position', () => {
			fogWarManager.createFog();

			expect(mockScene.add.image).toHaveBeenCalledWith(100, 150, 'fog_mask');
		});

		it('should set image mask scale to 1.5', () => {
			fogWarManager.createFog();

			expect(mockImageMask.scale).toBe(1.5);
		});

		it('should make image mask invisible', () => {
			fogWarManager.createFog();

			expect(mockImageMask.visible).toBe(false);
		});

		it('should store render texture reference', () => {
			fogWarManager.createFog();

			expect(fogWarManager['renderTexture']).toBe(mockRenderTexture);
		});

		it('should store no vision render texture reference', () => {
			fogWarManager.createFog();

			expect(fogWarManager['noVisionRT']).toBe(mockNoVisionRT);
		});

		it('should store image mask reference', () => {
			fogWarManager.createFog();

			expect(fogWarManager['imageMask']).toBe(mockImageMask);
		});

		it('should use map dimensions for both render textures', () => {
			mockMap.widthInPixels = 1024;
			mockMap.heightInPixels = 768;

			fogWarManager.createFog();

			expect(mockScene.make.renderTexture).toHaveBeenCalledWith(
				expect.objectContaining({
					width: 1024,
					height: 768,
				}),
				true
			);
		});
	});

	describe('updateFog()', () => {
		beforeEach(() => {
			fogWarManager = new NeverquestFogWarManager(mockScene, mockMap, mockPlayer);
			fogWarManager.createFog();
			// Store the current image mask position before clearing mocks
			const currentX = mockImageMask.x;
			const currentY = mockImageMask.y;
			jest.clearAllMocks();
			// Restore position after clearing mocks
			mockImageMask.x = currentX;
			mockImageMask.y = currentY;
		});

		it('should clear the fog render texture', () => {
			fogWarManager.updateFog();

			expect(mockRenderTexture.clear).toHaveBeenCalled();
		});

		it('should refill fog render texture with black at 0.7 alpha', () => {
			fogWarManager.updateFog();

			expect(mockRenderTexture.fill).toHaveBeenCalledWith(0x000000, 0.7);
		});

		it('should reapply dark blue tint to fog render texture', () => {
			fogWarManager.updateFog();

			expect(mockRenderTexture.setTint).toHaveBeenCalledWith(0x0a2948);
		});

		it('should update image mask position to player position', () => {
			mockPlayer.container.x = 250;
			mockPlayer.container.y = 300;

			fogWarManager.updateFog();

			expect(mockImageMask.x).toBe(250);
			expect(mockImageMask.y).toBe(300);
		});

		it('should erase fog from no vision render texture at player position', () => {
			fogWarManager.updateFog();

			expect(mockNoVisionRT.erase).toHaveBeenCalledWith(mockImageMask);
		});

		it('should erase fog from render texture once per update (optimized)', () => {
			fogWarManager.updateFog();

			// Implementation optimized to only erase once
			expect(mockRenderTexture.erase).toHaveBeenCalledTimes(1);
			expect(mockRenderTexture.erase).toHaveBeenCalledWith(mockImageMask);
		});

		it('should handle player movement', () => {
			mockPlayer.container.x = 200;
			mockPlayer.container.y = 200;
			fogWarManager.updateFog();

			expect(mockImageMask.x).toBe(200);
			expect(mockImageMask.y).toBe(200);

			mockPlayer.container.x = 300;
			mockPlayer.container.y = 250;
			fogWarManager.updateFog();

			expect(mockImageMask.x).toBe(300);
			expect(mockImageMask.y).toBe(250);
		});

		it('should not update if player is null', () => {
			const originalX = mockImageMask.x;
			const originalY = mockImageMask.y;

			fogWarManager['player'] = null;

			fogWarManager.updateFog();

			expect(mockImageMask.x).toBe(originalX); // Position unchanged
			expect(mockImageMask.y).toBe(originalY);
			expect(mockNoVisionRT.erase).not.toHaveBeenCalled();
		});

		it('should not update if image mask is null', () => {
			fogWarManager['imageMask'] = null;

			fogWarManager.updateFog();

			expect(mockNoVisionRT.erase).not.toHaveBeenCalled();
			expect(mockRenderTexture.erase).not.toHaveBeenCalled();
		});

		it('should update fog in sequence: clear, fill, tint, move mask, erase', () => {
			const callOrder: string[] = [];

			mockRenderTexture.clear.mockImplementation(() => callOrder.push('clear'));
			mockRenderTexture.fill.mockImplementation(() => callOrder.push('fill'));
			mockRenderTexture.setTint.mockImplementation(() => callOrder.push('tint'));
			mockRenderTexture.erase.mockImplementation(() => callOrder.push('erase'));

			fogWarManager.updateFog();

			// Implementation optimized to only erase once
			expect(callOrder).toEqual(['clear', 'fill', 'tint', 'erase']);
		});
	});

	describe('Integration', () => {
		it('should create and update fog properly', () => {
			fogWarManager = new NeverquestFogWarManager(mockScene, mockMap, mockPlayer);

			// Create fog
			fogWarManager.createFog();

			const imageMask = fogWarManager['imageMask'];

			expect(mockRenderTexture.fill).toHaveBeenCalledWith(0x000000, 0.7);
			expect(mockRenderTexture.setTint).toHaveBeenCalledWith(0x0a2948);
			expect(imageMask!.x).toBe(100);
			expect(imageMask!.y).toBe(150);

			jest.clearAllMocks();

			// Update fog
			mockPlayer.container.x = 200;
			mockPlayer.container.y = 250;
			fogWarManager.updateFog();

			expect(mockRenderTexture.clear).toHaveBeenCalled();
			expect(mockRenderTexture.fill).toHaveBeenCalledWith(0x000000, 0.7);
			expect(imageMask!.x).toBe(200);
			expect(imageMask!.y).toBe(250);
			// Implementation optimized to only erase once
			expect(mockRenderTexture.erase).toHaveBeenCalledTimes(1);
		});

		it('should handle multiple updates', () => {
			fogWarManager = new NeverquestFogWarManager(mockScene, mockMap, mockPlayer);
			fogWarManager.createFog();

			const positions = [
				{ x: 100, y: 100 },
				{ x: 150, y: 150 },
				{ x: 200, y: 200 },
			];

			positions.forEach((pos) => {
				mockPlayer.container.x = pos.x;
				mockPlayer.container.y = pos.y;
				fogWarManager.updateFog();

				expect(mockImageMask.x).toBe(pos.x);
				expect(mockImageMask.y).toBe(pos.y);
			});
		});
	});

	describe('Edge Cases', () => {
		it('should handle very small map dimensions', () => {
			mockMap.widthInPixels = 100;
			mockMap.heightInPixels = 100;

			fogWarManager = new NeverquestFogWarManager(mockScene, mockMap, mockPlayer);
			fogWarManager.createFog();

			expect(mockScene.make.renderTexture).toHaveBeenCalledWith(
				expect.objectContaining({
					width: 100,
					height: 100,
				}),
				true
			);
		});

		it('should handle very large map dimensions', () => {
			mockMap.widthInPixels = 10000;
			mockMap.heightInPixels = 8000;

			fogWarManager = new NeverquestFogWarManager(mockScene, mockMap, mockPlayer);
			fogWarManager.createFog();

			expect(mockScene.make.renderTexture).toHaveBeenCalledWith(
				expect.objectContaining({
					width: 10000,
					height: 8000,
				}),
				true
			);
		});

		it('should handle player at map origin', () => {
			mockPlayer.container.x = 0;
			mockPlayer.container.y = 0;

			fogWarManager = new NeverquestFogWarManager(mockScene, mockMap, mockPlayer);
			fogWarManager.createFog();

			expect(mockScene.add.image).toHaveBeenCalledWith(0, 0, 'fog_mask');
		});

		it('should handle player at negative coordinates', () => {
			mockPlayer.container.x = -50;
			mockPlayer.container.y = -30;

			fogWarManager = new NeverquestFogWarManager(mockScene, mockMap, mockPlayer);
			fogWarManager.createFog();

			expect(mockScene.add.image).toHaveBeenCalledWith(-50, -30, 'fog_mask');
		});

		it('should handle updateFog before createFog gracefully', () => {
			fogWarManager = new NeverquestFogWarManager(mockScene, mockMap, mockPlayer);

			// Should not throw error - implementation returns early if imageMask is null
			expect(() => {
				fogWarManager.updateFog();
			}).not.toThrow();
		});

		it('should handle zero map dimensions', () => {
			mockMap.widthInPixels = 0;
			mockMap.heightInPixels = 0;

			fogWarManager = new NeverquestFogWarManager(mockScene, mockMap, mockPlayer);
			fogWarManager.createFog();

			expect(mockScene.make.renderTexture).toHaveBeenCalledWith(
				expect.objectContaining({
					width: 0,
					height: 0,
				}),
				true
			);
		});
	});

	describe('Render Texture Properties', () => {
		beforeEach(() => {
			fogWarManager = new NeverquestFogWarManager(mockScene, mockMap, mockPlayer);
		});

		it('should create render textures at origin (0, 0)', () => {
			fogWarManager.createFog();

			expect(mockScene.make.renderTexture).toHaveBeenCalledWith(
				expect.objectContaining({
					x: 0,
					y: 0,
				}),
				true
			);
		});

		it('should pass addToScene=true to render texture creation', () => {
			fogWarManager.createFog();

			expect(mockScene.make.renderTexture).toHaveBeenCalledWith(expect.any(Object), true);
		});

		it('should use consistent color values', () => {
			fogWarManager.createFog();

			// Black color (0x000000) for both
			expect(mockRenderTexture.fill).toHaveBeenCalledWith(0x000000, expect.any(Number));
			expect(mockNoVisionRT.fill).toHaveBeenCalledWith(0x000000, expect.any(Number));

			// Dark blue tint (0x0a2948) for both
			expect(mockRenderTexture.setTint).toHaveBeenCalledWith(0x0a2948);
			expect(mockNoVisionRT.setTint).toHaveBeenCalledWith(0x0a2948);
		});

		it('should use different alpha values for fog layers', () => {
			fogWarManager.createFog();

			// Fog texture: 0.7 alpha (semi-transparent)
			expect(mockRenderTexture.fill).toHaveBeenCalledWith(0x000000, 0.7);

			// No vision texture: 1.0 alpha (opaque)
			expect(mockNoVisionRT.fill).toHaveBeenCalledWith(0x000000, 1);
		});

		it('should set depth to very high value for layering', () => {
			fogWarManager.createFog();

			// Should be on top of most game objects
			expect(mockRenderTexture.depth).toBe(999999);
			expect(mockNoVisionRT.depth).toBe(999999);
		});
	});
});
