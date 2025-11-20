/**
 * Game Engine - Public API
 *
 * Unified game engine for all games in the platform
 */

// Core
export { GameEngine } from './core/GameEngine';
export * from './core/types';

// Rendering
export {
  RenderingStrategy,
  CanvasRenderingStrategy,
  ReactRenderingStrategy,
  WebGLRenderingStrategy,
} from './rendering/RenderingStrategy';

// Input
export { InputManager } from './input/InputManager';

// State
export { StateManager } from './state/StateManager';

// Systems
export { AchievementEngine } from './systems/achievements/AchievementEngine';
export type {
  AchievementProgress,
  UnlockedAchievement,
} from './systems/achievements/AchievementEngine';

export { ReplayEngine } from './systems/replays/ReplayEngine';
export type {
  ReplayConfig,
  RecordingSession,
  PlaybackSession,
} from './systems/replays/ReplayEngine';

export { MultiplayerEngine } from './systems/multiplayer/MultiplayerEngine';
export type {
  MultiplayerConfig,
  RoomState,
} from './systems/multiplayer/MultiplayerEngine';

export { StatisticsEngine } from './systems/statistics/StatisticsEngine';
export type {
  StatisticValue,
  AggregateStats,
  SessionStats,
} from './systems/statistics/StatisticsEngine';
