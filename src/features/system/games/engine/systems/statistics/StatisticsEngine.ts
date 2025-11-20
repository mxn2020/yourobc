/**
 * Statistics Engine
 *
 * Advanced statistics tracking and analysis for games
 * Features:
 * - Custom metric definitions
 * - Aggregate statistics (avg, min, max, total)
 * - Session tracking
 * - Historical data
 * - Performance metrics
 */

import type { GameStatistic } from '../../core/types';

export interface StatisticValue {
  key: string;
  value: number;
  timestamp: number;
}

export interface AggregateStats {
  count: number;
  sum: number;
  avg: number;
  min: number;
  max: number;
  latest: number;
}

export interface SessionStats {
  sessionId: string;
  startTime: number;
  endTime?: number;
  duration: number;
  stats: Map<string, number>;
}

export class StatisticsEngine {
  private statistics: Map<string, GameStatistic> = new Map();
  private currentValues: Map<string, number> = new Map();
  private history: Map<string, StatisticValue[]> = new Map();
  private sessions: SessionStats[] = [];
  private currentSession: SessionStats | null = null;

  constructor(statistics: GameStatistic[] = []) {
    this.registerStatistics(statistics);
  }

  /**
   * Register statistics definitions
   */
  public registerStatistics(statistics: GameStatistic[]): void {
    for (const stat of statistics) {
      this.statistics.set(stat.key, stat);

      if (!this.currentValues.has(stat.key)) {
        this.currentValues.set(stat.key, 0);
      }

      if (!this.history.has(stat.key)) {
        this.history.set(stat.key, []);
      }
    }
  }

  /**
   * Register a single statistic
   */
  public registerStatistic(statistic: GameStatistic): void {
    this.statistics.set(statistic.key, statistic);

    if (!this.currentValues.has(statistic.key)) {
      this.currentValues.set(statistic.key, 0);
    }

    if (!this.history.has(statistic.key)) {
      this.history.set(statistic.key, []);
    }
  }

  /**
   * Start a new statistics session
   */
  public startSession(): string {
    const sessionId = this.generateSessionId();

    this.currentSession = {
      sessionId,
      startTime: Date.now(),
      duration: 0,
      stats: new Map(),
    };

    return sessionId;
  }

  /**
   * End the current session
   */
  public endSession(): SessionStats | null {
    if (!this.currentSession) {
      return null;
    }

    this.currentSession.endTime = Date.now();
    this.currentSession.duration = this.currentSession.endTime - this.currentSession.startTime;

    // Save final stat values
    for (const [key, value] of this.currentValues.entries()) {
      this.currentSession.stats.set(key, value);
    }

    this.sessions.push(this.currentSession);

    const session = this.currentSession;
    this.currentSession = null;

    return session;
  }

  /**
   * Set a statistic value
   */
  public setStat(key: string, value: number): void {
    this.currentValues.set(key, value);

    // Add to history
    const historyItem: StatisticValue = {
      key,
      value,
      timestamp: Date.now(),
    };

    const history = this.history.get(key);
    if (history) {
      history.push(historyItem);

      // Limit history size (keep last 1000 values)
      if (history.length > 1000) {
        history.shift();
      }
    }

    // Update session stats
    if (this.currentSession) {
      this.currentSession.stats.set(key, value);
    }
  }

  /**
   * Increment a statistic
   */
  public incrementStat(key: string, amount: number = 1): void {
    const current = this.currentValues.get(key) || 0;
    this.setStat(key, current + amount);
  }

  /**
   * Decrement a statistic
   */
  public decrementStat(key: string, amount: number = 1): void {
    const current = this.currentValues.get(key) || 0;
    this.setStat(key, Math.max(0, current - amount));
  }

  /**
   * Get current value of a statistic
   */
  public getStat(key: string): number {
    return this.currentValues.get(key) || 0;
  }

  /**
   * Get statistic definition
   */
  public getStatistic(key: string): GameStatistic | undefined {
    return this.statistics.get(key);
  }

  /**
   * Get all statistics
   */
  public getAllStatistics(): GameStatistic[] {
    return Array.from(this.statistics.values());
  }

  /**
   * Get all current values
   */
  public getAllValues(): Map<string, number> {
    return new Map(this.currentValues);
  }

  /**
   * Get formatted value
   */
  public getFormattedValue(key: string): string {
    const stat = this.statistics.get(key);
    const value = this.currentValues.get(key) || 0;

    if (!stat) {
      return value.toString();
    }

    if (stat.format) {
      return stat.format(value);
    }

    switch (stat.type) {
      case 'duration':
        return this.formatDuration(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'count':
        return value.toLocaleString();
      case 'number':
      default:
        return value.toLocaleString();
    }
  }

  /**
   * Get aggregate statistics for a key
   */
  public getAggregateStats(key: string): AggregateStats | null {
    const history = this.history.get(key);

    if (!history || history.length === 0) {
      return null;
    }

    const values = history.map(h => h.value);

    return {
      count: values.length,
      sum: values.reduce((a, b) => a + b, 0),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      latest: values[values.length - 1],
    };
  }

  /**
   * Get history for a statistic
   */
  public getHistory(key: string, limit?: number): StatisticValue[] {
    const history = this.history.get(key) || [];

    if (limit) {
      return history.slice(-limit);
    }

    return [...history];
  }

  /**
   * Get all sessions
   */
  public getSessions(): SessionStats[] {
    return [...this.sessions];
  }

  /**
   * Get current session
   */
  public getCurrentSession(): SessionStats | null {
    return this.currentSession;
  }

  /**
   * Get session by ID
   */
  public getSession(sessionId: string): SessionStats | undefined {
    return this.sessions.find(s => s.sessionId === sessionId);
  }

  /**
   * Calculate trend (positive/negative/stable)
   */
  public getTrend(key: string, samples: number = 10): 'up' | 'down' | 'stable' {
    const history = this.getHistory(key, samples);

    if (history.length < 2) {
      return 'stable';
    }

    const firstHalf = history.slice(0, Math.floor(history.length / 2));
    const secondHalf = history.slice(Math.floor(history.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b.value, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b.value, 0) / secondHalf.length;

    const diff = secondAvg - firstAvg;
    const threshold = firstAvg * 0.05; // 5% threshold

    if (diff > threshold) return 'up';
    if (diff < -threshold) return 'down';
    return 'stable';
  }

  /**
   * Get personal best
   */
  public getPersonalBest(key: string): number | null {
    const aggregate = this.getAggregateStats(key);
    return aggregate ? aggregate.max : null;
  }

  /**
   * Reset all statistics
   */
  public reset(): void {
    for (const key of this.currentValues.keys()) {
      this.currentValues.set(key, 0);
    }
  }

  /**
   * Clear history
   */
  public clearHistory(key?: string): void {
    if (key) {
      this.history.set(key, []);
    } else {
      for (const key of this.history.keys()) {
        this.history.set(key, []);
      }
    }
  }

  /**
   * Clear sessions
   */
  public clearSessions(): void {
    this.sessions = [];
  }

  /**
   * Export statistics
   */
  public export(): {
    current: Record<string, number>;
    history: Record<string, StatisticValue[]>;
    sessions: SessionStats[];
  } {
    return {
      current: Object.fromEntries(this.currentValues),
      history: Object.fromEntries(this.history),
      sessions: this.sessions,
    };
  }

  /**
   * Import statistics
   */
  public import(data: {
    current?: Record<string, number>;
    history?: Record<string, StatisticValue[]>;
    sessions?: SessionStats[];
  }): void {
    if (data.current) {
      this.currentValues = new Map(Object.entries(data.current));
    }

    if (data.history) {
      this.history = new Map(Object.entries(data.history));
    }

    if (data.sessions) {
      this.sessions = data.sessions;
    }
  }

  /**
   * Get summary statistics
   */
  public getSummary(): {
    totalSessions: number;
    totalPlayTime: number;
    averageSessionDuration: number;
    statistics: Array<{
      key: string;
      name: string;
      currentValue: number;
      formattedValue: string;
      personalBest: number | null;
      trend: 'up' | 'down' | 'stable';
    }>;
  } {
    const totalSessions = this.sessions.length;
    const totalPlayTime = this.sessions.reduce((sum, s) => sum + s.duration, 0);
    const averageSessionDuration = totalSessions > 0 ? totalPlayTime / totalSessions : 0;

    const statistics = Array.from(this.statistics.values()).map(stat => ({
      key: stat.key,
      name: stat.name,
      currentValue: this.getStat(stat.key),
      formattedValue: this.getFormattedValue(stat.key),
      personalBest: this.getPersonalBest(stat.key),
      trend: this.getTrend(stat.key),
    }));

    return {
      totalSessions,
      totalPlayTime,
      averageSessionDuration,
      statistics,
    };
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Format duration (ms to human readable)
   */
  private formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }
}
