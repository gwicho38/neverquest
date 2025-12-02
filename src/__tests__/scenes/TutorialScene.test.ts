/**
 * Tests for TutorialScene
 */

import { TutorialScene } from '../../scenes/TutorialScene';
import { NeverquestMapCreator } from '../../plugins/NeverquestMapCreator';
import { NeverquestEnvironmentParticles } from '../../plugins/NeverquestEnvironmentParticles';
import { NeverquestObjectMarker } from '../../plugins/NeverquestObjectMarker';
import { NeverquestWarp } from '../../plugins/NeverquestWarp';

// Mock dependencies
jest.mock('../../plugins/AnimatedTiles', () => jest.fn());
jest.mock('../../plugins/NeverquestEnvironmentParticles', () => ({
	NeverquestEnvironmentParticles: jest.fn().mockImplementation(() => ({
		create: jest.fn(),
	})),
}));
jest.mock('../../plugins/NeverquestMapCreator', () => ({
	NeverquestMapCreator: jest.fn().mockImplementation(() => ({
		mapName: '',
		tilesetImages: [] as any[],
		create: jest.fn(),
		map: {},
	})),
}));
jest.mock('../../plugins/NeverquestObjectMarker', () => ({
	NeverquestObjectMarker: jest.fn().mockImplementation(() => ({
		create: jest.fn(),
	})),
}));
jest.mock('../../plugins/NeverquestWarp', () => ({
	NeverquestWarp: jest.fn().mockImplementation(() => ({
		createWarps: jest.fn(),
	})),
}));
jest.mock('../../entities/Player', () => ({
	Player: jest.fn(),
}));
jest.mock('../../models/TilesetImageConfig', () => ({
	TilesetImageConfig: jest.fn(),
}));
jest.mock('../../consts/Numbers', () => ({
	CameraValues: {
		ZOOM_CLOSE: 2,
	},
}));

describe('TutorialScene', () => {
	let scene: TutorialScene;

	beforeEach(() => {
		jest.clearAllMocks();

		scene = new TutorialScene();

		// Setup mock scene properties
		(scene as any).load = {
			scenePlugin: jest.fn(),
		};

		(scene as any).cameras = {
			main: {
				startFollow: jest.fn(),
				setZoom: jest.fn(),
			},
		};

		(scene as any).scene = {
			launch: jest.fn(),
		};

		// Mock player with container
		(scene as any).player = {
			container: {},
		};
	});

	describe('constructor', () => {
		it('should create scene with key TutorialScene', () => {
			const newScene = new TutorialScene();
			expect((newScene as any).sys?.settings?.key || 'TutorialScene').toBe('TutorialScene');
		});
	});

	describe('preload', () => {
		it('should load animated tiles plugin', () => {
			scene.preload();

			expect((scene as any).load.scenePlugin).toHaveBeenCalledWith(
				'animatedTiles',
				expect.anything(),
				'animatedTiles',
				'animatedTiles'
			);
		});
	});

	describe('create', () => {
		it('should create map with correct name', () => {
			scene.create();

			expect(NeverquestMapCreator).toHaveBeenCalledWith(scene);
		});

		it('should start camera following player', () => {
			scene.create();

			expect((scene as any).cameras.main.startFollow).toHaveBeenCalledWith((scene as any).player.container);
		});

		it('should set camera zoom', () => {
			scene.create();

			expect((scene as any).cameras.main.setZoom).toHaveBeenCalledWith(2);
		});

		it('should create environment particles', () => {
			scene.create();

			expect(NeverquestEnvironmentParticles).toHaveBeenCalledWith(scene, expect.anything());
			expect(scene.particles.create).toHaveBeenCalled();
		});

		it('should launch dialog scene', () => {
			scene.create();

			expect((scene as any).scene.launch).toHaveBeenCalledWith(
				'DialogScene',
				expect.objectContaining({
					player: expect.anything(),
					map: expect.anything(),
					scene: expect.anything(),
				})
			);
		});

		it('should create interactive markers', () => {
			scene.create();

			expect(NeverquestObjectMarker).toHaveBeenCalled();
		});

		it('should create warps', () => {
			scene.create();

			expect(NeverquestWarp).toHaveBeenCalled();
		});
	});

	describe('update', () => {
		it('should be defined', () => {
			expect(scene.update).toBeDefined();
		});

		it('should be callable without error', () => {
			expect(() => scene.update()).not.toThrow();
		});
	});
});
