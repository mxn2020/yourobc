// convex/lib/system/blog/providerSync/types.ts
import type { Doc, Id } from '@/generated/dataModel';
import type { BlogProviderStatus, BlogSyncDirection, BlogLastSyncStatus } from '@/schema/system/blog/blog/types';

export type BlogProviderSync = Doc<'blogProviderSync'>;
export type BlogProviderSyncId = Id<'blogProviderSync'>;

export interface CreateBlogProviderSyncData {
  title: string;
  provider: string;
  enabled: boolean;
  autoSync?: boolean;
  syncDirection?: BlogSyncDirection;
  syncInterval?: number;
  apiUrl?: string;
  apiKey?: string;
  apiSecret?: string;
  contentApiKey?: string;
  adminApiKey?: string;
  status?: BlogProviderStatus;
}

export interface UpdateBlogProviderSyncData extends Partial<CreateBlogProviderSyncData> {}

export interface BlogProviderSyncListResponse {
  items: BlogProviderSync[];
  total: number;
  hasMore: boolean;
}
