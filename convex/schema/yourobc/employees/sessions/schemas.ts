// convex/schema/yourobc/employees/sessions/schemas.ts
// Schema exports for employeeSessions module

import { employeeSessionsTable, workHoursSummaryTable } from './tables';

export const yourobcEmployeeSessionsSchemas = {
  yourobcEmployeeSessions: employeeSessionsTable,
  yourobcWorkHoursSummary: workHoursSummaryTable,
};
