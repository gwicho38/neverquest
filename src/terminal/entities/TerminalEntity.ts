import { IBaseEntity } from '../../entities/BaseEntity';
import { IEntityAttributes } from '../../entities/EntityAttributes';
import { EntitySpeed, TerminalEntityValues } from '../../consts/Numbers';

/**
 * Terminal representation of a game entity
 */
export class TerminalEntity implements IBaseEntity {
	// BaseEntity properties
	public id: string | null = null;
	public isAtacking: boolean = false;
	public canAtack: boolean = true;
	public canMove: boolean = true;
	public canTakeDamage: boolean = true;
	public isBlocking: boolean = false;
	public canBlock: boolean = true;
	public showHitBox: boolean = false;
	public perceptionRange: number = 75;
	public isSwimming: boolean = false;
	public canSwim: boolean = true;
	public isRunning: boolean = false;
	public baseSpeed: number = EntitySpeed.BASE;
	public swimSpeed: number = EntitySpeed.SWIM;
	public runSpeed: number = EntitySpeed.RUN;

	// Terminal-specific properties
	public x: number;
	public y: number;
	public symbol: string;
	public color: string;
	public attributes: IEntityAttributes;
	public entityName: string;
	public isPlayer: boolean = false;

	// Animation properties
	private animationFrame: number = 0;
	private walkingFrames: string[] = ['🧙‍♂️', '🧙', '🧙‍♂️', '🧙‍♀️'];
	private lastMoveTime: number = 0;

	constructor(
		x: number,
		y: number,
		symbol: string,
		color: string,
		attributes: IEntityAttributes,
		entityName: string
	) {
		this.x = x;
		this.y = y;
		this.symbol = symbol;
		this.color = color;
		this.attributes = attributes;
		this.entityName = entityName;
		this.id = `${entityName}_${Date.now()}`;
	}

	/**
	 * Move the entity by delta x and y
	 */
	public move(dx: number, dy: number): void {
		if (this.canMove) {
			this.x += dx;
			this.y += dy;

			// Advance animation frame for player
			if (this.isPlayer) {
				this.animationFrame = (this.animationFrame + 1) % this.walkingFrames.length;
				this.lastMoveTime = Date.now();
			}
		}
	}

	/**
	 * Set absolute position
	 */
	public setPosition(x: number, y: number): void {
		this.x = x;
		this.y = y;
	}

	/**
	 * Get the current symbol (with animation if applicable)
	 */
	private getCurrentSymbol(): string {
		if (this.isPlayer) {
			// Use animated frame if recently moved
			const timeSinceMove = Date.now() - this.lastMoveTime;
			if (timeSinceMove < TerminalEntityValues.WALK_ANIMATION_DURATION) {
				return this.walkingFrames[this.animationFrame];
			}
			// Default to standing still
			return this.walkingFrames[0];
		}
		return this.symbol;
	}

	/**
	 * Get entity representation as colored string
	 */
	public toString(): string {
		const currentSymbol = this.getCurrentSymbol();

		if (this.isPlayer) {
			// Make player highly visible with bright yellow/white emoji on red background with brackets
			return `{red-bg}{yellow-fg}{bold}[${currentSymbol}]{/bold}{/yellow-fg}{/red-bg}`;
		}
		return `{${this.color}-fg}${currentSymbol}{/${this.color}-fg}`;
	}

	/**
	 * Take damage
	 */
	public takeDamage(amount: number): void {
		if (this.canTakeDamage && this.attributes) {
			this.attributes.health = Math.max(0, this.attributes.health - amount);
		}
	}

	/**
	 * Check if entity is alive
	 */
	public isAlive(): boolean {
		return this.attributes && this.attributes.health > 0;
	}

	/**
	 * Heal
	 */
	public heal(amount: number): void {
		if (this.attributes) {
			this.attributes.health = Math.min(this.attributes.maxHealth, this.attributes.health + amount);
		}
	}
}
