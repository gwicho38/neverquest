/**
 * @fileoverview House plates dialog
 *
 * This dialog triggers when interacting with house plates:
 * - Player comments on cleanliness
 * - Environmental flavor text
 *
 * @see NeverquestDialogBox - Displays dialogs
 * @see Chats - Dialog registry
 *
 * @module consts/DB_SEED/chats/HousePlates
 */

export default {
	id: 7,
	chat: [
		{
			leftPortraitName: 'lucius_portrait_beard',
			leftName: 'Lucius',
			left: true,
			message: "- I'm so glad the house is clean and organized.",
			rightPortraitName: '',
			rightName: '',
			right: false,
		},
	],
};
