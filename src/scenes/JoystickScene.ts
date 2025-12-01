import Phaser from 'phaser';
import joystick from '../plugins/VirtualJoystick/VirtualJoystickPlugin';
import joystick_atlas_image from '../assets/sprites/joystick-0.png';
import joystick_json from '../assets/sprites/joystick.json';
import { NeverquestBattleManager } from '../plugins/NeverquestBattleManager';
import { JoystickValues } from '../consts/Numbers';

export class JoystickScene extends Phaser.Scene {
	useOnScreenControls: boolean;
	player: any;
	stick: any;
	buttonAName: string;
	buttonBName: string;
	buttonA: any;
	buttonB: any;
	atlasName: string;
	isMobile: boolean;
	stickPositionMultiplier: number;
	buttonAMultiplierXposition: number;
	buttonAMultiplierYposition: number;
	neverquestBattleManager: NeverquestBattleManager | null;
	phantomStick: any;
	pad: any;

	constructor() {
		super({
			key: 'JoystickScene',
		});

		this.useOnScreenControls = true;
		this.player = null;
		this.stick = null;
		this.buttonAName = 'mobile_ButtonA';
		this.buttonBName = 'mobile_ButtonB';
		this.buttonA = null;
		this.buttonB = null;
		this.atlasName = 'joystick';
		this.isMobile = false;
		this.stickPositionMultiplier = JoystickValues.STICK_POSITION_MULTIPLIER;
		this.buttonAMultiplierXposition = JoystickValues.BUTTON_A_MULTIPLIER_X;
		this.buttonAMultiplierYposition = JoystickValues.BUTTON_A_MULTIPLIER_Y;
		this.neverquestBattleManager = null;
		this.phantomStick = null;
	}

	preload(): void {
		this.load.scenePlugin('VirtualJoystickPlugin', joystick, 'VirtualJoystickPlugin', 'pad');
		this.load.atlas(this.atlasName, joystick_atlas_image, joystick_json);
	}

	init(args: any): void {
		this.player = args.player;
	}

	create(): void {
		this.input.addPointer(6);
		this.isMobile = !this.sys.game.device.os.desktop ? true : false;
		if (this.isMobile) {
			const position_stick =
				Math.sqrt(this.cameras.main.width ** 2 + this.cameras.main.height ** 2) * this.stickPositionMultiplier;

			this.stick = this.pad.addHiddenStick(JoystickValues.STICK_RADIUS);
			this.phantomStick = this.pad
				.addStick(0, 0, JoystickValues.STICK_RADIUS, this.atlasName, 'base', 'stick')
				.alignBottomLeft(position_stick);

			this.buttonA = this.pad
				.addButton(0, JoystickValues.STICK_RADIUS, this.atlasName, 'button0-up', 'button0-down')
				.setName(this.buttonAName);
			this.buttonA.posX = this.cameras.main.width - this.cameras.main.width * this.buttonAMultiplierXposition;
			this.buttonA.posY = this.cameras.main.height - this.cameras.main.height * this.buttonAMultiplierXposition;

			// Sets the button B
			// this.buttonB = this.pad
			//     .addButton(0, 120, this.atlasName, 'button1-up', 'button1-down')
			//     .setName(this.buttonBName)
			//     .alignBottomRight(100);
			// this.buttonB.posX = this.cameras.main.width - 50;
			// this.buttonB.posY = this.cameras.main.height - 250;

			this.events.emit('setStick', this.stick);

			this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
				const leftHalfX = this.cameras.main.width / 2;
				if (pointer.x < leftHalfX) {
					this.phantomStick.posX = pointer.x;
					this.phantomStick.posY = pointer.y;
					this.phantomStick.isDown = true;
				} else {
					this.stick.isDown = false;
				}
			});
			this.input.on('pointerup', () => {
				if (!this.phantomStick.isDown) {
					const position_resized =
						Math.sqrt(this.cameras.main.width ** 2 + this.cameras.main.height ** 2) *
						this.stickPositionMultiplier;
					this.phantomStick.alignBottomLeft(position_resized);
				}
			});

			this.scale.on('resize', (resize: any) => {
				if (this.stick) {
					const position_resized =
						Math.sqrt(resize.width ** 2 + resize.height ** 2) * this.stickPositionMultiplier;
					this.stick.alignBottomLeft(position_resized);
					if (this.buttonA) {
						this.buttonA.posX =
							this.cameras.main.width - this.cameras.main.width * this.buttonAMultiplierXposition;
						this.buttonA.posY =
							this.cameras.main.height - this.cameras.main.height * this.buttonAMultiplierYposition;
					}
					// Button B not used for now.
					if (this.buttonB) {
						this.buttonB.posX = this.cameras.main.width - 50;
						this.buttonB.posY = this.cameras.main.height - JoystickValues.BUTTON_B_OFFSET_Y;
					}
				}
			});
		}
		this.events.emit('JoystickReady');
		// this.debugText = this.add.text(0, 0);
		this.createButtonActions();
		this.neverquestBattleManager = new NeverquestBattleManager();
	}

	createButtonActions(): void {
		if (this.buttonA) {
			this.buttonA.on('down', () => {
				if (this.player && this.player.active && this.player.canAtack && !this.player.isAtacking) {
					this.neverquestBattleManager.atack(this.player);
				}
			});
		}
	}

	update(): void {
		// if (this.debugText)
		//     this.debugText.setText(
		//         `Pointer 1: ${this.input.pointer1.isDown}, Pointer 2: ${this.input.pointer2.isDown})`
		//     );
		// if (
		//     this.useOnScreenControls &&
		//     this.player &&
		//     this.player.body &&
		//     this.input.pointer1.isDown &&
		//     !this.input.pointer2.isDown
		// ) {
		//     if (
		//         this.stick &&
		//         this.stick.isDown &&
		//         this.player.body.maxSpeed > 0
		//     ) {
		//         this.physics.velocityFromRotation(
		//             this.stick.rotation,
		//             this.stick.force * this.player.speed,
		//             this.player.body.velocity
		//         );
		//     }
		// }
	}
}
