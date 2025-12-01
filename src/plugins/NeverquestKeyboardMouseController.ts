import { AttributeSceneName } from '../scenes/AttributeScene';
import { InventorySceneName } from '../scenes/InventoryScene';
import { SceneToggleWatcher } from '../scenes/watchers/SceneToggleWatcher';
import { NeverquestBattleManager } from './NeverquestBattleManager';
import { DebugMessages } from '../consts/Messages';

/**
 * @class
 */
export class NeverquestKeyboardMouseController {
	/**
	 * The scene.
	 */
	scene: Phaser.Scene;

	/**
	 * The Player that will receive the inputs and interactions.
	 */
	player: any;

	/**
	 * The Neverquest Battle Manager.
	 */
	neverquestBattleManager: NeverquestBattleManager | null;

	/**
	 * The name of the inventory Scene. It should match the Scene name so the player is able to open the inventory.
	 */
	inventorySceneName: string;

	/**
	 * The name of the Attribute Management/Info Scene.
	 */
	attributeSceneName: string;

	/**
	 * This class is responsible for managing all keyboard and mouse inputs.
	 * This class should be imported only once in your Scene, and should not be active in multiple scenes, so you can better manage the player inputs.
	 * @param scene The Scene which this class is a child.
	 * @param player The player to manage the input.
	 */
	constructor(scene: Phaser.Scene, player: any) {
		this.scene = scene;
		this.player = player;
		this.neverquestBattleManager = null;
		this.inventorySceneName = InventorySceneName;
		this.attributeSceneName = AttributeSceneName;
	}

	/**
	 * Created all logic for keyboard and mouse.
	 */
	create(): void {
		const isMobile = !this.scene.sys.game.device.os.desktop ? true : false;
		this.scene.input.mouse.disableContextMenu();
		this.neverquestBattleManager = new NeverquestBattleManager();
		this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
			if (pointer.leftButtonDown() && !isMobile && this.player && this.player.active && !this.player.isSwimming) {
				this.neverquestBattleManager!.atack(this.player);
			}
		});

		this.scene.input.keyboard!.on('keydown', (keydown: KeyboardEvent) => {
			// Space key (32) - Jump
			if (keydown.keyCode === 32) {
				if (this.player && this.player.active && this.player.canJump && this.player.canMove) {
					this.player.jump();
				}
			}

			// J key (74) - Attack
			if (keydown.keyCode === 74) {
				const attackAllowed = !!(
					this.player &&
					this.player.active &&
					this.player.canAtack &&
					this.player.canMove &&
					!this.player.isSwimming
				);

				if (!attackAllowed) {
					const failedConditions = [
						!this.player && 'no player',
						this.player && !this.player.active && DebugMessages.PLAYER_NOT_ACTIVE,
						this.player && !this.player.canAtack && 'canAtack=false',
						this.player && !this.player.canMove && 'canMove=false',
						this.player && this.player.isSwimming && 'swimming',
					].filter(Boolean);

					console.warn('🚫 ATTACK BLOCKED:', failedConditions.join(', '), {
						hasPlayer: !!this.player,
						active: this.player?.active,
						canAtack: this.player?.canAtack,
						canMove: this.player?.canMove,
						isSwimming: this.player?.isSwimming,
						isAtacking: this.player?.isAtacking,
						isBlocking: this.player?.isBlocking,
					});
				} else {
					console.log('✅ Attack allowed');
				}

				if (attackAllowed) {
					this.neverquestBattleManager!.atack(this.player);
				}
			}
			// K key (75) - Block
			if (
				keydown.keyCode === 75 &&
				this.player &&
				this.player.active &&
				this.player.canBlock &&
				this.player.canMove &&
				!this.player.isSwimming
			) {
				this.neverquestBattleManager!.block(this.player);
			}
			// L key (76) - Roll
			if (keydown.keyCode === 76) {
				if (this.player && this.player.active && this.player.canRoll && this.player.canMove) {
					this.player.roll();
				}
			}
			// I key (73) - Inventory (only block if canMove is false)
			if (keydown.keyCode === 73 && this.player && this.player.active && this.player.canMove) {
				console.log('[KeyboardController] Inventory (I) key pressed - toggling scene');
				SceneToggleWatcher.toggleScene(this.scene, this.inventorySceneName, this.player);
			}
			// U key (85) - Attributes (only block if canMove is false)
			if (keydown.keyCode === 85 && this.player && this.player.active && this.player.canMove) {
				console.log('[KeyboardController] Attributes (U) key pressed - toggling scene');
				SceneToggleWatcher.toggleScene(this.scene, this.attributeSceneName, this.player);
			}
		});

		this.scene.input.keyboard!.on('keyup', (keyup: KeyboardEvent) => {
			// K key (75) - Stop Block
			if (keyup.keyCode === 75 && this.player && this.player.active && !this.player.isSwimming) {
				this.neverquestBattleManager!.stopBlock(this.player);
			}
		});
	}
}
