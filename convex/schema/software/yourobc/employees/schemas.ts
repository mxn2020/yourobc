// convex/schema/software/yourobc/employees/schemas.ts
// Schema exports for employees module

import { employeesTable, vacationDaysTable } from './employees';

export const softwareYourObcEmployeesSchemas = {
  yourobcEmployees: employeesTable,
  yourobcVacationDays: vacationDaysTable,
};
