// convex/lib/boilerplate/websites/queries.ts

import { query } from '@/generated/server'
import { v } from 'convex/values'
import { requireCurrentUser } from '@/shared/auth.helper'
import { WEBSITE_CONSTANTS } from './constants'
import { canViewWebsite, filterWebsitesByAccess, requireViewAccess } from './permissions'
import type { WebsitesListOptions, PagesListOptions, WebsiteStats, Website, WebsitePage } from './types'

/**
 * Get all websites with filtering and pagination
 */
export const getWebsites = query({
  args: {
    options: v.optional(
      v.object({
        limit: v.optional(v.number()),
        offset: v.optional(v.number()),
        sortBy: v.optional(v.union(v.literal('createdAt'), v.literal('updatedAt'), v.literal('lastActivityAt'), v.literal('name'))),
        sortOrder: v.optional(v.union(v.literal('asc'), v.literal('desc'))),
        filters: v.optional(
          v.object({
            status: v.optional(v.array(v.string())),
            visibility: v.optional(v.array(v.string())),
            ownerId: v.optional(v.string()),
            collaboratorId: v.optional(v.string()),
            search: v.optional(v.string()),
          })
        ),
      })
    ),
  },
  handler: async (ctx, { options = {} }) => {
    const user = await requireCurrentUser(ctx)
    const { limit = 50, offset = 0, sortBy = 'createdAt', sortOrder = 'desc', filters = {} } = options

    let websites: any[] = []

    // Strategy: Use indexes when possible, fall back to full scan
    if (filters.ownerId) {
      // Use owner index for efficient querying
      websites = await ctx.db
        .query('websites')
        .withIndex('by_owner', (q) => q.eq('ownerId', filters.ownerId))
        .order(sortOrder === 'desc' ? 'desc' : 'asc')
        .collect()
    } else if (filters.status?.length === 1) {
      // Use status index if filtering by single status
      websites = await ctx.db
        .query('websites')
        .withIndex('by_status', (q) => q.eq('status', filters.status![0] as Website['status']))
        .order(sortOrder === 'desc' ? 'desc' : 'asc')
        .collect()
    } else if (filters.visibility?.length === 1) {
      // Use visibility index if filtering by single visibility
      websites = await ctx.db
        .query('websites')
        .withIndex('by_visibility', (q) => q.eq('visibility', filters.visibility![0] as Website['visibility']))
        .order(sortOrder === 'desc' ? 'desc' : 'asc')
        .collect()
    } else {
      // Fall back to collecting all websites
      websites = await ctx.db
        .query('websites')
        .order(sortOrder === 'desc' ? 'desc' : 'asc')
        .collect()
    }

    // Filter out deleted websites
    websites = websites.filter((w) => !w.deletedAt)

    // Apply in-memory filters
    if (filters.status && filters.status.length > 1) {
      websites = websites.filter((w) => filters.status!.includes(w.status))
    }

    if (filters.visibility && filters.visibility.length > 1) {
      websites = websites.filter((w) => filters.visibility!.includes(w.visibility))
    }

    if (filters.ownerId && websites.length > 0 && websites[0].ownerId !== filters.ownerId) {
      // Only apply if not already filtered by index
      websites = websites.filter((w) => w.ownerId === filters.ownerId)
    }

    if (filters.collaboratorId) {
      // Get websites where user is a collaborator
      const collaborations = await ctx.db
        .query('websiteCollaborators')
        .withIndex('by_collaborator')
        .filter((q) => q.eq(q.field('collaboratorId'), filters.collaboratorId))
        .collect()
      const websiteIds = new Set(collaborations.map((c) => c.websiteId))
      websites = websites.filter((w) => websiteIds.has(w._id))
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      websites = websites.filter(
        (w) =>
          w.name.toLowerCase().includes(searchLower) ||
          w.description?.toLowerCase().includes(searchLower)
      )
    }

    // 🔒 Filter by access permissions
    const accessibleWebsites = await filterWebsitesByAccess(ctx, websites, user)

    // Sort (already ordered by index if possible, but re-sort if needed)
    if (sortBy !== 'createdAt' || !['ownerId', 'status', 'visibility'].some(f =>
      (filters as any)[f]?.length === 1 || (filters as any)[f]
    )) {
      accessibleWebsites.sort((a, b) => {
        const aVal = (a as any)[sortBy]
        const bVal = (b as any)[sortBy]
        if (aVal === undefined || bVal === undefined) return 0
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
        return sortOrder === 'asc' ? comparison : -comparison
      })
    }

    // Pagination
    const total = accessibleWebsites.length
    const paginatedWebsites = accessibleWebsites.slice(offset, offset + limit)

    return {
      websites: paginatedWebsites,
      total,
      hasMore: total > offset + limit,
    }
  },
})

/**
 * Get a single website by ID
 * 🔒 Authentication: Required
 * 🔒 Authorization: User must have access to view website
 */
export const getWebsite = query({
  args: { websiteId: v.id('websites') },
  handler: async (ctx, { websiteId }) => {
    const user = await requireCurrentUser(ctx)
    const website = await ctx.db.get(websiteId)

    if (!website || website.deletedAt) {
      throw new Error('Website not found')
    }

    await requireViewAccess(ctx, website, user)

    // Fetch collaborators with their details
    const collaborators = await ctx.db
      .query('websiteCollaborators')
      .withIndex('by_website', (q) => q.eq('websiteId', websiteId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect()

    const collaboratorDetails = await Promise.all(
      collaborators.map(async (collab) => {
        const userProfile = await ctx.db.get(collab.collaboratorId)
        return {
          userId: collab.collaboratorId,
          role: collab.role,
          permissions: collab.permissions,
          addedAt: collab.addedAt,
          name: userProfile?.name,
          email: userProfile?.email,
        }
      })
    )

    // Add computed fields
    return {
      ...website,
      isPublished: website.status === WEBSITE_CONSTANTS.STATUS.PUBLISHED,
      collaboratorDetails,
    }
  },
})

/**
 * Get a website by public ID
 * 🔒 Authentication: Required
 * 🔒 Authorization: User must have access to view website
 */
export const getWebsiteByPublicId = query({
  args: { publicId: v.string() },
  handler: async (ctx, { publicId }) => {
    const user = await requireCurrentUser(ctx)
    const website = await ctx.db
      .query('websites')
      .withIndex('by_public_id', (q) => q.eq('publicId', publicId))
      .first()

    if (!website || website.deletedAt) {
      throw new Error('Website not found')
    }

    await requireViewAccess(ctx, website, user)

    // Add computed fields
    return {
      ...website,
      isPublished: website.status === WEBSITE_CONSTANTS.STATUS.PUBLISHED,
    }
  },
})

/**
 * Get pages for a website
 */
export const getWebsitePages = query({
  args: {
    websiteId: v.id('websites'),
    options: v.optional(
      v.object({
        limit: v.optional(v.number()),
        offset: v.optional(v.number()),
        sortBy: v.optional(v.string()),
        sortOrder: v.optional(v.union(v.literal('asc'), v.literal('desc'))),
        filters: v.optional(
          v.object({
            status: v.optional(v.array(v.string())),
            templateType: v.optional(v.array(v.string())),
            parentPageId: v.optional(v.id('websitePages')),
            search: v.optional(v.string()),
          })
        ),
      })
    ),
  },
  handler: async (ctx, { websiteId, options = {} }) => {
    const user = await requireCurrentUser(ctx)
    const website = await ctx.db.get(websiteId)

    if (!website || website.deletedAt) {
      throw new Error('Website not found')
    }

    await requireViewAccess(ctx, website, user)

    const { limit = 50, offset = 0, sortBy = 'createdAt', sortOrder = 'desc', filters = {} } = options

    let pages = await ctx.db
      .query('websitePages')
      .withIndex('by_website')
      .filter((q) => q.eq(q.field('websiteId'), websiteId))
      .collect()

    // Filter out deleted pages
    pages = pages.filter((p) => !p.deletedAt)

    // Apply filters
    if (filters.status && filters.status.length > 0) {
      pages = pages.filter((p) => filters.status!.includes(p.status))
    }

    if (filters.templateType && filters.templateType.length > 0) {
      pages = pages.filter((p) => filters.templateType!.includes(p.templateType))
    }

    if (filters.parentPageId !== undefined) {
      pages = pages.filter((p) => p.parentPageId === filters.parentPageId)
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      pages = pages.filter(
        (p) =>
          p.title.toLowerCase().includes(searchLower) ||
          p.excerpt?.toLowerCase().includes(searchLower)
      )
    }

    // Sort
    pages.sort((a, b) => {
      const aVal = (a as any)[sortBy]
      const bVal = (b as any)[sortBy]
      if (aVal === undefined || bVal === undefined) return 0
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      return sortOrder === 'asc' ? comparison : -comparison
    })

    // Paginate
    const paginatedPages = pages.slice(offset, offset + limit)

    return {
      pages: paginatedPages,
      total: pages.length,
      hasMore: offset + limit < pages.length,
    }
  },
})

/**
 * Get a single page by ID
 */
export const getPage = query({
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

    await requireViewAccess(ctx, website, user)

    return page
  },
})

/**
 * Get page with populated sections
 */
export const getPageWithSections = query({
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

    await requireViewAccess(ctx, website, user)

    // Get all sections for this page
    const sections = await Promise.all(
      page.sections.map(async (s) => {
        const section = await ctx.db.get(s.sectionId)
        return section
      })
    )

    return {
      ...page,
      populatedSections: sections.filter((s) => s !== null && !s.deletedAt),
    }
  },
})

/**
 * Get sections for a website
 */
export const getWebsiteSections = query({
  args: {
    websiteId: v.id('websites'),
    type: v.optional(v.string()),
  },
  handler: async (ctx, { websiteId, type }) => {
    const user = await requireCurrentUser(ctx)
    const website = await ctx.db.get(websiteId)

    if (!website || website.deletedAt) {
      throw new Error('Website not found')
    }

    await requireViewAccess(ctx, website, user)

    let sections = await ctx.db
      .query('websiteSections')
      .withIndex('by_website')
      .filter((q) => q.eq(q.field('websiteId'), websiteId))
      .collect()

    // Filter out deleted sections
    sections = sections.filter((s) => !s.deletedAt)

    // Filter by type if provided
    if (type) {
      sections = sections.filter((s) => s.type === type)
    }

    return sections
  },
})

/**
 * Get a single section by ID
 */
export const getSection = query({
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

    await requireViewAccess(ctx, website, user)

    return section
  },
})

/**
 * Get themes (system and user-created)
 */
export const getThemes = query({
  args: {
    includeSystem: v.optional(v.boolean()),
    includePublic: v.optional(v.boolean()),
  },
  handler: async (ctx, { includeSystem = true, includePublic = true }) => {
    const user = await requireCurrentUser(ctx)

    let themes = await ctx.db.query('websiteThemes').collect()

    // Filter out deleted themes
    themes = themes.filter((t) => !t.deletedAt)

    // Filter based on options
    themes = themes.filter((t) => {
      // Include system themes
      if (t.isSystem && includeSystem) return true

      // Include public themes
      if (t.isPublic && includePublic) return true

      // Include user's own themes
      if (t.ownerId === user._id) return true

      return false
    })

    return themes
  },
})

/**
 * Get a single theme by ID
 */
export const getTheme = query({
  args: { themeId: v.id('websiteThemes') },
  handler: async (ctx, { themeId }) => {
    const user = await requireCurrentUser(ctx)
    const theme = await ctx.db.get(themeId)

    if (!theme || theme.deletedAt) {
      throw new Error('Theme not found')
    }

    // Check access - can view if system, public, or own theme
    if (!theme.isSystem && !theme.isPublic && theme.ownerId !== user._id) {
      throw new Error('You do not have permission to view this theme')
    }

    return theme
  },
})

/**
 * Get templates
 */
export const getTemplates = query({
  args: {
    category: v.optional(v.string()),
    includeSystem: v.optional(v.boolean()),
    includePublic: v.optional(v.boolean()),
  },
  handler: async (ctx, { category, includeSystem = true, includePublic = true }) => {
    const user = await requireCurrentUser(ctx)

    let templates = await ctx.db.query('websiteTemplates').collect()

    // Filter out deleted templates
    templates = templates.filter((t) => !t.deletedAt)

    // Filter by category if provided
    if (category) {
      templates = templates.filter((t) => t.category === category)
    }

    // Filter based on access
    templates = templates.filter((t) => {
      if (t.isSystem && includeSystem) return true
      if (t.isPublic && includePublic) return true
      if (t.ownerId === user._id) return true
      return false
    })

    return templates
  },
})

/**
 * Get website stats for a user
 */
export const getWebsiteStats = query({
  args: { targetUserId: v.optional(v.id('userProfiles')) },
  handler: async (ctx, { targetUserId }) => {
    const user = await requireCurrentUser(ctx)
    const userId = targetUserId || user._id

    // Get all websites for the user
    const websites = await ctx.db
      .query('websites')
      .withIndex('by_owner')
      .filter((q) => q.eq(q.field('ownerId'), userId))
      .collect()

    const activeWebsites = websites.filter((w) => !w.deletedAt)

    // Count by status
    const websitesByStatus = {
      draft: 0,
      published: 0,
      archived: 0,
      maintenance: 0,
    }

    activeWebsites.forEach((w) => {
      websitesByStatus[w.status]++
    })

    // Get total pages
    let totalPages = 0
    let publishedPages = 0

    for (const website of activeWebsites) {
      const pages = await ctx.db
        .query('websitePages')
        .withIndex('by_website')
        .filter((q) => q.eq(q.field('websiteId'), website._id))
        .collect()

      totalPages += pages.filter((p) => !p.deletedAt).length
      publishedPages += pages.filter((p) => !p.deletedAt && p.status === 'published').length
    }

    // Get sections and themes count
    const sections = await ctx.db
      .query('websiteSections')
      .filter((q) => q.eq(q.field('websiteId'), activeWebsites[0]?._id))
      .collect()

    const themes = await ctx.db
      .query('websiteThemes')
      .withIndex('by_owner')
      .filter((q) => q.eq(q.field('ownerId'), userId))
      .collect()

    const templates = await ctx.db
      .query('websiteTemplates')
      .withIndex('by_owner')
      .filter((q) => q.eq(q.field('ownerId'), userId))
      .collect()

    const stats: WebsiteStats = {
      totalWebsites: activeWebsites.length,
      publishedWebsites: websitesByStatus.published,
      draftWebsites: websitesByStatus.draft,
      archivedWebsites: websitesByStatus.archived,
      totalPages,
      publishedPages,
      totalSections: sections.filter((s) => !s.deletedAt).length,
      totalThemes: themes.filter((t) => !t.deletedAt).length,
      totalTemplates: templates.filter((t) => !t.deletedAt).length,
      websitesByStatus,
    }

    return stats
  },
})

/**
 * Get website collaborators
 */
export const getWebsiteCollaborators = query({
  args: { websiteId: v.id('websites') },
  handler: async (ctx, { websiteId }) => {
    const user = await requireCurrentUser(ctx)
    const website = await ctx.db.get(websiteId)

    if (!website || website.deletedAt) {
      throw new Error('Website not found')
    }

    await requireViewAccess(ctx, website, user)

    const collaborators = await ctx.db
      .query('websiteCollaborators')
      .withIndex('by_website')
      .filter((q) =>
        q.and(
          q.eq(q.field('websiteId'), websiteId),
          q.eq(q.field('deletedAt'), undefined)
        )
      )
      .collect()

    // Get user profiles for each collaborator
    const collaboratorsWithProfiles = await Promise.all(
      collaborators.map(async (c) => {
        const profile = await ctx.db.get(c.collaboratorId)
        return {
          ...c,
          profile,
        }
      })
    )

    return collaboratorsWithProfiles
  },
})

/**
 * Get user's own websites (owned + collaborated)
 * 🔒 Authentication: Required
 * ✅ Scalable: Uses indexed queries, no full table scans
 */
export const getUserWebsites = query({
  args: {
    targetUserId: v.optional(v.id('userProfiles')),
    includeArchived: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { targetUserId, includeArchived = false, limit = 100 }) => {
    const user = await requireCurrentUser(ctx)
    const userId = targetUserId || user._id

    // Only allow viewing own websites unless admin
    if (
      userId !== user._id &&
      user.role !== 'admin' &&
      user.role !== 'superadmin'
    ) {
      throw new Error('Permission denied: You can only view your own websites')
    }

    // 1. Owned websites - using index (FAST)
    let ownedQuery = ctx.db
      .query('websites')
      .withIndex('by_owner', (q) => q.eq('ownerId', userId))
      .order('desc')

    if (!includeArchived) {
      ownedQuery = ownedQuery.filter((q) =>
        q.and(
          q.neq(q.field('status'), WEBSITE_CONSTANTS.STATUS.ARCHIVED),
          q.eq(q.field('deletedAt'), undefined)
        )
      )
    } else {
      ownedQuery = ownedQuery.filter((q) => q.eq(q.field('deletedAt'), undefined))
    }

    const ownedWebsites = await ownedQuery.take(limit)

    // 2. Collaborated websites - using websiteCollaborators table index (FAST)
    const collaborations = await ctx.db
      .query('websiteCollaborators')
      .withIndex('by_collaborator', (q) => q.eq('collaboratorId', userId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .order('desc')
      .take(limit)

    // 3. Fetch the actual websites (batched, efficient)
    const collaboratedWebsitesWithNull = await Promise.all(
      collaborations.map((collab) => ctx.db.get(collab.websiteId))
    )

    // 4. Filter out nulls and apply archive filter
    let collaboratedWebsites = collaboratedWebsitesWithNull.filter(
      (w): w is NonNullable<typeof w> => w !== null && w.ownerId !== userId && !w.deletedAt
    )

    if (!includeArchived) {
      collaboratedWebsites = collaboratedWebsites.filter(
        (w) => w.status !== WEBSITE_CONSTANTS.STATUS.ARCHIVED
      )
    }

    // 5. Calculate stats
    const stats = {
      totalOwned: ownedWebsites.length,
      totalCollaborated: collaboratedWebsites.length,
      publishedOwned: ownedWebsites.filter(
        (w) => w.status === WEBSITE_CONSTANTS.STATUS.PUBLISHED
      ).length,
      publishedCollaborated: collaboratedWebsites.filter(
        (w) => w.status === WEBSITE_CONSTANTS.STATUS.PUBLISHED
      ).length,
      draftOwned: ownedWebsites.filter(
        (w) => w.status === WEBSITE_CONSTANTS.STATUS.DRAFT
      ).length,
      draftCollaborated: collaboratedWebsites.filter(
        (w) => w.status === WEBSITE_CONSTANTS.STATUS.DRAFT
      ).length,
    }

    return {
      owned: ownedWebsites,
      collaborated: collaboratedWebsites,
      stats,
    }
  },
})

/**
 * Get dashboard stats
 * 🔒 Authentication: Optional (returns null if not authenticated)
 */
export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    // Use getCurrentUser (not requireCurrentUser) for optional auth
    const user = await ctx.auth.getUserIdentity()
    if (!user) return null

    // Get user profile
    const userProfile = await ctx.db
      .query('userProfiles')
      .withIndex('by_token_identifier', (q) => q.eq('tokenIdentifier', user.tokenIdentifier))
      .first()

    if (!userProfile) return null

    // Fetch user's websites
    const ownedWebsites = await ctx.db
      .query('websites')
      .withIndex('by_owner', (q) => q.eq('ownerId', userProfile._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect()

    // Calculate basic stats
    const now = Date.now()
    const totalWebsites = ownedWebsites.length
    const publishedWebsites = ownedWebsites.filter(
      (w) => w.status === WEBSITE_CONSTANTS.STATUS.PUBLISHED
    ).length
    const draftWebsites = ownedWebsites.filter(
      (w) => w.status === WEBSITE_CONSTANTS.STATUS.DRAFT
    ).length
    const archivedWebsites = ownedWebsites.filter(
      (w) => w.status === WEBSITE_CONSTANTS.STATUS.ARCHIVED
    ).length

    // Count total pages across all websites
    let totalPages = 0
    let publishedPages = 0
    for (const website of ownedWebsites) {
      const pages = await ctx.db
        .query('websitePages')
        .withIndex('by_website')
        .filter((q) =>
          q.and(
            q.eq(q.field('websiteId'), website._id),
            q.eq(q.field('deletedAt'), undefined)
          )
        )
        .collect()

      totalPages += pages.length
      publishedPages += pages.filter((p) => p.status === WEBSITE_CONSTANTS.PAGE_STATUS.PUBLISHED).length
    }

    return {
      totalWebsites,
      publishedWebsites,
      draftWebsites,
      archivedWebsites,
      totalPages,
      publishedPages,
    }
  },
})
