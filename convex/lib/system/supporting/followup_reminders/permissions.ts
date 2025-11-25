// convex/lib/system/supporting/followup_reminders/permissions.ts
// Access control for system followup reminders

import type { MutationCtx, QueryCtx } from '@/generated/server';
import type { SystemFollowupReminder } from './types';
import { UserProfile } from '@/schema/system';


function isAdmin(user: UserProfile) {
  return user.role === 'admin' || user.role === 'superadmin';
}

export async function canViewSystemFollowupReminder(
  _ctx: QueryCtx | MutationCtx,
  resource: SystemFollowupReminder,
  user: UserProfile
): Promise<boolean> {
  if (isAdmin(user)) return true;
  return resource.ownerId === user._id || resource.assignedTo === user._id;
}

export async function requireViewSystemFollowupReminderAccess(
  ctx: QueryCtx | MutationCtx,
  resource: SystemFollowupReminder,
  user: UserProfile
): Promise<void> {
  if (!(await canViewSystemFollowupReminder(ctx, resource, user))) {
    throw new Error('No permission to view this reminder');
  }
}

export async function canEditSystemFollowupReminder(
  _ctx: QueryCtx | MutationCtx,
  resource: SystemFollowupReminder,
  user: UserProfile
): Promise<boolean> {
  if (isAdmin(user)) return true;
  return resource.ownerId === user._id || resource.assignedTo === user._id;
}

export async function requireEditSystemFollowupReminderAccess(
  ctx: QueryCtx | MutationCtx,
  resource: SystemFollowupReminder,
  user: UserProfile
): Promise<void> {
  if (!(await canEditSystemFollowupReminder(ctx, resource, user))) {
    throw new Error('No permission to edit this reminder');
  }
}

export async function canDeleteSystemFollowupReminder(
  resource: SystemFollowupReminder,
  user: UserProfile
): Promise<boolean> {
  if (isAdmin(user)) return true;
  return resource.ownerId === user._id;
}

export async function requireDeleteSystemFollowupReminderAccess(
  resource: SystemFollowupReminder,
  user: UserProfile
): Promise<void> {
  if (!(await canDeleteSystemFollowupReminder(resource, user))) {
    throw new Error('No permission to delete this reminder');
  }
}

export async function filterSystemFollowupRemindersByAccess(
  ctx: QueryCtx | MutationCtx,
  resources: SystemFollowupReminder[],
  user: UserProfile
): Promise<SystemFollowupReminder[]> {
  if (isAdmin(user)) return resources;
  return resources.filter(
    (resource) => resource.ownerId === user._id || resource.assignedTo === user._id
  );
}
