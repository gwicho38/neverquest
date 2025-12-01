import Phaser from 'phaser';
import { Plugin as NineSlicePlugin } from 'phaser3-nineslice';
import OutlinePipelinePlugin from 'phaser3-rex-plugins/plugins/outlinepipeline-plugin.js';
import OutlinePostFx from 'phaser3-rex-plugins/plugins/outlinepipeline.js';
import YoutubePlayerPlugin from 'phaser3-rex-plugins/plugins/youtubeplayer-plugin.js';
import UIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import { AttributeScene } from './scenes/AttributeScene';
// import { CaveScene } from './scenes/CaveScene';
import { DialogScene } from './scenes/DialogScene';
import { DungeonScene } from './scenes/DungeonScene';
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
import { UpsideDownScene } from './scenes/UpsideDownScene';
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
			HTMLCanvasElement.prototype.getContext = function (type: string, attributes?: any): any {
				if (type === '2d') {
					attributes = attributes || {};
					attributes.willReadFrequently = true;
				}
				return originalGetContext.call(this, type, attributes);
			};
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
		// SettingScene,
		// VideoPlayerScene,
		// GameOverScene,
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
	(window as any).game = game;

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
