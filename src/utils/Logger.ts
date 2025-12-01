/**
 * Comprehensive logging system for Neverquest
 */

import { ErrorMessages, DebugMessages } from '../consts/Messages';
import { LoggerValues } from '../consts/Numbers';

export enum LogLevel {
	ERROR = 0,
	WARN = 1,
	INFO = 2,
	DEBUG = 3,
	TRACE = 4,
}

interface LogEntry {
	timestamp: string;
	level: LogLevel;
	category: string;
	message: string;
	data?: any;
	stack?: string;
}

class Logger {
	private static instance: Logger;
	private logLevel: LogLevel = LogLevel.INFO;
	private logBuffer: LogEntry[] = [];
	private maxBufferSize = LoggerValues.MAX_BUFFER_SIZE;
	private categories: Set<string> = new Set();
	private enabledCategories: Set<string> = new Set(['*']);
	private isProduction = process.env.NODE_ENV === 'production';

	private constructor() {
		// Load log level from environment or localStorage
		this.loadConfiguration();

		// Setup error handlers
		this.setupErrorHandlers();
	}

	static getInstance(): Logger {
		if (!Logger.instance) {
			Logger.instance = new Logger();
		}
		return Logger.instance;
	}

	private loadConfiguration(): void {
		// Try to load from localStorage in browser
		if (typeof window !== 'undefined' && window.localStorage) {
			const savedLevel = window.localStorage.getItem('neverquest_log_level');
			if (savedLevel) {
				this.logLevel = parseInt(savedLevel, 10) as LogLevel;
			}

			const savedCategories = window.localStorage.getItem('neverquest_log_categories');
			if (savedCategories) {
				this.enabledCategories = new Set(JSON.parse(savedCategories));
			}
		}
	}

	private setupErrorHandlers(): void {
		if (typeof window !== 'undefined') {
			window.addEventListener('error', (event) => {
				this.error('Global', ErrorMessages.UNCAUGHT_ERROR, {
					message: event.message,
					filename: event.filename,
					lineno: event.lineno,
					colno: event.colno,
					stack: event.error?.stack,
				});
			});

			window.addEventListener('unhandledrejection', (event) => {
				this.error('Global', ErrorMessages.UNHANDLED_PROMISE, {
					reason: event.reason,
				});
			});
		}
	}

	setLogLevel(level: LogLevel): void {
		this.logLevel = level;
		if (typeof window !== 'undefined' && window.localStorage) {
			window.localStorage.setItem('neverquest_log_level', level.toString());
		}
	}

	enableCategory(category: string): void {
		this.enabledCategories.add(category);
		this.saveCategories();
	}

	disableCategory(category: string): void {
		this.enabledCategories.delete(category);
		this.saveCategories();
	}

	private saveCategories(): void {
		if (typeof window !== 'undefined' && window.localStorage) {
			window.localStorage.setItem(
				'neverquest_log_categories',
				JSON.stringify(Array.from(this.enabledCategories))
			);
		}
	}

	private shouldLog(level: LogLevel, category: string): boolean {
		if (level > this.logLevel) return false;
		if (this.enabledCategories.has('*')) return true;
		return this.enabledCategories.has(category);
	}

	private formatMessage(entry: LogEntry): string {
		const levelStr = LogLevel[entry.level].padEnd(5);
		const categoryStr = `[${entry.category}]`.padEnd(20);
		return `${entry.timestamp} ${levelStr} ${categoryStr} ${entry.message}`;
	}

	private log(level: LogLevel, category: string, message: string, data?: any): void {
		if (!this.shouldLog(level, category)) return;

		const entry: LogEntry = {
			timestamp: new Date().toISOString(),
			level,
			category,
			message,
			data,
		};

		// Add to buffer
		this.logBuffer.push(entry);
		if (this.logBuffer.length > this.maxBufferSize) {
			this.logBuffer.shift();
		}

		// Track category
		this.categories.add(category);

		// Console output
		const formattedMessage = this.formatMessage(entry);

		switch (level) {
			case LogLevel.ERROR:
				console.error(formattedMessage, data || '');
				break;
			case LogLevel.WARN:
				console.warn(formattedMessage, data || '');
				break;
			case LogLevel.INFO:
				console.info(formattedMessage, data || '');
				break;
			case LogLevel.DEBUG:
			case LogLevel.TRACE:
				if (!this.isProduction) {
					console.log(formattedMessage, data || '');
				}
				break;
		}

		// Send to remote logging in production
		if (this.isProduction && level <= LogLevel.WARN) {
			this.sendToRemote(entry);
		}
	}

	error(category: string, message: string, data?: any): void {
		// Capture stack trace for errors
		const error = new Error();
		const stack = error.stack;
		this.log(LogLevel.ERROR, category, message, { ...data, stack });
	}

	warn(category: string, message: string, data?: any): void {
		this.log(LogLevel.WARN, category, message, data);
	}

	info(category: string, message: string, data?: any): void {
		this.log(LogLevel.INFO, category, message, data);
	}

	debug(category: string, message: string, data?: any): void {
		this.log(LogLevel.DEBUG, category, message, data);
	}

	trace(category: string, message: string, data?: any): void {
		this.log(LogLevel.TRACE, category, message, data);
	}

	// Performance logging
	startTimer(name: string): () => void {
		const startTime = performance.now();
		return () => {
			const duration = performance.now() - startTime;
			this.debug('Performance', `${name} took ${duration.toFixed(2)}ms`);
		};
	}

	// Memory logging
	logMemoryUsage(): void {
		if (typeof window !== 'undefined' && (window.performance as any).memory) {
			const memory = (window.performance as any).memory;
			this.debug('Memory', DebugMessages.MEMORY_USAGE, {
				usedJSHeapSize: `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
				totalJSHeapSize: `${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
				limit: `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`,
			});
		}
	}

	// Get logs for debugging
	getBuffer(): LogEntry[] {
		return [...this.logBuffer];
	}

	clearBuffer(): void {
		this.logBuffer = [];
	}

	// Export logs
	exportLogs(): string {
		return JSON.stringify(this.logBuffer, null, 2);
	}

	downloadLogs(): void {
		if (typeof window === 'undefined') return;

		const dataStr = this.exportLogs();
		const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
		const exportFileDefaultName = `neverquest-logs-${Date.now()}.json`;

		const linkElement = document.createElement('a');
		linkElement.setAttribute('href', dataUri);
		linkElement.setAttribute('download', exportFileDefaultName);
		linkElement.click();
	}

	// Remote logging (stub - implement based on your backend)
	private async sendToRemote(_entry: LogEntry): Promise<void> {
		// Implement remote logging endpoint
		// Example:
		// await fetch('/api/logs', {
		//   method: 'POST',
		//   headers: { 'Content-Type': 'application/json' },
		//   body: JSON.stringify(entry)
		// });
	}

	// Console command helper for development
	setupConsoleCommands(): void {
		if (typeof window === 'undefined' || this.isProduction) return;

		(window as any).neverquest = {
			log: this,
			setLogLevel: (level: string) => {
				const levelValue = LogLevel[level.toUpperCase() as keyof typeof LogLevel];
				if (levelValue !== undefined) {
					this.setLogLevel(levelValue);
					console.log(`Log level set to ${level.toUpperCase()}`);
				}
			},
			enableCategory: (cat: string) => this.enableCategory(cat),
			disableCategory: (cat: string) => this.disableCategory(cat),
			showCategories: () => console.table(Array.from(this.categories)),
			exportLogs: () => this.downloadLogs(),
			clearLogs: () => this.clearBuffer(),
			showMemory: () => this.logMemoryUsage(),
		};

		console.log('Neverquest Logger initialized. Use window.neverquest for debugging commands.');
	}
}

// Export singleton instance
export const logger = Logger.getInstance();

// Export convenience functions
export const logError = (category: string, message: string, data?: any) => logger.error(category, message, data);

export const logWarn = (category: string, message: string, data?: any) => logger.warn(category, message, data);

export const logInfo = (category: string, message: string, data?: any) => logger.info(category, message, data);

export const logDebug = (category: string, message: string, data?: any) => logger.debug(category, message, data);

export const logTrace = (category: string, message: string, data?: any) => logger.trace(category, message, data);

export const logTimer = (name: string) => logger.startTimer(name);

// Game-specific logging categories
export const GameLogCategory = {
	SYSTEM: 'System',
	SCENE: 'Scene',
	PLAYER: 'Player',
	ENEMY: 'Enemy',
	BATTLE: 'Battle',
	INVENTORY: 'Inventory',
	DIALOG: 'Dialog',
	SAVE: 'SaveGame',
	INPUT: 'Input',
	ANIMATION: 'Animation',
	AUDIO: 'Audio',
	NETWORK: 'Network',
	PERFORMANCE: 'Performance',
	ERROR: 'Error',
} as const;

export type GameLogCategoryType = (typeof GameLogCategory)[keyof typeof GameLogCategory];
