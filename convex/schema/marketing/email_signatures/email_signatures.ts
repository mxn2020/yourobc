// convex/schema/marketing/email_signatures/email_signatures.ts
// Table definitions for email_signatures module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields, statusTypes } from '@/schema/base';
import { emailSignaturesValidators } from './validators';

export const emailSignaturesTable = defineTable({
  // Required: Main display field
  title: v.string(), // Signature name

  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),

  // Description
  description: v.optional(v.string()),

  // Status & Priority
  status: emailSignaturesValidators.status,
  priority: statusTypes.priority,

  // Ownership & Access
  visibility: emailSignaturesValidators.visibility,

  // Personal information
  fullName: v.string(),
  jobTitle: v.optional(v.string()),
  company: v.optional(v.string()),
  department: v.optional(v.string()),

  // Contact information
  email: v.optional(v.string()),
  phone: v.optional(v.string()),
  mobile: v.optional(v.string()),
  website: v.optional(v.string()),

  // Social media links
  socialLinks: v.optional(v.array(v.object({
    platform: v.string(),
    url: v.string(),
    icon: v.optional(v.string()),
  }))),

  // Branding
  logoUrl: v.optional(v.string()),
  profileImageUrl: v.optional(v.string()),
  bannerUrl: v.optional(v.string()),
  bannerLink: v.optional(v.string()),

  // Styling
  template: v.optional(v.string()),
  colors: v.optional(v.object({
    primary: v.optional(v.string()),
    secondary: v.optional(v.string()),
    text: v.optional(v.string()),
  })),
  fontFamily: v.optional(v.string()),

  // Disclaimer/Legal
  disclaimer: v.optional(v.string()),

  // Generated HTML
  htmlContent: v.optional(v.string()),

  // Analytics
  clickTracking: v.optional(v.boolean()),
  totalClicks: v.optional(v.number()),

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
  .index('by_last_activity', ['lastActivityAt'])
  .index('by_created_at', ['createdAt']);

export const signatureTemplatesTable = defineTable({
  // Core fields
  userId: v.id('userProfiles'),
  name: v.string(),
  description: v.optional(v.string()),

  // Template configuration
  category: v.optional(emailSignaturesValidators.templateCategory),

  // Template structure
  layout: v.object({
    structure: v.string(), // HTML structure with placeholders
    defaultStyles: v.optional(v.any()),
  }),

  // Sharing
  isPublic: v.optional(v.boolean()),
  isApproved: v.optional(v.boolean()),

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
