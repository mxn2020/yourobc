// convex/lib/yourobc/supporting/wiki_entries/mutations.ts
// Write operations for wiki entries module

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { wikiEntriesValidators } from '@/schema/yourobc/supporting/wiki_entries/validators';
import { WIKI_ENTRIES_CONSTANTS } from './constants';
import {
  trimWikiEntryData,
  validateWikiEntryData,
  generateWikiSlug,
} from './utils';
import {
  requireEditWikiEntryAccess,
  requirePublishWikiEntryAccess,
  requireDeleteWikiEntryAccess,
} from './permissions';

/**
 * Create new wiki entry
 */
export const createWikiEntry = mutation({
  args: {
    data: v.object({
      title: v.string(),
      slug: v.string(),
      content: v.string(),
      type: wikiEntriesValidators.wikiEntryType,
      isPublic: v.optional(v.boolean()),
      status: v.optional(wikiEntriesValidators.wikiStatus),
      category: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, { data }) => {
    const user = await requireCurrentUser(ctx);

    // Trim and validate
    const trimmed = trimWikiEntryData(data);
    const errors = validateWikiEntryData(trimmed);
    if (errors.length) {
      throw new Error(errors.join(', '));
    }

    const now = Date.now();

    // Generate slug if not perfect
    const slug = trimmed.slug || generateWikiSlug(trimmed.title);

    // Insert record
    const id = await ctx.db.insert('yourobcWikiEntries', {
      title: trimmed.title,
      slug,
      content: trimmed.content,
      type: trimmed.type,
      isPublic: trimmed.isPublic ?? WIKI_ENTRIES_CONSTANTS.DEFAULTS.IS_PUBLIC,
      status: trimmed.status ?? WIKI_ENTRIES_CONSTANTS.DEFAULTS.STATUS,
      viewCount: WIKI_ENTRIES_CONSTANTS.DEFAULTS.VIEW_COUNT,
      category: trimmed.category,
      tags: trimmed.tags || [],
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
    });

    // Audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: 'wiki_entries.created',
      entityType: 'yourobcWikiEntries',
      entityId: slug,
      entityTitle: trimmed.title,
      description: `Created wiki entry: ${trimmed.title}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});

/**
 * Update an existing wiki entry
 */
export const updateWikiEntry = mutation({
  args: {
    id: v.id('yourobcWikiEntries'),
    updates: v.object({
      title: v.optional(v.string()),
      slug: v.optional(v.string()),
      content: v.optional(v.string()),
      type: v.optional(wikiEntriesValidators.wikiEntryType),
      isPublic: v.optional(v.boolean()),
      category: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, { id, updates }) => {
    const user = await requireCurrentUser(ctx);

    // Fetch and check existence
    const existing = await ctx.db.get(id);
    if (!existing || existing.deletedAt) {
      throw new Error('Wiki entry not found');
    }

    // Check permissions
    await requireEditWikiEntryAccess(ctx, existing, user);

    // Trim and validate
    const trimmed = trimWikiEntryData(updates);
    const errors = validateWikiEntryData(trimmed);
    if (errors.length) {
      throw new Error(errors.join(', '));
    }

    const now = Date.now();

    // Update record
    await ctx.db.patch(id, {
      ...trimmed,
      updatedAt: now,
      updatedBy: user._id,
    });

    // Audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: 'wiki_entries.updated',
      entityType: 'yourobcWikiEntries',
      entityId: existing.slug,
      entityTitle: existing.title,
      description: `Updated wiki entry: ${existing.title}`,
      metadata: { changes: trimmed },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});

/**
 * Publish or change status of wiki entry
 */
export const publishWikiEntry = mutation({
  args: {
    id: v.id('yourobcWikiEntries'),
    status: wikiEntriesValidators.wikiStatus,
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, status, isPublic }) => {
    const user = await requireCurrentUser(ctx);

    // Fetch and check existence
    const existing = await ctx.db.get(id);
    if (!existing || existing.deletedAt) {
      throw new Error('Wiki entry not found');
    }

    // Check permissions
    await requirePublishWikiEntryAccess(existing, user);

    const now = Date.now();

    // Update record
    await ctx.db.patch(id, {
      status,
      isPublic: isPublic !== undefined ? isPublic : existing.isPublic,
      updatedAt: now,
      updatedBy: user._id,
    });

    // Audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: 'wiki_entries.published',
      entityType: 'yourobcWikiEntries',
      entityId: existing.slug,
      entityTitle: existing.title,
      description: `Published wiki entry: ${existing.title} (status: ${status})`,
      metadata: { status, isPublic },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});

/**
 * Increment view count for wiki entry
 */
export const incrementWikiEntryViewCount = mutation({
  args: { id: v.id('yourobcWikiEntries') },
  handler: async (ctx, { id }) => {
    const existing = await ctx.db.get(id);
    if (!existing || existing.deletedAt) {
      throw new Error('Wiki entry not found');
    }

    const now = Date.now();

    // Update view count and last viewed time
    await ctx.db.patch(id, {
      viewCount: (existing.viewCount ?? 0) + 1,
      lastViewedAt: now,
    });

    return id;
  },
});

/**
 * Soft delete a wiki entry
 */
export const deleteWikiEntry = mutation({
  args: { id: v.id('yourobcWikiEntries') },
  handler: async (ctx, { id }) => {
    const user = await requireCurrentUser(ctx);

    // Fetch and check existence
    const existing = await ctx.db.get(id);
    if (!existing || existing.deletedAt) {
      throw new Error('Wiki entry not found');
    }

    // Check permissions
    await requireDeleteWikiEntryAccess(existing, user);

    const now = Date.now();

    // Soft delete
    await ctx.db.patch(id, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // Audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: 'wiki_entries.deleted',
      entityType: 'yourobcWikiEntries',
      entityId: existing.slug,
      entityTitle: existing.title,
      description: `Deleted wiki entry: ${existing.title}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});
