// convex/lib/boilerplate/dashboards/dashboards/index.ts
// Public API exports for dashboards module

// Constants
export { DASHBOARDS_CONSTANTS } from './constants';

// Types
export type * from './types';

// Utilities
export {
  validateCreateDashboardData,
  validateUpdateDashboardData,
  validateDashboardData,
  isDashboardEditable,
  formatDashboardDisplayName,
} from './utils';

// Permissions
export {
  canViewDashboard,
  canEditDashboard,
  canDeleteDashboard,
  requireViewDashboardAccess,
  requireEditDashboardAccess,
  requireDeleteDashboardAccess,
  filterDashboardsByAccess,
} from './permissions';

// Queries
export {
  getDashboards,
  getDashboard,
  getDashboardByPublicId,
  getUserDashboards,
  getPublicDashboards,
  getDefaultDashboard,
  getDashboardStats,
} from './queries';

// Mutations
export {
  createDashboard,
  updateDashboard,
  deleteDashboard,
  restoreDashboard,
} from './mutations';
