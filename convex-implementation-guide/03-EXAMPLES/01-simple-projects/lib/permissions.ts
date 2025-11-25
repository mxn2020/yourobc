// convex/lib/software/freelancer_dashboard/projects/permissions.ts
// Access control for projects module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { Doc } from '@/generated/dataModel';
import type { Project, ProjectMember } from './types';


/**
 * Get user's membership in a project
 */
async function getProjectMember(
  ctx: QueryCtx | MutationCtx,
  projectId: string,
  userId: string
): Promise<ProjectMember | null> {
  return await ctx.db
    .query('freelancerProjectMembers')
    .withIndex('by_project_and_user', q =>
      q.eq('projectId', projectId as any).eq('userId', userId as any)
    )
    .filter(q => q.eq(q.field('deletedAt'), undefined))
    .first();
}

/**
 * Check if user can view the project
 * 🔒 Access granted if:
 * - User is admin/superadmin
 * - Project is public
 * - User is owner
 * - User is project member
 */
export async function canViewProject(
  ctx: QueryCtx | MutationCtx,
  project: Project,
  user: UserProfile
): Promise<boolean> {
  // Admins can view all
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Public projects
  if (project.visibility === 'public') {
    return true;
  }

  // Owner can view
  if (project.ownerId === user._id) {
    return true;
  }

  // Project members can view
  const member = await getProjectMember(ctx, project._id, user._id);
  if (member && member.status === 'active') {
    return true;
  }

  return false;
}

/**
 * Require view access (throws if not allowed)
 */
export async function requireViewProjectAccess(
  ctx: QueryCtx | MutationCtx,
  project: Project,
  user: UserProfile
): Promise<void> {
  if (!(await canViewProject(ctx, project, user))) {
    throw new Error('No permission to view this project');
  }
}

/**
 * Check if user can edit the project
 * 🔒 Access granted if:
 * - User is admin/superadmin
 * - User is owner
 * - User is project admin or owner member
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

  // Project admins can edit
  const member = await getProjectMember(ctx, project._id, user._id);
  if (member && member.status === 'active' &&
      (member.role === 'owner' || member.role === 'admin')) {
    return true;
  }

  return false;
}

/**
 * Require edit access (throws if not allowed)
 */
export async function requireEditProjectAccess(
  ctx: QueryCtx | MutationCtx,
  project: Project,
  user: UserProfile
): Promise<void> {
  if (!(await canEditProject(ctx, project, user))) {
    throw new Error('No permission to edit this project');
  }
}

/**
 * Check if user can delete the project
 * 🔒 Access granted if:
 * - User is admin/superadmin
 * - User is owner
 */
export async function canDeleteProject(
  project: Project,
  user: UserProfile
): Promise<boolean> {
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  if (project.ownerId === user._id) {
    return true;
  }

  return false;
}

/**
 * Require delete access (throws if not allowed)
 */
export async function requireDeleteProjectAccess(
  project: Project,
  user: UserProfile
): Promise<void> {
  if (!(await canDeleteProject(project, user))) {
    throw new Error('No permission to delete this project');
  }
}

/**
 * Filter projects by access permissions
 */
export async function filterProjectsByAccess(
  ctx: QueryCtx | MutationCtx,
  projects: Project[],
  user: UserProfile
): Promise<Project[]> {
  if (user.role === 'admin' || user.role === 'superadmin') {
    return projects;
  }

  const filtered: Project[] = [];
  for (const project of projects) {
    if (await canViewProject(ctx, project, user)) {
      filtered.push(project);
    }
  }

  return filtered;
}
