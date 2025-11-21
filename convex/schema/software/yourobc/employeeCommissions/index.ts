// convex/schema/software/yourobc/employeeCommissions/index.ts
/**
 * Employee Commissions Schema Barrel Export
 *
 * Exports all commission-related schemas, validators, and types.
 *
 * @module convex/schema/software/yourobc/employeeCommissions
 */

// Table schemas
export {
  employeeCommissionsTable,
  employeeCommissionRulesTable,
} from './schemas'

// Validators
export {
  appliedTierValidator,
  commissionTierValidator,
  serviceTypeValidator,
} from './validators'

// Types
export type {
  AppliedTier,
  CommissionTier,
  ServiceType,
  EmployeeCommission,
  EmployeeCommissionRule,
  EmployeeCommissionId,
  EmployeeCommissionRuleId,
  CreateEmployeeCommissionInput,
  UpdateEmployeeCommissionInput,
  CreateEmployeeCommissionRuleInput,
  UpdateEmployeeCommissionRuleInput,
} from './types'
