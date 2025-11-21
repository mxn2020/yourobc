// convex/lib/system/app_settings/types.ts
// convex/appSettings/types.ts

import type { Doc, Id } from '@/generated/dataModel';

export type AppSetting = Doc<'appSettings'>;
export type AppSettingId = Id<'appSettings'>;

export interface CreateAppSettingData {
  key: string;
  value: any;
  category: string;
  description?: string;
  isPublic: boolean;
}

export interface UpdateAppSettingData {
  value?: any;
  category?: string;
  description?: string;
  isPublic?: boolean;
}

export interface AppSettingFilters {
  category?: string;
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

// AI Settings Types
export interface AISettingsData {
  defaultModel?: string;
  defaultProvider?: string;
  maxTokensDefault?: number;
  temperatureDefault?: number;
  enableAILogging?: boolean;
  aiRateLimit?: number;
  aiCostLimit?: number;
}

export interface AISettingData {
  key: keyof AISettingsData;
  value: any;
}

// General Settings Types
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

export interface GeneralSettingData {
  key: keyof GeneralSettingsData;
  value: any;
}

// Security Settings Types
export interface SecuritySettingsData {
  sessionTimeout?: number;
  maxLoginAttempts?: number;
  passwordMinLength?: number;
  requireTwoFactor?: boolean;
  forceHttps?: boolean;
  ipWhitelist?: string[];
  corsOrigins?: string[];
}

export interface SecuritySettingData {
  key: keyof SecuritySettingsData;
  value: any;
}

// Notification Settings Types
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

export interface NotificationSettingData {
  key: keyof NotificationSettingsData;
  value: any;
}

// Billing Settings Types
export interface BillingSettingsData {
  billingEnabled?: boolean;
  defaultCurrency?: string;
  stripeEnabled?: boolean;
  invoicePrefix?: string;
  taxRate?: number;
}

export interface BillingSettingData {
  key: keyof BillingSettingsData;
  value: any;
}

// Integration Settings Types
export interface IntegrationSettingsData {
  slackEnabled?: boolean;
  discordEnabled?: boolean;
  githubEnabled?: boolean;
  googleDriveEnabled?: boolean;
}

export interface IntegrationSettingData {
  key: keyof IntegrationSettingsData;
  value: any;
}

// Combined Settings Types
export type AllSettingsData = AISettingsData & 
  GeneralSettingsData & 
  SecuritySettingsData & 
  NotificationSettingsData & 
  BillingSettingsData & 
  IntegrationSettingsData;

export type AllSettingData = AISettingData | 
  GeneralSettingData | 
  SecuritySettingData | 
  NotificationSettingData | 
  BillingSettingData | 
  IntegrationSettingData;

// Response Types
export interface AppSettingsResponse {
  settings: AppSetting[];
  total: number;
  hasMore: boolean;
}

export interface SettingsCategoryResponse<T = any> {
  [key: string]: T;
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

// Utility Types
export type SettingValue = string | number | boolean | object | any[];

export type SettingCategory = 
  | 'ai' 
  | 'general' 
  | 'security' 
  | 'notifications' 
  | 'billing' 
  | 'integrations';

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