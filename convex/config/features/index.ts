// convex/config/features/index.ts
/**
 * CENTRAL FEATURE REGISTRY
 *
 * Single source of truth for all feature configurations.
 * This file consolidates all feature configs and provides
 * unified access to feature flags and settings.
 *
 * Usage:
 * - Import { FEATURES } for all feature configs
 * - Import { validateAllFeatures } to validate on startup
 * - Import { isFeatureEnabled } for feature checks
 */

// Import existing configs
import { BLOG_CONFIG, validateBlogConfig } from '../../../src/features/boilerplate/blog/config';
import { PAYMENT_CONFIG } from '../../../src/features/boilerplate/payments/config/payment-config';
import { AUTH_CONFIG, validateAuthConfig } from '../../../src/features/boilerplate/auth/config';
import { PROJECTS_CONFIG, validateProjectsConfig } from '../../../src/features/boilerplate/projects/config';
import { AI_CONFIG, validateAIConfig } from '../../../src/features/boilerplate/ai-core/config';
import { NOTIFICATIONS_CONFIG, validateNotificationsConfig } from '../../../src/features/boilerplate/notifications/config';
import { loggerConfig } from '../../../src/features/boilerplate/logging/config/logging-config';
import { analyticsConfig } from '../../../src/features/boilerplate/analytics/config/analytics-config';
import { INTEGRATIONS_CONFIG } from '../../../src/features/boilerplate/integrations/config/integrations-config';
import { getSupportingConfig } from '../../../src/features/boilerplate/supporting/config/supporting.config';

// ============================================
// 1. FEATURE REGISTRY TYPE
// ============================================

export interface FeatureInfo {
  name: string;
  version: string;
  enabled: boolean;
  config: any; // The full config object
  category: 'core' | 'business' | 'integration' | 'utility';
  dependencies?: string[]; // Other features this depends on
  validate?: () => { valid: boolean; errors: string[]; warnings: string[] };
}

export interface FeaturesRegistry {
  // Core Features
  auth: FeatureInfo;
  projects: FeatureInfo;
  notifications: FeatureInfo;

  // Business Features
  blog: FeatureInfo;
  payments: FeatureInfo;
  ai: FeatureInfo;

  // Integration Features
  integrations: FeatureInfo;
  analytics: FeatureInfo;

  // Utility Features
  logging: FeatureInfo;
  supporting: FeatureInfo;
}

// ============================================
// 2. FEATURE REGISTRY
// ============================================

export const FEATURES: FeaturesRegistry = {
  // Core Features
  auth: {
    name: 'Authentication',
    version: AUTH_CONFIG.version,
    enabled: AUTH_CONFIG.enabled,
    config: AUTH_CONFIG,
    category: 'core',
    validate: validateAuthConfig,
  },
  projects: {
    name: 'Projects',
    version: PROJECTS_CONFIG.version,
    enabled: PROJECTS_CONFIG.enabled,
    config: PROJECTS_CONFIG,
    category: 'core',
    dependencies: ['auth'],
    validate: validateProjectsConfig,
  },
  notifications: {
    name: 'Notifications',
    version: NOTIFICATIONS_CONFIG.version,
    enabled: NOTIFICATIONS_CONFIG.enabled,
    config: NOTIFICATIONS_CONFIG,
    category: 'core',
    dependencies: ['auth'],
    validate: validateNotificationsConfig,
  },

  // Business Features
  blog: {
    name: 'Blog',
    version: '1.0.0',
    enabled: true, // Blog is always available, controlled by VITE_ENABLE_BLOG env var
    config: BLOG_CONFIG,
    category: 'business',
    dependencies: ['auth'],
    validate: validateBlogConfig,
  },
  payments: {
    name: 'Payments',
    version: '1.0.0',
    enabled: PAYMENT_CONFIG.primaryProvider !== null,
    config: PAYMENT_CONFIG,
    category: 'business',
    dependencies: ['auth'],
  },
  ai: {
    name: 'AI Features',
    version: AI_CONFIG.version,
    enabled: AI_CONFIG.enabled,
    config: AI_CONFIG,
    category: 'business',
    dependencies: ['auth'],
    validate: validateAIConfig,
  },

  // Integration Features
  integrations: {
    name: 'Integrations',
    version: '1.0.0',
    enabled: true, // Always available
    config: INTEGRATIONS_CONFIG,
    category: 'integration',
    dependencies: ['auth'],
  },
  analytics: {
    name: 'Analytics',
    version: '1.0.0',
    enabled: analyticsConfig.enableTracking,
    config: analyticsConfig,
    category: 'integration',
  },

  // Utility Features
  logging: {
    name: 'Logging',
    version: '1.0.0',
    enabled: loggerConfig.enabled,
    config: loggerConfig,
    category: 'utility',
  },
  supporting: {
    name: 'Supporting Features',
    version: '1.0.0',
    enabled: true,
    config: getSupportingConfig(),
    category: 'utility',
    dependencies: ['auth', 'projects'],
  },
};

// ============================================
// 3. VALIDATION FUNCTIONS
// ============================================

export interface ValidationResult {
  feature: string;
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate all feature configurations
 * Call this during app initialization to catch config errors early
 */
export function validateAllFeatures(): {
  valid: boolean;
  results: ValidationResult[];
  summary: {
    totalFeatures: number;
    validFeatures: number;
    invalidFeatures: number;
    totalErrors: number;
    totalWarnings: number;
  };
} {
  const results: ValidationResult[] = [];

  // Validate each feature that has a validate function
  Object.entries(FEATURES).forEach(([key, feature]) => {
    if (feature.validate) {
      const validation = feature.validate();
      results.push({
        feature: key,
        valid: validation.valid,
        errors: validation.errors,
        warnings: validation.warnings,
      });
    }
  });

  // Calculate summary
  const summary = {
    totalFeatures: results.length,
    validFeatures: results.filter(r => r.valid).length,
    invalidFeatures: results.filter(r => !r.valid).length,
    totalErrors: results.reduce((sum, r) => sum + r.errors.length, 0),
    totalWarnings: results.reduce((sum, r) => sum + r.warnings.length, 0),
  };

  return {
    valid: summary.invalidFeatures === 0,
    results,
    summary,
  };
}

/**
 * Log validation results to console
 */
export function logValidationResults(): void {
  const validation = validateAllFeatures();

  console.log('\n=== Feature Configuration Validation ===\n');

  if (validation.valid) {
    console.log('✅ All feature configurations are valid!\n');
  } else {
    console.error(`❌ ${validation.summary.invalidFeatures} feature(s) have configuration errors\n`);
  }

  // Log each feature's validation result
  validation.results.forEach(result => {
    if (!result.valid || result.warnings.length > 0) {
      console.log(`\n📦 ${result.feature}:`);

      if (result.errors.length > 0) {
        console.error('  ❌ Errors:');
        result.errors.forEach(error => console.error(`     - ${error}`));
      }

      if (result.warnings.length > 0) {
        console.warn('  ⚠️  Warnings:');
        result.warnings.forEach(warning => console.warn(`     - ${warning}`));
      }
    }
  });

  // Summary
  console.log('\n=== Summary ===');
  console.log(`Total Features: ${validation.summary.totalFeatures}`);
  console.log(`Valid: ${validation.summary.validFeatures}`);
  console.log(`Invalid: ${validation.summary.invalidFeatures}`);
  console.log(`Errors: ${validation.summary.totalErrors}`);
  console.log(`Warnings: ${validation.summary.totalWarnings}\n`);
}

// ============================================
// 4. FEATURE HELPERS
// ============================================

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof FeaturesRegistry): boolean {
  return FEATURES[feature]?.enabled || false;
}

/**
 * Get feature configuration
 */
export function getFeatureConfig<K extends keyof FeaturesRegistry>(
  feature: K
): FeaturesRegistry[K]['config'] {
  return FEATURES[feature].config;
}

/**
 * Get all enabled features
 */
export function getEnabledFeatures(): Array<keyof FeaturesRegistry> {
  return Object.entries(FEATURES)
    .filter(([_, info]) => info.enabled)
    .map(([key, _]) => key as keyof FeaturesRegistry);
}

/**
 * Get features by category
 */
export function getFeaturesByCategory(
  category: 'core' | 'business' | 'integration' | 'utility'
): Array<keyof FeaturesRegistry> {
  return Object.entries(FEATURES)
    .filter(([_, info]) => info.category === category)
    .map(([key, _]) => key as keyof FeaturesRegistry);
}

/**
 * Check if all dependencies for a feature are enabled
 */
export function areDependenciesMet(feature: keyof FeaturesRegistry): boolean {
  const featureInfo = FEATURES[feature];
  if (!featureInfo.dependencies) return true;

  return featureInfo.dependencies.every(dep =>
    isFeatureEnabled(dep as keyof FeaturesRegistry)
  );
}

/**
 * Get feature info including dependency status
 */
export function getFeatureStatus(feature: keyof FeaturesRegistry) {
  const featureInfo = FEATURES[feature];
  return {
    ...featureInfo,
    dependenciesMet: areDependenciesMet(feature),
    missingDependencies: featureInfo.dependencies?.filter(
      dep => !isFeatureEnabled(dep as keyof FeaturesRegistry)
    ) || [],
  };
}

// ============================================
// 5. DEFAULT EXPORT
// ============================================

export default FEATURES;

// ============================================
// 7. VALIDATION ON DEMAND
// ============================================

/**
 * Note: Auto-validation is disabled in Convex environment
 * Use the validateAllConfigs query from the admin UI instead
 * or call validateAllFeatures() manually when needed
 */
