// convex/config/system/entities/email.entities.ts
// ⚠️ SYSTEM FILE - DO NOT MODIFY IN YOUR APPS

/**
 * Email system entity types
 * These entities support email functionality
 */
export const EMAIL_ENTITY_TYPES = [
  'system_email_config',
  'system_email_template',
  'system_email_log',
] as const;

export type EmailEntityType = typeof EMAIL_ENTITY_TYPES[number];
