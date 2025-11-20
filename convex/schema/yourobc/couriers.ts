// convex/schema/yourobc/couriers.ts
/**
 * YourOBC Courier Schema
 *
 * Defines schemas for courier management and their associated commission tracking.
 * Follows the single source of truth pattern using validators from base.ts.
 *
 * @module convex/schema/yourobc/couriers
 */

import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import {
  courierStatusValidator,
  commissionTypeValidator,
  currencyValidator,
  paymentMethodValidator,
  commissionSimpleStatusValidator,
  timeEntrySchema,
  skillsSchema,
  auditFields,
  softDeleteFields,
  metadataSchema,
} from './base'

// ============================================================================
// Courier Table
// ============================================================================

/**
 * Courier management table
 * Tracks courier information, skills, availability, and time entries
 */
export const couriersTable = defineTable({
  // Core Identity
  courierNumber: v.string(),
  firstName: v.string(),
  middleName: v.optional(v.string()),
  lastName: v.string(),
  email: v.optional(v.string()),
  phone: v.string(),

  // Account Association
  userProfileId: v.optional(v.id('userProfiles')),
  authUserId: v.optional(v.string()),

  // Status & Availability
  status: courierStatusValidator,
  isActive: v.boolean(),
  isOnline: v.boolean(),

  // Courier Skills & Capabilities
  skills: skillsSchema,

  // Time Tracking
  timeEntries: v.array(timeEntrySchema),
  timezone: v.string(),

  // Location (current/home base)
  currentLocation: v.optional(v.object({
    country: v.string(),
    countryCode: v.string(),
    city: v.optional(v.string()),
  })),

  // Ranking & Quality (for internal decision-making)
  ranking: v.optional(v.number()), // 1-5 stars
  rankingNotes: v.optional(v.string()),

  // Cost Profile / Ratecard
  costProfile: v.optional(v.object({
    baseRate: v.optional(v.number()),
    overtimeRate: v.optional(v.number()),
    currency: v.optional(currencyValidator),
    notes: v.optional(v.string()),
  })),

  // General notes
  notes: v.optional(v.string()),

  // Metadata (tags, category, custom fields)
  ...metadataSchema,

  // Service Coverage (countries/airports they can operate in)
  serviceCoverage: v.optional(v.object({
    countries: v.optional(v.array(v.string())),
    airports: v.optional(v.array(v.string())),
    cities: v.optional(v.array(v.string())),
  })),

  // Audit & Soft Delete
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_authUserId', ['authUserId'])
  .index('by_userProfile', ['userProfileId'])
  .index('by_courierNumber', ['courierNumber'])
  .index('by_status', ['status'])
  .index('by_isActive', ['isActive'])
  .index('by_isOnline', ['isOnline'])
  .index('by_phone', ['phone'])
  .index('by_email', ['email'])
  .index('by_created', ['createdAt'])
  .index('by_deleted', ['deletedAt'])

// ============================================================================
// Commissions Table
// ============================================================================

/**
 * Commission tracking table (moved from employees)
 * Tracks courier payments for shipments based on performance
 */
export const commissionsTable = defineTable({
  // Commission Target
  courierId: v.id('yourobcCouriers'),
  shipmentId: v.id('yourobcShipments'),

  // Commission Type & Calculation
  type: commissionTypeValidator,
  rate: v.number(), // Percentage (e.g., 15 for 15%) or fixed amount
  baseAmount: v.number(), // Amount commission is calculated from (e.g., shipment revenue)
  commissionAmount: v.number(), // Final calculated commission amount

  // Currency support
  currency: v.optional(currencyValidator),

  // Payment Status & Tracking
  status: commissionSimpleStatusValidator,
  paidDate: v.optional(v.number()),
  paymentReference: v.optional(v.string()), // Bank transfer reference, check number, etc.
  paymentMethod: v.optional(paymentMethodValidator),

  // Approval
  approvedBy: v.optional(v.string()), // authUserId of approver
  approvedDate: v.optional(v.number()),
  notes: v.optional(v.string()),

  // Audit & Soft Delete
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_courier', ['courierId'])
  .index('by_shipment', ['shipmentId'])
  .index('by_status', ['status'])
  .index('by_paidDate', ['paidDate'])
  .index('by_courier_status', ['courierId', 'status']) // For courier commission dashboard
  .index('by_created', ['createdAt'])
  .index('by_deleted', ['deletedAt'])

// ============================================================================
// USAGE NOTES
// ============================================================================

/**
 * Schema design follows the single source of truth pattern.
 *
 * ✅ DO:
 * - Import validators from base.ts (courierStatusValidator, commissionTypeValidator, etc.)
 * - Import reusable schemas from base.ts (auditFields, timeEntrySchema, skillsSchema, etc.)
 * - Use imported validators in table definitions
 * - Add indexes for frequently queried fields
 * - Use spread operator for audit fields: ...auditFields, ...softDeleteFields
 *
 * ❌ DON'T:
 * - Define inline v.union() validators in table definitions
 * - Duplicate validator definitions across tables
 * - Forget to add indexes for query patterns
 * - Redefine audit fields manually
 *
 * CUSTOMIZATION GUIDE:
 *
 * 1. Courier Identity:
 *    - courierNumber: Unique identifier for the courier
 *    - firstName, lastName: Required for courier identification
 *    - email, phone: Contact information
 *
 * 2. Account Association:
 *    - userProfileId, authUserId: Link courier to user account for app access
 *    - Optional fields allow couriers without system access
 *
 * 3. Status & Availability:
 *    - status: Uses courierStatusValidator from base.ts
 *    - isActive, isOnline: Quick availability checks
 *
 * 4. Skills & Capabilities:
 *    - skills: Uses skillsSchema from base.ts
 *    - Includes languages, weight limits, service types, certifications
 *
 * 5. Time Tracking:
 *    - timeEntries: Array of clock in/out events using timeEntrySchema
 *    - timezone: For accurate time calculations
 *
 * 6. Commission Tracking:
 *    - Separate commissionsTable tracks payments per shipment
 *    - Links to both courier and shipment
 *    - Supports percentage and fixed commission types
 *    - Tracks approval and payment workflow
 *
 * 7. Indexes:
 *    - by_authUserId, by_userProfile: For user account lookups
 *    - by_courierNumber: For courier identification
 *    - by_status, by_isActive, by_isOnline: For availability queries
 *    - by_courier_status: Compound index for commission dashboard
 */