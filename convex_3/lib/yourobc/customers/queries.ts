// convex/lib/yourobc/customers/queries.ts
// Read operations for customers module

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { notDeleted } from '@/shared/db.helper';
import { customersValidators } from '@/schema/yourobc/customers/validators';
import { filterCustomersByAccess } from './permissions';
import { calculateAverageMargin, calculateAveragePaymentTerms } from './utils';
import type { CustomerListResponse, CustomerFilters, CustomerStatsResponse } from './types';
import { baseValidators } from '@/schema/base.validators';

/**
 * Get paginated list of customers with filtering
 */
export const getCustomers = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    filters: v.optional(v.object({
      status: v.optional(v.array(customersValidators.status)),
      currency: v.optional(v.array(baseValidators.currency)),
      search: v.optional(v.string()),
      inquirySourceId: v.optional(v.id('inquirySources')),
      country: v.optional(v.string()),
      serviceSuspended: v.optional(v.boolean()),
    })),
  },
  handler: async (ctx, args): Promise<CustomerListResponse> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, offset = 0, filters = {} } = args;

    // Query all customers (will filter by access later)
    let customers = await ctx.db
      .query('yourobcCustomers')
      .filter(notDeleted)
      .collect();

    // Apply access filtering
    customers = await filterCustomersByAccess(ctx, customers, user);

    // Apply status filter
    if (filters.status?.length) {
      customers = customers.filter(customer =>
        filters.status!.includes(customer.status)
      );
    }

    // Apply currency filter
    if (filters.currency?.length) {
      customers = customers.filter(customer =>
        filters.currency!.includes(customer.defaultCurrency)
      );
    }

    // Apply search filter
    if (filters.search) {
      const term = filters.search.toLowerCase();
      customers = customers.filter(customer =>
        customer.companyName.toLowerCase().includes(term) ||
        (customer.shortName && customer.shortName.toLowerCase().includes(term)) ||
        (customer.notes && customer.notes.toLowerCase().includes(term))
      );
    }

    // Apply inquiry source filter
    if (filters.inquirySourceId) {
      customers = customers.filter(customer =>
        customer.inquirySourceId === filters.inquirySourceId
      );
    }

    // Apply country filter
    if (filters.country) {
      customers = customers.filter(customer =>
        customer.billingAddress.country === filters.country
      );
    }

    // Apply service suspended filter
    if (filters.serviceSuspended !== undefined) {
      customers = customers.filter(customer =>
        !!customer.serviceSuspended === filters.serviceSuspended
      );
    }

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
 * Get single customer by ID
 */
export const getCustomer = query({
  args: {
    customerId: v.id('yourobcCustomers'),
  },
  handler: async (ctx, { customerId }) => {
    const user = await requireCurrentUser(ctx);

    const customer = await ctx.db.get(customerId);
    if (!customer || customer.deletedAt) {
      throw new Error('Customer not found');
    }

    // Check access
    const accessible = await filterCustomersByAccess(ctx, [customer], user);
    if (accessible.length === 0) {
      throw new Error('You do not have permission to view this customer');
    }

    return customer;
  },
});

/**
 * Get customer by public ID
 */
export const getCustomerByPublicId = query({
  args: {
    publicId: v.string(),
  },
  handler: async (ctx, { publicId }) => {
    const user = await requireCurrentUser(ctx);

    const customer = await ctx.db
      .query('yourobcCustomers')
      .withIndex('by_public_id', q => q.eq('publicId', publicId))
      .filter(notDeleted)
      .first();

    if (!customer) {
      throw new Error('Customer not found');
    }

    // Check access
    const accessible = await filterCustomersByAccess(ctx, [customer], user);
    if (accessible.length === 0) {
      throw new Error('You do not have permission to view this customer');
    }

    return customer;
  },
});

/**
 * Get customer statistics
 */
export const getCustomerStats = query({
  args: {},
  handler: async (ctx): Promise<CustomerStatsResponse> => {
    const user = await requireCurrentUser(ctx);

    // Get all non-deleted customers
    const customers = await ctx.db
      .query('yourobcCustomers')
      .filter(notDeleted)
      .collect();

    // Filter by access
    const accessible = await filterCustomersByAccess(ctx, customers, user);

    return {
      total: accessible.length,
      byStatus: {
        active: accessible.filter(c => c.status === 'active').length,
        inactive: accessible.filter(c => c.status === 'inactive').length,
        blacklisted: accessible.filter(c => c.status === 'blacklisted').length,
      },
      byCurrency: {
        EUR: accessible.filter(c => c.defaultCurrency === 'EUR').length,
        USD: accessible.filter(c => c.defaultCurrency === 'USD').length,
      },
      serviceSuspended: accessible.filter(c => c.serviceSuspended).length,
      averageMargin: calculateAverageMargin(accessible),
      averagePaymentTerms: calculateAveragePaymentTerms(accessible),
    };
  },
});
