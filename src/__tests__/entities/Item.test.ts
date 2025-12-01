import { Item } from '../../entities/Item';

// NOTE: Don't use jest.mock('phaser') - the mock is already set up via moduleNameMapper in jest.config.js!
// Using jest.mock('phaser') would auto-mock and overwrite the properly configured mock.

// Mock other dependencies
jest.mock('../../plugins/NeverquestConsumableManager');
jest.mock('uuid', () => ({ v4: () => 'test-uuid-12345' }));

describe('Item', () => {
	let mockScene: any;
	let mockPlayer: any;
	let item: Item;

	beforeEach(() => {
		// Create mock Phaser scene
		mockScene = {
			add: {
				existing: jest.fn(),
			},
			physics: {
				add: {
					existing: jest.fn(),
					collider: jest.fn(),
				},
			},
			sound: {
				play: jest.fn(),
			},
			tweens: {
				add: jest.fn(),
			},
		};

		// Create mock player
		mockPlayer = {
			hitZone: {},
			container: {
				x: 100,
				y: 100,
			},
			items: [],
		};

		// Mock PlayerConfig
		(mockScene as any).player = mockPlayer;
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('Constructor', () => {
		it('should create item with valid config (id: 1 - Red Potion)', () => {
			item = new Item(mockScene, 50, 75, 1);

			expect(item).toBeDefined();
			expect(item.id).toBe('test-uuid-12345');
			expect(item.commonId).toBe(1);
			expect(item.name).toBe('Red Potion');
			expect(item.itemType).toBeDefined();
			expect(item.itemType.name).toBe('Usable');
			expect(item.description).toBe('A small potion that recovers 2 Health Points [HP].');
			expect(item.script).toBe('rec hp 2;');
			expect(item.stackable).toBe(true);
			expect(item.inventoryScale).toBe(1.7);
			expect(item.useSfx).toBe('heal');
		});

		it('should create item with valid config (id: 2 - Dark Potion)', () => {
			item = new Item(mockScene, 50, 75, 2);

			expect(item.commonId).toBe(2);
			expect(item.name).toBe('Dark Potion');
			expect(item.description).toContain('Increases the ATACK by 5 points');
			expect(item.script).toBe('buff atk 5 60;');
		});

		it('should throw error for invalid item config id', () => {
			expect(() => {
				new Item(mockScene, 50, 75, 999);
			}).toThrow('Item config not found for id: 999');
		});

		it('should add itself to scene', () => {
			item = new Item(mockScene, 50, 75, 1);

			expect(mockScene.add.existing).toHaveBeenCalledWith(item);
		});

		it('should add physics to item', () => {
			item = new Item(mockScene, 50, 75, 1);

			expect(mockScene.physics.add.existing).toHaveBeenCalledWith(item);
		});

		it('should initialize NeverquestConsumableManager', () => {
			item = new Item(mockScene, 50, 75, 1);

			expect(item.neverquestConsumableManager).toBeDefined();
		});

		it('should call pickItemLogic on creation', () => {
			const pickItemLogicSpy = jest.spyOn(Item.prototype, 'pickItemLogic');
			item = new Item(mockScene, 50, 75, 1);

			expect(pickItemLogicSpy).toHaveBeenCalled();
			pickItemLogicSpy.mockRestore();
		});

		it('should store texture from config', () => {
			item = new Item(mockScene, 50, 75, 1);

			expect(item.texture.key).toBe('red_potion');
		});

		it('should set correct position', () => {
			item = new Item(mockScene, 150, 200, 1);

			expect(item.x).toBe(150);
			expect(item.y).toBe(200);
		});
	});

	describe('pickItemLogic', () => {
		beforeEach(() => {
			item = new Item(mockScene, 50, 75, 1);
		});

		it('should add collider with player hitZone', () => {
			expect(mockScene.physics.add.collider).toHaveBeenCalled();
			const colliderCall = mockScene.physics.add.collider.mock.calls[0];
			expect(colliderCall[0]).toBe(item);
			expect(colliderCall[1]).toBe(mockPlayer.hitZone);
		});

		it('should have collision callback function', () => {
			const colliderCall = mockScene.physics.add.collider.mock.calls[0];
			expect(typeof colliderCall[2]).toBe('function');
		});

		it('should have process callback function', () => {
			const colliderCall = mockScene.physics.add.collider.mock.calls[0];
			expect(typeof colliderCall[3]).toBe('function');
		});
	});

	describe('addInventory', () => {
		beforeEach(() => {
			item = new Item(mockScene, 50, 75, 1);
			item.destroy = jest.fn();
		});

		it('should add new item to empty inventory', () => {
			mockPlayer.items = [];

			item.addInventory(mockPlayer);

			expect(mockPlayer.items).toHaveLength(1);
			expect(mockPlayer.items[0]).toEqual({ id: 1, count: 1 });
		});

		it('should increment count if item already exists', () => {
			mockPlayer.items = [{ id: 1, count: 3 }];

			item.addInventory(mockPlayer);

			expect(mockPlayer.items).toHaveLength(1);
			expect(mockPlayer.items[0].count).toBe(4);
		});

		it('should add new item if different item exists', () => {
			mockPlayer.items = [{ id: 2, count: 1 }];

			item.addInventory(mockPlayer);

			expect(mockPlayer.items).toHaveLength(2);
			expect(mockPlayer.items[1]).toEqual({ id: 1, count: 1 });
		});

		it('should destroy item after adding to inventory', () => {
			mockPlayer.items = [];

			item.addInventory(mockPlayer);

			expect(item.destroy).toHaveBeenCalled();
		});

		it('should handle multiple different items', () => {
			mockPlayer.items = [
				{ id: 1, count: 2 },
				{ id: 2, count: 1 },
			];

			item.addInventory(mockPlayer);

			expect(mockPlayer.items).toHaveLength(2);
			expect(mockPlayer.items[0].count).toBe(3);
		});

		it('should work with zero count items', () => {
			mockPlayer.items = [{ id: 1, count: 0 }];

			item.addInventory(mockPlayer);

			expect(mockPlayer.items[0].count).toBe(1);
		});
	});

	describe('consume', () => {
		beforeEach(() => {
			item = new Item(mockScene, 50, 75, 1);
			item.neverquestConsumableManager.useItem = jest.fn();
		});

		it('should call neverquestConsumableManager.useItem', () => {
			item.consume(mockPlayer);

			expect(item.neverquestConsumableManager.useItem).toHaveBeenCalledWith(item, mockPlayer);
		});

		it('should pass correct item and player', () => {
			const anotherPlayer = { ...mockPlayer };
			item.consume(anotherPlayer);

			expect(item.neverquestConsumableManager.useItem).toHaveBeenCalledWith(item, anotherPlayer);
		});
	});

	describe('Item Properties', () => {
		it('should have stackable property', () => {
			item = new Item(mockScene, 50, 75, 1);

			expect(typeof item.stackable).toBe('boolean');
			expect(item.stackable).toBe(true);
		});

		it('should have buffType property', () => {
			item = new Item(mockScene, 50, 75, 1);

			expect(item.buffType).toBeDefined();
			expect(item.buffType).toBe(0);
		});

		it('should have script property', () => {
			item = new Item(mockScene, 50, 75, 1);

			expect(typeof item.script).toBe('string');
		});

		it('should have inventoryScale property', () => {
			item = new Item(mockScene, 50, 75, 1);

			expect(typeof item.inventoryScale).toBe('number');
			expect(item.inventoryScale).toBeGreaterThan(0);
		});
	});

	describe('Edge Cases', () => {
		it('should handle item at origin (0, 0)', () => {
			item = new Item(mockScene, 0, 0, 1);

			expect(item.x).toBe(0);
			expect(item.y).toBe(0);
		});

		it('should handle negative coordinates', () => {
			item = new Item(mockScene, -50, -75, 1);

			expect(item.x).toBe(-50);
			expect(item.y).toBe(-75);
		});

		it('should handle large coordinates', () => {
			item = new Item(mockScene, 10000, 10000, 1);

			expect(item.x).toBe(10000);
			expect(item.y).toBe(10000);
		});

		it('should handle adding same item multiple times', () => {
			mockPlayer.items = [];

			item.addInventory(mockPlayer);
			expect(mockPlayer.items[0].count).toBe(1);

			// Create another instance of same item
			const item2 = new Item(mockScene, 60, 80, 1);
			item2.destroy = jest.fn();
			item2.addInventory(mockPlayer);

			expect(mockPlayer.items).toHaveLength(1);
			expect(mockPlayer.items[0].count).toBe(2);
		});
	});
});
