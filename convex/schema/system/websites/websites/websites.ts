// convex/schema/boilerplate/websites/websites/websites.ts
// Table definitions for websites module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields, metadataSchema, statusTypes } from '@/schema/base';
import { websitesValidators } from './validators';

export const websitesTable = defineTable({
  // Required: Main display field
  name: v.string(),

  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),

  // Core Website Data
  description: v.optional(v.string()),
  domain: v.optional(v.string()),
  subdomain: v.optional(v.string()),
  status: websitesValidators.status,
  priority: websitesValidators.priority,
  visibility: websitesValidators.visibility,

  // Visual Identity
  icon: v.optional(v.string()),
  thumbnail: v.optional(v.string()),

  // Classification & Organization
  tags: v.array(v.string()),
  category: v.optional(v.string()),

  // Theme & Design
  themeId: v.optional(v.id('websiteThemes')),
  customTheme: v.optional(v.object({
    primaryColor: v.optional(v.string()),
    secondaryColor: v.optional(v.string()),
    accentColor: v.optional(v.string()),
    backgroundColor: v.optional(v.string()),
    textColor: v.optional(v.string()),
    fontFamily: v.optional(v.string()),
    borderRadius: v.optional(v.string()),
  })),

  // SEO Settings (Global)
  seo: v.optional(v.object({
    defaultTitle: v.optional(v.string()),
    defaultDescription: v.optional(v.string()),
    defaultKeywords: v.optional(v.array(v.string())),
    defaultImage: v.optional(v.string()),
    siteName: v.optional(v.string()),
    twitterHandle: v.optional(v.string()),
    facebookAppId: v.optional(v.string()),
  })),

  // Website Settings
  settings: v.object({
    enableBlog: v.optional(v.boolean()),
    enableComments: v.optional(v.boolean()),
    enableAnalytics: v.optional(v.boolean()),
    enableCookieConsent: v.optional(v.boolean()),
    customCss: v.optional(v.string()),
    customJs: v.optional(v.string()),
    favicon: v.optional(v.string()),
    logo: v.optional(v.string()),
  }),

  // Navigation
  navigation: v.optional(v.object({
    header: v.optional(v.array(v.object({
      label: v.string(),
      url: v.string(),
      icon: v.optional(v.string()),
      order: v.number(),
      children: v.optional(v.array(v.object({
        label: v.string(),
        url: v.string(),
        icon: v.optional(v.string()),
      }))),
    }))),
    footer: v.optional(v.array(v.object({
      label: v.string(),
      url: v.string(),
      icon: v.optional(v.string()),
      order: v.number(),
    }))),
  })),

  // Social Links
  socialLinks: v.optional(v.object({
    facebook: v.optional(v.string()),
    twitter: v.optional(v.string()),
    linkedin: v.optional(v.string()),
    instagram: v.optional(v.string()),
    youtube: v.optional(v.string()),
    github: v.optional(v.string()),
  })),

  // Activity tracking
  lastPublishedAt: v.optional(v.number()),
  lastActivityAt: v.number(),

  // Standard metadata and audit fields
  metadata: metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_name', ['name'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_status', ['status'])
  .index('by_priority', ['priority'])
  .index('by_visibility', ['visibility'])
  .index('by_owner_and_status', ['ownerId', 'status'])
  .index('by_domain', ['domain'])
  .index('by_subdomain', ['subdomain'])
  .index('by_category', ['category'])
  .index('by_last_activity', ['lastActivityAt'])
  .index('by_created_at', ['createdAt']);
