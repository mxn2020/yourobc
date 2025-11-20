/**
 * Dino Jump Game - Public API
 *
 * Exports all public-facing components and utilities
 */

export { DinoGame } from './core/DinoGame';
export type { DinoGameState } from './core/DinoGame';

export { DinoGameContainer } from './components/DinoGameContainer';

export { DinoService } from './services/DinoService';
export type {
  DinoGameData,
  DinoHighScore,
  DinoPlayerStats,
} from './services/DinoService';

export { dinoAchievements } from './config/achievements';

// Re-export types from utils
export type {
  DinoState,
  Obstacle,
  Cloud,
  GameConfig as DinoGameConfig,
} from './utils/gamePhysics';
