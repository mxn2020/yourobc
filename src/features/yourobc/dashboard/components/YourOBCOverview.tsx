// src/features/yourobc/dashboard/components/YourOBCOverview.tsx

import React from 'react'
import { 
  Building, 
  FileText, 
  Package, 
  Receipt, 
  Handshake, 
  Truck,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  DollarSign,
  Clock,
  Target,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import type { YourOBCOverview as YourOBCOverviewType, MetricsPeriod } from '../types'

interface YourOBCOverviewProps {
  data: YourOBCOverviewType | undefined
  isLoading?: boolean
  error?: Error | null
  selectedPeriod: MetricsPeriod
  onPeriodChange?: (period: MetricsPeriod) => void
}

export function YourOBCOverview({ 
  data, 
  isLoading = false, 
  error = null,
  selectedPeriod,
  onPeriodChange 
}: YourOBCOverviewProps) {
  if (error) {
    return (
      <Card>
        <CardBody className="p-6">
          <div className="text-center text-red-600">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>Failed to load overview data</p>
            <p className="text-sm text-gray-500 mt-1">{error.message}</p>
          </div>
        </CardBody>
      </Card>
    )
  }

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index}>
            <CardBody className="p-6">
              <div className="animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    )
  }

  const formatCurrency = (amount: number, currency: string = 'EUR'): string => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat().format(num)
  }

  const formatPercentage = (num: number): string => {
    return `${num.toFixed(1)}%`
  }

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-gray-400" />
  }

  const getTrendColor = (trend: number): string => {
    if (trend > 0) return 'text-green-600'
    if (trend < 0) return 'text-red-600'
    return 'text-gray-500'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">YourOBC Overview</h2>
          <p className="text-sm text-gray-500">
            Performance metrics across all YourOBC modules
          </p>
        </div>
        <div className="text-xs text-gray-400">
          Last updated: {new Date(data.lastUpdated).toLocaleTimeString()}
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Customers Card */}
        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Building className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Customers</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatNumber(data.customers.total)}
                  </p>
                </div>
              </div>
              {getTrendIcon(data.customers.growth)}
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-600">Active</span>
                </div>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {formatNumber(data.customers.active)}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">New</span>
                </div>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {formatNumber(data.customers.new)}
                </p>
              </div>
            </div>
            
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-gray-600">Growth</span>
              <span className={getTrendColor(data.customers.growth)}>
                {data.customers.growth > 0 ? '+' : ''}{formatPercentage(data.customers.growth)}
              </span>
            </div>
          </CardBody>
        </Card>

        {/* Quotes Card */}
        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Quotes</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatNumber(data.quotes.total)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Conversion</p>
                <p className="text-lg font-semibold text-green-600">
                  {formatPercentage(data.quotes.conversionRate)}
                </p>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="bg-yellow-50 p-2 rounded-lg text-center">
                <p className="text-xs font-medium text-yellow-600">Pending</p>
                <p className="text-sm font-semibold text-gray-900">{data.quotes.pending}</p>
              </div>
              <div className="bg-green-50 p-2 rounded-lg text-center">
                <p className="text-xs font-medium text-green-600">Accepted</p>
                <p className="text-sm font-semibold text-gray-900">{data.quotes.accepted}</p>
              </div>
              <div className="bg-red-50 p-2 rounded-lg text-center">
                <p className="text-xs font-medium text-red-600">Rejected</p>
                <p className="text-sm font-semibold text-gray-900">{data.quotes.rejected}</p>
              </div>
            </div>
            
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-gray-600">Total Value</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(data.quotes.totalValue)}
              </span>
            </div>
          </CardBody>
        </Card>

        {/* Shipments Card */}
        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Package className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Shipments</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatNumber(data.shipments.total)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">On Time</p>
                <p className="text-lg font-semibold text-green-600">
                  {formatPercentage(data.shipments.onTime)}
                </p>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">In Transit</span>
                </div>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {formatNumber(data.shipments.inTransit)}
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-600">Delivered</span>
                </div>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {formatNumber(data.shipments.delivered)}
                </p>
              </div>
            </div>
            
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-gray-600">Avg. Delivery Time</span>
              <span className="font-semibold text-gray-900">
                {data.shipments.averageDeliveryTime} days
              </span>
            </div>
          </CardBody>
        </Card>

        {/* Invoices Card */}
        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Receipt className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Invoices</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatNumber(data.invoices.total)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Payment Rate</p>
                <p className="text-lg font-semibold text-green-600">
                  {formatPercentage(data.invoices.paymentRate)}
                </p>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-600">Paid</span>
                </div>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {formatNumber(data.invoices.paid)}
                </p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-gray-600">Overdue</span>
                </div>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {formatNumber(data.invoices.overdue)}
                </p>
              </div>
            </div>
            
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-gray-600">Overdue Value</span>
              <span className="font-semibold text-red-600">
                {formatCurrency(data.invoices.overdueValue)}
              </span>
            </div>
          </CardBody>
        </Card>

        {/* Partners Card */}
        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <Handshake className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Partners</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatNumber(data.partners.total)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Performance</p>
                <p className="text-lg font-semibold text-indigo-600">
                  {formatPercentage(data.partners.performanceScore)}
                </p>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-600">Active</span>
                </div>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {formatNumber(data.partners.active)}
                </p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-gray-600">Top Performers</span>
                </div>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {formatNumber(data.partners.topPerformers)}
                </p>
              </div>
            </div>
            
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-gray-600">Total Revenue</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(data.partners.totalRevenue)}
              </span>
            </div>
          </CardBody>
        </Card>

        {/* Couriers Card */}
        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-teal-100 rounded-lg">
                  <Truck className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Couriers</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatNumber(data.couriers.total)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Utilization</p>
                <p className="text-lg font-semibold text-teal-600">
                  {formatPercentage(data.couriers.utilizationRate)}
                </p>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-600">Available</span>
                </div>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {formatNumber(data.couriers.available)}
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">Busy</span>
                </div>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {formatNumber(data.couriers.busy)}
                </p>
              </div>
            </div>
            
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-gray-600">Avg. Rating</span>
              <div className="flex items-center space-x-1">
                <span className="font-semibold text-gray-900">
                  {data.couriers.averageRating.toFixed(1)}
                </span>
                <div className="flex text-yellow-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={i < Math.floor(data.couriers.averageRating) ? 'text-yellow-400' : 'text-gray-300'}>
                      ★
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}