import { CITY, CITY_BUILDINGS, CITY_JOB, CITY_COMBAT } from '../consts/City';
import { NeverquestCityCombat } from './NeverquestCityCombat';

export interface ICityPoint {
	x: number;
	y: number;
}

export interface ICityInput extends ICityPoint {
	run?: boolean;
	brake?: boolean;
}

/** Owns city state. Phaser only supplies input and renders the result. */
export class NeverquestCitySimulation {
	pedestrian: ICityPoint = { ...CITY.spawn };
	car = { ...CITY.carSpawn, speed: 0 } as ICityPoint & { heading: number; speed: number };
	driving = false;
	job: 'available' | 'carrying' | 'complete' = 'available';
	cash = 0;
	private listeners = new Set<() => void>();
	readonly combat = new NeverquestCityCombat(
		(point) => this.canOccupy(point, CITY_COMBAT.coverRadius),
		() => this.emitChange()
	);

	fireAt(target: ICityPoint): boolean {
		return this.combat.shoot(this.pedestrian, target, this.driving);
	}

	reloadOrRetry(): boolean {
		if (!this.combat.defeated) return this.combat.reload(this.driving);
		this.pedestrian = { ...CITY.spawn };
		this.car = { ...CITY.carSpawn, speed: 0 };
		this.driving = false;
		this.combat.reset();
		return true;
	}

	get position(): ICityPoint {
		const { x, y } = this.driving ? this.car : this.pedestrian;
		return { x, y };
	}

	get destination(): ICityPoint {
		return this.job === 'carrying' ? CITY_JOB.dropoff : CITY_JOB.pickup;
	}

	onChange(listener: () => void): () => void {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	private emitChange(): void {
		this.listeners.forEach((listener) => listener());
	}

	/** Checks the complete body, including at building corners. */
	canOccupy(point: ICityPoint, radius: number): boolean {
		if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) return false;
		if (point.x < radius || point.y < radius || point.x > CITY.width - radius || point.y > CITY.height - radius) {
			return false;
		}
		return !CITY_BUILDINGS.some((building) => {
			const x = Math.max(building.x, Math.min(point.x, building.x + building.width));
			const y = Math.max(building.y, Math.min(point.y, building.y + building.height));
			return Math.hypot(point.x - x, point.y - y) < radius;
		});
	}

	/** Small collision steps prevent fast cars from passing through walls. */
	private move(point: ICityPoint, dx: number, dy: number, radius: number): boolean {
		const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) / CITY.moveStep));
		let collided = false;
		for (let i = 0; i < steps; i++) {
			const nextX = { x: point.x + dx / steps, y: point.y };
			if (this.canOccupy(nextX, radius)) point.x = nextX.x;
			else collided = true;
			const nextY = { x: point.x, y: point.y + dy / steps };
			if (this.canOccupy(nextY, radius)) point.y = nextY.y;
			else collided = true;
		}
		return collided;
	}

	update(seconds: number, input: ICityInput): void {
		if (!Number.isFinite(seconds) || seconds <= 0) return;
		const dt = Math.min(seconds, CITY.maxDelta);
		const x = Math.max(-1, Math.min(1, input.x));
		const y = Math.max(-1, Math.min(1, input.y));
		if (!Number.isFinite(x) || !Number.isFinite(y)) return;
		this.combat.update(dt, this.position, this.driving);
		if (this.combat.defeated) return;
		if (!this.driving) {
			const length = Math.max(1, Math.hypot(x, y));
			const speed = CITY.walkSpeed * (input.run ? CITY.runMultiplier : 1);
			this.move(this.pedestrian, (x / length) * speed * dt, (y / length) * speed * dt, CITY.walkRadius);
			return;
		}
		if (input.brake || y === 0) {
			const reduction = (input.brake ? CITY.braking : CITY.drag) * dt;
			this.car.speed = Math.sign(this.car.speed) * Math.max(0, Math.abs(this.car.speed) - reduction);
		} else {
			this.car.speed = Math.max(
				-CITY.reverseSpeed,
				Math.min(CITY.maxSpeed, this.car.speed - y * CITY.acceleration * dt)
			);
		}
		const steering = Math.min(1, Math.abs(this.car.speed) / CITY.reverseSpeed);
		this.car.heading += x * CITY.steerSpeed * dt * steering * Math.sign(this.car.speed);
		if (
			this.move(
				this.car,
				Math.cos(this.car.heading) * this.car.speed * dt,
				Math.sin(this.car.heading) * this.car.speed * dt,
				CITY.carRadius
			)
		) {
			this.car.speed = 0;
		}
	}

	toggleVehicle(): boolean {
		if (this.combat.defeated) return false;
		if (!this.driving) {
			if (Math.hypot(this.pedestrian.x - this.car.x, this.pedestrian.y - this.car.y) > CITY.enterRadius)
				return false;
			this.driving = true;
		} else {
			if (Math.abs(this.car.speed) > CITY.exitSpeed) return false;
			const angles = [Math.PI / 2, -Math.PI / 2, Math.PI, 0];
			const exit = angles
				.map((angle) => ({
					x: this.car.x + Math.cos(this.car.heading + angle) * CITY.exitOffset,
					y: this.car.y + Math.sin(this.car.heading + angle) * CITY.exitOffset,
				}))
				.find((point) => this.canOccupy(point, CITY.walkRadius));
			if (!exit) return false;
			this.pedestrian = exit;
			this.car.speed = 0;
			this.driving = false;
		}
		this.emitChange();
		return true;
	}

	/** Interaction is explicit; overlap never changes mission or vehicle state. */
	interact(): boolean {
		if (this.driving || this.combat.defeated) return false;
		const destination = this.destination;
		if (Math.hypot(this.pedestrian.x - destination.x, this.pedestrian.y - destination.y) > CITY_JOB.radius)
			return false;
		if (this.job === 'carrying') {
			this.cash += CITY_JOB.reward;
			this.job = 'complete';
		} else {
			this.job = 'carrying';
		}
		this.emitChange();
		return true;
	}
}
