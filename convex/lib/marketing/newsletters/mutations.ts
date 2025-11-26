// convex/lib/marketing/newsletters/mutations.ts

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';
import { NEWSLETTER_CONSTANTS } from './constants';
import { validateNewsletterData, validateCampaignData } from './utils';
import {
  requireEditAccessNewsletter,
  requireDeleteAccessNewsletter,
  requireEditAccessCampaign,
  requireDeleteAccessCampaign,
} from './permissions';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { statusTypes } from '@/schema/base';
import { newslettersValidators } from '@/schema/marketing/newsletters/validators';

/**
 * Create a new newsletter
 * 🔒 Authentication: Required
 * 🔒 Authorization: User must have 'newsletter.create' permission
 */
export const createNewsletter = mutation({
  args: {
    data: v.object({
      title: v.string(),
      description: v.optional(v.string()),
      fromName: v.string(),
      fromEmail: v.string(),
      replyToEmail: v.optional(v.string()),
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
      NEWSLETTER_CONSTANTS.PERMISSIONS.CREATE,
      { allowAdmin: true }
    );

    // Validate input
    const errors = validateNewsletterData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // Generate unique public ID
    const publicId = await generateUniquePublicId(ctx, 'marketingNewsletters');

    const now = Date.now();
    const newsletterData = {
      publicId,
      ownerId: user._id,
      title: data.title.trim(),
      description: data.description?.trim(),
      fromName: data.fromName.trim(),
      fromEmail: data.fromEmail.trim(),
      replyToEmail: data.replyToEmail?.trim(),
      status: NEWSLETTER_CONSTANTS.STATUS.ACTIVE,
      priority: data.priority || NEWSLETTER_CONSTANTS.PRIORITY.MEDIUM,
      visibility: data.visibility || NEWSLETTER_CONSTANTS.VISIBILITY.PRIVATE,
      isActive: true,
      lastActivityAt: now,
      tags: data.tags || [],
      metadata: {},
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
      deletedAt: undefined,
    };

    const newsletterId = await ctx.db.insert('marketingNewsletters', newsletterData);

    // Audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'newsletter.created',
      entityType: 'system_marketing_newsletter',
      entityId: publicId,
      entityTitle: data.title,
      description: `Created newsletter '${data.title}'`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return { _id: newsletterId, publicId };
  },
});

/**
 * Update an existing newsletter
 * 🔒 Authentication: Required
 * 🔒 Authorization: User must be owner or admin
 */
export const updateNewsletter = mutation({
  args: {
    newsletterId: v.id('marketingNewsletters'),
    updates: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      fromName: v.optional(v.string()),
      fromEmail: v.optional(v.string()),
      status: v.optional(newslettersValidators.newsletterStatus),
      isActive: v.optional(v.boolean()),
      priority: v.optional(statusTypes.priority),
      visibility: v.optional(
        v.union(v.literal('private'), v.literal('team'), v.literal('public'))
      ),
      tags: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, { newsletterId, updates }) => {
    const user = await requireCurrentUser(ctx);

    const newsletter = await ctx.db.get(newsletterId);
    if (!newsletter || newsletter.deletedAt) {
      throw new Error('Newsletter not found');
    }

    await requireEditAccessNewsletter(ctx, newsletter, user);

    // Validate
    const errors = validateNewsletterData(updates);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const now = Date.now();
    await ctx.db.patch(newsletterId, {
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
      action: 'newsletter.updated',
      entityType: 'system_marketing_newsletter',
      entityId: newsletter.publicId,
      entityTitle: newsletter.title,
      description: `Updated newsletter '${newsletter.title}'`,
      metadata: {
        source: 'newsletter.update',
        operation: 'update',
        changes: updates,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return { _id: newsletterId, publicId: newsletter.publicId };
  },
});

/**
 * Delete a newsletter
 * 🔒 Authentication: Required
 * 🔒 Authorization: User must be owner or admin
 */
export const deleteNewsletter = mutation({
  args: {
    newsletterId: v.id('marketingNewsletters'),
    hardDelete: v.optional(v.boolean()),
  },
  handler: async (ctx, { newsletterId, hardDelete = false }) => {
    const user = await requireCurrentUser(ctx);

    const newsletter = await ctx.db.get(newsletterId);
    if (!newsletter) {
      throw new Error('Newsletter not found');
    }

    requireDeleteAccessNewsletter(newsletter, user);

    const now = Date.now();

    if (hardDelete && (user.role === 'admin' || user.role === 'superadmin')) {
      // Delete related campaigns first
      const campaigns = await ctx.db
        .query('marketingNewsletterCampaigns')
        .withIndex('by_newsletter', (q) => q.eq('newsletterId', newsletterId))
        .collect();

      for (const campaign of campaigns) {
        await ctx.db.delete(campaign._id);
      }

      // Delete related subscribers
      const subscribers = await ctx.db
        .query('marketingNewsletterSubscribers')
        .withIndex('by_newsletter', (q) => q.eq('newsletterId', newsletterId))
        .collect();

      for (const subscriber of subscribers) {
        await ctx.db.delete(subscriber._id);
      }

      await ctx.db.delete(newsletterId);
    } else {
      await ctx.db.patch(newsletterId, {
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
      action: hardDelete ? 'newsletter.hard_deleted' : 'newsletter.deleted',
      entityType: 'system_marketing_newsletter',
      entityId: newsletter.publicId,
      entityTitle: newsletter.title,
      description: `${hardDelete ? 'Permanently deleted' : 'Deleted'} newsletter '${newsletter.title}'`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return { _id: newsletterId, publicId: newsletter.publicId };
  },
});

/**
 * Create a new campaign
 * 🔒 Authentication: Required
 * 🔒 Authorization: User must have 'newsletter.create' permission
 */
export const createCampaign = mutation({
  args: {
    data: v.object({
      newsletterId: v.id('marketingNewsletters'),
      title: v.string(),
      description: v.optional(v.string()),
      subject: v.string(),
      content: v.object({ html: v.string(), plainText: v.optional(v.string()) }),
      scheduledAt: v.optional(v.number()),
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
      NEWSLETTER_CONSTANTS.PERMISSIONS.CREATE,
      { allowAdmin: true }
    );

    // Validate input
    const errors = validateCampaignData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // Generate unique public ID
    const publicId = await generateUniquePublicId(ctx, 'marketingNewsletterCampaigns');

    const now = Date.now();
    const status = data.scheduledAt
      ? NEWSLETTER_CONSTANTS.STATUS.SCHEDULED
      : NEWSLETTER_CONSTANTS.STATUS.DRAFT;

    const campaignData = {
      publicId,
      ownerId: user._id,
      newsletterId: data.newsletterId,
      title: data.title.trim(),
      description: data.description?.trim(),
      subject: data.subject.trim(),
      content: data.content,
      status,
      scheduledAt: data.scheduledAt,
      priority: data.priority || NEWSLETTER_CONSTANTS.PRIORITY.MEDIUM,
      visibility: data.visibility || NEWSLETTER_CONSTANTS.VISIBILITY.PRIVATE,
      lastActivityAt: now,
      tags: data.tags || [],
      metadata: {},
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
      deletedAt: undefined,
    };

    const campaignId = await ctx.db.insert('marketingNewsletterCampaigns', campaignData);

    // Audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'newsletter_campaign.created',
      entityType: 'system_marketing_newsletter_campaign',
      entityId: publicId,
      entityTitle: data.title,
      description: `Created newsletter campaign '${data.title}'`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return { _id: campaignId, publicId };
  },
});

/**
 * Update an existing campaign
 * 🔒 Authentication: Required
 * 🔒 Authorization: User must be owner or admin
 */
export const updateCampaign = mutation({
  args: {
    campaignId: v.id('marketingNewsletterCampaigns'),
    updates: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      subject: v.optional(v.string()),
      content: v.optional(v.object({ html: v.string(), plainText: v.optional(v.string()) })),
      status: v.optional(newslettersValidators.campaignStatus),
      scheduledAt: v.optional(v.number()),
      priority: v.optional(statusTypes.priority),
      visibility: v.optional(
        v.union(v.literal('private'), v.literal('team'), v.literal('public'))
      ),
      tags: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, { campaignId, updates }) => {
    const user = await requireCurrentUser(ctx);

    const campaign = await ctx.db.get(campaignId);
    if (!campaign || campaign.deletedAt) {
      throw new Error('Campaign not found');
    }

    await requireEditAccessCampaign(ctx, campaign, user);

    // Validate
    const errors = validateCampaignData(updates);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const now = Date.now();
    await ctx.db.patch(campaignId, {
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
      action: 'newsletter_campaign.updated',
      entityType: 'system_marketing_newsletter_campaign',
      entityId: campaign.publicId,
      entityTitle: campaign.title,
      description: `Updated newsletter campaign '${campaign.title}'`,
      metadata: {
        source: 'newsletter_campaign.update',
        operation: 'update',
        changes: updates,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return { _id: campaignId, publicId: campaign.publicId };
  },
});

/**
 * Delete a campaign
 * 🔒 Authentication: Required
 * 🔒 Authorization: User must be owner or admin
 */
export const deleteCampaign = mutation({
  args: {
    campaignId: v.id('marketingNewsletterCampaigns'),
    hardDelete: v.optional(v.boolean()),
  },
  handler: async (ctx, { campaignId, hardDelete = false }) => {
    const user = await requireCurrentUser(ctx);

    const campaign = await ctx.db.get(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    requireDeleteAccessCampaign(campaign, user);

    const now = Date.now();

    if (hardDelete && (user.role === 'admin' || user.role === 'superadmin')) {
      await ctx.db.delete(campaignId);
    } else {
      await ctx.db.patch(campaignId, {
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
      action: hardDelete ? 'newsletter_campaign.hard_deleted' : 'newsletter_campaign.deleted',
      entityType: 'system_marketing_newsletter_campaign',
      entityId: campaign.publicId,
      entityTitle: campaign.title,
      description: `${hardDelete ? 'Permanently deleted' : 'Deleted'} newsletter campaign '${campaign.title}'`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return { _id: campaignId, publicId: campaign.publicId };
  },
});
