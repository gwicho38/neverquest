/**
 * Tests for DialogTemplate - Dialog writing utilities and guidelines
 */

import {
	DialogTone,
	DialogCategory,
	CHARACTERS,
	createDialogEntry,
	createDialog,
	createConversation,
	createMonologue,
	validateDialog,
	getNextDialogId,
	formatAction,
	withAction,
	DIALOG_PATTERNS,
	MAX_MESSAGE_LENGTH,
	OPTIMAL_MESSAGE_LENGTH,
	MIN_DIALOG_ENTRIES,
	WRITING_CHECKLIST,
	IDialogRaw,
} from '../../../consts/DB_SEED/DialogTemplate';

describe('DialogTemplate', () => {
	describe('DialogTone enum', () => {
		it('should have NEUTRAL tone', () => {
			expect(DialogTone.NEUTRAL).toBe('neutral');
		});

		it('should have THREATENING tone', () => {
			expect(DialogTone.THREATENING).toBe('threatening');
		});

		it('should have SOMBER tone', () => {
			expect(DialogTone.SOMBER).toBe('somber');
		});

		it('should have JOYFUL tone', () => {
			expect(DialogTone.JOYFUL).toBe('joyful');
		});

		it('should have MYSTERIOUS tone', () => {
			expect(DialogTone.MYSTERIOUS).toBe('mysterious');
		});

		it('should have URGENT tone', () => {
			expect(DialogTone.URGENT).toBe('urgent');
		});

		it('should have HUMOROUS tone', () => {
			expect(DialogTone.HUMOROUS).toBe('humorous');
		});
	});

	describe('DialogCategory enum', () => {
		it('should have STORY category', () => {
			expect(DialogCategory.STORY).toBe('story');
		});

		it('should have SIDE_QUEST category', () => {
			expect(DialogCategory.SIDE_QUEST).toBe('side_quest');
		});

		it('should have AMBIENT category', () => {
			expect(DialogCategory.AMBIENT).toBe('ambient');
		});

		it('should have TUTORIAL category', () => {
			expect(DialogCategory.TUTORIAL).toBe('tutorial');
		});

		it('should have MERCHANT category', () => {
			expect(DialogCategory.MERCHANT).toBe('merchant');
		});

		it('should have BOSS category', () => {
			expect(DialogCategory.BOSS).toBe('boss');
		});

		it('should have LORE category', () => {
			expect(DialogCategory.LORE).toBe('lore');
		});
	});

	describe('CHARACTERS', () => {
		it('should have LUCIUS character', () => {
			expect(CHARACTERS.LUCIUS).toBeDefined();
			expect(CHARACTERS.LUCIUS.name).toBe('Lucius');
			expect(CHARACTERS.LUCIUS.defaultPosition).toBe('left');
		});

		it('should have MYSTERIOUS_VOICE character', () => {
			expect(CHARACTERS.MYSTERIOUS_VOICE).toBeDefined();
			expect(CHARACTERS.MYSTERIOUS_VOICE.name).toBe('Mysterious Voice');
			expect(CHARACTERS.MYSTERIOUS_VOICE.defaultPosition).toBe('right');
		});

		it('should have FALLEN_KNIGHT character', () => {
			expect(CHARACTERS.FALLEN_KNIGHT).toBeDefined();
			expect(CHARACTERS.FALLEN_KNIGHT.name).toBe('Fallen Knight');
		});

		it('should have MERCHANT character', () => {
			expect(CHARACTERS.MERCHANT).toBeDefined();
			expect(CHARACTERS.MERCHANT.name).toBe('Wandering Merchant');
		});

		it('should have ORACLE character', () => {
			expect(CHARACTERS.ORACLE).toBeDefined();
			expect(CHARACTERS.ORACLE.name).toBe('Oracle of the Depths');
		});

		it('should have GATE_GUARDIAN character', () => {
			expect(CHARACTERS.GATE_GUARDIAN).toBeDefined();
			expect(CHARACTERS.GATE_GUARDIAN.name).toBe('Gate Guardian');
		});

		it('should have VOID_KING character', () => {
			expect(CHARACTERS.VOID_KING).toBeDefined();
			expect(CHARACTERS.VOID_KING.name).toBe('The Void King');
		});

		it('should have VILLAGER character', () => {
			expect(CHARACTERS.VILLAGER).toBeDefined();
		});

		it('should have OLD_SAGE character', () => {
			expect(CHARACTERS.OLD_SAGE).toBeDefined();
		});

		it('all characters should have required fields', () => {
			Object.values(CHARACTERS).forEach((char) => {
				expect(char).toHaveProperty('name');
				expect(char).toHaveProperty('portrait');
				expect(char).toHaveProperty('defaultPosition');
				expect(char).toHaveProperty('description');
				expect(char).toHaveProperty('voiceNotes');
			});
		});

		it('Lucius should have portrait defined', () => {
			expect(CHARACTERS.LUCIUS.portrait).toBe('lucius_portrait_beard');
		});

		it('mysterious characters should have empty portrait', () => {
			expect(CHARACTERS.MYSTERIOUS_VOICE.portrait).toBe('');
		});
	});

	describe('createDialogEntry', () => {
		it('should create left-positioned entry', () => {
			const entry = createDialogEntry({
				speaker: CHARACTERS.LUCIUS,
				message: 'Hello, world!',
			});

			expect(entry.left).toBe(true);
			expect(entry.right).toBe(false);
			expect(entry.leftName).toBe('Lucius');
			expect(entry.rightName).toBe('');
			expect(entry.message).toBe('Hello, world!');
		});

		it('should create right-positioned entry', () => {
			const entry = createDialogEntry({
				speaker: CHARACTERS.MYSTERIOUS_VOICE,
				message: 'Welcome, traveler.',
			});

			expect(entry.left).toBe(false);
			expect(entry.right).toBe(true);
			expect(entry.leftName).toBe('');
			expect(entry.rightName).toBe('Mysterious Voice');
		});

		it('should use character default position', () => {
			const entry = createDialogEntry({
				speaker: CHARACTERS.LUCIUS,
				message: 'Test',
			});

			expect(entry.left).toBe(true); // LUCIUS defaults to left
		});

		it('should allow position override', () => {
			const entry = createDialogEntry({
				speaker: CHARACTERS.LUCIUS,
				message: 'Test',
				position: 'right',
			});

			expect(entry.left).toBe(false);
			expect(entry.right).toBe(true);
			expect(entry.rightName).toBe('Lucius');
		});

		it('should set portrait for left position', () => {
			const entry = createDialogEntry({
				speaker: CHARACTERS.LUCIUS,
				message: 'Test',
			});

			expect(entry.leftPortraitName).toBe('lucius_portrait_beard');
			expect(entry.rightPortraitName).toBe('');
		});

		it('should set portrait for right position', () => {
			const entry = createDialogEntry({
				speaker: CHARACTERS.LUCIUS,
				message: 'Test',
				position: 'right',
			});

			expect(entry.leftPortraitName).toBe('');
			expect(entry.rightPortraitName).toBe('lucius_portrait_beard');
		});

		it('should set leftExit when exit is true for left position', () => {
			const entry = createDialogEntry({
				speaker: CHARACTERS.LUCIUS,
				message: 'Farewell!',
				exit: true,
			});

			expect(entry.leftExit).toBe(true);
			expect(entry.rightExit).toBeUndefined();
		});

		it('should set rightExit when exit is true for right position', () => {
			const entry = createDialogEntry({
				speaker: CHARACTERS.MERCHANT,
				message: 'Until next time!',
				exit: true,
			});

			expect(entry.leftExit).toBeUndefined();
			expect(entry.rightExit).toBe(true);
		});
	});

	describe('createDialog', () => {
		it('should create dialog with correct ID', () => {
			const dialog = createDialog({
				id: 42,
				entries: [{ speaker: CHARACTERS.LUCIUS, message: 'Hello!' }],
			});

			expect(dialog.id).toBe(42);
		});

		it('should create dialog with multiple entries', () => {
			const dialog = createDialog({
				id: 1,
				entries: [
					{ speaker: CHARACTERS.LUCIUS, message: 'First message' },
					{ speaker: CHARACTERS.MERCHANT, message: 'Second message' },
					{ speaker: CHARACTERS.LUCIUS, message: 'Third message' },
				],
			});

			expect(dialog.chat).toHaveLength(3);
			expect(dialog.chat[0].message).toBe('First message');
			expect(dialog.chat[1].message).toBe('Second message');
			expect(dialog.chat[2].message).toBe('Third message');
		});

		it('should preserve entry order', () => {
			const dialog = createDialog({
				id: 1,
				entries: [
					{ speaker: CHARACTERS.LUCIUS, message: 'A' },
					{ speaker: CHARACTERS.MERCHANT, message: 'B' },
					{ speaker: CHARACTERS.LUCIUS, message: 'C' },
				],
			});

			expect(dialog.chat[0].message).toBe('A');
			expect(dialog.chat[1].message).toBe('B');
			expect(dialog.chat[2].message).toBe('C');
		});
	});

	describe('createConversation', () => {
		it('should create alternating conversation', () => {
			const dialog = createConversation(1, CHARACTERS.LUCIUS, CHARACTERS.MERCHANT, [
				'Hello!',
				'Welcome!',
				'What do you have?',
				'Many fine wares!',
			]);

			expect(dialog.chat).toHaveLength(4);
			expect(dialog.chat[0].left).toBe(true); // Lucius
			expect(dialog.chat[1].right).toBe(true); // Merchant
			expect(dialog.chat[2].left).toBe(true); // Lucius
			expect(dialog.chat[3].right).toBe(true); // Merchant
		});

		it('should use correct speaker names', () => {
			const dialog = createConversation(1, CHARACTERS.LUCIUS, CHARACTERS.ORACLE, [
				'Who are you?',
				'I am the Oracle.',
			]);

			expect(dialog.chat[0].leftName).toBe('Lucius');
			expect(dialog.chat[1].rightName).toBe('Oracle of the Depths');
		});
	});

	describe('createMonologue', () => {
		it('should create single-speaker dialog', () => {
			const dialog = createMonologue(1, CHARACTERS.LUCIUS, [
				'First thought.',
				'Second thought.',
				'Third thought.',
			]);

			expect(dialog.chat).toHaveLength(3);
			dialog.chat.forEach((entry) => {
				expect(entry.leftName).toBe('Lucius');
				expect(entry.left).toBe(true);
			});
		});
	});

	describe('validateDialog', () => {
		const validDialog: IDialogRaw = {
			id: 1,
			chat: [
				{
					message: 'Hello!',
					left: true,
					right: false,
					leftName: 'Lucius',
					rightName: '',
					leftPortraitName: 'lucius_portrait_beard',
					rightPortraitName: '',
				},
				{
					message: 'Welcome!',
					left: false,
					right: true,
					leftName: '',
					rightName: 'Merchant',
					leftPortraitName: '',
					rightPortraitName: '',
				},
			],
		};

		it('should validate correct dialog', () => {
			const result = validateDialog(validDialog);
			expect(result.valid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it('should detect non-positive ID', () => {
			const result = validateDialog({ ...validDialog, id: 0 });
			expect(result.valid).toBe(false);
			expect(result.errors).toContain('Dialog ID must be positive');
		});

		it('should detect duplicate ID', () => {
			const result = validateDialog(validDialog, [1, 2, 3]);
			expect(result.valid).toBe(false);
			expect(result.errors).toContain('Dialog ID 1 is already in use');
		});

		it('should detect empty chat array', () => {
			const result = validateDialog({ id: 1, chat: [] });
			expect(result.valid).toBe(false);
			expect(result.errors).toContain('Dialog must have at least one entry');
		});

		it('should detect empty message', () => {
			const dialog: IDialogRaw = {
				id: 1,
				chat: [
					{
						message: '',
						left: true,
						right: false,
						leftName: 'Lucius',
						rightName: '',
						leftPortraitName: '',
						rightPortraitName: '',
					},
				],
			};
			const result = validateDialog(dialog);
			expect(result.valid).toBe(false);
			expect(result.errors).toContain('Entry 1 has empty message');
		});

		it('should detect missing speaker position', () => {
			const dialog: IDialogRaw = {
				id: 1,
				chat: [
					{
						message: 'Hello',
						left: false,
						right: false,
						leftName: '',
						rightName: '',
						leftPortraitName: '',
						rightPortraitName: '',
					},
				],
			};
			const result = validateDialog(dialog);
			expect(result.valid).toBe(false);
			expect(result.errors).toContain('Entry 1 has no speaker position (left or right must be true)');
		});

		it('should detect both positions set', () => {
			const dialog: IDialogRaw = {
				id: 1,
				chat: [
					{
						message: 'Hello',
						left: true,
						right: true,
						leftName: 'Lucius',
						rightName: 'Merchant',
						leftPortraitName: '',
						rightPortraitName: '',
					},
				],
			};
			const result = validateDialog(dialog);
			expect(result.valid).toBe(false);
			expect(result.errors).toContain('Entry 1 has both left and right set to true');
		});

		it('should warn about long messages', () => {
			const longMessage = 'A'.repeat(MAX_MESSAGE_LENGTH + 10);
			const dialog: IDialogRaw = {
				id: 1,
				chat: [
					{
						message: longMessage,
						left: true,
						right: false,
						leftName: 'Lucius',
						rightName: '',
						leftPortraitName: '',
						rightPortraitName: '',
					},
					{
						message: 'Short',
						left: false,
						right: true,
						leftName: '',
						rightName: 'NPC',
						leftPortraitName: '',
						rightPortraitName: '',
					},
				],
			};
			const result = validateDialog(dialog);
			expect(result.warnings.some((w) => w.includes('chars'))).toBe(true);
		});

		it('should warn about single entry dialog', () => {
			const dialog: IDialogRaw = {
				id: 1,
				chat: [
					{
						message: 'Solo message',
						left: true,
						right: false,
						leftName: 'Lucius',
						rightName: '',
						leftPortraitName: '',
						rightPortraitName: '',
					},
				],
			};
			const result = validateDialog(dialog);
			expect(result.warnings.some((w) => w.includes('only 1 entry'))).toBe(true);
		});

		it('should warn about missing name for position', () => {
			const dialog: IDialogRaw = {
				id: 1,
				chat: [
					{
						message: 'Hello',
						left: true,
						right: false,
						leftName: '', // Missing name!
						rightName: '',
						leftPortraitName: '',
						rightPortraitName: '',
					},
					{
						message: 'Hi',
						left: false,
						right: true,
						leftName: '',
						rightName: 'NPC',
						leftPortraitName: '',
						rightPortraitName: '',
					},
				],
			};
			const result = validateDialog(dialog);
			expect(result.warnings.some((w) => w.includes('no leftName'))).toBe(true);
		});
	});

	describe('getNextDialogId', () => {
		it('should return 1 for empty array', () => {
			expect(getNextDialogId([])).toBe(1);
		});

		it('should return max id + 1', () => {
			const dialogs: IDialogRaw[] = [
				{ id: 1, chat: [] },
				{ id: 5, chat: [] },
				{ id: 3, chat: [] },
			];
			expect(getNextDialogId(dialogs)).toBe(6);
		});

		it('should handle single dialog', () => {
			const dialogs: IDialogRaw[] = [{ id: 10, chat: [] }];
			expect(getNextDialogId(dialogs)).toBe(11);
		});
	});

	describe('formatAction', () => {
		it('should wrap action in asterisks', () => {
			expect(formatAction('draws sword')).toBe('*draws sword*');
		});

		it('should not double-wrap asterisks', () => {
			expect(formatAction('*draws sword*')).toBe('*draws sword*');
		});

		it('should handle single asterisk at start', () => {
			expect(formatAction('*draws sword')).toBe('*draws sword*');
		});

		it('should handle single asterisk at end', () => {
			expect(formatAction('draws sword*')).toBe('*draws sword*');
		});
	});

	describe('withAction', () => {
		it('should combine action and message', () => {
			expect(withAction('Ready yourself!', 'draws sword')).toBe('*draws sword* Ready yourself!');
		});

		it('should handle already-formatted action', () => {
			expect(withAction('Attack!', '*charges*')).toBe('*charges* Attack!');
		});
	});

	describe('DIALOG_PATTERNS', () => {
		describe('GREETING', () => {
			it('should create greeting exchange', () => {
				const entries = DIALOG_PATTERNS.GREETING(CHARACTERS.MERCHANT, 'Hello there!', 'Welcome to my shop!');

				expect(entries).toHaveLength(2);
				expect(entries[0].speaker.name).toBe('Lucius');
				expect(entries[0].message).toBe('Hello there!');
				expect(entries[1].speaker.name).toBe('Wandering Merchant');
				expect(entries[1].message).toBe('Welcome to my shop!');
			});
		});

		describe('FAREWELL', () => {
			it('should create farewell with exit', () => {
				const entries = DIALOG_PATTERNS.FAREWELL(CHARACTERS.MERCHANT, 'Goodbye!', 'Safe travels!');

				expect(entries).toHaveLength(2);
				expect(entries[0].speaker.name).toBe('Lucius');
				expect(entries[1].exit).toBe(true);
			});
		});

		describe('INFO_DUMP', () => {
			it('should create question and info sequence', () => {
				const entries = DIALOG_PATTERNS.INFO_DUMP(CHARACTERS.OLD_SAGE, 'What happened here?', [
					'First, the darkness came.',
					'Then the people fled.',
					'Now only ruins remain.',
				]);

				expect(entries).toHaveLength(4);
				expect(entries[0].speaker.name).toBe('Lucius');
				expect(entries[1].speaker.name).toBe('Old Sage');
				expect(entries[2].speaker.name).toBe('Old Sage');
				expect(entries[3].speaker.name).toBe('Old Sage');
			});
		});

		describe('CONFRONTATION', () => {
			it('should create three-part confrontation', () => {
				const entries = DIALOG_PATTERNS.CONFRONTATION(
					CHARACTERS.VOID_KING,
					'You will not succeed!',
					'Foolish mortal.',
					'We shall see!'
				);

				expect(entries).toHaveLength(3);
				expect(entries[0].speaker.name).toBe('Lucius');
				expect(entries[1].speaker.name).toBe('The Void King');
				expect(entries[2].speaker.name).toBe('Lucius');
			});
		});
	});

	describe('Constants', () => {
		it('should have reasonable MAX_MESSAGE_LENGTH', () => {
			expect(MAX_MESSAGE_LENGTH).toBeGreaterThan(100);
			expect(MAX_MESSAGE_LENGTH).toBeLessThanOrEqual(300);
		});

		it('should have OPTIMAL_MESSAGE_LENGTH less than MAX', () => {
			expect(OPTIMAL_MESSAGE_LENGTH).toBeLessThan(MAX_MESSAGE_LENGTH);
		});

		it('should have MIN_DIALOG_ENTRIES of at least 2', () => {
			expect(MIN_DIALOG_ENTRIES).toBeGreaterThanOrEqual(2);
		});

		it('should have WRITING_CHECKLIST with items', () => {
			expect(WRITING_CHECKLIST.length).toBeGreaterThan(5);
		});
	});

	describe('Integration: Creating a complete dialog', () => {
		it('should create a valid story dialog', () => {
			const dialog = createDialog({
				id: 100,
				category: DialogCategory.STORY,
				tone: DialogTone.MYSTERIOUS,
				entries: [
					{
						speaker: CHARACTERS.LUCIUS,
						message: 'What is this place?',
					},
					{
						speaker: CHARACTERS.MYSTERIOUS_VOICE,
						message: 'A crossroads of fate, where all paths converge.',
					},
					{
						speaker: CHARACTERS.LUCIUS,
						message: 'Who are you?',
					},
					{
						speaker: CHARACTERS.MYSTERIOUS_VOICE,
						message: 'I am but a guide. The choice of path is yours alone.',
					},
				],
			});

			const result = validateDialog(dialog);
			expect(result.valid).toBe(true);
			expect(dialog.chat).toHaveLength(4);
		});

		it('should create a valid merchant dialog', () => {
			const dialog = createDialog({
				id: 101,
				category: DialogCategory.MERCHANT,
				entries: [
					...DIALOG_PATTERNS.GREETING(
						CHARACTERS.MERCHANT,
						'Hello! What do you have for sale?',
						'Ah, a customer! I have many fine wares. Take a look!'
					),
					{
						speaker: CHARACTERS.LUCIUS,
						message: 'I will browse your selection.',
					},
					{
						speaker: CHARACTERS.MERCHANT,
						message: 'Take your time. I am not going anywhere!',
					},
				],
			});

			const result = validateDialog(dialog);
			expect(result.valid).toBe(true);
		});

		it('should create a valid boss encounter dialog', () => {
			const dialog = createDialog({
				id: 102,
				category: DialogCategory.BOSS,
				tone: DialogTone.THREATENING,
				entries: [
					{
						speaker: CHARACTERS.VOID_KING,
						message: withAction('So, the hero arrives at last.', 'emerges from the shadows'),
					},
					{
						speaker: CHARACTERS.LUCIUS,
						message: withAction('Your reign of terror ends here!', 'draws sword'),
					},
					{
						speaker: CHARACTERS.VOID_KING,
						message: 'Brave words from one so insignificant. Let me show you true power!',
					},
				],
			});

			const result = validateDialog(dialog);
			expect(result.valid).toBe(true);
			expect(dialog.chat[0].message).toContain('*emerges from the shadows*');
		});
	});
});
