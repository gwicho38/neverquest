import { NeverquestSpellManager } from '../../plugins/NeverquestSpellManager';
import { StoryFlag } from '../../plugins/NeverquestStoryFlags';
import { SPELLS } from '../../consts/Spells';

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
const createMockScene = () =>
	({
		events: {
			on: jest.fn(),
			off: jest.fn(),
			once: jest.fn(),
			emit: jest.fn(),
		},
	}) as unknown as Phaser.Scene;

describe('NeverquestSpellManager', () => {
	let spellManager: NeverquestSpellManager;
	let mockScene: Phaser.Scene;

	beforeEach(() => {
		localStorageMock.clear();
		jest.clearAllMocks();
		mockScene = createMockScene();
		spellManager = new NeverquestSpellManager(mockScene);
	});

	describe('Initialization', () => {
		it('should initialize with default unlocked spells', () => {
			spellManager.create();

			// Count default unlocked spells from SPELLS
			const defaultUnlocked = SPELLS.filter((s) => s.unlocked);
			expect(spellManager.getUnlockedCount()).toBe(defaultUnlocked.length);
		});

		it('should set up event listener for spellUnlocked', () => {
			spellManager.create();

			expect(mockScene.events.on).toHaveBeenCalledWith('spellUnlocked', expect.any(Function), spellManager);
		});

		it('should set up shutdown cleanup', () => {
			spellManager.create();

			expect(mockScene.events.once).toHaveBeenCalledWith('shutdown', expect.any(Function), spellManager);
		});
	});

	describe('Spell Unlock', () => {
		beforeEach(() => {
			spellManager.create();
		});

		it('should unlock a spell by ID', () => {
			expect(spellManager.isSpellUnlocked('flameWave')).toBe(false);

			spellManager.unlockSpell('flameWave');

			expect(spellManager.isSpellUnlocked('flameWave')).toBe(true);
		});

		it('should not duplicate unlocks', () => {
			const initialCount = spellManager.getUnlockedCount();

			spellManager.unlockSpell('flameWave');
			spellManager.unlockSpell('flameWave');

			expect(spellManager.getUnlockedCount()).toBe(initialCount + 1);
		});

		it('should handle spell unlock event with snake_case conversion', () => {
			// Get the event handler that was registered
			const onCall = (mockScene.events.on as jest.Mock).mock.calls.find((call) => call[0] === 'spellUnlocked');
			const handler = onCall[1];
			const context = onCall[2];

			// Call the handler with snake_case spell ID
			handler.call(context, 'flame_wave');

			expect(spellManager.isSpellUnlocked('flameWave')).toBe(true);
		});

		it('should emit spellUnlockedUI event when spell is unlocked', () => {
			const onCall = (mockScene.events.on as jest.Mock).mock.calls.find((call) => call[0] === 'spellUnlocked');
			const handler = onCall[1];
			const context = onCall[2];

			handler.call(context, 'frost_nova');

			expect(mockScene.events.emit).toHaveBeenCalledWith(
				'spellUnlockedUI',
				expect.objectContaining({
					spellId: 'frostNova',
				})
			);
		});
	});

	describe('Spell Queries', () => {
		beforeEach(() => {
			spellManager.create();
		});

		it('should get all unlocked spells with definitions', () => {
			const unlocked = spellManager.getUnlockedSpells();

			unlocked.forEach((spell) => {
				expect(spell).toHaveProperty('id');
				expect(spell).toHaveProperty('name');
				expect(spell).toHaveProperty('manaCost');
				expect(spell).toHaveProperty('cooldown');
			});
		});

		it('should get all locked spells', () => {
			const locked = spellManager.getLockedSpells();
			const unlocked = spellManager.getUnlockedSpells();

			expect(locked.length + unlocked.length).toBe(SPELLS.length);
		});

		it('should get spell by ID', () => {
			const fireball = spellManager.getSpellById('fireball');

			expect(fireball).toBeDefined();
			expect(fireball?.name).toBe('Fireball');
		});

		it('should return undefined for unknown spell ID', () => {
			const unknown = spellManager.getSpellById('unknownSpell');

			expect(unknown).toBeUndefined();
		});

		it('should return correct total count', () => {
			expect(spellManager.getTotalCount()).toBe(SPELLS.length);
		});
	});

	describe('Story Flag Sync', () => {
		beforeEach(() => {
			spellManager.create();
		});

		it('should sync with story flags', () => {
			const flags = [StoryFlag.SPELL_FLAME_WAVE_UNLOCKED, StoryFlag.SPELL_FROST_NOVA_UNLOCKED];

			spellManager.syncWithStoryFlags(flags);

			expect(spellManager.isSpellUnlocked('flameWave')).toBe(true);
			expect(spellManager.isSpellUnlocked('frostNova')).toBe(true);
			expect(spellManager.isSpellUnlocked('chainLightning')).toBe(false);
		});

		it('should get unlock requirement for spell', () => {
			const requirement = spellManager.getUnlockRequirement('flameWave');

			expect(requirement).toBe(StoryFlag.SPELL_FLAME_WAVE_UNLOCKED);
		});

		it('should return undefined for spells without unlock requirement', () => {
			const requirement = spellManager.getUnlockRequirement('fireball');

			expect(requirement).toBeUndefined();
		});
	});

	describe('Persistence', () => {
		it('should save unlocked spells to localStorage', () => {
			spellManager.create();
			spellManager.unlockSpell('flameWave');

			expect(localStorageMock.setItem).toHaveBeenCalled();
		});

		it('should load unlocked spells from localStorage', () => {
			const savedData = ['flameWave', 'frostNova'];
			localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(savedData));

			spellManager.create();

			expect(spellManager.isSpellUnlocked('flameWave')).toBe(true);
			expect(spellManager.isSpellUnlocked('frostNova')).toBe(true);
		});

		it('should reset all spell unlocks', () => {
			spellManager.create();
			spellManager.unlockSpell('flameWave');
			spellManager.unlockSpell('frostNova');

			spellManager.reset();

			// Should only have default unlocked spells
			const defaultCount = SPELLS.filter((s) => s.unlocked).length;
			expect(spellManager.getUnlockedCount()).toBe(defaultCount);
			expect(localStorageMock.removeItem).toHaveBeenCalled();
		});
	});

	describe('Serialization', () => {
		beforeEach(() => {
			spellManager.create();
		});

		it('should serialize to JSON', () => {
			spellManager.unlockSpell('flameWave');

			const json = spellManager.toJSON();

			expect(json).toContain('flameWave');
			expect(Array.isArray(json)).toBe(true);
		});

		it('should deserialize from JSON', () => {
			const data = ['flameWave', 'frostNova', 'chainLightning'];

			spellManager.fromJSON(data);

			expect(spellManager.isSpellUnlocked('flameWave')).toBe(true);
			expect(spellManager.isSpellUnlocked('frostNova')).toBe(true);
			expect(spellManager.isSpellUnlocked('chainLightning')).toBe(true);
		});

		it('should include default spells when deserializing', () => {
			const data = ['flameWave'];

			spellManager.fromJSON(data);

			// Should have flameWave plus all default unlocked spells
			const defaultUnlocked = SPELLS.filter((s) => s.unlocked);
			defaultUnlocked.forEach((spell) => {
				expect(spellManager.isSpellUnlocked(spell.id)).toBe(true);
			});
		});

		it('should handle empty/null data gracefully', () => {
			expect(() => spellManager.fromJSON([])).not.toThrow();
			expect(() => spellManager.fromJSON(null as unknown as string[])).not.toThrow();
		});
	});

	describe('Cleanup', () => {
		it('should remove event listeners on destroy', () => {
			spellManager.create();
			spellManager.destroy();

			expect(mockScene.events.off).toHaveBeenCalledWith('spellUnlocked', expect.any(Function), spellManager);
		});
	});
});

describe('Snake to Camel Conversion', () => {
	let spellManager: NeverquestSpellManager;
	let mockScene: Phaser.Scene;

	beforeEach(() => {
		localStorageMock.clear();
		jest.clearAllMocks();
		mockScene = createMockScene();
		spellManager = new NeverquestSpellManager(mockScene);
		spellManager.create();
	});

	it.each([
		['flame_wave', 'flameWave'],
		['frost_nova', 'frostNova'],
		['chain_lightning', 'chainLightning'],
		['divine_shield', 'divineShield'],
		['poison_cloud', 'poisonCloud'],
	])('should convert %s to %s', (snakeCase, camelCase) => {
		const onCall = (mockScene.events.on as jest.Mock).mock.calls.find((call) => call[0] === 'spellUnlocked');
		const handler = onCall[1];
		const context = onCall[2];

		handler.call(context, snakeCase);

		expect(spellManager.isSpellUnlocked(camelCase)).toBe(true);
	});
});
