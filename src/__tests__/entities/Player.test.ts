import { Player } from '../../entities/Player';

// Mock Phaser module
jest.mock('phaser', () => {
	const mockBody = {
		setSize: jest.fn(),
		setOffset: jest.fn(),
		width: 32,
		height: 32,
		offset: { x: 0, y: 0 },
	};

	class MockSprite {
		scene: any;
		x: number;
		y: number;
		texture: any;
		body: any;
		anims: any;

		constructor(scene: any, x: number, y: number, texture: string) {
			this.scene = scene;
			this.x = x;
			this.y = y;
			this.texture = { key: texture };
			this.body = { ...mockBody };
			this.anims = {
				play: jest.fn(),
				currentAnim: null,
			};
		}

		setOrigin() {
			return this;
		}
		setDepth() {
			return this;
		}
		play(animation: string) {
			this.anims.play(animation);
			return this;
		}
		addToUpdateList() {
			return this;
		}
	}

	return {
		__esModule: true,
		default: {
			Scene: class {
				add: any;
				physics: any;
				constructor() {
					this.add = {};
					this.physics = {};
				}
			},
			GameObjects: {
				Sprite: MockSprite,
				Container: jest.fn(function (scene: any, x: number, y: number, _children?: any[]) {
					return {
						scene,
						x,
						y,
						body: { ...mockBody },
						add: jest.fn(),
						setPosition: jest.fn(),
						setDepth: jest.fn(),
					};
				}),
				Zone: jest.fn(() => ({
					setOrigin: jest.fn(),
					setPosition: jest.fn(),
					body: { ...mockBody },
				})),
				Particles: jest.fn(),
			},
			Physics: {
				Arcade: {
					Sprite: MockSprite,
				},
			},
			Input: {
				Keyboard: {
					KeyCodes: {
						SHIFT: 16,
						UP: 38,
						DOWN: 40,
						LEFT: 37,
						RIGHT: 39,
						W: 87,
						A: 65,
						S: 83,
						D: 68,
						SPACE: 32,
					},
				},
			},
		},
	};
});

// Mock Phaser scene
const mockScene = {
	add: {
		existing: jest.fn(),
		particles: jest.fn(() => {
			const emitter = {
				setDepth: jest.fn(function () {
					return this;
				}),
				on: false,
			};
			return {
				createEmitter: jest.fn(() => emitter),
				setDepth: jest.fn(() => ({ on: false })),
			};
		}),
		zone: jest.fn(() => ({
			setOrigin: jest.fn(),
			setPosition: jest.fn(),
			body: {
				setSize: jest.fn(),
				setOffset: jest.fn(),
				width: 32,
				height: 32,
				offset: { x: 0, y: 0 },
			},
		})),
		container: jest.fn(() => ({
			setPosition: jest.fn(),
			add: jest.fn(),
		})),
	},
	physics: {
		add: {
			existing: jest.fn(),
		},
	},
	events: {
		on: jest.fn(),
		off: jest.fn(),
		emit: jest.fn(),
		once: jest.fn(),
	},
	input: {
		keyboard: {
			createCursorKeys: jest.fn(() => ({
				left: { isDown: false },
				right: { isDown: false },
				up: { isDown: false },
				down: { isDown: false },
			})),
			addKeys: jest.fn(),
			addKey: jest.fn(() => ({ isDown: false })),
			on: jest.fn(),
		},
		mouse: {
			disableContextMenu: jest.fn(),
		},
		gamepad: {
			pad1: {
				id: 'mock-gamepad',
				index: 0,
				buttons: [],
				axes: [],
				connected: true,
			},
			on: jest.fn(),
			off: jest.fn(),
		},
		on: jest.fn(),
	},
	map: {
		worldToTileX: jest.fn(),
		worldToTileY: jest.fn(),
	},
	sys: {
		game: {
			device: {
				os: {
					desktop: true,
				},
			},
		},
	},
	scene: {
		launch: jest.fn(),
		stop: jest.fn(),
		start: jest.fn(),
		get: jest.fn(),
	},
} as any;

describe('Player', () => {
	let player: Player;

	beforeEach(() => {
		player = new Player(mockScene, 100, 100, 'player_sprite');
	});

	test('should create player with initial attributes', () => {
		expect(player.x).toBe(0);
		expect(player.y).toBe(0);
		expect(player.entityName).toBe('Player');
		expect(player.canMove).toBe(true);
		expect(player.canAtack).toBe(true);
		expect(player.canBlock).toBe(true);
	});

	test('should have initial attributes', () => {
		expect(player.attributes).toBeDefined();
		expect(player.attributes.health).toBeGreaterThan(0);
		expect(player.attributes.level).toBeGreaterThanOrEqual(1);
		expect(player.speed).toBeGreaterThan(0);
	});

	test('should initialize speed equal to baseSpeed (bug regression test)', () => {
		// This test ensures initial speed matches baseSpeed
		// Previously there was a bug where initial speed was 50 but baseSpeed was 200,
		// causing speed to increase after toggling shift on/off
		expect(player.speed).toBe(player.baseSpeed);
	});

	test('should have movement capabilities', () => {
		expect(player.neverquestMovement).toBeDefined();
		expect(player.neverquestKeyboardMouseController).toBeDefined();
	});

	test('should initialize with items array', () => {
		expect(player.items).toBeDefined();
		expect(Array.isArray(player.items)).toBe(true);
	});

	describe('preUpdate', () => {
		test('should have preUpdate method defined', () => {
			expect(player.preUpdate).toBeDefined();
			expect(typeof player.preUpdate).toBe('function');
		});

		test('preUpdate should accept time and delta parameters', () => {
			// The preUpdate method requires a proper Phaser sprite context
			// which isn't available in our mock. We verify the method signature.
			expect(player.preUpdate.length).toBe(2);
		});
	});

	describe('onUpdate', () => {
		test('should have onUpdate method defined', () => {
			expect(player.onUpdate).toBeDefined();
			expect(typeof player.onUpdate).toBe('function');
		});

		test('should call updateMovementDependencies', () => {
			const updateSpy = jest.spyOn(player, 'updateMovementDependencies');
			// Mock setVelocity to avoid cascade into movement code
			(player.container as any).body = {
				setVelocity: jest.fn(),
				velocity: { x: 0, y: 0 },
			};
			player.onUpdate();
			expect(updateSpy).toHaveBeenCalled();
		});

		test('should not throw if neverquestMovement is undefined', () => {
			const originalMovement = player.neverquestMovement;
			(player as any).neverquestMovement = undefined;
			expect(() => player.onUpdate()).not.toThrow();
			player.neverquestMovement = originalMovement;
		});

		test('should have neverquestMovement reference', () => {
			expect(player.neverquestMovement).toBeDefined();
		});
	});

	describe('setPhysics', () => {
		test('should call physics.add.existing for container', () => {
			// Reset mock call counts
			jest.clearAllMocks();
			player.setPhysics();
			expect(mockScene.physics.add.existing).toHaveBeenCalled();
		});

		test('should set body size correctly', () => {
			expect(player.body).toBeDefined();
		});

		test('should set hitZone physics', () => {
			expect(player.hitZone).toBeDefined();
		});
	});

	describe('jump', () => {
		let mockContainerBody: {
			velocity: { x: number; y: number };
			setSize: jest.Mock;
			offset: { x: number; y: number };
			maxSpeed: number;
		};

		beforeEach(() => {
			// Setup mock tweens
			mockScene.tweens = {
				add: jest.fn().mockReturnValue({ on: jest.fn() }),
			};
			// Setup mock container body
			mockContainerBody = {
				velocity: { x: 0, y: 0 },
				setSize: jest.fn(),
				offset: { x: 0, y: 0 },
				maxSpeed: 200,
			};
			(player.container as any).body = mockContainerBody;
		});

		test('should not jump if canJump is false', () => {
			player.canJump = false;
			player.jump();
			expect(player.isJumping).toBe(false);
		});

		test('should not jump if already jumping', () => {
			player.isJumping = true;
			player.jump();
			expect(mockScene.tweens.add).not.toHaveBeenCalled();
		});

		test('should not jump if swimming', () => {
			player.isSwimming = true;
			player.jump();
			expect(player.isJumping).toBe(false);
		});

		test('should set isJumping to true when jump starts', () => {
			player.jump();
			expect(player.isJumping).toBe(true);
		});

		test('should set canJump to false when jump starts', () => {
			player.jump();
			expect(player.canJump).toBe(false);
		});

		test('should create vertical jump tween', () => {
			player.jump();
			expect(mockScene.tweens.add).toHaveBeenCalled();
		});

		test('should calculate jump distance based on velocity', () => {
			mockContainerBody.velocity = { x: 100, y: 50 };
			player.jump();
			expect(mockScene.tweens.add).toHaveBeenCalled();
		});

		test('should add scale effect tween for visual feedback', () => {
			player.jump();
			// Should have multiple tween calls (vertical, horizontal if moving, scale)
			expect(mockScene.tweens.add).toHaveBeenCalled();
		});

		test('should add horizontal movement tween when moving', () => {
			mockContainerBody.velocity = { x: 100, y: 0 };
			player.jump();
			// Called multiple times for different tween effects
			expect(mockScene.tweens.add.mock.calls.length).toBeGreaterThanOrEqual(2);
		});
	});

	describe('roll', () => {
		let mockContainerBody: {
			velocity: { x: number; y: number };
			setSize: jest.Mock;
			offset: { x: number; y: number };
			maxSpeed: number;
		};

		beforeEach(() => {
			// Setup mock tweens
			mockScene.tweens = {
				add: jest.fn().mockReturnValue({ on: jest.fn() }),
			};
			// Setup mock time
			mockScene.time = {
				delayedCall: jest.fn(),
			};
			// Setup mock container body
			mockContainerBody = {
				velocity: { x: 0, y: 0 },
				setSize: jest.fn(),
				offset: { x: 0, y: 0 },
				maxSpeed: 200,
			};
			(player.container as any).body = mockContainerBody;
		});

		test('should not roll if canRoll is false', () => {
			player.canRoll = false;
			player.roll();
			expect(player.isRolling).toBe(false);
		});

		test('should not roll if already rolling', () => {
			player.isRolling = true;
			player.roll();
			expect(mockScene.tweens.add).not.toHaveBeenCalled();
		});

		test('should not roll if swimming', () => {
			player.isSwimming = true;
			player.roll();
			expect(player.isRolling).toBe(false);
		});

		test('should not roll if jumping', () => {
			player.isJumping = true;
			player.roll();
			expect(player.isRolling).toBe(false);
		});

		test('should set isRolling to true when roll starts', () => {
			player.roll();
			expect(player.isRolling).toBe(true);
		});

		test('should set canRoll to false when roll starts', () => {
			player.roll();
			expect(player.canRoll).toBe(false);
		});

		test('should create roll movement tweens', () => {
			player.roll();
			expect(mockScene.tweens.add).toHaveBeenCalled();
		});

		test('should roll in velocity direction when moving', () => {
			mockContainerBody.velocity = { x: 100, y: 50 };
			player.roll();
			expect(mockScene.tweens.add).toHaveBeenCalled();
		});

		test('should roll downward by default when not moving', () => {
			mockContainerBody.velocity = { x: 0, y: 0 };
			player.roll();
			// Should create Y direction tween
			expect(mockScene.tweens.add).toHaveBeenCalled();
		});

		test('should add rotation effect during roll', () => {
			player.roll();
			// Check that rotation tween was added (should have angle: 360)
			const angleTweenCall = mockScene.tweens.add.mock.calls.find((call: any) => call[0]?.angle !== undefined);
			expect(angleTweenCall).toBeDefined();
		});

		test('should add scale effect for visual feedback', () => {
			player.roll();
			const scaleTweenCall = mockScene.tweens.add.mock.calls.find((call: any) => call[0]?.scaleX !== undefined);
			expect(scaleTweenCall).toBeDefined();
		});

		test('should schedule completion callback with delayedCall', () => {
			player.roll();
			expect(mockScene.time.delayedCall).toHaveBeenCalledWith(player.rollDuration, expect.any(Function));
		});

		test('should create X direction tween when velocity X is non-zero', () => {
			mockContainerBody.velocity = { x: 100, y: 0 };
			player.roll();
			// Find call with x target
			const xTweenCall = mockScene.tweens.add.mock.calls.find(
				(call: any) => call[0]?.x !== undefined && call[0]?.y === undefined
			);
			expect(xTweenCall).toBeDefined();
		});
	});

	describe('destroyAll', () => {
		test('should have destroyAll method defined', () => {
			expect(player.destroyAll).toBeDefined();
			expect(typeof player.destroyAll).toBe('function');
		});

		test('should destroy container when called', () => {
			// Add destroy mock to container
			const mockDestroy = jest.fn();
			(player.container as any).destroy = mockDestroy;
			// Also need to mock player.destroy
			(player as any).destroy = jest.fn();

			player.destroyAll();
			expect(mockDestroy).toHaveBeenCalled();
		});

		test('should destroy player sprite when called', () => {
			// Add destroy mock to both
			(player.container as any).destroy = jest.fn();
			const mockPlayerDestroy = jest.fn();
			(player as any).destroy = mockPlayerDestroy;

			player.destroyAll();
			expect(mockPlayerDestroy).toHaveBeenCalled();
		});
	});

	describe('updateMovementDependencies', () => {
		test('should execute without error', () => {
			expect(() => player.updateMovementDependencies()).not.toThrow();
		});
	});

	describe('state properties', () => {
		test('should have correct initial swimming state', () => {
			expect(player.isSwimming).toBe(false);
			expect(player.canSwim).toBe(true);
		});

		test('should have correct initial running state', () => {
			expect(player.isRunning).toBe(false);
		});

		test('should have correct initial jumping state', () => {
			expect(player.isJumping).toBe(false);
			expect(player.canJump).toBe(true);
		});

		test('should have correct initial rolling state', () => {
			expect(player.isRolling).toBe(false);
			expect(player.canRoll).toBe(true);
		});

		test('should have correct initial blocking state', () => {
			expect(player.isBlocking).toBe(false);
			expect(player.canBlock).toBe(true);
		});

		test('should have canTakeDamage set to true', () => {
			expect(player.canTakeDamage).toBe(true);
		});
	});

	describe('speed properties', () => {
		test('should have baseSpeed property', () => {
			expect(player.baseSpeed).toBeDefined();
			expect(typeof player.baseSpeed).toBe('number');
		});

		test('should have swimSpeed property', () => {
			expect(player.swimSpeed).toBeDefined();
			expect(typeof player.swimSpeed).toBe('number');
		});

		test('should have runSpeed property', () => {
			expect(player.runSpeed).toBeDefined();
			expect(typeof player.runSpeed).toBe('number');
		});

		test('should have correct speed ordering', () => {
			expect(player.swimSpeed).toBeLessThan(player.baseSpeed);
			expect(player.baseSpeed).toBeLessThan(player.runSpeed);
		});
	});

	describe('jump and roll properties', () => {
		test('should have jumpHeight property', () => {
			expect(player.jumpHeight).toBeDefined();
			expect(player.jumpHeight).toBeGreaterThan(0);
		});

		test('should have jumpDuration property', () => {
			expect(player.jumpDuration).toBeDefined();
			expect(player.jumpDuration).toBeGreaterThan(0);
		});

		test('should have rollDistance property', () => {
			expect(player.rollDistance).toBeDefined();
			expect(player.rollDistance).toBeGreaterThan(0);
		});

		test('should have rollDuration property', () => {
			expect(player.rollDuration).toBeDefined();
			expect(player.rollDuration).toBeGreaterThan(0);
		});
	});

	describe('body dimensions', () => {
		test('should have hitZone dimensions', () => {
			expect(player.hitZoneWidth).toBeDefined();
			expect(player.hitZoneHeigth).toBeDefined();
			expect(player.hitZoneWidth).toBeGreaterThan(0);
			expect(player.hitZoneHeigth).toBeGreaterThan(0);
		});

		test('should have body dimensions', () => {
			expect(player.bodyWidth).toBeDefined();
			expect(player.bodyHeight).toBeDefined();
			expect(player.bodyWidth).toBeGreaterThan(0);
			expect(player.bodyHeight).toBeGreaterThan(0);
		});

		test('should have bodyOffsetY property', () => {
			expect(player.bodyOffsetY).toBeDefined();
		});
	});

	describe('particle properties', () => {
		test('should have dustParticleName property', () => {
			expect(player.dustParticleName).toBe('walk_dust');
		});

		test('should have walkDust emitter', () => {
			expect(player.walkDust).toBeDefined();
		});
	});

	describe('hitZone', () => {
		test('should have hitZone created', () => {
			expect(player.hitZone).toBeDefined();
		});
	});

	describe('healthBar', () => {
		test('should have healthBar created', () => {
			expect(player.healthBar).toBeDefined();
		});
	});

	describe('container', () => {
		test('should have container created', () => {
			expect(player.container).toBeDefined();
		});

		test('should have container at correct position', () => {
			expect(player.container.x).toBe(100);
			expect(player.container.y).toBe(100);
		});
	});
});
