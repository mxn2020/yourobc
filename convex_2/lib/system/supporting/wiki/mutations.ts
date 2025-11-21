// convex/lib/system/supporting/wiki/mutations.ts

/**
 * Wiki Module Mutations
 * Write operations for creating, updating, and managing wiki entries
 */
import { mutation } from '@/generated/server'
import { v } from 'convex/values'
import { requireCurrentUser, requireOwnershipOrAdmin } from '@/shared/auth.helper'
import { wikiEntryTypeValidator, wikiStatusValidator, wikiVisibilityValidator } from '@/schema/base'
import { validateCreateWikiEntryData, validateUpdateWikiEntryData, generateSlug, createSearchableContent } from './utils'
import { generateUniquePublicId } from '@/shared/utils/publicId'

/**
 * Create a new wiki entry
 */
export const createWikiEntry = mutation({
  args: {
    
    data: v.object({
      title: v.string(),
      content: v.string(),
      summary: v.optional(v.string()),
      category: v.string(),
      type: wikiEntryTypeValidator,
      tags: v.optional(v.array(v.string())),
      visibility: v.optional(wikiVisibilityValidator),
    })
  },
  handler: async (ctx, { data }) => {
    const user = await requireCurrentUser(ctx)

    const errors = validateCreateWikiEntryData(data)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`)
    }

    const now = Date.now()
    const slug = generateSlug(data.title)

    // Check for duplicate slug
    const existingEntry = await ctx.db
      .query('wikiEntries')
      .withIndex('by_slug', (q) => q.eq('slug', slug))
      .first()

    if (existingEntry && !existingEntry.deletedAt) {
      throw new Error('An entry with this title already exists')
    }

    const tags = data.tags || []
    const searchableContent = createSearchableContent(data.title, data.content, tags, data.summary)
    const publicId = await generateUniquePublicId(ctx, 'wikiEntries')

    const entryData = {
      publicId,
      title: data.title.trim(),
      slug,
      content: data.content,
      summary: data.summary,
      category: data.category.trim(),
      tags,
      type: data.type,
      visibility: data.visibility || 'private',
      status: 'draft' as const,
      searchableContent,
      viewCount: 0,
      createdBy: user._id,
      createdAt: now,
    }

    return await ctx.db.insert('wikiEntries', entryData)
  },
})

/**
 * Update an existing wiki entry
 */
export const updateWikiEntry = mutation({
  args: {
    
    entryId: v.id('wikiEntries'),
    data: v.object({
      title: v.optional(v.string()),
      content: v.optional(v.string()),
      summary: v.optional(v.string()),
      category: v.optional(v.string()),
      type: v.optional(wikiEntryTypeValidator),
      tags: v.optional(v.array(v.string())),
      visibility: v.optional(wikiVisibilityValidator),
      status: v.optional(wikiStatusValidator),
    })
  },
  handler: async (ctx, { entryId, data }) => {
    const user = await requireCurrentUser(ctx)

    const entry = await ctx.db.get(entryId)
    if (!entry || entry.deletedAt) {
      throw new Error('Wiki entry not found')
    }

    const errors = validateUpdateWikiEntryData(data)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`)
    }

    const now = Date.now()
    const updateData: Record<string, unknown> = {
      updatedAt: now,
      updatedBy: user._id,
    }

    // Update slug if title changed
    if (data.title && data.title !== entry.title) {
      const newSlug = generateSlug(data.title)
      const existingEntry = await ctx.db
        .query('wikiEntries')
        .withIndex('by_slug', (q) => q.eq('slug', newSlug))
        .first()

      if (existingEntry && existingEntry._id !== entryId && !existingEntry.deletedAt) {
        throw new Error('An entry with this title already exists')
      }

      updateData.slug = newSlug
      updateData.title = data.title.trim()
    }

    if (data.content !== undefined) {
      updateData.content = data.content
    }

    if (data.summary !== undefined) {
      updateData.summary = data.summary
    }

    if (data.category !== undefined) {
      updateData.category = data.category.trim()
    }

    if (data.type !== undefined) {
      updateData.type = data.type
    }

    if (data.tags !== undefined) {
      updateData.tags = data.tags
    }

    if (data.visibility !== undefined) {
      updateData.visibility = data.visibility
    }

    if (data.status !== undefined) {
      updateData.status = data.status
    }

    // Update searchable content if title, content, summary, or tags changed
    if (data.title || data.content || data.summary || data.tags) {
      const title = data.title || entry.title
      const content = data.content || entry.content
      const tags = data.tags || entry.tags
      const summary = data.summary !== undefined ? data.summary : entry.summary
      updateData.searchableContent = createSearchableContent(title, content, tags, summary)
    }

    await ctx.db.patch(entryId, updateData)
    return entryId
  },
})

/**
 * Publish a wiki entry
 */
export const publishWikiEntry = mutation({
  args: {
    
    entryId: v.id('wikiEntries'),
  },
  handler: async (ctx, { entryId }) => {
    const user = await requireCurrentUser(ctx)

    const entry = await ctx.db.get(entryId)
    if (!entry || entry.deletedAt) {
      throw new Error('Wiki entry not found')
    }

    if (entry.status === 'published') {
      throw new Error('Entry is already published')
    }

    const now = Date.now()

    await ctx.db.patch(entryId, {
      status: 'published' as const,
      updatedAt: now,
      updatedBy: user._id,
    })

    return entryId
  },
})

/**
 * Archive a wiki entry
 */
export const archiveWikiEntry = mutation({
  args: {
    
    entryId: v.id('wikiEntries'),
  },
  handler: async (ctx, { entryId }) => {
    const user = await requireCurrentUser(ctx)

    const entry = await ctx.db.get(entryId)
    if (!entry || entry.deletedAt) {
      throw new Error('Wiki entry not found')
    }

    const now = Date.now()

    await ctx.db.patch(entryId, {
      status: 'archived' as const,
      updatedAt: now,
      updatedBy: user._id,
    })

    return entryId
  },
})

/**
 * Increment wiki entry view count
 */
export const incrementWikiEntryViews = mutation({
  args: {
    entryId: v.id('wikiEntries'),
  },
  handler: async (ctx, { entryId }) => {
    await requireCurrentUser(ctx)

    const entry = await ctx.db.get(entryId)
    if (!entry || entry.deletedAt) {
      throw new Error('Wiki entry not found')
    }

    await ctx.db.patch(entryId, {
      viewCount: (entry.viewCount || 0) + 1,
      lastViewedAt: Date.now(),
    })

    return entryId
  },
})

/**
 * Delete a wiki entry (soft delete)
 */
export const deleteWikiEntry = mutation({
  args: {
    
    entryId: v.id('wikiEntries'),
  },
  handler: async (ctx, { entryId }) => {
    const user = await requireCurrentUser(ctx)

    const entry = await ctx.db.get(entryId)
    if (!entry || entry.deletedAt) {
      throw new Error('Wiki entry not found')
    }

    // Check if user created the entry OR is admin/superadmin
    await requireOwnershipOrAdmin(ctx, entry.createdBy)

    const now = Date.now()

    await ctx.db.patch(entryId, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    })

    return entryId
  },
})
