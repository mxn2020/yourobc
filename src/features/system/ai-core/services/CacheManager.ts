// src/core/ai/CacheManager.ts
import type { AIGenerateRequest, AIObjectRequest } from '../types/ai-core.types';

export interface CacheConfig {
  defaultTTL?: number;
  maxSize?: number;
  enableCompression?: boolean;
  enableStats?: boolean;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
  size: number;
  keyHash: string;
}

interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  missRate: number;
  totalHits: number;
  totalMisses: number;
  avgEntrySize: number;
  oldestEntry?: number;
  newestEntry?: number;
}

export class CacheManager {
  private readonly cache = new Map<string, CacheEntry<unknown>>();
  private readonly config: Required<CacheConfig>;
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    evictions: 0
  };
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(defaultTTL = 3600000, config: CacheConfig = {}) { // 1 hour default TTL
    this.config = {
      defaultTTL,
      maxSize: config.maxSize ?? 1000,
      enableCompression: config.enableCompression ?? false,
      enableStats: config.enableStats ?? true
    };

    // Start cleanup timer
    this.startCleanupTimer();
  }

  /**
   * Get item from cache
   */
  public async get<T>(key: string): Promise<T | null> {
    const cacheKey = this.normalizeKey(key);
    const entry = this.cache.get(cacheKey) as CacheEntry<T> | undefined;

    if (!entry) {
      this.recordMiss();
      return null;
    }

    // Check if expired
    if (this.isExpired(entry)) {
      this.cache.delete(cacheKey);
      this.recordMiss();
      return null;
    }

    // Update hit count and record hit
    entry.hits++;
    this.recordHit();

    // Move to end (LRU behavior)
    this.cache.delete(cacheKey);
    this.cache.set(cacheKey, entry);

    return entry.data;
  }

  /**
   * Set item in cache
   */
  public async set<T>(
    key: string, 
    data: T, 
    ttl?: number
  ): Promise<void> {
    const cacheKey = this.normalizeKey(key);
    const finalTTL = ttl ?? this.config.defaultTTL;
    const size = this.calculateSize(data);

    // Check if we need to evict entries
    await this.ensureCapacity(size);

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: finalTTL,
      hits: 0,
      size,
      keyHash: cacheKey
    };

    this.cache.set(cacheKey, entry);
    this.stats.sets++;
  }

  /**
   * Delete item from cache
   */
  public async delete(key: string): Promise<boolean> {
    const cacheKey = this.normalizeKey(key);
    const deleted = this.cache.delete(cacheKey);
    
    if (deleted) {
      this.stats.deletes++;
    }
    
    return deleted;
  }

  /**
   * Clear all cache entries
   */
  public async clear(): Promise<void> {
    const entriesCount = this.cache.size;
    this.cache.clear();
    this.stats.deletes += entriesCount;
  }

  /**
   * Check if key exists in cache
   */
  public async has(key: string): Promise<boolean> {
    const cacheKey = this.normalizeKey(key);
    const entry = this.cache.get(cacheKey);
    
    if (!entry) return false;
    if (this.isExpired(entry)) {
      this.cache.delete(cacheKey);
      return false;
    }
    
    return true;
  }

  /**
   * Generate cache key for AI request
   */
  public generateKey(request: AIGenerateRequest | AIObjectRequest | unknown): string {
    // Create a deterministic key from request parameters
    const keyObject = this.normalizeRequestForKey(request);
    const keyString = JSON.stringify(keyObject);
    
    // Use simple hash function for shorter keys
    return this.hashString(keyString);
  }

  /**
   * Get cache statistics
   */
  public getStats(): CacheStats {
    if (!this.config.enableStats) {
      return {
        totalEntries: 0,
        totalSize: 0,
        hitRate: 0,
        missRate: 0,
        totalHits: 0,
        totalMisses: 0,
        avgEntrySize: 0
      };
    }

    const entries = Array.from(this.cache.values());
    const totalSize = entries.reduce((sum, entry) => sum + entry.size, 0);
    const totalRequests = this.stats.hits + this.stats.misses;
    
    const timestamps = entries.map(entry => entry.timestamp).sort((a, b) => a - b);

    return {
      totalEntries: this.cache.size,
      totalSize,
      hitRate: totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0,
      missRate: totalRequests > 0 ? (this.stats.misses / totalRequests) * 100 : 0,
      totalHits: this.stats.hits,
      totalMisses: this.stats.misses,
      avgEntrySize: entries.length > 0 ? totalSize / entries.length : 0,
      oldestEntry: timestamps[0],
      newestEntry: timestamps[timestamps.length - 1]
    };
  }

  /**
   * Get default TTL for logging purposes
   */
  public getDefaultTTL(): number {
    return this.config.defaultTTL;
  }

  /**
   * Get detailed cache info
   */
  public getCacheInfo(): {
    config: CacheConfig;
    stats: {
      hits: number;
      misses: number;
      sets: number;
      deletes: number;
      evictions: number;
    };
    topKeys: Array<{
      key: string;
      hits: number;
      size: number;
      age: number;
    }>;
  } {
    const entries = Array.from(this.cache.entries());
    const now = Date.now();
    
    const topKeys = entries
      .map(([key, entry]) => ({
        key: key.substring(0, 50) + (key.length > 50 ? '...' : ''),
        hits: entry.hits,
        size: entry.size,
        age: now - entry.timestamp
      }))
      .sort((a, b) => b.hits - a.hits)
      .slice(0, 10);

    return {
      config: this.config,
      stats: { ...this.stats },
      topKeys
    };
  }

  /**
   * Cleanup expired entries
   */
  public cleanupExpired(): number {
    let deletedCount = 0;
    const now = Date.now();

    for (const [key, entry] of this.cache) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  /**
   * Warm cache with common requests
   */
  public async warmCache(requests: Array<{ key: string; data: unknown; ttl?: number }>): Promise<void> {
    const promises = requests.map(({ key, data, ttl }) => 
      this.set(key, data, ttl)
    );
    
    await Promise.all(promises);
  }

  /**
   * Export cache contents for debugging
   */
  public exportCache(): Array<{
    key: string;
    size: number;
    hits: number;
    age: number;
    ttl: number;
  }> {
    const now = Date.now();
    
    return Array.from(this.cache.entries()).map(([key, entry]) => ({
      key: key.substring(0, 100),
      size: entry.size,
      hits: entry.hits,
      age: now - entry.timestamp,
      ttl: entry.ttl
    }));
  }

  /**
   * Shutdown cache manager
   */
  public shutdown(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.clear();
  }

  /**
   * Normalize cache key
   */
  private normalizeKey(key: string): string {
    return key.trim().toLowerCase();
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired(entry: CacheEntry<unknown>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * Calculate size of data for cache management
   */
  private calculateSize(data: unknown): number {
    try {
      return JSON.stringify(data).length;
    } catch {
      return 1000; // Default size estimate
    }
  }

  /**
   * Ensure cache has capacity for new entry
   */
  private async ensureCapacity(newEntrySize: number): Promise<void> {
    // If cache is not full, no need to evict
    if (this.cache.size < this.config.maxSize) {
      return;
    }

    // Calculate current total size
    const entries = Array.from(this.cache.entries());
    const totalSize = entries.reduce((sum, [, entry]) => sum + entry.size, 0);
    
    // If total size is reasonable, just remove oldest entries
    const targetEvictions = Math.max(1, Math.floor(this.config.maxSize * 0.1)); // Remove 10%
    let evicted = 0;
    
    // Sort by last access time (LRU) - entries with fewer hits and older timestamp first
    const sortedEntries = entries
      .sort((a, b) => {
        const [, entryA] = a;
        const [, entryB] = b;
        
        // Prioritize entries with fewer hits
        if (entryA.hits !== entryB.hits) {
          return entryA.hits - entryB.hits;
        }
        
        // Then by age
        return entryA.timestamp - entryB.timestamp;
      });

    for (const [key] of sortedEntries) {
      if (evicted >= targetEvictions) break;
      
      this.cache.delete(key);
      this.stats.evictions++;
      evicted++;
    }
  }

  /**
   * Normalize request for consistent cache keys
   */
  private normalizeRequestForKey(request: unknown): unknown {
    if (!request || typeof request !== 'object') {
      return request;
    }

    const normalized: Record<string, unknown> = {};
    const obj = request as Record<string, unknown>;

    // Include only cacheable fields
    const cacheableFields = [
      'modelId',
      'prompt',
      'systemPrompt',
      'temperature',
      'maxTokens',
      'topP',
      'topK',
      'frequencyPenalty',
      'presencePenalty',
      'stopSequences',
      'responseFormat',
      'schema',
      'outputMode'
    ];

    for (const field of cacheableFields) {
      if (field in obj && obj[field] !== undefined) {
        normalized[field] = obj[field];
      }
    }

    // Sort keys for consistent hashing
    const sortedKeys = Object.keys(normalized).sort();
    const sortedNormalized: Record<string, unknown> = {};
    
    for (const key of sortedKeys) {
      sortedNormalized[key] = normalized[key];
    }

    return sortedNormalized;
  }

  /**
   * Simple hash function for cache keys
   */
  private hashString(str: string): string {
    let hash = 0;
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return `cache_${Math.abs(hash).toString(36)}`;
  }

  /**
   * Record cache hit
   */
  private recordHit(): void {
    if (this.config.enableStats) {
      this.stats.hits++;
    }
  }

  /**
   * Record cache miss
   */
  private recordMiss(): void {
    if (this.config.enableStats) {
      this.stats.misses++;
    }
  }

  /**
   * Start cleanup timer for expired entries
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpired();
    }, 5 * 60 * 1000); // Run every 5 minutes
  }
}