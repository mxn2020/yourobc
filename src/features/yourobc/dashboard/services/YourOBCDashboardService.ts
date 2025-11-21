// src/features/yourobc/dashboard/services/YourOBCDashboardService.ts

import { useQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/generated/api'
import type { Doc, Id } from '@/convex/_generated/dataModel'
import type {
  YourOBCOverview,
  YourOBCMetrics,
  YourOBCActivity,
  YourOBCAlert,
  YourOBCQuickAction,
  YourOBCPerformanceData,
  YourOBCTrendData,
  MetricsPeriod
} from '../types'

/**
 * YourOBC Dashboard Service
 * Aggregates data from all YourOBC modules for dashboard display
 */
export class YourOBCDashboardService {
  private convexClient: ConvexHttpClient

  constructor() {
    // Initialize Convex client for mutations
    const convexUrl = import.meta.env.VITE_CONVEX_URL || 'http://localhost:3210'
    this.convexClient = new ConvexHttpClient(convexUrl)
  }

  /**
   * Get comprehensive YourOBC overview metrics from Convex
   */
  useDashboardStats(
    authUserId: string,
    period: MetricsPeriod = 'week'
  ) {
    const dateRange = this.getDateRangeForPeriod(period)

    return useQuery({
      ...convexQuery(api.lib.yourobc.dashboard.queries.getYourOBCDashboardStats, {
        authUserId,
        dateRange,
      }),
      staleTime: 300000, // 5 minutes
      enabled: !!authUserId,
    })
  }

  /**
   * Get recent activity across all YourOBC modules
   */
  useRecentActivity(authUserId: string, limit: number = 20) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.dashboard.queries.getYourOBCRecentActivity, {
        authUserId,
        limit,
      }),
      staleTime: 120000, // 2 minutes
      enabled: !!authUserId,
    })
  }

  /**
   * Get upcoming tasks and deadlines
   */
  useUpcomingTasks(authUserId: string, days: number = 7, limit: number = 20) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.dashboard.queries.getYourOBCUpcomingTasks, {
        authUserId,
        days,
        limit,
      }),
      staleTime: 300000, // 5 minutes
      enabled: !!authUserId,
    })
  }

  /**
   * Get performance trends over time
   */
  usePerformanceTrends(authUserId: string, months: number = 6) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.dashboard.queries.getYourOBCPerformanceTrends, {
        authUserId,
        months,
      }),
      staleTime: 900000, // 15 minutes
      enabled: !!authUserId,
    })
  }

  /**
   * Acknowledge a dashboard alert
   * Marks an alert as acknowledged to prevent it from showing repeatedly
   */
  async acknowledgeAlert(authUserId: string, alertId: string): Promise<Id<'yourobcDashboardAlertAcknowledgments'>> {
    return await this.convexClient.mutation(api.lib.yourobc.dashboard.mutations.acknowledgeAlert, {
      authUserId,
      alertId,
    })
  }

  /**
   * Clear alert acknowledgment
   * Removes the acknowledgment to show the alert again
   */
  async clearAlertAcknowledgment(authUserId: string, alertId: string): Promise<boolean> {
    return await this.convexClient.mutation(api.lib.yourobc.dashboard.mutations.clearAlertAcknowledgment, {
      authUserId,
      alertId,
    })
  }

  /**
   * Clear all alert acknowledgments for the current user
   */
  async clearAllAlertAcknowledgments(authUserId: string): Promise<number> {
    return await this.convexClient.mutation(api.lib.yourobc.dashboard.mutations.clearAllAlertAcknowledgments, {
      authUserId,
    })
  }

  /**
   * Get quick actions based on user role
   */
  static getQuickActions(userRole: string = 'user'): YourOBCQuickAction[] {
    const baseActions: YourOBCQuickAction[] = [
      {
        id: 'create_customer',
        label: 'Add Customer',
        description: 'Create new customer account',
        icon: 'Building',
        href: '/yourobc/customers/new',
        color: 'blue',
        permission: 'customers.create'
      },
      {
        id: 'create_quote',
        label: 'New Quote',
        description: 'Generate customer quote',
        icon: 'FileText',
        href: '/yourobc/quotes/new',
        color: 'green',
        permission: 'quotes.create'
      },
      {
        id: 'create_shipment',
        label: 'Book Shipment',
        description: 'Schedule new shipment',
        icon: 'Package',
        href: '/yourobc/shipments/new',
        color: 'purple',
        permission: 'shipments.create'
      },
      {
        id: 'create_invoice',
        label: 'Create Invoice',
        description: 'Generate new invoice',
        icon: 'Receipt',
        href: '/yourobc/invoices/new',
        color: 'orange',
        permission: 'invoices.create'
      }
    ]

    const adminActions: YourOBCQuickAction[] = [
      {
        id: 'partner_management',
        label: 'Manage Partners',
        description: 'Partner relationships',
        icon: 'Handshake',
        href: '/yourobc/partners',
        color: 'indigo',
        permission: 'partners.manage'
      },
      {
        id: 'courier_assignment',
        label: 'Assign Couriers',
        description: 'Manage courier assignments',
        icon: 'Truck',
        href: '/yourobc/couriers',
        color: 'teal',
        permission: 'couriers.manage'
      }
    ]

    const supportActions: YourOBCQuickAction[] = [
      {
        id: 'knowledge_base',
        label: 'Knowledge Base',
        description: 'Access documentation',
        icon: 'BookOpen',
        href: '/yourobc/wiki',
        color: 'emerald',
        permission: 'wiki.access'
      },
      {
        id: 'follow_ups',
        label: 'Follow-ups',
        description: 'Manage reminders',
        icon: 'Clock',
        href: '/yourobc/supporting/reminders',
        color: 'amber',
        permission: 'reminders.manage'
      }
    ]

    // Return actions based on role
    if (userRole === 'admin') {
      return [...baseActions, ...adminActions, ...supportActions]
    } else if (userRole === 'manager') {
      return [...baseActions, ...supportActions]
    } else {
      return baseActions
    }
  }

  // Helper methods
  private getDateRangeForPeriod(period: MetricsPeriod): { from: number; to: number } {
    const now = new Date()
    const to = now.getTime()
    let from: number

    switch (period) {
      case 'today':
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
        break
      case 'week':
        from = to - 7 * 24 * 60 * 60 * 1000
        break
      case 'month':
        from = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
        break
      case 'quarter':
        from = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1).getTime()
        break
      case 'year':
        from = new Date(now.getFullYear(), 0, 1).getTime()
        break
      default:
        from = to - 7 * 24 * 60 * 60 * 1000
    }

    return { from, to }
  }
}

// Create a singleton instance to be used throughout the app
export const yourOBCDashboardService = new YourOBCDashboardService()