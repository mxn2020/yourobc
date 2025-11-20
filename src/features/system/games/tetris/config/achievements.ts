/**
 * Tetris Achievements
 *
 * Achievement definitions for the Tetris game
 */

import type { Achievement } from '../../engine';

export const tetrisAchievements: Achievement[] = [
  // ========== Beginner Achievements ==========
  {
    id: 'first_piece',
    name: 'First Block',
    description: 'Place your first piece',
    category: 'beginner',
    points: 5,
    icon: '🟦',
    condition: (gameState: any) => {
      return gameState.piecesPlaced >= 1;
    },
  },
  {
    id: 'first_line',
    name: 'Line Breaker',
    description: 'Clear your first line',
    category: 'beginner',
    points: 10,
    icon: '📏',
    condition: (gameState: any) => {
      return gameState.lines >= 1;
    },
  },
  {
    id: 'first_tetris',
    name: 'Tetris!',
    description: 'Clear 4 lines at once',
    category: 'beginner',
    points: 25,
    icon: '🎯',
    condition: (gameState: any) => {
      return gameState.tetrisLines >= 1;
    },
  },

  // ========== Score Achievements ==========
  {
    id: 'score_1000',
    name: 'Getting Started',
    description: 'Score 1,000 points',
    category: 'score',
    points: 10,
    icon: '⭐',
    condition: (gameState: any) => {
      return gameState.score >= 1000;
    },
  },
  {
    id: 'score_5000',
    name: 'Rising Star',
    description: 'Score 5,000 points',
    category: 'score',
    points: 20,
    icon: '🌟',
    condition: (gameState: any) => {
      return gameState.score >= 5000;
    },
  },
  {
    id: 'score_10000',
    name: 'Tetris Master',
    description: 'Score 10,000 points',
    category: 'score',
    points: 30,
    icon: '💫',
    condition: (gameState: any) => {
      return gameState.score >= 10000;
    },
  },
  {
    id: 'score_50000',
    name: 'Tetris Legend',
    description: 'Score 50,000 points',
    category: 'score',
    points: 50,
    icon: '👑',
    condition: (gameState: any) => {
      return gameState.score >= 50000;
    },
  },

  // ========== Lines Achievements ==========
  {
    id: 'lines_10',
    name: 'Line Clearer',
    description: 'Clear 10 lines',
    category: 'lines',
    points: 10,
    icon: '📐',
    condition: (gameState: any) => {
      return gameState.lines >= 10;
    },
  },
  {
    id: 'lines_50',
    name: 'Line Master',
    description: 'Clear 50 lines',
    category: 'lines',
    points: 20,
    icon: '📊',
    condition: (gameState: any) => {
      return gameState.lines >= 50;
    },
  },
  {
    id: 'lines_100',
    name: 'Century',
    description: 'Clear 100 lines',
    category: 'lines',
    points: 30,
    icon: '💯',
    condition: (gameState: any) => {
      return gameState.lines >= 100;
    },
  },
  {
    id: 'lines_500',
    name: 'Line Legend',
    description: 'Clear 500 lines',
    category: 'lines',
    points: 50,
    icon: '🏆',
    condition: (gameState: any) => {
      return gameState.lines >= 500;
    },
  },

  // ========== Level Achievements ==========
  {
    id: 'level_5',
    name: 'Level Up',
    description: 'Reach level 5',
    category: 'level',
    points: 15,
    icon: '⬆️',
    condition: (gameState: any) => {
      return gameState.level >= 5;
    },
  },
  {
    id: 'level_10',
    name: 'Double Digits',
    description: 'Reach level 10',
    category: 'level',
    points: 25,
    icon: '🔟',
    condition: (gameState: any) => {
      return gameState.level >= 10;
    },
  },
  {
    id: 'level_20',
    name: 'Speed Demon',
    description: 'Reach level 20',
    category: 'level',
    points: 40,
    icon: '⚡',
    condition: (gameState: any) => {
      return gameState.level >= 20;
    },
  },

  // ========== Combo Achievements ==========
  {
    id: 'combo_3',
    name: 'Combo Starter',
    description: 'Get a 3x combo',
    category: 'combo',
    points: 15,
    icon: '🔥',
    condition: (gameState: any) => {
      return gameState.maxCombo >= 3;
    },
  },
  {
    id: 'combo_5',
    name: 'Combo Master',
    description: 'Get a 5x combo',
    category: 'combo',
    points: 25,
    icon: '💥',
    condition: (gameState: any) => {
      return gameState.maxCombo >= 5;
    },
  },
  {
    id: 'combo_10',
    name: 'Unstoppable',
    description: 'Get a 10x combo',
    category: 'combo',
    points: 40,
    icon: '🌪️',
    condition: (gameState: any) => {
      return gameState.maxCombo >= 10;
    },
  },

  // ========== Skill Achievements ==========
  {
    id: 'tetris_master',
    name: 'Tetris Specialist',
    description: 'Clear 10 Tetris (4 lines) in one game',
    category: 'skill',
    points: 35,
    icon: '🎓',
    condition: (gameState: any) => {
      return gameState.tetrisLines >= 10;
    },
  },
  {
    id: 'no_singles',
    name: 'Efficiency Expert',
    description: 'Clear 20 lines without any singles',
    category: 'skill',
    points: 30,
    icon: '🎯',
    condition: (gameState: any) => {
      return gameState.lines >= 20 && gameState.singleLines === 0;
    },
  },
  {
    id: 'balanced_player',
    name: 'Balanced Player',
    description: 'Clear at least 5 singles, doubles, triples, and Tetris each',
    category: 'skill',
    points: 35,
    icon: '⚖️',
    condition: (gameState: any) => {
      return (
        gameState.singleLines >= 5 &&
        gameState.doubleLines >= 5 &&
        gameState.tripleLines >= 5 &&
        gameState.tetrisLines >= 5
      );
    },
  },

  // ========== Endurance Achievements ==========
  {
    id: 'marathon',
    name: 'Marathon Runner',
    description: 'Play for 15 minutes',
    category: 'endurance',
    points: 30,
    icon: '🏃',
    condition: (gameState: any) => {
      return gameState.timePlayedMs >= 15 * 60 * 1000;
    },
  },
  {
    id: 'piece_master',
    name: 'Piece Master',
    description: 'Place 500 pieces in one game',
    category: 'endurance',
    points: 35,
    icon: '🧩',
    condition: (gameState: any) => {
      return gameState.piecesPlaced >= 500;
    },
  },

  // ========== Difficulty Achievements ==========
  {
    id: 'easy_champion',
    name: 'Easy Champion',
    description: 'Score 5,000 on Easy difficulty',
    category: 'difficulty',
    points: 20,
    icon: '🥉',
    condition: (gameState: any) => {
      return gameState.difficulty === 'easy' && gameState.score >= 5000;
    },
  },
  {
    id: 'medium_champion',
    name: 'Medium Champion',
    description: 'Score 10,000 on Medium difficulty',
    category: 'difficulty',
    points: 30,
    icon: '🥈',
    condition: (gameState: any) => {
      return gameState.difficulty === 'medium' && gameState.score >= 10000;
    },
  },
  {
    id: 'hard_champion',
    name: 'Hard Champion',
    description: 'Score 15,000 on Hard difficulty',
    category: 'difficulty',
    points: 40,
    icon: '🥇',
    condition: (gameState: any) => {
      return gameState.difficulty === 'hard' && gameState.score >= 15000;
    },
  },
  {
    id: 'expert_champion',
    name: 'Expert Champion',
    description: 'Score 20,000 on Expert difficulty',
    category: 'difficulty',
    points: 50,
    icon: '💎',
    condition: (gameState: any) => {
      return gameState.difficulty === 'expert' && gameState.score >= 20000;
    },
  },
];

/**
 * Get achievement progress
 */
export function getTetrisAchievementProgress(
  achievementId: string,
  gameState: any
): { current: number; max: number } | null {
  switch (achievementId) {
    // Beginner
    case 'first_piece':
      return { current: Math.min(gameState.piecesPlaced, 1), max: 1 };
    case 'first_line':
      return { current: Math.min(gameState.lines, 1), max: 1 };
    case 'first_tetris':
      return { current: Math.min(gameState.tetrisLines, 1), max: 1 };

    // Score
    case 'score_1000':
      return { current: Math.min(gameState.score, 1000), max: 1000 };
    case 'score_5000':
      return { current: Math.min(gameState.score, 5000), max: 5000 };
    case 'score_10000':
      return { current: Math.min(gameState.score, 10000), max: 10000 };
    case 'score_50000':
      return { current: Math.min(gameState.score, 50000), max: 50000 };

    // Lines
    case 'lines_10':
      return { current: Math.min(gameState.lines, 10), max: 10 };
    case 'lines_50':
      return { current: Math.min(gameState.lines, 50), max: 50 };
    case 'lines_100':
      return { current: Math.min(gameState.lines, 100), max: 100 };
    case 'lines_500':
      return { current: Math.min(gameState.lines, 500), max: 500 };

    // Level
    case 'level_5':
      return { current: Math.min(gameState.level, 5), max: 5 };
    case 'level_10':
      return { current: Math.min(gameState.level, 10), max: 10 };
    case 'level_20':
      return { current: Math.min(gameState.level, 20), max: 20 };

    // Combo
    case 'combo_3':
      return { current: Math.min(gameState.maxCombo, 3), max: 3 };
    case 'combo_5':
      return { current: Math.min(gameState.maxCombo, 5), max: 5 };
    case 'combo_10':
      return { current: Math.min(gameState.maxCombo, 10), max: 10 };

    // Skill
    case 'tetris_master':
      return { current: Math.min(gameState.tetrisLines, 10), max: 10 };
    case 'marathon':
      return {
        current: Math.min(gameState.timePlayedMs, 15 * 60 * 1000),
        max: 15 * 60 * 1000,
      };
    case 'piece_master':
      return { current: Math.min(gameState.piecesPlaced, 500), max: 500 };

    default:
      return null;
  }
}
