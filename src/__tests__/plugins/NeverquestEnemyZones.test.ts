/**
 * Tests for NeverquestEnemyZones plugin
 */

// Mock Phaser at the module level
const MockRectangle: any = jest.fn().mockImplementation((x, y, width, height) => {
	return { x, y, width, height };
});
MockRectangle.Random = jest.fn((rect: any) => {
	return { x: rect.x + 10, y: rect.y + 10 };
});

const MockPoint = jest.fn();

jest.mock('phaser', () => {
	return {
		__esModule: true,
		default: {
			Geom: {
				Rectangle: MockRectangle,
				Point: MockPoint,
			},
		},
	};
});

import { NeverquestEnemyZones } from '../../plugins/NeverquestEnemyZones';
import { Enemy } from '../../entities/Enemy';

// Mock the Enemy entity
jest.mock('../../entities/Enemy', () => {
	return {
		Enemy: jest.fn().mockImplementation((scene, x, y, texture, id) => {
			return {
				scene,
				x,
				y,
				texture,
				id,
				anims: {
					play: jest.fn(),
				},
				body: {
					setSize: jest.fn(),
				},
				width: 32,
				height: 32,
			};
		}),
	};
});

// Mock EnemiesSeedConfig
jest.mock('../../consts/enemies/EnemiesSeedConfig', () => {
	return {
		EnemiesSeedConfig: [
			{ id: 1, texture: 'bat', name: 'Bat' },
			{ id: 2, texture: 'slime', name: 'Slime' },
			{ id: 3, texture: 'skeleton', name: 'Skeleton' },
		],
	};
});

describe('NeverquestEnemyZones', () => {
	let mockScene: any;
	let mockMap: any;
	let enemyZones: NeverquestEnemyZones;

	beforeEach(() => {
		// Create mock scene
		mockScene = {
			add: {
				zone: jest.fn((x, y, width, height) => ({
					x,
					y,
					width,
					height,
				})),
			},
			physics: {
				add: {
					collider: jest.fn(),
				},
			},
			enemies: [],
		};

		// Create mock tilemap
		mockMap = {
			getObjectLayer: jest.fn(),
		};

		jest.clearAllMocks();
	});

	describe('Constructor', () => {
		it('should initialize with scene and map', () => {
			enemyZones = new NeverquestEnemyZones(mockScene, mockMap);

			expect(enemyZones.scene).toBe(mockScene);
			expect(enemyZones.map).toBe(mockMap);
		});

		it('should set default tiledObjectLayer to "enemies"', () => {
			enemyZones = new NeverquestEnemyZones(mockScene, mockMap);

			expect(enemyZones.tiledObjectLayer).toBe('enemies');
		});

		it('should initialize empty zones array', () => {
			enemyZones = new NeverquestEnemyZones(mockScene, mockMap);

			expect(enemyZones.zones).toEqual([]);
		});

		it('should set createFromProperties to true by default', () => {
			enemyZones = new NeverquestEnemyZones(mockScene, mockMap);

			expect(enemyZones.createFromProperties).toBe(true);
		});

		it('should set default property names', () => {
			enemyZones = new NeverquestEnemyZones(mockScene, mockMap);

			expect(enemyZones.numberPropertyName).toBe('number');
			expect(enemyZones.texturePropertyName).toBe('texture');
			expect(enemyZones.idPropertyName).toBe('id');
		});

		it('should inherit animation names from AnimationNames', () => {
			enemyZones = new NeverquestEnemyZones(mockScene, mockMap);

			expect(enemyZones.idlePrefixAnimation).toBe('idle');
			expect(enemyZones.downAnimationSufix).toBe('down');
		});
	});

	describe('create()', () => {
		it('should do nothing when object layer is null', () => {
			mockMap.getObjectLayer.mockReturnValue(null);
			enemyZones = new NeverquestEnemyZones(mockScene, mockMap);

			enemyZones.create();

			expect(mockScene.add.zone).not.toHaveBeenCalled();
			expect(Enemy).not.toHaveBeenCalled();
		});

		it('should do nothing when object layer has no objects', () => {
			mockMap.getObjectLayer.mockReturnValue({ objects: [] });
			enemyZones = new NeverquestEnemyZones(mockScene, mockMap);

			enemyZones.create();

			expect(mockScene.add.zone).not.toHaveBeenCalled();
			expect(Enemy).not.toHaveBeenCalled();
		});

		it('should create zones for each object in layer', () => {
			const mockObjects = [
				{
					x: 100,
					y: 200,
					width: 150,
					height: 100,
					properties: [
						{ name: 'number', value: 2 },
						{ name: 'id', value: '1' },
					],
				},
				{
					x: 300,
					y: 400,
					width: 200,
					height: 150,
					properties: [
						{ name: 'number', value: 1 },
						{ name: 'id', value: '2' },
					],
				},
			];

			mockMap.getObjectLayer.mockReturnValue({ objects: mockObjects });
			enemyZones = new NeverquestEnemyZones(mockScene, mockMap);

			enemyZones.create();

			expect(mockScene.add.zone).toHaveBeenCalledTimes(2);
			expect(mockScene.add.zone).toHaveBeenCalledWith(100, 200, 150, 100);
			expect(mockScene.add.zone).toHaveBeenCalledWith(300, 400, 200, 150);
			expect(enemyZones.zones).toHaveLength(2);
		});

		it('should create correct number of enemies per zone', () => {
			const mockObjects = [
				{
					x: 100,
					y: 200,
					width: 150,
					height: 100,
					properties: [
						{ name: 'number', value: 3 },
						{ name: 'id', value: '1' },
					],
				},
			];

			mockMap.getObjectLayer.mockReturnValue({ objects: mockObjects });
			enemyZones = new NeverquestEnemyZones(mockScene, mockMap);

			enemyZones.create();

			expect(Enemy).toHaveBeenCalledTimes(3);
		});

		it('should use texture from EnemiesSeedConfig when id matches', () => {
			const mockObjects = [
				{
					x: 100,
					y: 200,
					width: 150,
					height: 100,
					properties: [
						{ name: 'number', value: 1 },
						{ name: 'id', value: '2' }, // ID 2 maps to 'slime' texture
					],
				},
			];

			mockMap.getObjectLayer.mockReturnValue({ objects: mockObjects });
			enemyZones = new NeverquestEnemyZones(mockScene, mockMap);

			enemyZones.create();

			expect(Enemy).toHaveBeenCalledWith(mockScene, expect.any(Number), expect.any(Number), 'slime', 2);
		});

		it('should use default bat texture when config not found', () => {
			const mockObjects = [
				{
					x: 100,
					y: 200,
					width: 150,
					height: 100,
					properties: [
						{ name: 'number', value: 1 },
						{ name: 'id', value: '999' }, // ID not in config
					],
				},
			];

			mockMap.getObjectLayer.mockReturnValue({ objects: mockObjects });
			enemyZones = new NeverquestEnemyZones(mockScene, mockMap);

			enemyZones.create();

			expect(Enemy).toHaveBeenCalledWith(mockScene, expect.any(Number), expect.any(Number), 'bat', 999);
		});

		it('should play idle animation for created enemies', () => {
			const mockObjects = [
				{
					x: 100,
					y: 200,
					width: 150,
					height: 100,
					properties: [
						{ name: 'number', value: 1 },
						{ name: 'id', value: '1' },
					],
				},
			];

			mockMap.getObjectLayer.mockReturnValue({ objects: mockObjects });
			enemyZones = new NeverquestEnemyZones(mockScene, mockMap);

			enemyZones.create();

			const MockedEnemy = Enemy as jest.MockedClass<typeof Enemy>;
			const createdEnemy = MockedEnemy.mock.results[0].value;

			expect(createdEnemy.anims.play).toHaveBeenCalledWith('bat-idle-down');
		});

		it('should set enemy body size', () => {
			const mockObjects = [
				{
					x: 100,
					y: 200,
					width: 150,
					height: 100,
					properties: [
						{ name: 'number', value: 1 },
						{ name: 'id', value: '1' },
					],
				},
			];

			mockMap.getObjectLayer.mockReturnValue({ objects: mockObjects });
			enemyZones = new NeverquestEnemyZones(mockScene, mockMap);

			enemyZones.create();

			const MockedEnemy = Enemy as jest.MockedClass<typeof Enemy>;
			const createdEnemy = MockedEnemy.mock.results[0].value;

			expect(createdEnemy.body.setSize).toHaveBeenCalledWith(32, 32);
		});

		it('should add enemies to scene.enemies array', () => {
			const mockObjects = [
				{
					x: 100,
					y: 200,
					width: 150,
					height: 100,
					properties: [
						{ name: 'number', value: 2 },
						{ name: 'id', value: '1' },
					],
				},
			];

			mockMap.getObjectLayer.mockReturnValue({ objects: mockObjects });
			enemyZones = new NeverquestEnemyZones(mockScene, mockMap);

			enemyZones.create();

			expect(mockScene.enemies).toHaveLength(2);
		});

		it('should add collider for enemies', () => {
			const mockObjects = [
				{
					x: 100,
					y: 200,
					width: 150,
					height: 100,
					properties: [
						{ name: 'number', value: 1 },
						{ name: 'id', value: '1' },
					],
				},
			];

			mockMap.getObjectLayer.mockReturnValue({ objects: mockObjects });
			enemyZones = new NeverquestEnemyZones(mockScene, mockMap);

			enemyZones.create();

			expect(mockScene.physics.add.collider).toHaveBeenCalledWith(mockScene.enemies, null);
		});

		it('should not create enemies when createFromProperties is false', () => {
			const mockObjects = [
				{
					x: 100,
					y: 200,
					width: 150,
					height: 100,
					properties: [
						{ name: 'number', value: 5 },
						{ name: 'id', value: '1' },
					],
				},
			];

			mockMap.getObjectLayer.mockReturnValue({ objects: mockObjects });
			enemyZones = new NeverquestEnemyZones(mockScene, mockMap);
			enemyZones.createFromProperties = false;

			enemyZones.create();

			expect(Enemy).not.toHaveBeenCalled();
			expect(enemyZones.zones).toHaveLength(1); // Zone still created
		});

		it('should skip zone when properties is undefined', () => {
			const mockObjects = [
				{
					x: 100,
					y: 200,
					width: 150,
					height: 100,
					// No properties
				},
			];

			mockMap.getObjectLayer.mockReturnValue({ objects: mockObjects });
			enemyZones = new NeverquestEnemyZones(mockScene, mockMap);

			enemyZones.create();

			expect(Enemy).not.toHaveBeenCalled();
			expect(enemyZones.zones).toHaveLength(1);
		});

		it('should handle missing number property', () => {
			const mockObjects = [
				{
					x: 100,
					y: 200,
					width: 150,
					height: 100,
					properties: [
						{ name: 'id', value: '1' },
						// Missing 'number' property
					],
				},
			];

			mockMap.getObjectLayer.mockReturnValue({ objects: mockObjects });
			enemyZones = new NeverquestEnemyZones(mockScene, mockMap);

			enemyZones.create();

			// Should not crash, but won't create enemies
			expect(Enemy).not.toHaveBeenCalled();
		});

		it('should use random positions within zone bounds', () => {
			const mockObjects = [
				{
					x: 100,
					y: 200,
					width: 150,
					height: 100,
					properties: [
						{ name: 'number', value: 2 },
						{ name: 'id', value: '1' },
					],
				},
			];

			mockMap.getObjectLayer.mockReturnValue({ objects: mockObjects });
			enemyZones = new NeverquestEnemyZones(mockScene, mockMap);

			enemyZones.create();

			// Verify Rectangle.Random was called with proper bounds
			expect(MockRectangle.Random).toHaveBeenCalledTimes(2);
		});
	});

	describe('Multiple Zones', () => {
		it('should create enemies across multiple zones', () => {
			const mockObjects = [
				{
					x: 100,
					y: 200,
					width: 150,
					height: 100,
					properties: [
						{ name: 'number', value: 2 },
						{ name: 'id', value: '1' },
					],
				},
				{
					x: 300,
					y: 400,
					width: 200,
					height: 150,
					properties: [
						{ name: 'number', value: 3 },
						{ name: 'id', value: '2' },
					],
				},
			];

			mockMap.getObjectLayer.mockReturnValue({ objects: mockObjects });
			enemyZones = new NeverquestEnemyZones(mockScene, mockMap);

			enemyZones.create();

			expect(Enemy).toHaveBeenCalledTimes(5); // 2 + 3 enemies
			expect(mockScene.enemies).toHaveLength(5);
			expect(enemyZones.zones).toHaveLength(2);
		});

		it('should use different textures for different enemy types', () => {
			const mockObjects = [
				{
					x: 100,
					y: 200,
					width: 150,
					height: 100,
					properties: [
						{ name: 'number', value: 1 },
						{ name: 'id', value: '1' }, // bat
					],
				},
				{
					x: 300,
					y: 400,
					width: 200,
					height: 150,
					properties: [
						{ name: 'number', value: 1 },
						{ name: 'id', value: '3' }, // skeleton
					],
				},
			];

			mockMap.getObjectLayer.mockReturnValue({ objects: mockObjects });
			enemyZones = new NeverquestEnemyZones(mockScene, mockMap);

			enemyZones.create();

			expect(Enemy).toHaveBeenNthCalledWith(1, mockScene, expect.any(Number), expect.any(Number), 'bat', 1);
			expect(Enemy).toHaveBeenNthCalledWith(2, mockScene, expect.any(Number), expect.any(Number), 'skeleton', 3);
		});
	});

	describe('Edge Cases', () => {
		it('should handle zero enemies in zone', () => {
			const mockObjects = [
				{
					x: 100,
					y: 200,
					width: 150,
					height: 100,
					properties: [
						{ name: 'number', value: 0 },
						{ name: 'id', value: '1' },
					],
				},
			];

			mockMap.getObjectLayer.mockReturnValue({ objects: mockObjects });
			enemyZones = new NeverquestEnemyZones(mockScene, mockMap);

			enemyZones.create();

			expect(Enemy).not.toHaveBeenCalled();
			expect(enemyZones.zones).toHaveLength(1);
		});

		it('should handle negative zone coordinates', () => {
			const mockObjects = [
				{
					x: -50,
					y: -100,
					width: 150,
					height: 100,
					properties: [
						{ name: 'number', value: 1 },
						{ name: 'id', value: '1' },
					],
				},
			];

			mockMap.getObjectLayer.mockReturnValue({ objects: mockObjects });
			enemyZones = new NeverquestEnemyZones(mockScene, mockMap);

			enemyZones.create();

			expect(mockScene.add.zone).toHaveBeenCalledWith(-50, -100, 150, 100);
		});

		it('should handle missing x, y, width, height properties', () => {
			const mockObjects = [
				{
					properties: [
						{ name: 'number', value: 1 },
						{ name: 'id', value: '1' },
					],
				},
			];

			mockMap.getObjectLayer.mockReturnValue({ objects: mockObjects });
			enemyZones = new NeverquestEnemyZones(mockScene, mockMap);

			expect(() => {
				enemyZones.create();
			}).not.toThrow();
		});

		it('should handle very large number of enemies', () => {
			const mockObjects = [
				{
					x: 100,
					y: 200,
					width: 500,
					height: 500,
					properties: [
						{ name: 'number', value: 100 },
						{ name: 'id', value: '1' },
					],
				},
			];

			mockMap.getObjectLayer.mockReturnValue({ objects: mockObjects });
			enemyZones = new NeverquestEnemyZones(mockScene, mockMap);

			enemyZones.create();

			expect(Enemy).toHaveBeenCalledTimes(100);
			expect(mockScene.enemies).toHaveLength(100);
		});
	});

	describe('Custom Property Names', () => {
		it('should use custom numberPropertyName', () => {
			const mockObjects = [
				{
					x: 100,
					y: 200,
					width: 150,
					height: 100,
					properties: [
						{ name: 'count', value: 2 }, // Custom property name
						{ name: 'id', value: '1' },
					],
				},
			];

			mockMap.getObjectLayer.mockReturnValue({ objects: mockObjects });
			enemyZones = new NeverquestEnemyZones(mockScene, mockMap);
			enemyZones.numberPropertyName = 'count';

			enemyZones.create();

			expect(Enemy).toHaveBeenCalledTimes(2);
		});

		it('should use custom idPropertyName', () => {
			const mockObjects = [
				{
					x: 100,
					y: 200,
					width: 150,
					height: 100,
					properties: [
						{ name: 'number', value: 1 },
						{ name: 'enemyId', value: '2' }, // Custom property name
					],
				},
			];

			mockMap.getObjectLayer.mockReturnValue({ objects: mockObjects });
			enemyZones = new NeverquestEnemyZones(mockScene, mockMap);
			enemyZones.idPropertyName = 'enemyId';

			enemyZones.create();

			expect(Enemy).toHaveBeenCalledWith(mockScene, expect.any(Number), expect.any(Number), 'slime', 2);
		});

		it('should use custom tiledObjectLayer', () => {
			mockMap.getObjectLayer.mockReturnValue({ objects: [] });
			enemyZones = new NeverquestEnemyZones(mockScene, mockMap);
			enemyZones.tiledObjectLayer = 'customLayer';

			enemyZones.create();

			expect(mockMap.getObjectLayer).toHaveBeenCalledWith('customLayer');
		});
	});
});
