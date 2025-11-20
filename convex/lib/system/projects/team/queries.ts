// convex/lib/system/projects/team/queries.ts

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { TEAM_CONSTANTS } from './constants';
import { requireViewTeamAccess, filterMembersByAccess } from './permissions';
import type { TeamStats } from './types';
import { getMemberActivityStatus } from './utils';

/**
 * Get all members of a project
 * 🔒 Authentication: Required
 * 🔒 Authorization: Must have project view access
 */
export const getProjectMembers = query({
  args: {
    projectId: v.id('projects'),
    options: v.optional(
      v.object({
        limit: v.optional(v.number()),
        offset: v.optional(v.number()),
        sortBy: v.optional(v.string()),
        sortOrder: v.optional(v.union(v.literal('asc'), v.literal('desc'))),
        filters: v.optional(
          v.object({
            role: v.optional(v.array(v.string())),
            status: v.optional(v.array(v.string())),
            department: v.optional(v.string()),
            search: v.optional(v.string()),
          })
        ),
      })
    ),
  },
  handler: async (ctx, { projectId, options = {} }) => {
    const user = await requireCurrentUser(ctx);

    // Check permission
    await requireViewTeamAccess(ctx, projectId, user);

    // Verify project exists
    const project = await ctx.db.get(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const {
      limit = 50,
      offset = 0,
      sortBy = 'joinedAt',
      sortOrder = 'desc',
      filters = {},
    } = options;

    const { role, status, department, search } = filters;

    // Use index to fetch members
    let membersQuery = ctx.db
      .query('projectMembers')
      .withIndex('by_project', (q) => q.eq('projectId', projectId));

    // Filter out soft-deleted members
    membersQuery = membersQuery.filter((q) =>
      q.eq(q.field('deletedAt'), undefined)
    );

    // Apply filters
    if (role && role.length > 0) {
      membersQuery = membersQuery.filter((q) =>
        q.or(...role.map((r) => q.eq(q.field('role'), r)))
      );
    }

    if (status && status.length > 0) {
      membersQuery = membersQuery.filter((q) =>
        q.or(...status.map((s) => q.eq(q.field('status'), s)))
      );
    }

    if (department) {
      membersQuery = membersQuery.filter((q) =>
        q.eq(q.field('department'), department)
      );
    }

    const members = await membersQuery.collect();

    // Apply search filter
    let filteredMembers = members;
    if (search) {
      const searchTerm = search.toLowerCase();
      
      // Fetch user profiles for search
      const membersWithProfiles = await Promise.all(
        members.map(async (member) => {
          const userProfile = await ctx.db.get(member.userId);
          return { member, userProfile };
        })
      );

      filteredMembers = membersWithProfiles
        .filter(({ member, userProfile }) => {
          if (!userProfile) return false;
          
          return (
            userProfile.name?.toLowerCase().includes(searchTerm) ||
            userProfile.email?.toLowerCase().includes(searchTerm) ||
            member.department?.toLowerCase().includes(searchTerm) ||
            member.jobTitle?.toLowerCase().includes(searchTerm)
          );
        })
        .map(({ member }) => member);
    }

    // Sort members
    filteredMembers.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'joinedAt':
          aValue = a.joinedAt;
          bValue = b.joinedAt;
          break;
        case 'lastActiveAt':
          aValue = a.lastActiveAt || 0;
          bValue = b.lastActiveAt || 0;
          break;
        case 'role':
          const roleOrder = { owner: 4, admin: 3, member: 2, viewer: 1 };
          aValue = roleOrder[a.role as keyof typeof roleOrder] || 0;
          bValue = roleOrder[b.role as keyof typeof roleOrder] || 0;
          break;
        default:
          aValue = a.joinedAt;
          bValue = b.joinedAt;
      }

      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }
    });

    // Paginate
    const total = filteredMembers.length;
    const paginatedMembers = filteredMembers.slice(offset, offset + limit);

    // Enrich with user profile data
    const enrichedMembers = await Promise.all(
      paginatedMembers.map(async (member) => {
        const userProfile = await ctx.db.get(member.userId);
        return {
          ...member,
          userProfile: userProfile
            ? {
                _id: userProfile._id,
                name: userProfile.name,
                email: userProfile.email,
                avatar: userProfile.avatar,
                role: userProfile.role,
              }
            : null,
          activityStatus: getMemberActivityStatus(member),
        };
      })
    );

    return {
      members: enrichedMembers,
      total,
      hasMore: total > offset + limit,
    };
  },
});

/**
 * Get a single project member
 * 🔒 Authentication: Required
 * 🔒 Authorization: Must have project view access
 */
export const getMember = query({
  args: {
    memberId: v.id('projectMembers'),
  },
  handler: async (ctx, { memberId }) => {
    const user = await requireCurrentUser(ctx);
    
    // ✅ Direct O(1) lookup
    const member = await ctx.db.get(memberId);

    if (!member) {
      throw new Error('Member not found');
    }

    if (member.deletedAt) {
      throw new Error('Member has been removed');
    }

    // Check permission
    await requireViewTeamAccess(ctx, member.projectId, user);

    // Get user profile
    const userProfile = await ctx.db.get(member.userId);

    // Get project
    const project = await ctx.db.get(member.projectId);

    return {
      ...member,
      userProfile: userProfile
        ? {
            _id: userProfile._id,
            name: userProfile.name,
            email: userProfile.email,
            avatar: userProfile.avatar,
            role: userProfile.role,
          }
        : null,
      projectTitle: project?.title,
      activityStatus: getMemberActivityStatus(member),
    };
  },
});

/**
 * Get user's project memberships
 * 🔒 Authentication: Required
 * 🔒 Authorization: Own memberships or admin
 */
export const getUserMemberships = query({
  args: {
    targetUserId: v.optional(v.id('userProfiles')),
  },
  handler: async (ctx, { targetUserId }) => {
    const user = await requireCurrentUser(ctx);
    const userId = targetUserId || user._id;

    // Only allow viewing own memberships unless admin
    if (
      userId !== user._id &&
      user.role !== 'admin' &&
      user.role !== 'superadmin'
    ) {
      throw new Error('Permission denied: You can only view your own memberships');
    }

    // Use index to fetch memberships efficiently
    const memberships = await ctx.db
      .query('projectMembers')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .filter((q) =>
        q.and(
          q.eq(q.field('deletedAt'), undefined),
          q.eq(q.field('status'), TEAM_CONSTANTS.STATUS.ACTIVE)
        )
      )
      .order('desc')
      .collect();

    // Get project details for each membership
    const projectsWithRoles = await Promise.all(
      memberships.map(async (membership) => {
        const project = await ctx.db.get(membership.projectId);
        return {
          membership,
          project: project
            ? {
                _id: project._id,
                title: project.title,
                description: project.description,
                status: project.status,
                priority: project.priority,
                visibility: project.visibility,
                ownerId: project.ownerId,
                progress: project.progress,
                dueDate: project.dueDate,
                lastActivityAt: project.lastActivityAt,
              }
            : null,
        };
      })
    );

    return {
      memberships: projectsWithRoles.filter((p) => p.project !== null),
      total: projectsWithRoles.filter((p) => p.project !== null).length,
    };
  },
});

/**
 * Get team statistics for a project
 * 🔒 Authentication: Required
 * 🔒 Authorization: Must have project view access
 */
export const getTeamStats = query({
  args: {
    projectId: v.id('projects'),
  },
  handler: async (ctx, { projectId }) => {
    const user = await requireCurrentUser(ctx);

    // Check permission
    await requireViewTeamAccess(ctx, projectId, user);

    // Verify project exists
    const project = await ctx.db.get(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const members = await ctx.db
      .query('projectMembers')
      .withIndex('by_project', (q) => q.eq('projectId', projectId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Calculate department distribution
    const byDepartment: Record<string, number> = {};
    members.forEach((member) => {
      if (member.department) {
        byDepartment[member.department] =
          (byDepartment[member.department] || 0) + 1;
      }
    });

    const stats: TeamStats = {
      totalMembers: members.length,
      activeMembers: members.filter(
        (m) => m.status === TEAM_CONSTANTS.STATUS.ACTIVE
      ).length,
      invitedMembers: members.filter(
        (m) => m.status === TEAM_CONSTANTS.STATUS.INVITED
      ).length,
      inactiveMembers: members.filter(
        (m) => m.status === TEAM_CONSTANTS.STATUS.INACTIVE
      ).length,
      byRole: {
        owners: members.filter((m) => m.role === TEAM_CONSTANTS.ROLE.OWNER)
          .length,
        admins: members.filter((m) => m.role === TEAM_CONSTANTS.ROLE.ADMIN)
          .length,
        members: members.filter((m) => m.role === TEAM_CONSTANTS.ROLE.MEMBER)
          .length,
        viewers: members.filter((m) => m.role === TEAM_CONSTANTS.ROLE.VIEWER)
          .length,
      },
      byDepartment,
    };

    return stats;
  },
});

/**
 * Check if a user is a member of a project
 * 🔒 Authentication: Required
 */
export const checkMembership = query({
  args: {
    projectId: v.id('projects'),
    userId: v.optional(v.id('userProfiles')),
  },
  handler: async (ctx, { projectId, userId }) => {
    const user = await requireCurrentUser(ctx);
    const targetUserId = userId || user._id;

    // Check membership for target user
    const membership = await ctx.db
      .query('projectMembers')
      .withIndex('by_project', (q) => q.eq('projectId', projectId))
      .filter((q) =>
        q.and(
          q.eq(q.field('userId'), targetUserId),
          q.eq(q.field('deletedAt'), undefined)
        )
      )
      .first();

    return {
      isMember: membership !== null,
      membership: membership || undefined,
      isActive:
        membership?.status === TEAM_CONSTANTS.STATUS.ACTIVE || false,
    };
  },
});

/**
 * Get project activity feed from audit logs
 * 🔒 Authentication: Required
 * 🔒 Authorization: Must have project view access
 */
export const getProjectActivity = query({
  args: {
    projectId: v.id('projects'),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    filterByMember: v.optional(v.id('userProfiles')),
    filterByAction: v.optional(v.string()),
  },
  handler: async (ctx, { projectId, limit = 50, offset = 0, filterByMember, filterByAction }) => {
    const user = await requireCurrentUser(ctx);

    // Check permission
    await requireViewTeamAccess(ctx, projectId, user);

    // Verify project exists
    const project = await ctx.db.get(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Get audit logs for this project
    let auditLogs = await ctx.db
      .query('auditLogs')
      .withIndex('by_entity', (q) =>
        q.eq('entityType', 'project').eq('entityId', project.publicId || projectId)
      )
      .order('desc')
      .collect();

    // Also get audit logs for tasks, milestones, and members in this project
    const tasks = await ctx.db
      .query('projectTasks')
      .withIndex('by_project', (q) => q.eq('projectId', projectId))
      .collect();

    const taskIds = tasks.map(t => t.publicId || t._id);
    const taskAuditLogs = await Promise.all(
      taskIds.map(taskId =>
        ctx.db
          .query('auditLogs')
          .withIndex('by_entity', (q) =>
            q.eq('entityType', 'task').eq('entityId', taskId)
          )
          .collect()
      )
    );

    const milestones = await ctx.db
      .query('projectMilestones')
      .withIndex('by_project', (q) => q.eq('projectId', projectId))
      .collect();

    const milestoneIds = milestones.map(m => m.publicId || m._id);
    const milestoneAuditLogs = await Promise.all(
      milestoneIds.map(milestoneId =>
        ctx.db
          .query('auditLogs')
          .withIndex('by_entity', (q) =>
            q.eq('entityType', 'milestone').eq('entityId', milestoneId)
          )
          .collect()
      )
    );

    const members = await ctx.db
      .query('projectMembers')
      .withIndex('by_project', (q) => q.eq('projectId', projectId))
      .collect();

    const memberIds = members.map(m => m._id);
    const memberAuditLogs = await Promise.all(
      memberIds.map(memberId =>
        ctx.db
          .query('auditLogs')
          .withIndex('by_entity', (q) =>
            q.eq('entityType', 'member').eq('entityId', memberId)
          )
          .collect()
      )
    );

    // Combine all audit logs
    const allAuditLogs = [
      ...auditLogs,
      ...taskAuditLogs.flat(),
      ...milestoneAuditLogs.flat(),
      ...memberAuditLogs.flat(),
    ];

    // Filter by member if specified
    let filteredLogs = filterByMember
      ? allAuditLogs.filter(log => log.userId === filterByMember)
      : allAuditLogs;

    // Filter by action if specified
    if (filterByAction) {
      filteredLogs = filteredLogs.filter(log => log.action === filterByAction);
    }

    // Sort by timestamp descending
    filteredLogs.sort((a, b) => b.createdAt - a.createdAt);

    // Paginate
    const total = filteredLogs.length;
    const paginatedLogs = filteredLogs.slice(offset, offset + limit);

    // Enrich with user profiles
    const enrichedLogs = await Promise.all(
      paginatedLogs.map(async (log) => {
        const userProfile = await ctx.db.get(log.userId);
        return {
          ...log,
          userProfile: userProfile
            ? {
                _id: userProfile._id,
                name: userProfile.name,
                email: userProfile.email,
                avatar: userProfile.avatar,
              }
            : null,
        };
      })
    );

    return {
      activities: enrichedLogs,
      total,
      hasMore: total > offset + limit,
    };
  },
});

/**
 * Get member workload statistics for a project
 * 🔒 Authentication: Required
 * 🔒 Authorization: Must have project view access
 */
export const getMemberWorkload = query({
  args: {
    projectId: v.id('projects'),
  },
  handler: async (ctx, { projectId }) => {
    const user = await requireCurrentUser(ctx);

    // Check permission
    await requireViewTeamAccess(ctx, projectId, user);

    // Verify project exists
    const project = await ctx.db.get(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Get all active members
    const members = await ctx.db
      .query('projectMembers')
      .withIndex('by_project', (q) => q.eq('projectId', projectId))
      .filter((q) =>
        q.and(
          q.eq(q.field('deletedAt'), undefined),
          q.eq(q.field('status'), TEAM_CONSTANTS.STATUS.ACTIVE)
        )
      )
      .collect();

    // Get all tasks for this project
    const allTasks = await ctx.db
      .query('projectTasks')
      .withIndex('by_project', (q) => q.eq('projectId', projectId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Calculate workload for each member
    const memberWorkloads = await Promise.all(
      members.map(async (member) => {
        const userProfile = await ctx.db.get(member.userId);
        const assignedTasks = allTasks.filter(task => task.assignedTo === member.userId);

        const tasksByStatus = {
          todo: assignedTasks.filter(t => t.status === 'todo').length,
          inProgress: assignedTasks.filter(t => t.status === 'in_progress').length,
          inReview: assignedTasks.filter(t => t.status === 'in_review').length,
          completed: assignedTasks.filter(t => t.status === 'completed').length,
          blocked: assignedTasks.filter(t => t.status === 'blocked').length,
          cancelled: assignedTasks.filter(t => t.status === 'cancelled').length,
        };

        const overdueTasks = assignedTasks.filter(task =>
          task.dueDate && task.dueDate < Date.now() && task.status !== 'completed' && task.status !== 'cancelled'
        ).length;

        const totalEstimatedHours = assignedTasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);
        const totalActualHours = assignedTasks.reduce((sum, task) => sum + (task.actualHours || 0), 0);

        return {
          memberId: member._id,
          userId: member.userId,
          userProfile: userProfile
            ? {
                _id: userProfile._id,
                name: userProfile.name,
                email: userProfile.email,
                avatar: userProfile.avatar,
              }
            : null,
          role: member.role,
          totalTasks: assignedTasks.length,
          tasksByStatus,
          overdueTasks,
          estimatedHours: totalEstimatedHours,
          actualHours: totalActualHours,
          completionRate: assignedTasks.length > 0
            ? (tasksByStatus.completed / assignedTasks.length) * 100
            : 0,
        };
      })
    );

    // Calculate unassigned tasks
    const unassignedTasks = allTasks.filter(task => !task.assignedTo).length;

    // Sort by total tasks descending
    memberWorkloads.sort((a, b) => b.totalTasks - a.totalTasks);

    return {
      memberWorkloads,
      unassignedTasks,
      totalTasks: allTasks.length,
      averageTasksPerMember: members.length > 0
        ? (allTasks.length - unassignedTasks) / members.length
        : 0,
    };
  },
});