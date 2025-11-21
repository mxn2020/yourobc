// convex/schema/yourobc/customerMargins/customerDunningConfig.ts
/**
 * Customer Dunning Configuration Table Schema
 *
 * Manages customer-specific payment dunning policies and enforcement.
 * Supports:
 * - Three-level dunning process (warning -> escalation -> final)
 * - Customizable fees and thresholds per customer
 * - Auto-send configuration for each level
 * - Service suspension and reactivation tracking
 * - VIP exemptions from dunning process
 * - Custom payment terms
 * - Prepayment requirements for high-risk customers
 *
 * @module convex/schema/yourobc/customerMargins/customerDunningConfig
 */

import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import {
  dunningMethodValidator,
  auditFields,
  softDeleteFields,
  metadataSchema,
  publicIdField,
  ownerIdField,
} from '../../base'

/**
 * Customer Dunning Configuration Table
 *
 * Customer-specific dunning settings and payment enforcement policies.
 * Defines escalation thresholds, fees, and service suspension rules.
 * Enables customization for different customer risk profiles and relationships.
 */
export const customerDunningConfigTable = defineTable({
  // Identity & Ownership
  ...publicIdField,
  ...ownerIdField,
  customerId: v.id('yourobcCustomers'),

  // Dunning Level 1 (First Reminder)
  level1DaysOverdue: v.number(), // Default: 7 days
  level1FeeEUR: v.number(), // Custom fee for this customer
  level1EmailTemplate: v.optional(v.string()),
  level1AutoSend: v.boolean(),

  // Dunning Level 2 (Escalation)
  level2DaysOverdue: v.number(), // Default: 14 days
  level2FeeEUR: v.number(),
  level2EmailTemplate: v.optional(v.string()),
  level2AutoSend: v.boolean(),

  // Dunning Level 3 (Final Warning)
  level3DaysOverdue: v.number(), // Default: 21 days
  level3FeeEUR: v.number(),
  level3EmailTemplate: v.optional(v.string()),
  level3AutoSend: v.boolean(),
  level3SuspendService: v.boolean(), // Auto-suspend after level 3?

  // Service Suspension Settings
  allowServiceWhenOverdue: v.boolean(), // Can they create new orders when overdue?
  suspensionGracePeriodDays: v.optional(v.number()),
  autoReactivateOnPayment: v.boolean(),

  // Custom Settings
  skipDunningProcess: v.boolean(), // VIP customers might skip dunning
  customPaymentTermsDays: v.optional(v.number()), // Override default payment terms
  requirePrepayment: v.boolean(), // Force prepayment for risky customers

  // Contact Preferences
  dunningContactEmail: v.optional(v.string()), // Specific email for dunning
  dunningContactPhone: v.optional(v.string()),
  dunningContactName: v.optional(v.string()), // Name of dunning contact person
  preferredDunningMethod: v.optional(dunningMethodValidator),

  // Service Suspension Tracking
  serviceSuspended: v.optional(v.boolean()), // Currently suspended?
  serviceSuspendedDate: v.optional(v.number()), // When suspended
  serviceSuspendedBy: v.optional(v.string()), // authUserId who suspended
  serviceReactivatedDate: v.optional(v.number()), // When reactivated
  serviceReactivatedBy: v.optional(v.string()), // authUserId who reactivated
  serviceSuspensionReason: v.optional(v.string()), // Reason for suspension

  // Modification Tracking
  lastModifiedBy: v.optional(v.string()), // authUserId who last modified

  // Status
  isActive: v.boolean(),

  // Notes
  notes: v.optional(v.string()),
  internalNotes: v.optional(v.string()),

  // Metadata and audit fields
  ...metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_publicId', ['publicId'])
  .index('by_ownerId', ['ownerId'])
  .index('by_customer', ['customerId'])
  .index('by_customer_active', ['customerId', 'isActive'])
  .index('by_suspendService', ['allowServiceWhenOverdue'])
  .index('by_created', ['createdAt'])

/**
 * Table exports
 */
export default customerDunningConfigTable

/**
 * USAGE NOTES:
 *
 * Dunning Level Configuration:
 * Level 1 (First Reminder):
 * - Gentle reminder that payment is overdue
 * - Default: 7 days after due date
 * - Typically small fee (e.g., 5-10 EUR)
 * - Set level1AutoSend = true for automatic sending
 *
 * Level 2 (Escalation):
 * - Stronger language, higher urgency
 * - Default: 14 days after due date
 * - Higher fee (e.g., 15-25 EUR)
 * - May reference potential service suspension
 *
 * Level 3 (Final Warning):
 * - Final notice before legal action/suspension
 * - Default: 21 days after due date
 * - Highest fee (e.g., 30-50 EUR)
 * - Set level3SuspendService = true to auto-suspend
 *
 * Service Suspension:
 * - allowServiceWhenOverdue: Set false to block new orders
 * - suspensionGracePeriodDays: Additional days before suspension
 * - autoReactivateOnPayment: Automatically restore service on payment
 * - Track suspension/reactivation dates and responsible users
 *
 * Custom Settings:
 * - skipDunningProcess: For VIP customers, valued partners
 * - customPaymentTermsDays: Override standard payment terms
 * - requirePrepayment: For high-risk customers, force upfront payment
 *
 * Contact Preferences:
 * - dunningContactEmail: Send dunning notices to specific email
 * - dunningContactPhone: For phone follow-ups
 * - dunningContactName: Accounting contact person
 * - preferredDunningMethod: Email, phone, mail, etc.
 *
 * Workflow:
 * 1. Invoice becomes overdue
 * 2. Check customer's dunningConfig
 * 3. If skipDunningProcess = true, skip to manual review
 * 4. Otherwise, follow level progression:
 *    - Day X (level1DaysOverdue): Send level 1, charge fee
 *    - Day Y (level2DaysOverdue): Send level 2, charge fee
 *    - Day Z (level3DaysOverdue): Send level 3, charge fee, suspend?
 * 5. Track all dunning actions in customerAnalytics
 *
 * Suspension Process:
 * 1. Check allowServiceWhenOverdue before accepting new orders
 * 2. If level 3 reached and level3SuspendService = true:
 *    - Set serviceSuspended = true
 *    - Set serviceSuspendedDate and serviceSuspendedBy
 *    - Record serviceSuspensionReason
 *    - Block new order creation
 * 3. On payment:
 *    - If autoReactivateOnPayment = true, reactivate immediately
 *    - Set serviceReactivatedDate and serviceReactivatedBy
 *    - Clear serviceSuspended flag
 *
 * Risk Management:
 * - High-risk customers: requirePrepayment = true
 * - Trusted customers: skipDunningProcess = true, longer payment terms
 * - Standard customers: Follow normal dunning progression
 *
 * Querying Patterns:
 * - by_customer_active: Get active config for customer
 * - by_suspendService: Find customers with service restrictions
 * - Use to check before creating new orders/shipments
 *
 * Integration Points:
 * - Invoice creation: Check customPaymentTermsDays, requirePrepayment
 * - Order creation: Check allowServiceWhenOverdue, serviceSuspended
 * - Payment processing: Check autoReactivateOnPayment
 * - Dunning jobs: Use level settings and autoSend flags
 */
