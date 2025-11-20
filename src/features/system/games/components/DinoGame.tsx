import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useGameEngine } from "../hooks/useGameEngine";
import { useGameControls } from "../hooks/useGameControls";
import { GameCanvas } from "./GameCanvas";
import { GameOverModal } from "./GameOverModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, RotateCw, Info } from "lucide-react";
import { getDifficulty } from "../utils/gamePhysics";
import toast from "react-hot-toast";

/**
 * DinoGame Component
 * Main game component that integrates all game logic
 */

const GAME_NAME = "dino-jump";

export const DinoGame = () => {
  const {
    gameState,
    dino,
    obstacles,
    clouds,
    config,
    startGame,
    pauseGame,
    resumeGame,
    resetGame,
    setHighScore,
    setDino,
  } = useGameEngine();

  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  // Convex mutations and queries
  const saveScore = useMutation(api.lib.system.games.mutations.saveScore);
  const userBestScore = useQuery(
    api.lib.system.games.queries.getUserBestScore,
    { gameName: GAME_NAME }
  );
  const userRank = useQuery(api.lib.system.games.queries.getUserRank, {
    gameName: GAME_NAME,
  });

  // Load user's high score on mount
  useEffect(() => {
    if (userBestScore) {
      setHighScore(userBestScore.score);
    }
  }, [userBestScore, setHighScore]);

  // Handle game over
  useEffect(() => {
    if (gameState.isGameOver && gameState.score > 0) {
      handleGameOver();
    }
  }, [gameState.isGameOver]);

  const handleGameOver = async () => {
    const timePlayedMs = gameState.startTime
      ? Date.now() - gameState.startTime
      : 0;

    const newHighScore = gameState.score > gameState.highScore;
    setIsNewHighScore(newHighScore);

    // Save score to backend
    try {
      const result = await saveScore({
        gameName: GAME_NAME,
        score: gameState.score,
        timePlayedMs,
        obstaclesJumped: gameState.obstaclesJumped,
        metadata: {
          speed: gameState.speed,
          difficulty: getDifficulty(gameState.score),
        },
      });

      if (result.isHighScore) {
        toast.success("New personal high score! 🎉");
      }
    } catch (error) {
      console.error("Failed to save score:", error);
      toast.error("Failed to save score");
    }

    // Show modal after a short delay
    setTimeout(() => {
      setShowGameOverModal(true);
    }, 500);
  };

  const handleRestart = () => {
    setShowGameOverModal(false);
    setIsNewHighScore(false);
    setTimeout(() => {
      startGame();
    }, 100);
  };

  const handleCloseModal = () => {
    setShowGameOverModal(false);
    resetGame();
  };

  // Game controls
  const { handleTouch } = useGameControls({
    isPlaying: gameState.isPlaying,
    isPaused: gameState.isPaused,
    isGameOver: gameState.isGameOver,
    dino,
    config,
    onJump: setDino,
    onStart: startGame,
    onPause: pauseGame,
    onResume: resumeGame,
  });

  return (
    <div className="space-y-6">
      {/* Game Info Card */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-800 mb-1">How to Play</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Press <kbd className="px-2 py-1 bg-white rounded border">SPACE</kbd> or <kbd className="px-2 py-1 bg-white rounded border">↑</kbd> to jump</li>
              <li>• Press <kbd className="px-2 py-1 bg-white rounded border">↓</kbd> to duck (avoid flying obstacles)</li>
              <li>• Press <kbd className="px-2 py-1 bg-white rounded border">P</kbd> to pause</li>
              <li>• On mobile: Tap to jump</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Stats Card */}
      <Card className="p-4">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-sm text-gray-600">Your Best</div>
            <div className="text-2xl font-bold text-blue-600">
              {userBestScore?.score.toLocaleString() ?? 0}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Your Rank</div>
            <div className="text-2xl font-bold text-purple-600">
              {userRank?.rank ? `#${userRank.rank}` : "-"}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Current</div>
            <div className="text-2xl font-bold text-green-600">
              {gameState.score.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Obstacles</div>
            <div className="text-2xl font-bold text-orange-600">
              {gameState.obstaclesJumped}
            </div>
          </div>
        </div>
      </Card>

      {/* Game Canvas */}
      <div className="flex justify-center">
        <GameCanvas
          dino={dino}
          obstacles={obstacles}
          clouds={clouds}
          config={config}
          isPlaying={gameState.isPlaying}
          isPaused={gameState.isPaused}
          score={gameState.score}
          highScore={gameState.highScore}
          onTouch={handleTouch}
        />
      </div>

      {/* Control Buttons */}
      <div className="flex justify-center gap-3">
        {!gameState.isPlaying && !gameState.isGameOver && (
          <Button onClick={startGame} size="lg" className="gap-2">
            <Play className="w-4 h-4" />
            Start Game
          </Button>
        )}

        {gameState.isPlaying && !gameState.isPaused && (
          <Button onClick={pauseGame} size="lg" variant="outline" className="gap-2">
            <Pause className="w-4 h-4" />
            Pause
          </Button>
        )}

        {gameState.isPaused && (
          <Button onClick={resumeGame} size="lg" className="gap-2">
            <Play className="w-4 h-4" />
            Resume
          </Button>
        )}

        {(gameState.isPlaying || gameState.isGameOver) && (
          <Button onClick={resetGame} size="lg" variant="outline" className="gap-2">
            <RotateCw className="w-4 h-4" />
            Reset
          </Button>
        )}
      </div>

      {/* Game Over Modal */}
      <GameOverModal
        isOpen={showGameOverModal}
        score={gameState.score}
        highScore={gameState.highScore}
        isNewHighScore={isNewHighScore}
        obstaclesJumped={gameState.obstaclesJumped}
        timePlayedMs={
          gameState.startTime ? Date.now() - gameState.startTime : 0
        }
        onRestart={handleRestart}
        onClose={handleCloseModal}
      />
    </div>
  );
};
