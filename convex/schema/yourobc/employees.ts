// convex/schema/yourobc/employees.ts
/**
 * YourOBC Employee Schema
 *
 * Defines schemas for employee management including office staff tracking,
 * vacation/time-off management, and employment details.
 * Follows the single source of truth pattern using validators from base.ts.
 *
 * Tables:
 * - employeesTable: Core employee records with time tracking
 * - vacationDaysTable: Vacation day tracking with approval workflow
 *
 * @module convex/schema/yourobc/employees
 */

import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import {
  employeeStatusValidator,
  workStatusValidator,
  timeEntrySchema,
  vacationTypeValidator,
  vacationStatusValidator,
  auditFields,
  softDeleteFields,
  metadataSchema
} from './base'

// ============================================================================
// Employees Table
// ============================================================================

/**
 * Employee management table
 * Tracks office employees with time tracking, status, and employment details
 */
export const employeesTable = defineTable({
  // Core Identity
  userProfileId: v.id('userProfiles'),
  authUserId: v.string(),
  employeeNumber: v.string(),

  // Employment Details
  type: v.literal('office'),
  department: v.optional(v.string()),
  position: v.optional(v.string()),
  managerId: v.optional(v.id('yourobcEmployees')),
  office: v.object({
    location: v.string(),
    country: v.string(),
    countryCode: v.string(),
    address: v.optional(v.string()),
  }),
  hireDate: v.optional(v.number()),
  
  // Contact
  workPhone: v.optional(v.string()),
  workEmail: v.optional(v.string()),
  emergencyContact: v.optional(v.object({
    name: v.string(),
    phone: v.string(),
    relationship: v.string(),
  })),
  
  // Status & Availability
  status: employeeStatusValidator,
  workStatus: v.optional(workStatusValidator), // Real-time work availability: available/busy/offline
  isActive: v.boolean(),
  isOnline: v.boolean(),
  lastActivity: v.optional(v.number()), // Timestamp of last activity (for auto-offline after inactivity)

  // Time Tracking
  timeEntries: v.array(timeEntrySchema),
  timezone: v.string(),

  // Vacation Status (denormalized for performance)
  currentVacationStatus: v.optional(v.object({
    isOnVacation: v.boolean(),
    vacationEntryId: v.string(), // Reference to entry in vacationDaysTable
    startDate: v.number(),
    endDate: v.number(),
    type: vacationTypeValidator,
    reason: v.optional(v.string()),
    daysRemaining: v.number(), // Calculated: days from today to endDate
  })),

  // Recent Vacation History (last 5 completed vacations)
  recentVacations: v.optional(v.array(v.object({
    entryId: v.string(),
    startDate: v.number(),
    endDate: v.number(),
    days: v.number(),
    type: vacationTypeValidator,
    completedAt: v.number(), // When vacation ended
  }))),

  // Metadata
  ...metadataSchema,

  // Audit & Soft Delete
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_authUserId', ['authUserId'])
  .index('by_userProfile', ['userProfileId'])
  .index('by_employeeNumber', ['employeeNumber'])
  .index('by_type', ['type'])
  .index('by_status', ['status'])
  .index('by_workStatus', ['workStatus'])
  .index('by_isActive', ['isActive'])
  .index('by_isOnline', ['isOnline'])
  .index('by_vacation_status', ['currentVacationStatus.isOnVacation'])
  .index('by_department', ['department'])
  .index('by_office_location', ['office.location'])
  .index('by_office_country', ['office.countryCode'])
  .index('by_manager', ['managerId'])
  .index('by_created', ['createdAt'])
  .index('by_deleted', ['deletedAt'])

// ============================================================================
// Vacation Days Table
// ============================================================================

/**
 * Vacation days tracking table
 * Manages employee vacation day entitlements, usage, and approval workflow
 * with automatic calculations and carryover support
 */
export const vacationDaysTable = defineTable({
  // Employee Reference
  employeeId: v.id('yourobcEmployees'),
  year: v.number(),

  // Entitlement Calculation
  annualEntitlement: v.number(), // Base annual days (e.g., 20 or 25)
  carryoverDays: v.number(), // Days carried over from previous year
  carryoverApprovedBy: v.optional(v.string()), // AuthUserId who approved carryover
  carryoverApprovedAt: v.optional(v.number()), // When carryover was approved
  available: v.number(), // annualEntitlement + carryoverDays - used
  used: v.number(),
  pending: v.number(), // Days in pending approval state
  remaining: v.number(), // available - pending - used

  // Calculation Metadata
  calculationDate: v.optional(v.number()), // When auto-calculation was last run
  hireAnniversaryAdjustment: v.optional(v.number()), // Pro-rated adjustment for hire date

  // Vacation Entries
  entries: v.array(v.object({
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
    emergencyContact: v.optional(v.object({
      name: v.string(),
      phone: v.string(),
      relationship: v.string(),
    })),

    // Additional Fields
    notes: v.optional(v.string()),
    isHalfDay: v.optional(v.boolean()),
  })),

  // Audit & Soft Delete
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_employee', ['employeeId'])
  .index('by_year', ['year'])
  .index('by_employee_year', ['employeeId', 'year'])
  .index('by_created', ['createdAt'])
  .index('by_deleted', ['deletedAt'])

// ============================================================================
// USAGE NOTES
// ============================================================================

/**
 * Schema design follows the single source of truth pattern.
 *
 * ✅ DO:
 * - Import validators from base.ts (employeeStatusValidator, vacationTypeValidator, etc.)
 * - Import reusable schemas from base.ts (timeEntrySchema, auditFields, metadataSchema, etc.)
 * - Use imported validators in table definitions
 * - Add indexes for frequently queried fields
 * - Use spread operator for metadata/audit fields: ...metadataSchema, ...auditFields, ...softDeleteFields
 *
 * ❌ DON'T:
 * - Define inline v.union() validators in table definitions
 * - Duplicate validator definitions across tables
 * - Forget to add indexes for query patterns
 * - Redefine audit, metadata, or reusable schema fields manually
 *
 * CUSTOMIZATION GUIDE:
 *
 * 1. Employees Table:
 *    - Core Identity: Links to userProfile and authUserId for authentication
 *    - employeeNumber: Unique identifier for the employee
 *    - type: Currently 'office' (distinguishes from couriers who have separate table)
 *
 * 2. Employment Details:
 *    - department, position: Organizational structure
 *    - managerId: Hierarchy tracking (references another employee)
 *    - office: Location information with country code
 *    - hireDate: Employment start date
 *
 * 3. Contact Information:
 *    - workPhone, workEmail: Business contact details
 *    - emergencyContact: Required for safety and compliance
 *
 * 4. Status & Availability:
 *    - status: Uses employeeStatusValidator from base.ts
 *    - isActive: Employment status (active/inactive/terminated/on_leave)
 *    - isOnline: Real-time presence tracking
 *
 * 5. Time Tracking:
 *    - timeEntries: Array of clock in/out events using timeEntrySchema
 *    - timezone: For accurate time calculations across locations
 *
 * 6. Vacation Days Table:
 *    - Annual Entitlement: Base vacation days per year
 *    - Carryover: Days from previous year
 *    - Calculations: available, used, pending, remaining (auto-calculated)
 *    - Entries: Individual vacation requests with approval workflow
 *    - Status Flow: pending → approved/rejected → (optionally) cancelled
 *
 * 7. Vacation Approval Workflow:
 *    - Each entry tracks: requester, approver, dates, reason
 *    - Support for rejection and cancellation with reasons
 *    - Half-day support via isHalfDay flag
 *    - Emergency contact during vacation period
 *
 * 8. Indexes:
 *    - by_authUserId, by_userProfile: User authentication lookups
 *    - by_employeeNumber: Employee identification
 *    - by_status, by_isActive: Availability queries
 *    - by_department, by_office_location: Organizational queries
 *    - by_manager: Hierarchy queries
 *    - by_employee_year: Vacation tracking per employee per year
 */
