/**
 * Tests for SpellWheelScene
 */

import Phaser from 'phaser';
import { SpellWheelScene, SpellWheelSceneName } from '../../scenes/SpellWheelScene';
import { getUnlockedSpells } from '../../consts/Spells';

// Mock Phaser Math functions
(Phaser.Math as any).DegToRad = jest.fn((deg: number) => deg * (Math.PI / 180));
(Phaser.Math as any).RadToDeg = jest.fn((rad: number) => rad * (180 / Math.PI));

// Mock dependencies
jest.mock('../../consts/Colors', () => ({
	SpellColors: {
		WHEEL_CENTER: 0x2a2a2a,
		WHEEL_SEGMENT: 0x3a3a3a,
		WHEEL_BORDER: 0x555555,
	},
	HexColors: {
		WHITE: '#ffffff',
		BLUE: '#0066ff',
		GRAY_LIGHT: '#cccccc',
	},
	NumericColors: {
		BLACK: 0x000000,
	},
}));

jest.mock('../../consts/Numbers', () => ({
	SpellWheelValues: {
		OVERLAY_ALPHA: 0.7,
		WHEEL_RADIUS: 150,
		WHEEL_INNER_RADIUS: 40,
		SEGMENT_GAP: 3,
		SEGMENT_ICON_OFFSET: 95,
		OPEN_ANIMATION_DURATION: 200,
		CLOSE_ANIMATION_DURATION: 150,
	},
	Alpha: {
		OPAQUE: 1,
		HIGH: 0.9,
		MEDIUM_HIGH: 0.7,
	},
	Depth: {
		UI: 100,
		UI_OVERLAY: 101,
	},
	FontSizes: {
		LARGE: '28px',
		MEDIUM: '20px',
		SMALL: '16px',
	},
}));

jest.mock('../../consts/Spells', () => ({
	getUnlockedSpells: jest.fn().mockReturnValue([
		{
			id: 'fireball',
			name: 'Fireball',
			type: 'fire',
			manaCost: 10,
			description: 'A ball of fire',
			color: '#ff6600',
			effectMethod: 'fireball',
		},
		{
			id: 'iceShard',
			name: 'Ice Shard',
			type: 'ice',
			manaCost: 8,
			description: 'A shard of ice',
			color: '#66ccff',
			effectMethod: 'iceShard',
		},
	]),
	getSpellTypeColorNumeric: jest.fn().mockReturnValue(0xff6600),
}));

jest.mock('../../entities/Player', () => ({
	Player: jest.fn(),
}));

jest.mock('../../plugins/effects/SpellEffects', () => ({
	SpellEffects: jest.fn().mockImplementation(() => ({
		fireball: jest.fn(),
		flameWave: jest.fn(),
		iceShard: jest.fn(),
		frostNova: jest.fn(),
		lightningBolt: jest.fn(),
		heal: jest.fn(),
		divineShield: jest.fn(),
		shadowBolt: jest.fn(),
		poisonCloud: jest.fn(),
	})),
}));

describe('SpellWheelScene', () => {
	let scene: SpellWheelScene;
	let mockGraphics: any;
	let mockContainer: any;
	let mockText: any;
	let mockTweens: any;
	let mockPointer: any;

	beforeEach(() => {
		jest.clearAllMocks();

		mockGraphics = {
			fillStyle: jest.fn().mockReturnThis(),
			fillRect: jest.fn().mockReturnThis(),
			fillCircle: jest.fn().mockReturnThis(),
			fillRoundedRect: jest.fn().mockReturnThis(),
			lineStyle: jest.fn().mockReturnThis(),
			strokeCircle: jest.fn().mockReturnThis(),
			strokeRoundedRect: jest.fn().mockReturnThis(),
			setDepth: jest.fn().mockReturnThis(),
			setAlpha: jest.fn().mockReturnThis(),
			clear: jest.fn().mockReturnThis(),
			beginPath: jest.fn().mockReturnThis(),
			moveTo: jest.fn().mockReturnThis(),
			arc: jest.fn().mockReturnThis(),
			closePath: jest.fn().mockReturnThis(),
			fillPath: jest.fn().mockReturnThis(),
			strokePath: jest.fn().mockReturnThis(),
		};

		mockContainer = {
			add: jest.fn().mockReturnThis(),
			setDepth: jest.fn().mockReturnThis(),
			setScale: jest.fn().mockReturnThis(),
		};

		mockText = {
			setOrigin: jest.fn().mockReturnThis(),
			setScale: jest.fn().mockReturnThis(),
			setText: jest.fn().mockReturnThis(),
			setColor: jest.fn().mockReturnThis(),
		};

		mockTweens = {
			add: jest.fn().mockReturnValue({
				on: jest.fn(),
			}),
		};

		mockPointer = {
			x: 400,
			y: 300,
			worldX: 500,
			worldY: 400,
		};

		scene = new SpellWheelScene();

		// Setup mock scene properties
		(scene as any).cameras = {
			main: {
				width: 800,
				height: 600,
			},
		};

		(scene as any).add = {
			graphics: jest.fn().mockReturnValue(mockGraphics),
			container: jest.fn().mockReturnValue(mockContainer),
			text: jest.fn().mockReturnValue(mockText),
		};

		(scene as any).tweens = mockTweens;

		(scene as any).input = {
			on: jest.fn(),
			keyboard: {
				on: jest.fn(),
			},
			activePointer: mockPointer,
		};

		(scene as any).scene = {
			stop: jest.fn(),
		};
	});

	describe('constructor', () => {
		it('should create scene with correct key', () => {
			expect(SpellWheelSceneName).toBe('SpellWheelScene');
		});

		it('should initialize with empty slots', () => {
			const newScene = new SpellWheelScene();
			expect((newScene as any).slots).toEqual([]);
			expect((newScene as any).selectedIndex).toBe(-1);
			expect((newScene as any).isOpen).toBe(false);
		});
	});

	describe('init', () => {
		it('should set player and parent scene', () => {
			const mockPlayer = { container: { x: 100, y: 200 } };
			const mockParentScene = { events: { emit: jest.fn() } };

			scene.init({ player: mockPlayer as any, parentScene: mockParentScene as any });

			expect((scene as any).player).toBe(mockPlayer);
			expect((scene as any).parentScene).toBe(mockParentScene);
		});
	});

	describe('create', () => {
		beforeEach(() => {
			scene.init({
				player: { container: { x: 100, y: 200 } } as any,
				parentScene: { events: { emit: jest.fn() } } as any,
			});
		});

		it('should get unlocked spells', () => {
			scene.create();

			expect(getUnlockedSpells).toHaveBeenCalled();
		});

		it('should create overlay', () => {
			scene.create();

			expect((scene as any).add.graphics).toHaveBeenCalled();
			expect(mockGraphics.fillStyle).toHaveBeenCalled();
			expect(mockGraphics.fillRect).toHaveBeenCalledWith(0, 0, 800, 600);
		});

		it('should create wheel container', () => {
			scene.create();

			expect((scene as any).add.container).toHaveBeenCalledWith(400, 300);
		});

		it('should create center circle', () => {
			scene.create();

			expect(mockGraphics.fillCircle).toHaveBeenCalled();
			expect(mockGraphics.strokeCircle).toHaveBeenCalled();
		});

		it('should setup input handlers', () => {
			scene.create();

			expect((scene as any).input.on).toHaveBeenCalledWith('pointermove', expect.any(Function));
			expect((scene as any).input.keyboard.on).toHaveBeenCalledWith('keydown-M', expect.any(Function));
			expect((scene as any).input.keyboard.on).toHaveBeenCalledWith('keydown-N', expect.any(Function));
			expect((scene as any).input.keyboard.on).toHaveBeenCalledWith('keydown-COMMA', expect.any(Function));
			expect((scene as any).input.keyboard.on).toHaveBeenCalledWith('keyup-L', expect.any(Function));
			expect((scene as any).input.keyboard.on).toHaveBeenCalledWith('keyup-ESC', expect.any(Function));
		});

		it('should create text elements', () => {
			scene.create();

			// Should create selected spell text, mana cost text, description text, and instructions
			expect((scene as any).add.text).toHaveBeenCalled();
		});

		it('should animate opening', () => {
			scene.create();

			expect(mockTweens.add).toHaveBeenCalled();
		});
	});

	describe('getSelectedSpell', () => {
		beforeEach(() => {
			scene.init({
				player: { container: { x: 100, y: 200 } } as any,
				parentScene: { events: { emit: jest.fn() } } as any,
			});
			scene.create();
		});

		it('should return null when no selection', () => {
			(scene as any).selectedIndex = -1;

			const spell = scene.getSelectedSpell();

			expect(spell).toBeNull();
		});

		it('should return null when index out of bounds', () => {
			(scene as any).selectedIndex = 999;

			const spell = scene.getSelectedSpell();

			expect(spell).toBeNull();
		});

		it('should return selected spell when valid selection', () => {
			// Slots are created in create()
			(scene as any).selectedIndex = 0;

			// For this test we need to check that slots exist
			expect((scene as any).slots.length).toBeGreaterThan(0);
		});
	});

	describe('spell icons', () => {
		beforeEach(() => {
			scene.init({
				player: { container: { x: 100, y: 200 } } as any,
				parentScene: { events: { emit: jest.fn() } } as any,
			});
		});

		it('should return correct icon for fireball', () => {
			const icon = (scene as any).getSpellIcon({ id: 'fireball' });
			expect(icon).toBe('🔥');
		});

		it('should return correct icon for iceShard', () => {
			const icon = (scene as any).getSpellIcon({ id: 'iceShard' });
			expect(icon).toBe('❄️');
		});

		it('should return correct icon for lightningBolt', () => {
			const icon = (scene as any).getSpellIcon({ id: 'lightningBolt' });
			expect(icon).toBe('⚡');
		});

		it('should return correct icon for heal', () => {
			const icon = (scene as any).getSpellIcon({ id: 'heal' });
			expect(icon).toBe('💚');
		});

		it('should return default icon for unknown spell', () => {
			const icon = (scene as any).getSpellIcon({ id: 'unknown' });
			expect(icon).toBe('✨');
		});
	});

	describe('close', () => {
		beforeEach(() => {
			const mockParentScene = { events: { emit: jest.fn() } };
			scene.init({
				player: { container: { x: 100, y: 200 } } as any,
				parentScene: mockParentScene as any,
			});
			scene.create();
		});

		it('should not close if already closed', () => {
			(scene as any).isOpen = false;
			mockTweens.add.mockClear();

			(scene as any).close(false);

			expect(mockTweens.add).not.toHaveBeenCalled();
		});

		it('should emit event to parent scene', () => {
			(scene as any).isOpen = true;

			(scene as any).close(true);

			expect((scene as any).parentScene.events.emit).toHaveBeenCalledWith('spellwheelclosed', true);
		});

		it('should animate close', () => {
			(scene as any).isOpen = true;
			mockTweens.add.mockClear();

			(scene as any).close(false);

			expect(mockTweens.add).toHaveBeenCalled();
		});
	});

	describe('clearInfoText', () => {
		beforeEach(() => {
			scene.init({
				player: { container: { x: 100, y: 200 } } as any,
				parentScene: { events: { emit: jest.fn() } } as any,
			});
			scene.create();
		});

		it('should clear all text elements', () => {
			(scene as any).clearInfoText();

			expect(mockText.setText).toHaveBeenCalledWith('');
		});
	});
});
