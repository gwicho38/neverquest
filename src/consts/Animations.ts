/**
 * @fileoverview Animation definitions for all game sprites
 *
 * This file aggregates all sprite animation configurations:
 * - Player animations (walk, attack, idle, etc.)
 * - Enemy animations (Bat, Rat, Ogre)
 * - UI animations (chat bubble)
 *
 * Animations are loaded during PreloadScene.
 *
 * @see PreloadScene - Loads animation data
 * @see NeverquestAnimationManager - Plays animations
 * @see IAnimationConfig - Animation interface
 *
 * @module consts/Animations
 */

import { IAnimationConfig } from '../types';
import { Bat } from './enemies/bat';
import { Ogre } from './enemies/ogre';
import { Rat } from './enemies/rat';
import { Player } from './player/Player';

export const Animations: IAnimationConfig[] = [
	...Bat,
	...Rat,
	...Ogre,
	...Player,

	// Chat iteraction box.
	{
		atlas: 'chat_bubble_animation',
		key: 'chat_bubble_animation',
		frameRate: 3,
		prefix: 'chat_box_',
		start: 1,
		end: 4,
		zeroPad: 2,
		repeat: -1,
	},
];
