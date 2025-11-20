/**
 * Tetris Game Container Component
 *
 * React wrapper for TetrisGame that integrates all systems
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { TetrisGame, type TetrisGameState } from '../core/TetrisGame';
import { AchievementEngine, ReplayEngine, StatisticsEngine } from '../../engine';
import { tetrisAchievements } from '../config/achievements';
import { GameContainer } from '../../components/shared/GameContainer';
import { GameOverModal } from '../../components/shared/GameOverModal';
import { AchievementToast } from '../../components/shared/AchievementToast';
import type { UnlockedAchievement } from '../../engine';
import { TetrisBoard } from '../components/TetrisBoard';
import { NextPiecesDisplay } from '../components/NextPiecesDisplay';
import { HoldPieceDisplay } from '../components/HoldPieceDisplay';
import { GameStats } from '../components/GameStats';

interface TetrisGameContainerProps {
  userId: string;
  userName?: string;
  difficulty?: 'easy' | 'medium' | 'hard' | 'expert';
}

export const TetrisGameContainer: React.FC<TetrisGameContainerProps> = ({
  userId,
  userName = 'Player',
  difficulty = 'medium',
}) => {
  // Refs
  const gameRef = useRef<TetrisGame | null>(null);
  const achievementEngineRef = useRef<AchievementEngine | null>(null);
  const replayEngineRef = useRef<ReplayEngine | null>(null);
  const statsEngineRef = useRef<StatisticsEngine | null>(null);

  // State
  const [gameState, setGameState] = useState<TetrisGameState | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStats, setGameStats] = useState<any>(null);
  const [unlockedAchievement, setUnlockedAchievement] = useState<UnlockedAchievement | null>(null);

  // Convex mutations
  const saveScore = useMutation(api.lib.boilerplate.games.core.mutations.saveScore);
  const saveReplay = useMutation(api.lib.boilerplate.games.replays.mutations.saveReplay);
  const unlockAchievement = useMutation(api.lib.boilerplate.games.achievements.mutations.unlockAchievement);

  // Convex queries
  const userAchievements = useQuery(api.lib.boilerplate.games.achievements.queries.getUserAchievements, {
    gameId: 'tetris',
  });
  const leaderboard = useQuery(api.lib.boilerplate.games.core.queries.getLeaderboard, {
    gameId: 'tetris',
    limit: 10,
  });

  /**
   * Initialize game and systems
   */
  useEffect(() => {
    // Initialize game
    const game = new TetrisGame({
      id: 'tetris',
      name: 'Tetris',
      renderMode: 'react' as any,
      targetFPS: 60,
      debug: false,
      difficulty,
    });

    // Set up render callback
    game.setRenderCallback((state: TetrisGameState) => {
      setGameState({ ...state });
    });

    // Initialize achievement engine
    const achievementEngine = new AchievementEngine();
    achievementEngine.registerAchievements(tetrisAchievements);

    // Load user's unlocked achievements
    if (userAchievements) {
      userAchievements.forEach((ua) => {
        if (ua.unlockedAt) {
          achievementEngine.unlock(ua.achievementId);
        }
      });
    }

    // Initialize replay engine
    const replayEngine = new ReplayEngine({
      version: '1.0',
      maxReplaySize: 20000,
      compressionEnabled: true,
    });

    // Initialize statistics engine
    const statsEngine = new StatisticsEngine([
      { key: 'pieces', displayName: 'Total Pieces', aggregateType: 'sum' },
      { key: 'lines', displayName: 'Total Lines', aggregateType: 'sum' },
      { key: 'tetris', displayName: 'Tetris Clears', aggregateType: 'sum' },
      { key: 'combo', displayName: 'Max Combo', aggregateType: 'max' },
    ]);

    // Set up event listeners
    game.on('score_updated', (data: any) => {
      // Score updates handled via render callback
    });

    game.on('lines_cleared', (data: any) => {
      // Track line clears
      statsEngine.incrementStat('lines', data.count);
      if (data.count === 4) {
        statsEngine.incrementStat('tetris', 1);
      }
    });

    game.on('game_over', async (data: any) => {
      console.log('[TetrisGameContainer] Game Over', data);
      setIsGameOver(true);
      setGameStats(data);

      // Stop replay recording
      const replay = replayEngine.stopRecording(userId, data.score);

      // Check achievements
      const currentState = game.getState();
      const newAchievements = achievementEngine.checkAchievements(currentState, data);

      // Save to backend
      try {
        // Save score
        await saveScore({
          gameId: 'tetris',
          score: data.score,
          timePlayedMs: data.timePlayedMs,
          metadata: {
            lines: data.lines,
            level: data.level,
            difficulty,
            piecesPlaced: data.piecesPlaced,
            tetrisLines: data.tetrisLines,
            maxCombo: data.maxCombo,
          },
        });

        // Save replay if available
        if (replay) {
          await saveReplay({
            replayId: replay.id,
            gameId: 'tetris',
            score: data.score,
            duration: data.timePlayedMs,
            version: replay.version,
            initialState: replay.initialState,
            inputs: replay.inputs,
            isPublic: data.score >= 10000, // Auto-publish good scores
            tags: ['tetris', difficulty],
          });
        }

        // Unlock achievements
        for (const achievement of newAchievements) {
          await unlockAchievement({
            gameId: 'tetris',
            achievementId: achievement.id,
          });

          // Show toast
          setUnlockedAchievement(achievement);
          setTimeout(() => setUnlockedAchievement(null), 5000);
        }
      } catch (error) {
        console.error('[TetrisGameContainer] Error saving game data:', error);
      }
    });

    game.on('pause', () => setIsPaused(true));
    game.on('resume', () => setIsPaused(false));

    // Store refs
    gameRef.current = game;
    achievementEngineRef.current = achievementEngine;
    replayEngineRef.current = replayEngine;
    statsEngineRef.current = statsEngine;

    // Set up keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!game.isPlaying()) return;

      switch (e.code) {
        case 'ArrowLeft':
          e.preventDefault();
          game.moveLeft();
          replayEngine.recordInput(game.getState().frame, 'left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          game.moveRight();
          replayEngine.recordInput(game.getState().frame, 'right');
          break;
        case 'ArrowDown':
          e.preventDefault();
          game.moveDown();
          replayEngine.recordInput(game.getState().frame, 'down');
          break;
        case 'ArrowUp':
        case 'KeyX':
          e.preventDefault();
          game.rotate(true);
          replayEngine.recordInput(game.getState().frame, 'rotate_cw');
          break;
        case 'KeyZ':
          e.preventDefault();
          game.rotate(false);
          replayEngine.recordInput(game.getState().frame, 'rotate_ccw');
          break;
        case 'Space':
          e.preventDefault();
          game.hardDrop();
          replayEngine.recordInput(game.getState().frame, 'hard_drop');
          statsEngine.incrementStat('pieces', 1);
          break;
        case 'KeyC':
        case 'ShiftLeft':
        case 'ShiftRight':
          e.preventDefault();
          game.hold();
          replayEngine.recordInput(game.getState().frame, 'hold');
          break;
        case 'KeyP':
          e.preventDefault();
          if (game.isPaused()) {
            game.resume();
          } else {
            game.pause();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Initialize game (creates initial state)
    game.initialize(document.body); // Dummy element for React rendering

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      game.destroy();
    };
  }, [userId, difficulty, userAchievements]);

  /**
   * Start game
   */
  const handleStart = useCallback(() => {
    if (!gameRef.current || !replayEngineRef.current || !statsEngineRef.current) return;

    setIsGameOver(false);
    setGameStats(null);

    gameRef.current.start();

    // Start recording
    replayEngineRef.current.startRecording('tetris', gameRef.current.getState());

    // Start stats session
    statsEngineRef.current.startSession();
  }, []);

  /**
   * Pause game
   */
  const handlePause = useCallback(() => {
    if (!gameRef.current) return;
    gameRef.current.pause();
  }, []);

  /**
   * Resume game
   */
  const handleResume = useCallback(() => {
    if (!gameRef.current) return;
    gameRef.current.resume();
  }, []);

  /**
   * Restart game
   */
  const handleRestart = useCallback(() => {
    handleStart();
  }, [handleStart]);

  /**
   * View replays
   */
  const handleViewReplays = useCallback(() => {
    // TODO: Navigate to replays page
    console.log('[TetrisGameContainer] View replays');
  }, []);

  /**
   * View achievements
   */
  const handleViewAchievements = useCallback(() => {
    // TODO: Navigate to achievements page
    console.log('[TetrisGameContainer] View achievements');
  }, []);

  if (!gameState) {
    return <div>Loading...</div>;
  }

  return (
    <div className="tetris-game-container">
      <GameContainer
        gameTitle="Tetris"
        score={gameState.score}
        isPaused={isPaused}
        onStart={handleStart}
        onPause={handlePause}
        onResume={handleResume}
      >
        <div className="game-layout">
          {/* Left side - Hold piece */}
          <div className="side-panel">
            <HoldPieceDisplay piece={gameState.holdPiece} canHold={gameState.canHold} />
          </div>

          {/* Center - Game board */}
          <div className="game-board-wrapper">
            <TetrisBoard
              board={gameState.board}
              currentPiece={gameState.currentPiece}
            />
          </div>

          {/* Right side - Stats and next pieces */}
          <div className="side-panel">
            <GameStats
              score={gameState.score}
              lines={gameState.lines}
              level={gameState.level}
              combo={gameState.combo}
            />
            <NextPiecesDisplay pieces={gameState.nextPieces.slice(0, 5)} />
          </div>
        </div>
      </GameContainer>

      {isGameOver && gameStats && (
        <GameOverModal
          score={gameStats.score}
          stats={[
            { label: 'Lines', value: gameStats.lines },
            { label: 'Level', value: gameStats.level },
            { label: 'Pieces', value: gameStats.piecesPlaced },
            { label: 'Max Combo', value: gameStats.maxCombo },
            { label: 'Tetris', value: gameStats.tetrisLines },
            { label: 'Time', value: `${Math.floor(gameStats.timePlayedMs / 1000)}s` },
          ]}
          onRestart={handleRestart}
          onViewReplays={handleViewReplays}
          onViewAchievements={handleViewAchievements}
          leaderboard={leaderboard || []}
          achievements={
            achievementEngineRef.current
              ? achievementEngineRef.current.getUnlockedAchievements()
              : []
          }
        />
      )}

      {unlockedAchievement && (
        <AchievementToast
          achievement={unlockedAchievement}
          onClose={() => setUnlockedAchievement(null)}
        />
      )}

      <style jsx>{`
        .tetris-game-container {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .game-layout {
          display: flex;
          gap: 2rem;
          justify-content: center;
          align-items: flex-start;
          padding: 2rem;
        }

        .side-panel {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          width: 150px;
        }

        .game-board-wrapper {
          flex: 0 0 auto;
        }

        @media (max-width: 768px) {
          .game-layout {
            flex-direction: column;
            align-items: center;
          }

          .side-panel {
            width: 100%;
            max-width: 300px;
          }
        }
      `}</style>
    </div>
  );
};
