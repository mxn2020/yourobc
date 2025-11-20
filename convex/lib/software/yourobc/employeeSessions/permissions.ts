// convex/lib/software/yourobc/employeeSessions/permissions.ts
// Access control and authorization logic for employeeSessions module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { EmployeeSession } from './types';
import type { Doc } from '@/generated/dataModel';

type UserProfile = Doc<'userProfiles'>;

// ============================================================================
// View Access
// ============================================================================

export async function canViewEmployeeSession(
  ctx: QueryCtx | MutationCtx,
  session: EmployeeSession,
  user: UserProfile
): Promise<boolean> {
  // Admins and superadmins can view all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can view
  if (session.ownerId === user._id) return true;

  // Creator can view
  if (session.createdBy === user._id) return true;

  // Employee can view their own sessions
  if (session.userProfileId === user._id) return true;

  return false;
}

export async function requireViewEmployeeSessionAccess(
  ctx: QueryCtx | MutationCtx,
  session: EmployeeSession,
  user: UserProfile
): Promise<void> {
  if (!(await canViewEmployeeSession(ctx, session, user))) {
    throw new Error('You do not have permission to view this session');
  }
}

// ============================================================================
// Edit Access
// ============================================================================

export async function canEditEmployeeSession(
  ctx: QueryCtx | MutationCtx,
  session: EmployeeSession,
  user: UserProfile
): Promise<boolean> {
  // Admins can edit all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can edit
  if (session.ownerId === user._id) return true;

  // Employee can edit their own sessions if not completed
  if (session.userProfileId === user._id && session.status !== 'completed') {
    return true;
  }

  return false;
}

export async function requireEditEmployeeSessionAccess(
  ctx: QueryCtx | MutationCtx,
  session: EmployeeSession,
  user: UserProfile
): Promise<void> {
  if (!(await canEditEmployeeSession(ctx, session, user))) {
    throw new Error('You do not have permission to edit this session');
  }
}

// ============================================================================
// Delete Access
// ============================================================================

export async function canDeleteEmployeeSession(
  session: EmployeeSession,
  user: UserProfile
): Promise<boolean> {
  // Only admins and owners can delete
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (session.ownerId === user._id) return true;
  return false;
}

export async function requireDeleteEmployeeSessionAccess(
  session: EmployeeSession,
  user: UserProfile
): Promise<void> {
  if (!(await canDeleteEmployeeSession(session, user))) {
    throw new Error('You do not have permission to delete this session');
  }
}

// ============================================================================
// Bulk Access Filtering
// ============================================================================

export async function filterEmployeeSessionsByAccess(
  ctx: QueryCtx | MutationCtx,
  sessions: EmployeeSession[],
  user: UserProfile
): Promise<EmployeeSession[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return sessions;
  }

  const accessible: EmployeeSession[] = [];

  for (const session of sessions) {
    if (await canViewEmployeeSession(ctx, session, user)) {
      accessible.push(session);
    }
  }

  return accessible;
}
