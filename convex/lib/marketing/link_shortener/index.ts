// convex/lib/marketing/link_shortener/index.ts

// Export constants and types
export { LINK_SHORTENER_CONSTANTS } from './constants';
export type { LinkStatus } from './constants';
export * from './types';

// Export all queries
export {
  getMarketingLinks,
  getMarketingLink,
  getMarketingLinkByShortCode,
  getMarketingLinkAnalytics,
  getMarketingLinkStats,
} from './queries';

// Export all mutations
export {
  createMarketingLink,
  updateMarketingLink,
  deleteMarketingLink,
  trackLinkClick,
} from './mutations';

// Export utilities
export {
  validateMarketingLinkData,
  isLinkActive,
  isLinkExpired,
  hasReachedMaxClicks,
  getStatusColor,
  generateShortCode,
  calculateClickRate,
} from './utils';

// Export permissions
export {
  canViewLink,
  canEditLink,
  canDeleteLink,
  requireViewAccess,
  requireEditAccess,
  requireDeleteAccess,
  filterLinksByAccess,
} from './permissions';
