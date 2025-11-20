/**
 * YourOBC Shipments Mutations
 *
 * This module handles all shipment-related mutations including creation,
 * updates, status changes, courier assignment, and deletion.
 *
 * @module convex/lib/yourobc/shipments/mutations
 */

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';
import { SHIPMENT_CONSTANTS } from './constants';
import {
  validateShipmentData,
  validateStatusUpdate,
  generateShipmentNumber,
  generateAWBNumber,
  calculateSLA,
  getNextTask,
  canUpdateShipmentStatus
} from './utils';
import { getTaskTemplatesForStatus, calculateDueDate } from '../tasks/taskTemplates';
import {
  addressSchema,
  dimensionsSchema,
  currencyAmountSchema,
  flightDetailsSchema,
  routingSchema,
  shipmentStatusValidator,
  quoteServiceTypeValidator,
  servicePriorityValidator,
} from '../../../schema/yourobc/base';

/**
 * Status update metadata schema
 * Contains additional information for status updates
 */
const statusUpdateMetadataSchema = v.object({
  flightNumber: v.optional(v.string()),
  estimatedArrival: v.optional(v.number()),
  delayReason: v.optional(v.string()),
  podReceived: v.optional(v.boolean()),
  customerSignature: v.optional(v.string()),
  courierAssigned: v.optional(v.id('yourobcCouriers')),
  courierNumber: v.optional(v.string()),
  oldDeadline: v.optional(v.number()),
  newDeadline: v.optional(v.number()),
  reason: v.optional(v.string()),
  actualCosts: v.optional(currencyAmountSchema),
  costNotes: v.optional(v.string()),
  cancellationReason: v.optional(v.string()),
});

/**
 * Create a new shipment
 *
 * @param authUserId - The authenticated user's ID
 * @param data - The shipment data
 * @returns The newly created shipment ID
 */
export const createShipment = mutation({
  args: {
    authUserId: v.string(),
    data: v.object({
      shipmentNumber: v.optional(v.string()),
      awbNumber: v.optional(v.string()),
      customerReference: v.optional(v.string()),
      quoteId: v.optional(v.id('yourobcQuotes')),
      customerId: v.id('yourobcCustomers'),
      serviceType: quoteServiceTypeValidator,
      priority: v.optional(servicePriorityValidator),
      origin: addressSchema,
      destination: addressSchema,
      dimensions: dimensionsSchema,
      description: v.string(),
      specialInstructions: v.optional(v.string()),
      deadline: v.number(),
      assignedCourierId: v.optional(v.id('yourobcCouriers')),
      courierInstructions: v.optional(v.string()),
      partnerId: v.optional(v.id('yourobcPartners')),
      partnerReference: v.optional(v.string()),
      routing: v.optional(routingSchema),
      agreedPrice: currencyAmountSchema,
      actualCosts: v.optional(currencyAmountSchema),
    })
  },
  handler: async (ctx, { authUserId, data }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, SHIPMENT_CONSTANTS.PERMISSIONS.CREATE);

    const errors = validateShipmentData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // Verify related entities exist
    const customer = await ctx.db.get(data.customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    if (data.quoteId) {
      const quote = await ctx.db.get(data.quoteId);
      if (!quote) {
        throw new Error('Quote not found');
      }
    }

    if (data.assignedCourierId) {
      const courier = await ctx.db.get(data.assignedCourierId);
      if (!courier) {
        throw new Error('Courier not found');
      }
    }

    if (data.partnerId) {
      const partner = await ctx.db.get(data.partnerId);
      if (!partner) {
        throw new Error('Partner not found');
      }
    }

    // Generate shipment number if not provided
    let shipmentNumber = data.shipmentNumber;
    if (!shipmentNumber) {
      const existingShipments = await ctx.db
        .query('yourobcShipments')
        .withIndex('by_serviceType', (q) => q.eq('serviceType', data.serviceType))
        .collect();
      shipmentNumber = generateShipmentNumber(data.serviceType, existingShipments.length + 1);
    }

    // Check for duplicate shipment number
    const existingNumber = await ctx.db
      .query('yourobcShipments')
      .withIndex('by_shipmentNumber', (q) => q.eq('shipmentNumber', shipmentNumber))
      .first();

    if (existingNumber) {
      throw new Error('Shipment number already exists');
    }

    // Generate AWB number if not provided
    let awbNumber = data.awbNumber;
    if (!awbNumber) {
      awbNumber = generateAWBNumber();
    }

    const now = Date.now();
    const priority = data.priority || SHIPMENT_CONSTANTS.DEFAULT_VALUES.PRIORITY;
    const currentStatus = SHIPMENT_CONSTANTS.STATUS.QUOTED;
    
    // Calculate SLA
    const sla = calculateSLA(data.deadline, currentStatus);
    
    // Get next task
    const nextTask = getNextTask({
      currentStatus,
      priority,
      sla,
    });

    const shipmentData = {
      shipmentNumber,
      awbNumber,
      customerReference: data.customerReference,
      quoteId: data.quoteId,
      customerId: data.customerId,
      serviceType: data.serviceType,
      priority,
      origin: data.origin,
      destination: data.destination,
      dimensions: data.dimensions,
      description: data.description.trim(),
      specialInstructions: data.specialInstructions?.trim(),
      currentStatus,
      sla,
      nextTask,
      assignedCourierId: data.assignedCourierId,
      courierInstructions: data.courierInstructions?.trim(),
      partnerId: data.partnerId,
      partnerReference: data.partnerReference?.trim(),
      routing: data.routing,
      agreedPrice: data.agreedPrice,
      actualCosts: data.actualCosts,
      createdAt: now,
      updatedAt: now,
      createdBy: authUserId,
      tags: [],
    };

    const shipmentId = await ctx.db.insert('yourobcShipments', shipmentData);

    // Create initial status history entry
    await ctx.db.insert('yourobcShipmentStatusHistory', {
      shipmentId,
      status: currentStatus,
      timestamp: now,
      notes: 'Shipment created',
      createdAt: now,
      createdBy: authUserId,
    });

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'shipment.created',
      entityType: 'yourobc_shipment',
      entityId: shipmentId,
      entityTitle: `Shipment ${shipmentNumber}`,
      description: `Created shipment for ${customer.companyName}`,
      createdAt: now,
    });

    return shipmentId;
  },
});

/**
 * Update an existing shipment
 *
 * @param authUserId - The authenticated user's ID
 * @param shipmentId - The shipment ID to update
 * @param data - The updated shipment data
 * @returns The updated shipment ID
 */
export const updateShipment = mutation({
  args: {
    authUserId: v.string(),
    shipmentId: v.id('yourobcShipments'),
    data: v.object({
      shipmentNumber: v.optional(v.string()),
      awbNumber: v.optional(v.string()),
      customerReference: v.optional(v.string()),
      serviceType: v.optional(quoteServiceTypeValidator),
      priority: v.optional(servicePriorityValidator),
      origin: v.optional(addressSchema),
      destination: v.optional(addressSchema),
      dimensions: v.optional(dimensionsSchema),
      description: v.optional(v.string()),
      specialInstructions: v.optional(v.string()),
      deadline: v.optional(v.number()),
      assignedCourierId: v.optional(v.id('yourobcCouriers')),
      courierInstructions: v.optional(v.string()),
      partnerId: v.optional(v.id('yourobcPartners')),
      partnerReference: v.optional(v.string()),
      routing: v.optional(routingSchema),
      agreedPrice: v.optional(currencyAmountSchema),
      actualCosts: v.optional(currencyAmountSchema),
    })
  },
  handler: async (ctx, { authUserId, shipmentId, data }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, SHIPMENT_CONSTANTS.PERMISSIONS.EDIT);

    const shipment = await ctx.db.get(shipmentId);
    if (!shipment) {
      throw new Error('Shipment not found');
    }

    const errors = validateShipmentData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // Check for duplicate shipment number if changed
    if (data.shipmentNumber && data.shipmentNumber !== shipment.shipmentNumber) {
      const shipmentNumber = data.shipmentNumber;
      const existing = await ctx.db
        .query('yourobcShipments')
        .withIndex('by_shipmentNumber', (q) => q.eq('shipmentNumber', shipmentNumber))
        .first();

      if (existing && existing._id !== shipmentId) {
        throw new Error('Shipment number already exists');
      }
    }

    // Verify related entities if changed
    if (data.assignedCourierId && data.assignedCourierId !== shipment.assignedCourierId) {
      const courier = await ctx.db.get(data.assignedCourierId);
      if (!courier) {
        throw new Error('Courier not found');
      }
    }

    if (data.partnerId && data.partnerId !== shipment.partnerId) {
      const partner = await ctx.db.get(data.partnerId);
      if (!partner) {
        throw new Error('Partner not found');
      }
    }

    const now = Date.now();
    let updateData: Record<string, unknown> = {
      ...data,
      updatedAt: now,
    };

    // Trim string fields
    if (data.description) updateData.description = data.description.trim();
    if (data.specialInstructions) updateData.specialInstructions = data.specialInstructions.trim();
    if (data.courierInstructions) updateData.courierInstructions = data.courierInstructions.trim();
    if (data.partnerReference) updateData.partnerReference = data.partnerReference.trim();

    // Recalculate SLA if deadline changed
    if (data.deadline && data.deadline !== shipment.sla.deadline) {
      updateData.sla = calculateSLA(data.deadline, shipment.currentStatus);
    }

    // Update next task if priority changed
    if (data.priority && data.priority !== shipment.priority) {
      updateData.nextTask = getNextTask({
        ...shipment,
        priority: data.priority,
      });
    }

    await ctx.db.patch(shipmentId, updateData);

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'shipment.updated',
      entityType: 'yourobc_shipment',
      entityId: shipmentId,
      entityTitle: `Shipment ${shipment.shipmentNumber}`,
      description: `Updated shipment details`,
      createdAt: now,
    });

    return shipmentId;
  },
});

/**
 * Update shipment status and handle status-specific logic
 *
 * @param authUserId - The authenticated user's ID
 * @param shipmentId - The shipment ID to update
 * @param status - The new status
 * @param location - Optional location information
 * @param notes - Optional notes about the status change
 * @param metadata - Optional metadata for the status update
 * @returns The updated shipment ID
 */
export const updateShipmentStatus = mutation({
  args: {
    authUserId: v.string(),
    shipmentId: v.id('yourobcShipments'),
    status: shipmentStatusValidator,
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
    metadata: v.optional(statusUpdateMetadataSchema),
  },
  handler: async (ctx, { authUserId, shipmentId, status, location, notes, metadata }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, SHIPMENT_CONSTANTS.PERMISSIONS.UPDATE_STATUS);

    const shipment = await ctx.db.get(shipmentId);
    if (!shipment) {
      throw new Error('Shipment not found');
    }

    // Validate status transition
    if (!canUpdateShipmentStatus(shipment.currentStatus, status)) {
      throw new Error(`Cannot change status from ${shipment.currentStatus} to ${status}`);
    }

    // Validate the status update
    const statusUpdateData = { status, location, notes, metadata };
    const errors = validateStatusUpdate(statusUpdateData);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const now = Date.now();
    
    // Calculate new SLA
    const newSla = calculateSLA(metadata?.newDeadline || shipment.sla.deadline, status);
    
    // Get next task
    const nextTask = getNextTask({
      ...shipment,
      currentStatus: status,
      sla: newSla,
    });

    // Update shipment
    const updateData: Record<string, unknown> = {
      currentStatus: status,
      sla: newSla,
      nextTask,
      updatedAt: now,
    };

    // Handle specific status updates
    if (status === SHIPMENT_CONSTANTS.STATUS.DELIVERED || status === SHIPMENT_CONSTANTS.STATUS.INVOICED) {
      updateData.completedAt = now;
    }

    // Update deadline if provided
    if (metadata?.newDeadline) {
      updateData.sla = { ...newSla, deadline: metadata.newDeadline };
    }

    // Update actual costs if provided
    if (metadata?.actualCosts) {
      updateData.actualCosts = metadata.actualCosts;
    }

    // Assign courier if provided
    if (metadata?.courierAssigned) {
      const courier = await ctx.db.get(metadata.courierAssigned);
      if (!courier) {
        throw new Error('Courier not found');
      }
      updateData.assignedCourierId = metadata.courierAssigned;
    }

    await ctx.db.patch(shipmentId, updateData);

    // Create status history entry
    await ctx.db.insert('yourobcShipmentStatusHistory', {
      shipmentId,
      status,
      timestamp: now,
      location,
      notes,
      metadata,
      createdAt: now,
      createdBy: authUserId,
    });

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'shipment.status_updated',
      entityType: 'yourobc_shipment',
      entityId: shipmentId,
      entityTitle: `Shipment ${shipment.shipmentNumber}`,
      description: `Status changed from ${shipment.currentStatus} to ${status}`,
      createdAt: now,
    });

    // Automatically generate tasks for the new status
    const taskTemplates = getTaskTemplatesForStatus(status, shipment.serviceType);
    for (const template of taskTemplates) {
      const taskDueDate = template.dueAfterMinutes
        ? calculateDueDate(template, now)
        : undefined;

      await ctx.db.insert('yourobcTasks', {
        shipmentId,
        title: template.taskTitle,
        description: template.taskDescription,
        type: 'automatic',
        status: 'pending',
        priority: template.priority,
        dueDate: taskDueDate,
        metadata: template.metadata || {},
        createdAt: now,
        createdBy: authUserId,
        updatedAt: now,
        tags: [],
      });
    }

    return shipmentId;
  },
});

/**
 * Assign a courier to a shipment
 *
 * @param authUserId - The authenticated user's ID
 * @param shipmentId - The shipment ID
 * @param courierId - The courier ID to assign
 * @param instructions - Optional instructions for the courier
 * @returns The updated shipment ID
 */
export const assignCourier = mutation({
  args: {
    authUserId: v.string(),
    shipmentId: v.id('yourobcShipments'),
    courierId: v.id('yourobcCouriers'),
    instructions: v.optional(v.string()),
  },
  handler: async (ctx, { authUserId, shipmentId, courierId, instructions }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, SHIPMENT_CONSTANTS.PERMISSIONS.ASSIGN_COURIER);

    const shipment = await ctx.db.get(shipmentId);
    if (!shipment) {
      throw new Error('Shipment not found');
    }

    const courier = await ctx.db.get(courierId);
    if (!courier) {
      throw new Error('Courier not found');
    }

    const now = Date.now();

    await ctx.db.patch(shipmentId, {
      assignedCourierId: courierId,
      courierInstructions: instructions?.trim(),
      updatedAt: now,
    });

    // Create status history entry
    await ctx.db.insert('yourobcShipmentStatusHistory', {
      shipmentId,
      status: shipment.currentStatus,
      timestamp: now,
      notes: `Courier assigned: ${courier.firstName} ${courier.lastName}`,
      metadata: {
        courierAssigned: courierId,
        courierNumber: courier.courierNumber,
      },
      createdAt: now,
      createdBy: authUserId,
    });

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'shipment.courier_assigned',
      entityType: 'yourobc_shipment',
      entityId: shipmentId,
      entityTitle: `Shipment ${shipment.shipmentNumber}`,
      description: `Assigned courier: ${courier.firstName} ${courier.lastName}`,
      createdAt: now,
    });

    return shipmentId;
  },
});

/**
 * Delete a shipment (soft delete)
 * Only shipments in 'quoted' or 'cancelled' status can be deleted
 *
 * @param authUserId - The authenticated user's ID
 * @param shipmentId - The shipment ID to delete
 * @returns The deleted shipment ID
 */
export const deleteShipment = mutation({
  args: {
    authUserId: v.string(),
    shipmentId: v.id('yourobcShipments'),
  },
  handler: async (ctx, { authUserId, shipmentId }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, SHIPMENT_CONSTANTS.PERMISSIONS.DELETE);

    const shipment = await ctx.db.get(shipmentId);
    if (!shipment) {
      throw new Error('Shipment not found');
    }

    // Check if shipment can be deleted (only quoted or cancelled shipments)
    const deletableStatuses = [SHIPMENT_CONSTANTS.STATUS.QUOTED, SHIPMENT_CONSTANTS.STATUS.CANCELLED] as const;
    if (!deletableStatuses.includes(shipment.currentStatus as typeof deletableStatuses[number])) {
      throw new Error('Cannot delete shipment in current status. Cancel the shipment first.');
    }

    // Check for related invoices
    const hasInvoice = await ctx.db
      .query('yourobcInvoices')
      .withIndex('by_shipment', (q) => q.eq('shipmentId', shipmentId))
      .first();

    if (hasInvoice) {
      throw new Error('Cannot delete shipment with existing invoices');
    }

    // Delete related status history
    const statusHistory = await ctx.db
      .query('yourobcShipmentStatusHistory')
      .withIndex('by_shipment', (q) => q.eq('shipmentId', shipmentId))
      .collect();

    const now = Date.now();

    // Delete status history records (history is immutable, so we delete them)
    for (const history of statusHistory) {
      await ctx.db.delete(history._id);
    }

    // Soft delete shipment
    await ctx.db.patch(shipmentId, {
      deletedAt: now,
      deletedBy: authUserId,
    });
    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'shipment.deleted',
      entityType: 'yourobc_shipment',
      entityId: shipmentId,
      entityTitle: `Shipment ${shipment.shipmentNumber}`,
      description: `Deleted shipment`,
      createdAt: now,
    });

    return shipmentId;
  },
});

/**
 * Complete a shipment (Abschluss)
 * Validates all mandatory fields before marking as completed
 * Based on YOUROBC.md requirements
 */
export const completeShipment = mutation({
  args: {
    authUserId: v.string(),
    shipmentId: v.id('yourobcShipments'),
    confirmations: v.object({
      extraCostsRecorded: v.boolean(),
      documentsComplete: v.boolean(),
      cwtValidated: v.optional(v.boolean()), // NFO only
    }),
  },
  handler: async (ctx, args) => {
    // Authenticate user
    const user = await requireCurrentUser(ctx, args.authUserId);

    // Check permissions
    const hasPermission = await requirePermission(
      ctx,
      args.authUserId,
      SHIPMENT_CONSTANTS.PERMISSIONS.EDIT
    );
    if (!hasPermission) {
      throw new Error('Insufficient permissions to complete shipments');
    }

    // Get shipment
    const shipment = await ctx.db.get(args.shipmentId);
    if (!shipment) {
      throw new Error('Shipment not found');
    }

    // Check soft delete
    if (shipment.deletedAt) {
      throw new Error('Cannot complete a deleted shipment');
    }

    // Import validation here (we'll need to ensure it's available)
    const { validateShipmentAbschluss } = await import('./validation');

    // Validate completion requirements
    const validation = validateShipmentAbschluss(shipment);

    if (!validation.canComplete) {
      throw new Error(
        `Cannot complete shipment. Missing: ${validation.missingFields.join(', ')}`
      );
    }

    // Service-specific validation
    if (shipment.serviceType === 'NFO' && !args.confirmations.cwtValidated) {
      throw new Error('CWT validation required for NFO shipments');
    }

    if (!args.confirmations.extraCostsRecorded) {
      throw new Error('Please confirm extra costs have been recorded');
    }

    if (!args.confirmations.documentsComplete) {
      throw new Error('Please confirm all documents are complete');
    }

    const now = Date.now();

    // Update to completed status
    await ctx.db.patch(args.shipmentId, {
      currentStatus: 'document',
      completedAt: now,
      updatedAt: now,
      updatedBy: args.authUserId,
    });

    // Create status history entry
    await ctx.db.insert('yourobcShipmentStatusHistory', {
      shipmentId: args.shipmentId,
      status: 'document',
      timestamp: now,
      notes: `Shipment completed (Abschluss). All mandatory fields confirmed.`,
      createdBy: args.authUserId,
      createdAt: now,
    });

    // Create audit log
    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: args.authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'shipment.completed',
      entityType: 'yourobc_shipment',
      entityId: args.shipmentId,
      entityTitle: `Shipment ${shipment.shipmentNumber}`,
      description: `Completed shipment (Abschluss)`,
      createdAt: now,
    });

    // TODO: Trigger accounting notification (would be handled by a separate notification system)

    return {
      success: true,
      warnings: validation.warnings,
      shipmentId: args.shipmentId,
    };
  },
});