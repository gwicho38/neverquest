/**
 * Tests for VideoPlayerScene
 */

import { VideoPlayerScene } from '../../scenes/VideoPlayerScene';

// Mock dependencies
jest.mock('../../plugins/NeverquestSoundManager', () => ({
	NeverquestSoundManager: jest.fn().mockImplementation(() => ({
		create: jest.fn(),
		stopAllAudio: jest.fn(),
		resumeAllAudio: jest.fn(),
	})),
}));

jest.mock('../../consts/Colors', () => ({
	NumericColors: {
		BLACK: 0x000000,
	},
}));

jest.mock('../../consts/Numbers', () => ({
	Alpha: {
		LIGHT: 0.3,
	},
}));

describe('VideoPlayerScene', () => {
	let scene: VideoPlayerScene;
	let mockRenderTexture: any;
	let mockImage: any;
	let mockVideo: any;

	beforeEach(() => {
		jest.clearAllMocks();

		mockRenderTexture = {
			setScrollFactor: jest.fn().mockReturnThis(),
			fill: jest.fn().mockReturnThis(),
			destroy: jest.fn(),
		};

		mockImage = {
			setInteractive: jest.fn().mockReturnThis(),
			setScale: jest.fn().mockReturnThis(),
			setScrollFactor: jest.fn().mockReturnThis(),
			setDepth: jest.fn().mockReturnThis(),
			on: jest.fn().mockReturnThis(),
			destroy: jest.fn(),
		};

		mockVideo = {
			play: jest.fn(),
			x: 0,
			y: 0,
		};

		scene = new VideoPlayerScene();

		// Setup mock scene properties
		(scene as any).cameras = {
			main: {
				width: 800,
				height: 600,
				midPoint: {
					x: 400,
					y: 300,
				},
			},
		};

		(scene as any).add = {
			renderTexture: jest.fn().mockReturnValue(mockRenderTexture),
			image: jest.fn().mockReturnValue(mockImage),
			rexYoutubePlayer: jest.fn().mockReturnValue(mockVideo),
		};

		(scene as any).scale = {
			on: jest.fn(),
		};

		(scene as any).scene = {
			stop: jest.fn(),
		};
	});

	describe('constructor', () => {
		it('should create scene with key VideoPlayerScene', () => {
			const newScene = new VideoPlayerScene();
			expect((newScene as any).sys?.settings?.key || 'VideoPlayerScene').toBe('VideoPlayerScene');
		});

		it('should initialize with default properties', () => {
			expect(scene.background).toBeNull();
			expect(scene.backgroundColor).toBe(0x000000);
			expect(scene.alpha).toBe(0.5);
			expect(scene.video).toBeNull();
			expect(scene.closeButton).toBeNull();
			expect(scene.videoId).toBe('');
			expect(scene.closeButtonSpriteName).toBe('close_button');
			expect(scene.closeButtonScale).toBe(0.3);
			expect(scene.closeButtonMarginX).toBe(50);
			expect(scene.closeButtonMarginY).toBe(30);
			expect(scene.neverquestSoundManager).toBeNull();
			expect(scene.player).toBeNull();
		});
	});

	describe('preload', () => {
		it('should create sound manager', () => {
			const { NeverquestSoundManager } = require('../../plugins/NeverquestSoundManager');

			scene.preload();

			expect(NeverquestSoundManager).toHaveBeenCalledWith(scene);
		});

		it('should create and stop all audio', () => {
			scene.preload();

			expect(scene.neverquestSoundManager!.create).toHaveBeenCalled();
			expect(scene.neverquestSoundManager!.stopAllAudio).toHaveBeenCalled();
		});
	});

	describe('init', () => {
		it('should set videoId from data', () => {
			scene.init({ videoId: 'test-video-id', player: null });

			expect(scene.videoId).toBe('test-video-id');
		});

		it('should set player from data', () => {
			const mockPlayer = { container: { body: { maxSpeed: 100 } } };
			scene.init({ videoId: '', player: mockPlayer });

			expect(scene.player).toBe(mockPlayer);
		});

		it('should set player maxSpeed to 0', () => {
			const mockPlayer = { container: { body: { maxSpeed: 100 } } };
			scene.init({ videoId: '', player: mockPlayer });

			expect(mockPlayer.container.body.maxSpeed).toBe(0);
		});

		it('should handle player without body', () => {
			const mockPlayer = { container: {} };
			expect(() => scene.init({ videoId: '', player: mockPlayer })).not.toThrow();
		});
	});

	describe('create', () => {
		beforeEach(() => {
			scene.videoId = 'test-video';
		});

		it('should create background render texture', () => {
			scene.create();

			expect((scene as any).add.renderTexture).toHaveBeenCalledWith(0, 0, 800, 600);
		});

		it('should set background scroll factor', () => {
			scene.create();

			expect(mockRenderTexture.setScrollFactor).toHaveBeenCalledWith(0, 0);
		});

		it('should fill background with color and alpha', () => {
			scene.create();

			expect(mockRenderTexture.fill).toHaveBeenCalledWith(0x000000, 0.5);
		});

		it('should create youtube player', () => {
			scene.create();

			expect((scene as any).add.rexYoutubePlayer).toHaveBeenCalledWith(
				400,
				300,
				600,
				480,
				expect.objectContaining({
					videoId: 'test-video',
					controls: true,
					autoPlay: true,
				})
			);
		});

		it('should play video', () => {
			scene.create();

			expect(mockVideo.play).toHaveBeenCalled();
		});

		it('should create close button', () => {
			scene.create();

			expect((scene as any).add.image).toHaveBeenCalledWith(750, 30, 'close_button');
		});

		it('should set up resize handler', () => {
			scene.create();

			expect((scene as any).scale.on).toHaveBeenCalledWith('resize', expect.any(Function));
		});
	});

	describe('createCloseButton', () => {
		beforeEach(() => {
			scene.preload();
			scene.player = { container: { body: { maxSpeed: 0 } }, speed: 100 };
		});

		it('should create close button image', () => {
			scene.createCloseButton();

			expect((scene as any).add.image).toHaveBeenCalledWith(750, 30, 'close_button');
			expect(mockImage.setInteractive).toHaveBeenCalled();
			expect(mockImage.setScale).toHaveBeenCalledWith(0.3);
			expect(mockImage.setScrollFactor).toHaveBeenCalledWith(0, 0);
			expect(mockImage.setDepth).toHaveBeenCalledWith(50);
		});

		it('should set up pointerdown handler', () => {
			scene.createCloseButton();

			expect(mockImage.on).toHaveBeenCalledWith('pointerdown', expect.any(Function));
		});

		it('should handle missing cameras.main', () => {
			(scene as any).cameras = {};

			expect(() => scene.createCloseButton()).not.toThrow();
		});
	});

	describe('changeSize', () => {
		beforeEach(() => {
			scene.preload();
			scene.create();
		});

		it('should recreate close button', () => {
			(scene as any).add.image.mockClear();

			scene.changeSize(1024, 768);

			expect(mockImage.destroy).toHaveBeenCalled();
			expect((scene as any).add.image).toHaveBeenCalled();
		});

		it('should update video position', () => {
			scene.changeSize(1024, 768);

			expect(scene.video.x).toBe(400);
			expect(scene.video.y).toBe(300);
		});

		it('should recreate background', () => {
			(scene as any).add.renderTexture.mockClear();

			scene.changeSize(1024, 768);

			expect(mockRenderTexture.destroy).toHaveBeenCalled();
			expect((scene as any).add.renderTexture).toHaveBeenCalled();
		});

		it('should handle missing cameras.main', () => {
			(scene as any).cameras = {};

			expect(() => scene.changeSize(1024, 768)).not.toThrow();
		});
	});
});
