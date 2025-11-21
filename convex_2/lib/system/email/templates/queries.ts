// convex/lib/system/email/templates/queries.ts
// Read operations for email templates module

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { emailTemplatesValidators } from '@/schema/system/email/email_templates/validators';
import { filterEmailTemplatesByAccess, requireViewEmailTemplateAccess } from './permissions';
import type { EmailTemplateListResponse, TemplateStats } from './types';

/**
 * Get paginated list of email templates with filtering
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const getEmailTemplates = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    filters: v.optional(v.object({
      category: v.optional(v.string()),
      isActive: v.optional(v.boolean()),
      status: v.optional(v.array(emailTemplatesValidators.status)),
      search: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args): Promise<EmailTemplateListResponse> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, offset = 0, filters = {} } = args;

    // Check admin access
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      throw new Error('Permission denied: Admin access required');
    }

    // Query all templates
    let templates = await ctx.db
      .query('emailTemplates')
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Apply category filter
    if (filters.category) {
      templates = templates.filter((t) => t.category === filters.category);
    }

    // Apply isActive filter
    if (filters.isActive !== undefined) {
      templates = templates.filter((t) => t.isActive === filters.isActive);
    }

    // Apply status filter
    if (filters.status?.length) {
      templates = templates.filter((t) => filters.status!.includes(t.status));
    }

    // Apply search filter
    if (filters.search) {
      const term = filters.search.toLowerCase();
      templates = templates.filter((t) =>
        t.name.toLowerCase().includes(term) ||
        t.slug.toLowerCase().includes(term) ||
        (t.description && t.description.toLowerCase().includes(term))
      );
    }

    // Sort by created date descending
    templates.sort((a, b) => b.createdAt - a.createdAt);

    // Paginate
    const total = templates.length;
    const items = templates.slice(offset, offset + limit);

    return {
      items,
      total,
      hasMore: total > offset + limit,
    };
  },
});

/**
 * Get single email template by ID
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const getEmailTemplate = query({
  args: {
    templateId: v.id('emailTemplates'),
  },
  handler: async (ctx, { templateId }) => {
    const user = await requireCurrentUser(ctx);

    const template = await ctx.db.get(templateId);
    if (!template || template.deletedAt) {
      throw new Error('Email template not found');
    }

    await requireViewEmailTemplateAccess(ctx, template, user);

    return template;
  },
});

/**
 * Get email template by public ID
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const getEmailTemplateByPublicId = query({
  args: {
    publicId: v.string(),
  },
  handler: async (ctx, { publicId }) => {
    const user = await requireCurrentUser(ctx);

    const template = await ctx.db
      .query('emailTemplates')
      .withIndex('by_public_id', (q) => q.eq('publicId', publicId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (!template) {
      throw new Error('Email template not found');
    }

    await requireViewEmailTemplateAccess(ctx, template, user);

    return template;
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
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

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

    // Check admin access
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      throw new Error('Permission denied: Admin access required');
    }

    const allTemplates = await ctx.db
      .query('emailTemplates')
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

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

/**
 * Get email template statistics
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const getEmailTemplateStats = query({
  args: {},
  handler: async (ctx): Promise<TemplateStats> => {
    const user = await requireCurrentUser(ctx);

    // Check admin access
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      throw new Error('Permission denied: Admin access required');
    }

    const templates = await ctx.db
      .query('emailTemplates')
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Group by category
    const byCategory: Record<string, number> = {};
    templates.forEach((template) => {
      if (template.category) {
        byCategory[template.category] = (byCategory[template.category] || 0) + 1;
      }
    });

    return {
      total: templates.length,
      active: templates.filter((t) => t.status === 'active').length,
      inactive: templates.filter((t) => t.status === 'inactive').length,
      archived: templates.filter((t) => t.status === 'archived').length,
      byCategory,
    };
  },
});
