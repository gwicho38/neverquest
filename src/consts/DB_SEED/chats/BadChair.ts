/**
 * @fileoverview Bad chair interaction dialog
 *
 * This dialog triggers when interacting with a weak chair:
 * - Player observes the chair is unstable
 * - Decides not to sit on it
 *
 * @see NeverquestDialogBox - Displays dialogs
 * @see Chats - Dialog registry
 *
 * @module consts/DB_SEED/chats/BadChair
 */

export default {
	id: 6,
	chat: [
		{
			leftPortraitName: 'lucius_portrait_beard',
			leftName: 'Lucius',
			left: true,
			message: "- This is a weak chair. I think it's better not to sit on it.",
			rightPortraitName: '',
			rightName: '',
			right: false,
		},
	],
};
