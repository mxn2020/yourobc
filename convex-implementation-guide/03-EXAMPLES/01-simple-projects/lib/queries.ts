// convex/lib/software/freelancer_dashboard/projects/queries.ts
// Read operations for projects module

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { notDeleted } from '@/shared/db.helper';
import { filterProjectsByAccess, requireViewProjectAccess } from './permissions';
import { projectsValidators } from '@/schema/software/freelancer_dashboard/projects/validators';
import type { ProjectListResponse } from './types';

/**
 * Get paginated list of projects
 * 🔒 Authentication: Required
 * 🔒 Authorization: User sees own projects + projects they're members of
 */
export const getProjects = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
    filters: v.optional(v.object({
      status: v.optional(v.array(projectsValidators.status)),
      priority: v.optional(v.array(projectsValidators.priority)),
      clientId: v.optional(v.id('clients')),
    })),
  },
  handler: async (ctx, args): Promise<ProjectListResponse & { cursor?: string }> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, cursor, filters = {} } = args;

    const isAdmin = user.role === "admin" || user.role === "superadmin";

    // Build query
    const q = (() => {
      if (isAdmin) {
        return ctx.db
          .query("freelancerProjects")
          .withIndex("by_created_at", iq => iq.gte("createdAt", 0))
          .filter(notDeleted);
      }

      if (filters.status?.length === 1) {
        return ctx.db
          .query("freelancerProjects")
          .withIndex("by_owner_and_status", iq =>
            iq.eq("ownerId", user._id).eq("status", filters.status![0])
          )
          .filter(notDeleted);
      }

      return ctx.db
        .query("freelancerProjects")
        .withIndex("by_owner_id", iq => iq.eq("ownerId", user._id))
        .filter(notDeleted);
    })();

    // Paginate
    const page = await q.order('desc').paginate({
      numItems: limit,
      cursor: cursor ?? null,
    });

    // Apply permissions
    let items = await filterProjectsByAccess(ctx, page.page, user);

    // Apply additional filters
    if (filters.status && filters.status.length > 1) {
      items = items.filter(i => filters.status!.includes(i.status));
    }

    if (filters.priority?.length) {
      items = items.filter(i => i.priority && filters.priority!.includes(i.priority));
    }

    if (filters.clientId) {
      items = items.filter(i => i.clientId === filters.clientId);
    }

    return {
      items,
      returnedCount: items.length,
      hasMore: !page.isDone,
      cursor: page.continueCursor,
    };
  },
});

/**
 * Get single project by ID
 * 🔒 Authentication: Required
 * 🔒 Authorization: User must have access to view project
 */
export const getProject = query({
  args: { id: v.id('freelancerProjects') },
  handler: async (ctx, { id }) => {
    const user = await requireCurrentUser(ctx);
    const project = await ctx.db.get(id);

    if (!project || project.deletedAt) {
      throw new Error('Project not found');
    }

    await requireViewProjectAccess(ctx, project, user);
    return project;
  },
});

/**
 * Get project members
 * 🔒 Authentication: Required
 * 🔒 Authorization: User must have access to view project
 */
export const getProjectMembers = query({
  args: { projectId: v.id('freelancerProjects') },
  handler: async (ctx, { projectId }) => {
    const user = await requireCurrentUser(ctx);

    // Check project access
    const project = await ctx.db.get(projectId);
    if (!project || project.deletedAt) {
      throw new Error('Project not found');
    }

    await requireViewProjectAccess(ctx, project, user);

    // Get members
    const members = await ctx.db
      .query('freelancerProjectMembers')
      .withIndex('by_project_id', q => q.eq('projectId', projectId))
      .filter(notDeleted)
      .collect();

    // Get user profiles for members
    const membersWithProfiles = await Promise.all(
      members.map(async (member) => {
        const profile = await ctx.db.get(member.userId);
        return {
          ...member,
          userProfile: profile,
        };
      })
    );

    return membersWithProfiles;
  },
});

/**
 * Get project statistics
 * 🔒 Authentication: Required
 */
export const getProjectStats = query({
  args: { days: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const isAdmin = user.role === 'admin' || user.role === 'superadmin';
    const days = args.days || 30;
    const since = Date.now() - days * 24 * 60 * 60 * 1000;

    const itemsQuery = isAdmin
      ? ctx.db
          .query('freelancerProjects')
          .withIndex('by_created_at', q => q.gte('createdAt', since))
      : ctx.db
          .query('freelancerProjects')
          .withIndex('by_owner_id', q => q.eq('ownerId', user._id));

    const items = await itemsQuery
      .filter(notDeleted)
      .collect();

    return {
      total: items.length,
      byStatus: {
        planning: items.filter(i => i.status === 'planning').length,
        active: items.filter(i => i.status === 'active').length,
        on_hold: items.filter(i => i.status === 'on_hold').length,
        completed: items.filter(i => i.status === 'completed').length,
        cancelled: items.filter(i => i.status === 'cancelled').length,
      },
      byPriority: {
        low: items.filter(i => i.priority === 'low').length,
        medium: items.filter(i => i.priority === 'medium').length,
        high: items.filter(i => i.priority === 'high').length,
        urgent: items.filter(i => i.priority === 'urgent').length,
      },
      upcomingDeadlines: items
        .filter(i => i.deadline && i.deadline > Date.now())
        .sort((a, b) => (a.deadline! - b.deadline!))
        .slice(0, 5)
        .map(i => ({
          id: i._id,
          name: i.{displayField},
          deadline: i.deadline,
        })),
    };
  },
});
