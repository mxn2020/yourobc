// convex/schema/software/yourobc/employees/types.ts
// Type extractions from validators for employees module

import { Infer } from 'convex/values';
import { employeesValidators } from './validators';

// Extract types from validators
export type EmployeeStatus = Infer<typeof employeesValidators.status>;
export type WorkStatus = Infer<typeof employeesValidators.workStatus>;
export type VacationType = Infer<typeof employeesValidators.vacationType>;
export type VacationStatus = Infer<typeof employeesValidators.vacationStatus>;
export type EmploymentType = Infer<typeof employeesValidators.employmentType>;
