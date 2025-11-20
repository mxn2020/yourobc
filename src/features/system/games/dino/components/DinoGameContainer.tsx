/**
 * Dino Game Container Component
 *
 * React wrapper for DinoGame that integrates all systems
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { DinoGame } from '../core/DinoGame';
import { AchievementEngine, ReplayEngine, StatisticsEngine } from '../../engine';
import { dinoAchievements } from '../config/achievements';
import { GameContainer } from '../../components/shared/GameContainer';
import { GameOverModal } from '../../components/shared/GameOverModal';
import { AchievementToast } from '../../components/shared/AchievementToast';
import type { UnlockedAchievement } from '../../engine';

interface DinoGameContainerProps {
  userId: string;
  userName?: string;
}

export const DinoGameContainer: React.FC<DinoGameContainerProps> = ({
  userId,
  userName = 'Player',
}) => {
  // Refs
  const gameRef = useRef<DinoGame | null>(null);
  const achievementEngineRef = useRef<AchievementEngine | null>(null);
  const replayEngineRef = useRef<ReplayEngine | null>(null);
  const statsEngineRef = useRef<StatisticsEngine | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // State
  const [gameScore, setGameScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStats, setGameStats] = useState<any>(null);
  const [unlockedAchievement, setUnlockedAchievement] = useState<UnlockedAchievement | null>(null);

  // Convex mutations
  const saveScore = useMutation(api.lib.system.games.core.mutations.saveScore);
  const saveReplay = useMutation(api.lib.system.games.replays.mutations.saveReplay);
  const unlockAchievement = useMutation(api.lib.system.games.achievements.mutations.unlockAchievement);

  // Convex queries
  const userAchievements = useQuery(api.lib.system.games.achievements.queries.getUserAchievements, {
    gameId: 'dino',
  });
  const leaderboard = useQuery(api.lib.system.games.core.queries.getLeaderboard, {
    gameId: 'dino',
    limit: 10,
  });

  /**
   * Initialize game and systems
   */
  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize game
    const game = new DinoGame({
      id: 'dino',
      name: 'Dino Jump',
      renderMode: 'canvas' as any,
      targetFPS: 60,
      debug: false,
    });

    // Initialize achievement engine
    const achievementEngine = new AchievementEngine();
    achievementEngine.registerAchievements(dinoAchievements);

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
      maxReplaySize: 10000,
      compressionEnabled: true,
    });

    // Initialize statistics engine
    const statsEngine = new StatisticsEngine([
      { key: 'jumps', displayName: 'Total Jumps', aggregateType: 'sum' },
      { key: 'ducks', displayName: 'Total Ducks', aggregateType: 'sum' },
      { key: 'distance', displayName: 'Distance', aggregateType: 'max' },
      { key: 'speed', displayName: 'Max Speed', aggregateType: 'max' },
    ]);

    // Initialize game in container
    game.initialize(containerRef.current);

    // Set up event listeners
    game.on('score_updated', (data: any) => {
      setGameScore(data.score);
    });

    game.on('game_over', async (data: any) => {
      console.log('[DinoGameContainer] Game Over', data);
      setIsGameOver(true);
      setGameStats(data);

      // Stop replay recording
      const replay = replayEngine.stopRecording(userId, data.score);

      // Check achievements
      const gameState = game.getState();
      const newAchievements = achievementEngine.checkAchievements(gameState, data);

      // Save to backend
      try {
        // Save score
        await saveScore({
          gameId: 'dino',
          score: data.score,
          timePlayedMs: data.timePlayedMs,
          metadata: {
            distance: data.distance,
            obstaclesJumped: data.obstaclesJumped,
            speed: gameState.speed,
          },
        });

        // Save replay if available
        if (replay) {
          await saveReplay({
            replayId: replay.id,
            gameId: 'dino',
            score: data.score,
            duration: data.timePlayedMs,
            version: replay.version,
            initialState: replay.initialState,
            inputs: replay.inputs,
            isPublic: data.score >= 500, // Auto-publish good scores
            tags: ['dino', 'classic'],
          });
        }

        // Unlock achievements
        for (const achievement of newAchievements) {
          await unlockAchievement({
            gameId: 'dino',
            achievementId: achievement.id,
          });

          // Show toast
          setUnlockedAchievement(achievement);
          setTimeout(() => setUnlockedAchievement(null), 5000);
        }
      } catch (error) {
        console.error('[DinoGameContainer] Error saving game data:', error);
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
        case 'Space':
        case 'ArrowUp':
          e.preventDefault();
          game.jump();
          replayEngine.recordInput(game.getState().frame, 'jump');
          statsEngine.incrementStat('jumps', 1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          game.duck(true);
          replayEngine.recordInput(game.getState().frame, 'duck_start');
          statsEngine.incrementStat('ducks', 1);
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowDown') {
        e.preventDefault();
        game.duck(false);
        replayEngine.recordInput(game.getState().frame, 'duck_end');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      game.destroy();
    };
  }, [userId, userAchievements]);

  /**
   * Start game
   */
  const handleStart = useCallback(() => {
    if (!gameRef.current || !replayEngineRef.current || !statsEngineRef.current) return;

    setIsGameOver(false);
    setGameScore(0);

    gameRef.current.start();

    // Start recording
    replayEngineRef.current.startRecording('dino', gameRef.current.getState());

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
    console.log('[DinoGameContainer] View replays');
  }, []);

  /**
   * View achievements
   */
  const handleViewAchievements = useCallback(() => {
    // TODO: Navigate to achievements page
    console.log('[DinoGameContainer] View achievements');
  }, []);

  return (
    <div className="dino-game-container">
      <GameContainer
        gameTitle="Dino Jump"
        score={gameScore}
        isPaused={isPaused}
        onStart={handleStart}
        onPause={handlePause}
        onResume={handleResume}
      >
        <div ref={containerRef} className="game-canvas-wrapper" />
      </GameContainer>

      {isGameOver && gameStats && (
        <GameOverModal
          score={gameStats.score}
          stats={[
            { label: 'Distance', value: `${Math.floor(gameStats.distance)}m` },
            { label: 'Obstacles Jumped', value: gameStats.obstaclesJumped },
            { label: 'Time Played', value: `${Math.floor(gameStats.timePlayedMs / 1000)}s` },
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
        .dino-game-container {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .game-canvas-wrapper {
          width: 100%;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f7f7f7;
        }

        :global(canvas) {
          max-width: 100%;
          max-height: 100%;
          border: 2px solid #535353;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
};
