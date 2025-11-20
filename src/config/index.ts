// src/config/index.ts
// Frontend convenience re-exports from convex/config
// This allows frontend code to import from '@/config' instead of '../../convex/config'

/**
 * Re-export everything from convex/config
 * This provides a cleaner import path for frontend components
 *
 * Usage in frontend:
 * import { APP_CONFIG, NAVIGATION, ALL_ENTITY_TYPES } from '@/config';
 */
export * from '@/convex/config';
