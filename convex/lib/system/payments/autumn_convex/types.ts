// convex/lib/boilerplate/payments/autumn_convex/types.ts

/**
 * Autumn Convex Types
 *
 * Type definitions for Autumn payment integration module
 */

import { Doc, Id } from '@/generated/dataModel';

// ============================================
// Subscription Types
// ============================================

export type Subscription = Doc<'subscriptions'>;
export type SubscriptionId = Id<'subscriptions'>;

export type PlanType = 'free' | 'paid';
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'past_due' | 'trialing';

export interface SyncSubscriptionData {
  autumnCustomerId?: string;
  autumnSubscriptionId?: string;
  planId: string;
  planName: string;
  planType: PlanType;
  status: SubscriptionStatus;
  startDate?: number;
  endDate?: number;
  trialEndDate?: number;
  currentPeriodEnd?: number;
  features?: string[];
  limits?: unknown;
  metadata?: unknown;
}

export interface UpdateSubscriptionStatusData {
  status: SubscriptionStatus;
  endDate?: number;
}

// ============================================
// Usage Types
// ============================================

export type UsageLog = Doc<'usageLogs'>;
export type UsageLogId = Id<'usageLogs'>;

export interface TrackUsageData {
  featureKey: string;
  quantity: number;
  unit?: string;
  context?: string;
  metadata?: unknown;
}

export interface UsageResponse {
  usageLogId: UsageLogId;
  currentUsage: number;
  limit?: number;
}

// ============================================
// Payment Event Types
// ============================================

export type PaymentEvent = Doc<'paymentEvents'>;
export type PaymentEventId = Id<'paymentEvents'>;

export type EventType =
  | 'subscription_created'
  | 'subscription_updated'
  | 'subscription_cancelled'
  | 'payment_succeeded'
  | 'payment_failed'
  | 'trial_started'
  | 'trial_ended'
  | 'plan_upgraded'
  | 'plan_downgraded'
  | 'usage_tracked'
  | 'limit_exceeded'
  | 'other';

export type EventSource = 'autumn' | 'app';

export interface LogPaymentEventData {
  eventType: EventType;
  eventData?: unknown;
  source: EventSource;
}

export interface MarkEventProcessedData {
  eventId: PaymentEventId;
  error?: string;
}
