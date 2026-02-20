import { NeverquestNPCManager, INPCConfig, CROSSROADS_NPCS } from '../../plugins/NeverquestNPCManager';
import { Player } from '../../entities/Player';
import { IDialogChat } from '../../plugins/NeverquestDialogBox';

// Mock CHATS
jest.mock('../../consts/DB_SEED/Chats', () => ({
	CHATS: [
		{ id: 11, chat: [{ message: 'Merchant greeting' }] },
		{ id: 12, chat: [{ message: 'Knight encounter' }] },
		{ id: 13, chat: [{ message: 'Oracle vision' }] },
		{ id: 14, chat: [{ message: 'Gate guardian' }] },
		{ id: 99, chat: [{ message: 'Test chat' }] },
	],
}));

// Mock NeverquestDialogBox
jest.mock('../../plugins/NeverquestDialogBox', () => ({
	NeverquestDialogBox: jest.fn().mockImplementation(() => ({
		create: jest.fn(),
		isOverlapingChat: false,
		canShowDialog: true,
		actionButton: { visible: false },
		interactionIcon: { visible: false, setPosition: jest.fn() },
		chat: null,
	})),
}));

/**
 * Mock scene add factory
 */
interface IMockSceneAdd {
	sprite: jest.Mock;
	text: jest.Mock;
	zone: jest.Mock;
}

/**
 * Mock scene structure
 */
interface IMockScene {
	add: IMockSceneAdd;
	physics: {
		add: {
			existing: jest.Mock;
			overlap: jest.Mock;
		};
	};
	scene: {
		get: jest.Mock;
	};
}

describe('NeverquestNPCManager', () => {
	let mockScene: IMockScene;
	let mockPlayer: Partial<Player>;
	let manager: NeverquestNPCManager;

	beforeEach(() => {
		// Mock Phaser scene
		mockScene = {
			add: {
				sprite: jest.fn().mockReturnValue({
					setDepth: jest.fn().mockReturnThis(),
					setScale: jest.fn().mockReturnThis(),
					setTint: jest.fn().mockReturnThis(),
					play: jest.fn().mockReturnThis(),
					setPosition: jest.fn().mockReturnThis(),
					destroy: jest.fn(),
					npcId: '',
					npcConfig: null,
					nameText: null,
				}),
				text: jest.fn().mockReturnValue({
					setOrigin: jest.fn().mockReturnThis(),
					setDepth: jest.fn().mockReturnThis(),
					setPosition: jest.fn().mockReturnThis(),
					destroy: jest.fn(),
				}),
				zone: jest.fn().mockReturnValue({
					setOrigin: jest.fn().mockReturnThis(),
					setPosition: jest.fn().mockReturnThis(),
					destroy: jest.fn(),
					body: { immovable: false },
					chat: null as IDialogChat[] | null,
					npcId: '',
				}),
			},
			physics: {
				add: {
					existing: jest.fn(),
					overlap: jest.fn(),
				},
			},
			scene: {
				get: jest.fn().mockReturnValue({}),
			},
		};

		// Mock player
		mockPlayer = {
			hitZone: {} as Phaser.GameObjects.Zone,
			container: {
				body: { height: 32 },
				x: 100,
				y: 100,
			} as unknown as Phaser.GameObjects.Container,
		};

		manager = new NeverquestNPCManager(mockScene as unknown as Phaser.Scene, mockPlayer as Player);
	});

	describe('constructor', () => {
		it('should initialize with empty arrays', () => {
			expect(manager.npcs).toEqual([]);
			expect(manager.npcConfigs).toEqual([]);
			expect(manager.interactionZones).toEqual([]);
		});

		it('should set default interaction radius', () => {
			expect(manager.interactionRadius).toBe(48);
		});

		it('should set default depths', () => {
			expect(manager.spriteDepth).toBe(5);
			expect(manager.labelDepth).toBe(10);
		});
	});

	describe('addNPC', () => {
		it('should add a single NPC config', () => {
			const config: INPCConfig = {
				id: 'test',
				name: 'Test NPC',
				x: 100,
				y: 200,
				chatId: 99,
			};

			manager.addNPC(config);
			expect(manager.npcConfigs).toHaveLength(1);
			expect(manager.npcConfigs[0]).toEqual(config);
		});

		it('should add multiple NPC configs', () => {
			const config1: INPCConfig = { id: 'npc1', name: 'NPC 1', x: 100, y: 100, chatId: 99 };
			const config2: INPCConfig = { id: 'npc2', name: 'NPC 2', x: 200, y: 200, chatId: 99 };

			manager.addNPC(config1);
			manager.addNPC(config2);
			expect(manager.npcConfigs).toHaveLength(2);
		});
	});

	describe('addNPCs', () => {
		it('should add multiple NPC configs at once', () => {
			const configs: INPCConfig[] = [
				{ id: 'npc1', name: 'NPC 1', x: 100, y: 100, chatId: 99 },
				{ id: 'npc2', name: 'NPC 2', x: 200, y: 200, chatId: 99 },
				{ id: 'npc3', name: 'NPC 3', x: 300, y: 300, chatId: 99 },
			];

			manager.addNPCs(configs);
			expect(manager.npcConfigs).toHaveLength(3);
		});
	});

	describe('create', () => {
		it('should create dialog box', () => {
			manager.create();
			expect(manager.dialogBox.create).toHaveBeenCalled();
		});

		it('should spawn all configured NPCs', () => {
			const configs: INPCConfig[] = [
				{ id: 'npc1', name: 'NPC 1', x: 100, y: 100, chatId: 99 },
				{ id: 'npc2', name: 'NPC 2', x: 200, y: 200, chatId: 99 },
			];

			manager.addNPCs(configs);
			manager.create();

			expect(mockScene.add.sprite).toHaveBeenCalledTimes(2);
			expect(mockScene.add.text).toHaveBeenCalledTimes(2);
			expect(mockScene.add.zone).toHaveBeenCalledTimes(2);
		});

		it('should set up physics overlap detection', () => {
			manager.addNPC({ id: 'test', name: 'Test', x: 100, y: 100, chatId: 99 });
			manager.create();

			expect(mockScene.physics.add.overlap).toHaveBeenCalled();
		});

		it('should not set up overlap if no NPCs configured', () => {
			manager.create();
			expect(mockScene.physics.add.overlap).not.toHaveBeenCalled();
		});

		it('should warn if chat ID not found', () => {
			const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

			manager.addNPC({ id: 'invalid', name: 'Invalid', x: 100, y: 100, chatId: 9999 });
			manager.create();

			expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Chat ID 9999 not found'));
			consoleSpy.mockRestore();
		});
	});

	describe('NPC spawning', () => {
		it('should create sprite with correct texture', () => {
			manager.addNPC({ id: 'test', name: 'Test', x: 100, y: 200, chatId: 99, texture: 'custom_texture' });
			manager.create();

			expect(mockScene.add.sprite).toHaveBeenCalledWith(100, 200, 'custom_texture', 0);
		});

		it('should use default texture if not specified', () => {
			manager.addNPC({ id: 'test', name: 'Test', x: 100, y: 200, chatId: 99 });
			manager.create();

			expect(mockScene.add.sprite).toHaveBeenCalledWith(100, 200, 'character', 0);
		});

		it('should apply scale if specified', () => {
			const mockSprite = {
				setDepth: jest.fn().mockReturnThis(),
				setScale: jest.fn().mockReturnThis(),
				setTint: jest.fn().mockReturnThis(),
				npcId: '',
				npcConfig: null as INPCConfig | null,
			};
			mockScene.add.sprite.mockReturnValue(mockSprite);

			manager.addNPC({ id: 'test', name: 'Test', x: 100, y: 200, chatId: 99, scale: 1.5 });
			manager.create();

			expect(mockSprite.setScale).toHaveBeenCalledWith(1.5);
		});

		it('should apply tint if specified', () => {
			const mockSprite = {
				setDepth: jest.fn().mockReturnThis(),
				setScale: jest.fn().mockReturnThis(),
				setTint: jest.fn().mockReturnThis(),
				npcId: '',
				npcConfig: null as INPCConfig | null,
			};
			mockScene.add.sprite.mockReturnValue(mockSprite);

			manager.addNPC({ id: 'test', name: 'Test', x: 100, y: 200, chatId: 99, tint: 0xff0000 });
			manager.create();

			expect(mockSprite.setTint).toHaveBeenCalledWith(0xff0000);
		});

		it('should create name label above NPC', () => {
			manager.addNPC({ id: 'test', name: 'Test NPC', x: 100, y: 200, chatId: 99 });
			manager.create();

			expect(mockScene.add.text).toHaveBeenCalledWith(100, 176, 'Test NPC', expect.any(Object));
		});

		it('should create interaction zone around NPC', () => {
			manager.addNPC({ id: 'test', name: 'Test', x: 100, y: 200, chatId: 99 });
			manager.create();

			expect(mockScene.add.zone).toHaveBeenCalledWith(100, 200, 96, 96);
		});

		it('should make zone body immovable', () => {
			const mockZone = {
				setOrigin: jest.fn().mockReturnThis(),
				body: { immovable: false },
				chat: null as IDialogChat[] | null,
				npcId: '',
			};
			mockScene.add.zone.mockReturnValue(mockZone);

			manager.addNPC({ id: 'test', name: 'Test', x: 100, y: 200, chatId: 99 });
			manager.create();

			expect(mockZone.body.immovable).toBe(true);
		});
	});

	describe('getNPC', () => {
		it('should return NPC by ID', () => {
			const mockSprite = {
				setDepth: jest.fn().mockReturnThis(),
				npcId: 'test',
				npcConfig: { id: 'test' } as INPCConfig,
			};
			mockScene.add.sprite.mockReturnValue(mockSprite);

			manager.addNPC({ id: 'test', name: 'Test', x: 100, y: 200, chatId: 99 });
			manager.create();

			const npc = manager.getNPC('test');
			expect(npc).toBeDefined();
			expect(npc?.npcId).toBe('test');
		});

		it('should return undefined for non-existent ID', () => {
			manager.addNPC({ id: 'test', name: 'Test', x: 100, y: 200, chatId: 99 });
			manager.create();

			const npc = manager.getNPC('nonexistent');
			expect(npc).toBeUndefined();
		});
	});

	describe('removeNPC', () => {
		it('should remove NPC and its components', () => {
			const mockSprite = {
				setDepth: jest.fn().mockReturnThis(),
				destroy: jest.fn(),
				npcId: 'test',
				npcConfig: { id: 'test' } as INPCConfig,
				nameText: { destroy: jest.fn() },
			};
			mockScene.add.sprite.mockReturnValue(mockSprite);

			const mockZone = {
				setOrigin: jest.fn().mockReturnThis(),
				destroy: jest.fn(),
				body: { immovable: false },
				chat: null as IDialogChat[] | null,
				npcId: 'test',
			};
			mockScene.add.zone.mockReturnValue(mockZone);

			manager.addNPC({ id: 'test', name: 'Test', x: 100, y: 200, chatId: 99 });
			manager.create();

			manager.removeNPC('test');

			expect(mockSprite.destroy).toHaveBeenCalled();
			expect(mockSprite.nameText.destroy).toHaveBeenCalled();
			expect(mockZone.destroy).toHaveBeenCalled();
			expect(manager.npcs).toHaveLength(0);
			expect(manager.interactionZones).toHaveLength(0);
		});

		it('should handle removing non-existent NPC gracefully', () => {
			expect(() => manager.removeNPC('nonexistent')).not.toThrow();
		});
	});

	describe('moveNPC', () => {
		it('should update NPC position', () => {
			const mockSprite = {
				setDepth: jest.fn().mockReturnThis(),
				setPosition: jest.fn(),
				npcId: 'test',
				npcConfig: { id: 'test' } as INPCConfig,
				nameText: { setPosition: jest.fn() },
			};
			mockScene.add.sprite.mockReturnValue(mockSprite);

			const mockZone = {
				setOrigin: jest.fn().mockReturnThis(),
				setPosition: jest.fn(),
				body: { immovable: false },
				chat: null as IDialogChat[] | null,
				npcId: 'test',
			};
			mockScene.add.zone.mockReturnValue(mockZone);

			manager.addNPC({ id: 'test', name: 'Test', x: 100, y: 200, chatId: 99 });
			manager.create();

			manager.moveNPC('test', 300, 400);

			expect(mockSprite.setPosition).toHaveBeenCalledWith(300, 400);
			expect(mockSprite.nameText.setPosition).toHaveBeenCalledWith(300, 376);
			expect(mockZone.setPosition).toHaveBeenCalledWith(300, 400);
		});
	});

	describe('destroy', () => {
		it('should clean up all NPCs and zones', () => {
			const mockSprite = {
				setDepth: jest.fn().mockReturnThis(),
				destroy: jest.fn(),
				npcId: 'test',
				npcConfig: { id: 'test' } as INPCConfig,
				nameText: { destroy: jest.fn() },
			};
			mockScene.add.sprite.mockReturnValue(mockSprite);

			const mockZone = {
				setOrigin: jest.fn().mockReturnThis(),
				destroy: jest.fn(),
				body: { immovable: false },
				chat: null as IDialogChat[] | null,
				npcId: 'test',
			};
			mockScene.add.zone.mockReturnValue(mockZone);

			manager.addNPC({ id: 'test', name: 'Test', x: 100, y: 200, chatId: 99 });
			manager.create();

			manager.destroy();

			expect(mockSprite.destroy).toHaveBeenCalled();
			expect(mockZone.destroy).toHaveBeenCalled();
			expect(manager.npcs).toHaveLength(0);
			expect(manager.interactionZones).toHaveLength(0);
			expect(manager.npcConfigs).toHaveLength(0);
		});
	});
});

describe('CROSSROADS_NPCS', () => {
	it('should have 4 NPC configurations', () => {
		expect(CROSSROADS_NPCS).toHaveLength(4);
	});

	it('should include merchant NPC', () => {
		const merchant = CROSSROADS_NPCS.find((npc) => npc.id === 'merchant');
		expect(merchant).toBeDefined();
		expect(merchant?.name).toBe('Wandering Merchant');
		expect(merchant?.chatId).toBe(11);
	});

	it('should include fallen knight NPC', () => {
		const knight = CROSSROADS_NPCS.find((npc) => npc.id === 'fallenKnight');
		expect(knight).toBeDefined();
		expect(knight?.name).toBe('Sir Aldric');
		expect(knight?.chatId).toBe(12);
	});

	it('should include oracle NPC', () => {
		const oracle = CROSSROADS_NPCS.find((npc) => npc.id === 'oracle');
		expect(oracle).toBeDefined();
		expect(oracle?.name).toBe('Oracle');
		expect(oracle?.chatId).toBe(13);
	});

	it('should include gate guardian NPC', () => {
		const guardian = CROSSROADS_NPCS.find((npc) => npc.id === 'gateGuardian');
		expect(guardian).toBeDefined();
		expect(guardian?.name).toBe('Gate Guardian');
		expect(guardian?.chatId).toBe(14);
	});

	it('should have valid positions for all NPCs', () => {
		CROSSROADS_NPCS.forEach((npc) => {
			expect(npc.x).toBeGreaterThan(0);
			expect(npc.y).toBeGreaterThan(0);
		});
	});

	it('should have unique IDs for all NPCs', () => {
		const ids = CROSSROADS_NPCS.map((npc) => npc.id);
		const uniqueIds = [...new Set(ids)];
		expect(uniqueIds.length).toBe(ids.length);
	});

	it('should have unique positions for all NPCs', () => {
		const positions = CROSSROADS_NPCS.map((npc) => `${npc.x},${npc.y}`);
		const uniquePositions = [...new Set(positions)];
		expect(uniquePositions.length).toBe(positions.length);
	});
});
