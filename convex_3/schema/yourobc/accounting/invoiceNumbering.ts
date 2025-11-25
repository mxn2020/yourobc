// convex/schema/yourobc/accounting/invoiceNumbering.ts
/**
 * Invoice Numbering Table
 *
 * Manages auto-increment invoice numbers with custom format (YYMM####).
 * Maintains sequential invoice numbering per month with configurable increment.
 *
 * @module convex/schema/yourobc/accounting/invoiceNumbering
 */

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields } from '@/schema/base';

/**
 * Invoice Numbering Sequence Table
 * Manages auto-increment invoice numbers with custom format (e.g., YYMM0013)
 */
export const invoiceNumberingTable = defineTable({
  // Required: Main display field
  publicId: v.string(),

  // Required: Core fields
  ownerId: v.id('userProfiles'),

  // Numbering sequence fields
  year: v.number(),
  month: v.number(),
  lastNumber: v.number(),
  format: v.string(),
  incrementBy: v.number(),

  // Audit & Soft Delete
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_public_id', ['publicId'])
  .index('by_owner_id', ['ownerId'])
  .index('by_year_month', ['year', 'month'])
  .index('by_owner_year_month', ['ownerId', 'year', 'month'])
  .index('by_created_at', ['createdAt']);
