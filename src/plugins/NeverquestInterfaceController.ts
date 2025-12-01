import { NeverquestOutlineEffect } from './NeverquestOutlineEffect';
import { ErrorMessages } from '../consts/Messages';

interface InterfaceElement {
	element: any;
	action: string;
	context: any;
	args: any;
}

interface MenuHistoryItem {
	currentLinePosition: number;
	currentMatrixRow: number;
	currentMatrixCol: number;
	currentElementAction: InterfaceElement | null;
	closeAction: any;
}

/**
 * @class
 */
export class NeverquestInterfaceController {
	/**
	 * The parent scene.
	 */
	scene: Phaser.Scene;

	/**
	 * An Array with the interactible elements of the interface.
	 */
	interfaceElements: InterfaceElement[][][];

	/**
	 * The current line that the cursor is.
	 */
	currentLinePosition: number;

	/**
	 * The current Matrix row position.
	 */
	currentMatrixRow: number;

	/**
	 * The current matrix column position.
	 */
	currentMatrixCol: number;

	/**
	 * When moving up the menu, it should store the last menu position for better experience.
	 */
	menuHistory: MenuHistoryItem[];

	/**
	 * This is the current element that is selected.
	 */
	currentElementAction: InterfaceElement | null;

	/**
	 * This will trigger the Back or close function.
	 */
	closeAction: any;

	/**
	 * The navigation sound effect. You should change it to match the action the player will perform.
	 */
	navigationSound: string;

	/**
	 * The outline effect that will be used on the element.
	 */
	outlineEffect: NeverquestOutlineEffect;

	/**
	 * The Gamepad used to perform actions on the UI Scene.
	 */
	pad: Phaser.Input.Gamepad.Gamepad | null;

	constructor(scene: Phaser.Scene) {
		this.scene = scene;
		this.interfaceElements = [];
		this.currentLinePosition = 0;
		this.currentMatrixRow = 0;
		this.currentMatrixCol = 0;
		this.menuHistory = [];
		this.currentElementAction = null;
		this.closeAction = null;
		this.navigationSound = 'menu_navigation';
		this.outlineEffect = new NeverquestOutlineEffect(this.scene);
		this.pad = this.scene.input.gamepad.pad1;

		// this.scene.input.on(
		//     'pointerdown',
		//     /**
		//      *
		//      * @param { Phaser.Input.Pointer } pointer
		//      */
		//     (pointer, gameObjects) => {
		//         let object = gameObjects[0];
		//         if (pointer.wasTouch && object && object.item) {
		//             console.log(object.action);
		//             this.currentElementAction = {
		//                 element: object,
		//                 action: 'useItem',
		//                 context: this,
		//                 args: object,
		//             };
		//             this.updateHighlightedElement(
		//                 this.currentElementAction.element
		//             );
		//         }
		//     }
		// );

		this.scene.input.gamepad.on('connected', (_pad: Phaser.Input.Gamepad.Gamepad) => {
			this.pad = this.scene.input.gamepad.pad1;
			this.setGamepadRules();
		});

		this.setGamepadRules();

		this.scene.input.keyboard!.on('keydown', (keyboard: KeyboardEvent) => {
			if (keyboard.keyCode === 27) {
				this.close();
			}
			if (keyboard.keyCode === 37) {
				this.moveLeft();
			}
			if (keyboard.keyCode === 39) {
				this.moveRight();
			}
			if (keyboard.keyCode === 38 || keyboard.keyCode === 75) {
				this.moveUp();
			}
			if (keyboard.keyCode === 40 || keyboard.keyCode === 74) {
				this.moveDown();
			}
			if (keyboard.keyCode === 69 || keyboard.keyCode === 13) {
				if (this.currentElementAction && this.currentElementAction.action) {
					this.executeFunctionByName(
						this.currentElementAction.action,
						this.currentElementAction.context,
						this.currentElementAction.args
					);
				}
			}
		});
	}

	createFirstRow(): void {
		this.interfaceElements[0] = [];
		this.interfaceElements[0][0] = [];
	}

	/**
	 * Sets the gamepad control rules for the interface.
	 */
	setGamepadRules(): void {
		if (this.pad) {
			let difference = 0;
			this.scene.events.on('update', (time: number, _delta: number) => {
				if (difference === 0 || Math.abs(time - difference) > 75) {
					difference = time;
					if (this.pad!.axes[0].getValue() === 1) {
						this.moveRight();
					} else if (this.pad!.axes[0].getValue() === -1) {
						this.moveLeft();
					} else if (this.pad!.axes[1].getValue() === -1) {
						this.moveUp();
					} else if (this.pad!.axes[1].getValue() === 1) {
						this.moveDown();
					}
				}
			});
			this.pad.on('down', (_pad: Phaser.Input.Gamepad.Gamepad) => {
				if (this.pad!.down) {
					this.moveDown();
				}
				if (this.pad!.up) {
					this.moveUp();
				}
				if (this.pad!.right) {
					this.moveRight();
				}
				if (this.pad!.left) {
					this.moveLeft();
				}

				if (this.pad!.B) {
					this.close();
				}

				if (this.pad!.A) {
					this.executeFunctionByName(
						this.currentElementAction!.action,
						this.currentElementAction!.context,
						this.currentElementAction!.args
					);
				}
			});
		}
	}

	/**
	 * Clears all the interactionItems
	 */
	clearItems(): void {
		this.interfaceElements.flat();
		this.interfaceElements = [];
	}

	menuHistoryAdd(): void {
		this.menuHistory.push({
			currentLinePosition: this.currentLinePosition,
			currentMatrixRow: this.currentMatrixRow,
			currentMatrixCol: this.currentMatrixCol,
			currentElementAction: this.currentElementAction,
			closeAction: this.closeAction,
		});
	}

	menuHistoryRetrieve(): void {
		if (this.menuHistory.length === 0) {
			return;
		}
		const history = this.menuHistory[this.menuHistory.length - 1];
		this.removeCurrentSelectionHighlight();
		this.currentElementAction = history.currentElementAction;
		this.currentLinePosition = history.currentLinePosition;
		this.currentMatrixRow = history.currentMatrixRow;
		this.currentMatrixCol = history.currentMatrixCol;
		this.closeAction = history.closeAction;
		if (this.currentElementAction && this.currentElementAction.element) {
			this.updateHighlightedElement(this.currentElementAction.element);
		}
		this.menuHistory.pop();
	}

	/**
	 * Removes the current selectionhighlight.
	 */
	removeCurrentSelectionHighlight(): void {
		if (this.currentElementAction && this.currentElementAction.element) {
			this.removeSelection(this.currentElementAction.element);
		}
	}

	/**
	 * This function will execute the Close / Back child function.
	 */
	close(): void {
		this.outlineEffect.outlinePostFxPlugin.destroy();
		if (this.closeAction && this.closeAction.action) {
			this.executeFunctionByName(this.closeAction.action, this.closeAction.context, this.closeAction.args);
		}
	}

	// /**
	//  * Sets the current highlight element and removes the previous one.
	//  * @param { any } element
	//  */
	// setCurrentElement(element) {
	//     this.removeCurrentSelectionHighlight(this.currentElementAction);
	//     this.updateHighlightedElement(element.element);
	//     this.currentElementAction = element;
	// }

	/**
	 * Moves the cursor to the right.
	 */
	moveRight(): void {
		const hasError = this.hasNoLineData();
		if (hasError) {
			return;
		}
		if (!this.currentElementAction || !this.currentElementAction.element) {
			return;
		}
		this.removeSelection(this.currentElementAction.element);
		this.scene.sound.play(this.navigationSound);
		this.currentMatrixCol++;
		const currentPosition =
			this.interfaceElements[this.currentLinePosition][this.currentMatrixRow][this.currentMatrixCol];
		if (currentPosition) {
			this.currentElementAction = currentPosition;
		} else {
			this.currentMatrixCol = 0;
			this.currentElementAction = this.interfaceElements[this.currentLinePosition][this.currentMatrixRow][0];
		}
		if (this.currentElementAction && this.currentElementAction.element) {
			this.updateHighlightedElement(this.currentElementAction.element);
		}
	}

	/**
	 * Moves the cursor to the left.
	 */
	moveLeft(): void {
		const hasError = this.hasNoLineData();
		if (hasError) {
			return;
		}
		if (!this.currentElementAction || !this.currentElementAction.element) {
			return;
		}
		this.scene.sound.play(this.navigationSound);
		this.removeSelection(this.currentElementAction.element);
		this.currentMatrixCol--;
		const currentPosition =
			this.interfaceElements[this.currentLinePosition][this.currentMatrixRow][this.currentMatrixCol];
		if (currentPosition) {
			this.currentElementAction = currentPosition;
		} else {
			let position: number;
			if (this.interfaceElements[this.currentLinePosition].length === 1) {
				position = 0;
			} else {
				position = this.interfaceElements[this.currentLinePosition][this.currentMatrixRow].length - 1;
			}
			this.currentElementAction =
				this.interfaceElements[this.currentLinePosition][this.currentMatrixRow][position];
			this.currentMatrixCol = position;
		}
		if (this.currentElementAction && this.currentElementAction.element) {
			this.updateHighlightedElement(this.currentElementAction.element);
		}
	}

	/**
	 * Moves the cursor down.
	 */
	moveDown(changeMatrixRow: boolean = true): void {
		const hasError = this.hasNoLineData();
		if (hasError) {
			return;
		}
		if (!this.currentElementAction || !this.currentElementAction.element) {
			return;
		}
		this.scene.sound.play(this.navigationSound);
		this.removeSelection(this.currentElementAction.element);
		if (changeMatrixRow) this.currentMatrixRow++;
		if (!this.interfaceElements[this.currentLinePosition][this.currentMatrixRow]) {
			this.currentLinePosition++;
			this.currentMatrixRow--;
			const canMove = this.hasNoLineData();
			if (canMove) {
				this.currentLinePosition--;
				if (this.currentElementAction && this.currentElementAction.element) {
					this.updateHighlightedElement(this.currentElementAction.element);
				}
				return;
			}
			this.moveDown(false);
		}
		if (!this.interfaceElements[this.currentLinePosition][this.currentMatrixRow]) {
			this.currentMatrixRow = this.interfaceElements[this.currentLinePosition].length - 1;
		}
		const currentPosition =
			this.interfaceElements[this.currentLinePosition][this.currentMatrixRow][this.currentMatrixCol];

		if (currentPosition) {
			this.currentElementAction = currentPosition;
		} else if (
			this.interfaceElements[this.currentLinePosition][this.currentMatrixRow] &&
			!this.interfaceElements[this.currentLinePosition][this.currentMatrixRow][this.currentMatrixCol]
		) {
			this.currentElementAction =
				this.interfaceElements[this.currentLinePosition][this.currentMatrixRow][
					this.interfaceElements[this.currentLinePosition][this.currentMatrixRow].length - 1
				];
		}
		if (this.currentElementAction && this.currentElementAction.element) {
			this.updateHighlightedElement(this.currentElementAction.element);
		}
	}

	/**
	 * Moves the cursor up.
	 */
	moveUp(changeMatrixRow: boolean = true): void {
		const hasError = this.hasNoLineData();
		if (hasError) {
			return;
		}
		if (!this.currentElementAction || !this.currentElementAction.element) {
			return;
		}
		this.scene.sound.play(this.navigationSound);
		this.removeSelection(this.currentElementAction.element);
		if (changeMatrixRow) this.currentMatrixRow--;
		if (!this.interfaceElements[this.currentLinePosition][this.currentMatrixRow]) {
			this.currentLinePosition--;
			this.currentMatrixRow++;
			const canMove = this.hasNoLineData();
			if (canMove) {
				this.currentLinePosition++;
				if (this.currentElementAction && this.currentElementAction.element) {
					this.updateHighlightedElement(this.currentElementAction.element);
				}
				return;
			}
			this.moveUp(false);
		}
		if (!this.interfaceElements[this.currentLinePosition][this.currentMatrixRow]) {
			this.currentMatrixRow = this.interfaceElements[this.currentLinePosition].length - 1;
		}
		const currentPosition =
			this.interfaceElements[this.currentLinePosition][this.currentMatrixRow][this.currentMatrixCol];

		if (currentPosition) {
			this.currentElementAction = currentPosition;
		} else if (
			this.interfaceElements[this.currentLinePosition][this.currentMatrixRow] &&
			!this.interfaceElements[this.currentLinePosition][this.currentMatrixRow][this.currentMatrixCol]
		) {
			this.currentElementAction =
				this.interfaceElements[this.currentLinePosition][this.currentMatrixRow][
					this.interfaceElements[this.currentLinePosition][this.currentMatrixRow].length - 1
				];
		}
		if (this.currentElementAction && this.currentElementAction.element) {
			this.updateHighlightedElement(this.currentElementAction.element);
		}
	}

	/**
	 * Sets the outline effect to the current selected element.
	 * @param element
	 */
	updateHighlightedElement(element: any): void {
		// element.tint = 0xff00ff;
		if (this.scene && this.scene.sys && element) this.outlineEffect.applyEffect(element);
	}

	/**
	 * Removes the outline effect to the previously selected element.
	 * @param element
	 */
	removeSelection(element: any): void {
		// element.tint = 0xffffff;
		if (this.scene && this.scene.sys && element) this.outlineEffect.removeEffect(element);
	}

	/**
	 * Checks if there is no Line data available.
	 * @returns
	 */
	hasNoLineData(): boolean {
		if (!this.interfaceElements[this.currentLinePosition]) {
			console.error(ErrorMessages.INTERFACE_ELEMENT_LINE_NOT_AVAILABLE);
			return true;
		} else {
			return false;
		}
	}

	/**
	 * Recovers the last element position from a previous interface controler. This is slecialy useful when you recreate the scene.
	 * @param interfaceControler The interface to get the configuration from.
	 */
	recoverPositionFromPrevious(interfaceControler: NeverquestInterfaceController): void {
		const currentLinePosition = interfaceControler.currentLinePosition;
		const currentRow = interfaceControler.currentMatrixRow;
		const currentCol = interfaceControler.currentMatrixCol;
		this.currentLinePosition = currentLinePosition;
		this.currentMatrixRow = currentRow;
		this.currentMatrixCol = currentCol;
		this.removeCurrentSelectionHighlight();
		const element = (this.currentElementAction =
			this.interfaceElements[currentLinePosition][currentRow][currentCol]);
		this.updateHighlightedElement(element.element);
	}

	/**
	 * Executes the function on the correct Context.
	 * @param functionName
	 * @param context
	 * @param _args
	 * @returns
	 */
	executeFunctionByName(functionName: string, context: any, args: any): any {
		if (functionName) {
			const namespaces = functionName.split('.');
			const func = namespaces.pop()!;
			for (let i = 0; i < namespaces.length; i++) {
				context = context[namespaces[i]];
				if (!context) {
					return null; // Namespace doesn't exist
				}
			}
			if (context && typeof context[func] === 'function') {
				// Ensure args is an array for apply()
				const argsArray = Array.isArray(args) ? args : args ? [args] : [];
				return context[func].apply(context, argsArray);
			}
			return null; // Function doesn't exist
		} else {
			return null;
		}
	}
}
