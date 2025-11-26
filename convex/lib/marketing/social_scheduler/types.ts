// convex/lib/marketing/social_scheduler/types.ts

import type { Doc, Id } from '@/generated/dataModel';

export type MarketingSocialPost = Doc<'marketingSocialPosts'>;
export type MarketingSocialPostId = Id<'marketingSocialPosts'>;
export type MarketingSocialAccount = Doc<'marketingSocialAccounts'>;

export interface CreateSocialPostData {
  accountId: Id<'marketingSocialAccounts'>;
  content: string;
  mediaUrls?: string[];
  scheduledAt?: number;
  hashtags?: string[];
  mentions?: string[];
  tags?: string[];
}

export interface UpdateSocialPostData {
  content?: string;
  status?: string;
  scheduledAt?: number;
  hashtags?: string[];
  tags?: string[];
}

export interface SocialPostStats {
  totalPosts: number;
  scheduledPosts: number;
  publishedPosts: number;
  byStatus: Record<string, number>;
  byPlatform: Record<string, number>;
}
