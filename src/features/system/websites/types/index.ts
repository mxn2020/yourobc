// src/features/system/websites/types/index.ts

import type { Doc, Id } from '@/convex/_generated/dataModel'

export type Website = Doc<'websites'>
export type WebsiteId = Id<'websites'>
export type WebsitePage = Doc<'websitePages'>
export type WebsitePageId = Id<'websitePages'>
export type WebsiteSection = Doc<'websiteSections'>
export type WebsiteSectionId = Id<'websiteSections'>
export type WebsiteTheme = Doc<'websiteThemes'>
export type WebsiteThemeId = Id<'websiteThemes'>
export type WebsiteTemplate = Doc<'websiteTemplates'>
export type WebsiteTemplateId = Id<'websiteTemplates'>
export type WebsiteCollaborator = Doc<'websiteCollaborators'>

export interface CreateWebsiteData {
  name: string
  description?: string
  domain?: string
  subdomain?: string
  visibility?: Website['visibility']
  themeId?: WebsiteThemeId
  customTheme?: Website['customTheme']
  seo?: Website['seo']
  settings?: Partial<Website['settings']>
  navigation?: Website['navigation']
  socialLinks?: Website['socialLinks']
}

export interface UpdateWebsiteData {
  name?: string
  description?: string
  domain?: string
  subdomain?: string
  status?: Website['status']
  visibility?: Website['visibility']
  themeId?: WebsiteThemeId
  customTheme?: Website['customTheme']
  seo?: Website['seo']
  settings?: Partial<Website['settings']>
  navigation?: Website['navigation']
  socialLinks?: Website['socialLinks']
}

export interface CreatePageData {
  websiteId: WebsiteId
  title: string
  slug?: string
  path?: string
  content?: string
  excerpt?: string
  templateType: WebsitePage['templateType']
  layout: WebsitePage['layout']
  parentPageId?: WebsitePageId
  sections?: WebsitePage['sections']
  seo?: WebsitePage['seo']
  featuredImage?: WebsitePage['featuredImage']
  settings?: Partial<WebsitePage['settings']>
}

export interface UpdatePageData {
  title?: string
  slug?: string
  path?: string
  content?: string
  excerpt?: string
  status?: WebsitePage['status']
  templateType?: WebsitePage['templateType']
  layout?: WebsitePage['layout']
  parentPageId?: WebsitePageId
  sections?: WebsitePage['sections']
  seo?: WebsitePage['seo']
  featuredImage?: WebsitePage['featuredImage']
  publishedAt?: number
  scheduledAt?: number
  settings?: Partial<WebsitePage['settings']>
}

export interface WebsiteFilters {
  status?: Website['status'][]
  visibility?: Website['visibility'][]
  ownerId?: string
  collaboratorId?: string
  search?: string
}

export interface PageFilters {
  websiteId?: WebsiteId
  status?: WebsitePage['status'][]
  templateType?: WebsitePage['templateType'][]
  parentPageId?: WebsitePageId
  search?: string
}

export interface WebsitesListOptions {
  limit?: number
  offset?: number
  sortBy?: 'createdAt' | 'updatedAt' | 'lastActivityAt' | 'name'
  sortOrder?: 'asc' | 'desc'
  filters?: WebsiteFilters
}

export interface PagesListOptions {
  limit?: number
  offset?: number
  sortBy?: 'createdAt' | 'updatedAt' | 'lastActivityAt' | 'title' | 'publishedAt'
  sortOrder?: 'asc' | 'desc'
  filters?: PageFilters
}

export interface WebsiteStats {
  totalWebsites: number
  publishedWebsites: number
  draftWebsites: number
  archivedWebsites?: number
  totalPages: number
  publishedPages: number
  totalSections: number
  totalThemes: number
  totalTemplates: number
  websitesByStatus: {
    draft: number
    published: number
    archived: number
    maintenance: number
  }
}
