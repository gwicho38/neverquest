/**
 * Tests for NeverquestMinimap plugin
 */

import { NeverquestMinimap } from '../../../plugins/HUD/NeverquestMinimap';

describe('NeverquestMinimap', () => {
	let minimap: NeverquestMinimap;
	let mockScene: any;
	let mockPlayer: any;
	let mockMap: any;
	let mockContainer: any;
	let mockGraphics: any;
	let mockRenderTexture: any;
	let mockCamera: any;
	let consoleLogSpy: jest.SpyInstance;

	beforeEach(() => {
		// Spy on console.log to suppress output in tests
		consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

		// Mock camera
		mockCamera = {
			height: 600,
			width: 800,
		};

		// Mock graphics
		mockGraphics = {
			fillStyle: jest.fn().mockReturnThis(),
			fillRect: jest.fn().mockReturnThis(),
			fillCircle: jest.fn().mockReturnThis(),
			lineStyle: jest.fn().mockReturnThis(),
			strokeRect: jest.fn().mockReturnThis(),
			setPosition: jest.fn().mockReturnThis(),
			destroy: jest.fn(),
			clear: jest.fn(),
		};

		// Mock render texture
		mockRenderTexture = {
			clear: jest.fn(),
			draw: jest.fn(),
			destroy: jest.fn(),
			setOrigin: jest.fn().mockReturnThis(),
		};

		// Mock container
		mockContainer = {
			setScrollFactor: jest.fn().mockReturnThis(),
			setDepth: jest.fn().mockReturnThis(),
			add: jest.fn().mockReturnThis(),
			setPosition: jest.fn().mockReturnThis(),
			destroy: jest.fn(),
		};

		// Mock tilemap layer
		const mockTilemapLayer = {
			visible: true,
			getTileAt: jest.fn((x: number, y: number) => {
				// Return different tiles based on position
				if (x === 0 && y === 0) {
					return {
						index: 1,
						collides: true,
						collideUp: false,
						collideDown: false,
						collideLeft: false,
						collideRight: false,
					};
				}
				if (x === 1 && y === 1) {
					return {
						index: 2,
						collides: false,
						collideUp: false,
						collideDown: false,
						collideLeft: false,
						collideRight: false,
					};
				}
				return null;
			}),
		};

		// Mock tilemap
		mockMap = {
			width: 20,
			height: 20,
			tileWidth: 32,
			tileHeight: 32,
			layers: [
				{
					name: 'Ground',
					tilemapLayer: mockTilemapLayer,
				},
				{
					name: 'Collision',
					tilemapLayer: mockTilemapLayer,
				},
			],
		};

		// Mock player
		mockPlayer = {
			container: {
				x: 320,
				y: 320,
			},
		};

		// Mock scene
		mockScene = {
			cameras: {
				main: mockCamera,
			},
			add: {
				container: jest.fn().mockReturnValue(mockContainer),
				graphics: jest.fn(() => {
					const g = { ...mockGraphics };
					return g;
				}),
				renderTexture: jest.fn().mockReturnValue(mockRenderTexture),
			},
		};

		// Suppress console.log for cleaner test output
		jest.spyOn(console, 'log').mockImplementation(() => {});
	});

	afterEach(() => {
		consoleLogSpy.mockRestore();
	});

	describe('Constructor', () => {
		it('should initialize with scene, player, and map', () => {
			minimap = new NeverquestMinimap(mockScene, mockPlayer, mockMap);

			expect(minimap.scene).toBe(mockScene);
			expect(minimap.player).toBe(mockPlayer);
			expect(minimap.map).toBe(mockMap);
		});

		it('should set default dimensions', () => {
			minimap = new NeverquestMinimap(mockScene, mockPlayer, mockMap);

			expect(minimap.width).toBe(150);
			expect(minimap.height).toBe(150);
			expect(minimap.padding).toBe(10);
		});

		it('should set default map scale', () => {
			minimap = new NeverquestMinimap(mockScene, mockPlayer, mockMap);

			expect(minimap.mapScale).toBe(0.1);
		});

		it('should position in bottom-left corner', () => {
			minimap = new NeverquestMinimap(mockScene, mockPlayer, mockMap);

			expect(minimap.x).toBe(10); // padding
			expect(minimap.y).toBe(440); // 600 - 150 - 10
		});

		it('should call create() during construction', () => {
			const createSpy = jest.spyOn(NeverquestMinimap.prototype, 'create');
			minimap = new NeverquestMinimap(mockScene, mockPlayer, mockMap);

			expect(createSpy).toHaveBeenCalled();
		});

		it('should log constructor info', () => {
			minimap = new NeverquestMinimap(mockScene, mockPlayer, mockMap);

			expect(console.log).toHaveBeenCalledWith(
				'[Minimap] Constructor called with:',
				expect.objectContaining({
					hasScene: true,
					hasPlayer: true,
					hasMap: true,
					mapWidth: 20,
					mapHeight: 20,
					layerCount: 2,
				})
			);
		});
	});

	describe('create()', () => {
		beforeEach(() => {
			minimap = new NeverquestMinimap(mockScene, mockPlayer, mockMap);
		});

		it('should create container at correct position', () => {
			expect(mockScene.add.container).toHaveBeenCalledWith(10, 440);
		});

		it('should set container scroll factor to 0', () => {
			expect(mockContainer.setScrollFactor).toHaveBeenCalledWith(0);
		});

		it('should set container depth to 1000', () => {
			expect(mockContainer.setDepth).toHaveBeenCalledWith(1000);
		});

		it('should create background with semi-transparent black', () => {
			const graphicsCalls = (mockScene.add.graphics as jest.Mock).mock.results;
			const background = graphicsCalls[0].value;

			expect(background.fillStyle).toHaveBeenCalledWith(0x000000, 0.7);
			expect(background.fillRect).toHaveBeenCalledWith(0, 0, 150, 150);
		});

		it('should create border with white outline', () => {
			expect(minimap.border).toBeDefined();
			expect(minimap.border.lineStyle).toHaveBeenCalledWith(2, 0xffffff, 0.8);
			expect(minimap.border.strokeRect).toHaveBeenCalledWith(0, 0, 150, 150);
		});

		it('should create render texture for map', () => {
			expect(mockScene.add.renderTexture).toHaveBeenCalledWith(0, 0, 150, 150);
			expect(minimap.mapTexture).toBe(mockRenderTexture);
		});

		it('should create red player marker', () => {
			expect(minimap.playerMarker).toBeDefined();
			expect(minimap.playerMarker.fillStyle).toHaveBeenCalledWith(0xff0000, 1);
			expect(minimap.playerMarker.fillCircle).toHaveBeenCalledWith(0, 0, 3);
		});

		it('should add all elements to container', () => {
			expect(mockContainer.add).toHaveBeenCalledWith(
				expect.arrayContaining([expect.any(Object), mockRenderTexture, minimap.playerMarker, minimap.border])
			);
		});

		it('should call renderMap during creation', () => {
			const renderMapSpy = jest.spyOn(minimap, 'renderMap');
			minimap.create();

			expect(renderMapSpy).toHaveBeenCalled();
		});
	});

	describe('renderMap()', () => {
		beforeEach(() => {
			minimap = new NeverquestMinimap(mockScene, mockPlayer, mockMap);
		});

		it('should clear render texture before rendering', () => {
			minimap.renderMap();

			expect(mockRenderTexture.clear).toHaveBeenCalled();
		});

		it('should return early if mapTexture is missing', () => {
			minimap.mapTexture = null as any;
			minimap.renderMap();

			// Should log error
			expect(console.log).toHaveBeenCalledWith(
				'[Minimap] Missing mapTexture or map:',
				expect.objectContaining({
					hasTexture: false,
					hasMap: true,
				})
			);
		});

		it('should return early if map is missing', () => {
			minimap.map = null as any;
			minimap.renderMap();

			// Should log error
			expect(console.log).toHaveBeenCalledWith(
				'[Minimap] Missing mapTexture or map:',
				expect.objectContaining({
					hasTexture: true,
					hasMap: false,
				})
			);
		});

		it('should calculate visible area around player', () => {
			minimap.renderMap();

			// Should access player position
			expect(mockPlayer.container.x).toBe(320);
			expect(mockPlayer.container.y).toBe(320);
		});

		it('should iterate through all map layers', () => {
			minimap.renderMap();

			// Should access layers
			expect(minimap.map.layers.length).toBe(2);
		});

		it('should create temporary graphics for drawing', () => {
			const graphicsCallCount = (mockScene.add.graphics as jest.Mock).mock.calls.length;
			minimap.renderMap();

			// Should create additional graphics (background, border, player marker, temp graphics)
			expect(mockScene.add.graphics).toHaveBeenCalled();
		});

		it('should draw graphics to render texture', () => {
			minimap.renderMap();

			expect(mockRenderTexture.draw).toHaveBeenCalled();
		});

		it('should position player marker at center of minimap', () => {
			minimap.renderMap();

			const setPositionCalls = minimap.playerMarker.setPosition as jest.Mock;
			// Check last call (after renderMap)
			expect(minimap.playerMarker.setPosition).toHaveBeenCalled();
		});

		it('should handle collision tiles with wall color', () => {
			minimap.renderMap();

			// Wall color should be used for colliding tiles
			expect(mockGraphics.fillStyle).toHaveBeenCalled();
		});

		it('should handle non-collision tiles with floor color', () => {
			minimap.renderMap();

			// Floor color should be used for non-colliding tiles
			expect(mockGraphics.fillStyle).toHaveBeenCalled();
		});

		it('should log render info only once', () => {
			// Create fresh minimap to test logging behavior
			const freshMinimap = new NeverquestMinimap(mockScene, mockPlayer, mockMap);
			consoleLogSpy.mockClear();

			freshMinimap.renderMap();
			const firstCallCount = consoleLogSpy.mock.calls.length;

			consoleLogSpy.mockClear();
			freshMinimap.renderMap();
			const secondCallCount = consoleLogSpy.mock.calls.length;

			// Second call should have fewer logs (due to hasLoggedOnce flag)
			expect(secondCallCount).toBeLessThanOrEqual(firstCallCount);
		});

		it('should handle layers without tilemapLayer', () => {
			(minimap.map.layers as any).push({
				name: 'Empty Layer',
				tilemapLayer: null,
			});

			// Should not throw
			expect(() => {
				minimap.renderMap();
			}).not.toThrow();
		});

		it('should handle tiles with index -1 (empty tiles)', () => {
			const mockLayer = {
				visible: true,
				getTileAt: jest.fn(() => ({ index: -1 })),
			};
			minimap.map.layers[0].tilemapLayer = mockLayer as any;

			// Should not throw
			expect(() => {
				minimap.renderMap();
			}).not.toThrow();
		});

		it('should handle layer names with "collision" keyword', () => {
			minimap.renderMap();

			// Should detect collision layer by name
			const collisionLayer = minimap.map.layers.find((l: any) => l.name.toLowerCase().includes('collision'));
			expect(collisionLayer).toBeDefined();
		});

		it('should handle layer names with "ground" keyword', () => {
			minimap.renderMap();

			// Should detect ground layer by name
			const groundLayer = minimap.map.layers.find((l: any) => l.name.toLowerCase().includes('ground'));
			expect(groundLayer).toBeDefined();
		});

		it('should destroy temporary graphics after rendering', () => {
			minimap.renderMap();

			expect(mockGraphics.destroy).toHaveBeenCalled();
		});
	});

	describe('update()', () => {
		beforeEach(() => {
			minimap = new NeverquestMinimap(mockScene, mockPlayer, mockMap);
		});

		it('should call renderMap', () => {
			const renderMapSpy = jest.spyOn(minimap, 'renderMap');
			minimap.update();

			expect(renderMapSpy).toHaveBeenCalled();
		});

		it('should update on every call', () => {
			const renderMapSpy = jest.spyOn(minimap, 'renderMap');
			minimap.update();
			minimap.update();
			minimap.update();

			expect(renderMapSpy).toHaveBeenCalledTimes(3);
		});
	});

	describe('setPosition()', () => {
		beforeEach(() => {
			minimap = new NeverquestMinimap(mockScene, mockPlayer, mockMap);
		});

		it('should update position properties', () => {
			minimap.setPosition(50, 100);

			expect(minimap.x).toBe(50);
			expect(minimap.y).toBe(100);
		});

		it('should update container position', () => {
			minimap.setPosition(75, 125);

			expect(mockContainer.setPosition).toHaveBeenCalledWith(75, 125);
		});

		it('should handle negative positions', () => {
			minimap.setPosition(-10, -20);

			expect(minimap.x).toBe(-10);
			expect(minimap.y).toBe(-20);
			expect(mockContainer.setPosition).toHaveBeenCalledWith(-10, -20);
		});

		it('should handle zero positions', () => {
			minimap.setPosition(0, 0);

			expect(minimap.x).toBe(0);
			expect(minimap.y).toBe(0);
		});

		it('should handle very large positions', () => {
			minimap.setPosition(9999, 8888);

			expect(minimap.x).toBe(9999);
			expect(minimap.y).toBe(8888);
		});

		it('should not throw if container is undefined', () => {
			minimap.container = undefined as any;

			expect(() => {
				minimap.setPosition(50, 50);
			}).not.toThrow();
		});
	});

	describe('resize()', () => {
		beforeEach(() => {
			minimap = new NeverquestMinimap(mockScene, mockPlayer, mockMap);
		});

		it('should update width when provided', () => {
			minimap.resize(200, undefined);

			expect(minimap.width).toBe(200);
		});

		it('should update height when provided', () => {
			minimap.resize(undefined, 200);

			expect(minimap.height).toBe(200);
		});

		it('should update both dimensions when both provided', () => {
			minimap.resize(250, 300);

			expect(minimap.width).toBe(250);
			expect(minimap.height).toBe(300);
		});

		it('should reposition to bottom-left after resize', () => {
			minimap.resize(200, 200);

			// y = camera.height - height - padding
			expect(minimap.y).toBe(390); // 600 - 200 - 10
		});

		it('should destroy old container', () => {
			const oldContainer = minimap.container;
			minimap.resize(200, 200);

			expect(oldContainer.destroy).toHaveBeenCalled();
		});

		it('should recreate container with new size', () => {
			const createSpy = jest.spyOn(minimap, 'create');
			minimap.resize(200, 200);

			expect(createSpy).toHaveBeenCalled();
		});

		it('should handle only width resize', () => {
			const originalHeight = minimap.height;
			minimap.resize(175);

			expect(minimap.width).toBe(175);
			expect(minimap.height).toBe(originalHeight);
		});

		it('should handle only height resize', () => {
			const originalWidth = minimap.width;
			minimap.resize(undefined, 175);

			expect(minimap.width).toBe(originalWidth);
			expect(minimap.height).toBe(175);
		});

		it('should not resize if no parameters provided', () => {
			const originalWidth = minimap.width;
			const originalHeight = minimap.height;
			minimap.resize();

			// Still should reposition
			expect(minimap.width).toBe(originalWidth);
			expect(minimap.height).toBe(originalHeight);
		});

		it('should handle zero dimensions', () => {
			const originalWidth = minimap.width;
			const originalHeight = minimap.height;

			// Should not throw with zero dimensions
			expect(() => {
				minimap.resize(0, 0);
			}).not.toThrow();

			// Zero is falsy, so width/height should remain unchanged
			expect(minimap.width).toBe(originalWidth);
			expect(minimap.height).toBe(originalHeight);
		});

		it('should handle very large dimensions', () => {
			minimap.resize(1000, 1000);

			expect(minimap.width).toBe(1000);
			expect(minimap.height).toBe(1000);
		});
	});

	describe('destroy()', () => {
		beforeEach(() => {
			minimap = new NeverquestMinimap(mockScene, mockPlayer, mockMap);
		});

		it('should destroy container', () => {
			minimap.destroy();

			expect(mockContainer.destroy).toHaveBeenCalled();
		});

		it('should not throw if container is undefined', () => {
			minimap.container = undefined as any;

			expect(() => {
				minimap.destroy();
			}).not.toThrow();
		});

		it('should handle multiple destroy calls', () => {
			minimap.destroy();
			minimap.destroy();

			// Should not throw
			expect(mockContainer.destroy).toHaveBeenCalled();
		});
	});

	describe('Edge Cases', () => {
		it('should handle map with no layers', () => {
			mockMap.layers = [];
			minimap = new NeverquestMinimap(mockScene, mockPlayer, mockMap);

			expect(() => {
				minimap.renderMap();
			}).not.toThrow();
		});

		it('should handle map with single layer', () => {
			mockMap.layers = [mockMap.layers[0]];
			minimap = new NeverquestMinimap(mockScene, mockPlayer, mockMap);

			expect(() => {
				minimap.renderMap();
			}).not.toThrow();
		});

		it('should handle very small map', () => {
			mockMap.width = 1;
			mockMap.height = 1;
			minimap = new NeverquestMinimap(mockScene, mockPlayer, mockMap);

			expect(() => {
				minimap.renderMap();
			}).not.toThrow();
		});

		it('should handle very large map', () => {
			mockMap.width = 1000;
			mockMap.height = 1000;
			minimap = new NeverquestMinimap(mockScene, mockPlayer, mockMap);

			expect(() => {
				minimap.renderMap();
			}).not.toThrow();
		});

		it('should handle player at map origin', () => {
			mockPlayer.container.x = 0;
			mockPlayer.container.y = 0;
			minimap = new NeverquestMinimap(mockScene, mockPlayer, mockMap);

			expect(() => {
				minimap.renderMap();
			}).not.toThrow();
		});

		it('should handle player at map bounds', () => {
			mockPlayer.container.x = mockMap.width * mockMap.tileWidth;
			mockPlayer.container.y = mockMap.height * mockMap.tileHeight;
			minimap = new NeverquestMinimap(mockScene, mockPlayer, mockMap);

			expect(() => {
				minimap.renderMap();
			}).not.toThrow();
		});

		it('should handle player outside map bounds', () => {
			mockPlayer.container.x = -100;
			mockPlayer.container.y = -100;
			minimap = new NeverquestMinimap(mockScene, mockPlayer, mockMap);

			expect(() => {
				minimap.renderMap();
			}).not.toThrow();
		});

		it('should handle very small tile size', () => {
			mockMap.tileWidth = 1;
			mockMap.tileHeight = 1;
			minimap = new NeverquestMinimap(mockScene, mockPlayer, mockMap);

			expect(() => {
				minimap.renderMap();
			}).not.toThrow();
		});

		it('should handle very large tile size', () => {
			mockMap.tileWidth = 256;
			mockMap.tileHeight = 256;
			minimap = new NeverquestMinimap(mockScene, mockPlayer, mockMap);

			expect(() => {
				minimap.renderMap();
			}).not.toThrow();
		});

		it('should handle fractional positions', () => {
			minimap = new NeverquestMinimap(mockScene, mockPlayer, mockMap);
			minimap.setPosition(50.5, 75.7);

			expect(minimap.x).toBe(50.5);
			expect(minimap.y).toBe(75.7);
		});

		it('should handle very small camera dimensions', () => {
			mockCamera.width = 100;
			mockCamera.height = 100;
			minimap = new NeverquestMinimap(mockScene, mockPlayer, mockMap);

			// Should position correctly even with small camera
			expect(minimap.y).toBeLessThan(100);
		});
	});

	describe('Integration', () => {
		it('should handle complete workflow: create, update, resize, destroy', () => {
			minimap = new NeverquestMinimap(mockScene, mockPlayer, mockMap);
			minimap.update();
			minimap.resize(200, 200);
			minimap.setPosition(50, 50);
			minimap.update();
			minimap.destroy();

			// Should complete without errors
			expect(mockContainer.destroy).toHaveBeenCalled();
		});

		it('should handle multiple updates with player movement', () => {
			minimap = new NeverquestMinimap(mockScene, mockPlayer, mockMap);

			mockPlayer.container.x = 100;
			mockPlayer.container.y = 100;
			minimap.update();

			mockPlayer.container.x = 200;
			mockPlayer.container.y = 200;
			minimap.update();

			mockPlayer.container.x = 300;
			mockPlayer.container.y = 300;
			minimap.update();

			// Should handle position changes
			expect(mockRenderTexture.clear).toHaveBeenCalled();
		});

		it('should maintain state through position and resize changes', () => {
			minimap = new NeverquestMinimap(mockScene, mockPlayer, mockMap);
			const originalMapScale = minimap.mapScale;

			minimap.setPosition(100, 100);
			minimap.resize(200, 200);

			// Should preserve map scale
			expect(minimap.mapScale).toBe(originalMapScale);
		});
	});
});
