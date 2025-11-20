// convex/lib/software/yourobc/customers/permissions.ts
// Access control for customers module

import type { Doc, Id } from '@/generated/dataModel';
import type { Customer } from '@/schema/software/yourobc/customers';
import { CUSTOMERS_CONSTANTS } from './constants';

/**
 * User profile type for permission checks
 */
export interface UserProfile {
  _id: Id<'userProfiles'>;
  authSubject: string;
  email?: string;
  name?: string;
  role?: string;
  isAdmin?: boolean;
}

/**
 * Check if user can view customer
 */
export async function canViewCustomer(customer: Customer, user: UserProfile): Promise<boolean> {
  // Admins can view all customers
  if (user.isAdmin) {
    return true;
  }

  // Owner can view their own customers
  if (customer.ownerId === user._id) {
    return true;
  }

  // TODO: Add team/organization-based access
  // For now, allow all authenticated users to view
  return true;
}

/**
 * Check if user can edit customer
 */
export async function canEditCustomer(customer: Customer, user: UserProfile): Promise<boolean> {
  // Admins can edit all customers
  if (user.isAdmin) {
    return true;
  }

  // Owner can edit their own customers
  if (customer.ownerId === user._id) {
    return true;
  }

  // TODO: Add team/organization-based access with edit permissions
  return false;
}

/**
 * Check if user can delete customer
 */
export async function canDeleteCustomer(customer: Customer, user: UserProfile): Promise<boolean> {
  // Admins can delete all customers
  if (user.isAdmin) {
    return true;
  }

  // Owner can delete their own customers
  if (customer.ownerId === user._id) {
    return true;
  }

  // TODO: Add team/organization-based access with delete permissions
  return false;
}

/**
 * Check if user can restore customer
 */
export async function canRestoreCustomer(customer: Customer, user: UserProfile): Promise<boolean> {
  // Admins can restore all customers
  if (user.isAdmin) {
    return true;
  }

  // Owner can restore their own customers
  if (customer.ownerId === user._id) {
    return true;
  }

  // TODO: Add team/organization-based access with restore permissions
  return false;
}

/**
 * Check if user can archive customer
 */
export async function canArchiveCustomer(customer: Customer, user: UserProfile): Promise<boolean> {
  // Same rules as delete
  return canDeleteCustomer(customer, user);
}

/**
 * Check if user can suspend customer service
 */
export async function canSuspendCustomer(customer: Customer, user: UserProfile): Promise<boolean> {
  // Admins can suspend all customers
  if (user.isAdmin) {
    return true;
  }

  // Owner can suspend their own customers
  if (customer.ownerId === user._id) {
    return true;
  }

  // TODO: Add team/organization-based access with suspend permissions
  return false;
}

/**
 * Check if user can reactivate customer service
 */
export async function canReactivateCustomer(customer: Customer, user: UserProfile): Promise<boolean> {
  // Same rules as suspend
  return canSuspendCustomer(customer, user);
}

/**
 * Check if user can change customer status
 */
export async function canChangeCustomerStatus(customer: Customer, user: UserProfile): Promise<boolean> {
  // Admins can change all customer statuses
  if (user.isAdmin) {
    return true;
  }

  // Owner can change their own customer statuses
  if (customer.ownerId === user._id) {
    return true;
  }

  // TODO: Add team/organization-based access with status change permissions
  return false;
}

/**
 * Require access - throw error if permission check fails
 */
export async function requireAccess(hasAccess: boolean, errorMessage?: string): Promise<void> {
  if (!hasAccess) {
    throw new Error(errorMessage || 'Access denied');
  }
}

/**
 * Require view permission
 */
export async function requireViewPermission(customer: Customer, user: UserProfile): Promise<void> {
  const canView = await canViewCustomer(customer, user);
  await requireAccess(canView, CUSTOMERS_CONSTANTS.ERRORS.UNAUTHORIZED_VIEW);
}

/**
 * Require edit permission
 */
export async function requireEditPermission(customer: Customer, user: UserProfile): Promise<void> {
  const canEdit = await canEditCustomer(customer, user);
  await requireAccess(canEdit, CUSTOMERS_CONSTANTS.ERRORS.UNAUTHORIZED_EDIT);
}

/**
 * Require delete permission
 */
export async function requireDeletePermission(customer: Customer, user: UserProfile): Promise<void> {
  const canDelete = await canDeleteCustomer(customer, user);
  await requireAccess(canDelete, CUSTOMERS_CONSTANTS.ERRORS.UNAUTHORIZED_DELETE);
}

/**
 * Require restore permission
 */
export async function requireRestorePermission(customer: Customer, user: UserProfile): Promise<void> {
  const canRestore = await canRestoreCustomer(customer, user);
  await requireAccess(canRestore, CUSTOMERS_CONSTANTS.ERRORS.UNAUTHORIZED_RESTORE);
}

/**
 * Check if customer is accessible (not deleted unless specifically requested)
 */
export function isCustomerAccessible(customer: Customer, includeDeleted: boolean = false): boolean {
  if (customer.deletedAt && !includeDeleted) {
    return false;
  }
  return true;
}

/**
 * Validate customer exists and is accessible
 */
export function validateCustomerExists(
  customer: Customer | null,
  includeDeleted: boolean = false
): asserts customer is Customer {
  if (!customer) {
    throw new Error(CUSTOMERS_CONSTANTS.ERRORS.NOT_FOUND);
  }
  if (!isCustomerAccessible(customer, includeDeleted)) {
    throw new Error(CUSTOMERS_CONSTANTS.ERRORS.ALREADY_DELETED);
  }
}
