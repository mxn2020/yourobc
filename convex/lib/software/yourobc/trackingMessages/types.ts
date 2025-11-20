// convex/lib/software/yourobc/trackingMessages/types.ts
/**
 * Tracking Messages Library Types
 *
 * TypeScript types and interfaces for tracking messages business logic.
 * Extends schema types with additional runtime and API types.
 *
 * @module convex/lib/software/yourobc/trackingMessages/types
 */

import { Doc, Id } from '../../../../_generated/dataModel'

// ============================================================================
// Document Types
// ============================================================================

/**
 * Tracking message document type
 */
export type TrackingMessage = Doc<'trackingMessages'>

/**
 * Tracking message ID type
 */
export type TrackingMessageId = Id<'trackingMessages'>

// ============================================================================
// Create/Update Types
// ============================================================================

/**
 * Fields required to create a new tracking message
 */
export interface CreateTrackingMessageInput {
  name: string
  description?: string
  icon?: string
  thumbnail?: string
  serviceType: string
  status: string
  language: string
  subject?: string
  template: string
  variables?: string[]
  isActive?: boolean
  tags?: string[]
  category?: string
  customFields?: Record<string, any>
  useCase?: string
  difficulty?: string
  visibility?: string
  isOfficial?: boolean
}

/**
 * Fields that can be updated on an existing tracking message
 */
export interface UpdateTrackingMessageInput {
  name?: string
  description?: string
  icon?: string
  thumbnail?: string
  serviceType?: string
  status?: string
  language?: string
  subject?: string
  template?: string
  variables?: string[]
  isActive?: boolean
  tags?: string[]
  category?: string
  customFields?: Record<string, any>
  useCase?: string
  difficulty?: string
  visibility?: string
  isOfficial?: boolean
}

// ============================================================================
// Query Types
// ============================================================================

/**
 * Filter options for tracking message queries
 */
export interface TrackingMessageFilters {
  serviceType?: string
  status?: string
  language?: string
  isActive?: boolean
  isOfficial?: boolean
  category?: string
  ownerId?: string
  includeDeleted?: boolean
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  limit?: number
  cursor?: string
}

/**
 * Search options for tracking messages
 */
export interface SearchTrackingMessagesOptions extends TrackingMessageFilters {
  searchTerm?: string
  sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'usageCount'
  sortOrder?: 'asc' | 'desc'
  pagination?: PaginationOptions
}

// ============================================================================
// Template Processing Types
// ============================================================================

/**
 * Variable substitution data for template rendering
 */
export interface TemplateVariableData {
  [key: string]: string | number | boolean | null | undefined
}

/**
 * Rendered template result
 */
export interface RenderedTemplate {
  subject?: string
  body: string
  missingVariables: string[]
}

// ============================================================================
// Statistics Types
// ============================================================================

/**
 * Usage statistics for a tracking message template
 */
export interface TrackingMessageStats {
  usageCount: number
  rating?: number
  ratingCount?: number
  lastUsedAt?: number
}

// ============================================================================
// Permission Types
// ============================================================================

/**
 * Permission check result
 */
export interface PermissionCheckResult {
  allowed: boolean
  reason?: string
}

/**
 * Permission context for authorization checks
 */
export interface PermissionContext {
  userId: string
  trackingMessage?: TrackingMessage
  action: 'read' | 'create' | 'update' | 'delete'
}
