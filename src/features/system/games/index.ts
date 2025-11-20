/**
 * Games Feature Module
 * Exports game components and utilities
 */

export { DinoGame } from "./components/DinoGame";
export { GameCanvas } from "./components/GameCanvas";
export { Leaderboard } from "./components/Leaderboard";
export { GameOverModal } from "./components/GameOverModal";

export { useGameEngine } from "./hooks/useGameEngine";
export { useGameControls } from "./hooks/useGameControls";

export type {
  DinoState,
  Obstacle,
  Cloud,
  GameState,
  GameConfig,
  ScoreData,
  GameDifficulty,
} from "./types/game.types";

export {
  DEFAULT_CONFIG,
  createInitialDinoState,
  updateDinoPhysics,
  jump,
  duck,
  standUp,
  createObstacle,
  updateObstacles,
  checkCollision,
  calculateScore,
  getDifficulty,
} from "./utils/gamePhysics";
