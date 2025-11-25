// convex/lib/system/supporting/notifications/permissions.ts
// Access control helpers for system notifications

import type { MutationCtx, QueryCtx } from '@/generated/server';
import type { SystemNotification } from './types';
import { UserProfile } from '@/schema/system';

function isAdmin(user: UserProfile) {
  return user.role === 'admin' || user.role === 'superadmin';
}

export async function canViewSystemNotification(
  _ctx: QueryCtx | MutationCtx,
  resource: SystemNotification,
  user: UserProfile
): Promise<boolean> {
  if (isAdmin(user)) return true;
  return resource.recipientId === user._id || resource.ownerId === user._id;
}

export async function requireViewSystemNotificationAccess(
  ctx: QueryCtx | MutationCtx,
  resource: SystemNotification,
  user: UserProfile
): Promise<void> {
  if (!(await canViewSystemNotification(ctx, resource, user))) {
    throw new Error('No permission to view this notification');
  }
}

export async function canDeleteSystemNotification(
  resource: SystemNotification,
  user: UserProfile
): Promise<boolean> {
  if (isAdmin(user)) return true;
  return resource.recipientId === user._id || resource.ownerId === user._id;
}

export async function requireDeleteSystemNotificationAccess(
  resource: SystemNotification,
  user: UserProfile
): Promise<void> {
  if (!(await canDeleteSystemNotification(resource, user))) {
    throw new Error('No permission to delete this notification');
  }
}

export async function filterSystemNotificationsByAccess(
  ctx: QueryCtx | MutationCtx,
  resources: SystemNotification[],
  user: UserProfile
): Promise<SystemNotification[]> {
  if (isAdmin(user)) return resources;
  return resources.filter(
    (resource) => resource.recipientId === user._id || resource.ownerId === user._id
  );
}
