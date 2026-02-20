/**
 * @fileoverview Numeric constants for game configuration
 *
 * This file defines all numeric values used throughout the game:
 * - EntitySpeed: Movement speeds
 * - AnimationTiming: Duration values
 * - CameraValues: Zoom and bounds
 * - CombatNumbers: Damage modifiers
 * - Dimensions: UI sizes
 * - Alpha/Scale/Depth: Visual properties
 *
 * Organized by category for easy discovery.
 * All magic numbers should be defined here.
 *
 * @module consts/Numbers
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

// =============================================================================
// SPELL WHEEL
// =============================================================================

export const SpellWheelValues = {
	// Timing
	HOLD_THRESHOLD: 200, // ms to distinguish tap from hold
	OPEN_ANIMATION_DURATION: 150,
	CLOSE_ANIMATION_DURATION: 100,
	SELECTION_FEEDBACK_DURATION: 100,

	// Dimensions
	WHEEL_RADIUS: 120,
	WHEEL_INNER_RADIUS: 40,
	SEGMENT_ICON_OFFSET: 75, // Distance from center to icon
	CENTER_ICON_SIZE: 32,
	SPELL_ICON_SIZE: 40,

	// Angles
	SEGMENT_GAP: 2, // Degrees gap between segments

	// Overlay
	OVERLAY_ALPHA: 0.7,
} as const;

// =============================================================================
// SPELL SYSTEM
// =============================================================================

export const SpellValues = {
	// Mana costs
	MANA_COST_LOW: 10,
	MANA_COST_MEDIUM: 20,
	MANA_COST_HIGH: 35,
	MANA_COST_VERY_HIGH: 50,

	// Cooldowns (ms)
	COOLDOWN_SHORT: 1000,
	COOLDOWN_MEDIUM: 2000,
	COOLDOWN_LONG: 4000,

	// Damage multipliers
	DAMAGE_WEAK: 0.5,
	DAMAGE_NORMAL: 1.0,
	DAMAGE_STRONG: 1.5,
	DAMAGE_VERY_STRONG: 2.0,
} as const;

// =============================================================================
// INPUT
// =============================================================================

export const InputValues = {
	// Key codes
	KEY_L: 76,
	KEY_SPACE: 32,
	KEY_J: 74,
	KEY_K: 75,
	KEY_I: 73,
	KEY_U: 85,
} as const;

// =============================================================================
// ICE PHYSICS (Ice Caverns biome)
// =============================================================================

export const IcePhysics = {
	// Friction multipliers (lower = more slippery)
	NORMAL_FRICTION: 1.0,
	ICE_FRICTION: 0.15,
	DEEP_ICE_FRICTION: 0.08,

	// Slide mechanics
	SLIDE_DECELERATION: 0.98, // How quickly player slows on ice
	MIN_SLIDE_VELOCITY: 5, // Minimum velocity before stopping
	MAX_SLIDE_VELOCITY: 400, // Cap on slide speed

	// Ice hazard damage
	FREEZING_WATER_DPS: 5, // Damage per second in freezing water
	ICICLE_DAMAGE: 15, // Damage from falling icicles

	// Blizzard effects
	BLIZZARD_VISIBILITY_RADIUS: 80, // Reduced visibility in blizzard
	BLIZZARD_SPEED_PENALTY: 0.7, // Speed multiplier in blizzard

	// Frost status effect
	FROST_SLOW_DURATION: 3000, // ms
	FROST_SLOW_AMOUNT: 0.5, // Speed multiplier when frosted
} as const;

// =============================================================================
// ICE CAVERNS SCENE
// =============================================================================

export const IceCavernsValues = {
	// Map dimensions
	MAP_WIDTH_TILES: 60,
	MAP_HEIGHT_TILES: 60,
	TILE_SIZE: 16,

	// Room generation
	MIN_ROOMS: 8,
	MAX_ROOMS: 12,
	MIN_ROOM_SIZE: 6,
	MAX_ROOM_SIZE: 12,

	// Enemy spawn counts per room type
	ENEMIES_PER_SMALL_ROOM: 2,
	ENEMIES_PER_MEDIUM_ROOM: 4,
	ENEMIES_PER_LARGE_ROOM: 6,

	// Boss room
	BOSS_ROOM_SIZE: 16,

	// Hazard frequencies
	ICICLE_SPAWN_INTERVAL: 5000, // ms between icicle drops
	BLIZZARD_DURATION: 8000, // ms
	BLIZZARD_INTERVAL: 30000, // ms between blizzard events

	// Lighting
	CAVERN_AMBIENT_DARKNESS: 0.75,
	ICE_CRYSTAL_LIGHT_RADIUS: 100,
	ICE_CRYSTAL_LIGHT_COLOR: 0x87ceeb, // Light blue
} as const;

// =============================================================================
// VOLCANIC PHYSICS (Volcanic Dungeons biome)
// =============================================================================

export const VolcanicPhysics = {
	// Lava damage
	LAVA_INSTANT_DEATH: true, // Falling in lava is instant death
	LAVA_RESPAWN_DELAY: 2000, // ms before respawning after lava death

	// Heat damage
	HEAT_ZONE_DAMAGE: 1, // Damage per tick in heat zones
	HEAT_ZONE_TICK_RATE: 2000, // ms between heat damage ticks
	HEAT_RESISTANCE_REDUCTION: 0.5, // Damage reduction with heat resistance

	// Geyser mechanics
	GEYSER_ERUPTION_INTERVAL: 4000, // ms between eruptions
	GEYSER_DAMAGE: 10, // Damage from geyser hit
	GEYSER_WARNING_TIME: 1000, // ms warning before eruption

	// Burning floor
	BURNING_FLOOR_DAMAGE: 2, // Damage per tick on burning floor
	BURNING_FLOOR_TICK_RATE: 1000, // ms between burn ticks

	// Fire trap
	FIRE_TRAP_DAMAGE: 15, // Damage from fire trap
	FIRE_TRAP_COOLDOWN: 3000, // ms between trap activations

	// Collapsing bridge
	BRIDGE_COLLAPSE_WARNING: 2000, // ms warning before collapse
	BRIDGE_RESPAWN_TIME: 10000, // ms before bridge respawns
} as const;

// =============================================================================
// VOLCANIC DUNGEONS SCENE
// =============================================================================

export const VolcanicDungeonsValues = {
	// Map dimensions
	MAP_WIDTH_TILES: 70,
	MAP_HEIGHT_TILES: 70,
	TILE_SIZE: 16,

	// Room generation
	MIN_ROOMS: 10,
	MAX_ROOMS: 14,
	MIN_ROOM_SIZE: 7,
	MAX_ROOM_SIZE: 14,

	// Enemy spawn counts per room type
	ENEMIES_PER_SMALL_ROOM: 2,
	ENEMIES_PER_MEDIUM_ROOM: 4,
	ENEMIES_PER_LARGE_ROOM: 5,

	// Boss room
	BOSS_ROOM_SIZE: 18,

	// Hazard frequencies
	GEYSER_COUNT_PER_ROOM: 1,
	HEAT_ZONE_CHANCE: 0.3, // 30% of rooms have heat zones

	// Lighting
	VOLCANIC_AMBIENT_DARKNESS: 0.6, // Brighter due to lava glow
	LAVA_LIGHT_RADIUS: 120,
	LAVA_LIGHT_COLOR: 0xff4500, // Orange-red lava glow
	TORCH_LIGHT_COLOR: 0xff6600, // Warm orange torch

	// Visual effects
	SMOKE_PARTICLE_FREQUENCY: 100,
	EMBER_PARTICLE_FREQUENCY: 150,
} as const;

// =============================================================================
// SKY PHYSICS (Sky Islands biome)
// =============================================================================

export const SkyPhysics = {
	// Jump mechanics
	JUMP_VELOCITY: -400, // Upward velocity when jumping
	JUMP_COOLDOWN: 100, // ms between jumps
	DOUBLE_JUMP_VELOCITY: -350, // Second jump slightly weaker
	MAX_JUMPS: 2, // Base jump + double jump

	// Wind mechanics
	WIND_FORCE_LIGHT: 50, // Gentle breeze
	WIND_FORCE_MEDIUM: 100, // Standard wind current
	WIND_FORCE_STRONG: 200, // Strong gust
	WIND_FORCE_TORNADO: 300, // Tornado pull strength
	WIND_TICK_RATE: 100, // ms between wind force applications

	// Fall mechanics
	FALL_DAMAGE_THRESHOLD: 300, // Y velocity before taking damage
	FALL_DAMAGE_MULTIPLIER: 0.02, // Damage = velocity * multiplier
	MAX_FALL_DAMAGE: 50, // Cap on fall damage
	RESPAWN_FALL_DAMAGE: 10, // Damage when respawning from fall

	// Platform mechanics
	CRUMBLE_WARNING_TIME: 1500, // ms warning before platform crumbles
	CRUMBLE_FALL_TIME: 500, // ms for platform to fall
	PLATFORM_RESPAWN_TIME: 8000, // ms before platform respawns

	// Lightning hazard
	LIGHTNING_STRIKE_INTERVAL: 5000, // ms between potential strikes
	LIGHTNING_DAMAGE: 20, // Damage from lightning
	LIGHTNING_WARNING_TIME: 1000, // ms warning before strike
	LIGHTNING_STUN_DURATION: 500, // ms stun after being hit
} as const;

// =============================================================================
// SKY ISLANDS SCENE
// =============================================================================

export const SkyIslandsValues = {
	// Map dimensions (wider for horizontal platforming)
	MAP_WIDTH_TILES: 80,
	MAP_HEIGHT_TILES: 50,
	TILE_SIZE: 16,

	// Island generation
	MIN_ISLANDS: 12,
	MAX_ISLANDS: 18,
	MIN_ISLAND_SIZE: 4,
	MAX_ISLAND_SIZE: 10,
	ISLAND_VERTICAL_SPACING: 3, // Minimum tiles between island layers
	ISLAND_HORIZONTAL_GAP: 2, // Minimum gap between adjacent islands

	// Enemy spawn counts per island type
	ENEMIES_PER_SMALL_ISLAND: 1,
	ENEMIES_PER_MEDIUM_ISLAND: 2,
	ENEMIES_PER_LARGE_ISLAND: 4,

	// Boss island
	BOSS_ISLAND_SIZE: 14,

	// Wind zone frequencies
	WIND_ZONE_CHANCE: 0.4, // 40% of gaps have wind currents
	TORNADO_ZONE_CHANCE: 0.1, // 10% chance for tornado zones

	// Teleporter pads
	TELEPORTER_COUNT: 4, // Number of teleporter pad pairs

	// Lighting
	SKY_AMBIENT_BRIGHTNESS: 0.2, // Bright outdoor lighting
	CLOUD_LIGHT_RADIUS: 150,
	CLOUD_LIGHT_COLOR: 0xffffff, // White cloud glow
	LIGHTNING_FLASH_COLOR: 0xffffcc, // Yellow-white flash

	// Visual effects
	CLOUD_PARTICLE_FREQUENCY: 200,
	WIND_PARTICLE_FREQUENCY: 80,
} as const;

// =============================================================================
// UNDERWATER PHYSICS (Underwater Temple biome)
// =============================================================================

export const UnderwaterPhysics = {
	// Swimming speed (percentage of normal speed)
	SWIM_SPEED_MULTIPLIER: 0.65, // 65% of normal speed
	SWIM_SPEED_SLOW: 0.5, // In crushing pressure zones
	SWIM_SPEED_FAST: 0.8, // With speed boost items

	// Air meter system
	MAX_AIR: 100, // Air meter capacity
	AIR_DRAIN_RATE: 2, // Air lost per second
	AIR_DANGER_THRESHOLD: 25, // Below this, warning effects
	DROWNING_DAMAGE: 5, // Damage per tick when out of air
	DROWNING_TICK_RATE: 1000, // ms between drowning damage

	// Air bubble refill
	AIR_BUBBLE_REFILL_RATE: 50, // Air restored per second at bubble
	AIR_BUBBLE_RADIUS: 48, // Detection radius for air bubbles

	// Water current mechanics
	CURRENT_FORCE_WEAK: 30, // Gentle current
	CURRENT_FORCE_MEDIUM: 60, // Standard current
	CURRENT_FORCE_STRONG: 100, // Strong current
	CURRENT_FORCE_WHIRLPOOL: 150, // Whirlpool pull

	// Pressure zones
	PRESSURE_DAMAGE: 2, // Damage per tick in pressure zones
	PRESSURE_TICK_RATE: 2000, // ms between pressure damage

	// Electric eel shock
	SHOCK_DAMAGE: 15, // Damage from electric shock
	SHOCK_STUN_DURATION: 1000, // ms stun duration
	SHOCK_ZONE_RADIUS: 60, // Radius of electric attack
} as const;

// =============================================================================
// UNDERWATER TEMPLE SCENE
// =============================================================================

export const UnderwaterTempleValues = {
	// Map dimensions (vertical exploration)
	MAP_WIDTH_TILES: 60,
	MAP_HEIGHT_TILES: 80, // Taller for vertical exploration
	TILE_SIZE: 16,

	// Room generation
	MIN_ROOMS: 10,
	MAX_ROOMS: 15,
	MIN_ROOM_SIZE: 5,
	MAX_ROOM_SIZE: 11,

	// Enemy spawn counts per room type
	ENEMIES_PER_SMALL_ROOM: 2,
	ENEMIES_PER_MEDIUM_ROOM: 3,
	ENEMIES_PER_LARGE_ROOM: 5,

	// Boss room
	BOSS_ROOM_SIZE: 20, // Large for Leviathan fight

	// Air bubble placement
	AIR_BUBBLE_FREQUENCY: 50, // Tiles between air bubbles
	AIR_BUBBLE_SPAWN_CHANCE: 0.4, // 40% of valid positions have bubbles

	// Current zone frequencies
	CURRENT_ZONE_CHANCE: 0.35, // 35% of corridors have currents
	WHIRLPOOL_CHANCE: 0.1, // 10% chance for whirlpool hazards

	// Lighting (underwater blue-green)
	UNDERWATER_AMBIENT_DARKNESS: 0.7, // Dark underwater
	UNDERWATER_LIGHT_RADIUS: 80, // Limited visibility
	UNDERWATER_LIGHT_COLOR: 0x0099cc, // Blue-cyan underwater glow
	BIOLUMINESCENCE_COLOR: 0x00ffaa, // Glowing creatures/plants

	// Visual effects
	BUBBLE_PARTICLE_FREQUENCY: 120,
	SEAWEED_SWAY_SPEED: 1500, // ms for full sway cycle
} as const;

// =============================================================================
// CURSE MECHANICS (Undead Crypts biome)
// =============================================================================

export const CurseMechanics = {
	// Curse zone effects
	WEAKENED_HP_REDUCTION: 0.5, // 50% max HP reduction
	WEAKENED_DAMAGE_REDUCTION: 0.75, // 25% damage reduction
	SLOWED_SPEED_REDUCTION: 0.7, // 30% speed reduction
	HAUNTED_TELEPORT_CHANCE: 0.1, // 10% chance per tick

	// Curse tick rates
	CURSE_CHECK_RATE: 2000, // ms between curse checks
	UNHOLY_GROUND_TICK_RATE: 3000, // ms between unholy ground damage

	// Unholy ground damage
	UNHOLY_GROUND_DAMAGE: 3, // Damage per tick on unholy ground

	// Poison gas
	POISON_GAS_DAMAGE: 5, // Damage per tick in poison
	POISON_GAS_TICK_RATE: 1500, // ms between poison damage
	POISON_DURATION: 6000, // How long poison lasts after leaving zone

	// Ghost mechanics
	GHOST_PHASE_DURATION: 3000, // How long ghosts can phase through walls
	GHOST_COOLDOWN: 5000, // Cooldown between phases

	// Holy weapon bonuses
	HOLY_DAMAGE_BONUS: 1.5, // 50% bonus damage vs undead
} as const;

// =============================================================================
// UNDEAD CRYPTS SCENE
// =============================================================================

export const UndeadCryptsValues = {
	// Map dimensions
	MAP_WIDTH_TILES: 70,
	MAP_HEIGHT_TILES: 70,
	TILE_SIZE: 16,

	// Room generation
	MIN_ROOMS: 12,
	MAX_ROOMS: 16,
	MIN_ROOM_SIZE: 6,
	MAX_ROOM_SIZE: 12,

	// Enemy spawn counts per room type
	ENEMIES_PER_SMALL_ROOM: 3,
	ENEMIES_PER_MEDIUM_ROOM: 5,
	ENEMIES_PER_LARGE_ROOM: 7,

	// Boss room
	BOSS_ROOM_SIZE: 18,

	// Curse zone frequencies
	CURSE_ZONE_CHANCE: 0.25, // 25% of rooms have curse zones
	UNHOLY_GROUND_CHANCE: 0.2, // 20% of corridors have unholy ground

	// Puzzle elements
	PUZZLE_ROOMS_COUNT: 3, // Number of puzzle rooms per dungeon
	KEYS_REQUIRED: 3, // Keys needed for boss door

	// Lighting (eerie green-purple)
	CRYPT_AMBIENT_DARKNESS: 0.8, // Very dark crypts
	CRYPT_LIGHT_RADIUS: 70, // Limited torch light
	CRYPT_LIGHT_COLOR: 0x665577, // Purple-grey torch light
	RUNE_GLOW_COLOR: 0x88ff88, // Green glowing runes
	GHOST_GLOW_COLOR: 0x99bbff, // Blue-white ghost glow

	// Visual effects
	DUST_PARTICLE_FREQUENCY: 150,
	COBWEB_SWAY_SPEED: 2000, // ms for full sway cycle
} as const;
