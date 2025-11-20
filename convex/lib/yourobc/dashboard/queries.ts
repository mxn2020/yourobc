// convex/lib/yourobc/dashboard/queries.ts
// convex/yourobc/dashboard/queries.ts

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { DASHBOARD_CONSTANTS } from './constants';

export const getYourOBCDashboardStats = query({
  args: {
    authUserId: v.string(),
    dateRange: v.optional(v.object({
      from: v.number(),
      to: v.number(),
    }))
  },
  handler: async (ctx, { authUserId, dateRange }) => {
    const user = await requireCurrentUser(ctx, authUserId);

    // Get user's alert acknowledgments
    const alertAcknowledgments = await ctx.db
      .query('yourobcDashboardAlertAcknowledgments')
      .withIndex('by_user', (q) => q.eq('userId', authUserId))
      .collect();

    const acknowledgedAlertIds = new Set(alertAcknowledgments.map(ack => ack.alertId));
    
    // Set default date range to current month if not provided
    const now = new Date();
    const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const defaultTo = now.getTime();
    
    const { from = defaultFrom, to = defaultTo } = dateRange || {};

    // Fetch all YourOBC data in parallel
    const [customers, quotes, shipments, invoices, partners, employees, reminders] = await Promise.all([
      ctx.db.query('yourobcCustomers').collect(),
      ctx.db.query('yourobcQuotes').collect(),
      ctx.db.query('yourobcShipments').collect(),
      ctx.db.query('yourobcInvoices').collect(),
      ctx.db.query('yourobcPartners').collect(),
      ctx.db.query('yourobcEmployees').collect(),
      ctx.db.query('yourobcFollowupReminders').collect(),
    ]);

    // Filter data by date range
    const quotesInRange = quotes.filter(q => q.createdAt >= from && q.createdAt <= to);
    const shipmentsInRange = shipments.filter(s => s.createdAt >= from && s.createdAt <= to);
    const invoicesInRange = invoices.filter(i => i.createdAt >= from && i.createdAt <= to);

    // Calculate core metrics
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.status === 'active').length;
    
    const totalQuotes = quotesInRange.length;
    const acceptedQuotes = quotesInRange.filter(q => q.status === 'accepted').length;
    const conversionRate = totalQuotes > 0 ? (acceptedQuotes / totalQuotes) * 100 : 0;
    
    const activeShipments = shipments.filter(s => 
      ['booked', 'pickup', 'in_transit'].includes(s.currentStatus)
    ).length;
    
    const deliveredShipments = shipmentsInRange.filter(s => s.currentStatus === 'delivered');
    const onTimeDeliveries = deliveredShipments.filter(s => 
      s.completedAt && s.completedAt <= s.sla.deadline
    );
    const onTimeRate = deliveredShipments.length > 0 
      ? (onTimeDeliveries.length / deliveredShipments.length) * 100 
      : 0;

    const overdueShipments = shipments.filter(s => 
      s.sla.deadline < Date.now() && 
      !['delivered', 'cancelled'].includes(s.currentStatus)
    ).length;

    const outgoingInvoices = invoicesInRange.filter(i => i.type === 'outgoing');
    const paidInvoices = outgoingInvoices.filter(i => i.status === 'paid');
    const overdueInvoices = invoices.filter(i => 
      i.dueDate < Date.now() && 
      !['paid', 'cancelled'].includes(i.status)
    ).length;

    const totalRevenue = paidInvoices.reduce((sum, i) => sum + i.totalAmount.amount, 0);
    const averageDealSize = paidInvoices.length > 0 
      ? totalRevenue / paidInvoices.length 
      : 0;

    const outstandingAmount = invoices
      .filter(i => ['sent', 'overdue'].includes(i.status))
      .reduce((sum, i) => sum + i.totalAmount.amount, 0);

    const activeEmployees = employees.filter(e => 
      e.isActive && ['available', 'busy'].includes(e.status)
    ).length;

    const overdueReminders = reminders.filter(r => 
      r.status === 'pending' && r.dueDate < Date.now()
    ).length;

    const activePartners = partners.filter(p => p.status === 'active').length;

    // Calculate month-over-month growth
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).getTime();
    
    const lastMonthQuotes = quotes.filter(q => 
      q.createdAt >= lastMonthStart && q.createdAt <= lastMonthEnd
    ).length;
    const lastMonthRevenue = invoices
      .filter(i => 
        i.type === 'outgoing' && 
        i.status === 'paid' && 
        i.paymentDate && 
        i.paymentDate >= lastMonthStart && 
        i.paymentDate <= lastMonthEnd
      )
      .reduce((sum, i) => sum + i.totalAmount.amount, 0);

    const quotesGrowth = lastMonthQuotes > 0 
      ? ((totalQuotes - lastMonthQuotes) / lastMonthQuotes) * 100 
      : 0;
    const revenueGrowth = lastMonthRevenue > 0 
      ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0;

    // Role-specific dashboard data - updated for superadmin support
    const roleSpecificMetrics = (user.role === 'admin' || user.role === 'superadmin') ? {
      // Admin and superadmin see everything
      allMetrics: true,
    } : user.role === 'sales' ? {
      // Sales-focused metrics
      myQuotes: quotesInRange.filter(q => q.createdBy === authUserId).length,
      myConversions: quotesInRange.filter(q => 
        q.createdBy === authUserId && q.status === 'accepted'
      ).length,
      myRevenue: paidInvoices
        .filter(i => {
          // Find the shipment linked to this invoice
          const shipment = shipments.find(s => s._id === i.shipmentId);
          if (!shipment) return false;
          // Find the quote linked to this shipment
          const quote = quotes.find(q => q._id === shipment.quoteId);
          return quote?.createdBy === authUserId;
        })
        .reduce((sum, i) => sum + i.totalAmount.amount, 0),
    } : user.role === 'operations' ? {
      // Operations-focused metrics
      myShipments: shipmentsInRange.filter(s => 
        s.createdBy === authUserId || s.assignedCourierId === authUserId
      ).length,
      myOnTimeRate: (() => {
        const myDelivered = deliveredShipments.filter(s => 
          s.createdBy === authUserId || s.assignedCourierId === authUserId
        );
        const myOnTime = myDelivered.filter(s => 
          s.completedAt && s.completedAt <= s.sla.deadline
        );
        return myDelivered.length > 0 ? (myOnTime.length / myDelivered.length) * 100 : 0;
      })(),
    } : {};

    // Additional customer metrics
    const newCustomers = customers.filter(c =>
      c.createdAt >= from && c.createdAt <= to
    ).length;
    const inactiveCustomers = customers.filter(c => c.status === 'inactive').length;
    const blacklistedCustomers = customers.filter(c => c.status === 'blacklisted').length;
    const customerGrowthRate = totalCustomers > 0
      ? ((newCustomers / totalCustomers) * 100)
      : 0;

    // Calculate customer lifetime value (based on paid invoices)
    const customerRevenues = new Map<string, number>();
    paidInvoices.forEach(invoice => {
      const customerId = invoice.customerId;
      if (customerId) {
        customerRevenues.set(
          customerId,
          (customerRevenues.get(customerId) || 0) + invoice.totalAmount.amount
        );
      }
    });
    const averageLifetimeValue = totalCustomers > 0
      ? Array.from(customerRevenues.values()).reduce((sum, val) => sum + val, 0) / totalCustomers
      : 0;
    const topTierCustomers = Array.from(customerRevenues.values()).filter(
      val => val > averageLifetimeValue * 2
    ).length;

    // Additional quote metrics
    const pendingQuotes = quotesInRange.filter(q => q.status === 'sent' || q.status === 'pending').length;
    const rejectedQuotes = quotesInRange.filter(q => q.status === 'rejected').length;
    const expiredQuotes = quotes.filter(q => q.validUntil < Date.now() && q.status === 'sent').length;
    const totalQuoteValue = quotesInRange.reduce((sum, q) => sum + (q.totalPrice?.amount || 0), 0);
    const averageQuoteValue = totalQuotes > 0 ? totalQuoteValue / totalQuotes : 0;
    const pendingQuoteValue = quotesInRange
      .filter(q => q.status === 'sent' || q.status === 'pending')
      .reduce((sum, q) => sum + (q.totalPrice?.amount || 0), 0);

    // Additional shipment metrics
    const quotedShipments = shipmentsInRange.filter(s => s.currentStatus === 'quoted').length;
    const bookedShipments = shipmentsInRange.filter(s => s.currentStatus === 'booked').length;
    const inTransitShipments = shipments.filter(s => s.currentStatus === 'in_transit').length;
    const deliveredShipmentsInRange = shipmentsInRange.filter(s => s.currentStatus === 'delivered').length;
    const cancelledShipments = shipmentsInRange.filter(s => s.currentStatus === 'cancelled').length;
    const onTimeShipments = deliveredShipments.filter(s =>
      s.completedAt && s.completedAt <= s.sla.deadline
    ).length;
    const deliveryTimes = deliveredShipments
      .filter(s => s.completedAt && s.createdAt)
      .map(s => s.completedAt! - s.createdAt);
    const averageDeliveryTime = deliveryTimes.length > 0
      ? deliveryTimes.reduce((sum, time) => sum + time, 0) / deliveryTimes.length
      : 0;
    const delayedShipments = deliveredShipments.filter(s =>
      s.completedAt && s.completedAt > s.sla.deadline
    ).length;

    // Additional invoice metrics
    const draftInvoices = invoicesInRange.filter(i => i.status === 'draft').length;
    const sentInvoices = invoicesInRange.filter(i => i.status === 'sent').length;
    const paidInvoicesInRange = invoicesInRange.filter(i => i.status === 'paid').length;
    const cancelledInvoices = invoicesInRange.filter(i => i.status === 'cancelled').length;
    const totalInvoiceValue = invoicesInRange.reduce((sum, i) => sum + i.totalAmount.amount, 0);
    const paidInvoiceValue = invoicesInRange.filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + i.totalAmount.amount, 0);
    const overdueInvoiceValue = invoices
      .filter(i => i.status === 'overdue')
      .reduce((sum, i) => sum + i.totalAmount.amount, 0);
    const paymentRate = totalInvoiceValue > 0
      ? (paidInvoiceValue / totalInvoiceValue) * 100
      : 0;

    // Courier metrics
    const couriers = await ctx.db.query('yourobcCouriers').collect();
    const totalCouriers = couriers.length;
    const activeCouriers = couriers.filter(c => c.isActive).length;
    const availableCouriers = couriers.filter(c => c.status === 'available').length;
    const busyCouriers = couriers.filter(c => c.status === 'busy').length;
    const offlineCouriers = couriers.filter(c => c.status === 'offline').length;
    const vacationCouriers = couriers.filter(c => c.status === 'vacation').length;
    const courierUtilization = totalCouriers > 0
      ? (busyCouriers / totalCouriers) * 100
      : 0;
    const courierRatings = couriers.filter(c => c.ranking).map(c => c.ranking!);
    const averageCourierRating = courierRatings.length > 0
      ? courierRatings.reduce((sum, r) => sum + r, 0) / courierRatings.length
      : 0;
    const activeDeliveries = shipments.filter(s =>
      s.currentStatus === 'in_transit' && s.assignedCourierId
    ).length;

    // Partner metrics
    const inactivePartners = partners.filter(p => p.status === 'inactive').length;
    const suspendedPartners = partners.filter(p => p.status === 'suspended').length;
    const partnerPerformanceScores = partners.filter(p => p.ranking).map(p => p.ranking!);
    const avgPartnerPerformance = partnerPerformanceScores.length > 0
      ? partnerPerformanceScores.reduce((sum, s) => sum + s, 0) / partnerPerformanceScores.length
      : 0;
    const partnerRevenue = paidInvoices
      .filter(i => i.partnerId)
      .reduce((sum, i) => sum + i.totalAmount.amount, 0);
    const topPerformingPartners = partners.filter(p =>
      p.ranking && p.ranking > 4
    ).length;

    // Conversion metrics
    const totalLeads = quotesInRange.length; // Assuming each quote represents a lead
    const convertedLeads = acceptedQuotes;
    const leadToCustomerRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    // Performance metrics
    const slaCompliance = deliveredShipments.length > 0
      ? (onTimeDeliveries.length / deliveredShipments.length) * 100
      : 100;

    // Calculate average processing time (quote to shipment creation)
    const processingTimes = shipmentsInRange
      .filter(s => s.quoteId && s.createdAt)
      .map(s => {
        const quote = quotes.find(q => q._id === s.quoteId);
        return quote && s.createdAt ? s.createdAt - quote.createdAt : 0;
      })
      .filter(t => t > 0);
    const avgProcessingTime = processingTimes.length > 0
      ? processingTimes.reduce((sum, t) => sum + t, 0) / processingTimes.length
      : 0;

    // Resource utilization
    const totalResourceCapacity = activeEmployees + activeCouriers;
    const usedResources = busyCouriers + activeShipments / 10; // Rough estimate
    const resourceUtilization = totalResourceCapacity > 0
      ? (usedResources / totalResourceCapacity) * 100
      : 0;

    // Build comprehensive alert objects
    const alertsList: Array<{
      id: string;
      type: 'overdue' | 'expiring' | 'payment' | 'sla' | 'performance' | 'system';
      severity: 'low' | 'medium' | 'high' | 'critical';
      title: string;
      message: string;
      count?: number;
      module: string;
      action?: string;
      actionUrl?: string;
      createdAt: string;
      acknowledged: boolean;
    }> = [];

    if (overdueShipments > 0) {
      const alertId = 'alert-overdue-shipments';
      alertsList.push({
        id: alertId,
        type: 'overdue',
        severity: overdueShipments > 10 ? 'critical' : overdueShipments > 5 ? 'high' : 'medium',
        title: 'Overdue Shipments',
        message: `${overdueShipments} shipment${overdueShipments > 1 ? 's are' : ' is'} overdue`,
        count: overdueShipments,
        module: 'shipments',
        action: 'View Overdue',
        actionUrl: '/yourobc/shipments?filter=overdue',
        createdAt: new Date().toISOString(),
        acknowledged: acknowledgedAlertIds.has(alertId),
      });
    }

    if (overdueInvoices > 0) {
      const alertId = 'alert-overdue-invoices';
      alertsList.push({
        id: alertId,
        type: 'payment',
        severity: overdueInvoices > 10 ? 'critical' : overdueInvoices > 5 ? 'high' : 'medium',
        title: 'Overdue Invoices',
        message: `${overdueInvoices} invoice${overdueInvoices > 1 ? 's are' : ' is'} overdue`,
        count: overdueInvoices,
        module: 'invoices',
        action: 'View Overdue',
        actionUrl: '/yourobc/invoices?filter=overdue',
        createdAt: new Date().toISOString(),
        acknowledged: acknowledgedAlertIds.has(alertId),
      });
    }

    if (expiredQuotes > 0) {
      const alertId = 'alert-expired-quotes';
      alertsList.push({
        id: alertId,
        type: 'expiring',
        severity: 'low',
        title: 'Expired Quotes',
        message: `${expiredQuotes} quote${expiredQuotes > 1 ? 's have' : ' has'} expired`,
        count: expiredQuotes,
        module: 'quotes',
        action: 'View Expired',
        actionUrl: '/yourobc/quotes?filter=expired',
        createdAt: new Date().toISOString(),
        acknowledged: acknowledgedAlertIds.has(alertId),
      });
    }

    if (overdueReminders > 0) {
      const alertId = 'alert-overdue-reminders';
      alertsList.push({
        id: alertId,
        type: 'system',
        severity: 'medium',
        title: 'Overdue Reminders',
        message: `${overdueReminders} reminder${overdueReminders > 1 ? 's are' : ' is'} overdue`,
        count: overdueReminders,
        module: 'reminders',
        action: 'View Reminders',
        actionUrl: '/yourobc/reminders?filter=overdue',
        createdAt: new Date().toISOString(),
        acknowledged: acknowledgedAlertIds.has(alertId),
      });
    }

    if (onTimeRate < 80) {
      const alertId = 'alert-sla-compliance';
      alertsList.push({
        id: alertId,
        type: 'sla',
        severity: onTimeRate < 70 ? 'high' : 'medium',
        title: 'Low SLA Compliance',
        message: `On-time delivery rate is ${Math.round(onTimeRate)}% (target: 90%)`,
        module: 'performance',
        action: 'View Performance',
        actionUrl: '/yourobc/dashboard?tab=performance',
        createdAt: new Date().toISOString(),
        acknowledged: acknowledgedAlertIds.has(alertId),
      });
    }

    return {
      // Complete overview structure matching YourOBCOverview type
      overview: {
        customers: {
          total: totalCustomers,
          active: activeCustomers,
          new: newCustomers,
          inactive: inactiveCustomers,
          blacklisted: blacklistedCustomers,
          growth: Math.round(customerGrowthRate * 10) / 10,
          conversionRate: Math.round(conversionRate * 10) / 10,
          averageLifetimeValue: Math.round(averageLifetimeValue * 100) / 100,
          topTier: topTierCustomers,
        },
        quotes: {
          total: totalQuotes,
          pending: pendingQuotes,
          accepted: acceptedQuotes,
          rejected: rejectedQuotes,
          expired: expiredQuotes,
          totalValue: Math.round(totalQuoteValue * 100) / 100,
          averageValue: Math.round(averageQuoteValue * 100) / 100,
          conversionRate: Math.round(conversionRate * 10) / 10,
          pendingValue: Math.round(pendingQuoteValue * 100) / 100,
        },
        shipments: {
          total: shipmentsInRange.length,
          quoted: quotedShipments,
          booked: bookedShipments,
          inTransit: inTransitShipments,
          delivered: deliveredShipmentsInRange,
          cancelled: cancelledShipments,
          onTime: onTimeShipments,
          averageDeliveryTime: Math.round(averageDeliveryTime / (1000 * 60 * 60)), // Convert to hours
          delayedShipments: delayedShipments,
        },
        invoices: {
          total: invoicesInRange.length,
          draft: draftInvoices,
          sent: sentInvoices,
          paid: paidInvoicesInRange,
          overdue: overdueInvoices,
          cancelled: cancelledInvoices,
          totalValue: Math.round(totalInvoiceValue * 100) / 100,
          paidValue: Math.round(paidInvoiceValue * 100) / 100,
          overdueValue: Math.round(overdueInvoiceValue * 100) / 100,
          paymentRate: Math.round(paymentRate * 10) / 10,
        },
        partners: {
          total: partners.length,
          active: activePartners,
          inactive: inactivePartners,
          suspended: suspendedPartners,
          performanceScore: Math.round(avgPartnerPerformance * 10) / 10,
          totalRevenue: Math.round(partnerRevenue * 100) / 100,
          topPerformers: topPerformingPartners,
        },
        couriers: {
          total: totalCouriers,
          available: availableCouriers,
          busy: busyCouriers,
          offline: offlineCouriers,
          vacation: vacationCouriers,
          utilizationRate: Math.round(courierUtilization * 10) / 10,
          averageRating: Math.round(averageCourierRating * 10) / 10,
          activeDeliveries: activeDeliveries,
        },
        period: 'month' as const, // This should be passed from the frontend
        lastUpdated: new Date().toISOString(),
      },

      // Complete metrics structure matching YourOBCMetrics type
      metrics: {
        revenue: {
          total: Math.round(totalRevenue * 100) / 100,
          growth: Math.round(revenueGrowth * 10) / 10,
          target: 0, // This should be configurable
          targetProgress: 0,
          breakdown: {
            customers: Math.round((totalRevenue - partnerRevenue) * 100) / 100,
            partners: Math.round(partnerRevenue * 100) / 100,
          },
          trend: [], // Will be populated by performance trends query
        },
        conversion: {
          quoteToOrder: Math.round(conversionRate * 10) / 10,
          leadToCustomer: Math.round(leadToCustomerRate * 10) / 10,
          proposalToContract: Math.round(conversionRate * 10) / 10, // Using same as quote conversion
          inquiryToQuote: 0, // Not tracked yet
          trends: {
            quoteToOrder: [],
            leadToCustomer: [],
          },
        },
        performance: {
          slaCompliance: Math.round(slaCompliance * 10) / 10,
          customerSatisfaction: 0, // Not tracked yet
          responseTime: Math.round(avgProcessingTime / (1000 * 60)), // Convert to minutes
          deliveryAccuracy: Math.round(onTimeRate * 10) / 10,
          qualityScore: Math.round(slaCompliance * 10) / 10,
          trends: {
            slaCompliance: [],
            customerSatisfaction: [],
          },
        },
        efficiency: {
          processingTime: Math.round(avgProcessingTime / (1000 * 60 * 60)), // Convert to hours
          resourceUtilization: Math.round(resourceUtilization * 10) / 10,
          costPerTransaction: 0, // Not tracked yet
          automationRate: 0, // Not tracked yet
          errorRate: 0, // Not tracked yet
          trends: {
            processingTime: [],
            resourceUtilization: [],
          },
        },
        period: 'month' as const,
        generatedAt: new Date().toISOString(),
      },

      // Performance indicators (kept for backward compatibility)
      performance: {
        onTimeDeliveryRate: Math.round(onTimeRate * 10) / 10,
        overdueShipments,
        overdueInvoices,
        outstandingAmount,
        overdueReminders,
      },

      // Resource status (kept for backward compatibility)
      resources: {
        activeEmployees,
        totalEmployees: employees.filter(e => e.isActive).length,
        activePartners,
        totalPartners: partners.length,
      },

      // Growth metrics (kept for backward compatibility)
      growth: {
        quotesGrowth: Math.round(quotesGrowth * 10) / 10,
        revenueGrowth: Math.round(revenueGrowth * 10) / 10,
      },

      // Role-specific data
      userMetrics: roleSpecificMetrics,

      // Alerts as structured objects
      alerts: alertsList,

      // Alert counts (kept for backward compatibility)
      alertCounts: {
        overdueShipments,
        overdueInvoices,
        overdueReminders,
        expiredQuotes,
      },

      // Quick stats for widgets
      quickStats: [
        {
          label: 'Active Shipments',
          value: activeShipments,
          trend: 'up',
          color: 'blue',
        },
        {
          label: 'Conversion Rate',
          value: `${Math.round(conversionRate)}%`,
          trend: conversionRate > 15 ? 'up' : 'down',
          color: conversionRate > 15 ? 'green' : 'yellow',
        },
        {
          label: 'On-Time Delivery',
          value: `${Math.round(onTimeRate)}%`,
          trend: onTimeRate > 90 ? 'up' : 'down',
          color: onTimeRate > 90 ? 'green' : onTimeRate > 80 ? 'yellow' : 'red',
        },
        {
          label: 'Outstanding Amount',
          value: `€${Math.round(outstandingAmount).toLocaleString()}`,
          trend: 'neutral',
          color: 'purple',
        },
      ],
    };
  },
});

export const getYourOBCRecentActivity = query({
  args: { 
    authUserId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { authUserId, limit = 20 }) => {
    await requireCurrentUser(ctx, authUserId);

    // Get recent audit logs for YourOBC entities
    const recentLogs = await ctx.db
      .query('auditLogs')
      .filter((q) => 
        q.or(
          q.eq(q.field('entityType'), 'customer'),
          q.eq(q.field('entityType'), 'quote'),
          q.eq(q.field('entityType'), 'shipment'),
          q.eq(q.field('entityType'), 'invoice'),
          q.eq(q.field('entityType'), 'partner'),
          q.eq(q.field('entityType'), 'employee')
        )
      )
      .order('desc')
      .take(limit);

    return recentLogs.map(log => ({
      id: log._id,
      type: log.entityType.replace('yourobc_', '').replace('_', '') as any, // Map to ActivityType
      action: log.action,
      entity: log.entityTitle || log.entityType,
      entityId: log.entityId || '',
      description: log.description,
      user: log.userName,
      userId: log.userId,
      timestamp: log.createdAt.toString(),
    }));
  },
});

export const getYourOBCUpcomingTasks = query({
  args: { 
    authUserId: v.string(),
    days: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { authUserId, days = 7, limit = 20 }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    
    const futureDate = Date.now() + (days * 24 * 60 * 60 * 1000);

    // Get upcoming reminders
    let remindersQuery = ctx.db.query('yourobcFollowupReminders')
      .filter((q) => 
        q.and(
          q.eq(q.field('status'), 'pending'),
          q.gte(q.field('dueDate'), Date.now()),
          q.lte(q.field('dueDate'), futureDate)
        )
      );

    // Updated for superadmin support
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      remindersQuery = remindersQuery.filter((q) => 
        q.eq(q.field('assignedTo'), authUserId)
      );
    }

    const upcomingReminders = await remindersQuery
      .order('asc')
      .take(20);

    // Get expiring quotes
    const expiringQuotes = await ctx.db
      .query('yourobcQuotes')
      .filter((q) => 
        q.and(
          q.eq(q.field('status'), 'sent'),
          q.gte(q.field('validUntil'), Date.now()),
          q.lte(q.field('validUntil'), futureDate)
        )
      )
      .order('asc')
      .take(10);

    // Get upcoming shipment deadlines
    const upcomingDeadlines = await ctx.db
      .query('yourobcShipments')
      .filter((q) => 
        q.and(
          q.neq(q.field('currentStatus'), 'delivered'),
          q.neq(q.field('currentStatus'), 'cancelled'),
          q.gte(q.field('sla.deadline'), Date.now()),
          q.lte(q.field('sla.deadline'), futureDate)
        )
      )
      .order('asc')
      .take(15);

    // Get upcoming invoice due dates
    const upcomingInvoices = await ctx.db
      .query('yourobcInvoices')
      .filter((q) => 
        q.and(
          q.eq(q.field('status'), 'sent'),
          q.gte(q.field('dueDate'), Date.now()),
          q.lte(q.field('dueDate'), futureDate)
        )
      )
      .order('asc')
      .take(10);

    // Combine and sort all tasks
    const allTasks = [
      ...upcomingReminders.map(r => ({
        type: 'reminder' as const,
        id: r._id,
        title: r.title,
        dueDate: r.dueDate,
        priority: r.priority,
        entityType: r.entityType,
        entityId: r.entityId,
      })),
      ...expiringQuotes.map(q => ({
        type: 'quote_expiry' as const,
        id: q._id,
        title: `Quote ${q.quoteNumber} expires`,
        dueDate: q.validUntil,
        priority: 'medium' as const,
        entityType: 'yourobc_quote' as const,
        entityId: q._id,
      })),
      ...upcomingDeadlines.map(s => ({
        type: 'shipment_deadline' as const,
        id: s._id,
        title: `Shipment ${s.shipmentNumber} deadline`,
        dueDate: s.sla.deadline,
        priority: s.priority,
        entityType: 'yourobc_shipment' as const,
        entityId: s._id,
      })),
      ...upcomingInvoices.map(i => ({
        type: 'invoice_due' as const,
        id: i._id,
        title: `Invoice ${i.invoiceNumber} due`,
        dueDate: i.dueDate,
        priority: 'medium' as const,
        entityType: 'yourobc_invoice' as const,
        entityId: i._id,
      })),
    ].sort((a, b) => a.dueDate - b.dueDate);

    return allTasks.slice(0, limit);
  },
});

export const getYourOBCPerformanceTrends = query({
  args: { 
    authUserId: v.string(),
    months: v.optional(v.number()),
  },
  handler: async (ctx, { authUserId, months = 6 }) => {
    await requireCurrentUser(ctx, authUserId);

    const trends = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthKey = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`;
      
      // Get data for this month
      const [quotes, shipments, invoices] = await Promise.all([
        ctx.db.query('yourobcQuotes').collect(),
        ctx.db.query('yourobcShipments').collect(),
        ctx.db.query('yourobcInvoices').collect(),
      ]);

      const monthQuotes = quotes.filter(q => 
        q.createdAt >= monthStart.getTime() && q.createdAt <= monthEnd.getTime()
      );
      
      const monthShipments = shipments.filter(s => 
        s.createdAt >= monthStart.getTime() && s.createdAt <= monthEnd.getTime()
      );
      
      const monthInvoices = invoices.filter(i => 
        i.type === 'outgoing' && 
        i.status === 'paid' && 
        i.paymentDate && 
        i.paymentDate >= monthStart.getTime() && 
        i.paymentDate <= monthEnd.getTime()
      );

      const deliveredThisMonth = monthShipments.filter(s => 
        s.currentStatus === 'delivered' && 
        s.completedAt && 
        s.completedAt <= s.sla.deadline
      );

      trends.push({
        month: monthKey,
        monthName: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        quotes: monthQuotes.length,
        conversions: monthQuotes.filter(q => q.status === 'accepted').length,
        shipments: monthShipments.length,
        revenue: monthInvoices.reduce((sum, i) => sum + i.totalAmount.amount, 0),
        onTimeDeliveries: deliveredThisMonth.length,
        totalDeliveries: monthShipments.filter(s => s.currentStatus === 'delivered').length,
      });
    }

    return trends;
  },
});