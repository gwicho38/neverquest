/**
 * @fileoverview Particle emitter object pooling for performance
 *
 * This plugin manages reusable particle emitter pools:
 * - Avoids frequent emitter creation/destruction
 * - Reduces garbage collection pressure
 * - Handles complex configs separately (emitZone, etc.)
 * - Per-texture pool management
 *
 * Significantly improves performance in particle-heavy scenes.
 *
 * @see ObjectPool - Generic pooling implementation
 * @see CombatEffects - Uses pooled particles
 * @see SpellEffects - Uses pooled particles
 *
 * @module plugins/effects/ParticlePool
 */

import Phaser from 'phaser';
import { ObjectPool } from '../../utils/ObjectPool';

export class ParticlePool {
	private scene: Phaser.Scene;
	private pools: Map<string, ObjectPool<Phaser.GameObjects.Particles.ParticleEmitter>>;
	private nonPooledEmitters: Set<Phaser.GameObjects.Particles.ParticleEmitter>;

	constructor(scene: Phaser.Scene) {
		this.scene = scene;
		this.pools = new Map();
		this.nonPooledEmitters = new Set();
	}

	/**
	 * Check if a config has complex properties that make pooling problematic
	 * Configs with emitZone cause issues when reusing emitters due to internal state
	 */
	private hasComplexConfig(config: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig): boolean {
		return !!(config.emitZone || config.deathZone || config.moveToX || config.moveToY);
	}

	/**
	 * Get or create a pool for a specific particle texture
	 * @param texture Particle texture key
	 * @param config Default particle configuration
	 */
	private getPool(
		texture: string,
		config: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig
	): ObjectPool<Phaser.GameObjects.Particles.ParticleEmitter> {
		if (!this.pools.has(texture)) {
			const pool = new ObjectPool<Phaser.GameObjects.Particles.ParticleEmitter>(
				// Create function
				() => {
					const particles = this.scene.add.particles(0, 0, texture, config);
					particles.setDepth(50); // Above most game objects
					return particles;
				},
				// Reset function
				(emitter) => {
					emitter.stop();
					emitter.setPosition(0, 0);
					emitter.setVisible(false);
					// Clear any active particles (Phaser 3.60+)
					if (emitter.killAll) {
						emitter.killAll();
					}
				},
				5, // Initial size
				50 // Max size
			);
			this.pools.set(texture, pool);
		}
		return this.pools.get(texture)!;
	}

	/**
	 * Acquire a particle emitter from the pool
	 * @param texture Particle texture key
	 * @param x X position
	 * @param y Y position
	 * @param config Particle configuration
	 * @param duration How long to emit (0 = continuous)
	 */
	emit(
		texture: string,
		x: number,
		y: number,
		config: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig,
		duration: number = 0
	): Phaser.GameObjects.Particles.ParticleEmitter {
		let emitter: Phaser.GameObjects.Particles.ParticleEmitter;

		// Complex configs (with emitZone, etc.) can't be safely pooled
		// due to internal state issues when calling setConfig()
		if (this.hasComplexConfig(config)) {
			emitter = this.scene.add.particles(x, y, texture, config);
			emitter.setDepth(50);
			this.nonPooledEmitters.add(emitter);
		} else {
			const pool = this.getPool(texture, config);
			emitter = pool.acquire();
			emitter.setPosition(x, y);
			emitter.setVisible(true);
			emitter.setConfig(config);
		}

		emitter.start();

		// Auto-release/destroy after duration if specified
		if (duration > 0) {
			this.scene.time.delayedCall(duration, () => {
				if (this.nonPooledEmitters.has(emitter)) {
					this.nonPooledEmitters.delete(emitter);
					emitter.destroy();
				} else {
					this.release(texture, emitter);
				}
			});
		}

		return emitter;
	}

	/**
	 * Emit a burst of particles (one-time effect)
	 * @param texture Particle texture key
	 * @param x X position
	 * @param y Y position
	 * @param count Number of particles
	 * @param config Particle configuration
	 */
	burst(
		texture: string,
		x: number,
		y: number,
		count: number,
		config: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig
	): void {
		let emitter: Phaser.GameObjects.Particles.ParticleEmitter;
		const isComplex = this.hasComplexConfig(config);

		// Complex configs (with emitZone, etc.) can't be safely pooled
		// due to internal state issues when calling setConfig()
		if (isComplex) {
			emitter = this.scene.add.particles(x, y, texture, config);
			emitter.setDepth(50);
			this.nonPooledEmitters.add(emitter);
		} else {
			const pool = this.getPool(texture, config);
			emitter = pool.acquire();
			emitter.setPosition(x, y);
			emitter.setVisible(true);
			emitter.setConfig(config);
		}

		emitter.explode(count, x, y);

		// Auto-release/destroy after particles die
		const maxLifespan = Array.isArray(config.lifespan)
			? Math.max(...(config.lifespan as number[]))
			: ((config.lifespan || 1000) as number);

		this.scene.time.delayedCall(maxLifespan + 100, () => {
			if (isComplex) {
				this.nonPooledEmitters.delete(emitter);
				emitter.destroy();
			} else {
				this.release(texture, emitter);
			}
		});
	}

	/**
	 * Release a particle emitter back to the pool
	 * @param texture Particle texture key
	 * @param emitter The emitter to release
	 */
	release(texture: string, emitter: Phaser.GameObjects.Particles.ParticleEmitter): void {
		const pool = this.pools.get(texture);
		if (pool) {
			pool.release(emitter);
		}
	}

	/**
	 * Clear all pools and destroy non-pooled emitters
	 */
	clear(): void {
		this.pools.forEach((pool) => pool.clear());
		this.pools.clear();

		// Clean up non-pooled emitters
		this.nonPooledEmitters.forEach((emitter) => {
			if (emitter && !emitter.scene) return; // Already destroyed
			emitter.destroy();
		});
		this.nonPooledEmitters.clear();
	}

	/**
	 * Get stats for debugging
	 */
	getStats(): { [texture: string]: number } {
		const stats: { [texture: string]: number } = {};
		this.pools.forEach((pool, texture) => {
			stats[texture] = pool.size();
		});
		return stats;
	}
}
