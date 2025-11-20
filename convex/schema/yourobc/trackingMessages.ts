// convex/schema/yourobc/trackingMessages.ts
/**
 * YourOBC Tracking Messages Schema
 *
 * Defines schemas for tracking message templates used in shipment notifications.
 * These templates are used to generate automated communications for different
 * shipment statuses across multiple languages and service types.
 * Follows the template pattern with full compliance for maintainability.
 *
 * @module convex/schema/yourobc/trackingMessages
 */

import { v } from 'convex/values'
import { defineTable } from 'convex/server'
import {
  quoteServiceTypeValidator,
  shipmentStatusValidator,
  languageValidator,
  messageCategoryValidator,
  difficultyValidator,
  visibilityValidator,
  auditFields,
  softDeleteFields,
  metadataSchema,
  statsSchema,
} from './base'

// ============================================================================
// Tracking Messages Table
// ============================================================================

/**
 * Tracking messages table
 * Stores reusable message templates for shipment tracking notifications.
 * Each template can be customized per service type, status, and language.
 */
export const trackingMessagesTable = defineTable({
  // Core Identity
  name: v.string(), // Template name (e.g., 'OBC Booking Confirmation - EN')
  description: v.optional(v.string()), // Template description/purpose
  icon: v.optional(v.string()), // Icon identifier for message type
  thumbnail: v.optional(v.string()), // Preview image if applicable

  // Service Classification
  serviceType: quoteServiceTypeValidator, // OBC, NFO
  status: shipmentStatusValidator, // quoted, booked, pickup, in_transit, delivered, etc.

  // Message Configuration
  language: languageValidator, // en, de

  // Template Content
  subject: v.optional(v.string()), // Email subject line
  template: v.string(), // Message template with {variable} placeholders
  variables: v.array(v.string()), // List of variables used in template

  // Status
  isActive: v.boolean(), // Whether this template is currently active

  // Classification
  ...metadataSchema, // tags, category, customFields
  useCase: v.optional(v.string()), // Use case description
  difficulty: v.optional(difficultyValidator), // Template complexity: beginner, intermediate, advanced
  visibility: v.optional(visibilityValidator), // public, private, shared, organization

  // Ownership
  ownerId: v.string(), // authUserId - template creator/owner
  isOfficial: v.optional(v.boolean()), // System templates vs user-created templates

  // Usage Statistics
  stats: v.optional(statsSchema), // usageCount, rating, ratingCount - tracks template usage

  // Audit & Soft Delete
  ...auditFields,
  ...softDeleteFields,

  // Classification
  category: v.optional(messageCategoryValidator), // booking, pickup, in_transit, delivery, customs, general
})
  .index('by_serviceType', ['serviceType'])
  .index('by_status', ['status'])
  .index('by_language', ['language'])
  .index('by_owner', ['ownerId'])
  .index('by_official', ['isOfficial'])
  .index('by_active', ['isActive'])
  .index('by_category', ['category'])
  .index('by_deleted', ['deletedAt'])
  .index('by_created', ['createdAt'])
  .index('by_serviceType_status', ['serviceType', 'status'])
  .index('by_serviceType_status_language', ['serviceType', 'status', 'language'])
  .index('by_owner_and_active', ['ownerId', 'isActive'])
