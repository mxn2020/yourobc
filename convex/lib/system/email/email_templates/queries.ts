// convex/lib/system/email/email_templates/queries.ts
// Read operations for email templates module

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { emailValidators } from '@/schema/system/email/validators';
import { filterEmailTemplatesByAccess, requireViewEmailTemplateAccess } from './permissions';
import { notDeleted } from '@/shared/db.helper';
import type { EmailTemplateListResponse, TemplateStats } from './types';

/**
 * Get paginated list of email templates with filtering
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const getEmailTemplates = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
    filters: v.optional(v.object({
      category: v.optional(v.string()),
      isActive: v.optional(v.boolean()),
      status: v.optional(v.array(emailValidators.status)),
      search: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args): Promise<EmailTemplateListResponse & { cursor?: string }> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, cursor, filters = {} } = args;

    // Admin-only
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      throw new Error('Permission denied: Admin access required');
    }

    // Build final ordered query without reassigning across types
    const templatesQuery = (() => {
      if (filters.status?.length === 1) {
        return ctx.db
          .query('emailTemplates')
          .withIndex('by_status', q => q.eq('status', filters.status![0]))
          .filter(notDeleted);
      }

      return ctx.db
        .query('emailTemplates')
        .filter(notDeleted);
    })();

    const page = await templatesQuery
      .order('desc')
      .paginate({
        numItems: limit,
        cursor: cursor ?? null, // <-- fix #2
      });

    // Access filter (page only)
    let templates = await filterEmailTemplatesByAccess(ctx, page.page, user);

    // In-memory filters on the page
    if (filters.category) {
      templates = templates.filter(t => t.category === filters.category);
    }

    if (filters.isActive !== undefined) {
      templates = templates.filter(t => t.isActive === filters.isActive);
    }

    if (filters.status?.length) {
      templates = templates.filter(t => filters.status!.includes(t.status));
    }

    if (filters.search) {
      const term = filters.search.toLowerCase();
      templates = templates.filter(t =>
        t.name.toLowerCase().includes(term) ||
        t.slug.toLowerCase().includes(term) ||
        (t.description && t.description.toLowerCase().includes(term))
      );
    }

    return {
      items: templates,
      total: templates.length,
      hasMore: !page.isDone,
      cursor: page.continueCursor,
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
 */
export const getEmailTemplateByPublicId = query({
  args: {
    publicId: v.string(),
  },
  handler: async (ctx, { publicId }) => {
    const user = await requireCurrentUser(ctx);

    const template = await ctx.db
      .query('emailTemplates')
      .withIndex('by_public_id', q => q.eq('publicId', publicId))
      .filter(notDeleted)
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
 * 🔒 Authentication: None (internal-only for email sending system)
 *
 * This query is used by the email sending system to fetch templates
 * without user context. For management operations, use getEmailTemplate instead.
 */
export const getTemplateBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, { slug }) => {
    return ctx.db
      .query('emailTemplates')
      .withIndex('by_slug', q => q.eq('slug', slug))
      .filter(notDeleted)
      .first();
  },
});

/**
 * Search templates (simple search; admin-only)
 */
export const searchTemplates = query({
  args: {
    searchTerm: v.string(),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, { searchTerm, limit = 50, cursor }) => {
    const user = await requireCurrentUser(ctx);

    if (user.role !== 'admin' && user.role !== 'superadmin') {
      throw new Error('Permission denied: Admin access required');
    }

    const page = await ctx.db
      .query('emailTemplates')
      .filter(notDeleted)
      .order('desc')
      .paginate({
        numItems: limit,
        cursor: cursor ?? null, // <-- fix #2
      });

    const term = searchTerm.toLowerCase();
    const filtered = page.page.filter(t =>
      t.name.toLowerCase().includes(term) ||
      t.slug.toLowerCase().includes(term) ||
      t.description?.toLowerCase().includes(term)
    );

    return {
      items: filtered,
      hasMore: !page.isDone,
      cursor: page.continueCursor,
    };
  },
});

/**
 * Get email template statistics
 */
export const getEmailTemplateStats = query({
  args: {},
  handler: async (ctx): Promise<TemplateStats> => {
    const user = await requireCurrentUser(ctx);

    if (user.role !== 'admin' && user.role !== 'superadmin') {
      throw new Error('Permission denied: Admin access required');
    }

    const templates = await ctx.db
      .query('emailTemplates')
      .filter(notDeleted)
      .collect();

    const byCategory: Record<string, number> = {};
    templates.forEach(t => {
      if (t.category) byCategory[t.category] = (byCategory[t.category] || 0) + 1;
    });

    return {
      total: templates.length,
      active: templates.filter(t => t.status === 'active').length,
      inactive: templates.filter(t => t.status === 'inactive').length,
      archived: templates.filter(t => t.status === 'archived').length,
      byCategory,
    };
  },
});
