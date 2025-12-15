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
});
