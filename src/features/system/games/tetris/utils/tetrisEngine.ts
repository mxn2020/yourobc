// src/features/system/tetris/utils/tetrisEngine.ts

/**
 * Tetris Game Engine
 * Pure TypeScript game logic for Tetris
 */

// ============================================================================
// Constants
// ============================================================================

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;
export const PREVIEW_HEIGHT = 4; // Extra rows above visible board

// Tetromino shapes (I, O, T, S, Z, J, L)
// Each shape has 4 rotation states
export const TETROMINOS = [
  // I piece
  [
    [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
    [[0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0]],
    [[0, 0, 0, 0], [0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0]],
    [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]],
  ],
  // O piece
  [
    [[1, 1], [1, 1]],
    [[1, 1], [1, 1]],
    [[1, 1], [1, 1]],
    [[1, 1], [1, 1]],
  ],
  // T piece
  [
    [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
    [[0, 1, 0], [0, 1, 1], [0, 1, 0]],
    [[0, 0, 0], [1, 1, 1], [0, 1, 0]],
    [[0, 1, 0], [1, 1, 0], [0, 1, 0]],
  ],
  // S piece
  [
    [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
    [[0, 1, 0], [0, 1, 1], [0, 0, 1]],
    [[0, 0, 0], [0, 1, 1], [1, 1, 0]],
    [[1, 0, 0], [1, 1, 0], [0, 1, 0]],
  ],
  // Z piece
  [
    [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
    [[0, 0, 1], [0, 1, 1], [0, 1, 0]],
    [[0, 0, 0], [1, 1, 0], [0, 1, 1]],
    [[0, 1, 0], [1, 1, 0], [1, 0, 0]],
  ],
  // J piece
  [
    [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
    [[0, 1, 1], [0, 1, 0], [0, 1, 0]],
    [[0, 0, 0], [1, 1, 1], [0, 0, 1]],
    [[0, 1, 0], [0, 1, 0], [1, 1, 0]],
  ],
  // L piece
  [
    [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
    [[0, 1, 0], [0, 1, 0], [0, 1, 1]],
    [[0, 0, 0], [1, 1, 1], [1, 0, 0]],
    [[1, 1, 0], [0, 1, 0], [0, 1, 0]],
  ],
];

// Piece colors
export const PIECE_COLORS = [
  '#00f0f0', // I - Cyan
  '#f0f000', // O - Yellow
  '#a000f0', // T - Purple
  '#00f000', // S - Green
  '#f00000', // Z - Red
  '#0000f0', // J - Blue
  '#f0a000', // L - Orange
];

// ============================================================================
// Types
// ============================================================================

export interface Piece {
  type: number; // 0-6
  x: number;
  y: number;
  rotation: number; // 0-3
}

export interface GameState {
  board: (number | null)[][];
  currentPiece: Piece | null;
  nextPieces: number[];
  holdPiece: number | null;
  canHold: boolean;
  score: number;
  lines: number;
  level: number;
  combo: number;
  fallSpeed: number;
  lastMoveTime: number;
  isGameOver: boolean;
  isPaused: boolean;
}

// ============================================================================
// Board Functions
// ============================================================================

/**
 * Create an empty game board
 */
export function createEmptyBoard(): (number | null)[][] {
  return Array.from({ length: BOARD_HEIGHT + PREVIEW_HEIGHT }, () =>
    Array(BOARD_WIDTH).fill(null)
  );
}

/**
 * Check if a position is valid for a piece
 */
export function isValidPosition(
  board: (number | null)[][],
  piece: Piece
): boolean {
  const shape = TETROMINOS[piece.type][piece.rotation];

  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        const newX = piece.x + x;
        const newY = piece.y + y;

        // Check bounds
        if (
          newX < 0 ||
          newX >= BOARD_WIDTH ||
          newY >= BOARD_HEIGHT + PREVIEW_HEIGHT
        ) {
          return false;
        }

        // Check collision with existing pieces
        if (newY >= 0 && board[newY][newX] !== null) {
          return false;
        }
      }
    }
  }

  return true;
}

/**
 * Merge piece into board
 */
export function mergePieceToBoard(
  board: (number | null)[][],
  piece: Piece
): (number | null)[][] {
  const newBoard = board.map((row) => [...row]);
  const shape = TETROMINOS[piece.type][piece.rotation];

  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        const boardY = piece.y + y;
        const boardX = piece.x + x;
        if (boardY >= 0 && boardY < newBoard.length) {
          newBoard[boardY][boardX] = piece.type;
        }
      }
    }
  }

  return newBoard;
}

/**
 * Clear completed lines and return the number of lines cleared
 */
export function clearLines(
  board: (number | null)[][]
): { board: (number | null)[][]; linesCleared: number } {
  const newBoard = board.filter((row) => row.some((cell) => cell === null));
  const linesCleared = board.length - newBoard.length;

  // Add empty rows at the top
  while (newBoard.length < BOARD_HEIGHT + PREVIEW_HEIGHT) {
    newBoard.unshift(Array(BOARD_WIDTH).fill(null));
  }

  return { board: newBoard, linesCleared };
}

// ============================================================================
// Piece Functions
// ============================================================================

/**
 * Generate a random piece type
 */
export function getRandomPieceType(): number {
  return Math.floor(Math.random() * 7);
}

/**
 * Generate a bag of 7 pieces (ensures fair distribution)
 */
export function generatePieceBag(): number[] {
  const bag = [0, 1, 2, 3, 4, 5, 6];
  // Fisher-Yates shuffle
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
}

/**
 * Create a new piece at the starting position
 */
export function createPiece(type: number): Piece {
  return {
    type,
    x: Math.floor(BOARD_WIDTH / 2) - 1,
    y: PREVIEW_HEIGHT - 2,
    rotation: 0,
  };
}

/**
 * Move piece down
 */
export function movePieceDown(piece: Piece): Piece {
  return { ...piece, y: piece.y + 1 };
}

/**
 * Move piece left
 */
export function movePieceLeft(piece: Piece): Piece {
  return { ...piece, x: piece.x - 1 };
}

/**
 * Move piece right
 */
export function movePieceRight(piece: Piece): Piece {
  return { ...piece, x: piece.x + 1 };
}

/**
 * Rotate piece clockwise with wall kick
 */
export function rotatePiece(
  board: (number | null)[][],
  piece: Piece
): Piece {
  const newRotation = (piece.rotation + 1) % 4;
  let newPiece = { ...piece, rotation: newRotation };

  // Try basic rotation
  if (isValidPosition(board, newPiece)) {
    return newPiece;
  }

  // Try wall kicks (SRS - Super Rotation System)
  const kicks = getWallKicks(piece.type, piece.rotation, newRotation);
  for (const [offsetX, offsetY] of kicks) {
    const kickedPiece = {
      ...newPiece,
      x: piece.x + offsetX,
      y: piece.y + offsetY,
    };
    if (isValidPosition(board, kickedPiece)) {
      return kickedPiece;
    }
  }

  // Rotation failed, return original
  return piece;
}

/**
 * Get wall kick offsets for SRS (Super Rotation System)
 */
function getWallKicks(
  pieceType: number,
  fromRotation: number,
  toRotation: number
): [number, number][] {
  // I piece has special wall kicks
  if (pieceType === 0) {
    const iKicks: Record<string, [number, number][]> = {
      '0->1': [[-2, 0], [1, 0], [-2, -1], [1, 2]],
      '1->2': [[-1, 0], [2, 0], [-1, 2], [2, -1]],
      '2->3': [[2, 0], [-1, 0], [2, 1], [-1, -2]],
      '3->0': [[1, 0], [-2, 0], [1, -2], [-2, 1]],
    };
    return iKicks[`${fromRotation}->${toRotation}`] || [[0, 0]];
  }

  // Other pieces use standard wall kicks
  const standardKicks: Record<string, [number, number][]> = {
    '0->1': [[-1, 0], [-1, 1], [0, -2], [-1, -2]],
    '1->2': [[1, 0], [1, -1], [0, 2], [1, 2]],
    '2->3': [[1, 0], [1, 1], [0, -2], [1, -2]],
    '3->0': [[-1, 0], [-1, -1], [0, 2], [-1, 2]],
  };
  return standardKicks[`${fromRotation}->${toRotation}`] || [[0, 0]];
}

/**
 * Hard drop piece (instant drop to bottom)
 */
export function hardDropPiece(
  board: (number | null)[][],
  piece: Piece
): { piece: Piece; dropDistance: number } {
  let currentPiece = { ...piece };
  let dropDistance = 0;

  while (isValidPosition(board, movePieceDown(currentPiece))) {
    currentPiece = movePieceDown(currentPiece);
    dropDistance++;
  }

  return { piece: currentPiece, dropDistance };
}

/**
 * Get ghost piece position (preview of where piece will land)
 */
export function getGhostPiece(
  board: (number | null)[][],
  piece: Piece
): Piece {
  return hardDropPiece(board, piece).piece;
}

// ============================================================================
// Scoring Functions
// ============================================================================

/**
 * Calculate score for line clears
 */
export function calculateScore(
  linesCleared: number,
  level: number,
  combo: number
): number {
  const baseScores = [0, 100, 300, 500, 800]; // 0, 1, 2, 3, 4 lines
  const baseScore = baseScores[linesCleared] || 0;
  const comboBonus = combo > 0 ? combo * 50 : 0;
  return baseScore * level + comboBonus;
}

/**
 * Calculate level based on lines cleared
 */
export function calculateLevel(totalLines: number, startLevel: number = 1): number {
  return startLevel + Math.floor(totalLines / 10);
}

/**
 * Calculate fall speed based on level
 */
export function calculateFallSpeed(level: number): number {
  const baseSpeed = 1000; // milliseconds
  const minSpeed = 100;
  const speedFactor = 0.9;
  return Math.max(baseSpeed * Math.pow(speedFactor, level - 1), minSpeed);
}

// ============================================================================
// Game State Functions
// ============================================================================

/**
 * Create initial game state
 */
export function createInitialState(startLevel: number = 1): GameState {
  const bag1 = generatePieceBag();
  const bag2 = generatePieceBag();
  const nextPieces = [...bag1, ...bag2];

  const firstPiece = createPiece(nextPieces.shift()!);

  return {
    board: createEmptyBoard(),
    currentPiece: firstPiece,
    nextPieces,
    holdPiece: null,
    canHold: true,
    score: 0,
    lines: 0,
    level: startLevel,
    combo: 0,
    fallSpeed: calculateFallSpeed(startLevel),
    lastMoveTime: Date.now(),
    isGameOver: false,
    isPaused: false,
  };
}

/**
 * Lock current piece and spawn next piece
 */
export function lockPieceAndSpawnNext(state: GameState): GameState {
  if (!state.currentPiece) return state;

  // Merge piece to board
  const boardWithPiece = mergePieceToBoard(state.board, state.currentPiece);

  // Clear lines
  const { board: clearedBoard, linesCleared } = clearLines(boardWithPiece);

  // Update combo
  const newCombo = linesCleared > 0 ? state.combo + 1 : 0;

  // Calculate score
  const scoreGained = calculateScore(linesCleared, state.level, newCombo);
  const newScore = state.score + scoreGained;
  const newLines = state.lines + linesCleared;
  const newLevel = calculateLevel(newLines, state.level);
  const newFallSpeed = calculateFallSpeed(newLevel);

  // Get next piece
  let nextPieces = [...state.nextPieces];
  const nextPieceType = nextPieces.shift()!;

  // Refill bag if running low
  if (nextPieces.length < 7) {
    nextPieces = [...nextPieces, ...generatePieceBag()];
  }

  const newPiece = createPiece(nextPieceType);

  // Check if game over (new piece collides immediately)
  const isGameOver = !isValidPosition(clearedBoard, newPiece);

  return {
    ...state,
    board: clearedBoard,
    currentPiece: isGameOver ? null : newPiece,
    nextPieces,
    canHold: true, // Reset hold availability
    score: newScore,
    lines: newLines,
    level: newLevel,
    combo: newCombo,
    fallSpeed: newFallSpeed,
    lastMoveTime: Date.now(),
    isGameOver,
  };
}

/**
 * Hold current piece
 */
export function holdCurrentPiece(state: GameState): GameState {
  if (!state.currentPiece || !state.canHold) return state;

  const currentType = state.currentPiece.type;
  let newPiece: Piece;

  if (state.holdPiece === null) {
    // First hold, get next piece
    let nextPieces = [...state.nextPieces];
    const nextPieceType = nextPieces.shift()!;

    if (nextPieces.length < 7) {
      nextPieces = [...nextPieces, ...generatePieceBag()];
    }

    newPiece = createPiece(nextPieceType);

    return {
      ...state,
      currentPiece: newPiece,
      holdPiece: currentType,
      canHold: false,
      nextPieces,
    };
  } else {
    // Swap with held piece
    newPiece = createPiece(state.holdPiece);

    return {
      ...state,
      currentPiece: newPiece,
      holdPiece: currentType,
      canHold: false,
    };
  }
}
