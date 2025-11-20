import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, RotateCw, TrendingUp, Clock, Target } from "lucide-react";

/**
 * GameOverModal Component
 * Displays game over screen with stats and options
 */

interface GameOverModalProps {
  isOpen: boolean;
  score: number;
  highScore: number;
  isNewHighScore: boolean;
  obstaclesJumped: number;
  timePlayedMs: number;
  onRestart: () => void;
  onClose: () => void;
}

export const GameOverModal = ({
  isOpen,
  score,
  highScore,
  isNewHighScore,
  obstaclesJumped,
  timePlayedMs,
  onRestart,
  onClose,
}: GameOverModalProps) => {
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            {isNewHighScore ? (
              <div className="flex items-center justify-center gap-2 text-yellow-600">
                <Trophy className="w-8 h-8" />
                New High Score!
              </div>
            ) : (
              "Game Over"
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Score Display */}
          <div className="text-center">
            <div className="text-6xl font-bold text-gray-800 mb-2">
              {score.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">
              High Score: {highScore.toLocaleString()}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <Target className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-blue-700">
                {obstaclesJumped}
              </div>
              <div className="text-xs text-gray-600">Obstacles Cleared</div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg text-center">
              <Clock className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-green-700">
                {formatTime(timePlayedMs)}
              </div>
              <div className="text-xs text-gray-600">Time Played</div>
            </div>
          </div>

          {/* Performance Message */}
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <TrendingUp className="w-5 h-5 mx-auto mb-2 text-gray-600" />
            <div className="text-sm text-gray-700">
              {score > highScore * 0.8
                ? "Amazing performance! 🎉"
                : score > highScore * 0.5
                ? "Great job! Keep going! 💪"
                : "Good effort! Practice makes perfect! 🌟"}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={onRestart}
              className="flex-1 gap-2"
              size="lg"
            >
              <RotateCw className="w-4 h-4" />
              Play Again
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              size="lg"
            >
              Close
            </Button>
          </div>

          {/* Tip */}
          <div className="text-center text-xs text-gray-500">
            <p>💡 Tip: Time your jumps carefully to clear obstacles!</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
