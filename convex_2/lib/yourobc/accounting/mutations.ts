// convex/lib/yourobc/accounting/mutations.ts
// Write operations for accounting module

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { accountingValidators } from '@/schema/yourobc/accounting/validators';
import { ACCOUNTING_CONSTANTS } from './constants';
import { validateAccountingEntryData, generateJournalEntryNumber, calculateFiscalYear, calculateFiscalPeriod } from './utils';
import { requireEditAccountingEntryAccess, requireDeleteAccountingEntryAccess, requireApproveAccountingEntryAccess } from './permissions';
import type { AccountingEntryId } from './types';

/**
 * Create new accounting entry
 */
export const createAccountingEntry = mutation({
  args: {
    data: v.object({
      journalEntryNumber: v.optional(v.string()),
      referenceNumber: v.optional(v.string()),
      status: v.optional(accountingValidators.status),
      transactionType: accountingValidators.transactionType,
      transactionDate: v.number(),
      postingDate: v.optional(v.number()),
      debitAmount: v.number(),
      creditAmount: v.number(),
      currency: v.string(),
      debitAccountId: v.optional(v.string()),
      creditAccountId: v.optional(v.string()),
      accountCode: v.optional(v.string()),
      relatedInvoiceId: v.optional(v.id('yourobcInvoices')),
      relatedExpenseId: v.optional(v.string()),
      relatedShipmentId: v.optional(v.id('yourobcShipments')),
      relatedCustomerId: v.optional(v.id('yourobcCustomers')),
      relatedPartnerId: v.optional(v.id('yourobcPartners')),
      memo: v.optional(v.string()),
      description: v.optional(v.string()),
      taxAmount: v.optional(v.number()),
      taxRate: v.optional(v.number()),
      taxCategory: v.optional(v.string()),
      isTaxable: v.optional(v.boolean()),
      attachments: v.optional(v.array(v.object({
        id: v.string(),
        name: v.string(),
        url: v.string(),
        type: v.string(),
      }))),
      tags: v.optional(v.array(v.string())),
      category: v.optional(v.string()),
      fiscalYear: v.optional(v.number()),
      fiscalPeriod: v.optional(v.number()),
    }),
  },
  handler: async (ctx, { data }): Promise<AccountingEntryId> => {
    const user = await requireCurrentUser(ctx);

    await requirePermission(ctx, ACCOUNTING_CONSTANTS.PERMISSIONS.CREATE, {
      allowAdmin: true,
    });

    const errors = validateAccountingEntryData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const publicId = await generateUniquePublicId(ctx, 'yourobcAccounting');
    const now = Date.now();

    // Auto-calculate fiscal year and period if not provided
    const fiscalYear = data.fiscalYear || calculateFiscalYear(data.transactionDate);
    const fiscalPeriod = data.fiscalPeriod || calculateFiscalPeriod(data.transactionDate);

    // Generate journal entry number if not provided
    const sequence = Math.floor(Math.random() * 1000000);
    const journalEntryNumber = data.journalEntryNumber?.trim() || generateJournalEntryNumber(fiscalYear, sequence);

    const entryId = await ctx.db.insert('yourobcAccounting', {
      publicId,
      journalEntryNumber,
      referenceNumber: data.referenceNumber?.trim(),
      status: data.status || 'draft',
      transactionType: data.transactionType,
      transactionDate: data.transactionDate,
      postingDate: data.postingDate,
      debitAmount: data.debitAmount,
      creditAmount: data.creditAmount,
      currency: data.currency.toUpperCase(),
      debitAccountId: data.debitAccountId?.trim(),
      creditAccountId: data.creditAccountId?.trim(),
      accountCode: data.accountCode?.trim(),
      relatedInvoiceId: data.relatedInvoiceId,
      relatedExpenseId: data.relatedExpenseId?.trim(),
      relatedShipmentId: data.relatedShipmentId,
      relatedCustomerId: data.relatedCustomerId,
      relatedPartnerId: data.relatedPartnerId,
      memo: data.memo?.trim(),
      description: data.description?.trim(),
      taxAmount: data.taxAmount,
      taxRate: data.taxRate,
      taxCategory: data.taxCategory?.trim(),
      isTaxable: data.isTaxable,
      attachments: data.attachments,
      tags: data.tags?.map(tag => tag.trim()),
      category: data.category?.trim(),
      fiscalYear,
      fiscalPeriod,
      ownerId: user._id,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'accounting_entry.created',
      entityType: 'system_accounting_entry',
      entityId: publicId,
      entityTitle: journalEntryNumber,
      description: `Created accounting entry: ${journalEntryNumber}`,
      metadata: {
        status: data.status || 'draft',
        transactionType: data.transactionType,
        amount: data.debitAmount,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return entryId;
  },
});

/**
 * Update existing accounting entry
 */
export const updateAccountingEntry = mutation({
  args: {
    entryId: v.id('yourobcAccounting'),
    updates: v.object({
      referenceNumber: v.optional(v.string()),
      status: v.optional(accountingValidators.status),
      transactionType: v.optional(accountingValidators.transactionType),
      transactionDate: v.optional(v.number()),
      postingDate: v.optional(v.number()),
      debitAmount: v.optional(v.number()),
      creditAmount: v.optional(v.number()),
      currency: v.optional(v.string()),
      debitAccountId: v.optional(v.string()),
      creditAccountId: v.optional(v.string()),
      accountCode: v.optional(v.string()),
      memo: v.optional(v.string()),
      description: v.optional(v.string()),
      taxAmount: v.optional(v.number()),
      taxRate: v.optional(v.number()),
      taxCategory: v.optional(v.string()),
      isTaxable: v.optional(v.boolean()),
      reconciliationStatus: v.optional(accountingValidators.reconciliationStatus),
      approvalStatus: v.optional(accountingValidators.approvalStatus),
      approvalNotes: v.optional(v.string()),
      rejectionReason: v.optional(v.string()),
      attachments: v.optional(v.array(v.object({
        id: v.string(),
        name: v.string(),
        url: v.string(),
        type: v.string(),
      }))),
      tags: v.optional(v.array(v.string())),
      category: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { entryId, updates }): Promise<AccountingEntryId> => {
    const user = await requireCurrentUser(ctx);

    const entry = await ctx.db.get(entryId);
    if (!entry || entry.deletedAt) {
      throw new Error('Accounting entry not found');
    }

    await requireEditAccountingEntryAccess(ctx, entry, user);

    const errors = validateAccountingEntryData(updates);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const now = Date.now();
    const updateData: any = {
      updatedAt: now,
      updatedBy: user._id,
    };

    if (updates.referenceNumber !== undefined) updateData.referenceNumber = updates.referenceNumber?.trim();
    if (updates.status !== undefined) {
      updateData.status = updates.status;
      if (updates.status === 'posted' && !entry.postingDate) {
        updateData.postingDate = now;
      }
    }
    if (updates.transactionType !== undefined) updateData.transactionType = updates.transactionType;
    if (updates.transactionDate !== undefined) updateData.transactionDate = updates.transactionDate;
    if (updates.postingDate !== undefined) updateData.postingDate = updates.postingDate;
    if (updates.debitAmount !== undefined) updateData.debitAmount = updates.debitAmount;
    if (updates.creditAmount !== undefined) updateData.creditAmount = updates.creditAmount;
    if (updates.currency !== undefined) updateData.currency = updates.currency.toUpperCase();
    if (updates.debitAccountId !== undefined) updateData.debitAccountId = updates.debitAccountId?.trim();
    if (updates.creditAccountId !== undefined) updateData.creditAccountId = updates.creditAccountId?.trim();
    if (updates.accountCode !== undefined) updateData.accountCode = updates.accountCode?.trim();
    if (updates.memo !== undefined) updateData.memo = updates.memo?.trim();
    if (updates.description !== undefined) updateData.description = updates.description?.trim();
    if (updates.taxAmount !== undefined) updateData.taxAmount = updates.taxAmount;
    if (updates.taxRate !== undefined) updateData.taxRate = updates.taxRate;
    if (updates.taxCategory !== undefined) updateData.taxCategory = updates.taxCategory?.trim();
    if (updates.isTaxable !== undefined) updateData.isTaxable = updates.isTaxable;
    if (updates.reconciliationStatus !== undefined) {
      updateData.reconciliationStatus = updates.reconciliationStatus;
      if (updates.reconciliationStatus === 'reconciled' && !entry.reconciledDate) {
        updateData.reconciledDate = now;
        updateData.reconciledBy = user._id;
      }
    }
    if (updates.approvalStatus !== undefined) {
      updateData.approvalStatus = updates.approvalStatus;
      if (updates.approvalStatus === 'approved') {
        updateData.approvedBy = user._id;
        updateData.approvedDate = now;
      } else if (updates.approvalStatus === 'rejected') {
        updateData.rejectedBy = user._id;
        updateData.rejectedDate = now;
      }
    }
    if (updates.approvalNotes !== undefined) updateData.approvalNotes = updates.approvalNotes?.trim();
    if (updates.rejectionReason !== undefined) updateData.rejectionReason = updates.rejectionReason?.trim();
    if (updates.attachments !== undefined) updateData.attachments = updates.attachments;
    if (updates.tags !== undefined) updateData.tags = updates.tags.map(tag => tag.trim());
    if (updates.category !== undefined) updateData.category = updates.category?.trim();

    await ctx.db.patch(entryId, updateData);

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'accounting_entry.updated',
      entityType: 'system_accounting_entry',
      entityId: entry.publicId,
      entityTitle: entry.journalEntryNumber,
      description: `Updated accounting entry: ${entry.journalEntryNumber}`,
      metadata: { changes: updates },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return entryId;
  },
});

/**
 * Delete accounting entry (soft delete)
 */
export const deleteAccountingEntry = mutation({
  args: {
    entryId: v.id('yourobcAccounting'),
  },
  handler: async (ctx, { entryId }): Promise<AccountingEntryId> => {
    const user = await requireCurrentUser(ctx);

    const entry = await ctx.db.get(entryId);
    if (!entry || entry.deletedAt) {
      throw new Error('Accounting entry not found');
    }

    await requireDeleteAccountingEntryAccess(entry, user);

    const now = Date.now();
    await ctx.db.patch(entryId, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'accounting_entry.deleted',
      entityType: 'system_accounting_entry',
      entityId: entry.publicId,
      entityTitle: entry.journalEntryNumber,
      description: `Deleted accounting entry: ${entry.journalEntryNumber}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return entryId;
  },
});

/**
 * Restore soft-deleted accounting entry
 */
export const restoreAccountingEntry = mutation({
  args: {
    entryId: v.id('yourobcAccounting'),
  },
  handler: async (ctx, { entryId }): Promise<AccountingEntryId> => {
    const user = await requireCurrentUser(ctx);

    const entry = await ctx.db.get(entryId);
    if (!entry) {
      throw new Error('Accounting entry not found');
    }
    if (!entry.deletedAt) {
      throw new Error('Accounting entry is not deleted');
    }

    if (
      entry.ownerId !== user._id &&
      user.role !== 'admin' &&
      user.role !== 'superadmin'
    ) {
      throw new Error('You do not have permission to restore this accounting entry');
    }

    const now = Date.now();
    await ctx.db.patch(entryId, {
      deletedAt: undefined,
      deletedBy: undefined,
      updatedAt: now,
      updatedBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'accounting_entry.restored',
      entityType: 'system_accounting_entry',
      entityId: entry.publicId,
      entityTitle: entry.journalEntryNumber,
      description: `Restored accounting entry: ${entry.journalEntryNumber}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return entryId;
  },
});

/**
 * Approve accounting entry
 */
export const approveAccountingEntry = mutation({
  args: {
    entryId: v.id('yourobcAccounting'),
    approvalNotes: v.optional(v.string()),
  },
  handler: async (ctx, { entryId, approvalNotes }): Promise<AccountingEntryId> => {
    const user = await requireCurrentUser(ctx);

    const entry = await ctx.db.get(entryId);
    if (!entry || entry.deletedAt) {
      throw new Error('Accounting entry not found');
    }

    await requireApproveAccountingEntryAccess(entry, user);

    const now = Date.now();
    await ctx.db.patch(entryId, {
      status: 'approved',
      approvalStatus: 'approved',
      approvedBy: user._id,
      approvedDate: now,
      approvalNotes: approvalNotes?.trim(),
      updatedAt: now,
      updatedBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'accounting_entry.approved',
      entityType: 'system_accounting_entry',
      entityId: entry.publicId,
      entityTitle: entry.journalEntryNumber,
      description: `Approved accounting entry: ${entry.journalEntryNumber}`,
      metadata: { approvalNotes },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return entryId;
  },
});
