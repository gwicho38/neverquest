/**
 * @fileoverview TypeScript module declarations for third-party packages
 *
 * This file provides ambient type declarations for:
 * - Phaser plugins (nineslice, juice, rex plugins)
 * - Asset file imports (images, audio, video, JSON)
 * - Window global extensions (game instance)
 *
 * @module types/index.d
 */

declare module 'phaser3-juice-plugin';
declare module 'phaser3-nineslice';
declare module 'phaser3-rex-plugins/plugins/outlinepipeline.js';
declare module 'phaser3-rex-plugins/plugins/outlinepipeline-plugin.js';
declare module 'phaser3-rex-plugins/plugins/youtubeplayer-plugin.js';
declare module 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
declare module 'uniqid';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.svg';
declare module '*.mp4';
declare module '*.mp3';
declare module '*.json';

interface Window {
	game: Phaser.Game;
}
