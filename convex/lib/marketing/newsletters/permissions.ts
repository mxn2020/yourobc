// convex/lib/marketing/newsletters/permissions.ts

import type { QueryCtx } from '@/generated/server';
import type { Doc } from '@/generated/dataModel';
import type { MarketingNewsletter, MarketingNewsletterCampaign } from './types';

export function canViewNewsletter(newsletter: MarketingNewsletter, user: Doc<'userProfiles'>): boolean {
  if (newsletter.ownerId === user._id) return true;
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  return false;
}

export function canEditNewsletter(newsletter: MarketingNewsletter, user: Doc<'userProfiles'>): boolean {
  if (newsletter.ownerId === user._id) return true;
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  return false;
}

export function canDeleteNewsletter(newsletter: MarketingNewsletter, user: Doc<'userProfiles'>): boolean {
  if (newsletter.ownerId === user._id) return true;
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  return false;
}

export function canViewCampaign(campaign: MarketingNewsletterCampaign, user: Doc<'userProfiles'>): boolean {
  if (campaign.ownerId === user._id) return true;
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  return false;
}

export function canEditCampaign(campaign: MarketingNewsletterCampaign, user: Doc<'userProfiles'>): boolean {
  if (campaign.ownerId === user._id) return true;
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  return false;
}

export function canDeleteCampaign(campaign: MarketingNewsletterCampaign, user: Doc<'userProfiles'>): boolean {
  if (campaign.ownerId === user._id) return true;
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  return false;
}

export async function requireViewAccessNewsletter(ctx: QueryCtx, newsletter: MarketingNewsletter, user: Doc<'userProfiles'>): Promise<void> {
  if (!canViewNewsletter(newsletter, user)) {
    throw new Error('Permission denied: You do not have access to view this newsletter');
  }
}

export async function requireEditAccessNewsletter(ctx: QueryCtx, newsletter: MarketingNewsletter, user: Doc<'userProfiles'>): Promise<void> {
  if (!canEditNewsletter(newsletter, user)) {
    throw new Error('Permission denied: You do not have access to edit this newsletter');
  }
}

export function requireDeleteAccessNewsletter(newsletter: MarketingNewsletter, user: Doc<'userProfiles'>): void {
  if (!canDeleteNewsletter(newsletter, user)) {
    throw new Error('Permission denied: You do not have access to delete this newsletter');
  }
}

export async function requireViewAccessCampaign(ctx: QueryCtx, campaign: MarketingNewsletterCampaign, user: Doc<'userProfiles'>): Promise<void> {
  if (!canViewCampaign(campaign, user)) {
    throw new Error('Permission denied: You do not have access to view this campaign');
  }
}

export async function requireEditAccessCampaign(ctx: QueryCtx, campaign: MarketingNewsletterCampaign, user: Doc<'userProfiles'>): Promise<void> {
  if (!canEditCampaign(campaign, user)) {
    throw new Error('Permission denied: You do not have access to edit this campaign');
  }
}

export function requireDeleteAccessCampaign(campaign: MarketingNewsletterCampaign, user: Doc<'userProfiles'>): void {
  if (!canDeleteCampaign(campaign, user)) {
    throw new Error('Permission denied: You do not have access to delete this campaign');
  }
}
