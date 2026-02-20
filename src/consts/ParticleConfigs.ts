/**
 * @fileoverview Particle emitter configurations for visual effects
 *
 * This file defines reusable particle configurations for:
 * - Fire spells: Fireball, Fire Trail, Flame Wave
 * - Ice spells: Ice Shard, Frost Nova, Frozen Ground
 * - Lightning spells: Lightning Bolt, Static Field
 * - Holy spells: Heal, Divine Shield, Resurrection
 * - Dark spells: Poison Cloud, Shadow Bolt, Curse
 * - Combat effects: Hit impacts, blocks, deaths
 *
 * All configurations use Phaser particle emitter format.
 *
 * @see SpellEffects - Uses spell particle configs
 * @see CombatEffects - Uses combat particle configs
 * @see NeverquestEnvironmentParticles - Ambient effects
 *
 * @module consts/ParticleConfigs
 */

import Phaser from 'phaser';

export type ParticleConfig = Phaser.Types.GameObjects.Particles.ParticleEmitterConfig;

/**
 * Fire Magic Effects
 */
export const FIREBALL_PARTICLE: ParticleConfig = {
	speed: { min: 100, max: 200 },
	angle: { min: 0, max: 360 },
	scale: { start: 1.5, end: 0.1 },
	alpha: { start: 1, end: 0 },
	lifespan: { min: 300, max: 600 },
	gravityY: -50,
	tint: [0xff6600, 0xff3300, 0xff0000],
	blendMode: 'ADD',
};

export const FIRE_TRAIL_PARTICLE: ParticleConfig = {
	speed: { min: 20, max: 40 },
	angle: { min: 0, max: 360 },
	scale: { start: 0.8, end: 0.2 },
	alpha: { start: 0.8, end: 0 },
	lifespan: 400,
	tint: [0xff8800, 0xff4400],
	blendMode: 'ADD',
	frequency: 30,
};

export const FLAME_WAVE_PARTICLE: ParticleConfig = {
	speed: { min: 150, max: 250 },
	angle: { min: -30, max: 30 }, // Forward spread
	scale: { start: 2.0, end: 0.3 },
	alpha: { start: 1, end: 0 },
	lifespan: 800,
	tint: [0xffaa00, 0xff5500, 0xdd0000],
	blendMode: 'ADD',
};

/**
 * Ice Magic Effects
 */
export const ICE_SHARD_PARTICLE: ParticleConfig = {
	speed: { min: 80, max: 150 },
	angle: { min: 0, max: 360 },
	scale: { start: 1.2, end: 0.2 },
	alpha: { start: 1, end: 0 },
	lifespan: { min: 400, max: 700 },
	tint: [0x88ccff, 0x4499ff, 0x0066cc],
	blendMode: 'ADD',
};

export const FROST_NOVA_PARTICLE: ParticleConfig = {
	speed: { min: 100, max: 200 },
	angle: { min: 0, max: 360 },
	scale: { start: 1.5, end: 0.1 },
	alpha: { start: 1, end: 0 },
	lifespan: { min: 500, max: 900 },
	tint: [0xaaddff, 0x66aaff, 0x0088ff],
	blendMode: 'ADD',
};

export const FROZEN_GROUND_PARTICLE: ParticleConfig = {
	speed: { min: 5, max: 15 },
	angle: { min: 0, max: 360 },
	scale: { start: 0.5, end: 1.0 },
	alpha: { start: 0.6, end: 0 },
	lifespan: { min: 2000, max: 3000 },
	tint: [0xccddff, 0x88ccff],
	blendMode: 'ADD',
	frequency: 100,
};

/**
 * Lightning Effects
 */
export const LIGHTNING_BOLT_PARTICLE: ParticleConfig = {
	speed: { min: 200, max: 400 },
	angle: { min: -10, max: 10 },
	scale: { start: 1.8, end: 0.1 },
	alpha: { start: 1, end: 0 },
	lifespan: { min: 100, max: 300 },
	tint: [0xffffff, 0xaaccff, 0x6699ff],
	blendMode: 'ADD',
};

export const CHAIN_LIGHTNING_PARTICLE: ParticleConfig = {
	speed: { min: 300, max: 500 },
	scale: { start: 1.2, end: 0.2 },
	alpha: { start: 1, end: 0 },
	lifespan: 200,
	tint: [0xffffff, 0xccddff],
	blendMode: 'ADD',
};

export const STATIC_FIELD_PARTICLE: ParticleConfig = {
	speed: { min: 30, max: 60 },
	angle: { min: 0, max: 360 },
	scale: { start: 0.6, end: 0.2 },
	alpha: { start: 0.8, end: 0 },
	lifespan: { min: 300, max: 600 },
	tint: [0xffffff, 0x99ccff],
	blendMode: 'ADD',
	frequency: 50,
};

/**
 * Holy/Healing Effects
 */
export const HEAL_PARTICLE: ParticleConfig = {
	speed: { min: 40, max: 80 },
	angle: { min: -100, max: -80 }, // Upward
	scale: { start: 1.0, end: 0.2 },
	alpha: { start: 1, end: 0 },
	lifespan: { min: 800, max: 1200 },
	gravityY: -100,
	tint: [0xffee88, 0xffdd44, 0xffcc00],
	blendMode: 'ADD',
};

export const DIVINE_SHIELD_PARTICLE: ParticleConfig = {
	speed: { min: 20, max: 40 },
	angle: { min: 0, max: 360 },
	scale: { start: 1.2, end: 0.4 },
	alpha: { start: 0.8, end: 0 },
	lifespan: { min: 1000, max: 1500 },
	tint: [0xffffaa, 0xffee66],
	blendMode: 'ADD',
	frequency: 80,
};

export const RESURRECTION_PARTICLE: ParticleConfig = {
	speed: { min: 100, max: 200 },
	angle: { min: -120, max: -60 }, // Upward cone
	scale: { start: 2.0, end: 0.1 },
	alpha: { start: 1, end: 0 },
	lifespan: { min: 1000, max: 1500 },
	gravityY: -150,
	tint: [0xffffff, 0xffffdd, 0xffee99],
	blendMode: 'ADD',
};

/**
 * Poison/Dark Magic Effects
 */
export const POISON_CLOUD_PARTICLE: ParticleConfig = {
	speed: { min: 10, max: 30 },
	angle: { min: 0, max: 360 },
	scale: { start: 1.5, end: 2.5 },
	alpha: { start: 0.6, end: 0 },
	lifespan: { min: 2000, max: 3000 },
	tint: [0x44ff44, 0x00cc00, 0x008800],
	blendMode: 'NORMAL',
	frequency: 100,
};

export const SHADOW_BOLT_PARTICLE: ParticleConfig = {
	speed: { min: 50, max: 100 },
	angle: { min: 0, max: 360 },
	scale: { start: 1.2, end: 0.2 },
	alpha: { start: 0.8, end: 0 },
	lifespan: { min: 300, max: 600 },
	tint: [0x8844ff, 0x6622cc, 0x440099],
	blendMode: 'NORMAL',
};

export const CURSE_PARTICLE: ParticleConfig = {
	speed: { min: 10, max: 30 },
	angle: { min: 60, max: 120 }, // Downward
	scale: { start: 0.8, end: 0.2 },
	alpha: { start: 0.9, end: 0 },
	lifespan: { min: 800, max: 1200 },
	gravityY: 50,
	tint: [0x663399, 0x441166],
	blendMode: 'NORMAL',
	frequency: 80,
};

/**
 * Combat Effects
 */
export const HIT_IMPACT_PHYSICAL: ParticleConfig = {
	speed: { min: 100, max: 200 },
	angle: { min: 0, max: 360 },
	scale: { start: 1.0, end: 0.2 },
	alpha: { start: 1, end: 0 },
	lifespan: { min: 200, max: 400 },
	tint: [0xffffff, 0xcccccc],
	blendMode: 'NORMAL',
};

export const HIT_IMPACT_FIRE: ParticleConfig = {
	speed: { min: 80, max: 160 },
	angle: { min: 0, max: 360 },
	scale: { start: 1.2, end: 0.2 },
	alpha: { start: 1, end: 0 },
	lifespan: { min: 300, max: 500 },
	tint: [0xff8800, 0xff3300, 0xcc0000],
	blendMode: 'ADD',
};

export const HIT_IMPACT_ICE: ParticleConfig = {
	speed: { min: 60, max: 120 },
	angle: { min: 0, max: 360 },
	scale: { start: 1.0, end: 0.2 },
	alpha: { start: 1, end: 0 },
	lifespan: { min: 400, max: 600 },
	tint: [0xaaddff, 0x4499ff],
	blendMode: 'ADD',
};

export const HIT_IMPACT_LIGHTNING: ParticleConfig = {
	speed: { min: 150, max: 250 },
	angle: { min: 0, max: 360 },
	scale: { start: 1.5, end: 0.1 },
	alpha: { start: 1, end: 0 },
	lifespan: { min: 150, max: 300 },
	tint: [0xffffff, 0xccddff],
	blendMode: 'ADD',
};

export const CRITICAL_HIT_PARTICLE: ParticleConfig = {
	speed: { min: 200, max: 400 },
	angle: { min: 0, max: 360 },
	scale: { start: 2.0, end: 0.1 },
	alpha: { start: 1, end: 0 },
	lifespan: { min: 300, max: 600 },
	tint: [0xffff00, 0xffaa00, 0xff8800],
	blendMode: 'ADD',
};

export const BLOCK_PARRY_PARTICLE: ParticleConfig = {
	speed: { min: 100, max: 200 },
	angle: { min: -45, max: 45 }, // Forward deflection
	scale: { start: 0.8, end: 0.2 },
	alpha: { start: 1, end: 0 },
	lifespan: { min: 200, max: 400 },
	tint: [0xffffcc, 0xffffaa],
	blendMode: 'ADD',
};

export const DEATH_EXPLOSION_PARTICLE: ParticleConfig = {
	speed: { min: 50, max: 150 },
	angle: { min: 0, max: 360 },
	scale: { start: 1.5, end: 0.1 },
	alpha: { start: 1, end: 0 },
	lifespan: { min: 500, max: 1000 },
	gravityY: 100,
	tint: [0xffcccc, 0xff8888, 0xff4444],
	blendMode: 'NORMAL',
};

export const BLOOD_SPLATTER_PARTICLE: ParticleConfig = {
	speed: { min: 80, max: 160 },
	angle: { min: -30, max: 30 }, // Forward spray
	scale: { start: 1.0, end: 0.3 },
	alpha: { start: 1, end: 0.5 },
	lifespan: { min: 400, max: 800 },
	gravityY: 200,
	tint: [0xcc0000, 0x990000],
	blendMode: 'NORMAL',
};

/**
 * Environmental Effects
 */
export const RAIN_PARTICLE: ParticleConfig = {
	speed: { min: 300, max: 500 },
	angle: { min: 85, max: 95 }, // Straight down
	scale: { start: 0.5, end: 0.5 }, // Constant size
	alpha: { start: 0.6, end: 0.3 },
	lifespan: 2000,
	tint: [0x88ccff, 0xaaddff],
	blendMode: 'NORMAL',
	gravityY: 300,
};

export const SNOW_PARTICLE: ParticleConfig = {
	speed: { min: 20, max: 60 },
	angle: { min: 85, max: 95 },
	scale: { start: 0.8, end: 0.8 },
	alpha: { start: 0.8, end: 0.5 },
	lifespan: 5000,
	tint: [0xffffff, 0xeeeeff],
	blendMode: 'ADD',
	gravityY: 30,
};

export const LAVA_BUBBLE_PARTICLE: ParticleConfig = {
	speed: { min: 10, max: 30 },
	angle: { min: -110, max: -70 }, // Upward
	scale: { start: 0.5, end: 1.0 },
	alpha: { start: 1, end: 0 },
	lifespan: { min: 1000, max: 2000 },
	gravityY: -20,
	tint: [0xff6600, 0xff3300, 0xcc0000],
	blendMode: 'ADD',
};

export const WATER_SPLASH_PARTICLE: ParticleConfig = {
	speed: { min: 100, max: 200 },
	angle: { min: -120, max: -60 }, // Upward spray
	scale: { start: 0.8, end: 0.2 },
	alpha: { start: 1, end: 0 },
	lifespan: { min: 300, max: 600 },
	gravityY: 300,
	tint: [0x88ccff, 0x66aaee],
	blendMode: 'NORMAL',
};

export const TORCH_FLAME_PARTICLE: ParticleConfig = {
	speed: { min: 10, max: 30 },
	angle: { min: -110, max: -70 }, // Upward
	scale: { start: 1.0, end: 0.2 },
	alpha: { start: 1, end: 0 },
	lifespan: { min: 400, max: 800 },
	gravityY: -50,
	tint: [0xffaa66, 0xff8844, 0xff6622],
	blendMode: 'ADD',
	frequency: 50,
};

export const DUST_CLOUD_PARTICLE: ParticleConfig = {
	speed: { min: 20, max: 50 },
	angle: { min: 0, max: 360 },
	scale: { start: 0.5, end: 1.5 },
	alpha: { start: 0.4, end: 0 },
	lifespan: { min: 600, max: 1000 },
	tint: [0xaa9988, 0x998877],
	blendMode: 'NORMAL',
};

export const FOG_MIST_PARTICLE: ParticleConfig = {
	speed: { min: 5, max: 15 },
	angle: { min: 0, max: 360 },
	scale: { start: 2.0, end: 3.0 },
	alpha: { start: 0.3, end: 0 },
	lifespan: { min: 4000, max: 6000 },
	tint: [0xcccccc, 0xaaaaaa],
	blendMode: 'NORMAL',
	frequency: 200,
};

/**
 * Damage Type Colors (for dynamic tinting)
 */
export const DAMAGE_TYPE_COLORS = {
	PHYSICAL: [0xffffff, 0xcccccc],
	FIRE: [0xff6600, 0xff3300, 0xcc0000],
	ICE: [0x88ccff, 0x4499ff, 0x0066cc],
	LIGHTNING: [0xffffff, 0xaaccff, 0x6699ff],
	POISON: [0x44ff44, 0x00cc00],
	HOLY: [0xffffaa, 0xffee66, 0xffdd44],
	DARK: [0x8844ff, 0x6622cc, 0x440099],
};

/**
 * Helper to create custom particle config with base settings
 */
export function createCustomParticleConfig(overrides: Partial<ParticleConfig>): ParticleConfig {
	const base: ParticleConfig = {
		speed: 100,
		angle: { min: 0, max: 360 },
		scale: { start: 1, end: 0.1 },
		alpha: { start: 1, end: 0 },
		lifespan: 500,
		blendMode: 'NORMAL',
	};

	return { ...base, ...overrides };
}
