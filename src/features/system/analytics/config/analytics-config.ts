// src/features/system/analytics/config/analytics-config.ts

import { AnalyticsProviderType } from "../types";
import { getEnv, getEnvWithDefault, getEnvAsNumber } from '../../_shared/env-utils';

/**
 * Analytics Configuration
 */
export const analyticsConfig = {
  // Primary provider (defaults to internal)
  primaryProvider: (getEnvWithDefault('VITE_PRIMARY_ANALYTICS_PROVIDER', 'internal')) as AnalyticsProviderType,

  // Enable/disable tracking
  enableTracking:
    getEnvWithDefault('VITE_ANALYTICS_ENABLE_TRACKING', 'true') !== "false",

  // Sampling rate (0-1, where 1 = 100% of events tracked)
  sampleRate: parseFloat(
    getEnvWithDefault('VITE_ANALYTICS_SAMPLE_RATE', '1')
  ),

  // Auto-track page views
  autoTrackPageViews: true,

  // Auto-track user actions (clicks, form submissions)
  autoTrackUserActions: false,

  // Session timeout (milliseconds)
  sessionTimeout: 30 * 60 * 1000, // 30 minutes

  // Providers
  providers: {
    internal: {
      enabled: true,
    },
    google_analytics: {
      enabled: !!getEnv('VITE_GA4_MEASUREMENT_ID'),
      measurementId: getEnv('VITE_GA4_MEASUREMENT_ID'),
      apiSecret: getEnv('VITE_GA4_API_SECRET'),
    },
    mixpanel: {
      enabled: !!getEnv('VITE_MIXPANEL_PROJECT_TOKEN'),
      projectToken: getEnv('VITE_MIXPANEL_PROJECT_TOKEN'),
      apiSecret: getEnv('VITE_MIXPANEL_API_SECRET'),
    },
    plausible: {
      enabled: !!getEnv('VITE_PLAUSIBLE_DOMAIN'),
      domain: getEnv('VITE_PLAUSIBLE_DOMAIN'),
      apiKey: getEnv('VITE_PLAUSIBLE_API_KEY'),
    },
  },
} as const;

/**
 * Get the current analytics provider type
 */
export function getAnalyticsProvider(): AnalyticsProviderType {
  return analyticsConfig.primaryProvider;
}

/**
 * Check if analytics tracking is enabled
 */
export function isTrackingEnabled(): boolean {
  return analyticsConfig.enableTracking;
}

/**
 * Check if a specific provider is enabled
 */
export function isProviderEnabled(
  provider: AnalyticsProviderType
): boolean {
  return analyticsConfig.providers[provider]?.enabled || false;
}

/**
 * Get provider configuration
 */
export function getProviderConfig(provider: AnalyticsProviderType) {
  return analyticsConfig.providers[provider];
}

/**
 * Should track this event based on sample rate
 */
export function shouldTrackEvent(): boolean {
  if (!analyticsConfig.enableTracking) return false;
  return Math.random() <= analyticsConfig.sampleRate;
}

/**
 * Get all enabled providers
 */
export function getEnabledProviders(): AnalyticsProviderType[] {
  return Object.entries(analyticsConfig.providers)
    .filter(([_, config]) => config.enabled)
    .map(([provider]) => provider as AnalyticsProviderType);
}
