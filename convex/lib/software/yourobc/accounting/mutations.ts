// convex/lib/software/yourobc/accounting/mutations.ts
/**
 * Accounting Mutations
 *
 * Mutation functions for creating, updating, and deleting accounting data.
 *
 * @module convex/lib/software/yourobc/accounting/mutations
 */

import { MutationCtx } from '../../../../_generated/server'
import { Id } from '../../../../_generated/dataModel'
import {
  IncomingInvoiceTracking,
  InvoiceNumbering,
  StatementOfAccounts,
  AccountingDashboardCache,
  InvoiceAutoGenLog,
  CreateIncomingInvoiceTrackingInput,
  UpdateIncomingInvoiceTrackingInput,
  CreateInvoiceNumberingInput,
  CreateStatementOfAccountsInput,
  CreateDashboardCacheInput,
  CreateInvoiceAutoGenLogInput,
} from './types'
import {
  assertCanModifyAccounting,
  assertCanApproveInvoices,
  assertCanGenerateStatements,
  assertCanManageInvoiceNumbering,
} from './permissions'
import {
  generatePublicId,
  generateInvoiceNumber,
  calculateCacheExpiry,
  createZeroAmount,
} from './utils'
import {
  PUBLIC_ID_PREFIXES,
  DEFAULT_INCREMENT,
  DEFAULT_INVOICE_FORMAT,
  CACHE_VALIDITY_HOURS,
} from './constants'

// ============================================================================
// Incoming Invoice Tracking Mutations
// ============================================================================

/**
 * Create a new incoming invoice tracking record
 */
export async function createIncomingInvoiceTracking(
  ctx: MutationCtx,
  ownerId: string,
  input: CreateIncomingInvoiceTrackingInput
): Promise<Id<'yourobcIncomingInvoiceTracking'>> {
  await assertCanModifyAccounting(ctx, ownerId)

  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    throw new Error('Not authenticated')
  }

  const userId = identity.subject

  // Generate next sequence number
  const lastRecord = await ctx.db
    .query('yourobcIncomingInvoiceTracking')
    .withIndex('by_ownerId', (q) => q.eq('ownerId', ownerId))
    .order('desc')
    .first()

  const currentYear = new Date().getFullYear()
  const sequence = lastRecord ? parseInt(lastRecord.publicId.split('-')[2]) + 1 : 1

  const publicId = generatePublicId({
    prefix: PUBLIC_ID_PREFIXES.INCOMING_INVOICE_TRACKING,
    year: currentYear,
    sequence,
  })

  const id = await ctx.db.insert('yourobcIncomingInvoiceTracking', {
    publicId,
    ownerId,
    shipmentId: input.shipmentId,
    partnerId: input.partnerId,
    expectedDate: input.expectedDate,
    expectedAmount: input.expectedAmount,
    status: 'expected',
    remindersSent: 0,
    internalNotes: input.internalNotes,
    tags: [],
    createdBy: userId,
    createdAt: Date.now(),
  })

  return id
}

/**
 * Update an incoming invoice tracking record
 */
export async function updateIncomingInvoiceTracking(
  ctx: MutationCtx,
  input: UpdateIncomingInvoiceTrackingInput
): Promise<void> {
  const record = await ctx.db.get(input.id)
  if (!record || record.deletedAt) {
    throw new Error('Incoming invoice tracking record not found')
  }

  await assertCanModifyAccounting(ctx, record.ownerId)

  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    throw new Error('Not authenticated')
  }

  const userId = identity.subject

  const updates: Partial<IncomingInvoiceTracking> = {
    updatedBy: userId,
    updatedAt: Date.now(),
  }

  if (input.status !== undefined) updates.status = input.status
  if (input.invoiceId !== undefined) updates.invoiceId = input.invoiceId
  if (input.receivedDate !== undefined) updates.receivedDate = input.receivedDate
  if (input.actualAmount !== undefined) updates.actualAmount = input.actualAmount
  if (input.approvedBy !== undefined) updates.approvedBy = input.approvedBy
  if (input.approvedDate !== undefined) updates.approvedDate = input.approvedDate
  if (input.approvalNotes !== undefined) updates.approvalNotes = input.approvalNotes
  if (input.paidDate !== undefined) updates.paidDate = input.paidDate
  if (input.paymentReference !== undefined) updates.paymentReference = input.paymentReference
  if (input.disputeReason !== undefined) updates.disputeReason = input.disputeReason
  if (input.disputeDate !== undefined) updates.disputeDate = input.disputeDate
  if (input.disputeResolvedDate !== undefined) updates.disputeResolvedDate = input.disputeResolvedDate
  if (input.internalNotes !== undefined) updates.internalNotes = input.internalNotes

  await ctx.db.patch(input.id, updates)
}

/**
 * Approve an incoming invoice
 */
export async function approveIncomingInvoice(
  ctx: MutationCtx,
  id: Id<'yourobcIncomingInvoiceTracking'>,
  approvalNotes?: string
): Promise<void> {
  const record = await ctx.db.get(id)
  if (!record || record.deletedAt) {
    throw new Error('Incoming invoice tracking record not found')
  }

  await assertCanApproveInvoices(ctx, record.ownerId)

  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    throw new Error('Not authenticated')
  }

  const userId = identity.subject

  await ctx.db.patch(id, {
    status: 'approved',
    approvedBy: userId,
    approvedDate: Date.now(),
    approvalNotes,
    updatedBy: userId,
    updatedAt: Date.now(),
  })
}

/**
 * Send reminder for missing invoice
 */
export async function sendInvoiceReminder(
  ctx: MutationCtx,
  id: Id<'yourobcIncomingInvoiceTracking'>
): Promise<void> {
  const record = await ctx.db.get(id)
  if (!record || record.deletedAt) {
    throw new Error('Incoming invoice tracking record not found')
  }

  await assertCanModifyAccounting(ctx, record.ownerId)

  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    throw new Error('Not authenticated')
  }

  const userId = identity.subject

  await ctx.db.patch(id, {
    remindersSent: record.remindersSent + 1,
    lastReminderDate: Date.now(),
    updatedBy: userId,
    updatedAt: Date.now(),
  })
}

/**
 * Soft delete an incoming invoice tracking record
 */
export async function deleteIncomingInvoiceTracking(
  ctx: MutationCtx,
  id: Id<'yourobcIncomingInvoiceTracking'>
): Promise<void> {
  const record = await ctx.db.get(id)
  if (!record || record.deletedAt) {
    throw new Error('Incoming invoice tracking record not found')
  }

  await assertCanModifyAccounting(ctx, record.ownerId)

  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    throw new Error('Not authenticated')
  }

  const userId = identity.subject

  await ctx.db.patch(id, {
    deletedAt: Date.now(),
    deletedBy: userId,
  })
}

// ============================================================================
// Invoice Numbering Mutations
// ============================================================================

/**
 * Create or initialize invoice numbering for a month
 */
export async function initializeInvoiceNumbering(
  ctx: MutationCtx,
  ownerId: string,
  input: CreateInvoiceNumberingInput
): Promise<Id<'yourobcInvoiceNumbering'>> {
  await assertCanManageInvoiceNumbering(ctx, ownerId)

  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    throw new Error('Not authenticated')
  }

  const userId = identity.subject

  // Check if already exists
  const existing = await ctx.db
    .query('yourobcInvoiceNumbering')
    .withIndex('by_ownerId_year_month', (q) =>
      q.eq('ownerId', ownerId).eq('year', input.year).eq('month', input.month)
    )
    .filter((q) => q.eq(q.field('deletedAt'), undefined))
    .first()

  if (existing) {
    throw new Error('Invoice numbering already exists for this month')
  }

  const publicId = generatePublicId({
    prefix: PUBLIC_ID_PREFIXES.INVOICE_NUMBERING,
    year: input.year,
    sequence: input.month,
  })

  const id = await ctx.db.insert('yourobcInvoiceNumbering', {
    publicId,
    ownerId,
    year: input.year,
    month: input.month,
    lastNumber: 0,
    format: input.format || DEFAULT_INVOICE_FORMAT,
    incrementBy: input.incrementBy || DEFAULT_INCREMENT,
    createdBy: userId,
    createdAt: Date.now(),
  })

  return id
}

/**
 * Get next invoice number and increment sequence
 */
export async function getNextInvoiceNumber(
  ctx: MutationCtx,
  ownerId: string,
  year?: number,
  month?: number
): Promise<string> {
  await assertCanModifyAccounting(ctx, ownerId)

  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    throw new Error('Not authenticated')
  }

  const userId = identity.subject

  // Use current month if not specified
  const now = new Date()
  const targetYear = year || now.getFullYear()
  const targetMonth = month || (now.getMonth() + 1)

  // Get or create numbering record for this month
  let numberingRecord = await ctx.db
    .query('yourobcInvoiceNumbering')
    .withIndex('by_ownerId_year_month', (q) =>
      q.eq('ownerId', ownerId).eq('year', targetYear).eq('month', targetMonth)
    )
    .filter((q) => q.eq(q.field('deletedAt'), undefined))
    .first()

  if (!numberingRecord) {
    // Initialize numbering for this month
    const id = await initializeInvoiceNumbering(ctx, ownerId, {
      year: targetYear,
      month: targetMonth,
      format: DEFAULT_INVOICE_FORMAT,
      incrementBy: DEFAULT_INCREMENT,
    })
    numberingRecord = await ctx.db.get(id)
    if (!numberingRecord) {
      throw new Error('Failed to initialize invoice numbering')
    }
  }

  // Calculate next number
  const nextNumber = numberingRecord.lastNumber + numberingRecord.incrementBy

  // Generate invoice number
  const result = generateInvoiceNumber(
    targetYear,
    targetMonth,
    nextNumber,
    numberingRecord.format
  )

  // Update last number
  await ctx.db.patch(numberingRecord._id, {
    lastNumber: nextNumber,
    updatedBy: userId,
    updatedAt: Date.now(),
  })

  return result.invoiceNumber
}

// ============================================================================
// Statement of Accounts Mutations
// ============================================================================

/**
 * Create a new statement of accounts
 */
export async function createStatementOfAccounts(
  ctx: MutationCtx,
  ownerId: string,
  input: CreateStatementOfAccountsInput
): Promise<Id<'yourobcStatementOfAccounts'>> {
  await assertCanGenerateStatements(ctx, ownerId)

  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    throw new Error('Not authenticated')
  }

  const userId = identity.subject

  // Generate next sequence number
  const lastRecord = await ctx.db
    .query('yourobcStatementOfAccounts')
    .withIndex('by_ownerId', (q) => q.eq('ownerId', ownerId))
    .order('desc')
    .first()

  const currentYear = new Date().getFullYear()
  const sequence = lastRecord ? parseInt(lastRecord.publicId.split('-')[2]) + 1 : 1

  const publicId = generatePublicId({
    prefix: PUBLIC_ID_PREFIXES.STATEMENT_OF_ACCOUNTS,
    year: currentYear,
    sequence,
  })

  // TODO: Calculate actual balances, transactions, and outstanding invoices
  // This is a placeholder - you would query invoices and payments to build this

  const zeroAmount = createZeroAmount()

  const id = await ctx.db.insert('yourobcStatementOfAccounts', {
    publicId,
    ownerId,
    customerId: input.customerId,
    startDate: input.startDate,
    endDate: input.endDate,
    generatedDate: Date.now(),
    openingBalance: zeroAmount,
    totalInvoiced: zeroAmount,
    totalPaid: zeroAmount,
    closingBalance: zeroAmount,
    transactions: [],
    outstandingInvoices: [],
    createdBy: userId,
    createdAt: Date.now(),
  })

  return id
}

/**
 * Export statement of accounts
 */
export async function exportStatementOfAccounts(
  ctx: MutationCtx,
  id: Id<'yourobcStatementOfAccounts'>,
  format: 'pdf' | 'excel'
): Promise<void> {
  const record = await ctx.db.get(id)
  if (!record || record.deletedAt) {
    throw new Error('Statement of accounts not found')
  }

  await assertCanGenerateStatements(ctx, record.ownerId)

  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    throw new Error('Not authenticated')
  }

  const userId = identity.subject

  await ctx.db.patch(id, {
    exportedAt: Date.now(),
    exportedBy: userId,
    exportFormat: format,
    updatedBy: userId,
    updatedAt: Date.now(),
  })
}

/**
 * Soft delete a statement of accounts
 */
export async function deleteStatementOfAccounts(
  ctx: MutationCtx,
  id: Id<'yourobcStatementOfAccounts'>
): Promise<void> {
  const record = await ctx.db.get(id)
  if (!record || record.deletedAt) {
    throw new Error('Statement of accounts not found')
  }

  await assertCanModifyAccounting(ctx, record.ownerId)

  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    throw new Error('Not authenticated')
  }

  const userId = identity.subject

  await ctx.db.patch(id, {
    deletedAt: Date.now(),
    deletedBy: userId,
  })
}

// ============================================================================
// Accounting Dashboard Cache Mutations
// ============================================================================

/**
 * Create or update accounting dashboard cache
 */
export async function upsertAccountingDashboardCache(
  ctx: MutationCtx,
  ownerId: string,
  input: CreateDashboardCacheInput,
  metrics: any // TODO: Type this properly with calculated metrics
): Promise<Id<'yourobcAccountingDashboardCache'>> {
  await assertCanModifyAccounting(ctx, ownerId)

  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    throw new Error('Not authenticated')
  }

  const userId = identity.subject

  // Check if cache already exists for this date
  const existing = await ctx.db
    .query('yourobcAccountingDashboardCache')
    .withIndex('by_ownerId_date', (q) => q.eq('ownerId', ownerId).eq('date', input.date))
    .filter((q) => q.eq(q.field('deletedAt'), undefined))
    .first()

  const zeroAmount = createZeroAmount()
  const validUntil = calculateCacheExpiry(CACHE_VALIDITY_HOURS)

  const cacheData = {
    ownerId,
    date: input.date,
    // TODO: Use actual metrics passed in
    totalReceivables: zeroAmount,
    currentReceivables: zeroAmount,
    overdueReceivables: zeroAmount,
    overdueBreakdown: {
      overdue1to30: zeroAmount,
      overdue31to60: zeroAmount,
      overdue61to90: zeroAmount,
      overdue90plus: zeroAmount,
    },
    totalPayables: zeroAmount,
    currentPayables: zeroAmount,
    overduePayables: zeroAmount,
    expectedIncoming: [],
    expectedOutgoing: [],
    dunningLevel1Count: 0,
    dunningLevel2Count: 0,
    dunningLevel3Count: 0,
    suspendedCustomersCount: 0,
    missingInvoicesCount: 0,
    missingInvoicesValue: zeroAmount,
    pendingApprovalCount: 0,
    pendingApprovalValue: zeroAmount,
    calculatedAt: Date.now(),
    validUntil,
    updatedBy: userId,
    updatedAt: Date.now(),
  }

  if (existing) {
    await ctx.db.patch(existing._id, cacheData)
    return existing._id
  } else {
    const publicId = generatePublicId({
      prefix: PUBLIC_ID_PREFIXES.ACCOUNTING_DASHBOARD_CACHE,
      year: new Date(input.date).getFullYear(),
      sequence: Math.floor(input.date / 86400000), // Use day number as sequence
    })

    const id = await ctx.db.insert('yourobcAccountingDashboardCache', {
      publicId,
      ...cacheData,
      createdBy: userId,
      createdAt: Date.now(),
    })

    return id
  }
}

// ============================================================================
// Invoice Auto-Gen Log Mutations
// ============================================================================

/**
 * Create an invoice auto-gen log entry
 */
export async function createInvoiceAutoGenLog(
  ctx: MutationCtx,
  ownerId: string,
  input: CreateInvoiceAutoGenLogInput
): Promise<Id<'yourobcInvoiceAutoGenLog'>> {
  await assertCanModifyAccounting(ctx, ownerId)

  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    throw new Error('Not authenticated')
  }

  const userId = identity.subject

  // Generate next sequence number
  const lastRecord = await ctx.db
    .query('yourobcInvoiceAutoGenLog')
    .withIndex('by_ownerId', (q) => q.eq('ownerId', ownerId))
    .order('desc')
    .first()

  const currentYear = new Date().getFullYear()
  const sequence = lastRecord ? parseInt(lastRecord.publicId.split('-')[2]) + 1 : 1

  const publicId = generatePublicId({
    prefix: PUBLIC_ID_PREFIXES.INVOICE_AUTO_GEN_LOG,
    year: currentYear,
    sequence,
  })

  const id = await ctx.db.insert('yourobcInvoiceAutoGenLog', {
    publicId,
    ownerId,
    shipmentId: input.shipmentId,
    invoiceId: input.invoiceId,
    generatedDate: Date.now(),
    podReceivedDate: input.podReceivedDate,
    invoiceNumber: input.invoiceNumber,
    notificationSent: false,
    notificationRecipients: input.notificationRecipients,
    status: 'generated',
    createdBy: userId,
    createdAt: Date.now(),
  })

  return id
}

/**
 * Mark notification as sent for invoice auto-gen log
 */
export async function markNotificationSent(
  ctx: MutationCtx,
  id: Id<'yourobcInvoiceAutoGenLog'>,
  success: boolean
): Promise<void> {
  const record = await ctx.db.get(id)
  if (!record || record.deletedAt) {
    throw new Error('Invoice auto-gen log not found')
  }

  await assertCanModifyAccounting(ctx, record.ownerId)

  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    throw new Error('Not authenticated')
  }

  const userId = identity.subject

  await ctx.db.patch(id, {
    notificationSent: success,
    notificationSentDate: success ? Date.now() : undefined,
    status: success ? 'notification_sent' : 'notification_failed',
    updatedBy: userId,
    updatedAt: Date.now(),
  })
}

/**
 * Soft delete an invoice auto-gen log
 */
export async function deleteInvoiceAutoGenLog(
  ctx: MutationCtx,
  id: Id<'yourobcInvoiceAutoGenLog'>
): Promise<void> {
  const record = await ctx.db.get(id)
  if (!record || record.deletedAt) {
    throw new Error('Invoice auto-gen log not found')
  }

  await assertCanModifyAccounting(ctx, record.ownerId)

  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    throw new Error('Not authenticated')
  }

  const userId = identity.subject

  await ctx.db.patch(id, {
    deletedAt: Date.now(),
    deletedBy: userId,
  })
}
