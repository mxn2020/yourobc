// convex/lib/yourobc/customers/permissions.ts
// Access control and authorization logic for customers module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { Customer } from './types';
import type { Doc } from '@/generated/dataModel';

type UserProfile = Doc<'userProfiles'>;

// ============================================================================
// View Access
// ============================================================================

export async function canViewCustomer(
  ctx: QueryCtx | MutationCtx,
  customer: Customer,
  user: UserProfile
): Promise<boolean> {
  // Admins and superadmins can view all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can view
  if (customer.ownerId === user.authUserId) return true;

  // Creator can view
  if (customer.createdBy === user.authUserId) return true;

  return false;
}

export async function requireViewCustomerAccess(
  ctx: QueryCtx | MutationCtx,
  customer: Customer,
  user: UserProfile
): Promise<void> {
  if (!(await canViewCustomer(ctx, customer, user))) {
    throw new Error('You do not have permission to view this customer');
  }
}

// ============================================================================
// Edit Access
// ============================================================================

export async function canEditCustomer(
  ctx: QueryCtx | MutationCtx,
  customer: Customer,
  user: UserProfile
): Promise<boolean> {
  // Admins can edit all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can edit
  if (customer.ownerId === user.authUserId) return true;

  // Cannot edit blacklisted customers (unless admin)
  if (customer.status === 'blacklisted') {
    return false;
  }

  return false;
}

export async function requireEditCustomerAccess(
  ctx: QueryCtx | MutationCtx,
  customer: Customer,
  user: UserProfile
): Promise<void> {
  if (!(await canEditCustomer(ctx, customer, user))) {
    throw new Error('You do not have permission to edit this customer');
  }
}

// ============================================================================
// Delete Access
// ============================================================================

export async function canDeleteCustomer(
  customer: Customer,
  user: UserProfile
): Promise<boolean> {
  // Only admins and owners can delete
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (customer.ownerId === user.authUserId) return true;
  return false;
}

export async function requireDeleteCustomerAccess(
  customer: Customer,
  user: UserProfile
): Promise<void> {
  if (!(await canDeleteCustomer(customer, user))) {
    throw new Error('You do not have permission to delete this customer');
  }
}

// ============================================================================
// Bulk Access Filtering
// ============================================================================

export async function filterCustomersByAccess(
  ctx: QueryCtx | MutationCtx,
  customers: Customer[],
  user: UserProfile
): Promise<Customer[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return customers;
  }

  const accessible: Customer[] = [];

  for (const customer of customers) {
    if (await canViewCustomer(ctx, customer, user)) {
      accessible.push(customer);
    }
  }

  return accessible;
}
