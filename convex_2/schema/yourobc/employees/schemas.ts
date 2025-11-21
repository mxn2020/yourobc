// convex/schema/yourobc/employees/schemas.ts
// Schema exports for employees module

import { employeesTable, vacationDaysTable } from './employees';

export const yourobcEmployeesSchemas = {
  yourobcEmployees: employeesTable,
  yourobcVacationDays: vacationDaysTable,
};
