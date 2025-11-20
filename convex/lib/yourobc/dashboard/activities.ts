// convex/lib/yourobc/dashboard/activities.ts
/**
 * YourOBC Dashboard Activities
 * Track and retrieve recent activities across all modules
 */

import { query, mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';

/**
 * Get recent activities across all YourOBC modules
 */
export const getRecentActivities = query({
  args: {
    authUserId: v.string(),
    limit: v.optional(v.number()),
    moduleFilter: v.optional(v.string()),
    typeFilter: v.optional(v.string()),
  },
  handler: async (ctx, { authUserId, limit = 20, moduleFilter, typeFilter }) => {
    await requireCurrentUser(ctx, authUserId);

    const activities: any[] = [];

    // Get recent customers if module not filtered or is customers
    if (!moduleFilter || moduleFilter === 'yourobcCustomers') {
      const recentCustomers = await ctx.db
        .query('yourobcCustomers')
        .filter((q: any) => q.eq(q.field('deletedAt'), undefined))
        .order('desc')
        .take(5);

      for (const customer of recentCustomers) {
        activities.push({
          id: customer._id,
          type: 'customer',
          action: 'created',
          entity: customer.companyName || 'Unnamed Customer',
          entityId: customer._id,
          description: `New customer account created: ${customer.companyName}`,
          user: 'System',
          userId: customer.createdBy,
          timestamp: customer.createdAt,
          metadata: {
            module: 'yourobcCustomers',
            priority: 'medium',
            status: customer.status,
          },
        });
      }
    }

    // Get recent quotes if module not filtered or is quotes
    if (!moduleFilter || moduleFilter === 'yourobcQuotes') {
      const recentQuotes = await ctx.db
        .query('yourobcQuotes')
        .filter((q: any) => q.eq(q.field('deletedAt'), undefined))
        .order('desc')
        .take(5);

      for (const quote of recentQuotes) {
        const actionMap: Record<string, string> = {
          accepted: 'approved',
          rejected: 'rejected',
          expired: 'expired',
          sent: 'created',
          draft: 'drafted',
        };

        activities.push({
          id: quote._id,
          type: 'quote',
          action: actionMap[quote.status] || 'created',
          entity: `Quote ${quote.quoteNumber}`,
          entityId: quote._id,
          description: `Quote ${quote.quoteNumber} ${quote.status}`,
          user: 'System',
          userId: quote.createdBy,
          timestamp: quote.createdAt,
          metadata: {
            module: 'yourobcQuotes',
            priority: quote.status === 'accepted' ? 'high' : 'medium',
            value: quote.totalPrice?.amount,
            currency: quote.totalPrice?.currency,
            status: quote.status,
          },
        });
      }
    }

    // Get recent shipments if module not filtered or is shipments
    if (!moduleFilter || moduleFilter === 'yourobcShipments') {
      const recentShipments = await ctx.db
        .query('yourobcShipments')
        .filter((q: any) => q.eq(q.field('deletedAt'), undefined))
        .order('desc')
        .take(5);

      for (const shipment of recentShipments) {
        const statusMap: Record<string, string> = {
          quoted: 'quoted',
          booked: 'booked',
          pickup: 'picked up',
          in_transit: 'in transit',
          delivered: 'delivered',
          cancelled: 'cancelled',
        };

        activities.push({
          id: shipment._id,
          type: 'shipment',
          action: shipment.currentStatus,
          entity: `Shipment ${shipment.shipmentNumber}`,
          entityId: shipment._id,
          description: `Shipment ${shipment.shipmentNumber} is ${
            statusMap[shipment.currentStatus] || shipment.currentStatus
          }`,
          user: 'System',
          userId: shipment.createdBy,
          timestamp: shipment.createdAt,
          metadata: {
            module: 'yourobcShipments',
            priority:
              shipment.currentStatus === 'delivered'
                ? 'high'
                : shipment.currentStatus === 'in_transit'
                ? 'medium'
                : 'low',
            destination: shipment.destination?.city || 'Unknown',
            status: shipment.currentStatus,
          },
        });
      }
    }

    // Get recent invoices if module not filtered or is invoices
    if (!moduleFilter || moduleFilter === 'yourobcInvoices') {
      const recentInvoices = await ctx.db
        .query('yourobcInvoices')
        .filter((q: any) => q.eq(q.field('deletedAt'), undefined))
        .order('desc')
        .take(5);

      for (const invoice of recentInvoices) {
        const statusMap: Record<string, string> = {
          draft: 'drafted',
          sent: 'sent',
          paid: 'paid',
          overdue: 'overdue',
          cancelled: 'cancelled',
        };

        activities.push({
          id: invoice._id,
          type: 'invoice',
          action: invoice.status,
          entity: `Invoice ${invoice.invoiceNumber}`,
          entityId: invoice._id,
          description: `Invoice ${invoice.invoiceNumber} ${
            statusMap[invoice.status] || invoice.status
          }`,
          user: 'System',
          userId: invoice.createdBy,
          timestamp: invoice.createdAt,
          metadata: {
            module: 'yourobcInvoices',
            priority: invoice.status === 'overdue' ? 'high' : 'medium',
            value: invoice.totalAmount?.amount,
            currency: invoice.totalAmount?.currency,
            status: invoice.status,
            dueDate: invoice.dueDate,
          },
        });
      }
    }

    // Get recent partners if module not filtered or is partners
    if (!moduleFilter || moduleFilter === 'yourobcPartners') {
      const recentPartners = await ctx.db
        .query('yourobcPartners')
        .filter((q: any) => q.eq(q.field('deletedAt'), undefined))
        .order('desc')
        .take(3);

      for (const partner of recentPartners) {
        activities.push({
          id: partner._id,
          type: 'partner',
          action: 'created',
          entity: partner.companyName || 'Unnamed Partner',
          entityId: partner._id,
          description: `New partner added: ${partner.companyName}`,
          user: 'System',
          userId: partner.createdBy,
          timestamp: partner.createdAt,
          metadata: {
            module: 'yourobcPartners',
            priority: 'low',
            status: partner.status,
          },
        });
      }
    }

    // Get recent couriers if module not filtered or is couriers
    if (!moduleFilter || moduleFilter === 'yourobcCouriers') {
      const recentCouriers = await ctx.db
        .query('yourobcCouriers')
        .filter((q: any) => q.eq(q.field('deletedAt'), undefined))
        .order('desc')
        .take(3);

      for (const courier of recentCouriers) {
        activities.push({
          id: courier._id,
          type: 'courier',
          action: 'created',
          entity: `${courier.firstName} ${courier.lastName}`,
          entityId: courier._id,
          description: `New courier added: ${courier.firstName} ${courier.lastName}`,
          user: 'System',
          userId: courier.createdBy,
          timestamp: courier.createdAt,
          metadata: {
            module: 'yourobcCouriers',
            priority: 'low',
            status: courier.status,
          },
        });
      }
    }

    // Sort by timestamp and apply type filter if specified
    let filteredActivities = activities;
    if (typeFilter) {
      filteredActivities = activities.filter((a) => a.type === typeFilter);
    }

    // Sort and limit
    filteredActivities.sort((a, b) => b.timestamp - a.timestamp);

    return filteredActivities.slice(0, limit);
  },
});

/**
 * Log a new activity (for future use with dedicated activity table)
 */
export const logActivity = mutation({
  args: {
    authUserId: v.string(),
    type: v.string(),
    action: v.string(),
    entity: v.string(),
    entityId: v.string(),
    description: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await requireCurrentUser(ctx, args.authUserId);

    // In a real implementation, this would write to an activities table
    // For now, we rely on audit logs from the audit system
    console.log('Activity logged:', {
      type: args.type,
      action: args.action,
      entity: args.entity,
      entityId: args.entityId,
      description: args.description,
      metadata: args.metadata,
      timestamp: Date.now(),
    });

    return { success: true, timestamp: Date.now() };
  },
});

/**
 * Get activities by entity
 */
export const getActivitiesByEntity = query({
  args: {
    authUserId: v.string(),
    entityId: v.string(),
    module: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { authUserId, entityId, module, limit = 10 }) => {
    await requireCurrentUser(ctx, authUserId);

    // This would query a dedicated activities table
    // For now, return empty array as placeholder
    // In production, you would implement proper activity tracking

    return [];
  },
});

/**
 * Get activities by user
 */
export const getActivitiesByUser = query({
  args: {
    authUserId: v.string(),
    targetUserId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { authUserId, targetUserId, limit = 20 }) => {
    await requireCurrentUser(ctx, authUserId);

    // Filter all activities by user
    const activities: any[] = [];

    // Get user's quotes
    const userQuotes = await ctx.db
      .query('yourobcQuotes')
      .filter((q: any) =>
        q.and(
          q.eq(q.field('deletedAt'), undefined),
          q.eq(q.field('createdBy'), targetUserId)
        )
      )
      .order('desc')
      .take(5);

    for (const quote of userQuotes) {
      activities.push({
        id: quote._id,
        type: 'quote',
        action: quote.status,
        entity: `Quote ${quote.quoteNumber}`,
        entityId: quote._id,
        description: `Created quote ${quote.quoteNumber}`,
        user: targetUserId,
        userId: targetUserId,
        timestamp: quote.createdAt,
        metadata: {
          module: 'yourobcQuotes',
          value: quote.totalPrice?.amount,
          currency: quote.totalPrice?.currency,
        },
      });
    }

    // Get user's shipments
    const userShipments = await ctx.db
      .query('yourobcShipments')
      .filter((q: any) =>
        q.and(
          q.eq(q.field('deletedAt'), undefined),
          q.eq(q.field('createdBy'), targetUserId)
        )
      )
      .order('desc')
      .take(5);

    for (const shipment of userShipments) {
      activities.push({
        id: shipment._id,
        type: 'shipment',
        action: shipment.currentStatus,
        entity: `Shipment ${shipment.shipmentNumber}`,
        entityId: shipment._id,
        description: `Created shipment ${shipment.shipmentNumber}`,
        user: targetUserId,
        userId: targetUserId,
        timestamp: shipment.createdAt,
        metadata: {
          module: 'yourobcShipments',
          destination: shipment.destination?.city,
        },
      });
    }

    // Sort and limit
    activities.sort((a, b) => b.timestamp - a.timestamp);

    return activities.slice(0, limit);
  },
});
