// src/features/system/tetris/components/TetrisBoard.tsx

import { useMemo } from 'react';
import { TETROMINOS, PIECE_COLORS, getGhostPiece, BOARD_HEIGHT, PREVIEW_HEIGHT } from '../utils/tetrisEngine';
import { TETRIS_CONSTANTS } from '../utils/constants';
import type { GameState } from '../types';

interface TetrisBoardProps {
  gameState: GameState;
  showGhost?: boolean;
}

export function TetrisBoard({ gameState, showGhost = true }: TetrisBoardProps) {
  const { board, currentPiece } = gameState;

  // Calculate ghost piece position
  const ghostPiece = useMemo(() => {
    if (!currentPiece || !showGhost) return null;
    return getGhostPiece(board, currentPiece);
  }, [board, currentPiece, showGhost]);

  // Create display board with current piece and ghost piece
  const displayBoard = useMemo(() => {
    const display = board.map((row) => [...row]);

    // Draw ghost piece first (so it appears behind current piece)
    if (ghostPiece && currentPiece) {
      const shape = TETROMINOS[ghostPiece.type][ghostPiece.rotation];
      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
          if (shape[y][x]) {
            const boardY = ghostPiece.y + y;
            const boardX = ghostPiece.x + x;
            if (
              boardY >= 0 &&
              boardY < display.length &&
              boardX >= 0 &&
              boardX < display[0].length &&
              display[boardY][boardX] === null
            ) {
              display[boardY][boardX] = -1; // -1 for ghost piece
            }
          }
        }
      }
    }

    // Draw current piece
    if (currentPiece) {
      const shape = TETROMINOS[currentPiece.type][currentPiece.rotation];
      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
          if (shape[y][x]) {
            const boardY = currentPiece.y + y;
            const boardX = currentPiece.x + x;
            if (
              boardY >= 0 &&
              boardY < display.length &&
              boardX >= 0 &&
              boardX < display[0].length
            ) {
              display[boardY][boardX] = currentPiece.type;
            }
          }
        }
      }
    }

    return display;
  }, [board, currentPiece, ghostPiece]);

  // Only show visible rows (skip preview rows)
  const visibleBoard = displayBoard.slice(PREVIEW_HEIGHT);

  return (
    <div
      className="relative border-2 border-gray-700 rounded-lg overflow-hidden shadow-2xl"
      style={{
        backgroundColor: TETRIS_CONSTANTS.COLORS.BOARD_BACKGROUND,
      }}
    >
      <div
        className="grid gap-0"
        style={{
          gridTemplateColumns: `repeat(${TETRIS_CONSTANTS.BOARD.WIDTH}, ${TETRIS_CONSTANTS.CELL_SIZE}px)`,
          gridTemplateRows: `repeat(${BOARD_HEIGHT}, ${TETRIS_CONSTANTS.CELL_SIZE}px)`,
        }}
      >
        {visibleBoard.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${y}-${x}`}
              className="border border-gray-800/30 transition-all duration-100"
              style={{
                width: TETRIS_CONSTANTS.CELL_SIZE,
                height: TETRIS_CONSTANTS.CELL_SIZE,
                backgroundColor:
                  cell === null
                    ? 'transparent'
                    : cell === -1
                    ? TETRIS_CONSTANTS.COLORS.GHOST_PIECE
                    : PIECE_COLORS[cell],
                boxShadow:
                  cell !== null && cell !== -1
                    ? `inset 0 0 0 2px rgba(255, 255, 255, 0.3), inset 0 0 10px rgba(255, 255, 255, 0.1)`
                    : undefined,
              }}
            />
          ))
        )}
      </div>

      {/* Game Over Overlay */}
      {gameState.isGameOver && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-sm">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-red-500 mb-2">GAME OVER</h2>
            <p className="text-xl text-gray-300">Final Score: {gameState.score}</p>
          </div>
        </div>
      )}

      {/* Paused Overlay */}
      {gameState.isPaused && !gameState.isGameOver && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-yellow-500 mb-2">PAUSED</h2>
            <p className="text-sm text-gray-300">Press ESC or P to resume</p>
          </div>
        </div>
      )}
    </div>
  );
}
