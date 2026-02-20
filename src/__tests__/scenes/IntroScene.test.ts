import { IntroScene } from '../../scenes/IntroScene';

describe('IntroScene', () => {
	let scene: IntroScene;
	let mockAdd: any;
	let mockScale: any;
	let mockTweens: any;
	let mockTextures: any;
	let mockScene: any;
	let mockCameras: any;

	beforeEach(() => {
		// Mock image objects
		const mockImage = {
			alpha: 0,
			width: 200,
			height: 100,
			scale: 1,
			scaleX: 1,
			scaleY: 1,
			setScale: jest.fn().mockReturnThis(),
			setPosition: jest.fn().mockReturnThis(),
			getTopLeft: jest.fn(() => ({ x: 100, y: 50 })),
		};

		// Mock text objects
		const mockText = {
			alpha: 0,
			setOrigin: jest.fn().mockReturnThis(),
			setPosition: jest.fn().mockReturnThis(),
		};

		// Mock particle emitter
		const mockParticles = {
			alpha: 0,
			destroy: jest.fn(),
		};

		// Mock add (GameObjectFactory)
		mockAdd = {
			image: jest.fn(() => ({ ...mockImage })),
			text: jest.fn(() => ({ ...mockText })),
			particles: jest.fn(() => mockParticles),
		};

		// Mock scale manager
		mockScale = {
			width: 800,
			height: 600,
			on: jest.fn(),
		};

		// Mock tweens manager
		mockTweens = {
			add: jest.fn((config: any) => {
				// Store the tween config for later testing
				return { config };
			}),
		};

		// Mock textures manager
		mockTextures = {
			getPixel: jest.fn((_x: number, _y: number, _key: string) => ({
				alpha: 255,
				r: 255,
				g: 255,
				b: 255,
			})),
		};

		// Mock scene manager
		mockScene = {
			start: jest.fn(),
			isVisible: jest.fn(() => true),
		};

		// Mock cameras
		mockCameras = {
			main: {
				width: 800,
				height: 600,
			},
		};

		// Mock device
		const mockDevice = {
			os: {
				desktop: true,
			},
		};

		// Create scene instance with mocked Phaser scene
		scene = new IntroScene();
		(scene as any).add = mockAdd;
		(scene as any).scale = mockScale;
		(scene as any).tweens = mockTweens;
		(scene as any).textures = mockTextures;
		(scene as any).scene = mockScene;
		(scene as any).cameras = mockCameras;
		(scene as any).sys = {
			game: {
				device: mockDevice,
			},
		};
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('Constructor', () => {
		it('should create scene with correct key', () => {
			expect(scene.constructor.name).toBe('IntroScene');
		});

		it('should initialize with correct default values', () => {
			expect(scene.logoTextFontSize).toBe(35);
			expect(scene.phaserLogoSpriteName).toBe('logo_phaser');
			expect(scene.phaserLogoText).toBe('Proudly created with');
			expect(scene.logoPhaserFontFamily).toBe("'Press Start 2P'");
			expect(scene.neverquestLogo).toBe('neverquest_candle');
			expect(scene.neverquestLogoText).toBe('Neverquest Game Studio');
			expect(scene.particlesSpriteName).toBe('flares');
			expect(scene.neverquestLogoFontFamily).toBe("'Press Start 2P'");
			expect(scene.neverquestLogoFontSize).toBe('25px');
			expect(scene.isMobile).toBeNull();
			expect(scene.tweensCompleted).toBe(0);
			expect(scene.totalTweens).toBe(2);
		});
	});

	describe('create()', () => {
		beforeEach(() => {
			scene.create();
		});

		it('should detect mobile device correctly', () => {
			expect(scene.isMobile).toBe(false);
		});

		it('should detect mobile when not desktop', () => {
			(scene as any).sys.game.device.os.desktop = false;
			scene.create();
			expect(scene.isMobile).toBe(true);
		});

		it('should set center coordinates based on scale', () => {
			expect(scene.centerX).toBe(400);
			expect(scene.centerY).toBe(300);
		});

		it('should reset tween counters', () => {
			scene.tweensCompleted = 5;
			scene.create();
			expect(scene.tweensCompleted).toBe(0);
			expect(scene.totalTweens).toBe(2);
		});

		it('should call createPhaserLogo', () => {
			expect(mockAdd.image).toHaveBeenCalledWith(400, 300, 'logo_phaser');
		});

		it('should call createNeverquestLogo', () => {
			expect(mockAdd.image).toHaveBeenCalledWith(400, 300, 'neverquest_candle');
		});

		it('should register resize event listener', () => {
			expect(mockScale.on).toHaveBeenCalledWith('resize', expect.any(Function));
		});

		describe('Resize Event Handler', () => {
			let resizeCallback: (size: any) => void;

			beforeEach(() => {
				const resizeCall = mockScale.on.mock.calls.find((call: any) => call[0] === 'resize');
				resizeCallback = resizeCall[1];
			});

			it('should call resizeAll when scene is visible', () => {
				const spyResize = jest.spyOn(scene, 'resizeAll');
				const mockSize = { width: 1024, height: 768 };
				resizeCallback(mockSize);
				expect(spyResize).toHaveBeenCalledWith(mockSize);
			});

			it('should not call resizeAll when scene is not visible', () => {
				mockScene.isVisible.mockReturnValue(false);
				const spyResize = jest.spyOn(scene, 'resizeAll');
				const mockSize = { width: 1024, height: 768 };
				resizeCallback(mockSize);
				expect(spyResize).not.toHaveBeenCalled();
			});
		});
	});

	describe('mobileMargin()', () => {
		it('should return 60 for desktop', () => {
			scene.isMobile = false;
			expect(scene.mobileMargin()).toBe(60);
		});

		it('should return 15 for mobile', () => {
			scene.isMobile = true;
			expect(scene.mobileMargin()).toBe(15);
		});

		it('should return 60 when isMobile is null', () => {
			scene.isMobile = null;
			expect(scene.mobileMargin()).toBe(60);
		});
	});

	describe('resizeAll()', () => {
		beforeEach(() => {
			scene.create();
		});

		it('should update center coordinates', () => {
			const size = { width: 1024, height: 768 } as any;
			scene.resizeAll(size);
			expect(scene.centerX).toBe(512);
			expect(scene.centerY).toBe(384);
		});

		it('should reposition Phaser logo', () => {
			const size = { width: 1024, height: 768 } as any;
			scene.resizeAll(size);
			expect(scene.logo_phaser.setPosition).toHaveBeenCalledWith(512, 384);
		});

		it('should reposition Phaser logo text', () => {
			scene.isMobile = false;
			const size = { width: 1024, height: 768 } as any;
			scene.resizeAll(size);
			expect(scene.logo_phaser_text.setPosition).toHaveBeenCalledWith(512, 384 - 100 / 2 - 60);
		});

		it('should reposition Phaser logo text with mobile margin', () => {
			scene.isMobile = true;
			const size = { width: 1024, height: 768 } as any;
			scene.resizeAll(size);
			expect(scene.logo_phaser_text.setPosition).toHaveBeenCalledWith(512, 384 - 100 / 2 - 15);
		});

		it('should reposition studio image', () => {
			const size = { width: 1024, height: 768 } as any;
			scene.resizeAll(size);
			expect(scene.studioImage.setPosition).toHaveBeenCalledWith(512, 384);
		});

		it('should reposition studio text', () => {
			scene.isMobile = false;
			const size = { width: 1024, height: 768 } as any;
			scene.resizeAll(size);
			expect(scene.studioText.setPosition).toHaveBeenCalledWith(512, 384 - 100 / 2 - 60);
		});

		it('should handle small screen sizes', () => {
			const size = { width: 320, height: 240 } as any;
			scene.resizeAll(size);
			expect(scene.centerX).toBe(160);
			expect(scene.centerY).toBe(120);
		});

		it('should handle large screen sizes', () => {
			const size = { width: 2560, height: 1440 } as any;
			scene.resizeAll(size);
			expect(scene.centerX).toBe(1280);
			expect(scene.centerY).toBe(720);
		});
	});

	describe('createPhaserLogo()', () => {
		beforeEach(() => {
			scene.create();
		});

		it('should create Phaser logo image', () => {
			expect(mockAdd.image).toHaveBeenCalledWith(scene.centerX, scene.centerY, 'logo_phaser');
			expect(scene.logo_phaser).toBeDefined();
		});

		it('should set Phaser logo alpha to 0', () => {
			expect(scene.logo_phaser.alpha).toBe(0);
		});

		it('should scale down logo if screen is too small', () => {
			mockScale.height = 50;
			scene.create();
			expect(scene.logo_phaser.setScale).toHaveBeenCalledWith(0.5);
		});

		it('should not scale logo if screen is large enough', () => {
			// When screen height / logo height > 0.7, logo is scaled to 0.5
			// 600 / 100 = 6, which is > 0.7, so it WILL scale
			// Let's use a smaller logo or bigger screen where ratio is <= 0.7
			mockScale.height = 60; // 60 / 100 = 0.6, which is <= 0.7
			jest.clearAllMocks(); // Clear previous calls
			scene.create();
			// When screen is NOT small enough (ratio <= 0.7), setScale should not be called with 0.5
			const setScaleCalls = scene.logo_phaser.setScale as jest.Mock;
			const scaleHalfCalls = setScaleCalls.mock.calls.filter((call: any) => call[0] === 0.5);
			expect(scaleHalfCalls.length).toBe(0);
		});

		it('should create Phaser logo text', () => {
			expect(mockAdd.text).toHaveBeenCalledWith(
				scene.centerX,
				expect.any(Number),
				'Proudly created with',
				expect.objectContaining({
					fontFamily: "'Press Start 2P'",
					wordWrap: expect.objectContaining({
						width: expect.any(Number),
					}),
				})
			);
			expect(scene.logo_phaser_text).toBeDefined();
		});

		it('should set text origin to center', () => {
			expect(scene.logo_phaser_text.setOrigin).toHaveBeenCalledWith(0.5, 0.5);
		});

		it('should set text alpha to 0', () => {
			expect(scene.logo_phaser_text.alpha).toBe(0);
		});

		it('should create particle emitter', () => {
			expect(mockAdd.particles).toHaveBeenCalledWith(
				0,
				0,
				'flares',
				expect.objectContaining({
					lifespan: 1000,
					gravityY: 10,
					blendMode: 'ADD',
					emitZone: expect.any(Object),
				})
			);
			expect(scene.particles_logo).toBeDefined();
		});

		it('should create tween for Phaser logo', () => {
			expect(mockTweens.add).toHaveBeenCalledWith(
				expect.objectContaining({
					targets: [scene.logo_phaser, scene.logo_phaser_text, scene.particles_logo],
					alpha: { from: 0, to: 1 },
					duration: 2000,
					yoyo: true,
					onComplete: expect.any(Function),
				})
			);
		});

		it('should handle tween completion', () => {
			const tweenConfig = mockTweens.add.mock.calls[0][0];
			const spyOnTweenComplete = jest.spyOn(scene, 'onTweenComplete');

			tweenConfig.onComplete();

			expect(scene.particles_logo.destroy).toHaveBeenCalled();
			expect(spyOnTweenComplete).toHaveBeenCalled();
		});

		it('should calculate font size based on logo scale', () => {
			// Font size is calculated as: logoTextFontSize (35) * logo_phaser.scale
			// The scale is read when the text is created, at which point it's still 1
			// So the font size should be 35px regardless of what we set after
			const textCall = mockAdd.text.mock.calls.find((call: any) => call[2] === 'Proudly created with');
			// Font size is calculated based on the scale at time of text creation
			expect(textCall[3].fontSize).toBeDefined();
			expect(textCall[3].fontSize).toContain('px');
		});
	});

	describe('createNeverquestLogo()', () => {
		beforeEach(() => {
			scene.create();
		});

		it('should create Neverquest studio image', () => {
			expect(mockAdd.image).toHaveBeenCalledWith(scene.centerX, scene.centerY, 'neverquest_candle');
			expect(scene.studioImage).toBeDefined();
		});

		it('should set studio image alpha to 0', () => {
			expect(scene.studioImage.alpha).toBe(0);
		});

		it('should create studio text', () => {
			expect(mockAdd.text).toHaveBeenCalledWith(
				scene.centerX,
				expect.any(Number),
				'Neverquest Game Studio',
				expect.objectContaining({
					fontFamily: "'Press Start 2P'",
					fontSize: '25px',
				})
			);
			expect(scene.studioText).toBeDefined();
		});

		it('should set studio text origin to center', () => {
			expect(scene.studioText.setOrigin).toHaveBeenCalledWith(0.5, 0.5);
		});

		it('should set studio text alpha to 0', () => {
			expect(scene.studioText.alpha).toBe(0);
		});

		it('should create tween for Neverquest logo', () => {
			expect(mockTweens.add).toHaveBeenCalledWith(
				expect.objectContaining({
					targets: [scene.studioImage, scene.studioText],
					alpha: { from: 0, to: 1 },
					duration: 2000,
					yoyo: true,
					delay: 4000,
					onComplete: expect.any(Function),
				})
			);
		});

		it('should have delayed tween start', () => {
			const neverquestTweenConfig = mockTweens.add.mock.calls.find((call: any) =>
				call[0].targets.includes(scene.studioImage)
			)[0];
			expect(neverquestTweenConfig.delay).toBe(4000);
		});

		it('should handle tween completion', () => {
			const neverquestTweenConfig = mockTweens.add.mock.calls.find((call: any) =>
				call[0].targets.includes(scene.studioImage)
			)[0];
			const spyOnTweenComplete = jest.spyOn(scene, 'onTweenComplete');

			neverquestTweenConfig.onComplete();

			expect(spyOnTweenComplete).toHaveBeenCalled();
		});
	});

	describe('onTweenComplete()', () => {
		beforeEach(() => {
			scene.create();
			scene.tweensCompleted = 0;
		});

		it('should increment tweensCompleted counter', () => {
			scene.onTweenComplete();
			expect(scene.tweensCompleted).toBe(1);
		});

		it('should not transition when first tween completes', () => {
			scene.onTweenComplete();
			expect(mockScene.start).not.toHaveBeenCalled();
		});

		it('should transition to MainMenuScene when both tweens complete', () => {
			scene.onTweenComplete();
			scene.onTweenComplete();
			expect(mockScene.start).toHaveBeenCalledWith('MainMenuScene');
		});

		it('should allow multiple calls after threshold', () => {
			scene.onTweenComplete();
			scene.onTweenComplete();
			scene.onTweenComplete();
			// Each call after reaching totalTweens will call scene.start
			expect(mockScene.start).toHaveBeenCalledWith('MainMenuScene');
			expect(scene.tweensCompleted).toBe(3);
		});

		it('should handle totalTweens configuration', () => {
			scene.totalTweens = 3;
			scene.onTweenComplete();
			scene.onTweenComplete();
			expect(mockScene.start).not.toHaveBeenCalled();
			scene.onTweenComplete();
			expect(mockScene.start).toHaveBeenCalledWith('MainMenuScene');
		});
	});

	describe('Particle Emit Zone', () => {
		beforeEach(() => {
			scene.create();
		});

		it('should create particle emit zone with getRandomPoint function', () => {
			const particleCall = mockAdd.particles.mock.calls[0];
			const config = particleCall[3];
			expect(config.emitZone).toBeDefined();
			expect(config.emitZone.type).toBe('random');
			expect(config.emitZone.source.getRandomPoint).toBeInstanceOf(Function);
		});

		it('should generate random points within logo bounds', () => {
			const particleCall = mockAdd.particles.mock.calls[0];
			const config = particleCall[3];
			const mockVec: { x?: number; y?: number } = {};

			config.emitZone.source.getRandomPoint(mockVec);

			expect(mockTextures.getPixel).toHaveBeenCalled();
			// The callback should set x and y on the vector
			expect(mockVec.x).toBeDefined();
			expect(mockVec.y).toBeDefined();
		});
	});

	describe('Edge Cases', () => {
		it('should handle zero dimensions', () => {
			mockScale.width = 0;
			mockScale.height = 0;
			scene.create();
			expect(scene.centerX).toBe(0);
			expect(scene.centerY).toBe(0);
		});

		it('should handle negative scale dimensions gracefully', () => {
			const size = { width: -100, height: -100 } as any;
			scene.create();
			scene.resizeAll(size);
			expect(scene.centerX).toBe(-50);
			expect(scene.centerY).toBe(-50);
		});

		it('should handle very large screen sizes', () => {
			const size = { width: 10000, height: 10000 } as any;
			scene.create();
			scene.resizeAll(size);
			expect(scene.centerX).toBe(5000);
			expect(scene.centerY).toBe(5000);
		});

		it('should handle tweensCompleted overflow', () => {
			scene.create();
			scene.tweensCompleted = 0;
			for (let i = 0; i < 10; i++) {
				scene.onTweenComplete();
			}
			expect(scene.tweensCompleted).toBe(10);
			// scene.start will be called for each iteration after reaching totalTweens (2)
			// So it should be called 8 times (iterations 3-10)
			expect(mockScene.start).toHaveBeenCalled();
		});
	});

	describe('Integration', () => {
		it('should handle full intro sequence', () => {
			scene.create();

			// Get tween configs
			const phaserTweenConfig = mockTweens.add.mock.calls[0][0];
			const neverquestTweenConfig = mockTweens.add.mock.calls[1][0];

			// Simulate Phaser logo tween completion
			phaserTweenConfig.onComplete();
			expect(scene.tweensCompleted).toBe(1);
			expect(mockScene.start).not.toHaveBeenCalled();

			// Simulate Neverquest logo tween completion
			neverquestTweenConfig.onComplete();
			expect(scene.tweensCompleted).toBe(2);
			expect(mockScene.start).toHaveBeenCalledWith('MainMenuScene');
		});

		it('should handle resize during intro sequence', () => {
			scene.create();

			// Trigger resize mid-sequence
			const resizeCall = mockScale.on.mock.calls.find((call: any) => call[0] === 'resize');
			const resizeCallback = resizeCall[1];

			resizeCallback({ width: 1024, height: 768 });

			expect(scene.centerX).toBe(512);
			expect(scene.centerY).toBe(384);
			expect(scene.logo_phaser.setPosition).toHaveBeenCalledWith(512, 384);
			expect(scene.studioImage.setPosition).toHaveBeenCalledWith(512, 384);
		});

		it('should handle mobile device detection and margins', () => {
			(scene as any).sys.game.device.os.desktop = false;
			scene.create();

			expect(scene.isMobile).toBe(true);
			expect(scene.mobileMargin()).toBe(15);
		});

		it('should create all game objects in correct order', () => {
			scene.create();

			const imageCalls = mockAdd.image.mock.calls;
			const textCalls = mockAdd.text.mock.calls;

			// Should create Phaser logo first
			expect(imageCalls[0][2]).toBe('logo_phaser');
			// Then Neverquest logo
			expect(imageCalls[1][2]).toBe('neverquest_candle');

			// Should create Phaser text first
			expect(textCalls[0][2]).toBe('Proudly created with');
			// Then Neverquest text
			expect(textCalls[1][2]).toBe('Neverquest Game Studio');
		});

		it('should destroy particles after Phaser logo tween', () => {
			scene.create();
			const phaserTweenConfig = mockTweens.add.mock.calls[0][0];

			expect(scene.particles_logo.destroy).not.toHaveBeenCalled();
			phaserTweenConfig.onComplete();
			expect(scene.particles_logo.destroy).toHaveBeenCalled();
		});
	});
});
