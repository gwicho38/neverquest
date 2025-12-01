import Phaser from 'phaser';
import { NeverquestInterfaceController } from '../plugins/NeverquestInterfaceController';
import { NeverquestSaveManager } from '../plugins/NeverquestSaveManager';
import intro_video from '../assets/video/intro_video_converted_FULLHD.mp4';
import { PanelComponent } from '../components/PanelComponent';
import { HexColors } from '../consts/Colors';
import { Alpha, AnimationTiming, Dimensions } from '../consts/Numbers';
import { FontFamily, UILabels } from '../consts/Messages';

export class MainMenuScene extends Phaser.Scene {
	neverquestInterfaceControler: NeverquestInterfaceController | null;
	gameStartText: Phaser.GameObjects.Text | null;
	nineSliceOffset: number;
	textWidth: number;
	fontFamily: string;
	lastMenuAction: any;
	video: Phaser.GameObjects.Video | null;
	themeSound: Phaser.Sound.BaseSound | null;
	saveManager: NeverquestSaveManager | null;
	loadGameText: Phaser.GameObjects.Text | null;
	creditsText: Phaser.GameObjects.Text | null;
	panelComponent: PanelComponent | null;
	creditsBackground: any;
	creditsTitle: any;
	creditsTitleText: any;
	closeButton: any;
	creditsTextContent: Phaser.GameObjects.Text | null;

	constructor() {
		super({
			key: 'MainMenuScene',
		});

		this.neverquestInterfaceControler = null;
		this.gameStartText = null;
		this.nineSliceOffset = 10;
		this.textWidth = Dimensions.MAIN_MENU_TEXT_WIDTH;
		this.fontFamily = `"${FontFamily.PIXEL}"`;
		this.lastMenuAction = null;
		this.video = null;
		this.themeSound = null;
		this.saveManager = null;
		this.loadGameText = null;
		this.creditsText = null;
		this.panelComponent = null;
		this.creditsBackground = null;
		this.creditsTitle = null;
		this.creditsTitleText = null;
		this.closeButton = null;
		this.creditsTextContent = null;
	}

	preload(): void {
		// Only load video if it exists (prevents E2E test failures)
		if (intro_video) {
			(this.load as any).video('intro_video', intro_video, 'loadeddata', false, true);
		}
	}

	create(): void {
		// Only create video if it was loaded
		if (intro_video && this.textures.exists('intro_video')) {
			this.video = this.add.video(this.cameras.main.x, this.cameras.main.y, 'intro_video');

			if ((this.scale.orientation as any) === 'portrait-primary') {
				this.video.setScale(2);
				this.video.setOrigin(Alpha.MEDIUM, 0);
			} else {
				// if Landscape, just fits the video on the canvas.
				this.video.scaleX = this.cameras.main.width / this.video.width;
				this.video.scaleY = this.cameras.main.height / this.video.height;
				this.video.setOrigin(0, 0);
			}

			this.video.setLoop(true);
			this.video.play();

			// Prevents video freeze when game is out of focus (i.e. user changes tab on the browser)
			this.video.setPaused(false);
		}

		this.sound.volume = Alpha.MEDIUM_LIGHT;
		this.themeSound = this.sound.add('forest', {
			loop: true,
		});
		this.themeSound.play();
		this.neverquestInterfaceControler = new NeverquestInterfaceController(this);

		this.gameStartText = this.add
			.text(this.cameras.main.midPoint.x, this.cameras.main.midPoint.y, UILabels.BUTTON_START_GAME, {
				fontSize: 34,
				fontFamily: this.fontFamily,
			})
			.setOrigin(0.5, 0.5)
			.setInteractive();

		this.gameStartText.on('pointerdown', () => {
			this.startGame();
		});

		this.saveManager = new NeverquestSaveManager(this);

		this.loadGameText = this.add
			.text(this.gameStartText.x, this.gameStartText.y + 60, 'Load Game', {
				fontSize: 34,
				fontFamily: this.fontFamily,
				color: this.saveManager.hasSaveData() ? HexColors.WHITE : HexColors.GRAY,
			})
			.setOrigin(0.5, 0.5)
			.setInteractive();

		this.loadGameText.on('pointerdown', () => {
			if (this.saveManager!.hasSaveData()) {
				this.loadGame();
			}
		});

		this.creditsText = this.add
			.text(this.gameStartText.x, this.gameStartText.y + Dimensions.MAIN_MENU_CREDITS_SPACING, 'Credits', {
				fontSize: 34,
				fontFamily: this.fontFamily,
			})
			.setOrigin(0.5, 0.5)
			.setInteractive();

		this.creditsText.on('pointerdown', () => {
			this.showCredits();
		});

		this.setMainMenuActions();

		this.scale.on('resize', (resize: any) => {
			this.resizeAll(resize);
		});
	}

	resizeAll(size: any): void {
		if (size && this && this.cameras && this.cameras.main) {
			this.gameStartText!.setPosition(size.width / 2, size.height / 2);
			this.loadGameText!.setPosition(this.gameStartText!.x, this.gameStartText!.y + 60);
			this.creditsText!.setPosition(
				this.gameStartText!.x,
				this.gameStartText!.y + Dimensions.MAIN_MENU_CREDITS_SPACING
			);
			this.video!.setPosition(this.cameras.main.x, this.cameras.main.y);
			if (size.aspectRatio < 1) {
				this.video!.setScale(2);
				this.video!.setOrigin(Alpha.MEDIUM, 0);
			} else {
				// if Landscape, just fits the video on the canvas.
				this.video!.scaleX = this.cameras.main.width / this.video!.width;
				this.video!.scaleY = this.cameras.main.height / this.video!.height;
				this.video!.setOrigin(0, 0);
			}
		}
	}

	setMainMenuActions(): void {
		// Sets the Firts action.
		this.neverquestInterfaceControler!.interfaceElements[0] = [];
		this.neverquestInterfaceControler!.interfaceElements[0][0] = [];
		const firstAction = {
			element: this.gameStartText,
			action: 'startGame',
			context: this,
			args: 'MainScene',
		};
		this.neverquestInterfaceControler!.closeAction = null;
		this.neverquestInterfaceControler!.currentElementAction = firstAction;
		this.neverquestInterfaceControler!.interfaceElements[0][0].push(firstAction);

		const loadGameAction = {
			element: this.loadGameText,
			action: 'loadGame',
			context: this,
			args: null as any,
		};
		this.neverquestInterfaceControler!.interfaceElements[0][1] = [];
		this.neverquestInterfaceControler!.interfaceElements[0][1].push(loadGameAction);

		const credits = {
			element: this.creditsText,
			action: 'showCredits',
			context: this,
			args: 'Credits',
		};
		this.neverquestInterfaceControler!.interfaceElements[0][2] = [];
		this.neverquestInterfaceControler!.interfaceElements[0][2].push(credits);

		this.neverquestInterfaceControler!.updateHighlightedElement(firstAction.element);
	}

	showCredits(): void {
		this.neverquestInterfaceControler!.menuHistoryAdd();
		this.panelComponent = new PanelComponent(this);
		this.creditsBackground = this.panelComponent.panelBackground;
		this.creditsTitle = this.panelComponent.panelTitle;
		this.creditsTitleText = this.panelComponent.panelTitleText;
		this.panelComponent.setTitleText('Credits');
		this.closeButton = this.panelComponent.closeButton;
		this.creditsTextContent = this.add
			.text(
				this.creditsBackground.x + 30,
				this.creditsBackground.y + this.panelComponent.backgroundMainContentPaddingTop,
				`Multiple Songs by Matthew Pablo https://matthewpablo.com/services/

Forest - Intro Scene Music by "syncopika"
            `,
				{
					wordWrap: {
						width: this.textWidth,
					},
					fontSize: 11,
					fontFamily: this.fontFamily,
				}
			)
			.setOrigin(0, 0);

		const closeAction = {
			element: this.closeButton,
			action: 'closeCredits',
			context: this,
			args: '',
		};
		this.neverquestInterfaceControler!.removeCurrentSelectionHighlight();
		this.neverquestInterfaceControler!.clearItems();
		this.neverquestInterfaceControler!.closeAction = closeAction;
		this.neverquestInterfaceControler!.currentElementAction = closeAction;
		this.neverquestInterfaceControler!.interfaceElements[0] = [];
		this.neverquestInterfaceControler!.interfaceElements[0][0] = [];
		this.neverquestInterfaceControler!.interfaceElements[0][0].push(closeAction);
		this.neverquestInterfaceControler!.updateHighlightedElement(closeAction.element);

		this.closeButton.on('pointerup', () => {
			this.closeCredits();
		});
	}

	closeCredits(): void {
		this.panelComponent!.destroy();
		this.creditsTextContent!.destroy();
		this.neverquestInterfaceControler!.closeAction = null;
		this.neverquestInterfaceControler!.currentElementAction = null;
		this.neverquestInterfaceControler!.clearItems();
		this.setMainMenuActions();
		this.neverquestInterfaceControler!.menuHistoryRetrieve();
	}

	startGame(): void {
		this.themeSound!.stop();
		this.cameras.main.fadeOut(AnimationTiming.TWEEN_NORMAL, 0, 0, 0);
		const startSound = this.sound.add('start_game');
		startSound.play();
		this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
			this.scene.start('MainScene');
			this.scene.stop();
		});
	}

	loadGame(): void {
		if (!this.saveManager!.hasSaveData()) {
			return;
		}

		const saveData = this.saveManager!.loadGame(false);
		if (saveData) {
			this.themeSound!.stop();
			this.cameras.main.fadeOut(AnimationTiming.TWEEN_NORMAL, 0, 0, 0);
			const startSound = this.sound.add('start_game');
			startSound.play();
			this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
				this.scene.start(saveData.scene);
				this.scene.stop();

				setTimeout(() => {
					const targetScene = this.scene.get(saveData.scene) as any;
					if (targetScene && targetScene.saveManager) {
						targetScene.saveManager.applySaveData(saveData);
					}
				}, 100);
			});
		}
	}
}
