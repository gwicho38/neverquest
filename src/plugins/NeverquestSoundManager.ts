/**
 * @fileoverview Scene audio management for Neverquest
 *
 * This plugin manages audio playback for scenes:
 * - Stops audio when transitioning between scenes
 * - References audio from main scene
 * - Handles audio cleanup
 *
 * Prevents audio overlap issues when switching scenes.
 *
 * @see MainScene - Primary audio source
 * @see HUDScene - Uses sound manager reference
 *
 * @module plugins/NeverquestSoundManager
 */

/**
 * @class
 */
export class NeverquestSoundManager {
	/**
	 * The parent scene of which this manager will be a child.
	 */
	private scene: Phaser.Scene;

	/**
	 * This should be the name of scene that plays the sound you want to stop the audio from.
	 */
	private mainAudioSceneName: string;

	/**
	 * This should be the scene that plays the sound you want to stop the audio from.
	 */
	private mainAudioScene: Phaser.Scene | null;

	/**
	 * This plugin is responsible for managing the audio for a given Scene. Usually the MainScene, but should work for any scene you want.
	 * @param scene The parent scene of which this manager will be a child.
	 */
	constructor(scene: Phaser.Scene) {
		this.scene = scene;
		this.mainAudioSceneName = 'MainScene';
		this.mainAudioScene = null;
	}

	/**
	 * Creates the component dependencies.
	 */
	create(): void {
		this.mainAudioScene = this.scene.scene.get(this.mainAudioSceneName);
	}

	/**
	 * Stops all the audio from the Scene.
	 */
	stopAllAudio(): void {
		if (this.mainAudioScene) {
			this.mainAudioScene.sound.pauseAll();
		}
	}

	/**
	 * Sets the new sound volume.
	 * Ranges from 0 to 1.
	 * @param volume The volume level (0 to 1)
	 */
	setVolume(volume: number): void {
		if (this.mainAudioScene) {
			this.mainAudioScene.sound.volume = volume;
		}
	}

	/**
	 * Returns the volume of the sound.
	 * @returns The current volume level
	 */
	getVolume(): number {
		return this.mainAudioScene!.sound.volume;
	}

	/**
	 * Resumes all the audio from the Scene.
	 */
	resumeAllAudio(): void {
		if (this.mainAudioScene) {
			this.mainAudioScene.sound.resumeAll();
		}
	}
}
