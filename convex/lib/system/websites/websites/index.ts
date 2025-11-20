// convex/lib/boilerplate/websites/websites/index.ts
// Public API exports for websites module

// Constants
export { WEBSITES_CONSTANTS, PRIORITY_WEIGHTS } from './constants';

// Types
export type * from './types';

// Utilities
export {
  validateWebsiteData,
  isValidDomain,
  isValidSubdomain,
  generateSlug,
  formatWebsiteDisplayName,
  getWebsiteStatusColor,
  getWebsitePriorityWeight,
  getWebsitePriorityColor,
  compareWebsitePriority,
  isWebsitePublished,
  isWebsiteEditable,
  formatSEOTitle,
  formatSEODescription,
  sanitizeHTML,
} from './utils';

// Permissions
export {
  canViewWebsite,
  canEditWebsite,
  canPublishWebsite,
  canDeleteWebsite,
  canManageCollaborators,
  canEditTheme,
  requireViewWebsiteAccess,
  requireEditWebsiteAccess,
  requirePublishWebsiteAccess,
  requireDeleteWebsiteAccess,
  requireCollaboratorManagementAccess,
  requireThemeEditAccess,
  filterWebsitesByAccess,
} from './permissions';

// Queries
export {
  getWebsites,
  getWebsite,
  getWebsiteByPublicId,
  getWebsiteStats,
  getUserWebsites,
} from './queries';

// Mutations
export {
  createWebsite,
  updateWebsite,
  publishWebsite,
  deleteWebsite,
  restoreWebsite,
  archiveWebsite,
} from './mutations';
