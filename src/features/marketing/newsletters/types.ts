// src/features/marketing/newsletters/types.ts

import type { Doc, Id } from '@/convex/_generated/dataModel'

export type Newsletter = Doc<'marketingNewsletters'>
export type NewsletterId = Id<'marketingNewsletters'>
export type Campaign = Doc<'marketingNewsletterCampaigns'>
export type CampaignId = Id<'marketingNewsletterCampaigns'>

export interface CreateNewsletterData {
  title: string
  description?: string
  fromName: string
  fromEmail: string
  replyToEmail?: string
  priority?: 'low' | 'medium' | 'high' | 'urgent' | 'critical'
  visibility?: 'private' | 'team' | 'public'
  tags?: string[]
}

export interface NewsletterStats {
  totalNewsletters: number
  activeNewsletters: number
  totalSubscribers: number
  avgOpenRate: number
}
