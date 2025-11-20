// convex/lib/system/projects/team/permissions.ts

import { QueryCtx, MutationCtx } from '@/generated/server';
import { Doc } from '@/generated/dataModel';
import { TEAM_CONSTANTS } from './constants';
import { UserProfile } from '../../user_profiles';
import { throwPermissionError, throwAccessError } from '@/shared/errors';
import { canViewProject, canEditProject, canManageTeam } from '../permissions';
import { canManageMember, getRoleWeight } from './utils';

/**
 * Check if user can view team members
 * Inherits from project view permissions
 */
export async function canViewTeamMembers(
  ctx: QueryCtx | MutationCtx,
  projectId: Doc<'projects'>['_id'],
  user: UserProfile
): Promise<boolean> {
  // Admins can view everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Check if user can view the project
  const project = await ctx.db.get(projectId);
  if (!project) return false;

  return await canViewProject(ctx, project, user);
}

/**
 * Check if user can add members to project
 */
export async function canAddMember(
  ctx: QueryCtx | MutationCtx,
  projectId: Doc<'projects'>['_id'],
  user: UserProfile
): Promise<boolean> {
  // Admins can add members everywhere
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Check project team management permissions
  const project = await ctx.db.get(projectId);
  if (!project) return false;

  return await canManageTeam(ctx, project, user);
}

/**
 * Check if user can update a specific member
 */
export async function canUpdateMember(
  ctx: QueryCtx | MutationCtx,
  member: Doc<'projectMembers'>,
  user: UserProfile,
  newRole?: Doc<'projectMembers'>['role']
): Promise<boolean> {
  // Admins can update everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Users can update their own profile (but not role)
  if (member.userId === user._id && !newRole) {
    return true;
  }

  // Get project
  const project = await ctx.db.get(member.projectId);
  if (!project) return false;

  // Check if user has team management permission
  const hasTeamManagement = await canManageTeam(ctx, project, user);
  if (!hasTeamManagement) return false;

  // Get current user's membership
  const currentUserMember = await ctx.db
    .query('projectMembers')
    .withIndex('by_project', (q) => q.eq('projectId', member.projectId))
    .filter((q) =>
      q.and(
        q.eq(q.field('userId'), user._id),
        q.eq(q.field('deletedAt'), undefined)
      )
    )
    .first();

  if (!currentUserMember) return false;

  // Check role hierarchy if changing role
  if (newRole) {
    // Can't assign a role higher than or equal to your own
    if (getRoleWeight(newRole) >= getRoleWeight(currentUserMember.role)) {
      return false;
    }
  }

  // Can manage member based on role hierarchy
  return canManageMember(currentUserMember.role, member.role);
}

/**
 * Check if user can remove a member
 */
export async function canRemoveMember(
  ctx: QueryCtx | MutationCtx,
  member: Doc<'projectMembers'>,
  user: UserProfile
): Promise<boolean> {
  // Cannot remove project owner
  if (member.role === TEAM_CONSTANTS.ROLE.OWNER) {
    return false;
  }

  // Admins can remove members
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Get project
  const project = await ctx.db.get(member.projectId);
  if (!project) return false;

  // Check if user has team management permission
  const hasTeamManagement = await canManageTeam(ctx, project, user);
  if (!hasTeamManagement) return false;

  // Get current user's membership
  const currentUserMember = await ctx.db
    .query('projectMembers')
    .withIndex('by_project', (q) => q.eq('projectId', member.projectId))
    .filter((q) =>
      q.and(
        q.eq(q.field('userId'), user._id),
        q.eq(q.field('deletedAt'), undefined)
      )
    )
    .first();

  if (!currentUserMember) return false;

  // Can manage member based on role hierarchy
  return canManageMember(currentUserMember.role, member.role);
}

/**
 * Require permission to view team or throw
 */
export async function requireViewTeamAccess(
  ctx: QueryCtx | MutationCtx,
  projectId: Doc<'projects'>['_id'],
  user: UserProfile
): Promise<void> {
  const hasAccess = await canViewTeamMembers(ctx, projectId, user);
  if (!hasAccess) {
    throwAccessError(`You don't have permission to view team members`, {
      permission: TEAM_CONSTANTS.PERMISSIONS.VIEW,
      module: 'Team',
    });
  }
}

/**
 * Require permission to add member or throw
 */
export async function requireAddMemberAccess(
  ctx: QueryCtx | MutationCtx,
  projectId: Doc<'projects'>['_id'],
  user: UserProfile
): Promise<void> {
  const hasAccess = await canAddMember(ctx, projectId, user);
  if (!hasAccess) {
    throwPermissionError(TEAM_CONSTANTS.PERMISSIONS.INVITE, {
      module: 'Team',
      action: 'You need permission to add members to this project',
    });
  }
}

/**
 * Require permission to update member or throw
 */
export async function requireUpdateMemberAccess(
  ctx: QueryCtx | MutationCtx,
  member: Doc<'projectMembers'>,
  user: UserProfile,
  newRole?: Doc<'projectMembers'>['role']
): Promise<void> {
  const hasAccess = await canUpdateMember(ctx, member, user, newRole);
  if (!hasAccess) {
    throwPermissionError(TEAM_CONSTANTS.PERMISSIONS.UPDATE_ROLE, {
      module: 'Team',
      action: 'You need permission to update this member',
    });
  }
}

/**
 * Require permission to remove member or throw
 */
export async function requireRemoveMemberAccess(
  ctx: QueryCtx | MutationCtx,
  member: Doc<'projectMembers'>,
  user: UserProfile
): Promise<void> {
  const hasAccess = await canRemoveMember(ctx, member, user);
  if (!hasAccess) {
    throwPermissionError(TEAM_CONSTANTS.PERMISSIONS.REMOVE, {
      module: 'Team',
      action: 'You need permission to remove this member',
    });
  }
}

/**
 * Filter members based on user access
 * WARNING: Use for small result sets only
 */
export async function filterMembersByAccess(
  ctx: QueryCtx | MutationCtx,
  members: Doc<'projectMembers'>[],
  user: UserProfile
): Promise<Doc<'projectMembers'>[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return members;
  }

  // Filter by project access
  const accessPromises = members.map(async (member) => ({
    member,
    hasAccess: await canViewTeamMembers(ctx, member.projectId, user),
  }));

  const accessResults = await Promise.all(accessPromises);
  return accessResults
    .filter((result) => result.hasAccess)
    .map((result) => result.member);
}