// convex/schema/marketing/landing_pages/landing_pages.ts
// Table definitions for landing_pages module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields, statusTypes } from '@/schema/base';
import { landingPagesValidators } from './validators';

export const landingPagesTable = defineTable({
  // Required: Main display field
  title: v.string(),

  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),

  // Description
  description: v.optional(v.string()),

  // Status & Priority
  status: landingPagesValidators.status,
  priority: statusTypes.priority,

  // Ownership & Access
  visibility: landingPagesValidators.visibility,

  // Page configuration
  slug: v.string(), // URL slug
  customDomain: v.optional(v.string()),

  // Content
  template: v.optional(v.string()),
  sections: v.array(v.object({
    id: v.string(),
    type: landingPagesValidators.sectionType,
    content: v.any(),
    order: v.number(),
  })),

  // Styling
  theme: v.optional(v.object({
    primaryColor: v.optional(v.string()),
    secondaryColor: v.optional(v.string()),
    fontFamily: v.optional(v.string()),
    customCss: v.optional(v.string()),
  })),

  // SEO
  seo: v.optional(v.object({
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    keywords: v.optional(v.array(v.string())),
    ogImage: v.optional(v.string()),
  })),

  // Form integration
  formId: v.optional(v.string()),

  // Publishing
  publishedAt: v.optional(v.number()),
  scheduledPublishAt: v.optional(v.number()),

  // Analytics
  totalViews: v.optional(v.number()),
  totalConversions: v.optional(v.number()),
  conversionRate: v.optional(v.number()),

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
  .index('by_owner_id', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_slug', ['slug'])
  .index('by_status', ['status'])
  .index('by_priority', ['priority'])
  .index('by_visibility', ['visibility'])
  .index('by_owner_and_status', ['ownerId', 'status'])
  .index('by_last_activity', ['lastActivityAt'])
  .index('by_created_at', ['createdAt']);

export const pageVariantsTable = defineTable({
  // Core fields
  pageId: v.id('marketingLandingPages'),
  name: v.string(),

  // Variant configuration
  isControl: v.optional(v.boolean()),
  trafficPercentage: v.number(),

  // Content differences
  sections: v.array(v.object({
    id: v.string(),
    type: v.string(),
    content: v.any(),
    order: v.number(),
  })),

  // Performance metrics
  views: v.optional(v.number()),
  conversions: v.optional(v.number()),
  conversionRate: v.optional(v.number()),

  // Status
  isActive: v.boolean(),

  // Metadata
  ...auditFields,
})
  .index('by_page', ['pageId'])
  .index('by_active', ['isActive'])
  .index('by_name', ['name']);
