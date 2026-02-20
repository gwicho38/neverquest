import { logger, LogLevel, logError, logWarn, logInfo, logDebug, logTrace } from '../../utils/Logger';

describe('Logger', () => {
	let consoleErrorSpy: jest.SpyInstance;
	let consoleWarnSpy: jest.SpyInstance;
	let consoleInfoSpy: jest.SpyInstance;
	let consoleLogSpy: jest.SpyInstance;

	beforeEach(() => {
		// Spy on console methods
		consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
		consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
		consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
		consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

		// Clear logger buffer
		logger.clearBuffer();

		// Reset log level to default and re-enable wildcard category
		logger.setLogLevel(LogLevel.INFO);
		logger.enableCategory('*');
	});

	afterEach(() => {
		// Restore console methods
		consoleErrorSpy.mockRestore();
		consoleWarnSpy.mockRestore();
		consoleInfoSpy.mockRestore();
		consoleLogSpy.mockRestore();
	});

	describe('Singleton Pattern', () => {
		it('should return the same instance', () => {
			const instance1 = logger;
			const instance2 = logger;
			expect(instance1).toBe(instance2);
		});
	});

	describe('Log Levels', () => {
		it('should log error messages', () => {
			logger.error('Test', 'Error message', { foo: 'bar' });

			expect(consoleErrorSpy).toHaveBeenCalled();
			const buffer = logger.getBuffer();
			expect(buffer).toHaveLength(1);
			expect(buffer[0].level).toBe(LogLevel.ERROR);
			expect(buffer[0].message).toBe('Error message');
		});

		it('should log warn messages', () => {
			logger.warn('Test', 'Warning message');

			expect(consoleWarnSpy).toHaveBeenCalled();
			const buffer = logger.getBuffer();
			expect(buffer).toHaveLength(1);
			expect(buffer[0].level).toBe(LogLevel.WARN);
		});

		it('should log info messages', () => {
			logger.info('Test', 'Info message');

			expect(consoleInfoSpy).toHaveBeenCalled();
			const buffer = logger.getBuffer();
			expect(buffer).toHaveLength(1);
			expect(buffer[0].level).toBe(LogLevel.INFO);
		});

		it('should log debug messages when level is DEBUG', () => {
			logger.setLogLevel(LogLevel.DEBUG);
			logger.debug('Test', 'Debug message');

			const buffer = logger.getBuffer();
			expect(buffer).toHaveLength(1);
			expect(buffer[0].level).toBe(LogLevel.DEBUG);
		});

		it('should not log debug messages when level is INFO', () => {
			logger.setLogLevel(LogLevel.INFO);
			logger.debug('Test', 'Debug message');

			const buffer = logger.getBuffer();
			expect(buffer).toHaveLength(0);
		});

		it('should log trace messages when level is TRACE', () => {
			logger.setLogLevel(LogLevel.TRACE);
			logger.trace('Test', 'Trace message');

			const buffer = logger.getBuffer();
			expect(buffer).toHaveLength(1);
			expect(buffer[0].level).toBe(LogLevel.TRACE);
		});
	});

	describe('Category Filtering', () => {
		it('should log all categories by default', () => {
			logger.info('Category1', 'Message 1');
			logger.info('Category2', 'Message 2');

			const buffer = logger.getBuffer();
			expect(buffer).toHaveLength(2);
		});

		it('should only log enabled categories when wildcard is disabled', () => {
			logger.disableCategory('*');
			logger.enableCategory('AllowedCategory');

			logger.info('AllowedCategory', 'Should appear');
			logger.info('BlockedCategory', 'Should not appear');

			const buffer = logger.getBuffer();
			expect(buffer).toHaveLength(1);
			expect(buffer[0].category).toBe('AllowedCategory');
		});

		it('should still log when wildcard is enabled even after disabling category', () => {
			logger.enableCategory('*');
			logger.disableCategory('Category1'); // This won't actually block since wildcard is enabled

			logger.info('Category1', 'Should appear because wildcard is enabled');

			const buffer = logger.getBuffer();
			expect(buffer).toHaveLength(1); // Wildcard overrides specific category disable
		});
	});

	describe('Buffer Management', () => {
		it('should add entries to buffer', () => {
			logger.info('Test', 'Message 1');
			logger.info('Test', 'Message 2');
			logger.info('Test', 'Message 3');

			const buffer = logger.getBuffer();
			expect(buffer).toHaveLength(3);
		});

		it('should clear buffer', () => {
			logger.info('Test', 'Message');
			expect(logger.getBuffer()).toHaveLength(1);

			logger.clearBuffer();
			expect(logger.getBuffer()).toHaveLength(0);
		});

		it('should not mutate original buffer when getting it', () => {
			logger.info('Test', 'Message');
			const buffer1 = logger.getBuffer();
			buffer1.push({
				timestamp: new Date().toISOString(),
				level: LogLevel.ERROR,
				category: 'Test',
				message: 'Fake',
			});

			const buffer2 = logger.getBuffer();
			expect(buffer2).toHaveLength(1);
		});
	});

	describe('Data Attachment', () => {
		it('should attach data to log entries', () => {
			const testData = { userId: 123, action: 'test' };
			logger.info('Test', 'Message with data', testData);

			const buffer = logger.getBuffer();
			expect(buffer[0].data).toEqual(expect.objectContaining(testData));
		});

		it('should attach stack trace to errors', () => {
			logger.error('Test', 'Error message');

			const buffer = logger.getBuffer();
			expect(buffer[0].data).toHaveProperty('stack');
			expect((buffer[0].data as { stack: unknown }).stack).toBeDefined();
		});
	});

	describe('Performance Timer', () => {
		it('should measure execution time', () => {
			logger.setLogLevel(LogLevel.DEBUG);
			const endTimer = logger.startTimer('test-operation');

			// Simulate some work
			const sum = Array.from({ length: 1000 }, (_, i) => i).reduce((a, b) => a + b, 0);
			expect(sum).toBeGreaterThan(0);

			endTimer();

			const buffer = logger.getBuffer();
			const perfLog = buffer.find((entry) => entry.category === 'Performance');
			expect(perfLog).toBeDefined();
			expect(perfLog?.message).toContain('test-operation took');
			expect(perfLog?.message).toContain('ms');
		});
	});

	describe('Export Functionality', () => {
		it('should export logs as JSON string', () => {
			logger.info('Test', 'Message 1');
			logger.warn('Test', 'Message 2');

			const exported = logger.exportLogs();
			const parsed = JSON.parse(exported);

			expect(Array.isArray(parsed)).toBe(true);
			expect(parsed).toHaveLength(2);
			expect(parsed[0].message).toBe('Message 1');
			expect(parsed[1].message).toBe('Message 2');
		});
	});

	describe('Convenience Functions', () => {
		it('should log error via convenience function', () => {
			logError('Test', 'Error via convenience');

			expect(consoleErrorSpy).toHaveBeenCalled();
			const buffer = logger.getBuffer();
			expect(buffer).toHaveLength(1);
			expect(buffer[0].level).toBe(LogLevel.ERROR);
		});

		it('should log warn via convenience function', () => {
			logWarn('Test', 'Warn via convenience');

			expect(consoleWarnSpy).toHaveBeenCalled();
			const buffer = logger.getBuffer();
			expect(buffer[0].level).toBe(LogLevel.WARN);
		});

		it('should log info via convenience function', () => {
			logInfo('Test', 'Info via convenience');

			expect(consoleInfoSpy).toHaveBeenCalled();
			const buffer = logger.getBuffer();
			expect(buffer[0].level).toBe(LogLevel.INFO);
		});

		it('should log debug via convenience function', () => {
			logger.setLogLevel(LogLevel.DEBUG);
			logDebug('Test', 'Debug via convenience');

			const buffer = logger.getBuffer();
			expect(buffer[0].level).toBe(LogLevel.DEBUG);
		});

		it('should log trace via convenience function', () => {
			logger.setLogLevel(LogLevel.TRACE);
			logTrace('Test', 'Trace via convenience');

			const buffer = logger.getBuffer();
			expect(buffer[0].level).toBe(LogLevel.TRACE);
		});
	});

	describe('Log Entry Format', () => {
		it('should include timestamp in log entries', () => {
			logger.info('Test', 'Message');

			const buffer = logger.getBuffer();
			expect(buffer[0].timestamp).toBeDefined();
			expect(new Date(buffer[0].timestamp).getTime()).toBeGreaterThan(0);
		});

		it('should include category in log entries', () => {
			logger.info('MyCategory', 'Message');

			const buffer = logger.getBuffer();
			expect(buffer[0].category).toBe('MyCategory');
		});

		it('should include message in log entries', () => {
			logger.info('Test', 'Test Message');

			const buffer = logger.getBuffer();
			expect(buffer[0].message).toBe('Test Message');
		});
	});

	describe('Edge Cases', () => {
		it('should handle logging with undefined data', () => {
			logger.info('Test', 'Message', undefined);

			const buffer = logger.getBuffer();
			expect(buffer).toHaveLength(1);
		});

		it('should handle logging with null data', () => {
			logger.info('Test', 'Message', null);

			const buffer = logger.getBuffer();
			expect(buffer).toHaveLength(1);
		});

		it('should handle logging empty messages', () => {
			logger.info('Test', '');

			const buffer = logger.getBuffer();
			expect(buffer).toHaveLength(1);
			expect(buffer[0].message).toBe('');
		});

		it('should handle logging with complex data objects', () => {
			const complexData = {
				nested: {
					array: [1, 2, 3],
					object: { foo: 'bar' },
				},
				func: () => 'test',
			};

			logger.info('Test', 'Complex data', complexData);

			const buffer = logger.getBuffer();
			expect(buffer).toHaveLength(1);
			expect((buffer[0].data as { nested: unknown }).nested).toBeDefined();
		});
	});
});
