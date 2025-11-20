// Base types and utilities for all feature packages
import type { Id } from '../../convex/_generated/dataModel'

// Base entity interface that all features extend
export interface BaseEntity {
  _id: Id<any>
  _creationTime: number
  createdBy?: Id<"userProfiles">
  updatedAt?: number
  updatedBy?: string
}

// Common filter interface
export interface BaseFilters {
  query?: string
  status?: string[]
  priority?: string[]
  dateRange?: {
    start?: number
    end?: number
  }
  limit?: number
  offset?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Common mutation result
export interface MutationResult<T = any> {
  success: boolean
  data?: T
  error?: string
}

// Common list response
export interface ListResponse<T> {
  items: T[]
  totalCount: number
  hasMore: boolean
}

// Base service interface
export interface BaseService<T extends BaseEntity> {
  list(filters?: BaseFilters): Promise<ListResponse<T>>
  get(id: string): Promise<T | null>
  create(data: Omit<T, keyof BaseEntity>): Promise<MutationResult<T>>
  update(id: string, data: Partial<T>): Promise<MutationResult<T>>
  delete(id: string): Promise<MutationResult<void>>
}

// Utility function to create standardized error responses
export const createError = (message: string, code?: string): MutationResult => ({
  success: false,
  error: message,
})

// Utility function to create standardized success responses
export const createSuccess = <T>(data?: T): MutationResult<T> => ({
  success: true,
  data,
})

// Common status constants
export const COMMON_STATUSES = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
  DELETED: 'deleted',
} as const

// Common priority levels
export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const