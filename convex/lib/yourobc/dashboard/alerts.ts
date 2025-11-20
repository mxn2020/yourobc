// convex/lib/yourobc/dashboard/alerts.ts
/**
 * YourOBC Dashboard Alerts
 * Generate and manage system alerts
 */

import { query, mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';

/**
 * Get active system alerts
 */
export const getAlerts = query({
  args: {
    authUserId: v.string(),
    severityFilter: v.optional(v.string()),
    moduleFilter: v.optional(v.string()),
    includeAcknowledged: v.optional(v.boolean()),
  },
  handler: async (
    ctx,
    { authUserId, severityFilter, moduleFilter, includeAcknowledged = false }
  ) => {
    await requireCurrentUser(ctx, authUserId);

    const alerts: any[] = [];
    const now = Date.now();

    // Check for overdue shipments
    const overdueShipments = await ctx.db
      .query('yourobcShipments')
      .filter((q: any) =>
        q.and(
          q.eq(q.field('deletedAt'), undefined),
          q.neq(q.field('currentStatus'), 'delivered'),
          q.neq(q.field('currentStatus'), 'cancelled')
        )
      )
      .collect();

    const actuallyOverdue = overdueShipments.filter(
      (s) => s.sla?.deadline && s.sla.deadline < now
    );

    if (actuallyOverdue.length > 0) {
      alerts.push({
        id: 'overdue_shipments',
        type: 'overdue',
        severity: actuallyOverdue.length > 10 ? 'high' : 'medium',
        title: 'Overdue Shipments',
        message: `${actuallyOverdue.length} shipments are past their delivery deadline`,
        count: actuallyOverdue.length,
        module: 'yourobcShipments',
        action: 'View Overdue Shipments',
        actionUrl: '/yourobc/shipments?filter=overdue',
        createdAt: now,
        acknowledged: false,
      });
    }

    // Check for expiring quotes (within 48 hours)
    const expiringQuotes = await ctx.db
      .query('yourobcQuotes')
      .filter((q: any) =>
        q.and(
          q.eq(q.field('deletedAt'), undefined),
          q.eq(q.field('status'), 'sent')
        )
      )
      .collect();

    const soonExpiring = expiringQuotes.filter((q) => {
      const hoursUntilExpiry = (q.validUntil - now) / (1000 * 60 * 60);
      return hoursUntilExpiry > 0 && hoursUntilExpiry <= 48;
    });

    if (soonExpiring.length > 0) {
      alerts.push({
        id: 'expiring_quotes',
        type: 'expiring',
        severity: 'medium',
        title: 'Expiring Quotes',
        message: `${soonExpiring.length} quotes will expire within 48 hours`,
        count: soonExpiring.length,
        module: 'yourobcQuotes',
        action: 'Review Quotes',
        actionUrl: '/yourobc/quotes?filter=expiring',
        createdAt: now,
        acknowledged: false,
      });
    }

    // Check for overdue invoices
    const overdueInvoices = await ctx.db
      .query('yourobcInvoices')
      .filter((q: any) =>
        q.and(
          q.eq(q.field('deletedAt'), undefined),
          q.eq(q.field('type'), 'outgoing'),
          q.eq(q.field('status'), 'sent')
        )
      )
      .collect();

    const actuallyOverdueInvoices = overdueInvoices.filter((i) => i.dueDate < now);
    const overdueValue = actuallyOverdueInvoices.reduce(
      (sum, i) => sum + (i.totalAmount?.amount || 0),
      0
    );

    if (actuallyOverdueInvoices.length > 0) {
      const currency = actuallyOverdueInvoices[0]?.totalAmount?.currency || 'EUR';
      alerts.push({
        id: 'overdue_invoices',
        type: 'payment',
        severity: overdueValue > 100000 ? 'high' : 'medium',
        title: 'Overdue Payments',
        message: `${currency}${Math.round(overdueValue).toLocaleString()} in overdue invoice payments`,
        count: actuallyOverdueInvoices.length,
        module: 'yourobcInvoices',
        action: 'View Overdue Invoices',
        actionUrl: '/yourobc/invoices?filter=overdue',
        createdAt: now,
        acknowledged: false,
        metadata: {
          overdueValue,
          currency,
        },
      });
    }

    // Check for SLA violations (within 24 hours of deadline)
    const slaRiskShipments = overdueShipments.filter((s) => {
      if (!s.sla?.deadline) return false;
      const hoursUntilDeadline = (s.sla.deadline - now) / (1000 * 60 * 60);
      return hoursUntilDeadline > 0 && hoursUntilDeadline <= 24;
    });

    if (slaRiskShipments.length > 0) {
      alerts.push({
        id: 'sla_violations',
        type: 'sla',
        severity: slaRiskShipments.length > 5 ? 'high' : 'medium',
        title: 'SLA Risk',
        message: `${slaRiskShipments.length} shipments are approaching SLA deadline`,
        count: slaRiskShipments.length,
        module: 'yourobcShipments',
        action: 'Review Shipments',
        actionUrl: '/yourobc/shipments?filter=sla-risk',
        createdAt: now,
        acknowledged: false,
      });
    }

    // Check for critical SLA warnings (within 15 minutes)
    const criticalSlaShipments = overdueShipments.filter((s) => {
      if (!s.sla?.deadline) return false;
      const minutesUntilDeadline = (s.sla.deadline - now) / (1000 * 60);
      return minutesUntilDeadline > 0 && minutesUntilDeadline <= 15;
    });

    if (criticalSlaShipments.length > 0) {
      alerts.push({
        id: 'critical_sla_warnings',
        type: 'sla',
        severity: 'critical',
        title: 'Critical SLA Warnings',
        message: `${criticalSlaShipments.length} shipments deadline within 15 minutes!`,
        count: criticalSlaShipments.length,
        module: 'yourobcShipments',
        action: 'Urgent Action Required',
        actionUrl: '/yourobc/shipments?filter=critical-sla',
        createdAt: now,
        acknowledged: false,
      });
    }

    // TODO: Add 'expectedDate' field to yourobcInvoices schema to enable this alert
    // Check for pending invoices not received
    // const expectedInvoices = await ctx.db
    //   .query('yourobcInvoices')
    //   .filter((q: any) =>
    //     q.and(
    //       q.eq(q.field('deletedAt'), undefined),
    //       q.eq(q.field('type'), 'incoming'),
    //       q.eq(q.field('status'), 'expected')
    //     )
    //   )
    //   .collect();

    // const overdueExpectedInvoices = expectedInvoices.filter(
    //   (i) => i.expectedDate && i.expectedDate < now
    // );

    // if (overdueExpectedInvoices.length > 0) {
    //   alerts.push({
    //     id: 'missing_invoices',
    //     type: 'payment',
    //     severity: 'medium',
    //     title: 'Missing Invoices',
    //     message: `${overdueExpectedInvoices.length} expected invoices not yet received`,
    //     count: overdueExpectedInvoices.length,
    //     module: 'yourobcInvoices',
    //     action: 'Review Expected Invoices',
    //     actionUrl: '/yourobc/accounting/incoming?filter=expected',
    //     createdAt: now,
    //     acknowledged: false,
    //   });
    // }

    // TODO: Add 'lastContactDate' field to yourobcCustomers schema to enable this alert
    // Check for inactive customers (no activity in 35 days)
    // const thirtyFiveDaysAgo = now - 35 * 24 * 60 * 60 * 1000;
    // const customers = await ctx.db.query('yourobcCustomers').collect();

    // const inactiveCustomers = customers.filter((c) => {
    //   if (c.deletedAt || c.status !== 'active') return false;
    //   return c.lastContactDate && c.lastContactDate < thirtyFiveDaysAgo;
    // });

    // if (inactiveCustomers.length > 0) {
    //   alerts.push({
    //     id: 'inactive_customers',
    //     type: 'system',
    //     severity: 'low',
    //     title: 'Inactive Customers',
    //     message: `${inactiveCustomers.length} customers haven't been contacted in 35+ days`,
    //     count: inactiveCustomers.length,
    //     module: 'yourobcCustomers',
    //     action: 'Review Inactive Customers',
    //     actionUrl: '/yourobc/customers?filter=inactive',
    //     createdAt: now,
    //     acknowledged: false,
    //   });
    // }

    // Check for open quotes requiring action (older than 48 hours)
    const fortyEightHoursAgo = now - 48 * 60 * 60 * 1000;
    const openQuotes = await ctx.db
      .query('yourobcQuotes')
      .filter((q: any) =>
        q.and(
          q.eq(q.field('deletedAt'), undefined),
          q.or(q.eq(q.field('status'), 'draft'), q.eq(q.field('status'), 'sent'))
        )
      )
      .collect();

    const staleQuotes = openQuotes.filter((q) => q.createdAt < fortyEightHoursAgo);

    if (staleQuotes.length > 0) {
      alerts.push({
        id: 'stale_quotes',
        type: 'system',
        severity: 'medium',
        title: 'Stale Quotes',
        message: `${staleQuotes.length} quotes require action or closure`,
        count: staleQuotes.length,
        module: 'yourobcQuotes',
        action: 'Review Open Quotes',
        actionUrl: '/yourobc/quotes?filter=stale',
        createdAt: now,
        acknowledged: false,
      });
    }

    // Apply filters
    let filteredAlerts = alerts;

    if (severityFilter) {
      filteredAlerts = filteredAlerts.filter((a) => a.severity === severityFilter);
    }

    if (moduleFilter) {
      filteredAlerts = filteredAlerts.filter((a) => a.module === moduleFilter);
    }

    if (!includeAcknowledged) {
      filteredAlerts = filteredAlerts.filter((a) => !a.acknowledged);
    }

    // Sort by severity and timestamp
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    filteredAlerts.sort((a, b) => {
      const severityDiff =
        (severityOrder[a.severity as keyof typeof severityOrder] || 4) -
        (severityOrder[b.severity as keyof typeof severityOrder] || 4);
      if (severityDiff !== 0) return severityDiff;
      return b.createdAt - a.createdAt;
    });

    return filteredAlerts;
  },
});

// Note: Alert acknowledgment mutations have been moved to mutations.ts
// for better organization and to avoid export conflicts

/**
 * Get alert statistics
 */
export const getAlertStats = query({
  args: {
    authUserId: v.string(),
  },
  handler: async (ctx, { authUserId }) => {
    await requireCurrentUser(ctx, authUserId);

    const now = Date.now();

    // Generate all active alerts (same logic as getAlerts)
    const alerts: any[] = [];

    // Check for overdue shipments
    const overdueShipments = await ctx.db
      .query('yourobcShipments')
      .filter((q: any) =>
        q.and(
          q.eq(q.field('deletedAt'), undefined),
          q.neq(q.field('currentStatus'), 'delivered'),
          q.neq(q.field('currentStatus'), 'cancelled')
        )
      )
      .collect();

    const actuallyOverdue = overdueShipments.filter(
      (s) => s.sla?.deadline && s.sla.deadline < now
    );
    if (actuallyOverdue.length > 0) {
      alerts.push({ severity: actuallyOverdue.length > 10 ? 'high' : 'medium' });
    }

    // Check for expiring quotes
    const expiringQuotes = await ctx.db
      .query('yourobcQuotes')
      .filter((q: any) =>
        q.and(q.eq(q.field('deletedAt'), undefined), q.eq(q.field('status'), 'sent'))
      )
      .collect();
    const soonExpiring = expiringQuotes.filter((q) => {
      const hoursUntilExpiry = (q.validUntil - now) / (1000 * 60 * 60);
      return hoursUntilExpiry > 0 && hoursUntilExpiry <= 48;
    });
    if (soonExpiring.length > 0) {
      alerts.push({ severity: 'medium' });
    }

    // Check for overdue invoices
    const overdueInvoices = await ctx.db
      .query('yourobcInvoices')
      .filter((q: any) =>
        q.and(
          q.eq(q.field('deletedAt'), undefined),
          q.eq(q.field('type'), 'outgoing'),
          q.eq(q.field('status'), 'sent')
        )
      )
      .collect();
    const actuallyOverdueInvoices = overdueInvoices.filter((i) => i.dueDate < now);
    if (actuallyOverdueInvoices.length > 0) {
      const overdueValue = actuallyOverdueInvoices.reduce(
        (sum, i) => sum + (i.totalAmount?.amount || 0),
        0
      );
      alerts.push({ severity: overdueValue > 100000 ? 'high' : 'medium' });
    }

    // Check for SLA risk
    const slaRiskShipments = overdueShipments.filter((s) => {
      if (!s.sla?.deadline) return false;
      const hoursUntilDeadline = (s.sla.deadline - now) / (1000 * 60 * 60);
      return hoursUntilDeadline > 0 && hoursUntilDeadline <= 24;
    });
    if (slaRiskShipments.length > 0) {
      alerts.push({ severity: slaRiskShipments.length > 5 ? 'high' : 'medium' });
    }

    // Check for critical SLA warnings
    const criticalSlaShipments = overdueShipments.filter((s) => {
      if (!s.sla?.deadline) return false;
      const minutesUntilDeadline = (s.sla.deadline - now) / (1000 * 60);
      return minutesUntilDeadline > 0 && minutesUntilDeadline <= 15;
    });
    if (criticalSlaShipments.length > 0) {
      alerts.push({ severity: 'critical' });
    }

    // TODO: Add 'expectedDate' field to yourobcInvoices schema to enable this check
    // Check for missing invoices
    // const expectedInvoices = await ctx.db
    //   .query('yourobcInvoices')
    //   .filter((q: any) =>
    //     q.and(
    //       q.eq(q.field('deletedAt'), undefined),
    //       q.eq(q.field('type'), 'incoming'),
    //       q.eq(q.field('status'), 'expected')
    //     )
    //   )
    //   .collect();
    // const overdueExpectedInvoices = expectedInvoices.filter(
    //   (i) => i.expectedDate && i.expectedDate < now
    // );
    // if (overdueExpectedInvoices.length > 0) {
    //   alerts.push({ severity: 'medium' });
    // }

    // TODO: Add 'lastContactDate' field to yourobcCustomers schema to enable this check
    // Check for inactive customers
    // const thirtyFiveDaysAgo = now - 35 * 24 * 60 * 60 * 1000;
    // const customers = await ctx.db.query('yourobcCustomers').collect();
    // const inactiveCustomers = customers.filter((c) => {
    //   if (c.deletedAt || c.status !== 'active') return false;
    //   return c.lastContactDate && c.lastContactDate < thirtyFiveDaysAgo;
    // });
    // if (inactiveCustomers.length > 0) {
    //   alerts.push({ severity: 'low' });
    // }

    // Check for stale quotes
    const fortyEightHoursAgo = now - 48 * 60 * 60 * 1000;
    const openQuotes = await ctx.db
      .query('yourobcQuotes')
      .filter((q: any) =>
        q.and(
          q.eq(q.field('deletedAt'), undefined),
          q.or(q.eq(q.field('status'), 'draft'), q.eq(q.field('status'), 'sent'))
        )
      )
      .collect();
    const staleQuotes = openQuotes.filter((q) => q.createdAt < fortyEightHoursAgo);
    if (staleQuotes.length > 0) {
      alerts.push({ severity: 'medium' });
    }

    // Count by severity
    const critical = alerts.filter((a) => a.severity === 'critical').length;
    const high = alerts.filter((a) => a.severity === 'high').length;
    const medium = alerts.filter((a) => a.severity === 'medium').length;
    const low = alerts.filter((a) => a.severity === 'low').length;

    return {
      total: critical + high + medium + low,
      critical,
      high,
      medium,
      low,
      unacknowledged: critical + high + medium + low, // All dynamically generated alerts are unacknowledged
      acknowledged: 0, // No persistence layer for acknowledgments yet
    };
  },
});
