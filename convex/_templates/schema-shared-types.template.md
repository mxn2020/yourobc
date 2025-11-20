// convex/lib/addons/[addon_name]/shared/types.ts

/**
 * ============================================================================
 * SHARED TYPES TEMPLATE
 * ============================================================================
 *
 * This file contains TypeScript types and interfaces that are shared across
 * all modules within the addon. Use this for common structures that multiple
 * entities need.
 *
 * USAGE:
 * 1. Copy to: convex/lib/addons/[addon_name]/shared/types.ts
 * 2. Define common types used across multiple modules
 * 3. Import in individual module types files
 * 4. Keep types generic and reusable
 *
 * WHEN TO USE SHARED TYPES:
 * - Pagination response structures
 * - Common filter/query structures
 * - Shared nested object types
 * - Standard API response formats
 * - Common enum/status types
 *
 * WHEN NOT TO USE:
 * - Entity-specific types (use module's types.ts)
 * - Module-specific DTOs (use module's types.ts)
 * - Domain-specific structures (use module's types.ts)
 *
 * REQUIRED: All entities must have a main display field (name/title/displayName)
 * for auditLogs and UI display. See schema-patterns.template.md for details.
 *
 * ============================================================================
 */

import type { Id } from '@/generated/dataModel'

// ============================================================================
// PAGINATION TYPES
// ============================================================================

/**
 * Standard pagination parameters
 */
export interface PaginationParams {
  limit?: number
  offset?: number
}

/**
 * Extended pagination with cursor support
 */
export interface CursorPaginationParams {
  limit?: number
  cursor?: string
}

/**
 * Standard paginated list response
 *
 * Used by all list queries for consistent pagination
 */
export interface ListResult<T> {
  items: T[]
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

/**
 * Cursor-based paginated response
 */
export interface CursorListResult<T> {
  items: T[]
  nextCursor?: string
  hasMore: boolean
}

// ============================================================================
// SORTING TYPES
// ============================================================================

/**
 * Sort order type
 */
export type SortOrder = 'asc' | 'desc'

/**
 * Generic sort parameters
 */
export interface SortParams<T extends string = string> {
  sortBy: T
  sortOrder: SortOrder
}

// ============================================================================
// FILTER TYPES
// ============================================================================

/**
 * Common filter options
 */
export interface BaseFilters {
  status?: string[]
  tags?: string[]
  category?: string
  search?: string
  createdAfter?: number
  createdBefore?: number
  updatedAfter?: number
  updatedBefore?: number
}

/**
 * Query options combining filters, pagination, and sorting
 */
export interface QueryOptions<TFilters = BaseFilters, TSortBy extends string = string> {
  limit?: number
  offset?: number
  sortBy?: TSortBy
  sortOrder?: SortOrder
  filters?: TFilters
}

// ============================================================================
// AUDIT/TIMESTAMP TYPES
// ============================================================================

/**
 * Standard timestamp fields
 */
export interface Timestamps {
  createdAt: number
  updatedAt: number
  createdBy: Id<'userProfiles'>
  updatedBy?: Id<'userProfiles'>
}

/**
 * Soft delete fields
 */
export interface SoftDelete {
  deletedAt?: number
  deletedBy?: string
}

/**
 * Complete audit trail
 */
export interface AuditFields extends Timestamps, SoftDelete {
  version?: number
}

/**
 * Publication tracking fields
 */
export interface PublicationFields {
  publishedAt?: number
  publishedBy?: string
}

/**
 * Archive tracking fields
 */
export interface ArchiveFields {
  archivedAt?: number
  archivedBy?: string
}

// ============================================================================
// OWNERSHIP TYPES
// ============================================================================

/**
 * Ownership fields
 */
export interface Ownership {
  ownerId: string
  collaborators?: string[]
}

/**
 * Visibility settings
 */
export type Visibility = 'public' | 'private' | 'shared' | 'organization'

/**
 * Entity with visibility
 */
export interface VisibilitySettings {
  visibility: Visibility
}

// ============================================================================
// METADATA TYPES
// ============================================================================

/**
 * Generic metadata container
 */
export interface Metadata {
  tags?: string[]
  category?: string
  description?: string
  customFields?: Record<string, any>
}

/**
 * Extended metadata with organization
 */
export interface ExtendedMetadata extends Metadata {
  organizationId?: string
  departmentId?: string
  projectId?: string
}

// ============================================================================
// ADDRESS TYPES
// ============================================================================

/**
 * Standard address format
 */
export interface Address {
  street: string
  street2?: string
  city: string
  state?: string
  postalCode: string
  country: string
  countryCode: string
}

/**
 * Coordinates/location
 */
export interface Coordinates {
  latitude: number
  longitude: number
}

/**
 * Full location with address and coordinates
 */
export interface Location extends Address {
  coordinates?: Coordinates
}

// ============================================================================
// CONTACT TYPES
// ============================================================================

/**
 * Contact information
 */
export interface ContactInfo {
  email?: string
  phone?: string
  mobile?: string
  fax?: string
  website?: string
}

/**
 * Full contact with address
 */
export interface FullContact extends ContactInfo {
  name: string
  address?: Address
  isPrimary?: boolean
}

// ============================================================================
// MONETARY TYPES
// ============================================================================

/**
 * Currency codes
 */
export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'CNY'

/**
 * Money/price with currency
 */
export interface Money {
  amount: number
  currency: Currency
}

/**
 * Price with optional discount
 */
export interface Price extends Money {
  originalAmount?: number
  discountPercent?: number
  taxAmount?: number
}

// ============================================================================
// FILE/ATTACHMENT TYPES
// ============================================================================

/**
 * File attachment
 */
export interface Attachment {
  id: string
  name: string
  url: string
  mimeType: string
  size: number
  uploadedAt: number
  uploadedBy: string
}

/**
 * Image with dimensions
 */
export interface Image extends Omit<Attachment, 'mimeType'> {
  width: number
  height: number
  altText?: string
  thumbnailUrl?: string
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

/**
 * Validation error for a specific field
 */
export interface FieldError {
  field: string
  message: string
  code: string
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean
  errors: FieldError[]
  warnings?: FieldError[]
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Standard success response
 */
export interface SuccessResponse<T = any> {
  success: true
  data: T
  message?: string
}

/**
 * Standard error response
 */
export interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: any
  }
}

/**
 * Combined response type
 */
export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse

// ============================================================================
// STATISTICS TYPES
// ============================================================================

/**
 * Time-series data point
 */
export interface DataPoint {
  timestamp: number
  value: number
  label?: string
}

/**
 * Statistical summary
 */
export interface Stats {
  total: number
  average: number
  min: number
  max: number
  median?: number
}

/**
 * Count by category
 */
export interface CategoryCount {
  category: string
  count: number
  percentage?: number
}

// ============================================================================
// ACTIVITY/HISTORY TYPES
// ============================================================================

/**
 * Activity action type
 */
export type ActivityAction =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'archived'
  | 'restored'
  | 'published'
  | 'unpublished'
  | 'assigned'
  | 'unassigned'
  | 'commented'
  | 'shared'

/**
 * Activity record
 */
export interface Activity {
  id: string
  userId: string
  userName?: string
  action: ActivityAction
  entityType: string
  entityId: string
  entityName?: string
  description: string
  metadata?: Record<string, any>
  createdAt: number
}

/**
 * Change history record
 */
export interface ChangeHistory {
  id: string
  userId: string
  changedFields: string[]
  previousValues: Record<string, any>
  newValues: Record<string, any>
  timestamp: number
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

/**
 * Notification type
 */
export type NotificationType = 'info' | 'success' | 'warning' | 'error'

/**
 * Notification record
 */
export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  actionUrl?: string
  metadata?: Record<string, any>
  createdAt: number
  expiresAt?: number
}

// ============================================================================
// PERMISSION TYPES
// ============================================================================

/**
 * Permission level
 */
export type PermissionLevel = 'none' | 'read' | 'write' | 'admin' | 'owner'

/**
 * User permission
 */
export interface UserPermission {
  userId: string
  level: PermissionLevel
  grantedAt: number
  grantedBy: string
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Make all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * Make specific properties required
 */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>

/**
 * Make specific properties optional
 */
export type PartialFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/**
 * Extract ID type from table name
 */
export type IdType<TableName extends string> = Id<TableName>

/**
 * Array element type
 */
export type ArrayElement<T> = T extends (infer U)[] ? U : never

// ============================================================================
// CUSTOM SHARED TYPES
// ============================================================================

/**
 * Add your addon-specific shared types here
 *
 * Examples:
 * - Custom response formats
 * - Domain-specific structures
 * - Integration types
 * - Configuration types
 */
