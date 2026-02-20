import { NeverquestAbilityManager, MILESTONE_ABILITIES } from '../../plugins/NeverquestAbilityManager';
import { StoryFlag } from '../../plugins/NeverquestStoryFlags';

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

// Mock Player
const createMockPlayer = (level: number = 1) =>
	({
		attributes: {
			level,
			experience: 0,
			health: 100,
		},
	}) as unknown as import('../../entities/Player').Player;

describe('NeverquestAbilityManager', () => {
	let abilityManager: NeverquestAbilityManager;
	let mockScene: Phaser.Scene;
	let mockPlayer: import('../../entities/Player').Player;

	beforeEach(() => {
		localStorageMock.clear();
		jest.clearAllMocks();
		mockScene = createMockScene();
		mockPlayer = createMockPlayer(1);
		abilityManager = new NeverquestAbilityManager(mockScene, mockPlayer);
	});

	describe('MILESTONE_ABILITIES constant', () => {
		it('should have 4 milestone abilities', () => {
			expect(MILESTONE_ABILITIES).toHaveLength(4);
		});

		it('should have Double Jump at level 5', () => {
			const doubleJump = MILESTONE_ABILITIES.find((a) => a.id === 'doubleJump');
			expect(doubleJump).toBeDefined();
			expect(doubleJump?.unlockLevel).toBe(5);
			expect(doubleJump?.storyFlag).toBe(StoryFlag.ABILITY_DOUBLE_JUMP);
		});

		it('should have Sprint Boost at level 10', () => {
			const sprintBoost = MILESTONE_ABILITIES.find((a) => a.id === 'sprintBoost');
			expect(sprintBoost).toBeDefined();
			expect(sprintBoost?.unlockLevel).toBe(10);
			expect(sprintBoost?.storyFlag).toBe(StoryFlag.ABILITY_SPRINT_BOOST);
		});

		it('should have Magic Shield at level 15', () => {
			const magicShield = MILESTONE_ABILITIES.find((a) => a.id === 'magicShield');
			expect(magicShield).toBeDefined();
			expect(magicShield?.unlockLevel).toBe(15);
			expect(magicShield?.storyFlag).toBe(StoryFlag.ABILITY_MAGIC_SHIELD);
		});

		it('should have Shadow Step at level 20', () => {
			const shadowStep = MILESTONE_ABILITIES.find((a) => a.id === 'shadowStep');
			expect(shadowStep).toBeDefined();
			expect(shadowStep?.unlockLevel).toBe(20);
			expect(shadowStep?.storyFlag).toBe(StoryFlag.ABILITY_SHADOW_STEP);
		});
	});

	describe('Initialization', () => {
		it('should set up event listeners on create', () => {
			abilityManager.create();

			expect(mockScene.events.on).toHaveBeenCalledWith('abilityUnlocked', expect.any(Function), abilityManager);
			expect(mockScene.events.on).toHaveBeenCalledWith('playerLevelUp', expect.any(Function), abilityManager);
		});

		it('should set up shutdown cleanup', () => {
			abilityManager.create();

			expect(mockScene.events.once).toHaveBeenCalledWith('shutdown', expect.any(Function), abilityManager);
		});

		it('should start with no abilities unlocked for level 1 player', () => {
			abilityManager.create();

			expect(abilityManager.getUnlockedCount()).toBe(0);
		});

		it('should auto-unlock abilities for high level player on create', () => {
			const highLevelPlayer = createMockPlayer(15);
			const manager = new NeverquestAbilityManager(mockScene, highLevelPlayer);
			manager.create();

			// Level 15 should unlock Double Jump (5), Sprint Boost (10), Magic Shield (15)
			expect(manager.isAbilityUnlocked('doubleJump')).toBe(true);
			expect(manager.isAbilityUnlocked('sprintBoost')).toBe(true);
			expect(manager.isAbilityUnlocked('magicShield')).toBe(true);
			expect(manager.isAbilityUnlocked('shadowStep')).toBe(false);
		});
	});

	describe('Level-Based Unlocking', () => {
		beforeEach(() => {
			abilityManager.create();
		});

		it('should unlock Double Jump at level 5', () => {
			expect(abilityManager.isAbilityUnlocked('doubleJump')).toBe(false);

			abilityManager.onLevelUp(5);

			expect(abilityManager.isAbilityUnlocked('doubleJump')).toBe(true);
		});

		it('should unlock Sprint Boost at level 10', () => {
			abilityManager.onLevelUp(10);

			expect(abilityManager.isAbilityUnlocked('sprintBoost')).toBe(true);
		});

		it('should unlock multiple abilities when leveling past thresholds', () => {
			abilityManager.onLevelUp(12);

			expect(abilityManager.isAbilityUnlocked('doubleJump')).toBe(true);
			expect(abilityManager.isAbilityUnlocked('sprintBoost')).toBe(true);
			expect(abilityManager.isAbilityUnlocked('magicShield')).toBe(false);
		});

		it('should unlock all abilities at level 20+', () => {
			abilityManager.onLevelUp(25);

			expect(abilityManager.getUnlockedCount()).toBe(4);
		});

		it('should not unlock abilities below threshold', () => {
			abilityManager.onLevelUp(4);

			expect(abilityManager.getUnlockedCount()).toBe(0);
		});

		it('should emit abilityUnlockedUI event when ability is unlocked', () => {
			abilityManager.onLevelUp(5);

			expect(mockScene.events.emit).toHaveBeenCalledWith(
				'abilityUnlockedUI',
				expect.objectContaining({
					abilityId: 'doubleJump',
				})
			);
		});
	});

	describe('Manual Ability Unlock', () => {
		beforeEach(() => {
			abilityManager.create();
		});

		it('should unlock ability manually', () => {
			abilityManager.unlockAbility('doubleJump');

			expect(abilityManager.isAbilityUnlocked('doubleJump')).toBe(true);
		});

		it('should not duplicate unlocks', () => {
			abilityManager.unlockAbility('doubleJump');
			abilityManager.unlockAbility('doubleJump');

			expect(abilityManager.getUnlockedCount()).toBe(1);
		});

		it('should emit setStoryFlag event when ability is unlocked', () => {
			abilityManager.unlockAbility('doubleJump');

			expect(mockScene.events.emit).toHaveBeenCalledWith('setStoryFlag', StoryFlag.ABILITY_DOUBLE_JUMP);
		});
	});

	describe('Ability Queries', () => {
		beforeEach(() => {
			abilityManager.create();
		});

		it('should get all unlocked abilities with definitions', () => {
			abilityManager.onLevelUp(10);

			const unlocked = abilityManager.getUnlockedAbilities();

			expect(unlocked).toHaveLength(2);
			unlocked.forEach((ability) => {
				expect(ability).toHaveProperty('id');
				expect(ability).toHaveProperty('name');
				expect(ability).toHaveProperty('unlockLevel');
			});
		});

		it('should get all locked abilities', () => {
			abilityManager.onLevelUp(5);

			const locked = abilityManager.getLockedAbilities();
			const unlocked = abilityManager.getUnlockedAbilities();

			expect(locked.length + unlocked.length).toBe(MILESTONE_ABILITIES.length);
			expect(locked.every((a) => a.unlockLevel > 5)).toBe(true);
		});

		it('should get next ability to unlock', () => {
			const next = abilityManager.getNextAbilityToUnlock();

			expect(next).toBeDefined();
			expect(next?.id).toBe('doubleJump');
			expect(next?.unlockLevel).toBe(5);
		});

		it('should get correct next ability after some unlocks', () => {
			abilityManager.onLevelUp(5);

			const next = abilityManager.getNextAbilityToUnlock();

			expect(next?.id).toBe('sprintBoost');
		});

		it('should return undefined when all abilities unlocked', () => {
			abilityManager.onLevelUp(20);

			const next = abilityManager.getNextAbilityToUnlock();

			expect(next).toBeUndefined();
		});

		it('should get ability by ID', () => {
			const ability = abilityManager.getAbilityById('doubleJump');

			expect(ability).toBeDefined();
			expect(ability?.name).toBe('Double Jump');
		});

		it('should return undefined for unknown ability ID', () => {
			const ability = abilityManager.getAbilityById('unknownAbility');

			expect(ability).toBeUndefined();
		});

		it('should return correct total count', () => {
			expect(abilityManager.getTotalCount()).toBe(4);
		});

		it('should get unlock level for ability', () => {
			expect(abilityManager.getUnlockLevel('doubleJump')).toBe(5);
			expect(abilityManager.getUnlockLevel('shadowStep')).toBe(20);
		});
	});

	describe('Player Management', () => {
		it('should set player reference after creation', () => {
			const manager = new NeverquestAbilityManager(mockScene, null);
			manager.create();

			expect(manager.getUnlockedCount()).toBe(0);

			const level10Player = createMockPlayer(10);
			manager.setPlayer(level10Player);

			expect(manager.isAbilityUnlocked('doubleJump')).toBe(true);
			expect(manager.isAbilityUnlocked('sprintBoost')).toBe(true);
		});
	});

	describe('Story Flag Sync', () => {
		beforeEach(() => {
			abilityManager.create();
		});

		it('should sync with story flags', () => {
			const flags = [StoryFlag.ABILITY_DOUBLE_JUMP, StoryFlag.ABILITY_SPRINT_BOOST];

			abilityManager.syncWithStoryFlags(flags);

			expect(abilityManager.isAbilityUnlocked('doubleJump')).toBe(true);
			expect(abilityManager.isAbilityUnlocked('sprintBoost')).toBe(true);
			expect(abilityManager.isAbilityUnlocked('magicShield')).toBe(false);
		});
	});

	describe('Persistence', () => {
		it('should save unlocked abilities to localStorage', () => {
			abilityManager.create();
			abilityManager.unlockAbility('doubleJump');

			expect(localStorageMock.setItem).toHaveBeenCalled();
		});

		it('should load unlocked abilities from localStorage', () => {
			const savedData = ['doubleJump', 'sprintBoost'];
			localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(savedData));

			abilityManager.create();

			expect(abilityManager.isAbilityUnlocked('doubleJump')).toBe(true);
			expect(abilityManager.isAbilityUnlocked('sprintBoost')).toBe(true);
		});

		it('should reset all ability unlocks', () => {
			abilityManager.create();
			abilityManager.onLevelUp(20);

			expect(abilityManager.getUnlockedCount()).toBe(4);

			abilityManager.reset();

			expect(abilityManager.getUnlockedCount()).toBe(0);
			expect(localStorageMock.removeItem).toHaveBeenCalled();
		});
	});

	describe('Serialization', () => {
		beforeEach(() => {
			abilityManager.create();
		});

		it('should serialize to JSON', () => {
			abilityManager.unlockAbility('doubleJump');
			abilityManager.unlockAbility('sprintBoost');

			const json = abilityManager.toJSON();

			expect(json).toContain('doubleJump');
			expect(json).toContain('sprintBoost');
			expect(Array.isArray(json)).toBe(true);
		});

		it('should deserialize from JSON', () => {
			const data = ['doubleJump', 'magicShield', 'shadowStep'];

			abilityManager.fromJSON(data);

			expect(abilityManager.isAbilityUnlocked('doubleJump')).toBe(true);
			expect(abilityManager.isAbilityUnlocked('sprintBoost')).toBe(false);
			expect(abilityManager.isAbilityUnlocked('magicShield')).toBe(true);
			expect(abilityManager.isAbilityUnlocked('shadowStep')).toBe(true);
		});

		it('should handle empty/null data gracefully', () => {
			expect(() => abilityManager.fromJSON([])).not.toThrow();
			expect(() => abilityManager.fromJSON(null as unknown as string[])).not.toThrow();
		});
	});

	describe('Cleanup', () => {
		it('should remove event listeners on destroy', () => {
			abilityManager.create();
			abilityManager.destroy();

			expect(mockScene.events.off).toHaveBeenCalledWith('abilityUnlocked', expect.any(Function), abilityManager);
			expect(mockScene.events.off).toHaveBeenCalledWith('playerLevelUp', expect.any(Function), abilityManager);
		});
	});

	describe('Event Handler Integration', () => {
		it('should handle abilityUnlocked event', () => {
			abilityManager.create();

			// Get the event handler that was registered
			const onCall = (mockScene.events.on as jest.Mock).mock.calls.find((call) => call[0] === 'abilityUnlocked');
			const handler = onCall[1];
			const context = onCall[2];

			// Call the handler
			handler.call(context, 'magicShield');

			expect(abilityManager.isAbilityUnlocked('magicShield')).toBe(true);
		});

		it('should handle playerLevelUp event', () => {
			abilityManager.create();

			// Get the event handler that was registered
			const onCall = (mockScene.events.on as jest.Mock).mock.calls.find((call) => call[0] === 'playerLevelUp');
			const handler = onCall[1];
			const context = onCall[2];

			// Simulate level up to 5
			handler.call(context, 5);

			expect(abilityManager.isAbilityUnlocked('doubleJump')).toBe(true);
		});
	});
});
