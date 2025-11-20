// convex/lib/software/yourobc/customers/queries.ts
// Read operations for customers module

import type { QueryCtx } from '@/generated/server';
import type { Id } from '@/generated/dataModel';
import type { Customer, CustomerId } from '@/schema/software/yourobc/customers';
import type { CustomerFilters, CustomerListOptions, CustomerStatsSummary } from './types';
import { canViewCustomer, validateCustomerExists } from './permissions';
import { matchesSearchTerm } from './utils';
import { CUSTOMERS_CONSTANTS } from './constants';

/**
 * Get current user or throw error
 */
async function requireCurrentUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error('Authentication required');
  }

  const user = await ctx.db
    .query('userProfiles')
    .filter((q) => q.eq(q.field('authSubject'), identity.subject))
    .first();

  if (!user) {
    throw new Error('User profile not found');
  }

  return user;
}

/**
 * Get customer by ID
 */
export async function getCustomerById(
  ctx: QueryCtx,
  customerId: CustomerId,
  includeDeleted: boolean = false
): Promise<Customer | null> {
  const user = await requireCurrentUser(ctx);
  const customer = await ctx.db.get(customerId);

  if (!customer) {
    return null;
  }

  validateCustomerExists(customer, includeDeleted);

  // Check view permission
  const canView = await canViewCustomer(customer, user);
  if (!canView) {
    throw new Error(CUSTOMERS_CONSTANTS.ERRORS.UNAUTHORIZED_VIEW);
  }

  return customer;
}

/**
 * Get customer by public ID
 */
export async function getCustomerByPublicId(
  ctx: QueryCtx,
  publicId: string,
  includeDeleted: boolean = false
): Promise<Customer | null> {
  const user = await requireCurrentUser(ctx);
  const customer = await ctx.db
    .query('yourobcCustomers')
    .withIndex('by_public_id', (q) => q.eq('publicId', publicId))
    .first();

  if (!customer) {
    return null;
  }

  validateCustomerExists(customer, includeDeleted);

  // Check view permission
  const canView = await canViewCustomer(customer, user);
  if (!canView) {
    throw new Error(CUSTOMERS_CONSTANTS.ERRORS.UNAUTHORIZED_VIEW);
  }

  return customer;
}

/**
 * List customers with filters and pagination
 */
export async function listCustomers(
  ctx: QueryCtx,
  options: CustomerListOptions = {}
): Promise<Customer[]> {
  const user = await requireCurrentUser(ctx);
  const {
    filters = {},
    limit = 50,
    offset = 0,
    sortBy = 'companyName',
    sortOrder = 'asc',
  } = options;

  // Start with base query
  let query = ctx.db.query('yourobcCustomers');

  // Apply index-based filters
  if (filters.status) {
    query = query.withIndex('by_status', (q) => q.eq('status', filters.status!));
  } else if (filters.ownerId) {
    query = query.withIndex('by_owner', (q) => q.eq('ownerId', filters.ownerId!));
  } else if (filters.country) {
    query = query.withIndex('by_country', (q) => q.eq('billingAddress.country', filters.country!));
  } else if (filters.inquirySourceId) {
    query = query.withIndex('by_inquirySource', (q) => q.eq('inquirySourceId', filters.inquirySourceId!));
  } else if (sortBy === 'createdAt') {
    query = query.withIndex('by_created');
  } else {
    query = query.withIndex('by_name');
  }

  // Collect all results
  let customers = await query.collect();

  // Apply filters that can't be done via indexes
  customers = customers.filter((customer) => {
    // Filter deleted
    if (!filters.includeDeleted && customer.deletedAt) {
      return false;
    }

    // Filter by status (if not already filtered by index)
    if (filters.status && customer.status !== filters.status) {
      return false;
    }

    // Filter by owner (if not already filtered by index)
    if (filters.ownerId && customer.ownerId !== filters.ownerId) {
      return false;
    }

    // Filter by currency
    if (filters.currency && customer.defaultCurrency !== filters.currency) {
      return false;
    }

    // Filter by search term
    if (filters.searchTerm && !matchesSearchTerm(customer, filters.searchTerm)) {
      return false;
    }

    return true;
  });

  // Filter by permissions
  const accessibleCustomers = [];
  for (const customer of customers) {
    const canView = await canViewCustomer(customer, user);
    if (canView) {
      accessibleCustomers.push(customer);
    }
  }

  // Sort results
  accessibleCustomers.sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'companyName') {
      comparison = a.companyName.localeCompare(b.companyName);
    } else if (sortBy === 'createdAt') {
      comparison = (a.createdAt || 0) - (b.createdAt || 0);
    } else if (sortBy === 'updatedAt') {
      comparison = (a.updatedAt || 0) - (b.updatedAt || 0);
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Apply pagination
  return accessibleCustomers.slice(offset, offset + limit);
}

/**
 * Count customers with filters
 */
export async function countCustomers(ctx: QueryCtx, filters: CustomerFilters = {}): Promise<number> {
  const customers = await listCustomers(ctx, { filters, limit: 10000 });
  return customers.length;
}

/**
 * Get customers by status
 */
export async function getCustomersByStatus(
  ctx: QueryCtx,
  status: string,
  limit: number = 50
): Promise<Customer[]> {
  return listCustomers(ctx, {
    filters: { status: status as any },
    limit,
  });
}

/**
 * Get customers by owner
 */
export async function getCustomersByOwner(
  ctx: QueryCtx,
  ownerId: Id<'userProfiles'>,
  limit: number = 50
): Promise<Customer[]> {
  return listCustomers(ctx, {
    filters: { ownerId },
    limit,
  });
}

/**
 * Search customers by name
 */
export async function searchCustomers(
  ctx: QueryCtx,
  searchTerm: string,
  limit: number = 50
): Promise<Customer[]> {
  return listCustomers(ctx, {
    filters: { searchTerm },
    limit,
  });
}

/**
 * Get customer statistics summary
 */
export async function getCustomerStatsSummary(ctx: QueryCtx): Promise<CustomerStatsSummary> {
  const customers = await listCustomers(ctx, { limit: 10000 });

  const summary: CustomerStatsSummary = {
    totalCustomers: customers.length,
    activeCustomers: 0,
    inactiveCustomers: 0,
    blacklistedCustomers: 0,
    suspendedCustomers: 0,
    totalRevenue: 0,
    averageRevenue: 0,
  };

  customers.forEach((customer) => {
    // Count by status
    if (customer.status === CUSTOMERS_CONSTANTS.STATUS.ACTIVE) {
      summary.activeCustomers++;
    } else if (customer.status === CUSTOMERS_CONSTANTS.STATUS.INACTIVE) {
      summary.inactiveCustomers++;
    } else if (customer.status === CUSTOMERS_CONSTANTS.STATUS.BLACKLISTED) {
      summary.blacklistedCustomers++;
    }

    // Count suspended
    if (customer.serviceSuspended) {
      summary.suspendedCustomers++;
    }

    // Sum revenue
    summary.totalRevenue += customer.stats.totalRevenue || 0;
  });

  // Calculate average revenue
  if (summary.totalCustomers > 0) {
    summary.averageRevenue = summary.totalRevenue / summary.totalCustomers;
  }

  return summary;
}

/**
 * Get recently created customers
 */
export async function getRecentCustomers(ctx: QueryCtx, limit: number = 10): Promise<Customer[]> {
  return listCustomers(ctx, {
    limit,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
}

/**
 * Get recently updated customers
 */
export async function getRecentlyUpdatedCustomers(ctx: QueryCtx, limit: number = 10): Promise<Customer[]> {
  return listCustomers(ctx, {
    limit,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  });
}

/**
 * Check if customer exists by public ID
 */
export async function customerExistsByPublicId(ctx: QueryCtx, publicId: string): Promise<boolean> {
  const customer = await ctx.db
    .query('yourobcCustomers')
    .withIndex('by_public_id', (q) => q.eq('publicId', publicId))
    .first();
  return customer !== null && !customer.deletedAt;
}

/**
 * Check if customer exists by company name
 */
export async function customerExistsByCompanyName(ctx: QueryCtx, companyName: string): Promise<boolean> {
  const customer = await ctx.db
    .query('yourobcCustomers')
    .withIndex('by_name', (q) => q.eq('companyName', companyName))
    .first();
  return customer !== null && !customer.deletedAt;
}
