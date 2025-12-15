/**
 * @fileoverview Global type declarations for Neverquest
 *
 * This file contains ambient module declarations for non-TypeScript imports
 * like images, audio files, and third-party libraries without type definitions.
 *
 * @module global
 */

// =============================================================================
// ASSET MODULE DECLARATIONS
// =============================================================================

/** Image file imports */
declare module '*.png' {
	const content: string;
	export default content;
}

declare module '*.jpg' {
	const content: string;
	export default content;
}

declare module '*.jpeg' {
	const content: string;
	export default content;
}

declare module '*.gif' {
	const content: string;
	export default content;
}

declare module '*.svg' {
	const content: string;
	export default content;
}

declare module '*.webp' {
	const content: string;
	export default content;
}

/** Audio file imports */
declare module '*.mp3' {
	const content: string;
	export default content;
}

declare module '*.wav' {
	const content: string;
	export default content;
}

declare module '*.ogg' {
	const content: string;
	export default content;
}

/** Video file imports */
declare module '*.mp4' {
	const content: string;
	export default content;
}

declare module '*.webm' {
	const content: string;
	export default content;
}

/** Data file imports */
declare module '*.json' {
	const content: Record<string, unknown>;
	export default content;
}

// =============================================================================
// THIRD-PARTY LIBRARY DECLARATIONS
// =============================================================================

/** Phaser plugins without type definitions */
declare module 'phaser3-juice-plugin';
declare module 'phaser3-nineslice';
declare module 'phaser3-rex-plugins/plugins/outlinepipeline.js';
declare module 'phaser3-rex-plugins/plugins/outlinepipeline-plugin.js';
declare module 'phaser3-rex-plugins/plugins/youtubeplayer-plugin.js';
declare module 'phaser3-rex-plugins/templates/ui/ui-plugin.js';

/** Utility libraries */
declare module 'uniqid';

// =============================================================================
// GLOBAL INTERFACE EXTENSIONS
// =============================================================================

/** Extend the Window interface with game instance */
interface Window {
	game: Phaser.Game;
}
