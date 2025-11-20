// convex/lib/yourobc/invoices/invoiceNumberGenerator.ts

/**
 * Invoice Number Auto-Generation System
 *
 * Format: YYMM0013
 * - YY: Last two digits of year (e.g., 24 for 2024)
 * - MM: Month (01-12)
 * - 0013: Sequential counter that increments by 13
 *
 * Features:
 * - Atomic counter per month
 * - Auto-rollover on month change
 * - Thread-safe generation using Convex atomic operations
 */

import type { DatabaseReader, DatabaseWriter } from '@/generated/server'

// Note: Using existing invoiceNumbering table from schema/yourobc/accounting.ts
// Schema fields: year, month, lastNumber, format, incrementBy, createdAt, updatedAt

/**
 * Generate the next invoice number for the current month
 * Format: YYMM0013 (increments by 13)
 */
export async function generateNextInvoiceNumber(
  db: DatabaseWriter
): Promise<string> {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1 // 1-12

  // Get or create counter for current month
  const counter = await getOrCreateCounter(db, year, month)

  // Calculate next sequence number
  const nextNumber = counter.lastNumber + counter.incrementBy

  // Generate invoice number
  const yy = year.toString().slice(-2) // Last 2 digits
  const mm = month.toString().padStart(2, '0') // 01-12
  const seq = nextNumber.toString().padStart(4, '0') // 0013, 0026, etc.
  const invoiceNumber = `${yy}${mm}${seq}`

  // Update counter for next use
  const now_timestamp = Date.now()

  await db.patch(counter._id, {
    lastNumber: nextNumber,
    updatedAt: now_timestamp,
  })

  return invoiceNumber
}

/**
 * Get existing counter or create new one for month
 */
async function getOrCreateCounter(
  db: DatabaseWriter,
  year: number,
  month: number
): Promise<{ _id: any; year: number; month: number; lastNumber: number; format: string; incrementBy: number }> {
  // Try to find existing counter for this month
  const existing = await db
    .query('yourobcInvoiceNumbering')
    .withIndex('by_year_month', (q) => q.eq('year', year).eq('month', month))
    .first()

  if (existing) {
    return existing as any
  }

  // Create new counter starting at 0 (first invoice will be 0 + 13 = 13)
  const now = Date.now()
  const counterId = await db.insert('yourobcInvoiceNumbering', {
    year,
    month,
    lastNumber: 0, // Start at 0, so first number will be 0 + 13 = 13
    format: 'YYMM####',
    incrementBy: 13,
    createdAt: now,
    updatedAt: now,
    createdBy: 'system',
  })

  const created = await db.get(counterId)
  if (!created) {
    throw new Error('Failed to create invoice numbering counter')
  }

  return created as any
}

/**
 * Validate invoice number format
 */
export function isValidInvoiceNumber(invoiceNumber: string): boolean {
  // Format: YYMM0013 (6 digits total)
  const pattern = /^\d{6}$/
  if (!pattern.test(invoiceNumber)) {
    return false
  }

  // Validate month (01-12)
  const monthPart = invoiceNumber.substring(2, 4)
  const month = parseInt(monthPart, 10)
  if (month < 1 || month > 12) {
    return false
  }

  // Validate sequence (must be divisible by 13)
  const seqPart = invoiceNumber.substring(4)
  const seq = parseInt(seqPart, 10)
  if (seq % 13 !== 0 || seq === 0) {
    return false
  }

  return true
}

/**
 * Parse invoice number into components
 */
export function parseInvoiceNumber(invoiceNumber: string): {
  year: number
  month: number
  sequence: number
  fullYear: number
} | null {
  if (!isValidInvoiceNumber(invoiceNumber)) {
    return null
  }

  const yy = parseInt(invoiceNumber.substring(0, 2), 10)
  const mm = parseInt(invoiceNumber.substring(2, 4), 10)
  const seq = parseInt(invoiceNumber.substring(4), 10)

  // Determine full year (assume 2000s)
  const currentCentury = Math.floor(new Date().getFullYear() / 100) * 100
  const fullYear = currentCentury + yy

  return {
    year: yy,
    month: mm,
    sequence: seq,
    fullYear,
  }
}

/**
 * Get invoice count for current month
 */
export async function getMonthlyInvoiceCount(
  db: DatabaseReader,
  year?: number,
  month?: number
): Promise<number> {
  const now = new Date()
  const targetYear = year || now.getFullYear()
  const targetMonth = month || now.getMonth() + 1

  const counter = await db
    .query('yourobcInvoiceNumbering')
    .withIndex('by_year_month', (q) => q.eq('year', targetYear).eq('month', targetMonth))
    .first()

  if (!counter) {
    return 0
  }

  // Calculate how many invoices have been created
  // If lastNumber is 0, zero invoices created
  // If lastNumber is 13, one invoice created
  // If lastNumber is 26, two invoices created
  return counter.lastNumber / counter.incrementBy
}

/**
 * Get statistics for all months
 */
export async function getAllMonthlyCounters(
  db: DatabaseReader
): Promise<any[]> {
  const counters = await db.query('yourobcInvoiceNumbering').collect()
  return counters
}

/**
 * Preview what the next invoice number will be
 */
export async function previewNextInvoiceNumber(
  db: DatabaseReader
): Promise<string> {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  // Check if counter exists
  const counter = await db
    .query('yourobcInvoiceNumbering')
    .withIndex('by_year_month', (q) => q.eq('year', year).eq('month', month))
    .first()

  // Next number will be lastNumber + incrementBy
  const nextNumber = counter ? counter.lastNumber + counter.incrementBy : 13 // Start at 13 if no counter

  const yy = year.toString().slice(-2)
  const mm = month.toString().padStart(2, '0')
  const seq = nextNumber.toString().padStart(4, '0')

  return `${yy}${mm}${seq}`
}

/**
 * Reset counter for a specific month (admin function)
 * Use with caution - only for corrections
 */
export async function resetMonthCounter(
  db: DatabaseWriter,
  year: number,
  month: number,
  newLastNumber: number = 0
): Promise<void> {
  // Validate number is divisible by incrementBy (13)
  if (newLastNumber % 13 !== 0 || newLastNumber < 0) {
    throw new Error('Last number must be divisible by 13 and non-negative')
  }

  const counter = await db
    .query('yourobcInvoiceNumbering')
    .withIndex('by_year_month', (q) => q.eq('year', year).eq('month', month))
    .first()

  if (!counter) {
    throw new Error(`No counter found for ${year}-${month.toString().padStart(2, '0')}`)
  }

  await db.patch(counter._id, {
    lastNumber: newLastNumber,
    updatedAt: Date.now(),
  })
}
