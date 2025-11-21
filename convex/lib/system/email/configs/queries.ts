// convex/lib/system/email/configs/queries.ts
// Read operations for email configs module

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { emailValidators } from '@/schema/system/email/validators';
import { filterEmailConfigsByAccess, requireViewEmailConfigAccess } from './permissions';
import type { EmailConfigListResponse } from './types';

/**
 * Get the active email configuration
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const getActiveConfig = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);

    // Check admin access
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      throw new Error('Permission denied: Admin access required');
    }

    const config = await ctx.db
      .query('emailConfigs')
      .withIndex('by_active', (q) => q.eq('isActive', true))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    return config;
  },
});

/**
 * Get paginated list of email configs with filtering
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const getEmailConfigs = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    filters: v.optional(v.object({
      provider: v.optional(v.array(emailValidators.provider)),
      status: v.optional(v.array(emailValidators.status)),
      isActive: v.optional(v.boolean()),
      isVerified: v.optional(v.boolean()),
      search: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args): Promise<EmailConfigListResponse> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, offset = 0, filters = {} } = args;

    // Check admin access
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      throw new Error('Permission denied: Admin access required');
    }

    // Query all configs
    let configs = await ctx.db
      .query('emailConfigs')
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Apply provider filter
    if (filters.provider?.length) {
      configs = configs.filter((config) =>
        filters.provider!.includes(config.provider)
      );
    }

    // Apply status filter
    if (filters.status?.length) {
      configs = configs.filter((config) =>
        filters.status!.includes(config.status)
      );
    }

    // Apply isActive filter
    if (filters.isActive !== undefined) {
      configs = configs.filter((config) => config.isActive === filters.isActive);
    }

    // Apply isVerified filter
    if (filters.isVerified !== undefined) {
      configs = configs.filter((config) => config.isVerified === filters.isVerified);
    }

    // Apply search filter
    if (filters.search) {
      const term = filters.search.toLowerCase();
      configs = configs.filter((config) =>
        config.name.toLowerCase().includes(term) ||
        config.provider.toLowerCase().includes(term) ||
        config.config.fromEmail.toLowerCase().includes(term)
      );
    }

    // Sort by created date descending
    configs.sort((a, b) => b.createdAt - a.createdAt);

    // Paginate
    const total = configs.length;
    const items = configs.slice(offset, offset + limit);

    return {
      items,
      total,
      hasMore: total > offset + limit,
    };
  },
});

/**
 * Get single email config by ID
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
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
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const getEmailConfigByPublicId = query({
  args: {
    publicId: v.string(),
  },
  handler: async (ctx, { publicId }) => {
    const user = await requireCurrentUser(ctx);

    const config = await ctx.db
      .query('emailConfigs')
      .withIndex('by_public_id', (q) => q.eq('publicId', publicId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
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
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const getConfigByProvider = query({
  args: {
    provider: emailValidators.provider,
  },
  handler: async (ctx, { provider }) => {
    const user = await requireCurrentUser(ctx);

    // Check admin access
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      throw new Error('Permission denied: Admin access required');
    }

    const config = await ctx.db
      .query('emailConfigs')
      .withIndex('by_provider', (q) => q.eq('provider', provider))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    return config;
  },
});

/**
 * Get email config statistics
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const getEmailConfigStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);

    // Check admin access
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      throw new Error('Permission denied: Admin access required');
    }

    const configs = await ctx.db
      .query('emailConfigs')
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    return {
      total: configs.length,
      byStatus: {
        active: configs.filter((c) => c.status === 'active').length,
        inactive: configs.filter((c) => c.status === 'inactive').length,
        archived: configs.filter((c) => c.status === 'archived').length,
      },
      byProvider: {
        resend: configs.filter((c) => c.provider === 'resend').length,
        sendgrid: configs.filter((c) => c.provider === 'sendgrid').length,
        ses: configs.filter((c) => c.provider === 'ses').length,
        postmark: configs.filter((c) => c.provider === 'postmark').length,
        mailgun: configs.filter((c) => c.provider === 'mailgun').length,
      },
      verified: configs.filter((c) => c.isVerified).length,
      activeCount: configs.filter((c) => c.isActive).length,
    };
  },
});
