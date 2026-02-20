/**
 * Tests for InventorySorter utility
 */

import {
	InventorySorter,
	sortByName,
	sortByType,
	sortByCount,
	sortById,
	sortItems,
	getNextSortType,
	toggleDirection,
	getSortTypeLabel,
	getDirectionIndicator,
	SortType,
} from '../../utils/InventorySorter';
import { IInventoryItem } from '../../types/ItemTypes';

// Mock DB_SEED_ITEMS
jest.mock('../../consts/DB_SEED/Items', () => ({
	DB_SEED_ITEMS: [
		{
			id: 1,
			name: 'Red Potion',
			type: { id: 2, name: 'Usable' },
			description: 'Heals HP',
		},
		{
			id: 2,
			name: 'Dark Potion',
			type: { id: 2, name: 'Usable' },
			description: 'Attack buff',
		},
		{
			id: 3,
			name: 'Treasure',
			type: { id: 3, name: 'Misc' },
			description: 'A treasure chest',
		},
		{
			id: 4,
			name: 'Mighty Sword',
			type: { id: 1, name: 'Equip' },
			description: 'A powerful sword',
		},
	],
}));

describe('InventorySorter', () => {
	// Sample inventory items for testing
	const sampleItems: IInventoryItem[] = [
		{ id: 1, count: 5 },
		{ id: 2, count: 3 },
		{ id: 3, count: 10 },
		{ id: 4, count: 1 },
	];

	describe('sortByName()', () => {
		it('should sort items alphabetically ascending', () => {
			const sorted = sortByName(sampleItems, 'asc');

			// Dark Potion, Mighty Sword, Red Potion, Treasure
			expect(sorted[0].id).toBe(2); // Dark Potion
			expect(sorted[1].id).toBe(4); // Mighty Sword
			expect(sorted[2].id).toBe(1); // Red Potion
			expect(sorted[3].id).toBe(3); // Treasure
		});

		it('should sort items alphabetically descending', () => {
			const sorted = sortByName(sampleItems, 'desc');

			// Treasure, Red Potion, Mighty Sword, Dark Potion
			expect(sorted[0].id).toBe(3); // Treasure
			expect(sorted[1].id).toBe(1); // Red Potion
			expect(sorted[2].id).toBe(4); // Mighty Sword
			expect(sorted[3].id).toBe(2); // Dark Potion
		});

		it('should default to ascending order', () => {
			const sorted = sortByName(sampleItems);

			expect(sorted[0].id).toBe(2); // Dark Potion (first alphabetically)
		});

		it('should not mutate original array', () => {
			const original = [...sampleItems];
			sortByName(sampleItems, 'asc');

			expect(sampleItems).toEqual(original);
		});

		it('should handle empty array', () => {
			const sorted = sortByName([], 'asc');

			expect(sorted).toEqual([]);
		});

		it('should handle single item', () => {
			const sorted = sortByName([{ id: 1, count: 5 }], 'asc');

			expect(sorted.length).toBe(1);
			expect(sorted[0].id).toBe(1);
		});
	});

	describe('sortByType()', () => {
		it('should sort items by type ascending (Equip, Usable, Misc)', () => {
			const sorted = sortByType(sampleItems, 'asc');

			// Equip (1), Usable (2), Usable (2), Misc (3)
			expect(sorted[0].id).toBe(4); // Mighty Sword (Equip = 1)
		});

		it('should sort items by type descending', () => {
			const sorted = sortByType(sampleItems, 'desc');

			// Misc (3), then Usable (2)
			expect(sorted[0].id).toBe(3); // Treasure (Misc = 3)
		});

		it('should default to ascending order', () => {
			const sorted = sortByType(sampleItems);

			expect(sorted[0].id).toBe(4); // Equip first
		});

		it('should not mutate original array', () => {
			const original = [...sampleItems];
			sortByType(sampleItems, 'asc');

			expect(sampleItems).toEqual(original);
		});
	});

	describe('sortByCount()', () => {
		it('should sort items by count ascending', () => {
			const sorted = sortByCount(sampleItems, 'asc');

			expect(sorted[0].count).toBe(1);
			expect(sorted[1].count).toBe(3);
			expect(sorted[2].count).toBe(5);
			expect(sorted[3].count).toBe(10);
		});

		it('should sort items by count descending', () => {
			const sorted = sortByCount(sampleItems, 'desc');

			expect(sorted[0].count).toBe(10);
			expect(sorted[1].count).toBe(5);
			expect(sorted[2].count).toBe(3);
			expect(sorted[3].count).toBe(1);
		});

		it('should default to ascending order', () => {
			const sorted = sortByCount(sampleItems);

			expect(sorted[0].count).toBe(1);
		});

		it('should not mutate original array', () => {
			const original = [...sampleItems];
			sortByCount(sampleItems, 'asc');

			expect(sampleItems).toEqual(original);
		});

		it('should handle items with same count', () => {
			const items = [
				{ id: 1, count: 5 },
				{ id: 2, count: 5 },
			];
			const sorted = sortByCount(items, 'asc');

			expect(sorted.length).toBe(2);
			expect(sorted[0].count).toBe(5);
			expect(sorted[1].count).toBe(5);
		});
	});

	describe('sortById()', () => {
		it('should sort items by id ascending', () => {
			const shuffled = [
				{ id: 3, count: 10 },
				{ id: 1, count: 5 },
				{ id: 4, count: 1 },
				{ id: 2, count: 3 },
			];
			const sorted = sortById(shuffled, 'asc');

			expect(sorted[0].id).toBe(1);
			expect(sorted[1].id).toBe(2);
			expect(sorted[2].id).toBe(3);
			expect(sorted[3].id).toBe(4);
		});

		it('should sort items by id descending', () => {
			const sorted = sortById(sampleItems, 'desc');

			expect(sorted[0].id).toBe(4);
			expect(sorted[3].id).toBe(1);
		});

		it('should default to ascending order', () => {
			const sorted = sortById(sampleItems);

			expect(sorted[0].id).toBe(1);
		});
	});

	describe('sortItems()', () => {
		it('should sort by name with config', () => {
			const sorted = sortItems(sampleItems, { type: 'name', direction: 'asc' });

			expect(sorted[0].id).toBe(2); // Dark Potion
		});

		it('should sort by type with config', () => {
			const sorted = sortItems(sampleItems, { type: 'type', direction: 'asc' });

			expect(sorted[0].id).toBe(4); // Equip
		});

		it('should sort by count with config', () => {
			const sorted = sortItems(sampleItems, { type: 'count', direction: 'desc' });

			expect(sorted[0].count).toBe(10);
		});

		it('should sort by id with config', () => {
			const sorted = sortItems(sampleItems, { type: 'id', direction: 'asc' });

			expect(sorted[0].id).toBe(1);
		});

		it('should return copy for unknown type', () => {
			const sorted = sortItems(sampleItems, { type: 'unknown' as SortType, direction: 'asc' });

			expect(sorted).toEqual(sampleItems);
			expect(sorted).not.toBe(sampleItems); // Different reference
		});
	});

	describe('getNextSortType()', () => {
		it('should cycle from name to type', () => {
			expect(getNextSortType('name')).toBe('type');
		});

		it('should cycle from type to count', () => {
			expect(getNextSortType('type')).toBe('count');
		});

		it('should cycle from count to id', () => {
			expect(getNextSortType('count')).toBe('id');
		});

		it('should cycle from id back to name', () => {
			expect(getNextSortType('id')).toBe('name');
		});
	});

	describe('toggleDirection()', () => {
		it('should toggle from asc to desc', () => {
			expect(toggleDirection('asc')).toBe('desc');
		});

		it('should toggle from desc to asc', () => {
			expect(toggleDirection('desc')).toBe('asc');
		});
	});

	describe('getSortTypeLabel()', () => {
		it('should return "Name" for name type', () => {
			expect(getSortTypeLabel('name')).toBe('Name');
		});

		it('should return "Type" for type type', () => {
			expect(getSortTypeLabel('type')).toBe('Type');
		});

		it('should return "Qty" for count type', () => {
			expect(getSortTypeLabel('count')).toBe('Qty');
		});

		it('should return "Default" for id type', () => {
			expect(getSortTypeLabel('id')).toBe('Default');
		});

		it('should return "Unknown" for unknown type', () => {
			expect(getSortTypeLabel('unknown' as SortType)).toBe('Unknown');
		});
	});

	describe('getDirectionIndicator()', () => {
		it('should return up arrow for ascending', () => {
			expect(getDirectionIndicator('asc')).toBe('↑');
		});

		it('should return down arrow for descending', () => {
			expect(getDirectionIndicator('desc')).toBe('↓');
		});
	});

	describe('InventorySorter class', () => {
		let sorter: InventorySorter;

		beforeEach(() => {
			sorter = new InventorySorter();
		});

		describe('getConfig()', () => {
			it('should return default config (id, asc)', () => {
				const config = sorter.getConfig();

				expect(config.type).toBe('id');
				expect(config.direction).toBe('asc');
			});
		});

		describe('setType()', () => {
			it('should set sort type', () => {
				sorter.setType('name');

				expect(sorter.getConfig().type).toBe('name');
			});
		});

		describe('setDirection()', () => {
			it('should set sort direction', () => {
				sorter.setDirection('desc');

				expect(sorter.getConfig().direction).toBe('desc');
			});
		});

		describe('nextType()', () => {
			it('should cycle to next type', () => {
				sorter.setType('name');
				const next = sorter.nextType();

				expect(next).toBe('type');
				expect(sorter.getConfig().type).toBe('type');
			});

			it('should cycle back to name from id', () => {
				sorter.setType('id');
				const next = sorter.nextType();

				expect(next).toBe('name');
			});
		});

		describe('toggleDirection()', () => {
			it('should toggle direction', () => {
				const newDirection = sorter.toggleDirection();

				expect(newDirection).toBe('desc');
				expect(sorter.getConfig().direction).toBe('desc');
			});

			it('should toggle back', () => {
				sorter.toggleDirection();
				const newDirection = sorter.toggleDirection();

				expect(newDirection).toBe('asc');
			});
		});

		describe('sort()', () => {
			it('should sort items with current config', () => {
				sorter.setType('name');
				const sorted = sorter.sort(sampleItems);

				expect(sorted[0].id).toBe(2); // Dark Potion
			});

			it('should sort with updated direction', () => {
				sorter.setType('count');
				sorter.setDirection('desc');
				const sorted = sorter.sort(sampleItems);

				expect(sorted[0].count).toBe(10);
			});
		});

		describe('getLabel()', () => {
			it('should return default label', () => {
				expect(sorter.getLabel()).toBe('Default ↑');
			});

			it('should return updated label', () => {
				sorter.setType('name');
				sorter.setDirection('desc');

				expect(sorter.getLabel()).toBe('Name ↓');
			});

			it('should return count label', () => {
				sorter.setType('count');

				expect(sorter.getLabel()).toBe('Qty ↑');
			});
		});

		describe('reset()', () => {
			it('should reset to default config', () => {
				sorter.setType('name');
				sorter.setDirection('desc');
				sorter.reset();

				const config = sorter.getConfig();
				expect(config.type).toBe('id');
				expect(config.direction).toBe('asc');
			});
		});
	});
});
