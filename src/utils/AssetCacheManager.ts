/**
 * @fileoverview Asset caching and preloading for Electron app
 *
 * This utility manages game asset caching:
 * - Priority-based preloading (high/medium/low)
 * - Blob URL creation for images/audio
 * - JSON parsing for data assets
 * - LRU cache eviction
 * - Asset access tracking
 *
 * Optimizes load times and memory usage.
 *
 * @see PreloadScene - Uses cache for asset loading
 * @see GameAssets - Asset configuration
 *
 * @module utils/AssetCacheManager
 */

import { AssetCacheValues } from '../consts/Numbers';
import { ErrorMessages, UrlPrefixes } from '../consts/Messages';

/**
 * Type for cached asset data.
 * - string: Blob URLs for images/audio/video, or text content
 * - Record<string, unknown>: Parsed JSON data
 * - Blob: Raw binary data for unknown types
 */
export type CachedAsset = string | Record<string, unknown> | Blob;

export interface AssetInfo {
	key: string;
	url: string;
	type: 'image' | 'audio' | 'video' | 'json' | 'text';
	size?: number;
	priority: 'high' | 'medium' | 'low';
	preload: boolean;
	cached: boolean;
	lastAccessed?: Date;
}

export class AssetCacheManager {
	private static instance: AssetCacheManager;
	private cache: Map<string, CachedAsset> = new Map();
	private assetInfo: Map<string, AssetInfo> = new Map();
	private maxCacheSize =
		AssetCacheValues.MAX_CACHE_SIZE_MB * AssetCacheValues.BYTES_PER_KB * AssetCacheValues.BYTES_PER_KB; // 100MB
	private currentCacheSize = 0;
	private preloadQueue: string[] = [];
	private isPreloading = false;

	private constructor() {
		this.setupCacheCleanup();
	}

	public static getInstance(): AssetCacheManager {
		if (!AssetCacheManager.instance) {
			AssetCacheManager.instance = new AssetCacheManager();
		}
		return AssetCacheManager.instance;
	}

	/**
	 * Register an asset for caching
	 */
	public registerAsset(info: AssetInfo): void {
		this.assetInfo.set(info.key, info);

		if (info.preload && info.priority === 'high') {
			this.preloadQueue.unshift(info.key);
		} else if (info.preload) {
			this.preloadQueue.push(info.key);
		}
	}

	/**
	 * Preload high-priority assets
	 */
	public async preloadAssets(): Promise<void> {
		if (this.isPreloading) return;

		this.isPreloading = true;
		console.log('Starting asset preload...');

		try {
			// Preload high priority assets first
			const highPriorityAssets = this.preloadQueue.filter((key) => {
				const info = this.assetInfo.get(key);
				return info?.priority === 'high';
			});

			for (const key of highPriorityAssets) {
				await this.loadAsset(key);
			}

			// Preload medium priority assets
			const mediumPriorityAssets = this.preloadQueue.filter((key) => {
				const info = this.assetInfo.get(key);
				return info?.priority === 'medium';
			});

			for (const key of mediumPriorityAssets) {
				await this.loadAsset(key);
			}

			console.log('Asset preload completed');
		} catch (error) {
			console.error('Asset preload failed:', error);
		} finally {
			this.isPreloading = false;
		}
	}

	/**
	 * Load an asset with caching
	 */
	public async loadAsset(key: string): Promise<CachedAsset> {
		// Check if already cached
		if (this.cache.has(key)) {
			const info = this.assetInfo.get(key);
			if (info) {
				info.lastAccessed = new Date();
			}
			return this.cache.get(key);
		}

		const info = this.assetInfo.get(key);
		if (!info) {
			throw new Error(ErrorMessages.ASSET_NOT_REGISTERED(key));
		}

		try {
			const asset = await this.fetchAsset(info);
			this.cacheAsset(key, asset, info);
			return asset;
		} catch (error) {
			console.error(`Failed to load asset ${key}:`, error);
			throw error;
		}
	}

	/**
	 * Fetch asset from URL
	 */
	private async fetchAsset(info: AssetInfo): Promise<CachedAsset> {
		const response = await fetch(info.url);
		if (!response.ok) {
			throw new Error(ErrorMessages.ASSET_FETCH_FAILED(response.statusText));
		}

		switch (info.type) {
			case 'image': {
				const blob = await response.blob();
				return URL.createObjectURL(blob);
			}

			case 'audio':
			case 'video': {
				const mediaBlob = await response.blob();
				return URL.createObjectURL(mediaBlob);
			}

			case 'json':
				return (await response.json()) as Record<string, unknown>;

			case 'text':
				return await response.text();

			default:
				return await response.blob();
		}
	}

	/**
	 * Cache an asset
	 */
	private cacheAsset(key: string, asset: CachedAsset, info: AssetInfo): void {
		// Check cache size limit
		if (info.size && this.currentCacheSize + info.size > this.maxCacheSize) {
			this.cleanupCache();
		}

		this.cache.set(key, asset);
		info.cached = true;
		info.lastAccessed = new Date();

		if (info.size) {
			this.currentCacheSize += info.size;
		}
	}

	/**
	 * Clean up cache based on LRU and size
	 */
	private cleanupCache(): void {
		const entries = Array.from(this.assetInfo.entries())
			.filter(([_, info]) => info.cached)
			.sort((a, b) => {
				const aTime = a[1].lastAccessed?.getTime() || 0;
				const bTime = b[1].lastAccessed?.getTime() || 0;
				return aTime - bTime; // Oldest first
			});

		// Remove oldest entries until we're under the limit
		for (const [key, info] of entries) {
			if (this.currentCacheSize <= this.maxCacheSize * AssetCacheValues.CACHE_CLEANUP_THRESHOLD) break;

			this.cache.delete(key);
			info.cached = false;

			if (info.size) {
				this.currentCacheSize -= info.size;
			}
		}
	}

	/**
	 * Setup periodic cache cleanup
	 */
	private setupCacheCleanup(): void {
		// Clean up cache every 5 minutes
		setInterval(
			() => {
				this.cleanupCache();
			},
			5 * 60 * 1000
		);
	}

	/**
	 * Get cache statistics
	 */
	public getCacheStats(): {
		size: number;
		count: number;
		maxSize: number;
		utilization: number;
	} {
		return {
			size: this.currentCacheSize,
			count: this.cache.size,
			maxSize: this.maxCacheSize,
			utilization: (this.currentCacheSize / this.maxCacheSize) * 100,
		};
	}

	/**
	 * Clear all cached assets
	 */
	public clearCache(): void {
		// Revoke object URLs to free memory
		for (const asset of this.cache.values()) {
			if (typeof asset === 'string' && asset.startsWith(UrlPrefixes.BLOB)) {
				URL.revokeObjectURL(asset);
			}
		}

		this.cache.clear();
		this.currentCacheSize = 0;

		// Reset cached status
		for (const info of this.assetInfo.values()) {
			info.cached = false;
		}
	}

	/**
	 * Preload specific assets by type
	 */
	public async preloadByType(type: AssetInfo['type']): Promise<void> {
		const assetsToLoad = Array.from(this.assetInfo.entries())
			.filter(([_, info]) => info.type === type && info.preload)
			.map(([key, _]) => key);

		for (const key of assetsToLoad) {
			try {
				await this.loadAsset(key);
			} catch (error) {
				console.error(`Failed to preload ${type} asset ${key}:`, error);
			}
		}
	}

	/**
	 * Get asset info
	 */
	public getAssetInfo(key: string): AssetInfo | undefined {
		return this.assetInfo.get(key);
	}

	/**
	 * Check if asset is cached
	 */
	public isCached(key: string): boolean {
		return this.cache.has(key);
	}

	/**
	 * Get all registered assets
	 */
	public getAllAssets(): AssetInfo[] {
		return Array.from(this.assetInfo.values());
	}
}

// Export singleton instance
export const assetCacheManager = AssetCacheManager.getInstance();
