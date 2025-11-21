// convex/schema/yourobc/employees/types.ts
// Type extractions from validators for employees module

import { Infer } from 'convex/values';
import { employeesValidators, employeesFields } from './validators';

// Extract types from validators
export type EmployeeStatus = Infer<typeof employeesValidators.status>;
export type WorkStatus = Infer<typeof employeesValidators.workStatus>;
export type VacationType = Infer<typeof employeesValidators.vacationType>;
export type VacationStatus = Infer<typeof employeesValidators.vacationStatus>;
export type EmploymentType = Infer<typeof employeesValidators.employmentType>;
export type EmployeeTimeEntry = Infer<typeof employeesFields.timeEntry>;
export type EmployeeCurrentVacationStatus = Infer<typeof employeesFields.currentVacationStatus>;
export type EmployeeVacationHistoryEntry = Infer<typeof employeesFields.vacationHistoryEntry>;
export type EmployeeVacationEntry = Infer<typeof employeesFields.vacationEntry>;
export type EmployeeEmergencyContact = Infer<typeof employeesFields.emergencyContact>;
