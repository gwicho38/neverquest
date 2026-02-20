/**
 * @fileoverview Fallen Knight encounter dialog
 *
 * This dialog introduces Sir Aldric, a potential ally:
 * - Former Knight of the Dawn Order
 * - Failed to protect the Sunstone
 * - Offers guidance to Ancient Ruins
 * - Choice-driven ally recruitment
 *
 * Story: A redemption arc for players to befriend.
 *
 * @see NeverquestDialogBox - Displays dialogs
 * @see CrossroadsScene - Where he is found
 * @see Chats - Dialog registry
 *
 * @module consts/DB_SEED/chats/FallenKnightEncounter
 */

export default {
	id: 12,
	chat: [
		{
			leftPortraitName: 'lucius_portrait_beard',
			leftName: 'Lucius',
			left: true,
			message:
				'*notices a figure slumped against a tree* Are you alright? You look like you have seen better days.',
			rightPortraitName: '',
			rightName: '',
			right: false,
		},
		{
			leftPortraitName: '',
			leftName: 'Fallen Knight',
			left: false,
			message:
				'*looks up with weary eyes* Better days... yes, I remember those. Before I failed my oath. Before the darkness took everything.',
			rightPortraitName: '',
			rightName: '',
			right: true,
		},
		{
			leftPortraitName: 'lucius_portrait_beard',
			leftName: 'Lucius',
			left: true,
			message: 'What happened to you? Who are you?',
			rightPortraitName: '',
			rightName: '',
			right: false,
		},
		{
			leftPortraitName: '',
			leftName: 'Fallen Knight',
			left: false,
			message:
				'I was Sir Aldric, Knight of the Dawn Order. We were the guardians of the Sunstone. When it shattered, we were supposed to protect the fragments. But I... I ran. I left my brothers to die.',
			rightPortraitName: '',
			rightName: '',
			right: true,
		},
		{
			leftPortraitName: 'lucius_portrait_beard',
			leftName: 'Lucius',
			left: true,
			message:
				"The Sunstone... I'm searching for its fragments. Perhaps you could help me find them? It's not too late to redeem yourself.",
			rightPortraitName: '',
			rightName: '',
			right: false,
		},
		{
			leftPortraitName: '',
			leftName: 'Fallen Knight',
			left: false,
			message:
				'*stands slowly* Redemption? After what I have done? *pauses* And yet... if the fragments could be reunited, perhaps the darkness could still be stopped.',
			rightPortraitName: '',
			rightName: '',
			right: true,
		},
		{
			leftPortraitName: '',
			leftName: 'Fallen Knight',
			left: false,
			message:
				'Very well, stranger. I know the location of the Ancient Ruins where one fragment lies. The path is dangerous, but I can guide you through the safest route. Will you trust a fallen knight?',
			rightPortraitName: '',
			rightName: '',
			right: true,
		},
		{
			leftPortraitName: 'lucius_portrait_beard',
			leftName: 'Lucius',
			left: true,
			message: "Everyone deserves a chance at redemption. Let's face this darkness together.",
			rightPortraitName: '',
			rightName: '',
			right: false,
		},
		{
			leftPortraitName: '',
			leftName: 'Fallen Knight',
			left: false,
			leftExit: false,
			message:
				"*nods solemnly* Then so be it. The ruins lie to the west. But first, you'll need to deal with the bandits who have made camp along the path. They serve the Shadow now.",
			rightPortraitName: '',
			rightName: '',
			right: true,
			rightExit: false,
		},
	],
};
