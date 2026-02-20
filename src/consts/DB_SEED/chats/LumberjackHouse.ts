/**
 * @fileoverview Lumberjack house dialog
 *
 * This dialog triggers at the lumberjack's door:
 * - Indicates the house is locked
 * - Suggests returning later
 *
 * @see NeverquestDialogBox - Displays dialogs
 * @see TownScene - Contains the lumberjack house
 * @see Chats - Dialog registry
 *
 * @module consts/DB_SEED/chats/LumberjackHouse
 */

export default {
	id: 2,
	chat: [
		{
			leftPortraitName: 'lucius_portrait_beard',
			leftName: 'Lucius',
			left: true,
			message: "- The lumberjack's house is closed. I will come back later on.",
			rightPortraitName: '',
			rightName: '',
			right: false,
		},
	],
};
