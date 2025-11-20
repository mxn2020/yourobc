import { useRef, useEffect, useCallback, useState } from "react";
import type { DinoState, Obstacle, Cloud, GameState } from "../types/game.types";
import {
  DEFAULT_CONFIG,
  createInitialDinoState,
  updateDinoPhysics,
  updateObstacles,
  updateClouds,
  checkCollision,
  updateObstaclesPassed,
  calculateScore,
  createCloud,
  createObstacle,
} from "../utils/gamePhysics";

/**
 * useGameEngine Hook
 * Core game loop and state management
 */

export const useGameEngine = () => {
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    isPaused: false,
    isGameOver: false,
    score: 0,
    highScore: 0,
    speed: DEFAULT_CONFIG.initialSpeed,
    distance: 0,
    obstaclesJumped: 0,
    frameCount: 0,
    startTime: null,
  });

  const [dino, setDino] = useState<DinoState>(createInitialDinoState());
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [clouds, setClouds] = useState<Cloud[]>([]);

  const animationFrameRef = useRef<number>();
  const configRef = useRef(DEFAULT_CONFIG);

  // Initialize clouds
  useEffect(() => {
    const initialClouds: Cloud[] = [];
    for (let i = 0; i < 3; i++) {
      initialClouds.push(createCloud(Math.random() * 800));
    }
    setClouds(initialClouds);
  }, []);

  // Game loop
  const gameLoop = useCallback(() => {
    setGameState((prev) => {
      if (!prev.isPlaying || prev.isPaused || prev.isGameOver) {
        return prev;
      }

      const newFrameCount = prev.frameCount + 1;
      const newDistance = prev.distance + prev.speed;
      const newSpeed = Math.min(
        prev.speed + configRef.current.speedIncrement,
        configRef.current.maxSpeed
      );

      return {
        ...prev,
        frameCount: newFrameCount,
        distance: newDistance,
        speed: newSpeed,
        score: calculateScore(newDistance),
      };
    });

    setDino((prevDino) => {
      if (gameState.isPlaying && !gameState.isPaused && !gameState.isGameOver) {
        return updateDinoPhysics(prevDino, configRef.current);
      }
      return prevDino;
    });

    setObstacles((prevObstacles) => {
      if (gameState.isPlaying && !gameState.isPaused && !gameState.isGameOver) {
        return updateObstacles(prevObstacles, gameState.speed, configRef.current);
      }
      return prevObstacles;
    });

    setClouds((prevClouds) => {
      if (gameState.isPlaying && !gameState.isPaused && !gameState.isGameOver) {
        return updateClouds(prevClouds, configRef.current);
      }
      return prevClouds;
    });

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameState.isPlaying, gameState.isPaused, gameState.isGameOver, gameState.speed]);

  // Check collisions
  useEffect(() => {
    if (gameState.isPlaying && !gameState.isPaused && !gameState.isGameOver) {
      if (checkCollision(dino, obstacles)) {
        setGameState((prev) => ({
          ...prev,
          isGameOver: true,
          isPlaying: false,
          highScore: Math.max(prev.highScore, prev.score),
        }));
      }
    }
  }, [dino, obstacles, gameState.isPlaying, gameState.isPaused, gameState.isGameOver]);

  // Check passed obstacles
  useEffect(() => {
    if (gameState.isPlaying && !gameState.isPaused && !gameState.isGameOver) {
      const { obstacles: updated, newlyPassed } = updateObstaclesPassed(
        obstacles,
        dino
      );

      if (newlyPassed > 0) {
        setObstacles(updated);
        setGameState((prev) => ({
          ...prev,
          obstaclesJumped: prev.obstaclesJumped + newlyPassed,
        }));
      }
    }
  }, [obstacles, dino, gameState.isPlaying, gameState.isPaused, gameState.isGameOver]);

  // Start/stop game loop
  useEffect(() => {
    if (gameState.isPlaying && !gameState.isPaused && !gameState.isGameOver) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState.isPlaying, gameState.isPaused, gameState.isGameOver, gameLoop]);

  const startGame = useCallback(() => {
    setGameState({
      isPlaying: true,
      isPaused: false,
      isGameOver: false,
      score: 0,
      highScore: gameState.highScore,
      speed: DEFAULT_CONFIG.initialSpeed,
      distance: 0,
      obstaclesJumped: 0,
      frameCount: 0,
      startTime: Date.now(),
    });
    setDino(createInitialDinoState());
    setObstacles([createObstacle(DEFAULT_CONFIG.canvasWidth, configRef.current)]);
  }, [gameState.highScore]);

  const pauseGame = useCallback(() => {
    setGameState((prev) => ({ ...prev, isPaused: true }));
  }, []);

  const resumeGame = useCallback(() => {
    setGameState((prev) => ({ ...prev, isPaused: false }));
  }, []);

  const resetGame = useCallback(() => {
    setGameState((prev) => ({
      isPlaying: false,
      isPaused: false,
      isGameOver: false,
      score: 0,
      highScore: prev.highScore,
      speed: DEFAULT_CONFIG.initialSpeed,
      distance: 0,
      obstaclesJumped: 0,
      frameCount: 0,
      startTime: null,
    }));
    setDino(createInitialDinoState());
    setObstacles([]);
  }, []);

  const setHighScore = useCallback((score: number) => {
    setGameState((prev) => ({
      ...prev,
      highScore: Math.max(prev.highScore, score),
    }));
  }, []);

  return {
    gameState,
    dino,
    obstacles,
    clouds,
    config: configRef.current,
    startGame,
    pauseGame,
    resumeGame,
    resetGame,
    setHighScore,
    setDino,
  };
};
