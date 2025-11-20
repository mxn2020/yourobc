// convex/lib/yourobc/customers/queries.ts
/**
 * Customer Queries
 *
 * This module contains all query functions for retrieving customer data from the YourOBC system.
 * Following the template pattern, all validators are imported from schema/yourobc/base.
 *
 * @module convex/lib/yourobc/customers/queries
 */

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';
import { CUSTOMER_CONSTANTS } from './constants';
import {
  calculateCustomerScore,
  getCustomerRiskLevel,
  isCustomerActive
} from './utils';

/**
 * Retrieves a paginated list of customers with optional filtering and sorting.
 *
 * @param authUserId - The ID of the authenticated user
 * @param options - Query options including pagination, sorting, and filters
 * @returns Object containing customers array, total count, and hasMore flag
 */
export const getCustomers = query({
  args: {
    authUserId: v.string(),
    options: v.optional(v.object({
      limit: v.optional(v.number()),
      offset: v.optional(v.number()),
      sortBy: v.optional(v.string()),
      sortOrder: v.optional(v.union(v.literal('asc'), v.literal('desc'))),
      filters: v.optional(v.object({
        status: v.optional(v.array(v.string())),
        countries: v.optional(v.array(v.string())),
        currencies: v.optional(v.array(v.string())),
        paymentMethods: v.optional(v.array(v.string())),
        inquirySources: v.optional(v.array(v.id('yourobcInquirySources'))),
        tags: v.optional(v.array(v.string())),
        search: v.optional(v.string()),
        hasRecentActivity: v.optional(v.boolean()),
      }))
    }))
  },
  handler: async (ctx, { authUserId, options = {} }) => {
    await requirePermission(ctx, authUserId, CUSTOMER_CONSTANTS.PERMISSIONS.VIEW);

    const {
      limit = 50,
      offset = 0,
      sortOrder = 'asc',
      filters = {}
    } = options;

    let customersQuery = ctx.db.query('yourobcCustomers');

    const { status } = filters;

    if (status?.length) {
      customersQuery = customersQuery.filter((q) =>
        q.or(...status.map(s => q.eq(q.field('status'), s)))
      );
    }

    const customers = await customersQuery
      .order(sortOrder === 'desc' ? 'desc' : 'asc')
      .collect();

    let filteredCustomers = customers;

    // Apply client-side filters
    if (filters.countries?.length) {
      filteredCustomers = filteredCustomers.filter(customer =>
        filters.countries!.includes(customer.billingAddress.countryCode)
      );
    }

    if (filters.currencies?.length) {
      filteredCustomers = filteredCustomers.filter(customer =>
        filters.currencies!.includes(customer.defaultCurrency)
      );
    }

    if (filters.paymentMethods?.length) {
      filteredCustomers = filteredCustomers.filter(customer =>
        filters.paymentMethods!.includes(customer.paymentMethod)
      );
    }

    if (filters.inquirySources?.length) {
      filteredCustomers = filteredCustomers.filter(customer =>
        customer.inquirySourceId && filters.inquirySources!.includes(customer.inquirySourceId)
      );
    }

    if (filters.tags?.length) {
      filteredCustomers = filteredCustomers.filter(customer =>
        filters.tags!.some(tag => customer.tags.includes(tag))
      );
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredCustomers = filteredCustomers.filter(customer =>
        customer.companyName.toLowerCase().includes(searchTerm) ||
        customer.shortName?.toLowerCase().includes(searchTerm) ||
        customer.primaryContact.name.toLowerCase().includes(searchTerm) ||
        customer.primaryContact.email?.toLowerCase().includes(searchTerm) ||
        customer.primaryContact.phone?.toLowerCase().includes(searchTerm) ||
        customer.website?.toLowerCase().includes(searchTerm) ||
        customer.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    if (filters.hasRecentActivity !== undefined) {
      filteredCustomers = filteredCustomers.filter(customer =>
        isCustomerActive(customer, 90) === filters.hasRecentActivity
      );
    }

    const customersWithDetails = await Promise.all(
      filteredCustomers.slice(offset, offset + limit).map(async (customer) => {
        const inquirySource = customer.inquirySourceId ?
          await ctx.db.get(customer.inquirySourceId) : null;

        const score = calculateCustomerScore(customer);
        const riskLevel = getCustomerRiskLevel(customer);
        const isActive = isCustomerActive(customer);

        return {
          ...customer,
          inquirySource: inquirySource ? {
            name: inquirySource.name,
            type: inquirySource.type,
          } : null,
          score,
          riskLevel,
          isActive,
        };
      })
    );

    return {
      customers: customersWithDetails,
      total: filteredCustomers.length,
      hasMore: filteredCustomers.length > offset + limit,
    };
  },
});

/**
 * Retrieves detailed information for a single customer including recent activity.
 *
 * @param customerId - The ID of the customer to retrieve
 * @param authUserId - The ID of the authenticated user
 * @returns Customer details with inquiry source, scores, and recent activity summary
 * @throws {Error} If customer not found
 */
export const getCustomer = query({
  args: {
    customerId: v.optional(v.id('yourobcCustomers')),
    authUserId: v.string()
  },
  handler: async (ctx, { customerId, authUserId }) => {
    await requirePermission(ctx, authUserId, CUSTOMER_CONSTANTS.PERMISSIONS.VIEW);

    if (!customerId) {
      return null;
    }

    const customer = await ctx.db.get(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    const inquirySource = customer.inquirySourceId ?
      await ctx.db.get(customer.inquirySourceId) : null;

    const score = calculateCustomerScore(customer);
    const riskLevel = getCustomerRiskLevel(customer);
    const isActive = isCustomerActive(customer);

    // Get recent quotes count
    const recentQuotes = await ctx.db
      .query('yourobcQuotes')
      .withIndex('by_customer', (q) => q.eq('customerId', customerId))
      .order('desc')
      .take(5);

    // Get recent shipments count
    const recentShipments = await ctx.db
      .query('yourobcShipments')
      .withIndex('by_customer', (q) => q.eq('customerId', customerId))
      .order('desc')
      .take(5);

    // Get outstanding invoices
    const outstandingInvoices = await ctx.db
      .query('yourobcInvoices')
      .withIndex('by_customer', (q) => q.eq('customerId', customerId))
      .filter((q) => q.neq(q.field('status'), 'paid'))
      .collect();

    return {
      ...customer,
      inquirySource: inquirySource ? {
        name: inquirySource.name,
        type: inquirySource.type,
        description: inquirySource.description,
      } : null,
      score,
      riskLevel,
      isActive,
      recentActivity: {
        quotes: recentQuotes.length,
        shipments: recentShipments.length,
        outstandingInvoices: outstandingInvoices.length,
        outstandingAmount: outstandingInvoices.reduce((sum, inv) => sum + inv.totalAmount.amount, 0),
      },
    };
  },
});

/**
 * Retrieves aggregated statistics across all customers.
 *
 * @param authUserId - The ID of the authenticated user
 * @returns Statistics including totals by status, country, currency, revenue, and new customers
 */
export const getCustomerStats = query({
  args: {
    authUserId: v.string(),
  },
  handler: async (ctx, { authUserId }) => {
    await requirePermission(ctx, authUserId, CUSTOMER_CONSTANTS.PERMISSIONS.VIEW_STATS);

    const customers = await ctx.db.query('yourobcCustomers').collect();

    const customersByCountry = customers.reduce((acc, customer) => {
      const country = customer.billingAddress.country;
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const customersByCurrency = customers.reduce((acc, customer) => {
      const currency = customer.defaultCurrency;
      acc[currency] = (acc[currency] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const activeCustomers = customers.filter(c => c.status === CUSTOMER_CONSTANTS.STATUS.ACTIVE);
    const inactiveCustomers = customers.filter(c => c.status === CUSTOMER_CONSTANTS.STATUS.INACTIVE);
    const blacklistedCustomers = customers.filter(c => c.status === CUSTOMER_CONSTANTS.STATUS.BLACKLISTED);

    const totalRevenue = customers.reduce((sum, c) => sum + c.stats.totalRevenue, 0);
    const averagePaymentTerms = customers.length > 0 ?
      customers.reduce((sum, c) => sum + c.paymentTerms, 0) / customers.length : 0;

    // Calculate new customers this month
    const now = Date.now();
    const thisMonth = new Date(now);
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    const monthStart = thisMonth.getTime();

    const newCustomersThisMonth = customers.filter(c => c.createdAt >= monthStart).length;

    const stats = {
      totalCustomers: customers.length,
      activeCustomers: activeCustomers.length,
      inactiveCustomers: inactiveCustomers.length,
      blacklistedCustomers: blacklistedCustomers.length,
      customersByCountry,
      customersByCurrency,
      averagePaymentTerms: Math.round(averagePaymentTerms),
      totalRevenue,
      newCustomersThisMonth,
    };

    return stats;
  },
});

/**
 * Searches customers by company name, contact info, website, or tags.
 *
 * @param authUserId - The ID of the authenticated user
 * @param searchTerm - Search term (minimum 2 characters)
 * @param limit - Maximum number of results to return (default: 20)
 * @param includeInactive - Whether to include inactive customers (default: false)
 * @returns Array of matching customers with scores and inquiry source info
 */
export const searchCustomers = query({
  args: {
    authUserId: v.string(),
    searchTerm: v.string(),
    limit: v.optional(v.number()),
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, { authUserId, searchTerm, limit = 20, includeInactive = false }) => {
    await requirePermission(ctx, authUserId, CUSTOMER_CONSTANTS.PERMISSIONS.VIEW);

    if (searchTerm.length < 2) {
      return [];
    }

    let customersQuery = ctx.db.query('yourobcCustomers');

    if (!includeInactive) {
      customersQuery = customersQuery.filter((q) => q.eq(q.field('status'), CUSTOMER_CONSTANTS.STATUS.ACTIVE));
    }

    const customers = await customersQuery.collect();
    const searchLower = searchTerm.toLowerCase();

    const filtered = customers.filter(customer =>
      customer.companyName.toLowerCase().includes(searchLower) ||
      customer.shortName?.toLowerCase().includes(searchLower) ||
      customer.primaryContact.name.toLowerCase().includes(searchLower) ||
      customer.primaryContact.email?.toLowerCase().includes(searchLower) ||
      customer.primaryContact.phone?.toLowerCase().includes(searchLower) ||
      customer.website?.toLowerCase().includes(searchLower) ||
      customer.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );

    const customersWithDetails = await Promise.all(
      filtered.slice(0, limit).map(async (customer) => {
        const inquirySource = customer.inquirySourceId ?
          await ctx.db.get(customer.inquirySourceId) : null;

        const score = calculateCustomerScore(customer);
        const riskLevel = getCustomerRiskLevel(customer);

        return {
          ...customer,
          inquirySource: inquirySource ? {
            name: inquirySource.name,
            type: inquirySource.type,
          } : null,
          score,
          riskLevel,
        };
      })
    );

    return customersWithDetails;
  },
});

/**
 * Retrieves recent activity (quotes, shipments, invoices) for a customer.
 *
 * @param authUserId - The ID of the authenticated user
 * @param customerId - The ID of the customer
 * @param limit - Maximum number of activities to return per type (default: 50)
 * @returns Combined and sorted activity list with summary counts
 * @throws {Error} If customer not found
 */
export const getCustomerActivity = query({
  args: {
    authUserId: v.string(),
    customerId: v.optional(v.id('yourobcCustomers')),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { authUserId, customerId, limit = 50 }) => {
    await requirePermission(ctx, authUserId, CUSTOMER_CONSTANTS.PERMISSIONS.VIEW);

    if (!customerId) {
      return null;
    }

    const customer = await ctx.db.get(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    // Get quotes
    const quotes = await ctx.db
      .query('yourobcQuotes')
      .withIndex('by_customer', (q) => q.eq('customerId', customerId))
      .order('desc')
      .take(limit);

    // Get shipments
    const shipments = await ctx.db
      .query('yourobcShipments')
      .withIndex('by_customer', (q) => q.eq('customerId', customerId))
      .order('desc')
      .take(limit);

    // Get invoices
    const invoices = await ctx.db
      .query('yourobcInvoices')
      .withIndex('by_customer', (q) => q.eq('customerId', customerId))
      .order('desc')
      .take(limit);

    // Combine and sort all activities
    const activities = [
      ...quotes.map(q => ({ ...q, type: 'quote' as const })),
      ...shipments.map(s => ({ ...s, type: 'shipment' as const })),
      ...invoices.map(i => ({ ...i, type: 'invoice' as const })),
    ].sort((a, b) => b.createdAt - a.createdAt).slice(0, limit);

    return {
      activities,
      summary: {
        totalQuotes: quotes.length,
        totalShipments: shipments.length,
        totalInvoices: invoices.length,
      },
    };
  },
});

/**
 * Retrieves top customers ranked by revenue, quotes, or score.
 *
 * @param authUserId - The ID of the authenticated user
 * @param limit - Maximum number of customers to return (default: 10)
 * @param sortBy - Ranking criteria: revenue, yourobcQuotes, or score (default: revenue)
 * @returns Array of top customers sorted by selected criteria
 */
export const getTopCustomers = query({
  args: {
    authUserId: v.string(),
    limit: v.optional(v.number()),
    sortBy: v.optional(v.union(v.literal('revenue'), v.literal('yourobcQuotes'), v.literal('score'))),
  },
  handler: async (ctx, { authUserId, limit = 10, sortBy = 'revenue' }) => {
    await requirePermission(ctx, authUserId, CUSTOMER_CONSTANTS.PERMISSIONS.VIEW_STATS);

    const customers = await ctx.db.query('yourobcCustomers')
      .filter((q) => q.eq(q.field('status'), CUSTOMER_CONSTANTS.STATUS.ACTIVE))
      .collect();

    const customersWithScores = customers.map(customer => ({
      ...customer,
      score: calculateCustomerScore(customer),
      riskLevel: getCustomerRiskLevel(customer),
    }));

    // Sort based on criteria
    let sorted;
    switch (sortBy) {
      case 'revenue':
        sorted = customersWithScores.sort((a, b) => b.stats.totalRevenue - a.stats.totalRevenue);
        break;
      case 'yourobcQuotes':
        sorted = customersWithScores.sort((a, b) => b.stats.totalQuotes - a.stats.totalQuotes);
        break;
      case 'score':
        sorted = customersWithScores.sort((a, b) => b.score - a.score);
        break;
      default:
        sorted = customersWithScores.sort((a, b) => b.stats.totalRevenue - a.stats.totalRevenue);
    }

    return sorted.slice(0, limit);
  },
});

/**
 * Retrieves all unique customer tags with usage counts.
 *
 * @param authUserId - The ID of the authenticated user
 * @returns Array of tags sorted by usage count (descending)
 */
export const getCustomerTags = query({
  args: {
    authUserId: v.string(),
  },
  handler: async (ctx, { authUserId }) => {
    await requirePermission(ctx, authUserId, CUSTOMER_CONSTANTS.PERMISSIONS.VIEW);

    const customers = await ctx.db.query('yourobcCustomers').collect();

    const tagCounts = customers.reduce((acc, customer) => {
      customer.tags.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const sortedTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([tag, count]) => ({ tag, count }));

    return sortedTags;
  },
});