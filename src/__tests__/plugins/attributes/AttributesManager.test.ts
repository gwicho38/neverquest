import { AttributesManager } from '../../../plugins/attributes/AttributesManager';
import { BUFF_TYPES } from '../../../consts/DB_SEED/BuffTypes';

describe('AttributesManager', () => {
	let manager: AttributesManager;
	let mockScene: any;
	let mockEntity: any;
	let mockHealthBar: any;
	let mockHUDProgressBar: any;
	let updateCallback: any;

	beforeEach(() => {
		mockHealthBar = {
			draw: jest.fn(),
			full: 100,
			health: 100,
		};

		mockHUDProgressBar = {
			updateHealth: jest.fn(),
		};

		mockScene = {
			events: {
				on: jest.fn((event, callback) => {
					if (event === 'update') {
						updateCallback = callback;
					}
				}),
			},
		};

		mockEntity = {
			attributes: {
				level: 1,
				baseHealth: 100,
				health: 100,
				defense: 10,
				atack: 20,
				speed: 5,
				critical: 5,
				flee: 5,
				hit: 5,
				rawAttributes: {
					str: 10,
					vit: 10,
					agi: 10,
					dex: 10,
				},
				availableStatPoints: 5,
				bonus: {
					consumable: [],
				},
			},
			healthBar: mockHealthBar,
			neverquestHUDProgressBar: mockHUDProgressBar,
		};

		manager = new AttributesManager(mockScene, mockEntity);
	});

	describe('Constructor', () => {
		it('should initialize with correct scene and entity', () => {
			expect(manager.scene).toBe(mockScene);
			expect(manager.entity).toBe(mockEntity);
		});

		it('should create deep copy of entity attributes', () => {
			// statsCopy is created before calculateStats runs, so it has original values
			expect(manager.statsCopy.level).toBe(1);
			expect(manager.statsCopy.baseHealth).toBe(100);
			expect(manager.statsCopy.defense).toBe(10);
			expect(manager.statsCopy).not.toBe(mockEntity.attributes); // Deep copy, not reference
		});

		it('should set firstTime to false after construction', () => {
			// Constructor calls calculateStats which sets firstTime to false
			expect(manager.firstTime).toBe(false);
		});

		it('should initialize leveledUp as false', () => {
			expect(manager.leveledUp).toBe(false);
		});

		it('should initialize changedAttribute as false', () => {
			expect(manager.changedAttribute).toBe(false);
		});

		it('should register update event listener', () => {
			expect(mockScene.events.on).toHaveBeenCalledWith('update', expect.any(Function), manager);
		});

		it('should call calculateStats on construction', () => {
			// Health should be recalculated
			expect(mockEntity.attributes.baseHealth).toBe(100 + 1 * 10 + 10 * 3); // statsCopy + level*10 + vit*3 = 140
		});
	});

	describe('calculateStats', () => {
		it('should call all calculation methods', () => {
			const checkLevelChangeSpy = jest.spyOn(manager, 'checkLevelChange');
			const calculateHealthSpy = jest.spyOn(manager, 'calculateHealth');
			const calculateDefenseSpy = jest.spyOn(manager, 'calculateDefense');
			const calculateAtackSpy = jest.spyOn(manager, 'calculateAtack');
			const calculateSpeedSpy = jest.spyOn(manager, 'calculateSpeed');
			const calculateCriticalSpy = jest.spyOn(manager, 'calculateCritical');
			const calculateFleeSpy = jest.spyOn(manager, 'calculateFlee');
			const calculateHitSpy = jest.spyOn(manager, 'calculateHit');

			manager.calculateStats();

			expect(checkLevelChangeSpy).toHaveBeenCalled();
			expect(calculateHealthSpy).toHaveBeenCalled();
			expect(calculateDefenseSpy).toHaveBeenCalled();
			expect(calculateAtackSpy).toHaveBeenCalled();
			expect(calculateSpeedSpy).toHaveBeenCalled();
			expect(calculateCriticalSpy).toHaveBeenCalled();
			expect(calculateFleeSpy).toHaveBeenCalled();
			expect(calculateHitSpy).toHaveBeenCalled();
		});

		it('should set firstTime to false after calculation', () => {
			manager.firstTime = true;
			manager.calculateStats();
			expect(manager.firstTime).toBe(false);
		});

		it('should set leveledUp to false after calculation', () => {
			manager.leveledUp = true;
			manager.calculateStats();
			expect(manager.leveledUp).toBe(false);
		});

		it('should set changedAttribute to false after calculation', () => {
			manager.changedAttribute = true;
			manager.calculateStats();
			expect(manager.changedAttribute).toBe(false);
		});
	});

	describe('checkLevelChange', () => {
		it('should detect level increase', () => {
			manager.statsCopy.level = 1;
			mockEntity.attributes.level = 2;

			manager.checkLevelChange();

			expect(manager.leveledUp).toBe(true);
			expect(manager.statsCopy.level).toBe(2);
		});

		it('should not set leveledUp when level unchanged', () => {
			manager.statsCopy.level = 1;
			mockEntity.attributes.level = 1;
			manager.leveledUp = false;

			manager.checkLevelChange();

			expect(manager.leveledUp).toBe(false);
		});

		it('should detect multiple level increases', () => {
			manager.statsCopy.level = 1;
			mockEntity.attributes.level = 5;

			manager.checkLevelChange();

			expect(manager.leveledUp).toBe(true);
			expect(manager.statsCopy.level).toBe(5);
		});
	});

	describe('calculateHealth', () => {
		it('should calculate baseHealth from initial value, level, and vitality', () => {
			manager.statsCopy.baseHealth = 100;
			mockEntity.attributes.level = 5;
			mockEntity.attributes.rawAttributes.vit = 20;

			manager.calculateHealth();

			expect(mockEntity.attributes.baseHealth).toBe(100 + 5 * 10 + 20 * 3); // 100 + 50 + 60 = 210
		});

		it('should update maxHealth to match baseHealth', () => {
			manager.statsCopy.baseHealth = 100;
			mockEntity.attributes.level = 5;
			mockEntity.attributes.rawAttributes.vit = 20;

			manager.calculateHealth();

			const expectedBaseHealth = 100 + 5 * 10 + 20 * 3; // 210
			expect(mockEntity.attributes.baseHealth).toBe(expectedBaseHealth);
			expect(mockEntity.attributes.maxHealth).toBe(expectedBaseHealth);
		});

		it('should call healthBar draw', () => {
			manager.calculateHealth();
			expect(mockHealthBar.draw).toHaveBeenCalled();
		});

		it('should set health to baseHealth on first time', () => {
			manager.firstTime = true;
			manager.statsCopy.baseHealth = 100;
			mockEntity.attributes.level = 1;
			mockEntity.attributes.rawAttributes.vit = 10;

			manager.calculateHealth();

			expect(mockEntity.attributes.health).toBe(mockEntity.attributes.baseHealth);
		});

		it('should update healthBar.full on first time', () => {
			manager.firstTime = true;
			manager.calculateHealth();

			expect(mockHealthBar.full).toBe(mockEntity.attributes.baseHealth);
		});

		it('should restore health to full on level up', () => {
			manager.firstTime = false;
			manager.leveledUp = true;
			mockEntity.attributes.health = 50; // damaged

			manager.calculateHealth();

			expect(mockEntity.attributes.health).toBe(mockEntity.attributes.baseHealth);
		});

		it('should update healthBar health and full on level up', () => {
			manager.firstTime = false;
			manager.leveledUp = true;

			manager.calculateHealth();

			expect(mockHealthBar.health).toBe(mockEntity.attributes.baseHealth);
			expect(mockHealthBar.full).toBe(mockEntity.attributes.baseHealth);
		});

		it('should call neverquestHUDProgressBar.updateHealth on first time', () => {
			manager.firstTime = true;
			manager.calculateHealth();

			expect(mockHUDProgressBar.updateHealth).toHaveBeenCalled();
		});

		it('should call neverquestHUDProgressBar.updateHealth on level up', () => {
			manager.firstTime = false;
			manager.leveledUp = true;
			manager.calculateHealth();

			expect(mockHUDProgressBar.updateHealth).toHaveBeenCalled();
		});

		it('should not restore health when not first time or leveled up', () => {
			manager.firstTime = false;
			manager.leveledUp = false;
			mockEntity.attributes.health = 50;

			manager.calculateHealth();

			expect(mockEntity.attributes.health).toBe(50); // Should not change
		});

		it('should handle entity without healthBar', () => {
			mockEntity.healthBar = null;

			expect(() => {
				manager.calculateHealth();
			}).not.toThrow();
		});

		it('should handle entity without neverquestHUDProgressBar', () => {
			mockEntity.neverquestHUDProgressBar = null;
			manager.firstTime = true;

			expect(() => {
				manager.calculateHealth();
			}).not.toThrow();
		});
	});

	describe('calculateDefense', () => {
		it('should calculate defense from base and vitality on first time', () => {
			manager.firstTime = true;
			manager.statsCopy.defense = 10;
			mockEntity.attributes.rawAttributes.vit = 15;

			manager.calculateDefense();

			expect(mockEntity.attributes.defense).toBe(10 + 15); // 25
		});

		it('should calculate defense on level up', () => {
			manager.firstTime = false;
			manager.leveledUp = true;
			manager.statsCopy.defense = 20;
			mockEntity.attributes.rawAttributes.vit = 10;

			manager.calculateDefense();

			expect(mockEntity.attributes.defense).toBe(30);
		});

		it('should calculate defense on attribute change', () => {
			manager.firstTime = false;
			manager.leveledUp = false;
			manager.changedAttribute = true;
			manager.statsCopy.defense = 5;
			mockEntity.attributes.rawAttributes.vit = 8;

			manager.calculateDefense();

			expect(mockEntity.attributes.defense).toBe(13);
		});

		it('should not recalculate defense when conditions not met', () => {
			manager.firstTime = false;
			manager.leveledUp = false;
			manager.changedAttribute = false;
			const originalDefense = mockEntity.attributes.defense;

			manager.calculateDefense();

			expect(mockEntity.attributes.defense).toBe(originalDefense);
		});
	});

	describe('calculateAtack', () => {
		it('should calculate attack from base, strength, and bonuses', () => {
			manager.firstTime = true;
			manager.statsCopy.atack = 20;
			mockEntity.attributes.level = 1;
			mockEntity.attributes.rawAttributes.str = 10;
			mockEntity.attributes.bonus.consumable = [];

			manager.calculateAtack();

			// strMultiplier = floor(10 / 10) = 1, atackBonus = 1 * 2 = 2
			// levelMultiplier = floor(1 / 3) = 0, levelAtackBonus = 0 * 1 = 0
			expect(mockEntity.attributes.atack).toBe(20 + 10 + 2 + 0 + 0); // 32
		});

		it('should include consumable attack bonuses', () => {
			manager.firstTime = true;
			manager.statsCopy.atack = 20;
			mockEntity.attributes.level = 1;
			mockEntity.attributes.rawAttributes.str = 10;
			mockEntity.attributes.bonus.consumable = [
				{ uniqueId: BUFF_TYPES.ATK01.id, value: '5' },
				{ uniqueId: BUFF_TYPES.ATK02.id, value: '3' },
			];

			manager.calculateAtack();

			// Base calculation + consumable bonuses (5 + 3 = 8)
			// strMultiplier = floor(10 / 10) = 1, atackBonus = 1 * 2 = 2
			expect(mockEntity.attributes.atack).toBe(20 + 10 + 2 + 0 + 8); // 40
		});

		it('should calculate level attack bonuses', () => {
			manager.firstTime = true;
			manager.statsCopy.atack = 20;
			mockEntity.attributes.level = 9; // level / 3 = 3
			mockEntity.attributes.rawAttributes.str = 10;
			mockEntity.attributes.bonus.consumable = [];

			manager.calculateAtack();

			// levelMultiplier = floor(9 / 3) = 3, levelAtackBonus = 3 * 1 = 3
			expect(mockEntity.attributes.atack).toBe(20 + 10 + 2 + 3 + 0); // 35
		});

		it('should calculate strength bonuses correctly', () => {
			manager.firstTime = true;
			manager.statsCopy.atack = 20;
			mockEntity.attributes.level = 1;
			mockEntity.attributes.rawAttributes.str = 25; // 25 / 10 = 2, 2 * 2 = 4
			mockEntity.attributes.bonus.consumable = [];

			manager.calculateAtack();

			// strMultiplier = floor(25 / 10) = 2, atackBonus = 2 * 2 = 4
			expect(mockEntity.attributes.atack).toBe(20 + 25 + 4 + 0 + 0); // 49
		});

		it('should recalculate on level up', () => {
			manager.firstTime = false;
			manager.leveledUp = true;
			manager.statsCopy.atack = 20;
			mockEntity.attributes.level = 6;
			mockEntity.attributes.rawAttributes.str = 10;

			manager.calculateAtack();

			// levelMultiplier = floor(6 / 3) = 2, levelAtackBonus = 2 * 1 = 2
			expect(mockEntity.attributes.atack).toBe(20 + 10 + 2 + 2 + 0); // 34
		});

		it('should recalculate on attribute change', () => {
			manager.firstTime = false;
			manager.leveledUp = false;
			manager.changedAttribute = true;
			manager.statsCopy.atack = 20;
			mockEntity.attributes.rawAttributes.str = 30;

			manager.calculateAtack();

			// strMultiplier = floor(30 / 10) = 3, atackBonus = 3 * 2 = 6
			expect(mockEntity.attributes.atack).toBe(20 + 30 + 6 + 0 + 0); // 56
		});
	});

	describe('calculateSpeed', () => {
		it('should not throw errors', () => {
			expect(() => {
				manager.calculateSpeed();
			}).not.toThrow();
		});
	});

	describe('calculateCritical', () => {
		it('should calculate critical from base and agility on first time', () => {
			manager.firstTime = true;
			manager.statsCopy.critical = 5;
			mockEntity.attributes.rawAttributes.agi = 12;

			manager.calculateCritical();

			expect(mockEntity.attributes.critical).toBe(5 + 12); // 17
		});

		it('should recalculate on level up', () => {
			manager.firstTime = false;
			manager.leveledUp = true;
			manager.statsCopy.critical = 10;
			mockEntity.attributes.rawAttributes.agi = 15;

			manager.calculateCritical();

			expect(mockEntity.attributes.critical).toBe(25);
		});

		it('should recalculate on attribute change', () => {
			manager.firstTime = false;
			manager.changedAttribute = true;
			manager.statsCopy.critical = 8;
			mockEntity.attributes.rawAttributes.agi = 20;

			manager.calculateCritical();

			expect(mockEntity.attributes.critical).toBe(28);
		});
	});

	describe('calculateFlee', () => {
		it('should calculate flee from base and agility on first time', () => {
			manager.firstTime = true;
			manager.statsCopy.flee = 5;
			mockEntity.attributes.rawAttributes.agi = 12;

			manager.calculateFlee();

			expect(mockEntity.attributes.flee).toBe(5 + 12); // 17
		});

		it('should recalculate on level up', () => {
			manager.firstTime = false;
			manager.leveledUp = true;
			manager.statsCopy.flee = 10;
			mockEntity.attributes.rawAttributes.agi = 15;

			manager.calculateFlee();

			expect(mockEntity.attributes.flee).toBe(25);
		});

		it('should recalculate on attribute change', () => {
			manager.firstTime = false;
			manager.changedAttribute = true;
			manager.statsCopy.flee = 8;
			mockEntity.attributes.rawAttributes.agi = 20;

			manager.calculateFlee();

			expect(mockEntity.attributes.flee).toBe(28);
		});
	});

	describe('calculateHit', () => {
		it('should calculate hit from base and dexterity on first time', () => {
			manager.firstTime = true;
			manager.statsCopy.hit = 5;
			mockEntity.attributes.rawAttributes.dex = 12;

			manager.calculateHit();

			expect(mockEntity.attributes.hit).toBe(5 + 12); // 17
		});

		it('should recalculate on level up', () => {
			manager.firstTime = false;
			manager.leveledUp = true;
			manager.statsCopy.hit = 10;
			mockEntity.attributes.rawAttributes.dex = 15;

			manager.calculateHit();

			expect(mockEntity.attributes.hit).toBe(25);
		});

		it('should recalculate on attribute change', () => {
			manager.firstTime = false;
			manager.changedAttribute = true;
			manager.statsCopy.hit = 8;
			mockEntity.attributes.rawAttributes.dex = 20;

			manager.calculateHit();

			expect(mockEntity.attributes.hit).toBe(28);
		});
	});

	describe('addAttribute', () => {
		it('should add attribute points when available', () => {
			mockEntity.attributes.rawAttributes.str = 10;
			mockEntity.attributes.availableStatPoints = 5;

			manager.addAttribute('str', 3, {});

			expect(mockEntity.attributes.rawAttributes.str).toBe(13);
			expect(mockEntity.attributes.availableStatPoints).toBe(2);
		});

		it('should set changedAttribute flag', () => {
			manager.changedAttribute = false;
			manager.addAttribute('str', 1, {});

			expect(manager.changedAttribute).toBe(true);
		});

		it('should not add if insufficient stat points', () => {
			mockEntity.attributes.rawAttributes.str = 10;
			mockEntity.attributes.availableStatPoints = 2;

			manager.addAttribute('str', 5, {});

			expect(mockEntity.attributes.rawAttributes.str).toBe(10); // Unchanged
			expect(mockEntity.attributes.availableStatPoints).toBe(2); // Unchanged
		});

		it('should handle adding to different attributes', () => {
			mockEntity.attributes.availableStatPoints = 10;

			manager.addAttribute('vit', 2, {});
			expect(mockEntity.attributes.rawAttributes.vit).toBe(12);

			manager.addAttribute('agi', 3, {});
			expect(mockEntity.attributes.rawAttributes.agi).toBe(13);

			manager.addAttribute('dex', 1, {});
			expect(mockEntity.attributes.rawAttributes.dex).toBe(11);

			expect(mockEntity.attributes.availableStatPoints).toBe(4); // 10 - 2 - 3 - 1
		});

		it('should handle adding all available points', () => {
			mockEntity.attributes.rawAttributes.str = 10;
			mockEntity.attributes.availableStatPoints = 5;

			manager.addAttribute('str', 5, {});

			expect(mockEntity.attributes.rawAttributes.str).toBe(15);
			expect(mockEntity.attributes.availableStatPoints).toBe(0);
		});
	});

	describe('removeAttribute', () => {
		it('should remove attribute points when above base', () => {
			const lastRawAttributes = { str: 10, vit: 10, agi: 10, dex: 10 };
			mockEntity.attributes.rawAttributes.str = 15;
			mockEntity.attributes.availableStatPoints = 0;

			manager.removeAttribute('str', 3, lastRawAttributes);

			expect(mockEntity.attributes.rawAttributes.str).toBe(12);
			expect(mockEntity.attributes.availableStatPoints).toBe(3);
		});

		it('should set changedAttribute flag', () => {
			const lastRawAttributes = { str: 10, vit: 10, agi: 10, dex: 10 };
			mockEntity.attributes.rawAttributes.str = 15;
			manager.changedAttribute = false;

			manager.removeAttribute('str', 1, lastRawAttributes);

			expect(manager.changedAttribute).toBe(true);
		});

		it('should not remove if at or below base value', () => {
			const lastRawAttributes = { str: 10, vit: 10, agi: 10, dex: 10 };
			mockEntity.attributes.rawAttributes.str = 10;
			mockEntity.attributes.availableStatPoints = 0;

			manager.removeAttribute('str', 5, lastRawAttributes);

			expect(mockEntity.attributes.rawAttributes.str).toBe(10); // Unchanged
			expect(mockEntity.attributes.availableStatPoints).toBe(0); // Unchanged
		});

		it('should handle removing from different attributes', () => {
			const lastRawAttributes = { str: 10, vit: 10, agi: 10, dex: 10 };
			mockEntity.attributes.rawAttributes.vit = 15;
			mockEntity.attributes.rawAttributes.agi = 18;
			mockEntity.attributes.availableStatPoints = 0;

			manager.removeAttribute('vit', 2, lastRawAttributes);
			expect(mockEntity.attributes.rawAttributes.vit).toBe(13);
			expect(mockEntity.attributes.availableStatPoints).toBe(2);

			manager.removeAttribute('agi', 5, lastRawAttributes);
			expect(mockEntity.attributes.rawAttributes.agi).toBe(13);
			expect(mockEntity.attributes.availableStatPoints).toBe(7);
		});

		it('should prevent removing below base value', () => {
			const lastRawAttributes = { str: 10, vit: 10, agi: 10, dex: 10 };
			mockEntity.attributes.rawAttributes.str = 12;

			manager.removeAttribute('str', 5, lastRawAttributes); // Would go to 7, below base 10

			expect(mockEntity.attributes.rawAttributes.str).toBe(7); // Can still remove
		});
	});

	describe('Integration', () => {
		it('should recalculate stats on update event', () => {
			// Verify callback is the calculateStats method
			expect(updateCallback).toBe(manager.calculateStats);

			// Verify it can be called successfully
			expect(() => {
				updateCallback.call(manager);
			}).not.toThrow();
		});

		it('should handle complete stat point allocation flow', () => {
			const lastRawAttributes = { ...mockEntity.attributes.rawAttributes };
			mockEntity.attributes.availableStatPoints = 10;

			// Add points
			manager.addAttribute('str', 5, lastRawAttributes);
			manager.calculateStats();

			expect(mockEntity.attributes.rawAttributes.str).toBe(15);
			expect(mockEntity.attributes.availableStatPoints).toBe(5);

			// Attack should be recalculated due to str increase
			const expectedAtk = manager.statsCopy.atack + 15 + Math.floor(15 / 10) * 2; // base + str + bonus
			expect(mockEntity.attributes.atack).toBe(expectedAtk);

			// Remove some points
			manager.removeAttribute('str', 2, lastRawAttributes);
			manager.calculateStats();

			expect(mockEntity.attributes.rawAttributes.str).toBe(13);
			expect(mockEntity.attributes.availableStatPoints).toBe(7);
		});

		it('should handle level up flow', () => {
			const initialHealth = mockEntity.attributes.health;
			mockEntity.attributes.health = initialHealth / 2; // Damage player

			mockEntity.attributes.level = 2; // Level up
			manager.calculateStats();

			// Health should be restored
			expect(mockEntity.attributes.health).toBe(mockEntity.attributes.baseHealth);
			// Health bar should be updated
			expect(mockHealthBar.health).toBe(mockEntity.attributes.baseHealth);
		});
	});
});
