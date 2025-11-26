// convex/lib/system/app_settings/permissions.ts

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { Doc } from '@/generated/dataModel';
import { UserProfile } from '@/schema/system';

export async function canViewAppSettings(user: UserProfile): Promise<boolean> {
  return user.role === 'admin' || user.role === 'superadmin';
}

export async function requireViewAppSettingsAccess(user: UserProfile): Promise<void> {
    if (!(await canViewAppSettings(user))) {
      throw new Error('No view permission');
    }
}

export async function canEditAppSettings(user: UserProfile): Promise<boolean> {
  return user.role === 'admin' || user.role === 'superadmin';
}

export async function requireEditAppSettingsAccess(user: UserProfile): Promise<void> {
  if (!(await canEditAppSettings(user))) {
    throw new Error('No edit permission');
  }
}
