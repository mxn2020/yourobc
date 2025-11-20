/**
 * Dino Jump Game - Game Engine Implementation
 *
 * Extends the unified GameEngine to create the Dino Jump game
 * Uses Canvas rendering and keeps existing game physics
 */

import {
  GameEngine,
  type BaseGameState,
  GameState,
  type RenderContext,
  type GameConfig,
  RenderMode,
} from '../../engine';
import type { DinoState, Obstacle, Cloud } from '../types';
import {
  createInitialDinoState,
  updateDinoPhysics,
  updateObstacles,
  updateClouds,
  checkCollision,
  updateObstaclesPassed,
  calculateScore,
  createCloud,
  createObstacle,
  DEFAULT_CONFIG,
  type GameConfig as DinoGameConfig,
} from '../utils/gamePhysics';

/**
 * Dino-specific game state
 */
export interface DinoGameState extends BaseGameState {
  // Entities
  dino: DinoState;
  obstacles: Obstacle[];
  clouds: Cloud[];

  // Game metrics
  speed: number;
  distance: number;
  obstaclesJumped: number;
  obstaclesDucked: number;
  perfectJumps: number;
  nearMisses: number;

  // Config
  config: DinoGameConfig;
}

/**
 * DinoGame class - Extends GameEngine
 */
export class DinoGame extends GameEngine<DinoGameState> {
  private lastFrameTime: number = 0;

  constructor(config?: Partial<GameConfig>) {
    const dinoConfig: GameConfig = {
      id: 'dino',
      name: 'Dino Jump',
      description: 'Classic endless runner game',
      renderMode: RenderMode.CANVAS,
      targetFPS: 60,
      debug: false,
      ...config,
    };

    super(dinoConfig);
  }

  /**
   * Create initial game state
   */
  protected createInitialState(): DinoGameState {
    return {
      // Base game state
      state: GameState.IDLE,
      score: 0,
      startTime: null,
      endTime: null,
      timePlayedMs: 0,
      isPaused: false,
      isGameOver: false,
      frame: 0,

      // Dino-specific state
      dino: createInitialDinoState(),
      obstacles: [],
      clouds: this.createInitialClouds(),
      speed: DEFAULT_CONFIG.initialSpeed,
      distance: 0,
      obstaclesJumped: 0,
      obstaclesDucked: 0,
      perfectJumps: 0,
      nearMisses: 0,
      config: DEFAULT_CONFIG,
    };
  }

  /**
   * Create initial clouds for background
   */
  private createInitialClouds(): Cloud[] {
    const clouds: Cloud[] = [];
    for (let i = 0; i < 3; i++) {
      clouds.push(createCloud(Math.random() * 800));
    }
    return clouds;
  }

  /**
   * Update game logic (called every frame)
   */
  protected update(deltaTime: number): void {
    // Update distance and score
    this.gameState.distance += this.gameState.speed;
    this.gameState.score = calculateScore(this.gameState.distance);

    // Increase speed over time
    this.gameState.speed = Math.min(
      this.gameState.speed + this.gameState.config.speedIncrement,
      this.gameState.config.maxSpeed
    );

    // Update dino physics (jumping, ducking, etc.)
    this.gameState.dino = updateDinoPhysics(
      this.gameState.dino,
      this.gameState.config
    );

    // Update obstacles
    this.gameState.obstacles = updateObstacles(
      this.gameState.obstacles,
      this.gameState.speed,
      this.gameState.config
    );

    // Update clouds (background)
    this.gameState.clouds = updateClouds(
      this.gameState.clouds,
      this.gameState.config
    );

    // Check for collisions
    if (checkCollision(this.gameState.dino, this.gameState.obstacles)) {
      this.gameOver();
      return;
    }

    // Check for passed obstacles
    const { obstacles: updatedObstacles, newlyPassed } = updateObstaclesPassed(
      this.gameState.obstacles,
      this.gameState.dino
    );

    if (newlyPassed > 0) {
      this.gameState.obstacles = updatedObstacles;
      this.gameState.obstaclesJumped += newlyPassed;

      // Check for perfect jumps (close calls)
      // TODO: Add perfect jump detection logic
    }
  }

  /**
   * Render the game (Canvas)
   */
  protected render(context: RenderContext): void {
    const { ctx, canvas } = context;

    if (!ctx || !canvas) {
      console.error('[DinoGame] Canvas context not available');
      return;
    }

    // Clear canvas
    ctx.fillStyle = '#f7f7f7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw ground
    this.drawGround(ctx, canvas);

    // Draw clouds
    this.drawClouds(ctx);

    // Draw obstacles
    this.drawObstacles(ctx);

    // Draw dino
    this.drawDino(ctx);

    // Draw UI
    this.drawUI(ctx, canvas);

    // Draw pause overlay
    if (this.gameState.isPaused) {
      this.drawPauseOverlay(ctx, canvas);
    }
  }

  /**
   * Draw ground line
   */
  private drawGround(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    const groundY = canvas.height - 50;

    ctx.strokeStyle = '#535353';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(canvas.width, groundY);
    ctx.stroke();
  }

  /**
   * Draw clouds
   */
  private drawClouds(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#c4c4c4';

    this.gameState.clouds.forEach(cloud => {
      // Simple cloud shape
      ctx.beginPath();
      ctx.arc(cloud.x, cloud.y, 20, 0, Math.PI * 2);
      ctx.arc(cloud.x + 25, cloud.y, 25, 0, Math.PI * 2);
      ctx.arc(cloud.x + 50, cloud.y, 20, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  /**
   * Draw obstacles
   */
  private drawObstacles(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#535353';

    this.gameState.obstacles.forEach(obstacle => {
      if (obstacle.type === 'cactus') {
        // Draw cactus
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

        // Add some detail
        ctx.fillRect(obstacle.x + 5, obstacle.y + 10, 5, 15);
        ctx.fillRect(obstacle.x + obstacle.width - 10, obstacle.y + 10, 5, 15);
      } else if (obstacle.type === 'bird') {
        // Draw bird (flying obstacle)
        ctx.save();
        ctx.translate(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2);

        // Simple bird shape
        ctx.fillStyle = '#535353';
        ctx.beginPath();
        ctx.ellipse(0, 0, obstacle.width / 2, obstacle.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Wings
        const wingOffset = Math.sin(this.gameState.frame * 0.3) * 5;
        ctx.fillRect(-obstacle.width / 2, wingOffset, obstacle.width, 3);

        ctx.restore();
      }
    });
  }

  /**
   * Draw dino
   */
  private drawDino(ctx: CanvasRenderingContext2D): void {
    const { dino } = this.gameState;

    ctx.fillStyle = '#535353';

    if (dino.isDucking) {
      // Draw ducking dino (smaller/flatter)
      ctx.fillRect(dino.x, dino.y + 20, 50, 30);
      // Head
      ctx.fillRect(dino.x, dino.y + 15, 30, 20);
    } else {
      // Draw standing/jumping dino
      // Body
      ctx.fillRect(dino.x, dino.y, 40, 50);
      // Head
      ctx.fillRect(dino.x, dino.y - 15, 35, 20);
      // Tail
      ctx.fillRect(dino.x + 35, dino.y + 10, 15, 10);

      // Legs (animated when running)
      if (!dino.isJumping) {
        const legOffset = Math.sin(this.gameState.frame * 0.2) * 3;
        ctx.fillRect(dino.x + 5, dino.y + 50, 10, 15 + legOffset);
        ctx.fillRect(dino.x + 25, dino.y + 50, 10, 15 - legOffset);
      }
    }

    // Eye
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(dino.x + 20, dino.y - 5, 5, 5);
  }

  /**
   * Draw UI (score, high score)
   */
  private drawUI(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    ctx.fillStyle = '#535353';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'right';

    // Current score
    ctx.fillText(`Score: ${this.gameState.score}`, canvas.width - 20, 40);

    // High score (from leaderboard or previous games)
    // This will be managed by the React component
  }

  /**
   * Draw pause overlay
   */
  private drawPauseOverlay(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);

    ctx.font = '20px sans-serif';
    ctx.fillText('Press P to resume', canvas.width / 2, canvas.height / 2 + 40);
  }

  /**
   * Handle game over
   */
  protected onGameOver(): void {
    console.log('[DinoGame] Game Over! Score:', this.gameState.score);

    // Emit event for React component to handle
    this.emit('game_over', {
      score: this.gameState.score,
      distance: this.gameState.distance,
      obstaclesJumped: this.gameState.obstaclesJumped,
      timePlayedMs: this.gameState.timePlayedMs,
    });
  }

  /**
   * Handle game start
   */
  protected onStart(): void {
    // Reset entities
    this.gameState.dino = createInitialDinoState();
    this.gameState.obstacles = [
      createObstacle(this.gameState.config.canvasWidth, this.gameState.config),
    ];
    this.gameState.clouds = this.createInitialClouds();

    // Reset metrics
    this.gameState.speed = DEFAULT_CONFIG.initialSpeed;
    this.gameState.distance = 0;
    this.gameState.obstaclesJumped = 0;
    this.gameState.obstaclesDucked = 0;
    this.gameState.perfectJumps = 0;
    this.gameState.nearMisses = 0;
  }

  /**
   * Public API: Make dino jump
   */
  public jump(): void {
    if (!this.isPlaying()) return;

    if (!this.gameState.dino.isJumping && !this.gameState.dino.isDucking) {
      this.gameState.dino.isJumping = true;
      this.gameState.dino.velocityY = this.gameState.config.jumpPower;
    }
  }

  /**
   * Public API: Make dino duck
   */
  public duck(isDucking: boolean): void {
    if (!this.isPlaying()) return;

    if (!this.gameState.dino.isJumping) {
      this.gameState.dino.isDucking = isDucking;
    }
  }

  /**
   * Get current game data for saving
   */
  public getGameData() {
    return {
      score: this.gameState.score,
      distance: this.gameState.distance,
      obstaclesJumped: this.gameState.obstaclesJumped,
      obstaclesDucked: this.gameState.obstaclesDucked,
      perfectJumps: this.gameState.perfectJumps,
      nearMisses: this.gameState.nearMisses,
      speed: this.gameState.speed,
      timePlayedMs: this.gameState.timePlayedMs,
    };
  }
}
