// convex/schema/yourobc/employees/schemas.ts
// Schema exports for employees module

import { employeesTable, vacationDaysTable } from './employees';
import { yourobcEmployeeCommissionsSchemas } from './commissions/schemas';
import { yourobcEmployeeKpisSchemas } from './kpis/schemas';
import { yourobcEmployeeSessionsSchemas } from './sessions/schemas';

export const yourobcEmployeesSchemas = {
  yourobcEmployees: employeesTable,
  yourobcVacationDays: vacationDaysTable,
  ...yourobcEmployeeCommissionsSchemas,
  ...yourobcEmployeeKpisSchemas,
  ...yourobcEmployeeSessionsSchemas,
};
