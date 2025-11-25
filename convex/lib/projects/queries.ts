// convex/lib/projects/queries.ts
// Read operations for projects module

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, getCurrentUser } from '@/shared/auth.helper';
import { notDeleted } from '@/shared/db.helper';
import { projectsValidators } from '@/schema/projects/validators';
import { PROJECTS_CONSTANTS } from './constants';
import { requireViewProjectAccess, filterProjectsByAccess } from './permissions';
import { isProjectOverdue } from './utils';
import type { ProjectListResponse, ProjectStats } from './types';

/**
 * Get paginated list of projects with filtering
 */
export const getProjects = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    sortBy: v.optional(v.string()),
    sortOrder: v.optional(v.union(v.literal('asc'), v.literal('desc'))),
    filters: v.optional(
      v.object({
        status: v.optional(v.array(projectsValidators.status)),
        priority: v.optional(v.array(projectsValidators.priority)),
        visibility: v.optional(v.array(projectsValidators.visibility)),
        category: v.optional(v.string()),
        ownerId: v.optional(v.id('userProfiles')),
        search: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args): Promise<ProjectListResponse> => {
    const user = await requireCurrentUser(ctx);
    const {
      limit = 50,
      offset = 0,
      sortBy = 'lastActivityAt',
      sortOrder = 'desc',
      filters = {},
    } = args;

    let projects = await ctx.db
      .query('projects')
      .filter(notDeleted)
      .collect();

    // Apply filters
    if (filters.status?.length) {
      projects = projects.filter((p) => filters.status!.includes(p.status));
    }

    if (filters.priority?.length) {
      projects = projects.filter((p) => filters.priority!.includes(p.priority));
    }

    if (filters.visibility?.length) {
      projects = projects.filter((p) => filters.visibility!.includes(p.visibility));
    }

    if (filters.category) {
      projects = projects.filter((p) => p.category === filters.category);
    }

    if (filters.ownerId) {
      projects = projects.filter((p) => p.ownerId === filters.ownerId);
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      projects = projects.filter(
        (project) =>
          project.title.toLowerCase().includes(searchTerm) ||
          project.description?.toLowerCase().includes(searchTerm) ||
          project.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Apply access filtering
    const accessibleProjects = await filterProjectsByAccess(ctx, projects, user);

    // Pagination
    const total = accessibleProjects.length;
    const paginatedProjects = accessibleProjects.slice(offset, offset + limit);

    return {
      projects: paginatedProjects,
      total,
      hasMore: total > offset + limit,
    };
  },
});

/**
 * Get single project by ID
 */
export const getProject = query({
  args: {
    projectId: v.id('projects'),
  },
  handler: async (ctx, { projectId }) => {
    const user = await requireCurrentUser(ctx);

    const project = await ctx.db.get(projectId);
    if (!project || project.deletedAt) {
      throw new Error('Project not found');
    }

    await requireViewProjectAccess(ctx, project, user);

    // Fetch members with their details
    const members = await ctx.db
      .query('projectMembers')
      .withIndex('by_project_id', (q) => q.eq('projectId', projectId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    const userProfiles = await Promise.all(
      members.map((member) => ctx.db.get(member.userId))
    );

    const memberDetails = members.map((member, index) => {
      const userProfile = userProfiles[index];
      return {
        userId: member.userId,
        role: member.role,
        status: member.status,
        joinedAt: member.joinedAt,
        department: member.department,
        jobTitle: member.jobTitle,
        name: userProfile?.name,
        email: userProfile?.email,
      };
    });

    return {
      ...project,
      isOverdue: isProjectOverdue(project),
      memberDetails,
    };
  },
});

/**
 * Get project by public ID
 */
export const getProjectByPublicId = query({
  args: {
    publicId: v.string(),
  },
  handler: async (ctx, { publicId }) => {
    const user = await requireCurrentUser(ctx);

    const project = await ctx.db
      .query('projects')
      .withIndex('by_public_id', (q) => q.eq('publicId', publicId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (!project) {
      throw new Error('Project not found');
    }

    await requireViewProjectAccess(ctx, project, user);

    const members = await ctx.db
      .query('projectMembers')
      .withIndex('by_project_id', (q) => q.eq('projectId', project._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    const memberDetails = await Promise.all(
      members.map(async (member) => {
        const userProfile = await ctx.db.get(member.userId);
        return {
          userId: member.userId,
          role: member.role,
          status: member.status,
          joinedAt: member.joinedAt,
          name: userProfile?.name,
          email: userProfile?.email,
        };
      })
    );

    return {
      ...project,
      isOverdue: isProjectOverdue(project),
      memberDetails,
    };
  },
});

/**
 * Get user's own projects (owned + collaborated)
 */
export const getUserProjects = query({
  args: {
    targetUserId: v.optional(v.id('userProfiles')),
    includeArchived: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { targetUserId, includeArchived = false, limit = 100 }) => {
    const user = await requireCurrentUser(ctx);
    const userId = targetUserId || user._id;

    // Only allow viewing own projects unless admin
    if (
      userId !== user._id &&
      user.role !== 'admin' &&
      user.role !== 'superadmin'
    ) {
      throw new Error('Permission denied: You can only view your own projects');
    }

    // 1. Owned projects
    let ownedQuery = ctx.db
      .query('projects')
      .withIndex('by_owner', (q) => q.eq('ownerId', userId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .order('desc');

    if (!includeArchived) {
      ownedQuery = ownedQuery.filter((q) =>
        q.and(
          q.neq(q.field('status'), PROJECTS_CONSTANTS.STATUS.CANCELLED),
          q.neq(q.field('status'), PROJECTS_CONSTANTS.STATUS.COMPLETED)
        )
      );
    }

    const ownedProjects = await ownedQuery.take(limit);

    // 2. Member projects
    const memberships = await ctx.db
      .query('projectMembers')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .filter((q) =>
        q.and(
          q.eq(q.field('deletedAt'), undefined),
          q.eq(q.field('status'), 'active')
        )
      )
      .order('desc')
      .take(limit);

    const memberProjectsWithNull = await Promise.all(
      memberships.map((membership) => ctx.db.get(membership.projectId))
    );

    let collaboratedProjects = memberProjectsWithNull.filter(
      (p): p is NonNullable<typeof p> => p !== null && p.ownerId !== userId && !p.deletedAt
    );

    if (!includeArchived) {
      collaboratedProjects = collaboratedProjects.filter(
        (p) =>
          p.status !== PROJECTS_CONSTANTS.STATUS.CANCELLED &&
          p.status !== PROJECTS_CONSTANTS.STATUS.COMPLETED
      );
    }

    const stats = {
      totalOwned: ownedProjects.length,
      totalCollaborated: collaboratedProjects.length,
      activeOwned: ownedProjects.filter(
        (p) => p.status === PROJECTS_CONSTANTS.STATUS.ACTIVE
      ).length,
      activeCollaborated: collaboratedProjects.filter(
        (p) => p.status === PROJECTS_CONSTANTS.STATUS.ACTIVE
      ).length,
    };

    return {
      owned: ownedProjects,
      collaborated: collaboratedProjects,
      stats,
    };
  },
});

/**
 * Get project statistics
 */
export const getProjectStats = query({
  args: {
    targetUserId: v.optional(v.id('userProfiles')),
  },
  handler: async (ctx, { targetUserId }): Promise<ProjectStats> => {
    const user = await requireCurrentUser(ctx);
    const userId = targetUserId || user._id;

    if (
      userId !== user._id &&
      user.role !== 'admin' &&
      user.role !== 'superadmin'
    ) {
      throw new Error('Permission denied: You can only view your own stats');
    }

    const ownedProjects = await ctx.db
      .query('projects')
      .withIndex('by_owner', (q) => q.eq('ownerId', userId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    const memberships = await ctx.db
      .query('projectMembers')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .filter((q) =>
        q.and(
          q.eq(q.field('deletedAt'), undefined),
          q.eq(q.field('status'), 'active')
        )
      )
      .collect();

    const memberProjectsWithNull = await Promise.all(
      memberships.map((membership) => ctx.db.get(membership.projectId))
    );

    const collaboratedProjects = memberProjectsWithNull.filter(
      (p): p is NonNullable<typeof p> => p !== null && p.ownerId !== userId && !p.deletedAt
    );

    const allAccessibleProjects = [...ownedProjects, ...collaboratedProjects];

    const now = Date.now();
    const sevenDaysFromNow = now + 7 * 24 * 60 * 60 * 1000;
    const atRiskProjects = allAccessibleProjects.filter(
      (p) =>
        p.dueDate &&
        p.dueDate > now &&
        p.dueDate <= sevenDaysFromNow &&
        p.status !== PROJECTS_CONSTANTS.STATUS.COMPLETED
    ).length;

    const projectsByStatus = {
      active: allAccessibleProjects.filter((p) => p.status === PROJECTS_CONSTANTS.STATUS.ACTIVE).length,
      completed: allAccessibleProjects.filter((p) => p.status === PROJECTS_CONSTANTS.STATUS.COMPLETED).length,
      archived: allAccessibleProjects.filter((p) => p.status === PROJECTS_CONSTANTS.STATUS.ARCHIVED).length,
      on_hold: allAccessibleProjects.filter((p) => p.status === PROJECTS_CONSTANTS.STATUS.ON_HOLD).length,
    };

    const projectsByPriority = {
      low: allAccessibleProjects.filter((p) => p.priority === PROJECTS_CONSTANTS.PRIORITY.LOW).length,
      medium: allAccessibleProjects.filter((p) => p.priority === PROJECTS_CONSTANTS.PRIORITY.MEDIUM).length,
      high: allAccessibleProjects.filter((p) => p.priority === PROJECTS_CONSTANTS.PRIORITY.HIGH).length,
      urgent: allAccessibleProjects.filter((p) => p.priority === PROJECTS_CONSTANTS.PRIORITY.URGENT).length,
    };

    const projectsByCategory: Record<string, number> = {};
    allAccessibleProjects.forEach((p) => {
      if (p.category) {
        projectsByCategory[p.category] = (projectsByCategory[p.category] || 0) + 1;
      }
    });

    const totalBudget = allAccessibleProjects.reduce((sum, p) => {
      const budget = p.extendedMetadata?.budget || 0;
      return sum + budget;
    }, 0);

    return {
      totalProjects: allAccessibleProjects.length,
      activeProjects: projectsByStatus.active,
      completedProjects: projectsByStatus.completed,
      archivedProjects: projectsByStatus.archived,
      onHoldProjects: projectsByStatus.on_hold,
      overdueProjects: allAccessibleProjects.filter((p) => isProjectOverdue(p)).length,
      atRiskProjects,
      averageProgress:
        allAccessibleProjects.length > 0
          ? Math.round(
              allAccessibleProjects.reduce((acc, p) => acc + p.progress.percentage, 0) /
                allAccessibleProjects.length
            )
          : 0,
      totalBudget,
      projectsByStatus,
      projectsByPriority,
      projectsByCategory,
    };
  },
});

/**
 * Get dashboard stats
 */
export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const ownedProjects = await ctx.db
      .query('projects')
      .withIndex('by_owner', (q) => q.eq('ownerId', user._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    const memberships = await ctx.db
      .query('projectMembers')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .filter((q) =>
        q.and(
          q.eq(q.field('deletedAt'), undefined),
          q.eq(q.field('status'), 'active')
        )
      )
      .collect();

    const memberProjectsWithNull = await Promise.all(
      memberships.map((membership) => ctx.db.get(membership.projectId))
    );

    const collaboratedProjects = memberProjectsWithNull.filter(
      (p): p is NonNullable<typeof p> => p !== null && p.ownerId !== user._id && !p.deletedAt
    );

    const accessibleProjects = [...ownedProjects, ...collaboratedProjects];
    const now = Date.now();

    const sevenDaysFromNow = now + 7 * 24 * 60 * 60 * 1000;
    const atRiskProjects = accessibleProjects.filter(
      (p) =>
        p.dueDate &&
        p.dueDate > now &&
        p.dueDate <= sevenDaysFromNow &&
        p.status !== PROJECTS_CONSTANTS.STATUS.COMPLETED
    ).length;

    const projectsByStatus = {
      active: accessibleProjects.filter((p) => p.status === PROJECTS_CONSTANTS.STATUS.ACTIVE).length,
      completed: accessibleProjects.filter((p) => p.status === PROJECTS_CONSTANTS.STATUS.COMPLETED).length,
      archived: accessibleProjects.filter((p) => p.status === PROJECTS_CONSTANTS.STATUS.ARCHIVED).length,
      on_hold: accessibleProjects.filter((p) => p.status === PROJECTS_CONSTANTS.STATUS.ON_HOLD).length,
    };

    const projectsByPriority = {
      low: accessibleProjects.filter((p) => p.priority === PROJECTS_CONSTANTS.PRIORITY.LOW).length,
      medium: accessibleProjects.filter((p) => p.priority === PROJECTS_CONSTANTS.PRIORITY.MEDIUM).length,
      high: accessibleProjects.filter((p) => p.priority === PROJECTS_CONSTANTS.PRIORITY.HIGH).length,
      urgent: accessibleProjects.filter((p) => p.priority === PROJECTS_CONSTANTS.PRIORITY.URGENT).length,
    };

    const projectsByCategory: Record<string, number> = {};
    accessibleProjects.forEach((p) => {
      if (p.category) {
        projectsByCategory[p.category] = (projectsByCategory[p.category] || 0) + 1;
      }
    });

    const totalBudget = accessibleProjects.reduce((sum, p) => {
      const budget = p.extendedMetadata?.budget || 0;
      return sum + budget;
    }, 0);

    return {
      totalProjects: accessibleProjects.length,
      activeProjects: projectsByStatus.active,
      completedProjects: projectsByStatus.completed,
      archivedProjects: projectsByStatus.archived,
      onHoldProjects: projectsByStatus.on_hold,
      overdueProjects: accessibleProjects.filter(
        (p) =>
          p.dueDate &&
          p.dueDate < now &&
          p.status !== PROJECTS_CONSTANTS.STATUS.COMPLETED
      ).length,
      atRiskProjects,
      averageProgress:
        accessibleProjects.length > 0
          ? Math.round(
              accessibleProjects.reduce((sum, p) => sum + p.progress.percentage, 0) /
                accessibleProjects.length
            )
          : 0,
      totalBudget,
      projectsByStatus,
      projectsByPriority,
      projectsByCategory,
    };
  },
});

/**
 * Get project members
 */
export const getProjectMembers = query({
  args: {
    projectId: v.id('projects'),
  },
  handler: async (ctx, { projectId }) => {
    const user = await requireCurrentUser(ctx);
    const project = await ctx.db.get(projectId);

    if (!project || project.deletedAt) {
      throw new Error('Project not found');
    }

    await requireViewProjectAccess(ctx, project, user);

    const members = await ctx.db
      .query('projectMembers')
      .withIndex('by_project_id', (q) => q.eq('projectId', projectId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    const memberDetails = await Promise.all(
      members.map(async (member) => {
        const userProfile = await ctx.db.get(member.userId);
        return {
          memberId: member._id,
          userId: member.userId,
          role: member.role,
          status: member.status,
          joinedAt: member.joinedAt,
          invitedBy: member.invitedBy,
          department: member.department,
          jobTitle: member.jobTitle,
          name: userProfile?.name,
          email: userProfile?.email,
          avatar: userProfile?.avatar,
        };
      })
    );

    return memberDetails;
  },
});
