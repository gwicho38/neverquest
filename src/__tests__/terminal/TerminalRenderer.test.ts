/**
 * Tests for TerminalRenderer
 */

// Mock blessed before importing the class
jest.mock('blessed', () => {
	const mockScreen = {
		key: jest.fn(),
		enableMouse: jest.fn(),
		render: jest.fn(),
		destroy: jest.fn(),
	};

	const mockBox = {
		setContent: jest.fn(),
	};

	const mockLog = {
		log: jest.fn(),
	};

	return {
		screen: jest.fn().mockReturnValue(mockScreen),
		box: jest.fn().mockReturnValue(mockBox),
		log: jest.fn().mockReturnValue(mockLog),
	};
});

import { TerminalRenderer } from '../../terminal/TerminalRenderer';
import blessed from 'blessed';

describe('TerminalRenderer', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('constructor', () => {
		it('should create a screen with correct options', () => {
			new TerminalRenderer();

			expect(blessed.screen).toHaveBeenCalledWith(
				expect.objectContaining({
					smartCSR: true,
					fullUnicode: true,
					dockBorders: true,
				})
			);
		});

		it('should create game box', () => {
			new TerminalRenderer();

			expect(blessed.box).toHaveBeenCalledWith(
				expect.objectContaining({
					top: 0,
					left: 0,
					width: '70%',
					height: '80%',
					label: ' Game ',
				})
			);
		});

		it('should create status box', () => {
			new TerminalRenderer();

			expect(blessed.box).toHaveBeenCalledWith(
				expect.objectContaining({
					top: 0,
					left: '70%',
					width: '30%',
					height: '80%',
					label: ' Status ',
				})
			);
		});

		it('should create log box', () => {
			new TerminalRenderer();

			expect(blessed.log).toHaveBeenCalledWith(
				expect.objectContaining({
					bottom: 0,
					left: 0,
					width: '100%',
					height: '20%',
					label: ' Log ',
				})
			);
		});

		it('should register keyboard shortcuts for quit', () => {
			const renderer = new TerminalRenderer();

			expect(renderer.screen.key).toHaveBeenCalledWith(['escape', 'q', 'C-c'], expect.any(Function));
		});

		it('should enable mouse support', () => {
			const renderer = new TerminalRenderer();

			expect(renderer.screen.enableMouse).toHaveBeenCalled();
		});

		it('should create debug box when debug is true', () => {
			const callCountBefore = (blessed.box as jest.Mock).mock.calls.length;
			new TerminalRenderer(true);

			// Should have one more box call for debug box
			expect((blessed.box as jest.Mock).mock.calls.length).toBeGreaterThan(callCountBefore);
		});

		it('should not create debug box when debug is false', () => {
			const renderer = new TerminalRenderer(false);

			expect(renderer.debugBox).toBeUndefined();
		});
	});

	describe('log', () => {
		it('should log message to log box with default color', () => {
			const renderer = new TerminalRenderer();

			renderer.log('Test message');

			expect(renderer.logBox.log).toHaveBeenCalledWith('{white-fg}Test message{/white-fg}');
		});

		it('should log message with custom color', () => {
			const renderer = new TerminalRenderer();

			renderer.log('Test message', 'red');

			expect(renderer.logBox.log).toHaveBeenCalledWith('{red-fg}Test message{/red-fg}');
		});

		it('should log message with green color', () => {
			const renderer = new TerminalRenderer();

			renderer.log('Success!', 'green');

			expect(renderer.logBox.log).toHaveBeenCalledWith('{green-fg}Success!{/green-fg}');
		});
	});

	describe('updateStatus', () => {
		it('should update status box content', () => {
			const renderer = new TerminalRenderer();

			renderer.updateStatus('HP: 100/100');

			expect(renderer.statusBox.setContent).toHaveBeenCalledWith('HP: 100/100');
		});

		it('should render the screen after update', () => {
			const renderer = new TerminalRenderer();

			renderer.updateStatus('HP: 100/100');

			expect(renderer.screen.render).toHaveBeenCalled();
		});
	});

	describe('updateDebug', () => {
		it('should update debug box content when debug is enabled', () => {
			const renderer = new TerminalRenderer(true);
			const mockDebugBox = { setContent: jest.fn() };
			(renderer as any).debugBox = mockDebugBox;

			renderer.updateDebug('FPS: 60');

			expect(mockDebugBox.setContent).toHaveBeenCalledWith('FPS: 60');
		});

		it('should render the screen after debug update', () => {
			const renderer = new TerminalRenderer(true);
			const mockDebugBox = { setContent: jest.fn() };
			(renderer as any).debugBox = mockDebugBox;

			renderer.updateDebug('FPS: 60');

			expect(renderer.screen.render).toHaveBeenCalled();
		});

		it('should not throw when debug is disabled', () => {
			const renderer = new TerminalRenderer(false);

			expect(() => renderer.updateDebug('FPS: 60')).not.toThrow();
		});
	});

	describe('render', () => {
		it('should render the screen', () => {
			const renderer = new TerminalRenderer();

			renderer.render();

			expect(renderer.screen.render).toHaveBeenCalled();
		});
	});

	describe('cleanup', () => {
		it('should destroy the screen', () => {
			const renderer = new TerminalRenderer();

			renderer.cleanup();

			expect(renderer.screen.destroy).toHaveBeenCalled();
		});
	});
});
