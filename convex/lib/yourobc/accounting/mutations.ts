// convex/lib/yourobc/accounting/mutations.ts
// Write operations for accounting module

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { accountingValidators } from '@/schema/yourobc/accounting/validators';
import { ACCOUNTING_CONSTANTS } from './constants';
import {
  validateAccountingEntryData,
  generateJournalEntryNumber,
  calculateFiscalYear,
  calculateFiscalPeriod,
  normalizeAccountingEntryData,
} from './utils';
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

    const normalizedData = normalizeAccountingEntryData(data);
    const errors = validateAccountingEntryData(normalizedData);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const publicId = await generateUniquePublicId(ctx, 'yourobcAccounting');
    const now = Date.now();

    // Auto-calculate fiscal year and period if not provided
    const fiscalYear =
      normalizedData.fiscalYear || calculateFiscalYear(normalizedData.transactionDate);
    const fiscalPeriod =
      normalizedData.fiscalPeriod || calculateFiscalPeriod(normalizedData.transactionDate);

    // Generate journal entry number if not provided
    const sequence = Math.floor(Math.random() * 1000000);
    const journalEntryNumber =
      normalizedData.journalEntryNumber || generateJournalEntryNumber(fiscalYear, sequence);

    const entryId = await ctx.db.insert('yourobcAccounting', {
      publicId,
      journalEntryNumber,
      referenceNumber: normalizedData.referenceNumber,
      status: normalizedData.status || 'draft',
      transactionType: normalizedData.transactionType!,
      transactionDate: normalizedData.transactionDate!,
      postingDate: normalizedData.postingDate,
      debitAmount: normalizedData.debitAmount!,
      creditAmount: normalizedData.creditAmount!,
      currency: normalizedData.currency!,
      debitAccountId: normalizedData.debitAccountId,
      creditAccountId: normalizedData.creditAccountId,
      accountCode: normalizedData.accountCode,
      relatedInvoiceId: normalizedData.relatedInvoiceId,
      relatedExpenseId: normalizedData.relatedExpenseId,
      relatedShipmentId: normalizedData.relatedShipmentId,
      relatedCustomerId: normalizedData.relatedCustomerId,
      relatedPartnerId: normalizedData.relatedPartnerId,
      memo: normalizedData.memo,
      description: normalizedData.description,
      taxAmount: normalizedData.taxAmount,
      taxRate: normalizedData.taxRate,
      taxCategory: normalizedData.taxCategory,
      isTaxable: normalizedData.isTaxable,
      attachments: normalizedData.attachments,
      tags: normalizedData.tags,
      category: normalizedData.category,
      fiscalYear,
      fiscalPeriod,
      ownerId: user._id,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'accounting_entry.created',
      entityType: 'system_accounting_entry',
      entityId: publicId,
      entityTitle: journalEntryNumber,
      description: `Created accounting entry: ${journalEntryNumber}`,
      metadata: {
        status: normalizedData.status || 'draft',
        transactionType: normalizedData.transactionType,
        amount: normalizedData.debitAmount,
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

    const normalizedUpdates = normalizeAccountingEntryData(updates);
    const errors = validateAccountingEntryData(normalizedUpdates);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const now = Date.now();
    const updateData: any = {
      updatedAt: now,
      updatedBy: user._id,
    };

    if (normalizedUpdates.referenceNumber !== undefined)
      updateData.referenceNumber = normalizedUpdates.referenceNumber;
    if (normalizedUpdates.status !== undefined) {
      updateData.status = normalizedUpdates.status;
      if (normalizedUpdates.status === 'posted' && !entry.postingDate) {
        updateData.postingDate = now;
      }
    }
    if (normalizedUpdates.transactionType !== undefined)
      updateData.transactionType = normalizedUpdates.transactionType;
    if (normalizedUpdates.transactionDate !== undefined)
      updateData.transactionDate = normalizedUpdates.transactionDate;
    if (normalizedUpdates.postingDate !== undefined) updateData.postingDate = normalizedUpdates.postingDate;
    if (normalizedUpdates.debitAmount !== undefined) updateData.debitAmount = normalizedUpdates.debitAmount;
    if (normalizedUpdates.creditAmount !== undefined) updateData.creditAmount = normalizedUpdates.creditAmount;
    if (normalizedUpdates.currency !== undefined) updateData.currency = normalizedUpdates.currency;
    if (normalizedUpdates.debitAccountId !== undefined) updateData.debitAccountId = normalizedUpdates.debitAccountId;
    if (normalizedUpdates.creditAccountId !== undefined) updateData.creditAccountId = normalizedUpdates.creditAccountId;
    if (normalizedUpdates.accountCode !== undefined) updateData.accountCode = normalizedUpdates.accountCode;
    if (normalizedUpdates.memo !== undefined) updateData.memo = normalizedUpdates.memo;
    if (normalizedUpdates.description !== undefined) updateData.description = normalizedUpdates.description;
    if (normalizedUpdates.taxAmount !== undefined) updateData.taxAmount = normalizedUpdates.taxAmount;
    if (normalizedUpdates.taxRate !== undefined) updateData.taxRate = normalizedUpdates.taxRate;
    if (normalizedUpdates.taxCategory !== undefined) updateData.taxCategory = normalizedUpdates.taxCategory;
    if (normalizedUpdates.isTaxable !== undefined) updateData.isTaxable = normalizedUpdates.isTaxable;
    if (normalizedUpdates.reconciliationStatus !== undefined) {
      updateData.reconciliationStatus = normalizedUpdates.reconciliationStatus;
      if (normalizedUpdates.reconciliationStatus === 'reconciled' && !entry.reconciledDate) {
        updateData.reconciledDate = now;
        updateData.reconciledBy = user._id;
      }
    }
    if (normalizedUpdates.approvalStatus !== undefined) {
      updateData.approvalStatus = normalizedUpdates.approvalStatus;
      if (normalizedUpdates.approvalStatus === 'approved') {
        updateData.approvedBy = user._id;
        updateData.approvedDate = now;
      } else if (normalizedUpdates.approvalStatus === 'rejected') {
        updateData.rejectedBy = user._id;
        updateData.rejectedDate = now;
      }
    }
    if (normalizedUpdates.approvalNotes !== undefined) updateData.approvalNotes = normalizedUpdates.approvalNotes;
    if (normalizedUpdates.rejectionReason !== undefined)
      updateData.rejectionReason = normalizedUpdates.rejectionReason;
    if (normalizedUpdates.attachments !== undefined) updateData.attachments = normalizedUpdates.attachments;
    if (normalizedUpdates.tags !== undefined) updateData.tags = normalizedUpdates.tags;
    if (normalizedUpdates.category !== undefined) updateData.category = normalizedUpdates.category;

    await ctx.db.patch(entryId, updateData);

    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'accounting_entry.updated',
      entityType: 'system_accounting_entry',
      entityId: entry.publicId,
      entityTitle: entry.journalEntryNumber,
      description: `Updated accounting entry: ${entry.journalEntryNumber}`,
      metadata: { changes: normalizedUpdates },
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
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
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
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
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
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
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
