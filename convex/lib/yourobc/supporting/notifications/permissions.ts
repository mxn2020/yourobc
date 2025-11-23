// convex/lib/yourobc/supporting/notifications/permissions.ts
// Access control for notifications module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { Doc } from '@/generated/dataModel';
import type { Notification } from './types';

type UserProfile = Doc<'userProfiles'>;

/**
 * Check if user can view notification
 */
export async function canViewNotification(
  ctx: QueryCtx | MutationCtx,
  resource: Notification,
  user: UserProfile
): Promise<boolean> {
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (resource.userId === user._id) return true;
  return false;
}

/**
 * Require view access
 */
export async function requireViewNotificationAccess(
  ctx: QueryCtx | MutationCtx,
  resource: Notification,
  user: UserProfile
) {
  if (!(await canViewNotification(ctx, resource, user))) {
    throw new Error('No permission to view this notification');
  }
}

/**
 * Check if user can delete notification
 */
export async function canDeleteNotification(
  resource: Notification,
  user: UserProfile
): Promise<boolean> {
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (resource.userId === user._id) return true;
  return false;
}

/**
 * Require delete access
 */
export async function requireDeleteNotificationAccess(
  resource: Notification,
  user: UserProfile
) {
  if (!(await canDeleteNotification(resource, user))) {
    throw new Error('No permission to delete this notification');
  }
}

/**
 * Filter notifications by access
 */
export async function filterNotificationsByAccess(
  ctx: QueryCtx | MutationCtx,
  resources: Notification[],
  user: UserProfile
): Promise<Notification[]> {
  if (user.role === 'admin' || user.role === 'superadmin') return resources;
  return resources.filter(r => r.userId === user._id);
}
