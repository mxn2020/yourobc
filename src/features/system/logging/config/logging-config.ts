// src/features/boilerplate/logging/config/logging-config.ts

import { LoggerConfig, LogLevel, FeatureLoggingConfig } from '../types/logging.types'
import { getEnv, getEnvWithDefault, envIsNotFalse, envIsTrue } from '../../_shared/env-utils'

/**
 * SSR-safe helper to get current origin
 * Returns window.location.origin in browser, fallback value during SSR
 */
function getOrigin(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  // Fallback for SSR - this will be replaced with actual origin at runtime
  return 'http://localhost:3000'
}

/**
 * SSR-safe helper to get base URL for URL parsing
 * Returns window.location.origin in browser, fallback value during SSR
 */
function getSafeBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  // Fallback for SSR - URLs will be parsed correctly at runtime
  return 'http://localhost:3000'
}

/**
 * Logging Configuration
 *
 * Change the provider here to switch between different logging implementations:
 * - 'console': Default browser console logging (active by default)
 * - 'sentry': Sentry error tracking (requires @sentry/react package)
 * - 'custom': Your own custom logging implementation
 *
 * To activate Sentry:
 * 1. Set VITE_SENTRY_DSN in your .env file
 * 2. Change provider to 'sentry'
 * 3. Configure Sentry options below
 */
export const loggerConfig: LoggerConfig = {
  // Active provider
  provider: getEnv('VITE_SENTRY_DSN') ? 'sentry' : 'console',

  // Enable/disable logging globally
  enabled: true,

  // Minimum log level to capture (optional)
  // Logs below this level will be ignored
  minLevel: envIsTrue('DEV') ? LogLevel.DEBUG : LogLevel.INFO,

  // Sentry configuration (only used if provider is 'sentry')
  sentry: {
    // Required: Sentry DSN from environment
    dsn: getEnvWithDefault('VITE_SENTRY_DSN', ''),

    // Environment name
    environment: getEnvWithDefault('VITE_SENTRY_ENVIRONMENT', envIsTrue('DEV') ? 'development' : 'production'),

    // Release version (optional, uses package.json version if available)
    release: getEnv('VITE_APP_VERSION'),

    // Performance monitoring sample rate (0.0 to 1.0)
    // 1.0 = 100% of transactions, 0.1 = 10% of transactions
    tracesSampleRate: envIsTrue('PROD') ? 0.1 : 1.0,

    // Session replay sample rate for normal sessions
    replaysSessionSampleRate: envIsTrue('PROD') ? 0.1 : 0.0,

    // Session replay sample rate for error sessions
    replaysOnErrorSampleRate: 1.0,

    // React profiler sample rate
    profilesSampleRate: envIsTrue('PROD') ? 0.1 : 0.0,

    // Session replay configuration
    replay: {
      // Mask all text content
      maskAllText: false,

      // Block all media (images, videos, etc.)
      blockAllMedia: false,

      // Mask all input fields
      maskAllInputs: true,

      // Capture network request/response bodies
      networkCaptureBodies: true,

      // URLs to capture network details for
      networkDetailAllowUrls: [
        getOrigin(),
      ],
    },

    // Filter out common errors that aren't actionable
    ignoreErrors: [
      // Browser extension errors
      /^chrome-extension:\/\//i,
      /^moz-extension:\/\//i,

      // Network errors
      'Network request failed',
      'NetworkError',
      'Failed to fetch',

      // ResizeObserver loop errors (false positives)
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',

      // Script loading errors from ad blockers
      /blocked by the client/i,

      // Common non-actionable errors
      'Non-Error promise rejection captured',
      'Unexpected token',
    ],

    // Only allow errors from your own domain
    allowUrls: [
      /https?:\/\/((www|app)\.)?yourdomain\.com/,
      /localhost/,
      /127\.0\.0\.1/,
    ],

    // Enable debug mode in development
    debug: envIsTrue('DEV'),

    // Maximum breadcrumbs to keep
    maxBreadcrumbs: 100,

    // Attach stack traces to all messages
    attachStacktrace: true,

    // Do not send PII by default
    sendDefaultPii: false,

    // Enable automatic session tracking
    autoSessionTracking: true,

    // Filter and sanitize events before sending
    beforeSend: (event, hint) => {
      // Don't send events in development if console provider is preferred
      if (envIsTrue('DEV') && !envIsTrue('VITE_SENTRY_IN_DEV')) {
        return null
      }

      // Sanitize sensitive data from error messages
      if (event.message) {
        event.message = sanitizeSensitiveData(event.message)
      }

      // Sanitize sensitive data from exception values
      if (event.exception?.values) {
        event.exception.values = event.exception.values.map(exception => ({
          ...exception,
          value: exception.value ? sanitizeSensitiveData(exception.value) : exception.value,
        }))
      }

      // Sanitize request data
      if (event.request?.data) {
        event.request.data = sanitizeSensitiveData(JSON.stringify(event.request.data))
      }

      return event
    },

    // Filter breadcrumbs before adding
    beforeBreadcrumb: (breadcrumb, hint) => {
      // Don't capture console breadcrumbs in production
      if (envIsTrue('PROD') && breadcrumb.category === 'console') {
        return null
      }

      // Sanitize URLs in navigation breadcrumbs
      if (breadcrumb.category === 'navigation' && breadcrumb.data?.to) {
        breadcrumb.data.to = sanitizeUrl(breadcrumb.data.to)
      }

      // Sanitize XHR/fetch request data
      if (breadcrumb.category === 'xhr' || breadcrumb.category === 'fetch') {
        if (breadcrumb.data?.url) {
          breadcrumb.data.url = sanitizeUrl(breadcrumb.data.url)
        }
      }

      return breadcrumb
    },
  },

  // Custom provider configuration (only used if provider is 'custom')
  // custom: {
  //   providerPath: './providers/custom/MyCustomLogger',
  //   config: {
  //     apiKey: import.meta.env.VITE_CUSTOM_LOGGER_KEY,
  //     endpoint: 'https://api.example.com/logs',
  //   },
  // },
}

/**
 * Feature-specific logging toggles
 * Useful for debugging specific features without flooding logs
 */
export const featureLogging: FeatureLoggingConfig = {
  auth: true,
  projects: true,
  auditLogs: true,
  payments: true,
  ai: true,
  comments: true,
  errors: {
    enabled: true,
    minLevel: LogLevel.WARN,
  },
  performance: {
    enabled: envIsTrue('PROD'),
    minLevel: LogLevel.INFO,
  },
}

/**
 * Environment-based configuration helpers
 */
export const isProduction = envIsTrue('PROD')
export const isDevelopment = envIsTrue('DEV')

/**
 * Should errors be sent to external monitoring?
 */
export const shouldSendToMonitoring = isProduction && loggerConfig.provider !== 'console'

/**
 * Sanitize sensitive data from strings
 */
function sanitizeSensitiveData(text: string): string {
  let sanitized = text

  // Remove email addresses
  sanitized = sanitized.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]')

  // Remove tokens/keys (common patterns)
  sanitized = sanitized.replace(/[a-zA-Z0-9_-]{32,}/g, '[TOKEN]')

  // Remove API keys
  sanitized = sanitized.replace(/api[_-]?key[s]?[\s:=]+[a-zA-Z0-9_-]+/gi, 'api_key=[REDACTED]')

  // Remove passwords
  sanitized = sanitized.replace(/password[\s:=]+[^\s&]+/gi, 'password=[REDACTED]')

  // Remove authorization headers
  sanitized = sanitized.replace(/authorization[\s:=]+[^\s&]+/gi, 'authorization=[REDACTED]')

  // Remove bearer tokens
  sanitized = sanitized.replace(/bearer\s+[a-zA-Z0-9_-]+/gi, 'bearer [REDACTED]')

  return sanitized
}

/**
 * Sanitize URLs by removing sensitive query parameters
 */
function sanitizeUrl(url: string): string {
  try {
    const urlObj = new URL(url, getSafeBaseUrl())
    const sensitiveParams = ['token', 'key', 'secret', 'password', 'api_key', 'apikey']

    sensitiveParams.forEach(param => {
      if (urlObj.searchParams.has(param)) {
        urlObj.searchParams.set(param, '[REDACTED]')
      }
    })

    return urlObj.toString()
  } catch {
    // If URL parsing fails, return original
    return url
  }
}

/**
 * Helper to check if a feature's logging is enabled
 */
export function isFeatureLoggingEnabled(feature: string, level: LogLevel = LogLevel.DEBUG): boolean {
  const config = featureLogging[feature]

  if (typeof config === 'boolean') {
    return config
  }

  if (typeof config === 'object') {
    if (!config.enabled) {
      return false
    }

    if (config.minLevel) {
      const levelValues: Record<LogLevel, number> = {
        [LogLevel.DEBUG]: 0,
        [LogLevel.INFO]: 1,
        [LogLevel.WARN]: 2,
        [LogLevel.ERROR]: 3,
        [LogLevel.FATAL]: 4,
      }

      return levelValues[level] >= levelValues[config.minLevel]
    }

    return true
  }

  return false
}
