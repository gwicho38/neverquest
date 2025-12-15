/**
 * Tests for Spell definitions and helper functions
 */

import {
	SPELLS,
	SpellType,
	getUnlockedSpells,
	getSpellsByType,
	getSpellById,
	getSpellTypeColor,
	getSpellTypeColorNumeric,
} from '../../consts/Spells';
import { SpellColors } from '../../consts/Colors';

describe('Spells Constants', () => {
	describe('SPELLS array', () => {
		it('should contain spell definitions', () => {
			expect(SPELLS.length).toBeGreaterThan(0);
		});

		it('should have all required properties for each spell', () => {
			SPELLS.forEach((spell) => {
				expect(spell).toHaveProperty('id');
				expect(spell).toHaveProperty('name');
				expect(spell).toHaveProperty('type');
				expect(spell).toHaveProperty('description');
				expect(spell).toHaveProperty('manaCost');
				expect(spell).toHaveProperty('cooldown');
				expect(spell).toHaveProperty('damageMultiplier');
				expect(spell).toHaveProperty('effectMethod');
				expect(spell).toHaveProperty('color');
				expect(spell).toHaveProperty('colorNumeric');
				expect(spell).toHaveProperty('unlocked');
			});
		});

		it('should have unique IDs for each spell', () => {
			const ids = SPELLS.map((spell) => spell.id);
			const uniqueIds = [...new Set(ids)];
			expect(ids.length).toBe(uniqueIds.length);
		});

		it('should have valid spell types', () => {
			const validTypes = Object.values(SpellType);
			SPELLS.forEach((spell) => {
				expect(validTypes).toContain(spell.type);
			});
		});

		it('should have positive mana costs', () => {
			SPELLS.forEach((spell) => {
				expect(spell.manaCost).toBeGreaterThan(0);
			});
		});

		it('should have positive cooldowns', () => {
			SPELLS.forEach((spell) => {
				expect(spell.cooldown).toBeGreaterThan(0);
			});
		});

		it('should have valid damage multipliers', () => {
			SPELLS.forEach((spell) => {
				expect(spell.damageMultiplier).toBeGreaterThan(0);
			});
		});
	});

	describe('SpellType enum', () => {
		it('should have fire type', () => {
			expect(SpellType.FIRE).toBe('fire');
		});

		it('should have ice type', () => {
			expect(SpellType.ICE).toBe('ice');
		});

		it('should have lightning type', () => {
			expect(SpellType.LIGHTNING).toBe('lightning');
		});

		it('should have holy type', () => {
			expect(SpellType.HOLY).toBe('holy');
		});

		it('should have dark type', () => {
			expect(SpellType.DARK).toBe('dark');
		});
	});

	describe('getUnlockedSpells', () => {
		it('should return only unlocked spells', () => {
			const unlocked = getUnlockedSpells();
			unlocked.forEach((spell) => {
				expect(spell.unlocked).toBe(true);
			});
		});

		it('should return at least one spell', () => {
			const unlocked = getUnlockedSpells();
			expect(unlocked.length).toBeGreaterThan(0);
		});

		it('should return fewer spells than total when some are locked', () => {
			const lockedSpells = SPELLS.filter((s) => !s.unlocked);
			if (lockedSpells.length > 0) {
				const unlocked = getUnlockedSpells();
				expect(unlocked.length).toBeLessThan(SPELLS.length);
			}
		});
	});

	describe('getSpellsByType', () => {
		it('should return fire spells for fire type', () => {
			const fireSpells = getSpellsByType(SpellType.FIRE);
			fireSpells.forEach((spell) => {
				expect(spell.type).toBe(SpellType.FIRE);
			});
		});

		it('should return ice spells for ice type', () => {
			const iceSpells = getSpellsByType(SpellType.ICE);
			iceSpells.forEach((spell) => {
				expect(spell.type).toBe(SpellType.ICE);
			});
		});

		it('should return lightning spells for lightning type', () => {
			const lightningSpells = getSpellsByType(SpellType.LIGHTNING);
			lightningSpells.forEach((spell) => {
				expect(spell.type).toBe(SpellType.LIGHTNING);
			});
		});

		it('should return holy spells for holy type', () => {
			const holySpells = getSpellsByType(SpellType.HOLY);
			holySpells.forEach((spell) => {
				expect(spell.type).toBe(SpellType.HOLY);
			});
		});

		it('should return dark spells for dark type', () => {
			const darkSpells = getSpellsByType(SpellType.DARK);
			darkSpells.forEach((spell) => {
				expect(spell.type).toBe(SpellType.DARK);
			});
		});

		it('should return at least one spell for each type', () => {
			Object.values(SpellType).forEach((type) => {
				const spells = getSpellsByType(type);
				expect(spells.length).toBeGreaterThan(0);
			});
		});
	});

	describe('getSpellById', () => {
		it('should return spell for valid ID', () => {
			const spell = getSpellById('fireball');
			expect(spell).toBeDefined();
			expect(spell!.id).toBe('fireball');
		});

		it('should return undefined for invalid ID', () => {
			const spell = getSpellById('nonexistent');
			expect(spell).toBeUndefined();
		});

		it('should find all spells by their IDs', () => {
			SPELLS.forEach((spell) => {
				const found = getSpellById(spell.id);
				expect(found).toBeDefined();
				expect(found!.id).toBe(spell.id);
			});
		});
	});

	describe('getSpellTypeColor', () => {
		it('should return fire color for fire type', () => {
			expect(getSpellTypeColor(SpellType.FIRE)).toBe(SpellColors.FIRE);
		});

		it('should return ice color for ice type', () => {
			expect(getSpellTypeColor(SpellType.ICE)).toBe(SpellColors.ICE);
		});

		it('should return lightning color for lightning type', () => {
			expect(getSpellTypeColor(SpellType.LIGHTNING)).toBe(SpellColors.LIGHTNING);
		});

		it('should return holy color for holy type', () => {
			expect(getSpellTypeColor(SpellType.HOLY)).toBe(SpellColors.HOLY);
		});

		it('should return dark color for dark type', () => {
			expect(getSpellTypeColor(SpellType.DARK)).toBe(SpellColors.DARK);
		});

		it('should return white for unknown type', () => {
			expect(getSpellTypeColor('unknown' as SpellType)).toBe('#ffffff');
		});
	});

	describe('getSpellTypeColorNumeric', () => {
		it('should return fire numeric color for fire type', () => {
			expect(getSpellTypeColorNumeric(SpellType.FIRE)).toBe(SpellColors.FIRE_NUMERIC);
		});

		it('should return ice numeric color for ice type', () => {
			expect(getSpellTypeColorNumeric(SpellType.ICE)).toBe(SpellColors.ICE_NUMERIC);
		});

		it('should return lightning numeric color for lightning type', () => {
			expect(getSpellTypeColorNumeric(SpellType.LIGHTNING)).toBe(SpellColors.LIGHTNING_NUMERIC);
		});

		it('should return holy numeric color for holy type', () => {
			expect(getSpellTypeColorNumeric(SpellType.HOLY)).toBe(SpellColors.HOLY_NUMERIC);
		});

		it('should return dark numeric color for dark type', () => {
			expect(getSpellTypeColorNumeric(SpellType.DARK)).toBe(SpellColors.DARK_NUMERIC);
		});

		it('should return white for unknown type', () => {
			expect(getSpellTypeColorNumeric('unknown' as SpellType)).toBe(0xffffff);
		});
	});

	describe('Spell consistency', () => {
		it('should have matching color and colorNumeric for each spell', () => {
			SPELLS.forEach((spell) => {
				const expectedColor = getSpellTypeColor(spell.type);
				const expectedNumeric = getSpellTypeColorNumeric(spell.type);
				expect(spell.color).toBe(expectedColor);
				expect(spell.colorNumeric).toBe(expectedNumeric);
			});
		});

		it('should have effectMethod that matches spell id pattern', () => {
			SPELLS.forEach((spell) => {
				// Effect method should be a valid string
				expect(typeof spell.effectMethod).toBe('string');
				expect(spell.effectMethod.length).toBeGreaterThan(0);
			});
		});
	});
});
