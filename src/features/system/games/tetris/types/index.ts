// src/features/boilerplate/tetris/types/index.ts

import type { Id } from '@/convex/_generated/dataModel';

export interface Piece {
  type: number;
  x: number;
  y: number;
  rotation: number;
}

export interface GameState {
  board: (number | null)[][];
  currentPiece: Piece | null;
  nextPieces: number[];
  holdPiece: number | null;
  canHold: boolean;
  score: number;
  lines: number;
  level: number;
  combo: number;
  fallSpeed: number;
  lastMoveTime: number;
  isGameOver: boolean;
  isPaused: boolean;
}

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface TetrisGame {
  _id: Id<'tetrisGames'>;
  publicId: string;
  userId: Id<'userProfiles'>;
  difficulty: Difficulty;
  status: string;
  gameState?: string;
  score: number;
  level: number;
  lines: number;
  duration: number;
  piecesPlaced: number;
  singleLines: number;
  doubleLines: number;
  tripleLines: number;
  tetrisLines: number;
  maxCombo: number;
  startedAt: number;
  pausedAt?: number;
  completedAt?: number;
  lastActivityAt: number;
  hasReplay: boolean;
  _creationTime: number;
}

export interface TetrisHighScore {
  _id: Id<'tetrisHighScores'>;
  userId: Id<'userProfiles'>;
  gameId: Id<'tetrisGames'>;
  score: number;
  level: number;
  lines: number;
  difficulty: Difficulty;
  duration: number;
  piecesPlaced: number;
  tetrisLines: number;
  maxCombo: number;
  achievedAt: number;
  _creationTime: number;
}

export interface TetrisStatistics {
  _id: Id<'tetrisStatistics'>;
  userId: Id<'userProfiles'>;
  soloGamesPlayed: number;
  soloGamesCompleted: number;
  soloGamesAbandoned: number;
  totalPlayTime: number;
  highScores: Record<string, number>;
  totalScore: number;
  totalLines: number;
  highestLevel: number;
  longestGame: number;
  totalPiecesPlaced: number;
  totalSingleLines: number;
  totalDoubleLines: number;
  totalTripleLines: number;
  totalTetrisLines: number;
  highestCombo: number;
  pieceStats: {
    I: number;
    O: number;
    T: number;
    S: number;
    Z: number;
    J: number;
    L: number;
  };
  multiplayerGamesPlayed: number;
  multiplayerWins: number;
  multiplayerLosses: number;
  totalGarbageSent: number;
  totalGarbageReceived: number;
  currentWinStreak: number;
  longestWinStreak: number;
  currentPlayStreak: number;
  longestPlayStreak: number;
  lastPlayedAt?: number;
  lastSoloGameAt?: number;
  lastMultiplayerGameAt?: number;
  _creationTime: number;
}

export interface LeaderboardEntry {
  userId: string;
  userName?: string;
  userAvatar?: string;
  score: number;
  level: number;
  lines: number;
  difficulty: string;
  achievedAt: number;
  rank: number;
}

export interface Achievement {
  _id: Id<'tetrisAchievements'>;
  achievementKey: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  points: number;
  requirement: {
    type: string;
    value: number;
    difficulty?: Difficulty;
  };
  order: number;
  isSecret: boolean;
  _creationTime: number;
}

export interface AchievementWithStatus extends Achievement {
  isUnlocked: boolean;
  unlockedAt?: number;
  progress?: number;
}

export interface TetrisMatch {
  _id: Id<'tetrisMatches'>;
  publicId: string;
  roomCode: string;
  hostUserId: Id<'userProfiles'>;
  maxPlayers: number;
  difficulty: Difficulty;
  settings: {
    enableGarbage: boolean;
    startLevel: number;
    targetScore?: number;
    timeLimit?: number;
    ranked: boolean;
  };
  status: string;
  currentPlayers: number;
  winnerId?: Id<'userProfiles'>;
  startedAt?: number;
  completedAt?: number;
  _creationTime: number;
}

export interface MatchParticipant {
  _id: Id<'tetrisMatchParticipants'>;
  matchId: Id<'tetrisMatches'>;
  userId: Id<'userProfiles'>;
  status: string;
  position: number;
  currentGameState?: string;
  finalScore?: number;
  finalLevel?: number;
  finalLines?: number;
  placement?: number;
  piecesPlaced?: number;
  garbageSent?: number;
  garbageReceived?: number;
  maxCombo?: number;
  joinedAt: number;
  readyAt?: number;
  startedAt?: number;
  finishedAt?: number;
  lastUpdateAt: number;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  _creationTime: number;
}

export interface MatchWithParticipants extends TetrisMatch {
  participants: MatchParticipant[];
}

export interface GameStats {
  piecesPlaced: number;
  singleLines: number;
  doubleLines: number;
  tripleLines: number;
  tetrisLines: number;
  maxCombo: number;
}
