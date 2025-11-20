// convex/schema/software/yourobc/couriers/couriers.ts
// Table definition for couriers module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import {
  courierStatusValidator,
  currencyValidator,
  timeEntrySchema,
  skillsSchema,
  costProfileSchema,
  serviceCoverageSchema,
  currentLocationSchema,
  metadataSchema,
  auditFields,
  softDeleteFields,
} from './validators';

// ============================================================================
// Couriers Table
// ============================================================================

/**
 * Couriers table
 * Tracks courier information, skills, availability, and time entries
 */
export const couriersTable = defineTable({
  // Required: Public ID for external APIs and shareable URLs
  publicId: v.string(),

  // Required: Main display field
  companyName: v.string(),

  // Required: Core fields
  ownerId: v.id('userProfiles'),
  status: courierStatusValidator,

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
  isActive: v.boolean(),
  isOnline: v.boolean(),

  // Courier Skills & Capabilities
  skills: skillsSchema,

  // Time Tracking
  timeEntries: v.array(timeEntrySchema),
  timezone: v.string(),

  // Location (current/home base)
  currentLocation: v.optional(currentLocationSchema),

  // Ranking & Quality (for internal decision-making)
  ranking: v.optional(v.number()), // 1-5 stars
  rankingNotes: v.optional(v.string()),

  // Cost Profile / Ratecard
  costProfile: v.optional(costProfileSchema),

  // General notes
  notes: v.optional(v.string()),

  // Service Coverage (countries/airports they can operate in)
  serviceCoverage: v.optional(serviceCoverageSchema),

  // Standard metadata and audit fields
  ...metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_name', ['companyName'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_authUserId', ['authUserId'])
  .index('by_userProfile', ['userProfileId'])
  .index('by_courierNumber', ['courierNumber'])
  .index('by_status', ['status'])
  .index('by_isActive', ['isActive'])
  .index('by_isOnline', ['isOnline'])
  .index('by_phone', ['phone'])
  .index('by_email', ['email'])
  .index('by_created', ['createdAt']);
