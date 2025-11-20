// convex/schema/system/blog/blog/types.ts
// Type extractions from validators for blog module

import { Infer } from 'convex/values';
import { blogValidators } from './validators';

// Extract types from validators
export type BlogPostStatus = Infer<typeof blogValidators.postStatus>;
export type BlogPostVisibility = Infer<typeof blogValidators.postVisibility>;
export type BlogSyncStatus = Infer<typeof blogValidators.syncStatus>;
export type BlogSyncDirection = Infer<typeof blogValidators.syncDirection>;
export type BlogLastSyncStatus = Infer<typeof blogValidators.lastSyncStatus>;
export type BlogFeaturedImage = Infer<typeof blogValidators.featuredImage>;
