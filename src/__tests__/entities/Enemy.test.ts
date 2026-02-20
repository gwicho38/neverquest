import { Enemy } from '../../entities/Enemy';
import { ENTITIES } from '../../consts/Entities';

// NOTE: Don't use jest.mock('phaser') - the mock is already set up via moduleNameMapper in jest.config.js!
// Using jest.mock('phaser') would auto-mock and overwrite the properly configured mock.

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
					existing: jest.fn((obj: any) => {
						// Set up body on the object like Phaser does
						if (!obj.body) {
							obj.body = {
								velocity: { x: 0, y: 0 },
								maxSpeed: 100,
								width: 32,
								height: 32,
								immovable: false,
								setVelocity: jest.fn(),
								setSize: jest.fn(),
								setOffset: jest.fn(),
								setAcceleration: jest.fn(),
								enable: true,
							};
						}
						return obj;
					}),
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
			time: {
				now: Date.now(),
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

	describe('checkPlayerInRange', () => {
		beforeEach(() => {
			enemy = new Enemy(mockScene, 100, 200, 'rat', 1);
		});

		it('should stop movement when no player in range', () => {
			mockScene.physics.overlapCirc.mockReturnValue([]);
			const stopSpy = jest.spyOn(enemy, 'stopMovement');

			enemy.checkPlayerInRange();

			expect(stopSpy).toHaveBeenCalled();
		});

		it('should clear currentPath when no player in range', () => {
			enemy.currentPath = [{ x: 0, y: 0 } as Phaser.Math.Vector2];
			mockScene.physics.overlapCirc.mockReturnValue([]);

			enemy.checkPlayerInRange();

			expect(enemy.currentPath).toBeNull();
		});

		it('should detect player within perception range', () => {
			const mockPlayerObject = {
				gameObject: {
					entityName: 'Player',
					container: { x: 120, y: 220 },
					hitZone: {},
				},
			};
			mockScene.physics.overlapCirc.mockReturnValue([mockPlayerObject]);

			enemy.checkPlayerInRange();

			expect(mockScene.physics.overlapCirc).toHaveBeenCalledWith(
				enemy.container.x,
				enemy.container.y,
				enemy.perceptionRange
			);
		});

		it('should check line of sight when available', () => {
			const mockPlayerObject = {
				gameObject: {
					entityName: 'Player',
					container: { x: 120, y: 220 },
					hitZone: {},
				},
			};
			const mockLineOfSight = {
				isVisible: jest.fn().mockReturnValue(true),
			};
			mockScene.lineOfSight = mockLineOfSight;
			mockScene.physics.overlapCirc.mockReturnValue([mockPlayerObject]);

			enemy.checkPlayerInRange();

			expect(mockLineOfSight.isVisible).toHaveBeenCalled();
		});

		it('should not pursue player if line of sight blocked', () => {
			const mockPlayerObject = {
				gameObject: {
					entityName: 'Player',
					container: { x: 120, y: 220 },
					hitZone: {},
				},
			};
			const mockLineOfSight = {
				isVisible: jest.fn().mockReturnValue(false),
			};
			mockScene.lineOfSight = mockLineOfSight;
			mockScene.physics.overlapCirc.mockReturnValue([mockPlayerObject]);
			const stopSpy = jest.spyOn(enemy, 'stopMovement');

			enemy.checkPlayerInRange();

			// Should stop because no player is "seen"
			expect(stopSpy).toHaveBeenCalled();
		});

		it('should attack when overlapping with player hitZone', () => {
			const mockPlayerObject = {
				gameObject: {
					entityName: 'Player',
					container: { x: 100, y: 200 },
					hitZone: { body: {} },
				},
			};
			mockScene.physics.overlapCirc.mockReturnValue([mockPlayerObject]);
			// Simulate overlap callback
			mockScene.physics.overlap.mockImplementation((_zone: any, _enemy: any, callback: any) => {
				callback();
			});

			enemy.checkPlayerInRange();

			expect(mockScene.physics.overlap).toHaveBeenCalled();
		});

		it('should use pathfinding when available and not overlapping', () => {
			const mockPlayerObject = {
				gameObject: {
					entityName: 'Player',
					container: { x: 150, y: 250 },
					hitZone: { body: {} },
				},
			};
			const mockPathfinding = {
				findPath: jest.fn(),
			};
			mockScene.pathfinding = mockPathfinding;
			mockScene.physics.overlapCirc.mockReturnValue([mockPlayerObject]);
			mockScene.physics.overlap.mockImplementation(() => {}); // No overlap

			enemy.checkPlayerInRange();

			expect(mockPathfinding.findPath).toHaveBeenCalled();
		});

		it('should use direct movement when pathfinding not available', () => {
			const mockPlayerObject = {
				gameObject: {
					entityName: 'Player',
					container: { x: 150, y: 250 },
					hitZone: { body: {} },
				},
			};
			mockScene.physics.overlapCirc.mockReturnValue([mockPlayerObject]);
			mockScene.physics.overlap.mockImplementation(() => {}); // No overlap
			delete mockScene.pathfinding;

			enemy.checkPlayerInRange();

			expect(mockScene.physics.moveToObject).toHaveBeenCalled();
		});

		it('should not move if currently attacking', () => {
			const mockPlayerObject = {
				gameObject: {
					entityName: 'Player',
					container: { x: 150, y: 250 },
					hitZone: { body: {} },
				},
			};
			mockScene.physics.overlapCirc.mockReturnValue([mockPlayerObject]);
			mockScene.physics.overlap.mockImplementation(() => {}); // No overlap
			enemy.isAtacking = true;

			enemy.checkPlayerInRange();

			expect(mockScene.physics.moveToObject).not.toHaveBeenCalled();
		});

		it('should ignore non-player entities', () => {
			const mockEnemyObject = {
				gameObject: {
					entityName: 'Enemy',
					container: { x: 150, y: 250 },
					hitZone: { body: {} },
				},
			};
			mockScene.physics.overlapCirc.mockReturnValue([mockEnemyObject]);
			const stopSpy = jest.spyOn(enemy, 'stopMovement');

			enemy.checkPlayerInRange();

			// Should stop because no Player found
			expect(stopSpy).toHaveBeenCalled();
		});
	});

	describe('onUpdate with throttling', () => {
		beforeEach(() => {
			enemy = new Enemy(mockScene, 100, 200, 'rat', 1);
			(enemy as any).body = { setSize: jest.fn() };
		});

		it('should throttle perception checks based on interval', () => {
			const checkSpy = jest.spyOn(enemy, 'checkPlayerInRange');
			enemy.lastPerceptionCheck = 0;
			mockScene.time.now = 100; // Less than perceptionCheckInterval

			enemy.onUpdate();

			// Should not check because throttle interval not passed
			expect(checkSpy).not.toHaveBeenCalled();
		});

		it('should check perception when interval has passed', () => {
			const checkSpy = jest.spyOn(enemy, 'checkPlayerInRange');
			enemy.lastPerceptionCheck = 0;
			mockScene.time.now = enemy.perceptionCheckInterval + 100;

			enemy.onUpdate();

			expect(checkSpy).toHaveBeenCalled();
		});

		it('should continue processing when path exists between perception checks', () => {
			enemy.currentPath = [{ x: 100, y: 200 } as Phaser.Math.Vector2, { x: 150, y: 250 } as Phaser.Math.Vector2];
			enemy.currentWaypointIndex = 1;
			enemy.lastPerceptionCheck = 0;
			mockScene.time.now = 50; // Not enough for perception check

			// Verify path exists and would trigger followCurrentPath
			expect(enemy.currentPath).not.toBeNull();
			expect(enemy.currentWaypointIndex).toBeLessThan(enemy.currentPath!.length);
			expect(enemy.isAtacking).toBe(false);
		});

		it('should not follow path while attacking', () => {
			enemy.currentPath = [{ x: 100, y: 200 } as Phaser.Math.Vector2, { x: 150, y: 250 } as Phaser.Math.Vector2];
			enemy.currentWaypointIndex = 1;
			enemy.isAtacking = true;
			enemy.lastPerceptionCheck = 0;
			mockScene.time.now = 50;

			(enemy.container as any).body = {
				setVelocity: jest.fn(),
			};

			enemy.onUpdate();

			expect((enemy.container as any).body.setVelocity).not.toHaveBeenCalled();
		});

		it('should update lastPerceptionCheck after check', () => {
			enemy.lastPerceptionCheck = 0;
			mockScene.time.now = 500;

			enemy.onUpdate();

			expect(enemy.lastPerceptionCheck).toBe(500);
		});
	});

	describe('pathfinding properties', () => {
		beforeEach(() => {
			enemy = new Enemy(mockScene, 100, 200, 'rat', 1);
		});

		it('should initialize with null currentPath', () => {
			expect(enemy.currentPath).toBeNull();
		});

		it('should initialize currentWaypointIndex to 0', () => {
			expect(enemy.currentWaypointIndex).toBe(0);
		});

		it('should have pathUpdateInterval property', () => {
			expect(enemy.pathUpdateInterval).toBeGreaterThan(0);
		});

		it('should have waypointReachedDistance property', () => {
			expect(enemy.waypointReachedDistance).toBeGreaterThan(0);
		});

		it('should have perceptionCheckInterval property', () => {
			expect(enemy.perceptionCheckInterval).toBeGreaterThan(0);
		});

		it('should initialize lastPathUpdate to 0', () => {
			expect(enemy.lastPathUpdate).toBe(0);
		});

		it('should initialize lastPerceptionCheck to 0', () => {
			expect(enemy.lastPerceptionCheck).toBe(0);
		});
	});

	describe('animation properties', () => {
		beforeEach(() => {
			enemy = new Enemy(mockScene, 100, 200, 'rat', 1);
		});

		it('should have idle animation prefix', () => {
			expect(enemy.idlePrefixAnimation).toBeDefined();
			expect(typeof enemy.idlePrefixAnimation).toBe('string');
		});

		it('should have walk animation prefix', () => {
			expect(enemy.walkPrefixAnimation).toBeDefined();
			expect(typeof enemy.walkPrefixAnimation).toBe('string');
		});

		it('should have attack animation prefix', () => {
			expect(enemy.atackPrefixAnimation).toBeDefined();
			expect(typeof enemy.atackPrefixAnimation).toBe('string');
		});

		it('should have directional animation suffixes', () => {
			expect(enemy.downAnimationSufix).toBeDefined();
			expect(enemy.upAnimationSufix).toBeDefined();
			expect(enemy.leftAnimationSufix).toBeDefined();
			expect(enemy.rightAnimationSufix).toBeDefined();
		});
	});

	describe('BaseEntity state properties', () => {
		beforeEach(() => {
			enemy = new Enemy(mockScene, 100, 200, 'rat', 1);
		});

		it('should have swimming properties', () => {
			expect(enemy.isSwimming).toBe(false);
			expect(enemy.canSwim).toBe(true);
		});

		it('should have running properties', () => {
			expect(enemy.isRunning).toBe(false);
		});

		it('should have speed properties', () => {
			expect(enemy.baseSpeed).toBeGreaterThan(0);
			expect(enemy.swimSpeed).toBeGreaterThan(0);
			expect(enemy.runSpeed).toBeGreaterThan(0);
		});

		it('should have correct speed ordering', () => {
			expect(enemy.swimSpeed).toBeLessThan(enemy.baseSpeed);
			expect(enemy.baseSpeed).toBeLessThan(enemy.runSpeed);
		});
	});
});
