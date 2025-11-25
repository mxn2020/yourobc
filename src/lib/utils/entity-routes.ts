// src/lib/utils/entity-routes.ts
// Utility functions for constructing entity routes

import type { EntityType } from '@/convex/config'

/**
 * Entity type to plural route mapping
 * Maps entity type names to their pluralized route segments
 */
const ENTITY_ROUTE_PLURALS: Record<string, string> = {
  customer: 'customers',
  employee: 'employees',
  quote: 'quotes',
  partner: 'crmPartners',
  shipment: 'shipments',
  invoice: 'invoices',
  courier: 'couriers',
  commission: 'commissions',
  vacation: 'vacations',
  reminder: 'reminders',
  comment: 'comments',
  // Add more as needed
}

/**
 * Get the route path for a specific entity
 * @param entityType - The entity type (e.g., 'customer', 'employee')
 * @param entityId - The ID of the entity
 * @returns The route path (e.g., '/projects/customers/abc123')
 *
 * @example
 * getEntityRoute('customer', 'j123abc') // '/projects/customers/j123abc'
 * getEntityRoute('employee', 'k456def') // '/projects/employees/k456def'
 */
export function getEntityRoute(entityType: EntityType, entityId: string): string {
  // Get the pluralized form
  const pluralSegment = ENTITY_ROUTE_PLURALS[entityType] || `${entityType}s`

  // Determine the base path
  let basePath = '/projects'

  // Special handling for supporting entities (customize based on your app structure)
  if (['reminder', 'comment', 'wiki_entry'].includes(entityType)) {
    basePath = '/projects/supporting'
  }

  return `${basePath}/${pluralSegment}/${entityId}`
}

/**
 * Get the index route for an entity type
 * @param entityType - The entity type (e.g., 'customer', 'employee')
 * @returns The index route path (e.g., '/projects/customers')
 *
 * @example
 * getEntityIndexRoute('customer') // '/projects/customers'
 * getEntityIndexRoute('reminder') // '/projects/supporting/reminders'
 */
export function getEntityIndexRoute(entityType: EntityType): string {
  const pluralSegment = ENTITY_ROUTE_PLURALS[entityType] || `${entityType}s`

  let basePath = '/projects'
  if (['reminder', 'comment', 'wiki_entry'].includes(entityType)) {
    basePath = '/projects/supporting'
  }

  return `${basePath}/${pluralSegment}`
}

/**
 * Get the 'new' route for creating an entity
 * @param entityType - The entity type (e.g., 'customer', 'employee')
 * @param queryParams - Optional query parameters to append
 * @returns The create route path (e.g., '/projects/customers/new')
 *
 * @example
 * getEntityNewRoute('customer') // '/projects/customers/new'
 * getEntityNewRoute('reminder', { entityType: 'customer', entityId: '123' })
 * // '/projects/supporting/reminders/new?entityType=customer&entityId=123'
 */
export function getEntityNewRoute(
  entityType: EntityType,
  queryParams?: Record<string, string>
): string {
  const baseRoute = getEntityIndexRoute(entityType)
  const route = `${baseRoute}/new`

  if (queryParams && Object.keys(queryParams).length > 0) {
    const params = new URLSearchParams(queryParams)
    return `${route}?${params.toString()}`
  }

  return route
}

/**
 * Get a reminders route with filters
 * @param filters - Filter parameters (status, priority, entityType, entityId, etc.)
 * @returns The reminders route with query parameters
 *
 * @example
 * getRemindersRoute({ status: 'overdue' }) // '/projects/supporting/reminders?status=overdue'
 * getRemindersRoute({ entityType: 'customer', entityId: '123' })
 * // '/projects/supporting/reminders?entityType=customer&entityId=123'
 */
export function getRemindersRoute(filters?: {
  status?: string
  priority?: string
  type?: string
  entityType?: EntityType
  entityId?: string
  overdue?: boolean
}): string {
  const base = '/projects/supporting/reminders'

  if (!filters || Object.keys(filters).length === 0) {
    return base
  }

  const params = new URLSearchParams()
  if (filters.status) params.append('status', filters.status)
  if (filters.priority) params.append('priority', filters.priority)
  if (filters.type) params.append('type', filters.type)
  if (filters.entityType) params.append('entityType', filters.entityType)
  if (filters.entityId) params.append('entityId', filters.entityId)
  if (filters.overdue !== undefined) params.append('overdue', String(filters.overdue))

  return `${base}?${params.toString()}`
}
