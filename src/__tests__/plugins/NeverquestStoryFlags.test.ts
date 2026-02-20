import { NeverquestStoryFlags, StoryFlag } from '../../plugins/NeverquestStoryFlags';

// Mock localStorage
const localStorageMock = (() => {
	let store: Record<string, string> = {};
	return {
		getItem: jest.fn((key: string) => store[key] || null),
		setItem: jest.fn((key: string, value: string) => {
			store[key] = value;
		}),
		removeItem: jest.fn((key: string) => {
			delete store[key];
		}),
		clear: jest.fn(() => {
			store = {};
		}),
	};
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// Mock Phaser Scene
const mockScene = {
	events: {
		emit: jest.fn(),
	},
} as unknown as Phaser.Scene;

describe('NeverquestStoryFlags', () => {
	let storyFlags: NeverquestStoryFlags;

	beforeEach(() => {
		localStorageMock.clear();
		jest.clearAllMocks();
		storyFlags = new NeverquestStoryFlags(mockScene);
	});

	describe('Basic Flag Operations', () => {
		it('should set and check flags', () => {
			expect(storyFlags.hasFlag(StoryFlag.INTRO_COMPLETE)).toBe(false);
			storyFlags.setFlag(StoryFlag.INTRO_COMPLETE);
			expect(storyFlags.hasFlag(StoryFlag.INTRO_COMPLETE)).toBe(true);
		});

		it('should clear flags', () => {
			storyFlags.setFlag(StoryFlag.MET_ELDER);
			expect(storyFlags.hasFlag(StoryFlag.MET_ELDER)).toBe(true);
			storyFlags.clearFlag(StoryFlag.MET_ELDER);
			expect(storyFlags.hasFlag(StoryFlag.MET_ELDER)).toBe(false);
		});

		it('should get all flags', () => {
			storyFlags.setFlag(StoryFlag.INTRO_COMPLETE);
			storyFlags.setFlag(StoryFlag.MET_FALLEN_KNIGHT);
			const allFlags = storyFlags.getAllFlags();
			expect(allFlags).toContain(StoryFlag.INTRO_COMPLETE);
			expect(allFlags).toContain(StoryFlag.MET_FALLEN_KNIGHT);
			expect(allFlags.length).toBe(2);
		});
	});

	describe('Story Choices', () => {
		it('should record choices', () => {
			storyFlags.recordChoice('help_knight', 'Decided to help the fallen knight', ['knight_ally']);
			expect(storyFlags.hasChoice('help_knight')).toBe(true);
			expect(storyFlags.hasChoice('abandon_knight')).toBe(false);
		});

		it('should get all choices', () => {
			storyFlags.recordChoice('choice1', 'First choice', []);
			storyFlags.recordChoice('choice2', 'Second choice', ['consequence']);
			const choices = storyFlags.getChoices();
			expect(choices.length).toBe(2);
			expect(choices[0].id).toBe('choice1');
			expect(choices[1].consequences).toContain('consequence');
		});
	});

	describe('Fragment Collection', () => {
		it('should track fragment count', () => {
			expect(storyFlags.getFragmentCount()).toBe(0);
			storyFlags.setFlag(StoryFlag.FRAGMENT_RUINS_OBTAINED);
			expect(storyFlags.getFragmentCount()).toBe(1);
			storyFlags.setFlag(StoryFlag.FRAGMENT_TEMPLE_OBTAINED);
			expect(storyFlags.getFragmentCount()).toBe(2);
			storyFlags.setFlag(StoryFlag.FRAGMENT_GATE_OBTAINED);
			expect(storyFlags.getFragmentCount()).toBe(3);
		});

		it('should check if all fragments collected', () => {
			expect(storyFlags.hasAllFragments()).toBe(false);
			storyFlags.setFlag(StoryFlag.FRAGMENT_RUINS_OBTAINED);
			storyFlags.setFlag(StoryFlag.FRAGMENT_TEMPLE_OBTAINED);
			expect(storyFlags.hasAllFragments()).toBe(false);
			storyFlags.setFlag(StoryFlag.FRAGMENT_GATE_OBTAINED);
			expect(storyFlags.hasAllFragments()).toBe(true);
		});
	});

	describe('Dark Gate Access', () => {
		it('should not open dark gate without all fragments', () => {
			expect(storyFlags.canOpenDarkGate()).toBe(false);
			storyFlags.setFlag(StoryFlag.FRAGMENT_RUINS_OBTAINED);
			storyFlags.setFlag(StoryFlag.FRAGMENT_TEMPLE_OBTAINED);
			storyFlags.setFlag(StoryFlag.FRAGMENT_GATE_OBTAINED);
			expect(storyFlags.canOpenDarkGate()).toBe(false); // Still need sunstone restored
		});

		it('should open dark gate when sunstone restored', () => {
			storyFlags.setFlag(StoryFlag.FRAGMENT_RUINS_OBTAINED);
			storyFlags.setFlag(StoryFlag.FRAGMENT_TEMPLE_OBTAINED);
			storyFlags.setFlag(StoryFlag.FRAGMENT_GATE_OBTAINED);
			storyFlags.setFlag(StoryFlag.SUNSTONE_RESTORED);
			expect(storyFlags.canOpenDarkGate()).toBe(true);
		});
	});

	describe('Act Progression', () => {
		it('should start in Act 1', () => {
			expect(storyFlags.getCurrentAct()).toBe(1);
		});

		it('should progress to Act 2 when entering crossroads', () => {
			storyFlags.setFlag(StoryFlag.ENTERED_CROSSROADS);
			expect(storyFlags.getCurrentAct()).toBe(2);
		});

		it('should progress to Act 3 when dark gate opened', () => {
			storyFlags.setFlag(StoryFlag.ENTERED_CROSSROADS);
			storyFlags.setFlag(StoryFlag.DARK_GATE_OPENED);
			expect(storyFlags.getCurrentAct()).toBe(3);
		});
	});

	describe('Ending Paths', () => {
		it('should return undetermined for new game', () => {
			expect(storyFlags.getCurrentEndingPath()).toBe('undetermined');
		});

		it('should track heroic path after sunstone restored', () => {
			storyFlags.setFlag(StoryFlag.SUNSTONE_RESTORED);
			expect(storyFlags.getCurrentEndingPath()).toBe('heroic');
		});

		it('should track sacrifice path when choice made', () => {
			storyFlags.recordChoice('offer_self_to_seal_darkness', 'Offered to sacrifice self', []);
			expect(storyFlags.getCurrentEndingPath()).toBe('sacrifice');
		});

		it('should track hidden path when seeking true origin', () => {
			storyFlags.setFlag(StoryFlag.RECEIVED_PROPHECY);
			storyFlags.recordChoice('seek_true_origin', 'Decided to seek true origin', []);
			expect(storyFlags.getCurrentEndingPath()).toBe('hidden');
		});
	});

	describe('Spell Unlock Side Effects', () => {
		it('should unlock Flame Wave after cave boss', () => {
			storyFlags.setFlag(StoryFlag.CAVE_BOSS_DEFEATED);
			expect(storyFlags.hasFlag(StoryFlag.SPELL_FLAME_WAVE_UNLOCKED)).toBe(true);
			expect(mockScene.events.emit).toHaveBeenCalledWith('spellUnlocked', 'flame_wave');
		});

		it('should unlock Frost Nova after first fragment', () => {
			storyFlags.setFlag(StoryFlag.FRAGMENT_RUINS_OBTAINED);
			expect(storyFlags.hasFlag(StoryFlag.SPELL_FROST_NOVA_UNLOCKED)).toBe(true);
			expect(mockScene.events.emit).toHaveBeenCalledWith('spellUnlocked', 'frost_nova');
		});

		it('should unlock Chain Lightning after second fragment', () => {
			storyFlags.setFlag(StoryFlag.FRAGMENT_TEMPLE_OBTAINED);
			expect(storyFlags.hasFlag(StoryFlag.SPELL_CHAIN_LIGHTNING_UNLOCKED)).toBe(true);
			expect(mockScene.events.emit).toHaveBeenCalledWith('spellUnlocked', 'chain_lightning');
		});

		it('should emit sunstoneRestored event', () => {
			storyFlags.setFlag(StoryFlag.SUNSTONE_RESTORED);
			expect(mockScene.events.emit).toHaveBeenCalledWith('sunstoneRestored');
		});
	});

	describe('Persistence', () => {
		it('should save to localStorage', () => {
			storyFlags.setFlag(StoryFlag.MET_MERCHANT);
			expect(localStorageMock.setItem).toHaveBeenCalled();
		});

		it('should load from localStorage', () => {
			const savedData = {
				flags: [StoryFlag.INTRO_COMPLETE, StoryFlag.MET_ELDER],
				choices: [{ id: 'test', description: 'Test choice', timestamp: 123, consequences: [] as string[] }],
			};
			localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(savedData));

			storyFlags.load();
			expect(storyFlags.hasFlag(StoryFlag.INTRO_COMPLETE)).toBe(true);
			expect(storyFlags.hasFlag(StoryFlag.MET_ELDER)).toBe(true);
			expect(storyFlags.hasChoice('test')).toBe(true);
		});

		it('should reset all progress', () => {
			storyFlags.setFlag(StoryFlag.INTRO_COMPLETE);
			storyFlags.recordChoice('test', 'Test', []);
			storyFlags.reset();
			expect(storyFlags.hasFlag(StoryFlag.INTRO_COMPLETE)).toBe(false);
			expect(storyFlags.hasChoice('test')).toBe(false);
			expect(localStorageMock.removeItem).toHaveBeenCalled();
		});
	});

	describe('Serialization', () => {
		it('should serialize to JSON', () => {
			storyFlags.setFlag(StoryFlag.INTRO_COMPLETE);
			storyFlags.recordChoice('test', 'Test choice', ['consequence']);

			const json = storyFlags.toJSON();
			expect(json.flags).toContain(StoryFlag.INTRO_COMPLETE);
			expect(json.choices.length).toBe(1);
			expect(json.choices[0].id).toBe('test');
		});

		it('should deserialize from JSON', () => {
			const data = {
				flags: [StoryFlag.ENTERED_CROSSROADS, StoryFlag.MET_MERCHANT],
				choices: [{ id: 'choice1', description: 'Choice 1', timestamp: 100, consequences: [] as string[] }],
			};

			storyFlags.fromJSON(data);
			expect(storyFlags.hasFlag(StoryFlag.ENTERED_CROSSROADS)).toBe(true);
			expect(storyFlags.hasFlag(StoryFlag.MET_MERCHANT)).toBe(true);
			expect(storyFlags.hasChoice('choice1')).toBe(true);
		});
	});
});

describe('StoryFlag Enum', () => {
	it('should have all Act 1 flags', () => {
		expect(StoryFlag.INTRO_COMPLETE).toBeDefined();
		expect(StoryFlag.MET_ELDER).toBeDefined();
		expect(StoryFlag.CAVE_BOSS_DEFEATED).toBeDefined();
		expect(StoryFlag.ACT_1_COMPLETE).toBeDefined();
	});

	it('should have all Act 2 flags', () => {
		expect(StoryFlag.ENTERED_CROSSROADS).toBeDefined();
		expect(StoryFlag.MET_MERCHANT).toBeDefined();
		expect(StoryFlag.MET_FALLEN_KNIGHT).toBeDefined();
		expect(StoryFlag.MET_ORACLE).toBeDefined();
	});

	it('should have all fragment flags', () => {
		expect(StoryFlag.FRAGMENT_RUINS_OBTAINED).toBeDefined();
		expect(StoryFlag.FRAGMENT_TEMPLE_OBTAINED).toBeDefined();
		expect(StoryFlag.FRAGMENT_GATE_OBTAINED).toBeDefined();
		expect(StoryFlag.SUNSTONE_RESTORED).toBeDefined();
	});

	it('should have all ending flags', () => {
		expect(StoryFlag.ENDING_HEROIC).toBeDefined();
		expect(StoryFlag.ENDING_SACRIFICE).toBeDefined();
		expect(StoryFlag.ENDING_HIDDEN).toBeDefined();
	});

	it('should have all spell unlock flags', () => {
		expect(StoryFlag.SPELL_FLAME_WAVE_UNLOCKED).toBeDefined();
		expect(StoryFlag.SPELL_FROST_NOVA_UNLOCKED).toBeDefined();
		expect(StoryFlag.SPELL_CHAIN_LIGHTNING_UNLOCKED).toBeDefined();
		expect(StoryFlag.SPELL_DIVINE_SHIELD_UNLOCKED).toBeDefined();
		expect(StoryFlag.SPELL_POISON_CLOUD_UNLOCKED).toBeDefined();
	});
});
