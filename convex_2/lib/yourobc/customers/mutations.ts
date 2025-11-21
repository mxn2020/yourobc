// convex/lib/yourobc/customers/mutations.ts
// Write operations for customers module

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { customersValidators } from '@/schema/yourobc/customers/validators';
import { CUSTOMERS_CONSTANTS } from './constants';
import { validateCustomerData } from './utils';
import { requireEditCustomerAccess, requireDeleteCustomerAccess, canEditCustomer, canDeleteCustomer } from './permissions';
import type { CustomerId } from './types';
import { baseFields, baseValidators } from '@/schema/base.validators';
import { Id } from '@/generated/dataModel';

/**
 * Create new customer
 */
export const createCustomer = mutation({
  args: {
    data: v.object({
      companyName: v.string(),
      shortName: v.optional(v.string()),
      website: v.optional(v.string()),
      primaryContact: baseFields.contact,
      additionalContacts: v.optional(v.array(baseFields.contact)),
      billingAddress: baseFields.address,
      shippingAddress: v.optional(baseFields.address),
      defaultCurrency: baseValidators.currency,
      paymentTerms: v.number(),
      paymentMethod: baseValidators.paymentMethod,
      margin: v.number(),
      status: v.optional(customersValidators.status),
      inquirySourceId: v.optional(v.id('inquirySources')),
      serviceSuspended: v.optional(v.boolean()),
      serviceSuspendedDate: v.optional(v.number()),
      serviceSuspendedReason: v.optional(v.string()),
      serviceReactivatedDate: v.optional(v.number()),
      notes: v.optional(v.string()),
      internalNotes: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      category: v.optional(v.string()),
      customFields: v.optional(v.object({})),
    }),
  },
  handler: async (ctx, { data }): Promise<CustomerId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. AUTHZ: Check create permission
    await requirePermission(ctx, CUSTOMERS_CONSTANTS.PERMISSIONS.CREATE, {
      allowAdmin: true,
    });

    // 3. VALIDATE: Check data validity
    const errors = validateCustomerData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 4. PROCESS: Generate IDs and prepare data
    const publicId = await generateUniquePublicId(ctx, 'yourobcCustomers');
    const now = Date.now();

    // Initialize stats
    const stats = {
      totalQuotes: 0,
      acceptedQuotes: 0,
      totalRevenue: 0,
    };

    // 5. CREATE: Insert into database
    const customerId = await ctx.db.insert('yourobcCustomers', {
      publicId,
      companyName: data.companyName.trim(),
      shortName: data.shortName?.trim(),
      website: data.website?.trim(),
      primaryContact: {
        ...data.primaryContact,
        name: data.primaryContact.name.trim(),
        email: data.primaryContact.email?.trim(),
        phone: data.primaryContact.phone?.trim(),
        mobile: data.primaryContact.mobile?.trim(),
        notes: data.primaryContact.notes?.trim(),
      },
      additionalContacts: (data.additionalContacts || []).map(contact => ({
        ...contact,
        name: contact.name.trim(),
        email: contact.email?.trim(),
        phone: contact.phone?.trim(),
        mobile: contact.mobile?.trim(),
        notes: contact.notes?.trim(),
      })),
      billingAddress: {
        ...data.billingAddress,
        street: data.billingAddress.street?.trim(),
        city: data.billingAddress.city.trim(),
        postalCode: data.billingAddress.postalCode?.trim(),
        country: data.billingAddress.country.trim(),
        countryCode: data.billingAddress.countryCode.trim().toUpperCase(),
      },
      shippingAddress: data.shippingAddress ? {
        ...data.shippingAddress,
        street: data.shippingAddress.street?.trim(),
        city: data.shippingAddress.city.trim(),
        postalCode: data.shippingAddress.postalCode?.trim(),
        country: data.shippingAddress.country.trim(),
        countryCode: data.shippingAddress.countryCode.trim().toUpperCase(),
      } : undefined,
      defaultCurrency: data.defaultCurrency,
      paymentTerms: data.paymentTerms,
      paymentMethod: data.paymentMethod,
      margin: data.margin,
      status: data.status || 'active',
      inquirySourceId: data.inquirySourceId,
      serviceSuspended: data.serviceSuspended,
      serviceSuspendedDate: data.serviceSuspendedDate,
      serviceSuspendedReason: data.serviceSuspendedReason?.trim(),
      serviceReactivatedDate: data.serviceReactivatedDate,
      stats,
      notes: data.notes?.trim(),
      internalNotes: data.internalNotes?.trim(),
      tags: (data.tags || []).map(tag => tag.trim()),
      category: data.category?.trim(),
      customFields: data.customFields,
      ownerId: user._id,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
    });

    // 6. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'customer.created',
      entityType: 'system_customer',
      entityId: publicId,
      entityTitle: data.companyName.trim(),
      description: `Created customer: ${data.companyName.trim()}`,
      metadata: {
        status: data.status || 'active',
        currency: data.defaultCurrency,
        margin: data.margin,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 7. RETURN: Return entity ID
    return customerId;
  },
});

/**
 * Update existing customer
 */
export const updateCustomer = mutation({
  args: {
    customerId: v.id('yourobcCustomers'),
    updates: v.object({
      companyName: v.optional(v.string()),
      shortName: v.optional(v.string()),
      website: v.optional(v.string()),
      primaryContact: v.optional(baseFields.contact),
      additionalContacts: v.optional(v.array(baseFields.contact)),
      billingAddress: v.optional(baseFields.address),
      shippingAddress: v.optional(baseFields.address),
      defaultCurrency: v.optional(baseValidators.currency),
      paymentTerms: v.optional(v.number()),
      paymentMethod: v.optional(baseValidators.paymentMethod),
      margin: v.optional(v.number()),
      status: v.optional(customersValidators.status),
      inquirySourceId: v.optional(v.id('inquirySources')),
      serviceSuspended: v.optional(v.boolean()),
      serviceSuspendedDate: v.optional(v.number()),
      serviceSuspendedReason: v.optional(v.string()),
      serviceReactivatedDate: v.optional(v.number()),
      notes: v.optional(v.string()),
      internalNotes: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      category: v.optional(v.string()),
      customFields: v.optional(v.object({})),
    }),
  },
  handler: async (ctx, { customerId, updates }): Promise<CustomerId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const customer = await ctx.db.get(customerId);
    if (!customer || customer.deletedAt) {
      throw new Error('Customer not found');
    }

    // 3. AUTHZ: Check edit permission
    await requireEditCustomerAccess(ctx, customer, user);

    // 4. VALIDATE: Check update data validity
    const errors = validateCustomerData(updates);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 5. PROCESS: Prepare update data
    const now = Date.now();
    const updateData: any = {
      updatedAt: now,
      updatedBy: user._id,
    };

    if (updates.companyName !== undefined) {
      updateData.companyName = updates.companyName.trim();
    }
    if (updates.shortName !== undefined) {
      updateData.shortName = updates.shortName?.trim();
    }
    if (updates.website !== undefined) {
      updateData.website = updates.website?.trim();
    }
    if (updates.primaryContact !== undefined) {
      updateData.primaryContact = {
        ...updates.primaryContact,
        name: updates.primaryContact.name.trim(),
        email: updates.primaryContact.email?.trim(),
        phone: updates.primaryContact.phone?.trim(),
        mobile: updates.primaryContact.mobile?.trim(),
        notes: updates.primaryContact.notes?.trim(),
      };
    }
    if (updates.additionalContacts !== undefined) {
      updateData.additionalContacts = updates.additionalContacts.map(contact => ({
        ...contact,
        name: contact.name.trim(),
        email: contact.email?.trim(),
        phone: contact.phone?.trim(),
        mobile: contact.mobile?.trim(),
        notes: contact.notes?.trim(),
      }));
    }
    if (updates.billingAddress !== undefined) {
      updateData.billingAddress = {
        ...updates.billingAddress,
        street: updates.billingAddress.street?.trim(),
        city: updates.billingAddress.city.trim(),
        postalCode: updates.billingAddress.postalCode?.trim(),
        country: updates.billingAddress.country.trim(),
        countryCode: updates.billingAddress.countryCode.trim().toUpperCase(),
      };
    }
    if (updates.shippingAddress !== undefined) {
      updateData.shippingAddress = updates.shippingAddress ? {
        ...updates.shippingAddress,
        street: updates.shippingAddress.street?.trim(),
        city: updates.shippingAddress.city.trim(),
        postalCode: updates.shippingAddress.postalCode?.trim(),
        country: updates.shippingAddress.country.trim(),
        countryCode: updates.shippingAddress.countryCode.trim().toUpperCase(),
      } : undefined;
    }
    if (updates.defaultCurrency !== undefined) {
      updateData.defaultCurrency = updates.defaultCurrency;
    }
    if (updates.paymentTerms !== undefined) {
      updateData.paymentTerms = updates.paymentTerms;
    }
    if (updates.paymentMethod !== undefined) {
      updateData.paymentMethod = updates.paymentMethod;
    }
    if (updates.margin !== undefined) {
      updateData.margin = updates.margin;
    }
    if (updates.status !== undefined) {
      updateData.status = updates.status;
    }
    if (updates.inquirySourceId !== undefined) {
      updateData.inquirySourceId = updates.inquirySourceId;
    }
    if (updates.serviceSuspended !== undefined) {
      updateData.serviceSuspended = updates.serviceSuspended;
    }
    if (updates.serviceSuspendedDate !== undefined) {
      updateData.serviceSuspendedDate = updates.serviceSuspendedDate;
    }
    if (updates.serviceSuspendedReason !== undefined) {
      updateData.serviceSuspendedReason = updates.serviceSuspendedReason?.trim();
    }
    if (updates.serviceReactivatedDate !== undefined) {
      updateData.serviceReactivatedDate = updates.serviceReactivatedDate;
    }
    if (updates.notes !== undefined) {
      updateData.notes = updates.notes?.trim();
    }
    if (updates.internalNotes !== undefined) {
      updateData.internalNotes = updates.internalNotes?.trim();
    }
    if (updates.tags !== undefined) {
      updateData.tags = updates.tags.map(tag => tag.trim());
    }
    if (updates.category !== undefined) {
      updateData.category = updates.category?.trim();
    }
    if (updates.customFields !== undefined) {
      updateData.customFields = updates.customFields;
    }

    // 6. UPDATE: Apply changes
    await ctx.db.patch(customerId, updateData);

    // 7. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'customer.updated',
      entityType: 'system_customer',
      entityId: customer.publicId,
      entityTitle: updateData.companyName || customer.companyName,
      description: `Updated customer: ${updateData.companyName || customer.companyName}`,
      metadata: { changes: updates },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 8. RETURN: Return entity ID
    return customerId;
  },
});

/**
 * Delete customer (soft delete)
 */
export const deleteCustomer = mutation({
  args: {
    customerId: v.id('yourobcCustomers'),
  },
  handler: async (ctx, { customerId }): Promise<CustomerId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const customer = await ctx.db.get(customerId);
    if (!customer || customer.deletedAt) {
      throw new Error('Customer not found');
    }

    // 3. AUTHZ: Check delete permission
    await requireDeleteCustomerAccess(customer, user);

    // 4. SOFT DELETE: Mark as deleted
    const now = Date.now();
    await ctx.db.patch(customerId, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'customer.deleted',
      entityType: 'system_customer',
      entityId: customer.publicId,
      entityTitle: customer.companyName,
      description: `Deleted customer: ${customer.companyName}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 6. RETURN: Return entity ID
    return customerId;
  },
});

/**
 * Restore soft-deleted customer
 */
export const restoreCustomer = mutation({
  args: {
    customerId: v.id('yourobcCustomers'),
  },
  handler: async (ctx, { customerId }): Promise<CustomerId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists and is deleted
    const customer = await ctx.db.get(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }
    if (!customer.deletedAt) {
      throw new Error('Customer is not deleted');
    }

    // 3. AUTHZ: Check edit permission (owners and admins can restore)
    if (
      customer.ownerId !== user.authUserId &&
      user.role !== 'admin' &&
      user.role !== 'superadmin'
    ) {
      throw new Error('You do not have permission to restore this customer');
    }

    // 4. RESTORE: Clear soft delete fields
    const now = Date.now();
    await ctx.db.patch(customerId, {
      deletedAt: undefined,
      deletedBy: undefined,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'customer.restored',
      entityType: 'system_customer',
      entityId: customer.publicId,
      entityTitle: customer.companyName,
      description: `Restored customer: ${customer.companyName}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 6. RETURN: Return entity ID
    return customerId;
  },
});

/**
 * Archive customer (status-based soft delete alternative)
 */
export const archiveCustomer = mutation({
  args: {
    customerId: v.id('yourobcCustomers'),
  },
  handler: async (ctx, { customerId }): Promise<CustomerId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const customer = await ctx.db.get(customerId);
    if (!customer || customer.deletedAt) {
      throw new Error('Customer not found');
    }

    // 3. AUTHZ: Check edit permission
    await requireEditCustomerAccess(ctx, customer, user);

    // 4. ARCHIVE: Update status to inactive
    const now = Date.now();
    await ctx.db.patch(customerId, {
      status: 'inactive',
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'customer.archived',
      entityType: 'system_customer',
      entityId: customer.publicId,
      entityTitle: customer.companyName,
      description: `Archived customer: ${customer.companyName}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 6. RETURN: Return entity ID
    return customerId;
  },
});

/**
 * Bulk update multiple customers
 */
export const bulkUpdateCustomers = mutation({
  args: {
    customerIds: v.array(v.id('yourobcCustomers')),
    updates: v.object({
      status: v.optional(customersValidators.status),
      defaultCurrency: v.optional(baseValidators.currency),
      paymentMethod: v.optional(baseValidators.paymentMethod),
      tags: v.optional(v.array(v.string())),
      category: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { customerIds, updates }) => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. AUTHZ: Check bulk edit permission
    await requirePermission(ctx, CUSTOMERS_CONSTANTS.PERMISSIONS.BULK_EDIT, {
      allowAdmin: true,
    });

    // 3. VALIDATE: Check update data
    const errors = validateCustomerData(updates);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const now = Date.now();
    const results: { id: Id<'yourobcCustomers'>; success: true }[] = [];
    const failed: { id: Id<'yourobcCustomers'>; reason: string }[] = [];

    // 4. PROCESS: Update each entity
    await Promise.all(
      customerIds.map(async (customerId) => {
        try {
          const customer = await ctx.db.get(customerId);
          if (!customer || customer.deletedAt) {
            failed.push({ id: customerId, reason: 'Not found' });
            return;
          }

          // Check individual edit access
          const canEdit = await canEditCustomer(ctx, customer, user);
          if (!canEdit) {
            failed.push({ id: customerId, reason: 'No permission' });
            return;
          }

          // Apply updates
          const updateData = {
            updatedAt: now,
            updatedBy: user._id,
            ...(updates.status !== undefined && { status: updates.status }),
            ...(updates.defaultCurrency !== undefined && { defaultCurrency: updates.defaultCurrency }),
            ...(updates.paymentMethod !== undefined && { paymentMethod: updates.paymentMethod }),
            ...(updates.tags !== undefined && { tags: updates.tags.map(tag => tag.trim()) }),
            ...(updates.category !== undefined && { category: updates.category.trim() }),
          };
          
          await ctx.db.patch(customerId, updateData);
          results.push({ id: customerId, success: true });
        } catch (error: any) {
          failed.push({ id: customerId, reason: error.message });
        }
      }),
    );


    // 5. AUDIT: Create single audit log for bulk operation
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'customer.bulk_updated',
      entityType: 'system_customer',
      entityId: 'bulk',
      entityTitle: `${results.length} customers`,
      description: `Bulk updated ${results.length} customers`,
      metadata: {
        successful: results.length,
        failed: failed.length,
        updates,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 6. RETURN: Return results summary
    return {
      updated: results.length,
      failed: failed.length,
      failures: failed,
    };
  },
});

/**
 * Bulk delete multiple customers (soft delete)
 */
export const bulkDeleteCustomers = mutation({
  args: {
    customerIds: v.array(v.id('yourobcCustomers')),
  },
  handler: async (ctx, { customerIds }) => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. AUTHZ: Check delete permission
    await requirePermission(ctx, CUSTOMERS_CONSTANTS.PERMISSIONS.DELETE, {
      allowAdmin: true,
    });

    const now = Date.now();
    const results: { id: Id<'yourobcCustomers'>; success: true }[] = [];
    const failed: { id: Id<'yourobcCustomers'>; reason: string }[] = [];

    // 3. PROCESS: Delete each entity
    await Promise.all(
      customerIds.map(async (customerId) => {
        try {
          const customer = await ctx.db.get(customerId);
          if (!customer || customer.deletedAt) {
            failed.push({ id: customerId, reason: 'Not found' });
            return;
          }

          // Check individual delete access
          const canDelete = await canDeleteCustomer(customer, user);
          if (!canDelete) {
            failed.push({ id: customerId, reason: 'No permission' });
            return;
          }

          // Soft delete
          await ctx.db.patch(customerId, {
            deletedAt: now,
            deletedBy: user._id,
            updatedAt: now,
            updatedBy: user._id,
          });

          results.push({ id: customerId, success: true });
        } catch (error: any) {
          failed.push({ id: customerId, reason: error.message });
        }
      }),
    );


    // 4. AUDIT: Create single audit log for bulk operation
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'customer.bulk_deleted',
      entityType: 'system_customer',
      entityId: 'bulk',
      entityTitle: `${results.length} customers`,
      description: `Bulk deleted ${results.length} customers`,
      metadata: {
        successful: results.length,
        failed: failed.length,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 5. RETURN: Return results summary
    return {
      deleted: results.length,
      failed: failed.length,
      failures: failed,
    };
  },
});
