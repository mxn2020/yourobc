// src/features/boilerplate/payments/providers/autumn-convex/types/autumn-convex.types.ts
/**
 * Autumn Convex Types
 */

import type { Id } from '@/convex/_generated/dataModel';

export interface AutumnConvexSubscription {
  _id: Id<'subscriptions'>;
  _creationTime: number;
  userId: Id<'userProfiles'>;
  authUserId: string;
  autumnCustomerId?: string;
  autumnSubscriptionId?: string;
  planId: string;
  planName: string;
  planType: 'free' | 'paid';
  status: 'active' | 'inactive' | 'cancelled' | 'past_due' | 'trialing';
  startDate?: number;
  endDate?: number;
  trialEndDate?: number;
  currentPeriodEnd?: number;
  features?: string[];
  limits?: {
    aiRequests?: number;
    projects?: number;
    storage?: number;
    teamMembers?: number;
    [key: string]: number | undefined;
  };
  usage?: {
    aiRequests?: number;
    projects?: number;
    storage?: number;
    lastResetAt?: number;
  };
  metadata?: any;
  createdAt: number;
  updatedAt: number;
}

export interface AutumnConvexUsageLog {
  _id: Id<'usageLogs'>;
  _creationTime: number;
  userId: Id<'userProfiles'>;
  authUserId: string;
  subscriptionId: Id<'subscriptions'>;
  featureKey: string;
  quantity: number;
  unit?: string;
  context?: string;
  metadata?: any;
  trackedToAutumn?: boolean;
  autumnEventId?: string;
  createdAt: number;
}

export interface SyncSubscriptionInput {
  authUserId: string;
  autumnCustomerId?: string;
  autumnSubscriptionId?: string;
  planId: string;
  planName: string;
  planType: 'free' | 'paid';
  status: 'active' | 'inactive' | 'cancelled' | 'past_due' | 'trialing';
  startDate?: number;
  endDate?: number;
  trialEndDate?: number;
  currentPeriodEnd?: number;
  features?: string[];
  limits?: Record<string, number>;
  metadata?: any;
}