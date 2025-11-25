// src/features/yourobc/customers/components/CustomerAnalyticsDashboard.tsx

import { FC } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@/generated/api'
import { Card } from '@/components/ui'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Calendar,
  AlertTriangle,
  Target,
} from 'lucide-react'
import type { Id } from '@/convex/_generated/dataModel'

interface CustomerAnalyticsDashboardProps {
  customerId: Id<'yourobcCustomers'>
}

export const CustomerAnalyticsDashboard: FC<CustomerAnalyticsDashboardProps> = ({
  customerId,
}) => {
  // Fetch analytics
  const analytics = useQuery(api.lib.yourobc.customers.analytics.queries.getCustomerAnalytics, {
    customerId,
  })

  const lifetimeValue = useQuery(api.lib.yourobc.customers.analytics.queries.getCustomerLifetimeValue, {
    customerId,
  })

  const standardRoutes = useQuery(api.lib.yourobc.customers.analytics.queries.getStandardRoutes, {
    customerId,
    minOccurrences: 3,
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  const formatPercentage = (percent: number) => {
    return `${percent.toFixed(1)}%`
  }

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'Never'
    return new Intl.DateTimeFormat('de-DE', {
      dateStyle: 'medium',
    }).format(new Date(timestamp))
  }

  if (!analytics && !lifetimeValue) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </Card>
    )
  }

  if (!analytics && !lifetimeValue) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-600">No analytics data available yet</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(lifetimeValue?.lifetimeRevenue || 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Avg: {formatCurrency(lifetimeValue?.averageOrderValue || 0)} per shipment
              </p>
            </div>
            <div className="bg-blue-100 p-2 rounded-lg">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Margin</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(lifetimeValue?.lifetimeMargin || 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Avg: {formatPercentage(lifetimeValue?.averageMarginPercentage || 0)}
              </p>
            </div>
            <div className="bg-green-100 p-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Shipments</p>
              <p className="text-2xl font-bold text-gray-900">
                {lifetimeValue?.lifetimeShipments || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {lifetimeValue?.monthsActive || 0} months active
              </p>
            </div>
            <div className="bg-purple-100 p-2 rounded-lg">
              <Package className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Avg Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(lifetimeValue?.averageMonthlyRevenue || 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Lifetime value</p>
            </div>
            <div className="bg-indigo-100 p-2 rounded-lg">
              <Target className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Payment Behavior & Contact Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Payment Behavior
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Average Payment Days</span>
              <span className="font-semibold">
                {analytics?.averagePaymentDays?.toFixed(1) || 0} days
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">On-Time Payment Rate</span>
              <span
                className={`font-semibold ${
                  (analytics?.onTimePaymentRate || 0) >= 80
                    ? 'text-green-600'
                    : (analytics?.onTimePaymentRate || 0) >= 50
                      ? 'text-orange-600'
                      : 'text-red-600'
                }`}
              >
                {formatPercentage(analytics?.onTimePaymentRate || 0)}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Late Payments</span>
              <span className="font-semibold">{analytics?.latePaymentCount || 0}</span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Overdue Invoices</span>
              <span
                className={`font-semibold ${
                  (analytics?.overdueInvoiceCount || 0) > 0 ? 'text-red-600' : 'text-gray-900'
                }`}
              >
                {analytics?.overdueInvoiceCount || 0}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Contact Activity
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Total Contacts</span>
              <span className="font-semibold">{analytics?.totalContacts || 0}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Last Contact Date</span>
              <span className="font-semibold text-sm">
                {formatDate(analytics?.lastContactDate)}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Days Since Last Contact</span>
              <span
                className={`font-semibold ${
                  (analytics?.daysSinceLastContact || 0) > 35
                    ? 'text-red-600'
                    : (analytics?.daysSinceLastContact || 0) > 21
                      ? 'text-orange-600'
                      : 'text-green-600'
                }`}
              >
                {analytics?.daysSinceLastContact || 0} days
              </span>
            </div>

            {analytics?.needsFollowUpAlert && (
              <div className="bg-red-50 border border-red-200 rounded p-3 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-900">
                    Inactivity Alert
                  </p>
                  <p className="text-xs text-red-700">
                    No contact in over 35 days. Consider reaching out.
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Margin by Service Type */}
      {analytics?.marginsByService && Object.keys(analytics.marginsByService).length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Margin by Service Type</h3>

          <div className="space-y-3">
            {Object.entries(analytics.marginsByService).map(([serviceType, serviceData]) => (
              <div key={serviceType} className="border-b pb-3 last:border-0">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium capitalize">
                    {serviceType.replace('_', ' ')}
                  </span>
                  <span className="text-sm text-gray-600">
                    {serviceData.count} shipments
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Revenue</p>
                    <p className="font-semibold">{formatCurrency(serviceData.revenue)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Margin</p>
                    <p className="font-semibold text-green-600">
                      {formatCurrency(serviceData.margin)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Margin %</p>
                    <p className="font-semibold">
                      {formatPercentage(serviceData.revenue > 0 ? (serviceData.margin / serviceData.revenue) * 100 : 0)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Top Routes */}
      {standardRoutes && standardRoutes.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Standard Routes</h3>
          <p className="text-sm text-gray-600 mb-4">
            Routes used 3 or more times (consider creating route-specific margin rules)
          </p>

          <div className="space-y-3">
            {standardRoutes.map((route: any, index: number) => (
              <div key={index} className="border-b pb-3 last:border-0">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">
                    {route.origin} → {route.destination}
                  </span>
                  <span className="text-sm text-gray-600">{route.count} times</span>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Total Revenue</p>
                    <p className="font-semibold">{formatCurrency(route.totalRevenue)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Avg Margin</p>
                    <p className="font-semibold text-green-600">
                      {formatCurrency(route.averageMargin)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Avg Revenue</p>
                    <p className="font-semibold">{formatCurrency(route.averageRevenue)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
