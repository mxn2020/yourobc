// convex/lib/software/yourobc/quotes/mutations.ts
// Write operations for quotes module

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { quotesValidators } from '@/schema/software/yourobc/quotes/validators';
import {
  addressSchema,
  dimensionsSchema,
  currencyAmountSchema,
  flightDetailsSchema,
  partnerQuoteSchema,
  airlineRulesSchema,
  shipmentTypeValidator,
} from '@/schema/yourobc/base';
import { QUOTES_CONSTANTS } from './constants';
import { validateQuoteData, trimQuoteData, canSendQuote as canSendQuoteUtil, canAcceptQuote, canRejectQuote, canConvertToShipment } from './utils';
import {
  requireEditQuoteAccess,
  requireDeleteQuoteAccess,
  requireSendQuoteAccess,
  requireAcceptOrRejectQuoteAccess,
  requireConvertQuoteAccess,
} from './permissions';
import type { QuoteId } from './types';

/**
 * Get current user - helper function for authentication
 */
async function requireCurrentUser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error('Authentication required');
  }
  return {
    _id: identity.subject,
    email: identity.email,
    name: identity.name,
    role: identity.role,
  };
}

/**
 * Generate unique public ID
 */
async function generateUniquePublicId(ctx: any, tableName: string): Promise<string> {
  const prefix = tableName.replace(/([A-Z])/g, '-$1').toLowerCase().slice(1);
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Create new quote
 */
export const createQuote = mutation({
  args: {
    data: v.object({
      quoteNumber: v.string(),
      customerReference: v.optional(v.string()),
      serviceType: quotesValidators.serviceType,
      priority: quotesValidators.priority,
      customerId: v.id('yourobcCustomers'),
      inquirySourceId: v.optional(v.id('yourobcInquirySources')),
      origin: addressSchema,
      destination: addressSchema,
      dimensions: dimensionsSchema,
      description: v.string(),
      specialInstructions: v.optional(v.string()),
      deadline: v.number(),
      validUntil: v.number(),
      baseCost: v.optional(currencyAmountSchema),
      markup: v.optional(v.number()),
      totalPrice: v.optional(currencyAmountSchema),
      partnerQuotes: v.optional(v.array(partnerQuoteSchema)),
      selectedPartnerQuote: v.optional(v.id('yourobcPartners')),
      flightDetails: v.optional(flightDetailsSchema),
      shipmentType: v.optional(shipmentTypeValidator),
      incoterms: v.optional(v.string()),
      appliedAirlineRules: v.optional(airlineRulesSchema),
      assignedCourierId: v.optional(v.id('yourobcCouriers')),
      employeeId: v.optional(v.id('yourobcEmployees')),
      status: v.optional(quotesValidators.status),
      quoteText: v.optional(v.string()),
      notes: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      category: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { data }): Promise<QuoteId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. VALIDATE: Check data validity
    const errors = validateQuoteData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 3. PROCESS: Trim and prepare data
    const trimmedData = trimQuoteData(data);
    const publicId = await generateUniquePublicId(ctx, 'yourobcQuotes');
    const now = Date.now();

    // 4. CREATE: Insert into database
    const quoteId = await ctx.db.insert('yourobcQuotes', {
      publicId,
      quoteNumber: trimmedData.quoteNumber,
      customerReference: trimmedData.customerReference,
      serviceType: trimmedData.serviceType,
      priority: trimmedData.priority,
      customerId: trimmedData.customerId,
      inquirySourceId: trimmedData.inquirySourceId,
      origin: trimmedData.origin,
      destination: trimmedData.destination,
      dimensions: trimmedData.dimensions,
      description: trimmedData.description,
      specialInstructions: trimmedData.specialInstructions,
      deadline: trimmedData.deadline,
      validUntil: trimmedData.validUntil,
      baseCost: trimmedData.baseCost,
      markup: trimmedData.markup,
      totalPrice: trimmedData.totalPrice,
      partnerQuotes: trimmedData.partnerQuotes,
      selectedPartnerQuote: trimmedData.selectedPartnerQuote,
      flightDetails: trimmedData.flightDetails,
      shipmentType: trimmedData.shipmentType,
      incoterms: trimmedData.incoterms,
      appliedAirlineRules: trimmedData.appliedAirlineRules,
      assignedCourierId: trimmedData.assignedCourierId,
      employeeId: trimmedData.employeeId,
      status: trimmedData.status || 'draft',
      quoteText: trimmedData.quoteText,
      notes: trimmedData.notes,
      tags: trimmedData.tags || [],
      category: trimmedData.category,
      customFields: {},
      ownerId: user._id,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
    });

    // 5. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'quote.created',
      entityType: 'yourobc_quote',
      entityId: publicId,
      entityTitle: trimmedData.quoteNumber,
      description: `Created quote: ${trimmedData.quoteNumber}`,
      metadata: {
        status: trimmedData.status || 'draft',
        serviceType: trimmedData.serviceType,
        customerId: trimmedData.customerId,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 6. RETURN: Return entity ID
    return quoteId;
  },
});

/**
 * Update existing quote
 */
export const updateQuote = mutation({
  args: {
    quoteId: v.id('yourobcQuotes'),
    updates: v.object({
      customerReference: v.optional(v.string()),
      serviceType: v.optional(quotesValidators.serviceType),
      priority: v.optional(quotesValidators.priority),
      inquirySourceId: v.optional(v.id('yourobcInquirySources')),
      origin: v.optional(addressSchema),
      destination: v.optional(addressSchema),
      dimensions: v.optional(dimensionsSchema),
      description: v.optional(v.string()),
      specialInstructions: v.optional(v.string()),
      deadline: v.optional(v.number()),
      validUntil: v.optional(v.number()),
      baseCost: v.optional(currencyAmountSchema),
      markup: v.optional(v.number()),
      totalPrice: v.optional(currencyAmountSchema),
      partnerQuotes: v.optional(v.array(partnerQuoteSchema)),
      selectedPartnerQuote: v.optional(v.id('yourobcPartners')),
      flightDetails: v.optional(flightDetailsSchema),
      shipmentType: v.optional(shipmentTypeValidator),
      incoterms: v.optional(v.string()),
      appliedAirlineRules: v.optional(airlineRulesSchema),
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
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const quote = await ctx.db.get(quoteId);
    if (!quote || quote.deletedAt) {
      throw new Error('Quote not found');
    }

    // 3. AUTHZ: Check edit permission
    await requireEditQuoteAccess(ctx, quote, user);

    // 4. VALIDATE: Check update data validity
    const errors = validateQuoteData(updates);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 5. PROCESS: Trim and prepare update data
    const trimmedUpdates = trimQuoteData(updates);
    const now = Date.now();
    const updateData: any = {
      updatedAt: now,
      updatedBy: user._id,
    };

    // Apply updates
    if (trimmedUpdates.customerReference !== undefined) updateData.customerReference = trimmedUpdates.customerReference;
    if (trimmedUpdates.serviceType !== undefined) updateData.serviceType = trimmedUpdates.serviceType;
    if (trimmedUpdates.priority !== undefined) updateData.priority = trimmedUpdates.priority;
    if (trimmedUpdates.inquirySourceId !== undefined) updateData.inquirySourceId = trimmedUpdates.inquirySourceId;
    if (trimmedUpdates.origin !== undefined) updateData.origin = trimmedUpdates.origin;
    if (trimmedUpdates.destination !== undefined) updateData.destination = trimmedUpdates.destination;
    if (trimmedUpdates.dimensions !== undefined) updateData.dimensions = trimmedUpdates.dimensions;
    if (trimmedUpdates.description !== undefined) updateData.description = trimmedUpdates.description;
    if (trimmedUpdates.specialInstructions !== undefined) updateData.specialInstructions = trimmedUpdates.specialInstructions;
    if (trimmedUpdates.deadline !== undefined) updateData.deadline = trimmedUpdates.deadline;
    if (trimmedUpdates.validUntil !== undefined) updateData.validUntil = trimmedUpdates.validUntil;
    if (trimmedUpdates.baseCost !== undefined) updateData.baseCost = trimmedUpdates.baseCost;
    if (trimmedUpdates.markup !== undefined) updateData.markup = trimmedUpdates.markup;
    if (trimmedUpdates.totalPrice !== undefined) updateData.totalPrice = trimmedUpdates.totalPrice;
    if (trimmedUpdates.partnerQuotes !== undefined) updateData.partnerQuotes = trimmedUpdates.partnerQuotes;
    if (trimmedUpdates.selectedPartnerQuote !== undefined) updateData.selectedPartnerQuote = trimmedUpdates.selectedPartnerQuote;
    if (trimmedUpdates.flightDetails !== undefined) updateData.flightDetails = trimmedUpdates.flightDetails;
    if (trimmedUpdates.shipmentType !== undefined) updateData.shipmentType = trimmedUpdates.shipmentType;
    if (trimmedUpdates.incoterms !== undefined) updateData.incoterms = trimmedUpdates.incoterms;
    if (trimmedUpdates.appliedAirlineRules !== undefined) updateData.appliedAirlineRules = trimmedUpdates.appliedAirlineRules;
    if (trimmedUpdates.assignedCourierId !== undefined) updateData.assignedCourierId = trimmedUpdates.assignedCourierId;
    if (trimmedUpdates.employeeId !== undefined) updateData.employeeId = trimmedUpdates.employeeId;
    if (trimmedUpdates.status !== undefined) updateData.status = trimmedUpdates.status;
    if (trimmedUpdates.quoteText !== undefined) updateData.quoteText = trimmedUpdates.quoteText;
    if (trimmedUpdates.notes !== undefined) updateData.notes = trimmedUpdates.notes;
    if (trimmedUpdates.tags !== undefined) updateData.tags = trimmedUpdates.tags;
    if (trimmedUpdates.category !== undefined) updateData.category = trimmedUpdates.category;

    // 6. UPDATE: Apply changes
    await ctx.db.patch(quoteId, updateData);

    // 7. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'quote.updated',
      entityType: 'yourobc_quote',
      entityId: quote.publicId,
      entityTitle: quote.quoteNumber,
      description: `Updated quote: ${quote.quoteNumber}`,
      metadata: { changes: updates },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 8. RETURN: Return entity ID
    return quoteId;
  },
});

/**
 * Delete quote (soft delete)
 */
export const deleteQuote = mutation({
  args: {
    quoteId: v.id('yourobcQuotes'),
  },
  handler: async (ctx, { quoteId }): Promise<QuoteId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const quote = await ctx.db.get(quoteId);
    if (!quote || quote.deletedAt) {
      throw new Error('Quote not found');
    }

    // 3. AUTHZ: Check delete permission
    await requireDeleteQuoteAccess(quote, user);

    // 4. SOFT DELETE: Mark as deleted
    const now = Date.now();
    await ctx.db.patch(quoteId, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'quote.deleted',
      entityType: 'yourobc_quote',
      entityId: quote.publicId,
      entityTitle: quote.quoteNumber,
      description: `Deleted quote: ${quote.quoteNumber}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 6. RETURN: Return entity ID
    return quoteId;
  },
});

/**
 * Restore soft-deleted quote
 */
export const restoreQuote = mutation({
  args: {
    quoteId: v.id('yourobcQuotes'),
  },
  handler: async (ctx, { quoteId }): Promise<QuoteId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists and is deleted
    const quote = await ctx.db.get(quoteId);
    if (!quote) {
      throw new Error('Quote not found');
    }
    if (!quote.deletedAt) {
      throw new Error('Quote is not deleted');
    }

    // 3. AUTHZ: Check edit permission (owners and admins can restore)
    if (
      quote.ownerId !== user._id &&
      user.role !== 'admin' &&
      user.role !== 'superadmin'
    ) {
      throw new Error('You do not have permission to restore this quote');
    }

    // 4. RESTORE: Clear soft delete fields
    const now = Date.now();
    await ctx.db.patch(quoteId, {
      deletedAt: undefined,
      deletedBy: undefined,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'quote.restored',
      entityType: 'yourobc_quote',
      entityId: quote.publicId,
      entityTitle: quote.quoteNumber,
      description: `Restored quote: ${quote.quoteNumber}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 6. RETURN: Return entity ID
    return quoteId;
  },
});

/**
 * Send quote to customer
 */
export const sendQuote = mutation({
  args: {
    quoteId: v.id('yourobcQuotes'),
  },
  handler: async (ctx, { quoteId }): Promise<QuoteId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const quote = await ctx.db.get(quoteId);
    if (!quote || quote.deletedAt) {
      throw new Error('Quote not found');
    }

    // 3. AUTHZ: Check send permission
    await requireSendQuoteAccess(ctx, quote, user);

    // 4. VALIDATE: Check if quote can be sent
    if (!canSendQuoteUtil(quote)) {
      throw new Error('Quote cannot be sent. Ensure it is in draft status and has pricing information.');
    }

    // 5. UPDATE: Mark as sent
    const now = Date.now();
    await ctx.db.patch(quoteId, {
      status: 'sent',
      sentAt: now,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 6. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'quote.sent',
      entityType: 'yourobc_quote',
      entityId: quote.publicId,
      entityTitle: quote.quoteNumber,
      description: `Sent quote: ${quote.quoteNumber}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 7. RETURN: Return entity ID
    return quoteId;
  },
});

/**
 * Accept quote
 */
export const acceptQuote = mutation({
  args: {
    quoteId: v.id('yourobcQuotes'),
  },
  handler: async (ctx, { quoteId }): Promise<QuoteId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const quote = await ctx.db.get(quoteId);
    if (!quote || quote.deletedAt) {
      throw new Error('Quote not found');
    }

    // 3. AUTHZ: Check accept permission
    await requireAcceptOrRejectQuoteAccess(ctx, quote, user);

    // 4. VALIDATE: Check if quote can be accepted
    if (!canAcceptQuote(quote)) {
      throw new Error('Quote cannot be accepted. It may be expired or not in sent/pending status.');
    }

    // 5. UPDATE: Mark as accepted
    const now = Date.now();
    await ctx.db.patch(quoteId, {
      status: 'accepted',
      updatedAt: now,
      updatedBy: user._id,
    });

    // 6. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'quote.accepted',
      entityType: 'yourobc_quote',
      entityId: quote.publicId,
      entityTitle: quote.quoteNumber,
      description: `Accepted quote: ${quote.quoteNumber}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 7. RETURN: Return entity ID
    return quoteId;
  },
});

/**
 * Reject quote
 */
export const rejectQuote = mutation({
  args: {
    quoteId: v.id('yourobcQuotes'),
    rejectionReason: v.optional(v.string()),
  },
  handler: async (ctx, { quoteId, rejectionReason }): Promise<QuoteId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const quote = await ctx.db.get(quoteId);
    if (!quote || quote.deletedAt) {
      throw new Error('Quote not found');
    }

    // 3. AUTHZ: Check reject permission
    await requireAcceptOrRejectQuoteAccess(ctx, quote, user);

    // 4. VALIDATE: Check if quote can be rejected
    if (!canRejectQuote(quote)) {
      throw new Error('Quote cannot be rejected. It may not be in sent/pending status.');
    }

    // 5. UPDATE: Mark as rejected
    const now = Date.now();
    await ctx.db.patch(quoteId, {
      status: 'rejected',
      rejectionReason: rejectionReason?.trim(),
      updatedAt: now,
      updatedBy: user._id,
    });

    // 6. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'quote.rejected',
      entityType: 'yourobc_quote',
      entityId: quote.publicId,
      entityTitle: quote.quoteNumber,
      description: `Rejected quote: ${quote.quoteNumber}${rejectionReason ? ` - Reason: ${rejectionReason}` : ''}`,
      metadata: { rejectionReason },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 7. RETURN: Return entity ID
    return quoteId;
  },
});

/**
 * Convert accepted quote to shipment
 */
export const convertQuoteToShipment = mutation({
  args: {
    quoteId: v.id('yourobcQuotes'),
  },
  handler: async (ctx, { quoteId }) => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const quote = await ctx.db.get(quoteId);
    if (!quote || quote.deletedAt) {
      throw new Error('Quote not found');
    }

    // 3. AUTHZ: Check convert permission
    await requireConvertQuoteAccess(ctx, quote, user);

    // 4. VALIDATE: Check if quote can be converted
    if (!canConvertToShipment(quote)) {
      throw new Error('Quote cannot be converted. It must be accepted and not already converted.');
    }

    // 5. CREATE SHIPMENT: This is a placeholder - actual implementation would create a shipment
    // For now, we'll just mark the quote as converted with a placeholder shipment ID
    const now = Date.now();
    const shipmentId = await ctx.db.insert('yourobcShipments', {
      // This would be filled with actual shipment data from the quote
      publicId: await generateUniquePublicId(ctx, 'yourobcShipments'),
      ownerId: quote.ownerId,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
      // ... other shipment fields would be populated from quote
    } as any);

    // 6. UPDATE: Mark quote as converted
    await ctx.db.patch(quoteId, {
      convertedToShipmentId: shipmentId,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 7. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'quote.converted',
      entityType: 'yourobc_quote',
      entityId: quote.publicId,
      entityTitle: quote.quoteNumber,
      description: `Converted quote ${quote.quoteNumber} to shipment`,
      metadata: { shipmentId },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 8. RETURN: Return shipment ID
    return { quoteId, shipmentId };
  },
});
