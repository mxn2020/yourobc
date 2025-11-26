// convex/schema/marketing/link_shortener/link_shortener.ts
// Table definitions for link_shortener module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields, statusTypes } from '@/schema/base';
import { linkShortenerValidators } from './validators';

export const linksTable = defineTable({
  // Required: Main display field
  title: v.string(),

  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),

  // Description
  description: v.optional(v.string()),

  // Status & Priority
  status: linkShortenerValidators.status,
  priority: statusTypes.priority,

  // Ownership & Access
  visibility: linkShortenerValidators.visibility,

  // Link details
  originalUrl: v.string(),
  shortCode: v.string(), // Unique short identifier
  customDomain: v.optional(v.string()),

  // QR Code
  qrCodeUrl: v.optional(v.string()),

  // Settings
  expiresAt: v.optional(v.number()),
  maxClicks: v.optional(v.number()),
  password: v.optional(v.string()),

  // A/B Testing
  isABTest: v.optional(v.boolean()),
  variants: v.optional(v.array(v.object({
    url: v.string(),
    weight: v.number(), // Percentage of traffic
    clicks: v.optional(v.number()),
  }))),

  // Analytics summary
  totalClicks: v.optional(v.number()),
  uniqueClicks: v.optional(v.number()),
  lastClickedAt: v.optional(v.number()),

  // Metadata
  tags: v.array(v.string()),
  metadata: v.optional(v.record(v.string(), v.any())),

  // Required: Audit fields
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_title', ['title'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_short_code', ['shortCode'])
  .index('by_status', ['status'])
  .index('by_priority', ['priority'])
  .index('by_visibility', ['visibility'])
  .index('by_owner_and_status', ['ownerId', 'status'])
  .index('by_last_activity', ['lastActivityAt'])
  .index('by_created_at', ['createdAt']);

export const linkClicksTable = defineTable({
  // Core fields
  linkId: v.id('marketingLinks'),

  // Click details
  clickedAt: v.number(),
  ipAddress: v.optional(v.string()),
  country: v.optional(v.string()),
  city: v.optional(v.string()),

  // Device & browser
  device: v.optional(linkShortenerValidators.device),
  browser: v.optional(v.string()),
  os: v.optional(v.string()),

  // Referrer
  referrer: v.optional(v.string()),
  referrerDomain: v.optional(v.string()),

  // UTM parameters
  utmSource: v.optional(v.string()),
  utmMedium: v.optional(v.string()),
  utmCampaign: v.optional(v.string()),
  utmTerm: v.optional(v.string()),
  utmContent: v.optional(v.string()),

  // A/B test variant (if applicable)
  variantIndex: v.optional(v.number()),

  // Unique visitor tracking
  visitorId: v.optional(v.string()),
  isUnique: v.optional(v.boolean()),
})
  .index('by_link', ['linkId'])
  .index('by_clicked_at', ['clickedAt'])
  .index('by_country', ['country'])
  .index('by_visitor', ['visitorId']);
