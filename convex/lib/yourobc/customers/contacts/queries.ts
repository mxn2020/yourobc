// convex/lib/yourobc/customers/contacts/queries.ts

import { v } from 'convex/values'
import { query } from '@/generated/server'

/**
 * Get contact log for a customer
 */
export const getContactLog = query({
  args: {
    customerId: v.id('yourobcCustomers'),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50
    const offset = args.offset || 0

    const contacts = await ctx.db
      .query('yourobcContactLog')
      .withIndex('by_customer', (q) => q.eq('customerId', args.customerId))
      .order('desc')
      .take(limit + offset)

    // Apply offset manually and limit
    const paginatedContacts = contacts.slice(offset, offset + limit)

    return {
      contacts: paginatedContacts,
      hasMore: contacts.length > offset + limit,
      total: contacts.length,
    }
  },
})

/**
 * Get pending follow-ups for a customer
 */
export const getPendingFollowUps = query({
  args: {
    customerId: v.optional(v.id('yourobcCustomers')),
    assignedTo: v.optional(v.string()),
    overdue: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Build query - apply filter if customerId provided
    const allContacts = args.customerId
      ? await ctx.db
          .query('yourobcContactLog')
          .withIndex('by_customer', (q) => q.eq('customerId', args.customerId!))
          .collect()
      : await ctx.db.query('yourobcContactLog').collect()

    // Filter for pending follow-ups
    let pendingFollowUps = allContacts.filter(
      (c) => c.requiresFollowUp && !c.followUpCompleted
    )

    // Filter by assigned to
    if (args.assignedTo) {
      pendingFollowUps = pendingFollowUps.filter(
        (c) => c.followUpAssignedTo === args.assignedTo
      )
    }

    // Filter for overdue
    if (args.overdue) {
      pendingFollowUps = pendingFollowUps.filter(
        (c) => c.followUpDate && c.followUpDate < now
      )
    }

    // Sort by follow-up date (earliest first)
    pendingFollowUps.sort((a, b) => {
      const dateA = a.followUpDate || 0
      const dateB = b.followUpDate || 0
      return dateA - dateB
    })

    // Get customer details for each follow-up
    const followUpsWithCustomers = await Promise.all(
      pendingFollowUps.map(async (contact) => {
        const customer = await ctx.db.get(contact.customerId)
        return {
          ...contact,
          customer: customer
            ? {
                _id: customer._id,
                companyName: customer.companyName,
              }
            : null,
          isOverdue: contact.followUpDate ? contact.followUpDate < now : false,
          daysOverdue: contact.followUpDate
            ? Math.floor((now - contact.followUpDate) / (1000 * 60 * 60 * 24))
            : 0,
        }
      })
    )

    return followUpsWithCustomers
  },
})

/**
 * Get inactive customers (>35 days since last contact)
 */
export const getInactiveCustomers = query({
  args: {
    inactiveDays: v.optional(v.number()), // Default 35 days
  },
  handler: async (ctx, args) => {
    const inactiveDays = args.inactiveDays || 35
    const now = Date.now()
    const inactiveThreshold = now - inactiveDays * 24 * 60 * 60 * 1000

    // Get all customer analytics
    const allAnalytics = await ctx.db
      .query('yourobcCustomerAnalytics')
      .filter((q) => q.eq(q.field('month'), undefined)) // Get overall analytics
      .collect()

    // Filter for inactive customers
    const inactiveAnalytics = allAnalytics.filter((a) => {
      if (!a.lastContactDate) return true // Never contacted
      return a.lastContactDate < inactiveThreshold
    })

    // Get customer details
    const inactiveCustomers = await Promise.all(
      inactiveAnalytics.map(async (analytics) => {
        const customer = await ctx.db.get(analytics.customerId)
        return {
          customerId: analytics.customerId,
          customer: customer
            ? {
                _id: customer._id,
                companyName: customer.companyName,
                email: customer.primaryContact.email,
              }
            : null,
          lastContactDate: analytics.lastContactDate,
          daysSinceLastContact: analytics.daysSinceLastContact || 0,
          totalContacts: analytics.totalContacts || 0,
          totalRevenue: analytics.totalRevenue || 0,
          totalShipments: analytics.totalShipments || 0,
        }
      })
    )

    // Sort by days since last contact (most inactive first)
    inactiveCustomers.sort((a, b) => b.daysSinceLastContact - a.daysSinceLastContact)

    return inactiveCustomers
  },
})

/**
 * Get contact statistics for a customer
 */
export const getContactStatistics = query({
  args: {
    customerId: v.id('yourobcCustomers'),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get all contacts for customer
    const allContacts = await ctx.db
      .query('yourobcContactLog')
      .withIndex('by_customer', (q) => q.eq('customerId', args.customerId))
      .collect()

    // Filter by date range
    let contacts = allContacts
    if (args.startDate || args.endDate) {
      contacts = allContacts.filter((c) => {
        if (args.startDate && c.contactDate < args.startDate) return false
        if (args.endDate && c.contactDate > args.endDate) return false
        return true
      })
    }

    // Calculate statistics
    const totalContacts = contacts.length
    const totalDuration = contacts.reduce((sum, c) => sum + (c.duration || 0), 0)

    // Count by type
    const byType = contacts.reduce((acc, c) => {
      acc[c.contactType] = (acc[c.contactType] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Count by outcome
    const byOutcome = contacts.reduce((acc, c) => {
      if (c.outcome) {
        acc[c.outcome] = (acc[c.outcome] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    // Count by direction
    const byDirection = contacts.reduce((acc, c) => {
      acc[c.direction] = (acc[c.direction] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Pending follow-ups
    const pendingFollowUps = contacts.filter(
      (c) => c.requiresFollowUp && !c.followUpCompleted
    ).length

    // Completed follow-ups
    const completedFollowUps = contacts.filter((c) => c.followUpCompleted).length

    // Average response time (for inbound contacts)
    const inboundContacts = contacts.filter((c) => c.direction === 'inbound')
    const respondedContacts = inboundContacts.filter((c) => c.outcome === 'successful')

    return {
      totalContacts,
      totalDuration,
      averageDuration: totalContacts > 0 ? totalDuration / totalContacts : 0,
      byType,
      byOutcome,
      byDirection,
      pendingFollowUps,
      completedFollowUps,
      followUpCompletionRate:
        pendingFollowUps + completedFollowUps > 0
          ? (completedFollowUps / (pendingFollowUps + completedFollowUps)) * 100
          : 0,
      inboundContacts: inboundContacts.length,
      outboundContacts: contacts.filter((c) => c.direction === 'outbound').length,
      responseRate:
        inboundContacts.length > 0
          ? (respondedContacts.length / inboundContacts.length) * 100
          : 0,
    }
  },
})

/**
 * Get contacts by category or type
 */
export const getContactsByCategory = query({
  args: {
    customerId: v.optional(v.id('yourobcCustomers')),
    category: v.optional(v.string()),
    contactType: v.optional(
      v.union(
        v.literal('phone'),
        v.literal('email'),
        v.literal('meeting'),
        v.literal('video_call'),
        v.literal('chat'),
        v.literal('visit'),
        v.literal('other')
      )
    ),
    tags: v.optional(v.array(v.string())),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Build query - apply filter if customerId provided
    const allContacts = args.customerId
      ? await ctx.db
          .query('yourobcContactLog')
          .withIndex('by_customer', (q) => q.eq('customerId', args.customerId!))
          .collect()
      : await ctx.db.query('yourobcContactLog').collect()

    // Apply filters
    let filteredContacts = allContacts

    if (args.category) {
      filteredContacts = filteredContacts.filter((c) => c.category === args.category)
    }

    if (args.contactType) {
      filteredContacts = filteredContacts.filter((c) => c.contactType === args.contactType)
    }

    if (args.tags && args.tags.length > 0) {
      filteredContacts = filteredContacts.filter((c) =>
        args.tags?.some((tag) => c.tags?.includes(tag))
      )
    }

    if (args.startDate || args.endDate) {
      filteredContacts = filteredContacts.filter((c) => {
        if (args.startDate && c.contactDate < args.startDate) return false
        if (args.endDate && c.contactDate > args.endDate) return false
        return true
      })
    }

    // Sort by contact date (most recent first)
    filteredContacts.sort((a, b) => b.contactDate - a.contactDate)

    return filteredContacts
  },
})

/**
 * Get contact by ID with related entities
 */
export const getContactById = query({
  args: {
    contactLogId: v.id('yourobcContactLog'),
  },
  handler: async (ctx, args) => {
    const contact = await ctx.db.get(args.contactLogId)
    if (!contact) {
      return null
    }

    // Get customer details
    const customer = await ctx.db.get(contact.customerId)

    // Get contact person if specified
    let contactPerson = null
    if (contact.contactPersonId) {
      // Contact persons are stored in the customer document
      if (customer && customer.additionalContacts) {
        contactPerson = customer.additionalContacts.find((c: any) => c.id === contact.contactPersonId)
      }
    }

    // Get related entities
    let relatedQuote = null
    if (contact.relatedQuoteId) {
      relatedQuote = await ctx.db.get(contact.relatedQuoteId)
    }

    let relatedShipment = null
    if (contact.relatedShipmentId) {
      relatedShipment = await ctx.db.get(contact.relatedShipmentId)
    }

    let relatedInvoice = null
    if (contact.relatedInvoiceId) {
      relatedInvoice = await ctx.db.get(contact.relatedInvoiceId)
    }

    return {
      ...contact,
      customer: customer
        ? {
            _id: customer._id,
            companyName: customer.companyName,
            email: customer.primaryContact.email,
          }
        : null,
      contactPerson,
      relatedQuote: relatedQuote
        ? {
            _id: relatedQuote._id,
            quoteNumber: relatedQuote.quoteNumber,
          }
        : null,
      relatedShipment: relatedShipment
        ? {
            _id: relatedShipment._id,
            shipmentNumber: relatedShipment.shipmentNumber,
          }
        : null,
      relatedInvoice: relatedInvoice
        ? {
            _id: relatedInvoice._id,
            invoiceNumber: relatedInvoice.invoiceNumber,
          }
        : null,
    }
  },
})

/**
 * Get all unique tags used in contact logs
 */
export const getAllContactTags = query({
  args: {
    customerId: v.optional(v.id('yourobcCustomers')),
  },
  handler: async (ctx, args) => {
    // Get all contacts - apply filter if customerId provided
    const contacts = args.customerId
      ? await ctx.db
          .query('yourobcContactLog')
          .withIndex('by_customer', (q) => q.eq('customerId', args.customerId!))
          .collect()
      : await ctx.db.query('yourobcContactLog').collect()

    // Collect all unique tags
    const tagsSet = new Set<string>()
    contacts.forEach((contact) => {
      contact.tags?.forEach((tag) => tagsSet.add(tag))
    })

    // Convert to array and sort
    const tags = Array.from(tagsSet).sort()

    return tags
  },
})

/**
 * Get contact activity timeline
 */
export const getContactTimeline = query({
  args: {
    customerId: v.id('yourobcCustomers'),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20

    const contacts = await ctx.db
      .query('yourobcContactLog')
      .withIndex('by_customer', (q) => q.eq('customerId', args.customerId))
      .order('desc')
      .take(limit)

    // Enrich with follow-up status
    const timeline = contacts.map((contact) => {
      const now = Date.now()
      const isOverdue =
        contact.requiresFollowUp &&
        !contact.followUpCompleted &&
        contact.followUpDate &&
        contact.followUpDate < now

      return {
        ...contact,
        isOverdue,
        daysUntilFollowUp: contact.followUpDate
          ? Math.ceil((contact.followUpDate - now) / (1000 * 60 * 60 * 24))
          : null,
      }
    })

    return timeline
  },
})
