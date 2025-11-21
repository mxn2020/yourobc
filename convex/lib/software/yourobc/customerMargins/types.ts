// convex/lib/software/yourobc/customerMargins/types.ts
// TypeScript type definitions for customerMargins module

import type { Doc, Id } from '@/generated/dataModel';
import type {
  CustomerMarginsStatus,
  CustomerMarginsServiceType,
  CustomerMarginsType,
  CustomerMarginsApprovalStatus,
} from '@/schema/software/yourobc/customerMargins/types';

// Entity types
export type CustomerMargin = Doc<'softwareYourObcCustomerMargins'>;
export type CustomerMarginId = Id<'softwareYourObcCustomerMargins'>;

// Sub-types
export interface PricingRule {
  id: string;
  condition: string;
  marginAdjustment: number;
  description?: string;
}

export interface VolumeTier {
  id: string;
  minVolume: number;
  maxVolume?: number;
  marginPercentage: number;
  description?: string;
}

export interface ChangeHistoryEntry {
  id: string;
  timestamp: number;
  changedBy: Id<'userProfiles'>;
  oldMargin: number;
  newMargin: number;
  reason: string;
}

// Data interfaces
export interface CreateCustomerMarginData {
  name: string;
  marginId?: string; // Auto-generated if not provided
  status?: CustomerMarginsStatus;
  serviceType: CustomerMarginsServiceType;
  marginType: CustomerMarginsType;
  customerId: Id<'yourobcCustomers'>;
  customerName?: string;
  baseMargin: number;
  appliedMargin: number;
  minimumMargin?: number;
  maximumMargin?: number;
  effectiveFrom: number;
  effectiveTo?: number;
  pricingRules?: PricingRule[];
  volumeTiers?: VolumeTier[];
  changeReason?: string;
  notes?: string;
  isAutoApplied?: boolean;
  requiresApproval?: boolean;
  tags?: string[];
  category?: string;
}

export interface UpdateCustomerMarginData {
  name?: string;
  status?: CustomerMarginsStatus;
  serviceType?: CustomerMarginsServiceType;
  marginType?: CustomerMarginsType;
  baseMargin?: number;
  appliedMargin?: number;
  minimumMargin?: number;
  maximumMargin?: number;
  effectiveFrom?: number;
  effectiveTo?: number;
  pricingRules?: PricingRule[];
  volumeTiers?: VolumeTier[];
  changeReason?: string;
  approvalStatus?: CustomerMarginsApprovalStatus;
  approvalNotes?: string;
  rejectionReason?: string;
  notes?: string;
  isAutoApplied?: boolean;
  requiresApproval?: boolean;
  tags?: string[];
  category?: string;
}

// Response types
export interface CustomerMarginWithRelations extends CustomerMargin {
  customer?: Doc<'yourobcCustomers'> | null;
}

export interface CustomerMarginListResponse {
  items: CustomerMargin[];
  total: number;
  hasMore: boolean;
}

// Filter types
export interface CustomerMarginFilters {
  status?: CustomerMarginsStatus[];
  serviceType?: CustomerMarginsServiceType[];
  marginType?: CustomerMarginsType[];
  approvalStatus?: CustomerMarginsApprovalStatus[];
  customerId?: Id<'yourobcCustomers'>;
  search?: string;
  activeOnly?: boolean;
}
