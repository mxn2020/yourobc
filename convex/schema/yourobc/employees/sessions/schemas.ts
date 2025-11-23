// convex/schema/yourobc/employees/sessions/schemas.ts
// Schema exports for employeeSessions module

import { employeeSessionsTable } from './employeeSessions';
import { workHoursSummaryTable } from './workHoursSummary';

export const yourobcEmployeeSessionsSchemas = {
  yourobcEmployeeSessions: employeeSessionsTable,
  yourobcWorkHoursSummary: workHoursSummaryTable,
};
