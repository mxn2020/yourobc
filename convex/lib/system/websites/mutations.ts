// convex/lib/boilerplate/websites/mutations.ts

import { mutation } from '@/generated/server'
import { v } from 'convex/values'
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper'
import { generateUniquePublicId } from '@/shared/utils/publicId'
import { WEBSITE_CONSTANTS } from './constants'
import {
  requireEditAccess,
  requireDeleteAccess,
  requirePublishAccess,
  requireCollaboratorManagementAccess,
  requireViewAccess,
} from './permissions'
import {
  validateWebsiteData,
  validatePageData,
  validateSectionData,
  generateSlug,
  generatePath,
} from './utils'
import {
  statusTypes,
  pageTemplateTypeValidator,
  sectionTypeValidator,
  layoutTypeValidator,
  blockTypeValidator,
  websiteCollaboratorRoleValidator,
} from '@/schema/base'
import type {
  CreateWebsiteData,
  UpdateWebsiteData,
  CreatePageData,
  UpdatePageData,
  CreateSectionData,
  UpdateSectionData,
  Website,
  WebsitePage,
  WebsiteSection,
} from './types'

/**
 * Create a new website
 */
export const createWebsite = mutation({
  args: {
    data: v.object({
      name: v.string(),
      description: v.optional(v.string()),
      domain: v.optional(v.string()),
      subdomain: v.optional(v.string()),
      priority: v.optional(statusTypes.priority),
      visibility: v.optional(v.union(v.literal('private'), v.literal('team'), v.literal('public'))),
      icon: v.optional(v.string()),
      thumbnail: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      category: v.optional(v.string()),
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
      seo: v.optional(v.object({
        defaultTitle: v.optional(v.string()),
        defaultDescription: v.optional(v.string()),
        defaultKeywords: v.optional(v.array(v.string())),
        defaultImage: v.optional(v.string()),
        siteName: v.optional(v.string()),
        twitterHandle: v.optional(v.string()),
        facebookAppId: v.optional(v.string()),
      })),
      settings: v.optional(v.object({
        enableBlog: v.optional(v.boolean()),
        enableComments: v.optional(v.boolean()),
        enableAnalytics: v.optional(v.boolean()),
        enableCookieConsent: v.optional(v.boolean()),
        customCss: v.optional(v.string()),
        customJs: v.optional(v.string()),
        favicon: v.optional(v.string()),
        logo: v.optional(v.string()),
      })),
      navigation: v.optional(v.object({
        header: v.optional(v.array(v.any())),
        footer: v.optional(v.array(v.any())),
      })),
      socialLinks: v.optional(v.object({
        facebook: v.optional(v.string()),
        twitter: v.optional(v.string()),
        linkedin: v.optional(v.string()),
        instagram: v.optional(v.string()),
        youtube: v.optional(v.string()),
        github: v.optional(v.string()),
      })),
    }),
  },
  handler: async (ctx, { data }) => {
    // 🔒 Authenticate & check permission
    const user = await requirePermission(
      ctx,
      WEBSITE_CONSTANTS.PERMISSIONS.CREATE,
      { allowAdmin: true }
    )

    // Validate data
    const errors = validateWebsiteData(data as any)
    if (errors.length > 0) {
      throw new Error(`Validation errors: ${errors.join(', ')}`)
    }

    // Generate public ID
    const publicId = await generateUniquePublicId(ctx, 'websites')

    // Create website
    const now = Date.now()
    const websiteId = await ctx.db.insert('websites', {
      publicId,
      name: data.name.trim(),
      description: data.description?.trim(),
      domain: data.domain?.trim(),
      subdomain: data.subdomain?.trim(),
      status: WEBSITE_CONSTANTS.STATUS.DRAFT as Website['status'],
      priority: (data.priority as Website['priority']) || (WEBSITE_CONSTANTS.PRIORITY.MEDIUM as Website['priority']),
      ownerId: user._id,
      visibility: (data.visibility as Website['visibility']) || (WEBSITE_CONSTANTS.VISIBILITY.PRIVATE as Website['visibility']),
      icon: data.icon,
      thumbnail: data.thumbnail,
      tags: data.tags || [],
      category: data.category,
      themeId: data.themeId,
      customTheme: data.customTheme,
      seo: data.seo,
      settings: data.settings || {
        enableBlog: false,
        enableComments: false,
        enableAnalytics: false,
        enableCookieConsent: true,
      },
      navigation: data.navigation,
      socialLinks: data.socialLinks,
      lastActivityAt: now,
      createdAt: now,
      createdBy: user._id,
      metadata: {
        source: 'web',
        operation: 'create',
      },
    })

    // Auto-add owner as collaborator
    await ctx.db.insert('websiteCollaborators', {
      websiteId,
      collaboratorId: user._id,
      role: 'owner' as const,
      permissions: {
        canPublish: true,
        canEditPages: true,
        canEditTheme: true,
        canManageCollaborators: true,
        canDeleteWebsite: true,
      },
      addedAt: now,
      addedBy: user._id,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
      metadata: {
        source: 'web',
        operation: 'auto_add_owner',
      },
    })

    // Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'website.created',
      entityType: 'system_website',
      entityId: publicId,
      entityTitle: data.name.trim(),
      description: `Created website '${data.name.trim()}'`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    })

    return { _id: websiteId, publicId }
  },
})

/**
 * Update a website
 */
export const updateWebsite = mutation({
  args: {
    websiteId: v.id('websites'),
    data: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      domain: v.optional(v.string()),
      subdomain: v.optional(v.string()),
      status: v.optional(statusTypes.website),
      priority: v.optional(statusTypes.priority),
      visibility: v.optional(v.union(v.literal('private'), v.literal('team'), v.literal('public'))),
      icon: v.optional(v.string()),
      thumbnail: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      category: v.optional(v.string()),
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
      seo: v.optional(v.object({
        defaultTitle: v.optional(v.string()),
        defaultDescription: v.optional(v.string()),
        defaultKeywords: v.optional(v.array(v.string())),
        defaultImage: v.optional(v.string()),
        siteName: v.optional(v.string()),
        twitterHandle: v.optional(v.string()),
        facebookAppId: v.optional(v.string()),
      })),
      settings: v.optional(v.object({
        enableBlog: v.optional(v.boolean()),
        enableComments: v.optional(v.boolean()),
        enableAnalytics: v.optional(v.boolean()),
        enableCookieConsent: v.optional(v.boolean()),
        customCss: v.optional(v.string()),
        customJs: v.optional(v.string()),
        favicon: v.optional(v.string()),
        logo: v.optional(v.string()),
      })),
      navigation: v.optional(v.object({
        header: v.optional(v.array(v.any())),
        footer: v.optional(v.array(v.any())),
      })),
      socialLinks: v.optional(v.object({
        facebook: v.optional(v.string()),
        twitter: v.optional(v.string()),
        linkedin: v.optional(v.string()),
        instagram: v.optional(v.string()),
        youtube: v.optional(v.string()),
        github: v.optional(v.string()),
      })),
    }),
  },
  handler: async (ctx, { websiteId, data }) => {
    const user = await requireCurrentUser(ctx)
    const website = await ctx.db.get(websiteId)

    if (!website || website.deletedAt) {
      throw new Error('Website not found')
    }

    await requireEditAccess(ctx, website, user)

    // Validate data
    const errors = validateWebsiteData(data as any)
    if (errors.length > 0) {
      throw new Error(`Validation errors: ${errors.join(', ')}`)
    }

    // Trim string fields
    const trimmedData = {
      ...data,
      ...(data.name && { name: data.name.trim() }),
      ...(data.description && { description: data.description.trim() }),
      ...(data.domain && { domain: data.domain.trim() }),
      ...(data.subdomain && { subdomain: data.subdomain.trim() }),
    }

    // Update website
    const now = Date.now()
    const updateData: Partial<Website> = {
      ...trimmedData,
      lastActivityAt: now,
      updatedAt: now,
      updatedBy: user._id,
    }
    await ctx.db.patch(websiteId, updateData)

    // Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'website.updated',
      entityType: 'system_website',
      entityId: website.publicId,
      entityTitle: website.name,
      description: `Updated website '${website.name}'`,
      metadata: {
        source: 'web',
        operation: 'update',
        changes: trimmedData,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    })

    return { _id: websiteId }
  },
})

/**
 * Publish a website
 */
export const publishWebsite = mutation({
  args: { websiteId: v.id('websites') },
  handler: async (ctx, { websiteId }) => {
    const user = await requireCurrentUser(ctx)
    const website = await ctx.db.get(websiteId)

    if (!website || website.deletedAt) {
      throw new Error('Website not found')
    }

    await requirePublishAccess(ctx, website, user)

    const now = Date.now()
    await ctx.db.patch(websiteId, {
      status: WEBSITE_CONSTANTS.STATUS.PUBLISHED as Website['status'],
      lastPublishedAt: now,
      lastActivityAt: now,
      updatedAt: now,
      updatedBy: user._id,
    })

    // Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'website.published',
      entityType: 'system_website',
      entityId: website.publicId,
      entityTitle: website.name,
      description: `Published website '${website.name}'`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    })

    return { _id: websiteId }
  },
})

/**
 * Delete a website (soft delete)
 */
export const deleteWebsite = mutation({
  args: { websiteId: v.id('websites') },
  handler: async (ctx, { websiteId }) => {
    const user = await requireCurrentUser(ctx)
    const website = await ctx.db.get(websiteId)

    if (!website || website.deletedAt) {
      throw new Error('Website not found')
    }

    requireDeleteAccess(website, user)

    const now = Date.now()
    await ctx.db.patch(websiteId, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    })

    // Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'website.deleted',
      entityType: 'system_website',
      entityId: website.publicId,
      entityTitle: website.name,
      description: `Deleted website '${website.name}'`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    })

    return { _id: websiteId }
  },
})

/**
 * Create a new page
 */
export const createPage = mutation({
  args: {
    data: v.object({
      websiteId: v.id('websites'),
      title: v.string(),
      slug: v.optional(v.string()),
      path: v.optional(v.string()),
      content: v.optional(v.string()),
      excerpt: v.optional(v.string()),
      templateType: pageTemplateTypeValidator,
      layout: layoutTypeValidator,
      parentPageId: v.optional(v.id('websitePages')),
      sections: v.optional(v.array(v.object({
        sectionId: v.id('websiteSections'),
        order: v.number(),
        settings: v.optional(v.object({
          fullWidth: v.optional(v.boolean()),
          backgroundColor: v.optional(v.string()),
          padding: v.optional(v.string()),
          margin: v.optional(v.string()),
        })),
      }))),
      seo: v.optional(v.object({
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        keywords: v.optional(v.array(v.string())),
        ogImage: v.optional(v.string()),
        ogType: v.optional(v.string()),
        canonical: v.optional(v.string()),
        noindex: v.optional(v.boolean()),
        nofollow: v.optional(v.boolean()),
      })),
      featuredImage: v.optional(v.object({
        url: v.string(),
        alt: v.optional(v.string()),
        caption: v.optional(v.string()),
      })),
      settings: v.optional(v.object({
        showHeader: v.optional(v.boolean()),
        showFooter: v.optional(v.boolean()),
        customCss: v.optional(v.string()),
        customJs: v.optional(v.string()),
      })),
    }),
  },
  handler: async (ctx, { data }) => {
    const user = await requireCurrentUser(ctx)
    const website = await ctx.db.get(data.websiteId)

    if (!website || website.deletedAt) {
      throw new Error('Website not found')
    }

    await requireEditAccess(ctx, website, user)

    // Generate slug if not provided
    const slug = data.slug || generateSlug(data.title)

    // Generate path
    let parentPath = '/'
    if (data.parentPageId) {
      const parentPage = await ctx.db.get(data.parentPageId)
      if (parentPage) {
        parentPath = parentPage.path
      }
    }
    const path = data.path || generatePath(slug, parentPath)

    // Validate data
    const pageData = { ...data, slug, path }
    const errors = validatePageData(pageData as any)
    if (errors.length > 0) {
      throw new Error(`Validation errors: ${errors.join(', ')}`)
    }

    // Generate public ID
    const publicId = await generateUniquePublicId(ctx, 'websitePages')

    // Create page
    const now = Date.now()
    const pageId = await ctx.db.insert('websitePages', {
      publicId,
      websiteId: data.websiteId,
      title: data.title.trim(),
      slug,
      path,
      content: data.content?.trim(),
      excerpt: data.excerpt?.trim(),
      status: WEBSITE_CONSTANTS.PAGE_STATUS.DRAFT as WebsitePage['status'],
      templateType: data.templateType as WebsitePage['templateType'],
      layout: data.layout as WebsitePage['layout'],
      parentPageId: data.parentPageId,
      sections: data.sections || [],
      seo: data.seo,
      featuredImage: data.featuredImage,
      settings: data.settings || {
        showHeader: true,
        showFooter: true,
      },
      viewCount: 0,
      lastActivityAt: now,
      createdAt: now,
      createdBy: user._id,
      metadata: {
        source: 'web',
        operation: 'create',
      },
    })

    // Update website activity
    await ctx.db.patch(data.websiteId, {
      lastActivityAt: now,
    })

    // Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'website.page.created',
      entityType: 'system_website_page',
      entityId: publicId,
      entityTitle: data.title.trim(),
      description: `Created page '${data.title.trim()}' in website '${website.name}'`,
      metadata: {
        websiteId: website.publicId,
        websiteName: website.name,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    })

    return { _id: pageId, publicId }
  },
})

/**
 * Update a page
 */
export const updatePage = mutation({
  args: {
    pageId: v.id('websitePages'),
    data: v.object({
      title: v.optional(v.string()),
      slug: v.optional(v.string()),
      path: v.optional(v.string()),
      content: v.optional(v.string()),
      excerpt: v.optional(v.string()),
      status: v.optional(statusTypes.websitePage),
      templateType: v.optional(pageTemplateTypeValidator),
      layout: v.optional(layoutTypeValidator),
      parentPageId: v.optional(v.id('websitePages')),
      sections: v.optional(v.array(v.object({
        sectionId: v.id('websiteSections'),
        order: v.number(),
        settings: v.optional(v.object({
          fullWidth: v.optional(v.boolean()),
          backgroundColor: v.optional(v.string()),
          padding: v.optional(v.string()),
          margin: v.optional(v.string()),
        })),
      }))),
      seo: v.optional(v.object({
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        keywords: v.optional(v.array(v.string())),
        ogImage: v.optional(v.string()),
        ogType: v.optional(v.string()),
        canonical: v.optional(v.string()),
        noindex: v.optional(v.boolean()),
        nofollow: v.optional(v.boolean()),
      })),
      featuredImage: v.optional(v.object({
        url: v.string(),
        alt: v.optional(v.string()),
        caption: v.optional(v.string()),
      })),
      publishedAt: v.optional(v.number()),
      scheduledAt: v.optional(v.number()),
      settings: v.optional(v.object({
        showHeader: v.optional(v.boolean()),
        showFooter: v.optional(v.boolean()),
        customCss: v.optional(v.string()),
        customJs: v.optional(v.string()),
      })),
    }),
  },
  handler: async (ctx, { pageId, data }) => {
    const user = await requireCurrentUser(ctx)
    const page = await ctx.db.get(pageId)

    if (!page || page.deletedAt) {
      throw new Error('Page not found')
    }

    const website = await ctx.db.get(page.websiteId)
    if (!website || website.deletedAt) {
      throw new Error('Website not found')
    }

    await requireEditAccess(ctx, website, user)

    // Validate data
    const errors = validatePageData(data as any)
    if (errors.length > 0) {
      throw new Error(`Validation errors: ${errors.join(', ')}`)
    }

    // Trim string fields
    const trimmedData = {
      ...data,
      ...(data.title && { title: data.title.trim() }),
      ...(data.content && { content: data.content.trim() }),
      ...(data.excerpt && { excerpt: data.excerpt.trim() }),
      ...(data.slug && { slug: data.slug.trim() }),
      ...(data.path && { path: data.path.trim() }),
    }

    // Update page
    const now = Date.now()
    const updateData: Partial<WebsitePage> = {
      ...trimmedData,
      lastActivityAt: now,
      updatedAt: now,
      updatedBy: user._id,
    }
    await ctx.db.patch(pageId, updateData)

    // Update website activity
    await ctx.db.patch(page.websiteId, {
      lastActivityAt: now,
    })

    // Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'website.page.updated',
      entityType: 'system_website_page',
      entityId: page.publicId,
      entityTitle: page.title,
      description: `Updated page '${page.title}' in website '${website.name}'`,
      metadata: {
        websiteId: website.publicId,
        websiteName: website.name,
        changes: trimmedData,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    })

    return { _id: pageId }
  },
})

/**
 * Publish a page
 */
export const publishPage = mutation({
  args: { pageId: v.id('websitePages') },
  handler: async (ctx, { pageId }) => {
    const user = await requireCurrentUser(ctx)
    const page = await ctx.db.get(pageId)

    if (!page || page.deletedAt) {
      throw new Error('Page not found')
    }

    const website = await ctx.db.get(page.websiteId)
    if (!website || website.deletedAt) {
      throw new Error('Website not found')
    }

    await requirePublishAccess(ctx, website, user)

    const now = Date.now()
    await ctx.db.patch(pageId, {
      status: WEBSITE_CONSTANTS.PAGE_STATUS.PUBLISHED as WebsitePage['status'],
      publishedAt: now,
      lastActivityAt: now,
      updatedAt: now,
      updatedBy: user._id,
    })

    // Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'website.page.published',
      entityType: 'system_website_page',
      entityId: page.publicId,
      entityTitle: page.title,
      description: `Published page '${page.title}' in website '${website.name}'`,
      metadata: {
        websiteId: website.publicId,
        websiteName: website.name,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    })

    return { _id: pageId }
  },
})

/**
 * Delete a page (soft delete)
 */
export const deletePage = mutation({
  args: { pageId: v.id('websitePages') },
  handler: async (ctx, { pageId }) => {
    const user = await requireCurrentUser(ctx)
    const page = await ctx.db.get(pageId)

    if (!page || page.deletedAt) {
      throw new Error('Page not found')
    }

    const website = await ctx.db.get(page.websiteId)
    if (!website || website.deletedAt) {
      throw new Error('Website not found')
    }

    await requireEditAccess(ctx, website, user)

    const now = Date.now()
    await ctx.db.patch(pageId, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    })

    // Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'website.page.deleted',
      entityType: 'system_website_page',
      entityId: page.publicId,
      entityTitle: page.title,
      description: `Deleted page '${page.title}' from website '${website.name}'`,
      metadata: {
        websiteId: website.publicId,
        websiteName: website.name,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    })

    return { _id: pageId }
  },
})

/**
 * Create a new section
 */
export const createSection = mutation({
  args: {
    data: v.object({
      websiteId: v.id('websites'),
      name: v.string(),
      description: v.optional(v.string()),
      type: sectionTypeValidator,
      blocks: v.array(v.object({
        id: v.string(),
        type: blockTypeValidator,
        content: v.optional(v.any()),
        settings: v.optional(v.object({
          width: v.optional(v.string()),
          height: v.optional(v.string()),
          alignment: v.optional(v.string()),
          backgroundColor: v.optional(v.string()),
          padding: v.optional(v.string()),
          margin: v.optional(v.string()),
        })),
        order: v.number(),
      })),
      layout: v.optional(v.object({
        columns: v.optional(v.number()),
        gap: v.optional(v.string()),
        maxWidth: v.optional(v.string()),
      })),
      settings: v.optional(v.object({
        fullWidth: v.optional(v.boolean()),
        backgroundColor: v.optional(v.string()),
        backgroundImage: v.optional(v.string()),
        padding: v.optional(v.string()),
        margin: v.optional(v.string()),
        customCss: v.optional(v.string()),
      })),
      isTemplate: v.optional(v.boolean()),
      isGlobal: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, { data }) => {
    const user = await requireCurrentUser(ctx)
    const website = await ctx.db.get(data.websiteId)

    if (!website || website.deletedAt) {
      throw new Error('Website not found')
    }

    await requireEditAccess(ctx, website, user)

    // Validate data
    const errors = validateSectionData(data as any)
    if (errors.length > 0) {
      throw new Error(`Validation errors: ${errors.join(', ')}`)
    }

    // Generate public ID
    const publicId = await generateUniquePublicId(ctx, 'websiteSections')

    // Create section
    const now = Date.now()
    const sectionId = await ctx.db.insert('websiteSections', {
      publicId,
      websiteId: data.websiteId,
      name: data.name.trim(),
      description: data.description?.trim(),
      type: data.type as WebsiteSection['type'],
      blocks: data.blocks,
      layout: data.layout,
      settings: data.settings,
      isTemplate: data.isTemplate,
      isGlobal: data.isGlobal,
      lastActivityAt: now,
      createdAt: now,
      createdBy: user._id,
      metadata: {
        source: 'web',
        operation: 'create',
      },
    })

    // Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'website.section.created',
      entityType: 'system_website_section',
      entityId: publicId,
      entityTitle: data.name.trim(),
      description: `Created section '${data.name.trim()}' in website '${website.name}'`,
      metadata: {
        websiteId: website.publicId,
        websiteName: website.name,
        sectionType: data.type,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    })

    return { _id: sectionId, publicId }
  },
})

/**
 * Update a section
 */
export const updateSection = mutation({
  args: {
    sectionId: v.id('websiteSections'),
    data: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      type: v.optional(sectionTypeValidator),
      blocks: v.optional(v.array(v.object({
        id: v.string(),
        type: blockTypeValidator,
        content: v.optional(v.any()),
        settings: v.optional(v.object({
          width: v.optional(v.string()),
          height: v.optional(v.string()),
          alignment: v.optional(v.string()),
          backgroundColor: v.optional(v.string()),
          padding: v.optional(v.string()),
          margin: v.optional(v.string()),
        })),
        order: v.number(),
      }))),
      layout: v.optional(v.object({
        columns: v.optional(v.number()),
        gap: v.optional(v.string()),
        maxWidth: v.optional(v.string()),
      })),
      settings: v.optional(v.object({
        fullWidth: v.optional(v.boolean()),
        backgroundColor: v.optional(v.string()),
        backgroundImage: v.optional(v.string()),
        padding: v.optional(v.string()),
        margin: v.optional(v.string()),
        customCss: v.optional(v.string()),
      })),
      isTemplate: v.optional(v.boolean()),
      isGlobal: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, { sectionId, data }) => {
    const user = await requireCurrentUser(ctx)
    const section = await ctx.db.get(sectionId)

    if (!section || section.deletedAt) {
      throw new Error('Section not found')
    }

    const website = await ctx.db.get(section.websiteId)
    if (!website || website.deletedAt) {
      throw new Error('Website not found')
    }

    await requireEditAccess(ctx, website, user)

    // Validate data
    const errors = validateSectionData(data as any)
    if (errors.length > 0) {
      throw new Error(`Validation errors: ${errors.join(', ')}`)
    }

    // Trim string fields
    const trimmedData = {
      ...data,
      ...(data.name && { name: data.name.trim() }),
      ...(data.description && { description: data.description.trim() }),
    }

    // Update section
    const now = Date.now()
    const updateData: Partial<WebsiteSection> = {
      ...trimmedData,
      lastActivityAt: now,
      updatedAt: now,
      updatedBy: user._id,
    }
    await ctx.db.patch(sectionId, updateData)

    // Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'website.section.updated',
      entityType: 'system_website_section',
      entityId: section.publicId,
      entityTitle: section.name,
      description: `Updated section '${section.name}' in website '${website.name}'`,
      metadata: {
        websiteId: website.publicId,
        websiteName: website.name,
        changes: trimmedData,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    })

    return { _id: sectionId }
  },
})

/**
 * Delete a section (soft delete)
 */
export const deleteSection = mutation({
  args: { sectionId: v.id('websiteSections') },
  handler: async (ctx, { sectionId }) => {
    const user = await requireCurrentUser(ctx)
    const section = await ctx.db.get(sectionId)

    if (!section || section.deletedAt) {
      throw new Error('Section not found')
    }

    const website = await ctx.db.get(section.websiteId)
    if (!website || website.deletedAt) {
      throw new Error('Website not found')
    }

    await requireEditAccess(ctx, website, user)

    const now = Date.now()
    await ctx.db.patch(sectionId, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    })

    // Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'website.section.deleted',
      entityType: 'system_website_section',
      entityId: section.publicId,
      entityTitle: section.name,
      description: `Deleted section '${section.name}' from website '${website.name}'`,
      metadata: {
        websiteId: website.publicId,
        websiteName: website.name,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    })

    return { _id: sectionId }
  },
})

/**
 * Add collaborator to website
 */
export const addCollaborator = mutation({
  args: {
    websiteId: v.id('websites'),
    collaboratorId: v.id('userProfiles'),
    role: websiteCollaboratorRoleValidator,
    permissions: v.optional(v.object({
      canPublish: v.optional(v.boolean()),
      canEditPages: v.optional(v.boolean()),
      canEditTheme: v.optional(v.boolean()),
      canManageCollaborators: v.optional(v.boolean()),
      canDeleteWebsite: v.optional(v.boolean()),
    })),
  },
  handler: async (ctx, { websiteId, collaboratorId, role, permissions }) => {
    const user = await requireCurrentUser(ctx)
    const website = await ctx.db.get(websiteId)

    if (!website || website.deletedAt) {
      throw new Error('Website not found')
    }

    await requireCollaboratorManagementAccess(ctx, website, user)

    // Check if collaborator already exists (and not deleted)
    const existing = await ctx.db
      .query('websiteCollaborators')
      .withIndex('by_website_and_collaborator')
      .filter((q) =>
        q.and(
          q.eq(q.field('websiteId'), websiteId),
          q.eq(q.field('collaboratorId'), collaboratorId),
          q.eq(q.field('deletedAt'), undefined)
        )
      )
      .first()

    if (existing) {
      throw new Error('Collaborator already exists')
    }

    // Add collaborator
    const now = Date.now()
    const collaboratorRecordId = await ctx.db.insert('websiteCollaborators', {
      websiteId,
      collaboratorId,
      role,
      permissions,
      addedAt: now,
      addedBy: user._id,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
      metadata: {
        source: 'web',
        operation: 'add_collaborator',
      },
    })

    // Get collaborator profile for audit log
    const collaboratorProfile = await ctx.db.get(collaboratorId)

    // Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'website.collaborator.added',
      entityType: 'system_website',
      entityId: website.publicId,
      entityTitle: website.name,
      description: `Added ${collaboratorProfile?.name || 'user'} as ${role} to website '${website.name}'`,
      metadata: {
        collaboratorId: collaboratorProfile?.publicId,
        collaboratorName: collaboratorProfile?.name,
        role,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    })

    return { _id: collaboratorRecordId }
  },
})

/**
 * Remove collaborator from website
 */
export const removeCollaborator = mutation({
  args: {
    websiteId: v.id('websites'),
    collaboratorId: v.id('userProfiles'),
  },
  handler: async (ctx, { websiteId, collaboratorId }) => {
    const user = await requireCurrentUser(ctx)
    const website = await ctx.db.get(websiteId)

    if (!website || website.deletedAt) {
      throw new Error('Website not found')
    }

    await requireCollaboratorManagementAccess(ctx, website, user)

    // Find collaborator
    const collaboration = await ctx.db
      .query('websiteCollaborators')
      .withIndex('by_website_and_collaborator')
      .filter((q) =>
        q.and(
          q.eq(q.field('websiteId'), websiteId),
          q.eq(q.field('collaboratorId'), collaboratorId),
          q.eq(q.field('deletedAt'), undefined)
        )
      )
      .first()

    if (!collaboration) {
      throw new Error('Collaborator not found')
    }

    // Prevent removing the owner
    if (collaboration.role === 'owner') {
      throw new Error('Cannot remove the website owner')
    }

    // Soft delete collaborator
    const now = Date.now()
    await ctx.db.patch(collaboration._id, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    })

    // Get collaborator profile for audit log
    const collaboratorProfile = await ctx.db.get(collaboratorId)

    // Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'website.collaborator.removed',
      entityType: 'system_website',
      entityId: website.publicId,
      entityTitle: website.name,
      description: `Removed ${collaboratorProfile?.name || 'user'} from website '${website.name}'`,
      metadata: {
        collaboratorId: collaboratorProfile?.publicId,
        collaboratorName: collaboratorProfile?.name,
        role: collaboration.role,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    })

    return { _id: collaboration._id }
  },
})
