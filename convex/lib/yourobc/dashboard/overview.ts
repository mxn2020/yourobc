// convex/lib/yourobc/dashboard/overview.ts
/**
 * YourOBC Dashboard Overview Queries
 * Aggregates data from all YourOBC modules for dashboard overview
 */

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';

/**
 * Get comprehensive YourOBC overview statistics
 */
export const getOverview = query({
  args: {
    authUserId: v.string(),
    period: v.optional(
      v.union(
        v.literal('today'),
        v.literal('week'),
        v.literal('month'),
        v.literal('quarter'),
        v.literal('year')
      )
    ),
  },
  handler: async (ctx, { authUserId, period = 'week' }) => {
    await requireCurrentUser(ctx, authUserId);

    const now = Date.now();
    const startDate = getStartDateForPeriod(period, now);

    // Parallel queries for better performance
    const [
      customersData,
      quotesData,
      shipmentsData,
      invoicesData,
      partnersData,
      couriersData,
    ] = await Promise.all([
      getCustomersStats(ctx, startDate, now),
      getQuotesStats(ctx, startDate, now),
      getShipmentsStats(ctx, startDate, now),
      getInvoicesStats(ctx, startDate, now),
      getPartnersStats(ctx, startDate, now),
      getCouriersStats(ctx, startDate, now),
    ]);

    return {
      customers: customersData,
      quotes: quotesData,
      shipments: shipmentsData,
      invoices: invoicesData,
      partners: partnersData,
      couriers: couriersData,
      period,
      lastUpdated: now,
    };
  },
});

// Helper function to calculate period start date
function getStartDateForPeriod(period: string, endDate: number): number {
  const date = new Date(endDate);

  switch (period) {
    case 'today':
      date.setHours(0, 0, 0, 0);
      break;
    case 'week':
      date.setDate(date.getDate() - 7);
      break;
    case 'month':
      date.setMonth(date.getMonth() - 1);
      break;
    case 'quarter':
      date.setMonth(date.getMonth() - 3);
      break;
    case 'year':
      date.setFullYear(date.getFullYear() - 1);
      break;
  }

  return date.getTime();
}

// Customer statistics
async function getCustomersStats(
  ctx: any,
  startDate: number,
  endDate: number
) {
  const allCustomers = await ctx.db
    .query('yourobcCustomers')
    .filter((q: any) => q.eq(q.field('deletedAt'), undefined))
    .collect();

  const newCustomers = allCustomers.filter(
    (c: any) => c.createdAt >= startDate && c.createdAt <= endDate
  );

  const activeCustomers = allCustomers.filter((c: any) => c.status === 'active');

  const previousPeriodStart = startDate - (endDate - startDate);
  const previousNewCustomers = allCustomers.filter(
    (c: any) => c.createdAt >= previousPeriodStart && c.createdAt < startDate
  );

  const growth =
    previousNewCustomers.length > 0
      ? ((newCustomers.length - previousNewCustomers.length) /
          previousNewCustomers.length) *
        100
      : 0;

  return {
    total: allCustomers.length,
    active: activeCustomers.length,
    new: newCustomers.length,
    inactive: allCustomers.filter((c: any) => c.status === 'inactive').length,
    blacklisted: allCustomers.filter((c: any) => c.status === 'blacklisted')
      .length,
    growth: Math.round(growth * 10) / 10,
  };
}

// Quote statistics
async function getQuotesStats(ctx: any, startDate: number, endDate: number) {
  const allQuotes = await ctx.db
    .query('yourobcQuotes')
    .filter((q: any) => q.eq(q.field('deletedAt'), undefined))
    .collect();

  const periodQuotes = allQuotes.filter(
    (q: any) => q.createdAt >= startDate && q.createdAt <= endDate
  );

  const acceptedQuotes = periodQuotes.filter((q: any) => q.status === 'accepted');
  const totalValue = periodQuotes.reduce(
    (sum: number, q: any) => sum + (q.totalPrice?.amount || 0),
    0
  );

  const conversionRate =
    periodQuotes.length > 0 ? (acceptedQuotes.length / periodQuotes.length) * 100 : 0;

  return {
    total: periodQuotes.length,
    pending: periodQuotes.filter((q: any) => q.status === 'sent').length,
    accepted: acceptedQuotes.length,
    rejected: periodQuotes.filter((q: any) => q.status === 'rejected').length,
    expired: periodQuotes.filter((q: any) => q.status === 'expired').length,
    totalValue,
    averageValue: periodQuotes.length > 0 ? totalValue / periodQuotes.length : 0,
    conversionRate: Math.round(conversionRate * 10) / 10,
  };
}

// Shipment statistics
async function getShipmentsStats(
  ctx: any,
  startDate: number,
  endDate: number
) {
  const allShipments = await ctx.db
    .query('yourobcShipments')
    .filter((q: any) => q.eq(q.field('deletedAt'), undefined))
    .collect();

  const periodShipments = allShipments.filter(
    (s: any) => s.createdAt >= startDate && s.createdAt <= endDate
  );

  const deliveredShipments = periodShipments.filter(
    (s: any) => s.currentStatus === 'delivered'
  );

  // Calculate on-time delivery
  const onTimeDeliveries = deliveredShipments.filter((s: any) =>
    s.completedAt && s.sla?.deadline ? s.completedAt <= s.sla.deadline : false
  );

  const onTimePercentage =
    deliveredShipments.length > 0
      ? (onTimeDeliveries.length / deliveredShipments.length) * 100
      : 0;

  // Calculate average delivery time
  const deliveryTimes = deliveredShipments
    .filter((s: any) => s.completedAt && s.createdAt)
    .map((s: any) => (s.completedAt - s.createdAt) / (1000 * 60 * 60 * 24)); // days

  const avgDeliveryTime =
    deliveryTimes.length > 0
      ? deliveryTimes.reduce((sum: number, time: number) => sum + time, 0) /
        deliveryTimes.length
      : 0;

  return {
    total: periodShipments.length,
    quoted: periodShipments.filter((s: any) => s.currentStatus === 'quoted')
      .length,
    booked: periodShipments.filter((s: any) => s.currentStatus === 'booked')
      .length,
    inTransit: periodShipments.filter(
      (s: any) => s.currentStatus === 'in_transit'
    ).length,
    delivered: deliveredShipments.length,
    cancelled: periodShipments.filter((s: any) => s.currentStatus === 'cancelled')
      .length,
    onTime: Math.round(onTimePercentage * 10) / 10,
    averageDeliveryTime: Math.round(avgDeliveryTime * 10) / 10,
  };
}

// Invoice statistics
async function getInvoicesStats(ctx: any, startDate: number, endDate: number) {
  const allInvoices = await ctx.db
    .query('yourobcInvoices')
    .filter((q: any) => q.eq(q.field('deletedAt'), undefined))
    .collect();

  const periodInvoices = allInvoices.filter(
    (i: any) => i.createdAt >= startDate && i.createdAt <= endDate
  );

  const totalValue = periodInvoices.reduce(
    (sum: number, i: any) => sum + (i.totalAmount?.amount || 0),
    0
  );

  const paidInvoices = periodInvoices.filter((i: any) => i.status === 'paid');
  const paidValue = paidInvoices.reduce(
    (sum: number, i: any) => sum + (i.totalAmount?.amount || 0),
    0
  );

  const overdueInvoices = periodInvoices.filter(
    (i: any) => i.status === 'sent' && i.dueDate < Date.now()
  );

  const overdueValue = overdueInvoices.reduce(
    (sum: number, i: any) => sum + (i.totalAmount?.amount || 0),
    0
  );

  const paymentRate =
    periodInvoices.length > 0
      ? (paidInvoices.length / periodInvoices.length) * 100
      : 0;

  return {
    total: periodInvoices.length,
    draft: periodInvoices.filter((i: any) => i.status === 'draft').length,
    sent: periodInvoices.filter((i: any) => i.status === 'sent').length,
    paid: paidInvoices.length,
    overdue: overdueInvoices.length,
    cancelled: periodInvoices.filter((i: any) => i.status === 'cancelled').length,
    totalValue,
    paidValue,
    overdueValue,
    paymentRate: Math.round(paymentRate * 10) / 10,
  };
}

// Partner statistics
async function getPartnersStats(ctx: any, startDate: number, endDate: number) {
  const allPartners = await ctx.db
    .query('yourobcPartners')
    .filter((q: any) => q.eq(q.field('deletedAt'), undefined))
    .collect();

  const activePartners = allPartners.filter((p: any) => p.status === 'active');

  // Calculate performance score (simplified - can be enhanced)
  const partnerShipments = await ctx.db
    .query('yourobcShipments')
    .filter((q: any) => q.eq(q.field('deletedAt'), undefined))
    .collect();

  const successfulShipments = partnerShipments.filter(
    (s: any) =>
      s.currentStatus === 'delivered' &&
      s.completedAt &&
      s.sla?.deadline &&
      s.completedAt <= s.sla.deadline
  );

  const performanceScore =
    partnerShipments.length > 0
      ? (successfulShipments.length / partnerShipments.length) * 100
      : 0;

  return {
    total: allPartners.length,
    active: activePartners.length,
    inactive: allPartners.filter((p: any) => p.status === 'inactive').length,
    suspended: allPartners.filter((p: any) => p.status === 'suspended').length,
    performanceScore: Math.round(performanceScore * 10) / 10,
  };
}

// Courier statistics
async function getCouriersStats(ctx: any, startDate: number, endDate: number) {
  const allCouriers = await ctx.db
    .query('yourobcCouriers')
    .filter((q: any) => q.eq(q.field('deletedAt'), undefined))
    .collect();

  const availableCouriers = allCouriers.filter(
    (c: any) => c.status === 'available' && c.isActive
  );

  const busyCouriers = allCouriers.filter(
    (c: any) => c.status === 'busy' && c.isActive
  );

  const utilizationRate =
    allCouriers.length > 0 ? (busyCouriers.length / allCouriers.length) * 100 : 0;

  // Calculate average rating from courier ratings if available
  const couriersWithRating = allCouriers.filter((c: any) => c.rating);
  const avgRating =
    couriersWithRating.length > 0
      ? couriersWithRating.reduce((sum: number, c: any) => sum + (c.rating || 0), 0) /
        couriersWithRating.length
      : 0;

  return {
    total: allCouriers.length,
    available: availableCouriers.length,
    busy: busyCouriers.length,
    offline: allCouriers.filter((c: any) => !c.isOnline).length,
    utilizationRate: Math.round(utilizationRate * 10) / 10,
    averageRating: Math.round(avgRating * 10) / 10,
  };
}
