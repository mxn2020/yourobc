// src/features/yourobc/supporting/shared/constants.ts

/**
 * Shared constants for YourOBC supporting modules
 *
 * This file contains common constants used across multiple supporting modules.
 * SINGLE SOURCE OF TRUTH for entity type labels and related constants.
 */

import { SUPPORTING_ENTITY_TYPES, SupportingEntityType } from './types'

/**
 * Human-readable labels for entity types
 * Used in UI components across comments, reminders, and other supporting features
 *
 * This is the single source of truth for entity type labels.
 * Previously duplicated in comments/types and followup-reminders/types.
 */
export const ENTITY_TYPE_LABELS: Record<SupportingEntityType, string> = {
  [SUPPORTING_ENTITY_TYPES.CUSTOMER]: 'Customer',
  [SUPPORTING_ENTITY_TYPES.QUOTE]: 'Quote',
  [SUPPORTING_ENTITY_TYPES.SHIPMENT]: 'Shipment',
  [SUPPORTING_ENTITY_TYPES.INVOICE]: 'Invoice',
  [SUPPORTING_ENTITY_TYPES.PARTNER]: 'Partner',
  [SUPPORTING_ENTITY_TYPES.COURIER]: 'Courier',
  [SUPPORTING_ENTITY_TYPES.EMPLOYEE]: 'Employee',
} as const

/**
 * Get the display label for an entity type
 */
export function getEntityTypeLabel(entityType: SupportingEntityType): string {
  return ENTITY_TYPE_LABELS[entityType] || 'Unknown'
}

/**
 * Safely get the display label for any entity type string
 * Returns 'Unknown' if the entity type is not a supporting entity type
 */
export function getSafeEntityTypeLabel(entityType: string): string {
  const supportingTypes = Object.values(SUPPORTING_ENTITY_TYPES) as string[]
  if (supportingTypes.includes(entityType)) {
    return ENTITY_TYPE_LABELS[entityType as SupportingEntityType]
  }
  return 'Unknown'
}

/**
 * Get all entity types as an array
 */
export function getAllEntityTypes(): SupportingEntityType[] {
  return Object.values(SUPPORTING_ENTITY_TYPES)
}

/**
 * Get all entity type options for select dropdowns
 */
export function getEntityTypeOptions(): Array<{ value: SupportingEntityType; label: string }> {
  return getAllEntityTypes().map(type => ({
    value: type,
    label: ENTITY_TYPE_LABELS[type],
  }))
}
