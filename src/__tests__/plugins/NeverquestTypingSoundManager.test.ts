import { NeverquestTypingSoundManager } from '../../plugins/NeverquestTypingSoundManager';

describe('NeverquestTypingSoundManager', () => {
	let manager: NeverquestTypingSoundManager;
	let mockScene: any;
	let mockSpaceAudio: any;
	let mockLetterAudios: any[];

	beforeEach(() => {
		mockSpaceAudio = {
			play: jest.fn(),
			volume: 0,
		};

		mockLetterAudios = [
			{ play: jest.fn(), volume: 0 },
			{ play: jest.fn(), volume: 0 },
			{ play: jest.fn(), volume: 0 },
			{ play: jest.fn(), volume: 0 },
			{ play: jest.fn(), volume: 0 },
		];

		let audioIndex = 0;
		mockScene = {
			sound: {
				add: jest.fn((soundName: string) => {
					if (soundName === 'space_sound') {
						return mockSpaceAudio;
					}
					return mockLetterAudios[audioIndex++];
				}),
			},
		};

		manager = new NeverquestTypingSoundManager(mockScene);
	});

	describe('Constructor', () => {
		it('should initialize with correct scene', () => {
			expect(manager['scene']).toBe(mockScene);
		});

		it('should set default spaceSoundName', () => {
			expect(manager['spaceSoundName']).toBe('space_sound');
		});

		it('should initialize spaceAudioManager as null', () => {
			expect(manager['spaceAudioManager']).toBeNull();
		});

		it('should set default typingKeySounds array', () => {
			expect(manager['typingKeySounds']).toEqual([
				'typing_key_01',
				'typing_key_02',
				'typing_key_03',
				'typing_key_04',
				'typing_key_05',
			]);
		});

		it('should initialize letterAudios as empty array', () => {
			expect(manager['letterAudios']).toEqual([]);
		});

		it('should initialize letterTypedIndex as 0', () => {
			expect(manager['letterTypedIndex']).toBe(0);
		});

		it('should set default typingSoundVolume to 0.4', () => {
			expect(manager['typingSoundVolume']).toBe(0.4);
		});
	});

	describe('create', () => {
		it('should create space audio with volume config', () => {
			manager.create();

			expect(mockScene.sound.add).toHaveBeenCalledWith('space_sound', { volume: 0.4 });
		});

		it('should store spaceAudioManager reference', () => {
			manager.create();

			expect(manager['spaceAudioManager']).toBe(mockSpaceAudio);
		});

		it('should set space audio volume via config', () => {
			manager.create();

			// Verify that sound.add was called with volume config for space sound
			expect(mockScene.sound.add).toHaveBeenCalledWith('space_sound', { volume: 0.4 });
		});

		it('should create all 5 letter audios with volume config', () => {
			manager.create();

			expect(mockScene.sound.add).toHaveBeenCalledWith('typing_key_01', { volume: 0.4 });
			expect(mockScene.sound.add).toHaveBeenCalledWith('typing_key_02', { volume: 0.4 });
			expect(mockScene.sound.add).toHaveBeenCalledWith('typing_key_03', { volume: 0.4 });
			expect(mockScene.sound.add).toHaveBeenCalledWith('typing_key_04', { volume: 0.4 });
			expect(mockScene.sound.add).toHaveBeenCalledWith('typing_key_05', { volume: 0.4 });
		});

		it('should store all letter audios in array', () => {
			manager.create();

			expect(manager['letterAudios']).toHaveLength(5);
			expect(manager['letterAudios']).toEqual(mockLetterAudios);
		});

		it('should set volume for all letter audios via config', () => {
			manager.create();

			// Verify that sound.add was called with volume config for each letter sound
			const soundAddCalls = (mockScene.sound.add as jest.Mock).mock.calls;
			const letterSoundCalls = soundAddCalls.filter(
				(call: [string, { volume?: number }]) => call[0] !== 'space_sound'
			);
			letterSoundCalls.forEach((call: [string, { volume?: number }]) => {
				expect(call[1]).toEqual({ volume: 0.4 });
			});
		});

		it('should create total of 6 audio objects', () => {
			manager.create();

			expect(mockScene.sound.add).toHaveBeenCalledTimes(6); // 1 space + 5 letters
		});
	});

	describe('type', () => {
		beforeEach(() => {
			manager.create();
		});

		describe('Space handling', () => {
			it('should play space sound for single space', () => {
				manager.type(' ');

				expect(mockSpaceAudio.play).toHaveBeenCalled();
			});

			it('should play space sound for empty string', () => {
				manager.type('');

				expect(mockSpaceAudio.play).toHaveBeenCalled();
			});

			it('should play space sound for multiple spaces', () => {
				manager.type('   ');

				expect(mockSpaceAudio.play).toHaveBeenCalled();
			});

			it('should not play letter sounds for space', () => {
				manager.type(' ');

				mockLetterAudios.forEach((audio) => {
					expect(audio.play).not.toHaveBeenCalled();
				});
			});
		});

		describe('Letter handling', () => {
			it('should play first letter sound for first letter', () => {
				manager.type('a');

				expect(mockLetterAudios[0].play).toHaveBeenCalled();
			});

			it('should play second letter sound for second letter', () => {
				manager.type('a');
				manager.type('b');

				expect(mockLetterAudios[0].play).toHaveBeenCalled();
				expect(mockLetterAudios[1].play).toHaveBeenCalled();
			});

			it('should cycle through all 5 letter sounds', () => {
				manager.type('a');
				manager.type('b');
				manager.type('c');
				manager.type('d');
				manager.type('e');

				expect(mockLetterAudios[0].play).toHaveBeenCalled();
				expect(mockLetterAudios[1].play).toHaveBeenCalled();
				expect(mockLetterAudios[2].play).toHaveBeenCalled();
				expect(mockLetterAudios[3].play).toHaveBeenCalled();
				expect(mockLetterAudios[4].play).toHaveBeenCalled();
			});

			it('should reset index after 5 letters', () => {
				manager.type('a');
				manager.type('b');
				manager.type('c');
				manager.type('d');
				manager.type('e');
				manager.type('f'); // Should cycle back to index 0

				expect(mockLetterAudios[0].play).toHaveBeenCalledTimes(2);
			});

			it('should not play space sound for letters', () => {
				manager.type('a');

				expect(mockSpaceAudio.play).not.toHaveBeenCalled();
			});

			it('should handle uppercase letters', () => {
				manager.type('A');

				expect(mockLetterAudios[0].play).toHaveBeenCalled();
			});

			it('should handle numbers', () => {
				manager.type('1');

				expect(mockLetterAudios[0].play).toHaveBeenCalled();
			});

			it('should handle special characters', () => {
				manager.type('!');

				expect(mockLetterAudios[0].play).toHaveBeenCalled();
			});
		});

		describe('Index cycling', () => {
			it('should increment letterTypedIndex for each letter', () => {
				expect(manager['letterTypedIndex']).toBe(0);

				manager.type('a');
				expect(manager['letterTypedIndex']).toBe(1);

				manager.type('b');
				expect(manager['letterTypedIndex']).toBe(2);
			});

			it('should reset letterTypedIndex to 0 after 5 letters', () => {
				manager.type('a');
				manager.type('b');
				manager.type('c');
				manager.type('d');
				manager.type('e');

				expect(manager['letterTypedIndex']).toBe(0);
			});

			it('should not change letterTypedIndex for spaces', () => {
				manager.type('a');
				expect(manager['letterTypedIndex']).toBe(1);

				manager.type(' ');
				expect(manager['letterTypedIndex']).toBe(1); // Unchanged
			});
		});
	});

	describe('Integration', () => {
		beforeEach(() => {
			manager.create();
		});

		it('should handle typing a complete sentence', () => {
			const sentence = 'Hello World';

			for (const char of sentence) {
				manager.type(char);
			}

			// "Hello World" has 10 letters and 1 space
			// Letters: H, e, l, l, o, W, o, r, l, d = 10 letters
			// Should play letters: 0, 1, 2, 3, 4, 0, 1, 2, 3, 4
			expect(mockLetterAudios[0].play).toHaveBeenCalledTimes(2); // H, W
			expect(mockLetterAudios[1].play).toHaveBeenCalledTimes(2); // e, o
			expect(mockLetterAudios[2].play).toHaveBeenCalledTimes(2); // l, r
			expect(mockLetterAudios[3].play).toHaveBeenCalledTimes(2); // l, l
			expect(mockLetterAudios[4].play).toHaveBeenCalledTimes(2); // o, d

			// 1 space
			expect(mockSpaceAudio.play).toHaveBeenCalledTimes(1);
		});

		it('should handle multiple spaces in a row', () => {
			manager.type('a');
			manager.type(' ');
			manager.type(' ');
			manager.type(' ');
			manager.type('b');

			expect(mockLetterAudios[0].play).toHaveBeenCalledTimes(1); // a
			expect(mockLetterAudios[1].play).toHaveBeenCalledTimes(1); // b
			expect(mockSpaceAudio.play).toHaveBeenCalledTimes(3);
		});

		it('should maintain correct index through mixed input', () => {
			manager.type('a'); // index -> 1
			manager.type(' '); // index -> 1 (no change)
			manager.type('b'); // index -> 2
			manager.type('c'); // index -> 3

			expect(manager['letterTypedIndex']).toBe(3);
		});

		it('should handle long text with cycling', () => {
			const longText = 'abcdefghijk'; // 11 letters

			for (const char of longText) {
				manager.type(char);
			}

			// After 5 letters, should cycle: a b c d e f g h i j k
			// Indices:                       0 1 2 3 4 0 1 2 3 4 0
			expect(mockLetterAudios[0].play).toHaveBeenCalledTimes(3); // a, f, k
			expect(mockLetterAudios[1].play).toHaveBeenCalledTimes(2); // b, g
			expect(mockLetterAudios[2].play).toHaveBeenCalledTimes(2); // c, h
			expect(mockLetterAudios[3].play).toHaveBeenCalledTimes(2); // d, i
			expect(mockLetterAudios[4].play).toHaveBeenCalledTimes(2); // e, j
		});
	});

	describe('Edge Cases', () => {
		beforeEach(() => {
			manager.create();
		});

		it('should handle tab character as space', () => {
			manager.type('\t');

			// \t when trimmed becomes empty string, so plays space sound
			expect(mockSpaceAudio.play).toHaveBeenCalled();
		});

		it('should handle newline as space', () => {
			manager.type('\n');

			// \n when trimmed becomes empty string, so plays space sound
			expect(mockSpaceAudio.play).toHaveBeenCalled();
		});

		it('should handle empty string with leading/trailing spaces', () => {
			manager.type('  ');

			expect(mockSpaceAudio.play).toHaveBeenCalled();
		});

		it('should handle rapid successive calls', () => {
			for (let i = 0; i < 100; i++) {
				manager.type('a');
			}

			// 100 letters / 5 sounds = 20 times each
			mockLetterAudios.forEach((audio) => {
				expect(audio.play).toHaveBeenCalledTimes(20);
			});
		});
	});
});
