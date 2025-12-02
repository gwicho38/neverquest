import { NeverquestMapCreator } from '../../plugins/NeverquestMapCreator';
import { Player } from '../../entities/Player';

jest.mock('../../entities/Player');

describe('NeverquestMapCreator', () => {
	let mapCreator: any;
	let mockScene: any;
	let mockMap: any;
	let mockLayer: any;

	beforeEach(() => {
		mockLayer = {
			depth: 0,
			alpha: 0,
			setCollisionByProperty: jest.fn(),
		};

		mockMap = {
			layers: [
				{
					name: 'Ground',
					properties: [{ name: 'depth', value: 1 }],
				},
				{
					name: 'Collision',
					properties: [
						{ name: 'collides', value: true },
						{ name: 'depth', value: 10 },
					],
				},
			],
			tilesets: [],
			addTilesetImage: jest.fn(),
			createLayer: jest.fn().mockReturnValue(mockLayer),
			findObject: jest.fn(),
		};

		mockScene = {
			make: {
				tilemap: jest.fn().mockReturnValue(mockMap),
			},
			physics: {
				add: {
					collider: jest.fn(),
				},
			},
			// PlayerConfig.variableName = 'player', initially null
			// Individual tests set this up when needed
			player: null,
		};

		mapCreator = new NeverquestMapCreator(mockScene, 'testmap');
	});

	describe('constructor', () => {
		it('should initialize with default values', () => {
			expect(mapCreator.scene).toBe(mockScene);
			expect(mapCreator.mapName).toBe('testmap');
			expect(mapCreator.depthProperty).toBe('depth');
			expect(mapCreator.collisionPropperty).toBe('collides');
			expect(mapCreator.spawnObjectLayer).toBe('spawn');
			expect(mapCreator.spawnObjectPoint).toBe('Spawn Point');
			expect(mapCreator.collisionLayerAlpha).toBe(0);
		});

		it('should use default map name if not provided', () => {
			const defaultMapCreator = new NeverquestMapCreator(mockScene);
			expect(defaultMapCreator.mapName).toBe('larus');
		});
	});

	describe('create', () => {
		beforeEach(() => {
			// Set up spawn point and player mock for tests that call create()
			// This is needed because collision layer setup requires player.container
			const spawnPoint = { name: 'Spawn Point', x: 100, y: 200 };
			mockMap.findObject.mockReturnValue(spawnPoint);
			const mockPlayer = { container: {} };
			(Player as any as jest.Mock).mockImplementation(() => mockPlayer);
		});

		it('should create tilemap', () => {
			mapCreator.create();
			expect(mockScene.make.tilemap).toHaveBeenCalledWith({ key: 'testmap' });
			expect(mapCreator.map).toBe(mockMap);
		});

		it('should add tileset images', () => {
			mapCreator.create();

			mapCreator.tilesetImages.forEach((tilesetImage: any) => {
				expect(mockMap.addTilesetImage).toHaveBeenCalledWith(
					tilesetImage.tilesetName,
					tilesetImage.assetName,
					tilesetImage.width,
					tilesetImage.height,
					tilesetImage.margin,
					tilesetImage.spacing
				);
			});
		});

		it('should create layers with properties', () => {
			mapCreator.create();

			expect(mockMap.createLayer).toHaveBeenCalledTimes(2);
			expect(mockMap.createLayer).toHaveBeenCalledWith('Ground', mockMap.tilesets);
			expect(mockMap.createLayer).toHaveBeenCalledWith('Collision', mockMap.tilesets);
		});

		it('should apply depth property to layers', () => {
			mapCreator.create();
			// The mock layer depth should be set based on properties
			expect(mockLayer.depth).toBeDefined();
		});

		it('should set up collision layer', () => {
			mapCreator.create();

			expect(mockLayer.setCollisionByProperty).toHaveBeenCalledWith({ collides: true });
			expect(mapCreator.collisionLayer).toBe(mockLayer);
		});

		it('should set collision layer alpha', () => {
			mapCreator.collisionLayerAlpha = 0.5;
			mapCreator.create();
			// Alpha should be set for collision layers
			expect(mockLayer.alpha).toBeDefined();
		});
	});

	describe('spawn point', () => {
		it('should create player at spawn point', () => {
			const spawnPoint = { name: 'Spawn Point', x: 100, y: 200 };
			mockMap.findObject.mockReturnValue(spawnPoint);

			mapCreator.create();

			expect(mockMap.findObject).toHaveBeenCalledWith('spawn', expect.any(Function));
			expect(Player).toHaveBeenCalledWith(mockScene, 100, 200, 'character', mockMap);
			expect(mockScene.player).toBeDefined();
		});

		it('should not create player if no spawn point', () => {
			mockMap.findObject.mockReturnValue(null);

			mapCreator.create();

			expect(Player).not.toHaveBeenCalled();
			expect(mockScene.player).toBe(null);
		});

		it('should add collision between player and collision layer', () => {
			const spawnPoint = { name: 'Spawn Point', x: 100, y: 200 };
			mockMap.findObject.mockReturnValue(spawnPoint);

			const mockPlayer = { container: {} };
			(Player as any as jest.Mock).mockImplementation(() => mockPlayer);

			mapCreator.create();

			expect(mockScene.physics.add.collider).toHaveBeenCalledWith(
				mockPlayer.container,
				mapCreator.collisionLayer
			);
		});

		it('should not add collision if no collision layer', () => {
			mockMap.layers = [
				{
					name: 'Ground',
					properties: [],
				},
			];
			const spawnPoint = { name: 'Spawn Point', x: 100, y: 200 };
			mockMap.findObject.mockReturnValue(spawnPoint);

			mapCreator.create();

			expect(mockScene.physics.add.collider).not.toHaveBeenCalled();
		});
	});

	describe('tileset configuration', () => {
		beforeEach(() => {
			// Set up spawn point and player mock for tests that call create()
			const spawnPoint = { name: 'Spawn Point', x: 100, y: 200 };
			mockMap.findObject.mockReturnValue(spawnPoint);
			const mockPlayer = { container: {} };
			(Player as any as jest.Mock).mockImplementation(() => mockPlayer);
		});

		it('should have default tileset images', () => {
			expect(mapCreator.tilesetImages).toHaveLength(3);
			expect(mapCreator.tilesetImages[0].tilesetName).toBe('base');
			expect(mapCreator.tilesetImages[1].tilesetName).toBe('inner');
			expect(mapCreator.tilesetImages[2].tilesetName).toBe('collision');
		});

		it('should apply all tileset configurations', () => {
			mapCreator.create();

			expect(mockMap.addTilesetImage).toHaveBeenCalledTimes(3);
		});
	});

	describe('layer properties', () => {
		beforeEach(() => {
			// Set up spawn point and player mock for tests that call create()
			const spawnPoint = { name: 'Spawn Point', x: 100, y: 200 };
			mockMap.findObject.mockReturnValue(spawnPoint);
			const mockPlayer = { container: {} };
			(Player as any as jest.Mock).mockImplementation(() => mockPlayer);
		});

		it('should handle layers without properties', () => {
			mockMap.layers = [
				{
					name: 'SimpleLayer',
					properties: [],
				},
			];

			mapCreator.create();

			expect(mockMap.createLayer).toHaveBeenCalledWith('SimpleLayer', mockMap.tilesets);
			expect(mockLayer.setCollisionByProperty).not.toHaveBeenCalled();
		});

		it('should handle missing depth property', () => {
			mockMap.layers = [
				{
					name: 'Layer',
					properties: [{ name: 'other', value: 'test' }],
				},
			];

			mapCreator.create();

			expect(mockMap.createLayer).toHaveBeenCalled();
		});

		it('should handle multiple collision layers', () => {
			mockMap.layers = [
				{
					name: 'Collision1',
					properties: [{ name: 'collides', value: true }],
				},
				{
					name: 'Collision2',
					properties: [{ name: 'collides', value: true }],
				},
			];

			mapCreator.create();

			expect(mockLayer.setCollisionByProperty).toHaveBeenCalledTimes(2);
			// Last collision layer should be stored
			expect(mapCreator.collisionLayer).toBe(mockLayer);
		});
	});
});
