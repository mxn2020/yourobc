// convex/schema/software/yourobc/employees/employees.ts
/**
 * Employees Table Schema
 *
 * Defines the core employee records with time tracking, status management,
 * and employment details. This table represents office staff in the YourOBC system.
 *
 * @module convex/schema/software/yourobc/employees/employees
 */

import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import {
  employeeStatusValidator,
  workStatusValidator,
  timeEntrySchema,
  officeValidator,
  emergencyContactValidator,
  currentVacationStatusValidator,
  recentVacationValidator,
} from './validators'
import { auditFields, softDeleteFields, metadataSchema } from '../../../yourobc/base'

/**
 * Employee management table
 * Tracks office employees with time tracking, status, and employment details
 */
export const employeesTable = defineTable({
  // Core Identity
  publicId: v.string(), // Public-facing unique identifier
  ownerId: v.string(), // Owner authUserId for permissions
  userProfileId: v.id('userProfiles'),
  authUserId: v.string(),
  employeeNumber: v.string(),

  // Employment Details
  type: v.literal('office'),
  department: v.optional(v.string()),
  position: v.optional(v.string()),
  managerId: v.optional(v.id('yourobcEmployees')),
  office: officeValidator,
  hireDate: v.optional(v.number()),

  // Contact
  workPhone: v.optional(v.string()),
  workEmail: v.optional(v.string()),
  emergencyContact: v.optional(emergencyContactValidator),

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
  currentVacationStatus: v.optional(currentVacationStatusValidator),

  // Recent Vacation History (last 5 completed vacations)
  recentVacations: v.optional(v.array(recentVacationValidator)),

  // Metadata
  ...metadataSchema,

  // Audit & Soft Delete
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_publicId', ['publicId'])
  .index('by_ownerId', ['ownerId'])
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
