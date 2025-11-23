// convex/schema/yourobc/accounting/accountingDashboardCache.ts
/**
 * Accounting Dashboard Cache Table
 *
 * Pre-calculated metrics for accounting dashboard performance.
 * Daily cache of receivables, payables, cash flow forecasts, dunning status,
 * and pending approvals. Cache invalidates daily.
 *
 * @module convex/schema/yourobc/accounting/accountingDashboardCache
 */

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, currencyAmountSchema, softDeleteFields } from '@/schema/base';
import { accountingFields } from './validators';

/**
 * Accounting Dashboard Cache Table
 * Pre-calculated metrics for dashboard performance (invalidates daily)
 */
export const accountingDashboardCacheTable = defineTable({
  // Required: Main display field
  publicId: v.string(),

  // Required: Core fields
  ownerId: v.id('userProfiles'),

  // Period
  date: v.number(),

  // Receivables (money owed to us)
  totalReceivables: currencyAmountSchema,
  currentReceivables: currencyAmountSchema,
  overdueReceivables: currencyAmountSchema,
  overdueBreakdown: v.object({
    overdue1to30: currencyAmountSchema,
    overdue31to60: currencyAmountSchema,
    overdue61to90: currencyAmountSchema,
    overdue90plus: currencyAmountSchema,
  }),

  // Payables (money we owe)
  totalPayables: currencyAmountSchema,
  currentPayables: currencyAmountSchema,
  overduePayables: currencyAmountSchema,

  // Cash flow forecast (next 30 days)
  expectedIncoming: v.array(accountingFields.expectedCashflowItem),
  expectedOutgoing: v.array(accountingFields.expectedCashflowItem),

  // Dunning status
  dunningLevel1Count: v.number(),
  dunningLevel2Count: v.number(),
  dunningLevel3Count: v.number(),
  suspendedCustomersCount: v.number(),

  // Missing invoices
  missingInvoicesCount: v.number(),
  missingInvoicesValue: currencyAmountSchema,

  // Pending approvals
  pendingApprovalCount: v.number(),
  pendingApprovalValue: currencyAmountSchema,

  // Cache control
  calculatedAt: v.number(),
  validUntil: v.number(),

  // Audit & Soft Delete
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_public_id', ['publicId'])
  .index('by_owner_id', ['ownerId'])
  .index('by_date', ['date'])
  .index('by_owner_date', ['ownerId', 'date'])
  .index('by_created_at', ['createdAt']);
