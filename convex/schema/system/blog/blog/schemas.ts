// convex/schema/system/blog/blog/schemas.ts
// Schema exports for blog module

import {
  blogPostsTable,
  blogCategoriesTable,
  blogTagsTable,
  blogAuthorsTable,
  blogProviderSyncTable,
  blogMediaTable,
} from './blog';

export const blogSchemas = {
  blogPosts: blogPostsTable,
  blogCategories: blogCategoriesTable,
  blogTags: blogTagsTable,
  blogAuthors: blogAuthorsTable,
  blogProviderSync: blogProviderSyncTable,
  blogMedia: blogMediaTable,
};
