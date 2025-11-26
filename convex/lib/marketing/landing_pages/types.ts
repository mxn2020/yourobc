// convex/lib/marketing/landing_pages/types.ts

import type { Doc, Id } from '@/generated/dataModel';

export type MarketingLandingPage = Doc<'marketingLandingPages'>;
export type MarketingLandingPageId = Id<'marketingLandingPages'>;
export type MarketingPageVariant = Doc<'marketingPageVariants'>;

export interface CreateLandingPageData {
  title: string;
  description?: string;
  slug: string;
  customDomain?: string;
  template?: string;
  tags?: string[];
}

export interface UpdateLandingPageData {
  title?: string;
  description?: string;
  slug?: string;
  status?: string;
  tags?: string[];
}

export interface LandingPageStats {
  totalPages: number;
  publishedPages: number;
  totalViews: number;
  totalConversions: number;
  byStatus: Record<string, number>;
}
