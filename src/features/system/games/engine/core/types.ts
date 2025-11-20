/**
 * Core type definitions for the unified game engine
 */

/**
 * Game lifecycle states
 */
export enum GameState {
  IDLE = 'idle',
  LOADING = 'loading',
  READY = 'ready',
  PLAYING = 'playing',
  PAUSED = 'paused',
  GAME_OVER = 'game_over',
  COMPLETED = 'completed',
}

/**
 * Rendering mode for the game
 */
export enum RenderMode {
  CANVAS = 'canvas',
  REACT = 'react',
  WEBGL = 'webgl',
}

/**
 * Input types supported by the engine
 */
export enum InputType {
  KEYBOARD = 'keyboard',
  TOUCH = 'touch',
  MOUSE = 'mouse',
  GAMEPAD = 'gamepad',
}

/**
 * Base configuration for any game
 */
export interface GameConfig {
  /** Unique identifier for the game */
  id: string;
  /** Display name */
  name: string;
  /** Short description */
  description: string;
  /** Rendering mode */
  renderMode: RenderMode;
  /** Target frames per second */
  targetFPS: number;
  /** Enable debug mode */
  debug?: boolean;
  /** Game-specific configuration */
  gameSpecificConfig?: Record<string, any>;
}

/**
 * Base game state interface that all games must extend
 */
export interface BaseGameState {
  /** Current lifecycle state */
  state: GameState;
  /** Current score */
  score: number;
  /** Game start timestamp */
  startTime: number | null;
  /** Game end timestamp */
  endTime: number | null;
  /** Total time played in milliseconds */
  timePlayedMs: number;
  /** Is the game paused */
  isPaused: boolean;
  /** Is the game over */
  isGameOver: boolean;
  /** Current frame count */
  frame: number;
}

/**
 * Game lifecycle event types
 */
export enum GameEvent {
  INITIALIZED = 'initialized',
  STARTED = 'started',
  PAUSED = 'paused',
  RESUMED = 'resumed',
  GAME_OVER = 'game_over',
  COMPLETED = 'completed',
  RESET = 'reset',
  SCORE_CHANGED = 'score_changed',
  STATE_CHANGED = 'state_changed',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
}

/**
 * Event listener callback type
 */
export type GameEventListener<T = any> = (data: T) => void;

/**
 * Input action mapping
 */
export interface InputAction {
  /** Action name (e.g., 'jump', 'move_left') */
  action: string;
  /** Keys that trigger this action */
  keys: string[];
  /** Touch gesture (if applicable) */
  touchGesture?: 'tap' | 'swipe_up' | 'swipe_down' | 'swipe_left' | 'swipe_right';
  /** Gamepad button (if applicable) */
  gamepadButton?: number;
  /** Is this a continuous action (hold) vs discrete (press) */
  continuous?: boolean;
}

/**
 * Input configuration
 */
export interface InputConfig {
  /** Supported input types */
  supportedInputs: InputType[];
  /** Action mappings */
  actions: InputAction[];
  /** Enable auto-repeat for continuous actions */
  enableAutoRepeat?: boolean;
  /** Auto-repeat delay (ms) */
  autoRepeatDelay?: number;
  /** Auto-repeat rate (ms) */
  autoRepeatRate?: number;
}

/**
 * Achievement definition
 */
export interface Achievement {
  /** Unique achievement ID */
  id: string;
  /** Display name */
  name: string;
  /** Description */
  description: string;
  /** Icon or emoji */
  icon: string;
  /** Points awarded */
  points: number;
  /** Achievement category */
  category?: string;
  /** Hidden until unlocked */
  hidden?: boolean;
  /** Validation function */
  validate?: (gameState: any, gameStats: any) => boolean;
}

/**
 * Statistics definition
 */
export interface GameStatistic {
  /** Statistic key */
  key: string;
  /** Display name */
  name: string;
  /** Description */
  description?: string;
  /** Value type */
  type: 'number' | 'duration' | 'percentage' | 'count';
  /** Formatting function */
  format?: (value: any) => string;
}

/**
 * Replay data structure
 */
export interface ReplayData {
  /** Replay ID */
  id: string;
  /** Game ID */
  gameId: string;
  /** User ID */
  userId: string;
  /** Final score */
  score: number;
  /** Game duration */
  duration: number;
  /** Replay version */
  version: string;
  /** Compressed input sequence */
  inputs: CompressedInput[];
  /** Initial game state */
  initialState: any;
  /** Timestamp */
  createdAt: number;
  /** Metadata */
  metadata?: Record<string, any>;
}

/**
 * Compressed input for replay
 */
export interface CompressedInput {
  /** Frame number */
  f: number;
  /** Action */
  a: string;
  /** Value (for analog inputs) */
  v?: number;
}

/**
 * Multiplayer room configuration
 */
export interface MultiplayerRoomConfig {
  /** Room ID */
  roomId: string;
  /** Game ID */
  gameId: string;
  /** Host user ID */
  hostUserId: string;
  /** Room name */
  name: string;
  /** Max players */
  maxPlayers: number;
  /** Room code (for joining) */
  roomCode?: string;
  /** Is private */
  isPrivate: boolean;
  /** Game mode */
  gameMode?: string;
  /** Custom settings */
  settings?: Record<string, any>;
}

/**
 * Multiplayer player state
 */
export interface PlayerState {
  /** Player ID */
  playerId: string;
  /** User ID */
  userId: string;
  /** Display name */
  displayName: string;
  /** Is ready */
  isReady: boolean;
  /** Is host */
  isHost: boolean;
  /** Current score */
  score: number;
  /** Game-specific player state */
  gameState?: any;
}

/**
 * Physics configuration (optional, for physics-based games)
 */
export interface PhysicsConfig {
  /** Gravity (pixels per frame^2) */
  gravity?: number;
  /** Friction coefficient */
  friction?: number;
  /** Enable collision detection */
  enableCollisions?: boolean;
  /** Collision buffer (pixels) */
  collisionBuffer?: number;
}

/**
 * Rendering context (passed to render methods)
 */
export interface RenderContext {
  /** Canvas 2D context (if using Canvas) */
  ctx?: CanvasRenderingContext2D;
  /** Canvas element */
  canvas?: HTMLCanvasElement;
  /** React render function (if using React) */
  renderReact?: (state: any) => React.ReactNode;
  /** WebGL context (if using WebGL) */
  gl?: WebGLRenderingContext;
  /** Delta time (ms since last frame) */
  deltaTime: number;
  /** Current FPS */
  fps: number;
}

/**
 * Game metadata (for registry)
 */
export interface GameMetadata {
  /** Game ID */
  id: string;
  /** Display name */
  name: string;
  /** Description */
  description: string;
  /** Icon URL or emoji */
  icon: string;
  /** Category */
  category: string;
  /** Difficulty level */
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  /** Supported features */
  features: {
    multiplayer: boolean;
    achievements: boolean;
    replays: boolean;
    statistics: boolean;
    leaderboard: boolean;
  };
  /** Min/max players (for multiplayer) */
  players?: {
    min: number;
    max: number;
  };
  /** Game tags for categorization and search */
  tags?: string[];
  /** Game author */
  author?: string;
  /** Game version */
  version?: string;
  /** Estimated play time */
  estimatedPlayTime?: string;
}

/**
 * Leaderboard entry
 */
export interface LeaderboardEntry {
  /** Rank */
  rank: number;
  /** User ID */
  userId: string;
  /** Display name */
  displayName: string;
  /** Score */
  score: number;
  /** Time played */
  timePlayedMs: number;
  /** Timestamp */
  createdAt: number;
  /** Is current user */
  isCurrentUser?: boolean;
  /** Additional metadata */
  metadata?: Record<string, any>;
}
