/**
 * Tests for TerminalEntity
 */

import { TerminalEntity } from '../../../terminal/entities/TerminalEntity';

// Mock dependencies
jest.mock('../../../consts/Numbers', () => ({
	EntitySpeed: {
		BASE: 200,
		SWIM: 100,
		RUN: 300,
	},
	TerminalEntityValues: {
		WALK_ANIMATION_DURATION: 500,
	},
}));

describe('TerminalEntity', () => {
	const mockAttributes: any = {
		health: 100,
		maxHealth: 100,
		baseHealth: 100,
		atack: 10,
		defense: 5,
		critical: 10,
		hit: 100,
		flee: 5,
		speed: 200,
		level: 1,
		experience: 0,
		nextLevelExperience: 100,
		rawAttributes: { str: 1, agi: 1, vit: 1, dex: 1, int: 1 },
		availableStatPoints: 0,
		bonus: { equipment: [], consumable: [], extra: [] },
	};

	describe('constructor', () => {
		it('should create entity with correct properties', () => {
			const entity = new TerminalEntity(10, 20, '@', 'green', mockAttributes, 'TestEntity');

			expect(entity.x).toBe(10);
			expect(entity.y).toBe(20);
			expect(entity.symbol).toBe('@');
			expect(entity.color).toBe('green');
			expect(entity.entityName).toBe('TestEntity');
			expect(entity.attributes).toEqual(mockAttributes);
		});

		it('should generate unique id', () => {
			const entity1 = new TerminalEntity(0, 0, '@', 'red', mockAttributes, 'Entity1');
			const entity2 = new TerminalEntity(0, 0, '@', 'red', mockAttributes, 'Entity2');

			expect(entity1.id).toBeTruthy();
			expect(entity2.id).toBeTruthy();
			expect(entity1.id).not.toBe(entity2.id);
		});

		it('should initialize with default base entity properties', () => {
			const entity = new TerminalEntity(0, 0, '@', 'blue', mockAttributes, 'Test');

			expect(entity.isAtacking).toBe(false);
			expect(entity.canAtack).toBe(true);
			expect(entity.canMove).toBe(true);
			expect(entity.canTakeDamage).toBe(true);
			expect(entity.isBlocking).toBe(false);
			expect(entity.canBlock).toBe(true);
			expect(entity.showHitBox).toBe(false);
			expect(entity.isSwimming).toBe(false);
			expect(entity.canSwim).toBe(true);
			expect(entity.isRunning).toBe(false);
			expect(entity.isPlayer).toBe(false);
		});
	});

	describe('move', () => {
		it('should move entity when canMove is true', () => {
			const entity = new TerminalEntity(10, 10, '@', 'green', mockAttributes, 'Test');
			entity.canMove = true;

			entity.move(5, -3);

			expect(entity.x).toBe(15);
			expect(entity.y).toBe(7);
		});

		it('should not move entity when canMove is false', () => {
			const entity = new TerminalEntity(10, 10, '@', 'green', mockAttributes, 'Test');
			entity.canMove = false;

			entity.move(5, -3);

			expect(entity.x).toBe(10);
			expect(entity.y).toBe(10);
		});

		it('should advance animation frame for player', () => {
			const entity = new TerminalEntity(10, 10, '@', 'green', mockAttributes, 'Player');
			entity.isPlayer = true;

			entity.move(1, 0);
			entity.move(1, 0);
			entity.move(1, 0);

			expect(entity.x).toBe(13);
		});
	});

	describe('setPosition', () => {
		it('should set entity position', () => {
			const entity = new TerminalEntity(0, 0, '@', 'green', mockAttributes, 'Test');

			entity.setPosition(100, 200);

			expect(entity.x).toBe(100);
			expect(entity.y).toBe(200);
		});
	});

	describe('toString', () => {
		it('should return colored string for normal entity', () => {
			const entity = new TerminalEntity(0, 0, 'G', 'green', mockAttributes, 'Goblin');

			const result = entity.toString();

			expect(result).toBe('{green-fg}G{/green-fg}');
		});

		it('should return special format for player', () => {
			const entity = new TerminalEntity(0, 0, '@', 'white', mockAttributes, 'Player');
			entity.isPlayer = true;

			const result = entity.toString();

			expect(result).toContain('{red-bg}');
			expect(result).toContain('{yellow-fg}');
			expect(result).toContain('{bold}');
		});
	});

	describe('takeDamage', () => {
		it('should reduce health by damage amount', () => {
			const attrs = { ...mockAttributes, health: 100 };
			const entity = new TerminalEntity(0, 0, '@', 'green', attrs, 'Test');

			entity.takeDamage(30);

			expect(entity.attributes.health).toBe(70);
		});

		it('should not reduce health below 0', () => {
			const attrs = { ...mockAttributes, health: 20 };
			const entity = new TerminalEntity(0, 0, '@', 'green', attrs, 'Test');

			entity.takeDamage(50);

			expect(entity.attributes.health).toBe(0);
		});

		it('should not take damage when canTakeDamage is false', () => {
			const attrs = { ...mockAttributes, health: 100 };
			const entity = new TerminalEntity(0, 0, '@', 'green', attrs, 'Test');
			entity.canTakeDamage = false;

			entity.takeDamage(30);

			expect(entity.attributes.health).toBe(100);
		});
	});

	describe('isAlive', () => {
		it('should return true when health > 0', () => {
			const attrs = { ...mockAttributes, health: 50 };
			const entity = new TerminalEntity(0, 0, '@', 'green', attrs, 'Test');

			expect(entity.isAlive()).toBe(true);
		});

		it('should return false when health is 0', () => {
			const attrs = { ...mockAttributes, health: 0 };
			const entity = new TerminalEntity(0, 0, '@', 'green', attrs, 'Test');

			expect(entity.isAlive()).toBe(false);
		});

		it('should return false when health is negative', () => {
			const attrs = { ...mockAttributes, health: -10 };
			const entity = new TerminalEntity(0, 0, '@', 'green', attrs, 'Test');

			expect(entity.isAlive()).toBe(false);
		});
	});

	describe('heal', () => {
		it('should increase health by heal amount', () => {
			const attrs = { ...mockAttributes, health: 50, maxHealth: 100 };
			const entity = new TerminalEntity(0, 0, '@', 'green', attrs, 'Test');

			entity.heal(20);

			expect(entity.attributes.health).toBe(70);
		});

		it('should not heal above maxHealth', () => {
			const attrs = { ...mockAttributes, health: 80, maxHealth: 100 };
			const entity = new TerminalEntity(0, 0, '@', 'green', attrs, 'Test');

			entity.heal(50);

			expect(entity.attributes.health).toBe(100);
		});
	});
});
