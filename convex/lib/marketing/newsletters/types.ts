// convex/lib/marketing/newsletters/types.ts

import type { Doc, Id } from '@/generated/dataModel';

export type MarketingNewsletter = Doc<'marketingNewsletters'>;
export type MarketingNewsletterId = Id<'marketingNewsletters'>;
export type MarketingNewsletterCampaign = Doc<'marketingNewsletterCampaigns'>;
export type MarketingNewsletterSubscriber = Doc<'marketingNewsletterSubscribers'>;

export interface CreateNewsletterData {
  name: string;
  description?: string;
  fromName: string;
  fromEmail: string;
  replyToEmail?: string;
  tags?: string[];
}

export interface CreateCampaignData {
  newsletterId: Id<'marketingNewsletters'>;
  subject: string;
  content: { html: string; plainText?: string };
  scheduledAt?: number;
  tags?: string[];
}

export interface NewsletterStats {
  totalNewsletters: number;
  totalSubscribers: number;
  activeSubscribers: number;
  totalCampaigns: number;
  sentCampaigns: number;
}
