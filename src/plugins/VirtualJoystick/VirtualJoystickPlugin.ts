/**
 * @fileoverview Virtual joystick plugin for mobile touch controls
 *
 * This file provides the main plugin for virtual joystick creation:
 * - Factory for Stick, HiddenStick, DPad, and Button objects
 * - Automatic pointer management for multi-touch
 * - Scene lifecycle integration (boot, start, shutdown, destroy)
 *
 * Third-party library by Photon Storm Ltd, adapted for Neverquest.
 *
 * @author       Richard Davey <rich@photonstorm.com>
 * @copyright    2019 Photon Storm Ltd.
 * @license      {@link http://choosealicense.com/licenses/no-license/|No License}
 *
 * @see JoystickScene - Primary usage context
 * @see NeverquestGamePadController - Physical controller alternative
 *
 * @module plugins/VirtualJoystick/VirtualJoystickPlugin
 */

import CONST from './const';
import Button from './Button';
import DPad from './DPad';
import Stick from './Stick';
import HiddenStick from './HiddenStick';

/**
 * The Virtual Joystick plugin.
 *
 * This plugin is responsible for all joysticks and buttons created within a Scene.
 *
 * Add it via the Scene Plugin Loader:
 *
 * `this.load.scenePlugin('VirtualJoystickPlugin', 'src/VirtualJoystickPlugin.js', 'VirtualJoystickPlugin', 'pad');`
 *
 * This will add a new property called `pad` to every Scene.
 *
 * Once created you can then add new joysticks and buttons using `this.pad.addStick` and `this.pad.addButton` respectively.
 *
 * This plugin can create multiple sticks and buttons and will handle processing and updating them all.
 */
export default class VirtualJoystick {
	pluginManager: Phaser.Plugins.PluginManager;
	game: Phaser.Game;
	scene: Phaser.Scene;
	systems: Phaser.Scenes.Systems;
	sticks: Set<Stick | HiddenStick | DPad> | null;
	buttons: Set<Button> | null;
	_pointerTotal: number;

	/**
	 * @param {Phaser.Scene} scene - A reference to the Scene that has installed this plugin.
	 * @param {Phaser.Plugins.PluginManager} pluginManager - A reference to the Plugin Manager.
	 */
	constructor(scene: Phaser.Scene, pluginManager: Phaser.Plugins.PluginManager) {
		/**
		 * A handy reference to the Plugin Manager that is responsible for this plugin.
		 * Can be used as a route to gain access to game systems and  events.
		 *
		 * @name Phaser.Plugins.BasePlugin#pluginManager
		 * @type {Phaser.Plugins.PluginManager}
		 * @protected
		 * @since 3.8.0
		 */
		this.pluginManager = pluginManager;

		/**
		 * A reference to the Game instance this plugin is running under.
		 *
		 * @name Phaser.Plugins.BasePlugin#game
		 * @type {Phaser.Game}
		 * @protected
		 * @since 3.8.0
		 */
		this.game = pluginManager.game;

		/**
		 * A reference to the Scene that has installed this plugin.
		 * Only set if it's a Scene Plugin, otherwise `null`.
		 * This property is only set when the plugin is instantiated and added to the Scene, not before.
		 * You cannot use it during the `init` method, but you can during the `boot` method.
		 *
		 * @name Phaser.Plugins.BasePlugin#scene
		 * @type {?Phaser.Scene}
		 * @protected
		 * @since 3.8.0
		 */
		this.scene = scene;

		/**
		 * A reference to the Scene Systems of the Scene that has installed this plugin.
		 * Only set if it's a Scene Plugin, otherwise `null`.
		 * This property is only set when the plugin is instantiated and added to the Scene, not before.
		 * You cannot use it during the `init` method, but you can during the `boot` method.
		 *
		 * @name Phaser.Plugins.BasePlugin#systems
		 * @type {?Phaser.Scenes.Systems}
		 * @protected
		 * @since 3.8.0
		 */
		this.systems = scene.sys;

		/**
		 * The Sticks that this plugin is responsible for.
		 * @type {Set}
		 */
		this.sticks = null;

		/**
		 * The Buttons that this plugin is responsible for.
		 * @type {Set}
		 */
		this.buttons = null;

		/**
		 * Internal var to track the Input pointer total.
		 * @type {integer}
		 * @private
		 */
		this._pointerTotal = 0;

		scene.sys.events.once('boot', this.boot, this);
	}

	/**
	 * The boot method.
	 *
	 * @private
	 */
	boot(): void {
		this.systems.events.once('destroy', this.destroy, this);

		//  Because they may load the plugin via the Loader
		if (this.systems.settings.active) {
			this.start();
		} else {
			this.systems.events.on('start', this.start, this);
		}
	}

	/**
	 * The start method.
	 *
	 * @private
	 */
	start(): void {
		this.sticks = new Set();
		this.buttons = new Set();

		this.systems.events.on('update', this.update, this);
		this.systems.events.once('shutdown', this.shutdown, this);
	}

	/**
	 * Creates a new `Stick` object.
	 *
	 * `const stick = this.pad.addStick(x, y, distance, 'texture');`
	 *
	 * It consists of two Sprites: one representing the 'base' of the joystick and the other the 'stick' itself, which is the part
	 * that the player grabs hold of and interacts with. As the stick is moved you can read back the force being applied, either globally
	 * or on a per axis basis.
	 *
	 * The Stick can either be on-screen all the time, positioned via the `posX` and `posY` setters. Or you can have it only appear when the
	 * player touches the screen by setting `showOnTouch` to true.
	 *
	 * The Stick sprites are automatically added to the Scene at the point this Stick is created.
	 *
	 * Stick force values are analogue, that is they are values between 0 and 1 that vary depending on how the stick
	 * is being moved. This allows players to have fine-grained control over your game. If you require just an 'on / off' response you may
	 * wish to use the DPad class instead.
	 *
	 * @param {number} x - The x coordinate to draw the joystick at. The joystick is centered on this coordinate.
	 * @param {number} y - The y coordinate to draw the joystick at. The joystick is centered on this coordinate.
	 * @param {number} distance - The distance threshold between the stick and the base. This is how far the stick can be pushed in any direction.
	 * @param {string} texture - The key of the texture atlas to be used to render this joystick.
	 * @param {string} [baseFrame='base'] - The name of the base frame within the joystick texture atlas.
	 * @param {string} [stickFrame='stick'] - The name of the stick frame within the joystick texture atlas.
	 *
	 * @return {Stick} The Stick object.
	 */
	addStick(
		x: number,
		y: number,
		distance: number,
		texture: string,
		baseFrame: string = 'base',
		stickFrame: string = 'stick'
	): Stick {
		const stick = new Stick(this.scene, x, y, distance, texture, baseFrame, stickFrame);

		this.sticks!.add(stick);

		this._pointerTotal++;

		if (this._pointerTotal > 2) {
			(this.scene.sys as any).input.addPointer();
		}

		return stick;
	}

	/**
	 * Creates a new `HiddenStick` object.
	 *
	 * `const stick = this.pad.addHiddenStick(distance);`
	 *
	 * A `HiddenStick` is a virtual joystick with no on-screen visuals.
	 * It belongs to the Virtual Joystick Plugin which is responsible for creating and updating it.
	 *
	 * The Stick is active the moment you touch the screen, no matter where you touch it.
	 * As such, changing the position, alpha, visible or scale of this stick has no impact.
	 *
	 * Stick force values are analogue, that is they are values between 0 and 1 that vary depending on how the stick
	 * is being moved. This allows players to have fine-grained control over your game. If you require just an 'on / off' response you may
	 * wish to use the DPad class instead.
	 *
	 * @param {number} distance - The distance threshold between the stick and the base. This is how far the stick can be pushed in any direction.
	 *
	 * @return {HiddenStick} The HiddenStick object.
	 */
	addHiddenStick(distance: number): HiddenStick {
		const stick = new HiddenStick(this.scene, distance);

		this.sticks!.add(stick);

		this._pointerTotal++;

		if (this._pointerTotal > 2) {
			(this.scene.sys as any).input.addPointer();
		}

		return stick;
	}

	/**
	 * Creates a new `DPad` object.
	 *
	 * `const dpad = this.pad.addDPad(x, y, size, 'texture');`
	 *
	 * While the Stick class creates an analogue joystick, the DPad one creates a digital joystick. The difference is that a digital joystick
	 * is either "on" or "off" in any given direction. There is no pressure or degree of force in any direction, it's either moving or it isn't.
	 * This is the same as the way in which NES style game pads work. The "D" stands for "Direction".
	 *
	 * Unlike the Stick class the DPad can use a different frame from the texture atlas for each of the 4 directions in which it can move.
	 *
	 * The DPad can either be on-screen all the time, positioned via the `posX` and `posY` setters. Or you can have it only appear when the
	 * player touches the screen by setting `showOnTouch` to true.
	 *
	 * The DPad sprites are automatically added to the Scene at the point this Stick is created.
	 *
	 * @param {number} x - The x coordinate to draw the joystick at. The joystick is centered on this coordinate.
	 * @param {number} y - The y coordinate to draw the joystick at. The joystick is centered on this coordinate.
	 * @param {number} size - The size of the circular hit area for the DPad. If a falsey value it will use the size of the neutralFrame.
	 * @param {string} texture - The key of the texture atlas to be used to render this joystick.
	 * @param {string} [neutralFrame=neutral] - The name of the frame within the texture atlas that contains the 'neutral' state of the dpad. Neutral is the state when the dpad isn't moved at all.
	 * @param {string} [upFrame=up] - The name of the frame within the texture atlas that contains the 'up' state of the dpad.
	 * @param {string} [downFrame=down] - The name of the frame within the texture atlas that contains the 'down' state of the dpad.
	 * @param {string} [leftFrame=left] - The name of the frame within the texture atlas that contains the 'left' state of the dpad.
	 * @param {string} [rightFrame=right] - The name of the frame within the texture atlas that contains the 'right' state of the dpad.
	 *
	 * @return {DPad} The DPad object.
	 */
	addDPad(
		x: number,
		y: number,
		size: number,
		texture: string,
		neutralFrame: string = 'neutral',
		upFrame: string = 'up',
		downFrame: string = 'down',
		leftFrame: string = 'left',
		rightFrame: string = 'right'
	): DPad {
		const stick = new DPad(
			this.scene,
			x,
			y,
			size,
			texture,
			neutralFrame,
			upFrame,
			downFrame,
			leftFrame,
			rightFrame
		);

		this.sticks!.add(stick);

		this._pointerTotal++;

		if (this._pointerTotal > 2) {
			(this.scene.sys as any).input.addPointer();
		}

		return stick;
	}

	/**
	 * Removes the given Stick or DPad object from this plugin and then calls `destroy` on it.
	 *
	 * @param {Stick|HiddenStick|DPad} stick - The Stick or DPad object to be destroyed and removed.
	 */
	removeStick(stick: Stick | HiddenStick | DPad): void {
		this.sticks!.delete(stick);

		stick.destroy();

		this._pointerTotal--;
	}

	/**
	 * Creates a new `Button` object - a virtual button.
	 *
	 * `const button = this.pad.addButton(x, y, 'texture', 'button-up', 'button-down');`
	 *
	 * It consists of one sprite with two frames. One frame depicts the button as it's held down, the other when up.
	 *
	 * The Button sprites are automatically added to the Scene at the point this Button is created.
	 *
	 * The Button is digital, i.e. it is either 'on or off'. It doesn't have a pressure or force associated with it.
	 *
	 * @param {number} x - The x coordinate to draw the button at. The button is centered on this coordinate.
	 * @param {number} y - The y coordinate to draw the button at. The button is centered on this coordinate.
	 * @param {string} texture - The key of the texture atlas to be used to render this button.
	 * @param {string} upFrame - The name of the frame within the button texture atlas to be used when the button is in an 'up' state.
	 * @param {string} downFrame - The name of the frame within the button texture atlas to be used when the button is in a 'down' state.
	 * @param {integer} shape - The shape of the buttons hit area. Either `VirtualJoystick.CIRC_BUTTON` or `VirtualJoystick.RECT_BUTTON`.
	 *
	 * @return {Button} The Button object.
	 */
	addButton(
		x: number,
		y: number,
		texture: string,
		upFrame: string,
		downFrame: string,
		shape: number = CONST.CIRC_BUTTON
	): Button {
		const button = new Button(this.scene, shape, x, y, texture, upFrame, downFrame);

		this.buttons!.add(button);

		this._pointerTotal++;

		if (this._pointerTotal > 2) {
			(this.scene.sys as any).input.addPointer();
		}

		return button;
	}

	/**
	 * Removes the given Button object from this plugin and then calls `Button.destroy` on it.
	 *
	 * @param {Button|Button[]} button - The Button object, or an array of Buttons, to be destroyed and removed.
	 */
	removeButton(button: Button | Button[]): void {
		if (Array.isArray(button)) {
			for (const b of button) {
				this.buttons!.delete(b);

				b.destroy();

				this._pointerTotal--;
			}
		} else {
			this.buttons!.delete(button);

			button.destroy();

			this._pointerTotal--;
		}
	}

	/**
	 * Called automatically by the Phaser Plugin Manager.
	 *
	 * Updates all Stick and Button objects.
	 *
	 * @param {integer} time - The current game timestep.
	 */
	update(time: number): void {
		for (const stick of this.sticks!) {
			stick.update(time);
		}

		for (const button of this.buttons!) {
			button.update(time);
		}
	}

	/**
	 * Shuts down the event listeners for this plugin.
	 */
	shutdown(): void {
		const eventEmitter = this.systems.events;

		eventEmitter.off('update', this.update, this);
		eventEmitter.off('shutdown', this.shutdown, this);
	}

	/**
	 * Removes and calls `destroy` on all Stick and Button objects in this plugin.
	 */
	destroy(): void {
		this.shutdown();

		for (const stick of this.sticks!) {
			stick.destroy();
		}

		for (const button of this.buttons!) {
			button.destroy();
		}

		this.sticks!.clear();
		this.buttons!.clear();

		this._pointerTotal = 0;
	}
}

/**
 * @type {integer} VirtualJoystick.NONE
 */
(VirtualJoystick as any).NONE = 0;

/**
 * @type {integer} VirtualJoystick.HORIZONTAL
 */
(VirtualJoystick as any).HORIZONTAL = 1;

/**
 * @type {integer} VirtualJoystick.VERTICAL
 */
(VirtualJoystick as any).VERTICAL = 2;

/**
 * @type {integer} VirtualJoystick.CIRC_BUTTON
 */
(VirtualJoystick as any).CIRC_BUTTON = 3;

/**
 * @type {integer} VirtualJoystick.RECT_BUTTON
 */
(VirtualJoystick as any).RECT_BUTTON = 4;
