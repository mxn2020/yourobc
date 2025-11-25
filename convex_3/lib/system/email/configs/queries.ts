// convex/lib/system/email/configs/queries.ts
// Read operations for email configs module

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { emailValidators } from '@/schema/system/email/validators';
import { filterEmailConfigsByAccess, requireViewEmailConfigAccess } from './permissions';
import { notDeleted } from '@/shared/db.helper';
import type { EmailConfigListResponse } from './types';

/**
 * Get the active email configuration
 */
export const getActiveConfig = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);

    if (user.role !== 'admin' && user.role !== 'superadmin') {
      throw new Error('Permission denied: Admin access required');
    }

    return ctx.db
      .query('emailConfigs')
      .withIndex('by_active', q => q.eq('isActive', true))
      .filter(notDeleted)
      .first();
  },
});

/**
 * Get paginated list of email configs with filtering (cursor based)
 */
export const getEmailConfigs = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
    filters: v.optional(v.object({
      provider: v.optional(v.array(emailValidators.provider)),
      status: v.optional(v.array(emailValidators.status)),
      isActive: v.optional(v.boolean()),
      isVerified: v.optional(v.boolean()),
      search: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args): Promise<EmailConfigListResponse & { cursor?: string }> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, cursor, filters = {} } = args;

    if (user.role !== 'admin' && user.role !== 'superadmin') {
      throw new Error('Permission denied: Admin access required');
    }

    const configsQuery = (() => {
      if (filters.provider?.length === 1) {
        return ctx.db
          .query('emailConfigs')
          .withIndex('by_provider', q => q.eq('provider', filters.provider![0]))
          .filter(notDeleted);
      }

      if (filters.status?.length === 1) {
        return ctx.db
          .query('emailConfigs')
          .withIndex('by_status', q => q.eq('status', filters.status![0]))
          .filter(notDeleted);
      }

      return ctx.db
        .query('emailConfigs')
        .filter(notDeleted);
    })();

    const page = await configsQuery
      .order('desc')
      .paginate({
        numItems: limit,
        cursor: cursor ?? null, // <-- fix #2
      });

    let configs = await filterEmailConfigsByAccess(ctx, page.page, user);

    if (filters.provider?.length) {
      configs = configs.filter(c => filters.provider!.includes(c.provider));
    }

    if (filters.status?.length) {
      configs = configs.filter(c => filters.status!.includes(c.status));
    }

    if (filters.isActive !== undefined) {
      configs = configs.filter(c => c.isActive === filters.isActive);
    }

    if (filters.isVerified !== undefined) {
      configs = configs.filter(c => c.isVerified === filters.isVerified);
    }

    if (filters.search) {
      const term = filters.search.toLowerCase();
      configs = configs.filter(c =>
        c.name.toLowerCase().includes(term) ||
        c.provider.toLowerCase().includes(term) ||
        c.config.fromEmail.toLowerCase().includes(term)
      );
    }

    return {
      items: configs,
      total: configs.length,
      hasMore: !page.isDone,
      cursor: page.continueCursor,
    };
  },
});

/**
 * Get single email config by ID
 */
export const getEmailConfig = query({
  args: {
    configId: v.id('emailConfigs'),
  },
  handler: async (ctx, { configId }) => {
    const user = await requireCurrentUser(ctx);

    const config = await ctx.db.get(configId);
    if (!config || config.deletedAt) {
      throw new Error('Email configuration not found');
    }

    await requireViewEmailConfigAccess(ctx, config, user);
    return config;
  },
});

/**
 * Get email config by public ID
 */
export const getEmailConfigByPublicId = query({
  args: {
    publicId: v.string(),
  },
  handler: async (ctx, { publicId }) => {
    const user = await requireCurrentUser(ctx);

    const config = await ctx.db
      .query('emailConfigs')
      .withIndex('by_public_id', q => q.eq('publicId', publicId))
      .filter(notDeleted)
      .first();

    if (!config) {
      throw new Error('Email configuration not found');
    }

    await requireViewEmailConfigAccess(ctx, config, user);
    return config;
  },
});

/**
 * Get configuration by provider
 */
export const getConfigByProvider = query({
  args: { provider: emailValidators.provider },
  handler: async (ctx, { provider }) => {
    const user = await requireCurrentUser(ctx);

    if (user.role !== 'admin' && user.role !== 'superadmin') {
      throw new Error('Permission denied: Admin access required');
    }

    return ctx.db
      .query('emailConfigs')
      .withIndex('by_provider', q => q.eq('provider', provider))
      .filter(notDeleted)
      .first();
  },
});

/**
 * Get email config statistics
 */
export const getEmailConfigStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);

    if (user.role !== 'admin' && user.role !== 'superadmin') {
      throw new Error('Permission denied: Admin access required');
    }

    const configs = await ctx.db
      .query('emailConfigs')
      .filter(notDeleted)
      .collect();

    return {
      total: configs.length,
      byStatus: {
        active: configs.filter(c => c.status === 'active').length,
        inactive: configs.filter(c => c.status === 'inactive').length,
        archived: configs.filter(c => c.status === 'archived').length,
      },
      byProvider: {
        resend: configs.filter(c => c.provider === 'resend').length,
        sendgrid: configs.filter(c => c.provider === 'sendgrid').length,
        ses: configs.filter(c => c.provider === 'ses').length,
        postmark: configs.filter(c => c.provider === 'postmark').length,
        mailgun: configs.filter(c => c.provider === 'mailgun').length,
      },
      verified: configs.filter(c => c.isVerified).length,
      activeCount: configs.filter(c => c.isActive).length,
    };
  },
});
