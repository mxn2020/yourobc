// convex/lib/boilerplate/ai_tests/permissions.ts
// Access control functions for ai_tests module

import { QueryCtx, MutationCtx } from '@/generated/server';
import { Doc, Id } from '@/generated/dataModel';

/**
 * Check if user can view AI tests
 * - Users can view their own tests
 * - Admins can view all tests
 */
export async function canViewAITest(
  ctx: QueryCtx | MutationCtx,
  test: Doc<'aiTests'>,
  currentUser: Doc<'userProfiles'>
): Promise<boolean> {
  // Admin users can view all tests
  if (currentUser.role === 'admin' || currentUser.role === 'superadmin') {
    return true;
  }

  // Users can view their own tests
  return test.userId === currentUser._id;
}

/**
 * Require view access to AI test
 * Throws error if user doesn't have permission
 */
export async function requireViewAITestAccess(
  ctx: QueryCtx | MutationCtx,
  test: Doc<'aiTests'>,
  currentUser: Doc<'userProfiles'>
): Promise<void> {
  const hasAccess = await canViewAITest(ctx, test, currentUser);
  if (!hasAccess) {
    throw new Error('Access denied: You do not have permission to view this AI test');
  }
}

/**
 * Check if user can create AI tests
 * - All authenticated users can create tests
 */
export function canCreateAITest(currentUser: Doc<'userProfiles'>): boolean {
  return true; // All authenticated users can create tests
}

/**
 * Check if user can update AI test
 * - Users can update their own tests
 * - Admins can update all tests
 */
export async function canUpdateAITest(
  ctx: QueryCtx | MutationCtx,
  test: Doc<'aiTests'>,
  currentUser: Doc<'userProfiles'>
): Promise<boolean> {
  if (currentUser.role === 'admin' || currentUser.role === 'superadmin') {
    return true;
  }

  return test.userId === currentUser._id;
}

/**
 * Require update access to AI test
 * Throws error if user doesn't have permission
 */
export async function requireUpdateAITestAccess(
  ctx: QueryCtx | MutationCtx,
  test: Doc<'aiTests'>,
  currentUser: Doc<'userProfiles'>
): Promise<void> {
  const hasAccess = await canUpdateAITest(ctx, test, currentUser);
  if (!hasAccess) {
    throw new Error('Access denied: You do not have permission to update this AI test');
  }
}

/**
 * Check if user can delete AI test
 * - Users can delete their own tests
 * - Admins can delete all tests
 */
export async function canDeleteAITest(
  ctx: QueryCtx | MutationCtx,
  test: Doc<'aiTests'>,
  currentUser: Doc<'userProfiles'>
): Promise<boolean> {
  if (currentUser.role === 'admin' || currentUser.role === 'superadmin') {
    return true;
  }

  return test.userId === currentUser._id;
}

/**
 * Require delete access to AI test
 * Throws error if user doesn't have permission
 */
export async function requireDeleteAITestAccess(
  ctx: QueryCtx | MutationCtx,
  test: Doc<'aiTests'>,
  currentUser: Doc<'userProfiles'>
): Promise<void> {
  const hasAccess = await canDeleteAITest(ctx, test, currentUser);
  if (!hasAccess) {
    throw new Error('Access denied: You do not have permission to delete this AI test');
  }
}

/**
 * Filter tests by access - returns only tests user can view
 */
export async function filterAITestsByAccess(
  ctx: QueryCtx | MutationCtx,
  tests: Doc<'aiTests'>[],
  currentUser: Doc<'userProfiles'>
): Promise<Doc<'aiTests'>[]> {
  // Admins can see all
  if (currentUser.role === 'admin' || currentUser.role === 'superadmin') {
    return tests;
  }

  // Users can only see their own
  return tests.filter((test) => test.userId === currentUser._id);
}
