// convex/lib/yourobc/customers/contacts/mutations.ts

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';
import { CONTACT_LOG_CONSTANTS } from './constants';
import { validateContactLogData } from './utils';
import {
  contactTypeValidator,
  contactDirectionValidator,
  contactOutcomeValidator,
  contactPriorityValidator,
  contactCategoryValidator,
} from '../../../../schema/yourobc/base';

/**
 * Log a contact interaction with customer
 */
export const logContact = mutation({
  args: {
    authUserId: v.string(),
    customerId: v.id('yourobcCustomers'),
    contactPersonId: v.optional(v.id('contactPersons')),
    contactType: contactTypeValidator,
    direction: contactDirectionValidator,
    subject: v.string(),
    summary: v.string(),
    details: v.optional(v.string()),
    outcome: v.optional(contactOutcomeValidator),
    priority: v.optional(contactPriorityValidator),
    category: v.optional(contactCategoryValidator),
    tags: v.optional(v.array(v.string())),
    duration: v.optional(v.number()),
    requiresFollowUp: v.boolean(),
    followUpDate: v.optional(v.number()),
    followUpAssignedTo: v.optional(v.string()),
    followUpNotes: v.optional(v.string()),
    relatedQuoteId: v.optional(v.id('yourobcQuotes')),
    relatedShipmentId: v.optional(v.id('yourobcShipments')),
    relatedInvoiceId: v.optional(v.id('yourobcInvoices')),
  },
  handler: async (ctx, { authUserId, ...args }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, CONTACT_LOG_CONSTANTS.PERMISSIONS.CREATE);

    const errors = validateContactLogData({
      subject: args.subject,
      summary: args.summary,
      details: args.details,
      tags: args.tags,
      duration: args.duration,
    });
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // Verify customer exists
    const customer = await ctx.db.get(args.customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    const now = Date.now();

    // Create contact log entry
    const contactLogId = await ctx.db.insert('yourobcContactLog', {
      customerId: args.customerId,
      contactPersonId: args.contactPersonId,
      contactType: args.contactType,
      direction: args.direction,
      subject: args.subject.trim(),
      summary: args.summary.trim(),
      details: args.details?.trim(),
      outcome: args.outcome,
      priority: args.priority || CONTACT_LOG_CONSTANTS.PRIORITY.MEDIUM,
      category: args.category,
      tags: args.tags || [],
      contactedBy: authUserId,
      contactDate: now,
      duration: args.duration,
      requiresFollowUp: args.requiresFollowUp,
      followUpDate: args.followUpDate,
      followUpAssignedTo: args.followUpAssignedTo,
      followUpNotes: args.followUpNotes?.trim(),
      followUpCompleted: false,
      relatedQuoteId: args.relatedQuoteId,
      relatedShipmentId: args.relatedShipmentId,
      relatedInvoiceId: args.relatedInvoiceId,
      createdBy: authUserId,
      createdAt: now,
      updatedAt: now,
    });

    // Update customer analytics with last contact date
    const analytics = await ctx.db
      .query('yourobcCustomerAnalytics')
      .withIndex('by_customer', (q) => q.eq('customerId', args.customerId))
      .filter((q) => q.eq(q.field('month'), undefined))
      .first();

    if (analytics) {
      await ctx.db.patch(analytics._id, {
        lastContactDate: now,
        daysSinceLastContact: 0,
        needsFollowUpAlert: false,
        totalContacts: (analytics.totalContacts || 0) + 1,
        updatedAt: now,
      });
    }

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'contact_log.created',
      entityType: 'yourobc_contact_log',
      entityId: contactLogId,
      entityTitle: args.subject,
      description: `Logged ${args.contactType} contact with ${customer.companyName}: ${args.subject}`,
      createdAt: now,
    });

    return contactLogId;
  },
});

/**
 * Update contact outcome and result
 */
export const updateContactOutcome = mutation({
  args: {
    authUserId: v.string(),
    contactLogId: v.id('yourobcContactLog'),
    outcome: contactOutcomeValidator,
    details: v.optional(v.string()),
    requiresFollowUp: v.optional(v.boolean()),
    followUpDate: v.optional(v.number()),
    followUpAssignedTo: v.optional(v.string()),
  },
  handler: async (ctx, { authUserId, contactLogId, ...updates }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, CONTACT_LOG_CONSTANTS.PERMISSIONS.EDIT);

    const contactLog = await ctx.db.get(contactLogId);
    if (!contactLog) {
      throw new Error('Contact log not found');
    }

    const errors = validateContactLogData({ details: updates.details });
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const now = Date.now();
    const updateData: Record<string, unknown> = {
      ...updates,
      updatedAt: now,
    };

    if (updates.details) {
      updateData.details = updates.details.trim();
    }

    await ctx.db.patch(contactLogId, updateData);

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'contact_log.updated',
      entityType: 'yourobc_contact_log',
      entityId: contactLogId,
      entityTitle: contactLog.subject,
      description: `Updated contact log outcome: ${updates.outcome}`,
      createdAt: now,
    });

    return { success: true };
  },
});

/**
 * Schedule or update follow-up task
 */
export const scheduleFollowUp = mutation({
  args: {
    authUserId: v.string(),
    contactLogId: v.id('yourobcContactLog'),
    followUpDate: v.number(),
    followUpAssignedTo: v.string(),
    followUpNotes: v.optional(v.string()),
  },
  handler: async (ctx, { authUserId, contactLogId, ...args }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, CONTACT_LOG_CONSTANTS.PERMISSIONS.EDIT);

    const contactLog = await ctx.db.get(contactLogId);
    if (!contactLog) {
      throw new Error('Contact log not found');
    }

    const now = Date.now();

    await ctx.db.patch(contactLogId, {
      requiresFollowUp: true,
      followUpDate: args.followUpDate,
      followUpAssignedTo: args.followUpAssignedTo,
      followUpNotes: args.followUpNotes?.trim(),
      followUpCompleted: false,
      updatedAt: now,
    });

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'contact_log.follow_up_scheduled',
      entityType: 'yourobc_contact_log',
      entityId: contactLogId,
      entityTitle: contactLog.subject,
      description: `Scheduled follow-up for ${new Date(args.followUpDate).toLocaleDateString()}`,
      createdAt: now,
    });

    return { success: true };
  },
});

/**
 * Mark follow-up as completed
 */
export const completeFollowUp = mutation({
  args: {
    authUserId: v.string(),
    contactLogId: v.id('yourobcContactLog'),
    completionNotes: v.optional(v.string()),
  },
  handler: async (ctx, { authUserId, contactLogId, completionNotes }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, CONTACT_LOG_CONSTANTS.PERMISSIONS.EDIT);

    const contactLog = await ctx.db.get(contactLogId);
    if (!contactLog) {
      throw new Error('Contact log not found');
    }

    const now = Date.now();

    await ctx.db.patch(contactLogId, {
      followUpCompleted: true,
      followUpCompletedDate: now,
      followUpCompletedBy: authUserId,
      details: completionNotes
        ? `${contactLog.details || ''}\n\nFollow-up completed: ${completionNotes}`
        : contactLog.details,
      updatedAt: now,
    });

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'contact_log.follow_up_completed',
      entityType: 'yourobc_contact_log',
      entityId: contactLogId,
      entityTitle: contactLog.subject,
      description: `Completed follow-up for contact log`,
      createdAt: now,
    });

    return { success: true };
  },
});

/**
 * Bulk update follow-ups (mark multiple as completed)
 */
export const bulkCompleteFollowUps = mutation({
  args: {
    authUserId: v.string(),
    contactLogIds: v.array(v.id('yourobcContactLog')),
    completionNotes: v.optional(v.string()),
  },
  handler: async (ctx, { authUserId, contactLogIds, completionNotes }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, CONTACT_LOG_CONSTANTS.PERMISSIONS.EDIT);

    const now = Date.now();
    let successCount = 0;

    for (const contactLogId of contactLogIds) {
      const contactLog = await ctx.db.get(contactLogId);
      if (!contactLog) continue;

      await ctx.db.patch(contactLogId, {
        followUpCompleted: true,
        followUpCompletedDate: now,
        followUpCompletedBy: authUserId,
        details: completionNotes
          ? `${contactLog.details || ''}\n\nFollow-up completed: ${completionNotes}`
          : contactLog.details,
        updatedAt: now,
      });

      successCount++;
    }

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'contact_logs.bulk_follow_up_completed',
      entityType: 'yourobc_contact_log',
      entityId: contactLogIds[0], // Reference first contact log
      entityTitle: `${successCount} contact logs`,
      description: `Bulk completed ${successCount} follow-ups`,
      createdAt: now,
    });

    return { success: true, updatedCount: successCount };
  },
});

/**
 * Delete contact log entry
 */
export const deleteContactLog = mutation({
  args: {
    authUserId: v.string(),
    contactLogId: v.id('yourobcContactLog'),
  },
  handler: async (ctx, { authUserId, contactLogId }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, CONTACT_LOG_CONSTANTS.PERMISSIONS.DELETE);

    const contactLog = await ctx.db.get(contactLogId);
    if (!contactLog) {
      throw new Error('Contact log not found');
    }

    const now = Date.now();
    // Soft delete: mark as deleted instead of removing
    await ctx.db.patch(contactLogId, {
      deletedAt: now,
      deletedBy: authUserId,
    });

    // Update customer analytics (decrement total contacts)
    const analytics = await ctx.db
      .query('yourobcCustomerAnalytics')
      .withIndex('by_customer', (q) => q.eq('customerId', contactLog.customerId))
      .filter((q) => q.eq(q.field('month'), undefined))
      .first();

    if (analytics && analytics.totalContacts > 0) {
      await ctx.db.patch(analytics._id, {
        totalContacts: analytics.totalContacts - 1,
        updatedAt: now,
      });
    }

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'contact_log.deleted',
      entityType: 'yourobc_contact_log',
      entityId: contactLogId,
      entityTitle: contactLog.subject,
      description: `Deleted contact log: ${contactLog.subject}`,
      createdAt: now,
    });

    return { success: true };
  },
});

/**
 * Add tags to contact log
 */
export const addContactTags = mutation({
  args: {
    authUserId: v.string(),
    contactLogId: v.id('yourobcContactLog'),
    tags: v.array(v.string()),
  },
  handler: async (ctx, { authUserId, contactLogId, tags }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, CONTACT_LOG_CONSTANTS.PERMISSIONS.EDIT);

    const contactLog = await ctx.db.get(contactLogId);
    if (!contactLog) {
      throw new Error('Contact log not found');
    }

    // Merge new tags with existing tags (avoid duplicates)
    const existingTags = contactLog.tags || [];
    const newTags = tags.filter((tag) => !existingTags.includes(tag));
    const allTags = [...existingTags, ...newTags];

    if (allTags.length > CONTACT_LOG_CONSTANTS.LIMITS.MAX_TAGS) {
      throw new Error(`Maximum ${CONTACT_LOG_CONSTANTS.LIMITS.MAX_TAGS} tags allowed`);
    }

    const now = Date.now();

    await ctx.db.patch(contactLogId, {
      tags: allTags,
      updatedAt: now,
    });

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'contact_log.tags_added',
      entityType: 'yourobc_contact_log',
      entityId: contactLogId,
      entityTitle: contactLog.subject,
      description: `Added ${newTags.length} tags to contact log`,
      createdAt: now,
    });

    return { success: true, tags: allTags };
  },
});

/**
 * Remove tags from contact log
 */
export const removeContactTags = mutation({
  args: {
    authUserId: v.string(),
    contactLogId: v.id('yourobcContactLog'),
    tags: v.array(v.string()),
  },
  handler: async (ctx, { authUserId, contactLogId, tags }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, CONTACT_LOG_CONSTANTS.PERMISSIONS.EDIT);

    const contactLog = await ctx.db.get(contactLogId);
    if (!contactLog) {
      throw new Error('Contact log not found');
    }

    const existingTags = contactLog.tags || [];
    const remainingTags = existingTags.filter((tag) => !tags.includes(tag));

    const now = Date.now();

    await ctx.db.patch(contactLogId, {
      tags: remainingTags,
      updatedAt: now,
    });

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'contact_log.tags_removed',
      entityType: 'yourobc_contact_log',
      entityId: contactLogId,
      entityTitle: contactLog.subject,
      description: `Removed ${tags.length} tags from contact log`,
      createdAt: now,
    });

    return { success: true, tags: remainingTags };
  },
});
