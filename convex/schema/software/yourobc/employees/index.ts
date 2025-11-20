// convex/schema/software/yourobc/employees/index.ts
/**
 * Employees Entity - Schema Module
 *
 * Barrel export for all employee-related schemas, validators, and types.
 * This module handles both the main employees table and vacation days tracking.
 *
 * @module convex/schema/software/yourobc/employees
 */

// Table Schemas
export { employeesTable, vacationDaysTable } from './schemas'

// Validators
export {
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

// Types
export type {
  Employee,
  VacationDays,
  EmployeeId,
  VacationDaysId,
  Office,
  EmergencyContact,
  CurrentVacationStatus,
  RecentVacation,
  VacationEntry,
  EmployeeStatus,
  WorkStatus,
  VacationType,
  VacationStatus,
  CreateEmployeeInput,
  UpdateEmployeeInput,
  CreateVacationDaysInput,
  CreateVacationEntryInput,
  UpdateVacationEntryInput,
  EmployeeDisplay,
  VacationDaysDisplay,
} from './types'
