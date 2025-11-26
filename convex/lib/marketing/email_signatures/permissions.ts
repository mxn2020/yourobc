// convex/lib/marketing/email_signatures/permissions.ts

import type { QueryCtx } from '@/generated/server';
import type { Doc } from '@/generated/dataModel';
import type { MarketingEmailSignature } from './types';

export function canViewSignature(signature: MarketingEmailSignature, user: Doc<'userProfiles'>): boolean {
  if (signature.ownerId === user._id) return true;
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  return false;
}

export function canEditSignature(signature: MarketingEmailSignature, user: Doc<'userProfiles'>): boolean {
  if (signature.ownerId === user._id) return true;
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  return false;
}

export function canDeleteSignature(signature: MarketingEmailSignature, user: Doc<'userProfiles'>): boolean {
  if (signature.ownerId === user._id) return true;
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  return false;
}

export async function requireViewAccess(ctx: QueryCtx, signature: MarketingEmailSignature, user: Doc<'userProfiles'>): Promise<void> {
  if (!canViewSignature(signature, user)) {
    throw new Error('Permission denied: You do not have access to view this signature');
  }
}

export async function requireEditAccess(ctx: QueryCtx, signature: MarketingEmailSignature, user: Doc<'userProfiles'>): Promise<void> {
  if (!canEditSignature(signature, user)) {
    throw new Error('Permission denied: You do not have access to edit this signature');
  }
}

export function requireDeleteAccess(signature: MarketingEmailSignature, user: Doc<'userProfiles'>): void {
  if (!canDeleteSignature(signature, user)) {
    throw new Error('Permission denied: You do not have access to delete this signature');
  }
}
