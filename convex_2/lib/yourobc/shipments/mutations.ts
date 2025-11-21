// convex/lib/yourobc/shipments/mutations.ts
// Write operations for shipments module

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import {
  shipmentsValidators,
  shipmentsFields,
} from '@/schema/yourobc/shipments/validators';
import { SHIPMENTS_CONSTANTS } from './constants';
import { validateShipmentData, trimShipmentData, calculateChargeableWeight } from './utils';
import {
  requireEditShipmentAccess,
  requireDeleteShipmentAccess,
  requireUpdateShipmentStatusAccess,
  canEditShipment,
  canDeleteShipment,
} from './permissions';
import type { ShipmentId } from './types';

/**
 * Create new shipment
 */
export const createShipment = mutation({
  args: {
    data: v.object({
      shipmentNumber: v.string(),
      awbNumber: v.optional(v.string()),
      customerReference: v.optional(v.string()),
      serviceType: shipmentsValidators.serviceType,
      priority: shipmentsValidators.priority,
      customerId: v.id('yourobcCustomers'),
      quoteId: v.optional(v.id('yourobcQuotes')),
      origin: shipmentsFields.address,
      destination: shipmentsFields.address,
      dimensions: shipmentsFields.dimensions,
      description: v.string(),
      specialInstructions: v.optional(v.string()),
      currentStatus: v.optional(shipmentsValidators.status),
      sla: shipmentsFields.sla,
      assignedCourierId: v.optional(v.id('yourobcCouriers')),
      courierInstructions: v.optional(v.string()),
      employeeId: v.optional(v.id('yourobcEmployees')),
      partnerId: v.optional(v.id('yourobcPartners')),
      partnerReference: v.optional(v.string()),
      agreedPrice: shipmentsFields.currencyAmount,
      actualCosts: v.optional(shipmentsFields.currencyAmount),
      totalPrice: v.optional(shipmentsFields.currencyAmount),
      purchasePrice: v.optional(shipmentsFields.currencyAmount),
      commission: v.optional(shipmentsFields.currencyAmount),
      pickupTime: v.optional(shipmentsFields.scheduledTime),
      deliveryTime: v.optional(shipmentsFields.scheduledTime),
      communicationChannel: v.optional(v.object({
        type: shipmentsValidators.communicationChannel,
        identifier: v.optional(v.string()),
      })),
      tags: v.optional(v.array(v.string())),
      category: v.optional(v.string()),
      customFields: v.optional(v.object({})),
    }),
  },
  handler: async (ctx, { data }): Promise<ShipmentId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. AUTHZ: Check create permission
    await requirePermission(ctx, SHIPMENTS_CONSTANTS.PERMISSIONS.CREATE, {
      allowAdmin: true,
    });

    // 3. VALIDATE: Check data validity
    const errors = validateShipmentData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 4. PROCESS: Generate IDs and prepare data
    const publicId = await generateUniquePublicId(ctx, 'yourobcShipments');
    const now = Date.now();

    // Calculate chargeable weight
    const chargeableWeight = calculateChargeableWeight(data.dimensions);
    const dimensions = {
      ...data.dimensions,
      chargeableWeight,
    };

    // Trim string fields
    const trimmedData = trimShipmentData(data);

    // 5. CREATE: Insert into database
    const shipmentId = await ctx.db.insert('yourobcShipments', {
      publicId,
      shipmentNumber: trimmedData.shipmentNumber,
      awbNumber: trimmedData.awbNumber,
      customerReference: trimmedData.customerReference,
      serviceType: trimmedData.serviceType,
      priority: trimmedData.priority,
      customerId: trimmedData.customerId,
      quoteId: trimmedData.quoteId,
      origin: trimmedData.origin,
      destination: trimmedData.destination,
      dimensions,
      description: trimmedData.description,
      specialInstructions: trimmedData.specialInstructions,
      currentStatus: trimmedData.currentStatus || 'quoted',
      sla: trimmedData.sla,
      nextTask: undefined,
      assignedCourierId: trimmedData.assignedCourierId,
      courierInstructions: trimmedData.courierInstructions,
      employeeId: trimmedData.employeeId,
      partnerId: trimmedData.partnerId,
      partnerReference: trimmedData.partnerReference,
      routing: undefined,
      agreedPrice: trimmedData.agreedPrice,
      actualCosts: trimmedData.actualCosts,
      totalPrice: trimmedData.totalPrice,
      purchasePrice: trimmedData.purchasePrice,
      commission: trimmedData.commission,
      documentStatus: undefined,
      customsInfo: undefined,
      pickupTime: trimmedData.pickupTime,
      deliveryTime: trimmedData.deliveryTime,
      communicationChannel: trimmedData.communicationChannel,
      completedAt: undefined,
      tags: trimmedData.tags || [],
      category: trimmedData.category,
      customFields: trimmedData.customFields,
      ownerId: user._id,
      createdBy: user._id,
      createdAt: now,
      updatedAt: now,
      updatedBy: user._id,
    });

    // Create initial status history entry
    await ctx.db.insert('yourobcShipmentStatusHistory', {
      shipmentId,
      status: trimmedData.currentStatus || 'quoted',
      timestamp: now,
      notes: 'Shipment created',
      createdBy: user._id,
      createdAt: now,
    });

    // 6. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'shipment.created',
      entityType: 'system_shipment',
      entityId: publicId,
      entityTitle: trimmedData.shipmentNumber,
      description: `Created shipment: ${trimmedData.shipmentNumber}`,
      metadata: {
        status: trimmedData.currentStatus || 'quoted',
        serviceType: trimmedData.serviceType,
        customerId: trimmedData.customerId,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 7. RETURN: Return entity ID
    return shipmentId;
  },
});

/**
 * Update existing shipment
 */
export const updateShipment = mutation({
  args: {
    shipmentId: v.id('yourobcShipments'),
    updates: v.object({
      shipmentNumber: v.optional(v.string()),
      awbNumber: v.optional(v.string()),
      customerReference: v.optional(v.string()),
      serviceType: v.optional(shipmentsValidators.serviceType),
      priority: v.optional(shipmentsValidators.priority),
      description: v.optional(v.string()),
      specialInstructions: v.optional(v.string()),
      currentStatus: v.optional(shipmentsValidators.status),
      assignedCourierId: v.optional(v.id('yourobcCouriers')),
      courierInstructions: v.optional(v.string()),
      employeeId: v.optional(v.id('yourobcEmployees')),
      partnerId: v.optional(v.id('yourobcPartners')),
      partnerReference: v.optional(v.string()),
      actualCosts: v.optional(shipmentsFields.currencyAmount),
      totalPrice: v.optional(shipmentsFields.currencyAmount),
      purchasePrice: v.optional(shipmentsFields.currencyAmount),
      commission: v.optional(shipmentsFields.currencyAmount),
      pickupTime: v.optional(shipmentsFields.scheduledTime),
      deliveryTime: v.optional(shipmentsFields.scheduledTime),
      tags: v.optional(v.array(v.string())),
      category: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { shipmentId, updates }): Promise<ShipmentId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const shipment = await ctx.db.get(shipmentId);
    if (!shipment || shipment.deletedAt) {
      throw new Error('Shipment not found');
    }

    // 3. AUTHZ: Check edit permission
    await requireEditShipmentAccess(ctx, shipment, user);

    // 4. VALIDATE: Check update data validity
    const errors = validateShipmentData(updates);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 5. PROCESS: Prepare update data
    const now = Date.now();
    const trimmedUpdates = trimShipmentData(updates);
    const updateData: any = {
      updatedAt: now,
      updatedBy: user._id,
    };

    if (trimmedUpdates.shipmentNumber !== undefined) {
      updateData.shipmentNumber = trimmedUpdates.shipmentNumber;
    }
    if (trimmedUpdates.awbNumber !== undefined) {
      updateData.awbNumber = trimmedUpdates.awbNumber;
    }
    if (trimmedUpdates.customerReference !== undefined) {
      updateData.customerReference = trimmedUpdates.customerReference;
    }
    if (trimmedUpdates.serviceType !== undefined) {
      updateData.serviceType = trimmedUpdates.serviceType;
    }
    if (trimmedUpdates.priority !== undefined) {
      updateData.priority = trimmedUpdates.priority;
    }
    if (trimmedUpdates.description !== undefined) {
      updateData.description = trimmedUpdates.description;
    }
    if (trimmedUpdates.specialInstructions !== undefined) {
      updateData.specialInstructions = trimmedUpdates.specialInstructions;
    }
    if (trimmedUpdates.currentStatus !== undefined) {
      updateData.currentStatus = trimmedUpdates.currentStatus;
    }
    if (trimmedUpdates.assignedCourierId !== undefined) {
      updateData.assignedCourierId = trimmedUpdates.assignedCourierId;
    }
    if (trimmedUpdates.courierInstructions !== undefined) {
      updateData.courierInstructions = trimmedUpdates.courierInstructions;
    }
    if (trimmedUpdates.employeeId !== undefined) {
      updateData.employeeId = trimmedUpdates.employeeId;
    }
    if (trimmedUpdates.partnerId !== undefined) {
      updateData.partnerId = trimmedUpdates.partnerId;
    }
    if (trimmedUpdates.partnerReference !== undefined) {
      updateData.partnerReference = trimmedUpdates.partnerReference;
    }
    if (trimmedUpdates.actualCosts !== undefined) {
      updateData.actualCosts = trimmedUpdates.actualCosts;
    }
    if (trimmedUpdates.totalPrice !== undefined) {
      updateData.totalPrice = trimmedUpdates.totalPrice;
    }
    if (trimmedUpdates.purchasePrice !== undefined) {
      updateData.purchasePrice = trimmedUpdates.purchasePrice;
    }
    if (trimmedUpdates.commission !== undefined) {
      updateData.commission = trimmedUpdates.commission;
    }
    if (trimmedUpdates.pickupTime !== undefined) {
      updateData.pickupTime = trimmedUpdates.pickupTime;
    }
    if (trimmedUpdates.deliveryTime !== undefined) {
      updateData.deliveryTime = trimmedUpdates.deliveryTime;
    }
    if (trimmedUpdates.tags !== undefined) {
      updateData.tags = trimmedUpdates.tags;
    }
    if (trimmedUpdates.category !== undefined) {
      updateData.category = trimmedUpdates.category;
    }

    // 6. UPDATE: Apply changes
    await ctx.db.patch(shipmentId, updateData);

    // 7. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'shipment.updated',
      entityType: 'system_shipment',
      entityId: shipment.publicId,
      entityTitle: updateData.shipmentNumber || shipment.shipmentNumber,
      description: `Updated shipment: ${updateData.shipmentNumber || shipment.shipmentNumber}`,
      metadata: { changes: updates },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 8. RETURN: Return entity ID
    return shipmentId;
  },
});

/**
 * Update shipment status
 */
export const updateShipmentStatus = mutation({
  args: {
    shipmentId: v.id('yourobcShipments'),
    status: shipmentsValidators.status,
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
    metadata: v.optional(v.object({
      flightNumber: v.optional(v.string()),
      estimatedArrival: v.optional(v.number()),
      delayReason: v.optional(v.string()),
      podReceived: v.optional(v.boolean()),
      customerSignature: v.optional(v.string()),
    })),
  },
  handler: async (ctx, { shipmentId, status, location, notes, metadata }) => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const shipment = await ctx.db.get(shipmentId);
    if (!shipment || shipment.deletedAt) {
      throw new Error('Shipment not found');
    }

    // 3. AUTHZ: Check status update permission
    await requireUpdateShipmentStatusAccess(ctx, shipment, user);

    // 4. UPDATE: Change status
    const now = Date.now();
    await ctx.db.patch(shipmentId, {
      currentStatus: status,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. CREATE: Add status history entry
    await ctx.db.insert('yourobcShipmentStatusHistory', {
      shipmentId,
      status,
      timestamp: now,
      location,
      notes,
      metadata,
      createdBy: user._id,
      createdAt: now,
    });

    // 6. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'shipment.status_updated',
      entityType: 'system_shipment',
      entityId: shipment.publicId,
      entityTitle: shipment.shipmentNumber,
      description: `Updated shipment status to ${status}: ${shipment.shipmentNumber}`,
      metadata: { oldStatus: shipment.currentStatus, newStatus: status },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return shipmentId;
  },
});

/**
 * Delete shipment (soft delete)
 */
export const deleteShipment = mutation({
  args: {
    shipmentId: v.id('yourobcShipments'),
  },
  handler: async (ctx, { shipmentId }): Promise<ShipmentId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const shipment = await ctx.db.get(shipmentId);
    if (!shipment || shipment.deletedAt) {
      throw new Error('Shipment not found');
    }

    // 3. AUTHZ: Check delete permission
    await requireDeleteShipmentAccess(shipment, user);

    // 4. SOFT DELETE: Mark as deleted
    const now = Date.now();
    await ctx.db.patch(shipmentId, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'shipment.deleted',
      entityType: 'system_shipment',
      entityId: shipment.publicId,
      entityTitle: shipment.shipmentNumber,
      description: `Deleted shipment: ${shipment.shipmentNumber}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 6. RETURN: Return entity ID
    return shipmentId;
  },
});

/**
 * Restore soft-deleted shipment
 */
export const restoreShipment = mutation({
  args: {
    shipmentId: v.id('yourobcShipments'),
  },
  handler: async (ctx, { shipmentId }): Promise<ShipmentId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists and is deleted
    const shipment = await ctx.db.get(shipmentId);
    if (!shipment) {
      throw new Error('Shipment not found');
    }
    if (!shipment.deletedAt) {
      throw new Error('Shipment is not deleted');
    }

    // 3. AUTHZ: Check edit permission (owners and admins can restore)
    if (
      shipment.ownerId !== user._id &&
      user.role !== 'admin' &&
      user.role !== 'superadmin'
    ) {
      throw new Error('You do not have permission to restore this shipment');
    }

    // 4. RESTORE: Clear soft delete fields
    const now = Date.now();
    await ctx.db.patch(shipmentId, {
      deletedAt: undefined,
      deletedBy: undefined,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'shipment.restored',
      entityType: 'system_shipment',
      entityId: shipment.publicId,
      entityTitle: shipment.shipmentNumber,
      description: `Restored shipment: ${shipment.shipmentNumber}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 6. RETURN: Return entity ID
    return shipmentId;
  },
});

/**
 * Bulk update multiple shipments
 */
export const bulkUpdateShipments = mutation({
  args: {
    shipmentIds: v.array(v.id('yourobcShipments')),
    updates: v.object({
      currentStatus: v.optional(shipmentsValidators.status),
      priority: v.optional(shipmentsValidators.priority),
      assignedCourierId: v.optional(v.id('yourobcCouriers')),
      employeeId: v.optional(v.id('yourobcEmployees')),
      tags: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, { shipmentIds, updates }) => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. AUTHZ: Check bulk edit permission
    await requirePermission(ctx, SHIPMENTS_CONSTANTS.PERMISSIONS.BULK_EDIT, {
      allowAdmin: true,
    });

    // 3. VALIDATE: Check update data
    const errors = validateShipmentData(updates);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const now = Date.now();
    const results = [];
    const failed = [];

    // 4. PROCESS: Update each entity
    for (const shipmentId of shipmentIds) {
      try {
        const shipment = await ctx.db.get(shipmentId);
        if (!shipment || shipment.deletedAt) {
          failed.push({ id: shipmentId, reason: 'Not found' });
          continue;
        }

        // Check individual edit access
        const canEdit = await canEditShipment(ctx, shipment, user);
        if (!canEdit) {
          failed.push({ id: shipmentId, reason: 'No permission' });
          continue;
        }

        // Apply updates
        const updateData: any = {
          updatedAt: now,
          updatedBy: user._id,
        };

        if (updates.currentStatus !== undefined) updateData.currentStatus = updates.currentStatus;
        if (updates.priority !== undefined) updateData.priority = updates.priority;
        if (updates.assignedCourierId !== undefined) updateData.assignedCourierId = updates.assignedCourierId;
        if (updates.employeeId !== undefined) updateData.employeeId = updates.employeeId;
        if (updates.tags !== undefined) {
          updateData.tags = updates.tags.map(tag => tag.trim());
        }

        await ctx.db.patch(shipmentId, updateData);
        results.push({ id: shipmentId, success: true });
      } catch (error: any) {
        failed.push({ id: shipmentId, reason: error.message });
      }
    }

    // 5. AUDIT: Create single audit log for bulk operation
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'shipment.bulk_updated',
      entityType: 'system_shipment',
      entityId: 'bulk',
      entityTitle: `${results.length} shipments`,
      description: `Bulk updated ${results.length} shipments`,
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
 * Bulk delete multiple shipments (soft delete)
 */
export const bulkDeleteShipments = mutation({
  args: {
    shipmentIds: v.array(v.id('yourobcShipments')),
  },
  handler: async (ctx, { shipmentIds }) => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. AUTHZ: Check delete permission
    await requirePermission(ctx, SHIPMENTS_CONSTANTS.PERMISSIONS.DELETE, {
      allowAdmin: true,
    });

    const now = Date.now();
    const results = [];
    const failed = [];

    // 3. PROCESS: Delete each entity
    for (const shipmentId of shipmentIds) {
      try {
        const shipment = await ctx.db.get(shipmentId);
        if (!shipment || shipment.deletedAt) {
          failed.push({ id: shipmentId, reason: 'Not found' });
          continue;
        }

        // Check individual delete access
        const canDelete = await canDeleteShipment(shipment, user);
        if (!canDelete) {
          failed.push({ id: shipmentId, reason: 'No permission' });
          continue;
        }

        // Soft delete
        await ctx.db.patch(shipmentId, {
          deletedAt: now,
          deletedBy: user._id,
          updatedAt: now,
          updatedBy: user._id,
        });

        results.push({ id: shipmentId, success: true });
      } catch (error: any) {
        failed.push({ id: shipmentId, reason: error.message });
      }
    }

    // 4. AUDIT: Create single audit log for bulk operation
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'shipment.bulk_deleted',
      entityType: 'system_shipment',
      entityId: 'bulk',
      entityTitle: `${results.length} shipments`,
      description: `Bulk deleted ${results.length} shipments`,
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
