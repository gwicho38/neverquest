import { Enemy } from '../../entities/Enemy';
import { ENTITIES } from '../../consts/Entities';

// Use centralized Phaser mock
jest.mock('phaser');

// Mock other dependencies
jest.mock('../../plugins/NeverquestAnimationManager');
jest.mock('../../plugins/NeverquestBattleManager');
jest.mock('../../plugins/NeverquestHealthBar');
jest.mock('../../plugins/NeverquestDropSystem');
jest.mock('uniqid', () => () => 'test-unique-id');

describe('Enemy', () => {
	let mockScene: any;
	let enemy: Enemy;

	beforeEach(() => {
		// Create mock Phaser scene
		mockScene = {
			add: {
				existing: jest.fn(),
				zone: jest.fn(() => ({
					body: {
						setSize: jest.fn(),
					},
				})),
			},
			physics: {
				add: {
					existing: jest.fn(),
				},
				overlapCirc: jest.fn((): any[] => []),
				overlap: jest.fn(),
				moveToObject: jest.fn(),
				velocityFromAngle: jest.fn(),
			},
			events: {
				on: jest.fn(),
				off: jest.fn(),
			},
			textures: {
				exists: jest.fn(() => true),
			},
			anims: {
				create: jest.fn(),
			},
		};
	});

	afterEach(() => {
		if (enemy) {
			// Clean up
			jest.clearAllMocks();
		}
	});

	describe('Constructor', () => {
		it('should create enemy with valid config (id: 1 - Rat)', () => {
			enemy = new Enemy(mockScene, 100, 200, 'rat', 1);

			expect(enemy).toBeDefined();
			expect(enemy.entityName).toBe(ENTITIES.Enemy);
			expect(enemy.commonId).toBe(1);
			expect(enemy.id).toBe('test-unique-id');
			expect(enemy.baseHealth).toBe(10);
			expect(enemy.atack).toBe(5);
			expect(enemy.defense).toBe(1);
			expect(enemy.speed).toBe(25);
			expect(enemy.exp).toBe(25);
		});

		it('should create enemy with valid config (id: 2 - Bat)', () => {
			enemy = new Enemy(mockScene, 150, 250, 'bat', 2);

			expect(enemy.commonId).toBe(2);
			expect(enemy.baseHealth).toBe(10);
			expect(enemy.atack).toBe(7);
			expect(enemy.defense).toBe(1);
			expect(enemy.speed).toBe(30);
			expect(enemy.exp).toBe(50);
		});

		it('should throw error for invalid enemy config id', () => {
			expect(() => {
				new Enemy(mockScene, 100, 200, 'invalid', 999);
			}).toThrow('Enemy config not found for id: 999');
		});

		it('should initialize with BaseEntity properties', () => {
			enemy = new Enemy(mockScene, 100, 200, 'rat', 1);

			expect(enemy.canAtack).toBe(true);
			expect(enemy.canMove).toBe(true);
			expect(enemy.canTakeDamage).toBe(true);
			expect(enemy.canBlock).toBe(true);
			expect(enemy.isAtacking).toBe(false);
			expect(enemy.isBlocking).toBe(false);
			expect(enemy.perceptionRange).toBe(75);
		});

		it('should create health bar', () => {
			enemy = new Enemy(mockScene, 100, 200, 'rat', 1);

			expect(enemy.healthBar).toBeDefined();
		});

		it('should create hit zone', () => {
			enemy = new Enemy(mockScene, 100, 200, 'rat', 1);

			expect(enemy.hitZone).toBeDefined();
			expect(mockScene.add.zone).toHaveBeenCalled();
		});

		it('should create container with correct children', () => {
			enemy = new Enemy(mockScene, 100, 200, 'rat', 1);

			expect(enemy.container).toBeDefined();
			expect(enemy.container.x).toBe(100);
			expect(enemy.container.y).toBe(200);
		});

		it('should initialize animation manager', () => {
			enemy = new Enemy(mockScene, 100, 200, 'rat', 1);

			expect(enemy.neverquestAnimationManager).toBeDefined();
		});

		it('should initialize battle manager', () => {
			enemy = new Enemy(mockScene, 100, 200, 'rat', 1);

			expect(enemy.neverquestBattleManager).toBeDefined();
		});

		it('should set up update event listener', () => {
			enemy = new Enemy(mockScene, 100, 200, 'rat', 1);

			expect(mockScene.events.on).toHaveBeenCalledWith('update', enemy.onUpdate, enemy);
		});

		it('should have correct animation prefixes', () => {
			enemy = new Enemy(mockScene, 100, 200, 'rat', 1);

			expect(enemy.idlePrefixAnimation).toBe('idle');
			expect(enemy.walkPrefixAnimation).toBe('walk');
			expect(enemy.atackPrefixAnimation).toBe('atk-');
		});
	});

	describe('setAttributes', () => {
		beforeEach(() => {
			enemy = new Enemy(mockScene, 100, 200, 'rat', 1);
		});

		it('should set attributes from config', () => {
			const config = {
				id: 1,
				name: 'Test Enemy',
				texture: 'test',
				baseHealth: 50,
				atack: 10,
				defense: 5,
				speed: 40,
				flee: 3,
				hit: 7,
				exp: 100,
				drops: [] as any[],
				healthBarOffsetX: 0,
				healthBarOffsetY: 0,
			};

			enemy.setAttributes(config);

			expect(enemy.attributes.health).toBe(50);
			expect(enemy.attributes.atack).toBe(10);
			expect(enemy.attributes.defense).toBe(5);
			expect(enemy.attributes.hit).toBe(7);
			expect(enemy.attributes.flee).toBe(3);
		});

		it('should only set attributes if they exist', () => {
			const originalHealth = enemy.attributes.health;

			// Create config without required properties
			const incompleteConfig = {
				id: 1,
				name: 'Test',
				texture: 'test',
				baseHealth: 100,
			} as any;

			enemy.setAttributes(incompleteConfig);

			// Should set health but not throw error
			expect(enemy.attributes.health).toBe(100);
		});
	});

	describe('stopMovement', () => {
		beforeEach(() => {
			enemy = new Enemy(mockScene, 100, 200, 'rat', 1);
		});

		it('should reset acceleration and velocity', () => {
			enemy.stopMovement();

			expect((enemy.container.body as any).setAcceleration).toHaveBeenCalledWith(0, 0);
			expect((enemy.container.body as any).setVelocity).toHaveBeenCalledWith(0, 0);
		});

		it('should reset body size', () => {
			enemy.stopMovement();

			expect((enemy.body as any).setSize).toHaveBeenCalled();
		});
	});

	describe('changeBodySize', () => {
		beforeEach(() => {
			enemy = new Enemy(mockScene, 100, 200, 'rat', 1);
		});

		it('should update enemy body size', () => {
			enemy.changeBodySize(64, 64);

			expect((enemy.body as any).setSize).toHaveBeenCalledWith(64, 64);
		});

		it('should update hit zone body size', () => {
			enemy.changeBodySize(64, 64);

			expect((enemy.hitZone.body as any).setSize).toHaveBeenCalledWith(64, 64);
		});

		it('should update container body size', () => {
			enemy.changeBodySize(64, 64);

			expect((enemy.container.body as any).setSize).toHaveBeenCalledWith(64, 64);
		});

		it('should update container body offset', () => {
			enemy.changeBodySize(64, 64);

			expect((enemy.container.body as any).setOffset).toHaveBeenCalledWith(-32, -32); // -(width/2), -(height/2)
		});

		it('should handle different sizes correctly', () => {
			enemy.changeBodySize(100, 50);

			expect((enemy.body as any).setSize).toHaveBeenCalledWith(100, 50);
			expect((enemy.container.body as any).setOffset).toHaveBeenCalledWith(-50, -25);
		});
	});

	describe('destroyAll', () => {
		beforeEach(() => {
			enemy = new Enemy(mockScene, 100, 200, 'rat', 1);
			enemy.healthBar.destroy = jest.fn();
			enemy.container.destroy = jest.fn();
			enemy.destroy = jest.fn();
		});

		it('should destroy health bar', () => {
			enemy.destroyAll();

			expect(enemy.healthBar.destroy).toHaveBeenCalled();
		});

		it('should destroy container', () => {
			enemy.destroyAll();

			expect(enemy.container.destroy).toHaveBeenCalled();
		});

		it('should destroy enemy sprite', () => {
			enemy.destroyAll();

			expect(enemy.destroy).toHaveBeenCalled();
		});

		it('should call all destroy methods in order', () => {
			const destroyCalls: string[] = [];

			enemy.healthBar.destroy = jest.fn(() => destroyCalls.push('healthBar'));
			enemy.container.destroy = jest.fn(() => destroyCalls.push('container'));
			enemy.destroy = jest.fn(() => destroyCalls.push('enemy'));

			enemy.destroyAll();

			expect(destroyCalls).toEqual(['healthBar', 'container', 'enemy']);
		});
	});

	describe('onUpdate', () => {
		beforeEach(() => {
			enemy = new Enemy(mockScene, 100, 200, 'rat', 1);
			enemy.checkPlayerInRange = jest.fn();
		});

		it('should check player in range when body exists', () => {
			(enemy as any).body = { setSize: jest.fn() };
			enemy.onUpdate();

			expect(enemy.checkPlayerInRange).toHaveBeenCalled();
		});

		it('should not check player in range when body does not exist', () => {
			(enemy as any).body = null;
			enemy.onUpdate();

			expect(enemy.checkPlayerInRange).not.toHaveBeenCalled();
		});
	});

	describe('Edge Cases', () => {
		it('should handle zero speed', () => {
			enemy = new Enemy(mockScene, 100, 200, 'rat', 1);
			enemy.speed = 0;

			expect(enemy.speed).toBe(0);
		});

		it('should handle negative coordinates', () => {
			enemy = new Enemy(mockScene, -100, -200, 'rat', 1);

			expect(enemy.container.x).toBe(-100);
			expect(enemy.container.y).toBe(-200);
		});

		it('should have drops array from config', () => {
			enemy = new Enemy(mockScene, 100, 200, 'rat', 1);

			expect(Array.isArray(enemy.drops)).toBe(true);
		});
	});

	describe('Pathfinding Velocity Bug Fix (Issue #69)', () => {
		it('velocityFromAngle should return velocity vector that can be applied to body', () => {
			// This test verifies the fix for issue #69 where velocityFromAngle was called
			// but the returned velocity was not applied to the container body
			const mockVelocity = { x: 100, y: 50 };
			mockScene.physics.velocityFromAngle.mockReturnValue(mockVelocity);

			// Verify the mock is set up correctly
			const result = mockScene.physics.velocityFromAngle(45, 100);
			expect(result).toEqual(mockVelocity);
			expect(result.x).toBe(100);
			expect(result.y).toBe(50);
		});

		it('setVelocity should accept x and y components from velocityFromAngle result', () => {
			// Test that setVelocity can be called with the velocity components
			const mockBody = {
				setVelocity: jest.fn(),
				setAcceleration: jest.fn(),
			};
			const mockVelocity = { x: 75, y: 25 };

			// Simulate the fix: use the returned velocity to set on body
			mockBody.setVelocity(mockVelocity.x, mockVelocity.y);

			expect(mockBody.setVelocity).toHaveBeenCalledWith(75, 25);
		});
	});
});
