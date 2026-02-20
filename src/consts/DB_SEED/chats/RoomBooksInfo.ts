/**
 * @fileoverview Room books dialog
 *
 * This dialog triggers near bookshelves:
 * - Mentions an unread book
 * - References missing glasses item
 *
 * @see NeverquestDialogBox - Displays dialogs
 * @see Chats - Dialog registry
 *
 * @module consts/DB_SEED/chats/RoomBooksInfo
 */

export default {
	id: 4,
	chat: [
		{
			leftPortraitName: 'lucius_portrait_beard',
			leftName: 'Lucius',
			left: true,
			message:
				"- There is only one book here that I haven't read. I will come back here to read it once I'm able to find my glasses.",
			rightPortraitName: '',
			rightName: '',
			right: false,
		},
	],
};
