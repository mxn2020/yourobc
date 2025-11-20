// convex/lib/software/yourobc/accounting/queries.ts
// Read operations for accounting module

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/lib/auth.helper';
import { accountingValidators } from '@/schema/software/yourobc/accounting/validators';
import { filterAccountingEntriesByAccess, requireViewAccountingEntryAccess } from './permissions';
import type { AccountingEntryListResponse } from './types';

/**
 * Get paginated list of accounting entries with filtering
 */
export const getAccountingEntries = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    filters: v.optional(v.object({
      status: v.optional(v.array(accountingValidators.status)),
      transactionType: v.optional(v.array(accountingValidators.transactionType)),
      reconciliationStatus: v.optional(v.array(accountingValidators.reconciliationStatus)),
      approvalStatus: v.optional(v.array(accountingValidators.approvalStatus)),
      search: v.optional(v.string()),
      relatedInvoiceId: v.optional(v.id('yourobcInvoices')),
      relatedShipmentId: v.optional(v.id('yourobcShipments')),
      relatedCustomerId: v.optional(v.id('yourobcCustomers')),
      fiscalYear: v.optional(v.number()),
      fiscalPeriod: v.optional(v.number()),
      dateFrom: v.optional(v.number()),
      dateTo: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args): Promise<AccountingEntryListResponse> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, offset = 0, filters = {} } = args;

    // Query with index
    let entries = await ctx.db
      .query('softwareYourObcAccounting')
      .withIndex('by_owner', q => q.eq('ownerId', user._id))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Apply access filtering
    entries = await filterAccountingEntriesByAccess(ctx, entries, user);

    // Apply status filter
    if (filters.status?.length) {
      entries = entries.filter(item =>
        filters.status!.includes(item.status)
      );
    }

    // Apply transaction type filter
    if (filters.transactionType?.length) {
      entries = entries.filter(item =>
        filters.transactionType!.includes(item.transactionType)
      );
    }

    // Apply reconciliation status filter
    if (filters.reconciliationStatus?.length) {
      entries = entries.filter(item =>
        item.reconciliationStatus && filters.reconciliationStatus!.includes(item.reconciliationStatus)
      );
    }

    // Apply approval status filter
    if (filters.approvalStatus?.length) {
      entries = entries.filter(item =>
        item.approvalStatus && filters.approvalStatus!.includes(item.approvalStatus)
      );
    }

    // Apply related entity filters
    if (filters.relatedInvoiceId) {
      entries = entries.filter(item => item.relatedInvoiceId === filters.relatedInvoiceId);
    }

    if (filters.relatedShipmentId) {
      entries = entries.filter(item => item.relatedShipmentId === filters.relatedShipmentId);
    }

    if (filters.relatedCustomerId) {
      entries = entries.filter(item => item.relatedCustomerId === filters.relatedCustomerId);
    }

    // Apply fiscal period filters
    if (filters.fiscalYear) {
      entries = entries.filter(item => item.fiscalYear === filters.fiscalYear);
    }

    if (filters.fiscalPeriod) {
      entries = entries.filter(item => item.fiscalPeriod === filters.fiscalPeriod);
    }

    // Apply date range filter
    if (filters.dateFrom) {
      entries = entries.filter(item => item.transactionDate >= filters.dateFrom!);
    }

    if (filters.dateTo) {
      entries = entries.filter(item => item.transactionDate <= filters.dateTo!);
    }

    // Apply search filter
    if (filters.search) {
      const term = filters.search.toLowerCase();
      entries = entries.filter(item =>
        item.journalEntryNumber.toLowerCase().includes(term) ||
        (item.referenceNumber && item.referenceNumber.toLowerCase().includes(term)) ||
        (item.memo && item.memo.toLowerCase().includes(term)) ||
        (item.description && item.description.toLowerCase().includes(term))
      );
    }

    // Paginate
    const total = entries.length;
    const items = entries.slice(offset, offset + limit);

    return {
      items,
      total,
      hasMore: total > offset + limit,
    };
  },
});

/**
 * Get single accounting entry by ID
 */
export const getAccountingEntry = query({
  args: {
    entryId: v.id('softwareYourObcAccounting'),
  },
  handler: async (ctx, { entryId }) => {
    const user = await requireCurrentUser(ctx);

    const entry = await ctx.db.get(entryId);
    if (!entry || entry.deletedAt) {
      throw new Error('Accounting entry not found');
    }

    await requireViewAccountingEntryAccess(ctx, entry, user);

    return entry;
  },
});

/**
 * Get accounting entry by public ID
 */
export const getAccountingEntryByPublicId = query({
  args: {
    publicId: v.string(),
  },
  handler: async (ctx, { publicId }) => {
    const user = await requireCurrentUser(ctx);

    const entry = await ctx.db
      .query('softwareYourObcAccounting')
      .withIndex('by_public_id', q => q.eq('publicId', publicId))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (!entry) {
      throw new Error('Accounting entry not found');
    }

    await requireViewAccountingEntryAccess(ctx, entry, user);

    return entry;
  },
});

/**
 * Get accounting entry by journal entry number
 */
export const getAccountingEntryByJournalEntryNumber = query({
  args: {
    journalEntryNumber: v.string(),
  },
  handler: async (ctx, { journalEntryNumber }) => {
    const user = await requireCurrentUser(ctx);

    const entry = await ctx.db
      .query('softwareYourObcAccounting')
      .withIndex('by_journal_entry_number', q => q.eq('journalEntryNumber', journalEntryNumber))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (!entry) {
      throw new Error('Accounting entry not found');
    }

    await requireViewAccountingEntryAccess(ctx, entry, user);

    return entry;
  },
});

/**
 * Get accounting statistics
 */
export const getAccountingStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);

    const entries = await ctx.db
      .query('softwareYourObcAccounting')
      .withIndex('by_owner', q => q.eq('ownerId', user._id))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
      .collect();

    const accessible = await filterAccountingEntriesByAccess(ctx, entries, user);

    // Calculate totals
    const totals = accessible.reduce((acc, entry) => {
      acc.totalDebit += entry.debitAmount;
      acc.totalCredit += entry.creditAmount;
      acc.totalTax += entry.taxAmount || 0;
      return acc;
    }, { totalDebit: 0, totalCredit: 0, totalTax: 0 });

    return {
      total: accessible.length,
      byStatus: {
        draft: accessible.filter(item => item.status === 'draft').length,
        pending: accessible.filter(item => item.status === 'pending').length,
        approved: accessible.filter(item => item.status === 'approved').length,
        posted: accessible.filter(item => item.status === 'posted').length,
        reconciled: accessible.filter(item => item.status === 'reconciled').length,
        cancelled: accessible.filter(item => item.status === 'cancelled').length,
        archived: accessible.filter(item => item.status === 'archived').length,
      },
      byTransactionType: {
        journal_entry: accessible.filter(item => item.transactionType === 'journal_entry').length,
        invoice: accessible.filter(item => item.transactionType === 'invoice').length,
        expense: accessible.filter(item => item.transactionType === 'expense').length,
        payment: accessible.filter(item => item.transactionType === 'payment').length,
        transfer: accessible.filter(item => item.transactionType === 'transfer').length,
        adjustment: accessible.filter(item => item.transactionType === 'adjustment').length,
      },
      totals,
      unreconciled: accessible.filter(item =>
        !item.reconciliationStatus || item.reconciliationStatus === 'unreconciled'
      ).length,
      pendingApproval: accessible.filter(item =>
        item.approvalStatus === 'pending'
      ).length,
    };
  },
});
