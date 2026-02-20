/**
 * Tests for ButtonPlus component
 */

import { ButtonPlus } from '../../../components/UI/ButtonPlus';

// Mock NeverquestUtils
const mockExecuteFunctionByName = jest.fn();
jest.mock('../../../utils/NeverquestUtils', () => ({
	NeverquestUtils: {
		executeFunctionByName: (...args: any[]) => mockExecuteFunctionByName(...args),
	},
}));

// Mock Phaser using the existing phaserMock pattern
jest.mock('phaser', () => {
	// Create a mock Sprite class that tracks events
	class MockSprite {
		scene: any;
		x: number;
		y: number;
		texture: string;
		anims: { currentAnim: { key: string } | null };
		_events: Map<string, Array<(...args: any[]) => any>>;

		constructor(scene: any, x: number, y: number, texture: string) {
			this.scene = scene;
			this.x = x;
			this.y = y;
			this.texture = texture;
			this.anims = { currentAnim: { key: 'touch_button_plus' } };
			this._events = new Map();
		}

		setInteractive() {
			return this;
		}

		on(event: string, handler: (...args: any[]) => any) {
			if (!this._events.has(event)) {
				this._events.set(event, []);
			}
			this._events.get(event)!.push(handler);
			return this;
		}

		emit(event: string, ...args: any[]) {
			const handlers = this._events.get(event);
			if (handlers) {
				handlers.forEach((fn) => fn(...args));
			}
			return true;
		}

		play(_config: any) {
			// Return an object with once method to handle animation complete
			return {
				once: (event: string, handler: (...args: any[]) => any) => {
					// Store the handler for animation complete
					if (!this._events.has('animComplete')) {
						this._events.set('animComplete', []);
					}
					this._events.get('animComplete')!.push(handler);
					return this;
				},
			};
		}
	}

	return {
		__esModule: true,
		default: {
			GameObjects: {
				Sprite: MockSprite,
			},
			Animations: {
				Events: {
					ANIMATION_COMPLETE: 'animationcomplete',
				},
			},
		},
		GameObjects: {
			Sprite: MockSprite,
		},
		Animations: {
			Events: {
				ANIMATION_COMPLETE: 'animationcomplete',
			},
		},
	};
});

describe('ButtonPlus', () => {
	let mockScene: any;

	beforeEach(() => {
		jest.clearAllMocks();

		mockScene = {
			add: {
				existing: jest.fn(),
			},
			testAction: jest.fn(),
		};
	});

	describe('Constructor', () => {
		it('should create button with correct position', () => {
			const button = new ButtonPlus(mockScene, 100, 200, 'testAction', { test: true });

			expect(button.x).toBe(100);
			expect(button.y).toBe(200);
		});

		it('should store scene reference', () => {
			const button = new ButtonPlus(mockScene, 100, 200, 'testAction', { test: true });

			expect(button.scene).toBe(mockScene);
		});

		it('should add button to scene', () => {
			new ButtonPlus(mockScene, 100, 200, 'testAction', { test: true });

			expect(mockScene.add.existing).toHaveBeenCalled();
		});

		it('should register pointerdown event handler', () => {
			const button = new ButtonPlus(mockScene, 100, 200, 'testAction', { test: true });

			// Access internal events map to verify handler was registered
			const pointerdownHandlers = (button as any)._events.get('pointerdown');
			expect(pointerdownHandlers).toBeDefined();
			expect(pointerdownHandlers.length).toBe(1);
		});
	});

	describe('Pointer Down Handler', () => {
		it('should execute action when clicked', () => {
			const args = { attribute: 'str', text: 'STR' };
			const button = new ButtonPlus(mockScene, 100, 200, 'testAction', args);

			// Trigger the pointerdown event
			(button as any).emit('pointerdown', {});

			expect(mockExecuteFunctionByName).toHaveBeenCalledWith('testAction', mockScene, args);
		});

		it('should call play with animation config when clicked', () => {
			const button = new ButtonPlus(mockScene, 100, 200, 'testAction', {});

			// Spy on play
			const playSpy = jest.spyOn(button as any, 'play');

			// Trigger the pointerdown event
			(button as any).emit('pointerdown', {});

			// Verify play was called with the expected key
			expect(playSpy).toHaveBeenCalledWith({ key: 'touch_button_plus' });
		});
	});

	describe('Animation Complete Handler', () => {
		it('should chain play().once() for animation callback', () => {
			const button = new ButtonPlus(mockScene, 100, 200, 'testAction', {});

			// Mock play to return an object with once method
			const onceMock = jest.fn();
			jest.spyOn(button as any, 'play').mockReturnValue({ once: onceMock });

			// Trigger the pointerdown event
			(button as any).emit('pointerdown', {});

			// Verify once was called with animation complete event
			expect(onceMock).toHaveBeenCalledWith('animationcomplete', expect.any(Function));
		});
	});

	describe('Integration', () => {
		it('should work with different action names', () => {
			const button1 = new ButtonPlus(mockScene, 100, 200, 'addAttribute', {});
			const button2 = new ButtonPlus(mockScene, 150, 200, 'increaseValue', {});

			// Trigger handlers
			(button1 as any).emit('pointerdown', {});
			(button2 as any).emit('pointerdown', {});

			expect(mockExecuteFunctionByName).toHaveBeenCalledWith('addAttribute', mockScene, {});
			expect(mockExecuteFunctionByName).toHaveBeenCalledWith('increaseValue', mockScene, {});
		});

		it('should pass complex args to action', () => {
			const complexArgs = {
				attribute: 'str',
				text: 'STR',
				min: 0,
				max: 100,
			};

			const button = new ButtonPlus(mockScene, 100, 200, 'testAction', complexArgs);
			(button as any).emit('pointerdown', {});

			expect(mockExecuteFunctionByName).toHaveBeenCalledWith('testAction', mockScene, complexArgs);
		});

		it('should handle null args', () => {
			const button = new ButtonPlus(mockScene, 100, 200, 'testAction', null);
			(button as any).emit('pointerdown', {});

			expect(mockExecuteFunctionByName).toHaveBeenCalledWith('testAction', mockScene, null);
		});

		it('should handle undefined args', () => {
			const button = new ButtonPlus(mockScene, 100, 200, 'testAction', undefined);
			(button as any).emit('pointerdown', {});

			expect(mockExecuteFunctionByName).toHaveBeenCalledWith('testAction', mockScene, undefined);
		});

		it('should create multiple buttons independently', () => {
			const button1 = new ButtonPlus(mockScene, 100, 200, 'action1', { id: 1 });
			const button2 = new ButtonPlus(mockScene, 200, 200, 'action2', { id: 2 });
			const button3 = new ButtonPlus(mockScene, 300, 200, 'action3', { id: 3 });

			expect(button1.x).toBe(100);
			expect(button2.x).toBe(200);
			expect(button3.x).toBe(300);

			// Each button should have its own events
			const handlers1 = (button1 as any)._events.get('pointerdown');
			const handlers2 = (button2 as any)._events.get('pointerdown');
			const handlers3 = (button3 as any)._events.get('pointerdown');

			expect(handlers1.length).toBe(1);
			expect(handlers2.length).toBe(1);
			expect(handlers3.length).toBe(1);
		});
	});
});
