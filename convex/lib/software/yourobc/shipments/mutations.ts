// convex/lib/software/yourobc/shipments/mutations.ts
// Write operations for shipments module

import type { MutationCtx } from '@/generated/server';
import type { Id } from '@/generated/dataModel';
import type {
  Shipment,
  ShipmentId,
  ShipmentStatusHistory,
  ShipmentStatusHistoryId,
  CreateShipmentInput,
  UpdateShipmentInput,
  CreateShipmentStatusHistoryInput,
  UpdateShipmentStatusHistoryInput,
  ShipmentStatus,
} from '@/schema/software/yourobc/shipments';
import type { StatusChangeData, SlaUpdateData, AssignmentData } from './types';
import {
  canEditShipment,
  canDeleteShipment,
  canRestoreShipment,
  canEditStatusHistory,
  canDeleteStatusHistory,
  canRestoreStatusHistory,
  requireEditPermission,
  requireDeletePermission,
  requireRestorePermission,
  requireEditStatusHistoryPermission,
  requireDeleteStatusHistoryPermission,
  requireRestoreStatusHistoryPermission,
  validateShipmentExists,
  validateStatusHistoryExists,
} from './permissions';
import {
  validateShipmentData,
  validateShipmentUpdateData,
  validateStatusHistoryData,
  validateStatusHistoryUpdateData,
  validateStatusTransition,
  generatePublicId,
  generateStatusHistoryPublicId,
  updateSla,
  calculateSlaStatus,
  calculateRemainingHours,
} from './utils';
import { SHIPMENTS_CONSTANTS } from './constants';

/**
 * Get current user or throw error
 */
async function requireCurrentUser(ctx: MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error('Authentication required');
  }

  const user = await ctx.db
    .query('userProfiles')
    .filter((q) => q.eq(q.field('authSubject'), identity.subject))
    .first();

  if (!user) {
    throw new Error('User profile not found');
  }

  return user;
}

/**
 * Create an audit log entry
 */
async function createAuditLog(
  ctx: MutationCtx,
  action: string,
  entityType: string,
  entityId: string,
  entityTitle: string,
  description: string,
  userId: Id<'userProfiles'>,
  userName: string,
  metadata?: Record<string, any>
): Promise<void> {
  const now = Date.now();
  await ctx.db.insert('auditLogs', {
    userId,
    userName,
    action,
    entityType,
    entityId,
    entityTitle,
    description,
    metadata: metadata || {},
    createdAt: now,
    createdBy: userId,
    updatedAt: now,
  });
}

// ============================================================================
// Shipment Mutations
// ============================================================================

/**
 * Create shipment
 */
export async function createShipment(
  ctx: MutationCtx,
  data: CreateShipmentInput
): Promise<ShipmentId> {
  // 1. AUTH: Get authenticated user
  const user = await requireCurrentUser(ctx);

  // 2. VALIDATE: Check data validity
  validateShipmentData(data);

  // 3. CHECK: Verify shipment number is unique
  const existingShipment = await ctx.db
    .query('yourobcShipments')
    .withIndex('by_shipmentNumber', (q) =>
      q.eq('shipmentNumber', data.shipmentNumber)
    )
    .first();

  if (existingShipment && !existingShipment.deletedAt) {
    throw new Error(SHIPMENTS_CONSTANTS.ERRORS.DUPLICATE_SHIPMENT_NUMBER);
  }

  // 4. PROCESS: Generate IDs and prepare data
  const publicId = generatePublicId();
  const now = Date.now();

  // Update SLA with current status
  const slaWithStatus = {
    ...data.sla,
    status: calculateSlaStatus(data.sla.deadline),
    remainingHours: calculateRemainingHours(data.sla.deadline),
  };

  // 5. CREATE: Insert into database
  const shipmentId = await ctx.db.insert('yourobcShipments', {
    publicId,
    shipmentNumber: data.shipmentNumber.trim(),
    awbNumber: data.awbNumber?.trim(),
    customerReference: data.customerReference?.trim(),
    serviceType: data.serviceType,
    priority: data.priority,
    customerId: data.customerId,
    quoteId: data.quoteId,
    origin: data.origin,
    destination: data.destination,
    dimensions: data.dimensions,
    description: data.description.trim(),
    specialInstructions: data.specialInstructions?.trim(),
    currentStatus: data.currentStatus,
    sla: slaWithStatus,
    nextTask: data.nextTask,
    assignedCourierId: data.assignedCourierId,
    courierInstructions: data.courierInstructions?.trim(),
    employeeId: data.employeeId,
    partnerId: data.partnerId,
    partnerReference: data.partnerReference?.trim(),
    routing: data.routing,
    agreedPrice: data.agreedPrice,
    actualCosts: data.actualCosts,
    totalPrice: data.totalPrice,
    purchasePrice: data.purchasePrice,
    commission: data.commission,
    documentStatus: data.documentStatus,
    customsInfo: data.customsInfo,
    pickupTime: data.pickupTime,
    deliveryTime: data.deliveryTime,
    communicationChannel: data.communicationChannel,
    completedAt: undefined,
    tags: data.tags || [],
    category: data.category,
    customFields: {},
    ownerId: user._id,
    createdBy: user._id,
    createdAt: now,
    updatedBy: user._id,
    updatedAt: now,
  });

  // 6. CREATE STATUS HISTORY: Create initial status history entry
  await createShipmentStatusHistory(ctx, {
    shipmentId,
    status: data.currentStatus,
    timestamp: now,
    notes: 'Shipment created',
  });

  // 7. AUDIT: Log the creation
  await createAuditLog(
    ctx,
    'create',
    'shipment',
    shipmentId,
    data.shipmentNumber,
    `Created shipment ${data.shipmentNumber}`,
    user._id,
    user.name || user.email || 'Unknown'
  );

  return shipmentId;
}

/**
 * Update shipment
 */
export async function updateShipment(
  ctx: MutationCtx,
  shipmentId: ShipmentId,
  data: UpdateShipmentInput
): Promise<void> {
  // 1. AUTH: Get authenticated user
  const user = await requireCurrentUser(ctx);

  // 2. VALIDATE: Check data validity
  validateShipmentUpdateData(data);

  // 3. GET: Fetch existing shipment
  const shipment = await ctx.db.get(shipmentId);
  validateShipmentExists(shipment);

  // 4. PERMISSION: Check edit permission
  requireEditPermission(shipment, user);

  // 5. CHECK: If updating shipment number, verify it's unique
  if (data.shipmentNumber && data.shipmentNumber !== shipment.shipmentNumber) {
    const existingShipment = await ctx.db
      .query('yourobcShipments')
      .withIndex('by_shipmentNumber', (q) =>
        q.eq('shipmentNumber', data.shipmentNumber)
      )
      .first();

    if (existingShipment && existingShipment._id !== shipmentId && !existingShipment.deletedAt) {
      throw new Error(SHIPMENTS_CONSTANTS.ERRORS.DUPLICATE_SHIPMENT_NUMBER);
    }
  }

  // 6. PROCESS: Prepare update data
  const now = Date.now();
  const updates: Partial<Shipment> = {
    updatedBy: user._id,
    updatedAt: now,
  };

  // Add fields that are being updated
  if (data.shipmentNumber !== undefined) updates.shipmentNumber = data.shipmentNumber.trim();
  if (data.awbNumber !== undefined) updates.awbNumber = data.awbNumber?.trim();
  if (data.customerReference !== undefined) updates.customerReference = data.customerReference?.trim();
  if (data.serviceType !== undefined) updates.serviceType = data.serviceType;
  if (data.priority !== undefined) updates.priority = data.priority;
  if (data.customerId !== undefined) updates.customerId = data.customerId;
  if (data.quoteId !== undefined) updates.quoteId = data.quoteId;
  if (data.origin !== undefined) updates.origin = data.origin;
  if (data.destination !== undefined) updates.destination = data.destination;
  if (data.dimensions !== undefined) updates.dimensions = data.dimensions;
  if (data.description !== undefined) updates.description = data.description.trim();
  if (data.specialInstructions !== undefined) updates.specialInstructions = data.specialInstructions?.trim();
  if (data.nextTask !== undefined) updates.nextTask = data.nextTask;
  if (data.assignedCourierId !== undefined) updates.assignedCourierId = data.assignedCourierId;
  if (data.courierInstructions !== undefined) updates.courierInstructions = data.courierInstructions?.trim();
  if (data.employeeId !== undefined) updates.employeeId = data.employeeId;
  if (data.partnerId !== undefined) updates.partnerId = data.partnerId;
  if (data.partnerReference !== undefined) updates.partnerReference = data.partnerReference?.trim();
  if (data.routing !== undefined) updates.routing = data.routing;
  if (data.agreedPrice !== undefined) updates.agreedPrice = data.agreedPrice;
  if (data.actualCosts !== undefined) updates.actualCosts = data.actualCosts;
  if (data.totalPrice !== undefined) updates.totalPrice = data.totalPrice;
  if (data.purchasePrice !== undefined) updates.purchasePrice = data.purchasePrice;
  if (data.commission !== undefined) updates.commission = data.commission;
  if (data.documentStatus !== undefined) updates.documentStatus = data.documentStatus;
  if (data.customsInfo !== undefined) updates.customsInfo = data.customsInfo;
  if (data.pickupTime !== undefined) updates.pickupTime = data.pickupTime;
  if (data.deliveryTime !== undefined) updates.deliveryTime = data.deliveryTime;
  if (data.communicationChannel !== undefined) updates.communicationChannel = data.communicationChannel;
  if (data.completedAt !== undefined) updates.completedAt = data.completedAt;
  if (data.tags !== undefined) updates.tags = data.tags;
  if (data.category !== undefined) updates.category = data.category;

  // Handle SLA update
  if (data.sla !== undefined) {
    updates.sla = {
      ...data.sla,
      status: calculateSlaStatus(data.sla.deadline),
      remainingHours: calculateRemainingHours(data.sla.deadline),
    };
  }

  // Handle status change
  if (data.currentStatus !== undefined && data.currentStatus !== shipment.currentStatus) {
    validateStatusTransition(shipment.currentStatus, data.currentStatus);
    updates.currentStatus = data.currentStatus;

    // Create status history entry
    await createShipmentStatusHistory(ctx, {
      shipmentId,
      status: data.currentStatus,
      timestamp: now,
      notes: 'Status changed',
    });
  }

  // 7. UPDATE: Apply updates
  await ctx.db.patch(shipmentId, updates);

  // 8. AUDIT: Log the update
  await createAuditLog(
    ctx,
    'update',
    'shipment',
    shipmentId,
    updates.shipmentNumber || shipment.shipmentNumber,
    `Updated shipment ${updates.shipmentNumber || shipment.shipmentNumber}`,
    user._id,
    user.name || user.email || 'Unknown',
    { updates }
  );
}

/**
 * Change shipment status
 */
export async function changeShipmentStatus(
  ctx: MutationCtx,
  data: StatusChangeData
): Promise<void> {
  const user = await requireCurrentUser(ctx);

  const shipment = await ctx.db.get(data.shipmentId);
  validateShipmentExists(shipment);
  requireEditPermission(shipment, user);

  // Validate status transition
  validateStatusTransition(shipment.currentStatus, data.newStatus);

  const now = Date.now();

  // Update shipment status
  await ctx.db.patch(data.shipmentId, {
    currentStatus: data.newStatus,
    updatedBy: user._id,
    updatedAt: now,
  });

  // Create status history entry
  await createShipmentStatusHistory(ctx, {
    shipmentId: data.shipmentId,
    status: data.newStatus,
    timestamp: now,
    location: data.location,
    notes: data.notes,
    metadata: data.metadata,
  });

  // Audit log
  await createAuditLog(
    ctx,
    'status_change',
    'shipment',
    data.shipmentId,
    shipment.shipmentNumber,
    `Changed status from ${shipment.currentStatus} to ${data.newStatus}`,
    user._id,
    user.name || user.email || 'Unknown',
    { oldStatus: shipment.currentStatus, newStatus: data.newStatus }
  );
}

/**
 * Delete shipment (soft delete)
 */
export async function deleteShipment(
  ctx: MutationCtx,
  shipmentId: ShipmentId
): Promise<void> {
  const user = await requireCurrentUser(ctx);

  const shipment = await ctx.db.get(shipmentId);
  validateShipmentExists(shipment);
  requireDeletePermission(shipment, user);

  const now = Date.now();

  await ctx.db.patch(shipmentId, {
    deletedAt: now,
    deletedBy: user._id,
    updatedBy: user._id,
    updatedAt: now,
  });

  await createAuditLog(
    ctx,
    'delete',
    'shipment',
    shipmentId,
    shipment.shipmentNumber,
    `Deleted shipment ${shipment.shipmentNumber}`,
    user._id,
    user.name || user.email || 'Unknown'
  );
}

/**
 * Restore shipment
 */
export async function restoreShipment(
  ctx: MutationCtx,
  shipmentId: ShipmentId
): Promise<void> {
  const user = await requireCurrentUser(ctx);

  const shipment = await ctx.db.get(shipmentId);
  if (!shipment) {
    throw new Error(SHIPMENTS_CONSTANTS.ERRORS.NOT_FOUND);
  }

  requireRestorePermission(shipment, user);

  const now = Date.now();

  await ctx.db.patch(shipmentId, {
    deletedAt: undefined,
    deletedBy: undefined,
    updatedBy: user._id,
    updatedAt: now,
  });

  await createAuditLog(
    ctx,
    'restore',
    'shipment',
    shipmentId,
    shipment.shipmentNumber,
    `Restored shipment ${shipment.shipmentNumber}`,
    user._id,
    user.name || user.email || 'Unknown'
  );
}

// ============================================================================
// Shipment Status History Mutations
// ============================================================================

/**
 * Create shipment status history entry
 */
export async function createShipmentStatusHistory(
  ctx: MutationCtx,
  data: CreateShipmentStatusHistoryInput
): Promise<ShipmentStatusHistoryId> {
  const user = await requireCurrentUser(ctx);

  // Validate data
  validateStatusHistoryData(data);

  // Verify shipment exists
  const shipment = await ctx.db.get(data.shipmentId);
  validateShipmentExists(shipment);

  // Generate public ID and timestamp
  const publicId = generateStatusHistoryPublicId();
  const now = Date.now();

  // Create status history entry
  const statusHistoryId = await ctx.db.insert('yourobcShipmentStatusHistory', {
    publicId,
    shipmentId: data.shipmentId,
    status: data.status,
    timestamp: data.timestamp,
    location: data.location,
    notes: data.notes,
    metadata: data.metadata,
    ownerId: user._id,
    createdBy: user._id,
    createdAt: now,
  });

  return statusHistoryId;
}

/**
 * Update shipment status history entry
 */
export async function updateShipmentStatusHistory(
  ctx: MutationCtx,
  statusHistoryId: ShipmentStatusHistoryId,
  data: UpdateShipmentStatusHistoryInput
): Promise<void> {
  const user = await requireCurrentUser(ctx);

  // Validate data
  validateStatusHistoryUpdateData(data);

  // Get existing entry
  const statusHistory = await ctx.db.get(statusHistoryId);
  validateStatusHistoryExists(statusHistory);

  // Check permission
  requireEditStatusHistoryPermission(statusHistory, user);

  // Prepare updates
  const now = Date.now();
  const updates: Partial<ShipmentStatusHistory> = {
    updatedBy: user._id,
    updatedAt: now,
  };

  if (data.status !== undefined) updates.status = data.status;
  if (data.timestamp !== undefined) updates.timestamp = data.timestamp;
  if (data.location !== undefined) updates.location = data.location;
  if (data.notes !== undefined) updates.notes = data.notes;
  if (data.metadata !== undefined) updates.metadata = data.metadata;

  // Apply updates
  await ctx.db.patch(statusHistoryId, updates);
}

/**
 * Delete shipment status history entry (soft delete)
 */
export async function deleteShipmentStatusHistory(
  ctx: MutationCtx,
  statusHistoryId: ShipmentStatusHistoryId
): Promise<void> {
  const user = await requireCurrentUser(ctx);

  const statusHistory = await ctx.db.get(statusHistoryId);
  validateStatusHistoryExists(statusHistory);
  requireDeleteStatusHistoryPermission(statusHistory, user);

  const now = Date.now();

  await ctx.db.patch(statusHistoryId, {
    deletedAt: now,
    deletedBy: user._id,
    updatedBy: user._id,
    updatedAt: now,
  });
}

/**
 * Restore shipment status history entry
 */
export async function restoreShipmentStatusHistory(
  ctx: MutationCtx,
  statusHistoryId: ShipmentStatusHistoryId
): Promise<void> {
  const user = await requireCurrentUser(ctx);

  const statusHistory = await ctx.db.get(statusHistoryId);
  if (!statusHistory) {
    throw new Error(SHIPMENTS_CONSTANTS.ERRORS.STATUS_HISTORY_NOT_FOUND);
  }

  requireRestoreStatusHistoryPermission(statusHistory, user);

  const now = Date.now();

  await ctx.db.patch(statusHistoryId, {
    deletedAt: undefined,
    deletedBy: undefined,
    updatedBy: user._id,
    updatedAt: now,
  });
}
