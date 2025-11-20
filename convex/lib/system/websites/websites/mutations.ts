// convex/lib/boilerplate/websites/websites/mutations.ts
// Write operations for websites module

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { websitesValidators } from '@/schema/boilerplate/websites/websites/validators';
import { WEBSITES_CONSTANTS } from './constants';
import { validateWebsiteData } from './utils';
import {
  requireEditWebsiteAccess,
  requireDeleteWebsiteAccess,
  requirePublishWebsiteAccess,
} from './permissions';
import type { WebsiteId, Website } from './types';

/**
 * Create new website
 */
export const createWebsite = mutation({
  args: {
    data: v.object({
      name: v.string(),
      description: v.optional(v.string()),
      domain: v.optional(v.string()),
      subdomain: v.optional(v.string()),
      priority: v.optional(websitesValidators.priority),
      visibility: v.optional(websitesValidators.visibility),
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
      navigation: v.optional(v.any()),
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
  handler: async (ctx, { data }): Promise<WebsiteId> => {
    // 1. AUTH: Get authenticated user
    const user = await requirePermission(
      ctx,
      WEBSITES_CONSTANTS.PERMISSIONS.CREATE,
      { allowAdmin: true }
    );

    // 2. VALIDATE: Check data validity
    const errors = validateWebsiteData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 3. PROCESS: Generate IDs and prepare data
    const publicId = await generateUniquePublicId(ctx, 'websites');
    const now = Date.now();

    // 4. CREATE: Insert into database
    const websiteId = await ctx.db.insert('websites', {
      publicId,
      name: data.name.trim(),
      description: data.description?.trim(),
      domain: data.domain?.trim(),
      subdomain: data.subdomain?.trim(),
      status: WEBSITES_CONSTANTS.STATUS.DRAFT as Website['status'],
      priority: data.priority || (WEBSITES_CONSTANTS.PRIORITY.MEDIUM as Website['priority']),
      visibility: data.visibility || (WEBSITES_CONSTANTS.VISIBILITY.PRIVATE as Website['visibility']),
      icon: data.icon,
      thumbnail: data.thumbnail,
      tags: data.tags?.map(tag => tag.trim()) || [],
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
      ownerId: user._id,
      lastActivityAt: now,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
      metadata: {
        source: 'web',
        operation: 'create',
      },
    });

    // 5. Auto-add owner as collaborator
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
      updatedAt: now,
      createdBy: user._id,
      metadata: {
        source: 'web',
        operation: 'auto_add_owner',
      },
    });

    // 6. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'website.created',
      entityType: 'system_website',
      entityId: publicId,
      entityTitle: data.name.trim(),
      description: `Created website: ${data.name.trim()}`,
      metadata: {
        visibility: data.visibility || WEBSITES_CONSTANTS.VISIBILITY.PRIVATE,
        priority: data.priority || WEBSITES_CONSTANTS.PRIORITY.MEDIUM,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 7. RETURN: Return entity ID
    return websiteId;
  },
});

/**
 * Update existing website
 */
export const updateWebsite = mutation({
  args: {
    websiteId: v.id('websites'),
    updates: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      domain: v.optional(v.string()),
      subdomain: v.optional(v.string()),
      status: v.optional(websitesValidators.status),
      priority: v.optional(websitesValidators.priority),
      visibility: v.optional(websitesValidators.visibility),
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
      seo: v.optional(v.any()),
      settings: v.optional(v.any()),
      navigation: v.optional(v.any()),
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
  handler: async (ctx, { websiteId, updates }): Promise<WebsiteId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const website = await ctx.db.get(websiteId);
    if (!website || website.deletedAt) {
      throw new Error('Website not found');
    }

    // 3. AUTHZ: Check edit permission
    await requireEditWebsiteAccess(ctx, website, user);

    // 4. VALIDATE: Check update data validity
    const errors = validateWebsiteData(updates);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 5. PROCESS: Prepare update data
    const now = Date.now();
    const updateData: any = {
      lastActivityAt: now,
      updatedAt: now,
      updatedBy: user._id,
    };

    if (updates.name !== undefined) updateData.name = updates.name.trim();
    if (updates.description !== undefined) updateData.description = updates.description?.trim();
    if (updates.domain !== undefined) updateData.domain = updates.domain?.trim();
    if (updates.subdomain !== undefined) updateData.subdomain = updates.subdomain?.trim();
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.priority !== undefined) updateData.priority = updates.priority;
    if (updates.visibility !== undefined) updateData.visibility = updates.visibility;
    if (updates.icon !== undefined) updateData.icon = updates.icon;
    if (updates.thumbnail !== undefined) updateData.thumbnail = updates.thumbnail;
    if (updates.tags !== undefined) updateData.tags = updates.tags.map(tag => tag.trim());
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.themeId !== undefined) updateData.themeId = updates.themeId;
    if (updates.customTheme !== undefined) updateData.customTheme = updates.customTheme;
    if (updates.seo !== undefined) updateData.seo = updates.seo;
    if (updates.settings !== undefined) updateData.settings = { ...website.settings, ...updates.settings };
    if (updates.navigation !== undefined) updateData.navigation = updates.navigation;
    if (updates.socialLinks !== undefined) updateData.socialLinks = updates.socialLinks;

    // 6. UPDATE: Apply changes
    await ctx.db.patch(websiteId, updateData);

    // 7. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'website.updated',
      entityType: 'system_website',
      entityId: website.publicId,
      entityTitle: updateData.name || website.name,
      description: `Updated website: ${updateData.name || website.name}`,
      metadata: {
        changes: updates,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 8. RETURN: Return entity ID
    return websiteId;
  },
});

/**
 * Publish website
 */
export const publishWebsite = mutation({
  args: {
    websiteId: v.id('websites'),
  },
  handler: async (ctx, { websiteId }): Promise<WebsiteId> => {
    const user = await requireCurrentUser(ctx);
    const website = await ctx.db.get(websiteId);

    if (!website || website.deletedAt) {
      throw new Error('Website not found');
    }

    await requirePublishWebsiteAccess(ctx, website, user);

    const now = Date.now();
    await ctx.db.patch(websiteId, {
      status: WEBSITES_CONSTANTS.STATUS.PUBLISHED as Website['status'],
      lastPublishedAt: now,
      lastActivityAt: now,
      updatedAt: now,
      updatedBy: user._id,
    });

    // Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'website.published',
      entityType: 'system_website',
      entityId: website.publicId,
      entityTitle: website.name,
      description: `Published website: ${website.name}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return websiteId;
  },
});

/**
 * Delete website (soft delete)
 */
export const deleteWebsite = mutation({
  args: {
    websiteId: v.id('websites'),
  },
  handler: async (ctx, { websiteId }): Promise<WebsiteId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const website = await ctx.db.get(websiteId);
    if (!website || website.deletedAt) {
      throw new Error('Website not found');
    }

    // 3. AUTHZ: Check delete permission
    await requireDeleteWebsiteAccess(website, user);

    // 4. SOFT DELETE: Mark as deleted
    const now = Date.now();
    await ctx.db.patch(websiteId, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'website.deleted',
      entityType: 'system_website',
      entityId: website.publicId,
      entityTitle: website.name,
      description: `Deleted website: ${website.name}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 6. RETURN: Return entity ID
    return websiteId;
  },
});

/**
 * Restore soft-deleted website
 */
export const restoreWebsite = mutation({
  args: {
    websiteId: v.id('websites'),
  },
  handler: async (ctx, { websiteId }): Promise<WebsiteId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists and is deleted
    const website = await ctx.db.get(websiteId);
    if (!website) {
      throw new Error('Website not found');
    }
    if (!website.deletedAt) {
      throw new Error('Website is not deleted');
    }

    // 3. AUTHZ: Check permission (owners and admins can restore)
    if (
      website.ownerId !== user._id &&
      user.role !== 'admin' &&
      user.role !== 'superadmin'
    ) {
      throw new Error('You do not have permission to restore this website');
    }

    // 4. RESTORE: Clear soft delete fields
    const now = Date.now();
    await ctx.db.patch(websiteId, {
      deletedAt: undefined,
      deletedBy: undefined,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'website.restored',
      entityType: 'system_website',
      entityId: website.publicId,
      entityTitle: website.name,
      description: `Restored website: ${website.name}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 6. RETURN: Return entity ID
    return websiteId;
  },
});

/**
 * Archive website
 */
export const archiveWebsite = mutation({
  args: {
    websiteId: v.id('websites'),
  },
  handler: async (ctx, { websiteId }): Promise<WebsiteId> => {
    const user = await requireCurrentUser(ctx);
    const website = await ctx.db.get(websiteId);

    if (!website || website.deletedAt) {
      throw new Error('Website not found');
    }

    await requireEditWebsiteAccess(ctx, website, user);

    const now = Date.now();
    await ctx.db.patch(websiteId, {
      status: WEBSITES_CONSTANTS.STATUS.ARCHIVED as Website['status'],
      lastActivityAt: now,
      updatedAt: now,
      updatedBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'website.archived',
      entityType: 'system_website',
      entityId: website.publicId,
      entityTitle: website.name,
      description: `Archived website: ${website.name}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return websiteId;
  },
});
