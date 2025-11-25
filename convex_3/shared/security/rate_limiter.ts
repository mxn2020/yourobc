// convex/lib/security/rate-limiter.ts

export interface RateLimitConfig {
  requestsPerMinute: number
  tokensPerMinute: number
  concurrentRequests: number
}

export interface RateLimitState {
  lastResetTime: number
  requestCount: number
  tokenCount: number
  concurrentCount: number
}

/**
 * Checks if a request should be allowed based on rate limits
 * This is a client-side check and should be enforced server-side with proper windowing
 *
 * @param currentState - Current rate limit state
 * @param config - Rate limit configuration
 * @param tokensToConsume - Number of tokens this request consumes
 * @returns { allowed: boolean, reason?: string }
 */
export function checkRateLimit(
  currentState: RateLimitState,
  config: RateLimitConfig,
  tokensToConsume: number = 1
): { allowed: boolean; reason?: string; nextAvailableTime?: number } {
  const now = Date.now()
  const minuteInMs = 60 * 1000

  // Reset window if more than a minute has passed
  const timeSinceReset = now - currentState.lastResetTime
  const shouldReset = timeSinceReset >= minuteInMs

  const state = shouldReset
    ? {
        requestCount: 0,
        tokenCount: 0,
        concurrentCount: currentState.concurrentCount,
        lastResetTime: now,
      }
    : currentState

  // Check requests per minute limit
  if (state.requestCount >= config.requestsPerMinute) {
    const nextAvailableTime = state.lastResetTime + minuteInMs
    return {
      allowed: false,
      reason: `Requests per minute limit (${config.requestsPerMinute}) exceeded`,
      nextAvailableTime,
    }
  }

  // Check tokens per minute limit
  if (state.tokenCount + tokensToConsume > config.tokensPerMinute) {
    const nextAvailableTime = state.lastResetTime + minuteInMs
    return {
      allowed: false,
      reason: `Tokens per minute limit (${config.tokensPerMinute}) would be exceeded (needs ${tokensToConsume} tokens)`,
      nextAvailableTime,
    }
  }

  // Check concurrent requests limit
  if (state.concurrentCount >= config.concurrentRequests) {
    return {
      allowed: false,
      reason: `Concurrent requests limit (${config.concurrentRequests}) exceeded`,
    }
  }

  return { allowed: true }
}

/**
 * Updates rate limit state after a successful request
 */
export function updateRateLimitState(
  currentState: RateLimitState,
  tokensConsumed: number = 1,
  incrementConcurrent: boolean = false
): RateLimitState {
  const now = Date.now()
  const minuteInMs = 60 * 1000

  const timeSinceReset = now - currentState.lastResetTime
  const shouldReset = timeSinceReset >= minuteInMs

  if (shouldReset) {
    return {
      requestCount: 1,
      tokenCount: tokensConsumed,
      concurrentCount: incrementConcurrent ? 1 : 0,
      lastResetTime: now,
    }
  }

  return {
    requestCount: currentState.requestCount + 1,
    tokenCount: currentState.tokenCount + tokensConsumed,
    concurrentCount: currentState.concurrentCount + (incrementConcurrent ? 1 : 0),
    lastResetTime: currentState.lastResetTime,
  }
}

/**
 * Decrements concurrent request counter when a request completes
 */
export function decrementConcurrentCount(currentState: RateLimitState): RateLimitState {
  return {
    ...currentState,
    concurrentCount: Math.max(0, currentState.concurrentCount - 1),
  }
}

/**
 * Validates rate limit configuration
 */
export function validateRateLimitConfig(config: Partial<RateLimitConfig>): string[] {
  const errors: string[] = []

  if (config.requestsPerMinute !== undefined && config.requestsPerMinute < 1) {
    errors.push('requestsPerMinute must be at least 1')
  }

  if (config.tokensPerMinute !== undefined && config.tokensPerMinute < 1) {
    errors.push('tokensPerMinute must be at least 1')
  }

  if (config.concurrentRequests !== undefined && config.concurrentRequests < 1) {
    errors.push('concurrentRequests must be at least 1')
  }

  return errors
}

/**
 * Creates initial rate limit state
 */
export function createInitialRateLimitState(): RateLimitState {
  return {
    lastResetTime: Date.now(),
    requestCount: 0,
    tokenCount: 0,
    concurrentCount: 0,
  }
}
