// convex/lib/system/app_settings/constants.ts

export const APP_SETTINGS_CONSTANTS = {
  // Categories
  CATEGORIES: {
    AI: 'ai',
    GENERAL: 'general',
    SECURITY: 'security',
    NOTIFICATIONS: 'notifications',
    BILLING: 'billing',
    INTEGRATIONS: 'integrations',
  },

  // Keys (kept for validation + defaults mapping)
  AI_SETTINGS_KEYS: {
    DEFAULT_MODEL: 'defaultModel',
    DEFAULT_PROVIDER: 'defaultProvider',
    MAX_TOKENS_DEFAULT: 'maxTokensDefault',
    TEMPERATURE_DEFAULT: 'temperatureDefault',
    ENABLE_AI_LOGGING: 'enableAILogging',
    AI_RATE_LIMIT: 'aiRateLimit',
    AI_COST_LIMIT: 'aiCostLimit',
  },

  GENERAL_SETTINGS_KEYS: {
    SITE_NAME: 'siteName',
    SITE_DESCRIPTION: 'siteDescription',
    MAINTENANCE_MODE: 'maintenanceMode',
    REGISTRATION_ENABLED: 'registrationEnabled',
    EMAIL_VERIFICATION_REQUIRED: 'emailVerificationRequired',
    DEFAULT_USER_ROLE: 'defaultUserRole',
    TIMEZONE: 'timezone',
    DATE_FORMAT: 'dateFormat',
  },

  SECURITY_SETTINGS_KEYS: {
    SESSION_TIMEOUT: 'sessionTimeout',
    MAX_LOGIN_ATTEMPTS: 'maxLoginAttempts',
    PASSWORD_MIN_LENGTH: 'passwordMinLength',
    REQUIRE_TWO_FACTOR: 'requireTwoFactor',
    FORCE_HTTPS: 'forceHttps',
    IP_WHITELIST: 'ipWhitelist',
    CORS_ORIGINS: 'corsOrigins',
  },

  NOTIFICATION_SETTINGS_KEYS: {
    ADMIN_ALERTS: 'adminAlerts',
    USER_WELCOME_EMAIL: 'userWelcomeEmail',
    PASSWORD_RESET_EMAIL: 'passwordResetEmail',
    SECURITY_NOTIFICATIONS: 'securityNotifications',
    EMAIL_FROM_ADDRESS: 'emailFromAddress',
    EMAIL_PROVIDER: 'emailProvider',
    SMTP_SETTINGS: 'smtpSettings',
  },

  BILLING_SETTINGS_KEYS: {
    BILLING_ENABLED: 'billingEnabled',
    DEFAULT_CURRENCY: 'defaultCurrency',
    STRIPE_ENABLED: 'stripeEnabled',
    INVOICE_PREFIX: 'invoicePrefix',
    TAX_RATE: 'taxRate',
  },

  INTEGRATION_SETTINGS_KEYS: {
    SLACK_ENABLED: 'slackEnabled',
    DISCORD_ENABLED: 'discordEnabled',
    GITHUB_ENABLED: 'githubEnabled',
    GOOGLE_DRIVE_ENABLED: 'googleDriveEnabled',
  },

  // Limits / validation infra
  LIMITS: {
    MAX_KEY_LENGTH: 100,
    MAX_NAME_LENGTH: 100,
    MAX_STRING_VALUE_LENGTH: 2000,
    MAX_DESCRIPTION_LENGTH: 500,
    MAX_ARRAY_ITEMS: 50,
    MAX_OBJECT_DEPTH: 5,
  },

  PERMISSIONS: {
    VIEW: 'appsettings:view',
    EDIT: 'appsettings:edit',
    DELETE: 'appsettings:delete',
    ADMIN_ONLY: 'appsettings:admin',
  },

  VALIDATION_RULES: {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    URL_REGEX: /^https?:\/\/.+/,
    IP_REGEX: /^(\d{1,3}\.){3}\d{1,3}$/,

    MIN_SESSION_TIMEOUT: 300,
    MAX_SESSION_TIMEOUT: 86400,

    MIN_PASSWORD_LENGTH: 6,
    MAX_PASSWORD_LENGTH: 128,

    MIN_LOGIN_ATTEMPTS: 1,
    MAX_LOGIN_ATTEMPTS: 20,
  },
} as const;

/**
 * New system export for defaults.
 * Queries/utils depend on this name.
 */
export const DEFAULT_APP_SETTING_VALUES = {
  // AI
  defaultModel: 'openai/gpt-4o-mini',
  defaultProvider: 'openai',
  maxTokensDefault: 1000,
  temperatureDefault: 0.7,
  enableAILogging: true,
  aiRateLimit: 1000,
  aiCostLimit: 100,

  // General
  siteName: 'Admin Portal',
  siteDescription: 'Project management and AI-powered workspace',
  maintenanceMode: false,
  registrationEnabled: true,
  emailVerificationRequired: false,
  defaultUserRole: 'user',
  timezone: 'UTC',
  dateFormat: 'MM/dd/yyyy',

  // Security
  sessionTimeout: 3600,
  maxLoginAttempts: 5,
  passwordMinLength: 8,
  requireTwoFactor: false,
  forceHttps: false,
  ipWhitelist: [] as string[],
  corsOrigins: [] as string[],

  // Notifications
  adminAlerts: true,
  userWelcomeEmail: true,
  passwordResetEmail: true,
  securityNotifications: true,
  emailFromAddress: 'noreply@example.com',
  emailProvider: 'smtp',

  // Billing
  billingEnabled: false,
  defaultCurrency: 'USD',
  stripeEnabled: false,
  invoicePrefix: 'INV-',
  taxRate: 0,

  // Integrations
  slackEnabled: false,
  discordEnabled: false,
  githubEnabled: false,
  googleDriveEnabled: false,
} as const;
