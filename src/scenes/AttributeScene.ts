/**
 * @fileoverview Character attribute management scene for Neverquest
 *
 * This scene displays and allows allocation of character stats:
 * - STR (Strength): Attack damage
 * - VIT (Vitality): Health and defense
 * - AGI (Agility): Movement speed
 * - DEX (Dexterity): Critical chance
 * - INT (Intelligence): Magic power
 *
 * Players spend available stat points earned from leveling.
 * Uses plus/minus buttons for allocation control.
 *
 * @see Player - Attribute data source
 * @see AttributesManager - Stat calculations
 * @see ExpManager - Level-up stat point allocation
 *
 * @module scenes/AttributeScene
 */

import Phaser from 'phaser';
import { ButtonMinus } from '../components/UI/ButtonMinus';
import { ButtonPlus } from '../components/UI/ButtonPlus';
import lodash from 'lodash';
import { SceneToggleWatcher } from './watchers/SceneToggleWatcher';
import { NeverquestInterfaceController } from '../plugins/NeverquestInterfaceController';
import { PanelComponent } from '../components/PanelComponent';
import { Player } from '../entities/Player';
import { HexColors } from '../consts/Colors';
import { Dimensions } from '../consts/Numbers';
import { UILabels } from '../consts/Messages';
import { RawAttributeKey, IRawAttributes } from '../plugins/attributes/AttributesManager';

export const AttributeSceneName = 'AttributeScene';

interface AttributeConfiguration {
	attribute: RawAttributeKey;
	text: string;
}

interface AttributeUI {
	minus_button: ButtonMinus;
	attributeText: Phaser.GameObjects.Text;
	plus_button: ButtonPlus;
}

/**
 * Interface for UI element action binding
 */
interface InterfaceAction {
	element: Phaser.GameObjects.Image | ButtonMinus | ButtonPlus;
	action: string;
	context: AttributeScene;
	args: AttributeConfiguration | null;
}

export class AttributeScene extends Phaser.Scene {
	public player: Player | null = null;
	public attributesBackground: Phaser.GameObjects.NineSlice | null = null;
	public atributesBackgroundSpriteName: string = 'attributes_background';
	public attributesConfiguration: AttributeConfiguration[];
	public attributesUiArray: AttributeUI[] = [];
	public panelComponent: PanelComponent | null = null;
	public interfaceController!: NeverquestInterfaceController;
	public lastRawAttributes: IRawAttributes | null;
	public closeButton: Phaser.GameObjects.Image | null;
	public availableAttributesText!: Phaser.GameObjects.Text;
	public atackText!: Phaser.GameObjects.Text;
	public defenseText!: Phaser.GameObjects.Text;
	public maxHealthText!: Phaser.GameObjects.Text;
	public criticalText!: Phaser.GameObjects.Text;
	public fleeText!: Phaser.GameObjects.Text;
	public hitText!: Phaser.GameObjects.Text;

	constructor() {
		super({
			key: AttributeSceneName,
		});

		this.attributesConfiguration = [
			{
				attribute: 'str',
				text: 'STR',
			},
			{
				attribute: 'agi',
				text: 'AGI',
			},
			{
				attribute: 'vit',
				text: 'VIT',
			},
			{
				attribute: 'dex',
				text: 'DEX',
			},
			{
				attribute: 'int',
				text: 'INT',
			},
		];
	}

	init(args: { player: Player }): void {
		this.player = args.player;
		this.player.canMove = false;
		this.sound.play('turn_page');
	}

	create(): void {
		this.interfaceController = new NeverquestInterfaceController(this);
		this.lastRawAttributes = lodash.cloneDeep(this.player!.attributes.rawAttributes);
		this.attributesUiArray = [];
		this.panelComponent = new PanelComponent(this);
		this.panelComponent.setTitleText('Attributes');
		this.attributesBackground = this.panelComponent.panelBackground;
		const baseX = this.cameras.main.width / 2 - this.attributesBackground.width / 2;
		const baseY = this.cameras.main.height / 2 - this.attributesBackground.height / 2;
		this.attributesBackground.setPosition(baseX, baseY);
		this.createCloseButton();
		this.createAttributesButtons();
		this.createAttributesInfo();
		this.scale.on('resize', this.resizeAll, this);

		// Position everything correctly on initial create
		this.resizeAll();
	}

	createCloseButton(): void {
		this.closeButton = this.panelComponent!.closeButton;

		this.closeButton.on('pointerdown', () => {
			this.closeScene();
		});
		const closeAction: InterfaceAction = {
			element: this.closeButton,
			action: 'closeScene',
			context: this,
			args: null,
		};
		this.interfaceController.closeAction = closeAction;
		this.interfaceController.currentElementAction = closeAction;
		this.interfaceController.createFirstRow();
		this.interfaceController.interfaceElements[0][0].push(closeAction);
		this.interfaceController.updateHighlightedElement(closeAction.element);
	}

	closeScene(): void {
		SceneToggleWatcher.toggleScene(this, AttributeSceneName, this.player!);
		this.sound.play('turn_page');
	}

	createAttributesButtons(): void {
		const startPosition = 90;
		this.interfaceController.interfaceElements[1] = [];
		this.attributesConfiguration.forEach((attribute, i) => {
			this.interfaceController.interfaceElements[1][i] = [];
			const yPosition = this.attributesBackground!.y + startPosition + 25 * (i + 1);
			const xPosition = this.attributesBackground!.x + 50;
			const minus_button = new ButtonMinus(this, xPosition, yPosition, 'removeAttribute', attribute);
			const plus_button = new ButtonPlus(
				this,
				this.attributesBackground!.x + Dimensions.ATTRIBUTE_PLUS_BUTTON_OFFSET,
				yPosition,
				'addAttribute',
				attribute
			);

			const attribute_text = this.add.text(
				xPosition + Math.abs((plus_button.x - minus_button.x) / 2),
				yPosition,
				attribute.text
			);
			attribute_text.setOrigin(0.5, 0.5);
			this.attributesUiArray.push({ minus_button, attributeText: attribute_text, plus_button });
			const minus_button_interface: InterfaceAction = {
				element: minus_button,
				action: 'removeAttribute',
				context: this,
				args: attribute,
			};
			const plus_button_interface: InterfaceAction = {
				element: plus_button,
				action: 'addAttribute',
				context: this,
				args: attribute,
			};
			this.interfaceController.interfaceElements[1][i].push(minus_button_interface);
			this.interfaceController.interfaceElements[1][i].push(plus_button_interface);
		});
		this.availableAttributesText = this.add
			.text(
				this.attributesBackground!.x + 43,
				this.attributesBackground!.y + startPosition + 26 * (this.attributesConfiguration.length + 1),
				UILabels.AVAILABLE_LABEL + this.player!.attributes.availableStatPoints
			)
			.setOrigin(0, 0.5);
	}

	createAttributesInfo(): void {
		const baseX =
			this.attributesBackground!.x +
			15 +
			(this.attributesBackground!.width / 2) * this.attributesBackground!.scaleX;
		const baseY = this.attributesBackground!.y + 115;
		this.atackText = this.add
			.text(baseX, baseY, UILabels.ATTACK_LABEL(this.player!.attributes.atack), {
				color: HexColors.WHITE,
			})
			.setOrigin(0, 0.5);
		this.defenseText = this.add
			.text(
				baseX,
				this.atackText.y + this.atackText.height + 5,
				UILabels.DEFENSE_LABEL(this.player!.attributes.defense),
				{
					color: HexColors.WHITE,
				}
			)
			.setOrigin(0, 0.5);
		this.maxHealthText = this.add
			.text(
				baseX,
				this.defenseText.y + this.defenseText.height + 5,
				UILabels.MAX_HEALTH_LABEL(this.player!.attributes.baseHealth)
			)
			.setOrigin(0, 0.5);
		this.criticalText = this.add
			.text(
				baseX,
				this.maxHealthText.y + this.maxHealthText.height + 5,
				UILabels.CRITICAL_LABEL(this.player!.attributes.critical)
			)
			.setOrigin(0, 0.5);
		this.fleeText = this.add
			.text(
				baseX,
				this.criticalText.y + this.criticalText.height + 5,
				UILabels.FLEE_LABEL(this.player!.attributes.flee)
			)
			.setOrigin(0, 0.5);
		this.hitText = this.add
			.text(baseX, this.fleeText.y + this.fleeText.height + 5, UILabels.HIT_LABEL(this.player!.attributes.hit))
			.setOrigin(0, 0.5);
	}

	checkButtonEnabled(): void {
		this.attributesConfiguration.forEach((value, i) => {
			const item = this.attributesUiArray[i];
			const raw = this.player!.attributes.rawAttributes[value.attribute];
			const lastRaw = this.lastRawAttributes[value.attribute];

			if (lastRaw == raw) {
				item.minus_button.play('disabled_button_minus', true);
			} else if (!item.minus_button.anims.isPlaying) {
				item.minus_button.play('init_button_minus', true);
			}
			if (this.player!.attributes.availableStatPoints <= 0) {
				item.plus_button.play('disabled_button_plus', true);
			} else if (!item.plus_button.anims.isPlaying) {
				item.plus_button.play('init_button_plus', true);
			}
		});
	}

	addAttribute(payload: AttributeConfiguration): void {
		this.player!.attributesManager.addAttribute(payload.attribute, 1, this.lastRawAttributes);
	}

	removeAttribute(payload: AttributeConfiguration): void {
		this.player!.attributesManager.removeAttribute(payload.attribute, 1, this.lastRawAttributes);
	}

	resizeAll(): void {
		const baseX =
			this.attributesBackground!.x +
			15 +
			(this.attributesBackground!.width / 2) * this.attributesBackground!.scaleX;
		const baseY = this.attributesBackground!.y + 115;

		if (this.atackText) this.atackText.setPosition(baseX, baseY);
		if (this.defenseText) this.defenseText.setPosition(baseX, this.atackText.y + this.atackText.height + 5);
		if (this.maxHealthText) this.maxHealthText.setPosition(baseX, this.defenseText.y + this.defenseText.height + 5);
		if (this.criticalText)
			this.criticalText.setPosition(baseX, this.maxHealthText.y + this.maxHealthText.height + 5);
		if (this.fleeText) this.fleeText.setPosition(baseX, this.criticalText.y + this.criticalText.height + 5);
		if (this.hitText) this.hitText.setPosition(baseX, this.fleeText.y + this.fleeText.height + 5);
	}

	setAttributesText(): void {
		if (this.scene.isActive()) {
			this.atackText.setText(UILabels.ATTACK_LABEL(this.player!.attributes.atack));
			this.defenseText.setText(UILabels.DEFENSE_LABEL(this.player!.attributes.defense));
			this.maxHealthText.setText(UILabels.MAX_HEALTH_LABEL(this.player!.attributes.baseHealth));
			this.criticalText.setText(UILabels.CRITICAL_LABEL(this.player!.attributes.critical));
			this.fleeText.setText(UILabels.FLEE_LABEL(this.player!.attributes.flee));
			this.hitText.setText(UILabels.HIT_LABEL(this.player!.attributes.hit));
		}
	}

	update(): void {
		this.checkButtonEnabled();
		this.setAttributesText();
		if (this.player && this.availableAttributesText)
			this.availableAttributesText.setText(UILabels.AVAILABLE_LABEL + this.player.attributes.availableStatPoints);
	}
}
