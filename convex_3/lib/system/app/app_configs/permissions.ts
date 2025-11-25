// convex/lib/system/appConfigs/permissions.ts
// Access control for appConfigs module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { Doc } from '@/generated/dataModel';


export async function canViewAppConfigs(ctx: QueryCtx | MutationCtx, user: UserProfile): Promise<boolean> {
  return user.role === 'admin' || user.role === 'superadmin';
}

export async function requireViewAppConfigsAccess(ctx: QueryCtx | MutationCtx, user: UserProfile) {
  if (!(await canViewAppConfigs(ctx, user))) {
    throw new Error('No view permission');
  }
}

export async function canEditAppConfigs(ctx: QueryCtx | MutationCtx, user: UserProfile): Promise<boolean> {
  return user.role === 'admin' || user.role === 'superadmin';
}

export async function requireEditAppConfigsAccess(ctx: QueryCtx | MutationCtx, user: UserProfile) {
  if (!(await canEditAppConfigs(ctx, user))) {
    throw new Error('No edit permission');
  }
}
