/**
 * @fileoverview Scene type definitions for Neverquest
 *
 * Defines interfaces for the various scene types in the game.
 * These interfaces help with type safety when passing scene references
 * and accessing scene-specific properties.
 *
 * @see docs/CREATE_NEW_SCENE_GUIDE.md - How to create new scenes
 * @see docs/ARCHITECTURE.md - Scene lifecycle overview
 *
 * @module types/SceneTypes
 */

import Phaser from 'phaser';
import { Player } from '../entities/Player';
import type { NeverquestMapCreator } from '../plugins/NeverquestMapCreator';
import type { NeverquestEnemyZones } from '../plugins/NeverquestEnemyZones';
import type { NeverquestEnvironmentParticles } from '../plugins/NeverquestEnvironmentParticles';
import type { NeverquestDialogBox } from '../plugins/NeverquestDialogBox';
import type { NeverquestHealthBar } from '../plugins/NeverquestHealthBar';

/**
 * Base interface for game scenes that contain a player and map
 */
export interface IGameScene extends Phaser.Scene {
	/** The player entity */
	player?: Player;
	/** The tilemap for this scene */
	map?: Phaser.Tilemaps.Tilemap;
	/** The map creator plugin instance */
	mapCreator?: NeverquestMapCreator;
}

/**
 * Interface for the preload/loading scene
 */
export interface IPreloadScene extends Phaser.Scene {
	/** Progress bar graphics object */
	progressBar: Phaser.GameObjects.Graphics | null;
	/** Progress bar background graphics */
	progressBox: Phaser.GameObjects.Graphics | null;
	/** Camera width for centering elements */
	cameraWidth: number;
	/** Camera height for centering elements */
	cameraHeight: number;
	/** Loading text display */
	loadingText: Phaser.GameObjects.Text | null;
}

/**
 * Interface for the main overworld scene
 */
export interface IMainScene extends IGameScene {
	/** Enemy spawn zone manager */
	neverquestEnemyZones?: NeverquestEnemyZones;
	/** Environment particle effects manager */
	neverquestEnvironmentParticles?: NeverquestEnvironmentParticles;
}

/**
 * Interface for dialog overlay scenes
 */
export interface IDialogScene extends Phaser.Scene {
	/** Dialog box plugin instance */
	dialogBox?: NeverquestDialogBox;
	/** Reference to player for state management */
	player?: Player;
}

/**
 * Interface for the HUD overlay scene
 */
export interface IHUDScene extends Phaser.Scene {
	/** Reference to player for displaying stats */
	player?: Player;
	/** Health bar display component */
	healthBar?: NeverquestHealthBar;
	/** Experience bar display component */
	expBar?: Phaser.GameObjects.Graphics;
}
