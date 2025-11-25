// convex/lib/system/appConfigs/permissions.ts
// Access control for appConfigs module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { Doc } from '@/generated/dataModel';
import { UserProfile } from '@/schema/system';

export async function canViewAppConfigs(user: UserProfile): Promise<boolean> {
  return user.role === 'admin' || user.role === 'superadmin';
}

export async function requireViewAppConfigsAccess(user: UserProfile): Promise<void> {
  if (!(await canViewAppConfigs(user))) {
    throw new Error('No view permission');
  }
}

export async function canEditAppConfigs(user: UserProfile): Promise<boolean> {
  return user.role === 'admin' || user.role === 'superadmin';
}

export async function requireEditAppConfigsAccess(user: UserProfile): Promise<void> {
  if (!(await canEditAppConfigs(user))) {
    throw new Error('No edit permission');
  }
}
