/**
 * Game Container Component
 *
 * Wrapper component that provides common UI for all games:
 * - Header with title, score, controls
 * - Game area
 * - Game over modal
 * - Pause overlay
 */

import React, { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pause, Play, RotateCcw } from 'lucide-react';

interface GameContainerProps {
  /** Game title */
  title: string;
  /** Current score */
  score: number;
  /** Is game playing */
  isPlaying: boolean;
  /** Is game paused */
  isPaused: boolean;
  /** Is game over */
  isGameOver: boolean;
  /** Game content */
  children: ReactNode;
  /** Optional stats to display */
  stats?: Array<{ label: string; value: string | number }>;
  /** Callbacks */
  onStart?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onReset?: () => void;
  /** Optional header actions */
  headerActions?: ReactNode;
  /** Optional footer content */
  footer?: ReactNode;
  /** Container className */
  className?: string;
}

export function GameContainer({
  title,
  score,
  isPlaying,
  isPaused,
  isGameOver,
  children,
  stats,
  onStart,
  onPause,
  onResume,
  onReset,
  headerActions,
  footer,
  className = '',
}: GameContainerProps) {
  return (
    <Card className={`game-container ${className}`}>
      {/* Header */}
      <div className="game-header flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">{title}</h2>
          <div className="text-xl font-semibold">
            Score: <span className="text-primary">{score.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Stats */}
          {stats && stats.length > 0 && (
            <div className="flex gap-4 mr-4">
              {stats.map((stat, index) => (
                <div key={index} className="text-sm">
                  <span className="text-muted-foreground">{stat.label}: </span>
                  <span className="font-semibold">{stat.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Custom header actions */}
          {headerActions}

          {/* Game controls */}
          <div className="flex gap-2">
            {!isPlaying && !isGameOver && onStart && (
              <Button onClick={onStart} size="sm">
                <Play className="h-4 w-4 mr-1" />
                Start
              </Button>
            )}

            {isPlaying && !isPaused && onPause && (
              <Button onClick={onPause} variant="outline" size="sm">
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </Button>
            )}

            {isPaused && onResume && (
              <Button onClick={onResume} size="sm">
                <Play className="h-4 w-4 mr-1" />
                Resume
              </Button>
            )}

            {onReset && (
              <Button onClick={onReset} variant="outline" size="sm">
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="game-area relative">
        {children}

        {/* Pause Overlay */}
        {isPaused && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <div className="text-center">
              <h3 className="text-4xl font-bold text-white mb-4">PAUSED</h3>
              {onResume && (
                <Button onClick={onResume} size="lg">
                  <Play className="h-5 w-5 mr-2" />
                  Resume
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {footer && <div className="game-footer p-4 border-t">{footer}</div>}
    </Card>
  );
}
