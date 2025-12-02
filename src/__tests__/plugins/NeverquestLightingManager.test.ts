import Phaser from 'phaser';
import { NeverquestLightingManager, LightSource, LightingOptions } from '../../plugins/NeverquestLightingManager';

describe('NeverquestLightingManager', () => {
	let mockScene: Phaser.Scene;
	let mockGraphics: Phaser.GameObjects.Graphics;
	let mockRenderTexture: Phaser.GameObjects.RenderTexture;
	let mockCamera: Phaser.Cameras.Scene2D.Camera;
	let lighting: NeverquestLightingManager;

	beforeEach(() => {
		// Mock camera
		mockCamera = {
			scrollX: 0,
			scrollY: 0,
		} as Phaser.Cameras.Scene2D.Camera;

		// Mock graphics
		mockGraphics = {
			setDepth: jest.fn().mockReturnThis(),
			setScrollFactor: jest.fn().mockReturnThis(),
			fillStyle: jest.fn().mockReturnThis(),
			fillRect: jest.fn().mockReturnThis(),
			fillCircle: jest.fn().mockReturnThis(),
			clear: jest.fn().mockReturnThis(),
			destroy: jest.fn(),
			generateTexture: jest.fn(),
		} as any;

		// Mock render texture
		mockRenderTexture = {
			setDepth: jest.fn().mockReturnThis(),
			setScrollFactor: jest.fn().mockReturnThis(),
			setBlendMode: jest.fn().mockReturnThis(),
			clear: jest.fn(),
			draw: jest.fn(),
			destroy: jest.fn(),
		} as any;

		// Mock scene
		mockScene = {
			add: {
				graphics: jest.fn(() => mockGraphics),
				renderTexture: jest.fn(() => mockRenderTexture),
			},
			make: {
				graphics: jest.fn(() => mockGraphics),
			},
			cameras: {
				main: mockCamera,
			},
			scale: {
				width: 800,
				height: 600,
			},
			textures: {
				remove: jest.fn(),
			},
		} as any;

		lighting = new NeverquestLightingManager(mockScene);
	});

	describe('constructor', () => {
		it('should create a lighting manager with default options', () => {
			expect(lighting).toBeDefined();
		});

		it('should accept custom options', () => {
			const customOptions: LightingOptions = {
				ambientDarkness: 0.5,
				defaultLightRadius: 150,
				enableFlicker: false,
				flickerAmount: 10,
				lightColor: 0xff0000,
				smoothGradient: false,
				updateFrequency: 2,
			};

			const customLighting = new NeverquestLightingManager(mockScene, customOptions);
			expect(customLighting).toBeDefined();
		});

		it('should use default values for missing options', () => {
			const partialOptions: LightingOptions = {
				ambientDarkness: 0.5,
			};

			const partialLighting = new NeverquestLightingManager(mockScene, partialOptions);
			expect(partialLighting).toBeDefined();
		});
	});

	describe('create', () => {
		it('should create lighting layers', () => {
			lighting.create();

			expect(mockScene.add.graphics).toHaveBeenCalled();
			expect(mockScene.add.renderTexture).toHaveBeenCalled();
			expect(mockScene.make.graphics).toHaveBeenCalled();
		});

		it('should set proper depth and scroll factors', () => {
			lighting.create();

			expect(mockGraphics.setDepth).toHaveBeenCalledWith(1000);
			expect(mockGraphics.setScrollFactor).toHaveBeenCalledWith(0);
			expect(mockRenderTexture.setDepth).toHaveBeenCalledWith(1001);
			expect(mockRenderTexture.setScrollFactor).toHaveBeenCalledWith(0);
		});

		it('should set blend mode on lighting layer', () => {
			lighting.create();

			// ADD blend mode = 1
			expect(mockRenderTexture.setBlendMode).toHaveBeenCalledWith(1);
		});
	});

	describe('update', () => {
		beforeEach(() => {
			lighting.create();
			// Move camera to trigger update (implementation has 5px threshold)
			mockCamera.scrollX = 10;
			mockCamera.scrollY = 10;
		});

		it('should clear layers before drawing', () => {
			lighting.update();

			expect(mockRenderTexture.clear).toHaveBeenCalled();
			expect(mockGraphics.clear).toHaveBeenCalled();
		});

		it('should draw darkness overlay', () => {
			lighting.update();

			expect(mockGraphics.fillStyle).toHaveBeenCalled();
			expect(mockGraphics.fillRect).toHaveBeenCalledWith(0, 0, 800, 600);
		});

		it('should not update when disabled', () => {
			// Reset call count after create
			jest.clearAllMocks();

			lighting.setEnabled(false);
			lighting.update();

			// Clear should not be called when disabled (after being cleared in setEnabled)
			expect(mockRenderTexture.clear).toHaveBeenCalledTimes(1); // Once in setEnabled(false)
		});

		it('should respect update frequency', () => {
			const frequencyLighting = new NeverquestLightingManager(mockScene, { updateFrequency: 5 });
			frequencyLighting.create();

			// Reset mock counts after create
			jest.clearAllMocks();

			// Move camera to bypass camera movement threshold, then simulate updates
			// First update should run (frameCounter=1, lastUpdate=0, diff=1 >= 5? NO - skip)
			let cameraPos = 10;
			mockCamera.scrollX = cameraPos;
			frequencyLighting.update(); // frameCounter=1, lastUpdate=0, diff=1, skip (1 < 5)
			cameraPos += 10;
			mockCamera.scrollX = cameraPos;
			frequencyLighting.update(); // frameCounter=2, lastUpdate=0, diff=2, skip (2 < 5)
			cameraPos += 10;
			mockCamera.scrollX = cameraPos;
			frequencyLighting.update(); // frameCounter=3, lastUpdate=0, diff=3, skip (3 < 5)
			cameraPos += 10;
			mockCamera.scrollX = cameraPos;
			frequencyLighting.update(); // frameCounter=4, lastUpdate=0, diff=4, skip (4 < 5)
			cameraPos += 10;
			mockCamera.scrollX = cameraPos;
			frequencyLighting.update(); // frameCounter=5, lastUpdate=0, diff=5, RUN! (5 >= 5)
			expect(mockRenderTexture.clear).toHaveBeenCalledTimes(1);

			// Next 4 should be skipped
			cameraPos += 10;
			mockCamera.scrollX = cameraPos;
			frequencyLighting.update(); // frameCounter=6, lastUpdate=5, diff=1, skip
			cameraPos += 10;
			mockCamera.scrollX = cameraPos;
			frequencyLighting.update(); // frameCounter=7, lastUpdate=5, diff=2, skip
			cameraPos += 10;
			mockCamera.scrollX = cameraPos;
			frequencyLighting.update(); // frameCounter=8, lastUpdate=5, diff=3, skip
			cameraPos += 10;
			mockCamera.scrollX = cameraPos;
			frequencyLighting.update(); // frameCounter=9, lastUpdate=5, diff=4, skip
			expect(mockRenderTexture.clear).toHaveBeenCalledTimes(1);

			// 10th frame should run
			cameraPos += 10;
			mockCamera.scrollX = cameraPos;
			frequencyLighting.update(); // frameCounter=10, lastUpdate=5, diff=5, RUN! (5 >= 5)
			expect(mockRenderTexture.clear).toHaveBeenCalledTimes(2);
		});
	});

	describe('player light', () => {
		beforeEach(() => {
			lighting.create();
		});

		it('should set player light', () => {
			lighting.setPlayerLight(100, 200, 150);

			const lights = lighting.getLights();
			expect(lights.player).not.toBeNull();
			expect(lights.player?.x).toBe(100);
			expect(lights.player?.y).toBe(200);
			expect(lights.player?.radius).toBe(150);
		});

		it('should update existing player light position', () => {
			lighting.setPlayerLight(100, 200, 150);
			lighting.setPlayerLight(300, 400);

			const lights = lighting.getLights();
			expect(lights.player?.x).toBe(300);
			expect(lights.player?.y).toBe(400);
			expect(lights.player?.radius).toBe(150); // Radius unchanged
		});

		it('should use default radius if not specified', () => {
			lighting.setPlayerLight(100, 200);

			const lights = lighting.getLights();
			expect(lights.player?.radius).toBe(100); // Default radius
		});

		it('should update player light radius', () => {
			lighting.setPlayerLight(100, 200, 150);
			lighting.setPlayerLightRadius(200);

			const lights = lighting.getLights();
			expect(lights.player?.radius).toBe(200);
		});

		it('should remove player light', () => {
			lighting.setPlayerLight(100, 200, 150);
			lighting.removePlayerLight();

			const lights = lighting.getLights();
			expect(lights.player).toBeNull();
		});
	});

	describe('static lights', () => {
		beforeEach(() => {
			lighting.create();
		});

		it('should add static light', () => {
			const light = lighting.addStaticLight(100, 200, 80);

			expect(light).toBeDefined();
			expect(light.x).toBe(100);
			expect(light.y).toBe(200);
			expect(light.radius).toBe(80);
		});

		it('should add multiple static lights', () => {
			lighting.addStaticLight(100, 200, 80);
			lighting.addStaticLight(300, 400, 60);
			lighting.addStaticLight(500, 600, 100);

			const lights = lighting.getLights();
			expect(lights.static.length).toBe(3);
		});

		it('should accept custom light options', () => {
			const light = lighting.addStaticLight(100, 200, 80, {
				color: 0xff0000,
				intensity: 0.5,
				flicker: false,
			});

			expect(light.color).toBe(0xff0000);
			expect(light.intensity).toBe(0.5);
			expect(light.flicker).toBe(false);
		});

		it('should remove static light', () => {
			const light1 = lighting.addStaticLight(100, 200, 80);
			const light2 = lighting.addStaticLight(300, 400, 60);

			lighting.removeLight(light1);

			const lights = lighting.getLights();
			expect(lights.static.length).toBe(1);
			expect(lights.static[0]).toBe(light2);
		});

		it('should clear all static lights', () => {
			lighting.addStaticLight(100, 200, 80);
			lighting.addStaticLight(300, 400, 60);

			lighting.clearStaticLights();

			const lights = lighting.getLights();
			expect(lights.static.length).toBe(0);
		});
	});

	describe('dynamic lights', () => {
		beforeEach(() => {
			lighting.create();
		});

		it('should add dynamic light', () => {
			const light = lighting.addDynamicLight(100, 200, 80);

			expect(light).toBeDefined();
			expect(light.x).toBe(100);
			expect(light.y).toBe(200);
			expect(light.radius).toBe(80);
		});

		it('should add multiple dynamic lights', () => {
			lighting.addDynamicLight(100, 200, 80);
			lighting.addDynamicLight(300, 400, 60);

			const lights = lighting.getLights();
			expect(lights.dynamic.length).toBe(2);
		});

		it('should accept custom light options', () => {
			const light = lighting.addDynamicLight(100, 200, 80, {
				color: 0x00ff00,
				intensity: 1.5,
				flicker: true,
			});

			expect(light.color).toBe(0x00ff00);
			expect(light.intensity).toBe(1.5);
			expect(light.flicker).toBe(true);
		});

		it('should remove dynamic light', () => {
			const light1 = lighting.addDynamicLight(100, 200, 80);
			const light2 = lighting.addDynamicLight(300, 400, 60);

			lighting.removeLight(light1);

			const lights = lighting.getLights();
			expect(lights.dynamic.length).toBe(1);
			expect(lights.dynamic[0]).toBe(light2);
		});

		it('should clear all dynamic lights', () => {
			lighting.addDynamicLight(100, 200, 80);
			lighting.addDynamicLight(300, 400, 60);

			lighting.clearDynamicLights();

			const lights = lighting.getLights();
			expect(lights.dynamic.length).toBe(0);
		});
	});

	describe('ambient darkness', () => {
		beforeEach(() => {
			lighting.create();
			// Move camera to trigger update (implementation has 5px threshold)
			mockCamera.scrollX = 10;
			mockCamera.scrollY = 10;
		});

		it('should set ambient darkness', () => {
			lighting.setAmbientDarkness(0.5);
			lighting.update();

			expect(mockGraphics.fillStyle).toHaveBeenCalledWith(0x000000, 0.5);
		});

		it('should clamp darkness between 0 and 1', () => {
			lighting.setAmbientDarkness(1.5);
			lighting.update();
			expect(mockGraphics.fillStyle).toHaveBeenCalledWith(0x000000, 1.0);

			// Move camera again for next update
			mockCamera.scrollX = 30;
			lighting.setAmbientDarkness(-0.5);
			lighting.update();
			expect(mockGraphics.fillStyle).toHaveBeenCalledWith(0x000000, 0.0);
		});
	});

	describe('enable/disable', () => {
		beforeEach(() => {
			lighting.create();
		});

		it('should be enabled by default', () => {
			expect(lighting.isEnabled()).toBe(true);
		});

		it('should disable lighting', () => {
			lighting.setEnabled(false);

			expect(lighting.isEnabled()).toBe(false);
		});

		it('should clear layers when disabled', () => {
			lighting.setEnabled(false);

			expect(mockRenderTexture.clear).toHaveBeenCalled();
			expect(mockGraphics.clear).toHaveBeenCalled();
		});

		it('should re-enable lighting', () => {
			lighting.setEnabled(false);
			lighting.setEnabled(true);

			expect(lighting.isEnabled()).toBe(true);
		});
	});

	describe('getLights', () => {
		beforeEach(() => {
			lighting.create();
		});

		it('should return all lights', () => {
			lighting.setPlayerLight(100, 200, 150);
			const staticLight = lighting.addStaticLight(300, 400, 80);
			const dynamicLight = lighting.addDynamicLight(500, 600, 60);

			const lights = lighting.getLights();

			expect(lights.player).not.toBeNull();
			expect(lights.static.length).toBe(1);
			expect(lights.static[0]).toBe(staticLight);
			expect(lights.dynamic.length).toBe(1);
			expect(lights.dynamic[0]).toBe(dynamicLight);
		});

		it('should return empty arrays when no lights exist', () => {
			const lights = lighting.getLights();

			expect(lights.player).toBeNull();
			expect(lights.static.length).toBe(0);
			expect(lights.dynamic.length).toBe(0);
		});
	});

	describe('destroy', () => {
		beforeEach(() => {
			lighting.create();
		});

		it('should destroy all layers', () => {
			lighting.destroy();

			expect(mockGraphics.destroy).toHaveBeenCalled();
			expect(mockRenderTexture.destroy).toHaveBeenCalled();
		});

		it('should clear all lights', () => {
			lighting.setPlayerLight(100, 200, 150);
			lighting.addStaticLight(300, 400, 80);
			lighting.addDynamicLight(500, 600, 60);

			lighting.destroy();

			const lights = lighting.getLights();
			expect(lights.player).toBeNull();
			expect(lights.static.length).toBe(0);
			expect(lights.dynamic.length).toBe(0);
		});
	});

	describe('camera integration', () => {
		beforeEach(() => {
			lighting.create();
		});

		it('should account for camera scroll when drawing lights', () => {
			mockCamera.scrollX = 100;
			mockCamera.scrollY = 50;

			lighting.setPlayerLight(200, 150, 100);
			lighting.update();

			// Light should be drawn at screen position (100, 100) not world position (200, 150)
			expect(mockRenderTexture.draw).toHaveBeenCalled();
		});
	});

	describe('edge cases', () => {
		beforeEach(() => {
			lighting.create();
		});

		it('should handle zero radius light', () => {
			const light = lighting.addStaticLight(100, 200, 0);

			expect(light.radius).toBe(0);
			expect(() => lighting.update()).not.toThrow();
		});

		it('should handle negative coordinates', () => {
			const light = lighting.addStaticLight(-100, -200, 80);

			expect(light.x).toBe(-100);
			expect(light.y).toBe(-200);
			expect(() => lighting.update()).not.toThrow();
		});

		it('should handle very large radius', () => {
			const light = lighting.addStaticLight(100, 200, 10000);

			expect(light.radius).toBe(10000);
			expect(() => lighting.update()).not.toThrow();
		});

		it('should handle removing non-existent light', () => {
			const fakeLight: LightSource = { x: 0, y: 0, radius: 0 };

			expect(() => lighting.removeLight(fakeLight)).not.toThrow();
		});
	});

	describe('texture caching performance', () => {
		beforeEach(() => {
			// Mock textures.exists to return true (textures exist in cache)
			(mockScene.textures as any).exists = jest.fn().mockReturnValue(true);
			lighting.create();
			// Move camera to trigger update (implementation has 5px threshold)
			mockCamera.scrollX = 10;
			mockCamera.scrollY = 10;
		});

		it('should not create/destroy textures on every frame for same light properties', () => {
			// Add multiple static lights with identical properties (as happens with dungeon torches)
			// Using flicker: false to ensure consistent radius
			lighting.addStaticLight(100, 200, 80, { color: 0xff8844, intensity: 0.7, flicker: false });
			lighting.addStaticLight(300, 400, 80, { color: 0xff8844, intensity: 0.7, flicker: false });
			lighting.addStaticLight(500, 600, 80, { color: 0xff8844, intensity: 0.7, flicker: false });

			// Clear mocks to track only update calls
			jest.clearAllMocks();

			// First update creates the texture once
			lighting.update();
			const firstCallCount = (mockGraphics.generateTexture as jest.Mock).mock.calls.length;

			// Subsequent updates should reuse the cached texture
			lighting.update();
			lighting.update();

			// Should only generate texture once (on first frame), then reuse it
			const totalCalls = (mockGraphics.generateTexture as jest.Mock).mock.calls.length;
			expect(totalCalls).toBe(firstCallCount);
			expect(totalCalls).toBeLessThanOrEqual(1);
		});

		it('should reuse textures for lights with identical properties', () => {
			// Add two lights with identical properties
			lighting.addStaticLight(100, 200, 80, { color: 0xffaa66, intensity: 0.8, flicker: false });
			lighting.addStaticLight(300, 400, 80, { color: 0xffaa66, intensity: 0.8, flicker: false });

			// Clear mocks to track only update calls
			jest.clearAllMocks();

			// Update once
			lighting.update();

			// generateTexture should be called at most once for identical light properties
			const generateTextureCalls = (mockGraphics.generateTexture as jest.Mock).mock.calls.length;
			expect(generateTextureCalls).toBeLessThanOrEqual(1);
		});

		it('should clean up cached textures on destroy', () => {
			// Add some lights to create cached textures
			lighting.addStaticLight(100, 200, 80);
			lighting.addStaticLight(300, 400, 60);
			// Add a dynamic light to bypass camera movement threshold optimization
			lighting.addDynamicLight(0, 0, 50);
			lighting.update();

			// Mock textures.exists to return true for cached textures
			(mockScene.textures as any).exists = jest.fn().mockReturnValue(true);

			// Clear mocks
			jest.clearAllMocks();

			// Destroy lighting manager
			lighting.destroy();

			// Should have attempted to remove textures
			expect(mockScene.textures.remove).toHaveBeenCalled();
		});

		it('should not cause performance degradation with many lights over multiple frames', () => {
			// Add many static lights with flicker disabled to test caching efficiency
			for (let i = 0; i < 20; i++) {
				lighting.addStaticLight(i * 100, i * 100, 80, {
					color: 0xff8844,
					intensity: 0.7,
					flicker: false, // Disable flicker for consistent caching
				});
			}
			// Add a dynamic light to bypass camera movement threshold optimization
			lighting.addDynamicLight(0, 0, 50);

			// Clear mocks to track only update calls
			jest.clearAllMocks();

			// Run 60 frames (simulating 1 second at 60fps)
			const startTime = Date.now();
			for (let frame = 0; frame < 60; frame++) {
				lighting.update();
			}
			const endTime = Date.now();

			// The test should complete quickly (under 100ms for 60 frames)
			// In the buggy version, this would take much longer due to texture creation/destruction
			expect(endTime - startTime).toBeLessThan(100);

			// Verify that draw was called (lights are being rendered)
			expect(mockRenderTexture.draw).toHaveBeenCalled();

			// With caching, we should only generate the texture once (first frame)
			// Then reuse it for all 20 lights across all 60 frames
			// Without the fix, this would be 20 * 60 = 1200 texture generations
			const generateTextureCalls = (mockGraphics.generateTexture as jest.Mock).mock.calls.length;
			expect(generateTextureCalls).toBeLessThanOrEqual(2); // One for static, one for dynamic
		});

		it('should handle flicker without excessive texture generation', () => {
			// With flicker enabled, radius varies but should still benefit from caching
			// Add lights with limited flicker range
			for (let i = 0; i < 10; i++) {
				lighting.addStaticLight(i * 100, i * 100, 80, {
					color: 0xff8844,
					intensity: 0.7,
					flicker: true,
					flickerAmount: 4, // Radius can vary by ±4 pixels
				});
			}

			// Clear mocks to track only update calls
			jest.clearAllMocks();

			// Run 30 frames
			for (let frame = 0; frame < 30; frame++) {
				lighting.update();
			}

			// With flicker, we'll create more textures due to radius variation
			// but it should be FAR less than 10 lights * 30 frames = 300
			// Flicker range is ±4, so max ~9 different radii per light config
			// Realistically should be around 9-50 textures total with caching
			const generateTextureCalls = (mockGraphics.generateTexture as jest.Mock).mock.calls.length;
			expect(generateTextureCalls).toBeLessThan(100);
		});
	});
});
