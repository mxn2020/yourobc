// convex/lib/software/yourobc/employeeSessions/index.ts
// Public API exports for employeeSessions module

// Constants
export { EMPLOYEE_SESSIONS_CONSTANTS } from './constants';

// Types
export type * from './types';

// Utilities
export {
  validateEmployeeSessionData,
  generateSessionId,
  calculateSessionDuration,
  calculateBreakDuration,
  isSessionActive,
  formatSessionDisplayName,
} from './utils';

// Permissions
export {
  canViewEmployeeSession,
  canEditEmployeeSession,
  canDeleteEmployeeSession,
  requireViewEmployeeSessionAccess,
  requireEditEmployeeSessionAccess,
  requireDeleteEmployeeSessionAccess,
  filterEmployeeSessionsByAccess,
} from './permissions';

// Queries
export {
  getEmployeeSessions,
  getEmployeeSession,
  getEmployeeSessionByPublicId,
  getActiveEmployeeSession,
  getEmployeeSessionStats,
} from './queries';

// Mutations
export {
  createEmployeeSession,
  updateEmployeeSession,
  deleteEmployeeSession,
  restoreEmployeeSession,
} from './mutations';
