import {
	EquipmentSlot,
	EquipmentTier,
	EquipmentDefinition,
	STARTER_EQUIPMENT,
	UPGRADED_EQUIPMENT,
	LEGENDARY_EQUIPMENT,
	ALL_EQUIPMENT,
	getEquipmentByTier,
	getEquipmentBySlot,
	getEquipmentById,
	getEquipmentByDropSource,
	calculateTotalStats,
	TIER_NAMES,
	TIER_COLORS,
} from '../../../consts/equipment/EquipmentTiers';
import { StoryFlag } from '../../../plugins/NeverquestStoryFlags';

describe('EquipmentTiers', () => {
	describe('EquipmentSlot enum', () => {
		it('should have all equipment slot types', () => {
			expect(EquipmentSlot.WEAPON).toBe('weapon');
			expect(EquipmentSlot.ARMOR).toBe('armor');
			expect(EquipmentSlot.HELMET).toBe('helmet');
			expect(EquipmentSlot.SHIELD).toBe('shield');
			expect(EquipmentSlot.ACCESSORY).toBe('accessory');
		});

		it('should have 5 slot types', () => {
			const slots = Object.values(EquipmentSlot);
			expect(slots).toHaveLength(5);
		});
	});

	describe('EquipmentTier enum', () => {
		it('should have 3 tiers matching acts', () => {
			expect(EquipmentTier.STARTER).toBe(1);
			expect(EquipmentTier.UPGRADED).toBe(2);
			expect(EquipmentTier.LEGENDARY).toBe(3);
		});
	});

	describe('STARTER_EQUIPMENT', () => {
		it('should have 5 starter items', () => {
			expect(STARTER_EQUIPMENT).toHaveLength(5);
		});

		it('should all be tier 1', () => {
			STARTER_EQUIPMENT.forEach((eq) => {
				expect(eq.tier).toBe(EquipmentTier.STARTER);
			});
		});

		it('should cover all slot types', () => {
			const slots = STARTER_EQUIPMENT.map((eq) => eq.slot);
			expect(slots).toContain(EquipmentSlot.WEAPON);
			expect(slots).toContain(EquipmentSlot.ARMOR);
			expect(slots).toContain(EquipmentSlot.HELMET);
			expect(slots).toContain(EquipmentSlot.SHIELD);
			expect(slots).toContain(EquipmentSlot.ACCESSORY);
		});

		it('should have required properties', () => {
			STARTER_EQUIPMENT.forEach((eq) => {
				expect(eq.id).toBeDefined();
				expect(eq.name).toBeDefined();
				expect(eq.description).toBeDefined();
				expect(eq.slot).toBeDefined();
				expect(eq.tier).toBeDefined();
				expect(eq.stats).toBeDefined();
				expect(eq.texture).toBeDefined();
			});
		});

		it('should have no unlock requirements', () => {
			STARTER_EQUIPMENT.forEach((eq) => {
				expect(eq.unlockRequirement).toBeUndefined();
			});
		});

		it('should have wooden sword as first weapon', () => {
			const woodenSword = STARTER_EQUIPMENT.find((eq) => eq.id === 'woodenSword');
			expect(woodenSword).toBeDefined();
			expect(woodenSword?.name).toBe('Wooden Sword');
			expect(woodenSword?.stats.attack).toBe(3);
		});
	});

	describe('UPGRADED_EQUIPMENT', () => {
		it('should have 8 upgraded items', () => {
			expect(UPGRADED_EQUIPMENT).toHaveLength(8);
		});

		it('should all be tier 2', () => {
			UPGRADED_EQUIPMENT.forEach((eq) => {
				expect(eq.tier).toBe(EquipmentTier.UPGRADED);
			});
		});

		it('should have drop sources', () => {
			UPGRADED_EQUIPMENT.forEach((eq) => {
				expect(eq.dropSource).toBeDefined();
			});
		});

		it('should drop from Ancient Ruins or Forgotten Temple', () => {
			UPGRADED_EQUIPMENT.forEach((eq) => {
				expect(['Ancient Ruins', 'Forgotten Temple']).toContain(eq.dropSource);
			});
		});

		it('should have some items with unlock requirements', () => {
			const itemsWithRequirements = UPGRADED_EQUIPMENT.filter((eq) => eq.unlockRequirement);
			expect(itemsWithRequirements.length).toBeGreaterThan(0);
		});

		it('should have frost axe requiring frost nova unlock', () => {
			const frostAxe = UPGRADED_EQUIPMENT.find((eq) => eq.id === 'frostAxe');
			expect(frostAxe).toBeDefined();
			expect(frostAxe?.unlockRequirement).toBe(StoryFlag.SPELL_FROST_NOVA_UNLOCKED);
		});
	});

	describe('LEGENDARY_EQUIPMENT', () => {
		it('should have 9 legendary items', () => {
			expect(LEGENDARY_EQUIPMENT).toHaveLength(9);
		});

		it('should all be tier 3', () => {
			LEGENDARY_EQUIPMENT.forEach((eq) => {
				expect(eq.tier).toBe(EquipmentTier.LEGENDARY);
			});
		});

		it('should drop from bosses', () => {
			LEGENDARY_EQUIPMENT.forEach((eq) => {
				expect(['Shadow Guardian', 'Void King']).toContain(eq.dropSource);
			});
		});

		it('should have higher stats than lower tiers', () => {
			const starterAttack = STARTER_EQUIPMENT.find((eq) => eq.slot === EquipmentSlot.WEAPON)?.stats.attack || 0;
			const legendaryAttack =
				LEGENDARY_EQUIPMENT.find((eq) => eq.slot === EquipmentSlot.WEAPON)?.stats.attack || 0;
			expect(legendaryAttack).toBeGreaterThan(starterAttack);
		});

		it('should have void slayer as top weapon', () => {
			const voidSlayer = LEGENDARY_EQUIPMENT.find((eq) => eq.id === 'voidSlayer');
			expect(voidSlayer).toBeDefined();
			expect(voidSlayer?.name).toBe('Void Slayer');
			expect(voidSlayer?.stats.attack).toBe(20);
			expect(voidSlayer?.stats.critChance).toBe(15);
		});

		it('should have some items requiring Act 3 completion', () => {
			const act3Items = LEGENDARY_EQUIPMENT.filter((eq) => eq.unlockRequirement === StoryFlag.COMPLETED_ACT_3);
			expect(act3Items.length).toBeGreaterThan(0);
		});
	});

	describe('ALL_EQUIPMENT', () => {
		it('should combine all equipment', () => {
			const expectedLength = STARTER_EQUIPMENT.length + UPGRADED_EQUIPMENT.length + LEGENDARY_EQUIPMENT.length;
			expect(ALL_EQUIPMENT).toHaveLength(expectedLength);
		});

		it('should have unique IDs', () => {
			const ids = ALL_EQUIPMENT.map((eq) => eq.id);
			const uniqueIds = new Set(ids);
			expect(uniqueIds.size).toBe(ids.length);
		});

		it('should have all tiers represented', () => {
			const tiers = new Set(ALL_EQUIPMENT.map((eq) => eq.tier));
			expect(tiers.has(EquipmentTier.STARTER)).toBe(true);
			expect(tiers.has(EquipmentTier.UPGRADED)).toBe(true);
			expect(tiers.has(EquipmentTier.LEGENDARY)).toBe(true);
		});
	});

	describe('getEquipmentByTier', () => {
		it('should return starter equipment for tier 1', () => {
			const result = getEquipmentByTier(EquipmentTier.STARTER);
			expect(result).toEqual(STARTER_EQUIPMENT);
		});

		it('should return upgraded equipment for tier 2', () => {
			const result = getEquipmentByTier(EquipmentTier.UPGRADED);
			expect(result).toEqual(UPGRADED_EQUIPMENT);
		});

		it('should return legendary equipment for tier 3', () => {
			const result = getEquipmentByTier(EquipmentTier.LEGENDARY);
			expect(result).toEqual(LEGENDARY_EQUIPMENT);
		});
	});

	describe('getEquipmentBySlot', () => {
		it('should return all weapons', () => {
			const weapons = getEquipmentBySlot(EquipmentSlot.WEAPON);
			expect(weapons.length).toBeGreaterThan(0);
			weapons.forEach((eq) => {
				expect(eq.slot).toBe(EquipmentSlot.WEAPON);
			});
		});

		it('should return all armor', () => {
			const armor = getEquipmentBySlot(EquipmentSlot.ARMOR);
			expect(armor.length).toBeGreaterThan(0);
			armor.forEach((eq) => {
				expect(eq.slot).toBe(EquipmentSlot.ARMOR);
			});
		});

		it('should return all accessories', () => {
			const accessories = getEquipmentBySlot(EquipmentSlot.ACCESSORY);
			expect(accessories.length).toBeGreaterThan(0);
			accessories.forEach((eq) => {
				expect(eq.slot).toBe(EquipmentSlot.ACCESSORY);
			});
		});
	});

	describe('getEquipmentById', () => {
		it('should find equipment by ID', () => {
			const woodenSword = getEquipmentById('woodenSword');
			expect(woodenSword).toBeDefined();
			expect(woodenSword?.name).toBe('Wooden Sword');
		});

		it('should return undefined for unknown ID', () => {
			const unknown = getEquipmentById('unknownItem');
			expect(unknown).toBeUndefined();
		});

		it('should find legendary equipment', () => {
			const voidSlayer = getEquipmentById('voidSlayer');
			expect(voidSlayer).toBeDefined();
			expect(voidSlayer?.tier).toBe(EquipmentTier.LEGENDARY);
		});
	});

	describe('getEquipmentByDropSource', () => {
		it('should find equipment from Ancient Ruins', () => {
			const ruinsLoot = getEquipmentByDropSource('Ancient Ruins');
			expect(ruinsLoot.length).toBeGreaterThan(0);
			ruinsLoot.forEach((eq) => {
				expect(eq.dropSource).toBe('Ancient Ruins');
			});
		});

		it('should find equipment from Void King', () => {
			const voidKingLoot = getEquipmentByDropSource('Void King');
			expect(voidKingLoot.length).toBeGreaterThan(0);
			voidKingLoot.forEach((eq) => {
				expect(eq.dropSource).toBe('Void King');
			});
		});

		it('should return empty array for unknown source', () => {
			const unknown = getEquipmentByDropSource('Unknown Dungeon');
			expect(unknown).toHaveLength(0);
		});
	});

	describe('calculateTotalStats', () => {
		it('should calculate combined stats', () => {
			const equipment = [
				{ stats: { attack: 5, defense: 3 } } as EquipmentDefinition,
				{ stats: { attack: 3, health: 10 } } as EquipmentDefinition,
			];

			const total = calculateTotalStats(equipment);

			expect(total.attack).toBe(8);
			expect(total.defense).toBe(3);
			expect(total.health).toBe(10);
		});

		it('should handle empty array', () => {
			const total = calculateTotalStats([]);
			expect(total).toEqual({});
		});

		it('should handle negative stats', () => {
			const equipment = [
				{ stats: { attack: 18, health: -10 } } as EquipmentDefinition, // Shadow Reaper
			];

			const total = calculateTotalStats(equipment);

			expect(total.attack).toBe(18);
			expect(total.health).toBe(-10);
		});

		it('should calculate full loadout stats', () => {
			// Full starter set
			const total = calculateTotalStats(STARTER_EQUIPMENT);

			expect(total.attack).toBeGreaterThan(0);
			expect(total.defense).toBeGreaterThan(0);
			expect(total.health).toBeGreaterThan(0);
		});

		it('should show legendary set has higher stats than starter', () => {
			const starterTotal = calculateTotalStats(STARTER_EQUIPMENT);
			const legendaryTotal = calculateTotalStats(LEGENDARY_EQUIPMENT);

			// Compare attack power (ignoring Shadow Reaper's health penalty)
			expect(legendaryTotal.attack!).toBeGreaterThan(starterTotal.attack!);
		});
	});

	describe('TIER_NAMES', () => {
		it('should have display names for all tiers', () => {
			expect(TIER_NAMES[EquipmentTier.STARTER]).toBe('Common');
			expect(TIER_NAMES[EquipmentTier.UPGRADED]).toBe('Rare');
			expect(TIER_NAMES[EquipmentTier.LEGENDARY]).toBe('Legendary');
		});
	});

	describe('TIER_COLORS', () => {
		it('should have colors for all tiers', () => {
			expect(TIER_COLORS[EquipmentTier.STARTER]).toBe('FFFFFF');
			expect(TIER_COLORS[EquipmentTier.UPGRADED]).toBe('4169E1');
			expect(TIER_COLORS[EquipmentTier.LEGENDARY]).toBe('FFD700');
		});

		it('should be valid hex color codes', () => {
			const hexRegex = /^[0-9A-Fa-f]{6}$/;
			Object.values(TIER_COLORS).forEach((color) => {
				expect(color).toMatch(hexRegex);
			});
		});
	});

	describe('Equipment balance', () => {
		it('should have progressive attack values across tiers', () => {
			const starterWeapon = STARTER_EQUIPMENT.find((eq) => eq.slot === EquipmentSlot.WEAPON);
			const upgradedWeapon = UPGRADED_EQUIPMENT.find((eq) => eq.slot === EquipmentSlot.WEAPON);
			const legendaryWeapon = LEGENDARY_EQUIPMENT.find((eq) => eq.slot === EquipmentSlot.WEAPON);

			expect(upgradedWeapon!.stats.attack!).toBeGreaterThan(starterWeapon!.stats.attack!);
			expect(legendaryWeapon!.stats.attack!).toBeGreaterThan(upgradedWeapon!.stats.attack!);
		});

		it('should have progressive defense values across tiers', () => {
			const starterArmor = STARTER_EQUIPMENT.find((eq) => eq.slot === EquipmentSlot.ARMOR);
			const upgradedArmor = UPGRADED_EQUIPMENT.find((eq) => eq.slot === EquipmentSlot.ARMOR);
			const legendaryArmor = LEGENDARY_EQUIPMENT.find((eq) => eq.slot === EquipmentSlot.ARMOR);

			expect(upgradedArmor!.stats.defense!).toBeGreaterThan(starterArmor!.stats.defense!);
			expect(legendaryArmor!.stats.defense!).toBeGreaterThan(upgradedArmor!.stats.defense!);
		});

		it('should have reasonable stat totals for full sets', () => {
			const starterTotal = calculateTotalStats(STARTER_EQUIPMENT);
			const legendaryTotal = calculateTotalStats(LEGENDARY_EQUIPMENT);

			// Legendary should be about 5-6x more powerful
			const ratio = legendaryTotal.attack! / starterTotal.attack!;
			expect(ratio).toBeGreaterThanOrEqual(5);
			expect(ratio).toBeLessThanOrEqual(30);
		});
	});
});
