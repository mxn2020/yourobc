// src/features/system/blog/providers/index.ts
/**
 * Blog Providers - Barrel Export
 *
 * All blog provider implementations
 */

// Named exports
export { InternalBlogProvider } from './internal/InternalBlogProvider';
export { GhostBlogProvider } from './ghost/GhostBlogProvider';
export { ContentfulBlogProvider } from './contentful/ContentfulBlogProvider';
export { SanityBlogProvider } from './sanity/SanityBlogProvider';

// Default exports for dynamic imports (with different names to avoid conflicts)
export { default as InternalProvider } from './internal';
export { default as GhostProvider } from './ghost';
export { default as ContentfulProvider } from './contentful';
export { default as SanityProvider } from './sanity';
