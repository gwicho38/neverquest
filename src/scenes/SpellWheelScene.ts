/**
 * SpellWheelScene - Radial spell selection UI
 * Similar to weapon wheel in RDR2
 * Activated by holding 'L' key
 */

import Phaser from 'phaser';
import { SpellColors, HexColors, NumericColors } from '../consts/Colors';
import { SpellWheelValues, Alpha, Depth, FontSizes } from '../consts/Numbers';
import { SpellDefinition, getUnlockedSpells, getSpellTypeColorNumeric } from '../consts/Spells';
import { Player } from '../entities/Player';
import { SpellEffects } from '../plugins/effects/SpellEffects';

export const SpellWheelSceneName = 'SpellWheelScene';

interface SpellSegment {
	spell: SpellDefinition;
	graphics: Phaser.GameObjects.Graphics;
	icon: Phaser.GameObjects.Text;
	startAngle: number;
	endAngle: number;
}

export class SpellWheelScene extends Phaser.Scene {
	private player!: Player;
	private parentScene!: Phaser.Scene;
	private spellEffects!: SpellEffects;

	private overlay!: Phaser.GameObjects.Graphics;
	private wheelContainer!: Phaser.GameObjects.Container;
	private segments: SpellSegment[] = [];
	private centerCircle!: Phaser.GameObjects.Graphics;
	private selectedSpellText!: Phaser.GameObjects.Text;
	private manaCostText!: Phaser.GameObjects.Text;
	private descriptionText!: Phaser.GameObjects.Text;

	private selectedIndex: number = -1;
	private spells: SpellDefinition[] = [];
	private isOpen: boolean = false;

	constructor() {
		super({ key: SpellWheelSceneName });
	}

	init(data: { player: Player; parentScene: Phaser.Scene }): void {
		this.player = data.player;
		this.parentScene = data.parentScene;
	}

	create(): void {
		this.spells = getUnlockedSpells();
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
		this.centerCircle.fillCircle(0, 0, SpellWheelValues.WHEEL_INNER_RADIUS);
		this.centerCircle.lineStyle(2, SpellColors.WHEEL_BORDER, Alpha.OPAQUE);
		this.centerCircle.strokeCircle(0, 0, SpellWheelValues.WHEEL_INNER_RADIUS);
		this.wheelContainer.add(this.centerCircle);

		// Create spell segments
		this.createSegments();

		// Create info text elements (below the wheel)
		this.selectedSpellText = this.add.text(0, SpellWheelValues.WHEEL_RADIUS + 30, '', {
			fontSize: FontSizes.LARGE,
			color: HexColors.WHITE,
			fontStyle: 'bold',
			align: 'center',
		});
		this.selectedSpellText.setOrigin(0.5);
		this.wheelContainer.add(this.selectedSpellText);

		this.manaCostText = this.add.text(0, SpellWheelValues.WHEEL_RADIUS + 55, '', {
			fontSize: FontSizes.MEDIUM,
			color: HexColors.BLUE,
			align: 'center',
		});
		this.manaCostText.setOrigin(0.5);
		this.wheelContainer.add(this.manaCostText);

		this.descriptionText = this.add.text(0, SpellWheelValues.WHEEL_RADIUS + 80, '', {
			fontSize: FontSizes.SMALL,
			color: HexColors.GRAY_LIGHT,
			align: 'center',
			wordWrap: { width: 250 },
		});
		this.descriptionText.setOrigin(0.5);
		this.wheelContainer.add(this.descriptionText);

		// Instructions text at top
		const instructionsText = this.add.text(
			0,
			-(SpellWheelValues.WHEEL_RADIUS + 40),
			'Move mouse to select, release L to cast',
			{
				fontSize: FontSizes.SMALL,
				color: HexColors.GRAY_LIGHT,
				align: 'center',
			}
		);
		instructionsText.setOrigin(0.5);
		this.wheelContainer.add(instructionsText);
	}

	private createSegments(): void {
		if (this.spells.length === 0) return;

		const segmentAngle = 360 / this.spells.length;
		const gapAngle = SpellWheelValues.SEGMENT_GAP;

		this.spells.forEach((spell, index) => {
			const startAngle = index * segmentAngle - 90 + gapAngle / 2;
			const endAngle = (index + 1) * segmentAngle - 90 - gapAngle / 2;

			// Create segment graphics
			const graphics = this.add.graphics();
			this.drawSegment(graphics, startAngle, endAngle, spell, false);
			this.wheelContainer.add(graphics);

			// Create spell icon (using emoji/text as placeholder)
			const iconAngle = ((startAngle + endAngle) / 2) * (Math.PI / 180);
			const iconX = Math.cos(iconAngle) * SpellWheelValues.SEGMENT_ICON_OFFSET;
			const iconY = Math.sin(iconAngle) * SpellWheelValues.SEGMENT_ICON_OFFSET;

			const iconSymbol = this.getSpellIcon(spell);
			const icon = this.add.text(iconX, iconY, iconSymbol, {
				fontSize: '24px',
				color: spell.color,
			});
			icon.setOrigin(0.5);
			this.wheelContainer.add(icon);

			this.segments.push({
				spell,
				graphics,
				icon,
				startAngle,
				endAngle,
			});
		});
	}

	private drawSegment(
		graphics: Phaser.GameObjects.Graphics,
		startAngle: number,
		endAngle: number,
		spell: SpellDefinition,
		isHovered: boolean
	): void {
		graphics.clear();

		const fillColor = isHovered ? getSpellTypeColorNumeric(spell.type) : SpellColors.WHEEL_SEGMENT;
		const fillAlpha = isHovered ? Alpha.HIGH : Alpha.MEDIUM_HIGH;

		graphics.fillStyle(fillColor, fillAlpha);
		graphics.lineStyle(2, SpellColors.WHEEL_BORDER, Alpha.OPAQUE);

		// Draw pie slice
		graphics.beginPath();
		graphics.moveTo(0, 0);
		graphics.arc(
			0,
			0,
			SpellWheelValues.WHEEL_RADIUS,
			Phaser.Math.DegToRad(startAngle),
			Phaser.Math.DegToRad(endAngle),
			false
		);
		graphics.closePath();
		graphics.fillPath();
		graphics.strokePath();

		// Cut out inner circle
		graphics.fillStyle(SpellColors.WHEEL_CENTER, Alpha.OPAQUE);
		graphics.fillCircle(0, 0, SpellWheelValues.WHEEL_INNER_RADIUS);
	}

	private getSpellIcon(spell: SpellDefinition): string {
		// Use Unicode symbols as placeholder icons
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
		// Track mouse movement for selection
		this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
			this.updateSelection(pointer);
		});

		// Listen for L key release to cast
		this.input.keyboard!.on('keyup-L', () => {
			this.castSelectedSpell();
		});

		// Escape to close without casting
		this.input.keyboard!.on('keyup-ESC', () => {
			this.close(false);
		});
	}

	private updateSelection(pointer: Phaser.Input.Pointer): void {
		const { width, height } = this.cameras.main;
		const centerX = width / 2;
		const centerY = height / 2;

		// Calculate angle from center
		const dx = pointer.x - centerX;
		const dy = pointer.y - centerY;
		const distance = Math.sqrt(dx * dx + dy * dy);

		// Only select if within wheel bounds
		if (distance < SpellWheelValues.WHEEL_INNER_RADIUS || distance > SpellWheelValues.WHEEL_RADIUS * 1.5) {
			this.clearSelection();
			return;
		}

		// Calculate angle in degrees (adjusted for top = 0)
		let angle = Phaser.Math.RadToDeg(Math.atan2(dy, dx));
		if (angle < -90) angle += 360; // Normalize to match segment angles

		// Find which segment the angle falls into
		let newSelectedIndex = -1;
		for (let i = 0; i < this.segments.length; i++) {
			const segment = this.segments[i];
			let start = segment.startAngle;
			let end = segment.endAngle;

			// Handle wraparound
			if (start > end) {
				if (angle >= start || angle <= end) {
					newSelectedIndex = i;
					break;
				}
			} else if (angle >= start && angle <= end) {
				newSelectedIndex = i;
				break;
			}
		}

		if (newSelectedIndex !== this.selectedIndex) {
			this.setSelection(newSelectedIndex);
		}
	}

	private setSelection(index: number): void {
		// Clear previous selection
		if (this.selectedIndex >= 0 && this.selectedIndex < this.segments.length) {
			const prevSegment = this.segments[this.selectedIndex];
			this.drawSegment(
				prevSegment.graphics,
				prevSegment.startAngle,
				prevSegment.endAngle,
				prevSegment.spell,
				false
			);
			prevSegment.icon.setScale(1);
		}

		this.selectedIndex = index;

		// Highlight new selection
		if (index >= 0 && index < this.segments.length) {
			const segment = this.segments[index];
			this.drawSegment(segment.graphics, segment.startAngle, segment.endAngle, segment.spell, true);
			segment.icon.setScale(1.3);

			// Update info text
			this.selectedSpellText.setText(segment.spell.name);
			this.selectedSpellText.setColor(segment.spell.color);
			this.manaCostText.setText(`Mana: ${segment.spell.manaCost}`);
			this.descriptionText.setText(segment.spell.description);
		} else {
			this.clearInfoText();
		}
	}

	private clearSelection(): void {
		if (this.selectedIndex >= 0 && this.selectedIndex < this.segments.length) {
			const segment = this.segments[this.selectedIndex];
			this.drawSegment(segment.graphics, segment.startAngle, segment.endAngle, segment.spell, false);
			segment.icon.setScale(1);
		}
		this.selectedIndex = -1;
		this.clearInfoText();
	}

	private clearInfoText(): void {
		this.selectedSpellText.setText('');
		this.manaCostText.setText('');
		this.descriptionText.setText('');
	}

	private castSelectedSpell(): void {
		if (this.selectedIndex >= 0 && this.selectedIndex < this.segments.length) {
			const spell = this.segments[this.selectedIndex].spell;

			// Check mana (placeholder - player doesn't have mana yet)
			// if (this.player.mana < spell.manaCost) {
			//     this.showNotEnoughMana();
			//     return;
			// }

			// Cast the spell effect at player position
			const playerX = this.player.container.x;
			const playerY = this.player.container.y;

			// Get mouse position for targeted spells
			const pointer = this.input.activePointer;
			const targetX = pointer.worldX || playerX + 100;
			const targetY = pointer.worldY || playerY;

			// Call the appropriate effect method
			this.castSpellEffect(spell, playerX, playerY, targetX, targetY);

			// Log the cast
			console.log(`Cast ${spell.name} (${spell.manaCost} mana)`);
		}

		this.close(true);
	}

	private castSpellEffect(spell: SpellDefinition, x: number, y: number, targetX: number, targetY: number): void {
		// Call the appropriate method on SpellEffects based on spell.effectMethod
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
				// For chain lightning, we'd need nearby enemies
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
		if (this.selectedIndex >= 0 && this.selectedIndex < this.segments.length) {
			return this.segments[this.selectedIndex].spell;
		}
		return null;
	}
}
