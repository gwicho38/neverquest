/**
 * @fileoverview Detailed character statistics display
 *
 * This scene shows comprehensive player stats:
 * - HP/XP progress bars
 * - All attribute values (STR, VIT, AGI, DEX, INT)
 * - Equipped items with bonuses
 * - Active buffs and effects
 * - Scrollable stat sections
 *
 * Deeper character info than AttributeScene provides.
 *
 * @see Player - Stat data source
 * @see AttributesManager - Stat calculations
 * @see EntityAttributes - Stat storage
 *
 * @module scenes/CharacterStatsScene
 */

import Phaser from 'phaser';
import { PanelComponent } from '../components/PanelComponent';
import { Player } from '../entities/Player';
import { FontFamilies } from '../consts/Numbers';
import { Colors } from '../consts/Colors';
import { IConsumableBonus, IEquipmentBonus } from '../entities/EntityAttributes';

export const CharacterStatsSceneName = 'CharacterStatsScene';

/**
 * Interface for initialization data
 */
interface ICharacterStatsSceneInitData {
	player?: Player;
}

/**
 * CharacterStatsScene - Displays detailed character statistics
 *
 * Features:
 * - Raw attribute values with bonuses
 * - Derived combat stats
 * - Experience and level progress bar
 * - Equipment bonus summary
 * - Active buff timers
 * - Scrollable content for mobile
 */
export class CharacterStatsScene extends Phaser.Scene {
	private panelComponent: PanelComponent | null = null;
	private player: Player | null = null;
	private statTexts: Phaser.GameObjects.Text[] = [];
	private scrollContainer: Phaser.GameObjects.Container | null = null;
	private scrollMask: Phaser.GameObjects.Graphics | null = null;
	private expBar: Phaser.GameObjects.Graphics | null = null;
	private healthBar: Phaser.GameObjects.Graphics | null = null;
	private contentHeight = 0;
	private scrollY = 0;
	private maxScroll = 0;

	// Layout constants
	private readonly CONTENT_PADDING_TOP = 100;
	private readonly CONTENT_PADDING_LEFT = 30;
	private readonly LINE_HEIGHT = 26;
	private readonly HEADER_SIZE = 14;
	private readonly STAT_SIZE = 11;
	private readonly VALUE_SIZE = 11;
	private readonly BAR_WIDTH = 200;
	private readonly BAR_HEIGHT = 12;

	constructor() {
		super({ key: CharacterStatsSceneName });
	}

	init(data: ICharacterStatsSceneInitData): void {
		this.player = data?.player || null;
	}

	create(): void {
		// Create panel background
		this.panelComponent = new PanelComponent(this);
		this.panelComponent.setTitleText('Character Stats');

		// Set up close button
		if (this.panelComponent.closeButton) {
			this.panelComponent.closeButton.on('pointerdown', () => {
				this.cleanup();
				this.scene.stop();
			});
		}

		// Create scrollable content area
		this.createScrollableContent();

		// Build the stats display
		this.buildStatsDisplay();

		// Set up scroll handling
		this.setupScrolling();

		// Handle resize
		this.scale.on('resize', this.handleResize, this);
	}

	/**
	 * Create the scrollable content container
	 */
	private createScrollableContent(): void {
		const panel = this.panelComponent!.panelBackground;
		const contentX = panel.x + this.CONTENT_PADDING_LEFT;
		const contentY = panel.y + this.CONTENT_PADDING_TOP;
		const contentWidth = panel.width - this.CONTENT_PADDING_LEFT * 2;
		const contentHeight = panel.height - this.CONTENT_PADDING_TOP - 40;

		// Create container for scrollable content
		this.scrollContainer = this.add.container(contentX, contentY);

		// Create mask for scrolling
		this.scrollMask = this.add.graphics();
		this.scrollMask.fillStyle(0xffffff);
		this.scrollMask.fillRect(contentX, contentY, contentWidth, contentHeight);

		const mask = this.scrollMask.createGeometryMask();
		this.scrollContainer.setMask(mask);
	}

	/**
	 * Build the stats display content
	 */
	private buildStatsDisplay(): void {
		if (!this.scrollContainer || !this.player) return;

		let yOffset = 0;
		const attrs = this.player.attributes;

		// Character name and level
		yOffset = this.addSectionHeader('Character Info', yOffset);
		yOffset = this.addStatRow('Name:', 'Lucius', yOffset, Colors.GOLD);
		yOffset = this.addStatRow('Level:', attrs.level.toString(), yOffset, Colors.YELLOW);
		yOffset = this.addExperienceBar(yOffset);
		yOffset += this.LINE_HEIGHT * 0.5;

		// Health section
		yOffset = this.addSectionHeader('Health & Vitality', yOffset);
		yOffset = this.addHealthBar(yOffset);
		yOffset = this.addStatRow('Max HP:', attrs.maxHealth.toString(), yOffset, Colors.RED);
		yOffset = this.addStatRow('Base HP:', attrs.baseHealth.toString(), yOffset, Colors.LIGHT_GRAY);
		yOffset += this.LINE_HEIGHT * 0.5;

		// Raw attributes
		yOffset = this.addSectionHeader('Attributes', yOffset);
		yOffset = this.addAttributeRow('STR', attrs.rawAttributes.str, this.getAttributeBonus('str'), yOffset);
		yOffset = this.addAttributeRow('AGI', attrs.rawAttributes.agi, this.getAttributeBonus('agi'), yOffset);
		yOffset = this.addAttributeRow('VIT', attrs.rawAttributes.vit, this.getAttributeBonus('vit'), yOffset);
		yOffset = this.addAttributeRow('DEX', attrs.rawAttributes.dex, this.getAttributeBonus('dex'), yOffset);
		yOffset = this.addAttributeRow('INT', attrs.rawAttributes.int, this.getAttributeBonus('int'), yOffset);
		yOffset = this.addStatRow('Available:', attrs.availableStatPoints.toString(), yOffset, Colors.GREEN);
		yOffset += this.LINE_HEIGHT * 0.5;

		// Combat stats
		yOffset = this.addSectionHeader('Combat Stats', yOffset);
		yOffset = this.addStatRow('Attack:', attrs.atack.toString(), yOffset, Colors.RED);
		yOffset = this.addStatRow('Defense:', attrs.defense.toString(), yOffset, Colors.BLUE);
		yOffset = this.addStatRow('Critical:', `${attrs.critical}%`, yOffset, Colors.ORANGE);
		yOffset = this.addStatRow('Hit:', attrs.hit.toString(), yOffset, Colors.CYAN);
		yOffset = this.addStatRow('Flee:', attrs.flee.toString(), yOffset, Colors.PURPLE);
		yOffset = this.addStatRow('Speed:', attrs.speed.toString(), yOffset, Colors.WHITE);
		yOffset += this.LINE_HEIGHT * 0.5;

		// Equipment bonuses
		if (attrs.bonus.equipment.length > 0) {
			yOffset = this.addSectionHeader('Equipment Bonuses', yOffset);
			yOffset = this.addEquipmentSummary(attrs.bonus.equipment, yOffset);
			yOffset += this.LINE_HEIGHT * 0.5;
		}

		// Active buffs
		if (attrs.bonus.consumable.length > 0) {
			yOffset = this.addSectionHeader('Active Buffs', yOffset);
			yOffset = this.addBuffsSummary(attrs.bonus.consumable, yOffset);
			yOffset += this.LINE_HEIGHT * 0.5;
		}

		// Calculate content height for scrolling
		this.contentHeight = yOffset;
		const panel = this.panelComponent!.panelBackground;
		const visibleHeight = panel.height - this.CONTENT_PADDING_TOP - 40;
		this.maxScroll = Math.max(0, this.contentHeight - visibleHeight);
	}

	/**
	 * Add a section header
	 */
	private addSectionHeader(title: string, yOffset: number): number {
		const header = this.add.text(0, yOffset, `── ${title} ──`, {
			fontSize: `${this.HEADER_SIZE}px`,
			fontFamily: FontFamilies.PRESS_START_2P,
			color: Colors.GOLD,
		});
		this.scrollContainer!.add(header);
		this.statTexts.push(header);
		return yOffset + this.LINE_HEIGHT * 1.2;
	}

	/**
	 * Add a stat row with label and value
	 */
	private addStatRow(label: string, value: string, yOffset: number, valueColor: string = Colors.WHITE): number {
		// Label
		const labelText = this.add.text(0, yOffset, label, {
			fontSize: `${this.STAT_SIZE}px`,
			fontFamily: FontFamilies.PRESS_START_2P,
			color: Colors.LIGHT_GRAY,
		});
		this.scrollContainer!.add(labelText);
		this.statTexts.push(labelText);

		// Value (right-aligned within content area)
		const valueText = this.add.text(180, yOffset, value, {
			fontSize: `${this.VALUE_SIZE}px`,
			fontFamily: FontFamilies.PRESS_START_2P,
			color: valueColor,
		});
		this.scrollContainer!.add(valueText);
		this.statTexts.push(valueText);

		return yOffset + this.LINE_HEIGHT;
	}

	/**
	 * Add an attribute row with base value and bonus
	 */
	private addAttributeRow(name: string, base: number, bonus: number, yOffset: number): number {
		const bonusStr = bonus > 0 ? ` (+${bonus})` : bonus < 0 ? ` (${bonus})` : '';
		const total = base + bonus;
		const color = bonus > 0 ? Colors.GREEN : bonus < 0 ? Colors.RED : Colors.WHITE;

		// Attribute name
		const labelText = this.add.text(0, yOffset, `${name}:`, {
			fontSize: `${this.STAT_SIZE}px`,
			fontFamily: FontFamilies.PRESS_START_2P,
			color: Colors.LIGHT_GRAY,
		});
		this.scrollContainer!.add(labelText);
		this.statTexts.push(labelText);

		// Total value with bonus indicator
		const valueText = this.add.text(80, yOffset, `${total}${bonusStr}`, {
			fontSize: `${this.VALUE_SIZE}px`,
			fontFamily: FontFamilies.PRESS_START_2P,
			color: color,
		});
		this.scrollContainer!.add(valueText);
		this.statTexts.push(valueText);

		return yOffset + this.LINE_HEIGHT;
	}

	/**
	 * Get attribute bonus from equipment
	 */
	private getAttributeBonus(attr: string): number {
		if (!this.player) return 0;
		const equipment = this.player.attributes.bonus.equipment;
		let bonus = 0;

		for (const item of equipment) {
			const attrKey = attr as keyof IEquipmentBonus;
			const value = item[attrKey];
			if (typeof value === 'number') {
				bonus += value;
			}
		}

		return bonus;
	}

	/**
	 * Add experience progress bar
	 */
	private addExperienceBar(yOffset: number): number {
		if (!this.player) return yOffset;

		const attrs = this.player.attributes;
		const progress = attrs.experience / attrs.nextLevelExperience;

		// Label
		const labelText = this.add.text(0, yOffset, 'EXP:', {
			fontSize: `${this.STAT_SIZE}px`,
			fontFamily: FontFamilies.PRESS_START_2P,
			color: Colors.LIGHT_GRAY,
		});
		this.scrollContainer!.add(labelText);
		this.statTexts.push(labelText);

		// Bar background
		this.expBar = this.add.graphics();
		this.expBar.fillStyle(0x333333);
		this.expBar.fillRect(60, yOffset + 2, this.BAR_WIDTH, this.BAR_HEIGHT);

		// Bar fill
		this.expBar.fillStyle(0x00ff00);
		this.expBar.fillRect(60, yOffset + 2, this.BAR_WIDTH * Math.min(progress, 1), this.BAR_HEIGHT);

		// Bar border
		this.expBar.lineStyle(1, 0xffffff);
		this.expBar.strokeRect(60, yOffset + 2, this.BAR_WIDTH, this.BAR_HEIGHT);

		this.scrollContainer!.add(this.expBar);

		// Progress text
		const progressText = this.add.text(
			60 + this.BAR_WIDTH + 10,
			yOffset,
			`${attrs.experience}/${attrs.nextLevelExperience}`,
			{
				fontSize: `${this.STAT_SIZE}px`,
				fontFamily: FontFamilies.PRESS_START_2P,
				color: Colors.GREEN,
			}
		);
		this.scrollContainer!.add(progressText);
		this.statTexts.push(progressText);

		return yOffset + this.LINE_HEIGHT;
	}

	/**
	 * Add health bar display
	 */
	private addHealthBar(yOffset: number): number {
		if (!this.player) return yOffset;

		const attrs = this.player.attributes;
		const progress = attrs.health / attrs.maxHealth;

		// Label
		const labelText = this.add.text(0, yOffset, 'HP:', {
			fontSize: `${this.STAT_SIZE}px`,
			fontFamily: FontFamilies.PRESS_START_2P,
			color: Colors.LIGHT_GRAY,
		});
		this.scrollContainer!.add(labelText);
		this.statTexts.push(labelText);

		// Bar background
		this.healthBar = this.add.graphics();
		this.healthBar.fillStyle(0x333333);
		this.healthBar.fillRect(60, yOffset + 2, this.BAR_WIDTH, this.BAR_HEIGHT);

		// Bar fill - color based on health percentage
		let barColor = 0x00ff00; // Green
		if (progress < 0.5) barColor = 0xffff00; // Yellow
		if (progress < 0.25) barColor = 0xff0000; // Red

		this.healthBar.fillStyle(barColor);
		this.healthBar.fillRect(60, yOffset + 2, this.BAR_WIDTH * Math.min(progress, 1), this.BAR_HEIGHT);

		// Bar border
		this.healthBar.lineStyle(1, 0xffffff);
		this.healthBar.strokeRect(60, yOffset + 2, this.BAR_WIDTH, this.BAR_HEIGHT);

		this.scrollContainer!.add(this.healthBar);

		// Progress text
		const progressText = this.add.text(60 + this.BAR_WIDTH + 10, yOffset, `${attrs.health}/${attrs.maxHealth}`, {
			fontSize: `${this.STAT_SIZE}px`,
			fontFamily: FontFamilies.PRESS_START_2P,
			color: progress < 0.25 ? Colors.RED : progress < 0.5 ? Colors.YELLOW : Colors.GREEN,
		});
		this.scrollContainer!.add(progressText);
		this.statTexts.push(progressText);

		return yOffset + this.LINE_HEIGHT;
	}

	/**
	 * Add equipment bonus summary
	 */
	private addEquipmentSummary(equipment: IEquipmentBonus[], yOffset: number): number {
		// Calculate total bonuses
		let totalAtk = 0;
		let totalDef = 0;
		let totalHp = 0;
		let totalCrit = 0;

		for (const item of equipment) {
			if (item.atk) totalAtk += item.atk;
			if (item.def) totalDef += item.def;
			if (item.hp) totalHp += item.hp;
			if (item.crit) totalCrit += item.crit;
		}

		// Display bonuses
		if (totalAtk > 0) {
			yOffset = this.addStatRow('ATK Bonus:', `+${totalAtk}`, yOffset, Colors.RED);
		}
		if (totalDef > 0) {
			yOffset = this.addStatRow('DEF Bonus:', `+${totalDef}`, yOffset, Colors.BLUE);
		}
		if (totalHp > 0) {
			yOffset = this.addStatRow('HP Bonus:', `+${totalHp}`, yOffset, Colors.GREEN);
		}
		if (totalCrit > 0) {
			yOffset = this.addStatRow('CRIT Bonus:', `+${totalCrit}%`, yOffset, Colors.ORANGE);
		}

		if (totalAtk === 0 && totalDef === 0 && totalHp === 0 && totalCrit === 0) {
			yOffset = this.addStatRow('', 'No bonuses', yOffset, Colors.GRAY);
		}

		return yOffset;
	}

	/**
	 * Add active buffs summary
	 */
	private addBuffsSummary(buffs: IConsumableBonus[], yOffset: number): number {
		for (const buff of buffs) {
			const timeLeft = buff.time > 0 ? ` (${buff.time}s)` : '';
			const displayValue = buff.value > 0 ? `+${buff.value}` : buff.value.toString();
			yOffset = this.addStatRow(`${buff.statBonus}:`, `${displayValue}${timeLeft}`, yOffset, Colors.CYAN);
		}

		return yOffset;
	}

	/**
	 * Set up mouse/touch scrolling
	 */
	private setupScrolling(): void {
		// Mouse wheel scrolling
		this.input.on(
			'wheel',
			(_pointer: Phaser.Input.Pointer, _gameObjects: unknown[], _deltaX: number, deltaY: number) => {
				if (this.maxScroll > 0) {
					this.scrollY = Phaser.Math.Clamp(this.scrollY + deltaY * 0.5, 0, this.maxScroll);
					this.updateScrollPosition();
				}
			}
		);

		// Touch/drag scrolling
		let dragStartY = 0;
		let startScrollY = 0;

		this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
			if (this.isPointerInPanel(pointer)) {
				dragStartY = pointer.y;
				startScrollY = this.scrollY;
			}
		});

		this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
			if (pointer.isDown && this.isPointerInPanel(pointer)) {
				const delta = dragStartY - pointer.y;
				this.scrollY = Phaser.Math.Clamp(startScrollY + delta, 0, this.maxScroll);
				this.updateScrollPosition();
			}
		});
	}

	/**
	 * Check if pointer is within panel bounds
	 */
	private isPointerInPanel(pointer: Phaser.Input.Pointer): boolean {
		const panel = this.panelComponent!.panelBackground;
		return (
			pointer.x >= panel.x &&
			pointer.x <= panel.x + panel.width &&
			pointer.y >= panel.y + this.CONTENT_PADDING_TOP &&
			pointer.y <= panel.y + panel.height - 20
		);
	}

	/**
	 * Update scroll container position
	 */
	private updateScrollPosition(): void {
		if (this.scrollContainer) {
			const panel = this.panelComponent!.panelBackground;
			this.scrollContainer.y = panel.y + this.CONTENT_PADDING_TOP - this.scrollY;
		}
	}

	/**
	 * Handle window resize
	 */
	private handleResize(): void {
		// Rebuild display on resize
		this.cleanup();
		this.create();
	}

	/**
	 * Clean up resources
	 */
	private cleanup(): void {
		this.statTexts.forEach((text) => text.destroy());
		this.statTexts = [];

		if (this.expBar) {
			this.expBar.destroy();
			this.expBar = null;
		}

		if (this.healthBar) {
			this.healthBar.destroy();
			this.healthBar = null;
		}

		if (this.scrollContainer) {
			this.scrollContainer.destroy();
			this.scrollContainer = null;
		}

		if (this.scrollMask) {
			this.scrollMask.destroy();
			this.scrollMask = null;
		}

		if (this.panelComponent) {
			this.panelComponent.destroy();
			this.panelComponent = null;
		}

		this.scale.off('resize', this.handleResize, this);
	}

	/**
	 * Refresh the stats display (call when player stats change)
	 */
	public refresh(): void {
		if (this.scrollContainer) {
			this.scrollContainer.removeAll(true);
		}
		this.statTexts = [];
		this.scrollY = 0;
		this.buildStatsDisplay();
	}

	/**
	 * Update the display each frame (for buff timers)
	 */
	update(): void {
		// Could refresh buff timers here if needed
	}
}
