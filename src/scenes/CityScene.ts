import Phaser from 'phaser';
import { CITY, CITY_BUILDINGS, CITY_JOB, CITY_STYLE as S, CITY_TEXT as T } from '../consts/City';
import { NeverquestCitySimulation } from '../plugins/NeverquestCitySimulation';

/** A playable district with original code-drawn pixel art and no external assets. */
export class CityScene extends Phaser.Scene {
	simulation: NeverquestCitySimulation;
	private pedestrian: Phaser.GameObjects.Container;
	private vehicle: Phaser.GameObjects.Container;
	private vehicleLabel: Phaser.GameObjects.Text;
	private followTarget: Phaser.GameObjects.Zone;
	private marker: Phaser.GameObjects.Arc;
	private hud: Phaser.GameObjects.Container;
	private status: Phaser.GameObjects.Text;
	private objective: Phaser.GameObjects.Text;
	private controls: Phaser.GameObjects.Text;
	private notice: Phaser.GameObjects.Text;
	private minimap: Phaser.GameObjects.Graphics;
	private keys: Record<string, Phaser.Input.Keyboard.Key>;

	constructor() {
		super({ key: CITY.scene });
	}

	create(): void {
		this.simulation = new NeverquestCitySimulation();
		this.cameras.main.setBackgroundColor(S.background);
		this.cameras.main.setBounds(0, 0, CITY.width, CITY.height);
		this.drawDistrict();
		this.createActors();
		this.marker = this.add
			.circle(CITY_JOB.pickup.x, CITY_JOB.pickup.y, S.markerRadius)
			.setStrokeStyle(2, S.cyan)
			.setDepth(5);
		this.followTarget = this.add.zone(CITY.spawn.x, CITY.spawn.y, 1, 1);
		this.cameras.main.startFollow(this.followTarget, true, 0.12, 0.12);
		this.createHud();
		this.keys = this.input.keyboard?.addKeys(S.keys) as Record<string, Phaser.Input.Keyboard.Key>;
		this.input.keyboard?.on('keydown-F', this.enterOrExit, this);
		this.input.keyboard?.on('keydown-E', this.interact, this);
		this.input.keyboard?.on('keydown-ESC', this.returnToMenu, this);
		this.scale.on(Phaser.Scale.Events.RESIZE, this.layoutHud, this);
		const unsubscribe = this.simulation.onChange(() => this.refreshHud());
		this.time.addEvent({ delay: S.hudRefresh, loop: true, callback: this.refreshHud, callbackScope: this });
		this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
			unsubscribe();
			this.scale.off(Phaser.Scale.Events.RESIZE, this.layoutHud, this);
			this.input.keyboard?.off('keydown-F', this.enterOrExit, this);
			this.input.keyboard?.off('keydown-E', this.interact, this);
			this.input.keyboard?.off('keydown-ESC', this.returnToMenu, this);
		});
		this.refreshHud();
	}

	private drawDistrict(): void {
		const g = this.add.graphics();
		for (const x of CITY.roadsX) {
			g.fillStyle(S.sidewalk).fillRect(x - CITY.sidewalkWidth / 2, 0, CITY.sidewalkWidth, CITY.height);
			g.fillStyle(S.street).fillRect(x - CITY.roadWidth / 2, 0, CITY.roadWidth, CITY.height);
		}
		for (const y of CITY.roadsY) {
			g.fillStyle(S.sidewalk).fillRect(0, y - CITY.sidewalkWidth / 2, CITY.width, CITY.sidewalkWidth);
			g.fillStyle(S.street).fillRect(0, y - CITY.roadWidth / 2, CITY.width, CITY.roadWidth);
		}
		// Clear the intersections, then paint lane markers and pedestrian crossings.
		for (const x of CITY.roadsX) {
			for (const y of CITY.roadsY) {
				g.fillStyle(S.street).fillRect(
					x - CITY.roadWidth / 2,
					y - CITY.sidewalkWidth / 2,
					CITY.roadWidth,
					CITY.sidewalkWidth
				);
				for (let stripe = -36; stripe <= 36; stripe += 12) {
					g.fillStyle(S.white, 0.35).fillRect(x + stripe, y - 66, 6, 12);
					g.fillRect(x + stripe, y + 54, 6, 12);
				}
			}
			for (let y = 0; y < CITY.height; y += S.laneGap) {
				if (CITY.roadsY.some((road) => Math.abs(road - y) < CITY.sidewalkWidth / 2)) continue;
				g.fillStyle(S.marking).fillRect(x - 1, y, 2, S.laneDash);
			}
		}
		for (const y of CITY.roadsY) {
			for (let x = 0; x < CITY.width; x += S.laneGap) {
				if (CITY.roadsX.some((road) => Math.abs(road - x) < CITY.sidewalkWidth / 2)) continue;
				g.fillStyle(S.marking).fillRect(x, y - 1, S.laneDash, 2);
			}
		}
		CITY_BUILDINGS.forEach((b, index) => {
			const neon = index % 2 ? S.pink : S.cyan;
			g.fillStyle(S.shadow, 0.55).fillRect(b.x + 10, b.y + 14, b.width, b.height);
			g.fillStyle(S.roofEdge).fillRect(b.x, b.y, b.width, b.height);
			g.fillStyle(b.color).fillRect(b.x + 3, b.y + 3, b.width - 6, b.height - 6);
			g.lineStyle(1, S.ink, 0.4).strokeRect(
				b.x + S.roofInset,
				b.y + S.roofInset,
				b.width - S.roofInset * 2,
				b.height - S.roofInset * 2
			);
			// Roof units, lit windows, and neon shopfronts establish scale and orientation.
			g.fillStyle(S.shadow).fillRect(b.x + 36, b.y + 32, 44, 32);
			g.fillStyle(S.sidewalk).fillRect(b.x + 34, b.y + 28, 44, 32);
			for (let x = b.x + 20; x < b.x + b.width - 20; x += S.windowGap) {
				g.fillStyle(S.gold, 0.6).fillRect(x, b.y + b.height - 15, S.windowSize, S.windowSize);
			}
			g.fillStyle(neon, 0.08).fillRect(b.x, b.y + b.height, b.width, 24);
			g.fillStyle(neon).fillRect(b.x + 30, b.y + b.height - 3, b.width - 60, 3);
			this.add
				.text(b.x + b.width / 2, b.y + b.height / 2, b.name, {
					fontFamily: S.font,
					fontSize: S.labelSize,
					color: index % 2 ? '#f37bae' : S.accent,
					backgroundColor: '#19252b',
					padding: { x: 8, y: 5 },
				})
				.setOrigin(0.5);
		});
		for (const point of [CITY_JOB.pickup, CITY_JOB.dropoff]) {
			const pickup = point === CITY_JOB.pickup;
			this.add.circle(point.x, point.y, S.markerRadius, pickup ? S.cyan : S.gold, 0.08);
			this.add
				.text(point.x, point.y - S.markerRadius - 16, pickup ? T.contact : T.destination, {
					fontFamily: S.font,
					fontSize: S.labelSize,
					color: S.text,
					backgroundColor: '#111722',
					padding: { x: 5, y: 3 },
				})
				.setOrigin(0.5);
		}
	}

	private createActors(): void {
		const carArt = this.add.graphics();
		carArt.fillStyle(S.shadow, 0.5).fillRect(-20, -9, 42, 24);
		carArt.fillStyle(S.ink).fillRect(-15, -14, 9, 28).fillRect(8, -14, 9, 28);
		carArt.fillStyle(S.pink).fillRect(-S.carWidth / 2, -S.carHeight / 2, S.carWidth, S.carHeight);
		carArt.fillStyle(0xb55e8e).fillRect(-10, -9, 20, 18);
		carArt.fillStyle(0x9ed9dd).fillRect(4, -8, 6, 16);
		carArt.fillStyle(S.ink).fillRect(-12, -8, 4, 16);
		carArt.fillStyle(S.white).fillRect(17, -9, 3, 5).fillRect(17, 4, 3, 5);
		carArt.fillStyle(S.gold, 0.06).fillRect(20, -12, 60, 24);
		this.vehicle = this.add.container(CITY.carSpawn.x, CITY.carSpawn.y, [carArt]).setDepth(8);
		this.vehicleLabel = this.add.text(CITY.carSpawn.x + 32, CITY.carSpawn.y + 30, T.car, {
			fontFamily: S.font,
			fontSize: S.labelSize,
			color: S.text,
		});
		const person = this.add.graphics();
		person.fillStyle(S.shadow, 0.5).fillEllipse(2, 5, 20, 12);
		person.fillStyle(S.ink).fillRect(-6, 3, 5, 7).fillRect(2, 3, 5, 7);
		person.fillStyle(S.cyan).fillRect(-8, -5, S.playerWidth, 11);
		person.fillStyle(S.white).fillRect(-4, -8, 8, 8);
		person.fillStyle(S.ink).fillRect(-4, -10, 8, 4);
		this.pedestrian = this.add.container(CITY.spawn.x, CITY.spawn.y, [person]).setDepth(9);
	}

	private createHud(): void {
		const style = { fontFamily: S.font, fontSize: S.fontSize, color: S.text };
		const title = this.add.text(0, 0, T.title, { ...style, fontSize: S.titleSize, color: S.accent });
		const subtitle = this.add.text(0, 30, T.subtitle, { ...style, color: S.muted, fontSize: 12 });
		this.status = this.add.text(0, 54, '', style);
		this.objective = this.add.text(0, 0, '', { ...style, backgroundColor: '#111722', padding: { x: 12, y: 10 } });
		this.controls = this.add.text(0, 0, T.controls, { ...style, color: S.muted, fontSize: 12 });
		this.notice = this.add.text(0, 0, '', { ...style, color: '#f9d47e' });
		this.minimap = this.add.graphics();
		const backdrop = this.add.rectangle(-10, -10, 390, 100, S.ink, 0.94).setOrigin(0);
		this.hud = this.add
			.container(S.margin, S.margin, [
				backdrop,
				title,
				subtitle,
				this.status,
				this.objective,
				this.controls,
				this.notice,
				this.minimap,
			])
			.setScrollFactor(0)
			.setDepth(S.hudDepth);
		this.layoutHud();
	}

	private layoutHud(): void {
		const width = this.scale.width - S.margin * 2;
		this.objective.setPosition(0, this.scale.height - S.hudHeight - S.margin);
		this.objective.setWordWrapWidth(width - 24);
		this.controls.setPosition(0, this.scale.height - S.margin - 44).setWordWrapWidth(width);
		this.notice.setPosition(0, S.hudHeight).setWordWrapWidth(width);
		this.minimap.setPosition(width - S.mapWidth, 0).setVisible(width > 600);
	}

	private refreshHud(): void {
		const city = this.simulation;
		this.status.setText(`$${city.cash}  /  ${city.driving ? T.driving : T.onFoot}  /  ${T.sessionOnly}`);
		this.objective.setText(city.job === 'carrying' ? T.deliver : city.job === 'complete' ? T.complete : T.pickup);
		this.controls.setText(city.driving ? T.drivingControls : T.controls);
		this.marker
			.setPosition(city.destination.x, city.destination.y)
			.setStrokeStyle(2, city.job === 'carrying' ? S.gold : S.cyan);
		const map = this.minimap.clear();
		const scale = S.mapWidth / CITY.width;
		map.fillStyle(S.ink, 0.94).fillRect(-6, -6, S.mapWidth + 12, S.mapHeight + 12);
		for (const b of CITY_BUILDINGS)
			map.fillStyle(S.sidewalk).fillRect(b.x * scale, b.y * scale, b.width * scale, b.height * scale);
		map.fillStyle(S.gold).fillCircle(city.destination.x * scale, city.destination.y * scale, 3);
		map.fillStyle(S.pink).fillCircle(city.car.x * scale, city.car.y * scale, 2);
		map.fillStyle(S.cyan).fillCircle(city.position.x * scale, city.position.y * scale, 3);
	}

	private enterOrExit(event: KeyboardEvent): void {
		if (event.repeat) return;
		const message = this.simulation.driving ? T.blockedExit : T.noCar;
		this.notice.setText(this.simulation.toggleVehicle() ? '' : message);
	}

	private interact(event: KeyboardEvent): void {
		if (event.repeat) return;
		this.notice.setText(this.simulation.interact() ? '' : T.noInteraction);
	}

	private returnToMenu(): void {
		this.scene.start(CITY.menuScene);
	}

	update(_time: number, delta: number): void {
		if (!this.simulation || !this.keys) return;
		const down = (...names: string[]): number => Number(names.some((name) => this.keys[name]?.isDown));
		const x = down('D', 'RIGHT') - down('A', 'LEFT');
		const y = down('S', 'DOWN') - down('W', 'UP');
		this.simulation.update(delta / 1000, { x, y, run: !!down('SHIFT'), brake: !!down('SPACE') });
		const city = this.simulation;
		this.pedestrian.setPosition(city.pedestrian.x, city.pedestrian.y).setVisible(!city.driving);
		if (!city.driving && (x || y)) this.pedestrian.setRotation(Math.atan2(y, x) + Math.PI / 2);
		this.vehicle.setPosition(city.car.x, city.car.y).setRotation(city.car.heading);
		this.vehicleLabel.setPosition(city.car.x + 32, city.car.y + 30).setVisible(!city.driving);
		this.followTarget.setPosition(city.position.x, city.position.y);
	}
}
