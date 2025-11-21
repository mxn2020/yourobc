// convex/lib/system/system/notifications/permissions.ts
// Access control and authorization logic for notifications module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { Notification } from './types';
import type { Doc } from '@/generated/dataModel';

type UserProfile = Doc<'userProfiles'>;

export async function canViewNotification(
  ctx: QueryCtx | MutationCtx,
  entity: Notification,
  user: UserProfile
): Promise<boolean> {
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (entity.ownerId === user._id) return true;
  if (entity.createdBy === user._id) return true;
  return false;
}

export async function requireViewNotificationAccess(
  ctx: QueryCtx | MutationCtx,
  entity: Notification,
  user: UserProfile
): Promise<void> {
  if (!(await canViewNotification(ctx, entity, user))) {
    throw new Error('You do not have permission to view this notifications');
  }
}

export async function canEditNotification(
  ctx: QueryCtx | MutationCtx,
  entity: Notification,
  user: UserProfile
): Promise<boolean> {
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (entity.ownerId === user._id) return true;
  return false;
}

export async function requireEditNotificationAccess(
  ctx: QueryCtx | MutationCtx,
  entity: Notification,
  user: UserProfile
): Promise<void> {
  if (!(await canEditNotification(ctx, entity, user))) {
    throw new Error('You do not have permission to edit this notifications');
  }
}

export async function canDeleteNotification(
  entity: Notification,
  user: UserProfile
): Promise<boolean> {
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (entity.ownerId === user._id) return true;
  return false;
}

export async function requireDeleteNotificationAccess(
  entity: Notification,
  user: UserProfile
): Promise<void> {
  if (!(await canDeleteNotification(entity, user))) {
    throw new Error('You do not have permission to delete this notifications');
  }
}

export async function filterNotificationsByAccess(
  ctx: QueryCtx | MutationCtx,
  entities: Notification[],
  user: UserProfile
): Promise<Notification[]> {
  if (user.role === 'admin' || user.role === 'superadmin') return entities;
  
  const accessible: Notification[] = [];
  for (const entity of entities) {
    if (await canViewNotification(ctx, entity, user)) {
      accessible.push(entity);
    }
  }
  return accessible;
}
