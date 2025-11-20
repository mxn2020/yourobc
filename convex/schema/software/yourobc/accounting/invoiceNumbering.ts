// convex/schema/software/yourobc/accounting/invoiceNumbering.ts
/**
 * Invoice Numbering Table
 *
 * Manages auto-increment invoice numbers with custom format (YYMM####).
 * Maintains sequential invoice numbering per month with configurable increment.
 *
 * @module convex/schema/software/yourobc/accounting/invoiceNumbering
 */

import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import {
  auditFields,
  softDeleteFields,
} from './validators'

/**
 * Invoice Numbering Sequence Table
 * Manages auto-increment invoice numbers with custom format (e.g., YYMM0013)
 */
export const invoiceNumberingTable = defineTable({
  // Identity fields
  publicId: v.string(), // Unique public identifier (e.g., "INN-2025-01")
  ownerId: v.string(), // Organization owner

  // Numbering sequence fields
  year: v.number(), // e.g., 2025
  month: v.number(), // e.g., 1-12
  lastNumber: v.number(), // Last used number in this month
  format: v.string(), // e.g., 'YYMM####' where #### is the number
  incrementBy: v.number(), // Default 13 (or 1 for sequential)

  // Audit & Soft Delete
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_publicId', ['publicId'])
  .index('by_ownerId', ['ownerId'])
  .index('by_year_month', ['year', 'month'])
  .index('by_ownerId_year_month', ['ownerId', 'year', 'month'])
  .index('by_created', ['createdAt'])
