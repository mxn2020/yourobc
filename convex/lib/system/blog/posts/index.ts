// convex/lib/system/blog/posts/index.ts
// Public API exports for blog posts module

// Constants
export { BLOG_POSTS_CONSTANTS } from './constants';

// Types
export type * from './types';

// Utilities
export {
  validateBlogPostData,
  formatBlogPostDisplayTitle,
  generateSlugFromTitle,
  calculateReadingTime,
  calculateWordCount,
  isBlogPostEditable,
  isBlogPostPublished,
  isBlogPostPubliclyVisible,
  generateExcerptFromContent,
  validatePostPassword,
  canPublishPost,
} from './utils';

// Permissions
export {
  canViewBlogPost,
  canEditBlogPost,
  canPublishBlogPost,
  canDeleteBlogPost,
  requireViewBlogPostAccess,
  requireEditBlogPostAccess,
  requirePublishBlogPostAccess,
  requireDeleteBlogPostAccess,
  filterBlogPostsByAccess,
  canViewPasswordProtectedPost,
  canManageSEO,
} from './permissions';

// Queries
export {
  getBlogPosts,
  getBlogPost,
  getBlogPostByPublicId,
  getBlogPostBySlug,
  getPublishedBlogPosts,
  getBlogPostsBySeries,
  getBlogPostStats,
  getScheduledPostsDueForPublishing,
} from './queries';

// Mutations
export {
  createBlogPost,
  updateBlogPost,
  publishBlogPost,
  unpublishBlogPost,
  deleteBlogPost,
  restoreBlogPost,
  archiveBlogPost,
  incrementViewCount,
  bulkUpdateBlogPosts,
  bulkDeleteBlogPosts,
} from './mutations';
