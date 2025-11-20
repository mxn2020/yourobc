// convex/config/boilerplate/entities/system.entities.ts
// ⚠️ BOILERPLATE FILE - DO NOT MODIFY IN YOUR APPS

/**
 * Core system entity types
 * These are essential entities for the boilerplate's core functionality
 */
export const SYSTEM_ENTITY_TYPES = [
  'system',
  'system_ai_log',
  'system_ai_model',
  'system_audit_log',
  'system_notification',
  'system_permission_request',
  'system_setting',
  'system_project',
  'system_user',
  'system_user_profile',
  'system_settings',
] as const;

export type SystemEntityType = typeof SYSTEM_ENTITY_TYPES[number];
