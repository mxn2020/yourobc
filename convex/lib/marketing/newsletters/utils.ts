// convex/lib/marketing/newsletters/utils.ts

import { NEWSLETTER_CONSTANTS } from './constants';
import type { MarketingNewsletter, MarketingNewsletterCampaign } from './types';

export function validateNewsletterData(data: Partial<MarketingNewsletter>): string[] {
  const errors: string[] = [];

  if (data.title !== undefined && !data.title.trim()) {
    errors.push('Name is required');
  }

  if (data.title && data.title.length > NEWSLETTER_CONSTANTS.LIMITS.MAX_TITLE_LENGTH) {
    errors.push(`Name must be less than ${NEWSLETTER_CONSTANTS.LIMITS.MAX_TITLE_LENGTH} characters`);
  }

  if (data.fromName !== undefined && !data.fromName.trim()) {
    errors.push('From name is required');
  }

  if (data.fromEmail !== undefined && !data.fromEmail.trim()) {
    errors.push('From email is required');
  }

  if (data.tags && data.tags.length > NEWSLETTER_CONSTANTS.LIMITS.MAX_TAGS) {
    errors.push(`Maximum ${NEWSLETTER_CONSTANTS.LIMITS.MAX_TAGS} tags allowed`);
  }

  return errors;
}

export function validateCampaignData(data: Partial<MarketingNewsletterCampaign>): string[] {
  const errors: string[] = [];

  if (data.subject !== undefined && !data.subject.trim()) {
    errors.push('Subject is required');
  }

  if (data.subject && data.subject.length > NEWSLETTER_CONSTANTS.LIMITS.MAX_SUBJECT_LENGTH) {
    errors.push(`Subject must be less than ${NEWSLETTER_CONSTANTS.LIMITS.MAX_SUBJECT_LENGTH} characters`);
  }

  return errors;
}

export function isCampaignSent(campaign: MarketingNewsletterCampaign): boolean {
  return campaign.status === NEWSLETTER_CONSTANTS.STATUS.SENT;
}

export function calculateOpenRate(campaign: MarketingNewsletterCampaign): number {
  if (!campaign.delivered || campaign.delivered === 0) return 0;
  const opened = campaign.opened || 0;
  return (opened / campaign.delivered) * 100;
}

export function calculateClickRate(campaign: MarketingNewsletterCampaign): number {
  if (!campaign.delivered || campaign.delivered === 0) return 0;
  const clicked = campaign.clicked || 0;
  return (clicked / campaign.delivered) * 100;
}

export function getStatusColor(status: MarketingNewsletterCampaign['status']): string {
  const colors = {
    draft: '#6b7280',
    scheduled: '#3b82f6',
    sending: '#f59e0b',
    sent: '#10b981',
    failed: '#ef4444',
    archived: '#6b7280',
  };
  return colors[status] || colors.draft;
}
