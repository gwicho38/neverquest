/**
 * Tests for ObjectPool
 */

import { ObjectPool } from '../../utils/ObjectPool';

describe('ObjectPool', () => {
	interface TestObject {
		id: number;
		active: boolean;
	}

	let nextId = 0;
	const createFn = (): TestObject => ({ id: nextId++, active: true });
	const resetFn = (obj: TestObject): void => {
		obj.active = false;
	};

	beforeEach(() => {
		nextId = 0;
	});

	describe('constructor', () => {
		it('should create pool with default parameters', () => {
			const pool = new ObjectPool<TestObject>(createFn, resetFn);
			expect(pool.size()).toBe(10); // Default initial size
		});

		it('should create pool with custom initial size', () => {
			const pool = new ObjectPool<TestObject>(createFn, resetFn, 5);
			expect(pool.size()).toBe(5);
		});

		it('should create pool with zero initial size', () => {
			const pool = new ObjectPool<TestObject>(createFn, resetFn, 0);
			expect(pool.size()).toBe(0);
		});

		it('should pre-populate pool on construction', () => {
			const pool = new ObjectPool<TestObject>(createFn, resetFn, 3);
			expect(pool.size()).toBe(3);
			expect(nextId).toBe(3); // Create function should be called 3 times
		});
	});

	describe('acquire', () => {
		it('should return object from pool when available', () => {
			const pool = new ObjectPool<TestObject>(createFn, resetFn, 3);
			const initialSize = pool.size();

			const obj = pool.acquire();

			expect(obj).toBeDefined();
			expect(pool.size()).toBe(initialSize - 1);
		});

		it('should create new object when pool is empty', () => {
			const pool = new ObjectPool<TestObject>(createFn, resetFn, 0);
			expect(pool.size()).toBe(0);

			const obj = pool.acquire();

			expect(obj).toBeDefined();
			expect(obj.active).toBe(true);
		});

		it('should return last added object (LIFO)', () => {
			const pool = new ObjectPool<TestObject>(createFn, resetFn, 3);

			// Pool has ids [0, 1, 2], last added is 2
			const obj = pool.acquire();
			expect(obj.id).toBe(2);
		});

		it('should create new objects after pool is depleted', () => {
			const pool = new ObjectPool<TestObject>(createFn, resetFn, 2);

			pool.acquire(); // Returns id 1
			pool.acquire(); // Returns id 0
			expect(pool.size()).toBe(0);

			const newObj = pool.acquire();
			expect(newObj.id).toBe(2); // New object created
		});
	});

	describe('release', () => {
		it('should return object to pool', () => {
			const pool = new ObjectPool<TestObject>(createFn, resetFn, 1);
			const obj = pool.acquire();

			expect(pool.size()).toBe(0);

			pool.release(obj);

			expect(pool.size()).toBe(1);
		});

		it('should call reset function on release', () => {
			const customReset = jest.fn((obj: TestObject) => {
				obj.active = false;
			});
			const pool = new ObjectPool<TestObject>(createFn, customReset, 1);
			const obj = pool.acquire();

			pool.release(obj);

			expect(customReset).toHaveBeenCalledWith(obj);
			expect(obj.active).toBe(false);
		});

		it('should not exceed max size', () => {
			const pool = new ObjectPool<TestObject>(createFn, resetFn, 0, 3);

			// Create and release more objects than max size
			const objects: TestObject[] = [];
			for (let i = 0; i < 5; i++) {
				objects.push(pool.acquire());
			}

			for (const obj of objects) {
				pool.release(obj);
			}

			expect(pool.size()).toBe(3); // Should be capped at maxSize
		});

		it('should allow unlimited size when maxSize is 0', () => {
			const pool = new ObjectPool<TestObject>(createFn, resetFn, 0, 0);

			// Create and release many objects
			const objects: TestObject[] = [];
			for (let i = 0; i < 200; i++) {
				objects.push(pool.acquire());
			}

			for (const obj of objects) {
				pool.release(obj);
			}

			expect(pool.size()).toBe(200);
		});
	});

	describe('size', () => {
		it('should return current pool size', () => {
			const pool = new ObjectPool<TestObject>(createFn, resetFn, 5);
			expect(pool.size()).toBe(5);
		});

		it('should update after acquire', () => {
			const pool = new ObjectPool<TestObject>(createFn, resetFn, 5);
			pool.acquire();
			expect(pool.size()).toBe(4);
		});

		it('should update after release', () => {
			const pool = new ObjectPool<TestObject>(createFn, resetFn, 0);
			const obj = pool.acquire();
			pool.release(obj);
			expect(pool.size()).toBe(1);
		});
	});

	describe('clear', () => {
		it('should empty the pool', () => {
			const pool = new ObjectPool<TestObject>(createFn, resetFn, 10);
			expect(pool.size()).toBe(10);

			pool.clear();

			expect(pool.size()).toBe(0);
		});

		it('should allow new objects after clearing', () => {
			const pool = new ObjectPool<TestObject>(createFn, resetFn, 5);
			pool.clear();

			const obj = pool.acquire();
			expect(obj).toBeDefined();

			pool.release(obj);
			expect(pool.size()).toBe(1);
		});
	});

	describe('Real-world usage patterns', () => {
		it('should handle acquire-release cycle', () => {
			const pool = new ObjectPool<TestObject>(createFn, resetFn, 5);

			// Simulate game loop pattern
			for (let i = 0; i < 100; i++) {
				const obj = pool.acquire();
				expect(obj).toBeDefined();
				pool.release(obj);
			}

			// Pool should still be functional
			expect(pool.size()).toBeGreaterThan(0);
		});

		it('should work with complex objects', () => {
			interface ComplexObject {
				position: { x: number; y: number };
				velocity: { x: number; y: number };
				sprite: string | null;
			}

			const createComplex = (): ComplexObject => ({
				position: { x: 0, y: 0 },
				velocity: { x: 0, y: 0 },
				sprite: null,
			});

			const resetComplex = (obj: ComplexObject): void => {
				obj.position.x = 0;
				obj.position.y = 0;
				obj.velocity.x = 0;
				obj.velocity.y = 0;
				obj.sprite = null;
			};

			const complexPool = new ObjectPool<ComplexObject>(createComplex, resetComplex, 3);

			const obj = complexPool.acquire();
			obj.position.x = 100;
			obj.position.y = 200;
			obj.velocity.x = 5;
			obj.sprite = 'enemy';

			complexPool.release(obj);

			// After release, object should be reset
			const reacquired = complexPool.acquire();
			expect(reacquired.position.x).toBe(0);
			expect(reacquired.position.y).toBe(0);
			expect(reacquired.sprite).toBeNull();
		});

		it('should handle burst allocation', () => {
			const pool = new ObjectPool<TestObject>(createFn, resetFn, 5, 50);

			// Burst: acquire many objects at once
			const burst: TestObject[] = [];
			for (let i = 0; i < 20; i++) {
				burst.push(pool.acquire());
			}

			expect(burst.length).toBe(20);

			// Release all
			for (const obj of burst) {
				pool.release(obj);
			}

			expect(pool.size()).toBe(20);
		});
	});
});
