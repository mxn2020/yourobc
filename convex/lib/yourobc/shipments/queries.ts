/**
 * YourOBC Shipments Queries
 *
 * This module handles all shipment-related queries including fetching,
 * filtering, searching, and statistics.
 *
 * @module convex/lib/yourobc/shipments/queries
 */

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';
import { SHIPMENT_CONSTANTS } from './constants';
import {
  calculateSLA,
  isShipmentOverdue,
  isShipmentActive,
  calculateDeliveryTime,
} from './utils';

/**
 * Get shipments with optional filtering, sorting, and pagination
 *
 * @param authUserId - The authenticated user's ID
 * @param options - Query options including filters, sort, and pagination
 * @returns Paginated list of shipments with related data
 */
export const getShipments = query({
  args: {
    authUserId: v.string(),
    options: v.optional(v.object({
      limit: v.optional(v.number()),
      offset: v.optional(v.number()),
      sortBy: v.optional(v.string()),
      sortOrder: v.optional(v.union(v.literal('asc'), v.literal('desc'))),
      filters: v.optional(v.object({
        status: v.optional(v.array(v.string())),
        serviceType: v.optional(v.array(v.string())),
        priority: v.optional(v.array(v.string())),
        slaStatus: v.optional(v.array(v.string())),
        customerId: v.optional(v.array(v.id('yourobcCustomers'))),
        assignedCourierId: v.optional(v.array(v.id('yourobcCouriers'))),
        partnerId: v.optional(v.array(v.id('yourobcPartners'))),
        originCountry: v.optional(v.array(v.string())),
        destinationCountry: v.optional(v.array(v.string())),
        dateRange: v.optional(v.object({
          start: v.number(),
          end: v.number(),
          field: v.optional(v.string()),
        })),
        search: v.optional(v.string()),
      }))
    }))
  },
  handler: async (ctx, { authUserId, options = {} }) => {
    await requirePermission(ctx, authUserId, SHIPMENT_CONSTANTS.PERMISSIONS.VIEW);

    const {
      limit = 50,
      offset = 0,
      sortOrder = 'desc',
      filters = {}
    } = options;

    let shipmentsQuery;

    // Apply simple filters that can use indexes
    if (filters.status?.length === 1) {
      shipmentsQuery = ctx.db
      .query('yourobcShipments')
      .withIndex('by_status', (q) => q.eq('currentStatus', filters.status![0] as 'cancelled' | 'quoted' | 'booked' | 'pickup' | 'in_transit' | 'delivered' | 'document' | 'invoiced'));
    } else if (filters.customerId?.length === 1) {
      shipmentsQuery = ctx.db
      .query('yourobcShipments')
      .withIndex('by_customer', (q) => q.eq('customerId', filters.customerId![0]));
    } else if (filters.assignedCourierId?.length === 1) {
      shipmentsQuery = ctx.db
      .query('yourobcShipments')
      .withIndex('by_assignedCourier', (q) => q.eq('assignedCourierId', filters.assignedCourierId![0]));
    } else if (filters.partnerId?.length === 1) {
      shipmentsQuery = ctx.db
      .query('yourobcShipments')
      .withIndex('by_partner', (q) => q.eq('partnerId', filters.partnerId![0]));
    } else if (filters.serviceType?.length === 1) {
      shipmentsQuery = ctx.db
      .query('yourobcShipments')
      .withIndex('by_serviceType', (q) => q.eq('serviceType', filters.serviceType![0] as 'OBC' | 'NFO'));
    }

    const shipments = await ctx.db
      .query('yourobcShipments')
      .order(sortOrder === 'desc' ? 'desc' : 'asc')
      .collect();

    let filteredShipments = shipments;

    // Apply complex filters
    if (filters.status?.length && filters.status.length > 1) {
      filteredShipments = filteredShipments.filter(shipment =>
        filters.status!.includes(shipment.currentStatus)
      );
    }

    if (filters.serviceType?.length && filters.serviceType.length > 1) {
      filteredShipments = filteredShipments.filter(shipment =>
        filters.serviceType!.includes(shipment.serviceType)
      );
    }

    if (filters.priority?.length) {
      filteredShipments = filteredShipments.filter(shipment =>
        filters.priority!.includes(shipment.priority)
      );
    }

    if (filters.slaStatus?.length) {
      filteredShipments = filteredShipments.filter(shipment => {
        const currentSla = calculateSLA(shipment.sla.deadline, shipment.currentStatus);
        return filters.slaStatus!.includes(currentSla.status);
      });
    }

    if (filters.customerId?.length && filters.customerId.length > 1) {
      filteredShipments = filteredShipments.filter(shipment =>
        filters.customerId!.includes(shipment.customerId)
      );
    }

    if (filters.assignedCourierId?.length && filters.assignedCourierId.length > 1) {
      filteredShipments = filteredShipments.filter(shipment =>
        shipment.assignedCourierId && filters.assignedCourierId!.includes(shipment.assignedCourierId)
      );
    }

    if (filters.partnerId?.length && filters.partnerId.length > 1) {
      filteredShipments = filteredShipments.filter(shipment =>
        shipment.partnerId && filters.partnerId!.includes(shipment.partnerId)
      );
    }

    if (filters.originCountry?.length) {
      filteredShipments = filteredShipments.filter(shipment =>
        filters.originCountry!.includes(shipment.origin.countryCode)
      );
    }

    if (filters.destinationCountry?.length) {
      filteredShipments = filteredShipments.filter(shipment =>
        filters.destinationCountry!.includes(shipment.destination.countryCode)
      );
    }

    if (filters.dateRange) {
      const { start, end, field = 'createdAt' } = filters.dateRange;
      filteredShipments = filteredShipments.filter(shipment => {
        const dateValue = field === 'deadline' ? shipment.sla.deadline :
                         field === 'completedAt' ? (shipment.completedAt || 0) :
                         shipment.createdAt;
        return dateValue >= start && dateValue <= end;
      });
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredShipments = filteredShipments.filter(shipment =>
        shipment.shipmentNumber.toLowerCase().includes(searchTerm) ||
        shipment.awbNumber?.toLowerCase().includes(searchTerm) ||
        shipment.customerReference?.toLowerCase().includes(searchTerm) ||
        shipment.description.toLowerCase().includes(searchTerm) ||
        shipment.partnerReference?.toLowerCase().includes(searchTerm)
      );
    }

    // Enrich shipments with related data
    const shipmentsWithDetails = await Promise.all(
      filteredShipments.slice(offset, offset + limit).map(async (shipment) => {
        const customer = await ctx.db.get(shipment.customerId);
        const courier = shipment.assignedCourierId ? await ctx.db.get(shipment.assignedCourierId) : null;
        const partner = shipment.partnerId ? await ctx.db.get(shipment.partnerId) : null;
        const quote = shipment.quoteId ? await ctx.db.get(shipment.quoteId) : null;

        // Ensure customer exists - data integrity requirement
        if (!customer) {
          throw new Error(
            `Customer not found for shipment ${shipment._id}. ` +
            `Data integrity issue - shipment has customerId ${shipment.customerId} but customer does not exist.`
          );
        }

        // Update SLA status in real-time
        const currentSla = calculateSLA(shipment.sla.deadline, shipment.currentStatus);

        return {
          ...shipment,
          sla: currentSla,
          customer: {
            _id: customer._id,
            companyName: customer.companyName,
            shortName: customer.shortName,
          },
          courier: courier ? {
            _id: courier._id,
            courierNumber: courier.courierNumber,
            firstName: courier.firstName,
            lastName: courier.lastName,
          } : null,
          partner: partner ? {
            _id: partner._id,
            companyName: partner.companyName,
            shortName: partner.shortName,
          } : null,
          quote: quote ? {
            _id: quote._id,
            quoteNumber: quote.quoteNumber,
          } : null,
          isOverdue: isShipmentOverdue({ ...shipment, sla: currentSla }),
          isActive: isShipmentActive(shipment),
        };
      })
    );

    return {
      shipments: shipmentsWithDetails,
      total: filteredShipments.length,
      hasMore: filteredShipments.length > offset + limit,
    };
  },
});

/**
 * Get a single shipment by ID with full details
 *
 * @param shipmentId - The shipment ID
 * @param authUserId - The authenticated user's ID
 * @returns Shipment details with related entities and status history
 */
export const getShipment = query({
  args: {
    shipmentId: v.optional(v.id('yourobcShipments')),
    authUserId: v.string()
  },
  handler: async (ctx, { shipmentId, authUserId }) => {
    await requirePermission(ctx, authUserId, SHIPMENT_CONSTANTS.PERMISSIONS.VIEW);

    if (!shipmentId) {
      return null;
    }

    const shipment = await ctx.db.get(shipmentId);
    if (!shipment) {
      throw new Error('Shipment not found');
    }

    // Get related entities
    const customer = await ctx.db.get(shipment.customerId);
    const courier = shipment.assignedCourierId ? await ctx.db.get(shipment.assignedCourierId) : null;
    const partner = shipment.partnerId ? await ctx.db.get(shipment.partnerId) : null;
    const quote = shipment.quoteId ? await ctx.db.get(shipment.quoteId) : null;

    // Get status history
    const statusHistory = await ctx.db
      .query('yourobcShipmentStatusHistory')
      .withIndex('by_shipment_timestamp', (q) => q.eq('shipmentId', shipmentId))
      .order('desc')
      .collect();

    // Update SLA status in real-time
    const currentSla = calculateSLA(shipment.sla.deadline, shipment.currentStatus);

    // Ensure customer exists - data integrity requirement
    if (!customer) {
      throw new Error(
        `Customer not found for shipment ${shipmentId}. ` +
        `Data integrity issue - shipment has customerId ${shipment.customerId} but customer does not exist.`
      );
    }

    return {
      ...shipment,
      sla: currentSla,
      customer: {
        _id: customer._id,
        companyName: customer.companyName,
        shortName: customer.shortName,
        primaryContact: customer.primaryContact,
        billingAddress: customer.billingAddress,
      },
      courier: courier ? {
        _id: courier._id,
        courierNumber: courier.courierNumber,
        firstName: courier.firstName,
        lastName: courier.lastName,
        phone: courier.phone,
        skills: courier.skills,
      } : null,
      partner: partner ? {
        _id: partner._id,
        companyName: partner.companyName,
        shortName: partner.shortName,
        primaryContact: partner.primaryContact,
      } : null,
      quote: quote ? {
        _id: quote._id,
        quoteNumber: quote.quoteNumber,
        totalPrice: quote.totalPrice,
      } : null,
      statusHistory,
      isOverdue: isShipmentOverdue({ ...shipment, sla: currentSla }),
      isActive: isShipmentActive(shipment),
    };
  },
});

/**
 * Get shipments for a specific customer
 *
 * @param authUserId - The authenticated user's ID
 * @param customerId - The customer ID
 * @param limit - Maximum number of shipments to return
 * @param includeCompleted - Whether to include completed shipments
 * @returns List of shipments for the customer
 */
export const getShipmentsByCustomer = query({
  args: {
    authUserId: v.string(),
    customerId: v.id('yourobcCustomers'),
    limit: v.optional(v.number()),
    includeCompleted: v.optional(v.boolean()),
  },
  handler: async (ctx, { authUserId, customerId, limit = 20, includeCompleted = true }) => {
    await requirePermission(ctx, authUserId, SHIPMENT_CONSTANTS.PERMISSIONS.VIEW);

    const customer = await ctx.db.get(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    let shipments = await ctx.db
      .query('yourobcShipments')
      .withIndex('by_customer', (q) => q.eq('customerId', customerId))
      .order('desc')
      .take(limit);

    if (!includeCompleted) {
      shipments = shipments.filter(shipment => isShipmentActive(shipment));
    }

    const shipmentsWithDetails = await Promise.all(
      shipments.map(async (shipment) => {
        const courier = shipment.assignedCourierId ? await ctx.db.get(shipment.assignedCourierId) : null;
        const currentSla = calculateSLA(shipment.sla.deadline, shipment.currentStatus);

        return {
          ...shipment,
          sla: currentSla,
          courier: courier ? {
            _id: courier._id,
            courierNumber: courier.courierNumber,
            firstName: courier.firstName,
            lastName: courier.lastName,
          } : null,
          isOverdue: isShipmentOverdue({ ...shipment, sla: currentSla }),
          isActive: isShipmentActive(shipment),
        };
      })
    );

    return shipmentsWithDetails;
  },
});

/**
 * Get shipments assigned to a specific courier
 *
 * @param authUserId - The authenticated user's ID
 * @param courierId - The courier ID (optional, uses authUserId if not provided)
 * @param limit - Maximum number of shipments to return
 * @param includeCompleted - Whether to include completed shipments
 * @returns List of shipments for the courier
 */
export const getShipmentsByCourier = query({
  args: {
    authUserId: v.string(),
    courierId: v.optional(v.id('yourobcCouriers')),
    limit: v.optional(v.number()),
    includeCompleted: v.optional(v.boolean()),
  },
  handler: async (ctx, { authUserId, courierId, limit = 20, includeCompleted = false }) => {
    await requireCurrentUser(ctx, authUserId);

    let targetCourierId = courierId;
    if (!targetCourierId) {
      // Get courier by auth user ID
      const courier = await ctx.db
        .query('yourobcCouriers')
        .withIndex('by_authUserId', (q) => q.eq('authUserId', authUserId))
        .first();
      
      if (!courier) {
        throw new Error('Courier record not found');
      }
      targetCourierId = courier._id;
    }

    if (targetCourierId !== courierId) {
      await requirePermission(ctx, authUserId, SHIPMENT_CONSTANTS.PERMISSIONS.VIEW);
    }

    let shipments = await ctx.db
      .query('yourobcShipments')
      .withIndex('by_assignedCourier', (q) => q.eq('assignedCourierId', targetCourierId))
      .order('desc')
      .take(limit);

    if (!includeCompleted) {
      shipments = shipments.filter(shipment => isShipmentActive(shipment));
    }

    const shipmentsWithDetails = await Promise.all(
      shipments.map(async (shipment) => {
        const customer = await ctx.db.get(shipment.customerId);

        // Ensure customer exists - data integrity requirement
        if (!customer) {
          throw new Error(
            `Customer not found for shipment ${shipment._id}. ` +
            `Data integrity issue - shipment has customerId ${shipment.customerId} but customer does not exist.`
          );
        }

        const currentSla = calculateSLA(shipment.sla.deadline, shipment.currentStatus);

        return {
          ...shipment,
          sla: currentSla,
          customer: {
            _id: customer._id,
            companyName: customer.companyName,
            shortName: customer.shortName,
          },
          isOverdue: isShipmentOverdue({ ...shipment, sla: currentSla }),
          isActive: isShipmentActive(shipment),
        };
      })
    );

    return shipmentsWithDetails;
  },
});

export const getShipmentStats = query({
  args: {
    authUserId: v.string(),
    dateRange: v.optional(v.object({
      start: v.number(),
      end: v.number(),
    })),
  },
  handler: async (ctx, { authUserId, dateRange }) => {
    await requirePermission(ctx, authUserId, SHIPMENT_CONSTANTS.PERMISSIONS.VIEW);

    let shipments = await ctx.db
    .query('yourobcShipments')
    .collect();

    if (dateRange) {
      shipments = shipments.filter(shipment =>
        shipment.createdAt >= dateRange.start &&
        shipment.createdAt <= dateRange.end
      );
    }

    const now = Date.now();
    const activeShipments = shipments.filter(isShipmentActive);
    const completedShipments = shipments.filter(s => 
      s.currentStatus === SHIPMENT_CONSTANTS.STATUS.DELIVERED ||
      s.currentStatus === SHIPMENT_CONSTANTS.STATUS.INVOICED
    );

    // Calculate SLA performance
    const slaStats = shipments.reduce((acc, shipment) => {
      const currentSla = calculateSLA(shipment.sla.deadline, shipment.currentStatus);
      acc[currentSla.status] = (acc[currentSla.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate average delivery time
    const deliveryTimes = completedShipments
      .map(calculateDeliveryTime)
      .filter(time => time !== null) as number[];
    
    const avgDeliveryTime = deliveryTimes.length > 0 
      ? deliveryTimes.reduce((sum, time) => sum + time, 0) / deliveryTimes.length 
      : 0;

    // Calculate revenue
    const totalRevenue = shipments
      .filter(s => s.currentStatus !== SHIPMENT_CONSTANTS.STATUS.CANCELLED)
      .reduce((sum, s) => sum + s.agreedPrice.amount, 0);

    const avgRevenue = shipments.length > 0 ? totalRevenue / shipments.length : 0;

    const stats = {
      totalShipments: shipments.length,
      activeShipments: activeShipments.length,
      completedShipments: completedShipments.length,
      shipmentsByStatus: shipments.reduce((acc, shipment) => {
        acc[shipment.currentStatus] = (acc[shipment.currentStatus] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      shipmentsByServiceType: shipments.reduce((acc, shipment) => {
        acc[shipment.serviceType] = (acc[shipment.serviceType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      shipmentsByPriority: shipments.reduce((acc, shipment) => {
        acc[shipment.priority] = (acc[shipment.priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      slaPerformance: {
        onTime: slaStats['on_time'] || 0,
        warning: slaStats['warning'] || 0,
        overdue: slaStats['overdue'] || 0,
      },
      avgDeliveryTime: Math.round(avgDeliveryTime),
      totalRevenue,
      avgRevenue: Math.round(avgRevenue),
    };

    return stats;
  },
});

export const getShipmentStatusHistory = query({
  args: {
    authUserId: v.string(),
    shipmentId: v.optional(v.id('yourobcShipments')),
  },
  handler: async (ctx, { authUserId, shipmentId }) => {
    await requirePermission(ctx, authUserId, SHIPMENT_CONSTANTS.PERMISSIONS.VIEW_HISTORY);

    if (!shipmentId) {
      return [];
    }

    const shipment = await ctx.db.get(shipmentId);
    if (!shipment) {
      throw new Error('Shipment not found');
    }

    const statusHistory = await ctx.db
      .query('yourobcShipmentStatusHistory')
      .withIndex('by_shipment_timestamp', (q) => q.eq('shipmentId', shipmentId))
      .order('desc')
      .collect();

    // Enrich with user information
    const historyWithUsers = await Promise.all(
      statusHistory.map(async (history) => {
        // Try to get user profile by authUserId
        const userProfile = await ctx.db
          .query('userProfiles')
          .withIndex('by_auth_user_id', (q) => q.eq('authUserId', history.createdBy))
          .first();

        return {
          ...history,
          updatedByUser: userProfile ? {
            name: userProfile.name,
            email: userProfile.email,
          } : {
            name: 'Unknown User',
            email: history.createdBy,
          },
        };
      })
    );

    return historyWithUsers;
  },
});

export const searchShipments = query({
  args: {
    authUserId: v.string(),
    searchTerm: v.string(),
    limit: v.optional(v.number()),
    includeCompleted: v.optional(v.boolean()),
  },
  handler: async (ctx, { authUserId, searchTerm, limit = 20, includeCompleted = true }) => {
    await requirePermission(ctx, authUserId, SHIPMENT_CONSTANTS.PERMISSIONS.VIEW);

    if (searchTerm.length < 2) {
      return [];
    }

    let shipments = await ctx.db
    .query('yourobcShipments')
    .collect();

    if (!includeCompleted) {
      shipments = shipments.filter(isShipmentActive);
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = shipments.filter(shipment =>
      shipment.shipmentNumber.toLowerCase().includes(searchLower) ||
      shipment.awbNumber?.toLowerCase().includes(searchLower) ||
      shipment.customerReference?.toLowerCase().includes(searchLower) ||
      shipment.description.toLowerCase().includes(searchLower) ||
      shipment.partnerReference?.toLowerCase().includes(searchLower)
    );

    const shipmentsWithDetails = await Promise.all(
      filtered.slice(0, limit).map(async (shipment) => {
        const customer = await ctx.db.get(shipment.customerId);
        const courier = shipment.assignedCourierId ? await ctx.db.get(shipment.assignedCourierId) : null;

        // Ensure customer exists - data integrity requirement
        if (!customer) {
          throw new Error(
            `Customer not found for shipment ${shipment._id}. ` +
            `Data integrity issue - shipment has customerId ${shipment.customerId} but customer does not exist.`
          );
        }

        const currentSla = calculateSLA(shipment.sla.deadline, shipment.currentStatus);

        return {
          ...shipment,
          sla: currentSla,
          customer: {
            _id: customer._id,
            companyName: customer.companyName,
            shortName: customer.shortName,
          },
          courier: courier ? {
            _id: courier._id,
            courierNumber: courier.courierNumber,
            firstName: courier.firstName,
            lastName: courier.lastName,
          } : null,
          isOverdue: isShipmentOverdue({ ...shipment, sla: currentSla }),
          isActive: isShipmentActive(shipment),
        };
      })
    );

    return shipmentsWithDetails;
  },
});

export const getOverdueShipments = query({
  args: {
    authUserId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { authUserId, limit = 50 }) => {
    await requirePermission(ctx, authUserId, SHIPMENT_CONSTANTS.PERMISSIONS.VIEW);

    const activeShipments = await ctx.db
      .query('yourobcShipments')
      .filter((q) => q.neq(q.field('currentStatus'), SHIPMENT_CONSTANTS.STATUS.DELIVERED))
      .filter((q) => q.neq(q.field('currentStatus'), SHIPMENT_CONSTANTS.STATUS.INVOICED))
      .filter((q) => q.neq(q.field('currentStatus'), SHIPMENT_CONSTANTS.STATUS.CANCELLED))
      .take(limit * 2);

    const now = Date.now();
    const overdueShipments = activeShipments.filter(shipment => {
      const currentSla = calculateSLA(shipment.sla.deadline, shipment.currentStatus);
      return currentSla.status === 'overdue';
    });

    const shipmentsWithDetails = await Promise.all(
      overdueShipments.slice(0, limit).map(async (shipment) => {
        const customer = await ctx.db.get(shipment.customerId);
        const courier = shipment.assignedCourierId ? await ctx.db.get(shipment.assignedCourierId) : null;

        // Ensure customer exists - data integrity requirement
        if (!customer) {
          throw new Error(
            `Customer not found for shipment ${shipment._id}. ` +
            `Data integrity issue - shipment has customerId ${shipment.customerId} but customer does not exist.`
          );
        }

        const currentSla = calculateSLA(shipment.sla.deadline, shipment.currentStatus);

        return {
          ...shipment,
          sla: currentSla,
          customer: {
            _id: customer._id,
            companyName: customer.companyName,
            shortName: customer.shortName,
          },
          courier: courier ? {
            _id: courier._id,
            courierNumber: courier.courierNumber,
            firstName: courier.firstName,
            lastName: courier.lastName,
          } : null,
          overdueHours: Math.ceil((now - shipment.sla.deadline) / (1000 * 60 * 60)),
        };
      })
    );

    return shipmentsWithDetails;
  },
});