import { NeverquestConsumableManager } from '../../plugins/NeverquestConsumableManager';
import { ConsumableBonus } from '../../models/ConsumableBonus';

// Mock NeverquestEntityTextDisplay
jest.mock('../../plugins/NeverquestEntityTextDisplay');

describe('NeverquestConsumableManager', () => {
	let manager: NeverquestConsumableManager;
	let mockScene: any;
	let mockPlayer: any;
	let mockItem: any;

	beforeEach(() => {
		// Create mock scene
		mockScene = {
			sound: {
				play: jest.fn(),
			},
			time: {
				addEvent: jest.fn((config) => ({
					reset: jest.fn(),
					...config,
				})),
			},
			scene: {
				get: jest.fn().mockReturnValue(null),
			},
		};

		// Create mock player
		mockPlayer = {
			scene: mockScene,
			attributes: {
				health: 50,
				baseHealth: 100,
				maxHealth: 100,
				atack: 10,
				bonus: {
					consumable: [],
				},
			},
			healthBar: {
				update: jest.fn(),
			},
			neverquestHUDProgressBar: {
				updateHealth: jest.fn(),
			},
		};

		// Create mock item
		mockItem = {
			script: '',
			useSfx: 'test-sfx',
			buffType: {
				id: 1,
			},
		};

		manager = new NeverquestConsumableManager();
	});

	describe('Constructor', () => {
		it('should initialize with null neverquestEntityTextDisplay', () => {
			expect(manager.neverquestEntityTextDisplay).toBeNull();
		});
	});

	describe('useItem', () => {
		it('should not process item with empty script', () => {
			mockItem.script = '';
			const spy = jest.spyOn(manager, 'recover');

			manager.useItem(mockItem, mockPlayer);

			expect(spy).not.toHaveBeenCalled();
		});

		it('should call recover for "rec" script action', () => {
			mockItem.script = 'rec hp 10;';
			const spy = jest.spyOn(manager, 'recover');

			manager.useItem(mockItem, mockPlayer);

			expect(spy).toHaveBeenCalledWith(mockItem, ['rec', 'hp', '10'], mockPlayer);
		});

		it('should call buff for "buff" script action', () => {
			mockItem.script = 'buff atk 5 10;';
			const spy = jest.spyOn(manager, 'buff');

			manager.useItem(mockItem, mockPlayer);

			expect(spy).toHaveBeenCalledWith(mockItem, ['buff', 'atk', '5', '10'], mockPlayer);
		});

		it('should handle multiple script actions', () => {
			mockItem.script = 'rec hp 10;buff atk 5 10;';
			const recSpy = jest.spyOn(manager, 'recover');
			const buffSpy = jest.spyOn(manager, 'buff');

			manager.useItem(mockItem, mockPlayer);

			expect(recSpy).toHaveBeenCalledWith(mockItem, ['rec', 'hp', '10'], mockPlayer);
			expect(buffSpy).toHaveBeenCalledWith(mockItem, ['buff', 'atk', '5', '10'], mockPlayer);
		});

		it('should warn for unknown script action', () => {
			mockItem.script = 'unknown action;';
			const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

			manager.useItem(mockItem, mockPlayer);

			expect(consoleSpy).toHaveBeenCalledWith('This is not a usable item.');
			consoleSpy.mockRestore();
		});

		it('should filter empty script segments', () => {
			mockItem.script = ';;;rec hp 10;;;';
			const spy = jest.spyOn(manager, 'recover');

			manager.useItem(mockItem, mockPlayer);

			expect(spy).toHaveBeenCalledTimes(1);
		});
	});

	describe('recover', () => {
		it('should recover HP and not exceed baseHealth', () => {
			mockPlayer.attributes.health = 50;
			mockPlayer.attributes.baseHealth = 100;

			manager.recover(mockItem, ['rec', 'hp', '30'], mockPlayer);

			expect(mockPlayer.attributes.health).toBe(80);
			expect(mockPlayer.healthBar.update).toHaveBeenCalledWith(80);
		});

		it('should cap health at baseHealth when recovering', () => {
			mockPlayer.attributes.health = 95;
			mockPlayer.attributes.baseHealth = 100;

			manager.recover(mockItem, ['rec', 'hp', '20'], mockPlayer);

			expect(mockPlayer.attributes.health).toBe(100);
		});

		it('should play item use sound effect', () => {
			manager.recover(mockItem, ['rec', 'hp', '10'], mockPlayer);

			expect(mockScene.sound.play).toHaveBeenCalledWith('test-sfx');
		});

		it('should update HUD progress bar if it exists', () => {
			manager.recover(mockItem, ['rec', 'hp', '10'], mockPlayer);

			expect(mockPlayer.neverquestHUDProgressBar.updateHealth).toHaveBeenCalledWith(mockPlayer.attributes.health);
		});

		it('should not update HUD progress bar if it does not exist', () => {
			mockPlayer.neverquestHUDProgressBar = null;

			expect(() => {
				manager.recover(mockItem, ['rec', 'hp', '10'], mockPlayer);
			}).not.toThrow();
		});

		it('should handle SP recovery (not yet implemented)', () => {
			manager.recover(mockItem, ['rec', 'sp', '10'], mockPlayer);

			// Should not throw, just not do anything
			expect(mockScene.sound.play).not.toHaveBeenCalled();
		});

		it('should handle ATK recovery (not yet implemented)', () => {
			manager.recover(mockItem, ['rec', 'atk', '10'], mockPlayer);

			// Should not throw, just not do anything
			expect(mockScene.sound.play).not.toHaveBeenCalled();
		});

		it('should parse recovery amount as integer', () => {
			mockPlayer.attributes.health = 50;

			manager.recover(mockItem, ['rec', 'hp', '15'], mockPlayer);

			expect(mockPlayer.attributes.health).toBe(65);
		});
	});

	describe('buff', () => {
		it('should create new ATK buff when not exists', () => {
			mockPlayer.attributes.bonus.consumable = [];
			mockPlayer.attributes.atack = 10;

			manager.buff(mockItem, ['buff', 'atk', '5', '10'], mockPlayer);

			expect(mockPlayer.attributes.bonus.consumable).toHaveLength(1);
			expect(mockPlayer.attributes.bonus.consumable[0].uniqueId).toBe(1);
			expect(mockPlayer.attributes.bonus.consumable[0].statBonus).toBe('atack');
			expect(mockPlayer.attributes.bonus.consumable[0].value).toBe(5);
			expect(mockPlayer.attributes.bonus.consumable[0].time).toBe(10);
			expect(mockPlayer.attributes.atack).toBe(15);
		});

		it('should reset timer when buff already exists', () => {
			const existingTimer = {
				reset: jest.fn(),
			} as any;
			const existingBonus = new ConsumableBonus(1, 'atack', 5, 10);
			existingBonus.timer = existingTimer;
			mockPlayer.attributes.bonus.consumable = [existingBonus];

			manager.buff(mockItem, ['buff', 'atk', '5', '10'], mockPlayer);

			expect(existingTimer.reset).toHaveBeenCalled();
			expect(mockPlayer.attributes.bonus.consumable).toHaveLength(1);
		});

		it('should play sound effect when creating buff', () => {
			manager.buff(mockItem, ['buff', 'atk', '5', '10'], mockPlayer);

			expect(mockScene.sound.play).toHaveBeenCalledWith('test-sfx');
		});

		it('should create timer with correct delay calculation', () => {
			manager.buff(mockItem, ['buff', 'atk', '5', '10'], mockPlayer);

			expect(mockScene.time.addEvent).toHaveBeenCalledWith(
				expect.objectContaining({
					delay: 3000, // 10 * 300
				})
			);
		});

		it('should call changeStats with negative sign when timer expires', () => {
			manager.buff(mockItem, ['buff', 'atk', '5', '10'], mockPlayer);

			const timerConfig = (mockScene.time.addEvent as jest.Mock).mock.calls[0][0];
			expect(timerConfig.callback).toBe(manager.changeStats);
			expect(timerConfig.args[2]).toBe(-1);
		});

		it('should handle HP buff (not yet implemented)', () => {
			manager.buff(mockItem, ['buff', 'hp', '10', '5'], mockPlayer);

			// Should not throw, just not do anything
			expect(mockScene.sound.play).not.toHaveBeenCalled();
		});

		it('should handle SP buff (not yet implemented)', () => {
			manager.buff(mockItem, ['buff', 'sp', '10', '5'], mockPlayer);

			// Should not throw, just not do anything
			expect(mockScene.sound.play).not.toHaveBeenCalled();
		});

		it('should parse buff values as integers', () => {
			mockPlayer.attributes.atack = 10;

			manager.buff(mockItem, ['buff', 'atk', '7', '15'], mockPlayer);

			const bonus = mockPlayer.attributes.bonus.consumable[0];
			expect(bonus.value).toBe(7);
			expect(bonus.time).toBe(15);
			expect(mockPlayer.attributes.atack).toBe(17);
		});
	});

	describe('changeStats', () => {
		it('should increase stat with positive sign', () => {
			const bonus = new ConsumableBonus(1, 'atack', 5, 10);
			mockPlayer.attributes.bonus.consumable = [bonus];
			mockPlayer.attributes.atack = 10;

			manager.changeStats(mockPlayer, bonus, 1);

			expect(mockPlayer.attributes.atack).toBe(15);
		});

		it('should decrease stat with negative sign', () => {
			const bonus = new ConsumableBonus(1, 'atack', 5, 10);
			mockPlayer.attributes.bonus.consumable = [bonus];
			mockPlayer.attributes.atack = 15;

			manager.changeStats(mockPlayer, bonus, -1);

			expect(mockPlayer.attributes.atack).toBe(10);
		});

		it('should remove bonus from consumable array', () => {
			const bonus = new ConsumableBonus(1, 'atack', 5, 10);
			mockPlayer.attributes.bonus.consumable = [bonus];

			manager.changeStats(mockPlayer, bonus, -1);

			expect(mockPlayer.attributes.bonus.consumable).toHaveLength(0);
		});

		it('should use default sign of 1 when not provided', () => {
			const bonus = new ConsumableBonus(1, 'atack', 5, 10);
			mockPlayer.attributes.bonus.consumable = [bonus];
			mockPlayer.attributes.atack = 10;

			manager.changeStats(mockPlayer, bonus);

			expect(mockPlayer.attributes.atack).toBe(15);
		});

		it('should not remove bonus if not found in array', () => {
			const bonus1 = new ConsumableBonus(1, 'atack', 5, 10);
			const bonus2 = new ConsumableBonus(2, 'atack', 3, 5);
			mockPlayer.attributes.bonus.consumable = [bonus1];

			manager.changeStats(mockPlayer, bonus2, -1);

			expect(mockPlayer.attributes.bonus.consumable).toHaveLength(1);
			expect(mockPlayer.attributes.bonus.consumable[0]).toBe(bonus1);
		});

		it('should handle multiple bonuses correctly', () => {
			const bonus1 = new ConsumableBonus(1, 'atack', 5, 10);
			const bonus2 = new ConsumableBonus(2, 'atack', 3, 5);
			mockPlayer.attributes.bonus.consumable = [bonus1, bonus2];
			mockPlayer.attributes.atack = 18;

			manager.changeStats(mockPlayer, bonus1, -1);

			expect(mockPlayer.attributes.atack).toBe(13);
			expect(mockPlayer.attributes.bonus.consumable).toHaveLength(1);
			expect(mockPlayer.attributes.bonus.consumable[0]).toBe(bonus2);
		});
	});

	describe('Edge Cases', () => {
		it('should handle negative health recovery', () => {
			mockPlayer.attributes.health = 50;

			manager.recover(mockItem, ['rec', 'hp', '-10'], mockPlayer);

			expect(mockPlayer.attributes.health).toBe(40);
		});

		it('should handle zero recovery amount', () => {
			mockPlayer.attributes.health = 50;

			manager.recover(mockItem, ['rec', 'hp', '0'], mockPlayer);

			expect(mockPlayer.attributes.health).toBe(50);
		});

		it('should handle very large recovery values', () => {
			mockPlayer.attributes.health = 50;
			mockPlayer.attributes.baseHealth = 100;

			manager.recover(mockItem, ['rec', 'hp', '1000'], mockPlayer);

			expect(mockPlayer.attributes.health).toBe(100);
		});

		it('should handle buff with zero value', () => {
			mockPlayer.attributes.atack = 10;

			manager.buff(mockItem, ['buff', 'atk', '0', '10'], mockPlayer);

			expect(mockPlayer.attributes.atack).toBe(10);
		});

		it('should handle buff with zero duration', () => {
			mockPlayer.attributes.atack = 10;

			manager.buff(mockItem, ['buff', 'atk', '5', '0'], mockPlayer);

			expect(mockScene.time.addEvent).toHaveBeenCalledWith(
				expect.objectContaining({
					delay: 0,
				})
			);
		});
	});
});
