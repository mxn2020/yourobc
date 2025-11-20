// convex/lib/yourobc/accounting/statements/queries.ts

import { v } from 'convex/values'
import { query } from '@/generated/server'

/**
 * Get statement by ID
 */
export const getStatement = query({
  args: {
    authUserId: v.string(),
    statementId: v.id('yourobcStatementOfAccounts'),
  },
  handler: async (ctx, args) => {
    const { statementId } = args

    const statement = await ctx.db.get(statementId)
    if (!statement) {
      return null
    }

    // Enrich with customer data
    const customer = await ctx.db.get(statement.customerId)

    return {
      ...statement,
      customer: customer
        ? {
            _id: customer._id,
            companyName: customer.companyName,
            contactEmail: customer.primaryContact.email,
            contactPerson: customer.primaryContact.name,
          }
        : null,
    }
  },
})

/**
 * Get all statements for a customer
 */
export const getCustomerStatements = query({
  args: {
    authUserId: v.string(),
    customerId: v.id('yourobcCustomers'),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { customerId, limit = 50 } = args

    const statements = await ctx.db
      .query('yourobcStatementOfAccounts')
      .withIndex('by_customer', (q) => q.eq('customerId', customerId))
      .order('desc')
      .take(limit)

    // Sort by generated date (newest first)
    statements.sort((a, b) => b.generatedDate - a.generatedDate)

    return statements.map((statement) => ({
      _id: statement._id,
      startDate: statement.startDate,
      endDate: statement.endDate,
      generatedDate: statement.generatedDate,
      openingBalance: statement.openingBalance,
      closingBalance: statement.closingBalance,
      totalInvoiced: statement.totalInvoiced,
      totalPaid: statement.totalPaid,
      outstandingCount: statement.outstandingInvoices.length,
      transactionCount: statement.transactions.length,
      exportedAt: statement.exportedAt,
      exportFormat: statement.exportFormat,
    }))
  },
})

/**
 * Get latest statement for each customer
 */
export const getLatestStatements = query({
  args: {
    authUserId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { limit = 50 } = args

    // Get all customers with active invoices
    const customers = await ctx.db.query('yourobcCustomers').take(limit)

    const latestStatements = await Promise.all(
      customers.map(async (customer) => {
        const statements = await ctx.db
          .query('yourobcStatementOfAccounts')
          .withIndex('by_customer', (q) => q.eq('customerId', customer._id))
          .order('desc')
          .take(1)

        const latest = statements[0]

        if (!latest) {
          return null
        }

        return {
          ...latest,
          customer: {
            _id: customer._id,
            companyName: customer.companyName,
            contactEmail: customer.primaryContact.email,
          },
        }
      })
    )

    // Filter out nulls and sort by generated date
    const filtered = latestStatements.filter((s) => s !== null)
    filtered.sort((a, b) => b!.generatedDate - a!.generatedDate)

    return filtered
  },
})

/**
 * Get statements for a period
 */
export const getStatementsByPeriod = query({
  args: {
    authUserId: v.string(),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const { startDate, endDate } = args

    // Get all statements and filter by period
    // Note: Index is on startDate and endDate, but we can only range query on startDate
    const statements = await ctx.db
      .query('yourobcStatementOfAccounts')
      .withIndex('by_period', (q) => q.gte('startDate', startDate))
      .filter((q) => q.lte(q.field('endDate'), endDate))
      .collect()

    const enriched = await Promise.all(
      statements.map(async (statement) => {
        const customer = await ctx.db.get(statement.customerId)

        return {
          ...statement,
          customer: customer
            ? {
                _id: customer._id,
                companyName: customer.companyName,
              }
            : null,
        }
      })
    )

    // Sort by customer name
    enriched.sort((a, b) => {
      const nameA = a.customer?.companyName || ''
      const nameB = b.customer?.companyName || ''
      return nameA.localeCompare(nameB)
    })

    return enriched
  },
})

/**
 * Get statement statistics
 */
export const getStatementStatistics = query({
  args: {
    authUserId: v.string(),
  },
  handler: async (ctx) => {
    const allStatements = await ctx.db.query('yourobcStatementOfAccounts').collect()

    if (allStatements.length === 0) {
      return {
        totalStatements: 0,
        totalCustomers: 0,
        totalReceivables: { amount: 0, currency: 'EUR' as const },
        totalOverdue: { amount: 0, currency: 'EUR' as const },
        averageBalance: { amount: 0, currency: 'EUR' as const },
        oldestStatement: null,
        newestStatement: null,
      }
    }

    // Get unique customers
    const uniqueCustomers = new Set(allStatements.map((s) => s.customerId))

    // Calculate totals
    let totalReceivables = 0
    let totalOverdue = 0
    let totalBalance = 0

    const now = Date.now()

    allStatements.forEach((statement) => {
      totalBalance += statement.closingBalance.amount

      // Add up overdue amounts from outstanding invoices
      statement.outstandingInvoices.forEach((inv) => {
        totalReceivables += inv.amount.amount

        if (inv.daysOverdue > 0) {
          totalOverdue += inv.amount.amount
        }
      })
    })

    const averageBalance = totalBalance / allStatements.length

    // Find oldest and newest
    const sorted = [...allStatements].sort((a, b) => a.generatedDate - b.generatedDate)

    return {
      totalStatements: allStatements.length,
      totalCustomers: uniqueCustomers.size,
      totalReceivables: {
        amount: totalReceivables,
        currency: 'EUR' as const,
      },
      totalOverdue: {
        amount: totalOverdue,
        currency: 'EUR' as const,
      },
      averageBalance: {
        amount: averageBalance,
        currency: 'EUR' as const,
      },
      oldestStatement: sorted[0]?.generatedDate || null,
      newestStatement: sorted[sorted.length - 1]?.generatedDate || null,
    }
  },
})

/**
 * Get customers with highest outstanding balances
 */
export const getTopOutstandingCustomers = query({
  args: {
    authUserId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { limit = 10 } = args

    // Get latest statement for each customer
    const customers = await ctx.db.query('yourobcCustomers').collect()

    const customerBalances = await Promise.all(
      customers.map(async (customer) => {
        const statements = await ctx.db
          .query('yourobcStatementOfAccounts')
          .withIndex('by_customer', (q) => q.eq('customerId', customer._id))
          .order('desc')
          .take(1)

        const latest = statements[0]

        if (!latest || latest.closingBalance.amount <= 0) {
          return null
        }

        return {
          customer: {
            _id: customer._id,
            companyName: customer.companyName,
            contactEmail: customer.primaryContact.email,
          },
          outstandingBalance: latest.closingBalance,
          outstandingInvoices: latest.outstandingInvoices.length,
          oldestInvoiceDaysOverdue:
            latest.outstandingInvoices.length > 0
              ? Math.max(...latest.outstandingInvoices.map((inv) => inv.daysOverdue))
              : 0,
          statementDate: latest.generatedDate,
        }
      })
    )

    // Filter out nulls and sort by balance (highest first)
    const filtered = customerBalances.filter((c) => c !== null)
    filtered.sort((a, b) => b!.outstandingBalance.amount - a!.outstandingBalance.amount)

    return filtered.slice(0, limit)
  },
})

/**
 * Search statements
 */
export const searchStatements = query({
  args: {
    authUserId: v.string(),
    searchTerm: v.string(),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { searchTerm, startDate, endDate } = args

    let statements = await ctx.db.query('yourobcStatementOfAccounts').collect()

    // Filter by date range if provided
    if (startDate && endDate) {
      statements = statements.filter(
        (s) => s.generatedDate >= startDate && s.generatedDate <= endDate
      )
    }

    // Enrich with customer data and search
    const enriched = await Promise.all(
      statements.map(async (statement) => {
        const customer = await ctx.db.get(statement.customerId)
        return { statement, customer }
      })
    )

    // Search by customer name or invoice numbers in transactions
    const searchLower = searchTerm.toLowerCase()
    const filtered = enriched.filter((item) => {
      const customerMatch = item.customer?.companyName?.toLowerCase().includes(searchLower)

      const transactionMatch = item.statement.transactions.some(
        (t) =>
          t.reference.toLowerCase().includes(searchLower) ||
          t.description.toLowerCase().includes(searchLower)
      )

      const invoiceMatch = item.statement.outstandingInvoices.some((inv) =>
        inv.invoiceNumber.toLowerCase().includes(searchLower)
      )

      return customerMatch || transactionMatch || invoiceMatch
    })

    return filtered.map((item) => ({
      ...item.statement,
      customer: item.customer
        ? {
            _id: item.customer._id,
            companyName: item.customer.companyName,
          }
        : null,
    }))
  },
})

/**
 * Get aging report for all customers
 * Groups outstanding amounts by age brackets
 */
export const getAgingReport = query({
  args: {
    authUserId: v.string(),
  },
  handler: async (ctx) => {
    const customers = await ctx.db.query('yourobcCustomers').collect()

    const agingReport = await Promise.all(
      customers.map(async (customer) => {
        // Get latest statement
        const statements = await ctx.db
          .query('yourobcStatementOfAccounts')
          .withIndex('by_customer', (q) => q.eq('customerId', customer._id))
          .order('desc')
          .take(1)

        const latest = statements[0]

        if (!latest || latest.outstandingInvoices.length === 0) {
          return null
        }

        // Calculate aging buckets
        const aging = {
          current: 0, // 0-30 days
          days31to60: 0,
          days61to90: 0,
          days90plus: 0,
        }

        latest.outstandingInvoices.forEach((inv) => {
          const amount = inv.amount.amount

          if (inv.daysOverdue <= 0) {
            aging.current += amount
          } else if (inv.daysOverdue <= 30) {
            aging.current += amount
          } else if (inv.daysOverdue <= 60) {
            aging.days31to60 += amount
          } else if (inv.daysOverdue <= 90) {
            aging.days61to90 += amount
          } else {
            aging.days90plus += amount
          }
        })

        return {
          customer: {
            _id: customer._id,
            companyName: customer.companyName,
          },
          total: latest.closingBalance.amount,
          aging,
          invoiceCount: latest.outstandingInvoices.length,
          oldestInvoiceDays: Math.max(...latest.outstandingInvoices.map((inv) => inv.daysOverdue)),
        }
      })
    )

    // Filter out nulls and sort by total (highest first)
    const filtered = agingReport.filter((r) => r !== null)
    filtered.sort((a, b) => b!.total - a!.total)

    // Calculate totals
    const totals = {
      current: 0,
      days31to60: 0,
      days61to90: 0,
      days90plus: 0,
      total: 0,
    }

    filtered.forEach((item) => {
      totals.current += item!.aging.current
      totals.days31to60 += item!.aging.days31to60
      totals.days61to90 += item!.aging.days61to90
      totals.days90plus += item!.aging.days90plus
      totals.total += item!.total
    })

    return {
      customers: filtered,
      totals,
      currency: 'EUR' as const,
    }
  },
})
