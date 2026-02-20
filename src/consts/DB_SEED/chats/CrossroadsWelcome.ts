/**
 * @fileoverview Crossroads welcome dialog
 *
 * This dialog plays when entering the Crossroads hub area:
 * - Introduces the Mysterious Voice
 * - Reveals the Sunstone quest (3 fragments)
 * - Sets up Act 2 objectives
 *
 * Connects Future Lucius prophecy to main quest.
 *
 * @see NeverquestDialogBox - Displays dialogs
 * @see CrossroadsScene - The hub area
 * @see Chats - Dialog registry
 *
 * @module consts/DB_SEED/chats/CrossroadsWelcome
 */

export default {
	id: 10,
	chat: [
		{
			leftPortraitName: 'lucius_portrait_beard',
			leftName: 'Lucius',
			left: true,
			message:
				'This place... it feels different. The paths stretch in every direction, and the air carries whispers of distant lands.',
			rightPortraitName: '',
			rightName: '',
			right: false,
		},
		{
			leftPortraitName: '',
			leftName: 'Mysterious Voice',
			left: false,
			message:
				'You have arrived at the Crossroads, traveler. Here, all paths converge and all destinies intertwine.',
			rightPortraitName: '',
			rightName: '',
			right: true,
		},
		{
			leftPortraitName: 'lucius_portrait_beard',
			leftName: 'Lucius',
			left: true,
			message: 'Who speaks? Show yourself!',
			rightPortraitName: '',
			rightName: '',
			right: false,
		},
		{
			leftPortraitName: '',
			leftName: 'Mysterious Voice',
			left: false,
			message:
				'In time, seeker. First, you must prove your worth. The Sunstone has been shattered, its fragments scattered across the realm. Without it, the darkness will consume all.',
			rightPortraitName: '',
			rightName: '',
			right: true,
		},
		{
			leftPortraitName: 'lucius_portrait_beard',
			leftName: 'Lucius',
			left: true,
			message: 'The Sunstone... My future self mentioned a great treasure. Could this be what he meant?',
			rightPortraitName: '',
			rightName: '',
			right: false,
		},
		{
			leftPortraitName: '',
			leftName: 'Mysterious Voice',
			left: false,
			message:
				'Three fragments lie hidden: one in the Ancient Ruins to the west, one in the Forgotten Temple beyond the mountains, and one... one guards the gate to the Dark Lands itself.',
			rightPortraitName: '',
			rightName: '',
			right: true,
		},
		{
			leftPortraitName: 'lucius_portrait_beard',
			leftName: 'Lucius',
			left: true,
			message: 'Then I know what I must do. I will find these fragments and restore the Sunstone.',
			rightPortraitName: '',
			rightName: '',
			right: false,
		},
	],
};
