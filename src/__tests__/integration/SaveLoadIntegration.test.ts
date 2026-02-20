/**
 * Integration tests for Save/Load functionality
 *
 * These tests verify that the complete save/load cycle works correctly
 * with all components interacting together (player state, story progress,
 * spells, abilities, and progression systems).
 */

import { NeverquestSaveManager, ISaveData } from '../../plugins/NeverquestSaveManager';
import { EntityAttributes } from '../../entities/EntityAttributes';
import { StoryFlag } from '../../plugins/NeverquestStoryFlags';

// Mock dependencies
jest.mock('../../plugins/NeverquestStoryFlags', () => {
	return {
		StoryFlag: {
			INTRO_COMPLETE: 'intro_complete',
			MET_ELDER: 'met_elder',
			CAVE_BOSS_DEFEATED: 'cave_boss_defeated',
			ACT_1_COMPLETE: 'act_1_complete',
			ENTERED_CROSSROADS: 'entered_crossroads',
			MET_MERCHANT: 'met_merchant',
			FRAGMENT_RUINS_OBTAINED: 'fragment_ruins_obtained',
			SPELL_FLAME_WAVE_UNLOCKED: 'spell_flame_wave_unlocked',
			ABILITY_DOUBLE_JUMP: 'ability_double_jump',
		},
		NeverquestStoryFlags: jest.fn().mockImplementation(() => {
			const flags = new Set<string>();
			const choices: any[] = [];
			return {
				setFlag: jest.fn((flag: string) => flags.add(flag)),
				hasFlag: jest.fn((flag: string) => flags.has(flag)),
				getAllFlags: jest.fn(() => Array.from(flags)),
				recordChoice: jest.fn((id: string, desc: string, cons: string[]) => {
					choices.push({ id, description: desc, timestamp: Date.now(), consequences: cons });
				}),
				getChoices: jest.fn(() => [...choices]),
				getCurrentAct: jest.fn(() => (flags.has('entered_crossroads') ? 2 : 1)),
				getFragmentCount: jest.fn(() => (flags.has('fragment_ruins_obtained') ? 1 : 0)),
				load: jest.fn(),
				save: jest.fn(),
				toJSON: jest.fn(() => ({ flags: Array.from(flags), choices: [...choices] })),
				fromJSON: jest.fn((data: { flags: string[]; choices: any[] }) => {
					flags.clear();
					choices.length = 0;
					if (data?.flags) data.flags.forEach((f: string) => flags.add(f));
					if (data?.choices) data.choices.forEach((c: any) => choices.push(c));
				}),
			};
		}),
	};
});

jest.mock('../../plugins/NeverquestSpellManager', () => {
	return {
		NeverquestSpellManager: jest.fn().mockImplementation(() => {
			const unlocked = new Set<string>(['fireball', 'iceShard']);
			return {
				create: jest.fn(),
				destroy: jest.fn(),
				unlockSpell: jest.fn((id: string) => unlocked.add(id)),
				isSpellUnlocked: jest.fn((id: string) => unlocked.has(id)),
				getUnlockedCount: jest.fn(() => unlocked.size),
				syncWithStoryFlags: jest.fn(),
				toJSON: jest.fn(() => Array.from(unlocked)),
				fromJSON: jest.fn((data: string[]) => {
					unlocked.clear();
					if (data) data.forEach((id) => unlocked.add(id));
				}),
			};
		}),
	};
});

jest.mock('../../plugins/NeverquestAbilityManager', () => {
	return {
		NeverquestAbilityManager: jest.fn().mockImplementation(() => {
			const unlocked = new Set<string>();
			return {
				create: jest.fn(),
				destroy: jest.fn(),
				setPlayer: jest.fn(),
				unlockAbility: jest.fn((id: string) => unlocked.add(id)),
				isAbilityUnlocked: jest.fn((id: string) => unlocked.has(id)),
				getUnlockedCount: jest.fn(() => unlocked.size),
				syncWithStoryFlags: jest.fn(),
				toJSON: jest.fn(() => Array.from(unlocked)),
				fromJSON: jest.fn((data: string[]) => {
					unlocked.clear();
					if (data) data.forEach((id) => unlocked.add(id));
				}),
			};
		}),
	};
});

describe('SaveLoad Integration Tests', () => {
	let saveManager: NeverquestSaveManager;
	let mockScene: any;
	let mockPlayer: any;

	const createMockPlayer = (overrides: Partial<any> = {}) => ({
		container: {
			x: 500,
			y: 300,
			setPosition: jest.fn(),
		},
		attributes: {
			...JSON.parse(JSON.stringify(EntityAttributes)),
			level: 5,
			experience: 350,
			health: 45,
			baseHealth: 50,
			maxHealth: 50,
			atack: 12,
			defense: 8,
			availableStatPoints: 3,
			rawAttributes: {
				str: 8,
				agi: 6,
				vit: 7,
				dex: 5,
				int: 4,
			},
		},
		items: [
			{ id: 1, count: 5 },
			{ id: 2, count: 2 },
		],
		healthBar: {
			update: jest.fn(),
			full: 50,
		},
		canMove: true,
		isAtacking: false,
		...overrides,
	});

	const createMockScene = (player: any) => ({
		scene: {
			key: 'OverworldScene',
			get: jest.fn().mockReturnValue({ messageLog: { log: jest.fn() } }),
			start: jest.fn(),
		},
		time: {
			addEvent: jest.fn().mockReturnValue({ destroy: jest.fn(), delay: 30000 }),
			delayedCall: jest.fn(),
			now: 150000,
		},
		player,
		add: {
			text: jest.fn().mockReturnValue({
				setOrigin: jest.fn(),
				setScrollFactor: jest.fn(),
				setDepth: jest.fn(),
				destroy: jest.fn(),
			}),
		},
		tweens: { add: jest.fn() },
		cameras: { main: { width: 800, height: 600 } },
		events: { on: jest.fn(), off: jest.fn(), emit: jest.fn() },
	});

	beforeEach(() => {
		localStorage.clear();
		mockPlayer = createMockPlayer();
		mockScene = createMockScene(mockPlayer);
		saveManager = new NeverquestSaveManager(mockScene);
		saveManager.create();
	});

	afterEach(() => {
		localStorage.clear();
	});

	describe('Complete Save/Load Cycle', () => {
		it('should preserve all player data through save/load cycle', () => {
			// Save the game
			const saveResult = saveManager.saveGame(false);
			expect(saveResult).toBe(true);

			// Modify player state
			mockPlayer.container.x = 999;
			mockPlayer.container.y = 888;
			mockPlayer.attributes.health = 10;

			// Load the saved game
			const loadedData = saveManager.loadGame(false);
			expect(loadedData).toBeTruthy();

			// Verify saved data matches original
			expect(loadedData!.player.x).toBe(500);
			expect(loadedData!.player.y).toBe(300);
			expect(loadedData!.player.health).toBe(45);
			expect(loadedData!.player.level).toBe(5);
			expect(loadedData!.player.experience).toBe(350);
		});

		it('should preserve player items through save/load', () => {
			saveManager.saveGame(false);
			const loadedData = saveManager.loadGame(false);

			expect(loadedData!.player.items).toEqual([
				{ id: 1, count: 5 },
				{ id: 2, count: 2 },
			]);
		});

		it('should preserve player attributes through save/load', () => {
			saveManager.saveGame(false);
			const loadedData = saveManager.loadGame(false);

			expect(loadedData!.player.attributes.atack).toBe(12);
			expect(loadedData!.player.attributes.defense).toBe(8);
			expect(loadedData!.player.attributes.availableStatPoints).toBe(3);
			expect(loadedData!.player.attributes.baseHealth).toBe(50);
		});

		it('should preserve scene information through save/load', () => {
			saveManager.saveGame(false);
			const loadedData = saveManager.loadGame(false);

			expect(loadedData!.scene).toBe('OverworldScene');
		});

		it('should include timestamp and version in save data', () => {
			const beforeSave = Date.now();
			saveManager.saveGame(false);
			const afterSave = Date.now();

			const loadedData = saveManager.loadGame(false);

			expect(loadedData!.timestamp).toBeGreaterThanOrEqual(beforeSave);
			expect(loadedData!.timestamp).toBeLessThanOrEqual(afterSave);
			expect(loadedData!.version).toBe('1.0.0');
		});
	});

	describe('Story Progress Persistence', () => {
		it('should save and restore story flags', () => {
			// Set some story flags
			saveManager.storyFlags!.setFlag(StoryFlag.INTRO_COMPLETE);
			saveManager.storyFlags!.setFlag(StoryFlag.MET_ELDER);

			saveManager.saveGame(false);
			const loadedData = saveManager.loadGame(false);

			expect(loadedData!.story).toBeDefined();
			expect(loadedData!.story!.flags).toBeDefined();
		});

		it('should save and restore story choices', () => {
			saveManager.storyFlags!.recordChoice('helped_villager', 'Helped the villager in need', ['reputation_up']);

			saveManager.saveGame(false);
			const loadedData = saveManager.loadGame(false);

			expect(loadedData!.story!.choices).toBeDefined();
		});

		it('should track story progress across multiple saves', () => {
			// First save - early game
			saveManager.storyFlags!.setFlag(StoryFlag.INTRO_COMPLETE);
			saveManager.saveGame(false);

			// Progress more
			saveManager.storyFlags!.setFlag(StoryFlag.CAVE_BOSS_DEFEATED);
			saveManager.storyFlags!.setFlag(StoryFlag.ACT_1_COMPLETE);

			// Second save - after progression
			const result = saveManager.saveGame(false);
			expect(result).toBe(true);

			const loadedData = saveManager.loadGame(false);
			expect(loadedData!.story).toBeDefined();
		});
	});

	describe('Spell Persistence', () => {
		it('should save and restore unlocked spells', () => {
			saveManager.spellManager!.unlockSpell('flameWave');
			saveManager.spellManager!.unlockSpell('frostNova');

			saveManager.saveGame(false);
			const loadedData = saveManager.loadGame(false);

			expect(loadedData!.spells).toBeDefined();
			expect(loadedData!.spells!.unlockedSpells).toBeDefined();
		});

		it('should preserve default unlocked spells', () => {
			saveManager.saveGame(false);
			const loadedData = saveManager.loadGame(false);

			expect(loadedData!.spells!.unlockedSpells).toContain('fireball');
			expect(loadedData!.spells!.unlockedSpells).toContain('iceShard');
		});
	});

	describe('Ability Persistence', () => {
		it('should save and restore unlocked abilities', () => {
			saveManager.abilityManager!.unlockAbility('doubleJump');

			saveManager.saveGame(false);
			const loadedData = saveManager.loadGame(false);

			expect(loadedData!.abilities).toBeDefined();
			expect(loadedData!.abilities!.unlockedAbilities).toBeDefined();
		});
	});

	describe('Apply Save Data Integration', () => {
		it('should correctly restore player position', () => {
			const saveData: ISaveData = {
				player: {
					x: 750,
					y: 420,
					attributes: mockPlayer.attributes,
					items: mockPlayer.items,
					level: 5,
					experience: 350,
					health: 45,
				},
				scene: 'OverworldScene',
				timestamp: Date.now(),
				playtime: 100000,
				version: '1.0.0',
			};

			const result = saveManager.applySaveData(saveData);

			expect(result).toBe(true);
			expect(mockPlayer.container.setPosition).toHaveBeenCalledWith(750, 420);
		});

		it('should update health bar after applying save data', () => {
			const saveData: ISaveData = {
				player: {
					x: 100,
					y: 200,
					attributes: { ...mockPlayer.attributes, health: 25 },
					items: [],
					level: 3,
					experience: 100,
					health: 25,
				},
				scene: 'OverworldScene',
				timestamp: Date.now(),
				playtime: 50000,
				version: '1.0.0',
			};

			saveManager.applySaveData(saveData);

			expect(mockPlayer.healthBar.update).toHaveBeenCalledWith(25);
		});

		it('should handle missing health bar gracefully', () => {
			mockPlayer.healthBar = undefined;

			const saveData: ISaveData = {
				player: {
					x: 100,
					y: 200,
					attributes: mockPlayer.attributes,
					items: [],
					level: 1,
					experience: 0,
					health: 50,
				},
				scene: 'OverworldScene',
				timestamp: Date.now(),
				playtime: 0,
				version: '1.0.0',
			};

			const result = saveManager.applySaveData(saveData);
			expect(result).toBe(true);
		});

		it('should trigger scene switch when saved scene differs', () => {
			const saveData: ISaveData = {
				player: {
					x: 100,
					y: 200,
					attributes: mockPlayer.attributes,
					items: [],
					level: 1,
					experience: 0,
					health: 50,
				},
				scene: 'CaveScene',
				timestamp: Date.now(),
				playtime: 0,
				version: '1.0.0',
			};

			saveManager.applySaveData(saveData);

			expect(mockScene.scene.start).toHaveBeenCalledWith('CaveScene');
		});

		it('should not trigger scene switch when same scene', () => {
			const saveData: ISaveData = {
				player: {
					x: 100,
					y: 200,
					attributes: mockPlayer.attributes,
					items: [],
					level: 1,
					experience: 0,
					health: 50,
				},
				scene: 'OverworldScene',
				timestamp: Date.now(),
				playtime: 0,
				version: '1.0.0',
			};

			saveManager.applySaveData(saveData);

			expect(mockScene.scene.start).not.toHaveBeenCalled();
		});
	});

	describe('Checkpoint vs Manual Save', () => {
		it('should save to different keys for checkpoint and manual save', () => {
			// Manual save
			saveManager.saveGame(false);
			expect(localStorage.getItem('neverquest_rpg_save')).toBeTruthy();
			expect(localStorage.getItem('neverquest_rpg_checkpoint')).toBeFalsy();

			// Checkpoint save
			mockPlayer.canMove = true;
			mockPlayer.isAtacking = false;
			saveManager.createCheckpoint();
			expect(localStorage.getItem('neverquest_rpg_checkpoint')).toBeTruthy();
		});

		it('should maintain separate manual and checkpoint saves', () => {
			// Manual save at position A
			mockPlayer.container.x = 100;
			mockPlayer.container.y = 100;
			saveManager.saveGame(false);

			// Checkpoint at position B
			mockPlayer.container.x = 500;
			mockPlayer.container.y = 500;
			mockPlayer.canMove = true;
			mockPlayer.isAtacking = false;
			saveManager.createCheckpoint();

			// Load manual save
			const manualData = saveManager.loadGame(false);
			expect(manualData!.player.x).toBe(100);
			expect(manualData!.player.y).toBe(100);

			// Load checkpoint
			const checkpointData = saveManager.loadGame(true);
			expect(checkpointData!.player.x).toBe(500);
			expect(checkpointData!.player.y).toBe(500);
		});
	});

	describe('Edge Cases and Error Handling', () => {
		it('should handle empty inventory gracefully', () => {
			mockPlayer.items = [];

			saveManager.saveGame(false);
			const loadedData = saveManager.loadGame(false);

			expect(loadedData!.player.items).toEqual([]);
		});

		it('should handle zero experience and level 1', () => {
			mockPlayer.attributes.level = 1;
			mockPlayer.attributes.experience = 0;

			saveManager.saveGame(false);
			const loadedData = saveManager.loadGame(false);

			expect(loadedData!.player.level).toBe(1);
			expect(loadedData!.player.experience).toBe(0);
		});

		it('should handle max level scenario', () => {
			mockPlayer.attributes.level = 20;
			mockPlayer.attributes.experience = 11100;

			saveManager.saveGame(false);
			const loadedData = saveManager.loadGame(false);

			expect(loadedData!.player.level).toBe(20);
			expect(loadedData!.player.experience).toBe(11100);
		});

		it('should handle low health scenario', () => {
			mockPlayer.attributes.health = 1;

			saveManager.saveGame(false);
			const loadedData = saveManager.loadGame(false);

			expect(loadedData!.player.health).toBe(1);
		});

		it('should reject applying save to null player', () => {
			mockScene.player = null;

			const saveData: ISaveData = {
				player: {
					x: 100,
					y: 200,
					attributes: {},
					items: [],
					level: 1,
					experience: 0,
					health: 100,
				},
				scene: 'OverworldScene',
				timestamp: Date.now(),
				playtime: 0,
				version: '1.0.0',
			};

			const result = saveManager.applySaveData(saveData);
			expect(result).toBe(false);
		});

		it('should handle corrupted save data', () => {
			localStorage.setItem('neverquest_rpg_save', '{"invalid": true}');

			const loadedData = saveManager.loadGame(false);

			// Should load but without proper player data
			expect(loadedData).toBeTruthy();
			expect(loadedData!.player).toBeUndefined();
		});
	});

	describe('Playtime Tracking', () => {
		it('should record playtime in save data', () => {
			saveManager.saveGame(false);
			const loadedData = saveManager.loadGame(false);

			expect(loadedData!.playtime).toBeDefined();
			expect(typeof loadedData!.playtime).toBe('number');
			expect(loadedData!.playtime).toBeGreaterThanOrEqual(0);
		});

		it('should preserve playtime across saves', () => {
			mockScene.time.now = 300000; // 5 minutes

			saveManager.saveGame(false);
			const loadedData = saveManager.loadGame(false);

			expect(loadedData!.playtime).toBe(300000);
		});
	});

	describe('Version Compatibility', () => {
		it('should include version in save data', () => {
			saveManager.saveGame(false);
			const loadedData = saveManager.loadGame(false);

			expect(loadedData!.version).toBe('1.0.0');
		});

		it('should handle old save format without story/spells/abilities', () => {
			// Simulate old save format
			const oldFormatSave: ISaveData = {
				player: {
					x: 100,
					y: 200,
					attributes: mockPlayer.attributes,
					items: [],
					level: 5,
					experience: 500,
					health: 80,
				},
				scene: 'OverworldScene',
				timestamp: Date.now(),
				playtime: 0,
				version: '0.9.0',
				// No story, spells, or abilities
			};

			localStorage.setItem('neverquest_rpg_save', JSON.stringify(oldFormatSave));

			const loadedData = saveManager.loadGame(false);

			expect(loadedData).toBeTruthy();
			expect(loadedData!.story).toBeUndefined();
			expect(loadedData!.spells).toBeUndefined();
			expect(loadedData!.abilities).toBeUndefined();

			// Should still apply player data correctly
			const result = saveManager.applySaveData(loadedData!);
			expect(result).toBe(true);
		});
	});

	describe('Auto-Save Conditions', () => {
		it('should not auto-save when player cannot move', () => {
			mockPlayer.canMove = false;
			mockPlayer.isAtacking = false;

			saveManager.createCheckpoint();

			expect(localStorage.getItem('neverquest_rpg_checkpoint')).toBeFalsy();
		});

		it('should not auto-save when player is attacking', () => {
			mockPlayer.canMove = true;
			mockPlayer.isAtacking = true;

			saveManager.createCheckpoint();

			expect(localStorage.getItem('neverquest_rpg_checkpoint')).toBeFalsy();
		});

		it('should auto-save when player is idle', () => {
			mockPlayer.canMove = true;
			mockPlayer.isAtacking = false;

			saveManager.createCheckpoint();

			expect(localStorage.getItem('neverquest_rpg_checkpoint')).toBeTruthy();
		});

		it('should not auto-save when disabled', () => {
			saveManager.setAutoSave(false);
			mockPlayer.canMove = true;
			mockPlayer.isAtacking = false;

			saveManager.createCheckpoint();

			expect(localStorage.getItem('neverquest_rpg_checkpoint')).toBeFalsy();
		});
	});

	describe('Delete Save Operations', () => {
		it('should delete manual save', () => {
			saveManager.saveGame(false);
			expect(saveManager.hasSaveData(false)).toBe(true);

			saveManager.deleteSave(false);
			expect(saveManager.hasSaveData(false)).toBe(false);
		});

		it('should delete checkpoint save', () => {
			mockPlayer.canMove = true;
			mockPlayer.isAtacking = false;
			saveManager.createCheckpoint();
			expect(saveManager.hasSaveData(true)).toBe(true);

			saveManager.deleteSave(true);
			expect(saveManager.hasSaveData(true)).toBe(false);
		});

		it('should not affect other save when deleting one', () => {
			saveManager.saveGame(false);
			mockPlayer.canMove = true;
			mockPlayer.isAtacking = false;
			saveManager.createCheckpoint();

			saveManager.deleteSave(false);

			expect(saveManager.hasSaveData(false)).toBe(false);
			expect(saveManager.hasSaveData(true)).toBe(true);
		});
	});
});
