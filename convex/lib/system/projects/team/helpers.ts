// convex/lib/boilerplate/projects/team/helpers.ts
/**
 * Internal helper functions for team management that can be called from mutations.
 * These contain the shared business logic without mutation wrappers.
 */

import type { MutationCtx, QueryCtx } from '@/generated/server';
import type { Id } from '@/generated/dataModel';
import { TEAM_CONSTANTS } from './constants';
import { validateMemberData, canAssignRole } from './utils';

/**
 * Internal helper: Add a member to a project
 * This contains the core business logic without auth checks
 */
export async function addMemberInternal(
  ctx: MutationCtx,
  data: {
    projectId: Id<'projects'>;
    userId: Id<'userProfiles'>;
    role?: 'owner' | 'admin' | 'member' | 'viewer';
    department?: string;
    jobTitle?: string;
    permissions?: string[];
    settings?: {
      emailNotifications?: boolean;
      canManageTasks?: boolean;
      canInviteMembers?: boolean;
      canEditProject?: boolean;
    };
  },
  invitingUser: {
    _id: Id<'userProfiles'>;
    name?: string;
    email?: string;
    role?: string;
  }
): Promise<Id<'projectMembers'>> {
  // Validate input data
  const errors = validateMemberData(data);
  if (errors.length > 0) {
    throw new Error(`Validation failed: ${errors.join(', ')}`);
  }

  // Verify project exists
  const project = await ctx.db.get(data.projectId);
  if (!project) {
    throw new Error('Project not found');
  }

  // Verify target user exists
  const targetUser = await ctx.db.get(data.userId);
  if (!targetUser) {
    throw new Error('User not found');
  }

  // Check if user is already a member
  const existingMember = await ctx.db
    .query('projectMembers')
    .withIndex('by_project', (q) => q.eq('projectId', data.projectId))
    .filter((q) =>
      q.and(
        q.eq(q.field('userId'), data.userId),
        q.eq(q.field('deletedAt'), undefined)
      )
    )
    .first();

  if (existingMember) {
    throw new Error('User is already a member of this project');
  }

  // Check member limit
  const currentMembers = await ctx.db
    .query('projectMembers')
    .withIndex('by_project', (q) => q.eq('projectId', data.projectId))
    .filter((q) => q.eq(q.field('deletedAt'), undefined))
    .collect();

  if (
    currentMembers.length >= TEAM_CONSTANTS.LIMITS.MAX_MEMBERS_PER_PROJECT
  ) {
    throw new Error(
      `Maximum ${TEAM_CONSTANTS.LIMITS.MAX_MEMBERS_PER_PROJECT} members allowed per project`
    );
  }

  const assignedRole = data.role || TEAM_CONSTANTS.ROLE.MEMBER;

  const now = Date.now();

  const memberData = {
    projectId: data.projectId,
    userId: data.userId,
    role: assignedRole,
    department: data.department,
    jobTitle: data.jobTitle,
    status: TEAM_CONSTANTS.STATUS.ACTIVE,
    joinedAt: now,
    lastActiveAt: now,
    invitedBy: invitingUser._id,
    invitedAt: now,
    invitationAcceptedAt: now,
    permissions: data.permissions,
    settings: {
      emailNotifications: true,
      canManageTasks:
        assignedRole === TEAM_CONSTANTS.ROLE.ADMIN ||
        assignedRole === TEAM_CONSTANTS.ROLE.OWNER,
      canInviteMembers:
        assignedRole === TEAM_CONSTANTS.ROLE.ADMIN ||
        assignedRole === TEAM_CONSTANTS.ROLE.OWNER,
      canEditProject:
        assignedRole === TEAM_CONSTANTS.ROLE.ADMIN ||
        assignedRole === TEAM_CONSTANTS.ROLE.OWNER,
      ...data.settings,
    },
    extendedMetadata: undefined,
    metadata: {},
    createdAt: now,
    createdBy: invitingUser._id,
    updatedAt: now,
    deletedAt: undefined,
    deletedBy: undefined,
  };

  const memberId = await ctx.db.insert('projectMembers', memberData);

  // Update project last activity
  await ctx.db.patch(data.projectId, {
    updatedAt: now,
    lastActivityAt: now,
  });

  // Create notification
  await ctx.db.insert('notifications', {
    userId: data.userId,
    type: 'assignment',
    title: 'Added to Project',
    message: `You've been added as a ${assignedRole} to '${project.title}'`,
    emoji: '👥',
    isRead: false,
    actionUrl: `/projects/${data.projectId}`,
    entityType: 'boilerplate_project_member',
    entityId: memberId,
    createdAt: now,
    updatedAt: now,
    createdBy: invitingUser._id,
  });

  // Create audit log
  await ctx.db.insert('auditLogs', {
    userId: invitingUser._id,
    userName: invitingUser.name || invitingUser.email || 'Unknown User',
    action: 'member.added',
    entityType: 'boilerplate_project_member',
    entityId: memberId,
    entityTitle: `Member added to ${project.title}`,
    description: `Added ${targetUser.name || targetUser.email} to project '${project.title}' as ${assignedRole}`,
    metadata: {
      projectId: data.projectId,
      addedUserId: data.userId,
      role: assignedRole,
    },
    createdAt: now,
    createdBy: invitingUser._id,
    updatedAt: now,
  });

  return memberId;
}

/**
 * Internal helper: Remove a member from a project
 */
export async function removeMemberInternal(
  ctx: MutationCtx,
  memberId: Id<'projectMembers'>,
  removingUser: {
    _id: Id<'userProfiles'>;
    name?: string;
    email?: string;
  }
): Promise<void> {
  const member = await ctx.db.get(memberId);

  if (!member) {
    throw new Error('Member not found');
  }

  if (member.deletedAt) {
    throw new Error('Member already removed');
  }

  // Get project
  const project = await ctx.db.get(member.projectId);
  if (!project) {
    throw new Error('Project not found');
  }

  const now = Date.now();

  // Soft delete
  await ctx.db.patch(memberId, {
    status: TEAM_CONSTANTS.STATUS.REMOVED,
    deletedAt: now,
    deletedBy: removingUser._id,
    updatedAt: now,
  });

  // Update project last activity
  await ctx.db.patch(member.projectId, {
    updatedAt: now,
    lastActivityAt: now,
  });

  // Get removed user details for audit log
  const removedUser = await ctx.db.get(member.userId);

  // Create audit log
  await ctx.db.insert('auditLogs', {
    userId: removingUser._id,
    userName: removingUser.name || removingUser.email || 'Unknown User',
    action: 'member.removed',
    entityType: 'boilerplate_project_member',
    entityId: memberId,
    entityTitle: `Member removed from ${project.title}`,
    description: `Removed ${removedUser?.name || removedUser?.email || 'user'} from project '${project.title}'`,
    metadata: {
      projectId: member.projectId,
      removedUserId: member.userId,
      previousRole: member.role,
    },
    createdAt: now,
    createdBy: removingUser._id,
    updatedAt: now,
  });
}

/**
 * Internal helper: Update a member's role
 */
export async function updateMemberRoleInternal(
  ctx: MutationCtx,
  memberId: Id<'projectMembers'>,
  newRole: 'owner' | 'admin' | 'member' | 'viewer',
  updatingUser: {
    _id: Id<'userProfiles'>;
    name?: string;
    email?: string;
  }
): Promise<void> {
  const member = await ctx.db.get(memberId);

  if (!member) {
    throw new Error('Member not found');
  }

  if (member.deletedAt) {
    throw new Error('Cannot update removed member');
  }

  // Cannot change owner role
  if (member.role === TEAM_CONSTANTS.ROLE.OWNER) {
    throw new Error('Cannot change project owner role');
  }

  // Get project
  const project = await ctx.db.get(member.projectId);
  if (!project) {
    throw new Error('Project not found');
  }

  const now = Date.now();
  const oldRole = member.role;

  // Update role and related permissions
  const settings = {
    ...member.settings,
    canManageTasks:
      newRole === TEAM_CONSTANTS.ROLE.ADMIN ||
      newRole === TEAM_CONSTANTS.ROLE.OWNER,
    canInviteMembers:
      newRole === TEAM_CONSTANTS.ROLE.ADMIN ||
      newRole === TEAM_CONSTANTS.ROLE.OWNER,
    canEditProject:
      newRole === TEAM_CONSTANTS.ROLE.ADMIN ||
      newRole === TEAM_CONSTANTS.ROLE.OWNER,
  };

  await ctx.db.patch(memberId, {
    role: newRole,
    settings,
    updatedAt: now,
  });

  // Update project last activity
  await ctx.db.patch(member.projectId, {
    updatedAt: now,
    lastActivityAt: now,
  });

  // Get member user details
  const memberUser = await ctx.db.get(member.userId);

  // Create audit log
  await ctx.db.insert('auditLogs', {
    userId: updatingUser._id,
    userName: updatingUser.name || updatingUser.email || 'Unknown User',
    action: 'member.role_changed',
    entityType: 'boilerplate_project_member',
    entityId: memberId,
    entityTitle: `Member role updated in ${project.title}`,
    description: `Changed ${memberUser?.name || memberUser?.email || 'user'} role from ${oldRole} to ${newRole} in project '${project.title}'`,
    metadata: {
      projectId: member.projectId,
      userId: member.userId,
      oldRole,
      newRole: newRole,
    },
    createdAt: now,
    createdBy: updatingUser._id,
    updatedAt: now,
  });
}
