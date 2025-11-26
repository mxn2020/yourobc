// convex/lib/system/app_settings/utils.ts

import { UserRole } from '../../../../types';

import {
  APP_SETTINGS_CONSTANTS,
  DEFAULT_APP_SETTING_VALUES,
} from './constants';

import type {
  AppSetting,
  SettingValue,
  SettingCategory,
  AllSettingsData,
  CreateAppSettingData,
  UpdateAppSettingData,
} from './types';



/**
 * NEW PATTERN: trim incoming payload.
 */
export function trimAppSettingData<
  T extends Partial<CreateAppSettingData | UpdateAppSettingData>
>(data: T): T {
  const trimmed: T = { ...data };
  if ('name' in trimmed && typeof trimmed.name === 'string') {
    trimmed.name = trimmed.name.trim() as T['name'];
  }
  if ('key' in trimmed && typeof trimmed.key === 'string') {
    trimmed.key = trimmed.key.trim() as T['key'];
  }
  return trimmed;
}

/**
 * NEW PATTERN: validate required fields + optional richer checks.
 * - If you pass { key, value, category }, you get old validations too.
 */
export function validateAppSettingData(
  data: Partial<CreateAppSettingData | UpdateAppSettingData> & {
    value: SettingValue | null;
    category?: SettingCategory;
  }
): string[] {
  const errors: string[] = [];

  // Required fields (new-style)
  if (data.name !== undefined && typeof data.name === 'string' && !data.name.trim()) {
    errors.push('Name is required');
  }
  if ('key' in data && data.key !== undefined && typeof data.key === 'string' && !data.key.trim()) {
    errors.push('Key is required');
  }

  // Backward-compatible old-style checks (only if info is present)
  const key = data.key;
  const value = data.value;
  const category = data.category;

  if (key && value !== undefined) {
    // key length check
    if (key.length > APP_SETTINGS_CONSTANTS.LIMITS.MAX_KEY_LENGTH) {
      errors.push(
        `Setting key must be less than ${APP_SETTINGS_CONSTANTS.LIMITS.MAX_KEY_LENGTH} characters`
      );
    }

    // category-specific checks
    if (category) {
      errors.push(...validateSettingByCategory(key, value, category));
    }

    // general value checks
    if (typeof value === 'string'
        && value.length > APP_SETTINGS_CONSTANTS.LIMITS.MAX_STRING_VALUE_LENGTH) {
      errors.push(
        `String values must be less than ${APP_SETTINGS_CONSTANTS.LIMITS.MAX_STRING_VALUE_LENGTH} characters`
      );
    }

    if (Array.isArray(value)
        && value.length > APP_SETTINGS_CONSTANTS.LIMITS.MAX_ARRAY_ITEMS) {
      errors.push(
        `Arrays must have less than ${APP_SETTINGS_CONSTANTS.LIMITS.MAX_ARRAY_ITEMS} items`
      );
    }
  }

  return errors;
}

/**
 * Old behavior: category/key validation.
 * Keep if your mutations still need it.
 */
export function validateSettingByCategory(
  key: string,
  value: SettingValue,
  category: SettingCategory
): string[] {
  switch (category) {
    case 'ai': return validateAISetting(key, value);
    case 'general': return validateGeneralSetting(key, value);
    case 'security': return validateSecuritySetting(key, value);
    case 'notifications': return validateNotificationSetting(key, value);
    case 'billing': return validateBillingSetting(key, value);
    case 'integrations': return validateIntegrationSetting(key, value);
    default: return [];
  }
}

function validateAISetting(key: string, value: SettingValue): string[] {
  const errors: string[] = [];
  switch (key) {
    case APP_SETTINGS_CONSTANTS.AI_SETTINGS_KEYS.MAX_TOKENS_DEFAULT:
      if (typeof value !== 'number' || value < 1 || value > 100000) {
        errors.push('Max tokens must be a number between 1 and 100000');
      }
      break;
    case APP_SETTINGS_CONSTANTS.AI_SETTINGS_KEYS.TEMPERATURE_DEFAULT:
      if (typeof value !== 'number' || value < 0 || value > 2) {
        errors.push('Temperature must be a number between 0 and 2');
      }
      break;
    case APP_SETTINGS_CONSTANTS.AI_SETTINGS_KEYS.AI_RATE_LIMIT:
      if (typeof value !== 'number' || value < 1) {
        errors.push('AI rate limit must be a positive number');
      }
      break;
    case APP_SETTINGS_CONSTANTS.AI_SETTINGS_KEYS.AI_COST_LIMIT:
      if (typeof value !== 'number' || value < 0) {
        errors.push('AI cost limit must be a non-negative number');
      }
      break;
  }
  return errors;
}

function validateGeneralSetting(key: string, value: SettingValue): string[] {
  const errors: string[] = [];
  switch (key) {
    case APP_SETTINGS_CONSTANTS.GENERAL_SETTINGS_KEYS.SITE_NAME:
      if (typeof value !== 'string' || value.length < 1 || value.length > 100) {
        errors.push('Site name must be between 1 and 100 characters');
      }
      break;
    case APP_SETTINGS_CONSTANTS.GENERAL_SETTINGS_KEYS.DEFAULT_USER_ROLE:
      if (!['admin', 'user', 'moderator'].includes(value as string)) {
        errors.push('Default user role must be admin, user, or moderator');
      }
      break;
  }
  return errors;
}

function validateSecuritySetting(key: string, value: SettingValue): string[] {
  const errors: string[] = [];
  switch (key) {
    case APP_SETTINGS_CONSTANTS.SECURITY_SETTINGS_KEYS.SESSION_TIMEOUT:
      if (typeof value !== 'number'
          || value < APP_SETTINGS_CONSTANTS.VALIDATION_RULES.MIN_SESSION_TIMEOUT
          || value > APP_SETTINGS_CONSTANTS.VALIDATION_RULES.MAX_SESSION_TIMEOUT) {
        errors.push(
          `Session timeout must be between ${APP_SETTINGS_CONSTANTS.VALIDATION_RULES.MIN_SESSION_TIMEOUT} and ${APP_SETTINGS_CONSTANTS.VALIDATION_RULES.MAX_SESSION_TIMEOUT} seconds`
        );
      }
      break;

    case APP_SETTINGS_CONSTANTS.SECURITY_SETTINGS_KEYS.MAX_LOGIN_ATTEMPTS:
      if (typeof value !== 'number'
          || value < APP_SETTINGS_CONSTANTS.VALIDATION_RULES.MIN_LOGIN_ATTEMPTS
          || value > APP_SETTINGS_CONSTANTS.VALIDATION_RULES.MAX_LOGIN_ATTEMPTS) {
        errors.push(
          `Max login attempts must be between ${APP_SETTINGS_CONSTANTS.VALIDATION_RULES.MIN_LOGIN_ATTEMPTS} and ${APP_SETTINGS_CONSTANTS.VALIDATION_RULES.MAX_LOGIN_ATTEMPTS}`
        );
      }
      break;

    case APP_SETTINGS_CONSTANTS.SECURITY_SETTINGS_KEYS.PASSWORD_MIN_LENGTH:
      if (typeof value !== 'number'
          || value < APP_SETTINGS_CONSTANTS.VALIDATION_RULES.MIN_PASSWORD_LENGTH
          || value > APP_SETTINGS_CONSTANTS.VALIDATION_RULES.MAX_PASSWORD_LENGTH) {
        errors.push(
          `Password minimum length must be between ${APP_SETTINGS_CONSTANTS.VALIDATION_RULES.MIN_PASSWORD_LENGTH} and ${APP_SETTINGS_CONSTANTS.VALIDATION_RULES.MAX_PASSWORD_LENGTH}`
        );
      }
      break;

    case APP_SETTINGS_CONSTANTS.SECURITY_SETTINGS_KEYS.IP_WHITELIST:
      if (Array.isArray(value)) {
        value.forEach((ip) => {
          if (!APP_SETTINGS_CONSTANTS.VALIDATION_RULES.IP_REGEX.test(ip)) {
            errors.push(`Invalid IP address in whitelist: ${ip}`);
          }
        });
      }
      break;

    case APP_SETTINGS_CONSTANTS.SECURITY_SETTINGS_KEYS.CORS_ORIGINS:
      if (Array.isArray(value)) {
        value.forEach((origin) => {
          if (!APP_SETTINGS_CONSTANTS.VALIDATION_RULES.URL_REGEX.test(origin)) {
            errors.push(`Invalid URL in CORS origins: ${origin}`);
          }
        });
      }
      break;
  }
  return errors;
}

function validateNotificationSetting(key: string, value: SettingValue): string[] {
  const errors: string[] = [];
  if (
    key === APP_SETTINGS_CONSTANTS.NOTIFICATION_SETTINGS_KEYS.EMAIL_FROM_ADDRESS &&
    typeof value === 'string' &&
    !APP_SETTINGS_CONSTANTS.VALIDATION_RULES.EMAIL_REGEX.test(value)
  ) {
    errors.push('Invalid email address format');
  }
  return errors;
}

function validateBillingSetting(key: string, value: SettingValue): string[] {
  const errors: string[] = [];
  if (key === 'taxRate') {
    if (typeof value !== 'number' || value < 0 || value > 1) {
      errors.push('Tax rate must be a number between 0 and 1');
    }
  }
  return errors;
}

function validateIntegrationSetting(_key: string, _value: SettingValue): string[] {
  return [];
}

/**
 * Used by queries: array -> object
 */
export function transformSettingsArrayToObject<T = any>(
  settings: AppSetting[]
): Record<string, T> {
  const obj: Record<string, T> = {};
  for (const s of settings) obj[s.key] = s.value as T;
  return obj;
}

/**
 * Used by queries: defaults merge
 */
export function mergeSettingsWithDefaults<T extends AllSettingsData>(
  settings: Record<string, any>,
  category: SettingCategory
): T {
  const defaults = getDefaultsForCategory(category);
  return { ...defaults, ...settings } as T;
}

function getDefaultsForCategory(
  category: SettingCategory
): Partial<AllSettingsData> {
  const d = DEFAULT_APP_SETTING_VALUES;

  switch (category) {
    case 'ai':
      return {
        defaultModel: d.defaultModel,
        defaultProvider: d.defaultProvider,
        maxTokensDefault: d.maxTokensDefault,
        temperatureDefault: d.temperatureDefault,
        enableAILogging: d.enableAILogging,
        aiRateLimit: d.aiRateLimit,
        aiCostLimit: d.aiCostLimit,
      };
    case 'general':
      return {
        siteName: d.siteName,
        siteDescription: d.siteDescription,
        maintenanceMode: d.maintenanceMode,
        registrationEnabled: d.registrationEnabled,
        emailVerificationRequired: d.emailVerificationRequired,
        defaultUserRole: d.defaultUserRole,
        timezone: d.timezone,
        dateFormat: d.dateFormat,
      };
    case 'security':
      return {
        sessionTimeout: d.sessionTimeout,
        maxLoginAttempts: d.maxLoginAttempts,
        passwordMinLength: d.passwordMinLength,
        requireTwoFactor: d.requireTwoFactor,
        forceHttps: d.forceHttps,
        ipWhitelist: d.ipWhitelist,
        corsOrigins: d.corsOrigins,
      };
    case 'notifications':
      return {
        adminAlerts: d.adminAlerts,
        userWelcomeEmail: d.userWelcomeEmail,
        passwordResetEmail: d.passwordResetEmail,
        securityNotifications: d.securityNotifications,
        emailFromAddress: d.emailFromAddress,
        emailProvider: d.emailProvider,
      };
    case 'billing':
      return {
        billingEnabled: d.billingEnabled,
        defaultCurrency: d.defaultCurrency,
        stripeEnabled: d.stripeEnabled,
        invoicePrefix: d.invoicePrefix,
        taxRate: d.taxRate,
      };
    case 'integrations':
      return {
        slackEnabled: d.slackEnabled,
        discordEnabled: d.discordEnabled,
        githubEnabled: d.githubEnabled,
        googleDriveEnabled: d.googleDriveEnabled,
      };
    default:
      return {};
  }
}

/**
 * Used by queries: access rules
 */
export function canUserAccessSetting(
  setting: AppSetting,
  userRole: UserRole
): boolean {
  if (userRole === 'admin' || userRole === 'superadmin') return true;
  return setting.isPublic;
}

/**
 * Used by queries: hide sensitive values
 */
export function sanitizeSettingValue(value: any): any {
  if (typeof value === 'object' && value !== null) {
    const sanitized = { ...value };
    if ('password' in sanitized) sanitized.password = '***';
    return sanitized;
  }
  return value;
}

export function getSettingDescription(key: string): string {
  const descriptions: Record<string, string> = {
    // AI Settings
    defaultModel: 'Default AI model to use for text generation',
    defaultProvider: 'Default AI provider for model selection',
    maxTokensDefault: 'Default maximum tokens for AI requests',
    temperatureDefault: 'Default temperature for AI requests',
    enableAILogging: 'Enable logging of AI usage and requests',
    aiRateLimit: 'Maximum AI requests per hour per user',
    aiCostLimit: 'Maximum AI cost per month per user',
    
    // General Settings
    siteName: 'Name of the application',
    siteDescription: 'Description of the application',
    maintenanceMode: 'Enable maintenance mode to temporarily disable access',
    registrationEnabled: 'Allow new users to register accounts',
    emailVerificationRequired: 'Require users to verify their email before accessing the system',
    defaultUserRole: 'Default role assigned to new users',
    timezone: 'Default timezone for the application',
    dateFormat: 'Default date format used throughout the application',
    
    // Security Settings
    sessionTimeout: 'Session timeout duration in seconds',
    maxLoginAttempts: 'Maximum number of failed login attempts before account lockout',
    passwordMinLength: 'Minimum required password length',
    requireTwoFactor: 'Require two-factor authentication for all users',
    forceHttps: 'Force all connections to use HTTPS',
    ipWhitelist: 'List of allowed IP addresses (empty means all IPs allowed)',
    corsOrigins: 'List of allowed CORS origins',
    
    // Notification Settings
    adminAlerts: 'Send notifications about system events and issues to administrators',
    userWelcomeEmail: 'Send welcome emails to new users upon registration',
    passwordResetEmail: 'Send password reset links via email',
    securityNotifications: 'Notify users of security events like login attempts',
    emailFromAddress: 'Email address used as sender for system emails',
    emailProvider: 'Email service provider (smtp, sendgrid, etc.)',
    smtpSettings: 'SMTP server configuration for email delivery',
    
    // Billing Settings
    billingEnabled: 'Enable billing and subscription features',
    defaultCurrency: 'Default currency for billing',
    stripeEnabled: 'Enable Stripe payment processing',
    invoicePrefix: 'Prefix for invoice numbers',
    taxRate: 'Default tax rate applied to invoices',
    
    // Integration Settings
    slackEnabled: 'Enable Slack integration',
    discordEnabled: 'Enable Discord integration',
    githubEnabled: 'Enable GitHub integration',
    googleDriveEnabled: 'Enable Google Drive integration',
  };
  
  return descriptions[key] || `Setting for ${key}`;
}

export function getDefaultValue(key: string): SettingValue {
  return DEFAULT_APP_SETTING_VALUES[key as keyof typeof DEFAULT_APP_SETTING_VALUES];
}

export function isPublicSetting(key: string, category: SettingCategory): boolean {
  // AI settings are generally public for users to see
  if (category === 'ai') return true;
  
  // Some general settings are public
  if (category === 'general' && ['siteName', 'siteDescription', 'registrationEnabled'].includes(key)) {
    return true;
  }
  
  // Security, notifications, billing, and most integrations are admin-only
  return false;
}
