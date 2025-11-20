// convex/lib/software/yourobc/accounting/queries.ts
/**
 * Accounting Queries
 *
 * Query functions for retrieving accounting data.
 *
 * @module convex/lib/software/yourobc/accounting/queries
 */

import { QueryCtx } from '../../../../_generated/server'
import { Id } from '../../../../_generated/dataModel'
import {
  IncomingInvoiceTracking,
  InvoiceNumbering,
  StatementOfAccounts,
  AccountingDashboardCache,
  InvoiceAutoGenLog,
} from './types'
import { assertCanViewAccounting } from './permissions'
import { isCacheValid } from './utils'

/**
 * Get incoming invoice tracking by ID
 */
export async function getIncomingInvoiceTracking(
  ctx: QueryCtx,
  id: Id<'yourobcIncomingInvoiceTracking'>
): Promise<IncomingInvoiceTracking | null> {
  const record = await ctx.db.get(id)
  if (!record || record.deletedAt) {
    return null
  }

  await assertCanViewAccounting(ctx, record.ownerId)
  return record
}

/**
 * Get incoming invoice tracking by public ID
 */
export async function getIncomingInvoiceTrackingByPublicId(
  ctx: QueryCtx,
  publicId: string,
  ownerId: string
): Promise<IncomingInvoiceTracking | null> {
  await assertCanViewAccounting(ctx, ownerId)

  const record = await ctx.db
    .query('yourobcIncomingInvoiceTracking')
    .withIndex('by_publicId', (q) => q.eq('publicId', publicId))
    .filter((q) => q.eq(q.field('ownerId'), ownerId))
    .filter((q) => q.eq(q.field('deletedAt'), undefined))
    .first()

  return record
}

/**
 * List incoming invoice tracking by status
 */
export async function listIncomingInvoiceTrackingByStatus(
  ctx: QueryCtx,
  ownerId: string,
  status: string
): Promise<IncomingInvoiceTracking[]> {
  await assertCanViewAccounting(ctx, ownerId)

  const records = await ctx.db
    .query('yourobcIncomingInvoiceTracking')
    .withIndex('by_ownerId_status', (q) => q.eq('ownerId', ownerId).eq('status', status))
    .filter((q) => q.eq(q.field('deletedAt'), undefined))
    .collect()

  return records
}

/**
 * List incoming invoice tracking by shipment
 */
export async function listIncomingInvoiceTrackingByShipment(
  ctx: QueryCtx,
  shipmentId: Id<'yourobcShipments'>,
  ownerId: string
): Promise<IncomingInvoiceTracking[]> {
  await assertCanViewAccounting(ctx, ownerId)

  const records = await ctx.db
    .query('yourobcIncomingInvoiceTracking')
    .withIndex('by_shipment', (q) => q.eq('shipmentId', shipmentId))
    .filter((q) => q.eq(q.field('ownerId'), ownerId))
    .filter((q) => q.eq(q.field('deletedAt'), undefined))
    .collect()

  return records
}

/**
 * List incoming invoice tracking by partner
 */
export async function listIncomingInvoiceTrackingByPartner(
  ctx: QueryCtx,
  partnerId: Id<'yourobcPartners'>,
  ownerId: string
): Promise<IncomingInvoiceTracking[]> {
  await assertCanViewAccounting(ctx, ownerId)

  const records = await ctx.db
    .query('yourobcIncomingInvoiceTracking')
    .withIndex('by_partner', (q) => q.eq('partnerId', partnerId))
    .filter((q) => q.eq(q.field('ownerId'), ownerId))
    .filter((q) => q.eq(q.field('deletedAt'), undefined))
    .collect()

  return records
}

/**
 * Get invoice numbering for a month
 */
export async function getInvoiceNumberingForMonth(
  ctx: QueryCtx,
  ownerId: string,
  year: number,
  month: number
): Promise<InvoiceNumbering | null> {
  await assertCanViewAccounting(ctx, ownerId)

  const record = await ctx.db
    .query('yourobcInvoiceNumbering')
    .withIndex('by_ownerId_year_month', (q) =>
      q.eq('ownerId', ownerId).eq('year', year).eq('month', month)
    )
    .filter((q) => q.eq(q.field('deletedAt'), undefined))
    .first()

  return record
}

/**
 * Get statement of accounts by ID
 */
export async function getStatementOfAccounts(
  ctx: QueryCtx,
  id: Id<'yourobcStatementOfAccounts'>
): Promise<StatementOfAccounts | null> {
  const record = await ctx.db.get(id)
  if (!record || record.deletedAt) {
    return null
  }

  await assertCanViewAccounting(ctx, record.ownerId)
  return record
}

/**
 * Get statement of accounts by public ID
 */
export async function getStatementOfAccountsByPublicId(
  ctx: QueryCtx,
  publicId: string,
  ownerId: string
): Promise<StatementOfAccounts | null> {
  await assertCanViewAccounting(ctx, ownerId)

  const record = await ctx.db
    .query('yourobcStatementOfAccounts')
    .withIndex('by_publicId', (q) => q.eq('publicId', publicId))
    .filter((q) => q.eq(q.field('ownerId'), ownerId))
    .filter((q) => q.eq(q.field('deletedAt'), undefined))
    .first()

  return record
}

/**
 * List statements of accounts by customer
 */
export async function listStatementsByCustomer(
  ctx: QueryCtx,
  customerId: Id<'yourobcCustomers'>,
  ownerId: string
): Promise<StatementOfAccounts[]> {
  await assertCanViewAccounting(ctx, ownerId)

  const records = await ctx.db
    .query('yourobcStatementOfAccounts')
    .withIndex('by_ownerId_customer', (q) => q.eq('ownerId', ownerId).eq('customerId', customerId))
    .filter((q) => q.eq(q.field('deletedAt'), undefined))
    .order('desc')
    .collect()

  return records
}

/**
 * Get accounting dashboard cache for a date
 */
export async function getAccountingDashboardCache(
  ctx: QueryCtx,
  ownerId: string,
  date: number
): Promise<AccountingDashboardCache | null> {
  await assertCanViewAccounting(ctx, ownerId)

  const record = await ctx.db
    .query('yourobcAccountingDashboardCache')
    .withIndex('by_ownerId_date', (q) => q.eq('ownerId', ownerId).eq('date', date))
    .filter((q) => q.eq(q.field('deletedAt'), undefined))
    .first()

  // Check if cache is still valid
  if (record && !isCacheValid(record.validUntil)) {
    return null
  }

  return record
}

/**
 * Get latest accounting dashboard cache
 */
export async function getLatestAccountingDashboardCache(
  ctx: QueryCtx,
  ownerId: string
): Promise<AccountingDashboardCache | null> {
  await assertCanViewAccounting(ctx, ownerId)

  const record = await ctx.db
    .query('yourobcAccountingDashboardCache')
    .withIndex('by_ownerId', (q) => q.eq('ownerId', ownerId))
    .filter((q) => q.eq(q.field('deletedAt'), undefined))
    .order('desc')
    .first()

  // Check if cache is still valid
  if (record && !isCacheValid(record.validUntil)) {
    return null
  }

  return record
}

/**
 * Get invoice auto-gen log by ID
 */
export async function getInvoiceAutoGenLog(
  ctx: QueryCtx,
  id: Id<'yourobcInvoiceAutoGenLog'>
): Promise<InvoiceAutoGenLog | null> {
  const record = await ctx.db.get(id)
  if (!record || record.deletedAt) {
    return null
  }

  await assertCanViewAccounting(ctx, record.ownerId)
  return record
}

/**
 * Get invoice auto-gen log by shipment
 */
export async function getInvoiceAutoGenLogByShipment(
  ctx: QueryCtx,
  shipmentId: Id<'yourobcShipments'>,
  ownerId: string
): Promise<InvoiceAutoGenLog | null> {
  await assertCanViewAccounting(ctx, ownerId)

  const record = await ctx.db
    .query('yourobcInvoiceAutoGenLog')
    .withIndex('by_shipment', (q) => q.eq('shipmentId', shipmentId))
    .filter((q) => q.eq(q.field('ownerId'), ownerId))
    .filter((q) => q.eq(q.field('deletedAt'), undefined))
    .first()

  return record
}

/**
 * Get invoice auto-gen log by invoice
 */
export async function getInvoiceAutoGenLogByInvoice(
  ctx: QueryCtx,
  invoiceId: Id<'yourobcInvoices'>,
  ownerId: string
): Promise<InvoiceAutoGenLog | null> {
  await assertCanViewAccounting(ctx, ownerId)

  const record = await ctx.db
    .query('yourobcInvoiceAutoGenLog')
    .withIndex('by_invoice', (q) => q.eq('invoiceId', invoiceId))
    .filter((q) => q.eq(q.field('ownerId'), ownerId))
    .filter((q) => q.eq(q.field('deletedAt'), undefined))
    .first()

  return record
}

/**
 * List invoice auto-gen logs by status
 */
export async function listInvoiceAutoGenLogsByStatus(
  ctx: QueryCtx,
  ownerId: string,
  status: string
): Promise<InvoiceAutoGenLog[]> {
  await assertCanViewAccounting(ctx, ownerId)

  const records = await ctx.db
    .query('yourobcInvoiceAutoGenLog')
    .withIndex('by_ownerId_status', (q) => q.eq('ownerId', ownerId).eq('status', status))
    .filter((q) => q.eq(q.field('deletedAt'), undefined))
    .collect()

  return records
}

/**
 * List all incoming invoice tracking records
 */
export async function listAllIncomingInvoiceTracking(
  ctx: QueryCtx,
  ownerId: string
): Promise<IncomingInvoiceTracking[]> {
  await assertCanViewAccounting(ctx, ownerId)

  const records = await ctx.db
    .query('yourobcIncomingInvoiceTracking')
    .withIndex('by_ownerId', (q) => q.eq('ownerId', ownerId))
    .filter((q) => q.eq(q.field('deletedAt'), undefined))
    .order('desc')
    .collect()

  return records
}

/**
 * List all statements of accounts
 */
export async function listAllStatements(
  ctx: QueryCtx,
  ownerId: string
): Promise<StatementOfAccounts[]> {
  await assertCanViewAccounting(ctx, ownerId)

  const records = await ctx.db
    .query('yourobcStatementOfAccounts')
    .withIndex('by_ownerId', (q) => q.eq('ownerId', ownerId))
    .filter((q) => q.eq(q.field('deletedAt'), undefined))
    .order('desc')
    .collect()

  return records
}

/**
 * List all invoice auto-gen logs
 */
export async function listAllInvoiceAutoGenLogs(
  ctx: QueryCtx,
  ownerId: string
): Promise<InvoiceAutoGenLog[]> {
  await assertCanViewAccounting(ctx, ownerId)

  const records = await ctx.db
    .query('yourobcInvoiceAutoGenLog')
    .withIndex('by_ownerId', (q) => q.eq('ownerId', ownerId))
    .filter((q) => q.eq(q.field('deletedAt'), undefined))
    .order('desc')
    .collect()

  return records
}
