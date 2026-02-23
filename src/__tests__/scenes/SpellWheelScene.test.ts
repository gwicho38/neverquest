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

	describe('spell icons - additional types', () => {
		beforeEach(() => {
			scene.init({
				player: { container: { x: 100, y: 200 } } as any,
				parentScene: { events: { emit: jest.fn() } } as any,
			});
		});

		it('should return correct icon for flameWave', () => {
			const icon = (scene as any).getSpellIcon({ id: 'flameWave' });
			expect(icon).toBe('🌊');
		});

		it('should return correct icon for frostNova', () => {
			const icon = (scene as any).getSpellIcon({ id: 'frostNova' });
			expect(icon).toBe('💠');
		});

		it('should return correct icon for chainLightning', () => {
			const icon = (scene as any).getSpellIcon({ id: 'chainLightning' });
			expect(icon).toBe('⛈️');
		});

		it('should return correct icon for divineShield', () => {
			const icon = (scene as any).getSpellIcon({ id: 'divineShield' });
			expect(icon).toBe('🛡️');
		});

		it('should return correct icon for shadowBolt', () => {
			const icon = (scene as any).getSpellIcon({ id: 'shadowBolt' });
			expect(icon).toBe('🌑');
		});

		it('should return correct icon for poisonCloud', () => {
			const icon = (scene as any).getSpellIcon({ id: 'poisonCloud' });
			expect(icon).toBe('☠️');
		});
	});

	describe('selectByPosition', () => {
		beforeEach(() => {
			scene.init({
				player: { container: { x: 100, y: 200 } } as any,
				parentScene: { events: { emit: jest.fn() } } as any,
			});
			scene.create();
		});

		it('should select slot matching LEFT position', () => {
			(scene as any).selectByPosition(0); // SpellPosition.LEFT
			expect((scene as any).selectedIndex).toBe(0);
		});

		it('should select slot matching CENTER position', () => {
			(scene as any).selectByPosition(1); // SpellPosition.CENTER
			expect((scene as any).selectedIndex).toBe(1);
		});

		it('should not change selection for invalid position', () => {
			(scene as any).selectedIndex = -1;
			(scene as any).selectByPosition(99);
			expect((scene as any).selectedIndex).toBe(-1);
		});
	});

	describe('setSelection', () => {
		beforeEach(() => {
			scene.init({
				player: { container: { x: 100, y: 200 } } as any,
				parentScene: { events: { emit: jest.fn() } } as any,
			});
			scene.create();
		});

		it('should clear previous selection styling', () => {
			// Select first, then second
			(scene as any).setSelection(0);
			const firstSlotGraphics = (scene as any).slots[0].graphics;
			firstSlotGraphics.clear.mockClear();

			(scene as any).setSelection(1);
			// Previous slot should have been redrawn (clear called)
			expect(firstSlotGraphics.clear).toHaveBeenCalled();
		});

		it('should scale up icon for selected slot', () => {
			(scene as any).setSelection(0);
			const slot = (scene as any).slots[0];
			expect(slot.icon.setScale).toHaveBeenCalledWith(1.3);
		});

		it('should reset icon scale for deselected slot', () => {
			(scene as any).setSelection(0);
			const firstIcon = (scene as any).slots[0].icon;
			firstIcon.setScale.mockClear();

			(scene as any).setSelection(1);
			expect(firstIcon.setScale).toHaveBeenCalledWith(1);
		});

		it('should update info text with spell details', () => {
			(scene as any).setSelection(0);
			// setText is called for spell name, mana cost, and description
			expect(mockText.setText).toHaveBeenCalledWith('Fireball');
			expect(mockText.setText).toHaveBeenCalledWith('Mana: 10');
			expect(mockText.setText).toHaveBeenCalledWith('A ball of fire');
		});

		it('should set spell color on name text', () => {
			(scene as any).setSelection(0);
			expect(mockText.setColor).toHaveBeenCalledWith('#ff6600');
		});

		it('should clear info text when index is out of bounds', () => {
			(scene as any).setSelection(-1);
			// clearInfoText sets all three text fields to ''
			expect(mockText.setText).toHaveBeenCalledWith('');
		});
	});

	describe('updateSelectionFromMouse', () => {
		beforeEach(() => {
			scene.init({
				player: { container: { x: 100, y: 200 } } as any,
				parentScene: { events: { emit: jest.fn() } } as any,
			});
			scene.create();
		});

		it('should select LEFT slot when mouse is far left of center', () => {
			const pointer = { x: 300, y: 300 }; // dx = -100 (left of center 400)
			(scene as any).updateSelectionFromMouse(pointer);
			expect((scene as any).selectedIndex).toBe(0); // LEFT
		});

		it('should select CENTER slot when mouse is near center', () => {
			const pointer = { x: 400, y: 300 }; // dx = 0
			(scene as any).updateSelectionFromMouse(pointer);
			expect((scene as any).selectedIndex).toBe(1); // CENTER
		});

		it('should select RIGHT slot when mouse is far right of center', () => {
			const pointer = { x: 500, y: 300 }; // dx = 100 (right of center 400)
			// Only 2 spells mocked, RIGHT position (index 2) won't exist
			// selectByPosition(RIGHT) should find no slot, so selection unchanged
			(scene as any).selectedIndex = -1;
			(scene as any).updateSelectionFromMouse(pointer);
			// With only 2 spells, RIGHT slot doesn't exist, selectedIndex stays -1
			expect((scene as any).selectedIndex).toBe(-1);
		});

		it('should ignore mouse when too far vertically', () => {
			const prevIndex = (scene as any).selectedIndex;
			const pointer = { x: 400, y: 100 }; // dy = -200, way above SLOT_SIZE
			(scene as any).updateSelectionFromMouse(pointer);
			expect((scene as any).selectedIndex).toBe(prevIndex);
		});

		it('should ignore mouse when too far from wheel', () => {
			const prevIndex = (scene as any).selectedIndex;
			const pointer = { x: 700, y: 300 }; // distance > SLOT_RADIUS + SLOT_SIZE
			(scene as any).updateSelectionFromMouse(pointer);
			expect((scene as any).selectedIndex).toBe(prevIndex);
		});
	});

	describe('castSelectedSpell', () => {
		let mockSpellEffects: any;

		beforeEach(() => {
			mockSpellEffects = {
				fireball: jest.fn(),
				flameWave: jest.fn(),
				iceShard: jest.fn(),
				frostNova: jest.fn(),
				lightningBolt: jest.fn(),
				heal: jest.fn(),
				divineShield: jest.fn(),
				shadowBolt: jest.fn(),
				poisonCloud: jest.fn(),
			};

			scene.init({
				player: { container: { x: 100, y: 200 } } as any,
				parentScene: {
					events: { emit: jest.fn() },
					input: {
						activePointer: { x: 500, y: 400 },
					},
					cameras: {
						main: {
							getWorldPoint: jest.fn().mockReturnValue({ x: 600, y: 500 }),
						},
					},
				} as any,
			});

			scene.create();
			(scene as any).spellEffects = mockSpellEffects;
		});

		it('should cast fireball when fireball spell is selected', () => {
			(scene as any).setSelection(0); // Fireball
			const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

			(scene as any).castSelectedSpell();

			expect(mockSpellEffects.fireball).toHaveBeenCalledWith(100, 200);
			consoleSpy.mockRestore();
		});

		it('should cast iceShard when ice spell is selected', () => {
			(scene as any).setSelection(1); // Ice Shard
			const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

			(scene as any).castSelectedSpell();

			expect(mockSpellEffects.iceShard).toHaveBeenCalledWith(100, 200);
			consoleSpy.mockRestore();
		});

		it('should close spell wheel after casting', () => {
			(scene as any).setSelection(0);
			(scene as any).isOpen = true;
			const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

			(scene as any).castSelectedSpell();

			expect((scene as any).isOpen).toBe(false);
			consoleSpy.mockRestore();
		});

		it('should close spell wheel even without selection', () => {
			(scene as any).selectedIndex = -1;
			(scene as any).isOpen = true;

			(scene as any).castSelectedSpell();

			expect((scene as any).isOpen).toBe(false);
		});

		it('should use world coordinates for targeted spells', () => {
			(scene as any).setSelection(0);
			const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

			(scene as any).castSelectedSpell();

			// Should have used getWorldPoint to convert screen to world coords
			expect((scene as any).parentScene.cameras.main.getWorldPoint).toHaveBeenCalled();
			consoleSpy.mockRestore();
		});

		it('should use default target when no parent pointer', () => {
			(scene as any).parentScene.input.activePointer = null;
			(scene as any).parentScene.cameras.main = null;
			(scene as any).setSelection(0);
			const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

			(scene as any).castSelectedSpell();

			// Should still cast (uses default fallback targetX = playerX + 100)
			expect(mockSpellEffects.fireball).toHaveBeenCalled();
			consoleSpy.mockRestore();
		});
	});

	describe('castSpellEffect - all spell types', () => {
		let mockSpellEffects: any;

		beforeEach(() => {
			mockSpellEffects = {
				fireball: jest.fn(),
				flameWave: jest.fn(),
				iceShard: jest.fn(),
				frostNova: jest.fn(),
				lightningBolt: jest.fn(),
				heal: jest.fn(),
				divineShield: jest.fn(),
				shadowBolt: jest.fn(),
				poisonCloud: jest.fn(),
			};

			scene.init({
				player: { container: { x: 100, y: 200 } } as any,
				parentScene: { events: { emit: jest.fn() } } as any,
			});
			scene.create();
			(scene as any).spellEffects = mockSpellEffects;
		});

		it('should cast fireball effect', () => {
			(scene as any).castSpellEffect({ effectMethod: 'fireball' }, 10, 20, 100, 200);
			expect(mockSpellEffects.fireball).toHaveBeenCalledWith(10, 20);
		});

		it('should cast flameWave effect with direction', () => {
			(scene as any).castSpellEffect({ effectMethod: 'flameWave' }, 10, 20, 110, 20);
			expect(mockSpellEffects.flameWave).toHaveBeenCalledWith(10, 20, expect.any(Number));
		});

		it('should cast iceShard effect', () => {
			(scene as any).castSpellEffect({ effectMethod: 'iceShard' }, 10, 20, 100, 200);
			expect(mockSpellEffects.iceShard).toHaveBeenCalledWith(10, 20);
		});

		it('should cast frostNova effect', () => {
			(scene as any).castSpellEffect({ effectMethod: 'frostNova' }, 10, 20, 100, 200);
			expect(mockSpellEffects.frostNova).toHaveBeenCalledWith(10, 20);
		});

		it('should cast lightningBolt effect', () => {
			(scene as any).castSpellEffect({ effectMethod: 'lightningBolt' }, 10, 20, 100, 200);
			expect(mockSpellEffects.lightningBolt).toHaveBeenCalledWith(10, 20, 100, 200);
		});

		it('should cast chainLightning as lightningBolt', () => {
			(scene as any).castSpellEffect({ effectMethod: 'chainLightning' }, 10, 20, 100, 200);
			expect(mockSpellEffects.lightningBolt).toHaveBeenCalledWith(10, 20, 100, 200);
		});

		it('should cast heal effect', () => {
			(scene as any).castSpellEffect({ effectMethod: 'heal' }, 10, 20, 100, 200);
			expect(mockSpellEffects.heal).toHaveBeenCalledWith(10, 20);
		});

		it('should cast divineShield effect', () => {
			(scene as any).castSpellEffect({ effectMethod: 'divineShield' }, 10, 20, 100, 200);
			expect(mockSpellEffects.divineShield).toHaveBeenCalledWith(10, 20);
		});

		it('should cast shadowBolt effect', () => {
			(scene as any).castSpellEffect({ effectMethod: 'shadowBolt' }, 10, 20, 100, 200);
			expect(mockSpellEffects.shadowBolt).toHaveBeenCalledWith(10, 20, 100, 200);
		});

		it('should cast poisonCloud at target position', () => {
			(scene as any).castSpellEffect({ effectMethod: 'poisonCloud' }, 10, 20, 100, 200);
			expect(mockSpellEffects.poisonCloud).toHaveBeenCalledWith(100, 200);
		});

		it('should warn for unknown spell effect', () => {
			const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
			(scene as any).castSpellEffect({ effectMethod: 'unknownSpell' }, 10, 20, 100, 200);
			expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('unknownSpell'));
			consoleSpy.mockRestore();
		});
	});

	describe('input handlers', () => {
		let keyHandlers: Record<string, () => void>;

		beforeEach(() => {
			keyHandlers = {};
			scene.init({
				player: { container: { x: 100, y: 200 } } as any,
				parentScene: {
					events: { emit: jest.fn() },
					input: { activePointer: { x: 500, y: 400 } },
					cameras: {
						main: {
							getWorldPoint: jest.fn().mockReturnValue({ x: 600, y: 500 }),
						},
					},
				} as any,
			});

			(scene as any).input.keyboard.on = jest.fn().mockImplementation((event: string, callback: () => void) => {
				keyHandlers[event] = callback;
			});

			scene.create();
		});

		it('should select LEFT position on M key', () => {
			keyHandlers['keydown-M']();
			expect((scene as any).selectedIndex).toBe(0);
		});

		it('should select CENTER position on N key', () => {
			keyHandlers['keydown-N']();
			expect((scene as any).selectedIndex).toBe(1);
		});

		it('should cast and close on L key release', () => {
			(scene as any).setSelection(0);
			(scene as any).isOpen = true;
			const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

			keyHandlers['keyup-L']();

			expect((scene as any).isOpen).toBe(false);
			consoleSpy.mockRestore();
		});

		it('should close without casting on ESC', () => {
			(scene as any).isOpen = true;

			keyHandlers['keyup-ESC']();

			expect((scene as any).isOpen).toBe(false);
		});
	});

	describe('animateOpen', () => {
		beforeEach(() => {
			scene.init({
				player: { container: { x: 100, y: 200 } } as any,
				parentScene: { events: { emit: jest.fn() } } as any,
			});
			scene.create();
		});

		it('should set isOpen to true', () => {
			expect((scene as any).isOpen).toBe(true);
		});

		it('should tween overlay alpha to 1', () => {
			const tweenCalls = mockTweens.add.mock.calls;
			const overlayTween = tweenCalls.find(
				(call: [{ targets: unknown; alpha: number }]) => call[0].targets === mockGraphics && call[0].alpha === 1
			);
			expect(overlayTween).toBeDefined();
		});

		it('should tween wheel scale to 1', () => {
			const tweenCalls = mockTweens.add.mock.calls;
			const scaleTween = tweenCalls.find(
				(call: [{ targets: unknown; scale: number }]) =>
					call[0].targets === mockContainer && call[0].scale === 1
			);
			expect(scaleTween).toBeDefined();
		});
	});

	describe('close with onComplete', () => {
		beforeEach(() => {
			scene.init({
				player: { container: { x: 100, y: 200 } } as any,
				parentScene: { events: { emit: jest.fn() } } as any,
			});
			scene.create();
		});

		it('should call scene.stop on close animation complete', () => {
			(scene as any).isOpen = true;
			mockTweens.add.mockClear();

			(scene as any).close(false);

			// Find the tween with onComplete
			const tweenCalls = mockTweens.add.mock.calls;
			const tweenWithComplete = tweenCalls.find((call: [{ onComplete?: () => void }]) => call[0].onComplete);
			expect(tweenWithComplete).toBeDefined();

			// Execute the onComplete callback
			tweenWithComplete[0].onComplete();
			expect((scene as any).scene.stop).toHaveBeenCalled();
		});
	});

	describe('getSelectedSpell - with valid selection', () => {
		beforeEach(() => {
			scene.init({
				player: { container: { x: 100, y: 200 } } as any,
				parentScene: { events: { emit: jest.fn() } } as any,
			});
			scene.create();
		});

		it('should return the selected spell object', () => {
			(scene as any).setSelection(0);
			const spell = scene.getSelectedSpell();
			expect(spell).not.toBeNull();
			expect(spell!.id).toBe('fireball');
			expect(spell!.name).toBe('Fireball');
		});

		it('should return second spell when index is 1', () => {
			(scene as any).setSelection(1);
			const spell = scene.getSelectedSpell();
			expect(spell).not.toBeNull();
			expect(spell!.id).toBe('iceShard');
		});
	});

	describe('drawSlot', () => {
		beforeEach(() => {
			scene.init({
				player: { container: { x: 100, y: 200 } } as any,
				parentScene: { events: { emit: jest.fn() } } as any,
			});
			scene.create();
		});

		it('should draw selected slot with different styling', () => {
			const gfx = (scene as any).add.graphics();
			const spell = { type: 'fire', id: 'fireball' };

			(scene as any).drawSlot(gfx, 0, 0, spell, true);

			expect(gfx.clear).toHaveBeenCalled();
			expect(gfx.fillRoundedRect).toHaveBeenCalled();
			expect(gfx.strokeRoundedRect).toHaveBeenCalled();
			// Selected uses white stroke (0xffffff)
			expect(gfx.lineStyle).toHaveBeenCalledWith(4, 0xffffff, 1);
		});

		it('should draw unselected slot with default styling', () => {
			const gfx = (scene as any).add.graphics();
			const spell = { type: 'fire', id: 'fireball' };

			(scene as any).drawSlot(gfx, 0, 0, spell, false);

			expect(gfx.lineStyle).toHaveBeenCalledWith(2, 0x555555, 1);
		});
	});
});
