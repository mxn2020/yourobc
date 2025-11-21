// convex/lib/system/system/appSettings/permissions.ts
// Access control and authorization logic for appSettings module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { AppSetting } from './types';
import type { Doc } from '@/generated/dataModel';

type UserProfile = Doc<'userProfiles'>;

export async function canViewAppSetting(
  ctx: QueryCtx | MutationCtx,
  appSetting: AppSetting,
  user: UserProfile
): Promise<boolean> {
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (appSetting.ownerId === user._id) return true;
  if (appSetting.createdBy === user._id) return true;
  if (appSetting.isPublic) return true;
  return false;
}

export async function requireViewAppSettingAccess(
  ctx: QueryCtx | MutationCtx,
  appSetting: AppSetting,
  user: UserProfile
): Promise<void> {
  if (!(await canViewAppSetting(ctx, appSetting, user))) {
    throw new Error('You do not have permission to view this appSetting');
  }
}

export async function canEditAppSetting(
  ctx: QueryCtx | MutationCtx,
  appSetting: AppSetting,
  user: UserProfile
): Promise<boolean> {
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (appSetting.ownerId === user._id) return true;
  return false;
}

export async function requireEditAppSettingAccess(
  ctx: QueryCtx | MutationCtx,
  appSetting: AppSetting,
  user: UserProfile
): Promise<void> {
  if (!(await canEditAppSetting(ctx, appSetting, user))) {
    throw new Error('You do not have permission to edit this appSetting');
  }
}

export async function canDeleteAppSetting(
  appSetting: AppSetting,
  user: UserProfile
): Promise<boolean> {
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (appSetting.ownerId === user._id) return true;
  return false;
}

export async function requireDeleteAppSettingAccess(
  appSetting: AppSetting,
  user: UserProfile
): Promise<void> {
  if (!(await canDeleteAppSetting(appSetting, user))) {
    throw new Error('You do not have permission to delete this appSetting');
  }
}

export async function filterAppSettingsByAccess(
  ctx: QueryCtx | MutationCtx,
  appSettings: AppSetting[],
  user: UserProfile
): Promise<AppSetting[]> {
  if (user.role === 'admin' || user.role === 'superadmin') {
    return appSettings;
  }

  const accessible: AppSetting[] = [];
  for (const appSetting of appSettings) {
    if (await canViewAppSetting(ctx, appSetting, user)) {
      accessible.push(appSetting);
    }
  }
  return accessible;
}
