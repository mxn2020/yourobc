// convex/lib/system/projects/milestones/permissions.ts

import { QueryCtx, MutationCtx } from '@/generated/server';
import { Doc } from '@/generated/dataModel';
import { MILESTONE_CONSTANTS } from './constants';
import { UserProfile } from '../../user_profiles';
import { throwPermissionError, throwAccessError } from '@/shared/errors';
import { canViewProject, canEditProject } from '../permissions';

/**
 * Check if user can view a milestone
 * Milestones inherit view permissions from their project
 */
export async function canViewMilestone(
  ctx: QueryCtx | MutationCtx,
  milestone: Doc<'projectMilestones'>,
  user: UserProfile
): Promise<boolean> {
  // Admins can view everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Creator can view their milestones
  if (milestone.createdBy === user._id) {
    return true;
  }

  // Assigned user can view their milestones
  if (milestone.assignedTo === user._id) {
    return true;
  }

  // Check project permissions
  const project = await ctx.db.get(milestone.projectId);
  if (project) {
    return await canViewProject(ctx, project, user);
  }

  return false;
}

/**
 * Check if user can edit a milestone
 * Milestones inherit edit permissions from their project
 */
export async function canEditMilestone(
  ctx: QueryCtx | MutationCtx,
  milestone: Doc<'projectMilestones'>,
  user: UserProfile
): Promise<boolean> {
  // Admins can edit everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Creator can edit their milestones
  if (milestone.createdBy === user._id) {
    return true;
  }

  // Check project edit permissions
  const project = await ctx.db.get(milestone.projectId);
  if (project) {
    return await canEditProject(ctx, project, user);
  }

  // Check explicit edit permission
  if (
    user.permissions.includes(MILESTONE_CONSTANTS.PERMISSIONS.EDIT) ||
    user.permissions.includes('*')
  ) {
    return true;
  }

  return false;
}

/**
 * Check if user can delete a milestone
 */
export async function canDeleteMilestone(
  ctx: QueryCtx | MutationCtx,
  milestone: Doc<'projectMilestones'>,
  user: UserProfile
): Promise<boolean> {
  // Admins can delete everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Creator can delete their milestones
  if (milestone.createdBy === user._id) {
    return true;
  }

  // Check project edit permissions (edit = can delete milestones)
  const project = await ctx.db.get(milestone.projectId);
  if (project) {
    return await canEditProject(ctx, project, user);
  }

  // Explicit delete permission
  if (
    user.permissions.includes(MILESTONE_CONSTANTS.PERMISSIONS.DELETE) ||
    user.permissions.includes('*')
  ) {
    return true;
  }

  return false;
}

/**
 * Require view access or throw error
 */
export async function requireViewAccess(
  ctx: QueryCtx | MutationCtx,
  milestone: Doc<'projectMilestones'>,
  user: UserProfile
): Promise<void> {
  const hasAccess = await canViewMilestone(ctx, milestone, user);
  if (!hasAccess) {
    throwAccessError(`You don't have permission to view this milestone`, {
      permission: MILESTONE_CONSTANTS.PERMISSIONS.VIEW,
      module: 'Milestones',
    });
  }
}

/**
 * Require edit access or throw error
 */
export async function requireEditAccess(
  ctx: QueryCtx | MutationCtx,
  milestone: Doc<'projectMilestones'>,
  user: UserProfile
): Promise<void> {
  const hasAccess = await canEditMilestone(ctx, milestone, user);
  if (!hasAccess) {
    throwPermissionError(MILESTONE_CONSTANTS.PERMISSIONS.EDIT, {
      module: 'Milestones',
      action: 'You need edit permission to modify this milestone',
    });
  }
}

/**
 * Require delete access or throw error
 */
export async function requireDeleteAccess(
  ctx: QueryCtx | MutationCtx,
  milestone: Doc<'projectMilestones'>,
  user: UserProfile
): Promise<void> {
  const hasAccess = await canDeleteMilestone(ctx, milestone, user);
  if (!hasAccess) {
    throwPermissionError(MILESTONE_CONSTANTS.PERMISSIONS.DELETE, {
      module: 'Milestones',
      action: 'You need permission to delete this milestone',
    });
  }
}

/**
 * Filter milestones based on user access
 * WARNING: Use for small result sets only
 */
export async function filterMilestonesByAccess(
  ctx: QueryCtx | MutationCtx,
  milestones: Doc<'projectMilestones'>[],
  user: UserProfile
): Promise<Doc<'projectMilestones'>[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return milestones;
  }

  // Filter by access rights
  const accessPromises = milestones.map(async (milestone) => ({
    milestone,
    hasAccess: await canViewMilestone(ctx, milestone, user),
  }));

  const accessResults = await Promise.all(accessPromises);
  return accessResults
    .filter((result) => result.hasAccess)
    .map((result) => result.milestone);
}