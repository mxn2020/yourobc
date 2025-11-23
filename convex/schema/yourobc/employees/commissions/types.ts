// convex/schema/yourobc/employees/commissions/types.ts
// Type extractions from validators for employeeCommissions module

import { Infer } from 'convex/values';
import { employeeCommissionsValidators, employeeCommissionsFields } from './validators';

// Extract types from validators
export type EmployeeCommissionsStatus = Infer<typeof employeeCommissionsValidators.status>;
export type EmployeeCommissionCalculationBreakdown = Infer<typeof employeeCommissionsFields.calculationBreakdown>;
export type EmployeeCommissionAdjustment = Infer<typeof employeeCommissionsFields.commissionAdjustment>;
