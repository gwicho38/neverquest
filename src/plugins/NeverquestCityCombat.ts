import { CITY_COMBAT as C } from '../consts/City';
import type { ICityPoint } from './NeverquestCitySimulation';

interface ICityShot {
	start: ICityPoint;
	end: ICityPoint;
	owner: 'player' | 'enemy';
	remaining: number;
}

/** Original hitscan combat: one pistol and a lookout with dodgeable, locked aim. */
export class NeverquestCityCombat {
	health: number = C.playerHealth;
	ammo: number = C.magazineSize;
	reloadRemaining = 0;
	hitFlashRemaining = 0;
	enemy: ICityPoint & { health: number; aim: ICityPoint | null; windup: number } = {
		...C.enemySpawn,
		health: C.enemyHealth,
		aim: null,
		windup: 0,
	};
	traces: ICityShot[] = [];
	private shotCooldown = 0;
	private enemyCooldown = 0;

	constructor(
		private clearAt: (point: ICityPoint) => boolean,
		private changed: () => void
	) {}

	get defeated(): boolean {
		return this.health <= 0;
	}

	private ray(start: ICityPoint, aim: ICityPoint, range: number, target: ICityPoint, radius: number) {
		const length = Math.hypot(aim.x - start.x, aim.y - start.y);
		const direction = { x: (aim.x - start.x) / length, y: (aim.y - start.y) / length };
		let end = { x: start.x, y: start.y };
		if (!length || !Number.isFinite(length)) return { end, hit: false };
		for (let distance = 0; distance <= range; distance += C.rayStep) {
			const point = { x: start.x + direction.x * distance, y: start.y + direction.y * distance };
			if (!this.clearAt(point)) break;
			end = point;
			if (Math.hypot(point.x - target.x, point.y - target.y) <= radius) return { end, hit: true };
		}
		return { end, hit: false };
	}

	shoot(origin: ICityPoint, aim: ICityPoint, driving: boolean): boolean {
		const length = Math.hypot(aim.x - origin.x, aim.y - origin.y);
		if (this.defeated || driving || !this.ammo || this.reloadRemaining > 0 || this.shotCooldown > 0) return false;
		if (!Number.isFinite(length) || length === 0) return false;
		this.ammo--;
		this.shotCooldown = C.shotInterval;
		const shot = this.ray(origin, aim, C.playerRange, this.enemy, this.enemy.health > 0 ? C.enemyRadius : -1);
		if (shot.hit) {
			this.enemy.health--;
			if (this.enemy.health === 0) this.enemy.aim = null;
		}
		this.traces.push({ start: { ...origin }, end: shot.end, owner: 'player', remaining: C.traceSeconds });
		this.changed();
		return true;
	}

	reload(driving: boolean): boolean {
		if (driving || this.defeated || this.reloadRemaining > 0 || this.ammo === C.magazineSize) return false;
		this.reloadRemaining = C.reloadSeconds;
		this.changed();
		return true;
	}

	update(dt: number, player: ICityPoint, driving: boolean): void {
		this.shotCooldown = Math.max(0, this.shotCooldown - dt);
		this.hitFlashRemaining = Math.max(0, this.hitFlashRemaining - dt);
		this.traces = this.traces.filter((trace) => (trace.remaining -= dt) > 0);
		if (this.reloadRemaining > 0) {
			this.reloadRemaining = Math.max(0, this.reloadRemaining - dt);
			if (this.reloadRemaining === 0) {
				this.ammo = C.magazineSize;
				this.changed();
			}
		}
		if (driving || this.defeated || this.enemy.health <= 0) {
			if (this.enemy.aim) {
				this.enemy.aim = null;
				this.changed();
			}
			return;
		}
		if (this.enemy.aim) {
			this.enemy.windup -= dt;
			if (this.enemy.windup > 0) return;
			const shot = this.ray(this.enemy, this.enemy.aim, C.enemyRange, player, C.playerRadius);
			this.traces.push({
				start: { x: this.enemy.x, y: this.enemy.y },
				end: shot.end,
				owner: 'enemy',
				remaining: C.traceSeconds,
			});
			this.enemy.aim = null;
			this.enemyCooldown = C.enemyInterval;
			if (shot.hit) {
				this.health--;
				this.hitFlashRemaining = C.hitFlashSeconds;
				if (this.defeated) this.reloadRemaining = 0;
			}
			this.changed();
			return;
		}
		this.enemyCooldown = Math.max(0, this.enemyCooldown - dt);
		if (this.enemyCooldown > 0 || Math.hypot(player.x - this.enemy.x, player.y - this.enemy.y) > C.enemyRange)
			return;
		if (this.ray(this.enemy, player, C.enemyRange, player, C.playerRadius).hit) {
			this.enemy.aim = { ...player };
			this.enemy.windup = C.enemyWindup;
			this.changed();
		}
	}

	reset(): void {
		this.health = C.playerHealth;
		this.ammo = C.magazineSize;
		this.reloadRemaining = this.shotCooldown = this.enemyCooldown = this.hitFlashRemaining = 0;
		this.enemy = { ...C.enemySpawn, health: C.enemyHealth, aim: null, windup: 0 };
		this.traces = [];
		this.changed();
	}
}
