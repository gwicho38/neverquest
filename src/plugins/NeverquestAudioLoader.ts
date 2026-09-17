import Phaser from 'phaser';
import { AUDIO_LOADING, IAudioAsset } from '../consts/GameAssets';

function audioContext(scene: Phaser.Scene): AudioContext | undefined {
	return (scene.sound as Phaser.Sound.WebAudioSoundManager | undefined)?.context;
}

function silentBuffer(context: AudioContext): AudioBuffer {
	return context.createBuffer(
		AUDIO_LOADING.silentChannels,
		Math.ceil(context.sampleRate * AUDIO_LOADING.silentSeconds),
		context.sampleRate
	);
}

/** Handle the promise directly: Phaser's callback decoder leaves rejections unhandled. */
export async function decodeGameAudio(context: AudioContext, data: ArrayBuffer, key: string): Promise<AudioBuffer> {
	try {
		return await context.decodeAudioData(data);
	} catch (error) {
		console.warn(AUDIO_LOADING.unavailableMessage, key, error);
		return silentBuffer(context);
	}
}

/** Audio remains part of the preload queue, so scenes start only after decoding finishes. */
export function queueGameAudio(scene: Phaser.Scene, assets: readonly IAudioAsset[]): void {
	const context = audioContext(scene);
	for (const asset of assets) {
		if (!context) {
			// Retain Phaser's no-audio and HTML5 audio paths.
			scene.load.audio(asset.name, asset.audio);
			continue;
		}
		const file = new Phaser.Loader.File(scene.load, {
			type: 'audio',
			key: asset.name,
			url: asset.audio,
			responseType: 'arraybuffer',
		});
		file.cache = scene.cache.audio;
		file.onProcess = (): void => {
			file.state = Phaser.Loader.FILE_PROCESSING;
			void decodeGameAudio(context, file.xhrLoader!.response as ArrayBuffer, asset.name)
				.then((buffer) => {
					file.data = buffer;
					file.onProcessComplete();
				})
				.catch(() => file.onProcessError());
		};
		scene.load.addFile(file);
	}
}

/** Failed downloads also need valid cache entries before menu and gameplay create sounds. */
export function restoreMissingGameAudio(scene: Phaser.Scene, assets: readonly IAudioAsset[]): void {
	const context = audioContext(scene);
	if (!context) return;
	for (const asset of assets) {
		if (scene.cache.audio.exists(asset.name)) continue;
		console.warn(AUDIO_LOADING.unavailableMessage, asset.name);
		scene.cache.audio.add(asset.name, silentBuffer(context));
	}
}
