/**
 * @fileoverview Debug helper for game state inspection
 *
 * This utility provides comprehensive debug capabilities:
 * - Full game state dump (player, enemies, scenes)
 * - Console and file export options
 * - Clipboard copy functionality
 * - Memory usage tracking
 * - Performance metrics
 *
 * Hotkeys:
 * - F9: Dump state to console and download file
 *
 * Console API:
 * - window.neverquestDebug.dump()
 * - window.neverquestDebug.copyToClipboard()
 *
 * @see Logger - Logging integration
 * @see CrashReporter - Error state capture
 *
 * @module utils/DebugHelper
 */

import { logger, GameLogCategory, LogData } from './Logger';
import { DebugMessages, ErrorMessages } from '../consts/Messages';

/**
 * Chrome Performance Memory API extension (non-standard)
 */
interface PerformanceMemory {
	usedJSHeapSize: number;
	totalJSHeapSize: number;
	jsHeapSizeLimit: number;
}

/**
 * Extended Performance interface for memory API (Chrome only)
 */
interface PerformanceWithMemory extends Performance {
	memory?: PerformanceMemory;
}

/**
 * Safe Phaser config extract for serialization
 */
interface SafePhaserConfig {
	width?: number | string;
	height?: number | string;
	type?: number;
	parent?: string;
	physics?: {
		default?: string;
		arcade?: {
			gravity?: { x: number; y: number };
			debug?: boolean;
		};
	};
	scale?: {
		mode?: number;
		autoCenter?: number;
	};
}

/**
 * Player attributes for debug display
 */
interface PlayerAttributes {
	health?: number;
	maxHealth?: number;
	level?: number;
	[key: string]: unknown;
}

/**
 * Inventory item for debug display
 */
interface InventoryItem {
	id?: string;
	name?: string;
	quantity?: number;
	[key: string]: unknown;
}

/**
 * Dialog info for debug display
 */
interface DialogInfo {
	id?: string;
	text?: string;
	isOpen?: boolean;
	[key: string]: unknown;
}

/**
 * Weather/time of day info
 */
type EnvironmentState = string | null;

/**
 * Log entry type from Logger
 */
interface LogEntry {
	timestamp: string;
	level: number;
	category: string;
	message: string;
	data?: LogData;
}

/**
 * Minimap debug info structure
 */
interface MinimapDebugInfo {
	minimapDimensions: {
		width: number;
		height: number;
		mapScale: number;
	};
	player: {
		worldPosition: { x: number; y: number };
		bounds: PlayerBounds | string | null;
		tilePosition: {
			fromPhaser: { x: number; y: number };
			manual: { x: number; y: number };
			match: boolean;
		};
	};
	map: {
		dimensions: { width: number; height: number };
		tileSize: { width: number; height: number };
		worldSize: { width: number; height: number };
	};
	layer: LayerInfo | null;
	calculations: MinimapCalculations;
}

/**
 * Player bounds for minimap
 */
interface PlayerBounds {
	x: number;
	y: number;
	width: number;
	height: number;
	centerX: number;
	centerY: number;
	top: number;
	bottom: number;
	left: number;
	right: number;
}

/**
 * Layer info for minimap
 */
interface LayerInfo {
	x: number;
	y: number;
	scrollFactorX: number;
	scrollFactorY: number;
	originX: number;
	originY: number;
	scaleX: number;
	scaleY: number;
}

/**
 * Minimap calculation details
 */
interface MinimapCalculations {
	viewRadiusInTiles: number;
	desiredTileRange: { startX: number; startY: number; endX: number; endY: number };
	clampedTileRange: { startX: number; startY: number; endX: number; endY: number };
	relativePlayer: { x: number; y: number; note: string };
	actualTileRangeSize: { x: number; y: number; note: string };
	markerPosition: { raw: { x: number; y: number }; clamped: { x: number; y: number }; note: string };
}

/**
 * Debug commands available on window
 */
interface NeverquestDebugCommands {
	dump: () => GameStateDump;
	quickDump: () => void;
	download: () => void;
	copy: () => Promise<void>;
	scenes: () => string[];
	player: () => PlayerInfo | null;
	enemies: () => EnemyInfo[];
	minimap: () => MinimapDebugInfo | null;
	teleport: (x: number, y: number) => void;
	setHealth: (health: number) => void;
	giveItem: (itemId: string, quantity?: number) => void;
	help: () => void;
}

/**
 * Extended Window interface for debug commands
 */
declare global {
	interface Window {
		neverquestDebug?: NeverquestDebugCommands;
	}
}

/**
 * Scene with player property (common pattern in Neverquest)
 */
interface SceneWithPlayer extends Phaser.Scene {
	player?: {
		container?: { x: number; y: number; getBounds?: () => Phaser.Geom.Rectangle };
		x?: number;
		y?: number;
		attributes?: PlayerAttributes;
		items?: unknown[];
		speed?: number;
		isSwimming?: boolean;
		isRunning?: boolean;
		canMove?: boolean;
		canAtack?: boolean;
		setPosition?: (x: number, y: number) => void;
	};
	enemies?: Array<{
		id?: string;
		x: number;
		y: number;
		attributes?: { health?: number };
		entityName?: string;
		active?: boolean;
	}>;
	map?: Phaser.Tilemaps.Tilemap;
	mapCreator?: { map?: Phaser.Tilemaps.Tilemap };
}

/**
 * HUD Scene with minimap
 */
interface HUDSceneWithMinimap extends Phaser.Scene {
	minimap?: {
		width: number;
		height: number;
		mapScale: number;
	};
	player?: {
		container: { x: number; y: number; getBounds?: () => Phaser.Geom.Rectangle };
	};
	map?: Phaser.Tilemaps.Tilemap;
}

interface GameStateDump {
	metadata: {
		timestamp: string;
		version: string;
		userAgent: string;
		viewport: { width: number; height: number };
		performance: PerformanceMetrics;
		activeScene: string | null;
	};
	phaser: {
		version: string;
		config: SafePhaserConfig;
		stats: {
			fps: number;
			delta: number;
		};
	};
	scenes: SceneInfo[];
	player: PlayerInfo | null;
	enemies: EnemyInfo[];
	inventory: InventoryInfo;
	activeDialogs: DialogInfo[];
	environment: EnvironmentInfo;
	map: MapInfo | null;
	errors: ErrorInfo[];
	logs: LogEntry[];
}

interface PerformanceMetrics {
	memory?: {
		usedJSHeapSize: string;
		totalJSHeapSize: string;
		limit: string;
	};
	fps: number;
	frameTime: number;
}

interface SceneInfo {
	key: string;
	isActive: boolean;
	isVisible: boolean;
	isSleeping: boolean;
	gameObjectCount: number;
	pluginCount: number;
	plugins: string[];
	children: number;
}

interface PlayerInfo {
	position: { x: number; y: number };
	attributes: PlayerAttributes;
	inventory: number;
	speed: number;
	isSwimming: boolean;
	isRunning: boolean;
	canMove: boolean;
	canAtack: boolean;
	health: number;
	maxHealth: number;
	level: number;
}

interface EnemyInfo {
	id: string;
	position: { x: number; y: number };
	health: number;
	entityName: string;
	isActive: boolean;
}

interface InventoryInfo {
	itemCount: number;
	items: InventoryItem[];
}

interface EnvironmentInfo {
	currentMap: string | null;
	weather: EnvironmentState;
	timeOfDay: EnvironmentState;
}

interface MapInfo {
	name: string | null;
	dimensions: {
		width: number;
		height: number;
		widthInPixels: number;
		heightInPixels: number;
		tileWidth: number;
		tileHeight: number;
	};
	isInfinite: boolean;
	layerCount: number;
	layers: string[];
	camera: {
		x: number;
		y: number;
		zoom: number;
		bounds: {
			x: number;
			y: number;
			width: number;
			height: number;
		} | null;
		followingPlayer: boolean;
	};
	playerPosition: {
		x: number;
		y: number;
		tileX: number;
		tileY: number;
	} | null;
}

interface ErrorInfo {
	timestamp: string;
	message: string;
	stack?: string;
	data?: unknown[];
}

class DebugHelper {
	private static instance: DebugHelper;
	private game: Phaser.Game | null = null;
	private errorLog: ErrorInfo[] = [];
	private isEnabled = process.env.NODE_ENV !== 'production';

	private constructor() {
		this.setupErrorCapture();
		this.setupKeyboardShortcuts();
		logger.info(GameLogCategory.SYSTEM, DebugMessages.DEBUG_HELPER_INITIALIZED);
	}

	static getInstance(): DebugHelper {
		if (!DebugHelper.instance) {
			DebugHelper.instance = new DebugHelper();
		}
		return DebugHelper.instance;
	}

	/**
	 * Initialize the debug helper with the Phaser game instance
	 */
	initialize(game: Phaser.Game): void {
		this.game = game;
		logger.info(GameLogCategory.SYSTEM, DebugMessages.DEBUG_HELPER_CONNECTED);
	}

	/**
	 * Setup keyboard shortcuts for debugging
	 */
	private setupKeyboardShortcuts(): void {
		if (typeof window === 'undefined' || !this.isEnabled) return;

		window.addEventListener('keydown', (event) => {
			// F9 - Full debug dump
			if (event.key === 'F9') {
				event.preventDefault();
				this.dumpAndDownload();
			}

			// F10 - Quick console dump
			if (event.key === 'F10') {
				event.preventDefault();
				this.quickDump();
			}

			// F11 - Toggle performance overlay
			if (event.key === 'F11') {
				event.preventDefault();
				this.togglePerformanceOverlay();
			}
		});

		logger.info(GameLogCategory.SYSTEM, DebugMessages.DEBUG_SHORTCUTS_REGISTERED);
	}

	/**
	 * Setup global error capture
	 */
	private setupErrorCapture(): void {
		if (typeof window === 'undefined') return;

		const originalConsoleError = console.error;
		console.error = (...args: unknown[]) => {
			this.errorLog.push({
				timestamp: new Date().toISOString(),
				message: args.map((arg) => String(arg)).join(' '),
				data: args,
			});
			originalConsoleError.apply(console, args);
		};
	}

	/**
	 * Get information about all active scenes
	 */
	private getSceneInfo(): SceneInfo[] {
		if (!this.game) return [];

		const scenes: SceneInfo[] = [];
		const sceneManager = this.game.scene;

		sceneManager.scenes.forEach((scene: Phaser.Scene) => {
			const sceneRecord = scene as unknown as Record<string, unknown>;
			const plugins = Object.keys(scene).filter((key) => {
				const value = sceneRecord[key];
				return (
					value &&
					typeof value === 'object' &&
					(value as { constructor?: { name?: string } }).constructor?.name?.includes(
						DebugMessages.NEVERQUEST_PLUGIN_PATTERN
					)
				);
			});

			scenes.push({
				key: scene.scene.key,
				isActive: sceneManager.isActive(scene.scene.key),
				isVisible: sceneManager.isVisible(scene.scene.key),
				isSleeping: sceneManager.isSleeping(scene.scene.key),
				gameObjectCount: scene.children?.list?.length || 0,
				pluginCount: plugins.length,
				plugins: plugins,
				children: scene.children?.list?.length || 0,
			});
		});

		return scenes;
	}

	/**
	 * Get player information from active scenes
	 */
	private getPlayerInfo(): PlayerInfo | null {
		if (!this.game) return null;

		const activeScenes = this.game.scene.scenes.filter((s: Phaser.Scene) =>
			this.game!.scene.isActive(s.scene.key)
		) as SceneWithPlayer[];

		for (const scene of activeScenes) {
			if (scene.player) {
				const player = scene.player;
				return {
					position: { x: player.container?.x ?? player.x ?? 0, y: player.container?.y ?? player.y ?? 0 },
					attributes: player.attributes || {},
					inventory: player.items?.length || 0,
					speed: player.speed || 0,
					isSwimming: player.isSwimming || false,
					isRunning: player.isRunning || false,
					canMove: player.canMove ?? true,
					canAtack: player.canAtack ?? true,
					health: player.attributes?.health || 0,
					maxHealth: player.attributes?.maxHealth || 0,
					level: player.attributes?.level || 1,
				};
			}
		}

		return null;
	}

	/**
	 * Get map information from active gameplay scenes
	 */
	private getMapInfo(): MapInfo | null {
		if (!this.game) return null;

		const activeScenes = this.game.scene.scenes.filter((s: Phaser.Scene) =>
			this.game!.scene.isActive(s.scene.key)
		) as SceneWithPlayer[];

		for (const scene of activeScenes) {
			const map = scene.map || scene.mapCreator?.map;
			if (map) {
				const camera = scene.cameras?.main;
				const player = scene.player;

				// Type for camera internal properties
				type CameraInternal = {
					_bounds?: { x: number; y: number; width: number; height: number };
					_follow?: unknown;
				};

				return {
					name: scene.scene.key || null,
					dimensions: {
						width: map.width || 0,
						height: map.height || 0,
						widthInPixels: map.widthInPixels || 0,
						heightInPixels: map.heightInPixels || 0,
						tileWidth: map.tileWidth || 0,
						tileHeight: map.tileHeight || 0,
					},
					isInfinite: (map as unknown as { infinite?: boolean }).infinite || false,
					layerCount: map.layers?.length || 0,
					layers: map.layers?.map((layer: Phaser.Tilemaps.LayerData) => layer.name) || [],
					camera: camera
						? {
								x: camera.scrollX || 0,
								y: camera.scrollY || 0,
								zoom: camera.zoom || 1,
								bounds: (camera as unknown as CameraInternal)._bounds?.width
									? {
											x: (camera as unknown as CameraInternal)._bounds!.x || 0,
											y: (camera as unknown as CameraInternal)._bounds!.y || 0,
											width: (camera as unknown as CameraInternal)._bounds!.width || 0,
											height: (camera as unknown as CameraInternal)._bounds!.height || 0,
										}
									: null,
								followingPlayer: !!(camera as unknown as CameraInternal)._follow,
							}
						: {
								x: 0,
								y: 0,
								zoom: 1,
								bounds: null,
								followingPlayer: false,
							},
					playerPosition: player
						? {
								x: player.container?.x ?? player.x ?? 0,
								y: player.container?.y ?? player.y ?? 0,
								tileX: Math.floor((player.container?.x ?? player.x ?? 0) / (map.tileWidth || 16)),
								tileY: Math.floor((player.container?.y ?? player.y ?? 0) / (map.tileHeight || 16)),
							}
						: null,
				};
			}
		}

		return null;
	}

	/**
	 * Get enemies from active scenes
	 */
	private getEnemyInfo(): EnemyInfo[] {
		if (!this.game) return [];

		const enemies: EnemyInfo[] = [];
		const activeScenes = this.game.scene.scenes.filter((s: Phaser.Scene) =>
			this.game!.scene.isActive(s.scene.key)
		) as SceneWithPlayer[];

		for (const scene of activeScenes) {
			if (scene.enemies) {
				const sceneEnemies = scene.enemies;
				if (Array.isArray(sceneEnemies)) {
					sceneEnemies.forEach((enemy, index: number) => {
						enemies.push({
							id: enemy.id || `enemy_${index}`,
							position: { x: enemy.x, y: enemy.y },
							health: enemy.attributes?.health || 0,
							entityName: enemy.entityName || 'unknown',
							isActive: enemy.active || false,
						});
					});
				}
			}
		}

		return enemies;
	}

	/**
	 * Get performance metrics
	 */
	private getPerformanceMetrics(): PerformanceMetrics {
		const metrics: PerformanceMetrics = {
			fps: 0,
			frameTime: 0,
		};

		if (this.game) {
			metrics.fps = this.game.loop.actualFps;
			metrics.frameTime = this.game.loop.delta;
		}

		if (typeof window !== 'undefined') {
			const performanceWithMemory = window.performance as PerformanceWithMemory;
			if (performanceWithMemory.memory) {
				const memory = performanceWithMemory.memory;
				metrics.memory = {
					usedJSHeapSize: `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
					totalJSHeapSize: `${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
					limit: `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`,
				};
			}
		}

		return metrics;
	}

	/**
	 * Safely extract config info without circular references
	 */
	private getSafeConfig(): SafePhaserConfig {
		if (!this.game?.config) return {};

		const config = this.game.config;
		return {
			width: config.width,
			height: config.height,
			type: config.renderType,
			parent: typeof config.parent === 'string' ? config.parent : DebugMessages.HTML_ELEMENT_PLACEHOLDER,
			physics: config.physics
				? {
						default: config.physics.default,
						arcade: config.physics.arcade
							? {
									gravity: config.physics.arcade.gravity,
									debug: config.physics.arcade.debug,
								}
							: undefined,
					}
				: undefined,
			scale:
				config.scaleMode !== undefined
					? {
							mode: config.scaleMode,
							autoCenter: config.autoCenter,
						}
					: undefined,
		};
	}

	/**
	 * Create a comprehensive debug dump of the current game state
	 */
	dump(): GameStateDump {
		logger.info(GameLogCategory.SYSTEM, DebugMessages.CREATING_DEBUG_DUMP);

		const mapInfo = this.getMapInfo();
		const activeScenes = this.getActiveScenes();

		const dump: GameStateDump = {
			metadata: {
				timestamp: new Date().toISOString(),
				version: this.game?.config?.gameVersion || DebugMessages.UNKNOWN_VERSION,
				userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : DebugMessages.UNKNOWN_USER_AGENT,
				viewport: {
					width: typeof window !== 'undefined' ? window.innerWidth : 0,
					height: typeof window !== 'undefined' ? window.innerHeight : 0,
				},
				performance: this.getPerformanceMetrics(),
				activeScene: activeScenes.length > 0 ? activeScenes.join(', ') : null,
			},
			phaser: {
				version: Phaser.VERSION,
				config: this.getSafeConfig(),
				stats: {
					fps: this.game?.loop.actualFps || 0,
					delta: this.game?.loop.delta || 0,
				},
			},
			scenes: this.getSceneInfo(),
			player: this.getPlayerInfo(),
			enemies: this.getEnemyInfo(),
			inventory: {
				itemCount: 0,
				items: [],
			},
			activeDialogs: [],
			environment: {
				currentMap: mapInfo?.name || null,
				weather: null,
				timeOfDay: null,
			},
			map: mapInfo,
			errors: this.errorLog.slice(-50), // Last 50 errors
			logs: logger.getBuffer().slice(-100), // Last 100 log entries
		};

		return dump;
	}

	/**
	 * Quick console dump with formatted output
	 */
	quickDump(): void {
		const dump = this.dump();

		console.group('🎮 Neverquest Debug Dump');
		console.log('⏰ Timestamp:', dump.metadata.timestamp);
		console.log('🎬 Active Scene:', dump.metadata.activeScene);
		console.log('📊 Performance:', dump.metadata.performance);
		console.log(
			DebugMessages.ALL_SCENES_HEADER,
			dump.scenes.filter((s) => s.isActive).map((s) => s.key)
		);
		console.log('🗺️  Map:', dump.map);
		console.log('👤 Player:', dump.player);
		console.log('👾 Enemies:', dump.enemies.length);
		console.log('❌ Recent Errors:', dump.errors.length);
		console.groupEnd();

		logger.info(GameLogCategory.SYSTEM, DebugMessages.QUICK_DEBUG_PRINTED);
	}

	/**
	 * Dump state and download as JSON file
	 */
	dumpAndDownload(): void {
		const dump = this.dump();
		const dataStr = JSON.stringify(dump, null, 2);
		const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
		const exportFileDefaultName = `neverquest-debug-${Date.now()}.json`;

		const linkElement = document.createElement('a');
		linkElement.setAttribute('href', dataUri);
		linkElement.setAttribute('download', exportFileDefaultName);
		linkElement.click();

		console.log('✅ Debug dump downloaded:', exportFileDefaultName);
		logger.info(GameLogCategory.SYSTEM, DebugMessages.DEBUG_DUMP_DOWNLOADED(exportFileDefaultName));
	}

	/**
	 * Copy dump to clipboard
	 */
	async copyToClipboard(): Promise<void> {
		const dump = this.dump();
		const dataStr = JSON.stringify(dump, null, 2);

		try {
			await navigator.clipboard.writeText(dataStr);
			console.log('✅ Debug dump copied to clipboard');
			logger.info(GameLogCategory.SYSTEM, DebugMessages.DEBUG_DUMP_COPIED);
		} catch (err) {
			console.error('❌ Failed to copy to clipboard:', err);
			logger.error(GameLogCategory.SYSTEM, DebugMessages.DEBUG_DUMP_COPY_FAILED, err);
		}
	}

	/**
	 * Toggle performance overlay (if available)
	 */
	private togglePerformanceOverlay(): void {
		if (!this.game) return;

		// Toggle FPS display
		const statsPlugin = this.game.plugins.get('FPSPlugin') as { toggle?: () => void } | null;
		if (statsPlugin && typeof statsPlugin.toggle === 'function') {
			statsPlugin.toggle();
		} else {
			console.log('Performance overlay not available');
		}
	}

	/**
	 * Get specific scene by key
	 */
	getScene(key: string): Phaser.Scene | null {
		if (!this.game) return null;
		return this.game.scene.getScene(key);
	}

	/**
	 * Get all running scenes
	 */
	getActiveScenes(): string[] {
		if (!this.game) return [];
		return this.game.scene.scenes
			.filter((s: Phaser.Scene) => this.game!.scene.isActive(s.scene.key))
			.map((s: Phaser.Scene) => s.scene.key);
	}

	/**
	 * Teleport player to position (dev only)
	 */
	teleportPlayer(x: number, y: number): void {
		const player = this.getPlayerInfo();
		if (!player) {
			console.error('Player not found');
			return;
		}

		const activeScenes = this.game?.scene.scenes.filter((s: Phaser.Scene) =>
			this.game!.scene.isActive(s.scene.key)
		) as SceneWithPlayer[] | undefined;
		if (activeScenes) {
			for (const scene of activeScenes) {
				if (scene.player && scene.player.setPosition) {
					scene.player.setPosition(x, y);
					console.log(`✅ Player teleported to (${x}, ${y})`);
					return;
				}
			}
		}
	}

	/**
	 * Give item to player (dev only)
	 */
	giveItem(itemId: string, quantity: number = 1): void {
		console.log(`📦 Give item not yet implemented: ${itemId} x${quantity}`);
		// TODO: Implement when inventory system is available
	}

	/**
	 * Set player health
	 */
	setPlayerHealth(health: number): void {
		const activeScenes = this.game?.scene.scenes.filter((s: Phaser.Scene) =>
			this.game!.scene.isActive(s.scene.key)
		) as SceneWithPlayer[] | undefined;
		if (activeScenes) {
			for (const scene of activeScenes) {
				if (scene.player && scene.player.attributes) {
					scene.player.attributes.health = health;
					console.log(`✅ Player health set to ${health}`);
					return;
				}
			}
		}
	}

	/**
	 * Get minimap debug information
	 */
	getMinimapInfo(): MinimapDebugInfo | null {
		if (!this.game) {
			console.error('Game not initialized');
			return null;
		}

		const hudScene = this.game.scene.getScene('HUDScene') as HUDSceneWithMinimap | null;
		if (!hudScene || !hudScene.minimap) {
			console.error('HUDScene or minimap not found');
			return null;
		}

		const minimap = hudScene.minimap;
		const player = hudScene.player;
		const map = hudScene.map;

		if (!player || !map) {
			console.error('Player or map not found');
			return null;
		}

		// Get the first available layer to convert world coordinates
		const firstLayer = map.layers.find((l: Phaser.Tilemaps.LayerData) => l.tilemapLayer)?.tilemapLayer;

		// Calculate the same values as renderMap does
		const playerX = player.container.x;
		const playerY = player.container.y;

		// Get Phaser.Display.Bounds for player
		let playerBounds: PlayerBounds | string | null = null;
		try {
			if (player.container && player.container.getBounds) {
				const bounds = player.container.getBounds();
				playerBounds = {
					x: bounds.x,
					y: bounds.y,
					width: bounds.width,
					height: bounds.height,
					centerX: bounds.centerX,
					centerY: bounds.centerY,
					top: bounds.top,
					bottom: bounds.bottom,
					left: bounds.left,
					right: bounds.right,
				};
			}
		} catch {
			playerBounds = ErrorMessages.ERROR_GETTING_BOUNDS;
		}

		let playerTileX: number;
		let playerTileY: number;
		let playerTileXManual: number;
		let playerTileYManual: number;

		// Manual calculation
		playerTileXManual = Math.floor(playerX / map.tileWidth);
		playerTileYManual = Math.floor(playerY / map.tileHeight);

		if (firstLayer && typeof firstLayer.worldToTileX === 'function') {
			playerTileX = firstLayer.worldToTileX(playerX);
			playerTileY = firstLayer.worldToTileY(playerY);
		} else {
			playerTileX = playerTileXManual;
			playerTileY = playerTileYManual;
		}

		// Get layer origin/offset info
		let layerInfo: LayerInfo | null = null;
		if (firstLayer) {
			layerInfo = {
				x: firstLayer.x,
				y: firstLayer.y,
				scrollFactorX: firstLayer.scrollFactorX,
				scrollFactorY: firstLayer.scrollFactorY,
				originX: firstLayer.originX,
				originY: firstLayer.originY,
				scaleX: firstLayer.scaleX,
				scaleY: firstLayer.scaleY,
			};
		}

		const viewRadiusInTiles =
			Math.max(minimap.width, minimap.height) / (2 * minimap.mapScale * Math.max(map.tileWidth, map.tileHeight));

		const desiredStartX = Math.floor(playerTileX - viewRadiusInTiles);
		const desiredStartY = Math.floor(playerTileY - viewRadiusInTiles);
		const desiredEndX = Math.ceil(playerTileX + viewRadiusInTiles);
		const desiredEndY = Math.ceil(playerTileY + viewRadiusInTiles);

		const startX = Math.max(0, desiredStartX);
		const startY = Math.max(0, desiredStartY);
		const endX = Math.min(map.width, desiredEndX);
		const endY = Math.min(map.height, desiredEndY);

		// Use CLAMPED range for both tile and marker positioning (matching NeverquestMinimap)
		// This fills the minimap with only the visible tiles
		const actualTileRangeX = endX - startX;
		const actualTileRangeY = endY - startY;

		const relativePlayerX = playerTileX - startX;
		const relativePlayerY = playerTileY - startY;

		let markerX = (relativePlayerX / actualTileRangeX) * minimap.width;
		let markerY = (relativePlayerY / actualTileRangeY) * minimap.height;

		const clampedMarkerX = Math.max(5, Math.min(minimap.width - 5, markerX));
		const clampedMarkerY = Math.max(5, Math.min(minimap.height - 5, markerY));

		const info = {
			minimapDimensions: {
				width: minimap.width,
				height: minimap.height,
				mapScale: minimap.mapScale,
			},
			player: {
				worldPosition: { x: playerX, y: playerY },
				bounds: playerBounds,
				tilePosition: {
					fromPhaser: { x: playerTileX, y: playerTileY },
					manual: { x: playerTileXManual, y: playerTileYManual },
					match: playerTileX === playerTileXManual && playerTileY === playerTileYManual,
				},
			},
			map: {
				dimensions: { width: map.width, height: map.height },
				tileSize: { width: map.tileWidth, height: map.tileHeight },
				worldSize: {
					width: map.width * map.tileWidth,
					height: map.height * map.tileHeight,
				},
			},
			layer: layerInfo,
			calculations: {
				viewRadiusInTiles,
				desiredTileRange: {
					startX: desiredStartX,
					startY: desiredStartY,
					endX: desiredEndX,
					endY: desiredEndY,
				},
				clampedTileRange: {
					startX,
					startY,
					endX,
					endY,
				},
				relativePlayer: {
					x: relativePlayerX,
					y: relativePlayerY,
					note: DebugMessages.RELATIVE_TO_CLAMPED_NOTE,
				},
				actualTileRangeSize: {
					x: actualTileRangeX,
					y: actualTileRangeY,
					note: DebugMessages.SIZE_OF_CLAMPED_NOTE,
				},
				markerPosition: {
					raw: { x: markerX, y: markerY },
					clamped: { x: clampedMarkerX, y: clampedMarkerY },
					note: DebugMessages.CALCULATED_FROM_CLAMPED_NOTE,
				},
			},
		};

		console.group('🗺️  Minimap Debug Info');
		console.log('📏 Minimap Dimensions:', info.minimapDimensions);
		console.log('👤 Player Position:', info.player);
		console.log('🗺️  Map Info:', info.map);
		console.log('🎨 Layer Info:', info.layer);
		console.log('🧮 Calculations:', info.calculations);
		console.log('\n📊 Coordinate System Check:');
		console.log('   - Phaser uses: Y increases DOWNWARD (0 at top)');
		console.log('   - Moving DOWN: Y increases (negative → positive)');
		console.log('   - Moving RIGHT: X increases (negative → positive)');
		console.groupEnd();

		return info;
	}

	/**
	 * Setup global console commands
	 */
	setupConsoleCommands(): void {
		if (typeof window === 'undefined' || !this.isEnabled) return;

		window.neverquestDebug = {
			dump: () => this.dump(),
			quickDump: () => this.quickDump(),
			download: () => this.dumpAndDownload(),
			copy: () => this.copyToClipboard(),
			scenes: () => this.getActiveScenes(),
			player: () => this.getPlayerInfo(),
			enemies: () => this.getEnemyInfo(),
			minimap: () => this.getMinimapInfo(),
			teleport: (x: number, y: number) => this.teleportPlayer(x, y),
			setHealth: (health: number) => this.setPlayerHealth(health),
			giveItem: (itemId: string, quantity?: number) => this.giveItem(itemId, quantity),
			help: () => {
				console.log(`
🎮 Neverquest Debug Commands
========================

Keyboard Shortcuts:
  F9  - Full debug dump & download
  F10 - Quick console dump
  F11 - Toggle performance overlay

Console Commands:
  neverquestDebug.dump()           - Get full state dump object
  neverquestDebug.quickDump()      - Print formatted dump to console
  neverquestDebug.download()       - Download dump as JSON file
  neverquestDebug.copy()           - Copy dump to clipboard
  neverquestDebug.scenes()         - List active scenes
  neverquestDebug.player()         - Get player info
  neverquestDebug.enemies()        - Get enemy info
  neverquestDebug.minimap()        - Get minimap debug info
  neverquestDebug.teleport(x, y)   - Teleport player
  neverquestDebug.setHealth(hp)    - Set player health
  neverquestDebug.giveItem(id, qty) - Give item to player
  neverquestDebug.help()           - Show this help

Also available: window.neverquest (logger commands)
				`);
			},
		};

		console.log('🎮 Neverquest Debug Helper initialized');
		console.log('   Use neverquestDebug.help() for available commands');
		console.log('   Press F9 for full debug dump, F10 for quick dump');
	}
}

// Export singleton instance
export const debugHelper = DebugHelper.getInstance();

// Setup console commands on load
if (typeof window !== 'undefined') {
	debugHelper.setupConsoleCommands();
}
