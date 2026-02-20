/**
 * Tests for DB_SEED_ITEMS
 *
 * Validates all item definitions including:
 * - Required field presence and types
 * - Unique IDs across all items
 * - Valid item types and scripts
 * - Enemy drop references resolve to existing items
 */

import { DB_SEED_ITEMS } from '../../../consts/DB_SEED/Items';
import { ITEM_TYPE } from '../../../consts/DB_SEED/ItemTypes';

describe('DB_SEED_ITEMS', () => {
	it('should export an array of item configurations', () => {
		expect(Array.isArray(DB_SEED_ITEMS)).toBe(true);
		expect(DB_SEED_ITEMS.length).toBe(13);
	});

	it('should have all items with valid structure', () => {
		DB_SEED_ITEMS.forEach((item) => {
			expect(item).toHaveProperty('id');
			expect(item).toHaveProperty('name');
			expect(item).toHaveProperty('type');
			expect(item).toHaveProperty('buffType');
			expect(item).toHaveProperty('description');
			expect(item).toHaveProperty('script');
			expect(item).toHaveProperty('texture');
			expect(item).toHaveProperty('sfx');
			expect(item).toHaveProperty('stackable');
			expect(item).toHaveProperty('inventoryScale');
		});
	});

	it('should have unique item IDs', () => {
		const ids = DB_SEED_ITEMS.map((item) => item.id);
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(ids.length);
	});

	it('should have sequential IDs from 1 to 13', () => {
		const ids = DB_SEED_ITEMS.map((item) => item.id).sort((a, b) => a - b);
		for (let i = 0; i < ids.length; i++) {
			expect(ids[i]).toBe(i + 1);
		}
	});

	it('should have valid field types for all items', () => {
		DB_SEED_ITEMS.forEach((item) => {
			expect(typeof item.id).toBe('number');
			expect(typeof item.name).toBe('string');
			expect(item.name.length).toBeGreaterThan(0);
			expect(typeof item.description).toBe('string');
			expect(item.description.length).toBeGreaterThan(0);
			expect(typeof item.script).toBe('string');
			expect(typeof item.texture).toBe('string');
			expect(item.texture.length).toBeGreaterThan(0);
			expect(typeof item.sfx).toBe('string');
			expect(item.sfx.length).toBeGreaterThan(0);
			expect(typeof item.stackable).toBe('boolean');
			expect(typeof item.inventoryScale).toBe('number');
			expect(item.inventoryScale).toBeGreaterThan(0);
		});
	});

	it('should only use valid texture keys', () => {
		const validTextures = ['red_potion', 'atk_potion', 'treasure_chest', 'mighty_sword'];
		DB_SEED_ITEMS.forEach((item) => {
			expect(validTextures).toContain(item.texture);
		});
	});

	it('should only use valid sfx keys', () => {
		const validSfx = ['heal', 'equip_item', 'get_items'];
		DB_SEED_ITEMS.forEach((item) => {
			expect(validSfx).toContain(item.sfx);
		});
	});

	describe('Usable items', () => {
		it('should have non-empty scripts', () => {
			const usableItems = DB_SEED_ITEMS.filter((item) => item.type === ITEM_TYPE.USABLE);
			expect(usableItems.length).toBeGreaterThan(0);
			usableItems.forEach((item) => {
				expect(item.script.length).toBeGreaterThan(0);
				expect(item.script).toMatch(/^(rec|buff)\s/);
			});
		});
	});

	describe('Misc items (crafting materials)', () => {
		it('should have empty scripts', () => {
			const miscItems = DB_SEED_ITEMS.filter((item) => item.type === ITEM_TYPE.MISC);
			expect(miscItems.length).toBeGreaterThan(0);
			miscItems.forEach((item) => {
				expect(item.script).toBe('');
			});
		});

		it('should include all biome-specific materials', () => {
			const miscNames = DB_SEED_ITEMS.filter((item) => item.type === ITEM_TYPE.MISC).map((item) => item.name);
			expect(miscNames).toContain('Ice Shard');
			expect(miscNames).toContain('Yeti Fur');
			expect(miscNames).toContain('Frozen Heart');
			expect(miscNames).toContain('Molten Core');
			expect(miscNames).toContain('Heat Resistance Armor Piece');
			expect(miscNames).toContain('Drake Scale');
			expect(miscNames).toContain('Worm Carapace');
			expect(miscNames).toContain('Dragon Scale');
		});

		it('should have unique boss drops marked as non-stackable', () => {
			const frozenHeart = DB_SEED_ITEMS.find((item) => item.name === 'Frozen Heart');
			const dragonScale = DB_SEED_ITEMS.find((item) => item.name === 'Dragon Scale');
			expect(frozenHeart!.stackable).toBe(false);
			expect(dragonScale!.stackable).toBe(false);
		});
	});

	describe('Enemy drop item references', () => {
		it('should have items for all IDs referenced by enemy drops (IDs 1-13)', () => {
			const itemIds = new Set(DB_SEED_ITEMS.map((item) => item.id));
			for (let id = 1; id <= 13; id++) {
				expect(itemIds.has(id)).toBe(true);
			}
		});
	});
});
