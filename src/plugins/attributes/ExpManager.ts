import { NeverquestEntityTextDisplay } from '../NeverquestEntityTextDisplay';
import { HUDScene } from '../../scenes/HUDScene';
import { ParticlePool } from '../effects/ParticlePool';
import { ExperienceMessages } from '../../consts/Messages';
import { Alpha } from '../../consts/Numbers';

interface Entity {
	attributes: {
		experience: number;
		nextLevelExperience: number;
		level: number;
		availableStatPoints: number;
		baseHealth: number;
		health: number;
	};
	healthBar?: {
		full: number;
		health?: number;
		update: (health: number) => void;
		draw?: () => void;
	};
	scene: Phaser.Scene;
	getTopLeft: () => { x: number; y: number };
	width: number;
	height: number;
	scaleX: number;
	scaleY: number;
	texture: { key: string };
	container: {
		x: number;
		y: number;
	};
}

export class ExpManager {
	static displayText: NeverquestEntityTextDisplay;
	private static particlePool: Map<Phaser.Scene, ParticlePool> = new Map();

	/**
	 * Get or create particle pool for a scene
	 */
	private static getParticlePool(scene: Phaser.Scene): ParticlePool {
		if (!this.particlePool.has(scene)) {
			this.particlePool.set(scene, new ParticlePool(scene));
		}
		return this.particlePool.get(scene)!;
	}

	/**
	 * Adds exp to the player entity
	 * @param { Player | Enemy } entity the entity that should level up.
	 * @param { number } exp amount of exp received by the player.
	 * @param { number } extraExp extra exp, used for recursive call of the method.
	 */
	static addExp(entity: Entity, exp: number, extraExp: number = 0): void {
		entity.attributes.experience += exp + extraExp;
		let excedingExp = 0;
		if (entity.attributes.nextLevelExperience <= entity.attributes.experience) {
			excedingExp = entity.attributes.experience - entity.attributes.nextLevelExperience;
			this.levelUpEntity(entity);
			if (excedingExp > 0) this.addExp(entity, 0, excedingExp);
		}
	}

	/**
	 * Adds a level or more to the entity.
	 * @param { Player | Enemy} entity
	 */
	static levelUpEntity(entity: Entity): void {
		entity.attributes.level += 1;
		entity.attributes.availableStatPoints += 1;
		entity.attributes.experience = 0;
		entity.attributes.baseHealth += 10;
		entity.attributes.nextLevelExperience += 100 * entity.attributes.level;
		if (entity.healthBar) {
			entity.healthBar.full = entity.attributes.baseHealth;
			entity.healthBar.update(entity.attributes.health);
		}
		// Log level up message
		HUDScene.log(entity.scene, ExperienceMessages.LEVEL_UP(entity.attributes.level));

		// Add next level experience.
		this.levelUpEffects(entity);
	}

	/**
	 * Displays the level up effects.
	 * @param { Player | Enemy} entity
	 */
	static levelUpEffects(entity: Entity): void {
		entity.scene.sound.play('level_up');
		this.displayText = new NeverquestEntityTextDisplay(entity.scene);
		// Display placeholder number for "LEVEL UP!!" visual effect
		this.displayText.displayDamage(ExperienceMessages.LEVEL_UP_VISUAL_PLACEHOLDER, entity);

		const origin = entity.getTopLeft();
		const textures = entity.scene.textures;
		let pixel: Phaser.Display.Color;
		const logoSource = {
			getRandomPoint: (vec: Phaser.Math.Vector2) => {
				do {
					const x = Phaser.Math.Between(0, entity.width * entity.scaleX - 1);
					const y = Phaser.Math.Between(0, entity.height * entity.scaleY - 1);
					pixel = textures.getPixel(x, y, entity.texture.key) as Phaser.Display.Color;
					return vec.setTo(x + origin.x, y + origin.y);
				} while (pixel.alpha < 255);
			},
			getPoints: (quantity: number) => {
				const points: Phaser.Geom.Point[] = [];
				for (let i = 0; i < quantity; i++) {
					const vec = new Phaser.Math.Vector2();
					logoSource.getRandomPoint(vec);
					points.push(new Phaser.Geom.Point(vec.x, vec.y));
				}
				return points;
			},
		};

		// Use particle pool for better performance
		const pool = this.getParticlePool(entity.scene);

		const particleConfig: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig = {
			lifespan: 300,
			gravityY: 10,
			speed: 20,
			scale: { start: 0, end: Alpha.FOG_START, ease: 'Quad.easeOut' },
			alpha: { start: 1, end: 0, ease: 'Quad.easeIn' },
			blendMode: 'ADD',
			emitZone: { type: 'edge', source: logoSource, quantity: 1 } as any,
		};

		// Burst 50 particles at once for level-up effect
		pool.burst('flares', entity.container.x, entity.container.y, 50, particleConfig);
	}
}
