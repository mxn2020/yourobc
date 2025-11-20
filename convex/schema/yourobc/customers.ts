// convex/schema/yourobc/customers.ts
/**
 * YourOBC Customer Schema
 *
 * Defines schemas for customer management and tracking
 * Follows the single source of truth pattern using validators from base.ts.
 *
 * @module convex/schema/yourobc/customers
 */

import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import {
  customerStatusValidator,
  currencyValidator,
  paymentMethodValidator,
  addressSchema,
  contactSchema,
  entityStatsSchema,
  metadataSchema,
  auditFields,
  softDeleteFields,
} from './base'

// ============================================================================
// Customers Table
// ============================================================================

/**
 * Customer management table
 * Tracks customer information, contact details, and financial settings
 */
export const customersTable = defineTable({
  // Core Identity
  companyName: v.string(),
  shortName: v.optional(v.string()),
  website: v.optional(v.string()),

  // Contact Information
  primaryContact: contactSchema,
  additionalContacts: v.array(contactSchema),

  // Address Information
  billingAddress: addressSchema,
  shippingAddress: v.optional(addressSchema),

  // Financial Settings
  defaultCurrency: currencyValidator,
  paymentTerms: v.number(),
  paymentMethod: paymentMethodValidator,
  margin: v.number(),

  // Status & Classification
  status: customerStatusValidator,
  inquirySourceId: v.optional(v.id('yourobcInquirySources')),

  // Service Suspension Tracking
  serviceSuspended: v.optional(v.boolean()), // Whether service is currently suspended
  serviceSuspendedDate: v.optional(v.number()), // When service was suspended
  serviceSuspendedReason: v.optional(v.string()), // Reason for suspension
  serviceReactivatedDate: v.optional(v.number()), // When service was reactivated

  // Statistics
  stats: entityStatsSchema,

  // Notes
  notes: v.optional(v.string()),
  internalNotes: v.optional(v.string()),

  // Metadata and audit fields
  ...metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_companyName', ['companyName'])
  .index('by_status', ['status'])
  .index('by_country', ['billingAddress.country'])
  .index('by_inquirySource', ['inquirySourceId'])
  .index('by_created', ['createdAt'])
  .index('by_deleted', ['deletedAt'])

// ============================================================================
// USAGE NOTES
// ============================================================================

/**
 * Schema design follows the single source of truth pattern.
 *
 * ✅ DO:
 * - Import validators from base.ts (customerStatusValidator, currencyValidator, etc.)
 * - Import reusable schemas from base.ts (addressSchema, contactSchema, auditFields, etc.)
 * - Use imported validators in table definitions
 * - Add indexes for frequently queried fields
 * - Use spread operator for metadata/audit fields: ...metadataSchema, ...auditFields, ...softDeleteFields
 *
 * ❌ DON'T:
 * - Define inline v.union() validators in table definitions
 * - Duplicate validator definitions across tables
 * - Forget to add indexes for query patterns
 * - Redefine audit, metadata, or reusable schema fields manually
 *
 * CUSTOMIZATION GUIDE:
 *
 * 1. Core Identity:
 *    - companyName: Full legal company name (required)
 *    - shortName: Display name or abbreviation
 *    - website: Company website URL
 *
 * 2. Contact Information:
 *    - primaryContact: Uses contactSchema from base.ts (name, email, phone, role)
 *    - additionalContacts: Array of contact persons using contactSchema
 *    - tags: Flexible tagging system for categorization
 *
 * 3. Address Information:
 *    - billingAddress: Uses addressSchema from base.ts (required)
 *    - shippingAddress: Optional separate shipping address
 *    - Both use standardized address format (street, city, postalCode, country, countryCode)
 *
 * 4. Financial Settings:
 *    - defaultCurrency: EUR or USD (uses currencyValidator)
 *    - paymentTerms: Number of days for payment (e.g., 30 for Net 30)
 *    - paymentMethod: Preferred payment method (uses paymentMethodValidator)
 *    - margin: Default margin percentage for this customer
 *
 * 5. Status & Classification:
 *    - status: Active, inactive, or blacklisted (uses customerStatusValidator)
 *    - inquirySourceId: Link to inquiry source (website, referral, etc.)
 *
 * 6. Statistics:
 *    - stats: Uses entityStatsSchema from base.ts
 *    - Tracks totalQuotes, acceptedQuotes, totalRevenue
 *    - Includes lastQuoteDate and lastShipmentDate
 *
 * 7. Notes:
 *    - notes: Customer-facing or shareable notes
 *    - internalNotes: Private internal team notes
 *
 * 8. Metadata:
 *    - Automatically includes tags, category, customFields via metadataSchema
 *    - Provides flexible custom data storage
 *
 * 9. Indexes:
 *    - by_companyName: Search customers by name
 *    - by_status: Filter customers by status
 *    - by_country: Geographic filtering
 *    - by_inquirySource: Track customer acquisition sources
 *    - by_created, by_deleted: Audit trail queries
 */