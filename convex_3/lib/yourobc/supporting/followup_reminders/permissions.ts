// convex/lib/yourobc/supporting/followup_reminders/permissions.ts
// Access control for followup reminders module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { Doc } from '@/generated/dataModel';
import type { FollowupReminder } from './types';


export async function canViewFollowupReminder(
  ctx: QueryCtx | MutationCtx,
  resource: FollowupReminder,
  user: UserProfile
): Promise<boolean> {
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (resource.assignedTo === user._id) return true;
  if (resource.assignedBy === user._id) return true;
  if (resource.createdBy === user._id) return true;
  return false;
}

export async function requireViewFollowupReminderAccess(
  ctx: QueryCtx | MutationCtx,
  resource: FollowupReminder,
  user: UserProfile
) {
  if (!(await canViewFollowupReminder(ctx, resource, user))) {
    throw new Error('No permission to view this reminder');
  }
}

export async function canEditFollowupReminder(
  ctx: QueryCtx | MutationCtx,
  resource: FollowupReminder,
  user: UserProfile
): Promise<boolean> {
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (resource.assignedBy === user._id) return true;
  if (resource.createdBy === user._id) return true;
  return false;
}

export async function requireEditFollowupReminderAccess(
  ctx: QueryCtx | MutationCtx,
  resource: FollowupReminder,
  user: UserProfile
) {
  if (!(await canEditFollowupReminder(ctx, resource, user))) {
    throw new Error('No permission to edit this reminder');
  }
}

export async function canDeleteFollowupReminder(
  resource: FollowupReminder,
  user: UserProfile
): Promise<boolean> {
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (resource.assignedBy === user._id) return true;
  return false;
}

export async function requireDeleteFollowupReminderAccess(
  resource: FollowupReminder,
  user: UserProfile
) {
  if (!(await canDeleteFollowupReminder(resource, user))) {
    throw new Error('No permission to delete this reminder');
  }
}

export async function filterFollowupRemindersByAccess(
  ctx: QueryCtx | MutationCtx,
  resources: FollowupReminder[],
  user: UserProfile
): Promise<FollowupReminder[]> {
  if (user.role === 'admin' || user.role === 'superadmin') return resources;
  const filtered: FollowupReminder[] = [];
  for (const resource of resources) {
    if (await canViewFollowupReminder(ctx, resource, user)) {
      filtered.push(resource);
    }
  }
  return filtered;
}
