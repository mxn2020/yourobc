// src/features/boilerplate/blog/index.ts
/**
 * Blog Feature - Main Export
 *
 * Central entry point for the blog feature
 */

// Types
export * from './types';

// Configuration
export * from './config';

// Services
export { BlogService } from './services';

// Hooks
export {
  BlogProvider,
  useBlog,
  useBlogReady,
  usePosts,
  usePost,
  useCategories,
  useScheduling,
} from './hooks';

// Providers (for advanced usage)
export { InternalBlogProvider } from './providers/internal';

// Components
export { MarkdownEditor } from './components/MarkdownEditor';
export { PostCard, PostList } from './shared/components';

// Pages
export { BlogDashboard, BlogHomePage, PostDetailPage, PostEditorPage } from './pages';

// Utilities
export * from './utils';

// Re-export commonly used types for convenience
export type {
  BlogPost,
  BlogCategory,
  BlogTag,
  BlogAuthor,
  PostFormData,
  PostFilters,
  SEOScore,
  SEORecommendation,
} from './types';
