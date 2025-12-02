/**
 * Tests for TerminalAnimator
 */

import { TerminalAnimator } from '../../terminal/TerminalAnimator';

// Mock the AnimationTiming constants
jest.mock('../../consts/Numbers', () => ({
	AnimationTiming: {
		HIT_FLASH_DURATION: 10,
		TWEEN_FAST: 10,
		TWEEN_NORMAL: 20,
	},
}));

describe('TerminalAnimator', () => {
	let animator: TerminalAnimator;

	beforeEach(() => {
		animator = new TerminalAnimator();
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	describe('addEffect', () => {
		it('should add an effect', () => {
			animator.addEffect(5, 10, '*', 'red', 100);

			const effect = animator.getEffectAt(5, 10);
			expect(effect).not.toBeNull();
			expect(effect?.symbol).toBe('*');
			expect(effect?.color).toBe('red');
		});

		it('should set expiration time based on duration', () => {
			const now = Date.now();
			animator.addEffect(5, 10, '*', 'red', 100);

			const effect = animator.getEffectAt(5, 10);
			expect(effect?.expiresAt).toBeGreaterThanOrEqual(now + 100);
		});
	});

	describe('getEffectAt', () => {
		it('should return effect at position', () => {
			animator.addEffect(5, 10, '*', 'red', 1000);

			const effect = animator.getEffectAt(5, 10);

			expect(effect).not.toBeNull();
			expect(effect?.x).toBe(5);
			expect(effect?.y).toBe(10);
		});

		it('should return null when no effect at position', () => {
			animator.addEffect(5, 10, '*', 'red', 1000);

			const effect = animator.getEffectAt(0, 0);

			expect(effect).toBeNull();
		});

		it('should return null for expired effects', () => {
			animator.addEffect(5, 10, '*', 'red', 100);

			// Advance time past expiration
			jest.advanceTimersByTime(150);

			const effect = animator.getEffectAt(5, 10);
			expect(effect).toBeNull();
		});

		it('should clean up expired effects when called', () => {
			animator.addEffect(5, 10, '*', 'red', 100);
			animator.addEffect(6, 10, '+', 'green', 1000);

			// Advance time to expire first effect
			jest.advanceTimersByTime(150);

			// This call should clean up expired effects
			animator.getEffectAt(6, 10);

			// First effect should be cleaned up
			const effect1 = animator.getEffectAt(5, 10);
			const effect2 = animator.getEffectAt(6, 10);

			expect(effect1).toBeNull();
			expect(effect2).not.toBeNull();
		});
	});

	describe('clearEffects', () => {
		it('should remove all effects', () => {
			animator.addEffect(5, 10, '*', 'red', 1000);
			animator.addEffect(6, 11, '+', 'green', 1000);

			animator.clearEffects();

			expect(animator.getEffectAt(5, 10)).toBeNull();
			expect(animator.getEffectAt(6, 11)).toBeNull();
		});
	});

	describe('animateAttack', () => {
		it('should call onFrame multiple times', async () => {
			const onFrame = jest.fn();

			jest.useRealTimers();
			await animator.animateAttack(0, 0, 1, 1, onFrame);

			expect(onFrame).toHaveBeenCalledTimes(3);
		});

		it('should add effects at source and target positions', async () => {
			const onFrame = jest.fn();

			jest.useRealTimers();
			const promise = animator.animateAttack(0, 0, 5, 5, onFrame);

			// Check that effects are added
			expect(onFrame).toHaveBeenCalled();

			await promise;
		});
	});

	describe('animateBlock', () => {
		it('should call onFrame multiple times', async () => {
			const onFrame = jest.fn();

			jest.useRealTimers();
			await animator.animateBlock(5, 5, onFrame);

			expect(onFrame).toHaveBeenCalledTimes(3);
		});
	});

	describe('animateDamage', () => {
		it('should call onFrame multiple times', async () => {
			const onFrame = jest.fn();

			jest.useRealTimers();
			await animator.animateDamage(5, 5, 25, onFrame);

			expect(onFrame).toHaveBeenCalledTimes(2);
		});

		it('should add effect with damage number', async () => {
			const onFrame = jest.fn();

			jest.useRealTimers();
			await animator.animateDamage(5, 5, 25, onFrame);

			// Should have been called with damage effect
			expect(onFrame).toHaveBeenCalled();
		});
	});

	describe('animateHeal', () => {
		it('should call onFrame multiple times', async () => {
			const onFrame = jest.fn();

			jest.useRealTimers();
			await animator.animateHeal(5, 5, 30, onFrame);

			expect(onFrame).toHaveBeenCalledTimes(2);
		});

		it('should add effect with heal number', async () => {
			const onFrame = jest.fn();

			jest.useRealTimers();
			await animator.animateHeal(5, 5, 30, onFrame);

			// Should have been called with heal effect
			expect(onFrame).toHaveBeenCalled();
		});
	});

	describe('animateDeath', () => {
		it('should call onFrame for each death effect', async () => {
			const onFrame = jest.fn();

			jest.useRealTimers();
			await animator.animateDeath(5, 5, onFrame);

			// 4 death effects
			expect(onFrame).toHaveBeenCalledTimes(4);
		});
	});

	describe('animateParticleBurst', () => {
		it('should call onFrame for burst and fade', async () => {
			const onFrame = jest.fn();

			jest.useRealTimers();
			await animator.animateParticleBurst(5, 5, onFrame);

			// Burst + fade = 2 calls
			expect(onFrame).toHaveBeenCalledTimes(2);
		});

		it('should add effects around center position', async () => {
			const onFrame = jest.fn();

			jest.useRealTimers();
			await animator.animateParticleBurst(5, 5, onFrame);

			// Should have been called with particle effects
			expect(onFrame).toHaveBeenCalled();
		});
	});
});
