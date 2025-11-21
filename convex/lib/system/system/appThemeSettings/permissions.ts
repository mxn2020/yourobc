// convex/lib/system/system/appThemeSettings/permissions.ts
// Access control and authorization logic for appThemeSettings module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { AppThemeSetting } from './types';
import type { Doc } from '@/generated/dataModel';

type UserProfile = Doc<'userProfiles'>;

export async function canViewAppThemeSetting(
  ctx: QueryCtx | MutationCtx,
  entity: AppThemeSetting,
  user: UserProfile
): Promise<boolean> {
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (entity.ownerId === user._id) return true;
  if (entity.createdBy === user._id) return true;
  return false;
}

export async function requireViewAppThemeSettingAccess(
  ctx: QueryCtx | MutationCtx,
  entity: AppThemeSetting,
  user: UserProfile
): Promise<void> {
  if (!(await canViewAppThemeSetting(ctx, entity, user))) {
    throw new Error('You do not have permission to view this appThemeSettings');
  }
}

export async function canEditAppThemeSetting(
  ctx: QueryCtx | MutationCtx,
  entity: AppThemeSetting,
  user: UserProfile
): Promise<boolean> {
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (entity.ownerId === user._id) return true;
  return false;
}

export async function requireEditAppThemeSettingAccess(
  ctx: QueryCtx | MutationCtx,
  entity: AppThemeSetting,
  user: UserProfile
): Promise<void> {
  if (!(await canEditAppThemeSetting(ctx, entity, user))) {
    throw new Error('You do not have permission to edit this appThemeSettings');
  }
}

export async function canDeleteAppThemeSetting(
  entity: AppThemeSetting,
  user: UserProfile
): Promise<boolean> {
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (entity.ownerId === user._id) return true;
  return false;
}

export async function requireDeleteAppThemeSettingAccess(
  entity: AppThemeSetting,
  user: UserProfile
): Promise<void> {
  if (!(await canDeleteAppThemeSetting(entity, user))) {
    throw new Error('You do not have permission to delete this appThemeSettings');
  }
}

export async function filterAppThemeSettingsByAccess(
  ctx: QueryCtx | MutationCtx,
  entities: AppThemeSetting[],
  user: UserProfile
): Promise<AppThemeSetting[]> {
  if (user.role === 'admin' || user.role === 'superadmin') return entities;
  
  const accessible: AppThemeSetting[] = [];
  for (const entity of entities) {
    if (await canViewAppThemeSetting(ctx, entity, user)) {
      accessible.push(entity);
    }
  }
  return accessible;
}
