/**
 * @fileoverview Lake view dialog
 *
 * This dialog triggers at scenic lake viewpoints:
 * - Player admires the view
 * - Atmospheric flavor text
 *
 * @see NeverquestDialogBox - Displays dialogs
 * @see Chats - Dialog registry
 *
 * @module consts/DB_SEED/chats/LakeView
 */

export default {
	id: 8,
	chat: [
		{
			leftPortraitName: 'lucius_portrait_beard',
			leftName: 'Lucius',
			left: true,
			message: '- I could stand here ans look at this view all day long.....',
			rightPortraitName: '',
			rightName: '',
			right: false,
		},
	],
};
