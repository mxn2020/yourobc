// convex/lib/system/email/templates/constants.ts
// Business constants, permissions, and limits for email templates module

export const EMAIL_TEMPLATES_CONSTANTS = {
  PERMISSIONS: {
    VIEW: 'email_templates:view',
    CREATE: 'email_templates:create',
    EDIT: 'email_templates:edit',
    DELETE: 'email_templates:delete',
    PUBLISH: 'email_templates:publish',
  },

  STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    ARCHIVED: 'archived',
  },

  LIMITS: {
    MAX_NAME_LENGTH: 100,
    MIN_NAME_LENGTH: 3,
    MAX_SLUG_LENGTH: 50,
    MAX_SUBJECT_LENGTH: 200,
    MAX_DESCRIPTION_LENGTH: 500,
    MAX_VARIABLES: 20,
  },

  VALIDATION: {
    NAME_PATTERN: /^[a-zA-Z0-9\s\-_]+$/,
    SLUG_PATTERN: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    VARIABLE_PATTERN: /\{\{(\w+)\}\}/g,
  },
} as const;
