// src/features/system/tetris/components/NextPiecesDisplay.tsx

import { TETROMINOS, PIECE_COLORS } from '../utils/tetrisEngine';

interface NextPiecesDisplayProps {
  nextPieces: number[];
  count?: number;
}

export function NextPiecesDisplay({ nextPieces, count = 3 }: NextPiecesDisplayProps) {
  const piecesToShow = nextPieces.slice(0, count);

  return (
    <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
      <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
        Next
      </h3>
      <div className="space-y-3">
        {piecesToShow.map((pieceType, index) => (
          <PiecePreview key={index} pieceType={pieceType} />
        ))}
      </div>
    </div>
  );
}

function PiecePreview({ pieceType }: { pieceType: number }) {
  const shape = TETROMINOS[pieceType][0]; // Always show rotation 0
  const color = PIECE_COLORS[pieceType];

  return (
    <div className="flex justify-center items-center bg-gray-800/50 rounded p-2">
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
    </div>
  );
}
