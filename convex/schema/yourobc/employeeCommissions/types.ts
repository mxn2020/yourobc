// convex/schema/yourobc/employeeCommissions/types.ts
// Type extractions from validators for employeeCommissions module

import { Infer } from 'convex/values';
import { employeeCommissionsValidators } from './validators';

// Extract types from validators
export type EmployeeCommissionsStatus = Infer<typeof employeeCommissionsValidators.status>;
