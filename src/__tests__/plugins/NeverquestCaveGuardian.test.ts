import { NeverquestCaveGuardian } from '../../plugins/NeverquestCaveGuardian';
import { ChapterOne as C } from '../../consts/ChapterOne';
import EventEmitter from 'eventemitter3';

jest.mock('../../entities/Enemy', () => ({
	Enemy: jest.fn().mockImplementation((_scene, x, y) => ({
		attributes: { health: 20 },
		container: { x, y, body: { setImmovable: jest.fn() } },
		displayWidth: 32,
		displayHeight: 32,
		setScale: jest.fn().mockReturnThis(),
		setTint: jest.fn().mockReturnThis(),
		changeBodySize: jest.fn(),
		onUpdate: jest.fn(),
		anims: { play: jest.fn() },
		healthBar: { setPosition: jest.fn(), update: jest.fn() },
		neverquestBattleManager: { takeDamage: jest.fn() },
	})),
}));

describe('Cave Guardian encounter', () => {
	let scene: any;
	let player: any;
	let guardian: NeverquestCaveGuardian;
	let defeated: jest.Mock;
	let marker: any;

	beforeEach(() => {
		jest.useFakeTimers();
		const display = () =>
			Object.fromEntries(
				[
					'setOrigin',
					'setScrollFactor',
					'setDepth',
					'setPosition',
					'setScale',
					'setText',
					'setWordWrapWidth',
					'clear',
					'fillStyle',
					'fillCircle',
					'lineStyle',
					'strokeCircle',
					'destroy',
				].map((name) => [name, jest.fn().mockReturnThis()])
			);
		marker = display();
		scene = {
			events: new EventEmitter(),
			scale: new EventEmitter(),
			plugins: {},
			cameras: { main: { width: 1000, height: 700, zoom: 2, shake: jest.fn() } },
			add: { text: jest.fn(display), graphics: jest.fn(() => marker) },
			time: {
				addEvent: ({ delay, callback, callbackScope }: any) => {
					const timer = setInterval(() => callback.call(callbackScope), delay);
					return { remove: () => clearInterval(timer) };
				},
				delayedCall: (delay: number, callback: () => void) => {
					const timer = setTimeout(callback, delay);
					return { remove: () => clearTimeout(timer) };
				},
			},
			lineOfSight: { isVisible: jest.fn(() => true) },
		};
		player = { active: true, canTakeDamage: true, attributes: { health: 10 }, container: { x: 100, y: 100 } };
		defeated = jest.fn();
		guardian = new NeverquestCaveGuardian(scene, player, 150, 100, defeated);
	});

	afterEach(() => {
		guardian.destroy();
		jest.useRealTimers();
	});

	it('warns before dealing damage, then gives the player a recovery window', () => {
		guardian.check();
		expect(guardian.state).toBe('warning');
		expect(marker.fillCircle).toHaveBeenCalledWith(100, 100, C.SLAM_RADIUS);
		jest.advanceTimersByTime(C.WINDUP_MS - 1);
		expect(guardian.enemy.neverquestBattleManager.takeDamage).not.toHaveBeenCalled();
		jest.advanceTimersByTime(1);
		expect(guardian.enemy.neverquestBattleManager.takeDamage).toHaveBeenCalledWith(guardian.enemy, player);
		expect(guardian.state).toBe('recovering');
		jest.advanceTimersByTime(C.RECOVERY_MS - 1);
		expect(guardian.enemy.neverquestBattleManager.takeDamage).toHaveBeenCalledTimes(1);
	});

	it('locks the warning in place so moving out avoids all damage', () => {
		guardian.check();
		player.container.x += C.SLAM_RADIUS + 1;
		jest.advanceTimersByTime(C.WINDUP_MS);
		expect(guardian.enemy.neverquestBattleManager.takeDamage).not.toHaveBeenCalled();
	});

	it('respects invulnerability and never damages a dead player', () => {
		guardian.check();
		player.canTakeDamage = false;
		jest.advanceTimersByTime(C.WINDUP_MS);
		expect(guardian.enemy.neverquestBattleManager.takeDamage).not.toHaveBeenCalled();
		player.canTakeDamage = true;
		player.attributes.health = 0;
		jest.advanceTimersByTime(C.RECOVERY_MS + C.WINDUP_MS);
		expect(guardian.enemy.neverquestBattleManager.takeDamage).not.toHaveBeenCalled();
	});

	it('does not attack through walls or from outside the encounter range', () => {
		scene.lineOfSight.isVisible.mockReturnValue(false);
		guardian.check();
		expect(guardian.state).toBe('watching');
		scene.lineOfSight.isVisible.mockReturnValue(true);
		player.container.x = C.DETECTION_RANGE * 3;
		guardian.check();
		expect(guardian.state).toBe('watching');
	});

	it('shortens the next windup at half health', () => {
		guardian.enemy.attributes.health = C.GUARDIAN_HEALTH / 2;
		guardian.check();
		jest.advanceTimersByTime(C.ENRAGED_WINDUP_MS);
		expect(guardian.enemy.neverquestBattleManager.takeDamage).toHaveBeenCalledTimes(1);
	});

	it('cancels a pending slam on death and awards victory exactly once', () => {
		guardian.check();
		guardian.enemy.attributes.health = 0;
		guardian.check();
		guardian.check();
		jest.advanceTimersByTime(C.WINDUP_MS + C.RECOVERY_MS);
		expect(defeated).toHaveBeenCalledTimes(1);
		expect(guardian.state).toBe('defeated');
		expect(guardian.enemy.neverquestBattleManager.takeDamage).not.toHaveBeenCalled();
	});

	it('removes timers and UI on scene shutdown without granting victory', () => {
		guardian.check();
		scene.events.emit('shutdown');
		jest.advanceTimersByTime(C.WINDUP_MS + C.RECOVERY_MS);
		expect(guardian.enemy.neverquestBattleManager.takeDamage).not.toHaveBeenCalled();
		expect(marker.destroy).toHaveBeenCalledTimes(1);
		expect(defeated).not.toHaveBeenCalled();
		expect(jest.getTimerCount()).toBe(0);
	});
});
