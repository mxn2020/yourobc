// convex/lib/system/email/email_logs/queries.ts
// Read operations for email logs module

import { v } from 'convex/values';
import { query } from '@/generated/server';
import { requireCurrentUser } from '@/shared/auth.helper';
import { emailValidators } from '@/schema/system/email/validators';
import {
  requireManageEmailLogsAccess,
  requireViewEmailLogAccess,
  filterEmailLogsByAccess,
} from './permissions';
import { EMAIL_LOGS_CONSTANTS } from './constants';
import { notDeleted } from '@/shared/db.helper';

/**
 * Get email logs with filters (cursor-based pagination)
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin/superadmin can view all, users can view their own
 */
export const getEmailLogs = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
    deliveryStatus: v.optional(emailValidators.deliveryStatus),
    context: v.optional(v.string()),
    provider: v.optional(emailValidators.provider),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);

    const limit = Math.min(
      args.limit || EMAIL_LOGS_CONSTANTS.LIMITS.DEFAULT_PAGE_SIZE,
      EMAIL_LOGS_CONSTANTS.LIMITS.MAX_PAGE_SIZE
    );

    // Build indexed query without reassigning across types
    const logsQuery = (() => {
      if (args.deliveryStatus) {
        return ctx.db
          .query('emailLogs')
          .withIndex('by_delivery_status', q => q.eq('deliveryStatus', args.deliveryStatus!))
      }
      if (args.context) {
        return ctx.db
          .query('emailLogs')
          .withIndex('by_context', q => q.eq('context', args.context!));
      }
      if (args.provider) {
        return ctx.db
          .query('emailLogs')
          .withIndex('by_provider', q => q.eq('provider', args.provider!));
      }

      return ctx.db
        .query('emailLogs')
        .withIndex('by_created_at');
    })();

    const page = await logsQuery
      .filter(notDeleted)
      .order('desc')
      .paginate({
        numItems: limit,
        cursor: args.cursor ?? null,
      });

    // Filter by access permissions
    const items = await filterEmailLogsByAccess(ctx, page.page, user);

    return {
      items,
      hasMore: !page.isDone,
      cursor: page.continueCursor,
    };
  },
});

/**
 * Get email log by message ID
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin/superadmin or user who triggered
 */
export const getEmailLogByMessageId = query({
  args: {
    messageId: v.string(),
  },
  handler: async (ctx, { messageId }) => {
    const user = await requireCurrentUser(ctx);

    const log = await ctx.db
      .query('emailLogs')
      .withIndex('by_message_id', q => q.eq('messageId', messageId))
      .filter(notDeleted)
      .first();

    if (!log) return null;

    await requireViewEmailLogAccess(ctx, log, user);
    return log;
  },
});

/**
 * Get email log by ID
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin/superadmin or user who triggered
 */
export const getEmailLogById = query({
  args: {
    logId: v.id('emailLogs'),
  },
  handler: async (ctx, { logId }) => {
    const user = await requireCurrentUser(ctx);

    const log = await ctx.db.get(logId);
    if (!log || log.deletedAt) return null;

    await requireViewEmailLogAccess(ctx, log, user);
    return log;
  },
});

/**
 * Get email statistics
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin/superadmin only
 */
export const getEmailStats = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    await requireManageEmailLogsAccess(ctx, user);

    const days = args.days || 30;
    const since = Date.now() - days * 24 * 60 * 60 * 1000;

    const allLogs = await ctx.db
      .query('emailLogs')
      .withIndex('by_created_at', q => q.gte('createdAt', since))
      .filter(notDeleted)
      .collect();

    const stats = {
      total: allLogs.length,
      sent: allLogs.filter(l => l.deliveryStatus === 'sent').length,
      delivered: allLogs.filter(l => l.deliveryStatus === 'delivered').length,
      failed: allLogs.filter(l => l.deliveryStatus === 'failed').length,
      bounced: allLogs.filter(l => l.deliveryStatus === 'bounced').length,
      pending: allLogs.filter(l => l.deliveryStatus === 'pending').length,
      byProvider: {} as Record<string, number>,
      byContext: {} as Record<string, number>,
    };

    allLogs.forEach(l => {
      stats.byProvider[l.provider] = (stats.byProvider[l.provider] || 0) + 1;
      if (l.context) {
        stats.byContext[l.context] = (stats.byContext[l.context] || 0) + 1;
      }
    });

    return stats;
  },
});
