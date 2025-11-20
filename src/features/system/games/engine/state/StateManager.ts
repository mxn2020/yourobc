/**
 * State Manager
 *
 * Handles game state persistence, serialization, and hydration
 * Supports:
 * - Local storage persistence
 * - State snapshots for undo/redo
 * - State compression
 * - Version migration
 */

import type { BaseGameState } from '../core/types';

interface StateSnapshot<T> {
  version: string;
  timestamp: number;
  state: T;
  compressed?: boolean;
}

interface StateManagerConfig {
  /** Storage key prefix */
  storagePrefix: string;
  /** Enable localStorage persistence */
  enablePersistence: boolean;
  /** Maximum snapshot history */
  maxSnapshots?: number;
  /** Enable state compression */
  enableCompression?: boolean;
  /** Current state version */
  version: string;
}

export class StateManager<TGameState extends BaseGameState = BaseGameState> {
  private config: StateManagerConfig;
  private snapshots: StateSnapshot<TGameState>[] = [];
  private currentSnapshotIndex: number = -1;

  constructor(config: StateManagerConfig) {
    this.config = {
      maxSnapshots: 50,
      enableCompression: false,
      ...config,
    };
  }

  /**
   * Save current state
   */
  public saveState(gameId: string, state: TGameState): void {
    if (!this.config.enablePersistence) return;

    const snapshot: StateSnapshot<TGameState> = {
      version: this.config.version,
      timestamp: Date.now(),
      state,
      compressed: false,
    };

    const key = this.getStorageKey(gameId);

    try {
      const serialized = JSON.stringify(snapshot);
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.error('[StateManager] Failed to save state:', error);
    }
  }

  /**
   * Load saved state
   */
  public loadState(gameId: string): TGameState | null {
    if (!this.config.enablePersistence) return null;

    const key = this.getStorageKey(gameId);

    try {
      const serialized = localStorage.getItem(key);
      if (!serialized) return null;

      const snapshot: StateSnapshot<TGameState> = JSON.parse(serialized);

      // Check version compatibility
      if (snapshot.version !== this.config.version) {
        console.warn('[StateManager] State version mismatch, attempting migration');
        const migrated = this.migrateState(snapshot);
        if (migrated) {
          return migrated.state;
        }
        return null;
      }

      return snapshot.state;
    } catch (error) {
      console.error('[StateManager] Failed to load state:', error);
      return null;
    }
  }

  /**
   * Clear saved state
   */
  public clearState(gameId: string): void {
    const key = this.getStorageKey(gameId);
    localStorage.removeItem(key);
  }

  /**
   * Check if saved state exists
   */
  public hasSavedState(gameId: string): boolean {
    const key = this.getStorageKey(gameId);
    return localStorage.getItem(key) !== null;
  }

  /**
   * Create a snapshot (for undo/redo)
   */
  public createSnapshot(state: TGameState): void {
    const snapshot: StateSnapshot<TGameState> = {
      version: this.config.version,
      timestamp: Date.now(),
      state: this.cloneState(state),
    };

    // Remove any snapshots after current index
    if (this.currentSnapshotIndex < this.snapshots.length - 1) {
      this.snapshots = this.snapshots.slice(0, this.currentSnapshotIndex + 1);
    }

    // Add new snapshot
    this.snapshots.push(snapshot);
    this.currentSnapshotIndex = this.snapshots.length - 1;

    // Limit snapshot history
    if (this.snapshots.length > (this.config.maxSnapshots ?? 50)) {
      this.snapshots.shift();
      this.currentSnapshotIndex--;
    }
  }

  /**
   * Undo to previous state
   */
  public undo(): TGameState | null {
    if (this.currentSnapshotIndex <= 0) {
      return null;
    }

    this.currentSnapshotIndex--;
    return this.cloneState(this.snapshots[this.currentSnapshotIndex].state);
  }

  /**
   * Redo to next state
   */
  public redo(): TGameState | null {
    if (this.currentSnapshotIndex >= this.snapshots.length - 1) {
      return null;
    }

    this.currentSnapshotIndex++;
    return this.cloneState(this.snapshots[this.currentSnapshotIndex].state);
  }

  /**
   * Check if can undo
   */
  public canUndo(): boolean {
    return this.currentSnapshotIndex > 0;
  }

  /**
   * Check if can redo
   */
  public canRedo(): boolean {
    return this.currentSnapshotIndex < this.snapshots.length - 1;
  }

  /**
   * Clear snapshot history
   */
  public clearSnapshots(): void {
    this.snapshots = [];
    this.currentSnapshotIndex = -1;
  }

  /**
   * Get snapshot count
   */
  public getSnapshotCount(): number {
    return this.snapshots.length;
  }

  /**
   * Export state as JSON
   */
  public exportState(state: TGameState): string {
    const snapshot: StateSnapshot<TGameState> = {
      version: this.config.version,
      timestamp: Date.now(),
      state,
    };

    return JSON.stringify(snapshot, null, 2);
  }

  /**
   * Import state from JSON
   */
  public importState(json: string): TGameState | null {
    try {
      const snapshot: StateSnapshot<TGameState> = JSON.parse(json);

      if (snapshot.version !== this.config.version) {
        console.warn('[StateManager] Imported state version mismatch');
        const migrated = this.migrateState(snapshot);
        if (migrated) {
          return migrated.state;
        }
        return null;
      }

      return snapshot.state;
    } catch (error) {
      console.error('[StateManager] Failed to import state:', error);
      return null;
    }
  }

  /**
   * Deep clone state
   */
  private cloneState(state: TGameState): TGameState {
    return JSON.parse(JSON.stringify(state));
  }

  /**
   * Get storage key
   */
  private getStorageKey(gameId: string): string {
    return `${this.config.storagePrefix}:${gameId}:state`;
  }

  /**
   * Migrate state from older version (to be implemented by games)
   */
  private migrateState(snapshot: StateSnapshot<TGameState>): StateSnapshot<TGameState> | null {
    // Games can override this method to handle version migrations
    console.warn('[StateManager] No migration handler, returning null');
    return null;
  }

  /**
   * Compress state (placeholder for future implementation)
   */
  private compressState(state: TGameState): string {
    // TODO: Implement compression (e.g., using pako or similar)
    return JSON.stringify(state);
  }

  /**
   * Decompress state (placeholder for future implementation)
   */
  private decompressState(compressed: string): TGameState {
    // TODO: Implement decompression
    return JSON.parse(compressed);
  }

  /**
   * Get all saved games for a user
   */
  public getAllSavedGames(): Array<{ gameId: string; timestamp: number }> {
    const savedGames: Array<{ gameId: string; timestamp: number }> = [];
    const prefix = this.config.storagePrefix;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        try {
          const value = localStorage.getItem(key);
          if (value) {
            const snapshot: StateSnapshot<TGameState> = JSON.parse(value);
            const gameId = key.replace(`${prefix}:`, '').replace(':state', '');
            savedGames.push({
              gameId,
              timestamp: snapshot.timestamp,
            });
          }
        } catch (error) {
          console.error('[StateManager] Failed to parse saved game:', key);
        }
      }
    }

    return savedGames.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get storage usage stats
   */
  public getStorageStats(): {
    used: number;
    total: number;
    percentage: number;
  } {
    let used = 0;
    const prefix = this.config.storagePrefix;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        const value = localStorage.getItem(key);
        if (value) {
          used += value.length;
        }
      }
    }

    // localStorage limit is typically 5-10MB
    const total = 5 * 1024 * 1024; // 5MB
    const percentage = (used / total) * 100;

    return { used, total, percentage };
  }
}
