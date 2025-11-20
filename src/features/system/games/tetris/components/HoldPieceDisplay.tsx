// src/features/boilerplate/tetris/components/HoldPieceDisplay.tsx

import { TETROMINOS, PIECE_COLORS } from '../utils/tetrisEngine';

interface HoldPieceDisplayProps {
  holdPiece: number | null;
  canHold: boolean;
}

export function HoldPieceDisplay({ holdPiece, canHold }: HoldPieceDisplayProps) {
  return (
    <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
      <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
        Hold
      </h3>
      <div className="flex justify-center items-center bg-gray-800/50 rounded p-2 min-h-[80px]">
        {holdPiece !== null ? (
          <div
            className={`transition-opacity ${!canHold ? 'opacity-40' : 'opacity-100'}`}
          >
            <PiecePreview pieceType={holdPiece} />
          </div>
        ) : (
          <div className="text-gray-600 text-xs">Empty</div>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-2 text-center">
        {canHold ? 'Press C or Shift' : 'Already used'}
      </p>
    </div>
  );
}

function PiecePreview({ pieceType }: { pieceType: number }) {
  const shape = TETROMINOS[pieceType][0];
  const color = PIECE_COLORS[pieceType];

  return (
    <div
      className="grid gap-0"
      style={{
        gridTemplateColumns: `repeat(${shape[0].length}, 20px)`,
        gridTemplateRows: `repeat(${shape.length}, 20px)`,
      }}
    >
      {shape.map((row, y) =>
        row.map((cell, x) => (
          <div
            key={`${y}-${x}`}
            className="border border-gray-700/30"
            style={{
              width: 20,
              height: 20,
              backgroundColor: cell ? color : 'transparent',
              boxShadow: cell
                ? `inset 0 0 0 1px rgba(255, 255, 255, 0.3)`
                : undefined,
            }}
          />
        ))
      )}
    </div>
  );
}
