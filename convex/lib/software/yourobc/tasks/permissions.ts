// convex/lib/software/yourobc/tasks/permissions.ts
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

  // Assigned user can edit
  if (task.assignedTo === user._id) return true;

  // Check if task is locked/completed
  if (task.status === 'completed' || task.status === 'archived') {
    // Only admins can edit completed/archived items
    return false;
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
  task: Task,
  user: UserProfile
): Promise<boolean> {
  // Only admins and owners can delete
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (task.ownerId === user._id) return true;
  return false;
}

export async function requireDeleteTaskAccess(
  task: Task,
  user: UserProfile
): Promise<void> {
  if (!(await canDeleteTask(task, user))) {
    throw new Error('You do not have permission to delete this task');
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
