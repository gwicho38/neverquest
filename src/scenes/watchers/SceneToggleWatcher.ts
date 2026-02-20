/**
 * @fileoverview Scene visibility toggle utility
 *
 * This file provides scene management utilities:
 * - Toggles scene visibility (launch/stop)
 * - Manages player state during scene transitions
 * - Controls canMove and canAtack flags appropriately
 *
 * @see IconDeviceChange - Device-based texture changes
 * @see InventoryScene - Common toggle target
 *
 * @module scenes/watchers/SceneToggleWatcher
 */

import Phaser from 'phaser';
import { Player } from '../../entities/Player';

export class SceneToggleWatcher {
	static toggleScene(sceneContext: Phaser.Scene, name: string, player: Player): void {
		if (!sceneContext.scene.isVisible(name)) {
			console.log(`[SceneToggleWatcher] Opening scene: ${name}`);
			sceneContext.scene.launch(name, {
				player: player,
			});
			player.canMove = false;
			console.log(`[SceneToggleWatcher] Scene opened - canMove: ${player.canMove}, canAtack: ${player.canAtack}`);
		} else {
			console.log(
				`[SceneToggleWatcher] Closing scene: ${name} - Before: canMove: ${player.canMove}, canAtack: ${player.canAtack}`
			);
			sceneContext.scene.get(name).scene.stop();
			player.canMove = true;
			player.canAtack = true;
			console.log(
				`[SceneToggleWatcher] Scene closed - After: canMove: ${player.canMove}, canAtack: ${player.canAtack}`
			);
		}
	}
}
