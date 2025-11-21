// convex/lib/system/blog/categories/index.ts
// Public API exports for blog categories module

// Constants
export { BLOG_CATEGORIES_CONSTANTS } from './constants';

// Types
export type * from './types';

// Utilities
export {
  validateBlogCategoryData,
  formatBlogCategoryDisplayTitle,
  generateSlug,
  isBlogCategoryEditable,
  buildCategoryTree,
  getDescendantCategoryIds,
  calculateCategoryDepth,
  buildCategoryPath,
  hasCircularParentReference,
} from './utils';

// Permissions
export {
  canViewBlogCategory,
  canEditBlogCategory,
  canDeleteBlogCategory,
  requireViewBlogCategoryAccess,
  requireEditBlogCategoryAccess,
  requireDeleteBlogCategoryAccess,
  filterBlogCategoriesByAccess,
} from './permissions';

// Queries
export {
  getBlogCategories,
  getBlogCategory,
  getBlogCategoryBySlug,
  getBlogCategoryTree,
  getBlogCategoryStats,
} from './queries';

// Mutations
export {
  createBlogCategory,
  updateBlogCategory,
  deleteBlogCategory,
  restoreBlogCategory,
} from './mutations';
