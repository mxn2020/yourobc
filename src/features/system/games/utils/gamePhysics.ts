import type {
  DinoState,
  Obstacle,
  Cloud,
  GameConfig,
} from "../types/game.types";

/**
 * Game Physics Utilities
 * Core physics and collision detection logic
 */

export const DEFAULT_CONFIG: GameConfig = {
  gravity: 0.6,
  jumpForce: -12,
  initialSpeed: 6,
  speedIncrement: 0.001,
  maxSpeed: 13,
  groundHeight: 150,
  dinoStartX: 50,
  obstacleMinGap: 200,
  obstacleMaxGap: 400,
  canvasWidth: 800,
  canvasHeight: 300,
};

export const createInitialDinoState = (): DinoState => ({
  x: DEFAULT_CONFIG.dinoStartX,
  y: DEFAULT_CONFIG.canvasHeight - DEFAULT_CONFIG.groundHeight - 44,
  velocityY: 0,
  isJumping: false,
  isDucking: false,
  width: 44,
  height: 47,
});

export const updateDinoPhysics = (
  dino: DinoState,
  config: GameConfig
): DinoState => {
  const groundY = config.canvasHeight - config.groundHeight - dino.height;
  let newDino = { ...dino };

  // Apply gravity
  if (newDino.y < groundY || newDino.velocityY < 0) {
    newDino.velocityY += config.gravity;
    newDino.y += newDino.velocityY;
    newDino.isJumping = true;
  }

  // Ground collision
  if (newDino.y >= groundY) {
    newDino.y = groundY;
    newDino.velocityY = 0;
    newDino.isJumping = false;
  }

  return newDino;
};

export const jump = (dino: DinoState, config: GameConfig): DinoState => {
  if (!dino.isJumping) {
    return {
      ...dino,
      velocityY: config.jumpForce,
      isJumping: true,
    };
  }
  return dino;
};

export const duck = (dino: DinoState): DinoState => {
  if (!dino.isJumping) {
    return {
      ...dino,
      isDucking: true,
      height: 30,
    };
  }
  return dino;
};

export const standUp = (dino: DinoState): DinoState => ({
  ...dino,
  isDucking: false,
  height: 47,
});

export const createObstacle = (
  lastObstacleX: number,
  config: GameConfig
): Obstacle => {
  const types: Array<"cactus" | "bird"> = ["cactus", "cactus", "bird"];
  const type = types[Math.floor(Math.random() * types.length)];

  const gap =
    config.obstacleMinGap +
    Math.random() * (config.obstacleMaxGap - config.obstacleMinGap);

  const x = lastObstacleX + gap;

  if (type === "cactus") {
    const cactusTypes = [
      { width: 17, height: 35 },
      { width: 25, height: 50 },
      { width: 34, height: 70 },
    ];
    const cactus = cactusTypes[Math.floor(Math.random() * cactusTypes.length)];

    return {
      id: `obstacle-${Date.now()}-${Math.random()}`,
      x,
      y: config.canvasHeight - config.groundHeight - cactus.height,
      width: cactus.width,
      height: cactus.height,
      type: "cactus",
      passed: false,
    };
  } else {
    // Bird
    const birdHeight = 40;
    const birdY =
      config.canvasHeight - config.groundHeight - Math.random() * 60 - 40;

    return {
      id: `obstacle-${Date.now()}-${Math.random()}`,
      x,
      y: birdY,
      width: 46,
      height: birdHeight,
      type: "bird",
      passed: false,
    };
  }
};

export const updateObstacles = (
  obstacles: Obstacle[],
  speed: number,
  config: GameConfig
): Obstacle[] => {
  // Move obstacles left
  let updated = obstacles.map((obs) => ({
    ...obs,
    x: obs.x - speed,
  }));

  // Remove off-screen obstacles
  updated = updated.filter((obs) => obs.x > -obs.width);

  // Add new obstacle if needed
  if (updated.length === 0) {
    updated.push(createObstacle(config.canvasWidth, config));
  } else {
    const lastObstacle = updated[updated.length - 1];
    if (lastObstacle.x < config.canvasWidth - 200) {
      updated.push(createObstacle(lastObstacle.x, config));
    }
  }

  return updated;
};

export const checkCollision = (
  dino: DinoState,
  obstacles: Obstacle[]
): boolean => {
  // Collision buffer for more forgiving gameplay
  const buffer = 5;

  for (const obstacle of obstacles) {
    // Check if dino and obstacle overlap
    if (
      dino.x + buffer < obstacle.x + obstacle.width &&
      dino.x + dino.width - buffer > obstacle.x &&
      dino.y + buffer < obstacle.y + obstacle.height &&
      dino.y + dino.height - buffer > obstacle.y
    ) {
      return true;
    }
  }

  return false;
};

export const updateObstaclesPassed = (
  obstacles: Obstacle[],
  dino: DinoState
): { obstacles: Obstacle[]; newlyPassed: number } => {
  let newlyPassed = 0;

  const updated = obstacles.map((obs) => {
    if (!obs.passed && obs.x + obs.width < dino.x) {
      newlyPassed++;
      return { ...obs, passed: true };
    }
    return obs;
  });

  return { obstacles: updated, newlyPassed };
};

export const createCloud = (startX: number): Cloud => ({
  id: `cloud-${Date.now()}-${Math.random()}`,
  x: startX,
  y: Math.random() * 80 + 20,
  width: 46,
  speed: Math.random() * 0.5 + 0.3,
});

export const updateClouds = (
  clouds: Cloud[],
  config: GameConfig
): Cloud[] => {
  // Move clouds left
  let updated = clouds.map((cloud) => ({
    ...cloud,
    x: cloud.x - cloud.speed,
  }));

  // Remove off-screen clouds
  updated = updated.filter((cloud) => cloud.x > -cloud.width);

  // Add new clouds if needed
  if (updated.length < 3 && Math.random() < 0.01) {
    updated.push(createCloud(config.canvasWidth + 50));
  }

  return updated;
};

export const calculateScore = (distance: number): number => {
  return Math.floor(distance / 10);
};

export const getDifficulty = (score: number): string => {
  if (score < 100) return "easy";
  if (score < 300) return "normal";
  return "hard";
};
