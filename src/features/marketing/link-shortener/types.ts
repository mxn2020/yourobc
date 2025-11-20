// src/features/marketing/link-shortener/types.ts

import type { Doc, Id } from '@/convex/_generated/dataModel'

export type MarketingLink = Doc<'marketingLinks'>
export type MarketingLinkClick = Doc<'marketingLinkClicks'>
export type MarketingLinkId = Id<'marketingLinks'>

export interface CreateLinkData {
  title: string
  description?: string
  originalUrl: string
  shortCode?: string
  customDomain?: string
  priority?: 'low' | 'medium' | 'high' | 'urgent' | 'critical'
  visibility?: 'private' | 'team' | 'public'
  expiresAt?: number
  maxClicks?: number
  password?: string
  isABTest?: boolean
  tags?: string[]
}

export interface UpdateLinkData {
  title?: string
  description?: string
  status?: string
  priority?: 'low' | 'medium' | 'high' | 'urgent' | 'critical'
  visibility?: 'private' | 'team' | 'public'
  expiresAt?: number
  maxClicks?: number
  password?: string
  tags?: string[]
}

export interface LinkAnalytics {
  totalClicks: number
  uniqueClicks: number
  clicksByDate: Array<{ date: string; clicks: number }>
  clicksByCountry: Array<{ country: string; clicks: number }>
  clicksByDevice: Array<{ device: string; clicks: number }>
  clicksByBrowser: Array<{ browser: string; clicks: number }>
  clicksByReferrer: Array<{ referrer: string; clicks: number }>
}

export interface LinkStats {
  totalLinks: number
  activeLinks: number
  totalClicks: number
  avgClicksPerLink: number
}
