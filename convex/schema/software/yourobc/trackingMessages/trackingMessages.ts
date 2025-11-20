// convex/schema/software/yourobc/trackingMessages/trackingMessages.ts
/**
 * Tracking Messages Table Definition
 *
 * Defines the schema for tracking message templates used in shipment notifications.
 * These templates are used to generate automated communications for different
 * shipment statuses across multiple languages and service types.
 *
 * @module convex/schema/software/yourobc/trackingMessages/trackingMessages
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
} from '../../../yourobc/base'
import { templateVariablesValidator } from './validators'

// ============================================================================
// Tracking Messages Table
// ============================================================================

/**
 * Tracking messages table
 * Stores reusable message templates for shipment tracking notifications.
 * Each template can be customized per service type, status, and language.
 *
 * Key Features:
 * - Multi-language support (en, de)
 * - Service-specific templates (OBC, NFO)
 * - Status-based message templates
 * - Variable substitution for dynamic content
 * - Official vs user-created templates
 * - Usage statistics and ratings
 *
 * Display Field: subject (primary) or template preview
 */
export const trackingMessagesTable = defineTable({
  // Public Identity
  publicId: v.string(), // Public-facing unique identifier (e.g., 'tmsg_abc123')

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
  subject: v.optional(v.string()), // Email subject line (main display field)
  template: v.string(), // Message template with {variable} placeholders
  variables: templateVariablesValidator, // List of variables used in template

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
  ...auditFields, // createdAt, createdBy, updatedAt, updatedBy
  ...softDeleteFields, // deletedAt, deletedBy

  // Classification
  category: v.optional(messageCategoryValidator), // booking, pickup, in_transit, delivery, customs, general
})
  // Core indexes
  .index('by_publicId', ['publicId'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted', ['deletedAt'])
  .index('by_created', ['createdAt'])

  // Feature indexes
  .index('by_serviceType', ['serviceType'])
  .index('by_status', ['status'])
  .index('by_language', ['language'])
  .index('by_official', ['isOfficial'])
  .index('by_active', ['isActive'])
  .index('by_category', ['category'])

  // Composite indexes for common queries
  .index('by_serviceType_status', ['serviceType', 'status'])
  .index('by_serviceType_status_language', ['serviceType', 'status', 'language'])
  .index('by_owner_and_active', ['ownerId', 'isActive'])
  .index('by_owner_deleted', ['ownerId', 'deletedAt'])
  .index('by_active_deleted', ['isActive', 'deletedAt'])

// ============================================================================
// Export
// ============================================================================

export default trackingMessagesTable
