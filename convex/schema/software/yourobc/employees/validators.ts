// convex/schema/software/yourobc/employees/validators.ts
/**
 * Employee and Vacation Validators
 *
 * Defines all validators for employee management including office information,
 * vacation tracking, and nested object structures.
 *
 * @module convex/schema/software/yourobc/employees/validators
 */

import { v } from 'convex/values'
import {
  employeeStatusValidator,
  workStatusValidator,
  timeEntrySchema,
  vacationTypeValidator,
  vacationStatusValidator,
} from '../../../yourobc/base'

// Re-export base validators for convenience
export {
  employeeStatusValidator,
  workStatusValidator,
  timeEntrySchema,
  vacationTypeValidator,
  vacationStatusValidator,
}

// ============================================================================
// Office & Contact Validators
// ============================================================================

/**
 * Office location information
 */
export const officeValidator = v.object({
  location: v.string(),
  country: v.string(),
  countryCode: v.string(),
  address: v.optional(v.string()),
})

/**
 * Emergency contact information
 */
export const emergencyContactValidator = v.object({
  name: v.string(),
  phone: v.string(),
  relationship: v.string(),
})

// ============================================================================
// Vacation Status Validators
// ============================================================================

/**
 * Current vacation status (denormalized for performance)
 */
export const currentVacationStatusValidator = v.object({
  isOnVacation: v.boolean(),
  vacationEntryId: v.string(), // Reference to entry in vacationDaysTable
  startDate: v.number(),
  endDate: v.number(),
  type: vacationTypeValidator,
  reason: v.optional(v.string()),
  daysRemaining: v.number(), // Calculated: days from today to endDate
})

/**
 * Recent vacation record (for history tracking)
 */
export const recentVacationValidator = v.object({
  entryId: v.string(),
  startDate: v.number(),
  endDate: v.number(),
  days: v.number(),
  type: vacationTypeValidator,
  completedAt: v.number(), // When vacation ended
})

// ============================================================================
// Vacation Entry Validators
// ============================================================================

/**
 * Individual vacation entry with full approval workflow
 */
export const vacationEntryValidator = v.object({
  entryId: v.string(), // Unique ID for the entry
  startDate: v.number(),
  endDate: v.number(),
  days: v.number(),
  type: vacationTypeValidator,

  // Approval Workflow
  status: vacationStatusValidator,

  // Approval fields
  approvedBy: v.optional(v.string()), // AuthUserId who approved
  approvedDate: v.optional(v.number()),
  approvalNotes: v.optional(v.string()),

  // Rejection fields
  rejectedBy: v.optional(v.string()), // AuthUserId who rejected
  rejectedDate: v.optional(v.number()),
  rejectionReason: v.optional(v.string()),

  // Cancellation fields
  cancelledBy: v.optional(v.string()), // AuthUserId who cancelled
  cancelledDate: v.optional(v.number()),
  cancellationReason: v.optional(v.string()),

  // Request Metadata
  requestedDate: v.number(),
  requestedBy: v.string(), // AuthUserId who requested
  reason: v.optional(v.string()),
  emergencyContact: v.optional(emergencyContactValidator),

  // Additional Fields
  notes: v.optional(v.string()),
  isHalfDay: v.optional(v.boolean()),
})
