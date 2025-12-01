/**
 * Numeric constants used throughout the game
 * Organized by category for easy discovery
 */

// =============================================================================
// ENTITY SPEEDS
// =============================================================================

export const EntitySpeed = {
	// Base movement speeds
	BASE: 200,
	SWIM: 100,
	RUN: 300,
	SPRINT: 400,
} as const;

// =============================================================================
// ANIMATION & TIMING
// =============================================================================

export const AnimationTiming = {
	// Durations in milliseconds
	ATTACK_DURATION: 500,
	BLOCK_DURATION: 2000,
	HIT_FLASH_DURATION: 150,
	WARP_DURATION: 500,
	DAMAGE_NUMBER_DURATION: 1000,
	TEXT_DISPLAY_DURATION: 3000,

	// Tween durations
	TWEEN_FAST: 200,
	TWEEN_NORMAL: 300,
	TWEEN_SLOW: 500,
	TWEEN_VERY_SLOW: 700,

	// Intervals
	PATH_UPDATE_INTERVAL: 1000,
	PERCEPTION_CHECK_INTERVAL: 200,

	// UI Interaction
	DOUBLE_CLICK_TIMEOUT: 350,

	// Terminal game specific
	TERMINAL_GAME_TICK_RATE: 500,
	TERMINAL_WALK_ANIMATION_STEP_1: 50,
	TERMINAL_WALK_ANIMATION_STEP_2: 100,
	TERMINAL_WALK_ANIMATION_STEP_3: 150,
} as const;

// =============================================================================
// OPACITY / ALPHA VALUES
// =============================================================================

export const Alpha = {
	// Standard opacities
	TRANSPARENT: 0,
	CAMERA_SHAKE: 0.003,
	CAMERA_SHAKE_CRITICAL: 0.01,
	VERY_LOW: 0.05,
	LOW: 0.1,
	FOG_START: 0.15,
	LIGHT: 0.3,
	MEDIUM_LIGHT: 0.35,
	MEDIUM: 0.4,
	HALF: 0.5,
	MEDIUM_HIGH: 0.6,
	SLIGHTLY_TRANSPARENT: 0.66,
	HIGH: 0.7,
	VERY_HIGH: 0.8,
	TILEMAP_DARK: 0.85,
	ALMOST_OPAQUE: 0.9,
	NEARLY_FULL: 0.95,
	OPAQUE: 1,
} as const;

// =============================================================================
// SCALE VALUES
// =============================================================================

export const Scale = {
	// Common scale multipliers
	ITEM_PICKUP: 0.2,
	TINY: 0.5,
	SMALL: 0.8,
	NORMAL: 1,
	SLIGHTLY_LARGE_PULSE: 1.1,
	SLIGHTLY_LARGE: 1.2,
	MEDIUM_LARGE: 1.3,
	LARGE: 1.5,
	VERY_LARGE: 2,
	EXTRA_LARGE: 2.33,
	HUGE: 2.5,
	HUD_ATTRIBUTES_BOOK_POSITION_MULTIPLIER: 4.1,
} as const;

// =============================================================================
// DIMENSIONS & SIZES
// =============================================================================

export const Dimensions = {
	// UI Panel dimensions
	PANEL_WIDTH: 512,
	PANEL_HEIGHT: 512,

	// Minimap
	MINIMAP_SIZE: 150,
	MINIMAP_OFFSET: 10,

	// Lighting
	LIGHT_RADIUS_SMALL: 120,
	LIGHT_RADIUS_MEDIUM: 140,
	LIGHT_RADIUS_LARGE: 180,

	// Buttons
	BUTTON_WIDTH: 200,
	BUTTON_HEIGHT: 50,
	BUTTON_SPACING: 60,
	BUTTON_SPACING_LARGE: 140,

	// Attribute Scene
	ATTRIBUTE_PLUS_BUTTON_OFFSET: 150,

	// Main Menu Scene
	MAIN_MENU_TEXT_WIDTH: 452,
	MAIN_MENU_CREDITS_SPACING: 120,

	// InfoBox dimensions
	INFOBOX_WIDTH: 200,
	INFOBOX_HEIGHT: 200,

	// HUD Scene
	HUD_INVENTORY_ICON_OFFSET_X: 150,

	// Panel UI multipliers
	PANEL_CLOSE_BUTTON_PADDING_MULTIPLIER: 1.5,

	// Health bar
	HEALTH_BAR_WIDTH_MULTIPLIER: 0.43,
} as const;

// =============================================================================
// DEPTH / Z-INDEX VALUES
// =============================================================================

export const Depth = {
	// Layer ordering (higher = on top)
	BACKGROUND: 0,
	GROUND: 1,
	ENTITIES: 10,
	PLAYER: 100,
	EFFECTS: 500,
	UPSIDE_DOWN_PORTAL_ENERGY: 498,
	UPSIDE_DOWN_PORTAL_CORE: 499,
	PORTAL: 799,
	PORTAL_SPRITE: 800,
	PORTAL_TEXT: 801,
	UPSIDE_DOWN_PORTAL_TEXT: 501,
	PARTICLES_LOW: 897,
	PARTICLES_MID: 898,
	PARTICLES_HIGH: 899,
	DARK_OVERLAY: 900,
	VIGNETTE: 950,
	UI: 1000,
	UI_OVERLAY: 1001,
	DIALOG: 2000,
	DAMAGE_TEXT: 3000,
	DEBUG: 9999,
	TOP: 999999,
	CLOUDS: 9999999999999,
} as const;

// =============================================================================
// ANGLES (in degrees)
// =============================================================================

export const Angles = {
	// Cardinal directions
	UP: -90,
	DOWN: 90,
	LEFT: 180,
	RIGHT: 0,

	// Diagonal
	UP_LEFT: -135,
	UP_RIGHT: -45,
	DOWN_LEFT: 135,
	DOWN_RIGHT: 45,

	// Common angles
	QUARTER: 90,
	HALF: 180,
	THREE_QUARTER: 270,
	FULL: 360,

	// Animation angle thresholds
	ANGLE_THRESHOLD_LOW: 0.66,
	ANGLE_THRESHOLD_HIGH: 2.33,

	// Mathematical constants (in radians)
	PI: 3.14,
} as const;

// =============================================================================
// COMBAT & GAME MECHANICS
// =============================================================================

export const CombatNumbers = {
	// Perception
	PERCEPTION_RANGE: 75,
	WAYPOINT_REACHED_DISTANCE: 10,

	// Combat timing
	ATTACK_COOLDOWN: 500,
	BLOCK_DEFENSE_BONUS: 5,

	// Hitbox settings
	HITBOX_OFFSET_DIVIDER_Y: 1.5,
	HITBOX_OFFSET_BODY: 4,

	// Hitbox lifetimes (in milliseconds)
	ENEMY_HITBOX_LIFETIME: 200,
	ATTACK_TIMEOUT_FALLBACK: 2600,
	PLAYER_DEATH_DELAY: 1500,
} as const;

// =============================================================================
// PARTICLES & EFFECTS
// =============================================================================

export const ParticleValues = {
	// Lifespans
	LIFESPAN_SHORT: 300,
	LIFESPAN_MEDIUM: 500,
	LIFESPAN_LONG: 1000,
	LIFESPAN_VERY_LONG: 2000,

	// Speeds
	SPEED_SLOW: 50,
	SPEED_MEDIUM: 100,
	SPEED_FAST: 200,

	// Frequencies (particles per second)
	FREQUENCY_MODERATE: 150,

	// Quantities
	QUANTITY_FEW: 5,
	QUANTITY_NORMAL: 10,
	QUANTITY_MANY: 20,
	QUANTITY_LOTS: 50,
} as const;

// =============================================================================
// SPELL EFFECT DURATIONS
// =============================================================================

export const SpellEffectDurations = {
	// Effect durations
	FROZEN_GROUND: 3000,
	DIVINE_SHIELD: 5000,
	POISON_CLOUD: 4000,
	CURSE: 3000,

	// Cleanup delays
	LIGHTNING_BOLT_CLEANUP: 400,
	HEAL_CLEANUP: 1300,
	SHIELD_CLEANUP: 1600,
	RESURRECTION_CLEANUP: 1600,
	POISON_CLEANUP: 3500,
	FROST_CLEANUP: 3500,
	CURSE_CLEANUP: 1300,
} as const;

// =============================================================================
// COMBAT EFFECT DURATIONS
// =============================================================================

export const CombatEffectDurations = {
	// Particle cleanup delays
	BLOOD_SPLATTER_CLEANUP: 900,
	DEATH_EXPLOSION_CLEANUP: 1100,
} as const;

// =============================================================================
// CAMERA
// =============================================================================

export const CameraValues = {
	// Zoom levels
	ZOOM_FAR: 1,
	ZOOM_NORMAL: 2,
	ZOOM_CLOSE: 2.5,
	ZOOM_VERY_CLOSE: 3,
	ZOOM_PORTAL_EXIT: 3.5,
	ZOOM_DISTORTION: 2.4,

	// Fade durations
	FADE_FAST: 200,
	FADE_NORMAL: 300,
	FADE_SLOW: 500,

	// Flash effects
	FLASH_DURATION: 500,
	FLASH_RED: 200,
	FLASH_GREEN: 200,

	// Shake effects
	SHAKE_CRITICAL_DURATION: 200,
} as const;

// =============================================================================
// AUDIO VALUES
// =============================================================================

export const AudioValues = {
	// Detune values (in cents)
	DETUNE_DARK: -500,
	DETUNE_CREEPY: -900,
	DETUNE_NORMAL: 0,

	// Volume levels
	VOLUME_DUNGEON: 0.4,
	VOLUME_TYPING_SOUND: 0.4,
} as const;

// =============================================================================
// FONT SIZES
// =============================================================================

export const FontSizes = {
	// Font sizes in pixels
	TINY: '10px',
	SMALL: '11px',
	PORTAL_TEXT: '12px',
	MEDIUM: '14px',
	SETTING_HEADER: '18px',
	LARGE: '20px',
	TITLE: '24px',
	HEADING: '28px',
	LARGE_HEADING: '40px',
	HUGE: '64px',
} as const;

// =============================================================================
// FONT FAMILIES
// =============================================================================

export const FontFamilies = {
	// Game fonts
	PRESS_START_2P: '"Press Start 2P"',
} as const;

// =============================================================================
// DIALOG BOX
// =============================================================================

export const DialogBox = {
	// Dialog dimensions
	HEIGHT: 150,

	// Margin multipliers
	MARGIN_MULTIPLIER_TEXT_Y: 2.5,
} as const;

// =============================================================================
// FONT STYLES
// =============================================================================

export const FontStyles = {
	// Complete font style strings
	PRELOAD_LOADING: '20px monospace',
	PRELOAD_PERCENT: '18px monospace',
} as const;

// =============================================================================
// SPRITE ORIGINS
// =============================================================================

export const SpriteOrigins = {
	// Critical hit sprite origins for different text lengths
	CRITICAL_SHORT_X: 0.55,
	CRITICAL_SHORT_Y: 0.65,
	CRITICAL_LONG_X: 0.55,
	CRITICAL_LONG_Y: 0.57,
} as const;

// =============================================================================
// COORDINATE CONSTANTS
// =============================================================================

export const SpecialNumbers = {
	// Memory / byte values
	BYTES_PER_MB: 1048576,

	// Random seeds / boundaries
	RANDOM_SEED_BOUND_LOW: 1207,
	RANDOM_SEED_BOUND_MID: 6310,
	RANDOM_SEED_BOUND_HIGH: 6590,

	// AI and movement
	ENEMY_RANDOM_MOVE_CHANCE: 0.3,

	// Line of sight
	LINE_OF_SIGHT_PARALLEL_THRESHOLD: 0.001,
} as const;

// =============================================================================
// LOGGER
// =============================================================================

export const LoggerValues = {
	// Log buffer size
	MAX_BUFFER_SIZE: 300,
} as const;

// =============================================================================
// SAVE MANAGER
// =============================================================================

export const SaveManagerValues = {
	// Testing delay in milliseconds
	INITIAL_SAVE_TEST_DELAY: 5000,
} as const;

// =============================================================================
// INTRO SCENE
// =============================================================================

export const IntroSceneValues = {
	// Scale thresholds
	LOGO_SCALE_THRESHOLD: 0.7,

	// Animation timing
	NEVERQUEST_LOGO_DELAY: 4000,
} as const;

// =============================================================================
// JOYSTICK SCENE
// =============================================================================

export const JoystickValues = {
	// Position multipliers
	STICK_POSITION_MULTIPLIER: 0.1,
	BUTTON_A_MULTIPLIER_X: 0.18,
	BUTTON_A_MULTIPLIER_Y: 0.25,

	// Stick size
	STICK_RADIUS: 120,

	// Button positions (for button B)
	BUTTON_B_OFFSET_Y: 250,
} as const;

// =============================================================================
// ASSET CACHE MANAGER
// =============================================================================

export const AssetCacheValues = {
	// Cache size constants
	BYTES_PER_KB: 1024,
	MAX_CACHE_SIZE_MB: 100,

	// Cache cleanup threshold (80% of max size)
	CACHE_CLEANUP_THRESHOLD: 0.8,
} as const;

// =============================================================================
// MAP LAYER NAMES
// =============================================================================

export const MapLayerNames = {
	// Water layer names (case variations for compatibility)
	WATER_LOWERCASE: 'water',
	WATER_CAPITALIZED: 'Water',
} as const;

// =============================================================================
// PHYSICS CONFIG
// =============================================================================

export const PhysicsConfig = {
	// Collision check settings for top-down game
	COLLISION_CHECK: { up: false, down: false, left: false, right: false },
} as const;

// =============================================================================
// SETTING SCENE
// =============================================================================

export const SettingSceneValues = {
	// Layout offsets
	DIALOG_BOTTOM_OFFSET: 120,
	SETTING_HEADER_MARGIN_TOP: 115,
} as const;

// =============================================================================
// JOYSTICK DEBUG
// =============================================================================

export const JoystickDebugLabels = {
	DIRECTION_PREFIX: 'Direction: ',
	DISTANCE_PREFIX: 'Distance: ',
	QUADRANT_PREFIX: 'Quadrant: ',
	ROTATION_PREFIX: 'Rotation: ',
} as const;

// =============================================================================
// CONSUMABLE MANAGER
// =============================================================================

export const ConsumableManagerValues = {
	// Buff duration multiplier (in milliseconds)
	BUFF_DURATION_MULTIPLIER: 300,
} as const;

// =============================================================================
// TERMINAL ENTITY
// =============================================================================

export const TerminalEntityValues = {
	// Animation timing in milliseconds
	WALK_ANIMATION_DURATION: 200,
} as const;
