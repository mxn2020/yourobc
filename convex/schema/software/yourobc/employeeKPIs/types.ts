// convex/schema/software/yourobc/employeeKPIs/types.ts
// Type extractions from validators for employeeKPIs module

import { Infer } from 'convex/values';
import { employeeKPIsValidators } from './validators';

// Extract types from validators
export type EmployeeKPIsStatus = Infer<typeof employeeKPIsValidators.status>;
export type EmployeeKPIsPeriod = Infer<typeof employeeKPIsValidators.period>;
