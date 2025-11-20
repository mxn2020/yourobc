// convex/lib/yourobc/customers/mutations.ts
/**
 * Customer Mutations
 *
 * This module contains all mutation functions for managing customers in the YourOBC system.
 * Following the template pattern, all validators are imported from schema/yourobc/base.
 *
 * @module convex/lib/yourobc/customers/mutations
 */

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';
import { CUSTOMER_CONSTANTS } from './constants';
import { validateCustomerData, generateCustomerNumber } from './utils';
import {
  contactSchema,
  addressSchema,
  customerStatusValidator,
  currencyValidator,
  paymentMethodValidator,
} from '../../../schema/yourobc/base';

/**
 * Creates a new customer in the YourOBC system.
 *
 * @param authUserId - The ID of the authenticated user
 * @param data - Customer creation data
 * @returns The ID of the newly created customer
 * @throws {Error} If validation fails or company name already exists
 */
export const createCustomer = mutation({
  args: {
    authUserId: v.string(),
    data: v.object({
      companyName: v.string(),
      shortName: v.optional(v.string()),
      primaryContact: contactSchema,
      additionalContacts: v.optional(v.array(contactSchema)),
      billingAddress: addressSchema,
      shippingAddress: v.optional(addressSchema),
      defaultCurrency: v.optional(currencyValidator),
      paymentTerms: v.optional(v.number()),
      paymentMethod: v.optional(paymentMethodValidator),
      margin: v.optional(v.number()),
      inquirySourceId: v.optional(v.id('yourobcInquirySources')),
      tags: v.optional(v.array(v.string())),
      notes: v.optional(v.string()),
      internalNotes: v.optional(v.string()),
      website: v.optional(v.string()),
    })
  },
  handler: async (ctx, { authUserId, data }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, CUSTOMER_CONSTANTS.PERMISSIONS.CREATE);

    const errors = validateCustomerData(data as any);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // Check for duplicate company name
    const existing = await ctx.db
      .query('yourobcCustomers')
      .withIndex('by_companyName', (q) => q.eq('companyName', data.companyName.trim()))
      .first();

    if (existing) {
      throw new Error('A customer with this company name already exists');
    }

    // Validate inquiry source if provided
    if (data.inquirySourceId) {
      const inquirySource = await ctx.db.get(data.inquirySourceId);
      if (!inquirySource) {
        throw new Error('Inquiry source not found');
      }
    }

    const now = Date.now();

    const customerData = {
      companyName: data.companyName.trim(),
      shortName: data.shortName?.trim(),
      status: CUSTOMER_CONSTANTS.STATUS.ACTIVE,
      tags: data.tags || [],
      primaryContact: {
        ...data.primaryContact,
        name: data.primaryContact.name.trim(),
        email: data.primaryContact.email?.trim(),
        phone: data.primaryContact.phone?.trim(),
      },
      additionalContacts: data.additionalContacts?.map(contact => ({
        ...contact,
        name: contact.name.trim(),
        email: contact.email?.trim(),
        phone: contact.phone?.trim(),
      })) || [],
      billingAddress: data.billingAddress,
      shippingAddress: data.shippingAddress,
      defaultCurrency: data.defaultCurrency || CUSTOMER_CONSTANTS.DEFAULT_VALUES.CURRENCY,
      paymentTerms: data.paymentTerms ?? CUSTOMER_CONSTANTS.DEFAULT_VALUES.PAYMENT_TERMS,
      paymentMethod: data.paymentMethod || CUSTOMER_CONSTANTS.DEFAULT_VALUES.PAYMENT_METHOD,
      margin: data.margin ?? CUSTOMER_CONSTANTS.DEFAULT_VALUES.MARGIN,
      inquirySourceId: data.inquirySourceId,
      stats: {
        totalQuotes: 0,
        acceptedQuotes: 0,
        totalRevenue: 0,
      },
      notes: data.notes?.trim(),
      internalNotes: data.internalNotes?.trim(),
      website: data.website?.trim(),
      createdAt: now,
      updatedAt: now,
      createdBy: authUserId,
    };

    const customerId = await ctx.db.insert('yourobcCustomers', customerData);

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'customer.created',
      entityType: 'yourobc_customer',
      entityId: customerId,
      entityTitle: data.companyName.trim(),
      description: `Created customer: ${data.companyName.trim()}`,
      createdAt: now,
    });

    return customerId;
  },
});

/**
 * Updates an existing customer's information.
 *
 * @param authUserId - The ID of the authenticated user
 * @param customerId - The ID of the customer to update
 * @param data - Partial customer data to update
 * @returns The ID of the updated customer
 * @throws {Error} If validation fails, customer not found, or company name conflict
 */
export const updateCustomer = mutation({
  args: {
    authUserId: v.string(),
    customerId: v.id('yourobcCustomers'),
    data: v.object({
      companyName: v.optional(v.string()),
      shortName: v.optional(v.string()),
      status: v.optional(customerStatusValidator),
      primaryContact: v.optional(contactSchema),
      additionalContacts: v.optional(v.array(contactSchema)),
      billingAddress: v.optional(addressSchema),
      shippingAddress: v.optional(addressSchema),
      defaultCurrency: v.optional(currencyValidator),
      paymentTerms: v.optional(v.number()),
      paymentMethod: v.optional(paymentMethodValidator),
      margin: v.optional(v.number()),
      inquirySourceId: v.optional(v.id('yourobcInquirySources')),
      tags: v.optional(v.array(v.string())),
      notes: v.optional(v.string()),
      internalNotes: v.optional(v.string()),
      website: v.optional(v.string()),
    })
  },
  handler: async (ctx, { authUserId, customerId, data }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, CUSTOMER_CONSTANTS.PERMISSIONS.EDIT);

    const customer = await ctx.db.get(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    const errors = validateCustomerData(data as any);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // Check for duplicate company name if changed
    if (data.companyName && data.companyName.trim() !== customer.companyName) {
      const companyName = data.companyName.trim();
      
      const existing = await ctx.db
        .query('yourobcCustomers')
        .withIndex('by_companyName', (q) => q.eq('companyName', companyName))
        .first();

      if (existing && existing._id !== customerId) {
        throw new Error('A customer with this company name already exists');
      }
    }

    // Validate inquiry source if provided
    if (data.inquirySourceId) {
      const inquirySource = await ctx.db.get(data.inquirySourceId);
      if (!inquirySource) {
        throw new Error('Inquiry source not found');
      }
    }

    const now = Date.now();
    const updateData: Record<string, unknown> = {
      ...data,
      updatedAt: now,
    };
    
    // Trim string fields
    if (data.companyName) updateData.companyName = data.companyName.trim();
    if (data.shortName) updateData.shortName = data.shortName.trim();
    if (data.notes) updateData.notes = data.notes.trim();
    if (data.internalNotes) updateData.internalNotes = data.internalNotes.trim();
    if (data.website) updateData.website = data.website.trim();

    // Process contacts
    if (data.primaryContact) {
      updateData.primaryContact = {
        ...data.primaryContact,
        name: data.primaryContact.name.trim(),
        email: data.primaryContact.email?.trim(),
        phone: data.primaryContact.phone?.trim(),
      };
    }

    if (data.additionalContacts) {
      updateData.additionalContacts = data.additionalContacts.map(contact => ({
        ...contact,
        name: contact.name.trim(),
        email: contact.email?.trim(),
        phone: contact.phone?.trim(),
      }));
    }

    await ctx.db.patch(customerId, updateData);

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'customer.updated',
      entityType: 'yourobc_customer',
      entityId: customerId,
      entityTitle: customer.companyName,
      description: `Updated customer: ${customer.companyName}`,
      createdAt: now,
    });

    return customerId;
  },
});

/**
 * Soft deletes a customer from the system.
 * Prevents deletion if customer has associated quotes, shipments, or invoices.
 *
 * @param authUserId - The ID of the authenticated user
 * @param customerId - The ID of the customer to delete
 * @returns The ID of the deleted customer
 * @throws {Error} If customer not found or has existing business records
 */
export const deleteCustomer = mutation({
  args: {
    authUserId: v.string(),
    customerId: v.id('yourobcCustomers'),
  },
  handler: async (ctx, { authUserId, customerId }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, CUSTOMER_CONSTANTS.PERMISSIONS.DELETE);

    const customer = await ctx.db.get(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    // Check if customer has quotes
    const hasQuotes = await ctx.db
      .query('yourobcQuotes')
      .withIndex('by_customer', (q) => q.eq('customerId', customerId))
      .first();

    if (hasQuotes) {
      throw new Error('Cannot delete customer with existing quotes. Set status to inactive instead.');
    }

    // Check if customer has shipments
    const hasShipments = await ctx.db
      .query('yourobcShipments')
      .withIndex('by_customer', (q) => q.eq('customerId', customerId))
      .first();

    if (hasShipments) {
      throw new Error('Cannot delete customer with existing shipments. Set status to inactive instead.');
    }

    // Check if customer has invoices
    const hasInvoices = await ctx.db
      .query('yourobcInvoices')
      .withIndex('by_customer', (q) => q.eq('customerId', customerId))
      .first();

    if (hasInvoices) {
      throw new Error('Cannot delete customer with existing invoices. Set status to inactive instead.');
    }

    const now = Date.now();
    // Soft delete: mark as deleted instead of removing
    await ctx.db.patch(customerId, {
      deletedAt: now,
      deletedBy: authUserId,
    });
    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'customer.deleted',
      entityType: 'yourobc_customer',
      entityId: customerId,
      entityTitle: customer.companyName,
      description: `Deleted customer: ${customer.companyName}`,
      createdAt: now,
    });

    return customerId;
  },
});

/**
 * Updates customer statistics (quotes, revenue, activity dates).
 * This is typically called by system processes when business events occur.
 *
 * @param customerId - The ID of the customer
 * @param stats - Partial statistics to update
 * @returns The ID of the updated customer
 * @throws {Error} If customer not found
 */
export const updateCustomerStats = mutation({
  args: {
    customerId: v.id('yourobcCustomers'),
    stats: v.object({
      totalQuotes: v.optional(v.number()),
      acceptedQuotes: v.optional(v.number()),
      totalRevenue: v.optional(v.number()),
      lastQuoteDate: v.optional(v.number()),
      lastShipmentDate: v.optional(v.number()),
    }),
  },
  handler: async (ctx, { customerId, stats }) => {
    const customer = await ctx.db.get(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    const updatedStats = {
      ...customer.stats,
      ...stats,
    };

    await ctx.db.patch(customerId, {
      stats: updatedStats,
      updatedAt: Date.now(),
    });

    return customerId;
  },
});

/**
 * Adds a tag to a customer for categorization and filtering.
 *
 * @param authUserId - The ID of the authenticated user
 * @param customerId - The ID of the customer
 * @param tag - The tag to add
 * @returns The ID of the updated customer
 * @throws {Error} If customer not found, tag is empty, duplicate, or limit exceeded
 */
export const addCustomerTag = mutation({
  args: {
    authUserId: v.string(),
    customerId: v.id('yourobcCustomers'),
    tag: v.string(),
  },
  handler: async (ctx, { authUserId, customerId, tag }) => {
    await requirePermission(ctx, authUserId, CUSTOMER_CONSTANTS.PERMISSIONS.EDIT);

    const customer = await ctx.db.get(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    const tagTrimmed = tag.trim();
    if (!tagTrimmed) {
      throw new Error('Tag cannot be empty');
    }

    if (customer.tags.includes(tagTrimmed)) {
      throw new Error('Tag already exists');
    }

    if (customer.tags.length >= CUSTOMER_CONSTANTS.LIMITS.MAX_TAGS) {
      throw new Error(`Maximum ${CUSTOMER_CONSTANTS.LIMITS.MAX_TAGS} tags allowed`);
    }

    const updatedTags = [...customer.tags, tagTrimmed];

    await ctx.db.patch(customerId, {
      tags: updatedTags,
      updatedAt: Date.now(),
    });

    return customerId;
  },
});

/**
 * Removes a tag from a customer.
 *
 * @param authUserId - The ID of the authenticated user
 * @param customerId - The ID of the customer
 * @param tag - The tag to remove
 * @returns The ID of the updated customer
 * @throws {Error} If customer not found
 */
export const removeCustomerTag = mutation({
  args: {
    authUserId: v.string(),
    customerId: v.id('yourobcCustomers'),
    tag: v.string(),
  },
  handler: async (ctx, { authUserId, customerId, tag }) => {
    await requirePermission(ctx, authUserId, CUSTOMER_CONSTANTS.PERMISSIONS.EDIT);

    const customer = await ctx.db.get(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    const updatedTags = customer.tags.filter(t => t !== tag);

    await ctx.db.patch(customerId, {
      tags: updatedTags,
      updatedAt: Date.now(),
    });

    return customerId;
  },
});