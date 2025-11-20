/**
 * Game Registry
 *
 * Central registration system for all games in the platform
 */

import type { GameMetadata } from '../engine';
import type { ComponentType } from 'react';

export interface RegisteredGame extends GameMetadata {
  /** React component for the game */
  component: ComponentType<any>;
  /** Route path */
  path: string;
  /** Thumbnail/cover image */
  thumbnail?: string;
  /** Color theme */
  theme?: {
    primary: string;
    secondary: string;
  };
  /** Is the game currently available */
  isActive: boolean;
  /** Beta/experimental flag */
  isBeta?: boolean;
  /** Order in the lobby */
  order: number;
}

class GameRegistry {
  private games: Map<string, RegisteredGame> = new Map();

  /**
   * Register a game
   */
  register(game: RegisteredGame): void {
    if (this.games.has(game.id)) {
      console.warn(`[GameRegistry] Game ${game.id} is already registered`);
      return;
    }

    this.games.set(game.id, game);
  }

  /**
   * Unregister a game
   */
  unregister(gameId: string): void {
    this.games.delete(gameId);
  }

  /**
   * Get a game by ID
   */
  getGame(gameId: string): RegisteredGame | undefined {
    return this.games.get(gameId);
  }

  /**
   * Get all games
   */
  getAllGames(): RegisteredGame[] {
    return Array.from(this.games.values()).sort((a, b) => a.order - b.order);
  }

  /**
   * Get active games only
   */
  getActiveGames(): RegisteredGame[] {
    return this.getAllGames().filter(game => game.isActive);
  }

  /**
   * Get games by category
   */
  getGamesByCategory(category: string): RegisteredGame[] {
    return this.getActiveGames().filter(game => game.category === category);
  }

  /**
   * Get games by feature
   */
  getGamesByFeature(feature: keyof RegisteredGame['features']): RegisteredGame[] {
    return this.getActiveGames().filter(game => game.features[feature]);
  }

  /**
   * Get all categories
   */
  getCategories(): string[] {
    const categories = new Set<string>();
    this.getAllGames().forEach(game => categories.add(game.category));
    return Array.from(categories).sort();
  }

  /**
   * Search games
   */
  searchGames(query: string): RegisteredGame[] {
    const lowerQuery = query.toLowerCase();

    return this.getActiveGames().filter(
      game =>
        game.name.toLowerCase().includes(lowerQuery) ||
        game.description.toLowerCase().includes(lowerQuery) ||
        game.category.toLowerCase().includes(lowerQuery) ||
        game.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Check if game exists
   */
  hasGame(gameId: string): boolean {
    return this.games.has(gameId);
  }

  /**
   * Get game count
   */
  getGameCount(): number {
    return this.games.size;
  }
}

// Singleton instance
export const gameRegistry = new GameRegistry();

/**
 * Helper function to register a game
 */
export function registerGame(game: RegisteredGame): void {
  gameRegistry.register(game);
}

/**
 * Helper function to get all games
 */
export function getAllGames(): RegisteredGame[] {
  return gameRegistry.getAllGames();
}

/**
 * Helper function to get active games
 */
export function getActiveGames(): RegisteredGame[] {
  return gameRegistry.getActiveGames();
}

/**
 * Helper function to get a game
 */
export function getGame(gameId: string): RegisteredGame | undefined {
  return gameRegistry.getGame(gameId);
}
