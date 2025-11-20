// convex/lib/yourobc/quotes/mutations.ts
// convex/yourobc/quotes/mutations.ts

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';
import { QUOTE_CONSTANTS } from './constants';
import { validateQuoteData, generateQuoteNumber, calculateTotalPrice, validateQuoteWorkflow } from './utils';
import {
  dimensionUnitValidator,
  weightUnitValidator,
  currencyValidator,
  quoteServiceTypeValidator,
  servicePriorityValidator,
  quoteStatusValidator,
} from '../../../schema/yourobc/base';

const addressSchema = v.object({
  street: v.optional(v.string()),
  city: v.string(),
  postalCode: v.optional(v.string()),
  country: v.string(),
  countryCode: v.string(),
});

const dimensionsSchema = v.object({
  length: v.number(),
  width: v.number(),
  height: v.number(),
  weight: v.number(),
  unit: dimensionUnitValidator,
  weightUnit: weightUnitValidator,
});

const currencyAmountSchema = v.object({
  amount: v.number(),
  currency: currencyValidator,
  exchangeRate: v.optional(v.number()),
  exchangeRateDate: v.optional(v.number()),
});

const flightDetailsSchema = v.object({
  flightNumber: v.optional(v.string()),
  airline: v.optional(v.string()),
  departureTime: v.optional(v.number()),
  arrivalTime: v.optional(v.number()),
});

const partnerQuoteSchema = v.object({
  partnerId: v.id('yourobcPartners'),
  partnerName: v.string(),
  quotedPrice: currencyAmountSchema,
  transitTime: v.optional(v.number()),
  validUntil: v.optional(v.number()),
  receivedAt: v.number(),
});

export const createQuote = mutation({
  args: {
    authUserId: v.string(),
    data: v.object({
      customerReference: v.optional(v.string()),
      serviceType: quoteServiceTypeValidator,
      priority: servicePriorityValidator,
      customerId: v.id('yourobcCustomers'),
      inquirySourceId: v.optional(v.id('yourobcInquirySources')),
      origin: addressSchema,
      destination: addressSchema,
      dimensions: dimensionsSchema,
      description: v.string(),
      specialInstructions: v.optional(v.string()),
      deadline: v.number(),
      baseCost: v.optional(currencyAmountSchema),
      markup: v.optional(v.number()),
      totalPrice: v.optional(currencyAmountSchema),
      partnerQuotes: v.optional(v.array(partnerQuoteSchema)),
      selectedPartnerQuote: v.optional(v.id('yourobcPartners')),
      flightDetails: v.optional(flightDetailsSchema),
      assignedCourierId: v.optional(v.id('yourobcCouriers')),
      validUntil: v.optional(v.number()),
      quoteText: v.optional(v.string()),
      notes: v.optional(v.string()),
    })
  },
  handler: async (ctx, { authUserId, data }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, QUOTE_CONSTANTS.PERMISSIONS.CREATE);

    const errors = validateQuoteData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // Validate customer exists
    const customer = await ctx.db.get(data.customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    // Validate inquiry source if provided
    if (data.inquirySourceId) {
      const inquirySource = await ctx.db.get(data.inquirySourceId);
      if (!inquirySource) {
        throw new Error('Inquiry source not found');
      }
    }

    // Validate assigned courier if provided
    if (data.assignedCourierId) {
      const courier = await ctx.db.get(data.assignedCourierId);
      if (!courier) {
        throw new Error('Assigned courier not found');
      }
    }

    // Validate selected partner if provided
    if (data.selectedPartnerQuote) {
      const partner = await ctx.db.get(data.selectedPartnerQuote);
      if (!partner) {
        throw new Error('Selected partner not found');
      }
    }

    // Generate quote number
    const existingQuotes = await ctx.db.query('yourobcQuotes').collect();
    const quoteNumber = generateQuoteNumber(existingQuotes.length + 1);

    // Set default valid until date if not provided
    const validUntil = data.validUntil || (Date.now() + (QUOTE_CONSTANTS.DEFAULT_VALUES.VALIDITY_DAYS * 24 * 60 * 60 * 1000));

    // Calculate total price if base cost and markup are provided
    let totalPrice = data.totalPrice;
    if (data.baseCost && data.markup !== undefined && !totalPrice) {
      totalPrice = calculateTotalPrice(data.baseCost, data.markup);
    }

    const now = Date.now();

    const quoteData = {
      quoteNumber,
      customerReference: data.customerReference?.trim(),
      serviceType: data.serviceType,
      priority: data.priority,
      customerId: data.customerId,
      inquirySourceId: data.inquirySourceId,
      origin: data.origin,
      destination: data.destination,
      dimensions: data.dimensions,
      description: data.description.trim(),
      specialInstructions: data.specialInstructions?.trim(),
      deadline: data.deadline,
      baseCost: data.baseCost,
      markup: data.markup,
      totalPrice,
      partnerQuotes: data.partnerQuotes || [],
      selectedPartnerQuote: data.selectedPartnerQuote,
      flightDetails: data.flightDetails,
      assignedCourierId: data.assignedCourierId,
      status: QUOTE_CONSTANTS.STATUS.DRAFT,
      validUntil,
      sentAt: undefined,
      quoteText: data.quoteText?.trim(),
      notes: data.notes?.trim(),
      convertedToShipmentId: undefined,
      rejectionReason: undefined,
      tags: [],
      createdAt: now,
      updatedAt: now,
      createdBy: authUserId,
    };

    const quoteId = await ctx.db.insert('yourobcQuotes', quoteData);

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'quote.created',
      entityType: 'yourobc_quote',
      entityId: quoteId,
      entityTitle: `Quote ${quoteNumber}`,
      description: `Created quote for ${customer.companyName}`,
      createdAt: now,
    });

    return quoteId;
  },
});

export const updateQuote = mutation({
  args: {
    authUserId: v.string(),
    quoteId: v.id('yourobcQuotes'),
    data: v.object({
      customerReference: v.optional(v.string()),
      serviceType: v.optional(quoteServiceTypeValidator),
      priority: v.optional(servicePriorityValidator),
      origin: v.optional(addressSchema),
      destination: v.optional(addressSchema),
      dimensions: v.optional(dimensionsSchema),
      description: v.optional(v.string()),
      specialInstructions: v.optional(v.string()),
      deadline: v.optional(v.number()),
      baseCost: v.optional(currencyAmountSchema),
      markup: v.optional(v.number()),
      totalPrice: v.optional(currencyAmountSchema),
      partnerQuotes: v.optional(v.array(partnerQuoteSchema)),
      selectedPartnerQuote: v.optional(v.id('yourobcPartners')),
      flightDetails: v.optional(flightDetailsSchema),
      assignedCourierId: v.optional(v.id('yourobcCouriers')),
      status: v.optional(quoteStatusValidator),
      validUntil: v.optional(v.number()),
      quoteText: v.optional(v.string()),
      notes: v.optional(v.string()),
      rejectionReason: v.optional(v.string()),
    })
  },
  handler: async (ctx, { authUserId, quoteId, data }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, QUOTE_CONSTANTS.PERMISSIONS.EDIT);

    const quote = await ctx.db.get(quoteId);
    if (!quote) {
      throw new Error('Quote not found');
    }

    const errors = validateQuoteData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // Validate workflow if status is being changed
    if (data.status && data.status !== quote.status) {
      const workflowErrors = validateQuoteWorkflow(quote, data.status);
      if (workflowErrors.length > 0) {
        throw new Error(`Workflow validation failed: ${workflowErrors.join(', ')}`);
      }
    }

    // Validate assigned courier if provided
    if (data.assignedCourierId) {
      const courier = await ctx.db.get(data.assignedCourierId);
      if (!courier) {
        throw new Error('Assigned courier not found');
      }
    }

    // Validate selected partner if provided
    if (data.selectedPartnerQuote) {
      const partner = await ctx.db.get(data.selectedPartnerQuote);
      if (!partner) {
        throw new Error('Selected partner not found');
      }
    }

    const now = Date.now();
    const updateData: Record<string, unknown> = {
      ...data,
      updatedAt: now,
    };

    // Trim string fields
    if (data.customerReference !== undefined) updateData.customerReference = data.customerReference?.trim();
    if (data.description !== undefined) updateData.description = data.description?.trim();
    if (data.specialInstructions !== undefined) updateData.specialInstructions = data.specialInstructions?.trim();
    if (data.quoteText !== undefined) updateData.quoteText = data.quoteText?.trim();
    if (data.notes !== undefined) updateData.notes = data.notes?.trim();
    if (data.rejectionReason !== undefined) updateData.rejectionReason = data.rejectionReason?.trim();

    // Set sentAt timestamp when status changes to sent
    if (data.status === QUOTE_CONSTANTS.STATUS.SENT && quote.status !== QUOTE_CONSTANTS.STATUS.SENT) {
      updateData.sentAt = now;
    }

    // Calculate total price if base cost and markup are updated
    if ((data.baseCost || data.markup !== undefined) && !data.totalPrice) {
      const baseCost = data.baseCost || quote.baseCost;
      const markup = data.markup !== undefined ? data.markup : quote.markup;
      
      if (baseCost && markup !== undefined) {
        updateData.totalPrice = calculateTotalPrice(baseCost, markup);
      }
    }

    await ctx.db.patch(quoteId, updateData);

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'quote.updated',
      entityType: 'yourobc_quote',
      entityId: quoteId,
      entityTitle: `Quote ${quote.quoteNumber}`,
      description: `Updated quote`,
      createdAt: now,
    });

    return quoteId;
  },
});

export const sendQuote = mutation({
  args: {
    authUserId: v.string(),
    quoteId: v.id('yourobcQuotes'),
    quoteText: v.string(),
    emailData: v.optional(v.object({
      to: v.array(v.string()),
      cc: v.optional(v.array(v.string())),
      subject: v.optional(v.string()),
      message: v.optional(v.string()),
    })),
  },
  handler: async (ctx, { authUserId, quoteId, quoteText, emailData }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, QUOTE_CONSTANTS.PERMISSIONS.SEND);

    const quote = await ctx.db.get(quoteId);
    if (!quote) {
      throw new Error('Quote not found');
    }

    if (quote.status !== QUOTE_CONSTANTS.STATUS.DRAFT) {
      throw new Error('Only draft quotes can be sent');
    }

    if (!quote.totalPrice) {
      throw new Error('Total price is required to send quote');
    }

    // Validate email data if provided
    if (emailData) {
      if (emailData.to.length === 0) {
        throw new Error('At least one recipient email is required');
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      for (const email of emailData.to) {
        if (!emailRegex.test(email)) {
          throw new Error(`Invalid email address: ${email}`);
        }
      }

      if (emailData.cc) {
        for (const email of emailData.cc) {
          if (!emailRegex.test(email)) {
            throw new Error(`Invalid CC email address: ${email}`);
          }
        }
      }
    }

    const now = Date.now();

    await ctx.db.patch(quoteId, {
      status: QUOTE_CONSTANTS.STATUS.SENT,
      quoteText: quoteText.trim(),
      sentAt: now,
      updatedAt: now,
    });

    // TODO: Integrate with email service to send the quote
    // This would typically call an email service API (e.g., SendGrid, AWS SES, etc.)
    // For now, we just log the email data
    if (emailData) {
      console.log('Email would be sent to:', emailData.to);
      console.log('Subject:', emailData.subject || `Quote ${quote.quoteNumber}`);
      console.log('Message:', emailData.message || 'Please find the quote attached.');
    }

    const description = emailData
      ? `Sent quote to ${emailData.to.join(', ')}`
      : `Sent quote to customer`;

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'quote.sent',
      entityType: 'yourobc_quote',
      entityId: quoteId,
      entityTitle: `Quote ${quote.quoteNumber}`,
      description,
      createdAt: now,
    });

    return quoteId;
  },
});

export const acceptQuote = mutation({
  args: {
    authUserId: v.string(),
    quoteId: v.id('yourobcQuotes'),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { authUserId, quoteId, notes }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, QUOTE_CONSTANTS.PERMISSIONS.EDIT);

    const quote = await ctx.db.get(quoteId);
    if (!quote) {
      throw new Error('Quote not found');
    }

    if (quote.status !== QUOTE_CONSTANTS.STATUS.SENT) {
      throw new Error('Only sent quotes can be accepted');
    }

    if (quote.validUntil <= Date.now()) {
      throw new Error('Cannot accept expired quote');
    }

    const now = Date.now();

    await ctx.db.patch(quoteId, {
      status: QUOTE_CONSTANTS.STATUS.ACCEPTED,
      notes: notes?.trim(),
      updatedAt: now,
    });

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'quote.accepted',
      entityType: 'yourobc_quote',
      entityId: quoteId,
      entityTitle: `Quote ${quote.quoteNumber}`,
      description: `Accepted quote`,
      createdAt: now,
    });

    return quoteId;
  },
});

export const rejectQuote = mutation({
  args: {
    authUserId: v.string(),
    quoteId: v.id('yourobcQuotes'),
    rejectionReason: v.string(),
  },
  handler: async (ctx, { authUserId, quoteId, rejectionReason }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, QUOTE_CONSTANTS.PERMISSIONS.EDIT);

    const quote = await ctx.db.get(quoteId);
    if (!quote) {
      throw new Error('Quote not found');
    }

    if (quote.status !== QUOTE_CONSTANTS.STATUS.SENT) {
      throw new Error('Only sent quotes can be rejected');
    }

    const now = Date.now();

    await ctx.db.patch(quoteId, {
      status: QUOTE_CONSTANTS.STATUS.REJECTED,
      rejectionReason: rejectionReason.trim(),
      updatedAt: now,
    });

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'quote.rejected',
      entityType: 'yourobc_quote',
      entityId: quoteId,
      entityTitle: `Quote ${quote.quoteNumber}`,
      description: `Rejected quote: ${rejectionReason}`,
      createdAt: now,
    });

    return quoteId;
  },
});

export const deleteQuote = mutation({
  args: {
    authUserId: v.string(),
    quoteId: v.id('yourobcQuotes'),
  },
  handler: async (ctx, { authUserId, quoteId }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, QUOTE_CONSTANTS.PERMISSIONS.DELETE);

    const quote = await ctx.db.get(quoteId);
    if (!quote) {
      throw new Error('Quote not found');
    }

    if (quote.convertedToShipmentId) {
      throw new Error('Cannot delete quote that has been converted to shipment');
    }

    if (quote.status === QUOTE_CONSTANTS.STATUS.ACCEPTED) {
      throw new Error('Cannot delete accepted quote');
    }

    const now = Date.now();
    // Soft delete: mark as deleted instead of removing
    await ctx.db.patch(quoteId, {
      deletedAt: now,
      deletedBy: authUserId,
    });
    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'quote.deleted',
      entityType: 'yourobc_quote',
      entityId: quoteId,
      entityTitle: `Quote ${quote.quoteNumber}`,
      description: `Deleted quote`,
      createdAt: now,
    });

    return quoteId;
  },
});

export const addPartnerQuote = mutation({
  args: {
    authUserId: v.string(),
    quoteId: v.id('yourobcQuotes'),
    partnerQuote: partnerQuoteSchema,
  },
  handler: async (ctx, { authUserId, quoteId, partnerQuote }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, QUOTE_CONSTANTS.PERMISSIONS.EDIT);

    const quote = await ctx.db.get(quoteId);
    if (!quote) {
      throw new Error('Quote not found');
    }

    const partner = await ctx.db.get(partnerQuote.partnerId);
    if (!partner) {
      throw new Error('Partner not found');
    }

    const updatedPartnerQuotes = [...(quote.partnerQuotes || []), partnerQuote];

    if (updatedPartnerQuotes.length > QUOTE_CONSTANTS.LIMITS.MAX_PARTNER_QUOTES) {
      throw new Error(`Maximum ${QUOTE_CONSTANTS.LIMITS.MAX_PARTNER_QUOTES} partner quotes allowed`);
    }

    const now = Date.now();

    await ctx.db.patch(quoteId, {
      partnerQuotes: updatedPartnerQuotes,
      updatedAt: now,
    });

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'quote.partner_quote_added',
      entityType: 'yourobc_quote',
      entityId: quoteId,
      entityTitle: `Quote ${quote.quoteNumber}`,
      description: `Added partner quote from ${partner.companyName}`,
      createdAt: now,
    });

    return quoteId;
  },
});

export const updateQuoteStatus = mutation({
  args: {
    authUserId: v.string(),
    quoteId: v.id('yourobcQuotes'),
    status: quoteStatusValidator,
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { authUserId, quoteId, status, notes }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, QUOTE_CONSTANTS.PERMISSIONS.EDIT);

    const quote = await ctx.db.get(quoteId);
    if (!quote) {
      throw new Error('Quote not found');
    }

    // Validate workflow if status is being changed
    if (status !== quote.status) {
      const workflowErrors = validateQuoteWorkflow(quote, status);
      if (workflowErrors.length > 0) {
        throw new Error(`Workflow validation failed: ${workflowErrors.join(', ')}`);
      }
    }

    // Additional validation for accepted quotes
    if (status === QUOTE_CONSTANTS.STATUS.ACCEPTED) {
      if (quote.status !== QUOTE_CONSTANTS.STATUS.SENT) {
        throw new Error('Only sent quotes can be accepted');
      }
      if (quote.validUntil <= Date.now()) {
        throw new Error('Cannot accept expired quote');
      }
    }

    // Additional validation for rejected quotes
    if (status === QUOTE_CONSTANTS.STATUS.REJECTED) {
      if (quote.status !== QUOTE_CONSTANTS.STATUS.SENT) {
        throw new Error('Only sent quotes can be rejected');
      }
    }

    const now = Date.now();
    const updateData: Record<string, unknown> = {
      status,
      updatedAt: now,
    };

    // Add notes if provided
    if (notes !== undefined) {
      updateData.notes = notes.trim();
    }

    // Set sentAt timestamp when status changes to sent
    if (status === QUOTE_CONSTANTS.STATUS.SENT && quote.status !== QUOTE_CONSTANTS.STATUS.SENT) {
      updateData.sentAt = now;
    }

    await ctx.db.patch(quoteId, updateData);

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'quote.status_updated',
      entityType: 'yourobc_quote',
      entityId: quoteId,
      entityTitle: `Quote ${quote.quoteNumber}`,
      description: `Updated quote status to ${status}`,
      createdAt: now,
    });

    return quoteId;
  },
});

export const convertQuoteToShipment = mutation({
  args: {
    authUserId: v.string(),
    quoteId: v.id('yourobcQuotes'),
  },
  handler: async (ctx, { authUserId, quoteId }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, QUOTE_CONSTANTS.PERMISSIONS.CONVERT);

    const quote = await ctx.db.get(quoteId);
    if (!quote) {
      throw new Error('Quote not found');
    }

    // Only accepted quotes can be converted
    if (quote.status !== QUOTE_CONSTANTS.STATUS.ACCEPTED) {
      throw new Error('Only accepted quotes can be converted to shipments');
    }

    // Check if already converted
    if (quote.convertedToShipmentId) {
      throw new Error('Quote has already been converted to a shipment');
    }

    // Check if total price is set
    if (!quote.totalPrice) {
      throw new Error('Quote must have a total price to be converted');
    }

    // Validate customer exists
    const customer = await ctx.db.get(quote.customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    // Generate shipment number
    const existingShipments = await ctx.db
      .query('yourobcShipments')
      .filter((q) => q.eq(q.field('serviceType'), quote.serviceType))
      .collect();

    const shipmentNumberPrefix = quote.serviceType;
    const sequence = existingShipments.length + 1;
    const shipmentNumber = `${shipmentNumberPrefix}-${String(sequence).padStart(6, '0')}`;

    // Calculate SLA
    const now = Date.now();
    const remainingHours = Math.max(0, Math.ceil((quote.deadline - now) / (1000 * 60 * 60)));
    const warningThreshold = 24; // 24 hours warning

    let slaStatus: 'on_time' | 'warning' | 'overdue' = 'on_time';
    if (now > quote.deadline) {
      slaStatus = 'overdue';
    } else if (remainingHours <= warningThreshold) {
      slaStatus = 'warning';
    }

    // Create next task for new shipment
    const nextTask = {
      description: 'Arrange pickup with courier',
      dueDate: now + (2 * 60 * 60 * 1000), // 2 hours
      priority: quote.priority,
    };

    // Create shipment from quote
    const shipmentData = {
      shipmentNumber,
      customerReference: quote.customerReference,
      quoteId,
      customerId: quote.customerId,
      serviceType: quote.serviceType,
      priority: quote.priority,
      origin: quote.origin,
      destination: quote.destination,
      dimensions: quote.dimensions,
      description: quote.description,
      specialInstructions: quote.specialInstructions,
      currentStatus: 'booked' as const,
      sla: {
        deadline: quote.deadline,
        status: slaStatus,
        remainingHours: remainingHours > 0 ? remainingHours : undefined,
      },
      nextTask,
      assignedCourierId: quote.assignedCourierId,
      employeeId: quote.employeeId, // Transfer employee assignment
      partnerId: quote.selectedPartnerQuote,
      agreedPrice: quote.totalPrice,
      // Transfer flight details to routing if present (OBC service type)
      routing: quote.flightDetails ? {
        outboundFlight: quote.flightDetails,
      } : undefined,
      tags: [],
      createdAt: now,
      updatedAt: now,
      createdBy: authUserId,
    };

    const shipmentId = await ctx.db.insert('yourobcShipments', shipmentData);

    // Create initial status history entry
    await ctx.db.insert('yourobcShipmentStatusHistory', {
      shipmentId,
      status: 'booked',
      timestamp: now,
      notes: `Converted from quote ${quote.quoteNumber}`,
      createdAt: now,
      createdBy: authUserId,
    });

    // Update quote with shipment reference
    await ctx.db.patch(quoteId, {
      convertedToShipmentId: shipmentId,
      updatedAt: now,
    });

    // Create audit log for quote
    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'quote.converted_to_shipment',
      entityType: 'yourobc_quote',
      entityId: quoteId,
      entityTitle: `Quote ${quote.quoteNumber}`,
      description: `Converted to shipment ${shipmentNumber}`,
      createdAt: now,
    });

    // Create audit log for shipment
    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'shipment.created_from_quote',
      entityType: 'yourobc_shipment',
      entityId: shipmentId,
      entityTitle: `Shipment ${shipmentNumber}`,
      description: `Created from quote ${quote.quoteNumber}`,
      createdAt: now,
    });

    return shipmentId;
  },
});

export const updatePricing = mutation({
  args: {
    authUserId: v.string(),
    quoteId: v.id('yourobcQuotes'),
    baseCost: currencyAmountSchema,
    markup: v.number(),
    selectedPartnerQuote: v.optional(v.id('yourobcPartners')),
  },
  handler: async (ctx, { authUserId, quoteId, baseCost, markup, selectedPartnerQuote }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, QUOTE_CONSTANTS.PERMISSIONS.EDIT_COSTS);

    const quote = await ctx.db.get(quoteId);
    if (!quote) {
      throw new Error('Quote not found');
    }

    if (markup < QUOTE_CONSTANTS.LIMITS.MIN_MARKUP || markup > QUOTE_CONSTANTS.LIMITS.MAX_MARKUP) {
      throw new Error(`Markup must be between ${QUOTE_CONSTANTS.LIMITS.MIN_MARKUP}% and ${QUOTE_CONSTANTS.LIMITS.MAX_MARKUP}%`);
    }

    if (selectedPartnerQuote) {
      const partner = await ctx.db.get(selectedPartnerQuote);
      if (!partner) {
        throw new Error('Selected partner not found');
      }
    }

    const totalPrice = calculateTotalPrice(baseCost, markup);
    const now = Date.now();

    await ctx.db.patch(quoteId, {
      baseCost,
      markup,
      totalPrice,
      selectedPartnerQuote,
      updatedAt: now,
    });

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'quote.pricing_updated',
      entityType: 'yourobc_quote',
      entityId: quoteId,
      entityTitle: `Quote ${quote.quoteNumber}`,
      description: `Updated pricing: ${totalPrice.amount} ${totalPrice.currency}`,
      createdAt: now,
    });

    return quoteId;
  },
});

/**
 * Convert quote currency
 * Converts all pricing in a quote from one currency to another
 */
export const convertQuoteCurrency = mutation({
  args: {
    authUserId: v.string(),
    quoteId: v.id('yourobcQuotes'),
    targetCurrency: currencyValidator,
  },
  handler: async (ctx, { authUserId, quoteId, targetCurrency }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, QUOTE_CONSTANTS.PERMISSIONS.EDIT_COSTS);

    const quote = await ctx.db.get(quoteId);
    if (!quote) {
      throw new Error('Quote not found');
    }

    // If already in target currency, no conversion needed
    if (quote.totalPrice?.currency === targetCurrency) {
      return { success: true, message: 'Already in target currency', exchangeRate: 1.0 };
    }

    // Get exchange rate (simplified - in production, use a real API)
    const sourceCurrency = quote.totalPrice?.currency || quote.baseCost?.currency || 'EUR';
    const exchangeRate = await getExchangeRate(ctx, sourceCurrency, targetCurrency);

    const now = Date.now();
    const updates: any = {
      updatedAt: now,
      updatedBy: authUserId,
    };

    // Convert base cost
    if (quote.baseCost) {
      const convertedAmount = Math.round(quote.baseCost.amount * exchangeRate * 100) / 100;
      updates.baseCost = {
        amount: convertedAmount,
        currency: targetCurrency,
        exchangeRate,
        exchangeRateDate: now,
      };
    }

    // Convert total price
    if (quote.totalPrice) {
      const convertedAmount = Math.round(quote.totalPrice.amount * exchangeRate * 100) / 100;
      updates.totalPrice = {
        amount: convertedAmount,
        currency: targetCurrency,
        exchangeRate,
        exchangeRateDate: now,
      };
    }

    // Update the quote
    await ctx.db.patch(quoteId, updates);

    // Audit log
    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'quote.currency_converted',
      entityType: 'yourobc_quote',
      entityId: quoteId,
      entityTitle: `Quote ${quote.quoteNumber}`,
      description: `Converted currency from ${sourceCurrency} to ${targetCurrency} (rate: ${exchangeRate})`,
      createdAt: now,
    });

    return {
      success: true,
      exchangeRate,
      baseCost: updates.baseCost,
      totalPrice: updates.totalPrice,
    };
  },
});

/**
 * Helper function to get exchange rate
 * In production, replace with real exchange rate API
 */
async function getExchangeRate(
  ctx: any,
  from: 'EUR' | 'USD',
  to: 'EUR' | 'USD'
): Promise<number> {
  if (from === to) return 1.0;

  // Approximate rates - replace with real API in production
  const rates: Record<string, number> = {
    'EUR->USD': 1.10,
    'USD->EUR': 0.91,
  };

  const key = `${from}->${to}`;
  return rates[key] || 1.0;
}