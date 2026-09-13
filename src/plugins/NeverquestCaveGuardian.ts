/** A stationary cave guardian with readable, avoidable ground slams. */
import Phaser from 'phaser';
import PhaserJuice from 'phaser3-juice-plugin';
import { Enemy } from '../entities/Enemy';
import { Player } from '../entities/Player';
import { ChapterOne as C } from '../consts/ChapterOne';

type GuardianState = 'watching' | 'warning' | 'recovering' | 'defeated';

export class NeverquestCaveGuardian {
	readonly enemy: Enemy;
	state: GuardianState = 'watching';
	private marker: Phaser.GameObjects.Graphics;
	private label: Phaser.GameObjects.Text;
	private objective: Phaser.GameObjects.Text;
	private poll: Phaser.Time.TimerEvent;
	private pending: Phaser.Time.TimerEvent | null = null;
	private disposed = false;
	private enraged = false;

	constructor(
		private scene: Phaser.Scene,
		private player: Player,
		x: number,
		y: number,
		private onDefeated: () => void
	) {
		this.enemy = new Enemy(scene, x, y, C.GUARDIAN_TEXTURE, C.GUARDIAN_ID);
		// This encounter owns the guardian's attack cycle; ordinary chase AI is unused.
		scene.events.off('update', this.enemy.onUpdate, this.enemy);
		Object.assign(this.enemy.attributes, {
			health: C.GUARDIAN_HEALTH,
			maxHealth: C.GUARDIAN_HEALTH,
			atack: C.GUARDIAN_ATTACK,
			defense: C.GUARDIAN_DEFENSE,
			flee: 0,
			critical: 0,
		});
		this.enemy.setScale(C.GUARDIAN_SCALE).setTint(C.GUARDIAN_TINT);
		this.enemy.changeBodySize(this.enemy.displayWidth, this.enemy.displayHeight);
		(this.enemy.container.body as Phaser.Physics.Arcade.Body).setImmovable(true);
		this.enemy.anims.play(C.GUARDIAN_IDLE);
		this.enemy.healthBar.full = C.GUARDIAN_HEALTH;
		this.enemy.healthBar.size = C.HEALTH_BAR_WIDTH;
		this.enemy.healthBar.setPosition(-C.HEALTH_BAR_WIDTH / 2, C.HEALTH_BAR_Y);
		this.enemy.healthBar.update(C.GUARDIAN_HEALTH);
		this.enemy.neverquestBattleManager.phaserJuice = new PhaserJuice(scene, scene.plugins);
		this.label = scene.add
			.text(x, y + C.LABEL_Y, C.NAME, {
				fontFamily: C.FONT,
				fontSize: C.WORLD_FONT_SIZE,
				color: C.TEXT_COLOR,
			})
			.setOrigin(0.5);
		this.marker = scene.add.graphics().setDepth(C.WARNING_DEPTH);
		this.objective = scene.add
			.text(0, 0, C.SEARCH, {
				fontFamily: C.FONT,
				fontSize: C.HUD_FONT_SIZE,
				color: C.TEXT_COLOR,
				backgroundColor: C.PANEL_COLOR,
				align: 'center',
				padding: { x: C.PANEL_PADDING_X, y: C.PANEL_PADDING_Y },
			})
			.setOrigin(0.5)
			.setScrollFactor(0)
			.setDepth(C.WARNING_DEPTH);
		this.layout();
		scene.scale.on('resize', this.layout, this);
		this.poll = scene.time.addEvent({
			delay: C.CHECK_INTERVAL_MS,
			loop: true,
			callback: this.check,
			callbackScope: this,
		});
		scene.events.once('shutdown', this.destroy, this);
	}

	private layout(): void {
		const camera = this.scene.cameras.main;
		this.objective.setPosition(camera.width / 2, camera.height / 2 - (camera.height / 2 - C.HUD_TOP) / camera.zoom);
		this.objective.setScale(1 / camera.zoom);
		this.objective.setWordWrapWidth(camera.width * C.HUD_WIDTH_FRACTION);
	}

	/** Timer-driven checks keep scene transitions and attack state out of overlap callbacks. */
	check(): void {
		if (this.disposed || this.state === 'defeated') return;
		if (this.enemy.attributes.health <= 0) {
			this.state = 'defeated';
			this.pending?.remove(false);
			this.marker.clear();
			this.objective.setText(C.VICTORY);
			this.onDefeated();
			return;
		}
		if (this.state !== 'watching' || !this.player.active || this.player.attributes.health <= 0) return;
		const { x, y } = this.player.container;
		const dx = this.enemy.container.x - x;
		const dy = this.enemy.container.y - y;
		if (Math.hypot(dx, dy) > C.DETECTION_RANGE) {
			const direction =
				(Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) + C.DIRECTIONS.length) % C.DIRECTIONS.length;
			this.objective.setText(`${C.SEARCH} · ${C.DIRECTIONS[direction]}`);
			return;
		}
		const visibility = (
			this.scene as Phaser.Scene & {
				lineOfSight?: { isVisible: (x1: number, y1: number, x2: number, y2: number) => boolean };
			}
		).lineOfSight;
		if (visibility && !visibility.isVisible(this.enemy.container.x, this.enemy.container.y, x, y)) return;
		this.enraged = this.enemy.attributes.health <= C.GUARDIAN_HEALTH * C.ENRAGE_THRESHOLD;
		this.state = 'warning';
		this.objective.setText(this.enraged ? `${C.ENRAGED}\n${C.WARNING}` : C.WARNING);
		this.enemy.setTint(C.WARNING_COLOR);
		this.marker.clear().fillStyle(C.WARNING_COLOR, C.WARNING_ALPHA).fillCircle(x, y, C.SLAM_RADIUS);
		this.marker.lineStyle(C.WARNING_STROKE, C.WARNING_COLOR).strokeCircle(x, y, C.SLAM_RADIUS);
		// Lock the target now: moving out of the warning must always avoid the strike.
		this.pending = this.scene.time.delayedCall(this.enraged ? C.ENRAGED_WINDUP_MS : C.WINDUP_MS, () =>
			this.strike(x, y)
		);
	}

	private strike(x: number, y: number): void {
		if (this.disposed || this.enemy.attributes.health <= 0) {
			this.check();
			return;
		}
		this.state = 'recovering';
		this.enemy.anims.play(C.GUARDIAN_STRIKE);
		this.enemy.setTint(C.RECOVERY_COLOR);
		this.objective.setText(C.RECOVERING);
		this.marker.clear().lineStyle(C.WARNING_STROKE, C.RECOVERY_COLOR).strokeCircle(x, y, C.SLAM_RADIUS);
		this.scene.cameras.main.shake(C.IMPACT_MS, C.SHAKE_STRENGTH);
		if (
			this.player.active &&
			this.player.attributes.health > 0 &&
			this.player.canTakeDamage &&
			Math.hypot(this.player.container.x - x, this.player.container.y - y) <= C.SLAM_RADIUS
		) {
			this.enemy.neverquestBattleManager.takeDamage(this.enemy, this.player);
		}
		this.pending = this.scene.time.delayedCall(this.enraged ? C.ENRAGED_RECOVERY_MS : C.RECOVERY_MS, () => {
			if (this.disposed || this.enemy.attributes.health <= 0) {
				this.check();
				return;
			}
			this.marker.clear();
			this.enemy.setTint(C.GUARDIAN_TINT);
			this.enemy.anims.play(C.GUARDIAN_IDLE);
			this.objective.setText(C.READY);
			this.state = 'watching';
		});
	}

	destroy(): void {
		if (this.disposed) return;
		this.disposed = true;
		this.poll.remove(false);
		this.pending?.remove(false);
		this.scene.events.off('shutdown', this.destroy, this);
		this.scene.scale.off('resize', this.layout, this);
		this.marker.destroy();
		this.label.destroy();
		this.objective.destroy();
	}
}
