// convex/lib/marketing/link_shortener/utils.ts

import { LINK_SHORTENER_CONSTANTS } from './constants';
import type { MarketingLink } from './types';

export function validateMarketingLinkData(data: Partial<MarketingLink>): string[] {
  const errors: string[] = [];

  if (data.title !== undefined) {
    if (!data.title.trim()) {
      errors.push('Title is required');
    } else if (data.title.length > LINK_SHORTENER_CONSTANTS.LIMITS.MAX_TITLE_LENGTH) {
      errors.push(`Title must be less than ${LINK_SHORTENER_CONSTANTS.LIMITS.MAX_TITLE_LENGTH} characters`);
    }
  }

  if (data.description && data.description.length > LINK_SHORTENER_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH) {
    errors.push(`Description must be less than ${LINK_SHORTENER_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH} characters`);
  }

  if (data.originalUrl && data.originalUrl.length > LINK_SHORTENER_CONSTANTS.LIMITS.MAX_URL_LENGTH) {
    errors.push(`URL must be less than ${LINK_SHORTENER_CONSTANTS.LIMITS.MAX_URL_LENGTH} characters`);
  }

  if (data.tags && data.tags.length > LINK_SHORTENER_CONSTANTS.LIMITS.MAX_TAGS) {
    errors.push(`Maximum ${LINK_SHORTENER_CONSTANTS.LIMITS.MAX_TAGS} tags allowed`);
  }

  if (data.variants && data.variants.length > LINK_SHORTENER_CONSTANTS.LIMITS.MAX_VARIANTS) {
    errors.push(`Maximum ${LINK_SHORTENER_CONSTANTS.LIMITS.MAX_VARIANTS} A/B test variants allowed`);
  }

  return errors;
}

export function isLinkActive(link: MarketingLink): boolean {
  if (link.status !== LINK_SHORTENER_CONSTANTS.STATUS.ACTIVE) {
    return false;
  }

  if (link.expiresAt && link.expiresAt < Date.now()) {
    return false;
  }

  if (link.maxClicks && link.totalClicks && link.totalClicks >= link.maxClicks) {
    return false;
  }

  return true;
}

export function isLinkExpired(link: MarketingLink): boolean {
  if (link.expiresAt && link.expiresAt < Date.now()) {
    return true;
  }
  return false;
}

export function hasReachedMaxClicks(link: MarketingLink): boolean {
  if (link.maxClicks && link.totalClicks && link.totalClicks >= link.maxClicks) {
    return true;
  }
  return false;
}

export function getStatusColor(status: MarketingLink['status']): string {
  const colors = {
    active: '#10b981',
    paused: '#f59e0b',
    expired: '#6b7280',
    archived: '#6b7280',
  };
  return colors[status] || colors.active;
}

export function generateShortCode(length: number = 8): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export function calculateClickRate(link: MarketingLink): number {
  if (!link.totalClicks || link.totalClicks === 0) return 0;
  if (!link.uniqueClicks || link.uniqueClicks === 0) return 0;
  return (link.uniqueClicks / link.totalClicks) * 100;
}
