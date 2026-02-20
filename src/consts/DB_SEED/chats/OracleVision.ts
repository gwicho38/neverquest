/**
 * @fileoverview Oracle vision dialog
 *
 * This dialog reveals prophecies from the Oracle of the Depths:
 * - Three possible endings (Light, Sacrifice, Hidden)
 * - Hints about Lucius's true origin
 * - Foreshadows future biomes (Ice, Volcano, Underwater, Sky)
 *
 * Key story exposition for Act 2 and future content.
 *
 * @see NeverquestDialogBox - Displays dialogs
 * @see CrossroadsScene - Where the Oracle is found
 * @see Chats - Dialog registry
 *
 * @module consts/DB_SEED/chats/OracleVision
 */

export default {
	id: 13,
	chat: [
		{
			leftPortraitName: 'lucius_portrait_beard',
			leftName: 'Lucius',
			left: true,
			message:
				'*approaches a shimmering pool of water* This must be where the Oracle resides. The water... it glows with an otherworldly light.',
			rightPortraitName: '',
			rightName: '',
			right: false,
		},
		{
			leftPortraitName: '',
			leftName: 'Oracle of the Depths',
			left: false,
			message:
				'*voice echoes from the pool* I have been waiting for you, child of two times. The one who walks between moments.',
			rightPortraitName: '',
			rightName: '',
			right: true,
		},
		{
			leftPortraitName: 'lucius_portrait_beard',
			leftName: 'Lucius',
			left: true,
			message: 'You know of my encounter with my future self? How is that possible?',
			rightPortraitName: '',
			rightName: '',
			right: false,
		},
		{
			leftPortraitName: '',
			leftName: 'Oracle of the Depths',
			left: false,
			message:
				'I see all that was, all that is, and all that may yet be. Your path is not fixed, Lucius. The future your elder self came from... it is but one possibility.',
			rightPortraitName: '',
			rightName: '',
			right: true,
		},
		{
			leftPortraitName: '',
			leftName: 'Oracle of the Depths',
			left: false,
			message:
				'*the water ripples, showing visions* I see three paths before you: The Path of Light, where you restore the Sunstone and become a beacon against the darkness...',
			rightPortraitName: '',
			rightName: '',
			right: true,
		},
		{
			leftPortraitName: '',
			leftName: 'Oracle of the Depths',
			left: false,
			message:
				'The Path of Sacrifice, where you use your own life force to seal the Void King forever, saving the realm but losing yourself...',
			rightPortraitName: '',
			rightName: '',
			right: true,
		},
		{
			leftPortraitName: '',
			leftName: 'Oracle of the Depths',
			left: false,
			message:
				'And the Hidden Path... *the water grows dark* This one is shrouded even from my sight. It speaks of your true origin, Lucius. You are not what you believe yourself to be.',
			rightPortraitName: '',
			rightName: '',
			right: true,
		},
		{
			leftPortraitName: 'lucius_portrait_beard',
			leftName: 'Lucius',
			left: true,
			message: 'My true origin? What do you mean? I must know!',
			rightPortraitName: '',
			rightName: '',
			right: false,
		},
		{
			leftPortraitName: '',
			leftName: 'Oracle of the Depths',
			left: false,
			message:
				'*the pool begins to fade* The answers lie in the Dark Citadel, in the throne room of the Void King himself. But be warned... the truth may shatter everything you believe.',
			rightPortraitName: '',
			rightName: '',
			right: true,
		},
		{
			leftPortraitName: '',
			leftName: 'Oracle of the Depths',
			left: false,
			message:
				'*the water swirls, showing distant lands* But your journey extends far beyond this realm, Lucius. I see frozen peaks where ancient ice holds secrets older than time itself...',
			rightPortraitName: '',
			rightName: '',
			right: true,
		},
		{
			leftPortraitName: '',
			leftName: 'Oracle of the Depths',
			left: false,
			message:
				'*flames flicker across the pool* A mountain that breathes fire, its heart holding a power that could forge or destroy worlds. The Volcano of Ash awaits a worthy challenger...',
			rightPortraitName: '',
			rightName: '',
			right: true,
		},
		{
			leftPortraitName: '',
			leftName: 'Oracle of the Depths',
			left: false,
			message:
				'*the water deepens, showing an underwater temple* Beneath the waves, the Temple of the Drowned Gods slumbers. There, the old magic still flows through coral halls...',
			rightPortraitName: '',
			rightName: '',
			right: true,
		},
		{
			leftPortraitName: '',
			leftName: 'Oracle of the Depths',
			left: false,
			message:
				'*clouds form in the vision* And above all, the Sky Islands float eternal, home to those who touched the heavens and found them wanting. Their crystals pulse with forgotten power...',
			rightPortraitName: '',
			rightName: '',
			right: true,
		},
		{
			leftPortraitName: 'lucius_portrait_beard',
			leftName: 'Lucius',
			left: true,
			message: 'These places... they are real? I may need to journey there?',
			rightPortraitName: '',
			rightName: '',
			right: false,
		},
		{
			leftPortraitName: '',
			leftName: 'Oracle of the Depths',
			left: false,
			message:
				'*nods slowly* When the Void King falls, these lands will call to you. Each holds a piece of a greater puzzle... a threat that makes even the darkness tremble.',
			rightPortraitName: '',
			rightName: '',
			right: true,
		},
		{
			leftPortraitName: '',
			leftName: 'Oracle of the Depths',
			left: false,
			leftExit: false,
			message:
				'*voice fading* Seek the fragments. Restore the Sunstone. And when you face the Void King... remember that light and shadow are but two sides of the same coin...',
			rightPortraitName: '',
			rightName: '',
			right: true,
			rightExit: false,
		},
	],
};
