/**
 * SpellEffects Plugin
 * Handles visual particle effects for all spell types
 */

import Phaser from 'phaser';
import { NumericColors } from '../../consts/Colors';
import { AnimationTiming, ParticleValues, SpellEffectDurations } from '../../consts/Numbers';
import {
	FIREBALL_PARTICLE,
	FIRE_TRAIL_PARTICLE,
	FLAME_WAVE_PARTICLE,
	ICE_SHARD_PARTICLE,
	FROST_NOVA_PARTICLE,
	FROZEN_GROUND_PARTICLE,
	LIGHTNING_BOLT_PARTICLE,
	CHAIN_LIGHTNING_PARTICLE,
	STATIC_FIELD_PARTICLE,
	HEAL_PARTICLE,
	DIVINE_SHIELD_PARTICLE,
	RESURRECTION_PARTICLE,
	POISON_CLOUD_PARTICLE,
	SHADOW_BOLT_PARTICLE,
	CURSE_PARTICLE,
} from '../../consts/ParticleConfigs';

export class SpellEffects {
	private scene: Phaser.Scene;
	private particleTexture: string;

	constructor(scene: Phaser.Scene, particleTexture: string = 'flares') {
		this.scene = scene;
		this.particleTexture = particleTexture;
	}

	/**
	 * Fire Magic Effects
	 */
	public fireball(x: number, y: number, count: number = 30): void {
		const emitter = this.scene.add.particles(x, y, this.particleTexture, FIREBALL_PARTICLE);
		emitter.explode(count, x, y);

		// Auto-cleanup after particles die
		this.scene.time.delayedCall(AnimationTiming.TWEEN_VERY_SLOW, () => {
			emitter.destroy();
		});
	}

	public fireTrail(
		x: number,
		y: number,
		targetX: number,
		targetY: number,
		duration: number = ParticleValues.LIFESPAN_LONG
	): Phaser.GameObjects.Particles.ParticleEmitter {
		const emitter = this.scene.add.particles(x, y, this.particleTexture, FIRE_TRAIL_PARTICLE);

		// Move emitter along path
		this.scene.tweens.add({
			targets: emitter,
			x: targetX,
			y: targetY,
			duration,
			onComplete: () => {
				emitter.stop();
				this.scene.time.delayedCall(AnimationTiming.TWEEN_SLOW, () => {
					emitter.destroy();
				});
			},
		});

		return emitter;
	}

	public flameWave(x: number, y: number, direction: number, count: number = 50): void {
		const config = { ...FLAME_WAVE_PARTICLE };

		// Adjust angle based on direction (in radians)
		const directionDegrees = Phaser.Math.RadToDeg(direction);
		config.angle = { min: directionDegrees - 30, max: directionDegrees + 30 };

		const emitter = this.scene.add.particles(x, y, this.particleTexture, config);
		emitter.explode(count, x, y);

		this.scene.time.delayedCall(ParticleValues.LIFESPAN_LONG, () => {
			emitter.destroy();
		});
	}

	/**
	 * Ice Magic Effects
	 */
	public iceShard(x: number, y: number, count: number = 20): void {
		const emitter = this.scene.add.particles(x, y, this.particleTexture, ICE_SHARD_PARTICLE);
		emitter.explode(count, x, y);

		this.scene.time.delayedCall(800, () => {
			emitter.destroy();
		});
	}

	public frostNova(x: number, y: number, radius: number = 100, count: number = 40): void {
		const emitter = this.scene.add.particles(x, y, this.particleTexture, FROST_NOVA_PARTICLE);
		emitter.explode(count, x, y);

		// Add freeze effect ring
		const graphics = this.scene.add.graphics();
		graphics.lineStyle(3, NumericColors.BLUE_LIGHT, 1);

		// Animate expanding ring
		const ringData = { radius: 0 };
		this.scene.tweens.add({
			targets: ringData,
			radius,
			duration: AnimationTiming.TWEEN_SLOW,
			onUpdate: (tween: Phaser.Tweens.Tween) => {
				graphics.clear();
				graphics.lineStyle(3, NumericColors.BLUE_LIGHT, 1 - tween.progress);
				graphics.strokeCircle(x, y, ringData.radius);
			},
			onComplete: () => {
				graphics.destroy();
				emitter.destroy();
			},
		});
	}

	public frozenGround(
		x: number,
		y: number,
		radius: number = 80,
		duration: number = SpellEffectDurations.FROZEN_GROUND
	): Phaser.GameObjects.Particles.ParticleEmitter {
		const config = { ...FROZEN_GROUND_PARTICLE };

		// Create circular emitter zone
		const emitter = this.scene.add.particles(x, y, this.particleTexture, {
			...config,
			emitZone: {
				type: 'random',
				source: new Phaser.Geom.Circle(0, 0, radius),
			} as any,
		});

		// Stop after duration
		this.scene.time.delayedCall(duration, () => {
			emitter.stop();
			this.scene.time.delayedCall(SpellEffectDurations.FROST_CLEANUP, () => {
				emitter.destroy();
			});
		});

		return emitter;
	}

	/**
	 * Lightning Effects
	 */
	public lightningBolt(x: number, y: number, targetX: number, targetY: number): void {
		// Create line of particles from source to target
		const distance = Phaser.Math.Distance.Between(x, y, targetX, targetY);
		const angle = Phaser.Math.Angle.Between(x, y, targetX, targetY);

		const config = { ...LIGHTNING_BOLT_PARTICLE };
		config.angle = { min: Phaser.Math.RadToDeg(angle) - 10, max: Phaser.Math.RadToDeg(angle) + 10 };

		// Draw lightning line
		const graphics = this.scene.add.graphics();
		graphics.lineStyle(3, NumericColors.WHITE, 1);
		graphics.lineBetween(x, y, targetX, targetY);

		// Particles along the path
		const emitter = this.scene.add.particles(x, y, this.particleTexture, config);
		emitter.explode(Math.floor(distance / 10), x, y);

		// Cleanup
		this.scene.time.delayedCall(100, () => {
			graphics.destroy();
		});

		this.scene.time.delayedCall(SpellEffectDurations.LIGHTNING_BOLT_CLEANUP, () => {
			emitter.destroy();
		});
	}

	public chainLightning(targets: { x: number; y: number }[]): void {
		if (targets.length < 2) return;

		for (let i = 0; i < targets.length - 1; i++) {
			const from = targets[i];
			const to = targets[i + 1];

			// Delay each chain link slightly
			this.scene.time.delayedCall(i * 100, () => {
				this.lightningBolt(from.x, from.y, to.x, to.y);
			});
		}
	}

	public staticField(
		x: number,
		y: number,
		radius: number = 60,
		duration: number = ParticleValues.LIFESPAN_VERY_LONG
	): Phaser.GameObjects.Particles.ParticleEmitter {
		const emitter = this.scene.add.particles(x, y, this.particleTexture, {
			...STATIC_FIELD_PARTICLE,
			emitZone: {
				type: 'random',
				source: new Phaser.Geom.Circle(0, 0, radius),
			} as any,
		});

		this.scene.time.delayedCall(duration, () => {
			emitter.stop();
			this.scene.time.delayedCall(AnimationTiming.TWEEN_VERY_SLOW, () => {
				emitter.destroy();
			});
		});

		return emitter;
	}

	/**
	 * Holy/Healing Effects
	 */
	public heal(x: number, y: number, count: number = 25): void {
		const emitter = this.scene.add.particles(x, y, this.particleTexture, HEAL_PARTICLE);
		emitter.explode(count, x, y);

		this.scene.time.delayedCall(SpellEffectDurations.HEAL_CLEANUP, () => {
			emitter.destroy();
		});
	}

	public divineShield(
		x: number,
		y: number,
		radius: number = 50,
		duration: number = SpellEffectDurations.DIVINE_SHIELD
	): Phaser.GameObjects.Particles.ParticleEmitter {
		const emitter = this.scene.add.particles(x, y, this.particleTexture, {
			...DIVINE_SHIELD_PARTICLE,
			emitZone: {
				type: 'edge',
				source: new Phaser.Geom.Circle(0, 0, radius),
				quantity: 32,
			} as any,
		});

		this.scene.time.delayedCall(duration, () => {
			emitter.stop();
			this.scene.time.delayedCall(SpellEffectDurations.SHIELD_CLEANUP, () => {
				emitter.destroy();
			});
		});

		return emitter;
	}

	public resurrection(x: number, y: number, count: number = 60): void {
		const emitter = this.scene.add.particles(x, y, this.particleTexture, RESURRECTION_PARTICLE);
		emitter.explode(count, x, y);

		// Add bright flash
		const flash = this.scene.add.graphics();
		flash.fillStyle(NumericColors.WHITE, 1);
		flash.fillCircle(x, y, 100);
		flash.setBlendMode(1); // ADD blend mode

		this.scene.tweens.add({
			targets: flash,
			alpha: 0,
			duration: AnimationTiming.TWEEN_NORMAL,
			onComplete: () => {
				flash.destroy();
			},
		});

		this.scene.time.delayedCall(SpellEffectDurations.RESURRECTION_CLEANUP, () => {
			emitter.destroy();
		});
	}

	/**
	 * Poison/Dark Magic Effects
	 */
	public poisonCloud(
		x: number,
		y: number,
		radius: number = 80,
		duration: number = SpellEffectDurations.POISON_CLOUD
	): Phaser.GameObjects.Particles.ParticleEmitter {
		const emitter = this.scene.add.particles(x, y, this.particleTexture, {
			...POISON_CLOUD_PARTICLE,
			emitZone: {
				type: 'random',
				source: new Phaser.Geom.Circle(0, 0, radius),
			} as any,
		});

		this.scene.time.delayedCall(duration, () => {
			emitter.stop();
			this.scene.time.delayedCall(SpellEffectDurations.POISON_CLEANUP, () => {
				emitter.destroy();
			});
		});

		return emitter;
	}

	public shadowBolt(x: number, y: number, targetX: number, targetY: number): void {
		const emitter = this.scene.add.particles(x, y, this.particleTexture, SHADOW_BOLT_PARTICLE);

		// Move emitter to target
		this.scene.tweens.add({
			targets: emitter,
			x: targetX,
			y: targetY,
			duration: AnimationTiming.TWEEN_SLOW,
			onComplete: () => {
				emitter.explode(15, targetX, targetY);
				this.scene.time.delayedCall(AnimationTiming.TWEEN_VERY_SLOW, () => {
					emitter.destroy();
				});
			},
		});
	}

	public curse(
		x: number,
		y: number,
		duration: number = SpellEffectDurations.CURSE
	): Phaser.GameObjects.Particles.ParticleEmitter {
		const emitter = this.scene.add.particles(x, y, this.particleTexture, CURSE_PARTICLE);

		this.scene.time.delayedCall(duration, () => {
			emitter.stop();
			this.scene.time.delayedCall(SpellEffectDurations.CURSE_CLEANUP, () => {
				emitter.destroy();
			});
		});

		return emitter;
	}

	/**
	 * Update method for moving emitters (like following a character)
	 */
	public updateEmitterPosition(emitter: Phaser.GameObjects.Particles.ParticleEmitter, x: number, y: number): void {
		emitter.setPosition(x, y);
	}

	/**
	 * Destroy method for cleanup
	 */
	public destroy(): void {
		// Cleanup handled by scene destroy
	}
}
