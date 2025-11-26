// convex/lib/marketing/link_shortener/mutations.ts
// Write operations for link_shortener module

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { linkShortenerValidators } from '@/schema/marketing/link_shortener/validators';
import { statusTypes } from '@/schema/base';
import { LINK_SHORTENER_CONSTANTS } from './constants';
import { validateMarketingLinkData, generateShortCode } from './utils';
import { requireEditAccess, requireDeleteAccess } from './permissions';

/**
 * Create a new marketing link
 * 🔒 Authentication: Required
 * 🔒 Authorization: User must have 'link_shortener.create' permission
 */
export const createMarketingLink = mutation({
  args: {
    data: v.object({
      title: v.string(),
      description: v.optional(v.string()),
      originalUrl: v.string(),
      shortCode: v.optional(v.string()),
      customDomain: v.optional(v.string()),
      priority: v.optional(statusTypes.priority),
      visibility: v.optional(linkShortenerValidators.visibility),
      expiresAt: v.optional(v.number()),
      maxClicks: v.optional(v.number()),
      password: v.optional(v.string()),
      isABTest: v.optional(v.boolean()),
      tags: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, { data }) => {
    // 🔒 Authenticate & check permission
    const user = await requirePermission(
      ctx,
      LINK_SHORTENER_CONSTANTS.PERMISSIONS.CREATE,
      { allowAdmin: true }
    );

    // Validate input
    const errors = validateMarketingLinkData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // Generate unique public ID
    const publicId = await generateUniquePublicId(ctx, 'marketingLinks');

    // Generate or validate short code
    let shortCode = data.shortCode || generateShortCode();

    // Check if short code already exists
    const existing = await ctx.db
      .query('marketingLinks')
      .withIndex('by_short_code', (q) => q.eq('shortCode', shortCode))
      .first();

    if (existing) {
      if (data.shortCode) {
        throw new Error('Short code already in use');
      }
      // Generate a new one if auto-generated
      shortCode = generateShortCode();
    }

    const now = Date.now();
    const linkData = {
      publicId,
      ownerId: user._id,
      title: data.title.trim(),
      description: data.description?.trim(),
      originalUrl: data.originalUrl.trim(),
      shortCode,
      customDomain: data.customDomain,
      status: LINK_SHORTENER_CONSTANTS.STATUS.ACTIVE,
      priority: data.priority || LINK_SHORTENER_CONSTANTS.PRIORITY.MEDIUM,
      visibility: data.visibility || LINK_SHORTENER_CONSTANTS.VISIBILITY.PRIVATE,
      expiresAt: data.expiresAt,
      maxClicks: data.maxClicks,
      password: data.password,
      isABTest: data.isABTest || false,
      totalClicks: 0,
      uniqueClicks: 0,
      lastActivityAt: now,
      tags: data.tags || [],
      metadata: {},
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
      updatedBy: user._id,
      deletedAt: undefined,
      deletedBy: undefined,
    };

    const linkId = await ctx.db.insert('marketingLinks', linkData);

    // Audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'marketing_link.created',
      entityType: 'system_marketing_link',
      entityId: publicId,
      entityTitle: data.title,
      description: `Created marketing link '${data.title}'`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return { _id: linkId, publicId, shortCode };
  },
});

/**
 * Update an existing marketing link
 * 🔒 Authentication: Required
 * 🔒 Authorization: User must be owner or admin
 */
export const updateMarketingLink = mutation({
  args: {
    linkId: v.id('marketingLinks'),
    updates: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      status: v.optional(linkShortenerValidators.status),
      priority: v.optional(statusTypes.priority),
      visibility: v.optional(linkShortenerValidators.visibility),
      expiresAt: v.optional(v.number()),
      maxClicks: v.optional(v.number()),
      password: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, { linkId, updates }) => {
    const user = await requireCurrentUser(ctx);

    const link = await ctx.db.get(linkId);
    if (!link || link.deletedAt) {
      throw new Error('Link not found');
    }

    await requireEditAccess(ctx, link, user);

    // Validate
    const errors = validateMarketingLinkData(updates);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const now = Date.now();
    await ctx.db.patch(linkId, {
      ...updates,
      updatedAt: now,
      updatedBy: user._id,
      lastActivityAt: now,
    });

    // Audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'marketing_link.updated',
      entityType: 'system_marketing_link',
      entityId: link.publicId,
      entityTitle: link.title,
      description: `Updated marketing link '${link.title}'`,
      metadata: {
        source: 'marketing_link.update',
        operation: 'update',
        changes: updates,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return { _id: linkId, publicId: link.publicId };
  },
});

/**
 * Delete a marketing link
 * 🔒 Authentication: Required
 * 🔒 Authorization: User must be owner or admin
 */
export const deleteMarketingLink = mutation({
  args: {
    linkId: v.id('marketingLinks'),
    hardDelete: v.optional(v.boolean()),
  },
  handler: async (ctx, { linkId, hardDelete = false }) => {
    const user = await requireCurrentUser(ctx);

    const link = await ctx.db.get(linkId);
    if (!link) {
      throw new Error('Link not found');
    }

    requireDeleteAccess(link, user);

    const now = Date.now();

    if (hardDelete && (user.role === 'admin' || user.role === 'superadmin')) {
      // Delete all clicks first
      const clicks = await ctx.db
        .query('marketingLinkClicks')
        .withIndex('by_link', (q) => q.eq('linkId', linkId))
        .collect();

      for (const click of clicks) {
        await ctx.db.delete(click._id);
      }

      await ctx.db.delete(linkId);
    } else {
      await ctx.db.patch(linkId, {
        deletedAt: now,
        deletedBy: user._id,
        updatedAt: now,
        updatedBy: user._id,
        lastActivityAt: now,
      });
    }

    // Audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: hardDelete ? 'marketing_link.hard_deleted' : 'marketing_link.deleted',
      entityType: 'system_marketing_link',
      entityId: link.publicId,
      entityTitle: link.title,
      description: `${hardDelete ? 'Permanently deleted' : 'Deleted'} marketing link '${link.title}'`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return { _id: linkId, publicId: link.publicId };
  },
});

/**
 * Track a link click (public - no auth required)
 */
export const trackLinkClick = mutation({
  args: {
    linkId: v.id('marketingLinks'),
    data: v.object({
      ipAddress: v.optional(v.string()),
      country: v.optional(v.string()),
      city: v.optional(v.string()),
      device: v.optional(linkShortenerValidators.device),
      browser: v.optional(v.string()),
      os: v.optional(v.string()),
      referrer: v.optional(v.string()),
      referrerDomain: v.optional(v.string()),
      utmSource: v.optional(v.string()),
      utmMedium: v.optional(v.string()),
      utmCampaign: v.optional(v.string()),
      utmTerm: v.optional(v.string()),
      utmContent: v.optional(v.string()),
      variantIndex: v.optional(v.number()),
      visitorId: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { linkId, data }) => {
    const link = await ctx.db.get(linkId);
    if (!link || link.deletedAt) {
      throw new Error('Link not found');
    }

    const now = Date.now();

    // Check if unique click
    let isUnique = true;
    if (data.visitorId) {
      const existingClick = await ctx.db
        .query('marketingLinkClicks')
        .withIndex('by_visitor', (q) => q.eq('visitorId', data.visitorId))
        .filter((q) => q.eq(q.field('linkId'), linkId))
        .first();
      isUnique = !existingClick;
    }

    // Record click
    await ctx.db.insert('marketingLinkClicks', {
      linkId,
      clickedAt: now,
      isUnique,
      ...data,
    });

    // Update link statistics
    await ctx.db.patch(linkId, {
      totalClicks: (link.totalClicks || 0) + 1,
      uniqueClicks: (link.uniqueClicks || 0) + (isUnique ? 1 : 0),
      lastClickedAt: now,
    });

    return { success: true };
  },
});
