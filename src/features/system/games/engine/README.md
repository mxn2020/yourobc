# Game Engine Documentation

A unified, extensible game engine for building browser-based games with React and Canvas support.

## Overview

The Game Engine provides a comprehensive framework for building games with:

- **Multiple Rendering Modes**: Canvas 2D, React Components, WebGL
- **Unified Input System**: Keyboard, Touch, Mouse, Gamepad support
- **State Management**: Persistence, snapshots, undo/redo
- **Achievement System**: Generic achievement tracking with notifications
- **Replay System**: Record and playback gameplay with compression
- **Multiplayer**: Room-based multiplayer with real-time sync
- **Statistics**: Advanced metrics and performance tracking
- **Shared UI Components**: Pre-built components for common game UI

## Architecture

```
engine/
├── core/           # Core engine classes and types
├── rendering/      # Rendering strategies (Canvas, React, WebGL)
├── input/          # Unified input management
├── state/          # State persistence and snapshots
└── systems/        # Game systems (achievements, replays, etc.)
    ├── achievements/
    ├── replays/
    ├── multiplayer/
    └── statistics/
```

## Quick Start

### 1. Create a Simple Game

```typescript
import { GameEngine, GameState, BaseGameState, RenderContext } from '../engine';

interface MyGameState extends BaseGameState {
  playerX: number;
  playerY: number;
  // ... custom game state
}

class MyGame extends GameEngine<MyGameState> {
  protected createInitialState(): MyGameState {
    return {
      state: GameState.IDLE,
      score: 0,
      startTime: null,
      endTime: null,
      timePlayedMs: 0,
      isPaused: false,
      isGameOver: false,
      frame: 0,
      // Custom state
      playerX: 0,
      playerY: 0,
    };
  }

  protected update(deltaTime: number): void {
    // Update game logic
    this.gameState.playerX += 1;
  }

  protected render(context: RenderContext): void {
    // Render game (Canvas or React)
    if (context.ctx) {
      context.ctx.fillRect(this.gameState.playerX, this.gameState.playerY, 50, 50);
    }
  }

  protected onGameOver(): void {
    // Handle game over
    console.log('Game Over! Score:', this.gameState.score);
  }
}
```

### 2. Initialize and Start

```typescript
const game = new MyGame({
  id: 'my-game',
  name: 'My Awesome Game',
  description: 'A simple game',
  renderMode: RenderMode.CANVAS,
  targetFPS: 60,
});

game.initialize();
game.start();
```

## Core Systems

### Game Lifecycle

```typescript
// Lifecycle methods (all optional)
protected onInitialize(): void {}    // Called once on initialization
protected onStart(): void {}         // Called when game starts
protected onPause(): void {}         // Called when game pauses
protected onResume(): void {}        // Called when game resumes
protected onReset(): void {}         // Called when game resets
protected onGameOver(): void {}      // Called when game ends

// Frame lifecycle
protected onBeforeUpdate(deltaTime: number): void {}
protected onAfterUpdate(deltaTime: number): void {}
protected onBeforeRender(context: RenderContext): void {}
protected onAfterRender(context: RenderContext): void {}
```

### Event System

```typescript
// Listen to game events
game.on(GameEvent.SCORE_CHANGED, (data) => {
  console.log('Score changed:', data.newScore);
});

game.on(GameEvent.GAME_OVER, (data) => {
  console.log('Game over:', data.score);
});

// Emit custom events
this.emit(GameEvent.ACHIEVEMENT_UNLOCKED, { achievementId: 'first-win' });
```

### Input Management

```typescript
const inputManager = new InputManager({
  supportedInputs: [InputType.KEYBOARD, InputType.TOUCH],
  actions: [
    {
      action: 'jump',
      keys: ['Space', 'ArrowUp'],
      touchGesture: 'tap',
      continuous: false,
    },
    {
      action: 'move_left',
      keys: ['ArrowLeft', 'a'],
      continuous: true,
    },
  ],
  enableAutoRepeat: true,
  autoRepeatDelay: 200,
  autoRepeatRate: 50,
});

inputManager.initialize();

inputManager.on((action, value) => {
  switch (action) {
    case 'jump':
      this.player.jump();
      break;
    case 'move_left':
      this.player.moveLeft();
      break;
  }
});
```

### Achievement System

```typescript
const achievements: Achievement[] = [
  {
    id: 'first-win',
    name: 'First Victory',
    description: 'Win your first game',
    icon: '🏆',
    points: 10,
    category: 'Progress',
    validate: (gameState, stats) => stats.wins >= 1,
  },
];

const achievementEngine = new AchievementEngine(achievements);

// Check achievements
const unlocked = achievementEngine.checkAchievements(gameState, stats);

// Listen for unlocks
achievementEngine.onUnlock((achievement) => {
  console.log('Achievement unlocked:', achievement.name);
});

// Get progress
const completion = achievementEngine.getCompletionPercentage();
const points = achievementEngine.getTotalPoints();
```

### Replay System

```typescript
const replayEngine = new ReplayEngine({
  version: '1.0',
  enableCompression: true,
  maxDuration: 300000, // 5 minutes
});

// Start recording
const sessionId = replayEngine.startRecording('my-game', initialState);

// Record inputs
replayEngine.recordInput(frameNumber, 'jump');

// Stop and save
const replayData = replayEngine.stopRecording(userId, score, metadata);

// Playback
replayEngine.startPlayback(replayData);
replayEngine.onInput((frame, action, value) => {
  // Apply input to game
});
```

### Multiplayer

```typescript
const multiplayerEngine = new MultiplayerEngine({
  enableHostMigration: true,
  defaultMaxPlayers: 4,
  roomTimeout: 300000,
});

// Create room
const room = multiplayerEngine.createRoom('my-game', hostUserId, {
  name: 'Fun Room',
  maxPlayers: 4,
  isPrivate: false,
});

// Join room
const player = multiplayerEngine.joinRoom(roomId, userId, 'PlayerName');

// Set ready
multiplayerEngine.setPlayerReady(roomId, playerId, true);

// Start game
multiplayerEngine.startGame(roomId, hostPlayerId);

// Update player state
multiplayerEngine.updatePlayerState(roomId, playerId, gameState);
```

### Statistics

```typescript
const stats: GameStatistic[] = [
  { key: 'score', name: 'Score', type: 'number' },
  { key: 'accuracy', name: 'Accuracy', type: 'percentage' },
  { key: 'playTime', name: 'Play Time', type: 'duration' },
];

const statsEngine = new StatisticsEngine(stats);

// Start session
statsEngine.startSession();

// Track stats
statsEngine.setStat('score', 1000);
statsEngine.incrementStat('hits', 1);

// End session
const session = statsEngine.endSession();

// Get aggregates
const aggregate = statsEngine.getAggregateStats('score');
console.log('Average score:', aggregate.avg);
console.log('Best score:', aggregate.max);
```

## Rendering Strategies

### Canvas Rendering

```typescript
import { CanvasRenderingStrategy } from '../engine';

const canvasStrategy = new CanvasRenderingStrategy(800, 600, {
  backgroundColor: '#000000',
  antialias: false,
});

// Initialize with container
canvasStrategy.initialize(container);

// In your render method
protected render(context: RenderContext): void {
  const ctx = context.ctx;
  if (!ctx) return;

  // Draw using canvas API
  ctx.fillStyle = '#ff0000';
  ctx.fillRect(x, y, width, height);
}
```

### React Component Rendering

```typescript
import { ReactRenderingStrategy } from '../engine';

const reactStrategy = new ReactRenderingStrategy();

// Set render callback
reactStrategy.setRenderCallback((gameState) => {
  return (
    <div>
      <Board grid={gameState.grid} />
      <Score value={gameState.score} />
    </div>
  );
});
```

## Shared UI Components

### GameContainer

```typescript
import { GameContainer } from '../components/shared';

<GameContainer
  title="My Game"
  score={score}
  isPlaying={isPlaying}
  isPaused={isPaused}
  isGameOver={isGameOver}
  stats={[
    { label: 'Level', value: level },
    { label: 'Lives', value: lives },
  ]}
  onStart={handleStart}
  onPause={handlePause}
  onResume={handleResume}
  onReset={handleReset}
>
  {/* Your game content */}
</GameContainer>
```

### GameOverModal

```typescript
import { GameOverModal } from '../components/shared';

<GameOverModal
  open={isGameOver}
  score={score}
  highScore={highScore}
  isNewHighScore={isNewHighScore}
  stats={[
    { label: 'Time', value: formatTime(time), icon: <Clock /> },
    { label: 'Accuracy', value: `${accuracy}%`, icon: <Target /> },
  ]}
  achievements={unlockedAchievements}
  onPlayAgain={handlePlayAgain}
  onGoHome={handleGoHome}
/>
```

### LeaderboardTable

```typescript
import { LeaderboardTable } from '../components/shared';

<LeaderboardTable
  entries={leaderboardData}
  currentUserRank={userRank}
  title="Top Players"
  showTimeColumn
  showDateColumn
/>
```

### Achievement Toast

```typescript
import { useAchievementToast } from '../components/shared';

const { showAchievement, ToastContainer } = useAchievementToast();

// Show achievement
showAchievement(achievement);

// Render container
<ToastContainer />
```

## Best Practices

### 1. State Management

- Keep game state immutable
- Use snapshots for undo/redo
- Persist important state to localStorage
- Separate game logic from rendering

### 2. Performance

- Target 60 FPS for smooth gameplay
- Use requestAnimationFrame for game loop
- Implement object pooling for frequently created objects
- Optimize rendering (only redraw what changed)

### 3. Input Handling

- Support multiple input methods (keyboard, touch, gamepad)
- Implement proper key repeat for continuous actions
- Debounce/throttle intensive operations
- Handle edge cases (window blur, etc.)

### 4. Achievements

- Make achievements meaningful and fun
- Balance difficulty (easy, medium, hard)
- Provide visual feedback on unlock
- Track progress towards achievements

### 5. Multiplayer

- Implement proper state synchronization
- Handle network latency gracefully
- Provide feedback for all player actions
- Support host migration

## Examples

See the `/tetris` and `/dino` directories for complete game implementations using this engine.

## API Reference

See type definitions in `core/types.ts` for complete API documentation.

## Contributing

When adding new games:

1. Extend `GameEngine<YourGameState>`
2. Implement required abstract methods
3. Register game in `config/registry.ts`
4. Add routes in `/routes`
5. Update documentation

## License

Part of the Geenius System project.
