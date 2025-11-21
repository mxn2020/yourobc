// convex/schema/yourobc/employeeSessions/types.ts
// Type extractions from validators for employeeSessions module

import { Infer } from 'convex/values';
import { employeeSessionsValidators } from './validators';

// Extract types from validators
export type EmployeeSessionsStatus = Infer<typeof employeeSessionsValidators.status>;
