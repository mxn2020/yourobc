// src/features/yourobc/customers/components/CustomerStats.tsx

import { FC } from 'react'
import { Card, Badge, Loading } from '@/components/ui'
import { useCustomers } from '../hooks/useCustomers'
import { CURRENCY_SYMBOLS } from '../types'

export const CustomerStats: FC = () => {
  const { stats, isStatsLoading } = useCustomers()

  if (isStatsLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loading size="md" />
      </div>
    )
  }

  if (!stats) {
    return null
  }

  const formatCurrency = (amount: number) => {
    return `${CURRENCY_SYMBOLS.EUR}${amount.toLocaleString()}`
  }

  return (
    <div className="space-y-6 mb-8">
      {/* Row 1: 4 Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</div>
                <div className="text-sm text-gray-600">Total Customers</div>
              </div>
              <div className="text-3xl">🏢</div>
            </div>
            <div className="mt-2">
              <Badge variant="primary" size="sm">
                {stats.activeCustomers} active
              </Badge>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.newCustomersThisMonth}</div>
                <div className="text-sm text-gray-600">New This Month</div>
              </div>
              <div className="text-3xl">✨</div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {stats.inactiveCustomers} inactive
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalRevenue)}
                </div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </div>
              <div className="text-3xl">💰</div>
            </div>
            <div className="mt-2">
              <Badge variant="success" size="sm">
                All time
              </Badge>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.averagePaymentTerms}</div>
                <div className="text-sm text-gray-600">Avg Payment Terms</div>
              </div>
              <div className="text-3xl">📅</div>
            </div>
            <div className="mt-2 text-sm text-gray-600">days</div>
          </div>
        </Card>
      </div>

      {/* Row 2: 3 List Metrics + Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* List Metric 1: By Country */}
        <Card>
          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">By Country</h3>
            <div className="space-y-2">
              {Object.entries(stats.customersByCountry)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 4)
                .map(([country, count]) => (
                  <div key={country} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{country}</span>
                    <Badge variant="secondary" size="sm">
                      {count}
                    </Badge>
                  </div>
                ))}
            </div>
          </div>
        </Card>

        {/* List Metric 2: By Currency */}
        <Card>
          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">By Currency</h3>
            <div className="space-y-2">
              {Object.entries(stats.customersByCurrency)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 4)
                .map(([currency, count]) => (
                  <div key={currency} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{currency}</span>
                    <Badge variant="secondary" size="sm">
                      {count}
                    </Badge>
                  </div>
                ))}
            </div>
          </div>
        </Card>

        {/* List Metric 3: By Status */}
        <Card>
          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">By Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Active</span>
                <Badge variant="success" size="sm">
                  {stats.activeCustomers}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Inactive</span>
                <Badge variant="warning" size="sm">
                  {stats.inactiveCustomers}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Blacklisted</span>
                <Badge variant="danger" size="sm">
                  {stats.blacklistedCustomers}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Performance Summary */}
        <Card className="bg-blue-50 border-blue-200">
          <div className="p-6">
            <h3 className="text-sm font-semibold text-blue-900 mb-3">Performance Summary</h3>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-blue-700 mb-1">Growth Rate</div>
                <div className="text-lg font-bold text-blue-900">
                  {stats.newCustomersThisMonth > 0 ? '+' : ''}{stats.newCustomersThisMonth}
                </div>
              </div>
              <div>
                <div className="text-xs text-blue-700 mb-1">Active Rate</div>
                <div className="text-lg font-bold text-blue-900">
                  {stats.totalCustomers > 0
                    ? Math.round((stats.activeCustomers / stats.totalCustomers) * 100)
                    : 0}%
                </div>
              </div>
              <div>
                <div className="text-xs text-blue-700 mb-1">Avg Revenue</div>
                <div className="text-sm font-semibold text-blue-900">
                  {stats.activeCustomers > 0
                    ? formatCurrency(Math.round(stats.totalRevenue / stats.activeCustomers))
                    : formatCurrency(0)}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}