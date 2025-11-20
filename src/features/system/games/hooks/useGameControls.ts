import { useEffect, useCallback, useRef } from "react";
import type { DinoState, GameConfig } from "../types/game.types";
import { jump, duck, standUp } from "../utils/gamePhysics";

/**
 * useGameControls Hook
 * Handles keyboard and touch input for game controls
 */

interface UseGameControlsProps {
  isPlaying: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  dino: DinoState;
  config: GameConfig;
  onJump: (newDino: DinoState) => void;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
}

export const useGameControls = ({
  isPlaying,
  isPaused,
  isGameOver,
  dino,
  config,
  onJump,
  onStart,
  onPause,
  onResume,
}: UseGameControlsProps) => {
  const isDuckingRef = useRef(false);

  // Handle keyboard input
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Start game with Space or ArrowUp
      if (!isPlaying && !isPaused && (event.code === "Space" || event.code === "ArrowUp")) {
        event.preventDefault();
        onStart();
        return;
      }

      // Resume game
      if (isPaused && event.code === "Space") {
        event.preventDefault();
        onResume();
        return;
      }

      // Game controls during play
      if (isPlaying && !isPaused && !isGameOver) {
        if (event.code === "Space" || event.code === "ArrowUp") {
          event.preventDefault();
          const newDino = jump(dino, config);
          onJump(newDino);
        } else if (event.code === "ArrowDown") {
          event.preventDefault();
          if (!isDuckingRef.current) {
            isDuckingRef.current = true;
            const newDino = duck(dino);
            onJump(newDino);
          }
        } else if (event.code === "KeyP" || event.code === "Escape") {
          event.preventDefault();
          onPause();
        }
      }
    },
    [isPlaying, isPaused, isGameOver, dino, config, onJump, onStart, onPause, onResume]
  );

  const handleKeyUp = useCallback(
    (event: KeyboardEvent) => {
      if (event.code === "ArrowDown" && isDuckingRef.current) {
        event.preventDefault();
        isDuckingRef.current = false;
        const newDino = standUp(dino);
        onJump(newDino);
      }
    },
    [dino, onJump]
  );

  // Touch/Click handler
  const handleTouch = useCallback(() => {
    if (!isPlaying && !isPaused) {
      onStart();
    } else if (isPaused) {
      onResume();
    } else if (isPlaying && !isPaused && !isGameOver) {
      const newDino = jump(dino, config);
      onJump(newDino);
    }
  }, [isPlaying, isPaused, isGameOver, dino, config, onJump, onStart, onResume]);

  // Register event listeners
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return {
    handleTouch,
  };
};
