// src/features/system/tetris/utils/constants.ts

export const TETRIS_CONSTANTS = {
  // Game Configuration
  BOARD: {
    WIDTH: 10,
    HEIGHT: 20,
    PREVIEW_HEIGHT: 4,
  },

  // Rendering
  CELL_SIZE: 30, // pixels
  BORDER_WIDTH: 1,

  // Game Controls
  KEYS: {
    LEFT: ['ArrowLeft', 'a', 'A'],
    RIGHT: ['ArrowRight', 'd', 'D'],
    DOWN: ['ArrowDown', 's', 'S'],
    ROTATE: ['ArrowUp', 'w', 'W', 'x', 'X'],
    HARD_DROP: [' ', 'Space'],
    HOLD: ['Shift', 'c', 'C'],
    PAUSE: ['Escape', 'p', 'P'],
  },

  // Timing
  SOFT_DROP_SPEED: 50, // milliseconds
  AUTO_REPEAT_DELAY: 170, // milliseconds before auto-repeat starts
  AUTO_REPEAT_RATE: 50, // milliseconds between auto-repeats
  LOCK_DELAY: 500, // milliseconds before piece locks when on ground

  // Difficulty Settings
  DIFFICULTY: {
    EASY: {
      name: 'Easy',
      startLevel: 1,
      speedMultiplier: 1.2,
      scoreMultiplier: 0.8,
      ghostPiece: true,
      nextPiecesCount: 5,
      color: 'green',
      description: 'Slower speed, more preview pieces',
    },
    MEDIUM: {
      name: 'Medium',
      startLevel: 1,
      speedMultiplier: 1.0,
      scoreMultiplier: 1.0,
      ghostPiece: true,
      nextPiecesCount: 3,
      color: 'blue',
      description: 'Standard Tetris experience',
    },
    HARD: {
      name: 'Hard',
      startLevel: 5,
      speedMultiplier: 0.8,
      scoreMultiplier: 1.5,
      ghostPiece: false,
      nextPiecesCount: 1,
      color: 'orange',
      description: 'Faster speed, starts at level 5',
    },
    EXPERT: {
      name: 'Expert',
      startLevel: 10,
      speedMultiplier: 0.6,
      scoreMultiplier: 2.0,
      ghostPiece: false,
      nextPiecesCount: 1,
      color: 'red',
      description: 'Maximum challenge, starts at level 10',
    },
  },

  // Scoring
  SCORING: {
    SINGLE_LINE: 100,
    DOUBLE_LINE: 300,
    TRIPLE_LINE: 500,
    TETRIS: 800,
    SOFT_DROP: 1,
    HARD_DROP: 2,
    COMBO_MULTIPLIER: 50,
  },

  // UI
  COLORS: {
    BACKGROUND: '#1a1a2e',
    BOARD_BACKGROUND: '#0f0f1e',
    GRID_LINE: '#2a2a3e',
    GHOST_PIECE: 'rgba(255, 255, 255, 0.1)',
    TEXT_PRIMARY: '#ffffff',
    TEXT_SECONDARY: '#a0a0b0',
  },

  // Animations
  ANIMATION: {
    LINE_CLEAR_DURATION: 300, // milliseconds
    PIECE_LOCK_FLASH: 100, // milliseconds
    SCORE_POPUP_DURATION: 1000, // milliseconds
  },
};

export const PIECE_NAMES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

export const DIFFICULTY_OPTIONS = [
  { value: 'easy', ...TETRIS_CONSTANTS.DIFFICULTY.EASY },
  { value: 'medium', ...TETRIS_CONSTANTS.DIFFICULTY.MEDIUM },
  { value: 'hard', ...TETRIS_CONSTANTS.DIFFICULTY.HARD },
  { value: 'expert', ...TETRIS_CONSTANTS.DIFFICULTY.EXPERT },
];
