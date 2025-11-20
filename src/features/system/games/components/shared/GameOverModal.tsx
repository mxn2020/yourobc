/**
 * Game Over Modal
 *
 * Generic game over screen that can be customized for any game
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, Star, Award, RotateCcw, Home } from 'lucide-react';

export interface GameOverStats {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

interface GameOverModalProps {
  /** Is modal open */
  open: boolean;
  /** Game title */
  title?: string;
  /** Final score */
  score: number;
  /** High score */
  highScore?: number;
  /** Is new high score */
  isNewHighScore?: boolean;
  /** Additional stats to display */
  stats?: GameOverStats[];
  /** Unlocked achievements */
  achievements?: Array<{ name: string; icon: string }>;
  /** Callbacks */
  onPlayAgain?: () => void;
  onGoHome?: () => void;
  onViewStats?: () => void;
  /** Custom content */
  children?: React.ReactNode;
}

export function GameOverModal({
  open,
  title = 'Game Over',
  score,
  highScore,
  isNewHighScore,
  stats,
  achievements,
  onPlayAgain,
  onGoHome,
  onViewStats,
  children,
}: GameOverModalProps) {
  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-3xl font-bold">
            {isNewHighScore ? (
              <span className="flex items-center justify-center gap-2 text-yellow-500">
                <Trophy className="h-8 w-8" />
                New High Score!
                <Trophy className="h-8 w-8" />
              </span>
            ) : (
              title
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Score Display */}
          <div className="text-center space-y-2">
            <div className="text-5xl font-bold text-primary">{score.toLocaleString()}</div>
            {highScore !== undefined && (
              <div className="text-sm text-muted-foreground">
                High Score: {highScore.toLocaleString()}
              </div>
            )}
          </div>

          {/* Stats */}
          {stats && stats.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center justify-center p-3 bg-muted rounded-lg"
                >
                  {stat.icon && <div className="mb-1">{stat.icon}</div>}
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Achievements */}
          {achievements && achievements.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-1">
                <Award className="h-4 w-4" />
                Achievements Unlocked
              </h4>
              <div className="space-y-1">
                {achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-muted rounded-md"
                  >
                    <span className="text-2xl">{achievement.icon}</span>
                    <span className="text-sm font-medium">{achievement.name}</span>
                    <Star className="h-4 w-4 text-yellow-500 ml-auto" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Content */}
          {children}

          {/* Actions */}
          <div className="flex flex-col gap-2">
            {onPlayAgain && (
              <Button onClick={onPlayAgain} size="lg" className="w-full">
                <RotateCcw className="h-5 w-5 mr-2" />
                Play Again
              </Button>
            )}

            <div className="flex gap-2">
              {onViewStats && (
                <Button onClick={onViewStats} variant="outline" className="flex-1">
                  View Stats
                </Button>
              )}
              {onGoHome && (
                <Button onClick={onGoHome} variant="outline" className="flex-1">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
