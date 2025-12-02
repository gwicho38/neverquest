/**
 * Tests for TerminalGame
 */

import { TerminalGame } from '../../terminal/TerminalGame';
import { TerminalRenderer } from '../../terminal/TerminalRenderer';
import { TerminalMap } from '../../terminal/TerminalMap';
import { TerminalEntity } from '../../terminal/entities/TerminalEntity';
import { AnimationTiming } from '../../consts/Numbers';
import { TerminalMessages, GameMessages } from '../../consts/Messages';

// Mock dependencies
jest.mock('../../terminal/TerminalRenderer');
jest.mock('../../terminal/TerminalMap');
jest.mock('../../terminal/entities/TerminalEntity');

describe('TerminalGame', () => {
	let mockRenderer: any;
	let mockMap: any;
	let mockPlayer: any;
	let mockEnemy: any;
	let mockScreenKey: jest.Mock;

	beforeEach(() => {
		jest.clearAllMocks();
		jest.useFakeTimers();

		// Mock screen key function
		mockScreenKey = jest.fn();

		// Mock renderer
		mockRenderer = {
			screen: {
				key: mockScreenKey,
			},
			log: jest.fn(),
			gameBox: {
				setContent: jest.fn(),
			},
			updateStatus: jest.fn(),
			render: jest.fn(),
			cleanup: jest.fn(),
		};
		(TerminalRenderer as jest.MockedClass<typeof TerminalRenderer>).mockImplementation(() => mockRenderer);

		// Mock player entity
		mockPlayer = {
			x: 5,
			y: 5,
			symbol: '@',
			entityName: 'Player',
			isPlayer: true,
			attributes: {
				health: 100,
				maxHealth: 100,
				atack: 10,
				defense: 5,
				level: 1,
				experience: 0,
				nextLevelExperience: 100,
				rawAttributes: { str: 1, agi: 1, vit: 1, dex: 1, int: 1 },
			},
			move: jest.fn(),
			takeDamage: jest.fn(),
			isAlive: jest.fn().mockReturnValue(true),
		} as any;

		// Mock enemy entity
		mockEnemy = {
			x: 6,
			y: 5,
			symbol: 'G',
			entityName: 'Goblin',
			isPlayer: false,
			attributes: {
				health: 50,
				maxHealth: 50,
				atack: 5,
				defense: 2,
			},
			move: jest.fn(),
			takeDamage: jest.fn(),
			isAlive: jest.fn().mockReturnValue(true),
		} as any;

		// Track entity creation
		let entityCount = 0;
		(TerminalEntity as jest.MockedClass<typeof TerminalEntity>).mockImplementation(() => {
			entityCount++;
			if (entityCount === 1) {
				return mockPlayer;
			}
			return mockEnemy;
		});

		// Mock map
		mockMap = {
			width: 80,
			height: 40,
			generateOverworld: jest.fn(),
			generateDungeon: jest.fn(),
			findSpawnPosition: jest.fn().mockReturnValue({ x: 5, y: 5 }),
			addEntity: jest.fn(),
			removeEntity: jest.fn(),
			getEntityAt: jest.fn().mockReturnValue(null),
			isWalkable: jest.fn().mockReturnValue(true),
			render: jest.fn().mockReturnValue('Map content'),
			animator: {
				animateAttack: jest.fn().mockResolvedValue(undefined),
				animateDamage: jest.fn().mockResolvedValue(undefined),
				animateDeath: jest.fn().mockResolvedValue(undefined),
				animateBlock: jest.fn().mockResolvedValue(undefined),
				animateParticleBurst: jest.fn().mockResolvedValue(undefined),
			},
		} as any;
		(TerminalMap as jest.MockedClass<typeof TerminalMap>).mockImplementation(() => mockMap);
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	describe('constructor', () => {
		it('should create renderer with debug flag', () => {
			new TerminalGame(true);

			expect(TerminalRenderer).toHaveBeenCalledWith(true);
		});

		it('should create renderer without debug flag', () => {
			new TerminalGame(false);

			expect(TerminalRenderer).toHaveBeenCalledWith(false);
		});

		it('should create map with correct dimensions', () => {
			new TerminalGame();

			expect(TerminalMap).toHaveBeenCalledWith(80, 40);
		});

		it('should generate overworld map', () => {
			new TerminalGame();

			expect(mockMap.generateOverworld).toHaveBeenCalled();
		});

		it('should create player entity', () => {
			new TerminalGame();

			expect(TerminalEntity).toHaveBeenCalled();
			expect(mockMap.addEntity).toHaveBeenCalled();
		});

		it('should log welcome messages', () => {
			new TerminalGame();

			expect(mockRenderer.log).toHaveBeenCalledWith(TerminalMessages.WELCOME);
			expect(mockRenderer.log).toHaveBeenCalledWith(TerminalMessages.CONTROLS_INFO);
			expect(mockRenderer.log).toHaveBeenCalledWith(TerminalMessages.QUEST_BEGIN);
		});

		it('should set up input handlers', () => {
			new TerminalGame();

			// Movement keys
			expect(mockScreenKey).toHaveBeenCalledWith(['up'], expect.any(Function));
			expect(mockScreenKey).toHaveBeenCalledWith(['down'], expect.any(Function));
			expect(mockScreenKey).toHaveBeenCalledWith(['left'], expect.any(Function));
			expect(mockScreenKey).toHaveBeenCalledWith(['right'], expect.any(Function));
			expect(mockScreenKey).toHaveBeenCalledWith(['w'], expect.any(Function));
			expect(mockScreenKey).toHaveBeenCalledWith(['s'], expect.any(Function));
			expect(mockScreenKey).toHaveBeenCalledWith(['a'], expect.any(Function));
			expect(mockScreenKey).toHaveBeenCalledWith(['d'], expect.any(Function));

			// Attack keys
			expect(mockScreenKey).toHaveBeenCalledWith(['space', 'j'], expect.any(Function));

			// Block keys
			expect(mockScreenKey).toHaveBeenCalledWith(['b', 'k'], expect.any(Function));

			// Help key
			expect(mockScreenKey).toHaveBeenCalledWith(['h'], expect.any(Function));
		});

		it('should render initial state', () => {
			new TerminalGame();

			expect(mockRenderer.gameBox.setContent).toHaveBeenCalled();
			expect(mockRenderer.updateStatus).toHaveBeenCalled();
			expect(mockRenderer.render).toHaveBeenCalled();
		});
	});

	describe('start', () => {
		it('should set running to true and log message', () => {
			const game = new TerminalGame();

			game.start();

			expect(mockRenderer.log).toHaveBeenCalledWith(TerminalMessages.GAME_STARTED);
		});

		it('should start game loop interval', () => {
			const game = new TerminalGame();

			game.start();

			// Advance timer to trigger game loop
			jest.advanceTimersByTime(AnimationTiming.TERMINAL_GAME_TICK_RATE + 1);

			// Game loop should have called render
			expect(mockRenderer.render).toHaveBeenCalled();
		});
	});

	describe('stop', () => {
		it('should set running to false', () => {
			const game = new TerminalGame();
			game.start();

			game.stop();

			expect(mockRenderer.cleanup).toHaveBeenCalled();
		});

		it('should clear game loop interval', () => {
			const game = new TerminalGame();
			game.start();

			const renderCallCount = mockRenderer.render.mock.calls.length;
			game.stop();

			// Advance timer - should not trigger more renders
			jest.advanceTimersByTime(AnimationTiming.TERMINAL_GAME_TICK_RATE * 2);

			// Render should not have been called more times
			expect(mockRenderer.render.mock.calls.length).toBe(renderCallCount);
		});

		it('should cleanup renderer', () => {
			const game = new TerminalGame();

			game.stop();

			expect(mockRenderer.cleanup).toHaveBeenCalled();
		});
	});

	describe('movePlayer via input', () => {
		it('should move player when path is walkable', () => {
			new TerminalGame();

			// Find the 'up' key handler
			const upHandler = mockScreenKey.mock.calls.find((call: any) => call[0].includes('up'));
			expect(upHandler).toBeDefined();

			// Call the handler
			upHandler![1]();

			expect(mockPlayer.move).toHaveBeenCalledWith(0, -1);
		});

		it('should not move player when path is blocked', () => {
			mockMap.isWalkable.mockReturnValue(false);

			new TerminalGame();

			const upHandler = mockScreenKey.mock.calls.find((call: any) => call[0].includes('up'));
			upHandler![1]();

			expect(mockPlayer.move).not.toHaveBeenCalled();
			expect(mockRenderer.log).toHaveBeenCalledWith(GameMessages.BUMP_INTO_WALL, 'red');
		});

		it('should not move when entity is in the way', () => {
			mockMap.getEntityAt.mockReturnValue(mockEnemy);

			new TerminalGame();

			const upHandler = mockScreenKey.mock.calls.find((call: any) => call[0].includes('up'));
			upHandler![1]();

			expect(mockPlayer.move).not.toHaveBeenCalled();
			expect(mockRenderer.log).toHaveBeenCalledWith(GameMessages.ENTITY_IN_WAY(mockEnemy.entityName), 'yellow');
		});

		it('should trigger walk animation with timeouts', () => {
			new TerminalGame();

			const renderCallsBefore = mockRenderer.render.mock.calls.length;

			const upHandler = mockScreenKey.mock.calls.find((call: any) => call[0].includes('up'));
			upHandler![1]();

			// Initial render
			expect(mockRenderer.render.mock.calls.length).toBeGreaterThan(renderCallsBefore);

			// Advance through animation steps
			jest.advanceTimersByTime(AnimationTiming.TERMINAL_WALK_ANIMATION_STEP_3 + 10);

			// More renders should have happened
			expect(mockRenderer.render.mock.calls.length).toBeGreaterThan(renderCallsBefore + 1);
		});
	});

	describe('attackNearby via input', () => {
		it('should attack adjacent enemy and trigger animations', async () => {
			mockMap.getEntityAt.mockImplementation((x: number, y: number) => {
				if (x === 5 && y === 4) return mockEnemy; // Above player
				return null;
			});

			new TerminalGame();

			const attackHandler = mockScreenKey.mock.calls.find((call: any) => call[0].includes('space'));
			expect(attackHandler).toBeDefined();

			// Call the attack handler
			await attackHandler![1]();

			expect(mockEnemy.takeDamage).toHaveBeenCalledWith(mockPlayer.attributes.atack);
			expect(mockMap.animator.animateAttack).toHaveBeenCalled();
			expect(mockMap.animator.animateDamage).toHaveBeenCalled();
		});

		it('should log when no enemies nearby', async () => {
			// Ensure no entity at any adjacent position
			mockMap.getEntityAt.mockReturnValue(null);

			new TerminalGame();

			const attackHandler = mockScreenKey.mock.calls.find((call: any) => call[0].includes('space'));
			await attackHandler![1]();

			expect(mockRenderer.log).toHaveBeenCalledWith(GameMessages.NO_ENEMIES_NEARBY, 'yellow');
		});
	});

	describe('blockAction via input', () => {
		it('should temporarily boost defense', async () => {
			const originalDefense = mockPlayer.attributes.defense;

			new TerminalGame();

			const blockHandler = mockScreenKey.mock.calls.find((call: any) => call[0].includes('b'));
			expect(blockHandler).toBeDefined();

			await blockHandler![1]();

			expect(mockPlayer.attributes.defense).toBe(originalDefense + 5);
			expect(mockMap.animator.animateBlock).toHaveBeenCalled();
			expect(mockRenderer.log).toHaveBeenCalledWith(TerminalMessages.SHIELD_RAISED_MESSAGE(5));
		});

		it('should reset defense after duration', async () => {
			const originalDefense = mockPlayer.attributes.defense;

			new TerminalGame();

			const blockHandler = mockScreenKey.mock.calls.find((call: any) => call[0].includes('b'));
			await blockHandler![1]();

			// Advance past block duration
			jest.advanceTimersByTime(AnimationTiming.BLOCK_DURATION + 10);

			expect(mockPlayer.attributes.defense).toBe(originalDefense);
			expect(mockRenderer.log).toHaveBeenCalledWith(TerminalMessages.SHIELD_LOWERED_MESSAGE);
		});
	});

	describe('showHelp via input', () => {
		it('should log help messages', () => {
			new TerminalGame();

			const helpHandler = mockScreenKey.mock.calls.find((call: any) => call[0].includes('h'));
			expect(helpHandler).toBeDefined();

			helpHandler![1]();

			expect(mockRenderer.log).toHaveBeenCalledWith(TerminalMessages.HELP_HEADER);
			expect(mockRenderer.log).toHaveBeenCalledWith(TerminalMessages.HELP_MOVE);
			expect(mockRenderer.log).toHaveBeenCalledWith(TerminalMessages.HELP_ATTACK);
			expect(mockRenderer.log).toHaveBeenCalledWith(TerminalMessages.HELP_BLOCK);
			expect(mockRenderer.log).toHaveBeenCalledWith(TerminalMessages.HELP_HELP);
			expect(mockRenderer.log).toHaveBeenCalledWith(TerminalMessages.HELP_QUIT);
			expect(mockRenderer.log).toHaveBeenCalledWith(TerminalMessages.HELP_ELEMENTS_HEADER);
		});
	});

	describe('enemy AI', () => {
		it('should move enemies towards player when in range', () => {
			// Create a fresh mock enemy that's close to player
			const closeEnemy = {
				x: 7,
				y: 5,
				symbol: 'G',
				entityName: 'Goblin',
				isPlayer: false,
				attributes: { health: 50, maxHealth: 50, atack: 5, defense: 2 },
				move: jest.fn(),
				takeDamage: jest.fn(),
				isAlive: jest.fn().mockReturnValue(true),
			} as any;

			// Reset mocks and set up for this test
			let entityCount = 0;
			(TerminalEntity as jest.MockedClass<typeof TerminalEntity>).mockImplementation(() => {
				entityCount++;
				if (entityCount === 1) return mockPlayer;
				return closeEnemy;
			});

			const game = new TerminalGame();
			game.start();

			// Advance to trigger update
			jest.advanceTimersByTime(AnimationTiming.TERMINAL_GAME_TICK_RATE + 1);

			// Enemy should have tried to move towards player
			expect(closeEnemy.move).toHaveBeenCalled();
		});
	});

	describe('status display', () => {
		it('should update status with player info', () => {
			new TerminalGame();

			expect(mockRenderer.updateStatus).toHaveBeenCalled();
			const statusCall = mockRenderer.updateStatus.mock.calls[0][0];

			expect(statusCall).toContain(TerminalMessages.STATUS_PLAYER_HEADER);
		});
	});

	describe('health and XP bars', () => {
		it('should create health bar in status', () => {
			new TerminalGame();

			const statusCall = mockRenderer.updateStatus.mock.calls[0][0];
			// Health bar uses red-fg for filled portion
			expect(statusCall).toContain('red-fg');
		});

		it('should create XP bar in status', () => {
			new TerminalGame();

			const statusCall = mockRenderer.updateStatus.mock.calls[0][0];
			// XP bar uses green-fg for filled portion
			expect(statusCall).toContain('green-fg');
		});
	});
});
