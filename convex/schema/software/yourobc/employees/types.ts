// convex/schema/software/yourobc/employees/types.ts
/**
 * Type Extractions for Employees Schema
 *
 * Provides TypeScript types extracted from validators and table schemas
 * for use in business logic, queries, and mutations.
 *
 * @module convex/schema/software/yourobc/employees/types
 */

import { Doc, Id } from '../../../_generated/dataModel'
import { Infer } from 'convex/values'
import {
  officeValidator,
  emergencyContactValidator,
  currentVacationStatusValidator,
  recentVacationValidator,
  vacationEntryValidator,
  employeeStatusValidator,
  workStatusValidator,
  vacationTypeValidator,
  vacationStatusValidator,
} from './validators'

// ============================================================================
// Table Document Types
// ============================================================================

export type Employee = Doc<'yourobcEmployees'>
export type VacationDays = Doc<'yourobcVacationDays'>

export type EmployeeId = Id<'yourobcEmployees'>
export type VacationDaysId = Id<'yourobcVacationDays'>

// ============================================================================
// Validator-Derived Types
// ============================================================================

export type Office = Infer<typeof officeValidator>
export type EmergencyContact = Infer<typeof emergencyContactValidator>
export type CurrentVacationStatus = Infer<typeof currentVacationStatusValidator>
export type RecentVacation = Infer<typeof recentVacationValidator>
export type VacationEntry = Infer<typeof vacationEntryValidator>

export type EmployeeStatus = Infer<typeof employeeStatusValidator>
export type WorkStatus = Infer<typeof workStatusValidator>
export type VacationType = Infer<typeof vacationTypeValidator>
export type VacationStatus = Infer<typeof vacationStatusValidator>

// ============================================================================
// Input Types
// ============================================================================

/**
 * Input type for creating a new employee
 */
export type CreateEmployeeInput = {
  userProfileId: EmployeeId
  authUserId: string
  employeeNumber: string
  type?: 'office'
  department?: string
  position?: string
  managerId?: EmployeeId
  office: Office
  hireDate?: number
  workPhone?: string
  workEmail?: string
  emergencyContact?: EmergencyContact
  status: EmployeeStatus
  workStatus?: WorkStatus
  isActive: boolean
  isOnline?: boolean
  timezone: string
  metadata?: Record<string, any>
}

/**
 * Input type for updating an employee
 */
export type UpdateEmployeeInput = Partial<
  Omit<CreateEmployeeInput, 'userProfileId' | 'authUserId' | 'employeeNumber'>
>

/**
 * Input type for creating vacation days record
 */
export type CreateVacationDaysInput = {
  employeeId: EmployeeId
  year: number
  annualEntitlement: number
  carryoverDays?: number
  carryoverApprovedBy?: string
  carryoverApprovedAt?: number
}

/**
 * Input type for creating a vacation entry
 */
export type CreateVacationEntryInput = {
  employeeId: EmployeeId
  year: number
  startDate: number
  endDate: number
  days: number
  type: VacationType
  reason?: string
  emergencyContact?: EmergencyContact
  notes?: string
  isHalfDay?: boolean
}

/**
 * Input type for updating a vacation entry
 */
export type UpdateVacationEntryInput = {
  entryId: string
  status?: VacationStatus
  approvedBy?: string
  approvedDate?: number
  approvalNotes?: string
  rejectedBy?: string
  rejectedDate?: number
  rejectionReason?: string
  cancelledBy?: string
  cancelledDate?: number
  cancellationReason?: string
  notes?: string
}

// ============================================================================
// Display Types
// ============================================================================

/**
 * Display type for employee list view
 */
export type EmployeeDisplay = {
  _id: EmployeeId
  publicId: string
  name: string // Main display field from userProfile
  employeeNumber: string
  department?: string
  position?: string
  status: EmployeeStatus
  isActive: boolean
  isOnline: boolean
  office: Office
}

/**
 * Display type for vacation days list view
 */
export type VacationDaysDisplay = {
  _id: VacationDaysId
  publicId: string
  employeeId: EmployeeId
  employeeName: string
  year: number
  dates: string // Main display field: formatted date range summary
  available: number
  used: number
  pending: number
  remaining: number
}
