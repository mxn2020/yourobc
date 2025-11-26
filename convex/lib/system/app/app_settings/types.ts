// convex/lib/system/app_settings/types.ts
import type { Doc, Id } from '@/generated/dataModel';
import { APP_SETTINGS_CONSTANTS } from './constants';

export type AppSetting = Doc<'appSettings'>;
export type AppSettingId = Id<'appSettings'>;

// -----------------------------
// Core CRUD payloads (new style)
// -----------------------------
export interface CreateAppSettingData {
  name: string;
  key: string;
  value: any;
  category: SettingCategory;
  description?: string;
  isPublic?: boolean;
}

export interface UpdateAppSettingData {
  name?: string;
  key?: string;
  value?: any;
  category?: SettingCategory;
  description?: string;
  isPublic?: boolean;
}

// -----------------------------
// Utility types (kept)
// -----------------------------
export type SettingValue =
  | string
  | number
  | boolean
  | object
  | any[];

export type SettingCategory =
  | typeof APP_SETTINGS_CONSTANTS.CATEGORIES.AI
  | typeof APP_SETTINGS_CONSTANTS.CATEGORIES.GENERAL
  | typeof APP_SETTINGS_CONSTANTS.CATEGORIES.SECURITY
  | typeof APP_SETTINGS_CONSTANTS.CATEGORIES.NOTIFICATIONS
  | typeof APP_SETTINGS_CONSTANTS.CATEGORIES.BILLING
  | typeof APP_SETTINGS_CONSTANTS.CATEGORIES.INTEGRATIONS;

// -----------------------------
// Category-specific shapes
// (used by mergeSettingsWithDefaults in utils)
// -----------------------------
export interface AISettingsData {
  defaultModel?: string;
  defaultProvider?: string;
  maxTokensDefault?: number;
  temperatureDefault?: number;
  enableAILogging?: boolean;
  aiRateLimit?: number;
  aiCostLimit?: number;
}

export interface GeneralSettingsData {
  siteName?: string;
  siteDescription?: string;
  maintenanceMode?: boolean;
  registrationEnabled?: boolean;
  emailVerificationRequired?: boolean;
  defaultUserRole?: string;
  timezone?: string;
  dateFormat?: string;
}

export interface SecuritySettingsData {
  sessionTimeout?: number;
  maxLoginAttempts?: number;
  passwordMinLength?: number;
  requireTwoFactor?: boolean;
  forceHttps?: boolean;
  ipWhitelist?: string[];
  corsOrigins?: string[];
}

export interface NotificationSettingsData {
  adminAlerts?: boolean;
  userWelcomeEmail?: boolean;
  passwordResetEmail?: boolean;
  securityNotifications?: boolean;
  emailFromAddress?: string;
  emailProvider?: string;
  smtpSettings?: {
    host: string;
    port: number;
    username: string;
    password: string;
    secure: boolean;
  };
}

export interface BillingSettingsData {
  billingEnabled?: boolean;
  defaultCurrency?: string;
  stripeEnabled?: boolean;
  invoicePrefix?: string;
  taxRate?: number;
}

export interface IntegrationSettingsData {
  slackEnabled?: boolean;
  discordEnabled?: boolean;
  githubEnabled?: boolean;
  googleDriveEnabled?: boolean;
}

// Combined
export type AllSettingsData =
  & AISettingsData
  & GeneralSettingsData
  & SecuritySettingsData
  & NotificationSettingsData
  & BillingSettingsData
  & IntegrationSettingsData;

// -----------------------------
// Optional descriptors / errors
// -----------------------------
export interface AppSettingFilters {
  category?: SettingCategory;
  isPublic?: boolean;
  keys?: string[];
  search?: string;
}

export interface AppSettingsListOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'key' | 'category' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  filters?: AppSettingFilters;
}

export interface AppSettingValidationError {
  key: string;
  error: string;
}

export interface AppSettingTestResult {
  success: boolean;
  message: string;
  data?: any;
  errors?: AppSettingValidationError[];
}

export interface SettingDescriptor {
  key: string;
  category: SettingCategory;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  isPublic: boolean;
  required?: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    enum?: any[];
  };
}
