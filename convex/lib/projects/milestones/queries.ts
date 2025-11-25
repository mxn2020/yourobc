// convex/lib/boilerplate/milestones/queries.ts

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { MILESTONE_CONSTANTS } from './constants';
import { isMilestoneOverdue, isMilestoneDelayed } from './utils';
import { requireViewMilestoneAccess, filterMilestonesByAccess } from './permissions';
import type { MilestoneStats } from './types';

/**
 * Get milestones with filtering and pagination
 * 🔒 Authentication: Required
 * 🔒 Authorization: Returns only accessible milestones
 */
export const getMilestones = query({
  args: {
    options: v.optional(
      v.object({
        limit: v.optional(v.number()),
        offset: v.optional(v.number()),
        sortBy: v.optional(v.string()),
        sortOrder: v.optional(v.union(v.literal('asc'), v.literal('desc'))),
        filters: v.optional(
          v.object({
            status: v.optional(v.array(v.string())),
            priority: v.optional(v.array(v.string())),
            projectId: v.optional(v.id('projects')),
            assignedTo: v.optional(v.id('userProfiles')),
            createdBy: v.optional(v.string()),
            search: v.optional(v.string()),
          })
        ),
      })
    ),
  },
  handler: async (ctx, { options = {} }) => {
    const user = await requireCurrentUser(ctx);

    const {
      limit = 50,
      offset = 0,
      sortBy = 'dueDate',
      sortOrder = 'asc',
      filters = {},
    } = options;

    const { status, priority, projectId, assignedTo, createdBy, search } =
      filters;

    // Start with index if available
    let milestonesQuery;
    if (projectId) {
      milestonesQuery = ctx.db
        .query('projectMilestones')
        .withIndex('by_project_id', (q) => q.eq('projectId', projectId));
    } else {
      milestonesQuery = ctx.db.query('projectMilestones');
    }

    // Filter out soft-deleted milestones
    milestonesQuery = milestonesQuery.filter((q) =>
      q.eq(q.field('deletedAt'), undefined)
    );

    // Apply filters
    if (status && status.length > 0) {
      milestonesQuery = milestonesQuery.filter((q) =>
        q.or(...status.map((s) => q.eq(q.field('status'), s)))
      );
    }

    if (priority && priority.length > 0) {
      milestonesQuery = milestonesQuery.filter((q) =>
        q.or(...priority.map((p) => q.eq(q.field('priority'), p)))
      );
    }

    if (assignedTo) {
      milestonesQuery = milestonesQuery.filter((q) =>
        q.eq(q.field('assignedTo'), assignedTo)
      );
    }

    if (createdBy) {
      milestonesQuery = milestonesQuery.filter((q) =>
        q.eq(q.field('createdBy'), createdBy)
      );
    }

    const milestones = await milestonesQuery.collect();

    // Apply search filter
    let filteredMilestones = milestones;
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredMilestones = milestones.filter(
        (m) =>
          m.title.toLowerCase().includes(searchTerm) ||
          m.description?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply access control
    const accessibleMilestones = await filterMilestonesByAccess(
      ctx,
      filteredMilestones,
      user
    );

    // Sort milestones
    accessibleMilestones.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'dueDate':
          aValue = a.dueDate;
          bValue = b.dueDate;
          break;
        case 'startDate':
          aValue = a.startDate;
          bValue = b.startDate;
          break;
        case 'createdAt':
          aValue = a.createdAt;
          bValue = b.createdAt;
          break;
        case 'updatedAt':
          aValue = a.updatedAt;
          bValue = b.updatedAt;
          break;
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          aValue =
            priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          bValue =
            priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'progress':
          aValue = a.progress;
          bValue = b.progress;
          break;
        default:
          aValue = a.dueDate;
          bValue = b.dueDate;
      }

      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }
    });

    // Paginate
    const paginatedMilestones = accessibleMilestones.slice(
      offset,
      offset + limit
    );

    // Enrich with computed fields, project title, and assignee data
    const enrichedMilestones = await Promise.all(
      paginatedMilestones.map(async (milestone) => {
        let projectTitle;
        let assigneeName;
        let assigneeEmail;
        let assigneeAvatar;

        // Get project title
        if (milestone.projectId) {
          const project = await ctx.db.get(milestone.projectId);
          projectTitle = project?.title;
        }

        // Get assignee data
        if (milestone.assignedTo) {
          const assignee = await ctx.db.get(milestone.assignedTo);
          if (assignee) {
            assigneeName = assignee.name;
            assigneeEmail = assignee.email;
            assigneeAvatar = assignee.avatar;
          }
        }

        return {
          ...milestone,
          projectTitle,
          assigneeName,
          assigneeEmail,
          assigneeAvatar,
          isOverdue: isMilestoneOverdue(milestone),
          isDelayed: isMilestoneDelayed(milestone),
        };
      })
    );

    return {
      milestones: enrichedMilestones,
      total: accessibleMilestones.length,
      hasMore: accessibleMilestones.length > offset + limit,
    };
  },
});

/**
 * Get a single milestone by ID
 * 🔒 Authentication: Required
 * 🔒 Authorization: Must have view access
 */
export const getMilestone = query({
  args: {
    milestoneId: v.id('projectMilestones'),
  },
  handler: async (ctx, { milestoneId }) => {
    const user = await requireCurrentUser(ctx);
    
    // ✅ Direct O(1) lookup
    const milestone = await ctx.db.get(milestoneId);

    if (!milestone) {
      throw new Error('Milestone not found');
    }

    if (milestone.deletedAt) {
      throw new Error('Milestone has been deleted');
    }

    await requireViewMilestoneAccess(ctx, milestone, user);

    // Enrich with project title, assignee data, and computed fields
    let projectTitle;
    let assigneeName;
    let assigneeEmail;
    let assigneeAvatar;

    // Get project title
    if (milestone.projectId) {
      const project = await ctx.db.get(milestone.projectId);
      projectTitle = project?.title;
    }

    // Get assignee data
    if (milestone.assignedTo) {
      const assignee = await ctx.db.get(milestone.assignedTo);
      if (assignee) {
        assigneeName = assignee.name;
        assigneeEmail = assignee.email;
        assigneeAvatar = assignee.avatar;
      }
    }

    return {
      ...milestone,
      projectTitle,
      assigneeName,
      assigneeEmail,
      assigneeAvatar,
      isOverdue: isMilestoneOverdue(milestone),
      isDelayed: isMilestoneDelayed(milestone),
    };
  },
});

/**
 * Get all milestones for a project
 * 🔒 Authentication: Required
 * 🔒 Authorization: Must have project access
 */
export const getProjectMilestones = query({
  args: {
    projectId: v.id('projects'),
  },
  handler: async (ctx, { projectId }) => {
    const user = await requireCurrentUser(ctx);

    // Verify access to project first
    const project = await ctx.db.get(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Use composite index to get milestones for project ordered by due date
    const milestones = await ctx.db
      .query('projectMilestones')
      .withIndex('by_project_id', (q) => q.eq('projectId', projectId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Apply access control
    const accessibleMilestones = await filterMilestonesByAccess(
      ctx,
      milestones,
      user
    );

    // Enrich with project title, assignee data, and computed fields
    const enrichedMilestones = await Promise.all(
      accessibleMilestones.map(async (milestone) => {
        let projectTitle;
        let assigneeName;
        let assigneeEmail;
        let assigneeAvatar;

        // Get project title
        if (milestone.projectId) {
          const milestoneProject = await ctx.db.get(milestone.projectId);
          projectTitle = milestoneProject?.title;
        }

        // Get assignee data
        if (milestone.assignedTo) {
          const assignee = await ctx.db.get(milestone.assignedTo);
          if (assignee) {
            assigneeName = assignee.name;
            assigneeEmail = assignee.email;
            assigneeAvatar = assignee.avatar;
          }
        }

        return {
          ...milestone,
          projectTitle,
          assigneeName,
          assigneeEmail,
          assigneeAvatar,
          isOverdue: isMilestoneOverdue(milestone),
          isDelayed: isMilestoneDelayed(milestone),
        };
      })
    );

    return {
      milestones: enrichedMilestones,
      total: enrichedMilestones.length,
    };
  },
});

/**
 * Get milestone statistics
 * 🔒 Authentication: Required
 */
export const getMilestoneStats = query({
  args: {
    projectId: v.optional(v.id('projects')),
  },
  handler: async (ctx, { projectId }) => {
    const user = await requireCurrentUser(ctx);

    // Start query with index if projectId is specified
    let milestonesQuery;
    if (projectId) {
      milestonesQuery = ctx.db
        .query('projectMilestones')
        .withIndex('by_project_id', (q) => q.eq('projectId', projectId));
    } else {
      milestonesQuery = ctx.db.query('projectMilestones');
    }

    // Filter out soft-deleted milestones
    milestonesQuery = milestonesQuery.filter((q) =>
      q.eq(q.field('deletedAt'), undefined)
    );

    const milestones = await milestonesQuery.collect();

    // Apply access control
    const accessibleMilestones = await filterMilestonesByAccess(
      ctx,
      milestones,
      user
    );

    const stats: MilestoneStats = {
      totalMilestones: accessibleMilestones.length,
      upcomingMilestones: accessibleMilestones.filter(
        (m) => m.status === MILESTONE_CONSTANTS.STATUS.UPCOMING
      ).length,
      inProgressMilestones: accessibleMilestones.filter(
        (m) => m.status === MILESTONE_CONSTANTS.STATUS.IN_PROGRESS
      ).length,
      completedMilestones: accessibleMilestones.filter(
        (m) => m.status === MILESTONE_CONSTANTS.STATUS.COMPLETED
      ).length,
      delayedMilestones: accessibleMilestones.filter((m) =>
        isMilestoneDelayed(m)
      ).length,
      averageProgress:
        accessibleMilestones.length > 0
          ? Math.round(
              accessibleMilestones.reduce((acc, m) => acc + m.progress, 0) /
                accessibleMilestones.length
            )
          : 0,
    };

    return stats;
  },
});

/**
 * Get upcoming milestones (due within 30 days)
 * 🔒 Authentication: Required
 */
export const getUpcomingMilestones = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { limit = 10 }) => {
    const user = await requireCurrentUser(ctx);

    const now = Date.now();
    const thirtyDaysFromNow = now + 30 * 24 * 60 * 60 * 1000;

    let milestonesQuery = ctx.db.query('projectMilestones');

    // Filter by soft delete and status
    milestonesQuery = milestonesQuery.filter((q) =>
      q.and(
        q.eq(q.field('deletedAt'), undefined),
        q.neq(q.field('status'), MILESTONE_CONSTANTS.STATUS.COMPLETED),
        q.neq(q.field('status'), MILESTONE_CONSTANTS.STATUS.CANCELLED)
      )
    );

    const milestones = await milestonesQuery.collect();

    // Filter for upcoming and apply access control
    const accessibleMilestones = await filterMilestonesByAccess(
      ctx,
      milestones,
      user
    );

    const upcomingMilestones = accessibleMilestones
      .filter((m) => m.dueDate >= now && m.dueDate <= thirtyDaysFromNow)
      .sort((a, b) => a.dueDate - b.dueDate)
      .slice(0, limit);

    // Enrich with project title, assignee data, and computed fields
    const enrichedMilestones = await Promise.all(
      upcomingMilestones.map(async (milestone) => {
        let projectTitle;
        let assigneeName;
        let assigneeEmail;
        let assigneeAvatar;

        // Get project title
        if (milestone.projectId) {
          const project = await ctx.db.get(milestone.projectId);
          projectTitle = project?.title;
        }

        // Get assignee data
        if (milestone.assignedTo) {
          const assignee = await ctx.db.get(milestone.assignedTo);
          if (assignee) {
            assigneeName = assignee.name;
            assigneeEmail = assignee.email;
            assigneeAvatar = assignee.avatar;
          }
        }

        return {
          ...milestone,
          projectTitle,
          assigneeName,
          assigneeEmail,
          assigneeAvatar,
          isOverdue: isMilestoneOverdue(milestone),
          isDelayed: isMilestoneDelayed(milestone),
        };
      })
    );

    return enrichedMilestones;
  },
});

/**
 * Get milestone by public ID
 * 🔒 Authentication: Optional (depends on project visibility)
 */
export const getMilestoneByPublicId = query({
  args: {
    publicId: v.string(),
  },
  handler: async (ctx, { publicId }) => {
    return await ctx.db
      .query('projectMilestones')
      .withIndex('by_public_id', (q) => q.eq('publicId', publicId))
      .first();
  },
});