/**
 * Tests for SpellEffects plugin
 */

import { SpellEffects } from '../../../plugins/effects/SpellEffects';

// Mock Phaser module
jest.mock('phaser', () => {
	return {
		__esModule: true,
		default: {
			Math: {
				RadToDeg: (radians: number) => radians * (180 / Math.PI),
				Distance: {
					Between: (x1: number, y1: number, x2: number, y2: number) => {
						const dx = x2 - x1;
						const dy = y2 - y1;
						return Math.sqrt(dx * dx + dy * dy);
					},
				},
				Angle: {
					Between: (x1: number, y1: number, x2: number, y2: number) => {
						return Math.atan2(y2 - y1, x2 - x1);
					},
				},
			},
			Geom: {
				Circle: jest.fn((x, y, radius) => ({ x, y, radius, type: 'Circle' })),
			},
		},
	};
});

describe('SpellEffects', () => {
	let spellEffects: SpellEffects;
	let mockScene: any;
	let mockParticleEmitter: any;
	let mockGraphics: any;
	let mockTween: any;

	beforeEach(() => {
		// Mock particle emitter
		mockParticleEmitter = {
			explode: jest.fn(),
			destroy: jest.fn(),
			stop: jest.fn(),
			setPosition: jest.fn(),
		};

		// Mock graphics
		mockGraphics = {
			lineStyle: jest.fn().mockReturnThis(),
			fillStyle: jest.fn().mockReturnThis(),
			fillCircle: jest.fn().mockReturnThis(),
			strokeCircle: jest.fn().mockReturnThis(),
			lineBetween: jest.fn().mockReturnThis(),
			clear: jest.fn().mockReturnThis(),
			setBlendMode: jest.fn().mockReturnThis(),
			destroy: jest.fn(),
		};

		// Mock tween
		mockTween = {
			progress: 0.5,
		};

		// Mock scene
		mockScene = {
			add: {
				particles: jest.fn().mockReturnValue(mockParticleEmitter),
				graphics: jest.fn().mockReturnValue(mockGraphics),
			},
			time: {
				delayedCall: jest.fn((delay, callback) => {
					return { callback };
				}),
			},
			tweens: {
				add: jest.fn((config) => {
					// Store config for verification
					if (config.onUpdate) {
						config.onUpdate(mockTween);
					}
					return { config };
				}),
			},
		};

		spellEffects = new SpellEffects(mockScene, 'flares');
	});

	describe('Constructor', () => {
		it('should initialize with scene and default particle texture', () => {
			const effects = new SpellEffects(mockScene);

			expect(effects['scene']).toBe(mockScene);
			expect(effects['particleTexture']).toBe('flares');
		});

		it('should initialize with custom particle texture', () => {
			const effects = new SpellEffects(mockScene, 'custom_texture');

			expect(effects['particleTexture']).toBe('custom_texture');
		});
	});

	describe('Fire Magic', () => {
		describe('fireball()', () => {
			it('should create fireball particle explosion', () => {
				spellEffects.fireball(100, 150);

				expect(mockScene.add.particles).toHaveBeenCalledWith(100, 150, 'flares', expect.any(Object));
				expect(mockParticleEmitter.explode).toHaveBeenCalled();
			});

			it('should explode with default count of 30', () => {
				spellEffects.fireball(100, 150);

				expect(mockParticleEmitter.explode).toHaveBeenCalledWith(30, 100, 150);
			});

			it('should explode with custom count', () => {
				spellEffects.fireball(100, 150, 50);

				expect(mockParticleEmitter.explode).toHaveBeenCalledWith(50, 100, 150);
			});

			it('should destroy emitter after 700ms', () => {
				spellEffects.fireball(100, 150);

				expect(mockScene.time.delayedCall).toHaveBeenCalledWith(700, expect.any(Function));
			});
		});

		describe('fireTrail()', () => {
			it('should create fire trail emitter', () => {
				spellEffects.fireTrail(50, 50, 150, 150);

				expect(mockScene.add.particles).toHaveBeenCalledWith(50, 50, 'flares', expect.any(Object));
			});

			it('should tween emitter to target position', () => {
				spellEffects.fireTrail(50, 50, 200, 250);

				expect(mockScene.tweens.add).toHaveBeenCalledWith(
					expect.objectContaining({
						targets: mockParticleEmitter,
						x: 200,
						y: 250,
					})
				);
			});

			it('should use default duration of 1000ms', () => {
				spellEffects.fireTrail(50, 50, 150, 150);

				expect(mockScene.tweens.add).toHaveBeenCalledWith(
					expect.objectContaining({
						duration: 1000,
					})
				);
			});

			it('should use custom duration', () => {
				spellEffects.fireTrail(50, 50, 150, 150, 1500);

				expect(mockScene.tweens.add).toHaveBeenCalledWith(
					expect.objectContaining({
						duration: 1500,
					})
				);
			});

			it('should return the particle emitter', () => {
				const result = spellEffects.fireTrail(50, 50, 150, 150);

				expect(result).toBe(mockParticleEmitter);
			});

			it('should stop and destroy emitter on completion', () => {
				spellEffects.fireTrail(50, 50, 150, 150);

				const tweenConfig = (mockScene.tweens.add as jest.Mock).mock.calls[0][0];
				tweenConfig.onComplete();

				expect(mockParticleEmitter.stop).toHaveBeenCalled();
				expect(mockScene.time.delayedCall).toHaveBeenCalledWith(500, expect.any(Function));
			});
		});

		describe('flameWave()', () => {
			it('should create flame wave explosion', () => {
				spellEffects.flameWave(100, 150, 0);

				expect(mockScene.add.particles).toHaveBeenCalledWith(100, 150, 'flares', expect.any(Object));
			});

			it('should adjust angle based on direction', () => {
				const direction = Math.PI / 2; // 90 degrees
				spellEffects.flameWave(100, 150, direction);

				const particleConfig = (mockScene.add.particles as jest.Mock).mock.calls[0][3];
				expect(particleConfig.angle).toBeDefined();
				expect(particleConfig.angle.min).toBeCloseTo(60, 0); // 90 - 30
				expect(particleConfig.angle.max).toBeCloseTo(120, 0); // 90 + 30
			});

			it('should explode with default count of 50', () => {
				spellEffects.flameWave(100, 150, 0);

				expect(mockParticleEmitter.explode).toHaveBeenCalledWith(50, 100, 150);
			});

			it('should explode with custom count', () => {
				spellEffects.flameWave(100, 150, 0, 75);

				expect(mockParticleEmitter.explode).toHaveBeenCalledWith(75, 100, 150);
			});

			it('should destroy emitter after 1000ms', () => {
				spellEffects.flameWave(100, 150, 0);

				expect(mockScene.time.delayedCall).toHaveBeenCalledWith(1000, expect.any(Function));
			});
		});
	});

	describe('Ice Magic', () => {
		describe('iceShard()', () => {
			it('should create ice shard particle explosion', () => {
				spellEffects.iceShard(120, 180);

				expect(mockScene.add.particles).toHaveBeenCalledWith(120, 180, 'flares', expect.any(Object));
				expect(mockParticleEmitter.explode).toHaveBeenCalled();
			});

			it('should explode with default count of 20', () => {
				spellEffects.iceShard(120, 180);

				expect(mockParticleEmitter.explode).toHaveBeenCalledWith(20, 120, 180);
			});

			it('should explode with custom count', () => {
				spellEffects.iceShard(120, 180, 35);

				expect(mockParticleEmitter.explode).toHaveBeenCalledWith(35, 120, 180);
			});

			it('should destroy emitter after 800ms', () => {
				spellEffects.iceShard(120, 180);

				expect(mockScene.time.delayedCall).toHaveBeenCalledWith(800, expect.any(Function));
			});
		});

		describe('frostNova()', () => {
			it('should create frost nova particle explosion', () => {
				spellEffects.frostNova(130, 190);

				expect(mockScene.add.particles).toHaveBeenCalledWith(130, 190, 'flares', expect.any(Object));
			});

			it('should explode with default count of 40', () => {
				spellEffects.frostNova(130, 190);

				expect(mockParticleEmitter.explode).toHaveBeenCalledWith(40, 130, 190);
			});

			it('should explode with custom count', () => {
				spellEffects.frostNova(130, 190, 150, 60);

				expect(mockParticleEmitter.explode).toHaveBeenCalledWith(60, 130, 190);
			});

			it('should create expanding ring graphics', () => {
				spellEffects.frostNova(130, 190, 120);

				expect(mockScene.add.graphics).toHaveBeenCalled();
				expect(mockGraphics.lineStyle).toHaveBeenCalled();
				expect(mockGraphics.strokeCircle).toHaveBeenCalled();
			});

			it('should animate ring to specified radius', () => {
				spellEffects.frostNova(130, 190, 150);

				expect(mockScene.tweens.add).toHaveBeenCalledWith(
					expect.objectContaining({
						duration: 500,
					})
				);
			});

			it('should destroy graphics and emitter on complete', () => {
				spellEffects.frostNova(130, 190);

				const tweenConfig = (mockScene.tweens.add as jest.Mock).mock.calls[0][0];
				tweenConfig.onComplete();

				expect(mockGraphics.destroy).toHaveBeenCalled();
				expect(mockParticleEmitter.destroy).toHaveBeenCalled();
			});
		});

		describe('frozenGround()', () => {
			it('should create frozen ground particle emitter', () => {
				spellEffects.frozenGround(140, 200);

				expect(mockScene.add.particles).toHaveBeenCalled();
			});

			it('should create circular emit zone', () => {
				spellEffects.frozenGround(140, 200, 100);

				const particleConfig = (mockScene.add.particles as jest.Mock).mock.calls[0][3];
				expect(particleConfig.emitZone).toBeDefined();
				expect(particleConfig.emitZone.source.radius).toBe(100);
			});

			it('should return the particle emitter', () => {
				const result = spellEffects.frozenGround(140, 200);

				expect(result).toBe(mockParticleEmitter);
			});

			it('should stop emitter after default duration of 3000ms', () => {
				spellEffects.frozenGround(140, 200);

				expect(mockScene.time.delayedCall).toHaveBeenCalledWith(3000, expect.any(Function));
			});

			it('should stop emitter after custom duration', () => {
				spellEffects.frozenGround(140, 200, 80, 5000);

				expect(mockScene.time.delayedCall).toHaveBeenCalledWith(5000, expect.any(Function));
			});
		});
	});

	describe('Lightning Magic', () => {
		describe('lightningBolt()', () => {
			it('should create lightning bolt between two points', () => {
				spellEffects.lightningBolt(50, 50, 150, 150);

				expect(mockScene.add.particles).toHaveBeenCalled();
				expect(mockScene.add.graphics).toHaveBeenCalled();
			});

			it('should draw lightning line', () => {
				spellEffects.lightningBolt(50, 50, 150, 150);

				expect(mockGraphics.lineStyle).toHaveBeenCalledWith(3, 0xffffff, 1);
				expect(mockGraphics.lineBetween).toHaveBeenCalledWith(50, 50, 150, 150);
			});

			it('should explode particles based on distance', () => {
				spellEffects.lightningBolt(0, 0, 100, 0); // Distance of 100

				expect(mockParticleEmitter.explode).toHaveBeenCalledWith(10, 0, 0); // 100/10 = 10
			});

			it('should destroy graphics after 100ms', () => {
				spellEffects.lightningBolt(50, 50, 150, 150);

				const delayedCalls = (mockScene.time.delayedCall as jest.Mock).mock.calls;
				const graphicsCall = delayedCalls.find((call) => call[0] === 100);

				expect(graphicsCall).toBeDefined();
			});

			it('should destroy emitter after 400ms', () => {
				spellEffects.lightningBolt(50, 50, 150, 150);

				const delayedCalls = (mockScene.time.delayedCall as jest.Mock).mock.calls;
				const emitterCall = delayedCalls.find((call) => call[0] === 400);

				expect(emitterCall).toBeDefined();
			});
		});

		describe('chainLightning()', () => {
			it('should do nothing with less than 2 targets', () => {
				spellEffects.chainLightning([{ x: 100, y: 100 }]);

				expect(mockScene.time.delayedCall).not.toHaveBeenCalled();
			});

			it('should do nothing with empty targets', () => {
				spellEffects.chainLightning([]);

				expect(mockScene.time.delayedCall).not.toHaveBeenCalled();
			});

			it('should chain between all targets', () => {
				const targets = [
					{ x: 50, y: 50 },
					{ x: 100, y: 100 },
					{ x: 150, y: 150 },
				];

				spellEffects.chainLightning(targets);

				// Should have 2 lightning bolts (3 targets = 2 chains)
				const delayedCalls = (mockScene.time.delayedCall as jest.Mock).mock.calls;
				expect(delayedCalls.length).toBeGreaterThanOrEqual(2);
			});

			it('should delay each chain link by 100ms', () => {
				const targets = [
					{ x: 50, y: 50 },
					{ x: 100, y: 100 },
					{ x: 150, y: 150 },
				];

				spellEffects.chainLightning(targets);

				expect(mockScene.time.delayedCall).toHaveBeenCalledWith(0, expect.any(Function));
				expect(mockScene.time.delayedCall).toHaveBeenCalledWith(100, expect.any(Function));
			});
		});

		describe('staticField()', () => {
			it('should create static field particle emitter', () => {
				spellEffects.staticField(160, 220);

				expect(mockScene.add.particles).toHaveBeenCalled();
			});

			it('should create circular emit zone', () => {
				spellEffects.staticField(160, 220, 80);

				const particleConfig = (mockScene.add.particles as jest.Mock).mock.calls[0][3];
				expect(particleConfig.emitZone).toBeDefined();
				expect(particleConfig.emitZone.source.radius).toBe(80);
			});

			it('should return the particle emitter', () => {
				const result = spellEffects.staticField(160, 220);

				expect(result).toBe(mockParticleEmitter);
			});

			it('should stop emitter after default duration of 2000ms', () => {
				spellEffects.staticField(160, 220);

				expect(mockScene.time.delayedCall).toHaveBeenCalledWith(2000, expect.any(Function));
			});

			it('should stop emitter after custom duration', () => {
				spellEffects.staticField(160, 220, 60, 3000);

				expect(mockScene.time.delayedCall).toHaveBeenCalledWith(3000, expect.any(Function));
			});
		});
	});

	describe('Holy/Healing Magic', () => {
		describe('heal()', () => {
			it('should create heal particle explosion', () => {
				spellEffects.heal(170, 230);

				expect(mockScene.add.particles).toHaveBeenCalledWith(170, 230, 'flares', expect.any(Object));
			});

			it('should explode with default count of 25', () => {
				spellEffects.heal(170, 230);

				expect(mockParticleEmitter.explode).toHaveBeenCalledWith(25, 170, 230);
			});

			it('should explode with custom count', () => {
				spellEffects.heal(170, 230, 40);

				expect(mockParticleEmitter.explode).toHaveBeenCalledWith(40, 170, 230);
			});

			it('should destroy emitter after 1300ms', () => {
				spellEffects.heal(170, 230);

				expect(mockScene.time.delayedCall).toHaveBeenCalledWith(1300, expect.any(Function));
			});
		});

		describe('divineShield()', () => {
			it('should create divine shield particle emitter', () => {
				spellEffects.divineShield(180, 240);

				expect(mockScene.add.particles).toHaveBeenCalled();
			});

			it('should create circular edge emit zone', () => {
				spellEffects.divineShield(180, 240, 60);

				const particleConfig = (mockScene.add.particles as jest.Mock).mock.calls[0][3];
				expect(particleConfig.emitZone).toBeDefined();
				expect(particleConfig.emitZone.type).toBe('edge');
				expect(particleConfig.emitZone.source.radius).toBe(60);
			});

			it('should return the particle emitter', () => {
				const result = spellEffects.divineShield(180, 240);

				expect(result).toBe(mockParticleEmitter);
			});

			it('should stop emitter after default duration of 5000ms', () => {
				spellEffects.divineShield(180, 240);

				expect(mockScene.time.delayedCall).toHaveBeenCalledWith(5000, expect.any(Function));
			});

			it('should stop emitter after custom duration', () => {
				spellEffects.divineShield(180, 240, 50, 8000);

				expect(mockScene.time.delayedCall).toHaveBeenCalledWith(8000, expect.any(Function));
			});
		});

		describe('resurrection()', () => {
			it('should create resurrection particle explosion', () => {
				spellEffects.resurrection(190, 250);

				expect(mockScene.add.particles).toHaveBeenCalled();
			});

			it('should explode with default count of 60', () => {
				spellEffects.resurrection(190, 250);

				expect(mockParticleEmitter.explode).toHaveBeenCalledWith(60, 190, 250);
			});

			it('should explode with custom count', () => {
				spellEffects.resurrection(190, 250, 80);

				expect(mockParticleEmitter.explode).toHaveBeenCalledWith(80, 190, 250);
			});

			it('should create bright flash effect', () => {
				spellEffects.resurrection(190, 250);

				expect(mockScene.add.graphics).toHaveBeenCalled();
				expect(mockGraphics.fillStyle).toHaveBeenCalledWith(0xffffff, 1);
				expect(mockGraphics.fillCircle).toHaveBeenCalledWith(190, 250, 100);
			});

			it('should fade out flash', () => {
				spellEffects.resurrection(190, 250);

				expect(mockScene.tweens.add).toHaveBeenCalledWith(
					expect.objectContaining({
						targets: mockGraphics,
						alpha: 0,
						duration: 300,
					})
				);
			});

			it('should destroy emitter after 1600ms', () => {
				spellEffects.resurrection(190, 250);

				const delayedCalls = (mockScene.time.delayedCall as jest.Mock).mock.calls;
				const emitterCall = delayedCalls.find((call) => call[0] === 1600);

				expect(emitterCall).toBeDefined();
			});
		});
	});

	describe('Poison/Dark Magic', () => {
		describe('poisonCloud()', () => {
			it('should create poison cloud particle emitter', () => {
				spellEffects.poisonCloud(200, 260);

				expect(mockScene.add.particles).toHaveBeenCalled();
			});

			it('should create circular emit zone', () => {
				spellEffects.poisonCloud(200, 260, 90);

				const particleConfig = (mockScene.add.particles as jest.Mock).mock.calls[0][3];
				expect(particleConfig.emitZone).toBeDefined();
				expect(particleConfig.emitZone.source.radius).toBe(90);
			});

			it('should return the particle emitter', () => {
				const result = spellEffects.poisonCloud(200, 260);

				expect(result).toBe(mockParticleEmitter);
			});

			it('should stop emitter after default duration of 4000ms', () => {
				spellEffects.poisonCloud(200, 260);

				expect(mockScene.time.delayedCall).toHaveBeenCalledWith(4000, expect.any(Function));
			});

			it('should stop emitter after custom duration', () => {
				spellEffects.poisonCloud(200, 260, 80, 6000);

				expect(mockScene.time.delayedCall).toHaveBeenCalledWith(6000, expect.any(Function));
			});
		});

		describe('shadowBolt()', () => {
			it('should create shadow bolt emitter', () => {
				spellEffects.shadowBolt(60, 70, 160, 170);

				expect(mockScene.add.particles).toHaveBeenCalledWith(60, 70, 'flares', expect.any(Object));
			});

			it('should tween emitter to target', () => {
				spellEffects.shadowBolt(60, 70, 180, 190);

				expect(mockScene.tweens.add).toHaveBeenCalledWith(
					expect.objectContaining({
						targets: mockParticleEmitter,
						x: 180,
						y: 190,
						duration: 500,
					})
				);
			});

			it('should explode at target on completion', () => {
				spellEffects.shadowBolt(60, 70, 180, 190);

				const tweenConfig = (mockScene.tweens.add as jest.Mock).mock.calls[0][0];
				tweenConfig.onComplete();

				expect(mockParticleEmitter.explode).toHaveBeenCalledWith(15, 180, 190);
			});
		});

		describe('curse()', () => {
			it('should create curse particle emitter', () => {
				spellEffects.curse(210, 270);

				expect(mockScene.add.particles).toHaveBeenCalledWith(210, 270, 'flares', expect.any(Object));
			});

			it('should return the particle emitter', () => {
				const result = spellEffects.curse(210, 270);

				expect(result).toBe(mockParticleEmitter);
			});

			it('should stop emitter after default duration of 3000ms', () => {
				spellEffects.curse(210, 270);

				expect(mockScene.time.delayedCall).toHaveBeenCalledWith(3000, expect.any(Function));
			});

			it('should stop emitter after custom duration', () => {
				spellEffects.curse(210, 270, 5000);

				expect(mockScene.time.delayedCall).toHaveBeenCalledWith(5000, expect.any(Function));
			});
		});
	});

	describe('Utility Methods', () => {
		describe('updateEmitterPosition()', () => {
			it('should update emitter position', () => {
				spellEffects.updateEmitterPosition(mockParticleEmitter, 300, 400);

				expect(mockParticleEmitter.setPosition).toHaveBeenCalledWith(300, 400);
			});

			it('should handle multiple position updates', () => {
				spellEffects.updateEmitterPosition(mockParticleEmitter, 100, 200);
				spellEffects.updateEmitterPosition(mockParticleEmitter, 300, 400);

				expect(mockParticleEmitter.setPosition).toHaveBeenCalledTimes(2);
				expect(mockParticleEmitter.setPosition).toHaveBeenLastCalledWith(300, 400);
			});
		});

		describe('destroy()', () => {
			it('should exist as a method', () => {
				expect(spellEffects.destroy).toBeDefined();
				expect(typeof spellEffects.destroy).toBe('function');
			});

			it('should not throw when called', () => {
				expect(() => {
					spellEffects.destroy();
				}).not.toThrow();
			});
		});
	});

	describe('Integration', () => {
		it('should handle complete spell combat sequence', () => {
			// Fire spell
			spellEffects.fireball(100, 100);
			expect(mockParticleEmitter.explode).toHaveBeenCalled();

			jest.clearAllMocks();

			// Ice spell
			spellEffects.frostNova(150, 150);
			expect(mockParticleEmitter.explode).toHaveBeenCalled();
			expect(mockScene.add.graphics).toHaveBeenCalled();

			jest.clearAllMocks();

			// Lightning spell
			spellEffects.lightningBolt(50, 50, 150, 150);
			expect(mockScene.add.particles).toHaveBeenCalled();
			expect(mockGraphics.lineBetween).toHaveBeenCalled();
		});

		it('should handle duration-based spells', () => {
			// Create multiple duration-based effects
			const shield = spellEffects.divineShield(100, 100);
			const poison = spellEffects.poisonCloud(200, 200);
			const staticField = spellEffects.staticField(300, 300);

			expect(shield).toBe(mockParticleEmitter);
			expect(poison).toBeDefined();
			expect(staticField).toBeDefined();
		});
	});

	describe('Edge Cases', () => {
		it('should handle zero particle count', () => {
			spellEffects.fireball(100, 100, 0);

			expect(mockParticleEmitter.explode).toHaveBeenCalledWith(0, 100, 100);
		});

		it('should handle very large particle counts', () => {
			spellEffects.resurrection(100, 100, 500);

			expect(mockParticleEmitter.explode).toHaveBeenCalledWith(500, 100, 100);
		});

		it('should handle negative coordinates', () => {
			spellEffects.fireball(-50, -100);

			expect(mockScene.add.particles).toHaveBeenCalledWith(-50, -100, 'flares', expect.any(Object));
		});

		it('should handle zero radius for area effects', () => {
			spellEffects.frostNova(100, 100, 0);

			expect(mockScene.add.graphics).toHaveBeenCalled();
		});

		it('should handle very short durations', () => {
			spellEffects.staticField(100, 100, 60, 100);

			expect(mockScene.time.delayedCall).toHaveBeenCalledWith(100, expect.any(Function));
		});

		it('should handle zero direction angle', () => {
			spellEffects.flameWave(100, 100, 0);

			const particleConfig = (mockScene.add.particles as jest.Mock).mock.calls[0][3];
			expect(particleConfig.angle.min).toBe(-30);
			expect(particleConfig.angle.max).toBe(30);
		});

		it('should handle same source and target for lightning', () => {
			spellEffects.lightningBolt(100, 100, 100, 100); // Distance = 0

			expect(mockParticleEmitter.explode).toHaveBeenCalledWith(0, 100, 100);
		});
	});

	describe('Callback Execution (Cleanup)', () => {
		it('should destroy fireball emitter when cleanup callback is executed', () => {
			spellEffects.fireball(100, 100);

			// Find and execute the cleanup callback
			const delayedCalls = (mockScene.time.delayedCall as jest.Mock).mock.calls;
			const cleanupCall = delayedCalls[delayedCalls.length - 1];
			cleanupCall[1](); // Execute callback

			expect(mockParticleEmitter.destroy).toHaveBeenCalled();
		});

		it('should destroy fire trail emitter after stop callback', () => {
			spellEffects.fireTrail(50, 50, 150, 150);

			// Get the onComplete from tween
			const tweenConfig = (mockScene.tweens.add as jest.Mock).mock.calls[0][0];
			tweenConfig.onComplete(); // Execute onComplete

			// Execute the delayed cleanup callback
			const delayedCalls = (mockScene.time.delayedCall as jest.Mock).mock.calls;
			const cleanupCall = delayedCalls[delayedCalls.length - 1];
			cleanupCall[1](); // Execute callback

			expect(mockParticleEmitter.destroy).toHaveBeenCalled();
		});

		it('should destroy flameWave emitter when cleanup callback is executed', () => {
			spellEffects.flameWave(100, 150, 0);

			const delayedCalls = (mockScene.time.delayedCall as jest.Mock).mock.calls;
			const cleanupCall = delayedCalls[delayedCalls.length - 1];
			cleanupCall[1](); // Execute callback

			expect(mockParticleEmitter.destroy).toHaveBeenCalled();
		});

		it('should destroy iceShard emitter when cleanup callback is executed', () => {
			spellEffects.iceShard(120, 180);

			const delayedCalls = (mockScene.time.delayedCall as jest.Mock).mock.calls;
			const cleanupCall = delayedCalls[delayedCalls.length - 1];
			cleanupCall[1](); // Execute callback

			expect(mockParticleEmitter.destroy).toHaveBeenCalled();
		});

		it('should stop and destroy frozenGround emitter when cleanup callbacks are executed', () => {
			spellEffects.frozenGround(140, 200, 80, 3000);

			const delayedCalls = (mockScene.time.delayedCall as jest.Mock).mock.calls;
			// First callback stops emitter
			const stopCall = delayedCalls[0];
			stopCall[1](); // Execute stop callback

			expect(mockParticleEmitter.stop).toHaveBeenCalled();

			// Second callback destroys emitter
			const destroyCall = delayedCalls[1];
			destroyCall[1](); // Execute destroy callback

			expect(mockParticleEmitter.destroy).toHaveBeenCalled();
		});

		it('should destroy lightningBolt graphics and emitter when cleanup callbacks are executed', () => {
			spellEffects.lightningBolt(50, 50, 150, 150);

			const delayedCalls = (mockScene.time.delayedCall as jest.Mock).mock.calls;

			// Find graphics cleanup (100ms)
			const graphicsCall = delayedCalls.find((call) => call[0] === 100);
			graphicsCall[1](); // Execute callback
			expect(mockGraphics.destroy).toHaveBeenCalled();

			// Find emitter cleanup (400ms)
			const emitterCall = delayedCalls.find((call) => call[0] === 400);
			emitterCall[1](); // Execute callback
			expect(mockParticleEmitter.destroy).toHaveBeenCalled();
		});

		it('should execute chainLightning callbacks', () => {
			const targets = [
				{ x: 50, y: 50 },
				{ x: 100, y: 100 },
				{ x: 150, y: 150 },
			];

			spellEffects.chainLightning(targets);

			const delayedCalls = (mockScene.time.delayedCall as jest.Mock).mock.calls;
			// Execute the chain link callbacks
			delayedCalls.forEach((call) => {
				call[1](); // Execute each callback
			});

			// Should have created particles for each chain link
			expect(mockScene.add.particles).toHaveBeenCalled();
		});

		it('should stop and destroy staticField emitter when cleanup callbacks are executed', () => {
			spellEffects.staticField(160, 220, 60, 2000);

			const delayedCalls = (mockScene.time.delayedCall as jest.Mock).mock.calls;
			// First callback stops emitter
			const stopCall = delayedCalls[0];
			stopCall[1](); // Execute stop callback

			expect(mockParticleEmitter.stop).toHaveBeenCalled();

			// Second callback destroys emitter
			const destroyCall = delayedCalls[1];
			destroyCall[1](); // Execute destroy callback

			expect(mockParticleEmitter.destroy).toHaveBeenCalled();
		});

		it('should destroy heal emitter when cleanup callback is executed', () => {
			spellEffects.heal(170, 230);

			const delayedCalls = (mockScene.time.delayedCall as jest.Mock).mock.calls;
			const cleanupCall = delayedCalls[delayedCalls.length - 1];
			cleanupCall[1](); // Execute callback

			expect(mockParticleEmitter.destroy).toHaveBeenCalled();
		});

		it('should stop and destroy divineShield emitter when cleanup callbacks are executed', () => {
			spellEffects.divineShield(180, 240, 50, 5000);

			const delayedCalls = (mockScene.time.delayedCall as jest.Mock).mock.calls;
			// First callback stops emitter
			const stopCall = delayedCalls[0];
			stopCall[1](); // Execute stop callback

			expect(mockParticleEmitter.stop).toHaveBeenCalled();

			// Second callback destroys emitter
			const destroyCall = delayedCalls[1];
			destroyCall[1](); // Execute destroy callback

			expect(mockParticleEmitter.destroy).toHaveBeenCalled();
		});

		it('should destroy resurrection emitter when cleanup callback is executed', () => {
			spellEffects.resurrection(190, 250);

			const delayedCalls = (mockScene.time.delayedCall as jest.Mock).mock.calls;
			// Find the resurrection cleanup (1600ms)
			const cleanupCall = delayedCalls.find((call) => call[0] === 1600);
			cleanupCall[1](); // Execute callback

			expect(mockParticleEmitter.destroy).toHaveBeenCalled();
		});

		it('should destroy resurrection flash when tween completes', () => {
			spellEffects.resurrection(190, 250);

			// Get the onComplete from flash tween
			const tweenConfig = (mockScene.tweens.add as jest.Mock).mock.calls[0][0];
			tweenConfig.onComplete(); // Execute onComplete

			expect(mockGraphics.destroy).toHaveBeenCalled();
		});

		it('should stop and destroy poisonCloud emitter when cleanup callbacks are executed', () => {
			spellEffects.poisonCloud(200, 260, 80, 4000);

			const delayedCalls = (mockScene.time.delayedCall as jest.Mock).mock.calls;
			// First callback stops emitter
			const stopCall = delayedCalls[0];
			stopCall[1](); // Execute stop callback

			expect(mockParticleEmitter.stop).toHaveBeenCalled();

			// Second callback destroys emitter
			const destroyCall = delayedCalls[1];
			destroyCall[1](); // Execute destroy callback

			expect(mockParticleEmitter.destroy).toHaveBeenCalled();
		});

		it('should destroy shadowBolt emitter after explosion callback is executed', () => {
			spellEffects.shadowBolt(60, 70, 160, 170);

			// Get the onComplete from tween
			const tweenConfig = (mockScene.tweens.add as jest.Mock).mock.calls[0][0];
			tweenConfig.onComplete(); // Execute onComplete - this explodes

			expect(mockParticleEmitter.explode).toHaveBeenCalled();

			// Execute the delayed cleanup callback
			const delayedCalls = (mockScene.time.delayedCall as jest.Mock).mock.calls;
			const cleanupCall = delayedCalls[delayedCalls.length - 1];
			cleanupCall[1](); // Execute callback

			expect(mockParticleEmitter.destroy).toHaveBeenCalled();
		});

		it('should stop and destroy curse emitter when cleanup callbacks are executed', () => {
			spellEffects.curse(210, 270, 3000);

			const delayedCalls = (mockScene.time.delayedCall as jest.Mock).mock.calls;
			// First callback stops emitter
			const stopCall = delayedCalls[0];
			stopCall[1](); // Execute stop callback

			expect(mockParticleEmitter.stop).toHaveBeenCalled();

			// Second callback destroys emitter
			const destroyCall = delayedCalls[1];
			destroyCall[1](); // Execute destroy callback

			expect(mockParticleEmitter.destroy).toHaveBeenCalled();
		});
	});
});
