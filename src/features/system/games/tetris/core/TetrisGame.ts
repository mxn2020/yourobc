/**
 * Tetris Game - Game Engine Implementation
 *
 * Extends the unified GameEngine to create the Tetris game
 * Uses React rendering and keeps existing game logic
 */

import {
  GameEngine,
  type BaseGameState,
  GameState as EngineGameState,
  type RenderContext,
  type GameConfig,
  RenderMode,
} from '../../engine';
import {
  createInitialState as createTetrisState,
  isValidPosition,
  movePieceDown,
  movePieceLeft,
  movePieceRight,
  rotatePiece,
  hardDropPiece,
  mergePieceToBoard,
  clearLines,
  createPiece,
  generatePieceBag,
  calculateScore,
  calculateLevel,
  calculateFallSpeed,
  type Piece,
  type GameState as TetrisEngineState,
} from '../utils/tetrisEngine';

/**
 * Tetris-specific game state
 */
export interface TetrisGameState extends BaseGameState {
  // Board and pieces
  board: (number | null)[][];
  currentPiece: Piece | null;
  nextPieces: number[];
  holdPiece: number | null;
  canHold: boolean;

  // Game metrics
  lines: number;
  level: number;
  combo: number;

  // Statistics
  piecesPlaced: number;
  singleLines: number;
  doubleLines: number;
  tripleLines: number;
  tetrisLines: number;
  maxCombo: number;

  // Timing
  fallSpeed: number;
  lastFallTime: number;

  // Config
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  startLevel: number;
}

/**
 * Difficulty settings
 */
const DIFFICULTY_SETTINGS = {
  easy: { startLevel: 1, startSpeed: 1000 },
  medium: { startLevel: 5, startSpeed: 600 },
  hard: { startLevel: 10, startSpeed: 400 },
  expert: { startLevel: 15, startSpeed: 200 },
};

/**
 * TetrisGame class - Extends GameEngine
 */
export class TetrisGame extends GameEngine<TetrisGameState> {
  private renderCallback?: (gameState: TetrisGameState) => void;

  constructor(
    config?: Partial<GameConfig> & { difficulty?: 'easy' | 'medium' | 'hard' | 'expert' }
  ) {
    const tetrisConfig: GameConfig = {
      id: 'tetris',
      name: 'Tetris',
      description: 'Classic block-stacking puzzle game',
      renderMode: RenderMode.REACT,
      targetFPS: 60,
      debug: false,
      ...config,
    };

    super(tetrisConfig);

    // Store difficulty from config
    if (config?.difficulty) {
      this.gameState.difficulty = config.difficulty;
    }
  }

  /**
   * Create initial game state
   */
  protected createInitialState(): TetrisGameState {
    const difficulty = 'medium'; // Default, can be overridden
    const settings = DIFFICULTY_SETTINGS[difficulty];

    // Create initial Tetris state using existing engine
    const tetrisState = createTetrisState(settings.startLevel);

    return {
      // Base game state
      state: EngineGameState.IDLE,
      score: tetrisState.score,
      startTime: null,
      endTime: null,
      timePlayedMs: 0,
      isPaused: false,
      isGameOver: false,
      frame: 0,

      // Tetris-specific state
      board: tetrisState.board,
      currentPiece: tetrisState.currentPiece,
      nextPieces: tetrisState.nextPieces,
      holdPiece: tetrisState.holdPiece,
      canHold: tetrisState.canHold,
      lines: tetrisState.lines,
      level: tetrisState.level,
      combo: tetrisState.combo,
      fallSpeed: tetrisState.fallSpeed,
      lastFallTime: 0,

      // Statistics
      piecesPlaced: 0,
      singleLines: 0,
      doubleLines: 0,
      tripleLines: 0,
      tetrisLines: 0,
      maxCombo: 0,

      // Config
      difficulty,
      startLevel: settings.startLevel,
    };
  }

  /**
   * Update game logic (called every frame)
   */
  protected update(deltaTime: number): void {
    if (!this.gameState.currentPiece) return;

    // Auto-fall logic
    const currentTime = Date.now();
    if (currentTime - this.gameState.lastFallTime >= this.gameState.fallSpeed) {
      this.moveDown();
      this.gameState.lastFallTime = currentTime;
    }

    // Trigger React re-render
    this.triggerRender();
  }

  /**
   * Render the game (React)
   */
  protected render(context: RenderContext): void {
    // For React rendering, we just trigger the callback
    if (this.renderCallback) {
      this.renderCallback(this.gameState);
    }
  }

  /**
   * Handle game over
   */
  protected onGameOver(): void {
    console.log('[TetrisGame] Game Over! Score:', this.gameState.score);

    // Emit event for React component to handle
    this.emit('game_over', {
      score: this.gameState.score,
      lines: this.gameState.lines,
      level: this.gameState.level,
      piecesPlaced: this.gameState.piecesPlaced,
      maxCombo: this.gameState.maxCombo,
      timePlayedMs: this.gameState.timePlayedMs,
      singleLines: this.gameState.singleLines,
      doubleLines: this.gameState.doubleLines,
      tripleLines: this.gameState.tripleLines,
      tetrisLines: this.gameState.tetrisLines,
    });
  }

  /**
   * Handle game start
   */
  protected onStart(): void {
    const settings = DIFFICULTY_SETTINGS[this.gameState.difficulty];
    const tetrisState = createTetrisState(settings.startLevel);

    // Reset game state
    this.gameState.board = tetrisState.board;
    this.gameState.currentPiece = tetrisState.currentPiece;
    this.gameState.nextPieces = tetrisState.nextPieces;
    this.gameState.holdPiece = null;
    this.gameState.canHold = true;
    this.gameState.score = 0;
    this.gameState.lines = 0;
    this.gameState.level = settings.startLevel;
    this.gameState.combo = 0;
    this.gameState.fallSpeed = calculateFallSpeed(settings.startLevel);
    this.gameState.lastFallTime = Date.now();

    // Reset statistics
    this.gameState.piecesPlaced = 0;
    this.gameState.singleLines = 0;
    this.gameState.doubleLines = 0;
    this.gameState.tripleLines = 0;
    this.gameState.tetrisLines = 0;
    this.gameState.maxCombo = 0;
  }

  /**
   * Public API: Move piece left
   */
  public moveLeft(): boolean {
    if (!this.isPlaying() || !this.gameState.currentPiece) return false;

    const newPiece = movePieceLeft(this.gameState.currentPiece);
    if (isValidPosition(this.gameState.board, newPiece)) {
      this.gameState.currentPiece = newPiece;
      this.triggerRender();
      return true;
    }
    return false;
  }

  /**
   * Public API: Move piece right
   */
  public moveRight(): boolean {
    if (!this.isPlaying() || !this.gameState.currentPiece) return false;

    const newPiece = movePieceRight(this.gameState.currentPiece);
    if (isValidPosition(this.gameState.board, newPiece)) {
      this.gameState.currentPiece = newPiece;
      this.triggerRender();
      return true;
    }
    return false;
  }

  /**
   * Public API: Move piece down (soft drop)
   */
  public moveDown(): boolean {
    if (!this.isPlaying() || !this.gameState.currentPiece) return false;

    const newPiece = movePieceDown(this.gameState.currentPiece);
    if (isValidPosition(this.gameState.board, newPiece)) {
      this.gameState.currentPiece = newPiece;
      this.triggerRender();
      return true;
    } else {
      // Piece can't move down - lock it
      this.lockPiece();
      return false;
    }
  }

  /**
   * Public API: Rotate piece
   */
  public rotate(clockwise: boolean = true): boolean {
    if (!this.isPlaying() || !this.gameState.currentPiece) return false;

    // For now, only support clockwise rotation
    // Counter-clockwise can be added later
    const newPiece = rotatePiece(this.gameState.board, this.gameState.currentPiece);

    if (newPiece !== this.gameState.currentPiece) {
      this.gameState.currentPiece = newPiece;
      this.triggerRender();
      return true;
    }
    return false;
  }

  /**
   * Public API: Hard drop
   */
  public hardDrop(): void {
    if (!this.isPlaying() || !this.gameState.currentPiece) return;

    const { piece, dropDistance } = hardDropPiece(
      this.gameState.board,
      this.gameState.currentPiece
    );

    // Award points for hard drop
    this.gameState.score += dropDistance * 2;
    this.gameState.currentPiece = piece;

    this.lockPiece();
  }

  /**
   * Public API: Hold piece
   */
  public hold(): void {
    if (!this.isPlaying() || !this.gameState.currentPiece || !this.gameState.canHold) {
      return;
    }

    const currentType = this.gameState.currentPiece.type;

    if (this.gameState.holdPiece === null) {
      // First hold - get next piece
      this.gameState.holdPiece = currentType;
      this.spawnNextPiece();
    } else {
      // Swap with held piece
      const heldType = this.gameState.holdPiece;
      this.gameState.holdPiece = currentType;
      this.gameState.currentPiece = createPiece(heldType);
    }

    this.gameState.canHold = false;
    this.triggerRender();
  }

  /**
   * Lock piece to board and spawn next piece
   */
  private lockPiece(): void {
    if (!this.gameState.currentPiece) return;

    // Merge piece to board
    this.gameState.board = mergePieceToBoard(
      this.gameState.board,
      this.gameState.currentPiece
    );

    this.gameState.piecesPlaced++;

    // Clear lines
    const { board, linesCleared } = clearLines(this.gameState.board);
    this.gameState.board = board;

    if (linesCleared > 0) {
      // Update line statistics
      this.gameState.lines += linesCleared;
      switch (linesCleared) {
        case 1:
          this.gameState.singleLines++;
          break;
        case 2:
          this.gameState.doubleLines++;
          break;
        case 3:
          this.gameState.tripleLines++;
          break;
        case 4:
          this.gameState.tetrisLines++;
          break;
      }

      // Update combo
      this.gameState.combo++;
      if (this.gameState.combo > this.gameState.maxCombo) {
        this.gameState.maxCombo = this.gameState.combo;
      }

      // Calculate score
      const scoreGained = calculateScore(
        linesCleared,
        this.gameState.level,
        this.gameState.combo
      );
      this.gameState.score += scoreGained;

      // Update level
      const newLevel = calculateLevel(this.gameState.lines, this.gameState.startLevel);
      if (newLevel !== this.gameState.level) {
        this.gameState.level = newLevel;
        this.gameState.fallSpeed = calculateFallSpeed(newLevel);
      }

      // Emit line clear event
      this.emit('lines_cleared', {
        count: linesCleared,
        combo: this.gameState.combo,
        score: scoreGained,
      });
    } else {
      // Reset combo
      this.gameState.combo = 0;
    }

    // Spawn next piece
    this.spawnNextPiece();
    this.gameState.canHold = true;
  }

  /**
   * Spawn next piece
   */
  private spawnNextPiece(): void {
    // Get next piece type
    const nextType = this.gameState.nextPieces.shift();
    if (nextType === undefined) return;

    // Refill piece bag if needed
    if (this.gameState.nextPieces.length < 7) {
      const newBag = generatePieceBag();
      this.gameState.nextPieces.push(...newBag);
    }

    // Create new piece
    const newPiece = createPiece(nextType);

    // Check if piece can be placed (game over check)
    if (!isValidPosition(this.gameState.board, newPiece)) {
      this.gameOver();
      return;
    }

    this.gameState.currentPiece = newPiece;
    this.triggerRender();
  }

  /**
   * Set render callback for React
   */
  public setRenderCallback(callback: (gameState: TetrisGameState) => void): void {
    this.renderCallback = callback;
  }

  /**
   * Trigger render (for React)
   */
  private triggerRender(): void {
    if (this.renderCallback) {
      this.renderCallback(this.gameState);
    }
  }

  /**
   * Get current game data for saving
   */
  public getGameData() {
    return {
      score: this.gameState.score,
      lines: this.gameState.lines,
      level: this.gameState.level,
      piecesPlaced: this.gameState.piecesPlaced,
      singleLines: this.gameState.singleLines,
      doubleLines: this.gameState.doubleLines,
      tripleLines: this.gameState.tripleLines,
      tetrisLines: this.gameState.tetrisLines,
      maxCombo: this.gameState.maxCombo,
      timePlayedMs: this.gameState.timePlayedMs,
      difficulty: this.gameState.difficulty,
    };
  }

  /**
   * Set difficulty
   */
  public setDifficulty(difficulty: 'easy' | 'medium' | 'hard' | 'expert'): void {
    this.gameState.difficulty = difficulty;
  }
}
