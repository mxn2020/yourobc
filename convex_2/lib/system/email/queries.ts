// convex/lib/system/email/queries.ts

import { v } from 'convex/values';
import { query } from '@/generated/server';
import { requireCurrentUser } from '@/shared/auth.helper';
import { canManageEmailConfig } from './utils';
import { emailProviderTypes } from '@/schema/base';

/**
 * Get the active email configuration
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const getActiveConfig = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);

    if (!canManageEmailConfig(user._id, user.role)) {
      throw new Error('Permission denied: Admin access required');
    }

    const config = await ctx.db
      .query('emailConfigs')
      .withIndex('by_active', (q) => q.eq('isActive', true))
      .first();

    return config;
  },
});

/**
 * Get all email configurations
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const getAllConfigs = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);

    if (!canManageEmailConfig(user._id, user.role)) {
      throw new Error('Permission denied: Admin access required');
    }

    const configs = await ctx.db.query('emailConfigs').order('desc').collect();

    return configs;
  },
});

/**
 * Get configuration by provider
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const getConfigByProvider = query({
  args: {
    provider: emailProviderTypes,
  },
  handler: async (ctx, { provider }) => {
    const user = await requireCurrentUser(ctx);

    if (!canManageEmailConfig(user._id, user.role)) {
      throw new Error('Permission denied: Admin access required');
    }

    const config = await ctx.db
      .query('emailConfigs')
      .withIndex('by_provider', (q) => q.eq('provider', provider))
      .first();

    return config;
  },
});

/**
 * Get configuration by ID
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const getConfigById = query({
  args: {
    configId: v.id('emailConfigs'),
  },
  handler: async (ctx, { configId }) => {
    const user = await requireCurrentUser(ctx);

    if (!canManageEmailConfig(user._id, user.role)) {
      throw new Error('Permission denied: Admin access required');
    }

    // ✅ Direct O(1) lookup
    const config = await ctx.db.get(configId);

    return config;
  },
});

/**
 * Get email logs with filters
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const getEmailLogs = query({
  args: {
    limit: v.optional(v.number()),
    status: v.optional(
      v.union(
        v.literal('pending'),
        v.literal('sent'),
        v.literal('delivered'),
        v.literal('failed'),
        v.literal('bounced')
      )
    ),
    context: v.optional(v.string()),
    provider: v.optional(emailProviderTypes),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);

    if (!canManageEmailConfig(user._id, user.role)) {
      throw new Error('Permission denied: Admin access required');
    }

    let logsQuery;

    // ✅ Use indexes when available
    if (args.status) {
      logsQuery = ctx.db
        .query('emailLogs')
        .withIndex('by_status', (q) => q.eq('status', args.status!));
    } else if (args.context) {
      logsQuery = ctx.db
        .query('emailLogs')
        .withIndex('by_context', (q) => q.eq('context', args.context!));
    } else if (args.provider) {
      logsQuery = ctx.db
        .query('emailLogs')
        .withIndex('by_provider', (q) => q.eq('provider', args.provider!));
    } else {
      logsQuery = ctx.db.query('emailLogs');
    }

    const logs = await logsQuery.order('desc').take(args.limit || 50);

    return logs;
  },
});

/**
 * Get email log by message ID
 * 🔒 Authentication: Optional
 */
export const getEmailLogByMessageId = query({
  args: {
    messageId: v.string(),
  },
  handler: async (ctx, { messageId }) => {
    const log = await ctx.db
      .query('emailLogs')
      .withIndex('by_message_id', (q) => q.eq('messageId', messageId))
      .first();

    return log;
  },
});

/**
 * Get email log by ID
 * 🔒 Authentication: Optional
 */
export const getEmailLogById = query({
  args: {
    logId: v.id('emailLogs'),
  },
  handler: async (ctx, { logId }) => {
    // ✅ Direct O(1) lookup
    const log = await ctx.db.get(logId);

    return log;
  },
});

/**
 * Get email statistics
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const getEmailStats = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);

    if (!canManageEmailConfig(user._id, user.role)) {
      throw new Error('Permission denied: Admin access required');
    }

    const days = args.days || 30;
    const since = Date.now() - days * 24 * 60 * 60 * 1000;

    const allLogs = await ctx.db
      .query('emailLogs')
      .withIndex('by_created_at', (q) => q.gte('createdAt', since))
      .collect();

    const stats = {
      total: allLogs.length,
      sent: allLogs.filter((log) => log.status === 'sent').length,
      delivered: allLogs.filter((log) => log.status === 'delivered').length,
      failed: allLogs.filter((log) => log.status === 'failed').length,
      bounced: allLogs.filter((log) => log.status === 'bounced').length,
      pending: allLogs.filter((log) => log.status === 'pending').length,
      byProvider: {} as Record<string, number>,
      byContext: {} as Record<string, number>,
    };

    // Group by provider
    allLogs.forEach((log) => {
      stats.byProvider[log.provider] = (stats.byProvider[log.provider] || 0) + 1;
    });

    // Group by context
    allLogs.forEach((log) => {
      if (log.context) {
        stats.byContext[log.context] = (stats.byContext[log.context] || 0) + 1;
      }
    });

    return stats;
  },
});

/**
 * Get all email templates
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const getAllTemplates = query({
  args: {
    category: v.optional(v.string()),
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);

    if (!canManageEmailConfig(user._id, user.role)) {
      throw new Error('Permission denied: Admin access required');
    }

    let templatesQuery;

    // ✅ Use indexes when available
    if (args.category) {
      templatesQuery = ctx.db
        .query('emailTemplates')
        .withIndex('by_category', (q) => q.eq('category', args.category!));
    } else if (args.activeOnly) {
      templatesQuery = ctx.db
        .query('emailTemplates')
        .withIndex('by_active', (q) => q.eq('isActive', true));
    } else {
      templatesQuery = ctx.db.query('emailTemplates');
    }

    const templates = await templatesQuery.order('desc').collect();
    return templates;
  },
});

/**
 * Get template by slug
 * 🔒 Authentication: Optional (templates can be used by system)
 */
export const getTemplateBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, { slug }) => {
    const template = await ctx.db
      .query('emailTemplates')
      .withIndex('by_slug', (q) => q.eq('slug', slug))
      .first();

    return template;
  },
});

/**
 * Get template by ID
 * 🔒 Authentication: Optional (templates can be used by system)
 */
export const getTemplateById = query({
  args: {
    templateId: v.id('emailTemplates'),
  },
  handler: async (ctx, { templateId }) => {
    // ✅ Direct O(1) lookup
    const template = await ctx.db.get(templateId);

    return template;
  },
});

/**
 * Search templates
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const searchTemplates = query({
  args: {
    searchTerm: v.string(),
  },
  handler: async (ctx, { searchTerm }) => {
    const user = await requireCurrentUser(ctx);

    if (!canManageEmailConfig(user._id, user.role)) {
      throw new Error('Permission denied: Admin access required');
    }

    const allTemplates = await ctx.db.query('emailTemplates').collect();

    const searchLower = searchTerm.toLowerCase();

    const filtered = allTemplates.filter(
      (template) =>
        template.name.toLowerCase().includes(searchLower) ||
        template.slug.toLowerCase().includes(searchLower) ||
        template.description?.toLowerCase().includes(searchLower)
    );

    return filtered;
  },
});