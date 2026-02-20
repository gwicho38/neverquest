/**
 * @fileoverview Merchant greeting dialog
 *
 * This dialog introduces Zephyr, the traveling merchant:
 * - Offers supplies and information
 * - Reveals bandit camps near Ancient Ruins
 * - Hints about wolves near Forgotten Temple
 * - Foreshadows Ice Peaks and Mount Pyreus biomes
 *
 * @see NeverquestDialogBox - Displays dialogs
 * @see CrossroadsScene - Where the merchant is found
 * @see Chats - Dialog registry
 *
 * @module consts/DB_SEED/chats/MerchantGreeting
 */

export default {
	id: 11,
	chat: [
		{
			leftPortraitName: '',
			leftName: 'Wandering Merchant',
			left: true,
			message:
				"Ah, a customer! Welcome, welcome to Zephyr's Traveling Emporium! I have wares from every corner of the realm.",
			rightPortraitName: 'lucius_portrait_beard',
			rightName: 'Lucius',
			right: false,
		},
		{
			leftPortraitName: '',
			leftName: 'Wandering Merchant',
			left: true,
			message:
				'Potions to mend your wounds, blades to smite your foes, and curiosities that defy explanation. What catches your eye?',
			rightPortraitName: 'lucius_portrait_beard',
			rightName: 'Lucius',
			right: false,
		},
		{
			leftPortraitName: '',
			leftName: 'Wandering Merchant',
			left: false,
			message: "I'm looking for information about the Sunstone fragments. Have you heard anything?",
			rightPortraitName: 'lucius_portrait_beard',
			rightName: 'Lucius',
			right: true,
		},
		{
			leftPortraitName: '',
			leftName: 'Wandering Merchant',
			left: true,
			message:
				'*lowers voice* The Sunstone? Dangerous business, that. The Ancient Ruins to the west are guarded by bandits who worship the fragment there. They call it their "source of power."',
			rightPortraitName: 'lucius_portrait_beard',
			rightName: 'Lucius',
			right: false,
		},
		{
			leftPortraitName: '',
			leftName: 'Wandering Merchant',
			left: true,
			message:
				"As for the Forgotten Temple... I've only heard whispers. Something about wolves that aren't quite natural anymore. But hey, for the right price, I can sell you supplies that might help!",
			rightPortraitName: 'lucius_portrait_beard',
			rightName: 'Lucius',
			right: false,
		},
		{
			leftPortraitName: '',
			leftName: 'Wandering Merchant',
			left: true,
			message:
				'*leans in conspiratorially* I once traded with folk from the Ice Peaks far to the east. Strange lot. Said they guard relics from before the world was warm. The cold there... unnatural.',
			rightPortraitName: 'lucius_portrait_beard',
			rightName: 'Lucius',
			right: false,
		},
		{
			leftPortraitName: '',
			leftName: 'Wandering Merchant',
			left: true,
			message:
				"And if you ever see smoke rising from Mount Pyreus to the south... don't go there. The forgemasters who lived in that volcano haven't been seen in decades. Something drove them out.",
			rightPortraitName: 'lucius_portrait_beard',
			rightName: 'Lucius',
			right: false,
		},
		{
			leftPortraitName: '',
			leftName: 'Wandering Merchant',
			left: false,
			message: 'I appreciate the information. I may need those supplies.',
			rightPortraitName: 'lucius_portrait_beard',
			rightName: 'Lucius',
			right: true,
		},
		{
			leftPortraitName: '',
			leftName: 'Wandering Merchant',
			left: true,
			leftExit: false,
			message:
				"Excellent! Come back anytime, friend. And... be careful out there. The roads aren't as safe as they used to be.",
			rightPortraitName: '',
			rightName: '',
			right: false,
			rightExit: false,
		},
	],
};
