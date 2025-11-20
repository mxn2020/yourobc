// convex/lib/boilerplate/websites/types.ts

import type { Doc, Id } from '@/generated/dataModel'

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
  priority?: Website['priority']
  visibility?: Website['visibility']
  icon?: string
  thumbnail?: string
  tags?: string[]
  category?: string
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
  priority?: Website['priority']
  visibility?: Website['visibility']
  icon?: string
  thumbnail?: string
  tags?: string[]
  category?: string
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
  slug: string
  path: string
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

export interface CreateSectionData {
  websiteId: WebsiteId
  name: string
  description?: string
  type: WebsiteSection['type']
  blocks: WebsiteSection['blocks']
  layout?: WebsiteSection['layout']
  settings?: WebsiteSection['settings']
  isTemplate?: boolean
  isGlobal?: boolean
}

export interface UpdateSectionData {
  name?: string
  description?: string
  type?: WebsiteSection['type']
  blocks?: WebsiteSection['blocks']
  layout?: WebsiteSection['layout']
  settings?: WebsiteSection['settings']
  isTemplate?: boolean
  isGlobal?: boolean
}

export interface CreateThemeData {
  name: string
  description?: string
  type: WebsiteTheme['type']
  thumbnail?: string
  config: WebsiteTheme['config']
  customCss?: string
  isPublic?: boolean
}

export interface UpdateThemeData {
  name?: string
  description?: string
  type?: WebsiteTheme['type']
  thumbnail?: string
  config?: WebsiteTheme['config']
  customCss?: string
  isPublic?: boolean
}

export interface CreateTemplateData {
  name: string
  description?: string
  category: WebsiteTemplate['category']
  thumbnail?: string
  preview?: string
  config: WebsiteTemplate['config']
  tags?: string[]
  isPublic?: boolean
}

export interface UpdateTemplateData {
  name?: string
  description?: string
  category?: WebsiteTemplate['category']
  thumbnail?: string
  preview?: string
  config?: WebsiteTemplate['config']
  tags?: string[]
  isPublic?: boolean
}

export interface WebsiteFilters {
  status?: Website['status'][]
  priority?: Website['priority'][]
  visibility?: Website['visibility'][]
  category?: string
  ownerId?: string
  collaboratorId?: string
  tags?: string[]
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
  sortBy?: 'createdAt' | 'updatedAt' | 'lastActivityAt' | 'name' | 'priority'
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
  websitesByPriority: {
    low: number
    medium: number
    high: number
    urgent: number
    critical: number
  }
  websitesByCategory: Record<string, number>
}

export interface PageWithSections extends WebsitePage {
  populatedSections?: WebsiteSection[]
}

export interface WebsiteWithPages extends Website {
  pages?: WebsitePage[]
}

export interface WebsiteWithTheme extends Website {
  theme?: WebsiteTheme
}
