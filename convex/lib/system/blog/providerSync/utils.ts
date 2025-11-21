// convex/lib/system/blog/providerSync/utils.ts
import { BLOG_PROVIDER_SYNC_CONSTANTS } from './constants';
import type { CreateBlogProviderSyncData, UpdateBlogProviderSyncData } from './types';

export function validateBlogProviderSyncData(data: Partial<CreateBlogProviderSyncData | UpdateBlogProviderSyncData>): string[] {
  const errors: string[] = [];
  if (data.title !== undefined && (!data.title.trim() || data.title.trim().length > BLOG_PROVIDER_SYNC_CONSTANTS.LIMITS.MAX_TITLE_LENGTH)) {
    errors.push('Invalid title');
  }
  if (data.syncInterval !== undefined && data.syncInterval < BLOG_PROVIDER_SYNC_CONSTANTS.LIMITS.MIN_SYNC_INTERVAL) {
    errors.push('Sync interval too short');
  }
  return errors;
}
