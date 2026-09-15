import { NeverquestCitySimulation } from '../../plugins/NeverquestCitySimulation';
import { CITY, CITY_BUILDINGS, CITY_JOB } from '../../consts/City';

describe('city simulation', () => {
	it('normalizes diagonal walking and cannot walk through buildings or world bounds', () => {
		const straight = new NeverquestCitySimulation();
		const diagonal = new NeverquestCitySimulation();
		const start = { ...straight.pedestrian };
		straight.update(0.05, { x: 1, y: 0 });
		diagonal.update(0.05, { x: 1, y: 1 });
		expect(Math.hypot(diagonal.pedestrian.x - start.x, diagonal.pedestrian.y - start.y)).toBeCloseTo(
			straight.pedestrian.x - start.x
		);
		const building = CITY_BUILDINGS[0];
		straight.pedestrian = { x: building.x - CITY.walkRadius - 1, y: building.y + building.height / 2 };
		for (let i = 0; i < 120; i++) straight.update(0.05, { x: 1, y: 0 });
		expect(straight.pedestrian.x).toBeLessThanOrEqual(building.x - CITY.walkRadius);
		straight.pedestrian = { x: CITY.walkRadius, y: CITY.walkRadius };
		straight.update(0.05, { x: -1, y: -1 });
		expect(straight.pedestrian).toEqual({ x: CITY.walkRadius, y: CITY.walkRadius });
	});

	it('only enters a nearby car and keeps the pedestrian still while driving', () => {
		const city = new NeverquestCitySimulation();
		city.pedestrian = { x: CITY.walkRadius, y: CITY.walkRadius };
		expect(city.toggleVehicle()).toBe(false);
		city.pedestrian = { x: city.car.x - 40, y: city.car.y };
		expect(city.toggleVehicle()).toBe(true);
		const pedestrian = { ...city.pedestrian };
		const startY = city.car.y;
		for (let i = 0; i < 20; i++) city.update(0.05, { x: 0, y: -1 });
		expect(city.car.y).toBeLessThan(startY);
		expect(city.pedestrian).toEqual(pedestrian);
		expect(city.position).toEqual({ x: city.car.x, y: city.car.y });
		expect(city.toggleVehicle()).toBe(false); // Cannot jump out at speed.
		for (let i = 0; i < 80; i++) city.update(0.05, { x: 0, y: 0, brake: true });
		expect(city.toggleVehicle()).toBe(true);
		expect(city.driving).toBe(false);
		expect(city.canOccupy(city.pedestrian, CITY.walkRadius)).toBe(true);
	});

	it('rejects obstructed exits without losing vehicle ownership', () => {
		const city = new NeverquestCitySimulation();
		city.toggleVehicle();
		const obstacle = CITY_BUILDINGS[0];
		city.car.x = obstacle.x + obstacle.width / 2;
		city.car.y = obstacle.y + obstacle.height / 2;
		expect(city.toggleVehicle()).toBe(false);
		expect(city.driving).toBe(true);
	});

	it('stops a car at a wall even with a delayed frame', () => {
		const city = new NeverquestCitySimulation();
		city.toggleVehicle();
		const building = CITY_BUILDINGS[0];
		city.car.x = building.x - CITY.carRadius - 1;
		city.car.y = building.y + building.height / 2;
		city.car.heading = 0;
		city.car.speed = CITY.maxSpeed;
		city.update(2, { x: 0, y: -1 });
		expect(city.car.x).toBeLessThanOrEqual(building.x - CITY.carRadius);
		expect(city.car.speed).toBe(0);
	});

	it('requires pickup, then delivery on foot, and awards each job only once', () => {
		const city = new NeverquestCitySimulation();
		city.pedestrian = { ...CITY_JOB.dropoff };
		expect(city.interact()).toBe(false);
		expect(city.cash).toBe(0);
		city.pedestrian = { ...CITY_JOB.pickup };
		expect(city.interact()).toBe(true);
		expect(city.job).toBe('carrying');
		city.pedestrian = { ...city.car };
		city.toggleVehicle();
		city.car.x = CITY_JOB.dropoff.x;
		city.car.y = CITY_JOB.dropoff.y;
		expect(city.interact()).toBe(false);
		city.toggleVehicle();
		expect(city.interact()).toBe(true);
		expect(city.cash).toBe(CITY_JOB.reward);
		expect(city.job).toBe('complete');
		expect(city.interact()).toBe(false);
		expect(city.cash).toBe(CITY_JOB.reward);
	});

	it('emits changes only for transitions and supports unsubscribing', () => {
		const city = new NeverquestCitySimulation();
		const listener = jest.fn();
		const unsubscribe = city.onChange(listener);
		city.update(0.05, { x: 1, y: 0 });
		expect(listener).not.toHaveBeenCalled();
		city.toggleVehicle();
		expect(listener).toHaveBeenCalledTimes(1);
		unsubscribe();
		city.toggleVehicle();
		expect(listener).toHaveBeenCalledTimes(1);
	});
});
