/**
 * @fileoverview Gate Guardian dialog
 *
 * This dialog blocks access to the Dark Lands:
 * - Explains Sunstone seal requirement
 * - Hints at Lucius's mysterious connection to darkness
 * - Warns of no return once gate is opened
 * - Foreshadows Underwater and Sky biomes
 *
 * Acts as the gatekeeper for Act 3 content.
 *
 * @see NeverquestDialogBox - Displays dialogs
 * @see CrossroadsScene - Where the gate is located
 * @see Chats - Dialog registry
 *
 * @module consts/DB_SEED/chats/GateGuardian
 */

export default {
	id: 14,
	chat: [
		{
			leftPortraitName: 'lucius_portrait_beard',
			leftName: 'Lucius',
			left: true,
			message:
				'*approaches a massive stone gate shrouded in darkness* This must be the entrance to the Dark Lands. The air itself feels heavy with malice.',
			rightPortraitName: '',
			rightName: '',
			right: false,
		},
		{
			leftPortraitName: '',
			leftName: 'Gate Guardian',
			left: false,
			message:
				'*a spectral figure materializes before the gate* HALT, MORTAL. None may pass through the Gate of Shadows without the blessing of light.',
			rightPortraitName: '',
			rightName: '',
			right: true,
		},
		{
			leftPortraitName: 'lucius_portrait_beard',
			leftName: 'Lucius',
			left: true,
			message: 'I seek the Void King. I have business with him.',
			rightPortraitName: '',
			rightName: '',
			right: false,
		},
		{
			leftPortraitName: '',
			leftName: 'Gate Guardian',
			left: false,
			message:
				'*laughs, a sound like grinding stone* Business? With the Lord of Darkness? You are either very brave or very foolish. Perhaps both.',
			rightPortraitName: '',
			rightName: '',
			right: true,
		},
		{
			leftPortraitName: '',
			leftName: 'Gate Guardian',
			left: false,
			message:
				'This gate has stood sealed for a thousand years, bound by the power of the Sunstone. Only when its three fragments are reunited can the seal be broken.',
			rightPortraitName: '',
			rightName: '',
			right: true,
		},
		{
			leftPortraitName: 'lucius_portrait_beard',
			leftName: 'Lucius',
			left: true,
			message: 'I am gathering the fragments now. I will return when I have them all.',
			rightPortraitName: '',
			rightName: '',
			right: false,
		},
		{
			leftPortraitName: '',
			leftName: 'Gate Guardian',
			left: false,
			message:
				'*studies Lucius intently* There is something... familiar about you, mortal. A shadow within a light, or perhaps a light within a shadow.',
			rightPortraitName: '',
			rightName: '',
			right: true,
		},
		{
			leftPortraitName: '',
			leftName: 'Gate Guardian',
			left: false,
			message:
				'*begins to fade* When you have gathered all three fragments, return here. But know this: once you pass through this gate, there is no turning back. The Void King does not release his guests.',
			rightPortraitName: '',
			rightName: '',
			right: true,
		},
		{
			leftPortraitName: '',
			leftName: 'Gate Guardian',
			left: false,
			message:
				'*pauses* A warning, mortal. The Void King is not the only ancient power stirring. The Drowned Gods beneath the western seas... their temples have begun to glow again.',
			rightPortraitName: '',
			rightName: '',
			right: true,
		},
		{
			leftPortraitName: '',
			leftName: 'Gate Guardian',
			left: false,
			message:
				'And the Sky Lords above... their floating islands have descended closer to the earth than they have in millennia. Something awakens the old powers. You may be needed elsewhere, after.',
			rightPortraitName: '',
			rightName: '',
			right: true,
		},
		{
			leftPortraitName: 'lucius_portrait_beard',
			leftName: 'Lucius',
			left: true,
			leftExit: false,
			message:
				'*clenches fist* Then I will make sure I am ready. The darkness will not claim this world. Not while I draw breath.',
			rightPortraitName: '',
			rightName: '',
			right: false,
			rightExit: false,
		},
	],
};
