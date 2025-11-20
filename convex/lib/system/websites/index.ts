// convex/lib/boilerplate/websites/index.ts

// Export constants
export { WEBSITE_CONSTANTS } from './constants'
export type { WebsiteStatus, PageStatus, WebsiteVisibility, PageTemplateType, SectionType, ThemeType, LayoutType, BlockType, CollaboratorRole } from './constants'

// Export types
export type * from './types'

// Export utilities
export * from './utils'

// Export permissions
export * from './permissions'

// Export all queries
export {
  getWebsites,
  getWebsite,
  getWebsiteByPublicId,
  getWebsitePages,
  getPage,
  getPageWithSections,
  getWebsiteSections,
  getSection,
  getThemes,
  getTheme,
  getTemplates,
  getWebsiteStats,
  getWebsiteCollaborators,
  getUserWebsites,
  getDashboardStats,
} from './queries'

// Export all mutations
export {
  createWebsite,
  updateWebsite,
  publishWebsite,
  deleteWebsite,
  createPage,
  updatePage,
  publishPage,
  deletePage,
  createSection,
  updateSection,
  deleteSection,
  addCollaborator,
  removeCollaborator,
} from './mutations'
