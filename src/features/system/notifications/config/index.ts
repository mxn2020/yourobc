// src/features/boilerplate/notifications/config/index.ts
/**
 * Notifications Configuration
 *
 * Manages in-app, email, push, and SMS notification settings
 */

import { getEnv, getEnvWithDefault, envIsNotFalse, envIsTrue, getEnvAsNumber } from '../../_shared/env-utils';

// ============================================
// 1. TYPES & INTERFACES
// ============================================

export type NotificationChannelType = 'inapp' | 'email' | 'push' | 'sms';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';
export type NotificationCategory =
  | 'system'
  | 'account'
  | 'project'
  | 'task'
  | 'comment'
  | 'mention'
  | 'payment'
  | 'security';

export interface NotificationChannelConfig {
  enabled: boolean;
  name: string;
  provider?: string;
  batchingEnabled: boolean;
  batchIntervalMinutes: number;
}

export interface NotificationLimits {
  maxNotificationsPerUser: number;
  retentionDays: number;
  maxBatchSize: number;
  rateLimitPerHour: number;
}

export interface NotificationDeliveryRules {
  respectQuietHours: boolean;
  quietHoursStart: string; // HH:MM format
  quietHoursEnd: string; // HH:MM format
  allowUrgentDuringQuietHours: boolean;
  deduplicateWindowMinutes: number;
}

// ============================================
// 2. ENVIRONMENT VARIABLES
// ============================================

export const NOTIFICATIONS_ENV = {
  // Feature toggle
  ENABLE_NOTIFICATIONS: envIsNotFalse('VITE_ENABLE_NOTIFICATIONS'),

  // Channels
  ENABLE_INAPP: envIsNotFalse('VITE_NOTIF_ENABLE_INAPP'),
  ENABLE_EMAIL: envIsNotFalse('VITE_NOTIF_ENABLE_EMAIL'),
  ENABLE_PUSH: envIsTrue('VITE_NOTIF_ENABLE_PUSH'),
  ENABLE_SMS: envIsTrue('VITE_NOTIF_ENABLE_SMS'),

  // Email provider
  EMAIL_PROVIDER: getEnvWithDefault('VITE_EMAIL_PROVIDER', 'internal'),

  // Push provider
  PUSH_PROVIDER: getEnvWithDefault('VITE_PUSH_PROVIDER', ''),
  PUSH_VAPID_PUBLIC_KEY: getEnvWithDefault('VITE_PUSH_VAPID_PUBLIC_KEY', ''),

  // SMS provider
  SMS_PROVIDER: getEnvWithDefault('VITE_SMS_PROVIDER', ''),

  // Limits
  MAX_NOTIFICATIONS_PER_USER: getEnvAsNumber('VITE_NOTIF_MAX_PER_USER', 1000),
  RETENTION_DAYS: getEnvAsNumber('VITE_NOTIF_RETENTION_DAYS', 90),
  MAX_BATCH_SIZE: getEnvAsNumber('VITE_NOTIF_MAX_BATCH_SIZE', 50),
  RATE_LIMIT_PER_HOUR: getEnvAsNumber('VITE_NOTIF_RATE_LIMIT_HOUR', 100),

  // Batching
  EMAIL_BATCHING: envIsNotFalse('VITE_NOTIF_EMAIL_BATCHING'),
  EMAIL_BATCH_INTERVAL: getEnvAsNumber('VITE_NOTIF_EMAIL_BATCH_INTERVAL', 30), // minutes

  // Delivery rules
  RESPECT_QUIET_HOURS: envIsNotFalse('VITE_NOTIF_RESPECT_QUIET_HOURS'),
  QUIET_HOURS_START: getEnvWithDefault('VITE_NOTIF_QUIET_HOURS_START', '22:00'),
  QUIET_HOURS_END: getEnvWithDefault('VITE_NOTIF_QUIET_HOURS_END', '08:00'),
  URGENT_OVERRIDE_QUIET: envIsNotFalse('VITE_NOTIF_URGENT_OVERRIDE_QUIET'),
  DEDUPLICATE_WINDOW: getEnvAsNumber('VITE_NOTIF_DEDUPLICATE_WINDOW', 5), // minutes
} as const;

// ============================================
// 3. CHANNEL CONFIGURATIONS
// ============================================

export const NOTIFICATION_CHANNELS: Record<NotificationChannelType, NotificationChannelConfig> = {
  inapp: {
    enabled: NOTIFICATIONS_ENV.ENABLE_INAPP,
    name: 'In-App',
    batchingEnabled: false,
    batchIntervalMinutes: 0,
  },
  email: {
    enabled: NOTIFICATIONS_ENV.ENABLE_EMAIL && Boolean(NOTIFICATIONS_ENV.EMAIL_PROVIDER),
    name: 'Email',
    provider: NOTIFICATIONS_ENV.EMAIL_PROVIDER,
    batchingEnabled: NOTIFICATIONS_ENV.EMAIL_BATCHING,
    batchIntervalMinutes: NOTIFICATIONS_ENV.EMAIL_BATCH_INTERVAL,
  },
  push: {
    enabled: NOTIFICATIONS_ENV.ENABLE_PUSH && Boolean(NOTIFICATIONS_ENV.PUSH_VAPID_PUBLIC_KEY),
    name: 'Push',
    provider: NOTIFICATIONS_ENV.PUSH_PROVIDER || 'web-push',
    batchingEnabled: false,
    batchIntervalMinutes: 0,
  },
  sms: {
    enabled: NOTIFICATIONS_ENV.ENABLE_SMS && Boolean(NOTIFICATIONS_ENV.SMS_PROVIDER),
    name: 'SMS',
    provider: NOTIFICATIONS_ENV.SMS_PROVIDER,
    batchingEnabled: false,
    batchIntervalMinutes: 0,
  },
};

// ============================================
// 4. MAIN CONFIGURATION OBJECT
// ============================================

export const NOTIFICATIONS_CONFIG = {
  // Feature metadata
  name: 'Notifications',
  version: '1.0.0',
  enabled: NOTIFICATIONS_ENV.ENABLE_NOTIFICATIONS,

  // Channels
  channels: NOTIFICATION_CHANNELS,
  enabledChannels: Object.entries(NOTIFICATION_CHANNELS)
    .filter(([_, config]) => config.enabled)
    .map(([type, _]) => type as NotificationChannelType),

  // Limits
  limits: {
    maxNotificationsPerUser: NOTIFICATIONS_ENV.MAX_NOTIFICATIONS_PER_USER,
    retentionDays: NOTIFICATIONS_ENV.RETENTION_DAYS,
    maxBatchSize: NOTIFICATIONS_ENV.MAX_BATCH_SIZE,
    rateLimitPerHour: NOTIFICATIONS_ENV.RATE_LIMIT_PER_HOUR,
  } as NotificationLimits,

  // Delivery rules
  deliveryRules: {
    respectQuietHours: NOTIFICATIONS_ENV.RESPECT_QUIET_HOURS,
    quietHoursStart: NOTIFICATIONS_ENV.QUIET_HOURS_START,
    quietHoursEnd: NOTIFICATIONS_ENV.QUIET_HOURS_END,
    allowUrgentDuringQuietHours: NOTIFICATIONS_ENV.URGENT_OVERRIDE_QUIET,
    deduplicateWindowMinutes: NOTIFICATIONS_ENV.DEDUPLICATE_WINDOW,
  } as NotificationDeliveryRules,

  // Default preferences (can be overridden by users)
  defaultPreferences: {
    inapp: { enabled: true, categories: ['all'] },
    email: { enabled: true, categories: ['system', 'account', 'security'] },
    push: { enabled: false, categories: ['mention', 'security'] },
    sms: { enabled: false, categories: ['security'] },
  },
} as const;

// ============================================
// 5. VALIDATION FUNCTION
// ============================================

export function validateNotificationsConfig(): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!NOTIFICATIONS_ENV.ENABLE_NOTIFICATIONS) {
    return { valid: true, errors: [], warnings: ['Notifications feature is disabled'] };
  }

  // Check if at least in-app is enabled
  if (!NOTIFICATION_CHANNELS.inapp.enabled) {
    warnings.push('In-app notifications are disabled, users won\'t see notifications');
  }

  // Validate email config
  if (NOTIFICATION_CHANNELS.email.enabled && !getEnv('VITE_EMAIL_FROM')) {
    warnings.push('Email notifications enabled but no FROM address configured');
  }

  // Validate push config
  if (NOTIFICATION_CHANNELS.push.enabled && !NOTIFICATIONS_ENV.PUSH_VAPID_PUBLIC_KEY) {
    errors.push('Push notifications enabled but VAPID key is missing');
  }

  // Validate SMS config
  if (NOTIFICATION_CHANNELS.sms.enabled && !NOTIFICATIONS_ENV.SMS_PROVIDER) {
    errors.push('SMS notifications enabled but no provider configured');
  }

  // Validate limits
  if (NOTIFICATIONS_ENV.MAX_NOTIFICATIONS_PER_USER < 10) {
    warnings.push('MAX_NOTIFICATIONS_PER_USER is very low, may impact user experience');
  }

  if (NOTIFICATIONS_ENV.RETENTION_DAYS < 7) {
    warnings.push('RETENTION_DAYS is very short, notifications will be deleted quickly');
  }

  // Validate quiet hours
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(NOTIFICATIONS_ENV.QUIET_HOURS_START)) {
    errors.push('QUIET_HOURS_START must be in HH:MM format');
  }
  if (!timeRegex.test(NOTIFICATIONS_ENV.QUIET_HOURS_END)) {
    errors.push('QUIET_HOURS_END must be in HH:MM format');
  }

  return { valid: errors.length === 0, errors, warnings };
}

// ============================================
// 6. HELPER FUNCTIONS
// ============================================

export function isNotificationsEnabled(): boolean {
  return NOTIFICATIONS_ENV.ENABLE_NOTIFICATIONS;
}

export function isChannelEnabled(channel: NotificationChannelType): boolean {
  return NOTIFICATION_CHANNELS[channel]?.enabled || false;
}

export function getEnabledChannels(): NotificationChannelType[] {
  return NOTIFICATIONS_CONFIG.enabledChannels;
}

export function isInQuietHours(date: Date = new Date()): boolean {
  if (!NOTIFICATIONS_CONFIG.deliveryRules.respectQuietHours) return false;

  const hour = date.getHours();
  const minute = date.getMinutes();
  const currentTime = hour * 60 + minute;

  const [startHour, startMinute] = NOTIFICATIONS_CONFIG.deliveryRules.quietHoursStart.split(':').map(Number);
  const [endHour, endMinute] = NOTIFICATIONS_CONFIG.deliveryRules.quietHoursEnd.split(':').map(Number);

  const quietStart = startHour * 60 + startMinute;
  const quietEnd = endHour * 60 + endMinute;

  if (quietStart < quietEnd) {
    return currentTime >= quietStart && currentTime < quietEnd;
  } else {
    return currentTime >= quietStart || currentTime < quietEnd;
  }
}

export function shouldSendNotification(priority: NotificationPriority, date?: Date): boolean {
  if (priority === 'urgent' && NOTIFICATIONS_CONFIG.deliveryRules.allowUrgentDuringQuietHours) {
    return true;
  }
  return !isInQuietHours(date);
}

export default NOTIFICATIONS_CONFIG;
