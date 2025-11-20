// convex/lib/software/yourobc/couriers/types.ts
// Additional types for couriers module operations

import type { Id } from '@/generated/dataModel';
import type { Courier, Commission } from '@/schema/software/yourobc/couriers';

// ============================================================================
// Courier Operation Types
// ============================================================================

/**
 * Time tracking data
 */
export interface TimeTrackingData {
  type: 'login' | 'logout';
  location?: string;
  notes?: string;
}

/**
 * Courier availability data
 */
export interface CourierAvailabilityData {
  isActive: boolean;
  isOnline: boolean;
  status: 'available' | 'busy' | 'offline' | 'vacation';
}

/**
 * Courier ranking data
 */
export interface CourierRankingData {
  ranking: number;
  rankingNotes?: string;
}

// ============================================================================
// Commission Operation Types
// ============================================================================

/**
 * Commission approval data
 */
export interface CommissionApprovalData {
  approvedBy: string;
  notes?: string;
}

/**
 * Commission payment data
 */
export interface CommissionPaymentData {
  paidDate: number;
  paymentReference: string;
  paymentMethod: 'bank_transfer' | 'credit_card' | 'cash' | 'check' | 'paypal' | 'wire_transfer' | 'other';
  notes?: string;
}

/**
 * Commission calculation data
 */
export interface CommissionCalculationData {
  type: 'percentage' | 'fixed';
  rate: number;
  baseAmount: number;
}

// ============================================================================
// Filter and Search Types
// ============================================================================

/**
 * Courier filters
 */
export interface CourierFilters {
  status?: 'available' | 'busy' | 'offline' | 'vacation';
  isActive?: boolean;
  isOnline?: boolean;
  country?: string;
  city?: string;
  language?: string;
  serviceType?: 'OBC' | 'NFO';
}

/**
 * Commission filters
 */
export interface CommissionFilters {
  courierId?: Id<'yourobcCouriers'>;
  shipmentId?: Id<'yourobcShipments'>;
  status?: 'pending' | 'paid';
  type?: 'percentage' | 'fixed';
  dateFrom?: number;
  dateTo?: number;
}

// ============================================================================
// Dashboard and Analytics Types
// ============================================================================

/**
 * Courier performance metrics
 */
export interface CourierPerformanceMetrics {
  totalShipments: number;
  totalCommissions: number;
  totalEarnings: number;
  averageRating: number;
  completionRate: number;
  onTimeDeliveryRate: number;
}

/**
 * Commission summary
 */
export interface CommissionSummary {
  totalPending: number;
  totalPaid: number;
  pendingAmount: number;
  paidAmount: number;
  commissionsThisMonth: number;
  commissionsThisYear: number;
}
