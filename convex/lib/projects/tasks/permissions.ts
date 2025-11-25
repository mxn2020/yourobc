// convex/lib/projects/tasks/permissions.ts

import type { MutationCtx, QueryCtx } from '@/generated/server';
import type { UserProfile } from '@/schema/system';
import type { Task } from './types';
import { canEditProject, canViewProject, requireEditProjectAccess, requireViewProjectAccess } from '../permissions';

export async function canViewTask(
  ctx: QueryCtx | MutationCtx,
  task: Task,
  user: UserProfile
): Promise<boolean> {
  const project = await ctx.db.get(task.projectId);
  if (!project) return false;

  return canViewProject(ctx, project, user);
}

export async function requireViewTaskAccess(
  ctx: QueryCtx | MutationCtx,
  task: Task,
  user: UserProfile
): Promise<void> {
  const project = await ctx.db.get(task.projectId);
  if (!project) {
    throw new Error('Project not found');
  }

  await requireViewProjectAccess(ctx, project, user);
}

export async function canEditTask(
  ctx: QueryCtx | MutationCtx,
  task: Task,
  user: UserProfile
): Promise<boolean> {
  const project = await ctx.db.get(task.projectId);
  if (!project) return false;

  return canEditProject(ctx, project, user);
}

export async function requireEditTaskAccess(
  ctx: QueryCtx | MutationCtx,
  task: Task,
  user: UserProfile
): Promise<void> {
  const project = await ctx.db.get(task.projectId);
  if (!project) {
    throw new Error('Project not found');
  }

  await requireEditProjectAccess(ctx, project, user);
}

export async function requireDeleteTaskAccess(
  ctx: QueryCtx | MutationCtx,
  task: Task,
  user: UserProfile
): Promise<void> {
  const project = await ctx.db.get(task.projectId);
  if (!project) {
    throw new Error('Project not found');
  }

  if (!(await canEditProject(ctx, project, user))) {
    throw new Error('You do not have permission to delete this task');
  }
}

export async function filterTasksByAccess(
  ctx: QueryCtx | MutationCtx,
  tasks: Task[],
  user: UserProfile
): Promise<Task[]> {
  if (user.role === 'admin' || user.role === 'superadmin') {
    return tasks;
  }

  const accessChecks = await Promise.all(
    tasks.map(async (task) => ({
      task,
      hasAccess: await canViewTask(ctx, task, user),
    }))
  );

  return accessChecks.filter(({ hasAccess }) => hasAccess).map(({ task }) => task);
}
