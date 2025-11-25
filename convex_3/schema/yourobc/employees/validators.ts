// convex/schema/yourobc/employees/validators.ts
/**
 * Employees Validators
 *
 * Convex validators for employees-related data structures.
 * Includes status enums and reusable complex object schemas.
 */

import { v } from 'convex/values';

/**
 * Grouped validators for employees module
 */
export const employeesValidators = {
  status: v.union(
    v.literal('active'),
    v.literal('inactive'),
    v.literal('terminated'),
    v.literal('on_leave'),
    v.literal('probation')
  ),

  workStatus: v.union(
    v.literal('available'),
    v.literal('busy'),
    v.literal('offline'),
    v.literal('on_break'),
    v.literal('in_meeting')
  ),

  vacationType: v.union(
    v.literal('annual'),
    v.literal('sick'),
    v.literal('personal'),
    v.literal('maternity'),
    v.literal('paternity'),
    v.literal('unpaid'),
    v.literal('bereavement'),
    v.literal('other')
  ),

  vacationStatus: v.union(
    v.literal('pending'),
    v.literal('approved'),
    v.literal('rejected'),
    v.literal('cancelled'),
    v.literal('completed')
  ),

  employmentType: v.union(
    v.literal('full_time'),
    v.literal('part_time'),
    v.literal('contract'),
    v.literal('temporary'),
    v.literal('intern')
  ),
} as const;

/**
 * Complex object schemas for employees module
 */
const emergencyContact = v.object({
  name: v.string(),
  phone: v.string(),
  relationship: v.string(),
});

export const employeesFields = {
  timeEntry: v.object({
    entryId: v.string(),
    type: v.union(
      v.literal('clock_in'),
      v.literal('clock_out'),
      v.literal('break_start'),
      v.literal('break_end')
    ),
    timestamp: v.number(),
    location: v.optional(v.object({
      lat: v.number(),
      lng: v.number(),
      accuracy: v.optional(v.number()),
    })),
    notes: v.optional(v.string()),
  }),

  currentVacationStatus: v.object({
    isOnVacation: v.boolean(),
    vacationEntryId: v.string(),
    startDate: v.number(),
    endDate: v.number(),
    type: employeesValidators.vacationType,
    reason: v.optional(v.string()),
    daysRemaining: v.number(),
  }),

  vacationHistoryEntry: v.object({
    entryId: v.string(),
    startDate: v.number(),
    endDate: v.number(),
    days: v.number(),
    type: employeesValidators.vacationType,
    completedAt: v.number(),
  }),

  vacationEntry: v.object({
    entryId: v.string(),
    startDate: v.number(),
    endDate: v.number(),
    days: v.number(),
    type: employeesValidators.vacationType,

    // Approval Workflow
    status: employeesValidators.vacationStatus,
    approvedBy: v.optional(v.string()),
    approvedDate: v.optional(v.number()),
    approvalNotes: v.optional(v.string()),

    // Rejection fields
    rejectedBy: v.optional(v.string()),
    rejectedDate: v.optional(v.number()),
    rejectionReason: v.optional(v.string()),

    // Cancellation fields
    cancelledBy: v.optional(v.string()),
    cancelledDate: v.optional(v.number()),
    cancellationReason: v.optional(v.string()),

    // Request Metadata
    requestedDate: v.number(),
    requestedBy: v.string(),
    reason: v.optional(v.string()),
    emergencyContact: v.optional(emergencyContact),

    // Additional Fields
    notes: v.optional(v.string()),
    isHalfDay: v.optional(v.boolean()),
  }),

  emergencyContact,
} as const;
