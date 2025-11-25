// convex/lib/projects/permissions.ts
// Access control and authorization logic for projects module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import { PROJECTS_CONSTANTS } from './constants';
import type { Project } from './types';
import { UserProfile } from '@/schema/system';

// ============================================================================
// View Access
// ============================================================================

/**
 * Check if user can view a project
 */
export async function canViewProject(
  ctx: QueryCtx | MutationCtx,
  project: Project,
  user: UserProfile
): Promise<boolean> {
  // Admins and superadmins can view all
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Owner can view
  if (project.ownerId === user._id) {
    return true;
  }

  // Check if user is a member via projectMembers table
  const membership = await ctx.db
    .query('projectMembers')
    .withIndex('by_project_id', (q) => q.eq('projectId', project._id))
    .filter((q) =>
      q.and(
        q.eq(q.field('userId'), user._id),
        q.eq(q.field('deletedAt'), undefined),
        q.or(
          q.eq(q.field('status'), 'active'),
          q.eq(q.field('status'), 'invited')
        )
      )
    )
    .first();

  if (membership) {
    return true;
  }

  // Public projects visible to all authenticated users
  if (project.visibility === PROJECTS_CONSTANTS.VISIBILITY.PUBLIC) {
    return true;
  }

  return false;
}

export async function requireViewProjectAccess(
  ctx: QueryCtx | MutationCtx,
  project: Project,
  user: UserProfile
): Promise<void> {
  if (!(await canViewProject(ctx, project, user))) {
    throw new Error('You do not have permission to view this project');
  }
}

// ============================================================================
// Edit Access
// ============================================================================

/**
 * Check if user can edit a project
 */
export async function canEditProject(
  ctx: QueryCtx | MutationCtx,
  project: Project,
  user: UserProfile
): Promise<boolean> {
  // Admins can edit all
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Owner can edit
  if (project.ownerId === user._id) {
    return true;
  }

  // Check if member has admin, member, or owner role (viewers can't edit)
  const membership = await ctx.db
    .query('projectMembers')
    .withIndex('by_project_id', (q) => q.eq('projectId', project._id))
    .filter((q) =>
      q.and(
        q.eq(q.field('userId'), user._id),
        q.eq(q.field('deletedAt'), undefined),
        q.eq(q.field('status'), 'active')
      )
    )
    .first();

  if (membership) {
    // Owners and admins can always edit
    if (membership.role === 'owner' || membership.role === 'admin') {
      return true;
    }

    // Members can edit if canEditProject setting is true
    if (membership.role === 'member' && membership.settings?.canEditProject) {
      return true;
    }
  }

  // Check explicit edit permission
  if (
    user.permissions.includes(PROJECTS_CONSTANTS.PERMISSIONS.EDIT) ||
    user.permissions.includes('*')
  ) {
    return true;
  }

  return false;
}

export async function requireEditProjectAccess(
  ctx: QueryCtx | MutationCtx,
  project: Project,
  user: UserProfile
): Promise<void> {
  if (!(await canEditProject(ctx, project, user))) {
    throw new Error('You do not have permission to edit this project');
  }
}

// ============================================================================
// Delete Access
// ============================================================================

/**
 * Check if user can delete a project
 */
export async function canDeleteProject(
  project: Project,
  user: UserProfile
): Promise<boolean> {
  // Only admins and owners
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  if (project.ownerId === user._id) {
    return true;
  }

  // Explicit delete permission
  if (
    user.permissions.includes(PROJECTS_CONSTANTS.PERMISSIONS.DELETE) ||
    user.permissions.includes('*')
  ) {
    return true;
  }

  return false;
}

export async function requireDeleteProjectAccess(
  project: Project,
  user: UserProfile
): Promise<void> {
  if (!(await canDeleteProject(project, user))) {
    throw new Error('You do not have permission to delete this project');
  }
}

// ============================================================================
// Team Management Access
// ============================================================================

/**
 * Check if user can manage team (add/remove members)
 */
export async function canManageTeam(
  ctx: QueryCtx | MutationCtx,
  project: Project,
  user: UserProfile
): Promise<boolean> {
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  if (project.ownerId === user._id) {
    return true;
  }

  // Check if member has admin or owner role
  const membership = await ctx.db
    .query('projectMembers')
    .withIndex('by_project_id', (q) => q.eq('projectId', project._id))
    .filter((q) =>
      q.and(
        q.eq(q.field('userId'), user._id),
        q.eq(q.field('deletedAt'), undefined),
        q.eq(q.field('status'), 'active')
      )
    )
    .first();

  if (membership) {
    // Owners and admins can manage team
    if (membership.role === 'owner' || membership.role === 'admin') {
      return true;
    }

    // Members can invite if canInviteMembers setting is true
    if (membership.role === 'member' && membership.settings?.canInviteMembers) {
      return true;
    }
  }

  if (
    user.permissions.includes(PROJECTS_CONSTANTS.PERMISSIONS.MANAGE_TEAM) ||
    user.permissions.includes('*')
  ) {
    return true;
  }

  return false;
}

export async function requireTeamManagementAccess(
  ctx: QueryCtx | MutationCtx,
  project: Project,
  user: UserProfile
): Promise<void> {
  if (!(await canManageTeam(ctx, project, user))) {
    throw new Error('You do not have permission to manage team members');
  }
}

// ============================================================================
// Bulk Access Filtering
// ============================================================================

/**
 * Filter projects based on user access
 * WARNING: This should only be used for small result sets
 * For large datasets, use index-based queries instead
 */
export async function filterProjectsByAccess(
  ctx: QueryCtx | MutationCtx,
  projects: Project[],
  user: UserProfile
): Promise<Project[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return projects;
  }

  // Filter by access rights
  const accessPromises = projects.map(async (project) => ({
    project,
    hasAccess: await canViewProject(ctx, project, user),
  }));

  const accessResults = await Promise.all(accessPromises);
  return accessResults
    .filter((result) => result.hasAccess)
    .map((result) => result.project);
}
