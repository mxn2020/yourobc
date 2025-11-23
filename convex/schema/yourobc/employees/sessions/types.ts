// convex/schema/yourobc/employees/sessions/types.ts
// Type extractions from validators for employeeSessions module

import { Infer } from 'convex/values';
import {
  employeeSessionsValidators,
  employeeSessionsFields,
} from './validators';

// Extract types from validators
export type EmployeeSessionsStatus = Infer<typeof employeeSessionsValidators.status>;
export type EmployeeSessionLocation = Infer<typeof employeeSessionsFields.location>;
export type EmployeeSessionDevice = Infer<typeof employeeSessionsFields.device>;
export type EmployeeSessionBreak = Infer<typeof employeeSessionsFields.breakEntry>;
export type EmployeeSessionActivityLogEntry = Infer<typeof employeeSessionsFields.activityLogEntry>;
