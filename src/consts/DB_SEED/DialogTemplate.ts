/**
 * @fileoverview Dialog creation template and utilities
 *
 * Dialog Template - Guidelines and utilities for creating game dialogs
 *
 * This file provides:
 * 1. Type definitions for dialog structures
 * 2. Factory functions for creating dialog entries
 * 3. Pre-defined character configurations
 * 4. Validation utilities
 * 5. Writing guidelines and best practices
 *
 * @example Creating a new dialog:
 * ```typescript
 * import {
 *   createDialog,
 *   createDialogEntry,
 *   CHARACTERS,
 *   DialogTone,
 * } from './DialogTemplate';
 *
 * export default createDialog({
 *   id: 20,
 *   entries: [
 *     createDialogEntry({
 *       speaker: CHARACTERS.LUCIUS,
 *       message: 'What manner of place is this?',
 *       position: 'left',
 *     }),
 *     createDialogEntry({
 *       speaker: CHARACTERS.MYSTERIOUS_VOICE,
 *       message: 'A place between worlds, traveler.',
 *       position: 'right',
 *     }),
 *   ],
 * });
 * ```
 *
 * ## Writing Guidelines
 *
 * ### 1. Character Voice Consistency
 * - Lucius: Determined, curious, compassionate. Uses formal but not archaic speech.
 * - NPCs: Each should have distinct speaking patterns.
 * - Villains: Menacing but not cartoonish. Reveal motivation through dialog.
 *
 * ### 2. Dialog Length
 * - Keep individual messages under 150 characters for readability.
 * - Long exposition should be split across multiple entries.
 * - Action/combat dialog should be brief (under 80 characters).
 *
 * ### 3. Pacing
 * - Start with hook/attention-grabber.
 * - Build tension through back-and-forth.
 * - End with clear direction or emotional beat.
 *
 * ### 4. Action Descriptions
 * - Use asterisks for actions: *draws sword*
 * - Keep actions brief and impactful.
 * - Actions should reveal character, not just describe movement.
 *
 * ### 5. World Building
 * - Sprinkle lore naturally, don't dump exposition.
 * - Reference other locations/characters to build connections.
 * - Leave some mystery for the player to discover.
 */

/**
 * Position of the speaker in the dialog box
 */
export type DialogPosition = 'left' | 'right';

/**
 * Tone of the dialog (for writing guidance)
 */
export enum DialogTone {
	/** Normal conversation */
	NEUTRAL = 'neutral',
	/** Tense or threatening */
	THREATENING = 'threatening',
	/** Sad or melancholic */
	SOMBER = 'somber',
	/** Happy or relieved */
	JOYFUL = 'joyful',
	/** Mysterious or cryptic */
	MYSTERIOUS = 'mysterious',
	/** Urgent or panicked */
	URGENT = 'urgent',
	/** Comedic or light-hearted */
	HUMOROUS = 'humorous',
}

/**
 * Dialog category for organization
 */
export enum DialogCategory {
	/** Main story dialogs */
	STORY = 'story',
	/** Side quest dialogs */
	SIDE_QUEST = 'side_quest',
	/** NPC ambient dialog */
	AMBIENT = 'ambient',
	/** Tutorial/help dialogs */
	TUTORIAL = 'tutorial',
	/** Shop/merchant dialogs */
	MERCHANT = 'merchant',
	/** Boss encounter dialogs */
	BOSS = 'boss',
	/** Lore/world-building dialogs */
	LORE = 'lore',
}

/**
 * Character configuration for consistent dialog styling
 */
export interface IDialogCharacter {
	/** Display name shown in dialog */
	name: string;
	/** Portrait sprite key (without extension) */
	portrait: string;
	/** Default position (can be overridden per entry) */
	defaultPosition: DialogPosition;
	/** Character description for writing reference */
	description: string;
	/** Speaking style notes */
	voiceNotes: string;
}

/**
 * Raw dialog entry as used by the game engine
 */
export interface IDialogEntryRaw {
	message: string;
	left: boolean;
	right: boolean;
	leftName: string;
	rightName: string;
	leftPortraitName: string;
	rightPortraitName: string;
	leftExit?: boolean;
	rightExit?: boolean;
}

/**
 * Complete dialog structure as used by the game
 */
export interface IDialogRaw {
	id: number;
	chat: IDialogEntryRaw[];
}

/**
 * Simplified dialog entry for creation
 */
export interface IDialogEntryConfig {
	/** The character speaking */
	speaker: IDialogCharacter;
	/** The dialog message */
	message: string;
	/** Position override (uses character default if not specified) */
	position?: DialogPosition;
	/** Whether speaker exits after this line */
	exit?: boolean;
}

/**
 * Dialog creation configuration
 */
export interface IDialogConfig {
	/** Unique dialog ID */
	id: number;
	/** Dialog entries */
	entries: IDialogEntryConfig[];
	/** Optional category for organization */
	category?: DialogCategory;
	/** Optional tone for the overall dialog */
	tone?: DialogTone;
	/** Story flag required to trigger this dialog */
	requiredFlag?: string;
	/** Story flag set after completing this dialog */
	setsFlag?: string;
}

/**
 * Pre-defined character configurations
 */
export const CHARACTERS: Record<string, IDialogCharacter> = {
	/** The player character */
	LUCIUS: {
		name: 'Lucius',
		portrait: 'lucius_portrait_beard',
		defaultPosition: 'left',
		description: 'The protagonist. A determined warrior searching for answers about his past.',
		voiceNotes: 'Speaks formally but accessibly. Curious and compassionate. Shows determination without arrogance.',
	},

	/** Disembodied mysterious narrator */
	MYSTERIOUS_VOICE: {
		name: 'Mysterious Voice',
		portrait: '',
		defaultPosition: 'right',
		description: 'An ethereal presence that guides and warns. True identity unknown.',
		voiceNotes:
			'Cryptic and prophetic. Speaks in riddles. Never fully explains anything. Uses formal, ancient speech patterns.',
	},

	/** Sir Aldric - the fallen knight ally */
	FALLEN_KNIGHT: {
		name: 'Fallen Knight',
		portrait: '',
		defaultPosition: 'right',
		description: 'Sir Aldric, a disgraced knight seeking redemption. Former guardian of the Sunstone.',
		voiceNotes:
			'Weary and guilt-ridden initially. Gains hope through interaction with Lucius. Uses military terminology.',
	},

	/** Wandering merchant NPC */
	MERCHANT: {
		name: 'Wandering Merchant',
		portrait: '',
		defaultPosition: 'right',
		description: 'A traveling trader who appears throughout the world. Knows many secrets.',
		voiceNotes: 'Friendly and business-minded. Speaks quickly. Occasionally drops hints about the world.',
	},

	/** The Oracle of the Depths */
	ORACLE: {
		name: 'Oracle of the Depths',
		portrait: '',
		defaultPosition: 'right',
		description: 'An ancient seer who can glimpse past, present, and future.',
		voiceNotes: 'Speaks in visions and metaphors. Often refers to player in third person. Ethereal tone.',
	},

	/** Gate Guardian - blocks access to Dark Lands */
	GATE_GUARDIAN: {
		name: 'Gate Guardian',
		portrait: '',
		defaultPosition: 'right',
		description: 'A spectral guardian bound to protect the gate to the Dark Lands.',
		voiceNotes: 'Monotone and duty-bound. Speaks in declarations. Shows no emotion.',
	},

	/** The main antagonist */
	VOID_KING: {
		name: 'The Void King',
		portrait: '',
		defaultPosition: 'right',
		description: 'The primary antagonist. A being of pure darkness seeking to consume all light.',
		voiceNotes: 'Menacing but intelligent. Speaks with contempt for mortals. Reveals tragic backstory gradually.',
	},

	/** Generic villager for ambient dialog */
	VILLAGER: {
		name: 'Villager',
		portrait: '',
		defaultPosition: 'right',
		description: 'Generic NPC for ambient world-building dialog.',
		voiceNotes: 'Varies by context. Generally informal and concerned about local matters.',
	},

	/** Old Sage / Tutorial NPC */
	OLD_SAGE: {
		name: 'Old Sage',
		portrait: '',
		defaultPosition: 'right',
		description: 'Wise elder who provides guidance and tutorials.',
		voiceNotes: 'Patient and kind. Speaks slowly and deliberately. Uses nature metaphors.',
	},
};

/**
 * Creates a dialog entry in the raw format expected by the game
 */
export function createDialogEntry(config: IDialogEntryConfig): IDialogEntryRaw {
	const position = config.position ?? config.speaker.defaultPosition;
	const isLeft = position === 'left';
	const isRight = position === 'right';

	return {
		message: config.message,
		left: isLeft,
		right: isRight,
		leftName: isLeft ? config.speaker.name : '',
		rightName: isRight ? config.speaker.name : '',
		leftPortraitName: isLeft ? config.speaker.portrait : '',
		rightPortraitName: isRight ? config.speaker.portrait : '',
		leftExit: isLeft && config.exit ? true : undefined,
		rightExit: isRight && config.exit ? true : undefined,
	};
}

/**
 * Creates a complete dialog in the raw format expected by the game
 */
export function createDialog(config: IDialogConfig): IDialogRaw {
	return {
		id: config.id,
		chat: config.entries.map((entry) => createDialogEntry(entry)),
	};
}

/**
 * Creates a simple two-person conversation
 */
export function createConversation(
	id: number,
	speaker1: IDialogCharacter,
	speaker2: IDialogCharacter,
	messages: string[]
): IDialogRaw {
	const entries: IDialogEntryConfig[] = messages.map((message, index) => ({
		speaker: index % 2 === 0 ? speaker1 : speaker2,
		message,
	}));

	return createDialog({ id, entries });
}

/**
 * Creates a monologue (single speaker)
 */
export function createMonologue(id: number, speaker: IDialogCharacter, messages: string[]): IDialogRaw {
	const entries: IDialogEntryConfig[] = messages.map((message) => ({
		speaker,
		message,
	}));

	return createDialog({ id, entries });
}

/**
 * Validation result
 */
export interface IDialogValidationResult {
	valid: boolean;
	errors: string[];
	warnings: string[];
}

/**
 * Maximum recommended message length
 */
export const MAX_MESSAGE_LENGTH = 200;

/**
 * Optimal message length for readability
 */
export const OPTIMAL_MESSAGE_LENGTH = 150;

/**
 * Minimum messages for a meaningful dialog
 */
export const MIN_DIALOG_ENTRIES = 2;

/**
 * Validates a dialog configuration
 */
export function validateDialog(dialog: IDialogRaw, existingIds: number[] = []): IDialogValidationResult {
	const errors: string[] = [];
	const warnings: string[] = [];

	// Check ID
	if (dialog.id <= 0) {
		errors.push('Dialog ID must be positive');
	}

	if (existingIds.includes(dialog.id)) {
		errors.push(`Dialog ID ${dialog.id} is already in use`);
	}

	// Check entries
	if (!dialog.chat || dialog.chat.length === 0) {
		errors.push('Dialog must have at least one entry');
	} else {
		if (dialog.chat.length < MIN_DIALOG_ENTRIES) {
			warnings.push(`Dialog has only ${dialog.chat.length} entry. Consider adding more for depth.`);
		}

		dialog.chat.forEach((entry, index) => {
			// Check message
			if (!entry.message || entry.message.trim() === '') {
				errors.push(`Entry ${index + 1} has empty message`);
			} else if (entry.message.length > MAX_MESSAGE_LENGTH) {
				warnings.push(
					`Entry ${index + 1} message is ${entry.message.length} chars (recommended: <${OPTIMAL_MESSAGE_LENGTH})`
				);
			}

			// Check speaker assignment
			if (!entry.left && !entry.right) {
				errors.push(`Entry ${index + 1} has no speaker position (left or right must be true)`);
			}

			if (entry.left && entry.right) {
				errors.push(`Entry ${index + 1} has both left and right set to true`);
			}

			// Check name matches position
			if (entry.left && !entry.leftName) {
				warnings.push(`Entry ${index + 1} is left-positioned but has no leftName`);
			}

			if (entry.right && !entry.rightName) {
				warnings.push(`Entry ${index + 1} is right-positioned but has no rightName`);
			}
		});

		// Check for alternating speakers (conversational flow)
		let lastPosition: boolean | null = null;
		let samePositionCount = 0;

		dialog.chat.forEach((entry) => {
			if (lastPosition === entry.left) {
				samePositionCount++;
				if (samePositionCount >= 3) {
					warnings.push('Consider alternating speakers more for better conversational flow');
				}
			} else {
				samePositionCount = 0;
			}
			lastPosition = entry.left;
		});
	}

	return {
		valid: errors.length === 0,
		errors,
		warnings,
	};
}

/**
 * Gets the next available dialog ID
 */
export function getNextDialogId(existingDialogs: IDialogRaw[]): number {
	if (existingDialogs.length === 0) return 1;
	const maxId = Math.max(...existingDialogs.map((d) => d.id));
	return maxId + 1;
}

/**
 * Formats an action description for dialog
 * @example formatAction('draws sword') => '*draws sword*'
 */
export function formatAction(action: string): string {
	return `*${action.replace(/^\*|\*$/g, '')}*`;
}

/**
 * Combines regular speech with an action
 * @example withAction('Ready yourself!', 'draws sword') => '*draws sword* Ready yourself!'
 */
export function withAction(message: string, action: string): string {
	return `${formatAction(action)} ${message}`;
}

/**
 * Common dialog patterns for quick creation
 * These return IDialogEntryConfig[] which can be used directly with createDialog
 */
export const DIALOG_PATTERNS = {
	/**
	 * Creates a greeting exchange
	 */
	GREETING: (npc: IDialogCharacter, playerGreeting: string, npcResponse: string): IDialogEntryConfig[] => [
		{ speaker: CHARACTERS.LUCIUS, message: playerGreeting },
		{ speaker: npc, message: npcResponse },
	],

	/**
	 * Creates a farewell exchange
	 */
	FAREWELL: (npc: IDialogCharacter, playerFarewell: string, npcFarewell: string): IDialogEntryConfig[] => [
		{ speaker: CHARACTERS.LUCIUS, message: playerFarewell },
		{ speaker: npc, message: npcFarewell, exit: true },
	],

	/**
	 * Creates an NPC giving information
	 */
	INFO_DUMP: (npc: IDialogCharacter, question: string, infoLines: string[]): IDialogEntryConfig[] => [
		{ speaker: CHARACTERS.LUCIUS, message: question },
		...infoLines.map((info) => ({ speaker: npc, message: info })),
	],

	/**
	 * Creates a tense confrontation
	 */
	CONFRONTATION: (
		enemy: IDialogCharacter,
		playerChallenge: string,
		enemyResponse: string,
		playerReply: string
	): IDialogEntryConfig[] => [
		{ speaker: CHARACTERS.LUCIUS, message: playerChallenge },
		{ speaker: enemy, message: enemyResponse },
		{ speaker: CHARACTERS.LUCIUS, message: playerReply },
	],
};

/**
 * Dialog writing tips checklist
 */
export const WRITING_CHECKLIST = [
	'Does each character have a distinct voice?',
	'Is the message length appropriate for the pacing?',
	'Are action descriptions used sparingly and effectively?',
	'Does the dialog advance the story or reveal character?',
	'Is there a clear emotional arc to the conversation?',
	'Have you avoided excessive exposition dumps?',
	'Does the dialog reference the larger world naturally?',
	'Is the ending satisfying (clear direction or emotional beat)?',
];
