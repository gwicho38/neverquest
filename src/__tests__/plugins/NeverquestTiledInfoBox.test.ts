/**
 * Tests for NeverquestTiledInfoBox plugin
 */

import { NeverquestTiledInfoBox } from '../../plugins/NeverquestTiledInfoBox';

// Mock lodash
jest.mock('lodash', () => ({
	isNumber: (value: any) => typeof value === 'number',
}));

// Mock CHATS database
jest.mock('../../consts/DB_SEED/Chats', () => ({
	CHATS: [
		{ id: 1, chat: ['Hello!', 'Welcome to the game.'] },
		{ id: 2, chat: ['This is a sign.', 'It has information.'] },
		{ id: 3, chat: ['Another message.'] },
	],
}));

// Mock NeverquestDialogBox
jest.mock('../../plugins/NeverquestDialogBox', () => ({
	NeverquestDialogBox: jest.fn().mockImplementation(() => ({
		create: jest.fn(),
		canShowDialog: true,
		isOverlapingChat: false,
		actionButton: { visible: false },
		interactionIcon: {
			visible: false,
			setPosition: jest.fn(),
		},
		chat: null,
		allProperties: null,
	})),
}));

describe('NeverquestTiledInfoBox', () => {
	let infoBox: NeverquestTiledInfoBox;
	let mockScene: any;
	let mockUiScene: any;
	let mockPlayer: any;
	let mockMap: any;
	let mockZone: any;
	let mockPhysics: any;
	let overlapCallback: any;
	let processCallback: any;

	beforeEach(() => {
		// Mock zone
		mockZone = {
			setOrigin: jest.fn().mockReturnThis(),
			body: {
				immovable: false,
			},
		};

		// Mock physics
		mockPhysics = {
			add: {
				existing: jest.fn(),
				overlap: jest.fn((zones, hitZone, callback, processFunc) => {
					overlapCallback = callback;
					processCallback = processFunc;
				}),
			},
		};

		// Mock map
		mockMap = {
			getObjectLayer: jest.fn((layerName: string) => {
				if (layerName === 'info') {
					return {
						objects: [
							{
								x: 100,
								y: 200,
								width: 50,
								height: 50,
								properties: [{ name: 'messageID', value: 1 }],
							},
							{
								x: 300,
								y: 400,
								width: 60,
								height: 60,
								properties: [{ name: 'messageID', value: 2 }],
							},
						],
					};
				}
				return null;
			}),
		};

		// Mock player
		mockPlayer = {
			container: {
				x: 100,
				y: 100,
				body: {
					height: 32,
				},
			},
			hitZone: { type: 'hitZone' },
			canAtack: true,
		};

		// Mock scene
		mockScene = {
			add: {
				zone: jest.fn(() => mockZone),
			},
			physics: mockPhysics,
		};

		// Mock UI scene
		mockUiScene = {
			add: jest.fn(),
		};

		// Suppress console warnings
		jest.spyOn(console, 'warn').mockImplementation(() => {});
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe('Constructor', () => {
		it('should initialize with scene, player, map, and uiScene', () => {
			infoBox = new NeverquestTiledInfoBox(mockScene, mockPlayer, mockMap, mockUiScene);

			expect(infoBox.scene).toBe(mockScene);
			expect(infoBox.player).toBe(mockPlayer);
			expect(infoBox.map).toBe(mockMap);
			expect(infoBox.uiScene).toBe(mockUiScene);
		});

		it('should create NeverquestDialogBox with uiScene and player', () => {
			infoBox = new NeverquestTiledInfoBox(mockScene, mockPlayer, mockMap, mockUiScene);

			const { NeverquestDialogBox } = jest.requireMock('../../plugins/NeverquestDialogBox');
			expect(NeverquestDialogBox).toHaveBeenCalledWith(mockUiScene, mockPlayer);
		});

		it('should set default tiledObjectLayer to "info"', () => {
			infoBox = new NeverquestTiledInfoBox(mockScene, mockPlayer, mockMap, mockUiScene);

			expect(infoBox.tiledObjectLayer).toBe('info');
		});

		it('should set default messageAttribute to "messageID"', () => {
			infoBox = new NeverquestTiledInfoBox(mockScene, mockPlayer, mockMap, mockUiScene);

			expect(infoBox.messageAttribute).toBe('messageID');
		});

		it('should store neverquestDialogBox instance', () => {
			infoBox = new NeverquestTiledInfoBox(mockScene, mockPlayer, mockMap, mockUiScene);

			expect(infoBox.neverquestDialogBox).toBeDefined();
		});
	});

	describe('create()', () => {
		beforeEach(() => {
			infoBox = new NeverquestTiledInfoBox(mockScene, mockPlayer, mockMap, mockUiScene);
		});

		it('should call neverquestDialogBox.create()', () => {
			infoBox.create();

			expect(infoBox.neverquestDialogBox.create).toHaveBeenCalled();
		});

		it('should get object layer from map', () => {
			infoBox.create();

			expect(mockMap.getObjectLayer).toHaveBeenCalledWith('info');
		});

		it('should create zones for each info object', () => {
			infoBox.create();

			// Should create 2 zones (from mockMap objects)
			expect(mockScene.add.zone).toHaveBeenCalledTimes(2);
			expect(mockScene.add.zone).toHaveBeenCalledWith(100, 200, 50, 50);
			expect(mockScene.add.zone).toHaveBeenCalledWith(300, 400, 60, 60);
		});

		it('should add physics to each zone', () => {
			infoBox.create();

			expect(mockPhysics.add.existing).toHaveBeenCalledTimes(2);
			expect(mockPhysics.add.existing).toHaveBeenCalledWith(mockZone);
		});

		it('should set zone origin to 0,0', () => {
			infoBox.create();

			expect(mockZone.setOrigin).toHaveBeenCalledWith(0, 0);
		});

		it('should set zone body as immovable', () => {
			infoBox.create();

			expect(mockZone.body.immovable).toBe(true);
		});

		it('should add overlap collider between zones and player hitZone', () => {
			infoBox.create();

			expect(mockPhysics.add.overlap).toHaveBeenCalledWith(
				expect.any(Array),
				mockPlayer.hitZone,
				expect.any(Function),
				expect.any(Function)
			);
		});

		it('should handle object layer not found', () => {
			mockMap.getObjectLayer.mockReturnValue(null);

			expect(() => {
				infoBox.create();
			}).not.toThrow();
		});

		it('should handle object layer with no objects', () => {
			mockMap.getObjectLayer.mockReturnValue({ objects: null });

			expect(() => {
				infoBox.create();
			}).not.toThrow();
		});

		it('should handle object layer with empty objects array', () => {
			mockMap.getObjectLayer.mockReturnValue({ objects: [] });

			expect(() => {
				infoBox.create();
			}).not.toThrow();

			expect(mockScene.add.zone).not.toHaveBeenCalled();
		});

		it('should skip objects without messageID property', () => {
			mockMap.getObjectLayer.mockReturnValue({
				objects: [
					{
						x: 100,
						y: 200,
						width: 50,
						height: 50,
						properties: [{ name: 'otherProperty', value: 'test' }],
					},
				],
			});

			infoBox.create();

			// Should create zone but not add to physics (no valid messageID)
			expect(mockScene.add.zone).toHaveBeenCalledTimes(1);
			expect(mockPhysics.add.existing).not.toHaveBeenCalled();
		});

		it('should skip objects without properties', () => {
			mockMap.getObjectLayer.mockReturnValue({
				objects: [
					{
						x: 100,
						y: 200,
						width: 50,
						height: 50,
					},
				],
			});

			infoBox.create();

			expect(mockScene.add.zone).toHaveBeenCalledTimes(1);
			expect(mockPhysics.add.existing).not.toHaveBeenCalled();
		});

		it('should skip objects with non-number messageID', () => {
			mockMap.getObjectLayer.mockReturnValue({
				objects: [
					{
						x: 100,
						y: 200,
						width: 50,
						height: 50,
						properties: [{ name: 'messageID', value: 'not-a-number' }],
					},
				],
			});

			infoBox.create();

			expect(mockScene.add.zone).toHaveBeenCalledTimes(1);
			expect(mockPhysics.add.existing).not.toHaveBeenCalled();
		});

		it('should warn when chat ID not found in database', () => {
			const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
			mockMap.getObjectLayer.mockReturnValue({
				objects: [
					{
						x: 100,
						y: 200,
						width: 50,
						height: 50,
						properties: [{ name: 'messageID', value: 999 }],
					},
				],
			});

			infoBox.create();

			expect(warnSpy).toHaveBeenCalledWith('Chat with ID 999 not found');
		});

		it('should not create physics zone for invalid chat ID', () => {
			mockMap.getObjectLayer.mockReturnValue({
				objects: [
					{
						x: 100,
						y: 200,
						width: 50,
						height: 50,
						properties: [{ name: 'messageID', value: 999 }],
					},
				],
			});

			infoBox.create();

			expect(mockPhysics.add.existing).not.toHaveBeenCalled();
		});

		it('should handle objects with missing x/y coordinates', () => {
			mockMap.getObjectLayer.mockReturnValue({
				objects: [
					{
						width: 50,
						height: 50,
						properties: [{ name: 'messageID', value: 1 }],
					},
				],
			});

			expect(() => {
				infoBox.create();
			}).not.toThrow();
		});
	});

	describe('Overlap Callback', () => {
		beforeEach(() => {
			infoBox = new NeverquestTiledInfoBox(mockScene, mockPlayer, mockMap, mockUiScene);
			infoBox.create();
		});

		it('should set isOverlapingChat to true', () => {
			const mockZoneWithChat = {
				chat: ['Hello!'],
				properties: [] as any[],
			};

			overlapCallback(mockZoneWithChat);

			expect(infoBox.neverquestDialogBox.isOverlapingChat).toBe(true);
		});

		it('should make action button visible', () => {
			const mockZoneWithChat = {
				chat: ['Hello!'],
				properties: [] as any[],
			};

			overlapCallback(mockZoneWithChat);

			expect(infoBox.neverquestDialogBox.actionButton.visible).toBe(true);
		});

		it('should make interaction icon visible', () => {
			const mockZoneWithChat = {
				chat: ['Hello!'],
				properties: [] as any[],
			};

			overlapCallback(mockZoneWithChat);

			expect(infoBox.neverquestDialogBox.interactionIcon.visible).toBe(true);
		});

		it('should position interaction icon above player', () => {
			const mockZoneWithChat = {
				chat: ['Hello!'],
				properties: [] as any[],
			};

			overlapCallback(mockZoneWithChat);

			expect(infoBox.neverquestDialogBox.interactionIcon.setPosition).toHaveBeenCalledWith(
				100, // player.container.x
				20 // player.container.y - player.container.body.height * 2.5 = 100 - 32*2.5 = 100 - 80 = 20
			);
		});

		it('should set dialog chat content', () => {
			const mockZoneWithChat = {
				chat: ['Hello!', 'Welcome!'],
				properties: [] as any[],
			};

			overlapCallback(mockZoneWithChat);

			expect(infoBox.neverquestDialogBox.chat).toEqual(['Hello!', 'Welcome!']);
		});

		it('should NOT disable player attack during overlap (dialog system handles this)', () => {
			// Per design: overlap callbacks only manage UI visibility
			// Each system (dialog, battle) owns its own state changes
			const mockZoneWithChat = {
				chat: ['Hello!'],
				properties: [] as any[],
			};

			overlapCallback(mockZoneWithChat);

			// canAtack should remain unchanged - dialog system disables it when dialog actually opens
			expect(mockPlayer.canAtack).toBe(true);
		});
	});

	describe('Process Callback', () => {
		beforeEach(() => {
			infoBox = new NeverquestTiledInfoBox(mockScene, mockPlayer, mockMap, mockUiScene);
			infoBox.create();
		});

		it('should return canShowDialog value when true', () => {
			infoBox.neverquestDialogBox.canShowDialog = true;

			const result = processCallback({});

			expect(result).toBe(true);
		});

		it('should return canShowDialog value when false', () => {
			infoBox.neverquestDialogBox.canShowDialog = false;

			const result = processCallback({});

			expect(result).toBe(false);
		});
	});

	describe('Integration', () => {
		it('should handle complete workflow: create zones, overlap, show dialog', () => {
			infoBox = new NeverquestTiledInfoBox(mockScene, mockPlayer, mockMap, mockUiScene);
			infoBox.create();

			// Simulate overlap
			const mockZoneWithChat = {
				chat: ['Test message'],
				properties: [{ name: 'test', value: 'data' }],
			};

			overlapCallback(mockZoneWithChat);

			expect(infoBox.neverquestDialogBox.isOverlapingChat).toBe(true);
			expect(infoBox.neverquestDialogBox.actionButton.visible).toBe(true);
			expect(infoBox.neverquestDialogBox.chat).toEqual(['Test message']);
		});

		it('should handle multiple zones correctly', () => {
			infoBox = new NeverquestTiledInfoBox(mockScene, mockPlayer, mockMap, mockUiScene);
			infoBox.create();

			// Should have created 2 zones from default mock data
			expect(mockScene.add.zone).toHaveBeenCalledTimes(2);
			expect(mockPhysics.add.existing).toHaveBeenCalledTimes(2);
		});

		it('should allow custom tiledObjectLayer and messageAttribute', () => {
			infoBox = new NeverquestTiledInfoBox(mockScene, mockPlayer, mockMap, mockUiScene);
			infoBox.tiledObjectLayer = 'customLayer';
			infoBox.messageAttribute = 'customAttribute';

			mockMap.getObjectLayer.mockReturnValue({
				objects: [
					{
						x: 100,
						y: 200,
						width: 50,
						height: 50,
						properties: [{ name: 'customAttribute', value: 1 }],
					},
				],
			});

			infoBox.create();

			expect(mockMap.getObjectLayer).toHaveBeenCalledWith('customLayer');
		});
	});

	describe('Edge Cases', () => {
		it('should handle zero-sized zones', () => {
			mockMap.getObjectLayer.mockReturnValue({
				objects: [
					{
						x: 100,
						y: 200,
						width: 0,
						height: 0,
						properties: [{ name: 'messageID', value: 1 }],
					},
				],
			});

			infoBox = new NeverquestTiledInfoBox(mockScene, mockPlayer, mockMap, mockUiScene);

			expect(() => {
				infoBox.create();
			}).not.toThrow();
		});

		it('should handle negative coordinates', () => {
			mockMap.getObjectLayer.mockReturnValue({
				objects: [
					{
						x: -100,
						y: -200,
						width: 50,
						height: 50,
						properties: [{ name: 'messageID', value: 1 }],
					},
				],
			});

			infoBox = new NeverquestTiledInfoBox(mockScene, mockPlayer, mockMap, mockUiScene);

			expect(() => {
				infoBox.create();
			}).not.toThrow();
		});

		it('should handle very large coordinates', () => {
			mockMap.getObjectLayer.mockReturnValue({
				objects: [
					{
						x: 999999,
						y: 888888,
						width: 50,
						height: 50,
						properties: [{ name: 'messageID', value: 1 }],
					},
				],
			});

			infoBox = new NeverquestTiledInfoBox(mockScene, mockPlayer, mockMap, mockUiScene);

			expect(() => {
				infoBox.create();
			}).not.toThrow();
		});

		it('should handle empty properties array', () => {
			mockMap.getObjectLayer.mockReturnValue({
				objects: [
					{
						x: 100,
						y: 200,
						width: 50,
						height: 50,
						properties: [],
					},
				],
			});

			infoBox = new NeverquestTiledInfoBox(mockScene, mockPlayer, mockMap, mockUiScene);

			expect(() => {
				infoBox.create();
			}).not.toThrow();
		});

		it('should handle messageID value of 0', () => {
			const { CHATS } = jest.requireMock('../../consts/DB_SEED/Chats');
			CHATS.push({ id: 0, chat: ['Zero message'] });

			mockMap.getObjectLayer.mockReturnValue({
				objects: [
					{
						x: 100,
						y: 200,
						width: 50,
						height: 50,
						properties: [{ name: 'messageID', value: 0 }],
					},
				],
			});

			infoBox = new NeverquestTiledInfoBox(mockScene, mockPlayer, mockMap, mockUiScene);

			expect(() => {
				infoBox.create();
			}).not.toThrow();
		});

		it('should handle multiple properties on same object', () => {
			mockMap.getObjectLayer.mockReturnValue({
				objects: [
					{
						x: 100,
						y: 200,
						width: 50,
						height: 50,
						properties: [
							{ name: 'otherProp', value: 'test' },
							{ name: 'messageID', value: 1 },
							{ name: 'anotherProp', value: 123 },
						],
					},
				],
			});

			infoBox = new NeverquestTiledInfoBox(mockScene, mockPlayer, mockMap, mockUiScene);

			expect(() => {
				infoBox.create();
			}).not.toThrow();

			expect(mockPhysics.add.existing).toHaveBeenCalled();
		});

		it('should handle player with different body height', () => {
			mockPlayer.container.body.height = 64;
			infoBox = new NeverquestTiledInfoBox(mockScene, mockPlayer, mockMap, mockUiScene);
			infoBox.create();

			const mockZoneWithChat = {
				chat: ['Test'],
				properties: [] as any[],
			};

			overlapCallback(mockZoneWithChat);

			expect(infoBox.neverquestDialogBox.interactionIcon.setPosition).toHaveBeenCalledWith(
				100,
				-60 // 100 - 64*2.5 = 100 - 160 = -60
			);
		});
	});
});
