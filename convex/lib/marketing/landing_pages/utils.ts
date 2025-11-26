// convex/lib/marketing/landing_pages/utils.ts

import { LANDING_PAGE_CONSTANTS } from './constants';
import type { MarketingLandingPage } from './types';

export function validateLandingPageData(data: Partial<MarketingLandingPage>): string[] {
  const errors: string[] = [];

  if (data.title !== undefined && !data.title.trim()) {
    errors.push('Title is required');
  }

  if (data.title && data.title.length > LANDING_PAGE_CONSTANTS.LIMITS.MAX_TITLE_LENGTH) {
    errors.push(`Title must be less than ${LANDING_PAGE_CONSTANTS.LIMITS.MAX_TITLE_LENGTH} characters`);
  }

  if (data.slug && data.slug.length > LANDING_PAGE_CONSTANTS.LIMITS.MAX_SLUG_LENGTH) {
    errors.push(`Slug must be less than ${LANDING_PAGE_CONSTANTS.LIMITS.MAX_SLUG_LENGTH} characters`);
  }

  if (data.sections && data.sections.length > LANDING_PAGE_CONSTANTS.LIMITS.MAX_SECTIONS) {
    errors.push(`Maximum ${LANDING_PAGE_CONSTANTS.LIMITS.MAX_SECTIONS} sections allowed`);
  }

  if (data.tags && data.tags.length > LANDING_PAGE_CONSTANTS.LIMITS.MAX_TAGS) {
    errors.push(`Maximum ${LANDING_PAGE_CONSTANTS.LIMITS.MAX_TAGS} tags allowed`);
  }

  return errors;
}

export function isPagePublished(page: MarketingLandingPage): boolean {
  return page.status === LANDING_PAGE_CONSTANTS.STATUS.PUBLISHED;
}

export function calculateConversionRate(page: MarketingLandingPage): number {
  if (!page.totalViews || page.totalViews === 0) return 0;
  const conversions = page.totalConversions || 0;
  return (conversions / page.totalViews) * 100;
}

export function getStatusColor(status: MarketingLandingPage['status']): string {
  const colors = {
    draft: '#6b7280',
    published: '#10b981',
    archived: '#6b7280',
    scheduled: '#3b82f6',
  };
  return colors[status] || colors.draft;
}
