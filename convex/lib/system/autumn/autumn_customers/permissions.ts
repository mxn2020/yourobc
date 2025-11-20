// convex/lib/boilerplate/autumn/autumn_customers/permissions.ts
// Access control and authorization logic for autumn customers module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { AutumnCustomer } from './types';
import type { Doc } from '@/generated/dataModel';

type UserProfile = Doc<'userProfiles'>;

// ============================================================================
// View Access
// ============================================================================

export async function canViewAutumnCustomer(
  ctx: QueryCtx | MutationCtx,
  customer: AutumnCustomer,
  user: UserProfile
): Promise<boolean> {
  // Admins and superadmins can view all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Users can view their own customer records
  return customer.ownerId === user._id;
}

export async function requireViewAutumnCustomerAccess(
  ctx: QueryCtx | MutationCtx,
  customer: AutumnCustomer,
  user: UserProfile
): Promise<void> {
  if (!(await canViewAutumnCustomer(ctx, customer, user))) {
    throw new Error('Permission denied: You do not have access to view this customer record');
  }
}

// ============================================================================
// Edit Access
// ============================================================================

export async function canEditAutumnCustomer(
  ctx: QueryCtx | MutationCtx,
  customer: AutumnCustomer,
  user: UserProfile
): Promise<boolean> {
  // Only admins and superadmins can edit customer records
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  return false;
}

export async function requireEditAutumnCustomerAccess(
  ctx: QueryCtx | MutationCtx,
  customer: AutumnCustomer,
  user: UserProfile
): Promise<void> {
  if (!(await canEditAutumnCustomer(ctx, customer, user))) {
    throw new Error('Permission denied: Admin access required to edit customer records');
  }
}

// ============================================================================
// Delete Access
// ============================================================================

export async function canDeleteAutumnCustomer(
  customer: AutumnCustomer,
  user: UserProfile
): Promise<boolean> {
  // Only admins and superadmins can delete
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  return false;
}

export async function requireDeleteAutumnCustomerAccess(
  customer: AutumnCustomer,
  user: UserProfile
): Promise<void> {
  if (!(await canDeleteAutumnCustomer(customer, user))) {
    throw new Error('Permission denied: Admin access required to delete customer records');
  }
}

// ============================================================================
// Create Access
// ============================================================================

export function canCreateAutumnCustomer(user: UserProfile): boolean {
  // Only admins and superadmins can create customer records
  return user.role === 'admin' || user.role === 'superadmin';
}

export function requireCreateAutumnCustomerAccess(user: UserProfile): void {
  if (!canCreateAutumnCustomer(user)) {
    throw new Error('Permission denied: Admin access required to create customer records');
  }
}

// ============================================================================
// Bulk Access Filtering
// ============================================================================

export async function filterAutumnCustomersByAccess(
  ctx: QueryCtx | MutationCtx,
  customers: AutumnCustomer[],
  user: UserProfile
): Promise<AutumnCustomer[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return customers;
  }

  // Users see only their own records
  return customers.filter((customer) => customer.ownerId === user._id);
}
