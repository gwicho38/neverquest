import {
	EntityAttributes,
	IEntityAttributes,
	IRawAttributes,
	IBonusAttributes,
	IEquipmentBonus,
	IConsumableBonus,
	IExtraBonus,
} from '../../entities/EntityAttributes';

describe('EntityAttributes', () => {
	describe('Default EntityAttributes Object', () => {
		it('should have correct default level', () => {
			expect(EntityAttributes.level).toBe(1);
		});

		it('should have default raw attributes', () => {
			expect(EntityAttributes.rawAttributes).toEqual({
				str: 1,
				agi: 1,
				vit: 1,
				dex: 1,
				int: 1,
			});
		});

		it('should have available stat points', () => {
			expect(EntityAttributes.availableStatPoints).toBe(2);
		});

		it('should have empty bonus arrays', () => {
			expect(EntityAttributes.bonus.equipment).toEqual([]);
			expect(EntityAttributes.bonus.consumable).toEqual([]);
			expect(EntityAttributes.bonus.extra).toEqual([]);
		});

		it('should have correct health values', () => {
			expect(EntityAttributes.health).toBe(10);
			expect(EntityAttributes.maxHealth).toBe(10);
			expect(EntityAttributes.baseHealth).toBe(10);
		});

		it('should have combat attributes', () => {
			expect(EntityAttributes.atack).toBe(4);
			expect(EntityAttributes.defense).toBe(1);
			expect(EntityAttributes.critical).toBe(0);
		});

		it('should have accuracy attributes', () => {
			expect(EntityAttributes.flee).toBe(1);
			expect(EntityAttributes.hit).toBe(1);
		});

		it('should have experience attributes', () => {
			expect(EntityAttributes.experience).toBe(0);
			expect(EntityAttributes.nextLevelExperience).toBe(50);
		});

		it('should have movement speed', () => {
			expect(EntityAttributes.speed).toBe(50);
		});
	});

	describe('IRawAttributes Interface', () => {
		it('should allow standard attributes', () => {
			const rawAttrs: IRawAttributes = {
				str: 10,
				agi: 8,
				vit: 12,
				dex: 7,
				int: 9,
			};

			expect(rawAttrs.str).toBe(10);
			expect(rawAttrs.agi).toBe(8);
			expect(rawAttrs.vit).toBe(12);
			expect(rawAttrs.dex).toBe(7);
			expect(rawAttrs.int).toBe(9);
		});

		it('should support index signature for dynamic access', () => {
			const rawAttrs: IRawAttributes = {
				str: 10,
				agi: 8,
				vit: 12,
				dex: 7,
				int: 9,
			};

			const attributeName = 'str';
			expect(rawAttrs[attributeName]).toBe(10);
		});

		it('should allow iteration over attributes', () => {
			const rawAttrs: IRawAttributes = {
				str: 10,
				agi: 8,
				vit: 12,
				dex: 7,
				int: 9,
			};

			const keys = Object.keys(rawAttrs);
			expect(keys).toContain('str');
			expect(keys).toContain('agi');
			expect(keys).toContain('vit');
			expect(keys).toContain('dex');
			expect(keys).toContain('int');
		});

		it('should allow updating attributes dynamically', () => {
			const rawAttrs: IRawAttributes = {
				str: 10,
				agi: 8,
				vit: 12,
				dex: 7,
				int: 9,
			};

			rawAttrs['str'] = 15;
			expect(rawAttrs.str).toBe(15);
		});
	});

	describe('IBonusAttributes Interface', () => {
		it('should have equipment bonuses array', () => {
			const bonus: IBonusAttributes = {
				equipment: [],
				consumable: [],
				extra: [],
			};

			expect(Array.isArray(bonus.equipment)).toBe(true);
		});

		it('should allow adding equipment bonuses', () => {
			const equipmentBonus: IEquipmentBonus = { item: 'sword', atk: 5 };
			const bonus: IBonusAttributes = {
				equipment: [equipmentBonus],
				consumable: [],
				extra: [],
			};

			expect(bonus.equipment).toHaveLength(1);
			expect(bonus.equipment[0].atk).toBe(5);
		});

		it('should allow adding consumable bonuses', () => {
			const consumableBonus: IConsumableBonus = {
				uniqueId: 1,
				statBonus: 'health',
				value: 10,
				time: 60,
			};
			const bonus: IBonusAttributes = {
				equipment: [],
				consumable: [consumableBonus],
				extra: [],
			};

			expect(bonus.consumable).toHaveLength(1);
			expect(bonus.consumable[0].value).toBe(10);
			expect(bonus.consumable[0].statBonus).toBe('health');
		});

		it('should allow adding extra bonuses', () => {
			const extraBonus: IExtraBonus = { def: 3, source: 'buff' };
			const bonus: IBonusAttributes = {
				equipment: [],
				consumable: [],
				extra: [extraBonus],
			};

			expect(bonus.extra).toHaveLength(1);
			expect(bonus.extra[0].def).toBe(3);
		});
	});

	describe('IEntityAttributes Interface', () => {
		it('should allow creating custom entity attributes', () => {
			const customAttrs: IEntityAttributes = {
				level: 5,
				rawAttributes: {
					str: 15,
					agi: 12,
					vit: 18,
					dex: 10,
					int: 8,
				},
				availableStatPoints: 10,
				bonus: {
					equipment: [],
					consumable: [],
					extra: [],
				},
				health: 50,
				maxHealth: 60,
				baseHealth: 50,
				atack: 20,
				defense: 10,
				speed: 100,
				critical: 5,
				flee: 8,
				hit: 12,
				experience: 500,
				nextLevelExperience: 1000,
			};

			expect(customAttrs.level).toBe(5);
			expect(customAttrs.rawAttributes.str).toBe(15);
			expect(customAttrs.health).toBe(50);
		});

		it('should support copying and modifying attributes', () => {
			const attrs: IEntityAttributes = { ...EntityAttributes };

			attrs.level = 10;
			attrs.health = 100;

			expect(attrs.level).toBe(10);
			expect(attrs.health).toBe(100);
			// Original should not be modified
			expect(EntityAttributes.level).toBe(1);
		});

		it('should allow deep cloning of attributes', () => {
			const attrs: IEntityAttributes = JSON.parse(JSON.stringify(EntityAttributes));

			attrs.rawAttributes.str = 20;
			attrs.bonus.equipment.push({ item: 'sword' });

			expect(attrs.rawAttributes.str).toBe(20);
			expect(attrs.bonus.equipment).toHaveLength(1);
			// Original should not be modified
			expect(EntityAttributes.rawAttributes.str).toBe(1);
			expect(EntityAttributes.bonus.equipment).toHaveLength(0);
		});
	});

	describe('Attribute Calculations', () => {
		it('should support health within max health bounds', () => {
			const attrs: IEntityAttributes = { ...EntityAttributes };

			attrs.health = 5;
			attrs.maxHealth = 20;

			expect(attrs.health).toBeLessThanOrEqual(attrs.maxHealth);
		});

		it('should support experience progression', () => {
			const attrs: IEntityAttributes = { ...EntityAttributes };

			attrs.experience = 45;
			attrs.nextLevelExperience = 50;

			expect(attrs.experience).toBeLessThan(attrs.nextLevelExperience);
		});

		it('should support stat point allocation', () => {
			const attrs: IEntityAttributes = { ...EntityAttributes };

			const initialStatPoints = attrs.availableStatPoints;
			attrs.rawAttributes.str += 1;
			attrs.availableStatPoints -= 1;

			expect(attrs.availableStatPoints).toBe(initialStatPoints - 1);
			expect(attrs.rawAttributes.str).toBe(2);
		});
	});

	describe('Edge Cases', () => {
		it('should handle zero values', () => {
			const attrs: IEntityAttributes = {
				...EntityAttributes,
				level: 0,
				health: 0,
				experience: 0,
			};

			expect(attrs.level).toBe(0);
			expect(attrs.health).toBe(0);
			expect(attrs.experience).toBe(0);
		});

		it('should handle negative values for debuffs', () => {
			const attrs: IEntityAttributes = JSON.parse(JSON.stringify(EntityAttributes));

			attrs.bonus.equipment.push({ atk: -5 });

			expect(attrs.bonus.equipment[0].atk).toBe(-5);
		});

		it('should handle large attribute values', () => {
			const attrs: IEntityAttributes = {
				...EntityAttributes,
				rawAttributes: {
					str: 999,
					agi: 999,
					vit: 999,
					dex: 999,
					int: 999,
				},
			};

			expect(attrs.rawAttributes.str).toBe(999);
		});

		it('should handle multiple bonus types simultaneously', () => {
			const attrs: IEntityAttributes = JSON.parse(JSON.stringify(EntityAttributes));

			const equipmentBonus: IEquipmentBonus = { atk: 5 };
			const consumableBonus: IConsumableBonus = { uniqueId: 1, statBonus: 'atack', value: 3, time: 60 };
			const extraBonus: IExtraBonus = { atk: 2 };

			attrs.bonus.equipment.push(equipmentBonus);
			attrs.bonus.consumable.push(consumableBonus);
			attrs.bonus.extra.push(extraBonus);

			expect(attrs.bonus.equipment).toHaveLength(1);
			expect(attrs.bonus.consumable).toHaveLength(1);
			expect(attrs.bonus.extra).toHaveLength(1);
		});
	});

	describe('Type Safety', () => {
		it('should enforce number types for raw attributes', () => {
			const rawAttrs: IRawAttributes = {
				str: 10,
				agi: 8,
				vit: 12,
				dex: 7,
				int: 9,
			};

			// Type system ensures these are numbers
			expect(typeof rawAttrs.str).toBe('number');
			expect(typeof rawAttrs.agi).toBe('number');
			expect(typeof rawAttrs.vit).toBe('number');
			expect(typeof rawAttrs.dex).toBe('number');
			expect(typeof rawAttrs.int).toBe('number');
		});

		it('should enforce correct structure for entity attributes', () => {
			const attrs: IEntityAttributes = { ...EntityAttributes };

			expect(attrs).toHaveProperty('level');
			expect(attrs).toHaveProperty('rawAttributes');
			expect(attrs).toHaveProperty('bonus');
			expect(attrs).toHaveProperty('health');
			expect(attrs).toHaveProperty('maxHealth');
			expect(attrs).toHaveProperty('atack');
			expect(attrs).toHaveProperty('defense');
		});
	});
});
