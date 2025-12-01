/**
 * Crash Reporter for Electron App
 * Handles error logging, crash reporting, and user feedback
 */

import { ArchitectureConstants, PlatformConstants, UserAgentArchDetection } from '../consts/Messages';

export interface CrashReport {
	timestamp: string;
	version: string;
	platform: string;
	arch: string;
	error: {
		name: string;
		message: string;
		stack?: string;
	};
	userAgent?: string;
	memoryUsage?: NodeJS.MemoryUsage;
	gameState?: any;
}

export class CrashReporter {
	private static instance: CrashReporter;
	private crashLogs: CrashReport[] = [];
	private maxLogs = 50; // Keep last 50 crash reports

	private constructor() {
		this.setupGlobalErrorHandlers();
	}

	public static getInstance(): CrashReporter {
		if (!CrashReporter.instance) {
			CrashReporter.instance = new CrashReporter();
		}
		return CrashReporter.instance;
	}

	private setupGlobalErrorHandlers(): void {
		// Handle Node.js process events (only in Node.js environment)
		if (typeof process !== 'undefined' && process.on) {
			// Handle uncaught exceptions
			process.on('uncaughtException', (error: Error) => {
				this.reportCrash('uncaughtException', error);
			});

			// Handle unhandled promise rejections
			process.on('unhandledRejection', (reason: any, _promise: Promise<any>) => {
				const error = reason instanceof Error ? reason : new Error(String(reason));
				this.reportCrash('unhandledRejection', error);
			});
		}

		// Handle window crashes (browser environment)
		if (typeof window !== 'undefined') {
			window.addEventListener('error', (event: ErrorEvent) => {
				const error = new Error(event.message);
				error.stack = event.error?.stack;
				this.reportCrash('windowError', error);
			});

			window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
				const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
				this.reportCrash('unhandledRejection', error);
			});
		}
	}

	public reportCrash(type: string, error: Error, gameState?: any): void {
		const crashReport: CrashReport = {
			timestamp: new Date().toISOString(),
			version: this.getAppVersion(),
			platform: this.getPlatform(),
			arch: this.getArch(),
			error: {
				name: error.name,
				message: error.message,
				stack: error.stack,
			},
			userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
			memoryUsage: this.getMemoryUsage(),
			gameState: gameState ? this.sanitizeGameState(gameState) : undefined,
		};

		// Add to crash logs
		this.crashLogs.unshift(crashReport);
		if (this.crashLogs.length > this.maxLogs) {
			this.crashLogs = this.crashLogs.slice(0, this.maxLogs);
		}

		// Log to console
		console.error(`[CRASH REPORT] ${type}:`, crashReport);

		// Save to localStorage if available
		this.saveCrashLogs();

		// Send to external service (if configured)
		this.sendCrashReport(crashReport);
	}

	private getAppVersion(): string {
		// Try to get version from package.json or window object
		if (typeof window !== 'undefined' && (window as any).APP_VERSION) {
			return (window as any).APP_VERSION;
		}
		return '0.1.1'; // Default version
	}

	private getPlatform(): string {
		if (typeof process !== 'undefined' && process.platform) {
			return process.platform;
		}
		// Fallback for browser environment
		if (typeof navigator !== 'undefined') {
			const platform = navigator.platform.toLowerCase();
			if (platform.includes('win')) return PlatformConstants.WIN32;
			if (platform.includes('mac')) return PlatformConstants.DARWIN;
			if (platform.includes('linux')) return PlatformConstants.LINUX;
		}
		return PlatformConstants.UNKNOWN;
	}

	private getArch(): string {
		if (typeof process !== 'undefined' && process.arch) {
			return process.arch;
		}
		// Fallback for browser environment
		if (typeof navigator !== 'undefined') {
			const userAgent = navigator.userAgent;
			if (userAgent.includes(UserAgentArchDetection.X64) || userAgent.includes(UserAgentArchDetection.X86_64))
				return ArchitectureConstants.X64;
			if (userAgent.includes(UserAgentArchDetection.X86) || userAgent.includes(UserAgentArchDetection.I386))
				return ArchitectureConstants.IA32;
			if (userAgent.includes(UserAgentArchDetection.ARM64) || userAgent.includes(UserAgentArchDetection.AARCH64))
				return ArchitectureConstants.ARM64;
			if (userAgent.includes(UserAgentArchDetection.ARM)) return ArchitectureConstants.ARM;
		}
		return ArchitectureConstants.UNKNOWN;
	}

	private getMemoryUsage(): NodeJS.MemoryUsage | undefined {
		if (typeof process !== 'undefined' && process.memoryUsage) {
			return process.memoryUsage();
		}
		// Browser environment - no direct memory access
		return undefined;
	}

	private sanitizeGameState(gameState: any): any {
		// Remove sensitive data from game state
		if (!gameState || typeof gameState !== 'object') {
			return gameState;
		}

		const sanitized = { ...gameState };

		// Remove potentially sensitive data
		delete sanitized.player?.password;
		delete sanitized.player?.token;
		delete sanitized.player?.sessionId;

		// Limit object depth
		return this.limitObjectDepth(sanitized, 3);
	}

	private limitObjectDepth(obj: any, maxDepth: number, currentDepth = 0): any {
		if (currentDepth >= maxDepth) {
			return '[Object]';
		}

		if (obj === null || typeof obj !== 'object') {
			return obj;
		}

		if (Array.isArray(obj)) {
			return obj.slice(0, 10).map((item) => this.limitObjectDepth(item, maxDepth, currentDepth + 1));
		}

		const result: any = {};
		for (const key in obj) {
			if (Object.prototype.hasOwnProperty.call(obj, key)) {
				result[key] = this.limitObjectDepth(obj[key], maxDepth, currentDepth + 1);
			}
		}
		return result;
	}

	private saveCrashLogs(): void {
		if (typeof localStorage !== 'undefined') {
			try {
				localStorage.setItem('neverquest-crash-logs', JSON.stringify(this.crashLogs));
			} catch (error) {
				console.error('Failed to save crash logs to localStorage:', error);
			}
		}
	}

	private loadCrashLogs(): void {
		if (typeof localStorage !== 'undefined') {
			try {
				const saved = localStorage.getItem('neverquest-crash-logs');
				if (saved) {
					this.crashLogs = JSON.parse(saved);
				}
			} catch (error) {
				console.error('Failed to load crash logs from localStorage:', error);
			}
		}
	}

	private async sendCrashReport(crashReport: CrashReport): Promise<void> {
		// In a real application, you would send this to a crash reporting service
		// like Sentry, Bugsnag, or your own server
		try {
			// Example: Send to external service
			// await fetch('https://your-crash-reporting-service.com/api/crashes', {
			//     method: 'POST',
			//     headers: { 'Content-Type': 'application/json' },
			//     body: JSON.stringify(crashReport)
			// });

			console.log('Crash report would be sent to external service:', crashReport);
		} catch (error) {
			console.error('Failed to send crash report:', error);
		}
	}

	public getCrashLogs(): CrashReport[] {
		return [...this.crashLogs];
	}

	public clearCrashLogs(): void {
		this.crashLogs = [];
		this.saveCrashLogs();
	}

	public exportCrashLogs(): string {
		return JSON.stringify(this.crashLogs, null, 2);
	}

	public getCrashStats(): { total: number; recent: number; byType: Record<string, number> } {
		const total = this.crashLogs.length;
		const recent = this.crashLogs.filter((log) => {
			const logTime = new Date(log.timestamp).getTime();
			const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
			return logTime > oneDayAgo;
		}).length;

		const byType: Record<string, number> = {};
		this.crashLogs.forEach((log) => {
			byType[log.error.name] = (byType[log.error.name] || 0) + 1;
		});

		return { total, recent, byType };
	}
}

// Export singleton instance
export const crashReporter = CrashReporter.getInstance();
