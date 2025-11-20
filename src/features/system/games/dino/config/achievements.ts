/**
 * Dino Jump Achievements
 *
 * Achievement definitions for the Dino Jump game
 */

import type { Achievement } from '../../engine';

export const dinoAchievements: Achievement[] = [
  {
    id: 'first_jump',
    name: 'First Leap',
    description: 'Complete your first jump',
    category: 'beginner',
    points: 5,
    icon: '🦖',
    condition: (gameState: any) => {
      return gameState.obstaclesJumped >= 1;
    },
  },
  {
    id: 'score_100',
    name: 'Century Runner',
    description: 'Score 100 points',
    category: 'score',
    points: 10,
    icon: '💯',
    condition: (gameState: any) => {
      return gameState.score >= 100;
    },
  },
  {
    id: 'score_500',
    name: 'Half Millennium',
    description: 'Score 500 points',
    category: 'score',
    points: 25,
    icon: '⭐',
    condition: (gameState: any) => {
      return gameState.score >= 500;
    },
  },
  {
    id: 'score_1000',
    name: 'Millennium Runner',
    description: 'Score 1000 points',
    category: 'score',
    points: 50,
    icon: '🌟',
    condition: (gameState: any) => {
      return gameState.score >= 1000;
    },
  },
  {
    id: 'perfect_10',
    name: 'Perfect Timing',
    description: 'Get 10 perfect jumps in one game',
    category: 'skill',
    points: 30,
    icon: '🎯',
    condition: (gameState: any) => {
      return gameState.perfectJumps >= 10;
    },
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Reach maximum speed',
    category: 'speed',
    points: 40,
    icon: '⚡',
    condition: (gameState: any) => {
      return gameState.speed >= gameState.config.maxSpeed;
    },
  },
  {
    id: 'marathon_runner',
    name: 'Marathon Runner',
    description: 'Play for 5 minutes straight',
    category: 'endurance',
    points: 35,
    icon: '🏃',
    condition: (gameState: any) => {
      return gameState.timePlayedMs >= 5 * 60 * 1000; // 5 minutes
    },
  },
  {
    id: 'obstacle_master',
    name: 'Obstacle Master',
    description: 'Jump 100 obstacles',
    category: 'obstacles',
    points: 20,
    icon: '🚧',
    condition: (gameState: any) => {
      return gameState.obstaclesJumped >= 100;
    },
  },
  {
    id: 'close_call',
    name: 'Living on the Edge',
    description: 'Get 20 near misses in one game',
    category: 'skill',
    points: 25,
    icon: '😱',
    condition: (gameState: any) => {
      return gameState.nearMisses >= 20;
    },
  },
  {
    id: 'survivor',
    name: 'Survivor',
    description: 'Complete 5 games in a row',
    category: 'streak',
    points: 30,
    icon: '💪',
    // This one needs to track across multiple games
    // Will be checked differently
    condition: () => false, // Handled separately
  },
];
