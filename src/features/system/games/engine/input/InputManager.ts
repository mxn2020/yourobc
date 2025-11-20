/**
 * Unified Input Manager
 *
 * Handles all input types: keyboard, touch, mouse, and gamepad
 * Provides action-based input mapping with auto-repeat support
 */

import type { InputConfig } from '../core/types';
import { InputType } from '../core/types';

type InputCallback = (action: string, value?: number) => void;

interface KeyState {
  isPressed: boolean;
  pressTime: number;
  lastRepeatTime: number;
}

interface TouchState {
  startX: number;
  startY: number;
  startTime: number;
  identifier: number;
}

export class InputManager {
  private config: InputConfig;
  private callbacks: Set<InputCallback> = new Set();

  // Keyboard state
  private keyStates: Map<string, KeyState> = new Map();
  private keyToAction: Map<string, string> = new Map();

  // Touch state
  private touches: Map<number, TouchState> = new Map();
  private touchActions: Map<string, string> = new Map(); // gesture -> action

  // Gamepad state
  private gamepadIndex: number | null = null;
  private gamepadButtonToAction: Map<number, string> = new Map();
  private lastGamepadState: GamepadButton[] = [];

  // Auto-repeat
  private autoRepeatTimer: number | null = null;

  // Enabled state
  private enabled: boolean = true;

  constructor(config: InputConfig) {
    this.config = config;
    this.buildInputMappings();
  }

  /**
   * Initialize input listeners
   */
  public initialize(): void {
    if (this.config.supportedInputs.includes(InputType.KEYBOARD)) {
      this.initializeKeyboard();
    }

    if (this.config.supportedInputs.includes(InputType.TOUCH)) {
      this.initializeTouch();
    }

    if (this.config.supportedInputs.includes(InputType.MOUSE)) {
      this.initializeMouse();
    }

    if (this.config.supportedInputs.includes(InputType.GAMEPAD)) {
      this.initializeGamepad();
    }
  }

  /**
   * Clean up input listeners
   */
  public destroy(): void {
    this.enabled = false;

    // Remove keyboard listeners
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);

    // Remove touch listeners
    window.removeEventListener('touchstart', this.handleTouchStart);
    window.removeEventListener('touchmove', this.handleTouchMove);
    window.removeEventListener('touchend', this.handleTouchEnd);
    window.removeEventListener('touchcancel', this.handleTouchEnd);

    // Remove mouse listeners
    window.removeEventListener('click', this.handleClick);
    window.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('mouseup', this.handleMouseUp);

    // Stop gamepad polling
    if (this.autoRepeatTimer) {
      window.clearInterval(this.autoRepeatTimer);
    }

    this.callbacks.clear();
  }

  /**
   * Register an input callback
   */
  public on(callback: InputCallback): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  /**
   * Enable/disable input
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.keyStates.clear();
      this.touches.clear();
    }
  }

  /**
   * Check if a key is currently pressed
   */
  public isKeyPressed(key: string): boolean {
    return this.keyStates.get(key)?.isPressed ?? false;
  }

  /**
   * Check if an action is active
   */
  public isActionActive(action: string): boolean {
    const actionDef = this.config.actions.find(a => a.action === action);
    if (!actionDef) return false;

    return actionDef.keys.some(key => this.isKeyPressed(key));
  }

  /**
   * Build input mappings from config
   */
  private buildInputMappings(): void {
    for (const action of this.config.actions) {
      // Map keys to actions
      for (const key of action.keys) {
        this.keyToAction.set(key, action.action);
      }

      // Map touch gestures to actions
      if (action.touchGesture) {
        this.touchActions.set(action.touchGesture, action.action);
      }

      // Map gamepad buttons to actions
      if (action.gamepadButton !== undefined) {
        this.gamepadButtonToAction.set(action.gamepadButton, action.action);
      }
    }
  }

  /**
   * Keyboard input
   */
  private initializeKeyboard(): void {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);

    // Start auto-repeat timer
    if (this.config.enableAutoRepeat) {
      this.autoRepeatTimer = window.setInterval(() => {
        this.handleAutoRepeat();
      }, this.config.autoRepeatRate ?? 50);
    }
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (!this.enabled) return;

    const key = event.key;
    const action = this.keyToAction.get(key);

    if (!action) return;

    // Prevent default for game keys
    event.preventDefault();

    // Check if already pressed
    const keyState = this.keyStates.get(key);
    if (keyState?.isPressed) {
      return; // Ignore auto-repeat from browser
    }

    // Record key state
    const now = performance.now();
    this.keyStates.set(key, {
      isPressed: true,
      pressTime: now,
      lastRepeatTime: now,
    });

    // Trigger action
    this.triggerAction(action);
  };

  private handleKeyUp = (event: KeyboardEvent): void => {
    if (!this.enabled) return;

    const key = event.key;
    this.keyStates.delete(key);
  };

  private handleAutoRepeat(): void {
    if (!this.enabled) return;

    const now = performance.now();
    const delay = this.config.autoRepeatDelay ?? 200;
    const rate = this.config.autoRepeatRate ?? 50;

    for (const [key, state] of this.keyStates.entries()) {
      if (!state.isPressed) continue;

      const timeSincePress = now - state.pressTime;
      const timeSinceLastRepeat = now - state.lastRepeatTime;

      // Check if we should repeat
      if (timeSincePress >= delay && timeSinceLastRepeat >= rate) {
        const action = this.keyToAction.get(key);
        if (action) {
          // Only repeat continuous actions
          const actionDef = this.config.actions.find(a => a.action === action);
          if (actionDef?.continuous) {
            state.lastRepeatTime = now;
            this.triggerAction(action);
          }
        }
      }
    }
  }

  /**
   * Touch input
   */
  private initializeTouch(): void {
    window.addEventListener('touchstart', this.handleTouchStart);
    window.addEventListener('touchmove', this.handleTouchMove);
    window.addEventListener('touchend', this.handleTouchEnd);
    window.addEventListener('touchcancel', this.handleTouchEnd);
  }

  private handleTouchStart = (event: TouchEvent): void => {
    if (!this.enabled) return;

    event.preventDefault();

    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      this.touches.set(touch.identifier, {
        startX: touch.clientX,
        startY: touch.clientY,
        startTime: performance.now(),
        identifier: touch.identifier,
      });

      // Trigger tap action
      const tapAction = this.touchActions.get('tap');
      if (tapAction) {
        this.triggerAction(tapAction);
      }
    }
  };

  private handleTouchMove = (event: TouchEvent): void => {
    event.preventDefault();
  };

  private handleTouchEnd = (event: TouchEvent): void => {
    if (!this.enabled) return;

    event.preventDefault();

    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      const touchState = this.touches.get(touch.identifier);

      if (touchState) {
        const deltaX = touch.clientX - touchState.startX;
        const deltaY = touch.clientY - touchState.startY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Detect swipe gestures
        if (distance > 50) {
          const angle = Math.atan2(deltaY, deltaX);
          let gesture: string | null = null;

          if (Math.abs(angle) < Math.PI / 4) {
            gesture = 'swipe_right';
          } else if (Math.abs(angle) > (3 * Math.PI) / 4) {
            gesture = 'swipe_left';
          } else if (angle < 0) {
            gesture = 'swipe_up';
          } else {
            gesture = 'swipe_down';
          }

          if (gesture) {
            const action = this.touchActions.get(gesture);
            if (action) {
              this.triggerAction(action);
            }
          }
        }

        this.touches.delete(touch.identifier);
      }
    }
  };

  /**
   * Mouse input
   */
  private initializeMouse(): void {
    window.addEventListener('click', this.handleClick);
    window.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mouseup', this.handleMouseUp);
  }

  private handleClick = (_event: MouseEvent): void => {
    if (!this.enabled) return;
    // Can be used for click-based games
  };

  private handleMouseDown = (_event: MouseEvent): void => {
    if (!this.enabled) return;
  };

  private handleMouseUp = (_event: MouseEvent): void => {
    if (!this.enabled) return;
  };

  /**
   * Gamepad input
   */
  private initializeGamepad(): void {
    window.addEventListener('gamepadconnected', (e: GamepadEvent) => {
      console.log('[InputManager] Gamepad connected:', e.gamepad.id);
      this.gamepadIndex = e.gamepad.index;
    });

    window.addEventListener('gamepaddisconnected', (e: GamepadEvent) => {
      console.log('[InputManager] Gamepad disconnected');
      if (this.gamepadIndex === e.gamepad.index) {
        this.gamepadIndex = null;
      }
    });

    // Poll gamepad state
    this.pollGamepad();
  }

  private pollGamepad = (): void => {
    if (!this.enabled || this.gamepadIndex === null) {
      requestAnimationFrame(this.pollGamepad);
      return;
    }

    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[this.gamepadIndex];

    if (gamepad) {
      // Check button states
      for (let i = 0; i < gamepad.buttons.length; i++) {
        const button = gamepad.buttons[i];
        const wasPressed = this.lastGamepadState[i]?.pressed ?? false;
        const isPressed = button.pressed;

        if (isPressed && !wasPressed) {
          const action = this.gamepadButtonToAction.get(i);
          if (action) {
            this.triggerAction(action, button.value);
          }
        }
      }

      this.lastGamepadState = gamepad.buttons.map(b => ({ ...b })) as GamepadButton[];
    }

    requestAnimationFrame(this.pollGamepad);
  };

  /**
   * Trigger an action callback
   */
  private triggerAction(action: string, value?: number): void {
    this.callbacks.forEach(callback => {
      try {
        callback(action, value);
      } catch (error) {
        console.error('[InputManager] Error in callback:', error);
      }
    });
  }

  /**
   * Update input config
   */
  public updateConfig(config: Partial<InputConfig>): void {
    this.config = { ...this.config, ...config };
    this.buildInputMappings();
  }

  /**
   * Get current config
   */
  public getConfig(): InputConfig {
    return { ...this.config };
  }
}
