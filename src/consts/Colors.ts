/**
 * Color constants used throughout the game
 * All colors should be defined here to maintain consistency
 */

// =============================================================================
// HEX STRING COLORS (CSS format - for Phaser text styles, HTML elements)
// =============================================================================

export const HexColors = {
	// Grayscale
	BLACK: '#000000',
	WHITE: '#ffffff',
	GRAY_DARK: '#333333',
	GRAY_MEDIUM: '#555555',
	GRAY: '#666666',
	GRAY_LIGHT: '#888888',

	// Reds
	RED: '#ff0000',
	RED_LIGHT: '#ff4444',
	RED_SOFT: '#ff6666',

	// Greens
	GREEN: '#00ff00',
	GREEN_LIGHT: '#44ff44',
	GREEN_DARK: '#006600',
	GREEN_CYAN: '#00ffaa',

	// Blues
	BLUE: '#0000ff',

	// Yellows / Oranges
	YELLOW: '#ffff00',
	YELLOW_LIGHT: '#ffee88',
	ORANGE: '#ff8800',
	ORANGE_LIGHT: '#ffaa00',
	GOLD: '#996600',
	AMBER: '#aa8800',

	// Purples
	PURPLE_LIGHT: '#b090ff',
	PURPLE_DARK: '#8a6a9a',
} as const;

// =============================================================================
// NUMERIC COLORS (0x format - for Phaser graphics, tints, fills)
// =============================================================================

export const NumericColors = {
	// Grayscale
	BLACK: 0x000000,
	WHITE: 0xffffff,
	GRAY_VERY_DARK: 0x222222,
	GRAY_DARK: 0x444444,
	GRAY_LIGHT: 0x888888,

	// Reds
	RED: 0xff0000,
	RED_MAGENTA: 0xff00ff,

	// Greens
	GREEN: 0x00ff00,
	GREEN_FOREST: 0x228b22,
	GREEN_EXIT: 0x00ff88,

	// Blues
	BLUE: 0x0000ff,
	BLUE_LIGHT: 0x66aaff,
	BLUE_SKY: 0xaaccff,
	BLUE_DARK: 0x0a2948,

	// Yellows / Oranges
	YELLOW: 0xffff00,
	ORANGE_TORCH: 0xff8844,
	ORANGE_LIGHT: 0xffaa66,

	// Browns
	BROWN_SADDLE: 0x8b4513,

	// Purples (Fog of War / Dungeon theme)
	PURPLE_DARK: 0x4a0080,
	PURPLE_FOG_DARK: 0x4a2a5a,
	PURPLE_FOG_MEDIUM: 0x4a3a5a,
	PURPLE_FOG_LIGHT: 0x6a3a7a,
	PURPLE_BRIGHT: 0x8000ff,
	PURPLE_EXPLORED: 0x8a4a9a,
	PURPLE_MUTED: 0x8a7a9a,
	PURPLE_SOFT: 0x8a6a9a,
} as const;

// =============================================================================
// SEMANTIC COLOR ALIASES (for specific use cases)
// =============================================================================

export const UIColors = {
	// Text colors
	TEXT_PRIMARY: HexColors.WHITE,
	TEXT_SECONDARY: HexColors.GRAY_LIGHT,
	TEXT_SUCCESS: HexColors.GREEN,
	TEXT_ERROR: HexColors.RED_LIGHT,
	TEXT_WARNING: HexColors.YELLOW,
	TEXT_INFO: HexColors.BLUE,

	// Health bar
	HEALTH_FULL: HexColors.GREEN,
	HEALTH_MEDIUM: HexColors.YELLOW,
	HEALTH_LOW: HexColors.RED,

	// Combat
	DAMAGE_PHYSICAL: HexColors.WHITE,
	DAMAGE_FIRE: HexColors.ORANGE,
	DAMAGE_ICE: HexColors.BLUE,
	DAMAGE_POISON: HexColors.GREEN,
	DAMAGE_CRITICAL: HexColors.YELLOW,

	// Message log
	LOG_BACKGROUND: NumericColors.BLACK,
	LOG_BORDER: NumericColors.GRAY_DARK,
	LOG_HEAL: HexColors.GREEN,
	LOG_DAMAGE: HexColors.RED_LIGHT,
	LOG_LEVEL_UP: HexColors.GREEN_LIGHT,
	LOG_GOLD: HexColors.YELLOW,
} as const;

export const EffectColors = {
	// Particle effects
	SPARK_BRIGHT: NumericColors.YELLOW,
	SPARK_DIM: NumericColors.ORANGE_TORCH,
	BLOOD: NumericColors.RED,
	HEAL: NumericColors.GREEN,
	SHIELD: NumericColors.BLUE_LIGHT,

	// Lighting
	TORCH_LIGHT: NumericColors.ORANGE_TORCH,
	TORCH_WARM: NumericColors.ORANGE_LIGHT,

	// Fog of war
	FOG_UNEXPLORED: NumericColors.BLACK,
	FOG_EXPLORED: NumericColors.PURPLE_EXPLORED,
	FOG_VISIBLE: NumericColors.WHITE,
} as const;

export const GameOverColors = {
	TITLE: HexColors.RED,
	BACKGROUND: HexColors.BLACK,
	BUTTON_TEXT: HexColors.WHITE,
	BUTTON_BG: HexColors.GRAY_DARK,
	BUTTON_HOVER: HexColors.GRAY_MEDIUM,
	STATS_TEXT: HexColors.RED_SOFT,
} as const;

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type HexColor = (typeof HexColors)[keyof typeof HexColors];
export type NumericColor = (typeof NumericColors)[keyof typeof NumericColors];
