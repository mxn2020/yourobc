// convex/lib/boilerplate/autumn/autumn_customers/queries.ts
// Read operations for autumn customers module

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { autumnCustomersValidators } from '@/schema/boilerplate/autumn/autumn_customers/validators';
import { filterAutumnCustomersByAccess, requireViewAutumnCustomerAccess } from './permissions';
import type { AutumnCustomerListResponse } from './types';

/**
 * Get paginated list of autumn customers with filtering
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admins see all, users see their own
 */
export const getAutumnCustomers = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    filters: v.optional(v.object({
      subscriptionStatus: v.optional(v.array(autumnCustomersValidators.subscriptionStatus)),
      search: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args): Promise<AutumnCustomerListResponse> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, offset = 0, filters = {} } = args;

    // Query all customers
    let customers = await ctx.db
      .query('autumnCustomers')
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Apply access control filtering
    customers = await filterAutumnCustomersByAccess(ctx, customers, user);

    // Apply subscription status filter
    if (filters.subscriptionStatus?.length) {
      customers = customers.filter((customer) =>
        customer.subscriptionStatus && filters.subscriptionStatus!.includes(customer.subscriptionStatus)
      );
    }

    // Apply search filter
    if (filters.search) {
      const term = filters.search.toLowerCase();
      customers = customers.filter((customer) =>
        customer.name.toLowerCase().includes(term) ||
        customer.autumnCustomerId.toLowerCase().includes(term) ||
        customer.authUserId.toLowerCase().includes(term)
      );
    }

    // Sort by created date descending
    customers.sort((a, b) => b.createdAt - a.createdAt);

    // Paginate
    const total = customers.length;
    const items = customers.slice(offset, offset + limit);

    return {
      items,
      total,
      hasMore: total > offset + limit,
    };
  },
});

/**
 * Get single autumn customer by ID
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin
 */
export const getAutumnCustomer = query({
  args: {
    customerId: v.id('autumnCustomers'),
  },
  handler: async (ctx, { customerId }) => {
    const user = await requireCurrentUser(ctx);

    const customer = await ctx.db.get(customerId);
    if (!customer || customer.deletedAt) {
      throw new Error('Customer not found');
    }

    await requireViewAutumnCustomerAccess(ctx, customer, user);

    return customer;
  },
});

/**
 * Get autumn customer by public ID
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin
 */
export const getAutumnCustomerByPublicId = query({
  args: {
    publicId: v.string(),
  },
  handler: async (ctx, { publicId }) => {
    const user = await requireCurrentUser(ctx);

    const customer = await ctx.db
      .query('autumnCustomers')
      .withIndex('by_public_id', (q) => q.eq('publicId', publicId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (!customer) {
      throw new Error('Customer not found');
    }

    await requireViewAutumnCustomerAccess(ctx, customer, user);

    return customer;
  },
});

/**
 * Get autumn customer by user ID
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin
 */
export const getAutumnCustomerByUserId = query({
  args: {
    userId: v.id('userProfiles'),
  },
  handler: async (ctx, { userId }) => {
    const user = await requireCurrentUser(ctx);

    const customer = await ctx.db
      .query('autumnCustomers')
      .withIndex('by_user_id', (q) => q.eq('userId', userId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (!customer) {
      return null;
    }

    await requireViewAutumnCustomerAccess(ctx, customer, user);

    return customer;
  },
});

/**
 * Get autumn customer by auth user ID
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin
 */
export const getAutumnCustomerByAuthUserId = query({
  args: {
    authUserId: v.string(),
  },
  handler: async (ctx, { authUserId }) => {
    const user = await requireCurrentUser(ctx);

    const customer = await ctx.db
      .query('autumnCustomers')
      .withIndex('by_auth_user_id', (q) => q.eq('authUserId', authUserId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (!customer) {
      return null;
    }

    await requireViewAutumnCustomerAccess(ctx, customer, user);

    return customer;
  },
});

/**
 * Get autumn customer by Autumn customer ID
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const getAutumnCustomerByAutumnId = query({
  args: {
    autumnCustomerId: v.string(),
  },
  handler: async (ctx, { autumnCustomerId }) => {
    const user = await requireCurrentUser(ctx);

    // Only admins can query by autumn customer ID
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      throw new Error('Permission denied: Admin access required');
    }

    const customer = await ctx.db
      .query('autumnCustomers')
      .withIndex('by_autumn_customer_id', (q) => q.eq('autumnCustomerId', autumnCustomerId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    return customer;
  },
});

/**
 * Get autumn customer statistics
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const getAutumnCustomerStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);

    // Check admin access
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      throw new Error('Permission denied: Admin access required');
    }

    const customers = await ctx.db
      .query('autumnCustomers')
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    return {
      total: customers.length,
      byStatus: {
        active: customers.filter((c) => c.subscriptionStatus === 'active').length,
        trialing: customers.filter((c) => c.subscriptionStatus === 'trialing').length,
        cancelled: customers.filter((c) => c.subscriptionStatus === 'cancelled').length,
        past_due: customers.filter((c) => c.subscriptionStatus === 'past_due').length,
        inactive: customers.filter((c) => c.subscriptionStatus === 'inactive').length,
      },
      withActivePlans: customers.filter((c) => c.currentPlanId).length,
      needsSync: customers.filter((c) => Date.now() - c.lastSyncedAt > 300000).length,
    };
  },
});
