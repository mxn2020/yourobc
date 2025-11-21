// convex/lib/yourobc/employeeCommissions/utils.ts
// Validation functions and utility helpers for employeeCommissions module

import { EMPLOYEE_COMMISSIONS_CONSTANTS } from './constants';
import type { CreateEmployeeCommissionData, UpdateEmployeeCommissionData } from './types';

/**
 * Validate employee commission data for creation/update
 */
export function validateEmployeeCommissionData(
  data: Partial<CreateEmployeeCommissionData | UpdateEmployeeCommissionData>
): string[] {
  const errors: string[] = [];

  // Validate description
  if (data.description !== undefined && data.description.trim()) {
    const trimmed = data.description.trim();
    if (trimmed.length > EMPLOYEE_COMMISSIONS_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH) {
      errors.push(`Description cannot exceed ${EMPLOYEE_COMMISSIONS_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH} characters`);
    }
  }

  // Validate notes
  if (data.notes !== undefined && data.notes.trim()) {
    const trimmed = data.notes.trim();
    if (trimmed.length > EMPLOYEE_COMMISSIONS_CONSTANTS.LIMITS.MAX_NOTES_LENGTH) {
      errors.push(`Notes cannot exceed ${EMPLOYEE_COMMISSIONS_CONSTANTS.LIMITS.MAX_NOTES_LENGTH} characters`);
    }
  }

  // Validate base amount
  if ('baseAmount' in data && data.baseAmount !== undefined) {
    if (data.baseAmount < EMPLOYEE_COMMISSIONS_CONSTANTS.LIMITS.MIN_BASE_AMOUNT) {
      errors.push(`Base amount must be at least ${EMPLOYEE_COMMISSIONS_CONSTANTS.LIMITS.MIN_BASE_AMOUNT}`);
    }
  }

  // Validate commission percentage
  if ('commissionPercentage' in data && data.commissionPercentage !== undefined) {
    if (data.commissionPercentage < EMPLOYEE_COMMISSIONS_CONSTANTS.LIMITS.MIN_COMMISSION_PERCENTAGE) {
      errors.push(`Commission percentage must be at least ${EMPLOYEE_COMMISSIONS_CONSTANTS.LIMITS.MIN_COMMISSION_PERCENTAGE}%`);
    } else if (data.commissionPercentage > EMPLOYEE_COMMISSIONS_CONSTANTS.LIMITS.MAX_COMMISSION_PERCENTAGE) {
      errors.push(`Commission percentage cannot exceed ${EMPLOYEE_COMMISSIONS_CONSTANTS.LIMITS.MAX_COMMISSION_PERCENTAGE}%`);
    }
  }

  // Validate calculation breakdown adjustments
  if ('calculationBreakdown' in data && data.calculationBreakdown?.adjustments) {
    if (data.calculationBreakdown.adjustments.length > EMPLOYEE_COMMISSIONS_CONSTANTS.LIMITS.MAX_ADJUSTMENTS) {
      errors.push(`Cannot exceed ${EMPLOYEE_COMMISSIONS_CONSTANTS.LIMITS.MAX_ADJUSTMENTS} adjustments`);
    }
  }

  return errors;
}

/**
 * Generate commission ID
 */
export function generateCommissionId(year: number, sequence: number): string {
  return `COMM-${year}-${sequence.toString().padStart(6, '0')}`;
}

/**
 * Calculate commission amount
 */
export function calculateCommissionAmount(
  baseAmount: number,
  percentage: number,
  adjustments?: Array<{ type: string; amount: number; reason: string }>
): number {
  let amount = (baseAmount * percentage) / 100;

  if (adjustments && adjustments.length > 0) {
    for (const adjustment of adjustments) {
      amount += adjustment.amount;
    }
  }

  return Math.round(amount * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate margin percentage
 */
export function calculateMarginPercentage(revenue: number, costs: number): number {
  if (revenue === 0) return 0;
  const margin = revenue - costs;
  return Math.round((margin / revenue) * 100 * 100) / 100; // Round to 2 decimal places
}

/**
 * Format commission display name
 */
export function formatCommissionDisplayName(commission: { commissionId: string; status?: string }): string {
  const statusBadge = commission.status ? ` [${commission.status}]` : '';
  return `${commission.commissionId}${statusBadge}`;
}

/**
 * Check if commission is editable
 */
export function isCommissionEditable(commission: { status: string; deletedAt?: number }): boolean {
  if (commission.deletedAt) return false;
  return commission.status === 'pending';
}

/**
 * Check if commission can be approved
 */
export function canApproveCommission(commission: { status: string }): boolean {
  return commission.status === 'pending';
}

/**
 * Check if commission can be paid
 */
export function canPayCommission(commission: { status: string }): boolean {
  return commission.status === 'approved';
}
