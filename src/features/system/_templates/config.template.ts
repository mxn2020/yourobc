// src/features/system/_templates/config.template.ts
/**
 * STANDARD CONFIGURATION TEMPLATE
 *
 * This template defines the standard pattern that ALL feature configurations must follow.
 * Copy this file to your feature's config directory and customize for your feature.
 *
 * Location: src/features/system/{feature}/config/index.ts
 *
 * Example Features Using This Pattern:
 * - Blog: src/features/system/blog/config/index.ts
 * - Payments: src/features/system/payments/config/payment-config.ts
 * - Logging: src/features/system/logging/config/logging-config.ts
 */

// ============================================
// 1. TYPES & INTERFACES
// ============================================

/**
 * Feature-specific types
 * Define enums, interfaces, and types for your feature
 */
export type FeatureProviderType = 'internal' | 'external' | 'custom';

export interface FeatureProviderConfig {
  enabled: boolean;
  name: string;
  // Add provider-specific config here
}

export interface FeatureSettings {
  // Add feature-specific settings here
  maxItems?: number;
  defaultStatus?: string;
}

// ============================================
// 2. ENVIRONMENT VARIABLES
// ============================================

/**
 * Read and validate environment variables
 *
 * Naming Convention:
 * - VITE_ENABLE_{FEATURE} = Feature toggle (true/false)
 * - VITE_{FEATURE}_PROVIDER = Provider selection
 * - VITE_{FEATURE}_{SETTING} = Feature-specific settings
 * - {PROVIDER}_{KEY} = Provider credentials (server-only, no VITE_ prefix)
 */
export const FEATURE_ENV = {
  // Feature toggle (defaults to true if not explicitly disabled)
  ENABLE_FEATURE: import.meta.env.VITE_ENABLE_FEATURE !== 'false',

  // Provider selection
  PRIMARY_PROVIDER: (import.meta.env.VITE_FEATURE_PROVIDER as FeatureProviderType) || 'internal',

  // Feature-specific settings
  MAX_ITEMS: parseInt(import.meta.env.VITE_FEATURE_MAX_ITEMS || '100'),
  DEFAULT_STATUS: import.meta.env.VITE_FEATURE_DEFAULT_STATUS || 'active',

  // Provider credentials (use process.env for server-only vars)
  // For Vite, import.meta.env.{VAR}
  // For Node/Convex, process.env.{VAR}
  EXTERNAL_API_KEY: import.meta.env.VITE_EXTERNAL_API_KEY || '',
} as const;

// ============================================
// 3. PROVIDER CONFIGURATIONS
// ============================================

/**
 * Provider-specific configurations
 * Each provider should have an enabled flag and its settings
 */
export const PROVIDER_CONFIGS: Record<FeatureProviderType, FeatureProviderConfig> = {
  internal: {
    enabled: true,
    name: 'Internal',
    // Internal provider always enabled
  },
  external: {
    enabled: Boolean(FEATURE_ENV.EXTERNAL_API_KEY),
    name: 'External Service',
    // Only enabled if API key is present
  },
  custom: {
    enabled: false,
    name: 'Custom',
    // Disabled by default
  },
};

// ============================================
// 4. MAIN CONFIGURATION OBJECT
// ============================================

/**
 * Main feature configuration
 * This is the primary export that other parts of the app will import
 */
export const FEATURE_CONFIG = {
  // Feature metadata
  name: 'Feature Name',
  version: '1.0.0',
  enabled: FEATURE_ENV.ENABLE_FEATURE,

  // Provider configuration
  primaryProvider: FEATURE_ENV.PRIMARY_PROVIDER,
  providers: PROVIDER_CONFIGS,

  // Feature settings
  settings: {
    maxItems: FEATURE_ENV.MAX_ITEMS,
    defaultStatus: FEATURE_ENV.DEFAULT_STATUS,
  } as FeatureSettings,

  // Sub-feature toggles (if applicable)
  features: {
    subFeatureA: true,
    subFeatureB: import.meta.env.VITE_FEATURE_SUB_B !== 'false',
  },
} as const;

// ============================================
// 5. VALIDATION FUNCTION
// ============================================

/**
 * Validate feature configuration
 * Run this during app initialization to catch configuration errors early
 *
 * @returns Object with validation status and error messages
 */
export function validateFeatureConfig(): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if feature is enabled
  if (!FEATURE_ENV.ENABLE_FEATURE) {
    return { valid: true, errors: [], warnings: ['Feature is disabled'] };
  }

  // Validate primary provider
  if (!PROVIDER_CONFIGS[FEATURE_ENV.PRIMARY_PROVIDER]) {
    errors.push(`Invalid primary provider: ${FEATURE_ENV.PRIMARY_PROVIDER}`);
  }

  // Check if primary provider is enabled
  const primaryProvider = PROVIDER_CONFIGS[FEATURE_ENV.PRIMARY_PROVIDER];
  if (primaryProvider && !primaryProvider.enabled) {
    errors.push(`Primary provider '${FEATURE_ENV.PRIMARY_PROVIDER}' is not enabled (missing credentials?)`);
  }

  // Validate settings
  if (FEATURE_ENV.MAX_ITEMS < 1) {
    errors.push('MAX_ITEMS must be at least 1');
  }

  // Check for provider-specific requirements
  if (FEATURE_ENV.PRIMARY_PROVIDER === 'external' && !FEATURE_ENV.EXTERNAL_API_KEY) {
    errors.push('External provider requires VITE_EXTERNAL_API_KEY');
  }

  // Add warnings for sub-optimal configurations
  if (FEATURE_ENV.MAX_ITEMS > 1000) {
    warnings.push('MAX_ITEMS is very high, this may impact performance');
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
 * Check if feature is enabled
 * Use this in components to conditionally render feature UI
 */
export function isFeatureEnabled(): boolean {
  return FEATURE_ENV.ENABLE_FEATURE;
}

/**
 * Check if a specific provider is enabled
 */
export function isProviderEnabled(provider: FeatureProviderType): boolean {
  return PROVIDER_CONFIGS[provider]?.enabled || false;
}

/**
 * Get active provider configuration
 */
export function getActiveProvider(): FeatureProviderConfig | null {
  const provider = PROVIDER_CONFIGS[FEATURE_ENV.PRIMARY_PROVIDER];
  return provider?.enabled ? provider : null;
}

/**
 * Get feature setting with type safety
 */
export function getFeatureSetting<K extends keyof FeatureSettings>(
  key: K
): FeatureSettings[K] {
  return FEATURE_CONFIG.settings[key];
}

// ============================================
// 7. DEFAULT EXPORT
// ============================================

/**
 * Default export for convenience
 */
export default FEATURE_CONFIG;

// ============================================
// 8. USAGE EXAMPLES
// ============================================

/**
 * Example 1: Check if feature is enabled in component
 *
 * ```tsx
 * import { isFeatureEnabled } from '@/features/system/feature/config';
 *
 * export function MyComponent() {
 *   if (!isFeatureEnabled()) {
 *     return null;
 *   }
 *   return <div>Feature UI</div>;
 * }
 * ```
 */

/**
 * Example 2: Conditionally wrap with provider in root
 *
 * ```tsx
 * import { isFeatureEnabled } from '@/features/system/feature/config';
 *
 * const featureEnabled = isFeatureEnabled();
 *
 * const appContent = featureEnabled ? (
 *   <FeatureProvider>
 *     {children}
 *   </FeatureProvider>
 * ) : (
 *   children
 * );
 * ```
 */

/**
 * Example 3: Validate configuration on startup
 *
 * ```ts
 * import { validateFeatureConfig } from '@/features/system/feature/config';
 *
 * const validation = validateFeatureConfig();
 * if (!validation.valid) {
 *   console.error('Feature configuration errors:', validation.errors);
 * }
 * if (validation.warnings.length > 0) {
 *   console.warn('Feature configuration warnings:', validation.warnings);
 * }
 * ```
 */

/**
 * Example 4: Environment variables in .env.local
 *
 * ```bash
 * # Feature Toggle
 * VITE_ENABLE_FEATURE=true
 *
 * # Provider Selection
 * VITE_FEATURE_PROVIDER=internal
 *
 * # Feature Settings
 * VITE_FEATURE_MAX_ITEMS=100
 * VITE_FEATURE_DEFAULT_STATUS=active
 *
 * # Provider Credentials (server-only, no VITE_ prefix)
 * EXTERNAL_API_KEY=your-api-key-here
 * ```
 */
