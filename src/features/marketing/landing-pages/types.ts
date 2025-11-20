// src/features/marketing/landing-pages/types.ts

import type { Doc, Id } from '@/convex/_generated/dataModel'

export type LandingPage = Doc<'marketingLandingPages'>
export type LandingPageId = Id<'marketingLandingPages'>

export interface CreatePageData {
  title: string
  description?: string
  slug: string
  customDomain?: string
  template?: string
  priority?: 'low' | 'medium' | 'high' | 'urgent' | 'critical'
  visibility?: 'private' | 'team' | 'public'
  tags?: string[]
}

export interface UpdatePageData {
  title?: string
  description?: string
  slug?: string
  status?: string
  priority?: 'low' | 'medium' | 'high' | 'urgent' | 'critical'
  visibility?: 'private' | 'team' | 'public'
  sections?: PageSection[]
  tags?: string[]
}

export interface PageSection {
  id: string
  type: 'hero' | 'features' | 'testimonials' | 'pricing' | 'cta' | 'form' | 'custom'
  content: any
  order: number
}

export interface PageStats {
  totalPages: number
  publishedPages: number
  totalViews: number
  avgConversionRate: number
}
