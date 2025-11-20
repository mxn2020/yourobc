// src/features/boilerplate/tetris/components/GameStats.tsx

import type { GameState } from '../types';

interface GameStatsProps {
  gameState: GameState;
}

export function GameStats({ gameState }: GameStatsProps) {
  return (
    <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 space-y-4">
      <StatItem label="Score" value={gameState.score.toLocaleString()} highlight />
      <StatItem label="Lines" value={gameState.lines} />
      <StatItem label="Level" value={gameState.level} />
      {gameState.combo > 0 && (
        <StatItem label="Combo" value={`${gameState.combo}x`} highlight />
      )}
    </div>
  );
}

function StatItem({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-400 uppercase tracking-wide">{label}</span>
      <span
        className={`text-2xl font-bold ${
          highlight ? 'text-yellow-400' : 'text-white'
        }`}
      >
        {value}
      </span>
    </div>
  );
}
