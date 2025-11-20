/**
 * Game Types
 * Type definitions for game state and entities
 */

export interface DinoState {
  x: number;
  y: number;
  velocityY: number;
  isJumping: boolean;
  isDucking: boolean;
  width: number;
  height: number;
}

export interface Obstacle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: "cactus" | "bird";
  passed: boolean;
}

export interface Cloud {
  id: string;
  x: number;
  y: number;
  width: number;
  speed: number;
}

export interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  score: number;
  highScore: number;
  speed: number;
  distance: number;
  obstaclesJumped: number;
  frameCount: number;
  startTime: number | null;
}

export interface GameConfig {
  gravity: number;
  jumpForce: number;
  initialSpeed: number;
  speedIncrement: number;
  maxSpeed: number;
  groundHeight: number;
  dinoStartX: number;
  obstacleMinGap: number;
  obstacleMaxGap: number;
  canvasWidth: number;
  canvasHeight: number;
}

export interface ScoreData {
  score: number;
  timePlayedMs: number;
  obstaclesJumped: number;
  speed: number;
  difficulty: string;
}

export type GameDifficulty = "easy" | "normal" | "hard";
