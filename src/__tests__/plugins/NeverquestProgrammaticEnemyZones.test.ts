// Create the Rectangle mock with static Random method
const mockRectangleFn = jest.fn().mockImplementation((x: number, y: number, width: number, height: number) => ({
	x,
	y,
	width,
	height,
	contains: jest.fn().mockReturnValue(true),
}));

// Add static Random method
(mockRectangleFn as jest.Mock & { Random: jest.Mock }).Random = jest
	.fn()
	.mockImplementation((bounds: { x: number; y: number; width: number; height: number }) => ({
		x: bounds.x + bounds.width / 2,
		y: bounds.y + bounds.height / 2,
	}));

// Mock Phaser module BEFORE importing the module under test
jest.mock('phaser', () => ({
	__esModule: true,
	default: {
		Geom: {
			Rectangle: mockRectangleFn,
			Point: jest.fn().mockImplementation(() => ({ x: 0, y: 0 })),
		},
	},
}));

import {
	NeverquestProgrammaticEnemyZones,
	IProgrammaticEnemyZone,
	CROSSROADS_ENEMY_ZONES,
} from '../../plugins/NeverquestProgrammaticEnemyZones';
import { Enemy } from '../../entities/Enemy';

// Mock dependencies
jest.mock('../../entities/Enemy', () => ({
	Enemy: jest.fn().mockImplementation((scene, x, y, _texture, _id) => ({
		x,
		y,
		width: 32,
		height: 32,
		anims: {
			play: jest.fn(),
		},
		body: {
			setSize: jest.fn(),
		},
		destroy: jest.fn(),
	})),
}));

jest.mock('../../consts/AnimationNames', () => ({
	AnimationNames: jest.fn().mockImplementation(() => ({
		idlePrefixAnimation: 'idle',
		downAnimationSufix: 'down',
	})),
}));

jest.mock('../../consts/enemies/EnemiesSeedConfig', () => ({
	EnemiesSeedConfig: [
		{ id: 4, texture: 'bandit', entityName: 'Bandit' },
		{ id: 5, texture: 'wolf', entityName: 'Wolf' },
		{ id: 6, texture: 'shadow_scout', entityName: 'Shadow Scout' },
	],
}));

/**
 * Mock scene interface
 */
interface IMockScene {
	add: {
		zone: jest.Mock;
	};
	physics: {
		add: {
			collider: jest.Mock;
		};
	};
	enemies: unknown[];
}

describe('NeverquestProgrammaticEnemyZones', () => {
	let mockScene: IMockScene;
	let enemyZones: NeverquestProgrammaticEnemyZones;

	beforeEach(() => {
		jest.clearAllMocks();

		mockScene = {
			add: {
				zone: jest.fn().mockReturnValue({
					setData: jest.fn(),
					getData: jest.fn().mockReturnValue('test_zone'),
					x: 100,
					y: 100,
					width: 200,
					height: 200,
					destroy: jest.fn(),
				}),
			},
			physics: {
				add: {
					collider: jest.fn(),
				},
			},
			enemies: [],
		};

		enemyZones = new NeverquestProgrammaticEnemyZones(mockScene as unknown as Phaser.Scene);
	});

	describe('constructor', () => {
		it('should initialize with empty arrays', () => {
			expect(enemyZones.zones).toEqual([]);
			expect(enemyZones.zoneConfigs).toEqual([]);
		});

		it('should initialize hasSpawned as false', () => {
			expect(enemyZones.hasSpawned).toBe(false);
		});

		it('should set animation name constants', () => {
			expect(enemyZones.idlePrefixAnimation).toBe('idle');
			expect(enemyZones.downAnimationSufix).toBe('down');
		});
	});

	describe('addZone', () => {
		it('should add a single zone configuration', () => {
			const config: IProgrammaticEnemyZone = {
				id: 'test_zone',
				x: 100,
				y: 200,
				width: 150,
				height: 150,
				enemyId: 4,
				count: 2,
			};

			enemyZones.addZone(config);
			expect(enemyZones.zoneConfigs).toHaveLength(1);
			expect(enemyZones.zoneConfigs[0]).toEqual(config);
		});
	});

	describe('addZones', () => {
		it('should add multiple zone configurations', () => {
			const configs: IProgrammaticEnemyZone[] = [
				{ id: 'zone1', x: 100, y: 100, width: 100, height: 100, enemyId: 4, count: 1 },
				{ id: 'zone2', x: 200, y: 200, width: 100, height: 100, enemyId: 5, count: 2 },
			];

			enemyZones.addZones(configs);
			expect(enemyZones.zoneConfigs).toHaveLength(2);
		});
	});

	describe('create', () => {
		it('should spawn enemies for each zone', () => {
			enemyZones.addZone({
				id: 'test',
				x: 100,
				y: 100,
				width: 100,
				height: 100,
				enemyId: 4,
				count: 3,
			});

			enemyZones.create();

			expect(Enemy).toHaveBeenCalledTimes(3);
			expect(mockScene.enemies).toHaveLength(3);
		});

		it('should set hasSpawned to true after creating', () => {
			enemyZones.addZone({
				id: 'test',
				x: 100,
				y: 100,
				width: 100,
				height: 100,
				enemyId: 4,
				count: 1,
			});

			enemyZones.create();
			expect(enemyZones.hasSpawned).toBe(true);
		});

		it('should not spawn twice if create is called again', () => {
			enemyZones.addZone({
				id: 'test',
				x: 100,
				y: 100,
				width: 100,
				height: 100,
				enemyId: 4,
				count: 1,
			});

			enemyZones.create();
			enemyZones.create(); // Second call should be ignored

			expect(Enemy).toHaveBeenCalledTimes(1);
		});

		it('should add collider for enemies', () => {
			enemyZones.addZone({
				id: 'test',
				x: 100,
				y: 100,
				width: 100,
				height: 100,
				enemyId: 4,
				count: 1,
			});

			enemyZones.create();

			expect(mockScene.physics.add.collider).toHaveBeenCalledWith(mockScene.enemies, undefined);
		});

		it('should create visual zones', () => {
			enemyZones.addZone({
				id: 'test_visual',
				x: 100,
				y: 100,
				width: 100,
				height: 100,
				enemyId: 4,
				count: 1,
			});

			enemyZones.create();

			expect(mockScene.add.zone).toHaveBeenCalledWith(100, 100, 100, 100);
		});

		it('should warn if enemy ID is not found', () => {
			const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

			enemyZones.addZone({
				id: 'invalid',
				x: 100,
				y: 100,
				width: 100,
				height: 100,
				enemyId: 999, // Invalid ID
				count: 1,
			});

			enemyZones.create();

			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining('Enemy ID 999 not found in EnemiesSeedConfig')
			);
			consoleSpy.mockRestore();
		});

		it('should use correct texture from enemy config', () => {
			enemyZones.addZone({
				id: 'bandit_zone',
				x: 100,
				y: 100,
				width: 100,
				height: 100,
				enemyId: 4, // Bandit
				count: 1,
			});

			enemyZones.create();

			expect(Enemy).toHaveBeenCalledWith(expect.anything(), expect.any(Number), expect.any(Number), 'bandit', 4);
		});
	});

	describe('getEnemiesInZone', () => {
		it('should return enemies within the specified zone', () => {
			enemyZones.addZone({
				id: 'test_zone',
				x: 100,
				y: 100,
				width: 200,
				height: 200,
				enemyId: 4,
				count: 2,
			});

			enemyZones.create();

			const enemies = enemyZones.getEnemiesInZone('test_zone');
			expect(enemies.length).toBeGreaterThan(0);
		});

		it('should return empty array for non-existent zone', () => {
			enemyZones.create();
			const enemies = enemyZones.getEnemiesInZone('nonexistent');
			expect(enemies).toEqual([]);
		});
	});

	describe('destroy', () => {
		it('should destroy all zones', () => {
			const mockZone = {
				setData: jest.fn(),
				getData: jest.fn(),
				destroy: jest.fn(),
				x: 100,
				y: 100,
				width: 100,
				height: 100,
			};
			mockScene.add.zone.mockReturnValue(mockZone);

			enemyZones.addZone({
				id: 'test',
				x: 100,
				y: 100,
				width: 100,
				height: 100,
				enemyId: 4,
				count: 1,
			});

			enemyZones.create();
			enemyZones.destroy();

			expect(mockZone.destroy).toHaveBeenCalled();
			expect(enemyZones.zones).toHaveLength(0);
		});

		it('should reset state after destroy', () => {
			enemyZones.addZone({
				id: 'test',
				x: 100,
				y: 100,
				width: 100,
				height: 100,
				enemyId: 4,
				count: 1,
			});

			enemyZones.create();
			enemyZones.destroy();

			expect(enemyZones.hasSpawned).toBe(false);
			expect(enemyZones.zoneConfigs).toHaveLength(0);
		});
	});
});

describe('CROSSROADS_ENEMY_ZONES', () => {
	// Note: CROSSROADS_ENEMY_ZONES is an exported constant, not affected by Phaser mocking
	it('should have 5 zone configurations', () => {
		expect(CROSSROADS_ENEMY_ZONES).toHaveLength(5);
	});

	it('should include west bandit zones', () => {
		const banditZones = CROSSROADS_ENEMY_ZONES.filter((z: IProgrammaticEnemyZone) => z.id.includes('bandit'));
		expect(banditZones.length).toBe(2);
		banditZones.forEach((zone: IProgrammaticEnemyZone) => {
			expect(zone.enemyId).toBe(4); // Bandit ID
		});
	});

	it('should include east wolf zones', () => {
		const wolfZones = CROSSROADS_ENEMY_ZONES.filter((z: IProgrammaticEnemyZone) => z.id.includes('wolves'));
		expect(wolfZones.length).toBe(2);
		wolfZones.forEach((zone: IProgrammaticEnemyZone) => {
			expect(zone.enemyId).toBe(5); // Wolf ID
		});
	});

	it('should include shadow scout patrol zone', () => {
		const scoutZone = CROSSROADS_ENEMY_ZONES.find((z: IProgrammaticEnemyZone) => z.id.includes('shadow_scout'));
		expect(scoutZone).toBeDefined();
		expect(scoutZone?.enemyId).toBe(6); // Shadow Scout ID
		expect(scoutZone?.count).toBe(1); // Only one elite
	});

	it('should have valid positions for all zones', () => {
		CROSSROADS_ENEMY_ZONES.forEach((zone: IProgrammaticEnemyZone) => {
			expect(zone.x).toBeGreaterThan(0);
			expect(zone.y).toBeGreaterThan(0);
			expect(zone.width).toBeGreaterThan(0);
			expect(zone.height).toBeGreaterThan(0);
		});
	});

	it('should have unique IDs for all zones', () => {
		const ids = CROSSROADS_ENEMY_ZONES.map((z: IProgrammaticEnemyZone) => z.id);
		const uniqueIds = [...new Set(ids)];
		expect(uniqueIds.length).toBe(ids.length);
	});

	it('should have positive enemy counts for all zones', () => {
		CROSSROADS_ENEMY_ZONES.forEach((zone: IProgrammaticEnemyZone) => {
			expect(zone.count).toBeGreaterThan(0);
		});
	});
});
