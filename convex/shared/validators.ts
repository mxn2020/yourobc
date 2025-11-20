// convex/lib/validators.ts
/**
 * Reusable Convex validators for common union types
 * These validators ensure runtime validation matches TypeScript types
 */

import { v } from 'convex/values';

/**
 * User Role Validator
 * Matches UserRole type from convex/types.ts
 */
export const vUserRole = () =>
  v.union(
    v.literal('superadmin'),
    v.literal('admin'),
    v.literal('user'),
    v.literal('moderator'),
    v.literal('editor'),
    v.literal('analyst'),
    v.literal('guest')
  );

/**
 * Setting Category Validator
 * Matches SettingCategory type from convex/lib/system/app_settings/types.ts
 */
export const vSettingCategory = () =>
  v.union(
    v.literal('ai'),
    v.literal('general'),
    v.literal('security'),
    v.literal('notifications'),
    v.literal('billing'),
    v.literal('integrations')
  );

/**
 * Notification Type Validator
 * Matches NotificationType from convex/types.ts
 */
export const vNotificationType = () =>
  v.union(
    v.literal('assignment'),
    v.literal('completion'),
    v.literal('invite'),
    v.literal('achievement'),
    v.literal('reminder'),
    v.literal('mention'),
    v.literal('request'),
    v.literal('info'),
    v.literal('success'),
    v.literal('error')
  );

/**
 * Theme Mode Validator
 * Matches ThemeMode from convex/types.ts
 */
export const vTheme = () =>
  v.union(
    v.literal('light'),
    v.literal('dark'),
    v.literal('auto')
  );

/**
 * Preferred View Validator
 * Matches schema definition in convex/schema/system/user_settings.ts
 */
export const vPreferredView = () =>
  v.union(
    v.literal('grid'),
    v.literal('list')
  );

/**
 * Stripe Connect Event Type Validator
 * Matches eventType union in convex/schema/system/stripe_connect.ts
 */
export const vStripeEventType = () =>
  v.union(
    v.literal('account_created'),
    v.literal('account_updated'),
    v.literal('account_onboarded'),
    v.literal('payment_created'),
    v.literal('payment_succeeded'),
    v.literal('payment_failed'),
    v.literal('subscription_created'),
    v.literal('subscription_updated'),
    v.literal('subscription_cancelled'),
    v.literal('refund_created'),
    v.literal('webhook_received'),
    v.literal('api_error'),
    v.literal('other')
  );
