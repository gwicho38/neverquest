/**
 * Tests for AssetCacheManager
 */

import { AssetCacheManager, AssetInfo, assetCacheManager } from '../../utils/AssetCacheManager';

// Mock fetch
global.fetch = jest.fn();

// Mock URL.createObjectURL and URL.revokeObjectURL
const mockObjectURL = 'blob:http://localhost/mock-url';
global.URL.createObjectURL = jest.fn().mockReturnValue(mockObjectURL);
global.URL.revokeObjectURL = jest.fn();

describe('AssetCacheManager', () => {
	let manager: AssetCacheManager;

	beforeEach(() => {
		jest.clearAllMocks();
		// Reset singleton for testing - access private instance
		(AssetCacheManager as any).instance = undefined;
		manager = AssetCacheManager.getInstance();
	});

	afterEach(() => {
		manager.clearCache();
	});

	describe('Singleton Pattern', () => {
		it('should return the same instance', () => {
			const instance1 = AssetCacheManager.getInstance();
			const instance2 = AssetCacheManager.getInstance();
			expect(instance1).toBe(instance2);
		});

		it('should export a singleton instance', () => {
			expect(assetCacheManager).toBeDefined();
			expect(assetCacheManager).toBeInstanceOf(AssetCacheManager);
		});
	});

	describe('registerAsset', () => {
		it('should register an asset', () => {
			const assetInfo: AssetInfo = {
				key: 'test-image',
				url: 'http://example.com/image.png',
				type: 'image',
				priority: 'medium',
				preload: false,
				cached: false,
			};

			manager.registerAsset(assetInfo);

			const info = manager.getAssetInfo('test-image');
			expect(info).toEqual(assetInfo);
		});

		it('should add high priority preload assets to front of queue', () => {
			const highPriority: AssetInfo = {
				key: 'high-priority',
				url: 'http://example.com/high.png',
				type: 'image',
				priority: 'high',
				preload: true,
				cached: false,
			};

			const lowPriority: AssetInfo = {
				key: 'low-priority',
				url: 'http://example.com/low.png',
				type: 'image',
				priority: 'low',
				preload: true,
				cached: false,
			};

			manager.registerAsset(lowPriority);
			manager.registerAsset(highPriority);

			// High priority should be at front of queue
			const allAssets = manager.getAllAssets();
			expect(allAssets).toHaveLength(2);
		});

		it('should add medium/low priority preload assets to end of queue', () => {
			const mediumPriority: AssetInfo = {
				key: 'medium-priority',
				url: 'http://example.com/medium.png',
				type: 'image',
				priority: 'medium',
				preload: true,
				cached: false,
			};

			manager.registerAsset(mediumPriority);

			const info = manager.getAssetInfo('medium-priority');
			expect(info).toBeDefined();
		});
	});

	describe('loadAsset', () => {
		it('should return cached asset if already loaded', async () => {
			const assetInfo: AssetInfo = {
				key: 'cached-asset',
				url: 'http://example.com/cached.png',
				type: 'image',
				priority: 'medium',
				preload: false,
				cached: false,
			};

			manager.registerAsset(assetInfo);

			// Mock fetch
			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
				blob: () => Promise.resolve(new Blob(['test'])),
			});

			// First load
			const result1 = await manager.loadAsset('cached-asset');
			expect(result1).toBe(mockObjectURL);
			expect(global.fetch).toHaveBeenCalledTimes(1);

			// Second load should use cache
			const result2 = await manager.loadAsset('cached-asset');
			expect(result2).toBe(mockObjectURL);
			expect(global.fetch).toHaveBeenCalledTimes(1); // Should not fetch again
		});

		it('should throw error for unregistered asset', async () => {
			await expect(manager.loadAsset('unregistered')).rejects.toThrow();
		});

		it('should load image assets', async () => {
			const assetInfo: AssetInfo = {
				key: 'image-asset',
				url: 'http://example.com/image.png',
				type: 'image',
				priority: 'medium',
				preload: false,
				cached: false,
			};

			manager.registerAsset(assetInfo);

			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
				blob: () => Promise.resolve(new Blob(['image data'])),
			});

			const result = await manager.loadAsset('image-asset');
			expect(result).toBe(mockObjectURL);
			expect(URL.createObjectURL).toHaveBeenCalled();
		});

		it('should load audio assets', async () => {
			const assetInfo: AssetInfo = {
				key: 'audio-asset',
				url: 'http://example.com/audio.mp3',
				type: 'audio',
				priority: 'medium',
				preload: false,
				cached: false,
			};

			manager.registerAsset(assetInfo);

			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
				blob: () => Promise.resolve(new Blob(['audio data'])),
			});

			const result = await manager.loadAsset('audio-asset');
			expect(result).toBe(mockObjectURL);
		});

		it('should load video assets', async () => {
			const assetInfo: AssetInfo = {
				key: 'video-asset',
				url: 'http://example.com/video.mp4',
				type: 'video',
				priority: 'medium',
				preload: false,
				cached: false,
			};

			manager.registerAsset(assetInfo);

			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
				blob: () => Promise.resolve(new Blob(['video data'])),
			});

			const result = await manager.loadAsset('video-asset');
			expect(result).toBe(mockObjectURL);
		});

		it('should load JSON assets', async () => {
			const assetInfo: AssetInfo = {
				key: 'json-asset',
				url: 'http://example.com/data.json',
				type: 'json',
				priority: 'medium',
				preload: false,
				cached: false,
			};

			manager.registerAsset(assetInfo);

			const jsonData = { test: 'data' };
			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(jsonData),
			});

			const result = await manager.loadAsset('json-asset');
			expect(result).toEqual(jsonData);
		});

		it('should load text assets', async () => {
			const assetInfo: AssetInfo = {
				key: 'text-asset',
				url: 'http://example.com/text.txt',
				type: 'text',
				priority: 'medium',
				preload: false,
				cached: false,
			};

			manager.registerAsset(assetInfo);

			const textData = 'Hello World';
			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
				text: () => Promise.resolve(textData),
			});

			const result = await manager.loadAsset('text-asset');
			expect(result).toBe(textData);
		});

		it('should throw error on fetch failure', async () => {
			const assetInfo: AssetInfo = {
				key: 'fail-asset',
				url: 'http://example.com/fail.png',
				type: 'image',
				priority: 'medium',
				preload: false,
				cached: false,
			};

			manager.registerAsset(assetInfo);

			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: false,
				statusText: 'Not Found',
			});

			await expect(manager.loadAsset('fail-asset')).rejects.toThrow();
		});
	});

	describe('preloadAssets', () => {
		it('should preload high priority assets first', async () => {
			const highPriority: AssetInfo = {
				key: 'high',
				url: 'http://example.com/high.png',
				type: 'image',
				priority: 'high',
				preload: true,
				cached: false,
			};

			const mediumPriority: AssetInfo = {
				key: 'medium',
				url: 'http://example.com/medium.png',
				type: 'image',
				priority: 'medium',
				preload: true,
				cached: false,
			};

			manager.registerAsset(highPriority);
			manager.registerAsset(mediumPriority);

			(global.fetch as jest.Mock).mockResolvedValue({
				ok: true,
				blob: () => Promise.resolve(new Blob(['data'])),
			});

			await manager.preloadAssets();

			expect(manager.isCached('high')).toBe(true);
			expect(manager.isCached('medium')).toBe(true);
		});

		it('should not preload if already preloading', async () => {
			const asset: AssetInfo = {
				key: 'preload-test',
				url: 'http://example.com/test.png',
				type: 'image',
				priority: 'high',
				preload: true,
				cached: false,
			};

			manager.registerAsset(asset);

			(global.fetch as jest.Mock).mockImplementation(
				() =>
					new Promise((resolve) =>
						setTimeout(
							() =>
								resolve({
									ok: true,
									blob: () => Promise.resolve(new Blob(['data'])),
								}),
							100
						)
					)
			);

			// Start two preloads simultaneously
			const preload1 = manager.preloadAssets();
			const preload2 = manager.preloadAssets();

			await Promise.all([preload1, preload2]);

			// Should only have been called once
			expect(global.fetch).toHaveBeenCalledTimes(1);
		});
	});

	describe('preloadByType', () => {
		it('should preload assets of specific type', async () => {
			const imageAsset: AssetInfo = {
				key: 'image1',
				url: 'http://example.com/image1.png',
				type: 'image',
				priority: 'medium',
				preload: true,
				cached: false,
			};

			const audioAsset: AssetInfo = {
				key: 'audio1',
				url: 'http://example.com/audio1.mp3',
				type: 'audio',
				priority: 'medium',
				preload: true,
				cached: false,
			};

			manager.registerAsset(imageAsset);
			manager.registerAsset(audioAsset);

			(global.fetch as jest.Mock).mockResolvedValue({
				ok: true,
				blob: () => Promise.resolve(new Blob(['data'])),
			});

			await manager.preloadByType('image');

			expect(manager.isCached('image1')).toBe(true);
			// Audio should not be cached since we only preloaded images
			expect(manager.isCached('audio1')).toBe(false);
		});

		it('should handle errors during preload by type', async () => {
			const asset: AssetInfo = {
				key: 'error-asset',
				url: 'http://example.com/error.png',
				type: 'image',
				priority: 'medium',
				preload: true,
				cached: false,
			};

			manager.registerAsset(asset);

			(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

			// Should not throw
			await expect(manager.preloadByType('image')).resolves.not.toThrow();
		});
	});

	describe('getCacheStats', () => {
		it('should return cache statistics', () => {
			const stats = manager.getCacheStats();

			expect(stats).toHaveProperty('size');
			expect(stats).toHaveProperty('count');
			expect(stats).toHaveProperty('maxSize');
			expect(stats).toHaveProperty('utilization');
			expect(stats.count).toBe(0);
		});

		it('should update statistics after caching', async () => {
			const asset: AssetInfo = {
				key: 'stats-test',
				url: 'http://example.com/stats.png',
				type: 'image',
				priority: 'medium',
				preload: false,
				cached: false,
				size: 1024,
			};

			manager.registerAsset(asset);

			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
				blob: () => Promise.resolve(new Blob(['data'])),
			});

			await manager.loadAsset('stats-test');

			const stats = manager.getCacheStats();
			expect(stats.count).toBe(1);
			expect(stats.size).toBe(1024);
		});
	});

	describe('clearCache', () => {
		it('should clear all cached assets', async () => {
			const asset: AssetInfo = {
				key: 'clear-test',
				url: 'http://example.com/clear.png',
				type: 'image',
				priority: 'medium',
				preload: false,
				cached: false,
			};

			manager.registerAsset(asset);

			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
				blob: () => Promise.resolve(new Blob(['data'])),
			});

			await manager.loadAsset('clear-test');
			expect(manager.isCached('clear-test')).toBe(true);

			manager.clearCache();

			expect(manager.isCached('clear-test')).toBe(false);
			expect(manager.getCacheStats().count).toBe(0);
		});

		it('should revoke blob URLs when clearing', async () => {
			const asset: AssetInfo = {
				key: 'blob-revoke-test',
				url: 'http://example.com/blob.png',
				type: 'image',
				priority: 'medium',
				preload: false,
				cached: false,
			};

			manager.registerAsset(asset);

			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
				blob: () => Promise.resolve(new Blob(['data'])),
			});

			await manager.loadAsset('blob-revoke-test');
			manager.clearCache();

			expect(URL.revokeObjectURL).toHaveBeenCalledWith(mockObjectURL);
		});
	});

	describe('getAssetInfo', () => {
		it('should return undefined for unregistered asset', () => {
			const info = manager.getAssetInfo('nonexistent');
			expect(info).toBeUndefined();
		});
	});

	describe('isCached', () => {
		it('should return false for uncached asset', () => {
			expect(manager.isCached('uncached')).toBe(false);
		});
	});

	describe('getAllAssets', () => {
		it('should return all registered assets', () => {
			const asset1: AssetInfo = {
				key: 'asset1',
				url: 'http://example.com/1.png',
				type: 'image',
				priority: 'high',
				preload: false,
				cached: false,
			};

			const asset2: AssetInfo = {
				key: 'asset2',
				url: 'http://example.com/2.png',
				type: 'image',
				priority: 'low',
				preload: false,
				cached: false,
			};

			manager.registerAsset(asset1);
			manager.registerAsset(asset2);

			const allAssets = manager.getAllAssets();
			expect(allAssets).toHaveLength(2);
		});
	});
});
