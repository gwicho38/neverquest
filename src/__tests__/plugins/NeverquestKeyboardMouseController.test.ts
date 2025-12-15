import { NeverquestKeyboardMouseController } from '../../plugins/NeverquestKeyboardMouseController';
import { NeverquestBattleManager } from '../../plugins/NeverquestBattleManager';

jest.mock('../../plugins/NeverquestBattleManager');
jest.mock('../../scenes/watchers/SceneToggleWatcher');

describe('NeverquestKeyboardMouseController', () => {
	let controller: any;
	let mockScene: any;
	let mockPlayer: any;

	beforeEach(() => {
		mockScene = {
			input: {
				mouse: {
					disableContextMenu: jest.fn(),
				},
				keyboard: {
					on: jest.fn(),
				},
				on: jest.fn(),
			},
			sys: {
				game: {
					device: {
						os: {
							desktop: true,
						},
					},
				},
			},
			events: {
				on: jest.fn(),
			},
			time: {
				delayedCall: jest.fn(),
			},
			scene: {
				isActive: jest.fn().mockReturnValue(false),
				launch: jest.fn(),
			},
		};

		mockPlayer = {
			active: true,
			isSwimming: false,
			isBlocking: false,
			canMove: true,
			canAtack: true,
			canBlock: true,
			canJump: true,
			jump: jest.fn(),
			container: {
				body: {},
			},
		};

		controller = new NeverquestKeyboardMouseController(mockScene, mockPlayer);
	});

	describe('constructor', () => {
		it('should initialize with scene and player', () => {
			expect(controller.scene).toBe(mockScene);
			expect(controller.player).toBe(mockPlayer);
			expect(controller.inventorySceneName).toBe('InventoryScene');
			expect(controller.attributeSceneName).toBe('AttributeScene');
		});
	});

	describe('create', () => {
		it('should set up input handlers', () => {
			controller.create();

			expect(mockScene.input.mouse.disableContextMenu).toHaveBeenCalled();
			expect(mockScene.input.on).toHaveBeenCalledWith('pointerdown', expect.any(Function));
			expect(mockScene.input.keyboard.on).toHaveBeenCalledWith('keydown', expect.any(Function));
			expect(mockScene.input.keyboard.on).toHaveBeenCalledWith('keyup', expect.any(Function));
			expect(NeverquestBattleManager).toHaveBeenCalled();
		});

		it('should handle left mouse click for attack on desktop', () => {
			controller.create();
			const pointerCallback = mockScene.input.on.mock.calls[0][1];

			const mockPointer = {
				leftButtonDown: () => true,
			};

			pointerCallback(mockPointer);
			expect(controller.neverquestBattleManager.atack).toHaveBeenCalledWith(mockPlayer);
		});

		it('should not attack on mobile', () => {
			mockScene.sys.game.device.os.desktop = false;
			controller.create();
			const pointerCallback = mockScene.input.on.mock.calls[0][1];

			const mockPointer = {
				leftButtonDown: () => true,
			};

			pointerCallback(mockPointer);
			expect(controller.neverquestBattleManager.atack).not.toHaveBeenCalled();
		});

		it('should not attack while swimming', () => {
			mockPlayer.isSwimming = true;
			controller.create();
			const pointerCallback = mockScene.input.on.mock.calls[0][1];

			const mockPointer = {
				leftButtonDown: () => true,
			};

			pointerCallback(mockPointer);
			expect(controller.neverquestBattleManager.atack).not.toHaveBeenCalled();
		});
	});

	describe('keyboard controls', () => {
		beforeEach(() => {
			controller.create();
		});

		it('should jump with spacebar (keyCode 32)', () => {
			const keydownCallback = mockScene.input.keyboard.on.mock.calls.find(
				(call: any) => call[0] === 'keydown'
			)[1];

			keydownCallback({ keyCode: 32 });
			expect(mockPlayer.jump).toHaveBeenCalled();
		});

		it('should attack with J key (keyCode 74)', () => {
			const keydownCallback = mockScene.input.keyboard.on.mock.calls.find(
				(call: any) => call[0] === 'keydown'
			)[1];

			keydownCallback({ keyCode: 74 });
			expect(controller.neverquestBattleManager.atack).toHaveBeenCalledWith(mockPlayer);
		});

		it('should block with K key (keyCode 75)', () => {
			const keydownCallback = mockScene.input.keyboard.on.mock.calls.find(
				(call: any) => call[0] === 'keydown'
			)[1];

			keydownCallback({ keyCode: 75 });
			expect(controller.neverquestBattleManager.block).toHaveBeenCalledWith(mockPlayer);
		});

		it('should stop blocking when K key is released', () => {
			const keyupCallback = mockScene.input.keyboard.on.mock.calls.find((call: any) => call[0] === 'keyup')[1];

			keyupCallback({ keyCode: 75 });
			expect(controller.neverquestBattleManager.stopBlock).toHaveBeenCalledWith(mockPlayer);
		});

		it('should open spell wheel when L key is held (keyCode 76)', () => {
			// Mock the timer to immediately execute the callback
			const timerCallback = jest.fn();
			mockScene.time.delayedCall.mockImplementation((_delay: number, callback: () => void) => {
				timerCallback.mockImplementation(callback);
				return { destroy: jest.fn() };
			});

			const keydownCallback = mockScene.input.keyboard.on.mock.calls.find(
				(call: any) => call[0] === 'keydown'
			)[1];

			keydownCallback({ keyCode: 76 });

			// Simulate the timer firing (hold threshold reached)
			timerCallback();

			expect(mockScene.scene.launch).toHaveBeenCalledWith('SpellWheelScene', {
				player: mockPlayer,
				parentScene: mockScene,
			});
		});

		it('should not attack while swimming (J key)', () => {
			mockPlayer.isSwimming = true;
			const keydownCallback = mockScene.input.keyboard.on.mock.calls.find(
				(call: any) => call[0] === 'keydown'
			)[1];

			keydownCallback({ keyCode: 74 });
			expect(controller.neverquestBattleManager.atack).not.toHaveBeenCalled();
		});

		it('should not block while swimming (K key)', () => {
			mockPlayer.isSwimming = true;
			const keydownCallback = mockScene.input.keyboard.on.mock.calls.find(
				(call: any) => call[0] === 'keydown'
			)[1];

			keydownCallback({ keyCode: 75 });
			expect(controller.neverquestBattleManager.block).not.toHaveBeenCalled();
		});

		it('should open inventory with I key (keyCode 73)', async () => {
			const { SceneToggleWatcher } = await import('../../scenes/watchers/SceneToggleWatcher');
			const keydownCallback = mockScene.input.keyboard.on.mock.calls.find(
				(call: any) => call[0] === 'keydown'
			)[1];

			keydownCallback({ keyCode: 73 });
			expect(SceneToggleWatcher.toggleScene).toHaveBeenCalledWith(mockScene, 'InventoryScene', mockPlayer);
		});

		it('should open attributes with U key (keyCode 85)', async () => {
			const { SceneToggleWatcher } = await import('../../scenes/watchers/SceneToggleWatcher');
			const keydownCallback = mockScene.input.keyboard.on.mock.calls.find(
				(call: any) => call[0] === 'keydown'
			)[1];

			keydownCallback({ keyCode: 85 });
			expect(SceneToggleWatcher.toggleScene).toHaveBeenCalledWith(mockScene, 'AttributeScene', mockPlayer);
		});

		it('should not respond to keys when player is inactive', () => {
			mockPlayer.active = false;
			const keydownCallback = mockScene.input.keyboard.on.mock.calls.find(
				(call: any) => call[0] === 'keydown'
			)[1];

			keydownCallback({ keyCode: 32 });
			expect(controller.neverquestBattleManager.atack).not.toHaveBeenCalled();
		});
	});
});
