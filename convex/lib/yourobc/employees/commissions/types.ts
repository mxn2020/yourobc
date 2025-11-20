/**
 * YourOBC Employee Commissions Types
 *
 * TypeScript type definitions for employee commissions.
 *
 * @module convex/lib/yourobc/employees/commissions/types
 */

import type { Doc, Id } from '../../../../_generated/dataModel';
import type {
  EmployeeCommissionType,
  CommissionStatus,
  PaymentMethod,
} from '../../../../schema/yourobc/base';

/**
 * Commission record type
 */
export type Commission = Doc<'yourobcEmployeeCommissions'>;
export type CommissionId = Id<'yourobcEmployeeCommissions'>;

/**
 * Commission rule type
 */
export type CommissionRule = Doc<'yourobcEmployeeCommissionRules'>;
export type CommissionRuleId = Id<'yourobcEmployeeCommissionRules'>;

/**
 * Commission calculation result
 */
export interface CommissionCalculation {
  baseAmount: number;
  margin?: number;
  marginPercentage?: number;
  commissionRate: number;
  commissionAmount: number;
  appliedTier?: CommissionTier;
}

/**
 * Commission tier configuration
 */
export interface CommissionTier {
  minAmount: number;
  maxAmount?: number;
  rate: number;
  description?: string;
}

/**
 * Create commission data
 */
export interface CreateCommissionData {
  employeeId: Id<'yourobcEmployees'>;
  shipmentId?: Id<'yourobcShipments'>;
  quoteId?: Id<'yourobcQuotes'>;
  invoiceId?: Id<'yourobcInvoices'>;
  revenue: number;
  cost?: number;
  ruleId?: Id<'yourobcEmployeeCommissionRules'>;
}

/**
 * Create commission rule data
 */
export interface CreateCommissionRuleData {
  employeeId: Id<'yourobcEmployees'>;
  name: string;
  description?: string;
  type: EmployeeCommissionType;
  rate?: number;
  tiers?: CommissionTier[];
  minMarginPercentage?: number;
  minOrderValue?: number;
  minCommissionAmount?: number;
  applicableCategories?: string[];
  applicableProducts?: string[]; // Product IDs or names
  startDate?: number;
  endDate?: number;
  autoApprove?: boolean;
  priority?: number;
}

/**
 * Commission filters
 */
export interface CommissionFilters {
  employeeId?: Id<'yourobcEmployees'>;
  status?: CommissionStatus;
  startDate?: number;
  endDate?: number;
}

/**
 * Commission summary statistics
 */
export interface CommissionSummary {
  totalCommissions: number;
  totalEarned: number;
  totalPending: number;
  totalApproved: number;
  totalPaid: number;
  totalCancelled: number;
  commissionsByType: Record<string, number>;
  commissionsByMonth: Record<number, number>;
}
