// convex/config/system/entities/auth.entities.ts
// ⚠️ BOILERPLATE FILE - DO NOT MODIFY IN YOUR APPS

/**
 * Authentication and authorization entity types
 * These entities support user and team management
 */
export const AUTH_ENTITY_TYPES = [
  'system_user',
  'system_team',
] as const;

export type AuthEntityType = typeof AUTH_ENTITY_TYPES[number];
