// convex/lib/software/yourobc/quotes/mutations.ts
/**
 * Quote Mutations
 *
 * Write operations for quote management.
 *
 * @module convex/lib/software/yourobc/quotes/mutations
 */

import { mutation } from '@/generated/server'
import { v } from 'convex/values'
import { requireCurrentUser, generateUniquePublicId } from '@/lib/auth.helper'
import { quotesValidators } from '@/schema/software/yourobc/quotes/validators'
import { QUOTES_CONSTANTS } from './constants'
import { validateQuoteData, calculateValidUntil } from './utils'
import {
  requireEditQuoteAccess,
  requireDeleteQuoteAccess,
  requireSendQuoteAccess,
  requireAcceptQuoteAccess,
  requireRejectQuoteAccess,
  requireConvertToShipmentAccess,
} from './permissions'
import type { QuoteId } from './types'

/**
 * Create new quote
 */
export const createQuote = mutation({
  args: {
    data: v.object({
      quoteNumber: v.string(),
      serviceType: quotesValidators.serviceType,
      priority: quotesValidators.priority,
      customerId: v.id('yourobcCustomers'),
      origin: quotesValidators.address,
      destination: quotesValidators.address,
      dimensions: quotesValidators.dimensions,
      description: v.string(),
      deadline: v.number(),
      validUntil: v.optional(v.number()),
      status: v.optional(quotesValidators.status),
      customerReference: v.optional(v.string()),
      inquirySourceId: v.optional(v.id('yourobcInquirySources')),
      specialInstructions: v.optional(v.string()),
      baseCost: v.optional(quotesValidators.currencyAmount),
      markup: v.optional(v.number()),
      totalPrice: v.optional(quotesValidators.currencyAmount),
      partnerQuotes: v.optional(v.array(quotesValidators.partnerQuote)),
      selectedPartnerQuote: v.optional(v.id('yourobcPartners')),
      flightDetails: v.optional(quotesValidators.flightDetails),
      shipmentType: v.optional(quotesValidators.shipmentType),
      incoterms: v.optional(v.string()),
      appliedAirlineRules: v.optional(quotesValidators.airlineRules),
      assignedCourierId: v.optional(v.id('yourobcCouriers')),
      employeeId: v.optional(v.id('yourobcEmployees')),
      quoteText: v.optional(v.string()),
      notes: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      category: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { data }): Promise<QuoteId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx)

    // 2. VALIDATE: Check data validity
    const errors = validateQuoteData(data)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`)
    }

    // 3. PROCESS: Generate IDs and prepare data
    const publicId = await generateUniquePublicId(ctx, 'yourobcQuotes')
    const now = Date.now()
    const validUntil = data.validUntil || calculateValidUntil(data.deadline)

    // 4. CREATE: Insert into database
    const quoteId = await ctx.db.insert('yourobcQuotes', {
      publicId,
      quoteNumber: data.quoteNumber.trim(),
      serviceType: data.serviceType,
      priority: data.priority,
      customerId: data.customerId,
      origin: data.origin,
      destination: data.destination,
      dimensions: data.dimensions,
      description: data.description.trim(),
      deadline: data.deadline,
      validUntil,
      status: data.status || QUOTES_CONSTANTS.STATUS.DRAFT,
      customerReference: data.customerReference?.trim(),
      inquirySourceId: data.inquirySourceId,
      specialInstructions: data.specialInstructions?.trim(),
      baseCost: data.baseCost,
      markup: data.markup,
      totalPrice: data.totalPrice,
      partnerQuotes: data.partnerQuotes,
      selectedPartnerQuote: data.selectedPartnerQuote,
      flightDetails: data.flightDetails,
      shipmentType: data.shipmentType,
      incoterms: data.incoterms?.trim().toUpperCase(),
      appliedAirlineRules: data.appliedAirlineRules,
      assignedCourierId: data.assignedCourierId,
      employeeId: data.employeeId,
      quoteText: data.quoteText?.trim(),
      notes: data.notes?.trim(),
      tags: data.tags?.map((tag) => tag.trim()) || [],
      category: data.category,
      customFields: {},
      ownerId: user._id,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
    })

    // 5. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'quote.created',
      entityType: 'software_quote',
      entityId: publicId,
      entityTitle: data.quoteNumber.trim(),
      description: `Created quote: ${data.quoteNumber.trim()}`,
      metadata: {
        serviceType: data.serviceType,
        priority: data.priority,
        status: data.status || QUOTES_CONSTANTS.STATUS.DRAFT,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    })

    // 6. RETURN: Return entity ID
    return quoteId
  },
})

/**
 * Update existing quote
 */
export const updateQuote = mutation({
  args: {
    quoteId: v.id('yourobcQuotes'),
    updates: v.object({
      quoteNumber: v.optional(v.string()),
      customerReference: v.optional(v.string()),
      serviceType: v.optional(quotesValidators.serviceType),
      priority: v.optional(quotesValidators.priority),
      customerId: v.optional(v.id('yourobcCustomers')),
      inquirySourceId: v.optional(v.id('yourobcInquirySources')),
      origin: v.optional(quotesValidators.address),
      destination: v.optional(quotesValidators.address),
      dimensions: v.optional(quotesValidators.dimensions),
      description: v.optional(v.string()),
      specialInstructions: v.optional(v.string()),
      deadline: v.optional(v.number()),
      validUntil: v.optional(v.number()),
      baseCost: v.optional(quotesValidators.currencyAmount),
      markup: v.optional(v.number()),
      totalPrice: v.optional(quotesValidators.currencyAmount),
      partnerQuotes: v.optional(v.array(quotesValidators.partnerQuote)),
      selectedPartnerQuote: v.optional(v.id('yourobcPartners')),
      flightDetails: v.optional(quotesValidators.flightDetails),
      shipmentType: v.optional(quotesValidators.shipmentType),
      incoterms: v.optional(v.string()),
      appliedAirlineRules: v.optional(quotesValidators.airlineRules),
      assignedCourierId: v.optional(v.id('yourobcCouriers')),
      employeeId: v.optional(v.id('yourobcEmployees')),
      status: v.optional(quotesValidators.status),
      quoteText: v.optional(v.string()),
      notes: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      category: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { quoteId, updates }): Promise<QuoteId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx)

    // 2. CHECK: Verify entity exists
    const quote = await ctx.db.get(quoteId)
    if (!quote || quote.deletedAt) {
      throw new Error('Quote not found')
    }

    // 3. AUTHZ: Check edit permission
    await requireEditQuoteAccess(ctx, quote, user)

    // 4. VALIDATE: Check update data validity
    const errors = validateQuoteData(updates)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`)
    }

    // 5. PROCESS: Prepare update data
    const now = Date.now()
    const updateData: any = {
      updatedAt: now,
      updatedBy: user._id,
    }

    if (updates.quoteNumber !== undefined) {
      updateData.quoteNumber = updates.quoteNumber.trim()
    }
    if (updates.customerReference !== undefined) {
      updateData.customerReference = updates.customerReference?.trim()
    }
    if (updates.serviceType !== undefined) {
      updateData.serviceType = updates.serviceType
    }
    if (updates.priority !== undefined) {
      updateData.priority = updates.priority
    }
    if (updates.customerId !== undefined) {
      updateData.customerId = updates.customerId
    }
    if (updates.inquirySourceId !== undefined) {
      updateData.inquirySourceId = updates.inquirySourceId
    }
    if (updates.origin !== undefined) {
      updateData.origin = updates.origin
    }
    if (updates.destination !== undefined) {
      updateData.destination = updates.destination
    }
    if (updates.dimensions !== undefined) {
      updateData.dimensions = updates.dimensions
    }
    if (updates.description !== undefined) {
      updateData.description = updates.description.trim()
    }
    if (updates.specialInstructions !== undefined) {
      updateData.specialInstructions = updates.specialInstructions?.trim()
    }
    if (updates.deadline !== undefined) {
      updateData.deadline = updates.deadline
    }
    if (updates.validUntil !== undefined) {
      updateData.validUntil = updates.validUntil
    }
    if (updates.baseCost !== undefined) {
      updateData.baseCost = updates.baseCost
    }
    if (updates.markup !== undefined) {
      updateData.markup = updates.markup
    }
    if (updates.totalPrice !== undefined) {
      updateData.totalPrice = updates.totalPrice
    }
    if (updates.partnerQuotes !== undefined) {
      updateData.partnerQuotes = updates.partnerQuotes
    }
    if (updates.selectedPartnerQuote !== undefined) {
      updateData.selectedPartnerQuote = updates.selectedPartnerQuote
    }
    if (updates.flightDetails !== undefined) {
      updateData.flightDetails = updates.flightDetails
    }
    if (updates.shipmentType !== undefined) {
      updateData.shipmentType = updates.shipmentType
    }
    if (updates.incoterms !== undefined) {
      updateData.incoterms = updates.incoterms?.trim().toUpperCase()
    }
    if (updates.appliedAirlineRules !== undefined) {
      updateData.appliedAirlineRules = updates.appliedAirlineRules
    }
    if (updates.assignedCourierId !== undefined) {
      updateData.assignedCourierId = updates.assignedCourierId
    }
    if (updates.employeeId !== undefined) {
      updateData.employeeId = updates.employeeId
    }
    if (updates.status !== undefined) {
      updateData.status = updates.status
    }
    if (updates.quoteText !== undefined) {
      updateData.quoteText = updates.quoteText?.trim()
    }
    if (updates.notes !== undefined) {
      updateData.notes = updates.notes?.trim()
    }
    if (updates.tags !== undefined) {
      updateData.tags = updates.tags.map((tag) => tag.trim())
    }
    if (updates.category !== undefined) {
      updateData.category = updates.category
    }

    // 6. UPDATE: Apply changes
    await ctx.db.patch(quoteId, updateData)

    // 7. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'quote.updated',
      entityType: 'software_quote',
      entityId: quote.publicId,
      entityTitle: updateData.quoteNumber || quote.quoteNumber,
      description: `Updated quote: ${updateData.quoteNumber || quote.quoteNumber}`,
      metadata: { changes: updates },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    })

    // 8. RETURN: Return entity ID
    return quoteId
  },
})

/**
 * Delete quote (soft delete)
 */
export const deleteQuote = mutation({
  args: {
    quoteId: v.id('yourobcQuotes'),
  },
  handler: async (ctx, { quoteId }): Promise<QuoteId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx)

    // 2. CHECK: Verify entity exists
    const quote = await ctx.db.get(quoteId)
    if (!quote || quote.deletedAt) {
      throw new Error('Quote not found')
    }

    // 3. AUTHZ: Check delete permission
    await requireDeleteQuoteAccess(quote, user)

    // 4. SOFT DELETE: Mark as deleted
    const now = Date.now()
    await ctx.db.patch(quoteId, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    })

    // 5. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'quote.deleted',
      entityType: 'software_quote',
      entityId: quote.publicId,
      entityTitle: quote.quoteNumber,
      description: `Deleted quote: ${quote.quoteNumber}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    })

    // 6. RETURN: Return entity ID
    return quoteId
  },
})

/**
 * Restore soft-deleted quote
 */
export const restoreQuote = mutation({
  args: {
    quoteId: v.id('yourobcQuotes'),
  },
  handler: async (ctx, { quoteId }): Promise<QuoteId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx)

    // 2. CHECK: Verify entity exists and is deleted
    const quote = await ctx.db.get(quoteId)
    if (!quote) {
      throw new Error('Quote not found')
    }
    if (!quote.deletedAt) {
      throw new Error('Quote is not deleted')
    }

    // 3. AUTHZ: Check edit permission (owners and admins can restore)
    if (
      quote.ownerId !== user._id &&
      user.role !== 'admin' &&
      user.role !== 'superadmin'
    ) {
      throw new Error('You do not have permission to restore this quote')
    }

    // 4. RESTORE: Clear soft delete fields
    const now = Date.now()
    await ctx.db.patch(quoteId, {
      deletedAt: undefined,
      deletedBy: undefined,
      updatedAt: now,
      updatedBy: user._id,
    })

    // 5. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'quote.restored',
      entityType: 'software_quote',
      entityId: quote.publicId,
      entityTitle: quote.quoteNumber,
      description: `Restored quote: ${quote.quoteNumber}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    })

    // 6. RETURN: Return entity ID
    return quoteId
  },
})

/**
 * Send quote to customer
 */
export const sendQuote = mutation({
  args: {
    quoteId: v.id('yourobcQuotes'),
  },
  handler: async (ctx, { quoteId }): Promise<QuoteId> => {
    const user = await requireCurrentUser(ctx)

    const quote = await ctx.db.get(quoteId)
    if (!quote || quote.deletedAt) {
      throw new Error('Quote not found')
    }

    await requireSendQuoteAccess(ctx, quote, user)

    const now = Date.now()
    await ctx.db.patch(quoteId, {
      status: QUOTES_CONSTANTS.STATUS.SENT,
      sentAt: now,
      updatedAt: now,
      updatedBy: user._id,
    })

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'quote.sent',
      entityType: 'software_quote',
      entityId: quote.publicId,
      entityTitle: quote.quoteNumber,
      description: `Sent quote: ${quote.quoteNumber}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    })

    return quoteId
  },
})

/**
 * Accept quote
 */
export const acceptQuote = mutation({
  args: {
    quoteId: v.id('yourobcQuotes'),
  },
  handler: async (ctx, { quoteId }): Promise<QuoteId> => {
    const user = await requireCurrentUser(ctx)

    const quote = await ctx.db.get(quoteId)
    if (!quote || quote.deletedAt) {
      throw new Error('Quote not found')
    }

    await requireAcceptQuoteAccess(ctx, quote, user)

    const now = Date.now()
    await ctx.db.patch(quoteId, {
      status: QUOTES_CONSTANTS.STATUS.ACCEPTED,
      updatedAt: now,
      updatedBy: user._id,
    })

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'quote.accepted',
      entityType: 'software_quote',
      entityId: quote.publicId,
      entityTitle: quote.quoteNumber,
      description: `Accepted quote: ${quote.quoteNumber}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    })

    return quoteId
  },
})

/**
 * Reject quote
 */
export const rejectQuote = mutation({
  args: {
    quoteId: v.id('yourobcQuotes'),
    reason: v.string(),
  },
  handler: async (ctx, { quoteId, reason }): Promise<QuoteId> => {
    const user = await requireCurrentUser(ctx)

    const quote = await ctx.db.get(quoteId)
    if (!quote || quote.deletedAt) {
      throw new Error('Quote not found')
    }

    await requireRejectQuoteAccess(ctx, quote, user)

    const now = Date.now()
    await ctx.db.patch(quoteId, {
      status: QUOTES_CONSTANTS.STATUS.REJECTED,
      rejectionReason: reason.trim(),
      updatedAt: now,
      updatedBy: user._id,
    })

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'quote.rejected',
      entityType: 'software_quote',
      entityId: quote.publicId,
      entityTitle: quote.quoteNumber,
      description: `Rejected quote: ${quote.quoteNumber}`,
      metadata: { reason: reason.trim() },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    })

    return quoteId
  },
})

/**
 * Mark quote as expired
 */
export const expireQuote = mutation({
  args: {
    quoteId: v.id('yourobcQuotes'),
  },
  handler: async (ctx, { quoteId }): Promise<QuoteId> => {
    const user = await requireCurrentUser(ctx)

    const quote = await ctx.db.get(quoteId)
    if (!quote || quote.deletedAt) {
      throw new Error('Quote not found')
    }

    await requireEditQuoteAccess(ctx, quote, user)

    const now = Date.now()
    await ctx.db.patch(quoteId, {
      status: QUOTES_CONSTANTS.STATUS.EXPIRED,
      updatedAt: now,
      updatedBy: user._id,
    })

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'quote.expired',
      entityType: 'software_quote',
      entityId: quote.publicId,
      entityTitle: quote.quoteNumber,
      description: `Marked quote as expired: ${quote.quoteNumber}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    })

    return quoteId
  },
})

/**
 * Convert quote to shipment
 */
export const convertQuoteToShipment = mutation({
  args: {
    quoteId: v.id('yourobcQuotes'),
    shipmentId: v.id('yourobcShipments'),
  },
  handler: async (ctx, { quoteId, shipmentId }): Promise<QuoteId> => {
    const user = await requireCurrentUser(ctx)

    const quote = await ctx.db.get(quoteId)
    if (!quote || quote.deletedAt) {
      throw new Error('Quote not found')
    }

    await requireConvertToShipmentAccess(ctx, quote, user)

    const now = Date.now()
    await ctx.db.patch(quoteId, {
      convertedToShipmentId: shipmentId,
      updatedAt: now,
      updatedBy: user._id,
    })

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'quote.converted',
      entityType: 'software_quote',
      entityId: quote.publicId,
      entityTitle: quote.quoteNumber,
      description: `Converted quote to shipment: ${quote.quoteNumber}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    })

    return quoteId
  },
})
