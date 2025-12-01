import { AudioValues } from '../consts/Numbers';
import { Characters } from '../consts/Messages';

/**
 * @class
 */
export class NeverquestTypingSoundManager {
	/**
	 * The scene that will be used to create objects and play the typing sounds
	 */
	private scene: Phaser.Scene;

	/**
	 * Typing space sound. This audio should already be loaded previously.
	 */
	private spaceSoundName: string;

	/**
	 * The audio manager for space sounds
	 */
	private spaceAudioManager: Phaser.Sound.BaseSound | null;

	/**
	 * Array of the names of the sounds that will play while typing actual letters.
	 */
	private typingKeySounds: string[];

	/**
	 * An Array of Phaser Audio that will play the specific audios.
	 */
	private letterAudios: Phaser.Sound.BaseSound[];

	/**
	 * The Current letter typed index.
	 */
	private letterTypedIndex: number;

	/**
	 * The Volume intensity of the typing sound effect.
	 */
	private typingSoundVolume: number;

	/**
	 * This class is responsible for creating sound effects for the Typing effects from the Dialog.
	 * @param scene Scene that this Sound Manager will be a child.
	 */
	constructor(scene: Phaser.Scene) {
		this.scene = scene;
		this.spaceSoundName = 'space_sound';
		this.spaceAudioManager = null;
		this.typingKeySounds = ['typing_key_01', 'typing_key_02', 'typing_key_03', 'typing_key_04', 'typing_key_05'];
		this.letterAudios = [];
		this.letterTypedIndex = 0;
		this.typingSoundVolume = AudioValues.VOLUME_TYPING_SOUND;
	}

	/**
	 * Creates all the audios to play when the dialog scene is typing a text.
	 */
	create(): void {
		this.spaceAudioManager = this.scene.sound.add(this.spaceSoundName);
		(this.spaceAudioManager as any).volume = this.typingSoundVolume;
		for (let i = 0; i < this.typingKeySounds.length; i++) {
			const audio = this.scene.sound.add(this.typingKeySounds[i]);
			(audio as any).volume = this.typingSoundVolume;
			this.letterAudios.push(audio);
		}
	}

	/**
	 * Play a sound when the letter is being typed by the game.
	 * @param letter Can be either a letter or space.
	 */
	type(letter: string): void {
		// If its Space or empty, plays the space sound.
		if (letter.trim() === Characters.EMPTY_STRING || letter.trim() === Characters.SPACE) {
			this.spaceAudioManager!.play();
		} else {
			// If its a letter, then play one of the letter sounds.
			this.letterAudios[this.letterTypedIndex].play();
			this.letterTypedIndex++;
			if (this.letterTypedIndex === this.letterAudios.length) {
				this.letterTypedIndex = 0;
			}
		}
	}
}
