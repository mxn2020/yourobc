/**
 * Game Registrations
 *
 * Register all available games in the platform
 */

import { registerGame } from './registry';
import { DinoGameContainer } from '../dino/components/DinoGameContainer';
import { TetrisGameContainer } from '../tetris/components/TetrisGameContainer';

/**
 * Register Dino Jump Game
 */
registerGame({
  id: 'dino',
  name: 'Dino Jump',
  description: 'Classic endless runner game. Jump and duck to avoid obstacles and see how far you can go!',
  category: 'Arcade',
  version: '1.0.0',
  author: 'Geenius Games',
  icon: '🦖',
  players: {
    min: 1,
    max: 1, // TODO: Add multiplayer support
  },
  features: {
    multiplayer: false, // TODO: Enable after multiplayer implementation
    achievements: true,
    leaderboard: true,
    replays: true,
    statistics: true,
  },
  tags: ['endless-runner', 'arcade', 'casual', 'retro'],
  difficulty: 'medium',
  estimatedPlayTime: 'Endless',
  component: DinoGameContainer,
  path: '/games/dino/play',
  thumbnail: '/images/games/dino-thumbnail.png', // TODO: Add actual thumbnail
  theme: {
    primary: '#535353',
    secondary: '#f7f7f7',
  },
  isActive: true,
  isBeta: false,
  order: 1,
});

/**
 * Register Tetris Game
 */
registerGame({
  id: 'tetris',
  name: 'Tetris',
  description: 'Classic block-stacking puzzle game. Clear lines and score high!',
  category: 'Puzzle',
  version: '2.0.0',
  author: 'Geenius Games',
  icon: '🟦',
  players: {
    min: 1,
    max: 4,
  },
  features: {
    multiplayer: true,
    achievements: true,
    leaderboard: true,
    replays: true,
    statistics: true,
  },
  tags: ['puzzle', 'classic', 'competitive', 'multiplayer'],
  difficulty: 'medium',
  estimatedPlayTime: '5-15 min',
  component: TetrisGameContainer,
  path: '/games/tetris/play',
  thumbnail: '/images/games/tetris-thumbnail.png',
  theme: {
    primary: '#0066ff',
    secondary: '#000000',
  },
  isActive: true,
  isBeta: false,
  order: 2,
});

/**
 * Export registered games for reference
 */
export const registeredGameIds = {
  DINO: 'dino',
  TETRIS: 'tetris',
} as const;

/**
 * Game categories
 */
export const gameCategories = {
  ARCADE: 'Arcade',
  PUZZLE: 'Puzzle',
  STRATEGY: 'Strategy',
  SPORTS: 'Sports',
  CASUAL: 'Casual',
  ACTION: 'Action',
} as const;

/**
 * Game difficulties
 */
export const gameDifficulties = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
  EXPERT: 'expert',
} as const;
