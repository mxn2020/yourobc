// convex/lib/yourobc/employeeKPIs/index.ts
// Public API exports for employeeKPIs module

// Constants
export { EMPLOYEE_KPIS_CONSTANTS } from './constants';

// Types
export type * from './types';

// Utilities
export {
  validateEmployeeKPIData,
  calculateAchievementPercentage,
  calculateChangePercentage,
  determineKPIStatus,
  formatKPIDisplayName,
  isKPIEditable,
} from './utils';

// Permissions
export {
  canViewEmployeeKPI,
  canEditEmployeeKPI,
  canDeleteEmployeeKPI,
  requireViewEmployeeKPIAccess,
  requireEditEmployeeKPIAccess,
  requireDeleteEmployeeKPIAccess,
  filterEmployeeKPIsByAccess,
} from './permissions';

// Queries
export {
  getEmployeeKPIs,
  getEmployeeKPI,
  getEmployeeKPIByPublicId,
  getEmployeeKPIStats,
} from './queries';

// Mutations
export {
  createEmployeeKPI,
  updateEmployeeKPI,
  deleteEmployeeKPI,
  restoreEmployeeKPI,
} from './mutations';
