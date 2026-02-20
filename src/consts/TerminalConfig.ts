/**
 * @fileoverview Terminal/debug mode configuration
 *
 * This file defines terminal-based game configuration:
 * - Player symbol and color for terminal display
 * - Enemy types with stats for terminal mode
 * - Health, attack, and visual symbols
 *
 * Used for debug/terminal rendering of the game.
 *
 * @see Logger - Terminal output system
 * @see DebugHelper - Debug visualization
 *
 * @module consts/TerminalConfig
 */

/**
 * Terminal game specific configuration constants
 */

// =============================================================================
// PLAYER CONFIGURATION
// =============================================================================

export const PlayerConfig = {
	SYMBOL: '🧙‍♂️',
	COLOR: 'white',
	NAME: 'Player',
} as const;

// =============================================================================
// ENEMY TYPE CONFIGURATIONS
// =============================================================================

export interface EnemyType {
	name: string;
	symbol: string;
	color: string;
	health: number;
	attack: number;
}

export const EnemyTypes: readonly EnemyType[] = [
	{ name: 'Rat', symbol: '🐀', color: 'yellow', health: 20, attack: 3 },
	{ name: 'Bat', symbol: '🦇', color: 'white', health: 15, attack: 5 },
	{ name: 'Ogre', symbol: '👹', color: 'red', health: 50, attack: 8 },
	{ name: 'Goblin', symbol: '👺', color: 'green', health: 25, attack: 6 },
	{ name: 'Ghost', symbol: '👻', color: 'white', health: 30, attack: 7 },
	{ name: 'Dragon', symbol: '🐉', color: 'red', health: 100, attack: 15 },
] as const;
