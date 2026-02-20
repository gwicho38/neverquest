/**
 * @fileoverview Wood logs dialog
 *
 * This dialog triggers near wood log piles:
 * - Observes lumberjack's work
 * - Environmental flavor text
 *
 * @see NeverquestDialogBox - Displays dialogs
 * @see Chats - Dialog registry
 *
 * @module consts/DB_SEED/chats/LogsInfo
 */

export default {
	id: 3,
	chat: [
		{
			leftPortraitName: 'lucius_portrait_beard',
			leftName: 'Lucius',
			left: true,
			message: '- Looks like the lumberjack chops a lot of wood 😆',
			rightPortraitName: '',
			rightName: '',
			right: false,
		},
	],
};
