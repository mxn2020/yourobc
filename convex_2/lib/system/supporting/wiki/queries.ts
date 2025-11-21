// convex/lib/system/supporting/wiki/queries.ts

/**
 * Wiki Module Queries
 * Read-only operations for fetching wiki entry data
 */
import { query } from '@/generated/server'
import { v } from 'convex/values'
import { requireCurrentUser } from '@/shared/auth.helper'
import { wikiEntryTypeValidator, wikiStatusValidator, wikiVisibilityValidator } from '@/schema/base'
import { searchWikiEntries as searchWikiEntriesUtil } from './utils'

/**
 * Get wiki entries with filtering and pagination
 */
export const getWikiEntries = query({
  args: {
    
    filters: v.optional(v.object({
      category: v.optional(v.string()),
      type: v.optional(v.array(wikiEntryTypeValidator)),
      status: v.optional(v.array(wikiStatusValidator)),
      visibility: v.optional(v.array(wikiVisibilityValidator)),
      searchQuery: v.optional(v.string()),
    })),
    options: v.optional(v.object({
      limit: v.optional(v.number()),
      offset: v.optional(v.number()),
    }))
  },
  handler: async (ctx, { filters = {}, options = {} }) => {
    const user = await requireCurrentUser(ctx)

    const { limit = 50, offset = 0 } = options

    let entries = await ctx.db.query('wikiEntries').collect()

    // Filter out deleted entries
    entries = entries.filter(e => !e.deletedAt)

    // Permission filtering: users can see public, internal (if authenticated), and their own private entries
    entries = entries.filter(e => {
      if (e.visibility === 'public') return true
      if (e.visibility === 'internal') return true // User is authenticated (requireCurrentUser)
      if (e.visibility === 'private') return e.createdBy === user._id
      return false
    })

    // Apply filters
    if (filters.category) {
      entries = entries.filter(e => e.category === filters.category)
    }

    if (filters.type && filters.type.length > 0) {
      entries = entries.filter(e => filters.type!.includes(e.type))
    }

    if (filters.status && filters.status.length > 0) {
      entries = entries.filter(e => filters.status!.includes(e.status))
    }

    if (filters.visibility && filters.visibility.length > 0) {
      entries = entries.filter(e => filters.visibility!.includes(e.visibility))
    }

    // Apply search if provided
    if (filters.searchQuery) {
      entries = searchWikiEntriesUtil(entries, filters.searchQuery)
    }

    // Sort by creation date (newest first)
    entries.sort((a, b) => b.createdAt - a.createdAt)

    return {
      entries: entries.slice(offset, offset + limit),
      total: entries.length,
      hasMore: entries.length > offset + limit,
    }
  },
})

/**
 * Get a single wiki entry by ID
 */
export const getWikiEntry = query({
  args: {
    entryId: v.id('wikiEntries'),
    
  },
  handler: async (ctx, { entryId }) => {
    const user = await requireCurrentUser(ctx)

    const entry = await ctx.db.get(entryId)
    if (!entry || entry.deletedAt) {
      throw new Error('Wiki entry not found')
    }

    // Check visibility permissions
    if (entry.visibility === 'private' && entry.createdBy !== user._id) {
      throw new Error('Wiki entry not found') // Don't reveal existence of private entries
    }
    // Public and internal entries are accessible to authenticated users

    return entry
  },
})

/**
 * Get a wiki entry by slug
 */
export const getWikiEntryBySlug = query({
  args: {
    slug: v.string(),
    
  },
  handler: async (ctx, { slug }) => {
    const user = await requireCurrentUser(ctx)

    const entry = await ctx.db
      .query('wikiEntries')
      .withIndex('by_slug', (q) => q.eq('slug', slug))
      .first()

    if (!entry || entry.deletedAt) {
      throw new Error('Wiki entry not found')
    }

    // Check visibility permissions
    if (entry.visibility === 'private' && entry.createdBy !== user._id) {
      throw new Error('Wiki entry not found') // Don't reveal existence of private entries
    }
    // Public and internal entries are accessible to authenticated users

    return entry
  },
})

/**
 * Search wiki entries by term
 */
export const searchWiki = query({
  args: {
    
    searchTerm: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { searchTerm, limit = 20 }) => {
    const user = await requireCurrentUser(ctx)

    if (searchTerm.length < 2) {
      return []
    }

    let entries = await ctx.db.query('wikiEntries').collect()

    // Filter out deleted
    entries = entries.filter(e => !e.deletedAt)

    // Permission filtering
    entries = entries.filter(e => {
      if (e.visibility === 'public') return true
      if (e.visibility === 'internal') return true
      if (e.visibility === 'private') return e.createdBy === user._id
      return false
    })

    // Search
    entries = searchWikiEntriesUtil(entries, searchTerm)

    // Limit results
    return entries.slice(0, limit)
  },
})

/**
 * Get all unique categories with entry counts
 */
export const getWikiCategories = query({
  args: {
    
  },
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx)

    let entries = await ctx.db.query('wikiEntries').collect()

    // Filter out deleted
    entries = entries.filter(e => !e.deletedAt)

    // Permission filtering
    entries = entries.filter(e => {
      if (e.visibility === 'public') return true
      if (e.visibility === 'internal') return true
      if (e.visibility === 'private') return e.createdBy === user._id
      return false
    })

    // Get unique categories
    const categoryMap = new Map<string, number>()

    entries.forEach(entry => {
      const count = categoryMap.get(entry.category) || 0
      categoryMap.set(entry.category, count + 1)
    })

    return Array.from(categoryMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  },
})

/**
 * Get published wiki entries (public access)
 */
export const getPublishedWikiEntries = query({
  args: {
    
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { category, limit = 20 }) => {
    const user = await requireCurrentUser(ctx)

    let entries = await ctx.db
      .query('wikiEntries')
      .withIndex('by_status', (q) => q.eq('status', 'published'))
      .collect()

    // Filter out deleted
    entries = entries.filter(e => !e.deletedAt)

    // Permission filtering
    entries = entries.filter(e => {
      if (e.visibility === 'public') return true
      if (e.visibility === 'internal') return true
      if (e.visibility === 'private') return e.createdBy === user._id
      return false
    })

    // Filter by category if provided
    if (category) {
      entries = entries.filter(e => e.category === category)
    }

    // Sort by creation date (newest first)
    entries.sort((a, b) => b.createdAt - a.createdAt)

    // Apply limit
    return entries.slice(0, limit)
  },
})

/**
 * Get popular wiki entries (by view count)
 */
export const getPopularWikiEntries = query({
  args: {
    
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { limit = 10 }) => {
    const user = await requireCurrentUser(ctx)

    let entries = await ctx.db
      .query('wikiEntries')
      .withIndex('by_status', (q) => q.eq('status', 'published'))
      .collect()

    // Filter out deleted
    entries = entries.filter(e => !e.deletedAt)

    // Permission filtering
    entries = entries.filter(e => {
      if (e.visibility === 'public') return true
      if (e.visibility === 'internal') return true
      if (e.visibility === 'private') return e.createdBy === user._id
      return false
    })

    // Sort by view count
    entries.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))

    // Apply limit
    return entries.slice(0, limit)
  },
})

/**
 * Search wiki entries by query string with pagination
 */
export const searchWikiEntries = query({
  args: {
    
    searchQuery: v.string(),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, { searchQuery, limit = 50, offset = 0 }) => {
    const user = await requireCurrentUser(ctx)

    if (searchQuery.length < 2) {
      return {
        entries: [],
        total: 0,
        hasMore: false,
      }
    }

    let entries = await ctx.db.query('wikiEntries').collect()

    // Filter out deleted entries
    entries = entries.filter(e => !e.deletedAt)

    // Permission filtering
    entries = entries.filter(e => {
      if (e.visibility === 'public') return true
      if (e.visibility === 'internal') return true
      if (e.visibility === 'private') return e.createdBy === user._id
      return false
    })

    // Apply search using utility function
    entries = searchWikiEntriesUtil(entries, searchQuery)

    // Sort by creation date (newest first)
    entries.sort((a, b) => b.createdAt - a.createdAt)

    return {
      entries: entries.slice(offset, offset + limit),
      total: entries.length,
      hasMore: entries.length > offset + limit,
    }
  },
})

/**
 * Get wiki entries by category with pagination
 */
export const getWikiEntriesByCategory = query({
  args: {
    
    category: v.string(),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, { category, limit = 50, offset = 0 }) => {
    const user = await requireCurrentUser(ctx)

    let entries = await ctx.db
      .query('wikiEntries')
      .withIndex('by_category', (q) => q.eq('category', category))
      .collect()

    // Filter out deleted entries
    entries = entries.filter(e => !e.deletedAt)

    // Permission filtering
    entries = entries.filter(e => {
      if (e.visibility === 'public') return true
      if (e.visibility === 'internal') return true
      if (e.visibility === 'private') return e.createdBy === user._id
      return false
    })

    // Sort by creation date (newest first)
    entries.sort((a, b) => b.createdAt - a.createdAt)

    return {
      entries: entries.slice(offset, offset + limit),
      total: entries.length,
      hasMore: entries.length > offset + limit,
    }
  },
})
