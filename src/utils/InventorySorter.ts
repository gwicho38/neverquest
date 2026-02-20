/**
 * @fileoverview Inventory item sorting utility
 *
 * This utility provides sorting strategies for player inventory:
 * - Sort by name (alphabetical)
 * - Sort by item type (consumable, equipment, quest)
 * - Sort by stack count
 * - Sort by item ID
 * - Ascending/descending direction
 *
 * @see InventoryScene - Uses sorter for display
 * @see IInventoryItem - Sorted item type
 *
 * @module utils/InventorySorter
 */

import { DB_SEED_ITEMS } from '../consts/DB_SEED/Items';
import { IInventoryItem, IItemConfig } from '../types/ItemTypes';

/**
 * Sort order direction
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Available sort types for inventory
 */
export type SortType = 'name' | 'type' | 'count' | 'id';

/**
 * Sort configuration
 */
export interface ISortConfig {
	type: SortType;
	direction: SortDirection;
}

/**
 * Get item config from DB_SEED_ITEMS by id
 */
function getItemConfig(id: number): IItemConfig | undefined {
	return DB_SEED_ITEMS.find((item) => item.id === id);
}

/**
 * Sort items by name (alphabetically)
 */
export function sortByName(items: IInventoryItem[], direction: SortDirection = 'asc'): IInventoryItem[] {
	return [...items].sort((a, b) => {
		const configA = getItemConfig(a.id);
		const configB = getItemConfig(b.id);

		if (!configA || !configB) return 0;

		const nameA = configA.name.toLowerCase();
		const nameB = configB.name.toLowerCase();

		if (direction === 'asc') {
			return nameA.localeCompare(nameB);
		}
		return nameB.localeCompare(nameA);
	});
}

/**
 * Sort items by type (Equip, Usable, Misc)
 */
export function sortByType(items: IInventoryItem[], direction: SortDirection = 'asc'): IInventoryItem[] {
	return [...items].sort((a, b) => {
		const configA = getItemConfig(a.id);
		const configB = getItemConfig(b.id);

		if (!configA || !configB) return 0;

		// ItemType has an id property for comparison
		const typeA = configA.type?.id ?? 0;
		const typeB = configB.type?.id ?? 0;

		if (direction === 'asc') {
			return typeA - typeB;
		}
		return typeB - typeA;
	});
}

/**
 * Sort items by count (quantity)
 */
export function sortByCount(items: IInventoryItem[], direction: SortDirection = 'asc'): IInventoryItem[] {
	return [...items].sort((a, b) => {
		if (direction === 'asc') {
			return a.count - b.count;
		}
		return b.count - a.count;
	});
}

/**
 * Sort items by id (original order)
 */
export function sortById(items: IInventoryItem[], direction: SortDirection = 'asc'): IInventoryItem[] {
	return [...items].sort((a, b) => {
		if (direction === 'asc') {
			return a.id - b.id;
		}
		return b.id - a.id;
	});
}

/**
 * Sort items using a specific configuration
 */
export function sortItems(items: IInventoryItem[], config: ISortConfig): IInventoryItem[] {
	switch (config.type) {
		case 'name':
			return sortByName(items, config.direction);
		case 'type':
			return sortByType(items, config.direction);
		case 'count':
			return sortByCount(items, config.direction);
		case 'id':
			return sortById(items, config.direction);
		default:
			return [...items];
	}
}

/**
 * Get the next sort type in cycle
 */
export function getNextSortType(current: SortType): SortType {
	const cycle: SortType[] = ['name', 'type', 'count', 'id'];
	const currentIndex = cycle.indexOf(current);
	return cycle[(currentIndex + 1) % cycle.length];
}

/**
 * Toggle sort direction
 */
export function toggleDirection(current: SortDirection): SortDirection {
	return current === 'asc' ? 'desc' : 'asc';
}

/**
 * Get human-readable label for sort type
 */
export function getSortTypeLabel(type: SortType): string {
	switch (type) {
		case 'name':
			return 'Name';
		case 'type':
			return 'Type';
		case 'count':
			return 'Qty';
		case 'id':
			return 'Default';
		default:
			return 'Unknown';
	}
}

/**
 * Get direction indicator
 */
export function getDirectionIndicator(direction: SortDirection): string {
	return direction === 'asc' ? '↑' : '↓';
}

/**
 * InventorySorter class for managing sort state
 */
export class InventorySorter {
	private currentType: SortType = 'id';
	private currentDirection: SortDirection = 'asc';

	/**
	 * Get current sort configuration
	 */
	getConfig(): ISortConfig {
		return {
			type: this.currentType,
			direction: this.currentDirection,
		};
	}

	/**
	 * Set sort type
	 */
	setType(type: SortType): void {
		this.currentType = type;
	}

	/**
	 * Set sort direction
	 */
	setDirection(direction: SortDirection): void {
		this.currentDirection = direction;
	}

	/**
	 * Cycle to next sort type
	 */
	nextType(): SortType {
		this.currentType = getNextSortType(this.currentType);
		return this.currentType;
	}

	/**
	 * Toggle sort direction
	 */
	toggleDirection(): SortDirection {
		this.currentDirection = toggleDirection(this.currentDirection);
		return this.currentDirection;
	}

	/**
	 * Sort items with current configuration
	 */
	sort(items: IInventoryItem[]): IInventoryItem[] {
		return sortItems(items, this.getConfig());
	}

	/**
	 * Get display label for current sort
	 */
	getLabel(): string {
		return `${getSortTypeLabel(this.currentType)} ${getDirectionIndicator(this.currentDirection)}`;
	}

	/**
	 * Reset to default sort
	 */
	reset(): void {
		this.currentType = 'id';
		this.currentDirection = 'asc';
	}
}
