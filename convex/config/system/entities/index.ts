// convex/config/system/entities/index.ts
// ⚠️ BOILERPLATE FILE - DO NOT MODIFY IN YOUR APPS

// Import all domain-specific entity types
export * from './system.entities';
export * from './email.entities';
export * from './auth.entities';
export * from './projects.entities';
export * from './supporting.entities';

// Re-import for combining
import { SYSTEM_ENTITY_TYPES } from './system.entities';
import { EMAIL_ENTITY_TYPES } from './email.entities';
import { AUTH_ENTITY_TYPES } from './auth.entities';
import { PROJECTS_ENTITY_TYPES } from './projects.entities';
import { SUPPORTING_ENTITY_TYPES } from './supporting.entities';

/**
 * System entity types - Built-in system features
 * These support features like projects, tasks, teams, etc.
 */
export const BOILERPLATE_ENTITY_TYPES = [
  ...PROJECTS_ENTITY_TYPES,
  ...AUTH_ENTITY_TYPES,
  ...SUPPORTING_ENTITY_TYPES,
] as const;

/**
 * System commentable entities
 * Entities that support the comments feature
 */
export const BOILERPLATE_COMMENTABLE_ENTITY_TYPES = [
  'system_project',
  'system_task',
  'system_user',
] as const;

/**
 * System documentable entities
 * Entities that support the documents feature
 */
export const BOILERPLATE_DOCUMENTABLE_ENTITY_TYPES = [
  'system_project',
  'system_task',
  'system_user',
] as const;

/**
 * System notifiable entities
 * Entities that can receive notifications
 */
export const BOILERPLATE_NOTIFIABLE_ENTITY_TYPES = [
  'system_user',
  'system_user',
  'system_team',
] as const;

/**
 * All system entities combined
 */
export const ALL_BOILERPLATE_ENTITY_TYPES = [
  ...SYSTEM_ENTITY_TYPES,
  ...EMAIL_ENTITY_TYPES,
  ...BOILERPLATE_ENTITY_TYPES,
] as const;

/**
 * System entity type
 */
export type SystemEntityType = typeof ALL_BOILERPLATE_ENTITY_TYPES[number];
