// convex/lib/yourobc/supporting/wiki/mutations.ts
// convex/yourobc/supporting/wiki/mutations.ts
import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { validateWikiEntryData, generateSlug } from './utils';

export const createWikiEntry = mutation({
  args: {
    authUserId: v.string(),
    data: v.object({
      title: v.string(),
      content: v.string(),
      category: v.string(),
      type: v.union(v.literal('sop'), v.literal('airline_rules'), v.literal('partner_info'), v.literal('procedure')),
      tags: v.optional(v.array(v.string())),
      isPublic: v.optional(v.boolean()),
    })
  },
  handler: async (ctx, { authUserId, data }) => {
    await requireCurrentUser(ctx, authUserId);

    const errors = validateWikiEntryData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const now = Date.now();
    const slug = generateSlug(data.title);
    
    // Check for duplicate slug
    const existingEntry = await ctx.db
      .query('yourobcWikiEntries')
      .withIndex('by_slug', (q) => q.eq('slug', slug))
      .first();
    
    if (existingEntry) {
      throw new Error('An entry with this title already exists');
    }

    const entryData = {
      title: data.title.trim(),
      slug,
      content: data.content,
      category: data.category,
      tags: data.tags || [],
      type: data.type,
      isPublic: data.isPublic || false,
      status: 'draft' as const,
      createdBy: authUserId,
      updatedBy: authUserId,
      createdAt: now,
      updatedAt: now,
    };

    return await ctx.db.insert('yourobcWikiEntries', entryData);
  },
});

export const updateWikiEntry = mutation({
  args: {
    authUserId: v.string(),
    entryId: v.id('yourobcWikiEntries'),
    data: v.object({
      title: v.optional(v.string()),
      content: v.optional(v.string()),
      category: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      isPublic: v.optional(v.boolean()),
    })
  },
  handler: async (ctx, { authUserId, entryId, data }) => {
    await requireCurrentUser(ctx, authUserId);
    
    const entry = await ctx.db.get(entryId);
    if (!entry) {
      throw new Error('Wiki entry not found');
    }

    const errors = validateWikiEntryData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const updateData: any = {
      ...data,
      updatedAt: Date.now(),
      updatedBy: authUserId,
    };

    // Update slug if title changed
    if (data.title && data.title !== entry.title) {
      const newSlug = generateSlug(data.title);
      const existingEntry = await ctx.db
        .query('yourobcWikiEntries')
        .withIndex('by_slug', (q) => q.eq('slug', newSlug))
        .first();
      
      if (existingEntry && existingEntry._id !== entryId) {
        throw new Error('An entry with this title already exists');
      }
      
      updateData.slug = newSlug;
    }

    await ctx.db.patch(entryId, updateData);
    return entryId;
  },
});

export const publishWikiEntry = mutation({
  args: {
    authUserId: v.string(),
    entryId: v.id('yourobcWikiEntries'),
  },
  handler: async (ctx, { authUserId, entryId }) => {
    await requireCurrentUser(ctx, authUserId);

    const entry = await ctx.db.get(entryId);
    if (!entry) {
      throw new Error('Wiki entry not found');
    }

    if (entry.status === 'published') {
      throw new Error('Entry is already published');
    }

    await ctx.db.patch(entryId, {
      status: 'published' as const,
      updatedAt: Date.now(),
    });

    return entryId;
  },
});

export const incrementWikiEntryViews = mutation({
  args: {
    entryId: v.id('yourobcWikiEntries'),
    authUserId: v.string(),
  },
  handler: async (ctx, { entryId, authUserId }) => {
    await requireCurrentUser(ctx, authUserId);

    const entry = await ctx.db.get(entryId);
    if (!entry) {
      throw new Error('Wiki entry not found');
    }

    await ctx.db.patch(entryId, {
      viewCount: (entry.viewCount || 0) + 1,
      lastViewedAt: Date.now(),
    });

    return entryId;
  },
});

