/**
 * @fileoverview User-facing messages and strings for Neverquest
 *
 * All text shown to users should be defined here for:
 * - Localization support (i18n)
 * - Consistency across the codebase
 * - Easy modification of game text
 *
 * Organization:
 * - Error messages: Technical errors and failures
 * - Warning messages: Non-critical issues
 * - Game messages: Combat, movement, etc.
 * - UI labels: Button text, titles, etc.
 * - Debug messages: Developer-facing text
 *
 * @module consts/Messages
 */

// =============================================================================
// ERROR MESSAGES
// =============================================================================

export const ErrorMessages = {
	// Configuration errors
	ENEMY_CONFIG_NOT_FOUND: (id: number | string) => `Enemy config not found for id: ${id}`,
	ITEM_CONFIG_NOT_FOUND: (id: number | string) => `Item config not found for id: ${id}`,
	SCENE_NOT_FOUND: (key: string) => `Scene not found: ${key}`,
	ANIMATION_NOT_FOUND: (key: string) => `Animation not found: ${key}`,

	// Runtime errors
	UNCAUGHT_ERROR: 'Uncaught error',
	UNHANDLED_PROMISE: 'Unhandled promise rejection',
	ERROR_GETTING_BOUNDS: 'Error getting bounds',

	// Asset errors
	ASSET_NOT_REGISTERED: (key: string) => `Asset not registered: ${key}`,
	ASSET_FETCH_FAILED: (statusText: string) => `Failed to fetch asset: ${statusText}`,
	ASSET_LOAD_TIMEOUT: (key: string) => `Asset load timeout: ${key}`,

	// Plugin errors
	ANIMATED_TILES_UNEXPECTED_ERROR:
		"This shouldn't happen. Not at all. Blame Phaser Animated Tiles plugin. You'll be fine though.",
	PLUGIN_INIT_FAILED: (name: string) => `Plugin initialization failed: ${name}`,

	// UI errors
	INTERFACE_ELEMENT_LINE_NOT_AVAILABLE:
		'This Element line is not available. Check if this line has items, or if the line exists at all.',

	// Entity errors
	ENTITY_NOT_ACTIVE: (name: string) => `Entity not active: ${name}`,
	ENTITY_MISSING_COMPONENT: (entity: string, component: string) =>
		`${entity} missing required component: ${component}`,

	// State errors
	INVALID_STATE_TRANSITION: (from: string, to: string) => `Invalid state transition: ${from} -> ${to}`,
	STATE_ALREADY_SET: (state: string) => `State already set: ${state}`,

	// Save/Load errors
	SAVE_FAILED: (reason: string) => `Save failed: ${reason}`,
	LOAD_FAILED: (reason: string) => `Load failed: ${reason}`,
	CORRUPTED_SAVE_DATA: 'Save data is corrupted or invalid',
} as const;

// =============================================================================
// WARNING MESSAGES
// =============================================================================

export const WarningMessages = {
	INVENTORY_SLOTS_FULL: (available: number, items: number) =>
		`Not enough inventory slots. Available: ${available}, Items: ${items}`,
} as const;

// =============================================================================
// GAME MESSAGES
// =============================================================================

export const GameMessages = {
	// Combat
	ATTACK_ENEMY: (name: string, damage: number) => `You attack ${name} for ${damage} damage!`,
	ENEMY_DEFEATED: (name: string, exp: number) => `${name} defeated! +${exp} EXP`,
	ENEMY_REMAINING_HP: (name: string, hp: number) => `${name} has ${hp} HP remaining`,
	NO_ENEMIES_NEARBY: 'No enemies nearby!',

	// Combat messages with emojis
	CRITICAL_HIT: (attackerName: string, targetName: string, damage: number) =>
		`💥 ${attackerName} landed a CRITICAL hit on ${targetName} for ${damage} damage!`,
	NORMAL_HIT: (attackerName: string, targetName: string, damage: number) =>
		`⚔️ ${attackerName} hit ${targetName} for ${damage} damage`,
	ATTACK_MISS: (attackerName: string, targetName: string) => `❌ ${attackerName} missed ${targetName}!`,
	PLAYER_DEFEATED: '💀 You have been defeated!',
	ENEMY_DEFEATED_WITH_EXP: (targetName: string, exp: number) => `✨ ${targetName} defeated! +${exp} XP`,

	// Movement
	BUMP_INTO_WALL: 'You bump into a wall.',
	ENTITY_IN_WAY: (name: string) => `There's a ${name} in the way!`,

	// Defense
	SHIELD_RAISED: 'You raise your shield!',
	SHIELD_LOWERED: 'Your shield is lowered.',

	// Save/Load
	NO_CHECKPOINT_FOUND: 'No checkpoint found',
} as const;

// =============================================================================
// UI LABELS
// =============================================================================

export const UILabels = {
	// HUD
	GAME_LOG_TITLE: 'Game Log',
	GAME_LOG_TITLE_WITH_ICON: '⚔️ Game Log',
	HELP_TITLE: 'Help',
	EXIT_LABEL: 'EXIT',

	// Buttons
	BUTTON_RESTART: 'Restart',
	BUTTON_MAIN_MENU: 'Main Menu',
	BUTTON_QUIT: 'Quit',
	BUTTON_START_GAME: 'Start Game',

	// Scenes
	GAME_OVER_TITLE: 'GAME OVER',
	GAME_OVER_LEVEL_REACHED: (level: number) => `You reached Level ${level}`,
	VICTORY_TITLE: 'VICTORY!',

	// Preload Scene
	LOADING_TEXT: 'Loading...',

	// Portals
	RETURN_PORTAL: 'Return Portal',
	STRANGE_PORTAL: 'Strange Portal',

	// Attributes
	AVAILABLE_LABEL: 'Available: ',
	ATTACK_LABEL: (atack: number) => `Atack: ${atack}`,
	DEFENSE_LABEL: (defense: number) => `Defense: ${defense}`,
	MAX_HEALTH_LABEL: (maxHealth: number) => `Max Health: ${maxHealth}`,
	CRITICAL_LABEL: (critical: number) => `Critical: ${critical} %`,
	FLEE_LABEL: (flee: number) => `Flee: ${flee}`,
	HIT_LABEL: (hit: number) => `Hit: ${hit}`,

	// Mobile check messages
	MOBILE_FULLSCREEN_AND_ORIENTATION:
		'Please, touch the screen to enable Full Screen mode and rotate your device to Landscape mode.',
	MOBILE_ORIENTATION: 'Please, rotate your device to landscape to have a better experience.',
	MOBILE_FULLSCREEN: 'Please, touch the screen to enable Full Screen mode.',

	// Welcome messages
	WELCOME_MESSAGE: '✨ Welcome to Neverquest!',
	WELCOME_CONTROLS: '🎮 Use arrow keys or WASD to move',
	WELCOME_ATTACK: '⚔️ Press Space to attack nearby enemies',

	// Settings Scene
	AUDIO_LABEL: 'Audio:',
	AUDIO_LABEL_WITH_VALUE: (value: number) => `Audio: ${parseFloat(value.toFixed(1)) * 100}`,

	// Spell Wheel
	SPELL_WHEEL_INSTRUCTIONS: 'Move mouse to select, release L to cast',
	SPELL_WHEEL_MANA_LABEL: (cost: number) => `Mana: ${cost}`,
	SPELL_WHEEL_NO_SPELLS: 'No spells available',
	SPELL_WHEEL_CAST: (spellName: string) => `Cast ${spellName}`,
} as const;

// =============================================================================
// PLATFORM AND SYSTEM CONSTANTS
// =============================================================================

export const PlatformConstants = {
	WIN32: 'win32',
	DARWIN: 'darwin',
	LINUX: 'linux',
	UNKNOWN: 'unknown',
} as const;

export const ArchitectureConstants = {
	X64: 'x64',
	IA32: 'ia32',
	ARM64: 'arm64',
	ARM: 'arm',
	UNKNOWN: 'unknown',
} as const;

export const UserAgentArchDetection = {
	X64: 'x64',
	X86_64: 'x86_64',
	X86: 'x86',
	I386: 'i386',
	ARM64: 'arm64',
	AARCH64: 'aarch64',
	ARM: 'arm',
} as const;

// =============================================================================
// URL PREFIXES
// =============================================================================

export const UrlPrefixes = {
	BLOB: 'blob:',
} as const;

// =============================================================================
// SAVE/LOAD MESSAGES
// =============================================================================

export const SaveMessages = {
	// Save notifications
	GAME_SAVED_TITLE: 'Game Saved',
	GAME_SAVED_MESSAGE: '💾 Game saved successfully!',
	AUTO_SAVED_MESSAGE: '💾 Auto-saved',
	SAVE_FAILED_TITLE: 'Save Failed!',

	// Load notifications
	GAME_LOADED_TITLE: 'Game Loaded',
	GAME_LOADED_MESSAGE: '📂 Game loaded successfully!',
	LOAD_FAILED_TITLE: 'Load Failed!',
	APPLY_FAILED_TITLE: 'Apply Failed!',
	NO_CHECKPOINT_FOUND: 'No checkpoint found',
} as const;

// =============================================================================
// DEBUG MESSAGES
// =============================================================================

export const DebugMessages = {
	DEBUG_HELPER_INITIALIZED: 'DebugHelper initialized',
	DEBUG_HELPER_CONNECTED: 'DebugHelper connected to game instance',
	DEBUG_SHORTCUTS_REGISTERED: 'Debug shortcuts registered (F9, F10, F11)',
	CREATING_DEBUG_DUMP: 'Creating debug dump...',
	DEBUG_DUMP_DOWNLOADED: (filename: string) => `Debug dump downloaded: ${filename}`,
	DEBUG_DUMP_COPIED: 'Debug dump copied to clipboard',
	DEBUG_DUMP_COPY_FAILED: 'Failed to copy debug dump to clipboard',
	QUICK_DEBUG_PRINTED: 'Quick debug dump printed to console',
	DUNGEON_TORCHES_ADDED: '[DungeonScene] Added torches to dungeon rooms',

	// Internal debug strings
	NEVERQUEST_PLUGIN_PATTERN: 'Neverquest',
	HTML_ELEMENT_PLACEHOLDER: '[HTMLElement]',
	UNKNOWN_VERSION: 'unknown',
	UNKNOWN_USER_AGENT: 'unknown',
	ALL_SCENES_HEADER: '🎬 All Scenes:',
	RELATIVE_TO_CLAMPED_NOTE: 'Relative to CLAMPED range (actual rendered tiles)',
	SIZE_OF_CLAMPED_NOTE: 'Size of CLAMPED range (fills the minimap)',
	CALCULATED_FROM_CLAMPED_NOTE: 'Calculated from CLAMPED range (aligned with tiles)',
	MINIMAP_DESIRED_BOUNDS: (desiredStartX: number, desiredStartY: number, desiredEndX: number, desiredEndY: number) =>
		`  Desired bounds: start(${desiredStartX}, ${desiredStartY}) end(${desiredEndX}, ${desiredEndY})`,
	MINIMAP_MARKER_POSITION_PERCENT: (xPercent: string, yPercent: string) =>
		`  Marker position as %: (${xPercent}%, ${yPercent}%)`,
	MEMORY_USAGE: 'Memory usage',
	PLAYER_NOT_ACTIVE: 'not active',
} as const;

// =============================================================================
// HELP TEXT
// =============================================================================

export const HelpText = {
	CONTROLS_MOVE: 'Arrow Keys / WASD: Move',
	CONTROLS_ATTACK: 'Space / J: Attack adjacent enemy',
	CONTROLS_BLOCK: 'B / K: Block/Defend',
	CONTROLS_HELP: 'H: Show this help',
	CONTROLS_QUIT: 'Q / Escape: Quit',
} as const;

// =============================================================================
// LOG CATEGORIES
// =============================================================================

export const LogCategories = {
	SYSTEM: 'System',
	COMBAT: 'Combat',
	PLAYER: 'Player',
	ENEMY: 'Enemy',
	UI: 'UI',
	DEBUG: 'Debug',
} as const;

// =============================================================================
// MESSAGE LOG KEYWORDS (for color coding)
// =============================================================================

export const MessageKeywords = {
	// Success keywords
	DEFEATED: 'defeated',
	VICTORY: 'victory',

	// Combat keywords
	DAMAGE: 'damage',
	ATTACK: 'attack',

	// Healing keywords
	HEAL: 'heal',
	RESTORED: 'restored',

	// Progression keywords
	LEVEL_UP: 'level up',
	XP: 'XP',
} as const;

// =============================================================================
// FONT FAMILY
// =============================================================================

export const FontFamily = {
	PIXEL: 'Press Start 2P',
	DEFAULT: 'Arial',
	MONOSPACE: 'monospace',
} as const;

// =============================================================================
// INTRO SCENE TEXT
// =============================================================================

export const IntroSceneText = {
	PHASER_LOGO_TEXT: 'Proudly created with',
	STUDIO_NAME: 'Neverquest Game Studio',
} as const;

// =============================================================================
// DIALOG BOX MESSAGES
// =============================================================================

export const DialogBoxMessages = {
	// Character name prefixes
	LEFT_NAME_PREFIX: (name: string) => ` ${name}: `,
	RIGHT_NAME_PREFIX: (name: string) => ` ${name}: `,
} as const;

// =============================================================================
// CONSUMABLE MESSAGES
// =============================================================================

export const ConsumableMessages = {
	// Item usage messages
	USED_ITEM_HP_RESTORE: (itemName: string, healAmount: number) => `💚 Used ${itemName}! Restored ${healAmount} HP`,
} as const;

// =============================================================================
// EXPERIENCE MESSAGES
// =============================================================================

export const ExperienceMessages = {
	// Level up messages
	LEVEL_UP: (level: number) => `🎉 LEVEL UP! You are now level ${level}! (+1 stat point)`,
	// Placeholder number for level up visual effect
	LEVEL_UP_VISUAL_PLACEHOLDER: 999,
} as const;

// =============================================================================
// INFOBOX MESSAGES
// =============================================================================

export const InfoBoxMessages = {
	// InfoBox description separator
	DESCRIPTION_SEPARATOR: ', description: ',
} as const;

// =============================================================================
// TERMINAL GAME MESSAGES
// =============================================================================

export const TerminalMessages = {
	// Terminal title
	TERMINAL_TITLE: 'Neverquest - Terminal Edition',

	// Welcome messages
	WELCOME: '{green-fg}✨ Welcome to Neverquest - Terminal Edition! ✨{/green-fg}',
	CONTROLS_INFO: '{cyan-fg}🎮 Controls: Arrow/WASD=Move | Space/J=Attack | B/K=Block | H=Help | Q=Quit{/cyan-fg}',
	QUEST_BEGIN: '{yellow-fg}🗡️  Your quest begins... Defeat all monsters and collect treasures!{/yellow-fg}',
	PLAYER_MARKER:
		"{red-fg}👀 Look for {/red-fg}{red-bg}{yellow-fg}{bold}[🧙‍♂️]{/bold}{/yellow-fg}{/red-bg}{red-fg} (wizard in YELLOW BRACKETS on RED) - that's YOU!{/red-fg}",
	GAME_STARTED: '{green-fg}Game started!{/green-fg}',

	// Combat messages
	ATTACK_MESSAGE: (entitySymbol: string, entityName: string, damage: number) =>
		`{red-fg}⚔️  You attack ${entitySymbol} ${entityName} for ${damage} damage! 💥{/red-fg}`,
	ENEMY_DEFEATED_MESSAGE: (entityName: string) => `{green-fg}✨ ${entityName} defeated! +10 XP 🎯{/green-fg}`,
	ENEMY_HP_REMAINING: (entityName: string, healthPercent: number) =>
		`{yellow-fg}${entityName} has ${healthPercent}% HP remaining{/yellow-fg}`,

	// Defense messages
	SHIELD_RAISED_MESSAGE: (defenseBoost: number) =>
		`{blue-fg}🛡️  You raise your shield! Defense +${defenseBoost} for this turn{/blue-fg}`,
	SHIELD_LOWERED_MESSAGE: '{grey-fg}Your shield is lowered{/grey-fg}',

	// Help messages
	HELP_HEADER: '{cyan-fg}📖 === Help ==={/cyan-fg}',
	HELP_MOVE: '🏃 Arrow Keys / WASD: Move',
	HELP_ATTACK: '⚔️  Space / J: Attack adjacent enemy (with animation!)',
	HELP_BLOCK: '🛡️  B / K: Block/Defend (+5 DEF for 2 seconds)',
	HELP_HELP: '📖 H: Show this help',
	HELP_QUIT: '🚪 Q / Escape: Quit',
	HELP_ELEMENTS_HEADER: '{yellow-fg}🎮 Game Elements:{/yellow-fg}',
	HELP_PLAYER:
		'{red-bg}{yellow-fg}{bold}[🧙‍♂️]{/bold}{/yellow-fg}{/red-bg} You (Player) - Wizard in YELLOW BRACKETS on RED!',
	HELP_MONSTERS: '🐀🦇👹👺👻🐉 Monsters',
	HELP_TERRAIN: '█ Walls  🚪 Doors  ≈ Water',
	HELP_ITEMS: '💎 Treasure  🔥 Torches',
	HELP_NEW_FEATURES: '{green-fg}✨ NEW: Animated attacks with particles and damage numbers!{/green-fg}',

	// Status display
	STATUS_PLAYER_HEADER: '{cyan-fg}{red-bg}{yellow-fg}{bold}[🧙‍♂️]{/bold}{/yellow-fg}{/red-bg} Player Status{/cyan-fg}',
	STATUS_HP_LABEL: (healthBar: string) => `❤️  HP: ${healthBar}`,
	STATUS_HP_VALUES: (health: number, maxHealth: number) => `{red-fg}${health}/${maxHealth}{/red-fg}`,
	STATUS_LEVEL: (level: number) => `⭐ Level: {yellow-fg}${level}{/yellow-fg}`,
	STATUS_XP: (xpBar: string) => `✨ XP: ${xpBar}`,
	STATUS_XP_VALUES: (experience: number, nextLevelExperience: number) =>
		`{green-fg}${experience}/${nextLevelExperience}{/green-fg}`,
	STATUS_STATS_HEADER: '{cyan-fg}📊 Stats:{/cyan-fg}',
	STATUS_STR: (str: number) => `💪 STR: ${str}`,
	STATUS_AGI: (agi: number) => `🏃 AGI: ${agi}`,
	STATUS_VIT: (vit: number) => `❤️  VIT: ${vit}`,
	STATUS_DEX: (dex: number) => `🎯 DEX: ${dex}`,
	STATUS_INT: (int: number) => `🧠 INT: ${int}`,
	STATUS_ATK: (atack: number) => `⚔️  ATK: {red-fg}${atack}{/red-fg}`,
	STATUS_DEF: (defense: number) => `🛡️  DEF: {blue-fg}${defense}{/blue-fg}`,
	STATUS_ENEMIES_HEADER: '{yellow-fg}👾 Enemies{/yellow-fg}',
	STATUS_ENEMIES_REMAINING: (remaining: number) => `Remaining: {red-fg}${remaining}{/red-fg}`,
	STATUS_POSITION: (x: number, y: number) => `📍 Position: (${x}, ${y})`,
} as const;

// =============================================================================
// ERROR PAGE STYLES (CSS)
// =============================================================================

export const ErrorPageStyles = {
	CONTAINER:
		'display: flex; align-items: center; justify-content: center; height: 100vh; font-family: Arial, sans-serif;',
	TEXT_CENTER: 'text-align: center;',
	REFRESH_BUTTON: 'padding: 10px 20px; font-size: 16px; cursor: pointer;',
} as const;

// =============================================================================
// ERROR PAGE TEXT
// =============================================================================

export const ErrorPageText = {
	TITLE: 'Game Failed to Load',
	MESSAGE: "We're sorry, but the game encountered an error during initialization.",
	INSTRUCTION: 'Please refresh the page to try again.',
	BUTTON_TEXT: 'Refresh Page',
} as const;

// =============================================================================
// MAP OBJECT NAMES
// =============================================================================

export const MapObjectNames = {
	SPAWN_POINT: 'Spawn Point',
} as const;

// =============================================================================
// CHARACTER CONSTANTS
// =============================================================================

export const Characters = {
	EMPTY_STRING: '',
	SPACE: ' ',
} as const;
