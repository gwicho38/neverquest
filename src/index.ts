/**
 * @fileoverview Main game entry point and Phaser configuration
 *
 * This file initializes the Neverquest game:
 * - Phaser.Game configuration with plugins
 * - Scene registration and load order
 * - Physics, input, and scaling settings
 * - Error handling and crash reporting
 * - Debug utilities initialization
 *
 * @see PreloadScene - Asset loading
 * @see MainScene - Primary gameplay
 * @see CrashReporter - Error tracking
 *
 * @module index
 */

import Phaser from 'phaser';
import { Plugin as NineSlicePlugin } from 'phaser3-nineslice';
import OutlinePipelinePlugin from 'phaser3-rex-plugins/plugins/outlinepipeline-plugin.js';
import OutlinePostFx from 'phaser3-rex-plugins/plugins/outlinepipeline.js';
import YoutubePlayerPlugin from 'phaser3-rex-plugins/plugins/youtubeplayer-plugin.js';
import UIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import { AttributeScene } from './scenes/AttributeScene';
// import { CaveScene } from './scenes/CaveScene';
import { CrossroadsScene } from './scenes/CrossroadsScene';
import { DialogScene } from './scenes/DialogScene';
import { DungeonScene } from './scenes/DungeonScene';
import { IceCavernsScene } from './scenes/IceCavernsScene';
import { SkyIslandsScene } from './scenes/SkyIslandsScene';
import { UnderwaterTempleScene } from './scenes/UnderwaterTempleScene';
import { VolcanicDungeonsScene } from './scenes/VolcanicDungeonsScene';
// import { GameOverScene } from './scenes/GameOverScene';
import { HUDScene } from './scenes/HUDScene';
import { IntroScene } from './scenes/IntroScene';
import { InventoryScene } from './scenes/InventoryScene';
// import { JoystickScene } from './scenes/JoystickScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { MainScene } from './scenes/MainScene';
// import { MobileCheckScene } from './scenes/MobileCheckScene';
// import { OverworldScene } from './scenes/OverworldScene';
import { PreloadScene } from './scenes/PreloadScene';
import { QuestLogScene } from './scenes/QuestLogScene';
import { CharacterStatsScene } from './scenes/CharacterStatsScene';
import { JournalScene } from './scenes/JournalScene';
import { SurvivalModeScene } from './scenes/SurvivalModeScene';
// NOTE: UpsideDownScene is available but currently disabled
// import { UpsideDownScene } from './scenes/UpsideDownScene';
import { SpellWheelScene } from './scenes/SpellWheelScene';
// import { SettingScene } from './scenes/SettingScene';
// import { TownScene } from './scenes/TownScene';
// import { TutorialScene } from './scenes/TutorialScene';
// import { VideoPlayerScene } from './scenes/VideoPlayerScene';
import { crashReporter } from './utils/CrashReporter';
import { debugHelper } from './utils/DebugHelper';
import { logger } from './utils/Logger';
import { PhysicsConfig } from './consts/Numbers';
import { ErrorPageStyles, ErrorPageText } from './consts/Messages';

// Create canvas with willReadFrequently attribute
const canvas = document.getElementById('neverquest-rpg') as HTMLCanvasElement;
if (!canvas) {
	const newCanvas = document.createElement('canvas');
	newCanvas.id = 'neverquest-rpg';
	const parent = document.getElementById('neverquest-rpg-parent');
	if (parent) {
		parent.appendChild(newCanvas);
	}
}

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.WEBGL,
	parent: 'neverquest-rpg-parent',
	canvas: document.getElementById('neverquest-rpg') as HTMLCanvasElement,
	width: 800,
	height: 600,
	render: {
		antialias: false,
		pixelArt: true,
		roundPixels: false,
		transparent: false,
	},
	callbacks: {
		preBoot: function (_game: Phaser.Game) {
			// Set willReadFrequently for Phaser's internal canvas contexts
			const originalGetContext = HTMLCanvasElement.prototype.getContext;
			HTMLCanvasElement.prototype.getContext = function (
				this: HTMLCanvasElement,
				type: string,
				attributes?: CanvasRenderingContext2DSettings | WebGLContextAttributes
			): RenderingContext | null {
				if (type === '2d') {
					const attrs = (attributes || {}) as CanvasRenderingContext2DSettings;
					attrs.willReadFrequently = true;
					return originalGetContext.call(this, type, attrs);
				}
				return originalGetContext.call(this, type, attributes);
			} as typeof HTMLCanvasElement.prototype.getContext;
		},
	},
	scene: [
		// Preload should come first
		PreloadScene,
		IntroScene,
		MainScene,
		MainMenuScene,
		// UpsideDownScene,
		DungeonScene,
		IceCavernsScene, // Ice Caverns biome (level 15-20)
		VolcanicDungeonsScene, // Volcanic Dungeons biome (level 20-25)
		SkyIslandsScene, // Sky Islands biome (level 25-30)
		UnderwaterTempleScene, // Underwater Temple biome (level 25-30)
		CrossroadsScene, // New story hub scene
		SurvivalModeScene, // Wave-based survival mode
		// TownScene,
		// CaveScene,
		// OverworldScene,
		// MobileCheckScene,
		// TutorialScene,

		// UI Scenes should be loaded after the game Scenes.
		// JoystickScene,
		DialogScene,
		HUDScene,
		InventoryScene,
		AttributeScene,
		QuestLogScene, // Story progress tracking
		CharacterStatsScene, // Detailed character stats
		JournalScene, // Lore and discovery collection
		// SettingScene,
		// VideoPlayerScene,
		// GameOverScene,
		SpellWheelScene,
	],
	input: {
		gamepad: true,
		touch: true,
	},
	scale: {
		mode: Phaser.Scale.RESIZE,
		autoCenter: Phaser.Scale.CENTER_BOTH,
	},
	pipeline: [OutlinePostFx],
	plugins: {
		scene: [
			{
				key: 'rexUI',
				plugin: UIPlugin,
				mapping: 'rexUI',
			},
		],
		global: [
			NineSlicePlugin.DefaultCfg,
			{
				key: 'rexOutlinePipeline',
				plugin: OutlinePipelinePlugin,
				start: true,
			},
			{
				key: 'rexYoutubePlayer',
				plugin: YoutubePlayerPlugin,
				start: true,
			},
		],
	},
	dom: {
		createContainer: true,
	},
	pixelArt: false,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { x: 0, y: 0 }, // Top down game, so no gravity
			checkCollision: PhysicsConfig.COLLISION_CHECK,
			debug: false,
			debugShowBody: true,
			debugShowStaticBody: true,
			debugShowVelocity: true,
			debugVelocityColor: 0xffff00,
			debugBodyColor: 0x0000ff,
			debugStaticBodyColor: 0xffffff,
		},
	},
};

// Initialize game with error handling
let game: Phaser.Game;

try {
	game = new Phaser.Game(config);

	// Make game globally available for debugging
	window.game = game;

	// Initialize debug utilities
	logger.setupConsoleCommands();
	debugHelper.initialize(game);

	// Handle uncaught game errors
	game.events.on('error', (error: Error) => {
		console.error('Game error:', error);
		crashReporter.reportCrash('gameError', error, game.scene.getScenes());
	});
} catch (error) {
	console.error('Failed to initialize game:', error);

	// Show user-friendly error message
	document.body.innerHTML = `
		<div style="${ErrorPageStyles.CONTAINER}">
			<div style="${ErrorPageStyles.TEXT_CENTER}">
				<h2>${ErrorPageText.TITLE}</h2>
				<p>${ErrorPageText.MESSAGE}</p>
				<p>${ErrorPageText.INSTRUCTION}</p>
				<button onclick="window.location.reload()" style="${ErrorPageStyles.REFRESH_BUTTON}">
					${ErrorPageText.BUTTON_TEXT}
				</button>
			</div>
		</div>
	`;
}

export default game;
