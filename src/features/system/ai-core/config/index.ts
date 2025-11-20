// src/features/boilerplate/ai-core/config/index.ts
/**
 * AI Features Configuration
 *
 * Consolidates configuration for:
 * - AI Core (models, providers)
 * - AI Logging (request tracking)
 * - AI Models (model selection)
 * - AI Testing (playground, evaluation)
 */

import { getEnv, getEnvWithDefault, envIsNotFalse, envIsTrue, getEnvAsNumber, getEnvAsFloat } from '../../_shared/env-utils';

// ============================================
// 1. TYPES & INTERFACES
// ============================================

export type AIProviderType = 'openai' | 'anthropic' | 'google' | 'cohere' | 'local' | 'gateway';

export type AIModelType =
  | 'gpt-4' | 'gpt-4-turbo' | 'gpt-3.5-turbo'
  | 'claude-3-opus' | 'claude-3-sonnet' | 'claude-3-haiku'
  | 'gemini-pro' | 'gemini-ultra'
  | 'command' | 'command-light'
  | 'local-llama' | 'local-mistral';

export interface AIProviderConfig {
  enabled: boolean;
  name: string;
  apiKey?: string;
  endpoint?: string;
  models: AIModelType[];
  rateLimit?: {
    requestsPerMinute: number;
    tokensPerMinute: number;
  };
}

export interface AIModelConfig {
  provider: AIProviderType;
  model: AIModelType;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  fallbackModels?: AIModelType[];
}

export interface AILoggingConfig {
  enabled: boolean;
  logRequests: boolean;
  logResponses: boolean;
  logErrors: boolean;
  logTokenUsage: boolean;
  logLatency: boolean;
  retentionDays: number;
  redactSensitiveData: boolean;
}

export interface AITestingConfig {
  enabled: boolean;
  playground: boolean;
  evaluation: boolean;
  benchmarking: boolean;
  allowedUsers: 'all' | 'admin' | 'specific';
}

export interface AIRateLimits {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  tokensPerRequest: number;
  concurrentRequests: number;
}

// ============================================
// 2. ENVIRONMENT VARIABLES
// ============================================

export const AI_ENV = {
  // Feature toggle
  ENABLE_AI: envIsNotFalse('VITE_ENABLE_AI'),

  // Primary provider
  PRIMARY_PROVIDER: (getEnvWithDefault('VITE_AI_PROVIDER', 'gateway') as AIProviderType),
  DEFAULT_MODEL: getEnvWithDefault('VITE_AI_DEFAULT_MODEL', 'gpt-3.5-turbo'),

  // Gateway (unified API)
  GATEWAY_API_KEY: getEnvWithDefault('AI_GATEWAY_API_KEY', ''),
  GATEWAY_URL: getEnvWithDefault('VITE_AI_GATEWAY_URL', 'https://gateway.ai.cloudflare.com'),

  // OpenAI
  OPENAI_API_KEY: getEnvWithDefault('OPENAI_API_KEY', ''),
  OPENAI_ORG_ID: getEnvWithDefault('OPENAI_ORG_ID', ''),

  // Anthropic
  ANTHROPIC_API_KEY: getEnvWithDefault('ANTHROPIC_API_KEY', ''),

  // Google AI
  GOOGLE_AI_API_KEY: getEnvWithDefault('GOOGLE_AI_API_KEY', ''),

  // Cohere
  COHERE_API_KEY: getEnvWithDefault('COHERE_API_KEY', ''),

  // Model settings
  DEFAULT_TEMPERATURE: getEnvAsFloat('VITE_AI_TEMPERATURE', 0.7),
  DEFAULT_MAX_TOKENS: getEnvAsNumber('VITE_AI_MAX_TOKENS', 2000),

  // Rate limiting
  RATE_LIMIT_RPM: getEnvAsNumber('VITE_AI_RATE_LIMIT_RPM', 60), // requests per minute
  RATE_LIMIT_RPH: getEnvAsNumber('VITE_AI_RATE_LIMIT_RPH', 1000), // requests per hour
  RATE_LIMIT_RPD: getEnvAsNumber('VITE_AI_RATE_LIMIT_RPD', 10000), // requests per day
  MAX_CONCURRENT_REQUESTS: getEnvAsNumber('VITE_AI_MAX_CONCURRENT', 5),

  // Logging
  ENABLE_LOGGING: envIsNotFalse('VITE_AI_ENABLE_LOGGING'),
  LOG_REQUESTS: envIsNotFalse('VITE_AI_LOG_REQUESTS'),
  LOG_RESPONSES: envIsTrue('VITE_AI_LOG_RESPONSES'),
  LOG_TOKEN_USAGE: envIsNotFalse('VITE_AI_LOG_TOKEN_USAGE'),
  LOG_RETENTION_DAYS: getEnvAsNumber('VITE_AI_LOG_RETENTION_DAYS', 30),
  REDACT_SENSITIVE: envIsNotFalse('VITE_AI_REDACT_SENSITIVE'),

  // Testing
  ENABLE_TESTING: envIsNotFalse('VITE_AI_ENABLE_TESTING'),
  ENABLE_PLAYGROUND: envIsTrue('VITE_AI_ENABLE_PLAYGROUND'),
  ENABLE_EVALUATION: envIsTrue('VITE_AI_ENABLE_EVALUATION'),
  TESTING_ALLOWED_USERS: (getEnvWithDefault('VITE_AI_TESTING_USERS', 'admin') as 'all' | 'admin' | 'specific'),
} as const;

// ============================================
// 3. PROVIDER CONFIGURATIONS
// ============================================

export const AI_PROVIDERS: Record<AIProviderType, AIProviderConfig> = {
  gateway: {
    enabled: Boolean(AI_ENV.GATEWAY_API_KEY),
    name: 'AI Gateway',
    apiKey: AI_ENV.GATEWAY_API_KEY,
    endpoint: AI_ENV.GATEWAY_URL,
    models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo', 'claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
    rateLimit: {
      requestsPerMinute: AI_ENV.RATE_LIMIT_RPM,
      tokensPerMinute: 100000,
    },
  },
  openai: {
    enabled: Boolean(AI_ENV.OPENAI_API_KEY),
    name: 'OpenAI',
    apiKey: AI_ENV.OPENAI_API_KEY,
    endpoint: 'https://api.openai.com/v1',
    models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    rateLimit: {
      requestsPerMinute: 60,
      tokensPerMinute: 90000,
    },
  },
  anthropic: {
    enabled: Boolean(AI_ENV.ANTHROPIC_API_KEY),
    name: 'Anthropic',
    apiKey: AI_ENV.ANTHROPIC_API_KEY,
    endpoint: 'https://api.anthropic.com',
    models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
    rateLimit: {
      requestsPerMinute: 50,
      tokensPerMinute: 100000,
    },
  },
  google: {
    enabled: Boolean(AI_ENV.GOOGLE_AI_API_KEY),
    name: 'Google AI',
    apiKey: AI_ENV.GOOGLE_AI_API_KEY,
    endpoint: 'https://generativelanguage.googleapis.com',
    models: ['gemini-pro', 'gemini-ultra'],
    rateLimit: {
      requestsPerMinute: 60,
      tokensPerMinute: 120000,
    },
  },
  cohere: {
    enabled: Boolean(AI_ENV.COHERE_API_KEY),
    name: 'Cohere',
    apiKey: AI_ENV.COHERE_API_KEY,
    endpoint: 'https://api.cohere.ai',
    models: ['command', 'command-light'],
    rateLimit: {
      requestsPerMinute: 20,
      tokensPerMinute: 40000,
    },
  },
  local: {
    enabled: false,
    name: 'Local Models',
    endpoint: 'http://localhost:11434', // Ollama default
    models: ['local-llama', 'local-mistral'],
  },
};

// ============================================
// 4. MAIN CONFIGURATION OBJECT
// ============================================

export const AI_CONFIG = {
  // Feature metadata
  name: 'AI Features',
  version: '1.0.0',
  enabled: AI_ENV.ENABLE_AI,

  // Provider configuration
  primaryProvider: AI_ENV.PRIMARY_PROVIDER,
  providers: AI_PROVIDERS,
  enabledProviders: Object.entries(AI_PROVIDERS)
    .filter(([_, config]) => config.enabled)
    .map(([type, _]) => type as AIProviderType),

  // Model configuration
  defaultModel: {
    provider: AI_ENV.PRIMARY_PROVIDER,
    model: AI_ENV.DEFAULT_MODEL as AIModelType,
    temperature: AI_ENV.DEFAULT_TEMPERATURE,
    maxTokens: AI_ENV.DEFAULT_MAX_TOKENS,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
  } as AIModelConfig,

  // Rate limiting
  rateLimits: {
    requestsPerMinute: AI_ENV.RATE_LIMIT_RPM,
    requestsPerHour: AI_ENV.RATE_LIMIT_RPH,
    requestsPerDay: AI_ENV.RATE_LIMIT_RPD,
    tokensPerRequest: AI_ENV.DEFAULT_MAX_TOKENS,
    concurrentRequests: AI_ENV.MAX_CONCURRENT_REQUESTS,
  } as AIRateLimits,

  // Logging configuration
  logging: {
    enabled: AI_ENV.ENABLE_LOGGING,
    logRequests: AI_ENV.LOG_REQUESTS,
    logResponses: AI_ENV.LOG_RESPONSES,
    logErrors: true,
    logTokenUsage: AI_ENV.LOG_TOKEN_USAGE,
    logLatency: true,
    retentionDays: AI_ENV.LOG_RETENTION_DAYS,
    redactSensitiveData: AI_ENV.REDACT_SENSITIVE,
  } as AILoggingConfig,

  // Testing configuration
  testing: {
    enabled: AI_ENV.ENABLE_TESTING,
    playground: AI_ENV.ENABLE_PLAYGROUND,
    evaluation: AI_ENV.ENABLE_EVALUATION,
    benchmarking: AI_ENV.ENABLE_EVALUATION,
    allowedUsers: AI_ENV.TESTING_ALLOWED_USERS,
  } as AITestingConfig,
} as const;

// ============================================
// 5. VALIDATION FUNCTION
// ============================================

export function validateAIConfig(): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if feature is enabled
  if (!AI_ENV.ENABLE_AI) {
    return { valid: true, errors: [], warnings: ['AI features are disabled'] };
  }

  // Check if at least one provider is enabled
  const hasEnabledProvider = Object.values(AI_PROVIDERS).some(p => p.enabled);
  if (!hasEnabledProvider) {
    errors.push('At least one AI provider must be enabled (set API keys)');
  }

  // Validate primary provider
  if (!AI_PROVIDERS[AI_ENV.PRIMARY_PROVIDER]) {
    errors.push(`Invalid primary provider: ${AI_ENV.PRIMARY_PROVIDER}`);
  } else if (!AI_PROVIDERS[AI_ENV.PRIMARY_PROVIDER].enabled) {
    errors.push(`Primary provider '${AI_ENV.PRIMARY_PROVIDER}' is not enabled (missing API key?)`);
  }

  // Validate model settings
  if (AI_ENV.DEFAULT_TEMPERATURE < 0 || AI_ENV.DEFAULT_TEMPERATURE > 2) {
    errors.push('DEFAULT_TEMPERATURE must be between 0 and 2');
  }

  if (AI_ENV.DEFAULT_MAX_TOKENS < 1) {
    errors.push('DEFAULT_MAX_TOKENS must be at least 1');
  }

  if (AI_ENV.DEFAULT_MAX_TOKENS > 128000) {
    warnings.push('DEFAULT_MAX_TOKENS is very high, this may result in high costs');
  }

  // Validate rate limits
  if (AI_ENV.RATE_LIMIT_RPM < 1) {
    errors.push('RATE_LIMIT_RPM must be at least 1');
  }

  if (AI_ENV.MAX_CONCURRENT_REQUESTS < 1) {
    errors.push('MAX_CONCURRENT_REQUESTS must be at least 1');
  }

  if (AI_ENV.MAX_CONCURRENT_REQUESTS > 20) {
    warnings.push('MAX_CONCURRENT_REQUESTS is very high, this may overload the API');
  }

  // Validate logging
  if (AI_ENV.LOG_RETENTION_DAYS < 1) {
    errors.push('LOG_RETENTION_DAYS must be at least 1');
  }

  if (AI_ENV.LOG_RETENTION_DAYS > 365) {
    warnings.push('LOG_RETENTION_DAYS is very long (>1 year), this may use significant storage');
  }

  // Provider-specific validations
  if (AI_PROVIDERS.openai.enabled) {
    if (!AI_ENV.OPENAI_API_KEY || AI_ENV.OPENAI_API_KEY.length < 20) {
      errors.push('OpenAI API key appears invalid');
    }
  }

  if (AI_PROVIDERS.anthropic.enabled) {
    if (!AI_ENV.ANTHROPIC_API_KEY || !AI_ENV.ANTHROPIC_API_KEY.startsWith('sk-ant-')) {
      warnings.push('Anthropic API key may be invalid (should start with sk-ant-)');
    }
  }

  // Testing warnings
  if (AI_ENV.ENABLE_PLAYGROUND && AI_ENV.TESTING_ALLOWED_USERS === 'all') {
    warnings.push('AI Playground is enabled for all users - this may incur unexpected costs');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================
// 6. HELPER FUNCTIONS
// ============================================

/**
 * Check if AI features are enabled
 */
export function isAIEnabled(): boolean {
  return AI_ENV.ENABLE_AI;
}

/**
 * Check if a specific provider is enabled
 */
export function isProviderEnabled(provider: AIProviderType): boolean {
  return AI_PROVIDERS[provider]?.enabled || false;
}

/**
 * Get list of enabled providers
 */
export function getEnabledProviders(): AIProviderType[] {
  return AI_CONFIG.enabledProviders;
}

/**
 * Get models available for a provider
 */
export function getProviderModels(provider: AIProviderType): AIModelType[] {
  return AI_PROVIDERS[provider]?.models || [];
}

/**
 * Get all available models across all enabled providers
 */
export function getAllAvailableModels(): AIModelType[] {
  return AI_CONFIG.enabledProviders
    .flatMap(provider => getProviderModels(provider))
    .filter((model, index, self) => self.indexOf(model) === index); // unique
}

/**
 * Check if AI logging is enabled
 */
export function isAILoggingEnabled(): boolean {
  return AI_CONFIG.logging.enabled;
}

/**
 * Check if AI testing/playground is enabled
 */
export function isAITestingEnabled(): boolean {
  return AI_CONFIG.testing.enabled;
}

/**
 * Check if playground is enabled
 */
export function isPlaygroundEnabled(): boolean {
  return AI_CONFIG.testing.playground;
}

/**
 * Check if user can access testing features
 */
export function canAccessAITesting(userRole: 'admin' | 'user'): boolean {
  if (!AI_CONFIG.testing.enabled) return false;

  switch (AI_CONFIG.testing.allowedUsers) {
    case 'all':
      return true;
    case 'admin':
      return userRole === 'admin';
    case 'specific':
      // Would check against specific user list
      return userRole === 'admin';
    default:
      return false;
  }
}

/**
 * Get rate limit for current configuration
 */
export function getRateLimit(timeframe: 'minute' | 'hour' | 'day'): number {
  switch (timeframe) {
    case 'minute':
      return AI_CONFIG.rateLimits.requestsPerMinute;
    case 'hour':
      return AI_CONFIG.rateLimits.requestsPerHour;
    case 'day':
      return AI_CONFIG.rateLimits.requestsPerDay;
  }
}

/**
 * Get provider configuration
 */
export function getProviderConfig(provider: AIProviderType): AIProviderConfig | null {
  return AI_PROVIDERS[provider] || null;
}

// ============================================
// 7. DEFAULT EXPORT
// ============================================

export default AI_CONFIG;
