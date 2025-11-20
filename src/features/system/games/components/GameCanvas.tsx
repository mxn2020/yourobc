import { useEffect, useRef } from "react";
import type { DinoState, Obstacle, Cloud, GameConfig } from "../types/game.types";

/**
 * GameCanvas Component
 * Renders the game using HTML5 Canvas
 */

interface GameCanvasProps {
  dino: DinoState;
  obstacles: Obstacle[];
  clouds: Cloud[];
  config: GameConfig;
  isPlaying: boolean;
  isPaused: boolean;
  score: number;
  highScore: number;
  onTouch: () => void;
}

export const GameCanvas = ({
  dino,
  obstacles,
  clouds,
  config,
  isPlaying,
  isPaused,
  score,
  highScore,
  onTouch,
}: GameCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, config.canvasWidth, config.canvasHeight);

    // Draw background (gradient for sky)
    const gradient = ctx.createLinearGradient(0, 0, 0, config.canvasHeight);
    gradient.addColorStop(0, "#87CEEB");
    gradient.addColorStop(1, "#E0F6FF");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, config.canvasWidth, config.canvasHeight);

    // Draw clouds
    ctx.fillStyle = "#FFFFFF";
    clouds.forEach((cloud) => {
      // Simple cloud shape
      ctx.beginPath();
      ctx.arc(cloud.x, cloud.y, 15, 0, Math.PI * 2);
      ctx.arc(cloud.x + 15, cloud.y - 5, 20, 0, Math.PI * 2);
      ctx.arc(cloud.x + 30, cloud.y, 15, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw ground
    const groundY = config.canvasHeight - config.groundHeight;
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(config.canvasWidth, groundY);
    ctx.stroke();

    // Draw dino
    ctx.fillStyle = dino.isDucking ? "#4A5568" : "#2D3748";
    ctx.fillRect(dino.x, dino.y, dino.width, dino.height);

    // Dino eye
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(dino.x + 30, dino.y + 10, 8, 8);
    ctx.fillStyle = "#000000";
    ctx.fillRect(dino.x + 33, dino.y + 13, 3, 3);

    // Dino legs (simple animation)
    ctx.fillStyle = "#2D3748";
    const legOffset = Math.floor(score / 10) % 2 === 0 ? 0 : 5;
    if (!dino.isJumping) {
      ctx.fillRect(dino.x + 10, dino.y + dino.height, 8, 10);
      ctx.fillRect(dino.x + 26 + legOffset, dino.y + dino.height, 8, 10);
    }

    // Draw obstacles
    obstacles.forEach((obstacle) => {
      if (obstacle.type === "cactus") {
        // Draw cactus
        ctx.fillStyle = "#22543D";
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

        // Cactus arms
        const armY = obstacle.y + obstacle.height * 0.3;
        ctx.fillRect(obstacle.x - 5, armY, 5, 15);
        ctx.fillRect(obstacle.x + obstacle.width, armY, 5, 15);
      } else {
        // Draw bird
        ctx.fillStyle = "#2C5282";
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

        // Bird wings (simple animation)
        const wingY =
          Math.floor(score / 5) % 2 === 0
            ? obstacle.y - 5
            : obstacle.y + 5;
        ctx.fillRect(obstacle.x + 5, wingY, 15, 5);
        ctx.fillRect(obstacle.x + 26, wingY, 15, 5);
      }
    });

    // Draw score
    ctx.fillStyle = "#333";
    ctx.font = "20px monospace";
    ctx.textAlign = "right";
    ctx.fillText(`HI ${highScore.toString().padStart(5, "0")}`, config.canvasWidth - 120, 30);
    ctx.fillText(`${score.toString().padStart(5, "0")}`, config.canvasWidth - 20, 30);

    // Draw pause message
    if (isPaused) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(0, 0, config.canvasWidth, config.canvasHeight);
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "40px monospace";
      ctx.textAlign = "center";
      ctx.fillText("PAUSED", config.canvasWidth / 2, config.canvasHeight / 2 - 20);
      ctx.font = "20px monospace";
      ctx.fillText(
        "Press SPACE to resume",
        config.canvasWidth / 2,
        config.canvasHeight / 2 + 20
      );
    }

    // Draw start message
    if (!isPlaying && !isPaused) {
      ctx.fillStyle = "#333";
      ctx.font = "24px monospace";
      ctx.textAlign = "center";
      ctx.fillText(
        "Press SPACE or TAP to start",
        config.canvasWidth / 2,
        config.canvasHeight / 2
      );
      ctx.font = "16px monospace";
      ctx.fillText(
        "SPACE / UP: Jump | DOWN: Duck | P: Pause",
        config.canvasWidth / 2,
        config.canvasHeight / 2 + 40
      );
    }
  }, [dino, obstacles, clouds, config, isPlaying, isPaused, score, highScore]);

  return (
    <canvas
      ref={canvasRef}
      width={config.canvasWidth}
      height={config.canvasHeight}
      onClick={onTouch}
      className="border-2 border-gray-300 rounded-lg shadow-lg cursor-pointer bg-white"
      style={{ touchAction: "none" }}
    />
  );
};
