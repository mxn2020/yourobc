/**
 * Abstract Game Engine
 *
 * Base class that all games extend. Provides:
 * - Game loop management (requestAnimationFrame)
 * - Lifecycle state management
 * - Event system
 * - Integration with rendering, input, and other systems
 */

import type {
  GameConfig,
  BaseGameState,
  GameState,
  GameEvent,
  GameEventListener,
  RenderContext,
} from './types';

export abstract class GameEngine<TGameState extends BaseGameState = BaseGameState> {
  // Configuration
  protected config: GameConfig;

  // Game state
  protected gameState: TGameState;

  // Game loop
  private animationFrameId: number | null = null;
  private lastFrameTime: number = 0;
  private fpsHistory: number[] = [];

  // Event system
  private eventListeners: Map<GameEvent, Set<GameEventListener>> = new Map();

  // Performance tracking
  private frameCount: number = 0;
  private lastFpsUpdate: number = 0;
  private currentFPS: number = 0;

  constructor(config: GameConfig) {
    this.config = config;
    this.gameState = this.createInitialState();
  }

  /**
   * Abstract methods that games must implement
   */

  /** Create the initial game state */
  protected abstract createInitialState(): TGameState;

  /** Update game logic (called every frame) */
  protected abstract update(deltaTime: number): void;

  /** Render the game (called every frame) */
  protected abstract render(context: RenderContext): void;

  /** Handle game over logic */
  protected abstract onGameOver(): void;

  /**
   * Optional hooks (games can override)
   */

  /** Called once when engine initializes */
  protected onInitialize(): void {}

  /** Called when game starts */
  protected onStart(): void {}

  /** Called when game pauses */
  protected onPause(): void {}

  /** Called when game resumes */
  protected onResume(): void {}

  /** Called when game resets */
  protected onReset(): void {}

  /** Called on each frame before update */
  protected onBeforeUpdate(deltaTime: number): void {}

  /** Called on each frame after update */
  protected onAfterUpdate(deltaTime: number): void {}

  /** Called on each frame before render */
  protected onBeforeRender(context: RenderContext): void {}

  /** Called on each frame after render */
  protected onAfterRender(context: RenderContext): void {}

  /**
   * Public API
   */

  /** Initialize the game engine */
  public initialize(): void {
    this.onInitialize();
    this.emit(GameEvent.INITIALIZED, { config: this.config });
    this.gameState.state = GameState.READY;
  }

  /** Start the game */
  public start(): void {
    if (this.gameState.state !== GameState.READY && this.gameState.state !== GameState.GAME_OVER) {
      console.warn('[GameEngine] Cannot start game in current state:', this.gameState.state);
      return;
    }

    this.gameState.state = GameState.PLAYING;
    this.gameState.isPaused = false;
    this.gameState.isGameOver = false;
    this.gameState.startTime = Date.now();
    this.gameState.endTime = null;
    this.lastFrameTime = performance.now();

    this.onStart();
    this.emit(GameEvent.STARTED, { state: this.gameState });

    // Start game loop
    this.startGameLoop();
  }

  /** Pause the game */
  public pause(): void {
    if (this.gameState.state !== GameState.PLAYING) {
      return;
    }

    this.gameState.state = GameState.PAUSED;
    this.gameState.isPaused = true;

    this.onPause();
    this.emit(GameEvent.PAUSED, { state: this.gameState });

    // Stop game loop
    this.stopGameLoop();
  }

  /** Resume the game */
  public resume(): void {
    if (this.gameState.state !== GameState.PAUSED) {
      return;
    }

    this.gameState.state = GameState.PLAYING;
    this.gameState.isPaused = false;
    this.lastFrameTime = performance.now(); // Reset frame time to avoid large delta

    this.onResume();
    this.emit(GameEvent.RESUMED, { state: this.gameState });

    // Restart game loop
    this.startGameLoop();
  }

  /** End the game */
  public gameOver(): void {
    if (this.gameState.state === GameState.GAME_OVER) {
      return;
    }

    this.gameState.state = GameState.GAME_OVER;
    this.gameState.isGameOver = true;
    this.gameState.isPaused = false;
    this.gameState.endTime = Date.now();

    if (this.gameState.startTime) {
      this.gameState.timePlayedMs = this.gameState.endTime - this.gameState.startTime;
    }

    this.onGameOver();
    this.emit(GameEvent.GAME_OVER, {
      state: this.gameState,
      score: this.gameState.score,
      timePlayedMs: this.gameState.timePlayedMs,
    });

    // Stop game loop
    this.stopGameLoop();
  }

  /** Reset the game */
  public reset(): void {
    this.stopGameLoop();

    const oldState = { ...this.gameState };
    this.gameState = this.createInitialState();
    this.gameState.state = GameState.READY;

    this.frameCount = 0;
    this.lastFpsUpdate = 0;
    this.currentFPS = 0;
    this.fpsHistory = [];

    this.onReset();
    this.emit(GameEvent.RESET, { oldState, newState: this.gameState });
  }

  /** Destroy the engine and clean up */
  public destroy(): void {
    this.stopGameLoop();
    this.eventListeners.clear();
  }

  /** Get current game state (read-only) */
  public getState(): Readonly<TGameState> {
    return this.gameState;
  }

  /** Get game configuration */
  public getConfig(): Readonly<GameConfig> {
    return this.config;
  }

  /** Get current FPS */
  public getFPS(): number {
    return this.currentFPS;
  }

  /** Update score */
  protected updateScore(newScore: number): void {
    const oldScore = this.gameState.score;
    this.gameState.score = newScore;

    this.emit(GameEvent.SCORE_CHANGED, {
      oldScore,
      newScore,
      delta: newScore - oldScore,
    });
  }

  /**
   * Game Loop Management
   */

  private startGameLoop(): void {
    if (this.animationFrameId !== null) {
      return; // Already running
    }

    this.lastFrameTime = performance.now();
    this.gameLoop();
  }

  private stopGameLoop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private gameLoop = (): void => {
    const now = performance.now();
    const deltaTime = now - this.lastFrameTime;

    // Cap delta time to avoid huge jumps (e.g., when tab is inactive)
    const cappedDeltaTime = Math.min(deltaTime, 100);

    this.lastFrameTime = now;
    this.gameState.frame++;

    // Update FPS
    this.updateFPS(deltaTime);

    // Update game state
    if (this.gameState.state === GameState.PLAYING && !this.gameState.isPaused) {
      this.onBeforeUpdate(cappedDeltaTime);
      this.update(cappedDeltaTime);
      this.onAfterUpdate(cappedDeltaTime);

      // Update time played
      if (this.gameState.startTime) {
        this.gameState.timePlayedMs = now - this.gameState.startTime;
      }
    }

    // Render
    const renderContext: RenderContext = {
      deltaTime: cappedDeltaTime,
      fps: this.currentFPS,
    };

    this.onBeforeRender(renderContext);
    this.render(renderContext);
    this.onAfterRender(renderContext);

    // Continue loop
    if (this.gameState.state === GameState.PLAYING || this.config.debug) {
      this.animationFrameId = requestAnimationFrame(this.gameLoop);
    }
  };

  private updateFPS(deltaTime: number): void {
    this.frameCount++;

    const now = performance.now();
    if (now - this.lastFpsUpdate >= 1000) {
      this.currentFPS = Math.round(this.frameCount * 1000 / (now - this.lastFpsUpdate));
      this.frameCount = 0;
      this.lastFpsUpdate = now;

      // Track FPS history for debugging
      this.fpsHistory.push(this.currentFPS);
      if (this.fpsHistory.length > 60) {
        this.fpsHistory.shift();
      }
    }
  }

  /**
   * Event System
   */

  /** Register an event listener */
  public on(event: GameEvent, listener: GameEventListener): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }

    this.eventListeners.get(event)!.add(listener);

    // Return unsubscribe function
    return () => {
      this.off(event, listener);
    };
  }

  /** Remove an event listener */
  public off(event: GameEvent, listener: GameEventListener): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /** Emit an event */
  protected emit(event: GameEvent, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`[GameEngine] Error in event listener for ${event}:`, error);
        }
      });
    }

    if (this.config.debug) {
      console.log(`[GameEngine] Event: ${event}`, data);
    }
  }

  /**
   * Utility methods
   */

  /** Check if game is currently playing */
  public isPlaying(): boolean {
    return this.gameState.state === GameState.PLAYING && !this.gameState.isPaused;
  }

  /** Check if game is paused */
  public isPaused(): boolean {
    return this.gameState.state === GameState.PAUSED;
  }

  /** Check if game is over */
  public isGameOver(): boolean {
    return this.gameState.state === GameState.GAME_OVER;
  }

  /** Get average FPS from history */
  public getAverageFPS(): number {
    if (this.fpsHistory.length === 0) return 0;
    const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.fpsHistory.length);
  }
}
