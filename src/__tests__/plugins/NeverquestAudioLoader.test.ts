import Phaser from 'phaser';
import { decodeGameAudio, restoreMissingGameAudio } from '../../plugins/NeverquestAudioLoader';

describe('optional game audio', () => {
	const silent = { duration: 1 } as AudioBuffer;
	const decoded = { duration: 81 } as AudioBuffer;
	let context: AudioContext;
	let warning: jest.SpyInstance;

	beforeEach(() => {
		context = {
			sampleRate: 48000,
			decodeAudioData: jest.fn().mockResolvedValue(decoded),
			createBuffer: jest.fn().mockReturnValue(silent),
		} as unknown as AudioContext;
		warning = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
	});
	afterEach(() => warning.mockRestore());

	it('preserves successfully decoded sound', async () => {
		expect(await decodeGameAudio(context, new ArrayBuffer(8), 'forest')).toBe(decoded);
		expect(context.createBuffer).not.toHaveBeenCalled();
		expect(warning).not.toHaveBeenCalled();
	});

	it('handles a rejected decoding promise and returns a playable silent buffer', async () => {
		(context.decodeAudioData as jest.Mock).mockRejectedValue(
			new DOMException('Unknown content type', 'EncodingError')
		);
		expect(await decodeGameAudio(context, new ArrayBuffer(8), 'forest')).toBe(silent);
		expect(context.createBuffer).toHaveBeenCalledWith(1, 48000, 48000);
		expect(warning).toHaveBeenCalledWith(expect.any(String), 'forest', expect.any(Error));
	});

	it('repairs missing downloads without replacing healthy audio cache entries', () => {
		const cache = new Map<string, AudioBuffer>([['menu_navigation', decoded]]);
		const scene = {
			sound: { context },
			cache: {
				audio: {
					exists: (key: string) => cache.has(key),
					add: (key: string, data: AudioBuffer) => cache.set(key, data),
				},
			},
		} as unknown as Phaser.Scene;
		restoreMissingGameAudio(scene, [
			{ name: 'forest', audio: 'forest.mp3' },
			{ name: 'menu_navigation', audio: 'menu.mp3' },
		]);
		expect(cache.get('forest')).toBe(silent);
		expect(cache.get('menu_navigation')).toBe(decoded);
	});
});
