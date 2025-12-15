/**
 * SpellWheelScene - Radial spell selection UI
 * Activated by holding 'L' key
 * Select spells with M (left), N (center), comma (right)
 * Release L to cast selected spell
 */

import Phaser from 'phaser';
import { SpellColors, HexColors, NumericColors } from '../consts/Colors';
import { SpellWheelValues, Alpha, Depth, FontSizes } from '../consts/Numbers';
import { SpellDefinition, getUnlockedSpells, getSpellTypeColorNumeric } from '../consts/Spells';
import { Player } from '../entities/Player';
import { SpellEffects } from '../plugins/effects/SpellEffects';

export const SpellWheelSceneName = 'SpellWheelScene';

// Spell positions in the horizontal bar
export enum SpellPosition {
	LEFT = 0, // M key
	CENTER = 1, // N key
	RIGHT = 2, // , (comma) key
}

interface SpellSlot {
	spell: SpellDefinition;
	position: SpellPosition;
	graphics: Phaser.GameObjects.Graphics;
	icon: Phaser.GameObjects.Text;
	keyLabel: Phaser.GameObjects.Text;
	x: number;
	y: number;
}

export class SpellWheelScene extends Phaser.Scene {
	private player!: Player;
	private parentScene!: Phaser.Scene;
	private spellEffects!: SpellEffects;

	private overlay!: Phaser.GameObjects.Graphics;
	private wheelContainer!: Phaser.GameObjects.Container;
	private slots: SpellSlot[] = [];
	private centerCircle!: Phaser.GameObjects.Graphics;
	private selectedSpellText!: Phaser.GameObjects.Text;
	private manaCostText!: Phaser.GameObjects.Text;
	private descriptionText!: Phaser.GameObjects.Text;
	private instructionsText!: Phaser.GameObjects.Text;

	private selectedIndex: number = -1;
	private spells: SpellDefinition[] = [];
	private isOpen: boolean = false;

	// Slot positions relative to center (up, right, down, left)
	private readonly SLOT_RADIUS = 100;
	private readonly SLOT_SIZE = 60;

	constructor() {
		super({ key: SpellWheelSceneName });
	}

	init(data: { player: Player; parentScene: Phaser.Scene }): void {
		this.player = data.player;
		this.parentScene = data.parentScene;
	}

	create(): void {
		// Get first 3 unlocked spells (excluding heal)
		const allUnlocked = getUnlockedSpells().filter((spell) => spell.id !== 'heal');
		this.spells = allUnlocked.slice(0, 3);
		this.spellEffects = new SpellEffects(this.parentScene);

		this.createOverlay();
		this.createWheel();
		this.setupInput();

		// Animate opening
		this.animateOpen();
	}

	private createOverlay(): void {
		const { width, height } = this.cameras.main;

		this.overlay = this.add.graphics();
		this.overlay.fillStyle(NumericColors.BLACK, SpellWheelValues.OVERLAY_ALPHA);
		this.overlay.fillRect(0, 0, width, height);
		this.overlay.setDepth(Depth.UI);
		this.overlay.setAlpha(0);
	}

	private createWheel(): void {
		const { width, height } = this.cameras.main;
		const centerX = width / 2;
		const centerY = height / 2;

		this.wheelContainer = this.add.container(centerX, centerY);
		this.wheelContainer.setDepth(Depth.UI_OVERLAY);
		this.wheelContainer.setScale(0);

		// Create center circle
		this.centerCircle = this.add.graphics();
		this.centerCircle.fillStyle(SpellColors.WHEEL_CENTER, Alpha.OPAQUE);
		this.centerCircle.fillCircle(0, 0, 35);
		this.centerCircle.lineStyle(3, SpellColors.WHEEL_BORDER, Alpha.OPAQUE);
		this.centerCircle.strokeCircle(0, 0, 35);
		this.wheelContainer.add(this.centerCircle);

		// Create spell slots in cross pattern
		this.createSpellSlots();

		// Create info text elements (below the wheel)
		this.selectedSpellText = this.add.text(0, this.SLOT_RADIUS + 60, '', {
			fontSize: FontSizes.LARGE,
			color: HexColors.WHITE,
			fontStyle: 'bold',
			align: 'center',
		});
		this.selectedSpellText.setOrigin(0.5);
		this.wheelContainer.add(this.selectedSpellText);

		this.manaCostText = this.add.text(0, this.SLOT_RADIUS + 85, '', {
			fontSize: FontSizes.MEDIUM,
			color: HexColors.BLUE,
			align: 'center',
		});
		this.manaCostText.setOrigin(0.5);
		this.wheelContainer.add(this.manaCostText);

		this.descriptionText = this.add.text(0, this.SLOT_RADIUS + 110, '', {
			fontSize: FontSizes.SMALL,
			color: HexColors.GRAY_LIGHT,
			align: 'center',
			wordWrap: { width: 250 },
		});
		this.descriptionText.setOrigin(0.5);
		this.wheelContainer.add(this.descriptionText);

		// Instructions text at top
		this.instructionsText = this.add.text(
			0,
			-(this.SLOT_RADIUS + 50),
			'Hold L + Press M/N/, to select\nRelease L to cast',
			{
				fontSize: FontSizes.SMALL,
				color: HexColors.GRAY_LIGHT,
				align: 'center',
			}
		);
		this.instructionsText.setOrigin(0.5);
		this.wheelContainer.add(this.instructionsText);
	}

	private createSpellSlots(): void {
		// Position offsets for each slot (horizontal layout: left, center, right)
		// Keys: M (left), N (center), , (comma - right) - L is reserved for open/close/cast
		const positions = [
			{ x: -this.SLOT_RADIUS, y: 0, key: 'M', position: SpellPosition.LEFT },
			{ x: 0, y: 0, key: 'N', position: SpellPosition.CENTER },
			{ x: this.SLOT_RADIUS, y: 0, key: ',', position: SpellPosition.RIGHT },
		];

		positions.forEach((pos, index) => {
			if (index >= this.spells.length) return;

			const spell = this.spells[index];

			// Create slot background
			const graphics = this.add.graphics();
			this.drawSlot(graphics, pos.x, pos.y, spell, false);
			this.wheelContainer.add(graphics);

			// Create spell icon
			const iconSymbol = this.getSpellIcon(spell);
			const icon = this.add.text(pos.x, pos.y - 5, iconSymbol, {
				fontSize: '28px',
				color: spell.color,
			});
			icon.setOrigin(0.5);
			this.wheelContainer.add(icon);

			// Create key label
			const keyLabel = this.add.text(pos.x, pos.y + 20, `[${pos.key}]`, {
				fontSize: FontSizes.SMALL,
				color: HexColors.WHITE,
			});
			keyLabel.setOrigin(0.5);
			this.wheelContainer.add(keyLabel);

			this.slots.push({
				spell,
				position: pos.position,
				graphics,
				icon,
				keyLabel,
				x: pos.x,
				y: pos.y,
			});
		});
	}

	private drawSlot(
		graphics: Phaser.GameObjects.Graphics,
		x: number,
		y: number,
		spell: SpellDefinition,
		isSelected: boolean
	): void {
		graphics.clear();

		const fillColor = isSelected ? getSpellTypeColorNumeric(spell.type) : SpellColors.WHEEL_SEGMENT;
		const fillAlpha = isSelected ? Alpha.HIGH : Alpha.MEDIUM_HIGH;
		const strokeWidth = isSelected ? 4 : 2;

		graphics.fillStyle(fillColor, fillAlpha);
		graphics.fillRoundedRect(x - this.SLOT_SIZE / 2, y - this.SLOT_SIZE / 2, this.SLOT_SIZE, this.SLOT_SIZE, 12);

		graphics.lineStyle(strokeWidth, isSelected ? 0xffffff : SpellColors.WHEEL_BORDER, Alpha.OPAQUE);
		graphics.strokeRoundedRect(x - this.SLOT_SIZE / 2, y - this.SLOT_SIZE / 2, this.SLOT_SIZE, this.SLOT_SIZE, 12);
	}

	private getSpellIcon(spell: SpellDefinition): string {
		switch (spell.id) {
			case 'fireball':
				return '🔥';
			case 'flameWave':
				return '🌊';
			case 'iceShard':
				return '❄️';
			case 'frostNova':
				return '💠';
			case 'lightningBolt':
				return '⚡';
			case 'chainLightning':
				return '⛈️';
			case 'heal':
				return '💚';
			case 'divineShield':
				return '🛡️';
			case 'shadowBolt':
				return '🌑';
			case 'poisonCloud':
				return '☠️';
			default:
				return '✨';
		}
	}

	private setupInput(): void {
		// Keyboard selection (M, N, comma) - L is reserved for open/close/cast
		this.input.keyboard!.on('keydown-M', () => {
			this.selectByPosition(SpellPosition.LEFT);
		});

		this.input.keyboard!.on('keydown-N', () => {
			this.selectByPosition(SpellPosition.CENTER);
		});

		this.input.keyboard!.on('keydown-COMMA', () => {
			this.selectByPosition(SpellPosition.RIGHT);
		});

		// L key release to cast selected spell (L is used to open/close spell wheel)
		this.input.keyboard!.on('keyup-L', () => {
			this.castSelectedSpell();
		});

		// Escape to close without casting
		this.input.keyboard!.on('keyup-ESC', () => {
			this.close(false);
		});

		// Also support mouse movement for selection (optional)
		this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
			this.updateSelectionFromMouse(pointer);
		});
	}

	private selectByPosition(position: SpellPosition): void {
		const slotIndex = this.slots.findIndex((slot) => slot.position === position);
		if (slotIndex !== -1) {
			this.setSelection(slotIndex);
		}
	}

	private updateSelectionFromMouse(pointer: Phaser.Input.Pointer): void {
		const { width, height } = this.cameras.main;
		const centerX = width / 2;
		const centerY = height / 2;

		const dx = pointer.x - centerX;
		const dy = pointer.y - centerY;
		const distance = Math.sqrt(dx * dx + dy * dy);

		// Only select if within reasonable vertical distance (horizontal bar)
		if (Math.abs(dy) > this.SLOT_SIZE || distance > this.SLOT_RADIUS + this.SLOT_SIZE) {
			return;
		}

		// Map horizontal position to slot (3 slots: left, center, right)
		let position: SpellPosition;
		if (dx < -this.SLOT_SIZE / 2) {
			position = SpellPosition.LEFT; // M
		} else if (dx > this.SLOT_SIZE / 2) {
			position = SpellPosition.RIGHT; // ,
		} else {
			position = SpellPosition.CENTER; // N
		}

		this.selectByPosition(position);
	}

	private setSelection(index: number): void {
		// Clear previous selection
		if (this.selectedIndex >= 0 && this.selectedIndex < this.slots.length) {
			const prevSlot = this.slots[this.selectedIndex];
			this.drawSlot(prevSlot.graphics, prevSlot.x, prevSlot.y, prevSlot.spell, false);
			prevSlot.icon.setScale(1);
		}

		this.selectedIndex = index;

		// Highlight new selection
		if (index >= 0 && index < this.slots.length) {
			const slot = this.slots[index];
			this.drawSlot(slot.graphics, slot.x, slot.y, slot.spell, true);
			slot.icon.setScale(1.3);

			// Update info text
			this.selectedSpellText.setText(slot.spell.name);
			this.selectedSpellText.setColor(slot.spell.color);
			this.manaCostText.setText(`Mana: ${slot.spell.manaCost}`);
			this.descriptionText.setText(slot.spell.description);
		} else {
			this.clearInfoText();
		}
	}

	private clearInfoText(): void {
		this.selectedSpellText.setText('');
		this.manaCostText.setText('');
		this.descriptionText.setText('');
	}

	private castSelectedSpell(): void {
		if (this.selectedIndex >= 0 && this.selectedIndex < this.slots.length) {
			const spell = this.slots[this.selectedIndex].spell;

			// Cast the spell effect at player position
			const playerX = this.player.container.x;
			const playerY = this.player.container.y;

			// Get mouse position for targeted spells from the parent scene's camera
			// This is necessary because SpellWheelScene is a UI overlay with its own camera
			const parentPointer = this.parentScene.input.activePointer;
			const parentCamera = this.parentScene.cameras.main;

			// Convert screen coordinates to world coordinates using the parent scene's camera
			let targetX = playerX + 100; // Default fallback
			let targetY = playerY;

			if (parentPointer && parentCamera) {
				const worldPoint = parentCamera.getWorldPoint(parentPointer.x, parentPointer.y);
				targetX = worldPoint.x;
				targetY = worldPoint.y;
			}

			// Call the appropriate effect method
			this.castSpellEffect(spell, playerX, playerY, targetX, targetY);

			console.log(
				`[SpellWheel] Cast ${spell.name} at player (${playerX}, ${playerY}) targeting (${targetX}, ${targetY})`
			);
		}

		this.close(true);
	}

	private castSpellEffect(spell: SpellDefinition, x: number, y: number, targetX: number, targetY: number): void {
		switch (spell.effectMethod) {
			case 'fireball':
				this.spellEffects.fireball(x, y);
				break;
			case 'flameWave': {
				const direction = Math.atan2(targetY - y, targetX - x);
				this.spellEffects.flameWave(x, y, direction);
				break;
			}
			case 'iceShard':
				this.spellEffects.iceShard(x, y);
				break;
			case 'frostNova':
				this.spellEffects.frostNova(x, y);
				break;
			case 'lightningBolt':
				this.spellEffects.lightningBolt(x, y, targetX, targetY);
				break;
			case 'chainLightning':
				this.spellEffects.lightningBolt(x, y, targetX, targetY);
				break;
			case 'heal':
				this.spellEffects.heal(x, y);
				break;
			case 'divineShield':
				this.spellEffects.divineShield(x, y);
				break;
			case 'shadowBolt':
				this.spellEffects.shadowBolt(x, y, targetX, targetY);
				break;
			case 'poisonCloud':
				this.spellEffects.poisonCloud(targetX, targetY);
				break;
			default:
				console.warn(`Unknown spell effect: ${spell.effectMethod}`);
		}
	}

	private animateOpen(): void {
		this.isOpen = true;

		// Fade in overlay
		this.tweens.add({
			targets: this.overlay,
			alpha: 1,
			duration: SpellWheelValues.OPEN_ANIMATION_DURATION,
			ease: 'Power2',
		});

		// Scale up wheel
		this.tweens.add({
			targets: this.wheelContainer,
			scale: 1,
			duration: SpellWheelValues.OPEN_ANIMATION_DURATION,
			ease: 'Back.easeOut',
		});
	}

	private close(didCast: boolean): void {
		if (!this.isOpen) return;
		this.isOpen = false;

		// Notify parent scene that spell wheel is closing
		if (this.parentScene) {
			this.parentScene.events.emit('spellwheelclosed', didCast);
		}

		// Fade out
		this.tweens.add({
			targets: this.overlay,
			alpha: 0,
			duration: SpellWheelValues.CLOSE_ANIMATION_DURATION,
			ease: 'Power2',
		});

		this.tweens.add({
			targets: this.wheelContainer,
			scale: 0,
			duration: SpellWheelValues.CLOSE_ANIMATION_DURATION,
			ease: 'Power2',
			onComplete: () => {
				this.scene.stop();
			},
		});
	}

	/**
	 * Get the currently selected spell (for external use)
	 */
	public getSelectedSpell(): SpellDefinition | null {
		if (this.selectedIndex >= 0 && this.selectedIndex < this.slots.length) {
			return this.slots[this.selectedIndex].spell;
		}
		return null;
	}
}
