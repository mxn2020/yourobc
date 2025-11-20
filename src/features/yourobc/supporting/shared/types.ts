// src/features/yourobc/supporting/shared/types.ts

/**
 * Shared types for YourOBC supporting modules
 *
 * This file contains common type definitions used across multiple supporting modules
 * including comments, follow-up reminders, and other features that need to reference entities.
 */

/**
 * Entity types supported across the YourOBC system
 * These represent the different types of records that can have comments, reminders, etc.
 */
export type SupportingEntityType =
  | 'yourobc_customer'
  | 'yourobc_quote'
  | 'yourobc_shipment'
  | 'yourobc_invoice'
  | 'yourobc_partner'
  | 'yourobc_courier'
  | 'yourobc_employee'

/**
 * Entity type constant values
 */
export const SUPPORTING_ENTITY_TYPES = {
  CUSTOMER: 'yourobc_customer' as const,
  QUOTE: 'yourobc_quote' as const,
  SHIPMENT: 'yourobc_shipment' as const,
  INVOICE: 'yourobc_invoice' as const,
  PARTNER: 'yourobc_partner' as const,
  COURIER: 'yourobc_courier' as const,
  EMPLOYEE: 'yourobc_employee' as const,
} as const

/**
 * Type guard to check if a string is a valid entity type
 */
export function isSupportingEntityType(value: string): value is SupportingEntityType {
  return Object.values(SUPPORTING_ENTITY_TYPES).includes(value as SupportingEntityType)
}
