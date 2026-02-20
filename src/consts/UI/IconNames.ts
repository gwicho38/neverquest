/**
 * @fileoverview HUD icon name mappings by platform
 *
 * This file defines icon texture names for different input devices:
 * - Desktop keyboard icons
 * - Xbox controller icons
 * - PlayStation controller icons
 * - Mobile touch icons
 *
 * Used by HUDScene to display context-appropriate button prompts.
 *
 * @see HUDScene - Displays these icons
 * @see NeverquestInterfaceController - Detects input device
 *
 * @module consts/UI/IconNames
 */

export const IconNamesConst = {
	HUDScene: {
		inventory: {
			desktop: 'inventory_shortcut',
			xbox: 'buttonXboxWindows',
			playstation: 'buttonXboxWindows',
			mobile: 'buttonXboxWindows',
		},
		attributes: {
			desktop: 'attributes_shortcut_icon',
			xbox: 'XboxOne_Menu',
			playstation: '',
			mobile: '',
		},
	},
};
