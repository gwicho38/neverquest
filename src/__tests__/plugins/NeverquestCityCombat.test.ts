import { CITY, CITY_COMBAT as C, CITY_JOB } from '../../consts/City';
import { NeverquestCitySimulation } from '../../plugins/NeverquestCitySimulation';

const idle = { x: 0, y: 0 };
function advance(city: NeverquestCitySimulation, seconds: number): void {
	for (let elapsed = 0; elapsed < seconds; elapsed += CITY.maxDelta) city.update(CITY.maxDelta, idle);
}
function nearbyEnemy(city: NeverquestCitySimulation): void {
	city.combat.enemy.x = city.pedestrian.x + 100;
	city.combat.enemy.y = city.pedestrian.y;
}

describe('city pistol and lookout encounter', () => {
	it('requires aim, respects fire rate, and defeats the lookout after three hits', () => {
		const city = new NeverquestCitySimulation();
		nearbyEnemy(city);
		expect(city.fireAt(city.pedestrian)).toBe(false);
		expect(city.fireAt({ x: NaN, y: 0 })).toBe(false);
		expect(city.fireAt(city.combat.enemy)).toBe(true);
		expect(city.combat.enemy.health).toBe(C.enemyHealth - 1);
		expect(city.fireAt(city.combat.enemy)).toBe(false);
		advance(city, C.shotInterval);
		city.fireAt(city.combat.enemy);
		advance(city, C.shotInterval);
		city.fireAt(city.combat.enemy);
		expect(city.combat.enemy.health).toBe(0);
		expect(city.combat.enemy.aim).toBeNull();
		advance(city, 3);
		expect(city.combat.health).toBe(C.playerHealth);
	});

	it('spends ammo on misses, requires a completed reload, and expires shot traces', () => {
		const city = new NeverquestCitySimulation();
		const miss = { x: city.pedestrian.x - 100, y: city.pedestrian.y };
		for (let i = 0; i < C.magazineSize; i++) {
			expect(city.fireAt(miss)).toBe(true);
			advance(city, C.shotInterval);
		}
		expect(city.combat.ammo).toBe(0);
		expect(city.fireAt(miss)).toBe(false);
		expect(city.reloadOrRetry()).toBe(true);
		expect(city.reloadOrRetry()).toBe(false);
		advance(city, C.reloadSeconds / 2);
		expect(city.fireAt(miss)).toBe(false);
		advance(city, C.reloadSeconds);
		expect(city.combat.ammo).toBe(C.magazineSize);
		expect(city.combat.traces).toHaveLength(0);
		expect(city.fireAt(miss)).toBe(true);
	});

	it('buildings stop bullets and prevent enemy detection', () => {
		const city = new NeverquestCitySimulation();
		city.pedestrian = { x: 550, y: 530 };
		city.combat.enemy.x = 880;
		city.combat.enemy.y = 530;
		city.fireAt(city.combat.enemy);
		expect(city.combat.enemy.health).toBe(C.enemyHealth);
		expect(city.combat.traces[0].end.x).toBeLessThanOrEqual(572);
		// Close enough to detect, with the north building edge between them.
		city.pedestrian = { x: 700, y: 430 };
		city.combat.enemy.x = 700;
		city.combat.enemy.y = 650;
		advance(city, 4);
		expect(city.combat.enemy.aim).toBeNull();
		expect(city.combat.health).toBe(C.playerHealth);
	});

	it('warns before firing, locks its aim, and lets the player dodge', () => {
		const city = new NeverquestCitySimulation();
		nearbyEnemy(city);
		city.update(CITY.maxDelta, idle);
		expect(city.combat.enemy.aim).toEqual(city.pedestrian);
		const aim = { ...city.combat.enemy.aim };
		city.pedestrian.y -= 35;
		advance(city, C.enemyWindup / 2);
		expect(city.combat.enemy.aim).toEqual(aim);
		expect(city.combat.health).toBe(C.playerHealth);
		advance(city, C.enemyWindup / 2);
		expect(city.combat.health).toBe(C.playerHealth);
		expect(city.combat.traces.some((trace) => trace.owner === 'enemy')).toBe(true);
	});

	it('cover taken during the warning blocks the enemy shot', () => {
		const city = new NeverquestCitySimulation();
		city.pedestrian = { x: 700, y: 700 };
		city.combat.enemy.x = 700;
		city.combat.enemy.y = 430;
		// Start warning in an open lane, then move enemy behind cover as a fixture.
		city.combat.enemy.x = 900;
		city.combat.enemy.y = 700;
		city.update(CITY.maxDelta, idle);
		city.combat.enemy.x = 700;
		city.combat.enemy.y = 430;
		advance(city, C.enemyWindup);
		expect(city.combat.health).toBe(C.playerHealth);
	});

	it('driving prevents firing and cancels the lookout warning', () => {
		const city = new NeverquestCitySimulation();
		nearbyEnemy(city);
		city.update(CITY.maxDelta, idle);
		city.toggleVehicle();
		expect(city.fireAt(city.combat.enemy)).toBe(false);
		advance(city, 3);
		expect(city.combat.enemy.aim).toBeNull();
		expect(city.combat.health).toBe(C.playerHealth);
		expect(city.combat.ammo).toBe(C.magazineSize);
	});

	it('defeat blocks actions; retry restores the encounter and preserves delivery and cash', () => {
		const city = new NeverquestCitySimulation();
		city.interact();
		city.pedestrian = { ...CITY_JOB.dropoff };
		city.interact();
		city.pedestrian = { ...CITY_JOB.pickup };
		city.interact();
		nearbyEnemy(city);
		advance(city, 10);
		expect(city.combat.defeated).toBe(true);
		const position = { ...city.pedestrian };
		city.update(CITY.maxDelta, { x: 1, y: 0 });
		expect(city.pedestrian).toEqual(position);
		expect(city.fireAt(city.combat.enemy)).toBe(false);
		expect(city.toggleVehicle()).toBe(false);
		expect(city.interact()).toBe(false);
		expect(city.reloadOrRetry()).toBe(true);
		expect(city.combat.health).toBe(C.playerHealth);
		expect(city.combat.enemy.health).toBe(C.enemyHealth);
		expect(city.combat.traces).toHaveLength(0);
		expect(city.pedestrian).toEqual(CITY.spawn);
		expect(city.cash).toBe(CITY_JOB.reward);
		expect(city.job).toBe('carrying');
	});
});
