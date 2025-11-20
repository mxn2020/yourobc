// convex/schema/software/yourobc/couriers/types.ts
// Type extractions for couriers module

import type { Doc, Id } from '@/generated/dataModel';
import type { Infer } from 'convex/values';
import type {
  courierStatusValidator,
  commissionTypeValidator,
  commissionSimpleStatusValidator,
  currencyValidator,
  paymentMethodValidator,
  timeEntrySchema,
  skillsSchema,
  costProfileSchema,
  serviceCoverageSchema,
  currentLocationSchema,
} from './validators';

// ============================================================================
// Courier Types
// ============================================================================

export type Courier = Doc<'yourobcCouriers'>;
export type CourierId = Id<'yourobcCouriers'>;

export type CourierStatus = Infer<typeof courierStatusValidator>;
export type TimeEntry = Infer<typeof timeEntrySchema>;
export type Skills = Infer<typeof skillsSchema>;
export type CostProfile = Infer<typeof costProfileSchema>;
export type ServiceCoverage = Infer<typeof serviceCoverageSchema>;
export type CurrentLocation = Infer<typeof currentLocationSchema>;

// ============================================================================
// Commission Types
// ============================================================================

export type Commission = Doc<'yourobcCourierCommissions'>;
export type CommissionId = Id<'yourobcCourierCommissions'>;

export type CommissionType = Infer<typeof commissionTypeValidator>;
export type CommissionStatus = Infer<typeof commissionSimpleStatusValidator>;
export type Currency = Infer<typeof currencyValidator>;
export type PaymentMethod = Infer<typeof paymentMethodValidator>;

// ============================================================================
// Input Types for Mutations
// ============================================================================

/**
 * Input type for creating a courier
 */
export interface CreateCourierInput {
  companyName: string;
  courierNumber: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email?: string;
  phone: string;
  userProfileId?: Id<'userProfiles'>;
  authUserId?: string;
  isActive: boolean;
  isOnline: boolean;
  skills: Skills;
  timezone: string;
  currentLocation?: CurrentLocation;
  ranking?: number;
  rankingNotes?: string;
  costProfile?: CostProfile;
  notes?: string;
  serviceCoverage?: ServiceCoverage;
  tags?: string[];
  category?: string;
}

/**
 * Input type for updating a courier
 */
export interface UpdateCourierInput {
  companyName?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  userProfileId?: Id<'userProfiles'>;
  authUserId?: string;
  status?: CourierStatus;
  isActive?: boolean;
  isOnline?: boolean;
  skills?: Skills;
  timezone?: string;
  currentLocation?: CurrentLocation;
  ranking?: number;
  rankingNotes?: string;
  costProfile?: CostProfile;
  notes?: string;
  serviceCoverage?: ServiceCoverage;
  tags?: string[];
  category?: string;
}

/**
 * Input type for creating a commission
 */
export interface CreateCommissionInput {
  courierId: CourierId;
  shipmentId: Id<'yourobcShipments'>;
  type: CommissionType;
  rate: number;
  baseAmount: number;
  commissionAmount: number;
  currency?: Currency;
  notes?: string;
}

/**
 * Input type for updating a commission
 */
export interface UpdateCommissionInput {
  type?: CommissionType;
  rate?: number;
  baseAmount?: number;
  commissionAmount?: number;
  currency?: Currency;
  status?: CommissionStatus;
  paidDate?: number;
  paymentReference?: string;
  paymentMethod?: PaymentMethod;
  approvedBy?: string;
  approvedDate?: number;
  notes?: string;
}

// ============================================================================
// Query Result Types
// ============================================================================

/**
 * Courier list item for tables/lists
 */
export interface CourierListItem {
  _id: CourierId;
  publicId: string;
  companyName: string;
  courierNumber: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  status: CourierStatus;
  isActive: boolean;
  isOnline: boolean;
  ranking?: number;
  createdAt: number;
}

/**
 * Commission list item for tables/lists
 */
export interface CommissionListItem {
  _id: CommissionId;
  publicId: string;
  displayDate: number;
  courierId: CourierId;
  shipmentId: Id<'yourobcShipments'>;
  type: CommissionType;
  commissionAmount: number;
  currency?: Currency;
  status: CommissionStatus;
  paidDate?: number;
  createdAt: number;
}
