// convex/lib/yourobc/shipments/queries.ts
// Read operations for shipments module

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { notDeleted } from '@/shared/db.helper';
import { shipmentsValidators } from '@/schema/yourobc/shipments/validators';
import { filterShipmentsByAccess, requireViewShipmentAccess } from './permissions';
import type { ShipmentListResponse, ShipmentFilters } from './types';
import { baseValidators } from '@/schema/base.validators';

/**
 * Get paginated list of shipments with filtering (cursor-based)
 * 🔒 Authentication: Required
 * 🔒 Authorization: User sees own items, admins see all
 */
export const getShipments = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
    filters: v.optional(v.object({
      status: v.optional(v.array(shipmentsValidators.status)),
      serviceType: v.optional(v.array(baseValidators.serviceType)),
      priority: v.optional(v.array(shipmentsValidators.priority)),
      customerId: v.optional(v.id('yourobcCustomers')),
      assignedCourierId: v.optional(v.id('yourobcCouriers')),
      employeeId: v.optional(v.id('yourobcEmployees')),
      partnerId: v.optional(v.id('yourobcPartners')),
      search: v.optional(v.string()),
      dateFrom: v.optional(v.number()),
      dateTo: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args): Promise<ShipmentListResponse & { cursor?: string }> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, cursor, filters = {} } = args;

    const isAdmin = user.role === 'admin' || user.role === 'superadmin';

    // Build indexed query - use compound index if available
    const q = (() => {
      // Admin global listing
      if (isAdmin) {
        return ctx.db
          .query('yourobcShipments')
          .withIndex('by_created_at', iq => iq.gte('createdAt', 0))
          .filter(notDeleted);
      }

      // Single status filter with owner
      if (filters.status?.length === 1) {
        return ctx.db
          .query('yourobcShipments')
          .withIndex('by_owner_and_status', iq =>
            iq.eq('ownerId', user._id).eq('currentStatus', filters.status![0])
          )
          .filter(notDeleted);
      }

      // Default: owner only
      return ctx.db
        .query('yourobcShipments')
        .withIndex('by_owner_id', iq => iq.eq('ownerId', user._id))
        .filter(notDeleted);
    })();

    // Paginate
    const page = await q.order('desc').paginate({
      numItems: limit,
      cursor: cursor ?? null,
    });

    // Apply permission filtering
    let items = await filterShipmentsByAccess(ctx, page.page, user);

    // Apply additional filters in-memory (for multiple values)
    if (filters.status && filters.status.length > 1) {
      items = items.filter(i => filters.status!.includes(i.currentStatus));
    }

    // Apply service type filter
    if (filters.serviceType?.length) {
      items = items.filter(item =>
        filters.serviceType!.includes(item.serviceType)
      );
    }

    // Apply priority filter
    if (filters.priority?.length) {
      items = items.filter(item =>
        filters.priority!.includes(item.priority)
      );
    }

    // Apply customer filter
    if (filters.customerId) {
      items = items.filter(item => item.customerId === filters.customerId);
    }

    // Apply courier filter
    if (filters.assignedCourierId) {
      items = items.filter(item => item.assignedCourierId === filters.assignedCourierId);
    }

    // Apply employee filter
    if (filters.employeeId) {
      items = items.filter(item => item.employeeId === filters.employeeId);
    }

    // Apply partner filter
    if (filters.partnerId) {
      items = items.filter(item => item.partnerId === filters.partnerId);
    }

    // Apply search filter
    if (filters.search) {
      const term = filters.search.toLowerCase();
      items = items.filter(item =>
        item.shipmentNumber.toLowerCase().includes(term) ||
        item.awbNumber?.toLowerCase().includes(term) ||
        item.customerReference?.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term)
      );
    }

    // Apply date filters
    if (filters.dateFrom) {
      items = items.filter(item => item.createdAt >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      items = items.filter(item => item.createdAt <= filters.dateTo!);
    }

    return {
      items,
      returnedCount: items.length,
      hasMore: !page.isDone,
      cursor: page.continueCursor,
    };
  },
});

/**
 * Get single shipment by ID
 */
export const getShipment = query({
  args: {
    shipmentId: v.id('yourobcShipments'),
  },
  handler: async (ctx, { shipmentId }) => {
    const user = await requireCurrentUser(ctx);

    const shipment = await ctx.db.get(shipmentId);
    if (!shipment || shipment.deletedAt) {
      throw new Error('Shipment not found');
    }

    await requireViewShipmentAccess(ctx, shipment, user);

    return shipment;
  },
});

/**
 * Get shipment by public ID
 */
export const getShipmentByPublicId = query({
  args: {
    publicId: v.string(),
  },
  handler: async (ctx, { publicId }) => {
    const user = await requireCurrentUser(ctx);

    const shipment = await ctx.db
      .query('yourobcShipments')
      .withIndex('by_public_id', q => q.eq('publicId', publicId))
      .filter(notDeleted)
      .first();

    if (!shipment) {
      throw new Error('Shipment not found');
    }

    await requireViewShipmentAccess(ctx, shipment, user);

    return shipment;
  },
});

/**
 * Get shipment by shipment number
 */
export const getShipmentByNumber = query({
  args: {
    shipmentNumber: v.string(),
  },
  handler: async (ctx, { shipmentNumber }) => {
    const user = await requireCurrentUser(ctx);

    const shipment = await ctx.db
      .query('yourobcShipments')
      .withIndex('by_shipmentNumber', q => q.eq('shipmentNumber', shipmentNumber))
      .filter(notDeleted)
      .first();

    if (!shipment) {
      throw new Error('Shipment not found');
    }

    await requireViewShipmentAccess(ctx, shipment, user);

    return shipment;
  },
});

/**
 * Get shipment status history
 */
export const getShipmentStatusHistory = query({
  args: {
    shipmentId: v.id('yourobcShipments'),
  },
  handler: async (ctx, { shipmentId }) => {
    const user = await requireCurrentUser(ctx);

    // Verify access to shipment
    const shipment = await ctx.db.get(shipmentId);
    if (!shipment || shipment.deletedAt) {
      throw new Error('Shipment not found');
    }

    await requireViewShipmentAccess(ctx, shipment, user);

    // Get status history
    const history = await ctx.db
      .query('yourobcShipmentStatusHistory')
      .withIndex('by_shipment_timestamp', q => q.eq('shipmentId', shipmentId))
      .collect();

    // Sort by timestamp (newest first)
    history.sort((a, b) => b.timestamp - a.timestamp);

    return history;
  },
});

/**
 * Get shipments by customer
 */
export const getShipmentsByCustomer = query({
  args: {
    customerId: v.id('yourobcCustomers'),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { customerId, limit = 50 }) => {
    const user = await requireCurrentUser(ctx);

    let shipments = await ctx.db
      .query('yourobcShipments')
      .withIndex('by_customer', q => q.eq('customerId', customerId))
      .filter(notDeleted)
      .collect();

    // Apply access filtering
    shipments = await filterShipmentsByAccess(ctx, shipments, user);

    // Sort by creation date (newest first)
    shipments.sort((a, b) => b.createdAt - a.createdAt);

    return shipments.slice(0, limit);
  },
});

/**
 * Get shipments assigned to courier
 */
export const getShipmentsByCourier = query({
  args: {
    courierId: v.id('yourobcCouriers'),
  },
  handler: async (ctx, { courierId }) => {
    const user = await requireCurrentUser(ctx);

    let shipments = await ctx.db
      .query('yourobcShipments')
      .withIndex('by_assigned_courier', q => q.eq('assignedCourierId', courierId))
      .filter(notDeleted)
      .collect();

    // Apply access filtering
    shipments = await filterShipmentsByAccess(ctx, shipments, user);

    return shipments;
  },
});

/**
 * Get shipments assigned to employee
 */
export const getShipmentsByEmployee = query({
  args: {
    employeeId: v.id('yourobcEmployees'),
  },
  handler: async (ctx, { employeeId }) => {
    const user = await requireCurrentUser(ctx);

    let shipments = await ctx.db
      .query('yourobcShipments')
      .withIndex('by_employee', q => q.eq('employeeId', employeeId))
      .filter(notDeleted)
      .collect();

    // Apply access filtering
    shipments = await filterShipmentsByAccess(ctx, shipments, user);

    return shipments;
  },
});

/**
 * Get shipment statistics
 */
export const getShipmentStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);

    const shipments = await ctx.db
      .query('yourobcShipments')
      .withIndex('by_owner_id', q => q.eq('ownerId', user._id))
      .filter(notDeleted)
      .collect();

    const accessible = await filterShipmentsByAccess(ctx, shipments, user);

    return {
      total: accessible.length,
      byStatus: {
        quoted: accessible.filter(item => item.currentStatus === 'quoted').length,
        booked: accessible.filter(item => item.currentStatus === 'booked').length,
        pickup: accessible.filter(item => item.currentStatus === 'pickup').length,
        in_transit: accessible.filter(item => item.currentStatus === 'in_transit').length,
        delivered: accessible.filter(item => item.currentStatus === 'delivered').length,
        customs: accessible.filter(item => item.currentStatus === 'customs').length,
        document: accessible.filter(item => item.currentStatus === 'document').length,
        invoiced: accessible.filter(item => item.currentStatus === 'invoiced').length,
        cancelled: accessible.filter(item => item.currentStatus === 'cancelled').length,
      },
      byServiceType: {
        OBC: accessible.filter(item => item.serviceType === 'OBC').length,
        NFO: accessible.filter(item => item.serviceType === 'NFO').length,
      },
      byPriority: {
        standard: accessible.filter(item => item.priority === 'standard').length,
        urgent: accessible.filter(item => item.priority === 'urgent').length,
        critical: accessible.filter(item => item.priority === 'critical').length,
      },
    };
  },
});
