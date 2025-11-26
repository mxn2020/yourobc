// convex/lib/marketing/link_shortener/types.ts
// TypeScript type definitions for link_shortener module

import type { Doc, Id } from '@/generated/dataModel';
import type { LinkShortenerStatus, LinkShortenerVisibility, LinkShortenerDevice } from '@/schema/marketing/link_shortener/types';

// Entity types
export type MarketingLink = Doc<'marketingLinks'>;
export type MarketingLinkId = Id<'marketingLinks'>;
export type MarketingLinkClick = Doc<'marketingLinkClicks'>;
export type MarketingLinkClickId = Id<'marketingLinkClicks'>;

// Data interfaces
export interface CreateMarketingLinkData {
  title: string;
  description?: string;
  originalUrl: string;
  shortCode?: string;
  customDomain?: string;
  status?: LinkShortenerStatus;
  visibility?: LinkShortenerVisibility;
  expiresAt?: number;
  maxClicks?: number;
  password?: string;
  isABTest?: boolean;
  variants?: Array<{
    url: string;
    weight: number;
  }>;
  tags?: string[];
}

export interface UpdateMarketingLinkData {
  title?: string;
  description?: string;
  status?: LinkShortenerStatus;
  visibility?: LinkShortenerVisibility;
  expiresAt?: number;
  maxClicks?: number;
  password?: string;
  tags?: string[];
}

// Response types
export interface LinkClickData {
  linkId: Id<'marketingLinks'>;
  ipAddress?: string;
  country?: string;
  city?: string;
  device?: LinkShortenerDevice;
  browser?: string;
  os?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  variantIndex?: number;
  visitorId?: string;
}

export interface LinkStats {
  totalLinks: number;
  activeLinks: number;
  totalClicks: number;
  uniqueClicks: number;
  byStatus: Record<string, number>;
  topLinks: Array<{
    linkId: Id<'marketingLinks'>;
    title: string;
    clicks: number;
  }>;
}

export interface MarketingLinkListResponse {
  items: MarketingLink[];
  total: number;
  hasMore: boolean;
}
