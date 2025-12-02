/**
 * Tests for CrashReporter
 */

import { CrashReporter, crashReporter } from '../../utils/CrashReporter';

describe('CrashReporter', () => {
	let reporter: CrashReporter;

	beforeEach(() => {
		jest.clearAllMocks();
		// Reset singleton for testing
		(CrashReporter as any).instance = undefined;
		reporter = CrashReporter.getInstance();
		reporter.clearCrashLogs();
	});

	describe('Singleton Pattern', () => {
		it('should return the same instance', () => {
			const instance1 = CrashReporter.getInstance();
			const instance2 = CrashReporter.getInstance();
			expect(instance1).toBe(instance2);
		});

		it('should export a singleton instance', () => {
			expect(crashReporter).toBeDefined();
			expect(crashReporter).toBeInstanceOf(CrashReporter);
		});
	});

	describe('reportCrash', () => {
		it('should add crash report to logs', () => {
			const error = new Error('Test error');
			reporter.reportCrash('testType', error);

			const logs = reporter.getCrashLogs();
			expect(logs).toHaveLength(1);
			expect(logs[0].error.name).toBe('Error');
			expect(logs[0].error.message).toBe('Test error');
		});

		it('should include timestamp in crash report', () => {
			const error = new Error('Test error');
			const beforeTime = new Date().toISOString();

			reporter.reportCrash('testType', error);

			const logs = reporter.getCrashLogs();
			expect(logs[0].timestamp).toBeDefined();
			expect(new Date(logs[0].timestamp).getTime()).toBeGreaterThanOrEqual(new Date(beforeTime).getTime());
		});

		it('should include error stack in crash report', () => {
			const error = new Error('Test error');
			reporter.reportCrash('testType', error);

			const logs = reporter.getCrashLogs();
			expect(logs[0].error.stack).toBeDefined();
		});

		it('should include platform and architecture', () => {
			const error = new Error('Test error');
			reporter.reportCrash('testType', error);

			const logs = reporter.getCrashLogs();
			expect(logs[0].platform).toBeDefined();
			expect(logs[0].arch).toBeDefined();
		});

		it('should include version in crash report', () => {
			const error = new Error('Test error');
			reporter.reportCrash('testType', error);

			const logs = reporter.getCrashLogs();
			expect(logs[0].version).toBeDefined();
		});

		it('should include game state if provided', () => {
			const error = new Error('Test error');
			const gameState = {
				level: 5,
				health: 100,
				position: { x: 10, y: 20 },
			};

			reporter.reportCrash('testType', error, gameState);

			const logs = reporter.getCrashLogs();
			expect(logs[0].gameState).toBeDefined();
			expect(logs[0].gameState.level).toBe(5);
		});

		it('should sanitize game state by removing sensitive data', () => {
			const error = new Error('Test error');
			const gameState = {
				level: 5,
				player: {
					name: 'TestPlayer',
					password: 'secret123',
					token: 'auth-token',
					sessionId: 'session-123',
				},
			};

			reporter.reportCrash('testType', error, gameState);

			const logs = reporter.getCrashLogs();
			expect(logs[0].gameState.player.name).toBe('TestPlayer');
			expect(logs[0].gameState.player.password).toBeUndefined();
			expect(logs[0].gameState.player.token).toBeUndefined();
			expect(logs[0].gameState.player.sessionId).toBeUndefined();
		});

		it('should limit maximum crash logs', () => {
			// Generate more than maxLogs (50) crash reports
			for (let i = 0; i < 60; i++) {
				const error = new Error(`Error ${i}`);
				reporter.reportCrash('testType', error);
			}

			const logs = reporter.getCrashLogs();
			expect(logs.length).toBeLessThanOrEqual(50);
		});

		it('should add newest logs first', () => {
			reporter.reportCrash('first', new Error('First error'));
			reporter.reportCrash('second', new Error('Second error'));

			const logs = reporter.getCrashLogs();
			expect(logs[0].error.message).toBe('Second error');
			expect(logs[1].error.message).toBe('First error');
		});
	});

	describe('getCrashLogs', () => {
		it('should return a copy of crash logs', () => {
			reporter.reportCrash('test', new Error('Test'));

			const logs1 = reporter.getCrashLogs();
			const logs2 = reporter.getCrashLogs();

			expect(logs1).not.toBe(logs2);
			expect(logs1).toEqual(logs2);
		});

		it('should return empty array when no crashes', () => {
			const logs = reporter.getCrashLogs();
			expect(logs).toEqual([]);
		});
	});

	describe('clearCrashLogs', () => {
		it('should clear all crash logs', () => {
			reporter.reportCrash('test', new Error('Test'));
			expect(reporter.getCrashLogs()).toHaveLength(1);

			reporter.clearCrashLogs();
			expect(reporter.getCrashLogs()).toHaveLength(0);
		});
	});

	describe('exportCrashLogs', () => {
		it('should export crash logs as JSON string', () => {
			reporter.reportCrash('test', new Error('Test'));

			const exported = reporter.exportCrashLogs();

			expect(typeof exported).toBe('string');
			const parsed = JSON.parse(exported);
			expect(Array.isArray(parsed)).toBe(true);
			expect(parsed).toHaveLength(1);
		});

		it('should export empty array when no crashes', () => {
			const exported = reporter.exportCrashLogs();
			expect(exported).toBe('[]');
		});

		it('should be formatted with indentation', () => {
			reporter.reportCrash('test', new Error('Test'));
			const exported = reporter.exportCrashLogs();

			// Formatted JSON should contain newlines
			expect(exported).toContain('\n');
		});
	});

	describe('getCrashStats', () => {
		it('should return total count of crashes', () => {
			reporter.reportCrash('type1', new Error('Error 1'));
			reporter.reportCrash('type2', new Error('Error 2'));
			reporter.reportCrash('type1', new Error('Error 3'));

			const stats = reporter.getCrashStats();
			expect(stats.total).toBe(3);
		});

		it('should count recent crashes (last 24 hours)', () => {
			reporter.reportCrash('test', new Error('Recent error'));

			const stats = reporter.getCrashStats();
			expect(stats.recent).toBe(1);
		});

		it('should group crashes by error name', () => {
			reporter.reportCrash('type1', new Error('Error 1'));
			reporter.reportCrash('type2', new Error('Error 2'));
			reporter.reportCrash('type1', new Error('Error 3'));

			const stats = reporter.getCrashStats();
			expect(stats.byType['Error']).toBe(3);
		});

		it('should return zero stats when no crashes', () => {
			const stats = reporter.getCrashStats();

			expect(stats.total).toBe(0);
			expect(stats.recent).toBe(0);
			expect(Object.keys(stats.byType)).toHaveLength(0);
		});

		it('should count different error types separately', () => {
			class CustomError extends Error {
				name = 'CustomError';
			}

			reporter.reportCrash('type1', new Error('Standard error'));
			reporter.reportCrash('type2', new CustomError('Custom error'));

			const stats = reporter.getCrashStats();
			expect(stats.byType['Error']).toBe(1);
			expect(stats.byType['CustomError']).toBe(1);
		});
	});

	describe('sanitizeGameState', () => {
		it('should handle null game state', () => {
			reporter.reportCrash('test', new Error('Test'), null);

			const logs = reporter.getCrashLogs();
			expect(logs[0].gameState).toBeUndefined();
		});

		it('should handle non-object game state', () => {
			reporter.reportCrash('test', new Error('Test'), 'string value');

			const logs = reporter.getCrashLogs();
			expect(logs[0].gameState).toBe('string value');
		});

		it('should limit object depth', () => {
			const deepObject = {
				level1: {
					level2: {
						level3: {
							level4: {
								level5: 'deep value',
							},
						},
					},
				},
			};

			reporter.reportCrash('test', new Error('Test'), deepObject);

			const logs = reporter.getCrashLogs();
			// Should truncate at depth 3
			expect(logs[0].gameState.level1.level2.level3).toBe('[Object]');
		});

		it('should truncate long arrays', () => {
			const longArray = Array.from({ length: 20 }, (_, i) => i);

			reporter.reportCrash('test', new Error('Test'), { items: longArray });

			const logs = reporter.getCrashLogs();
			expect(logs[0].gameState.items.length).toBeLessThanOrEqual(10);
		});
	});

	describe('Platform Detection', () => {
		it('should detect platform from process.platform', () => {
			reporter.reportCrash('test', new Error('Test'));

			const logs = reporter.getCrashLogs();
			expect(logs[0].platform).toBeDefined();
		});

		it('should include memory usage if available', () => {
			reporter.reportCrash('test', new Error('Test'));

			const logs = reporter.getCrashLogs();
			// In Node.js environment, memory usage should be available
			if (typeof process !== 'undefined' && process.memoryUsage) {
				expect(logs[0].memoryUsage).toBeDefined();
			}
		});
	});

	describe('Version Detection', () => {
		it('should return a version string', () => {
			reporter.reportCrash('test', new Error('Test'));

			const logs = reporter.getCrashLogs();
			expect(logs[0].version).toMatch(/^\d+\.\d+\.\d+$/);
		});
	});
});
