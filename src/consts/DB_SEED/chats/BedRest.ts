/**
 * @fileoverview Bed rest dialog
 *
 * This dialog triggers when interacting with a bed:
 * - Player cannot rest until dungeon is cleared
 * - Mentions east side dungeon monsters
 *
 * @see NeverquestDialogBox - Displays dialogs
 * @see Chats - Dialog registry
 *
 * @module consts/DB_SEED/chats/BedRest
 */

export default {
	id: 5,
	chat: [
		{
			leftPortraitName: 'lucius_portrait_beard',
			leftName: 'Lucius',
			left: true,
			message: '- I can only rest once I clear all the monster in the dungeon inside the east side dungeon.',
			rightPortraitName: '',
			rightName: '',
			right: false,
		},
	],
};
