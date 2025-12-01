/* eslint-disable no-undef */
// Mock Phaser for testing
const Phaser = {
	Scene: class Scene {
		add: any;
		input: any;
		time: any;
		scene: any;
		cameras: any;
		tweens: any;
		plugins: any;
		registry: any;
		data: any;
		physics: any;
		events: any;
		sound: any;
		sys: any;

		constructor() {
			this.add = {
				text: jest.fn().mockReturnThis(),
				image: jest.fn().mockReturnThis(),
				sprite: jest.fn().mockReturnThis(),
				nineslice: jest.fn().mockReturnThis(),
			};
			this.input = {
				keyboard: {
					addKeys: jest.fn(),
					createCursorKeys: jest.fn(() => ({
						left: { isDown: false },
						right: { isDown: false },
						up: { isDown: false },
						down: { isDown: false },
					})),
					on: jest.fn(),
					off: jest.fn(),
					removeListener: jest.fn(),
					addKey: jest.fn(() => ({ isDown: false })),
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
						leftStick: { x: 0, y: 0 },
						rightStick: { x: 0, y: 0 },
						on: jest.fn(),
						off: jest.fn(),
						once: jest.fn(),
					},
					on: jest.fn(),
					off: jest.fn(),
				},
				on: jest.fn(),
				isActive: true,
				addPointer: jest.fn(),
			};
			this.time = {
				addEvent: jest.fn(),
				delayedCall: jest.fn(),
				now: Date.now(),
			};
			this.scene = {
				key: 'TestScene',
				start: jest.fn(),
				stop: jest.fn(),
				get: jest.fn(),
			};
			this.cameras = {
				main: {
					midPoint: { x: 400, y: 300 },
					width: 800,
					height: 600,
				},
			};
			this.tweens = {
				add: jest.fn(),
			};
			this.plugins = {
				get: jest.fn(() => ({
					add: jest.fn(),
				})),
			};
			this.registry = {
				get: jest.fn(),
				set: jest.fn(),
			};
			this.data = {
				get: jest.fn(),
				set: jest.fn(),
			};
			this.physics = {
				world: {
					on: jest.fn(),
					off: jest.fn(),
				},
			};
			const eventEmitter = new Map<string, Array<(...args: any[]) => any>>();
			this.events = {
				on: jest.fn((event: string, fn: (...args: any[]) => any) => {
					if (!eventEmitter.has(event)) {
						eventEmitter.set(event, []);
					}
					eventEmitter.get(event)!.push(fn);
				}),
				off: jest.fn((event: string, fn?: (...args: any[]) => any) => {
					if (fn) {
						const listeners = eventEmitter.get(event);
						if (listeners) {
							const index = listeners.indexOf(fn);
							if (index > -1) {
								listeners.splice(index, 1);
							}
						}
					} else {
						eventEmitter.delete(event);
					}
				}),
				emit: jest.fn((event: string, ...args: any[]) => {
					const listeners = eventEmitter.get(event);
					if (listeners) {
						listeners.forEach((fn) => fn(...args));
					}
				}),
				once: jest.fn((event: string, fn: (...args: any[]) => any) => {
					const wrappedFn = (...args: any[]) => {
						fn(...args);
						const listeners = eventEmitter.get(event);
						if (listeners) {
							const index = listeners.indexOf(wrappedFn);
							if (index > -1) {
								listeners.splice(index, 1);
							}
						}
					};
					if (!eventEmitter.has(event)) {
						eventEmitter.set(event, []);
					}
					eventEmitter.get(event)!.push(wrappedFn);
				}),
			};
			this.sound = {
				add: jest.fn(() => ({
					volume: 0,
					play: jest.fn(),
					stop: jest.fn(),
					setVolume: jest.fn(),
				})),
				play: jest.fn(),
				stopAll: jest.fn(),
			};
			this.sys = {
				game: {
					device: {
						os: {
							desktop: true,
						},
					},
				},
			};
		}
	},
	Input: {
		Keyboard: {
			KeyCodes: {
				SHIFT: 16,
				ENTER: 13,
				SPACE: 32,
			},
		},
	},
	Physics: {
		Arcade: {
			Sprite: class Sprite {
				scene: any;
				x: number;
				y: number;
				texture: any;
				anims: any;
				body: any;
				flipX: boolean;
				visible: boolean;
				active: boolean;
				_events: Map<string, Array<(...args: any[]) => any>>;

				constructor(scene: any, x: number, y: number, texture: string) {
					this.scene = scene;
					this.x = x || 0;
					this.y = y || 0;
					this.texture = { key: texture };
					this.anims = {
						play: jest.fn(),
						currentAnim: { key: '' },
						animationManager: {
							exists: jest.fn(() => true),
						},
					};
					this.body = {
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
					this.flipX = false;
					this.visible = true;
					this.active = true;
					this._events = new Map();
				}
				setScrollFactor(): this {
					return this;
				}
				setDepth(): this {
					return this;
				}
				setOrigin(): this {
					return this;
				}
				addToUpdateList(): this {
					return this;
				}
				on(event: string, fn: (...args: any[]) => any, context?: any): this {
					if (!this._events.has(event)) {
						this._events.set(event, []);
					}
					this._events.get(event)!.push(fn.bind(context || this));
					return this;
				}
				off(event: string, fn?: (...args: any[]) => any): this {
					if (fn) {
						const listeners = this._events.get(event);
						if (listeners) {
							const index = listeners.indexOf(fn);
							if (index > -1) {
								listeners.splice(index, 1);
							}
						}
					} else {
						this._events.delete(event);
					}
					return this;
				}
				once(event: string, fn: (...args: any[]) => any, context?: any): this {
					const wrappedFn = (...args: any[]) => {
						fn.apply(context || this, args);
						this.off(event, wrappedFn);
					};
					return this.on(event, wrappedFn, context);
				}
				emit(event: string, ...args: any[]): boolean {
					const listeners = this._events.get(event);
					if (listeners) {
						listeners.forEach((fn) => fn(...args));
						return true;
					}
					return false;
				}
				destroy(): void {
					this._events.clear();
					this.active = false;
				}
			},
		},
	},
	Plugins: {
		ScenePlugin: class ScenePlugin {},
	},
	GameObjects: {
		Components: {
			TransformMatrix: class TransformMatrix {},
		},
		Sprite: class Sprite {
			scene: any;
			x: number;
			y: number;
			texture: any;
			anims: any;
			flipX: boolean;
			visible: boolean;
			active: boolean;
			_events: Map<string, Array<(...args: any[]) => any>>;

			constructor(scene: any, x: number, y: number, texture: string) {
				this.scene = scene;
				this.x = x || 0;
				this.y = y || 0;
				this.texture = { key: texture };
				this.anims = {
					play: jest.fn(),
					currentAnim: { key: '' },
					animationManager: {
						exists: jest.fn(() => true),
					},
				};
				this.flipX = false;
				this.visible = true;
				this.active = true;
				this._events = new Map();
			}
			setScrollFactor(): this {
				return this;
			}
			setDepth(): this {
				return this;
			}
			setOrigin(): this {
				return this;
			}
			addToUpdateList(): this {
				return this;
			}
			on(event: string, fn: (...args: any[]) => any, context?: any): this {
				if (!this._events.has(event)) {
					this._events.set(event, []);
				}
				this._events.get(event)!.push(fn.bind(context || this));
				return this;
			}
			off(event: string, fn?: (...args: any[]) => any): this {
				if (fn) {
					const listeners = this._events.get(event);
					if (listeners) {
						const index = listeners.indexOf(fn);
						if (index > -1) {
							listeners.splice(index, 1);
						}
					}
				} else {
					this._events.delete(event);
				}
				return this;
			}
			once(event: string, fn: (...args: any[]) => any, context?: any): this {
				const wrappedFn = (...args: any[]) => {
					fn.apply(context || this, args);
					this.off(event, wrappedFn);
				};
				return this.on(event, wrappedFn, context);
			}
			emit(event: string, ...args: any[]): boolean {
				const listeners = this._events.get(event);
				if (listeners) {
					listeners.forEach((fn) => fn(...args));
					return true;
				}
				return false;
			}
		},
		Container: class Container {
			scene: any;
			x: number;
			y: number;
			children: any[];
			body: any;
			active: boolean;
			_events: Map<string, Array<(...args: any[]) => any>>;

			constructor(scene: any, x: number, y: number, children?: any[]) {
				this.scene = scene;
				this.x = x || 0;
				this.y = y || 0;
				this.children = children || [];
				this.body = {
					velocity: { x: 0, y: 0 },
					maxSpeed: 100,
					setVelocity: jest.fn(),
					setSize: jest.fn(),
					setOffset: jest.fn(),
					setAcceleration: jest.fn(),
					enable: true,
				};
				this.active = true;
				this._events = new Map();
			}
			add(): this {
				return this;
			}
			remove(): this {
				return this;
			}
			on(event: string, fn: (...args: any[]) => any, context?: any): this {
				if (!this._events.has(event)) {
					this._events.set(event, []);
				}
				this._events.get(event)!.push(fn.bind(context || this));
				return this;
			}
			off(event: string, fn?: (...args: any[]) => any): this {
				if (fn) {
					const listeners = this._events.get(event);
					if (listeners) {
						const index = listeners.indexOf(fn);
						if (index > -1) {
							listeners.splice(index, 1);
						}
					}
				} else {
					this._events.delete(event);
				}
				return this;
			}
			once(event: string, fn: (...args: any[]) => any, context?: any): this {
				const wrappedFn = (...args: any[]) => {
					fn.apply(context || this, args);
					this.off(event, wrappedFn);
				};
				return this.on(event, wrappedFn, context);
			}
			emit(event: string, ...args: any[]): boolean {
				const listeners = this._events.get(event);
				if (listeners) {
					listeners.forEach((fn) => fn(...args));
					return true;
				}
				return false;
			}
		},
		Image: class Image {
			scene: any;
			x: number;
			y: number;
			texture: any;
			visible: boolean;

			constructor(scene: any, x: number, y: number, texture: string) {
				this.scene = scene;
				this.x = x || 0;
				this.y = y || 0;
				this.texture = texture;
				this.visible = true;
			}
			setScrollFactor(): this {
				return this;
			}
			setDepth(): this {
				return this;
			}
			setOrigin(): this {
				return this;
			}
		},
		Text: class Text {
			scene: any;
			x: number;
			y: number;
			text: string;
			style: any;
			visible: boolean;

			constructor(scene: any, x: number, y: number, text?: string, style?: any) {
				this.scene = scene;
				this.x = x || 0;
				this.y = y || 0;
				this.text = text || '';
				this.style = style || {};
				this.visible = true;
			}
			setScrollFactor(): this {
				return this;
			}
			setDepth(): this {
				return this;
			}
			setOrigin(): this {
				return this;
			}
		},
	},
	Math: {
		Vector2: class Vector2 {
			x: number;
			y: number;

			constructor(x?: number, y?: number) {
				this.x = x || 0;
				this.y = y || 0;
			}

			setTo(x: number, y: number): any {
				this.x = x;
				this.y = y;
				return this;
			}
		},
		Between: jest.fn((min: number, max: number) => {
			return Math.floor(Math.random() * (max - min + 1)) + min;
		}),
	},
	Geom: {
		Point: class Point {
			x: number;
			y: number;

			constructor(x: number = 0, y: number = 0) {
				this.x = x;
				this.y = y;
			}
		},
	},
	Display: {
		Color: class Color {
			r: number;
			g: number;
			b: number;
			a: number;
			static IntegerToRGB = jest.fn();

			constructor(r?: number, g?: number, b?: number, a?: number) {
				this.r = r || 0;
				this.g = g || 0;
				this.b = b || 0;
				this.a = a !== undefined ? a : 1;
			}
		},
	},
	AUTO: 0,
	WEBGL: 1,
	CANVAS: 2,
	HEADLESS: 3,
	Game: class Game {
		scene: any;
		canvas: any;
		config: any;
		events: any;
		loop: any;
		registry: any;
		plugins: any;
		sound: any;

		constructor(config: any) {
			this.config = config;
			this.canvas = null;
			this.events = {
				on: jest.fn(),
				off: jest.fn(),
				once: jest.fn(),
				emit: jest.fn(),
			};
			this.registry = {
				get: jest.fn(),
				set: jest.fn(),
			};
			this.plugins = {
				get: jest.fn(() => ({
					add: jest.fn(),
				})),
			};
			this.sound = {
				add: jest.fn(() => ({
					volume: 0,
					play: jest.fn(),
					stop: jest.fn(),
					setVolume: jest.fn(),
					fadeOut: jest.fn(),
				})),
				play: jest.fn(),
				stopAll: jest.fn(),
				pauseAll: jest.fn(),
				resumeAll: jest.fn(),
			};
			this.loop = {
				start: jest.fn(),
				stop: jest.fn(),
			};

			// Create scene manager
			const SceneManager: any = {
				scenes: [] as any[],
				add: jest.fn((key: string, sceneConfig: any, autoStart?: boolean): any => {
					const scene = typeof sceneConfig === 'function' ? new sceneConfig() : new Phaser.Scene();

					// Create a real event emitter for the scene
					const sceneEventEmitter = new Map<string, Array<(...args: any[]) => any>>();
					scene.events = {
						on: jest.fn((event: string, fn: (...args: any[]) => any) => {
							if (!sceneEventEmitter.has(event)) {
								sceneEventEmitter.set(event, []);
							}
							sceneEventEmitter.get(event)!.push(fn);
						}),
						off: jest.fn((event: string, fn?: (...args: any[]) => any) => {
							if (fn) {
								const listeners = sceneEventEmitter.get(event);
								if (listeners) {
									const index = listeners.indexOf(fn);
									if (index > -1) {
										listeners.splice(index, 1);
									}
								}
							} else {
								sceneEventEmitter.delete(event);
							}
						}),
						emit: jest.fn((event: string, ...args: any[]) => {
							const listeners = sceneEventEmitter.get(event);
							if (listeners) {
								listeners.forEach((fn) => fn(...args));
							}
						}),
						once: jest.fn((event: string, fn: (...args: any[]) => any) => {
							const wrappedFn = (...args: any[]) => {
								fn(...args);
								const listeners = sceneEventEmitter.get(event);
								if (listeners) {
									const index = listeners.indexOf(wrappedFn);
									if (index > -1) {
										listeners.splice(index, 1);
									}
								}
							};
							if (!sceneEventEmitter.has(event)) {
								sceneEventEmitter.set(event, []);
							}
							sceneEventEmitter.get(event)!.push(wrappedFn);
						}),
					};

					scene.scene = {
						key,
						start: jest.fn(),
						stop: jest.fn(),
						get: jest.fn(),
						launch: jest.fn(),
						scenes: SceneManager.scenes,
					};
					scene.add = {
						existing: jest.fn((obj: any) => obj),
						zone: jest.fn(() => {
							const zone = {
								x: 0,
								y: 0,
								width: 0,
								height: 0,
								body: {
									velocity: { x: 0, y: 0 },
									enable: true,
								},
								setSize: jest.fn().mockReturnThis(),
								setOrigin: jest.fn().mockReturnThis(),
								setDepth: jest.fn().mockReturnThis(),
							};
							return zone;
						}),
						sprite: jest.fn(() => {
							const sprite = {
								setScrollFactor: jest.fn().mockReturnThis(),
								setOrigin: jest.fn().mockReturnThis(),
								setDepth: jest.fn().mockReturnThis(),
								setVisible: jest.fn().mockReturnThis(),
								visible: true,
								x: 0,
								y: 0,
							};
							return sprite;
						}),
						image: jest.fn(() => {
							const image = {
								setScrollFactor: jest.fn().mockReturnThis(),
								setOrigin: jest.fn().mockReturnThis(),
								setDepth: jest.fn().mockReturnThis(),
								setVisible: jest.fn().mockReturnThis(),
								visible: true,
								x: 0,
								y: 0,
							};
							return image;
						}),
						text: jest.fn(() => {
							const text = {
								setScrollFactor: jest.fn().mockReturnThis(),
								setOrigin: jest.fn().mockReturnThis(),
								setDepth: jest.fn().mockReturnThis(),
								setVisible: jest.fn().mockReturnThis(),
								setText: jest.fn().mockReturnThis(),
								setStyle: jest.fn().mockReturnThis(),
								visible: true,
								text: '',
								x: 0,
								y: 0,
							};
							return text;
						}),
						container: jest.fn(() => {
							const container = {
								add: jest.fn().mockReturnThis(),
								setScrollFactor: jest.fn().mockReturnThis(),
								setDepth: jest.fn().mockReturnThis(),
								setVisible: jest.fn().mockReturnThis(),
								visible: true,
								x: 0,
								y: 0,
								children: [] as any[],
							};
							return container;
						}),
					};
					scene.physics = {
						add: {
							existing: jest.fn((obj: any) => {
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
							overlap: jest.fn(),
							collider: jest.fn(),
							group: jest.fn(() => ({
								add: jest.fn(),
								remove: jest.fn(),
								children: {
									entries: [] as any[],
								},
							})),
						},
						world: {
							on: jest.fn(),
							off: jest.fn(),
							setBounds: jest.fn(),
						},
					};
					scene.game = this;
					SceneManager.scenes.push(scene);

					if (autoStart !== false && sceneConfig.create) {
						// Defer create to next tick to allow setup
						setTimeout(() => {
							sceneConfig.create.call(scene);
							scene.events.emit('create');
						}, 0);
					}

					return scene;
				}),
				start: jest.fn(),
				stop: jest.fn(),
				getScene: jest.fn((key: string): any => {
					return SceneManager.scenes.find((s: any) => s.scene.key === key);
				}),
			};

			this.scene = SceneManager;

			// Initialize scene if provided
			if (config.scene) {
				if (typeof config.scene === 'object' && !Array.isArray(config.scene)) {
					// Single scene config
					this.scene.add('DefaultScene', config.scene, true);
				} else if (Array.isArray(config.scene)) {
					// Multiple scenes
					config.scene.forEach((sceneConfig: any, index: number) => {
						this.scene.add(`Scene${index}`, sceneConfig, index === 0);
					});
				}
			}
		}

		destroy(_removeCanvas?: boolean) {
			this.scene.scenes.forEach((scene: any) => {
				if (scene.events) {
					scene.events.emit('shutdown');
					scene.events.emit('destroy');
				}
			});
			this.scene.scenes = [];
			this.events.emit('destroy');
		}
	},
	Animations: {
		Events: {
			ANIMATION_COMPLETE: 'animationcomplete',
			ANIMATION_START: 'animationstart',
			ANIMATION_UPDATE: 'animationupdate',
		},
	},
};

export default Phaser;
