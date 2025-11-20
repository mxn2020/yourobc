/**
 * Achievement Engine
 *
 * Generic achievement system that can be used by any game
 * Features:
 * - Achievement definitions and validation
 * - Progress tracking
 * - Unlock notifications
 * - Hidden achievements
 * - Achievement categories
 * - Points system
 */

import type { Achievement } from '../../core/types';

export interface AchievementProgress {
  achievementId: string;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedAt?: number;
}

export interface UnlockedAchievement {
  achievement: Achievement;
  timestamp: number;
  gameState?: any;
}

type AchievementUnlockCallback = (achievement: Achievement) => void;

export class AchievementEngine {
  private achievements: Map<string, Achievement> = new Map();
  private progress: Map<string, AchievementProgress> = new Map();
  private unlocked: Set<string> = new Set();
  private callbacks: Set<AchievementUnlockCallback> = new Set();

  constructor(achievements: Achievement[] = []) {
    this.registerAchievements(achievements);
  }

  /**
   * Register achievements
   */
  public registerAchievements(achievements: Achievement[]): void {
    for (const achievement of achievements) {
      this.achievements.set(achievement.id, achievement);

      // Initialize progress if not exists
      if (!this.progress.has(achievement.id)) {
        this.progress.set(achievement.id, {
          achievementId: achievement.id,
          progress: 0,
          maxProgress: 1,
          unlocked: false,
        });
      }
    }
  }

  /**
   * Register a single achievement
   */
  public registerAchievement(achievement: Achievement): void {
    this.achievements.set(achievement.id, achievement);

    if (!this.progress.has(achievement.id)) {
      this.progress.set(achievement.id, {
        achievementId: achievement.id,
        progress: 0,
        maxProgress: 1,
        unlocked: false,
      });
    }
  }

  /**
   * Check achievements against current game state
   */
  public checkAchievements(gameState: any, gameStats: any): UnlockedAchievement[] {
    const newlyUnlocked: UnlockedAchievement[] = [];

    for (const [id, achievement] of this.achievements.entries()) {
      // Skip if already unlocked
      if (this.unlocked.has(id)) {
        continue;
      }

      // Validate achievement
      let isUnlocked = false;

      if (achievement.validate) {
        try {
          isUnlocked = achievement.validate(gameState, gameStats);
        } catch (error) {
          console.error(`[AchievementEngine] Error validating achievement ${id}:`, error);
          continue;
        }
      }

      if (isUnlocked) {
        this.unlock(id, gameState);
        newlyUnlocked.push({
          achievement,
          timestamp: Date.now(),
          gameState,
        });
      }
    }

    return newlyUnlocked;
  }

  /**
   * Unlock an achievement
   */
  public unlock(achievementId: string, gameState?: any): boolean {
    if (this.unlocked.has(achievementId)) {
      return false; // Already unlocked
    }

    const achievement = this.achievements.get(achievementId);
    if (!achievement) {
      console.warn(`[AchievementEngine] Achievement not found: ${achievementId}`);
      return false;
    }

    const timestamp = Date.now();
    this.unlocked.add(achievementId);

    // Update progress
    const progress = this.progress.get(achievementId);
    if (progress) {
      progress.unlocked = true;
      progress.unlockedAt = timestamp;
      progress.progress = progress.maxProgress;
    }

    // Notify callbacks
    this.callbacks.forEach(callback => {
      try {
        callback(achievement);
      } catch (error) {
        console.error('[AchievementEngine] Error in unlock callback:', error);
      }
    });

    return true;
  }

  /**
   * Set progress for an achievement
   */
  public setProgress(achievementId: string, progress: number, maxProgress: number = 1): void {
    const existing = this.progress.get(achievementId);

    if (existing) {
      existing.progress = progress;
      existing.maxProgress = maxProgress;

      // Auto-unlock if progress is complete
      if (progress >= maxProgress && !existing.unlocked) {
        this.unlock(achievementId);
      }
    } else {
      this.progress.set(achievementId, {
        achievementId,
        progress,
        maxProgress,
        unlocked: false,
      });
    }
  }

  /**
   * Increment progress for an achievement
   */
  public incrementProgress(achievementId: string, amount: number = 1): void {
    const existing = this.progress.get(achievementId);

    if (existing) {
      existing.progress = Math.min(existing.progress + amount, existing.maxProgress);

      // Auto-unlock if progress is complete
      if (existing.progress >= existing.maxProgress && !existing.unlocked) {
        this.unlock(achievementId);
      }
    }
  }

  /**
   * Get achievement by ID
   */
  public getAchievement(achievementId: string): Achievement | undefined {
    return this.achievements.get(achievementId);
  }

  /**
   * Get all achievements
   */
  public getAllAchievements(includeHidden: boolean = false): Achievement[] {
    const all = Array.from(this.achievements.values());

    if (includeHidden) {
      return all;
    }

    // Filter out hidden achievements that aren't unlocked
    return all.filter(a => !a.hidden || this.isUnlocked(a.id));
  }

  /**
   * Get achievements by category
   */
  public getAchievementsByCategory(category: string): Achievement[] {
    return Array.from(this.achievements.values()).filter(a => a.category === category);
  }

  /**
   * Get unlocked achievements
   */
  public getUnlockedAchievements(): Achievement[] {
    return Array.from(this.unlocked)
      .map(id => this.achievements.get(id))
      .filter(a => a !== undefined) as Achievement[];
  }

  /**
   * Get locked achievements
   */
  public getLockedAchievements(includeHidden: boolean = false): Achievement[] {
    const locked = Array.from(this.achievements.values()).filter(a => !this.unlocked.has(a.id));

    if (includeHidden) {
      return locked;
    }

    return locked.filter(a => !a.hidden);
  }

  /**
   * Check if achievement is unlocked
   */
  public isUnlocked(achievementId: string): boolean {
    return this.unlocked.has(achievementId);
  }

  /**
   * Get progress for an achievement
   */
  public getProgress(achievementId: string): AchievementProgress | undefined {
    return this.progress.get(achievementId);
  }

  /**
   * Get all progress
   */
  public getAllProgress(): AchievementProgress[] {
    return Array.from(this.progress.values());
  }

  /**
   * Get completion percentage
   */
  public getCompletionPercentage(): number {
    const total = this.achievements.size;
    if (total === 0) return 0;

    const unlocked = this.unlocked.size;
    return (unlocked / total) * 100;
  }

  /**
   * Get total points earned
   */
  public getTotalPoints(): number {
    let total = 0;

    for (const achievementId of this.unlocked) {
      const achievement = this.achievements.get(achievementId);
      if (achievement) {
        total += achievement.points;
      }
    }

    return total;
  }

  /**
   * Get maximum possible points
   */
  public getMaxPoints(): number {
    let total = 0;

    for (const achievement of this.achievements.values()) {
      total += achievement.points;
    }

    return total;
  }

  /**
   * Register unlock callback
   */
  public onUnlock(callback: AchievementUnlockCallback): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  /**
   * Reset all achievements
   */
  public reset(): void {
    this.unlocked.clear();

    for (const [id, progress] of this.progress.entries()) {
      progress.progress = 0;
      progress.unlocked = false;
      delete progress.unlockedAt;
    }
  }

  /**
   * Export achievement state
   */
  public export(): {
    unlocked: string[];
    progress: AchievementProgress[];
  } {
    return {
      unlocked: Array.from(this.unlocked),
      progress: Array.from(this.progress.values()),
    };
  }

  /**
   * Import achievement state
   */
  public import(data: { unlocked: string[]; progress: AchievementProgress[] }): void {
    this.unlocked = new Set(data.unlocked);

    for (const p of data.progress) {
      this.progress.set(p.achievementId, p);
    }
  }

  /**
   * Get achievement statistics
   */
  public getStats(): {
    total: number;
    unlocked: number;
    locked: number;
    hidden: number;
    completionPercentage: number;
    totalPoints: number;
    maxPoints: number;
    categories: Map<string, number>;
  } {
    const categories = new Map<string, number>();
    let hidden = 0;

    for (const achievement of this.achievements.values()) {
      if (achievement.hidden) {
        hidden++;
      }

      if (achievement.category) {
        const count = categories.get(achievement.category) || 0;
        categories.set(achievement.category, count + 1);
      }
    }

    return {
      total: this.achievements.size,
      unlocked: this.unlocked.size,
      locked: this.achievements.size - this.unlocked.size,
      hidden,
      completionPercentage: this.getCompletionPercentage(),
      totalPoints: this.getTotalPoints(),
      maxPoints: this.getMaxPoints(),
      categories,
    };
  }
}
