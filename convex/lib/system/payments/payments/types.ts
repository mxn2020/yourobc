// convex/lib/boilerplate/payments/payments/types.ts
// Type definitions for payments module

import { Doc, Id } from '@/generated/dataModel';

// ============================================
// Subscription Types
// ============================================

export type Subscription = Doc<'subscriptions'>;
export type SubscriptionId = Id<'subscriptions'>;

export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'past_due' | 'trialing';
export type PlanType = 'free' | 'paid';

export interface SubscriptionLimits {
  aiRequests?: number;
  projects?: number;
  storage?: number;
  teamMembers?: number;
  customFeature?: unknown;
}

export interface SubscriptionUsage {
  aiRequests?: number;
  projects?: number;
  storage?: number;
  lastResetAt?: number;
}

export interface CreateSubscriptionData {
  name: string;
  description?: string;
  autumnCustomerId?: string;
  autumnSubscriptionId?: string;
  planId: string;
  planType: PlanType;
  status: SubscriptionStatus;
  startDate?: number;
  endDate?: number;
  trialEndDate?: number;
  currentPeriodEnd?: number;
  features?: string[];
  limits?: SubscriptionLimits;
  metadata?: unknown;
}

export interface UpdateSubscriptionData {
  name?: string;
  description?: string;
  autumnCustomerId?: string;
  autumnSubscriptionId?: string;
  planId?: string;
  planType?: PlanType;
  status?: SubscriptionStatus;
  startDate?: number;
  endDate?: number;
  trialEndDate?: number;
  currentPeriodEnd?: number;
  features?: string[];
  limits?: SubscriptionLimits;
  metadata?: unknown;
}

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

// ============================================
// Usage Log Types
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
  remaining?: number;
}

export interface FeatureAccessCheck {
  hasAccess: boolean;
  reason?: string;
  currentUsage?: number;
  limit?: number;
  remaining?: number;
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
export type PaymentEventStatus = 'pending' | 'processed' | 'failed';

export interface LogPaymentEventData {
  name: string;
  description?: string;
  eventType: EventType;
  eventData?: unknown;
  source: EventSource;
  subscriptionId?: SubscriptionId;
  metadata?: unknown;
}

export interface MarkEventProcessedData {
  eventId: PaymentEventId;
  error?: string;
}

// ============================================
// Statistics Types
// ============================================

export interface SubscriptionStats {
  total: number;
  active: number;
  trialing: number;
  cancelled: number;
  past_due: number;
  inactive: number;
  byPlan: Record<string, number>;
}

export interface UsageStats {
  featureKey?: string;
  currentUsage: number;
  limit?: number;
  remaining?: number;
  lastResetAt?: number;
  usage?: SubscriptionUsage;
  limits?: SubscriptionLimits;
  planId?: string;
  planName?: string;
  status?: SubscriptionStatus;
}
