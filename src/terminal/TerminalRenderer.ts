import blessed from 'blessed';
import { TerminalMessages } from '../consts/Messages';

/**
 * Base Terminal Renderer for the game
 * Provides core terminal UI functionality using blessed
 */
export class TerminalRenderer {
	public screen: blessed.Widgets.Screen;
	public gameBox: blessed.Widgets.BoxElement;
	public statusBox: blessed.Widgets.BoxElement;
	public logBox: blessed.Widgets.Log;
	public debugBox?: blessed.Widgets.BoxElement;
	private backgroundBox: blessed.Widgets.BoxElement;

	constructor(debug: boolean = false) {
		// Create the main screen
		this.screen = blessed.screen({
			smartCSR: true,
			title: TerminalMessages.TERMINAL_TITLE,
			fullUnicode: true,
			dockBorders: true,
		});

		// Create full-screen background
		this.backgroundBox = blessed.box({
			parent: this.screen,
			top: 0,
			left: 0,
			width: '100%',
			height: '100%',
			style: {
				bg: 'green',
			},
		});

		// Main game viewport
		this.gameBox = blessed.box({
			parent: this.screen,
			top: 0,
			left: 0,
			width: '70%',
			height: '80%',
			border: {
				type: 'line',
			},
			style: {
				bg: 'black',
				border: {
					fg: 'cyan',
				},
			},
			label: ' Game ',
			tags: true,
		});

		// Status panel (HP, MP, XP, etc.)
		this.statusBox = blessed.box({
			parent: this.screen,
			top: 0,
			left: '70%',
			width: '30%',
			height: '80%',
			border: {
				type: 'line',
			},
			style: {
				bg: 'black',
				border: {
					fg: 'green',
				},
			},
			label: ' Status ',
			tags: true,
			scrollable: true,
		});

		// Event log
		this.logBox = blessed.log({
			parent: this.screen,
			bottom: 0,
			left: 0,
			width: '100%',
			height: '20%',
			border: {
				type: 'line',
			},
			style: {
				bg: 'black',
				border: {
					fg: 'yellow',
				},
			},
			label: ' Log ',
			tags: true,
			scrollable: true,
			scrollback: 100,
			mouse: true,
		});

		// Optional debug box
		if (debug) {
			this.debugBox = blessed.box({
				parent: this.screen,
				top: 0,
				right: 0,
				width: '30%',
				height: '30%',
				border: {
					type: 'line',
				},
				style: {
					bg: 'black',
					border: {
						fg: 'red',
					},
				},
				label: ' Debug ',
				tags: true,
			});
		}

		// Quit on Escape, q, or Control-C
		this.screen.key(['escape', 'q', 'C-c'], () => {
			this.cleanup();
			process.exit(0);
		});

		// Enable mouse support for scrolling
		this.screen.enableMouse();
	}

	/**
	 * Log a message to the log box
	 */
	public log(message: string, color: string = 'white'): void {
		this.logBox.log(`{${color}-fg}${message}{/${color}-fg}`);
	}

	/**
	 * Update the status display
	 */
	public updateStatus(status: string): void {
		this.statusBox.setContent(status);
		this.screen.render();
	}

	/**
	 * Update debug info (if debug mode is enabled)
	 */
	public updateDebug(info: string): void {
		if (this.debugBox) {
			this.debugBox.setContent(info);
			this.screen.render();
		}
	}

	/**
	 * Render the screen
	 */
	public render(): void {
		this.screen.render();
	}

	/**
	 * Clean up resources
	 */
	public cleanup(): void {
		this.screen.destroy();
	}
}
