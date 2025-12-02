/**
 * Tests for IconDeviceChange
 */

import { IconDeviceChange } from '../../../scenes/watchers/IconDeviceChange';

describe('IconDeviceChange', () => {
	describe('changeTexture', () => {
		it('should set texture using the current texture key', () => {
			const mockGameObject = {
				texture: { key: 'test-texture-key' },
				setTexture: jest.fn(),
			} as any;

			IconDeviceChange.changeTexture(mockGameObject);

			expect(mockGameObject.setTexture).toHaveBeenCalledWith('test-texture-key');
		});

		it('should handle different texture keys', () => {
			const mockGameObject = {
				texture: { key: 'another-texture' },
				setTexture: jest.fn(),
			} as any;

			IconDeviceChange.changeTexture(mockGameObject);

			expect(mockGameObject.setTexture).toHaveBeenCalledWith('another-texture');
		});

		it('should handle empty texture key', () => {
			const mockGameObject = {
				texture: { key: '' },
				setTexture: jest.fn(),
			} as any;

			IconDeviceChange.changeTexture(mockGameObject);

			expect(mockGameObject.setTexture).toHaveBeenCalledWith('');
		});
	});
});
