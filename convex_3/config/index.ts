// convex/config/index.ts
// Main configuration export - Merges system and app configurations
// This file automatically combines all configuration sources into unified exports

// ============================================================================
// SYSTEM IMPORTS (Don't modify)
// ============================================================================
import {
  ALL_SYSTEM_ENTITY_TYPES,
  SYSTEM_ENTITY_TYPES,
  SYSTEM_COMMENTABLE_ENTITY_TYPES,
  SYSTEM_DOCUMENTABLE_ENTITY_TYPES,
  SYSTEM_NOTIFIABLE_ENTITY_TYPES,
  type SystemEntityType,
} from './system/entities.config';

import {
  DASHBOARD_NAVIGATION,
  ADMIN_NAVIGATION,
  PROJECTS_NAVIGATION,
  SECTION_INDICATORS,
} from './system/navigation.config';

// ============================================================================
// APP IMPORTS (Customize in app/ folder)
// ============================================================================
import {
  ALL_APP_ENTITY_TYPES,
  APP_ENTITY_TYPES,
  ADDON_ENTITY_TYPES,
  APP_COMMENTABLE_ENTITY_TYPES,
  APP_DOCUMENTABLE_ENTITY_TYPES,
  APP_NOTIFIABLE_ENTITY_TYPES,
} from './app/entities.config';

import {
  APP_ADDONS,
  ADDON_NAVIGATION,
} from './app/navigation.config';

import { EMAIL_CONFIG } from './app/email.config';

import { APP_METADATA, FEATURE_FLAGS } from './app/metadata.config';

// Feature Registry
import { FEATURES, validateAllFeatures, isFeatureEnabled as checkFeature } from './features';

// ============================================================================
// MERGED EXPORTS - Single Source of Truth
// ============================================================================

/**
 * All entity types (system + app)
 * Use this constant throughout your app
 */
export const ALL_ENTITY_TYPES = [
  ...ALL_SYSTEM_ENTITY_TYPES,
  ...ALL_APP_ENTITY_TYPES,
] as const;

/**
 * Entity type TypeScript type
 */
export type EntityType = typeof ALL_ENTITY_TYPES[number];

/**
 * All commentable entity types (system + app)
 */
export const COMMENTABLE_ENTITY_TYPES = [
  ...SYSTEM_COMMENTABLE_ENTITY_TYPES,
  ...APP_COMMENTABLE_ENTITY_TYPES,
] as const;

/**
 * Commentable entity type
 */
export type CommentableEntityType = typeof COMMENTABLE_ENTITY_TYPES[number];

/**
 * All documentable entity types (system + app)
 */
export const DOCUMENTABLE_ENTITY_TYPES = [
  ...SYSTEM_DOCUMENTABLE_ENTITY_TYPES,
  ...APP_DOCUMENTABLE_ENTITY_TYPES,
] as const;

/**
 * Documentable entity type
 */
export type DocumentableEntityType = typeof DOCUMENTABLE_ENTITY_TYPES[number];

/**
 * All notifiable entity types (system + app)
 */
export const NOTIFIABLE_ENTITY_TYPES = [
  ...SYSTEM_NOTIFIABLE_ENTITY_TYPES,
  ...APP_NOTIFIABLE_ENTITY_TYPES,
] as const;

/**
 * Notifiable entity type
 */
export type NotifiableEntityType = typeof NOTIFIABLE_ENTITY_TYPES[number];

/**
 * Navigation configuration (system + app)
 */
export const NAVIGATION = {
  dashboard: DASHBOARD_NAVIGATION,
  admin: ADMIN_NAVIGATION,
  projects: PROJECTS_NAVIGATION,
  addons: APP_ADDONS,
  addonNavigation: ADDON_NAVIGATION,
  sectionIndicators: SECTION_INDICATORS,
} as const;

/**
 * Complete app configuration
 * Single export containing all app settings
 */
export const APP_CONFIG = {
  metadata: APP_METADATA,
  email: EMAIL_CONFIG,
  features: FEATURE_FLAGS,
  navigation: NAVIGATION,
  entities: {
    all: ALL_ENTITY_TYPES,
    system: SYSTEM_ENTITY_TYPES,
    app: ALL_APP_ENTITY_TYPES,
    commentable: COMMENTABLE_ENTITY_TYPES,
    documentable: DOCUMENTABLE_ENTITY_TYPES,
    notifiable: NOTIFIABLE_ENTITY_TYPES,
  },
} as const;

// ============================================================================
// RE-EXPORTS for convenience
// ============================================================================

// Entity types
export {
  SYSTEM_ENTITY_TYPES,
  APP_ENTITY_TYPES,
  ADDON_ENTITY_TYPES,
  ALL_APP_ENTITY_TYPES,
};

// Navigation
export {
  DASHBOARD_NAVIGATION,
  ADMIN_NAVIGATION,
  PROJECTS_NAVIGATION,
  APP_ADDONS,
  ADDON_NAVIGATION,
  SECTION_INDICATORS,
};

// App config
export {
  APP_METADATA,
  EMAIL_CONFIG,
  FEATURE_FLAGS,
};

// Feature Registry (NEW - Centralized feature configurations)
export {
  FEATURES,
  validateAllFeatures,
  checkFeature,
};

// Types
export * from './types';
export type { SystemEntityType };

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert snake_case entity type to Title Case label
 * @example 'ai_log' -> 'AI Log', 'wiki_entry' -> 'Wiki Entry'
 */
function toTitleCase(snakeCase: string): string {
  return snakeCase
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Generate labels for all entity types programmatically
 * Automatically converts snake_case entity types to readable Title Case labels
 */
export const ENTITY_TYPE_LABELS = Object.fromEntries(
  ALL_ENTITY_TYPES.map(type => [type, toTitleCase(type)])
) as { [K in EntityType]: string };

/**
 * Check if an entity type is commentable
 */
export function isCommentable(entityType: string): entityType is CommentableEntityType {
  return (COMMENTABLE_ENTITY_TYPES as readonly string[]).includes(entityType);
}

/**
 * Check if an entity type is documentable
 */
export function isDocumentable(entityType: string): entityType is DocumentableEntityType {
  return (DOCUMENTABLE_ENTITY_TYPES as readonly string[]).includes(entityType);
}

/**
 * Check if an entity type is notifiable
 */
export function isNotifiable(entityType: string): entityType is NotifiableEntityType {
  return (NOTIFIABLE_ENTITY_TYPES as readonly string[]).includes(entityType);
}

/**
 * Get addon configuration by ID
 */
export function getAddonById(addonId: string) {
  return APP_ADDONS.find(addon => addon.id === addonId);
}

/**
 * Get navigation items for an addon
 */
export function getAddonNavigation(addonId: string) {
  return ADDON_NAVIGATION[addonId] || [];
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof FEATURE_FLAGS): boolean {
  return FEATURE_FLAGS[feature] === true;
}
