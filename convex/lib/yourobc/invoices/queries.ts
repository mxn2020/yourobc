// convex/lib/yourobc/invoices/queries.ts
// convex/yourobc/invoices/queries.ts

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';
import { INVOICE_CONSTANTS } from './constants';
import { 
  getInvoiceOverdueStatus,
  formatCurrencyAmount 
} from './utils';
import { CustomerId } from '../customers';
import { PartnerId } from '../partners';
import { ShipmentId } from '../shipments';

export const getInvoices = query({
  args: {
    authUserId: v.string(),
    options: v.optional(v.object({
      limit: v.optional(v.number()),
      offset: v.optional(v.number()),
      sortBy: v.optional(v.string()),
      sortOrder: v.optional(v.union(v.literal('asc'), v.literal('desc'))),
      filters: v.optional(v.object({
        type: v.optional(v.array(v.string())),
        status: v.optional(v.array(v.string())),
        customerId: v.optional(v.id('yourobcCustomers')),
        partnerId: v.optional(v.id('yourobcPartners')),
        shipmentId: v.optional(v.id('yourobcShipments')),
        isOverdue: v.optional(v.boolean()),
        dateRange: v.optional(v.object({
          start: v.number(),
          end: v.number(),
          field: v.optional(v.string()),
        })),
        amountRange: v.optional(v.object({
          min: v.number(),
          max: v.number(),
          currency: v.string(),
        })),
        search: v.optional(v.string()),
      }))
    }))
  },
  handler: async (ctx, { authUserId, options = {} }) => {
    await requirePermission(ctx, authUserId, INVOICE_CONSTANTS.PERMISSIONS.VIEW);

    const {
      limit = 50,
      offset = 0,
      sortOrder = 'desc',
      filters = {}
    } = options;

    let invoicesQuery = ctx.db.query('yourobcInvoices');

    const { type, status, customerId, partnerId, shipmentId } = filters;

    // Apply database-level filters
    if (type?.length) {
      invoicesQuery = invoicesQuery.filter((q) =>
        q.or(...type.map(t => q.eq(q.field('type'), t)))
      );
    }

    if (status?.length) {
      invoicesQuery = invoicesQuery.filter((q) =>
        q.or(...status.map(s => q.eq(q.field('status'), s)))
      );
    }

    if (customerId) {
      invoicesQuery = invoicesQuery.filter((q) => q.eq(q.field('customerId'), customerId));
    }

    if (partnerId) {
      invoicesQuery = invoicesQuery.filter((q) => q.eq(q.field('partnerId'), partnerId));
    }

    if (shipmentId) {
      invoicesQuery = invoicesQuery.filter((q) => q.eq(q.field('shipmentId'), shipmentId));
    }

    const invoices = await invoicesQuery
      .order(sortOrder === 'desc' ? 'desc' : 'asc')
      .collect();

    let filteredInvoices = invoices;

    // Apply client-side filters
    if (filters.dateRange) {
      const { start, end, field = 'issueDate' } = filters.dateRange;
      filteredInvoices = filteredInvoices.filter(invoice => {
        const dateField = field === 'paymentDate' ? invoice.paymentDate :
                         field === 'dueDate' ? invoice.dueDate : 
                         invoice.issueDate;
        return dateField && dateField >= start && dateField <= end;
      });
    }

    if (filters.amountRange) {
      const { min, max, currency } = filters.amountRange;
      filteredInvoices = filteredInvoices.filter(invoice =>
        invoice.totalAmount.currency === currency &&
        invoice.totalAmount.amount >= min &&
        invoice.totalAmount.amount <= max
      );
    }

    if (filters.isOverdue !== undefined) {
      filteredInvoices = filteredInvoices.filter(invoice => {
        const overdueStatus = getInvoiceOverdueStatus(invoice);
        return filters.isOverdue ? overdueStatus.isOverdue : !overdueStatus.isOverdue;
      });
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredInvoices = filteredInvoices.filter(invoice =>
        invoice.invoiceNumber.toLowerCase().includes(searchTerm) ||
        invoice.description.toLowerCase().includes(searchTerm) ||
        invoice.externalInvoiceNumber?.toLowerCase().includes(searchTerm) ||
        invoice.purchaseOrderNumber?.toLowerCase().includes(searchTerm)
      );
    }

    // Get related entities for the paginated results
    const invoicesWithEntities = await Promise.all(
      filteredInvoices.slice(offset, offset + limit).map(async (invoice) => {
        const customer = invoice.customerId ? await ctx.db.get(invoice.customerId) : null;
        const partner = invoice.partnerId ? await ctx.db.get(invoice.partnerId) : null;
        const shipment = invoice.shipmentId ? await ctx.db.get(invoice.shipmentId) : null;
        const overdueStatus = getInvoiceOverdueStatus(invoice);

        return {
          ...invoice,
          customer: customer ? {
            _id: customer._id,
            companyName: customer.companyName,
            shortName: customer.shortName,
          } : null,
          partner: partner ? {
            _id: partner._id,
            companyName: partner.companyName,
            shortName: partner.shortName,
          } : null,
          shipment: shipment ? {
            _id: shipment._id,
            shipmentNumber: shipment.shipmentNumber,
          } : null,
          overdueStatus,
        };
      })
    );

    return {
      invoices: invoicesWithEntities,
      total: filteredInvoices.length,
      hasMore: filteredInvoices.length > offset + limit,
    };
  },
});

export const getInvoice = query({
  args: {
    invoiceId: v.id('yourobcInvoices'),
    authUserId: v.string()
  },
  handler: async (ctx, { invoiceId, authUserId }) => {
    await requirePermission(ctx, authUserId, INVOICE_CONSTANTS.PERMISSIONS.VIEW);

    const invoice = await ctx.db.get(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    const customer = invoice.customerId ? await ctx.db.get(invoice.customerId) : null;
    const partner = invoice.partnerId ? await ctx.db.get(invoice.partnerId) : null;
    const shipment = invoice.shipmentId ? await ctx.db.get(invoice.shipmentId) : null;
    const overdueStatus = getInvoiceOverdueStatus(invoice);

    // Get collection attempts with user details
    const collectionAttemptsWithUsers = await Promise.all(
      invoice.collectionAttempts.map(async (attempt) => {
        const userProfile = await ctx.db
          .query('userProfiles')
          .withIndex('by_auth_user_id', (q) => q.eq('authUserId', attempt.createdBy))
          .first();

        return {
          ...attempt,
          createdByUser: userProfile ? {
            name: userProfile.name,
            email: userProfile.email,
          } : null,
        };
      })
    );

    return {
      ...invoice,
      customer: customer ? {
        _id: customer._id,
        companyName: customer.companyName,
        shortName: customer.shortName,
        primaryContact: customer.primaryContact,
        billingAddress: customer.billingAddress,
        paymentTerms: customer.paymentTerms,
      } : null,
      partner: partner ? {
        _id: partner._id,
        companyName: partner.companyName,
        shortName: partner.shortName,
        primaryContact: partner.primaryContact,
        address: partner.address,
      } : null,
      shipment: shipment ? {
        _id: shipment._id,
        shipmentNumber: shipment.shipmentNumber,
        description: shipment.description,
        customerId: shipment.customerId,
      } : null,
      overdueStatus,
      collectionAttemptsWithUsers,
    };
  },
});

export const getInvoiceStats = query({
  args: {
    authUserId: v.string(),
    dateRange: v.optional(v.object({
      start: v.number(),
      end: v.number(),
    })),
  },
  handler: async (ctx, { authUserId, dateRange }) => {
    await requirePermission(ctx, authUserId, INVOICE_CONSTANTS.PERMISSIONS.VIEW);

    let invoices = await ctx.db.query('yourobcInvoices').collect();

    // Filter by date range if provided
    if (dateRange) {
      invoices = invoices.filter(invoice =>
        invoice.issueDate >= dateRange.start && invoice.issueDate <= dateRange.end
      );
    }

    const now = Date.now();
    
    // Calculate basic stats
    const totalInvoices = invoices.length;
    const outgoingInvoices = invoices.filter(i => i.type === 'outgoing');
    const incomingInvoices = invoices.filter(i => i.type === 'incoming');
    
    const totalOutgoingAmount = outgoingInvoices.reduce((sum, invoice) => {
      if (invoice.totalAmount.currency === 'EUR') {
        return sum + invoice.totalAmount.amount;
      }
      // Convert USD to EUR if needed (simplified - should use actual exchange rates)
      return sum + (invoice.totalAmount.amount * 0.85);
    }, 0);

    const totalIncomingAmount = incomingInvoices.reduce((sum, invoice) => {
      if (invoice.totalAmount.currency === 'EUR') {
        return sum + invoice.totalAmount.amount;
      }
      return sum + (invoice.totalAmount.amount * 0.85);
    }, 0);

    const paidInvoices = invoices.filter(i => i.status === 'paid').length;
    const draftInvoices = invoices.filter(i => i.status === 'draft').length;
    
    // Calculate overdue invoices
    const overdueInvoices = invoices.filter(invoice => {
      if (invoice.status === 'paid' || invoice.status === 'cancelled') return false;
      return invoice.dueDate < now;
    });

    const outstandingAmount = invoices
      .filter(i => i.status !== 'paid' && i.status !== 'cancelled')
      .reduce((sum, invoice) => {
        if (invoice.totalAmount.currency === 'EUR') {
          return sum + invoice.totalAmount.amount;
        }
        return sum + (invoice.totalAmount.amount * 0.85);
      }, 0);

    // Calculate average payment time for paid invoices
    const paidInvoicesWithPaymentTime = invoices
      .filter(i => i.status === 'paid' && i.paymentDate && i.issueDate)
      .map(i => Math.ceil((i.paymentDate! - i.issueDate) / (1000 * 60 * 60 * 24)));

    const avgPaymentTime = paidInvoicesWithPaymentTime.length > 0
      ? Math.round(paidInvoicesWithPaymentTime.reduce((sum, days) => sum + days, 0) / paidInvoicesWithPaymentTime.length)
      : 0;

    // Group by status and type
    const invoicesByStatus = invoices.reduce((acc, invoice) => {
      acc[invoice.status] = (acc[invoice.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const invoicesByType = invoices.reduce((acc, invoice) => {
      acc[invoice.type] = (acc[invoice.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate monthly revenue and expenses for current month
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    const monthStart = currentMonth.getTime();
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59).getTime();

    const monthlyInvoices = invoices.filter(invoice =>
      invoice.issueDate >= monthStart && invoice.issueDate <= monthEnd
    );

    const monthlyRevenue = monthlyInvoices
      .filter(i => i.type === 'outgoing' && i.status === 'paid')
      .reduce((sum, invoice) => {
        if (invoice.totalAmount.currency === 'EUR') {
          return sum + invoice.totalAmount.amount;
        }
        return sum + (invoice.totalAmount.amount * 0.85);
      }, 0);

    const monthlyExpenses = monthlyInvoices
      .filter(i => i.type === 'incoming' && i.status === 'paid')
      .reduce((sum, invoice) => {
        if (invoice.totalAmount.currency === 'EUR') {
          return sum + invoice.totalAmount.amount;
        }
        return sum + (invoice.totalAmount.amount * 0.85);
      }, 0);

    return {
      totalInvoices,
      totalOutgoingAmount: Math.round(totalOutgoingAmount * 100) / 100,
      totalIncomingAmount: Math.round(totalIncomingAmount * 100) / 100,
      paidInvoices,
      overdueInvoices: overdueInvoices.length,
      draftInvoices,
      avgPaymentTime,
      outstandingAmount: Math.round(outstandingAmount * 100) / 100,
      invoicesByStatus,
      invoicesByType,
      monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
      monthlyExpenses: Math.round(monthlyExpenses * 100) / 100,
    };
  },
});

export const getOverdueInvoices = query({
  args: {
    authUserId: v.string(),
    limit: v.optional(v.number()),
    severityFilter: v.optional(v.union(v.literal('warning'), v.literal('critical'), v.literal('severe'))),
  },
  handler: async (ctx, { authUserId, limit = 20, severityFilter }) => {
    await requirePermission(ctx, authUserId, INVOICE_CONSTANTS.PERMISSIONS.VIEW);

    const invoices = await ctx.db.query('yourobcInvoices')
      .filter((q) => q.neq(q.field('status'), 'paid'))
      .filter((q) => q.neq(q.field('status'), 'cancelled'))
      .order('asc')
      .collect();

    const now = Date.now();
    
    const overdueInvoices = invoices
      .map(invoice => {
        const overdueStatus = getInvoiceOverdueStatus(invoice);
        return { ...invoice, overdueStatus };
      })
      .filter(invoice => {
        if (!invoice.overdueStatus.isOverdue && !invoice.overdueStatus.severity) return false;
        if (severityFilter && invoice.overdueStatus.severity !== severityFilter) return false;
        return true;
      })
      .sort((a, b) => a.dueDate - b.dueDate);

    // Get related entities for the results
    const overdueWithEntities = await Promise.all(
      overdueInvoices.slice(0, limit).map(async (invoice) => {
        const customer = invoice.customerId ? await ctx.db.get(invoice.customerId) : null;
        const partner = invoice.partnerId ? await ctx.db.get(invoice.partnerId) : null;

        return {
          ...invoice,
          customer: customer ? {
            _id: customer._id,
            companyName: customer.companyName,
            shortName: customer.shortName,
            primaryContact: customer.primaryContact,
          } : null,
          partner: partner ? {
            _id: partner._id,
            companyName: partner.companyName,
            shortName: partner.shortName,
            primaryContact: partner.primaryContact,
          } : null,
        };
      })
    );

    return {
      invoices: overdueWithEntities,
      total: overdueInvoices.length,
    };
  },
});

export const getInvoiceAging = query({
  args: {
    authUserId: v.string(),
    type: v.optional(v.union(v.literal('incoming'), v.literal('outgoing'))),
  },
  handler: async (ctx, { authUserId, type }) => {
    await requirePermission(ctx, authUserId, INVOICE_CONSTANTS.PERMISSIONS.VIEW_FINANCIAL_DATA);

    let invoicesQuery = ctx.db.query('yourobcInvoices')
      .filter((q) => q.neq(q.field('status'), 'paid'))
      .filter((q) => q.neq(q.field('status'), 'cancelled'));

    if (type) {
      invoicesQuery = invoicesQuery.filter((q) => q.eq(q.field('type'), type));
    }

    const invoices = await invoicesQuery.collect();
    
    const now = Date.now();
    const aging = {
      current: { count: 0, amount: 0 },
      days1to30: { count: 0, amount: 0 },
      days31to60: { count: 0, amount: 0 },
      days61to90: { count: 0, amount: 0 },
      over90: { count: 0, amount: 0 },
    };

    invoices.forEach(invoice => {
      const daysOverdue = Math.ceil((now - invoice.dueDate) / (1000 * 60 * 60 * 24));
      const amount = invoice.totalAmount.currency === 'EUR' 
        ? invoice.totalAmount.amount 
        : invoice.totalAmount.amount * 0.85; // Convert USD to EUR

      if (daysOverdue <= 0) {
        aging.current.count++;
        aging.current.amount += amount;
      } else if (daysOverdue <= 30) {
        aging.days1to30.count++;
        aging.days1to30.amount += amount;
      } else if (daysOverdue <= 60) {
        aging.days31to60.count++;
        aging.days31to60.amount += amount;
      } else if (daysOverdue <= 90) {
        aging.days61to90.count++;
        aging.days61to90.amount += amount;
      } else {
        aging.over90.count++;
        aging.over90.amount += amount;
      }
    });

    // Round amounts to 2 decimal places
    Object.keys(aging).forEach(key => {
      aging[key as keyof typeof aging].amount = Math.round(aging[key as keyof typeof aging].amount * 100) / 100;
    });

    return aging;
  },
});

export const searchInvoices = query({
  args: {
    authUserId: v.string(),
    searchTerm: v.string(),
    limit: v.optional(v.number()),
    includeFinancialData: v.optional(v.boolean()),
  },
  handler: async (ctx, { authUserId, searchTerm, limit = 20, includeFinancialData = false }) => {
    await requirePermission(ctx, authUserId, INVOICE_CONSTANTS.PERMISSIONS.VIEW);
    
    if (includeFinancialData) {
      await requirePermission(ctx, authUserId, INVOICE_CONSTANTS.PERMISSIONS.VIEW_FINANCIAL_DATA);
    }

    if (searchTerm.length < 2) {
      return [];
    }

    const invoices = await ctx.db.query('yourobcInvoices').collect();
    const searchLower = searchTerm.toLowerCase();

    const filtered = invoices.filter(invoice =>
      invoice.invoiceNumber.toLowerCase().includes(searchLower) ||
      invoice.description.toLowerCase().includes(searchLower) ||
      invoice.externalInvoiceNumber?.toLowerCase().includes(searchLower) ||
      invoice.purchaseOrderNumber?.toLowerCase().includes(searchLower)
    );

    const invoicesWithEntities = await Promise.all(
      filtered.slice(0, limit).map(async (invoice) => {
        const customer = invoice.customerId ? await ctx.db.get(invoice.customerId) : null;
        const partner = invoice.partnerId ? await ctx.db.get(invoice.partnerId) : null;
        const shipment = invoice.shipmentId ? await ctx.db.get(invoice.shipmentId) : null;
        const overdueStatus = getInvoiceOverdueStatus(invoice);

        const result: any = {
          _id: invoice._id,
          invoiceNumber: invoice.invoiceNumber,
          externalInvoiceNumber: invoice.externalInvoiceNumber,
          type: invoice.type,
          status: invoice.status,
          description: invoice.description,
          issueDate: invoice.issueDate,
          dueDate: invoice.dueDate,
          customer: customer ? {
            _id: customer._id,
            companyName: customer.companyName,
            shortName: customer.shortName,
          } : null,
          partner: partner ? {
            _id: partner._id,
            companyName: partner.companyName,
            shortName: partner.shortName,
          } : null,
          shipment: shipment ? {
            _id: shipment._id,
            shipmentNumber: shipment.shipmentNumber,
          } : null,
          overdueStatus,
        };

        if (includeFinancialData) {
          result.subtotal = invoice.subtotal;
          result.taxAmount = invoice.taxAmount;
          result.totalAmount = invoice.totalAmount;
          result.paidAmount = invoice.paidAmount;
          result.paymentDate = invoice.paymentDate;
        }

        return result;
      })
    );

    return invoicesWithEntities;
  },
});

export const getInvoicesByEntity = query({
  args: {
    authUserId: v.string(),
    entityType: v.union(
      v.literal('yourobc_customer'), 
      v.literal('yourobc_partner'), 
      v.literal('yourobc_shipment')
    ),
    entityId: v.string(),
    limit: v.optional(v.number()),
    includeFinancialData: v.optional(v.boolean()),
  },
  handler: async (ctx, { authUserId, entityType, entityId, limit = 20, includeFinancialData = false }) => {
    await requirePermission(ctx, authUserId, INVOICE_CONSTANTS.PERMISSIONS.VIEW);
    
    if (includeFinancialData) {
      await requirePermission(ctx, authUserId, INVOICE_CONSTANTS.PERMISSIONS.VIEW_FINANCIAL_DATA);
    }

    let invoicesQuery;

    if (entityType === 'yourobc_customer') {
      invoicesQuery = ctx.db.query('yourobcInvoices')
        .withIndex('by_customer', (q) => q.eq('customerId', entityId as CustomerId));
    } else if (entityType === 'yourobc_partner') {
      invoicesQuery = ctx.db.query('yourobcInvoices')
        .withIndex('by_partner', (q) => q.eq('partnerId', entityId as PartnerId));
    } else if (entityType === 'yourobc_shipment') {
      invoicesQuery = ctx.db.query('yourobcInvoices')
        .withIndex('by_shipment', (q) => q.eq('shipmentId', entityId as ShipmentId));
    } else {
      throw new Error('Invalid entity type');
    }

    const invoices = await invoicesQuery
      .order('desc')
      .take(limit);

    const invoicesWithDetails = await Promise.all(
      invoices.map(async (invoice) => {
        const customer = invoice.customerId ? await ctx.db.get(invoice.customerId) : null;
        const partner = invoice.partnerId ? await ctx.db.get(invoice.partnerId) : null;
        const shipment = invoice.shipmentId ? await ctx.db.get(invoice.shipmentId) : null;
        const overdueStatus = getInvoiceOverdueStatus(invoice);

        const result: any = {
          ...invoice,
          customer: customer ? {
            _id: customer._id,
            companyName: customer.companyName,
            shortName: customer.shortName,
          } : null,
          partner: partner ? {
            _id: partner._id,
            companyName: partner.companyName,
            shortName: partner.shortName,
          } : null,
          shipment: shipment ? {
            _id: shipment._id,
            shipmentNumber: shipment.shipmentNumber,
          } : null,
          overdueStatus,
        };

        if (!includeFinancialData) {
          // Remove financial data if not authorized
          delete result.subtotal;
          delete result.taxAmount;
          delete result.totalAmount;
          delete result.paidAmount;
          delete result.lineItems;
        }

        return result;
      })
    );

    return invoicesWithDetails;
  },
});

export const getMonthlyInvoiceStats = query({
  args: {
    authUserId: v.string(),
    year: v.optional(v.number()),
  },
  handler: async (ctx, { authUserId, year }) => {
    await requirePermission(ctx, authUserId, INVOICE_CONSTANTS.PERMISSIONS.VIEW_FINANCIAL_DATA);

    const currentYear = year || new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1).getTime();
    const yearEnd = new Date(currentYear + 1, 0, 1).getTime();

    const invoices = await ctx.db.query('yourobcInvoices')
      .filter((q) => q.and(
        q.gte(q.field('issueDate'), yearStart),
        q.lt(q.field('issueDate'), yearEnd)
      ))
      .collect();

    const monthlyStats = Array.from({ length: 12 }, (_, index) => {
      const month = index + 1;
      const monthStart = new Date(currentYear, index, 1).getTime();
      const monthEnd = new Date(currentYear, index + 1, 0, 23, 59, 59).getTime();

      const monthInvoices = invoices.filter(invoice =>
        invoice.issueDate >= monthStart && invoice.issueDate <= monthEnd
      );

      const outgoingRevenue = monthInvoices
        .filter(i => i.type === 'outgoing')
        .reduce((sum, invoice) => {
          const amount = invoice.totalAmount.currency === 'EUR' 
            ? invoice.totalAmount.amount 
            : invoice.totalAmount.amount * 0.85;
          return sum + amount;
        }, 0);

      const incomingExpenses = monthInvoices
        .filter(i => i.type === 'incoming')
        .reduce((sum, invoice) => {
          const amount = invoice.totalAmount.currency === 'EUR' 
            ? invoice.totalAmount.amount 
            : invoice.totalAmount.amount * 0.85;
          return sum + amount;
        }, 0);

      const paidRevenue = monthInvoices
        .filter(i => i.type === 'outgoing' && i.status === 'paid')
        .reduce((sum, invoice) => {
          const amount = invoice.totalAmount.currency === 'EUR' 
            ? invoice.totalAmount.amount 
            : invoice.totalAmount.amount * 0.85;
          return sum + amount;
        }, 0);

      return {
        month,
        monthName: new Date(currentYear, index, 1).toLocaleString('default', { month: 'long' }),
        totalInvoices: monthInvoices.length,
        outgoingInvoices: monthInvoices.filter(i => i.type === 'outgoing').length,
        incomingInvoices: monthInvoices.filter(i => i.type === 'incoming').length,
        outgoingRevenue: Math.round(outgoingRevenue * 100) / 100,
        incomingExpenses: Math.round(incomingExpenses * 100) / 100,
        paidRevenue: Math.round(paidRevenue * 100) / 100,
        netProfit: Math.round((paidRevenue - incomingExpenses) * 100) / 100,
      };
    });

    return {
      year: currentYear,
      monthlyStats,
      yearTotals: {
        totalInvoices: invoices.length,
        totalRevenue: Math.round(monthlyStats.reduce((sum, month) => sum + month.outgoingRevenue, 0) * 100) / 100,
        totalExpenses: Math.round(monthlyStats.reduce((sum, month) => sum + month.incomingExpenses, 0) * 100) / 100,
        totalProfit: Math.round(monthlyStats.reduce((sum, month) => sum + month.netProfit, 0) * 100) / 100,
      },
    };
  },
});