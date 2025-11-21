// convex/lib/system/supporting/wiki/index.ts

/**
 * Wiki Module
 * Knowledge base and documentation system
 *
 * Features:
 * - Article/guide management
 * - Category organization
 * - Tag-based classification
 * - Full-text search
 * - View tracking
 * - Publication workflow (draft → published → archived)
 * - Public/private access control
 * - Soft delete support
 *
 * @module convex/lib/system/supporting/wiki
 */

// Export constants
export { WIKI_CONSTANTS } from './constants'

// Export types
export type {
  WikiEntry,
  WikiEntryId,
  CreateWikiEntryData,
  UpdateWikiEntryData,
  WikiEntryFilters,
  WikiSearchResult,
} from './types'

// Export queries
export {
  getWikiEntries,
  getWikiEntry,
  getWikiEntryBySlug,
  searchWiki,
  getWikiCategories,
  getPublishedWikiEntries,
  getPopularWikiEntries,
} from './queries'

// Export mutations
export {
  createWikiEntry,
  updateWikiEntry,
  publishWikiEntry,
  archiveWikiEntry,
  incrementWikiEntryViews,
  deleteWikiEntry,
} from './mutations'

// Export utilities
export {
  validateCreateWikiEntryData,
  validateUpdateWikiEntryData,
  generateSlug,
  createSearchableContent,
  searchWikiEntries,
  extractPlainText,
  getExcerpt,
} from './utils'
