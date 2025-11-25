// convex/schema/yourobc/employees/commissions/schemas.ts
// Schema exports for employeeCommissions module

import { employeeCommissionsTable, employeeCommissionRulesTable } from './tables';

export const yourobcEmployeeCommissionsSchemas = {
  yourobcEmployeeCommissions: employeeCommissionsTable,
  yourobcEmployeeCommissionsRules: employeeCommissionRulesTable
};
