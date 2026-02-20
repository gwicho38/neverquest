/**
 * @fileoverview Dungeon entrance warning dialog
 *
 * This dialog triggers near dungeon holes:
 * - Warns player about falling hazard
 * - Hints at dungeon below
 *
 * @see NeverquestDialogBox - Displays dialogs
 * @see DungeonScene - The dungeon area
 * @see Chats - Dialog registry
 *
 * @module consts/DB_SEED/chats/DungeonEntrance
 */

export default {
	id: 9,
	chat: [
		{
			leftPortraitName: 'lucius_portrait_beard',
			leftName: 'Lucius',
			left: true,
			message: 'Be careful not to fall in this hole! They say there is a dungeon down there.',
			rightPortraitName: '',
			rightName: '',
			right: false,
		},
	],
};
