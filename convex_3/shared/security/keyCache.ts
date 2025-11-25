// convex/lib/security/keyCache.ts
// In-memory cache for decrypted API keys with TTL

/**
 * Represents a cached decrypted API key with expiration metadata
 */
interface CacheEntry {
  apiKey: string
  expiresAt: number
}

/**
 * Configuration for the key cache
 */
interface CacheConfig {
  ttlMs: number // Time to live in milliseconds
}

/**
 * In-memory cache for decrypted API keys
 * Reduces decryption overhead for frequently accessed keys
 */
class KeyCache {
  private cache: Map<string, CacheEntry>
  private config: CacheConfig

  constructor(config: CacheConfig = { ttlMs: 60000 }) {
    this.cache = new Map()
    this.config = config
  }

  /**
   * Gets a cached API key if it exists and hasn't expired
   */
  get(providerId: string): string | null {
    const entry = this.cache.get(providerId)

    if (!entry) {
      return null
    }

    // Check if entry has expired
    if (entry.expiresAt < Date.now()) {
      this.cache.delete(providerId)
      return null
    }

    return entry.apiKey
  }

  /**
   * Sets a value in the cache with expiration
   */
  set(providerId: string, apiKey: string): void {
    this.cache.set(providerId, {
      apiKey,
      expiresAt: Date.now() + this.config.ttlMs,
    })
  }

  /**
   * Clears the cache entry for a specific provider
   * Used when provider configuration is updated
   */
  invalidate(providerId: string): void {
    this.cache.delete(providerId)
  }

  /**
   * Clears the entire cache
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Gets the current size of the cache
   */
  size(): number {
    return this.cache.size
  }
}

// Create and export a singleton instance
export const apiKeyCache = new KeyCache({ ttlMs: 60000 })

/**
 * Utility function to get or null a cached key
 */
export function getCachedApiKey(providerId: string): string | null {
  return apiKeyCache.get(providerId)
}

/**
 * Utility function to set a cached key
 */
export function setCachedApiKey(providerId: string, apiKey: string): void {
  apiKeyCache.set(providerId, apiKey)
}

/**
 * Utility function to invalidate a cached key
 */
export function invalidateCachedApiKey(providerId: string): void {
  apiKeyCache.invalidate(providerId)
}
