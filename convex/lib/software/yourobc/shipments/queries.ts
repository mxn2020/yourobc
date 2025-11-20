// convex/lib/software/yourobc/shipments/queries.ts
// Read operations for shipments module

import type { QueryCtx } from '@/generated/server';
import type {
  Shipment,
  ShipmentId,
  ShipmentStatusHistory,
  ShipmentStatusHistoryId,
} from '@/schema/software/yourobc/shipments';
import type {
  ShipmentListOptions,
  ShipmentStatusHistoryListOptions,
  ShipmentStatsSummary,
} from './types';
import {
  canViewShipment,
  canViewStatusHistory,
  validateShipmentExists,
  validateStatusHistoryExists,
} from './permissions';
import { matchesSearchTerm, updateSla } from './utils';
import { SHIPMENTS_CONSTANTS } from './constants';

/**
 * Get current user or throw error
 */
async function requireCurrentUser(ctx: QueryCtx) {
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

// ============================================================================
// Shipment Queries
// ============================================================================

/**
 * Get shipment by ID
 */
export async function getShipmentById(
  ctx: QueryCtx,
  shipmentId: ShipmentId,
  includeDeleted: boolean = false
): Promise<Shipment | null> {
  const user = await requireCurrentUser(ctx);
  const shipment = await ctx.db.get(shipmentId);

  if (!shipment) {
    return null;
  }

  validateShipmentExists(shipment, includeDeleted);

  // Check view permission
  if (!canViewShipment(shipment, user)) {
    throw new Error(SHIPMENTS_CONSTANTS.ERRORS.UNAUTHORIZED_VIEW);
  }

  // Update SLA status
  return {
    ...shipment,
    sla: updateSla(shipment.sla),
  };
}

/**
 * Get shipment by public ID
 */
export async function getShipmentByPublicId(
  ctx: QueryCtx,
  publicId: string,
  includeDeleted: boolean = false
): Promise<Shipment | null> {
  const user = await requireCurrentUser(ctx);
  const shipment = await ctx.db
    .query('yourobcShipments')
    .withIndex('by_public_id', (q) => q.eq('publicId', publicId))
    .first();

  if (!shipment) {
    return null;
  }

  validateShipmentExists(shipment, includeDeleted);

  // Check view permission
  if (!canViewShipment(shipment, user)) {
    throw new Error(SHIPMENTS_CONSTANTS.ERRORS.UNAUTHORIZED_VIEW);
  }

  // Update SLA status
  return {
    ...shipment,
    sla: updateSla(shipment.sla),
  };
}

/**
 * Get shipment by shipment number
 */
export async function getShipmentByNumber(
  ctx: QueryCtx,
  shipmentNumber: string,
  includeDeleted: boolean = false
): Promise<Shipment | null> {
  const user = await requireCurrentUser(ctx);
  const shipment = await ctx.db
    .query('yourobcShipments')
    .withIndex('by_shipmentNumber', (q) => q.eq('shipmentNumber', shipmentNumber))
    .first();

  if (!shipment) {
    return null;
  }

  validateShipmentExists(shipment, includeDeleted);

  // Check view permission
  if (!canViewShipment(shipment, user)) {
    throw new Error(SHIPMENTS_CONSTANTS.ERRORS.UNAUTHORIZED_VIEW);
  }

  // Update SLA status
  return {
    ...shipment,
    sla: updateSla(shipment.sla),
  };
}

/**
 * List shipments with filters and pagination
 */
export async function listShipments(
  ctx: QueryCtx,
  options: ShipmentListOptions = {}
): Promise<Shipment[]> {
  const user = await requireCurrentUser(ctx);
  const {
    filters = {},
    limit = SHIPMENTS_CONSTANTS.DEFAULT_PAGE_SIZE,
    offset = 0,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = options;

  // Start with base query by owner
  let query = ctx.db.query('yourobcShipments').withIndex('by_owner', (q) =>
    q.eq('ownerId', user._id)
  );

  // Collect and filter results
  let results = await query.collect();

  // Apply filters
  results = results.filter((shipment) => {
    // Filter by deleted status
    if (!filters.includeDeleted && shipment.deletedAt) {
      return false;
    }

    // Filter by status
    if (filters.status && shipment.currentStatus !== filters.status) {
      return false;
    }

    // Filter by service type
    if (filters.serviceType && shipment.serviceType !== filters.serviceType) {
      return false;
    }

    // Filter by priority
    if (filters.priority && shipment.priority !== filters.priority) {
      return false;
    }

    // Filter by customer
    if (filters.customerId && shipment.customerId !== filters.customerId) {
      return false;
    }

    // Filter by employee
    if (filters.employeeId && shipment.employeeId !== filters.employeeId) {
      return false;
    }

    // Filter by partner
    if (filters.partnerId && shipment.partnerId !== filters.partnerId) {
      return false;
    }

    // Filter by courier
    if (filters.assignedCourierId && shipment.assignedCourierId !== filters.assignedCourierId) {
      return false;
    }

    // Filter by SLA status
    if (filters.slaStatus) {
      const updatedSla = updateSla(shipment.sla);
      if (updatedSla.status !== filters.slaStatus) {
        return false;
      }
    }

    // Filter by search term
    if (filters.searchTerm && !matchesSearchTerm(shipment, filters.searchTerm)) {
      return false;
    }

    return true;
  });

  // Update SLA status for all results
  results = results.map((shipment) => ({
    ...shipment,
    sla: updateSla(shipment.sla),
  }));

  // Sort results
  results.sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortBy) {
      case 'shipmentNumber':
        aValue = a.shipmentNumber;
        bValue = b.shipmentNumber;
        break;
      case 'sla.deadline':
        aValue = a.sla.deadline;
        bValue = b.sla.deadline;
        break;
      case 'currentStatus':
        aValue = a.currentStatus;
        bValue = b.currentStatus;
        break;
      case 'createdAt':
      default:
        aValue = a.createdAt;
        bValue = b.createdAt;
        break;
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Apply pagination
  return results.slice(offset, offset + limit);
}

/**
 * Get shipments by customer
 */
export async function getShipmentsByCustomer(
  ctx: QueryCtx,
  customerId: string,
  includeDeleted: boolean = false
): Promise<Shipment[]> {
  const user = await requireCurrentUser(ctx);

  const shipments = await ctx.db
    .query('yourobcShipments')
    .withIndex('by_customer', (q) => q.eq('customerId', customerId as any))
    .collect();

  return shipments
    .filter((shipment) => {
      if (!includeDeleted && shipment.deletedAt) return false;
      return canViewShipment(shipment, user);
    })
    .map((shipment) => ({
      ...shipment,
      sla: updateSla(shipment.sla),
    }));
}

/**
 * Get shipment statistics summary
 */
export async function getShipmentStatsSummary(
  ctx: QueryCtx
): Promise<ShipmentStatsSummary> {
  const user = await requireCurrentUser(ctx);

  const shipments = await ctx.db
    .query('yourobcShipments')
    .withIndex('by_owner', (q) => q.eq('ownerId', user._id))
    .filter((q) => q.eq(q.field('deletedAt'), undefined))
    .collect();

  const totalShipments = shipments.length;
  const activeShipments = shipments.filter(
    (s) => !['delivered', 'invoiced', 'cancelled'].includes(s.currentStatus)
  ).length;
  const completedShipments = shipments.filter(
    (s) => s.currentStatus === 'invoiced'
  ).length;
  const cancelledShipments = shipments.filter(
    (s) => s.currentStatus === 'cancelled'
  ).length;

  // Calculate SLA stats
  const shipmentsWithUpdatedSla = shipments.map((s) => ({
    ...s,
    sla: updateSla(s.sla),
  }));

  const onTimeShipments = shipmentsWithUpdatedSla.filter(
    (s) => s.sla.status === 'on_time'
  ).length;
  const overdueShipments = shipmentsWithUpdatedSla.filter(
    (s) => s.sla.status === 'overdue'
  ).length;

  // Calculate total revenue
  const totalRevenue = shipments.reduce(
    (sum, s) => sum + (s.totalPrice?.amount || s.agreedPrice.amount),
    0
  );

  // Calculate average delivery time (for completed shipments)
  const completedWithTimes = shipments.filter(
    (s) => s.completedAt && s.createdAt
  );
  const averageDeliveryTime =
    completedWithTimes.length > 0
      ? completedWithTimes.reduce(
          (sum, s) => sum + (s.completedAt! - s.createdAt),
          0
        ) / completedWithTimes.length
      : 0;

  return {
    totalShipments,
    activeShipments,
    completedShipments,
    cancelledShipments,
    onTimeShipments,
    overdueShipments,
    totalRevenue,
    averageDeliveryTime,
  };
}

// ============================================================================
// Shipment Status History Queries
// ============================================================================

/**
 * Get status history by ID
 */
export async function getStatusHistoryById(
  ctx: QueryCtx,
  statusHistoryId: ShipmentStatusHistoryId,
  includeDeleted: boolean = false
): Promise<ShipmentStatusHistory | null> {
  const user = await requireCurrentUser(ctx);
  const statusHistory = await ctx.db.get(statusHistoryId);

  if (!statusHistory) {
    return null;
  }

  validateStatusHistoryExists(statusHistory, includeDeleted);

  // Check view permission
  if (!canViewStatusHistory(statusHistory, user)) {
    throw new Error(SHIPMENTS_CONSTANTS.ERRORS.UNAUTHORIZED_VIEW);
  }

  return statusHistory;
}

/**
 * Get status history by public ID
 */
export async function getStatusHistoryByPublicId(
  ctx: QueryCtx,
  publicId: string,
  includeDeleted: boolean = false
): Promise<ShipmentStatusHistory | null> {
  const user = await requireCurrentUser(ctx);
  const statusHistory = await ctx.db
    .query('yourobcShipmentStatusHistory')
    .withIndex('by_public_id', (q) => q.eq('publicId', publicId))
    .first();

  if (!statusHistory) {
    return null;
  }

  validateStatusHistoryExists(statusHistory, includeDeleted);

  // Check view permission
  if (!canViewStatusHistory(statusHistory, user)) {
    throw new Error(SHIPMENTS_CONSTANTS.ERRORS.UNAUTHORIZED_VIEW);
  }

  return statusHistory;
}

/**
 * Get status history for a shipment
 */
export async function getStatusHistoryForShipment(
  ctx: QueryCtx,
  shipmentId: ShipmentId,
  includeDeleted: boolean = false
): Promise<ShipmentStatusHistory[]> {
  const user = await requireCurrentUser(ctx);

  const statusHistory = await ctx.db
    .query('yourobcShipmentStatusHistory')
    .withIndex('by_shipment', (q) => q.eq('shipmentId', shipmentId))
    .collect();

  return statusHistory
    .filter((entry) => {
      if (!includeDeleted && entry.deletedAt) return false;
      return canViewStatusHistory(entry, user);
    })
    .sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * List status history with filters and pagination
 */
export async function listStatusHistory(
  ctx: QueryCtx,
  options: ShipmentStatusHistoryListOptions = {}
): Promise<ShipmentStatusHistory[]> {
  const user = await requireCurrentUser(ctx);
  const {
    filters = {},
    limit = SHIPMENTS_CONSTANTS.DEFAULT_PAGE_SIZE,
    offset = 0,
    sortBy = 'timestamp',
    sortOrder = 'desc',
  } = options;

  // Start with base query by owner
  let query = ctx.db
    .query('yourobcShipmentStatusHistory')
    .withIndex('by_owner', (q) => q.eq('ownerId', user._id));

  // Collect and filter results
  let results = await query.collect();

  // Apply filters
  results = results.filter((entry) => {
    // Filter by deleted status
    if (!filters.includeDeleted && entry.deletedAt) {
      return false;
    }

    // Filter by shipment
    if (filters.shipmentId && entry.shipmentId !== filters.shipmentId) {
      return false;
    }

    // Filter by status
    if (filters.status && entry.status !== filters.status) {
      return false;
    }

    // Filter by date range
    if (filters.startDate && entry.timestamp < filters.startDate) {
      return false;
    }
    if (filters.endDate && entry.timestamp > filters.endDate) {
      return false;
    }

    return true;
  });

  // Sort results
  results.sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortBy) {
      case 'timestamp':
        aValue = a.timestamp;
        bValue = b.timestamp;
        break;
      case 'createdAt':
      default:
        aValue = a.createdAt;
        bValue = b.createdAt;
        break;
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Apply pagination
  return results.slice(offset, offset + limit);
}
