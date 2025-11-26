// convex/lib/marketing/landing_pages/mutations.ts

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';
import { LANDING_PAGE_CONSTANTS } from './constants';
import { validateLandingPageData } from './utils';
import { requireEditAccess, requireDeleteAccess } from './permissions';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { statusTypes } from '@/schema/base';
import { landingPagesValidators } from '@/schema/marketing/landing_pages/validators';

/**
 * Create a new landing page
 * 🔒 Authentication: Required
 * 🔒 Authorization: User must have 'landing_page.create' permission
 */
export const createLandingPage = mutation({
  args: {
    data: v.object({
      title: v.string(),
      description: v.optional(v.string()),
      slug: v.string(),
      customDomain: v.optional(v.string()),
      template: v.optional(v.string()),
      priority: v.optional(statusTypes.priority),
      visibility: v.optional(
        v.union(v.literal('private'), v.literal('team'), v.literal('public'))
      ),
      tags: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, { data }) => {
    // 🔒 Authenticate & check permission
    const user = await requirePermission(
      ctx,
      LANDING_PAGE_CONSTANTS.PERMISSIONS.CREATE,
      { allowAdmin: true }
    );

    // Validate input
    const errors = validateLandingPageData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // Generate unique public ID
    const publicId = await generateUniquePublicId(ctx, 'marketingLandingPages');

    const now = Date.now();
    const pageData = {
      publicId,
      ownerId: user._id,
      title: data.title.trim(),
      description: data.description?.trim(),
      slug: data.slug.trim(),
      customDomain: data.customDomain,
      template: data.template,
      sections: [],
      status: LANDING_PAGE_CONSTANTS.STATUS.DRAFT,
      priority: data.priority || LANDING_PAGE_CONSTANTS.PRIORITY.MEDIUM,
      visibility: data.visibility || LANDING_PAGE_CONSTANTS.VISIBILITY.PRIVATE,
      lastActivityAt: now,
      tags: data.tags || [],
      metadata: {},
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
      deletedAt: undefined,
    };

    const pageId = await ctx.db.insert('marketingLandingPages', pageData);

    // Audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'landing_page.created',
      entityType: 'system_marketing_landing_page',
      entityId: publicId,
      entityTitle: data.title,
      description: `Created landing page '${data.title}'`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return { _id: pageId, publicId };
  },
});

/**
 * Update an existing landing page
 * 🔒 Authentication: Required
 * 🔒 Authorization: User must be owner or admin
 */
export const updateLandingPage = mutation({
  args: {
    pageId: v.id('marketingLandingPages'),
    updates: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      slug: v.optional(v.string()),
      status: v.optional(landingPagesValidators.status),
      priority: v.optional(statusTypes.priority),
      visibility: v.optional(
        v.union(v.literal('private'), v.literal('team'), v.literal('public'))
      ),
      sections: v.optional(v.any()),
      tags: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, { pageId, updates }) => {
    const user = await requireCurrentUser(ctx);

    const page = await ctx.db.get(pageId);
    if (!page || page.deletedAt) {
      throw new Error('Page not found');
    }

    await requireEditAccess(ctx, page, user);

    // Validate
    const errors = validateLandingPageData(updates);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const now = Date.now();
    await ctx.db.patch(pageId, {
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
      action: 'landing_page.updated',
      entityType: 'system_marketing_landing_page',
      entityId: page.publicId,
      entityTitle: page.title,
      description: `Updated landing page '${page.title}'`,
      metadata: {
        source: 'landing_page.update',
        operation: 'update',
        changes: updates,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return { _id: pageId, publicId: page.publicId };
  },
});

/**
 * Delete a landing page
 * 🔒 Authentication: Required
 * 🔒 Authorization: User must be owner or admin
 */
export const deleteLandingPage = mutation({
  args: {
    pageId: v.id('marketingLandingPages'),
    hardDelete: v.optional(v.boolean()),
  },
  handler: async (ctx, { pageId, hardDelete = false }) => {
    const user = await requireCurrentUser(ctx);

    const page = await ctx.db.get(pageId);
    if (!page) {
      throw new Error('Page not found');
    }

    requireDeleteAccess(page, user);

    const now = Date.now();

    if (hardDelete && (user.role === 'admin' || user.role === 'superadmin')) {
      // Delete related variants first
      const variants = await ctx.db
        .query('marketingPageVariants')
        .withIndex('by_page', (q) => q.eq('pageId', pageId))
        .collect();

      for (const variant of variants) {
        await ctx.db.delete(variant._id);
      }

      await ctx.db.delete(pageId);
    } else {
      await ctx.db.patch(pageId, {
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
      action: hardDelete ? 'landing_page.hard_deleted' : 'landing_page.deleted',
      entityType: 'system_marketing_landing_page',
      entityId: page.publicId,
      entityTitle: page.title,
      description: `${hardDelete ? 'Permanently deleted' : 'Deleted'} landing page '${page.title}'`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return { _id: pageId, publicId: page.publicId };
  },
});
