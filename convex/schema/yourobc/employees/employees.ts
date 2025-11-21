// convex/schema/yourobc/employees/employees.ts
// Table definitions for employees module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields } from '@/schema/base';
import { employeesValidators } from './validators';

// ============================================================================
// Time Entry Schema (reusable for clock in/out tracking)
// ============================================================================

const timeEntrySchema = v.object({
  entryId: v.string(),
  type: v.union(v.literal('clock_in'), v.literal('clock_out'), v.literal('break_start'), v.literal('break_end')),
  timestamp: v.number(),
  location: v.optional(v.object({
    lat: v.number(),
    lng: v.number(),
    accuracy: v.optional(v.number()),
  })),
  notes: v.optional(v.string()),
});

// ============================================================================
// Employees Table
// ============================================================================

export const employeesTable = defineTable({
  // Required: Main display field
  name: v.string(),

  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),

  // Core Identity
  userProfileId: v.id('userProfiles'),
  authUserId: v.string(),
  employeeNumber: v.string(),

  // Employment Details
  type: v.literal('office'),
  department: v.optional(v.string()),
  position: v.optional(v.string()),
  managerId: v.optional(v.id('yourobcEmployees')),
  employmentType: v.optional(employeesValidators.employmentType),

  // Office Location
  office: v.object({
    location: v.string(),
    country: v.string(),
    countryCode: v.string(),
    address: v.optional(v.string()),
  }),

  // Employment Dates
  hireDate: v.optional(v.number()),
  startDate: v.optional(v.number()),
  endDate: v.optional(v.number()),

  // Compensation
  salary: v.optional(v.number()),
  currency: v.optional(v.string()),
  paymentFrequency: v.optional(v.union(
    v.literal('hourly'),
    v.literal('weekly'),
    v.literal('bi_weekly'),
    v.literal('monthly'),
    v.literal('annually')
  )),

  // Contact Information
  email: v.optional(v.string()),
  phone: v.optional(v.string()),
  workPhone: v.optional(v.string()),
  workEmail: v.optional(v.string()),
  emergencyContact: v.optional(v.object({
    name: v.string(),
    phone: v.string(),
    relationship: v.string(),
  })),

  // Status & Availability
  status: employeesValidators.status,
  workStatus: v.optional(employeesValidators.workStatus),
  isActive: v.boolean(),
  isOnline: v.boolean(),
  lastActivity: v.optional(v.number()),

  // Time Tracking
  timeEntries: v.optional(v.array(timeEntrySchema)),
  timezone: v.string(),

  // Vacation Status (denormalized for performance)
  currentVacationStatus: v.optional(v.object({
    isOnVacation: v.boolean(),
    vacationEntryId: v.string(),
    startDate: v.number(),
    endDate: v.number(),
    type: employeesValidators.vacationType,
    reason: v.optional(v.string()),
    daysRemaining: v.number(),
  })),

  // Recent Vacation History (last 5 completed vacations)
  recentVacations: v.optional(v.array(v.object({
    entryId: v.string(),
    startDate: v.number(),
    endDate: v.number(),
    days: v.number(),
    type: employeesValidators.vacationType,
    completedAt: v.number(),
  }))),

  // Required: Audit fields
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_name', ['name'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_authUserId', ['authUserId'])
  .index('by_userProfile', ['userProfileId'])
  .index('by_employeeNumber', ['employeeNumber'])
  .index('by_type', ['type'])
  .index('by_status', ['status'])
  .index('by_workStatus', ['workStatus'])
  .index('by_isActive', ['isActive'])
  .index('by_isOnline', ['isOnline'])
  .index('by_department', ['department'])
  .index('by_office_location', ['office.location'])
  .index('by_office_country', ['office.countryCode'])
  .index('by_manager', ['managerId'])
  .index('by_owner_and_status', ['ownerId', 'status'])
  .index('by_created', ['createdAt']);

// ============================================================================
// Vacation Days Table
// ============================================================================

export const vacationDaysTable = defineTable({
  // Required: Main display field (employee name + year)
  name: v.string(), // e.g., "John Doe - 2024"

  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),

  // Employee Reference
  employeeId: v.id('yourobcEmployees'),
  year: v.number(),

  // Entitlement Calculation
  annualEntitlement: v.number(),
  carryoverDays: v.number(),
  carryoverApprovedBy: v.optional(v.string()),
  carryoverApprovedAt: v.optional(v.number()),
  available: v.number(),
  used: v.number(),
  pending: v.number(),
  remaining: v.number(),

  // Calculation Metadata
  calculationDate: v.optional(v.number()),
  hireAnniversaryAdjustment: v.optional(v.number()),

  // Vacation Entries
  entries: v.array(v.object({
    entryId: v.string(),
    startDate: v.number(),
    endDate: v.number(),
    days: v.number(),
    type: employeesValidators.vacationType,

    // Approval Workflow
    status: employeesValidators.vacationStatus,

    // Approval fields
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
    emergencyContact: v.optional(v.object({
      name: v.string(),
      phone: v.string(),
      relationship: v.string(),
    })),

    // Additional Fields
    notes: v.optional(v.string()),
    isHalfDay: v.optional(v.boolean()),
  })),

  // Required: Audit fields
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_name', ['name'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_employee', ['employeeId'])
  .index('by_year', ['year'])
  .index('by_employee_year', ['employeeId', 'year'])
  .index('by_created', ['createdAt']);
