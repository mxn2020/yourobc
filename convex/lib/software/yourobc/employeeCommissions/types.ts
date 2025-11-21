// convex/lib/software/yourobc/employeeCommissions/types.ts
// TypeScript type definitions for employeeCommissions module

import type { Doc, Id } from '@/generated/dataModel';
import type { EmployeeCommissionsStatus } from '@/schema/software/yourobc/employeeCommissions/types';

// Entity types
export type EmployeeCommission = Doc<'yourobcEmployeeCommissions'>;
export type EmployeeCommissionId = Id<'yourobcEmployeeCommissions'>;

// Data interfaces
export interface CreateEmployeeCommissionData {
  employeeId: Id<'yourobcEmployees'>;
  shipmentId?: Id<'yourobcShipments'>;
  quoteId?: Id<'yourobcQuotes'>;
  invoiceId?: Id<'yourobcInvoices'>;
  period: string;
  periodStartDate: number;
  periodEndDate: number;
  baseAmount: number;
  margin?: number;
  marginPercentage?: number;
  commissionPercentage: number;
  totalAmount: number;
  currency: 'EUR' | 'USD';
  type: 'margin_percentage' | 'revenue_percentage' | 'fixed_amount' | 'tiered';
  ruleId?: Id<'yourobcEmployeeCommissionRules'>;
  ruleName?: string;
  calculationBreakdown?: {
    baseAmount: number;
    rate: number;
    adjustments?: Array<{
      type: string;
      amount: number;
      reason: string;
    }>;
    finalAmount: number;
  };
  relatedShipments?: Id<'yourobcShipments'>[];
  relatedQuotes?: Id<'yourobcQuotes'>[];
  status?: EmployeeCommissionsStatus;
  description?: string;
  notes?: string;
}

export interface UpdateEmployeeCommissionData {
  baseAmount?: number;
  margin?: number;
  marginPercentage?: number;
  commissionPercentage?: number;
  totalAmount?: number;
  calculationBreakdown?: {
    baseAmount: number;
    rate: number;
    adjustments?: Array<{
      type: string;
      amount: number;
      reason: string;
    }>;
    finalAmount: number;
  };
  status?: EmployeeCommissionsStatus;
  description?: string;
  notes?: string;
}

export interface ApproveCommissionData {
  approvalNotes?: string;
}

export interface PayCommissionData {
  paymentReference: string;
  paymentMethod: 'bank_transfer' | 'credit_card' | 'cash' | 'check' | 'paypal' | 'wire_transfer' | 'other';
}

export interface CancelCommissionData {
  cancellationReason: string;
}

// Response types
export interface EmployeeCommissionListResponse {
  items: EmployeeCommission[];
  total: number;
  hasMore: boolean;
}

// Filter types
export interface EmployeeCommissionFilters {
  status?: EmployeeCommissionsStatus[];
  employeeId?: Id<'yourobcEmployees'>;
  period?: string;
  startDate?: number;
  endDate?: number;
}
