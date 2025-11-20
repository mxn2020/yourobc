// convex/lib/boilerplate/autumn/autumn_customers/mutations.ts
// Write operations for autumn customers module

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, generateUniquePublicId } from '@/shared/auth.helper';
import { autumnCustomersValidators } from '@/schema/boilerplate/autumn/autumn_customers/validators';
import { validateAutumnCustomerData } from './utils';
import {
  requireCreateAutumnCustomerAccess,
  requireEditAutumnCustomerAccess,
  requireDeleteAutumnCustomerAccess,
} from './permissions';
import type { AutumnCustomerId } from './types';
import { createAuditLog } from '../../audit_logs/helpers';

/**
 * Create autumn customer record
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const createAutumnCustomer = mutation({
  args: {
    name: v.string(),
    userId: v.id('userProfiles'),
    authUserId: v.string(),
    autumnCustomerId: v.string(),
    currentPlanId: v.optional(v.string()),
    subscriptionStatus: v.optional(autumnCustomersValidators.subscriptionStatus),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args): Promise<AutumnCustomerId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. AUTHZ: Check create permission
    requireCreateAutumnCustomerAccess(user);

    // 3. VALIDATE: Check data validity
    const data = {
      name: args.name,
      autumnCustomerId: args.autumnCustomerId,
    };
    const errors = validateAutumnCustomerData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 4. CHECK: Verify target user exists
    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      throw new Error('Target user not found');
    }

    // 5. CHECK: Verify autumn customer ID doesn't already exist
    const existingCustomer = await ctx.db
      .query('autumnCustomers')
      .withIndex('by_autumn_customer_id', (q) => q.eq('autumnCustomerId', args.autumnCustomerId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (existingCustomer) {
      throw new Error('Customer with this Autumn ID already exists');
    }

    // 6. PROCESS: Generate IDs and prepare data
    const publicId = await generateUniquePublicId(ctx, 'autumnCustomers');
    const now = Date.now();
    const trimmedName = args.name.trim();

    // 7. CREATE: Insert new customer
    const customerId = await ctx.db.insert('autumnCustomers', {
      publicId,
      name: trimmedName,
      ownerId: args.userId,
      userId: args.userId,
      authUserId: args.authUserId.trim(),
      autumnCustomerId: args.autumnCustomerId.trim(),
      currentPlanId: args.currentPlanId?.trim(),
      subscriptionStatus: args.subscriptionStatus,
      lastSyncedAt: now,
      lastActivityAt: now,
      metadata: args.metadata ?? {},
      createdBy: user._id,
      createdAt: now,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 8. AUDIT: Create audit log
    await createAuditLog(ctx, {
      action: 'autumn_customer.created',
      entityType: 'autumn_customer',
      entityId: customerId,
      entityTitle: trimmedName,
      description: `Created Autumn customer record: ${trimmedName}`,
      metadata: {
        operation: 'create_autumn_customer',
        autumnCustomerId: args.autumnCustomerId,
      },
    });

    // 9. RETURN: Customer ID
    return customerId;
  },
});

/**
 * Update autumn customer record
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const updateAutumnCustomer = mutation({
  args: {
    customerId: v.id('autumnCustomers'),
    updates: v.object({
      name: v.optional(v.string()),
      currentPlanId: v.optional(v.string()),
      subscriptionStatus: v.optional(autumnCustomersValidators.subscriptionStatus),
      lastSyncedAt: v.optional(v.number()),
      metadata: v.optional(v.any()),
    }),
  },
  handler: async (ctx, { customerId, updates }): Promise<AutumnCustomerId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const customer = await ctx.db.get(customerId);
    if (!customer || customer.deletedAt) {
      throw new Error('Customer not found');
    }

    // 3. AUTHZ: Check edit permission
    await requireEditAutumnCustomerAccess(ctx, customer, user);

    // 4. VALIDATE: Check update data validity
    const errors = validateAutumnCustomerData(updates);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 5. PROCESS: Prepare update data
    const now = Date.now();
    const updateData: any = {
      updatedAt: now,
      updatedBy: user._id,
      lastActivityAt: now,
    };

    if (updates.name !== undefined) {
      updateData.name = updates.name.trim();
    }
    if (updates.currentPlanId !== undefined) {
      updateData.currentPlanId = updates.currentPlanId.trim();
    }
    if (updates.subscriptionStatus !== undefined) {
      updateData.subscriptionStatus = updates.subscriptionStatus;
    }
    if (updates.lastSyncedAt !== undefined) {
      updateData.lastSyncedAt = updates.lastSyncedAt;
    }
    if (updates.metadata !== undefined) {
      updateData.metadata = updates.metadata;
    }

    // 6. UPDATE: Apply changes
    await ctx.db.patch(customerId, updateData);

    // 7. AUDIT: Create audit log
    await createAuditLog(ctx, {
      action: 'autumn_customer.updated',
      entityType: 'autumn_customer',
      entityId: customerId,
      entityTitle: updateData.name || customer.name,
      description: `Updated Autumn customer: ${updateData.name || customer.name}`,
      metadata: { changes: updates },
    });

    // 8. RETURN: Customer ID
    return customerId;
  },
});

/**
 * Sync autumn customer data from Autumn
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const syncAutumnCustomer = mutation({
  args: {
    customerId: v.id('autumnCustomers'),
    currentPlanId: v.optional(v.string()),
    subscriptionStatus: v.optional(autumnCustomersValidators.subscriptionStatus),
  },
  handler: async (ctx, { customerId, currentPlanId, subscriptionStatus }): Promise<AutumnCustomerId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Get customer
    const customer = await ctx.db.get(customerId);
    if (!customer || customer.deletedAt) {
      throw new Error('Customer not found');
    }

    // 3. AUTHZ: Check edit permission
    await requireEditAutumnCustomerAccess(ctx, customer, user);

    const now = Date.now();

    // 4. UPDATE: Sync customer data
    await ctx.db.patch(customerId, {
      currentPlanId: currentPlanId?.trim(),
      subscriptionStatus,
      lastSyncedAt: now,
      updatedAt: now,
      lastActivityAt: now,
      updatedBy: user._id,
    });

    // 5. AUDIT: Create audit log
    await createAuditLog(ctx, {
      action: 'autumn_customer.synced',
      entityType: 'autumn_customer',
      entityId: customerId,
      entityTitle: customer.name,
      description: `Synced Autumn customer: ${customer.name}`,
      metadata: {
        operation: 'sync_autumn_customer',
        currentPlanId,
        subscriptionStatus,
      },
    });

    // 6. RETURN: Customer ID
    return customerId;
  },
});

/**
 * Delete an autumn customer (soft delete)
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const deleteAutumnCustomer = mutation({
  args: {
    customerId: v.id('autumnCustomers'),
  },
  handler: async (ctx, { customerId }): Promise<AutumnCustomerId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Get customer
    const customer = await ctx.db.get(customerId);
    if (!customer || customer.deletedAt) {
      throw new Error('Customer not found');
    }

    // 3. AUTHZ: Check delete permission
    await requireDeleteAutumnCustomerAccess(customer, user);

    const now = Date.now();

    // 4. SOFT DELETE: Mark as deleted
    await ctx.db.patch(customerId, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. AUDIT: Create audit log
    await createAuditLog(ctx, {
      action: 'autumn_customer.deleted',
      entityType: 'autumn_customer',
      entityId: customerId,
      entityTitle: customer.name,
      description: `Deleted Autumn customer: ${customer.name}`,
      metadata: {
        operation: 'delete_autumn_customer',
        autumnCustomerId: customer.autumnCustomerId,
      },
    });

    // 6. RETURN: Customer ID
    return customerId;
  },
});

/**
 * Restore soft-deleted autumn customer
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const restoreAutumnCustomer = mutation({
  args: {
    customerId: v.id('autumnCustomers'),
  },
  handler: async (ctx, { customerId }): Promise<AutumnCustomerId> => {
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

    // 3. AUTHZ: Check admin permission
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      throw new Error('Permission denied: Admin access required to restore customers');
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
    await createAuditLog(ctx, {
      action: 'autumn_customer.restored',
      entityType: 'autumn_customer',
      entityId: customerId,
      entityTitle: customer.name,
      description: `Restored Autumn customer: ${customer.name}`,
    });

    // 6. RETURN: Customer ID
    return customerId;
  },
});
