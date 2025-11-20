// convex/lib/system/app_configs/constants.ts
// Constants for appConfigs module

export const APP_CONFIGS_CONSTANTS = {
  CATEGORIES: {
    CORE: 'core',
    BUSINESS: 'business',
    INTEGRATION: 'integration',
    UTILITY: 'utility',
  },
  SECTIONS: {
    LIMITS: 'limits',
    FEATURES: 'features',
    PROVIDERS: 'providers',
    DEFAULTS: 'defaults',
    SECURITY: 'security',
  },
  SCOPES: {
    GLOBAL: 'global',
    TENANT: 'tenant',
    USER: 'user',
  },
  VALUE_TYPES: {
    STRING: 'string',
    NUMBER: 'number',
    BOOLEAN: 'boolean',
    OBJECT: 'object',
    ARRAY: 'array',
  },
  OVERRIDE_SOURCES: {
    ADMIN: 'admin',
    API: 'api',
    MIGRATION: 'migration',
    SYSTEM: 'system',
  },
  PERMISSIONS: {
    VIEW: 'app_configs.view',
    EDIT: 'app_configs.edit',
    DELETE: 'app_configs.delete',
  },
} as const;
