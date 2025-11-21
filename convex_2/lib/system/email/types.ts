// convex/lib/system/email/types.ts
// convex/lib/email/types.ts

import type { Doc, Id } from '@/generated/dataModel'

// Core types from database
export type EmailConfig = Doc<'emailConfigs'>
export type EmailConfigId = Id<'emailConfigs'>
export type EmailLog = Doc<'emailLogs'>
export type EmailLogId = Id<'emailLogs'>
export type EmailTemplate = Doc<'emailTemplates'>
export type EmailTemplateId = Id<'emailTemplates'>

// Provider types
export type EmailProvider = 'resend' | 'sendgrid' | 'ses' | 'postmark' | 'mailgun'
export type EmailStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced'

// Create operation inputs
export interface CreateEmailConfigData {
  provider: EmailProvider
  config: {
    apiKey?: string
    apiSecret?: string
    domain?: string
    region?: string
    fromEmail: string
    fromName: string
    replyToEmail?: string
    additionalSettings?: any
  }
  setAsActive?: boolean
}

export interface CreateEmailTemplateData {
  name: string
  slug: string
  description?: string
  subject: string
  htmlTemplate: string
  textTemplate?: string
  reactComponentPath?: string
  variables: Array<{
    name: string
    type: 'string' | 'number' | 'boolean' | 'date'
    required: boolean
    defaultValue?: string
    description?: string
  }>
  previewData?: any
  isActive: boolean
  category?: string
}

// Update operation inputs
export interface UpdateEmailConfigData {
  config?: EmailConfig['config']
  isActive?: boolean
  isVerified?: boolean
}

export interface UpdateEmailTemplateData {
  name?: string
  description?: string
  subject?: string
  htmlTemplate?: string
  textTemplate?: string
  reactComponentPath?: string
  variables?: EmailTemplate['variables']
  previewData?: any
  isActive?: boolean
  category?: string
}

// Query filters
export interface EmailLogFilters {
  status?: EmailStatus[]
  provider?: EmailProvider[]
  context?: string
  search?: string
  startDate?: number
  endDate?: number
}

export interface EmailTemplateFilters {
  category?: string
  isActive?: boolean
  search?: string
}

// List options
export interface EmailLogListOptions {
  limit?: number
  offset?: number
  sortBy?: 'createdAt' | 'sentAt'
  sortOrder?: 'asc' | 'desc'
  filters?: EmailLogFilters
}

export interface EmailTemplateListOptions {
  limit?: number
  offset?: number
  sortBy?: 'createdAt' | 'lastUsedAt' | 'timesUsed'
  sortOrder?: 'asc' | 'desc'
  filters?: EmailTemplateFilters
}

// Statistics
export interface EmailStats {
  total: number
  sent: number
  delivered: number
  failed: number
  bounced: number
  pending: number
  byProvider: Record<string, number>
  byContext: Record<string, number>
}

export interface TemplateStats {
  total: number
  active: number
  inactive: number
  byCategory: Record<string, number>
}

// Test connection result
export interface TestConnectionResult {
  success: boolean
  message: string
  error?: string
  provider: EmailProvider
}
