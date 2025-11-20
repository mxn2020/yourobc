// convex/lib/boilerplate/autumn/autumn_customers/types.ts
// TypeScript type definitions for autumn customers module

import type { Doc, Id } from '@/generated/dataModel';
import type { AutumnSubscriptionStatus } from '@/schema/boilerplate/autumn/autumn_customers/types';

// Entity types
export type AutumnCustomer = Doc<'autumnCustomers'>;
export type AutumnCustomerId = Id<'autumnCustomers'>;

// Data interfaces
export interface CreateAutumnCustomerData {
  name: string;
  userId: Id<'userProfiles'>;
  authUserId: string;
  autumnCustomerId: string;
  currentPlanId?: string;
  subscriptionStatus?: AutumnSubscriptionStatus;
}

export interface UpdateAutumnCustomerData {
  name?: string;
  currentPlanId?: string;
  subscriptionStatus?: AutumnSubscriptionStatus;
  lastSyncedAt?: number;
  metadata?: any;
}

// Response types
export interface AutumnCustomerListResponse {
  items: AutumnCustomer[];
  total: number;
  hasMore: boolean;
}

// Filter types
export interface AutumnCustomerFilters {
  subscriptionStatus?: AutumnSubscriptionStatus[];
  search?: string;
}
