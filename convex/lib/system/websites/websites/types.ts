// convex/lib/boilerplate/websites/websites/types.ts
// TypeScript type definitions for websites module

import type { Doc, Id } from '@/generated/dataModel';
import type { WebsiteStatus, WebsiteVisibility, WebsitePriority } from '@/schema/boilerplate/websites/websites/types';

// Entity types
export type Website = Doc<'websites'>;
export type WebsiteId = Id<'websites'>;

// Data interfaces
export interface CreateWebsiteData {
  name: string;
  description?: string;
  domain?: string;
  subdomain?: string;
  priority?: WebsitePriority;
  visibility?: WebsiteVisibility;
  icon?: string;
  thumbnail?: string;
  tags?: string[];
  category?: string;
  themeId?: Id<'websiteThemes'>;
  customTheme?: Website['customTheme'];
  seo?: Website['seo'];
  settings?: Partial<Website['settings']>;
  navigation?: Website['navigation'];
  socialLinks?: Website['socialLinks'];
}

export interface UpdateWebsiteData {
  name?: string;
  description?: string;
  domain?: string;
  subdomain?: string;
  status?: WebsiteStatus;
  priority?: WebsitePriority;
  visibility?: WebsiteVisibility;
  icon?: string;
  thumbnail?: string;
  tags?: string[];
  category?: string;
  themeId?: Id<'websiteThemes'>;
  customTheme?: Website['customTheme'];
  seo?: Website['seo'];
  settings?: Partial<Website['settings']>;
  navigation?: Website['navigation'];
  socialLinks?: Website['socialLinks'];
}

// Response types
export interface WebsiteWithCollaborators extends Website {
  collaboratorDetails?: Array<{
    userId: Id<'userProfiles'>;
    role: string;
    permissions?: any;
    addedAt: number;
    name?: string;
    email?: string;
  }>;
}

export interface WebsiteListResponse {
  websites: Website[];
  total: number;
  hasMore: boolean;
}

// Filter types
export interface WebsiteFilters {
  status?: WebsiteStatus[];
  priority?: WebsitePriority[];
  visibility?: WebsiteVisibility[];
  category?: string;
  ownerId?: string;
  collaboratorId?: string;
  tags?: string[];
  search?: string;
}

export interface WebsitesListOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'lastActivityAt' | 'name' | 'priority';
  sortOrder?: 'asc' | 'desc';
  filters?: WebsiteFilters;
}

export interface WebsiteStats {
  totalWebsites: number;
  publishedWebsites: number;
  draftWebsites: number;
  archivedWebsites: number;
  maintenanceWebsites: number;
  websitesByStatus: {
    draft: number;
    published: number;
    archived: number;
    maintenance: number;
  };
  websitesByPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
    critical: number;
  };
  websitesByVisibility: {
    private: number;
    team: number;
    public: number;
  };
}
