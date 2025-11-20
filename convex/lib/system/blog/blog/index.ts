// convex/lib/boilerplate/blog/blog/index.ts
// Public API exports for blog module

// Constants
export { BLOG_CONSTANTS } from './constants';

// Types
export type * from './types';

// Utilities
export {
  generateSlug,
  isReservedSlug,
  makeSlugUnique,
  extractPlainText,
  getExcerpt,
  calculateReadTime,
  countWords,
  createSearchableContent,
  generateTableOfContents,
  isValidEmail,
  isValidUrl,
  isValidHexColor,
  isValidSlug,
  sanitizeString,
  formatDate,
  getRelativeTime,
  calculateSEOScore,
  extractFirstImage,
  stripHTML,
  truncateText,
  calculateReadingProgress,
  generateShareUrls,
} from './utils';

// Permissions
export {
  canViewPost,
  canEditPost,
  canDeletePost,
  requireViewPostAccess,
  requireEditPostAccess,
  requireDeletePostAccess,
  filterPostsByAccess,
  canViewCategory,
  canEditCategory,
  canDeleteCategory,
  canViewTag,
  canEditTag,
  canDeleteTag,
  canViewAuthor,
  canEditAuthor,
  canDeleteAuthor,
} from './permissions';

// Queries
export {
  getPost,
  getPostBySlug,
  getPosts,
  getPublishedPosts,
  getFeaturedPosts,
  getDraftPosts,
  getScheduledPosts,
  getPostsBySeries,
  searchPosts,
  getRelatedPosts,
  getCategory,
  getCategoryBySlug,
  getCategories,
  getRootCategories,
  getChildCategories,
  getTag,
  getTagBySlug,
  getTags,
  getPopularTags,
  getAuthor,
  getAuthorBySlug,
  getAuthorByUserId,
  getAuthors,
  getPostStatistics,
  getProviderSync,
} from './queries';

// Mutations
export {
  createPost,
  updatePost,
  deletePost,
  publishPost,
  schedulePost,
  unschedulePost,
  reschedulePost,
  unpublishPost,
  archivePost,
  incrementPostViews,
  togglePostFeatured,
  createCategory,
  updateCategory,
  deleteCategory,
  createTag,
  updateTag,
  deleteTag,
  createAuthor,
  updateAuthor,
} from './mutations';
