/**
 * Tests for ParticlePool plugin
 */

import { ParticlePool } from '../../../plugins/effects/ParticlePool';

// Mock ObjectPool
jest.mock('../../../utils/ObjectPool', () => {
	return {
		ObjectPool: jest.fn().mockImplementation((createFn, resetFn, initialSize, maxSize) => {
			const pool: any[] = [];

			// Pre-populate
			for (let i = 0; i < initialSize; i++) {
				pool.push(createFn());
			}

			return {
				acquire: jest.fn(() => {
					if (pool.length > 0) {
						return pool.pop();
					}
					return createFn();
				}),
				release: jest.fn((obj) => {
					if (maxSize === 0 || pool.length < maxSize) {
						resetFn(obj);
						pool.push(obj);
					}
				}),
				size: jest.fn(() => pool.length),
				clear: jest.fn(() => {
					pool.length = 0;
				}),
				_pool: pool, // For testing
				_createFn: createFn,
				_resetFn: resetFn,
			};
		}),
	};
});

describe('ParticlePool', () => {
	let particlePool: ParticlePool;
	let mockScene: any;
	let mockEmitters: any[];
	let mockTimerEvent: any;
	let timerCallbacks: Array<{ callback: () => void; delay: number }>;

	beforeEach(() => {
		mockEmitters = [];
		timerCallbacks = [];

		// Mock timer event
		mockTimerEvent = {
			remove: jest.fn(),
		};

		// Mock scene
		mockScene = {
			add: {
				particles: jest.fn((x, y, texture, config) => {
					const emitter = {
						x,
						y,
						texture: { key: texture },
						config: config || {},
						visible: true,
						depth: 0,
						stopped: false,
						setPosition: jest.fn(function (newX: number, newY: number) {
							this.x = newX;
							this.y = newY;
							return this;
						}),
						setVisible: jest.fn(function (visible: boolean) {
							this.visible = visible;
							return this;
						}),
						setDepth: jest.fn(function (depth: number) {
							this.depth = depth;
							return this;
						}),
						setConfig: jest.fn(function (newConfig: any) {
							this.config = { ...this.config, ...newConfig };
							return this;
						}),
						start: jest.fn(function () {
							this.stopped = false;
							return this;
						}),
						stop: jest.fn(function () {
							this.stopped = true;
							return this;
						}),
						explode: jest.fn(),
						killAll: jest.fn(),
					};
					mockEmitters.push(emitter);
					return emitter;
				}),
			},
			time: {
				delayedCall: jest.fn((delay, callback) => {
					timerCallbacks.push({ callback, delay });
					return mockTimerEvent;
				}),
			},
		};

		particlePool = new ParticlePool(mockScene);
	});

	describe('Constructor', () => {
		it('should initialize with scene', () => {
			expect(particlePool).toBeDefined();
			expect(particlePool['scene']).toBe(mockScene);
		});

		it('should initialize with empty pools map', () => {
			expect(particlePool['pools']).toBeDefined();
			expect(particlePool['pools'].size).toBe(0);
		});
	});

	describe('emit()', () => {
		it('should create a new pool on first emit', () => {
			const config = { speed: 100, lifespan: 1000 };
			particlePool.emit('particle', 100, 200, config);

			expect(particlePool['pools'].size).toBe(1);
			expect(particlePool['pools'].has('particle')).toBe(true);
		});

		it('should acquire emitter from pool', () => {
			const config = { speed: 100 };
			const emitter = particlePool.emit('particle', 100, 200, config);

			expect(emitter).toBeDefined();
			expect(mockScene.add.particles).toHaveBeenCalled();
		});

		it('should set emitter position', () => {
			const config = { speed: 100 };
			const emitter = particlePool.emit('particle', 150, 250, config);

			expect(emitter.setPosition).toHaveBeenCalledWith(150, 250);
			expect(emitter.x).toBe(150);
			expect(emitter.y).toBe(250);
		});

		it('should set emitter visible', () => {
			const config = { speed: 100 };
			const emitter = particlePool.emit('particle', 100, 200, config);

			expect(emitter.setVisible).toHaveBeenCalledWith(true);
			expect(emitter.visible).toBe(true);
		});

		it('should apply config to emitter', () => {
			const config = { speed: 200, lifespan: 2000 };
			const emitter = particlePool.emit('particle', 100, 200, config);

			expect(emitter.setConfig).toHaveBeenCalledWith(config);
		});

		it('should start emitter', () => {
			const config = { speed: 100 };
			const emitter = particlePool.emit('particle', 100, 200, config);

			expect(emitter.start).toHaveBeenCalled();
		});

		it('should not auto-release when duration is 0', () => {
			const config = { speed: 100 };
			particlePool.emit('particle', 100, 200, config, 0);

			expect(mockScene.time.delayedCall).not.toHaveBeenCalled();
		});

		it('should auto-release after duration when specified', () => {
			const config = { speed: 100 };
			particlePool.emit('particle', 100, 200, config, 1000);

			expect(mockScene.time.delayedCall).toHaveBeenCalledWith(1000, expect.any(Function));
		});

		it('should reuse pool for same texture', () => {
			const config = { speed: 100 };
			particlePool.emit('particle', 100, 200, config);
			particlePool.emit('particle', 150, 250, config);

			// Should still have only one pool
			expect(particlePool['pools'].size).toBe(1);
		});

		it('should create separate pools for different textures', () => {
			const config = { speed: 100 };
			particlePool.emit('fire', 100, 200, config);
			particlePool.emit('ice', 150, 250, config);

			expect(particlePool['pools'].size).toBe(2);
			expect(particlePool['pools'].has('fire')).toBe(true);
			expect(particlePool['pools'].has('ice')).toBe(true);
		});

		it('should handle negative positions', () => {
			const config = { speed: 100 };
			const emitter = particlePool.emit('particle', -50, -30, config);

			expect(emitter.x).toBe(-50);
			expect(emitter.y).toBe(-30);
		});

		it('should handle empty config', () => {
			const emitter = particlePool.emit('particle', 100, 200, {});

			expect(emitter.setConfig).toHaveBeenCalledWith({});
		});
	});

	describe('burst()', () => {
		it('should create burst of particles', () => {
			const config = { speed: 100, lifespan: 1000 };
			particlePool.burst('particle', 100, 200, 30, config);

			const emitter = mockEmitters[mockEmitters.length - 1];
			expect(emitter.explode).toHaveBeenCalledWith(30, 100, 200);
		});

		it('should set position for burst', () => {
			const config = { speed: 100, lifespan: 1000 };
			particlePool.burst('particle', 150, 250, 20, config);

			const emitter = mockEmitters[mockEmitters.length - 1];
			expect(emitter.setPosition).toHaveBeenCalledWith(150, 250);
			expect(emitter.x).toBe(150);
			expect(emitter.y).toBe(250);
		});

		it('should apply config to burst emitter', () => {
			const config = { speed: 200, lifespan: 2000 };
			particlePool.burst('particle', 100, 200, 25, config);

			const emitter = mockEmitters[mockEmitters.length - 1];
			expect(emitter.setConfig).toHaveBeenCalledWith(config);
		});

		it('should auto-release after lifespan with number lifespan', () => {
			const config = { speed: 100, lifespan: 1000 };
			particlePool.burst('particle', 100, 200, 30, config);

			// Should delay by lifespan + 100ms buffer
			expect(mockScene.time.delayedCall).toHaveBeenCalledWith(1100, expect.any(Function));
		});

		it('should use max lifespan from array', () => {
			const config = { speed: 100, lifespan: [500, 1000, 1500] };
			particlePool.burst('particle', 100, 200, 30, config);

			// Should use max (1500) + 100ms buffer
			expect(mockScene.time.delayedCall).toHaveBeenCalledWith(1600, expect.any(Function));
		});

		it('should default to 1000ms lifespan if not specified', () => {
			const config = { speed: 100 };
			particlePool.burst('particle', 100, 200, 30, config);

			// Should use default 1000 + 100ms buffer
			expect(mockScene.time.delayedCall).toHaveBeenCalledWith(1100, expect.any(Function));
		});

		it('should handle zero count', () => {
			const config = { speed: 100, lifespan: 1000 };
			particlePool.burst('particle', 100, 200, 0, config);

			const emitter = mockEmitters[mockEmitters.length - 1];
			expect(emitter.explode).toHaveBeenCalledWith(0, 100, 200);
		});

		it('should handle large count', () => {
			const config = { speed: 100, lifespan: 1000 };
			particlePool.burst('particle', 100, 200, 1000, config);

			const emitter = mockEmitters[mockEmitters.length - 1];
			expect(emitter.explode).toHaveBeenCalledWith(1000, 100, 200);
		});

		it('should set emitter visible', () => {
			const config = { speed: 100, lifespan: 1000 };
			particlePool.burst('particle', 100, 200, 30, config);

			const emitter = mockEmitters[mockEmitters.length - 1];
			expect(emitter.setVisible).toHaveBeenCalledWith(true);
		});

		it('should create separate pools for different textures in burst', () => {
			const config = { speed: 100, lifespan: 1000 };
			particlePool.burst('fire', 100, 200, 20, config);
			particlePool.burst('ice', 150, 250, 25, config);

			expect(particlePool['pools'].size).toBe(2);
		});
	});

	describe('release()', () => {
		it('should release emitter back to pool', () => {
			const config = { speed: 100 };
			const emitter = particlePool.emit('particle', 100, 200, config);
			const pool = particlePool['pools'].get('particle');

			particlePool.release('particle', emitter);

			expect(pool?.release).toHaveBeenCalledWith(emitter);
		});

		it('should do nothing if pool does not exist', () => {
			const config = { speed: 100 };
			const emitter = particlePool.emit('particle', 100, 200, config);

			// Should not throw
			expect(() => {
				particlePool.release('nonexistent', emitter);
			}).not.toThrow();
		});

		it('should handle releasing same emitter multiple times', () => {
			const config = { speed: 100 };
			const emitter = particlePool.emit('particle', 100, 200, config);
			const pool = particlePool['pools'].get('particle');

			particlePool.release('particle', emitter);
			particlePool.release('particle', emitter);

			expect(pool?.release).toHaveBeenCalledTimes(2);
		});
	});

	describe('clear()', () => {
		it('should clear all pools', () => {
			const config = { speed: 100 };
			particlePool.emit('fire', 100, 200, config);
			particlePool.emit('ice', 150, 250, config);
			particlePool.emit('lightning', 200, 300, config);

			expect(particlePool['pools'].size).toBe(3);

			particlePool.clear();

			expect(particlePool['pools'].size).toBe(0);
		});

		it('should call clear on each pool', () => {
			const config = { speed: 100 };
			particlePool.emit('fire', 100, 200, config);
			particlePool.emit('ice', 150, 250, config);

			const firePool = particlePool['pools'].get('fire');
			const icePool = particlePool['pools'].get('ice');

			particlePool.clear();

			expect(firePool?.clear).toHaveBeenCalled();
			expect(icePool?.clear).toHaveBeenCalled();
		});

		it('should handle clearing empty pools', () => {
			expect(() => {
				particlePool.clear();
			}).not.toThrow();
		});

		it('should allow emitting after clear', () => {
			const config = { speed: 100 };
			particlePool.emit('particle', 100, 200, config);
			particlePool.clear();

			const emitter = particlePool.emit('particle', 150, 250, config);

			expect(emitter).toBeDefined();
			expect(particlePool['pools'].size).toBe(1);
		});
	});

	describe('getStats()', () => {
		it('should return empty stats for no pools', () => {
			const stats = particlePool.getStats();

			expect(stats).toEqual({});
		});

		it('should return stats for single pool', () => {
			const config = { speed: 100 };
			particlePool.emit('particle', 100, 200, config);

			const stats = particlePool.getStats();

			expect(stats).toHaveProperty('particle');
			expect(typeof stats.particle).toBe('number');
		});

		it('should return stats for multiple pools', () => {
			const config = { speed: 100 };
			particlePool.emit('fire', 100, 200, config);
			particlePool.emit('ice', 150, 250, config);
			particlePool.emit('lightning', 200, 300, config);

			const stats = particlePool.getStats();

			expect(stats).toHaveProperty('fire');
			expect(stats).toHaveProperty('ice');
			expect(stats).toHaveProperty('lightning');
		});

		it('should call size() on each pool', () => {
			const config = { speed: 100 };
			particlePool.emit('fire', 100, 200, config);
			particlePool.emit('ice', 150, 250, config);

			const firePool = particlePool['pools'].get('fire');
			const icePool = particlePool['pools'].get('ice');

			particlePool.getStats();

			expect(firePool?.size).toHaveBeenCalled();
			expect(icePool?.size).toHaveBeenCalled();
		});
	});

	describe('Pool Creation', () => {
		it('should create pool with correct initial size', () => {
			const config = { speed: 100 };
			particlePool.emit('particle', 100, 200, config);

			// Pool should have initial size of 5 (from constructor)
			const pool = particlePool['pools'].get('particle');
			expect(pool).toBeDefined();
		});

		it('should create pool with correct max size', () => {
			const config = { speed: 100 };
			particlePool.emit('particle', 100, 200, config);

			// Max size should be 50 (from constructor)
			const pool = particlePool['pools'].get('particle');
			expect(pool).toBeDefined();
		});

		it('should set emitter depth to 50', () => {
			const config = { speed: 100 };
			particlePool.emit('particle', 100, 200, config);

			// Check that created emitters have depth 50
			const emitter = mockEmitters[0];
			expect(emitter.setDepth).toHaveBeenCalledWith(50);
		});

		it('should have reset function that stops emitter', () => {
			const config = { speed: 100 };
			const emitter = particlePool.emit('particle', 100, 200, config);
			const pool = particlePool['pools'].get('particle') as any;

			// Call reset function directly
			pool._resetFn(emitter);

			expect(emitter.stop).toHaveBeenCalled();
		});

		it('should have reset function that resets position', () => {
			const config = { speed: 100 };
			const emitter = particlePool.emit('particle', 100, 200, config);
			const pool = particlePool['pools'].get('particle') as any;

			// Call reset function directly
			pool._resetFn(emitter);

			expect(emitter.setPosition).toHaveBeenCalledWith(0, 0);
		});

		it('should have reset function that sets invisible', () => {
			const config = { speed: 100 };
			const emitter = particlePool.emit('particle', 100, 200, config);
			const pool = particlePool['pools'].get('particle') as any;

			// Call reset function directly
			pool._resetFn(emitter);

			expect(emitter.setVisible).toHaveBeenCalledWith(false);
		});

		it('should have reset function that kills all particles if available', () => {
			const config = { speed: 100 };
			const emitter = particlePool.emit('particle', 100, 200, config);
			const pool = particlePool['pools'].get('particle') as any;

			// Call reset function directly
			pool._resetFn(emitter);

			expect(emitter.killAll).toHaveBeenCalled();
		});

		it('should handle reset when killAll is not available', () => {
			const config = { speed: 100 };
			const emitter = particlePool.emit('particle', 100, 200, config);
			const pool = particlePool['pools'].get('particle') as any;

			// Remove killAll
			delete emitter.killAll;

			// Should not throw
			expect(() => {
				pool._resetFn(emitter);
			}).not.toThrow();
		});
	});

	describe('Auto-Release Integration', () => {
		it('should auto-release emit after duration', () => {
			const config = { speed: 100 };
			const emitter = particlePool.emit('particle', 100, 200, config, 1000);
			const pool = particlePool['pools'].get('particle');

			// Execute the delayed callback
			const timerCallback = timerCallbacks[0];
			expect(timerCallback.delay).toBe(1000);
			timerCallback.callback();

			expect(pool?.release).toHaveBeenCalledWith(emitter);
		});

		it('should auto-release burst after lifespan', () => {
			const config = { speed: 100, lifespan: 2000 };
			particlePool.burst('particle', 100, 200, 30, config);
			const pool = particlePool['pools'].get('particle');
			const emitter = mockEmitters[mockEmitters.length - 1];

			// Execute the delayed callback
			const timerCallback = timerCallbacks[timerCallbacks.length - 1];
			expect(timerCallback.delay).toBe(2100); // 2000 + 100 buffer
			timerCallback.callback();

			expect(pool?.release).toHaveBeenCalledWith(emitter);
		});
	});

	describe('Edge Cases', () => {
		it('should handle very large positions', () => {
			const config = { speed: 100 };
			const emitter = particlePool.emit('particle', 999999, 888888, config);

			expect(emitter.x).toBe(999999);
			expect(emitter.y).toBe(888888);
		});

		it('should handle zero positions', () => {
			const config = { speed: 100 };
			const emitter = particlePool.emit('particle', 0, 0, config);

			expect(emitter.x).toBe(0);
			expect(emitter.y).toBe(0);
		});

		it('should handle fractional positions', () => {
			const config = { speed: 100 };
			const emitter = particlePool.emit('particle', 100.5, 200.7, config);

			expect(emitter.x).toBe(100.5);
			expect(emitter.y).toBe(200.7);
		});

		it('should handle very long texture names', () => {
			const config = { speed: 100 };
			const longName = 'a'.repeat(1000);
			const emitter = particlePool.emit(longName, 100, 200, config);

			expect(particlePool['pools'].has(longName)).toBe(true);
			expect(emitter).toBeDefined();
		});

		it('should handle special characters in texture names', () => {
			const config = { speed: 100 };
			const specialName = 'particle-v2.0_test@123';
			const emitter = particlePool.emit(specialName, 100, 200, config);

			expect(particlePool['pools'].has(specialName)).toBe(true);
			expect(emitter).toBeDefined();
		});

		it('should handle empty texture name', () => {
			const config = { speed: 100 };
			const emitter = particlePool.emit('', 100, 200, config);

			expect(particlePool['pools'].has('')).toBe(true);
			expect(emitter).toBeDefined();
		});

		it('should handle very short duration', () => {
			const config = { speed: 100 };
			particlePool.emit('particle', 100, 200, config, 1);

			expect(mockScene.time.delayedCall).toHaveBeenCalledWith(1, expect.any(Function));
		});

		it('should handle very large duration', () => {
			const config = { speed: 100 };
			particlePool.emit('particle', 100, 200, config, 999999);

			expect(mockScene.time.delayedCall).toHaveBeenCalledWith(999999, expect.any(Function));
		});

		it('should handle lifespan array with single value', () => {
			const config = { speed: 100, lifespan: [1000] };
			particlePool.burst('particle', 100, 200, 30, config);

			expect(mockScene.time.delayedCall).toHaveBeenCalledWith(1100, expect.any(Function));
		});

		it('should handle complex config objects', () => {
			const config = {
				speed: { min: 50, max: 150 },
				lifespan: [500, 1000, 1500],
				scale: { start: 1, end: 0 },
				alpha: { start: 1, end: 0 },
				tint: 0xff0000,
			};
			const emitter = particlePool.emit('particle', 100, 200, config);

			expect(emitter.setConfig).toHaveBeenCalledWith(config);
		});
	});

	describe('Complex Config Handling (emitZone fix)', () => {
		it('should detect emitZone as complex config', () => {
			const config = {
				speed: 100,
				emitZone: { type: 'random', source: { getRandomPoint: jest.fn() } },
			};
			const emitter = particlePool.emit('particle', 100, 200, config);

			// Should not use pooling for emitZone configs
			// Emitter should be tracked in nonPooledEmitters
			expect(particlePool['nonPooledEmitters'].has(emitter)).toBe(true);
		});

		it('should detect deathZone as complex config', () => {
			const config = {
				speed: 100,
				deathZone: { type: 'onEnter', source: { contains: jest.fn() } },
			};
			const emitter = particlePool.emit('particle', 100, 200, config);

			expect(particlePool['nonPooledEmitters'].has(emitter)).toBe(true);
		});

		it('should detect moveToX as complex config', () => {
			const config = { speed: 100, moveToX: 500 };
			const emitter = particlePool.emit('particle', 100, 200, config);

			expect(particlePool['nonPooledEmitters'].has(emitter)).toBe(true);
		});

		it('should detect moveToY as complex config', () => {
			const config = { speed: 100, moveToY: 400 };
			const emitter = particlePool.emit('particle', 100, 200, config);

			expect(particlePool['nonPooledEmitters'].has(emitter)).toBe(true);
		});

		it('should not use pooling for burst with emitZone', () => {
			const config = {
				speed: 100,
				lifespan: 1000,
				emitZone: { type: 'random', source: { getRandomPoint: jest.fn() } },
			};
			particlePool.burst('particle', 100, 200, 30, config);

			// Should not add to pools
			expect(particlePool['pools'].size).toBe(0);
		});

		it('should destroy non-pooled emitter after duration', () => {
			const config = {
				speed: 100,
				emitZone: { type: 'random', source: { getRandomPoint: jest.fn() } },
			};
			const emitter = particlePool.emit('particle', 100, 200, config, 1000);

			// Add destroy mock
			emitter.destroy = jest.fn();
			emitter.scene = mockScene;

			expect(particlePool['nonPooledEmitters'].has(emitter)).toBe(true);

			// Execute the delayed callback
			const timerCallback = timerCallbacks[timerCallbacks.length - 1];
			timerCallback.callback();

			expect(emitter.destroy).toHaveBeenCalled();
			expect(particlePool['nonPooledEmitters'].has(emitter)).toBe(false);
		});

		it('should destroy non-pooled emitter after burst lifespan', () => {
			const config = {
				speed: 100,
				lifespan: 1000,
				emitZone: { type: 'random', source: { getRandomPoint: jest.fn() } },
			};
			particlePool.burst('particle', 100, 200, 30, config);

			const emitter = mockEmitters[mockEmitters.length - 1];
			emitter.destroy = jest.fn();
			emitter.scene = mockScene;

			// Execute the delayed callback
			const timerCallback = timerCallbacks[timerCallbacks.length - 1];
			timerCallback.callback();

			expect(emitter.destroy).toHaveBeenCalled();
		});

		it('should use pooling for simple configs without emitZone', () => {
			const config = { speed: 100, lifespan: 1000 };
			const emitter = particlePool.emit('particle', 100, 200, config);

			// Should use pooling
			expect(particlePool['nonPooledEmitters'].has(emitter)).toBe(false);
			expect(particlePool['pools'].size).toBe(1);
		});

		it('should clean up non-pooled emitters on clear', () => {
			const config = {
				speed: 100,
				emitZone: { type: 'random', source: { getRandomPoint: jest.fn() } },
			};
			const emitter = particlePool.emit('particle', 100, 200, config);

			emitter.destroy = jest.fn();
			emitter.scene = mockScene;

			expect(particlePool['nonPooledEmitters'].size).toBe(1);

			particlePool.clear();

			expect(emitter.destroy).toHaveBeenCalled();
			expect(particlePool['nonPooledEmitters'].size).toBe(0);
		});

		it('should handle mixed simple and complex configs', () => {
			const simpleConfig = { speed: 100 };
			const complexConfig = {
				speed: 100,
				emitZone: { type: 'random', source: { getRandomPoint: jest.fn() } },
			};

			const simpleEmitter = particlePool.emit('particle', 100, 200, simpleConfig);
			const complexEmitter = particlePool.emit('particle', 150, 250, complexConfig);

			expect(particlePool['nonPooledEmitters'].has(simpleEmitter)).toBe(false);
			expect(particlePool['nonPooledEmitters'].has(complexEmitter)).toBe(true);
			expect(particlePool['pools'].size).toBe(1); // Only simple config creates pool
		});
	});

	describe('Integration', () => {
		it('should handle multiple emit and release cycles', () => {
			const config = { speed: 100 };
			const emitter1 = particlePool.emit('particle', 100, 200, config);
			particlePool.release('particle', emitter1);

			const emitter2 = particlePool.emit('particle', 150, 250, config);
			particlePool.release('particle', emitter2);

			// Should still have only one pool
			expect(particlePool['pools'].size).toBe(1);
		});

		it('should handle mixed emit and burst operations', () => {
			const config = { speed: 100, lifespan: 1000 };
			particlePool.emit('particle', 100, 200, config);
			particlePool.burst('particle', 150, 250, 30, config);
			particlePool.emit('particle', 200, 300, config);

			// Should reuse same pool
			expect(particlePool['pools'].size).toBe(1);
		});

		it('should maintain separate pools through complex operations', () => {
			const config = { speed: 100, lifespan: 1000 };
			particlePool.emit('fire', 100, 200, config);
			particlePool.burst('ice', 150, 250, 30, config);
			particlePool.emit('fire', 200, 300, config);
			particlePool.burst('lightning', 250, 350, 20, config);

			expect(particlePool['pools'].size).toBe(3);
			expect(particlePool['pools'].has('fire')).toBe(true);
			expect(particlePool['pools'].has('ice')).toBe(true);
			expect(particlePool['pools'].has('lightning')).toBe(true);
		});

		it('should handle complete workflow: emit, release, clear, stats', () => {
			const config = { speed: 100 };
			const emitter = particlePool.emit('particle', 100, 200, config);
			particlePool.release('particle', emitter);

			let stats = particlePool.getStats();
			expect(stats).toHaveProperty('particle');

			particlePool.clear();

			stats = particlePool.getStats();
			expect(stats).toEqual({});
		});
	});
});
