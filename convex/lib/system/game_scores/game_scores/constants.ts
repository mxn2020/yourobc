// convex/lib/boilerplate/game_scores/game_scores/constants.ts
// Business constants, permissions, and limits for game_scores module

export const GAME_SCORES_CONSTANTS = {
  PERMISSIONS: {
    VIEW: 'game_scores:view',
    CREATE: 'game_scores:create',
    EDIT: 'game_scores:edit',
    DELETE: 'game_scores:delete',
    VIEW_ALL: 'game_scores:view_all',
    MANAGE: 'game_scores:manage',
  },

  DIFFICULTY: {
    EASY: 'easy',
    MEDIUM: 'medium',
    HARD: 'hard',
    EXPERT: 'expert',
  },

  GAME_NAMES: {
    DINO_JUMP: 'dino-jump',
    SPACE_SHOOTER: 'space-shooter',
    PUZZLE_MASTER: 'puzzle-master',
  },

  LIMITS: {
    MAX_GAME_NAME_LENGTH: 50,
    MIN_SCORE: 0,
    MAX_LEVEL: 999,
    MIN_TIME_PLAYED: 0,
    MAX_OBSTACLES_JUMPED: 999999,
    MAX_COMBO: 9999,
    MIN_SPEED: 0,
    MAX_SPEED: 100,
  },

  SCORE_THRESHOLDS: {
    BRONZE: 1000,
    SILVER: 5000,
    GOLD: 10000,
    PLATINUM: 50000,
    DIAMOND: 100000,
  },

  LEADERBOARD: {
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
    TIME_PERIODS: {
      ALL_TIME: 'all_time',
      TODAY: 'today',
      THIS_WEEK: 'this_week',
      THIS_MONTH: 'this_month',
      THIS_YEAR: 'this_year',
    },
  },
} as const;

// Difficulty multipliers for scoring
export const DIFFICULTY_MULTIPLIERS = {
  [GAME_SCORES_CONSTANTS.DIFFICULTY.EASY]: 1.0,
  [GAME_SCORES_CONSTANTS.DIFFICULTY.MEDIUM]: 1.5,
  [GAME_SCORES_CONSTANTS.DIFFICULTY.HARD]: 2.0,
  [GAME_SCORES_CONSTANTS.DIFFICULTY.EXPERT]: 3.0,
} as const;
