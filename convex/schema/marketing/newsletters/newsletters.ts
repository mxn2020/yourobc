// convex/schema/marketing/newsletters/newsletters.ts
// Table definitions for newsletters module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields, statusTypes } from '@/schema/base';
import { newslettersValidators } from './validators';

export const newslettersTable = defineTable({
  // Required: Main display field
  title: v.string(), // Newsletter series name

  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),

  // Description
  description: v.optional(v.string()),

  // Status & Priority
  status: newslettersValidators.newsletterStatus,
  priority: statusTypes.priority,

  // Ownership & Access
  visibility: newslettersValidators.visibility,

  // Sender information
  fromName: v.string(),
  fromEmail: v.string(),
  replyToEmail: v.optional(v.string()),

  // Branding
  logoUrl: v.optional(v.string()),
  headerImageUrl: v.optional(v.string()),
  colors: v.optional(v.object({
    primary: v.optional(v.string()),
    secondary: v.optional(v.string()),
    background: v.optional(v.string()),
  })),

  // Settings
  isActive: v.boolean(),

  // Subscriber stats
  totalSubscribers: v.optional(v.number()),
  activeSubscribers: v.optional(v.number()),

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
  .index('by_status', ['status'])
  .index('by_priority', ['priority'])
  .index('by_visibility', ['visibility'])
  .index('by_owner_and_status', ['ownerId', 'status'])
  .index('by_active', ['isActive'])
  .index('by_last_activity', ['lastActivityAt'])
  .index('by_created_at', ['createdAt']);

export const newsletterCampaignsTable = defineTable({
  // Required: Main display field
  title: v.string(), // Campaign name

  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),
  newsletterId: v.id('marketingNewsletters'),

  // Description
  description: v.optional(v.string()),

  // Status & Priority
  status: newslettersValidators.campaignStatus,
  priority: statusTypes.priority,

  // Ownership & Access
  visibility: newslettersValidators.visibility,

  // Campaign details
  subject: v.string(),
  preheaderText: v.optional(v.string()),

  // Content
  template: v.optional(v.string()),
  content: v.object({
    html: v.string(),
    plainText: v.optional(v.string()),
  }),

  // Targeting
  segmentIds: v.optional(v.array(v.string())),

  // A/B Testing
  isABTest: v.optional(v.boolean()),
  variants: v.optional(v.array(v.object({
    subject: v.string(),
    content: v.string(),
    percentage: v.number(),
  }))),

  // Scheduling
  scheduledAt: v.optional(v.number()),
  sentAt: v.optional(v.number()),

  // Analytics
  totalRecipients: v.optional(v.number()),
  delivered: v.optional(v.number()),
  opened: v.optional(v.number()),
  clicked: v.optional(v.number()),
  bounced: v.optional(v.number()),
  complained: v.optional(v.number()),
  unsubscribed: v.optional(v.number()),
  openRate: v.optional(v.number()),
  clickRate: v.optional(v.number()),

  // Error handling
  errorMessage: v.optional(v.string()),

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
  .index('by_newsletter', ['newsletterId'])
  .index('by_status', ['status'])
  .index('by_priority', ['priority'])
  .index('by_visibility', ['visibility'])
  .index('by_owner_and_status', ['ownerId', 'status'])
  .index('by_last_activity', ['lastActivityAt'])
  .index('by_scheduled_at', ['scheduledAt'])
  .index('by_sent_at', ['sentAt'])
  .index('by_created_at', ['createdAt']);

export const newsletterSubscribersTable = defineTable({
  // Core fields
  newsletterId: v.id('marketingNewsletters'),

  // Subscriber information
  email: v.string(),
  firstName: v.optional(v.string()),
  lastName: v.optional(v.string()),

  // Status
  status: newslettersValidators.subscriberStatus,

  // Subscription details
  subscribedAt: v.number(),
  unsubscribedAt: v.optional(v.number()),

  // Source
  source: v.optional(newslettersValidators.subscriptionSource),

  // Segments
  segments: v.optional(v.array(v.string())),

  // Custom fields
  customFields: v.optional(v.record(v.string(), v.union(
    v.string(),
    v.number(),
    v.boolean()
  ))),

  // Engagement
  lastOpenedAt: v.optional(v.number()),
  lastClickedAt: v.optional(v.number()),
  totalOpens: v.optional(v.number()),
  totalClicks: v.optional(v.number()),

  // Metadata
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_newsletter', ['newsletterId'])
  .index('by_email', ['email'])
  .index('by_status', ['status'])
  .index('by_subscribed_at', ['subscribedAt'])
  .index('by_deleted_at', ['deletedAt']);

export const newsletterTemplatesTable = defineTable({
  // Core fields
  userId: v.id('userProfiles'),
  name: v.string(),
  description: v.optional(v.string()),

  // Template configuration
  category: v.optional(newslettersValidators.templateCategory),

  // Content
  content: v.object({
    html: v.string(),
    plainText: v.optional(v.string()),
  }),

  // Preview
  thumbnailUrl: v.optional(v.string()),

  // Sharing
  isPublic: v.optional(v.boolean()),

  // Usage
  usageCount: v.optional(v.number()),

  // Metadata
  tags: v.array(v.string()),
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_user', ['userId'])
  .index('by_name', ['name'])
  .index('by_category', ['category'])
  .index('by_public', ['isPublic'])
  .index('by_deleted_at', ['deletedAt']);
