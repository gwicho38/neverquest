import Phaser from 'phaser';
import { NeverquestSoundManager } from '../plugins/NeverquestSoundManager';
import { PanelComponent } from '../components/PanelComponent';
import { FontFamilies, FontSizes, SettingSceneValues } from '../consts/Numbers';
import { UILabels } from '../consts/Messages';

const COLOR_LIGHT = 0x7b5e57;
const COLOR_DARK = 0x260e04;

export class SettingScene extends Phaser.Scene {
	neverquestSoundManager: NeverquestSoundManager | null;
	margin: number;
	dialogXPosition: number;
	dialogYPosition: number;
	dialogBottomOffset: number;
	nineSliceOffsets: number | number[];
	nineSliceSafeArea: number;
	settingHeaderMarginTop: number;
	settingHeaderText: string;
	settingHeaderFontSize: string;
	settingHeaderFontFamily: string;
	closeButtonOffsetX: number;
	closeButtonSpriteName: string;
	closeButtonScale: number;
	sliderWidth: number;
	sliderHeight: number;
	settingBackgroundSpriteName: string;
	panelComponent: PanelComponent | null;
	dialog: any;
	closeButton: any;
	settingHeader: any;
	textAudioSlider: Phaser.GameObjects.Text | null;
	slider: any;
	rexUI: any;

	constructor() {
		super({
			key: 'SettingScene',
		});

		this.neverquestSoundManager = null;
		this.margin = 10;
		this.dialogXPosition = this.margin;
		this.dialogYPosition = 75;
		this.dialogBottomOffset = SettingSceneValues.DIALOG_BOTTOM_OFFSET;
		this.nineSliceOffsets = 60;
		this.nineSliceSafeArea = 32;
		this.settingHeaderMarginTop = SettingSceneValues.SETTING_HEADER_MARGIN_TOP;
		this.settingHeaderText = 'Settings';
		this.settingHeaderFontSize = FontSizes.SETTING_HEADER;
		this.settingHeaderFontFamily = FontFamilies.PRESS_START_2P;
		this.closeButtonOffsetX = 60;
		this.closeButtonSpriteName = 'close_button';
		this.closeButtonScale = 1;
		this.sliderWidth = 100;
		this.sliderHeight = 20;
		this.settingBackgroundSpriteName = 'panel_background';
		this.panelComponent = null;
		this.dialog = null;
		this.closeButton = null;
		this.settingHeader = null;
		this.textAudioSlider = null;
		this.slider = null;
	}

	create(): void {
		this.neverquestSoundManager = new NeverquestSoundManager(this);
		this.neverquestSoundManager.create();
		this.panelComponent = new PanelComponent(this);
		this.panelComponent.setTitleText('Settings');

		this.dialog = this.panelComponent.panelBackground;
		this.createAudioSlider();

		this.closeButton = this.panelComponent.closeButton;

		this.closeButton.on('pointerdown', () => {
			this.scene.stop();
		});

		this.scale.on('resize', () => {
			if (this.cameras && this.cameras.main) {
				this.dialog.setSize(
					this.cameras.main.width - this.margin * 2,
					this.cameras.main.height - this.dialogYPosition
				);
				this.settingHeader.setPosition(
					(this.cameras.main.width - this.margin * 2) / 2,
					this.settingHeaderMarginTop
				);
				this.closeButton.setPosition(this.cameras.main.width - this.closeButtonOffsetX, this.settingHeader.y);
			}
		});
	}

	createAudioSlider(): void {
		this.textAudioSlider = this.add.text(
			this.dialog.x + this.margin * 3,
			this.dialog.y + this.margin * 10,
			UILabels.AUDIO_LABEL,
			{
				fontSize: FontSizes.SMALL,
				fontFamily: FontFamilies.PRESS_START_2P,
			}
		);
		this.slider = this.rexUI.add
			.slider({
				x: this.textAudioSlider.x + this.margin * 12,
				y: this.textAudioSlider.y - 5,
				width: this.sliderWidth,
				height: this.sliderHeight,
				orientation: 'x',
				value: this.neverquestSoundManager!.getVolume(),

				track: this.rexUI.add.roundRectangle(0, 0, 0, 0, 6, COLOR_DARK),
				thumb: this.rexUI.add.roundRectangle(0, 0, 0, 0, 10, COLOR_LIGHT),

				valuechangeCallback: (value: number) => {
					this.textAudioSlider!.text = UILabels.AUDIO_LABEL_WITH_VALUE(value);
					this.neverquestSoundManager!.setVolume(value);
				},
				space: {
					top: 4,
					bottom: 4,
				},
				input: 'drag', // 'drag'|'click'
			})
			.setOrigin(0, 0)
			.layout();
		this.slider.setScrollFactor(0, 0);
	}
}
