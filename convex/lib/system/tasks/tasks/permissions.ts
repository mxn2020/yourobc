// convex/lib/boilerplate/tasks/tasks/permissions.ts
// Access control and authorization logic for tasks module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { Task } from './types';
import type { Doc } from '@/generated/dataModel';

type UserProfile = Doc<'userProfiles'>;

// ============================================================================
// View Access
// ============================================================================

export async function canViewTask(
  ctx: QueryCtx | MutationCtx,
  task: Task,
  user: UserProfile
): Promise<boolean> {
  // Admins and superadmins can view all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can view
  if (task.ownerId === user._id) return true;

  // Creator can view
  if (task.createdBy === user._id) return true;

  // Assigned user can view
  if (task.assignedTo === user._id) return true;

  // Check project membership if task belongs to a project
  if (task.projectId) {
    const project = await ctx.db.get(task.projectId);
    if (project) {
      // Check if user is project owner
      if ('ownerId' in project && project.ownerId === user._id) return true;

      // Check if user is project member
      const membership = await ctx.db
        .query('projectMembers')
        .withIndex('by_project', (q) => q.eq('projectId', task.projectId!))
        .filter((q) => q.eq(q.field('userId'), user._id))
        .filter((q) => q.eq(q.field('deletedAt'), undefined))
        .first();

      if (membership && membership.status === 'active') return true;
    }
  }

  return false;
}

export async function requireViewTaskAccess(
  ctx: QueryCtx | MutationCtx,
  task: Task,
  user: UserProfile
): Promise<void> {
  if (!(await canViewTask(ctx, task, user))) {
    throw new Error('You do not have permission to view this task');
  }
}

// ============================================================================
// Edit Access
// ============================================================================

export async function canEditTask(
  ctx: QueryCtx | MutationCtx,
  task: Task,
  user: UserProfile
): Promise<boolean> {
  // Admins can edit all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can edit
  if (task.ownerId === user._id) return true;

  // Check if task is locked/completed
  if (task.status === 'completed' || task.status === 'cancelled') {
    // Only admins can edit completed/cancelled tasks
    return false;
  }

  // Assigned user can edit
  if (task.assignedTo === user._id) return true;

  // Check project membership with edit permissions
  if (task.projectId) {
    const project = await ctx.db.get(task.projectId);
    if (project) {
      // Project owner can edit
      if ('ownerId' in project && project.ownerId === user._id) return true;

      // Check if user is project admin/owner
      const membership = await ctx.db
        .query('projectMembers')
        .withIndex('by_project', (q) => q.eq('projectId', task.projectId!))
        .filter((q) => q.eq(q.field('userId'), user._id))
        .filter((q) => q.eq(q.field('deletedAt'), undefined))
        .first();

      if (
        membership &&
        membership.status === 'active' &&
        (membership.role === 'owner' || membership.role === 'admin')
      ) {
        return true;
      }
    }
  }

  return false;
}

export async function requireEditTaskAccess(
  ctx: QueryCtx | MutationCtx,
  task: Task,
  user: UserProfile
): Promise<void> {
  if (!(await canEditTask(ctx, task, user))) {
    throw new Error('You do not have permission to edit this task');
  }
}

// ============================================================================
// Delete Access
// ============================================================================

export async function canDeleteTask(
  ctx: QueryCtx | MutationCtx,
  task: Task,
  user: UserProfile
): Promise<boolean> {
  // Only admins and owners can delete
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (task.ownerId === user._id) return true;

  // Check if user is project owner
  if (task.projectId) {
    const project = await ctx.db.get(task.projectId);
    if (project && 'ownerId' in project && project.ownerId === user._id) {
      return true;
    }
  }

  return false;
}

export async function requireDeleteTaskAccess(
  ctx: QueryCtx | MutationCtx,
  task: Task,
  user: UserProfile
): Promise<void> {
  if (!(await canDeleteTask(ctx, task, user))) {
    throw new Error('You do not have permission to delete this task');
  }
}

// ============================================================================
// Assign Access
// ============================================================================

export async function canAssignTask(
  ctx: QueryCtx | MutationCtx,
  task: Task,
  user: UserProfile
): Promise<boolean> {
  // Admins can assign
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can assign
  if (task.ownerId === user._id) return true;

  // Check if user is project owner or admin
  if (task.projectId) {
    const project = await ctx.db.get(task.projectId);
    if (project) {
      if ('ownerId' in project && project.ownerId === user._id) return true;

      const membership = await ctx.db
        .query('projectMembers')
        .withIndex('by_project', (q) => q.eq('projectId', task.projectId!))
        .filter((q) => q.eq(q.field('userId'), user._id))
        .filter((q) => q.eq(q.field('deletedAt'), undefined))
        .first();

      if (
        membership &&
        membership.status === 'active' &&
        (membership.role === 'owner' || membership.role === 'admin')
      ) {
        return true;
      }
    }
  }

  return false;
}

export async function requireAssignTaskAccess(
  ctx: QueryCtx | MutationCtx,
  task: Task,
  user: UserProfile
): Promise<void> {
  if (!(await canAssignTask(ctx, task, user))) {
    throw new Error('You do not have permission to assign this task');
  }
}

// ============================================================================
// Bulk Access Filtering
// ============================================================================

export async function filterTasksByAccess(
  ctx: QueryCtx | MutationCtx,
  tasks: Task[],
  user: UserProfile
): Promise<Task[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return tasks;
  }

  const accessible: Task[] = [];

  for (const task of tasks) {
    if (await canViewTask(ctx, task, user)) {
      accessible.push(task);
    }
  }

  return accessible;
}
