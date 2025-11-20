// src/features/marketing/social-scheduler/types.ts

import type { Doc, Id } from '@/convex/_generated/dataModel'

export type SocialPost = Doc<'marketingSocialPosts'>
export type SocialPostId = Id<'marketingSocialPosts'>
export type SocialAccount = Doc<'marketingSocialAccounts'>

export interface CreatePostData {
  accountId: Id<'marketingSocialAccounts'>
  title: string
  description?: string
  content: string
  mediaUrls?: string[]
  scheduledAt?: number
  hashtags?: string[]
  mentions?: string[]
  priority?: 'low' | 'medium' | 'high' | 'urgent' | 'critical'
  visibility?: 'private' | 'team' | 'public'
  tags?: string[]
}

export interface PostStats {
  totalPosts: number
  scheduledPosts: number
  publishedPosts: number
  avgEngagementRate: number
}
