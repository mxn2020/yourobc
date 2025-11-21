// convex/lib/system/email/templates/index.ts
// Public API exports for email templates module

// Constants
export { EMAIL_TEMPLATES_CONSTANTS } from './constants';

// Types
export type * from './types';

// Utilities
export {
  validateEmailTemplateData,
  extractTemplateVariables,
  replaceTemplateVariables,
  sanitizeHtml,
  formatEmailTemplateDisplayName,
  generateSlug,
  isEmailTemplateEditable,
} from './utils';

// Permissions
export {
  canViewEmailTemplate,
  canEditEmailTemplate,
  canDeleteEmailTemplate,
  canCreateEmailTemplate,
  requireViewEmailTemplateAccess,
  requireEditEmailTemplateAccess,
  requireDeleteEmailTemplateAccess,
  requireCreateEmailTemplateAccess,
  filterEmailTemplatesByAccess,
} from './permissions';

// Queries
export {
  getEmailTemplates,
  getEmailTemplate,
  getEmailTemplateByPublicId,
  getTemplateBySlug,
  searchTemplates,
  getEmailTemplateStats,
} from './queries';

// Mutations
export {
  saveEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
  restoreEmailTemplate,
  incrementTemplateUsage,
} from './mutations';
