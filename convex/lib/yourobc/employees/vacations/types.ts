/**
 * YourOBC Employee Vacations Types
 *
 * TypeScript type definitions for employee vacations and time-off management.
 *
 * @module convex/lib/yourobc/employees/vacations/types
 */

import type { Doc, Id } from '../../../../_generated/dataModel';
import type {
  VacationType,
  VacationStatus,
} from '../../../../schema/yourobc/base';

/**
 * Vacation days record type
 */
export type VacationDays = Doc<'yourobcVacationDays'>;
export type VacationDaysId = Id<'yourobcVacationDays'>;

/**
 * Vacation entry within a vacation days record
 */
export interface VacationEntry {
  entryId: string;
  startDate: number;
  endDate: number;
  days: number;
  type: VacationType;
  status: VacationStatus;
  reason?: string;
  notes?: string;
  requestedBy: string;
  requestedDate: number;
  approvedBy?: string;
  approvedDate?: number;
  approvalNotes?: string;
  rejectedBy?: string;
  rejectedDate?: number;
  rejectionReason?: string;
  cancelledBy?: string;
  cancelledDate?: number;
  cancellationReason?: string;
}

/**
 * Vacation balance summary
 */
export interface VacationBalance {
  year: number;
  annualEntitlement: number;
  carryoverDays: number;
  available: number;
  used: number;
  pending: number;
  remaining: number;
}

/**
 * Vacation request data
 */
export interface VacationRequestData {
  employeeId: Id<'yourobcEmployees'>;
  startDate: number;
  endDate: number;
  type: VacationType;
  reason?: string;
  notes?: string;
}

/**
 * Vacation statistics
 */
export interface VacationStatistics {
  year: number;
  annualEntitlement: number;
  carryoverDays: number;
  available: number;
  used: number;
  pending: number;
  remaining: number;
  usagePercentage: number;
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  cancelledRequests: number;
  daysByType: Record<string, number>;
}

/**
 * Vacation calendar entry
 */
export interface VacationCalendarEntry extends VacationEntry {
  employeeId: Id<'yourobcEmployees'>;
  year: number;
  employee?: any;
  userProfile?: any;
}
